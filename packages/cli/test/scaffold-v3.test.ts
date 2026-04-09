import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, readFileSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { scaffoldProject, scaffoldMinimal, buildEssenceV3 } from '../src/scaffold.js';
import type { ThemeData } from '../src/scaffold.js';
import type { InitOptions } from '../src/prompts.js';
import type { DetectedProject } from '../src/detect.js';
import type { RegistryClient } from '../src/registry.js';

/** Minimal mock RegistryClient that returns null for all fetches. */
function createMockRegistry(): RegistryClient {
  return {
    fetchTheme: async () => null,
    fetchPattern: async () => null,
  } as unknown as RegistryClient;
}

describe('v3 scaffold', () => {
  const testDir = join(process.cwd(), 'test-scaffold-v3-project');

  const defaultOptions: InitOptions = {
    theme: 'luminarum',
    mode: 'dark',
    shape: 'rounded',
    target: 'react',
    guard: 'guided',
    density: 'comfortable',
    shell: 'sidebar-main',
    personality: ['professional', 'clean'],
    features: ['auth'],
    existing: false,
  };

  const detected: DetectedProject = {
    framework: 'react',
    packageManager: 'npm',
    hasTypeScript: true,
    hasTailwind: false,
    existingRuleFiles: [],
    existingEssence: false,
  };

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
    // Create a minimal src directory for CSS output
    mkdirSync(join(testDir, 'src'), { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('buildEssenceV3 produces valid v3 structure', () => {
    const v3 = buildEssenceV3(defaultOptions);

    expect(v3.version).toBe('3.0.0');
    expect(v3.dna).toBeDefined();
    expect(v3.blueprint).toBeDefined();
    expect(v3.meta).toBeDefined();

    // DNA checks
    expect(v3.dna.theme.id).toBe('luminarum');
    expect(v3.dna.theme.mode).toBe('dark');
    expect(v3.dna.spacing.density).toBe('comfortable');
    expect(v3.dna.radius.philosophy).toBe('rounded');
    expect(v3.dna.radius.base).toBe(8);
    expect(v3.dna.accessibility.wcag_level).toBe('AA');
    expect(v3.dna.personality).toEqual(['professional', 'clean']);

    // Blueprint checks
    expect(v3.blueprint.shell).toBe('sidebar-main');
    expect(v3.blueprint.pages.length).toBeGreaterThan(0);
    expect(v3.blueprint.features).toContain('auth');

    // Meta checks
    expect(v3.meta.target).toBe('react');
    expect(v3.meta.guard.mode).toBe('guided');
    expect(v3.meta.guard.dna_enforcement).toBe('error');
  });

  it('scaffoldProject generates v3 essence file', async () => {
    const result = await scaffoldProject(testDir, defaultOptions, detected, createMockRegistry());

    expect(existsSync(result.essencePath)).toBe(true);

    const essence = JSON.parse(readFileSync(result.essencePath, 'utf-8'));
    expect(essence.version).toBe('3.0.0');
    expect(essence.dna).toBeDefined();
    expect(essence.blueprint).toBeDefined();
    expect(essence.meta).toBeDefined();
  });

  it('scaffoldMinimal generates v3 essence file', () => {
    const result = scaffoldMinimal(testDir);

    expect(existsSync(result.essencePath)).toBe(true);

    const essence = JSON.parse(readFileSync(result.essencePath, 'utf-8'));
    expect(essence.version).toBe('3.0.0');
    expect(essence.dna).toBeDefined();
    expect(essence.dna.theme.id).toBe('default');
    expect(essence.blueprint).toBeDefined();
    expect(essence.blueprint.pages).toHaveLength(1);
    expect(essence.meta).toBeDefined();
    expect(essence.meta.guard.mode).toBe('guided');
  });

  it('scaffoldMinimal and scaffoldProject both produce v3', async () => {
    // Test that both paths produce consistent v3 output
    const minimalResult = scaffoldMinimal(testDir);
    const minimalEssence = JSON.parse(readFileSync(minimalResult.essencePath, 'utf-8'));

    // Clean up and create fresh dir for scaffoldProject
    rmSync(testDir, { recursive: true, force: true });
    mkdirSync(join(testDir, 'src'), { recursive: true });

    const fullResult = await scaffoldProject(testDir, defaultOptions, detected, createMockRegistry());
    const fullEssence = JSON.parse(readFileSync(fullResult.essencePath, 'utf-8'));

    // Both should be v3
    expect(minimalEssence.version).toBe('3.0.0');
    expect(fullEssence.version).toBe('3.0.0');

    // Both should have the same top-level structure
    expect(Object.keys(minimalEssence).sort()).toEqual(
      expect.arrayContaining(['version', 'dna', 'blueprint', 'meta'])
    );
    expect(Object.keys(fullEssence).sort()).toEqual(
      expect.arrayContaining(['version', 'dna', 'blueprint', 'meta'])
    );
  });

  it('buildEssenceV3 maps shape to correct radius base', () => {
    const pill = buildEssenceV3({ ...defaultOptions, shape: 'pill' });
    expect(pill.dna.radius.base).toBe(12);
    expect(pill.dna.radius.philosophy).toBe('pill');

    const sharp = buildEssenceV3({ ...defaultOptions, shape: 'sharp' });
    expect(sharp.dna.radius.base).toBe(2);
    expect(sharp.dna.radius.philosophy).toBe('sharp');
  });

  it('buildEssenceV3 maps guard modes correctly', () => {
    const strict = buildEssenceV3({ ...defaultOptions, guard: 'strict' });
    expect(strict.meta.guard.dna_enforcement).toBe('error');
    expect(strict.meta.guard.blueprint_enforcement).toBe('warn');

    const creative = buildEssenceV3({ ...defaultOptions, guard: 'creative' });
    expect(creative.meta.guard.dna_enforcement).toBe('off');
    expect(creative.meta.guard.blueprint_enforcement).toBe('off');
  });

  it('buildEssenceV3 with theme hints produces matching dna.typography values', () => {
    const themeHints: ThemeData = {
      typography: { scale: 'linear', heading_weight: 700, body_weight: 350 },
    };
    const v3 = buildEssenceV3(defaultOptions, undefined, themeHints);

    expect(v3.dna.typography.scale).toBe('linear');
    expect(v3.dna.typography.heading_weight).toBe(700);
    expect(v3.dna.typography.body_weight).toBe(350);
  });

  it('buildEssenceV3 with theme radius overrides shape-based defaults', () => {
    const themeHints: ThemeData = {
      radius: { philosophy: 'pill', base: 16 },
    };
    // Options say 'rounded' (base 8), but theme overrides to pill/16
    const v3 = buildEssenceV3(defaultOptions, undefined, themeHints);

    expect(v3.dna.radius.philosophy).toBe('pill');
    expect(v3.dna.radius.base).toBe(16);
  });

  it('buildEssenceV3 with theme motion hints sets motion preference', () => {
    const themeHints: ThemeData = {
      motion: { preference: 'expressive', reduce_motion: false },
    };
    const v3 = buildEssenceV3(defaultOptions, undefined, themeHints);

    expect(v3.dna.motion.preference).toBe('expressive');
    expect(v3.dna.motion.reduce_motion).toBe(false);
  });

  it('buildEssenceV3 with NO hints falls back to hardcoded defaults', () => {
    const v3 = buildEssenceV3(defaultOptions);

    // Typography defaults
    expect(v3.dna.typography.scale).toBe('modular');
    expect(v3.dna.typography.heading_weight).toBe(600);
    expect(v3.dna.typography.body_weight).toBe(400);

    // Motion defaults
    expect(v3.dna.motion.preference).toBe('subtle');
    expect(v3.dna.motion.reduce_motion).toBe(true);

    // Radius defaults from shape ('rounded')
    expect(v3.dna.radius.philosophy).toBe('rounded');
    expect(v3.dna.radius.base).toBe(8);
  });

  it('scaffoldProject skips task-modify.md and task-add-page.md during init', async () => {
    await scaffoldProject(testDir, defaultOptions, detected, createMockRegistry());

    const contextDir = join(testDir, '.decantr', 'context');
    // task-scaffold.md should exist (always generated)
    expect(existsSync(join(contextDir, 'task-scaffold.md'))).toBe(true);
    // Mutation task contexts should NOT exist during initial scaffold
    expect(existsSync(join(contextDir, 'task-modify.md'))).toBe(false);
    expect(existsSync(join(contextDir, 'task-add-page.md'))).toBe(false);
  });

  it('scaffoldProject emits scaffold-pack.md when cache contains required registry content', async () => {
    const cacheRoot = join(testDir, '.decantr', 'cache', '@official');
    mkdirSync(join(cacheRoot, 'themes'), { recursive: true });
    mkdirSync(join(cacheRoot, 'patterns'), { recursive: true });

    writeFileSync(join(cacheRoot, 'themes', 'luminarum.json'), JSON.stringify({
      id: 'luminarum',
      name: 'Luminarum',
      spatial: {
        card_wrapping: 'always',
      },
    }, null, 2));

    writeFileSync(join(cacheRoot, 'patterns', 'hero.json'), JSON.stringify({
      id: 'hero',
      name: 'Hero',
      contained: false,
      components: [],
      presets: {
        default: {
          layout: {
            layout: 'hero',
            atoms: '',
          },
          code: {
            imports: '',
            example: '<section />',
          },
        },
      },
    }, null, 2));

    await scaffoldProject(testDir, defaultOptions, detected, createMockRegistry());

    const packPath = join(testDir, '.decantr', 'context', 'scaffold-pack.md');
    const packJsonPath = join(testDir, '.decantr', 'context', 'scaffold-pack.json');
    const sectionPackPath = join(testDir, '.decantr', 'context', 'section-custom-pack.md');
    const sectionPackJsonPath = join(testDir, '.decantr', 'context', 'section-custom-pack.json');
    expect(existsSync(packPath)).toBe(true);
    expect(existsSync(packJsonPath)).toBe(true);
    expect(existsSync(sectionPackPath)).toBe(true);
    expect(existsSync(sectionPackJsonPath)).toBe(true);

    const content = readFileSync(packPath, 'utf-8');
    const packJson = JSON.parse(readFileSync(packJsonPath, 'utf-8'));
    const sectionContent = readFileSync(sectionPackPath, 'utf-8');
    const sectionPackJson = JSON.parse(readFileSync(sectionPackJsonPath, 'utf-8'));
    expect(content).toContain('# Scaffold Pack');
    expect(content).toContain('react-vite (react)');
    expect(content).toContain('- / -> home [hero]');
    expect(packJson.packType).toBe('scaffold');
    expect(packJson.data.routes).toEqual([
      {
        pageId: 'home',
        path: '/',
        patternIds: ['hero'],
      },
    ]);
    expect(sectionContent).toContain('# Section Pack');
    expect(sectionContent).toContain('- Section: custom');
    expect(sectionContent).toContain('- / -> home [hero]');
    expect(sectionPackJson.packType).toBe('section');
    expect(sectionPackJson.data.sectionId).toBe('custom');
    expect(sectionPackJson.data.routes).toEqual([
      {
        pageId: 'home',
        path: '/',
        patternIds: ['hero'],
      },
    ]);
  });
});
