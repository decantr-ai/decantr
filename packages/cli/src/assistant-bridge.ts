import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { DetectedProject } from './detect.js';
import type { AssistantBridgeMode, WorkflowMode } from './workflow-model.js';

const START = '<!-- decantr:assistant-bridge:start -->';
const END = '<!-- decantr:assistant-bridge:end -->';

export function buildAssistantBridgeContent(input: {
  detected: DetectedProject;
  workflowMode: WorkflowMode;
  assistantBridge: AssistantBridgeMode;
}): string {
  const lines: string[] = [];
  lines.push('# Decantr Assistant Bridge');
  lines.push('');
  lines.push(
    'Use this bridge when an AI assistant works in a repository that already has local rules and Decantr has compiled them into a brownfield contract.',
  );
  lines.push('');
  lines.push(`- Workflow mode: ${input.workflowMode}`);
  lines.push(`- Detected framework: ${input.detected.framework}`);
  lines.push(`- Package manager: ${input.detected.packageManager}`);
  lines.push(
    `- Existing rule files: ${input.detected.existingRuleFiles.length > 0 ? input.detected.existingRuleFiles.join(', ') : 'none detected'}`,
  );
  lines.push(`- Bridge mode: ${input.assistantBridge}`);
  lines.push('');
  lines.push('## Suggested Rule Block');
  lines.push('');
  lines.push(START);
  lines.push(
    'Before implementing Decantr-scoped work, read `decantr.essence.json`, `.decantr/brownfield-report.md`, `.decantr/doctrine-map.json`, `.decantr/ambient-context.json`, and the compiled packs in `.decantr/context/`.',
  );
  lines.push(
    'Treat Decantr as the reconciled contract layer and the original project docs/rules as cited evidence; if they conflict, stop and report the conflict instead of guessing.',
  );
  lines.push(
    'For brownfield adoption, preserve existing framework, routing, styling, package manager, data boundaries, and build conventions unless the Decantr contract explicitly records a reviewed change.',
  );
  lines.push(
    'Do not install `@decantr/css` or rewrite styling unless the project adoption mode says `decantr-css` or the task explicitly asks for it.',
  );
  lines.push(END);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

export function writeAssistantBridgePreview(input: {
  projectRoot: string;
  detected: DetectedProject;
  workflowMode: WorkflowMode;
  assistantBridge: AssistantBridgeMode;
}): string {
  const contextDir = join(input.projectRoot, '.decantr', 'context');
  mkdirSync(contextDir, { recursive: true });
  const bridgePath = join(contextDir, 'assistant-bridge.md');
  writeFileSync(bridgePath, buildAssistantBridgeContent(input));
  return bridgePath;
}

function bridgeBlock(): string {
  return [
    START,
    'Before implementing Decantr-scoped work, read `decantr.essence.json`, `.decantr/brownfield-report.md`, `.decantr/doctrine-map.json`, `.decantr/ambient-context.json`, and `.decantr/context/scaffold-pack.md` first.',
    'Treat Decantr as the reconciled contract layer and the original project docs/rules as cited evidence; if they conflict, stop and report the conflict instead of guessing.',
    'For brownfield adoption, preserve existing framework, routing, styling, package manager, data boundaries, and build conventions unless the Decantr contract explicitly records a reviewed change.',
    'Do not install `@decantr/css` or rewrite styling unless the project adoption mode says `decantr-css` or the task explicitly asks for it.',
    END,
    '',
  ].join('\n');
}

function upsertMarkdownBlock(path: string): boolean {
  const block = bridgeBlock();
  if (!existsSync(path)) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `# Project Rules\n\n${block}`);
    return true;
  }

  const content = readFileSync(path, 'utf-8');
  if (content.includes(START) && content.includes(END)) return false;
  appendFileSync(path, `\n\n${block}`);
  return true;
}

function writeCursorRule(projectRoot: string): boolean {
  const path = join(projectRoot, '.cursor', 'rules', 'decantr.mdc');
  const content = `---
description: Decantr project contract and brownfield adoption bridge
alwaysApply: true
---

${bridgeBlock()}`;

  if (existsSync(path) && readFileSync(path, 'utf-8') === content) return false;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  return true;
}

function writeClaudeRule(projectRoot: string): boolean {
  const path = join(projectRoot, '.claude', 'rules', 'decantr.md');
  const content = `# Decantr Brownfield Bridge\n\n${bridgeBlock()}`;
  if (existsSync(path) && readFileSync(path, 'utf-8') === content) return false;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  return true;
}

export function applyAssistantBridge(projectRoot: string, detected: DetectedProject): string[] {
  const updated: string[] = [];
  const markdownTargets = [
    'CLAUDE.md',
    'AGENTS.md',
    'GEMINI.md',
    'copilot-instructions.md',
    '.github/copilot-instructions.md',
  ];

  for (const target of markdownTargets) {
    if (detected.existingRuleFiles.includes(target) && upsertMarkdownBlock(join(projectRoot, target))) {
      updated.push(target);
    }
  }

  if (detected.existingRuleFiles.includes('.cursorrules')) {
    if (upsertMarkdownBlock(join(projectRoot, '.cursorrules'))) updated.push('.cursorrules');
  }

  if (detected.existingRuleFiles.includes('.windsurfrules')) {
    if (upsertMarkdownBlock(join(projectRoot, '.windsurfrules'))) updated.push('.windsurfrules');
  }

  if (detected.existingRuleFiles.includes('.claude/rules')) {
    if (writeClaudeRule(projectRoot)) updated.push('.claude/rules/decantr.md');
  }

  if (detected.existingRuleFiles.includes('.cursor/rules')) {
    if (writeCursorRule(projectRoot)) updated.push('.cursor/rules/decantr.mdc');
  }

  if (updated.length === 0 && detected.existingRuleFiles.length === 0) {
    if (writeCursorRule(projectRoot)) updated.push('.cursor/rules/decantr.mdc');
  }

  return updated;
}
