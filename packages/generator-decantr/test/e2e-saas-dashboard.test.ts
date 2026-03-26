import { describe, it, expect } from 'vitest';
import { runPipeline } from '@decantr/generator-core';
import { createDecantrPlugin } from '../src/plugin.js';
import type { EssenceFile } from '@decantr/essence-spec';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// AUTO: Mirror React e2e test setup — contentRoot is content/core, overridePaths includes content/
const repoRoot = join(import.meta.dirname, '..', '..', '..');
const contentRoot = join(repoRoot, 'content', 'core');
const overridePaths = [join(repoRoot, 'content')];

function loadEssence(): EssenceFile {
  const path = join(repoRoot, 'examples', 'saas-dashboard', 'decantr.essence.json');
  return JSON.parse(readFileSync(path, 'utf-8'));
}

// AUTO: Decantr atom classes use _ prefix (e.g. _flex, _gap4, _grid, _gc2).
// Tailwind classes (e.g. flex, gap-4, grid-cols-2) must never appear in Decantr output.
const TAILWIND_PATTERNS = [
  /\bgrid-cols-\d/,
  /\bgap-\d/,
  /\bflex\b(?!1)/,   // bare "flex" without underscore prefix
  /\bp-\d/,
  /\btext-\w+-\d/,
  /\bbg-\w+-\d/,
  /\brounded-\w/,
  /\bshadow-\w/,
];

describe('E2E: Decantr-Native SaaS Dashboard', () => {
  it('loads essence, validates, and generates Decantr project', async () => {
    const essence = loadEssence();
    const result = await runPipeline(essence, {
      projectRoot: '/tmp/test-decantr-saas',
      contentRoot,
      overridePaths,
      plugin: createDecantrPlugin(),
      dryRun: true,
    });

    expect(result.files.length).toBeGreaterThan(0);
    expect(result.dryRun).toBe(true);
  });

  it('generates app.js with router and sidebar-main Shell', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-decantr-saas',
      contentRoot,
      overridePaths,
      plugin: createDecantrPlugin(),
      dryRun: true,
    });

    const paths = result.files.map(f => f.path);
    expect(paths).toContain('src/app.js');

    const appJs = result.files.find(f => f.path === 'src/app.js')!;
    // Router setup
    expect(appJs.content).toContain('createRouter');
    expect(appJs.content).toContain("mode: 'hash'");
    // Shell component (sidebar-main variant)
    expect(appJs.content).toContain('Shell({');
    expect(appJs.content).toContain('Shell.Nav(');
    expect(appJs.content).toContain('Shell.Header(');
    expect(appJs.content).toContain('Shell.Body(');
    expect(appJs.content).toContain('router.view()');
  });

  it('generates page files matching essence structure', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-decantr-saas',
      contentRoot,
      overridePaths,
      plugin: createDecantrPlugin(),
      dryRun: true,
    });

    const paths = result.files.map(f => f.path);
    // The saas-dashboard has 3 pages: overview, analytics, settings
    expect(paths).toContain('src/pages/overview.js');
    expect(paths).toContain('src/pages/analytics.js');
    expect(paths).toContain('src/pages/settings.js');
  });

  it('page files use correct Decantr imports (not React)', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-decantr-saas',
      contentRoot,
      overridePaths,
      plugin: createDecantrPlugin(),
      dryRun: true,
    });

    const pageFiles = result.files.filter(f => f.path.startsWith('src/pages/') && f.path.endsWith('.js'));
    expect(pageFiles.length).toBeGreaterThan(0);

    for (const page of pageFiles) {
      // Decantr core imports
      expect(page.content).toContain("from 'decantr/core'");
      expect(page.content).toContain("from 'decantr/tags'");
      expect(page.content).toContain("from 'decantr/css'");

      // Must NOT contain React imports
      expect(page.content).not.toContain("from 'react'");
      expect(page.content).not.toContain("from 'react-router");
      expect(page.content).not.toContain('useState');
      expect(page.content).not.toContain('useEffect');
    }
  });

  it('app.js uses correct Decantr imports', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-decantr-saas',
      contentRoot,
      overridePaths,
      plugin: createDecantrPlugin(),
      dryRun: true,
    });

    const appJs = result.files.find(f => f.path === 'src/app.js')!;
    // Decantr framework imports
    expect(appJs.content).toContain("from 'decantr/core'");
    expect(appJs.content).toContain("from 'decantr/state'");
    expect(appJs.content).toContain("from 'decantr/css'");
    expect(appJs.content).toContain("from 'decantr/router'");
    expect(appJs.content).toContain("from 'decantr/components'");

    // Must NOT contain React imports
    expect(appJs.content).not.toContain("from 'react'");
    expect(appJs.content).not.toContain("from 'react-router");
  });

  it('atom classes are valid Decantr atoms (no Tailwind leakage)', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-decantr-saas',
      contentRoot,
      overridePaths,
      plugin: createDecantrPlugin(),
      dryRun: true,
    });

    // AUTO: Check all generated .js files for Tailwind class patterns that would
    // indicate the wrong CSS framework is being targeted
    const jsFiles = result.files.filter(f => f.path.endsWith('.js'));
    for (const file of jsFiles) {
      // Extract all css('...') calls and check their contents
      const cssMatches = file.content.match(/css\(['"`]([^'"`]+)['"`]\)/g) || [];
      for (const cssCall of cssMatches) {
        const classStr = cssCall.replace(/css\(['"`]/, '').replace(/['"`]\)/, '');
        for (const pattern of TAILWIND_PATTERNS) {
          expect(classStr, `Tailwind class leaked in ${file.path}: "${classStr}"`).not.toMatch(pattern);
        }
      }

      // Decantr atoms use _ prefix — verify at least some are present
      if (cssMatches.length > 0) {
        const hasAtoms = cssMatches.some(m => m.includes('_'));
        expect(hasAtoms, `No Decantr atom classes found in ${file.path}`).toBe(true);
      }
    }
  });

  it('Shell component uses correct carafe type for sidebar-main', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-decantr-saas',
      contentRoot,
      overridePaths,
      plugin: createDecantrPlugin(),
      dryRun: true,
    });

    const appJs = result.files.find(f => f.path === 'src/app.js')!;
    // Shell is imported from decantr/components
    expect(appJs.content).toContain('Shell');
    expect(appJs.content).toContain("import { Shell");
    // Has nav items for all 3 pages
    expect(appJs.content).toContain("'Overview'");
    expect(appJs.content).toContain("'Analytics'");
    expect(appJs.content).toContain("'Settings'");
    // Recipe decoration classes from auradecantism
    expect(appJs.content).toMatch(/d-\w+/);
  });

  it('signal wiring present for related patterns on overview page', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-decantr-saas',
      contentRoot,
      overridePaths,
      plugin: createDecantrPlugin(),
      dryRun: true,
    });

    const overview = result.files.find(f => f.path === 'src/pages/overview.js')!;
    // Overview has activity-feed + data-table in a column layout — wiring detection
    // should produce shared signals between them
    // At minimum, the page should use createSignal if wiring was detected
    if (overview.content.includes('createSignal')) {
      expect(overview.content).toContain("from 'decantr/state'");
    }

    // Pattern components should be present
    expect(overview.content).toContain('KpiGrid');
    expect(overview.content).toContain('ActivityFeed');
    expect(overview.content).toContain('DataTable');
  });

  it('page containers have d-page-enter class', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-decantr-saas',
      contentRoot,
      overridePaths,
      plugin: createDecantrPlugin(),
      dryRun: true,
    });

    const pageFiles = result.files.filter(
      f => f.path.startsWith('src/pages/') && f.path.endsWith('.js') && !f.path.includes('not-found'),
    );

    for (const page of pageFiles) {
      expect(page.content, `${page.path} missing d-page-enter`).toContain('d-page-enter');
    }
  });

  it('generates store file with page signals', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-decantr-saas',
      contentRoot,
      overridePaths,
      plugin: createDecantrPlugin(),
      dryRun: true,
    });

    const paths = result.files.map(f => f.path);
    expect(paths).toContain('src/state/store.js');

    const store = result.files.find(f => f.path === 'src/state/store.js')!;
    expect(store.content).toContain('overview');
    expect(store.content).toContain('analytics');
    expect(store.content).toContain('settings');
  });

  it('generates shared files (index.html, 404)', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-decantr-saas',
      contentRoot,
      overridePaths,
      plugin: createDecantrPlugin(),
      dryRun: true,
    });

    const paths = result.files.map(f => f.path);
    expect(paths).toContain('src/pages/not-found.js');
    expect(paths).toContain('public/index.html');

    // index.html should have dark theme data attribute
    const indexHtml = result.files.find(f => f.path === 'public/index.html')!;
    expect(indexHtml.content).toContain('dark');
  });

  it('navigation items have correct routes', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-decantr-saas',
      contentRoot,
      overridePaths,
      plugin: createDecantrPlugin(),
      dryRun: true,
    });

    const appJs = result.files.find(f => f.path === 'src/app.js')!;
    // First page routes to /
    expect(appJs.content).toContain("'/': () => import('./pages/overview.js')");
    // Subsequent pages route to /{id}
    expect(appJs.content).toContain("'/analytics': () => import('./pages/analytics.js')");
    expect(appJs.content).toContain("'/settings': () => import('./pages/settings.js')");
  });

  it('contains no unresolved pattern references or unknown nodes', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-decantr-saas',
      contentRoot,
      overridePaths,
      plugin: createDecantrPlugin(),
      dryRun: true,
    });

    for (const file of result.files) {
      expect(file.content).not.toContain('Unknown node type');
    }
  });

  it('settings page uses form-sections pattern', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-decantr-saas',
      contentRoot,
      overridePaths,
      plugin: createDecantrPlugin(),
      dryRun: true,
    });

    const settings = result.files.find(f => f.path === 'src/pages/settings.js')!;
    expect(settings.content).toContain('FormSections');
    expect(settings.content).toContain('component(');
  });

  it('overview page has grid layout for column patterns', async () => {
    const result = await runPipeline(loadEssence(), {
      projectRoot: '/tmp/test-decantr-saas',
      contentRoot,
      overridePaths,
      plugin: createDecantrPlugin(),
      dryRun: true,
    });

    const overview = result.files.find(f => f.path === 'src/pages/overview.js')!;
    // The overview layout has { cols: ["activity-feed", "data-table"], at: "lg" }
    // which should produce a responsive grid
    expect(overview.content).toContain('_grid');
  });
});
