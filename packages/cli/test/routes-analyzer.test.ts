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

    const analysis = scanRoutes(projectRoot);

    expect(analysis.strategy).toBe('react-router');
    expect(analysis.routes.map((route) => route.path)).toEqual(
      expect.arrayContaining(['/tickets', '/customers', '/admin']),
    );
  });

  it('detects declarative TypeScript route specs without a framework adapter', () => {
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
    expect(analysis.routes.map((route) => route.path)).toEqual(
      expect.arrayContaining(['/', '/admin', '/admin/users']),
    );
    expect(analysis.routes.map((route) => route.path)).not.toContain('*');
  });
});
