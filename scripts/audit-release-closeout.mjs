#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { readArgValue } from './cli-arg-lib.mjs';
import { getRepoRoot, loadPackageSurface, sortReleaseEntries } from './package-surface-lib.mjs';
import { readNpmDistTags, readNpmVersions } from './npm-surface-lib.mjs';

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const jsonOutput = args.has('--json');
const allowDirty = args.has('--allow-dirty');
const skipGit = args.has('--skip-git');
const skipNpm = args.has('--skip-npm');
const noFetch = args.has('--no-fetch');
const includeExperimental = args.has('--include-experimental');
const onlyWave = readArgValue(rawArgs, 'wave');
const onlyNames = new Set(
  readArgValue(rawArgs, 'only')
    ? readArgValue(rawArgs, 'only')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : [],
);
const explicitVersion = readArgValue(rawArgs, 'version');

const root = getRepoRoot();
const surface = loadPackageSurface(root);
const cliVersion = readLocalPackageVersion('@decantr/cli');
const releaseVersion = normalizeVersion(explicitVersion || cliVersion);
const releaseTag = `v${releaseVersion}`;
const generatedAt = new Date().toISOString();
const checks = [];

if (!releaseVersion) {
  addCheck('release', 'target version', 'fail', 'Pass --version=x.y.z or keep packages/cli/package.json on a valid semver release.');
} else {
  addCheck('release', 'target version', 'pass', releaseVersion);
}

if (!skipGit) {
  if (!noFetch) {
    runGit(['fetch', '--tags', 'origin', 'main'], { stdio: 'ignore' });
  }

  const status = runGit(['status', '--short'], { allowFailure: true }).trim();
  if (status && !allowDirty) {
    addCheck('git', 'worktree clean', 'fail', 'Working tree is dirty. Commit or stash release changes before closeout.');
  } else {
    addCheck('git', 'worktree clean', 'pass', status ? 'dirty allowed by --allow-dirty' : 'clean');
  }

  addCheck(
    'git',
    `local tag ${releaseTag}`,
    localTagExists(releaseTag) ? 'pass' : 'fail',
    localTagExists(releaseTag) ? 'present' : `Missing local tag ${releaseTag}.`,
  );

  addCheck(
    'git',
    `origin tag ${releaseTag}`,
    originTagExists(releaseTag) ? 'pass' : 'fail',
    originTagExists(releaseTag) ? 'present' : `Missing pushed tag ${releaseTag}.`,
  );

  if (localTagExists(releaseTag)) {
    const ancestor = runGit(['merge-base', '--is-ancestor', releaseTag, 'origin/main'], {
      allowFailure: true,
    }) !== null;
    addCheck(
      'git',
      `${releaseTag} is on origin/main`,
      ancestor ? 'pass' : 'fail',
      ancestor ? 'tag commit is reachable from origin/main' : `${releaseTag} is not reachable from origin/main.`,
    );
  }

  for (const docVersion of releaseDocVersions()) {
    const tag = `v${docVersion}`;
    const exists = localTagExists(tag) || originTagExists(tag);
    addCheck(
      'git',
      `release doc tag ${tag}`,
      exists ? 'pass' : 'fail',
      exists ? 'present' : `docs/releases mentions ${docVersion}, but ${tag} is missing.`,
    );
  }
}

const targetReleaseDoc = findReleaseDocForVersion(releaseVersion);
addCheck(
  'docs',
  `release note for ${releaseVersion}`,
  targetReleaseDoc ? 'pass' : 'fail',
  targetReleaseDoc
    ? targetReleaseDoc
    : `Missing docs/releases note containing ${releaseVersion} or ${releaseVersion.replaceAll('.', '-')}.`,
);

if (!skipNpm) {
  const selected = sortReleaseEntries(surface.packages).filter((entry) => {
    if (!entry.publish) return false;
    if (!includeExperimental && entry.maturity === 'experimental') return false;
    if (onlyWave && entry.releaseWave !== onlyWave) return false;
    if (onlyNames.size > 0 && !onlyNames.has(entry.name)) return false;
    return true;
  });

  for (const entry of selected) {
    const version = readPackageVersionAtPath(entry.path);
    const versions = readNpmVersions(entry.name);
    const tags = readNpmDistTags(entry.name);
    const distTag = entry.defaultDistTag || 'latest';

    addCheck(
      'npm',
      `${entry.name}@${version}`,
      versions.published && versions.versions.includes(version) ? 'pass' : 'fail',
      versions.published
        ? versions.versions.includes(version)
          ? 'published'
          : `npm does not include ${version}`
        : versions.error || 'package is not published',
    );

    addCheck(
      'npm',
      `${entry.name} ${distTag} dist-tag`,
      tags.published && tags.tags?.[distTag] === version ? 'pass' : 'fail',
      tags.published
        ? `${distTag} -> ${tags.tags?.[distTag] ?? 'none'}`
        : tags.error || 'dist-tags unavailable',
    );
  }
}

const failures = checks.filter((check) => check.status === 'fail');
const output = {
  generatedAt,
  releaseVersion,
  releaseTag,
  filters: {
    includeExperimental,
    only: [...onlyNames],
    skipGit,
    skipNpm,
    wave: onlyWave,
  },
  summary: {
    failed: failures.length,
    passed: checks.length - failures.length,
    total: checks.length,
  },
  checks,
};

if (jsonOutput) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(renderMarkdown(output));
}

if (failures.length > 0) {
  process.exitCode = 1;
}

function readLocalPackageVersion(packageName) {
  const entry = surface.packages.find((item) => item.name === packageName);
  if (!entry) return null;
  return readPackageVersionAtPath(entry.path);
}

function readPackageVersionAtPath(packagePath) {
  const packageJson = JSON.parse(readFileSync(join(root, packagePath, 'package.json'), 'utf8'));
  return packageJson.version;
}

function normalizeVersion(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().replace(/^v/, '');
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(trimmed) ? trimmed : null;
}

function runGit(gitArgs, options = {}) {
  try {
    return execFileSync('git', gitArgs, {
      cwd: root,
      encoding: 'utf8',
      stdio: options.stdio || ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    if (options.allowFailure) return null;
    throw error;
  }
}

function localTagExists(tag) {
  return runGit(['rev-parse', '--verify', '--quiet', `refs/tags/${tag}^{commit}`], {
    allowFailure: true,
  }) !== null;
}

function originTagExists(tag) {
  const output = runGit(['ls-remote', '--tags', 'origin', `refs/tags/${tag}`], {
    allowFailure: true,
  });
  return typeof output === 'string' && output.trim().length > 0;
}

function releaseDocVersions() {
  const releasesDir = join(root, 'docs', 'releases');
  if (!existsSync(releasesDir)) return [];

  const versions = new Set();
  for (const file of readdirSync(releasesDir).filter((entry) => entry.endsWith('.md'))) {
    const stem = basename(file, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, '');
    const matches = stem.matchAll(/(?:^|[^\d])(\d+)-(\d+)(?:-(\d+))?(?=$|[^\d])/g);
    for (const match of matches) {
      const major = Number(match[1]);
      const minor = Number(match[2]);
      const patch = match[3] == null ? 0 : Number(match[3]);
      if (major > 0 && Number.isInteger(minor) && Number.isInteger(patch)) {
        versions.add(`${major}.${minor}.${patch}`);
      }
    }
  }
  return [...versions].sort(compareSemver);
}

function findReleaseDocForVersion(version) {
  if (!version) return null;
  const releasesDir = join(root, 'docs', 'releases');
  if (!existsSync(releasesDir)) return null;

  const [major, minor, patch] = version.split('.');
  const fullSlug = `${major}-${minor}-${patch}`;
  const minorSlug = patch === '0' ? `${major}-${minor}` : null;
  const files = readdirSync(releasesDir).filter((entry) => entry.endsWith('.md'));

  for (const file of files) {
    if (file.includes(fullSlug) || (minorSlug && file.includes(minorSlug))) {
      return `docs/releases/${file}`;
    }
  }

  for (const file of files) {
    const content = readFileSync(join(releasesDir, file), 'utf8');
    if (content.includes(version) || content.includes(`v${version}`)) {
      return `docs/releases/${file}`;
    }
  }
  return null;
}

function compareSemver(left, right) {
  const leftParts = left.split('.').map(Number);
  const rightParts = right.split('.').map(Number);
  for (let index = 0; index < 3; index += 1) {
    const delta = leftParts[index] - rightParts[index];
    if (delta !== 0) return delta;
  }
  return 0;
}

function addCheck(scope, name, status, detail) {
  checks.push({ scope, name, status, detail });
}

function renderMarkdown(report) {
  const lines = [
    '# Release Closeout Audit',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Release version: ${report.releaseVersion ?? 'unknown'}`,
    `- Release tag: ${report.releaseTag ?? 'unknown'}`,
    `- Status: ${report.summary.failed > 0 ? 'failed' : 'passed'}`,
    `- Checks: ${report.summary.passed}/${report.summary.total} passed`,
    '',
    '| Scope | Check | Status | Detail |',
    '| --- | --- | --- | --- |',
  ];

  for (const check of report.checks) {
    lines.push(
      `| ${escapeCell(check.scope)} | ${escapeCell(check.name)} | ${check.status} | ${escapeCell(check.detail)} |`,
    );
  }

  lines.push('');
  if (report.summary.failed > 0) {
    lines.push('Closeout is not complete. Fix the failed checks, then rerun `pnpm release:closeout`.');
  } else {
    lines.push('Release closeout is complete: git tags, release notes, and npm state are aligned.');
  }

  return `${lines.join('\n')}\n`;
}

function escapeCell(value) {
  return String(value ?? '')
    .replaceAll('\\', '\\\\')
    .replaceAll('|', '\\|')
    .replaceAll('\n', ' ');
}
