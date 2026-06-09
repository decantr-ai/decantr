import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative } from 'node:path';
import {
  buildContractCapsuleFromSnapshot,
  buildGraphImpactContext,
  buildGraphRouteContext,
  buildGraphSnapshotFromEssence,
  type ContractCapsule,
  diffGraphSnapshots,
  GRAPH_DIFF_SCHEMA_URL,
  GRAPH_MANIFEST_SCHEMA_URL,
  GRAPH_SCHEMA_VERSION,
  type GraphDiff,
  type GraphEdge,
  type GraphImpactContext,
  type GraphManifest,
  type GraphNode,
  type GraphRouteContext,
  type GraphSnapshot,
  graphPayloadString,
  normalizeGraphSnapshot,
  type SourceArtifact,
  summarizeGraphDiff,
} from '@decantr/core';
import type { EssenceV4 } from '@decantr/essence-spec';
import { isV4 } from '@decantr/essence-spec';
import {
  auditComponentReuse,
  type ComponentReuseAudit,
  collectProjectSourceFiles,
} from '@decantr/verifier';
import {
  localPatternsPath,
  localRulesPath,
  readLocalPatternPack,
  readLocalRuleManifest,
  summarizeLocalPatternBehaviorObligations,
} from '../local-law.js';
import { readStyleBridge, styleBridgePath } from '../style-bridge.js';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

export interface GraphCommandOptions {
  check?: boolean;
  json?: boolean;
  displayRoot?: string;
  route?: string;
  task?: string;
  node?: string;
  file?: string;
  impact?: boolean;
  snapshotId?: string;
  compareTo?: string;
  includeDiffOps?: boolean;
  limit?: number;
  capsuleSourceLimit?: number;
}

interface BuildGraphArtifactsOptions {
  capsuleSourceLimit?: number;
}

interface GraphArtifactPaths {
  graphDir: string;
  snapshotsDir: string;
  snapshot: string;
  snapshotHistory: string;
  manifest: string;
  diff: string;
  capsule: string;
}

interface GraphArtifactBuild {
  projectRoot: string;
  paths: GraphArtifactPaths;
  snapshot: GraphSnapshot;
  manifest: GraphManifest;
  diff: GraphDiff;
  capsule: ContractCapsule;
  staleArtifacts: string[];
}

interface GraphSnapshotSelection {
  selector: string;
  path: string;
  snapshot: GraphSnapshot;
}

interface GraphComparisonPayload {
  from: string | undefined;
  to: string;
  summary: ReturnType<typeof summarizeGraphDiff>;
  ops?: GraphDiff['ops'];
  truncated?: boolean;
  limit?: number;
}

interface VisualManifestRoute {
  route: string;
  url?: string;
  screenshot: string | null;
  screenshotHash?: string | null;
  status: string;
  error?: string;
}

interface VisualManifest {
  version?: number;
  generatedAt?: string;
  localOnly?: boolean;
  baseUrl?: string | null;
  routes?: VisualManifestRoute[];
}

interface EvidenceBundleFinding {
  id: string;
  code?: string;
  source?: string;
  category?: string;
  severity?: string;
  message?: string;
  evidence?: string[];
  target?: string;
  rule?: string;
  suggestedFix?: string;
  graph?: {
    snapshot_id?: string;
    source_hash?: string;
    node_id?: string;
    node_type?: string;
    route?: string;
    confidence?: string;
    reason?: string;
  };
  repair?: {
    id?: string;
    payload?: Record<string, unknown>;
  };
  repairPlan?: {
    id?: string;
    actions?: unknown[];
    readTargets?: string[];
    commands?: string[];
  };
  remediationSummary?: string;
  commands?: string[];
  promptCommand?: string;
}

interface EvidenceBundleArtifact {
  generatedAt?: string;
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
    {
      path?: string;
      present?: boolean;
      hash?: string | null;
      generatedAt?: string | null;
    }
  >;
  findings?: EvidenceBundleFinding[];
}

interface HealthBaselineDiffArtifact {
  savedAt?: string | null;
  statusChanged?: boolean;
  scoreDelta?: number | null;
  addedFindings?: string[];
  resolvedFindings?: string[];
  changedFiles?: string[];
  changedRoutes?: string[];
  changedScreenshots?: string[];
  contractDrift?: string[];
}

interface BrownfieldAnalysisRoute {
  path?: string;
  file?: string;
  hasLayout?: boolean;
}

interface BrownfieldAnalysisArtifact {
  analyzedAt?: string;
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
    routes?: BrownfieldAnalysisRoute[];
  };
  styling?: {
    approach?: string;
    configFile?: string | null;
    darkMode?: boolean;
    cssVariables?: string[];
  };
  layout?: {
    shellPattern?: string;
  };
  features?: {
    detected?: string[];
  };
}

interface CompilerPathAlias {
  pattern: string;
  targets: string[];
}

interface CompilerImportResolutionConfig {
  baseUrl: string | null;
  paths: CompilerPathAlias[];
}

function hashBuffer(value: Buffer | string): string {
  return createHash('sha256').update(value).digest('hex');
}

function hashFile(path: string): string {
  return `sha256:${hashBuffer(readFileSync(path))}`;
}

function hashJson(value: unknown): string {
  return `sha256:${hashBuffer(stableJson(value))}`;
}

function formatJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
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

function readJsonFile<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function visualManifestSourceHash(manifest: VisualManifest): string {
  return hashJson({
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

function stableFindingGraphAnchor(finding: EvidenceBundleFinding) {
  if (!finding.graph) return undefined;
  return {
    node_id: finding.graph.node_id,
    node_type: finding.graph.node_type,
    route: finding.graph.route,
    confidence: finding.graph.confidence,
    reason: finding.graph.reason,
  };
}

function evidenceBundleSourceHash(bundle: EvidenceBundleArtifact): string {
  return hashJson({
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
      graph: stableFindingGraphAnchor(finding),
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

function healthBaselineDiffSourceHash(diff: HealthBaselineDiffArtifact): string {
  return hashJson({
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

function analysisSourceHash(analysis: BrownfieldAnalysisArtifact): string {
  return hashJson({
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

function graphPaths(projectRoot: string): GraphArtifactPaths {
  const graphDir = join(projectRoot, '.decantr', 'graph');
  return {
    graphDir,
    snapshotsDir: join(graphDir, 'snapshots'),
    snapshot: join(graphDir, 'graph.snapshot.json'),
    snapshotHistory: join(graphDir, 'snapshots', 'pending.json'),
    manifest: join(graphDir, 'graph.manifest.json'),
    diff: join(graphDir, 'graph.diff.json'),
    capsule: join(graphDir, 'contract-capsule.json'),
  };
}

function graphSnapshotHistoryFileName(snapshotId: string): string {
  return `${snapshotId.replace(/[^a-zA-Z0-9_.-]+/g, '-')}.json`;
}

function withSnapshotHistoryPath(
  paths: GraphArtifactPaths,
  snapshotId: string,
): GraphArtifactPaths {
  return {
    ...paths,
    snapshotHistory: join(paths.snapshotsDir, graphSnapshotHistoryFileName(snapshotId)),
  };
}

function graphSnapshotPathForId(projectRoot: string, snapshotId: string | undefined): string {
  const paths = graphPaths(projectRoot);
  if (!snapshotId || snapshotId === 'current') return paths.snapshot;
  return join(paths.snapshotsDir, graphSnapshotHistoryFileName(snapshotId));
}

function readGraphSnapshotSelection(
  artifacts: GraphArtifactBuild,
  snapshotId: string | undefined,
): GraphSnapshotSelection {
  const selector = snapshotId || 'current';
  if (selector === 'current') {
    return {
      selector,
      path: artifacts.paths.snapshot,
      snapshot: artifacts.snapshot,
    };
  }
  if (selector === artifacts.snapshot.id) {
    return {
      selector,
      path: artifacts.paths.snapshotHistory,
      snapshot: artifacts.snapshot,
    };
  }

  const path = graphSnapshotPathForId(artifacts.projectRoot, selector);
  const snapshot = readJsonFile<GraphSnapshot>(path);
  if (!snapshot) {
    throw new Error(
      `Graph snapshot not found: ${selector}. Expected ${pathForDisplay(
        artifacts.projectRoot,
        path,
      )}. Run \`decantr graph --json\` to see the current snapshot id and history path.`,
    );
  }

  return {
    selector,
    path,
    snapshot: normalizeGraphSnapshot(snapshot),
  };
}

function projectRelativePath(projectRoot: string, path: string | undefined): string | null {
  if (!path) return null;
  const absolutePath = isAbsolute(path) ? path : join(projectRoot, path);
  const relativePath = relative(projectRoot, absolutePath).replace(/\\/g, '/');
  if (!relativePath || relativePath.startsWith('..') || isAbsolute(relativePath)) {
    return null;
  }
  return relativePath;
}

function pathIsFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function existingProjectRelativePath(projectRoot: string, path: string | undefined): string | null {
  const relativePath = projectRelativePath(projectRoot, path);
  if (!relativePath) return null;
  return pathIsFile(join(projectRoot, relativePath)) ? relativePath : null;
}

function stripJsonComments(value: string): string {
  return value.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function readCompilerImportResolutionConfig(projectRoot: string): CompilerImportResolutionConfig {
  for (const name of ['tsconfig.json', 'jsconfig.json']) {
    const path = join(projectRoot, name);
    if (!existsSync(path)) continue;
    try {
      const parsed = JSON.parse(stripJsonComments(readFileSync(path, 'utf-8'))) as {
        compilerOptions?: {
          baseUrl?: unknown;
          paths?: unknown;
        };
      };
      const options = parsed.compilerOptions ?? {};
      const paths: CompilerPathAlias[] = [];
      if (options.paths && typeof options.paths === 'object' && !Array.isArray(options.paths)) {
        for (const [pattern, targets] of Object.entries(options.paths as Record<string, unknown>)) {
          if (!Array.isArray(targets)) continue;
          paths.push({
            pattern,
            targets: targets.filter((target): target is string => typeof target === 'string'),
          });
        }
      }
      return {
        baseUrl: typeof options.baseUrl === 'string' ? options.baseUrl : null,
        paths,
      };
    } catch {
      return { baseUrl: null, paths: [] };
    }
  }
  return { baseUrl: null, paths: [] };
}

function existingImportCandidate(projectRoot: string, candidate: string): string | null {
  const relativeCandidate = projectRelativePath(projectRoot, candidate);
  if (!relativeCandidate) return null;
  const candidates = [
    relativeCandidate,
    `${relativeCandidate}.ts`,
    `${relativeCandidate}.tsx`,
    `${relativeCandidate}.js`,
    `${relativeCandidate}.jsx`,
    `${relativeCandidate}.mts`,
    `${relativeCandidate}.cts`,
    join(relativeCandidate, 'index.ts').replace(/\\/g, '/'),
    join(relativeCandidate, 'index.tsx').replace(/\\/g, '/'),
    join(relativeCandidate, 'index.js').replace(/\\/g, '/'),
    join(relativeCandidate, 'index.jsx').replace(/\\/g, '/'),
    join(relativeCandidate, 'index.mts').replace(/\\/g, '/'),
    join(relativeCandidate, 'index.cts').replace(/\\/g, '/'),
  ];
  for (const possible of candidates) {
    if (pathIsFile(join(projectRoot, possible))) return possible;
  }
  return null;
}

function pathAliasTargetCandidates(
  source: string,
  config: CompilerImportResolutionConfig,
): string[] {
  const candidates: string[] = [];
  for (const alias of config.paths) {
    const starIndex = alias.pattern.indexOf('*');
    if (starIndex === -1) {
      if (alias.pattern !== source) continue;
      candidates.push(...alias.targets);
      continue;
    }
    const prefix = alias.pattern.slice(0, starIndex);
    const suffix = alias.pattern.slice(starIndex + 1);
    if (!source.startsWith(prefix) || !source.endsWith(suffix)) continue;
    const matched = source.slice(prefix.length, source.length - suffix.length);
    for (const target of alias.targets) {
      candidates.push(target.replace('*', matched));
    }
  }
  if (config.baseUrl) {
    candidates.push(join(config.baseUrl, source).replace(/\\/g, '/'));
  }
  if (source.startsWith('@/')) {
    const withoutAlias = source.slice(2);
    candidates.push(`src/${withoutAlias}`, withoutAlias);
  }
  return [...new Set(candidates)];
}

function resolveImportSourcePath(
  projectRoot: string,
  fromFile: string,
  source: string,
): string | null {
  if (source.startsWith('.')) {
    return existingImportCandidate(projectRoot, join(dirname(fromFile), source));
  }
  const config = readCompilerImportResolutionConfig(projectRoot);
  for (const candidate of pathAliasTargetCandidates(source, config)) {
    const resolved = existingImportCandidate(projectRoot, candidate);
    if (resolved) return resolved;
  }
  return null;
}

function projectPathCandidatesFromText(text: string | undefined): string[] {
  if (!text) return [];
  const candidates = new Set<string>();
  const pathPattern =
    /(?:^|[\s([`"'])((?:\.\/|\.\.\/|\/|[A-Za-z0-9_.-]+\/)[A-Za-z0-9_./@-]+\.(?:[cm]?[jt]sx?|css|scss|sass|less|html|json|mdx?|png|jpe?g|webp|svg|gif))(?:[:)\]`"',\s]|$)/g;
  for (const match of text.matchAll(pathPattern)) {
    candidates.add(match[1]);
  }
  return [...candidates];
}

function evidenceBundleFindingSourcePaths(
  projectRoot: string,
  finding: EvidenceBundleFinding,
): string[] {
  const candidates = [
    finding.target,
    ...(finding.evidence ?? []).flatMap(projectPathCandidatesFromText),
    ...(finding.repairPlan?.readTargets ?? []),
  ];
  const paths = new Set<string>();
  for (const candidate of candidates) {
    const relativePath = existingProjectRelativePath(projectRoot, candidate);
    if (relativePath) paths.add(relativePath);
  }
  return [...paths].sort();
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

function graphEdgeKey(edge: Pick<GraphEdge, 'src' | 'dst' | 'relation' | 'idx'>): string {
  return [edge.src, edge.relation, edge.dst, String(edge.idx ?? '')].join('\0');
}

function addNode(nodes: Map<string, GraphNode>, node: GraphNode): void {
  if (!nodes.has(node.id)) {
    nodes.set(node.id, node);
  }
}

function addEdge(edges: Map<string, GraphEdge>, edge: GraphEdge): void {
  edges.set(graphEdgeKey(edge), edge);
}

function sourceArtifacts(
  projectRoot: string,
  componentReuseAudit: ComponentReuseAudit | null = null,
): SourceArtifact[] {
  const sources: SourceArtifact[] = [];
  const essencePath = join(projectRoot, 'decantr.essence.json');
  sources.push({
    id: 'src:decantr.essence.json',
    kind: 'essence',
    path: 'decantr.essence.json',
    hash: hashFile(essencePath),
  });

  const rulesPath = localRulesPath(projectRoot);
  if (existsSync(rulesPath)) {
    sources.push({
      id: 'src:.decantr/rules.json',
      kind: 'local-rule-manifest',
      path: '.decantr/rules.json',
      hash: hashFile(rulesPath),
    });
  }

  const patternsPath = localPatternsPath(projectRoot);
  if (existsSync(patternsPath)) {
    sources.push({
      id: 'src:.decantr/local-patterns.json',
      kind: 'local-pattern-manifest',
      path: '.decantr/local-patterns.json',
      hash: hashFile(patternsPath),
    });
  }

  const bridgePath = styleBridgePath(projectRoot);
  if (existsSync(bridgePath)) {
    sources.push({
      id: 'src:.decantr/style-bridge.json',
      kind: 'style-bridge-manifest',
      path: '.decantr/style-bridge.json',
      hash: hashFile(bridgePath),
    });
  }

  const analysisPath = join(projectRoot, '.decantr', 'analysis.json');
  const analysis = readJsonFile<BrownfieldAnalysisArtifact>(analysisPath);
  if (analysis) {
    sources.push({
      id: 'src:.decantr/analysis.json',
      kind: 'brownfield-analysis',
      path: '.decantr/analysis.json',
      hash: analysisSourceHash(analysis),
      payload: {
        framework: analysis.project?.framework,
        routeStrategy: analysis.routes?.strategy,
        routes: analysis.routes?.routes?.length ?? 0,
        styling: analysis.styling?.approach,
      },
    });

    for (const route of analysis.routes?.routes ?? []) {
      const routeFile = projectRelativePath(projectRoot, route.file);
      if (!routeFile) continue;
      const routeFilePath = join(projectRoot, routeFile);
      if (!pathIsFile(routeFilePath)) continue;
      sources.push({
        id: `src:${routeFile}`,
        kind: 'route-source',
        path: routeFile,
        hash: hashFile(routeFilePath),
        payload: {
          route: route.path,
          hasLayout: route.hasLayout ?? false,
          strategy: analysis.routes?.strategy,
        },
      });
    }
  }

  for (const declaration of componentReuseAudit?.declarations ?? []) {
    if (!declaration.reusable) continue;
    const componentFile = projectRelativePath(projectRoot, declaration.file);
    if (!componentFile) continue;
    const componentPath = join(projectRoot, componentFile);
    if (!pathIsFile(componentPath)) continue;
    if (sources.some((source) => source.id === `src:${componentFile}`)) continue;
    sources.push({
      id: `src:${componentFile}`,
      kind: 'component-source',
      path: componentFile,
      hash: hashFile(componentPath),
      payload: {
        component: declaration.name,
        exported: declaration.exported,
        kind: declaration.kind,
        line: declaration.line,
      },
    });
  }

  for (const importReference of componentReuseAudit?.imports ?? []) {
    const importingFile = projectRelativePath(projectRoot, importReference.file);
    if (!importingFile) continue;
    const importingPath = join(projectRoot, importingFile);
    if (
      pathIsFile(importingPath) &&
      !sources.some((source) => source.id === `src:${importingFile}`)
    ) {
      sources.push({
        id: `src:${importingFile}`,
        kind: 'code-source',
        path: importingFile,
        hash: hashFile(importingPath),
        payload: {
          imports: (componentReuseAudit?.imports ?? []).filter(
            (entry) => projectRelativePath(projectRoot, entry.file) === importingFile,
          ).length,
        },
      });
    }

    const importedFile = resolveImportSourcePath(
      projectRoot,
      importingFile,
      importReference.source,
    );
    if (!importedFile) continue;
    const importedPath = join(projectRoot, importedFile);
    if (!pathIsFile(importedPath)) continue;
    if (sources.some((source) => source.id === `src:${importedFile}`)) continue;
    sources.push({
      id: `src:${importedFile}`,
      kind: 'code-source',
      path: importedFile,
      hash: hashFile(importedPath),
      payload: {
        importedBy: importingFile,
      },
    });
  }

  const visualManifestPath = join(projectRoot, '.decantr', 'evidence', 'visual-manifest.json');
  const visualManifest = readJsonFile<VisualManifest>(visualManifestPath);
  if (visualManifest) {
    sources.push({
      id: 'src:.decantr/evidence/visual-manifest.json',
      kind: 'visual-manifest',
      path: '.decantr/evidence/visual-manifest.json',
      hash: visualManifestSourceHash(visualManifest),
      payload: {
        localOnly: visualManifest.localOnly,
        baseUrl: visualManifest.baseUrl ?? null,
        routes: visualManifest.routes?.length ?? 0,
      },
    });

    for (const route of visualManifest.routes ?? []) {
      if (!route.screenshot) continue;
      const screenshotPath = join(projectRoot, route.screenshot);
      if (!pathIsFile(screenshotPath)) continue;
      sources.push({
        id: `src:${route.screenshot}`,
        kind: 'visual-screenshot',
        path: route.screenshot,
        hash: hashFile(screenshotPath),
        payload: {
          route: route.route,
          status: route.status,
          screenshotHash: route.screenshotHash ?? null,
        },
      });
    }
  }

  const evidenceBundlePath = join(projectRoot, '.decantr', 'evidence', 'latest.json');
  const evidenceBundle = readJsonFile<EvidenceBundleArtifact>(evidenceBundlePath);
  if (evidenceBundle) {
    sources.push({
      id: 'src:.decantr/evidence/latest.json',
      kind: 'evidence-bundle',
      path: '.decantr/evidence/latest.json',
      hash: evidenceBundleSourceHash(evidenceBundle),
      payload: {
        status: evidenceBundle.health?.status,
        score: evidenceBundle.health?.score,
        findings: evidenceBundle.findings?.length ?? 0,
        provenance: Object.keys(evidenceBundle.provenance ?? {}).length,
        graphSnapshotPresent: evidenceBundle.provenance?.graphSnapshot?.present,
        graphSnapshotHash: evidenceBundle.provenance?.graphSnapshot?.hash ?? null,
        contractCapsulePresent: evidenceBundle.provenance?.contractCapsule?.present,
        contractCapsuleHash: evidenceBundle.provenance?.contractCapsule?.hash ?? null,
      },
    });

    const findingSourcePaths = new Map<string, EvidenceBundleFinding[]>();
    for (const finding of evidenceBundle.findings ?? []) {
      for (const sourcePath of evidenceBundleFindingSourcePaths(projectRoot, finding)) {
        findingSourcePaths.set(sourcePath, [
          ...(findingSourcePaths.get(sourcePath) ?? []),
          finding,
        ]);
      }
    }
    for (const [sourcePath, findings] of findingSourcePaths) {
      if (sources.some((source) => source.id === `src:${sourcePath}`)) continue;
      sources.push({
        id: `src:${sourcePath}`,
        kind: 'finding-source',
        path: sourcePath,
        hash: hashFile(join(projectRoot, sourcePath)),
        payload: {
          findings: findings.map((finding) => finding.id),
          codes: [
            ...new Set(
              findings
                .map((finding) => finding.code)
                .filter((code): code is string => typeof code === 'string' && code.length > 0),
            ),
          ],
        },
      });
    }
  }

  const healthBaselineDiffPath = join(projectRoot, '.decantr', 'health-baseline-diff.json');
  const healthBaselineDiff = readJsonFile<HealthBaselineDiffArtifact>(healthBaselineDiffPath);
  if (healthBaselineDiff) {
    for (const changedFile of healthBaselineDiff.changedFiles ?? []) {
      const sourcePath = existingProjectRelativePath(projectRoot, changedFile);
      if (!sourcePath) continue;
      if (sources.some((source) => source.id === `src:${sourcePath}`)) continue;
      sources.push({
        id: `src:${sourcePath}`,
        kind: 'baseline-changed-source',
        path: sourcePath,
        hash: hashFile(join(projectRoot, sourcePath)),
        payload: {
          role: 'baseline-changed-file',
        },
      });
    }

    sources.push({
      id: 'src:.decantr/health-baseline-diff.json',
      kind: 'health-baseline-diff',
      path: '.decantr/health-baseline-diff.json',
      hash: healthBaselineDiffSourceHash(healthBaselineDiff),
      payload: {
        changedFiles: healthBaselineDiff.changedFiles?.length ?? 0,
        changedRoutes: healthBaselineDiff.changedRoutes?.length ?? 0,
        changedScreenshots: healthBaselineDiff.changedScreenshots?.length ?? 0,
        contractDrift: healthBaselineDiff.contractDrift?.length ?? 0,
      },
    });
  }

  return dedupeSourceArtifacts(sources);
}

function dedupeSourceArtifacts(sources: SourceArtifact[]): SourceArtifact[] {
  return [...new Map(sources.map((source) => [source.id, source])).values()];
}

function sourceHash(sources: SourceArtifact[]): string {
  return hashJson(
    sources.map((source) => ({
      id: source.id,
      kind: source.kind,
      path: source.path,
      hash: source.hash,
    })),
  );
}

function evidenceBundleFindingNodeId(finding: EvidenceBundleFinding): string {
  return `find:${graphSlug(finding.id, 'finding')}`;
}

function evidenceBundleEvidenceNodeId(finding: EvidenceBundleFinding, index: number): string {
  return `ev:finding:${graphSlug(finding.id, 'finding')}:${index + 1}`;
}

function firstFindingSourceArtifactId(
  nodes: Map<string, GraphNode>,
  projectRoot: string,
  finding: EvidenceBundleFinding,
): string | null {
  for (const sourcePath of evidenceBundleFindingSourcePaths(projectRoot, finding)) {
    const sourceId = `src:${sourcePath}`;
    if (nodes.has(sourceId)) return sourceId;
  }
  return null;
}

function routeForScreenshotPath(
  visualManifest: VisualManifest | null,
  screenshot: string,
): string | null {
  return visualManifest?.routes?.find((route) => route.screenshot === screenshot)?.route ?? null;
}

function augmentProjectGraph(
  snapshot: GraphSnapshot,
  projectRoot: string,
  sources: SourceArtifact[],
  componentReuseAudit: ComponentReuseAudit | null = null,
): GraphSnapshot {
  const nodes = new Map(snapshot.nodes.map((node) => [node.id, node]));
  const edges = new Map(snapshot.edges.map((edge) => [graphEdgeKey(edge), edge]));

  for (const source of sources) {
    addNode(nodes, {
      id: source.id,
      type: 'SourceArtifact',
      payload: source,
    });
  }

  const localRules = readLocalRuleManifest(projectRoot);
  if (localRules) {
    const sourceId = 'src:.decantr/rules.json';
    for (const rule of localRules.rules ?? []) {
      const ruleId = `rule:${graphSlug(rule.id, 'local-rule')}`;
      addNode(nodes, {
        id: ruleId,
        type: 'LocalRule',
        payload: {
          ...rule,
          manifest: {
            status: localRules.status,
            source: localRules.source,
            enforcement: localRules.enforcement,
          },
        },
      });
      addEdge(edges, {
        src: ruleId,
        dst: snapshot.project_id,
        relation: 'LOCAL_RULE_APPLIES_TO',
      });
      addEdge(edges, {
        src: ruleId,
        dst: sourceId,
        relation: 'NODE_DERIVED_FROM_SOURCE',
      });
    }
  }

  const localPatterns = readLocalPatternPack(projectRoot);
  if (localPatterns) {
    const sourceId = 'src:.decantr/local-patterns.json';
    for (const pattern of localPatterns.patterns ?? []) {
      const behavior = summarizeLocalPatternBehaviorObligations(pattern);
      if (!behavior) continue;
      const patternNodeId = `pat:${graphSlug(behavior.patternId, 'pattern')}`;
      for (const obligation of behavior.obligations) {
        const ruleId = `rule:behavior:${graphSlug(behavior.patternId, 'pattern')}:${graphSlug(
          obligation.id,
          'obligation',
        )}`;
        addNode(nodes, {
          id: ruleId,
          type: 'LocalRule',
          payload: {
            id: ruleId.replace(/^rule:/, ''),
            kind: 'behavior-obligation',
            patternId: behavior.patternId,
            patternRole: behavior.patternRole,
            intent: behavior.intent,
            obligationId: obligation.id,
            label: obligation.label,
            severity: obligation.severity,
            evidence: obligation.evidence,
            modalities: behavior.modalities,
            states: behavior.states,
            riskProfile: behavior.riskProfile,
            testHints: behavior.testHints,
            componentPaths: behavior.componentPaths,
            manifest: {
              status: localPatterns.status,
              source: localPatterns.source,
              acceptedAt: localPatterns.acceptedAt,
            },
          },
        });
        addEdge(edges, {
          src: ruleId,
          dst: snapshot.project_id,
          relation: 'LOCAL_RULE_APPLIES_TO',
        });
        if (nodes.has(patternNodeId)) {
          addEdge(edges, {
            src: ruleId,
            dst: patternNodeId,
            relation: 'LOCAL_RULE_APPLIES_TO',
          });
        }
        addEdge(edges, {
          src: ruleId,
          dst: sourceId,
          relation: 'NODE_DERIVED_FROM_SOURCE',
        });
      }
    }
  }

  const styleBridge = readStyleBridge(projectRoot);
  if (styleBridge) {
    const sourceId = 'src:.decantr/style-bridge.json';
    for (const mapping of styleBridge.mappings ?? []) {
      const bridgeId = `bridge:${graphSlug(mapping.id, 'style-bridge')}`;
      addNode(nodes, {
        id: bridgeId,
        type: 'StyleBridge',
        payload: {
          ...mapping,
          manifest: {
            status: styleBridge.status,
            source: styleBridge.source,
            adoption: styleBridge.adoption,
          },
        },
      });
      addEdge(edges, {
        src: bridgeId,
        dst: snapshot.project_id,
        relation: 'STYLE_BRIDGE_MAPS_TO',
      });
      addEdge(edges, {
        src: bridgeId,
        dst: sourceId,
        relation: 'NODE_DERIVED_FROM_SOURCE',
      });

      for (const tokenHint of mapping.tokenHints ?? []) {
        const tokenName = tokenHint.trim();
        if (!tokenName) continue;
        const tokenGraphName = tokenName.replace(/^var\((--[^),\s]+).*$/, '$1').replace(/^--/, '');
        const tokenId = `tkn:${graphSlug(tokenGraphName, 'style-token')}`;
        addNode(nodes, {
          id: tokenId,
          type: 'Token',
          payload: {
            name: tokenName,
            source: 'style-bridge',
            mapping: mapping.id,
            intent: mapping.decantrIntent,
            projectAuthority: mapping.projectAuthority,
          },
        });
        addEdge(edges, {
          src: bridgeId,
          dst: tokenId,
          relation: 'STYLE_BRIDGE_MAPS_TO',
          payload: {
            kind: 'token-hint',
            token: tokenName,
          },
        });
        addEdge(edges, {
          src: tokenId,
          dst: sourceId,
          relation: 'NODE_DERIVED_FROM_SOURCE',
        });
      }
    }
  }

  const analysis = readJsonFile<BrownfieldAnalysisArtifact>(
    join(projectRoot, '.decantr', 'analysis.json'),
  );
  if (analysis) {
    const sourceId = 'src:.decantr/analysis.json';
    addEdge(edges, {
      src: snapshot.project_id,
      dst: sourceId,
      relation: 'NODE_DERIVED_FROM_SOURCE',
      payload: {
        role: 'brownfield-analysis',
      },
    });

    for (const route of analysis.routes?.routes ?? []) {
      if (!route.path) continue;
      const routeFile = projectRelativePath(projectRoot, route.file);
      if (!routeFile || !nodes.has(`src:${routeFile}`)) continue;
      const routeId = `rt:${route.path}`;
      if (nodes.has(routeId)) {
        addEdge(edges, {
          src: routeId,
          dst: `src:${routeFile}`,
          relation: 'NODE_DERIVED_FROM_SOURCE',
          payload: {
            role: 'route-implementation',
            strategy: analysis.routes?.strategy,
            hasLayout: route.hasLayout ?? false,
          },
        });
      }

      for (const edge of [...edges.values()]) {
        if (edge.relation !== 'PAGE_ROUTED_AT_ROUTE' || edge.dst !== routeId) continue;
        addEdge(edges, {
          src: edge.src,
          dst: `src:${routeFile}`,
          relation: 'NODE_DERIVED_FROM_SOURCE',
          payload: {
            role: 'page-implementation',
            route: route.path,
            strategy: analysis.routes?.strategy,
          },
        });
      }
    }
  }

  for (const declaration of componentReuseAudit?.declarations ?? []) {
    if (!declaration.reusable) continue;
    const componentFile = projectRelativePath(projectRoot, declaration.file);
    if (!componentFile || !nodes.has(`src:${componentFile}`)) continue;
    const componentId = `cmp:${graphSlug(declaration.name, 'component')}`;
    addNode(nodes, {
      id: componentId,
      type: 'Component',
      payload: {
        name: declaration.name,
        source: 'code',
        exported: declaration.exported,
        kind: declaration.kind,
      },
    });
    addEdge(edges, {
      src: componentId,
      dst: `src:${componentFile}`,
      relation: 'NODE_DERIVED_FROM_SOURCE',
      payload: {
        role: 'component-implementation',
        line: declaration.line,
      },
    });
  }

  for (const importReference of componentReuseAudit?.imports ?? []) {
    const importingFile = projectRelativePath(projectRoot, importReference.file);
    if (!importingFile || !nodes.has(`src:${importingFile}`)) continue;
    const importedFile = resolveImportSourcePath(
      projectRoot,
      importingFile,
      importReference.source,
    );
    if (!importedFile || !nodes.has(`src:${importedFile}`)) continue;
    addEdge(edges, {
      src: `src:${importingFile}`,
      dst: `src:${importedFile}`,
      relation: 'SOURCE_IMPORTS_SOURCE',
      payload: {
        source: importReference.source,
        line: importReference.line,
        defaultImport: importReference.defaultImport,
        namespaceImport: importReference.namespaceImport,
        imported: importReference.imported,
        localNames: importReference.localNames,
      },
    });
  }

  const visualManifest = readJsonFile<VisualManifest>(
    join(projectRoot, '.decantr', 'evidence', 'visual-manifest.json'),
  );
  if (visualManifest) {
    const sourceId = 'src:.decantr/evidence/visual-manifest.json';
    for (const [index, route] of (visualManifest.routes ?? []).entries()) {
      const routeSlug =
        route.route === '/'
          ? 'root'
          : graphSlug(route.route || `route-${index + 1}`, `route-${index + 1}`);
      const evidenceId = `ev:visual:${routeSlug}`;
      const routeId = `rt:${route.route}`;
      const anchorId = nodes.has(routeId) ? routeId : snapshot.project_id;

      addNode(nodes, {
        id: evidenceId,
        type: 'Evidence',
        payload: {
          kind: 'route-screenshot',
          route: route.route,
          url: route.url,
          screenshot: route.screenshot,
          screenshotHash: route.screenshotHash ?? null,
          status: route.status,
          error: route.error,
          localOnly: visualManifest.localOnly ?? true,
        },
      });
      addEdge(edges, {
        src: evidenceId,
        dst: sourceId,
        relation: 'NODE_DERIVED_FROM_SOURCE',
      });
      if (route.screenshot && nodes.has(`src:${route.screenshot}`)) {
        addEdge(edges, {
          src: evidenceId,
          dst: `src:${route.screenshot}`,
          relation: 'NODE_DERIVED_FROM_SOURCE',
          payload: {
            role: 'screenshot',
          },
        });
      }
      addEdge(edges, {
        src: evidenceId,
        dst: anchorId,
        relation: 'EVIDENCE_CAPTURED_FOR',
        payload: {
          kind: 'visual-route',
          route: route.route,
          status: route.status,
        },
      });

      if (nodes.has(routeId)) {
        for (const edge of [...edges.values()]) {
          if (edge.relation === 'PAGE_ROUTED_AT_ROUTE' && edge.dst === routeId) {
            addEdge(edges, {
              src: evidenceId,
              dst: edge.src,
              relation: 'EVIDENCE_CAPTURED_FOR',
              payload: {
                kind: 'visual-page',
                route: route.route,
                status: route.status,
              },
            });
          }
        }
      }
    }
  }

  const evidenceBundle = readJsonFile<EvidenceBundleArtifact>(
    join(projectRoot, '.decantr', 'evidence', 'latest.json'),
  );
  if (evidenceBundle) {
    const sourceId = 'src:.decantr/evidence/latest.json';
    for (const finding of evidenceBundle.findings ?? []) {
      const findingId = evidenceBundleFindingNodeId(finding);
      const fallbackSourceAnchorId = firstFindingSourceArtifactId(nodes, projectRoot, finding);
      const anchoredAt =
        finding.graph?.node_id && nodes.has(finding.graph.node_id)
          ? finding.graph.node_id
          : (fallbackSourceAnchorId ?? finding.graph?.node_id);
      addNode(nodes, {
        id: findingId,
        type: 'Finding',
        payload: {
          id: finding.id,
          code: finding.code,
          source: finding.source,
          category: finding.category,
          severity: finding.severity,
          message: finding.message,
          target: finding.target,
          rule: finding.rule,
          suggestedFix: finding.suggestedFix,
          remediationSummary: finding.remediationSummary,
          commands: finding.commands,
          promptCommand: finding.promptCommand,
          anchored_at: anchoredAt,
          graph: stableFindingGraphAnchor(finding),
          repair_id: finding.repair?.id,
          repair_plan_id: finding.repairPlan?.id,
        },
      });
      addEdge(edges, {
        src: findingId,
        dst: sourceId,
        relation: 'NODE_DERIVED_FROM_SOURCE',
      });

      if (finding.graph?.node_id && nodes.has(finding.graph.node_id)) {
        addEdge(edges, {
          src: findingId,
          dst: finding.graph.node_id,
          relation: 'FINDING_ANCHORED_AT',
          payload: {
            confidence: finding.graph.confidence,
            reason: finding.graph.reason,
          },
        });
      } else if (fallbackSourceAnchorId) {
        addEdge(edges, {
          src: findingId,
          dst: fallbackSourceAnchorId,
          relation: 'FINDING_ANCHORED_AT',
          payload: {
            confidence: 'inferred',
            reason: 'finding repair targets or evidence matched a SourceArtifact node',
          },
        });
      }

      if (finding.rule) {
        const ruleId = `rule:${graphSlug(finding.rule, 'local-rule')}`;
        if (nodes.has(ruleId)) {
          addEdge(edges, {
            src: findingId,
            dst: ruleId,
            relation: 'FINDING_VIOLATES_RULE',
          });
        }
      }

      if (finding.repair?.id) {
        const repairId = `repair:${graphSlug(finding.repair.id, 'repair')}`;
        addNode(nodes, {
          id: repairId,
          type: 'Repair',
          payload: {
            id: finding.repair.id,
            payload: finding.repair.payload,
            plan_id: finding.repairPlan?.id,
            actions: finding.repairPlan?.actions,
            readTargets: finding.repairPlan?.readTargets,
            commands: finding.repairPlan?.commands,
          },
        });
        addEdge(edges, {
          src: repairId,
          dst: findingId,
          relation: 'REPAIR_FIXES_FINDING',
        });
        addEdge(edges, {
          src: repairId,
          dst: sourceId,
          relation: 'NODE_DERIVED_FROM_SOURCE',
        });
      }

      for (const [index, evidenceText] of (finding.evidence ?? []).entries()) {
        const evidenceId = evidenceBundleEvidenceNodeId(finding, index);
        addNode(nodes, {
          id: evidenceId,
          type: 'Evidence',
          payload: {
            kind: 'finding-evidence',
            text: evidenceText,
            finding: finding.id,
          },
        });
        addEdge(edges, {
          src: evidenceId,
          dst: findingId,
          relation: 'EVIDENCE_SUPPORTS_FINDING',
        });
        addEdge(edges, {
          src: evidenceId,
          dst: sourceId,
          relation: 'NODE_DERIVED_FROM_SOURCE',
        });
      }
    }
  }

  const healthBaselineDiff = readJsonFile<HealthBaselineDiffArtifact>(
    join(projectRoot, '.decantr', 'health-baseline-diff.json'),
  );
  if (healthBaselineDiff) {
    const sourceId = 'src:.decantr/health-baseline-diff.json';
    const manifestForScreenshotRoutes = readJsonFile<VisualManifest>(
      join(projectRoot, '.decantr', 'evidence', 'visual-manifest.json'),
    );

    for (const route of healthBaselineDiff.changedRoutes ?? []) {
      const evidenceId = `ev:baseline:route:${graphSlug(route, 'route')}`;
      const routeId = `rt:${route}`;
      const anchorId = nodes.has(routeId) ? routeId : snapshot.project_id;
      addNode(nodes, {
        id: evidenceId,
        type: 'Evidence',
        payload: {
          kind: 'baseline-route-impact',
          route,
        },
      });
      addEdge(edges, {
        src: evidenceId,
        dst: sourceId,
        relation: 'NODE_DERIVED_FROM_SOURCE',
      });
      addEdge(edges, {
        src: evidenceId,
        dst: anchorId,
        relation: 'EVIDENCE_CAPTURED_FOR',
        payload: { kind: 'baseline-route-impact' },
      });
    }

    for (const changedFile of healthBaselineDiff.changedFiles ?? []) {
      const sourcePath = projectRelativePath(projectRoot, changedFile);
      if (!sourcePath) continue;
      const sourceArtifactId = `src:${sourcePath}`;
      if (!nodes.has(sourceArtifactId)) continue;
      const evidenceId = `ev:baseline:file:${graphSlug(sourcePath, 'file')}`;
      addNode(nodes, {
        id: evidenceId,
        type: 'Evidence',
        payload: {
          kind: 'baseline-file-impact',
          file: sourcePath,
        },
      });
      addEdge(edges, {
        src: evidenceId,
        dst: sourceId,
        relation: 'NODE_DERIVED_FROM_SOURCE',
      });
      addEdge(edges, {
        src: evidenceId,
        dst: sourceArtifactId,
        relation: 'EVIDENCE_CAPTURED_FOR',
        payload: { kind: 'baseline-file-impact' },
      });
    }

    for (const [index, screenshot] of (healthBaselineDiff.changedScreenshots ?? []).entries()) {
      const route = routeForScreenshotPath(manifestForScreenshotRoutes, screenshot);
      const routeId = route ? `rt:${route}` : null;
      const evidenceId = `ev:baseline:screenshot:${index + 1}`;
      addNode(nodes, {
        id: evidenceId,
        type: 'Evidence',
        payload: {
          kind: 'baseline-screenshot-drift',
          screenshot,
          route,
        },
      });
      addEdge(edges, {
        src: evidenceId,
        dst: sourceId,
        relation: 'NODE_DERIVED_FROM_SOURCE',
      });
      addEdge(edges, {
        src: evidenceId,
        dst: routeId && nodes.has(routeId) ? routeId : snapshot.project_id,
        relation: 'EVIDENCE_CAPTURED_FOR',
        payload: { kind: 'baseline-screenshot-drift', route },
      });
    }

    for (const [index, drift] of (healthBaselineDiff.contractDrift ?? []).entries()) {
      const evidenceId = `ev:baseline:contract:${index + 1}`;
      addNode(nodes, {
        id: evidenceId,
        type: 'Evidence',
        payload: {
          kind: 'baseline-contract-drift',
          text: drift,
        },
      });
      addEdge(edges, {
        src: evidenceId,
        dst: sourceId,
        relation: 'NODE_DERIVED_FROM_SOURCE',
      });
      addEdge(edges, {
        src: evidenceId,
        dst: snapshot.project_id,
        relation: 'EVIDENCE_CAPTURED_FOR',
        payload: { kind: 'baseline-contract-drift' },
      });
    }
  }

  return normalizeGraphSnapshot({
    ...snapshot,
    nodes: [...nodes.values()],
    edges: [...edges.values()],
  });
}

function pathForDisplay(projectRoot: string, path: string, displayRoot?: string): string {
  if (!displayRoot) return path.replace(`${projectRoot}/`, '');
  const relativePath = relative(displayRoot, path).replace(/\\/g, '/');
  if (relativePath && !relativePath.startsWith('..') && !isAbsolute(relativePath)) {
    return relativePath;
  }
  return path;
}

function artifactMatches(path: string, value: unknown): boolean {
  const existing = readJsonFile<unknown>(path);
  return existing ? stableJson(existing) === stableJson(value) : false;
}

export function buildGraphArtifacts(
  projectRoot: string,
  options: BuildGraphArtifactsOptions = {},
): GraphArtifactBuild | null {
  const essencePath = join(projectRoot, 'decantr.essence.json');
  if (!existsSync(essencePath)) {
    return null;
  }

  const parsed = JSON.parse(readFileSync(essencePath, 'utf-8'));
  if (!isV4(parsed)) {
    throw new Error('Active graph workflows require Essence v4.0.0.');
  }
  const essence = parsed as EssenceV4;
  let paths = graphPaths(projectRoot);
  const componentReuseAudit = auditComponentReuse(
    projectRoot,
    collectProjectSourceFiles(projectRoot),
  );
  const sources = sourceArtifacts(projectRoot, componentReuseAudit);
  const combinedSourceHash = sourceHash(sources);
  const previousSnapshot = readJsonFile<GraphSnapshot>(paths.snapshot);
  const createdAt =
    previousSnapshot?.source_hash === combinedSourceHash
      ? previousSnapshot.created_at
      : new Date().toISOString();
  const snapshotId = `graph:${combinedSourceHash.replace(/^sha256:/, '').slice(0, 12)}`;
  paths = withSnapshotHistoryPath(paths, snapshotId);
  const baseSnapshot = buildGraphSnapshotFromEssence(essence, {
    snapshotId,
    parentId:
      previousSnapshot && previousSnapshot.id !== snapshotId ? previousSnapshot.id : undefined,
    sourceHash: combinedSourceHash,
    createdAt,
    sourceArtifact: sources[0],
  });
  const snapshot = augmentProjectGraph(baseSnapshot, projectRoot, sources, componentReuseAudit);
  const diff = previousSnapshot
    ? diffGraphSnapshots(previousSnapshot, snapshot)
    : {
        $schema: GRAPH_DIFF_SCHEMA_URL,
        id: `diff:${snapshot.id}:${snapshot.id}`,
        from: snapshot.id,
        to: snapshot.id,
        ops: [],
      };
  const capsule = buildContractCapsuleFromSnapshot(snapshot, {
    createdAt: snapshot.created_at,
    sourceArtifactLimit: options.capsuleSourceLimit,
  });
  const manifest: GraphManifest = {
    $schema: GRAPH_MANIFEST_SCHEMA_URL,
    schema_version: GRAPH_SCHEMA_VERSION,
    snapshot_id: snapshot.id,
    project_id: snapshot.project_id,
    generated_at: snapshot.created_at,
    sources,
    outputs: {
      snapshot: '.decantr/graph/graph.snapshot.json',
      history: '.decantr/graph/snapshots',
      diff: '.decantr/graph/graph.diff.json',
    },
    warnings: [],
  };
  const staleArtifacts = [
    [paths.snapshot, snapshot],
    [paths.snapshotHistory, snapshot],
    [paths.manifest, manifest],
    [paths.diff, diff],
    [paths.capsule, capsule],
  ]
    .filter(([path, value]) => !artifactMatches(path as string, value))
    .map(([path]) => path as string);

  return {
    projectRoot,
    paths,
    snapshot,
    manifest,
    diff,
    capsule,
    staleArtifacts,
  };
}

function writeGraphArtifacts(artifacts: GraphArtifactBuild): void {
  mkdirSync(artifacts.paths.graphDir, { recursive: true });
  mkdirSync(artifacts.paths.snapshotsDir, { recursive: true });
  writeFileSync(artifacts.paths.snapshot, formatJson(artifacts.snapshot), 'utf-8');
  writeFileSync(artifacts.paths.snapshotHistory, formatJson(artifacts.snapshot), 'utf-8');
  writeFileSync(artifacts.paths.manifest, formatJson(artifacts.manifest), 'utf-8');
  writeFileSync(artifacts.paths.diff, formatJson(artifacts.diff), 'utf-8');
  writeFileSync(artifacts.paths.capsule, formatJson(artifacts.capsule), 'utf-8');
}

function comparisonPayload(
  diff: GraphDiff,
  includeOps = false,
  limit: number | undefined = undefined,
): GraphComparisonPayload {
  const boundedLimit =
    typeof limit === 'number' && Number.isFinite(limit) && limit > 0 ? limit : 25;
  return {
    from: diff.from,
    to: diff.to,
    summary: summarizeGraphDiff(diff),
    ...(includeOps
      ? {
          ops: diff.ops.slice(0, boundedLimit),
          truncated: diff.ops.length > boundedLimit,
          limit: boundedLimit,
        }
      : {}),
  };
}

function summaryPayload(
  artifacts: GraphArtifactBuild,
  routeContext?: GraphRouteContext | null,
  impactContext?: GraphImpactContext | null,
  selected?: GraphSnapshotSelection,
  comparison?: GraphComparisonPayload,
  impactSelection?: ImpactContextSelection,
) {
  return {
    projectRoot: artifacts.projectRoot,
    graphDir: artifacts.paths.graphDir,
    snapshot: {
      id: artifacts.snapshot.id,
      schema_version: artifacts.snapshot.schema_version,
      source_hash: artifacts.snapshot.source_hash,
      nodes: artifacts.snapshot.summary.nodes,
      edges: artifacts.snapshot.summary.edges,
      findings: artifacts.snapshot.summary.findings,
      evidence: artifacts.snapshot.summary.evidence,
      sourceArtifacts: artifacts.snapshot.nodes.filter((node) => node.type === 'SourceArtifact')
        .length,
      history: pathForDisplay(artifacts.projectRoot, artifacts.paths.snapshotHistory),
    },
    capsule: {
      cache_key: artifacts.capsule.cache_key,
      routes: artifacts.capsule.summary.routes,
      components: artifacts.capsule.summary.components,
      tokens: artifacts.capsule.summary.tokens,
      local_rules: artifacts.capsule.summary.local_rules,
      style_bridge: artifacts.capsule.summary.style_bridge,
      source_artifacts: artifacts.capsule.summary.source_artifacts,
      source_artifact_limit: artifacts.capsule.source_artifact_limit,
      source_artifacts_truncated: artifacts.capsule.source_artifacts_truncated,
      open_findings: artifacts.capsule.summary.open_findings,
    },
    diff: {
      id: artifacts.diff.id,
      from: artifacts.diff.from,
      to: artifacts.diff.to,
      ops: artifacts.diff.ops.length,
      summary: summarizeGraphDiff(artifacts.diff),
    },
    sources: artifacts.manifest.sources.length,
    staleArtifacts: artifacts.staleArtifacts.map((path) =>
      pathForDisplay(artifacts.projectRoot, path),
    ),
    selectedSnapshot: selected
      ? {
          selector: selected.selector,
          path: pathForDisplay(artifacts.projectRoot, selected.path),
          id: selected.snapshot.id,
          source_hash: selected.snapshot.source_hash,
          nodes: selected.snapshot.summary.nodes,
          edges: selected.snapshot.summary.edges,
          findings: selected.snapshot.summary.findings,
          evidence: selected.snapshot.summary.evidence,
        }
      : undefined,
    comparison,
    routeContext: routeContextPayload(
      routeContext ?? null,
      routeContext ? optionsRoute(routeContext) : undefined,
    ),
    impactContext: impactContextPayload(impactContext ?? null, impactSelection),
  };
}

function optionsRoute(routeContext: GraphRouteContext): string {
  return (
    graphPayloadString(routeContext.routeNode.payload, 'path') ??
    routeContext.routeNode.id.replace(/^rt:/, '')
  );
}

function printGraphSummary(artifacts: GraphArtifactBuild, displayRoot?: string): void {
  console.log(`${GREEN}Generated Decantr typed graph artifacts:${RESET}`);
  for (const path of [
    artifacts.paths.snapshot,
    artifacts.paths.snapshotHistory,
    artifacts.paths.manifest,
    artifacts.paths.diff,
    artifacts.paths.capsule,
  ]) {
    console.log(`  ${DIM}${pathForDisplay(artifacts.projectRoot, path, displayRoot)}${RESET}`);
  }
  console.log('');
  console.log(
    `${GREEN}Snapshot:${RESET} ${artifacts.snapshot.summary.nodes} nodes, ${artifacts.snapshot.summary.edges} edges, ${artifacts.diff.ops.length} diff ops`,
  );
  const diffSummary = summarizeGraphDiff(artifacts.diff);
  const typedDiffHints = [
    diffSummary.findings.added > 0 ? `${diffSummary.findings.added} finding added` : null,
    diffSummary.findings.resolved > 0 ? `${diffSummary.findings.resolved} finding resolved` : null,
    diffSummary.evidence.added > 0 ? `${diffSummary.evidence.added} evidence added` : null,
  ].filter(Boolean);
  if (typedDiffHints.length > 0) {
    console.log(`${GREEN}Diff:${RESET} ${typedDiffHints.join(', ')}`);
  }
  console.log(`${GREEN}Sources:${RESET} ${artifacts.manifest.sources.length} local artifact(s)`);
  console.log(
    `${GREEN}Capsule:${RESET} ${artifacts.capsule.summary.routes} routes, ${artifacts.capsule.summary.local_rules} local rules, ${artifacts.capsule.summary.style_bridge} style bridge mappings`,
  );
}

function graphAvailableRoutes(snapshot: GraphSnapshot): string[] {
  return snapshot.nodes
    .filter((node) => node.type === 'Route')
    .map((node) => graphPayloadString(node.payload, 'path') ?? node.id.replace(/^rt:/, ''))
    .sort();
}

function routeContextPayload(routeContext: GraphRouteContext | null, route: string | undefined) {
  if (!route) return undefined;
  if (!routeContext) {
    return {
      route,
      found: false,
    };
  }
  return {
    route,
    found: true,
    snapshotId: routeContext.snapshotId,
    sourceHash: routeContext.sourceHash,
    ranking: routeContext.ranking,
    summary: routeContext.summary,
    ids: routeContext.ids,
    ranked: routeContext.ranked,
    nodes: routeContext.nodes,
    edges: routeContext.edges,
  };
}

interface ImpactContextSelection {
  node?: string;
  file?: string;
  resolvedNodeIds: string[];
}

function graphSourceNodeIdForFile(
  projectRoot: string,
  snapshot: GraphSnapshot,
  file: string | undefined,
): string | null {
  if (!file) return null;
  const trimmed = file.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('src:') && snapshot.nodes.some((node) => node.id === trimmed)) {
    return trimmed;
  }

  const candidates = new Set<string>();
  const directRelative = projectRelativePath(projectRoot, trimmed);
  if (directRelative) candidates.add(directRelative);
  try {
    const workspaceRelative = projectRelativePath(projectRoot, resolvePathFromCwd(trimmed));
    if (workspaceRelative) candidates.add(workspaceRelative);
  } catch {
    // Ignore invalid workspace-relative candidates; the direct project-relative path may still match.
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

function resolvePathFromCwd(path: string): string {
  return isAbsolute(path) ? path : join(process.cwd(), path);
}

function impactContextPayload(
  impactContext: GraphImpactContext | null,
  selection: ImpactContextSelection | undefined,
) {
  if (!selection) return undefined;
  if (!impactContext) {
    return {
      node: selection.node,
      file: selection.file,
      resolvedNodeIds: selection.resolvedNodeIds,
      found: false,
    };
  }
  return {
    node: selection.node,
    file: selection.file,
    resolvedNodeIds: selection.resolvedNodeIds,
    found: true,
    snapshotId: impactContext.snapshotId,
    sourceHash: impactContext.sourceHash,
    missingNodeIds: impactContext.missingNodeIds,
    seedNodes: impactContext.seedNodes,
    ranking: impactContext.ranking,
    summary: impactContext.summary,
    ids: impactContext.ids,
    ranked: impactContext.ranked,
    nodes: impactContext.nodes,
    edges: impactContext.edges,
  };
}

function printRouteContextSummary(routeContext: GraphRouteContext): void {
  const routeSummary = routeContext.summary;
  const hints = [
    routeContext.ids.patterns.length > 0
      ? `patterns ${routeContext.ids.patterns.join(', ')}`
      : null,
    routeSummary.openFindings > 0 ? `${routeSummary.openFindings} finding(s)` : null,
    routeSummary.evidence > 0 ? `${routeSummary.evidence} evidence node(s)` : null,
    routeSummary.sourceArtifacts > 0 ? `${routeSummary.sourceArtifacts} source artifact(s)` : null,
  ].filter(Boolean);
  console.log('');
  console.log(
    `${GREEN}Route subgraph:${RESET} ${routeSummary.nodes} nodes, ${routeSummary.edges} edges${
      hints.length > 0 ? `; ${hints.join('; ')}` : ''
    }`,
  );
  const ranked = routeContext.ranked.slice(0, 8);
  if (ranked.length > 0) {
    console.log(
      `${GREEN}Top nodes:${RESET} ${ranked.map((node) => `${node.id} (${node.reason})`).join(', ')}`,
    );
  }
}

function printImpactContextSummary(impactContext: GraphImpactContext): void {
  const summary = impactContext.summary;
  const hints = [
    summary.routes > 0 ? `${summary.routes} route(s)` : null,
    summary.pages > 0 ? `${summary.pages} page(s)` : null,
    summary.components > 0 ? `${summary.components} component(s)` : null,
    summary.openFindings > 0 ? `${summary.openFindings} finding(s)` : null,
    summary.evidence > 0 ? `${summary.evidence} evidence node(s)` : null,
  ].filter(Boolean);
  console.log('');
  console.log(
    `${GREEN}Impact subgraph:${RESET} ${summary.nodes} nodes, ${summary.edges} edges${
      summary.truncated ? ` (truncated from ${summary.totalNodes}/${summary.totalEdges})` : ''
    }${hints.length > 0 ? `; ${hints.join('; ')}` : ''}`,
  );
  const ranked = impactContext.ranked.slice(0, 8);
  if (ranked.length > 0) {
    console.log(
      `${GREEN}Top impact nodes:${RESET} ${ranked
        .map((node) => `${node.id} (${node.reason})`)
        .join(', ')}`,
    );
  }
}

function printSelectedSnapshotSummary(
  artifacts: GraphArtifactBuild,
  selected: GraphSnapshotSelection,
  comparison: GraphComparisonPayload | undefined,
  displayRoot?: string,
): void {
  if (selected.selector !== 'current') {
    console.log('');
    console.log(
      `${GREEN}Selected snapshot:${RESET} ${selected.snapshot.id} (${selected.snapshot.summary.nodes} nodes, ${selected.snapshot.summary.edges} edges)`,
    );
    console.log(
      `  ${DIM}${pathForDisplay(artifacts.projectRoot, selected.path, displayRoot)}${RESET}`,
    );
  }

  if (comparison) {
    console.log('');
    console.log(
      `${GREEN}Snapshot diff:${RESET} ${comparison.from ?? 'empty'} -> ${comparison.to}, ${comparison.summary.total} op(s)`,
    );
    const hints = [
      comparison.summary.findings.added > 0
        ? `${comparison.summary.findings.added} finding added`
        : null,
      comparison.summary.findings.resolved > 0
        ? `${comparison.summary.findings.resolved} finding resolved`
        : null,
      comparison.summary.evidence.added > 0
        ? `${comparison.summary.evidence.added} evidence added`
        : null,
    ].filter(Boolean);
    if (hints.length > 0) {
      console.log(`${GREEN}Diff detail:${RESET} ${hints.join(', ')}`);
    }
  }
}

export function cmdGraphHelp(): void {
  console.log(`decantr graph [--project <path>] [--route <route>] [--node <id>] [--file <path>] [--task <text>] [--snapshot-id <id>] [--compare-to <id>] [--capsule-source-limit <count>] [--check] [--json]

Build Decantr's typed Contract graph artifacts from the project-owned Essence,
accepted local rules, accepted style bridge, Brownfield analysis, and local evidence.

Outputs:
  .decantr/graph/graph.snapshot.json
  .decantr/graph/snapshots/<snapshot-id>.json
  .decantr/graph/graph.manifest.json
  .decantr/graph/graph.diff.json
  .decantr/graph/contract-capsule.json

Options:
  --project <path>  Run against a workspace app/package
  --route <route>    Include the route-scoped graph subgraph in output
  --node <id>        Include impact context for a graph node, such as cmp:button
  --file <path>      Include impact context for a source file, such as src/app/page.tsx
  --impact           Require impact context when --node or --file is present
  --task <text>      Boost route/impact ranking with task keywords
  --snapshot-id <id> Inspect "current" or a snapshot from .decantr/graph/snapshots
  --compare-to <id>  Diff the selected snapshot against another snapshot or "current"
  --include-diff-ops Include bounded diff operations in JSON output
  --limit <count>    Limit JSON diff operations or impact nodes
  --capsule-source-limit <count>
                    Limit SourceArtifact path handles in contract-capsule.json
  --check           Verify artifacts are present and current without writing
  --json            Print machine-readable summary
`);
}

export async function cmdGraph(
  projectRoot: string = process.cwd(),
  options: GraphCommandOptions = {},
): Promise<void> {
  let artifacts: GraphArtifactBuild | null = null;
  try {
    artifacts = buildGraphArtifacts(projectRoot, {
      capsuleSourceLimit: options.capsuleSourceLimit,
    });
  } catch (error) {
    console.error(`${RED}${(error as Error).message}${RESET}`);
    process.exitCode = 1;
    return;
  }

  if (!artifacts) {
    console.error(`${RED}No decantr.essence.json found. Run \`decantr init\` first.${RESET}`);
    process.exitCode = 1;
    return;
  }

  let selectedSnapshot: GraphSnapshotSelection;
  let comparison: GraphComparisonPayload | undefined;
  try {
    selectedSnapshot = readGraphSnapshotSelection(artifacts, options.snapshotId);
    if (options.compareTo) {
      const baseline = readGraphSnapshotSelection(artifacts, options.compareTo);
      comparison = comparisonPayload(
        diffGraphSnapshots(baseline.snapshot, selectedSnapshot.snapshot),
        options.includeDiffOps,
        options.limit,
      );
    }
  } catch (error) {
    console.error(`${RED}${(error as Error).message}${RESET}`);
    process.exitCode = 1;
    return;
  }

  const routeContext = options.route
    ? buildGraphRouteContext(selectedSnapshot.snapshot, options.route, { task: options.task })
    : undefined;
  if (options.route && !routeContext) {
    console.error(`${RED}Route not found in Decantr typed graph: ${options.route}${RESET}`);
    console.error(
      `${DIM}Known routes: ${
        graphAvailableRoutes(selectedSnapshot.snapshot).join(', ') || 'none'
      }${RESET}`,
    );
    process.exitCode = 1;
    return;
  }

  const fileNodeId = graphSourceNodeIdForFile(projectRoot, selectedSnapshot.snapshot, options.file);
  if (options.file && !fileNodeId) {
    console.error(`${RED}Source file not found in Decantr typed graph: ${options.file}${RESET}`);
    console.error(
      `${DIM}Run \`decantr analyze\` and \`decantr graph\` after the file is visible in Brownfield route or component evidence.${RESET}`,
    );
    process.exitCode = 1;
    return;
  }

  if (options.impact && !options.node && !options.file) {
    console.error(`${RED}--impact requires --node <graph-node-id> or --file <path>.${RESET}`);
    process.exitCode = 1;
    return;
  }

  const impactSeedIds = [
    ...new Set([options.node, fileNodeId].filter((value): value is string => Boolean(value))),
  ];
  const impactSelection: ImpactContextSelection | undefined =
    impactSeedIds.length > 0
      ? {
          node: options.node,
          file: options.file,
          resolvedNodeIds: impactSeedIds,
        }
      : undefined;
  const impactContext =
    impactSeedIds.length > 0
      ? buildGraphImpactContext(selectedSnapshot.snapshot, impactSeedIds, {
          task: options.task,
          limit: options.limit,
        })
      : undefined;
  if (impactSeedIds.length > 0 && !impactContext) {
    console.error(
      `${RED}Impact seed not found in Decantr typed graph: ${impactSeedIds.join(', ')}${RESET}`,
    );
    process.exitCode = 1;
    return;
  }

  if (options.check) {
    const stale = artifacts.staleArtifacts.length > 0;
    if (options.json) {
      console.log(
        JSON.stringify(
          {
            ...summaryPayload(
              artifacts,
              routeContext,
              impactContext,
              selectedSnapshot,
              comparison,
              impactSelection,
            ),
            stale,
          },
          null,
          2,
        ),
      );
    } else if (stale) {
      console.log(`${RED}Decantr typed graph artifacts are stale.${RESET}`);
      for (const path of artifacts.staleArtifacts) {
        console.log(`  ${pathForDisplay(artifacts.projectRoot, path, options.displayRoot)}`);
      }
      console.log(`${DIM}Run \`decantr graph\` to regenerate graph artifacts.${RESET}`);
    } else {
      console.log(`${GREEN}Decantr typed graph artifacts are current.${RESET}`);
    }
    printSelectedSnapshotSummary(artifacts, selectedSnapshot, comparison, options.displayRoot);
    if (routeContext) printRouteContextSummary(routeContext);
    if (impactContext) printImpactContextSummary(impactContext);
    if (stale) process.exitCode = 1;
    return;
  }

  writeGraphArtifacts(artifacts);

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          ...summaryPayload(
            artifacts,
            routeContext,
            impactContext,
            selectedSnapshot,
            comparison,
            impactSelection,
          ),
          wrote: true,
        },
        null,
        2,
      ),
    );
  } else {
    printGraphSummary(artifacts, options.displayRoot);
    printSelectedSnapshotSummary(artifacts, selectedSnapshot, comparison, options.displayRoot);
    if (routeContext) printRouteContextSummary(routeContext);
    if (impactContext) printImpactContextSummary(impactContext);
  }
}
