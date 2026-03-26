import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { resolvePatternPreset } from '../src/pattern.js';
import type { Pattern } from '../src/types.js';

const PATTERN_PATH = resolve(__dirname, '../../../content/patterns/data-table.json');
const raw = JSON.parse(readFileSync(PATTERN_PATH, 'utf-8'));

// AUTO: Cast to registry Pattern type
const DATA_TABLE_PATTERN: Pattern = {
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

describe('data-table pattern JSON', () => {
  it('is valid JSON with required fields', () => {
    expect(raw.id).toBe('data-table');
    expect(raw.name).toBe('Data Table');
    expect(raw.version).toBe('1.0.0');
    expect(raw.description).toBeTruthy();
  });

  it('has standard and compact presets', () => {
    expect(raw.presets).toHaveProperty('standard');
    expect(raw.presets).toHaveProperty('compact');
    expect(raw.default_preset).toBe('standard');
  });

  it('standard preset has correct blend layout', () => {
    const standard = raw.presets.standard;
    expect(standard.blend.layout).toBe('column');
    expect(standard.blend.atoms).toContain('_w[100%]');
    expect(standard.blend.atoms).toContain('_overflow[auto]');
  });

  it('compact preset has denser layout atoms', () => {
    const compact = raw.presets.compact;
    expect(compact.blend.layout).toBe('column');
    expect(compact.blend.atoms).toContain('_gap2');
  });

  it('has io declarations with search and filters in consumes', () => {
    expect(raw.io).toBeDefined();
    expect(raw.io.consumes).toContain('search');
    expect(raw.io.consumes).toContain('filters');
    expect(raw.io.consumes).toContain('data');
    expect(raw.io.produces).toContain('selection');
    expect(raw.io.produces).toContain('sort');
    expect(raw.io.actions).toContain('export');
    expect(raw.io.actions).toContain('delete');
    expect(raw.io.actions).toContain('edit');
  });

  it('lists Table, Checkbox, Button, Input, Badge, and icon as components', () => {
    expect(raw.components).toContain('Table');
    expect(raw.components).toContain('Checkbox');
    expect(raw.components).toContain('Button');
    expect(raw.components).toContain('Input');
    expect(raw.components).toContain('Badge');
    expect(raw.components).toContain('icon');
  });

  it('both presets have code with imports and example', () => {
    for (const presetName of ['standard', 'compact']) {
      const preset = raw.presets[presetName];
      expect(preset.code.imports).toBeTruthy();
      expect(preset.code.example).toBeTruthy();
    }
  });
});

describe('data-table resolvePatternPreset', () => {
  it('returns standard preset by default', () => {
    const result = resolvePatternPreset(DATA_TABLE_PATTERN);
    expect(result.preset).toBe('standard');
    expect(result.code.example).toContain('DataTable');
  });

  it('returns compact preset when specified', () => {
    const result = resolvePatternPreset(DATA_TABLE_PATTERN, 'compact');
    expect(result.preset).toBe('compact');
    expect(result.code.example).toContain('DataTableCompact');
  });

  it('falls back to standard for unknown preset', () => {
    const result = resolvePatternPreset(DATA_TABLE_PATTERN, 'nonexistent');
    expect(result.preset).toBe('standard');
  });
});
