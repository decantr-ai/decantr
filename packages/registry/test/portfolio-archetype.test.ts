import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createResolver } from '../src/resolver.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentRoot = join(__dirname, 'fixtures');

// AUTO: Load archetype directly to validate JSON structure independently of resolver
const archetypePath = join(contentRoot, 'archetypes', 'portfolio.json');
const archetype = JSON.parse(readFileSync(archetypePath, 'utf-8'));

describe('portfolio archetype', () => {
  it('is valid and parseable JSON with required fields', () => {
    expect(archetype.id).toBe('portfolio');
    expect(archetype.name).toBe('Portfolio');
    expect(archetype.description).toBeTruthy();
    expect(archetype.version).toBe('1.0.0');
    expect(archetype.tags).toBeInstanceOf(Array);
    expect(archetype.tags.length).toBeGreaterThan(0);
  });

  it('has all 4 pages: home, project-detail, about, contact', () => {
    expect(archetype.pages).toHaveLength(4);
    const pageIds = archetype.pages.map((p: { id: string }) => p.id);
    expect(pageIds).toContain('home');
    expect(pageIds).toContain('project-detail');
    expect(pageIds).toContain('about');
    expect(pageIds).toContain('contact');
  });

  it('each page has a default_layout', () => {
    for (const page of archetype.pages) {
      expect(page.default_layout, `page ${page.id} missing default_layout`).toBeInstanceOf(Array);
      expect(
        page.default_layout.length,
        `page ${page.id} has empty default_layout`,
      ).toBeGreaterThan(0);
    }
  });

  it('hero uses split preset on about page', () => {
    const aboutPage = archetype.pages.find((p: { id: string }) => p.id === 'about');
    expect(aboutPage).toBeDefined();
    const heroEntry = aboutPage.default_layout.find(
      (item: unknown) =>
        typeof item === 'object' &&
        item !== null &&
        (item as { pattern: string }).pattern === 'hero',
    );
    expect(heroEntry).toBeDefined();
    expect(heroEntry.preset).toBe('split');
  });

  it('form-sections uses creation preset on contact page', () => {
    const contactPage = archetype.pages.find((p: { id: string }) => p.id === 'contact');
    expect(contactPage).toBeDefined();
    const formEntry = contactPage.default_layout.find(
      (item: unknown) =>
        typeof item === 'object' &&
        item !== null &&
        (item as { pattern: string }).pattern === 'form-sections',
    );
    expect(formEntry).toBeDefined();
    expect(formEntry.preset).toBe('creation');
  });

  it('pattern references use correct preset names', () => {
    // AUTO: Valid presets per pattern, derived from content/patterns/*.json and content/core/patterns/*.json
    const validPresets: Record<string, string[]> = {
      hero: [
        'landing',
        'image-overlay',
        'brand',
        'vision',
        'split',
        'image-overlay-compact',
        'empty-state',
      ],
      'card-grid': ['product', 'content', 'collection', 'icon'],
      'cta-section': ['standard', 'split', 'banner'],
      'detail-header': ['standard', 'profile'],
      'form-sections': ['settings', 'creation', 'structured'],
    };

    for (const page of archetype.pages) {
      for (const item of page.default_layout) {
        if (typeof item === 'object' && item.pattern && item.preset) {
          const allowed = validPresets[item.pattern];
          expect(allowed, `unknown pattern ${item.pattern}`).toBeDefined();
          expect(
            allowed,
            `invalid preset "${item.preset}" for pattern "${item.pattern}"`,
          ).toContain(item.preset);
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
    const result = await resolver.resolve('archetype', 'portfolio');
    expect(result).not.toBeNull();
    expect(result!.item.id).toBe('portfolio');
    expect(result!.item.pages).toHaveLength(4);
  });
});
