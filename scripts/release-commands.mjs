import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readArgValue } from './cli-arg-lib.mjs';
import { getRepoRoot, loadPackageSurface, sortReleaseEntries } from './package-surface-lib.mjs';
import { planNpmSurfaceRepairs, readNpmAuthState, readNpmVersions } from './npm-surface-lib.mjs';

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const jsonOutput = args.has('--json');
const includeExperimental = args.has('--include-experimental');
const onlyWave = readArgValue(rawArgs, 'wave');
const tagOverride = readArgValue(rawArgs, 'tag-override') ?? readArgValue(rawArgs, 'tag');
const stagingDir = readArgValue(rawArgs, 'staging-dir')
  ?? process.env.DECANTR_RELEASE_STAGING_DIR
  ?? join(tmpdir(), 'decantr-release-staging');
const publishAuthStrategy = (
  readArgValue(rawArgs, 'auth-strategy')
  ?? readArgValue(rawArgs, 'publish-auth')
  ?? process.env.DECANTR_PUBLISH_AUTH_STRATEGY
  ?? 'auto'
).toLowerCase();
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
const AUTH_STRATEGIES = new Set(['auto', 'oidc', 'token']);

if (!AUTH_STRATEGIES.has(publishAuthStrategy)) {
  console.error(`Unsupported publish auth strategy: ${publishAuthStrategy}`);
  console.error('Use one of: auto, oidc, token.');
  process.exit(1);
}

function resolvePublishSelection() {
  const selectionArgs = ['--dry-run', '--selection-json'];
  if (onlyWave) selectionArgs.push(`--wave=${onlyWave}`);
  if (onlyNames.size > 0) selectionArgs.push(`--only=${[...onlyNames].join(',')}`);
  if (includeExperimental) selectionArgs.push('--include-experimental');
  if (tagOverride) selectionArgs.push(`--tag-override=${tagOverride}`);

  const result = spawnSync(
    process.execPath,
    [join(root, 'scripts', 'publish-packages.mjs'), ...selectionArgs],
    {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    },
  );
  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }

  const selection = JSON.parse(result.stdout);
  const byName = new Map(surface.packages.map((entry) => [entry.name, entry]));
  return {
    ...selection,
    entries: sortReleaseEntries(selection.effectiveOnly.map((name) => byName.get(name))),
  };
}

const selection = resolvePublishSelection();
const selected = selection.entries;
const npmAuth = readNpmAuthState();
const repairPlan = planNpmSurfaceRepairs(surface);

function createPublishPackagesCommand(extraArgs = [], options = {}) {
  const commandOnlyNames = options.onlyNames ?? [...onlyNames];
  const parts = ['node scripts/publish-packages.mjs', ...extraArgs];
  if (onlyWave && options.includeWave !== false) parts.push(`--wave=${onlyWave}`);
  if (commandOnlyNames.length > 0) parts.push(`--only=${commandOnlyNames.join(',')}`);
  if (includeExperimental) parts.push('--include-experimental');
  if (tagOverride) parts.push(`--tag-override=${tagOverride}`);
  if (publishAuthStrategy !== 'auto') parts.push(`--auth-strategy=${publishAuthStrategy}`);
  parts.push(`--staging-dir=${stagingDir}`);
  return parts.join(' ');
}

function createVerifyPublishedPackagesCommand(extraArgs = []) {
  const parts = ['node scripts/verify-published-packages.mjs', ...extraArgs];
  if (onlyWave && onlyNames.size === 0) parts.push(`--wave=${onlyWave}`);
  if (onlyNames.size > 0) parts.push(`--only=${selection.effectiveOnly.join(',')}`);
  if (includeExperimental) parts.push('--include-experimental');
  if (tagOverride) parts.push(`--tag-override=${tagOverride}`);
  return parts.join(' ');
}

const commands = selected.map((entry) => {
  const cwd = join(root, entry.path);
  const packageJson = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
  const version = packageJson.version;
  const distTag = tagOverride || entry.defaultDistTag;
  const npmVersions = readNpmVersions(entry.name);
  const versionAlreadyPublished = npmVersions.published && Array.isArray(npmVersions.versions) && npmVersions.versions.includes(version);
  const commandOptions = { onlyNames: [entry.name], includeWave: false };
  const preflight = createPublishPackagesCommand(['--publish-dry-run'], commandOptions);
  const publish = createPublishPackagesCommand([], commandOptions);

  return {
    name: entry.name,
    path: entry.path,
    cwd,
    version,
    releaseWave: entry.releaseWave,
    distTag,
    versionAlreadyPublished,
    preflight,
    publish,
  };
});

const selectedNames = new Set(commands.map((entry) => entry.name));
const selectedRepairs = repairPlan
  .filter((result) => selectedNames.has(result.name))
  .map((result) => {
    const executableCommands = result.actions.flatMap((action) => {
      if (action.type === 'add-dist-tag') {
        return [`npm dist-tag add ${result.name}@${action.version} ${action.tag}`];
      }
      if (action.type === 'remove-dist-tag') {
        return [`npm dist-tag rm ${result.name} ${action.tag}`];
      }
      return [];
    });
    const manualSteps = result.actions.flatMap((action) => {
      if (action.type !== 'manual-latest-retag') return [];
      return [
        action.recommendedVersion
          ? `Decide whether npm latest should move from ${action.version} to stable ${action.recommendedVersion} for ${result.name}.`
          : `Publish a stable version for ${result.name} before moving npm latest away from prerelease ${action.version}.`,
      ];
    });

    return {
      name: result.name,
      findings: result.findings,
      executableCommands,
      manualSteps,
    };
  })
  .filter((result) => result.findings.length > 0);

const output = {
  generatedAt: new Date().toISOString(),
  npmAuth,
  filters: {
    wave: onlyWave,
    only: [...onlyNames],
    effectiveOnly: selection.effectiveOnly,
    expandedDependencies: selection.expandedDependencies,
    includeExperimental,
    tagOverride,
    publishAuthStrategy,
    stagingDir,
  },
  wrapperCommands: {
    auth: 'pnpm audit:npm-auth',
    preflight: createPublishPackagesCommand(['--publish-dry-run']),
    publish: createPublishPackagesCommand(),
    verify: createVerifyPublishedPackagesCommand(),
  },
  commands,
  npmRepairs: selectedRepairs,
};

if (jsonOutput) {
  console.log(JSON.stringify(output, null, 2));
  process.exit(0);
}

const lines = [
  '# Release Commands',
  '',
  `- Generated at: ${output.generatedAt}`,
  `- npm auth: ${npmAuth.authenticated ? `authenticated${npmAuth.username ? ` as ${npmAuth.username}` : ''}` : `not authenticated${npmAuth.error ? ` (${npmAuth.error})` : ''}`}`,
  `- Wave filter: ${onlyWave ?? 'all'}`,
  `- Only filter: ${onlyNames.size > 0 ? [...onlyNames].join(', ') : 'all'}`,
  `- Effective package closure: ${selection.effectiveOnly.join(', ') || 'none'}`,
  `- Expanded dependencies: ${selection.expandedDependencies.join(', ') || 'none'}`,
  `- Include experimental: ${includeExperimental ? 'yes' : 'no'}`,
  `- Tag override: ${tagOverride ?? 'none'}`,
  `- Publish auth: ${publishAuthStrategy} (${publishAuthStrategy === 'auto' ? 'CI uses OIDC first, then NPM_TOKEN fallback when available' : 'explicit'})`,
  `- Retained staging directory: ${stagingDir}`,
  `- Auth check: \`npm whoami\``,
  '',
  '## Wrapper Commands',
  '',
  `- auth: \`${output.wrapperCommands.auth}\``,
  `- preflight: \`${output.wrapperCommands.preflight}\``,
  `- publish: \`${output.wrapperCommands.publish}\``,
  `- verify: \`${output.wrapperCommands.verify}\``,
  '',
  'The wrapper commands stage each package once in a SHA-256-addressed retained set, verify applicable lane policy and artifact hashes, and publish those exact tarball paths before public npm verification.',
  'CI publishes use GitHub OIDC trusted publishing by default. If a package is missing npm trusted-publisher configuration and `NPM_TOKEN` is available, `auto` retries that package once with token auth and provenance disabled.',
  '',
];

if (commands.length === 0) {
  lines.push('No publishable packages matched the current filters.');
} else {
  for (const entry of commands) {
    lines.push(`## ${entry.name}`);
    lines.push(`- version: ${entry.version}`);
    lines.push(`- wave: ${entry.releaseWave}`);
    lines.push(`- dist-tag: ${entry.distTag}`);
    lines.push(`- already published: ${entry.versionAlreadyPublished ? 'yes' : 'no'}`);
    lines.push(`- preflight: \`${entry.preflight}\``);
    lines.push(`- publish: \`${entry.publish}\``);
    lines.push('');
  }
}

lines.push('## npm Repair Commands', '');
if (selectedRepairs.length === 0) {
  lines.push('- No npm dist-tag repair steps are currently needed for the selected packages.');
} else {
  for (const repair of selectedRepairs) {
    lines.push(`## ${repair.name} npm repairs`);
    for (const finding of repair.findings) {
      lines.push(`- finding: ${finding}`);
    }
    for (const command of repair.executableCommands) {
      lines.push(`- command: \`${command}\``);
    }
    for (const step of repair.manualSteps) {
      lines.push(`- manual: ${step}`);
    }
    lines.push('');
  }
}

console.log(`${lines.join('\n')}\n`);
