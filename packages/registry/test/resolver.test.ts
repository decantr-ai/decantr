import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createResolver } from '../src/resolver.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureRoot = join(__dirname, 'fixtures');

describe('ContentResolver', () => {
  it('creates a resolver with a content root', () => {
    const resolver = createResolver({ contentRoot: fixtureRoot });
    expect(resolver).toBeDefined();
  });

  it('resolves a pattern by id', async () => {
    const resolver = createResolver({ contentRoot: fixtureRoot });
    const result = await resolver.resolve('pattern', 'hero');
    expect(result).not.toBeNull();
    expect(result!.item.id).toBe('hero');
    expect(result!.source).toBe('core');
  });

  it('resolves an archetype by id', async () => {
    const resolver = createResolver({ contentRoot: fixtureRoot });
    const result = await resolver.resolve('archetype', 'saas-dashboard');
    expect(result).not.toBeNull();
    expect(result!.item.id).toBe('saas-dashboard');
  });

  it('resolves a theme by id', async () => {
    const resolver = createResolver({ contentRoot: fixtureRoot });
    const result = await resolver.resolve('theme', 'auradecantism');
    expect(result).not.toBeNull();
    expect(result!.item.id).toBe('auradecantism');
  });

  it('returns null for missing content', async () => {
    const resolver = createResolver({ contentRoot: fixtureRoot });
    const result = await resolver.resolve('pattern', 'nonexistent');
    expect(result).toBeNull();
  });

  it('uses override paths in priority order', async () => {
    const overrideDir = join(__dirname, 'fixtures-override');
    const resolver = createResolver({ contentRoot: fixtureRoot, overridePaths: [overrideDir] });
    const result = await resolver.resolve('pattern', 'hero');
    expect(result).not.toBeNull();
    expect(result!.source).toBe('local');
    expect(result!.item.version).toBe('2.0.0-override');
    expect(result!.item.name).toBe('Hero Override');
  });

  it('resolves content from core directory as fallback', async () => {
    const resolver = createResolver({ contentRoot: fixtureRoot });

    // chart-panel only exists in core/patterns/
    const result = await resolver.resolve('pattern', 'chart-panel');

    expect(result).not.toBeNull();
    expect(result!.source).toBe('core');
    expect(result!.item.id).toBe('chart-panel');
    expect(result!.path).toContain('core/patterns/chart-panel.json');
  });

  it('prefers main directory over core directory', async () => {
    const resolver = createResolver({ contentRoot: fixtureRoot });

    // kpi-grid exists in both main and core, main should win
    const result = await resolver.resolve('pattern', 'kpi-grid');

    expect(result).not.toBeNull();
    // Main has full kpi-grid from decantr-content, core has simplified "KPI Grid (Core)"
    expect(result!.item.name).toBe('KPI Grid');
    expect(result!.item.version).toBe('1.0.0');
    expect(result!.path).not.toContain('/core/');
  });
});
