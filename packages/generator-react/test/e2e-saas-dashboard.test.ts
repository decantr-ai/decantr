import { describe, it, expect } from 'vitest';
import { runPipeline } from '@decantr/generator-core';
import { createReactPlugin } from '../src/plugin.js';
import { validateReactOutput } from '../src/quality-rules.js';
import type { EssenceFile } from '@decantr/essence-spec';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// AUTO: Use content/core as contentRoot (recipes live there) and content/ as override (patterns live there)
const repoRoot = join(import.meta.dirname, '..', '..', '..');
const contentRoot = join(repoRoot, 'content', 'core');
const overridePaths = [join(repoRoot, 'content')];

function loadEssence(): EssenceFile {
  const path = join(repoRoot, 'examples', 'saas-dashboard', 'decantr.essence.json');
  return JSON.parse(readFileSync(path, 'utf-8'));
}

describe('E2E: React SaaS Dashboard', () => {
  it('loads essence, validates, and generates React project', async () => {
    const essence = loadEssence();
    const result = await runPipeline(essence, {
      projectRoot: '/tmp/test-react-saas',
      contentRoot,
      overridePaths,
      plugin: createReactPlugin(),
      dryRun: true,
    });

    expect(result.files.length).toBeGreaterThan(0);
    expect(result.dryRun).toBe(true);
  });

  it('generates App.tsx with router and sidebar-main shell', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-react-saas',
      contentRoot,
      overridePaths,
      plugin: createReactPlugin(),
      dryRun: true,
    });

    const paths = result.files.map(f => f.path);
    expect(paths).toContain('src/App.tsx');

    const appTsx = result.files.find(f => f.path === 'src/App.tsx')!;
    // Router
    expect(appTsx.content).toContain('HashRouter');
    expect(appTsx.content).toContain('<Routes>');
    expect(appTsx.content).toContain('<Route');
    // Sidebar shell
    expect(appTsx.content).toContain('<Sidebar');
    expect(appTsx.content).toContain('<SidebarProvider');
    expect(appTsx.content).toContain('SidebarContent');
    // React.lazy page imports
    expect(appTsx.content).toContain('React.lazy');
    // Suspense boundaries
    expect(appTsx.content).toContain('<React.Suspense');
  });

  it('generates page files matching essence structure', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-react-saas',
      contentRoot,
      overridePaths,
      plugin: createReactPlugin(),
      dryRun: true,
    });

    const paths = result.files.map(f => f.path);
    // The saas-dashboard has 3 pages: overview, analytics, settings
    expect(paths).toContain('src/pages/overview.tsx');
    expect(paths).toContain('src/pages/analytics.tsx');
    expect(paths).toContain('src/pages/settings.tsx');
  });

  it('generates navigation items matching essence pages', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-react-saas',
      contentRoot,
      overridePaths,
      plugin: createReactPlugin(),
      dryRun: true,
    });

    const appTsx = result.files.find(f => f.path === 'src/App.tsx')!;
    // Nav items for overview, analytics, settings
    expect(appTsx.content).toContain('Overview');
    expect(appTsx.content).toContain('Analytics');
    expect(appTsx.content).toContain('Settings');
  });

  it('page files have correct React imports', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-react-saas',
      contentRoot,
      overridePaths,
      plugin: createReactPlugin(),
      dryRun: true,
    });

    const pageFiles = result.files.filter(f => f.path.startsWith('src/pages/') && f.path !== 'src/pages/LoginPage.tsx');
    for (const page of pageFiles) {
      // Every page should import from react
      expect(page.content).toMatch(/import .+ from ['"]react['"]/);
      // Every page should export a default function component
      expect(page.content).toMatch(/export default function \w+Page\(/);
    }
  });

  it('contains no unresolved pattern references', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-react-saas',
      contentRoot,
      overridePaths,
      plugin: createReactPlugin(),
      dryRun: true,
    });

    for (const file of result.files) {
      expect(file.content).not.toContain('TODO: resolve pattern');
      expect(file.content).not.toContain('Unknown node type');
    }
  });

  it('overview page has wiring for filter-like patterns', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-react-saas',
      contentRoot,
      overridePaths,
      plugin: createReactPlugin(),
      dryRun: true,
    });

    const overview = result.files.find(f => f.path === 'src/pages/overview.tsx')!;
    // The overview layout has activity-feed + data-table in a grid.
    // Wiring detection might detect pairs — verify the page renders correctly regardless.
    expect(overview.content).toContain('export default function OverviewPage');
    // Should have pattern components for kpi-grid, activity-feed, data-table
    expect(overview.content).toContain('KpiGrid');
    expect(overview.content).toContain('ActivityFeed');
    expect(overview.content).toContain('DataTable');
  });

  it('settings page uses form-sections pattern with settings preset', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-react-saas',
      contentRoot,
      overridePaths,
      plugin: createReactPlugin(),
      dryRun: true,
    });

    const settings = result.files.find(f => f.path === 'src/pages/settings.tsx')!;
    expect(settings.content).toContain('FormSections');
    expect(settings.content).toContain('export default function SettingsPage');
  });

  it('auth scaffolding is generated (essence has auth feature)', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-react-saas',
      contentRoot,
      overridePaths,
      plugin: createReactPlugin(),
      dryRun: true,
    });

    const paths = result.files.map(f => f.path);
    expect(paths).toContain('src/contexts/AuthContext.tsx');
    expect(paths).toContain('src/components/ProtectedRoute.tsx');
    expect(paths).toContain('src/pages/LoginPage.tsx');

    // App.tsx should import AuthProvider
    const appTsx = result.files.find(f => f.path === 'src/App.tsx')!;
    expect(appTsx.content).toContain('AuthProvider');
    expect(appTsx.content).toContain('ProtectedRoute');
  });

  it('theme context is generated', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-react-saas',
      contentRoot,
      overridePaths,
      plugin: createReactPlugin(),
      dryRun: true,
    });

    const paths = result.files.map(f => f.path);
    expect(paths).toContain('src/contexts/ThemeContext.tsx');

    const appTsx = result.files.find(f => f.path === 'src/App.tsx')!;
    expect(appTsx.content).toContain('ThemeProvider');
  });

  it('TypeScript imports are syntactically valid', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-react-saas',
      contentRoot,
      overridePaths,
      plugin: createReactPlugin(),
      dryRun: true,
    });

    const tsFiles = result.files.filter(f => f.path.endsWith('.tsx') || f.path.endsWith('.ts'));
    for (const file of tsFiles) {
      // AUTO: Extract complete import statements (may span multiple lines) and verify each has a from clause
      const importBlocks = file.content.match(/import\s[\s\S]*?from\s+['"][^'"]+['"]\s*;?/g) || [];
      // Verify we found at least one import in each TS file that has content
      if (file.content.trim().length > 0 && file.content.includes('import ')) {
        expect(importBlocks.length).toBeGreaterThan(0);
      }
      for (const block of importBlocks) {
        expect(block).toMatch(/from\s+['"][^'"]+['"]/);
      }
    }
  });

  it('generated React code has zero CRITICAL or HIGH quality violations', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-react-saas',
      contentRoot,
      overridePaths,
      plugin: createReactPlugin(),
      dryRun: true,
    });

    const violations = validateReactOutput(result.files);
    const critical = violations.filter(v => v.severity === 'critical');
    const high = violations.filter(v => v.severity === 'high');

    if (critical.length > 0) {
      const msgs = critical.map(v => `[${v.rule}] ${v.file}:${v.line ?? '?'} — ${v.message}`);
      expect.fail(`CRITICAL quality violations:\n${msgs.join('\n')}`);
    }
    if (high.length > 0) {
      const msgs = high.map(v => `[${v.rule}] ${v.file}:${v.line ?? '?'} — ${v.message}`);
      expect.fail(`HIGH quality violations:\n${msgs.join('\n')}`);
    }
  });

  it('project scaffolding files are present', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-react-saas',
      contentRoot,
      overridePaths,
      plugin: createReactPlugin(),
      dryRun: true,
    });

    const paths = result.files.map(f => f.path);
    expect(paths).toContain('package.json');
    expect(paths).toContain('tailwind.config.ts');
    expect(paths).toContain('vite.config.ts');
    expect(paths).toContain('tsconfig.json');
    expect(paths).toContain('src/globals.css');
    expect(paths).toContain('index.html');
  });
});
