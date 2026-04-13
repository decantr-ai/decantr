import { describe, expect, it } from 'vitest';
import { validateRegistryContent } from '../../src/lib/content-validation.js';
import type { ContentType } from '../../src/types.js';

const validRegistryContent: Record<ContentType, Record<string, unknown>> = {
  pattern: {
    $schema: 'https://decantr.ai/schemas/pattern.v2.json',
    id: 'test-pattern',
    version: '1.0.0',
    name: 'Test Pattern',
    description: 'Minimal valid pattern for schema validation tests.',
    components: ['TestPattern'],
    default_preset: 'default',
    presets: {
      default: {
        description: 'Default preset',
        layout: {
          layout: 'stack',
          atoms: '_stack-md',
        },
      },
    },
  },
  theme: {
    $schema: 'https://decantr.ai/schemas/theme.v1.json',
    id: 'test-theme',
    name: 'Test Theme',
    description: 'Minimal valid theme for schema validation tests.',
    modes: ['dark'],
    shapes: ['rounded'],
  },
  blueprint: {
    $schema: 'https://decantr.ai/schemas/blueprint.v1.json',
    id: 'test-blueprint',
    version: '1.0.0',
    name: 'Test Blueprint',
    theme: { id: 'test-theme' },
    routes: {
      '/': {
        shell: 'sidebar-main',
      },
    },
  },
  archetype: {
    $schema: 'https://decantr.ai/schemas/archetype.v2.json',
    id: 'test-archetype',
    role: 'primary',
    version: '1.0.0',
    name: 'Test Archetype',
    description: 'Minimal valid archetype for schema validation tests.',
    tags: ['dashboard'],
    pages: [
      {
        id: 'home',
        shell: 'sidebar-main',
        default_layout: ['hero'],
      },
    ],
    features: ['auth'],
  },
  shell: {
    $schema: 'https://decantr.ai/schemas/shell.v1.json',
    id: 'test-shell',
    name: 'Test Shell',
  },
};

describe('validateRegistryContent', () => {
  it.each(Object.entries(validRegistryContent) as Array<[ContentType, Record<string, unknown>]>)(
    'accepts valid %s registry content',
    (type, data) => {
      const result = validateRegistryContent(type, data);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    },
  );

  it.each(Object.entries(validRegistryContent) as Array<[ContentType, Record<string, unknown>]>)(
    'reports schema-url drift and schema violations for %s content',
    (type, data) => {
      const { $schema: _schema, ...withoutSchema } = data;
      const result = validateRegistryContent(type, withoutSchema);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('$schema must be');
      expect(result.errors.some(error => error.startsWith('schema '))).toBe(true);
    },
  );

  it('rejects non-object registry content payloads', () => {
    const result = validateRegistryContent('theme', 'not-an-object');

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(['data must be an object']);
  });
});
