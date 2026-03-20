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

  // Experimental compiler flag
  const useExperimentalCompiler = args.includes('--experimental-compiler');

  if (useExperimentalCompiler) {
    console.log('\x1b[33m[experimental]\x1b[0m Using new compiler architecture\n');
    const { build } = await import('../../tools/compiler/index.js');
    const entry = join(cwd, 'src/app.js');
    const outDir = join(cwd, config.build.outDir);

    const result = await build({
      entry,
      outDir,
      minify: true,
      sourceMaps: config.build.sourcemap,
      validate: true,
      dev: false
    });

    if (result.success) {
      const { formatBuildSummary } = await import('../../tools/compiler/reporter.js');
      console.log(formatBuildSummary(result));
    } else {
      process.exit(1);
    }
  } else {
    const { build } = await import('../../tools/builder.js');
    await build(cwd, config.build);
  }
}
