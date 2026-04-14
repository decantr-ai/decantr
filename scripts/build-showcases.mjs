import { spawnSync } from 'node:child_process';
import { getPublicShowcaseEntries, repoRoot } from './showcase-manifest.mjs';

const dryRun = process.argv.includes('--dry-run');
const activeShowcases = getPublicShowcaseEntries();

if (activeShowcases.length === 0) {
  console.error('No active showcase apps matched the current manifest/filter.');
  process.exit(1);
}

for (const entry of activeShowcases) {
  const filter = `./apps/showcase/${entry.slug}`;

  if (dryRun) {
    console.log(`[dry-run] pnpm --filter "${filter}" build`);
    continue;
  }

  console.log(`Building showcase: ${entry.slug}`);
  const result = spawnSync('pnpm', ['--filter', filter, 'build'], {
    cwd: repoRoot,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
