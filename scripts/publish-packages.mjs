import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { readArgValue } from './cli-arg-lib.mjs';
import { getRepoRoot, loadPackageSurface, sortReleaseEntries } from './package-surface-lib.mjs';
import { readNpmVersions } from './npm-surface-lib.mjs';

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const includeExperimental = args.has('--include-experimental');
const dryRun = args.has('--dry-run');
const publishDryRun = args.has('--publish-dry-run');
const ciProvenance = process.env.GITHUB_ACTIONS === 'true' || process.env.CI === 'true';
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
  const npmVersions = publishDryRun ? readNpmVersions(entry.name) : null;
  const versionAlreadyPublished = Boolean(
    publishDryRun
    && npmVersions?.published
    && Array.isArray(npmVersions.versions)
    && npmVersions.versions.includes(packageVersion),
  );
  const cmd = versionAlreadyPublished
    ? ['pack', '--dry-run']
    : ['publish', '--access', 'public', ...(ciProvenance ? ['--provenance'] : []), '--tag', distTag];
  if (publishDryRun && !versionAlreadyPublished) {
    cmd.push('--dry-run');
  }

  const prefix = publishDryRun ? '[publish-dry-run] ' : dryRun ? '[dry-run] ' : '';
  const action = versionAlreadyPublished ? 'Packing' : 'Publishing';
  const suffix = versionAlreadyPublished ? ` (version ${packageVersion} is already published)` : ` with tag ${distTag}`;
  console.log(`${prefix}${action} ${entry.name} from ${entry.path}${suffix} (wave ${entry.releaseWave}, order ${entry.publishOrder})`);

  if (dryRun) continue;

  const result = spawnSync('npm', cmd, {
    cwd,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
