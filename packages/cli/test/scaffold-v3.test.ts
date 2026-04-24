import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { DetectedProject } from '../src/detect.js';
import type { InitOptions } from '../src/prompts.js';
import type { RegistryClient } from '../src/registry.js';
import type { ThemeData } from '../src/scaffold.js';
import {
  buildEssenceV3,
  refreshDerivedFiles,
  scaffoldMinimal,
  scaffoldProject,
} from '../src/scaffold.js';

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

    const fullResult = await scaffoldProject(
      testDir,
      defaultOptions,
      detected,
      createMockRegistry(),
    );
    const fullEssence = JSON.parse(readFileSync(fullResult.essencePath, 'utf-8'));

    // Both should be v3
    expect(minimalEssence.version).toBe('3.0.0');
    expect(fullEssence.version).toBe('3.0.0');

    // Both should have the same top-level structure
    expect(Object.keys(minimalEssence).sort()).toEqual(
      expect.arrayContaining(['version', 'dna', 'blueprint', 'meta']),
    );
    expect(Object.keys(fullEssence).sort()).toEqual(
      expect.arrayContaining(['version', 'dna', 'blueprint', 'meta']),
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

  it('buildEssenceV3 uses pathname routing for nextjs target', () => {
    const nextjs = buildEssenceV3({ ...defaultOptions, target: 'nextjs' });

    expect(nextjs.meta.target).toBe('nextjs');
    expect(nextjs.meta.platform.routing).toBe('pathname');
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
    const scaffoldTask = readFileSync(join(contextDir, 'task-scaffold.md'), 'utf-8');
    // task-scaffold.md should exist (always generated)
    expect(existsSync(join(contextDir, 'task-scaffold.md'))).toBe(true);
    expect(scaffoldTask).toContain('## What to Generate');
    // Mutation task contexts should NOT exist during initial scaffold
    expect(existsSync(join(contextDir, 'task-modify.md'))).toBe(false);
    expect(existsSync(join(contextDir, 'task-add-page.md'))).toBe(false);
  });

  it('scaffoldProject emits scaffold, section, and page packs when cache contains required registry content', async () => {
    const cacheRoot = join(testDir, '.decantr', 'cache', '@official');
    mkdirSync(join(cacheRoot, 'themes'), { recursive: true });
    mkdirSync(join(cacheRoot, 'patterns'), { recursive: true });

    writeFileSync(
      join(cacheRoot, 'themes', 'luminarum.json'),
      JSON.stringify(
        {
          id: 'luminarum',
          name: 'Luminarum',
          spatial: {
            card_wrapping: 'always',
          },
        },
        null,
        2,
      ),
    );

    writeFileSync(
      join(cacheRoot, 'patterns', 'hero.json'),
      JSON.stringify(
        {
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
        },
        null,
        2,
      ),
    );

    await scaffoldProject(testDir, defaultOptions, detected, createMockRegistry());

    const packPath = join(testDir, '.decantr', 'context', 'scaffold-pack.md');
    const packJsonPath = join(testDir, '.decantr', 'context', 'scaffold-pack.json');
    const sectionPackPath = join(testDir, '.decantr', 'context', 'section-custom-pack.md');
    const sectionPackJsonPath = join(testDir, '.decantr', 'context', 'section-custom-pack.json');
    const pagePackPath = join(testDir, '.decantr', 'context', 'page-home-pack.md');
    const pagePackJsonPath = join(testDir, '.decantr', 'context', 'page-home-pack.json');
    const reviewPackPath = join(testDir, '.decantr', 'context', 'review-pack.md');
    const reviewPackJsonPath = join(testDir, '.decantr', 'context', 'review-pack.json');
    const addMutationPackPath = join(testDir, '.decantr', 'context', 'mutation-add-page-pack.md');
    const addMutationPackJsonPath = join(
      testDir,
      '.decantr',
      'context',
      'mutation-add-page-pack.json',
    );
    const modifyMutationPackPath = join(testDir, '.decantr', 'context', 'mutation-modify-pack.md');
    const modifyMutationPackJsonPath = join(
      testDir,
      '.decantr',
      'context',
      'mutation-modify-pack.json',
    );
    const manifestPath = join(testDir, '.decantr', 'context', 'pack-manifest.json');
    expect(existsSync(packPath)).toBe(true);
    expect(existsSync(packJsonPath)).toBe(true);
    expect(existsSync(sectionPackPath)).toBe(true);
    expect(existsSync(sectionPackJsonPath)).toBe(true);
    expect(existsSync(pagePackPath)).toBe(true);
    expect(existsSync(pagePackJsonPath)).toBe(true);
    expect(existsSync(reviewPackPath)).toBe(true);
    expect(existsSync(reviewPackJsonPath)).toBe(true);
    expect(existsSync(addMutationPackPath)).toBe(true);
    expect(existsSync(addMutationPackJsonPath)).toBe(true);
    expect(existsSync(modifyMutationPackPath)).toBe(true);
    expect(existsSync(modifyMutationPackJsonPath)).toBe(true);
    expect(existsSync(manifestPath)).toBe(true);

    const content = readFileSync(packPath, 'utf-8');
    const packJson = JSON.parse(readFileSync(packJsonPath, 'utf-8'));
    const sectionContent = readFileSync(sectionPackPath, 'utf-8');
    const sectionPackJson = JSON.parse(readFileSync(sectionPackJsonPath, 'utf-8'));
    const pageContent = readFileSync(pagePackPath, 'utf-8');
    const pagePackJson = JSON.parse(readFileSync(pagePackJsonPath, 'utf-8'));
    const reviewContent = readFileSync(reviewPackPath, 'utf-8');
    const reviewJson = JSON.parse(readFileSync(reviewPackJsonPath, 'utf-8'));
    const addMutationContent = readFileSync(addMutationPackPath, 'utf-8');
    const addMutationJson = JSON.parse(readFileSync(addMutationPackJsonPath, 'utf-8'));
    const modifyMutationContent = readFileSync(modifyMutationPackPath, 'utf-8');
    const modifyMutationJson = JSON.parse(readFileSync(modifyMutationPackJsonPath, 'utf-8'));
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    const scaffoldTask = readFileSync(
      join(testDir, '.decantr', 'context', 'task-scaffold.md'),
      'utf-8',
    );
    expect(content).toContain('# Scaffold Pack');
    expect(content).toContain('react-vite (react)');
    expect(content).toContain('- / -> home @ sidebar-main [hero]');
    expect(packJson.$schema).toBe('https://decantr.ai/schemas/scaffold-pack.v1.json');
    expect(packJson.packType).toBe('scaffold');
    expect(packJson.data.routes).toEqual([
      {
        pageId: 'home',
        path: '/',
        shell: 'sidebar-main',
        patternIds: ['hero'],
      },
    ]);
    expect(sectionContent).toContain('# Section Pack');
    expect(sectionContent).toContain('- Section: custom');
    expect(sectionContent).toContain('- / -> home @ sidebar-main [hero]');
    expect(sectionPackJson.$schema).toBe('https://decantr.ai/schemas/section-pack.v1.json');
    expect(sectionPackJson.packType).toBe('section');
    expect(sectionPackJson.data.sectionId).toBe('custom');
    expect(sectionPackJson.data.routes).toEqual([
      {
        pageId: 'home',
        path: '/',
        shell: 'sidebar-main',
        patternIds: ['hero'],
      },
    ]);
    expect(pageContent).toContain('# Page Pack');
    expect(pageContent).toContain('- Page: home');
    expect(pageContent).toContain('- Path: /');
    expect(pageContent).toContain('- hero -> hero [hero | default]');
    expect(pagePackJson.$schema).toBe('https://decantr.ai/schemas/page-pack.v1.json');
    expect(pagePackJson.packType).toBe('page');
    expect(pagePackJson.data.pageId).toBe('home');
    expect(pagePackJson.data.path).toBe('/');
    expect(pagePackJson.data.sectionId).toBe('custom');
    expect(pagePackJson.data.patterns).toEqual([
      {
        id: 'hero',
        alias: 'hero',
        preset: 'default',
        layout: 'hero',
      },
    ]);
    expect(reviewContent).toContain('# Review Pack');
    expect(reviewContent).toContain('## Focus Areas');
    expect(reviewJson.$schema).toBe('https://decantr.ai/schemas/review-pack.v1.json');
    expect(reviewJson.packType).toBe('review');
    expect(reviewJson.data.reviewType).toBe('app');
    expect(addMutationContent).toContain('# Mutation Pack');
    expect(addMutationContent).toContain('- Operation: add-page');
    expect(addMutationJson.$schema).toBe('https://decantr.ai/schemas/mutation-pack.v1.json');
    expect(addMutationJson.packType).toBe('mutation');
    expect(addMutationJson.data.mutationType).toBe('add-page');
    expect(modifyMutationContent).toContain('- Operation: modify');
    expect(modifyMutationJson.$schema).toBe('https://decantr.ai/schemas/mutation-pack.v1.json');
    expect(modifyMutationJson.data.mutationType).toBe('modify');
    expect(manifest.$schema).toBe('https://decantr.ai/schemas/pack-manifest.v1.json');
    expect(manifest.scaffold).toEqual({
      id: 'scaffold',
      markdown: 'scaffold-pack.md',
      json: 'scaffold-pack.json',
    });
    expect(manifest.review).toEqual({
      id: 'review',
      markdown: 'review-pack.md',
      json: 'review-pack.json',
    });
    expect(manifest.sections).toEqual([
      {
        id: 'custom',
        markdown: 'section-custom-pack.md',
        json: 'section-custom-pack.json',
        pageIds: ['home'],
      },
    ]);
    expect(manifest.pages).toEqual([
      {
        id: 'home',
        markdown: 'page-home-pack.md',
        json: 'page-home-pack.json',
        sectionId: 'custom',
        sectionRole: 'primary',
      },
    ]);
    expect(manifest.mutations).toEqual([
      {
        id: 'add-page',
        markdown: 'mutation-add-page-pack.md',
        json: 'mutation-add-page-pack.json',
        mutationType: 'add-page',
      },
      {
        id: 'modify',
        markdown: 'mutation-modify-pack.md',
        json: 'mutation-modify-pack.json',
        mutationType: 'modify',
      },
    ]);
    expect(scaffoldTask).toContain('## Primary Compiled Contract');
    expect(scaffoldTask).toContain('.decantr/context/scaffold-pack.md');
    expect(scaffoldTask).toContain('Page `home` -> `.decantr/context/page-home-pack.md`');
    expect(scaffoldTask).toContain('- `/` -> `home` [hero]');
    expect(scaffoldTask).toContain('Post-scaffold enforcement mode: **GUIDED**.');
  });

  it('refreshDerivedFiles emits pack-backed mutation task contexts when compiled packs exist', async () => {
    const cacheRoot = join(testDir, '.decantr', 'cache', '@official');
    mkdirSync(join(cacheRoot, 'themes'), { recursive: true });
    mkdirSync(join(cacheRoot, 'patterns'), { recursive: true });

    writeFileSync(
      join(cacheRoot, 'themes', 'luminarum.json'),
      JSON.stringify(
        {
          id: 'luminarum',
          name: 'Luminarum',
        },
        null,
        2,
      ),
    );

    writeFileSync(
      join(cacheRoot, 'patterns', 'hero.json'),
      JSON.stringify(
        {
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
        },
        null,
        2,
      ),
    );

    const result = await scaffoldProject(testDir, defaultOptions, detected, createMockRegistry());
    const essence = JSON.parse(readFileSync(result.essencePath, 'utf-8'));

    await refreshDerivedFiles(testDir, essence, createMockRegistry());

    const contextDir = join(testDir, '.decantr', 'context');
    const addPageTask = readFileSync(join(contextDir, 'task-add-page.md'), 'utf-8');
    const modifyTask = readFileSync(join(contextDir, 'task-modify.md'), 'utf-8');

    expect(addPageTask).toContain('## Primary Compiled Contract');
    expect(addPageTask).toContain('.decantr/context/mutation-add-page-pack.md');
    expect(addPageTask).toContain('.decantr/context/scaffold-pack.md');
    expect(addPageTask).toContain('Section `custom` -> `.decantr/context/section-custom-pack.md`');
    expect(modifyTask).toContain('.decantr/context/mutation-modify-pack.md');
    expect(modifyTask).toContain('decantr_get_page_context');
    expect(modifyTask).toContain('## Strict Checks');
    expect(modifyTask).toContain('Page `home` -> `.decantr/context/page-home-pack.md`');
  });

  it('scaffoldProject preserves pathname routing in essence and scaffold packs for nextjs target', async () => {
    const cacheRoot = join(testDir, '.decantr', 'cache', '@official');
    mkdirSync(join(cacheRoot, 'themes'), { recursive: true });
    mkdirSync(join(cacheRoot, 'patterns'), { recursive: true });

    writeFileSync(
      join(cacheRoot, 'themes', 'luminarum.json'),
      JSON.stringify(
        {
          id: 'luminarum',
          name: 'Luminarum',
        },
        null,
        2,
      ),
    );

    writeFileSync(
      join(cacheRoot, 'patterns', 'hero.json'),
      JSON.stringify(
        {
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
        },
        null,
        2,
      ),
    );

    await scaffoldProject(
      testDir,
      { ...defaultOptions, target: 'nextjs' },
      { ...detected, framework: 'nextjs' },
      createMockRegistry(),
    );

    const essence = JSON.parse(readFileSync(join(testDir, 'decantr.essence.json'), 'utf-8'));
    await refreshDerivedFiles(testDir, essence, createMockRegistry());
    const scaffoldPack = JSON.parse(
      readFileSync(join(testDir, '.decantr', 'context', 'scaffold-pack.json'), 'utf-8'),
    );

    expect(essence.meta.target).toBe('nextjs');
    expect(essence.meta.platform.routing).toBe('pathname');
    expect(scaffoldPack.target.adapter).toBe('nextjs');
    expect(scaffoldPack.data.routing).toBe('pathname');
  });
});
