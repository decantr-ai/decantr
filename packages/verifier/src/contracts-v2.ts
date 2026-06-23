import type { VerificationGraphAnchor } from './graph-anchors.js';

export const VERIFICATION_COMMON_V2_SCHEMA_URL =
  'https://decantr.ai/schemas/verification-report.common.v2.json';
export const PROJECT_HEALTH_REPORT_V2_SCHEMA_URL =
  'https://decantr.ai/schemas/project-health-report.v2.json';
export const DECANTR_CI_REPORT_V2_SCHEMA_URL =
  'https://decantr.ai/schemas/decantr-ci-report.v2.json';
export const WORKSPACE_HEALTH_REPORT_V2_SCHEMA_URL =
  'https://decantr.ai/schemas/workspace-health-report.v2.json';
export const EVIDENCE_BUNDLE_V2_SCHEMA_URL = 'https://decantr.ai/schemas/evidence-bundle.v2.json';
export const RUNTIME_PROBE_PAYLOAD_V2_SCHEMA_URL =
  'https://decantr.ai/schemas/runtime-probe-payload.v2.json';
export const LOOP_READINESS_V2_SCHEMA_URL = 'https://decantr.ai/schemas/loop-readiness.v2.json';
export const AUTHORITY_RESOLUTION_V2_SCHEMA_URL =
  'https://decantr.ai/schemas/authority-resolution.v2.json';
export const PROOF_FIELD_REPORT_V2_SCHEMA_URL =
  'https://decantr.ai/schemas/proof-field-report.v2.json';

export type EvidenceTierCapability =
  | 'static-audit'
  | 'project-health'
  | 'typed-graph'
  | 'runtime-probe'
  | 'browser-evidence'
  | 'visual-baseline'
  | 'repair-plan'
  | 'benchmark-replay';

export type EvidenceTierStage = 'static' | 'graph' | 'runtime' | 'visual' | 'repair' | 'proof';
export type EvidenceTierStatus = 'healthy' | 'warning' | 'error' | 'incomplete';
export type EvidenceConfidenceLevel = 'low' | 'moderate' | 'high';

export interface EvidenceTier {
  schemaVersion: 2;
  stage: EvidenceTierStage;
  status: EvidenceTierStatus;
  capabilities: EvidenceTierCapability[];
  coverage: {
    declaredRoutes: number;
    runtimeRoutesChecked: number;
    findingsAnchored: number;
    findingsWithRepairPlan: number;
    runtimeProbeCount: number;
    visualArtifactCount: number;
  };
  confidence: {
    level: EvidenceConfidenceLevel;
    score: number;
    reasons: string[];
  };
}

export type AuthorityResolutionActionKind =
  | 'repair_source'
  | 'accept_observed_source'
  | 'codify_local_law'
  | 'update_style_bridge'
  | 'regenerate_graph'
  | 'regenerate_context'
  | 'defer_to_drift_log'
  | 'mark_advisory';

export interface AuthorityResolutionAction {
  kind: AuthorityResolutionActionKind;
  label: string;
  command: string | null;
  writes: boolean;
  rationale: string;
}

export type AuthorityLaneId =
  | 'production-source'
  | 'local-law'
  | 'style-bridge'
  | 'essence-contract'
  | 'registry-guidance';

export interface AuthorityOrderEntry {
  id: AuthorityLaneId;
  label: string;
  role: string;
  rank: number;
}

export interface AuthorityConflict {
  id: string;
  source: string;
  category: string;
  severity: 'error' | 'warn' | 'info';
  message: string;
  graphAnchor?: VerificationGraphAnchor;
  lane: AuthorityLaneId;
  status: 'blocking' | 'repairable' | 'advisory';
  recommendedActions: AuthorityResolutionAction[];
}

export interface AuthorityResolution {
  $schema?: string;
  schemaVersion: 2;
  generatedAt?: string;
  order: AuthorityOrderEntry[];
  activeLane: AuthorityLaneId;
  summary: string;
  conflicts: AuthorityConflict[];
  stopRule: string;
}

export type LoopReadinessState =
  | 'needs_context'
  | 'ready_to_edit'
  | 'verify_required'
  | 'repair_required'
  | 'human_resolution_required'
  | 'blocked_missing_context'
  | 'blocked_missing_graph'
  | 'verified';

export interface LoopInstructionBlock {
  title: string;
  instructions: string[];
}

export interface GraphImpactSummary {
  status: 'ready' | 'missing' | 'stale' | 'not_applicable';
  snapshotId: string | null;
  sourceHash: string | null;
  sourceArtifactCount: number;
  staleArtifacts: string[];
}

export interface LoopReadiness {
  $schema?: string;
  schemaVersion: 2;
  state: LoopReadinessState;
  status: 'healthy' | 'warning' | 'error' | 'blocked';
  verdict: string;
  summary: string;
  authority: Pick<AuthorityResolution, 'activeLane' | 'summary' | 'stopRule'>;
  evidenceTier: EvidenceTier;
  blockingReasons: string[];
  nextActions: string[];
  maker: LoopInstructionBlock;
  checker: LoopInstructionBlock;
  readTargets: string[];
  graphImpact: GraphImpactSummary;
  stopConditions: string[];
  verifyCommand: string;
}

export interface ProjectHealthReportLike {
  status: 'healthy' | 'warning' | 'error';
  score: number;
  summary: {
    errorCount: number;
    warnCount: number;
    infoCount: number;
    findingCount: number;
    workflowMode: string | null;
    adoptionMode: string | null;
    essenceVersion: string | null;
    runtimeAuditChecked: boolean;
    runtimePassed: boolean | null;
  };
  routes: {
    declared: string[];
    runtimeChecked: string[];
  };
  graph: {
    present: boolean;
    ready: boolean;
    current: boolean | null;
    snapshotId: string | null;
    sourceHash: string | null;
    sourceArtifactCount: number;
    staleArtifacts: string[];
  };
  ci: {
    recommendedCommand: string;
  };
  findings: ProjectHealthFindingLike[];
}

export interface ProjectHealthFindingLike {
  id: string;
  source: string;
  category: string;
  severity: 'error' | 'warn' | 'info';
  message: string;
  evidence: string[];
  rule?: string;
  file?: string;
  target?: string;
  graph?: VerificationGraphAnchor;
  repairPlan?: {
    readTargets?: string[];
    commands?: string[];
  };
  remediation?: {
    commands?: string[];
  };
}

export interface EvidenceTierOptions {
  runtimeProbeCount?: number;
  visualArtifactCount?: number;
  benchmarkReplay?: boolean;
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function rounded(value: number): number {
  return Number(Math.max(0, Math.min(1, value)).toFixed(2));
}

export function createEvidenceTier(
  report: ProjectHealthReportLike,
  options: EvidenceTierOptions = {},
): EvidenceTier {
  const runtimeProbeCount =
    options.runtimeProbeCount ?? (report.summary.runtimeAuditChecked ? 1 : 0);
  const visualArtifactCount = options.visualArtifactCount ?? 0;
  const findingsAnchored = report.findings.filter((finding) => finding.graph).length;
  const findingsWithRepairPlan = report.findings.filter((finding) => finding.repairPlan).length;
  const capabilities: EvidenceTierCapability[] = ['static-audit', 'project-health'];

  if (report.graph.ready) capabilities.push('typed-graph');
  if (runtimeProbeCount > 0) capabilities.push('runtime-probe');
  if (report.summary.runtimeAuditChecked || visualArtifactCount > 0)
    capabilities.push('browser-evidence');
  if (visualArtifactCount > 0) capabilities.push('visual-baseline');
  if (findingsWithRepairPlan > 0) capabilities.push('repair-plan');
  if (options.benchmarkReplay) capabilities.push('benchmark-replay');

  let stage: EvidenceTierStage = 'static';
  if (options.benchmarkReplay) stage = 'proof';
  else if (findingsWithRepairPlan > 0) stage = 'repair';
  else if (visualArtifactCount > 0) stage = 'visual';
  else if (runtimeProbeCount > 0 || report.summary.runtimeAuditChecked) stage = 'runtime';
  else if (report.graph.ready) stage = 'graph';

  const routeCoverage =
    report.routes.declared.length > 0
      ? Math.min(1, report.routes.runtimeChecked.length / report.routes.declared.length)
      : report.summary.runtimeAuditChecked
        ? 1
        : 0;
  const graphCoverage =
    report.findings.length > 0
      ? findingsAnchored / report.findings.length
      : report.graph.ready
        ? 1
        : 0;
  const repairCoverage =
    report.findings.length > 0 ? findingsWithRepairPlan / report.findings.length : 1;
  const runtimeCoverage = runtimeProbeCount > 0 || report.summary.runtimeAuditChecked ? 1 : 0;
  const score = rounded(
    0.22 +
      (report.graph.ready ? 0.22 : 0) +
      routeCoverage * 0.16 +
      graphCoverage * 0.16 +
      repairCoverage * 0.14 +
      runtimeCoverage * 0.1,
  );
  const level: EvidenceConfidenceLevel =
    score >= 0.78 ? 'high' : score >= 0.48 ? 'moderate' : 'low';
  const reasons: string[] = [];
  reasons.push(report.graph.ready ? 'typed graph is ready' : 'typed graph is missing or stale');
  reasons.push(
    runtimeProbeCount > 0 || report.summary.runtimeAuditChecked
      ? 'runtime evidence is present'
      : 'runtime evidence has not run',
  );
  reasons.push(
    report.findings.length === 0
      ? 'no open findings'
      : `${findingsAnchored}/${report.findings.length} finding(s) have graph anchors`,
  );
  reasons.push(
    report.findings.length === 0
      ? 'repair context is not needed'
      : `${findingsWithRepairPlan}/${report.findings.length} finding(s) include repair plans`,
  );

  return {
    schemaVersion: 2,
    stage,
    status: report.status === 'healthy' ? 'healthy' : report.status,
    capabilities: unique(capabilities),
    coverage: {
      declaredRoutes: report.routes.declared.length,
      runtimeRoutesChecked: report.routes.runtimeChecked.length,
      findingsAnchored,
      findingsWithRepairPlan,
      runtimeProbeCount,
      visualArtifactCount,
    },
    confidence: {
      level,
      score,
      reasons,
    },
  };
}

export function createAuthorityOrder(): AuthorityOrderEntry[] {
  return [
    {
      id: 'production-source',
      label: 'Production source',
      role: 'Existing runtime/source wins first in Brownfield unless a human explicitly accepts a contract change.',
      rank: 1,
    },
    {
      id: 'local-law',
      label: 'Accepted local law',
      role: 'Project-owned rules and codified patterns constrain edits after they are accepted locally.',
      rank: 2,
    },
    {
      id: 'style-bridge',
      label: 'Accepted style bridge',
      role: 'Mapped native style tokens/components govern Hybrid styling once accepted locally.',
      rank: 3,
    },
    {
      id: 'essence-contract',
      label: 'Essence V4 contract',
      role: 'Structural route, section, page, guard, and DNA contract for Decantr context.',
      rank: 4,
    },
    {
      id: 'registry-guidance',
      label: 'Hosted packs and registry',
      role: 'Advisory guidance unless mapped into accepted local law or the local style bridge.',
      rank: 5,
    },
  ];
}

function laneForFinding(finding: ProjectHealthFindingLike): AuthorityLaneId {
  if (finding.source === 'style-bridge') return 'style-bridge';
  if (finding.source === 'brownfield' || finding.category.toLowerCase().includes('drift')) {
    return 'production-source';
  }
  if (finding.source === 'check' || finding.source === 'assertion') return 'essence-contract';
  if (finding.source === 'pack') return 'registry-guidance';
  return 'local-law';
}

function actionsForFinding(finding: ProjectHealthFindingLike): AuthorityResolutionAction[] {
  const commands = finding.repairPlan?.commands ?? finding.remediation?.commands ?? [];
  const repairCommand = commands[0] ?? null;
  const source = finding.source;
  const actions: AuthorityResolutionAction[] = [];

  if (source === 'graph') {
    actions.push({
      kind: 'regenerate_graph',
      label: 'Regenerate graph/context evidence',
      command: 'decantr graph --check || decantr graph',
      writes: true,
      rationale:
        'Graph drift should be resolved by regenerating derived graph artifacts from current source.',
    });
  } else if (source === 'style-bridge') {
    actions.push({
      kind: 'update_style_bridge',
      label: 'Update accepted style bridge',
      command: 'decantr codify --style-bridge',
      writes: true,
      rationale:
        'Style conflicts should be accepted through the explicit Hybrid style bridge workflow.',
    });
  } else if (source === 'brownfield') {
    actions.push({
      kind: 'accept_observed_source',
      label: 'Accept observed source into contract',
      command: 'decantr init --existing --merge-proposal',
      writes: true,
      rationale:
        'Brownfield source is first authority; accept it explicitly before treating contract drift as repaired.',
    });
  } else if (source === 'pack') {
    actions.push({
      kind: 'regenerate_context',
      label: 'Regenerate Decantr context',
      command: 'decantr refresh',
      writes: true,
      rationale: 'Generated context and pack artifacts are derived from the local contract.',
    });
  } else {
    actions.push({
      kind: 'repair_source',
      label: 'Repair source to satisfy accepted authority',
      command: repairCommand,
      writes: false,
      rationale:
        'The finding can be repaired by editing the relevant application source under human/agent control.',
    });
  }

  actions.push({
    kind: 'defer_to_drift_log',
    label: 'Defer to drift log',
    command: `decantr resolve --defer ${finding.id}`,
    writes: true,
    rationale:
      'Record an explicit human deferral when this conflict should not block the current task.',
  });

  if (finding.severity !== 'error') {
    actions.push({
      kind: 'mark_advisory',
      label: 'Mark advisory',
      command: `decantr resolve --mark-advisory ${finding.id}`,
      writes: true,
      rationale:
        'Warnings can be documented as advisory when the observed source is intentionally different.',
    });
  }

  return actions;
}

export function createAuthorityResolution(report: ProjectHealthReportLike): AuthorityResolution {
  const conflicts: AuthorityConflict[] = report.findings
    .filter((finding) => finding.severity !== 'info')
    .map((finding) => ({
      id: finding.id,
      source: finding.source,
      category: finding.category,
      severity: finding.severity,
      message: finding.message,
      ...(finding.graph ? { graphAnchor: finding.graph } : {}),
      lane: laneForFinding(finding),
      status:
        finding.severity === 'error'
          ? 'blocking'
          : finding.source === 'brownfield' || finding.source === 'style-bridge'
            ? 'repairable'
            : 'advisory',
      recommendedActions: actionsForFinding(finding),
    }));
  const activeLane =
    report.summary.workflowMode === 'brownfield-attach' ? 'production-source' : 'essence-contract';

  return {
    schemaVersion: 2,
    order: createAuthorityOrder(),
    activeLane,
    summary:
      activeLane === 'production-source'
        ? 'Brownfield authority: preserve observed production source first, then accepted local law/style bridge, then Essence V4 structure, with hosted packs advisory.'
        : 'Contract authority: Essence V4 and accepted local project law guide source changes; hosted packs remain advisory until accepted locally.',
    conflicts,
    stopRule:
      'If runtime source and Decantr context disagree, stop and report drift instead of guessing which truth to overwrite.',
  };
}

function readTargetsForFindings(report: ProjectHealthReportLike): string[] {
  const targets = new Set<string>(['DECANTR.md', 'decantr.essence.json']);
  for (const finding of report.findings) {
    for (const target of finding.repairPlan?.readTargets ?? []) targets.add(target);
    if (finding.file) targets.add(finding.file);
    if (finding.source === 'graph') targets.add('.decantr/graph/graph.manifest.json');
    if (finding.source === 'style-bridge') targets.add('.decantr/style-bridge.json');
  }
  return [...targets].sort();
}

export function createLoopReadiness(
  report: ProjectHealthReportLike,
  authority: AuthorityResolution = createAuthorityResolution(report),
  evidenceTier: EvidenceTier = createEvidenceTier(report),
): LoopReadiness {
  const hasEssence = Boolean(report.summary.essenceVersion);
  const graphMissing = !report.graph.ready;
  const blockingConflicts = authority.conflicts.filter(
    (conflict) => conflict.status === 'blocking',
  );
  const repairableConflicts = authority.conflicts.filter(
    (conflict) => conflict.status === 'repairable',
  );
  let state: LoopReadinessState = 'verified';
  const blockingReasons: string[] = [];

  if (!hasEssence) {
    state = 'blocked_missing_context';
    blockingReasons.push('Essence V4 context is missing.');
  } else if (graphMissing) {
    state = 'blocked_missing_graph';
    blockingReasons.push('Typed Contract graph is missing, stale, or incomplete.');
  } else if (blockingConflicts.length > 0 && repairableConflicts.length > 0) {
    state = 'human_resolution_required';
    blockingReasons.push('Blocking findings conflict with Brownfield or Hybrid authority.');
  } else if (blockingConflicts.length > 0 || report.summary.errorCount > 0) {
    state = 'repair_required';
    blockingReasons.push('Project Health has blocking errors.');
  } else if (repairableConflicts.length > 0 || report.summary.warnCount > 0) {
    state = 'repair_required';
    blockingReasons.push('Project Health has repairable warnings or drift.');
  } else if (report.status === 'healthy') {
    state = 'verified';
  } else {
    state = 'verify_required';
    blockingReasons.push('Verification needs to be rerun before the loop is complete.');
  }

  const nextActions =
    state === 'verified'
      ? ['Continue normal route/task workflow.']
      : state === 'blocked_missing_context'
        ? ['Run `decantr scan` for a read-only preview, then `decantr adopt` when ready.']
        : state === 'blocked_missing_graph'
          ? ['Run `decantr graph` to regenerate typed graph artifacts, then rerun verification.']
          : state === 'human_resolution_required'
            ? ['Run `decantr resolve` and choose an explicit resolution action before editing.']
            : state === 'repair_required'
              ? ['Repair the highest-severity finding, then rerun the verify command.']
              : ['Run the verify command before treating the task as complete.'];

  const status =
    state.startsWith('blocked') || state === 'human_resolution_required'
      ? 'blocked'
      : report.status;

  return {
    schemaVersion: 2,
    state,
    status,
    verdict:
      state === 'verified'
        ? 'Loop verified.'
        : 'Loop needs attention before it should be considered complete.',
    summary: `${report.status} Project Health, ${evidenceTier.confidence.level} evidence confidence, ${authority.conflicts.length} authority conflict(s).`,
    authority: {
      activeLane: authority.activeLane,
      summary: authority.summary,
      stopRule: authority.stopRule,
    },
    evidenceTier,
    blockingReasons,
    nextActions,
    maker: {
      title: 'Maker instructions',
      instructions: [
        'Read the route/task context before editing source.',
        'Preserve production source behavior and accepted local law unless a human chooses a resolution action.',
        'Stop and report drift when runtime source and Decantr context disagree.',
      ],
    },
    checker: {
      title: 'Checker instructions',
      instructions: [
        'Rerun the verify command after edits.',
        'Check graph anchors and repair plans before accepting a fix.',
        'Treat critique-only or advisory evidence as warning-level unless runtime evidence proves a failure.',
      ],
    },
    readTargets: readTargetsForFindings(report),
    graphImpact: {
      status: !report.graph.present
        ? 'missing'
        : report.graph.ready && report.graph.current !== false
          ? 'ready'
          : 'stale',
      snapshotId: report.graph.snapshotId,
      sourceHash: report.graph.sourceHash,
      sourceArtifactCount: report.graph.sourceArtifactCount,
      staleArtifacts: report.graph.staleArtifacts,
    },
    stopConditions: [
      'Runtime source and Decantr context disagree.',
      'Typed graph is missing for the route or changed file.',
      'A finding requires contract/source/local-law mutation outside the current explicit workflow.',
    ],
    verifyCommand: report.ci.recommendedCommand,
  };
}
