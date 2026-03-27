import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateCustomTheme, createTheme } from '../src/theme-commands.js';

describe('validateCustomTheme', () => {
  it('returns valid for complete theme', () => {
    const theme = {
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
