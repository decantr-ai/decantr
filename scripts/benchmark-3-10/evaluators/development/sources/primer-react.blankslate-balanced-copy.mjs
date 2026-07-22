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
  return { workspace, evaluatorRuntime: resolve(values['--evaluator-runtime']) };
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

async function inspectBlankslate(page) {
  return page.locator('.Blankslate-Heading').evaluate((heading) => {
    const description = heading.parentElement?.querySelector('.Blankslate-Description') ?? null;
    const root = heading.parentElement;
    const visual = root?.querySelector('.Blankslate-Visual') ?? null;
    const actions = root ? [...root.querySelectorAll('.Blankslate-Action')] : [];
    const rect = (element) => {
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
    };
    const lineRects = (element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const boxes = [];
      while (walker.nextNode()) {
        const range = document.createRange();
        range.selectNodeContents(walker.currentNode);
        for (const box of range.getClientRects()) {
          if (box.width > 0 && box.height > 0) boxes.push({ top: box.top, width: box.width });
        }
      }
      return boxes;
    };
    if (!description || !root || !visual) return { found: false };
    root.dataset.evaluatorBlankslate = '';
    const headingStyle = getComputedStyle(heading);
    const descriptionStyle = getComputedStyle(description);
    const headingRect = rect(heading);
    const descriptionRect = rect(description);
    const rootRect = rect(root);
    const visualRect = rect(visual);
    const actionRects = actions.map(rect);
    const headingLines = lineRects(heading);
    const descriptionLines = lineRects(description);
    const descendants = [headingRect, descriptionRect, visualRect, ...actionRects];
    const themeOwner = heading.closest('[data-color-mode], [data-light-theme], [data-dark-theme]');
    return {
      found: true,
      size: root.getAttribute('data-size'),
      headingTextWrap: headingStyle.textWrap,
      descriptionTextWrap: descriptionStyle.textWrap,
      headingTextAlign: headingStyle.textAlign,
      descriptionTextAlign: descriptionStyle.textAlign,
      headingFontSize: Number.parseFloat(headingStyle.fontSize),
      descriptionFontSize: Number.parseFloat(descriptionStyle.fontSize),
      headingLineCount: new Set(headingLines.map((box) => Math.round(box.top))).size,
      descriptionLineCount: new Set(descriptionLines.map((box) => Math.round(box.top))).size,
      verticalOrder:
        visualRect.bottom <= headingRect.top + 1 &&
        headingRect.bottom <= descriptionRect.top + 1 &&
        actionRects.every((box) => box.top >= descriptionRect.bottom - 1),
      withinContainer:
        descendants.every(
          (box) => box.left >= rootRect.left - 1 && box.right <= rootRect.right + 1 && box.top >= rootRect.top - 1 && box.bottom <= rootRect.bottom + 1,
        ) && root.scrollWidth <= root.clientWidth + 1,
      documentHasNoHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
      themeMarker: themeOwner?.getAttribute('data-color-mode') ?? '',
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
    context = await browser.newContext({ viewport: { width: 375, height: 760 } });
    const page = await context.newPage();
    const runtimeErrors = [];
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(message.text());
    });
    const states = [
      ...['small', 'medium', 'large'].flatMap((size) => [
        { size, width: 375, theme: 'light' },
        { size, width: 1012, theme: 'light' },
      ]),
      { size: 'medium', width: 375, theme: 'dark' },
      { size: 'medium', width: 1012, theme: 'dark' },
    ];
    const evidence = [];
    let accessibilityViolations = 0;
    let screenshotsCaptured = true;
    let focusLands = true;

    for (const state of states) {
      await page.setViewportSize({ width: state.width, height: 760 });
      const url = new URL('/iframe.html', server.origin);
      url.searchParams.set('id', 'experimental-components-blankslate--playground');
      url.searchParams.set('viewMode', 'story');
      url.searchParams.set(
        'args',
        `size:${state.size};spacious:${state.size === 'large'};border:true;primaryAction:true;secondaryAction:true`,
      );
      url.searchParams.set('globals', `colorScheme:${state.theme}`);
      await page.goto(url.toString(), { waitUntil: 'domcontentloaded' });
      await page.locator('body.sb-show-main:not(.sb-show-preparing-story)').waitFor({ timeout: 120000 });
      await page.locator('.Blankslate-Heading').waitFor({ timeout: 120000 });
      const measurement = await inspectBlankslate(page);
      const action = page.locator('[data-evaluator-blankslate] .Blankslate-Action a, [data-evaluator-blankslate] .Blankslate-Action button').first();
      await action.focus();
      focusLands = focusLands && (await action.evaluate((element) => document.activeElement === element));
      const screenshot = await page.locator('[data-evaluator-blankslate]').screenshot({ animations: 'disabled' });
      screenshotsCaptured = screenshotsCaptured && screenshot.length > 1000;
      const axe = await analyzeAxe(page, AxeBuilder, '[data-evaluator-blankslate]');
      accessibilityViolations += axe.violations.length;
      evidence.push({
        size: state.size,
        width: state.width,
        theme: state.theme,
        headingTextWrap: measurement.headingTextWrap,
        descriptionTextWrap: measurement.descriptionTextWrap,
        headingLineCount: measurement.headingLineCount,
        descriptionLineCount: measurement.descriptionLineCount,
        geometryPasses: measurement.verticalOrder && measurement.withinContainer,
        accessibilityRuleIds: axe.violations.map((violation) => violation.id),
        measurement,
      });
    }

    const everyMeasurement = (predicate) => evidence.every((item) => item.measurement.found && predicate(item));
    const checks = {
      everySizeRendersAtNarrowAndWideWidths:
        new Set(evidence.filter((item) => item.theme === 'light').map((item) => `${item.size}:${item.width}`)).size === 6,
      headingsUseComputedBalancedWrapping: everyMeasurement((item) => item.measurement.headingTextWrap === 'balance'),
      descriptionsUseComputedBalancedWrapping: everyMeasurement((item) => item.measurement.descriptionTextWrap === 'balance'),
      longDescriptionActuallyWrapsAtNarrowWidth: evidence
        .filter((item) => item.width === 375)
        .every((item) => item.measurement.descriptionLineCount >= 2),
      textAlignmentAndTypeRemainValid: everyMeasurement(
        (item) =>
          item.measurement.headingTextAlign === 'center' &&
          item.measurement.descriptionTextAlign === 'center' &&
          item.measurement.headingFontSize > 0 &&
          item.measurement.descriptionFontSize > 0,
      ),
      visualTextAndActionsRemainOrdered: everyMeasurement((item) => item.measurement.verticalOrder),
      componentContentDoesNotOverflow: everyMeasurement(
        (item) => item.measurement.withinContainer && item.measurement.documentHasNoHorizontalOverflow,
      ),
      darkAndLightStatesRender: new Set(evidence.map((item) => item.theme)).size === 2,
      existingActionsRemainKeyboardFocusable: focusLands,
      fixedScreenshotsCaptured: screenshotsCaptured,
      noRuntimeErrors: runtimeErrors.length === 0,
      accessibilityScansPass: accessibilityViolations === 0,
    };
    return {
      passed: Object.values(checks).every(Boolean),
      metrics: {
        governanceViolations: 0,
        accessibilityViolations,
        visualScore: percentage(checks),
      },
      checks,
      evidence: {
        states: evidence.map(({ measurement, ...item }) => item),
        runtimeErrorCount: runtimeErrors.length,
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
