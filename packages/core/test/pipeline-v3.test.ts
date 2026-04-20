import { describe, it, expect } from 'vitest';
import { runPipeline } from '../src/pipeline.js';
import type { EssenceFile, EssenceV3 } from '@decantr/essence-spec';
import type { IRPatternNode, IRPageNode } from '../src/types.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

const contentRoot = join(import.meta.dirname, '..', '..', 'registry', 'test', 'fixtures');

function loadFixture(name: string): EssenceFile {
  const path = join(import.meta.dirname, 'fixtures', `${name}.json`);
  return JSON.parse(readFileSync(path, 'utf-8'));
}

describe('runPipeline (v3 essences)', () => {
  it('produces IR from v3 saas-dashboard essence', async () => {
    const essence = loadFixture('essence-v3-saas');
    const result = await runPipeline(essence, { contentRoot });

    const ir = result.ir;
    expect(ir.type).toBe('app');
    expect(ir.theme.id).toBe('auradecantism');
    expect(ir.theme.mode).toBe('dark');
    expect(ir.routing).toBe('hash');
    expect(ir.routes.length).toBe(2);
    expect(ir.routes[0].path).toBe('/');
    expect(ir.routes[0].pageId).toBe('overview');
    expect(ir.routes[1].path).toBe('/settings');

    // Pages
    expect(ir.children.length).toBe(2);
    expect(ir.children[0].type).toBe('page');
    expect(ir.children[0].id).toBe('overview');
  });

  it('produces IR from v3 landing page essence', async () => {
    const essence = loadFixture('essence-v3-landing');
    const result = await runPipeline(essence, { contentRoot });

    const ir = result.ir;
    expect(ir.routing).toBe('history');
    expect(ir.shell.config.type).toBe('full-bleed');
    expect(ir.children.length).toBe(1);

    // hero should be in the page children
    const page = ir.children[0];
    expect(page.children.length).toBe(2); // hero + card-grid
  });

  it('preserves pathname routing for v3 essences', async () => {
    const essence = loadFixture('essence-v3-landing') as any;
    essence.meta.platform.routing = 'pathname';

    const result = await runPipeline(essence, { contentRoot });

    expect(result.ir.routing).toBe('pathname');
  });

  it('attaches layer metadata to IR nodes from v3 source', async () => {
    const essence = loadFixture('essence-v3-saas');
    const result = await runPipeline(essence, { contentRoot });

    const page = result.ir.children[0] as IRPageNode;
    expect(page.layer).toBe('blueprint');

    // Pattern nodes inside the page also get layer
    const firstChild = page.children[0] as IRPatternNode;
    expect(firstChild.layer).toBe('blueprint');
  });

  it('auto-migrates v2 essence to v3 before processing', async () => {
    const v2Essence = loadFixture('essence-saas');
    const result = await runPipeline(v2Essence, { contentRoot });

    // Should still produce valid IR
    const ir = result.ir;
    expect(ir.type).toBe('app');
    expect(ir.theme.id).toBe('auradecantism');
    expect(ir.routes.length).toBe(2);
    expect(ir.children.length).toBe(2);
  });

  it('includes wiring signals for v3 filter-bar + data-table pages', async () => {
    const essence = loadFixture('essence-v3-saas');
    const result = await runPipeline(essence, { contentRoot });

    const overviewPage = result.ir.children[0] as any;
    expect(overviewPage.wiring).not.toBeNull();
    if (overviewPage.wiring) {
      expect(overviewPage.wiring.signals.length).toBeGreaterThan(0);
      expect(overviewPage.wiring.signals[0].name).toBe('pageSearch');
    }
  });

  it('applies theme decoration to shell IR for v3', async () => {
    const essence = loadFixture('essence-v3-saas');
    const result = await runPipeline(essence, { contentRoot, overridePaths: [contentRoot] });

    const shell = result.ir.shell;
    expect(shell.config.decoration).not.toBeNull();
    expect(shell.config.decoration!.root).toBe('d-mesh');
    expect(shell.config.decoration!.nav).toBe('d-glass');
    expect(shell.config.decoration!.navStyle).toBe('filled');
  });

  it('respects pageFilter with v3 essence', async () => {
    const essence = loadFixture('essence-v3-saas');
    const result = await runPipeline(essence, {
      contentRoot,
      pageFilter: 'settings',
    });

    expect(result.ir.children.length).toBe(1);
    expect(result.ir.children[0].id).toBe('settings');
    expect(result.ir.routes.length).toBe(2);
  });

  it('reads shape from dna.radius.philosophy in IR theme', async () => {
    const essence = loadFixture('essence-v3-saas');
    const result = await runPipeline(essence, { contentRoot });

    expect(result.ir.theme.shape).toBe('rounded');
  });

  it('reads features from blueprint.features', async () => {
    const essence = loadFixture('essence-v3-saas');
    const result = await runPipeline(essence, { contentRoot });

    expect(result.ir.features).toContain('auth');
  });
});

describe('runPipeline (v2 auto-migration)', () => {
  it('v2 saas produces same IR structure as v3 saas', async () => {
    const v2Essence = loadFixture('essence-saas');
    const v3Essence = loadFixture('essence-v3-saas');

    const v2Result = await runPipeline(v2Essence, { contentRoot });
    const v3Result = await runPipeline(v3Essence, { contentRoot });

    // Both should produce the same routes and page count
    expect(v2Result.ir.routes.length).toBe(v3Result.ir.routes.length);
    expect(v2Result.ir.children.length).toBe(v3Result.ir.children.length);
    expect(v2Result.ir.theme.id).toBe(v3Result.ir.theme.id);
    expect(v2Result.ir.theme.mode).toBe(v3Result.ir.theme.mode);
  });

  it('v2 landing auto-migrated still gets history routing', async () => {
    const v2Essence = loadFixture('essence-landing');
    const result = await runPipeline(v2Essence, { contentRoot });

    expect(result.ir.routing).toBe('history');
  });
});
