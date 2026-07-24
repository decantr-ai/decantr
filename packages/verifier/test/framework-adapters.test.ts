import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { discoverProject } from '../src/index.js';

describe('framework route authority adapters', () => {
  let projectRoot: string;

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), 'decantr-framework-adapter-'));
  });

  afterEach(() => {
    rmSync(projectRoot, { recursive: true, force: true });
  });

  it('keeps generic React Router declarations inferred without an entrypoint', () => {
    reactPackage(projectRoot);
    mkdirSync(join(projectRoot, 'src'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'App.tsx'),
      'import { Route } from "react-router-dom"; export const App = () => <Route path="/settings" element={<main />} />;\n',
    );

    const routes = discoverProject(projectRoot).routes;

    expect(routes.authority).toBe('inferred');
    expect(routes.completeness).toBe('partial');
    expect(routes.limitations).toContain(
      'No selected-app production entrypoint was found for route reachability.',
    );
  });

  it('proves production reachability without claiming generic extraction completeness', () => {
    reactPackage(projectRoot);
    mkdirSync(join(projectRoot, 'src'), { recursive: true });
    writeFileSync(join(projectRoot, 'src', 'main.tsx'), 'import { App } from "./App"; void App;\n');
    writeFileSync(
      join(projectRoot, 'src', 'App.tsx'),
      'import { Route } from "react-router-dom"; export const App = () => <Route path="/settings" element={<main />} />;\n',
    );

    const routes = discoverProject(projectRoot).routes;

    expect(routes.authority).toBe('proven');
    expect(routes.completeness).toBe('partial');
    expect(routes.authorityFiles).toEqual(expect.arrayContaining(['src/main.tsx', 'src/App.tsx']));
  });

  it('uses a complete convention adapter for Next file routes', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { next: '^16.0.0', react: '^19.0.0' } }),
    );
    mkdirSync(join(projectRoot, 'app', 'settings'), { recursive: true });
    writeFileSync(join(projectRoot, 'app', 'page.tsx'), 'export default () => <main />;\n');
    writeFileSync(
      join(projectRoot, 'app', 'settings', 'page.tsx'),
      'export default () => <main />;\n',
    );

    const routes = discoverProject(projectRoot).routes;

    expect(routes.authority).toBe('proven');
    expect(routes.completeness).toBe('complete');
    expect(routes.evidence).toContain(
      'next-file-router convention resolves route files inside the selected app.',
    );
  });

  it('uses TanStack route files as authority only inside the selected route root', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({
        dependencies: {
          react: '^19.0.0',
          '@tanstack/react-router': '^1.0.0',
        },
      }),
    );
    mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'routes', 'index.tsx'),
      'import { createFileRoute } from "@tanstack/react-router"; export const Route = createFileRoute("/")({ component: () => <main /> });\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'routes', 'api.auth.$.ts'),
      'import { createFileRoute } from "@tanstack/react-router"; export const Route = createFileRoute("/api/auth/$")({ server: { handlers: { GET: () => new Response() } } });\n',
    );

    const routes = discoverProject(projectRoot).routes;

    expect(routes.authority).toBe('proven');
    expect(routes.completeness).toBe('complete');
    expect(routes.taskableRouteCount).toBe(1);
    expect(routes.taskableRoutes).not.toContainEqual(
      expect.objectContaining({ path: '/api/auth/$' }),
    );
  });

  it('uses Astro pages as complete file-route authority', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { astro: '^5.0.0' } }),
    );
    writeFileSync(join(projectRoot, 'astro.config.mjs'), 'export default {};\n');
    mkdirSync(join(projectRoot, 'src', 'pages', 'posts'), { recursive: true });
    writeFileSync(join(projectRoot, 'src', 'pages', 'index.astro'), '<main>Home</main>\n');
    writeFileSync(
      join(projectRoot, 'src', 'pages', 'posts', '[slug].astro'),
      '<main>Post</main>\n',
    );
    mkdirSync(join(projectRoot, 'src', 'pages', 'posts', '_components'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'pages', 'posts', '_components', 'AdjacentPostNav.astro'),
      '<nav>Adjacent posts</nav>\n',
    );
    mkdirSync(join(projectRoot, 'src', 'pages', 'archives', '_utils'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'pages', 'archives', '_utils', 'getPosts.ts'),
      'export const getPosts = () => [];\n',
    );
    mkdirSync(join(projectRoot, 'src', 'components'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'components', 'Header.astro'),
      '---\nconst pathname = Astro.url.pathname;\n---\n<header><a href="/about">About</a>{pathname}</header>\n',
    );

    const discovery = discoverProject(projectRoot);
    const routes = discovery.routes;

    expect(routes.strategy).toBe('pages-router');
    expect(routes.authority).toBe('proven');
    expect(routes.completeness).toBe('complete');
    expect(routes.taskableRoutes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '/', file: 'src/pages/index.astro' }),
        expect.objectContaining({ path: '/posts/:slug', file: 'src/pages/posts/[slug].astro' }),
      ]),
    );
    expect(routes.taskableRoutes).not.toContainEqual(
      expect.objectContaining({ path: '/about', file: 'src/components/Header.astro' }),
    );
    expect(routes.taskableRoutes).not.toContainEqual(
      expect.objectContaining({
        file: 'src/pages/posts/_components/AdjacentPostNav.astro',
      }),
    );
    expect(routes.taskableRoutes).not.toContainEqual(
      expect.objectContaining({ file: 'src/pages/archives/_utils/getPosts.ts' }),
    );
    expect(discovery.components.items).toContainEqual(
      expect.objectContaining({
        name: 'Header',
        file: 'src/components/Header.astro',
        kind: 'pascal-file',
      }),
    );
    expect(discovery.components.items).toContainEqual(
      expect.objectContaining({
        name: 'AdjacentPostNav',
        file: 'src/pages/posts/_components/AdjacentPostNav.astro',
      }),
    );
  });

  it('uses React Router auto-routes as complete UI route authority', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({
        dependencies: {
          react: '^19.0.0',
          'react-router': '^7.0.0',
          'react-router-auto-routes': '^1.0.0',
        },
      }),
    );
    mkdirSync(join(projectRoot, 'app', 'routes', '_marketing'), { recursive: true });
    mkdirSync(join(projectRoot, 'app', 'routes', 'users'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'app', 'routes.ts'),
      'import { autoRoutes } from "react-router-auto-routes"; export default autoRoutes();\n',
    );
    writeFileSync(
      join(projectRoot, 'app', 'routes', '_marketing', 'index.tsx'),
      'export default function Home() { return <main />; }\n',
    );
    writeFileSync(
      join(projectRoot, 'app', 'routes', 'users', '$id.tsx'),
      'export function Component() { return <main />; }\n',
    );
    writeFileSync(
      join(projectRoot, 'app', 'routes', 'users', 'session.server.ts'),
      'export const path = "/fiction";\n',
    );

    const routes = discoverProject(projectRoot).routes;

    expect(routes.strategy).toBe('react-router-file-router');
    expect(routes.authority).toBe('proven');
    expect(routes.completeness).toBe('complete');
    expect(routes.taskableRoutes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '/', file: 'app/routes/_marketing/index.tsx' }),
        expect.objectContaining({ path: '/users/:id', file: 'app/routes/users/$id.tsx' }),
      ]),
    );
    expect(routes.routeSignals.map((signal) => signal.file)).not.toContain(
      'app/routes/users/session.server.ts',
    );
  });

  it('uses SolidStart source routes as complete file-route authority', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({
        dependencies: {
          'solid-js': '^1.9.0',
          '@solidjs/start': '^1.0.0',
          '@solidjs/router': '^0.15.0',
        },
      }),
    );
    mkdirSync(join(projectRoot, 'src', 'routes', 'users'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'routes', '[...stories].tsx'),
      'export default function Stories() { return <main />; }\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'routes', 'users', '[id].tsx'),
      'export default function User() { return <main />; }\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'routes', 'users', 'query.data.ts'),
      'export const query = true;\n',
    );

    const routes = discoverProject(projectRoot).routes;

    expect(routes.strategy).toBe('solidstart-router');
    expect(routes.authority).toBe('proven');
    expect(routes.completeness).toBe('complete');
    expect(routes.taskableRoutes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '/:stories*', file: 'src/routes/[...stories].tsx' }),
        expect.objectContaining({ path: '/users/:id', file: 'src/routes/users/[id].tsx' }),
      ]),
    );
  });

  it('resolves Vue Router component imports while keeping router topology authority', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { vue: '^3.5.0', 'vue-router': '^4.0.0' } }),
    );
    mkdirSync(join(projectRoot, 'src', 'router'), { recursive: true });
    mkdirSync(join(projectRoot, 'src', 'views'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'main.ts'),
      'import { router } from "./router"; void router;\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'router', 'index.ts'),
      [
        'import { createRouter, createWebHistory } from "vue-router";',
        'import Home from "../views/Home.vue";',
        'export const router = createRouter({',
        '  history: createWebHistory(),',
        '  routes: [',
        '    { path: "/", component: Home },',
        '    { path: "/settings", component: () => import("../views/Settings.vue") },',
        '  ],',
        '});',
        '',
      ].join('\n'),
    );
    writeFileSync(join(projectRoot, 'src', 'views', 'Home.vue'), '<template>Home</template>\n');
    writeFileSync(
      join(projectRoot, 'src', 'views', 'Settings.vue'),
      '<template>Settings</template>\n',
    );

    const routes = discoverProject(projectRoot).routes;

    expect(routes.authority).toBe('proven');
    expect(routes.completeness).toBe('partial');
    expect(routes.taskableRoutes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '/', file: 'src/views/Home.vue' }),
        expect.objectContaining({ path: '/settings', file: 'src/views/Settings.vue' }),
      ]),
    );
    expect(routes.authorityFiles).toEqual(
      expect.arrayContaining(['src/main.ts', 'src/router/index.ts']),
    );
  });

  it('resolves generated Vue route registry names to authored view files', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { vue: '^3.5.0', 'vue-router': '^4.0.0' } }),
    );
    mkdirSync(join(projectRoot, 'src', 'router'), { recursive: true });
    mkdirSync(join(projectRoot, 'src', 'views', 'home'), { recursive: true });
    mkdirSync(join(projectRoot, 'src', 'layouts', 'base'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'main.ts'),
      'import { router } from "./router"; void router;\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'router', 'index.ts'),
      [
        'import { createRouter, createWebHistory } from "vue-router";',
        'import { generatedRoutes } from "./routes";',
        'export const router = createRouter({ history: createWebHistory(), routes: generatedRoutes });',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'src', 'router', 'imports.ts'),
      [
        'import BaseLayout from "@/layouts/base/index.vue";',
        'export const layouts = { base: BaseLayout };',
        'export const views = { home: () => import("@/views/home/index.vue") };',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'src', 'router', 'routes.ts'),
      [
        'export const generatedRoutes = [',
        '  { path: "/home", component: "layout.base$view.home" },',
        '];',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'src', 'views', 'home', 'index.vue'),
      '<template>Home</template>\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'layouts', 'base', 'index.vue'),
      '<template><slot /></template>\n',
    );

    const routes = discoverProject(projectRoot).routes;

    expect(routes.taskableRoutes).toContainEqual(
      expect.objectContaining({ path: '/home', file: 'src/views/home/index.vue' }),
    );
    expect(routes.authority).toBe('proven');
  });
});

function reactPackage(projectRoot: string): void {
  writeFileSync(
    join(projectRoot, 'package.json'),
    JSON.stringify({
      dependencies: {
        react: '^19.0.0',
        'react-router-dom': '^7.0.0',
      },
    }),
  );
}
