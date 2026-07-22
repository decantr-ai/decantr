import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { EssenceV4 } from '@decantr/essence-spec';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { scanBrownfieldIssues } from '../src/brownfield-check.js';

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

function essenceForRoutes(routes: string[], shell: string): EssenceV4 {
  return {
    version: '4.0.0',
    dna: {
      theme: { id: 'existing', mode: 'light' },
      spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '4' },
      typography: { scale: 'system', heading_weight: 600, body_weight: 400 },
      color: { palette: 'existing', accent_count: 1, cvd_preference: 'auto' },
      radius: { philosophy: 'rounded', base: 8 },
      elevation: { system: 'existing', max_levels: 3 },
      motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
      accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: false },
      personality: ['observed app'],
    },
    blueprint: {
      features: [],
      sections: [
        {
          id: 'app',
          role: 'public',
          shell,
          features: [],
          description: 'Existing app',
          pages: routes.map((route, index) => ({
            id: `route-${index + 1}`,
            route,
            layout: ['observed-route'],
          })),
        },
      ],
      routes: Object.fromEntries(
        routes.map((route, index) => [route, { section: 'app', page: `route-${index + 1}` }]),
      ),
    },
    meta: {
      archetype: 'observed-brownfield',
      target: 'react',
      platform: { type: 'spa', routing: 'history' },
      guard: { mode: 'guided', dna_enforcement: 'warn', blueprint_enforcement: 'warn' },
    },
  } as EssenceV4;
}

describe('brownfield shell drift', () => {
  let projectRoot = '';

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), 'decantr-brownfield-check-'));
    mkdirSync(join(projectRoot, 'src', 'components'), { recursive: true });
    writeJson(join(projectRoot, 'package.json'), {
      dependencies: {
        '@vitejs/plugin-react': '^5.0.0',
        react: '^19.0.0',
        'react-dom': '^19.0.0',
        'react-router-dom': '^7.0.0',
      },
    });
    writeFileSync(
      join(projectRoot, 'src', 'main.tsx'),
      'import { App } from "./App";\nexport { App };\n',
      'utf-8',
    );
  });

  afterEach(() => {
    rmSync(projectRoot, { recursive: true, force: true });
  });

  it('does not treat a generic React Router AppShell wrapper as protected shell drift', () => {
    writeFileSync(
      join(projectRoot, 'src', 'components', 'AppShell.tsx'),
      'export function AppShell(props) { return <div className="app-shell">{props.children}</div>; }\n',
      'utf-8',
    );
    writeFileSync(
      join(projectRoot, 'src', 'App.tsx'),
      `import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';

export function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<main>Home</main>} />
          <Route path="/pricing" element={<main>Pricing</main>} />
          <Route path="/settings" element={<main>Settings</main>} />
          <Route path="/support" element={<main>Support</main>} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
`,
      'utf-8',
    );

    const issues = scanBrownfieldIssues(
      projectRoot,
      essenceForRoutes(['/', '/pricing', '/settings', '/support'], 'main-only'),
    );

    expect(issues.some((issue) => issue.rule === 'brownfield-shell-drift')).toBe(false);
  });

  it('still reports explicit protected app-frame signals on public shell routes', () => {
    writeFileSync(
      join(projectRoot, 'src', 'App.tsx'),
      `import { BrowserRouter, Route, Routes } from 'react-router-dom';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/pricing" element={<main className="app-frame">Pricing</main>} />
      </Routes>
    </BrowserRouter>
  );
}
`,
      'utf-8',
    );

    const issues = scanBrownfieldIssues(projectRoot, essenceForRoutes(['/pricing'], 'main-only'));

    expect(issues.find((issue) => issue.rule === 'brownfield-shell-drift')).toMatchObject({
      type: 'warning',
    });
  });
});
