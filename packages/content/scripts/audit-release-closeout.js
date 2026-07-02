#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const jsonOutput = args.has('--json');
const allowDirty = args.has('--allow-dirty');
const monorepoArg = readArgValue('--monorepo');
const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const defaultMonorepo = resolve(repoRoot, '..', 'decantr-monorepo');
const monorepoRoot = monorepoArg ? resolve(monorepoArg) : defaultMonorepo;
const checks = [];
const generatedAt = new Date().toISOString();

const packageJson = readJson(join(repoRoot, 'package.json'));
const packageLock = existsSync(join(repoRoot, 'package-lock.json'))
  ? readJson(join(repoRoot, 'package-lock.json'))
  : null;
const cliVersion = packageJson.devDependencies?.['@decantr/cli'];
const telemetryVersion = packageJson.dependencies?.['@decantr/telemetry'];

const status = git(['status', '--short'], { allowFailure: true })?.trim() ?? '';
addCheck(
  'git',
  'worktree clean',
  !status || allowDirty ? 'pass' : 'fail',
  status ? 'dirty allowed by --allow-dirty' : 'clean',
);

addCheck(
  'dependency',
  '@decantr/cli is exact-pinned',
  isExactSemver(cliVersion) ? 'pass' : 'fail',
  cliVersion ?? 'missing',
);

addCheck(
  'dependency',
  '@decantr/telemetry is exact-pinned',
  isExactSemver(telemetryVersion) ? 'pass' : 'fail',
  telemetryVersion ?? 'missing',
);

if (packageLock) {
  const rootCli = packageLock.packages?.['']?.devDependencies?.['@decantr/cli'];
  const installedCli = packageLock.packages?.['node_modules/@decantr/cli']?.version;
  addCheck(
    'lockfile',
    '@decantr/cli root pin',
    rootCli === cliVersion ? 'pass' : 'fail',
    `package.json=${cliVersion ?? 'missing'}, lockfile=${rootCli ?? 'missing'}`,
  );
  addCheck(
    'lockfile',
    '@decantr/cli resolved version',
    installedCli === cliVersion ? 'pass' : 'fail',
    `package.json=${cliVersion ?? 'missing'}, node_modules lock=${installedCli ?? 'missing'}`,
  );
} else {
  addCheck('lockfile', 'package-lock present', 'fail', 'package-lock.json is missing');
}

if (existsSync(join(monorepoRoot, 'packages', 'cli', 'package.json'))) {
  const monorepoCli = readJson(join(monorepoRoot, 'packages', 'cli', 'package.json')).version;
  addCheck(
    'monorepo',
    '@decantr/cli matches sibling monorepo',
    cliVersion === monorepoCli ? 'pass' : 'fail',
    `content=${cliVersion ?? 'missing'}, monorepo=${monorepoCli ?? 'missing'}`,
  );
} else {
  addCheck(
    'monorepo',
    'sibling monorepo comparison',
    monorepoArg ? 'fail' : 'info',
    `No monorepo found at ${monorepoRoot}`,
  );
}

for (const schema of [
  'schemas/essence.v4.json',
  'schemas/pattern.v2.json',
  'schemas/theme.v1.json',
  'schemas/blueprint.v1.json',
  'schemas/archetype.v2.json',
  'schemas/shell.v1.json',
]) {
  addCheck(
    'schema',
    schema,
    existsSync(join(repoRoot, schema)) ? 'pass' : 'fail',
    existsSync(join(repoRoot, schema)) ? 'present' : 'missing',
  );
}

const failures = checks.filter((check) => check.status === 'fail');
const output = {
  generatedAt,
  summary: {
    failed: failures.length,
    passed: checks.filter((check) => check.status === 'pass').length,
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

function readArgValue(name) {
  const prefix = `${name}=`;
  const inline = rawArgs.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = rawArgs.indexOf(name);
  if (index >= 0) return rawArgs[index + 1] ?? null;
  return null;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function git(gitArgs, options = {}) {
  try {
    return execFileSync('git', gitArgs, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    if (options.allowFailure) return null;
    throw error;
  }
}

function isExactSemver(value) {
  return typeof value === 'string' && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(value);
}

function addCheck(scope, name, status, detail) {
  checks.push({ scope, name, status, detail });
}

function renderMarkdown(report) {
  const lines = [
    '# decantr-content Release Closeout Audit',
    '',
    `- Generated at: ${report.generatedAt}`,
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
    lines.push('Content closeout is not complete. Fix failed checks, then rerun `npm run release:closeout`.');
  } else {
    lines.push('Content closeout is complete: CLI pins, lockfile, schemas, and local git state are aligned.');
  }

  return `${lines.join('\n')}\n`;
}

function escapeCell(value) {
  return String(value ?? '')
    .replaceAll('\\', '\\\\')
    .replaceAll('|', '\\|')
    .replaceAll('\n', ' ');
}
