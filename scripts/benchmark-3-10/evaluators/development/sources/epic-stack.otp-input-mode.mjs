#!/usr/bin/env node
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { mkdir, mkdtemp, open, readFile, rm, utimes, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

const checks = [];

function record(id, passed, detail, accessibility = false) {
  checks.push({ id, passed: Boolean(passed), ...(detail === undefined ? {} : { detail }), ...(accessibility ? { accessibility: true } : {}) });
}

function parseArgs(argv) {
  const options = { projectPath: '.' };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--workspace') options.workspace = resolve(argv[++index]);
    else if (argv[index] === '--project-path') options.projectPath = argv[++index];
    else if (argv[index] === '--evaluator-runtime') options.evaluatorRuntime = resolve(argv[++index]);
    else if (argv[index] === '--prepare-host-fixture') options.prepareHostFixture = true;
    else throw new Error(`Unknown option: ${argv[index]}`);
  }
  if (!options.workspace || (!options.prepareHostFixture && !options.evaluatorRuntime)) {
    throw new Error('--workspace and --evaluator-runtime are required for behavior evaluation');
  }
  return options;
}

function contained(root, target) {
  const relation = relative(root, target);
  return relation === '' || (!relation.startsWith(`..${sep}`) && relation !== '..' && !isAbsolute(relation));
}

function moduleSpecifier(from, target) {
  const path = relative(from, target).split(sep).join('/');
  return path.startsWith('.') ? path : `./${path}`;
}

async function listen(server) {
  await new Promise((accept, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', accept);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Harness server did not bind a TCP port');
  return `http://127.0.0.1:${address.port}`;
}

async function closeServer(server) {
  await new Promise((accept) => server.close(() => accept()));
}

function emit() {
  const failures = checks.filter((check) => !check.passed);
  const result = {
    passed: checks.length > 0 && failures.length === 0,
    metrics: {
      governanceViolations: 0,
      accessibilityViolations: failures.filter((check) => check.accessibility).length,
      visualScore: checks.length === 0 ? 0 : Math.round((100 * (checks.length - failures.length)) / checks.length),
      behaviorChecksPassed: checks.length - failures.length,
      behaviorChecksTotal: checks.length,
    },
    checks,
  };
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (!result.passed) process.exitCode = 1;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const projectRoot = resolve(options.workspace, options.projectPath);
  if (!contained(options.workspace, projectRoot)) throw new Error('Project path escapes workspace');

  if (options.prepareHostFixture) {
    const fixturePath = join(projectRoot, 'tests', 'prisma', 'base.db');
    await mkdir(dirname(fixturePath), { recursive: true });
    const fixture = await open(fixturePath, 'a');
    await fixture.close();
    await utimes(fixturePath, new Date(0), new Date(0));
    record('host-test-fixture-prepared', true);
    return;
  }

  const runtimeRequire = createRequire(join(options.evaluatorRuntime, 'package.json'));
  const candidateRequire = createRequire(join(projectRoot, 'package.json'));
  const { chromium } = runtimeRequire('playwright');
  const AxeBuilder = runtimeRequire('@axe-core/playwright');
  const esbuild = candidateRequire('esbuild');

  const harnessRoot = await mkdtemp(join(projectRoot, '.evaluator-otp-'));
  let browser;
  let server;
  try {
    const entryPath = join(harnessRoot, 'entry.tsx');
    const componentPath = resolve(projectRoot, 'app/components/ui/input-otp.tsx');
    await writeFile(
      entryPath,
      `import React from 'react';
import { createRoot } from 'react-dom/client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from ${JSON.stringify(moduleSpecifier(harnessRoot, componentPath))};

function Field({ id, inputMode }) {
  return (
    <section data-field={id}>
      <h2>{id === 'default' ? 'Default OTP' : 'Override OTP'}</h2>
      <InputOTP
        aria-label={id === 'default' ? 'Default one-time password' : 'Numeric one-time password'}
        data-testid={id + '-input'}
        maxLength={4}
        {...(inputMode ? { inputMode } : {})}
      >
        <InputOTPGroup>
          {[0, 1, 2, 3].map((index) => <InputOTPSlot data-index={index} index={index} key={index} />)}
        </InputOTPGroup>
      </InputOTP>
    </section>
  );
}

createRoot(document.getElementById('harness')).render(
  <main>
    <h1>OTP behavior harness</h1>
    <Field id="default" />
    <Field id="override" inputMode="numeric" />
  </main>,
);
`,
      'utf8',
    );
    await writeFile(
      join(harnessRoot, 'index.html'),
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OTP harness</title></head><body><div id="harness"></div><script src="/bundle.js"></script></body></html>',
      'utf8',
    );
    await esbuild.build({
      absWorkingDir: projectRoot,
      bundle: true,
      entryPoints: [entryPath],
      format: 'iife',
      jsx: 'automatic',
      loader: { '.svg': 'dataurl' },
      outfile: join(harnessRoot, 'bundle.js'),
      platform: 'browser',
      tsconfig: resolve(projectRoot, 'tsconfig.json'),
    });

    server = createServer(async (request, response) => {
      try {
        const file = request.url === '/bundle.js' ? 'bundle.js' : 'index.html';
        const body = await readFile(join(harnessRoot, file));
        response.writeHead(200, {
          'content-type': file.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8',
        });
        response.end(body);
      } catch {
        response.writeHead(404).end('not found');
      }
    });
    const origin = await listen(server);

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      deviceScaleFactor: 2,
      hasTouch: true,
      isMobile: true,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    const runtimeErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(message.text());
    });
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    await page.goto(origin, { waitUntil: 'networkidle' });

    const defaultInput = page.locator('[data-field="default"] input');
    const overrideInput = page.locator('[data-field="override"] input');
    record('real-otp-inputs-rendered', (await defaultInput.count()) === 1 && (await overrideInput.count()) === 1);

    const defaultMode = await defaultInput.evaluate((input) => ({
      attribute: input.getAttribute('inputmode'),
      property: input.inputMode,
      type: input.type,
    }));
    record(
      'default-keyboard-allows-letters-and-digits',
      defaultMode.attribute === 'text' && defaultMode.property === 'text' && defaultMode.type === 'text',
      defaultMode,
    );

    const overrideMode = await overrideInput.evaluate((input) => ({
      attribute: input.getAttribute('inputmode'),
      property: input.inputMode,
    }));
    record(
      'caller-input-mode-override-wins',
      overrideMode.attribute === 'numeric' && overrideMode.property === 'numeric',
      overrideMode,
    );

    await defaultInput.focus();
    await page.keyboard.type('A');
    const firstStep = await page.locator('[data-field="default"]').evaluate((field) => {
      const input = field.querySelector('input');
      const slots = [...field.querySelectorAll('[data-slot="input-otp-slot"]')];
      return {
        activeElementIsInput: document.activeElement === input,
        caret: input?.selectionStart,
        slotText: slots.map((slot) => slot.textContent),
        visualCaretIndex: slots.findIndex((slot) => slot.querySelector('div > div')),
        value: input?.value,
      };
    });
    await page.keyboard.type('7b2');
    const completed = await page.locator('[data-field="default"]').evaluate((field) => {
      const input = field.querySelector('input');
      return {
        activeElementIsInput: document.activeElement === input,
        caret: input?.selectionStart,
        slotText: [...field.querySelectorAll('[data-slot="input-otp-slot"]')].map((slot) => slot.textContent),
        value: input?.value,
      };
    });
    record(
      'alphanumeric-entry-and-focus-movement',
      firstStep.activeElementIsInput &&
        firstStep.value === 'A' &&
        firstStep.caret === 1 &&
        firstStep.slotText[0] === 'A' &&
        firstStep.visualCaretIndex === 1 &&
        completed.activeElementIsInput &&
        completed.value === 'A7b2' &&
        completed.caret >= 3 &&
        completed.slotText.join('') === 'A7b2',
      { firstStep, completed },
    );

    await overrideInput.focus();
    await page.keyboard.type('9');
    record(
      'override-control-remains-interactive',
      (await overrideInput.inputValue()) === '9' && (await overrideInput.evaluate((input) => document.activeElement === input)),
    );

    const axe = await new AxeBuilder({ page }).include('#harness').analyze();
    record(
      'rendered-control-has-no-axe-violations',
      axe.violations.length === 0,
      axe.violations.map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.length })),
      true,
    );
    record('no-browser-runtime-errors', runtimeErrors.length === 0, runtimeErrors);
    await context.close();
  } finally {
    if (browser) await browser.close();
    if (server?.listening) await closeServer(server);
    await rm(harnessRoot, { recursive: true, force: true });
  }
}

try {
  await main();
} catch (error) {
  record('oracle-execution', false, error instanceof Error ? error.message : String(error));
}

emit();
