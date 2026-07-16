import type { AdoptionTruthV1 } from './adoption-truth.js';
import type {
  AuthorityResolution,
  EvidenceTier,
  LoopReadiness,
  LoopReadinessState,
  ProjectHealthReportLike,
} from './contracts-v2.js';
import type { GovernanceDeltaV1 } from './governance-delta.js';

export const DECANTR_CI_REPORT_V3_SCHEMA_URL =
  'https://decantr.ai/schemas/decantr-ci-report.v3.json';

export type DecantrCiFailOnV3 = 'error' | 'warn' | 'none';
export type DecantrCiStatusV3 = 'healthy' | 'warning' | 'error';

export interface DecantrCiBaselineGateV2 {
  applied: boolean;
  baselinePath: string;
  savedAt: string | null;
  inheritedFindingIds: string[];
  newFindings: Array<{
    id: string;
    severity: 'error' | 'warn' | 'info';
  }>;
}

export interface DecantrCiLocalLawFindingV2 {
  ruleId: string;
  severity: 'info' | 'warn' | 'error';
  file: string;
  line: number;
  column: number;
  message: string;
  suggestedFix: string;
}

export interface DecantrCiLocalLawSummaryV2 {
  checked: boolean;
  patternsPresent: boolean;
  rulesPresent: boolean;
  warnings: string[];
  findings: DecantrCiLocalLawFindingV2[];
  errorCount: number;
  warnCount: number;
}

export interface DecantrCiStyleBridgeSummaryV2 {
  checked: boolean;
  present: boolean;
  status: string | null;
  mappingCount: number;
  stylingApproach: string | null;
  themeModes: string[];
  warnings: string[];
}

export interface DecantrCiWorkspaceHealthProjectV2 {
  id: string;
  path: string;
  status: DecantrCiStatusV3 | 'failed';
  score: number;
  errorCount: number;
  warnCount: number;
  infoCount: number;
  findingCount: number;
  durationMs: number;
  changed: boolean;
  source: 'manifest' | 'auto';
  error: string | null;
  loopState?: LoopReadinessState;
  loopNextAction?: string | null;
}

export interface DecantrCiWorkspaceHealthV2 {
  $schema: string;
  generatedAt: string;
  workspaceRoot: string;
  changedOnly: boolean;
  since: string | null;
  summary: {
    projectCount: number;
    checkedCount: number;
    healthyCount: number;
    warningCount: number;
    errorCount: number;
    failedCount: number;
  };
  loop: {
    state: LoopReadinessState;
    status: DecantrCiStatusV3 | 'blocked';
    projectCount: number;
    blockedCount: number;
    repairRequiredCount: number;
    nextActions: string[];
  };
  projects: DecantrCiWorkspaceHealthProjectV2[];
}

export interface DecantrCiProjectReportV3 {
  $schema: typeof DECANTR_CI_REPORT_V3_SCHEMA_URL;
  generatedAt: string;
  mode: 'project';
  projectPath: string | null;
  failOn: DecantrCiFailOnV3;
  status: DecantrCiStatusV3;
  loop: LoopReadiness;
  authority: AuthorityResolution;
  evidenceTier: EvidenceTier;
  health: ProjectHealthReportLike;
  baselineGate: DecantrCiBaselineGateV2;
  localLaw: DecantrCiLocalLawSummaryV2;
  styleBridge: DecantrCiStyleBridgeSummaryV2;
  adoptionTruth: AdoptionTruthV1;
  governanceDelta: GovernanceDeltaV1;
}

export interface DecantrCiAggregateProjectGateV3 {
  projectPath: string | null;
  projectIdentity: string;
  result: GovernanceDeltaV1['gate']['result'];
  status: GovernanceDeltaV1['gate']['status'];
  blockingCount: number;
}

export interface DecantrCiAggregateGateV3 {
  result: GovernanceDeltaV1['gate']['result'];
  status: GovernanceDeltaV1['gate']['status'];
  failOn: DecantrCiFailOnV3;
  projectCount: number;
  passingProjectCount: number;
  failingProjectCount: number;
  notProvenProjectCount: number;
  projects: DecantrCiAggregateProjectGateV3[];
}

export interface DecantrCiWorkspaceReportV3 {
  $schema: typeof DECANTR_CI_REPORT_V3_SCHEMA_URL;
  generatedAt: string;
  mode: 'workspace';
  failOn: DecantrCiFailOnV3;
  status: DecantrCiStatusV3;
  loop: DecantrCiWorkspaceHealthV2['loop'];
  workspace: DecantrCiWorkspaceHealthV2;
  projects: DecantrCiProjectReportV3[];
  gate: DecantrCiAggregateGateV3;
}

export type DecantrCiReportV3 = DecantrCiProjectReportV3 | DecantrCiWorkspaceReportV3;

export type CreateDecantrCiProjectReportV3Input = Omit<
  DecantrCiProjectReportV3,
  '$schema' | 'mode'
>;

export type CreateDecantrCiWorkspaceReportV3Input = Omit<
  DecantrCiWorkspaceReportV3,
  '$schema' | 'mode' | 'gate'
>;

function compareProjectPath(
  left: Pick<DecantrCiProjectReportV3, 'projectPath'>,
  right: Pick<DecantrCiProjectReportV3, 'projectPath'>,
): number {
  return (left.projectPath ?? '.').localeCompare(right.projectPath ?? '.');
}

function assertProjectContractsAlign(input: CreateDecantrCiProjectReportV3Input): void {
  const adoptionRoot = input.adoptionTruth.project.selectedAppRoot;
  const deltaRoot = input.governanceDelta.project.selectedAppRoot;
  if (adoptionRoot !== deltaRoot) {
    throw new Error(
      `CI v3 project contracts disagree on the selected app: ${adoptionRoot} != ${deltaRoot}.`,
    );
  }
  if (input.governanceDelta.gate.failOn !== input.failOn) {
    throw new Error(
      `CI v3 failOn must match GovernanceDeltaV1: ${input.failOn} != ${input.governanceDelta.gate.failOn}.`,
    );
  }
}

export function createDecantrCiProjectReportV3(
  input: CreateDecantrCiProjectReportV3Input,
): DecantrCiProjectReportV3 {
  assertProjectContractsAlign(input);
  return {
    $schema: DECANTR_CI_REPORT_V3_SCHEMA_URL,
    generatedAt: input.generatedAt,
    mode: 'project',
    projectPath: input.projectPath,
    failOn: input.failOn,
    status: input.status,
    loop: input.loop,
    authority: input.authority,
    evidenceTier: input.evidenceTier,
    health: input.health,
    baselineGate: input.baselineGate,
    localLaw: input.localLaw,
    styleBridge: input.styleBridge,
    adoptionTruth: input.adoptionTruth,
    governanceDelta: input.governanceDelta,
  };
}

export function createDecantrCiAggregateGateV3(
  projects: DecantrCiProjectReportV3[],
  failOn: DecantrCiFailOnV3,
): DecantrCiAggregateGateV3 {
  const projectGates = [...projects]
    .sort(compareProjectPath)
    .map((project): DecantrCiAggregateProjectGateV3 => {
      if (project.failOn !== failOn || project.governanceDelta.gate.failOn !== failOn) {
        throw new Error(
          `CI v3 workspace project ${project.projectPath ?? '.'} uses a different failOn.`,
        );
      }
      return {
        projectPath: project.projectPath,
        projectIdentity: project.governanceDelta.project.identity,
        result: project.governanceDelta.gate.result,
        status: project.governanceDelta.gate.status,
        blockingCount: project.governanceDelta.summary.blockingCount,
      };
    });
  const failingProjectCount = projectGates.filter((project) => project.result === 'fail').length;
  const notProvenProjectCount = projectGates.filter(
    (project) => project.result === 'not_proven',
  ).length;
  const passingProjectCount = projectGates.filter((project) => project.result === 'pass').length;
  const result =
    failingProjectCount > 0
      ? 'fail'
      : projectGates.length === 0 || notProvenProjectCount > 0
        ? 'not_proven'
        : 'pass';

  return {
    result,
    status: result === 'fail' ? 'blocked' : result === 'not_proven' ? 'incomplete' : 'clean',
    failOn,
    projectCount: projectGates.length,
    passingProjectCount,
    failingProjectCount,
    notProvenProjectCount,
    projects: projectGates,
  };
}

export function createDecantrCiWorkspaceReportV3(
  input: CreateDecantrCiWorkspaceReportV3Input,
): DecantrCiWorkspaceReportV3 {
  const projects = [...input.projects].sort(compareProjectPath);
  return {
    $schema: DECANTR_CI_REPORT_V3_SCHEMA_URL,
    generatedAt: input.generatedAt,
    mode: 'workspace',
    failOn: input.failOn,
    status: input.status,
    loop: input.loop,
    workspace: input.workspace,
    projects,
    gate: createDecantrCiAggregateGateV3(projects, input.failOn),
  };
}
