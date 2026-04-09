import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const SUPPORT_VALUES = new Set([
  'core-supported',
  'supported-secondary',
  'parked',
  'archived',
  'extracted',
]);

const MATURITY_VALUES = new Set(['stable', 'beta', 'experimental']);

export function getRepoRoot() {
  return resolve(new URL('..', import.meta.url).pathname);
}

export function loadPackageSurface(root = getRepoRoot()) {
  const path = join(root, 'config', 'package-surface.json');
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function listPublicPackages(root = getRepoRoot()) {
  const packagesDir = join(root, 'packages');
  return readdirSync(packagesDir)
    .map((name) => join(packagesDir, name, 'package.json'))
    .filter((path) => existsSync(path))
    .map((path) => {
      const pkg = JSON.parse(readFileSync(path, 'utf8'));
      return {
        name: pkg.name,
        version: pkg.version,
        description: pkg.description,
        private: pkg.private === true,
        path: path.replace(`${root}/`, '').replace(/\/package\.json$/, ''),
      };
    })
    .filter((pkg) => !pkg.private);
}

export function validatePackageSurface(surface, publicPackages) {
  const findings = [];
  const byName = new Map(surface.packages.map((entry) => [entry.name, entry]));
  const publicByName = new Map(publicPackages.map((entry) => [entry.name, entry]));

  for (const entry of surface.packages) {
    if (!SUPPORT_VALUES.has(entry.support)) {
      findings.push(`Unsupported support value for ${entry.name}: ${entry.support}`);
    }
    if (!MATURITY_VALUES.has(entry.maturity)) {
      findings.push(`Unsupported maturity value for ${entry.name}: ${entry.maturity}`);
    }
    if (!publicByName.has(entry.name)) {
      findings.push(`Manifest includes ${entry.name} but no matching public package was found.`);
      continue;
    }
    const pkg = publicByName.get(entry.name);
    if (pkg.path !== entry.path) {
      findings.push(`Manifest path mismatch for ${entry.name}: expected ${pkg.path}, found ${entry.path}`);
    }
    if (entry.maturity === 'stable' && entry.defaultDistTag !== 'latest') {
      findings.push(`Stable package ${entry.name} must default to the latest dist-tag.`);
    }
    if (entry.maturity !== 'stable' && entry.defaultDistTag !== 'beta') {
      findings.push(`Non-stable package ${entry.name} must default to the beta dist-tag unless overridden.`);
    }
    if (entry.maturity === 'experimental' && entry.publish !== false) {
      findings.push(`Experimental package ${entry.name} should not publish by default.`);
    }
  }

  for (const pkg of publicPackages) {
    if (!byName.has(pkg.name)) {
      findings.push(`Public package ${pkg.name} is missing from config/package-surface.json.`);
    }
  }

  return findings;
}
