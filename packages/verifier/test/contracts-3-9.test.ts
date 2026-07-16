import { describe, expect, it } from 'vitest';
import {
  type CreateGovernanceDeltaV1Input,
  type CreateTaskCapsuleV1Input,
  canonicalUtf8Bytes,
  createAdoptionTruthV1,
  createGovernanceDeltaV1,
  createTaskCapsuleV1,
  DEFAULT_TASK_CAPSULE_MAX_CANONICAL_BYTES,
  fingerprintFindingOccurrenceV1,
  type GovernanceFindingOccurrenceInputV1,
  tokenEstimateV1,
} from '../src/index.js';
import {
  assertMatchesVerifierSchema,
  assertRejectedByVerifierSchema,
} from './helpers/schema-assert.js';

function finding(
  file: string,
  message = 'Button has no accessible name',
): GovernanceFindingOccurrenceInputV1 {
  return {
    code: 'A11Y001',
    ruleId: 'accessible-name',
    source: 'audit',
    category: 'Accessibility',
    severity: 'warn',
    message,
    authorityLane: 'local-law',
    graphAnchor: {
      snapshot_id: 'graph:current',
      source_hash: 'source:current',
      node_id: `src:${file.replace(/\\/g, '/')}`,
      node_type: 'SourceArtifact',
      route: '/settings',
      confidence: 'exact',
      reason: 'finding carried an exact source anchor',
    },
    repairId: 'restore-accessible-name',
    repairTarget: file,
    annotation: {
      path: file,
      startLine: 12,
      startColumn: 3,
      endLine: 12,
      endColumn: 18,
    },
    file,
    route: '/settings',
    location: { line: 12, column: 3, endLine: 12, endColumn: 18 },
  };
}

function completeDeltaInput(): CreateGovernanceDeltaV1Input {
  return {
    generatedAt: '2026-07-16T12:00:00.000Z',
    project: { identity: 'project:web', workspaceRoot: '.', selectedAppRoot: 'apps/web' },
    comparisonScope: { kind: 'commit_range', identity: 'abc123..def456' },
    changeBase: {
      identity: 'git:abc123',
      hash: 'change:sha256',
      baseRef: 'origin/main',
      headRef: 'HEAD',
      mergeBase: 'abc123',
      completeness: 'complete',
      changedFiles: ['apps/web/src/new.tsx'],
      changedRoutes: ['/settings'],
      impactedNodeIds: ['src:apps/web/src/new.tsx'],
      unresolvedFiles: [],
      limitations: [],
    },
    debtBaseline: {
      identity: 'health:baseline-1',
      hash: 'baseline:sha256',
      projectIdentity: 'project:web',
      capturedAt: '2026-07-15T12:00:00.000Z',
      completeness: 'complete',
      freshness: 'fresh',
      compatibility: 'compatible',
      findings: [
        finding('apps/web/src/Button.tsx'),
        finding('apps/web/src/old.tsx', 'Old finding'),
      ],
      limitations: [],
    },
    current: {
      health: { identity: 'health:current', hash: 'health:sha256' },
      graph: {
        identity: 'graph:current',
        sourceHash: 'source:current',
        completeness: 'complete',
        freshness: 'fresh',
        limitations: [],
      },
      evidence: {
        identity: 'evidence:current',
        hash: 'evidence:sha256',
        completeness: 'complete',
        freshness: 'fresh',
        limitations: [],
      },
      contract: { identity: 'contract:current', hash: 'contract:sha256' },
      content: { identity: 'content:3.9.0', hash: 'content:sha256' },
      source: { identity: 'source:current', hash: 'source:sha256' },
    },
    currentFindings: [
      finding('apps/web/src/Button.tsx'),
      finding('apps/web/src/new.tsx', 'New finding'),
    ],
    changedScreenshots: [
      {
        path: 'apps/web/.decantr/evidence/screenshots/settings.png',
        changeType: 'updated',
        baseHash: 'screenshot:base',
        currentHash: 'screenshot:current',
      },
    ],
    contractChanges: [
      {
        path: 'apps/web/decantr.essence.json',
        changeType: 'updated',
        baseHash: 'contract:base',
        currentHash: 'contract:current',
      },
    ],
    contentGuidanceChanges: [
      {
        itemId: 'pattern:settings-form',
        changeType: 'updated',
        baseDigest: 'content:base',
        currentDigest: 'content:current',
        impact: 'advisory',
      },
    ],
    failOn: 'warn',
    limitations: [],
    nextAction: 'pnpm decantr verify --project apps/web',
  };
}

function structuredTaskInput(): CreateTaskCapsuleV1Input {
  return {
    project: { identity: 'project:web', workspaceRoot: '.', selectedAppRoot: 'apps/web' },
    task: {
      request: 'Repair the settings route without changing unrelated source.',
      route: '/settings',
    },
    graph: {
      snapshotId: 'graph:current',
      sourceHash: 'source:current',
      freshness: 'fresh',
      limitations: [],
    },
    readTargets: [
      {
        path: './apps\\web/src/routes/settings.tsx',
        kind: 'route-implementation',
        rank: 1,
        required: true,
      },
      {
        path: 'apps/web/src/routes/__root.tsx',
        kind: 'route-layout',
        rank: 2,
        required: false,
      },
      {
        path: 'apps/web/decantr.essence.json',
        kind: 'contract',
        rank: 3,
        required: false,
      },
    ],
    authority: {
      activeLane: 'production-source',
      entries: [
        {
          lane: 'essence-contract',
          summary: 'Essence governs declared route structure.',
          sourcePath: 'apps/web/decantr.essence.json',
        },
        {
          lane: 'production-source',
          summary: 'Existing runtime source is first authority.',
          sourcePath: 'apps/web/src/routes/settings.tsx',
        },
      ],
    },
    impact: {
      changedFiles: ['apps/web/src/routes/settings.tsx', 'apps/web/src/components/Form.tsx'],
      changedRoutes: ['/settings'],
      nodeIds: ['src:settings', 'cmp:form'],
      unresolvedFiles: ['apps/web/src/legacy/unknown.tsx'],
    },
    findings: [
      {
        code: 'A11Y001',
        severity: 'error',
        repairId: 'restore-accessible-name',
        graphNodeId: 'src:settings',
        blocking: true,
        summary: 'The settings submit control needs an accessible name.',
      },
      {
        code: 'STYLE001',
        severity: 'info',
        repairId: null,
        graphNodeId: 'cmp:form',
        blocking: false,
        summary: 'Review the existing form spacing.',
      },
    ],
    contentGuidance: [
      {
        identity: { namespace: '@official', type: 'pattern', id: 'settings-form-primary' },
        version: '1.0.0',
        digest: `sha256:${'a'.repeat(64)}`,
        origin: 'official',
        resolvedFrom: 'installed-package',
        summary: 'Required settings form guidance.',
        rank: 1,
        required: true,
      },
      {
        identity: { namespace: '@official', type: 'pattern', id: 'settings-form-advisory' },
        version: '1.1.0',
        digest: `sha256:${'b'.repeat(64)}`,
        origin: 'official',
        resolvedFrom: 'cache',
        summary: `Lower-ranked advisory guidance ${'x'.repeat(8_000)}`,
        rank: 2,
        required: false,
      },
      {
        identity: { namespace: '@official', type: 'theme', id: 'settings-theme-advisory' },
        version: null,
        digest: `sha256:${'c'.repeat(64)}`,
        origin: 'official',
        resolvedFrom: 'api',
        summary: `Lowest-ranked advisory guidance ${'\u754c'.repeat(8_000)}`,
        rank: 3,
        required: false,
      },
    ],
    stopConditions: [
      'Stop if the discovered route implementation disagrees with the current graph.',
      'Stop before changing unrelated routes.',
    ],
    verifyCommand: 'pnpm decantr verify --project apps/web',
  };
}

describe('Decantr 3.9 verifier contracts', () => {
  it('keeps adoption axes independent and never infers untouched without a receipt', () => {
    const truth = createAdoptionTruthV1({
      generatedAt: '2026-07-16T12:00:00.000Z',
      project: {
        workspaceRoot: '.',
        selectedAppRoot: 'apps/web',
        selectionReason: 'Explicit project selection.',
      },
      facts: [
        {
          id: 'historical-source-integrity',
          subject: 'historical-source-integrity',
          observation: {
            state: 'unknown',
            confidence: 'medium',
            provenance: [
              { kind: 'inference', path: null, detail: 'No historical receipt exists.' },
            ],
          },
          governance: { state: 'not_applicable', authority: null, provenance: [] },
          mutation: { state: 'not_checked', receiptIds: [] },
          limitations: ['Historical source integrity was not measured.'],
          nextAction: 'Run adoption with source-integrity receipts enabled.',
        },
        {
          id: 'host-source',
          subject: 'host-source',
          observation: {
            state: 'found',
            confidence: 'high',
            provenance: [
              { kind: 'source', path: './apps\\web/src/App.tsx', detail: 'Selected app source.' },
            ],
          },
          governance: {
            state: 'uncovered',
            authority: 'production-source',
            provenance: [],
          },
          mutation: { state: 'untouched', receiptIds: ['source-integrity'] },
          limitations: [],
          nextAction: 'Prepare the first governed task.',
        },
      ],
      mutationReceipts: [
        {
          id: 'source-integrity',
          operation: 'contract-only adoption',
          subjects: ['host-source'],
          outcome: 'untouched',
          complete: true,
          createdPaths: ['apps/web/.decantr/graph/graph.snapshot.json'],
          updatedPaths: [],
          deletedPaths: [],
          evidencePaths: ['apps/web/.decantr/adoption-receipt.json'],
          limitations: [],
        },
      ],
      limitations: [],
      nextAction: 'pnpm decantr task /settings "Repair settings" --project apps/web',
    });

    expect(truth.project).toEqual({
      workspaceRoot: '.',
      selectedAppRoot: 'apps/web',
      selectionReason: 'Explicit project selection.',
    });
    expect(truth.facts[0]?.mutation.state).toBe('not_checked');
    expect(truth.facts[1]?.observation.provenance[0]?.path).toBe('apps/web/src/App.tsx');
    expect(truth.facts[1]?.governance.state).toBe('uncovered');
    expect(truth.facts[1]?.mutation.state).toBe('untouched');
    assertMatchesVerifierSchema('adoption-truth.v1.json', truth);
    assertRejectedByVerifierSchema('adoption-truth.v1.json', {
      ...truth,
      facts: [
        {
          ...truth.facts[0],
          observation: { ...truth.facts[0]?.observation, state: 'not-found' },
        },
      ],
    });

    expect(() =>
      createAdoptionTruthV1({
        ...truth,
        facts: [
          {
            ...truth.facts[0]!,
            mutation: { state: 'untouched', receiptIds: [] },
          },
        ],
      }),
    ).toThrow(/use not_checked when no receipt exists/);
    expect(() =>
      createAdoptionTruthV1({
        ...truth,
        project: { ...truth.project, selectedAppRoot: '/absolute/apps/web' },
      }),
    ).toThrow(/workspace-relative/);
  });

  it('emits a deterministic structured task capsule and preserves protected facts', () => {
    expect(tokenEstimateV1(0)).toBe(0);
    expect(tokenEstimateV1(10)).toBe(4);
    expect(tokenEstimateV1(11_998)).toBe(4_000);
    expect(tokenEstimateV1(11_999)).toBe(4_000);
    expect(tokenEstimateV1(12_000)).toBe(4_000);
    expect(tokenEstimateV1(12_001)).toBe(4_001);
    const input = structuredTaskInput();
    const capsule = createTaskCapsuleV1(input);
    const reordered = createTaskCapsuleV1({
      ...input,
      readTargets: [...input.readTargets].reverse(),
      authority: { ...input.authority, entries: [...input.authority.entries].reverse() },
      impact: {
        changedFiles: [...input.impact.changedFiles].reverse(),
        changedRoutes: [...input.impact.changedRoutes].reverse(),
        nodeIds: [...input.impact.nodeIds].reverse(),
        unresolvedFiles: [...input.impact.unresolvedFiles].reverse(),
      },
      findings: [...input.findings].reverse(),
      contentGuidance: [...input.contentGuidance].reverse(),
      stopConditions: [...input.stopConditions].reverse(),
    });

    expect(capsule).toEqual(reordered);
    expect(capsule.project).toEqual({
      identity: 'project:web',
      workspaceRoot: '.',
      selectedAppRoot: 'apps/web',
    });
    expect(capsule.graph).toMatchObject({
      snapshotId: 'graph:current',
      sourceHash: 'source:current',
      freshness: 'fresh',
    });
    expect(capsule.readTargets[0]).toEqual({
      path: 'apps/web/src/routes/settings.tsx',
      kind: 'route-implementation',
      rank: 1,
      required: true,
    });
    expect(capsule.authority.activeLane).toBe('production-source');
    expect(capsule.findings.find((finding) => finding.blocking)?.code).toBe('A11Y001');
    expect(capsule.contentGuidance.some((guidance) => guidance.required)).toBe(true);
    expect(capsule.stopConditions).toEqual([...input.stopConditions].sort());
    expect(capsule.verifyCommand).toBe(input.verifyCommand);
    expect(capsule.task.route).toBe('/settings');
    expect(capsule.budget.maxCanonicalBytes).toBe(DEFAULT_TASK_CAPSULE_MAX_CANONICAL_BYTES);
    expect(canonicalUtf8Bytes(capsule)).toBe(capsule.budget.canonicalBytes);
    expect(capsule.budget.estimatedTokens).toBe(tokenEstimateV1(capsule.budget.canonicalBytes));
    expect(capsule.budget.canonicalBytes).toBeLessThanOrEqual(12_000);
    expect(capsule.budget.estimatedTokens).toBeLessThanOrEqual(4_000);
    expect(capsule.truncation.truncated).toBe(true);
    expect(capsule.truncation.omittedCounts.contentGuidance).toBeGreaterThan(0);
    expect('entries' in capsule).toBe(false);
    assertMatchesVerifierSchema('task-capsule.v1.json', capsule);
    assertRejectedByVerifierSchema('task-capsule.v1.json', {
      ...capsule,
      entries: [{ content: 'opaque duplicate context' }],
    });
  });

  it('truncates task prose but never route, protected context, or exact verifyCommand', () => {
    const input = structuredTaskInput();
    input.task.request = '\u754c'.repeat(8_000);
    input.readTargets = [input.readTargets[0]!];
    input.contentGuidance = [input.contentGuidance[0]!];
    input.impact = { changedFiles: [], changedRoutes: [], nodeIds: [], unresolvedFiles: [] };
    const capsule = createTaskCapsuleV1(input);

    expect(capsule.truncation.truncatedFields).toEqual(['task.request']);
    expect(capsule.task.route).toBe(input.task.route);
    expect(capsule.verifyCommand).toBe(input.verifyCommand);
    expect(capsule.readTargets[0]).toEqual({
      path: 'apps/web/src/routes/settings.tsx',
      kind: 'route-implementation',
      rank: 1,
      required: true,
    });
    expect(capsule.findings.some((finding) => finding.blocking)).toBe(true);
    expect(capsule.stopConditions).toEqual([...input.stopConditions].sort());
    expect(capsule.budget.canonicalBytes).toBeLessThanOrEqual(12_000);
    expect(capsule.budget.estimatedTokens).toBeLessThanOrEqual(4_000);
    assertMatchesVerifierSchema('task-capsule.v1.json', capsule);

    const protectedInput = structuredTaskInput();
    protectedInput.task.request = '';
    protectedInput.contentGuidance = [];
    protectedInput.impact = {
      changedFiles: [],
      changedRoutes: [],
      nodeIds: [],
      unresolvedFiles: [],
    };
    protectedInput.verifyCommand = `pnpm verify --filter ${'x'.repeat(800)}`;
    protectedInput.budget = { maxCanonicalBytes: 900, maxEstimatedTokens: 4_000 };
    expect(() => createTaskCapsuleV1(protectedInput)).toThrow(
      /protected project, route implementation, authority, findings, stop conditions, and exact verifyCommand/,
    );

    const invalidTargetInput = structuredTaskInput();
    invalidTargetInput.readTargets[0] = { ...invalidTargetInput.readTargets[0]!, required: false };
    expect(() => createTaskCapsuleV1(invalidTargetInput)).toThrow(
      /rank-1 required route-implementation/,
    );
  });

  it('is deterministic at the exact canonical byte boundary', () => {
    const input = structuredTaskInput();
    input.task.request = '\u754c'.repeat(1_200);
    input.readTargets = [input.readTargets[0]!];
    input.contentGuidance = [input.contentGuidance[0]!];
    input.impact = { changedFiles: [], changedRoutes: [], nodeIds: [], unresolvedFiles: [] };

    let lower = 1;
    let upper = DEFAULT_TASK_CAPSULE_MAX_CANONICAL_BYTES;
    while (lower < upper) {
      const candidate = Math.floor((lower + upper) / 2);
      let fitsWithoutTruncation = false;
      try {
        fitsWithoutTruncation = !createTaskCapsuleV1({
          ...input,
          budget: { maxCanonicalBytes: candidate, maxEstimatedTokens: 10_000 },
        }).truncation.truncated;
      } catch {
        fitsWithoutTruncation = false;
      }
      if (fitsWithoutTruncation) upper = candidate;
      else lower = candidate + 1;
    }

    const exact = createTaskCapsuleV1({
      ...input,
      budget: { maxCanonicalBytes: lower, maxEstimatedTokens: 10_000 },
    });
    const below = createTaskCapsuleV1({
      ...input,
      budget: { maxCanonicalBytes: lower - 1, maxEstimatedTokens: 10_000 },
    });
    const repeatedBelow = createTaskCapsuleV1({
      ...input,
      budget: { maxCanonicalBytes: lower - 1, maxEstimatedTokens: 10_000 },
    });

    expect(exact.truncation.truncated).toBe(false);
    expect(exact.budget.canonicalBytes).toBe(lower);
    expect(canonicalUtf8Bytes(exact)).toBe(lower);
    expect(below.truncation).toMatchObject({
      truncated: true,
      reasons: ['byte-budget'],
      truncatedFields: ['task.request'],
    });
    expect(below.task.request.endsWith('\u2026')).toBe(true);
    expect(below.task.request).not.toContain('\ufffd');
    expect(below.budget.canonicalBytes).toBeLessThanOrEqual(lower - 1);
    expect(below.budget.estimatedTokens).toBe(tokenEstimateV1(below.budget.canonicalBytes));
    expect(below).toEqual(repeatedBelow);
  });

  it('emits complete new, inherited, and resolved governance evidence with a deterministic gate', () => {
    expect(fingerprintFindingOccurrenceV1(finding('./apps/web/src\\Button.tsx'))).toBe(
      fingerprintFindingOccurrenceV1(finding('apps/web/src/Button.tsx')),
    );
    const delta = createGovernanceDeltaV1(completeDeltaInput());

    expect(delta.changeBase.changedFiles).toEqual(['apps/web/src/new.tsx']);
    expect(delta.summary).toEqual({
      currentCount: 2,
      newCount: 1,
      inheritedCount: 1,
      resolvedCount: 1,
      unclassifiedCount: 0,
      blockingCount: 1,
    });
    expect(delta.gate.result).toBe('fail');
    expect(delta.gate.status).toBe('blocked');
    expect(delta.gate.blockingFingerprints).toEqual([delta.findings.new[0]?.fingerprint]);
    expect(delta.findings.new[0]).toMatchObject({
      code: 'A11Y001',
      ruleId: 'accessible-name',
      severity: 'warn',
      authorityLane: 'local-law',
      repairId: 'restore-accessible-name',
      repairTarget: 'apps/web/src/new.tsx',
      annotation: { path: 'apps/web/src/new.tsx', startLine: 12, startColumn: 3 },
    });
    assertMatchesVerifierSchema('governance-delta.v1.json', delta);
  });

  it('keeps strong finding identities stable across harmless line and repair movement', () => {
    const original = finding('apps/web/src/Button.tsx');
    const moved = {
      ...original,
      repairId: 'restore-accessible-name-v2',
      repairTarget: 'apps/web/src/Button.repair.tsx',
      annotation: {
        ...original.annotation,
        startLine: 48,
        endLine: 48,
      },
      location: { line: 48, column: 3, endLine: 48, endColumn: 18 },
    };

    expect(fingerprintFindingOccurrenceV1(moved)).toBe(fingerprintFindingOccurrenceV1(original));
  });

  it('blocks inherited findings whose severity escalates across the gate threshold', () => {
    const input = completeDeltaInput();
    input.failOn = 'error';
    input.debtBaseline.findings = [finding('apps/web/src/Button.tsx')];
    input.currentFindings = [{ ...finding('apps/web/src/Button.tsx'), severity: 'error' }];
    const delta = createGovernanceDeltaV1(input);

    expect(delta.findings.new).toEqual([]);
    expect(delta.findings.inherited).toHaveLength(1);
    expect(delta.gate).toMatchObject({ result: 'fail', status: 'blocked' });
    expect(delta.gate.blockingFingerprints).toEqual([delta.findings.inherited[0]?.fingerprint]);
    expect(delta.summary.blockingCount).toBe(1);
  });

  it('routes findings to unclassified and returns not_proven for missing or incompatible debt', () => {
    const missingInput = completeDeltaInput();
    missingInput.debtBaseline = {
      ...missingInput.debtBaseline,
      identity: null,
      hash: null,
      completeness: 'incomplete',
      freshness: 'unknown',
      compatibility: 'unknown',
      findings: [],
    };
    const missing = createGovernanceDeltaV1(missingInput);

    expect(missing.findings.new).toEqual([]);
    expect(missing.findings.unclassified).toHaveLength(2);
    expect(missing.summary.unclassifiedCount).toBe(2);
    expect(missing.gate).toMatchObject({ result: 'not_proven', status: 'incomplete' });
    expect(missing.limitations).toContain('Debt baseline identity or hash is missing.');
    assertMatchesVerifierSchema('governance-delta.v1.json', missing);
    assertRejectedByVerifierSchema('governance-delta.v1.json', {
      ...missing,
      unexpectedProviderPayload: {},
    });

    const incompatibleInput = completeDeltaInput();
    incompatibleInput.debtBaseline.compatibility = 'incompatible';
    incompatibleInput.debtBaseline.projectIdentity = 'project:other';
    const incompatible = createGovernanceDeltaV1(incompatibleInput);
    expect(incompatible.findings.new).toEqual([]);
    expect(incompatible.findings.unclassified).toHaveLength(2);
    expect(incompatible.gate.result).toBe('not_proven');

    const falselyCompatibleInput = completeDeltaInput();
    falselyCompatibleInput.debtBaseline.projectIdentity = null;
    falselyCompatibleInput.debtBaseline.compatibility = 'compatible';
    const falselyCompatible = createGovernanceDeltaV1(falselyCompatibleInput);
    expect(falselyCompatible.debtBaseline.compatibility).toBe('incompatible');
    expect(falselyCompatible.findings.unclassified).toHaveLength(2);
    expect(falselyCompatible.limitations).toContain('Debt baseline project identity is missing.');
  });

  it.each([
    {
      dimension: 'baseline occurrence completeness',
      mutate: (input: CreateGovernanceDeltaV1Input) => {
        input.debtBaseline.completeness = 'incomplete';
      },
      limitation: 'Debt baseline is incomplete.',
    },
    {
      dimension: 'baseline freshness',
      mutate: (input: CreateGovernanceDeltaV1Input) => {
        input.debtBaseline.freshness = 'stale';
      },
      limitation: 'Debt baseline is stale.',
    },
    {
      dimension: 'baseline compatibility',
      mutate: (input: CreateGovernanceDeltaV1Input) => {
        input.debtBaseline.compatibility = 'incompatible';
      },
      limitation: 'Debt baseline compatibility is incompatible.',
    },
    {
      dimension: 'change-base completeness',
      mutate: (input: CreateGovernanceDeltaV1Input) => {
        input.changeBase.completeness = 'incomplete';
      },
      limitation: 'Git change base is incomplete.',
    },
    {
      dimension: 'current graph completeness',
      mutate: (input: CreateGovernanceDeltaV1Input) => {
        input.current.graph.completeness = 'incomplete';
      },
      limitation: 'Current graph evidence is incomplete.',
    },
    {
      dimension: 'current graph freshness',
      mutate: (input: CreateGovernanceDeltaV1Input) => {
        input.current.graph.freshness = 'stale';
      },
      limitation: 'Current graph evidence is stale.',
    },
    {
      dimension: 'current verification evidence completeness',
      mutate: (input: CreateGovernanceDeltaV1Input) => {
        input.current.evidence.completeness = 'incomplete';
      },
      limitation: 'Current verification evidence is incomplete.',
    },
    {
      dimension: 'current verification evidence freshness',
      mutate: (input: CreateGovernanceDeltaV1Input) => {
        input.current.evidence.freshness = 'unknown';
      },
      limitation: 'Current verification evidence is unknown.',
    },
  ])('keeps every finding unclassified when $dimension proof is incomplete', ({
    mutate,
    limitation,
  }) => {
    const input = completeDeltaInput();
    mutate(input);
    const delta = createGovernanceDeltaV1(input);

    expect(delta.findings.new).toEqual([]);
    expect(delta.findings.inherited).toEqual([]);
    expect(delta.findings.resolved).toEqual([]);
    expect(delta.findings.unclassified).toHaveLength(2);
    expect(
      delta.findings.unclassified.every(
        (findingOccurrence) => findingOccurrence.classification === 'unclassified',
      ),
    ).toBe(true);
    expect(delta.summary).toMatchObject({
      currentCount: 2,
      newCount: 0,
      inheritedCount: 0,
      resolvedCount: 0,
      unclassifiedCount: 2,
    });
    expect(delta.gate).toMatchObject({ result: 'not_proven', status: 'incomplete' });
    expect(delta.limitations).toContain(limitation);
    assertMatchesVerifierSchema('governance-delta.v1.json', delta);
  });

  it('normalizes a missing graph to incomplete and never emits a clean gate', () => {
    const input = completeDeltaInput();
    input.current.graph.identity = null;
    input.current.graph.sourceHash = null;
    const delta = createGovernanceDeltaV1(input);

    expect(delta.current.graph.completeness).toBe('incomplete');
    expect(delta.current.graph.limitations).toContain(
      'Current graph identity or source hash is missing.',
    );
    expect(delta.findings.new).toEqual([]);
    expect(delta.findings.inherited).toEqual([]);
    expect(delta.findings.resolved).toEqual([]);
    expect(delta.findings.unclassified).toHaveLength(2);
    expect(delta.gate).toMatchObject({ result: 'not_proven', status: 'incomplete' });
    expect(delta.gate.status).not.toBe('clean');
    assertMatchesVerifierSchema('governance-delta.v1.json', delta);
  });

  it('normalizes missing current evidence to incomplete and leaves findings unclassified', () => {
    const input = completeDeltaInput();
    input.current.evidence.identity = null;
    input.current.evidence.hash = null;
    const delta = createGovernanceDeltaV1(input);

    expect(delta.current.evidence.completeness).toBe('incomplete');
    expect(delta.current.evidence.limitations).toContain(
      'Current evidence identity or hash is missing.',
    );
    expect(delta.findings.new).toEqual([]);
    expect(delta.findings.inherited).toEqual([]);
    expect(delta.findings.resolved).toEqual([]);
    expect(delta.findings.unclassified).toHaveLength(2);
    expect(delta.gate).toMatchObject({ result: 'not_proven', status: 'incomplete' });
    assertMatchesVerifierSchema('governance-delta.v1.json', delta);
  });

  it('normalizes a missing Git change base to incomplete and never emits a clean gate', () => {
    const input = completeDeltaInput();
    input.changeBase.identity = null;
    input.changeBase.hash = null;
    const delta = createGovernanceDeltaV1(input);

    expect(delta.changeBase.completeness).toBe('incomplete');
    expect(delta.changeBase.limitations).toContain('Git change base identity or hash is missing.');
    expect(delta.findings.new).toEqual([]);
    expect(delta.findings.inherited).toEqual([]);
    expect(delta.findings.resolved).toEqual([]);
    expect(delta.findings.unclassified).toHaveLength(2);
    expect(delta.gate).toMatchObject({ result: 'not_proven', status: 'incomplete' });
    expect(delta.gate.status).not.toBe('clean');
    assertMatchesVerifierSchema('governance-delta.v1.json', delta);
  });
});
