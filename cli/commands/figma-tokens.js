import { parseArgs } from 'node:util';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

export async function run() {
  const { values } = parseArgs({
    options: {
      style: { type: 'string', default: 'all' },
      format: { type: 'string', default: 'dtcg' },
      output: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
    },
    strict: false,
  });

  console.log(`\n  ${BOLD}decantr figma:tokens${RESET}\n`);

  const { generateFigmaTokens } = await import('../../tools/figma-tokens.js');

  try {
    const result = await generateFigmaTokens({
      style: values.style,
      format: values.format,
      output: values.output,
      'dry-run': values['dry-run'],
      cwd: process.cwd(),
    });

    if (values['dry-run']) {
      console.log(`  ${DIM}Styles:${RESET} ${result.styles.join(', ')}`);
      console.log(`  ${DIM}Tokens per style:${RESET} ~${Math.round(result.tokenCount / result.styles.length)}`);
      console.log(`  ${DIM}Shape tokens:${RESET} ${result.shapeTokenCount}`);
      console.log(`  ${DIM}Files:${RESET}`);
      for (const f of result.files) {
        console.log(`    ${DIM}→${RESET} ${f}`);
      }
      console.log();
    } else {
      console.log(`  ${GREEN}✓${RESET} Generated ${BOLD}${result.tokenCount}${RESET} tokens across ${BOLD}${result.styles.length}${RESET} style(s)`);
      console.log(`  ${GREEN}✓${RESET} ${result.shapeTokenCount} shape tokens (3 modes)`);
      console.log(`  ${DIM}Output:${RESET} ${result.files.length} files\n`);
      for (const f of result.files) {
        console.log(`    ${CYAN}→${RESET} ${f}`);
      }
      console.log();
    }
  } catch (e) {
    console.error(`\n  ✗ ${e.message}\n`);
    process.exitCode = 1;
  }
}
