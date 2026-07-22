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
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error(`Angular server exited with ${child.exitCode ?? child.signalCode}`);
    }
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

function localUser() {
  return {
    email: 'reviewer@example.invalid',
    token: 'local-evaluator-token',
    username: 'reviewer',
    bio: 'Local evaluator user',
    image: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
  };
}

function localArticle(index, tag, feed) {
  const slug = `${feed ? 'following' : tag || 'global'}-${index}`;
  return {
    slug,
    title: `Local article ${index}`,
    description: `Local description ${index}`,
    body: `Local body ${index}`,
    tagList: tag ? [tag] : [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    favorited: false,
    favoritesCount: 0,
    author: { ...localUser(), username: `author-${index}`, following: feed },
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

async function waitForRequest(records, start, predicate, timeoutMs = 7_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const match = records.slice(start).find(predicate);
    if (match) return match;
    await delay(50);
  }
  return null;
}

function articleRequest(record) {
  return record?.method === 'GET' && (record.path === '/articles' || record.path === '/articles/feed');
}

function offsetOf(record) {
  return Number(record?.query?.offset ?? 0);
}

function pageNumber(url) {
  const value = new URL(url).searchParams.get('page');
  return value === null ? 1 : Number(value);
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
    const apiRequests = [];
    const runtimeErrors = [];
    let scenario = 'initial';

    const configureContext = async (authenticated) => {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      if (authenticated) {
        await context.addInitScript(() => localStorage.setItem('jwtToken', 'local-evaluator-token'));
      }
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
        const record = { method, path, query: Object.fromEntries(url.searchParams), scenario };
        apiRequests.push(record);
        if (method === 'OPTIONS') {
          await route.fulfill({ status: 204, headers: corsHeaders(origin), body: '' });
        } else if (method === 'GET' && path === '/user') {
          await fulfillJson(route, origin, { user: localUser() });
        } else if (method === 'GET' && path === '/tags') {
          await fulfillJson(route, origin, { tags: ['angular', 'testing'] });
        } else if (method === 'GET' && (path === '/articles' || path === '/articles/feed')) {
          const isFeed = path === '/articles/feed';
          const tag = url.searchParams.get('tag') ?? '';
          const offset = Number(url.searchParams.get('offset') ?? 0);
          const empty = isFeed && scenario === 'following-empty';
          const articles = empty ? [] : Array.from({ length: 10 }, (_, index) => localArticle(offset + index + 1, tag, isFeed));
          await fulfillJson(route, origin, { articles, articlesCount: empty ? 0 : 25 });
        } else {
          await fulfillJson(route, origin, {});
        }
      });
      return context;
    };

    const attachRuntimeListeners = (page) => {
      page.setDefaultTimeout(5_000);
      page.on('pageerror', (error) => runtimeErrors.push(`page (${scenario}): ${error.message}`));
      page.on('console', (message) => {
        if (message.type() === 'error') runtimeErrors.push(`console (${scenario}): ${message.text()}`);
      });
    };

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

    const authContext = await configureContext(true);
    const page = await authContext.newPage();
    attachRuntimeListeners(page);
    const feedToggle = page.locator('.feed-toggle');

    scenario = 'root-authenticated';
    let start = apiRequests.length;
    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    await page.locator('.home-page').waitFor({ state: 'visible', timeout: 20_000 });
    const rootRequest = await waitForRequest(apiRequests, start, articleRequest);
    await check('authenticated-root-is-global-feed', async () => {
      const global = feedToggle.getByRole('link', { name: 'Global Feed', exact: true });
      return (
        rootRequest?.path === '/articles' &&
        offsetOf(rootRequest) === 0 &&
        new URL(page.url()).pathname === '/' &&
        (await global.getAttribute('class'))?.split(/\s+/u).includes('active')
      );
    });
    await check('feed-tabs-have-stable-keyboard-links', async () => {
      const following = feedToggle.getByRole('link', { name: 'Your Feed', exact: true });
      const global = feedToggle.getByRole('link', { name: 'Global Feed', exact: true });
      const followingUrl = new URL(await following.getAttribute('href'), origin);
      const globalUrl = new URL(await global.getAttribute('href'), origin);
      return (
        followingUrl.pathname === '/' &&
        followingUrl.searchParams.get('feed') === 'following' &&
        followingUrl.searchParams.get('page') === null &&
        globalUrl.pathname === '/' &&
        globalUrl.search === ''
      );
    });

    scenario = 'following-authenticated';
    start = apiRequests.length;
    await page.goto(`${origin}/?feed=following`, { waitUntil: 'domcontentloaded' });
    const followingRequest = await waitForRequest(apiRequests, start, articleRequest);
    await check('following-url-selects-authenticated-feed', async () => {
      const following = feedToggle.getByRole('link', { name: 'Your Feed', exact: true });
      return (
        followingRequest?.path === '/articles/feed' &&
        offsetOf(followingRequest) === 0 &&
        new URL(page.url()).searchParams.get('feed') === 'following' &&
        (await following.getAttribute('class'))?.split(/\s+/u).includes('active')
      );
    });

    scenario = 'switch-global';
    start = apiRequests.length;
    await page.goto(`${origin}/?feed=following&page=2`, { waitUntil: 'domcontentloaded' });
    await waitForRequest(apiRequests, start, (record) => articleRequest(record) && record.path === '/articles/feed');
    const beforeGlobal = apiRequests.length;
    const globalTab = feedToggle.getByRole('link', { name: 'Global Feed', exact: true });
    if ((await globalTab.count()) === 1) await globalTab.click();
    await page.waitForTimeout(200);
    const resetRequest = await waitForRequest(apiRequests, beforeGlobal, (record) => articleRequest(record) && record.path === '/articles');
    await check('switching-feed-resets-page-and-url-state', async () => {
      const url = new URL(page.url());
      return url.pathname === '/' && url.search === '' && offsetOf(resetRequest) === 0;
    });

    scenario = 'tag-link';
    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    await page.getByText('Popular Tags', { exact: true }).waitFor({ state: 'visible', timeout: 20_000 });
    const tagLink = page.getByRole('link', { name: 'angular', exact: true });
    await check('tag-link-has-stable-route', async () => {
      const href = await tagLink.getAttribute('href');
      return href !== null && new URL(href, origin).pathname === '/tag/angular';
    });

    scenario = 'tag-direct-page-two';
    start = apiRequests.length;
    await page.goto(`${origin}/tag/angular?page=2`, { waitUntil: 'domcontentloaded' });
    const tagRequest = await waitForRequest(
      apiRequests,
      start,
      (record) => articleRequest(record) && record.path === '/articles' && record.query.tag === 'angular',
    );
    await check('direct-tag-page-controls-service-query-and-active-state', async () => {
      if (!tagRequest) return false;
      const activePage = page.locator('.pagination .page-item.active .page-link');
      return (
        tagRequest?.query?.tag === 'angular' &&
        offsetOf(tagRequest) === 10 &&
        pageNumber(page.url()) === 2 &&
        (await feedToggle.getByText('angular', { exact: true }).isVisible()) &&
        (await activePage.textContent())?.trim() === '2'
      );
    });

    scenario = 'tag-refresh';
    start = apiRequests.length;
    await page.reload({ waitUntil: 'domcontentloaded' });
    const refreshedTagRequest = await waitForRequest(
      apiRequests,
      start,
      (record) => articleRequest(record) && record.query.tag === 'angular',
    );
    checks.refreshPreservesTagAndPageState =
      refreshedTagRequest?.path === '/articles' &&
      offsetOf(refreshedTagRequest) === 10 &&
      new URL(page.url()).pathname === '/tag/angular' &&
      pageNumber(page.url()) === 2;

    const historyPage = await authContext.newPage();
    attachRuntimeListeners(historyPage);
    scenario = 'global-pagination';
    start = apiRequests.length;
    await historyPage.goto(origin, { waitUntil: 'domcontentloaded' });
    await waitForRequest(apiRequests, start, (record) => articleRequest(record) && record.path === '/articles');
    const pagination = historyPage.locator('.pagination');
    const pageTwoButton = pagination.getByRole('button', { name: '2', exact: true });
    const pageOneButton = pagination.getByRole('button', { name: '1', exact: true });
    const pageThreeButton = pagination.getByRole('button', { name: '3', exact: true });
    const beforePageTwo = apiRequests.length;
    if ((await pageTwoButton.count()) === 1) await pageTwoButton.click();
    const pageTwoRequest = await waitForRequest(apiRequests, beforePageTwo, (record) => articleRequest(record) && offsetOf(record) === 10);
    await check('page-selection-round-trips-through-url', async () => {
      const active = historyPage.locator('.pagination .page-item.active .page-link');
      return pageNumber(historyPage.url()) === 2 && offsetOf(pageTwoRequest) === 10 && (await active.textContent())?.trim() === '2';
    });

    const beforePageOne = apiRequests.length;
    if ((await pageOneButton.count()) === 1) await pageOneButton.click();
    const pageOneRequest = await waitForRequest(apiRequests, beforePageOne, (record) => articleRequest(record) && offsetOf(record) === 0);
    checks.pageOneUsesCanonicalUrl =
      new URL(historyPage.url()).pathname === '/' &&
      new URL(historyPage.url()).searchParams.get('page') === null &&
      offsetOf(pageOneRequest) === 0;

    let historyRestored = false;
    if ((await pageTwoButton.count()) === 1 && (await pageThreeButton.count()) === 1) {
      const beforeHistoryPageTwo = apiRequests.length;
      await pageTwoButton.click();
      const historyPageTwoRequest = await waitForRequest(
        apiRequests,
        beforeHistoryPageTwo,
        (record) => articleRequest(record) && offsetOf(record) === 10,
      );
      await historyPage.waitForURL((url) => pageNumber(url.href) === 2);
      const beforeHistoryPageThree = apiRequests.length;
      await pageThreeButton.click();
      const historyPageThreeRequest = await waitForRequest(
        apiRequests,
        beforeHistoryPageThree,
        (record) => articleRequest(record) && offsetOf(record) === 20,
      );
      await historyPage.waitForURL((url) => pageNumber(url.href) === 3);
      if (offsetOf(historyPageTwoRequest) === 10 && offsetOf(historyPageThreeRequest) === 20) {
        const beforeBack = apiRequests.length;
        await historyPage.goBack();
        await historyPage.waitForURL((url) => pageNumber(url.href) === 2);
        const backRequest = await waitForRequest(apiRequests, beforeBack, (record) => articleRequest(record) && offsetOf(record) === 10);
        historyRestored = pageNumber(historyPage.url()) === 2 && offsetOf(backRequest) === 10;
      }
    }
    checks.browserHistoryRestoresPageState = historyRestored;

    scenario = 'following-pagination';
    start = apiRequests.length;
    await historyPage.goto(`${origin}/?feed=following`, { waitUntil: 'domcontentloaded' });
    await waitForRequest(apiRequests, start, (record) => articleRequest(record) && record.path === '/articles/feed');
    const followingPageTwo = historyPage.locator('.pagination').getByRole('button', { name: '2', exact: true });
    const beforeFollowingPageTwo = apiRequests.length;
    if ((await followingPageTwo.count()) === 1) await followingPageTwo.click();
    const followingPageRequest = await waitForRequest(
      apiRequests,
      beforeFollowingPageTwo,
      (record) => articleRequest(record) && record.path === '/articles/feed' && offsetOf(record) === 10,
    );
    await check('feed-pagination-preserves-feed-query', async () => {
      const url = new URL(historyPage.url());
      return url.searchParams.get('feed') === 'following' && url.searchParams.get('page') === '2' && offsetOf(followingPageRequest) === 10;
    });

    const emptyPage = await authContext.newPage();
    attachRuntimeListeners(emptyPage);
    scenario = 'following-empty';
    start = apiRequests.length;
    await emptyPage.goto(`${origin}/?feed=following`, { waitUntil: 'domcontentloaded' });
    await waitForRequest(apiRequests, start, (record) => articleRequest(record) && record.path === '/articles/feed');
    const emptyMessage = emptyPage.locator('.empty-feed-message');
    await check('empty-following-feed-offers-global-route', async () => {
      if ((await emptyMessage.count()) !== 1) return false;
      const recovery = emptyMessage.getByRole('link', { name: 'Global Feed', exact: true });
      const href = await recovery.getAttribute('href');
      if (!href || new URL(href, origin).pathname !== '/') return false;
      await recovery.click();
      await emptyPage.waitForURL((url) => url.pathname === '/' && url.search === '', { timeout: 10_000 });
      return true;
    });

    const anonymousContext = await configureContext(false);
    const anonymousPage = await anonymousContext.newPage();
    attachRuntimeListeners(anonymousPage);
    scenario = 'anonymous-following';
    await anonymousPage.goto(`${origin}/?feed=following`, { waitUntil: 'domcontentloaded' });
    await check('anonymous-following-url-redirects-to-login', async () => {
      await anonymousPage.waitForURL((url) => url.pathname === '/login', { timeout: 5_000 });
      return new URL(anonymousPage.url()).pathname === '/login';
    });

    checks.navigationControlsRemainAccessible =
      checks['feed-tabs-have-stable-keyboard-links'] === true &&
      checks['tag-link-has-stable-route'] === true &&
      (await historyPage.locator('.pagination .page-link').evaluateAll((buttons) =>
        buttons.every((button) => button.textContent?.trim() && !button.hasAttribute('aria-hidden')),
      ));
    await delay(300);
    checks.browserConsoleClean = runtimeErrors.length === 0;

    await anonymousContext.close();
    await authContext.close();

    const failures = Object.entries(checks)
      .filter(([, passed]) => !passed)
      .map(([id]) => id);
    return {
      passed: failures.length === 0,
      metrics: {
        governanceViolations: 0,
        accessibilityViolations: checks.navigationControlsRemainAccessible ? 0 : 1,
        behaviorChecksPassed: Object.keys(checks).length - failures.length,
        behaviorChecksTotal: Object.keys(checks).length,
      },
      checks: Object.entries(checks).map(([id, passed]) => ({ id, passed })),
      failures,
      evidenceErrors,
      runtimeErrors,
      evidence: {
        articleRequests: apiRequests
          .filter(articleRequest)
          .map(({ scenario: requestScenario, path, query }) => ({ scenario: requestScenario, path, query })),
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
