import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const mockCheckHealth = vi.fn().mockResolvedValue(true);
const mockListContent = vi.fn().mockImplementation((type: string) => {
  const items: Record<string, unknown[]> = {
    patterns: [
      { slug: 'hero', id: 'hero', name: 'Hero', description: 'Hero section' },
      { slug: 'footer', id: 'footer', name: 'Footer', description: 'Footer section' },
    ],
    archetypes: [
      { slug: 'dashboard', id: 'dashboard', name: 'Dashboard' },
    ],
    themes: [
      { slug: 'carbon', id: 'carbon', name: 'Carbon' },
    ],
    recipes: [],
    blueprints: [],
    shells: [
      { slug: 'top-nav-footer', id: 'top-nav-footer', name: 'Top Nav Footer' },
    ],
  };
  return Promise.resolve({ items: items[type] || [], total: (items[type] || []).length });
});
const mockGetContent = vi.fn().mockImplementation((_type: string, _ns: string, slug: string) => {
  return Promise.resolve({
    slug,
    name: slug,
    data: { id: slug, description: `Full ${slug} data` },
  });
});

vi.mock('@decantr/registry', () => ({
  RegistryAPIClient: vi.fn().mockImplementation(() => ({
    checkHealth: mockCheckHealth,
    listContent: mockListContent,
    getContent: mockGetContent,
  })),
}));

import { cmdRegistryMirror } from '../src/commands/registry-mirror.js';

describe('cmdRegistryMirror', () => {
  const testDir = join(process.cwd(), 'test-mirror-project');
  const cacheDir = join(testDir, '.decantr', 'cache');
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    process.exitCode = undefined as any;
    mockCheckHealth.mockResolvedValue(true);
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('mirrors all content types to cache', async () => {
    await cmdRegistryMirror(testDir);

    const manifestPath = join(cacheDir, 'mirror-manifest.json');
    expect(existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    expect(manifest.mirrored_at).toBeDefined();
    expect(manifest.counts.patterns).toBe(2);
    expect(manifest.counts.archetypes).toBe(1);
    expect(manifest.counts.themes).toBe(1);
    expect(manifest.counts.shells).toBe(1);
  });

  it('mirrors individual items as full data', async () => {
    await cmdRegistryMirror(testDir);

    const heroPath = join(cacheDir, '@official', 'patterns', 'hero.json');
    expect(existsSync(heroPath)).toBe(true);

    const hero = JSON.parse(readFileSync(heroPath, 'utf-8'));
    expect(hero.slug).toBe('hero');
    expect(hero.data.description).toBe('Full hero data');
  });

  it('saves index.json for each type', async () => {
    await cmdRegistryMirror(testDir);

    const indexPath = join(cacheDir, '@official', 'patterns', 'index.json');
    expect(existsSync(indexPath)).toBe(true);

    const index = JSON.parse(readFileSync(indexPath, 'utf-8'));
    expect(index.items).toHaveLength(2);
  });

  it('filters by --type option', async () => {
    await cmdRegistryMirror(testDir, { type: 'themes' });

    const manifest = JSON.parse(readFileSync(join(cacheDir, 'mirror-manifest.json'), 'utf-8'));
    expect(Object.keys(manifest.counts)).toEqual(['themes']);
    expect(manifest.counts.themes).toBe(1);

    // Patterns should NOT have been mirrored
    expect(existsSync(join(cacheDir, '@official', 'patterns', 'index.json'))).toBe(false);
  });

  it('rejects invalid type filter', async () => {
    await cmdRegistryMirror(testDir, { type: 'invalid' });
    expect(process.exitCode).toBe(1);
  });

  it('handles API unavailability', async () => {
    mockCheckHealth.mockResolvedValueOnce(false);

    await cmdRegistryMirror(testDir);
    expect(process.exitCode).toBe(1);
  });
});

describe('RegistryClient offline mode', () => {
  const testDir = join(process.cwd(), 'test-offline-project');
  const cacheDir = join(testDir, '.decantr', 'cache');

  beforeEach(() => {
    mkdirSync(cacheDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('uses only cache in offline mode', async () => {
    // Pre-populate cache
    const themesDir = join(cacheDir, '@official', 'themes');
    mkdirSync(themesDir, { recursive: true });
    writeFileSync(
      join(themesDir, 'carbon.json'),
      JSON.stringify({ id: 'carbon', name: 'Carbon', seed: {} })
    );

    // Import real RegistryClient (not mocked — different module)
    const { RegistryClient } = await import('../src/registry.js');
    const client = new RegistryClient({
      projectRoot: testDir,
      cacheDir,
      offline: true,
    });

    const result = await client.fetchTheme('carbon');
    expect(result).not.toBeNull();
    expect(result?.data.id).toBe('carbon');
    expect(result?.source.type).toBe('cache');
  });
});
