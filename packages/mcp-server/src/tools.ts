import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import {
  type ArchetypeRole,
  buildContentRef,
  type ComposeEntry,
  type ContentIntelligenceSource,
  getContentRecord,
  isContentIntelligenceSource,
  type Pattern,
  patternToDiscoveryCandidate,
  rankPatternCandidates,
  resolvePatternPreset,
} from '@decantr/content';
import {
  buildChangedFileGraphImpact,
  buildGraphImpactContext,
  buildGraphRouteContext,
  createMemoryGraphStore,
  diffGraphSnapshots,
  GRAPH_NODE_TYPES,
  GRAPH_RELATIONS,
  type GraphDiff,
  type GraphEdge,
  type GraphManifest,
  type GraphNode,
  type GraphNodeType,
  type GraphRelation,
  type GraphSnapshot,
  type GraphTraverseDirection,
  graphPayloadString,
  sortGraphEdges,
  sortGraphNodes,
  summarizeGraphDiff,
} from '@decantr/core';
import type { BlueprintPage, EssenceFile, EssenceV4, GuardViolation } from '@decantr/essence-spec';
import { evaluateGuard, isV4, validateEssence } from '@decantr/essence-spec';
import {
  anchorFindingsToGraph,
  buildProjectHealthRepairPlan,
  type ContractAssertion,
  type CreateTaskCapsuleV1Input,
  canonicalJsonStringify,
  canonicalUtf8Bytes,
  createAuthorityResolution,
  createEvidenceTier,
  createLoopReadiness,
  createProjectAdoptionTruthV1,
  createStableProjectIdentityV1,
  createTaskCapsuleV1,
  deriveVerificationDiagnostic,
  discoverProject,
  type EvidenceBundle,
  evaluateDiscoveryReadiness,
  KNOWN_VERIFICATION_DIAGNOSTICS,
  LOOP_READINESS_V2_SCHEMA_URL,
  PROJECT_HEALTH_REPORT_V2_SCHEMA_URL,
  type ProjectAuditReport,
  type ProjectDiscovery,
  type ProjectHealthFinding,
  type ProjectHealthFindingSource,
  type ProjectHealthReport,
  type ProjectHealthStatus,
  resolveUISurfaceTaskContext,
  TASK_CAPSULE_TOKEN_ESTIMATE_BYTES_PER_TOKEN,
  type TaskCapsuleAuthorityLane,
  type TaskCapsuleFindingV1,
  type TaskCapsuleOfficialGuidanceV1,
  type TaskCapsuleReadTargetV1,
  type UISurfaceTaskContextV1,
  type VerificationFinding,
  type VerificationRepairAction,
  type VerificationSeverity,
  WORKSPACE_HEALTH_REPORT_V2_SCHEMA_URL,
} from '@decantr/verifier';
import type { DriftLogEntry } from './helpers.js';
import {
  fuzzyScore,
  getAPIClient,
  getPublicAPIClient,
  mutateEssenceFile,
  readDriftLog,
  readEssenceFile,
  resolveWorkspacePath,
  validateStringArg,
  writeDriftLog,
} from './helpers.js';

// ── Inline topology derivation (lightweight version of cli/scaffold.ts) ──

interface ZoneInput {
  archetypeId: string;
  role: ArchetypeRole;
  shell: string;
  features: string[];
  description: string;
}

interface ComposedZone {
  role: ArchetypeRole;
  archetypes: string[];
  shell: string;
  features: string[];
  descriptions: string[];
}

interface ZoneTransition {
  from: string;
  to: string;
  type: string;
  trigger: string;
}

interface RegistryPatternListItem {
  slug?: string;
  name?: string;
  description?: string;
}

interface PackManifestEntry {
  id: string;
  markdown: string;
  json: string;
}

interface PackManifest {
  $schema?: string;
  version: string;
  generatedAt: string;
  scaffold: PackManifestEntry | null;
  review?: PackManifestEntry | null;
  sections: Array<PackManifestEntry & { pageIds: string[] }>;
  pages: Array<PackManifestEntry & { sectionId: string | null; sectionRole: string | null }>;
  mutations?: Array<PackManifestEntry & { mutationType: string }>;
}

interface LocalContextPack {
  markdownPath: string | null;
  jsonPath: string | null;
  markdown: string | null;
  json: unknown | null;
}

function isContainedPath(parent: string, candidate: string): boolean {
  const relativePath = relative(parent, candidate).replace(/\\/g, '/');
  return (
    relativePath.length > 0 &&
    relativePath !== '..' &&
    !relativePath.startsWith('../') &&
    !isAbsolute(relativePath)
  );
}

function existingContextFile(
  contextDir: string,
  reference: string | null | undefined,
): string | null {
  if (!reference || isAbsolute(reference)) return null;
  const contextRoot = resolve(contextDir);
  const candidate = resolve(contextRoot, reference);
  if (!isContainedPath(contextRoot, candidate)) return null;

  try {
    if (!statSync(candidate).isFile()) return null;
    const realContextRoot = realpathSync(contextRoot);
    const realCandidate = realpathSync(candidate);
    return isContainedPath(realContextRoot, realCandidate) ? candidate : null;
  } catch {
    return null;
  }
}

function readLocalContextPack(
  contextDir: string,
  entry: PackManifestEntry | null | undefined,
): LocalContextPack {
  let markdownPath = existingContextFile(contextDir, entry?.markdown);
  let markdown: string | null = null;
  if (markdownPath) {
    try {
      markdown = readFileSync(markdownPath, 'utf-8');
    } catch {
      markdownPath = null;
    }
  }
  let jsonPath = existingContextFile(contextDir, entry?.json);
  const json = jsonPath ? readJsonIfExists<unknown>(jsonPath) : null;
  if (json === null) jsonPath = null;
  return {
    markdownPath,
    jsonPath,
    markdown,
    json,
  };
}

function readJsonIfExists<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function graphProjectRoot(args: Record<string, unknown>): string {
  const projectPath = args.project_path;
  return typeof projectPath === 'string' && projectPath.trim()
    ? resolveWorkspacePath(projectPath)
    : process.cwd();
}

function graphArtifactPath(projectRoot: string, file: string): string {
  return join(projectRoot, '.decantr', 'graph', file);
}

function graphSnapshotHistoryFileName(snapshotId: string): string {
  return `${snapshotId.replace(/[^a-zA-Z0-9_.-]+/g, '-')}.json`;
}

function graphSnapshotHistoryPath(projectRoot: string, snapshotId: string): string {
  return graphArtifactPath(
    projectRoot,
    join('snapshots', graphSnapshotHistoryFileName(snapshotId)),
  );
}

function graphSnapshotHistoryCount(projectRoot: string): number {
  const snapshotsDir = graphArtifactPath(projectRoot, 'snapshots');
  if (!existsSync(snapshotsDir)) return 0;
  try {
    return readdirSync(snapshotsDir).filter((entry) => entry.endsWith('.json')).length;
  } catch {
    return 0;
  }
}

function readGraphSnapshotHistory(projectRoot: string, limit = 20) {
  const snapshotsDir = graphArtifactPath(projectRoot, 'snapshots');
  if (!existsSync(snapshotsDir)) return [];
  try {
    return readdirSync(snapshotsDir)
      .filter((entry) => entry.endsWith('.json'))
      .map((entry) => {
        const absolutePath = join(snapshotsDir, entry);
        const snapshot = readJsonIfExists<GraphSnapshot>(absolutePath);
        if (!snapshot) return null;
        return {
          id: snapshot.id,
          path: displayWorkspacePath(absolutePath),
          created_at: snapshot.created_at,
          source_hash: snapshot.source_hash,
          parent_id: snapshot.parent_id ?? null,
          summary: snapshot.summary,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
      .sort((a, b) => b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id))
      .slice(0, Math.max(1, Math.min(100, limit)));
  } catch {
    return [];
  }
}

function readGraphSnapshotById(
  projectRoot: string,
  snapshotId: string | undefined,
): { snapshot: GraphSnapshot | null; path: string } {
  const currentPath = graphArtifactPath(projectRoot, 'graph.snapshot.json');
  const currentSnapshot = readJsonIfExists<GraphSnapshot>(currentPath);
  if (!snapshotId || snapshotId === 'current' || currentSnapshot?.id === snapshotId) {
    return { snapshot: currentSnapshot, path: currentPath };
  }
  const path = graphSnapshotHistoryPath(projectRoot, snapshotId);
  return { snapshot: readJsonIfExists<GraphSnapshot>(path), path };
}

function readMcpGraphSnapshot(projectRoot: string): GraphSnapshot | null {
  return readJsonIfExists<GraphSnapshot>(graphArtifactPath(projectRoot, 'graph.snapshot.json'));
}

function mcpAnchorHealthFindings(
  projectRoot: string,
  findings: ProjectHealthFinding[],
): ProjectHealthFinding[] {
  return anchorFindingsToGraph(readMcpGraphSnapshot(projectRoot), findings);
}

function displayWorkspacePath(path: string): string {
  const rel = relative(process.cwd(), path).replace(/\\/g, '/');
  return rel && !rel.startsWith('..') ? rel : path;
}

function displayProjectFile(projectRoot: string, path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^[a-z]+:\/\//i.test(path)) return path;
  if (isAbsolute(path)) return displayWorkspacePath(path);
  return displayWorkspacePath(join(projectRoot, path));
}

function mcpDiscoverySummary(
  projectRoot: string,
  discovery: ProjectDiscovery = discoverProject(projectRoot),
) {
  return {
    schema_version: 'discovery.v1',
    project_path: discovery.workspace.projectPath,
    workspace_scope: discovery.workspace.scope,
    project: {
      framework: discovery.project.framework,
      framework_version: discovery.project.frameworkVersion,
      package_manager: discovery.project.packageManager,
      primary_language: discovery.project.primaryLanguage,
      has_typescript: discovery.project.hasTypeScript,
      has_tailwind: discovery.project.hasTailwind,
      has_decantr: discovery.project.hasDecantr,
      package_name: discovery.project.packageName,
      evidence: discovery.project.evidence,
    },
    routes: {
      strategy: discovery.routes.strategy,
      route_signal_count: discovery.routes.routeSignalCount,
      taskable_route_count: discovery.routes.taskableRouteCount,
      route_excluded_source_count: discovery.routes.excludedSourceCount,
      confidence: discovery.routes.confidence,
      authority: discovery.routes.authority,
      completeness: discovery.routes.completeness,
      authority_files: discovery.routes.authorityFiles,
      evidence: discovery.routes.evidence,
      readiness: evaluateDiscoveryReadiness(discovery),
      taskable_routes: discovery.routes.taskableRoutes.slice(0, 20).map((route) => ({
        path: route.path,
        file: route.file,
        source: route.source,
        confidence: route.confidence,
      })),
      signals: discovery.routes.routeSignals.slice(0, 20).map((signal) => ({
        path: signal.path,
        file: signal.file,
        kind: signal.kind,
        taskable: signal.taskable,
        confidence: signal.confidence,
      })),
    },
    components: {
      component_count: discovery.components.componentCount,
      page_count: discovery.components.pageCount,
      confidence: discovery.components.confidence,
      directories: discovery.components.directories,
      evidence: discovery.components.evidence,
      limitations: discovery.components.limitations,
    },
    styling: {
      approach: discovery.styling.approach,
      confidence: discovery.styling.confidence,
      evidence: discovery.styling.evidence,
      limitations: discovery.styling.limitations,
      config_file: discovery.styling.configFile,
      css_variable_count: discovery.styling.cssVariableCount,
      color_token_count: discovery.styling.colorTokenCount,
      dark_mode: discovery.styling.darkMode,
      theme_signals: discovery.styling.themeSignals,
    },
    assistant: {
      rule_files: discovery.assistant.ruleFiles,
    },
    confidence: discovery.confidence,
    limitations: discovery.limitations,
  };
}

function mcpUISurfaceTaskContext(projectRoot: string, context: UISurfaceTaskContextV1) {
  const mapSurface = (surface: UISurfaceTaskContextV1['surface']) =>
    surface
      ? {
          ...surface,
          files: surface.files.map((file) => mcpTaskWorkspacePath(projectRoot, file)),
        }
      : null;
  const readTargets = context.read.map((target) => ({
    ...target,
    file: mcpTaskWorkspacePath(projectRoot, target.file),
  }));

  return {
    schemaVersion: context.schemaVersion,
    target: context.target,
    status: context.status,
    surface: mapSurface(context.surface),
    candidates: context.candidates.map((candidate) => mapSurface(candidate)),
    read: readTargets.map((target) => target.file),
    readTargets,
    authority: {
      axes: context.axes,
      reasons: context.reasons,
    },
  };
}

function mcpTaskDiscoverySummary(projectRoot: string, discovery: ProjectDiscovery) {
  const summary = mcpDiscoverySummary(projectRoot, discovery);
  return {
    schema_version: summary.schema_version,
    project_path: summary.project_path,
    workspace_scope: summary.workspace_scope,
    project: {
      framework: summary.project.framework,
      framework_version: summary.project.framework_version,
      package_manager: summary.project.package_manager,
      primary_language: summary.project.primary_language,
      has_typescript: summary.project.has_typescript,
      has_tailwind: summary.project.has_tailwind,
      has_decantr: summary.project.has_decantr,
      package_name: summary.project.package_name,
    },
    routes: {
      strategy: summary.routes.strategy,
      route_signal_count: summary.routes.route_signal_count,
      taskable_route_count: summary.routes.taskable_route_count,
      confidence: summary.routes.confidence,
      authority: summary.routes.authority,
      completeness: summary.routes.completeness,
      authority_files: summary.routes.authority_files,
      readiness: summary.routes.readiness,
    },
    components: {
      component_count: summary.components.component_count,
      page_count: summary.components.page_count,
      confidence: summary.components.confidence,
    },
    styling: {
      approach: summary.styling.approach,
      confidence: summary.styling.confidence,
      config_file: summary.styling.config_file,
      dark_mode: summary.styling.dark_mode,
    },
    confidence: summary.confidence,
    limitations: summary.limitations.slice(0, 6),
  };
}

function graphAvailableRoutes(snapshot: GraphSnapshot): string[] {
  return snapshot.nodes
    .filter((node) => node.type === 'Route')
    .map((node) => graphPayloadString(node.payload, 'path') ?? node.id.replace(/^rt:/, ''))
    .sort();
}

function graphProjectRelativePath(projectRoot: string, value: string | undefined): string | null {
  if (!value) return null;
  const absolutePath = isAbsolute(value) ? value : join(projectRoot, value);
  const relativePath = relative(projectRoot, absolutePath).replace(/\\/g, '/');
  if (!relativePath || relativePath.startsWith('..') || isAbsolute(relativePath)) {
    return null;
  }
  return relativePath;
}

function graphSourceNodeIdForFile(
  projectRoot: string,
  snapshot: GraphSnapshot,
  filePath: string | undefined,
): string | null {
  if (!filePath) return null;
  const trimmed = filePath.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('src:') && snapshot.nodes.some((node) => node.id === trimmed)) {
    return trimmed;
  }

  const candidates = new Set<string>();
  const projectRelative = graphProjectRelativePath(projectRoot, trimmed);
  if (projectRelative) candidates.add(projectRelative);
  try {
    const workspaceRelative = graphProjectRelativePath(projectRoot, resolveWorkspacePath(trimmed));
    if (workspaceRelative) candidates.add(workspaceRelative);
  } catch {
    // Workspace-relative resolution is a convenience; project-relative matching is authoritative.
  }

  for (const candidate of candidates) {
    const nodeId = `src:${candidate}`;
    if (snapshot.nodes.some((node) => node.id === nodeId)) return nodeId;
  }

  return (
    snapshot.nodes.find((node) => {
      if (node.type !== 'SourceArtifact') return false;
      const path = graphPayloadString(node.payload, 'path');
      return Boolean(path && (path === trimmed || candidates.has(path)));
    })?.id ?? null
  );
}

function graphAvailableSourceArtifacts(snapshot: GraphSnapshot) {
  return snapshot.nodes
    .filter((node) => node.type === 'SourceArtifact')
    .map((node) => ({
      id: node.id,
      path: graphPayloadString(node.payload, 'path') ?? node.id.replace(/^src:/, ''),
      kind: graphPayloadString(node.payload, 'kind') ?? null,
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

function readProjectEssence(projectRoot: string): EssenceFile | null {
  return readJsonIfExists<EssenceFile>(join(projectRoot, 'decantr.essence.json'));
}

function readProjectPackManifest(projectRoot: string): PackManifest | null {
  return readJsonIfExists<PackManifest>(
    join(projectRoot, '.decantr', 'context', 'pack-manifest.json'),
  );
}

function mcpHashFile(path: string): string | null {
  if (!existsSync(path)) return null;
  return `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`;
}

function mcpStableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => mcpStableJson(item)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .filter((key) => record[key] !== undefined)
      .map((key) => `${JSON.stringify(key)}:${mcpStableJson(record[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function mcpHashJson(value: unknown): string {
  return `sha256:${createHash('sha256').update(mcpStableJson(value)).digest('hex')}`;
}

function mcpVisualManifestSourceHash(path: string): string | null {
  const manifest = readJsonIfExists<{
    version?: number;
    localOnly?: boolean;
    baseUrl?: string | null;
    routes?: Array<{
      route?: string;
      url?: string;
      screenshot?: string | null;
      screenshotHash?: string | null;
      status?: string;
      error?: string;
    }>;
  }>(path);
  if (!manifest) return null;
  return mcpHashJson({
    version: manifest.version,
    localOnly: manifest.localOnly,
    baseUrl: manifest.baseUrl ?? null,
    routes: (manifest.routes ?? []).map((route) => ({
      route: route.route,
      url: route.url,
      screenshot: route.screenshot,
      screenshotHash: route.screenshotHash ?? null,
      status: route.status,
      error: route.error,
    })),
  });
}

function mcpStableFindingGraphAnchor(finding: {
  graph?: {
    node_id?: string;
    node_type?: string;
    route?: string;
    confidence?: string;
    reason?: string;
  };
}) {
  if (!finding.graph) return undefined;
  return {
    node_id: finding.graph.node_id,
    node_type: finding.graph.node_type,
    route: finding.graph.route,
    confidence: finding.graph.confidence,
    reason: finding.graph.reason,
  };
}

function mcpEvidenceBundleSourceHash(path: string): string | null {
  const bundle = readJsonIfExists<{
    health?: {
      status?: string;
      score?: number;
      errorCount?: number;
      warnCount?: number;
      infoCount?: number;
      findingCount?: number;
    };
    provenance?: Record<
      string,
      { path?: string; present?: boolean; hash?: string | null; generatedAt?: string | null }
    >;
    findings?: Array<{
      id?: string;
      code?: string;
      source?: string;
      category?: string;
      severity?: string;
      message?: string;
      target?: string;
      rule?: string;
      suggestedFix?: string;
      graph?: {
        node_id?: string;
        node_type?: string;
        route?: string;
        confidence?: string;
        reason?: string;
      };
      repair?: { id?: string };
      repairPlan?: {
        id?: string;
        actions?: unknown[];
        readTargets?: string[];
        commands?: string[];
      };
      evidence?: string[];
      commands?: string[];
    }>;
  }>(path);
  if (!bundle) return null;
  return mcpHashJson({
    health: bundle.health
      ? {
          status: bundle.health.status,
          score: bundle.health.score,
          errorCount: bundle.health.errorCount,
          warnCount: bundle.health.warnCount,
          infoCount: bundle.health.infoCount,
          findingCount: bundle.health.findingCount,
        }
      : null,
    provenance: Object.entries(bundle.provenance ?? {})
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => ({
        key,
        path: entry.path,
        present: entry.present,
        hash: entry.hash ?? null,
      })),
    findings: (bundle.findings ?? []).map((finding) => ({
      id: finding.id,
      code: finding.code,
      source: finding.source,
      category: finding.category,
      severity: finding.severity,
      message: finding.message,
      target: finding.target,
      rule: finding.rule,
      suggestedFix: finding.suggestedFix,
      graph: mcpStableFindingGraphAnchor(finding),
      repair: finding.repair?.id,
      repairPlan: finding.repairPlan
        ? {
            id: finding.repairPlan.id,
            actions: finding.repairPlan.actions,
            readTargets: finding.repairPlan.readTargets,
            commands: finding.repairPlan.commands,
          }
        : undefined,
      evidence: finding.evidence,
      commands: finding.commands,
    })),
  });
}

function mcpAnalysisSourceHash(path: string): string | null {
  const analysis = readJsonIfExists<{
    project?: {
      framework?: string;
      frameworkVersion?: string | null;
      packageManager?: string;
      hasTypeScript?: boolean;
      hasTailwind?: boolean;
      projectScope?: string;
    };
    routes?: {
      strategy?: string;
      routes?: Array<{ path?: string; file?: string; hasLayout?: boolean }>;
    };
    styling?: {
      approach?: string;
      configFile?: string | null;
      darkMode?: boolean;
      cssVariables?: string[];
    };
    layout?: { shellPattern?: string };
    features?: { detected?: string[] };
  }>(path);
  if (!analysis) return null;
  return mcpHashJson({
    project: {
      framework: analysis.project?.framework,
      frameworkVersion: analysis.project?.frameworkVersion,
      packageManager: analysis.project?.packageManager,
      hasTypeScript: analysis.project?.hasTypeScript,
      hasTailwind: analysis.project?.hasTailwind,
      projectScope: analysis.project?.projectScope,
    },
    routes: {
      strategy: analysis.routes?.strategy,
      routes: (analysis.routes?.routes ?? []).map((route) => ({
        path: route.path,
        file: route.file,
        hasLayout: route.hasLayout,
      })),
    },
    styling: {
      approach: analysis.styling?.approach,
      configFile: analysis.styling?.configFile,
      darkMode: analysis.styling?.darkMode,
      cssVariables: analysis.styling?.cssVariables,
    },
    layout: {
      shellPattern: analysis.layout?.shellPattern,
    },
    features: {
      detected: analysis.features?.detected,
    },
  });
}

function mcpHealthBaselineDiffSourceHash(path: string): string | null {
  const diff = readJsonIfExists<{
    savedAt?: string | null;
    statusChanged?: boolean;
    scoreDelta?: number | null;
    addedFindings?: string[];
    resolvedFindings?: string[];
    changedFiles?: string[];
    changedRoutes?: string[];
    changedScreenshots?: string[];
    contractDrift?: string[];
  }>(path);
  if (!diff) return null;
  return mcpHashJson({
    savedAt: diff.savedAt ?? null,
    statusChanged: diff.statusChanged ?? false,
    scoreDelta: diff.scoreDelta ?? null,
    addedFindings: diff.addedFindings ?? [],
    resolvedFindings: diff.resolvedFindings ?? [],
    changedFiles: diff.changedFiles ?? [],
    changedRoutes: diff.changedRoutes ?? [],
    changedScreenshots: diff.changedScreenshots ?? [],
    contractDrift: diff.contractDrift ?? [],
  });
}

function mcpHashGraphSource(
  projectRoot: string,
  source: GraphManifest['sources'][number],
): string | null {
  if (!source.path) return null;
  const path = join(projectRoot, String(source.path));
  if (source.kind === 'brownfield-analysis') return mcpAnalysisSourceHash(path);
  if (source.kind === 'health-baseline-diff') return mcpHealthBaselineDiffSourceHash(path);
  if (source.kind === 'visual-manifest') return mcpVisualManifestSourceHash(path);
  if (source.kind === 'evidence-bundle') return mcpEvidenceBundleSourceHash(path);
  return mcpHashFile(path);
}

function inspectMcpGraphFreshness(projectRoot: string): {
  manifest: GraphManifest | null;
  current: boolean | null;
  staleSources: Array<{ path: string; expected_hash?: string; actual_hash: string | null }>;
} {
  const manifest = readJsonIfExists<GraphManifest>(
    graphArtifactPath(projectRoot, 'graph.manifest.json'),
  );
  if (!manifest) {
    return { manifest: null, current: null, staleSources: [] };
  }
  const staleSources = (manifest.sources ?? [])
    .filter((source) => source.path && source.hash)
    .map((source) => {
      const actualHash = mcpHashGraphSource(projectRoot, source);
      return {
        path: String(source.path),
        expected_hash: source.hash,
        actual_hash: actualHash,
      };
    })
    .filter((source) => source.actual_hash !== source.expected_hash);
  return {
    manifest,
    current: staleSources.length === 0,
    staleSources,
  };
}

function mcpInspectProjectHealthGraph(projectRoot: string): ProjectHealthReport['graph'] {
  const graphDir = join(projectRoot, '.decantr', 'graph');
  const snapshotPath = graphArtifactPath(projectRoot, 'graph.snapshot.json');
  const manifestPath = graphArtifactPath(projectRoot, 'graph.manifest.json');
  const diffPath = graphArtifactPath(projectRoot, 'graph.diff.json');
  const capsulePath = graphArtifactPath(projectRoot, 'contract-capsule.json');
  const graphDirPresent = existsSync(graphDir);
  const projectMetadataPresent = existsSync(join(projectRoot, '.decantr', 'project.json'));
  const snapshot = readJsonIfExists<GraphSnapshot>(snapshotPath);
  const capsule = readJsonIfExists<{
    contract_hash?: string;
    contract_cache_key?: string;
    source_artifact_limit?: number;
    source_artifacts_truncated?: boolean;
    summary?: { source_artifacts?: number };
  }>(capsulePath);
  const freshness = inspectMcpGraphFreshness(projectRoot);
  const requiredArtifactPaths = [snapshotPath, manifestPath, diffPath, capsulePath];
  const missingArtifacts = requiredArtifactPaths
    .filter((path) => !existsSync(path))
    .map((path) => relative(projectRoot, path).replace(/\\/g, '/'));
  const current =
    graphDirPresent || projectMetadataPresent
      ? missingArtifacts.length === 0 && freshness.current === true
      : null;

  return {
    present: graphDirPresent,
    ready: current === true && Boolean(snapshot) && Boolean(capsule),
    current,
    snapshotPresent: existsSync(snapshotPath),
    manifestPresent: existsSync(manifestPath),
    diffPresent: existsSync(diffPath),
    capsulePresent: existsSync(capsulePath),
    snapshotId: snapshot?.id ?? null,
    sourceHash: snapshot?.source_hash ?? null,
    contractHash: capsule?.contract_hash ?? null,
    contractCacheKey: capsule?.contract_cache_key ?? null,
    sourceArtifactCount:
      snapshot?.nodes.filter((node) => node.type === 'SourceArtifact').length ??
      capsule?.summary?.source_artifacts ??
      0,
    capsuleSourceArtifactLimit: capsule?.source_artifact_limit ?? null,
    capsuleSourceArtifactsTruncated: capsule?.source_artifacts_truncated ?? null,
    staleArtifacts:
      current === false
        ? [
            ...missingArtifacts,
            ...freshness.staleSources.map(
              (source) => `${source.path} changed since graph manifest generation`,
            ),
          ]
        : [],
    error: null,
  };
}

const MCP_GRAPH_NODE_TYPES = new Set<string>(GRAPH_NODE_TYPES);
const MCP_GRAPH_RELATIONS = new Set<string>(GRAPH_RELATIONS);
const MCP_GRAPH_DEFAULT_LIMIT = 200;
const MCP_GRAPH_MAX_LIMIT = 500;

function mcpGraphEdgeKey(edge: Pick<GraphEdge, 'src' | 'dst' | 'relation' | 'idx'>): string {
  return [edge.src, edge.relation, edge.dst, String(edge.idx ?? '')].join('\0');
}

function graphToolLimit(args: Record<string, unknown>): number {
  if (typeof args.limit !== 'number' || !Number.isFinite(args.limit)) {
    return MCP_GRAPH_DEFAULT_LIMIT;
  }
  return Math.max(1, Math.min(MCP_GRAPH_MAX_LIMIT, Math.floor(args.limit)));
}

function stringListArg(
  args: Record<string, unknown>,
  key: string,
): { values?: string[]; error?: string } {
  const value = args[key];
  if (value === undefined) return {};
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? { values: [trimmed] } : { values: [] };
  }
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    return { error: `Optional parameter "${key}" must be a string or an array of strings.` };
  }
  return {
    values: value.map((item) => item.trim()).filter(Boolean),
  };
}

function graphNodeTypeArg(
  args: Record<string, unknown>,
  key: string,
): { value?: GraphNodeType; error?: string } {
  const value = args[key];
  if (value === undefined) return {};
  if (typeof value !== 'string' || !MCP_GRAPH_NODE_TYPES.has(value)) {
    return {
      error: `Optional parameter "${key}" must be one of: ${GRAPH_NODE_TYPES.join(', ')}.`,
    };
  }
  return { value: value as GraphNodeType };
}

function graphNodeTypesArg(
  args: Record<string, unknown>,
  key: string,
): { values?: GraphNodeType[]; error?: string } {
  const parsed = stringListArg(args, key);
  if (parsed.error) return { error: parsed.error };
  if (!parsed.values) return {};
  const invalid = parsed.values.find((value) => !MCP_GRAPH_NODE_TYPES.has(value));
  if (invalid) {
    return {
      error: `Optional parameter "${key}" contains invalid node type "${invalid}". Expected one of: ${GRAPH_NODE_TYPES.join(', ')}.`,
    };
  }
  return { values: parsed.values as GraphNodeType[] };
}

function graphRelationArg(
  args: Record<string, unknown>,
  key: string,
): { value?: GraphRelation; error?: string } {
  const value = args[key];
  if (value === undefined) return {};
  if (typeof value !== 'string' || !MCP_GRAPH_RELATIONS.has(value)) {
    return {
      error: `Optional parameter "${key}" must be one of: ${GRAPH_RELATIONS.join(', ')}.`,
    };
  }
  return { value: value as GraphRelation };
}

function graphRelationsArg(
  args: Record<string, unknown>,
  key: string,
): { values?: GraphRelation[]; error?: string } {
  const parsed = stringListArg(args, key);
  if (parsed.error) return { error: parsed.error };
  if (!parsed.values) return {};
  const invalid = parsed.values.find((value) => !MCP_GRAPH_RELATIONS.has(value));
  if (invalid) {
    return {
      error: `Optional parameter "${key}" contains invalid relation "${invalid}". Expected one of: ${GRAPH_RELATIONS.join(', ')}.`,
    };
  }
  return { values: parsed.values as GraphRelation[] };
}

function graphTraverseDirectionArg(args: Record<string, unknown>): {
  value?: GraphTraverseDirection;
  error?: string;
} {
  const value = args.direction;
  if (value === undefined) return {};
  if (value !== 'out' && value !== 'in' && value !== 'both') {
    return { error: 'Optional parameter "direction" must be one of: out, in, both.' };
  }
  return { value };
}

function graphTraverseDepthArg(args: Record<string, unknown>): { value: number; error?: string } {
  const value = args.depth;
  if (value === undefined) return { value: 1 };
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return { value: 1, error: 'Optional parameter "depth" must be a number.' };
  }
  return { value: Math.max(0, Math.min(4, Math.floor(value))) };
}

function dedupeGraphNodes(nodes: GraphNode[]): GraphNode[] {
  return sortGraphNodes([...new Map(nodes.map((node) => [node.id, node])).values()]);
}

function dedupeGraphEdges(edges: GraphEdge[]): GraphEdge[] {
  return sortGraphEdges([...new Map(edges.map((edge) => [mcpGraphEdgeKey(edge), edge])).values()]);
}

function graphPayloadFilterArgs(args: Record<string, unknown>): {
  key?: string;
  value?: string;
  contains?: string;
  error?: string;
} {
  const key = args.payload_key;
  const value = args.payload_value;
  const contains = args.payload_contains;
  if (key !== undefined && typeof key !== 'string') {
    return { error: 'Optional parameter "payload_key" must be a string.' };
  }
  if (value !== undefined && typeof value !== 'string') {
    return { error: 'Optional parameter "payload_value" must be a string.' };
  }
  if (contains !== undefined && typeof contains !== 'string') {
    return { error: 'Optional parameter "payload_contains" must be a string.' };
  }
  if (value !== undefined && (typeof key !== 'string' || !key.trim())) {
    return { error: 'Optional parameter "payload_value" requires "payload_key".' };
  }
  return {
    key: typeof key === 'string' && key.trim() ? key.trim() : undefined,
    value: typeof value === 'string' ? value : undefined,
    contains: typeof contains === 'string' && contains.trim() ? contains.trim() : undefined,
  };
}

function limitGraphSubgraph(nodes: GraphNode[], edges: GraphEdge[], limit: number) {
  const limitedNodes = nodes.slice(0, limit);
  const allowedNodeIds = new Set(limitedNodes.map((node) => node.id));
  const limitedEdges = edges
    .filter((edge) => allowedNodeIds.has(edge.src) && allowedNodeIds.has(edge.dst))
    .slice(0, limit);
  return {
    nodes: limitedNodes,
    edges: limitedEdges,
    truncated: nodes.length > limitedNodes.length || edges.length > limitedEdges.length,
  };
}

function buildTaskTypedGraphContext(
  projectRoot: string,
  route: string | null,
  task = '',
  changedFiles: string[] = [],
) {
  const snapshotPath = graphArtifactPath(projectRoot, 'graph.snapshot.json');
  const snapshot = readJsonIfExists<GraphSnapshot>(snapshotPath);
  if (!snapshot) return null;

  const capsule = readJsonIfExists<{
    cache_key?: string;
    contract_hash?: string;
    contract_cache_key?: string;
    summary?: unknown;
  }>(graphArtifactPath(projectRoot, 'contract-capsule.json'));
  const freshness = inspectMcpGraphFreshness(projectRoot);
  const routeContext = route ? buildGraphRouteContext(snapshot, route, { task }) : null;
  const limitedRouteContext = routeContext
    ? limitGraphSubgraph(routeContext.nodes, routeContext.edges, 120)
    : null;
  const changedFileResolution = buildChangedFileGraphImpact(snapshot, changedFiles, {
    task,
    limit: 120,
  });
  const changedFileNodeIds = changedFileResolution.sourceNodeIds;
  const changedFileImpact = changedFileResolution.context;
  const limitedChangedFileImpact = changedFileImpact
    ? limitGraphSubgraph(changedFileImpact.nodes, changedFileImpact.edges, 120)
    : null;

  return {
    source: 'local_graph',
    artifact_path: displayWorkspacePath(snapshotPath),
    snapshot_id: snapshot.id,
    schema_version: snapshot.schema_version,
    project_id: snapshot.project_id,
    source_hash: snapshot.source_hash,
    current: freshness.current,
    stale_sources: freshness.staleSources,
    contract: capsule
      ? {
          cache_key: capsule.cache_key ?? null,
          contract_hash: capsule.contract_hash ?? null,
          contract_cache_key: capsule.contract_cache_key ?? null,
          summary: capsule.summary ?? null,
        }
      : null,
    route_context: routeContext
      ? {
          route,
          ranking: routeContext.ranking,
          summary: routeContext.summary,
          ids: routeContext.ids,
          ranked: routeContext.ranked.slice(0, 24),
          nodes: limitedRouteContext?.nodes ?? [],
          edges: limitedRouteContext?.edges ?? [],
          truncated: limitedRouteContext?.truncated ?? false,
        }
      : route
        ? {
            route,
            error: 'Route not found in graph snapshot.',
            available_routes: graphAvailableRoutes(snapshot),
          }
        : null,
    changed_file_context:
      changedFiles.length > 0
        ? {
            changed_files: changedFiles.slice(0, 40),
            resolved_node_ids: changedFileNodeIds,
            missing_files: changedFileResolution.unresolvedFiles.slice(0, 40),
            impact: changedFileImpact
              ? {
                  ranking: changedFileImpact.ranking,
                  summary: changedFileImpact.summary,
                  ids: changedFileImpact.ids,
                  ranked: changedFileImpact.ranked.slice(0, 24),
                  nodes: limitedChangedFileImpact?.nodes ?? [],
                  edges: limitedChangedFileImpact?.edges ?? [],
                  truncated: limitedChangedFileImpact?.truncated ?? false,
                }
              : null,
          }
        : null,
  };
}

function changedFilesForTask(projectRoot: string): string[] {
  const changed = new Set<string>();
  try {
    const gitRoot = gitTopLevelForTask(projectRoot) ?? projectRoot;
    // Security: fixed argv, shell disabled, and cwd is the already-resolved project root.
    for (const args of [
      ['diff', '--name-only', '--relative'],
      ['diff', '--name-only', '--relative', '--cached'],
    ]) {
      const output = execFileSync('git', args, {
        cwd: projectRoot,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      for (const entry of output.split(/\r?\n/)) {
        const file = entry.trim();
        const projectFile = changedFileForProject(projectRoot, gitRoot, file);
        if (projectFile) changed.add(projectFile);
      }
    }
  } catch {
    // MCP may run outside a git repository.
  }
  return [...changed].sort();
}

function gitTopLevelForTask(projectRoot: string): string | null {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

function changedFileForProject(projectRoot: string, gitRoot: string, file: string): string | null {
  if (!file) return null;
  const absoluteProjectRoot = resolve(projectRoot);
  const candidateAbsoluteFiles = isAbsolute(file)
    ? [file]
    : [join(absoluteProjectRoot, file), join(gitRoot, file)];
  for (const absoluteFile of candidateAbsoluteFiles) {
    const projectRelative = relative(absoluteProjectRoot, absoluteFile).replace(/\\/g, '/');
    if (!projectRelative || projectRelative.startsWith('../') || projectRelative === '..') {
      continue;
    }
    return projectRelative;
  }
  return null;
}

function impactedRoutesForFiles(discovery: ProjectDiscovery, files: string[]): string[] {
  const impacted = new Set<string>();
  for (const file of files) {
    for (const route of discovery.routes.taskableRoutes) {
      if (file === route.file || file.endsWith(route.file)) {
        impacted.add(route.path);
      }
    }
  }
  return [...impacted].sort();
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    : [];
}

function isRecordValue(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isOptionalMcpStringArray(value: unknown): boolean {
  return (
    value === undefined ||
    (Array.isArray(value) && value.every((entry) => typeof entry === 'string'))
  );
}

type McpTaskLocalPattern = {
  id?: string;
  role?: string;
  componentPaths?: string[];
  behavior_obligations?: {
    intent?: string;
    pattern_role?: string;
    modalities?: unknown;
    states?: unknown;
    risk_profile?: unknown;
    obligations?: unknown;
    test_hints?: unknown;
  };
};

type McpTaskLocalPatternFile = {
  version: number;
  status: 'accepted';
  patterns: McpTaskLocalPattern[];
};

type McpTaskLocalRuleFile = {
  version: number;
  status: 'accepted';
  rules: Array<{ id: string; enabled: boolean; severity: string; description: string }>;
};

type McpTaskStyleBridgeFile = {
  version: 1 | 2;
  status: 'accepted';
  styling?: { approach?: string; themeModes?: string[] };
  mappings: Array<{
    id: string;
    label?: string;
    tokenHints?: string[];
    classHints?: string[];
    guardrails?: string[];
  }>;
};

function hasValidMcpBehaviorObligations(value: unknown): boolean {
  if (value === undefined) return true;
  if (!isRecordValue(value) || !Array.isArray(value.obligations)) return false;
  if (
    !isOptionalMcpStringArray(value.modalities) ||
    !isOptionalMcpStringArray(value.states) ||
    !isOptionalMcpStringArray(value.risk_profile) ||
    !isOptionalMcpStringArray(value.test_hints)
  ) {
    return false;
  }
  return value.obligations.every(
    (obligation) =>
      isRecordValue(obligation) &&
      typeof obligation.id === 'string' &&
      obligation.id.trim().length > 0 &&
      (obligation.label === undefined || typeof obligation.label === 'string') &&
      (obligation.severity === undefined ||
        obligation.severity === 'info' ||
        obligation.severity === 'warn' ||
        obligation.severity === 'error') &&
      (obligation.evidence === undefined || typeof obligation.evidence === 'string'),
  );
}

function isAcceptedMcpLocalPatternFile(value: unknown): value is McpTaskLocalPatternFile {
  return (
    isRecordValue(value) &&
    typeof value.version === 'number' &&
    Number.isSafeInteger(value.version) &&
    value.version > 0 &&
    value.status === 'accepted' &&
    Array.isArray(value.patterns) &&
    value.patterns.every(
      (pattern) =>
        isRecordValue(pattern) &&
        typeof pattern.id === 'string' &&
        pattern.id.trim().length > 0 &&
        isOptionalMcpStringArray(pattern.componentPaths) &&
        hasValidMcpBehaviorObligations(pattern.behavior_obligations),
    )
  );
}

function isAcceptedMcpLocalRuleFile(value: unknown): value is McpTaskLocalRuleFile {
  return (
    isRecordValue(value) &&
    typeof value.version === 'number' &&
    Number.isSafeInteger(value.version) &&
    value.version > 0 &&
    value.status === 'accepted' &&
    Array.isArray(value.rules) &&
    value.rules.every(
      (rule) =>
        isRecordValue(rule) &&
        typeof rule.id === 'string' &&
        rule.id.trim().length > 0 &&
        typeof rule.enabled === 'boolean' &&
        (rule.severity === 'info' || rule.severity === 'warn' || rule.severity === 'error') &&
        typeof rule.description === 'string',
    )
  );
}

function isAcceptedMcpStyleBridgeFile(value: unknown): value is McpTaskStyleBridgeFile {
  if (
    !isRecordValue(value) ||
    (value.version !== 1 && value.version !== 2) ||
    value.status !== 'accepted' ||
    !Array.isArray(value.mappings)
  ) {
    return false;
  }
  if (
    value.styling !== undefined &&
    (!isRecordValue(value.styling) ||
      (value.styling.approach !== undefined && typeof value.styling.approach !== 'string') ||
      !isOptionalMcpStringArray(value.styling.themeModes))
  ) {
    return false;
  }
  return value.mappings.every(
    (mapping) =>
      isRecordValue(mapping) &&
      typeof mapping.id === 'string' &&
      mapping.id.trim().length > 0 &&
      (mapping.label === undefined || typeof mapping.label === 'string') &&
      isOptionalMcpStringArray(mapping.tokenHints) &&
      isOptionalMcpStringArray(mapping.classHints) &&
      isOptionalMcpStringArray(mapping.guardrails),
  );
}

function behaviorObligationSummary(pattern: McpTaskLocalPattern) {
  const contract = pattern.behavior_obligations;
  if (!contract || !Array.isArray(contract.obligations)) return null;
  const obligations = contract.obligations
    .map((entry, index) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
      const record = entry as Record<string, unknown>;
      const id =
        typeof record.id === 'string' && record.id.trim()
          ? record.id.trim()
          : `obligation-${index + 1}`;
      const label =
        typeof record.label === 'string' && record.label.trim() ? record.label.trim() : id;
      return {
        id,
        label,
        severity: typeof record.severity === 'string' ? record.severity : null,
        evidence: typeof record.evidence === 'string' ? record.evidence : null,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  if (obligations.length === 0) return null;
  return {
    pattern_id: pattern.id ?? 'unknown',
    pattern_role: contract.pattern_role ?? pattern.role ?? null,
    intent: contract.intent ?? null,
    modalities: stringArray(contract.modalities),
    states: stringArray(contract.states),
    risk_profile: stringArray(contract.risk_profile),
    obligations,
    test_hints: stringArray(contract.test_hints),
    component_paths: pattern.componentPaths ?? [],
  };
}

function localLawSummary(projectRoot: string) {
  const patternsValue = readJsonIfExists<unknown>(
    join(projectRoot, '.decantr', 'local-patterns.json'),
  );
  const rulesValue = readJsonIfExists<unknown>(join(projectRoot, '.decantr', 'rules.json'));
  const patterns = isAcceptedMcpLocalPatternFile(patternsValue) ? patternsValue : null;
  const rules = isAcceptedMcpLocalRuleFile(rulesValue) ? rulesValue : null;
  const behaviorObligations =
    patterns?.patterns
      ?.map((pattern) => behaviorObligationSummary(pattern))
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)) ?? [];

  return {
    patterns_path: patterns ? '.decantr/local-patterns.json' : null,
    rules_path: rules ? '.decantr/rules.json' : null,
    patterns:
      patterns?.patterns.map((pattern) => ({
        id: pattern.id ?? 'unknown',
        role: pattern.role ?? null,
        component_paths: pattern.componentPaths ?? [],
        behavior_obligations: behaviorObligationSummary(pattern),
      })) ?? [],
    behavior_obligations: behaviorObligations,
    rules:
      rules?.rules.map((rule) => ({
        id: rule.id,
        enabled: rule.enabled,
        severity: rule.severity,
        description: rule.description,
      })) ?? [],
  };
}

function styleBridgeSummary(projectRoot: string) {
  const bridgeValue = readJsonIfExists<unknown>(join(projectRoot, '.decantr', 'style-bridge.json'));
  const bridge = isAcceptedMcpStyleBridgeFile(bridgeValue) ? bridgeValue : null;

  return {
    path: bridge ? '.decantr/style-bridge.json' : null,
    status: bridge?.status ?? null,
    styling_approach: bridge?.styling?.approach ?? null,
    theme_modes: bridge?.styling?.themeModes ?? [],
    mappings:
      bridge?.mappings.map((mapping) => ({
        id: mapping.id,
        label: mapping.label ?? mapping.id,
        token_hints: mapping.tokenHints?.slice(0, 6) ?? [],
        class_hints: mapping.classHints?.slice(0, 4) ?? [],
        guardrails: mapping.guardrails?.slice(0, 3) ?? [],
      })) ?? [],
  };
}

function mentionsWord(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
}

function taskAuthoritySummary(input: {
  workflowMode: string | null;
  adoptionMode: string | null;
  localLaw: ReturnType<typeof localLawSummary>;
  styleBridge: ReturnType<typeof styleBridgeSummary>;
  hasPackManifest: boolean;
  task: string;
}) {
  const hasLocalLaw = input.localLaw.patterns.length > 0 || input.localLaw.rules.length > 0;
  const hasStyleBridge = input.adoptionMode === 'style-bridge' && Boolean(input.styleBridge.path);
  const isGreenfield = Boolean(input.workflowMode?.startsWith('greenfield'));
  let lane = 'Brownfield contract-only';
  let sourceAuthority = 'Existing app is authoritative; Decantr supplies contract context.';
  let styleAuthority = 'Use the existing styling system.';
  const activeAuthorities = isGreenfield
    ? ['Essence V4 contract']
    : ['existing source', 'Essence V4 contract'];

  if (input.workflowMode === 'hybrid-compose') {
    lane = 'Hybrid composition';
    sourceAuthority = 'Existing app plus selected Decantr/local law are authoritative.';
  } else if (input.workflowMode === 'brownfield-attach' && input.adoptionMode === 'decantr-css') {
    lane = 'Hybrid with Decantr CSS';
    sourceAuthority =
      'Existing app remains authoritative except where Decantr CSS is explicitly adopted.';
    styleAuthority = 'Decantr CSS runtime is active where adopted.';
    activeAuthorities.push('Decantr CSS runtime');
  } else if (input.workflowMode === 'brownfield-attach' && hasStyleBridge) {
    lane = 'Hybrid style bridge';
    sourceAuthority =
      'Existing app remains authoritative; Decantr intent maps through the style bridge.';
    styleAuthority = 'Use bridge tokens/classes as a mapping layer onto the app styling system.';
  } else if (input.workflowMode === 'brownfield-attach' && hasLocalLaw) {
    lane = 'Hybrid local law';
    sourceAuthority = 'Existing app plus accepted project-owned UI law are authoritative.';
    styleAuthority = 'Use project-owned components, tokens, classes, and accepted local rules.';
  } else if (input.workflowMode?.startsWith('greenfield')) {
    if (input.adoptionMode === 'style-bridge' && hasStyleBridge) {
      lane = 'Greenfield host style bridge';
      sourceAuthority =
        'Essence V4 governs structure; the accepted host-owned style bridge governs styling realization.';
      styleAuthority =
        'Use the accepted bridge mappings onto project-owned tokens and classes; the host styling runtime remains authoritative.';
    } else {
      lane =
        input.workflowMode === 'greenfield-contract-only'
          ? 'Greenfield contract-only'
          : 'Greenfield scaffold';
      sourceAuthority = 'Essence V4 and generated context are authoritative.';
      styleAuthority =
        input.adoptionMode === 'decantr-css'
          ? 'Use the explicitly adopted Decantr CSS runtime where generated by the adapter.'
          : 'Use the project-chosen styling system.';
    }
  }

  if (hasLocalLaw) activeAuthorities.push('accepted local patterns/rules');
  if (hasStyleBridge) {
    activeAuthorities.push(
      isGreenfield ? 'accepted host-owned style bridge' : 'accepted style bridge',
    );
  }
  if (input.hasPackManifest) activeAuthorities.push('execution packs as advisory guidance');

  const warnings: string[] = [];
  if (input.adoptionMode === 'style-bridge' && !hasStyleBridge) {
    warnings.push(
      input.workflowMode?.startsWith('greenfield')
        ? 'Style-bridge adoption mode is recorded, but no parsed, valid, accepted host-owned style bridge is available. Essence V4 and the project-chosen styling system remain authoritative.'
        : 'Style-bridge adoption mode is recorded, but no parsed, valid, accepted style bridge is available. Production source remains the active style authority.',
    );
  }
  const task = input.task;
  for (const term of ['angular', 'vue', 'svelte', 'solid', 'bootstrap', 'shadcn']) {
    if (mentionsWord(task, term)) {
      warnings.push(
        `Task mentions ${term}; treat it as optional Hybrid guidance unless this workspace already owns that runtime/library or the user explicitly asks for a reviewed adoption plan.`,
      );
    }
  }
  if (
    input.adoptionMode !== 'decantr-css' &&
    (/@decantr\/css/i.test(task) || /\bdecantr css\b/i.test(task) || /\bd-[a-z0-9-]+/i.test(task))
  ) {
    warnings.push(
      'This project is not in decantr-css adoption mode. Do not add @decantr/css or d-* classes unless the user explicitly changes adoption mode.',
    );
  }

  return {
    lane,
    source_authority: sourceAuthority,
    style_authority: styleAuthority,
    active_authorities: activeAuthorities,
    runtime_boundary:
      'Preserve the current workspace runtime unless the task is explicitly a reviewed migration or isolated integration plan.',
    warnings,
  };
}

const MCP_TASK_CAPSULE_VERSION = 'task-capsule.v1' as const;
const MCP_TASK_PAYLOAD_MAX_CANONICAL_BYTES = 12_000;

function mcpTaskWorkspacePath(projectRoot: string, projectPath: string): string {
  return displayWorkspacePath(join(projectRoot, projectPath));
}

function mcpTaskContentGuidance(patternIds: string[]): TaskCapsuleOfficialGuidanceV1[] {
  return [...new Set(patternIds)].flatMap((id, index) => {
    const record = getContentRecord('pattern', id);
    if (!record) return [];
    const ref = buildContentRef({
      namespace: record.namespace,
      type: record.type,
      id: record.id,
      version: record.version,
      data: record.data,
      origin: 'official',
      resolvedFrom: 'installed-package',
    });
    const description = record.data.description;
    return [
      {
        identity: ref.identity,
        version: ref.version,
        digest: ref.digest,
        origin: ref.origin,
        resolvedFrom: ref.resolvedFrom,
        summary:
          typeof description === 'string' && description.trim()
            ? description.trim()
            : `Official ${record.type} guidance for ${record.id}.`,
        rank: index + 1,
        required: false,
      },
    ];
  });
}

function mcpTaskGraphFindings(nodes: GraphNode[]): TaskCapsuleFindingV1[] {
  return nodes
    .filter((node) => node.type === 'Finding')
    .map((node) => {
      const severityValue = graphPayloadString(node.payload, 'severity');
      const severity =
        severityValue === 'error' || severityValue === 'warn' || severityValue === 'info'
          ? severityValue
          : 'warn';
      const code = graphPayloadString(node.payload, 'code') ?? node.id;
      return {
        code,
        severity,
        repairId:
          graphPayloadString(node.payload, 'repair_id') ??
          graphPayloadString(node.payload, 'repair_plan_id') ??
          null,
        graphNodeId: graphPayloadString(node.payload, 'anchored_at') ?? node.id,
        blocking: severity === 'error',
        summary: graphPayloadString(node.payload, 'message') ?? code,
      };
    });
}

function trimMcpTaskCompatibilityPayload(payload: Record<string, unknown>): number {
  const discovery = payload.discovery as
    | {
        project?: { evidence?: unknown[] };
        routes?: { taskable_routes?: unknown[]; signals?: unknown[] };
        components?: { directories?: unknown[]; evidence?: unknown[]; limitations?: unknown[] };
        styling?: { theme_signals?: unknown[] };
        assistant?: { rule_files?: unknown[] };
        limitations?: unknown[];
      }
    | undefined;
  const localLaw = payload.local_law as
    | { patterns?: unknown[]; behavior_obligations?: unknown[]; rules?: unknown[] }
    | undefined;
  const styleBridge = payload.style_bridge as { mappings?: unknown[] } | undefined;
  const health = payload.health_evidence as
    | {
        added_findings?: unknown[];
        resolved_findings?: unknown[];
        changed_routes?: unknown[];
        changed_screenshots?: unknown[];
        contract_drift?: unknown[];
      }
    | undefined;
  const theme = payload.theme_inventory as { modes?: unknown[]; variants?: unknown[] } | undefined;
  const typedGraph = payload.typed_graph as
    | {
        stale_sources?: unknown[];
        route_context?: { ranked?: unknown[]; nodes?: unknown[]; edges?: unknown[] } | null;
        changed_file_context?: {
          impact?: { ranked?: unknown[]; nodes?: unknown[]; edges?: unknown[] } | null;
        } | null;
      }
    | undefined;
  const loop = payload.loop as
    | { maker?: { instructions?: unknown[] }; checker?: { instructions?: unknown[] } }
    | undefined;
  const uiSurfaceTask = payload.ui_surface_task as
    | { candidates?: unknown[]; read?: unknown[]; readTargets?: unknown[] }
    | undefined;
  const lowPriorityRemovable = [
    discovery?.project?.evidence,
    discovery?.routes?.taskable_routes,
    discovery?.routes?.signals,
    discovery?.components?.directories,
    discovery?.components?.evidence,
    discovery?.components?.limitations,
    discovery?.styling?.theme_signals,
    discovery?.assistant?.rule_files,
    discovery?.limitations,
    uiSurfaceTask?.candidates,
    uiSurfaceTask?.read,
    uiSurfaceTask?.readTargets,
    payload.ranked_patterns,
    typedGraph?.stale_sources,
    typedGraph?.route_context?.nodes,
    typedGraph?.route_context?.edges,
    typedGraph?.changed_file_context?.impact?.ranked,
    typedGraph?.changed_file_context?.impact?.nodes,
    typedGraph?.changed_file_context?.impact?.edges,
    loop?.maker?.instructions,
    loop?.checker?.instructions,
  ].filter((value): value is unknown[] => Array.isArray(value));
  const lastResortRemovable = [
    localLaw?.patterns,
    localLaw?.behavior_obligations,
    localLaw?.rules,
    styleBridge?.mappings,
    health?.added_findings,
    health?.resolved_findings,
    health?.changed_routes,
    health?.changed_screenshots,
    health?.contract_drift,
    theme?.modes,
    theme?.variants,
    payload.shared_components,
    payload.patterns,
    payload.directives,
    typedGraph?.route_context?.ranked,
  ].filter((value): value is unknown[] => Array.isArray(value));

  const pruneLists = (lists: unknown[][]): void => {
    for (const list of lists) {
      while (
        list.length > 0 &&
        canonicalUtf8Bytes(payload) > MCP_TASK_PAYLOAD_MAX_CANONICAL_BYTES
      ) {
        list.pop();
      }
      if (canonicalUtf8Bytes(payload) <= MCP_TASK_PAYLOAD_MAX_CANONICAL_BYTES) break;
    }
  };

  pruneLists(lowPriorityRemovable);

  for (const key of ['page_pack_excerpt', 'section_context'] as const) {
    while (
      canonicalUtf8Bytes(payload) > MCP_TASK_PAYLOAD_MAX_CANONICAL_BYTES &&
      typeof payload[key] === 'string' &&
      payload[key].length > 256
    ) {
      payload[key] = payload[key].slice(0, Math.max(256, Math.floor(payload[key].length / 2)));
    }
  }
  pruneLists(lastResortRemovable);
  return canonicalUtf8Bytes(payload);
}

function extractPatternIdsFromLayoutItem(item: unknown, ids: Set<string>): void {
  if (typeof item === 'string') {
    ids.add(item);
    return;
  }
  if (!item || typeof item !== 'object') return;
  const record = item as Record<string, unknown>;
  if (typeof record.pattern === 'string') ids.add(record.pattern);
  if (Array.isArray(record.cols)) {
    for (const col of record.cols) extractPatternIdsFromLayoutItem(col, ids);
  }
}

function extractPagePatternIds(page: BlueprintPage | null): string[] {
  if (!page) return [];
  const ids = new Set<string>();
  for (const item of page.layout ?? []) extractPatternIdsFromLayoutItem(item, ids);
  return [...ids].sort();
}

function summarizePackJson(pack: unknown): {
  directives: unknown[];
  patterns: unknown[];
  visualTarget: string | null;
  sharedComponents: unknown[];
} {
  if (!pack || typeof pack !== 'object') {
    return { directives: [], patterns: [], visualTarget: null, sharedComponents: [] };
  }
  const record = pack as Record<string, unknown>;
  const data =
    record.data && typeof record.data === 'object'
      ? (record.data as Record<string, unknown>)
      : record;
  const patterns = Array.isArray(data.patterns) ? data.patterns : [];
  const directives = Array.isArray(data.directives) ? data.directives : [];
  const sharedComponents = Array.isArray(data.sharedComponents)
    ? data.sharedComponents
    : Array.isArray(data.shared_components)
      ? data.shared_components
      : [];
  const visualTarget =
    typeof data.visualTarget === 'string'
      ? data.visualTarget
      : typeof data.visual_target === 'string'
        ? data.visual_target
        : null;
  return { directives, patterns, visualTarget, sharedComponents };
}

function routeSlug(route: string): string {
  return (
    route
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'root'
  );
}

async function getShowcaseBenchmarkPayload(view: string) {
  const client = getPublicAPIClient();

  if (view === 'manifest') {
    return client.getShowcaseManifest();
  }

  if (view === 'verification') {
    return client.getShowcaseShortlistVerification();
  }

  return client.getShowcaseShortlist();
}

async function getRegistryIntelligenceSummaryPayload(namespace?: string) {
  const client = getPublicAPIClient();
  return client.getRegistryIntelligenceSummary(namespace ? { namespace } : undefined);
}

async function getHostedExecutionPackBundlePayload(args: Record<string, unknown>) {
  const client = getPublicAPIClient();
  const essence = (() => {
    if (typeof args.essence === 'object' && args.essence !== null && !Array.isArray(args.essence)) {
      return args.essence as EssenceFile;
    }
    return readEssenceFile(args.path as string | undefined);
  })();

  return client.compileExecutionPacks(
    essence,
    typeof args.namespace === 'string' ? { namespace: args.namespace } : undefined,
  );
}

async function getHostedSelectedExecutionPackPayload(args: Record<string, unknown>) {
  const client = getPublicAPIClient();
  const essence = (() => {
    if (typeof args.essence === 'object' && args.essence !== null && !Array.isArray(args.essence)) {
      return args.essence as EssenceFile;
    }
    return readEssenceFile(args.path as string | undefined);
  })();

  return client.selectExecutionPack(
    {
      essence,
      pack_type: args.pack_type as 'scaffold' | 'review' | 'section' | 'page' | 'mutation',
      ...(typeof args.id === 'string' ? { id: args.id } : {}),
    },
    typeof args.namespace === 'string' ? { namespace: args.namespace } : undefined,
  );
}

async function getHostedExecutionPackManifestPayload(args: Record<string, unknown>) {
  const client = getPublicAPIClient();
  const essence = (() => {
    if (typeof args.essence === 'object' && args.essence !== null && !Array.isArray(args.essence)) {
      return args.essence as EssenceFile;
    }
    return readEssenceFile(args.path as string | undefined);
  })();

  return client.getExecutionPackManifest(
    essence,
    typeof args.namespace === 'string' ? { namespace: args.namespace } : undefined,
  );
}

type HostedExecutionPackBundle = Awaited<ReturnType<typeof getHostedExecutionPackBundlePayload>>;
type HostedSelectedExecutionPack = Awaited<
  ReturnType<typeof getHostedSelectedExecutionPackPayload>
>;
type HostedExecutionPackManifest = Awaited<
  ReturnType<typeof getHostedExecutionPackManifestPayload>
>;
type PackSource = 'local' | 'hosted_fallback';

async function loadHostedExecutionPackBundleFallback(args: Record<string, unknown>): Promise<{
  bundle: HostedExecutionPackBundle | null;
  error: string | null;
}> {
  try {
    return {
      bundle: await getHostedExecutionPackBundlePayload(args),
      error: null,
    };
  } catch (error) {
    return {
      bundle: null,
      error: (error as Error).message,
    };
  }
}

async function loadHostedExecutionPackManifestFallback(args: Record<string, unknown>): Promise<{
  manifest: HostedExecutionPackManifest | null;
  error: string | null;
}> {
  try {
    return {
      manifest: await getHostedExecutionPackManifestPayload(args),
      error: null,
    };
  } catch (error) {
    return {
      manifest: null,
      error: (error as Error).message,
    };
  }
}

async function loadHostedSelectedExecutionPackFallback(args: Record<string, unknown>): Promise<{
  selected: HostedSelectedExecutionPack | null;
  error: string | null;
}> {
  try {
    return {
      selected: await getHostedSelectedExecutionPackPayload(args),
      error: null,
    };
  } catch (error) {
    return {
      selected: null,
      error: (error as Error).message,
    };
  }
}

function hasExecutionPackPayload(payload: {
  markdown: string | null;
  json: unknown | null;
}): boolean {
  return payload.markdown !== null || payload.json !== null;
}

function toHostedExecutionPackPayload(pack: { renderedMarkdown?: string } | null | undefined) {
  return {
    markdown: pack && typeof pack.renderedMarkdown === 'string' ? pack.renderedMarkdown : null,
    json: pack ?? null,
  };
}

function findManifestEntryForPack(
  manifest: PackManifest,
  packType: 'scaffold' | 'review' | 'section' | 'page' | 'mutation',
  id?: string,
): PackManifestEntry | null {
  switch (packType) {
    case 'scaffold':
      return manifest.scaffold;
    case 'review':
      return manifest.review ?? null;
    case 'section':
      return id ? (manifest.sections.find((section) => section.id === id) ?? null) : null;
    case 'page':
      return id ? (manifest.pages.find((page) => page.id === id) ?? null) : null;
    case 'mutation':
      return id
        ? ((manifest.mutations ?? []).find((mutation) => mutation.id === id) ?? null)
        : null;
    default:
      return null;
  }
}

const ZONE_ORDER: ArchetypeRole[] = ['public', 'gateway', 'primary', 'auxiliary'];

function deriveZones(inputs: ZoneInput[]): ComposedZone[] {
  const zoneMap = new Map<ArchetypeRole, ComposedZone>();

  for (const input of inputs) {
    const existing = zoneMap.get(input.role);
    if (existing) {
      existing.archetypes.push(input.archetypeId);
      existing.features.push(...input.features);
      existing.descriptions.push(input.description);
    } else {
      zoneMap.set(input.role, {
        role: input.role,
        archetypes: [input.archetypeId],
        shell: input.shell,
        features: [...input.features],
        descriptions: [input.description],
      });
    }
  }

  for (const zone of zoneMap.values()) {
    zone.features = [...new Set(zone.features)];
  }

  return ZONE_ORDER.filter((role) => zoneMap.has(role)).map((role) => zoneMap.get(role)!);
}

const GATEWAY_TRIGGER_MAP: Record<string, string> = {
  auth: 'authentication',
  login: 'authentication',
  mfa: 'authentication',
  payment: 'payment',
  subscription: 'payment',
  checkout: 'payment',
  onboarding: 'onboarding',
  'setup-wizard': 'onboarding',
  welcome: 'onboarding',
  invite: 'invitation',
  'access-code': 'invitation',
};

function resolveGatewayTrigger(features: string[]): string {
  for (const feature of features) {
    const trigger = GATEWAY_TRIGGER_MAP[feature];
    if (trigger) return trigger;
  }
  return 'authentication';
}

function deriveTransitions(zones: ComposedZone[]): ZoneTransition[] {
  const transitions: ZoneTransition[] = [];
  const roles = new Set(zones.map((z) => z.role));
  const gateway = zones.find((z) => z.role === 'gateway');
  const gatewayTrigger = gateway ? resolveGatewayTrigger(gateway.features) : 'authentication';

  const hasApp = roles.has('primary') || roles.has('auxiliary');
  const hasGateway = roles.has('gateway');
  const hasPublic = roles.has('public');

  if (hasPublic && hasGateway) {
    transitions.push({
      from: 'public',
      to: 'gateway',
      type: 'conversion',
      trigger: gatewayTrigger,
    });
  }
  if (hasPublic && hasApp && !hasGateway) {
    transitions.push({ from: 'public', to: 'app', type: 'conversion', trigger: 'navigation' });
  }
  if (hasGateway && hasApp) {
    transitions.push({ from: 'gateway', to: 'app', type: 'gate-pass', trigger: gatewayTrigger });
    transitions.push({ from: 'app', to: 'gateway', type: 'gate-return', trigger: gatewayTrigger });
  }
  if (hasApp && hasPublic) {
    transitions.push({ from: 'app', to: 'public', type: 'navigation', trigger: 'external' });
  }

  return transitions;
}

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

/** Read-only but makes network calls */
const READ_ONLY_NETWORK = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};

/** Write tool annotations */
const WRITE_TOOL = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
};

const MCP_PROJECT_HEALTH_SCHEMA_URL = PROJECT_HEALTH_REPORT_V2_SCHEMA_URL;
const MCP_WORKSPACE_HEALTH_SCHEMA_URL = WORKSPACE_HEALTH_REPORT_V2_SCHEMA_URL;
const MCP_WORKSPACE_IGNORES = new Set([
  '.git',
  '.next',
  '.turbo',
  '.vercel',
  'coverage',
  'dist',
  'node_modules',
  'playwright-report',
]);

function mcpSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function mcpStatusFromCounts(counts: {
  errorCount: number;
  warnCount: number;
}): ProjectHealthStatus {
  if (counts.errorCount > 0) return 'error';
  if (counts.warnCount > 0) return 'warning';
  return 'healthy';
}

function mcpScoreFromCounts(counts: {
  errorCount: number;
  warnCount: number;
  infoCount: number;
}): number {
  return Math.max(
    0,
    Math.min(100, 100 - counts.errorCount * 15 - counts.warnCount * 5 - counts.infoCount),
  );
}

function mcpCommandsForFinding(source: ProjectHealthFindingSource): string[] {
  switch (source) {
    case 'assertion':
      return ['decantr refresh', 'decantr health --evidence'];
    case 'brownfield':
      return ['decantr analyze', 'decantr init --existing --merge-proposal', 'decantr health'];
    case 'browser':
      return ['decantr health --browser', 'decantr health --evidence'];
    case 'check':
      return ['decantr check', 'decantr health'];
    case 'design-token':
      return ['decantr export --to figma-tokens', 'decantr health --evidence'];
    case 'style-bridge':
      return ['decantr codify --style-bridge', 'decantr verify --evidence'];
    case 'graph':
      return ['decantr graph', 'decantr health --evidence'];
    case 'interaction':
      return ['decantr verify --brownfield --local-patterns', 'decantr verify --evidence'];
    case 'pack':
      return [
        'decantr refresh',
        'decantr content get-pack review --write-context',
        'decantr health',
      ];
    case 'runtime':
      return ['npm run build', 'decantr health'];
    default:
      return ['decantr audit', 'decantr health'];
  }
}

function mcpSourceFromFinding(finding: VerificationFinding): ProjectHealthFindingSource {
  const category = finding.category.toLowerCase();
  const id = finding.id.toLowerCase();
  const rule = finding.rule?.toLowerCase() ?? '';
  if (
    category.includes('runtime') ||
    category.includes('document') ||
    category.includes('performance')
  ) {
    return 'runtime';
  }
  if (category.includes('pack') || category.includes('review contract')) {
    return 'pack';
  }
  if (
    category.includes('interaction') ||
    id.includes('interaction') ||
    rule.includes('interaction')
  ) {
    return 'interaction';
  }
  if (
    category.includes('style bridge') ||
    id.includes('style-bridge') ||
    rule.includes('style-bridge')
  ) {
    return 'style-bridge';
  }
  return 'audit';
}

function mcpBuildRepairPrompt(input: {
  id: string;
  source: ProjectHealthFindingSource;
  category: string;
  severity: VerificationSeverity;
  message: string;
  code?: string;
  evidence: string[];
  suggestedFix?: string;
  repair?: VerificationRepairAction;
  commands: string[];
}): string {
  return [
    'You are fixing one Decantr Project Health finding in this local workspace.',
    '',
    'Read `DECANTR.md`, `decantr.essence.json`, and `.decantr/context/scaffold-pack.md` if they exist. For route or page work, read the matching page/section packs before editing.',
    '',
    `Finding: ${input.id}`,
    `Source: ${input.source}`,
    `Severity: ${input.severity}`,
    `Category: ${input.category}`,
    input.code ? `Code: ${input.code}` : null,
    `Message: ${input.message}`,
    input.repair ? `Repair: ${input.repair.id}` : null,
    input.evidence.length > 0
      ? `Evidence:\n${input.evidence.map((entry) => `- ${entry}`).join('\n')}`
      : null,
    input.suggestedFix ? `Suggested fix: ${input.suggestedFix}` : null,
    '',
    'Make the smallest coherent code or contract change that resolves this finding. Preserve the existing framework, routing, styling system, and Decantr workflow mode unless the finding explicitly requires a contract update.',
    'Do not rewrite unrelated routes, replace the styling system, remove existing product behavior, or regenerate Decantr artifacts unless the finding is about stale or missing generated context.',
    '',
    `After the fix, run:\n${input.commands.map((command) => `- ${command}`).join('\n')}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n');
}

function mcpHealthFinding(input: {
  source: ProjectHealthFindingSource;
  category: string;
  severity: VerificationSeverity;
  message: string;
  evidence?: string[];
  target?: string;
  file?: string;
  rule?: string;
  suggestedFix?: string;
  code?: string;
  repair?: VerificationRepairAction;
  baseId?: string;
}): ProjectHealthFinding {
  const id = `${input.source}-${mcpSlug(input.baseId || input.rule || `${input.category}-${input.message}`)}`;
  const commands = mcpCommandsForFinding(input.source);
  const diagnostic = deriveVerificationDiagnostic({
    id,
    source: input.source,
    category: input.category,
    message: input.message,
    rule: input.rule,
    target: input.target,
    file: input.file,
    suggestedFix: input.suggestedFix,
    evidence: input.evidence,
  });
  const code = input.code ?? diagnostic.code;
  const repair = input.repair ?? diagnostic.repair;
  return {
    id,
    code,
    source: input.source,
    category: input.category,
    severity: input.severity,
    message: input.message,
    evidence: input.evidence ?? [],
    target: input.target,
    file: input.file,
    rule: input.rule,
    suggestedFix: input.suggestedFix,
    repair,
    remediation: {
      summary: input.suggestedFix || `Resolve ${input.category.toLowerCase()} finding.`,
      commands,
      prompt: mcpBuildRepairPrompt({
        id,
        source: input.source,
        category: input.category,
        severity: input.severity,
        message: input.message,
        code,
        evidence: input.evidence ?? [],
        suggestedFix: input.suggestedFix,
        repair,
        commands,
      }),
    },
  };
}

function mcpCollectGraphArtifactFindings(projectRoot: string): ProjectHealthFinding[] {
  const graphDirPresent = existsSync(join(projectRoot, '.decantr', 'graph'));
  const projectMetadataPresent = existsSync(join(projectRoot, '.decantr', 'project.json'));
  if (!graphDirPresent && !projectMetadataPresent) {
    return [];
  }

  const essence = readProjectEssence(projectRoot);
  if (essence && !isV4(essence)) {
    return [
      mcpHealthFinding({
        source: 'graph',
        category: 'Typed Contract Graph',
        severity: 'warn',
        message:
          'Typed Contract graph could not be derived: active graph workflows require Essence v4.0.0.',
        evidence: [
          'Graph derivation reads decantr.essence.json, local rules, style bridge, visual manifest, and saved evidence bundle artifacts.',
        ],
        target: '.decantr/graph',
        rule: 'typed-graph-current',
        suggestedFix: 'Run `decantr migrate --to v4`, then run `decantr graph`.',
        baseId: 'typed-graph-current',
      }),
    ];
  }

  const graphDir = join(projectRoot, '.decantr', 'graph');
  const requiredArtifacts = [
    'graph.snapshot.json',
    'graph.manifest.json',
    'graph.diff.json',
    'contract-capsule.json',
  ];
  const missingArtifacts = requiredArtifacts
    .map((file) => join(graphDir, file))
    .filter((path) => !existsSync(path))
    .map((path) => relative(projectRoot, path).replace(/\\/g, '/'));
  const graphFreshness = inspectMcpGraphFreshness(projectRoot);
  const staleSources = graphFreshness.staleSources.map((source) => source.path);

  if (!missingArtifacts.length && !staleSources.length) {
    return [];
  }

  return [
    mcpHealthFinding({
      source: 'graph',
      category: 'Typed Contract Graph',
      severity: 'warn',
      message: 'Typed Contract graph artifacts are missing or stale.',
      evidence: [
        ...missingArtifacts,
        ...staleSources.map((path) => `${path} changed since graph manifest generation`),
      ].slice(0, 8),
      target: '.decantr/graph',
      rule: 'typed-graph-current',
      suggestedFix:
        'Run `decantr graph` to regenerate graph snapshot, history, diff, manifest, and capsule.',
      baseId: 'typed-graph-current',
    }),
  ];
}

function mcpCollectDeclaredRoutes(essence: EssenceFile | null): string[] {
  if (!essence || !isV4(essence)) return [];
  return Object.keys(essence.blueprint.routes ?? {}).sort();
}

function mcpReportFromAudit(
  projectRoot: string,
  audit: ProjectAuditReport,
  assertions: ContractAssertion[],
): ProjectHealthReport {
  const findings: ProjectHealthFinding[] = [];
  const seen = new Set<string>();
  const pushUnique = (finding: ProjectHealthFinding) => {
    const key = `${finding.rule ?? finding.id}|${finding.message}`;
    if (seen.has(key)) return;
    seen.add(key);
    findings.push(finding);
  };

  for (const finding of audit.findings) {
    pushUnique(
      mcpHealthFinding({
        source: mcpSourceFromFinding(finding),
        category: finding.category,
        severity: finding.severity,
        message: finding.message,
        evidence: finding.evidence,
        target: finding.target,
        file: finding.file,
        rule: finding.rule,
        suggestedFix: finding.suggestedFix,
        code: finding.code,
        repair: finding.repair,
        baseId: finding.id,
      }),
    );
  }

  for (const assertion of assertions) {
    if (assertion.status !== 'failed') continue;
    pushUnique(
      mcpHealthFinding({
        source: 'assertion',
        category: `Contract ${assertion.category}`,
        severity: assertion.severity,
        message: assertion.message,
        evidence: assertion.evidence,
        target: assertion.target,
        rule: assertion.rule,
        suggestedFix: assertion.suggestedFix,
        baseId: assertion.id,
      }),
    );
  }

  if (!audit.valid && findings.every((finding) => finding.severity !== 'error')) {
    pushUnique(
      mcpHealthFinding({
        source: 'audit',
        category: 'Project Contract',
        severity: 'error',
        message: 'Project audit is not valid.',
        evidence: ['The verifier returned valid=false.'],
        rule: 'project-audit-invalid',
        suggestedFix: 'Resolve blocking audit findings and rerun `decantr health`.',
      }),
    );
  }

  for (const finding of mcpCollectGraphArtifactFindings(projectRoot)) {
    pushUnique(finding);
  }

  const anchoredFindings = mcpAnchorHealthFindings(projectRoot, findings).map((finding) => ({
    ...finding,
    repairPlan: buildProjectHealthRepairPlan(projectRoot, finding),
  }));
  const counts = {
    errorCount: anchoredFindings.filter((finding) => finding.severity === 'error').length,
    warnCount: anchoredFindings.filter((finding) => finding.severity === 'warn').length,
    infoCount: anchoredFindings.filter((finding) => finding.severity === 'info').length,
  };
  const manifest = audit.packManifest;
  const projectJson = readJsonIfExists<{
    initialized?: { workflowMode?: string; adoptionMode?: string };
  }>(join(projectRoot, '.decantr', 'project.json'));

  const baseReport = {
    $schema: MCP_PROJECT_HEALTH_SCHEMA_URL,
    generatedAt: new Date().toISOString(),
    projectRoot,
    status: mcpStatusFromCounts(counts),
    score: mcpScoreFromCounts(counts),
    summary: {
      ...counts,
      findingCount: anchoredFindings.length,
      workflowMode: projectJson?.initialized?.workflowMode ?? null,
      adoptionMode: projectJson?.initialized?.adoptionMode ?? null,
      essenceVersion: audit.summary.essenceVersion,
      pageCount: audit.summary.pageCount,
      runtimeAuditChecked: audit.summary.runtimeAuditChecked,
      runtimePassed: audit.summary.runtimePassed,
      packManifestPresent: audit.summary.packManifestPresent,
      reviewPackPresent: audit.summary.reviewPackPresent,
    },
    routes: {
      declared: mcpCollectDeclaredRoutes(audit.essence),
      runtimeChecked: audit.runtimeAudit.routeHintsChecked,
      runtimeMatched: audit.runtimeAudit.routeHintsMatched,
      runtimeCoverageOk: audit.summary.runtimeAuditChecked
        ? audit.runtimeAudit.routeHintsCoverageOk
        : null,
      issues: anchoredFindings
        .filter(
          (finding) =>
            finding.category.toLowerCase().includes('route') ||
            finding.rule?.toLowerCase().includes('route') ||
            finding.id.toLowerCase().includes('route'),
        )
        .map((finding) => finding.message),
    },
    packs: {
      manifestPresent: Boolean(manifest),
      reviewPackPresent: Boolean(manifest?.review ?? audit.reviewPack),
      scaffoldPackPresent: Boolean(manifest?.scaffold),
      sectionPackCount: manifest?.sections.length ?? 0,
      pagePackCount: manifest?.pages.length ?? 0,
      mutationPackCount: manifest?.mutations?.length ?? 0,
      generatedAt: typeof manifest?.generatedAt === 'string' ? manifest.generatedAt : null,
    },
    graph: mcpInspectProjectHealthGraph(projectRoot),
    ci: {
      recommendedCommand: 'decantr health --ci --fail-on error',
      failOn: 'error',
    },
    findings: anchoredFindings,
  };
  const evidenceTier = createEvidenceTier(baseReport);
  const authority = createAuthorityResolution(baseReport);
  const loop = createLoopReadiness(baseReport, authority, evidenceTier);

  return {
    ...baseReport,
    evidenceTier,
    authority,
    loop,
    findings: anchoredFindings.map((finding) => {
      const conflict = authority.conflicts.find((entry) => entry.id === finding.id);
      return {
        ...finding,
        evidenceTier,
        authorityLane: conflict?.lane ?? authority.activeLane,
        resolutionActions: conflict?.recommendedActions,
        privacy: {
          sourceIncluded: false as const,
          redacted: true,
          localOnly: true,
        },
        loopVerdict: loop.state,
      };
    }),
  };
}

function resolveMcpProjectRoot(value: unknown): string {
  if (value == null) return process.cwd();
  if (typeof value !== 'string') {
    throw new Error('project_path must be a string when provided.');
  }
  return resolveWorkspacePath(value);
}

async function getMcpHealthState(projectRoot: string): Promise<{
  audit: ProjectAuditReport;
  assertions: ContractAssertion[];
  report: ProjectHealthReport;
  evidence: EvidenceBundle;
}> {
  const { auditProject, createContractAssertions, createEvidenceBundle } = await import(
    '@decantr/verifier'
  );
  const audit = await auditProject(projectRoot);
  const assertions = createContractAssertions(projectRoot, audit);
  const report = mcpReportFromAudit(projectRoot, audit, assertions);
  const evidence = createEvidenceBundle({
    projectRoot,
    audit,
    assertions,
    report,
    workspaceConfigPath: existsSync(join(projectRoot, '.decantr', 'workspace.json'))
      ? join(projectRoot, '.decantr', 'workspace.json')
      : null,
  });
  return { audit, assertions, report, evidence };
}

function compactMcpFinding(finding: ProjectHealthFinding, includePrompt: boolean) {
  return {
    id: finding.id,
    code: finding.code,
    source: finding.source,
    category: finding.category,
    severity: finding.severity,
    message: finding.message,
    evidence: finding.evidence,
    target: finding.target,
    file: finding.file,
    rule: finding.rule,
    suggestedFix: finding.suggestedFix,
    graph: finding.graph,
    repair: finding.repair,
    repairPlan: finding.repairPlan,
    evidenceTier: finding.evidenceTier,
    authorityLane: finding.authorityLane,
    resolutionActions: finding.resolutionActions,
    privacy: finding.privacy,
    loopVerdict: finding.loopVerdict,
    remediation: {
      summary: finding.remediation.summary,
      commands: finding.remediation.commands,
      prompt: includePrompt ? finding.remediation.prompt : undefined,
    },
  };
}

function selectMcpRepairFinding(
  report: ProjectHealthReport,
  options: { findingId?: string; code?: string } = {},
): ProjectHealthFinding | null {
  return (
    (options.findingId
      ? report.findings.find((entry) => entry.id === options.findingId)
      : undefined) ??
    (options.code ? report.findings.find((entry) => entry.code === options.code) : undefined) ??
    report.findings.find((entry) => entry.severity === 'error') ??
    report.findings.find((entry) => entry.severity === 'warn') ??
    report.findings[0] ??
    null
  );
}

function mcpRepairPlanAction(finding: ProjectHealthFinding) {
  const repairId = finding.repair?.id ?? 'manual-repair';
  if (repairId === 'regenerate-typed-graph' || finding.source === 'graph') {
    return {
      id: repairId,
      kind: 'regenerate_artifact',
      target: '.decantr/graph',
      description:
        'Regenerate the typed Contract graph artifacts from the current project sources.',
      payload: finding.repair?.payload ?? {},
    };
  }
  if (repairId === 'import-existing-component') {
    return {
      id: repairId,
      kind: 'replace_duplicate_with_import',
      target: finding.file ?? finding.target ?? null,
      description:
        'Remove the locally redeclared UI primitive and import the existing project-owned component.',
      payload: finding.repair?.payload ?? {},
    };
  }
  if (repairId === 'replace-raw-control-with-local-component') {
    return {
      id: repairId,
      kind: 'replace_raw_control_with_component',
      target: finding.file ?? finding.target ?? null,
      description:
        'Replace the raw JSX control with the existing project-owned primitive component.',
      payload: finding.repair?.payload ?? {},
    };
  }
  if (repairId === 'replace-arbitrary-style-with-bridge-token') {
    return {
      id: repairId,
      kind: 'replace_arbitrary_style_with_bridge_token',
      target: finding.file ?? finding.target ?? null,
      description:
        'Replace the arbitrary Tailwind value with an accepted project token/class from the style bridge, or update the bridge if the value is approved.',
      payload: finding.repair?.payload ?? {},
    };
  }
  return {
    id: repairId,
    kind: 'manual_repair',
    target: finding.file ?? finding.target ?? null,
    description: finding.suggestedFix ?? finding.remediation.summary,
    payload: finding.repair?.payload ?? {},
  };
}

function mcpRepairReadTargets(finding: ProjectHealthFinding): string[] {
  const targets = new Set<string>(['DECANTR.md', 'decantr.essence.json']);
  if (finding.source === 'graph') {
    targets.add('.decantr/graph/graph.manifest.json');
    targets.add('.decantr/graph/graph.snapshot.json');
    targets.add('.decantr/graph/graph.diff.json');
    targets.add('.decantr/graph/snapshots/');
  }
  if (finding.source === 'style-bridge') {
    targets.add('.decantr/style-bridge.json');
  }
  if (finding.source === 'pack' || finding.source === 'assertion') {
    targets.add('.decantr/context/pack-manifest.json');
  }
  if (finding.graph?.node_id) {
    targets.add('.decantr/graph/contract-capsule.json');
  }
  if (finding.file) {
    targets.add(finding.file);
  }
  if (finding.target && !finding.target.startsWith('http')) {
    targets.add(finding.target);
  }
  return [...targets];
}

function mcpRepairImpactContext(projectRoot: string, finding: ProjectHealthFinding) {
  const nodeId = finding.graph?.node_id;
  if (!nodeId) return null;
  const impact = buildGraphImpactContext(readMcpGraphSnapshot(projectRoot), nodeId, {
    task: finding.message,
    limit: 120,
  });
  if (!impact) return null;
  return {
    snapshot_id: impact.snapshotId,
    source_hash: impact.sourceHash,
    seed_nodes: impact.seedNodes,
    summary: impact.summary,
    ids: impact.ids,
    ranked: impact.ranked,
    nodes: impact.nodes,
    edges: impact.edges,
  };
}

function buildMcpRepairPlan(input: {
  evidence: EvidenceBundle;
  finding: ProjectHealthFinding | null;
  projectRoot: string;
  includePrompt?: boolean;
}) {
  if (!input.finding) {
    return {
      project: input.evidence.project,
      health: input.evidence.health,
      finding: null,
      plan: null,
      message: 'No Project Health findings require repair.',
      commands: ['decantr health --evidence'],
    };
  }

  const finding = input.finding;
  const action = mcpRepairPlanAction(finding);
  return {
    project: input.evidence.project,
    health: input.evidence.health,
    finding: compactMcpFinding(finding, false),
    plan: {
      id: `repair-plan:${finding.id}`,
      finding_id: finding.id,
      diagnostic_code: finding.code ?? null,
      repair_id: finding.repair?.id ?? null,
      severity: finding.severity,
      source: finding.source,
      category: finding.category,
      graph_anchor: finding.graph ?? null,
      impact_context: mcpRepairImpactContext(input.projectRoot, finding),
      actions: [action],
      evidence: finding.evidence.map((entry, index) => ({
        id: `evidence:${finding.id}:${index + 1}`,
        text: entry,
      })),
      read_targets: mcpRepairReadTargets(finding),
      preserve: [
        'existing framework, routing, and styling system',
        'existing production behavior unrelated to this finding',
        'accepted local law, style bridge mappings, and graph anchors',
      ],
      avoid: [
        'rewriting unrelated routes',
        'replacing the app styling system',
        'regenerating Decantr artifacts unless the finding is about generated context or graph freshness',
      ],
      commands: finding.remediation.commands,
      prompt: input.includePrompt === true ? finding.remediation.prompt : undefined,
    },
  };
}

function discoverMcpWorkspaceProjects(
  root: string,
  maxProjects = 500,
): Array<{
  id: string;
  path: string;
  absolutePath: string;
}> {
  const projects: Array<{ id: string; path: string; absolutePath: string }> = [];

  function walk(dir: string, depth: number): void {
    if (projects.length >= maxProjects || depth > 6) return;
    if (existsSync(join(dir, 'decantr.essence.json'))) {
      const path = relative(root, dir).replace(/\\/g, '/') || '.';
      projects.push({
        id: path.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'project',
        path,
        absolutePath: dir,
      });
      return;
    }

    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      if (MCP_WORKSPACE_IGNORES.has(entry.name)) continue;
      walk(join(dir, entry.name), depth + 1);
      if (projects.length >= maxProjects) return;
    }
  }

  walk(root, 0);
  return projects.sort((a, b) => a.path.localeCompare(b.path));
}

async function getMcpWorkspaceHealth(args: Record<string, unknown>) {
  const root =
    args.workspace_root == null ? process.cwd() : resolveMcpProjectRoot(args.workspace_root);
  const maxProjects =
    typeof args.max_projects === 'number' && Number.isFinite(args.max_projects)
      ? Math.max(1, Math.floor(args.max_projects))
      : 500;
  const discovered = discoverMcpWorkspaceProjects(root, maxProjects);
  const projects = [];

  for (const project of discovered) {
    const startedAt = Date.now();
    try {
      const state = await getMcpHealthState(project.absolutePath);
      projects.push({
        id: project.id,
        path: project.path,
        status: state.report.status,
        score: state.report.score,
        errorCount: state.report.summary.errorCount,
        warnCount: state.report.summary.warnCount,
        infoCount: state.report.summary.infoCount,
        findingCount: state.report.summary.findingCount,
        durationMs: Date.now() - startedAt,
        changed: false,
        source: 'auto',
        error: null,
        loopState: state.report.loop.state,
        loopNextAction: state.report.loop.nextActions[0] ?? null,
      });
    } catch (error) {
      projects.push({
        id: project.id,
        path: project.path,
        status: 'failed',
        score: 0,
        errorCount: 1,
        warnCount: 0,
        infoCount: 0,
        findingCount: 1,
        durationMs: Date.now() - startedAt,
        changed: false,
        source: 'auto',
        error: (error as Error).message,
        loopState: 'blocked_missing_context',
        loopNextAction: 'Fix the project health failure, then rerun workspace health.',
      });
    }
  }
  const summary = {
    projectCount: discovered.length,
    checkedCount: projects.length,
    healthyCount: projects.filter((project) => project.status === 'healthy').length,
    warningCount: projects.filter((project) => project.status === 'warning').length,
    errorCount: projects.filter((project) => project.status === 'error').length,
    failedCount: projects.filter((project) => project.status === 'failed').length,
  };
  const blockedCount = projects.filter(
    (project) =>
      typeof project.loopState === 'string' &&
      (project.loopState.startsWith('blocked') ||
        project.loopState === 'human_resolution_required'),
  ).length;
  const repairRequiredCount = projects.filter(
    (project) => project.loopState === 'repair_required',
  ).length;
  const loopState =
    projects.length === 0
      ? 'needs_context'
      : blockedCount > 0
        ? 'human_resolution_required'
        : repairRequiredCount > 0 || summary.errorCount > 0 || summary.warningCount > 0
          ? 'repair_required'
          : 'verified';

  return {
    $schema: MCP_WORKSPACE_HEALTH_SCHEMA_URL,
    generatedAt: new Date().toISOString(),
    workspaceRoot: '<workspace>',
    changedOnly: false,
    since: null,
    summary,
    loop: {
      state: loopState,
      status:
        loopState === 'human_resolution_required' || loopState.startsWith('blocked')
          ? 'blocked'
          : summary.errorCount > 0 || summary.failedCount > 0
            ? 'error'
            : summary.warningCount > 0
              ? 'warning'
              : 'healthy',
      projectCount: projects.length,
      blockedCount,
      repairRequiredCount,
      nextActions: [
        loopState === 'verified'
          ? 'Workspace loop verified.'
          : 'Open the highest-risk project, prepare task context, repair, and rerun verification.',
      ],
    },
    projects,
  };
}

const CONSOLIDATED_TOOL_ACTIONS = {
  decantr_project: {
    state: 'decantr_get_project_state',
    workspace_health: 'decantr_workspace_health',
  },
  decantr_contract: {
    read_essence: 'decantr_read_essence',
    validate: 'decantr_validate',
    check_drift: 'decantr_check_drift',
    create_essence: 'decantr_create_essence',
    capsule: 'decantr_get_contract_capsule',
  },
  decantr_context: {
    scaffold: 'decantr_get_scaffold_context',
    section: 'decantr_get_section_context',
    page: 'decantr_get_page_context',
    task: 'decantr_prepare_task_context',
    execution_pack: 'decantr_get_execution_pack',
  },
  decantr_graph: {
    snapshot: 'decantr_get_graph_snapshot',
    query: 'decantr_query_graph',
    traverse: 'decantr_traverse_graph',
  },
  decantr_registry: {
    search: 'decantr_search_registry',
    resolve_pattern: 'decantr_resolve_pattern',
    resolve_archetype: 'decantr_resolve_archetype',
    resolve_blueprint: 'decantr_resolve_blueprint',
    suggest_patterns: 'decantr_suggest_patterns',
    showcase_benchmarks: 'decantr_get_showcase_benchmarks',
    intelligence_summary: 'decantr_get_registry_intelligence_summary',
    compile_execution_packs: 'decantr_compile_execution_packs',
  },
  decantr_verify: {
    audit_project: 'decantr_audit_project',
    critique: 'decantr_critique',
    findings: 'decantr_get_findings',
    evidence_bundle: 'decantr_get_evidence_bundle',
    health_loop: 'decantr_run_health_loop',
  },
  decantr_repair: {
    findings: 'decantr_get_findings',
    repair_plan: 'decantr_get_repair_plan',
    repair_prompt: 'decantr_get_repair_prompt',
    health_loop: 'decantr_run_health_loop',
  },
  decantr_contract_write: {
    accept_drift: 'decantr_accept_drift',
    update_essence: 'decantr_update_essence',
  },
} as const;

type ConsolidatedToolName = keyof typeof CONSOLIDATED_TOOL_ACTIONS;

function consolidatedActionNames(name: ConsolidatedToolName): string[] {
  return Object.keys(CONSOLIDATED_TOOL_ACTIONS[name]);
}

function consolidatedTool(
  name: ConsolidatedToolName,
  title: string,
  description: string,
  annotations: typeof READ_ONLY,
) {
  return {
    name,
    title,
    description,
    inputSchema: {
      type: 'object' as const,
      properties: {
        action: {
          type: 'string' as const,
          enum: consolidatedActionNames(name),
          description: "Select one of this compatibility-stable tool's existing actions.",
        },
      },
      required: ['action'],
      additionalProperties: true,
    },
    annotations,
  };
}

export const TOOLS = [
  consolidatedTool(
    'decantr_project',
    'Decantr Project Authority',
    'Observe local project authority, selected-app discovery, adoption truth, and workspace health without uploading source.',
    READ_ONLY,
  ),
  consolidatedTool(
    'decantr_contract',
    'Decantr Contract',
    'Read and validate the project-owned Decantr contract, inspect drift, or create a compatibility contract skeleton.',
    READ_ONLY_NETWORK,
  ),
  consolidatedTool(
    'decantr_context',
    'Decantr Task Context',
    'Prepare discovery-backed UI surface task context, preserve authoritative route capsules, or read existing scaffold, section, page, and execution-pack context.',
    READ_ONLY_NETWORK,
  ),
  consolidatedTool(
    'decantr_graph',
    'Decantr Evidence Graph',
    'Read, query, and traverse local graph and source evidence that supports route-scoped UI work.',
    READ_ONLY,
  ),
  consolidatedTool(
    'decantr_registry',
    'Decantr Content Corpus (Compatibility)',
    'Legacy-named compatibility access to the official Decantr content corpus, benchmark metadata, and execution packs; not a public registry.',
    READ_ONLY_NETWORK,
  ),
  consolidatedTool(
    'decantr_verify',
    'Decantr Verify',
    'Verify local UI diffs against available authority and return critique, findings, health state, and evidence bundles.',
    READ_ONLY_NETWORK,
  ),
  consolidatedTool(
    'decantr_repair',
    'Decantr Repair',
    'Turn typed verification findings into scoped repair plans, prompts, and health-loop guidance.',
    READ_ONLY,
  ),
  consolidatedTool(
    'decantr_contract_write',
    'Decantr Contract Write',
    'Explicit workspace-contained write surface for accepting drift or updating the Essence v4 contract.',
    WRITE_TOOL,
  ),
];

export async function handleTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  if (!(name in CONSOLIDATED_TOOL_ACTIONS)) {
    return { error: `Unknown tool: ${name}` };
  }

  const actionMap = CONSOLIDATED_TOOL_ACTIONS[name as ConsolidatedToolName];
  if (typeof args.action !== 'string' || !args.action.trim()) {
    return {
      error: `Required parameter "action" must be one of: ${Object.keys(actionMap).join(', ')}.`,
    };
  }

  const action = args.action.trim();
  const legacyName = actionMap[action as keyof typeof actionMap];
  if (!legacyName) {
    return {
      error: `Unsupported action "${action}" for ${name}. Must be one of: ${Object.keys(actionMap).join(', ')}.`,
    };
  }

  const { action: _action, ...routedArgs } = args;
  return handleLegacyTool(legacyName, routedArgs);
}

async function handleLegacyTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiClient = getAPIClient();

  switch (name) {
    case 'decantr_read_essence': {
      const essencePath = (args.path as string) || join(process.cwd(), 'decantr.essence.json');
      try {
        const raw = await readFile(essencePath, 'utf-8');
        const essence = JSON.parse(raw) as EssenceFile;
        const layer = args.layer as string | undefined;
        if (!isV4(essence)) {
          return {
            error:
              'Active Decantr V2 workflows require Essence v4.0.0. Run `decantr migrate --to v4` for older essence files.',
          };
        }
        if (layer) {
          if (layer === 'dna') return essence.dna;
          if (layer === 'blueprint') return essence.blueprint;
        }
        return essence;
      } catch (e) {
        return { error: `Could not read essence file: ${(e as Error).message}` };
      }
    }

    case 'decantr_validate': {
      const essencePath = (args.path as string) || join(process.cwd(), 'decantr.essence.json');
      let essence: unknown;
      try {
        essence = JSON.parse(await readFile(essencePath, 'utf-8'));
      } catch (e) {
        return {
          valid: false,
          errors: [`Could not read: ${(e as Error).message}`],
          guardViolations: [],
        };
      }
      const result = validateEssence(essence);

      let guardViolations: GuardViolation[] = [];
      if (result.valid && typeof essence === 'object' && essence !== null) {
        try {
          guardViolations = evaluateGuard(essence as EssenceFile, {});
        } catch {
          /* guard evaluation is optional */
        }
      }

      // For Essence v4 files, separate violations by layer
      if (
        result.valid &&
        typeof essence === 'object' &&
        essence !== null &&
        isV4(essence as EssenceFile)
      ) {
        const dnaViolations = guardViolations.filter((v) => v.layer === 'dna');
        const blueprintViolations = guardViolations.filter((v) => v.layer === 'blueprint');
        const otherViolations = guardViolations.filter((v) => !v.layer);
        return {
          ...result,
          format: 'v4',
          dna_violations: dnaViolations,
          blueprint_violations: blueprintViolations,
          guardViolations: otherViolations,
        };
      }

      return { ...result, guardViolations };
    }

    case 'decantr_search_registry': {
      const err = validateStringArg(args, 'query');
      if (err) return { error: err };
      if (
        args.source &&
        (typeof args.source !== 'string' || !isContentIntelligenceSource(args.source))
      ) {
        return { error: 'Invalid source. Must be one of: authored, benchmark, hybrid.' };
      }
      try {
        const response = await apiClient.search({
          q: args.query as string,
          type: args.type as string | undefined,
          sort: args.sort as string | undefined,
          recommended: args.recommended === true,
          intelligenceSource: args.source as ContentIntelligenceSource | undefined,
        });
        return {
          total: response.total,
          results: response.results.map((r) => ({
            type: r.type,
            id: r.slug,
            namespace: r.namespace,
            name: r.name,
            description: r.description,
            install: `decantr get ${r.type} ${r.slug}`,
            intelligence: r.intelligence ?? null,
          })),
        };
      } catch (e) {
        return { error: `Search failed: ${(e as Error).message}` };
      }
    }

    case 'decantr_resolve_pattern': {
      const err = validateStringArg(args, 'id');
      if (err) return { error: err };
      const namespace = (args.namespace as string) || '@official';
      try {
        const pattern = await apiClient.getPattern(namespace, args.id as string);
        const result: Record<string, unknown> = { found: true, ...pattern };
        if (args.preset && typeof args.preset === 'string') {
          const preset = resolvePatternPreset(pattern as Pattern, args.preset);
          if (preset) result.resolvedPreset = preset;
        }
        return result;
      } catch {
        return { found: false, message: `Pattern "${args.id}" not found in ${namespace}.` };
      }
    }

    case 'decantr_resolve_archetype': {
      const err = validateStringArg(args, 'id');
      if (err) return { error: err };
      const namespace = (args.namespace as string) || '@official';
      try {
        const archetype = await apiClient.getArchetype(namespace, args.id as string);
        return { found: true, ...archetype };
      } catch {
        return { found: false, message: `Archetype "${args.id}" not found in ${namespace}.` };
      }
    }

    case 'decantr_resolve_blueprint': {
      const err = validateStringArg(args, 'id');
      if (err) return { error: err };
      const namespace = (args.namespace as string) || '@official';
      try {
        const blueprint = await apiClient.getBlueprint(namespace, args.id as string);

        // Derive topology from composed archetypes
        let topology = null;
        const composeEntries = blueprint.compose;
        if (composeEntries && Array.isArray(composeEntries) && composeEntries.length > 0) {
          const zoneInputs: ZoneInput[] = [];
          const archetypePromises = composeEntries.map(async (entry: ComposeEntry) => {
            const arcId = typeof entry === 'string' ? entry : entry.archetype;
            try {
              const archData = await apiClient.getArchetype(namespace, arcId);
              const explicitRole = typeof entry === 'string' ? undefined : entry.role;
              zoneInputs.push({
                archetypeId: arcId,
                role: explicitRole || archData.role || 'auxiliary',
                shell: archData.pages?.[0]?.shell || 'sidebar-main',
                features: archData.features || [],
                description: archData.description || '',
              });
            } catch {
              // Archetype not found — skip
            }
          });
          await Promise.all(archetypePromises);

          if (zoneInputs.length > 0) {
            const zones = deriveZones(zoneInputs);
            const transitions = deriveTransitions(zones);
            const primaryArchetype = zoneInputs.find((z) => z.role === 'primary');
            topology = {
              zones: zones.map((z) => ({
                role: z.role,
                archetypes: z.archetypes,
                shell: z.shell,
                features: z.features,
                purpose: z.descriptions.join(' '),
              })),
              transitions,
              entryPoints: {
                anonymous: '/',
                authenticated: primaryArchetype ? `/${primaryArchetype.archetypeId}` : '/home',
              },
            };
          }
        }

        return { found: true, ...blueprint, ...(topology ? { topology } : {}) };
      } catch {
        return { found: false, message: `Blueprint "${args.id}" not found in ${namespace}.` };
      }
    }

    case 'decantr_suggest_patterns': {
      const err = validateStringArg(args, 'description');
      if (err) return { error: err };
      const desc = args.description as string;
      const route = typeof args.route === 'string' ? args.route : undefined;
      const sourceCode = typeof args.source_code === 'string' ? args.source_code : undefined;

      try {
        const patternsResponse = await apiClient.listContent<RegistryPatternListItem>('patterns', {
          namespace: '@official',
          limit: 250,
        });

        const preliminary = rankPatternCandidates(
          { query: desc, route, code: sourceCode, limit: 12 },
          patternsResponse.items.map((item) =>
            patternToDiscoveryCandidate({
              id: item.slug || item.name || 'pattern',
              slug: item.slug,
              name: item.name,
              description: item.description,
            }),
          ),
        );

        const fullCandidates = await Promise.all(
          preliminary.map(async (match) => {
            const slug = match.candidate.slug || match.candidate.id;
            try {
              const fetched = await apiClient.getPattern('@official', slug);
              return patternToDiscoveryCandidate(fetched as Pattern, { slug, source: 'hosted' });
            } catch {
              return match.candidate;
            }
          }),
        );

        const suggestions = rankPatternCandidates(
          { query: desc, route, code: sourceCode, limit: 5 },
          fullCandidates,
        ).map((match) => {
          const pattern = match.candidate.pattern as Pattern | undefined;
          const preset = pattern?.presets ? Object.values(pattern.presets)[0] : null;
          return {
            id: match.candidate.slug || match.candidate.id,
            score: match.score,
            name: match.candidate.name || match.candidate.slug || match.candidate.id,
            description: match.candidate.description || '',
            components: match.candidate.components || [],
            interactions: match.candidate.interactions || [],
            layout: preset?.layout ? preset.layout.layout : 'unknown',
            reasons: match.reasons,
            matched_terms: match.matchedTerms,
          };
        });

        return {
          query: args.description,
          route,
          suggestions,
          total: preliminary.length,
        };
      } catch (e) {
        return { error: `Could not fetch patterns: ${(e as Error).message}` };
      }
    }

    case 'decantr_check_drift': {
      const essencePath = (args.path as string) || join(process.cwd(), 'decantr.essence.json');
      let essence: EssenceFile;
      try {
        essence = JSON.parse(await readFile(essencePath, 'utf-8'));
      } catch (e) {
        return { error: `Could not read essence: ${(e as Error).message}` };
      }

      const validation = validateEssence(essence);
      if (!validation.valid) {
        return { drifted: true, reason: 'invalid_essence', errors: validation.errors };
      }
      if (!isV4(essence)) {
        return {
          drifted: true,
          reason: 'legacy_essence',
          errors: [
            'Active Decantr V2 workflows require Essence v4.0.0. Run `decantr migrate --to v4` for older essence files.',
          ],
        };
      }

      const violations: {
        rule: string;
        severity: string;
        message: string;
        layer?: string;
        autoFixable?: boolean;
        autoFix?: unknown;
      }[] = [];

      if (args.theme_used && typeof args.theme_used === 'string') {
        const expectedThemeId = essence.dna.theme.id;
        if (expectedThemeId && args.theme_used !== expectedThemeId) {
          violations.push({
            rule: 'theme-match',
            severity: 'critical',
            message: `Theme drift: code uses "${args.theme_used}" but Essence specifies "${expectedThemeId}". Do not switch themes.`,
            layer: 'dna',
            autoFixable: false,
          });
        }
      }

      if (args.page_id && typeof args.page_id === 'string') {
        const pages = listEssencePages(essence);
        if (!pages.find((p) => p.id === args.page_id)) {
          violations.push({
            rule: 'page-exists',
            severity: 'critical',
            message: `Page "${args.page_id}" not found in Essence structure. Add it to the Essence before generating code for it.`,
            layer: 'blueprint',
            autoFixable: true,
            autoFix: { type: 'add_page', patch: { id: args.page_id } },
          });
        }
      }

      // Implement components_used checking
      if (
        args.components_used &&
        Array.isArray(args.components_used) &&
        args.page_id &&
        typeof args.page_id === 'string'
      ) {
        const pages = listEssencePages(essence);
        const page = pages.find((p) => p.id === args.page_id);
        if (page?.layout) {
          // Extract expected patterns from layout
          const expectedPatterns = new Set<string>();
          for (const item of page.layout) {
            if (typeof item === 'string') {
              expectedPatterns.add(item);
            } else if (typeof item === 'object' && item !== null && 'pattern' in item) {
              expectedPatterns.add((item as { pattern: string }).pattern);
            }
          }

          // Check if any components_used don't have a matching pattern in the layout
          const componentsUsed = args.components_used as string[];
          const unmatchedComponents: string[] = [];
          for (const comp of componentsUsed) {
            // Check if the component fuzzy-matches any expected pattern
            const compLower = comp.toLowerCase().replace(/[_\s]/g, '-');
            let matched = false;
            for (const pattern of expectedPatterns) {
              const patternLower = pattern.toLowerCase();
              if (
                compLower.includes(patternLower) ||
                patternLower.includes(compLower) ||
                fuzzyScore(compLower, patternLower) >= 60
              ) {
                matched = true;
                break;
              }
            }
            if (!matched) {
              unmatchedComponents.push(comp);
            }
          }

          if (unmatchedComponents.length > 0) {
            violations.push({
              rule: 'component-pattern-match',
              severity: 'warning',
              message: `Components [${unmatchedComponents.join(', ')}] do not match any pattern in page "${args.page_id}" layout. Expected patterns: [${[...expectedPatterns].join(', ')}].`,
              layer: 'blueprint',
              autoFixable: false,
            });
          }
        }
      }

      try {
        const guardViolations = evaluateGuard(essence, {
          pageId: args.page_id as string | undefined,
        });
        for (const gv of guardViolations) {
          violations.push({
            rule: gv.rule || 'guard',
            severity: gv.severity || 'warning',
            message: gv.message || 'Guard violation',
            ...(gv.layer ? { layer: gv.layer } : {}),
            ...(gv.autoFixable !== undefined ? { autoFixable: gv.autoFixable } : {}),
            ...(gv.autoFix ? { autoFix: gv.autoFix } : {}),
          });
        }
      } catch {
        /* guard is optional */
      }

      return {
        drifted: violations.length > 0,
        dna_violations: violations.filter((v) => v.layer === 'dna'),
        blueprint_drift: violations.filter((v) => v.layer === 'blueprint'),
        other_violations: violations.filter((v) => !v.layer),
        checkedAgainst: essencePath,
      };
    }

    case 'decantr_create_essence': {
      const err = validateStringArg(args, 'description');
      if (err) return { error: err };
      const desc = (args.description as string).toLowerCase();
      const framework = (args.framework as string) || 'react';

      const archetypeScores: { id: string; score: number }[] = [];
      const archetypeIds = [
        'saas-dashboard',
        'ecommerce',
        'portfolio',
        'content-site',
        'financial-dashboard',
        'cloud-platform',
        'gaming-platform',
        'ecommerce-admin',
      ];

      for (const id of archetypeIds) {
        let score = 0;
        if (desc.includes('dashboard') && id.includes('dashboard')) score += 20;
        if (desc.includes('saas') && id.includes('saas')) score += 20;
        if (desc.includes('ecommerce') && id.includes('ecommerce')) score += 20;
        if (desc.includes('shop') && id.includes('ecommerce')) score += 15;
        if (desc.includes('portfolio') && id.includes('portfolio')) score += 20;
        if (desc.includes('blog') && id.includes('content')) score += 15;
        if (desc.includes('content') && id.includes('content')) score += 15;
        if (desc.includes('finance') && id.includes('financial')) score += 20;
        if (desc.includes('cloud') && id.includes('cloud')) score += 15;
        if (desc.includes('game') && id.includes('gaming')) score += 15;
        if (desc.includes('admin') && id.includes('admin')) score += 15;
        if (desc.includes('analytics') && id.includes('dashboard')) score += 10;
        if (score > 0) archetypeScores.push({ id, score });
      }

      archetypeScores.sort((a, b) => b.score - a.score);
      const bestMatch = archetypeScores[0]?.id || 'saas-dashboard';

      // Try to fetch archetype from API for richer skeleton
      let pages: Array<{ id: string; shell: string; default_layout: string[] }> | undefined;
      let features: string[] = [];

      try {
        const archetype = await apiClient.getArchetype('@official', bestMatch);
        pages = archetype.pages as Array<{ id: string; shell: string; default_layout: string[] }>;
        features = archetype.features || [];
      } catch {
        // API unavailable, use minimal defaults
      }

      const rawPages = pages || [{ id: 'home', shell: 'full-bleed', default_layout: ['hero'] }];
      const defaultShell = rawPages[0]?.shell || 'sidebar-main';

      const sectionPages = rawPages.map((p, index) => ({
        id: p.id,
        route: p.id === 'home' || index === 0 ? '/' : `/${p.id}`,
        ...(p.shell !== defaultShell ? { shell_override: p.shell } : {}),
        layout: p.default_layout || [],
      }));
      const routes = Object.fromEntries(
        sectionPages.map((page) => [page.route, { section: bestMatch, page: page.id }]),
      );

      // Generate Essence v4 skeleton
      const essence: EssenceV4 = {
        version: '4.0.0',
        dna: {
          theme: {
            id: 'auradecantism',
            mode: 'dark',
            shape: 'rounded',
          },
          spacing: {
            base_unit: 4,
            scale: 'linear',
            density: 'comfortable',
            content_gap: '4',
          },
          typography: {
            scale: 'modular',
            heading_weight: 600,
            body_weight: 400,
          },
          color: {
            palette: 'semantic',
            accent_count: 1,
            cvd_preference: 'auto',
          },
          radius: {
            philosophy: 'rounded',
            base: 8,
          },
          elevation: {
            system: 'layered',
            max_levels: 3,
          },
          motion: {
            preference: 'subtle',
            duration_scale: 1.0,
            reduce_motion: true,
          },
          accessibility: {
            wcag_level: 'AA',
            focus_visible: true,
            skip_nav: true,
          },
          personality: ['professional'],
        },
        blueprint: {
          shell: defaultShell,
          sections: [
            {
              id: bestMatch,
              role: 'primary',
              shell: defaultShell,
              features,
              description: `${bestMatch} primary section`,
              pages: sectionPages,
            },
          ],
          features,
          routes,
        },
        meta: {
          archetype: bestMatch,
          target: framework,
          platform: { type: 'spa', routing: 'history' },
          guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
        },
      };

      return {
        essence,
        archetype: bestMatch,
        format: 'v4',
        instructions: `Save this as decantr.essence.json in your project root. Review the dna (design tokens), blueprint (pages/features), and meta (project config) sections and adjust to match your needs. The guard rules will validate your code against this spec.`,
        _generated: {
          matched_archetype: bestMatch,
          confidence: archetypeScores[0]?.score || 0,
          alternatives: archetypeScores.slice(1, 4).map((a) => a.id),
          description: args.description,
        },
      };
    }

    case 'decantr_accept_drift': {
      const violations = args.violations as
        | Array<{ rule: string; page_id?: string; details?: string }>
        | undefined;
      const resolution = args.resolution as string;

      if (!violations || !Array.isArray(violations) || violations.length === 0) {
        return { error: 'Required parameter "violations" must be a non-empty array.' };
      }
      if (!resolution || !['accept', 'accept_scoped', 'reject', 'defer'].includes(resolution)) {
        return {
          error:
            'Required parameter "resolution" must be one of: accept, accept_scoped, reject, defer.',
        };
      }

      // Check if any violations are DNA-layer; if so, require confirm_dna
      const hasDnaViolation = violations.some((v) => {
        const rule = v.rule;
        // DNA-layer rules: theme, density, theme-mode, accessibility
        return ['theme', 'style', 'density', 'theme-mode', 'accessibility', 'theme-match'].includes(
          rule,
        );
      });

      if (
        hasDnaViolation &&
        resolution !== 'reject' &&
        resolution !== 'defer' &&
        !args.confirm_dna
      ) {
        return {
          error:
            'DNA-layer violations detected. Set confirm_dna: true to accept changes to design axioms (theme, density, accessibility, etc.).',
          requires_confirmation: true,
          dna_rules_affected: violations
            .filter((v) =>
              ['theme', 'style', 'density', 'theme-mode', 'accessibility', 'theme-match'].includes(
                v.rule,
              ),
            )
            .map((v) => v.rule),
        };
      }

      if (resolution === 'reject') {
        return {
          status: 'rejected',
          message:
            'Violations rejected. No changes made. Revert the code to match the essence spec.',
          violations_count: violations.length,
        };
      }

      if (resolution === 'defer') {
        const projectRoot = args.path ? dirname(args.path as string) : undefined;
        const existingLog = await readDriftLog(projectRoot);
        const newEntries: DriftLogEntry[] = violations.map((v) => ({
          rule: v.rule,
          page_id: v.page_id,
          details: v.details,
          resolution: 'deferred',
          scope: (args.scope as string) || undefined,
          timestamp: new Date().toISOString(),
        }));
        const updatedLog = [...existingLog, ...newEntries];
        const logPath = await writeDriftLog(updatedLog, projectRoot);
        return {
          status: 'deferred',
          message: `${violations.length} violation(s) deferred to drift log.`,
          log_path: logPath,
          total_deferred: updatedLog.length,
        };
      }

      // resolution === 'accept' or 'accept_scoped'
      try {
        const { path } = await mutateEssenceFile(args.path as string | undefined, (v4) => {
          for (const v of violations) {
            applyDriftAcceptance(v4, v, resolution, args.scope as string | undefined);
          }
          return v4;
        });

        return {
          status: resolution === 'accept_scoped' ? 'accepted_scoped' : 'accepted',
          message: `${violations.length} violation(s) resolved. Essence updated.`,
          path,
          scope: resolution === 'accept_scoped' ? args.scope || 'unscoped' : undefined,
        };
      } catch (e) {
        return { error: `Failed to update essence: ${(e as Error).message}` };
      }
    }

    case 'decantr_update_essence': {
      const operation = args.operation as string;
      const payload = args.payload as Record<string, unknown>;

      if (!operation) {
        return { error: 'Required parameter "operation" is missing.' };
      }
      if (!payload || typeof payload !== 'object') {
        return { error: 'Required parameter "payload" must be an object.' };
      }

      const validOps = [
        'add_page',
        'remove_page',
        'update_page_layout',
        'update_dna',
        'update_blueprint',
        'add_feature',
        'remove_feature',
      ];
      if (!validOps.includes(operation)) {
        return {
          error: `Invalid operation "${operation}". Must be one of: ${validOps.join(', ')}`,
        };
      }

      try {
        const { path } = await mutateEssenceFile(args.path as string | undefined, (v4) => {
          return applyEssenceUpdate(v4, operation, payload);
        });

        return {
          status: 'updated',
          operation,
          path,
          summary: describeUpdate(operation, payload),
        };
      } catch (e) {
        return { error: `Failed to update essence: ${(e as Error).message}` };
      }
    }

    case 'decantr_get_project_state': {
      try {
        const projectRoot = graphProjectRoot(args);
        const essence = readProjectEssence(projectRoot);
        const packManifest = readProjectPackManifest(projectRoot);
        const graphDir = join(projectRoot, '.decantr', 'graph');
        const snapshotPath = graphArtifactPath(projectRoot, 'graph.snapshot.json');
        const manifestPath = graphArtifactPath(projectRoot, 'graph.manifest.json');
        const diffPath = graphArtifactPath(projectRoot, 'graph.diff.json');
        const capsulePath = graphArtifactPath(projectRoot, 'contract-capsule.json');
        const snapshot = readJsonIfExists<GraphSnapshot>(snapshotPath);
        const graphDiff = readJsonIfExists<GraphDiff>(diffPath);
        const snapshotHistoryPath = snapshot
          ? graphSnapshotHistoryPath(projectRoot, snapshot.id)
          : null;
        const snapshotHistoryPresent = snapshotHistoryPath
          ? existsSync(snapshotHistoryPath)
          : false;
        const snapshotHistoryCount = graphSnapshotHistoryCount(projectRoot);
        const capsule = readJsonIfExists<{
          cache_key?: string;
          contract_hash?: string;
          contract_cache_key?: string;
          source_artifact_limit?: number;
          source_artifacts_truncated?: boolean;
          summary?: {
            source_artifacts?: number;
          };
        }>(capsulePath);
        const graphFreshness = inspectMcpGraphFreshness(projectRoot);
        const projectConfig = readJsonIfExists<{
          initialized?: {
            workflowMode?: string;
            adoptionMode?: string;
          };
          workflowMode?: string;
          adoptionMode?: string;
          telemetry?: boolean;
        }>(join(projectRoot, '.decantr', 'project.json'));
        const localPatternsPresent = existsSync(
          join(projectRoot, '.decantr', 'local-patterns.json'),
        );
        const localRulesPresent = existsSync(join(projectRoot, '.decantr', 'rules.json'));
        const styleBridgePresent = existsSync(join(projectRoot, '.decantr', 'style-bridge.json'));
        const hasGraphArtifacts =
          existsSync(snapshotPath) &&
          snapshotHistoryPresent &&
          existsSync(manifestPath) &&
          existsSync(diffPath) &&
          existsSync(capsulePath);
        const graphReady =
          Boolean(snapshot) && hasGraphArtifacts && graphFreshness.current === true;
        const adoptionTruth = createProjectAdoptionTruthV1(projectRoot);

        return {
          source: 'local_workspace',
          project_root: displayWorkspacePath(projectRoot),
          adoption_truth: adoptionTruth,
          discovery: mcpDiscoverySummary(projectRoot),
          essence: essence
            ? {
                present: true,
                version:
                  typeof (essence as { version?: unknown }).version === 'string'
                    ? (essence as { version: string }).version
                    : null,
                active_v4: isV4(essence),
                routes: isV4(essence) ? Object.keys(essence.blueprint.routes ?? {}).sort() : [],
                sections: isV4(essence)
                  ? essence.blueprint.sections.map((section) => ({
                      id: section.id,
                      role: section.role,
                      pages: section.pages.length,
                    }))
                  : [],
                features: isV4(essence) ? essence.blueprint.features : [],
                guard: isV4(essence) ? essence.meta.guard : null,
              }
            : {
                present: false,
                version: null,
                active_v4: false,
                routes: [],
                sections: [],
                features: [],
                guard: null,
              },
          project_config: {
            present: Boolean(projectConfig),
            workflow_mode:
              projectConfig?.initialized?.workflowMode ?? projectConfig?.workflowMode ?? null,
            adoption_mode:
              projectConfig?.initialized?.adoptionMode ?? projectConfig?.adoptionMode ?? null,
            telemetry_enabled: projectConfig?.telemetry === true,
          },
          context: {
            manifest_present: Boolean(packManifest),
            scaffold_pack_present: Boolean(packManifest?.scaffold),
            review_pack_present: Boolean(packManifest?.review),
            section_pack_count: packManifest?.sections.length ?? 0,
            page_pack_count: packManifest?.pages.length ?? 0,
            mutation_pack_count: packManifest?.mutations?.length ?? 0,
            generated_at:
              packManifest && typeof packManifest.generatedAt === 'string'
                ? packManifest.generatedAt
                : null,
          },
          graph: {
            graph_dir_present: existsSync(graphDir),
            manifest_present: Boolean(graphFreshness.manifest),
            snapshot_present: Boolean(snapshot),
            snapshot_history_present: snapshotHistoryPresent,
            snapshot_history_path: snapshotHistoryPath
              ? displayWorkspacePath(snapshotHistoryPath)
              : null,
            snapshot_history_count: snapshotHistoryCount,
            capsule_present: existsSync(capsulePath),
            diff_present: existsSync(diffPath),
            ready: graphReady,
            current: graphFreshness.current,
            stale_sources: graphFreshness.staleSources,
            snapshot_id: snapshot?.id ?? null,
            schema_version: snapshot?.schema_version ?? null,
            source_hash: snapshot?.source_hash ?? null,
            cache_key: capsule?.cache_key ?? null,
            contract_hash: capsule?.contract_hash ?? null,
            contract_cache_key: capsule?.contract_cache_key ?? null,
            capsule_source_artifact_count: capsule?.summary?.source_artifacts ?? null,
            capsule_source_artifact_limit: capsule?.source_artifact_limit ?? null,
            capsule_source_artifacts_truncated: capsule?.source_artifacts_truncated ?? null,
            summary: snapshot?.summary ?? null,
            diff_summary: graphDiff ? summarizeGraphDiff(graphDiff) : null,
            available_routes: snapshot ? graphAvailableRoutes(snapshot) : [],
            source_artifact_count: snapshot
              ? snapshot.nodes.filter((node) => node.type === 'SourceArtifact').length
              : 0,
            available_source_artifacts: snapshot
              ? graphAvailableSourceArtifacts(snapshot).slice(0, 40)
              : [],
          },
          local_authority: {
            local_patterns_present: localPatternsPresent,
            local_rules_present: localRulesPresent,
            style_bridge_present: styleBridgePresent,
          },
          diagnostics: {
            known_count: KNOWN_VERIFICATION_DIAGNOSTICS.length,
            families: [
              ...new Set(KNOWN_VERIFICATION_DIAGNOSTICS.map((entry) => entry.family)),
            ].sort(),
            codes: KNOWN_VERIFICATION_DIAGNOSTICS.map((entry) => ({
              code: entry.code,
              rule: entry.rule,
              repair_id: entry.repairId,
              family: entry.family,
            })).sort((a, b) => a.code.localeCompare(b.code) || a.rule.localeCompare(b.rule)),
          },
          recommended_next_tools: [
            graphReady ? 'decantr_contract' : 'decantr_repair',
            graphReady ? null : 'decantr_repair',
            snapshot ? 'decantr_graph' : null,
            'decantr_context',
            'decantr_repair',
            'decantr_verify',
          ]
            .filter((tool): tool is string => Boolean(tool))
            .filter((tool, index, tools) => tools.indexOf(tool) === index),
          recommended_next_actions: [
            graphReady
              ? { tool: 'decantr_contract', action: 'capsule' }
              : { tool: 'decantr_repair', action: 'findings' },
            graphReady ? null : { tool: 'decantr_repair', action: 'repair_plan' },
            snapshot ? { tool: 'decantr_graph', action: 'snapshot' } : null,
            { tool: 'decantr_context', action: 'task' },
            { tool: 'decantr_repair', action: 'findings' },
            { tool: 'decantr_verify', action: 'evidence_bundle' },
          ].filter((action): action is { tool: string; action: string } => Boolean(action)),
        };
      } catch (e) {
        return { error: `Could not read project state: ${(e as Error).message}` };
      }
    }

    case 'decantr_get_contract_capsule': {
      try {
        const projectRoot = graphProjectRoot(args);
        const capsulePath = graphArtifactPath(projectRoot, 'contract-capsule.json');
        const capsule = readJsonIfExists<unknown>(capsulePath);
        if (!capsule) {
          return {
            error:
              'Contract capsule not found. Run `decantr graph` from the project root, or `decantr graph --project <path>` from a workspace root.',
            expected_path: displayWorkspacePath(capsulePath),
          };
        }
        return {
          source: 'local_graph',
          artifact_path: displayWorkspacePath(capsulePath),
          capsule,
        };
      } catch (e) {
        return { error: `Could not read contract capsule: ${(e as Error).message}` };
      }
    }

    case 'decantr_get_graph_snapshot': {
      try {
        const projectRoot = graphProjectRoot(args);
        const snapshotPath = graphArtifactPath(projectRoot, 'graph.snapshot.json');
        const diffPath = graphArtifactPath(projectRoot, 'graph.diff.json');
        const currentSnapshot = readJsonIfExists<GraphSnapshot>(snapshotPath);
        const graphDiff = readJsonIfExists<GraphDiff>(diffPath);
        if (!currentSnapshot) {
          return {
            error:
              'Graph snapshot not found. Run `decantr graph` from the project root, or `decantr graph --project <path>` from a workspace root.',
            expected_path: displayWorkspacePath(snapshotPath),
          };
        }
        const snapshotId = typeof args.snapshot_id === 'string' ? args.snapshot_id.trim() : '';
        if (args.snapshot_id !== undefined && typeof args.snapshot_id !== 'string') {
          return { error: 'Optional parameter "snapshot_id" must be a string.' };
        }
        const selected = readGraphSnapshotById(projectRoot, snapshotId || undefined);
        if (!selected.snapshot) {
          return {
            error: `Graph snapshot not found in local history: ${snapshotId}`,
            expected_path: displayWorkspacePath(selected.path),
            current_snapshot_id: currentSnapshot.id,
            history: readGraphSnapshotHistory(projectRoot),
          };
        }
        const snapshot = selected.snapshot;
        const snapshotHistoryPath = graphSnapshotHistoryPath(projectRoot, snapshot.id);
        let comparison: {
          from: string;
          to: string;
          summary: ReturnType<typeof summarizeGraphDiff>;
          ops?: GraphDiff['ops'];
          ops_truncated?: boolean;
          limit?: number;
        } | null = null;
        if (args.compare_to !== undefined && typeof args.compare_to !== 'string') {
          return { error: 'Optional parameter "compare_to" must be a string.' };
        }
        const compareTo = typeof args.compare_to === 'string' ? args.compare_to.trim() : '';
        if (compareTo) {
          const baseline = readGraphSnapshotById(projectRoot, compareTo);
          if (!baseline.snapshot) {
            return {
              error: `Comparison graph snapshot not found in local history: ${compareTo}`,
              expected_path: displayWorkspacePath(baseline.path),
              current_snapshot_id: currentSnapshot.id,
              selected_snapshot_id: snapshot.id,
              history: readGraphSnapshotHistory(projectRoot),
            };
          }
          const diff = diffGraphSnapshots(baseline.snapshot, snapshot);
          const limit = graphToolLimit(args);
          comparison = {
            from: baseline.snapshot.id,
            to: snapshot.id,
            summary: summarizeGraphDiff(diff),
            ...(args.include_diff_ops === true
              ? {
                  ops: diff.ops.slice(0, limit),
                  ops_truncated: diff.ops.length > limit,
                  limit,
                }
              : {}),
          };
        }

        const route = typeof args.route === 'string' ? args.route : undefined;
        const task = typeof args.task === 'string' ? args.task : '';
        if (args.node_id !== undefined && typeof args.node_id !== 'string') {
          return { error: 'Optional parameter "node_id" must be a string.' };
        }
        if (args.file_path !== undefined && typeof args.file_path !== 'string') {
          return { error: 'Optional parameter "file_path" must be a string.' };
        }
        const nodeId = typeof args.node_id === 'string' ? args.node_id.trim() : '';
        const filePath = typeof args.file_path === 'string' ? args.file_path.trim() : '';
        const fileNodeId = graphSourceNodeIdForFile(projectRoot, snapshot, filePath || undefined);
        if (filePath && !fileNodeId) {
          return {
            error: `Source file not found in graph snapshot: ${filePath}`,
            snapshot_id: snapshot.id,
            available_routes: graphAvailableRoutes(snapshot),
            available_source_artifacts: graphAvailableSourceArtifacts(snapshot),
          };
        }
        if (route) {
          const subgraph = buildGraphRouteContext(snapshot, route, { task });
          if (!subgraph) {
            return {
              error: `Route not found in graph snapshot: ${route}`,
              snapshot_id: snapshot.id,
              available_routes: graphAvailableRoutes(snapshot),
            };
          }
          return {
            source: 'local_graph',
            artifact_path: displayWorkspacePath(selected.path),
            current_snapshot_id: currentSnapshot.id,
            snapshot_id: snapshot.id,
            schema_version: snapshot.schema_version,
            project_id: snapshot.project_id,
            source_hash: snapshot.source_hash,
            route,
            comparison,
            ranking: subgraph.ranking,
            summary: subgraph.summary,
            route_node: subgraph.routeNode,
            ids: subgraph.ids,
            ranked: subgraph.ranked,
            nodes: subgraph.nodes,
            edges: subgraph.edges,
          };
        }

        const impactSeedIds = [
          ...new Set([nodeId, fileNodeId].filter((value): value is string => Boolean(value))),
        ];
        if (impactSeedIds.length > 0) {
          const limit = graphToolLimit(args);
          const impact = buildGraphImpactContext(snapshot, impactSeedIds, { task, limit });
          if (!impact) {
            return {
              error: `Impact seed not found in graph snapshot: ${impactSeedIds.join(', ')}`,
              snapshot_id: snapshot.id,
              available_routes: graphAvailableRoutes(snapshot),
              available_source_artifacts: graphAvailableSourceArtifacts(snapshot),
            };
          }
          return {
            source: 'local_graph',
            artifact_path: displayWorkspacePath(selected.path),
            current_snapshot_id: currentSnapshot.id,
            snapshot_id: snapshot.id,
            schema_version: snapshot.schema_version,
            project_id: snapshot.project_id,
            source_hash: snapshot.source_hash,
            node_id: nodeId || undefined,
            file_path: filePath || undefined,
            resolved_node_ids: impactSeedIds,
            comparison,
            ranking: impact.ranking,
            summary: impact.summary,
            seed_nodes: impact.seedNodes,
            missing_node_ids: impact.missingNodeIds,
            ids: impact.ids,
            ranked: impact.ranked,
            nodes: impact.nodes,
            edges: impact.edges,
          };
        }

        if (args.include_full === true) {
          return {
            source: 'local_graph',
            artifact_path: displayWorkspacePath(selected.path),
            current_snapshot_id: currentSnapshot.id,
            comparison,
            snapshot,
          };
        }

        return {
          source: 'local_graph',
          artifact_path: displayWorkspacePath(selected.path),
          snapshot_history_path: displayWorkspacePath(snapshotHistoryPath),
          snapshot_history_present: existsSync(snapshotHistoryPath),
          snapshot_history_count: graphSnapshotHistoryCount(projectRoot),
          current_snapshot_id: currentSnapshot.id,
          snapshot_id: snapshot.id,
          schema_version: snapshot.schema_version,
          project_id: snapshot.project_id,
          created_at: snapshot.created_at,
          source_hash: snapshot.source_hash,
          summary: snapshot.summary,
          history:
            args.include_history === true ? readGraphSnapshotHistory(projectRoot) : undefined,
          diff_summary:
            !snapshotId || snapshot.id === currentSnapshot.id
              ? graphDiff
                ? summarizeGraphDiff(graphDiff)
                : null
              : null,
          comparison,
          available_routes: graphAvailableRoutes(snapshot),
        };
      } catch (e) {
        return { error: `Could not read graph snapshot: ${(e as Error).message}` };
      }
    }

    case 'decantr_query_graph': {
      try {
        const projectRoot = graphProjectRoot(args);
        const snapshotId = typeof args.snapshot_id === 'string' ? args.snapshot_id.trim() : '';
        if (args.snapshot_id !== undefined && typeof args.snapshot_id !== 'string') {
          return { error: 'Optional parameter "snapshot_id" must be a string.' };
        }
        const selected = readGraphSnapshotById(projectRoot, snapshotId || undefined);
        const snapshotPath = selected.path;
        const snapshot = selected.snapshot;
        if (!snapshot) {
          return {
            error:
              snapshotId && snapshotId !== 'current'
                ? `Graph snapshot not found: ${snapshotId}. Run \`decantr graph\` to generate snapshot history.`
                : 'Graph snapshot not found. Run `decantr graph` from the project root, or `decantr graph --project <path>` from a workspace root.',
            expected_path: displayWorkspacePath(snapshotPath),
          };
        }
        const currentSnapshot = readMcpGraphSnapshot(projectRoot);

        const nodeIds = stringListArg(args, 'node_ids');
        if (nodeIds.error) return { error: nodeIds.error };
        if (args.file_path !== undefined && typeof args.file_path !== 'string') {
          return { error: 'Optional parameter "file_path" must be a string.' };
        }
        const filePath = typeof args.file_path === 'string' ? args.file_path.trim() : '';
        const fileNodeId = graphSourceNodeIdForFile(projectRoot, snapshot, filePath || undefined);
        if (filePath && !fileNodeId) {
          return {
            error: `Source file not found in graph snapshot: ${filePath}`,
            snapshot_id: snapshot.id,
            available_routes: graphAvailableRoutes(snapshot),
            available_source_artifacts: graphAvailableSourceArtifacts(snapshot),
          };
        }
        const resolvedNodeIds = [
          ...new Set([...(nodeIds.values ?? []), ...(fileNodeId ? [fileNodeId] : [])]),
        ];
        const nodeType = graphNodeTypeArg(args, 'node_type');
        if (nodeType.error) return { error: nodeType.error };
        const nodeTypes = graphNodeTypesArg(args, 'node_types');
        if (nodeTypes.error) return { error: nodeTypes.error };
        const relation = graphRelationArg(args, 'relation');
        if (relation.error) return { error: relation.error };
        const relations = graphRelationsArg(args, 'relations');
        if (relations.error) return { error: relations.error };
        const payloadFilter = graphPayloadFilterArgs(args);
        if (payloadFilter.error) return { error: payloadFilter.error };
        if (args.task !== undefined && typeof args.task !== 'string') {
          return { error: 'Optional parameter "task" must be a string.' };
        }

        const edgeSrc = typeof args.edge_src === 'string' ? args.edge_src.trim() : undefined;
        const edgeDst = typeof args.edge_dst === 'string' ? args.edge_dst.trim() : undefined;
        if (args.edge_src !== undefined && typeof args.edge_src !== 'string') {
          return { error: 'Optional parameter "edge_src" must be a string.' };
        }
        if (args.edge_dst !== undefined && typeof args.edge_dst !== 'string') {
          return { error: 'Optional parameter "edge_dst" must be a string.' };
        }

        const hasNodeSelector =
          resolvedNodeIds.length > 0 ||
          !!nodeType.value ||
          !!nodeTypes.values?.length ||
          !!payloadFilter.key ||
          !!payloadFilter.contains;
        const hasEdgeSelector =
          !!edgeSrc || !!edgeDst || !!relation.value || !!relations.values?.length;
        if (!hasNodeSelector && !hasEdgeSelector) {
          return {
            error:
              'Provide at least one graph selector: node_ids, file_path, node_type, node_types, payload_key, payload_contains, edge_src, edge_dst, relation, or relations.',
          };
        }

        const store = createMemoryGraphStore({
          nodes: snapshot.nodes,
          edges: snapshot.edges,
          snapshots: [snapshot],
        });
        const limit = graphToolLimit(args);

        let nodes: GraphNode[] = [];
        let edges: GraphEdge[] = [];
        if (hasNodeSelector) {
          nodes = await store.queryNodes({
            ids: resolvedNodeIds.length > 0 ? resolvedNodeIds : undefined,
            type: nodeType.value,
            types: nodeTypes.values,
            payloadKey: payloadFilter.key,
            payloadValue: payloadFilter.value,
            payloadContains: payloadFilter.contains,
          });
        }

        if (hasEdgeSelector) {
          edges = await store.queryEdges({
            src: edgeSrc,
            dst: edgeDst,
            relation: relation.value,
            relations: relations.values,
          });
        }

        const shouldIncludeEdges = args.include_edges === true || hasEdgeSelector;
        const nodeMap = new Map(nodes.map((node) => [node.id, node]));
        if (shouldIncludeEdges && hasNodeSelector) {
          const selectedIds = new Set(nodeMap.keys());
          edges = dedupeGraphEdges([
            ...edges,
            ...snapshot.edges.filter(
              (edge) => selectedIds.has(edge.src) || selectedIds.has(edge.dst),
            ),
          ]);
        }

        for (const edge of edges) {
          const srcNode = snapshot.nodes.find((node) => node.id === edge.src);
          const dstNode = snapshot.nodes.find((node) => node.id === edge.dst);
          if (srcNode) nodeMap.set(srcNode.id, srcNode);
          if (dstNode) nodeMap.set(dstNode.id, dstNode);
        }

        nodes = dedupeGraphNodes([...nodeMap.values()]);
        edges = dedupeGraphEdges(edges);
        const limited = limitGraphSubgraph(nodes, edges, limit);
        const impact =
          args.include_impact === true && limited.nodes.length > 0
            ? buildGraphImpactContext(
                snapshot,
                limited.nodes.map((node) => node.id),
                {
                  task: typeof args.task === 'string' ? args.task : undefined,
                  limit,
                },
              )
            : null;

        return {
          source: 'local_graph',
          artifact_path: displayWorkspacePath(snapshotPath),
          current_snapshot_id: currentSnapshot?.id ?? null,
          snapshot_id: snapshot.id,
          schema_version: snapshot.schema_version,
          project_id: snapshot.project_id,
          source_hash: snapshot.source_hash,
          query: {
            node_ids: resolvedNodeIds.length > 0 ? resolvedNodeIds : nodeIds.values,
            file_path: filePath || undefined,
            node_type: nodeType.value,
            node_types: nodeTypes.values,
            payload_key: payloadFilter.key,
            payload_value: payloadFilter.value,
            payload_contains: payloadFilter.contains,
            edge_src: edgeSrc,
            edge_dst: edgeDst,
            relation: relation.value,
            relations: relations.values,
            include_edges: shouldIncludeEdges,
            include_impact: args.include_impact === true,
            task: typeof args.task === 'string' ? args.task : undefined,
            limit,
          },
          summary: {
            nodes: limited.nodes.length,
            edges: limited.edges.length,
            total_nodes: nodes.length,
            total_edges: edges.length,
            truncated: limited.truncated,
          },
          nodes: limited.nodes,
          edges: limited.edges,
          impact,
        };
      } catch (e) {
        return { error: `Could not query graph snapshot: ${(e as Error).message}` };
      }
    }

    case 'decantr_traverse_graph': {
      try {
        const projectRoot = graphProjectRoot(args);
        const snapshotId = typeof args.snapshot_id === 'string' ? args.snapshot_id.trim() : '';
        if (args.snapshot_id !== undefined && typeof args.snapshot_id !== 'string') {
          return { error: 'Optional parameter "snapshot_id" must be a string.' };
        }
        const selected = readGraphSnapshotById(projectRoot, snapshotId || undefined);
        const snapshotPath = selected.path;
        const snapshot = selected.snapshot;
        if (!snapshot) {
          return {
            error:
              snapshotId && snapshotId !== 'current'
                ? `Graph snapshot not found: ${snapshotId}. Run \`decantr graph\` to generate snapshot history.`
                : 'Graph snapshot not found. Run `decantr graph` from the project root, or `decantr graph --project <path>` from a workspace root.',
            expected_path: displayWorkspacePath(snapshotPath),
          };
        }
        const currentSnapshot = readMcpGraphSnapshot(projectRoot);

        const fromIds = stringListArg(args, 'from_ids');
        if (fromIds.error) return { error: fromIds.error };
        const from = typeof args.from === 'string' && args.from.trim() ? [args.from.trim()] : [];
        if (args.from !== undefined && typeof args.from !== 'string') {
          return { error: 'Optional parameter "from" must be a string.' };
        }
        if (args.file_path !== undefined && typeof args.file_path !== 'string') {
          return { error: 'Optional parameter "file_path" must be a string.' };
        }
        const filePath = typeof args.file_path === 'string' ? args.file_path.trim() : '';
        const fileNodeId = graphSourceNodeIdForFile(projectRoot, snapshot, filePath || undefined);
        if (filePath && !fileNodeId) {
          return {
            error: `Source file not found in graph snapshot: ${filePath}`,
            snapshot_id: snapshot.id,
            available_routes: graphAvailableRoutes(snapshot),
            available_source_artifacts: graphAvailableSourceArtifacts(snapshot),
          };
        }
        const startIds = [
          ...new Set([...from, ...(fromIds.values ?? []), ...(fileNodeId ? [fileNodeId] : [])]),
        ];
        if (!startIds.length) {
          return { error: 'Provide a graph start node with "from", "from_ids", or "file_path".' };
        }

        const missingStartIds = startIds.filter(
          (id) => !snapshot.nodes.some((node) => node.id === id),
        );
        if (missingStartIds.length) {
          return {
            error: `Start node not found in graph snapshot: ${missingStartIds.join(', ')}`,
            snapshot_id: snapshot.id,
            available_routes: graphAvailableRoutes(snapshot),
            available_source_artifacts: graphAvailableSourceArtifacts(snapshot),
          };
        }

        const relations = graphRelationsArg(args, 'relations');
        if (relations.error) return { error: relations.error };
        const direction = graphTraverseDirectionArg(args);
        if (direction.error) return { error: direction.error };
        const depth = graphTraverseDepthArg(args);
        if (depth.error) return { error: depth.error };

        const store = createMemoryGraphStore({
          nodes: snapshot.nodes,
          edges: snapshot.edges,
          snapshots: [snapshot],
        });
        const result = await store.traverse({
          from: startIds,
          relations: relations.values,
          direction: direction.value,
          depth: depth.value,
        });
        const limit = graphToolLimit(args);
        const limited = limitGraphSubgraph(result.nodes, result.edges, limit);

        return {
          source: 'local_graph',
          artifact_path: displayWorkspacePath(snapshotPath),
          current_snapshot_id: currentSnapshot?.id ?? null,
          snapshot_id: snapshot.id,
          schema_version: snapshot.schema_version,
          project_id: snapshot.project_id,
          source_hash: snapshot.source_hash,
          traversal: {
            from: startIds,
            file_path: filePath || undefined,
            resolved_node_ids: startIds,
            relations: relations.values,
            direction: direction.value ?? 'out',
            depth: depth.value,
            limit,
          },
          summary: {
            nodes: limited.nodes.length,
            edges: limited.edges.length,
            total_nodes: result.nodes.length,
            total_edges: result.edges.length,
            truncated: limited.truncated,
          },
          nodes: limited.nodes,
          edges: limited.edges,
        };
      } catch (e) {
        return { error: `Could not traverse graph snapshot: ${(e as Error).message}` };
      }
    }

    case 'decantr_get_scaffold_context': {
      const projectRoot = graphProjectRoot(args);
      const contextDir = join(projectRoot, '.decantr', 'context');
      const manifestPath = join(contextDir, 'pack-manifest.json');
      const scaffoldContextPath = join(contextDir, 'scaffold.md');
      const taskContextPath = join(contextDir, 'task-scaffold.md');
      const packMarkdownPath = join(contextDir, 'scaffold-pack.md');
      const packJsonPath = join(contextDir, 'scaffold-pack.json');

      const hasAnyContext =
        existsSync(scaffoldContextPath) ||
        existsSync(taskContextPath) ||
        existsSync(packMarkdownPath) ||
        existsSync(packJsonPath) ||
        existsSync(manifestPath);

      if (!hasAnyContext) {
        const [hostedScaffold, hostedReview] = await Promise.all([
          loadHostedSelectedExecutionPackFallback({
            ...args,
            pack_type: 'scaffold',
          }),
          loadHostedSelectedExecutionPackFallback({
            ...args,
            pack_type: 'review',
          }),
        ]);

        const scaffoldSelected = hostedScaffold.selected;
        const reviewSelected = hostedReview.selected;
        if (scaffoldSelected && reviewSelected) {
          const scaffoldPayload = toHostedExecutionPackPayload(scaffoldSelected.pack);
          const reviewPayload = toHostedExecutionPackPayload(reviewSelected.pack);
          return {
            source: 'hosted_fallback' as PackSource,
            task_context: null,
            scaffold_context: scaffoldPayload.markdown,
            execution_pack: scaffoldPayload,
            review_pack: reviewPayload,
            pack_manifest: scaffoldSelected.manifest,
            available_sections: scaffoldSelected.manifest.sections.map((section) => ({
              id: section.id,
              page_ids: section.pageIds,
            })),
            available_pages: scaffoldSelected.manifest.pages.map((page) => ({
              id: page.id,
              section_id: page.sectionId,
            })),
            available_mutations: (scaffoldSelected.manifest.mutations ?? []).map((mutation) => ({
              id: mutation.id,
              mutation_type: mutation.mutationType,
            })),
            note: 'Using hosted selected execution packs because local scaffold context artifacts were not found; scaffold pack markdown is being reused as readable scaffold context.',
          };
        }

        const hosted = await loadHostedExecutionPackBundleFallback(args);
        if (!hosted.bundle) {
          return {
            error:
              'Scaffold context not found. Run `decantr refresh` or `decantr content compile-packs --write-context` to materialize scaffold context and execution packs.',
            hosted_fallback_error: hosted.error ?? hostedScaffold.error ?? hostedReview.error,
          };
        }

        const scaffoldPayload = toHostedExecutionPackPayload(hosted.bundle.scaffold);
        const reviewPayload = toHostedExecutionPackPayload(hosted.bundle.review);
        return {
          source: 'hosted_fallback' as PackSource,
          task_context: null,
          scaffold_context: scaffoldPayload.markdown,
          execution_pack: scaffoldPayload,
          review_pack: reviewPayload,
          pack_manifest: hosted.bundle.manifest,
          available_sections: hosted.bundle.manifest.sections.map((section) => ({
            id: section.id,
            page_ids: section.pageIds,
          })),
          available_pages: hosted.bundle.manifest.pages.map((page) => ({
            id: page.id,
            section_id: page.sectionId,
          })),
          available_mutations: (hosted.bundle.manifest.mutations ?? []).map((mutation) => ({
            id: mutation.id,
            mutation_type: mutation.mutationType,
          })),
          note: 'Using hosted compiled execution packs because local scaffold context artifacts were not found; scaffold pack markdown is being reused as readable scaffold context.',
        };
      }

      let manifest: PackManifest | null = null;
      if (existsSync(manifestPath)) {
        try {
          manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as PackManifest;
        } catch (e) {
          return { error: `Failed to read pack manifest: ${(e as Error).message}` };
        }
      }

      const scaffoldPack = readLocalContextPack(
        contextDir,
        manifest?.scaffold ?? {
          id: 'scaffold',
          markdown: 'scaffold-pack.md',
          json: 'scaffold-pack.json',
        },
      );
      const reviewPack = readLocalContextPack(
        contextDir,
        manifest?.review ?? {
          id: 'review',
          markdown: 'review-pack.md',
          json: 'review-pack.json',
        },
      );
      const scaffoldNarrativePath = existingContextFile(contextDir, 'scaffold.md');
      const taskNarrativePath = existingContextFile(contextDir, 'task-scaffold.md');

      return {
        source: 'local' as PackSource,
        task_context: taskNarrativePath ? readFileSync(taskNarrativePath, 'utf-8') : null,
        scaffold_context: scaffoldNarrativePath
          ? readFileSync(scaffoldNarrativePath, 'utf-8')
          : scaffoldPack.markdown,
        execution_pack: {
          markdown: scaffoldPack.markdown,
          json: scaffoldPack.json,
        },
        review_pack: {
          markdown: reviewPack.markdown,
          json: reviewPack.json,
        },
        pack_manifest: manifest,
        available_sections:
          manifest?.sections.map((section) => ({ id: section.id, page_ids: section.pageIds })) ??
          [],
        available_pages:
          manifest?.pages.map((page) => ({ id: page.id, section_id: page.sectionId })) ?? [],
        available_mutations:
          manifest?.mutations?.map((mutation) => ({
            id: mutation.id,
            mutation_type: mutation.mutationType,
          })) ?? [],
      };
    }

    case 'decantr_get_section_context': {
      const err = validateStringArg(args, 'section_id');
      if (err) return { error: err };
      const sectionId = args.section_id as string;
      const projectRoot = graphProjectRoot(args);

      // Read the essence
      let essence: EssenceFile;
      try {
        const result = await readEssenceFile(join(projectRoot, 'decantr.essence.json'));
        essence = result.essence;
      } catch {
        return { error: 'No valid essence file found. Run decantr init first.' };
      }

      if (!isV4(essence)) {
        return {
          error: 'Section context requires Essence v4.0.0. Run `decantr migrate --to v4` first.',
        };
      }

      // Find the section
      const sections = essence.blueprint.sections || [];
      const section = sections.find((s) => s.id === sectionId);
      if (!section) {
        return {
          error: `Section "${sectionId}" not found.`,
          available_sections: sections.map((s) => ({
            id: s.id,
            role: s.role,
            pages: s.pages.length,
          })),
        };
      }

      const contextDir = join(projectRoot, '.decantr', 'context');
      const localExecutionPackFiles = readLocalContextPack(contextDir, {
        id: sectionId,
        markdown: `section-${sectionId}-pack.md`,
        json: `section-${sectionId}-pack.json`,
      });
      const localExecutionPack = {
        markdown: localExecutionPackFiles.markdown,
        json: localExecutionPackFiles.json,
      };
      const contextPath = existingContextFile(contextDir, `section-${sectionId}.md`);
      let executionPack = localExecutionPack;
      let executionPackSource: PackSource | null = hasExecutionPackPayload(localExecutionPack)
        ? 'local'
        : null;
      let hostedFallbackError: string | null = null;

      if (!executionPackSource && !contextPath) {
        const hosted = await loadHostedSelectedExecutionPackFallback({
          ...args,
          pack_type: 'section',
          id: sectionId,
        });
        hostedFallbackError = hosted.error;
        if (hosted.selected) {
          executionPack = toHostedExecutionPackPayload(hosted.selected.pack);
          executionPackSource = 'hosted_fallback';
        }
      }

      // Read the section context file if it exists
      if (contextPath) {
        return {
          section_id: sectionId,
          role: section.role,
          shell: section.shell,
          features: section.features,
          pages: section.pages.map((p) => ({ id: p.id, route: p.route, layout: p.layout })),
          context: readFileSync(contextPath, 'utf-8'),
          execution_pack_source: executionPackSource,
          execution_pack: executionPack,
        };
      }

      // Fallback: return structured section data
      const derivedContext = executionPack.markdown;
      return {
        section_id: sectionId,
        role: section.role,
        shell: section.shell,
        features: section.features,
        description: section.description,
        pages: section.pages.map((p) => ({ id: p.id, route: p.route, layout: p.layout })),
        context: derivedContext,
        execution_pack_source: executionPackSource,
        execution_pack: executionPack,
        note:
          executionPackSource === 'hosted_fallback'
            ? 'Section context file not found. Using hosted compiled execution pack fallback as the readable section context.'
            : `Section context file not found. Run \`decantr refresh\` or \`decantr content get-pack section ${sectionId} --write-context\` to generate it.`,
        hosted_fallback_error: executionPackSource ? undefined : hostedFallbackError,
      };
    }

    case 'decantr_get_page_context': {
      const err = validateStringArg(args, 'page_id');
      if (err) return { error: err };
      const pageId = args.page_id as string;
      const projectRoot = graphProjectRoot(args);
      const contextDir = join(projectRoot, '.decantr', 'context');
      const manifestPath = join(contextDir, 'pack-manifest.json');
      let manifest: PackManifest | null = null;
      let manifestSource: PackSource | null = null;
      let hostedPageSelection: HostedSelectedExecutionPack | null = null;
      let hostedSectionSelection: HostedSelectedExecutionPack | null = null;
      let hostedFallbackError: string | null = null;

      const loadHostedPageSelection = async () => {
        if (hostedPageSelection) {
          return hostedPageSelection;
        }
        const hosted = await loadHostedSelectedExecutionPackFallback({
          ...args,
          pack_type: 'page',
          id: pageId,
        });
        hostedFallbackError = hosted.error;
        hostedPageSelection = hosted.selected;
        return hostedPageSelection;
      };

      const loadHostedSectionSelection = async (sectionId: string) => {
        if (hostedSectionSelection && hostedSectionSelection.selector.id === sectionId) {
          return hostedSectionSelection;
        }
        const hosted = await loadHostedSelectedExecutionPackFallback({
          ...args,
          pack_type: 'section',
          id: sectionId,
        });
        hostedFallbackError = hosted.error;
        hostedSectionSelection = hosted.selected;
        return hostedSectionSelection;
      };

      if (existsSync(manifestPath)) {
        try {
          manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as PackManifest;
          manifestSource = 'local';
        } catch (e) {
          return { error: `Failed to read pack manifest: ${(e as Error).message}` };
        }
      }

      if (!manifest) {
        const hosted = await loadHostedPageSelection();
        if (!hosted) {
          return {
            error:
              'Execution pack manifest not found. Run `decantr refresh` or `decantr content get-pack manifest --write-context` to generate compiled packs.',
            hosted_fallback_error: hostedFallbackError,
          };
        }
        manifest = hosted.manifest as PackManifest;
        manifestSource = 'hosted_fallback';
      }

      let pageEntry = manifest.pages.find((page) => page.id === pageId) ?? null;
      if (!pageEntry) {
        if (manifestSource === 'local') {
          const hosted = await loadHostedPageSelection();
          if (hosted) {
            manifest = hosted.manifest as PackManifest;
            manifestSource = 'hosted_fallback';
            pageEntry = manifest.pages.find((page) => page.id === pageId) ?? null;
          }
        }

        if (!pageEntry) {
          return {
            error: `Page "${pageId}" not found in execution pack manifest.`,
            available_pages: manifest.pages.map((page) => ({
              id: page.id,
              section_id: page.sectionId,
            })),
            hosted_fallback_error:
              manifestSource === 'hosted_fallback' ? undefined : hostedFallbackError,
          };
        }
      }

      let resolvedPageEntry = pageEntry;
      let sectionEntry = resolvedPageEntry.sectionId
        ? (manifest.sections.find((section) => section.id === resolvedPageEntry.sectionId) ?? null)
        : null;
      const localPageFiles =
        manifestSource === 'local'
          ? readLocalContextPack(contextDir, resolvedPageEntry)
          : readLocalContextPack(contextDir, null);
      const localPagePack = { markdown: localPageFiles.markdown, json: localPageFiles.json };
      const localSectionNarrativePath =
        manifestSource === 'local' && resolvedPageEntry.sectionId
          ? existingContextFile(contextDir, `section-${resolvedPageEntry.sectionId}.md`)
          : null;
      let executionPack = localPagePack;
      let executionPackSource: PackSource | null = hasExecutionPackPayload(localPagePack)
        ? 'local'
        : null;

      if (!executionPackSource && !localSectionNarrativePath) {
        const hosted = await loadHostedPageSelection();
        if (hosted) {
          manifest = hosted.manifest as PackManifest;
          manifestSource = 'hosted_fallback';
          resolvedPageEntry =
            manifest.pages.find((page) => page.id === pageId) ?? resolvedPageEntry;
          sectionEntry = resolvedPageEntry.sectionId
            ? (manifest.sections.find((section) => section.id === resolvedPageEntry.sectionId) ??
              sectionEntry)
            : null;
          executionPack = toHostedExecutionPackPayload(hosted.pack);
          executionPackSource = 'hosted_fallback';
        }
      }

      const localSectionFiles =
        manifestSource === 'local' && sectionEntry
          ? readLocalContextPack(contextDir, sectionEntry)
          : null;
      const localSectionPack = localSectionFiles
        ? { markdown: localSectionFiles.markdown, json: localSectionFiles.json }
        : null;
      let sectionExecutionPack = localSectionPack;
      let sectionExecutionPackSource: PackSource | null =
        localSectionPack && hasExecutionPackPayload(localSectionPack) ? 'local' : null;

      if (sectionEntry && !sectionExecutionPackSource && !localSectionNarrativePath) {
        const hosted = await loadHostedSectionSelection(sectionEntry.id);
        if (hosted) {
          sectionExecutionPack = toHostedExecutionPackPayload(hosted.pack);
          sectionExecutionPackSource = 'hosted_fallback';
        }
      }

      const sectionContextPath =
        manifestSource === 'local' && resolvedPageEntry.sectionId
          ? (localSectionNarrativePath ??
            existingContextFile(contextDir, `section-${resolvedPageEntry.sectionId}.md`))
          : null;
      const sectionNarrative = sectionContextPath
        ? readFileSync(sectionContextPath, 'utf-8')
        : null;

      return {
        page_id: pageId,
        page_context: executionPack.markdown ?? sectionNarrative,
        section_id: resolvedPageEntry.sectionId,
        section_role: resolvedPageEntry.sectionRole,
        manifest_source: manifestSource,
        execution_pack_source: executionPackSource,
        section_execution_pack_source: sectionExecutionPackSource,
        execution_pack: executionPack,
        section_execution_pack: sectionExecutionPack,
        section_context: sectionNarrative ?? sectionExecutionPack?.markdown ?? null,
        manifest: {
          page: resolvedPageEntry,
          section: sectionEntry,
        },
        note:
          manifestSource === 'hosted_fallback'
            ? 'Using hosted compiled execution-pack data because local page pack artifacts were missing or incomplete.'
            : undefined,
        hosted_fallback_error: hostedFallbackError ?? undefined,
      };
    }

    case 'decantr_prepare_task_context': {
      const projectRoot = graphProjectRoot(args);
      const projectArg =
        typeof args.project_path === 'string' && args.project_path.trim()
          ? args.project_path.trim()
          : null;
      const targetArg =
        typeof args.target === 'string' && args.target.trim() ? args.target.trim() : undefined;
      const routeArg =
        typeof args.route === 'string' && args.route.trim() ? args.route.trim() : undefined;
      const pageArg =
        typeof args.page_id === 'string' && args.page_id.trim() ? args.page_id.trim() : undefined;
      const task = typeof args.task === 'string' ? args.task : '';
      const detail = args.detail === 'full' ? 'full' : 'compact';
      if (!targetArg && !routeArg && !pageArg) {
        return { error: 'Provide target, route, or page_id.' };
      }
      if (targetArg && (routeArg || pageArg)) {
        return {
          error:
            'Provide target by itself, or use the compatibility route/page_id selectors without target.',
        };
      }

      const essencePath = join(projectRoot, 'decantr.essence.json');
      let essence: EssenceV4 | null = null;
      if (existsSync(essencePath)) {
        try {
          const result = await readEssenceFile(essencePath);
          if (!isV4(result.essence)) {
            return {
              error: 'Task context requires Essence v4.0.0. Run `decantr migrate --to v4` first.',
            };
          }
          essence = result.essence;
        } catch {
          return {
            error:
              'The existing decantr.essence.json is invalid. Repair it before requesting task context.',
          };
        }
      }

      let targetInput = targetArg ?? routeArg;
      if (!targetInput && pageArg) {
        if (!essence) {
          return {
            error:
              'page_id compatibility lookup requires Essence v4. Use target for discovery-backed UI surface context.',
          };
        }
        const matchingRoutes = Object.entries(essence.blueprint.routes ?? {})
          .filter(([, entry]) => entry.page === pageArg)
          .map(([route]) => route)
          .sort();
        if (matchingRoutes.length !== 1) {
          return {
            error:
              matchingRoutes.length === 0
                ? `Could not resolve page_id "${pageArg}" to an Essence route.`
                : `page_id "${pageArg}" resolves to multiple Essence routes. Provide route instead.`,
            available_routes: matchingRoutes,
          };
        }
        [targetInput] = matchingRoutes;
      }

      const liveDiscovery = discoverProject(projectRoot);
      const surfaceTask = resolveUISurfaceTaskContext(liveDiscovery, targetInput ?? '');
      const mappedSurfaceTask = mcpUISurfaceTaskContext(projectRoot, surfaceTask);
      const surface = surfaceTask.surface;
      const provenSource =
        surface?.authority === 'production-proven' || surface?.authority === 'project-reference';
      const hasImplementationRead = surfaceTask.read.some(
        (entry) => entry.role === 'implementation' && existsSync(join(projectRoot, entry.file)),
      );
      const targetIsBlocked =
        surfaceTask.status === 'blocked' ||
        surfaceTask.status === 'unsupported' ||
        !surface ||
        !provenSource ||
        surface.taskability === 'blocked' ||
        surface.taskability === 'not_applicable' ||
        !hasImplementationRead;
      if (targetIsBlocked) {
        const routeSelector = Boolean(targetInput?.startsWith('/'));
        const code =
          surfaceTask.candidates.length > 1
            ? 'UI_SURFACE_TARGET_AMBIGUOUS'
            : routeSelector
              ? 'DISCOVERY_NOT_PROVEN'
              : surfaceTask.status === 'unsupported'
                ? 'UI_SURFACE_UNSUPPORTED'
                : surface
                  ? 'UI_SURFACE_AUTHORITY_NOT_PROVEN'
                  : 'UI_SURFACE_TARGET_UNKNOWN';
        return {
          error: routeSelector
            ? `Route-scoped task context is not proven for ${targetInput}.`
            : `UI surface task context is not proven for ${targetInput ?? '(empty target)'}.`,
          code,
          mode: 'discovery',
          ...mappedSurfaceTask,
          discovery: mcpDiscoverySummary(projectRoot, liveDiscovery),
          ...(routeSelector
            ? {
                route: targetInput,
                readiness: evaluateDiscoveryReadiness(liveDiscovery),
                route_authority: liveDiscovery.routes.authority,
                route_completeness: liveDiscovery.routes.completeness,
                authority_files: liveDiscovery.routes.authorityFiles,
                limitations: liveDiscovery.routes.limitations,
              }
            : {}),
        };
      }

      const projectJson = readJsonIfExists<{
        initialized?: { workflowMode?: string; adoptionMode?: string };
      }>(join(projectRoot, '.decantr', 'project.json'));
      const workflowMode = projectJson?.initialized?.workflowMode;
      const verifyCommand = !essence
        ? projectArg
          ? `decantr scan --project ${projectArg} --json`
          : 'decantr scan --json'
        : workflowMode?.startsWith('greenfield')
          ? projectArg
            ? `decantr verify --project ${projectArg}`
            : 'decantr verify'
          : workflowMode === 'hybrid-compose'
            ? projectArg
              ? `decantr verify --project ${projectArg} --local-patterns`
              : 'decantr verify --local-patterns'
            : projectArg
              ? `decantr verify --project ${projectArg} --brownfield --local-patterns`
              : 'decantr verify --brownfield --local-patterns';
      const discoveryTaskResponse = {
        ...mappedSurfaceTask,
        mode: 'discovery' as const,
        task: task || null,
        discovery: mcpDiscoverySummary(projectRoot, liveDiscovery),
        stopConditions: [
          'The selected surface no longer resolves to production or project-reference source.',
          'Runtime behavior contradicts the static authority evidence.',
          'The requested change requires files outside the bounded read set.',
        ],
        verify_command: verifyCommand,
      };
      if (!essence || surface.kind !== 'route') {
        return discoveryTaskResponse;
      }

      const resolvedRoute = surface.name;
      const routeEntry = essence.blueprint.routes?.[resolvedRoute] ?? null;
      const sectionId = routeEntry?.section;
      const pageId = pageArg ?? routeEntry?.page;
      const section = sectionId
        ? essence.blueprint.sections.find((entry) => entry.id === sectionId)
        : essence.blueprint.sections.find((entry) =>
            entry.pages.some((page) => page.id === pageId),
          );
      const page = section?.pages.find((entry) => entry.id === pageId) ?? null;
      if (!routeEntry || !section || !page || !pageId || routeEntry.page !== pageId) {
        return {
          error:
            'Live UI surface authority does not resolve to the requested Essence section page.',
          code: 'ESSENCE_TARGET_MISMATCH',
          target: resolvedRoute,
          available_routes: Object.keys(essence.blueprint.routes ?? {}).sort(),
          available_pages: essence.blueprint.sections.flatMap((entry) =>
            entry.pages.map((pageEntry) => ({ section_id: entry.id, page_id: pageEntry.id })),
          ),
        };
      }

      const contextDir = join(projectRoot, '.decantr', 'context');
      const manifest = readJsonIfExists<PackManifest>(join(contextDir, 'pack-manifest.json'));
      const pageManifest = manifest?.pages.find((entry) => entry.id === pageId) ?? null;
      const sectionManifest = manifest?.sections.find((entry) => entry.id === section.id) ?? null;
      const pagePack = readLocalContextPack(contextDir, pageManifest);
      const sectionPack = readLocalContextPack(contextDir, sectionManifest);
      const scaffoldPack = readLocalContextPack(contextDir, manifest?.scaffold);
      const pagePackJson = pagePack.json;
      const sectionPackJson = sectionPack.json;
      const pagePackMarkdown = pagePack.markdown;
      const sectionContextPath = existingContextFile(contextDir, `section-${section.id}.md`);
      const scaffoldNarrativePath = existingContextFile(contextDir, 'scaffold.md');
      const sectionContext = sectionContextPath ? readFileSync(sectionContextPath, 'utf-8') : null;
      const pagePackSummary = summarizePackJson(pagePackJson);
      const sectionPackSummary = summarizePackJson(sectionPackJson);
      const visualManifest = readJsonIfExists<{
        routes?: Array<{
          route?: string;
          screenshot?: string | null;
          screenshotHash?: string | null;
          status?: string;
          error?: string;
        }>;
      }>(join(projectRoot, '.decantr', 'evidence', 'visual-manifest.json'));
      const visualRoute =
        visualManifest?.routes?.find((entry) => entry.route === resolvedRoute) ??
        visualManifest?.routes?.find((entry) =>
          entry.screenshot?.includes(routeSlug(resolvedRoute ?? pageId)),
        ) ??
        null;
      const health = readJsonIfExists<{
        baselinePath?: string;
        savedAt?: string | null;
        statusChanged?: boolean;
        scoreDelta?: number | null;
        addedFindings?: string[];
        resolvedFindings?: string[];
        changedRoutes?: string[];
        changedScreenshots?: string[];
        contractDrift?: string[];
      }>(join(projectRoot, '.decantr', 'health-baseline-diff.json'));
      const themeInventory = readJsonIfExists<Record<string, unknown>>(
        join(projectRoot, '.decantr', 'theme-inventory.json'),
      );
      const localLaw = localLawSummary(projectRoot);
      const styleBridge = styleBridgeSummary(projectRoot);
      const displayedLocalLaw = {
        ...localLaw,
        patterns_path: displayProjectFile(projectRoot, localLaw.patterns_path),
        rules_path: displayProjectFile(projectRoot, localLaw.rules_path),
      };
      const displayedStyleBridge = {
        ...styleBridge,
        path: displayProjectFile(projectRoot, styleBridge.path),
      };
      const changedFiles = changedFilesForTask(projectRoot);
      const changedRoutes = impactedRoutesForFiles(liveDiscovery, changedFiles);
      const routeSourceFile =
        surfaceTask.read.find((entry) => entry.role === 'implementation')?.file ?? null;
      const patternIds = extractPagePatternIds(page);
      const ranked = rankPatternCandidates(
        {
          query: [
            task,
            resolvedRoute,
            (page as { description?: string }).description,
            ...patternIds,
          ]
            .filter(Boolean)
            .join(' '),
          limit: 5,
        },
        patternIds.map((id) => patternToDiscoveryCandidate({ id, name: id, description: id })),
      );
      const typedGraph = buildTaskTypedGraphContext(projectRoot, resolvedRoute, task, changedFiles);
      const graphReady = Boolean(typedGraph?.route_context) && typedGraph?.current === true;
      if (!routeSourceFile || !existsSync(join(projectRoot, routeSourceFile))) {
        return {
          error: `Could not prove the implementation source for ${resolvedRoute}. Run decantr scan, then retry.`,
          code: 'UI_SURFACE_AUTHORITY_NOT_PROVEN',
        };
      }
      const selectedAppRoot = relative(process.cwd(), projectRoot).replace(/\\/g, '/') || '.';
      const routeImplementationPath = mcpTaskWorkspacePath(projectRoot, routeSourceFile);
      const capsuleTargetSpecs: Array<{
        path: string | null;
        kind: TaskCapsuleReadTargetV1['kind'];
        required: boolean;
      }> = [
        { path: routeImplementationPath, kind: 'route-implementation', required: true },
        {
          path: pagePack.markdownPath ? displayWorkspacePath(pagePack.markdownPath) : null,
          kind: 'route-layout',
          required: false,
        },
        {
          path: sectionPack.markdownPath
            ? displayWorkspacePath(sectionPack.markdownPath)
            : sectionContextPath
              ? displayWorkspacePath(sectionContextPath)
              : null,
          kind: 'route-layout',
          required: false,
        },
        {
          path: scaffoldPack.markdownPath
            ? displayWorkspacePath(scaffoldPack.markdownPath)
            : scaffoldNarrativePath
              ? displayWorkspacePath(scaffoldNarrativePath)
              : null,
          kind: 'contract',
          required: false,
        },
        {
          path: existsSync(join(projectRoot, 'DECANTR.md'))
            ? mcpTaskWorkspacePath(projectRoot, 'DECANTR.md')
            : null,
          kind: 'local-law',
          required: false,
        },
        {
          path: displayedLocalLaw.patterns_path,
          kind: 'local-law',
          required: false,
        },
        {
          path: displayedLocalLaw.rules_path,
          kind: 'local-law',
          required: false,
        },
        {
          path: displayedStyleBridge.path,
          kind: 'style-bridge',
          required: false,
        },
        {
          path: typedGraph
            ? mcpTaskWorkspacePath(projectRoot, '.decantr/graph/graph.snapshot.json')
            : null,
          kind: 'graph',
          required: false,
        },
      ];
      const seenCapsuleTargets = new Set<string>();
      const capsuleReadTargets = capsuleTargetSpecs.flatMap((target) => {
        if (!target.path || seenCapsuleTargets.has(target.path)) return [];
        seenCapsuleTargets.add(target.path);
        return [{ ...target, path: target.path, rank: seenCapsuleTargets.size }];
      });
      const contentGuidance = mcpTaskContentGuidance(patternIds);
      const hasLocalLawAuthority = localLaw.patterns.length > 0 || localLaw.rules.length > 0;
      const adoptionMode = projectJson?.initialized?.adoptionMode ?? null;
      const hasStyleBridgeAuthority = adoptionMode === 'style-bridge' && Boolean(styleBridge.path);
      const hasSelectedPackContext = Boolean(
        pagePack.markdownPath ||
          pagePack.jsonPath ||
          sectionPack.markdownPath ||
          sectionPack.jsonPath ||
          scaffoldPack.markdownPath ||
          scaffoldPack.jsonPath,
      );
      const taskAuthority = taskAuthoritySummary({
        workflowMode: workflowMode ?? null,
        adoptionMode,
        localLaw,
        styleBridge,
        hasPackManifest: hasSelectedPackContext,
        task,
      });
      const activeAuthorityLane: TaskCapsuleAuthorityLane = hasStyleBridgeAuthority
        ? 'style-bridge'
        : workflowMode?.startsWith('greenfield')
          ? 'essence-contract'
          : hasLocalLawAuthority
            ? 'local-law'
            : 'production-source';
      const authorityEntries = [
        {
          lane: 'production-source' as const,
          summary: taskAuthority.source_authority,
          sourcePath: routeImplementationPath,
        },
        {
          lane: 'essence-contract' as const,
          summary: 'Essence V4 declares the governed route, page, shell, and pattern intent.',
          sourcePath: mcpTaskWorkspacePath(projectRoot, 'decantr.essence.json'),
        },
        ...(hasLocalLawAuthority
          ? [
              {
                lane: 'local-law' as const,
                summary: 'Accepted project-owned patterns and rules override advisory guidance.',
                sourcePath:
                  localLaw.rules.length > 0
                    ? displayedLocalLaw.rules_path
                    : displayedLocalLaw.patterns_path,
              },
            ]
          : []),
        ...(hasStyleBridgeAuthority
          ? [
              {
                lane: 'style-bridge' as const,
                summary: taskAuthority.style_authority,
                sourcePath: displayedStyleBridge.path,
              },
            ]
          : []),
        ...(contentGuidance.length > 0
          ? [
              {
                lane: 'official-guidance' as const,
                summary: 'Official @decantr/content records are advisory below project-owned law.',
                sourcePath: null,
              },
            ]
          : []),
      ];
      const routeGraphNodes =
        typedGraph?.route_context && 'nodes' in typedGraph.route_context
          ? typedGraph.route_context.nodes
          : [];
      const staleGraphPaths =
        typedGraph?.stale_sources.map((source) => mcpTaskWorkspacePath(projectRoot, source.path)) ??
        [];
      if (typedGraph && !graphReady && staleGraphPaths.length === 0) {
        staleGraphPaths.push('Graph manifest freshness could not be proven.');
      }
      const capsuleInput: CreateTaskCapsuleV1Input = {
        project: {
          identity: createStableProjectIdentityV1(projectRoot),
          workspaceRoot: '.',
          selectedAppRoot,
        },
        task: {
          request: task || `Implement the governed ${resolvedRoute ?? pageId} route task.`,
          route: resolvedRoute,
        },
        graph: {
          snapshotId: typedGraph?.snapshot_id ?? null,
          sourceHash: typedGraph?.source_hash ?? null,
          freshness: graphReady ? 'fresh' : typedGraph ? 'stale' : 'missing',
          limitations: staleGraphPaths,
        },
        readTargets: capsuleReadTargets,
        authority: { activeLane: activeAuthorityLane, entries: authorityEntries },
        impact: {
          changedFiles: changedFiles.map((path) => mcpTaskWorkspacePath(projectRoot, path)),
          changedRoutes,
          nodeIds: [
            ...(typedGraph?.changed_file_context?.resolved_node_ids ?? []),
            ...(typedGraph?.changed_file_context?.impact?.ranked.map((node) => node.id) ?? []),
          ],
          unresolvedFiles:
            typedGraph?.changed_file_context?.missing_files.map((path) =>
              mcpTaskWorkspacePath(projectRoot, path),
            ) ?? [],
        },
        findings: mcpTaskGraphFindings(routeGraphNodes),
        contentGuidance,
        stopConditions: [
          'Runtime source and Decantr context disagree.',
          'The route graph cannot resolve a source file affected by the edit.',
          'A fix requires contract/source/local-law mutation outside the explicit workflow.',
        ],
        verifyCommand,
      };
      let capsule = createTaskCapsuleV1(capsuleInput);
      const loopState = graphReady ? 'ready_to_edit' : 'blocked_missing_graph';
      const loop = {
        $schema: LOOP_READINESS_V2_SCHEMA_URL,
        schemaVersion: 2,
        state: loopState,
        status: loopState === 'ready_to_edit' ? 'healthy' : 'blocked',
        verdict:
          loopState === 'ready_to_edit'
            ? 'Task context is ready for an agent edit.'
            : 'Task context is missing route graph evidence.',
        summary: `${resolvedRoute ?? pageId} governed task context.`,
        authority: {
          activeLane: capsule.authority.activeLane,
          summary:
            'Use production source first in Brownfield, accepted local law/style bridge next, Essence V4 structure after that, and official content packs as advisory.',
          stopRule:
            'If runtime source and Decantr context disagree, stop and report drift instead of guessing.',
        },
        evidenceTier: {
          schemaVersion: 2,
          stage: graphReady ? 'graph' : 'static',
          status: loopState === 'ready_to_edit' ? 'healthy' : 'incomplete',
          capabilities: graphReady
            ? ['static-audit', 'project-health', 'typed-graph']
            : ['static-audit', 'project-health'],
          coverage: {
            declaredRoutes: 1,
            runtimeRoutesChecked: 0,
            findingsAnchored: typedGraph?.route_context?.summary.openFindings ?? 0,
            findingsWithRepairPlan: 0,
            runtimeProbeCount: 0,
            visualArtifactCount: visualRoute ? 1 : 0,
          },
          confidence: {
            level: graphReady ? 'moderate' : 'low',
            score: graphReady ? 0.64 : 0.32,
            reasons: [
              graphReady
                ? 'current route graph context is present'
                : typedGraph?.route_context
                  ? 'route graph context is stale'
                  : 'route graph context is missing',
              visualRoute
                ? 'visual evidence reference is available'
                : 'no visual evidence reference was found',
            ],
          },
        },
        blockingReasons: loopState === 'ready_to_edit' ? [] : ['Route graph context is missing.'],
        nextActions:
          loopState === 'ready_to_edit'
            ? ['Edit only after reading the returned context, then run the verify command.']
            : ['Run `decantr graph`, then request task context again.'],
        maker: {
          title: 'Maker instructions',
          instructions: [
            'Read returned route, section, local-law, style-bridge, and graph context before editing.',
            'Preserve the active authority lane and production behavior outside this task.',
            'Stop and report drift when runtime source and Decantr context disagree.',
          ],
        },
        checker: {
          title: 'Checker instructions',
          instructions: [
            'Rerun the verify command after edits.',
            'Use typed graph impact to decide whether nearby routes need review.',
            'Treat advisory critique as warning-level unless runtime evidence proves a failure.',
          ],
        },
        readTargets: capsule.readTargets.map((target) => target.path),
        graphImpact: {
          status:
            capsule.graph.freshness === 'fresh'
              ? 'ready'
              : capsule.graph.freshness === 'stale'
                ? 'stale'
                : 'missing',
          snapshotId: capsule.graph.snapshotId,
          sourceHash: capsule.graph.sourceHash,
          sourceArtifactCount: typedGraph?.route_context?.summary.sourceArtifacts ?? 0,
          staleArtifacts: typedGraph?.stale_sources ?? [],
        },
        stopConditions: capsule.stopConditions,
        verifyCommand: capsule.verifyCommand,
      };

      const compactTypedGraph = typedGraph
        ? {
            source: typedGraph.source,
            artifact_path: typedGraph.artifact_path,
            snapshot_id: typedGraph.snapshot_id,
            schema_version: typedGraph.schema_version,
            project_id: typedGraph.project_id,
            source_hash: typedGraph.source_hash,
            current: typedGraph.current,
            stale_sources: typedGraph.stale_sources.slice(0, 6),
            contract: typedGraph.contract,
            route_context:
              typedGraph.route_context && 'ranking' in typedGraph.route_context
                ? {
                    route: typedGraph.route_context.route,
                    ranking: typedGraph.route_context.ranking,
                    summary: typedGraph.route_context.summary,
                    ids: typedGraph.route_context.ids,
                    ranked: typedGraph.route_context.ranked.slice(0, 6),
                    truncated: true,
                  }
                : typedGraph.route_context,
            changed_file_context: typedGraph.changed_file_context
              ? {
                  changed_files: typedGraph.changed_file_context.changed_files.slice(0, 20),
                  resolved_node_ids: typedGraph.changed_file_context.resolved_node_ids.slice(0, 20),
                  missing_files: typedGraph.changed_file_context.missing_files.slice(0, 20),
                  impact: typedGraph.changed_file_context.impact
                    ? {
                        ranking: typedGraph.changed_file_context.impact.ranking,
                        summary: typedGraph.changed_file_context.impact.summary,
                        ids: typedGraph.changed_file_context.impact.ids,
                        ranked: typedGraph.changed_file_context.impact.ranked.slice(0, 6),
                        truncated: true,
                      }
                    : null,
                }
              : null,
          }
        : null;
      const returnedLocalLaw =
        detail === 'full'
          ? displayedLocalLaw
          : {
              ...displayedLocalLaw,
              patterns: displayedLocalLaw.patterns.slice(0, 4),
              behavior_obligations: displayedLocalLaw.behavior_obligations.slice(0, 4),
              rules: displayedLocalLaw.rules.slice(0, 6),
            };
      const returnedStyleBridge =
        detail === 'full'
          ? displayedStyleBridge
          : { ...displayedStyleBridge, mappings: displayedStyleBridge.mappings.slice(0, 4) };

      const response = {
        task_capsule_version: MCP_TASK_CAPSULE_VERSION,
        task_capsule_budget: capsule.budget,
        task_capsule_truncation: capsule.truncation,
        task_capsule_digest: `sha256:${createHash('sha256')
          .update(canonicalJsonStringify(capsule), 'utf8')
          .digest('hex')}`,
        response_detail: detail,
        discovery: mcpTaskDiscoverySummary(projectRoot, liveDiscovery),
        ui_surface_task: {
          schemaVersion: mappedSurfaceTask.schemaVersion,
          target: mappedSurfaceTask.target,
          status: mappedSurfaceTask.status,
          surface: mappedSurfaceTask.surface
            ? {
                id: mappedSurfaceTask.surface.id,
                kind: mappedSurfaceTask.surface.kind,
                name: mappedSurfaceTask.surface.name,
                files: mappedSurfaceTask.surface.files,
                authority: mappedSurfaceTask.surface.authority,
                taskability: mappedSurfaceTask.surface.taskability,
                confidence: mappedSurfaceTask.surface.confidence,
              }
            : null,
          authority: { reasons: mappedSurfaceTask.authority.reasons },
        },
        route: resolvedRoute,
        page_id: pageId,
        section_id: section.id,
        section_role: section.role,
        shell: section.shell,
        task: capsule.task.request,
        visual_target:
          pagePackSummary.visualTarget ??
          sectionPackSummary.visualTarget ??
          essence.dna.personality?.join('. ') ??
          null,
        directives: pagePackSummary.directives.slice(0, detail === 'full' ? undefined : 8),
        patterns: (pagePackSummary.patterns.length > 0
          ? pagePackSummary.patterns
          : patternIds
        ).slice(0, detail === 'full' ? undefined : 8),
        ranked_patterns: ranked.map((match) => ({
          id: match.candidate.slug || match.candidate.id,
          score: match.score,
          reasons: match.reasons,
        })),
        shared_components: pagePackSummary.sharedComponents.slice(
          0,
          detail === 'full' ? undefined : 20,
        ),
        section_context:
          detail === 'full' ? sectionContext : (sectionContext?.slice(0, 1200) ?? null),
        page_pack_excerpt: pagePackMarkdown
          ? pagePackMarkdown.slice(0, detail === 'full' ? 12000 : 1200)
          : null,
        health_evidence: health
          ? {
              baseline_path: displayProjectFile(projectRoot, health.baselinePath),
              saved_at: health.savedAt,
              status_changed: health.statusChanged,
              score_delta: health.scoreDelta,
              added_findings: health.addedFindings?.slice(0, 8) ?? [],
              resolved_findings: health.resolvedFindings?.slice(0, 8) ?? [],
              changed_routes: health.changedRoutes?.slice(0, 20) ?? [],
              changed_screenshots: (health.changedScreenshots ?? [])
                .map((path) => displayProjectFile(projectRoot, path))
                .filter((path): path is string => Boolean(path)),
              contract_drift: health.contractDrift?.slice(0, 8) ?? [],
            }
          : null,
        visual_evidence: visualRoute
          ? {
              screenshot: displayProjectFile(projectRoot, visualRoute.screenshot),
              screenshot_hash: visualRoute.screenshotHash ?? null,
              status: visualRoute.status ?? null,
              error: visualRoute.error ?? null,
            }
          : null,
        theme_inventory: themeInventory
          ? {
              modes: Array.isArray(themeInventory.modes)
                ? themeInventory.modes.slice(0, detail === 'full' ? undefined : 8)
                : themeInventory.modes,
              variants: Array.isArray(themeInventory.variants)
                ? themeInventory.variants.slice(0, detail === 'full' ? undefined : 8)
                : themeInventory.variants,
              path: displayProjectFile(projectRoot, '.decantr/theme-inventory.json'),
            }
          : null,
        local_law: returnedLocalLaw,
        style_bridge: returnedStyleBridge,
        authority: { ...taskAuthority, active_lane: capsule.authority.activeLane },
        change_impact: {
          changed_files: changedFiles.slice(0, 40),
          changed_file_count: changedFiles.length,
          impacted_routes: changedRoutes,
        },
        typed_graph: detail === 'full' ? typedGraph : compactTypedGraph,
        loop,
        verify_command: capsule.verifyCommand,
        local_files: {
          page_pack: pagePack.markdownPath ? displayWorkspacePath(pagePack.markdownPath) : null,
          section_pack: sectionPack.markdownPath
            ? displayWorkspacePath(sectionPack.markdownPath)
            : null,
          graph_snapshot: existsSync(join(projectRoot, '.decantr', 'graph', 'graph.snapshot.json'))
            ? displayProjectFile(projectRoot, '.decantr/graph/graph.snapshot.json')
            : null,
          section_context: sectionContextPath ? displayWorkspacePath(sectionContextPath) : null,
          local_patterns: displayedLocalLaw.patterns_path,
          local_rules: displayedLocalLaw.rules_path,
          style_bridge: displayedStyleBridge.path,
          visual_manifest: existsSync(
            join(projectRoot, '.decantr', 'evidence', 'visual-manifest.json'),
          )
            ? displayProjectFile(projectRoot, '.decantr/evidence/visual-manifest.json')
            : null,
        },
      };
      let responseBytes = trimMcpTaskCompatibilityPayload(
        response as unknown as Record<string, unknown>,
      );
      for (
        let iteration = 0;
        responseBytes > MCP_TASK_PAYLOAD_MAX_CANONICAL_BYTES && iteration < 12;
        iteration += 1
      ) {
        const overflow = responseBytes - MCP_TASK_PAYLOAD_MAX_CANONICAL_BYTES;
        const nextMaxCanonicalBytes = Math.max(
          1,
          Math.min(
            capsule.budget.maxCanonicalBytes - 1,
            capsule.budget.canonicalBytes - overflow - 64,
          ),
        );
        const nextMaxEstimatedTokens = Math.max(
          1,
          Math.min(
            capsule.budget.maxEstimatedTokens,
            Math.floor(nextMaxCanonicalBytes / TASK_CAPSULE_TOKEN_ESTIMATE_BYTES_PER_TOKEN),
          ),
        );
        try {
          capsule = createTaskCapsuleV1({
            ...capsuleInput,
            budget: {
              maxCanonicalBytes: nextMaxCanonicalBytes,
              maxEstimatedTokens: nextMaxEstimatedTokens,
            },
          });
        } catch (error) {
          throw new Error(
            `MCP task payload cannot fit the canonical task capsule within ${MCP_TASK_PAYLOAD_MAX_CANONICAL_BYTES} bytes: ${(error as Error).message}`,
          );
        }

        response.task_capsule_budget = capsule.budget;
        response.task_capsule_truncation = capsule.truncation;
        response.task_capsule_digest = `sha256:${createHash('sha256')
          .update(canonicalJsonStringify(capsule), 'utf8')
          .digest('hex')}`;
        response.task = capsule.task.request;
        response.authority.active_lane = capsule.authority.activeLane;
        loop.authority.activeLane = capsule.authority.activeLane;
        loop.readTargets = capsule.readTargets.map((target) => target.path);
        loop.stopConditions = capsule.stopConditions;
        loop.verifyCommand = capsule.verifyCommand;
        response.verify_command = capsule.verifyCommand;
        responseBytes = trimMcpTaskCompatibilityPayload(
          response as unknown as Record<string, unknown>,
        );
      }
      if (responseBytes > MCP_TASK_PAYLOAD_MAX_CANONICAL_BYTES) {
        throw new Error(
          `MCP task payload exceeds ${MCP_TASK_PAYLOAD_MAX_CANONICAL_BYTES} canonical UTF-8 bytes after deterministic pruning.`,
        );
      }
      if (response.task !== capsule.task.request) {
        throw new Error('MCP task payload diverged from the canonical TaskCapsule request.');
      }
      return response;
    }

    case 'decantr_get_execution_pack': {
      const projectRoot = graphProjectRoot(args);
      const contextDir = join(projectRoot, '.decantr', 'context');
      const manifestPath = join(contextDir, 'pack-manifest.json');
      let manifest: PackManifest | null = null;
      let manifestSource: PackSource | null = null;
      let hostedSelectedPack: HostedSelectedExecutionPack | null = null;
      let hostedFallbackError: string | null = null;
      const packType = (args.pack_type as string | undefined) ?? 'manifest';

      if (existsSync(manifestPath)) {
        try {
          manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as PackManifest;
          manifestSource = 'local';
        } catch (e) {
          return { error: `Failed to read pack manifest: ${(e as Error).message}` };
        }
      }

      if (!manifest && packType === 'manifest') {
        const hostedManifest = await loadHostedExecutionPackManifestFallback(args);
        hostedFallbackError = hostedManifest.error;

        if (hostedManifest.manifest) {
          manifest = hostedManifest.manifest as PackManifest;
          manifestSource = 'hosted_fallback';
        } else {
          const hosted = await loadHostedExecutionPackBundleFallback(args);
          hostedFallbackError = hosted.error;
          if (!hosted.bundle) {
            return {
              error:
                'Execution pack manifest not found. Run `decantr refresh` or `decantr content get-pack manifest --write-context` to generate compiled packs.',
              hosted_fallback_error: hosted.error,
            };
          }
          manifest = hosted.bundle.manifest as PackManifest;
          manifestSource = 'hosted_fallback';
        }
      }

      if (packType === 'manifest') {
        return {
          ...manifest,
          source: manifestSource,
        };
      }

      if (!manifest) {
        const hosted = await loadHostedSelectedExecutionPackFallback(args);
        hostedSelectedPack = hosted.selected;
        hostedFallbackError = hosted.error;
        if (!hosted.selected) {
          return {
            error:
              'Execution pack manifest not found. Run `decantr refresh` or `decantr content get-pack manifest --write-context` to generate compiled packs.',
            hosted_fallback_error: hosted.error,
          };
        }
        manifest = hosted.selected.manifest as PackManifest;
        manifestSource = 'hosted_fallback';
      }

      const format = (args.format as string | undefined) ?? 'both';
      let entry: PackManifestEntry | null = null;
      let availableIds: string[] = [];

      if (packType === 'scaffold') {
        entry = manifest.scaffold;
      } else if (packType === 'review') {
        entry = manifest.review ?? null;
      } else if (packType === 'mutation') {
        availableIds = (manifest.mutations ?? []).map((mutation) => mutation.id);
        const idErr = validateStringArg(args, 'id');
        if (idErr) return { error: idErr, available_ids: availableIds };
        entry = (manifest.mutations ?? []).find((mutation) => mutation.id === args.id) ?? null;
      } else if (packType === 'section') {
        availableIds = manifest.sections.map((section) => section.id);
        const idErr = validateStringArg(args, 'id');
        if (idErr) return { error: idErr, available_ids: availableIds };
        entry = manifest.sections.find((section) => section.id === args.id) ?? null;
      } else if (packType === 'page') {
        availableIds = manifest.pages.map((page) => page.id);
        const idErr = validateStringArg(args, 'id');
        if (idErr) return { error: idErr, available_ids: availableIds };
        entry = manifest.pages.find((page) => page.id === args.id) ?? null;
      } else {
        return { error: `Unsupported pack type: ${packType}` };
      }

      if (!entry) {
        if (manifestSource === 'local') {
          const hosted = await loadHostedSelectedExecutionPackFallback(args);
          hostedSelectedPack = hosted.selected;
          hostedFallbackError = hosted.error;
          if (hosted.selected) {
            manifest = hosted.selected.manifest as PackManifest;
            manifestSource = 'hosted_fallback';
            entry = findManifestEntryForPack(
              manifest,
              packType as 'scaffold' | 'review' | 'section' | 'page' | 'mutation',
              args.id as string | undefined,
            );
          }
        }

        if (!entry) {
          return {
            error: `Execution pack not found for type "${packType}"${args.id ? ` and id "${args.id as string}"` : ''}.`,
            available_ids: availableIds,
            hosted_fallback_error: hostedFallbackError ?? undefined,
          };
        }
      }

      const result: Record<string, unknown> = {
        pack_type: packType,
        id: entry.id,
        manifest: entry,
        source: manifestSource,
      };

      const localPayload = {
        markdown: null as string | null,
        json: null as unknown,
      };

      if (manifestSource === 'local') {
        if (format === 'markdown' || format === 'both') {
          const markdownPath = existingContextFile(contextDir, entry.markdown);
          if (markdownPath) {
            localPayload.markdown = readFileSync(markdownPath, 'utf-8');
          }
        }

        if (format === 'json' || format === 'both') {
          const jsonPath = existingContextFile(contextDir, entry.json);
          if (jsonPath) {
            localPayload.json = readJsonIfExists<unknown>(jsonPath);
          }
        }
      }

      if (hasExecutionPackPayload(localPayload)) {
        if (format === 'markdown' || format === 'both') {
          result.markdown = localPayload.markdown;
        }
        if (format === 'json' || format === 'both') {
          result.json = localPayload.json;
        }
        return result;
      }

      if (!hostedSelectedPack) {
        const hosted = await loadHostedSelectedExecutionPackFallback(args);
        hostedSelectedPack = hosted.selected;
        hostedFallbackError = hosted.error;
      }

      if (!hostedSelectedPack) {
        return {
          ...result,
          hosted_fallback_error: hostedFallbackError ?? undefined,
        };
      }

      manifest = hostedSelectedPack.manifest as PackManifest;
      manifestSource = 'hosted_fallback';
      const hostedPayload = toHostedExecutionPackPayload(hostedSelectedPack.pack);
      const hostedEntry = findManifestEntryForPack(
        manifest,
        packType as 'scaffold' | 'review' | 'section' | 'page' | 'mutation',
        args.id as string | undefined,
      );
      result.source = manifestSource;
      result.manifest = hostedEntry;
      result.id = hostedEntry?.id ?? entry.id;

      if (format === 'markdown' || format === 'both') {
        result.markdown = hostedPayload.markdown;
      }
      if (format === 'json' || format === 'both') {
        result.json = hostedPayload.json;
      }

      return result;
    }

    case 'decantr_get_showcase_benchmarks': {
      const view = (args.view as string | undefined) ?? 'shortlist';
      if (!['manifest', 'shortlist', 'verification'].includes(view)) {
        return { error: `Unsupported showcase benchmark view: ${view}` };
      }

      return getShowcaseBenchmarkPayload(view);
    }

    case 'decantr_get_registry_intelligence_summary': {
      if (args.namespace != null && typeof args.namespace !== 'string') {
        return { error: 'Invalid namespace. Must be a string when provided.' };
      }

      return getRegistryIntelligenceSummaryPayload(args.namespace as string | undefined);
    }

    case 'decantr_compile_execution_packs': {
      if (args.path != null && typeof args.path !== 'string') {
        return { error: 'Invalid path. Must be a string when provided.' };
      }
      if (args.namespace != null && typeof args.namespace !== 'string') {
        return { error: 'Invalid namespace. Must be a string when provided.' };
      }
      if (
        args.essence != null &&
        (typeof args.essence !== 'object' || Array.isArray(args.essence))
      ) {
        return { error: 'Invalid essence. Must be an object when provided.' };
      }

      return getHostedExecutionPackBundlePayload(args);
    }

    case 'decantr_critique': {
      const err = validateStringArg(args, 'file_path');
      if (err) return { error: err };
      if (args.path != null && typeof args.path !== 'string') {
        return { error: 'Invalid path. Must be a string when provided.' };
      }
      if (args.namespace != null && typeof args.namespace !== 'string') {
        return { error: 'Invalid namespace. Must be a string when provided.' };
      }
      if (args.treatments_path != null && typeof args.treatments_path !== 'string') {
        return { error: 'Invalid treatments_path. Must be a string when provided.' };
      }
      if (args.allow_hosted_upload != null && typeof args.allow_hosted_upload !== 'boolean') {
        return { error: 'Invalid allow_hosted_upload. Must be a boolean when provided.' };
      }
      const { critiqueFile } = await import('./critique.js');
      const localReviewPackPath = join(process.cwd(), '.decantr', 'context', 'review-pack.json');
      if (existsSync(localReviewPackPath)) {
        return critiqueFile(args.file_path as string, process.cwd());
      }

      return critiqueFile(args.file_path as string, process.cwd());
    }

    case 'decantr_audit_project': {
      if (args.path != null && typeof args.path !== 'string') {
        return { error: 'Invalid path. Must be a string when provided.' };
      }
      if (args.namespace != null && typeof args.namespace !== 'string') {
        return { error: 'Invalid namespace. Must be a string when provided.' };
      }
      if (args.dist_path != null && typeof args.dist_path !== 'string') {
        return { error: 'Invalid dist_path. Must be a string when provided.' };
      }
      if (args.sources_path != null && typeof args.sources_path !== 'string') {
        return { error: 'Invalid sources_path. Must be a string when provided.' };
      }
      if (args.allow_hosted_upload != null && typeof args.allow_hosted_upload !== 'boolean') {
        return { error: 'Invalid allow_hosted_upload. Must be a boolean when provided.' };
      }
      const { auditProject } = await import('@decantr/verifier');
      const projectRoot = process.cwd();
      const hasReviewPack = existsSync(
        join(projectRoot, '.decantr', 'context', 'review-pack.json'),
      );
      const hasPackManifest = existsSync(
        join(projectRoot, '.decantr', 'context', 'pack-manifest.json'),
      );

      if (hasReviewPack && hasPackManifest) {
        return auditProject(projectRoot);
      }

      return auditProject(projectRoot);
    }

    case 'decantr_get_findings': {
      if (
        args.severity != null &&
        args.severity !== 'error' &&
        args.severity !== 'warn' &&
        args.severity !== 'info'
      ) {
        return { error: 'Invalid severity. Must be one of: error, warn, info.' };
      }
      const findingSources: ProjectHealthFindingSource[] = [
        'audit',
        'assertion',
        'browser',
        'check',
        'brownfield',
        'design-token',
        'style-bridge',
        'graph',
        'runtime',
        'pack',
        'interaction',
      ];
      if (
        args.source != null &&
        (typeof args.source !== 'string' ||
          !findingSources.includes(args.source as ProjectHealthFindingSource))
      ) {
        return { error: `Invalid source. Must be one of: ${findingSources.join(', ')}.` };
      }
      if (args.code != null && typeof args.code !== 'string') {
        return { error: 'Invalid code. Must be a string when provided.' };
      }
      if (args.include_prompts != null && typeof args.include_prompts !== 'boolean') {
        return { error: 'Invalid include_prompts. Must be a boolean when provided.' };
      }
      if (args.limit != null && (typeof args.limit !== 'number' || !Number.isFinite(args.limit))) {
        return { error: 'Invalid limit. Must be a finite number when provided.' };
      }

      try {
        const projectRoot = resolveMcpProjectRoot(args.project_path);
        const state = await getMcpHealthState(projectRoot);
        const severity = args.severity as VerificationSeverity | undefined;
        const source = args.source as ProjectHealthFindingSource | undefined;
        const code = typeof args.code === 'string' ? args.code : undefined;
        const includePrompts = args.include_prompts === true;
        const limit =
          typeof args.limit === 'number' ? Math.max(1, Math.min(200, Math.floor(args.limit))) : 50;
        const filtered = state.report.findings.filter((finding) => {
          if (severity && finding.severity !== severity) return false;
          if (source && finding.source !== source) return false;
          if (code && finding.code !== code) return false;
          return true;
        });
        const findings = filtered
          .slice(0, limit)
          .map((finding) => compactMcpFinding(finding, includePrompts));

        return {
          project: state.evidence.project,
          health: state.evidence.health,
          filters: {
            severity,
            source,
            code,
            include_prompts: includePrompts,
            limit,
          },
          summary: {
            status: state.report.status,
            score: state.report.score,
            total_findings: state.report.findings.length,
            matched_findings: filtered.length,
            returned_findings: findings.length,
            truncated: filtered.length > findings.length,
          },
          findings,
        };
      } catch (error) {
        return { error: (error as Error).message };
      }
    }

    case 'decantr_get_repair_plan': {
      if (args.finding_id != null && typeof args.finding_id !== 'string') {
        return { error: 'Invalid finding_id. Must be a string when provided.' };
      }
      if (args.code != null && typeof args.code !== 'string') {
        return { error: 'Invalid code. Must be a string when provided.' };
      }
      if (args.include_prompt != null && typeof args.include_prompt !== 'boolean') {
        return { error: 'Invalid include_prompt. Must be a boolean when provided.' };
      }
      try {
        const projectRoot = resolveMcpProjectRoot(args.project_path);
        const state = await getMcpHealthState(projectRoot);
        const finding = selectMcpRepairFinding(state.report, {
          findingId: typeof args.finding_id === 'string' ? args.finding_id : undefined,
          code: typeof args.code === 'string' ? args.code : undefined,
        });
        return buildMcpRepairPlan({
          evidence: state.evidence,
          finding,
          projectRoot,
          includePrompt: args.include_prompt === true,
        });
      } catch (error) {
        return { error: (error as Error).message };
      }
    }

    case 'decantr_get_evidence_bundle': {
      try {
        const projectRoot = resolveMcpProjectRoot(args.project_path);
        const state = await getMcpHealthState(projectRoot);
        return { ...state.evidence, discovery: mcpDiscoverySummary(projectRoot) };
      } catch (error) {
        return { error: (error as Error).message };
      }
    }

    case 'decantr_workspace_health': {
      if (args.workspace_root != null && typeof args.workspace_root !== 'string') {
        return { error: 'Invalid workspace_root. Must be a string when provided.' };
      }
      if (
        args.max_projects != null &&
        (typeof args.max_projects !== 'number' || !Number.isFinite(args.max_projects))
      ) {
        return { error: 'Invalid max_projects. Must be a finite number when provided.' };
      }
      try {
        return await getMcpWorkspaceHealth(args);
      } catch (error) {
        return { error: (error as Error).message };
      }
    }

    case 'decantr_get_repair_prompt': {
      if (args.finding_id != null && typeof args.finding_id !== 'string') {
        return { error: 'Invalid finding_id. Must be a string when provided.' };
      }
      try {
        const projectRoot = resolveMcpProjectRoot(args.project_path);
        const state = await getMcpHealthState(projectRoot);
        const finding = selectMcpRepairFinding(state.report, {
          findingId: typeof args.finding_id === 'string' ? args.finding_id : undefined,
        });
        if (!finding) {
          return {
            project: state.evidence.project,
            health: state.evidence.health,
            prompt: null,
            message: 'No Project Health findings require repair.',
            commands: ['decantr health --evidence'],
          };
        }
        return {
          project: state.evidence.project,
          discovery: mcpDiscoverySummary(projectRoot),
          health: state.evidence.health,
          finding: {
            id: finding.id,
            source: finding.source,
            severity: finding.severity,
            category: finding.category,
            message: finding.message,
          },
          prompt: finding.remediation.prompt,
          commands: finding.remediation.commands,
        };
      } catch (error) {
        return { error: (error as Error).message };
      }
    }

    case 'decantr_run_health_loop': {
      if (args.finding_id != null && typeof args.finding_id !== 'string') {
        return { error: 'Invalid finding_id. Must be a string when provided.' };
      }
      try {
        const projectRoot = resolveMcpProjectRoot(args.project_path);
        const state = await getMcpHealthState(projectRoot);
        const finding = selectMcpRepairFinding(state.report, {
          findingId: typeof args.finding_id === 'string' ? args.finding_id : undefined,
        });
        return {
          project: state.evidence.project,
          health: state.evidence.health,
          loop: state.report.loop,
          authority_resolution: state.report.authority,
          evidence_tier: state.report.evidenceTier,
          report: state.report,
          evidence: state.evidence,
          repair_plan: buildMcpRepairPlan({
            evidence: state.evidence,
            finding,
            projectRoot,
          }),
          repair:
            finding === null
              ? {
                  finding: null,
                  prompt: null,
                  commands: ['decantr health --evidence'],
                  message: 'No Project Health findings require repair.',
                }
              : {
                  finding: {
                    id: finding.id,
                    source: finding.source,
                    severity: finding.severity,
                    category: finding.category,
                    message: finding.message,
                  },
                  prompt: finding.remediation.prompt,
                  commands: finding.remediation.commands,
                },
        };
      } catch (error) {
        return { error: (error as Error).message };
      }
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// --- Internal helpers for accept_drift ---

function listEssencePages(essence: EssenceV4): Array<BlueprintPage & { sectionId: string }> {
  return essence.blueprint.sections.flatMap((section) =>
    section.pages.map((page) => ({ ...page, sectionId: section.id })),
  );
}

function getMutablePage(
  essence: EssenceV4,
  id: string,
  sectionId?: string,
): {
  page: BlueprintPage;
  section: EssenceV4['blueprint']['sections'][number];
  index: number;
} | null {
  for (const section of essence.blueprint.sections) {
    if (sectionId && section.id !== sectionId) continue;
    const index = section.pages.findIndex((page) => page.id === id);
    if (index !== -1) {
      return { page: section.pages[index], section, index };
    }
  }
  return null;
}

function getDefaultSection(essence: EssenceV4): EssenceV4['blueprint']['sections'][number] {
  const section =
    essence.blueprint.sections.find((s) => s.role === 'primary') ?? essence.blueprint.sections[0];
  if (!section) {
    throw new Error('Essence v4 requires at least one blueprint section.');
  }
  return section;
}

function applyDriftAcceptance(
  essence: EssenceV4,
  violation: { rule: string; page_id?: string; details?: string },
  resolution: string,
  scope?: string,
): void {
  switch (violation.rule) {
    case 'theme-match':
    case 'theme':
    case 'style': {
      // Accept a theme change: update the DNA theme id
      if (violation.details) {
        essence.dna.theme.id = violation.details;
      }
      break;
    }
    case 'page-exists':
    case 'structure': {
      // Accept a missing page: add it to the blueprint
      if (violation.page_id) {
        const section = getDefaultSection(essence);
        const existing = getMutablePage(essence, violation.page_id);
        if (!existing) {
          section.pages.push({
            id: violation.page_id,
            layout: [],
          });
        }
      }
      break;
    }
    case 'layout': {
      // Layout drift: this is typically accept_scoped to a page
      // No automatic patch for layout acceptance — it's acknowledged
      break;
    }
    case 'density': {
      // density drift: acknowledged
      break;
    }
    default:
      break;
  }
}

// --- Internal helpers for update_essence ---

function applyEssenceUpdate(
  essence: EssenceV4,
  operation: string,
  payload: Record<string, unknown>,
): EssenceV4 {
  switch (operation) {
    case 'add_page': {
      const id = payload.id as string;
      if (!id) throw new Error('Payload must include "id" for add_page.');
      const sectionId = payload.section_id as string | undefined;
      const section = sectionId
        ? essence.blueprint.sections.find((candidate) => candidate.id === sectionId)
        : getDefaultSection(essence);
      if (!section) throw new Error(`Section "${sectionId}" not found.`);
      const existing = getMutablePage(essence, id, section.id);
      if (existing) throw new Error(`Page "${id}" already exists.`);
      section.pages.push({
        id,
        layout: (payload.layout as string[]) || [],
        ...(payload.route ? { route: payload.route as string } : {}),
        ...(payload.shell_override ? { shell_override: payload.shell_override as string } : {}),
        ...(payload.surface ? { surface: payload.surface as string } : {}),
      });
      break;
    }
    case 'remove_page': {
      const id = payload.id as string;
      if (!id) throw new Error('Payload must include "id" for remove_page.');
      const match = getMutablePage(essence, id, payload.section_id as string | undefined);
      if (!match) throw new Error(`Page "${id}" not found.`);
      match.section.pages.splice(match.index, 1);
      break;
    }
    case 'update_page_layout': {
      const id = payload.id as string;
      const layout = payload.layout as unknown[];
      if (!id) throw new Error('Payload must include "id" for update_page_layout.');
      if (!layout || !Array.isArray(layout))
        throw new Error('Payload must include "layout" array for update_page_layout.');
      const match = getMutablePage(essence, id, payload.section_id as string | undefined);
      if (!match) throw new Error(`Page "${id}" not found.`);
      match.page.layout = layout as BlueprintPage['layout'];
      break;
    }
    case 'update_dna': {
      // Shallow merge payload into dna
      for (const [key, value] of Object.entries(payload)) {
        if (
          key in essence.dna &&
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          // Deep merge one level for sub-objects like theme, spacing, etc.
          (essence.dna as Record<string, unknown>)[key] = {
            ...(essence.dna as Record<string, Record<string, unknown>>)[key],
            ...(value as Record<string, unknown>),
          };
        } else {
          (essence.dna as Record<string, unknown>)[key] = value;
        }
      }
      break;
    }
    case 'update_blueprint': {
      // Shallow merge payload into blueprint (except sections, managed via page/section operations)
      for (const [key, value] of Object.entries(payload)) {
        if (key === 'pages' || key === 'sections') continue;
        (essence.blueprint as Record<string, unknown>)[key] = value;
      }
      break;
    }
    case 'add_feature': {
      const feature = payload.feature as string;
      if (!feature) throw new Error('Payload must include "feature" for add_feature.');
      if (!essence.blueprint.features.includes(feature)) {
        essence.blueprint.features.push(feature);
      }
      break;
    }
    case 'remove_feature': {
      const feature = payload.feature as string;
      if (!feature) throw new Error('Payload must include "feature" for remove_feature.');
      const idx = essence.blueprint.features.indexOf(feature);
      if (idx === -1) throw new Error(`Feature "${feature}" not found.`);
      essence.blueprint.features.splice(idx, 1);
      break;
    }
  }
  return essence;
}

function describeUpdate(operation: string, payload: Record<string, unknown>): string {
  switch (operation) {
    case 'add_page':
      return `Added page "${payload.id}".`;
    case 'remove_page':
      return `Removed page "${payload.id}".`;
    case 'update_page_layout':
      return `Updated layout for page "${payload.id}".`;
    case 'update_dna':
      return `Updated DNA: ${Object.keys(payload).join(', ')}.`;
    case 'update_blueprint':
      return `Updated blueprint: ${Object.keys(payload).join(', ')}.`;
    case 'add_feature':
      return `Added feature "${payload.feature}".`;
    case 'remove_feature':
      return `Removed feature "${payload.feature}".`;
    default:
      return `Performed ${operation}.`;
  }
}
