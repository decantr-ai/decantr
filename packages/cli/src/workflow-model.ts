import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { LayoutAnalysis } from './analyzers/layout.js';
import type { StylingAnalysis } from './analyzers/styling.js';
import type { DetectedProject } from './detect.js';

export type DecantrWorkflow =
  | 'greenfield-blueprint'
  | 'brownfield-adoption'
  | 'hybrid-composition';

export interface WorkflowInitDefaults {
  theme?: string;
  mode?: 'dark' | 'light' | 'auto';
  target?: string;
  guard?: 'creative' | 'guided' | 'strict';
  density?: 'compact' | 'comfortable' | 'spacious';
  shell?: string;
  existing?: boolean;
}

export interface BrownfieldInitSeed extends WorkflowInitDefaults {
  version: 1;
  workflow: 'brownfield-adoption';
  contractOnly: true;
  registryOptional: true;
  notes: string[];
}

export function inferSuggestedShell(layout: LayoutAnalysis): string {
  if (layout.hasSidebar) return 'sidebar-main';
  if (layout.hasTopNav) return 'top-nav-main';
  return 'full-bleed';
}

export function hasExistingProjectFootprint(detected: DetectedProject): boolean {
  return detected.framework !== 'unknown'
    || detected.packageManager !== 'unknown'
    || detected.hasTypeScript
    || detected.hasTailwind
    || detected.existingRuleFiles.length > 0;
}

export function createBrownfieldInitSeed(
  detected: DetectedProject,
  layout: LayoutAnalysis,
  styling: StylingAnalysis,
): BrownfieldInitSeed {
  return {
    version: 1,
    workflow: 'brownfield-adoption',
    contractOnly: true,
    registryOptional: true,
    workflowMode: 'brownfield-attach',
    target: detected.framework !== 'unknown' ? detected.framework : 'react',
    shell: inferSuggestedShell(layout),
    guard: 'guided',
    density: 'comfortable',
    theme: 'luminarum',
    mode: styling.darkMode ? 'dark' : 'auto',
    existing: true,
    notes: [
      'Use decantr init --existing to attach Decantr contract and context files to this project.',
      'Registry content is optional during brownfield adoption.',
      'Use decantr add/remove, decantr theme switch, and registry commands later for hybrid composition.',
    ],
  };
}

export function readBrownfieldInitSeed(projectRoot: string): BrownfieldInitSeed | null {
  const seedPath = join(projectRoot, '.decantr', 'init-seed.json');
  if (!existsSync(seedPath)) {
    return null;
  }

  try {
    const parsed = JSON.parse(readFileSync(seedPath, 'utf-8')) as BrownfieldInitSeed;
    if (parsed.workflow !== 'brownfield-adoption') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
