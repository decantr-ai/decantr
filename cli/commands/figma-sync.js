import { parseArgs } from 'node:util';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

export async function run() {
  const { values } = parseArgs({
    options: {
      token: { type: 'string' },
      file: { type: 'string' },
      style: { type: 'string', default: 'all' },
      input: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
    },
    strict: false,
  });

  console.log(`\n  ${BOLD}decantr figma:sync${RESET}\n`);

  const { syncFigmaTokens } = await import('../../tools/figma-upload.js');

  try {
    const result = await syncFigmaTokens({
      token: values.token,
      file: values.file,
      style: values.style,
      input: values.input,
      'dry-run': values['dry-run'],
      cwd: process.cwd(),
    });

    if (values['dry-run']) {
      console.log(`  ${DIM}Collections:${RESET} ${result.collections}`);
      console.log(`  ${DIM}Variables:${RESET} ${result.variables}`);
      console.log(`  ${DIM}Mode values:${RESET} ${result.modeValues}`);
      console.log(`\n  ${DIM}(dry run — no changes pushed)${RESET}\n`);
    } else {
      console.log(`  ${GREEN}✓${RESET} Synced ${BOLD}${result.variables}${RESET} variables across ${BOLD}${result.collections}${RESET} collection(s)`);
      console.log(`  ${GREEN}✓${RESET} ${result.modeValues} mode values set\n`);
    }
  } catch (e) {
    console.error(`\n  ✗ ${e.message}\n`);
    process.exitCode = 1;
  }
}
