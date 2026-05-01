import { describe, expect, it } from 'vitest';
import type { DetectedProject } from '../src/detect.js';
import { resolveWorkflowPolicy } from '../src/workflow-model.js';

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
  it('defaults new registry-backed projects to greenfield scaffold with Decantr CSS', () => {
    const policy = resolveWorkflowPolicy({
      command: 'new',
      detected: detectedProject(),
      requestedBlueprint: true,
    });

    expect(policy.workflowMode).toBe('greenfield-scaffold');
    expect(policy.adoptionMode).toBe('decantr-css');
  });

  it('treats existing registry-backed init as hybrid contract-only unless greenfield is explicit', () => {
    const policy = resolveWorkflowPolicy({
      command: 'init',
      detected: detectedProject({ framework: 'react', packageManager: 'pnpm' }),
      requestedBlueprint: true,
    });

    expect(policy.workflowMode).toBe('hybrid-compose');
    expect(policy.adoptionMode).toBe('contract-only');
    expect(policy.registryRequired).toBe(true);
  });

  it('honors explicit greenfield workflow even when an existing footprint is detected', () => {
    const policy = resolveWorkflowPolicy({
      command: 'init',
      detected: detectedProject({ framework: 'react', packageManager: 'pnpm' }),
      requestedWorkflow: 'greenfield',
      requestedBlueprint: true,
    });

    expect(policy.workflowMode).toBe('greenfield-scaffold');
    expect(policy.adoptionMode).toBe('decantr-css');
  });
});
