#!/usr/bin/env node
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';

const checks = [];
const expectedLabels = ['Pricing', 'Solutions', 'Community', 'Resources', 'Contact'];

function record(id, passed, detail, accessibility = false) {
  checks.push({ id, passed: Boolean(passed), ...(detail === undefined ? {} : { detail }), ...(accessibility ? { accessibility: true } : {}) });
}

function parseArgs(argv) {
  const options = { projectPath: '.' };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--workspace') options.workspace = resolve(argv[++index]);
    else if (argv[index] === '--project-path') options.projectPath = argv[++index];
    else if (argv[index] === '--evaluator-runtime') options.evaluatorRuntime = resolve(argv[++index]);
    else throw new Error(`Unknown option: ${argv[index]}`);
  }
  if (!options.workspace || !options.evaluatorRuntime) {
    throw new Error('--workspace and --evaluator-runtime are required');
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

function sameLabels(actual) {
  return actual.length === expectedLabels.length && actual.every((label, index) => label === expectedLabels[index]);
}

async function selectionSnapshot(navigation) {
  return navigation.locator('button').evaluateAll((buttons) => ({
    labels: buttons.map((button) => button.textContent?.trim() ?? ''),
    selected: buttons.filter((button) => button.hasAttribute('data-selected')).map((button) => button.textContent?.trim() ?? ''),
  }));
}

function emit() {
  const failures = checks.filter((check) => !check.passed);
  const result = {
    passed: checks.length > 0 && failures.length === 0,
    metrics: {
      governanceViolations: 0,
      accessibilityViolations: failures.filter((check) => check.accessibility).length,
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

  const runtimeRequire = createRequire(join(options.evaluatorRuntime, 'package.json'));
  const candidateRequire = createRequire(join(projectRoot, 'package.json'));
  const { chromium } = runtimeRequire('playwright');
  const AxeBuilder = runtimeRequire('@axe-core/playwright');
  const esbuild = candidateRequire('esbuild');

  const harnessRoot = await mkdtemp(join(projectRoot, '.evaluator-header-'));
  let browser;
  let server;
  try {
    const entryPath = join(harnessRoot, 'entry.tsx');
    const headerPath = resolve(projectRoot, 'src/ui/compositions/Headers/Headers.tsx');
    const providerPath = resolve(projectRoot, 'src/ui/providers/Authentication.tsx');
    const stylesPath = resolve(projectRoot, 'src/index.css');
    await writeFile(
      entryPath,
      `import React from 'react';
import { createRoot } from 'react-dom/client';
import { HeaderAuth } from ${JSON.stringify(moduleSpecifier(harnessRoot, headerPath))};
import { AuthenticationProvider } from ${JSON.stringify(moduleSpecifier(harnessRoot, providerPath))};
import ${JSON.stringify(moduleSpecifier(harnessRoot, stylesPath))};

createRoot(document.getElementById('harness')).render(
  <AuthenticationProvider>
    <main aria-label="Authenticated header behavior harness">
      <HeaderAuth />
    </main>
  </AuthenticationProvider>,
);
`,
      'utf8',
    );
    await writeFile(
      join(harnessRoot, 'index.html'),
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Header harness</title><link rel="stylesheet" href="/bundle.css"></head><body><div id="harness"></div><script src="/bundle.js"></script></body></html>',
      'utf8',
    );
    const uiRoot = resolve(projectRoot, 'src/ui');
    await esbuild.build({
      absWorkingDir: projectRoot,
      alias: {
        compositions: resolve(uiRoot, 'compositions'),
        hooks: resolve(uiRoot, 'hooks'),
        icons: resolve(uiRoot, 'icons'),
        images: resolve(uiRoot, 'images'),
        layout: resolve(uiRoot, 'layout'),
        primitives: resolve(uiRoot, 'primitives'),
        providers: resolve(uiRoot, 'providers'),
        utils: resolve(uiRoot, 'utils'),
      },
      bundle: true,
      entryPoints: [entryPath],
      format: 'iife',
      jsx: 'automatic',
      loader: {
        '.gif': 'dataurl',
        '.jpg': 'dataurl',
        '.jpeg': 'dataurl',
        '.png': 'dataurl',
        '.svg': 'dataurl',
        '.woff': 'dataurl',
        '.woff2': 'dataurl',
      },
      outfile: join(harnessRoot, 'bundle.js'),
      platform: 'browser',
      tsconfig: resolve(projectRoot, 'tsconfig.json'),
    });

    server = createServer(async (request, response) => {
      try {
        const requested = request.url === '/bundle.js' ? 'bundle.js' : request.url === '/bundle.css' ? 'bundle.css' : 'index.html';
        const body = await readFile(join(harnessRoot, requested));
        const contentType = requested.endsWith('.js')
          ? 'text/javascript; charset=utf-8'
          : requested.endsWith('.css')
            ? 'text/css; charset=utf-8'
            : 'text/html; charset=utf-8';
        response.writeHead(200, { 'content-type': contentType });
        response.end(body);
      } catch {
        response.writeHead(404).end('not found');
      }
    });
    const origin = await listen(server);

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const runtimeErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(message.text());
    });
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    await page.goto(origin, { waitUntil: 'networkidle' });

    const desktopNavigation = page.getByRole('navigation');
    const desktopInitial = await selectionSnapshot(desktopNavigation);
    record('desktop-destinations-are-unique-and-ordered', sameLabels(desktopInitial.labels), desktopInitial);
    record(
      'desktop-has-one-visible-pricing-destination',
      desktopInitial.labels.filter((label) => label === 'Pricing').length === 1 && desktopInitial.selected.join() === 'Pricing',
      desktopInitial,
    );

    const desktopSelections = [];
    for (const label of expectedLabels) {
      const button = desktopNavigation.getByRole('button', { exact: true, name: label }).first();
      await button.focus();
      await page.keyboard.press('Enter');
      desktopSelections.push({ label, ...(await selectionSnapshot(desktopNavigation)) });
    }
    record(
      'every-desktop-destination-is-keyboard-selectable',
      desktopSelections.every((snapshot) => snapshot.selected.length === 1 && snapshot.selected[0] === snapshot.label),
      desktopSelections,
    );

    const desktopAxe = await new AxeBuilder({ page }).include('#harness').analyze();
    record(
      'desktop-navigation-has-no-axe-violations',
      desktopAxe.violations.length === 0,
      desktopAxe.violations.map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.length })),
      true,
    );

    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.getByRole('button', { name: 'Toggle navigation menu' });
    await toggle.waitFor({ state: 'visible' });
    record(
      'mobile-breakpoint-uses-a-labelled-menu-control',
      (await toggle.count()) === 1 && (await page.getByRole('navigation').count()) === 0,
    );
    await toggle.focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });
    const mobileNavigation = dialog.getByRole('navigation');
    const mobileInitial = await selectionSnapshot(mobileNavigation);
    record('mobile-menu-destinations-are-unique-and-ordered', sameLabels(mobileInitial.labels), mobileInitial);
    record(
      'mobile-menu-opens-with-focus-contained',
      await dialog.evaluate((element) => element.contains(document.activeElement)),
    );

    const mobileSelections = [];
    for (const label of expectedLabels) {
      const button = mobileNavigation.getByRole('button', { exact: true, name: label }).first();
      await button.focus();
      await page.keyboard.press('Enter');
      mobileSelections.push({ label, ...(await selectionSnapshot(mobileNavigation)) });
    }
    record(
      'every-mobile-destination-is-keyboard-selectable',
      mobileSelections.every((snapshot) => snapshot.selected.length === 1 && snapshot.selected[0] === snapshot.label),
      mobileSelections,
    );

    const mobileAxe = await new AxeBuilder({ page })
      .include('[role="dialog"] nav')
      .include('button[aria-label="Close navigation menu"]')
      .analyze();
    record(
      'mobile-navigation-controls-have-no-axe-violations',
      mobileAxe.violations.length === 0,
      mobileAxe.violations.map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.length })),
      true,
    );

    const close = dialog.getByRole('button', { name: 'Close navigation menu' });
    await close.focus();
    await page.keyboard.press('Enter');
    await dialog.waitFor({ state: 'detached' });
    record(
      'mobile-menu-closes-and-restores-trigger-focus',
      await toggle.evaluate((element) => document.activeElement === element),
    );

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole('navigation').waitFor({ state: 'visible' });
    const resizedDesktop = await selectionSnapshot(page.getByRole('navigation'));
    record(
      'responsive-navigation-preserves-selection-without-duplicates',
      sameLabels(resizedDesktop.labels) && resizedDesktop.selected.length === 1 && resizedDesktop.selected[0] === 'Contact',
      resizedDesktop,
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
