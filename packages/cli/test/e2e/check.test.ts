import { execSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('check command (e2e)', () => {
  let testDir: string;
  const cliPath = join(__dirname, '..', '..', 'dist', 'bin.js');

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-check-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('uses local registry cache for pattern guard validation', () => {
    mkdirSync(join(testDir, '.decantr', 'cache', '@official', 'patterns'), { recursive: true });
    mkdirSync(join(testDir, '.decantr', 'cache', '@official', 'themes'), { recursive: true });

    writeFileSync(
      join(testDir, '.decantr', 'cache', '@official', 'patterns', 'hero.json'),
      JSON.stringify(
        {
          id: 'hero',
          name: 'Hero',
          version: '1.0.0',
        },
        null,
        2,
      ),
    );
    writeFileSync(
      join(testDir, '.decantr', 'cache', '@official', 'themes', 'luminarum.json'),
      JSON.stringify(
        {
          id: 'luminarum',
          modes: ['dark', 'light'],
          version: '1.0.0',
        },
        null,
        2,
      ),
    );

    writeFileSync(
      join(testDir, 'decantr.essence.json'),
      JSON.stringify(
        {
          version: '4.0.0',
          dna: {
            theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
            spacing: {
              base_unit: 4,
              scale: 'linear',
              density: 'comfortable',
              content_gap: '_gap4',
            },
            typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
            color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
            radius: { philosophy: 'rounded', base: 8 },
            elevation: { system: 'layered', max_levels: 3 },
            motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
            accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
            personality: ['clean'],
          },
          blueprint: {
            sections: [
              {
                id: 'marketing',
                role: 'public',
                shell: 'top-nav-footer',
                features: [],
                description: 'Marketing surface',
                pages: [{ id: 'home', route: '/', layout: ['hero'] }],
              },
            ],
            features: [],
            routes: {
              '/': { section: 'marketing', page: 'home' },
            },
          },
          meta: {
            archetype: 'marketing',
            target: 'react',
            platform: { type: 'spa', routing: 'hash' },
            guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
          },
        },
        null,
        2,
      ),
    );

    const output = execSync(`node ${cliPath} check`, {
      cwd: testDir,
      encoding: 'utf-8',
      timeout: 15000,
      env: { ...process.env, DECANTR_OFFLINE: 'true' },
    });

    expect(output).not.toContain('[pattern-exists]');
    expect(output).toContain('No issues found. Project is healthy.');
  });

  it('fails brownfield check when observed routes are missing from the essence', () => {
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify(
        {
          name: 'route-drift-app',
          dependencies: {
            react: '^19.0.0',
            'react-dom': '^19.0.0',
            'react-router-dom': '^7.0.0',
          },
        },
        null,
        2,
      ),
    );
    mkdirSync(join(testDir, 'src'), { recursive: true });
    writeFileSync(
      join(testDir, 'src', 'App.tsx'),
      'import { Routes, Route } from "react-router-dom";\nexport function App() { return <Routes><Route path="/dashboard" element={<main />} /><Route path="/settings" element={<main />} /></Routes>; }\n',
    );
    writeFileSync(
      join(testDir, 'decantr.essence.json'),
      JSON.stringify(
        {
          version: '4.0.0',
          dna: {
            theme: { id: 'existing', mode: 'auto', shape: 'rounded' },
            spacing: {
              base_unit: 4,
              scale: 'linear',
              density: 'comfortable',
              content_gap: '_gap4',
            },
            typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
            color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
            radius: { philosophy: 'rounded', base: 8 },
            elevation: { system: 'layered', max_levels: 3 },
            motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
            accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
            personality: ['observed'],
          },
          blueprint: {
            sections: [
              {
                id: 'observed-primary',
                role: 'primary',
                shell: 'sidebar-main',
                features: [],
                description: 'Observed app',
                pages: [{ id: 'home', route: '/', layout: ['existing-surface'] }],
              },
            ],
            features: [],
            routes: { '/': { section: 'observed-primary', page: 'home' } },
          },
          meta: {
            archetype: 'observed-brownfield',
            target: 'react',
            platform: { type: 'spa', routing: 'history' },
            guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
          },
        },
        null,
        2,
      ),
    );

    try {
      execSync(`node ${cliPath} check --brownfield`, {
        cwd: testDir,
        encoding: 'utf-8',
        timeout: 15000,
      });
      throw new Error('Expected brownfield check to fail.');
    } catch (error) {
      const output = `${(error as { stdout?: Buffer }).stdout?.toString() ?? ''}\n${
        (error as { stderr?: Buffer }).stderr?.toString() ?? ''
      }`;
      expect(output).toContain('[brownfield-route-drift]');
      expect(output).toContain('/dashboard');
      expect(output).toContain('/settings');
    }
  });

  it('treats query-string route variants as states of an observed pathname', () => {
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify(
        {
          name: 'query-state-routes',
          dependencies: {
            react: '^19.0.0',
            'react-dom': '^19.0.0',
            'react-router-dom': '^7.0.0',
          },
        },
        null,
        2,
      ),
    );
    mkdirSync(join(testDir, 'src'), { recursive: true });
    writeFileSync(
      join(testDir, 'src', 'App.tsx'),
      'import { Routes, Route } from "react-router-dom";\nexport function App() { return <Routes><Route path="/" element={<main />} /><Route path="/login" element={<main />} /></Routes>; }\n',
    );
    writeFileSync(
      join(testDir, 'decantr.essence.json'),
      JSON.stringify(
        {
          version: '4.0.0',
          dna: {
            theme: { id: 'existing', mode: 'auto', shape: 'rounded' },
            spacing: {
              base_unit: 4,
              scale: 'linear',
              density: 'comfortable',
              content_gap: '_gap4',
            },
            typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
            color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
            radius: { philosophy: 'rounded', base: 8 },
            elevation: { system: 'layered', max_levels: 3 },
            motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
            accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
            personality: ['observed'],
          },
          blueprint: {
            sections: [
              {
                id: 'auth-flow',
                role: 'gateway',
                shell: 'centered',
                features: ['auth'],
                description: 'Observed auth surface',
                pages: [
                  { id: 'home', route: '/', layout: ['existing-surface'] },
                  { id: 'login', route: '/login', layout: ['existing-surface'] },
                  {
                    id: 'register',
                    route: '/login?mode=register',
                    layout: ['existing-surface'],
                  },
                ],
              },
            ],
            features: ['auth'],
            routes: {
              '/': { section: 'auth-flow', page: 'home' },
              '/login': { section: 'auth-flow', page: 'login' },
              '/login?mode=register': { section: 'auth-flow', page: 'register' },
            },
          },
          meta: {
            archetype: 'observed-brownfield',
            target: 'react',
            platform: { type: 'spa', routing: 'history' },
            guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
          },
        },
        null,
        2,
      ),
    );

    const output = execSync(`node ${cliPath} check --brownfield`, {
      cwd: testDir,
      encoding: 'utf-8',
      timeout: 15000,
    });

    expect(output).not.toContain('[brownfield-stale-route]');
    expect(output).not.toContain('[brownfield-route-drift]');
  });

  it('treats pathname root fallbacks as an observed SPA root route', () => {
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify(
        {
          name: 'pathname-root-fallback',
          dependencies: {
            react: '^19.0.0',
            'react-dom': '^19.0.0',
          },
        },
        null,
        2,
      ),
    );
    mkdirSync(join(testDir, 'src'), { recursive: true });
    writeFileSync(
      join(testDir, 'src', 'App.jsx'),
      'export function App() { const path = typeof window === "undefined" ? "/" : window.location.pathname; return <main><a href="/reports">Reports</a>{path}</main>; }\n',
    );
    writeFileSync(
      join(testDir, 'decantr.essence.json'),
      JSON.stringify(
        {
          version: '4.0.0',
          dna: {
            theme: { id: 'existing', mode: 'auto', shape: 'rounded' },
            spacing: {
              base_unit: 4,
              scale: 'linear',
              density: 'comfortable',
              content_gap: '_gap4',
            },
            typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
            color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
            radius: { philosophy: 'rounded', base: 8 },
            elevation: { system: 'layered', max_levels: 3 },
            motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
            accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
            personality: ['observed'],
          },
          blueprint: {
            sections: [
              {
                id: 'workspace',
                role: 'primary',
                shell: 'top-nav-main',
                features: ['reports'],
                description: 'Observed SPA surface',
                pages: [
                  { id: 'home', route: '/', layout: ['existing-surface'] },
                  { id: 'reports', route: '/reports', layout: ['existing-surface'] },
                ],
              },
            ],
            features: ['reports'],
            routes: {
              '/': { section: 'workspace', page: 'home' },
              '/reports': { section: 'workspace', page: 'reports' },
            },
          },
          meta: {
            archetype: 'observed-brownfield',
            target: 'react',
            platform: { type: 'spa', routing: 'history' },
            guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
          },
        },
        null,
        2,
      ),
    );

    const output = execSync(`node ${cliPath} check --brownfield`, {
      cwd: testDir,
      encoding: 'utf-8',
      timeout: 15000,
    });

    expect(output).not.toContain('[brownfield-stale-route]');
    expect(output).not.toContain('[brownfield-route-drift]');
  });

  it('reports unsafe brownfield defaults and doctrine conflicts for style-heavy apps', () => {
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify(
        {
          name: 'style-heavy-brownfield',
          dependencies: {
            react: '^19.0.0',
            tailwindcss: '^4.0.0',
          },
        },
        null,
        2,
      ),
    );
    writeFileSync(join(testDir, 'tailwind.config.ts'), 'export default {};\n');
    mkdirSync(join(testDir, '.decantr'), { recursive: true });
    mkdirSync(join(testDir, 'docs'), { recursive: true });
    writeFileSync(
      join(testDir, '.decantr', 'project.json'),
      JSON.stringify(
        {
          initialized: {
            workflowMode: 'brownfield-attach',
            adoptionMode: 'contract-only',
          },
        },
        null,
        2,
      ),
    );
    writeFileSync(join(testDir, 'CLAUDE.md'), 'Tailwind classes are canonical.\n');
    writeFileSync(
      join(testDir, 'docs', 'design-system.md'),
      'Do not use Tailwind for app surfaces.\n',
    );
    writeFileSync(
      join(testDir, 'decantr.essence.json'),
      JSON.stringify(
        {
          version: '4.0.0',
          dna: {
            theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
            spacing: {
              base_unit: 4,
              scale: 'linear',
              density: 'comfortable',
              content_gap: '_gap4',
            },
            typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
            color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
            radius: { philosophy: 'rounded', base: 8 },
            elevation: { system: 'layered', max_levels: 3 },
            motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
            accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
            personality: ['legacy'],
          },
          blueprint: {
            sections: [
              {
                id: 'legacy',
                role: 'primary',
                shell: 'top-nav-main',
                features: [],
                description: 'Legacy surface',
                pages: [{ id: 'home', route: '/', layout: ['existing-surface'] }],
              },
            ],
            features: [],
            routes: { '/': { section: 'legacy', page: 'home' } },
          },
          meta: {
            archetype: 'legacy',
            target: 'react',
            platform: { type: 'spa', routing: 'history' },
            guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
          },
        },
        null,
        2,
      ),
    );

    const output = execSync(`node ${cliPath} check --brownfield`, {
      cwd: testDir,
      encoding: 'utf-8',
      timeout: 15000,
    });

    expect(output).toContain('[brownfield-theme-default]');
    expect(output).toContain('[brownfield-doctrine-conflict]');
    expect(output).toContain('[brownfield-doctrine-map-missing]');
    expect(output).toContain('[brownfield-doctrine-coverage]');
    expect(output).toContain('[brownfield-assistant-bridge-missing]');
  });

  it('does not treat current database migrations as stale doctrine noise', () => {
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify(
        {
          name: 'migration-backed-brownfield',
          dependencies: {
            next: '^15.0.0',
            react: '^19.0.0',
            'react-dom': '^19.0.0',
            '@supabase/supabase-js': '^2.0.0',
          },
        },
        null,
        2,
      ),
    );
    writeFileSync(join(testDir, 'next.config.ts'), 'export default {};\n');
    mkdirSync(join(testDir, 'src', 'app', 'dashboard'), { recursive: true });
    mkdirSync(join(testDir, 'supabase', 'migrations'), { recursive: true });
    writeFileSync(
      join(testDir, 'src', 'app', 'dashboard', 'page.tsx'),
      'export default function Page() { return null; }\n',
    );
    writeFileSync(
      join(testDir, 'supabase', 'migrations', '0001_profiles.sql'),
      'create table profiles(id uuid primary key);\n',
    );

    execSync(`node ${cliPath} analyze`, { cwd: testDir, stdio: 'pipe' });
    execSync(`node ${cliPath} init --existing --accept-proposal`, { cwd: testDir, stdio: 'pipe' });

    const output = execSync(`node ${cliPath} check --brownfield`, {
      cwd: testDir,
      encoding: 'utf-8',
      timeout: 15000,
    });

    expect(output).toContain('No issues found. Project is healthy.');
    expect(output).not.toContain('stale');
    expect(output).not.toContain('historical');
  });
});
