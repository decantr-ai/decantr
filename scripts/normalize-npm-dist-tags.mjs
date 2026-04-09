import { execFileSync } from 'node:child_process';
import { getRepoRoot, loadPackageSurface } from './package-surface-lib.mjs';
import { planNpmSurfaceRepairs } from './npm-surface-lib.mjs';

const args = new Set(process.argv.slice(2));
const write = args.has('--write');
const root = getRepoRoot();
const surface = loadPackageSurface(root);
const results = planNpmSurfaceRepairs(surface);
const executableActions = [];
const manualActions = [];

for (const result of results) {
  for (const action of result.actions) {
    if (action.type === 'add-dist-tag') {
      executableActions.push({
        packageName: result.name,
        command: ['npm', 'dist-tag', 'add', `${result.name}@${action.version}`, action.tag],
        summary: `add ${action.tag} -> ${result.name}@${action.version}`,
      });
    } else if (action.type === 'remove-dist-tag') {
      executableActions.push({
        packageName: result.name,
        command: ['npm', 'dist-tag', 'rm', result.name, action.tag],
        summary: `remove ${action.tag} from ${result.name}`,
      });
    } else if (action.type === 'manual-latest-retag') {
      manualActions.push(`${result.name}: decide what should replace npm latest currently pointing to ${action.version}`);
    }
  }
}

if (!write) {
  console.log('npm dist-tag normalization dry run:\n');
  if (executableActions.length === 0 && manualActions.length === 0) {
    console.log('- No normalization actions needed.');
    process.exit(0);
  }
  for (const action of executableActions) {
    console.log(`- would ${action.summary}`);
  }
  for (const action of manualActions) {
    console.log(`- manual: ${action}`);
  }
  process.exit(0);
}

for (const action of executableActions) {
  execFileSync(action.command[0], action.command.slice(1), {
    cwd: root,
    stdio: 'inherit',
  });
}

console.log('npm dist-tag normalization applied.');
if (manualActions.length > 0) {
  console.log('');
  console.log('Manual follow-up still required:');
  for (const action of manualActions) {
    console.log(`- ${action}`);
  }
}
