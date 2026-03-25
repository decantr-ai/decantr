import { describe, it, expect } from 'vitest';
import { createResolver } from '../src/resolver.js';
import { resolvePatternPreset } from '../src/pattern.js';
import { detectWirings } from '../src/wiring.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentRoot = join(__dirname, '..', '..', '..', 'content');

// Skip if content hasn't been migrated
const hasContent = (() => {
  try { return readdirSync(join(contentRoot, 'core')).length > 0; } catch { return false; }
})();

describe.skipIf(!hasContent)('Integration: resolver with real content', () => {
  const resolver = createResolver({
    contentRoot: join(contentRoot, 'core'),
    overridePaths: [contentRoot],
  });

  it('resolves the core hero pattern', async () => {
    const result = await resolver.resolve('pattern', 'hero');
    expect(result).not.toBeNull();
    expect(result!.item.id).toBe('hero');
    expect(result!.item.presets).toBeDefined();
  });

  it('resolves the auradecantism recipe', async () => {
    const result = await resolver.resolve('recipe', 'auradecantism');
    expect(result).not.toBeNull();
    expect(result!.item.id).toBe('auradecantism');
  });

  it('resolves pattern preset from real hero pattern', async () => {
    const result = await resolver.resolve('pattern', 'hero');
    expect(result).not.toBeNull();
    const resolved = resolvePatternPreset(result!.item);
    expect(resolved.preset).toBeTruthy();
    expect(resolved.code.example).toBeTruthy();
  });

  it('detects wirings from a real dashboard layout', () => {
    const layout = ['filter-bar', 'data-table'];
    const wirings = detectWirings(layout);
    expect(wirings).toHaveLength(1);
    expect(wirings[0].signals.length).toBeGreaterThan(0);
  });

  it('resolves a community archetype (block format)', async () => {
    const result = await resolver.resolve('archetype', 'dashboard-core');
    expect(result).not.toBeNull();
    expect(result!.item.id).toBe('dashboard-core');
    expect(result!.item.pages.length).toBeGreaterThan(0);
  });

  it('resolves a vignette archetype', async () => {
    const result = await resolver.resolve('archetype', 'saas-dashboard');
    expect(result).not.toBeNull();
    expect(result!.item.id).toBe('saas-dashboard');
  });
});
