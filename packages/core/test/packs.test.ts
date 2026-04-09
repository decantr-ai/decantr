import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import type { EssenceFile } from '@decantr/essence-spec';
import { buildPagePack, buildScaffoldPack, buildSectionPack, runPipeline } from '../src/index.js';

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
});
