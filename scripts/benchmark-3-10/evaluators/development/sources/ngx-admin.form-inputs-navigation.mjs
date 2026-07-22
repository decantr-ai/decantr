#!/usr/bin/env node
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import vm from 'node:vm';

const CONTENT_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
]);

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

function contained(root, target) {
  const relation = relative(root, target);
  return relation === '' || (!relation.startsWith(`..${sep}`) && relation !== '..' && !isAbsolute(relation));
}

function resolveProject(workspace, projectPath) {
  const project = resolve(workspace, projectPath);
  if (!contained(workspace, project)) throw new Error('Project path escapes the workspace');
  return project;
}

function executeCommonJs(source, filename, typescript, requireModule) {
  const output = typescript.transpileModule(source, {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2017,
      experimentalDecorators: true,
    },
    fileName: filename,
    reportDiagnostics: true,
  });
  const errors = (output.diagnostics ?? []).filter(
    (diagnostic) => diagnostic.category === typescript.DiagnosticCategory.Error,
  );
  if (errors.length > 0) throw new Error(`TypeScript could not transpile ${filename}`);
  const module = { exports: {} };
  const wrapper = vm.runInNewContext(
    `(function (require, module, exports) { ${output.outputText}\n})`,
    {},
    { filename, timeout: 2_000 },
  );
  wrapper(requireModule, module, module.exports);
  return module.exports;
}

function stubExports() {
  const values = new Map();
  return new Proxy(
    {},
    {
      get(_target, property) {
        if (property === '__esModule') return true;
        if (!values.has(property)) {
          const Stub = class {};
          Object.defineProperty(Stub, '__evaluatorExportName', { value: String(property) });
          values.set(property, Stub);
        }
        return values.get(property);
      },
    },
  );
}

async function candidateEvidence(project) {
  const projectRequire = createRequire(join(project, 'package.json'));
  const typescript = projectRequire('typescript');
  const menuPath = join(project, 'src/app/pages/pages-menu.ts');
  const routePath = join(project, 'src/app/pages/extra-components/extra-components-routing.module.ts');
  const [menuSource, routeSource] = await Promise.all([
    readFile(menuPath, 'utf8'),
    readFile(routePath, 'utf8'),
  ]);

  const menuModule = executeCommonJs(menuSource, menuPath, typescript, (specifier) => {
    if (specifier === '@nebular/theme') return stubExports();
    throw new Error(`Menu export imports unsupported module ${specifier}`);
  });
  const menu = menuModule.MENU_ITEMS;
  if (!Array.isArray(menu)) throw new Error('MENU_ITEMS did not evaluate to an array');

  let capturedRoutes = null;
  const core = { NgModule: () => (target) => target };
  const router = {
    RouterModule: {
      forChild(routes) {
        capturedRoutes = routes;
        return { routes };
      },
    },
  };
  executeCommonJs(routeSource, routePath, typescript, (specifier) => {
    if (specifier === '@angular/core') return core;
    if (specifier === '@angular/router') return router;
    if (specifier.startsWith('.')) return stubExports();
    throw new Error(`Route module imports unsupported module ${specifier}`);
  });
  if (!Array.isArray(capturedRoutes)) throw new Error('Route module did not register child routes');
  const formRoute = capturedRoutes
    .flatMap((route) => (Array.isArray(route.children) ? route.children : []))
    .find((route) => route?.path === 'form-inputs');

  const sections = menu.filter((item) => item?.title === 'Extra Components');
  const children = sections.flatMap((section) => (Array.isArray(section.children) ? section.children : []));
  const destinations = children.filter(
    (item) => item?.title === 'Form Inputs' && item?.link === '/pages/extra-components/form-inputs',
  );
  return {
    menu,
    menuSectionCount: sections.length,
    menuDestinationCount: destinations.length,
    routePath: formRoute?.path ?? null,
    routeComponent: formRoute?.component?.__evaluatorExportName ?? formRoute?.component?.name ?? null,
  };
}

function fixtureHtml(menu, routePath) {
  const menuJson = JSON.stringify(menu).replaceAll('<', '\\u003c');
  const angularPath = (name) => `/node_modules/@angular/${name}/bundles/${name}.umd.js`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <base href="/">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Navigation evaluator</title>
    <style>
      body { margin: 0; font: 16px Arial, sans-serif; color: #20242c; }
      app-root { display: grid; grid-template-columns: 290px 1fr; min-height: 100vh; }
      aside { padding: 24px; border-right: 1px solid #d6d9df; background: #f7f8fa; }
      nav ul { margin: 8px 0 16px; padding-left: 18px; }
      nav li { margin: 6px 0; }
      nav a, nav button { color: #174f91; font: inherit; }
      nav button { border: 0; padding: 4px 0; background: transparent; cursor: pointer; font-weight: 700; }
      main { padding: 40px; }
    </style>
  </head>
  <body>
    <app-root>Loading Angular fixture...</app-root>
    <script src="/node_modules/core-js/client/shim.min.js"></script>
    <script src="/node_modules/zone.js/dist/zone.js"></script>
    <script src="/node_modules/rxjs/bundles/rxjs.umd.js"></script>
    <script src="${angularPath('core')}"></script>
    <script src="${angularPath('common')}"></script>
    <script src="${angularPath('compiler')}"></script>
    <script src="${angularPath('platform-browser')}"></script>
    <script src="${angularPath('platform-browser-dynamic')}"></script>
    <script src="${angularPath('router')}"></script>
    <script>
      const menu = ${menuJson};
      class StartPage {}
      ng.core.Component({ selector: 'start-page', template: '<h1>Dashboard</h1>' })(StartPage);
      class FormInputsPage {}
      ng.core.Component({ selector: 'form-inputs-page', template: '<h1>Form Inputs</h1><p data-destination>Existing route destination</p>' })(FormInputsPage);
      class AppRoot {
        constructor() { this.menu = menu; this.expanded = new Set(); }
        toggle(item) { this.expanded.has(item) ? this.expanded.delete(item) : this.expanded.add(item); }
        isExpanded(item) { return this.expanded.has(item); }
      }
      ng.core.Component({
        selector: 'app-root',
        template: \`
          <aside>
            <nav aria-label="Application sidebar">
              <section *ngFor="let section of menu" [attr.data-section]="section.title">
                <button *ngIf="section.children" type="button" (click)="toggle(section)" [attr.aria-expanded]="isExpanded(section)" [attr.data-section-title]="section.title">{{ section.title }}</button>
                <a *ngIf="section.link && !section.children" [routerLink]="section.link">{{ section.title }}</a>
                <ul *ngIf="section.children && isExpanded(section)">
                  <li *ngFor="let child of section.children"><a [routerLink]="child.link" [attr.data-child-link]="child.title">{{ child.title }}</a></li>
                </ul>
              </section>
            </nav>
          </aside>
          <main><router-outlet></router-outlet></main>
        \`,
      })(AppRoot);
      class FixtureModule {}
      ng.core.NgModule({
        declarations: [AppRoot, StartPage, FormInputsPage],
        imports: [
          ng.platformBrowser.BrowserModule,
          ng.router.RouterModule.forRoot([
            { path: 'pages/dashboard', component: StartPage },
            { path: 'pages/extra-components/${routePath}', component: FormInputsPage },
            { path: '**', redirectTo: 'pages/dashboard' },
          ], { useHash: true }),
        ],
        bootstrap: [AppRoot],
      })(FixtureModule);
      ng.platformBrowserDynamic.platformBrowserDynamic().bootstrapModule(FixtureModule).catch((error) => console.error(error));
    </script>
  </body>
</html>`;
}

function extension(pathname) {
  const index = pathname.lastIndexOf('.');
  return index < 0 ? '' : pathname.slice(index).toLowerCase();
}

async function startFixtureServer(project, html) {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://127.0.0.1').pathname);
      if (pathname === '/' || pathname === '/fixture.html') {
        response.writeHead(200, { 'cache-control': 'no-store', 'content-type': 'text/html; charset=utf-8' });
        response.end(html);
        return;
      }
      const file = resolve(project, `.${pathname}`);
      if (!contained(project, file) || !pathname.startsWith('/node_modules/')) {
        response.writeHead(404).end('Not found');
        return;
      }
      if (!(await stat(file)).isFile()) {
        response.writeHead(404).end('Not found');
        return;
      }
      response.writeHead(200, {
        'cache-control': 'no-store',
        'content-type': CONTENT_TYPES.get(extension(file)) ?? 'application/octet-stream',
      });
      response.end(await readFile(file));
    } catch (error) {
      response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      response.end(error instanceof Error ? error.message : String(error));
    }
  });
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Could not start fixture server');
  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolveClose) => server.close(() => resolveClose())),
  };
}

async function evaluate() {
  const options = parseArgs(process.argv.slice(2));
  const project = resolveProject(options.workspace, options.projectPath);
  await stat(join(options.evaluatorRuntime, 'package.json'));
  const evidence = await candidateEvidence(project);
  if (!evidence.routePath) throw new Error('Existing Form Inputs route was not found');
  const runtimeRequire = createRequire(join(options.evaluatorRuntime, 'package.json'));
  const { chromium } = runtimeRequire('playwright');
  const fixtureServer = await startFixtureServer(project, fixtureHtml(evidence.menu, evidence.routePath));
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1200, height: 800 } });
    const externalRequests = [];
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.origin === fixtureServer.origin) await route.continue();
      else {
        externalRequests.push(route.request().url());
        await route.abort('blockedbyclient');
      }
    });
    const page = await context.newPage();
    page.setDefaultTimeout(5_000);
    const runtimeErrors = [];
    page.on('pageerror', (error) => runtimeErrors.push(`page: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
    });
    await page.goto(`${fixtureServer.origin}/fixture.html#/pages/dashboard`, { waitUntil: 'domcontentloaded' });
    try {
      await page.getByRole('heading', { name: 'Dashboard', exact: true }).waitFor({ timeout: 15_000 });
    } catch (error) {
      throw new Error(
        `Angular fixture did not boot: ${error instanceof Error ? error.message : String(error)}; ${runtimeErrors.join(' | ')}`,
      );
    }

    const checks = {
      extraComponentsSectionIsUnique: evidence.menuSectionCount === 1,
      menuDestinationIsUnique: evidence.menuDestinationCount === 1,
      existingRouteBindingPreserved:
        evidence.routePath === 'form-inputs' && evidence.routeComponent === 'NebularFormInputsComponent',
    };
    const evidenceErrors = [];
    const check = async (id, operation) => {
      try {
        checks[id] = Boolean(await operation());
      } catch (error) {
        checks[id] = false;
        evidenceErrors.push(`${id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    const sectionButton = page.getByRole('button', { name: 'Extra Components', exact: true });
    await sectionButton.click();
    const section = page.locator('[data-section="Extra Components"]');
    const destination = section.getByRole('link', { name: 'Form Inputs', exact: true });
    await check('renderedDestinationIsDiscoverable', async () => {
      return (await destination.count()) === 1 && (await destination.isVisible());
    });
    await check('renderedLinkUsesExistingRoute', async () => {
      const href = await destination.getAttribute('href');
      return href !== null && new URL(href, fixtureServer.origin).hash === '#/pages/extra-components/form-inputs';
    });
    await check('destinationIsKeyboardAccessible', async () => {
      await destination.focus();
      return await destination.evaluate((element) => element === document.activeElement && element.tabIndex >= 0);
    });
    await check('sidebarClickNavigatesAndRendersDestination', async () => {
      await destination.click();
      await page.waitForURL((url) => url.hash === '#/pages/extra-components/form-inputs');
      const heading = page.getByRole('heading', { name: 'Form Inputs', exact: true });
      return (await heading.isVisible()) && (await page.locator('[data-destination]').isVisible());
    });

    await page.goto(`${fixtureServer.origin}/fixture.html#/pages/dashboard`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Extra Components', exact: true }).click();
    const keyboardLink = page
      .locator('[data-section="Extra Components"]')
      .getByRole('link', { name: 'Form Inputs', exact: true });
    await check('keyboardActivationNavigatesAndRendersDestination', async () => {
      if ((await keyboardLink.count()) !== 1) return false;
      await keyboardLink.focus();
      await keyboardLink.press('Enter');
      await page.waitForURL((url) => url.hash === '#/pages/extra-components/form-inputs');
      return page.getByRole('heading', { name: 'Form Inputs', exact: true }).isVisible();
    });
    checks.noExternalDependency = externalRequests.length === 0;
    checks.browserConsoleClean = runtimeErrors.length === 0;

    const failures = Object.entries(checks)
      .filter(([, passed]) => !passed)
      .map(([id]) => id);
    return {
      passed: failures.length === 0,
      metrics: {
        governanceViolations: 0,
        accessibilityViolations:
          checks.destinationIsKeyboardAccessible && checks.keyboardActivationNavigatesAndRendersDestination ? 0 : 1,
        behaviorChecksPassed: Object.keys(checks).length - failures.length,
        behaviorChecksTotal: Object.keys(checks).length,
      },
      checks: Object.entries(checks).map(([id, passed]) => ({ id, passed })),
      failures,
      evidenceErrors,
      runtimeErrors,
      externalRequests,
      evidence: {
        menuSectionCount: evidence.menuSectionCount,
        menuDestinationCount: evidence.menuDestinationCount,
        routePath: evidence.routePath,
        routeComponent: evidence.routeComponent,
      },
    };
  } finally {
    await browser?.close().catch(() => {});
    await fixtureServer.close();
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
