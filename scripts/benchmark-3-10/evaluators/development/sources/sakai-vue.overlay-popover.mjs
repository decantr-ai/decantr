#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const EMPTY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+Avk9AAAAAElFTkSuQmCC',
  'base64',
);

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    const value = argv[++index];
    if (!value) throw new Error(`Missing value for ${option}`);
    if (option === '--workspace') options.workspace = resolve(value);
    else if (option === '--project-path') options.projectPath = value;
    else if (option === '--evaluator-runtime') options.evaluatorRuntime = resolve(value);
    else throw new Error(`Unknown option: ${option}`);
  }
  if (!options.workspace || options.projectPath === undefined || !options.evaluatorRuntime) {
    throw new Error('Expected --workspace, --project-path, and --evaluator-runtime');
  }
  return options;
}

function resolveProject(workspace, projectPath) {
  const project = resolve(workspace, projectPath);
  const relation = relative(workspace, project);
  if (relation === '..' || relation.startsWith(`..${sep}`) || isAbsolute(relation)) {
    throw new Error('Project path escapes the workspace');
  }
  return project;
}

async function reservePort() {
  const server = createServer();
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Could not reserve a browser port');
  await new Promise((resolveClose, reject) => server.close((error) => (error ? reject(error) : resolveClose())));
  return address.port;
}

async function waitForServer(url, child) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Vue development server exited with ${child.exitCode}`);
    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (response.status < 500) return;
    } catch {
      // The fixed server is still starting.
    }
    await delay(250);
  }
  throw new Error('Timed out waiting for the Vue development server');
}

async function stopProcess(child) {
  if (child.exitCode !== null) return;
  child.kill('SIGTERM');
  await Promise.race([once(child, 'exit'), delay(5_000)]);
  if (child.exitCode === null) {
    child.kill('SIGKILL');
    await once(child, 'exit').catch(() => {});
  }
}

function cardWithHeading(page, heading) {
  return page.locator('.card').filter({
    has: page.locator('.font-semibold').filter({ hasText: new RegExp(`^${heading}$`, 'u') }),
  });
}

async function evaluate() {
  const options = parseArgs(process.argv.slice(2));
  const project = resolveProject(options.workspace, options.projectPath);
  await access(join(project, 'package.json'));
  await access(join(options.evaluatorRuntime, 'package.json'));

  const runtimeRequire = createRequire(join(options.evaluatorRuntime, 'package.json'));
  const { chromium } = runtimeRequire('playwright');
  const AxeBuilder = runtimeRequire('@axe-core/playwright').default;
  const port = await reservePort();
  const origin = `http://127.0.0.1:${port}`;
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const server = spawn(npm, ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: project,
    env: { ...process.env, BROWSER: 'none', NO_COLOR: '1' },
    stdio: ['ignore', 'ignore', 'ignore'],
  });

  let browser;
  try {
    await waitForServer(origin, server);
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
    const page = await context.newPage();
    const runtimeErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => runtimeErrors.push(`page: ${error.message}`));
    await page.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (request.resourceType() === 'image' && url.origin !== origin) {
        await route.fulfill({ status: 200, contentType: 'image/png', body: EMPTY_PNG });
      } else {
        await route.continue();
      }
    });

    const checks = {
      routeLoaded: false,
      popoverOpensWithProductTable: false,
      selectionClosesPopover: false,
      selectionProducesToast: false,
      dialogStillWorks: false,
      drawerStillWorks: false,
      tooltipStillWorks: false,
      confirmationStillWorks: false,
      changedSurfaceHasNoAxeViolations: false,
      browserConsoleClean: false,
    };
    const evidenceErrors = [];
    const axeViolations = [];
    const check = async (id, operation) => {
      try {
        checks[id] = Boolean(await operation());
      } catch (error) {
        evidenceErrors.push(`${id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    await check('routeLoaded', async () => {
      const response = await page.goto(`${origin}/uikit/overlay`, { waitUntil: 'networkidle' });
      await page.locator('.card').first().waitFor({ state: 'visible' });
      return Boolean(response?.ok()) && (await page.locator('.card').count()) >= 6;
    });

    const popoverCard = cardWithHeading(page, 'Popover');
    const popover = page.locator('.p-popover:visible');
    let selectedProductName = '';
    await check('popoverOpensWithProductTable', async () => {
      await popoverCard.getByRole('button').first().click();
      await popover.waitFor({ state: 'visible' });
      const rows = popover.locator('tbody tr');
      await rows.first().waitFor({ state: 'visible' });
      const box = await popover.boundingBox();
      return (await rows.count()) > 0 && Boolean(box && box.width > 100 && box.height > 50);
    });

    await check('changedSurfaceHasNoAxeViolations', async () => {
      await popoverCard.evaluate((element) => element.setAttribute('data-evaluator-popover-card', ''));
      const report = await new AxeBuilder({ page })
        .include('[data-evaluator-popover-card]')
        .include('.p-popover')
        .disableRules(['color-contrast'])
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      axeViolations.push(...report.violations.map(({ id, impact }) => ({ id, impact })));
      return report.violations.length === 0;
    });

    await check('selectionClosesPopover', async () => {
      const firstRow = popover.locator('tbody tr').first();
      selectedProductName = (await firstRow.locator('td').first().innerText()).trim();
      await firstRow.click();
      await popover.waitFor({ state: 'hidden' });
      return !(await popover.isVisible());
    });

    await check('selectionProducesToast', async () => {
      const toast = page.locator('.p-toast-message:visible, [role="alert"]:visible').last();
      await toast.waitFor({ state: 'visible' });
      const announcement = (await toast.innerText()).trim();
      return selectedProductName.length > 0 && announcement.includes(selectedProductName);
    });

    await check('dialogStillWorks', async () => {
      const card = cardWithHeading(page, 'Dialog');
      await card.getByRole('button').first().click();
      const dialog = page.getByRole('dialog').filter({ visible: true }).first();
      await dialog.waitFor({ state: 'visible' });
      const box = await dialog.boundingBox();
      await dialog.getByRole('button').last().click();
      await dialog.waitFor({ state: 'hidden' });
      return Boolean(box && box.width > 100 && box.height > 50);
    });

    await check('drawerStillWorks', async () => {
      const card = cardWithHeading(page, 'Drawer');
      await card.getByRole('button').first().click();
      const drawer = page.locator('.p-drawer:visible').first();
      await drawer.waitFor({ state: 'visible' });
      const box = await drawer.boundingBox();
      await drawer.getByRole('button').first().click();
      await drawer.waitFor({ state: 'hidden' });
      return Boolean(box && box.width > 100 && box.height > 100);
    });

    await check('tooltipStillWorks', async () => {
      const card = cardWithHeading(page, 'Tooltip');
      await card.locator('input').hover();
      const tooltip = page.locator('[role="tooltip"]:visible, .p-tooltip:visible').first();
      await tooltip.waitFor({ state: 'visible' });
      return (await tooltip.innerText()).trim().length > 0;
    });

    await check('confirmationStillWorks', async () => {
      const card = cardWithHeading(page, 'ConfirmPopup');
      await card.getByRole('button').first().click();
      const confirmation = page.locator('.p-confirmpopup:visible, [role="alertdialog"]:visible').first();
      await confirmation.waitFor({ state: 'visible' });
      const box = await confirmation.boundingBox();
      await confirmation.getByRole('button').first().click();
      await confirmation.waitFor({ state: 'hidden' });
      return Boolean(box && box.width > 100 && box.height > 50);
    });

    await delay(250);
    checks.browserConsoleClean = runtimeErrors.length === 0;
    const failures = Object.entries(checks)
      .filter(([, passed]) => !passed)
      .map(([id]) => id);
    return {
      passed: failures.length === 0,
      metrics: {
        governanceViolations: 0,
        accessibilityViolations: checks.changedSurfaceHasNoAxeViolations ? 0 : 1,
      },
      checks: Object.entries(checks).map(([id, passed]) => ({ id, passed })),
      failures,
      evidenceErrors,
      axeViolations,
      runtimeErrors,
    };
  } finally {
    await browser?.close().catch(() => {});
    await stopProcess(server);
  }
}

try {
  const result = await evaluate();
  console.log(JSON.stringify(result));
  if (!result.passed) process.exitCode = 1;
} catch (error) {
  console.log(
    JSON.stringify({
      passed: false,
      metrics: { governanceViolations: 0, accessibilityViolations: 1 },
      checks: [{ id: 'evaluator-runtime', passed: false }],
      failures: [error instanceof Error ? error.message : String(error)],
    }),
  );
  process.exitCode = 1;
}
