import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { applyAssistantBridge, buildAssistantBridgeContent } from '../src/assistant-bridge.js';
import type { DetectedProject } from '../src/detect.js';

const detected: DetectedProject = {
  framework: 'react',
  packageManager: 'pnpm',
  hasTypeScript: true,
  hasTailwind: true,
  existingRuleFiles: ['AGENTS.md'],
  existingEssence: true,
};

describe('assistant bridge', () => {
  let testDir = '';

  afterEach(() => {
    if (testDir) rmSync(testDir, { recursive: true, force: true });
  });

  it('uses only greenfield contract artifacts in a greenfield bridge', () => {
    const content = buildAssistantBridgeContent({
      detected,
      workflowMode: 'greenfield-contract-only',
      adoptionMode: 'contract-only',
      assistantBridge: 'preview',
    });

    expect(content).toContain('.decantr/context/scaffold.md');
    expect(content).toContain('.decantr/graph/contract-capsule.json');
    expect(content).not.toContain('.decantr/context/review-pack.md');
    expect(content).toContain('Decantr does not own the runtime or CSS layer');
    expect(content).not.toContain('.decantr/brownfield-report.md');
    expect(content).not.toContain('.decantr/doctrine-map.json');
    expect(content).not.toContain('Brownfield contract');
  });

  it('does not require optional Brownfield artifacts that task context did not list', () => {
    const content = buildAssistantBridgeContent({
      detected,
      workflowMode: 'brownfield-attach',
      adoptionMode: 'contract-only',
      assistantBridge: 'preview',
    });

    expect(content).toContain('.decantr/context/scaffold.md');
    expect(content).toContain('never assume an unlisted artifact exists');
    expect(content).not.toContain('.decantr/brownfield-report.md');
    expect(content).not.toContain('.decantr/doctrine-map.json');
    expect(content).not.toContain('.decantr/ambient-context.json');
  });

  it('keeps Greenfield style-bridge guidance on the host styling authority', () => {
    const content = buildAssistantBridgeContent({
      detected,
      workflowMode: 'greenfield-contract-only',
      adoptionMode: 'style-bridge',
      assistantBridge: 'preview',
    });

    expect(content).toContain('Styling remains host-owned');
    expect(content).toContain('accepted `.decantr/style-bridge.json`');
    expect(content).toContain('does not generate or overwrite runtime CSS');
    expect(content).not.toContain('Use Decantr CSS where generated');
    expect(content).not.toContain('src/styles/tokens.css');
  });

  it('upgrades an existing bridge block to the recorded workflow in place', () => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-assistant-bridge-'));
    mkdirSync(join(testDir, '.decantr'), { recursive: true });
    writeFileSync(
      join(testDir, '.decantr', 'project.json'),
      JSON.stringify({
        initialized: {
          workflowMode: 'greenfield-contract-only',
          adoptionMode: 'contract-only',
        },
      }),
    );
    writeFileSync(
      join(testDir, 'AGENTS.md'),
      '# Existing rules\n\n<!-- decantr:assistant-bridge:start -->\nOld Brownfield instructions\n<!-- decantr:assistant-bridge:end -->\n',
    );

    expect(applyAssistantBridge(testDir, detected)).toEqual(['AGENTS.md']);
    const content = readFileSync(join(testDir, 'AGENTS.md'), 'utf-8');
    expect(content).toContain('.decantr/context/scaffold.md');
    expect(content).not.toContain('.decantr/context/review-pack.md');
    expect(content).not.toContain('Old Brownfield instructions');
    expect((content.match(/decantr:assistant-bridge:start/g) || []).length).toBe(1);
    expect(applyAssistantBridge(testDir, detected)).toEqual([]);
  });
});
