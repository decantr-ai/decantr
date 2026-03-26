import { describe, it, expect } from 'vitest';
import { runPipeline } from '../src/pipeline.js';
import type { GeneratorPlugin, IRAppNode, GeneratedFile } from '../src/types.js';
import type { EssenceFile } from '@decantr/essence-spec';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

const contentRoot = join(import.meta.dirname, '..', '..', '..', 'content', 'core');

/** Mock plugin that serializes the IR to JSON for inspection */
const inspectorPlugin: GeneratorPlugin = {
  name: 'inspector',
  target: 'test',
  emit(app: IRAppNode): GeneratedFile[] {
    return [{ path: 'ir-dump.json', content: JSON.stringify(app, null, 2) }];
  },
};

function loadFixture(name: string): EssenceFile {
  const path = join(import.meta.dirname, 'fixtures', `${name}.json`);
  return JSON.parse(readFileSync(path, 'utf-8'));
}

describe('runPipeline', () => {
  it('produces IR from saas-dashboard essence', async () => {
    const essence = loadFixture('essence-saas');
    const result = await runPipeline(essence, {
      projectRoot: '/tmp/test-project',
      contentRoot,
      plugin: inspectorPlugin,
      dryRun: true,
    });

    expect(result.files.length).toBe(1);
    expect(result.dryRun).toBe(true);

    const ir = result.ir;
    expect(ir.type).toBe('app');
    expect(ir.theme.style).toBe('auradecantism');
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

  it('produces IR from landing page essence', async () => {
    const essence = loadFixture('essence-landing');
    const result = await runPipeline(essence, {
      projectRoot: '/tmp/test-project',
      contentRoot,
      plugin: inspectorPlugin,
      dryRun: true,
    });

    const ir = result.ir;
    expect(ir.routing).toBe('history');
    expect(ir.shell.config.type).toBe('full-bleed');
    expect(ir.children.length).toBe(1);

    // hero should be in the page children
    const page = ir.children[0];
    expect(page.children.length).toBe(2); // hero + card-grid
  });

  it('includes wiring signals for filter-bar + data-table pages', async () => {
    const essence = loadFixture('essence-saas');
    const result = await runPipeline(essence, {
      projectRoot: '/tmp/test-project',
      contentRoot,
      plugin: inspectorPlugin,
      dryRun: true,
    });

    // Overview page has filter-bar + data-table in a grid, should have wiring
    const overviewPage = result.ir.children[0] as any;
    // Wiring may or may not be detected depending on pattern resolution
    // The layout has cols: ['filter-bar', 'data-table'] so detection should fire
    expect(overviewPage.wiring).not.toBeNull();
    if (overviewPage.wiring) {
      expect(overviewPage.wiring.signals.length).toBeGreaterThan(0);
      expect(overviewPage.wiring.signals[0].name).toBe('pageSearch');
    }
  });

  it('applies recipe decoration to shell IR', async () => {
    const essence = loadFixture('essence-saas');
    const result = await runPipeline(essence, {
      projectRoot: '/tmp/test-project',
      contentRoot,
      plugin: inspectorPlugin,
      dryRun: true,
    });

    const shell = result.ir.shell;
    expect(shell.config.recipe).not.toBeNull();
    expect(shell.config.recipe!.root).toBe('d-mesh');
    expect(shell.config.recipe!.nav).toBe('d-glass');
    expect(shell.config.recipe!.navStyle).toBe('filled');
  });

  it('respects pageFilter option', async () => {
    const essence = loadFixture('essence-saas');
    const result = await runPipeline(essence, {
      projectRoot: '/tmp/test-project',
      contentRoot,
      plugin: inspectorPlugin,
      dryRun: true,
      pageFilter: 'settings',
    });

    // Only settings page should be in children
    expect(result.ir.children.length).toBe(1);
    expect(result.ir.children[0].id).toBe('settings');
    // But routes should still include all pages
    expect(result.ir.routes.length).toBe(2);
  });

  it('throws on invalid essence', async () => {
    const invalidEssence = { version: '1.0.0' } as unknown as EssenceFile;
    await expect(
      runPipeline(invalidEssence, {
        projectRoot: '/tmp/test',
        contentRoot,
        plugin: inspectorPlugin,
        dryRun: true,
      })
    ).rejects.toThrow('Invalid essence');
  });
});
