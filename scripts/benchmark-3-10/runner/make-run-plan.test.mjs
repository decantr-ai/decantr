import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { prettyCanonicalJson, readJsonFile, sha256, sha256Canonical } from './canonical.mjs';
import { buildRunPlan } from './make-run-plan.mjs';
import { makeFixtureLockedRuntimeMatrix } from '../environments/runtime-matrix.test-helper.mjs';

const benchmarkDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const corpusPath = join(benchmarkDirectory, 'corpus.json');
const modelsPath = join(benchmarkDirectory, 'models.json');
const protocolPath = join(benchmarkDirectory, 'protocol.json');

test('make-run-plan creates a deterministic blocked 320-run plan and binds every input', async () => {
  const fixture = await createTaskFixture();
  try {
    const options = {
      ...fixture,
      corpusPath,
      modelsPath,
      protocolPath,
      seed: (await readJsonFile(protocolPath)).design.randomizationSeed,
    };
    const first = await buildRunPlan(options);
    const second = await buildRunPlan(options);
    assert.deepEqual(first, second);
    assert.equal(first.tasks.length, 40);
    assert.equal(first.runs.length, 320);
    assert.equal(first.bindings.developmentTasks.length, 24);
    assert.match(first.bindings.runtimeMatrix.sha256, /^[a-f0-9]{64}$/u);
    assert.equal(first.schemaVersion, 'decantr-benchmark-run-plan.v2');
    assert.equal(first.tasks[0].runtimeMatrixFileSha256, first.bindings.runtimeMatrix.sha256);
    assert.equal(first.tasks[0].runtimeMatrixSha256, fixture.runtimeBinding.runtimeMatrixSha256);
    assert.equal(first.tasks[0].benchmarkImageDigest, fixture.runtimeBinding.benchmarkImageDigest);
    assert.match(first.tasks[0].qualificationReceiptSha256, /^[a-f0-9]{64}$/u);
    assert.match(first.tasks[0].qualificationControllerSha256, /^[a-f0-9]{64}$/u);
    assert.match(first.tasks[0].qualificationExecutionAttestationFileSha256, /^[a-f0-9]{64}$/u);
    assert.match(first.tasks[0].qualificationExecutionAttestationSha256, /^[a-f0-9]{64}$/u);
    assert.match(first.tasks[0].qualificationExecutionControllerSha256, /^[a-f0-9]{64}$/u);
    assert.match(first.tasks[0].qualificationEvaluatorSourceClosureSha256, /^[a-f0-9]{64}$/u);
    assert.match(first.tasks[0].qualificationRunnerRepositoryCommit, /^[a-f0-9]{40}$/u);
    assert.match(first.tasks[0].qualificationProvenanceBundleFileSha256, /^[a-f0-9]{64}$/u);
    assert.match(first.tasks[0].qualificationProvenanceVerificationSha256, /^[a-f0-9]{64}$/u);
    assert.equal(new Set(first.runs.map((run) => run.runId)).size, 320);
    assert.equal(first.runs.filter((run) => run.partition === 'qualification').length, 128);
    assert.equal(
      first.tasks.find((task) => task.taskId === 'repository-angular-realworld').partition,
      'qualification',
    );
    assert.equal(
      first.tasks.filter((task) => task.kind === 'adversarial' && task.partition === 'development').length,
      7,
    );
    assert.equal(
      first.tasks.filter((task) => task.kind === 'adversarial' && task.partition === 'qualification').length,
      5,
    );

    for (let offset = 0; offset < first.runs.length; offset += 8) {
      const block = first.runs.slice(offset, offset + 8);
      assert.equal(new Set(block.map((run) => run.taskId)).size, 1);
      assert.equal(new Set(block.map((run) => `${run.modelId}:${run.arm}:${run.repetition}`)).size, 8);
    }

    await assert.rejects(
      buildRunPlan({ ...options, seed: 'not-the-committed-randomization-seed' }),
      /does not match protocol\.design\.randomizationSeed/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('make-run-plan rejects a task whose qualified runtime binding differs from the locked matrix', async () => {
  const fixture = await createTaskFixture();
  try {
    const taskPath = join(fixture.tasksDirectory, 'adversarial-01.json');
    const task = await readJsonFile(taskPath);
    task.environment.runtimeMatrixSha256 = sha256Canonical({ substituted: 'runtime-matrix' });
    await writeFile(taskPath, prettyCanonicalJson(task));

    await assert.rejects(
      buildRunPlan({
        ...fixture,
        corpusPath,
        modelsPath,
        protocolPath,
        seed: (await readJsonFile(protocolPath)).design.randomizationSeed,
      }),
      /runtime matrix binding differs from locked matrix identity/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('make-run-plan rejects a missing task instead of repairing arithmetic', async () => {
  const fixture = await createTaskFixture();
  try {
    await unlink(join(fixture.tasksDirectory, 'adversarial-06.json'));
    await assert.rejects(
      buildRunPlan({
        ...fixture,
        corpusPath,
        modelsPath,
        protocolPath,
        seed: (await readJsonFile(protocolPath)).design.randomizationSeed,
      }),
      /expected 40, found 39/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('make-run-plan derives partition counts and enforces the frozen 24/16 split', async () => {
  const fixture = await createTaskFixture();
  try {
    const qualification = await readJsonFile(fixture.qualificationIndexPath);
    qualification.tasks.pop();
    qualification.bundleSha256 = sha256Canonical(qualification.tasks);
    await writeFile(fixture.qualificationIndexPath, prettyCanonicalJson(qualification));

    const corpus = await readJsonFile(corpusPath);
    const repository = corpus.repositories.find((item) => item.partition === 'development');
    const task = makeTask({
      taskId: 'adversarial-08',
      kind: 'adversarial',
      repository,
      evaluatorDigest: sha256Canonical({ evaluator: 'fixture' }),
      runtimeBinding: fixture.runtimeBinding,
    });
    await writeFile(join(fixture.tasksDirectory, `${task.taskId}.json`), prettyCanonicalJson(task));

    await assert.rejects(
      buildRunPlan({
        ...fixture,
        corpusPath,
        modelsPath,
        protocolPath,
        seed: (await readJsonFile(protocolPath)).design.randomizationSeed,
      }),
      /must contain 24 development and 16 qualification tasks; found 25\/15/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('make-run-plan preserves a historical base project path after the app moves at the corpus pin', async () => {
  const fixture = await createTaskFixture();
  try {
    const taskPath = join(fixture.tasksDirectory, 'repository-bulletproof-react-vite.json');
    const task = await readJsonFile(taskPath);
    const pinnedProjectPath = task.corpusProjectPath;
    task.projectPath = 'historical/apps/web';
    await writeFile(taskPath, prettyCanonicalJson(task));

    const plan = await buildRunPlan({
      ...fixture,
      corpusPath,
      modelsPath,
      protocolPath,
      seed: (await readJsonFile(protocolPath)).design.randomizationSeed,
    });
    const planned = plan.tasks.find((entry) => entry.taskId === task.taskId);
    assert.equal(planned.projectPath, 'historical/apps/web');
    assert.equal(planned.corpusProjectPath, pinnedProjectPath);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('make-run-plan rejects a qualification index larger than the frozen protocol count', async () => {
  const fixture = await createTaskFixture();
  try {
    const qualification = await readJsonFile(fixture.qualificationIndexPath);
    const corpus = await readJsonFile(corpusPath);
    const repository = corpus.repositories[0];
    const taskId = 'qualification-adversarial-06';
    const entitlementDigest = sha256Canonical({ policy: taskId });
    qualification.tasks.push({
      taskId,
      kind: 'adversarial',
      repositoryId: repository.id,
      framework: repository.framework,
      projectPath: repository.projectPath,
      corpusProjectPath: repository.projectPath,
      corpusCommit: repository.commit,
      base: { commit: repository.commit, tree: repository.commit },
      manifestSha256: sha256Canonical({ hiddenTask: taskId }),
      evaluatorContractSha256: sha256Canonical({ evaluator: 'fixture' }),
      ...evaluatorBinding(taskId),
      informationEntitlementSha256: entitlementDigest,
      ...environmentBinding(taskId, fixture.runtimeBinding),
      hiddenRef: `${taskId}.json`,
    });
    qualification.bundleSha256 = sha256Canonical(qualification.tasks);
    await writeFile(fixture.qualificationIndexPath, prettyCanonicalJson(qualification));
    await unlink(join(fixture.tasksDirectory, 'adversarial-07.json'));

    await assert.rejects(
      buildRunPlan({
        ...fixture,
        corpusPath,
        modelsPath,
        protocolPath,
        seed: (await readJsonFile(protocolPath)).design.randomizationSeed,
      }),
      /must contain 24 development and 16 qualification tasks; found 23\/17/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('make-run-plan requires exactly one repository task for every frozen corpus repository', async () => {
  const fixture = await createTaskFixture();
  try {
    const qualification = await readJsonFile(fixture.qualificationIndexPath);
    const repositoryTasks = qualification.tasks.filter((task) => task.kind === 'repository');
    const missing = repositoryTasks[0];
    const duplicate = repositoryTasks[1];
    missing.repositoryId = duplicate.repositoryId;
    missing.framework = duplicate.framework;
    missing.projectPath = duplicate.projectPath;
    missing.corpusProjectPath = duplicate.corpusProjectPath;
    missing.corpusCommit = duplicate.corpusCommit;
    missing.base = structuredClone(duplicate.base);
    qualification.bundleSha256 = sha256Canonical(qualification.tasks);
    await writeFile(fixture.qualificationIndexPath, prettyCanonicalJson(qualification));

    await assert.rejects(
      buildRunPlan({
        ...fixture,
        corpusPath,
        modelsPath,
        protocolPath,
        seed: (await readJsonFile(protocolPath)).design.randomizationSeed,
      }),
      new RegExp(`repository task coverage must be exactly one for ${missing.taskId.replace('repository-', '')}`, 'u'),
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

async function createTaskFixture() {
  const root = await mkdtemp(join(tmpdir(), 'decantr-plan-test-'));
  const tasksDirectory = join(root, 'development');
  const qualificationIndexPath = join(root, 'qualification-index.json');
  const runtimeMatrixPath = join(root, 'runtime-matrix.json');
  await mkdir(tasksDirectory, { recursive: true });
  const corpus = await readJsonFile(corpusPath);
  const developmentRepositories = corpus.repositories.filter((item) => item.partition === 'development');
  const qualificationRepositories = corpus.repositories.filter((item) => item.partition === 'qualification');
  const promotedRepository = developmentRepositories[0];
  const publicRepositoryTasks = developmentRepositories.filter(
    (repository) => repository.id !== promotedRepository.id,
  );
  const sealedRepositoryTasks = [...qualificationRepositories, promotedRepository];
  const evaluatorDigest = sha256Canonical({ evaluator: 'fixture' });
  const runtimeMatrix = makeRuntimeMatrix();
  await writeFile(runtimeMatrixPath, prettyCanonicalJson(runtimeMatrix));
  const runtimeBinding = {
    runtimeMatrixFileSha256: sha256(await readFile(runtimeMatrixPath)),
    runtimeMatrixSha256: runtimeMatrix.matrixSha256,
    benchmarkImageDigest: runtimeMatrix.profiles[0].benchmarkImage.digest,
  };

  for (const repository of publicRepositoryTasks) {
    const task = makeTask({
      taskId: `repository-${repository.id}`,
      kind: 'repository',
      repository,
      evaluatorDigest,
      runtimeBinding,
    });
    await writeFile(join(tasksDirectory, `${task.taskId}.json`), prettyCanonicalJson(task));
  }
  for (let index = 0; index < 7; index += 1) {
    const repository = developmentRepositories[index % developmentRepositories.length];
    const task = makeTask({
      taskId: `adversarial-${String(index + 1).padStart(2, '0')}`,
      kind: 'adversarial',
      repository,
      evaluatorDigest,
      runtimeBinding,
    });
    await writeFile(join(tasksDirectory, `${task.taskId}.json`), prettyCanonicalJson(task));
  }

  const qualificationIndex = {
    schemaVersion: 'decantr-benchmark-qualification-task-index.v2',
    program: 'decantr-3.10-ui-change-control-proof',
    sealedAt: '2026-07-22T12:00:00.000Z',
    bundleSha256: '',
    tasks: sealedRepositoryTasks.map((repository) => {
      const taskId = `repository-${repository.id}`;
      const entitlementDigest = sha256Canonical({ policy: taskId });
      return {
        taskId,
        kind: 'repository',
        repositoryId: repository.id,
        framework: repository.framework,
        projectPath: repository.projectPath,
        corpusProjectPath: repository.projectPath,
        corpusCommit: repository.commit,
        base: { commit: repository.commit, tree: repository.commit },
        manifestSha256: sha256Canonical({ hiddenTask: taskId }),
        evaluatorContractSha256: evaluatorDigest,
        ...evaluatorBinding(taskId),
        informationEntitlementSha256: entitlementDigest,
        ...environmentBinding(taskId, runtimeBinding),
        hiddenRef: `${taskId}.json`,
      };
    }),
  };
  for (let index = 0; index < 5; index += 1) {
    const repository = corpus.repositories[index];
    const taskId = `qualification-adversarial-${String(index + 1).padStart(2, '0')}`;
    const entitlementDigest = sha256Canonical({ policy: taskId });
    qualificationIndex.tasks.push({
      taskId,
      kind: 'adversarial',
      repositoryId: repository.id,
      framework: repository.framework,
      projectPath: repository.projectPath,
      corpusProjectPath: repository.projectPath,
      corpusCommit: repository.commit,
      base: { commit: repository.commit, tree: repository.commit },
      manifestSha256: sha256Canonical({ hiddenTask: taskId }),
      evaluatorContractSha256: evaluatorDigest,
      ...evaluatorBinding(taskId),
      informationEntitlementSha256: entitlementDigest,
      ...environmentBinding(taskId, runtimeBinding),
      hiddenRef: `${taskId}.json`,
    });
  }
  qualificationIndex.bundleSha256 = sha256Canonical(qualificationIndex.tasks);
  await writeFile(qualificationIndexPath, prettyCanonicalJson(qualificationIndex));
  return { root, tasksDirectory, qualificationIndexPath, runtimeMatrixPath, runtimeBinding };
}

function makeRuntimeMatrix() {
  return makeFixtureLockedRuntimeMatrix();
}

function makeTask({ taskId, kind, repository, evaluatorDigest, runtimeBinding }) {
  const informationEntitlement = {
    policy: taskId,
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
  const informationEntitlementSha256 = sha256Canonical(informationEntitlement);
  return {
    schemaVersion: 'decantr-benchmark-task.v2',
    taskId,
    partition: 'development',
    kind,
    repositoryId: repository.id,
    framework: repository.framework,
    projectPath: repository.projectPath,
    corpusProjectPath: repository.projectPath,
    corpusCommit: repository.commit,
    candidateSha256: evaluatorBinding(taskId).candidateSha256,
    base: { commit: repository.commit, tree: repository.commit },
    prompt: `Implement the frozen user-interface behavior for benchmark task ${taskId}.`,
    informationEntitlement,
    informationEntitlementSha256,
    armInputs: {
      control: { context: 'Use the repository policy card.', entitlementSha256: informationEntitlementSha256 },
      treatment: { context: 'Use the Decantr task context.', entitlementSha256: informationEntitlementSha256 },
    },
    scope: { allowedPaths: ['src/**'], forbiddenPaths: ['package.json'] },
    environment: {
      specSha256: environmentBinding(taskId, runtimeBinding).environmentSpecSha256,
      substanceSha256: environmentBinding(taskId, runtimeBinding).environmentSubstanceSha256,
      runtimeProfileId: environmentBinding(taskId, runtimeBinding).runtimeProfileId,
      runtimeMatrixFileSha256: runtimeBinding.runtimeMatrixFileSha256,
      runtimeMatrixSha256: runtimeBinding.runtimeMatrixSha256,
      benchmarkImageDigest: runtimeBinding.benchmarkImageDigest,
    },
    evaluator: {
      contractId: `evaluator-${taskId}`,
      contractSha256: evaluatorDigest,
      specSha256: evaluatorBinding(taskId).evaluatorSpecSha256,
      oracleSourceSha256: evaluatorBinding(taskId).oracleSourceSha256,
      qualificationControllerSha256: evaluatorBinding(taskId).qualificationControllerSha256,
      qualificationReceiptFileSha256: evaluatorBinding(taskId).qualificationReceiptFileSha256,
      qualificationReceiptSha256: evaluatorBinding(taskId).qualificationReceiptSha256,
      qualificationExecutionAttestationFileSha256:
        evaluatorBinding(taskId).qualificationExecutionAttestationFileSha256,
      qualificationExecutionAttestationSha256:
        evaluatorBinding(taskId).qualificationExecutionAttestationSha256,
      qualificationExecutionControllerSha256:
        evaluatorBinding(taskId).qualificationExecutionControllerSha256,
      qualificationEvaluatorSourceClosureSha256:
        evaluatorBinding(taskId).qualificationEvaluatorSourceClosureSha256,
      qualificationInputRequestFileSha256:
        evaluatorBinding(taskId).qualificationInputRequestFileSha256,
      qualificationInputRequestSha256:
        evaluatorBinding(taskId).qualificationInputRequestSha256,
      qualificationInputManifestFileSha256:
        evaluatorBinding(taskId).qualificationInputManifestFileSha256,
      qualificationInputManifestSha256:
        evaluatorBinding(taskId).qualificationInputManifestSha256,
      qualificationRunnerRepositoryCommit:
        evaluatorBinding(taskId).qualificationRunnerRepositoryCommit,
      qualificationProvenanceBundleFileSha256:
        evaluatorBinding(taskId).qualificationProvenanceBundleFileSha256,
      qualificationProvenanceVerificationSha256:
        evaluatorBinding(taskId).qualificationProvenanceVerificationSha256,
    },
    limits: { timeoutMs: 60_000, maxRequests: 4, maxInputTokens: 50_000, maxOutputTokens: 10_000 },
  };
}

function environmentBinding(taskId, runtimeBinding) {
  return {
    environmentSpecSha256: sha256Canonical({ taskId, environment: 'spec' }),
    environmentSubstanceSha256: sha256Canonical({ taskId, environment: 'substance' }),
    runtimeProfileId: 'node-22.19.0-pnpm-10.33.0',
    ...runtimeBinding,
  };
}

function evaluatorBinding(taskId) {
  return {
    candidateSha256: sha256Canonical({ taskId, candidate: 'expected' }),
    evaluatorSpecSha256: sha256Canonical({ taskId, evaluator: 'spec' }),
    oracleSourceSha256: sha256Canonical({ taskId, evaluator: 'oracle-source' }),
    qualificationControllerSha256: sha256Canonical({ taskId, qualification: 'controller-source-closure' }),
    qualificationReceiptFileSha256: sha256Canonical({ taskId, qualification: 'receipt-file' }),
    qualificationReceiptSha256: sha256Canonical({ taskId, qualification: 'receipt' }),
    qualificationExecutionAttestationFileSha256: sha256Canonical({
      taskId,
      qualification: 'execution-attestation-file',
    }),
    qualificationExecutionAttestationSha256: sha256Canonical({
      taskId,
      qualification: 'execution-attestation',
    }),
    qualificationExecutionControllerSha256: sha256Canonical({
      taskId,
      qualification: 'execution-controller',
    }),
    qualificationEvaluatorSourceClosureSha256: sha256Canonical({
      taskId,
      qualification: 'evaluator-source-closure',
    }),
    qualificationInputRequestFileSha256: sha256Canonical({
      taskId,
      qualification: 'input-request-file',
    }),
    qualificationInputRequestSha256: sha256Canonical({
      taskId,
      qualification: 'input-request',
    }),
    qualificationInputManifestFileSha256: sha256Canonical({
      taskId,
      qualification: 'input-manifest-file',
    }),
    qualificationInputManifestSha256: sha256Canonical({
      taskId,
      qualification: 'input-manifest',
    }),
    qualificationRunnerRepositoryCommit: sha256Canonical({
      taskId,
      qualification: 'runner-repository-commit',
    }).slice(0, 40),
    qualificationProvenanceBundleFileSha256: sha256Canonical({
      taskId,
      qualification: 'provenance-bundle-file',
    }),
    qualificationProvenanceVerificationSha256: sha256Canonical({
      taskId,
      qualification: 'provenance-verification',
    }),
  };
}
