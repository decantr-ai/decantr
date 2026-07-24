#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { access, mkdtemp, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
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
  if (!options.workspace || options.projectPath === undefined || !options.evaluatorRuntime) {
    throw new Error('Expected --workspace, --project-path, and --evaluator-runtime');
  }
  const project = resolve(options.workspace, options.projectPath);
  const relation = relative(options.workspace, project);
  if (relation === '..' || relation.startsWith(`..${sep}`) || isAbsolute(relation)) {
    throw new Error('Project path escapes the workspace');
  }
  return { ...options, project };
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

function fileUrl(path) {
  return JSON.stringify(pathToFileURL(path).href);
}

async function createHarness(project) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'book-form-upload-evaluator-')));
  const projectRequire = createRequire(join(project, 'package.json'));
  const viteEntry = projectRequire.resolve('vite');
  const viteCli = join(dirname(projectRequire.resolve('vite/package.json')), 'bin', 'vite.js');
  const reactPlugin = projectRequire.resolve('@vitejs/plugin-react');
  const sourceRoot = join(project, 'src');
  await access(join(sourceRoot, 'features', 'book', 'manager', 'form-book.tsx'));
  await access(join(project, 'node_modules'));
  await symlink(join(project, 'node_modules'), join(root, 'node_modules'), 'dir');

  await writeFile(
    join(root, 'index.html'),
    '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="app"></div><script type="module" src="/src.tsx"></script></body></html>',
  );
  await writeFile(
    join(root, 'env-client.ts'),
    "export const envClient = { VITE_BASE_URL: 'http://127.0.0.1', VITE_IS_DEMO: false, VITE_S3_BUCKET_PUBLIC_URL: 'https://assets.invalid' };\n",
  );
  await writeFile(
    join(root, 'orpc-client.ts'),
    `export const orpc = {
  genre: {
    getAll: {
      queryOptions: () => ({
        queryKey: ['evaluator-genres'],
        queryFn: async () => ({ items: [] }),
      }),
    },
  },
};
`,
  );
  await writeFile(
    join(root, 'upload-client.ts'),
    `const control = globalThis.__uploadMock ??= {
  requests: [],
  complete(index) {
    const request = this.requests[index];
    if (!request || request.settled) throw new Error('Upload request is not pending');
    request.settled = true;
    const file = {
      ...request.pendingFile,
      status: 'complete',
      progress: 1,
      objectInfo: { key: \`evaluator/\${index}/\${request.source.name}\` },
    };
    request.onFileStateChange?.({ file });
    request.resolve({ file });
  },
  fail(index) {
    const request = this.requests[index];
    if (!request || request.settled) throw new Error('Upload request is not pending');
    request.settled = true;
    request.reject(new Error('simulated upload failure'));
  },
};

export async function uploadFile(options) {
  const index = control.requests.length;
  const pendingFile = {
    file: options.file,
    name: options.file.name,
    size: options.file.size,
    type: options.file.type,
    status: 'pending',
    progress: 0,
  };
  options.onFileStateChange?.({ file: pendingFile });
  return new Promise((resolve, reject) => {
    control.requests.push({
      index,
      source: options.file,
      pendingFile,
      onFileStateChange: options.onFileStateChange,
      resolve,
      reject,
      settled: false,
    });
  });
}
`,
  );
  await writeFile(
    join(root, 'style.css'),
    `body { margin: 0; padding: 24px; font: 16px/1.4 system-ui, sans-serif; color: #161616; background: #fff; }
#app { display: grid; gap: 24px; max-width: 920px; }
[data-case] { display: grid; gap: 12px; padding: 16px; border: 1px solid #888; }
[role="button"] { min-height: 36px; }
[role="button"] img { width: 32px; height: 32px; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); }
input[type="file"] { display: none; }
`,
  );
  await writeFile(
    join(root, 'src.tsx'),
    `import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Toaster } from 'sonner';

import { Form } from '@/components/form';
import { FormBook } from '@/features/book/manager/form-book';
import i18n from '@/lib/i18n/index';
import './style.css';

const queryClient = new QueryClient({
  defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
});
const evidence = globalThis.__bookFormEvidence = {
  submissions: [],
};
globalThis.__bookFormCases = {};

function BookFormCase({ id, disabled = false }) {
  const form = useForm({
    defaultValues: {
      title: '',
      author: '',
      genreId: undefined,
      publisher: '',
      coverId: null,
    },
    disabled,
    mode: 'onChange',
  });
  useEffect(() => {
    globalThis.__bookFormCases[id] = {
      getCoverId: () => form.getValues('coverId'),
      submit: () => form.handleSubmit((value) => evidence.submissions.push({ id, value }))(),
    };
  }, [form, id]);
  return (
    <section data-case={id}>
      <Form {...form} onSubmit={(value) => evidence.submissions.push({ id, value })}>
        <FormBook />
        <button type="submit" data-submit>Submit</button>
      </Form>
    </section>
  );
}

globalThis.__bookFormEvaluator = {
  ready: true,
  async setLocale(locale) {
    await i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    await new Promise((resolve) => setTimeout(resolve, 0));
  },
};

createRoot(document.getElementById('app')).render(
  <QueryClientProvider client={queryClient}>
    <BookFormCase id="active" />
    <BookFormCase id="disabled" disabled />
    <Toaster />
  </QueryClientProvider>,
);
`,
  );

  const aliases = [
    `{ find: '@/env/client', replacement: ${JSON.stringify(join(root, 'env-client.ts'))} }`,
    `{ find: '@/lib/orpc/client', replacement: ${JSON.stringify(join(root, 'orpc-client.ts'))} }`,
    `{ find: '@better-upload/client', replacement: ${JSON.stringify(join(root, 'upload-client.ts'))} }`,
    `{ find: '@', replacement: ${JSON.stringify(sourceRoot)} }`,
  ].join(',\n      ');
  await writeFile(
    join(root, 'vite.config.mjs'),
    `import { defineConfig } from ${fileUrl(viteEntry)};
import react from ${fileUrl(reactPlugin)};
export default defineConfig({
  root: ${JSON.stringify(root)},
  plugins: [react()],
  resolve: { alias: [${aliases}] },
  server: {
    host: '127.0.0.1',
    strictPort: true,
    fs: { allow: [${JSON.stringify(root)}, ${JSON.stringify(project)}] },
  },
});
`,
  );
  return { root, viteCli };
}

async function chooseFileByGesture(page, trigger, gesture, file) {
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    gesture === 'click' ? trigger.click() : trigger.press('Enter'),
  ]);
  await chooser.setFiles(file);
}

async function waitForRequestCount(page, count) {
  await page.waitForFunction(
    (expected) => globalThis.__uploadMock?.requests.length === expected,
    count,
  );
}

async function settleUpload(page, index, outcome) {
  await page.evaluate(
    ({ requestIndex, result }) => globalThis.__uploadMock[result](requestIndex),
    { requestIndex: index, result: outcome },
  );
  await page.waitForFunction(
    (requestIndex) => globalThis.__uploadMock.requests[requestIndex].settled,
    index,
  );
}

function imageFile(name) {
  return {
    name,
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2S9sAAAAASUVORK5CYII=',
      'base64',
    ),
  };
}

async function evaluate() {
  const options = parseArguments(process.argv.slice(2));
  const project = await realpath(options.project);
  await access(join(options.evaluatorRuntime, 'package.json'));
  const runtimeRequire = createRequire(join(options.evaluatorRuntime, 'package.json'));
  const { chromium } = runtimeRequire('playwright');
  const AxeBuilder = runtimeRequire('@axe-core/playwright').default;
  const harness = await createHarness(project);
  const port = await reservePort();
  const origin = `http://127.0.0.1:${port}`;
  const server = spawn(
    process.execPath,
    [harness.viteCli, '--config', join(harness.root, 'vite.config.mjs'), '--port', String(port)],
    {
      cwd: project,
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
    await waitForServer(origin, server);
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1100, height: 900 } });
    const page = await context.newPage();
    page.setDefaultTimeout(7_000);
    const runtimeErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => runtimeErrors.push(`page: ${error.message}`));

    const checks = {
      integratedBookFormMounted: false,
      localeSemanticsReachTheRealFileInput: false,
      clickSelectionAndPendingState: false,
      successfulUploadUpdatesFormAndPreview: false,
      keyboardSelectionReportsAccessibleError: false,
      sameFileReplacement: false,
      dragAndDropSelection: false,
      submitSerializesCoverId: false,
      clearRestoresEmptyFormValue: false,
      disabledFormBlocksEveryInputPath: false,
      integratedFormHasNoAxeViolations: false,
      browserConsoleClean: false,
    };
    const evidenceErrors = [];
    const axeViolations = [];
    const diagnostics = {};
    const check = async (id, operation) => {
      try {
        checks[id] = Boolean(await operation());
      } catch (error) {
        evidenceErrors.push(`${id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    await check('integratedBookFormMounted', async () => {
      const response = await page.goto(origin, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => globalThis.__bookFormEvaluator?.ready === true);
      return (
        Boolean(response?.ok()) &&
        (await page.locator('[data-case="active"]').count()) === 1 &&
        (await page.locator('[data-case="disabled"]').count()) === 1
      );
    });
    if (!checks.integratedBookFormMounted) {
      throw new Error(
        `Integrated book form did not mount: ${[...runtimeErrors, ...serverErrors].join(' | ').slice(0, 8_000)}`,
      );
    }

    const active = page.locator('[data-case="active"]');
    const disabled = page.locator('[data-case="disabled"]');
    const activeInput = active.locator('input[type="file"]');
    const activeTrigger = active.locator('[role="button"]:has(input[type="file"])');

    await check('localeSemanticsReachTheRealFileInput', async () => {
      const snapshots = [];
      for (const locale of ['en', 'fr', 'ar', 'sw']) {
        await page.evaluate(
          (nextLocale) => globalThis.__bookFormEvaluator.setLocale(nextLocale),
          locale,
        );
        await page.waitForFunction(
          (nextLocale) => document.documentElement.lang === nextLocale,
          locale,
        );
        if ((await activeInput.count()) !== 1) return false;
        snapshots.push(
          await activeInput.evaluate((element) => {
            const descriptionIds = (element.getAttribute('aria-describedby') ?? '')
              .split(/\s+/u)
              .filter(Boolean);
            const descriptionNodes = descriptionIds
              .map((id) => document.getElementById(id))
              .filter(Boolean);
            let field = element.parentElement;
            while (
              field &&
              descriptionNodes.some((description) => !field.contains(description))
            ) {
              field = field.parentElement;
            }
            return {
              label: [...(field?.querySelectorAll('label') ?? [])]
                .map((label) => label.textContent?.trim() ?? '')
                .filter(Boolean)
                .join(' '),
              description: descriptionNodes
                .map((description) => description.textContent?.trim() ?? '')
                .filter(Boolean)
                .join(' '),
              direction: document.documentElement.dir,
            };
          }),
        );
      }
      diagnostics.localeSnapshots = snapshots;
      await page.evaluate(() => globalThis.__bookFormEvaluator.setLocale('en'));
      return (
        snapshots.length === 4 &&
        snapshots.every((snapshot) => snapshot.label && snapshot.description) &&
        new Set(snapshots.map((snapshot) => snapshot.label)).size >= 3 &&
        snapshots[2].direction === 'rtl'
      );
    });

    let firstRequest = null;
    await check('clickSelectionAndPendingState', async () => {
      if ((await activeTrigger.count()) !== 1 || (await activeInput.count()) !== 1) return false;
      firstRequest = await page.evaluate(() => globalThis.__uploadMock.requests.length);
      const before = (await activeTrigger.innerText()).trim();
      await chooseFileByGesture(page, activeTrigger, 'click', imageFile('cover-a.png'));
      await waitForRequestCount(page, firstRequest + 1);
      const pending = (await activeTrigger.innerText()).trim();
      return pending.length > 0 && pending !== before && (await activeInput.isDisabled());
    });

    await check('successfulUploadUpdatesFormAndPreview', async () => {
      if (firstRequest === null) return false;
      await settleUpload(page, firstRequest, 'complete');
      await page.waitForFunction(() => Boolean(globalThis.__bookFormCases.active.getCoverId()));
      const preview = active.locator('img[src^="blob:"]');
      await preview.waitFor({ state: 'visible' });
      const box = await preview.boundingBox();
      return (
        typeof (await page.evaluate(() => globalThis.__bookFormCases.active.getCoverId())) ===
          'string' &&
        !(await activeInput.isDisabled()) &&
        Boolean(box && box.width > 0 && box.height > 0)
      );
    });

    await check('keyboardSelectionReportsAccessibleError', async () => {
      const requestIndex = await page.evaluate(() => globalThis.__uploadMock.requests.length);
      await chooseFileByGesture(page, activeTrigger, 'keyboard', imageFile('cover-error.png'));
      await waitForRequestCount(page, requestIndex + 1);
      await settleUpload(page, requestIndex, 'fail');
      const feedback = page.locator('[data-sonner-toast]');
      await feedback.waitFor({ state: 'visible' });
      const semantics = await feedback.evaluate((element) => ({
        live: element.closest('[aria-live]')?.getAttribute('aria-live') ?? null,
        role: element.getAttribute('role'),
        text: element.textContent?.trim() ?? '',
      }));
      diagnostics.errorFeedback = {
        ...semantics,
      };
      return (
        semantics.text.length > 0 &&
        (['alert', 'status'].includes(semantics.role ?? '') ||
          ['assertive', 'polite'].includes(semantics.live ?? '')) &&
        !(await activeInput.isDisabled())
      );
    });

    await check('sameFileReplacement', async () => {
      const file = imageFile('repeat.png');
      const first = await page.evaluate(() => globalThis.__uploadMock.requests.length);
      await activeInput.setInputFiles(file);
      await waitForRequestCount(page, first + 1);
      await settleUpload(page, first, 'complete');
      await page.waitForFunction(
        (requestIndex) =>
          globalThis.__bookFormCases.active.getCoverId() ===
          `evaluator/${requestIndex}/repeat.png`,
        first,
      );
      const second = first + 1;
      await activeInput.setInputFiles(file);
      await waitForRequestCount(page, second + 1);
      await settleUpload(page, second, 'complete');
      await page.waitForFunction(
        (requestIndex) =>
          globalThis.__bookFormCases.active.getCoverId() ===
          `evaluator/${requestIndex}/repeat.png`,
        second,
      );
      return second > first;
    });

    await check('dragAndDropSelection', async () => {
      const requestIndex = await page.evaluate(() => globalThis.__uploadMock.requests.length);
      await activeTrigger.evaluate((element) => {
        const transfer = new DataTransfer();
        transfer.items.add(new File(['drop-image'], 'drop.png', { type: 'image/png' }));
        for (const type of ['dragenter', 'dragover', 'drop']) {
          element.dispatchEvent(
            new DragEvent(type, {
              bubbles: true,
              cancelable: true,
              dataTransfer: transfer,
            }),
          );
        }
      });
      await waitForRequestCount(page, requestIndex + 1);
      await settleUpload(page, requestIndex, 'complete');
      await page.waitForFunction(
        (expected) => globalThis.__bookFormCases.active.getCoverId() === expected,
        `evaluator/${requestIndex}/drop.png`,
      );
      return (await active.locator('img[src^="blob:"]').count()) === 1;
    });

    await check('submitSerializesCoverId', async () => {
      const coverId = await page.evaluate(() => globalThis.__bookFormCases.active.getCoverId());
      await active.locator('[data-submit]').click();
      await page.waitForFunction(() => globalThis.__bookFormEvidence.submissions.length > 0);
      const submission = await page.evaluate(() => globalThis.__bookFormEvidence.submissions.at(-1));
      return Boolean(coverId && submission?.value?.coverId === coverId);
    });

    await check('clearRestoresEmptyFormValue', async () => {
      const clear = activeTrigger.locator('button');
      if ((await clear.count()) !== 1) return false;
      await clear.click();
      await page.waitForFunction(() => globalThis.__bookFormCases.active.getCoverId() == null);
      return (
        (await active.locator('img[src^="blob:"]').count()) === 0 &&
        (await activeInput.getAttribute('value')) !== 'drop.png'
      );
    });

    await check('disabledFormBlocksEveryInputPath', async () => {
      const input = disabled.locator('input[type="file"]');
      const trigger = disabled.locator('[role="button"]:has(input[type="file"])');
      if ((await input.count()) !== 1 || (await trigger.count()) !== 1) return false;
      const before = await page.evaluate(() => globalThis.__uploadMock.requests.length);
      await trigger.evaluate((element) => {
        element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        element.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
        );
        const transfer = new DataTransfer();
        transfer.items.add(new File(['blocked'], 'blocked.png', { type: 'image/png' }));
        element.dispatchEvent(
          new DragEvent('drop', {
            bubbles: true,
            cancelable: true,
            dataTransfer: transfer,
          }),
        );
      });
      await delay(100);
      const after = await page.evaluate(() => globalThis.__uploadMock.requests.length);
      return (
        before === after &&
        (await input.isDisabled()) &&
        ((await trigger.getAttribute('aria-disabled')) === 'true' ||
          (await trigger.getAttribute('tabindex')) === null)
      );
    });

    await check('integratedFormHasNoAxeViolations', async () => {
      for (const input of [activeInput, disabled.locator('input[type="file"]')]) {
        await input.evaluate((element) => {
          const descriptionIds = (element.getAttribute('aria-describedby') ?? '')
            .split(/\s+/u)
            .filter(Boolean);
          const descriptionNodes = descriptionIds
            .map((id) => document.getElementById(id))
            .filter(Boolean);
          let field = element.parentElement;
          while (
            field &&
            descriptionNodes.some((description) => !field.contains(description))
          ) {
            field = field.parentElement;
          }
          field?.setAttribute('data-evaluator-upload-field', '');
        });
      }
      const report = await new AxeBuilder({ page })
        .include('[data-evaluator-upload-field]')
        .disableRules(['color-contrast'])
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      axeViolations.push(
        ...report.violations.map(({ id, impact, nodes }) => ({
          id,
          impact,
          targets: nodes.map((node) => node.target),
        })),
      );
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
        accessibilityViolations: checks.integratedFormHasNoAxeViolations ? 0 : 1,
      },
      checks: Object.entries(checks).map(([id, passed]) => ({ id, passed })),
      failures,
      evidenceErrors,
      axeViolations,
      diagnostics,
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
