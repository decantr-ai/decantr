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

function isMeaningfulStringArray(value) {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string' && entry.trim().length > 0);
}

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

    const readiness = entry.releaseReadiness;
    if (!readiness || typeof readiness !== 'object') {
      findings.push(`Package ${entry.name} is missing releaseReadiness metadata.`);
      continue;
    }
    for (const key of ['stableCandidate', 'docsAligned', 'ciCovered', 'productIntegrated']) {
      if (typeof readiness[key] !== 'boolean') {
        findings.push(`Package ${entry.name} releaseReadiness.${key} must be boolean.`);
      }
    }
    if (!isMeaningfulStringArray(readiness.blockers)) {
      findings.push(`Package ${entry.name} releaseReadiness.blockers must be a string array.`);
    }

    if (entry.maturity === 'stable') {
      if (!readiness.stableCandidate) {
        findings.push(`Stable package ${entry.name} must be marked releaseReadiness.stableCandidate=true.`);
      }
      if (!readiness.docsAligned || !readiness.ciCovered || !readiness.productIntegrated) {
        findings.push(`Stable package ${entry.name} must have docsAligned, ciCovered, and productIntegrated set to true.`);
      }
      if ((readiness.blockers ?? []).length > 0) {
        findings.push(`Stable package ${entry.name} must not carry outstanding release blockers.`);
      }
    }

    if (entry.maturity === 'beta' && !readiness.stableCandidate && (readiness.blockers ?? []).length === 0) {
      findings.push(`Beta package ${entry.name} must declare explicit release blockers until it is ready for stable graduation.`);
    }
  }

  for (const pkg of publicPackages) {
    if (!byName.has(pkg.name)) {
      findings.push(`Public package ${pkg.name} is missing from config/package-surface.json.`);
    }
  }

  return findings;
}

export function summarizeReleaseReadiness(surface) {
  const summary = {
    stableCandidates: [],
    betaWithBlockers: [],
    experimentalPackages: [],
  };

  for (const entry of surface.packages) {
    const blockers = entry.releaseReadiness?.blockers ?? [];
    if (entry.releaseReadiness?.stableCandidate) {
      summary.stableCandidates.push(entry.name);
    } else if (entry.maturity === 'beta') {
      summary.betaWithBlockers.push({
        name: entry.name,
        blockers,
      });
    }

    if (entry.maturity === 'experimental') {
      summary.experimentalPackages.push(entry.name);
    }
  }

  return summary;
}

export function createReleasePlan(surface, publicPackages, retirements) {
  const publicByName = new Map(publicPackages.map((entry) => [entry.name, entry]));
  const retiredByName = new Map((retirements?.packages ?? []).map((entry) => [entry.name, entry]));
  const packages = [];

  for (const entry of surface.packages) {
    const pkg = publicByName.get(entry.name) ?? null;
    const blockers = entry.releaseReadiness?.blockers ?? [];
    let recommendedAction = 'hold';
    let releaseTag = null;

    if (retiredByName.has(entry.name)) {
      recommendedAction = 'retired';
    } else if (entry.publish === false || entry.maturity === 'experimental') {
      recommendedAction = 'hold-experimental';
    } else if (entry.maturity === 'stable') {
      recommendedAction = 'publish-latest';
      releaseTag = 'latest';
    } else if (entry.releaseReadiness?.stableCandidate && blockers.length === 0) {
      recommendedAction = 'ready-to-graduate';
      releaseTag = 'latest';
    } else {
      recommendedAction = 'publish-beta';
      releaseTag = entry.defaultDistTag;
    }

    packages.push({
      name: entry.name,
      path: entry.path,
      version: pkg?.version ?? null,
      support: entry.support,
      maturity: entry.maturity,
      publish: entry.publish === true,
      defaultDistTag: entry.defaultDistTag,
      summary: entry.summary,
      stableCandidate: entry.releaseReadiness?.stableCandidate === true,
      blockers,
      docsAligned: entry.releaseReadiness?.docsAligned === true,
      ciCovered: entry.releaseReadiness?.ciCovered === true,
      productIntegrated: entry.releaseReadiness?.productIntegrated === true,
      recommendedAction,
      releaseTag,
      retirement: retiredByName.get(entry.name) ?? null,
    });
  }

  for (const retirement of retirements?.packages ?? []) {
    if (surface.packages.some((entry) => entry.name === retirement.name)) continue;
    packages.push({
      name: retirement.name,
      path: null,
      version: null,
      support: 'retired',
      maturity: 'retired',
      publish: false,
      defaultDistTag: null,
      summary: retirement.message,
      stableCandidate: false,
      blockers: [],
      docsAligned: true,
      ciCovered: false,
      productIntegrated: false,
      recommendedAction: 'retired',
      releaseTag: null,
      retirement,
    });
  }

  const counts = {
    publishLatest: packages.filter((entry) => entry.recommendedAction === 'publish-latest').length,
    publishBeta: packages.filter((entry) => entry.recommendedAction === 'publish-beta').length,
    readyToGraduate: packages.filter((entry) => entry.recommendedAction === 'ready-to-graduate').length,
    holdExperimental: packages.filter((entry) => entry.recommendedAction === 'hold-experimental').length,
    retired: packages.filter((entry) => entry.recommendedAction === 'retired').length,
  };

  return {
    generatedAt: new Date().toISOString(),
    counts,
    packages,
  };
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
