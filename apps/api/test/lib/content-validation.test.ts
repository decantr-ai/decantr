import { describe, expect, it } from 'vitest';
import { validateRegistryContent } from '../../src/lib/content-validation.js';

describe('validateRegistryContent', () => {
  it('accepts valid registry content', () => {
    const result = validateRegistryContent('theme', {
      $schema: 'https://decantr.ai/schemas/theme.v1.json',
      id: 'test-theme',
      name: 'Test Theme',
      description: 'Minimal valid theme for schema validation tests.',
      modes: ['dark'],
      shapes: ['rounded'],
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('reports schema-url drift and schema violations', () => {
    const result = validateRegistryContent('theme', {
      id: 'broken-theme',
      name: 'Broken Theme',
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('$schema must be "https://decantr.ai/schemas/theme.v1.json"');
    expect(result.errors).toContain('schema / must have required property \'description\'');
  });
});
