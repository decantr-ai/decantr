#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { basename, resolve } from 'node:path';
import { readArgValue } from './cli-arg-lib.mjs';
import { getRepoRoot, sortReleaseEntries } from './package-surface-lib.mjs';

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
const root = process.env.NODE_ENV === 'test' && process.env.DECANTR_RELEASE_TEST_ROOT
  ? resolve(process.env.DECANTR_RELEASE_TEST_ROOT)
  : getRepoRoot();
const releaseVersion = normalizeVersion(explicitVersion);

if (!releaseVersion) {
  throw new Error('Pass an explicit --version=x.y.z release target; announcements cannot fall back to HEAD.');
}

const releaseTag = `v${releaseVersion}`;
const commit = runGit(['rev-parse', '--verify', `${releaseTag}^{commit}`], { allowFailure: true })?.trim();
if (!commit) {
  throw new Error(`Missing local release tag ${releaseTag}; announcements require tag-bound evidence.`);
}

const surface = readJsonAtTag(releaseTag, 'config/package-surface.json');
const releaseNotePath = explicitReleaseNotePath || findReleaseDocForVersionAtTag(releaseTag, releaseVersion);
if (!releaseNotePath || !/^docs\/releases\/[^:]+\.md$/.test(releaseNotePath)) {
  throw new Error(
    `No tagged docs/releases note found for ${releaseVersion}. Pass --release-note=docs/releases/...`,
  );
}

const releaseNote = readTextAtTag(releaseTag, releaseNotePath);
const releaseNoteBlob = runGit(['rev-parse', `${releaseTag}:${releaseNotePath}`]).trim();
const selectedEntries = selectReleaseEntries(surface, releaseTag);
const selectedPackages = selectedEntries.map((entry) => {
  const version = readPackageJsonAtTag(releaseTag, entry).version;
  return {
    name: entry.name,
    npm_url: `https://www.npmjs.com/package/${encodeURIComponent(entry.name)}`,
    version,
  };
});

if (selectedPackages.length === 0) {
  throw new Error('No publishable packages matched the selected release filters.');
}
if (!selectedPackages.some((entry) => entry.version === releaseVersion)) {
  throw new Error(
    `No selected package manifest at ${releaseTag} has release version ${releaseVersion}.`,
  );
}

const payload = {
  changelog_markdown: releaseNote,
  commit,
  docs_url: `https://decantr.ai/releases/${basename(releaseNotePath)}`,
  generated_at: new Date().toISOString(),
  packages: selectedPackages,
  project: explicitProject,
  ref: releaseTag,
  release_note_blob: releaseNoteBlob,
  release_note_path: releaseNotePath,
  release_note_url: `https://github.com/${sourceRepo}/blob/${releaseTag}/${releaseNotePath}`,
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

if (jsonOutput || !send) console.log(JSON.stringify(dispatch, null, 2));

if (!send) {
  console.error(
    'Dry run only. Re-run with --send after tag-bound release closeout passes and set COMMUNITY_OPS_DISPATCH_TOKEN.',
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
      'Fallback: trigger the receiver workflow directly from community-ops with the tagged changelog materialized first:',
      renderReceiverFallbackCommand(),
    ].join('\n'),
  );
}

console.log(`Dispatched ${eventType} for ${explicitProject} ${releaseVersion} to ${targetRepo}.`);

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

function readTextAtTag(tag, path) {
  const contents = runGit(['show', `${tag}:${path}`], { allowFailure: true });
  if (contents == null) throw new Error(`${tag} does not contain ${path}.`);
  return contents;
}

function readJsonAtTag(tag, path) {
  try {
    return JSON.parse(readTextAtTag(tag, path));
  } catch (cause) {
    throw new Error(`Cannot read ${path} from ${tag}: ${cause.message}`);
  }
}

function listReleaseDocsAtTag(tag) {
  const output = runGit(
    ['ls-tree', '-r', '--name-only', tag, '--', 'docs/releases'],
    { allowFailure: true },
  );
  return output
    ? output.split('\n').map((value) => value.trim()).filter((value) => value.endsWith('.md'))
    : [];
}

function findReleaseDocForVersionAtTag(tag, version) {
  const [major, minor, patch] = version.split('.');
  const fullSlug = `${major}-${minor}-${patch}`;
  const minorSlug = patch === '0' ? `${major}-${minor}` : null;
  const files = listReleaseDocsAtTag(tag);

  for (const file of files) {
    const name = basename(file);
    if (name.includes(fullSlug) || (minorSlug && name.includes(minorSlug))) return file;
  }
  for (const file of files) {
    const content = readTextAtTag(tag, file);
    if (content.includes(version) || content.includes(`v${version}`)) return file;
  }
  return null;
}

function readPackageJsonAtTag(tag, entry) {
  return readJsonAtTag(tag, `${entry.path}/package.json`);
}

function selectReleaseEntries(tagSurface, tag) {
  const byName = new Map(tagSurface.packages.map((entry) => [entry.name, entry]));
  const isEligible = (entry) => (
    entry.publish === true
    && (includeExperimental || entry.maturity !== 'experimental')
  );

  if (onlyNames.size === 0) {
    return sortReleaseEntries(tagSurface.packages).filter((entry) => {
      if (!isEligible(entry)) return false;
      if (onlyWave && entry.releaseWave !== onlyWave) return false;
      return true;
    });
  }

  const selectedNames = new Set();
  const queue = [];
  for (const packageName of onlyNames) {
    const entry = byName.get(packageName);
    if (!entry) throw new Error(`Unknown package in --only at ${tag}: ${packageName}`);
    if (!entry.publish) throw new Error(`Package in --only is not publishable at ${tag}: ${packageName}`);
    if (!includeExperimental && entry.maturity === 'experimental') {
      throw new Error(`Package in --only requires --include-experimental: ${packageName}`);
    }
    if (onlyWave && entry.releaseWave !== onlyWave) {
      throw new Error(
        `Package ${packageName} is in release wave ${entry.releaseWave}, not requested wave ${onlyWave}.`,
      );
    }
    selectedNames.add(packageName);
    queue.push(entry);
  }

  for (let index = 0; index < queue.length; index += 1) {
    const entry = queue[index];
    const packageJson = readPackageJsonAtTag(tag, entry);
    for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
      for (const dependencyName of Object.keys(packageJson[field] ?? {})) {
        const dependencyEntry = byName.get(dependencyName);
        if (!dependencyEntry || selectedNames.has(dependencyName)) continue;
        if (!dependencyEntry.publish) {
          throw new Error(`${entry.name} depends on internal non-publishable package ${dependencyName}.`);
        }
        if (!includeExperimental && dependencyEntry.maturity === 'experimental') {
          throw new Error(`${entry.name} depends on experimental package ${dependencyName}.`);
        }
        selectedNames.add(dependencyName);
        queue.push(dependencyEntry);
      }
    }
  }

  return sortReleaseEntries(tagSurface.packages.filter((entry) => selectedNames.has(entry.name)));
}

function renderReceiverFallbackCommand() {
  const packagesArg = selectedPackages
    .map((entry) => `${entry.name}@${entry.version}`)
    .join(',');
  const taggedNotePath = `/tmp/decantr-${releaseTag}-release-note.md`;
  return [
    `git show ${shellQuote(`${releaseTag}:${releaseNotePath}`)} > ${shellQuote(taggedNotePath)}`,
    'gh workflow run discord-release.yml \\',
    '  --repo decantr-ai/community-ops \\',
    '  --ref main \\',
    `  -f version=${shellQuote(releaseVersion)} \\`,
    `  -f tag=${shellQuote(releaseTag)} \\`,
    `  -f repo=${shellQuote(sourceRepo)} \\`,
    `  -f release_note_path=${shellQuote(releaseNotePath)} \\`,
    `  -f release_url=${shellQuote(`https://github.com/${sourceRepo}/releases/tag/${releaseTag}`)} \\`,
    `  -f packages=${shellQuote(packagesArg)} \\`,
    `  -F changelog_markdown=@${shellQuote(taggedNotePath)} \\`,
    '  -f dry_run=false',
  ].join('\n');
}

function shellQuote(value) {
  const stringValue = String(value);
  if (/^[A-Za-z0-9_./:@,%+-]+$/.test(stringValue)) return stringValue;
  return `'${stringValue.replaceAll("'", "'\\''")}'`;
}
