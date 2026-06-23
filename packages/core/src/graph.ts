import type { EssenceV4, LayoutItem } from '@decantr/essence-spec';
import type { IRAppNode, IRNode, IRPageNode, IRPatternNode } from './types.js';

export const GRAPH_SCHEMA_VERSION = '3.0.0-draft';
export const GRAPH_COMMON_SCHEMA_URL = 'https://decantr.ai/schemas/graph.common.v1.json';
export const GRAPH_SNAPSHOT_SCHEMA_URL = 'https://decantr.ai/schemas/graph-snapshot.v1.json';
export const GRAPH_MANIFEST_SCHEMA_URL = 'https://decantr.ai/schemas/graph-manifest.v1.json';
export const GRAPH_DIFF_SCHEMA_URL = 'https://decantr.ai/schemas/graph-diff.v1.json';
export const CONTRACT_CAPSULE_SCHEMA_URL = 'https://decantr.ai/schemas/contract-capsule.v1.json';
export const DEFAULT_CONTRACT_CAPSULE_SOURCE_ARTIFACT_LIMIT = 200;

export const GRAPH_NODE_TYPES = [
  'Project',
  'Section',
  'Page',
  'Route',
  'Shell',
  'Region',
  'Pattern',
  'Component',
  'Token',
  'Theme',
  'Decorator',
  'Feature',
  'LocalRule',
  'StyleBridge',
  'SourceArtifact',
  'Finding',
  'Evidence',
  'Repair',
  'Test',
  'AgentRun',
] as const;

export type GraphNodeType = (typeof GRAPH_NODE_TYPES)[number];

export const GRAPH_RELATIONS = [
  'PROJECT_CONTAINS_SECTION',
  'PROJECT_ENABLES_FEATURE',
  'PROJECT_USES_THEME',
  'SECTION_CONTAINS_PAGE',
  'PAGE_ROUTED_AT_ROUTE',
  'PAGE_USES_SHELL',
  'SHELL_HAS_REGION',
  'PAGE_COMPOSES_PATTERN',
  'PATTERN_NEEDS_COMPONENT',
  'COMPONENT_STYLED_WITH_TOKEN',
  'THEME_DEFINES_TOKEN',
  'THEME_DEFINES_DECORATOR',
  'COMPONENT_DECORATED_WITH_DECORATOR',
  'LOCAL_RULE_APPLIES_TO',
  'STYLE_BRIDGE_MAPS_TO',
  'NODE_DERIVED_FROM_SOURCE',
  'SOURCE_IMPORTS_SOURCE',
  'FINDING_VIOLATES_RULE',
  'FINDING_ANCHORED_AT',
  'EVIDENCE_SUPPORTS_FINDING',
  'EVIDENCE_CAPTURED_FOR',
  'REPAIR_FIXES_FINDING',
  'TEST_COVERS_NODE',
  'AGENT_RUN_CHANGED_NODE',
] as const;

export type GraphRelation = (typeof GRAPH_RELATIONS)[number];

export type GraphDiffOpType =
  | 'node.added'
  | 'node.removed'
  | 'node.changed'
  | 'edge.added'
  | 'edge.removed'
  | 'edge.changed'
  | 'finding.added'
  | 'finding.resolved'
  | 'evidence.added';

export interface GraphNode<TPayload = unknown> {
  id: string;
  type: GraphNodeType;
  payload: TPayload;
  created_at?: string;
  updated_at?: string;
}

export interface GraphEdge<TPayload = unknown> {
  src: string;
  dst: string;
  relation: GraphRelation;
  payload?: TPayload;
  idx?: number;
}

export interface SourceArtifact {
  id: string;
  kind: string;
  path?: string;
  commit?: string;
  hash?: string;
  payload?: Record<string, unknown>;
}

export interface GraphSnapshot {
  $schema?: string;
  id: string;
  schema_version: string;
  project_id: string;
  created_at: string;
  parent_id?: string;
  source_hash: string;
  git?: {
    commit?: string;
    branch?: string;
    dirty?: boolean;
  };
  nodes: GraphNode[];
  edges: GraphEdge[];
  summary: {
    nodes: number;
    edges: number;
    findings: number;
    evidence: number;
  };
}

export interface GraphManifest {
  $schema?: string;
  schema_version: string;
  snapshot_id: string;
  project_id: string;
  generated_at: string;
  sources: SourceArtifact[];
  outputs: {
    sqlite?: string;
    snapshot: string;
    history?: string;
    diff?: string;
  };
  warnings: Array<{
    code: string;
    message: string;
  }>;
}

export interface GraphDiffOp {
  op: GraphDiffOpType;
  id?: string;
  type?: GraphNodeType;
  src?: string;
  dst?: string;
  relation?: GraphRelation;
  before?: unknown;
  after?: unknown;
}

export interface GraphDiff {
  $schema?: string;
  id: string;
  from?: string;
  to: string;
  ops: GraphDiffOp[];
}

export interface GraphDiffSummary {
  total: number;
  by_type: Record<GraphDiffOpType, number>;
  nodes: {
    added: number;
    removed: number;
    changed: number;
  };
  edges: {
    added: number;
    removed: number;
    changed: number;
  };
  findings: {
    added: number;
    resolved: number;
  };
  evidence: {
    added: number;
  };
}

export interface GraphFinding {
  id: string;
  code: string;
  severity: 'blocker' | 'error' | 'warn' | 'info';
  category: string;
  anchored_at?: string;
  violates?: string[];
  derived_from?: string[];
  message: string;
  payload?: Record<string, unknown>;
  evidence?: string[];
  baseline?: {
    snapshot_id?: string;
    commit?: string;
  };
  repair?: {
    id: string;
    payload?: Record<string, unknown>;
  };
}

export interface ContractCapsuleRoute {
  id: string;
  path: string;
  page_id?: string;
  shell_id?: string;
}

export interface ContractCapsuleVocabularyItem {
  id: string;
  label?: string;
  payload?: unknown;
}

export interface ContractCapsuleSourceArtifact {
  id: string;
  path: string;
  kind?: string;
  label?: string;
  payload?: unknown;
}

export interface ContractCapsuleFinding {
  id: string;
  code?: string;
  severity?: string;
  anchored_at?: string;
  message?: string;
}

export interface ContractCapsule {
  $schema?: string;
  schema_version: string;
  snapshot_id: string;
  project_id: string;
  created_at: string;
  source_hash: string;
  contract_hash?: string;
  cache_key: string;
  contract_cache_key?: string;
  summary: {
    routes: number;
    components: number;
    tokens: number;
    local_rules: number;
    style_bridge: number;
    source_artifacts: number;
    open_findings: number;
  };
  source_artifact_limit: number;
  source_artifacts_truncated: boolean;
  routes: ContractCapsuleRoute[];
  components: ContractCapsuleVocabularyItem[];
  tokens: ContractCapsuleVocabularyItem[];
  local_rules: ContractCapsuleVocabularyItem[];
  style_bridge: ContractCapsuleVocabularyItem[];
  source_artifacts: ContractCapsuleSourceArtifact[];
  open_findings: ContractCapsuleFinding[];
}

export interface BuildContractCapsuleOptions {
  createdAt?: string;
  cacheKey?: string;
  sourceArtifactLimit?: number;
}

export interface GraphNodeQuery {
  ids?: string[];
  type?: GraphNodeType;
  types?: GraphNodeType[];
  payloadKey?: string;
  payloadValue?: string;
  payloadContains?: string;
}

export interface GraphEdgeQuery {
  src?: string;
  dst?: string;
  relation?: GraphRelation;
  relations?: GraphRelation[];
}

export type GraphTraverseDirection = 'out' | 'in' | 'both';

export interface GraphTraverseQuery {
  from: string | string[];
  relations?: GraphRelation[];
  direction?: GraphTraverseDirection;
  depth?: number;
}

export interface GraphSubgraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphRouteContext {
  snapshotId: string;
  sourceHash: string;
  routeNode: GraphNode;
  ranking: {
    method:
      | 'weighted_traversal'
      | 'weighted_traversal_with_task_boost'
      | 'hybrid_weighted_pagerank'
      | 'hybrid_weighted_pagerank_with_task_boost';
    seed: string;
    task_keywords: string[];
  };
  summary: {
    nodes: number;
    edges: number;
    pages: number;
    shells: number;
    patterns: number;
    components: number;
    tokens: number;
    localRules: number;
    styleBridge: number;
    openFindings: number;
    evidence: number;
    sourceArtifacts: number;
  };
  ids: {
    pages: string[];
    shells: string[];
    patterns: string[];
    components: string[];
    tokens: string[];
    localRules: string[];
    styleBridge: string[];
    openFindings: string[];
    evidence: string[];
    sourceArtifacts: string[];
  };
  ranked: Array<{
    id: string;
    type: GraphNodeType;
    score: number;
    reason: string;
    matched_terms?: string[];
  }>;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface BuildGraphRouteContextOptions {
  task?: string;
}

export interface GraphImpactContext {
  snapshotId: string;
  sourceHash: string;
  seedNodes: GraphNode[];
  missingNodeIds: string[];
  ranking: {
    method:
      | 'impact_traversal'
      | 'impact_traversal_with_task_boost'
      | 'hybrid_impact_pagerank'
      | 'hybrid_impact_pagerank_with_task_boost';
    seed: string[];
    task_keywords: string[];
  };
  summary: {
    nodes: number;
    edges: number;
    totalNodes: number;
    totalEdges: number;
    truncated: boolean;
    routes: number;
    pages: number;
    shells: number;
    patterns: number;
    components: number;
    tokens: number;
    localRules: number;
    styleBridge: number;
    openFindings: number;
    evidence: number;
    repairs: number;
    sourceArtifacts: number;
  };
  ids: {
    routes: string[];
    pages: string[];
    shells: string[];
    patterns: string[];
    components: string[];
    tokens: string[];
    localRules: string[];
    styleBridge: string[];
    openFindings: string[];
    evidence: string[];
    repairs: string[];
    sourceArtifacts: string[];
  };
  ranked: Array<{
    id: string;
    type: GraphNodeType;
    score: number;
    reason: string;
    matched_terms?: string[];
  }>;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface BuildGraphImpactContextOptions {
  task?: string;
  limit?: number;
}

export interface GraphStore {
  open(projectRoot: string): Promise<void>;
  close(): Promise<void>;
  upsertNode(node: GraphNode): Promise<void>;
  upsertEdge(edge: GraphEdge): Promise<void>;
  getNode(id: string): Promise<GraphNode | null>;
  queryNodes(query: GraphNodeQuery): Promise<GraphNode[]>;
  queryEdges(query: GraphEdgeQuery): Promise<GraphEdge[]>;
  traverse(query: GraphTraverseQuery): Promise<GraphSubgraph>;
  writeSnapshot(snapshot: GraphSnapshot): Promise<void>;
  readSnapshot(id?: string): Promise<GraphSnapshot | null>;
}

export interface MemoryGraphStoreSeed {
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  snapshots?: GraphSnapshot[];
}

export interface BuildGraphSnapshotFromIROptions {
  projectId?: string;
  snapshotId?: string;
  createdAt?: string;
  parentId?: string;
  sourceHash?: string;
  git?: GraphSnapshot['git'];
  sourceArtifact?: SourceArtifact;
}

export type BuildGraphSnapshotFromEssenceOptions = BuildGraphSnapshotFromIROptions;

function graphEdgeKey(edge: Pick<GraphEdge, 'src' | 'dst' | 'relation' | 'idx'>): string {
  return [edge.src, edge.relation, edge.dst, String(edge.idx ?? '')].join('\0');
}

function graphNodeIdsByType(nodes: GraphNode[], type: GraphNodeType): string[] {
  return nodes
    .filter((node) => node.type === type)
    .map((node) => node.id)
    .sort();
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableJson(item)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .filter((key) => record[key] !== undefined)
      .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function hashStableJson(value: unknown): string {
  const input = stableJson(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `fnv1a32:${hash.toString(16).padStart(8, '0')}`;
}

function relationMatches(edge: GraphEdge, query: GraphEdgeQuery | GraphTraverseQuery): boolean {
  if (query.relations?.length) {
    return query.relations.includes(edge.relation);
  }
  if ('relation' in query && query.relation) {
    return edge.relation === query.relation;
  }
  return true;
}

export function sortGraphNodes(nodes: GraphNode[]): GraphNode[] {
  return [...nodes].sort((a, b) => a.id.localeCompare(b.id) || a.type.localeCompare(b.type));
}

export function sortGraphEdges(edges: GraphEdge[]): GraphEdge[] {
  return [...edges].sort(
    (a, b) =>
      a.src.localeCompare(b.src) ||
      a.relation.localeCompare(b.relation) ||
      a.dst.localeCompare(b.dst) ||
      (a.idx ?? 0) - (b.idx ?? 0),
  );
}

export function normalizeGraphSnapshot(snapshot: GraphSnapshot): GraphSnapshot {
  const nodes = sortGraphNodes(snapshot.nodes);
  const edges = sortGraphEdges(snapshot.edges);
  return {
    ...snapshot,
    nodes,
    edges,
    summary: {
      ...snapshot.summary,
      nodes: nodes.length,
      edges: edges.length,
      findings: nodes.filter((node) => node.type === 'Finding').length,
      evidence: nodes.filter((node) => node.type === 'Evidence').length,
    },
  };
}

export function diffGraphSnapshots(from: GraphSnapshot | null, to: GraphSnapshot): GraphDiff {
  const normalizedTo = normalizeGraphSnapshot(to);
  const normalizedFrom = from ? normalizeGraphSnapshot(from) : null;
  const ops: GraphDiffOp[] = [];

  const fromNodes = new Map((normalizedFrom?.nodes ?? []).map((node) => [node.id, node]));
  const toNodes = new Map(normalizedTo.nodes.map((node) => [node.id, node]));

  for (const [id, node] of toNodes) {
    const previous = fromNodes.get(id);
    if (!previous) {
      const op =
        node.type === 'Finding'
          ? 'finding.added'
          : node.type === 'Evidence'
            ? 'evidence.added'
            : 'node.added';
      ops.push({ op, id, type: node.type, after: node });
      continue;
    }
    if (stableJson(previous) !== stableJson(node)) {
      ops.push({ op: 'node.changed', id, type: node.type, before: previous, after: node });
    }
  }

  for (const [id, node] of fromNodes) {
    if (!toNodes.has(id)) {
      ops.push({
        op: node.type === 'Finding' ? 'finding.resolved' : 'node.removed',
        id,
        type: node.type,
        before: node,
      });
    }
  }

  const fromEdges = new Map(
    (normalizedFrom?.edges ?? []).map((edge) => [graphEdgeKey(edge), edge]),
  );
  const toEdges = new Map(normalizedTo.edges.map((edge) => [graphEdgeKey(edge), edge]));

  for (const [key, edge] of toEdges) {
    const previous = fromEdges.get(key);
    if (!previous) {
      ops.push({
        op: 'edge.added',
        src: edge.src,
        dst: edge.dst,
        relation: edge.relation,
        after: edge,
      });
      continue;
    }
    if (stableJson(previous) !== stableJson(edge)) {
      ops.push({
        op: 'edge.changed',
        src: edge.src,
        dst: edge.dst,
        relation: edge.relation,
        before: previous,
        after: edge,
      });
    }
  }

  for (const [key, edge] of fromEdges) {
    if (!toEdges.has(key)) {
      ops.push({
        op: 'edge.removed',
        src: edge.src,
        dst: edge.dst,
        relation: edge.relation,
        before: edge,
      });
    }
  }

  return {
    $schema: GRAPH_DIFF_SCHEMA_URL,
    id: `diff:${normalizedFrom?.id ?? 'empty'}:${normalizedTo.id}`,
    from: normalizedFrom?.id,
    to: normalizedTo.id,
    ops,
  };
}

export function summarizeGraphDiff(diff: GraphDiff | null | undefined): GraphDiffSummary {
  const byType = Object.fromEntries(
    [
      'node.added',
      'node.removed',
      'node.changed',
      'edge.added',
      'edge.removed',
      'edge.changed',
      'finding.added',
      'finding.resolved',
      'evidence.added',
    ].map((op) => [op, 0]),
  ) as Record<GraphDiffOpType, number>;

  for (const op of diff?.ops ?? []) {
    byType[op.op] = (byType[op.op] ?? 0) + 1;
  }

  return {
    total: diff?.ops.length ?? 0,
    by_type: byType,
    nodes: {
      added: byType['node.added'],
      removed: byType['node.removed'],
      changed: byType['node.changed'],
    },
    edges: {
      added: byType['edge.added'],
      removed: byType['edge.removed'],
      changed: byType['edge.changed'],
    },
    findings: {
      added: byType['finding.added'],
      resolved: byType['finding.resolved'],
    },
    evidence: {
      added: byType['evidence.added'],
    },
  };
}

export function graphPayloadRecord(payload: unknown): Record<string, unknown> {
  return payload && typeof payload === 'object' && !Array.isArray(payload)
    ? (payload as Record<string, unknown>)
    : {};
}

export function graphPayloadString(payload: unknown, key: string): string | undefined {
  const value = graphPayloadRecord(payload)[key];
  return typeof value === 'string' ? value : undefined;
}

function graphPayloadValueAtPath(payload: unknown, path: string): unknown {
  const parts = path
    .split('.')
    .map((part) => part.trim())
    .filter(Boolean);
  let current: unknown = payload;
  for (const part of parts) {
    if (!current || typeof current !== 'object' || Array.isArray(current)) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function graphNodePayloadMatches(node: GraphNode, query: GraphNodeQuery): boolean {
  if (query.payloadKey) {
    const value = graphPayloadValueAtPath(node.payload, query.payloadKey);
    if (value === undefined) return false;
    if (query.payloadValue !== undefined && String(value) !== query.payloadValue) return false;
  }
  if (query.payloadContains) {
    return JSON.stringify(node.payload).toLowerCase().includes(query.payloadContains.toLowerCase());
  }
  return true;
}

function nodeLabel(node: GraphNode): string | undefined {
  return (
    graphPayloadString(node.payload, 'label') ??
    graphPayloadString(node.payload, 'name') ??
    graphPayloadString(node.payload, 'id') ??
    graphPayloadString(node.payload, 'path')
  );
}

function taskKeywords(text: string | undefined): string[] {
  if (!text) return [];
  const stopWords = new Set([
    'a',
    'an',
    'and',
    'are',
    'as',
    'at',
    'be',
    'by',
    'for',
    'from',
    'in',
    'into',
    'is',
    'it',
    'of',
    'on',
    'or',
    'page',
    'route',
    'section',
    'that',
    'the',
    'this',
    'to',
    'with',
  ]);
  return [
    ...new Set(
      text
        .toLowerCase()
        .split(/[^a-z0-9]+/g)
        .map((term) => term.trim())
        .filter((term) => term.length >= 3 && !stopWords.has(term)),
    ),
  ].slice(0, 12);
}

function graphNodeSearchText(node: GraphNode): string {
  return [node.id, node.type, nodeLabel(node), JSON.stringify(node.payload ?? {})]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function vocabularyItems(
  snapshot: GraphSnapshot,
  type: GraphNodeType,
): ContractCapsuleVocabularyItem[] {
  return sortGraphNodes(snapshot.nodes.filter((node) => node.type === type)).map((node) => ({
    id: node.id,
    label: nodeLabel(node),
    payload: node.payload,
  }));
}

function contractCapsuleSourceArtifacts(snapshot: GraphSnapshot): ContractCapsuleSourceArtifact[] {
  return sortGraphNodes(snapshot.nodes.filter((node) => node.type === 'SourceArtifact'))
    .map((node) => ({
      id: node.id,
      path: graphPayloadString(node.payload, 'path') ?? node.id.replace(/^src:/, ''),
      kind: graphPayloadString(node.payload, 'kind'),
      label: nodeLabel(node),
      payload: node.payload,
    }))
    .sort((a, b) => a.path.localeCompare(b.path) || a.id.localeCompare(b.id));
}

function contractCapsuleSourceArtifactLimit(limit: number | undefined): number {
  if (limit === undefined) return DEFAULT_CONTRACT_CAPSULE_SOURCE_ARTIFACT_LIMIT;
  if (!Number.isFinite(limit)) return DEFAULT_CONTRACT_CAPSULE_SOURCE_ARTIFACT_LIMIT;
  return Math.max(0, Math.floor(limit));
}

function isContractCapsuleNode(node: GraphNode): boolean {
  return !['Finding', 'Evidence', 'Repair', 'Test', 'AgentRun', 'SourceArtifact'].includes(
    node.type,
  );
}

function isContractCapsuleEdge(edge: GraphEdge, nodeIds: Set<string>): boolean {
  if (!nodeIds.has(edge.src) || !nodeIds.has(edge.dst)) return false;
  return ![
    'FINDING_VIOLATES_RULE',
    'FINDING_ANCHORED_AT',
    'EVIDENCE_SUPPORTS_FINDING',
    'EVIDENCE_CAPTURED_FOR',
    'REPAIR_FIXES_FINDING',
    'TEST_COVERS_NODE',
    'AGENT_RUN_CHANGED_NODE',
  ].includes(edge.relation);
}

export function graphContractHash(snapshot: GraphSnapshot): string {
  const normalized = normalizeGraphSnapshot(snapshot);
  const nodes = sortGraphNodes(normalized.nodes.filter(isContractCapsuleNode));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = sortGraphEdges(
    normalized.edges.filter((edge) => isContractCapsuleEdge(edge, nodeIds)),
  );
  return hashStableJson({
    schema_version: normalized.schema_version,
    project_id: normalized.project_id,
    nodes,
    edges,
  });
}

export function buildContractCapsuleFromSnapshot(
  snapshot: GraphSnapshot,
  options: BuildContractCapsuleOptions = {},
): ContractCapsule {
  const normalized = normalizeGraphSnapshot(snapshot);
  const pageForRoute = new Map<string, string>();
  const shellForPage = new Map<string, string>();

  for (const edge of normalized.edges) {
    if (edge.relation === 'PAGE_ROUTED_AT_ROUTE') {
      pageForRoute.set(edge.dst, edge.src);
    }
    if (edge.relation === 'PAGE_USES_SHELL') {
      shellForPage.set(edge.src, edge.dst);
    }
  }

  const routes = sortGraphNodes(normalized.nodes.filter((node) => node.type === 'Route')).map(
    (node) => {
      const pageId = pageForRoute.get(node.id);
      return {
        id: node.id,
        path: graphPayloadString(node.payload, 'path') ?? node.id.replace(/^rt:/, ''),
        page_id: pageId,
        shell_id: pageId ? shellForPage.get(pageId) : undefined,
      };
    },
  );

  const openFindings = sortGraphNodes(
    normalized.nodes.filter((node) => node.type === 'Finding'),
  ).map((node) => ({
    id: node.id,
    code: graphPayloadString(node.payload, 'code'),
    severity: graphPayloadString(node.payload, 'severity'),
    anchored_at: graphPayloadString(node.payload, 'anchored_at'),
    message: graphPayloadString(node.payload, 'message'),
  }));

  const components = vocabularyItems(normalized, 'Component');
  const tokens = vocabularyItems(normalized, 'Token');
  const localRules = vocabularyItems(normalized, 'LocalRule');
  const styleBridge = vocabularyItems(normalized, 'StyleBridge');
  const allSourceArtifacts = contractCapsuleSourceArtifacts(normalized);
  const sourceArtifactLimit = contractCapsuleSourceArtifactLimit(options.sourceArtifactLimit);
  const sourceArtifacts = allSourceArtifacts.slice(0, sourceArtifactLimit);
  const contractHash = graphContractHash(normalized);
  const contractCacheKey = `decantr-contract:${contractHash}`;

  return {
    $schema: CONTRACT_CAPSULE_SCHEMA_URL,
    schema_version: normalized.schema_version,
    snapshot_id: normalized.id,
    project_id: normalized.project_id,
    created_at: options.createdAt ?? normalized.created_at,
    source_hash: normalized.source_hash,
    contract_hash: contractHash,
    cache_key: options.cacheKey ?? contractCacheKey,
    contract_cache_key: contractCacheKey,
    summary: {
      routes: routes.length,
      components: components.length,
      tokens: tokens.length,
      local_rules: localRules.length,
      style_bridge: styleBridge.length,
      source_artifacts: allSourceArtifacts.length,
      open_findings: openFindings.length,
    },
    source_artifact_limit: sourceArtifactLimit,
    source_artifacts_truncated: allSourceArtifacts.length > sourceArtifacts.length,
    routes,
    components,
    tokens,
    local_rules: localRules,
    style_bridge: styleBridge,
    source_artifacts: sourceArtifacts,
    open_findings: openFindings,
  };
}

const PAGERANK_DAMPING = 0.82;
const PAGERANK_ITERATIONS = 16;

const RELATION_RANK_WEIGHTS: Partial<Record<GraphRelation, number>> = {
  PAGE_ROUTED_AT_ROUTE: 1,
  PAGE_USES_SHELL: 0.9,
  PAGE_COMPOSES_PATTERN: 0.88,
  PATTERN_NEEDS_COMPONENT: 0.82,
  COMPONENT_STYLED_WITH_TOKEN: 0.62,
  LOCAL_RULE_APPLIES_TO: 0.72,
  STYLE_BRIDGE_MAPS_TO: 0.7,
  FINDING_ANCHORED_AT: 0.78,
  EVIDENCE_SUPPORTS_FINDING: 0.58,
  EVIDENCE_CAPTURED_FOR: 0.56,
  REPAIR_FIXES_FINDING: 0.54,
  NODE_DERIVED_FROM_SOURCE: 0.5,
  SOURCE_IMPORTS_SOURCE: 0.42,
  TEST_COVERS_NODE: 0.36,
};

function personalizedPageRank(
  nodes: GraphNode[],
  edges: GraphEdge[],
  seedIds: Set<string>,
): Map<string, number> {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const seeds = [...seedIds].filter((id) => nodeIds.has(id)).sort();
  const activeSeeds =
    seeds.length > 0
      ? seeds
      : sortGraphNodes(nodes)
          .slice(0, 1)
          .map((node) => node.id);
  const teleport = new Map<string, number>();
  for (const node of nodes) teleport.set(node.id, 0);
  for (const seed of activeSeeds) teleport.set(seed, 1 / activeSeeds.length);

  const adjacency = new Map<string, Array<{ id: string; weight: number }>>();
  for (const node of nodes) adjacency.set(node.id, []);
  for (const edge of edges) {
    if (!nodeIds.has(edge.src) || !nodeIds.has(edge.dst)) continue;
    const weight = RELATION_RANK_WEIGHTS[edge.relation] ?? 0.32;
    adjacency.get(edge.src)?.push({ id: edge.dst, weight });
    adjacency.get(edge.dst)?.push({ id: edge.src, weight: weight * 0.82 });
  }

  let rank = new Map(teleport);
  for (let pass = 0; pass < PAGERANK_ITERATIONS; pass += 1) {
    const next = new Map<string, number>();
    for (const node of nodes) {
      next.set(node.id, (1 - PAGERANK_DAMPING) * (teleport.get(node.id) ?? 0));
    }
    for (const node of nodes) {
      const outgoing = adjacency.get(node.id) ?? [];
      const current = rank.get(node.id) ?? 0;
      const totalWeight = outgoing.reduce((sum, edge) => sum + edge.weight, 0);
      if (totalWeight <= 0) {
        next.set(node.id, (next.get(node.id) ?? 0) + PAGERANK_DAMPING * current);
        continue;
      }
      for (const edge of outgoing) {
        next.set(
          edge.id,
          (next.get(edge.id) ?? 0) + PAGERANK_DAMPING * current * (edge.weight / totalWeight),
        );
      }
    }
    rank = next;
  }

  const max = Math.max(...[...rank.values()], 0.00001);
  return new Map([...rank.entries()].map(([id, value]) => [id, value / max]));
}

function hybridRankNodes<
  T extends { id: string; type: GraphNodeType; score: number; reason: string },
>(
  nodes: GraphNode[],
  edges: GraphEdge[],
  seedIds: Set<string>,
  baseRank: (node: GraphNode) => { score: number; reason: string },
  keywords: string[],
): Array<T & { matched_terms?: string[] }> {
  const ppr = personalizedPageRank(nodes, edges, seedIds);
  return nodes
    .map((node) => {
      const ranked = baseRank(node);
      const searchText = keywords.length > 0 ? graphNodeSearchText(node) : '';
      const matchedTerms = keywords.filter((keyword) => searchText.includes(keyword));
      const taskBoost = Math.min(0.12, matchedTerms.length * 0.035);
      const graphBoost = (ppr.get(node.id) ?? 0) * 0.32;
      const weightedScore = ranked.score * 0.68 + graphBoost + taskBoost;
      return {
        id: node.id,
        type: node.type,
        score: Number(Math.min(1, weightedScore).toFixed(3)),
        reason:
          matchedTerms.length > 0
            ? `${ranked.reason}+pagerank+task_match`
            : `${ranked.reason}+pagerank`,
        ...(matchedTerms.length > 0 ? { matched_terms: matchedTerms } : {}),
      } as T & { matched_terms?: string[] };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.matched_terms?.length ?? 0) - (a.matched_terms?.length ?? 0) ||
        a.id.localeCompare(b.id),
    );
}

function rankGraphRouteContextNodes(
  nodes: GraphNode[],
  edges: GraphEdge[],
  routeNodeId: string,
  ids: GraphRouteContext['ids'],
  keywords: string[] = [],
): GraphRouteContext['ranked'] {
  const scoreForNode = (node: GraphNode): { score: number; reason: string } => {
    if (node.id === routeNodeId) return { score: 1, reason: 'requested_route' };
    if (ids.pages.includes(node.id)) return { score: 0.95, reason: 'route_page' };
    if (ids.shells.includes(node.id)) return { score: 0.86, reason: 'route_shell' };
    if (ids.patterns.includes(node.id)) return { score: 0.8, reason: 'page_pattern' };
    if (ids.components.includes(node.id)) return { score: 0.72, reason: 'pattern_component' };
    if (ids.tokens.includes(node.id)) return { score: 0.66, reason: 'route_style_token' };
    if (ids.localRules.includes(node.id)) return { score: 0.68, reason: 'applicable_local_rule' };
    if (ids.styleBridge.includes(node.id)) return { score: 0.64, reason: 'style_bridge_mapping' };
    if (ids.openFindings.includes(node.id)) return { score: 0.62, reason: 'open_finding' };
    if (ids.evidence.includes(node.id)) return { score: 0.56, reason: 'supporting_evidence' };
    if (ids.sourceArtifacts.includes(node.id)) return { score: 0.32, reason: 'source_provenance' };
    return { score: 0.24, reason: 'included_context' };
  };

  return hybridRankNodes(nodes, edges, new Set([routeNodeId]), scoreForNode, keywords);
}

export function buildGraphRouteContext(
  snapshot: GraphSnapshot | null | undefined,
  route: string,
  options: BuildGraphRouteContextOptions = {},
): GraphRouteContext | null {
  if (!snapshot) return null;

  const routeNode = snapshot.nodes.find(
    (node) =>
      node.type === 'Route' &&
      (graphPayloadString(node.payload, 'path') === route || node.id === `rt:${route}`),
  );
  if (!routeNode) return null;

  const includeNodeIds = new Set<string>([routeNode.id]);
  const includeEdges = new Map<string, GraphEdge>();
  const includeEdge = (edge: GraphEdge) => {
    includeEdges.set(graphEdgeKey(edge), edge);
    includeNodeIds.add(edge.src);
    includeNodeIds.add(edge.dst);
  };

  for (const edge of snapshot.edges) {
    if (edge.relation === 'PAGE_ROUTED_AT_ROUTE' && edge.dst === routeNode.id) {
      includeEdge(edge);
    }
  }

  const pageIds = new Set(
    [...includeEdges.values()]
      .filter((edge) => edge.relation === 'PAGE_ROUTED_AT_ROUTE')
      .map((edge) => edge.src),
  );

  for (const edge of snapshot.edges) {
    if (
      pageIds.has(edge.src) &&
      ['PAGE_USES_SHELL', 'PAGE_COMPOSES_PATTERN', 'NODE_DERIVED_FROM_SOURCE'].includes(
        edge.relation,
      )
    ) {
      includeEdge(edge);
    }
  }

  const patternIds = new Set(
    [...includeEdges.values()]
      .filter((edge) => edge.relation === 'PAGE_COMPOSES_PATTERN')
      .map((edge) => edge.dst),
  );

  for (const edge of snapshot.edges) {
    if (
      patternIds.has(edge.src) &&
      ['PATTERN_NEEDS_COMPONENT', 'NODE_DERIVED_FROM_SOURCE'].includes(edge.relation)
    ) {
      includeEdge(edge);
    }
  }

  for (const node of snapshot.nodes) {
    if (node.type === 'LocalRule' || node.type === 'StyleBridge') {
      includeNodeIds.add(node.id);
    }
  }

  for (const edge of snapshot.edges) {
    if (
      includeNodeIds.has(edge.src) &&
      ['LOCAL_RULE_APPLIES_TO', 'STYLE_BRIDGE_MAPS_TO', 'NODE_DERIVED_FROM_SOURCE'].includes(
        edge.relation,
      )
    ) {
      includeEdge(edge);
    }
  }

  for (const edge of snapshot.edges) {
    if (edge.relation === 'FINDING_ANCHORED_AT' && includeNodeIds.has(edge.dst)) {
      includeEdge(edge);
    }
  }

  const findingIds = new Set(
    [...includeEdges.values()]
      .filter((edge) => edge.relation === 'FINDING_ANCHORED_AT')
      .map((edge) => edge.src),
  );

  for (const edge of snapshot.edges) {
    if (
      findingIds.has(edge.src) ||
      (findingIds.has(edge.dst) &&
        ['FINDING_VIOLATES_RULE', 'EVIDENCE_SUPPORTS_FINDING', 'REPAIR_FIXES_FINDING'].includes(
          edge.relation,
        ))
    ) {
      includeEdge(edge);
    }
  }

  for (const edge of snapshot.edges) {
    if (edge.relation === 'EVIDENCE_CAPTURED_FOR' && includeNodeIds.has(edge.dst)) {
      includeEdge(edge);
    }
  }

  for (const edge of snapshot.edges) {
    if (includeNodeIds.has(edge.src) && edge.relation === 'NODE_DERIVED_FROM_SOURCE') {
      includeEdge(edge);
    }
  }

  const sourceArtifactIds = [...includeNodeIds].filter((nodeId) => {
    const node = snapshot.nodes.find((candidate) => candidate.id === nodeId);
    if (node?.type !== 'SourceArtifact') return false;
    const kind = graphPayloadString(node.payload, 'kind');
    return kind === 'route-source' || kind === 'component-source';
  });

  for (const edge of snapshot.edges) {
    if (
      sourceArtifactIds.includes(edge.dst) &&
      edge.relation === 'NODE_DERIVED_FROM_SOURCE' &&
      snapshot.nodes.find((node) => node.id === edge.src)?.type === 'Component'
    ) {
      includeEdge(edge);
    }
  }

  for (const edge of snapshot.edges) {
    if (
      edge.relation === 'SOURCE_IMPORTS_SOURCE' &&
      (sourceArtifactIds.includes(edge.src) || sourceArtifactIds.includes(edge.dst))
    ) {
      includeEdge(edge);
    }
  }

  const nodes = sortGraphNodes(snapshot.nodes.filter((node) => includeNodeIds.has(node.id)));
  const edges = sortGraphEdges([...includeEdges.values()]);
  const ids = {
    pages: graphNodeIdsByType(nodes, 'Page'),
    shells: graphNodeIdsByType(nodes, 'Shell'),
    patterns: graphNodeIdsByType(nodes, 'Pattern'),
    components: graphNodeIdsByType(nodes, 'Component'),
    tokens: graphNodeIdsByType(nodes, 'Token'),
    localRules: graphNodeIdsByType(nodes, 'LocalRule'),
    styleBridge: graphNodeIdsByType(nodes, 'StyleBridge'),
    openFindings: graphNodeIdsByType(nodes, 'Finding'),
    evidence: graphNodeIdsByType(nodes, 'Evidence'),
    sourceArtifacts: graphNodeIdsByType(nodes, 'SourceArtifact'),
  };
  const keywords = taskKeywords(options.task);

  return {
    snapshotId: snapshot.id,
    sourceHash: snapshot.source_hash,
    routeNode,
    ranking: {
      method:
        keywords.length > 0
          ? 'hybrid_weighted_pagerank_with_task_boost'
          : 'hybrid_weighted_pagerank',
      seed: routeNode.id,
      task_keywords: keywords,
    },
    summary: {
      nodes: nodes.length,
      edges: edges.length,
      pages: graphNodeIdsByType(nodes, 'Page').length,
      shells: graphNodeIdsByType(nodes, 'Shell').length,
      patterns: graphNodeIdsByType(nodes, 'Pattern').length,
      components: graphNodeIdsByType(nodes, 'Component').length,
      tokens: graphNodeIdsByType(nodes, 'Token').length,
      localRules: graphNodeIdsByType(nodes, 'LocalRule').length,
      styleBridge: graphNodeIdsByType(nodes, 'StyleBridge').length,
      openFindings: graphNodeIdsByType(nodes, 'Finding').length,
      evidence: graphNodeIdsByType(nodes, 'Evidence').length,
      sourceArtifacts: graphNodeIdsByType(nodes, 'SourceArtifact').length,
    },
    ids,
    ranked: rankGraphRouteContextNodes(nodes, edges, routeNode.id, ids, keywords),
    nodes,
    edges,
  };
}

const IMPACT_TRAVERSAL_RELATIONS = new Set<GraphRelation>([
  'SECTION_CONTAINS_PAGE',
  'PAGE_ROUTED_AT_ROUTE',
  'PAGE_USES_SHELL',
  'PAGE_COMPOSES_PATTERN',
  'PATTERN_NEEDS_COMPONENT',
  'COMPONENT_STYLED_WITH_TOKEN',
  'THEME_DEFINES_TOKEN',
  'THEME_DEFINES_DECORATOR',
  'COMPONENT_DECORATED_WITH_DECORATOR',
  'LOCAL_RULE_APPLIES_TO',
  'STYLE_BRIDGE_MAPS_TO',
  'FINDING_VIOLATES_RULE',
  'FINDING_ANCHORED_AT',
  'EVIDENCE_SUPPORTS_FINDING',
  'EVIDENCE_CAPTURED_FOR',
  'REPAIR_FIXES_FINDING',
  'TEST_COVERS_NODE',
  'AGENT_RUN_CHANGED_NODE',
  'SOURCE_IMPORTS_SOURCE',
]);

function impactIds(nodes: GraphNode[]): GraphImpactContext['ids'] {
  return {
    routes: graphNodeIdsByType(nodes, 'Route'),
    pages: graphNodeIdsByType(nodes, 'Page'),
    shells: graphNodeIdsByType(nodes, 'Shell'),
    patterns: graphNodeIdsByType(nodes, 'Pattern'),
    components: graphNodeIdsByType(nodes, 'Component'),
    tokens: graphNodeIdsByType(nodes, 'Token'),
    localRules: graphNodeIdsByType(nodes, 'LocalRule'),
    styleBridge: graphNodeIdsByType(nodes, 'StyleBridge'),
    openFindings: graphNodeIdsByType(nodes, 'Finding'),
    evidence: graphNodeIdsByType(nodes, 'Evidence'),
    repairs: graphNodeIdsByType(nodes, 'Repair'),
    sourceArtifacts: graphNodeIdsByType(nodes, 'SourceArtifact'),
  };
}

function rankGraphImpactContextNodes(
  nodes: GraphNode[],
  edges: GraphEdge[],
  seedIds: Set<string>,
  ids: GraphImpactContext['ids'],
  keywords: string[] = [],
): GraphImpactContext['ranked'] {
  const scoreForNode = (node: GraphNode): { score: number; reason: string } => {
    if (seedIds.has(node.id)) return { score: 1, reason: 'seed_node' };
    if (ids.routes.includes(node.id)) return { score: 0.92, reason: 'affected_route' };
    if (ids.pages.includes(node.id)) return { score: 0.88, reason: 'affected_page' };
    if (ids.shells.includes(node.id)) return { score: 0.82, reason: 'affected_shell' };
    if (ids.patterns.includes(node.id)) return { score: 0.78, reason: 'affected_pattern' };
    if (ids.components.includes(node.id)) return { score: 0.72, reason: 'affected_component' };
    if (ids.tokens.includes(node.id)) return { score: 0.68, reason: 'affected_token' };
    if (ids.localRules.includes(node.id)) return { score: 0.64, reason: 'governing_local_rule' };
    if (ids.styleBridge.includes(node.id)) return { score: 0.62, reason: 'style_bridge_mapping' };
    if (ids.openFindings.includes(node.id)) return { score: 0.6, reason: 'open_finding' };
    if (ids.evidence.includes(node.id)) return { score: 0.54, reason: 'supporting_evidence' };
    if (ids.repairs.includes(node.id)) return { score: 0.52, reason: 'available_repair' };
    if (ids.sourceArtifacts.includes(node.id)) return { score: 0.34, reason: 'source_provenance' };
    return { score: 0.24, reason: 'included_impact' };
  };

  return hybridRankNodes(nodes, edges, seedIds, scoreForNode, keywords);
}

function shouldTraverseImpactEdge(
  edge: GraphEdge,
  includedNodeIds: Set<string>,
  projectId: string,
): boolean {
  if (!IMPACT_TRAVERSAL_RELATIONS.has(edge.relation)) return false;
  if (!includedNodeIds.has(edge.src) && !includedNodeIds.has(edge.dst)) return false;
  if (
    edge.dst === projectId &&
    includedNodeIds.has(projectId) &&
    !includedNodeIds.has(edge.src) &&
    (edge.relation === 'LOCAL_RULE_APPLIES_TO' || edge.relation === 'STYLE_BRIDGE_MAPS_TO')
  ) {
    return false;
  }
  return true;
}

function isProjectScopedPolicySeed(
  seedNodeIds: Set<string>,
  nodeById: Map<string, GraphNode>,
  edges: GraphEdge[],
  projectId: string,
): boolean {
  return [...seedNodeIds].some((seedId) => {
    const node = nodeById.get(seedId);
    if (node?.type !== 'LocalRule' && node?.type !== 'StyleBridge') return false;
    return edges.some(
      (edge) =>
        edge.src === seedId &&
        edge.dst === projectId &&
        (edge.relation === 'LOCAL_RULE_APPLIES_TO' || edge.relation === 'STYLE_BRIDGE_MAPS_TO'),
    );
  });
}

export function buildGraphImpactContext(
  snapshot: GraphSnapshot | null | undefined,
  seed: string | string[],
  options: BuildGraphImpactContextOptions = {},
): GraphImpactContext | null {
  if (!snapshot) return null;

  const seedIds = [...new Set(Array.isArray(seed) ? seed : [seed])].filter(Boolean);
  const nodeById = new Map(snapshot.nodes.map((node) => [node.id, node]));
  const seedNodes = seedIds
    .map((nodeId) => nodeById.get(nodeId))
    .filter((node): node is GraphNode => !!node);
  const missingNodeIds = seedIds.filter((nodeId) => !nodeById.has(nodeId)).sort();
  if (!seedNodes.length) return null;

  const includeNodeIds = new Set(seedNodes.map((node) => node.id));
  const seedNodeIds = new Set(includeNodeIds);
  const seedSourceIds = new Set(
    seedNodes.filter((node) => node.type === 'SourceArtifact').map((node) => node.id),
  );
  const includeEdges = new Map<string, GraphEdge>();
  const includeEdge = (edge: GraphEdge) => {
    includeEdges.set(graphEdgeKey(edge), edge);
    includeNodeIds.add(edge.src);
    includeNodeIds.add(edge.dst);
  };

  for (let pass = 0; pass < 5; pass += 1) {
    const nodeCount = includeNodeIds.size;
    const edgeCount = includeEdges.size;

    for (const edge of snapshot.edges) {
      if (edge.relation === 'NODE_DERIVED_FROM_SOURCE') {
        if (includeNodeIds.has(edge.src) || seedSourceIds.has(edge.dst)) {
          includeEdge(edge);
        }
        continue;
      }
      if (shouldTraverseImpactEdge(edge, includeNodeIds, snapshot.project_id)) {
        includeEdge(edge);
      }
    }

    if (includeNodeIds.size === nodeCount && includeEdges.size === edgeCount) break;
  }

  if (isProjectScopedPolicySeed(seedNodeIds, nodeById, snapshot.edges, snapshot.project_id)) {
    for (const edge of snapshot.edges) {
      if (edge.relation === 'PAGE_ROUTED_AT_ROUTE') {
        includeEdge(edge);
      }
    }
    const pageIds = new Set(
      [...includeEdges.values()]
        .filter((edge) => edge.relation === 'PAGE_ROUTED_AT_ROUTE')
        .map((edge) => edge.src),
    );
    for (const edge of snapshot.edges) {
      if (
        pageIds.has(edge.src) &&
        (edge.relation === 'PAGE_USES_SHELL' || edge.relation === 'NODE_DERIVED_FROM_SOURCE')
      ) {
        includeEdge(edge);
      }
    }
  }

  let nodes = sortGraphNodes(snapshot.nodes.filter((node) => includeNodeIds.has(node.id)));
  let edges = sortGraphEdges([...includeEdges.values()]);
  const totalNodes = nodes.length;
  const totalEdges = edges.length;
  const keywords = taskKeywords(options.task);
  const fullIds = impactIds(nodes);
  const fullRanked = rankGraphImpactContextNodes(nodes, edges, seedNodeIds, fullIds, keywords);
  const boundedLimit =
    typeof options.limit === 'number' && Number.isFinite(options.limit) && options.limit > 0
      ? Math.floor(options.limit)
      : undefined;
  let truncated = false;

  if (boundedLimit && nodes.length > boundedLimit) {
    const keepIds = new Set(fullRanked.slice(0, boundedLimit).map((node) => node.id));
    for (const seedId of seedNodeIds) {
      keepIds.add(seedId);
    }
    nodes = sortGraphNodes(nodes.filter((node) => keepIds.has(node.id)));
    const keptNodeIds = new Set(nodes.map((node) => node.id));
    edges = sortGraphEdges(
      edges.filter((edge) => keptNodeIds.has(edge.src) && keptNodeIds.has(edge.dst)),
    );
    truncated = true;
  }

  const ids = impactIds(nodes);
  const ranked = rankGraphImpactContextNodes(nodes, edges, seedNodeIds, ids, keywords);

  return {
    snapshotId: snapshot.id,
    sourceHash: snapshot.source_hash,
    seedNodes: sortGraphNodes(seedNodes),
    missingNodeIds,
    ranking: {
      method:
        keywords.length > 0 ? 'hybrid_impact_pagerank_with_task_boost' : 'hybrid_impact_pagerank',
      seed: [...seedNodeIds].sort(),
      task_keywords: keywords,
    },
    summary: {
      nodes: nodes.length,
      edges: edges.length,
      totalNodes,
      totalEdges,
      truncated,
      routes: ids.routes.length,
      pages: ids.pages.length,
      shells: ids.shells.length,
      patterns: ids.patterns.length,
      components: ids.components.length,
      tokens: ids.tokens.length,
      localRules: ids.localRules.length,
      styleBridge: ids.styleBridge.length,
      openFindings: ids.openFindings.length,
      evidence: ids.evidence.length,
      repairs: ids.repairs.length,
      sourceArtifacts: ids.sourceArtifacts.length,
    },
    ids,
    ranked,
    nodes,
    edges,
  };
}

function graphSlug(value: string, fallback: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.:/-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || fallback;
}

function addNode(nodes: Map<string, GraphNode>, node: GraphNode): void {
  if (!nodes.has(node.id)) {
    nodes.set(node.id, node);
  }
}

function addEdge(edges: Map<string, GraphEdge>, edge: GraphEdge): void {
  edges.set(graphEdgeKey(edge), edge);
}

function walkPatternNodes(node: IRNode, patterns: IRPatternNode[] = []): IRPatternNode[] {
  if (node.type === 'pattern') {
    patterns.push(node as IRPatternNode);
  }
  for (const child of node.children) {
    walkPatternNodes(child, patterns);
  }
  return patterns;
}

interface EssenceLayoutPattern {
  id: string;
  alias?: string;
  preset?: string;
}

function collectEssenceLayoutPatterns(item: LayoutItem, patterns: EssenceLayoutPattern[]): void {
  if (typeof item === 'string') {
    patterns.push({ id: item });
    return;
  }

  if (!item || typeof item !== 'object') {
    return;
  }

  if ('pattern' in item && typeof item.pattern === 'string') {
    patterns.push({
      id: item.pattern,
      alias: typeof item.as === 'string' ? item.as : undefined,
      preset: typeof item.preset === 'string' ? item.preset : undefined,
    });
  }

  if ('cols' in item && Array.isArray(item.cols)) {
    for (const column of item.cols) {
      collectEssenceLayoutPatterns(column, patterns);
    }
  }
}

function essenceLayoutPatterns(layout: LayoutItem[]): EssenceLayoutPattern[] {
  const patterns: EssenceLayoutPattern[] = [];
  for (const item of layout) {
    collectEssenceLayoutPatterns(item, patterns);
  }
  return patterns;
}

export function buildGraphSnapshotFromEssence(
  essence: EssenceV4,
  options: BuildGraphSnapshotFromEssenceOptions = {},
): GraphSnapshot {
  const projectId = options.projectId ?? 'proj:default';
  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, GraphEdge>();
  const sourceNodeId = options.sourceArtifact?.id;
  const routeEntries = essence.blueprint.routes ?? {};

  addNode(nodes, {
    id: projectId,
    type: 'Project',
    payload: {
      archetype: essence.meta.archetype,
      target: essence.meta.target,
      platform: essence.meta.platform,
      guard: essence.meta.guard,
      routing: essence.meta.platform.routing,
      features: essence.blueprint.features,
    },
  });

  if (options.sourceArtifact) {
    addNode(nodes, {
      id: options.sourceArtifact.id,
      type: 'SourceArtifact',
      payload: options.sourceArtifact,
    });
    addEdge(edges, {
      src: projectId,
      dst: options.sourceArtifact.id,
      relation: 'NODE_DERIVED_FROM_SOURCE',
    });
  }

  const themeId = `theme:${graphSlug(essence.dna.theme.id, 'theme')}`;
  addNode(nodes, {
    id: themeId,
    type: 'Theme',
    payload: essence.dna.theme,
  });
  addEdge(edges, {
    src: projectId,
    dst: themeId,
    relation: 'PROJECT_USES_THEME',
  });
  if (sourceNodeId) {
    addEdge(edges, {
      src: themeId,
      dst: sourceNodeId,
      relation: 'NODE_DERIVED_FROM_SOURCE',
    });
  }

  for (const feature of essence.blueprint.features) {
    const featureId = `feat:${graphSlug(feature, 'feature')}`;
    addNode(nodes, {
      id: featureId,
      type: 'Feature',
      payload: {
        id: feature,
      },
    });
    addEdge(edges, {
      src: projectId,
      dst: featureId,
      relation: 'PROJECT_ENABLES_FEATURE',
    });
    if (sourceNodeId) {
      addEdge(edges, {
        src: featureId,
        dst: sourceNodeId,
        relation: 'NODE_DERIVED_FROM_SOURCE',
      });
    }
  }

  const routeForPage = new Map<string, string>();
  for (const [path, entry] of Object.entries(routeEntries)) {
    routeForPage.set(`${entry.section}:${entry.page}`, path);
    const routeId = `rt:${path}`;
    addNode(nodes, {
      id: routeId,
      type: 'Route',
      payload: {
        path,
        section: entry.section,
        page: entry.page,
      },
    });
    if (sourceNodeId) {
      addEdge(edges, {
        src: routeId,
        dst: sourceNodeId,
        relation: 'NODE_DERIVED_FROM_SOURCE',
      });
    }
  }

  for (const section of essence.blueprint.sections) {
    const sectionId = `sec:${graphSlug(section.id, 'section')}`;
    const shellId = `sh:${graphSlug(String(section.shell), 'shell')}`;

    addNode(nodes, {
      id: sectionId,
      type: 'Section',
      payload: {
        id: section.id,
        role: section.role,
        description: section.description,
        features: section.features,
        directives: section.directives,
      },
    });
    addNode(nodes, {
      id: shellId,
      type: 'Shell',
      payload: {
        id: section.shell,
        navigation_items: section.navigation_items,
      },
    });
    addEdge(edges, {
      src: projectId,
      dst: sectionId,
      relation: 'PROJECT_CONTAINS_SECTION',
    });

    if (sourceNodeId) {
      addEdge(edges, {
        src: sectionId,
        dst: sourceNodeId,
        relation: 'NODE_DERIVED_FROM_SOURCE',
      });
      addEdge(edges, {
        src: shellId,
        dst: sourceNodeId,
        relation: 'NODE_DERIVED_FROM_SOURCE',
      });
    }

    for (const page of section.pages) {
      const pageId = `pg:${graphSlug(`${section.id}:${page.id}`, 'page')}`;
      const routePath = page.route ?? routeForPage.get(`${section.id}:${page.id}`);
      const routeId = routePath ? `rt:${routePath}` : null;
      const pageShellId = page.shell_override
        ? `sh:${graphSlug(String(page.shell_override), 'shell')}`
        : shellId;

      if (page.shell_override) {
        addNode(nodes, {
          id: pageShellId,
          type: 'Shell',
          payload: {
            id: page.shell_override,
            source: 'page.shell_override',
          },
        });
        if (sourceNodeId) {
          addEdge(edges, {
            src: pageShellId,
            dst: sourceNodeId,
            relation: 'NODE_DERIVED_FROM_SOURCE',
          });
        }
      }

      addNode(nodes, {
        id: pageId,
        type: 'Page',
        payload: {
          id: page.id,
          section: section.id,
          route: routePath,
          surface: page.surface,
          shell_override: page.shell_override,
          dna_overrides: page.dna_overrides,
          directives: page.directives,
        },
      });
      addEdge(edges, {
        src: sectionId,
        dst: pageId,
        relation: 'SECTION_CONTAINS_PAGE',
      });
      addEdge(edges, {
        src: pageId,
        dst: pageShellId,
        relation: 'PAGE_USES_SHELL',
      });
      if (routeId) {
        addNode(nodes, {
          id: routeId,
          type: 'Route',
          payload: {
            path: routePath,
            section: section.id,
            page: page.id,
          },
        });
        addEdge(edges, {
          src: pageId,
          dst: routeId,
          relation: 'PAGE_ROUTED_AT_ROUTE',
        });
      }
      if (sourceNodeId) {
        addEdge(edges, {
          src: pageId,
          dst: sourceNodeId,
          relation: 'NODE_DERIVED_FROM_SOURCE',
        });
      }

      essenceLayoutPatterns(page.layout).forEach((pattern, ordinal) => {
        const patternId = `pat:${graphSlug(pattern.id, 'pattern')}`;
        addNode(nodes, {
          id: patternId,
          type: 'Pattern',
          payload: {
            id: pattern.id,
            alias: pattern.alias,
            preset: pattern.preset,
          },
        });
        addEdge(edges, {
          src: pageId,
          dst: patternId,
          relation: 'PAGE_COMPOSES_PATTERN',
          payload: {
            alias: pattern.alias,
            preset: pattern.preset,
            source: 'essence.layout',
          },
          idx: ordinal,
        });
        if (sourceNodeId) {
          addEdge(edges, {
            src: patternId,
            dst: sourceNodeId,
            relation: 'NODE_DERIVED_FROM_SOURCE',
          });
        }
      });
    }
  }

  return normalizeGraphSnapshot({
    $schema: GRAPH_SNAPSHOT_SCHEMA_URL,
    id: options.snapshotId ?? `graph:${graphSlug(projectId, 'default')}:draft`,
    schema_version: GRAPH_SCHEMA_VERSION,
    project_id: projectId,
    created_at: options.createdAt ?? new Date(0).toISOString(),
    parent_id: options.parentId,
    source_hash: options.sourceHash ?? 'unknown',
    git: options.git,
    nodes: [...nodes.values()],
    edges: [...edges.values()],
    summary: {
      nodes: 0,
      edges: 0,
      findings: 0,
      evidence: 0,
    },
  });
}

export function buildGraphSnapshotFromIR(
  ir: IRAppNode,
  options: BuildGraphSnapshotFromIROptions = {},
): GraphSnapshot {
  const projectId = options.projectId ?? 'proj:default';
  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, GraphEdge>();
  const sourceNodeId = options.sourceArtifact?.id;

  addNode(nodes, {
    id: projectId,
    type: 'Project',
    payload: {
      routing: ir.routing,
      features: ir.features,
    },
  });

  if (options.sourceArtifact) {
    addNode(nodes, {
      id: options.sourceArtifact.id,
      type: 'SourceArtifact',
      payload: options.sourceArtifact,
    });
    addEdge(edges, {
      src: projectId,
      dst: options.sourceArtifact.id,
      relation: 'NODE_DERIVED_FROM_SOURCE',
    });
  }

  const shellId = `sh:${graphSlug(ir.shell.config.type || ir.shell.id, 'shell')}`;
  addNode(nodes, {
    id: shellId,
    type: 'Shell',
    payload: ir.shell.config,
  });

  if (sourceNodeId) {
    addEdge(edges, {
      src: shellId,
      dst: sourceNodeId,
      relation: 'NODE_DERIVED_FROM_SOURCE',
    });
  }

  for (const route of ir.routes) {
    const routeId = `rt:${route.path}`;
    addNode(nodes, {
      id: routeId,
      type: 'Route',
      payload: route,
    });
  }

  for (const page of ir.children) {
    if (page.type !== 'page') continue;
    const pageNode = page as IRPageNode;

    const sectionId = pageNode.sectionId ? `sec:${graphSlug(pageNode.sectionId, 'section')}` : null;
    const pageId = `pg:${graphSlug(pageNode.id, pageNode.pageId)}`;
    const route = ir.routes.find(
      (candidate) =>
        candidate.pageId === pageNode.pageId &&
        (!pageNode.sectionId || candidate.sectionId === pageNode.sectionId),
    );
    const routeId = route ? `rt:${route.path}` : null;

    if (sectionId) {
      addNode(nodes, {
        id: sectionId,
        type: 'Section',
        payload: {
          id: pageNode.sectionId,
        },
      });
      addEdge(edges, {
        src: projectId,
        dst: sectionId,
        relation: 'PROJECT_CONTAINS_SECTION',
      });
      addEdge(edges, {
        src: sectionId,
        dst: pageId,
        relation: 'SECTION_CONTAINS_PAGE',
      });
      if (sourceNodeId) {
        addEdge(edges, {
          src: sectionId,
          dst: sourceNodeId,
          relation: 'NODE_DERIVED_FROM_SOURCE',
        });
      }
    }

    addNode(nodes, {
      id: pageId,
      type: 'Page',
      payload: {
        id: pageNode.pageId,
        sectionId: pageNode.sectionId,
        surface: pageNode.surface,
      },
    });
    addEdge(edges, {
      src: pageId,
      dst: shellId,
      relation: 'PAGE_USES_SHELL',
    });
    if (routeId) {
      addEdge(edges, {
        src: pageId,
        dst: routeId,
        relation: 'PAGE_ROUTED_AT_ROUTE',
      });
    }
    if (sourceNodeId) {
      addEdge(edges, {
        src: pageId,
        dst: sourceNodeId,
        relation: 'NODE_DERIVED_FROM_SOURCE',
      });
    }

    walkPatternNodes(pageNode).forEach((patternNode, ordinal) => {
      const patternId = `pat:${graphSlug(patternNode.pattern.patternId, 'pattern')}`;
      addNode(nodes, {
        id: patternId,
        type: 'Pattern',
        payload: {
          id: patternNode.pattern.patternId,
          alias: patternNode.pattern.alias,
          preset: patternNode.pattern.preset,
          layout: patternNode.pattern.layout,
        },
      });
      addEdge(edges, {
        src: pageId,
        dst: patternId,
        relation: 'PAGE_COMPOSES_PATTERN',
        payload: {
          alias: patternNode.pattern.alias,
          preset: patternNode.pattern.preset,
        },
        idx: ordinal,
      });

      for (const component of patternNode.pattern.components) {
        const componentId = `cmp:${graphSlug(component, 'component')}`;
        addNode(nodes, {
          id: componentId,
          type: 'Component',
          payload: {
            name: component,
          },
        });
        addEdge(edges, {
          src: patternId,
          dst: componentId,
          relation: 'PATTERN_NEEDS_COMPONENT',
        });
      }

      if (sourceNodeId) {
        addEdge(edges, {
          src: patternId,
          dst: sourceNodeId,
          relation: 'NODE_DERIVED_FROM_SOURCE',
        });
      }
    });
  }

  return normalizeGraphSnapshot({
    $schema: GRAPH_SNAPSHOT_SCHEMA_URL,
    id: options.snapshotId ?? `graph:${graphSlug(projectId, 'default')}:draft`,
    schema_version: GRAPH_SCHEMA_VERSION,
    project_id: projectId,
    created_at: options.createdAt ?? new Date(0).toISOString(),
    parent_id: options.parentId,
    source_hash: options.sourceHash ?? 'unknown',
    git: options.git,
    nodes: [...nodes.values()],
    edges: [...edges.values()],
    summary: {
      nodes: 0,
      edges: 0,
      findings: 0,
      evidence: 0,
    },
  });
}

class MemoryGraphStore implements GraphStore {
  private nodes = new Map<string, GraphNode>();
  private edges = new Map<string, GraphEdge>();
  private snapshots = new Map<string, GraphSnapshot>();
  private latestSnapshotId: string | null = null;

  constructor(seed: MemoryGraphStoreSeed = {}) {
    for (const node of seed.nodes ?? []) {
      this.nodes.set(node.id, node);
    }
    for (const edge of seed.edges ?? []) {
      this.edges.set(graphEdgeKey(edge), edge);
    }
    for (const snapshot of seed.snapshots ?? []) {
      this.snapshots.set(snapshot.id, normalizeGraphSnapshot(snapshot));
      this.latestSnapshotId = snapshot.id;
    }
  }

  async open(): Promise<void> {
    return;
  }

  async close(): Promise<void> {
    return;
  }

  async upsertNode(node: GraphNode): Promise<void> {
    this.nodes.set(node.id, node);
  }

  async upsertEdge(edge: GraphEdge): Promise<void> {
    this.edges.set(graphEdgeKey(edge), edge);
  }

  async getNode(id: string): Promise<GraphNode | null> {
    return this.nodes.get(id) ?? null;
  }

  async queryNodes(query: GraphNodeQuery): Promise<GraphNode[]> {
    const ids = query.ids ? new Set(query.ids) : null;
    const types = query.types ?? (query.type ? [query.type] : null);
    return sortGraphNodes(
      [...this.nodes.values()].filter((node) => {
        if (ids && !ids.has(node.id)) return false;
        if (types && !types.includes(node.type)) return false;
        if (!graphNodePayloadMatches(node, query)) return false;
        return true;
      }),
    );
  }

  async queryEdges(query: GraphEdgeQuery): Promise<GraphEdge[]> {
    return sortGraphEdges(
      [...this.edges.values()].filter((edge) => {
        if (query.src && edge.src !== query.src) return false;
        if (query.dst && edge.dst !== query.dst) return false;
        if (!relationMatches(edge, query)) return false;
        return true;
      }),
    );
  }

  async traverse(query: GraphTraverseQuery): Promise<GraphSubgraph> {
    const direction = query.direction ?? 'out';
    const depth = Math.max(0, query.depth ?? 1);
    const startIds = Array.isArray(query.from) ? query.from : [query.from];
    const seenNodeIds = new Set(startIds);
    const seenEdgeKeys = new Set<string>();
    let frontier = startIds;

    for (let level = 0; level < depth; level += 1) {
      const nextFrontier: string[] = [];
      for (const nodeId of frontier) {
        const candidates = [...this.edges.values()].filter((edge) => {
          if (!relationMatches(edge, query)) return false;
          if (direction === 'out') return edge.src === nodeId;
          if (direction === 'in') return edge.dst === nodeId;
          return edge.src === nodeId || edge.dst === nodeId;
        });

        for (const edge of candidates) {
          const key = graphEdgeKey(edge);
          seenEdgeKeys.add(key);
          const nextNodeId = edge.src === nodeId ? edge.dst : edge.src;
          if (!seenNodeIds.has(nextNodeId)) {
            seenNodeIds.add(nextNodeId);
            nextFrontier.push(nextNodeId);
          }
        }
      }
      frontier = nextFrontier;
      if (!frontier.length) break;
    }

    return {
      nodes: sortGraphNodes(
        [...seenNodeIds]
          .map((id) => this.nodes.get(id))
          .filter((node): node is GraphNode => !!node),
      ),
      edges: sortGraphEdges(
        [...seenEdgeKeys]
          .map((key) => this.edges.get(key))
          .filter((edge): edge is GraphEdge => !!edge),
      ),
    };
  }

  async writeSnapshot(snapshot: GraphSnapshot): Promise<void> {
    const normalized = normalizeGraphSnapshot(snapshot);
    this.snapshots.set(normalized.id, normalized);
    this.latestSnapshotId = normalized.id;
  }

  async readSnapshot(id?: string): Promise<GraphSnapshot | null> {
    const snapshotId = id ?? this.latestSnapshotId;
    return snapshotId ? (this.snapshots.get(snapshotId) ?? null) : null;
  }
}

export function createMemoryGraphStore(seed?: MemoryGraphStoreSeed): GraphStore {
  return new MemoryGraphStore(seed);
}
