/**
 * Cellar utilities — discovery and health checks for sub-projects ("bottles")
 * under the framework root.
 *
 * Separated from CLI for testability.
 */

import { readFile, readdir, stat, lstat, realpath, mkdir, symlink, rm, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

// ── Helpers ────────────────────────────────────────────────────────

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.decantr-cache', '.claude']);

async function fileExists(path) {
  try { await stat(path); return true; } catch { return false; }
}

async function readJSON(path) {
  try { return JSON.parse(await readFile(path, 'utf-8')); } catch { return null; }
}

function compareSemver(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] < pb[i]) return -1;
    if (pa[i] > pb[i]) return 1;
  }
  return 0;
}

// ── Discovery ──────────────────────────────────────────────────────

/**
 * Walk `root` (max depth 3, excluding SKIP_DIRS) looking for directories
 * containing `decantr.config.json` OR `.decantr/manifest.json`.
 * Skips root itself. Returns Bottle[] sorted by relativePath.
 */
export async function discoverBottles(root) {
  const bottles = [];
  const rootAbs = resolve(root);

  async function walk(dir, depth) {
    if (depth > 3) return;
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }

    for (const entry of entries) {
      if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;
      const full = join(dir, entry.name);
      if (resolve(full) === rootAbs) continue;

      const hasConfig = await fileExists(join(full, 'decantr.config.json'));
      const hasManifest = await fileExists(join(full, '.decantr', 'manifest.json'));

      if (hasConfig || hasManifest) {
        const rel = relative(rootAbs, full);
        const pkg = await readJSON(join(full, 'package.json'));
        const config = await readJSON(join(full, 'decantr.config.json'));
        const manifest = await readJSON(join(full, '.decantr', 'manifest.json'));
        const essence = await readJSON(join(full, 'decantr.essence.json'));

        bottles.push({
          path: full,
          relativePath: rel,
          name: pkg?.name || manifest?.name || config?.name || entry.name,
          packageJson: pkg,
          config,
          manifest,
          essence,
        });
      }

      // Recurse into subdirectories
      await walk(full, depth + 1);
    }
  }

  await walk(rootAbs, 1);
  return bottles.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

// ── Per-Bottle Checks ──────────────────────────────────────────────

/**
 * Extract decantr dependency from package.json.
 * Checks dependencies first, then devDependencies.
 */
export function getDecantrDep(packageJson) {
  if (!packageJson) return null;
  return packageJson.dependencies?.decantr
    || packageJson.devDependencies?.decantr
    || null;
}

/**
 * Run all per-bottle checks. Returns CheckResult[].
 * Each result: { check, status: 'pass'|'warn'|'fail', message, fixable? }
 */
export async function checkBottle(bottle, root, rootVersion) {
  const results = [];
  const rootAbs = await realpath(resolve(root)).catch(() => resolve(root));

  // ── Label: required files ──
  if (bottle.packageJson) {
    if (bottle.manifest || bottle.config) {
      results.push({ check: 'label', status: 'pass', message: 'package.json and project markers found' });
    } else {
      results.push({ check: 'label', status: 'warn', message: 'Missing manifest and config' });
    }
  } else {
    results.push({ check: 'label', status: 'fail', message: 'No package.json found' });
  }

  // ── Cork: symlink health ──
  const nmDecantr = join(bottle.path, 'node_modules', 'decantr');
  try {
    const lstats = await lstat(nmDecantr);
    if (lstats.isSymbolicLink()) {
      // Verify it points to root
      let target;
      try {
        target = await realpath(nmDecantr);
      } catch (e) {
        if (e.code === 'ELOOP') {
          results.push({ check: 'cork', status: 'fail', message: 'Circular symlink detected', fixable: true });
        } else {
          results.push({ check: 'cork', status: 'fail', message: 'Broken symlink', fixable: true });
        }
        target = null;
      }
      if (target !== null) {
        const resolvedTarget = await realpath(target).catch(() => resolve(target));
        if (resolvedTarget === rootAbs) {
          results.push({ check: 'cork', status: 'pass', message: 'Correctly symlinked to root' });
        } else {
          results.push({ check: 'cork', status: 'fail', message: `Symlink points to ${target}, not root`, fixable: true });
        }
      }
    } else if (lstats.isDirectory()) {
      results.push({ check: 'cork', status: 'warn', message: 'npm-installed (not symlinked)', fixable: true });
    } else {
      results.push({ check: 'cork', status: 'fail', message: 'node_modules/decantr is not a directory or symlink', fixable: true });
    }
  } catch {
    results.push({ check: 'cork', status: 'fail', message: 'Missing node_modules/decantr', fixable: true });
  }

  // ── Vintage: version alignment ──
  const dep = getDecantrDep(bottle.packageJson);
  if (dep) {
    if (dep.startsWith('file:')) {
      results.push({ check: 'vintage', status: 'pass', message: `Dep: ${dep} (file link)` });
    } else {
      // Strip ^ ~ >= etc to get raw version
      const depVersion = dep.replace(/^[\^~>=<]+/, '');
      if (compareSemver(depVersion, rootVersion) === 0) {
        results.push({ check: 'vintage', status: 'pass', message: `Dep version ${dep} matches root` });
      } else if (compareSemver(depVersion, rootVersion) < 0) {
        results.push({ check: 'vintage', status: 'fail', message: `Dep ${dep} behind root v${rootVersion}`, fixable: true });
      } else {
        results.push({ check: 'vintage', status: 'warn', message: `Dep ${dep} ahead of root v${rootVersion}` });
      }
    }
  } else if (bottle.packageJson) {
    results.push({ check: 'vintage', status: 'warn', message: 'No decantr dependency declared' });
  }

  // Manifest version check
  if (bottle.manifest?.version) {
    if (bottle.manifest.version !== rootVersion) {
      results.push({ check: 'vintage', status: 'warn', message: `Manifest version ${bottle.manifest.version} != root ${rootVersion}`, fixable: true });
    }
  }

  // ── Port: read from config (cross-check happens in checkPortCollisions) ──
  const port = bottle.config?.dev?.port;
  if (port) {
    results.push({ check: 'port', status: 'pass', message: `Port ${port}`, port });
  }

  // ── Essence: version field ──
  if (bottle.essence) {
    if (bottle.essence.version) {
      results.push({ check: 'essence', status: 'pass', message: `Essence version ${bottle.essence.version}` });
    } else {
      results.push({ check: 'essence', status: 'warn', message: 'Essence missing version field' });
    }
  }

  return results;
}

/**
 * Cross-bottle port collision check.
 * Returns array of { port, bottles: string[] } for colliding ports.
 */
export function checkPortCollisions(bottles) {
  const portMap = new Map();
  for (const b of bottles) {
    const port = b.config?.dev?.port;
    if (port != null) {
      if (!portMap.has(port)) portMap.set(port, []);
      portMap.get(port).push(b.relativePath);
    }
  }
  const collisions = [];
  for (const [port, paths] of portMap) {
    if (paths.length > 1) {
      collisions.push({ port, bottles: paths });
    }
  }
  return collisions;
}

// ── Fix / Link ─────────────────────────────────────────────────────

/**
 * Ensure node_modules/decantr is a symlink to root.
 * Creates node_modules/ dir if missing. Replaces npm-installed dirs with symlink.
 */
export async function linkBottle(bottle, root) {
  const rootResolved = resolve(root);
  const nmDir = join(bottle.path, 'node_modules');
  const nmDecantr = join(nmDir, 'decantr');

  // Create node_modules if missing
  if (!(await fileExists(nmDir))) {
    await mkdir(nmDir, { recursive: true });
  }

  // Remove existing (directory or symlink)
  try {
    const lstats = await lstat(nmDecantr);
    if (lstats.isSymbolicLink()) {
      const target = await realpath(nmDecantr).catch(() => null);
      const rootReal = await realpath(rootResolved).catch(() => rootResolved);
      if (target === rootReal) return; // Already correct
    }
    await rm(nmDecantr, { recursive: true, force: true });
  } catch {
    // Doesn't exist — fine
  }

  // Create relative symlink using resolved (not realpath'd) paths for portability
  const relTarget = relative(nmDir, rootResolved);
  await symlink(relTarget, nmDecantr);
}

/**
 * Apply fixable repairs: dep version, manifest version, symlink.
 */
export async function fixBottle(bottle, root, rootVersion) {
  const rootAbs = resolve(root);
  const actions = [];

  // Fix symlink
  await linkBottle(bottle, rootAbs);
  actions.push('symlink');

  // Fix dependency version in package.json
  if (bottle.packageJson) {
    const dep = getDecantrDep(bottle.packageJson);
    if (dep && !dep.startsWith('file:')) {
      const depVersion = dep.replace(/^[\^~>=<]+/, '');
      if (compareSemver(depVersion, rootVersion) !== 0) {
        const pkgPath = join(bottle.path, 'package.json');
        const pkg = await readJSON(pkgPath);
        if (pkg.dependencies?.decantr) {
          pkg.dependencies.decantr = '^' + rootVersion;
        } else if (pkg.devDependencies?.decantr) {
          pkg.devDependencies.decantr = '^' + rootVersion;
        }
        await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
        actions.push('dep version');
      }
    }
  }

  // Fix manifest version
  if (bottle.manifest && bottle.manifest.version !== rootVersion) {
    const manifestPath = join(bottle.path, '.decantr', 'manifest.json');
    bottle.manifest.version = rootVersion;
    await writeFile(manifestPath, JSON.stringify(bottle.manifest, null, 2) + '\n');
    actions.push('manifest version');
  }

  return actions;
}
