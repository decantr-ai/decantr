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
const API_ORIGIN = 'https://api.realworld.show';

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
  if (!address || typeof address === 'string') throw new Error('Could not reserve an Angular port');
  await new Promise((resolveClose, reject) => server.close((error) => (error ? reject(error) : resolveClose())));
  return address.port;
}

async function waitForServer(url, child) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Angular server exited with ${child.exitCode}`);
    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (response.status < 500) return;
    } catch {
      // Angular is still compiling.
    }
    await delay(250);
  }
  throw new Error('Timed out waiting for Angular');
}

function signalProcessGroup(child, signal) {
  if (process.platform !== 'win32' && child.pid) {
    try {
      process.kill(-child.pid, signal);
      return;
    } catch {
      // Fall back to the direct child when process groups are unavailable.
    }
  }
  if (child.exitCode === null && child.signalCode === null) child.kill(signal);
}

async function stopProcess(child) {
  const running = child.exitCode === null && child.signalCode === null;
  const terminated = running ? once(child, 'exit') : Promise.resolve();
  signalProcessGroup(child, 'SIGTERM');
  await Promise.race([terminated, delay(5_000)]);
  if (process.platform !== 'win32' && child.pid) {
    try {
      process.kill(-child.pid, 0);
      process.kill(-child.pid, 'SIGKILL');
    } catch {
      // The complete process group has exited.
    }
  } else if (child.exitCode === null && child.signalCode === null) {
    child.kill('SIGKILL');
  }
}

function user() {
  return {
    email: 'reviewer@example.invalid',
    token: 'local-evaluator-token',
    username: 'reviewer',
    bio: 'Local evaluator user',
    image: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
  };
}

function article(slug = 'existing-slug', overrides = {}) {
  return {
    slug,
    title: 'Existing title',
    description: 'Existing description',
    body: 'Existing body',
    tagList: ['existing-tag'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    favorited: false,
    favoritesCount: 0,
    author: { ...user(), following: false },
    ...overrides,
  };
}

function corsHeaders(origin) {
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-headers': '*',
    'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  };
}

async function fulfillJson(route, origin, value, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    headers: corsHeaders(origin),
    body: JSON.stringify(value),
  });
}

function parseBody(request) {
  try {
    return request.postDataJSON();
  } catch {
    return null;
  }
}

async function evaluate() {
  const options = parseArgs(process.argv.slice(2));
  const project = resolveProject(options.workspace, options.projectPath);
  await access(join(project, 'node_modules', '.bin', 'ng'));
  await access(join(options.evaluatorRuntime, 'package.json'));
  const runtimeRequire = createRequire(join(options.evaluatorRuntime, 'package.json'));
  const { chromium } = runtimeRequire('playwright');
  const port = await reservePort();
  const origin = `http://127.0.0.1:${port}`;
  const server = spawn('npm', ['start', '--', '--host', '127.0.0.1', '--port', String(port)], {
    cwd: project,
    detached: process.platform !== 'win32',
    env: { ...process.env, CI: 'true', NO_COLOR: '1' },
    stdio: ['ignore', 'ignore', 'ignore'],
  });

  let browser;
  try {
    await waitForServer(origin, server);
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await context.addInitScript(() => localStorage.setItem('jwtToken', 'local-evaluator-token'));

    let phase = 'edit-success';
    const apiRequests = [];
    const mutations = [];
    const runtimeErrors = [];

    await context.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === origin) {
        await route.continue();
        return;
      }
      if (url.origin !== API_ORIGIN) {
        if (request.resourceType() === 'stylesheet') {
          await route.fulfill({ status: 200, contentType: 'text/css', body: '' });
        } else if (request.resourceType() === 'image') {
          await route.fulfill({ status: 200, contentType: 'image/png', body: EMPTY_PNG });
        } else {
          await route.fulfill({ status: 204, body: '' });
        }
        return;
      }

      const method = request.method();
      const path = url.pathname.replace(/^\/api/u, '');
      apiRequests.push({ method, path, phase });
      if (method === 'OPTIONS') {
        await route.fulfill({ status: 204, headers: corsHeaders(origin), body: '' });
      } else if (method === 'GET' && path === '/user') {
        await fulfillJson(route, origin, { user: user() });
      } else if (method === 'GET' && /^\/articles\/[^/]+$/u.test(path)) {
        const slug = decodeURIComponent(path.split('/').at(-1));
        await fulfillJson(route, origin, { article: article(slug) });
      } else if (method === 'GET' && /\/comments$/u.test(path)) {
        await fulfillJson(route, origin, { comments: [] });
      } else if (method === 'POST' || method === 'PUT') {
        const body = parseBody(request);
        mutations.push({ method, path, body, phase });
        if (phase === 'edit-failure') {
          await fulfillJson(route, origin, { errors: { body: ['Local save rejected'] } }, 422);
        } else {
          const submitted = body?.article ?? {};
          const slug = method === 'PUT' ? 'updated-runtime-slug' : phase === 'create-success' ? 'created-runtime-slug' : 'unexpected-created-slug';
          await fulfillJson(route, origin, { article: article(slug, { ...submitted, slug }) });
        }
      } else {
        await fulfillJson(route, origin, {});
      }
    });

    const page = await context.newPage();
    page.on('pageerror', (error) => runtimeErrors.push(`page: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() !== 'error') return;
      if (phase === 'edit-failure' && /failed to load resource|422/iu.test(message.text())) return;
      runtimeErrors.push(`console: ${message.text()}`);
    });

    const checks = {};
    const evidenceErrors = [];
    const check = async (id, operation) => {
      try {
        checks[id] = Boolean(await operation());
      } catch (error) {
        checks[id] = false;
        evidenceErrors.push(`${id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    const title = page.locator('input[formcontrolname="title"]');
    const description = page.locator('input[formcontrolname="description"]');
    const body = page.locator('textarea[formcontrolname="body"]');
    const tag = page.locator('input[placeholder="Enter tags"]');
    const submit = page.getByRole('button', { name: /publish article/iu });

    await page.goto(`${origin}/editor/existing-slug`, { waitUntil: 'domcontentloaded' });
    await title.waitFor({ state: 'visible', timeout: 20_000 });
    await page.waitForFunction(() => document.querySelector('input[formcontrolname="title"]')?.value === 'Existing title');
    await check('existing-editor-loads-from-local-mocks', async () => {
      return (
        (await title.inputValue()) === 'Existing title' &&
        apiRequests.some((request) => request.method === 'GET' && request.path === '/articles/existing-slug')
      );
    });
    await title.fill('Updated title');
    await description.fill('Updated description');
    await body.fill('Updated body');
    await tag.fill('runtime-tag');
    await submit.click();
    await page.waitForURL((url) => url.pathname.startsWith('/article/'), { timeout: 20_000 });
    const editMutations = mutations.filter((request) => request.phase === 'edit-success');
    await check('existing-save-uses-update-only', async () => {
      return editMutations.length === 1 && editMutations[0].method === 'PUT' && editMutations[0].path === '/articles/existing-slug';
    });
    await check('update-payload-preserves-identity-and-form-state', async () => {
      const submitted = editMutations[0]?.body?.article;
      return (
        submitted?.slug === 'existing-slug' &&
        submitted?.title === 'Updated title' &&
        submitted?.description === 'Updated description' &&
        submitted?.body === 'Updated body' &&
        Array.isArray(submitted?.tagList) &&
        submitted.tagList.includes('existing-tag') &&
        submitted.tagList.includes('runtime-tag')
      );
    });
    checks.updateSuccessNavigatesToReturnedArticle = new URL(page.url()).pathname === '/article/updated-runtime-slug';

    phase = 'create-success';
    await page.goto(`${origin}/editor`, { waitUntil: 'domcontentloaded' });
    await title.waitFor({ state: 'visible', timeout: 20_000 });
    await title.fill('Created title');
    await description.fill('Created description');
    await body.fill('Created body');
    await tag.fill('created-tag');
    await submit.click();
    await page.waitForURL((url) => url.pathname.startsWith('/article/'), { timeout: 20_000 });
    const createMutations = mutations.filter((request) => request.phase === 'create-success');
    await check('new-save-uses-create-only', async () => {
      const submitted = createMutations[0]?.body?.article;
      return (
        createMutations.length === 1 &&
        createMutations[0].method === 'POST' &&
        createMutations[0].path === '/articles/' &&
        submitted?.title === 'Created title' &&
        submitted?.slug === undefined &&
        submitted?.tagList?.includes('created-tag')
      );
    });
    checks.createSuccessNavigatesToReturnedArticle = new URL(page.url()).pathname === '/article/created-runtime-slug';

    phase = 'edit-failure';
    await page.goto(`${origin}/editor/existing-slug`, { waitUntil: 'domcontentloaded' });
    await title.waitFor({ state: 'visible', timeout: 20_000 });
    await page.waitForFunction(() => document.querySelector('input[formcontrolname="title"]')?.value === 'Existing title');
    await title.fill('Retry title');
    await submit.click();
    await page.getByText('Local save rejected', { exact: false }).waitFor({ state: 'visible', timeout: 20_000 });
    await check('failed-save-restores-editor-feedback', async () => {
      return (
        new URL(page.url()).pathname === '/editor/existing-slug' &&
        (await submit.isEnabled()) &&
        (await title.isEnabled()) &&
        (await page.getByText('Local save rejected', { exact: false }).isVisible())
      );
    });
    const failedMutations = mutations.filter((request) => request.phase === 'edit-failure');
    checks.failedExistingSaveStillUsesUpdate = failedMutations.length === 1 && failedMutations[0].method === 'PUT';
    checks.editorControlsRemainAccessible =
      (await submit.getAttribute('disabled')) === null &&
      (await submit.textContent())?.trim().length > 0 &&
      (await title.getAttribute('placeholder'))?.trim().length > 0;

    phase = 'edit-retry';
    await submit.click();
    await page.waitForURL((url) => url.pathname.startsWith('/article/'), { timeout: 20_000 });
    const retryMutations = mutations.filter((request) => request.phase === 'edit-retry');
    checks.retryAfterFailureSucceeds =
      retryMutations.length === 1 &&
      retryMutations[0].method === 'PUT' &&
      new URL(page.url()).pathname === '/article/updated-runtime-slug';

    await delay(300);
    checks.browserConsoleClean = runtimeErrors.length === 0;

    const failures = Object.entries(checks)
      .filter(([, passed]) => !passed)
      .map(([id]) => id);
    return {
      passed: failures.length === 0,
      metrics: {
        governanceViolations: 0,
        accessibilityViolations: checks.editorControlsRemainAccessible ? 0 : 1,
        behaviorChecksPassed: Object.keys(checks).length - failures.length,
        behaviorChecksTotal: Object.keys(checks).length,
      },
      checks: Object.entries(checks).map(([id, passed]) => ({ id, passed })),
      failures,
      evidenceErrors,
      runtimeErrors,
      evidence: {
        mutationMethods: mutations.map(({ phase: requestPhase, method, path }) => ({ phase: requestPhase, method, path })),
      },
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
