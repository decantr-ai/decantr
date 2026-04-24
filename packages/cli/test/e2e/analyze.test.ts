import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('analyze command', () => {
  let testDir: string;
  const cliPath = join(__dirname, '..', '..', 'dist', 'index.js');

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-analyze-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('writes analysis.json and init-seed.json for brownfield adoption', () => {
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify(
        {
          name: 'brownfield-react',
          private: true,
          dependencies: {
            react: '^19.0.0',
            'react-dom': '^19.0.0',
          },
        },
        null,
        2,
      ) + '\n',
    );
    writeFileSync(
      join(testDir, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: { jsx: 'react-jsx' },
        },
        null,
        2,
      ) + '\n',
    );
    mkdirSync(join(testDir, 'src', 'components'), { recursive: true });
    writeFileSync(
      join(testDir, 'src', 'components', 'Sidebar.tsx'),
      'export function Sidebar() { return <aside />; }\n',
    );
    writeFileSync(
      join(testDir, 'src', 'App.tsx'),
      'export function App() { return <main>Hello</main>; }\n',
    );

    execSync(`node ${cliPath} analyze`, { cwd: testDir, stdio: 'pipe' });

    const analysisPath = join(testDir, '.decantr', 'analysis.json');
    const seedPath = join(testDir, '.decantr', 'init-seed.json');

    expect(existsSync(analysisPath)).toBe(true);
    expect(existsSync(seedPath)).toBe(true);

    const analysis = JSON.parse(readFileSync(analysisPath, 'utf-8')) as {
      decantr?: { workflow?: string; attach?: { recommendedCommand?: string } };
    };
    const seed = JSON.parse(readFileSync(seedPath, 'utf-8')) as {
      workflow?: string;
      target?: string;
      shell?: string;
      existing?: boolean;
      registryOptional?: boolean;
    };

    expect(analysis.decantr?.workflow).toBe('brownfield-adoption');
    expect(analysis.decantr?.attach?.recommendedCommand).toBe('decantr init --existing --yes');
    expect(seed.workflow).toBe('brownfield-adoption');
    expect(seed.target).toBe('react');
    expect(seed.shell).toBe('sidebar-main');
    expect(seed.existing).toBe(true);
    expect(seed.registryOptional).toBe(true);
  });

  it('recognizes React Router and Decantr starter structure in an attached app', () => {
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify(
        {
          name: 'decantr-starter-like',
          private: true,
          dependencies: {
            react: '^19.0.0',
            'react-dom': '^19.0.0',
            'react-router-dom': '^7.0.0',
            '@decantr/css': '^1.0.0',
          },
        },
        null,
        2,
      ) + '\n',
    );

    mkdirSync(join(testDir, 'src', 'styles'), { recursive: true });
    writeFileSync(
      join(testDir, 'src', 'main.tsx'),
      'import { HashRouter } from "react-router-dom";\n',
    );
    writeFileSync(
      join(testDir, 'src', 'App.tsx'),
      'import { Routes, Route } from "react-router-dom";\nexport function App() { return <Routes><Route path="/" element={<main>Hello</main>} /></Routes>; }\n',
    );
    writeFileSync(
      join(testDir, 'src', 'styles', 'global.css'),
      'html.dark { color-scheme: dark; }\n',
    );
    writeFileSync(
      join(testDir, 'src', 'styles', 'tokens.css'),
      ':root { --d-primary: #111827; --d-border: #d1d5db; }\n',
    );
    writeFileSync(
      join(testDir, 'src', 'styles', 'treatments.css'),
      '.d-surface { background: var(--d-primary); }\n',
    );
    writeFileSync(
      join(testDir, 'decantr.essence.json'),
      JSON.stringify(
        {
          version: '3.1.0',
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
                id: 'agent-orchestrator',
                role: 'primary',
                shell: 'sidebar-main',
                features: [],
                description: 'Agent orchestration workspace',
                pages: [{ id: 'home', layout: ['hero'] }],
              },
            ],
            features: [],
            routes: { '/': { section: 'agent-orchestrator', page: 'home' } },
          },
          meta: {
            archetype: 'agent-marketplace',
            target: 'react',
            platform: { type: 'spa', routing: 'hash' },
            guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
          },
        },
        null,
        2,
      ) + '\n',
    );

    execSync(`node ${cliPath} analyze`, { cwd: testDir, stdio: 'pipe' });

    const analysis = JSON.parse(
      readFileSync(join(testDir, '.decantr', 'analysis.json'), 'utf-8'),
    ) as {
      routes?: { strategy?: string; routes?: Array<{ path: string }> };
      components?: { pageCount?: number; componentCount?: number };
      styling?: { approach?: string; darkMode?: boolean; cssVariables?: string[] };
      layout?: { shellPattern?: string };
      dependencies?: { ui?: string[] };
    };

    expect(analysis.routes?.strategy).toBe('react-router');
    expect(analysis.routes?.routes?.some((route) => route.path === '/')).toBe(true);
    expect(analysis.components?.pageCount).toBeGreaterThanOrEqual(1);
    expect(analysis.components?.componentCount).toBeGreaterThanOrEqual(1);
    expect(analysis.styling?.approach).toBe('decantr-css');
    expect(analysis.styling?.darkMode).toBe(true);
    expect(analysis.styling?.cssVariables?.length ?? 0).toBeGreaterThan(0);
    expect(analysis.layout?.shellPattern).toContain('sidebar-main');
    expect(analysis.dependencies?.ui).toContain('react-router-dom');
  });
});
