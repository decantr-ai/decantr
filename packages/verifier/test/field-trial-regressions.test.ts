import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  discoverProject,
  resolveChangedUISurfaces,
  resolveUISurfaceTaskContext,
} from '../src/index.js';

describe('3.11 external field-trial regressions', () => {
  let projectRoot: string;

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), 'decantr-field-regression-'));
  });

  afterEach(() => {
    rmSync(projectRoot, { recursive: true, force: true });
  });

  it('maps TanStack internal route ids to generated public paths without tasking layouts', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({
        dependencies: { react: '^19.0.0', '@tanstack/react-router': '^1.140.0' },
      }),
    );
    mkdirSync(join(projectRoot, 'src', 'routes', '(auth)'), { recursive: true });
    mkdirSync(join(projectRoot, 'src', 'routes', '_authenticated', 'apps'), {
      recursive: true,
    });
    writeFileSync(
      join(projectRoot, 'src', 'routes', '__root.tsx'),
      'import { createRootRoute } from "@tanstack/react-router"; export const Route = createRootRoute({ component: () => <main /> });\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'routes', '(auth)', 'sign-in.tsx'),
      'import { createFileRoute } from "@tanstack/react-router"; export const Route = createFileRoute("/(auth)/sign-in")({ component: () => <main /> });\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'routes', '_authenticated.tsx'),
      'import { createFileRoute } from "@tanstack/react-router"; export const Route = createFileRoute("/_authenticated")({ component: () => <main /> });\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'routes', '_authenticated', 'apps', 'index.tsx'),
      'import { createFileRoute } from "@tanstack/react-router"; export const Route = createFileRoute("/_authenticated/apps/")({ component: () => <main /> });\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'routes', '_authenticated', 'apps', '$appId.tsx'),
      'import { createFileRoute } from "@tanstack/react-router"; export const Route = createFileRoute("/_authenticated/apps/$appId")({ component: () => <main /> });\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'routeTree.gen.ts'),
      [
        "import { Route as authSignInRouteImport } from './routes/(auth)/sign-in'",
        "import { Route as authenticatedRouteImport } from './routes/_authenticated'",
        "import { Route as authenticatedAppsIndexRouteImport } from './routes/_authenticated/apps/index'",
        "import { Route as authenticatedAppRouteImport } from './routes/_authenticated/apps/$appId'",
        'interface FileRoutesByPath {',
        "  '/(auth)/sign-in': { path: '/sign-in'; fullPath: '/sign-in'; preLoaderRoute: typeof authSignInRouteImport }",
        "  '/_authenticated': { path: ''; fullPath: '/'; preLoaderRoute: typeof authenticatedRouteImport }",
        "  '/_authenticated/apps/': { path: '/apps'; fullPath: '/apps/'; preLoaderRoute: typeof authenticatedAppsIndexRouteImport }",
        "  '/_authenticated/apps/$appId': { path: '/$appId'; fullPath: '/apps/$appId'; preLoaderRoute: typeof authenticatedAppRouteImport }",
        '}',
        'export const routeTree = {}',
        '',
      ].join('\n'),
    );
    writeFileSync(join(projectRoot, 'src', 'theme.css'), ':root { --surface: #fff; }\n');

    const discovery = discoverProject(projectRoot);
    const paths = discovery.routes.taskableRoutes.map((route) => route.path);

    expect(paths).toEqual(expect.arrayContaining(['/sign-in', '/apps', '/apps/:appId']));
    expect(paths).not.toEqual(
      expect.arrayContaining(['/(auth)/sign-in', '/_authenticated', '/_authenticated/apps']),
    );
    expect(discovery.routes.authority).toBe('proven');
    expect(discovery.routes.completeness).toBe('complete');
    expect(resolveUISurfaceTaskContext(discovery, '/sign-in').surface?.files).toContain(
      'src/routes/(auth)/sign-in.tsx',
    );
    expect(
      resolveUISurfaceTaskContext(discovery, '/sign-in').read.map((target) => target.file),
    ).toContain('src/routeTree.gen.ts');
  });

  it('caps convention-sensitive TanStack topology when generated corroboration is absent', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({
        dependencies: { react: '^19.0.0', '@tanstack/react-router': '^1.140.0' },
      }),
    );
    mkdirSync(join(projectRoot, 'src', 'routes', '(auth)'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'routes', '(auth)', 'sign-in.tsx'),
      'import { createFileRoute } from "@tanstack/react-router"; export const Route = createFileRoute("/(auth)/sign-in")({ component: () => <main /> });\n',
    );

    const discovery = discoverProject(projectRoot);
    const context = resolveUISurfaceTaskContext(discovery, '/sign-in');

    expect(discovery.routes.taskableRoutes).toContainEqual(
      expect.objectContaining({ path: '/sign-in' }),
    );
    expect(discovery.routes.authority).toBe('proven');
    expect(discovery.routes.completeness).toBe('partial');
    expect(discovery.routes.confidence).toBe('medium');
    expect(context.status).toBe('limited');
  });

  it('treats Astro Markdown as pages and TypeScript handlers as non-taskable endpoints', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { astro: '^5.0.0' } }),
    );
    writeFileSync(join(projectRoot, 'astro.config.mjs'), 'export default {};\n');
    mkdirSync(join(projectRoot, 'src', 'pages'), { recursive: true });
    writeFileSync(join(projectRoot, 'src', 'pages', 'index.astro'), '<main>Home</main>\n');
    writeFileSync(join(projectRoot, 'src', 'pages', 'privacy.md'), '# Privacy\n');
    writeFileSync(join(projectRoot, 'src', 'pages', 'terms.mdx'), '# Terms\n');
    writeFileSync(
      join(projectRoot, 'src', 'pages', 'rss.xml.ts'),
      'export const GET = () => new Response("<rss />");\n',
    );

    const discovery = discoverProject(projectRoot);

    expect(discovery.routes.taskableRoutes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '/privacy', file: 'src/pages/privacy.md' }),
        expect.objectContaining({ path: '/terms', file: 'src/pages/terms.mdx' }),
      ]),
    );
    expect(discovery.routes.routeSignals).toContainEqual(
      expect.objectContaining({ path: '/rss.xml', file: 'src/pages/rss.xml.ts', taskable: false }),
    );
    expect(discovery.routes.taskableRoutes).not.toContainEqual(
      expect.objectContaining({ path: '/rss.xml' }),
    );
    expect(resolveUISurfaceTaskContext(discovery, '/rss.xml')).toMatchObject({
      status: 'blocked',
      read: [],
    });
  });

  it('keeps SvelteKit page data as supporting authority instead of a second UI route', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { '@sveltejs/kit': '^2.0.0', svelte: '^5.0.0' } }),
    );
    writeFileSync(join(projectRoot, 'svelte.config.js'), 'export default {};\n');
    mkdirSync(join(projectRoot, 'src', 'routes', '(marketing)'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'routes', '(marketing)', '+page.svelte'),
      '<main>Home</main>\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'routes', '(marketing)', '+page.ts'),
      'export const load = () => ({ plan: "free" });\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'routes', '(marketing)', '+page.server.ts'),
      'export const load = () => ({ account: null });\n',
    );
    writeFileSync(join(projectRoot, 'src', 'app.css'), ':root { --surface: #fff; }\n');

    const discovery = discoverProject(projectRoot);
    const context = resolveUISurfaceTaskContext(discovery, '/');

    expect(discovery.routes.taskableRoutes).toEqual([
      expect.objectContaining({ path: '/', file: 'src/routes/(marketing)/+page.svelte' }),
    ]);
    expect(
      discovery.routes.routeSignals
        .filter((signal) => signal.path === '/')
        .map((signal) => ({ file: signal.file, taskable: signal.taskable })),
    ).toEqual([
      { file: 'src/routes/(marketing)/+page.svelte', taskable: true },
      { file: 'src/routes/(marketing)/+page.server.ts', taskable: false },
      { file: 'src/routes/(marketing)/+page.ts', taskable: false },
    ]);
    expect(context.surface?.files).toEqual(['src/routes/(marketing)/+page.svelte']);
    expect(context.candidates).toHaveLength(1);
    expect(context.read.map((target) => target.file)).toEqual(
      expect.arrayContaining([
        'src/routes/(marketing)/+page.svelte',
        'src/routes/(marketing)/+page.ts',
        'src/routes/(marketing)/+page.server.ts',
      ]),
    );
    expect(context.read[0]).toMatchObject({
      file: 'src/routes/(marketing)/+page.svelte',
      rank: 1,
      role: 'implementation',
    });
  });

  it('does not invent public routes beneath an Angular wildcard fallback', () => {
    writeAngularShell(projectRoot);
    writeFileSync(
      join(projectRoot, 'src', 'app', 'app.routes.ts'),
      [
        'import type { Routes } from "@angular/router";',
        'import { HomeComponent } from "./home.component";',
        'export const routes: Routes = [',
        '  { path: "home", component: HomeComponent },',
        '  { path: "**", loadChildren: () => import("./error.routes").then((m) => m.ERROR_ROUTES) },',
        '];',
        '',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'src', 'app', 'error.routes.ts'),
      [
        'import type { Routes } from "@angular/router";',
        'import { HomeComponent } from "./home.component";',
        'export const ERROR_ROUTES: Routes = [',
        '  { path: "401", component: HomeComponent },',
        '  { path: "403", component: HomeComponent },',
        '];',
        '',
      ].join('\n'),
    );
    writeAngularComponent(projectRoot);

    const routes = discoverProject(projectRoot).routes;

    expect(routes.taskableRoutes.map((route) => route.path)).toEqual(['/home']);
    expect(routes.routeSignals.map((route) => route.path).join(' ')).not.toContain('/**');
    expect(routes.completeness).toBe('complete');
  });

  it('includes Angular external templates, authored views, and component styles in route context', () => {
    writeAngularShell(projectRoot);
    writeFileSync(
      join(projectRoot, 'src', 'app', 'app.routes.ts'),
      [
        'import type { Routes } from "@angular/router";',
        'import { HomeComponent } from "./home.component";',
        'export const routes: Routes = [{ path: "home", component: HomeComponent }];',
        '',
      ].join('\n'),
    );
    writeAngularComponent(projectRoot);

    const discovery = discoverProject(projectRoot);
    const context = resolveUISurfaceTaskContext(discovery, '/home');
    const changed = resolveChangedUISurfaces(discovery, ['src/app/home.component.html']);
    const implementationFiles = context.read
      .filter((target) => target.role === 'implementation')
      .map((target) => target.file);

    expect(implementationFiles).toEqual(
      expect.arrayContaining([
        'src/app/home.component.ts',
        'src/app/home.component.html',
        'src/app/home.component.pug',
        'src/app/home.component.scss',
      ]),
    );
    expect(changed.unresolvedFiles).toEqual([]);
    expect(changed.impactedSurfaces).toContainEqual(
      expect.objectContaining({ kind: 'route', name: '/home' }),
    );
  });

  it('resolves Angular workspace secondary-entry imports to the component source', () => {
    writeAngularShell(projectRoot);
    writeFileSync(
      join(projectRoot, 'src', 'app', 'app.routes.ts'),
      [
        'import type { Routes } from "@angular/router";',
        'export const routes: Routes = [',
        '  {',
        '    path: "home",',
        '    loadComponent: () => import("@example/dashboard-core/home").then((m) => m.HomeViewComponent),',
        '  },',
        '];',
        '',
      ].join('\n'),
    );
    mkdirSync(join(projectRoot, 'projects', 'dashboard-core', 'home', 'src', 'home-view'), {
      recursive: true,
    });
    writeFileSync(
      join(projectRoot, 'projects', 'dashboard-core', 'package.json'),
      JSON.stringify({ name: '@example/dashboard-core' }),
    );
    writeFileSync(
      join(projectRoot, 'projects', 'dashboard-core', 'home', 'ng-package.json'),
      JSON.stringify({ lib: { entryFile: 'index.ts' } }),
    );
    writeFileSync(
      join(projectRoot, 'projects', 'dashboard-core', 'home', 'index.ts'),
      "export * from './src/home-view/home-view.component';\n",
    );
    writeFileSync(
      join(
        projectRoot,
        'projects',
        'dashboard-core',
        'home',
        'src',
        'home-view',
        'home-view.component.ts',
      ),
      [
        'import { Component } from "@angular/core";',
        '@Component({ templateUrl: "./home-view.component.html" })',
        'export class HomeViewComponent {}',
        '',
      ].join('\n'),
    );
    writeFileSync(
      join(
        projectRoot,
        'projects',
        'dashboard-core',
        'home',
        'src',
        'home-view',
        'home-view.component.html',
      ),
      '<main>Dashboard</main>\n',
    );
    mkdirSync(join(projectRoot, 'node_modules', '@example', 'dashboard-core', 'home'), {
      recursive: true,
    });
    writeFileSync(
      join(projectRoot, 'node_modules', '@example', 'dashboard-core', 'package.json'),
      JSON.stringify({
        name: '@example/dashboard-core',
        exports: { './home': { types: './home/index.d.ts' } },
      }),
    );
    writeFileSync(
      join(projectRoot, 'node_modules', '@example', 'dashboard-core', 'home', 'index.d.ts'),
      'export declare class HomeViewComponent {}\n',
    );

    const discovery = discoverProject(projectRoot);
    const route = discovery.routes.taskableRoutes.find((candidate) => candidate.path === '/home');
    const context = resolveUISurfaceTaskContext(discovery, '/home');

    expect(route?.file).toBe('projects/dashboard-core/home/src/home-view/home-view.component.ts');
    expect(context.read.map((target) => target.file)).toContain(
      'projects/dashboard-core/home/src/home-view/home-view.component.html',
    );
  });
});

function writeAngularShell(projectRoot: string): void {
  writeFileSync(
    join(projectRoot, 'package.json'),
    JSON.stringify({
      dependencies: { '@angular/core': '^21.0.0', '@angular/router': '^21.0.0' },
    }),
  );
  writeFileSync(
    join(projectRoot, 'angular.json'),
    JSON.stringify({
      version: 1,
      projects: {
        frontend: {
          root: '',
          sourceRoot: 'src',
          architect: {
            build: { options: { browser: 'src/main.ts', styles: ['src/styles.scss'] } },
          },
        },
      },
    }),
  );
  mkdirSync(join(projectRoot, 'src', 'app'), { recursive: true });
  writeFileSync(
    join(projectRoot, 'src', 'main.ts'),
    'import { bootstrapApplication } from "@angular/platform-browser"; import { appConfig } from "./app/app.config"; bootstrapApplication(class App {}, appConfig);\n',
  );
  writeFileSync(
    join(projectRoot, 'src', 'app', 'app.config.ts'),
    'import { provideRouter } from "@angular/router"; import { routes } from "./app.routes"; export const appConfig = { providers: [provideRouter(routes)] };\n',
  );
  writeFileSync(join(projectRoot, 'src', 'styles.scss'), ':root { --surface: #fff; }\n');
}

function writeAngularComponent(projectRoot: string): void {
  writeFileSync(
    join(projectRoot, 'src', 'app', 'home.component.ts'),
    [
      'import { Component } from "@angular/core";',
      '@Component({',
      '  selector: "app-home",',
      '  templateUrl: "./home.component.html",',
      '  styleUrls: ["./home.component.scss"],',
      '})',
      'export class HomeComponent {}',
      '',
    ].join('\n'),
  );
  writeFileSync(join(projectRoot, 'src', 'app', 'home.component.html'), '<main>Home</main>\n');
  writeFileSync(join(projectRoot, 'src', 'app', 'home.component.pug'), 'main Home\n');
  writeFileSync(
    join(projectRoot, 'src', 'app', 'home.component.scss'),
    ':host { display: block; }\n',
  );
}
