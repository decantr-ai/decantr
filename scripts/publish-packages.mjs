import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { readArgValue } from './cli-arg-lib.mjs';
import { getRepoRoot, loadPackageSurface, sortReleaseEntries } from './package-surface-lib.mjs';
import { assertNpmPackageWriteAccess, readNpmVersions } from './npm-surface-lib.mjs';

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const includeExperimental = args.has('--include-experimental');
const dryRun = args.has('--dry-run');
const publishDryRun = args.has('--publish-dry-run');
const ciProvenance = process.env.GITHUB_ACTIONS === 'true' || process.env.CI === 'true';
const requestedAuthStrategy = (
  readArgValue(rawArgs, 'auth-strategy')
  ?? readArgValue(rawArgs, 'publish-auth')
  ?? process.env.DECANTR_PUBLISH_AUTH_STRATEGY
  ?? 'auto'
).toLowerCase();
const shouldCheckPublishedVersions = publishDryRun || !dryRun;
const tagOverride = readArgValue(rawArgs, 'tag-override') ?? readArgValue(rawArgs, 'tag');
const onlyWave = readArgValue(rawArgs, 'wave');
const onlyNames = new Set(
  readArgValue(rawArgs, 'only')
    ? readArgValue(rawArgs, 'only')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : [],
);
const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
];
const AUTH_STRATEGIES = new Set(['auto', 'oidc', 'token']);

if (!AUTH_STRATEGIES.has(requestedAuthStrategy)) {
  console.error(`Unsupported publish auth strategy: ${requestedAuthStrategy}`);
  console.error('Use one of: auto, oidc, token.');
  process.exit(1);
}

function parsePackOutput(stdout) {
  const parsed = JSON.parse(stdout.trim());
  const packResult = Array.isArray(parsed) ? parsed[0] : parsed;

  if (!packResult?.filename || typeof packResult.filename !== 'string') {
    throw new Error('pnpm pack did not report a tarball filename.');
  }

  return packResult.filename;
}

function assertNoWorkspaceProtocolDependencies(packageJson, label) {
  const leaks = [];

  for (const field of DEPENDENCY_FIELDS) {
    const dependencies = packageJson[field];
    if (!dependencies || typeof dependencies !== 'object' || Array.isArray(dependencies)) continue;

    for (const [dependencyName, dependencyVersion] of Object.entries(dependencies)) {
      if (typeof dependencyVersion === 'string' && dependencyVersion.startsWith('workspace:')) {
        leaks.push(`${field}.${dependencyName}=${dependencyVersion}`);
      }
    }
  }

  if (leaks.length > 0) {
    throw new Error(`${label} contains workspace protocol dependencies: ${leaks.join(', ')}`);
  }
}

function auditPackedManifest(entry, cwd, packageVersion) {
  const tempPackDir = mkdtempSync(join(tmpdir(), 'decantr-pack-'));

  try {
    const packResult = spawnSync('pnpm', ['pack', '--pack-destination', tempPackDir, '--json'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    });

    if (packResult.status !== 0) {
      if (packResult.stdout) process.stdout.write(packResult.stdout);
      if (packResult.stderr) process.stderr.write(packResult.stderr);
      process.exit(packResult.status ?? 1);
    }

    const tarballPath = parsePackOutput(packResult.stdout);
    const manifestResult = spawnSync('tar', ['-xOf', tarballPath, 'package/package.json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    if (manifestResult.status !== 0) {
      if (manifestResult.stdout) process.stdout.write(manifestResult.stdout);
      if (manifestResult.stderr) process.stderr.write(manifestResult.stderr);
      process.exit(manifestResult.status ?? 1);
    }

    const packedPackageJson = JSON.parse(manifestResult.stdout);
    if (packedPackageJson.name !== entry.name) {
      throw new Error(`Packed manifest name mismatch: expected ${entry.name}, found ${packedPackageJson.name}`);
    }
    if (packedPackageJson.version !== packageVersion) {
      throw new Error(
        `Packed manifest version mismatch for ${entry.name}: expected ${packageVersion}, found ${packedPackageJson.version}`,
      );
    }

    assertNoWorkspaceProtocolDependencies(packedPackageJson, `${entry.name}@${packageVersion} packed manifest`);
  } finally {
    rmSync(tempPackDir, { recursive: true, force: true });
  }
}

function hasClassicPublishToken() {
  return Boolean(process.env.NODE_AUTH_TOKEN || process.env.NPM_TOKEN);
}

function isPackageVersionPublished(packageName, packageVersion) {
  const npmVersions = readNpmVersions(packageName);
  return Boolean(
    npmVersions?.published
    && Array.isArray(npmVersions.versions)
    && npmVersions.versions.includes(packageVersion),
  );
}

function getPrimaryAuthMode() {
  if (requestedAuthStrategy === 'token') return 'token';
  if (requestedAuthStrategy === 'oidc') return 'oidc';
  return ciProvenance ? 'oidc' : 'token';
}

function createPublishCommand({ distTag, mode }) {
  return [
    'publish',
    '--access',
    'public',
    ...(mode === 'oidc' && ciProvenance ? ['--provenance'] : []),
    '--tag',
    distTag,
    '--no-git-checks',
    ...(publishDryRun ? ['--dry-run'] : []),
  ];
}

function createPublishEnv(mode) {
  const env = { ...process.env };

  if (mode !== 'token') {
    return env;
  }

  if (env.NPM_TOKEN && !env.NODE_AUTH_TOKEN) {
    env.NODE_AUTH_TOKEN = env.NPM_TOKEN;
  }

  // Force the classic token/user-auth path for fallback publishes.
  // Otherwise npm may prefer the ambient GitHub OIDC variables again.
  delete env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  delete env.ACTIONS_ID_TOKEN_REQUEST_URL;
  env.NPM_CONFIG_PROVENANCE = 'false';

  return env;
}

function describeAuthMode(mode) {
  if (mode === 'oidc') return 'GitHub OIDC trusted publishing';
  return ciProvenance ? 'npm token fallback' : 'local npm auth';
}

function runPublishCommand({ cwd, cmd, mode }) {
  const result = spawnSync('pnpm', cmd, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: createPublishEnv(mode),
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  return result;
}

function explainPublishFailure({ entry, mode, packageVersion }) {
  if (mode !== 'oidc') return;

  console.error(
    [
      '',
      `OIDC publish failed for ${entry.name}@${packageVersion}.`,
      'For GitHub trusted publishing, npm package settings must include:',
      '- Publisher: GitHub Actions',
      '- Organization/repository: decantr-ai/decantr',
      '- Workflow filename: publish.yml',
      '- Allowed action: npm publish',
      'Alternatively set NPM_TOKEN in GitHub Actions and rerun with DECANTR_PUBLISH_AUTH_STRATEGY=token or workflow input publish_auth_strategy=token.',
      '',
    ].join('\n'),
  );
}

function publishPackage({ entry, cwd, distTag, packageVersion }) {
  const primaryMode = getPrimaryAuthMode();
  const primaryCmd = createPublishCommand({ distTag, mode: primaryMode });

  console.log(`Using ${describeAuthMode(primaryMode)} for ${entry.name}.`);

  if (!publishDryRun && primaryMode === 'token' && ciProvenance && !hasClassicPublishToken()) {
    throw new Error(
      [
        `Cannot publish ${entry.name} with token auth because neither NODE_AUTH_TOKEN nor NPM_TOKEN is set.`,
        'Add an npm automation token as the NPM_TOKEN GitHub Actions secret or use OIDC trusted publishing.',
      ].join('\n'),
    );
  }

  const primaryResult = runPublishCommand({ cwd, cmd: primaryCmd, mode: primaryMode });

  if (primaryResult.status === 0) {
    return;
  }

  if (isPackageVersionPublished(entry.name, packageVersion)) {
    console.warn(
      `pnpm publish exited non-zero for ${entry.name}, but npm now lists ${packageVersion}; continuing to the verifier.`,
    );
    return;
  }

  const canFallbackToToken = requestedAuthStrategy === 'auto'
    && primaryMode === 'oidc'
    && ciProvenance
    && hasClassicPublishToken();

  if (!canFallbackToToken) {
    explainPublishFailure({ entry, mode: primaryMode, packageVersion });
    process.exit(primaryResult.status ?? 1);
  }

  console.warn(
    `OIDC publish failed for ${entry.name}; retrying once with npm token fallback and provenance disabled.`,
  );
  const fallbackCmd = createPublishCommand({ distTag, mode: 'token' });
  const fallbackResult = runPublishCommand({ cwd, cmd: fallbackCmd, mode: 'token' });

  if (fallbackResult.status !== 0) {
    process.exit(fallbackResult.status ?? 1);
  }
}

if (dryRun && publishDryRun) {
  console.error('Use either --dry-run (selection only) or --publish-dry-run (npm publish preflight), not both.');
  process.exit(1);
}

const root = getRepoRoot();
const surface = loadPackageSurface(root);

const selected = sortReleaseEntries(surface.packages).filter((entry) => {
  if (!entry.publish) return false;
  if (!includeExperimental && entry.maturity === 'experimental') return false;
  if (onlyNames.size > 0 && !onlyNames.has(entry.name)) return false;
  if (onlyWave && entry.releaseWave !== onlyWave) return false;
  return true;
});

if (selected.length === 0) {
  console.log('No packages selected for publish.');
  process.exit(0);
}

for (const entry of selected) {
  const distTag = tagOverride || entry.defaultDistTag;
  const cwd = join(root, entry.path);
  const packageJson = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
  const packageVersion = packageJson.version;
  const npmVersions = shouldCheckPublishedVersions ? readNpmVersions(entry.name) : null;
  const versionAlreadyPublished = Boolean(
    shouldCheckPublishedVersions
    && npmVersions?.published
    && Array.isArray(npmVersions.versions)
    && npmVersions.versions.includes(packageVersion),
  );
  const prefix = publishDryRun ? '[publish-dry-run] ' : dryRun ? '[dry-run] ' : '';

  if (versionAlreadyPublished && !publishDryRun) {
    console.log(
      `${prefix}Skipping ${entry.name} from ${entry.path} because version ${packageVersion} is already published (wave ${entry.releaseWave}, order ${entry.publishOrder})`,
    );
    continue;
  }

  const action = versionAlreadyPublished ? 'Auditing packed manifest for' : 'Publishing';
  const suffix = versionAlreadyPublished ? ` (version ${packageVersion} is already published)` : ` with tag ${distTag}`;
  console.log(`${prefix}${action} ${entry.name} from ${entry.path}${suffix} (wave ${entry.releaseWave}, order ${entry.publishOrder})`);

  if (dryRun) continue;

  const primaryMode = getPrimaryAuthMode();
  if (!publishDryRun && primaryMode === 'token' && !ciProvenance && !hasClassicPublishToken()) {
    assertNpmPackageWriteAccess(entry.name);
  } else if (!publishDryRun && primaryMode === 'oidc') {
    console.log('Skipping npm write-access precheck; GitHub OIDC publishing obtains npm credentials at publish time.');
  }

  auditPackedManifest(entry, cwd, packageVersion);

  if (versionAlreadyPublished) continue;

  publishPackage({ entry, cwd, distTag, packageVersion });
}
