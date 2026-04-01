import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFile, rm, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { renderToString, ssrH, ssrCss } from '../src/ssr/index.js';

// We test the IR mapper and build logic in isolation, mocking @decantr/core
// since the full pipeline requires content resolution from the filesystem.

// ─── IR Mapper Tests ─────────────────────────────────────────

describe('IR mapper', () => {
  // Import lazily so we can mock @decantr/core before it loads
  let mapIRToVNode: typeof import('../src/build/ir-mapper.js').mapIRToVNode;

  beforeEach(async () => {
    const mod = await import('../src/build/ir-mapper.js');
    mapIRToVNode = mod.mapIRToVNode;
  });

  it('maps a pattern node to a section VNode with data-pattern', () => {
    const patternNode = {
      type: 'pattern' as const,
      id: 'hero-1',
      children: [],
      pattern: {
        patternId: 'hero',
        preset: 'default',
        alias: 'hero-1',
        layout: 'hero',
        contained: false,
        standalone: true,
        code: null,
        components: [],
      },
      card: null,
      visualEffects: null,
      wireProps: { title: 'Hello World' },
    };

    const vnode = renderToString(() => mapIRToVNode(patternNode));
    expect(vnode).toContain('data-pattern="hero"');
    expect(vnode).toContain('data-compose="hero"');
    expect(vnode).toContain('Hello World');
  });

  it('maps a pattern node with card wrapping', () => {
    const patternNode = {
      type: 'pattern' as const,
      id: 'stats-1',
      children: [],
      pattern: {
        patternId: 'stats-bar',
        preset: 'default',
        alias: 'stats-1',
        layout: 'row',
        contained: true,
        standalone: false,
        code: null,
        components: [],
      },
      card: {
        mode: 'always' as const,
        headerLabel: 'Statistics',
        background: undefined,
      },
      visualEffects: null,
      wireProps: null,
    };

    const vnode = renderToString(() => mapIRToVNode(patternNode));
    expect(vnode).toContain('data-pattern="stats-bar"');
    expect(vnode).toContain('d-card');
    expect(vnode).toContain('Statistics');
  });

  it('maps a page node with children', () => {
    const pageNode = {
      type: 'page' as const,
      id: 'home',
      pageId: 'home',
      surface: '_surface',
      wiring: null,
      spatial: { gap: '6' },
      children: [
        {
          type: 'pattern' as const,
          id: 'hero-1',
          children: [],
          pattern: {
            patternId: 'hero',
            preset: 'default',
            alias: 'hero-1',
            layout: 'hero',
            contained: false,
            standalone: true,
            code: null,
            components: [],
          },
          card: null,
          visualEffects: null,
          wireProps: null,
        },
      ],
    };

    const html = renderToString(() => mapIRToVNode(pageNode));
    expect(html).toContain('data-page="home"');
    expect(html).toContain('_gap6');
    expect(html).toContain('data-pattern="hero"');
  });

  it('maps a grid node with columns', () => {
    const gridNode = {
      type: 'grid' as const,
      id: 'grid-1',
      cols: 3,
      spans: null,
      breakpoint: 'md',
      children: [
        {
          type: 'pattern' as const,
          id: 'card-1',
          children: [],
          pattern: {
            patternId: 'feature-card',
            preset: 'default',
            alias: 'card-1',
            layout: 'column',
            contained: false,
            standalone: false,
            code: null,
            components: [],
          },
          card: null,
          visualEffects: null,
          wireProps: null,
        },
      ],
    };

    const html = renderToString(() => mapIRToVNode(gridNode));
    expect(html).toContain('data-grid="3"');
    expect(html).toContain('_grid-cols-3');
    expect(html).toContain('data-pattern="feature-card"');
  });

  it('maps a shell node with sidebar layout', () => {
    const shellNode = {
      type: 'shell' as const,
      id: 'shell',
      children: [],
      config: {
        type: 'sidebar-main',
        brand: 'My App',
        nav: [
          { href: '/', icon: 'home', label: 'Home' },
          { href: '/about', icon: 'info', label: 'About' },
        ],
        inset: false,
        recipe: null,
      },
    };

    const html = renderToString(() => mapIRToVNode(shellNode));
    expect(html).toContain('data-shell="sidebar-main"');
    expect(html).toContain('My App');
    expect(html).toContain('Home');
    expect(html).toContain('About');
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/about"');
  });

  it('maps a full app node with theme attributes', () => {
    const appNode = {
      type: 'app' as const,
      id: 'app',
      children: [],
      theme: {
        style: 'auradecantism',
        mode: 'dark',
        shape: 'rounded',
        recipe: 'default',
        isAddon: false,
      },
      routes: [],
      routing: 'history' as const,
      shell: {
        type: 'shell' as const,
        id: 'shell',
        children: [],
        config: {
          type: 'marketing',
          brand: 'Test',
          nav: [],
          inset: false,
          recipe: null,
        },
      },
      store: {
        type: 'store' as const,
        id: 'store',
        children: [],
        pageSignals: [],
      },
      features: [],
    };

    const html = renderToString(() => mapIRToVNode(appNode));
    expect(html).toContain('data-decantr-app="true"');
    expect(html).toContain('data-theme-style="auradecantism"');
    expect(html).toContain('data-theme-mode="dark"');
  });

  it('maps pattern node with visual effects', () => {
    const patternNode = {
      type: 'pattern' as const,
      id: 'hero-fx',
      children: [],
      pattern: {
        patternId: 'hero',
        preset: 'default',
        alias: 'hero-fx',
        layout: 'hero',
        contained: false,
        standalone: true,
        code: null,
        components: [],
      },
      card: null,
      visualEffects: {
        decorators: ['d-glass', 'd-gradient-hint-primary'],
        intensity: {},
      },
      wireProps: null,
    };

    const html = renderToString(() => mapIRToVNode(patternNode));
    expect(html).toContain('data-effects="d-glass d-gradient-hint-primary"');
  });

  it('maps pattern node with alias different from patternId', () => {
    const patternNode = {
      type: 'pattern' as const,
      id: 'activity-filter',
      children: [],
      pattern: {
        patternId: 'filter-bar',
        preset: 'default',
        alias: 'activity-filter',
        layout: 'row',
        contained: false,
        standalone: false,
        code: null,
        components: [],
      },
      card: null,
      visualEffects: null,
      wireProps: null,
    };

    const html = renderToString(() => mapIRToVNode(patternNode));
    expect(html).toContain('data-pattern="filter-bar"');
    expect(html).toContain('data-alias="activity-filter"');
  });
});

// ─── buildFromEssence Tests ──────────────────────────────────

describe('buildFromEssence', () => {
  const testOutDir = join(import.meta.dirname, 'fixtures', '_test-output');
  const essencePath = join(import.meta.dirname, 'fixtures', 'test-essence.json');

  beforeEach(async () => {
    vi.resetModules();
    // Clean output dir
    if (existsSync(testOutDir)) {
      await rm(testOutDir, { recursive: true });
    }
  });

  it('falls back gracefully when pipeline fails and produces HTML from blueprint', async () => {
    // Mock @decantr/core's runPipeline to throw (simulating missing content)
    vi.doMock('@decantr/core', () => ({
      runPipeline: vi.fn().mockRejectedValue(new Error('Content not found')),
      walkIR: vi.fn(),
      findNodes: vi.fn().mockReturnValue([]),
    }));

    // Re-import to pick up the mock
    const { buildFromEssence } = await import('../src/build/index.js');

    const result = await buildFromEssence({
      essencePath,
      outDir: testOutDir,
    });

    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].pageId).toBe('home');
    expect(result.pages[0].route).toBe('/');
    expect(result.pages[0].html).toContain('data-pattern="hero"');
    expect(result.pages[0].html).toContain('data-pattern="content-section"');
    expect(result.pages[0].html).toContain('data-compose="hero"');
    expect(result.pages[0].html).toContain('data-compose="content-section"');
    expect(result.pages[0].html).toContain('data-theme="auradecantism"');
    expect(result.pages[0].html).toContain('data-mode="dark"');
    expect(result.pages[0].html).toContain('decantr-build-fallback');

    // Verify file was written
    const written = await readFile(join(testOutDir, 'index.html'), 'utf-8');
    expect(written).toBe(result.pages[0].html);
  });

  it('uses page filter to build only specified pages', async () => {
    vi.doMock('@decantr/core', () => ({
      runPipeline: vi.fn().mockRejectedValue(new Error('Content not found')),
      walkIR: vi.fn(),
      findNodes: vi.fn().mockReturnValue([]),
    }));

    const { buildFromEssence } = await import('../src/build/index.js');

    const result = await buildFromEssence({
      essencePath,
      outDir: testOutDir,
      pages: ['nonexistent'],
    });

    // Should return empty since 'nonexistent' is not in the blueprint
    expect(result.pages).toHaveLength(0);
  });

  it('builds pages from IR when pipeline succeeds', async () => {
    const mockIR = {
      type: 'app' as const,
      id: 'app',
      theme: {
        style: 'auradecantism',
        mode: 'dark',
        shape: 'rounded',
        recipe: 'default',
        isAddon: false,
      },
      routes: [{ path: '/', pageId: 'home' }],
      routing: 'history' as const,
      shell: {
        type: 'shell' as const,
        id: 'shell',
        children: [],
        config: {
          type: 'marketing',
          brand: 'Test',
          nav: [],
          inset: false,
          recipe: null,
        },
      },
      store: { type: 'store' as const, id: 'store', children: [], pageSignals: [] },
      features: [],
      children: [
        {
          type: 'page' as const,
          id: 'home',
          pageId: 'home',
          surface: '_surface',
          wiring: null,
          spatial: { gap: '4' },
          children: [
            {
              type: 'pattern' as const,
              id: 'hero-1',
              children: [],
              pattern: {
                patternId: 'hero',
                preset: 'default',
                alias: 'hero-1',
                layout: 'hero',
                contained: false,
                standalone: true,
                code: null,
                components: [],
              },
              card: null,
              visualEffects: null,
              wireProps: { title: 'Welcome' },
            },
          ],
        },
      ],
    };

    vi.doMock('@decantr/core', () => ({
      runPipeline: vi.fn().mockResolvedValue({ ir: mockIR }),
      walkIR: vi.fn(),
      findNodes: vi.fn().mockImplementation((root: any, type: string) => {
        const results: any[] = [];
        function walk(node: any) {
          if (node.type === type) results.push(node);
          if (node.children) node.children.forEach(walk);
        }
        walk(root);
        return results;
      }),
    }));

    const { buildFromEssence } = await import('../src/build/index.js');

    const result = await buildFromEssence({
      essencePath,
      outDir: testOutDir,
    });

    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].pageId).toBe('home');
    expect(result.pages[0].route).toBe('/');
    expect(result.pages[0].html).toContain('data-page="home"');
    expect(result.pages[0].html).toContain('data-pattern="hero"');
    expect(result.pages[0].html).toContain('data-theme="auradecantism"');
    expect(result.pages[0].html).toContain('decantr-build');

    // Check manifest was written
    const manifest = JSON.parse(await readFile(join(testOutDir, '_decantr-manifest.json'), 'utf-8'));
    expect(manifest.pages).toHaveLength(1);
    expect(manifest.pages[0].pageId).toBe('home');
    expect(manifest.theme.style).toBe('auradecantism');
  });
});

// ─── Test essence fixture ────────────────────────────────────

describe('test essence fixture', () => {
  it('is valid JSON with expected structure', async () => {
    const essencePath = join(import.meta.dirname, 'fixtures', 'test-essence.json');
    const raw = await readFile(essencePath, 'utf-8');
    const essence = JSON.parse(raw);

    expect(essence.version).toBe('3.0.0');
    expect(essence.dna.theme.style).toBe('auradecantism');
    expect(essence.dna.theme.mode).toBe('dark');
    expect(essence.blueprint.pages).toHaveLength(1);
    expect(essence.blueprint.pages[0].id).toBe('home');
    expect(essence.blueprint.pages[0].layout).toEqual(['hero', 'content-section']);
    expect(essence.meta.archetype).toBe('documentation-site');
    expect(essence.meta.guard.mode).toBe('creative');
  });
});
