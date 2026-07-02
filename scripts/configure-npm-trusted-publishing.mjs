#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readArgValue } from './cli-arg-lib.mjs';
import { getRepoRoot, loadPackageSurface, sortReleaseEntries } from './package-surface-lib.mjs';

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const write = args.has('--write');
const interactive = args.has('--interactive');
const includeExperimental = args.has('--include-experimental');
const onlyWave = readArgValue(rawArgs, 'wave');
const repository = readArgValue(rawArgs, 'repo') ?? readArgValue(rawArgs, 'repository') ?? 'decantr-ai/decantr';
const workflowFile = readArgValue(rawArgs, 'file') ?? 'publish.yml';
const environment = readArgValue(rawArgs, 'environment') ?? readArgValue(rawArgs, 'env');
const onlyNames = new Set(
  readArgValue(rawArgs, 'only')
    ? readArgValue(rawArgs, 'only')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : [],
);

const root = getRepoRoot();
const surface = loadPackageSurface(root);
const selected = sortReleaseEntries(surface.packages).filter((entry) => {
  if (!entry.publish) return false;
  if (!includeExperimental && entry.maturity === 'experimental') return false;
  if (onlyWave && entry.releaseWave !== onlyWave) return false;
  if (onlyNames.size > 0 && !onlyNames.has(entry.name)) return false;
  return true;
});

if (selected.length === 0) {
  console.log('No publishable packages matched the selected filters.');
  process.exit(0);
}

console.log(`# npm Trusted Publishing ${write ? 'Configure' : 'Plan'}`);
console.log('');
console.log(`- Repository: ${repository}`);
console.log(`- Workflow file: ${workflowFile}`);
console.log(`- Environment: ${environment ?? '(none)'}`);
console.log(`- Mode: ${write ? 'write' : 'dry-run'}${interactive ? ' interactive' : ''}`);
console.log(`- Packages: ${selected.length}`);
console.log('');

for (const [index, entry] of selected.entries()) {
  const command = [
    'trust',
    'github',
    entry.name,
    '--file',
    workflowFile,
    '--repo',
    repository,
    '--yes',
  ];

  if (!interactive) {
    command.push('--json');
  }
  if (environment) {
    command.push('--environment', environment);
  }
  if (!write) {
    command.push('--dry-run');
  }

  console.log(`## ${entry.name}`);
  console.log(`npm ${command.map(shellQuote).join(' ')}`);

  if (write) {
    const existing = readTrustConfig(entry.name);
    if (existing.some((config) => matchesTrustConfig(config, { repository, workflowFile, environment }))) {
      console.log('Matching trusted-publishing relationship already exists; skipping.');
      console.log('');
      continue;
    }
  }

  const result = spawnSync('npm', command, {
    cwd: root,
    encoding: interactive ? undefined : 'utf8',
    stdio: interactive ? 'inherit' : ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });

  if (!interactive) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }

  if (result.status !== 0) {
    console.error('');
    console.error(`Failed to ${write ? 'configure' : 'plan'} trusted publishing for ${entry.name}.`);
    if (write) {
      console.error('npm may require a browser-based 2FA/auth confirmation before it allows trust changes.');
    }
    process.exit(result.status ?? 1);
  }

  console.log('');

  if (write && interactive && index < selected.length - 1) {
    sleep(2000);
  }
}

function shellQuote(value) {
  const stringValue = String(value);
  if (/^[A-Za-z0-9_./:@,%+-]+$/.test(stringValue)) return stringValue;
  return `'${stringValue.replaceAll("'", "'\\''")}'`;
}

function readTrustConfig(packageName) {
  const result = spawnSync('npm', ['trust', 'list', packageName, '--json'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });

  if (result.status !== 0) {
    if (result.stderr) process.stderr.write(result.stderr);
    return [];
  }

  const stdout = result.stdout.trim();
  if (!stdout) return [];
  try {
    const parsed = JSON.parse(stdout);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

function matchesTrustConfig(config, expected) {
  return (
    config?.type === 'github' &&
    config?.repository === expected.repository &&
    config?.file === expected.workflowFile &&
    (expected.environment ? config?.environment === expected.environment : !config?.environment)
  );
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}
