#!/usr/bin/env node
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { mkdtemp, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const checks = [];
const labels = ['HN', 'New', 'Show', 'Ask', 'Jobs'];

function record(id, passed, detail, accessibility = false) {
  checks.push({ id, passed: Boolean(passed), ...(detail === undefined ? {} : { detail }), ...(accessibility ? { accessibility: true } : {}) });
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--workspace') options.workspace = resolve(argv[++index]);
    else if (argv[index] === '--project-path') options.projectPath = argv[++index];
    else if (argv[index] === '--evaluator-runtime') options.evaluatorRuntime = resolve(argv[++index]);
    else throw new Error(`Unknown option: ${argv[index]}`);
  }
  if (!options.workspace || !options.projectPath || !options.evaluatorRuntime) {
    throw new Error('--workspace, --project-path, and --evaluator-runtime are required');
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

async function navigationSnapshot(page) {
  return page.locator('header nav a:not(.github)').evaluateAll((links) =>
    links.map((link) => ({
      active: link.classList.contains('active'),
      ariaCurrent: link.getAttribute('aria-current'),
      label: link.textContent?.trim() ?? '',
      path: new URL(link.href).pathname,
    })),
  );
}

function currentLinkIsExclusive(snapshot, label) {
  const selected = snapshot.find((link) => link.label === label);
  return Boolean(
    selected?.active &&
      selected.ariaCurrent === 'page' &&
      snapshot.filter((link) => link.active).length === 1 &&
      snapshot.filter((link) => link.ariaCurrent === 'page').length === 1,
  );
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
    failures: failures.map((check) => check.id),
  };
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (!result.passed) process.exitCode = 1;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const workspaceRoot = await realpath(options.workspace);
  const projectRoot = await realpath(resolve(options.workspace, options.projectPath));
  if (!contained(workspaceRoot, projectRoot)) throw new Error('Project path escapes workspace');

  const runtimeRequire = createRequire(join(options.evaluatorRuntime, 'package.json'));
  const candidateRequire = createRequire(join(projectRoot, 'package.json'));
  const startRequire = createRequire(join(workspaceRoot, 'packages/start/package.json'));
  const { chromium } = runtimeRequire('playwright');
  const AxeBuilder = runtimeRequire('@axe-core/playwright');
  const vitePackageRoot = dirname(candidateRequire.resolve('vite/package.json'));
  const vite = await import(pathToFileURL(join(vitePackageRoot, 'dist/node/index.js')).href);
  const solidPluginModule = await import(pathToFileURL(startRequire.resolve('vite-plugin-solid')).href);
  const solidPlugin = solidPluginModule.default ?? solidPluginModule;

  const harnessRoot = await mkdtemp(join(projectRoot, '.evaluator-router-'));
  const outputRoot = join(harnessRoot, 'dist');
  let browser;
  let server;
  try {
    const navPath = resolve(projectRoot, 'src/components/nav.tsx');
    const cssPath = resolve(projectRoot, 'src/app.css');
    await writeFile(
      join(harnessRoot, 'entry.tsx'),
      `import { render } from 'solid-js/web';
import { Route, Router } from '@solidjs/router';
import Nav from ${JSON.stringify(moduleSpecifier(harnessRoot, navPath))};
import ${JSON.stringify(moduleSpecifier(harnessRoot, cssPath))};

const Page = () => <section class="view"><h1>Route content</h1></section>;

render(
  () => (
    <Router root={(props) => <><Nav /><main>{props.children}</main></>}>
      <Route path="/" component={Page} />
      <Route path="/new" component={Page} />
      <Route path="/show" component={Page} />
      <Route path="/ask" component={Page} />
      <Route path="/job" component={Page} />
      <Route path="/*remaining" component={Page} />
    </Router>
  ),
  document.getElementById('harness'),
);
`,
      'utf8',
    );
    await writeFile(
      join(harnessRoot, 'index.html'),
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hacker News navigation harness</title></head><body><div id="harness"></div><script type="module" src="/entry.tsx"></script></body></html>',
      'utf8',
    );
    await vite.build({
      build: { emptyOutDir: true, outDir: outputRoot },
      logLevel: 'silent',
      plugins: [solidPlugin()],
      root: harnessRoot,
    });

    server = createServer(async (request, response) => {
      const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');
      if (requestUrl.pathname === '/favicon.ico') {
        response.writeHead(204).end();
        return;
      }
      try {
        const assetPath = requestUrl.pathname.startsWith('/assets/')
          ? requestUrl.pathname.slice(1)
          : 'index.html';
        const filePath = resolve(outputRoot, assetPath);
        if (!contained(outputRoot, filePath) || !(await stat(filePath)).isFile()) throw new Error('not found');
        const body = await readFile(filePath);
        const contentType = filePath.endsWith('.js')
          ? 'text/javascript; charset=utf-8'
          : filePath.endsWith('.css')
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
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const runtimeErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(message.text());
    });
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    await page.goto(origin, { waitUntil: 'networkidle' });

    const initial = await navigationSnapshot(page);
    const destinations = Object.fromEntries(initial.map((link) => [link.label, link.path]));
    record(
      'semantic-navigation-and-destinations-render',
      (await page.getByRole('navigation').count()) === 1 &&
        initial.length === labels.length &&
        initial.every((link, index) => link.label === labels[index]) &&
        labels.every((label) => typeof destinations[label] === 'string'),
      initial,
      true,
    );

    const directRouteEvidence = [];
    for (const label of labels) {
      await page.goto(`${origin}${destinations[label]}`, { waitUntil: 'networkidle' });
      const snapshot = await navigationSnapshot(page);
      directRouteEvidence.push({ label, path: new URL(page.url()).pathname, snapshot });
    }
    record(
      'only-the-current-top-level-link-is-active-on-every-route',
      directRouteEvidence.every(
        (evidence) => evidence.path === destinations[evidence.label] && currentLinkIsExclusive(evidence.snapshot, evidence.label),
      ),
      directRouteEvidence,
      true,
    );
    record(
      'home-is-active-only-at-the-root',
      directRouteEvidence.every((evidence) => {
        const home = evidence.snapshot.find((link) => link.label === 'HN');
        return evidence.label === 'HN' ? home?.active === true : home?.active === false;
      }),
      directRouteEvidence.map((evidence) => ({
        home: evidence.snapshot.find((link) => link.label === 'HN'),
        route: evidence.path,
      })),
      true,
    );

    const clickEvidence = [];
    for (const label of labels) {
      const startPath = label === 'Ask' ? destinations.New : destinations.Ask;
      await page.goto(`${origin}${startPath}`, { waitUntil: 'networkidle' });
      await page.getByRole('link', { exact: true, name: label }).click();
      await page.waitForURL(`${origin}${destinations[label]}`);
      clickEvidence.push({ label, path: new URL(page.url()).pathname, snapshot: await navigationSnapshot(page) });
    }
    record(
      'mouse-navigation-reaches-every-destination',
      clickEvidence.every(
        (evidence) => evidence.path === destinations[evidence.label] && currentLinkIsExclusive(evidence.snapshot, evidence.label),
      ),
      clickEvidence,
    );

    const keyboardEvidence = [];
    for (const label of labels) {
      const startPath = label === 'Show' ? destinations.New : destinations.Show;
      await page.goto(`${origin}${startPath}`, { waitUntil: 'networkidle' });
      const link = page.getByRole('link', { exact: true, name: label });
      await link.focus();
      await page.keyboard.press('Enter');
      await page.waitForURL(`${origin}${destinations[label]}`);
      keyboardEvidence.push({ label, path: new URL(page.url()).pathname, snapshot: await navigationSnapshot(page) });
    }
    record(
      'keyboard-navigation-reaches-every-destination',
      keyboardEvidence.every(
        (evidence) => evidence.path === destinations[evidence.label] && currentLinkIsExclusive(evidence.snapshot, evidence.label),
      ),
      keyboardEvidence,
    );

    await page.goto(origin, { waitUntil: 'networkidle' });
    const tabOrder = [];
    for (let index = 0; index < labels.length; index += 1) {
      await page.keyboard.press('Tab');
      tabOrder.push(
        await page.evaluate(() => ({
          focusVisible: document.activeElement?.matches(':focus-visible') ?? false,
          label: document.activeElement?.textContent?.trim() ?? '',
          outlineStyle: getComputedStyle(document.activeElement).outlineStyle,
          outlineWidth: getComputedStyle(document.activeElement).outlineWidth,
        })),
      );
    }
    record(
      'navigation-links-have-ordered-visible-keyboard-focus',
      tabOrder.every(
        (item, index) =>
          item.label === labels[index] &&
          item.focusVisible &&
          item.outlineStyle !== 'none' &&
          Number.parseFloat(item.outlineWidth) > 0,
      ),
      tabOrder,
      true,
    );

    await page.goto(origin, { waitUntil: 'networkidle' });
    const historyBefore = await page.evaluate(() => history.length);
    await page.getByRole('link', { exact: true, name: 'New' }).click();
    await page.waitForURL(`${origin}${destinations.New}`);
    await page.getByRole('link', { exact: true, name: 'Show' }).click();
    await page.waitForURL(`${origin}${destinations.Show}`);
    const historyAfterPush = await page.evaluate(() => history.length);
    await page.goBack();
    const backSnapshot = await navigationSnapshot(page);
    const backPath = new URL(page.url()).pathname;
    await page.goForward();
    const forwardSnapshot = await navigationSnapshot(page);
    const forwardPath = new URL(page.url()).pathname;
    record(
      'router-history-restores-url-and-active-link-state',
      historyAfterPush >= historyBefore + 2 &&
        backPath === destinations.New &&
        currentLinkIsExclusive(backSnapshot, 'New') &&
        forwardPath === destinations.Show &&
        currentLinkIsExclusive(forwardSnapshot, 'Show'),
      { backPath, forwardPath, historyAfterPush, historyBefore },
    );

    const axe = await new AxeBuilder({ page }).include('header nav').analyze();
    record(
      'rendered-navigation-has-no-axe-violations',
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
