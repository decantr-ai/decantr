import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolvePatternPreset } from '../src/pattern.js';
import type { Pattern } from '../src/types.js';

const PATTERN_PATH = resolve(__dirname, 'fixtures/patterns/detail-header.json');
const raw = JSON.parse(readFileSync(PATTERN_PATH, 'utf-8'));

// AUTO: Cast to registry Pattern type
const DETAIL_HEADER_PATTERN: Pattern = {
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

describe('detail-header pattern JSON', () => {
  it('is valid JSON with required fields', () => {
    expect(raw.id).toBe('detail-header');
    expect(raw.name).toBe('Detail Header');
    expect(raw.version).toBe('1.0.0');
    expect(raw.description).toBeTruthy();
  });

  it('has standard and profile presets', () => {
    expect(raw.presets).toHaveProperty('standard');
    expect(raw.presets).toHaveProperty('profile');
    expect(raw.default_preset).toBe('standard');
  });

  it('has contained set to false (no card wrapping)', () => {
    expect(raw.contained).toBe(false);
  });

  it('standard preset has row layout with bottom border atoms', () => {
    const standard = raw.presets.standard;
    expect(standard.layout.layout).toBe('row');
    expect(standard.layout.atoms).toContain('_pb4');
    expect(standard.layout.atoms).toContain('_bbsolid');
    expect(standard.layout.atoms).toContain('_bcborder');
  });

  it('profile preset has row layout with start alignment', () => {
    const profile = raw.presets.profile;
    expect(profile.layout.layout).toBe('row');
    expect(profile.layout.atoms).toContain('_flex _row');
    expect(profile.layout.atoms).toContain('_gap6');
    expect(profile.layout.atoms).toContain('_items[start]');
  });

  it('lists Avatar, Badge, Button, Breadcrumb as components', () => {
    expect(raw.components).toContain('Avatar');
    expect(raw.components).toContain('Badge');
    expect(raw.components).toContain('Button');
    expect(raw.components).toContain('Breadcrumb');
  });

  it('has io declarations with data consumes and action produces', () => {
    expect(raw.io).toBeDefined();
    expect(raw.io.consumes).toContain('data');
    expect(raw.io.produces).toContain('actions');
    expect(raw.io.actions).toContain('edit');
    expect(raw.io.actions).toContain('delete');
    expect(raw.io.actions).toContain('share');
  });

  it('both presets have code with imports and example', () => {
    for (const presetName of ['standard', 'profile']) {
      const preset = raw.presets[presetName];
      expect(preset.code.imports).toBeTruthy();
      expect(preset.code.example).toBeTruthy();
    }
  });

  it('profile preset includes Avatar component', () => {
    const profile = raw.presets.profile;
    expect(profile.components).toContain('Avatar');
  });
});

describe('detail-header resolvePatternPreset', () => {
  it('returns standard preset by default', () => {
    const result = resolvePatternPreset(DETAIL_HEADER_PATTERN);
    expect(result.preset).toBe('standard');
    expect(result.code.example).toContain('DetailHeader');
  });

  it('returns profile preset when specified', () => {
    const result = resolvePatternPreset(DETAIL_HEADER_PATTERN, 'profile');
    expect(result.preset).toBe('profile');
    expect(result.code.example).toContain('DetailHeaderProfile');
  });

  it('falls back to standard for unknown preset', () => {
    const result = resolvePatternPreset(DETAIL_HEADER_PATTERN, 'nonexistent');
    expect(result.preset).toBe('standard');
  });
});
