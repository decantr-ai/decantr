import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  prettyCanonicalJson,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
  writeContentAddressed,
} from '../runner/canonical.mjs';
import {
  calculateRunPlanDigest,
  expectedAnalysisSeed,
  expectedReviewSeed,
} from '../runner/contracts.mjs';
import { analyzeStatistics } from './analyze.mjs';

const benchmarkDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const protocolPath = join(benchmarkDirectory, 'protocol.json');

test('statistics use sealed tasks only and gate functional noninferiority overall within each model', async () => {
  const fixture = await createStatisticsFixture();
  try {
    const statistics = await analyzeStatistics({ ...fixture.options, bootstrapIterations: 500 });
    assert.equal(statistics.denominators.sealedQualificationTasks, 16);
    assert.equal(statistics.denominators.expectedRuns, 128);
    assert.equal(statistics.denominators.observedRuns, 128);
    assert.equal(statistics.modelLift.length, 2);
    assert.equal(statistics.modelLift.every((item) => item.estimate === 10), true);
    assert.equal(statistics.governanceReduction.every((item) => item.estimate === 50), true);
    assert.equal(
      statistics.functionalNonInferiority.overallByModel.every(
        (item) => item.estimate === 0 && item.n === 16,
      ),
      true,
    );
    const singletonStrata = statistics.functionalNonInferiority.exploratoryByFramework.filter(
      (item) => item.framework === 'svelte-singleton',
    );
    assert.equal(singletonStrata.length, 2);
    assert.equal(
      singletonStrata.every(
        (item) =>
          item.n === 1 &&
          item.powered === false &&
          item.gateEligible === false &&
          item.interpretation === 'exploratory-unpowered',
      ),
      true,
    );
    assert.equal(statistics.blindPreference.estimate, 1);
    assert.equal(statistics.blindPreference.analysisUnit, 'qualification-task-model');
    assert.equal(statistics.blindPreference.plannedUnits, 32);
    assert.equal(statistics.blindPreference.minimumDecisiveUnits, 26);
    assert.equal(statistics.blindPreference.n, 32);
    assert.equal(statistics.blindPreference.ties, 0);
    assert.ok(statistics.blindPreference.confidenceInterval.lower > 0.5);
    assert.equal(statistics.denominators.reviewAssignments, 64);
    assert.equal(statistics.denominators.excludedReviewAssignments, 0);
    assert.equal(statistics.overhead.tokens.medianPercent, 10);
    assert.ok(Math.abs(statistics.overhead.cost.medianPercent - 10) < 1e-9);
    assert.equal(statistics.failures.length, 0);
    assert.equal(statistics.allGatesPassed, true);
    assert.deepEqual(statistics.claimAuthorization, {
      outcome: 'pass',
      valueClaim: 'release-audit-required',
      mixedValueClaim: 'no-value-claim',
      scopedHypothesesPredeclaredAndPowered: false,
    });
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('statistics keep a failed run in the denominator and fail closed', async () => {
  const fixture = await createStatisticsFixture();
  try {
    const targetRun = fixture.plan.runs.find((run) => run.arm === 'treatment');
    const indexPath = join(fixture.options.recordRoot, 'run-index', `${targetRun.runId}.json`);
    const index = JSON.parse(await readFile(indexPath, 'utf8'));
    const recordPath = join(
      fixture.options.recordRoot,
      'run-records',
      'sha256',
      `${index.recordSha256}.json`,
    );
    const record = JSON.parse(await readFile(recordPath, 'utf8'));
    record.status = 'unsupported';
    record.failure = { stage: 'adapter', code: 'UNSUPPORTED', message: 'visible unsupported fixture' };
    record.evaluatorResultSha256 = null;
    const replacement = await writeContentAddressed(fixture.options.recordRoot, 'run-records', record);
    await writeCanonicalFile(indexPath, { runId: targetRun.runId, recordSha256: replacement.digest });

    const statistics = await analyzeStatistics({ ...fixture.options, bootstrapIterations: 200 });
    assert.equal(statistics.denominators.expectedRuns, 128);
    assert.equal(statistics.denominators.observedRuns, 128);
    assert.equal(statistics.denominators.failedRuns, 1);
    assert.equal(statistics.failures.some((item) => item.runId === targetRun.runId), true);
    assert.equal(statistics.gates.governanceReduction, false);
    assert.equal(statistics.allGatesPassed, false);
    assert.equal(statistics.claimAuthorization.valueClaim, 'no-value-claim');
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('blind preference requires its Wilson lower bound to exceed no preference', async () => {
  const fixture = await createStatisticsFixture();
  try {
    const assignments = JSON.parse(await readFile(fixture.options.assignmentsPath, 'utf8'));
    const review = JSON.parse(await readFile(fixture.options.reviewWorkbookPath, 'utf8'));
    const preferenceUnitIds = [...new Set(assignments.assignments.map((item) => item.preferenceUnitId))];
    const treatmentUnits = new Set(preferenceUnitIds.slice(0, 20));
    for (const assignment of assignments.assignments) {
      setAssignmentPreference(
        review,
        assignment,
        treatmentUnits.has(assignment.preferenceUnitId) ? 'treatment' : 'control',
      );
    }
    await writeFile(fixture.options.reviewWorkbookPath, prettyCanonicalJson(review));

    const statistics = await analyzeStatistics({ ...fixture.options, bootstrapIterations: 200 });
    assert.equal(statistics.blindPreference.n, 32);
    assert.equal(statistics.blindPreference.estimate, 20 / 32);
    assert.ok(statistics.blindPreference.confidenceInterval.lower < 0.5);
    assert.equal(statistics.gates.blindPreference, false);
    assert.equal(statistics.allGatesPassed, false);
    assert.equal(statistics.claimAuthorization.outcome, 'mixed');
    assert.equal(statistics.claimAuthorization.valueClaim, 'no-value-claim');
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('blind preference collapses split repetitions to ties and enforces the decisive minimum', async () => {
  const fixture = await createStatisticsFixture();
  try {
    const assignments = JSON.parse(await readFile(fixture.options.assignmentsPath, 'utf8'));
    const review = JSON.parse(await readFile(fixture.options.reviewWorkbookPath, 'utf8'));
    const tiedUnitIds = [
      ...new Set(assignments.assignments.map((item) => item.preferenceUnitId)),
    ].slice(0, 7);
    const tiedUnits = new Set(tiedUnitIds);
    const tiedRepetitions = new Set();
    for (const assignment of assignments.assignments) {
      if (!tiedUnits.has(assignment.preferenceUnitId)) continue;
      const prior = tiedRepetitions.has(assignment.preferenceUnitId);
      const firstOutcome = assignment.preferenceUnitId === tiedUnitIds[0] ? 'tie' : 'control';
      setAssignmentPreference(review, assignment, prior ? 'treatment' : firstOutcome);
      tiedRepetitions.add(assignment.preferenceUnitId);
    }
    await writeFile(fixture.options.reviewWorkbookPath, prettyCanonicalJson(review));

    const statistics = await analyzeStatistics({ ...fixture.options, bootstrapIterations: 200 });
    assert.equal(statistics.blindPreference.treatmentPreferred, 25);
    assert.equal(statistics.blindPreference.controlPreferred, 0);
    assert.equal(statistics.blindPreference.n, 25);
    assert.equal(statistics.blindPreference.ties, 7);
    assert.equal(statistics.blindPreference.estimate, 1);
    assert.ok(statistics.blindPreference.confidenceInterval.lower > 0.5);
    assert.equal(statistics.gates.blindPreference, false);
    assert.equal(statistics.allGatesPassed, false);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('development review assignments are excluded from qualification preference statistics', async () => {
  const fixture = await createStatisticsFixture();
  try {
    const assignments = JSON.parse(await readFile(fixture.options.assignmentsPath, 'utf8'));
    const review = JSON.parse(await readFile(fixture.options.reviewWorkbookPath, 'utf8'));
    const assignmentId = 'assignment-development-noise';
    assignments.assignments.push({
      assignmentId,
      preferenceUnitId: 'preference-unit-development-noise',
      taskId: 'development-noise',
      framework: 'react',
      candidates: [
        {
          label: 'A',
          artifactId: 'development-control',
          runId: 'run-development-control',
          arm: 'control',
          modelId: 'model-a',
          repetition: 1,
          recordSha256: 'a'.repeat(64),
        },
        {
          label: 'B',
          artifactId: 'development-treatment',
          runId: 'run-development-treatment',
          arm: 'treatment',
          modelId: 'model-a',
          repetition: 1,
          recordSha256: 'b'.repeat(64),
        },
      ],
    });
    await writeFile(fixture.options.assignmentsPath, prettyCanonicalJson(assignments));
    review.assignmentsSha256 = sha256(await readFile(fixture.options.assignmentsPath));
    review.reviews.push(
      {
        assignmentId,
        reviewerId: 'reviewer-one',
        scores: { A: 100, B: 0 },
        preference: 'A',
        completedAt: '2026-07-22T12:02:00.000Z',
      },
      {
        assignmentId,
        reviewerId: 'reviewer-two',
        scores: { A: 100, B: 0 },
        preference: 'A',
        completedAt: '2026-07-22T12:03:00.000Z',
      },
    );
    await writeFile(fixture.options.reviewWorkbookPath, prettyCanonicalJson(review));

    const statistics = await analyzeStatistics({ ...fixture.options, bootstrapIterations: 200 });
    assert.equal(statistics.denominators.reviewAssignments, 64);
    assert.equal(statistics.denominators.excludedReviewAssignments, 1);
    assert.equal(statistics.blindPreference.n, 32);
    assert.equal(statistics.blindPreference.estimate, 1);
    assert.equal(
      statistics.failures.some((item) => item.code === 'EXCLUDED_NONQUALIFICATION_ASSIGNMENT'),
      true,
    );
    assert.equal(statistics.gates.evidenceComplete, false);
    assert.equal(statistics.allGatesPassed, false);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

async function createStatisticsFixture() {
  const root = await mkdtemp(join(tmpdir(), 'statistics-test-'));
  const recordRoot = join(root, 'records');
  const tasks = Array.from({ length: 16 }, (_, index) => ({
    taskId: `qualification-${String(index + 1).padStart(2, '0')}`,
    repositoryId: `repository-${String(index + 1).padStart(2, '0')}`,
    framework: index === 15 ? 'svelte-singleton' : index % 2 === 0 ? 'react' : 'angular',
  }));
  const modelIds = ['model-a', 'model-b'];
  const digest = sha256Canonical({ fixture: true });
  const protocolBytes = await readFile(protocolPath);
  const protocol = JSON.parse(protocolBytes);
  const protocolBinding = {
    logicalName: 'protocol.json',
    sha256: sha256(protocolBytes),
    bytes: protocolBytes.byteLength,
  };
  const taskBindings = tasks.map((task) => ({
    ...task,
    partition: 'qualification',
    kind: 'repository',
    projectPath: '.',
    corpusProjectPath: '.',
    corpusCommit: 'c'.repeat(40),
    base: { commit: 'a'.repeat(40), tree: 'b'.repeat(40) },
    candidateSha256: digest,
    manifestSha256: sha256Canonical({ task: task.taskId }),
    evaluatorContractSha256: digest,
    evaluatorSpecSha256: digest,
    oracleSourceSha256: digest,
    qualificationControllerSha256: digest,
    qualificationReceiptFileSha256: digest,
    qualificationReceiptSha256: digest,
    qualificationExecutionAttestationFileSha256: digest,
    qualificationExecutionAttestationSha256: digest,
    qualificationExecutionControllerSha256: digest,
    qualificationEvaluatorSourceClosureSha256: digest,
    qualificationInputRequestFileSha256: digest,
    qualificationInputRequestSha256: digest,
    qualificationInputManifestFileSha256: digest,
    qualificationInputManifestSha256: digest,
    qualificationRunnerRepositoryCommit: 'd'.repeat(40),
    qualificationProvenanceBundleFileSha256: digest,
    qualificationProvenanceVerificationSha256: digest,
    informationEntitlementSha256: digest,
    environmentSpecSha256: digest,
    environmentSubstanceSha256: digest,
    runtimeProfileId: 'node-22.19.0-pnpm-10.33.0',
    runtimeMatrixFileSha256: digest,
    runtimeMatrixSha256: digest,
    benchmarkImageDigest: `sha256:${digest}`,
    sourceRef: `${task.taskId}.json`,
  }));
  const runs = [];
  for (const task of tasks) {
    for (const modelId of modelIds) {
      for (const arm of ['control', 'treatment']) {
        for (let repetition = 1; repetition <= 2; repetition += 1) {
          runs.push({
            runId: `run-${task.taskId}-${modelId}-${arm}-${repetition}`,
            ordinal: runs.length + 1,
            block: tasks.findIndex((item) => item.taskId === task.taskId) + 1,
            taskId: task.taskId,
            partition: 'qualification',
            repositoryId: task.repositoryId,
            framework: task.framework,
            modelId,
            provider: 'fixture',
            requestedModel: `${modelId}-requested`,
            arm,
            repetition,
            taskManifestSha256: taskBindings.find((item) => item.taskId === task.taskId).manifestSha256,
          });
        }
      }
    }
  }
  const binding = { logicalName: 'fixture', sha256: digest, bytes: 1 };
  const plan = {
    schemaVersion: 'decantr-benchmark-run-plan.v2',
    program: 'decantr-3.10-ui-change-control-proof',
    seed: protocol.design.randomizationSeed,
    bindings: {
      corpus: binding,
      models: binding,
      protocol: protocolBinding,
      runtimeMatrix: binding,
      qualificationTaskIndex: binding,
      developmentTasks: [binding],
    },
    design: { tasks: 16, models: 2, arms: 2, repetitions: 2, totalRuns: 128 },
    tasks: taskBindings,
    runs,
  };
  plan.planSha256 = calculateRunPlanDigest(plan);
  const planPath = join(root, 'plan.json');
  await writeFile(planPath, prettyCanonicalJson(plan));

  const qualification = {
    schemaVersion: 'decantr-benchmark-qualification-task-index.v2',
    program: 'decantr-3.10-ui-change-control-proof',
    sealedAt: '2026-07-22T12:00:00.000Z',
    bundleSha256: digest,
    tasks: taskBindings.map((task) => ({
      taskId: task.taskId,
      kind: task.kind,
      repositoryId: task.repositoryId,
      framework: task.framework,
      projectPath: task.projectPath,
      corpusProjectPath: task.corpusProjectPath,
      corpusCommit: task.corpusCommit,
      base: task.base,
      candidateSha256: task.candidateSha256,
      manifestSha256: task.manifestSha256,
      evaluatorContractSha256: task.evaluatorContractSha256,
      evaluatorSpecSha256: task.evaluatorSpecSha256,
      oracleSourceSha256: task.oracleSourceSha256,
      qualificationControllerSha256: task.qualificationControllerSha256,
      qualificationReceiptFileSha256: task.qualificationReceiptFileSha256,
      qualificationReceiptSha256: task.qualificationReceiptSha256,
      qualificationExecutionAttestationFileSha256: task.qualificationExecutionAttestationFileSha256,
      qualificationExecutionAttestationSha256: task.qualificationExecutionAttestationSha256,
      qualificationExecutionControllerSha256: task.qualificationExecutionControllerSha256,
      qualificationEvaluatorSourceClosureSha256: task.qualificationEvaluatorSourceClosureSha256,
      qualificationInputRequestFileSha256: task.qualificationInputRequestFileSha256,
      qualificationInputRequestSha256: task.qualificationInputRequestSha256,
      qualificationInputManifestFileSha256: task.qualificationInputManifestFileSha256,
      qualificationInputManifestSha256: task.qualificationInputManifestSha256,
      qualificationRunnerRepositoryCommit: task.qualificationRunnerRepositoryCommit,
      qualificationProvenanceBundleFileSha256: task.qualificationProvenanceBundleFileSha256,
      qualificationProvenanceVerificationSha256: task.qualificationProvenanceVerificationSha256,
      informationEntitlementSha256: task.informationEntitlementSha256,
      environmentSpecSha256: task.environmentSpecSha256,
      environmentSubstanceSha256: task.environmentSubstanceSha256,
      runtimeProfileId: task.runtimeProfileId,
      runtimeMatrixFileSha256: task.runtimeMatrixFileSha256,
      runtimeMatrixSha256: task.runtimeMatrixSha256,
      benchmarkImageDigest: task.benchmarkImageDigest,
      hiddenRef: task.sourceRef,
    })),
  };
  qualification.bundleSha256 = sha256Canonical(qualification.tasks);
  const qualificationIndexPath = join(root, 'qualification-index.json');
  await writeFile(qualificationIndexPath, prettyCanonicalJson(qualification));

  const recordBindings = [];
  for (const run of runs) {
    const treatment = run.arm === 'treatment';
    const evaluator = await writeContentAddressed(recordRoot, 'evaluator-results', {
      schemaVersion: 'decantr-benchmark-evaluator-result.v1',
      runId: run.runId,
      taskId: run.taskId,
      status: 'passed',
      metrics: { functionalSuccess: true, buildPassed: true, governanceViolations: treatment ? 2 : 4 },
    });
    const record = await writeContentAddressed(recordRoot, 'run-records', {
      schemaVersion: 'decantr-benchmark-run-record.v2',
      runId: run.runId,
      status: 'completed',
      evaluatorResultSha256: evaluator.digest,
      usage: { inputTokens: treatment ? 80 : 70, outputTokens: 30, cachedInputTokens: 0, requests: 1 },
      budget: { actualUsd: treatment ? 1.1 : 1 },
      failure: null,
    });
    await writeCanonicalFile(join(recordRoot, 'run-index', `${run.runId}.json`), {
      runId: run.runId,
      recordSha256: record.digest,
    });
    recordBindings.push({ runId: run.runId, recordSha256: record.digest });
  }
  await writeCanonicalFile(join(recordRoot, 'run-index', 'run-development-noise.json'), {
    runId: 'run-development-noise',
    recordSha256: digest,
  });
  const recordSetSha256 = sha256Canonical(recordBindings.sort((a, b) => a.runId.localeCompare(b.runId)));
  const assignments = {
    schemaVersion: 'decantr-benchmark-review-assignments.v1',
    seed: expectedReviewSeed(plan.seed),
    runPlanSha256: plan.planSha256,
    recordSetSha256,
    assignments: [],
  };
  for (const task of tasks) {
    for (const modelId of modelIds) {
      for (let repetition = 1; repetition <= 2; repetition += 1) {
        const control = runs.find(
          (run) => run.taskId === task.taskId && run.modelId === modelId && run.arm === 'control' && run.repetition === repetition,
        );
        const treatment = runs.find(
          (run) => run.taskId === task.taskId && run.modelId === modelId && run.arm === 'treatment' && run.repetition === repetition,
        );
        assignments.assignments.push({
          assignmentId: `assignment-${task.taskId}-${modelId}-${repetition}`,
          preferenceUnitId: calculatePreferenceUnitId(assignments.seed, task.taskId, modelId),
          taskId: task.taskId,
          framework: task.framework,
          candidates: [
            { label: 'A', artifactId: 'a', runId: control.runId, arm: 'control', modelId, repetition, recordSha256: recordBindings.find((item) => item.runId === control.runId).recordSha256 },
            { label: 'B', artifactId: 'b', runId: treatment.runId, arm: 'treatment', modelId, repetition, recordSha256: recordBindings.find((item) => item.runId === treatment.runId).recordSha256 },
          ],
        });
      }
    }
  }
  const assignmentsPath = join(root, 'assignments.json');
  await writeFile(assignmentsPath, prettyCanonicalJson(assignments));
  const assignmentsSha256 = sha256(await readFile(assignmentsPath));
  const review = {
    schemaVersion: 'decantr-benchmark-review-workbook.v1',
    blinded: true,
    assignmentsSha256,
    reviewers: ['reviewer-one', 'reviewer-two'],
    reviews: assignments.assignments.flatMap((assignment) => [
      {
        assignmentId: assignment.assignmentId,
        reviewerId: 'reviewer-one',
        scores: { A: 70, B: 80 },
        preference: 'B',
        completedAt: '2026-07-22T12:00:00.000Z',
      },
      {
        assignmentId: assignment.assignmentId,
        reviewerId: 'reviewer-two',
        scores: { A: 70, B: 80 },
        preference: 'B',
        completedAt: '2026-07-22T12:01:00.000Z',
      },
    ]),
    adjudications: [],
  };
  const reviewWorkbookPath = join(root, 'reviews.json');
  await writeFile(reviewWorkbookPath, prettyCanonicalJson(review));
  return {
    root,
    plan,
    options: {
      planPath,
      protocolPath,
      qualificationIndexPath,
      recordRoot,
      assignmentsPath,
      reviewWorkbookPath,
      seed: expectedAnalysisSeed(protocol.design.randomizationSeed),
      outputPath: join(root, 'statistics.json'),
    },
  };
}

function setAssignmentPreference(workbook, assignment, outcome) {
  const preference =
    outcome === 'tie'
      ? 'tie'
      : assignment.candidates.find((candidate) => candidate.arm === outcome)?.label;
  assert.ok(preference, `${assignment.assignmentId}: missing ${outcome} candidate`);
  for (const review of workbook.reviews) {
    if (review.assignmentId === assignment.assignmentId) review.preference = preference;
  }
}

function calculatePreferenceUnitId(seed, taskId, modelId) {
  return `preference-unit-${sha256Canonical({ seed, taskId, modelId }).slice(0, 20)}`;
}
