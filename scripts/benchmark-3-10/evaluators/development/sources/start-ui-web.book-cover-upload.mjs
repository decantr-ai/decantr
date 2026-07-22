#!/usr/bin/env node
import { spawn } from "node:child_process";
import { once } from "node:events";
import {
  access,
  mkdtemp,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    const value = argv[++index];
    if (!value) throw new Error(`Missing value for ${option}`);
    if (option === "--workspace") options.workspace = resolve(value);
    else if (option === "--project-path") options.projectPath = value;
    else if (option === "--evaluator-runtime")
      options.evaluatorRuntime = resolve(value);
    else throw new Error(`Unknown option: ${option}`);
  }
  if (
    !options.workspace ||
    options.projectPath === undefined ||
    !options.evaluatorRuntime
  ) {
    throw new Error(
      "Expected --workspace, --project-path, and --evaluator-runtime",
    );
  }
  return options;
}

function resolveProject(workspace, projectPath) {
  const project = resolve(workspace, projectPath);
  const relation = relative(workspace, project);
  if (
    relation === ".." ||
    relation.startsWith(`..${sep}`) ||
    isAbsolute(relation)
  ) {
    throw new Error("Project path escapes the workspace");
  }
  return project;
}

async function reservePort() {
  const server = createServer();
  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Could not reserve a browser port");
  await new Promise((resolveClose, reject) =>
    server.close((error) => (error ? reject(error) : resolveClose())),
  );
  return address.port;
}

async function waitForServer(url, child) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null)
      throw new Error(`Component server exited with ${child.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.status < 500) return;
    } catch {
      // The fixed server is still starting.
    }
    await delay(250);
  }
  throw new Error("Timed out waiting for the component server");
}

async function stopProcess(child) {
  if (child.exitCode !== null) return;
  child.kill("SIGTERM");
  await Promise.race([once(child, "exit"), delay(5_000)]);
  if (child.exitCode === null) {
    child.kill("SIGKILL");
    await once(child, "exit").catch(() => {});
  }
}

function fileUrl(path) {
  return JSON.stringify(pathToFileURL(path).href);
}

async function createHarness(project) {
  const root = await realpath(
    await mkdtemp(join(tmpdir(), "decantr-upload-evaluator-")),
  );
  const projectRequire = createRequire(join(project, "package.json"));
  const viteEntry = projectRequire.resolve("vite");
  const viteCli = join(
    dirname(projectRequire.resolve("vite/package.json")),
    "bin",
    "vite.js",
  );
  const reactPlugin = projectRequire.resolve("@vitejs/plugin-react");
  const sourceRoot = join(project, "src");
  const uploadInput = join(
    sourceRoot,
    "components",
    "upload",
    "upload-input.tsx",
  );
  await access(uploadInput);
  await access(join(project, "node_modules"));
  await symlink(
    join(project, "node_modules"),
    join(root, "node_modules"),
    "dir",
  );

  await writeFile(
    join(root, "index.html"),
    '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="app"></div><script type="module" src="/src.tsx"></script></body></html>',
  );
  await writeFile(
    join(root, "env-client.ts"),
    "export const envClient = { VITE_BASE_URL: 'http://127.0.0.1', VITE_IS_DEMO: false, VITE_S3_BUCKET_PUBLIC_URL: 'https://assets.invalid' };\n",
  );
  await writeFile(
    join(root, "upload-client.ts"),
    `const control = globalThis.__uploadMock ??= {
  requests: [],
  states: [],
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
  control.states.push({ index, status: 'pending', name: options.file.name });
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
    join(root, "style.css"),
    `body { margin: 0; padding: 24px; font: 16px/1.4 system-ui, sans-serif; color: #161616; background: #fff; }
#app { display: grid; gap: 24px; max-width: 760px; }
[data-case] { display: grid; gap: 8px; padding: 16px; border: 1px solid #888; }
[role="button"] { min-height: 36px; padding: 6px 10px; border: 1px solid #666; }
[role="button"] img { width: 32px; height: 32px; }
[role="alert"], [role="status"] { min-height: 1em; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); }
input[type="file"] { display: none; }
`,
  );
  await writeFile(
    join(root, "src.tsx"),
    `import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n/index';
import { Form, FormField, FormFieldController, FormFieldHelper, FormFieldLabel } from '@/components/form';
import { UploadInput } from '@/components/upload/upload-input';
import './style.css';

const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false }, queries: { retry: false } } });
const evidence = globalThis.__uploadEvidence = {
  successes: [], errors: [], clears: 0, stateEvents: [], formValues: [], submissions: [], localeSnapshots: [],
};

function Harness() {
  const { t } = useTranslation(['book', 'components']);
  const [directError, setDirectError] = useState('');
  const form = useForm({ defaultValues: { coverId: null }, mode: 'onChange' });
  const coverId = form.watch('coverId');
  useEffect(() => { evidence.formValues.push(coverId); }, [coverId]);

  useEffect(() => {
    globalThis.__uploadEvaluator = {
      ready: true,
      getFormValue: () => form.getValues('coverId'),
      async setLocale(locale) {
        await i18n.changeLanguage(locale);
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
        await new Promise((resolve) => setTimeout(resolve, 0));
      },
    };
  }, [form]);

  return <>
    <section data-case="locale">
      <label data-locale-label>{t('book:common.uploadCover.label')}</label>
      <p data-locale-helper>{t('book:common.uploadCover.helper')}</p>
      <span data-locale-placeholder>{t('components:uploadInput.placeholder')}</span>
    </section>

    <section data-case="direct">
      <UploadInput
        uploadRoute="bookCover"
        inputProps={{ accept: 'image/png,image/jpeg' }}
        onUploadStateChange={(file) => evidence.stateEvents.push({ status: file.status, name: file.name })}
        onSuccess={(file) => { evidence.successes.push(file.objectInfo.key); setDirectError(''); }}
        onError={(error) => { evidence.errors.push(error.message); setDirectError(error.message); }}
        onClear={() => { evidence.clears += 1; setDirectError(''); }}
      />
      <div role="alert" data-upload-error>{directError}</div>
    </section>

    <section data-case="disabled">
      <UploadInput disabled uploadRoute="bookCover" />
    </section>

    <section data-case="form">
      <Form {...form} onSubmit={(value) => evidence.submissions.push(value)}>
        <FormField id="evaluator-cover-field">
          <FormFieldLabel>Cover</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="upload-input"
            name="coverId"
            rules={{ required: 'A cover is required' }}
            uploadRoute="bookCover"
            inputProps={{ accept: 'image/png,image/jpeg' }}
          />
          <FormFieldHelper>Choose an image file</FormFieldHelper>
        </FormField>
        <button type="submit" data-submit>Submit</button>
      </Form>
    </section>
  </>;
}

createRoot(document.getElementById('app')).render(
  <QueryClientProvider client={queryClient}><Harness /></QueryClientProvider>,
);
`,
  );

  const aliases = [
    `{ find: '@/env/client', replacement: ${JSON.stringify(join(root, "env-client.ts"))} }`,
    `{ find: '@better-upload/client', replacement: ${JSON.stringify(join(root, "upload-client.ts"))} }`,
    `{ find: '@', replacement: ${JSON.stringify(sourceRoot)} }`,
  ].join(",\n      ");
  await writeFile(
    join(root, "vite.config.mjs"),
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
    page.waitForEvent("filechooser"),
    gesture === "click" ? trigger.click() : trigger.press("Enter"),
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

async function evaluate() {
  const options = parseArgs(process.argv.slice(2));
  const project = await realpath(
    resolveProject(options.workspace, options.projectPath),
  );
  await access(join(options.evaluatorRuntime, "package.json"));
  const runtimeRequire = createRequire(
    join(options.evaluatorRuntime, "package.json"),
  );
  const { chromium } = runtimeRequire("playwright");
  const AxeBuilder = runtimeRequire("@axe-core/playwright").default;
  const harness = await createHarness(project);
  const port = await reservePort();
  const origin = `http://127.0.0.1:${port}`;
  const server = spawn(
    process.execPath,
    [
      harness.viteCli,
      "--config",
      join(harness.root, "vite.config.mjs"),
      "--port",
      String(port),
    ],
    {
      cwd: project,
      env: { ...process.env, NODE_ENV: "development", NO_COLOR: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  const serverErrors = [];
  for (const stream of [server.stdout, server.stderr]) {
    stream.on("data", (chunk) => {
      if (serverErrors.join("").length < 8_000)
        serverErrors.push(chunk.toString());
    });
  }

  let browser;
  try {
    await waitForServer(origin, server);
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1100, height: 900 },
    });
    const page = await context.newPage();
    page.setDefaultTimeout(7_000);
    const runtimeErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error")
        runtimeErrors.push(`console: ${message.text()}`);
    });
    page.on("pageerror", (error) =>
      runtimeErrors.push(`page: ${error.message}`),
    );
    page.on("response", (response) => {
      if (
        ["script", "stylesheet"].includes(response.request().resourceType()) &&
        response.headers()["content-type"]?.includes("text/html")
      ) {
        runtimeErrors.push(`asset-returned-html: ${response.url()}`);
      }
    });

    const checks = {
      componentMounted: false,
      allLocalesResolveInBrowser: false,
      clickSelectionAndPendingState: false,
      successfulUploadAndImagePreview: false,
      keyboardSelectionAndErrorFeedback: false,
      sameFileReplacement: false,
      dragAndDropSelection: false,
      clearRestoresEmptyState: false,
      disabledBlocksEveryInputPath: false,
      formErrorIsProgrammaticallyDescribed: false,
      formValueTracksUploadAndClear: false,
      componentHasNoAxeViolations: false,
      browserConsoleClean: false,
    };
    const evidenceErrors = [];
    const axeViolations = [];
    const check = async (id, operation) => {
      try {
        checks[id] = Boolean(await operation());
      } catch (error) {
        evidenceErrors.push(
          `${id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    };

    await check("componentMounted", async () => {
      const response = await page.goto(origin, { waitUntil: "networkidle" });
      await page.waitForFunction(
        () => globalThis.__uploadEvaluator?.ready === true,
      );
      return (
        Boolean(response?.ok()) &&
        (await page.locator("[data-case]").count()) === 4
      );
    });
    if (!checks.componentMounted) {
      throw new Error(
        `Component harness did not mount: ${[...runtimeErrors, ...serverErrors].join(" | ").slice(0, 8_000)}`,
      );
    }

    await check("allLocalesResolveInBrowser", async () => {
      const snapshots = [];
      for (const locale of ["en", "fr", "ar", "sw"]) {
        await page.evaluate(
          (nextLocale) => globalThis.__uploadEvaluator.setLocale(nextLocale),
          locale,
        );
        await page.waitForFunction(
          (nextLocale) => document.documentElement.lang === nextLocale,
          locale,
        );
        snapshots.push(
          await page.locator('[data-case="locale"]').evaluate((element) => ({
            label:
              element
                .querySelector("[data-locale-label]")
                ?.textContent?.trim() ?? "",
            helper:
              element
                .querySelector("[data-locale-helper]")
                ?.textContent?.trim() ?? "",
            placeholder:
              element
                .querySelector("[data-locale-placeholder]")
                ?.textContent?.trim() ?? "",
            direction: document.documentElement.dir,
          })),
        );
      }
      return (
        snapshots.length === 4 &&
        snapshots.every(
          (snapshot) =>
            snapshot.label && snapshot.helper && snapshot.placeholder,
        ) &&
        new Set(snapshots.map((snapshot) => snapshot.label)).size >= 3 &&
        snapshots[2].direction === "rtl"
      );
    });

    const direct = page.locator('[data-case="direct"]');
    const directTrigger = direct.locator('[role="button"]').first();
    const directInput = direct.locator('input[type="file"]');
    const imageFile = {
      name: "cover-a.png",
      mimeType: "image/png",
      buffer: Buffer.from(EMPTY_IMAGE),
    };
    let clickRequestIndex = null;
    await check("clickSelectionAndPendingState", async () => {
      clickRequestIndex = await page.evaluate(
        () => globalThis.__uploadMock.requests.length,
      );
      const initialName =
        (await directTrigger.getAttribute("aria-label").catch(() => null)) ??
        (await directTrigger.innerText()).trim();
      await chooseFileByGesture(page, directTrigger, "click", imageFile);
      await waitForRequestCount(page, clickRequestIndex + 1);
      const pendingName = (await directTrigger.innerText()).trim();
      return (
        pendingName.length > 0 &&
        pendingName !== initialName &&
        (await directInput.isDisabled()) &&
        (await directTrigger.locator("button").count()) === 0
      );
    });

    await check("successfulUploadAndImagePreview", async () => {
      if (clickRequestIndex === null) return false;
      const successCount = await page.evaluate(
        () => globalThis.__uploadEvidence.successes.length,
      );
      await settleUpload(page, clickRequestIndex, "complete");
      await page.waitForFunction(
        (count) => globalThis.__uploadEvidence.successes.length === count + 1,
        successCount,
      );
      const preview = direct.locator("img");
      await preview.waitFor({ state: "visible" });
      const box = await preview.boundingBox();
      const source = await preview.getAttribute("src");
      return (
        !(await directInput.isDisabled()) &&
        (await directTrigger.locator("button").count()) === 1 &&
        source?.startsWith("blob:") === true &&
        Boolean(box && box.width > 0 && box.height > 0)
      );
    });

    await check("keyboardSelectionAndErrorFeedback", async () => {
      const requestIndex = await page.evaluate(
        () => globalThis.__uploadMock.requests.length,
      );
      const errorCount = await page.evaluate(
        () => globalThis.__uploadEvidence.errors.length,
      );
      await chooseFileByGesture(page, directTrigger, "keyboard", {
        name: "cover-error.png",
        mimeType: "image/png",
        buffer: Buffer.from(EMPTY_IMAGE),
      });
      await waitForRequestCount(page, requestIndex + 1);
      await settleUpload(page, requestIndex, "fail");
      await page.waitForFunction(
        (count) => globalThis.__uploadEvidence.errors.length === count + 1,
        errorCount,
      );
      const alert = direct.getByRole("alert");
      return (
        (await alert.innerText()).trim().length > 0 &&
        !(await directInput.isDisabled()) &&
        (await directTrigger.locator("button").count()) === 1
      );
    });

    await check("sameFileReplacement", async () => {
      const sameFile = {
        name: "repeat.png",
        mimeType: "image/png",
        buffer: Buffer.from(EMPTY_IMAGE),
      };
      const firstIndex = await page.evaluate(
        () => globalThis.__uploadMock.requests.length,
      );
      const successCount = await page.evaluate(
        () => globalThis.__uploadEvidence.successes.length,
      );
      await directInput.setInputFiles(sameFile);
      await waitForRequestCount(page, firstIndex + 1);
      await settleUpload(page, firstIndex, "complete");
      await page.waitForFunction(
        (count) => globalThis.__uploadEvidence.successes.length === count + 1,
        successCount,
      );
      const secondIndex = firstIndex + 1;
      await directInput.setInputFiles(sameFile);
      await waitForRequestCount(page, secondIndex + 1);
      await settleUpload(page, secondIndex, "complete");
      await page.waitForFunction(
        (count) => globalThis.__uploadEvidence.successes.length === count + 2,
        successCount,
      );
      const keys = await page.evaluate(() =>
        globalThis.__uploadEvidence.successes.slice(-2),
      );
      return keys.length === 2 && keys[0] !== keys[1];
    });

    await check("dragAndDropSelection", async () => {
      const requestIndex = await page.evaluate(
        () => globalThis.__uploadMock.requests.length,
      );
      const successCount = await page.evaluate(
        () => globalThis.__uploadEvidence.successes.length,
      );
      await directTrigger.evaluate((element) => {
        const transfer = new DataTransfer();
        transfer.items.add(
          new File(["drop-image"], "drop.png", { type: "image/png" }),
        );
        element.dispatchEvent(
          new DragEvent("dragenter", {
            bubbles: true,
            cancelable: true,
            dataTransfer: transfer,
          }),
        );
        element.dispatchEvent(
          new DragEvent("dragover", {
            bubbles: true,
            cancelable: true,
            dataTransfer: transfer,
          }),
        );
        element.dispatchEvent(
          new DragEvent("drop", {
            bubbles: true,
            cancelable: true,
            dataTransfer: transfer,
          }),
        );
      });
      await waitForRequestCount(page, requestIndex + 1);
      await settleUpload(page, requestIndex, "complete");
      await page.waitForFunction(
        (count) => globalThis.__uploadEvidence.successes.length === count + 1,
        successCount,
      );
      return (await direct.locator("img").count()) === 1;
    });

    await check("clearRestoresEmptyState", async () => {
      const selectedName = (await directTrigger.innerText()).trim();
      await directTrigger.locator("button").click();
      await page.waitForFunction(() => globalThis.__uploadEvidence.clears >= 1);
      const emptyName = (await directTrigger.innerText()).trim();
      return (
        selectedName.length > 0 &&
        emptyName.length > 0 &&
        selectedName !== emptyName &&
        (await direct.locator("img").count()) === 0
      );
    });

    await check("disabledBlocksEveryInputPath", async () => {
      const disabled = page.locator('[data-case="disabled"]');
      const trigger = disabled.locator('[role="button"]');
      const before = await page.evaluate(
        () => globalThis.__uploadMock.requests.length,
      );
      await trigger.evaluate((element) => {
        element.dispatchEvent(
          new MouseEvent("click", { bubbles: true, cancelable: true }),
        );
        element.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Enter",
            bubbles: true,
            cancelable: true,
          }),
        );
        const transfer = new DataTransfer();
        transfer.items.add(
          new File(["blocked"], "blocked.png", { type: "image/png" }),
        );
        element.dispatchEvent(
          new DragEvent("drop", {
            bubbles: true,
            cancelable: true,
            dataTransfer: transfer,
          }),
        );
      });
      await delay(100);
      const after = await page.evaluate(
        () => globalThis.__uploadMock.requests.length,
      );
      return (
        before === after &&
        (await disabled.locator('input[type="file"]').isDisabled()) &&
        (await trigger.getAttribute("tabindex")) === null
      );
    });

    const formCase = page.locator('[data-case="form"]');
    const formTrigger = formCase.locator('[role="button"]').first();
    const formInput = formCase.locator('input[type="file"]');
    await check("formErrorIsProgrammaticallyDescribed", async () => {
      await formCase.locator("[data-submit]").click();
      const alert = formCase.getByRole("alert");
      await alert.waitFor({ state: "visible" });
      const describedBy =
        (await formInput.getAttribute("aria-describedby"))
          ?.split(/\s+/u)
          .filter(Boolean) ?? [];
      const allTargetsExist = await page.evaluate(
        (ids) => ids.every((id) => Boolean(document.getElementById(id))),
        describedBy,
      );
      return (
        (await formInput.getAttribute("aria-invalid")) === "true" &&
        describedBy.length >= 2 &&
        allTargetsExist &&
        (await alert.innerText()).trim().length > 0
      );
    });

    await check("formValueTracksUploadAndClear", async () => {
      const requestIndex = await page.evaluate(
        () => globalThis.__uploadMock.requests.length,
      );
      await chooseFileByGesture(page, formTrigger, "click", {
        name: "form-cover.png",
        mimeType: "image/png",
        buffer: Buffer.from(EMPTY_IMAGE),
      });
      await waitForRequestCount(page, requestIndex + 1);
      await settleUpload(page, requestIndex, "complete");
      await page.waitForFunction(() =>
        Boolean(globalThis.__uploadEvaluator.getFormValue()),
      );
      const uploadedValue = await page.evaluate(() =>
        globalThis.__uploadEvaluator.getFormValue(),
      );
      await formTrigger.locator("button").click();
      await page.waitForFunction(
        () => globalThis.__uploadEvaluator.getFormValue() == null,
      );
      return typeof uploadedValue === "string" && uploadedValue.length > 0;
    });

    await check("componentHasNoAxeViolations", async () => {
      const report = await new AxeBuilder({ page })
        .include("#app")
        .disableRules(["color-contrast"])
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      axeViolations.push(
        ...report.violations.map(({ id, impact }) => ({ id, impact })),
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
        accessibilityViolations: checks.componentHasNoAxeViolations ? 0 : 1,
      },
      checks: Object.entries(checks).map(([id, passed]) => ({ id, passed })),
      failures,
      evidenceErrors,
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

const EMPTY_IMAGE = "evaluator-image-bytes";

try {
  const result = await evaluate();
  console.log(JSON.stringify(result));
  if (!result.passed) process.exitCode = 1;
} catch (error) {
  console.log(
    JSON.stringify({
      passed: false,
      metrics: { governanceViolations: 0, accessibilityViolations: 1 },
      checks: [{ id: "evaluator-runtime", passed: false }],
      failures: [error instanceof Error ? error.message : String(error)],
    }),
  );
  process.exitCode = 1;
}
