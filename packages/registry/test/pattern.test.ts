import { describe, it, expect } from 'vitest';
import { resolvePatternPreset } from '../src/pattern.js';
import type { Pattern } from '../src/types.js';

const HERO_PATTERN: Pattern = {
  id: 'hero', version: '1.0.0', name: 'Hero', description: 'Landing hero',
  tags: ['hero'], components: ['Button'], default_preset: 'landing',
  presets: {
    landing: {
      description: 'Standard landing',
      layout: { layout: 'hero', atoms: '_flex _col _aic _tc _gap6' },
      code: { imports: 'import { Button } from "decantr/components";', example: 'function HeroLanding() {}' },
    },
    'image-overlay': {
      description: 'Image background hero',
      layout: { layout: 'hero', atoms: '_flex _col _aic _tc _gap4 _py16' },
      code: { imports: 'import { Button } from "decantr/components";', example: 'function HeroImageOverlay() {}' },
    },
  },
};

describe('resolvePatternPreset', () => {
  it('returns the default preset when no preset specified', () => {
    const result = resolvePatternPreset(HERO_PATTERN);
    expect(result.preset).toBe('landing');
    expect(result.code.example).toBe('function HeroLanding() {}');
  });

  it('returns the specified preset', () => {
    const result = resolvePatternPreset(HERO_PATTERN, 'image-overlay');
    expect(result.preset).toBe('image-overlay');
    expect(result.code.example).toBe('function HeroImageOverlay() {}');
  });

  it('falls back to default preset for unknown preset name', () => {
    const result = resolvePatternPreset(HERO_PATTERN, 'nonexistent');
    expect(result.preset).toBe('landing');
  });

  it('uses recipe default_presets as middle priority', () => {
    const result = resolvePatternPreset(HERO_PATTERN, undefined, { hero: 'image-overlay' });
    expect(result.preset).toBe('image-overlay');
  });

  it('explicit preset overrides recipe default', () => {
    const result = resolvePatternPreset(HERO_PATTERN, 'landing', { hero: 'image-overlay' });
    expect(result.preset).toBe('landing');
  });

  it('falls back to pattern code when no presets exist', () => {
    const noPresets: Pattern = {
      ...HERO_PATTERN, presets: {}, default_preset: '',
      code: { imports: 'import { h } from "decantr/core";', example: 'function HeroFallback() {}' },
    };
    const result = resolvePatternPreset(noPresets);
    expect(result.code.example).toBe('function HeroFallback() {}');
    expect(result.preset).toBe('');
  });
});
