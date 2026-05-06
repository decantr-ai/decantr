import { describe, expect, it } from 'vitest';
import type { DetectedProject } from '../src/detect.js';
import { mergeWithDefaults } from '../src/prompts.js';

function detectedProject(overrides: Partial<DetectedProject> = {}): DetectedProject {
  return {
    framework: 'unknown',
    packageManager: 'unknown',
    hasTypeScript: false,
    hasTailwind: false,
    existingRuleFiles: [],
    existingEssence: false,
    projectRoot: '/tmp/project',
    ...overrides,
  };
}

describe('mergeWithDefaults', () => {
  it('preserves existing app styling defaults for detected brownfield and hybrid footprints', () => {
    const options = mergeWithDefaults(
      { blueprint: 'agent-marketplace' },
      detectedProject({ framework: 'nextjs', packageManager: 'pnpm', hasTailwind: true }),
    );

    expect(options.theme).toBe('existing');
    expect(options.mode).toBe('auto');
    expect(options.shell).toBe('observed-existing-shell');
    expect(options.personality).toEqual(['observed brownfield product']);
  });

  it('lets explicit themes override existing app defaults', () => {
    const options = mergeWithDefaults(
      { theme: 'luminarum' },
      detectedProject({ framework: 'react', packageManager: 'npm' }),
    );

    expect(options.theme).toBe('luminarum');
  });
});
