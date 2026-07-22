#!/usr/bin/env node
import { fileURLToPath } from 'node:url';

export async function smokeEvaluatorRuntime(options) {
  if (options.browsersPath) process.env.PLAYWRIGHT_BROWSERS_PATH = options.browsersPath;
  const [{ chromium }, { default: AxeBuilder }] = await Promise.all([
    import('playwright'),
    import('@axe-core/playwright'),
  ]);
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 320, height: 640 } });
    const page = await context.newPage();
    await page.setContent(
      '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Evaluator runtime</title></head><body><main><h1>Evaluator runtime</h1><button type="button">Ready</button></main></body></html>',
    );
    const result = await new AxeBuilder({ page }).analyze();
    const button = await page.getByRole('button', { name: 'Ready' }).boundingBox();
    if (!button || button.width <= 0 || button.height <= 0 || result.violations.length > 0) {
      throw new Error(
        `browser geometry or accessibility smoke check failed: ${result.violations.map((item) => item.id).join(', ') || 'missing geometry'}`,
      );
    }
    return {
      browser: await browser.version(),
      accessibilityViolations: result.violations.length,
      viewport: await page.viewportSize(),
    };
  } finally {
    await browser.close();
  }
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--browsers-path') options.browsersPath = argv[++index];
    else throw new Error(`Unknown option: ${argument}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await smokeEvaluatorRuntime(parseArgs(process.argv.slice(2)));
    console.log(JSON.stringify({ ok: true, ...result }));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
