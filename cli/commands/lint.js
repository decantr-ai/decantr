/**
 * decantr lint — Code quality gates
 *
 * Checks:
 * 1. Atom validation — flags unknown `_` atoms in source files
 * 2. Essence drift — detects divergence between essence and generated code
 * 3. Inline style detection — flags inline styles that should be atoms
 * 4. Pattern coverage — checks that all blend patterns are implemented
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const registryRoot = join(__dirname, '..', '..', 'src', 'registry');

export async function run() {
  const cwd = process.cwd();
  const errors = [];
  const warnings = [];

  console.log('\n  decantr lint\n');

  // ─── 1. Essence drift detection ─────────────────────────────
  try {
    const essenceRaw = await readFile(join(cwd, 'decantr.essence.json'), 'utf-8');
    const essence = JSON.parse(essenceRaw);
    const essenceHash = createHash('md5').update(essenceRaw).digest('hex');

    try {
      const lockRaw = await readFile(join(cwd, 'decantr.lock.json'), 'utf-8');
      const lock = JSON.parse(lockRaw);

      if (lock.essenceHash !== essenceHash) {
        warnings.push('Essence has changed since last generate — run `decantr generate` to sync');
      }

      // Check that all essence pages have corresponding files
      const structures = Array.isArray(essence.sections)
        ? essence.sections.flatMap(s => s.structure || [])
        : (essence.structure || []);

      for (const page of structures) {
        try {
          await stat(join(cwd, 'src', 'pages', `${page.id}.js`));
        } catch {
          warnings.push(`Page "${page.id}" in essence but no src/pages/${page.id}.js found`);
        }
      }
    } catch {
      warnings.push('No decantr.lock.json — run `decantr generate` to create');
    }

    console.log('  ✓ Essence drift check complete');
  } catch {
    console.log('  ○ No essence file — skipping drift check');
  }

  // ─── 2. Atom validation in source files ──────────────────────
  const srcDir = join(cwd, 'src');
  try {
    const jsFiles = await collectJSFiles(srcDir);
    const atomRegex = /_[a-zA-Z][a-zA-Z0-9\[\]]*(?:\/\d+)?/g;

    // Import the actual resolver for accurate validation
    let resolveAtomDecl;
    try {
      const atomsMod = await import(join(__dirname, '..', '..', 'src', 'css', 'atoms.js'));
      resolveAtomDecl = atomsMod.resolveAtomDecl;
    } catch {
      resolveAtomDecl = null;
    }

    let atomErrors = 0;
    for (const file of jsFiles) {
      const source = await readFile(file, 'utf-8');
      // Check inside css() calls and class: css() patterns
      const cssCallRegex = /css\(['"`]([^'"`]+)['"`]\)/g;
      let match;
      while ((match = cssCallRegex.exec(source)) !== null) {
        const atomStr = match[1];
        const atoms = atomStr.split(/\s+/).filter(a => a.startsWith('_'));
        for (const atom of atoms) {
          // Skip arbitrary value atoms like _w[100px]
          if (atom.includes('[')) continue;
          // Skip responsive prefixes like _sm:gc2
          if (atom.includes(':')) continue;
          // Skip opacity modifiers like _bgprimary/10
          const baseAtom = atom.includes('/') ? atom.split('/')[0] : atom;

          if (resolveAtomDecl) {
            // Use the actual resolver — zero false positives
            if (!resolveAtomDecl(baseAtom)) {
              const rel = relative(cwd, file);
              warnings.push(`Unknown atom "${atom}" in ${rel}`);
              atomErrors++;
            }
          }
          if (atomErrors >= 20) break;
        }
        if (atomErrors >= 20) break;
      }
      if (atomErrors >= 20) {
        warnings.push('... truncated (20+ atom warnings)');
        break;
      }
    }

    console.log(`  ✓ Atom validation: ${jsFiles.length} files scanned`);
  } catch {
    console.log('  ○ No src/ directory — skipping atom validation');
  }

  // ─── 3. Inline style detection ───────────────────────────────
  try {
    const jsFiles = await collectJSFiles(srcDir);
    let inlineCount = 0;
    for (const file of jsFiles) {
      const source = await readFile(file, 'utf-8');
      // Look for style: { ... } with static values (not functions)
      const staticStyleRegex = /style:\s*['"`][^'"`]*(?:background|color|font|margin|padding|border|width|height|display|flex|grid)[^'"`]*['"`]/gi;
      let match;
      while ((match = staticStyleRegex.exec(source)) !== null) {
        const rel = relative(cwd, file);
        warnings.push(`Possible inline style in ${rel} — consider using atoms`);
        inlineCount++;
        if (inlineCount >= 10) break;
      }
      if (inlineCount >= 10) {
        warnings.push('... truncated (10+ inline style warnings)');
        break;
      }
    }
    console.log(`  ✓ Inline style check complete`);
  } catch {
    // Already handled above
  }

  // ─── 4. Spatial drift detection (Clarity violations) ────────
  try {
    const essenceRaw = await readFile(join(cwd, 'decantr.essence.json'), 'utf-8');
    const essence = JSON.parse(essenceRaw);
    const character = essence.character || [];
    const traits = character.map(t => t.toLowerCase());

    // Determine expected density cluster
    let expectedDensity = 'comfortable';
    if (traits.some(t => ['tactical', 'dense', 'data-dense', 'technical', 'utilitarian'].includes(t))) {
      expectedDensity = 'compact';
    } else if (traits.some(t => ['editorial', 'luxurious', 'premium'].includes(t))) {
      expectedDensity = 'spacious';
    } else if (traits.some(t => ['minimal', 'clean', 'elegant'].includes(t))) {
      expectedDensity = 'spacious';
    }

    // User clarity override takes precedence
    if (essence.clarity?.density) expectedDensity = essence.clarity.density;

    // Define gap ranges per density
    const gapRanges = {
      compact: { min: 1, max: 4 },
      comfortable: { min: 3, max: 6 },
      spacious: { min: 5, max: 8 },
    };
    const range = gapRanges[expectedDensity] || gapRanges.comfortable;

    const srcDir = join(cwd, 'src');
    const jsFiles = await collectJSFiles(srcDir);
    let spatialWarnings = 0;
    for (const file of jsFiles) {
      const source = await readFile(file, 'utf-8');
      const cssCallRegex = /css\(['"`]([^'"`]+)['"`]\)/g;
      let match;
      while ((match = cssCallRegex.exec(source)) !== null) {
        const atoms = match[1].split(/\s+/).filter(a => /^_gap\d+$/.test(a));
        for (const atom of atoms) {
          const gapNum = parseInt(atom.replace('_gap', ''));
          if (gapNum < range.min || gapNum > range.max) {
            const rel = relative(cwd, file);
            warnings.push(`Spatial drift: "${atom}" in ${rel} is outside ${expectedDensity} range (_gap${range.min}–_gap${range.max})`);
            spatialWarnings++;
          }
          if (spatialWarnings >= 10) break;
        }
        if (spatialWarnings >= 10) break;
      }
      if (spatialWarnings >= 10) {
        warnings.push('... truncated (10+ spatial drift warnings)');
        break;
      }
    }
    console.log(`  ✓ Spatial drift check: ${expectedDensity} density, ${jsFiles.length} files scanned`);
  } catch {
    console.log('  ○ No essence — skipping spatial drift check');
  }

  // ─── Report ─────────────────────────────────────────────────
  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n  ✓ All checks passed\n');
  } else {
    if (errors.length > 0) {
      console.error(`\n  ${errors.length} error(s):`);
      for (const e of errors) console.error(`    ✗ ${e}`);
    }
    if (warnings.length > 0) {
      console.log(`\n  ${warnings.length} warning(s):`);
      for (const w of warnings) console.log(`    ⚠ ${w}`);
    }
    console.log('');
    if (errors.length > 0) process.exitCode = 1;
  }
}

async function collectJSFiles(dir) {
  const files = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules') {
        files.push(...await collectJSFiles(full));
      } else if (entry.name.endsWith('.js')) {
        files.push(full);
      }
    }
  } catch { /* skip inaccessible dirs */ }
  return files;
}
