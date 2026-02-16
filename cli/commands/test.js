import { spawn } from 'node:child_process';
import { glob } from 'node:fs';
import { join } from 'node:path';

export async function run() {
  const cwd = process.cwd();
  const args = process.argv.slice(3);
  const watch = args.includes('--watch');

  const testArgs = ['--test'];
  if (watch) testArgs.push('--watch');

  // Find test files
  const testFiles = [];
  const pattern = join(cwd, 'test', '**', '*.test.js');

  // Use node:fs glob (Node 22+)
  const { glob: fsGlob } = await import('node:fs/promises');
  for await (const file of fsGlob(pattern)) {
    testFiles.push(file);
  }

  if (testFiles.length === 0) {
    console.log('No test files found in test/**/*.test.js');
    return;
  }

  testArgs.push(...testFiles);

  const child = spawn('node', testArgs, {
    cwd,
    stdio: 'inherit'
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}
