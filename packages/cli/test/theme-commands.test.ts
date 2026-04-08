import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateCustomTheme, createTheme, listCustomThemes, deleteTheme, importTheme } from '../src/theme-commands.js';

const THEME_SCHEMA_URL = 'https://decantr.ai/schemas/theme.v1.json';

describe('validateCustomTheme', () => {
  it('returns valid for complete theme', () => {
    const theme = {
      $schema: THEME_SCHEMA_URL,
      id: 'test',
      name: 'Test',
      seed: { primary: '#000', secondary: '#111', accent: '#222', background: '#fff' },
      modes: ['dark'],
      shapes: ['rounded'],
      decantr_compat: '>=1.0.0',
      source: 'custom'
    };

    const result = validateCustomTheme(theme);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns errors for missing required fields', () => {
    const theme = {
      id: 'test',
      name: 'Test'
      // missing seed, modes, shapes, decantr_compat, source
    };

    const result = validateCustomTheme(theme);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required field: seed');
    expect(result.errors).toContain('Missing required field: modes');
    expect(result.errors).toContain('Missing required field: shapes');
  });

  it('returns errors for missing seed colors', () => {
    const theme = {
      id: 'test',
      name: 'Test',
      seed: { primary: '#000' }, // missing secondary, accent, background
      modes: ['dark'],
      shapes: ['rounded'],
      decantr_compat: '>=1.0.0',
      source: 'custom'
    };

    const result = validateCustomTheme(theme);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing seed color: secondary');
    expect(result.errors).toContain('Missing seed color: accent');
    expect(result.errors).toContain('Missing seed color: background');
  });

  it('returns errors for invalid modes', () => {
    const theme = {
      id: 'test',
      name: 'Test',
      seed: { primary: '#000', secondary: '#111', accent: '#222', background: '#fff' },
      modes: ['auto'], // invalid
      shapes: ['rounded'],
      decantr_compat: '>=1.0.0',
      source: 'custom'
    };

    const result = validateCustomTheme(theme);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid mode "auto" - must be "light" or "dark"');
  });

  it('returns errors for invalid shapes', () => {
    const theme = {
      id: 'test',
      name: 'Test',
      seed: { primary: '#000', secondary: '#111', accent: '#222', background: '#fff' },
      modes: ['dark'],
      shapes: ['oval'], // invalid
      decantr_compat: '>=1.0.0',
      source: 'custom'
    };

    const result = validateCustomTheme(theme);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid shape "oval" - use: sharp, rounded, pill');
  });
});

describe('createTheme', () => {
  const testDir = join(process.cwd(), 'test-theme-create');

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('creates theme file in .decantr/custom/themes', () => {
    const result = createTheme(testDir, 'mytheme', 'My Theme');

    expect(result.success).toBe(true);
    expect(existsSync(join(testDir, '.decantr', 'custom', 'themes', 'mytheme.json'))).toBe(true);
  });

  it('creates how-to-theme.md if not exists', () => {
    createTheme(testDir, 'mytheme', 'My Theme');

    expect(existsSync(join(testDir, '.decantr', 'custom', 'themes', 'how-to-theme.md'))).toBe(true);
  });

  it('does not overwrite existing theme', () => {
    createTheme(testDir, 'mytheme', 'My Theme');
    const result = createTheme(testDir, 'mytheme', 'My Theme Again');

    expect(result.success).toBe(false);
    expect(result.error).toContain('already exists');
  });

  it('creates valid theme skeleton', () => {
    createTheme(testDir, 'mytheme', 'My Theme');

    const themePath = join(testDir, '.decantr', 'custom', 'themes', 'mytheme.json');
    const theme = JSON.parse(readFileSync(themePath, 'utf-8'));
    const validation = validateCustomTheme(theme);

    expect(validation.valid).toBe(true);
  });
});

describe('listCustomThemes', () => {
  const testDir = join(process.cwd(), 'test-theme-list');

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('returns empty array when no custom themes', () => {
    const themes = listCustomThemes(testDir);
    expect(themes).toHaveLength(0);
  });

  it('returns list of custom themes', () => {
    createTheme(testDir, 'theme1', 'Theme One');
    createTheme(testDir, 'theme2', 'Theme Two');

    const themes = listCustomThemes(testDir);

    expect(themes).toHaveLength(2);
    expect(themes.map(t => t.id)).toContain('theme1');
    expect(themes.map(t => t.id)).toContain('theme2');
  });
});

describe('deleteTheme', () => {
  const testDir = join(process.cwd(), 'test-theme-delete');

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('deletes existing theme', () => {
    createTheme(testDir, 'mytheme', 'My Theme');
    const themePath = join(testDir, '.decantr', 'custom', 'themes', 'mytheme.json');

    expect(existsSync(themePath)).toBe(true);

    const result = deleteTheme(testDir, 'mytheme');

    expect(result.success).toBe(true);
    expect(existsSync(themePath)).toBe(false);
  });

  it('returns error for non-existent theme', () => {
    const result = deleteTheme(testDir, 'nonexistent');

    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });
});

describe('importTheme', () => {
  const testDir = join(process.cwd(), 'test-theme-import');
  const importDir = join(process.cwd(), 'test-theme-import-source');

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
    mkdirSync(importDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
    rmSync(importDir, { recursive: true, force: true });
  });

  it('imports valid theme file', () => {
    const theme = {
      $schema: THEME_SCHEMA_URL,
      id: 'imported',
      name: 'Imported Theme',
      seed: { primary: '#000', secondary: '#111', accent: '#222', background: '#fff' },
      modes: ['dark'],
      shapes: ['rounded'],
      decantr_compat: '>=1.0.0',
      source: 'custom'
    };
    const sourcePath = join(importDir, 'external-theme.json');
    writeFileSync(sourcePath, JSON.stringify(theme));

    const result = importTheme(testDir, sourcePath);

    expect(result.success).toBe(true);
    expect(existsSync(join(testDir, '.decantr', 'custom', 'themes', 'imported.json'))).toBe(true);
  });

  it('rejects invalid theme file', () => {
    const theme = { id: 'bad', name: 'Bad' }; // missing required fields
    const sourcePath = join(importDir, 'bad-theme.json');
    writeFileSync(sourcePath, JSON.stringify(theme));

    const result = importTheme(testDir, sourcePath);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });
});
