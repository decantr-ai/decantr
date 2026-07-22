#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

function parseArguments(argv) {
  if (argv.length !== 6 || argv.length % 2 !== 0) {
    throw new Error('Expected --workspace, --project-path, and --evaluator-runtime arguments');
  }
  const values = Object.fromEntries(Array.from({ length: argv.length / 2 }, (_, index) => [argv[index * 2], argv[index * 2 + 1]]));
  if (!values['--workspace'] || values['--project-path'] === undefined || !values['--evaluator-runtime']) {
    throw new Error('Missing evaluator argument');
  }
  const workspace = resolve(values['--workspace']);
  const project = resolve(workspace, values['--project-path']);
  const relation = relative(workspace, project);
  if (relation === '..' || relation.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) || isAbsolute(relation)) {
    throw new Error('Project path escapes the workspace');
  }
  return { workspace, project, evaluatorRuntime: resolve(values['--evaluator-runtime']) };
}

async function reservePort() {
  const server = createServer();
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Unable to reserve a Storybook port');
  await new Promise((resolveClose, reject) => server.close((error) => (error ? reject(error) : resolveClose())));
  return address.port;
}

function captureProcess(child) {
  let output = '';
  const append = (chunk) => {
    output = `${output}${chunk.toString()}`.slice(-12000);
  };
  child.stdout?.on('data', append);
  child.stderr?.on('data', append);
  return () => output;
}

async function waitForHttp(url, child, getOutput, timeoutMs = 180000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Storybook exited before becoming ready: ${getOutput().slice(-1000)}`);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The server socket is not ready yet.
    }
    await delay(250);
  }
  throw new Error(`Storybook did not become ready: ${getOutput().slice(-1000)}`);
}

async function stopProcess(child) {
  if (child.exitCode !== null || child.pid === undefined) return;
  const signal = (name) => {
    try {
      process.kill(process.platform === 'win32' ? child.pid : -child.pid, name);
    } catch {
      // The process may have exited between checks.
    }
  };
  signal('SIGTERM');
  await Promise.race([once(child, 'exit'), delay(5000)]);
  if (child.exitCode === null) {
    signal('SIGKILL');
    await Promise.race([once(child, 'exit'), delay(2000)]);
  }
}

async function startStorybook(workspace) {
  const projectRequire = createRequire(join(workspace, 'package.json'));
  const packagePath = projectRequire.resolve('storybook/package.json');
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));
  const bin = typeof packageJson.bin === 'string' ? packageJson.bin : packageJson.bin?.storybook;
  if (!bin) throw new Error('The frozen Storybook package has no executable');
  const port = await reservePort();
  const child = spawn(
    process.execPath,
    [resolve(dirname(packagePath), bin), 'dev', '--port', String(port), '--host', '127.0.0.1', '--no-open', '--ci'],
    {
      cwd: join(workspace, 'packages/react'),
      detached: process.platform !== 'win32',
      env: {
        ...process.env,
        BROWSER: 'none',
        CI: '1',
        STORYBOOK_DISABLE_TELEMETRY: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  const getOutput = captureProcess(child);
  const origin = `http://127.0.0.1:${port}`;
  await waitForHttp(`${origin}/iframe.html`, child, getOutput);
  return { child, origin };
}

function percentage(checks) {
  const values = Object.values(checks);
  return values.length === 0 ? 0 : Math.round((values.filter(Boolean).length / values.length) * 100);
}

async function analyzeAxe(page, AxeBuilder, selector) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      return await new AxeBuilder({ page }).include(selector).withTags(['wcag2a', 'wcag2aa']).analyze();
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('Axe is already running') || attempt === 19) throw error;
      await delay(250);
    }
  }
  throw new Error('Axe scan did not complete');
}

async function inspectBanner(page, label) {
  return page.locator(`section[aria-label="${label}"]`).evaluate((section) => {
    const rect = (element) => {
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
    };
    const intersects = (a, b) => a.left < b.right - 0.5 && a.right > b.left + 0.5 && a.top < b.bottom - 0.5 && a.bottom > b.top + 0.5;
    const visible = (element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0;
    };
    const description = section.querySelector('.BannerDescription');
    const content = description?.parentElement ?? null;
    const container = content?.parentElement ?? null;
    const actionRows = [...section.querySelectorAll('[data-primary-action]')];
    const leading = actionRows.find((element) => element.getAttribute('data-primary-action') === 'leading') ?? null;
    const trailing = actionRows.find((element) => element.getAttribute('data-primary-action') === 'trailing') ?? null;
    const activeRow = actionRows.find(visible) ?? null;
    const buttons = activeRow ? [...activeRow.querySelectorAll('button, a[href]')].filter(visible) : [];
    const contentRect = content ? rect(content) : null;
    const actionRect = activeRow ? rect(activeRow) : null;
    const buttonRects = buttons.map(rect);
    const sectionRect = rect(section);
    return {
      found: Boolean(description && content && container && leading && trailing && activeRow),
      direction: container ? getComputedStyle(container).flexDirection : '',
      leadingVisible: Boolean(leading && visible(leading)),
      trailingVisible: Boolean(trailing && visible(trailing)),
      activeRowKind: activeRow?.getAttribute('data-primary-action') ?? '',
      buttonCount: buttons.length,
      contentActionClear: Boolean(contentRect && actionRect && !intersects(contentRect, actionRect)),
      buttonsClear: buttonRects.every((box, index) => buttonRects.slice(index + 1).every((other) => !intersects(box, other))),
      buttonsShareRow: buttonRects.length > 0 && Math.max(...buttonRects.map((box) => box.top)) - Math.min(...buttonRects.map((box) => box.top)) < 2,
      firstButtonBeforeSecond: buttonRects.length < 2 || buttonRects[0].left < buttonRects[1].left,
      withinBanner:
        [contentRect, actionRect, ...buttonRects].filter(Boolean).every(
          (box) => box.left >= sectionRect.left - 1 && box.right <= sectionRect.right + 1 && box.top >= sectionRect.top - 1 && box.bottom <= sectionRect.bottom + 1,
        ) && section.scrollWidth <= section.clientWidth + 1,
      documentHasNoHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
    };
  });
}

async function run() {
  const { workspace, evaluatorRuntime } = parseArguments(process.argv.slice(2));
  const runtimeRequire = createRequire(join(evaluatorRuntime, 'package.json'));
  const { chromium } = runtimeRequire('playwright');
  const AxeBuilder = runtimeRequire('@axe-core/playwright').default;
  const server = await startStorybook(workspace);
  let browser;
  let context;
  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({ viewport: { width: 320, height: 760 } });
    const page = await context.newPage();
    const runtimeErrors = [];
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(message.text());
    });
    const storyUrl = new URL('/iframe.html', server.origin);
    storyUrl.searchParams.set('id', 'components-banner-features--actions-layout-inline');
    storyUrl.searchParams.set('viewMode', 'story');
    await page.goto(storyUrl.toString(), { waitUntil: 'domcontentloaded' });
    await page.locator('body.sb-show-main:not(.sb-show-preparing-story)').waitFor({ timeout: 120000 });
    await page.locator('section[aria-label="Actions Layout Inline Desktop"]').waitFor({ timeout: 120000 });

    const narrow = await inspectBanner(page, 'Actions Layout Inline Desktop');
    const narrowButton = page
      .locator('section[aria-label="Actions Layout Inline Desktop"] [data-primary-action="leading"] button')
      .first();
    await narrowButton.focus();
    const narrowFocusLands = await narrowButton.evaluate((element) => document.activeElement === element);
    const narrowScreenshot = await page.locator('section[aria-label="Actions Layout Inline Desktop"]').screenshot({ animations: 'disabled' });

    await page.setViewportSize({ width: 1012, height: 760 });
    const wide = await inspectBanner(page, 'Actions Layout Inline Desktop');
    const wideButton = page
      .locator('section[aria-label="Actions Layout Inline Desktop"] [data-primary-action="trailing"] button')
      .last();
    await wideButton.focus();
    const wideFocusLands = await wideButton.evaluate((element) => document.activeElement === element);
    const wideScreenshot = await page.locator('section[aria-label="Actions Layout Inline Desktop"]').screenshot({ animations: 'disabled' });

    const stackedUrl = new URL('/iframe.html', server.origin);
    stackedUrl.searchParams.set('id', 'components-banner-features--actions-layout-stacked');
    stackedUrl.searchParams.set('viewMode', 'story');
    await page.goto(stackedUrl.toString(), { waitUntil: 'domcontentloaded' });
    await page.locator('section[aria-label="Actions Layout Stacked Desktop"]').waitFor({ timeout: 120000 });
    const stacked = await inspectBanner(page, 'Actions Layout Stacked Desktop');
    const axe = await analyzeAxe(page, AxeBuilder, 'section[aria-label="Actions Layout Stacked Desktop"]');

    const checks = {
      narrowFixtureRendered: narrow.found && narrow.buttonCount === 2,
      narrowContainerStacks: narrow.direction === 'column',
      narrowUsesLeadingActionOrder: narrow.leadingVisible && !narrow.trailingVisible && narrow.activeRowKind === 'leading',
      narrowPrimaryPrecedesSecondary: narrow.firstButtonBeforeSecond,
      narrowContentAndActionsDoNotIntersect: narrow.contentActionClear,
      narrowActionsDoNotIntersect: narrow.buttonsClear && narrow.buttonsShareRow,
      narrowHasNoOverflow: narrow.withinBanner && narrow.documentHasNoHorizontalOverflow,
      narrowActionIsKeyboardFocusable: narrowFocusLands,
      wideFixtureRendered: wide.found && wide.buttonCount === 2,
      wideActionsRemainInline: wide.direction === 'row' && wide.buttonsShareRow,
      wideUsesTrailingActionOrder: !wide.leadingVisible && wide.trailingVisible && wide.activeRowKind === 'trailing',
      wideHasNoIntersections: wide.contentActionClear && wide.buttonsClear,
      wideHasNoOverflow: wide.withinBanner && wide.documentHasNoHorizontalOverflow,
      wideActionIsKeyboardFocusable: wideFocusLands,
      stackedOptionPreserved:
        stacked.found && stacked.direction === 'column' && stacked.leadingVisible && !stacked.trailingVisible && stacked.contentActionClear,
      fixedScreenshotsCaptured: narrowScreenshot.length > 1000 && wideScreenshot.length > 1000,
      noRuntimeErrors: runtimeErrors.length === 0,
      accessibilityScanPasses: axe.violations.length === 0,
    };
    return {
      passed: Object.values(checks).every(Boolean),
      metrics: {
        governanceViolations: 0,
        accessibilityViolations: axe.violations.length,
        visualScore: percentage(checks),
      },
      checks,
      evidence: {
        narrow: { direction: narrow.direction, activeRow: narrow.activeRowKind, buttonCount: narrow.buttonCount },
        wide: { direction: wide.direction, activeRow: wide.activeRowKind, buttonCount: wide.buttonCount },
        runtimeErrorCount: runtimeErrors.length,
        accessibilityRuleIds: axe.violations.map((violation) => violation.id),
      },
    };
  } finally {
    await context?.close();
    await browser?.close();
    await stopProcess(server.child);
  }
}

try {
  console.log(JSON.stringify(await run()));
} catch (error) {
  console.log(
    JSON.stringify({
      passed: false,
      metrics: { governanceViolations: 0, accessibilityViolations: 1, visualScore: 0 },
      checks: { runtimeAvailable: false },
      evidence: { error: error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500) },
    }),
  );
}
