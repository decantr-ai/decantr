import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { LayoutAnalysis } from './analyzers/layout.js';
import type { StylingAnalysis } from './analyzers/styling.js';
import type { DetectedProject } from './detect.js';
import type { ProjectScope } from './workspace.js';

export type DecantrWorkflow = 'greenfield-blueprint' | 'brownfield-adoption' | 'hybrid-composition';

export type WorkflowMode =
  | 'greenfield-scaffold'
  | 'greenfield-contract-only'
  | 'brownfield-attach'
  | 'hybrid-compose';

export type WorkflowFlag = 'greenfield' | 'brownfield' | 'hybrid';
export type AdoptionMode = 'contract-only' | 'style-bridge' | 'decantr-css';
export type ContentSource = 'none' | 'official' | 'custom' | 'cache';
export type AssistantBridgeMode = 'none' | 'preview' | 'apply';

export interface WorkflowPolicy {
  workflowMode: WorkflowMode;
  adoptionMode: AdoptionMode;
  contentSource: ContentSource;
  assistantBridge: AssistantBridgeMode;
  projectScope: ProjectScope;
  hasAnalysisArtifacts: boolean;
  registryRequired: boolean;
}

export interface WorkflowInitDefaults {
  theme?: string;
  mode?: 'dark' | 'light' | 'auto';
  target?: string;
  guard?: 'creative' | 'guided' | 'strict';
  density?: 'compact' | 'comfortable' | 'spacious';
  shell?: string;
  existing?: boolean;
  workflowMode?: WorkflowMode;
  adoptionMode?: AdoptionMode;
  contentSource?: ContentSource;
  assistantBridge?: AssistantBridgeMode;
  projectScope?: ProjectScope;
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
  return (
    detected.framework !== 'unknown' ||
    detected.packageManager !== 'unknown' ||
    detected.hasTypeScript ||
    detected.hasTailwind ||
    detected.existingRuleFiles.length > 0
  );
}

function normalizeWorkflowFlag(value?: string): WorkflowFlag | undefined {
  if (value === 'greenfield' || value === 'brownfield' || value === 'hybrid') return value;
  return undefined;
}

function normalizeAdoptionMode(value?: string): AdoptionMode | undefined {
  if (value === 'contract-only' || value === 'style-bridge' || value === 'decantr-css') {
    return value;
  }
  return undefined;
}

function normalizeAssistantBridge(value?: string): AssistantBridgeMode | undefined {
  if (value === 'none' || value === 'preview' || value === 'apply') return value;
  return undefined;
}

export function resolveWorkflowPolicy(input: {
  command: 'init' | 'new' | 'magic' | 'refresh';
  detected: DetectedProject;
  workflowSeed?: BrownfieldInitSeed | null;
  requestedWorkflow?: string;
  requestedAdoption?: string;
  requestedAssistantBridge?: string;
  requestedBlueprint?: boolean;
  requestedArchetype?: boolean;
  requestedTheme?: boolean;
  explicitExisting?: boolean;
  offline?: boolean;
  projectScope?: ProjectScope;
}): WorkflowPolicy {
  const requestedWorkflow = normalizeWorkflowFlag(input.requestedWorkflow);
  const requestedAdoption = normalizeAdoptionMode(input.requestedAdoption);
  const requestedAssistantBridge = normalizeAssistantBridge(input.requestedAssistantBridge);
  const hasRegistryContent = Boolean(
    input.requestedBlueprint || input.requestedArchetype || input.requestedTheme,
  );
  const hasAnalysisArtifacts = Boolean(input.workflowSeed);
  const existingFootprint = hasExistingProjectFootprint(input.detected);

  let workflowMode: WorkflowMode;
  if (requestedWorkflow === 'hybrid') {
    workflowMode = 'hybrid-compose';
  } else if (requestedWorkflow === 'brownfield' || input.explicitExisting || input.workflowSeed) {
    workflowMode = 'brownfield-attach';
  } else if (requestedWorkflow === 'greenfield') {
    workflowMode = hasRegistryContent ? 'greenfield-scaffold' : 'greenfield-contract-only';
  } else if (input.command === 'new') {
    workflowMode = hasRegistryContent ? 'greenfield-scaffold' : 'greenfield-contract-only';
  } else if (existingFootprint && hasRegistryContent) {
    workflowMode = 'hybrid-compose';
  } else if (existingFootprint && !hasRegistryContent) {
    workflowMode = 'brownfield-attach';
  } else {
    workflowMode = hasRegistryContent ? 'greenfield-scaffold' : 'greenfield-contract-only';
  }

  const adoptionMode: AdoptionMode =
    requestedAdoption ??
    input.workflowSeed?.adoptionMode ??
    'contract-only';

  const contentSource: ContentSource = hasRegistryContent
    ? input.offline
      ? 'cache'
      : 'official'
    : 'none';

  const assistantBridge: AssistantBridgeMode =
    requestedAssistantBridge ??
    input.workflowSeed?.assistantBridge ??
    (workflowMode === 'brownfield-attach' && input.detected.existingRuleFiles.length > 0
      ? 'preview'
      : 'none');

  return {
    workflowMode,
    adoptionMode,
    contentSource,
    assistantBridge,
    projectScope: input.projectScope ?? 'single-app',
    hasAnalysisArtifacts,
    registryRequired: hasRegistryContent,
  };
}

export function parseWorkflowFlag(value?: string): WorkflowFlag | undefined {
  return normalizeWorkflowFlag(value);
}

export function parseAdoptionMode(value?: string): AdoptionMode | undefined {
  return normalizeAdoptionMode(value);
}

export function parseAssistantBridgeMode(value?: string): AssistantBridgeMode | undefined {
  return normalizeAssistantBridge(value);
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
    adoptionMode: 'contract-only',
    contentSource: 'none',
    assistantBridge: detected.existingRuleFiles.length > 0 ? 'preview' : 'none',
    projectScope: 'single-app',
    target: detected.framework !== 'unknown' ? detected.framework : 'react',
    shell: inferSuggestedShell(layout),
    guard: 'guided',
    density: 'comfortable',
    theme: 'existing',
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
