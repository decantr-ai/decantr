import { cpSync, mkdirSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const showcaseRoot = join(import.meta.dirname, '..', 'apps', 'showcase');
const targetRoot = join(import.meta.dirname, '..', 'apps', 'web', 'public', 'showcase');

const entries = readdirSync(showcaseRoot, { withFileTypes: true });

for (const entry of entries) {
  if (!entry.isDirectory()) continue;

  const distDir = join(showcaseRoot, entry.name, 'dist');
  if (!existsSync(distDir)) continue;

  const targetDir = join(targetRoot, entry.name);

  // Clean target directory
  if (existsSync(targetDir)) {
    rmSync(targetDir, { recursive: true });
  }
  mkdirSync(targetDir, { recursive: true });

  // Copy dist contents
  cpSync(distDir, targetDir, { recursive: true });
  console.log(`Copied ${entry.name}/dist -> apps/web/public/showcase/${entry.name}/`);
}
