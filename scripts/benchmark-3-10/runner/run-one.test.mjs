import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  prettyCanonicalJson,
  sha256,
  sha256Canonical,
} from './canonical.mjs';
import { calculateRunPlanDigest } from './contracts.mjs';
import { hashRuntimeTree } from './candidate-runtime.mjs';
import { runOne } from './run-one.mjs';
import { taskEnvironmentSubstanceSha256 } from '../environments/contracts.mjs';
import { makeFixtureLockedRuntimeMatrix } from '../environments/runtime-matrix.test-helper.mjs';
import {
  calculatePreparedAttestationDigest,
  calculatePreparedEnvironmentIdentity,
  hashDependencyRoots,
} from '../environments/prepared-environment.mjs';

const benchmarkDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const modelsPath = join(benchmarkDirectory, 'models.json');
const protocolPath = join(benchmarkDirectory, 'protocol.json');
const pricingPath = join(benchmarkDirectory, 'model-proxy', 'pricing.json');

test('run-one executes the deterministic fake adapter, verifies the evaluator, and writes content-addressed evidence', async () => {
  const fixture = await createRunFixture();
  try {
    const result = await runOne(fixture.options);
    assert.equal(result.record.status, 'completed');
    assert.equal(result.record.model.identityMatched, true);
    assert.equal(result.record.model.returnedModel, 'gpt-5.6-sol');
    assert.equal(result.record.budget.actualUsd, 0);
    assert.match(result.recordSha256, /^[a-f0-9]{64}$/u);
    assert.equal(JSON.parse(await readFile(result.recordPath, 'utf8')).runId, 'run-fixture-control');
    assert.match(result.record.trajectoryManifestSha256, /^[a-f0-9]{64}$/u);
    assert.match(result.record.evaluatorResultSha256, /^[a-f0-9]{64}$/u);
    assert.equal(result.record.schemaVersion, 'decantr-benchmark-run-record.v2');
    assert.equal(
      result.record.bindings.qualificationReceiptSha256,
      fixture.provenance.qualificationReceiptSha256,
    );
    assert.equal(
      result.record.bindings.qualificationControllerSha256,
      fixture.provenance.qualificationControllerSha256,
    );
    for (const key of [
      'qualificationExecutionAttestationFileSha256',
      'qualificationExecutionAttestationSha256',
      'qualificationExecutionControllerSha256',
      'qualificationEvaluatorSourceClosureSha256',
      'qualificationRunnerRepositoryCommit',
      'qualificationProvenanceBundleFileSha256',
      'qualificationProvenanceVerificationSha256',
    ]) {
      assert.equal(result.record.bindings[key], fixture.provenance[key]);
    }
    assert.equal(result.record.bindings.runtimeMatrixFileSha256, fixture.provenance.runtimeMatrixFileSha256);
    assert.equal(result.record.bindings.benchmarkImageDigest, fixture.provenance.benchmarkImageDigest);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('run-one rejects a substituted qualification receipt binding before execution', async () => {
  const fixture = await createRunFixture();
  try {
    const plan = JSON.parse(await readFile(fixture.options.planPath, 'utf8'));
    plan.tasks[0].qualificationReceiptSha256 = sha256Canonical({ substituted: 'qualification-receipt' });
    plan.planSha256 = calculateRunPlanDigest(plan);
    await writeFile(fixture.options.planPath, prettyCanonicalJson(plan));

    await assert.rejects(runOne(fixture.options), /task qualification receipt binding mismatch/u);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('run-one rejects a substituted qualification controller binding before execution', async () => {
  const fixture = await createRunFixture();
  try {
    const plan = JSON.parse(await readFile(fixture.options.planPath, 'utf8'));
    plan.tasks[0].qualificationControllerSha256 = sha256Canonical({ substituted: 'qualification-controller' });
    plan.planSha256 = calculateRunPlanDigest(plan);
    await writeFile(fixture.options.planPath, prettyCanonicalJson(plan));

    await assert.rejects(runOne(fixture.options), /task qualification controller binding mismatch/u);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('run-one materializes treatment context from the bound candidate runtime before adapter execution', async () => {
  const fixture = await createRunFixture({ arm: 'treatment' });
  try {
    const result = await runOne(fixture.options);
    assert.equal(result.record.status, 'completed');
    assert.match(result.record.bindings.deliverySha256, /^[a-f0-9]{64}$/u);
    const delivery = JSON.parse(
      await readFile(
        join(
          fixture.options.outputRoot,
          'arm-deliveries',
          'sha256',
          `${result.record.bindings.deliverySha256}.json`,
        ),
        'utf8',
      ),
    );
    assert.equal(delivery.arm, 'treatment');
    assert.equal(delivery.productContext.target, 'file:result.txt');
    assert.deepEqual(delivery.productContext.read, ['result.txt']);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('run-one refuses a paid request before invoking an adapter when approval is absent', async () => {
  const fixture = await createRunFixture();
  try {
    await assert.rejects(
      runOne({
        ...fixture.options,
        outputRoot: join(fixture.root, 'paid-output'),
        paid: true,
        adapterCommand: process.execPath,
        adapterArgs: [join(benchmarkDirectory, 'model-proxy', 'fake-adapter.mjs')],
      }),
      /requires --budget-approval/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('run-one refuses a task runtime that differs from the locked profile', async () => {
  const fixture = await createRunFixture();
  try {
    await assert.rejects(
      runOne({
        ...fixture.options,
        outputRoot: join(fixture.root, 'runtime-mismatch-output'),
        executionEnvironment: {
          ...fixture.options.executionEnvironment,
          DECANTR_TASK_RUNTIME_VERSION: '0.0.0',
        },
      }),
      /task runtime marker mismatch/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('run-one records provider model substitution as a failed, non-pooled run', async () => {
  const fixture = await createRunFixture();
  try {
    const adapterPath = join(fixture.root, 'substitute-adapter.mjs');
    await writeFile(
      adapterPath,
      [
        "import { readFileSync, writeFileSync } from 'node:fs';",
        "const requestPath = process.argv[process.argv.indexOf('--request') + 1];",
        "const responsePath = process.argv[process.argv.indexOf('--response') + 1];",
        'const request = JSON.parse(readFileSync(requestPath));',
        "writeFileSync(responsePath, JSON.stringify({schemaVersion:'decantr-benchmark-adapter-response.v1',provider:request.provider,requestedModel:request.requestedModel,returnedModel:'routed-substitute',status:'completed',usage:{inputTokens:1,outputTokens:1,cachedInputTokens:0,requests:1,costUsd:0},finalMessage:'',trajectory:[]}));",
      ].join('\n'),
    );
    const result = await runOne({
      ...fixture.options,
      outputRoot: join(fixture.root, 'substitution-output'),
      adapterCommand: process.execPath,
      adapterArgs: [adapterPath],
      allowExternalNoCostAdapter: true,
    });
    assert.equal(result.record.status, 'model_substitution');
    assert.equal(result.record.model.returnedModel, 'routed-substitute');
    assert.equal(result.record.model.identityMatched, false);
    assert.equal(result.record.evaluatorResultSha256, null);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('run-one records changed paths outside the frozen task scope as visible failures', async () => {
  const fixture = await createRunFixture();
  try {
    const adapterPath = join(fixture.root, 'scope-violating-adapter.mjs');
    await writeFile(
      adapterPath,
      [
        "import { readFileSync, writeFileSync } from 'node:fs';",
        "import { join } from 'node:path';",
        "const requestPath = process.argv[process.argv.indexOf('--request') + 1];",
        "const responsePath = process.argv[process.argv.indexOf('--response') + 1];",
        'const request = JSON.parse(readFileSync(requestPath));',
        "writeFileSync(join(request.workspace, 'package.json'), '{}\\n');",
        "writeFileSync(responsePath, JSON.stringify({schemaVersion:'decantr-benchmark-adapter-response.v1',provider:request.provider,requestedModel:request.requestedModel,returnedModel:request.requestedModel,status:'completed',usage:{inputTokens:1,outputTokens:1,cachedInputTokens:0,requests:1,costUsd:0},finalMessage:'',trajectory:[]}));",
      ].join('\n'),
    );
    const result = await runOne({
      ...fixture.options,
      outputRoot: join(fixture.root, 'scope-output'),
      adapterCommand: process.execPath,
      adapterArgs: [adapterPath],
      allowExternalNoCostAdapter: true,
    });
    assert.equal(result.record.status, 'evaluation_failed');
    assert.equal(result.record.failure.stage, 'workspace');
    assert.equal(result.record.failure.code, 'SCOPE_VIOLATION');
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('run-one records ignored dependency mutation as prepared-environment drift', async () => {
  const fixture = await createRunFixture();
  try {
    const adapterPath = join(fixture.root, 'dependency-drift-adapter.mjs');
    await writeFile(
      adapterPath,
      [
        "import { readFileSync, writeFileSync } from 'node:fs';",
        "import { join } from 'node:path';",
        "const requestPath = process.argv[process.argv.indexOf('--request') + 1];",
        "const responsePath = process.argv[process.argv.indexOf('--response') + 1];",
        'const request = JSON.parse(readFileSync(requestPath));',
        "writeFileSync(join(request.workspace, 'node_modules', 'fixture-package', 'index.js'), 'mutated\\n');",
        "writeFileSync(responsePath, JSON.stringify({schemaVersion:'decantr-benchmark-adapter-response.v1',provider:request.provider,requestedModel:request.requestedModel,returnedModel:request.requestedModel,status:'completed',usage:{inputTokens:1,outputTokens:1,cachedInputTokens:0,requests:1,costUsd:0},finalMessage:'',trajectory:[]}));",
      ].join('\n'),
    );
    const result = await runOne({
      ...fixture.options,
      outputRoot: join(fixture.root, 'dependency-drift-output'),
      adapterCommand: process.execPath,
      adapterArgs: [adapterPath],
      allowExternalNoCostAdapter: true,
    });
    assert.equal(result.record.status, 'evaluation_failed');
    assert.equal(result.record.failure.code, 'PREPARED_ENVIRONMENT_DRIFT');
    assert.equal(result.record.workspace.dependencyTreeAfterVerified, false);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

async function createRunFixture({ arm = 'control' } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'decantr-run-one-test-'));
  const workspace = join(root, 'workspace');
  const evaluatorRoot = join(root, 'hidden-evaluator');
  const outputRoot = join(root, 'output');
  await mkdir(workspace);
  await mkdir(evaluatorRoot);
  await writeFile(join(workspace, 'result.txt'), 'correct\n');
  await writeFile(join(workspace, 'package.json'), '{"name":"fixture","private":true}\n');
  await writeFile(join(workspace, 'package-lock.json'), '{"lockfileVersion":3}\n');
  await writeFile(join(workspace, '.gitignore'), 'node_modules/\n');
  await mkdir(join(workspace, 'node_modules', 'fixture-package'), { recursive: true });
  await writeFile(join(workspace, 'node_modules', 'fixture-package', 'index.js'), 'fixture\n');
  git(workspace, ['init', '--quiet']);
  git(workspace, ['config', 'user.email', 'benchmark@example.invalid']);
  git(workspace, ['config', 'user.name', 'Benchmark Fixture']);
  git(workspace, ['add', 'result.txt', 'package.json', 'package-lock.json', '.gitignore']);
  git(workspace, ['commit', '--quiet', '-m', 'fixture']);
  const commit = git(workspace, ['rev-parse', 'HEAD']).trim();
  const tree = git(workspace, ['rev-parse', 'HEAD^{tree}']).trim();
  const nodeVersion = execFileSync('node', ['--version'], { encoding: 'utf8' }).trim().replace(/^v/u, '');
  const npmVersion = execFileSync('npm', ['--version'], { encoding: 'utf8' }).trim();

  const evaluatorScript = join(evaluatorRoot, 'check.mjs');
  const evaluatorSource = [
    "import { readFileSync } from 'node:fs';",
    "const passed = readFileSync(process.argv[2], 'utf8').trim() === 'correct';",
    "console.log(JSON.stringify({passed,metrics:{governanceViolations:0,accessibilityViolations:0,visualScore:95}}));",
  ].join('\n');
  await writeFile(evaluatorScript, evaluatorSource);
  const evaluatorContract = {
    schemaVersion: 'decantr-benchmark-evaluator-contract.v2',
    contractId: 'evaluator-task-fixture',
    taskId: 'task-fixture',
    oracle: {
      candidateIndependent: true,
      decantrOutputAllowed: false,
      sourceSha256: sha256(evaluatorSource),
    },
    commands: [
      {
        id: 'functional-check',
        kind: 'functional',
        runtime: 'controller',
        executable: process.execPath,
        args: ['${EVALUATOR_ROOT}/check.mjs', '${WORKSPACE}/result.txt'],
        cwd: '${WORKSPACE}',
        timeoutMs: 10_000,
        required: true,
        resultFormat: 'json-stdout',
      },
    ],
  };
  const evaluatorContractPath = join(root, 'evaluator-contract.json');
  await writeFile(evaluatorContractPath, prettyCanonicalJson(evaluatorContract));
  const evaluatorContractSha256 = sha256(await readFile(evaluatorContractPath));
  const informationEntitlement = {
    policy: 'Use the existing component and keep the test green.',
    taskInput: fixtureTaskInput('result.txt'),
  };
  const informationEntitlementSha256 = sha256Canonical(informationEntitlement);
  const environmentSpec = {
    schemaVersion: 'decantr-benchmark-task-environment.v1',
    taskId: 'task-fixture',
    partition: 'development',
    base: { commit, tree },
    projectPath: '.',
    profile: {
      id: `node-${nodeVersion}-npm-${npmVersion}`,
      os: 'linux',
      arch: 'x64',
      nodeVersion,
      bunVersion: null,
      packageManager: { name: 'npm', version: npmVersion },
    },
    lockfiles: [{ path: 'package-lock.json', sha256: sha256(await readFile(join(workspace, 'package-lock.json'))) }],
    sourceEvidence: [
      { kind: 'package-manifest', path: 'package.json', sha256: sha256(await readFile(join(workspace, 'package.json'))), statement: 'Fixture manifest evidence.' },
      { kind: 'lockfile', path: 'package-lock.json', sha256: sha256(await readFile(join(workspace, 'package-lock.json'))), statement: 'Fixture lockfile evidence.' },
    ],
    preparation: [{
      id: 'install-dependencies',
      executable: 'npm',
      args: ['ci'],
      cwd: '.',
      timeoutMs: 10_000,
      network: 'dependency-registry',
      required: true,
    }],
    cleanAfterPreparation: true,
    review: {
      status: 'approved',
      reviewedBy: 'fixture-runtime-reviewer',
      reviewedAt: '2026-07-22T18:00:00.000Z',
      notes: 'Independently reviewed fixture runtime and preparation contract.',
    },
  };
  const environmentSpecPath = join(root, 'environment.json');
  await writeFile(environmentSpecPath, prettyCanonicalJson(environmentSpec));
  const environmentSpecSha256 = sha256(await readFile(environmentSpecPath));
  const environmentSubstanceSha256 = taskEnvironmentSubstanceSha256(environmentSpec);
  const runtimeMatrix = makeRuntimeMatrix(environmentSpec.profile);
  const runtimeMatrixPath = join(root, 'runtime-matrix.json');
  await writeFile(runtimeMatrixPath, prettyCanonicalJson(runtimeMatrix));
  const runtimeMatrixFileSha256 = sha256(await readFile(runtimeMatrixPath));
  const provenance = {
    candidateSha256: sha256Canonical({ candidate: 'expected-revision' }),
    evaluatorSpecSha256: sha256Canonical({ evaluator: 'authoring-spec' }),
    oracleSourceSha256: evaluatorContract.oracle.sourceSha256,
    qualificationControllerSha256: sha256Canonical({ qualification: 'controller-source-closure' }),
    qualificationReceiptFileSha256: sha256Canonical({ qualification: 'receipt-file' }),
    qualificationReceiptSha256: sha256Canonical({ qualification: 'receipt' }),
    qualificationExecutionAttestationFileSha256: sha256Canonical({
      qualification: 'execution-attestation-file',
    }),
    qualificationExecutionAttestationSha256: sha256Canonical({ qualification: 'execution-attestation' }),
    qualificationExecutionControllerSha256: sha256Canonical({ qualification: 'execution-controller' }),
    qualificationEvaluatorSourceClosureSha256: sha256Canonical({
      qualification: 'evaluator-source-closure',
    }),
    qualificationInputRequestFileSha256: sha256Canonical({ qualification: 'input-request-file' }),
    qualificationInputRequestSha256: sha256Canonical({ qualification: 'input-request' }),
    qualificationInputManifestFileSha256: sha256Canonical({ qualification: 'input-manifest-file' }),
    qualificationInputManifestSha256: sha256Canonical({ qualification: 'input-manifest' }),
    qualificationRunnerRepositoryCommit: sha256Canonical({
      qualification: 'runner-repository-commit',
    }).slice(0, 40),
    qualificationProvenanceBundleFileSha256: sha256Canonical({
      qualification: 'provenance-bundle-file',
    }),
    qualificationProvenanceVerificationSha256: sha256Canonical({
      qualification: 'provenance-verification',
    }),
    runtimeMatrixFileSha256,
    runtimeMatrixSha256: runtimeMatrix.matrixSha256,
    benchmarkImageDigest: runtimeMatrix.profiles[0].benchmarkImage.digest,
  };
  const task = {
    schemaVersion: 'decantr-benchmark-task.v2',
    taskId: 'task-fixture',
    partition: 'development',
    kind: 'adversarial',
    repositoryId: 'fixture-repository',
    framework: 'react',
    projectPath: '.',
    corpusProjectPath: '.',
    corpusCommit: commit,
    candidateSha256: provenance.candidateSha256,
    base: { commit, tree },
    prompt: 'Keep the frozen fixture behavior correct without changing unrelated files.',
    informationEntitlement,
    informationEntitlementSha256,
    armInputs: {
      control: { context: 'Use the repository policy card.', entitlementSha256: informationEntitlementSha256 },
      treatment: { context: 'Use the Decantr task context.', entitlementSha256: informationEntitlementSha256 },
    },
    scope: { allowedPaths: ['result.txt'], forbiddenPaths: ['package.json'] },
    environment: {
      specSha256: environmentSpecSha256,
      substanceSha256: environmentSubstanceSha256,
      runtimeProfileId: environmentSpec.profile.id,
      runtimeMatrixFileSha256: provenance.runtimeMatrixFileSha256,
      runtimeMatrixSha256: provenance.runtimeMatrixSha256,
      benchmarkImageDigest: provenance.benchmarkImageDigest,
    },
    evaluator: {
      contractId: evaluatorContract.contractId,
      contractSha256: evaluatorContractSha256,
      specSha256: provenance.evaluatorSpecSha256,
      oracleSourceSha256: provenance.oracleSourceSha256,
      qualificationControllerSha256: provenance.qualificationControllerSha256,
      qualificationReceiptFileSha256: provenance.qualificationReceiptFileSha256,
      qualificationReceiptSha256: provenance.qualificationReceiptSha256,
      qualificationExecutionAttestationFileSha256:
        provenance.qualificationExecutionAttestationFileSha256,
      qualificationExecutionAttestationSha256: provenance.qualificationExecutionAttestationSha256,
      qualificationExecutionControllerSha256: provenance.qualificationExecutionControllerSha256,
      qualificationEvaluatorSourceClosureSha256:
        provenance.qualificationEvaluatorSourceClosureSha256,
      qualificationInputRequestFileSha256: provenance.qualificationInputRequestFileSha256,
      qualificationInputRequestSha256: provenance.qualificationInputRequestSha256,
      qualificationInputManifestFileSha256: provenance.qualificationInputManifestFileSha256,
      qualificationInputManifestSha256: provenance.qualificationInputManifestSha256,
      qualificationRunnerRepositoryCommit: provenance.qualificationRunnerRepositoryCommit,
      qualificationProvenanceBundleFileSha256:
        provenance.qualificationProvenanceBundleFileSha256,
      qualificationProvenanceVerificationSha256:
        provenance.qualificationProvenanceVerificationSha256,
    },
    limits: { timeoutMs: 30_000, maxRequests: 4, maxInputTokens: 10_000, maxOutputTokens: 5_000 },
  };
  const taskManifestPath = join(root, 'task.json');
  await writeFile(taskManifestPath, prettyCanonicalJson(task));
  const taskManifestSha256 = sha256(await readFile(taskManifestPath));
  const dependencyTree = await hashDependencyRoots(workspace, ['node_modules']);
  const preparedEnvironment = {
    schemaVersion: 'decantr-benchmark-prepared-environment.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    taskId: task.taskId,
    environmentSpecSha256,
    environmentSubstanceSha256,
    runtimeMatrixSha256: runtimeMatrix.matrixSha256,
    runtimeProfileId: environmentSpec.profile.id,
    benchmarkImageDigest: runtimeMatrix.profiles[0].benchmarkImage.digest,
    base: structuredClone(task.base),
    revisionRole: 'base',
    revision: structuredClone(task.base),
    candidateSha256: null,
    lockfiles: structuredClone(environmentSpec.lockfiles),
    steps: environmentSpec.preparation.map((command) => ({
      id: command.id,
      network: command.network,
      commandSha256: sha256Canonical(command),
      exitCode: 0,
      durationMs: 1,
      stdoutSha256: sha256(''),
      stderrSha256: sha256(''),
    })),
    dependencyRoots: ['node_modules'],
    dependencyTreeSha256: dependencyTree.sha256,
    dependencyEntryCount: dependencyTree.entryCount,
    trackedClean: true,
    preparedAt: '2026-07-22T18:30:00.000Z',
  };
  preparedEnvironment.environmentSha256 = calculatePreparedEnvironmentIdentity(preparedEnvironment);
  preparedEnvironment.attestationSha256 = calculatePreparedAttestationDigest(preparedEnvironment);
  const preparedEnvironmentPath = join(root, 'prepared-environment.json');
  await writeFile(preparedEnvironmentPath, prettyCanonicalJson(preparedEnvironment));
  const run = {
    runId: `run-fixture-${arm}`,
    ordinal: 1,
    block: 1,
    taskId: task.taskId,
    partition: task.partition,
    repositoryId: task.repositoryId,
    framework: task.framework,
    modelId: 'openai-gpt-5.6-sol',
    provider: 'openai',
    requestedModel: 'gpt-5.6-sol',
    arm,
    repetition: 1,
    taskManifestSha256,
  };
  const plan = {
    schemaVersion: 'decantr-benchmark-run-plan.v2',
    program: 'decantr-3.10-ui-change-control-proof',
    seed: 'fixture-seed-0000000001',
    bindings: {
      corpus: binding('corpus'),
      models: binding('models'),
      protocol: binding('protocol'),
      runtimeMatrix: {
        logicalName: 'runtime-matrix.json',
        sha256: sha256(await readFile(runtimeMatrixPath)),
        bytes: (await readFile(runtimeMatrixPath)).byteLength,
      },
      qualificationTaskIndex: binding('qualification'),
      developmentTasks: [binding('task')],
    },
    design: { tasks: 1, models: 1, arms: 1, repetitions: 1, totalRuns: 1 },
    tasks: [
      {
        taskId: task.taskId,
        partition: task.partition,
        kind: task.kind,
        repositoryId: task.repositoryId,
        framework: task.framework,
        projectPath: task.projectPath,
        corpusProjectPath: task.corpusProjectPath,
        corpusCommit: task.corpusCommit,
        base: task.base,
        manifestSha256: taskManifestSha256,
        candidateSha256: provenance.candidateSha256,
        evaluatorContractSha256,
        evaluatorSpecSha256: provenance.evaluatorSpecSha256,
        oracleSourceSha256: provenance.oracleSourceSha256,
        qualificationControllerSha256: provenance.qualificationControllerSha256,
        qualificationReceiptFileSha256: provenance.qualificationReceiptFileSha256,
        qualificationReceiptSha256: provenance.qualificationReceiptSha256,
        qualificationExecutionAttestationFileSha256:
          provenance.qualificationExecutionAttestationFileSha256,
        qualificationExecutionAttestationSha256:
          provenance.qualificationExecutionAttestationSha256,
        qualificationExecutionControllerSha256: provenance.qualificationExecutionControllerSha256,
        qualificationEvaluatorSourceClosureSha256:
          provenance.qualificationEvaluatorSourceClosureSha256,
        qualificationInputRequestFileSha256: provenance.qualificationInputRequestFileSha256,
        qualificationInputRequestSha256: provenance.qualificationInputRequestSha256,
        qualificationInputManifestFileSha256: provenance.qualificationInputManifestFileSha256,
        qualificationInputManifestSha256: provenance.qualificationInputManifestSha256,
        qualificationRunnerRepositoryCommit: provenance.qualificationRunnerRepositoryCommit,
        qualificationProvenanceBundleFileSha256:
          provenance.qualificationProvenanceBundleFileSha256,
        qualificationProvenanceVerificationSha256:
          provenance.qualificationProvenanceVerificationSha256,
        informationEntitlementSha256,
        environmentSpecSha256,
        environmentSubstanceSha256,
        runtimeProfileId: environmentSpec.profile.id,
        runtimeMatrixFileSha256: provenance.runtimeMatrixFileSha256,
        runtimeMatrixSha256: provenance.runtimeMatrixSha256,
        benchmarkImageDigest: provenance.benchmarkImageDigest,
        sourceRef: 'task.json',
      },
    ],
    runs: [run],
  };
  plan.planSha256 = calculateRunPlanDigest(plan);
  const planPath = join(root, 'plan.json');
  await writeFile(planPath, prettyCanonicalJson(plan));

  const tarballPath = join(root, 'candidate.tgz');
  await writeFile(tarballPath, 'candidate fixture bytes');
  const candidateManifest = {
    schemaVersion: 'decantr-benchmark-candidate.v1',
    version: '3.10.0',
    tarballs: [{ package: '@decantr/cli', path: 'candidate.tgz', sha256: sha256(await readFile(tarballPath)) }],
  };
  let candidateRuntimeRoot;
  if (arm === 'treatment') {
    candidateRuntimeRoot = join(root, 'candidate-runtime');
    const cliRoot = join(candidateRuntimeRoot, 'node_modules', '@decantr', 'cli', 'dist');
    await mkdir(cliRoot, { recursive: true });
    await writeFile(join(candidateRuntimeRoot, 'package-lock.json'), '{"lockfileVersion":3}\n');
    await writeFile(join(candidateRuntimeRoot, 'node_modules', '@decantr', 'cli', 'package.json'), '{}\n');
    await writeFile(
      join(cliRoot, 'bin.js'),
      [
        "const index = process.argv.indexOf('task');",
        'const target = process.argv[index + 1];',
        "console.log(JSON.stringify({schemaVersion:'ui-surface-task-context.v1',mode:'discovery',target,status:'ready',surface:{id:'file:result.txt',kind:'file',name:'result.txt',files:['result.txt']},candidates:[],read:['result.txt'],readTargets:[{rank:1,file:'result.txt',role:'implementation',reason:'exact file'}],authority:{axes:{},reasons:[]},stopConditions:[],verifyCommand:'node --test'}));",
      ].join('\n'),
    );
    const runtimeFiles = ['package-lock.json', 'node_modules/@decantr'];
    candidateManifest.contextProvider = {
      type: 'decantr-cli-task-v1',
      package: '@decantr/cli',
      entrypoint: 'node_modules/@decantr/cli/dist/bin.js',
      outputSchemaVersion: 'ui-surface-task-context.v1',
      runtimeLock: {
        path: 'package-lock.json',
        sha256: sha256(await readFile(join(candidateRuntimeRoot, 'package-lock.json'))),
      },
      runtimeFiles,
      runtimeTreeSha256: await hashRuntimeTree(candidateRuntimeRoot, runtimeFiles),
    };
  }
  const candidateManifestPath = join(root, 'candidate.json');
  await writeFile(candidateManifestPath, prettyCanonicalJson(candidateManifest));

  return {
    root,
    provenance,
    options: {
      planPath,
      runId: run.runId,
      modelId: run.modelId,
      arm: run.arm,
      repetition: run.repetition,
      workspace,
      taskManifestPath,
      evaluatorContractPath,
      evaluatorRoot,
      candidateManifestPath,
      candidateRuntimeRoot,
      environmentSpecPath,
      runtimeMatrixPath,
      preparedEnvironmentPath,
      outputRoot,
      modelsPath,
      protocolPath,
      pricingPath,
      adapterArgs: [],
      paid: false,
      executionEnvironment: {
        ...process.env,
        DECANTR_TASK_RUNTIME_KIND: 'node',
        DECANTR_TASK_RUNTIME_VERSION: nodeVersion,
        DECANTR_TASK_PACKAGE_MANAGER: 'npm',
        DECANTR_TASK_PACKAGE_MANAGER_VERSION: npmVersion,
      },
      allowHostRuntime: true,
    },
  };
}

function makeRuntimeMatrix(sourceProfile) {
  return makeFixtureLockedRuntimeMatrix({
    profile: sourceProfile,
    draftFrozenAt: '2026-07-22T17:00:00.000Z',
    verifiedAt: '2026-07-22T17:30:00.000Z',
    lockedAt: '2026-07-22T18:00:00.000Z',
  });
}

function fixtureTaskInput(file) {
  return {
    target: { selector: `file:${file}` },
    policyCard: {
      statements: [
        {
          id: 'repository-authority',
          text: 'Preserve the repository-owned component and styling conventions.',
          sources: ['base-checkout'],
        },
      ],
    },
  };
}

function binding(name) {
  return { logicalName: name, sha256: sha256Canonical({ name }), bytes: 1 };
}

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' });
}
