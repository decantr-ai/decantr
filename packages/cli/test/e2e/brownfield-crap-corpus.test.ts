import { execSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

function writeJson(path: string, value: unknown) {
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
}

function mkdirp(path: string) {
  mkdirSync(path, { recursive: true });
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf-8')) as T;
}

describe('brownfield crap corpus', () => {
  let testDir: string;
  const cliPath = join(__dirname, '..', '..', 'dist', 'index.js');
  const corpusObservationTimeoutMs = 15_000;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-crap-corpus-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it(
    'observes ugly framework and styling combinations without importing Decantr defaults',
    () => {
      const cases = [
        {
          name: 'angular-bootstrap',
          setup(projectDir: string) {
            writeJson(join(projectDir, 'package.json'), {
              name: 'angular-bootstrap',
              dependencies: {
                '@angular/core': '^19.0.0',
                '@angular/router': '^19.0.0',
                bootstrap: '^5.3.0',
              },
            });
            writeJson(join(projectDir, 'angular.json'), { version: 1, projects: {} });
            mkdirp(join(projectDir, 'src', 'app'));
            writeFileSync(
              join(projectDir, 'src', 'app', 'app.routes.ts'),
              [
                "import type { Routes } from '@angular/router';",
                'export const routes: Routes = [',
                "  { path: '', loadComponent: () => import('./home') },",
                "  { path: 'admin/users', loadComponent: () => import('./users') },",
                "  { path: 'billing/invoices', loadComponent: () => import('./billing') },",
                "  { path: 'settings/profile', loadComponent: () => import('./settings') },",
                "  { path: '**', redirectTo: '' },",
                '];',
                '',
              ].join('\n'),
            );
            writeFileSync(
              join(projectDir, 'src', 'styles.css'),
              ':root { --bs-primary: #0d6efd; --surface-card: #fff; }\n',
            );
          },
          framework: 'angular',
          routeStrategy: 'angular-router',
          styling: 'bootstrap',
          routes: ['/', '/admin/users', '/billing/invoices', '/settings/profile'],
          sections: ['observed-public', 'observed-admin', 'observed-billing', 'observed-settings'],
        },
        {
          name: 'sveltekit-css',
          setup(projectDir: string) {
            writeJson(join(projectDir, 'package.json'), {
              name: 'sveltekit-css',
              dependencies: {
                '@sveltejs/kit': '^2.0.0',
                svelte: '^5.0.0',
              },
            });
            writeFileSync(join(projectDir, 'svelte.config.js'), 'export default {};\n');
            mkdirp(join(projectDir, 'src', 'routes', '(app)', 'dashboard'));
            mkdirp(join(projectDir, 'src', 'routes', '(app)', 'reports', '[id]'));
            writeFileSync(join(projectDir, 'src', 'routes', '+page.svelte'), '<main>Home</main>\n');
            writeFileSync(
              join(projectDir, 'src', 'routes', '(app)', 'dashboard', '+page.svelte'),
              '<main>Dashboard</main>\n',
            );
            writeFileSync(
              join(projectDir, 'src', 'routes', '(app)', 'reports', '[id]', '+page.svelte'),
              '<main>Report</main>\n',
            );
            writeFileSync(
              join(projectDir, 'src', 'app.css'),
              ':root { --brand-primary: #16a34a; }\n',
            );
          },
          framework: 'svelte',
          routeStrategy: 'sveltekit-router',
          styling: 'css',
          routes: ['/', '/dashboard', '/reports/:id'],
          sections: ['observed-public', 'observed-dashboard', 'observed-reporting'],
        },
        {
          name: 'vue-chakra',
          setup(projectDir: string) {
            writeJson(join(projectDir, 'package.json'), {
              name: 'vue-chakra',
              dependencies: {
                vue: '^3.5.0',
                'vue-router': '^4.4.0',
                '@chakra-ui/vue-next': '^2.0.0',
              },
            });
            writeFileSync(join(projectDir, 'vite.config.ts'), 'export default {};\n');
            mkdirp(join(projectDir, 'src', 'router'));
            writeFileSync(
              join(projectDir, 'src', 'router', 'index.ts'),
              [
                "import { createRouter, createWebHistory } from 'vue-router';",
                'export const router = createRouter({',
                '  history: createWebHistory(),',
                '  routes: [',
                "    { path: '/', component: {} },",
                "    { path: '/workspace', component: {} },",
                "    { path: '/admin/roles', component: {} },",
                "    { path: '/content/library', component: {} },",
                '  ],',
                '});',
                '',
              ].join('\n'),
            );
          },
          framework: 'vue',
          routeStrategy: 'vue-router',
          styling: 'chakra',
          routes: ['/', '/workspace', '/admin/roles', '/content/library'],
          sections: ['observed-public', 'observed-dashboard', 'observed-rbac', 'observed-content'],
        },
        {
          name: 'nuxt-pages',
          setup(projectDir: string) {
            writeJson(join(projectDir, 'package.json'), {
              name: 'nuxt-pages',
              dependencies: {
                nuxt: '^3.15.0',
                vue: '^3.5.0',
              },
            });
            writeFileSync(
              join(projectDir, 'nuxt.config.ts'),
              'export default defineNuxtConfig({});\n',
            );
            mkdirp(join(projectDir, 'pages', 'settings'));
            writeFileSync(
              join(projectDir, 'pages', 'index.vue'),
              '<template><main /></template>\n',
            );
            writeFileSync(
              join(projectDir, 'pages', 'dashboard.vue'),
              '<template><main /></template>\n',
            );
            writeFileSync(
              join(projectDir, 'pages', 'settings', 'profile.vue'),
              '<template><main /></template>\n',
            );
            mkdirp(join(projectDir, 'assets', 'css'));
            writeFileSync(
              join(projectDir, 'assets', 'css', 'main.css'),
              ':root { --brand-primary: #2563eb; }\n',
            );
          },
          framework: 'nuxt',
          routeStrategy: 'nuxt-router',
          styling: 'css',
          routes: ['/', '/dashboard', '/settings/profile'],
          sections: ['observed-public', 'observed-dashboard', 'observed-settings'],
        },
        {
          name: 'mixed-next-mui',
          setup(projectDir: string) {
            writeJson(join(projectDir, 'package.json'), {
              name: 'mixed-next-mui',
              dependencies: {
                next: '^15.0.0',
                react: '^19.0.0',
                'react-dom': '^19.0.0',
                '@emotion/react': '^11.0.0',
                '@mui/material': '^6.0.0',
              },
            });
            writeFileSync(join(projectDir, 'next.config.ts'), 'export default {};\n');
            mkdirp(join(projectDir, 'src', 'app', 'dashboard'));
            mkdirp(join(projectDir, 'src', 'pages', 'admin'));
            writeFileSync(
              join(projectDir, 'src', 'app', 'dashboard', 'page.tsx'),
              'export default function Page() { return null; }\n',
            );
            writeFileSync(
              join(projectDir, 'src', 'pages', 'settings.tsx'),
              'export default function Page() { return null; }\n',
            );
            writeFileSync(
              join(projectDir, 'src', 'pages', 'admin', 'users.tsx'),
              'export default function Page() { return null; }\n',
            );
          },
          framework: 'nextjs',
          routeStrategy: 'mixed-next-router',
          styling: 'mui',
          routes: ['/dashboard', '/settings', '/admin/users'],
          sections: ['observed-dashboard', 'observed-settings', 'observed-admin'],
        },
      ];

      for (const fixture of cases) {
        const projectDir = join(testDir, fixture.name);
        mkdirp(projectDir);
        fixture.setup(projectDir);

        execSync(`node ${cliPath} analyze`, { cwd: projectDir, stdio: 'pipe' });

        const analysis = readJson<{
          project?: { framework?: string };
          routes?: { strategy?: string; routes?: Array<{ path: string }> };
          styling?: { approach?: string };
        }>(join(projectDir, '.decantr', 'analysis.json'));
        const proposal = readJson<{
          evidence?: { semanticSectionCount?: number };
          essence?: {
            dna?: { theme?: { id?: string } };
            meta?: { platform?: { type?: string } };
            blueprint?: { sections?: Array<{ id?: string }>; routes?: Record<string, unknown> };
          };
        }>(join(projectDir, '.decantr', 'observed-essence.proposal.json'));

        expect(analysis.project?.framework).toBe(fixture.framework);
        expect(analysis.routes?.strategy).toBe(fixture.routeStrategy);
        expect(analysis.routes?.routes?.map((route) => route.path)).toEqual(
          expect.arrayContaining(fixture.routes),
        );
        expect(analysis.styling?.approach).toBe(fixture.styling);
        expect(proposal.essence?.dna?.theme?.id).toBe('existing');
        if (['nextjs', 'nuxt', 'svelte'].includes(fixture.framework)) {
          expect(proposal.essence?.meta?.platform?.type).toBe('ssr');
        }
        expect(proposal.evidence?.semanticSectionCount).toBeGreaterThanOrEqual(1);
        expect(proposal.essence?.blueprint?.sections?.map((section) => section.id)).toEqual(
          expect.arrayContaining(fixture.sections),
        );
        for (const route of fixture.routes) {
          expect(proposal.essence?.blueprint?.routes?.[route]).toBeTruthy();
        }
        expect(JSON.stringify(proposal)).not.toContain('luminarum');
        expect(JSON.stringify(proposal)).not.toContain('home:hero');
      }
    },
    corpusObservationTimeoutMs,
  );

  it('keeps monorepo app roots explicit for brownfield analysis', () => {
    writeFileSync(join(testDir, 'pnpm-workspace.yaml'), 'packages:\n  - apps/*\n');
    writeJson(join(testDir, 'package.json'), { private: true, workspaces: ['apps/*'] });
    mkdirp(join(testDir, 'apps', 'web', 'src', 'app', 'dashboard'));
    mkdirp(join(testDir, 'apps', 'admin'));
    writeJson(join(testDir, 'apps', 'web', 'package.json'), {
      name: 'web',
      dependencies: { next: '^15.0.0', react: '^19.0.0', 'react-dom': '^19.0.0' },
    });
    writeFileSync(join(testDir, 'apps', 'web', 'next.config.ts'), 'export default {};\n');
    writeFileSync(
      join(testDir, 'apps', 'web', 'src', 'app', 'dashboard', 'page.tsx'),
      'export default function Page() { return null; }\n',
    );
    writeJson(join(testDir, 'apps', 'admin', 'package.json'), {
      name: 'admin',
      dependencies: { '@angular/core': '^19.0.0' },
    });
    writeJson(join(testDir, 'apps', 'admin', 'angular.json'), { version: 1, projects: {} });

    try {
      execSync(`node ${cliPath} analyze`, { cwd: testDir, stdio: 'pipe' });
      throw new Error('Expected workspace root analyze to require --project.');
    } catch (error) {
      const output = `${(error as { stdout?: Buffer }).stdout?.toString() ?? ''}\n${
        (error as { stderr?: Buffer }).stderr?.toString() ?? ''
      }`;
      expect(output).toContain('decantr analyze needs an app path.');
      expect(output).toContain('decantr adopt --project apps/web --yes');
    }

    execSync(`node ${cliPath} analyze --project=apps/web`, { cwd: testDir, stdio: 'pipe' });

    const analysis = readJson<{
      project?: { projectScope?: string; workspaceRoot?: string; appRoot?: string };
      routes?: { routes?: Array<{ path: string }> };
    }>(join(testDir, 'apps', 'web', '.decantr', 'analysis.json'));

    expect(analysis.project?.projectScope).toBe('workspace-app');
    expect(analysis.project?.workspaceRoot).toBe(realpathSync(testDir));
    expect(analysis.project?.appRoot).toBe(realpathSync(join(testDir, 'apps', 'web')));
    expect(analysis.routes?.routes?.map((route) => route.path)).toContain('/dashboard');
  });

  it('flags stale Decantr installs and contradictory doctrine as proposal evidence, not defaults', () => {
    writeJson(join(testDir, 'package.json'), {
      name: 'stale-decantr-next',
      dependencies: { next: '^15.0.0', react: '^19.0.0', 'react-dom': '^19.0.0' },
    });
    writeFileSync(join(testDir, 'next.config.ts'), 'export default {};\n');
    mkdirp(join(testDir, 'src', 'app', 'dashboard'));
    mkdirp(join(testDir, 'docs'));
    writeFileSync(
      join(testDir, 'src', 'app', 'dashboard', 'page.tsx'),
      'export default function Page() { return null; }\n',
    );
    writeFileSync(join(testDir, 'CLAUDE.md'), 'Next.js App Router is the current runtime.\n');
    writeFileSync(join(testDir, '.cursorrules'), 'This project is SvelteKit; use src/routes.\n');
    writeFileSync(
      join(testDir, 'docs', 'architecture.md'),
      'This project is Angular with Bootstrap.\n',
    );
    writeJson(join(testDir, 'decantr.essence.json'), {
      version: '2.0.0',
      dna: { theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' } },
      structure: [{ id: 'home', layout: ['hero'] }],
    });

    execSync(`node ${cliPath} analyze`, { cwd: testDir, stdio: 'pipe' });

    const ambient = readJson<{
      items: Array<{ path: string }>;
      conflicts: string[];
      staleRisks: string[];
    }>(join(testDir, '.decantr', 'ambient-context.json'));
    const doctrine = readJson<{
      resolutions: Array<{ kind: string; issue: string; preferredSources: string[] }>;
    }>(join(testDir, '.decantr', 'doctrine-map.json'));
    const proposal = readJson<{
      essence?: { dna?: { theme?: { id?: string } } };
    }>(join(testDir, '.decantr', 'observed-essence.proposal.json'));
    const report = readFileSync(join(testDir, '.decantr', 'brownfield-report.md'), 'utf-8');

    expect(ambient.items.some((item) => item.path === 'decantr.essence.json')).toBe(true);
    expect(
      ambient.conflicts.some((conflict) => conflict.includes('Multiple framework doctrines')),
    ).toBe(true);
    expect(ambient.staleRisks.some((risk) => risk.includes('decantr.essence.json uses'))).toBe(
      true,
    );
    expect(doctrine.resolutions.some((resolution) => resolution.kind === 'conflict')).toBe(true);
    expect(doctrine.resolutions.some((resolution) => resolution.kind === 'stale-risk')).toBe(true);
    expect(proposal.essence?.dna?.theme?.id).toBe('existing');
    expect(JSON.stringify(proposal)).not.toContain('luminarum');
    expect(report).toContain('Doctrine Resolution Suggestions');

    try {
      execSync(`node ${cliPath} init --existing --accept-proposal`, {
        cwd: testDir,
        stdio: 'pipe',
      });
      throw new Error('Expected accept-proposal to refuse an existing essence.');
    } catch (error) {
      const output = `${(error as { stdout?: Buffer }).stdout?.toString() ?? ''}\n${
        (error as { stderr?: Buffer }).stderr?.toString() ?? ''
      }`;
      expect(output).toContain('Refusing to accept proposal over an existing decantr.essence.json');
    }
  });
});
