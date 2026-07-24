import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { probePublishedSite, resolveGitHubScanInput, scanProject } from '../src/index.js';

describe('scanProject', () => {
  let projectRoot: string;

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), 'decantr-scan-'));
  });

  afterEach(() => {
    rmSync(projectRoot, { recursive: true, force: true });
  });

  it('scans a React/Vite GitHub Pages app with HashRouter without writing files', async () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify(
        {
          name: 'pages-app',
          homepage: 'https://example.github.io/pages-app/',
          scripts: { deploy: 'gh-pages -d dist' },
          dependencies: {
            '@vitejs/plugin-react': '^5.0.0',
            'gh-pages': '^6.0.0',
            react: '^19.0.0',
            'react-dom': '^19.0.0',
            'react-router-dom': '^7.0.0',
          },
        },
        null,
        2,
      ),
    );
    writeFileSync(join(projectRoot, 'vite.config.ts'), "export default { base: '/pages-app/' };\n");
    mkdirSync(join(projectRoot, 'src', 'components'), { recursive: true });
    mkdirSync(join(projectRoot, 'src', 'styles'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'App.tsx'),
      [
        'import { HashRouter, Route, Routes } from "react-router-dom";',
        'export function App() {',
        '  return <HashRouter><Routes><Route path="/" element={<main />} /><Route path="/settings" element={<main />} /></Routes></HashRouter>;',
        '}',
        '',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'src', 'components', 'HeroPanel.tsx'),
      'export function HeroPanel() { return <section />; }\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'styles', 'theme.css'),
      ':root { --surface: #fff; --accent: #2563eb; } .dark { color-scheme: dark; }\n',
    );

    const report = await scanProject(projectRoot, {
      input: { kind: 'local', value: projectRoot },
      publishedSiteUrl: 'https://example.github.io/pages-app/',
    });

    expect(report.applicability.status).toBe('partial_fit');
    expect(report.discovery.uiSurfaces.status).toBe('limited');
    expect(report.project.framework).toBe('react');
    expect(report.routes.strategy).toBe('react-router');
    expect(report.routes.items.map((route) => route.path)).toEqual(
      expect.arrayContaining(['/', '/settings']),
    );
    expect(report.staticHosting.githubPagesLikely).toBe(true);
    expect(report.staticHosting.hashRouting).toBe(true);
    expect(report.styling.cssVariableCount).toBeGreaterThanOrEqual(2);
    expect(report.recommendedCommands).toContain('npx @decantr/cli adopt --yes');
    expect(report.recommendedCommands).toContain('npx @decantr/cli scan --json');
    expect(JSON.stringify(report)).not.toContain(projectRoot);
  });

  it('scans a Next app route map', async () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { next: '^16.0.0', react: '^19.0.0' } }, null, 2),
    );
    mkdirSync(join(projectRoot, 'app', 'dashboard'), { recursive: true });
    writeFileSync(join(projectRoot, 'next.config.ts'), 'export default {};\n');
    writeFileSync(
      join(projectRoot, 'app', 'page.tsx'),
      'export default function Page() { return <main />; }\n',
    );
    writeFileSync(
      join(projectRoot, 'app', 'dashboard', 'page.tsx'),
      'export default function Page() { return <main />; }\n',
    );

    const report = await scanProject(projectRoot);

    expect(report.project.framework).toBe('nextjs');
    expect(report.routes.strategy).toBe('app-router');
    expect(report.routes.items.map((route) => route.path)).toEqual(
      expect.arrayContaining(['/', '/dashboard']),
    );
  });

  it('scans hand-rolled pathname branch routes before falling back to static HTML', async () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify(
        {
          dependencies: {
            react: '^19.0.0',
            'react-dom': '^19.0.0',
          },
        },
        null,
        2,
      ),
    );
    writeFileSync(join(projectRoot, 'index.html'), '<!doctype html><div id="root"></div>\n');
    mkdirSync(join(projectRoot, 'src'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'App.tsx'),
      [
        'export function App() {',
        '  const path = window.location.pathname;',
        '  return <main>',
        '    <a href="/tickets">Tickets</a>',
        '    <a href="/customers">Customers</a>',
        '    {path === "/customers" ? <Customers /> : <Tickets />}',
        '  </main>;',
        '}',
        '',
      ].join('\n'),
    );

    const report = await scanProject(projectRoot);

    expect(report.routes.strategy).toBe('react-router');
    expect(report.routes.items.map((route) => route.path)).toEqual(
      expect.arrayContaining(['/tickets', '/customers']),
    );
  });

  it('scans declarative TypeScript route specs before falling back to static HTML', async () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify(
        {
          dependencies: {
            '@wasp.sh/spec': '^0.25.0',
            react: '^19.0.0',
            'react-dom': '^19.0.0',
          },
        },
        null,
        2,
      ),
    );
    writeFileSync(join(projectRoot, 'index.html'), '<!doctype html><div id="root"></div>\n');
    writeFileSync(
      join(projectRoot, 'main.wasp.ts'),
      [
        'import { app, page, route } from "@wasp.sh/spec";',
        'import { LandingPage } from "./src/landing-page/LandingPage" with { type: "ref" };',
        'export default app({',
        '  name: "OpenSaaS",',
        '  spec: [',
        '    route("LandingPageRoute", "/", page(LandingPage), { prerender: true }),',
        '    route("NotFoundRoute", "*", page(LandingPage)),',
        '  ],',
        '});',
        '',
      ].join('\n'),
    );
    mkdirSync(join(projectRoot, 'src', 'auth'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'auth', 'auth.wasp.ts'),
      [
        'import { page, route, type Spec } from "@wasp.sh/spec";',
        'import { LoginPage } from "./LoginPage" with { type: "ref" };',
        'import { SignupPage } from "./SignupPage" with { type: "ref" };',
        'export const authSpec: Spec = [',
        '  route("LoginRoute", "/login", page(LoginPage)),',
        '  route("SignupRoute", "/signup", page(SignupPage)),',
        '];',
        '',
      ].join('\n'),
    );

    const report = await scanProject(projectRoot);

    expect(report.routes.strategy).toBe('react-router');
    expect(report.routes.signals.map((route) => route.path)).toEqual(
      expect.arrayContaining(['/', '/login', '/signup']),
    );
    expect(report.routes.items).toEqual([]);
    expect(report.routes.signals.map((route) => route.path)).not.toContain('*');
    expect(report.routes.authority).toBe('inferred');
    expect(report.routes.completeness).toBe('partial');
  });

  it('normalizes React Router wrapper paths from mature brownfield apps', async () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify(
        {
          dependencies: {
            react: '^19.0.0',
            'react-dom': '^19.0.0',
            'react-router-dom': '^5.3.0',
          },
        },
        null,
        2,
      ),
    );
    mkdirSync(join(projectRoot, 'src'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'PrivateRoutesContainer.tsx'),
      [
        'import { Switch } from "react-router";',
        'import PrivateRoute from "../components/PrivateRoute";',
        'export function PrivateRoutesContainer() {',
        '  return <Switch>',
        '    <PrivateRoute exact path={"/(public|contacts|personal)?"}><Transactions /></PrivateRoute>',
        '    <PrivateRoute exact path="/user/settings"><Settings /></PrivateRoute>',
        '    <PrivateRoute path="/bankaccounts*"><BankAccounts /></PrivateRoute>',
        '    <Route path="/*"><Fallback /></Route>',
        '  </Switch>;',
        '}',
        '',
      ].join('\n'),
    );

    const report = await scanProject(projectRoot);
    const paths = report.routes.items.map((route) => route.path);

    expect(report.routes.strategy).toBe('react-router');
    expect(paths).toEqual(
      expect.arrayContaining([
        '/',
        '/public',
        '/contacts',
        '/personal',
        '/user/settings',
        '/bankaccounts',
      ]),
    );
    expect(paths).not.toContain('/*');
    expect(paths).not.toContain('/(public|contacts|personal)');
  });

  it('does not expose Next Pages Router internals as taskable routes', async () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { next: '^16.0.0', react: '^19.0.0' } }, null, 2),
    );
    const pagesDir = join(projectRoot, 'pages');
    mkdirSync(pagesDir, { recursive: true });
    for (const file of ['index.tsx', '_app.tsx', '_document.tsx', '_error.tsx']) {
      writeFileSync(join(pagesDir, file), 'export default function Page() { return null; }');
    }

    const report = await scanProject(projectRoot);

    expect(report.routes.strategy).toBe('pages-router');
    expect(report.routes.items.map((route) => route.path)).toEqual(['/']);
  });

  it('reports SvelteKit page routes without component/module artifacts', async () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify(
        {
          dependencies: {
            '@sveltejs/kit': '^2.0.0',
            svelte: '^5.0.0',
          },
        },
        null,
        2,
      ),
    );
    writeFileSync(join(projectRoot, 'svelte.config.js'), 'export default {};\n');
    mkdirSync(join(projectRoot, 'src', 'routes', 'login'), { recursive: true });
    mkdirSync(join(projectRoot, 'src', 'routes', 'article', '[slug]'), { recursive: true });
    writeFileSync(join(projectRoot, 'src', 'routes', '+layout.svelte'), '<slot />\n');
    writeFileSync(join(projectRoot, 'src', 'routes', '+page.svelte'), '<main>Home</main>\n');
    writeFileSync(
      join(projectRoot, 'src', 'routes', 'login', '+page.svelte'),
      '<main>Login</main>\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'routes', 'article', '[slug]', '+page.svelte'),
      '<main>Article</main>\n',
    );
    writeFileSync(join(projectRoot, 'src', 'routes', 'Nav.svelte'), '<nav />\n');
    writeFileSync(
      join(projectRoot, 'src', 'routes', 'article', '[slug]', 'Comment.svelte'),
      '<p />\n',
    );

    const report = await scanProject(projectRoot);
    const paths = report.routes.items.map((route) => route.path);

    expect(report.project.framework).toBe('svelte');
    expect(report.routes.strategy).toBe('sveltekit-router');
    expect(paths).toEqual(expect.arrayContaining(['/', '/login', '/article/:slug']));
    expect(paths).not.toEqual(
      expect.arrayContaining(['/+layout', '/Nav', '/article/:slug/Comment']),
    );
  });

  it('reports Angular router arrays during read-only scan', async () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify(
        {
          dependencies: {
            '@angular/core': '^21.0.0',
            '@angular/router': '^21.0.0',
          },
        },
        null,
        2,
      ),
    );
    mkdirSync(join(projectRoot, 'src', 'app'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'angular.json'),
      JSON.stringify({
        version: 1,
        projects: {
          frontend: {
            root: '',
            sourceRoot: 'src',
            architect: {
              build: {
                options: {
                  browser: 'src/main.ts',
                  styles: ['src/styles.scss'],
                  tsConfig: 'tsconfig.json',
                },
              },
            },
          },
        },
      }),
    );
    writeFileSync(join(projectRoot, 'tsconfig.json'), JSON.stringify({ compilerOptions: {} }));
    writeFileSync(
      join(projectRoot, 'src', 'main.ts'),
      [
        'import { bootstrapApplication } from "@angular/platform-browser";',
        'import { appConfig } from "./app/app.config";',
        'bootstrapApplication(class App {}, appConfig);',
        '',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'src', 'app', 'app.config.ts'),
      [
        'import { provideRouter } from "@angular/router";',
        'import { routes } from "./app.routes";',
        'export const appConfig = { providers: [provideRouter(routes)] };',
        '',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'src', 'app', 'app.routes.ts'),
      [
        'import { Routes } from "@angular/router";',
        'export const routes: Routes = [',
        '  { path: "", loadComponent: () => import("./home") },',
        '  { path: "login", loadComponent: () => import("./login") },',
        '  { path: "article/:slug", loadComponent: () => import("./article") },',
        '  { path: "**", redirectTo: "" },',
        '];',
        '',
      ].join('\n'),
    );
    for (const name of ['home', 'login', 'article']) {
      writeFileSync(
        join(projectRoot, 'src', 'app', `${name}.ts`),
        [
          'import { Component } from "@angular/core";',
          `@Component({ templateUrl: "./${name}.html" })`,
          `export class ${name[0]?.toUpperCase()}${name.slice(1)}Component {}`,
          '',
        ].join('\n'),
      );
      writeFileSync(join(projectRoot, 'src', 'app', `${name}.html`), `<main>${name}</main>\n`);
    }
    writeFileSync(join(projectRoot, 'src', 'styles.scss'), ':root { --brand: #123456; }\n');
    writeFileSync(join(projectRoot, 'src', 'index.html'), '<!doctype html><app-root></app-root>\n');

    const report = await scanProject(projectRoot);
    const paths = report.routes.items.map((route) => route.path);

    expect(report.project.framework).toBe('angular');
    expect(report.routes.strategy).toBe('angular-router');
    expect(report.routes.authority).toBe('proven');
    expect(report.routes.completeness).toBe('complete');
    expect(report.routes.confidence).toBe('high');
    expect(paths).toEqual(expect.arrayContaining(['/', '/login', '/article/:slug']));
    expect(paths).not.toContain('/**');
    expect(report.components.items.map((component) => component.name)).toEqual(
      expect.arrayContaining(['HomeComponent', 'LoginComponent', 'ArticleComponent']),
    );
  });

  it('resolves lazy Angular NgModules through their imported routing modules', async () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({
        dependencies: {
          '@angular/core': '^21.0.0',
          '@angular/router': '^21.0.0',
        },
      }),
    );
    mkdirSync(join(projectRoot, 'src', 'app', 'feature'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'angular.json'),
      JSON.stringify({
        version: 1,
        projects: {
          frontend: {
            root: '',
            sourceRoot: 'src',
            architect: {
              build: {
                options: {
                  browser: 'src/main.ts',
                  tsConfig: 'tsconfig.json',
                },
              },
            },
          },
        },
      }),
    );
    writeFileSync(join(projectRoot, 'tsconfig.json'), JSON.stringify({ compilerOptions: {} }));
    writeFileSync(
      join(projectRoot, 'src', 'main.ts'),
      [
        'import { bootstrapApplication } from "@angular/platform-browser";',
        'import { appConfig } from "./app/app.config";',
        'bootstrapApplication(class App {}, appConfig);',
        '',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'src', 'app', 'app.config.ts'),
      [
        'import { provideRouter } from "@angular/router";',
        'import { routes } from "./app.routes";',
        'export const appConfig = { providers: [provideRouter(routes)] };',
        '',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'src', 'app', 'app.routes.ts'),
      [
        'import { Routes } from "@angular/router";',
        'export const routes: Routes = [',
        '  { path: "feature", loadChildren: () => import("./feature/feature.module").then((m) => m.FeatureModule) },',
        '];',
        '',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'src', 'app', 'feature', 'feature.module.ts'),
      [
        'import { NgModule } from "@angular/core";',
        'import { FeatureRoutingModule } from "./feature-routing.module";',
        '@NgModule({ imports: [FeatureRoutingModule] })',
        'export class FeatureModule {}',
        '',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'src', 'app', 'feature', 'feature-routing.module.ts'),
      [
        'import { NgModule } from "@angular/core";',
        'import { RouterModule, Routes } from "@angular/router";',
        'import { ChildComponent } from "./child.component";',
        'const routes: Routes = [{ path: "child", component: ChildComponent }];',
        '@NgModule({ imports: [RouterModule.forChild(routes)] })',
        'export class FeatureRoutingModule {}',
        '',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'src', 'app', 'feature', 'child.component.ts'),
      [
        'import { Component } from "@angular/core";',
        '@Component({ template: "<main>Child</main>" })',
        'export class ChildComponent {}',
        '',
      ].join('\n'),
    );

    const report = await scanProject(projectRoot);

    expect(report.routes.authority).toBe('proven');
    expect(report.routes.completeness).toBe('complete');
    expect(report.routes.items).toContainEqual(
      expect.objectContaining({
        path: '/feature/child',
        file: 'src/app/feature/child.component.ts',
      }),
    );
    expect(report.routes.authorityFiles).toContain('src/app/feature/feature-routing.module.ts');
    expect(report.discovery?.limitations.join('\n')).not.toContain(
      'Lazy Angular route array could not be resolved',
    );
  });

  it('fails closed when Angular route arrays are not reachable from the selected bootstrap', async () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({
        name: 'frontend',
        dependencies: {
          '@angular/core': '^21.0.0',
          '@angular/router': '^21.0.0',
        },
      }),
    );
    mkdirSync(join(projectRoot, 'src', 'app'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'angular.json'),
      JSON.stringify({
        version: 1,
        projects: {
          app1: {
            root: '',
            sourceRoot: 'src',
            architect: { build: { options: { browser: 'src/main.ts' } } },
          },
        },
      }),
    );
    writeFileSync(
      join(projectRoot, 'src', 'main.ts'),
      'import { bootstrapApplication } from "@angular/platform-browser"; bootstrapApplication(class App {});\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'app', 'routes.ts'),
      [
        'import { Routes } from "@angular/router";',
        'export const routes: Routes = [{ path: "real-but-unrooted", component: Page }];',
        '',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'src', 'app', 'settings-menu.vitest.ts'),
      [
        'import { Routes } from "@angular/router";',
        'export const fixtureRoutes: Routes = [',
        '  { path: "admin", component: Fixture },',
        '  { path: "assign", component: Fixture },',
        '  { path: "tool-configuration", component: Fixture },',
        '];',
        '',
      ].join('\n'),
    );

    const report = await scanProject(projectRoot);

    expect(report.routes.authority).toBe('inferred');
    expect(report.routes.completeness).toBe('unknown');
    expect(report.routes.taskableRouteCount).toBe(0);
    expect(report.routes.excludedSourceCount).toBeGreaterThan(0);
    expect(report.routes.signals.map((signal) => signal.path)).toContain('/real-but-unrooted');
    expect(report.routes.signals.map((signal) => signal.path)).not.toEqual(
      expect.arrayContaining(['/admin', '/assign', '/tool-configuration']),
    );
    expect(report.applicability.status).toBe('partial_fit');
    expect(report.confidence.score).toBeLessThanOrEqual(44);
    expect(report.recommendedCommands).not.toContain('npx @decantr/cli adopt --yes');
    expect(report.findings.some((finding) => finding.id === 'route-authority-not-proven')).toBe(
      true,
    );
  });

  it('marks bootstrap-reachable Angular routes partial when their implementation cannot resolve', async () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({
        name: 'angular-unresolved-component',
        dependencies: {
          '@angular/core': '^21.0.0',
          '@angular/router': '^21.0.0',
        },
      }),
    );
    mkdirSync(join(projectRoot, 'src', 'app'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'angular.json'),
      JSON.stringify({
        version: 1,
        projects: {
          app: {
            root: '',
            sourceRoot: 'src',
            architect: { build: { options: { browser: 'src/main.ts' } } },
          },
        },
      }),
    );
    writeFileSync(
      join(projectRoot, 'src', 'main.ts'),
      [
        'import { bootstrapApplication } from "@angular/platform-browser";',
        'import { appConfig } from "./app/app.config";',
        'bootstrapApplication(class App {}, appConfig);',
        '',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'src', 'app', 'app.config.ts'),
      [
        'import { provideRouter } from "@angular/router";',
        'import { routes } from "./app.routes";',
        'export const appConfig = { providers: [provideRouter(routes)] };',
        '',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'src', 'app', 'app.routes.ts'),
      [
        'import { Routes } from "@angular/router";',
        'export const routes: Routes = [',
        '  { path: "missing", loadComponent: () => import("./missing.component") },',
        '];',
        '',
      ].join('\n'),
    );

    const report = await scanProject(projectRoot);

    expect(report.routes.authority).toBe('proven');
    expect(report.routes.completeness).toBe('partial');
    expect(report.routes.taskableRouteCount).toBe(0);
    expect(report.routes.signals).toContainEqual(
      expect.objectContaining({ path: '/missing', taskable: false, confidence: 'medium' }),
    );
    expect(report.routes.authorityFiles).toEqual(
      expect.arrayContaining(['src/main.ts', 'src/app/app.config.ts', 'src/app/app.routes.ts']),
    );
    expect(report.discovery?.limitations.join('\n')).toContain(
      'Angular lazy component could not be resolved',
    );
    expect(report.confidence.score).toBeLessThanOrEqual(74);
    expect(report.recommendedCommands).not.toContain('npx @decantr/cli adopt --yes');
  });

  it('resolves a 100-route Angular table and preserves PrimeNG/SCSS style authority', async () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({
        name: 'frontend',
        dependencies: {
          '@angular/core': '^21.0.0',
          '@angular/router': '^21.0.0',
          primeng: '^21.0.0',
          tailwindcss: '^4.1.0',
        },
      }),
    );
    mkdirSync(join(projectRoot, 'src', 'app'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'angular.json'),
      JSON.stringify({
        version: 1,
        projects: {
          app1: {
            root: '',
            sourceRoot: 'src',
            architect: {
              build: {
                options: {
                  browser: 'src/main.ts',
                  styles: ['src/styles.scss'],
                  tsConfig: 'tsconfig.json',
                },
              },
            },
          },
        },
      }),
    );
    writeFileSync(join(projectRoot, 'tsconfig.json'), JSON.stringify({ compilerOptions: {} }));
    writeFileSync(
      join(projectRoot, 'src', 'main.ts'),
      [
        'import { bootstrapApplication } from "@angular/platform-browser";',
        'import { appConfig } from "./app/app.config";',
        'bootstrapApplication(class App {}, appConfig);',
        '',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'src', 'app', 'app.config.ts'),
      [
        'import { provideRouter } from "@angular/router";',
        'import { providePrimeNG } from "primeng/config";',
        'import { routes } from "./routes";',
        'export const appConfig = { providers: [provideRouter(routes), providePrimeNG({})] };',
        '',
      ].join('\n'),
    );
    const routeRows = Array.from(
      { length: 100 },
      (_, index) => `  { path: "route-${index}", component: PageComponent },`,
    );
    writeFileSync(
      join(projectRoot, 'src', 'app', 'routes.ts'),
      [
        'import { Routes } from "@angular/router";',
        'import { PageComponent } from "./page.component";',
        'export const routes: Routes = [',
        ...routeRows,
        '];',
        ...Array.from({ length: 1400 }, (_, index) => `// route policy line ${index}`),
        '',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'src', 'app', 'page.component.ts'),
      [
        'import { Component } from "@angular/core";',
        '@Component({ selector: "app-page", templateUrl: "./page.component.html" })',
        'export class PageComponent {}',
        '',
      ].join('\n'),
    );
    writeFileSync(join(projectRoot, 'src', 'app', 'page.component.html'), '<main>Page</main>\n');
    writeFileSync(
      join(projectRoot, 'src', 'app', 'settings-menu.vitest.ts'),
      'export const navigation = [{ path: "admin" }, { path: "assign" }];\n',
    );
    writeFileSync(join(projectRoot, 'src', 'styles.scss'), '$brand: #123456;\n');

    const report = await scanProject(projectRoot);

    expect(report.project.packageName).toBe('frontend');
    expect(report.project.evidence).toContain('Angular project "app1" selected from angular.json');
    expect(report.project.hasTailwind).toBe(false);
    expect(report.routes.taskableRouteCount).toBe(100);
    expect(report.routes.items).toHaveLength(100);
    expect(report.routes.items.map((route) => route.path)).toEqual(
      expect.arrayContaining(['/route-0', '/route-99']),
    );
    expect(report.routes.items.map((route) => route.path)).not.toEqual(
      expect.arrayContaining(['/admin', '/assign']),
    );
    expect(report.routes.items.every((route) => route.file === 'src/app/page.component.ts')).toBe(
      true,
    );
    expect(report.routes.authority).toBe('proven');
    expect(report.routes.completeness).toBe('complete');
    expect(report.styling.approach).toBe('primeng-scss');
    expect(report.styling.confidence).toBe('high');
    expect(report.styling.limitations).toContain(
      'Tailwind is installed but no selected-app config, PostCSS plugin, or CSS directive proves it is active style authority.',
    );
    expect(report.components.items).toContainEqual({
      name: 'PageComponent',
      file: 'src/app/page.component.ts',
      kind: 'angular-component',
      confidence: 'high',
    });
    expect(report.applicability.status).toBe('strong_fit');
  });

  it('does not treat Sass @theme import paths as Tailwind directives', async () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({
        name: 'nebular-app',
        dependencies: {
          '@angular/core': '^21.0.0',
          '@nebular/theme': '^16.0.0',
          bootstrap: '^5.3.0',
        },
      }),
    );
    mkdirSync(join(projectRoot, 'src', 'app', '@theme', 'styles'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'angular.json'),
      JSON.stringify({
        version: 1,
        projects: {
          app: {
            root: '',
            sourceRoot: 'src',
            architect: {
              build: {
                options: {
                  browser: 'src/main.ts',
                  styles: [
                    'node_modules/bootstrap/dist/css/bootstrap.css',
                    'src/app/@theme/styles/styles.scss',
                  ],
                },
              },
            },
          },
        },
      }),
    );
    writeFileSync(join(projectRoot, 'src', 'main.ts'), 'export const app = true;\n');
    writeFileSync(
      join(projectRoot, 'src', 'app', '@theme', 'styles', 'styles.scss'),
      "@import '@nebular/theme/styles/globals';\n@import '../@theme/styles/themes';\n",
    );

    const report = await scanProject(projectRoot);

    expect(report.project.hasTailwind).toBe(false);
    expect(report.styling.approach).toBe('nebular-scss');
    expect(report.styling.evidence).not.toEqual(
      expect.arrayContaining([expect.stringContaining('Tailwind directive')]),
    );
  });

  it('handles static HTML projects', async () => {
    writeFileSync(
      join(projectRoot, 'index.html'),
      '<!doctype html><title>Portfolio</title><main>Hello</main>\n',
    );
    writeFileSync(join(projectRoot, 'styles.css'), ':root { --ink: #111; }\n');

    const report = await scanProject(projectRoot);

    expect(report.applicability.status).toBe('partial_fit');
    expect(report.discovery.uiSurfaces.status).toBe('limited');
    expect(report.project.framework).toBe('html');
    expect(report.routes.strategy).toBe('static-html');
    expect(report.routes.count).toBe(1);
  });

  it('handles package-managed static HTML entrypoints under src', async () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ private: true, scripts: { build: 'webpack' } }, null, 2),
    );
    mkdirSync(join(projectRoot, 'src'), { recursive: true });
    writeFileSync(join(projectRoot, 'src', 'index.html'), '<!doctype html><main>Todo</main>');

    const report = await scanProject(projectRoot);

    expect(report.applicability.status).toBe('partial_fit');
    expect(report.discovery.uiSurfaces.status).toBe('blocked');
    expect(report.project.framework).toBe('html');
    expect(report.project.primaryLanguage).toBe('html');
    expect(report.routes.strategy).toBe('static-html');
    expect(report.routes.items).toContainEqual({
      path: '/',
      file: 'src/index.html',
      hasLayout: false,
    });
  });

  it('does not promote nested static demo pages to production routes', async () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ private: true, name: 'jquery-ui-like-demos' }, null, 2),
    );
    mkdirSync(join(projectRoot, 'demos', 'accordion'), { recursive: true });
    mkdirSync(join(projectRoot, 'demos', 'dialog'), { recursive: true });
    writeFileSync(join(projectRoot, 'demos', 'index.html'), '<!doctype html><main>Demos</main>');
    writeFileSync(
      join(projectRoot, 'demos', 'accordion', 'default.html'),
      '<!doctype html><main>Accordion</main>',
    );
    writeFileSync(
      join(projectRoot, 'demos', 'dialog', 'default.html'),
      '<!doctype html><main>Dialog</main>',
    );

    const report = await scanProject(projectRoot);
    const paths = report.routes.items.map((route) => route.path);

    expect(report.applicability.status).toBe('not_applicable');
    expect(report.discovery.uiSurfaces.status).toBe('unsupported');
    expect(report.project.framework).toBe('unknown');
    expect(report.routes.strategy).toBe('none');
    expect(paths).toEqual([]);
  });

  it('returns not_applicable for Python backend repositories', async () => {
    writeFileSync(join(projectRoot, 'pyproject.toml'), '[project]\nname = "api"\n');
    writeFileSync(join(projectRoot, 'main.py'), 'print("hello")\n');

    const report = await scanProject(projectRoot);

    expect(report.applicability.status).toBe('not_applicable');
    expect(report.project.primaryLanguage).toBe('python');
    expect(report.findings.some((finding) => finding.id === 'not-brownfield-ui-target')).toBe(true);
  });

  it('degrades gracefully when package.json is invalid', async () => {
    writeFileSync(join(projectRoot, 'package.json'), '{ nope }\n');
    writeFileSync(join(projectRoot, 'index.html'), '<!doctype html><title>Fallback</title>\n');

    const report = await scanProject(projectRoot);

    expect(report.project.framework).toBe('html');
    expect(report.findings.some((finding) => finding.id === 'package-manifest-invalid')).toBe(true);
  });

  it('does not treat a homepage query string as GitHub Pages hosting evidence', async () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify(
        {
          homepage: 'https://example.com/launch?next=https://acme.github.io/site/',
          dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' },
        },
        null,
        2,
      ),
    );
    writeFileSync(join(projectRoot, 'index.html'), '<!doctype html><div id="root"></div>\n');

    const report = await scanProject(projectRoot);

    expect(report.staticHosting.githubPagesLikely).toBe(false);
    expect(report.staticHosting.basePath).toBeNull();
  });

  it('scans the selected React app in a mixed Angular/React monorepo without sibling contamination', async () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ private: true, packageManager: 'pnpm@10.33.0' }),
    );
    writeFileSync(join(projectRoot, 'pnpm-lock.yaml'), 'lockfileVersion: 9.0\n');
    writeFileSync(join(projectRoot, 'AGENTS.md'), '# Workspace rules\n');
    mkdirSync(join(projectRoot, 'apps', 'admin-angular', 'src', 'app'), { recursive: true });
    mkdirSync(join(projectRoot, 'apps', 'react-console', 'src', 'routes'), { recursive: true });
    mkdirSync(join(projectRoot, 'apps', 'react-console', 'src', 'features', 'billing'), {
      recursive: true,
    });
    mkdirSync(join(projectRoot, 'apps', 'react-console', 'src', 'features', 'forms'), {
      recursive: true,
    });
    mkdirSync(join(projectRoot, 'apps', 'react-console', 'src', 'styles'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'apps', 'admin-angular', 'package.json'),
      JSON.stringify({ dependencies: { '@angular/core': '^21.0.0' } }),
    );
    writeFileSync(
      join(projectRoot, 'apps', 'admin-angular', 'src', 'app', 'app.routes.ts'),
      "export const routes = [{ path: 'angular-only', component: AdminComponent }];\n",
    );
    writeFileSync(
      join(projectRoot, 'apps', 'react-console', 'package.json'),
      JSON.stringify(
        {
          dependencies: {
            '@tanstack/react-router': '^1.140.0',
            '@vitejs/plugin-react': '^5.0.0',
            echarts: '^6.0.0',
            lucide: '^1.0.0',
            react: '^19.0.0',
            'react-dom': '^19.0.0',
            tailwindcss: '^4.0.0',
            zod: '^4.0.0',
            zustand: '^6.0.0',
          },
          devDependencies: { typescript: '^6.0.0', vite: '^8.0.0' },
        },
        null,
        2,
      ),
    );
    writeFileSync(
      join(projectRoot, 'apps', 'react-console', 'tsconfig.json'),
      JSON.stringify({ compilerOptions: { jsx: 'react-jsx' } }),
    );
    writeFileSync(
      join(projectRoot, 'apps', 'react-console', 'index.html'),
      '<!doctype html><div id="root"></div>\n',
    );
    writeFileSync(
      join(projectRoot, 'apps', 'react-console', 'vite.config.ts'),
      "import react from '@vitejs/plugin-react'; export default { plugins: [react()] };\n",
    );
    writeFileSync(
      join(projectRoot, 'apps', 'react-console', 'src', 'routes', '__root.tsx'),
      [
        "import { createRootRoute } from '@tanstack/react-router';",
        'export const Route = createRootRoute({ component: RootLayout });',
        'function RootLayout() { return <main />; }',
        '',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'apps', 'react-console', 'src', 'routes', 'index.tsx'),
      [
        "import { createFileRoute } from '@tanstack/react-router';",
        "export const Route = createFileRoute('/')({ component: HomeRoute });",
        'function HomeRoute() { return <main />; }',
        '',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'apps', 'react-console', 'src', 'routes', 'reports.tsx'),
      [
        "import { createFileRoute } from '@tanstack/react-router';",
        "import { RevenueChart } from '../features/billing/RevenueChart';",
        "export const Route = createFileRoute('/reports')({ component: ReportsRoute });",
        'function ReportsRoute() { return <RevenueChart />; }',
        '',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'apps', 'react-console', 'src', 'routeTree.gen.ts'),
      "export const routeTree = { path: '/generated-should-not-count' };\n",
    );
    writeFileSync(
      join(projectRoot, 'apps', 'react-console', 'src', 'features', 'billing', 'RevenueChart.tsx'),
      'export function RevenueChart() { return <section><svg /></section>; }\n',
    );
    writeFileSync(
      join(projectRoot, 'apps', 'react-console', 'src', 'features', 'forms', 'AccountForm.tsx'),
      'export const AccountForm = () => <form><input /></form>;\n',
    );
    writeFileSync(
      join(
        projectRoot,
        'apps',
        'react-console',
        'src',
        'features',
        'billing',
        'RevenueChart.test.tsx',
      ),
      'export function TestChart() { return <div />; }\n',
    );
    writeFileSync(
      join(
        projectRoot,
        'apps',
        'react-console',
        'src',
        'features',
        'billing',
        'RevenueChart.stories.tsx',
      ),
      'export function StoryChart() { return <div />; }\n',
    );
    writeFileSync(
      join(projectRoot, 'apps', 'react-console', 'src', 'styles', 'theme.css'),
      '@theme { --color-brand: #2563eb; --radius-card: 8px; } .dark { color-scheme: dark; }\n',
    );

    const report = await scanProject(join(projectRoot, 'apps', 'react-console'), {
      input: { kind: 'local', value: 'apps/react-console' },
    });

    expect(report.schemaVersion).toBe('scan-report.v2');
    expect(report.project.packageManager).toBe('pnpm');
    expect(report.project.framework).toBe('react');
    expect(report.project.primaryLanguage).toBe('typescript');
    expect(report.project.projectPath).toBe('apps/react-console');
    expect(report.project.evidence).toContain('React dependency');
    expect(report.routes.strategy).toBe('source-declared');
    expect(report.routes.signals.some((signal) => signal.kind === 'tanstack-router')).toBe(true);
    expect(report.routes.taskableRouteCount).toBeGreaterThanOrEqual(2);
    expect(report.routes.items.map((route) => route.path)).toEqual(
      expect.arrayContaining(['/', '/reports']),
    );
    expect(report.routes.items.find((route) => route.path === '/')?.file).toBe(
      'src/routes/index.tsx',
    );
    expect(report.routes.items.map((route) => route.path)).not.toContain('/angular-only');
    expect(report.routes.items.map((route) => route.path)).not.toContain(
      '/generated-should-not-count',
    );
    expect(report.assistant.ruleFiles).toContain('../../AGENTS.md');
    expect(report.components.componentCount).toBeGreaterThanOrEqual(2);
    expect(report.components.items.map((component) => component.name)).toEqual(
      expect.arrayContaining(['RevenueChart', 'AccountForm', 'HomeRoute', 'ReportsRoute']),
    );
    expect(report.components.items.map((component) => component.name)).not.toEqual(
      expect.arrayContaining(['TestChart', 'StoryChart']),
    );
    expect(report.components.confidence).toMatch(/medium|high/);
    expect(report.components.evidence).toContain(
      'feature-folder and route-local components were included',
    );
    expect(report.styling.approach).toBe('tailwind');
    expect(report.styling.cssVariableCount).toBeGreaterThanOrEqual(2);
    expect(report.styling.darkMode).toBe(true);
  });

  it('resolves nested React Router paths from static constants to lazy route source files', async () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({
        dependencies: {
          react: '^19.0.0',
          'react-dom': '^19.0.0',
          'react-router-dom': '^7.0.0',
        },
      }),
    );
    mkdirSync(join(projectRoot, 'src', 'routes', 'app'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'paths.ts'),
      [
        'export const paths = {',
        "  home: { path: '/' },",
        "  auth: { login: { path: '/auth/login' } },",
        '  app: {',
        "    root: { path: '/app' },",
        "    dashboard: { path: '' },",
        "    discussions: { path: 'discussions' },",
        "    discussion: { path: 'discussions/:discussionId' },",
        '  },',
        '} as const;',
        '',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'src', 'router.tsx'),
      [
        "import { createBrowserRouter } from 'react-router-dom';",
        "import { paths } from './paths';",
        'export const router = createBrowserRouter([',
        "  { path: paths.home.path, lazy: () => import('./routes/home') },",
        "  { path: paths.auth.login.path, lazy: () => import('./routes/login') },",
        '  {',
        '    path: paths.app.root.path,',
        '    children: [',
        "      { path: paths.app.dashboard.path, lazy: () => import('./routes/app/dashboard') },",
        "      { path: paths.app.discussions.path, lazy: () => import('./routes/app/discussions') },",
        "      { path: paths.app.discussion.path, lazy: () => import('./routes/app/discussion') },",
        '    ],',
        '  },',
        ']);',
        '',
      ].join('\n'),
    );
    for (const file of [
      'home.tsx',
      'login.tsx',
      'app/dashboard.tsx',
      'app/discussions.tsx',
      'app/discussion.tsx',
    ]) {
      writeFileSync(
        join(projectRoot, 'src', 'routes', file),
        'export function Component() { return <main />; }\n',
      );
    }

    const report = await scanProject(projectRoot);
    const routes = new Map(report.routes.items.map((route) => [route.path, route.file]));

    expect(report.routes.strategy).toBe('react-router');
    expect([...routes.keys()]).toEqual(
      expect.arrayContaining([
        '/',
        '/auth/login',
        '/app',
        '/app/discussions',
        '/app/discussions/:discussionId',
      ]),
    );
    expect(routes.get('/app')).toBe('src/routes/app/dashboard.tsx');
    expect(routes.get('/app/discussions')).toBe('src/routes/app/discussions.tsx');
    expect(routes.has('/discussions')).toBe(false);
  });
});

describe('resolveGitHubScanInput', () => {
  it('accepts repository and GitHub Pages URLs', () => {
    expect(resolveGitHubScanInput('https://github.com/acme/site').repository).toMatchObject({
      owner: 'acme',
      repo: 'site',
    });
    expect(resolveGitHubScanInput('https://acme.github.io/site/docs').publishedSiteUrl).toBe(
      'https://acme.github.io/site/',
    );
  });

  it('rejects invalid GitHub repository path segments', () => {
    expect(() => resolveGitHubScanInput('https://github.com/acme/site%2Fadmin')).toThrow(
      /valid owner and repository/,
    );
    expect(() => resolveGitHubScanInput('https://acme.github.io/site%2Fadmin/')).toThrow(
      /valid owner and repository/,
    );
  });
});

describe('probePublishedSite', () => {
  it('decodes published page metadata with an entity parser', async () => {
    const html = [
      '<!doctype html>',
      '<title>R&amp;D Lab</title>',
      '<meta name="description" content="Static &amp; read-only">',
      '<link rel="canonical" href="https://acme.github.io/site/?ref=scan&amp;mode=public">',
    ].join('');

    const probe = await probePublishedSite('https://acme.github.io/site/', {
      fetchImpl: async () =>
        new Response(html, {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
    });

    expect(probe.title).toBe('R&D Lab');
    expect(probe.description).toBe('Static & read-only');
    expect(probe.canonicalUrl).toBe('https://acme.github.io/site/?ref=scan&mode=public');
  });
});
