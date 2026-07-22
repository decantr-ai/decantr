#!/usr/bin/env node
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { mkdtemp, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const checks = [];

function record(id, passed, detail, accessibility = false) {
  checks.push({ id, passed: Boolean(passed), ...(detail === undefined ? {} : { detail }), ...(accessibility ? { accessibility: true } : {}) });
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--workspace') options.workspace = resolve(argv[++index]);
    else if (argv[index] === '--project-path') options.projectPath = argv[++index];
    else if (argv[index] === '--evaluator-runtime') options.evaluatorRuntime = resolve(argv[++index]);
    else throw new Error(`Unknown option: ${argv[index]}`);
  }
  if (!options.workspace || !options.projectPath || !options.evaluatorRuntime) {
    throw new Error('--workspace, --project-path, and --evaluator-runtime are required');
  }
  return options;
}

function contained(root, target) {
  const relation = relative(root, target);
  return relation === '' || (!relation.startsWith(`..${sep}`) && relation !== '..' && !isAbsolute(relation));
}

function moduleSpecifier(from, target) {
  const path = relative(from, target).split(sep).join('/');
  return path.startsWith('.') ? path : `./${path}`;
}

async function listen(server) {
  await new Promise((accept, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', accept);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Harness server did not bind a TCP port');
  return `http://127.0.0.1:${address.port}`;
}

async function closeServer(server) {
  await new Promise((accept) => server.close(() => accept()));
}

function relationTokens(value) {
  return new Set(String(value ?? '').split(/\s+/u).filter(Boolean));
}

function linkSnapshot(value) {
  const rel = relationTokens(value.rel);
  return {
    ...value,
    isolated: rel.has('noopener') && rel.has('noreferrer'),
  };
}

async function observePopup(context, page, link) {
  const attributes = await link.evaluate((anchor) => ({
    href: anchor.href,
    rel: anchor.getAttribute('rel'),
    target: anchor.getAttribute('target'),
  }));
  const beforeUrl = page.url();
  if (attributes.target !== '_blank') {
    return { ...linkSnapshot(attributes), currentUrlUnchanged: true, opened: false, openerIsNull: false };
  }
  const popupPromise = context.waitForEvent('page', { timeout: 5000 });
  await link.click();
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');
  const evidence = {
    ...linkSnapshot(attributes),
    currentUrlUnchanged: page.url() === beforeUrl,
    opened: true,
    openerIsNull: await popup.evaluate(() => window.opener === null),
    popupPath: new URL(popup.url()).pathname,
  };
  await popup.close();
  return evidence;
}

function emit() {
  const failures = checks.filter((check) => !check.passed);
  const result = {
    passed: checks.length > 0 && failures.length === 0,
    metrics: {
      governanceViolations: 0,
      accessibilityViolations: failures.filter((check) => check.accessibility).length,
      behaviorChecksPassed: checks.length - failures.length,
      behaviorChecksTotal: checks.length,
    },
    checks,
  };
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (!result.passed) process.exitCode = 1;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const workspaceRoot = await realpath(options.workspace);
  const projectRoot = await realpath(resolve(options.workspace, options.projectPath));
  if (!contained(workspaceRoot, projectRoot)) throw new Error('Project path escapes workspace');

  const runtimeRequire = createRequire(join(options.evaluatorRuntime, 'package.json'));
  const candidateRequire = createRequire(join(projectRoot, 'package.json'));
  const { chromium } = runtimeRequire('playwright');
  const AxeBuilder = runtimeRequire('@axe-core/playwright');
  const vite = await import(pathToFileURL(candidateRequire.resolve('vite')).href);

  const harnessRoot = await mkdtemp(join(projectRoot, '.evaluator-markdown-'));
  const outputRoot = join(harnessRoot, 'dist');
  let browser;
  let server;
  try {
    server = createServer(async (request, response) => {
      const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');
      if (requestUrl.pathname === '/destination') {
        response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        response.end(
          '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Destination</title></head><body><h1>Destination</h1><script>window.__openerWasNull = window.opener === null; if (window.opener) window.opener.__openerTouched = true;</script></body></html>',
        );
        return;
      }
      if (requestUrl.pathname === '/favicon.ico') {
        response.writeHead(204).end();
        return;
      }
      try {
        const relativePath = requestUrl.pathname === '/' ? 'index.html' : requestUrl.pathname.slice(1);
        const filePath = resolve(outputRoot, relativePath);
        if (!contained(outputRoot, filePath) || !(await stat(filePath)).isFile()) throw new Error('not found');
        const body = await readFile(filePath);
        const contentType = filePath.endsWith('.js')
          ? 'text/javascript; charset=utf-8'
          : filePath.endsWith('.css')
            ? 'text/css; charset=utf-8'
            : 'text/html; charset=utf-8';
        response.writeHead(200, { 'content-type': contentType });
        response.end(body);
      } catch {
        response.writeHead(404).end('not found');
      }
    });
    const origin = await listen(server);

    const markdownPath = resolve(projectRoot, 'src/components/Markdown/Markdown.tsx');
    const productTabsPath = resolve(
      projectRoot,
      'src/features/Marketplace/ProductDetails/ProductDetailsTabs.tsx',
    );
    const themePath = resolve(projectRoot, 'src/LinodeThemeWrapper.tsx');
    const marketplaceMarkdown = [
      `[Explicit marketplace link](${origin}/destination?kind=explicit)`,
      `${origin}/destination?kind=autolink`,
      '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="Safe image" onerror="window.__unsafeExecuted = true">',
      '<script>window.__unsafeExecuted = true</script>',
      '<a href="javascript:window.__unsafeExecuted=true" onclick="window.__unsafeExecuted=true">Unsafe link</a>',
    ].join('\n\n');
    const ordinaryMarkdown = `[Ordinary link](${origin}/destination?kind=ordinary)`;
    await writeFile(
      join(harnessRoot, 'entry.tsx'),
      `import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Markdown } from ${JSON.stringify(moduleSpecifier(harnessRoot, markdownPath))};
import { ProductDetailsTabs } from ${JSON.stringify(moduleSpecifier(harnessRoot, productTabsPath))};
import { LinodeThemeWrapper } from ${JSON.stringify(moduleSpecifier(harnessRoot, themePath))};

window.__openerTouched = false;
window.__unsafeExecuted = false;
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

createRoot(document.getElementById('harness')).render(
  <QueryClientProvider client={queryClient}>
    <LinodeThemeWrapper theme="light">
      <main>
        <section id="ordinary" aria-labelledby="ordinary-heading">
          <h1 id="ordinary-heading">Ordinary Markdown</h1>
          <Markdown textOrMarkdown={${JSON.stringify(ordinaryMarkdown)}} />
        </section>
        <section id="marketplace" aria-labelledby="marketplace-heading">
          <h1 id="marketplace-heading">Marketplace details</h1>
          <ProductDetailsTabs details={{ overview: ${JSON.stringify(marketplaceMarkdown)} }} />
        </section>
      </main>
    </LinodeThemeWrapper>
  </QueryClientProvider>,
);
`,
      'utf8',
    );
    await writeFile(
      join(harnessRoot, 'index.html'),
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Markdown harness</title></head><body><div id="harness"></div><script type="module" src="/entry.tsx"></script></body></html>',
      'utf8',
    );
    await vite.build({
      build: { emptyOutDir: true, outDir: outputRoot },
      configFile: resolve(projectRoot, 'vite.config.ts'),
      logLevel: 'silent',
      root: harnessRoot,
    });

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    const runtimeErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(message.text());
    });
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    await page.goto(origin, { waitUntil: 'networkidle' });

    await page.waitForTimeout(500);
    const harnessSnapshot = await page.evaluate(() => ({
      bodyText: document.body.innerText.slice(0, 500),
      links: document.querySelectorAll('a').length,
      rootChildren: document.querySelector('#harness')?.children.length ?? 0,
    }));
    record(
      'real-markdown-components-rendered',
      harnessSnapshot.links >= 3 && harnessSnapshot.rootChildren > 0 && runtimeErrors.length === 0,
      { ...harnessSnapshot, runtimeErrors: [...runtimeErrors] },
    );
    if (harnessSnapshot.links === 0) {
      throw new Error(`Markdown harness did not render links: ${JSON.stringify({ ...harnessSnapshot, runtimeErrors })}`);
    }

    const ordinaryLink = page.getByRole('link', { exact: true, name: 'Ordinary link' });
    const ordinaryAttributes = await ordinaryLink.evaluate((anchor) => ({
      href: anchor.href,
      rel: anchor.getAttribute('rel'),
      target: anchor.getAttribute('target'),
    }));
    record(
      'ordinary-markdown-retains-same-tab-contract',
      ordinaryAttributes.target === null && ordinaryAttributes.rel === null,
      ordinaryAttributes,
    );

    const explicitLink = page.getByRole('link', { exact: true, name: 'Explicit marketplace link' });
    const autolink = page.locator('#marketplace a').filter({ hasText: `${origin}/destination?kind=autolink` });
    record(
      'markdown-and-autolink-fixtures-render',
      (await explicitLink.count()) === 1 && (await autolink.count()) === 1,
    );

    const explicitEvidence = await observePopup(context, page, explicitLink);
    record(
      'marketplace-markdown-link-opens-an-isolated-tab',
      explicitEvidence.opened &&
        explicitEvidence.isolated &&
        explicitEvidence.openerIsNull &&
        explicitEvidence.currentUrlUnchanged &&
        explicitEvidence.popupPath === '/destination',
      explicitEvidence,
    );

    const autolinkEvidence = await observePopup(context, page, autolink);
    record(
      'marketplace-autolink-opens-an-isolated-tab',
      autolinkEvidence.opened &&
        autolinkEvidence.isolated &&
        autolinkEvidence.openerIsNull &&
        autolinkEvidence.currentUrlUnchanged &&
        autolinkEvidence.popupPath === '/destination',
      autolinkEvidence,
    );
    record(
      'opened-pages-cannot-control-the-marketplace-page',
      (await page.evaluate(() => window.__openerTouched)) === false,
    );

    const sanitization = await page.locator('#marketplace').evaluate((section) => {
      const unsafeLink = [...section.querySelectorAll('a')].find((anchor) => anchor.textContent === 'Unsafe link');
      return {
        eventAttributes: section.querySelectorAll('[onerror], [onclick], [onload]').length,
        scripts: section.querySelectorAll('script').length,
        unsafeHref: unsafeLink?.getAttribute('href') ?? null,
        unsafeExecuted: window.__unsafeExecuted,
      };
    });
    record(
      'marketplace-markdown-remains-sanitized',
      sanitization.eventAttributes === 0 &&
        sanitization.scripts === 0 &&
        sanitization.unsafeHref === null &&
        sanitization.unsafeExecuted === false,
      sanitization,
    );

    const linkAxe = await new AxeBuilder({ page })
      .include('#ordinary a')
      .include('#marketplace a')
      .disableRules(['color-contrast'])
      .analyze();
    record(
      'rendered-links-have-no-structural-axe-violations',
      linkAxe.violations.length === 0,
      linkAxe.violations.map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.length })),
      true,
    );

    const pageCount = context.pages().length;
    await ordinaryLink.click();
    await page.waitForURL(`${origin}/destination?kind=ordinary`);
    record(
      'ordinary-markdown-navigates-the-current-tab',
      context.pages().length === pageCount && new URL(page.url()).pathname === '/destination',
      { pageCountBefore: pageCount, pageCountAfter: context.pages().length, url: page.url() },
    );
    record('no-browser-runtime-errors', runtimeErrors.length === 0, runtimeErrors);
    await context.close();
  } finally {
    if (browser) await browser.close();
    if (server?.listening) await closeServer(server);
    await rm(harnessRoot, { recursive: true, force: true });
  }
}

try {
  await main();
} catch (error) {
  record('oracle-execution', false, error instanceof Error ? error.message : String(error));
}

emit();
