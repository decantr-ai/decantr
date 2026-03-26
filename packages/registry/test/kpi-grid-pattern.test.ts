import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { resolvePatternPreset } from '../src/pattern.js';
import type { Pattern } from '../src/types.js';

const PATTERN_PATH = resolve(__dirname, '../../../content/patterns/kpi-grid.json');
const raw = JSON.parse(readFileSync(PATTERN_PATH, 'utf-8'));

// AUTO: Cast to registry Pattern type (pattern JSON has extra fields the type doesn't require)
const KPI_PATTERN: Pattern = {
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

describe('kpi-grid pattern JSON', () => {
  it('is valid JSON with required fields', () => {
    expect(raw.id).toBe('kpi-grid');
    expect(raw.name).toBe('KPI Grid');
    expect(raw.version).toBe('1.0.0');
    expect(raw.description).toBeTruthy();
  });

  it('has dashboard and compact presets', () => {
    expect(raw.presets).toHaveProperty('dashboard');
    expect(raw.presets).toHaveProperty('compact');
    expect(raw.default_preset).toBe('dashboard');
  });

  it('dashboard preset has correct blend layout', () => {
    const dashboard = raw.presets.dashboard;
    expect(dashboard.blend.layout).toBe('grid');
    expect(dashboard.blend.atoms).toContain('_grid');
    expect(dashboard.blend.atoms).toContain('_gc2');
    expect(dashboard.blend.atoms).toContain('_lg:gc4');
    expect(dashboard.blend.atoms).toContain('_gap4');
  });

  it('compact preset has denser layout atoms', () => {
    const compact = raw.presets.compact;
    expect(compact.blend.layout).toBe('grid');
    expect(compact.blend.atoms).toContain('_gap2');
  });

  it('has io declarations for produces and consumes', () => {
    expect(raw.io).toBeDefined();
    expect(raw.io.produces).toContain('kpi-data');
    expect(raw.io.consumes).toContain('date-range');
  });

  it('lists Card, icon, and Badge as components', () => {
    expect(raw.components).toContain('Card');
    expect(raw.components).toContain('icon');
    expect(raw.components).toContain('Badge');
  });

  it('both presets have code with imports and example', () => {
    for (const presetName of ['dashboard', 'compact']) {
      const preset = raw.presets[presetName];
      expect(preset.code.imports).toBeTruthy();
      expect(preset.code.example).toBeTruthy();
    }
  });
});

describe('kpi-grid resolvePatternPreset', () => {
  it('returns dashboard preset by default', () => {
    const result = resolvePatternPreset(KPI_PATTERN);
    expect(result.preset).toBe('dashboard');
    expect(result.code.example).toContain('KpiGrid');
  });

  it('returns compact preset when specified', () => {
    const result = resolvePatternPreset(KPI_PATTERN, 'compact');
    expect(result.preset).toBe('compact');
    expect(result.code.example).toContain('KpiGridCompact');
  });

  it('falls back to dashboard for unknown preset', () => {
    const result = resolvePatternPreset(KPI_PATTERN, 'nonexistent');
    expect(result.preset).toBe('dashboard');
  });
});
