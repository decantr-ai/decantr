export type CommandSurfaceClass =
  | 'primary'
  | 'advanced'
  | 'operator'
  | 'content-author'
  | 'experimental'
  | 'deprecated-alias';

export interface CommandSurfaceEntry {
  command: string;
  classification: CommandSurfaceClass;
  mutates: boolean;
  audience: 'app-developer' | 'content-author' | 'operator' | 'ai-agent' | 'internal';
  purpose: string;
  consolidation: 'keep' | 'soft-deprecate' | 'advanced-namespace' | 'experimental-hold';
}

export const COMMAND_SURFACE: CommandSurfaceEntry[] = [
  {
    command: 'setup',
    classification: 'primary',
    mutates: false,
    audience: 'app-developer',
    purpose: 'Detect project state and recommend the correct Decantr workflow.',
    consolidation: 'keep',
  },
  {
    command: 'scan',
    classification: 'primary',
    mutates: false,
    audience: 'app-developer',
    purpose: 'Read-only Brownfield reconnaissance without writing Decantr artifacts.',
    consolidation: 'keep',
  },
  {
    command: 'new',
    classification: 'primary',
    mutates: true,
    audience: 'app-developer',
    purpose: 'Create a greenfield Decantr workspace and optional runnable starter.',
    consolidation: 'keep',
  },
  {
    command: 'adopt',
    classification: 'primary',
    mutates: true,
    audience: 'app-developer',
    purpose: 'Brownfield workflow: analyze, attach, verify, baseline, and show next steps.',
    consolidation: 'keep',
  },
  {
    command: 'task',
    classification: 'primary',
    mutates: false,
    audience: 'ai-agent',
    purpose:
      'Prepare route/task context, typed graph capsule references, local law, evidence references, and changed-file impact for an AI coding assistant.',
    consolidation: 'keep',
  },
  {
    command: 'verify',
    classification: 'primary',
    mutates: false,
    audience: 'app-developer',
    purpose:
      'One reliability gate over Project Health, Brownfield checks, local law, baselines, and evidence.',
    consolidation: 'keep',
  },
  {
    command: 'resolve',
    classification: 'primary',
    mutates: true,
    audience: 'app-developer',
    purpose:
      'Explain source-vs-contract authority conflicts and explicitly defer/advisory-mark drift-log entries.',
    consolidation: 'keep',
  },
  {
    command: 'ci',
    classification: 'primary',
    mutates: true,
    audience: 'operator',
    purpose:
      'Non-mutating Decantr automation gate plus CI integration generation for projects and workspaces.',
    consolidation: 'keep',
  },
  {
    command: 'doctor',
    classification: 'primary',
    mutates: false,
    audience: 'app-developer',
    purpose:
      'Explain Decantr project/workspace state, generated artifacts, CI wiring, local law, and the next command.',
    consolidation: 'keep',
  },
  {
    command: 'connect',
    classification: 'primary',
    mutates: true,
    audience: 'app-developer',
    purpose: 'Configure editor-specific Decantr activation such as Cursor MCP and project rules.',
    consolidation: 'keep',
  },
  {
    command: 'codify',
    classification: 'primary',
    mutates: true,
    audience: 'app-developer',
    purpose:
      'Propose and accept project-owned Brownfield/Hybrid UI law, style bridges, and advisory hosted-pattern mappings.',
    consolidation: 'keep',
  },
  {
    command: 'content',
    classification: 'content-author',
    mutates: true,
    audience: 'content-author',
    purpose:
      'Content-corpus namespace for local health checks, official corpus authoring, and pack helpers.',
    consolidation: 'keep',
  },
  {
    command: 'magic',
    classification: 'advanced',
    mutates: true,
    audience: 'app-developer',
    purpose: 'Intent-first greenfield path that steers existing apps into brownfield analysis.',
    consolidation: 'keep',
  },
  {
    command: 'init',
    classification: 'advanced',
    mutates: true,
    audience: 'app-developer',
    purpose: 'Attach or initialize Decantr contract and context files.',
    consolidation: 'keep',
  },
  {
    command: 'analyze',
    classification: 'advanced',
    mutates: true,
    audience: 'app-developer',
    purpose: 'Brownfield inventory and proposal entrypoint.',
    consolidation: 'keep',
  },
  {
    command: 'refresh',
    classification: 'advanced',
    mutates: true,
    audience: 'app-developer',
    purpose:
      'Regenerate derived context and style artifacts from Essence and optional vocabulary content.',
    consolidation: 'keep',
  },
  {
    command: 'graph',
    classification: 'advanced',
    mutates: true,
    audience: 'ai-agent',
    purpose:
      'Generate typed Contract graph artifacts, inspect replayable snapshot history, compare local graph snapshots, inspect node impact, and write the cache-friendly contract capsule.',
    consolidation: 'keep',
  },
  {
    command: 'health',
    classification: 'advanced',
    mutates: false,
    audience: 'app-developer',
    purpose: 'Canonical local reliability report, evidence, remediation, and CI spine.',
    consolidation: 'keep',
  },
  {
    command: 'studio',
    classification: 'primary',
    mutates: false,
    audience: 'app-developer',
    purpose: 'Local Project Health and workspace triage dashboard.',
    consolidation: 'keep',
  },
  {
    command: 'workspace',
    classification: 'advanced',
    mutates: false,
    audience: 'app-developer',
    purpose:
      'Monorepo app candidate discovery, attached Decantr project listing, and aggregate health.',
    consolidation: 'keep',
  },
  {
    command: 'check',
    classification: 'advanced',
    mutates: false,
    audience: 'app-developer',
    purpose: 'Fast contract and guard validation.',
    consolidation: 'keep',
  },
  {
    command: 'heal',
    classification: 'deprecated-alias',
    mutates: false,
    audience: 'app-developer',
    purpose: 'Deprecated alias for check.',
    consolidation: 'soft-deprecate',
  },
  {
    command: 'audit',
    classification: 'advanced',
    mutates: false,
    audience: 'app-developer',
    purpose: 'Lower-level verifier audit or file critique against compiled packs.',
    consolidation: 'advanced-namespace',
  },
  {
    command: 'migrate',
    classification: 'advanced',
    mutates: true,
    audience: 'app-developer',
    purpose: 'Migrate pre-v4 Essence files to the active v4 contract.',
    consolidation: 'keep',
  },
  {
    command: 'add',
    classification: 'advanced',
    mutates: true,
    audience: 'app-developer',
    purpose: 'Compose sections, pages, and features into an attached contract.',
    consolidation: 'keep',
  },
  {
    command: 'remove',
    classification: 'advanced',
    mutates: true,
    audience: 'app-developer',
    purpose: 'Remove sections, pages, and features from an attached contract.',
    consolidation: 'keep',
  },
  {
    command: 'theme',
    classification: 'advanced',
    mutates: true,
    audience: 'app-developer',
    purpose: 'Manage and switch Decantr themes.',
    consolidation: 'keep',
  },
  {
    command: 'rules',
    classification: 'advanced',
    mutates: true,
    audience: 'ai-agent',
    purpose: 'Preview or apply assistant bridge snippets to supported rule files.',
    consolidation: 'keep',
  },
  {
    command: 'export',
    classification: 'advanced',
    mutates: true,
    audience: 'app-developer',
    purpose: 'Export Decantr tokens to framework or design-token formats.',
    consolidation: 'keep',
  },
  {
    command: 'status',
    classification: 'advanced',
    mutates: false,
    audience: 'app-developer',
    purpose: 'Inspect local project DNA and sync status.',
    consolidation: 'advanced-namespace',
  },
  {
    command: 'sync',
    classification: 'advanced',
    mutates: true,
    audience: 'app-developer',
    purpose: 'Sync official vocabulary content into the local cache.',
    consolidation: 'advanced-namespace',
  },
  {
    command: 'upgrade',
    classification: 'advanced',
    mutates: true,
    audience: 'app-developer',
    purpose: 'Check and optionally apply official-vocabulary content updates.',
    consolidation: 'advanced-namespace',
  },
  {
    command: 'sync-drift',
    classification: 'advanced',
    mutates: true,
    audience: 'app-developer',
    purpose: 'Review and resolve local drift log entries.',
    consolidation: 'advanced-namespace',
  },
  {
    command: 'registry',
    classification: 'deprecated-alias',
    mutates: true,
    audience: 'operator',
    purpose:
      'Legacy compatibility alias for content-corpus summary, pack hydration, and cache mirroring.',
    consolidation: 'soft-deprecate',
  },
  {
    command: 'search',
    classification: 'advanced',
    mutates: false,
    audience: 'app-developer',
    purpose: 'Vocabulary content discovery shortcut.',
    consolidation: 'keep',
  },
  {
    command: 'suggest',
    classification: 'advanced',
    mutates: false,
    audience: 'app-developer',
    purpose: 'Vocabulary pattern suggestion shortcut.',
    consolidation: 'keep',
  },
  {
    command: 'get',
    classification: 'advanced',
    mutates: false,
    audience: 'app-developer',
    purpose: 'Fetch full vocabulary item details.',
    consolidation: 'advanced-namespace',
  },
  {
    command: 'list',
    classification: 'advanced',
    mutates: false,
    audience: 'app-developer',
    purpose: 'List vocabulary items by type.',
    consolidation: 'advanced-namespace',
  },
  {
    command: 'showcase',
    classification: 'operator',
    mutates: false,
    audience: 'operator',
    purpose: 'Inspect audited showcase benchmark metadata.',
    consolidation: 'advanced-namespace',
  },
  {
    command: 'validate',
    classification: 'advanced',
    mutates: false,
    audience: 'app-developer',
    purpose: 'Validate an Essence file directly.',
    consolidation: 'advanced-namespace',
  },
  {
    command: 'content-health',
    classification: 'content-author',
    mutates: false,
    audience: 'content-author',
    purpose: 'Local official-vocabulary repository health report.',
    consolidation: 'keep',
  },
  {
    command: 'create',
    classification: 'content-author',
    mutates: true,
    audience: 'content-author',
    purpose: 'Create a custom vocabulary content item scaffold.',
    consolidation: 'advanced-namespace',
  },
  {
    command: 'publish',
    classification: 'deprecated-alias',
    mutates: false,
    audience: 'content-author',
    purpose:
      'Retired hosted community publishing command; official content now lands through packages/content changes.',
    consolidation: 'soft-deprecate',
  },
  {
    command: 'login',
    classification: 'deprecated-alias',
    mutates: true,
    audience: 'operator',
    purpose: 'Legacy credential helper retained for scripts that still configure DECANTR_API_KEY.',
    consolidation: 'soft-deprecate',
  },
  {
    command: 'logout',
    classification: 'deprecated-alias',
    mutates: true,
    audience: 'operator',
    purpose: 'Legacy credential cleanup helper retained for script compatibility.',
    consolidation: 'soft-deprecate',
  },
  {
    command: 'telemetry',
    classification: 'operator',
    mutates: true,
    audience: 'operator',
    purpose: 'Inspect or link privacy-filtered CLI telemetry identity.',
    consolidation: 'advanced-namespace',
  },
];

export function commandSurfaceByName(command: string): CommandSurfaceEntry | undefined {
  return COMMAND_SURFACE.find((entry) => entry.command === command);
}
