import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { CONTENT_TYPE_TO_API_CONTENT_TYPE, type ContentType } from '@decantr/registry';
import { cmdCreate } from '../src/commands/create.js';
import { validateCustomTheme } from '../src/theme-commands.js';

function readCreatedContent(projectRoot: string, type: ContentType, id: string): Record<string, unknown> {
  const plural = CONTENT_TYPE_TO_API_CONTENT_TYPE[type];
  const filePath = join(projectRoot, '.decantr', 'custom', plural, `${id}.json`);

  expect(existsSync(filePath)).toBe(true);
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

describe('cmdCreate', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-create-'));
    process.exitCode = undefined;
  });

  afterEach(() => {
    process.exitCode = undefined;
    rmSync(testDir, { recursive: true, force: true });
  });

  it('creates a schema-ready pattern skeleton', () => {
    cmdCreate('pattern', 'starter-pattern', testDir);

    const pattern = readCreatedContent(testDir, 'pattern', 'starter-pattern');

    expect(pattern.$schema).toBe('https://decantr.ai/schemas/pattern.v2.json');
    expect(pattern.description).toMatch(/\S/);
    expect(pattern.default_preset).toBe('standard');
    expect(pattern.presets).toEqual({
      standard: {
        description: expect.any(String),
        layout: {
          layout: 'stack',
          atoms: '_flex _col _gap4',
        },
      },
    });
  });

  it('creates a schema-ready theme skeleton', () => {
    cmdCreate('theme', 'starter-theme', testDir);

    const theme = readCreatedContent(testDir, 'theme', 'starter-theme');
    const validation = validateCustomTheme(theme);

    expect(theme.$schema).toBe('https://decantr.ai/schemas/theme.v1.json');
    expect(theme.description).toMatch(/\S/);
    expect(validation.valid).toBe(true);
  });

  it('creates a schema-ready blueprint skeleton', () => {
    cmdCreate('blueprint', 'starter-blueprint', testDir);

    const blueprint = readCreatedContent(testDir, 'blueprint', 'starter-blueprint');

    expect(blueprint.$schema).toBe('https://decantr.ai/schemas/blueprint.v1.json');
    expect(blueprint.description).toMatch(/\S/);
    expect(blueprint.theme).toEqual({
      id: 'carbon',
      mode: 'dark',
      shape: 'rounded',
    });
    expect(blueprint.routes).toEqual({
      '/': {
        page: 'home',
        shell: 'top-nav-main',
        archetype: 'starter-home',
      },
    });
  });

  it('creates a schema-ready archetype skeleton', () => {
    cmdCreate('archetype', 'starter-archetype', testDir);

    const archetype = readCreatedContent(testDir, 'archetype', 'starter-archetype');

    expect(archetype.$schema).toBe('https://decantr.ai/schemas/archetype.v2.json');
    expect(archetype.description).toMatch(/\S/);
    expect(archetype.role).toBe('primary');
    expect(archetype.pages).toEqual([
      {
        id: 'home',
        description: 'Starter page for your primary flow.',
        shell: 'top-nav-main',
        patterns: [],
        default_layout: [],
      },
    ]);
    expect(archetype.suggested_theme).toEqual({
      ids: ['carbon'],
      modes: ['dark'],
      shapes: ['rounded'],
    });
  });

  it('creates a schema-ready shell skeleton', () => {
    cmdCreate('shell', 'starter-shell', testDir);

    const shell = readCreatedContent(testDir, 'shell', 'starter-shell');

    expect(shell.$schema).toBe('https://decantr.ai/schemas/shell.v1.json');
    expect(shell.description).toMatch(/\S/);
    expect(shell.layout).toBe('stack');
    expect(shell.atoms).toBe('_flex _col _h[100vh]');
    expect(shell.config).toEqual({
      regions: ['header', 'body'],
    });
  });
});
