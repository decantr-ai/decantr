import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  prettyCanonicalJson,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
  writeContentAddressed,
} from '../runner/canonical.mjs';
import { calculateRunPlanDigest, expectedReviewSeed } from '../runner/contracts.mjs';
import { prepareReviewKit } from './prepare-kit.mjs';
import { sealReview } from './seal-review.mjs';

test('review preparation strips arm, model, run, and product identity and sealing requires adjudication', async () => {
  const root = await mkdtemp(join(tmpdir(), 'review-kit-test-'));
  try {
    const fixture = await createFixture(root);
    const result = await prepareReviewKit({
      planPath: fixture.planPath,
      recordRoot: fixture.recordRoot,
      qualificationTaskRoot: fixture.taskRoot,
      outputRoot: fixture.reviewRoot,
      seed: fixture.reviewSeed,
      reviewers: ['reviewer-one', 'reviewer-two'],
    });
    assert.equal(result.assignmentCount, 2);
    assert.equal(result.preferenceUnitCount, 1);
    const blindedText = await readTextTree(join(fixture.reviewRoot, 'blinded'));
    for (const forbidden of [
      'Decantr',
      'openai-gpt-5.6-sol',
      'gpt-5.6-sol',
      'run-control-1',
      'run-treatment-1',
      'preference-unit-',
    ]) {
      assert.equal(blindedText.toLowerCase().includes(forbidden.toLowerCase()), false, forbidden);
    }
    assert.equal(blindedText.includes('.decantr'), false);

    const assignments = JSON.parse(await readFile(result.assignmentsPath, 'utf8'));
    assert.equal(assignments.assignments.length, 2);
    assert.equal(new Set(assignments.assignments.map((item) => item.preferenceUnitId)).size, 1);
    assert.deepEqual(
      assignments.assignments.map((item) => item.candidates[0].repetition).sort(),
      [1, 2],
    );
    const templatePath = join(fixture.reviewRoot, 'blinded', 'review-workbook.template.json');
    const workbook = JSON.parse(await readFile(templatePath, 'utf8'));
    const assignmentId = assignments.assignments[0].assignmentId;
    const secondAssignmentId = assignments.assignments[1].assignmentId;
    workbook.reviews = [
      review(assignmentId, 'reviewer-one', 'A'),
      review(assignmentId, 'reviewer-two', 'B'),
      review(secondAssignmentId, 'reviewer-one', 'B'),
      review(secondAssignmentId, 'reviewer-two', 'B'),
    ];
    const submittedPath = join(root, 'submitted.json');
    await writeCanonicalFile(submittedPath, workbook);
    await assert.rejects(
      sealReview({
        assignmentsPath: result.assignmentsPath,
        workbookPath: submittedPath,
        outputPath: join(root, 'sealed.json'),
      }),
      /requires adjudication/u,
    );
    workbook.adjudications = [
      {
        assignmentId,
        adjudicatorId: 'adjudicator-one',
        preference: 'B',
        reason: 'Candidate B better satisfies the frozen behavior.',
        completedAt: '2026-07-22T15:00:00.000Z',
      },
    ];
    await writeCanonicalFile(submittedPath, workbook);
    const sealed = await sealReview({
      assignmentsPath: result.assignmentsPath,
      workbookPath: submittedPath,
      outputPath: join(root, 'sealed.json'),
    });
    assert.match(sealed.sha256, /^[a-f0-9]{64}$/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

async function createFixture(root) {
  const taskRoot = join(root, 'hidden-tasks');
  const recordRoot = join(root, 'records');
  const reviewRoot = join(root, 'review');
  await mkdir(taskRoot);
  const entitlement = {
    policy: 'Use the approved local component.',
    taskInput: {
      target: { selector: 'file:src/view.tsx' },
      policyCard: {
        statements: [
          {
            id: 'repository-authority',
            text: 'Preserve the repository-owned component and styling conventions.',
            sources: ['base-checkout'],
          },
        ],
      },
    },
  };
  const entitlementSha256 = sha256Canonical(entitlement);
  const evaluatorSha256 = sha256Canonical({ evaluator: 'hidden' });
  const benchmarkImageDigest = `sha256:${evaluatorSha256}`;
  const task = {
    schemaVersion: 'decantr-benchmark-task.v2',
    taskId: 'qualification-fixture',
    partition: 'qualification',
    kind: 'repository',
    repositoryId: 'fixture-repository',
    framework: 'react',
    projectPath: '.',
    corpusProjectPath: '.',
    corpusCommit: 'c'.repeat(40),
    candidateSha256: evaluatorSha256,
    base: { commit: 'a'.repeat(40), tree: 'b'.repeat(40) },
    prompt: 'Implement the frozen user-interface change while preserving existing behavior.',
    informationEntitlement: entitlement,
    informationEntitlementSha256: entitlementSha256,
    armInputs: {
      control: { context: 'Use the repository policy card.', entitlementSha256 },
      treatment: { context: 'Use the Decantr task context.', entitlementSha256 },
    },
    scope: { allowedPaths: ['src/**'], forbiddenPaths: ['package.json'] },
    environment: {
      specSha256: evaluatorSha256,
      substanceSha256: evaluatorSha256,
      runtimeProfileId: 'node-22.19.0-pnpm-10.33.0',
      runtimeMatrixFileSha256: evaluatorSha256,
      runtimeMatrixSha256: evaluatorSha256,
      benchmarkImageDigest,
    },
    evaluator: {
      contractId: 'hidden-evaluator',
      contractSha256: evaluatorSha256,
      specSha256: evaluatorSha256,
      oracleSourceSha256: evaluatorSha256,
      qualificationControllerSha256: evaluatorSha256,
      qualificationReceiptFileSha256: evaluatorSha256,
      qualificationReceiptSha256: evaluatorSha256,
      qualificationExecutionAttestationFileSha256: evaluatorSha256,
      qualificationExecutionAttestationSha256: evaluatorSha256,
      qualificationExecutionControllerSha256: evaluatorSha256,
      qualificationEvaluatorSourceClosureSha256: evaluatorSha256,
      qualificationInputRequestFileSha256: evaluatorSha256,
      qualificationInputRequestSha256: evaluatorSha256,
      qualificationInputManifestFileSha256: evaluatorSha256,
      qualificationInputManifestSha256: evaluatorSha256,
      qualificationRunnerRepositoryCommit: 'd'.repeat(40),
      qualificationProvenanceBundleFileSha256: evaluatorSha256,
      qualificationProvenanceVerificationSha256: evaluatorSha256,
    },
    limits: { timeoutMs: 10_000, maxRequests: 2, maxInputTokens: 1000, maxOutputTokens: 1000 },
  };
  const taskPath = join(taskRoot, 'qualification-fixture.json');
  await writeFile(taskPath, prettyCanonicalJson(task));
  const taskSha256 = sha256(await readFile(taskPath));
  const taskBinding = {
    taskId: task.taskId,
    partition: task.partition,
    kind: task.kind,
    repositoryId: task.repositoryId,
    framework: task.framework,
    projectPath: task.projectPath,
    corpusProjectPath: task.corpusProjectPath,
    corpusCommit: task.corpusCommit,
    base: task.base,
    manifestSha256: taskSha256,
    candidateSha256: evaluatorSha256,
    evaluatorContractSha256: evaluatorSha256,
    evaluatorSpecSha256: evaluatorSha256,
    oracleSourceSha256: evaluatorSha256,
    qualificationControllerSha256: evaluatorSha256,
    qualificationReceiptFileSha256: evaluatorSha256,
    qualificationReceiptSha256: evaluatorSha256,
    qualificationExecutionAttestationFileSha256: evaluatorSha256,
    qualificationExecutionAttestationSha256: evaluatorSha256,
    qualificationExecutionControllerSha256: evaluatorSha256,
    qualificationEvaluatorSourceClosureSha256: evaluatorSha256,
    qualificationInputRequestFileSha256: evaluatorSha256,
    qualificationInputRequestSha256: evaluatorSha256,
    qualificationInputManifestFileSha256: evaluatorSha256,
    qualificationInputManifestSha256: evaluatorSha256,
    qualificationRunnerRepositoryCommit: 'd'.repeat(40),
    qualificationProvenanceBundleFileSha256: evaluatorSha256,
    qualificationProvenanceVerificationSha256: evaluatorSha256,
    informationEntitlementSha256: entitlementSha256,
    environmentSpecSha256: evaluatorSha256,
    environmentSubstanceSha256: evaluatorSha256,
    runtimeProfileId: 'node-22.19.0-pnpm-10.33.0',
    runtimeMatrixFileSha256: evaluatorSha256,
    runtimeMatrixSha256: evaluatorSha256,
    benchmarkImageDigest,
    sourceRef: 'qualification-fixture.json',
  };
  const runs = [];
  for (let repetition = 1; repetition <= 2; repetition += 1) {
    for (const arm of ['control', 'treatment']) {
      runs.push({
        runId: `run-${arm}-${repetition}`,
        ordinal: runs.length + 1,
        block: 1,
        taskId: task.taskId,
        partition: task.partition,
        repositoryId: task.repositoryId,
        framework: task.framework,
        modelId: 'openai-gpt-5.6-sol',
        provider: 'openai',
        requestedModel: 'gpt-5.6-sol',
        arm,
        repetition,
        taskManifestSha256: taskSha256,
      });
    }
  }
  const binding = { logicalName: 'fixture', sha256: sha256Canonical({ fixture: true }), bytes: 1 };
  const plan = {
    schemaVersion: 'decantr-benchmark-run-plan.v2',
    program: 'decantr-3.10-ui-change-control-proof',
    seed: 'review-plan-seed-0001',
    bindings: {
      corpus: binding,
      models: binding,
      protocol: binding,
      runtimeMatrix: binding,
      qualificationTaskIndex: binding,
      developmentTasks: [binding],
    },
    design: { tasks: 1, models: 1, arms: 2, repetitions: 2, totalRuns: 4 },
    tasks: [taskBinding],
    runs,
  };
  plan.planSha256 = calculateRunPlanDigest(plan);
  const planPath = join(root, 'plan.json');
  await writeFile(planPath, prettyCanonicalJson(plan));

  for (const run of runs) {
    const diff =
      run.arm === 'treatment'
        ? [
            'diff --git a/.decantr/context.json b/.decantr/context.json',
            'new file mode 100644',
            '+Decantr treatment metadata',
            'diff --git a/src/view.tsx b/src/view.tsx',
            '@@ -1 +1 @@',
            '-old',
            '+new Decantr-aware view',
          ].join('\n')
        : 'diff --git a/src/view.tsx b/src/view.tsx\n@@ -1 +1 @@\n-old\n+new view\n';
    const change = await writeContentAddressed(recordRoot, 'workspace-changes', {
      schemaVersion: 'decantr-benchmark-workspace-change.v1',
      diff,
      changedPaths: run.arm === 'treatment' ? ['.decantr/context.json', 'src/view.tsx'] : ['src/view.tsx'],
      untracked: [],
    });
    const record = {
      runId: run.runId,
      status: 'completed',
      model: {
        modelId: run.modelId,
        provider: run.provider,
        requestedModel: run.requestedModel,
        returnedModel: run.requestedModel,
      },
      workspace: { diffSha256: change.digest },
    };
    const recordArtifact = await writeContentAddressed(recordRoot, 'run-records', record);
    await writeCanonicalFile(join(recordRoot, 'run-index', `${run.runId}.json`), {
      runId: run.runId,
      recordSha256: recordArtifact.digest,
    });
  }
  return { taskRoot, recordRoot, reviewRoot, planPath, reviewSeed: expectedReviewSeed(plan.seed) };
}

function review(assignmentId, reviewerId, preference) {
  return {
    assignmentId,
    reviewerId,
    scores: { A: preference === 'A' ? 90 : 70, B: preference === 'B' ? 90 : 70 },
    preference,
    completedAt: '2026-07-22T14:00:00.000Z',
  };
}

async function readTextTree(root) {
  const values = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) values.push(await readTextTree(path));
    else if (entry.isFile() && entry.name.endsWith('.json')) values.push(await readFile(path, 'utf8'));
  }
  return values.join('\n');
}
