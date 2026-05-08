import { cpSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const docsDir = join(repoRoot, 'docs');
const publicDir = join(repoRoot, 'public');

if (!existsSync(join(docsDir, 'index.html'))) {
  throw new Error('Expected docs/index.html before preparing the Vercel static output.');
}

rmSync(publicDir, { recursive: true, force: true });
cpSync(docsDir, publicDir, { recursive: true });

console.log(`Prepared Vercel static output: ${publicDir}`);
