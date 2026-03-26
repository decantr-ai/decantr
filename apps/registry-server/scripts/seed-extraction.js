#!/usr/bin/env node

/**
 * Seed registry database with FULL content artifacts from src/registry/.
 *
 * Unlike import-builtins.js (metadata only), this script reads each
 * extractable file and stores the complete artifact (JSON/JS source)
 * so the registry server can serve content being removed from the core package.
 *
 * Run: node scripts/seed-extraction.js
 */

import { initDb, getDb, closeDb } from '../src/db/index.js';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..', '..');

// Support --source flag to read from an alternate directory (e.g. test fixtures after extraction)
const sourceArg = process.argv.find(a => a.startsWith('--source='));
const sourceRoot = sourceArg ? sourceArg.split('=')[1] : projectRoot;

const REGISTRY_DIR = join(sourceRoot, 'src', 'registry');
const STYLES_COMMUNITY_DIR = join(sourceRoot, 'src', 'css', 'styles', 'community');
const STYLES_ADDONS_DIR = join(sourceRoot, 'src', 'css', 'styles', 'addons');

// Also check test fixtures as fallback sources
const FIXTURES_REGISTRY = join(projectRoot, 'test', 'fixtures', 'registry');
const FIXTURES_STYLES = join(projectRoot, 'test', 'fixtures', 'styles');

// ── Helpers ──────────────────────────────────────────────────────

function sha256(content) {
  return 'sha256:' + createHash('sha256').update(content, 'utf-8').digest('hex');
}

function readJsonFile(filePath) {
  const raw = readFileSync(filePath, 'utf-8');
  return { raw, parsed: JSON.parse(raw) };
}

function readRawFile(filePath) {
  return readFileSync(filePath, 'utf-8');
}

/**
 * Extract style id from JS source via regex.
 * Style files export an object with an `id` field.
 */
function extractStyleId(source) {
  const match = source.match(/id:\s*['"]([^'"]+)['"]/);
  return match ? match[1] : null;
}

/**
 * Extract style name from JS source.
 */
function extractStyleName(source) {
  const match = source.match(/name:\s*['"]([^'"]+)['"]/);
  return match ? match[1] : null;
}

/**
 * Extract a short description from the JSDoc comment at the top of a style file.
 */
function extractStyleDescription(source) {
  const match = source.match(/\/\*\*\s*\n\s*\*\s*(.+?)(?:\s*—|\s*\.\s*|\n)/);
  return match ? match[1].replace(/\s+/g, ' ').trim() : '';
}

/**
 * Derive tags from a style name/id.
 */
function deriveStyleTags(id, source) {
  const tags = [id];
  // Check for common keywords in source comments
  const keywords = ['dark', 'light', 'glass', 'gradient', 'glow', 'bold', 'minimal', 'modern', 'retro', 'vintage'];
  const lowerSource = source.toLowerCase();
  for (const kw of keywords) {
    if (lowerSource.includes(kw) && !tags.includes(kw)) {
      tags.push(kw);
    }
  }
  return tags.slice(0, 5); // Cap at 5 tags
}

// ── Database setup ───────────────────────────────────────────────

initDb();
const db = getDb();

// Create or find system user
const systemUser = db.prepare('SELECT id FROM users WHERE github_id = ?').get('0');
let systemUserId;
if (systemUser) {
  systemUserId = systemUser.id;
} else {
  const result = db.prepare(
    "INSERT INTO users (github_id, login, email, role) VALUES ('0', 'decantr', 'team@decantr.dev', 'admin')"
  ).run();
  systemUserId = result.lastInsertRowid;
}

// ── Prepared statements ──────────────────────────────────────────

const findContent = db.prepare('SELECT id FROM content WHERE type = ? AND content_id = ?');

const insertContent = db.prepare(`
  INSERT INTO content (type, content_id, name, description, tags, ai_summary, latest_version, author_id, metadata, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
`);

const findVersion = db.prepare('SELECT id FROM content_versions WHERE content_id = ? AND version = ?');

const insertVersion = db.prepare(`
  INSERT INTO content_versions (content_id, version, artifact, checksum, size, published_by)
  VALUES (?, ?, ?, ?, ?, ?)
`);

// ── Counters ─────────────────────────────────────────────────────

const counts = { pattern: 0, archetype: 0, recipe: 0, style: 0 };

// ── Seed function ────────────────────────────────────────────────

function seedWithArtifact(type, contentId, name, description, tags, version, artifact, metadata = {}) {
  const checksum = sha256(artifact);
  const size = Buffer.byteLength(artifact, 'utf-8');
  const aiSummary = `Built-in ${type}: ${name}`;

  // Upsert content row
  let existing = findContent.get(type, contentId);
  let rowId;

  if (existing) {
    rowId = existing.id;
    // Update latest_version if needed
    db.prepare('UPDATE content SET latest_version = ? WHERE id = ? AND latest_version < ?')
      .run(version, rowId, version);
  } else {
    const result = insertContent.run(
      type, contentId, name, description,
      JSON.stringify(tags), aiSummary,
      version, systemUserId,
      JSON.stringify(metadata)
    );
    rowId = result.lastInsertRowid;
  }

  // Insert version with artifact (skip if already exists)
  const existingVersion = findVersion.get(rowId, version);
  if (!existingVersion) {
    insertVersion.run(rowId, version, artifact, checksum, size, systemUserId);
    counts[type]++;
  }
}

// ── Helpers: directory with fallback ─────────────────────────────

function listJsonFiles(dir, exclude) {
  try {
    return readdirSync(dir).filter(f => f.endsWith('.json') && !exclude.has(f)).sort();
  } catch { return []; }
}

function listJsFiles(dir) {
  try {
    return readdirSync(dir).filter(f => f.endsWith('.js')).sort();
  } catch { return []; }
}

// ── Patterns ─────────────────────────────────────────────────────

const PATTERN_EXCLUDE = new Set(['hero.json', 'index.json']);

let patternsDir = join(REGISTRY_DIR, 'patterns');
let patternFiles = listJsonFiles(patternsDir, PATTERN_EXCLUDE);

// Fallback to test fixtures if primary source is empty
if (patternFiles.length === 0) {
  const fixtureDir = join(FIXTURES_REGISTRY, 'patterns');
  patternFiles = listJsonFiles(fixtureDir, PATTERN_EXCLUDE);
  if (patternFiles.length > 0) {
    patternsDir = fixtureDir;
    console.log('  (using test fixtures as source for patterns)');
  }
}

console.log(`Found ${patternFiles.length} patterns to seed...`);

for (const file of patternFiles) {
  const filePath = join(patternsDir, file);
  const { raw, parsed } = readJsonFile(filePath);

  const id = parsed.id || basename(file, '.json');
  const name = parsed.name || id;
  const description = parsed.description || '';
  const tags = parsed.tags || [id];
  const version = parsed.version || '1.0.0';

  seedWithArtifact('pattern', id, name, description, tags, version, raw);
}

// ── Archetypes ───────────────────────────────────────────────────

const ARCHETYPE_EXCLUDE = new Set(['index.json']);

let archetypesDir = join(REGISTRY_DIR, 'archetypes');
let archetypeFiles = listJsonFiles(archetypesDir, ARCHETYPE_EXCLUDE);

if (archetypeFiles.length === 0) {
  const fixtureDir = join(FIXTURES_REGISTRY, 'archetypes');
  archetypeFiles = listJsonFiles(fixtureDir, ARCHETYPE_EXCLUDE);
  if (archetypeFiles.length > 0) {
    archetypesDir = fixtureDir;
    console.log('  (using test fixtures as source for archetypes)');
  }
}

console.log(`Found ${archetypeFiles.length} archetypes to seed...`);

for (const file of archetypeFiles) {
  const filePath = join(archetypesDir, file);
  const { raw, parsed } = readJsonFile(filePath);

  const id = parsed.id || basename(file, '.json');
  const name = parsed.name || id;
  const description = parsed.description || '';
  const tags = parsed.tags || [id];
  const version = parsed.version || '1.0.0';

  seedWithArtifact('archetype', id, name, description, tags, version, raw);
}

// ── Recipes ──────────────────────────────────────────────────────

const RECIPE_EXCLUDE = new Set(['recipe-auradecantism.json']);

let recipesDir = REGISTRY_DIR;
let recipeFiles = listJsonFiles(REGISTRY_DIR, new Set()).filter(f => f.startsWith('recipe-') && !RECIPE_EXCLUDE.has(f));

if (recipeFiles.length === 0) {
  const fixtureDir = join(FIXTURES_REGISTRY, 'recipes');
  recipeFiles = listJsonFiles(fixtureDir, new Set()).filter(f => f.startsWith('recipe-') && !RECIPE_EXCLUDE.has(f));
  if (recipeFiles.length > 0) {
    recipesDir = fixtureDir;
    console.log('  (using test fixtures as source for recipes)');
  }
}

console.log(`Found ${recipeFiles.length} recipes to seed...`);

for (const file of recipeFiles) {
  const filePath = join(recipesDir, file);
  const { raw, parsed } = readJsonFile(filePath);

  // Extract id from filename: recipe-{id}.json
  const id = parsed.id || file.replace(/^recipe-/, '').replace(/\.json$/, '');
  const name = parsed.name || id;
  const description = parsed.description || '';
  const tags = parsed.tags || [id];
  const version = parsed.version || '1.0.0';

  seedWithArtifact('recipe', id, name, description, tags, version, raw, { style: parsed.style || '' });
}

// ── Community styles ─────────────────────────────────────────────

function seedStyleFiles(dir, label) {
  let files;
  try {
    files = readdirSync(dir).filter(f => f.endsWith('.js')).sort();
  } catch {
    console.log(`  Skipping ${label} — directory not found`);
    return;
  }

  console.log(`Found ${files.length} ${label} styles to seed...`);

  for (const file of files) {
    const filePath = join(dir, file);
    const source = readRawFile(filePath);

    const id = extractStyleId(source);
    if (!id) {
      console.warn(`  SKIP ${file}: could not extract style id`);
      continue;
    }

    const name = extractStyleName(source) || id;
    const description = extractStyleDescription(source);
    const tags = deriveStyleTags(id, source);
    const version = '1.0.0';

    seedWithArtifact('style', id, name, description, tags, version, source);
  }
}

// Try primary source, fall back to test fixtures
let communityDir = STYLES_COMMUNITY_DIR;
if (listJsFiles(communityDir).length === 0) {
  const fixtureDir = join(FIXTURES_STYLES, 'community');
  if (listJsFiles(fixtureDir).length > 0) {
    communityDir = fixtureDir;
    console.log('  (using test fixtures as source for community styles)');
  }
}
seedStyleFiles(communityDir, 'community');

let addonsDir = STYLES_ADDONS_DIR;
if (listJsFiles(addonsDir).length === 0) {
  const fixtureDir = join(FIXTURES_STYLES, 'addons');
  if (listJsFiles(fixtureDir).length > 0) {
    addonsDir = fixtureDir;
    console.log('  (using test fixtures as source for add-on styles)');
  }
}
seedStyleFiles(addonsDir, 'add-on');

// ── Summary ──────────────────────────────────────────────────────

const total = Object.values(counts).reduce((a, b) => a + b, 0);
console.log('\n--- Seed Summary ---');
console.log(`  Patterns:   ${counts.pattern}`);
console.log(`  Archetypes: ${counts.archetype}`);
console.log(`  Recipes:    ${counts.recipe}`);
console.log(`  Styles:     ${counts.style}`);
console.log(`  Total:      ${total} content versions seeded.`);

closeDb();
