import type { Pattern, PatternPreset } from './types.js';

export interface ResolvedPreset {
  preset: string;
  blend: PatternPreset['blend'];
  code: PatternPreset['code'];
}

export function resolvePatternPreset(
  pattern: Pattern,
  explicitPreset?: string,
  recipeDefaultPresets?: Record<string, string>,
): ResolvedPreset {
  const presets = pattern.presets;
  const hasPresets = Object.keys(presets).length > 0;

  if (!hasPresets) {
    return {
      preset: '',
      blend: { layout: 'row', atoms: '' },
      code: pattern.code ?? { imports: '', example: '' },
    };
  }

  let presetName = explicitPreset;
  if (presetName && !presets[presetName]) presetName = undefined;
  if (!presetName && recipeDefaultPresets?.[pattern.id]) {
    const recipeName = recipeDefaultPresets[pattern.id];
    if (presets[recipeName]) presetName = recipeName;
  }
  if (!presetName) presetName = pattern.default_preset;
  if (!presetName || !presets[presetName]) presetName = Object.keys(presets)[0];

  const preset = presets[presetName];
  return { preset: presetName, blend: preset.blend, code: preset.code };
}
