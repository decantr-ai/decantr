export type VerificationGraphAnchorConfidence = 'exact' | 'inferred' | 'fallback';

export interface GraphAnchorNode {
  id: string;
  type: string;
  payload?: unknown;
}

export interface GraphAnchorEdge {
  src: string;
  dst: string;
  relation: string;
  payload?: unknown;
  idx?: number;
}

export interface GraphAnchorSnapshot {
  id: string;
  project_id: string;
  source_hash: string;
  nodes: GraphAnchorNode[];
  edges: GraphAnchorEdge[];
}

export interface VerificationGraphAnchor {
  snapshot_id: string;
  source_hash: string;
  node_id: string;
  node_type: string;
  route?: string;
  confidence: VerificationGraphAnchorConfidence;
  reason: string;
}

export interface GraphAnchorFindingInput {
  id: string;
  category: string;
  message: string;
  evidence?: string[];
  target?: string;
  file?: string;
  rule?: string;
}

function payloadRecord(payload: unknown): Record<string, unknown> {
  return payload && typeof payload === 'object' && !Array.isArray(payload)
    ? (payload as Record<string, unknown>)
    : {};
}

function payloadString(payload: unknown, key: string): string | undefined {
  const value = payloadRecord(payload)[key];
  return typeof value === 'string' ? value : undefined;
}

function slug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.:/-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizedHaystack(finding: GraphAnchorFindingInput): string {
  return [
    finding.id,
    finding.category,
    finding.message,
    finding.target,
    finding.file,
    finding.rule,
    ...(finding.evidence ?? []),
  ]
    .filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
    .join('\n')
    .toLowerCase();
}

function graphAnchor(
  snapshot: GraphAnchorSnapshot,
  node: GraphAnchorNode,
  confidence: VerificationGraphAnchorConfidence,
  reason: string,
  route?: string,
): VerificationGraphAnchor {
  const anchor: VerificationGraphAnchor = {
    snapshot_id: snapshot.id,
    source_hash: snapshot.source_hash,
    node_id: node.id,
    node_type: node.type,
    confidence,
    reason,
  };
  if (route) anchor.route = route;
  return anchor;
}

function routeForNode(
  snapshot: GraphAnchorSnapshot,
  nodeId: string,
  visited = new Set<string>(),
): string | undefined {
  if (visited.has(nodeId)) return undefined;
  visited.add(nodeId);

  if (nodeId.startsWith('rt:')) {
    const route = snapshot.nodes.find((node) => node.id === nodeId);
    return payloadString(route?.payload, 'path') ?? nodeId.replace(/^rt:/, '');
  }

  const sourceNode = snapshot.nodes.find(
    (node) => node.id === nodeId && node.type === 'SourceArtifact',
  );
  if (sourceNode) {
    const sourceEdges = snapshot.edges.filter(
      (edge) => edge.relation === 'NODE_DERIVED_FROM_SOURCE' && edge.dst === nodeId,
    );
    const sortedSourceEdges = [
      ...sourceEdges.filter((edge) => edge.src.startsWith('rt:')),
      ...sourceEdges.filter((edge) => !edge.src.startsWith('rt:')),
    ];
    for (const edge of sortedSourceEdges) {
      const route = routeForNode(snapshot, edge.src, visited);
      if (route) return route;
    }
    return undefined;
  }

  const pageId =
    snapshot.nodes.find((node) => node.id === nodeId && node.type === 'Page')?.id ??
    snapshot.edges.find((edge) => edge.relation === 'PAGE_COMPOSES_PATTERN' && edge.dst === nodeId)
      ?.src ??
    snapshot.edges.find((edge) => edge.relation === 'PAGE_USES_SHELL' && edge.dst === nodeId)?.src;
  if (!pageId) return undefined;
  const routeEdge = snapshot.edges.find(
    (edge) => edge.relation === 'PAGE_ROUTED_AT_ROUTE' && edge.src === pageId,
  );
  if (!routeEdge) return undefined;
  const route = snapshot.nodes.find((node) => node.id === routeEdge.dst);
  return payloadString(route?.payload, 'path') ?? routeEdge.dst.replace(/^rt:/, '');
}

function findProjectNode(snapshot: GraphAnchorSnapshot): GraphAnchorNode | undefined {
  return (
    snapshot.nodes.find((node) => node.id === snapshot.project_id) ??
    snapshot.nodes.find((node) => node.type === 'Project')
  );
}

function findLocalRuleNode(snapshot: GraphAnchorSnapshot, finding: GraphAnchorFindingInput) {
  const candidates = [finding.rule, finding.target, finding.id]
    .filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
    .map(slug);
  if (candidates.length === 0) return null;

  return (
    snapshot.nodes.find((node) => {
      if (node.type !== 'LocalRule') return false;
      const payloadId = payloadString(node.payload, 'id');
      const ids = [node.id.replace(/^rule:/, ''), payloadId ? slug(payloadId) : null].filter(
        (entry): entry is string => Boolean(entry),
      );
      return ids.some((id) => candidates.some((candidate) => id === candidate));
    }) ?? null
  );
}

function findStyleBridgeNode(snapshot: GraphAnchorSnapshot, finding: GraphAnchorFindingInput) {
  const haystack = normalizedHaystack(finding);
  const candidates = [finding.rule, finding.target, finding.id, ...(finding.evidence ?? [])]
    .filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
    .map(slug);
  const styleBridgeNodes = snapshot.nodes.filter((node) => node.type === 'StyleBridge');
  if (styleBridgeNodes.length === 0) return null;

  return (
    styleBridgeNodes.find((node) => {
      const payloadId = payloadString(node.payload, 'id');
      const payloadLabel = payloadString(node.payload, 'label');
      const ids = [
        node.id.replace(/^bridge:/, ''),
        payloadId ? slug(payloadId) : null,
        payloadLabel ? slug(payloadLabel) : null,
      ].filter((entry): entry is string => Boolean(entry));
      return ids.some(
        (id) =>
          candidates.some((candidate) => id === candidate || candidate.includes(id)) ||
          haystack.includes(id.toLowerCase()),
      );
    }) ??
    (haystack.includes('style-bridge') || haystack.includes('style bridge')
      ? (styleBridgeNodes[0] ?? null)
      : null)
  );
}

function findRouteNode(snapshot: GraphAnchorSnapshot, finding: GraphAnchorFindingInput) {
  const haystack = normalizedHaystack(finding);
  const exactTarget = finding.target?.startsWith('/') ? finding.target : null;
  const routes = snapshot.nodes
    .filter((node) => node.type === 'Route')
    .map((node) => ({
      node,
      path: payloadString(node.payload, 'path') ?? node.id.replace(/^rt:/, ''),
    }))
    .sort((a, b) => b.path.length - a.path.length);

  return (
    routes.find((route) => route.path === exactTarget)?.node ??
    routes.find((route) => route.path !== '/' && haystack.includes(route.path.toLowerCase()))
      ?.node ??
    null
  );
}

function findPageNode(snapshot: GraphAnchorSnapshot, finding: GraphAnchorFindingInput) {
  const candidates = [finding.target, finding.id]
    .filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
    .map(slug);
  if (candidates.length === 0) return null;

  return (
    snapshot.nodes.find((node) => {
      if (node.type !== 'Page') return false;
      const payloadId = payloadString(node.payload, 'id');
      const payloadSection = payloadString(node.payload, 'section');
      const ids = [
        node.id.replace(/^pg:/, ''),
        payloadId ? slug(payloadId) : null,
        payloadId && payloadSection ? slug(`${payloadSection}:${payloadId}`) : null,
      ].filter((entry): entry is string => Boolean(entry));
      return ids.some((id) => candidates.some((candidate) => id === candidate));
    }) ?? null
  );
}

function findPatternNode(snapshot: GraphAnchorSnapshot, finding: GraphAnchorFindingInput) {
  const haystack = normalizedHaystack(finding);
  return (
    snapshot.nodes.find((node) => {
      if (node.type !== 'Pattern') return false;
      const payloadId = payloadString(node.payload, 'id');
      return [node.id.replace(/^pat:/, ''), payloadId]
        .filter((entry): entry is string => Boolean(entry))
        .some((id) => haystack.includes(id.toLowerCase()));
    }) ?? null
  );
}

function findSourceArtifactNode(snapshot: GraphAnchorSnapshot, finding: GraphAnchorFindingInput) {
  const haystack = normalizedHaystack(finding);
  return (
    snapshot.nodes.find((node) => {
      if (node.type !== 'SourceArtifact') return false;
      const path = payloadString(node.payload, 'path');
      return path ? haystack.includes(path.toLowerCase()) : false;
    }) ?? null
  );
}

function normalizePath(value: string | undefined): string | null {
  return value ? value.replace(/\\/g, '/').toLowerCase() : null;
}

function findExactSourceArtifactNode(
  snapshot: GraphAnchorSnapshot,
  finding: GraphAnchorFindingInput,
) {
  const findingFile = normalizePath(finding.file);
  if (!findingFile) return null;
  return (
    snapshot.nodes.find((node) => {
      if (node.type !== 'SourceArtifact') return false;
      return normalizePath(payloadString(node.payload, 'path')) === findingFile;
    }) ?? null
  );
}

export function resolveGraphAnchorForFinding(
  snapshot: GraphAnchorSnapshot | null | undefined,
  finding: GraphAnchorFindingInput,
): VerificationGraphAnchor | undefined {
  if (!snapshot) return undefined;

  const localRule = findLocalRuleNode(snapshot, finding);
  if (localRule) {
    return graphAnchor(snapshot, localRule, 'exact', 'finding rule matched a LocalRule node');
  }

  const exactSourceArtifact = findExactSourceArtifactNode(snapshot, finding);
  if (exactSourceArtifact) {
    return graphAnchor(
      snapshot,
      exactSourceArtifact,
      'exact',
      'finding file matched a SourceArtifact node',
      routeForNode(snapshot, exactSourceArtifact.id),
    );
  }

  const styleBridge = findStyleBridgeNode(snapshot, finding);
  if (styleBridge) {
    return graphAnchor(snapshot, styleBridge, 'exact', 'finding matched a StyleBridge node');
  }

  const route = findRouteNode(snapshot, finding);
  if (route) {
    return graphAnchor(
      snapshot,
      route,
      finding.target === payloadString(route.payload, 'path') ? 'exact' : 'inferred',
      'finding text matched a Route node',
      payloadString(route.payload, 'path') ?? route.id.replace(/^rt:/, ''),
    );
  }

  const page = findPageNode(snapshot, finding);
  if (page) {
    return graphAnchor(
      snapshot,
      page,
      'exact',
      'finding target matched a Page node',
      routeForNode(snapshot, page.id),
    );
  }

  const pattern = findPatternNode(snapshot, finding);
  if (pattern) {
    return graphAnchor(
      snapshot,
      pattern,
      'inferred',
      'finding text matched a Pattern node',
      routeForNode(snapshot, pattern.id),
    );
  }

  const sourceArtifact = findSourceArtifactNode(snapshot, finding);
  if (sourceArtifact) {
    return graphAnchor(
      snapshot,
      sourceArtifact,
      'inferred',
      'finding evidence matched a SourceArtifact node',
      routeForNode(snapshot, sourceArtifact.id),
    );
  }

  const project = findProjectNode(snapshot);
  return project
    ? graphAnchor(
        snapshot,
        project,
        'fallback',
        'finding is project-level or no specific graph node matched',
      )
    : undefined;
}

export function anchorFindingsToGraph<TFinding extends GraphAnchorFindingInput>(
  snapshot: GraphAnchorSnapshot | null | undefined,
  findings: TFinding[],
): Array<TFinding & { graph?: VerificationGraphAnchor }> {
  if (!snapshot) return findings;
  return findings.map((finding) => {
    const graph = resolveGraphAnchorForFinding(snapshot, finding);
    return graph ? { ...finding, graph } : finding;
  });
}
