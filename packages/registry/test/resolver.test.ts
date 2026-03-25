import { describe, it, expect } from 'vitest';
import { createResolver } from '../src/resolver.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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

  it('resolves a recipe by id', async () => {
    const resolver = createResolver({ contentRoot: fixtureRoot });
    const result = await resolver.resolve('recipe', 'auradecantism');
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
});
