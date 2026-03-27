import { describe, it, expect } from 'vitest';
import { validateCustomTheme } from '../src/theme-commands.js';

describe('validateCustomTheme', () => {
  it('returns valid for complete theme', () => {
    const theme = {
      id: 'test',
      name: 'Test',
      seed: { primary: '#000', secondary: '#111', accent: '#222', background: '#fff' },
      modes: ['dark'],
      shapes: ['rounded'],
      decantr_compat: '>=1.0.0',
      source: 'custom'
    };

    const result = validateCustomTheme(theme);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns errors for missing required fields', () => {
    const theme = {
      id: 'test',
      name: 'Test'
      // missing seed, modes, shapes, decantr_compat, source
    };

    const result = validateCustomTheme(theme);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required field: seed');
    expect(result.errors).toContain('Missing required field: modes');
    expect(result.errors).toContain('Missing required field: shapes');
  });

  it('returns errors for missing seed colors', () => {
    const theme = {
      id: 'test',
      name: 'Test',
      seed: { primary: '#000' }, // missing secondary, accent, background
      modes: ['dark'],
      shapes: ['rounded'],
      decantr_compat: '>=1.0.0',
      source: 'custom'
    };

    const result = validateCustomTheme(theme);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing seed color: secondary');
    expect(result.errors).toContain('Missing seed color: accent');
    expect(result.errors).toContain('Missing seed color: background');
  });

  it('returns errors for invalid modes', () => {
    const theme = {
      id: 'test',
      name: 'Test',
      seed: { primary: '#000', secondary: '#111', accent: '#222', background: '#fff' },
      modes: ['auto'], // invalid
      shapes: ['rounded'],
      decantr_compat: '>=1.0.0',
      source: 'custom'
    };

    const result = validateCustomTheme(theme);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid mode "auto" - must be "light" or "dark"');
  });

  it('returns errors for invalid shapes', () => {
    const theme = {
      id: 'test',
      name: 'Test',
      seed: { primary: '#000', secondary: '#111', accent: '#222', background: '#fff' },
      modes: ['dark'],
      shapes: ['oval'], // invalid
      decantr_compat: '>=1.0.0',
      source: 'custom'
    };

    const result = validateCustomTheme(theme);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid shape "oval" - use: sharp, rounded, pill');
  });
});
