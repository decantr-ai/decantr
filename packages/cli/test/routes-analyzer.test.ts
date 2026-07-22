import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { scanRoutes } from '../src/analyzers/routes.js';

describe('route analyzer', () => {
  let projectRoot = '';

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), 'decantr-routes-'));
    mkdirSync(join(projectRoot, 'src'), { recursive: true });
  });

  afterEach(() => {
    rmSync(projectRoot, { recursive: true, force: true });
  });

  it('detects hand-rolled pathname branch routes in React SPAs', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify(
        {
          private: true,
          dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' },
        },
        null,
        2,
      ),
    );
    writeFileSync(
      join(projectRoot, 'src', 'App.tsx'),
      [
        'export function App() {',
        '  const path = window.location.pathname;',
        '  return <main>',
        '    <a href="/tickets">Tickets</a>',
        '    <a href="/customers">Customers</a>',
        '    <a href="/admin">Admin</a>',
        '    {path === "/customers" ? <Customers /> : path === "/admin" ? <Admin /> : <Tickets />}',
        '  </main>;',
        '}',
        '',
      ].join('\n'),
    );
    writeFileSync(join(projectRoot, 'src', 'main.tsx'), 'import { App } from "./App"; void App;\n');

    const analysis = scanRoutes(projectRoot);

    expect(analysis.strategy).toBe('react-router');
    expect(analysis.routes.map((route) => route.path)).toEqual(
      expect.arrayContaining(['/tickets', '/customers', '/admin']),
    );
  });

  it('does not promote unresolved declarative specs to taskable routes', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify(
        {
          private: true,
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
    writeFileSync(
      join(projectRoot, 'main.wasp.ts'),
      [
        'import { app, page, route } from "@wasp.sh/spec";',
        'import { LandingPage } from "./src/landing-page/LandingPage" with { type: "ref" };',
        'import { adminSpec } from "./src/admin/admin.wasp";',
        'export default app({',
        '  name: "OpenSaaS",',
        '  spec: [',
        '    route("LandingPageRoute", "/", page(LandingPage), { prerender: true }),',
        '    route("NotFoundRoute", "*", page(LandingPage)),',
        '    adminSpec,',
        '  ],',
        '});',
        '',
      ].join('\n'),
    );
    mkdirSync(join(projectRoot, 'src', 'admin'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'admin', 'admin.wasp.ts'),
      [
        'import { page, route, type Spec } from "@wasp.sh/spec";',
        'import { AnalyticsDashboardPage } from "./AnalyticsDashboardPage" with { type: "ref" };',
        'import { UsersDashboardPage } from "./UsersDashboardPage" with { type: "ref" };',
        'export const adminSpec: Spec = [',
        '  route(',
        '    "AdminRoute",',
        '    "/admin",',
        '    page(AnalyticsDashboardPage, { authRequired: true }),',
        '  ),',
        '  route("AdminUsersRoute", "/admin/users", page(UsersDashboardPage, { authRequired: true })),',
        '];',
        '',
      ].join('\n'),
    );

    const analysis = scanRoutes(projectRoot);

    expect(analysis.strategy).toBe('react-router');
    expect(analysis.routes).toEqual([]);
  });

  it('normalizes React Router wrapper paths from mature brownfield apps', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify(
        {
          private: true,
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
    writeFileSync(
      join(projectRoot, 'src', 'main.tsx'),
      'import { PrivateRoutesContainer } from "./PrivateRoutesContainer"; void PrivateRoutesContainer;\n',
    );

    const analysis = scanRoutes(projectRoot);
    const paths = analysis.routes.map((route) => route.path);

    expect(analysis.strategy).toBe('react-router');
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

  it('detects package-managed static HTML entrypoints under src', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ private: true, scripts: { build: 'webpack' } }, null, 2),
    );
    writeFileSync(join(projectRoot, 'src', 'index.html'), '<!doctype html><main>Todo</main>');

    const analysis = scanRoutes(projectRoot);

    expect(analysis.strategy).toBe('static-html');
    expect(analysis.routes).toContainEqual({ path: '/', file: 'src/index.html', hasLayout: false });
  });

  it('does not promote nested demo HTML to production routes', () => {
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

    const analysis = scanRoutes(projectRoot);
    const paths = analysis.routes.map((route) => route.path);

    expect(analysis.strategy).toBe('none');
    expect(paths).toEqual([]);
  });

  it('does not expose Next Pages Router internals as taskable routes', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify(
        {
          private: true,
          dependencies: { next: '^16.0.0', react: '^19.0.0', 'react-dom': '^19.0.0' },
        },
        null,
        2,
      ),
    );
    const pagesDir = join(projectRoot, 'pages');
    mkdirSync(pagesDir, { recursive: true });
    for (const file of ['index.tsx', '_app.tsx', '_document.tsx', '_error.tsx']) {
      writeFileSync(join(pagesDir, file), 'export default function Page() { return null; }');
    }

    const analysis = scanRoutes(projectRoot);

    expect(analysis.strategy).toBe('pages-router');
    expect(analysis.routes.map((route) => route.path)).toEqual(['/']);
  });

  it('keeps inferred route candidates out of governed route analysis', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { react: '^19.0.0', 'react-router-dom': '^7.0.0' } }),
    );
    writeFileSync(
      join(projectRoot, 'src', 'App.tsx'),
      'import { Route } from "react-router-dom"; export const App = () => <Route path="/settings" element={<main />} />;\n',
    );

    const analysis = scanRoutes(projectRoot);

    expect(analysis.authority).toBe('inferred');
    expect(analysis.routes).toEqual([]);
    expect(analysis.candidateRoutes).toContainEqual(
      expect.objectContaining({ path: '/settings', file: 'src/App.tsx' }),
    );
  });
});
