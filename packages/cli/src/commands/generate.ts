import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { parseArgs } from 'node:util';
import { validateEssence } from '@decantr/essence-spec';
import type { EssenceFile, GeneratorTarget } from '@decantr/essence-spec';
import { success, error, heading, info, warn } from '../output.js';

export async function run(): Promise<void> {
  const { values } = parseArgs({
    options: {
      target: { type: 'string', short: 't' },
      'dry-run': { type: 'boolean', default: false },
      force: { type: 'boolean', short: 'f', default: false },
      page: { type: 'string' },
    },
    strict: false,
    allowPositionals: true,
  });

  const cwd = process.cwd();
  const dryRun = values['dry-run'] ?? false;
  const force = values.force ?? false;
  const pageFilter = values.page as string | undefined;

  // Read essence
  const essencePath = join(cwd, 'decantr.essence.json');
  let raw: string;
  try {
    raw = await readFile(essencePath, 'utf-8');
  } catch {
    console.error(error('No decantr.essence.json found. Run "decantr init" first.'));
    process.exitCode = 1;
    return;
  }

  let essence: EssenceFile;
  try {
    essence = JSON.parse(raw);
  } catch (e) {
    console.error(error(`Invalid JSON: ${(e as Error).message}`));
    process.exitCode = 1;
    return;
  }

  // Validate before generating
  const validation = validateEssence(essence);
  if (!validation.valid) {
    console.error(error('Essence validation failed:'));
    for (const err of validation.errors) {
      console.error(error(`  ${err}`));
    }
    if (!force) {
      console.error(info('Use --force to generate anyway.'));
      process.exitCode = 1;
      return;
    }
    console.log(warn('Generating despite validation errors (--force)'));
  }

  // Determine target from flag or essence
  const target: GeneratorTarget = (values.target as GeneratorTarget) ?? essence.target ?? 'react';

  // Run generator pipeline
  console.log(heading(`Generating ${target} output...`));

  try {
    const { runPipeline } = await import('@decantr/generator-core');
    const plugin = target === 'react'
      ? await import('@decantr/generator-react').then((m) => m.createReactPlugin())
      : await import('@decantr/generator-decantr').then((m) => m.createDecantrPlugin());

    const contentRoot = join(cwd, 'node_modules', '@decantr', 'content');
    const result = await runPipeline(essence, {
      plugin,
      projectRoot: cwd,
      contentRoot,
      overridePaths: [join(cwd, 'src', 'registry-content')],
      pageFilter,
      dryRun,
      force,
    });

    if (dryRun) {
      console.log(heading('Dry run — files that would be generated:'));
      for (const file of result.files) {
        console.log(info(file.path));
      }
      console.log(`\n  ${result.files.length} file(s) total`);
      return;
    }

    for (const file of result.files) {
      const fullPath = join(cwd, file.path);
      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, file.content);
      console.log(success(file.path));
    }

    console.log(heading(`Generated ${result.files.length} file(s)`));
  } catch (e) {
    console.error(error(`Generator failed: ${(e as Error).message}`));
    process.exitCode = 1;
  }
}
