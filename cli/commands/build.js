import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function run() {
  const cwd = process.cwd();
  let config = {
    build: {
      outDir: 'dist',
      inline: false,
      sourcemap: true,
      analyze: true,
      incremental: true,
      codeSplit: true,
      purgeCSS: true,
      treeShake: true
    }
  };

  try {
    const raw = await readFile(join(cwd, 'decantr.config.json'), 'utf-8');
    const userConfig = JSON.parse(raw);
    config.build = { ...config.build, ...(userConfig.build || {}) };
  } catch (e) {
    // Use defaults
  }

  // CLI flag overrides
  const args = process.argv.slice(2);
  if (args.includes('--no-sourcemap')) config.build.sourcemap = false;
  if (args.includes('--no-analyze')) config.build.analyze = false;
  if (args.includes('--no-incremental')) config.build.incremental = false;
  if (args.includes('--no-code-split')) config.build.codeSplit = false;
  if (args.includes('--no-purge')) config.build.purgeCSS = false;
  if (args.includes('--no-tree-shake')) config.build.treeShake = false;

  const { build } = await import('../../tools/builder.js');
  await build(cwd, config.build);
}
