import { describe, expect, it } from 'vitest';
import type { DetectedProject } from '../src/detect.js';
import { adoptionUsesDecantrRuntimeCss, resolveWorkflowPolicy } from '../src/workflow-model.js';

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

describe('resolveWorkflowPolicy', () => {
  it('defaults new content-backed projects to greenfield scaffold with contract-only adoption', () => {
    const policy = resolveWorkflowPolicy({
      command: 'new',
      detected: detectedProject(),
      requestedBlueprint: true,
    });

    expect(policy.workflowMode).toBe('greenfield-scaffold');
    expect(policy.adoptionMode).toBe('contract-only');
  });

  it('treats existing corpus-backed init as hybrid contract-only unless greenfield is explicit', () => {
    const policy = resolveWorkflowPolicy({
      command: 'init',
      detected: detectedProject({ framework: 'react', packageManager: 'pnpm' }),
      requestedBlueprint: true,
    });

    expect(policy.workflowMode).toBe('hybrid-compose');
    expect(policy.adoptionMode).toBe('contract-only');
    expect(policy.contentRequired).toBe(true);
  });

  it('honors explicit greenfield workflow even when an existing footprint is detected', () => {
    const policy = resolveWorkflowPolicy({
      command: 'init',
      detected: detectedProject({ framework: 'react', packageManager: 'pnpm' }),
      requestedWorkflow: 'greenfield',
      requestedBlueprint: true,
    });

    expect(policy.workflowMode).toBe('greenfield-scaffold');
    expect(policy.adoptionMode).toBe('contract-only');
  });

  it('reserves Decantr runtime CSS ownership for explicit decantr-css adoption', () => {
    expect(adoptionUsesDecantrRuntimeCss('contract-only')).toBe(false);
    expect(adoptionUsesDecantrRuntimeCss('style-bridge')).toBe(false);
    expect(adoptionUsesDecantrRuntimeCss('decantr-css')).toBe(true);
  });
});
