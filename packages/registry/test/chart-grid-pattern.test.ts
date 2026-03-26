import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { resolvePatternPreset } from '../src/pattern.js';
import type { Pattern } from '../src/types.js';

const PATTERN_PATH = resolve(__dirname, '../../../content/patterns/chart-grid.json');
const raw = JSON.parse(readFileSync(PATTERN_PATH, 'utf-8'));

// AUTO: Cast to registry Pattern type (pattern JSON has extra fields the type doesn't require)
const CHART_PATTERN: Pattern = {
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

describe('chart-grid pattern JSON', () => {
  it('is valid JSON with required fields', () => {
    expect(raw.id).toBe('chart-grid');
    expect(raw.name).toBe('Chart Grid');
    expect(raw.version).toBe('1.0.0');
    expect(raw.description).toBeTruthy();
  });

  it('has dashboard, wide, and mixed presets', () => {
    expect(raw.presets).toHaveProperty('dashboard');
    expect(raw.presets).toHaveProperty('wide');
    expect(raw.presets).toHaveProperty('mixed');
    expect(raw.default_preset).toBe('dashboard');
  });

  it('dashboard preset has correct grid blend layout', () => {
    const dashboard = raw.presets.dashboard;
    expect(dashboard.blend.layout).toBe('grid');
    expect(dashboard.blend.atoms).toContain('_grid');
    expect(dashboard.blend.atoms).toContain('_gc1');
    expect(dashboard.blend.atoms).toContain('_lg:gc2');
    expect(dashboard.blend.atoms).toContain('_gap4');
  });

  it('wide preset uses flex row layout with overflow', () => {
    const wide = raw.presets.wide;
    expect(wide.blend.layout).toBe('row');
    expect(wide.blend.atoms).toContain('_flex');
    expect(wide.blend.atoms).toContain('_row');
    expect(wide.blend.atoms).toContain('_overflow[auto]');
  });

  it('mixed preset has grid layout for asymmetric charts', () => {
    const mixed = raw.presets.mixed;
    expect(mixed.blend.layout).toBe('grid');
    expect(mixed.blend.atoms).toContain('_grid');
    expect(mixed.blend.atoms).toContain('_lg:gc2');
  });

  it('has io declarations: consumes date-range and filters', () => {
    expect(raw.io).toBeDefined();
    expect(raw.io.consumes).toContain('date-range');
    expect(raw.io.consumes).toContain('filters');
  });

  it('lists Card as a component', () => {
    expect(raw.components).toContain('Card');
  });

  it('all presets have code with imports and example', () => {
    for (const presetName of ['dashboard', 'wide', 'mixed']) {
      const preset = raw.presets[presetName];
      expect(preset.code.imports).toBeTruthy();
      expect(preset.code.example).toBeTruthy();
    }
  });

  it('chart placeholder code uses data-chart-type attributes', () => {
    const dashboard = raw.presets.dashboard;
    expect(dashboard.code.example).toContain('data-chart-type');
    expect(dashboard.code.example).toContain('chart placeholder');
  });

  it('dashboard preset references all four chart types', () => {
    const example = raw.presets.dashboard.code.example;
    expect(example).toContain("'line'");
    expect(example).toContain("'bar'");
    expect(example).toContain("'pie'");
    expect(example).toContain("'area'");
  });
});

describe('chart-grid resolvePatternPreset', () => {
  it('returns dashboard preset by default', () => {
    const result = resolvePatternPreset(CHART_PATTERN);
    expect(result.preset).toBe('dashboard');
    expect(result.code.example).toContain('ChartGrid');
  });

  it('returns wide preset when specified', () => {
    const result = resolvePatternPreset(CHART_PATTERN, 'wide');
    expect(result.preset).toBe('wide');
    expect(result.code.example).toContain('ChartGridWide');
  });

  it('returns mixed preset when specified', () => {
    const result = resolvePatternPreset(CHART_PATTERN, 'mixed');
    expect(result.preset).toBe('mixed');
    expect(result.code.example).toContain('ChartGridMixed');
  });

  it('falls back to dashboard for unknown preset', () => {
    const result = resolvePatternPreset(CHART_PATTERN, 'nonexistent');
    expect(result.preset).toBe('dashboard');
  });
});
