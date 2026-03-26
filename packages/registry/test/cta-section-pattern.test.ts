import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { resolvePatternPreset } from '../src/pattern.js';
import type { Pattern } from '../src/types.js';

const PATTERN_PATH = resolve(__dirname, '../../../content/patterns/cta-section.json');
const raw = JSON.parse(readFileSync(PATTERN_PATH, 'utf-8'));

// AUTO: Cast to registry Pattern type
const CTA_SECTION_PATTERN: Pattern = {
  id: raw.id,
  version: raw.version,
  name: raw.name,
  description: raw.description,
  tags: raw.tags ?? [],
  components: raw.components,
  default_preset: raw.default_preset,
  presets: raw.presets,
  io: raw.io,
  code: raw.code,
};

describe('cta-section pattern JSON', () => {
  it('is valid JSON with required fields', () => {
    expect(raw.id).toBe('cta-section');
    expect(raw.name).toBe('CTA Section');
    expect(raw.version).toBe('1.0.0');
    expect(raw.description).toBeTruthy();
  });

  it('has standard, split, and banner presets', () => {
    expect(raw.presets).toHaveProperty('standard');
    expect(raw.presets).toHaveProperty('split');
    expect(raw.presets).toHaveProperty('banner');
    expect(raw.default_preset).toBe('standard');
  });

  it('has contained set to false (no card wrapping)', () => {
    expect(raw.contained).toBe(false);
  });

  it('standard preset has centered flex layout atoms', () => {
    const standard = raw.presets.standard;
    expect(standard.layout.layout).toBe('hero');
    expect(standard.layout.atoms).toContain('_flex');
    expect(standard.layout.atoms).toContain('_col');
    expect(standard.layout.atoms).toContain('_items[center]');
    expect(standard.layout.atoms).toContain('_text[center]');
    expect(standard.layout.atoms).toContain('_py12');
  });

  it('split preset has grid layout atoms', () => {
    const split = raw.presets.split;
    expect(split.layout.layout).toBe('row');
    expect(split.layout.atoms).toContain('_grid');
    expect(split.layout.atoms).toContain('_lg:gc2');
    expect(split.layout.atoms).toContain('_items[center]');
  });

  it('banner preset has horizontal bar layout atoms', () => {
    const banner = raw.presets.banner;
    expect(banner.layout.layout).toBe('row');
    expect(banner.layout.atoms).toContain('_flex _row');
    expect(banner.layout.atoms).toContain('_justify[between]');
    expect(banner.layout.atoms).toContain('_bgprimary/10');
    expect(banner.layout.atoms).toContain('_rounded');
  });

  it('lists Button as component', () => {
    expect(raw.components).toContain('Button');
  });

  it('has io declarations with cta-click action', () => {
    expect(raw.io).toBeDefined();
    expect(raw.io.actions).toContain('cta-click');
  });

  it('all presets have code with imports and example', () => {
    for (const presetName of ['standard', 'split', 'banner']) {
      const preset = raw.presets[presetName];
      expect(preset.code.imports).toBeTruthy();
      expect(preset.code.example).toBeTruthy();
    }
  });
});

describe('cta-section resolvePatternPreset', () => {
  it('returns standard preset by default', () => {
    const result = resolvePatternPreset(CTA_SECTION_PATTERN);
    expect(result.preset).toBe('standard');
    expect(result.code.example).toContain('CtaSection');
  });

  it('returns split preset when specified', () => {
    const result = resolvePatternPreset(CTA_SECTION_PATTERN, 'split');
    expect(result.preset).toBe('split');
    expect(result.code.example).toContain('CtaSectionSplit');
  });

  it('returns banner preset when specified', () => {
    const result = resolvePatternPreset(CTA_SECTION_PATTERN, 'banner');
    expect(result.preset).toBe('banner');
    expect(result.code.example).toContain('CtaSectionBanner');
  });

  it('falls back to standard for unknown preset', () => {
    const result = resolvePatternPreset(CTA_SECTION_PATTERN, 'nonexistent');
    expect(result.preset).toBe('standard');
  });
});
