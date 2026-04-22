import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import type { EssenceFile, EssenceV3 } from '@decantr/essence-spec';
import {
  buildMutationPack,
  buildPagePack,
  buildReviewPack,
  buildScaffoldPack,
  buildSectionPack,
  compileExecutionPackBundle,
  runPipeline,
} from '../src/index.js';

const contentRoot = join(import.meta.dirname, '..', '..', 'registry', 'test', 'fixtures');

function loadFixture(name: string): EssenceFile {
  const path = join(import.meta.dirname, 'fixtures', `${name}.json`);
  return JSON.parse(readFileSync(path, 'utf-8'));
}

describe('buildScaffoldPack', () => {
  it('builds a scaffold pack from IR and preserves route topology', async () => {
    const essence = loadFixture('essence-saas');
    const result = await runPipeline(essence, { contentRoot });

    const pack = buildScaffoldPack(result.ir, {
      target: {
        framework: 'react',
        runtime: 'vite',
        adapter: 'react-vite',
      },
      examples: [
        {
          id: 'shell-bootstrap',
          label: 'Shell bootstrap',
          language: 'tsx',
          snippet: '<Shell><Page /></Shell>',
        },
      ],
    });

    expect(pack.packType).toBe('scaffold');
    expect(pack.$schema).toBe('https://decantr.ai/schemas/scaffold-pack.v1.json');
    expect(pack.target.adapter).toBe('react-vite');
    expect(pack.data.shell).toBe('sidebar-main');
    expect(pack.data.theme.id).toBe('auradecantism');
    expect(pack.data.routes).toEqual([
      {
        pageId: 'overview',
        path: '/',
        patternIds: ['kpi-grid', 'filter-bar', 'data-table'],
      },
      {
        pageId: 'settings',
        path: '/settings',
        patternIds: ['form-sections'],
      },
    ]);
    expect(pack.scope.patternIds).toContain('filter-bar');
    expect(pack.allowedVocabulary).toContain('sidebar-main');
    expect(pack.renderedMarkdown).toContain('## Route Plan');
    expect(pack.renderedMarkdown).toContain('- / -> overview [kpi-grid, filter-bar, data-table]');
  });

  it('includes navigation obligations when provided', async () => {
    const essence = loadFixture('essence-saas');
    const result = await runPipeline(essence, { contentRoot });

    const pack = buildScaffoldPack(result.ir, {
      navigation: {
        commandPalette: true,
        hotkeys: [
          { key: 'g o', route: '/', label: 'Go to overview' },
        ],
      },
    });

    expect(pack.data.navigation?.commandPalette).toBe(true);
    expect(pack.data.navigation?.hotkeys).toEqual([
      { key: 'g o', route: '/', label: 'Go to overview' },
    ]);
    expect(pack.renderedMarkdown).toContain('- Navigation:');
    expect(pack.renderedMarkdown).toContain('command palette required');
    expect(pack.renderedMarkdown).toContain('g o: Go to overview');
  });

  it('uses default setup and success checks when none are provided', async () => {
    const essence = loadFixture('essence-landing');
    const result = await runPipeline(essence, { contentRoot });

    const pack = buildScaffoldPack(result.ir);

    expect(pack.requiredSetup).toHaveLength(2);
    expect(pack.successChecks).toHaveLength(3);
    expect(pack.tokenBudget.target).toBe(1400);
    expect(pack.renderedMarkdown).toContain('## Required Setup');
    expect(pack.renderedMarkdown).toContain('## Token Budget');
  });

  it('builds a section pack from a subset of routes', async () => {
    const essence = loadFixture('essence-saas');
    const result = await runPipeline(essence, { contentRoot });

    const pack = buildSectionPack(result.ir, {
      id: 'dashboard',
      role: 'primary',
      shell: 'sidebar-main',
      description: 'Primary app section',
      features: ['auth'],
      pageIds: ['overview'],
    }, {
      target: {
        framework: 'react',
        runtime: 'vite',
        adapter: 'react-vite',
      },
    });

    expect(pack.packType).toBe('section');
    expect(pack.$schema).toBe('https://decantr.ai/schemas/section-pack.v1.json');
    expect(pack.data.sectionId).toBe('dashboard');
    expect(pack.data.routes).toEqual([
      {
        pageId: 'overview',
        path: '/',
        patternIds: ['kpi-grid', 'filter-bar', 'data-table'],
      },
    ]);
    expect(pack.allowedVocabulary).toContain('dashboard');
    expect(pack.allowedVocabulary).toContain('sidebar-main');
    expect(pack.renderedMarkdown).toContain('## Section Contract');
    expect(pack.renderedMarkdown).toContain('- / -> overview [kpi-grid, filter-bar, data-table]');
  });

  it('builds a page pack with route-local patterns and wiring signals', async () => {
    const essence = loadFixture('essence-saas');
    const result = await runPipeline(essence, { contentRoot });

    const pack = buildPagePack(result.ir, {
      pageId: 'overview',
      shell: 'sidebar-main',
      sectionId: 'dashboard',
      sectionRole: 'primary',
      features: ['auth'],
    }, {
      target: {
        framework: 'react',
        runtime: 'vite',
        adapter: 'react-vite',
      },
    });

    expect(pack.packType).toBe('page');
    expect(pack.$schema).toBe('https://decantr.ai/schemas/page-pack.v1.json');
    expect(pack.data.pageId).toBe('overview');
    expect(pack.data.path).toBe('/');
    expect(pack.data.sectionId).toBe('dashboard');
    expect(pack.data.patterns).toEqual([
      {
        id: 'kpi-grid',
        alias: 'kpi-grid',
        preset: 'dashboard',
        layout: 'grid',
      },
      {
        id: 'filter-bar',
        alias: 'filter-bar',
        preset: 'standard',
        layout: 'row',
      },
      {
        id: 'data-table',
        alias: 'data-table',
        preset: 'standard',
        layout: 'column',
      },
    ]);
    expect(pack.data.wiringSignals).toContain('pageSearch');
    expect(pack.renderedMarkdown).toContain('## Page Contract');
    expect(pack.renderedMarkdown).toContain('- Page: overview');
    expect(pack.renderedMarkdown).toContain('- filter-bar -> filter-bar [row | standard]');
  });

  it('builds mutation packs for add-page and modify workflows', async () => {
    const essence = loadFixture('essence-saas');
    const result = await runPipeline(essence, { contentRoot });

    const addPagePack = buildMutationPack(result.ir, {
      mutationType: 'add-page',
      target: {
        framework: 'react',
        runtime: 'vite',
        adapter: 'react-vite',
      },
    });
    const modifyPack = buildMutationPack(result.ir, {
      mutationType: 'modify',
      target: {
        framework: 'react',
        runtime: 'vite',
        adapter: 'react-vite',
      },
    });

    expect(addPagePack.packType).toBe('mutation');
    expect(addPagePack.$schema).toBe('https://decantr.ai/schemas/mutation-pack.v1.json');
    expect(addPagePack.data.mutationType).toBe('add-page');
    expect(addPagePack.data.routes).toHaveLength(2);
    expect(addPagePack.data.workflow[0]).toContain('Declare the new page');
    expect(addPagePack.renderedMarkdown).toContain('## Mutation Contract');
    expect(addPagePack.renderedMarkdown).toContain('- Operation: add-page');

    expect(modifyPack.packType).toBe('mutation');
    expect(modifyPack.data.mutationType).toBe('modify');
    expect(modifyPack.successChecks[0].id).toBe('mutation-existing-topology');
    expect(modifyPack.renderedMarkdown).toContain('- Operation: modify');
    expect(modifyPack.renderedMarkdown).toContain('## Workflow');
  });

  it('builds a review pack with compiled focus areas and workflow', async () => {
    const essence = loadFixture('essence-saas');
    const result = await runPipeline(essence, { contentRoot });

    const pack = buildReviewPack(result.ir, {
      target: {
        framework: 'react',
        runtime: 'vite',
        adapter: 'react-vite',
      },
    });

    expect(pack.packType).toBe('review');
    expect(pack.$schema).toBe('https://decantr.ai/schemas/review-pack.v1.json');
    expect(pack.data.reviewType).toBe('app');
    expect(pack.data.routes).toHaveLength(2);
    expect(pack.data.focusAreas).toContain('route-topology');
    expect(pack.antiPatterns.map(entry => entry.id)).toContain('inline-styles');
    expect(pack.antiPatterns.map(entry => entry.id)).toContain('hardcoded-colors');
    expect(pack.renderedMarkdown).toContain('## Review Contract');
    expect(pack.renderedMarkdown).toContain('## Focus Areas');
    expect(pack.renderedMarkdown).toContain('## Review Workflow');
  });

  it('compiles a schema-backed execution pack bundle from essence', async () => {
    const essence = loadFixture('essence-saas');
    const bundle = await compileExecutionPackBundle(essence, { contentRoot });

    expect(bundle.$schema).toBe('https://decantr.ai/schemas/execution-pack-bundle.v1.json');
    expect(bundle.sourceEssenceVersion).toBe('2.0.0');
    expect(bundle.manifest.$schema).toBe('https://decantr.ai/schemas/pack-manifest.v1.json');
    expect(bundle.manifest.scaffold?.markdown).toBe('scaffold-pack.md');
    expect(bundle.sections).toHaveLength(1);
    expect(bundle.pages).toHaveLength(2);
    expect(bundle.mutations).toHaveLength(2);
    expect(bundle.review.packType).toBe('review');
    expect(bundle.scaffold.target.adapter).toBe('decantr');
    expect(bundle.pages[0]?.renderedMarkdown).toContain('## Page Contract');
  });

  it('honors explicit v3 route mappings when compiling scaffold, section, and page packs', async () => {
    const essence: EssenceV3 = {
      version: '3.1.0',
      dna: {
        theme: { id: 'auradecantism', mode: 'dark', shape: 'rounded' },
        spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '_gap4' },
        typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
        color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
        radius: { philosophy: 'rounded', base: 8 },
        elevation: { system: 'layered', max_levels: 3 },
        motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
        accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
        personality: ['operational'],
      },
      blueprint: {
        sections: [
          {
            id: 'marketing',
            role: 'public',
            shell: 'top-nav-footer',
            description: 'Marketing surface',
            features: [],
            pages: [
              { id: 'home', route: '/', layout: ['hero'] },
            ],
          },
          {
            id: 'agent-orchestrator',
            role: 'primary',
            shell: 'sidebar-main',
            description: 'Agent control plane',
            features: ['agents'],
            pages: [
              { id: 'agent-overview', route: '/agents', layout: ['form-sections'] },
            ],
          },
        ],
        features: ['agents'],
        routes: {
          '/': { section: 'marketing', page: 'home' },
          '/agents': { section: 'agent-orchestrator', page: 'agent-overview' },
        },
      },
      meta: {
        archetype: 'agent-orchestrator',
        target: 'react',
        platform: { type: 'spa', routing: 'hash' },
        guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
      },
    };

    const bundle = await compileExecutionPackBundle(essence, { contentRoot });
    const scaffoldRoutes = bundle.scaffold.data.routes.map((route) => ({ pageId: route.pageId, path: route.path }));
    const marketingPack = bundle.sections.find((pack) => pack.data.sectionId === 'marketing');
    const agentPack = bundle.sections.find((pack) => pack.data.sectionId === 'agent-orchestrator');
    const homePack = bundle.pages.find((pack) => pack.data.pageId === 'home');
    const agentOverviewPack = bundle.pages.find((pack) => pack.data.pageId === 'agent-overview');

    expect(scaffoldRoutes).toEqual([
      { pageId: 'home', path: '/' },
      { pageId: 'agent-overview', path: '/agents' },
    ]);
    expect(marketingPack?.data.routes).toEqual([
      { pageId: 'home', path: '/', patternIds: ['hero'] },
    ]);
    expect(agentPack?.data.routes).toEqual([
      { pageId: 'agent-overview', path: '/agents', patternIds: ['form-sections'] },
    ]);
    expect(homePack?.data.path).toBe('/');
    expect(agentOverviewPack?.data.path).toBe('/agents');
    expect(bundle.scaffold.renderedMarkdown).toContain('- / -> home [hero]');
    expect(bundle.scaffold.renderedMarkdown).toContain('- /agents -> agent-overview [form-sections]');
  });
});
