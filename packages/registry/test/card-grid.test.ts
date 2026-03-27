import { describe, it, expect } from 'vitest';
import { resolvePatternPreset } from '../src/pattern.js';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const patternPath = join(__dirname, 'fixtures', 'patterns', 'card-grid.json');

const cardGrid = JSON.parse(readFileSync(patternPath, 'utf-8'));

describe('card-grid pattern', () => {
  it('has valid id and metadata', () => {
    expect(cardGrid.id).toBe('card-grid');
    expect(cardGrid.name).toBe('Card Grid');
    expect(cardGrid.default_preset).toBe('product');
    expect(cardGrid.version).toBe('1.0.0');
  });

  it('defines all 4 required presets', () => {
    const presetKeys = Object.keys(cardGrid.presets);
    expect(presetKeys).toContain('product');
    expect(presetKeys).toContain('content');
    expect(presetKeys).toContain('collection');
    expect(presetKeys).toContain('icon');
    expect(presetKeys).toHaveLength(4);
  });

  it('each preset has distinct component lists', () => {
    const productComps = cardGrid.presets.product.components;
    const contentComps = cardGrid.presets.content.components;
    const collectionComps = cardGrid.presets.collection.components;
    const iconComps = cardGrid.presets.icon.components;

    // Product has Button + CardFooter (for add-to-cart)
    expect(productComps).toContain('Button');
    expect(productComps).toContain('CardFooter');

    // Content has Badge for categories
    expect(contentComps).toContain('Badge');

    // Collection is image-focused, no Button
    expect(collectionComps).not.toContain('Button');

    // Icon preset is compact, uses icon component
    expect(iconComps).toContain('icon');
    expect(iconComps).not.toContain('Button');
  });

  it('each preset has appropriate grid atoms', () => {
    // Product: 4-breakpoint responsive grid
    expect(cardGrid.presets.product.layout.atoms).toContain('_xl:gc4');
    expect(cardGrid.presets.product.layout.atoms).toContain('_sm:gc2');

    // Content: 3-col max
    expect(cardGrid.presets.content.layout.atoms).toContain('_lg:gc3');
    expect(cardGrid.presets.content.layout.atoms).not.toContain('_xl:gc4');

    // Collection: 2/3 cols
    expect(cardGrid.presets.collection.layout.atoms).toContain('_gc2');
    expect(cardGrid.presets.collection.layout.atoms).toContain('_lg:gc3');

    // Icon: compact 2/3/4 cols
    expect(cardGrid.presets.icon.layout.atoms).toContain('_gc2');
    expect(cardGrid.presets.icon.layout.atoms).toContain('_lg:gc4');
  });

  it('io declarations are correct', () => {
    expect(cardGrid.io.consumes).toContain('search');
    expect(cardGrid.io.consumes).toContain('filters');
    expect(cardGrid.io.consumes).toContain('data');
    expect(cardGrid.io.produces).toContain('selection');
    expect(cardGrid.io.actions).toContain('load-more');
  });

  it('each preset has code with imports and example', () => {
    for (const [key, preset] of Object.entries(cardGrid.presets)) {
      const p = preset as { code: { imports: string; example: string } };
      expect(p.code.imports, `${key} missing imports`).toBeTruthy();
      expect(p.code.example, `${key} missing example`).toBeTruthy();
      // All presets import Card
      expect(p.code.imports).toContain('Card');
    }
  });

  it('resolves default preset via resolvePatternPreset', () => {
    const result = resolvePatternPreset(cardGrid);
    expect(result.preset).toBe('product');
    expect(result.code.example).toContain('CardGridProduct');
  });

  it('resolves each named preset', () => {
    for (const presetName of ['product', 'content', 'collection', 'icon']) {
      const result = resolvePatternPreset(cardGrid, presetName);
      expect(result.preset).toBe(presetName);
      expect(result.code.example).toBeTruthy();
    }
  });
});
