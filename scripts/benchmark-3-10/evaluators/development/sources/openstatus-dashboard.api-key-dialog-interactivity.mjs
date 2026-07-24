#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import {
  access,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

function parseArguments(argv) {
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
  if (!options.workspace || !options.projectPath || !options.evaluatorRuntime) {
    throw new Error('Expected --workspace, --project-path, and --evaluator-runtime');
  }
  const project = resolve(options.workspace, options.projectPath);
  const relation = relative(options.workspace, project);
  if (relation === '..' || relation.startsWith(`..${sep}`) || isAbsolute(relation)) {
    throw new Error('Project path escapes the workspace');
  }
  return { ...options, project };
}

async function resolvePnpmPackage(workspace, packageName) {
  const storeRoot = join(workspace, 'node_modules', '.pnpm');
  const candidates = (await readdir(storeRoot))
    .filter((name) => name.startsWith(`${packageName}@`))
    .sort()
    .reverse();
  for (const candidate of candidates) {
    const packagePath = join(storeRoot, candidate, 'node_modules', packageName, 'package.json');
    try {
      await access(packagePath);
      return packagePath;
    } catch {
      // Continue to the next exact package candidate.
    }
  }
  throw new Error(`${packageName} is unavailable in the installed workspace`);
}

async function reservePort() {
  const server = createServer();
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Could not reserve a browser port');
  await new Promise((resolveClose, reject) =>
    server.close((error) => (error ? reject(error) : resolveClose())),
  );
  return address.port;
}

async function waitForServer(url, child) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Component server exited with ${child.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.status < 500) return;
    } catch {
      // The fixed server is still starting.
    }
    await delay(250);
  }
  throw new Error('Timed out waiting for the component server');
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

async function createHarness(workspace, project) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'api-key-dialog-evaluator-')));
  const vitePackagePath = await resolvePnpmPackage(workspace, 'vite');
  const vitePackage = JSON.parse(await readFile(vitePackagePath, 'utf8'));
  const viteCli = resolve(dirname(vitePackagePath), vitePackage.bin.vite);
  const sourceRoot = join(project, 'src');
  await access(join(sourceRoot, 'components', 'forms', 'settings', 'form-api-key.tsx'));
  await symlink(join(project, 'node_modules'), join(root, 'node_modules'), 'dir');

  await writeFile(
    join(root, 'index.html'),
    '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="app"></div><script type="module" src="/src.tsx"></script></body></html>',
  );
  await writeFile(
    join(root, 'trpc-client.ts'),
    `const query = (key, data) => ({
  queryKey: ['evaluator', key],
  queryFn: async () => data,
});

export function useTRPC() {
  return {
    workspace: {
      getWorkspace: {
        queryOptions: () => query('workspace', { id: 'workspace-evaluator' }),
      },
    },
    apiKeyRouter: {
      getAll: {
        queryOptions: () => query('api-keys', []),
      },
      create: {
        mutationOptions: (options = {}) => ({
          ...options,
          mutationFn: async (input) => ({
            token: 'evaluator-secret-token',
            key: { name: input.name },
          }),
        }),
      },
    },
  };
}
`,
  );
  await writeFile(
    join(root, 'link.tsx'),
    `import React from 'react';
export function Link(props) {
  return <a {...props} />;
}
`,
  );
  await writeFile(
    join(root, 'data-table.tsx'),
    `import React from 'react';
export function DataTable() {
  return <div data-evaluator-api-key-table />;
}
`,
  );
  await writeFile(
    join(root, 'style.css'),
    `body { margin: 0; padding: 24px; font: 16px/1.4 system-ui, sans-serif; }
button, input, textarea { font: inherit; }
button { min-height: 32px; padding: 4px 10px; }
[data-slot="dialog-overlay"], [data-slot="alert-dialog-overlay"] {
  position: fixed; inset: 0; z-index: 40; background: rgba(0,0,0,.25);
}
[data-slot="dialog-content"], [data-slot="alert-dialog-content"], [data-slot="popover-content"] {
  position: fixed; z-index: 50; background: white; border: 1px solid #777; padding: 16px;
}
[data-slot="dialog-content"], [data-slot="alert-dialog-content"] {
  top: 80px; left: 80px; width: 520px;
}
[data-slot="popover-content"] { top: 220px; left: 180px; }
`,
  );
  await writeFile(
    join(root, 'src.tsx'),
    `import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { FormApiKey } from '@/components/forms/settings/form-api-key';
import './style.css';

const queryClient = new QueryClient({
  defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
});

function Harness() {
  const [pageClicks, setPageClicks] = useState(0);
  return (
    <QueryClientProvider client={queryClient}>
      <button
        type="button"
        data-page-control
        onClick={() => setPageClicks((value) => value + 1)}
      >
        Page control {pageClicks}
      </button>
      <div data-evaluator-form>
        <FormApiKey />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

createRoot(document.getElementById('app')).render(<Harness />);
`,
  );
  const aliases = [
    `{ find: '@/lib/trpc/client', replacement: ${JSON.stringify(join(root, 'trpc-client.ts'))} }`,
    `{ find: '@/components/common/link', replacement: ${JSON.stringify(join(root, 'link.tsx'))} }`,
    `{ find: '@/components/data-table/settings/api-key/data-table', replacement: ${JSON.stringify(join(root, 'data-table.tsx'))} }`,
    `{ find: '@', replacement: ${JSON.stringify(sourceRoot)} }`,
  ].join(',\n      ');
  await writeFile(
    join(root, 'vite.config.mjs'),
    `import { defineConfig } from ${JSON.stringify(vitePackagePath.replace(/package\.json$/u, 'dist/node/index.js'))};
export default defineConfig({
  root: ${JSON.stringify(root)},
  resolve: { alias: [${aliases}] },
  esbuild: { jsx: 'automatic' },
  server: {
    host: '127.0.0.1',
    strictPort: true,
    fs: { allow: [${JSON.stringify(root)}, ${JSON.stringify(workspace)}] },
  },
});
`,
  );
  return { root, viteCli };
}

async function evaluate() {
  const options = parseArguments(process.argv.slice(2));
  const workspace = await realpath(options.workspace);
  const project = await realpath(options.project);
  const runtimeRequire = createRequire(join(options.evaluatorRuntime, 'package.json'));
  const { chromium } = runtimeRequire('playwright');
  const AxeBuilder = runtimeRequire('@axe-core/playwright').default;
  const harness = await createHarness(workspace, project);
  const port = await reservePort();
  const origin = `http://127.0.0.1:${port}`;
  const server = spawn(
    process.execPath,
    [harness.viteCli, '--config', join(harness.root, 'vite.config.mjs'), '--port', String(port)],
    {
      cwd: workspace,
      env: { ...process.env, NODE_ENV: 'development', NO_COLOR: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  const serverErrors = [];
  for (const stream of [server.stdout, server.stderr]) {
    stream.on('data', (chunk) => {
      if (serverErrors.join('').length < 8_000) serverErrors.push(chunk.toString());
    });
  }

  let browser;
  try {
    try {
      await waitForServer(origin, server);
    } catch (error) {
      throw new Error(
        `${error instanceof Error ? error.message : String(error)}: ${serverErrors
          .join('')
          .slice(-8_000)}`,
      );
    }
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
    const page = await context.newPage();
    page.setDefaultTimeout(8_000);
    const runtimeErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => runtimeErrors.push(`page: ${error.message}`));

    const checks = {
      realSettingsFormMounted: false,
      datePickerSelectionAndCancelRestorePage: false,
      repeatedPickerCycleRestoresPage: false,
      escapeDismissalRestoresPage: false,
      successfulCreationFeedbackAndDoneRestorePage: false,
      successfulCreationEscapeRestoresPage: false,
      noInvisibleModalLayerRemains: false,
      settingsFormHasNoAxeViolations: false,
      browserConsoleClean: false,
    };
    const evidenceErrors = [];
    const bodyPointerEvents = [];
    const axeViolations = [];
    const check = async (id, operation) => {
      try {
        checks[id] = Boolean(await operation());
      } catch (error) {
        evidenceErrors.push(`${id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    const pageControl = page.locator('[data-page-control]');
    const creationDialog = page.getByRole('dialog', { name: 'Create API Key', exact: true });
    const successDialog = page.getByRole('alertdialog', {
      name: 'API Key Created',
      exact: true,
    });

    const recordPointerEvents = async (stage) => {
      bodyPointerEvents.push({
        stage,
        value: await page.evaluate(() => document.body.style.pointerEvents),
      });
    };
    const resetHarness = async () => {
      await page.goto(origin, { waitUntil: 'networkidle' });
      await page.getByText('API Keys', { exact: true }).waitFor({ state: 'visible' });
    };
    const assertPageInteractive = async (stage) => {
      await recordPointerEvents(stage);
      const before = Number((await pageControl.innerText()).match(/\d+$/u)?.[0] ?? -1);
      await pageControl.click();
      const after = Number((await pageControl.innerText()).match(/\d+$/u)?.[0] ?? -1);
      return (
        before >= 0 &&
        after === before + 1 &&
        (await page.evaluate(() => document.activeElement?.hasAttribute('data-page-control'))) &&
        (await page.evaluate(() => document.body.style.pointerEvents)) === ''
      );
    };
    const openCreationDialog = async () => {
      const triggers = page.getByRole('button', { name: 'Create', exact: true });
      if ((await triggers.count()) !== 1) throw new Error('Creation trigger is ambiguous');
      await triggers.click();
      await creationDialog.waitFor({ state: 'visible' });
    };
    const chooseDateAndLeavePickerOpen = async () => {
      await creationDialog.evaluate((dialog) => {
        const label = [...dialog.querySelectorAll('label')].find(
          (candidate) => candidate.textContent?.trim() === 'Expiration Date',
        );
        label?.parentElement?.setAttribute('data-evaluator-expiration-field', '');
      });
      const picker = creationDialog.locator('[data-evaluator-expiration-field] button');
      if ((await picker.count()) !== 1) throw new Error('Expiration picker is ambiguous');
      const before = (await picker.innerText()).trim();
      await picker.click();
      const popover = page.locator('[data-slot="popover-content"]');
      await popover.waitFor({ state: 'visible' });
      const dateButtons = popover.locator('button:not([disabled])');
      const dateButtonTexts = await dateButtons.allTextContents();
      const selectableIndex = dateButtonTexts.findIndex((text) => /^\d{1,2}$/u.test(text.trim()));
      if (selectableIndex < 0) throw new Error('Calendar exposed no selectable date');
      await dateButtons.nth(selectableIndex).click();
      if ((await creationDialog.count()) !== 1) {
        throw new Error('Opening the expiration picker made its parent dialog inaccessible');
      }
      const selected = (await picker.innerText()).trim() !== before;
      if (!(await popover.isVisible())) {
        await picker.click();
        await popover.waitFor({ state: 'visible' });
      }
      return selected;
    };
    const submitSuccessfulCreation = async (name) => {
      await openCreationDialog();
      await creationDialog.getByLabel('Name', { exact: true }).fill(name);
      await creationDialog.getByRole('button', { name: 'Create', exact: true }).click();
      await successDialog.waitFor({ state: 'visible' });
      return (await successDialog.innerText()).includes('evaluator-secret-token');
    };

    await check('realSettingsFormMounted', async () => {
      const response = await page.goto(origin, { waitUntil: 'networkidle' });
      return (
        Boolean(response?.ok()) &&
        (await page.getByText('API Keys', { exact: true }).count()) === 1 &&
        (await pageControl.count()) === 1
      );
    });
    if (!checks.realSettingsFormMounted) {
      throw new Error(
        `Settings form did not mount: ${[...runtimeErrors, ...serverErrors].join(' | ').slice(0, 8_000)}`,
      );
    }

    await check('datePickerSelectionAndCancelRestorePage', async () => {
      await resetHarness();
      await openCreationDialog();
      const selected = await chooseDateAndLeavePickerOpen();
      await creationDialog.getByRole('button', { name: 'Cancel', exact: true }).click();
      await creationDialog.waitFor({ state: 'hidden' });
      return selected && (await assertPageInteractive('picker-cancel'));
    });

    await check('repeatedPickerCycleRestoresPage', async () => {
      await resetHarness();
      await openCreationDialog();
      await chooseDateAndLeavePickerOpen();
      await creationDialog.getByRole('button', { name: 'Cancel', exact: true }).click();
      await creationDialog.waitFor({ state: 'hidden' });
      return assertPageInteractive('repeated-picker-cancel');
    });

    await check('escapeDismissalRestoresPage', async () => {
      await resetHarness();
      await openCreationDialog();
      await page.keyboard.press('Escape');
      await creationDialog.waitFor({ state: 'hidden' });
      return assertPageInteractive('creation-escape');
    });

    await check('successfulCreationFeedbackAndDoneRestorePage', async () => {
      await resetHarness();
      const hasFeedback = await submitSuccessfulCreation('Primary evaluator key');
      await successDialog.getByRole('button', { name: 'Done', exact: true }).click();
      await successDialog.waitFor({ state: 'hidden' });
      return hasFeedback && (await assertPageInteractive('success-done'));
    });

    await check('successfulCreationEscapeRestoresPage', async () => {
      await resetHarness();
      const hasFeedback = await submitSuccessfulCreation('Escape evaluator key');
      await page.keyboard.press('Escape');
      await successDialog.waitFor({ state: 'hidden' });
      return hasFeedback && (await assertPageInteractive('success-escape'));
    });

    await check('noInvisibleModalLayerRemains', async () => {
      await resetHarness();
      await openCreationDialog();
      await chooseDateAndLeavePickerOpen();
      await page.keyboard.press('Escape');
      await page.keyboard.press('Escape');
      await creationDialog.waitFor({ state: 'hidden' });
      const openLayers = await page.locator(
        '[data-slot="dialog-overlay"][data-state="open"], [data-slot="alert-dialog-overlay"][data-state="open"], [data-slot="popover-content"][data-state="open"]',
      ).count();
      return openLayers === 0 && (await assertPageInteractive('final-layer-check'));
    });

    await check('settingsFormHasNoAxeViolations', async () => {
      await resetHarness();
      const report = await new AxeBuilder({ page })
        .include('[data-evaluator-form]')
        .disableRules(['color-contrast'])
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      axeViolations.push(...report.violations.map(({ id, impact }) => ({ id, impact })));
      return report.violations.length === 0;
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
        accessibilityViolations: checks.settingsFormHasNoAxeViolations ? 0 : 1,
      },
      checks: Object.entries(checks).map(([id, passed]) => ({ id, passed })),
      failures,
      evidenceErrors,
      bodyPointerEvents,
      axeViolations,
      runtimeErrors,
      serverErrors,
    };
  } finally {
    await browser?.close().catch(() => {});
    await stopProcess(server);
    await rm(harness.root, { recursive: true, force: true });
  }
}

try {
  const result = await evaluate();
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (!result.passed) process.exitCode = 1;
} catch (error) {
  process.stdout.write(
    `${JSON.stringify({
      passed: false,
      metrics: { governanceViolations: 0, accessibilityViolations: 1 },
      checks: [{ id: 'evaluator-runtime', passed: false }],
      failures: [error instanceof Error ? error.message : String(error)],
    })}\n`,
  );
  process.exitCode = 1;
}
