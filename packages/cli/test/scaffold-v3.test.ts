import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { scaffoldProject, scaffoldMinimal, buildEssenceV3 } from '../src/scaffold.js';
import type { InitOptions } from '../src/prompts.js';
import type { DetectedProject } from '../src/detect.js';

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
    expect(v3.dna.theme.style).toBe('luminarum');
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

  it('scaffoldProject generates v3 essence file', () => {
    const result = scaffoldProject(testDir, defaultOptions, detected);

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
    expect(essence.dna.theme.style).toBe('default');
    expect(essence.blueprint).toBeDefined();
    expect(essence.blueprint.pages).toHaveLength(1);
    expect(essence.meta).toBeDefined();
    expect(essence.meta.guard.mode).toBe('guided');
  });

  it('scaffoldMinimal and scaffoldProject both produce v3', () => {
    // Test that both paths produce consistent v3 output
    const minimalResult = scaffoldMinimal(testDir);
    const minimalEssence = JSON.parse(readFileSync(minimalResult.essencePath, 'utf-8'));

    // Clean up and create fresh dir for scaffoldProject
    rmSync(testDir, { recursive: true, force: true });
    mkdirSync(join(testDir, 'src'), { recursive: true });

    const fullResult = scaffoldProject(testDir, defaultOptions, detected);
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
});
