import { parseArgs } from 'node:util';

export async function run() {
  const { values } = parseArgs({
    options: {
      force: { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
      page: { type: 'string' },
    },
    strict: false,
  });

  const { generate } = await import('../../tools/generate.js');

  try {
    await generate({
      cwd: process.cwd(),
      force: values.force,
      dryRun: values['dry-run'],
      pageFilter: values.page || null,
    });
  } catch (e) {
    console.error(`\n  ✗ ${e.message}\n`);
    process.exitCode = 1;
  }
}
