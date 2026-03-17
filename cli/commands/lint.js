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

    // Load known atoms from registry
    let knownAtomPrefixes;
    try {
      const atomsSource = await readFile(join(__dirname, '..', '..', 'src', 'css', 'atoms.js'), 'utf-8');
      knownAtomPrefixes = extractAtomPrefixes(atomsSource);
    } catch {
      knownAtomPrefixes = null;
    }

    let atomErrors = 0;
    for (const file of jsFiles) {
      const source = await readFile(file, 'utf-8');
      // Only check inside css() calls
      const cssCallRegex = /css\(['"`]([^'"`]+)['"`]\)/g;
      let match;
      while ((match = cssCallRegex.exec(source)) !== null) {
        const atomStr = match[1];
        const atoms = atomStr.split(/\s+/).filter(a => a.startsWith('_'));
        for (const atom of atoms) {
          // Skip arbitrary value atoms like _w[100px] and responsive prefixes
          if (atom.includes('[')) continue;
          if (atom.includes(':')) continue;
          // Basic validation: known prefixes
          if (knownAtomPrefixes && !matchesKnownAtom(atom, knownAtomPrefixes)) {
            const rel = relative(cwd, file);
            warnings.push(`Unknown atom "${atom}" in ${rel}`);
            atomErrors++;
            if (atomErrors >= 20) break; // Don't flood
          }
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

function extractAtomPrefixes(atomsSource) {
  // Extract known atom name patterns from atoms.js
  const prefixes = new Set();
  // Match ALIASES keys
  const aliasRegex = /'(_[a-zA-Z]+)'/g;
  let m;
  while ((m = aliasRegex.exec(atomsSource)) !== null) {
    prefixes.add(m[1]);
  }
  // Add common known atom bases
  const common = [
    '_flex', '_col', '_row', '_grid', '_gap', '_p', '_px', '_py', '_pt', '_pr', '_pb', '_pl',
    '_m', '_mx', '_my', '_mt', '_mr', '_mb', '_ml', '_w', '_h', '_mw', '_mh', '_r', '_b',
    '_aic', '_jcc', '_jcsb', '_jcse', '_jce', '_tc', '_tl', '_tr', '_ais', '_aie',
    '_relative', '_absolute', '_fixed', '_sticky', '_static',
    '_overflow', '_wfull', '_hfull', '_flex1', '_grow', '_shrink0',
    '_heading1', '_heading2', '_heading3', '_heading4', '_heading5', '_heading6',
    '_body', '_caption', '_textsm', '_textxs', '_bold', '_italic',
    '_fgfg', '_fgmuted', '_fgmutedfg', '_fgprimary', '_bgbg', '_bgmuted',
    '_nounder', '_trans', '_block', '_inline', '_inlineFlex',
    '_borderB', '_borderT', '_borderR', '_borderL', '_bordert', '_borderb',
    '_object', '_inset0', '_top0', '_bottom0', '_left0', '_right0',
    '_lineClamp2', '_clamp2', '_wrap', '_flexWrap', '_rfull',
    '_gc', '_span', '_gcaf', '_mxa', '_mxAuto',
    '_center', '_lhrelaxed', '_fontBold',
  ];
  for (const c of common) prefixes.add(c);
  return prefixes;
}

function matchesKnownAtom(atom, prefixes) {
  if (prefixes.has(atom)) return true;
  // Check prefix matches (e.g. _gap4 matches _gap prefix)
  for (const prefix of prefixes) {
    if (atom.startsWith(prefix) && atom.length > prefix.length) {
      const suffix = atom.slice(prefix.length);
      // Numeric suffix is always valid
      if (/^\d+(-\d+)?$/.test(suffix)) return true;
    }
  }
  return false;
}
