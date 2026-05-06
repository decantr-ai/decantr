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
const shouldCheckPublishedVersions = publishDryRun || !dryRun;
const tagOverride = readArgValue(rawArgs, 'tag-override');
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

  const cmd = versionAlreadyPublished
    ? null
    : ['publish', '--access', 'public', ...(ciProvenance ? ['--provenance'] : []), '--tag', distTag, '--no-git-checks'];
  if (publishDryRun && !versionAlreadyPublished) {
    cmd.push('--dry-run');
  }

  const action = versionAlreadyPublished ? 'Auditing packed manifest for' : 'Publishing';
  const suffix = versionAlreadyPublished ? ` (version ${packageVersion} is already published)` : ` with tag ${distTag}`;
  console.log(`${prefix}${action} ${entry.name} from ${entry.path}${suffix} (wave ${entry.releaseWave}, order ${entry.publishOrder})`);

  if (dryRun) continue;

  if (!publishDryRun) {
    assertNpmPackageWriteAccess(entry.name);
  }

  auditPackedManifest(entry, cwd, packageVersion);

  if (versionAlreadyPublished) continue;

  const result = spawnSync('pnpm', cmd, {
    cwd,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
