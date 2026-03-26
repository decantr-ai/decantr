import { describe, it, expect } from 'vitest';
import { validateEssence } from '../src/validate.js';

const VALID_SIMPLE: Record<string, unknown> = {
  version: '2.0.0',
  archetype: 'saas-dashboard',
  theme: { style: 'auradecantism', mode: 'dark', recipe: 'auradecantism', shape: 'rounded' },
  personality: ['professional', 'data-rich'],
  platform: { type: 'spa', routing: 'hash' },
  structure: [
    { id: 'overview', shell: 'sidebar-main', layout: ['kpi-grid', 'chart-grid'] },
  ],
  features: ['auth'],
  density: { level: 'comfortable', content_gap: '4' },
  guard: { enforce_style: true, mode: 'strict' },
  target: 'react',
};

const VALID_SECTIONED: Record<string, unknown> = {
  version: '2.0.0',
  platform: { type: 'spa', routing: 'hash' },
  personality: ['professional'],
  sections: [
    {
      id: 'brand',
      path: '/',
      archetype: 'portfolio',
      theme: { style: 'glassmorphism', mode: 'dark', recipe: 'glassmorphism' },
      structure: [{ id: 'home', shell: 'full-bleed', layout: ['hero'] }],
    },
  ],
  density: { level: 'spacious', content_gap: '6' },
  guard: { mode: 'creative' },
  target: 'decantr',
};

describe('validateEssence', () => {
  it('accepts a valid simple essence', () => {
    const result = validateEssence(VALID_SIMPLE);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('accepts a valid sectioned essence', () => {
    const result = validateEssence(VALID_SECTIONED);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects missing required fields', () => {
    const result = validateEssence({ version: '2.0.0' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects invalid theme mode', () => {
    const bad = { ...VALID_SIMPLE, theme: { ...(VALID_SIMPLE.theme as object), mode: 'neon' } };
    const result = validateEssence(bad);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('mode'))).toBe(true);
  });

  it('rejects invalid density level', () => {
    const bad = { ...VALID_SIMPLE, density: { level: 'ultra', content_gap: '4' } };
    const result = validateEssence(bad);
    expect(result.valid).toBe(false);
  });

  it('rejects invalid page id format', () => {
    const bad = {
      ...VALID_SIMPLE,
      structure: [{ id: 'My Page', shell: 'sidebar-main', layout: ['hero'] }],
    };
    const result = validateEssence(bad);
    expect(result.valid).toBe(false);
  });

  it('rejects empty structure array', () => {
    const bad = { ...VALID_SIMPLE, structure: [] };
    const result = validateEssence(bad);
    expect(result.valid).toBe(false);
  });

  it('rejects empty personality array', () => {
    const bad = { ...VALID_SIMPLE, personality: [] };
    const result = validateEssence(bad);
    expect(result.valid).toBe(false);
  });

  it('accepts layout items with pattern refs', () => {
    const withPatternRef = {
      ...VALID_SIMPLE,
      structure: [{
        id: 'overview',
        shell: 'sidebar-main',
        layout: [
          'kpi-grid',
          { pattern: 'data-table', preset: 'standard' },
          { cols: ['a', 'b'], at: 'lg', span: { a: 3 } },
        ],
      }],
    };
    const result = validateEssence(withPatternRef);
    expect(result.valid).toBe(true);
  });

  it('accepts $schema field', () => {
    const withSchema = { $schema: 'https://decantr.ai/schema/essence/2.0.json', ...VALID_SIMPLE };
    const result = validateEssence(withSchema);
    expect(result.valid).toBe(true);
  });
});
