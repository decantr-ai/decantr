import { describe, it, expect } from 'vitest';
import { validateEssence } from '@decantr/essence-spec';

describe('generate command', () => {
  it('should reject invalid essence before generating', () => {
    const result = validateEssence({ version: '2.0.0' });
    // Missing required fields should fail
    expect(result.valid).toBe(false);
  });

  it('should accept valid essence for generation', () => {
    const essence = {
      version: '2.0.0',
      archetype: 'saas-dashboard',
      theme: { style: 'auradecantism', mode: 'dark', recipe: 'auradecantism' },
      character: ['professional'],
      platform: { type: 'spa', routing: 'hash' },
      structure: [{ id: 'overview', shell: 'sidebar-main', layout: ['kpi-grid'] }],
      features: [],
      density: { level: 'comfortable', content_gap: '_gap4' },
      guard: { mode: 'strict' },
      target: 'react',
    };
    const result = validateEssence(essence);
    expect(result.valid).toBe(true);
  });

  it('should accept essence with multiple pages', () => {
    const essence = {
      version: '2.0.0',
      archetype: 'saas-dashboard',
      theme: { style: 'auradecantism', mode: 'dark', recipe: 'auradecantism' },
      character: ['professional', 'data-rich'],
      platform: { type: 'spa', routing: 'hash' },
      structure: [
        { id: 'overview', shell: 'sidebar-main', layout: ['kpi-grid', 'data-table'] },
        { id: 'settings', shell: 'sidebar-main', layout: [{ pattern: 'form-sections', preset: 'settings' }] },
      ],
      features: ['auth'],
      density: { level: 'comfortable', content_gap: '_gap4' },
      guard: { mode: 'strict' },
      target: 'react',
    };
    const result = validateEssence(essence);
    expect(result.valid).toBe(true);
  });
});
