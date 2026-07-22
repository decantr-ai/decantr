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

const INITIAL = Object.freeze({
  ui_font_family: 'Evaluator UI Initial',
  editor_font_family: 'Evaluator Editor Initial',
  ui_font_size: 17,
  editor_font_size: 19,
  enable_spell_check: true,
});
const UPDATED = Object.freeze({
  ui_font_family: 'Evaluator UI Updated',
  editor_font_family: 'Evaluator Editor Updated',
  ui_font_size: 21,
  editor_font_size: 23,
  enable_spell_check: false,
});

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

function fileUrl(path) {
  return JSON.stringify(pathToFileURL(path).href);
}

async function reservePort() {
  const server = createServer();
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Could not reserve a component port');
  await new Promise((resolveClose, reject) => server.close((error) => (error ? reject(error) : resolveClose())));
  return address.port;
}

async function waitForServer(url, child) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Solid component server exited with ${child.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.status < 500) return;
    } catch {
      // The fixed server is still starting.
    }
    await delay(250);
  }
  throw new Error('Timed out waiting for the Solid component server');
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

async function createHarness(project) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'decantr-solid-font-evaluator-')));
  const projectRequire = createRequire(join(project, 'package.json'));
  const viteEntry = projectRequire.resolve('vite');
  const viteCli = join(dirname(projectRequire.resolve('vite/package.json')), 'bin', 'vite.js');
  const solidCommonJs = projectRequire.resolve('vite-plugin-solid');
  const solidPlugin = join(dirname(dirname(solidCommonJs)), 'esm', 'index.mjs');
  const tailwindPlugin = projectRequire.resolve('@tailwindcss/vite');
  const appRoot = join(project, 'src-app');
  const rootSource = join(appRoot, 'routes', '__root.tsx');
  const globalStyles = join(appRoot, 'styles', 'globals.css');
  await access(rootSource);
  await access(globalStyles);
  await access(join(project, 'node_modules'));
  await symlink(join(project, 'node_modules'), join(root, 'node_modules'), 'dir');

  await writeFile(
    join(root, 'index.html'),
    '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Typography runtime evaluator</title></head><body><div id="app"></div><script type="module" src="/src.tsx"></script></body></html>',
  );
  await writeFile(
    join(root, 'router.ts'),
    `export const createRootRoute = (options) => ({ options });
export const Outlet = () => null;
`,
  );
  await writeFile(
    join(root, 'tauri-event.ts'),
    `export async function listen() {
  globalThis.__solidEvidence.listen += 1;
  return () => { globalThis.__solidEvidence.unlisten += 1; };
}
`,
  );
  await writeFile(
    join(root, 'settings.ts'),
    `import { atom } from 'nanostores';
export const uiSettings = atom(${JSON.stringify(INITIAL)});
export const themeMode = atom('light');
export const currentTheme = atom('evaluator-light');
export const settingsStore = atom({});
export const systemThemeStore = atom('light');
export async function loadSettings() { globalThis.__solidEvidence.settingsLoaded += 1; }
export function setUi(next) { uiSettings.set({ ...uiSettings.get(), ...next }); }
export function setTheme(mode, theme) { themeMode.set(mode); currentTheme.set(theme); }
`,
  );
  await writeFile(join(root, 'boundaries.ts'), 'export const AppLoader = () => null;\n');
  await writeFile(join(root, 'toast.ts'), 'export const ToastProvider = () => null;\n');
  await writeFile(
    join(root, 'app-info.ts'),
    `export const useAppInfo = () => ({ init: async () => { globalThis.__solidEvidence.appInfoInitialized += 1; } });
`,
  );
  await writeFile(join(root, 'errors.ts'), 'export const GlobalNotFound = () => null;\n');
  await writeFile(
    join(root, 'src.tsx'),
    `import { render } from 'solid-js/web';
import ${JSON.stringify(`/@fs/${globalStyles}`)};
import { Route } from ${JSON.stringify(`/@fs/${rootSource}`)};
import { setTheme, setUi } from './settings';

globalThis.__solidEvidence = {
  listen: 0,
  unlisten: 0,
  settingsLoaded: 0,
  appInfoInitialized: 0,
  mediaAdded: 0,
  mediaRemoved: 0,
};
const mediaListeners = new Set();
window.matchMedia = () => ({
  matches: false,
  media: '(prefers-color-scheme: dark)',
  onchange: null,
  addEventListener(_type, listener) { mediaListeners.add(listener); globalThis.__solidEvidence.mediaAdded += 1; },
  removeEventListener(_type, listener) { mediaListeners.delete(listener); globalThis.__solidEvidence.mediaRemoved += 1; },
  addListener(listener) { mediaListeners.add(listener); },
  removeListener(listener) { mediaListeners.delete(listener); },
  dispatchEvent() { return true; },
});

const Component = Route.options.component;
const documentMarker = crypto.randomUUID();
const dispose = render(() => <Component />, document.getElementById('app'));

function snapshot() {
  const elements = [document.documentElement, document.body];
  return {
    documentMarker,
    navigationCount: performance.getEntriesByType('navigation').length,
    appearance: document.documentElement.getAttribute('data-appearance'),
    theme: document.documentElement.getAttribute('data-theme'),
    entries: elements.flatMap((element, elementIndex) =>
      [...element.style].map((property) => ({
        elementIndex,
        property,
        value: element.style.getPropertyValue(property).trim(),
      })),
    ),
    evidence: { ...globalThis.__solidEvidence },
  };
}

globalThis.__fontEvaluator = {
  snapshot,
  updateUi: (next) => setUi(next),
  updateTheme: (mode, theme) => setTheme(mode, theme),
  dispose,
  clearInlineAndReadDefaults(bindings) {
    const elements = [document.documentElement, document.body];
    for (const binding of bindings) elements[binding.elementIndex].style.removeProperty(binding.property);
    return bindings.map((binding) => ({
      ...binding,
      value: getComputedStyle(elements[binding.elementIndex]).getPropertyValue(binding.property).trim(),
    }));
  },
};
`,
  );

  const aliases = [
    `{ find: '@tanstack/solid-router', replacement: ${JSON.stringify(join(root, 'router.ts'))} }`,
    `{ find: '@tauri-apps/api/event', replacement: ${JSON.stringify(join(root, 'tauri-event.ts'))} }`,
    `{ find: '#/components/boundaries', replacement: ${JSON.stringify(join(root, 'boundaries.ts'))} }`,
    `{ find: '#/components/toast', replacement: ${JSON.stringify(join(root, 'toast.ts'))} }`,
    `{ find: '#/hooks/use-app-info', replacement: ${JSON.stringify(join(root, 'app-info.ts'))} }`,
    `{ find: '#/routes/-errors', replacement: ${JSON.stringify(join(root, 'errors.ts'))} }`,
    `{ find: '#/stores/settings.store', replacement: ${JSON.stringify(join(root, 'settings.ts'))} }`,
    `{ find: '#', replacement: ${JSON.stringify(appRoot)} }`,
  ].join(',\n      ');
  await writeFile(
    join(root, 'vite.config.mjs'),
    `import { defineConfig } from ${fileUrl(viteEntry)};
import solid from ${fileUrl(solidPlugin)};
import tailwindcss from ${fileUrl(tailwindPlugin)};
export default defineConfig({
  root: ${JSON.stringify(root)},
  plugins: [tailwindcss(), solid()],
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

function bindingsFor(snapshot, values) {
  return snapshot.entries.filter((entry) => values.some((value) => entry.value.includes(String(value))));
}

function hasGenericFallback(value, generic) {
  return value.toLowerCase().split(',').some((part) => part.trim().replaceAll("'", '').replaceAll('"', '') === generic);
}

async function evaluate() {
  const options = parseArgs(process.argv.slice(2));
  const project = await realpath(resolveProject(options.workspace, options.projectPath));
  await access(join(options.evaluatorRuntime, 'package.json'));
  const runtimeRequire = createRequire(join(options.evaluatorRuntime, 'package.json'));
  const { chromium } = runtimeRequire('playwright');
  const AxeBuilder = runtimeRequire('@axe-core/playwright').default;
  const harness = await createHarness(project);
  const port = await reservePort();
  const origin = `http://127.0.0.1:${port}`;
  const server = spawn(
    process.execPath,
    [
      harness.viteCli,
      '--config',
      join(harness.root, 'vite.config.mjs'),
      '--port',
      String(port),
    ],
    { cwd: project, env: { ...process.env, NODE_ENV: 'development', NO_COLOR: '1' }, stdio: ['ignore', 'pipe', 'pipe'] },
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
        `${error instanceof Error ? error.message : String(error)}: ${serverErrors.join('').slice(0, 8_000)}`,
      );
    }
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1000, height: 700 } });
    const page = await context.newPage();
    page.setDefaultTimeout(7_000);
    const runtimeErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => runtimeErrors.push(`page: ${error.message}`));

    const checks = {
      solidRootMounted: false,
      initialFourTypographyBindings: false,
      initialFamiliesHaveGenericFallbacks: false,
      allFourBindingsUpdateReactively: false,
      updateUsesSameMountedDocument: false,
      themeAttributesRemainReactive: false,
      stylesheetProvidesFourDefaults: false,
      themeAndPlatformCleanupRuns: false,
      mountedRootHasNoAxeViolations: false,
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

    let initialSnapshot;
    let initialBindings = [];
    await check('solidRootMounted', async () => {
      const response = await page.goto(origin, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => Boolean(globalThis.__fontEvaluator));
      await page.waitForFunction(() => globalThis.__solidEvidence.settingsLoaded > 0 && globalThis.__solidEvidence.listen > 0);
      initialSnapshot = await page.evaluate(() => globalThis.__fontEvaluator.snapshot());
      return Boolean(response?.ok()) && initialSnapshot.appearance === 'light' && initialSnapshot.theme === 'evaluator-light';
    });

    await check('initialFourTypographyBindings', async () => {
      initialBindings = bindingsFor(initialSnapshot, [
        INITIAL.ui_font_family,
        INITIAL.editor_font_family,
        `${INITIAL.ui_font_size}px`,
        `${INITIAL.editor_font_size}px`,
      ]);
      const properties = new Set(initialBindings.map((binding) => `${binding.elementIndex}:${binding.property}`));
      return (
        properties.size === 4 &&
        initialBindings.some((binding) => binding.value.includes(INITIAL.ui_font_family)) &&
        initialBindings.some((binding) => binding.value.includes(INITIAL.editor_font_family)) &&
        initialBindings.some((binding) => binding.value === `${INITIAL.ui_font_size}px`) &&
        initialBindings.some((binding) => binding.value === `${INITIAL.editor_font_size}px`)
      );
    });

    await check('initialFamiliesHaveGenericFallbacks', async () => {
      const ui = initialBindings.find((binding) => binding.value.includes(INITIAL.ui_font_family));
      const editor = initialBindings.find((binding) => binding.value.includes(INITIAL.editor_font_family));
      return Boolean(ui && editor && (hasGenericFallback(ui.value, 'system-ui') || hasGenericFallback(ui.value, 'sans-serif')) && hasGenericFallback(editor.value, 'monospace'));
    });

    let updatedSnapshot;
    await check('allFourBindingsUpdateReactively', async () => {
      await page.evaluate((next) => globalThis.__fontEvaluator.updateUi(next), UPDATED);
      await page.waitForFunction(
        (sentinels) => {
          const values = globalThis.__fontEvaluator.snapshot().entries.map((entry) => entry.value);
          return sentinels.every((sentinel) => values.some((value) => value.includes(String(sentinel))));
        },
        [UPDATED.ui_font_family, UPDATED.editor_font_family, `${UPDATED.ui_font_size}px`, `${UPDATED.editor_font_size}px`],
      );
      updatedSnapshot = await page.evaluate(() => globalThis.__fontEvaluator.snapshot());
      const updatedByProperty = new Map(updatedSnapshot.entries.map((entry) => [`${entry.elementIndex}:${entry.property}`, entry.value]));
      const values = initialBindings.map((binding) => updatedByProperty.get(`${binding.elementIndex}:${binding.property}`) ?? '');
      return (
        values.some((value) => value.includes(UPDATED.ui_font_family) && (hasGenericFallback(value, 'system-ui') || hasGenericFallback(value, 'sans-serif'))) &&
        values.some((value) => value.includes(UPDATED.editor_font_family) && hasGenericFallback(value, 'monospace')) &&
        values.includes(`${UPDATED.ui_font_size}px`) &&
        values.includes(`${UPDATED.editor_font_size}px`)
      );
    });

    checks.updateUsesSameMountedDocument = Boolean(
      initialSnapshot &&
      updatedSnapshot &&
      initialSnapshot.documentMarker === updatedSnapshot.documentMarker &&
      initialSnapshot.navigationCount === updatedSnapshot.navigationCount,
    );

    await check('themeAttributesRemainReactive', async () => {
      await page.evaluate(() => globalThis.__fontEvaluator.updateTheme('dark', 'evaluator-dark'));
      await page.waitForFunction(
        () => document.documentElement.getAttribute('data-appearance') === 'dark' && document.documentElement.getAttribute('data-theme') === 'evaluator-dark',
      );
      const snapshot = await page.evaluate(() => globalThis.__fontEvaluator.snapshot());
      return snapshot.entries.some((entry) => entry.value.includes(UPDATED.ui_font_family));
    });

    await check('mountedRootHasNoAxeViolations', async () => {
      const report = await new AxeBuilder({ page })
        .include('html')
        .disableRules(['aria-allowed-attr', 'color-contrast'])
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      axeViolations.push(...report.violations.map(({ id, impact }) => ({ id, impact })));
      return report.violations.length === 0;
    });

    await check('themeAndPlatformCleanupRuns', async () => {
      await page.evaluate(() => globalThis.__fontEvaluator.dispose());
      await page.waitForFunction(
        () =>
          !document.documentElement.hasAttribute('data-appearance') &&
          !document.documentElement.hasAttribute('data-theme') &&
          globalThis.__solidEvidence.unlisten > 0 &&
          globalThis.__solidEvidence.mediaRemoved > 0,
      );
      return true;
    });

    await check('stylesheetProvidesFourDefaults', async () => {
      const defaults = await page.evaluate(
        (bindings) => globalThis.__fontEvaluator.clearInlineAndReadDefaults(bindings),
        initialBindings,
      );
      const ui = defaults.find((binding) => binding.value.includes('system-ui') || binding.value.includes('sans-serif'));
      const editor = defaults.find((binding) => binding.value.includes('monospace'));
      const sizes = defaults.filter((binding) => /^\d+(?:\.\d+)?(?:px|rem)$/u.test(binding.value));
      return defaults.length === 4 && Boolean(ui && editor) && sizes.length === 2;
    });

    await delay(250);
    checks.browserConsoleClean = runtimeErrors.length === 0;
    const failures = Object.entries(checks)
      .filter(([, passed]) => !passed)
      .map(([id]) => id);
    return {
      passed: failures.length === 0,
      metrics: { governanceViolations: 0, accessibilityViolations: checks.mountedRootHasNoAxeViolations ? 0 : 1 },
      checks: Object.entries(checks).map(([id, passed]) => ({ id, passed })),
      failures,
      evidenceErrors,
      axeViolations,
      runtimeErrors,
      serverErrors,
      bindingCount: initialBindings.length,
    };
  } finally {
    await browser?.close().catch(() => {});
    await stopProcess(server);
    await rm(harness.root, { recursive: true, force: true });
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
