import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { resolvePatternPreset } from '../src/pattern.js';
import type { Pattern } from '../src/types.js';

const PATTERN_PATH = resolve(__dirname, '../../../content/patterns/filter-bar.json');
const raw = JSON.parse(readFileSync(PATTERN_PATH, 'utf-8'));

// AUTO: Cast to registry Pattern type
const FILTER_BAR_PATTERN: Pattern = {
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

describe('filter-bar pattern JSON', () => {
  it('is valid JSON with required fields', () => {
    expect(raw.id).toBe('filter-bar');
    expect(raw.name).toBe('Filter Bar');
    expect(raw.version).toBe('1.0.0');
    expect(raw.description).toBeTruthy();
  });

  it('has standard, compact, and advanced presets', () => {
    expect(raw.presets).toHaveProperty('standard');
    expect(raw.presets).toHaveProperty('compact');
    expect(raw.presets).toHaveProperty('advanced');
    expect(raw.default_preset).toBe('standard');
  });

  it('standard preset has row layout with flex row atoms', () => {
    const standard = raw.presets.standard;
    expect(standard.blend.layout).toBe('row');
    expect(standard.blend.atoms).toContain('_flex');
    expect(standard.blend.atoms).toContain('_row');
    expect(standard.blend.atoms).toContain('_w[100%]');
  });

  it('compact preset has row layout with tighter gap', () => {
    const compact = raw.presets.compact;
    expect(compact.blend.layout).toBe('row');
    expect(compact.blend.atoms).toContain('_gap2');
  });

  it('advanced preset has column layout for multi-row', () => {
    const advanced = raw.presets.advanced;
    expect(advanced.blend.layout).toBe('column');
    expect(advanced.blend.atoms).toContain('_col');
  });

  it('has io.produces with search, filters, and status', () => {
    expect(raw.io).toBeDefined();
    expect(raw.io.produces).toContain('search');
    expect(raw.io.produces).toContain('filters');
    expect(raw.io.produces).toContain('status');
    expect(raw.io.consumes).toEqual([]);
    expect(raw.io.actions).toContain('clear');
    expect(raw.io.actions).toContain('apply');
  });

  it('lists Input, Select, Button, Badge, and icon as components', () => {
    expect(raw.components).toContain('Input');
    expect(raw.components).toContain('Select');
    expect(raw.components).toContain('Button');
    expect(raw.components).toContain('Badge');
    expect(raw.components).toContain('icon');
  });

  it('all presets have code with imports and example', () => {
    for (const presetName of ['standard', 'compact', 'advanced']) {
      const preset = raw.presets[presetName];
      expect(preset.code.imports).toBeTruthy();
      expect(preset.code.example).toBeTruthy();
    }
  });
});

describe('filter-bar resolvePatternPreset', () => {
  it('returns standard preset by default', () => {
    const result = resolvePatternPreset(FILTER_BAR_PATTERN);
    expect(result.preset).toBe('standard');
    expect(result.code.example).toContain('FilterBar');
  });

  it('returns compact preset when specified', () => {
    const result = resolvePatternPreset(FILTER_BAR_PATTERN, 'compact');
    expect(result.preset).toBe('compact');
    expect(result.code.example).toContain('FilterBarCompact');
  });

  it('returns advanced preset when specified', () => {
    const result = resolvePatternPreset(FILTER_BAR_PATTERN, 'advanced');
    expect(result.preset).toBe('advanced');
    expect(result.code.example).toContain('FilterBarAdvanced');
  });

  it('falls back to standard for unknown preset', () => {
    const result = resolvePatternPreset(FILTER_BAR_PATTERN, 'nonexistent');
    expect(result.preset).toBe('standard');
  });
});
