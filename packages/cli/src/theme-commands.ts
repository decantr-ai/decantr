import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { getThemeSkeleton, getHowToThemeDoc } from './theme-templates.js';

export interface ThemeValidationResult {
  valid: boolean;
  errors: string[];
}

const REQUIRED_FIELDS = ['id', 'name', 'seed', 'modes', 'shapes', 'decantr_compat', 'source'];
const REQUIRED_SEED = ['primary', 'secondary', 'accent', 'background'];
const VALID_MODES = ['light', 'dark'];
const VALID_SHAPES = ['sharp', 'rounded', 'pill'];

export function validateCustomTheme(theme: Record<string, unknown>): ThemeValidationResult {
  const errors: string[] = [];

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!(field in theme)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check seed colors
  if (theme.seed && typeof theme.seed === 'object') {
    const seed = theme.seed as Record<string, unknown>;
    for (const color of REQUIRED_SEED) {
      if (!(color in seed)) {
        errors.push(`Missing seed color: ${color}`);
      }
    }
  }

  // Check modes
  if (Array.isArray(theme.modes)) {
    for (const mode of theme.modes) {
      if (!VALID_MODES.includes(mode as string)) {
        errors.push(`Invalid mode "${mode}" - must be "light" or "dark"`);
      }
    }
  }

  // Check shapes
  if (Array.isArray(theme.shapes)) {
    for (const shape of theme.shapes) {
      if (!VALID_SHAPES.includes(shape as string)) {
        errors.push(`Invalid shape "${shape}" - use: sharp, rounded, pill`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
