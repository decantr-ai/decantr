import { describe, expect, it } from 'vitest';
import {
  createAdoptionTruthV1,
  createAuthorityResolution,
  createDecantrCiProjectReportV3,
  createDecantrCiWorkspaceReportV3,
  createEvidenceTier,
  createGovernanceDeltaV1,
  createLoopReadiness,
  type DecantrCiProjectReportV3,
  PROJECT_HEALTH_REPORT_V2_SCHEMA_URL,
  type ProjectHealthReport,
  WORKSPACE_HEALTH_REPORT_V2_SCHEMA_URL,
} from '../src/index.js';
import {
  assertMatchesVerifierSchema,
  assertRejectedByVerifierSchema,
} from './helpers/schema-assert.js';

const GENERATED_AT = '2026-07-16T16:00:00.000Z';

function healthReport(): ProjectHealthReport {
  const base = {
    status: 'healthy' as const,
    score: 100,
    summary: {
      errorCount: 0,
      warnCount: 0,
      infoCount: 0,
      findingCount: 0,
      workflowMode: 'brownfield-attach',
      adoptionMode: 'contract-only',
      essenceVersion: '4.0.0',
      pageCount: 1,
      runtimeAuditChecked: false,
      runtimePassed: null,
      packManifestPresent: true,
      reviewPackPresent: true,
    },
    routes: {
      declared: ['/'],
      runtimeChecked: [],
      runtimeMatched: 0,
      runtimeCoverageOk: null,
      issues: [],
    },
    graph: {
      present: true,
      ready: true,
      current: true,
      snapshotPresent: true,
      manifestPresent: true,
      diffPresent: true,
      capsulePresent: true,
      snapshotId: 'graph:current',
      sourceHash: 'source:current',
      contractHash: 'contract:current',
      contractCacheKey: 'contract-cache:current',
      sourceArtifactCount: 1,
      capsuleSourceArtifactLimit: 200,
      capsuleSourceArtifactsTruncated: false,
      staleArtifacts: [],
      error: null,
    },
    ci: { recommendedCommand: 'decantr ci --report-version v3', failOn: 'error' as const },
    findings: [],
  };
  const authority = createAuthorityResolution(base);
  const evidenceTier = createEvidenceTier(base);
  const loop = createLoopReadiness(base, authority, evidenceTier);
  return {
    $schema: PROJECT_HEALTH_REPORT_V2_SCHEMA_URL,
    generatedAt: GENERATED_AT,
    projectRoot: '/workspace/apps/web',
    ...base,
    packs: {
      manifestPresent: true,
      reviewPackPresent: true,
      scaffoldPackPresent: true,
      sectionPackCount: 1,
      pagePackCount: 1,
      mutationPackCount: 1,
      generatedAt: GENERATED_AT,
    },
    authority,
    evidenceTier,
    loop,
  };
}

function projectReport(
  selectedAppRoot: string,
  baselineComplete: boolean,
): DecantrCiProjectReportV3 {
  const identity = `project:${selectedAppRoot}`;
  const health = healthReport();
  const adoptionTruth = createAdoptionTruthV1({
    generatedAt: GENERATED_AT,
    project: { workspaceRoot: '.', selectedAppRoot, selectionReason: 'Explicit test project.' },
    facts: [],
    mutationReceipts: [],
    limitations: [],
    nextAction: 'Run Decantr CI v3.',
  });
  const governanceDelta = createGovernanceDeltaV1({
    generatedAt: GENERATED_AT,
    project: { identity, workspaceRoot: '.', selectedAppRoot },
    comparisonScope: { kind: 'commit_range', identity: 'base..head' },
    changeBase: {
      identity: 'git:base..head',
      hash: 'sha256:change',
      baseRef: 'base',
      headRef: 'head',
      mergeBase: 'base',
      completeness: 'complete',
      changedFiles: [],
      changedRoutes: [],
      impactedNodeIds: [],
      unresolvedFiles: [],
      limitations: [],
    },
    debtBaseline: {
      identity: baselineComplete ? 'baseline:v2' : null,
      hash: baselineComplete ? 'sha256:baseline' : null,
      projectIdentity: baselineComplete ? identity : null,
      capturedAt: baselineComplete ? GENERATED_AT : null,
      completeness: baselineComplete ? 'complete' : 'incomplete',
      freshness: baselineComplete ? 'fresh' : 'unknown',
      compatibility: baselineComplete ? 'compatible' : 'unknown',
      findings: [],
      limitations: baselineComplete ? [] : ['Baseline is missing.'],
    },
    current: {
      health: { identity: 'health:current', hash: 'sha256:health' },
      graph: {
        identity: 'graph:current',
        sourceHash: 'source:current',
        completeness: 'complete',
        freshness: 'fresh',
        limitations: [],
      },
      evidence: {
        identity: 'evidence:current',
        hash: 'sha256:evidence',
        completeness: 'complete',
        freshness: 'fresh',
        limitations: [],
      },
      contract: { identity: 'contract:current', hash: 'sha256:contract' },
      content: { identity: 'content:current', hash: 'sha256:content' },
      source: { identity: 'source:current', hash: 'sha256:source' },
    },
    currentFindings: [],
    failOn: 'error',
    limitations: [],
    nextAction: 'Review the gate.',
  });
  return createDecantrCiProjectReportV3({
    generatedAt: GENERATED_AT,
    projectPath: selectedAppRoot,
    failOn: 'error',
    status: health.status,
    loop: health.loop,
    authority: health.authority,
    evidenceTier: health.evidenceTier,
    health,
    baselineGate: {
      applied: baselineComplete,
      baselinePath: `/workspace/${selectedAppRoot}/.decantr/health-baseline.json`,
      savedAt: baselineComplete ? GENERATED_AT : null,
      inheritedFindingIds: [],
      newFindings: [],
    },
    localLaw: {
      checked: false,
      patternsPresent: false,
      rulesPresent: false,
      warnings: [],
      findings: [],
      errorCount: 0,
      warnCount: 0,
    },
    styleBridge: {
      checked: false,
      present: false,
      status: null,
      mappingCount: 0,
      stylingApproach: null,
      themeModes: [],
      warnings: [],
    },
    adoptionTruth,
    governanceDelta,
  });
}

describe('Decantr CI report v3', () => {
  it('builds strict project reports with adoption truth and governance delta', () => {
    const report = projectReport('apps/web', true);

    expect(report.governanceDelta.gate.result).toBe('pass');
    assertMatchesVerifierSchema('decantr-ci-report.v3.json', report);
    assertRejectedByVerifierSchema('decantr-ci-report.v3.json', {
      ...report,
      providerPayload: {},
    });
  });

  it('sorts workspace projects and aggregates incomplete proof deterministically', () => {
    const passing = projectReport('apps/zeta', true);
    const incomplete = projectReport('apps/alpha', false);
    const loop = {
      state: 'verified' as const,
      status: 'healthy' as const,
      projectCount: 2,
      blockedCount: 0,
      repairRequiredCount: 0,
      nextActions: ['Workspace loop verified.'],
    };
    const workspace = {
      $schema: WORKSPACE_HEALTH_REPORT_V2_SCHEMA_URL,
      generatedAt: GENERATED_AT,
      workspaceRoot: '/workspace',
      changedOnly: false,
      since: null,
      summary: {
        projectCount: 2,
        checkedCount: 2,
        healthyCount: 2,
        warningCount: 0,
        errorCount: 0,
        failedCount: 0,
      },
      loop,
      projects: [],
    };
    const report = createDecantrCiWorkspaceReportV3({
      generatedAt: GENERATED_AT,
      failOn: 'error',
      status: 'healthy',
      loop,
      workspace,
      projects: [passing, incomplete],
    });

    expect(report.projects.map((project) => project.projectPath)).toEqual([
      'apps/alpha',
      'apps/zeta',
    ]);
    expect(report.gate).toMatchObject({
      result: 'not_proven',
      status: 'incomplete',
      projectCount: 2,
      passingProjectCount: 1,
      notProvenProjectCount: 1,
    });
    assertMatchesVerifierSchema('decantr-ci-report.v3.json', report);
  });
});
