#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { readArgValue } from './cli-arg-lib.mjs';
import { getRepoRoot, loadPackageSurface, sortReleaseEntries } from './package-surface-lib.mjs';

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const send = args.has('--send');
const jsonOutput = args.has('--json');
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
const sourceRepo = readArgValue(rawArgs, 'repo') || 'decantr-ai/decantr';
const targetRepo = readArgValue(rawArgs, 'target-repo') || 'decantr-ai/community-ops';
const eventType = readArgValue(rawArgs, 'event-type') || 'decantr_release_published';
const tokenEnv = readArgValue(rawArgs, 'token-env') || 'COMMUNITY_OPS_DISPATCH_TOKEN';
const explicitVersion = readArgValue(rawArgs, 'version');
const explicitReleaseNotePath = readArgValue(rawArgs, 'release-note');
const explicitProject = readArgValue(rawArgs, 'project') || 'Decantr';

const root = getRepoRoot();
const surface = loadPackageSurface(root);
const releaseVersion = normalizeVersion(explicitVersion || readLocalPackageVersion('@decantr/cli'));
if (!releaseVersion) {
  throw new Error('Pass --version=x.y.z or keep packages/cli/package.json on a valid semver release.');
}

const releaseTag = `v${releaseVersion}`;
const releaseNotePath = explicitReleaseNotePath || findReleaseDocForVersion(releaseVersion);
if (!releaseNotePath) {
  throw new Error(`No docs/releases note found for ${releaseVersion}. Pass --release-note=docs/releases/...`);
}

const releaseNote = readFileSync(join(root, releaseNotePath), 'utf8');
const selectedPackages = sortReleaseEntries(surface.packages)
  .filter((entry) => {
    if (!entry.publish) return false;
    if (!includeExperimental && entry.maturity === 'experimental') return false;
    if (onlyWave && entry.releaseWave !== onlyWave) return false;
    if (onlyNames.size > 0 && !onlyNames.has(entry.name)) return false;
    return true;
  })
  .map((entry) => {
    const version = readPackageVersionAtPath(entry.path);
    return {
      name: entry.name,
      npm_url: `https://www.npmjs.com/package/${encodeURIComponent(entry.name)}`,
      version,
    };
  });

if (selectedPackages.length === 0) {
  throw new Error('No publishable packages matched the selected release filters.');
}

const commit = runGit(['rev-parse', releaseTag], { allowFailure: true })?.trim() || runGit(['rev-parse', 'HEAD']).trim();
const payload = {
  changelog_markdown: releaseNote,
  commit,
  docs_url: `https://decantr.ai/releases/${basename(releaseNotePath)}`,
  generated_at: new Date().toISOString(),
  packages: selectedPackages,
  project: explicitProject,
  ref: releaseTag,
  release_note_path: releaseNotePath,
  release_note_url: `https://github.com/${sourceRepo}/blob/main/${releaseNotePath}`,
  release_url: `https://github.com/${sourceRepo}/releases/tag/${releaseTag}`,
  repo: sourceRepo,
  tag: releaseTag,
  version: releaseVersion,
};

const dispatch = {
  event_type: eventType,
  client_payload: {
    release: payload,
  },
};

if (jsonOutput || !send) {
  console.log(JSON.stringify(dispatch, null, 2));
}

if (!send) {
  console.error(
    'Dry run only. Re-run with --send and set COMMUNITY_OPS_DISPATCH_TOKEN to create the community-ops repository_dispatch event.',
  );
  process.exit(0);
}

const token = process.env[tokenEnv]?.trim();
if (!token) {
  throw new Error(`Set ${tokenEnv} to a GitHub token with repository_dispatch access to ${targetRepo}.`);
}

const response = await fetch(`https://api.github.com/repos/${targetRepo}/dispatches`, {
  method: 'POST',
  headers: {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'decantr-release-announcer',
    'X-GitHub-Api-Version': '2022-11-28',
  },
  body: JSON.stringify(dispatch),
  signal: AbortSignal.timeout(10_000),
});

if (!response.ok) {
  const text = await response.text();
  throw new Error(
    [
      `GitHub repository_dispatch failed ${response.status} ${response.statusText}: ${text.slice(0, 600)}`,
      '',
      'Fallback: trigger the receiver workflow directly from community-ops with the changelog file attached:',
      renderReceiverFallbackCommand(),
    ].join('\n'),
  );
}

console.log(`Dispatched ${eventType} for ${explicitProject} ${releaseVersion} to ${targetRepo}.`);

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

function findReleaseDocForVersion(version) {
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

function renderReceiverFallbackCommand() {
  const packagesArg = selectedPackages
    .map((entry) => `${entry.name}@${entry.version}`)
    .join(',');
  return [
    'gh workflow run discord-release.yml \\',
    '  --repo decantr-ai/community-ops \\',
    '  --ref main \\',
    `  -f version=${shellQuote(releaseVersion)} \\`,
    `  -f tag=${shellQuote(releaseTag)} \\`,
    `  -f repo=${shellQuote(sourceRepo)} \\`,
    `  -f release_note_path=${shellQuote(releaseNotePath)} \\`,
    `  -f release_url=${shellQuote(`https://github.com/${sourceRepo}/releases/tag/${releaseTag}`)} \\`,
    `  -f packages=${shellQuote(packagesArg)} \\`,
    `  -F changelog_markdown=@${shellQuote(releaseNotePath)} \\`,
    '  -f dry_run=false',
  ].join('\n');
}

function shellQuote(value) {
  const stringValue = String(value);
  if (/^[A-Za-z0-9_./:@,%+-]+$/.test(stringValue)) return stringValue;
  return `'${stringValue.replaceAll("'", "'\\''")}'`;
}
