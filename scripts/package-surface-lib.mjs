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
const RELEASE_WAVE_VALUES = ['foundation', 'delivery', 'experimental'];
const RELEASE_WAVE_VALUE_SET = new Set(RELEASE_WAVE_VALUES);
const RELEASE_WAVE_RANK = new Map(RELEASE_WAVE_VALUES.map((wave, index) => [wave, index]));
const RETIREMENT_STATUS_VALUES = new Set(['retired', 'deprecated']);
const SUPPORT_DESCRIPTIONS = {
  'core-supported': 'part of the product nucleus and expected to track the vNext architecture closely',
  'supported-secondary': 'still available, but not a strategic anchor for the main product story',
  parked: 'intentionally paused and not expected to move with the main delivery cadence',
  archived: 'preserved for history only and not expected to receive new product work',
  extracted: 'moved out of the monorepo reset surface into a separate line',
};
const MATURITY_DESCRIPTIONS = {
  stable: 'intended to publish under npm `latest`',
  beta: 'public and supported, but still expected to evolve before stable graduation',
  experimental: 'opt-in and not part of the default publish wave',
};

function isMeaningfulStringArray(value) {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string' && entry.trim().length > 0);
}

export function getRepoRoot() {
  return resolve(new URL('..', import.meta.url).pathname);
}

export function getPackageSupportMatrixPath(root = getRepoRoot()) {
  return join(root, 'docs', 'reference', 'package-support-matrix.md');
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

export function sortReleaseEntries(entries) {
  return [...entries].sort((left, right) => {
    const waveRank = (RELEASE_WAVE_RANK.get(left.releaseWave) ?? Number.MAX_SAFE_INTEGER)
      - (RELEASE_WAVE_RANK.get(right.releaseWave) ?? Number.MAX_SAFE_INTEGER);
    if (waveRank !== 0) return waveRank;

    const orderRank = (left.publishOrder ?? Number.MAX_SAFE_INTEGER) - (right.publishOrder ?? Number.MAX_SAFE_INTEGER);
    if (orderRank !== 0) return orderRank;

    return left.name.localeCompare(right.name);
  });
}

export function validatePackageSurface(surface, publicPackages) {
  const findings = [];
  const byName = new Map(surface.packages.map((entry) => [entry.name, entry]));
  const publicByName = new Map(publicPackages.map((entry) => [entry.name, entry]));
  const seenWaveOrders = new Map();

  for (const entry of surface.packages) {
    if (!SUPPORT_VALUES.has(entry.support)) {
      findings.push(`Unsupported support value for ${entry.name}: ${entry.support}`);
    }
    if (!MATURITY_VALUES.has(entry.maturity)) {
      findings.push(`Unsupported maturity value for ${entry.name}: ${entry.maturity}`);
    }
    if (!RELEASE_WAVE_VALUE_SET.has(entry.releaseWave)) {
      findings.push(`Unsupported releaseWave value for ${entry.name}: ${entry.releaseWave}`);
    }
    if (!Number.isInteger(entry.publishOrder) || entry.publishOrder < 1) {
      findings.push(`Package ${entry.name} publishOrder must be a positive integer.`);
    }
    if (RELEASE_WAVE_VALUE_SET.has(entry.releaseWave) && Number.isInteger(entry.publishOrder) && entry.publishOrder > 0) {
      const waveOrderKey = `${entry.releaseWave}:${entry.publishOrder}`;
      if (seenWaveOrders.has(waveOrderKey)) {
        findings.push(`Duplicate publish order ${entry.publishOrder} in release wave ${entry.releaseWave}: ${seenWaveOrders.get(waveOrderKey)} and ${entry.name}`);
      } else {
        seenWaveOrders.set(waveOrderKey, entry.name);
      }
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
    if (entry.maturity === 'experimental' && entry.releaseWave !== 'experimental') {
      findings.push(`Experimental package ${entry.name} must live in the experimental release wave.`);
    }
    if (entry.maturity !== 'experimental' && entry.releaseWave === 'experimental') {
      findings.push(`Non-experimental package ${entry.name} cannot live in the experimental release wave.`);
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
    releaseWaves: Object.fromEntries(RELEASE_WAVE_VALUES.map((wave) => [wave, []])),
  };

  for (const entry of surface.packages) {
    const blockers = entry.releaseReadiness?.blockers ?? [];
    summary.releaseWaves[entry.releaseWave]?.push(entry.name);
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

function escapeMarkdownCell(value) {
  return String(value ?? '-').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

export function renderPackageSupportMatrix(surface, retirements) {
  const activePackages = sortReleaseEntries(surface.packages);
  const nucleusPackages = activePackages.filter((entry) => entry.support === 'core-supported' && entry.maturity !== 'experimental');
  const retiredPackages = [...(retirements?.packages ?? [])].sort((left, right) => left.name.localeCompare(right.name));

  const lines = [
    '# Decantr Package Support Matrix',
    '',
    'Generated from `config/package-surface.json` and `config/package-retirements.json`.',
    'Do not edit manually. Run `node scripts/sync-package-support-matrix.mjs` after package-surface changes.',
    '',
    'Release readiness audit: `pnpm audit:release-readiness`',
    'Package surface audit: `pnpm audit:package-surface`',
    '',
    'This matrix defines which npm packages are part of the active Decantr vNext product surface on the reset branch.',
    '',
    '## Active Packages',
    '',
    '| Package | Support status | Maturity | Release wave | Default npm tag | Publish default | Summary |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...activePackages.map((entry) => (
      `| \`${escapeMarkdownCell(entry.name)}\` | ${escapeMarkdownCell(entry.support)} | ${escapeMarkdownCell(entry.maturity)} | \`${escapeMarkdownCell(entry.releaseWave)}\` (\`${escapeMarkdownCell(entry.publishOrder)}\`) | \`${escapeMarkdownCell(entry.defaultDistTag)}\` | \`${entry.publish === true ? 'true' : 'false'}\` | ${escapeMarkdownCell(entry.summary)} |`
    )),
    '',
    '## Interpretation',
    '',
    ...Object.entries(SUPPORT_DESCRIPTIONS).map(([support, description]) => `- \`${support}\` means ${description}.`),
    ...Object.entries(MATURITY_DESCRIPTIONS).map(([maturity, description]) => `- \`${maturity}\` means ${description}.`),
    '- `release wave` defines the intended publish order for coordinated npm releases.',
    '- `publish default` reflects whether the package participates in the default publish flow without opt-in overrides.',
    '',
    '## Current Product Nucleus',
    '',
    'The active Decantr product surface is:',
    '',
    ...nucleusPackages.map((entry) => `- \`${entry.name}\``),
    '',
    '## Explicitly Not Part of the Active Product Story',
    '',
    'These lines were removed from the monorepo reset branch and should not be treated as current product surfaces:',
    '',
    ...retiredPackages.map((entry) => `- \`${entry.name}\`${entry.replacement ? ` -> replacement: ${entry.replacement}` : ''}`),
    '',
    'That retirement path is now executable through:',
    '',
    '1. `config/package-retirements.json`',
    '2. `pnpm package:retire:dry-run`',
    '3. `node scripts/deprecate-retired-packages.mjs`',
    '',
    '## Working Rule',
    '',
    'Any future public package change should update all of:',
    '',
    '1. `config/package-surface.json`',
    '2. `config/package-retirements.json` when a line is being removed',
    '3. `node scripts/sync-package-support-matrix.mjs`',
    '4. the relevant package README',
    '5. publish/deprecation workflow behavior',
    '',
    'Beta packages now also need explicit `releaseReadiness.blockers` in `config/package-surface.json` until they are ready to graduate.',
    '',
  ];

  return lines.join('\n');
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
      releaseWave: entry.releaseWave,
      publishOrder: entry.publishOrder,
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
      releaseWave: 'retired',
      publishOrder: Number.MAX_SAFE_INTEGER,
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
    byWave: sortReleaseEntries(
      RELEASE_WAVE_VALUES.map((wave, index) => ({
        name: wave,
        releaseWave: wave,
        publishOrder: index + 1,
      })),
    ).reduce((acc, waveEntry) => {
      acc[waveEntry.releaseWave] = packages.filter((entry) => entry.releaseWave === waveEntry.releaseWave).length;
      return acc;
    }, {}),
  };

  return {
    generatedAt: new Date().toISOString(),
    counts,
    packages: sortReleaseEntries(packages),
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
