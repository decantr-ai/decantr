import { describe, it, expect } from 'vitest';
import { createResolver } from '../src/resolver.js';
import { detectWirings } from '../src/wiring.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentRoot = join(__dirname, '..', '..', '..', 'content');

// AUTO: Load archetype directly to validate JSON structure independently of resolver
const archetypePath = join(contentRoot, 'archetypes', 'content-site.json');
const archetype = JSON.parse(readFileSync(archetypePath, 'utf-8'));

describe('content-site archetype', () => {
  it('is valid and parseable JSON with required fields', () => {
    expect(archetype.id).toBe('content-site');
    expect(archetype.name).toBe('Content Site');
    expect(archetype.description).toBeTruthy();
    expect(archetype.version).toBe('1.0.0');
    expect(archetype.tags).toBeInstanceOf(Array);
    expect(archetype.tags.length).toBeGreaterThan(0);
  });

  it('has 3 pages: home, article, categories', () => {
    expect(archetype.pages).toHaveLength(3);
    const pageIds = archetype.pages.map((p: { id: string }) => p.id);
    expect(pageIds).toContain('home');
    expect(pageIds).toContain('article');
    expect(pageIds).toContain('categories');
  });

  it('each page has a default_layout', () => {
    for (const page of archetype.pages) {
      expect(page.default_layout, `page ${page.id} missing default_layout`).toBeInstanceOf(Array);
      expect(page.default_layout.length, `page ${page.id} has empty default_layout`).toBeGreaterThan(0);
    }
  });

  it('article page uses detail-header with standard preset', () => {
    const articlePage = archetype.pages.find((p: { id: string }) => p.id === 'article');
    expect(articlePage).toBeDefined();
    const detailHeader = articlePage.default_layout.find(
      (item: unknown) => typeof item === 'object' && item !== null && (item as { pattern: string }).pattern === 'detail-header'
    );
    expect(detailHeader).toBeDefined();
    expect(detailHeader.preset).toBe('standard');
  });

  it('categories page has filter-bar + card-grid for wired search/filter', () => {
    const categoriesPage = archetype.pages.find((p: { id: string }) => p.id === 'categories');
    expect(categoriesPage).toBeDefined();
    const patternIds = categoriesPage.default_layout.map((item: unknown) => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null && 'pattern' in item) return (item as { pattern: string }).pattern;
      return null;
    });
    expect(patternIds).toContain('filter-bar');
    expect(patternIds).toContain('card-grid');
  });

  it('pattern references use correct preset names', () => {
    // AUTO: Valid presets per pattern, derived from content/patterns/*.json
    const validPresets: Record<string, string[]> = {
      'hero': ['landing', 'split', 'centered', 'video'],
      'card-grid': ['product', 'content', 'collection', 'icon'],
      'detail-header': ['standard', 'profile'],
      'filter-bar': ['standard', 'compact', 'advanced'],
    };

    for (const page of archetype.pages) {
      for (const item of page.default_layout) {
        if (typeof item === 'object' && item.pattern && item.preset) {
          const allowed = validPresets[item.pattern];
          expect(allowed, `unknown pattern ${item.pattern}`).toBeDefined();
          expect(allowed).toContain(item.preset);
        }
      }
    }
  });

  it('declares dependencies for all referenced patterns', () => {
    const deps = Object.keys(archetype.dependencies.patterns);
    const referencedPatterns = new Set<string>();

    for (const page of archetype.pages) {
      for (const item of page.default_layout) {
        if (typeof item === 'string') referencedPatterns.add(item);
        else if (item.pattern) referencedPatterns.add(item.pattern);
      }
    }

    for (const pattern of referencedPatterns) {
      expect(deps, `missing dependency for ${pattern}`).toContain(pattern);
    }
  });

  it('can be resolved by the registry resolver', async () => {
    const resolver = createResolver({
      contentRoot: join(contentRoot, 'core'),
      overridePaths: [contentRoot],
    });
    const result = await resolver.resolve('archetype', 'content-site');
    expect(result).not.toBeNull();
    expect(result!.item.id).toBe('content-site');
  });

  it('wiring works on the categories page (filter-bar + card-grid)', () => {
    const categoriesPage = archetype.pages.find((p: { id: string }) => p.id === 'categories');
    expect(categoriesPage).toBeDefined();
    const wirings = detectWirings(categoriesPage.default_layout);
    expect(wirings).toHaveLength(1);
    expect(wirings[0].signals.length).toBeGreaterThan(0);
    expect(wirings[0].props['filter-bar']).toBeDefined();
    expect(wirings[0].props['card-grid']).toBeDefined();
  });
});
