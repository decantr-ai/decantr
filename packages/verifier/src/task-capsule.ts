import { Buffer } from 'node:buffer';

export const TASK_CAPSULE_V1_SCHEMA_URL = 'https://decantr.ai/schemas/task-capsule.v1.json';
export const DEFAULT_TASK_CAPSULE_MAX_CANONICAL_BYTES = 12_000;
export const DEFAULT_TASK_CAPSULE_MAX_ESTIMATED_TOKENS = 4_000;
export const TASK_CAPSULE_TOKEN_ESTIMATE_BYTES_PER_TOKEN = 3;

export type TaskCapsuleGraphFreshness = 'fresh' | 'stale' | 'missing' | 'unknown';
export type TaskCapsuleReadTargetKind =
  | 'route-implementation'
  | 'route-layout'
  | 'component'
  | 'contract'
  | 'local-law'
  | 'style-bridge'
  | 'graph'
  | 'evidence'
  | 'content'
  | 'other';
export type TaskCapsuleAuthorityLane =
  | 'production-source'
  | 'local-law'
  | 'style-bridge'
  | 'essence-contract'
  | 'official-guidance'
  | 'unknown';
export type TaskCapsuleContentType = 'pattern' | 'theme' | 'blueprint' | 'archetype' | 'shell';
export type TaskCapsuleContentOrigin = 'official' | 'local';
export type TaskCapsuleContentResolvedFrom =
  | 'installed-package'
  | 'workspace-package'
  | 'configured-corpus'
  | 'cache'
  | 'local-override'
  | 'api';

export interface TaskCapsuleProjectV1 {
  identity: string;
  workspaceRoot: string;
  selectedAppRoot: string;
}

export interface TaskCapsuleGraphV1 {
  snapshotId: string | null;
  sourceHash: string | null;
  freshness: TaskCapsuleGraphFreshness;
  limitations: string[];
}

export interface TaskCapsuleReadTargetV1 {
  path: string;
  kind: TaskCapsuleReadTargetKind;
  rank: number;
  required: boolean;
}

export interface TaskCapsuleAuthorityEntryV1 {
  lane: TaskCapsuleAuthorityLane;
  summary: string;
  sourcePath: string | null;
}

export interface TaskCapsuleAuthorityV1 {
  activeLane: TaskCapsuleAuthorityLane;
  entries: TaskCapsuleAuthorityEntryV1[];
}

export interface TaskCapsuleImpactV1 {
  changedFiles: string[];
  changedRoutes: string[];
  nodeIds: string[];
  unresolvedFiles: string[];
}

export interface TaskCapsuleFindingV1 {
  code: string;
  severity: 'error' | 'warn' | 'info';
  repairId: string | null;
  graphNodeId: string | null;
  blocking: boolean;
  summary: string;
}

export interface TaskCapsuleContentIdentityV1 {
  namespace: string;
  type: TaskCapsuleContentType;
  id: string;
}

export interface TaskCapsuleOfficialGuidanceV1 {
  identity: TaskCapsuleContentIdentityV1;
  version: string | null;
  digest: string;
  origin: TaskCapsuleContentOrigin;
  resolvedFrom: TaskCapsuleContentResolvedFrom;
  summary: string;
  rank: number;
  required: boolean;
}

export interface TaskCapsuleBudgetV1 {
  maxCanonicalBytes: number;
  maxEstimatedTokens: number;
  canonicalBytes: number;
  estimatedTokens: number;
}

export interface TaskCapsuleItemCountsV1 {
  readTargets: number;
  contentGuidance: number;
  changedFiles: number;
  changedRoutes: number;
  nodeIds: number;
  unresolvedFiles: number;
}

export interface TaskCapsuleTruncationV1 {
  truncated: boolean;
  reasons: Array<'byte-budget' | 'token-budget'>;
  omittedCounts: TaskCapsuleItemCountsV1;
  truncatedFields: Array<'task.request'>;
  originalCounts: TaskCapsuleItemCountsV1;
  originalCanonicalBytes: number;
  originalEstimatedTokens: number;
}

export interface TaskCapsuleV1 {
  $schema: typeof TASK_CAPSULE_V1_SCHEMA_URL;
  schemaVersion: 1;
  project: TaskCapsuleProjectV1;
  task: { request: string; route: string | null };
  graph: TaskCapsuleGraphV1;
  readTargets: TaskCapsuleReadTargetV1[];
  authority: TaskCapsuleAuthorityV1;
  impact: TaskCapsuleImpactV1;
  findings: TaskCapsuleFindingV1[];
  contentGuidance: TaskCapsuleOfficialGuidanceV1[];
  stopConditions: string[];
  verifyCommand: string;
  budget: TaskCapsuleBudgetV1;
  truncation: TaskCapsuleTruncationV1;
}

export interface CreateTaskCapsuleV1Input {
  project: TaskCapsuleProjectV1;
  task: { request: string; route: string | null };
  graph: TaskCapsuleGraphV1;
  readTargets: TaskCapsuleReadTargetV1[];
  authority: TaskCapsuleAuthorityV1;
  impact: TaskCapsuleImpactV1;
  findings: TaskCapsuleFindingV1[];
  contentGuidance: TaskCapsuleOfficialGuidanceV1[];
  stopConditions: string[];
  verifyCommand: string;
  budget?: Partial<Pick<TaskCapsuleBudgetV1, 'maxCanonicalBytes' | 'maxEstimatedTokens'>>;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record)
        .sort()
        .filter((key) => record[key] !== undefined)
        .map((key) => [key, canonicalize(record[key])]),
    );
  }
  return value;
}

export function canonicalJsonStringify(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export function canonicalUtf8Bytes(value: unknown): number {
  return Buffer.byteLength(canonicalJsonStringify(value), 'utf8');
}

export function tokenEstimateV1(canonicalUtf8ByteCount: number): number {
  if (!Number.isInteger(canonicalUtf8ByteCount) || canonicalUtf8ByteCount < 0) {
    throw new Error('tokenEstimateV1 requires a non-negative canonical UTF-8 byte count.');
  }
  return Math.ceil(canonicalUtf8ByteCount / TASK_CAPSULE_TOKEN_ESTIMATE_BYTES_PER_TOKEN);
}

export function estimateCanonicalTokens(value: unknown): number {
  return tokenEstimateV1(canonicalUtf8Bytes(value));
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function normalizeWorkspaceRelativePath(value: string, field: string): string {
  const normalized = value
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/\/{2,}/g, '/');
  const candidate = normalized || '.';
  if (
    candidate.startsWith('/') ||
    /^[A-Za-z]:\//.test(candidate) ||
    candidate.split('/').includes('..')
  ) {
    throw new Error(`${field} must be workspace-relative: ${value}`);
  }
  return candidate;
}

function normalizePaths(values: string[], field: string): string[] {
  return [...new Set(values.map((value) => normalizeWorkspaceRelativePath(value, field)))].sort();
}

function normalizeStrings(values: string[]): string[] {
  return [...new Set(values)].sort();
}

const READ_TARGET_KIND_ORDER: Record<TaskCapsuleReadTargetKind, number> = {
  'route-implementation': 0,
  'route-layout': 1,
  component: 2,
  contract: 3,
  'local-law': 4,
  'style-bridge': 5,
  graph: 6,
  evidence: 7,
  content: 8,
  other: 9,
};

const AUTHORITY_LANE_ORDER: Record<TaskCapsuleAuthorityLane, number> = {
  'production-source': 0,
  'local-law': 1,
  'style-bridge': 2,
  'essence-contract': 3,
  'official-guidance': 4,
  unknown: 5,
};

const SEVERITY_ORDER = { error: 0, warn: 1, info: 2 } as const;

function normalizeReadTargets(targets: TaskCapsuleReadTargetV1[]): TaskCapsuleReadTargetV1[] {
  const normalized = targets
    .map((target) => ({
      ...target,
      path: normalizeWorkspaceRelativePath(target.path, 'Task capsule read target'),
    }))
    .sort(
      (left, right) =>
        left.rank - right.rank ||
        READ_TARGET_KIND_ORDER[left.kind] - READ_TARGET_KIND_ORDER[right.kind] ||
        Number(right.required) - Number(left.required) ||
        compareText(left.path, right.path),
    );
  const seen = new Set<string>();
  for (const target of normalized) {
    if (!Number.isInteger(target.rank) || target.rank < 1) {
      throw new Error(`Task capsule read target rank must be a positive integer: ${target.path}`);
    }
    const key = `${target.rank}\0${target.kind}\0${target.path}`;
    if (seen.has(key)) throw new Error(`Duplicate task capsule read target: ${target.path}`);
    seen.add(key);
  }
  const first = normalized[0];
  if (
    !first ||
    first.rank !== 1 ||
    first.kind !== 'route-implementation' ||
    first.required !== true
  ) {
    throw new Error(
      'Task capsule readTargets must start with a rank-1 required route-implementation target.',
    );
  }
  return normalized;
}

function normalizeAuthority(authority: TaskCapsuleAuthorityV1): TaskCapsuleAuthorityV1 {
  const entries = authority.entries
    .map((entry) => ({
      ...entry,
      sourcePath:
        entry.sourcePath === null
          ? null
          : normalizeWorkspaceRelativePath(entry.sourcePath, `Authority ${entry.lane} source`),
    }))
    .sort(
      (left, right) =>
        AUTHORITY_LANE_ORDER[left.lane] - AUTHORITY_LANE_ORDER[right.lane] ||
        compareText(left.sourcePath ?? '', right.sourcePath ?? '') ||
        compareText(left.summary, right.summary),
    );
  const seen = new Set<TaskCapsuleAuthorityLane>();
  for (const entry of entries) {
    if (seen.has(entry.lane))
      throw new Error(`Duplicate task capsule authority lane: ${entry.lane}`);
    seen.add(entry.lane);
  }
  if (!seen.has(authority.activeLane)) {
    throw new Error(
      `Task capsule active authority lane is missing from entries: ${authority.activeLane}`,
    );
  }
  return { activeLane: authority.activeLane, entries };
}

function normalizeFindings(findings: TaskCapsuleFindingV1[]): TaskCapsuleFindingV1[] {
  const sorted = findings
    .map((finding) => ({ ...finding }))
    .sort(
      (left, right) =>
        Number(right.blocking) - Number(left.blocking) ||
        SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity] ||
        compareText(left.code, right.code) ||
        compareText(left.graphNodeId ?? '', right.graphNodeId ?? '') ||
        compareText(left.repairId ?? '', right.repairId ?? '') ||
        compareText(left.summary, right.summary),
    );
  return [...new Map(sorted.map((finding) => [canonicalJsonStringify(finding), finding])).values()];
}

function contentKey(guidance: TaskCapsuleOfficialGuidanceV1): string {
  return `${guidance.identity.namespace}/${guidance.identity.type}/${guidance.identity.id}`;
}

function normalizeContentGuidance(
  guidance: TaskCapsuleOfficialGuidanceV1[],
): TaskCapsuleOfficialGuidanceV1[] {
  const normalized = guidance
    .map((item) => ({ ...item, identity: { ...item.identity } }))
    .sort(
      (left, right) =>
        left.rank - right.rank ||
        Number(right.required) - Number(left.required) ||
        compareText(contentKey(left), contentKey(right)) ||
        compareText(left.version ?? '', right.version ?? '') ||
        compareText(left.digest, right.digest),
    );
  const seen = new Set<string>();
  for (const item of normalized) {
    if (!Number.isInteger(item.rank) || item.rank < 1) {
      throw new Error(
        `Task capsule content guidance rank must be a positive integer: ${contentKey(item)}`,
      );
    }
    const key = contentKey(item);
    if (seen.has(key)) throw new Error(`Duplicate task capsule content guidance: ${key}`);
    seen.add(key);
  }
  return normalized;
}

function emptyCounts(): TaskCapsuleItemCountsV1 {
  return {
    readTargets: 0,
    contentGuidance: 0,
    changedFiles: 0,
    changedRoutes: 0,
    nodeIds: 0,
    unresolvedFiles: 0,
  };
}

function updateMeasurements(capsule: TaskCapsuleV1): void {
  let previous = '';
  for (let iteration = 0; iteration < 8; iteration += 1) {
    const bytes = canonicalUtf8Bytes(capsule);
    const tokens = tokenEstimateV1(bytes);
    capsule.budget.canonicalBytes = bytes;
    capsule.budget.estimatedTokens = tokens;
    const signature = `${bytes}:${tokens}`;
    if (signature === previous) break;
    previous = signature;
  }
}

function exceedsBudget(capsule: TaskCapsuleV1): boolean {
  updateMeasurements(capsule);
  return (
    capsule.budget.canonicalBytes > capsule.budget.maxCanonicalBytes ||
    capsule.budget.estimatedTokens > capsule.budget.maxEstimatedTokens
  );
}

function truncateUtf8(value: string, maxBytes: number): string {
  if (Buffer.byteLength(value, 'utf8') <= maxBytes) return value;
  if (maxBytes < 3) return '';
  let low = 0;
  let high = value.length;
  const prefixBudget = maxBytes - 3;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (Buffer.byteLength(value.slice(0, middle), 'utf8') <= prefixBudget) low = middle;
    else high = middle - 1;
  }
  const prefix = value.slice(0, low).replace(/[\uD800-\uDBFF]$/, '');
  return `${prefix}\u2026`;
}

function recordInitialMeasurements(capsule: TaskCapsuleV1): void {
  for (let iteration = 0; iteration < 8; iteration += 1) {
    updateMeasurements(capsule);
    const bytes = capsule.budget.canonicalBytes;
    const tokens = capsule.budget.estimatedTokens;
    if (
      capsule.truncation.originalCanonicalBytes === bytes &&
      capsule.truncation.originalEstimatedTokens === tokens
    ) {
      break;
    }
    capsule.truncation.originalCanonicalBytes = bytes;
    capsule.truncation.originalEstimatedTokens = tokens;
  }
  updateMeasurements(capsule);
}

function markBudgetReasons(capsule: TaskCapsuleV1): void {
  capsule.truncation.truncated = true;
  if (capsule.budget.canonicalBytes > capsule.budget.maxCanonicalBytes) {
    capsule.truncation.reasons.push('byte-budget');
  }
  if (capsule.budget.estimatedTokens > capsule.budget.maxEstimatedTokens) {
    capsule.truncation.reasons.push('token-budget');
  }
}

function omitOptionalContent(capsule: TaskCapsuleV1): void {
  const removable = capsule.contentGuidance
    .filter((item) => !item.required)
    .sort(
      (left, right) => right.rank - left.rank || compareText(contentKey(right), contentKey(left)),
    );
  for (const item of removable) {
    if (!exceedsBudget(capsule)) break;
    const key = contentKey(item);
    capsule.contentGuidance = capsule.contentGuidance.filter(
      (candidate) => contentKey(candidate) !== key,
    );
    capsule.truncation.omittedCounts.contentGuidance += 1;
  }
}

function omitImpactDetails(capsule: TaskCapsuleV1): void {
  const fields = ['nodeIds', 'changedFiles', 'changedRoutes', 'unresolvedFiles'] as const;
  for (const field of fields) {
    while (exceedsBudget(capsule) && capsule.impact[field].length > 0) {
      capsule.impact[field].pop();
      capsule.truncation.omittedCounts[field] += 1;
    }
  }
}

function omitOptionalReadTargets(capsule: TaskCapsuleV1): void {
  const removable = capsule.readTargets
    .filter((target) => !target.required)
    .sort(
      (left, right) =>
        right.rank - left.rank ||
        READ_TARGET_KIND_ORDER[right.kind] - READ_TARGET_KIND_ORDER[left.kind] ||
        compareText(right.path, left.path),
    );
  for (const target of removable) {
    if (!exceedsBudget(capsule)) break;
    capsule.readTargets = capsule.readTargets.filter(
      (candidate) =>
        !(
          candidate.rank === target.rank &&
          candidate.kind === target.kind &&
          candidate.path === target.path
        ),
    );
    capsule.truncation.omittedCounts.readTargets += 1;
  }
}

function truncateTaskRequest(capsule: TaskCapsuleV1): void {
  while (exceedsBudget(capsule) && capsule.task.request.length > 0) {
    const currentBytes = Buffer.byteLength(capsule.task.request, 'utf8');
    const overBytes = Math.max(1, capsule.budget.canonicalBytes - capsule.budget.maxCanonicalBytes);
    const overTokenBytes = Math.max(
      1,
      (capsule.budget.estimatedTokens - capsule.budget.maxEstimatedTokens) *
        TASK_CAPSULE_TOKEN_ESTIMATE_BYTES_PER_TOKEN,
    );
    const next = truncateUtf8(
      capsule.task.request,
      Math.max(0, currentBytes - Math.max(overBytes, overTokenBytes) - 24),
    );
    capsule.task.request = next === capsule.task.request ? '' : next;
    if (!capsule.truncation.truncatedFields.includes('task.request')) {
      capsule.truncation.truncatedFields.push('task.request');
    }
  }
}

export function createTaskCapsuleV1(input: CreateTaskCapsuleV1Input): TaskCapsuleV1 {
  const maxCanonicalBytes =
    input.budget?.maxCanonicalBytes ?? DEFAULT_TASK_CAPSULE_MAX_CANONICAL_BYTES;
  const maxEstimatedTokens =
    input.budget?.maxEstimatedTokens ?? DEFAULT_TASK_CAPSULE_MAX_ESTIMATED_TOKENS;
  if (!Number.isInteger(maxCanonicalBytes) || maxCanonicalBytes < 1) {
    throw new Error('Task capsule maxCanonicalBytes must be a positive integer.');
  }
  if (!Number.isInteger(maxEstimatedTokens) || maxEstimatedTokens < 1) {
    throw new Error('Task capsule maxEstimatedTokens must be a positive integer.');
  }
  if (input.project.identity.length === 0) {
    throw new Error('Task capsule project identity must be non-empty.');
  }
  if (input.verifyCommand.length === 0) {
    throw new Error('Task capsule verifyCommand must be a non-empty exact command.');
  }
  if (input.stopConditions.length === 0) {
    throw new Error('Task capsule must include at least one stop condition.');
  }
  if (
    (input.graph.freshness === 'fresh' || input.graph.freshness === 'stale') &&
    (!input.graph.snapshotId || !input.graph.sourceHash)
  ) {
    throw new Error(
      `Task capsule ${input.graph.freshness} graph requires snapshotId and sourceHash.`,
    );
  }

  const readTargets = normalizeReadTargets(input.readTargets);
  const contentGuidance = normalizeContentGuidance(input.contentGuidance);
  const impact: TaskCapsuleImpactV1 = {
    changedFiles: normalizePaths(input.impact.changedFiles, 'Task capsule changed file'),
    changedRoutes: normalizeStrings(input.impact.changedRoutes),
    nodeIds: normalizeStrings(input.impact.nodeIds),
    unresolvedFiles: normalizePaths(input.impact.unresolvedFiles, 'Task capsule unresolved file'),
  };
  const initialCounts = {
    readTargets: readTargets.length,
    contentGuidance: contentGuidance.length,
    changedFiles: impact.changedFiles.length,
    changedRoutes: impact.changedRoutes.length,
    nodeIds: impact.nodeIds.length,
    unresolvedFiles: impact.unresolvedFiles.length,
  };
  const capsule: TaskCapsuleV1 = {
    $schema: TASK_CAPSULE_V1_SCHEMA_URL,
    schemaVersion: 1,
    project: {
      identity: input.project.identity,
      workspaceRoot: normalizeWorkspaceRelativePath(input.project.workspaceRoot, 'workspaceRoot'),
      selectedAppRoot: normalizeWorkspaceRelativePath(
        input.project.selectedAppRoot,
        'selectedAppRoot',
      ),
    },
    task: { ...input.task },
    graph: {
      ...input.graph,
      limitations: normalizeStrings(input.graph.limitations),
    },
    readTargets,
    authority: normalizeAuthority(input.authority),
    impact,
    findings: normalizeFindings(input.findings),
    contentGuidance,
    stopConditions: normalizeStrings(input.stopConditions),
    verifyCommand: input.verifyCommand,
    budget: { maxCanonicalBytes, maxEstimatedTokens, canonicalBytes: 0, estimatedTokens: 0 },
    truncation: {
      truncated: false,
      reasons: [],
      omittedCounts: emptyCounts(),
      truncatedFields: [],
      originalCounts: initialCounts,
      originalCanonicalBytes: 0,
      originalEstimatedTokens: 0,
    },
  };

  recordInitialMeasurements(capsule);
  if (exceedsBudget(capsule)) {
    markBudgetReasons(capsule);
    omitOptionalContent(capsule);
    omitImpactDetails(capsule);
    omitOptionalReadTargets(capsule);
    truncateTaskRequest(capsule);
  }

  updateMeasurements(capsule);
  if (exceedsBudget(capsule)) {
    throw new Error(
      `Task capsule protected project, route implementation, authority, findings, stop conditions, and exact verifyCommand exceed the configured budget (${maxCanonicalBytes} bytes / ${maxEstimatedTokens} tokens).`,
    );
  }
  if (
    capsule.readTargets[0]?.kind !== 'route-implementation' ||
    capsule.readTargets[0]?.required !== true
  ) {
    throw new Error('Task capsule pruning removed the required route implementation target.');
  }
  updateMeasurements(capsule);
  return capsule;
}
