import { createHash } from 'node:crypto';
import type { VerificationGraphAnchor } from './graph-anchors.js';
import { canonicalJsonStringify } from './task-capsule.js';

export const GOVERNANCE_DELTA_V1_SCHEMA_URL = 'https://decantr.ai/schemas/governance-delta.v1.json';
export const GOVERNANCE_FINDING_FINGERPRINT_VERSION = 1;

export type GovernanceEvidenceCompleteness = 'complete' | 'incomplete';
export type GovernanceEvidenceFreshness = 'fresh' | 'stale' | 'unknown';
export type GovernanceBaselineCompatibility = 'compatible' | 'incompatible' | 'unknown';
export type GovernanceFindingClassification = 'new' | 'inherited' | 'resolved' | 'unclassified';
export type GovernanceFailOn = 'error' | 'warn' | 'info' | 'none';
export type GovernanceAuthorityLaneV1 =
  | 'production-source'
  | 'local-law'
  | 'style-bridge'
  | 'essence-contract'
  | 'official-guidance'
  | 'unknown';

export interface GovernanceProjectV1 {
  identity: string;
  workspaceRoot: string;
  selectedAppRoot: string;
}

export interface GovernanceComparisonScopeV1 {
  kind: 'working_tree' | 'commit_range' | 'pull_request' | 'unknown';
  identity: string | null;
}

export interface GovernanceFindingLocationV1 {
  line: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
}

export interface GovernanceAnnotationCoordinatesV1 {
  path: string | null;
  startLine: number | null;
  startColumn: number | null;
  endLine: number | null;
  endColumn: number | null;
}

export interface GovernanceFindingOccurrenceInputV1 {
  code: string;
  ruleId: string;
  source: string;
  category: string;
  severity: 'error' | 'warn' | 'info';
  message: string;
  authorityLane: GovernanceAuthorityLaneV1;
  graphAnchor: VerificationGraphAnchor | null;
  repairId: string | null;
  repairTarget: string | null;
  annotation: GovernanceAnnotationCoordinatesV1;
  file?: string | null;
  route?: string | null;
  target?: string | null;
  location?: GovernanceFindingLocationV1 | null;
  occurrenceKey?: string | null;
}

export interface GovernanceFindingOccurrenceV1 extends GovernanceFindingOccurrenceInputV1 {
  fingerprint: string;
  fingerprintVersion: 1;
  classification: GovernanceFindingClassification;
}

export interface GovernanceGitChangeBaseV1 {
  identity: string | null;
  hash: string | null;
  baseRef: string | null;
  headRef: string | null;
  mergeBase: string | null;
  completeness: GovernanceEvidenceCompleteness;
  changedFiles: string[];
  changedRoutes: string[];
  impactedNodeIds: string[];
  unresolvedFiles: string[];
  limitations: string[];
}

export interface GovernanceDebtBaselineV1 {
  identity: string | null;
  hash: string | null;
  projectIdentity: string | null;
  capturedAt: string | null;
  completeness: GovernanceEvidenceCompleteness;
  freshness: GovernanceEvidenceFreshness;
  compatibility: GovernanceBaselineCompatibility;
  findings: GovernanceFindingOccurrenceInputV1[];
  limitations: string[];
}

export interface GovernanceArtifactIdentityV1 {
  identity: string | null;
  hash: string | null;
}

export interface GovernanceCurrentGraphV1 {
  identity: string | null;
  sourceHash: string | null;
  completeness: GovernanceEvidenceCompleteness;
  freshness: GovernanceEvidenceFreshness;
  limitations: string[];
}

export interface GovernanceCurrentEvidenceV1 {
  identity: string | null;
  hash: string | null;
  completeness: GovernanceEvidenceCompleteness;
  freshness: GovernanceEvidenceFreshness;
  limitations: string[];
}

export interface GovernanceCurrentStateV1 {
  health: GovernanceArtifactIdentityV1;
  graph: GovernanceCurrentGraphV1;
  evidence: GovernanceCurrentEvidenceV1;
  contract: GovernanceArtifactIdentityV1;
  content: GovernanceArtifactIdentityV1;
  source: GovernanceArtifactIdentityV1;
}

export interface GovernanceScreenshotChangeV1 {
  path: string;
  changeType: 'added' | 'updated' | 'removed';
  baseHash: string | null;
  currentHash: string | null;
}

export interface GovernanceContractChangeV1 {
  path: string;
  changeType: 'added' | 'updated' | 'removed';
  baseHash: string | null;
  currentHash: string | null;
}

export interface GovernanceContentGuidanceChangeV1 {
  itemId: string;
  changeType: 'added' | 'updated' | 'removed';
  baseDigest: string | null;
  currentDigest: string | null;
  impact: 'advisory' | 'migratory' | 'behavior_affecting';
}

export interface GovernanceDeltaV1 {
  $schema: typeof GOVERNANCE_DELTA_V1_SCHEMA_URL;
  schemaVersion: 1;
  generatedAt: string;
  project: GovernanceProjectV1;
  comparisonScope: GovernanceComparisonScopeV1;
  changeBase: GovernanceGitChangeBaseV1;
  debtBaseline: Omit<GovernanceDebtBaselineV1, 'findings'> & { findingCount: number };
  current: GovernanceCurrentStateV1;
  findings: {
    new: GovernanceFindingOccurrenceV1[];
    inherited: GovernanceFindingOccurrenceV1[];
    resolved: GovernanceFindingOccurrenceV1[];
    unclassified: GovernanceFindingOccurrenceV1[];
  };
  changedScreenshots?: GovernanceScreenshotChangeV1[];
  contractChanges?: GovernanceContractChangeV1[];
  contentGuidanceChanges?: GovernanceContentGuidanceChangeV1[];
  summary: {
    currentCount: number;
    newCount: number;
    inheritedCount: number;
    resolvedCount: number;
    unclassifiedCount: number;
    blockingCount: number;
  };
  gate: {
    result: 'pass' | 'fail' | 'not_proven';
    status: 'clean' | 'blocked' | 'incomplete';
    failOn: GovernanceFailOn;
    blockingFingerprints: string[];
  };
  limitations: string[];
  nextAction: string;
}

export interface CreateGovernanceDeltaV1Input {
  generatedAt: string;
  project: GovernanceProjectV1;
  comparisonScope: GovernanceComparisonScopeV1;
  changeBase: GovernanceGitChangeBaseV1;
  debtBaseline: GovernanceDebtBaselineV1;
  current: GovernanceCurrentStateV1;
  currentFindings: GovernanceFindingOccurrenceInputV1[];
  changedScreenshots?: GovernanceScreenshotChangeV1[];
  contractChanges?: GovernanceContractChangeV1[];
  contentGuidanceChanges?: GovernanceContentGuidanceChangeV1[];
  failOn: GovernanceFailOn;
  limitations: string[];
  nextAction: string;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function normalizeOptional(value: string | null | undefined): string | null {
  const normalized = value?.trim().replace(/\s+/g, ' ') ?? '';
  return normalized || null;
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

function normalizeOptionalPath(value: string | null | undefined, field: string): string | null {
  return value == null ? null : normalizeWorkspaceRelativePath(value, field);
}

function normalizeRepairTarget(value: string | null | undefined, field: string): string | null {
  const normalized = normalizeOptional(value);
  if (!normalized) return null;
  return /[\\/]/.test(normalized) || normalized.startsWith('.')
    ? normalizeWorkspaceRelativePath(normalized, field)
    : normalized;
}

function normalizeGraphAnchor(
  anchor: VerificationGraphAnchor | null,
): VerificationGraphAnchor | null {
  if (!anchor) return null;
  return {
    ...anchor,
    node_id: anchor.node_id.replace(/\\/g, '/').replace(/^src:\.\//, 'src:'),
  };
}

function normalizePaths(values: string[], field: string): string[] {
  return [...new Set(values.map((value) => normalizeWorkspaceRelativePath(value, field)))].sort();
}

function normalizeStrings(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function normalizeIdentity(identity: GovernanceArtifactIdentityV1): GovernanceArtifactIdentityV1 {
  return { identity: normalizeOptional(identity.identity), hash: normalizeOptional(identity.hash) };
}

function normalizeGraph(graph: GovernanceCurrentGraphV1): GovernanceCurrentGraphV1 {
  const limitations = new Set(graph.limitations);
  const identity = normalizeOptional(graph.identity);
  const sourceHash = normalizeOptional(graph.sourceHash);
  let completeness = graph.completeness;
  if (!identity || !sourceHash) {
    completeness = 'incomplete';
    limitations.add('Current graph identity or source hash is missing.');
  }
  if (completeness === 'incomplete') limitations.add('Current graph evidence is incomplete.');
  if (graph.freshness !== 'fresh') limitations.add(`Current graph evidence is ${graph.freshness}.`);
  return {
    identity,
    sourceHash,
    completeness,
    freshness: graph.freshness,
    limitations: [...limitations].sort(),
  };
}

function normalizeEvidence(evidence: GovernanceCurrentEvidenceV1): GovernanceCurrentEvidenceV1 {
  const limitations = new Set(evidence.limitations);
  const identity = normalizeOptional(evidence.identity);
  const hash = normalizeOptional(evidence.hash);
  let completeness = evidence.completeness;
  if (!identity || !hash) {
    completeness = 'incomplete';
    limitations.add('Current evidence identity or hash is missing.');
  }
  if (completeness === 'incomplete')
    limitations.add('Current verification evidence is incomplete.');
  if (evidence.freshness !== 'fresh') {
    limitations.add(`Current verification evidence is ${evidence.freshness}.`);
  }
  return {
    identity,
    hash,
    completeness,
    freshness: evidence.freshness,
    limitations: [...limitations].sort(),
  };
}

function normalizeChangeBase(base: GovernanceGitChangeBaseV1): GovernanceGitChangeBaseV1 {
  const limitations = new Set(base.limitations);
  const identity = normalizeOptional(base.identity);
  const hash = normalizeOptional(base.hash);
  const unresolvedFiles = normalizePaths(base.unresolvedFiles, 'Unresolved file');
  let completeness = base.completeness;
  if (!identity || !hash) {
    completeness = 'incomplete';
    limitations.add('Git change base identity or hash is missing.');
  }
  if (unresolvedFiles.length > 0) {
    completeness = 'incomplete';
    limitations.add('Some changed files could not be resolved.');
  }
  if (completeness === 'incomplete') limitations.add('Git change base is incomplete.');
  return {
    identity,
    hash,
    baseRef: normalizeOptional(base.baseRef),
    headRef: normalizeOptional(base.headRef),
    mergeBase: normalizeOptional(base.mergeBase),
    completeness,
    changedFiles: normalizePaths(base.changedFiles, 'Changed file'),
    changedRoutes: normalizeStrings(base.changedRoutes),
    impactedNodeIds: normalizeStrings(base.impactedNodeIds),
    unresolvedFiles,
    limitations: [...limitations].sort(),
  };
}

function normalizeDebtBaseline(
  baseline: GovernanceDebtBaselineV1,
  projectIdentity: string,
): GovernanceDebtBaselineV1 {
  const limitations = new Set(baseline.limitations);
  const identity = normalizeOptional(baseline.identity);
  const hash = normalizeOptional(baseline.hash);
  const baselineProjectIdentity = normalizeOptional(baseline.projectIdentity);
  let completeness = baseline.completeness;
  let compatibility = baseline.compatibility;
  if (!identity || !hash) {
    completeness = 'incomplete';
    limitations.add('Debt baseline identity or hash is missing.');
  }
  if (compatibility === 'compatible' && !baselineProjectIdentity) {
    compatibility = 'incompatible';
    limitations.add('Debt baseline project identity is missing.');
  } else if (compatibility === 'compatible' && baselineProjectIdentity !== projectIdentity) {
    compatibility = 'incompatible';
    limitations.add('Debt baseline belongs to a different project identity.');
  }
  if (compatibility !== 'compatible') {
    completeness = 'incomplete';
    limitations.add(`Debt baseline compatibility is ${compatibility}.`);
  }
  if (completeness === 'incomplete') limitations.add('Debt baseline is incomplete.');
  if (baseline.freshness !== 'fresh') limitations.add(`Debt baseline is ${baseline.freshness}.`);
  return {
    ...baseline,
    identity,
    hash,
    projectIdentity: baselineProjectIdentity,
    completeness,
    compatibility,
    limitations: [...limitations].sort(),
  };
}

function normalizeFinding(
  finding: GovernanceFindingOccurrenceInputV1,
): GovernanceFindingOccurrenceInputV1 {
  return {
    ...finding,
    code: finding.code.trim(),
    ruleId: finding.ruleId.trim(),
    source: finding.source.trim(),
    category: finding.category.trim(),
    message: finding.message.trim(),
    file: normalizeOptionalPath(finding.file, `Finding ${finding.code} file`),
    route: normalizeOptional(finding.route),
    target: normalizeOptional(finding.target),
    repairId: normalizeOptional(finding.repairId),
    repairTarget: normalizeRepairTarget(
      finding.repairTarget,
      `Finding ${finding.code} repair target`,
    ),
    occurrenceKey: normalizeOptional(finding.occurrenceKey),
    graphAnchor: normalizeGraphAnchor(finding.graphAnchor),
    annotation: {
      ...finding.annotation,
      path: normalizeOptionalPath(
        finding.annotation.path,
        `Finding ${finding.code} annotation path`,
      ),
    },
  };
}

function fingerprintMaterial(finding: GovernanceFindingOccurrenceInputV1): Record<string, unknown> {
  const normalized = normalizeFinding(finding);
  const anchor = normalized.occurrenceKey
    ? { kind: 'occurrence', value: normalized.occurrenceKey }
    : normalized.graphAnchor?.node_id
      ? {
          kind: 'graph-node',
          nodeId: normalized.graphAnchor.node_id,
          route: normalized.route ?? normalized.graphAnchor.route ?? null,
          target: normalized.target ?? null,
        }
      : normalized.target || normalized.route
        ? {
            kind: 'target',
            file: normalized.file ?? normalized.annotation.path ?? null,
            route: normalized.route ?? null,
            target: normalized.target ?? null,
          }
        : normalized.file || normalized.annotation.path
          ? {
              kind: 'source-location',
              file: normalized.file ?? normalized.annotation.path,
              location: normalized.location ?? normalized.annotation,
            }
          : normalized.repairTarget || normalized.repairId
            ? {
                kind: 'repair',
                repairId: normalized.repairId,
                repairTarget: normalized.repairTarget,
              }
            : normalized.location
              ? { kind: 'location', value: normalized.location }
              : { kind: 'message', value: normalized.message };
  return {
    version: GOVERNANCE_FINDING_FINGERPRINT_VERSION,
    code: normalized.code,
    ruleId: normalized.ruleId,
    source: normalized.source,
    anchor,
  };
}

export function fingerprintFindingOccurrenceV1(
  finding: GovernanceFindingOccurrenceInputV1,
): string {
  return `gfo1:${createHash('sha256')
    .update(canonicalJsonStringify(fingerprintMaterial(finding)), 'utf8')
    .digest('hex')}`;
}

export const fingerprintFindingOccurrence = fingerprintFindingOccurrenceV1;

function occurrence(
  finding: GovernanceFindingOccurrenceInputV1,
  classification: GovernanceFindingClassification,
): GovernanceFindingOccurrenceV1 {
  const normalized = normalizeFinding(finding);
  return {
    ...normalized,
    fingerprint: fingerprintFindingOccurrenceV1(normalized),
    fingerprintVersion: 1,
    classification,
  };
}

function byFingerprint(left: GovernanceFindingOccurrenceV1, right: GovernanceFindingOccurrenceV1) {
  return compareText(left.fingerprint, right.fingerprint);
}

function uniqueOccurrences(
  findings: GovernanceFindingOccurrenceInputV1[],
  classification: GovernanceFindingClassification,
): GovernanceFindingOccurrenceV1[] {
  const sorted = findings
    .map((finding) => occurrence(finding, classification))
    .sort(
      (left, right) =>
        byFingerprint(left, right) ||
        compareText(canonicalJsonStringify(left), canonicalJsonStringify(right)),
    );
  return [...new Map(sorted.map((finding) => [finding.fingerprint, finding])).values()];
}

function severityBlocks(severity: 'error' | 'warn' | 'info', failOn: GovernanceFailOn): boolean {
  if (failOn === 'none') return false;
  return severityRank(severity) >= severityRank(failOn);
}

function severityRank(severity: 'error' | 'warn' | 'info'): number;
function severityRank(severity: GovernanceFailOn): number;
function severityRank(severity: GovernanceFailOn): number {
  return { none: 4, info: 1, warn: 2, error: 3 }[severity];
}

function normalizeScreenshotChanges(
  changes: GovernanceScreenshotChangeV1[] | undefined,
): GovernanceScreenshotChangeV1[] | undefined {
  return changes
    ?.map((change) => ({
      ...change,
      path: normalizeWorkspaceRelativePath(change.path, 'Changed screenshot'),
    }))
    .sort(
      (left, right) =>
        compareText(left.path, right.path) ||
        compareText(canonicalJsonStringify(left), canonicalJsonStringify(right)),
    );
}

function normalizeContractChanges(
  changes: GovernanceContractChangeV1[] | undefined,
): GovernanceContractChangeV1[] | undefined {
  return changes
    ?.map((change) => ({
      ...change,
      path: normalizeWorkspaceRelativePath(change.path, 'Contract change'),
    }))
    .sort(
      (left, right) =>
        compareText(left.path, right.path) ||
        compareText(canonicalJsonStringify(left), canonicalJsonStringify(right)),
    );
}

function normalizeContentChanges(
  changes: GovernanceContentGuidanceChangeV1[] | undefined,
): GovernanceContentGuidanceChangeV1[] | undefined {
  return changes
    ?.map((change) => ({ ...change }))
    .sort(
      (left, right) =>
        compareText(left.itemId, right.itemId) ||
        compareText(canonicalJsonStringify(left), canonicalJsonStringify(right)),
    );
}

export function createGovernanceDeltaV1(input: CreateGovernanceDeltaV1Input): GovernanceDeltaV1 {
  const changeBase = normalizeChangeBase(input.changeBase);
  const debtBaseline = normalizeDebtBaseline(input.debtBaseline, input.project.identity);
  const graph = normalizeGraph(input.current.graph);
  const evidence = normalizeEvidence(input.current.evidence);
  const current: GovernanceCurrentStateV1 = {
    health: normalizeIdentity(input.current.health),
    graph,
    evidence,
    contract: normalizeIdentity(input.current.contract),
    content: normalizeIdentity(input.current.content),
    source: normalizeIdentity(input.current.source),
  };
  const comparabilityProofComplete =
    changeBase.completeness === 'complete' &&
    debtBaseline.completeness === 'complete' &&
    debtBaseline.freshness === 'fresh' &&
    debtBaseline.compatibility === 'compatible' &&
    debtBaseline.projectIdentity === input.project.identity &&
    debtBaseline.identity !== null &&
    debtBaseline.hash !== null &&
    graph.completeness === 'complete' &&
    graph.freshness === 'fresh' &&
    evidence.completeness === 'complete' &&
    evidence.freshness === 'fresh';
  const baseline = uniqueOccurrences(debtBaseline.findings, 'resolved');
  const baselineByFingerprint = new Map(baseline.map((finding) => [finding.fingerprint, finding]));
  const normalizedCurrent = uniqueOccurrences(input.currentFindings, 'unclassified');
  const classifiedCurrent = normalizedCurrent.map((finding) =>
    occurrence(
      finding,
      comparabilityProofComplete
        ? baselineByFingerprint.has(finding.fingerprint)
          ? 'inherited'
          : 'new'
        : 'unclassified',
    ),
  );
  const currentFingerprints = new Set(classifiedCurrent.map((finding) => finding.fingerprint));
  const resolved = comparabilityProofComplete
    ? baseline
        .filter((finding) => !currentFingerprints.has(finding.fingerprint))
        .sort(byFingerprint)
    : [];
  const newFindings = classifiedCurrent
    .filter((finding) => finding.classification === 'new')
    .sort(byFingerprint);
  const inherited = classifiedCurrent
    .filter((finding) => finding.classification === 'inherited')
    .sort(byFingerprint);
  const unclassified = classifiedCurrent
    .filter((finding) => finding.classification === 'unclassified')
    .sort(byFingerprint);
  const escalatedInherited = inherited.filter((finding) => {
    const baselineFinding = baselineByFingerprint.get(finding.fingerprint);
    return (
      baselineFinding !== undefined &&
      severityRank(finding.severity) > severityRank(baselineFinding.severity) &&
      severityBlocks(finding.severity, input.failOn)
    );
  });
  const blockingFingerprints = [...newFindings, ...unclassified, ...escalatedInherited]
    .filter((finding) => severityBlocks(finding.severity, input.failOn))
    .map((finding) => finding.fingerprint)
    .filter((fingerprint, index, fingerprints) => fingerprints.indexOf(fingerprint) === index)
    .sort();
  const proofComplete = comparabilityProofComplete && unclassified.length === 0;
  const gate = !proofComplete
    ? ({
        result: 'not_proven',
        status: 'incomplete',
        failOn: input.failOn,
        blockingFingerprints,
      } as const)
    : blockingFingerprints.length > 0
      ? ({
          result: 'fail',
          status: 'blocked',
          failOn: input.failOn,
          blockingFingerprints,
        } as const)
      : ({
          result: 'pass',
          status: 'clean',
          failOn: input.failOn,
          blockingFingerprints,
        } as const);
  const limitations = new Set([
    ...input.limitations,
    ...changeBase.limitations,
    ...debtBaseline.limitations,
    ...graph.limitations,
    ...evidence.limitations,
  ]);

  return {
    $schema: GOVERNANCE_DELTA_V1_SCHEMA_URL,
    schemaVersion: 1,
    generatedAt: input.generatedAt,
    project: {
      identity: input.project.identity,
      workspaceRoot: normalizeWorkspaceRelativePath(input.project.workspaceRoot, 'workspaceRoot'),
      selectedAppRoot: normalizeWorkspaceRelativePath(
        input.project.selectedAppRoot,
        'selectedAppRoot',
      ),
    },
    comparisonScope: { ...input.comparisonScope },
    changeBase,
    debtBaseline: {
      identity: debtBaseline.identity,
      hash: debtBaseline.hash,
      projectIdentity: debtBaseline.projectIdentity,
      capturedAt: debtBaseline.capturedAt,
      completeness: debtBaseline.completeness,
      freshness: debtBaseline.freshness,
      compatibility: debtBaseline.compatibility,
      limitations: debtBaseline.limitations,
      findingCount: baseline.length,
    },
    current,
    findings: { new: newFindings, inherited, resolved, unclassified },
    ...(input.changedScreenshots
      ? { changedScreenshots: normalizeScreenshotChanges(input.changedScreenshots) }
      : {}),
    ...(input.contractChanges
      ? { contractChanges: normalizeContractChanges(input.contractChanges) }
      : {}),
    ...(input.contentGuidanceChanges
      ? { contentGuidanceChanges: normalizeContentChanges(input.contentGuidanceChanges) }
      : {}),
    summary: {
      currentCount: classifiedCurrent.length,
      newCount: newFindings.length,
      inheritedCount: inherited.length,
      resolvedCount: resolved.length,
      unclassifiedCount: unclassified.length,
      blockingCount: blockingFingerprints.length,
    },
    gate,
    limitations: [...limitations].sort(),
    nextAction: input.nextAction,
  };
}
