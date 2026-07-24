#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
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

async function createHarness(project) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'discussion-pagination-evaluator-')));
  const projectRequire = createRequire(join(project, 'package.json'));
  const vitePackagePath = projectRequire.resolve('vite/package.json');
  const vitePackage = JSON.parse(await readFile(vitePackagePath, 'utf8'));
  const viteCli = resolve(dirname(vitePackagePath), vitePackage.bin.vite);
  const sourceRoot = join(project, 'src');
  const discussionsApiPath = join(sourceRoot, 'features', 'discussions', 'api', 'get-discussions.ts');
  const commentsApiPath = join(sourceRoot, 'features', 'comments', 'api', 'get-comments.ts');
  await Promise.all([
    access(join(sourceRoot, 'features', 'discussions', 'components', 'discussions-list.tsx')),
    access(join(sourceRoot, 'features', 'comments', 'components', 'comments-list.tsx')),
    access(join(sourceRoot, 'components', 'ui', 'table', 'table.tsx')),
    access(discussionsApiPath),
    access(commentsApiPath),
  ]);
  await symlink(join(project, 'node_modules'), join(root, 'node_modules'), 'dir');

  await writeFile(
    join(root, 'index.html'),
    '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="app"></div><script type="module" src="/src.tsx"></script></body></html>',
  );
  await writeFile(
    join(root, 'harness.css'),
    `body { margin: 0; padding: 24px; background: #f3f4f6; color: #111827; font-family: Arial, sans-serif; }
#evaluator-app { display: grid; gap: 28px; max-width: 1080px; }
.evaluator-panel { background: white; border: 1px solid #d1d5db; padding: 18px; }
`,
  );
  await writeFile(
    join(root, 'api-client.ts'),
    `export const api = {
  async get(url, options = {}) {
    window.__recordedApiCalls = window.__recordedApiCalls || [];
    window.__recordedApiCalls.push({ url, params: options.params || null });
    if (url === '/discussions') {
      const page = Number(options.params?.page || 1);
      return { data: [], meta: { page, total: 50, totalPages: 5 } };
    }
    if (url === '/comments') {
      const page = Number(options.params?.page || 1);
      return { data: [], meta: { page, total: 6, totalPages: 3 } };
    }
    return null;
  },
};
`,
  );
  await writeFile(
    join(root, 'discussions-api.ts'),
    `const discussion = (page, index) => ({
  id: \`discussion-\${page}-\${index}\`,
  title: \`Discussion \${page}-\${index}\`,
  body: \`Discussion body \${page}-\${index}\`,
  createdAt: '2026-07-01T12:00:00.000Z',
  teamId: 'team-evaluator',
  authorId: 'user-evaluator',
});

export function useDiscussions(options = {}) {
  const page = Number(options.page || 1);
  window.__discussionQueryPages = window.__discussionQueryPages || [];
  window.__discussionQueryPages.push(page);
  const data = Array.from({ length: 3 }, (_, index) => discussion(page, index + 1));
  return options.page === undefined
    ? { isLoading: false, data }
    : { isLoading: false, data: { data, meta: { page, total: 15, totalPages: 5 } } };
}

export function getDiscussionsQueryOptions(options = {}) {
  const page = Number(options.page || 1);
  return { queryKey: ['discussions', { page }], queryFn: async () => ({ data: [], meta: { page, total: 0, totalPages: 5 } }) };
}
`,
  );
  await writeFile(
    join(root, 'discussion-detail-api.ts'),
    `export const getDiscussionQueryOptions = (id) => ({
  queryKey: ['discussion', id],
  queryFn: async () => ({ id, title: id }),
});
`,
  );
  await writeFile(
    join(root, 'comments-api.ts'),
    `import { useState } from 'react';

const makePage = (page) => ({
  data: [1, 2].map((index) => ({
    id: \`comment-\${page}-\${index}\`,
    body: \`Comment page \${page} item \${index}\`,
    createdAt: '2026-07-01T12:00:00.000Z',
    discussionId: 'discussion-evaluator',
    authorId: 'user-evaluator',
    author: { id: 'user-evaluator', firstName: 'Eval', lastName: 'User' },
  })),
  meta: { page, total: 6, totalPages: 3 },
});

export function useComments({ discussionId }) {
  return { isLoading: false, data: discussionId === 'empty' ? [] : makePage(1).data };
}

export function useInfiniteComments({ discussionId }) {
  const [pages, setPages] = useState(discussionId === 'empty' ? [{ data: [], meta: { page: 1, total: 0, totalPages: 1 } }] : [makePage(1)]);
  const [isFetchingNextPage, setFetching] = useState(false);
  const fetchNextPage = async () => {
    window.__commentTransitions = window.__commentTransitions || [];
    window.__commentTransitions.push('fetch-start');
    setFetching(true);
    await new Promise((resolve) => setTimeout(resolve, 140));
    setPages((current) => [...current, makePage(current.length + 1)]);
    setFetching(false);
    window.__commentTransitions.push('fetch-end');
  };
  return {
    isLoading: false,
    data: { pages },
    hasNextPage: discussionId !== 'empty' && pages.length < 3,
    isFetchingNextPage,
    fetchNextPage,
  };
}
`,
  );
  await writeFile(
    join(root, 'auth.ts'),
    `export const useUser = () => ({
  data: { id: 'user-evaluator', firstName: 'Eval', lastName: 'User', role: 'ADMIN' },
});
`,
  );
  await writeFile(
    join(root, 'authorization.tsx'),
    `import React from 'react';
export const ROLES = { ADMIN: 'ADMIN', USER: 'USER' };
export const POLICIES = { 'comment:delete': () => true };
export function useAuthorization() {
  return { checkAccess: () => true, role: ROLES.ADMIN };
}
export function Authorization({ children }) { return <>{children}</>; }
`,
  );
  await writeFile(
    join(root, 'md-preview.tsx'),
    `import React from 'react';
export function MDPreview({ value }) { return <p>{value}</p>; }
`,
  );
  await writeFile(
    join(root, 'delete.tsx'),
    `import React from 'react';
export function DeleteDiscussion() { return null; }
export function DeleteComment() { return null; }
`,
  );
  await writeFile(
    join(root, 'src.tsx'),
    `import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import { DiscussionsList } from '@/features/discussions/components/discussions-list';
import { CommentsList } from '@/features/comments/components/comments-list';
import '@/index.css';
import './harness.css';

const discussionsApiPath = ${JSON.stringify(`/@fs/${discussionsApiPath}`)};
const commentsApiPath = ${JSON.stringify(`/@fs/${commentsApiPath}`)};
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

async function probeCandidateApis() {
  const discussions = await import(/* @vite-ignore */ discussionsApiPath);
  const comments = await import(/* @vite-ignore */ commentsApiPath);
  window.__recordedApiCalls = [];
  let discussionQueryKey = null;
  let discussionResult = null;
  let commentsResult = null;
  let infinite = null;
  try {
    discussionResult = await discussions.getDiscussions(4);
    discussionQueryKey = discussions.getDiscussionsQueryOptions({ page: 4 }).queryKey;
  } catch (error) {
    discussionResult = { error: String(error) };
  }
  try {
    commentsResult = await comments.getComments({ discussionId: 'discussion-evaluator', page: 2 });
    if (typeof comments.getInfiniteCommentsQueryOptions === 'function') {
      const options = comments.getInfiniteCommentsQueryOptions('discussion-evaluator');
      const pageTwo = await options.queryFn({ pageParam: 2 });
      infinite = {
        initialPageParam: options.initialPageParam,
        nextPage: options.getNextPageParam({ data: [], meta: { page: 1, total: 6, totalPages: 3 } }),
        pageTwo,
      };
    }
  } catch (error) {
    commentsResult = { error: String(error) };
  }
  window.__candidateApiProbe = {
    calls: window.__recordedApiCalls,
    discussionQueryKey,
    discussionResult,
    commentsResult,
    infinite,
  };
}

function Harness() {
  useEffect(() => { void probeCandidateApis(); }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <main id="evaluator-app">
          <section className="evaluator-panel" data-evaluator-discussions>
            <h1>Discussions</h1>
            <DiscussionsList />
          </section>
          <section className="evaluator-panel" data-evaluator-comments>
            <h2>Comments</h2>
            <CommentsList discussionId="discussion-evaluator" />
          </section>
          <section className="evaluator-panel" data-evaluator-empty-comments>
            <h2>Empty comments</h2>
            <CommentsList discussionId="empty" />
          </section>
        </main>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById('app')).render(<Harness />);
`,
  );
  const aliases = [
    { find: '../api/get-discussions', replacement: join(root, 'discussions-api.ts') },
    { find: '../api/get-discussion', replacement: join(root, 'discussion-detail-api.ts') },
    { find: '../api/get-comments', replacement: join(root, 'comments-api.ts') },
    { find: './delete-discussion', replacement: join(root, 'delete.tsx') },
    { find: './delete-comment', replacement: join(root, 'delete.tsx') },
    { find: '@/lib/api-client', replacement: join(root, 'api-client.ts') },
    {
      find: '@/features/discussions/api/get-discussions',
      replacement: join(root, 'discussions-api.ts'),
    },
    {
      find: '@/features/discussions/api/get-discussion',
      replacement: join(root, 'discussion-detail-api.ts'),
    },
    {
      find: '@/features/discussions/components/delete-discussion',
      replacement: join(root, 'delete.tsx'),
    },
    {
      find: '@/features/comments/api/get-comments',
      replacement: join(root, 'comments-api.ts'),
    },
    {
      find: '@/features/comments/components/delete-comment',
      replacement: join(root, 'delete.tsx'),
    },
    { find: '@/lib/auth', replacement: join(root, 'auth.ts') },
    { find: '@/lib/authorization', replacement: join(root, 'authorization.tsx') },
    { find: '@/components/ui/md-preview', replacement: join(root, 'md-preview.tsx') },
    { find: '@', replacement: sourceRoot },
  ];
  await writeFile(
    join(root, 'vite.config.mjs'),
    `import { createRequire } from 'node:module';
import { defineConfig } from 'vite';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';

const require = createRequire(import.meta.url);
const tailwindConfig = require(${JSON.stringify(join(project, 'tailwind.config.cjs'))});
export default defineConfig({
  root: ${JSON.stringify(root)},
  css: { postcss: { plugins: [tailwindcss(tailwindConfig), autoprefixer()] } },
  resolve: { alias: ${JSON.stringify(aliases)} },
  esbuild: { jsx: 'automatic' },
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

function digest(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function evaluate() {
  const options = parseArguments(process.argv.slice(2));
  const project = await realpath(options.project);
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
    const context = await browser.newContext({ viewport: { width: 1200, height: 1000 } });
    const page = await context.newPage();
    page.setDefaultTimeout(10_000);
    const runtimeErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => runtimeErrors.push(`page: ${error.message}`));
    page.on('requestfailed', (request) =>
      runtimeErrors.push(`request: ${request.url()} (${request.failure()?.errorText ?? 'failed'})`),
    );

    const checks = {
      realListsMounted: false,
      realQueryFunctionsPropagatePageState: false,
      directUrlLoadsRequestedDiscussionPage: false,
      compactNumberedNavigationUsesServerMetadata: false,
      numberedNavigationUpdatesUrlAndServerContent: false,
      browserHistoryRestoresPriorPage: false,
      commentPagesAccumulateWithVisibleProgress: false,
      emptyCommentsStateIsPreserved: false,
      renderedFlowHasNoAxeViolations: false,
      fixedScreenshotIsNonblank: false,
      browserConsoleClean: false,
    };
    const evidence = {};
    const evidenceErrors = [];
    const axeViolations = [];
    const check = async (id, operation) => {
      try {
        checks[id] = Boolean(await operation());
      } catch (error) {
        evidenceErrors.push(`${id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    const waitForDiscussion = async (pageNumber) => {
      await page.getByText(`Discussion ${pageNumber}-1`, { exact: true }).waitFor({
        state: 'visible',
      });
    };

    await check('realListsMounted', async () => {
      const response = await page.goto(`${origin}/?page=3`, { waitUntil: 'networkidle' });
      await page.locator('[data-evaluator-discussions] table').waitFor({ state: 'visible' });
      return (
        Boolean(response?.ok()) &&
        (await page.locator('[data-evaluator-discussions] table').count()) === 1 &&
        (await page.locator('[data-evaluator-comments] [aria-label^="comment-"]').count()) === 2 &&
        (await page.locator('[data-evaluator-empty-comments]').getByText('No Comments Found').count()) ===
          1
      );
    });
    if (!checks.realListsMounted) {
      const renderedText = await page.locator('body').innerText().catch(() => '');
      throw new Error(
        `Discussion harness did not mount: ${[
          ...evidenceErrors,
          ...runtimeErrors,
          `rendered: ${renderedText.slice(0, 2_000)}`,
          ...serverOutput,
        ]
          .join(' | ')
          .slice(0, 12_000)}`,
      );
    }

    await check('realQueryFunctionsPropagatePageState', async () => {
      await page.waitForFunction(() => window.__candidateApiProbe !== undefined);
      const probe = await page.evaluate(() => window.__candidateApiProbe);
      evidence.apiProbe = probe;
      const discussionCall = probe.calls.find((call) => call.url === '/discussions');
      const commentCalls = probe.calls.filter((call) => call.url === '/comments');
      return (
        discussionCall?.params?.page === 4 &&
        JSON.stringify(probe.discussionQueryKey).includes('4') &&
        commentCalls.some((call) => call.params?.discussionId === 'discussion-evaluator' && call.params?.page === 2) &&
        probe.infinite?.initialPageParam === 1 &&
        probe.infinite?.nextPage === 2 &&
        commentCalls.filter((call) => call.params?.page === 2).length >= 2
      );
    });
    await check('directUrlLoadsRequestedDiscussionPage', async () => {
      const hasRequestedContent =
        (await page.getByText('Discussion 3-1', { exact: true }).count()) === 1;
      const queryPages = await page.evaluate(() => window.__discussionQueryPages ?? []);
      evidence.directLoadQueryPages = queryPages;
      return (
        hasRequestedContent &&
        new URL(page.url()).searchParams.get('page') === '3' &&
        queryPages.includes(3)
      );
    });
    await check('compactNumberedNavigationUsesServerMetadata', async () => {
      const navigation = page.getByRole('navigation', { name: 'pagination', exact: true });
      if ((await navigation.count()) !== 1) return false;
      const links = navigation.getByRole('link');
      const linkText = (await links.allTextContents()).map((value) => value.trim());
      const hrefs = await links.evaluateAll((elements) =>
        elements.map((element) => element.getAttribute('href')),
      );
      const current = navigation.getByRole('link', { name: '3', exact: true });
      const previous = navigation.getByRole('link', { name: '2', exact: true });
      const currentBackground = await current.locator('xpath=..').evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      );
      const previousBackground = await previous.locator('xpath=..').evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      );
      evidence.pagination = { linkText, hrefs, currentBackground, previousBackground };
      return (
        linkText.includes('2') &&
        linkText.includes('3') &&
        linkText.includes('4') &&
        hrefs.some((href) => href?.endsWith('?page=2')) &&
        hrefs.some((href) => href?.endsWith('?page=4')) &&
        currentBackground !== previousBackground &&
        (await navigation.locator('[aria-hidden="true"]').count()) >= 2
      );
    });
    await check('numberedNavigationUpdatesUrlAndServerContent', async () => {
      const navigation = page.getByRole('navigation', { name: 'pagination', exact: true });
      if ((await navigation.getByRole('link', { name: '4', exact: true }).count()) !== 1) {
        return false;
      }
      await navigation.getByRole('link', { name: '4', exact: true }).click();
      await waitForDiscussion(4);
      return new URL(page.url()).searchParams.get('page') === '4';
    });
    await check('browserHistoryRestoresPriorPage', async () => {
      if (!checks.numberedNavigationUpdatesUrlAndServerContent) return false;
      await page.goBack({ waitUntil: 'networkidle' });
      await waitForDiscussion(3);
      return new URL(page.url()).searchParams.get('page') === '3';
    });
    await check('commentPagesAccumulateWithVisibleProgress', async () => {
      const panel = page.locator('[data-evaluator-comments]');
      const comments = panel.locator('[aria-label^="comment-"]');
      const loadMore = panel.getByRole('button', { name: 'Load More Comments', exact: true });
      const initial = await comments.count();
      if ((await loadMore.count()) !== 1) return false;
      await loadMore.click();
      await page.waitForFunction(() => (window.__commentTransitions ?? []).includes('fetch-start'));
      const progressVisible =
        (await loadMore.locator('svg').count()) > 0 ||
        !(await loadMore.getByText('Load More Comments', { exact: true }).isVisible().catch(() => false));
      await page.waitForFunction(() => (window.__commentTransitions ?? []).filter((value) => value === 'fetch-end').length >= 1);
      await page.waitForFunction(() => document.querySelectorAll('[data-evaluator-comments] [aria-label^="comment-"]').length === 4);
      await panel.getByRole('button', { name: 'Load More Comments', exact: true }).click();
      await page.waitForFunction(() => document.querySelectorAll('[data-evaluator-comments] [aria-label^="comment-"]').length === 6);
      const finalButtonCount = await panel.getByRole('button', {
        name: 'Load More Comments',
        exact: true,
      }).count();
      const transitions = await page.evaluate(() => window.__commentTransitions ?? []);
      evidence.commentLoading = { initial, final: await comments.count(), progressVisible, transitions };
      return initial === 2 && progressVisible && (await comments.count()) === 6 && finalButtonCount === 0;
    });
    await check('emptyCommentsStateIsPreserved', async () => {
      const empty = page.locator('[data-evaluator-empty-comments]');
      return (
        (await empty.getByText('No Comments Found', { exact: true }).count()) === 1 &&
        (await empty.getByRole('list', { name: 'comments', exact: true }).count()) === 1
      );
    });
    await check('renderedFlowHasNoAxeViolations', async () => {
      const report = await new AxeBuilder({ page })
        .include('#evaluator-app')
        .exclude('[data-evaluator-empty-comments]')
        .disableRules(['color-contrast'])
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      axeViolations.push(...report.violations.map(({ id, impact }) => ({ id, impact })));
      return report.violations.length === 0;
    });
    await check('fixedScreenshotIsNonblank', async () => {
      const screenshot = await page.screenshot({ fullPage: true });
      evidence.screenshot = { bytes: screenshot.length, sha256: digest(screenshot) };
      return screenshot.length > 30_000;
    });

    await delay(150);
    checks.browserConsoleClean = runtimeErrors.length === 0;
    const failures = Object.entries(checks)
      .filter(([, passed]) => !passed)
      .map(([id]) => id);
    return {
      passed: failures.length === 0,
      metrics: {
        governanceViolations:
          checks.realQueryFunctionsPropagatePageState && checks.browserHistoryRestoresPriorPage
            ? 0
            : 1,
        accessibilityViolations: checks.renderedFlowHasNoAxeViolations ? 0 : 1,
        visualScore: Math.round(
          ([
            checks.compactNumberedNavigationUsesServerMetadata,
            checks.commentPagesAccumulateWithVisibleProgress,
            checks.fixedScreenshotIsNonblank,
          ].filter(Boolean).length /
            3) *
            100,
        ),
      },
      checks: Object.entries(checks).map(([id, passed]) => ({ id, passed })),
      failures,
      evidence,
      evidenceErrors,
      axeViolations,
      runtimeErrors,
      serverOutput,
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
      metrics: { governanceViolations: 1, accessibilityViolations: 1, visualScore: 0 },
      checks: [{ id: 'evaluator-runtime', passed: false }],
      failures: [error instanceof Error ? error.message : String(error)],
    })}\n`,
  );
  process.exitCode = 1;
}
