import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { isV4, validateEssence } from '@decantr/essence-spec';
import {
  type AdoptionGovernanceAxisV1,
  type AdoptionMutationAxisV1,
  type AdoptionMutationReceiptV1,
  type AdoptionObservationAxisV1,
  type AdoptionTruthFactV1,
  type AdoptionTruthProvenanceV1,
  type AdoptionTruthV1,
  createAdoptionTruthV1,
} from './adoption-truth.js';
import { discoverProject, evaluateDiscoveryReadiness, type ProjectDiscovery } from './discovery.js';

export interface CreateProjectAdoptionTruthV1Options {
  generatedAt?: string;
}

export interface ProjectIdentityV1Input {
  selectedAppRoot: string;
  packageName: string | null;
  workspacePackageName: string | null;
}

type JsonRead =
  | { status: 'missing'; value: null }
  | { status: 'invalid'; value: null }
  | { status: 'valid'; value: unknown };

type PathChanges = {
  created: string[];
  updated: string[];
  deleted: string[];
};

interface ReceiptEvidence {
  present: boolean;
  complete: boolean;
  verifiedUntouched: boolean;
  verifiedBounded: boolean;
  sourceChanged: boolean;
  allChanges: PathChanges;
  hostSourceChanges: PathChanges;
  limitations: string[];
  evidencePath: string;
}

interface GraphInspection {
  status: 'fresh' | 'stale' | 'missing';
  confidence: 'low' | 'medium' | 'high';
  limitations: string[];
  provenance: AdoptionTruthProvenanceV1[];
}

const SUBJECT = {
  packageManager: 'package manager',
  framework: 'framework',
  language: 'language',
  uiSurfaces: 'UI surface authority',
  routes: 'routes',
  components: 'components',
  styling: 'styling authority',
  assistantRules: 'assistant rules',
  essence: 'Essence contract',
  graph: 'typed graph',
  packs: 'execution packs',
  localLaw: 'local law and style bridge',
  supportArtifacts: 'adoption support artifacts',
  hostSource: 'host-source integrity',
} as const;

const FACT_ID = {
  packageManager: 'project.package-manager',
  framework: 'project.framework',
  language: 'project.language',
  uiSurfaces: 'project.ui-surface-authority',
  routes: 'project.routes',
  components: 'project.components',
  styling: 'project.styling-authority',
  assistantRules: 'project.assistant-rules',
  essence: 'governance.essence-contract',
  graph: 'governance.typed-graph',
  packs: 'governance.execution-packs',
  localLaw: 'governance.local-law-style-bridge',
  supportArtifacts: 'adoption.support-artifacts',
  hostSource: 'adoption.host-source-integrity',
} as const;

const SPECIAL_GRAPH_SOURCE_KINDS = new Set([
  'brownfield-analysis',
  'evidence-bundle',
  'visual-manifest',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readJson(path: string): JsonRead {
  if (!existsSync(path)) return { status: 'missing', value: null };
  try {
    return { status: 'valid', value: JSON.parse(readFileSync(path, 'utf8')) as unknown };
  } catch {
    return { status: 'invalid', value: null };
  }
}

function normalizeSlashes(value: string): string {
  return value
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/\/{2,}/g, '/');
}

function isInside(root: string, candidate: string): boolean {
  const candidateRelative = normalizeSlashes(relative(root, candidate));
  return (
    candidateRelative === '' ||
    (!isAbsolute(candidateRelative) &&
      candidateRelative !== '..' &&
      !candidateRelative.startsWith('../'))
  );
}

function workspaceRelativePath(discovery: ProjectDiscovery, absolutePath: string): string | null {
  const candidate = resolve(absolutePath);
  if (!isInside(discovery.workspace.workspaceRoot, candidate)) return null;
  return normalizeSlashes(relative(discovery.workspace.workspaceRoot, candidate)) || '.';
}

function appEvidencePath(discovery: ProjectDiscovery, path: string): string | null {
  const candidate = isAbsolute(path) ? resolve(path) : resolve(discovery.workspace.appRoot, path);
  return workspaceRelativePath(discovery, candidate);
}

function appArtifactPath(discovery: ProjectDiscovery, path: string): string {
  return appEvidencePath(discovery, path) ?? normalizeSlashes(path);
}

function receiptEvidencePath(
  discovery: ProjectDiscovery,
  value: string,
  scopeRoot: string,
): string | null {
  const normalized = normalizeSlashes(value);
  if (!normalized) return null;
  if (isAbsolute(value)) return workspaceRelativePath(discovery, value);

  const projectPath = discovery.workspace.projectPath;
  const normalizedScope = normalizeSlashes(scopeRoot || projectPath || '.');
  const alreadyWorkspaceRelative = [projectPath, normalizedScope]
    .filter((entry) => entry !== '.')
    .some((entry) => normalized === entry || normalized.startsWith(`${entry}/`));
  const candidate = alreadyWorkspaceRelative
    ? resolve(discovery.workspace.workspaceRoot, normalized)
    : resolve(discovery.workspace.appRoot, normalized);
  return workspaceRelativePath(discovery, candidate);
}

function sanitizeText(discovery: ProjectDiscovery, value: string): string {
  const replacements = [
    [discovery.workspace.appRoot, discovery.workspace.projectPath],
    [discovery.workspace.workspaceRoot, '.'],
  ] as const;
  let sanitized = value;
  for (const [absolutePath, relativePath] of replacements) {
    sanitized = sanitized.split(absolutePath).join(relativePath);
  }
  return sanitized;
}

function uniqueText(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort();
}

function provenance(
  kind: AdoptionTruthProvenanceV1['kind'],
  path: string | null,
  detail: string,
): AdoptionTruthProvenanceV1 {
  return { kind, path, detail };
}

function fileHash(path: string): string {
  return `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((item) => stableJson(item)).join(',')}]`;
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

function semanticHash(value: unknown): string {
  return `sha256:${createHash('sha256').update(stableJson(value)).digest('hex')}`;
}

function semanticGraphSourceHash(kind: string, value: unknown): string | null {
  if (!isRecord(value)) return null;
  if (kind === 'brownfield-analysis') {
    const project = isRecord(value.project) ? value.project : {};
    const routes = isRecord(value.routes) ? value.routes : {};
    const styling = isRecord(value.styling) ? value.styling : {};
    const layout = isRecord(value.layout) ? value.layout : {};
    const features = isRecord(value.features) ? value.features : {};
    return semanticHash({
      project: {
        framework: project.framework,
        frameworkVersion: project.frameworkVersion,
        packageManager: project.packageManager,
        hasTypeScript: project.hasTypeScript,
        hasTailwind: project.hasTailwind,
        projectScope: project.projectScope,
      },
      routes: {
        strategy: routes.strategy,
        routes: (Array.isArray(routes.routes) ? routes.routes : []).map((entry) => {
          const route = isRecord(entry) ? entry : {};
          return { path: route.path, file: route.file, hasLayout: route.hasLayout };
        }),
      },
      styling: {
        approach: styling.approach,
        configFile: styling.configFile,
        darkMode: styling.darkMode,
        cssVariables: styling.cssVariables,
      },
      layout: { shellPattern: layout.shellPattern },
      features: { detected: features.detected },
    });
  }
  if (kind === 'visual-manifest') {
    return semanticHash({
      version: value.version,
      localOnly: value.localOnly,
      baseUrl: value.baseUrl ?? null,
      routes: (Array.isArray(value.routes) ? value.routes : []).map((entry) => {
        const route = isRecord(entry) ? entry : {};
        return {
          route: route.route,
          url: route.url,
          screenshot: route.screenshot,
          screenshotHash: route.screenshotHash ?? null,
          status: route.status,
          error: route.error,
        };
      }),
    });
  }
  if (kind === 'evidence-bundle') {
    const health = isRecord(value.health) ? value.health : null;
    const provenanceEntries = isRecord(value.provenance) ? Object.entries(value.provenance) : [];
    return semanticHash({
      health: health
        ? {
            status: health.status,
            score: health.score,
            errorCount: health.errorCount,
            warnCount: health.warnCount,
            infoCount: health.infoCount,
            findingCount: health.findingCount,
          }
        : null,
      provenance: provenanceEntries
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => {
          const source = isRecord(entry) ? entry : {};
          return { key, path: source.path, present: source.present, hash: source.hash ?? null };
        }),
      findings: (Array.isArray(value.findings) ? value.findings : []).map((entry) => {
        const finding = isRecord(entry) ? entry : {};
        const graph = isRecord(finding.graph) ? finding.graph : null;
        const repair = isRecord(finding.repair) ? finding.repair : null;
        const repairPlan = isRecord(finding.repairPlan) ? finding.repairPlan : null;
        return {
          id: finding.id,
          code: finding.code,
          source: finding.source,
          category: finding.category,
          severity: finding.severity,
          message: finding.message,
          target: finding.target,
          rule: finding.rule,
          suggestedFix: finding.suggestedFix,
          graph: graph
            ? {
                node_id: graph.node_id,
                node_type: graph.node_type,
                route: graph.route,
                confidence: graph.confidence,
                reason: graph.reason,
              }
            : undefined,
          repair: repair?.id,
          repairPlan: repairPlan
            ? {
                id: repairPlan.id,
                actions: repairPlan.actions,
                readTargets: repairPlan.readTargets,
                commands: repairPlan.commands,
              }
            : undefined,
          evidence: finding.evidence,
          commands: finding.commands,
        };
      }),
    });
  }
  return null;
}

function normalizeIdentityScope(value: string): string {
  const normalized = normalizeSlashes(value) || '.';
  if (
    isAbsolute(normalized) ||
    /^[A-Za-z]:\//.test(normalized) ||
    normalized === '..' ||
    normalized.startsWith('../') ||
    normalized.split('/').includes('..')
  ) {
    throw new Error('selectedAppRoot must be workspace-relative.');
  }
  return normalized;
}

/** Creates a clone-independent project identity from stable, workspace-relative metadata. */
export function createProjectIdentityV1(input: ProjectIdentityV1Input): string {
  const identityMaterial = JSON.stringify({
    packageName: input.packageName?.trim() || null,
    selectedAppRoot: normalizeIdentityScope(input.selectedAppRoot),
    version: 1,
    workspacePackageName: input.workspacePackageName?.trim() || null,
  });
  const digest = createHash('sha256')
    .update('decantr-project-identity-v1\0')
    .update(identityMaterial)
    .digest('hex');
  return `project:v1:sha256:${digest}`;
}

/**
 * Derives the clone-independent identity from shared discovery and package-scope metadata.
 */
export function createStableProjectIdentityV1(projectRoot: string): string {
  const discovery = discoverProject(projectRoot);
  const workspacePackageJson = readJson(join(discovery.workspace.workspaceRoot, 'package.json'));
  const workspacePackageName =
    workspacePackageJson.status === 'valid' &&
    isRecord(workspacePackageJson.value) &&
    typeof workspacePackageJson.value.name === 'string'
      ? workspacePackageJson.value.name
      : null;
  return createProjectIdentityV1({
    selectedAppRoot: discovery.workspace.projectPath,
    packageName: discovery.project.packageName,
    workspacePackageName,
  });
}

function findPackageManagerEvidence(discovery: ProjectDiscovery): string | null {
  const lockfileByManager = {
    bun: ['bun.lock', 'bun.lockb'],
    npm: ['package-lock.json'],
    pnpm: ['pnpm-lock.yaml'],
    unknown: [],
    yarn: ['yarn.lock'],
  } as const;
  let current = discovery.workspace.appRoot;
  while (true) {
    const packageJson = readJson(join(current, 'package.json'));
    if (packageJson.status === 'valid' && isRecord(packageJson.value)) {
      const declared = packageJson.value.packageManager;
      if (
        typeof declared === 'string' &&
        declared.split('@')[0] === discovery.project.packageManager
      ) {
        return workspaceRelativePath(discovery, join(current, 'package.json'));
      }
    }
    for (const lockfile of lockfileByManager[discovery.project.packageManager]) {
      const candidate = join(current, lockfile);
      if (existsSync(candidate)) return workspaceRelativePath(discovery, candidate);
    }
    if (current === discovery.workspace.workspaceRoot) break;
    const parent = dirname(current);
    if (parent === current || !isInside(discovery.workspace.workspaceRoot, parent)) break;
    current = parent;
  }
  return null;
}

function frameworkEvidencePaths(discovery: ProjectDiscovery): string[] {
  const candidatesByFramework: Record<string, string[]> = {
    angular: ['angular.json'],
    astro: ['astro.config.mjs', 'astro.config.ts'],
    nextjs: ['next.config.js', 'next.config.mjs', 'next.config.ts'],
    nuxt: ['nuxt.config.js', 'nuxt.config.ts'],
    react: ['vite.config.js', 'vite.config.ts'],
    solid: ['vite.config.js', 'vite.config.ts'],
    svelte: ['svelte.config.js', 'svelte.config.ts'],
    vue: ['vite.config.js', 'vite.config.ts'],
  };
  const candidates = [
    'package.json',
    ...(candidatesByFramework[discovery.project.framework] ?? []),
  ];
  return candidates
    .filter((path) => existsSync(join(discovery.workspace.appRoot, path)))
    .map((path) => appArtifactPath(discovery, path));
}

function languageEvidencePaths(discovery: ProjectDiscovery): string[] {
  const candidates = ['tsconfig.json', 'jsconfig.json', 'pyproject.toml', 'go.mod', 'Cargo.toml'];
  const manifestPaths = candidates
    .filter((path) => existsSync(join(discovery.workspace.appRoot, path)))
    .map((path) => appArtifactPath(discovery, path));
  const sourcePaths = [
    ...discovery.routes.taskableRoutes.map((route) => route.file),
    ...discovery.components.items.map((component) => component.file),
  ]
    .map((path) => appEvidencePath(discovery, path))
    .filter((path): path is string => Boolean(path));
  return uniqueText([...manifestPaths, ...sourcePaths]).slice(0, 24);
}

function inspectGraph(discovery: ProjectDiscovery): GraphInspection {
  const graphFiles = {
    capsule: '.decantr/graph/contract-capsule.json',
    manifest: '.decantr/graph/graph.manifest.json',
    snapshot: '.decantr/graph/graph.snapshot.json',
  } as const;
  const reads = Object.fromEntries(
    Object.entries(graphFiles).map(([key, path]) => [
      key,
      readJson(join(discovery.workspace.appRoot, path)),
    ]),
  ) as Record<keyof typeof graphFiles, JsonRead>;
  const presentEntries = Object.entries(reads).filter(([, read]) => read.status !== 'missing');
  if (presentEntries.length === 0) {
    return {
      status: 'missing',
      confidence: 'high',
      limitations: ['No typed graph snapshot, manifest, or contract capsule was found.'],
      provenance: [],
    };
  }

  const provenanceEntries = presentEntries.map(([key]) =>
    provenance(
      'generated_artifact',
      appArtifactPath(discovery, graphFiles[key as keyof typeof graphFiles]),
      `Typed graph ${key} artifact.`,
    ),
  );
  const limitations: string[] = [];
  if (Object.values(reads).some((read) => read.status === 'invalid')) {
    limitations.push('One or more typed graph artifacts could not be parsed as JSON.');
  }
  if (Object.values(reads).some((read) => read.status === 'missing')) {
    limitations.push('The typed graph artifact set is incomplete.');
  }
  if (limitations.length > 0) {
    return {
      status: 'stale',
      confidence: 'high',
      limitations,
      provenance: provenanceEntries,
    };
  }

  const snapshot = reads.snapshot.value;
  const manifest = reads.manifest.value;
  const capsule = reads.capsule.value;
  if (!isRecord(snapshot) || !isRecord(manifest) || !isRecord(capsule)) {
    return {
      status: 'stale',
      confidence: 'high',
      limitations: ['The typed graph artifacts do not contain the expected object values.'],
      provenance: provenanceEntries,
    };
  }

  const snapshotId = typeof snapshot.id === 'string' ? snapshot.id : null;
  const manifestSnapshotId = typeof manifest.snapshot_id === 'string' ? manifest.snapshot_id : null;
  const capsuleSnapshotId = typeof capsule.snapshot_id === 'string' ? capsule.snapshot_id : null;
  if (!snapshotId || manifestSnapshotId !== snapshotId || capsuleSnapshotId !== snapshotId) {
    limitations.push('Typed graph snapshot identities do not agree across generated artifacts.');
  }

  const sources = Array.isArray(manifest.sources) ? manifest.sources : [];
  if (sources.length === 0) {
    limitations.push('The typed graph manifest does not record source artifacts.');
  }
  for (const source of sources) {
    if (!isRecord(source)) {
      limitations.push('The typed graph manifest contains an invalid source artifact entry.');
      continue;
    }
    const sourcePath = typeof source.path === 'string' ? source.path : null;
    const expectedHash = typeof source.hash === 'string' ? source.hash : null;
    const kind = typeof source.kind === 'string' ? source.kind : 'unknown';
    if (!sourcePath || !expectedHash) {
      limitations.push('A typed graph source artifact is missing its path or hash.');
      continue;
    }
    const absoluteSourcePath = resolve(discovery.workspace.appRoot, sourcePath);
    if (!isInside(discovery.workspace.appRoot, absoluteSourcePath)) {
      limitations.push('A typed graph source artifact escapes the selected application root.');
      continue;
    }
    if (!existsSync(absoluteSourcePath)) {
      limitations.push(
        `Typed graph source ${appArtifactPath(discovery, sourcePath)} is no longer present.`,
      );
      continue;
    }
    try {
      const actualHash = SPECIAL_GRAPH_SOURCE_KINDS.has(kind)
        ? semanticGraphSourceHash(kind, readJson(absoluteSourcePath).value)
        : fileHash(absoluteSourcePath);
      if (actualHash === expectedHash) continue;
    } catch {
      limitations.push(
        `Typed graph source ${appArtifactPath(discovery, sourcePath)} could not be read.`,
      );
      continue;
    }
    limitations.push(
      `Typed graph source ${appArtifactPath(discovery, sourcePath)} no longer matches its recorded evidence.`,
    );
  }

  if (limitations.length > 0) {
    return {
      status: 'stale',
      confidence: 'high',
      limitations: uniqueText(limitations),
      provenance: provenanceEntries,
    };
  }
  return {
    status: 'fresh',
    confidence: 'high',
    limitations: [],
    provenance: provenanceEntries,
  };
}

function normalizeReceiptPaths(
  discovery: ProjectDiscovery,
  value: unknown,
  label: string,
  scopeRoot: string,
  limitations: string[],
): string[] {
  if (!Array.isArray(value)) {
    limitations.push(`Adoption receipt ${label} paths are missing or invalid.`);
    return [];
  }
  const normalized: string[] = [];
  for (const entry of value) {
    if (typeof entry !== 'string') {
      limitations.push(`Adoption receipt ${label} contains a non-string path.`);
      continue;
    }
    const path = receiptEvidencePath(discovery, entry, scopeRoot);
    if (!path) {
      limitations.push(`Adoption receipt ${label} contains a path outside the workspace.`);
      continue;
    }
    normalized.push(path);
  }
  return uniqueText(normalized);
}

function readPathChanges(
  discovery: ProjectDiscovery,
  value: unknown,
  label: string,
  scopeRoot: string,
  limitations: string[],
): PathChanges {
  if (!isRecord(value)) {
    limitations.push(`Adoption receipt ${label} changes are missing or invalid.`);
    return { created: [], updated: [], deleted: [] };
  }
  return {
    created: normalizeReceiptPaths(
      discovery,
      value.created,
      `${label}.created`,
      scopeRoot,
      limitations,
    ),
    updated: normalizeReceiptPaths(
      discovery,
      value.updated,
      `${label}.updated`,
      scopeRoot,
      limitations,
    ),
    deleted: normalizeReceiptPaths(
      discovery,
      value.deleted,
      `${label}.deleted`,
      scopeRoot,
      limitations,
    ),
  };
}

function changeCount(changes: PathChanges): number {
  return changes.created.length + changes.updated.length + changes.deleted.length;
}

function inspectReceipt(discovery: ProjectDiscovery, projectJson: JsonRead): ReceiptEvidence {
  const evidencePath = appArtifactPath(discovery, '.decantr/project.json');
  const missing = (limitations: string[] = []): ReceiptEvidence => ({
    present: false,
    complete: false,
    verifiedUntouched: false,
    verifiedBounded: false,
    sourceChanged: false,
    allChanges: { created: [], updated: [], deleted: [] },
    hostSourceChanges: { created: [], updated: [], deleted: [] },
    limitations,
    evidencePath,
  });
  if (projectJson.status === 'missing') {
    return missing(['No .decantr/project.json adoption receipt was found.']);
  }
  if (projectJson.status === 'invalid' || !isRecord(projectJson.value)) {
    return missing(['.decantr/project.json could not be read as a valid object.']);
  }
  const initialized = projectJson.value.initialized;
  const adoption = isRecord(initialized) ? initialized.adoption : null;
  if (!isRecord(adoption)) {
    return missing([
      'This project predates adoption receipts, so adoption-time mutation cannot be proven.',
    ]);
  }

  const limitations: string[] = [];
  const scope = isRecord(adoption.scope) ? adoption.scope : null;
  if (!scope || typeof scope.root !== 'string') {
    limitations.push('Adoption receipt scope metadata is missing or invalid.');
  }
  const scopeRoot = typeof scope?.root === 'string' ? scope.root : discovery.workspace.projectPath;
  const changes = isRecord(adoption.changes) ? adoption.changes : null;
  const allChanges = readPathChanges(discovery, changes, 'all', scopeRoot, limitations);
  const hostSourceChanges = readPathChanges(
    discovery,
    changes?.hostSource,
    'hostSource',
    scopeRoot,
    limitations,
  );
  const integrity = isRecord(adoption.integrity) ? adoption.integrity : null;
  const status = typeof integrity?.status === 'string' ? integrity.status : null;
  const beforeHash =
    typeof integrity?.hostSourceBeforeHash === 'string' ? integrity.hostSourceBeforeHash : null;
  const afterHash =
    typeof integrity?.hostSourceAfterHash === 'string' ? integrity.hostSourceAfterHash : null;
  const approvedHostSourceMutations = Array.isArray(adoption.approvedHostSourceMutations)
    ? adoption.approvedHostSourceMutations
    : [];
  const approvedHostSourcePaths: string[] = [];
  if (status === 'verified-bounded') {
    if (!Array.isArray(adoption.approvedHostSourceMutations)) {
      limitations.push('Bounded adoption receipt approvals are missing or invalid.');
    } else {
      for (const entry of approvedHostSourceMutations) {
        const rawPath = isRecord(entry) && typeof entry.path === 'string' ? entry.path : null;
        const path = rawPath ? receiptEvidencePath(discovery, rawPath, scopeRoot) : null;
        if (
          !isRecord(entry) ||
          entry.kind !== 'tailwind-v4-source-isolation' ||
          entry.verified !== true ||
          typeof entry.beforeHash !== 'string' ||
          typeof entry.afterHash !== 'string' ||
          !path
        ) {
          limitations.push(
            'Bounded adoption receipt contains an invalid source-mutation approval.',
          );
          continue;
        }
        approvedHostSourcePaths.push(path);
      }
    }
  }

  if (adoption.version !== 1) limitations.push('Adoption receipt version 1 is required.');
  if (!integrity || typeof integrity.complete !== 'boolean') {
    limitations.push('Adoption receipt integrity metadata is missing or invalid.');
  }
  if (
    !['verified-untouched', 'verified-bounded', 'source-changed', 'incomplete'].includes(
      status ?? '',
    )
  ) {
    limitations.push('Adoption receipt integrity status is missing or unsupported.');
  }
  if (adoption.workflowCompleted !== true) {
    limitations.push('The recorded adoption workflow did not complete successfully.');
  }
  if (!Array.isArray(adoption.limitations)) {
    limitations.push('Adoption receipt limitations metadata is missing or invalid.');
  } else if (adoption.limitations.length > 0) {
    for (const entry of adoption.limitations) {
      const phase = isRecord(entry) && typeof entry.phase === 'string' ? entry.phase : 'capture';
      const code = isRecord(entry) && typeof entry.code === 'string' ? entry.code : 'limitation';
      const rawPath = isRecord(entry) && typeof entry.path === 'string' ? entry.path : null;
      const path = rawPath ? receiptEvidencePath(discovery, rawPath, scopeRoot) : null;
      limitations.push(`Adoption receipt reported ${phase} ${code}${path ? ` at ${path}` : ''}.`);
    }
  }
  for (const changeType of ['created', 'updated', 'deleted'] as const) {
    if (hostSourceChanges[changeType].some((path) => !allChanges[changeType].includes(path))) {
      limitations.push(
        `Adoption receipt hostSource.${changeType} paths do not match the aggregate change inventory.`,
      );
    }
  }

  const structurallyComplete =
    adoption.version === 1 &&
    integrity?.complete === true &&
    adoption.workflowCompleted === true &&
    limitations.length === 0;
  const verifiedUntouched =
    structurallyComplete &&
    status === 'verified-untouched' &&
    beforeHash !== null &&
    beforeHash === afterHash &&
    changeCount(hostSourceChanges) === 0;
  const hostSourceChangePaths = [
    ...hostSourceChanges.created,
    ...hostSourceChanges.updated,
    ...hostSourceChanges.deleted,
  ].sort();
  const approvedPaths = uniqueText(approvedHostSourcePaths);
  const verifiedBounded =
    structurallyComplete &&
    status === 'verified-bounded' &&
    beforeHash !== null &&
    afterHash !== null &&
    beforeHash !== afterHash &&
    hostSourceChanges.created.length === 0 &&
    hostSourceChanges.deleted.length === 0 &&
    hostSourceChanges.updated.length > 0 &&
    hostSourceChangePaths.length === approvedPaths.length &&
    hostSourceChangePaths.every((path, index) => path === approvedPaths[index]);
  const sourceChanged =
    structurallyComplete && status === 'source-changed' && changeCount(hostSourceChanges) > 0;
  if (status === 'verified-untouched' && !verifiedUntouched) {
    limitations.push(
      'The receipt claims verified-untouched source, but its hashes, path changes, or completion evidence do not prove that claim.',
    );
  }
  if (status === 'source-changed' && !sourceChanged) {
    limitations.push(
      'The receipt reports source changes without complete matching host-source path evidence.',
    );
  }
  if (status === 'verified-bounded' && !verifiedBounded) {
    limitations.push(
      'The receipt claims verified-bounded source mutation without complete matching Tailwind v4 isolation evidence.',
    );
  }
  if (status === 'incomplete') {
    limitations.push('The adoption receipt explicitly marks source-integrity evidence incomplete.');
  }

  return {
    present: true,
    complete: structurallyComplete && (verifiedUntouched || verifiedBounded || sourceChanged),
    verifiedUntouched,
    verifiedBounded,
    sourceChanged,
    allChanges,
    hostSourceChanges,
    limitations: uniqueText(limitations),
    evidencePath,
  };
}

function filterChanges(changes: PathChanges, accepts: (path: string) => boolean): PathChanges {
  return {
    created: changes.created.filter(accepts),
    updated: changes.updated.filter(accepts),
    deleted: changes.deleted.filter(accepts),
  };
}

function receiptOutcome(changes: PathChanges): AdoptionMutationReceiptV1['outcome'] {
  if (changes.created.length > 0 && changes.updated.length === 0 && changes.deleted.length === 0) {
    return 'created';
  }
  return changeCount(changes) > 0 ? 'updated' : 'untouched';
}

function projectedReceipt(
  id: string,
  subject: string,
  receipt: ReceiptEvidence,
  changes: PathChanges,
): AdoptionMutationReceiptV1 {
  return {
    id,
    operation: 'Decantr initialization/adoption receipt projection',
    subjects: [subject],
    outcome: receiptOutcome(changes),
    complete: receipt.complete,
    createdPaths: changes.created,
    updatedPaths: changes.updated,
    deletedPaths: changes.deleted,
    evidencePaths: [receipt.evidencePath],
    limitations: receipt.limitations,
  };
}

function mutationFromReceipt(
  id: string,
  subject: string,
  receipt: ReceiptEvidence,
  accepts: (path: string) => boolean,
  receipts: AdoptionMutationReceiptV1[],
): AdoptionMutationAxisV1 {
  if (!receipt.present || !receipt.complete) return { state: 'not_checked', receiptIds: [] };
  const projected = projectedReceipt(
    id,
    subject,
    receipt,
    filterChanges(receipt.allChanges, accepts),
  );
  receipts.push(projected);
  return { state: projected.outcome, receiptIds: [projected.id] };
}

function hostSourceMutation(
  receipt: ReceiptEvidence,
  receipts: AdoptionMutationReceiptV1[],
): AdoptionMutationAxisV1 {
  if (!receipt.present) return { state: 'not_checked', receiptIds: [] };
  const projected = projectedReceipt(
    'adoption-receipt:v1:host-source',
    SUBJECT.hostSource,
    receipt,
    receipt.hostSourceChanges,
  );
  receipts.push(projected);
  if (receipt.verifiedUntouched) return { state: 'untouched', receiptIds: [projected.id] };
  if (receipt.verifiedBounded) return { state: projected.outcome, receiptIds: [projected.id] };
  if (receipt.sourceChanged) return { state: projected.outcome, receiptIds: [projected.id] };
  return { state: 'not_checked', receiptIds: [projected.id] };
}

function observation(
  state: AdoptionObservationAxisV1['state'],
  confidence: AdoptionObservationAxisV1['confidence'],
  evidence: AdoptionTruthProvenanceV1[],
): AdoptionObservationAxisV1 {
  return { state, confidence, provenance: evidence };
}

function governance(
  state: AdoptionGovernanceAxisV1['state'],
  authority: string | null,
  evidence: AdoptionTruthProvenanceV1[] = [],
): AdoptionGovernanceAxisV1 {
  return { state, authority, provenance: evidence };
}

function unverifiedMutation(): AdoptionMutationAxisV1 {
  return { state: 'not_checked', receiptIds: [] };
}

function fact(input: AdoptionTruthFactV1): AdoptionTruthFactV1 {
  return input;
}

function scopedCommand(command: string, discovery: ProjectDiscovery): string {
  if (discovery.workspace.scope === 'single-app') return command;
  const projectPath = /^[A-Za-z0-9_./-]+$/.test(discovery.workspace.projectPath)
    ? discovery.workspace.projectPath
    : `'${discovery.workspace.projectPath.replace(/'/g, `'"'"'`)}'`;
  return `${command} --project ${projectPath}`;
}

function acceptance(read: JsonRead): { accepted: boolean; present: boolean; invalid: boolean } {
  return {
    accepted: read.status === 'valid' && isRecord(read.value) && read.value.status === 'accepted',
    present: read.status !== 'missing',
    invalid: read.status === 'invalid' || (read.status === 'valid' && !isRecord(read.value)),
  };
}

/** Builds the canonical read-only project adoption truth from shared discovery and project evidence. */
export function createProjectAdoptionTruthV1(
  projectRoot: string,
  options: CreateProjectAdoptionTruthV1Options = {},
): AdoptionTruthV1 {
  const discovery = discoverProject(projectRoot);
  const essencePath = join(discovery.workspace.appRoot, 'decantr.essence.json');
  const projectJson = readJson(join(discovery.workspace.appRoot, '.decantr', 'project.json'));
  const essenceRead = readJson(essencePath);
  const essenceValidation =
    essenceRead.status === 'valid' ? validateEssence(essenceRead.value) : null;
  const essenceValid =
    essenceRead.status === 'valid' && isV4(essenceRead.value) && essenceValidation?.valid === true;
  const essenceRoutes = new Set<string>();
  if (
    essenceValid &&
    isRecord(essenceRead.value) &&
    isRecord(essenceRead.value.blueprint) &&
    isRecord(essenceRead.value.blueprint.routes)
  ) {
    for (const route of Object.keys(essenceRead.value.blueprint.routes)) essenceRoutes.add(route);
  }

  const graph = inspectGraph(discovery);
  const packRead = readJson(
    join(discovery.workspace.appRoot, '.decantr', 'context', 'pack-manifest.json'),
  );
  const packManifestValid = packRead.status === 'valid' && isRecord(packRead.value);
  const patternRead = readJson(
    join(discovery.workspace.appRoot, '.decantr', 'local-patterns.json'),
  );
  const rulesRead = readJson(join(discovery.workspace.appRoot, '.decantr', 'rules.json'));
  const styleBridgeRead = readJson(
    join(discovery.workspace.appRoot, '.decantr', 'style-bridge.json'),
  );
  const patterns = acceptance(patternRead);
  const rules = acceptance(rulesRead);
  const styleBridge = acceptance(styleBridgeRead);
  const localLawAccepted = patterns.accepted || rules.accepted || styleBridge.accepted;
  const receipt = inspectReceipt(discovery, projectJson);
  const mutationReceipts: AdoptionMutationReceiptV1[] = [];

  const essenceWorkspacePath = appArtifactPath(discovery, 'decantr.essence.json');
  const graphPrefix = `${appArtifactPath(discovery, '.decantr/graph')}/`;
  const contextPrefix = `${appArtifactPath(discovery, '.decantr/context')}/`;
  const localLawPaths = new Set(
    ['.decantr/local-patterns.json', '.decantr/rules.json', '.decantr/style-bridge.json'].map(
      (path) => appArtifactPath(discovery, path),
    ),
  );
  const essenceMutation = mutationFromReceipt(
    'adoption-receipt:v1:essence',
    SUBJECT.essence,
    receipt,
    (path) => path === essenceWorkspacePath,
    mutationReceipts,
  );
  const graphMutation = mutationFromReceipt(
    'adoption-receipt:v1:graph',
    SUBJECT.graph,
    receipt,
    (path) => path.startsWith(graphPrefix),
    mutationReceipts,
  );
  const packsMutation = mutationFromReceipt(
    'adoption-receipt:v1:packs',
    SUBJECT.packs,
    receipt,
    (path) => path.startsWith(contextPrefix),
    mutationReceipts,
  );
  const localLawMutation = mutationFromReceipt(
    'adoption-receipt:v1:local-law',
    SUBJECT.localLaw,
    receipt,
    (path) => localLawPaths.has(path),
    mutationReceipts,
  );
  const hostSourcePaths = new Set([
    ...receipt.hostSourceChanges.created,
    ...receipt.hostSourceChanges.updated,
    ...receipt.hostSourceChanges.deleted,
  ]);
  const supportArtifactsMutation = mutationFromReceipt(
    'adoption-receipt:v1:support-artifacts',
    SUBJECT.supportArtifacts,
    receipt,
    (path) =>
      path !== essenceWorkspacePath &&
      !path.startsWith(graphPrefix) &&
      !path.startsWith(contextPrefix) &&
      !localLawPaths.has(path) &&
      !hostSourcePaths.has(path),
    mutationReceipts,
  );
  const hostMutation = hostSourceMutation(receipt, mutationReceipts);

  const initAction = `Run \`${scopedCommand('decantr init --existing', discovery)}\` to establish a valid Essence V4 contract.`;
  const graphAction = `Run \`${scopedCommand('decantr graph', discovery)}\` to regenerate current typed graph artifacts.`;
  const localLawAction = `Run \`${scopedCommand('decantr codify --from-audit', discovery)}\`, review the proposal, and explicitly accept project-owned local law.`;
  const firstRoute = [...discovery.routes.taskableRoutes].sort((left, right) =>
    left.path.localeCompare(right.path),
  )[0]?.path;
  const firstSurface = discovery.surfaces.items
    .filter((surface) => surface.taskability === 'ready' || surface.taskability === 'limited')
    .sort((left, right) => left.id.localeCompare(right.id))[0];
  const taskBase = firstRoute
    ? `decantr task ${JSON.stringify(firstRoute)} "<task>"`
    : firstSurface
      ? `decantr task ${JSON.stringify(firstSurface.id)} "<task>"`
      : 'decantr task <target> "<task>"';
  const readyAction = `Run \`${scopedCommand(taskBase, discovery)}\` before the next governed edit.`;
  const nextAction = !essenceValid
    ? initAction
    : graph.status !== 'fresh'
      ? graphAction
      : !localLawAccepted
        ? localLawAction
        : readyAction;

  const packageManagerPath = findPackageManagerEvidence(discovery);
  const packageManagerLimitations =
    discovery.project.packageManager === 'unknown'
      ? ['No workspace package-manager declaration or supported lockfile was discovered.']
      : [];
  const packageManagerProvenance = packageManagerPath
    ? [
        provenance(
          'package_manifest',
          packageManagerPath,
          `Workspace package manager is ${discovery.project.packageManager}.`,
        ),
      ]
    : [
        provenance(
          'inference',
          null,
          'Shared discovery did not resolve a workspace package manager.',
        ),
      ];

  const frameworkLimitations =
    discovery.project.framework === 'unknown'
      ? ['Framework could not be determined from selected-app manifest and source evidence.']
      : [];
  const frameworkProvenance = frameworkEvidencePaths(discovery).map((path) =>
    provenance(
      path.endsWith('package.json') ? 'package_manifest' : 'source',
      path,
      `Selected-app evidence for ${discovery.project.framework}${discovery.project.frameworkVersion ? ` ${discovery.project.frameworkVersion}` : ''}.`,
    ),
  );
  if (frameworkProvenance.length === 0) {
    frameworkProvenance.push(
      provenance(
        'inference',
        null,
        discovery.project.evidence.join('; ') || 'No framework evidence was resolved.',
      ),
    );
  }

  const languageLimitations =
    discovery.project.primaryLanguage === 'unknown'
      ? ['Primary language could not be determined from selected-app source evidence.']
      : [];
  const languageProvenance = languageEvidencePaths(discovery).map((path) =>
    provenance(
      path.endsWith('package.json') || /(?:ts|js)config\.json$/.test(path)
        ? 'package_manifest'
        : 'source',
      path,
      `Selected-app ${discovery.project.primaryLanguage} evidence.`,
    ),
  );
  if (languageProvenance.length === 0) {
    languageProvenance.push(
      provenance('inference', null, 'Shared discovery found no primary-language evidence path.'),
    );
  }

  const routeProvenance = discovery.routes.taskableRoutes.map((route) =>
    provenance(
      'source',
      appEvidencePath(discovery, route.file),
      `Taskable ${route.path} route from ${route.source} evidence.`,
    ),
  );
  for (const path of discovery.routes.authorityFiles) {
    const evidencePath = appEvidencePath(discovery, path);
    if (routeProvenance.some((entry) => entry.path === evidencePath)) continue;
    routeProvenance.push(provenance('source', evidencePath, 'Production route-authority source.'));
  }
  const discoveryReadiness = evaluateDiscoveryReadiness(discovery);
  const uiSurfaceProvenance = discovery.surfaces.items
    .slice(0, 200)
    .flatMap((surface) =>
      surface.files.map((path) =>
        provenance(
          'source',
          appEvidencePath(discovery, path),
          `${surface.id} has ${surface.authority} authority and ${surface.taskability} taskability.`,
        ),
      ),
    );
  const componentProvenance = discovery.components.items.map((component) =>
    provenance(
      'source',
      appEvidencePath(discovery, component.file),
      `${component.name} component candidate from ${component.kind} evidence.`,
    ),
  );
  const assistantProvenance = discovery.assistant.ruleFiles.map((path) =>
    provenance(
      'assistant_rule',
      appEvidencePath(discovery, path),
      'Assistant rule inherited by the selected application.',
    ),
  );
  const stylingConfigPath =
    discovery.styling.configFile &&
    existsSync(join(discovery.workspace.appRoot, discovery.styling.configFile))
      ? appArtifactPath(discovery, discovery.styling.configFile)
      : null;
  const stylingProvenance = [
    provenance(
      stylingConfigPath?.endsWith('package.json') ? 'package_manifest' : 'source',
      stylingConfigPath,
      `Selected-app styling approach is ${discovery.styling.approach}.`,
    ),
  ];

  const acceptedLocalLawProvenance = [
    patterns.accepted
      ? provenance(
          'contract',
          appArtifactPath(discovery, '.decantr/local-patterns.json'),
          'Accepted local pattern authority.',
        )
      : null,
    rules.accepted
      ? provenance(
          'contract',
          appArtifactPath(discovery, '.decantr/rules.json'),
          'Accepted local mechanical-rule authority.',
        )
      : null,
    styleBridge.accepted
      ? provenance(
          'contract',
          appArtifactPath(discovery, '.decantr/style-bridge.json'),
          'Accepted project style-bridge authority.',
        )
      : null,
  ].filter((entry): entry is AdoptionTruthProvenanceV1 => Boolean(entry));

  const discoveredRoutes = discovery.routes.taskableRoutes.map((route) => route.path);
  const governedRouteCount = discoveredRoutes.filter((route) => essenceRoutes.has(route)).length;
  const routeGovernance = !essenceValid
    ? governance('uncovered', null)
    : discoveredRoutes.length > 0 && governedRouteCount === discoveredRoutes.length
      ? governance('governed', 'Essence V4 route contract', [
          provenance('contract', essenceWorkspacePath, 'Essence V4 route map.'),
        ])
      : governedRouteCount > 0
        ? governance('partial', 'Essence V4 route contract', [
            provenance('contract', essenceWorkspacePath, 'Partial Essence V4 route coverage.'),
          ])
        : governance('uncovered', 'Essence V4 route contract', [
            provenance('contract', essenceWorkspacePath, 'No discovered route is contract-mapped.'),
          ]);

  const localLawPresent = patterns.present || rules.present || styleBridge.present;
  const localLawInvalid = patterns.invalid || rules.invalid || styleBridge.invalid;
  const localLawGovernance =
    patterns.accepted && rules.accepted
      ? governance('governed', 'accepted project-owned local law', acceptedLocalLawProvenance)
      : localLawAccepted
        ? governance('partial', 'accepted project-owned local law', acceptedLocalLawProvenance)
        : localLawPresent
          ? governance('advisory', null)
          : governance('uncovered', null);
  const stylingGovernance = styleBridge.accepted
    ? governance('governed', 'accepted project style bridge', acceptedLocalLawProvenance)
    : patterns.accepted || rules.accepted
      ? governance('partial', 'accepted project-owned local law', acceptedLocalLawProvenance)
      : discovery.styling.approach === 'unknown'
        ? governance('uncovered', null)
        : governance('advisory', 'observed production-source styling');

  const facts: AdoptionTruthFactV1[] = [
    fact({
      id: FACT_ID.packageManager,
      subject: SUBJECT.packageManager,
      observation: observation(
        discovery.project.packageManager === 'unknown' ? 'unknown' : 'found',
        discovery.project.packageManager === 'unknown' ? 'low' : 'high',
        packageManagerProvenance,
      ),
      governance: governance('not_applicable', null),
      mutation: unverifiedMutation(),
      limitations: packageManagerLimitations,
      nextAction:
        discovery.project.packageManager === 'unknown'
          ? 'Declare packageManager in package.json or commit one supported workspace lockfile.'
          : 'Keep package-manager evidence at workspace scope.',
    }),
    fact({
      id: FACT_ID.framework,
      subject: SUBJECT.framework,
      observation: observation(
        discovery.project.framework === 'unknown' ? 'unknown' : 'found',
        discovery.project.framework === 'unknown' ? 'low' : 'high',
        frameworkProvenance,
      ),
      governance: governance('not_applicable', null),
      mutation: unverifiedMutation(),
      limitations: frameworkLimitations,
      nextAction:
        discovery.project.framework === 'unknown'
          ? 'Confirm the selected app framework in its package manifest or framework config.'
          : 'Preserve the selected app framework unless a reviewed migration changes it.',
    }),
    fact({
      id: FACT_ID.language,
      subject: SUBJECT.language,
      observation: observation(
        discovery.project.primaryLanguage === 'unknown' ? 'unknown' : 'found',
        discovery.project.primaryLanguage === 'unknown' ? 'low' : 'high',
        languageProvenance,
      ),
      governance: governance('not_applicable', null),
      mutation: unverifiedMutation(),
      limitations: languageLimitations,
      nextAction:
        discovery.project.primaryLanguage === 'unknown'
          ? 'Confirm the selected app language with source or compiler configuration evidence.'
          : 'Use the selected app language for project-scoped edits.',
    }),
    fact({
      id: FACT_ID.uiSurfaces,
      subject: SUBJECT.uiSurfaces,
      observation: observation(
        discovery.surfaces.axes.surfaceAuthority.status === 'proven' ||
          discovery.surfaces.axes.surfaceAuthority.status === 'partial'
          ? 'found'
          : discovery.surfaces.status === 'unsupported'
            ? 'not_found'
            : 'unknown',
        discovery.surfaces.axes.surfaceAuthority.confidence,
        uiSurfaceProvenance,
      ),
      governance:
        discovery.surfaces.items.length > 0
          ? governance('advisory', 'observed project UI surfaces')
          : governance('uncovered', null),
      mutation: unverifiedMutation(),
      limitations: discovery.surfaces.reasons,
      nextAction:
        discovery.surfaces.status === 'ready'
          ? 'Select an exact UI surface target before preparing an edit.'
          : 'Select a concrete surface and resolve its blocking authority axes before editing.',
    }),
    fact({
      id: FACT_ID.routes,
      subject: SUBJECT.routes,
      observation: observation(
        discoveryReadiness.routeScopedContext === 'ready'
          ? 'found'
          : discovery.routes.routeSignalCount > 0
            ? 'unknown'
            : 'not_found',
        discovery.routes.confidence,
        routeProvenance,
      ),
      governance: routeGovernance,
      mutation: unverifiedMutation(),
      limitations: discovery.routes.limitations,
      nextAction:
        discoveryReadiness.routeScopedContext === 'ready'
          ? 'Use a discovered taskable route as the task-context scope.'
          : 'Prove the selected-app production router authority before preparing route-scoped tasks or baselines.',
    }),
    fact({
      id: FACT_ID.components,
      subject: SUBJECT.components,
      observation: observation(
        discovery.components.componentCount > 0 ? 'found' : 'not_found',
        discovery.components.confidence,
        componentProvenance,
      ),
      governance: patterns.accepted
        ? governance('partial', 'accepted local patterns', acceptedLocalLawProvenance)
        : discovery.components.componentCount > 0
          ? governance('advisory', 'observed production-source components')
          : governance('uncovered', null),
      mutation: unverifiedMutation(),
      limitations: discovery.components.limitations,
      nextAction:
        discovery.components.componentCount > 0
          ? 'Prefer discovered project-owned components before introducing new primitives.'
          : 'Review component directories and codify reusable project-owned primitives.',
    }),
    fact({
      id: FACT_ID.styling,
      subject: SUBJECT.styling,
      observation: observation(
        discovery.styling.approach === 'unknown' ? 'unknown' : 'found',
        discovery.styling.confidence,
        stylingProvenance,
      ),
      governance: stylingGovernance,
      mutation: unverifiedMutation(),
      limitations:
        discovery.styling.approach === 'unknown'
          ? [
              'Styling authority could not be determined from selected-app evidence.',
              ...discovery.styling.limitations,
            ]
          : discovery.styling.limitations,
      nextAction:
        discovery.styling.approach === 'unknown'
          ? 'Identify and codify the project-owned styling authority before visual edits.'
          : 'Use the observed project styling system and any accepted local mappings.',
    }),
    fact({
      id: FACT_ID.assistantRules,
      subject: SUBJECT.assistantRules,
      observation: observation(
        assistantProvenance.length > 0 ? 'found' : 'not_found',
        assistantProvenance.length > 0 ? 'high' : 'medium',
        assistantProvenance,
      ),
      governance:
        assistantProvenance.length > 0
          ? governance('advisory', 'project assistant rules', assistantProvenance)
          : governance('uncovered', null),
      mutation: unverifiedMutation(),
      limitations:
        assistantProvenance.length > 0
          ? []
          : ['Only supported repository and app assistant-rule filenames were inspected.'],
      nextAction:
        assistantProvenance.length > 0
          ? 'Apply inherited assistant rules to every project-scoped task.'
          : 'Add project assistant rules only when the repository needs explicit agent guidance.',
    }),
    fact({
      id: FACT_ID.essence,
      subject: SUBJECT.essence,
      observation: observation(
        essenceRead.status === 'missing'
          ? 'not_found'
          : essenceRead.status === 'invalid'
            ? 'unknown'
            : 'found',
        essenceRead.status === 'invalid' ? 'low' : 'high',
        essenceRead.status === 'missing'
          ? []
          : [provenance('contract', essenceWorkspacePath, 'Project Essence contract.')],
      ),
      governance: essenceValid
        ? governance('governed', 'Essence V4', [
            provenance('contract', essenceWorkspacePath, 'Valid Essence V4 authority.'),
          ])
        : governance('uncovered', null),
      mutation: essenceMutation,
      limitations: !essenceValid
        ? [
            essenceRead.status === 'missing'
              ? 'No decantr.essence.json contract was found.'
              : 'decantr.essence.json is not a valid Essence V4 contract.',
          ]
        : [],
      nextAction: essenceValid
        ? 'Keep Essence V4 synchronized with reviewed project intent.'
        : initAction,
    }),
    fact({
      id: FACT_ID.graph,
      subject: SUBJECT.graph,
      observation: observation(
        graph.status === 'missing' ? 'not_found' : 'found',
        graph.confidence,
        graph.provenance,
      ),
      governance:
        graph.status === 'fresh'
          ? governance('advisory', 'derived typed graph evidence', graph.provenance)
          : governance('uncovered', null),
      mutation: graphMutation,
      limitations: graph.limitations,
      nextAction: graph.status === 'fresh' ? 'Use the current graph for task impact.' : graphAction,
    }),
    fact({
      id: FACT_ID.packs,
      subject: SUBJECT.packs,
      observation: observation(
        packRead.status === 'missing' ? 'not_found' : !packManifestValid ? 'unknown' : 'found',
        packRead.status === 'missing' || packManifestValid ? 'high' : 'low',
        packRead.status === 'missing'
          ? []
          : [
              provenance(
                'generated_artifact',
                appArtifactPath(discovery, '.decantr/context/pack-manifest.json'),
                'Execution-pack manifest.',
              ),
            ],
      ),
      governance: packManifestValid
        ? governance('advisory', 'official and project-resolved execution-pack guidance')
        : governance('uncovered', null),
      mutation: packsMutation,
      limitations:
        packRead.status === 'missing'
          ? ['No execution-pack manifest was found; official guidance is not hydrated locally.']
          : !packManifestValid
            ? ['The execution-pack manifest could not be parsed as a JSON object.']
            : [],
      nextAction: packManifestValid
        ? 'Use execution packs as guidance unless accepted local authority overrides them.'
        : 'Hydrate execution packs only when richer official guidance is needed.',
    }),
    fact({
      id: FACT_ID.localLaw,
      subject: SUBJECT.localLaw,
      observation: observation(
        localLawPresent ? (localLawInvalid ? 'unknown' : 'found') : 'not_found',
        localLawInvalid ? 'low' : 'high',
        [
          patterns.present
            ? provenance(
                'contract',
                appArtifactPath(discovery, '.decantr/local-patterns.json'),
                patterns.accepted
                  ? 'Accepted local patterns.'
                  : 'Unaccepted local-pattern artifact.',
              )
            : null,
          rules.present
            ? provenance(
                'contract',
                appArtifactPath(discovery, '.decantr/rules.json'),
                rules.accepted ? 'Accepted local rules.' : 'Unaccepted local-rule artifact.',
              )
            : null,
          styleBridge.present
            ? provenance(
                'contract',
                appArtifactPath(discovery, '.decantr/style-bridge.json'),
                styleBridge.accepted
                  ? 'Accepted local style bridge.'
                  : 'Unaccepted style-bridge artifact.',
              )
            : null,
        ].filter((entry): entry is AdoptionTruthProvenanceV1 => Boolean(entry)),
      ),
      governance: localLawGovernance,
      mutation: localLawMutation,
      limitations: localLawInvalid
        ? ['One or more local-law/style-bridge artifacts could not be parsed as objects.']
        : !localLawAccepted
          ? ['No reviewed project-owned local law or style bridge is active.']
          : [],
      nextAction: localLawAccepted
        ? 'Apply accepted local authority before official guidance.'
        : localLawAction,
    }),
    fact({
      id: FACT_ID.supportArtifacts,
      subject: SUBJECT.supportArtifacts,
      observation: observation(
        receipt.present ? (receipt.complete ? 'found' : 'unknown') : 'unknown',
        receipt.complete ? 'high' : 'low',
        receipt.present
          ? [
              provenance(
                'receipt',
                receipt.evidencePath,
                'Complete initialization/adoption write inventory.',
              ),
            ]
          : [],
      ),
      governance: governance(
        'advisory',
        'Decantr initialization/adoption write boundary',
        receipt.present
          ? [provenance('receipt', receipt.evidencePath, 'Recorded non-source support writes.')]
          : [],
      ),
      mutation: supportArtifactsMutation,
      limitations: receipt.limitations,
      nextAction: receipt.complete
        ? 'Review the receipt inventory when governance documents, assistant bridges, or host ignore configuration change.'
        : 'Run a receipt-capable initialization or adoption flow before relying on support-artifact mutation claims.',
    }),
    fact({
      id: FACT_ID.hostSource,
      subject: SUBJECT.hostSource,
      observation: observation(
        receipt.present ? (receipt.complete ? 'found' : 'unknown') : 'unknown',
        receipt.complete ? 'high' : 'low',
        receipt.present
          ? [
              provenance(
                'receipt',
                receipt.evidencePath,
                'CLI initialization/adoption source-integrity receipt.',
              ),
            ]
          : [],
      ),
      governance: governance('not_applicable', null),
      mutation: hostMutation,
      limitations: receipt.limitations,
      nextAction: receipt.verifiedUntouched
        ? 'Preserve host-source authority and capture a new receipt for any future adoption pass.'
        : receipt.verifiedBounded
          ? 'Preserve the receipt-recorded Tailwind v4 source-isolation block and review any future host-source mutation separately.'
          : receipt.sourceChanged
            ? 'Review every receipt-recorded host-source change before relying on adoption output.'
            : 'Run a receipt-capable adoption flow before making host-source integrity claims.',
    }),
  ];

  const limitations = uniqueText([
    ...discovery.limitations,
    ...(discovery.confidence.level === 'low'
      ? [
          `Shared discovery confidence is low (${discovery.confidence.score}/100): ${discovery.confidence.reasons.join('; ')}.`,
        ]
      : []),
    ...(!essenceValid
      ? ['A valid Essence V4 contract is required before governance coverage can be proven.']
      : []),
    ...graph.limitations,
    ...receipt.limitations,
  ]).map((limitation) => sanitizeText(discovery, limitation));

  return createAdoptionTruthV1({
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    project: {
      workspaceRoot: '.',
      selectedAppRoot: discovery.workspace.projectPath,
      selectionReason:
        discovery.workspace.scope === 'single-app'
          ? 'The requested project root is the selected single application.'
          : `The requested project root selects workspace application ${discovery.workspace.projectPath}.`,
    },
    facts,
    mutationReceipts,
    limitations,
    nextAction,
  });
}
