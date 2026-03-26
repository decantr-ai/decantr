import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { resolvePatternPreset } from '../src/pattern.js';
import type { Pattern } from '../src/types.js';

const PATTERN_PATH = resolve(__dirname, '../../../content/patterns/form-sections.json');
const raw = JSON.parse(readFileSync(PATTERN_PATH, 'utf-8'));

// AUTO: Cast to registry Pattern type (pattern JSON has extra fields the type doesn't require)
const FORM_PATTERN: Pattern = {
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

describe('form-sections pattern JSON', () => {
  it('is valid JSON with required fields', () => {
    expect(raw.id).toBe('form-sections');
    expect(raw.name).toBe('Form Sections');
    expect(raw.version).toBe('1.0.0');
    expect(raw.description).toBeTruthy();
  });

  it('has settings, creation, and structured presets', () => {
    expect(raw.presets).toHaveProperty('settings');
    expect(raw.presets).toHaveProperty('creation');
    expect(raw.presets).toHaveProperty('structured');
    expect(raw.default_preset).toBe('settings');
  });

  it('settings preset has 2-column grid layout', () => {
    const settings = raw.presets.settings;
    expect(settings.layout.layout).toBe('stack');
    expect(settings.layout.atoms).toContain('_flex');
    expect(settings.layout.atoms).toContain('_col');
    expect(settings.layout.atoms).toContain('_gap6');
  });

  it('creation preset uses single-column wizard layout', () => {
    const creation = raw.presets.creation;
    expect(creation.layout.layout).toBe('stack');
    expect(creation.layout.atoms).toContain('_mw[640px]');
    expect(creation.layout.atoms).toContain('_mx[auto]');
  });

  it('structured preset has dense form layout', () => {
    const structured = raw.presets.structured;
    expect(structured.layout.layout).toBe('stack');
    expect(structured.layout.atoms).toContain('_gap4');
  });

  it('includes all required form components', () => {
    expect(raw.components).toContain('Input');
    expect(raw.components).toContain('Select');
    expect(raw.components).toContain('Switch');
    expect(raw.components).toContain('Button');
    expect(raw.components).toContain('Label');
    expect(raw.components).toContain('Card');
  });

  it('io actions include save, cancel, and reset', () => {
    expect(raw.io).toBeDefined();
    expect(raw.io.actions).toContain('save');
    expect(raw.io.actions).toContain('cancel');
    expect(raw.io.actions).toContain('reset');
  });

  it('io consumes data and produces form-data', () => {
    expect(raw.io.consumes).toContain('data');
    expect(raw.io.produces).toContain('form-data');
  });

  it('all presets have code with imports and example', () => {
    for (const presetName of ['settings', 'creation', 'structured']) {
      const preset = raw.presets[presetName];
      expect(preset.code.imports).toBeTruthy();
      expect(preset.code.example).toBeTruthy();
    }
  });

  it('settings preset code uses 2-column grid layout', () => {
    const settings = raw.presets.settings;
    expect(settings.code.example).toContain('_grid');
    expect(settings.code.example).toContain('_gc1');
    expect(settings.code.example).toContain('_lg:gc2');
  });

  it('creation preset code has step indicators', () => {
    const creation = raw.presets.creation;
    expect(creation.code.example).toContain('Step 1 of 3');
  });

  it('structured preset code uses RadioGroup and Checkbox', () => {
    const structured = raw.presets.structured;
    expect(structured.code.example).toContain('RadioGroup');
    expect(structured.code.example).toContain('Checkbox');
  });
});

describe('form-sections resolvePatternPreset', () => {
  it('returns settings preset by default', () => {
    const result = resolvePatternPreset(FORM_PATTERN);
    expect(result.preset).toBe('settings');
    expect(result.code.example).toContain('FormSections');
  });

  it('returns creation preset when specified', () => {
    const result = resolvePatternPreset(FORM_PATTERN, 'creation');
    expect(result.preset).toBe('creation');
    expect(result.code.example).toContain('FormSectionsCreation');
  });

  it('returns structured preset when specified', () => {
    const result = resolvePatternPreset(FORM_PATTERN, 'structured');
    expect(result.preset).toBe('structured');
    expect(result.code.example).toContain('FormSectionsStructured');
  });

  it('falls back to settings for unknown preset', () => {
    const result = resolvePatternPreset(FORM_PATTERN, 'nonexistent');
    expect(result.preset).toBe('settings');
  });
});
