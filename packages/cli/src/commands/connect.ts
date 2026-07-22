import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative } from 'node:path';
import type { DetectedProject } from '../detect.js';

const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const DECANTR_MCP_SERVER = {
  command: 'npx',
  args: ['-y', '@decantr/mcp-server'],
};

interface CursorConnectInput {
  connectionRoot: string;
  appRoot: string;
  detected: DetectedProject;
  projectArg?: string;
  preview?: boolean;
  mcpOnly?: boolean;
  rulesOnly?: boolean;
  routeHint?: string | null;
  attached?: boolean;
}

interface CursorWriteResult {
  path: string;
  action: 'write' | 'unchanged' | 'preview';
}

function cyan(value: string): string {
  return `${CYAN}${value}${RESET}`;
}

function dim(value: string): string {
  return `${DIM}${value}${RESET}`;
}

function success(value: string): string {
  return `${GREEN}${value}${RESET}`;
}

function normalizeSlash(path: string): string {
  return path.replace(/\\/g, '/');
}

function displayPath(connectionRoot: string, absolutePath: string): string {
  const rel = normalizeSlash(relative(connectionRoot, absolutePath));
  if (rel && !rel.startsWith('..') && !isAbsolute(rel)) return rel;
  return absolutePath;
}

function projectPathForConnection(input: CursorConnectInput): string | null {
  if (input.projectArg) return input.projectArg;
  const rel = normalizeSlash(relative(input.connectionRoot, input.appRoot));
  if (!rel || rel === '.') return null;
  if (rel.startsWith('..') || isAbsolute(rel)) return input.appRoot;
  return rel;
}

function readCursorMcpConfig(path: string): Record<string, unknown> {
  if (!existsSync(path)) return {};
  const parsed = JSON.parse(readFileSync(path, 'utf-8')) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`${path} must contain a JSON object.`);
  }
  return parsed as Record<string, unknown>;
}

function buildCursorMcpConfig(existing: Record<string, unknown>): Record<string, unknown> {
  const existingServers = existing.mcpServers;
  const mcpServers =
    existingServers && typeof existingServers === 'object' && !Array.isArray(existingServers)
      ? { ...(existingServers as Record<string, unknown>) }
      : {};
  mcpServers.decantr = DECANTR_MCP_SERVER;
  return { ...existing, mcpServers };
}

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function cursorMcpPreview(): string {
  return stableJson(buildCursorMcpConfig({}));
}

function cursorRuleContent(input: CursorConnectInput): string {
  const projectPath = projectPathForConnection(input);
  const projectSuffix = projectPath ? ` --project ${projectPath}` : '';
  const mcpProjectLine = projectPath ? `, "project_path": "${projectPath}"` : '';
  const target = input.routeHint ?? '<target>';
  const taskExample = target === '<target>' ? '<intent>' : 'make a focused UI change';
  const attachedNote = input.attached
    ? 'This app is attached to Decantr; use task context before UI-surface edits.'
    : 'This app is not attached yet. `decantr task` can still return read-only discovery context; run `decantr scan` and review `decantr adopt --yes` before expecting contract-backed context.';

  return `---
description: Decantr source-scoped UI authority, context, and evidence for Cursor Agent
alwaysApply: true
---

# Decantr Cursor Activation

${attachedNote}

Before editing a UI surface, use Decantr task context:

- MCP: call \`decantr_context\` with \`{ "action": "task"${mcpProjectLine}, "route": "${target}", "task": "${taskExample}" }\`. The \`route\` field name remains for 3.x compatibility and accepts an exact UI-surface target.
- CLI fallback: run \`decantr task ${target} "${taskExample}"${projectSuffix}\`.

Use the returned authority block, read targets, local law, evidence, graph impact, stop conditions, and verify command as the working contract. If runtime source and Decantr context disagree, stop and report drift instead of guessing which side wins.

After editing, run the verify command returned by task context. If Decantr reports \`human_resolution_required\`, run \`decantr resolve${projectSuffix}\` and follow the explicit resolution action.

Preserve the detected framework (${input.detected.framework}), package manager (${input.detected.packageManager}), routing, styling, data boundaries, and build conventions unless the user explicitly approves a reviewed migration. Do not install \`@decantr/css\` or rewrite styling unless the Decantr adoption lane says \`decantr-css\` or the task explicitly asks for it.
`;
}

function writeTextIfChanged(path: string, content: string, preview: boolean): CursorWriteResult {
  if (preview) return { path, action: 'preview' };
  mkdirSync(dirname(path), { recursive: true });
  if (existsSync(path) && readFileSync(path, 'utf-8') === content) {
    return { path, action: 'unchanged' };
  }
  writeFileSync(path, content, 'utf-8');
  return { path, action: 'write' };
}

function writeCursorMcp(path: string, preview: boolean): CursorWriteResult {
  if (preview) return { path, action: 'preview' };
  const existing = readCursorMcpConfig(path);
  const content = stableJson(buildCursorMcpConfig(existing));
  return writeTextIfChanged(path, content, false);
}

function printResult(label: string, result: CursorWriteResult, connectionRoot: string): void {
  const action =
    result.action === 'write'
      ? success('wrote')
      : result.action === 'preview'
        ? cyan('preview')
        : dim('unchanged');
  console.log(`  ${action} ${label}: ${displayPath(connectionRoot, result.path)}`);
}

export function cmdConnectHelp(): void {
  console.log(`
${BOLD}decantr connect cursor${RESET} — Connect Decantr to Cursor Agent

${BOLD}Usage:${RESET}
  decantr connect cursor [--project <path>] [--preview] [--mcp-only|--rules-only]

${BOLD}Behavior:${RESET}
  Writes Cursor project MCP config and Decantr project rules in the current opened workspace:
    .cursor/mcp.json
    .cursor/rules/decantr.mdc

  Existing MCP servers are preserved. The Decantr MCP server is registered as:
    npx -y @decantr/mcp-server

${BOLD}Examples:${RESET}
  decantr connect cursor
  decantr connect cursor --project apps/web
  decantr connect cursor --preview --project apps/web
`);
}

export function cmdConnectCursor(input: CursorConnectInput): void {
  if (input.mcpOnly && input.rulesOnly) {
    throw new Error('Use either --mcp-only or --rules-only, not both.');
  }

  const mcpPath = join(input.connectionRoot, '.cursor', 'mcp.json');
  const rulePath = join(input.connectionRoot, '.cursor', 'rules', 'decantr.mdc');
  const projectPath = projectPathForConnection(input);
  const projectSuffix = projectPath ? ` --project ${projectPath}` : '';
  const target = input.routeHint ?? '<target>';
  const taskIntent = target === '<target>' ? '<intent>' : 'make a focused UI change';
  const results: CursorWriteResult[] = [];

  if (!input.rulesOnly) results.push(writeCursorMcp(mcpPath, Boolean(input.preview)));
  if (!input.mcpOnly) {
    results.push(writeTextIfChanged(rulePath, cursorRuleContent(input), Boolean(input.preview)));
  }

  console.log(`${BOLD}Decantr Cursor Connection${RESET}`);
  console.log(`  Workspace: ${input.connectionRoot}`);
  console.log(`  Project: ${input.appRoot}`);
  if (projectPath) console.log(`  Cursor project_path: ${projectPath}`);
  console.log('');

  for (const result of results) {
    printResult(
      result.path.endsWith('mcp.json') ? 'MCP config' : 'Cursor rule',
      result,
      input.connectionRoot,
    );
  }

  if (input.preview) {
    console.log('');
    if (!input.rulesOnly) {
      console.log(`${BOLD}.cursor/mcp.json preview${RESET}`);
      console.log(cursorMcpPreview().trimEnd());
      console.log('');
    }
    if (!input.mcpOnly) {
      console.log(`${BOLD}.cursor/rules/decantr.mdc preview${RESET}`);
      console.log(cursorRuleContent(input).trimEnd());
      console.log('');
    }
  }

  console.log('');
  console.log(`${BOLD}Use in Cursor Agent:${RESET}`);
  if (!input.attached) {
    console.log(`  ${cyan(`decantr scan${projectSuffix}`)}          Read-only first look`);
    console.log(`  ${cyan(`decantr adopt --yes${projectSuffix}`)}   Attach Decantr when ready`);
  }
  console.log(
    `  ${cyan(`decantr task ${target} "${taskIntent}"${projectSuffix}`)}   Prepare context before edits`,
  );
  console.log(
    `  ${cyan(`decantr verify --brownfield --local-patterns${projectSuffix}`)}   Check after edits`,
  );
  console.log('');
  console.log(
    dim(
      'Restart Cursor or refresh MCP tools if the Decantr MCP server is not visible immediately.',
    ),
  );
}
