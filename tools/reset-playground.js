// Resets playground/ to a clean init skeleton state.
// Run: npm run reset (or: node tools/reset-playground.js)

import { rm, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  packageJson, configJson, indexHtml, manifestJson,
  claudeMd, appJs
} from './init-templates.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const pg = join(root, 'playground');

// 0. Kill any dev server on port 4200
try {
  const pid = execSync('lsof -ti :4200', { encoding: 'utf8' }).trim();
  if (pid) {
    process.kill(Number(pid));
    console.log(`Killed dev server (pid ${pid}) on port 4200.`);
  }
} catch {
  // nothing listening on 4200
}

// 1. Delete generated content
await rm(join(pg, 'src'), { recursive: true, force: true });
await rm(join(pg, 'test'), { recursive: true, force: true });
await rm(join(pg, 'dist'), { recursive: true, force: true });
await rm(join(pg, 'scripts'), { recursive: true, force: true });
await rm(join(pg, 'CLAUDE.md'), { force: true });
await rm(join(pg, 'AGENTS.md'), { force: true });
await rm(join(pg, 'public', 'vendor'), { recursive: true, force: true });

// 2. Re-create directories
await mkdir(join(pg, 'src', 'pages'), { recursive: true });
await mkdir(join(pg, 'src', 'components'), { recursive: true });
await mkdir(join(pg, '.decantr'), { recursive: true });

// 3. Write skeleton files
const name = 'playground';
const files = [
  ['package.json', packageJson(name)],
  ['decantr.config.json', configJson(name)],
  ['public/index.html', indexHtml(name)],
  ['.decantr/manifest.json', manifestJson(name)],
  ['CLAUDE.md', claudeMd(name)],
  ['src/app.js', appJs()]
];

for (const [path, content] of files) {
  await writeFile(join(pg, path), content + '\n');
}

// 4. Copy AGENTS.md from framework root
await copyFile(join(root, 'AGENTS.md'), join(pg, 'AGENTS.md'));

console.log('Playground reset to init skeleton state.');
console.log('Run: cd playground && npx decantr dev');
