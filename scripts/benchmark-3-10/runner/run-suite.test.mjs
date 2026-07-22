import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { prettyCanonicalJson, sha256Canonical } from './canonical.mjs';
import { calculateRunPlanDigest } from './contracts.mjs';
import { runSuite, selectRuns } from './run-suite.mjs';

test('suite selection is explicit and rejects unknown runs', () => {
  const plan = makePlan();
  assert.deepEqual(selectRuns(plan, ['run-a']).map((run) => run.runId), ['run-a']);
  assert.deepEqual(selectRuns(plan, [], 1).map((run) => run.runId), ['run-a']);
  assert.throws(() => selectRuns(plan, ['run-missing']), /not in plan/u);
});

test('run-suite preserves harness failures in its manifest instead of dropping them', async () => {
  const root = await mkdtemp(join(tmpdir(), 'run-suite-test-'));
  try {
    const plan = makePlan();
    const planPath = join(root, 'plan.json');
    await writeFile(planPath, prettyCanonicalJson(plan));
    const result = await runSuite(
      {
        planPath,
        workspaceRoot: root,
        developmentTaskRoot: root,
        qualificationTaskRoot: root,
        developmentEnvironmentRoot: root,
        qualificationEnvironmentRoot: root,
        evaluatorRoot: root,
        candidateManifestPath: join(root, 'candidate.json'),
        runtimeMatrixPath: join(root, 'runtime-matrix.json'),
        preparedEnvironmentRoot: root,
        outputRoot: join(root, 'output'),
        adapterArgs: [],
        runIds: [],
        limit: null,
        paid: false,
      },
      async (options) => {
        if (options.runId === 'run-b') throw new Error('visible fixture failure');
        return { record: { status: 'completed' }, recordSha256: sha256Canonical({ runId: options.runId }) };
      },
    );
    assert.equal(result.manifest.attemptedRuns, 2);
    assert.equal(result.manifest.passed, 1);
    assert.equal(result.manifest.failed, 1);
    assert.equal(result.manifest.complete, false);
    assert.match(result.manifest.results[1].error, /visible fixture failure/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

function makePlan() {
  const digest = sha256Canonical({ fixture: true });
  const task = {
    taskId: 'task-fixture',
    partition: 'development',
    kind: 'adversarial',
    repositoryId: 'repository-fixture',
    framework: 'react',
    projectPath: '.',
    corpusProjectPath: '.',
    corpusCommit: 'a'.repeat(40),
    base: { commit: 'a'.repeat(40), tree: 'b'.repeat(40) },
    manifestSha256: digest,
    candidateSha256: digest,
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
    sourceRef: 'task.json',
  };
  const baseRun = {
    ordinal: 1,
    block: 1,
    taskId: task.taskId,
    partition: task.partition,
    repositoryId: task.repositoryId,
    framework: task.framework,
    modelId: 'model-fixture',
    provider: 'fixture',
    requestedModel: 'model-v1',
    arm: 'control',
    repetition: 1,
    taskManifestSha256: digest,
  };
  const binding = { logicalName: 'fixture', sha256: digest, bytes: 1 };
  const plan = {
    schemaVersion: 'decantr-benchmark-run-plan.v2',
    program: 'decantr-3.10-ui-change-control-proof',
    seed: 'suite-fixture-seed-0001',
    bindings: {
      corpus: binding,
      models: binding,
      protocol: binding,
      runtimeMatrix: binding,
      qualificationTaskIndex: binding,
      developmentTasks: [binding],
    },
    design: { tasks: 1, models: 1, arms: 2, repetitions: 1, totalRuns: 2 },
    tasks: [task],
    runs: [
      { ...baseRun, runId: 'run-a' },
      { ...baseRun, runId: 'run-b', ordinal: 2, arm: 'treatment' },
    ],
  };
  plan.planSha256 = calculateRunPlanDigest(plan);
  return plan;
}
