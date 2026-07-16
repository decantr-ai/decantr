import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { DetectedProject } from './detect.js';
import type { AdoptionMode, AssistantBridgeMode, WorkflowMode } from './workflow-model.js';

const START = '<!-- decantr:assistant-bridge:start -->';
const END = '<!-- decantr:assistant-bridge:end -->';

interface AssistantBridgeContext {
  workflowMode: WorkflowMode;
  adoptionMode?: AdoptionMode;
}

function isWorkflowMode(value: unknown): value is WorkflowMode {
  return (
    value === 'greenfield-scaffold' ||
    value === 'greenfield-contract-only' ||
    value === 'brownfield-attach' ||
    value === 'hybrid-compose'
  );
}

function isAdoptionMode(value: unknown): value is AdoptionMode {
  return value === 'contract-only' || value === 'style-bridge' || value === 'decantr-css';
}

export function readAssistantBridgeContext(projectRoot: string): AssistantBridgeContext {
  try {
    const project = JSON.parse(
      readFileSync(join(projectRoot, '.decantr', 'project.json'), 'utf-8'),
    ) as {
      initialized?: { workflowMode?: unknown; adoptionMode?: unknown };
    };
    return {
      workflowMode: isWorkflowMode(project.initialized?.workflowMode)
        ? project.initialized.workflowMode
        : 'brownfield-attach',
      adoptionMode: isAdoptionMode(project.initialized?.adoptionMode)
        ? project.initialized.adoptionMode
        : undefined,
    };
  } catch {
    return { workflowMode: 'brownfield-attach' };
  }
}

function bridgeBlock(input: AssistantBridgeContext): string {
  const lines = [
    START,
    'Before editing any route, run `decantr task <route> "<intent>"` and use the printed authority block, read targets, local law, evidence, and verify command as the working contract.',
  ];

  if (input.workflowMode === 'brownfield-attach') {
    lines.push(
      'Before implementing Decantr-scoped work, read `decantr.essence.json`, `.decantr/brownfield-report.md`, `.decantr/doctrine-map.json`, `.decantr/ambient-context.json`, `.decantr/context/scaffold.md`, and the route-specific task read targets first. Use compiled packs too when task context lists them.',
      'Treat Decantr as the reconciled contract layer and the original project docs/rules as cited evidence; if runtime source and Decantr context conflict, stop and report the drift instead of guessing which side wins.',
      'Preserve the existing framework, routing, styling, package manager, data boundaries, and build conventions unless the Decantr contract explicitly records a reviewed change.',
    );
  } else if (input.workflowMode === 'hybrid-compose') {
    lines.push(
      'Before implementing Decantr-scoped work, read `decantr.essence.json`, `.decantr/context/scaffold-pack.md`, `.decantr/context/review-pack.md`, and the route-specific task read targets first.',
      'Use compiled Decantr packs for the composed contract and existing project docs/rules as implementation evidence; if they conflict, stop and report the drift instead of guessing which side wins.',
      'Preserve the host framework, routing, styling, package manager, data boundaries, and working runtime while implementing the reviewed Decantr composition.',
    );
  } else if (input.workflowMode === 'greenfield-contract-only') {
    lines.push(
      'Before implementing Decantr-scoped work, read `decantr.essence.json`, `.decantr/context/scaffold.md`, the matching narrative section context, `.decantr/graph/contract-capsule.json`, and the route-specific task read targets first.',
      'Treat the Essence contract and local generated context as primary authority; use compiled execution packs when they are later hydrated. If generated context and runtime source conflict, stop and report the drift instead of guessing which side wins.',
      "Implement the contract with the project's chosen framework and host styling system; Decantr does not own the runtime or CSS layer.",
    );
  } else {
    lines.push(
      'Before implementing Decantr-scoped work, read `decantr.essence.json`, `.decantr/context/scaffold-pack.md`, `.decantr/context/review-pack.md`, and the route-specific task read targets first.',
      'Treat the Essence contract and compiled execution packs as primary authority; if generated context and runtime source conflict, stop and report the drift instead of guessing which side wins.',
      'Implement shared shell and route structure before filling section pages, while respecting the declared framework and host styling system.',
    );
  }

  lines.push(
    `Adoption mode is \`${input.adoptionMode || 'contract-only'}\`. Do not install \`@decantr/css\` or rewrite styling unless that mode is \`decantr-css\` or the task explicitly asks for it.`,
    END,
    '',
  );
  return lines.join('\n');
}

export function buildAssistantBridgeContent(input: {
  detected: DetectedProject;
  workflowMode: WorkflowMode;
  adoptionMode?: AdoptionMode;
  assistantBridge: AssistantBridgeMode;
}): string {
  const lines: string[] = [];
  lines.push('# Decantr Assistant Bridge');
  lines.push('');
  lines.push(
    input.workflowMode === 'brownfield-attach'
      ? 'Use this bridge when an AI assistant works in a repository with existing local rules that Decantr has reconciled into a Brownfield contract.'
      : "Use this bridge when an AI assistant implements a Decantr contract alongside the repository's local rules.",
  );
  lines.push('');
  lines.push(`- Workflow mode: ${input.workflowMode}`);
  lines.push(`- Detected framework: ${input.detected.framework}`);
  lines.push(`- Package manager: ${input.detected.packageManager}`);
  lines.push(
    `- Existing rule files: ${input.detected.existingRuleFiles.length > 0 ? input.detected.existingRuleFiles.join(', ') : 'none detected'}`,
  );
  lines.push(`- Bridge mode: ${input.assistantBridge}`);
  lines.push(`- Adoption mode: ${input.adoptionMode || 'contract-only'}`);
  lines.push('');
  lines.push('## Suggested Rule Block');
  lines.push('');
  lines.push(
    bridgeBlock({ workflowMode: input.workflowMode, adoptionMode: input.adoptionMode }).trimEnd(),
  );
  lines.push('');
  return `${lines.join('\n')}\n`;
}

export function writeAssistantBridgePreview(input: {
  projectRoot: string;
  detected: DetectedProject;
  workflowMode: WorkflowMode;
  adoptionMode?: AdoptionMode;
  assistantBridge: AssistantBridgeMode;
}): string {
  const contextDir = join(input.projectRoot, '.decantr', 'context');
  mkdirSync(contextDir, { recursive: true });
  const bridgePath = join(contextDir, 'assistant-bridge.md');
  writeFileSync(bridgePath, buildAssistantBridgeContent(input));
  return bridgePath;
}

function upsertMarkdownBlock(path: string, context: AssistantBridgeContext): boolean {
  const block = bridgeBlock(context);
  if (!existsSync(path)) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `# Project Rules\n\n${block}`);
    return true;
  }

  const content = readFileSync(path, 'utf-8');
  const start = content.indexOf(START);
  const end = content.indexOf(END, start + START.length);
  if (start >= 0 && end >= start) {
    const updated = `${content.slice(0, start)}${block.trimEnd()}${content.slice(end + END.length)}`;
    if (updated === content) return false;
    writeFileSync(path, updated);
    return true;
  }
  appendFileSync(path, `\n\n${block}`);
  return true;
}

function writeCursorRule(projectRoot: string, context: AssistantBridgeContext): boolean {
  const path = join(projectRoot, '.cursor', 'rules', 'decantr.mdc');
  const content = `---
description: Decantr project contract and assistant bridge
alwaysApply: true
---

${bridgeBlock(context)}`;

  if (existsSync(path) && readFileSync(path, 'utf-8') === content) return false;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  return true;
}

function writeClaudeRule(projectRoot: string, context: AssistantBridgeContext): boolean {
  const path = join(projectRoot, '.claude', 'rules', 'decantr.md');
  const content = `# Decantr Assistant Bridge\n\n${bridgeBlock(context)}`;
  if (existsSync(path) && readFileSync(path, 'utf-8') === content) return false;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  return true;
}

export function applyAssistantBridge(
  projectRoot: string,
  detected: DetectedProject,
  context: AssistantBridgeContext = readAssistantBridgeContext(projectRoot),
): string[] {
  const updated: string[] = [];
  const markdownTargets = [
    'CLAUDE.md',
    'AGENTS.md',
    'GEMINI.md',
    'copilot-instructions.md',
    '.github/copilot-instructions.md',
  ];

  for (const target of markdownTargets) {
    if (
      detected.existingRuleFiles.includes(target) &&
      upsertMarkdownBlock(join(projectRoot, target), context)
    ) {
      updated.push(target);
    }
  }

  if (detected.existingRuleFiles.includes('.cursorrules')) {
    if (upsertMarkdownBlock(join(projectRoot, '.cursorrules'), context))
      updated.push('.cursorrules');
  }

  if (detected.existingRuleFiles.includes('.windsurfrules')) {
    if (upsertMarkdownBlock(join(projectRoot, '.windsurfrules'), context))
      updated.push('.windsurfrules');
  }

  if (detected.existingRuleFiles.includes('.claude/rules')) {
    if (writeClaudeRule(projectRoot, context)) updated.push('.claude/rules/decantr.md');
  }

  if (detected.existingRuleFiles.includes('.cursor/rules')) {
    if (writeCursorRule(projectRoot, context)) updated.push('.cursor/rules/decantr.mdc');
  }

  if (updated.length === 0 && detected.existingRuleFiles.length === 0) {
    if (writeCursorRule(projectRoot, context)) updated.push('.cursor/rules/decantr.mdc');
  }

  return updated;
}
