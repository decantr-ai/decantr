#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  access,
  mkdtemp,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { once } from 'node:events';
import net from 'node:net';

const visualCopies = [
  'demos/cloudflare/src/pages/posts/[slug].astro',
  'demos/playground/src/pages/posts/[slug].astro',
  'demos/postgres/src/pages/posts/[slug].astro',
  'demos/preview/src/pages/posts/[slug].astro',
  'demos/simple/src/pages/posts/[slug].astro',
  'templates/blog-cloudflare/src/pages/posts/[slug].astro',
  'templates/blog/src/pages/posts/[slug].astro',
];

function parseArguments(argv) {
  const options = { projectPath: '.' };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--workspace') options.workspace = resolve(argv[++index]);
    else if (argument === '--project-path') options.projectPath = argv[++index];
    else if (argument === '--evaluator-runtime') {
      options.evaluatorRuntime = resolve(argv[++index]);
    } else {
      throw new Error(`Unknown option: ${argument}`);
    }
  }
  if (!options.workspace) throw new Error('--workspace is required');
  if (!options.evaluatorRuntime) throw new Error('--evaluator-runtime is required');
  options.project = resolve(options.workspace, options.projectPath);
  return options;
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

async function reservePort() {
  const server = net.createServer();
  server.unref();
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : null;
  await new Promise((resolveClose, reject) => {
    server.close((error) => (error ? reject(error) : resolveClose()));
  });
  if (!port) throw new Error('Unable to reserve evaluator port');
  return port;
}

async function waitForServer(origin, child, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Vite exited before readiness with code ${child.exitCode}`);
    }
    try {
      const response = await fetch(origin, { signal: AbortSignal.timeout(1_000) });
      if (response.status > 0) return;
    } catch {
      await delay(100);
    }
  }
  throw new Error('Timed out waiting for the Emdash evaluator harness');
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

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function walkAstro(node, visit) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (key === 'position') continue;
    if (Array.isArray(value)) {
      for (const child of value) walkAstro(child, visit);
    } else if (value && typeof value === 'object') {
      walkAstro(value, visit);
    }
  }
}

async function inspectVisualAnnotations(options) {
  const projectRequire = createRequire(join(options.project, 'package.json'));
  const astroRequire = createRequire(projectRequire.resolve('astro/package.json'));
  const compilerPath = astroRequire.resolve('@astrojs/compiler');
  const { parse } = await import(pathToFileURL(compilerPath).href);
  const results = [];

  for (const relativePath of visualCopies) {
    const source = await readFile(join(options.workspace, relativePath), 'utf8');
    const parsed = await parse(source, { position: true });
    let excerptNode = null;
    walkAstro(parsed.ast, (node) => {
      if (excerptNode || node.type !== 'element' || node.name !== 'p') return;
      const attributes = Array.isArray(node.attributes) ? node.attributes : [];
      const hasExcerptClass = attributes.some(
        (attribute) =>
          attribute.type === 'attribute' &&
          attribute.name === 'class' &&
          String(attribute.value)
            .split(/\s+/u)
            .includes('article-excerpt'),
      );
      if (hasExcerptClass) excerptNode = node;
    });
    const attributes = Array.isArray(excerptNode?.attributes) ? excerptNode.attributes : [];
    const spreadNames = attributes
      .filter((attribute) => attribute.type === 'attribute' && attribute.kind === 'spread')
      .map((attribute) => attribute.name);
    let renderedExpression = false;
    walkAstro(excerptNode, (node) => {
      if (node.type === 'text' && String(node.value).trim() === 'post.data.excerpt') {
        renderedExpression = true;
      }
    });
    results.push({
      path: relativePath,
      excerptElement: excerptNode?.name ?? null,
      spreadNames,
      renderedExpression,
      passed: spreadNames.includes('post.edit.excerpt') && renderedExpression,
    });
  }
  return results;
}

async function createHarness(options) {
  const adminDist = join(options.workspace, 'packages', 'admin', 'dist');
  const adminEntry = join(adminDist, 'index.js');
  const adminStyles = join(adminDist, 'styles.css');
  await Promise.all([access(adminEntry), access(adminStyles)]);

  const adminRequire = createRequire(join(options.workspace, 'packages', 'admin', 'package.json'));
  const vitePackagePath = adminRequire.resolve('vite/package.json');
  const vitePackage = JSON.parse(await readFile(vitePackagePath, 'utf8'));
  const viteCli = resolve(dirname(vitePackagePath), vitePackage.bin.vite);
  const root = await realpath(await mkdtemp(join(tmpdir(), 'emdash-field-focus-evaluator-')));
  await symlink(
    join(options.workspace, 'packages', 'admin', 'node_modules'),
    join(root, 'node_modules'),
    'dir',
  );

  await writeFile(
    join(root, 'index.html'),
    '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="app"></div><script type="module" src="/src.tsx"></script></body></html>',
  );
  await writeFile(
    join(root, 'src.tsx'),
    `import React from 'react';
import { createRoot } from 'react-dom/client';
import { AdminApp } from ${JSON.stringify(`/@fs/${adminEntry}`)};
import ${JSON.stringify(`/@fs/${adminStyles}`)};
import './harness.css';

createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>,
);
`,
  );
  await writeFile(
    join(root, 'harness.css'),
    `html, body, #app { height: 100%; margin: 0; }
body { background: #f7f8fa; color: #111827; }
main { height: calc(100vh - 56px); overflow-y: auto; }
form [id^="field-"] { scroll-margin-block: 32px; }
form .space-y-4 > * { min-height: 72px; margin-bottom: 40px; }
`,
  );
  await writeFile(
    join(root, 'vite.config.mjs'),
    `export default {
  root: ${JSON.stringify(root)},
  esbuild: { jsx: 'automatic' },
  server: {
    host: '127.0.0.1',
    strictPort: true,
    fs: { allow: [${JSON.stringify(root)}, ${JSON.stringify(options.workspace)}] },
  },
};
`,
  );
  return { root, viteCli };
}

function manifestFixture() {
  const fields = {
    title: { kind: 'string', label: 'Title', required: true },
    enabled: { kind: 'boolean', label: 'Enabled' },
    body: { kind: 'portableText', label: 'Body' },
    status_choice: {
      kind: 'select',
      label: 'Status choice',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'ready', label: 'Ready' },
      ],
    },
    featured_image: { kind: 'image', label: 'Featured image' },
  };
  for (let index = 1; index <= 12; index += 1) {
    fields[`supporting_${index}`] = {
      kind: 'string',
      label: `Supporting field ${index}`,
    };
  }
  fields.excerpt = { kind: 'richText', label: 'Excerpt' };
  return {
    version: 'evaluator',
    hash: 'evaluator-manifest',
    authMode: 'passkey',
    collections: {
      posts: {
        label: 'Posts',
        labelSingular: 'Post',
        supports: [],
        hasSeo: false,
        urlPattern: '/posts/{slug}',
        fields,
      },
    },
    plugins: {},
  };
}

function contentFixture() {
  const data = {
    title: 'Field focus evaluator',
    enabled: true,
    body: [],
    status_choice: 'ready',
    featured_image: null,
    excerpt: 'This field must receive focus after asynchronous content resolves.',
  };
  for (let index = 1; index <= 12; index += 1) {
    data[`supporting_${index}`] = `Supporting value ${index}`;
  }
  return {
    id: 'post-evaluator',
    type: 'posts',
    slug: 'field-focus-evaluator',
    status: 'draft',
    locale: 'en',
    translationGroup: null,
    data,
    authorId: null,
    primaryBylineId: null,
    bylines: [],
    createdAt: '2026-07-01T12:00:00.000Z',
    updatedAt: '2026-07-01T12:00:00.000Z',
    publishedAt: null,
    scheduledAt: null,
    liveRevisionId: null,
    draftRevisionId: null,
  };
}

async function evaluateBrowser(options, annotationEvidence) {
  const runtimeRequire = createRequire(join(options.evaluatorRuntime, 'package.json'));
  const { chromium } = runtimeRequire('playwright');
  const AxeBuilder = runtimeRequire('@axe-core/playwright').default;
  const harness = await createHarness(options);
  const port = await reservePort();
  const origin = `http://127.0.0.1:${port}`;
  const server = spawn(
    process.execPath,
    [harness.viteCli, '--config', join(harness.root, 'vite.config.mjs'), '--port', String(port)],
    {
      cwd: options.workspace,
      env: { ...process.env, NODE_ENV: 'development', NO_COLOR: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  const serverOutput = [];
  for (const stream of [server.stdout, server.stderr]) {
    stream.on('data', (chunk) => {
      if (serverOutput.join('').length < 12_000) serverOutput.push(chunk.toString());
    });
  }

  let browser;
  try {
    try {
      await waitForServer(origin, server);
    } catch (error) {
      throw new Error(
        `${error instanceof Error ? error.message : String(error)}: ${serverOutput
          .join('')
          .slice(-12_000)}`,
      );
    }
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    page.setDefaultTimeout(12_000);
    const runtimeErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => runtimeErrors.push(`page: ${error.message}`));
    page.on('requestfailed', (request) => {
      runtimeErrors.push(`request: ${request.url()} (${request.failure()?.errorText ?? 'failed'})`);
    });
    await page.addInitScript(() => {
      window.__fieldFocusEvidence = { scrollCalls: [], focusCalls: [] };
      const originalScrollIntoView = Element.prototype.scrollIntoView;
      Element.prototype.scrollIntoView = function scrollIntoView(options) {
        window.__fieldFocusEvidence.scrollCalls.push({
          id: this.id || null,
          options: options ?? null,
        });
        return originalScrollIntoView.call(this, options);
      };
      const originalFocus = HTMLElement.prototype.focus;
      HTMLElement.prototype.focus = function focus(options) {
        window.__fieldFocusEvidence.focusCalls.push(this.id || null);
        return originalFocus.call(this, options);
      };
      window.requestIdleCallback = (callback) =>
        window.setTimeout(
          () => callback({ didTimeout: false, timeRemaining: () => 50 }),
          250,
        );
      window.cancelIdleCallback = (id) => window.clearTimeout(id);
    });

    let releaseContent;
    const contentGate = new Promise((resolveGate) => {
      releaseContent = resolveGate;
    });
    let markContentRequested;
    const contentRequested = new Promise((resolveRequested) => {
      markContentRequested = resolveRequested;
    });
    let contentRequestCount = 0;
    await page.route('**/_emdash/api/**', async (route) => {
      const requestUrl = new URL(route.request().url());
      const path = requestUrl.pathname;
      const respond = (data) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data }),
        });
      if (path === '/_emdash/api/manifest') {
        await respond(manifestFixture());
      } else if (path === '/_emdash/api/content/posts/post-evaluator') {
        contentRequestCount += 1;
        markContentRequested();
        await contentGate;
        await respond({ item: contentFixture() });
      } else if (path === '/_emdash/api/auth/me') {
        await respond({
          id: 'user-evaluator',
          name: 'Evaluator',
          email: 'evaluator@example.invalid',
          role: 100,
          isFirstLogin: false,
        });
      } else if (path.includes('/users') || path.includes('/bylines')) {
        await respond({ items: [] });
      } else {
        await respond({ items: [], terms: [], taxonomies: [] });
      }
    });

    await page.goto(`${origin}/sentinel?marker=before`, { waitUntil: 'domcontentloaded' });
    const targetUrl =
      `${origin}/_emdash/admin/content/posts/post-evaluator` +
      '?field=excerpt&view=preview&locale=en';
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    try {
      await Promise.race([
        contentRequested,
        delay(12_000).then(() => {
          throw new Error('The real admin app never requested the seeded content item');
        }),
      ]);
    } catch (error) {
      const renderedText = await page.locator('body').innerText().catch(() => '');
      throw new Error(
        `${error instanceof Error ? error.message : String(error)}: ${[
          ...runtimeErrors,
          `rendered: ${renderedText.slice(0, 2_000)}`,
          ...serverOutput,
        ]
          .join(' | ')
          .slice(0, 12_000)}`,
      );
    }

    const checks = {
      realAdminWaitsForAsynchronousContent: false,
      requestedFieldAndRendererVariantsAreAddressable: false,
      requestedFieldIsCenteredAfterResolution: false,
      requestedFieldReceivesFocus: false,
      onlyFieldSelectorIsRemoved: false,
      replacementHistoryDoesNotRetriggerSelection: false,
      bundledAstroCopiesExposeEquivalentAnnotations: false,
      requestedFieldHasNoAxeViolations: false,
      fixedScreenshotIsNonblank: false,
      browserConsoleClean: false,
    };
    const evidence = {
      annotations: annotationEvidence,
      beforeContentRelease: {
        url: page.url(),
        targetCount: await page.locator('#field-excerpt').count(),
        contentRequestCount,
      },
    };
    checks.realAdminWaitsForAsynchronousContent =
      evidence.beforeContentRelease.targetCount === 0 &&
      new URL(evidence.beforeContentRelease.url).searchParams.get('field') === 'excerpt' &&
      contentRequestCount >= 1;

    releaseContent();
    const target = page.locator('#field-excerpt');
    await target.waitFor({ state: 'attached' });
    evidence.afterContentRenderBeforeIdle = await page.evaluate(() => {
      const element = document.getElementById('field-excerpt');
      const rect = element?.getBoundingClientRect();
      return {
        activeElementId: document.activeElement?.id || null,
        rect: rect
          ? { top: rect.top, bottom: rect.bottom, height: rect.height }
          : null,
        url: window.location.href,
      };
    });

    await page.waitForFunction(
      () =>
        window.__fieldFocusEvidence.scrollCalls.length > 0 ||
        !new URL(window.location.href).searchParams.has('field'),
      null,
      { timeout: 2_500 },
    ).catch(() => {});
    await delay(650);
    evidence.afterSelection = await page.evaluate(() => {
      const element = document.getElementById('field-excerpt');
      const rect = element?.getBoundingClientRect();
      const scrollParent = element?.closest('main');
      const scrollParentRect = scrollParent?.getBoundingClientRect();
      return {
        activeElementId: document.activeElement?.id || null,
        rect: rect
          ? { top: rect.top, bottom: rect.bottom, height: rect.height }
          : null,
        scrollParent: scrollParent
          ? {
              scrollTop: scrollParent.scrollTop,
              clientHeight: scrollParent.clientHeight,
              rect: scrollParentRect
                ? { top: scrollParentRect.top, bottom: scrollParentRect.bottom }
                : null,
            }
          : null,
        instrumentation: window.__fieldFocusEvidence,
        url: window.location.href,
        historyLength: window.history.length,
      };
    });

    const addressableIds = [
      'field-enabled',
      'field-body',
      'field-featured_image',
      'field-excerpt',
    ];
    evidence.addressableIds = Object.fromEntries(
      await Promise.all(
        addressableIds.map(async (id) => [id, await page.locator(`#${id}`).count()]),
      ),
    );
    checks.requestedFieldAndRendererVariantsAreAddressable = addressableIds.every(
      (id) => evidence.addressableIds[id] === 1,
    );

    const targetScroll = evidence.afterSelection.instrumentation.scrollCalls.find(
      (call) => call.id === 'field-excerpt',
    );
    const targetRect = evidence.afterSelection.rect;
    const scrollRect = evidence.afterSelection.scrollParent?.rect;
    checks.requestedFieldIsCenteredAfterResolution =
      targetScroll?.options?.block === 'center' &&
      targetRect !== null &&
      scrollRect !== null &&
      targetRect.top >= scrollRect.top - 2 &&
      targetRect.bottom <= scrollRect.bottom + 2 &&
      evidence.afterSelection.scrollParent.scrollTop > 0;
    checks.requestedFieldReceivesFocus =
      evidence.afterSelection.activeElementId === 'field-excerpt' &&
      evidence.afterSelection.instrumentation.focusCalls.includes('field-excerpt');

    const selectedUrl = new URL(evidence.afterSelection.url);
    checks.onlyFieldSelectorIsRemoved =
      !selectedUrl.searchParams.has('field') &&
      selectedUrl.searchParams.get('view') === 'preview' &&
      selectedUrl.searchParams.get('locale') === 'en';

    const screenshot = await page.screenshot({ fullPage: false });
    evidence.screenshot = { bytes: screenshot.length, sha256: sha256(screenshot) };
    checks.fixedScreenshotIsNonblank = screenshot.length > 25_000;

    const axeReport = await new AxeBuilder({ page })
      .include('#field-excerpt')
      .disableRules(['color-contrast'])
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    evidence.axeViolations = axeReport.violations.map(({ id, impact, nodes }) => ({
      id,
      impact,
      targets: nodes.flatMap((node) => node.target),
    }));
    checks.requestedFieldHasNoAxeViolations = axeReport.violations.length === 0;

    await page.goBack({ waitUntil: 'domcontentloaded' });
    await delay(350);
    evidence.afterBack = {
      url: page.url(),
      targetCount: await page.locator('#field-excerpt').count(),
      scrollCalls: await page
        .evaluate(() => window.__fieldFocusEvidence?.scrollCalls ?? [])
        .catch(() => []),
    };
    checks.replacementHistoryDoesNotRetriggerSelection =
      checks.onlyFieldSelectorIsRemoved &&
      new URL(evidence.afterBack.url).pathname.endsWith('/sentinel') &&
      new URL(evidence.afterBack.url).searchParams.get('marker') === 'before' &&
      evidence.afterBack.targetCount === 0 &&
      evidence.afterBack.scrollCalls.length === 0;
    checks.bundledAstroCopiesExposeEquivalentAnnotations = annotationEvidence.every(
      (item) => item.passed,
    );
    await delay(150);
    checks.browserConsoleClean = runtimeErrors.length === 0;

    const failures = Object.entries(checks)
      .filter(([, passed]) => !passed)
      .map(([id]) => id);
    return {
      passed: failures.length === 0,
      metrics: {
        governanceViolations:
          checks.onlyFieldSelectorIsRemoved &&
          checks.replacementHistoryDoesNotRetriggerSelection &&
          checks.bundledAstroCopiesExposeEquivalentAnnotations
            ? 0
            : 1,
        accessibilityViolations:
          checks.requestedFieldReceivesFocus && checks.requestedFieldHasNoAxeViolations
            ? 0
            : 1,
        visualScore: Math.round(
          ([
            checks.requestedFieldIsCenteredAfterResolution,
            checks.requestedFieldReceivesFocus,
            checks.fixedScreenshotIsNonblank,
          ].filter(Boolean).length /
            3) *
            100,
        ),
      },
      checks: Object.entries(checks).map(([id, passed]) => ({ id, passed })),
      failures,
      evidence,
      runtimeErrors,
      serverOutput,
    };
  } finally {
    await browser?.close().catch(() => {});
    await stopProcess(server);
    await rm(harness.root, { recursive: true, force: true });
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const annotationEvidence = await inspectVisualAnnotations(options);
  return evaluateBrowser(options, annotationEvidence);
}

try {
  const result = await main();
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (!result.passed) process.exitCode = 1;
} catch (error) {
  process.stdout.write(
    `${JSON.stringify({
      passed: false,
      metrics: { governanceViolations: 1, accessibilityViolations: 1, visualScore: 0 },
      checks: [{ id: 'evaluator-runtime', passed: false }],
      failures: [error instanceof Error ? error.message : String(error)],
    })}\n`,
  );
  process.exitCode = 1;
}
