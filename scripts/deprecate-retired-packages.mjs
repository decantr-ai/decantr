import { spawnSync } from 'node:child_process';
import { getRepoRoot, loadPackageRetirements } from './package-surface-lib.mjs';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const onlyArg = [...args].find((arg) => arg.startsWith('--only='));
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
const retirements = loadPackageRetirements(root);
const selected = (retirements.packages ?? []).filter((entry) => {
  if (onlyNames.size === 0) return true;
  return onlyNames.has(entry.name);
});

if (selected.length === 0) {
  console.log('No retired packages selected.');
  process.exit(0);
}

for (const entry of selected) {
  const cmd = ['deprecate', entry.name, entry.message];
  console.log(`${dryRun ? '[dry-run] ' : ''}npm ${cmd.join(' ')}`);

  if (dryRun) continue;

  const result = spawnSync('npm', cmd, {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
