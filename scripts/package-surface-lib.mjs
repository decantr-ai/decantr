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
const RETIREMENT_STATUS_VALUES = new Set(['retired', 'deprecated']);

export function getRepoRoot() {
  return resolve(new URL('..', import.meta.url).pathname);
}

export function loadPackageSurface(root = getRepoRoot()) {
  const path = join(root, 'config', 'package-surface.json');
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function loadPackageRetirements(root = getRepoRoot()) {
  const path = join(root, 'config', 'package-retirements.json');
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

export function validatePackageRetirements(surface, retirements) {
  const findings = [];
  const activeNames = new Set(surface.packages.map((entry) => entry.name));
  const seen = new Set();

  for (const entry of retirements.packages ?? []) {
    if (!entry || typeof entry !== 'object') {
      findings.push('Retirement manifest entries must be objects.');
      continue;
    }

    if (typeof entry.name !== 'string' || entry.name.length === 0) {
      findings.push('Retirement manifest entries must include a non-empty package name.');
      continue;
    }

    if (seen.has(entry.name)) {
      findings.push(`Retirement manifest contains duplicate package entry: ${entry.name}`);
    }
    seen.add(entry.name);

    if (!RETIREMENT_STATUS_VALUES.has(entry.status)) {
      findings.push(`Unsupported retirement status for ${entry.name}: ${entry.status}`);
    }

    if (activeNames.has(entry.name)) {
      findings.push(`Retired package ${entry.name} is still listed in config/package-surface.json.`);
    }

    if (typeof entry.message !== 'string' || entry.message.length < 20) {
      findings.push(`Retired package ${entry.name} must include a meaningful deprecation message.`);
    }
  }

  return findings;
}
