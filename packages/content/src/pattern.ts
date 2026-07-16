import type { Pattern, PatternPreset } from './types.js';

export interface ResolvedPreset {
  preset: string;
  layout: PatternPreset['layout'];
  code: PatternPreset['code'];
}

export function resolvePatternPreset(
  pattern: Pattern,
  explicitPreset?: string,
  themeDefaultPresets?: Record<string, string>,
): ResolvedPreset {
  const presets = pattern.presets;
  const hasPresets = Object.keys(presets).length > 0;

  if (!hasPresets) {
    return {
      preset: '',
      layout: { layout: 'row', atoms: '' },
      code: pattern.code ?? { imports: '', example: '' },
    };
  }

  let presetName = explicitPreset;
  if (presetName && !presets[presetName]) presetName = undefined;
  if (!presetName && themeDefaultPresets?.[pattern.id]) {
    const themeName = themeDefaultPresets[pattern.id];
    if (presets[themeName]) presetName = themeName;
  }
  if (!presetName) presetName = pattern.default_preset;
  if (!presetName || !presets[presetName]) presetName = Object.keys(presets)[0];

  const preset = presets[presetName];
  return { preset: presetName, layout: preset.layout, code: preset.code };
}
