import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function run() {
  const cwd = process.cwd();
  let config = { build: { outDir: 'dist', inline: false, sourcemap: false } };

  try {
    const raw = await readFile(join(cwd, 'decantr.config.json'), 'utf-8');
    config = JSON.parse(raw);
  } catch (e) {
    // Use defaults
  }

  const { build } = await import('../../tools/builder.js');
  await build(cwd, config.build || {});
}
