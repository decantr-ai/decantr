import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getHowToThemeDoc, getThemeSkeleton } from './theme-templates.js';

export interface ThemeValidationResult {
  valid: boolean;
  errors: string[];
}

const REQUIRED_FIELDS = [
  '$schema',
  'id',
  'name',
  'description',
  'seed',
  'modes',
  'shapes',
  'decantr_compat',
  'source',
];
const REQUIRED_SEED = ['primary', 'secondary', 'accent', 'background'];
const VALID_MODES = ['light', 'dark'];
const VALID_SHAPES = ['sharp', 'rounded', 'pill'];
const THEME_SCHEMA_URL = 'https://decantr.ai/schemas/theme.v1.json';

export function validateCustomTheme(theme: Record<string, unknown>): ThemeValidationResult {
  const errors: string[] = [];

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!(field in theme)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  for (const field of ['id', 'name', 'description']) {
    const value = theme[field];
    if (value !== undefined && (typeof value !== 'string' || value.trim().length === 0)) {
      errors.push(`Field "${field}" must be a non-empty string`);
    }
  }

  if ('$schema' in theme && theme.$schema !== THEME_SCHEMA_URL) {
    errors.push(`Invalid $schema "${String(theme.$schema)}" - must be "${THEME_SCHEMA_URL}"`);
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
    errors,
  };
}

export interface CreateThemeResult {
  success: boolean;
  path?: string;
  error?: string;
}

export function createTheme(projectRoot: string, id: string, name: string): CreateThemeResult {
  const customThemesDir = join(projectRoot, '.decantr', 'custom', 'themes');
  const themePath = join(customThemesDir, `${id}.json`);
  const howToPath = join(customThemesDir, 'how-to-theme.md');

  // Create directory if needed
  mkdirSync(customThemesDir, { recursive: true });

  // Check if theme already exists
  if (existsSync(themePath)) {
    return {
      success: false,
      error: `Theme "${id}" already exists at ${themePath}`,
    };
  }

  // Write theme skeleton
  const skeleton = getThemeSkeleton(id, name);
  writeFileSync(themePath, JSON.stringify(skeleton, null, 2));

  // Write how-to doc if not exists
  if (!existsSync(howToPath)) {
    writeFileSync(howToPath, getHowToThemeDoc());
  }

  return {
    success: true,
    path: themePath,
  };
}

export interface CustomThemeInfo {
  id: string;
  name: string;
  description?: string;
  path: string;
}

export function listCustomThemes(projectRoot: string): CustomThemeInfo[] {
  const customThemesDir = join(projectRoot, '.decantr', 'custom', 'themes');

  if (!existsSync(customThemesDir)) {
    return [];
  }

  const themes: CustomThemeInfo[] = [];

  try {
    const files = readdirSync(customThemesDir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const filePath = join(customThemesDir, file);
      try {
        const data = JSON.parse(readFileSync(filePath, 'utf-8'));
        themes.push({
          id: data.id || file.replace('.json', ''),
          name: data.name || data.id,
          description: data.description,
          path: filePath,
        });
      } catch {
        // Skip invalid JSON files
      }
    }
  } catch {
    // Directory read error
  }

  return themes;
}

export interface DeleteThemeResult {
  success: boolean;
  error?: string;
}

export function deleteTheme(projectRoot: string, id: string): DeleteThemeResult {
  const themePath = join(projectRoot, '.decantr', 'custom', 'themes', `${id}.json`);

  if (!existsSync(themePath)) {
    return {
      success: false,
      error: `Theme "${id}" not found at ${themePath}`,
    };
  }

  try {
    rmSync(themePath);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: `Failed to delete: ${(e as Error).message}`,
    };
  }
}

export interface ImportThemeResult {
  success: boolean;
  path?: string;
  errors?: string[];
}

export function importTheme(projectRoot: string, sourcePath: string): ImportThemeResult {
  if (!existsSync(sourcePath)) {
    return {
      success: false,
      errors: [`Source file not found: ${sourcePath}`],
    };
  }

  let theme: Record<string, unknown>;
  try {
    theme = JSON.parse(readFileSync(sourcePath, 'utf-8'));
  } catch (e) {
    return {
      success: false,
      errors: [`Invalid JSON: ${(e as Error).message}`],
    };
  }

  // Validate the theme
  const validation = validateCustomTheme(theme);
  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors,
    };
  }

  // Ensure source is set to custom
  theme.source = 'custom';

  const id = theme.id as string;
  const customThemesDir = join(projectRoot, '.decantr', 'custom', 'themes');
  const destPath = join(customThemesDir, `${id}.json`);

  mkdirSync(customThemesDir, { recursive: true });

  // Write how-to doc if not exists
  const howToPath = join(customThemesDir, 'how-to-theme.md');
  if (!existsSync(howToPath)) {
    writeFileSync(howToPath, getHowToThemeDoc());
  }

  writeFileSync(destPath, JSON.stringify(theme, null, 2));

  return {
    success: true,
    path: destPath,
  };
}
