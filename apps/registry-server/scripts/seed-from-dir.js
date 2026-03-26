import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { computeChecksum } from '../src/services/checksum.js';

/**
 * Seed content from a local Decantr project directory into the registry DB.
 *
 * Scans:
 *   <dir>/src/patterns/*.json          → type: 'pattern'
 *   <dir>/src/registry-content/recipes/recipe-*.json → type: 'recipe'
 *   <dir>/src/registry-content/archetypes/*.json     → type: 'archetype'
 *   <dir>/src/registry-content/styles/*.js           → type: 'style'
 */
export function seedFromDirectory(db, dir, systemUserId) {
  let imported = 0;

  const insertContent = db.prepare(`
    INSERT OR IGNORE INTO content (type, content_id, name, description, tags, ai_summary, latest_version, author_id, metadata, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `);

  const insertVersion = db.prepare(`
    INSERT OR IGNORE INTO content_versions (content_id, version, artifact, checksum, size, published_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const findContent = db.prepare('SELECT id FROM content WHERE type = ? AND content_id = ?');

  function seedFile(type, filePath) {
    const raw = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.id || !data.name) return;

    const tags = JSON.stringify(data.tags || []);
    const version = data.version || '1.0.0';
    const metadata = JSON.stringify(data.metadata || {});

    insertContent.run(type, data.id, data.name, data.description || '', tags, `Local ${type}: ${data.name}`, version, systemUserId, metadata);

    const content = findContent.get(type, data.id);
    if (content) {
      const checksum = computeChecksum(raw);
      insertVersion.run(content.id, version, raw, checksum, Buffer.byteLength(raw), systemUserId);
      imported++;
    }
  }

  // Scan patterns
  const patternsDir = join(dir, 'src/patterns');
  if (existsSync(patternsDir)) {
    for (const f of readdirSync(patternsDir).filter(f => f.endsWith('.json') && f !== 'index.json')) {
      seedFile('pattern', join(patternsDir, f));
    }
  }

  // Scan recipes
  const recipesDir = join(dir, 'src/registry-content/recipes');
  if (existsSync(recipesDir)) {
    for (const f of readdirSync(recipesDir).filter(f => f.startsWith('recipe-') && f.endsWith('.json'))) {
      seedFile('recipe', join(recipesDir, f));
    }
  }

  // Scan archetypes
  const archetypesDir = join(dir, 'src/registry-content/archetypes');
  if (existsSync(archetypesDir)) {
    for (const f of readdirSync(archetypesDir).filter(f => f.endsWith('.json') && f !== 'index.json')) {
      seedFile('archetype', join(archetypesDir, f));
    }
  }

  // Scan vignettes
  const vignettesDir = join(dir, 'src/registry-content/vignettes');
  if (existsSync(vignettesDir)) {
    for (const f of readdirSync(vignettesDir).filter(f => f.endsWith('.json') && f !== 'index.json')) {
      seedFile('vignette', join(vignettesDir, f));
    }
  }

  // Scan styles — parse JS files with regex (sync-safe, no dynamic import needed)
  const stylesDir = join(dir, 'src/registry-content/styles');
  if (existsSync(stylesDir)) {
    for (const f of readdirSync(stylesDir).filter(f => f.endsWith('.js') && f !== 'index.js')) {
      const raw = readFileSync(join(stylesDir, f), 'utf-8');
      const idMatch = raw.match(/id:\s*['"]([^'"]+)['"]/);
      const nameMatch = raw.match(/name:\s*['"]([^'"]+)['"]/);
      if (!idMatch || !nameMatch) continue;

      const id = idMatch[1];
      const name = nameMatch[1];

      const descMatch = raw.match(/description:\s*['"]([^'"]+)['"]/);
      const description = descMatch ? descMatch[1] : '';

      insertContent.run('style', id, name, description, '[]', `Local style: ${name}`, '1.0.0', systemUserId, '{}');

      const content = findContent.get('style', id);
      if (content) {
        const checksum = computeChecksum(raw);
        insertVersion.run(content.id, '1.0.0', raw, checksum, Buffer.byteLength(raw), systemUserId);
        imported++;
      }
    }
  }

  return imported;
}
