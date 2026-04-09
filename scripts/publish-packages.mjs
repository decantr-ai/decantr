import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { getRepoRoot, loadPackageSurface } from './package-surface-lib.mjs';

const args = new Set(process.argv.slice(2));
const tagOverrideArg = [...args].find((arg) => arg.startsWith('--tag-override='));
const onlyArg = [...args].find((arg) => arg.startsWith('--only='));
const includeExperimental = args.has('--include-experimental');
const dryRun = args.has('--dry-run');
const tagOverride = tagOverrideArg ? tagOverrideArg.split('=')[1] : null;
const onlyNames = new Set(
  onlyArg
    ? onlyArg
        .split('=')[1]
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : [],
);

const root = getRepoRoot();
const surface = loadPackageSurface(root);

const selected = surface.packages.filter((entry) => {
  if (!entry.publish) return false;
  if (!includeExperimental && entry.maturity === 'experimental') return false;
  if (onlyNames.size > 0 && !onlyNames.has(entry.name)) return false;
  return true;
});

if (selected.length === 0) {
  console.log('No packages selected for publish.');
  process.exit(0);
}

for (const entry of selected) {
  const distTag = tagOverride || entry.defaultDistTag;
  const cwd = join(root, entry.path);
  const cmd = ['publish', '--access', 'public', '--provenance', '--tag', distTag];

  console.log(`${dryRun ? '[dry-run] ' : ''}Publishing ${entry.name} from ${entry.path} with tag ${distTag}`);

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
