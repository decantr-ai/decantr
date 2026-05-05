import { spawnSync } from 'node:child_process';
import { repoRoot } from './showcase-manifest.mjs';

const dryRun = process.argv.includes('--dry-run');

const filter = './apps/showcase-host';

if (dryRun) {
  console.log(`[dry-run] pnpm --filter "${filter}" build`);
  process.exit(0);
}

console.log('Building showcase host.');
const result = spawnSync('pnpm', ['--filter', filter, 'build'], {
  cwd: repoRoot,
  stdio: 'inherit',
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
