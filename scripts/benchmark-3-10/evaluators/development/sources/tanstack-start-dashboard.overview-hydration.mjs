#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer as createHttpServer } from 'node:http';
import { access, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createServer as createNetServer } from 'node:net';
import { extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
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
  const server = createNetServer();
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Could not reserve a production port');
  await new Promise((resolveClose, reject) => server.close((error) => (error ? reject(error) : resolveClose())));
  return address.port;
}

function contentType(path) {
  return (
    {
      '.css': 'text/css; charset=utf-8',
      '.html': 'text/html; charset=utf-8',
      '.ico': 'image/x-icon',
      '.js': 'text/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
    }[extname(path).toLowerCase()] ?? 'application/octet-stream'
  );
}

async function startVercelOutput(project, origin, port, serverRuntimeErrors) {
  const outputRoot = join(project, '.vercel', 'output');
  const staticRoot = join(outputRoot, 'static');
  const functionEntry = join(outputRoot, 'functions', '__server.func', 'index.mjs');
  await access(functionEntry);
  const module = await import(`${pathToFileURL(functionEntry).href}?evaluator=${Date.now()}`);
  const fetchHandler = module.default?.fetch;
  if (typeof fetchHandler !== 'function') throw new Error('Production function does not export a fetch handler');

  const server = createHttpServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? '/', origin);
      const staticPath = resolve(staticRoot, `.${decodeURIComponent(url.pathname)}`);
      const relation = relative(staticRoot, staticPath);
      if (relation !== '..' && !relation.startsWith(`..${sep}`) && !isAbsolute(relation)) {
        try {
          const body = await readFile(staticPath);
          response.statusCode = 200;
          response.setHeader('content-type', contentType(staticPath));
          response.end(request.method === 'HEAD' ? undefined : body);
          return;
        } catch (error) {
          if (error?.code !== 'ENOENT' && error?.code !== 'EISDIR') throw error;
        }
      }

      const headers = new Headers();
      for (const [name, value] of Object.entries(request.headers)) {
        if (Array.isArray(value)) value.forEach((item) => headers.append(name, item));
        else if (value !== undefined) headers.set(name, value);
      }
      const fetchRequest = new Request(url, { method: request.method, headers });
      const fetchResponse = await fetchHandler(fetchRequest, { waitUntil() {} });
      response.statusCode = fetchResponse.status;
      response.statusMessage = fetchResponse.statusText;
      fetchResponse.headers.forEach((value, name) => response.setHeader(name, value));
      const body = Buffer.from(await fetchResponse.arrayBuffer());
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch (error) {
      serverRuntimeErrors.push(error instanceof Error ? error.message : String(error));
      response.statusCode = 500;
      response.setHeader('content-type', 'application/json; charset=utf-8');
      response.end(JSON.stringify({ error: true }));
    }
  });
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolveListen);
  });
  return async () => {
    await new Promise((resolveClose) => server.close(() => resolveClose()));
  };
}

async function waitForServer(url, child) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Production server exited with ${child.exitCode}`);
    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (response.status < 500) return;
    } catch {
      // The fixed production server is still starting.
    }
    await delay(250);
  }
  throw new Error('Timed out waiting for the production server');
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

async function dashboardEvidence(page) {
  const inset = page.locator('[data-slot="sidebar-inset"]');
  const cards = inset.locator('[data-slot="card"]');
  await cards.nth(7).waitFor({ state: 'visible', timeout: 20_000 });
  return cards.evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();
      const title = element.querySelector('[data-slot="card-title"]')?.textContent?.trim() ?? '';
      const description = element.querySelector('[data-slot="card-description"]')?.textContent?.trim() ?? '';
      const surfaces = [...element.querySelectorAll('svg, canvas')]
        .map((surface) => {
          const surfaceBox = surface.getBoundingClientRect();
          return {
            width: surfaceBox.width,
            height: surfaceBox.height,
            marks: surface.querySelectorAll('path, rect, circle, line, polygon, polyline').length,
          };
        })
        .filter((surface) => surface.width > 20 && surface.height > 20 && surface.marks > 0);
      return {
        width: box.width,
        height: box.height,
        title,
        description,
        surfaces,
        images: element.querySelectorAll('img').length,
        repeatedRows: element.querySelectorAll('[data-slot="avatar"], [data-slot="avatar-fallback"]').length,
      };
    }),
  );
}

function completeDashboard(evidence) {
  if (evidence.length !== 8) return false;
  const kpis = evidence.slice(0, 4);
  const panels = evidence.slice(4);
  const visible = evidence.every((item) => item.width > 100 && item.height > 60);
  const kpiSemantics =
    kpis.every((item) => item.title.length > 0 && item.description.length > 0) &&
    new Set(kpis.map((item) => item.description)).size === 4;
  const panelSemantics =
    panels.every((item) => item.title.length > 0) && new Set(panels.map((item) => item.title)).size === 4;
  const graphicalPanels = panels.filter((item) => item.surfaces.length > 0);
  const dataPanel = panels.some((item) => item.repeatedRows >= 5 || item.images >= 5);
  return visible && kpiSemantics && panelSemantics && graphicalPanels.length >= 3 && dataPanel;
}

async function evaluate() {
  const options = parseArgs(process.argv.slice(2));
  const project = resolveProject(options.workspace, options.projectPath);
  const serverEntry = join(project, '.output', 'server', 'index.mjs');
  await access(join(options.evaluatorRuntime, 'package.json'));
  const runtimeRequire = createRequire(join(options.evaluatorRuntime, 'package.json'));
  const { chromium } = runtimeRequire('playwright');
  const AxeBuilder = runtimeRequire('@axe-core/playwright').default;
  const port = await reservePort();
  const origin = `http://127.0.0.1:${port}`;
  const serverRuntimeErrors = [];
  let stopServer;
  try {
    await access(serverEntry);
    const server = spawn(process.execPath, [serverEntry], {
      cwd: project,
      env: {
        ...process.env,
        HOST: '127.0.0.1',
        NITRO_HOST: '127.0.0.1',
        PORT: String(port),
        NITRO_PORT: String(port),
        NODE_ENV: 'production',
        NO_COLOR: '1',
      },
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    await waitForServer(origin, server);
    stopServer = () => stopProcess(server);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    stopServer = await startVercelOutput(project, origin, port, serverRuntimeErrors);
  }

  let browser;
  try {
    const routeUrl = `${origin}/dashboard/overview`;
    const checks = {
      directProductionRequest: false,
      hardRefreshRendersDashboard: false,
      kpiAndPanelSemanticsPresent: false,
      chartAndDataGeometryNonzero: false,
      clientNavigationUsesSameDocument: false,
      clientNavigationRendersDashboard: false,
      noVisibleRuntimeBoundary: false,
      overviewHasNoAxeViolations: false,
      browserConsoleClean: false,
    };
    const evidenceErrors = [];
    const runtimeErrors = [];
    const axeViolations = [];
    const ssrEvidence = {};
    const check = async (id, operation) => {
      try {
        checks[id] = Boolean(await operation());
      } catch (error) {
        evidenceErrors.push(`${id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    browser = await chromium.launch({ headless: true });
    await check('directProductionRequest', async () => {
      const startedAt = Date.now();
      const response = await fetch(routeUrl, {
        headers: {
          accept: 'text/html',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
        },
        redirect: 'manual',
      });
      const body = await response.text();
      const parserContext = await browser.newContext({ javaScriptEnabled: false });
      try {
        const parserPage = await parserContext.newPage();
        await parserPage.setContent(body, { waitUntil: 'domcontentloaded' });
        Object.assign(ssrEvidence, {
          status: response.status,
          durationMs: Date.now() - startedAt,
          bytes: Buffer.byteLength(body),
          dashboardCards: await parserPage.locator('[data-slot="card"]').count(),
          deferredBoundaries: await parserPage.locator('template[id^="B:"]').count(),
          sidebarInsets: await parserPage.locator('[data-slot="sidebar-inset"]').count(),
        });
      } finally {
        await parserContext.close();
      }
      return (
        response.status === 200 &&
        response.headers.get('content-type')?.includes('text/html') === true &&
        ssrEvidence.bytes > 1_000 &&
        ssrEvidence.dashboardCards === 8 &&
        ssrEvidence.deferredBoundaries === 0 &&
        ssrEvidence.sidebarInsets === 1
      );
    });

    const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
    await context.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (request.resourceType() === 'image' && url.origin !== origin) {
        await route.fulfill({ status: 200, contentType: 'image/png', body: EMPTY_PNG });
      } else {
        await route.continue();
      }
    });
    const page = await context.newPage();
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') {
        runtimeErrors.push(`${message.type()}: ${message.text()}`);
      }
    });
    page.on('pageerror', (error) => runtimeErrors.push(`page: ${error.message}`));

    let refreshEvidence = [];
    await check('hardRefreshRendersDashboard', async () => {
      const response = await page.goto(routeUrl, { waitUntil: 'networkidle' });
      refreshEvidence = await dashboardEvidence(page);
      return Boolean(response?.ok()) && completeDashboard(refreshEvidence);
    });
    checks.kpiAndPanelSemanticsPresent =
      refreshEvidence.length === 8 &&
      refreshEvidence.slice(0, 4).every((item) => item.title && item.description) &&
      refreshEvidence.slice(4).every((item) => item.title);
    checks.chartAndDataGeometryNonzero =
      refreshEvidence.slice(4).filter((item) => item.surfaces.length > 0).length >= 3 &&
      refreshEvidence.slice(4).some((item) => item.repeatedRows >= 5 || item.images >= 5);

    await check('noVisibleRuntimeBoundary', async () => {
      const visibleAlerts = await page.locator('[role="alert"]:visible').count();
      const documentBox = await page.locator('body').boundingBox();
      return visibleAlerts === 0 && Boolean(documentBox && documentBox.width > 0 && documentBox.height > 0);
    });

    await check('overviewHasNoAxeViolations', async () => {
      const report = await new AxeBuilder({ page })
        .include('[data-slot="sidebar-inset"]')
        .disableRules(['color-contrast', 'link-name', 'list', 'svg-img-alt'])
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      axeViolations.push(
        ...report.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.length })),
      );
      return report.violations.length === 0;
    });

    await check('clientNavigationUsesSameDocument', async () => {
      await page.goto(`${origin}/dashboard/chat`, { waitUntil: 'networkidle' });
      const marker = await page.evaluate(() => {
        globalThis.__evaluatorDocumentMarker = crypto.randomUUID();
        return globalThis.__evaluatorDocumentMarker;
      });
      const link = page.locator('a[href="/dashboard/overview"]').first();
      await link.click();
      await page.waitForURL('**/dashboard/overview');
      await page.locator('[data-slot="card"]').nth(7).waitFor({ state: 'visible', timeout: 20_000 });
      return (await page.evaluate(() => globalThis.__evaluatorDocumentMarker)) === marker;
    });

    await check('clientNavigationRendersDashboard', async () => completeDashboard(await dashboardEvidence(page)));
    await delay(500);
    checks.browserConsoleClean = runtimeErrors.length === 0 && serverRuntimeErrors.length === 0;

    const failures = Object.entries(checks)
      .filter(([, passed]) => !passed)
      .map(([id]) => id);
    return {
      passed: failures.length === 0,
      metrics: { governanceViolations: 0, accessibilityViolations: checks.overviewHasNoAxeViolations ? 0 : 1 },
      checks: Object.entries(checks).map(([id, passed]) => ({ id, passed })),
      failures,
      evidenceErrors,
      runtimeErrors,
      serverRuntimeErrors,
      axeViolations,
      ssrEvidence,
      geometry: refreshEvidence.map(({ width, height, surfaces, repeatedRows }) => ({ width, height, surfaces, repeatedRows })),
    };
  } finally {
    await browser?.close().catch(() => {});
    await stopServer?.();
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
