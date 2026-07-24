import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  calculatePreparedAttestationDigest,
  calculatePreparedEnvironmentIdentity,
  discoverDependencyRoots,
  hashDependencyRoots,
} from '../environments/prepared-environment.mjs';
import { makeFixtureLockedRuntimeMatrix } from '../environments/runtime-matrix.test-helper.mjs';
import {
  SIGSTORE_KEYLESS_PROVIDER,
  SIGSTORE_KEYLESS_SCHEMA_VERSION,
  SIGSTORE_OIDC_ISSUER,
} from '../provenance/sigstore-keyless.mjs';
import {
  canonicalJson,
  prettyCanonicalJson,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from './canonical.mjs';
import { executeAgentStage } from './agent-stage.mjs';
import { executeEvaluatorStage } from './evaluator-stage.mjs';
import { prepareSplitRunInput } from './prepare-split-run-input.mjs';
import { buildRunAuthorization } from './run-authorization.mjs';
import {
  assertCandidateManifest,
  calculateRunPlanDigest,
} from './contracts.mjs';
import {
  buildSplitInputManifests,
  verifySplitAgentInput,
  verifySplitEvaluatorInput,
} from './split-run-input.mjs';
import { calculateStageControllerClosure } from './stage-controller.mjs';
import { stageProvenancePolicy } from './stage-provenance.mjs';

const fakeAdapter = fileURLToPath(
  new URL('../model-proxy/fake-adapter.mjs', import.meta.url),
);
const AGENT_IMAGE = `sha256:${'1'.repeat(64)}`;
const EVALUATOR_IMAGE = `sha256:${'2'.repeat(64)}`;
const AGENT_MANIFEST = `sha256:${'3'.repeat(64)}`;
const EVALUATOR_MANIFEST = `sha256:${'4'.repeat(64)}`;

test('split-stage no-cost run reconstructs and evaluates without production eligibility', async () => {
  const fixture = await createFixture();
  try {
    const agent = await executeAgentStage({
      requestPath: fixture.requestPath,
      workspace: fixture.workspace,
      preparedEnvironmentPath: fixture.preparedPath,
      outputRoot: fixture.agentOutput,
      adapterCommand: process.execPath,
      adapterArgs: [fakeAdapter],
      agentImageReference: `ghcr.io/decantr-ai/agent@${AGENT_MANIFEST}`,
      agentImageDigest: AGENT_IMAGE,
      partition: 'development',
      paid: false,
      execution: localExecution('agent'),
      createdAt: '2026-07-24T18:00:00.000Z',
    });
    const bundlePath = join(fixture.root, 'agent-bundle.json');
    await writeFile(bundlePath, '{"fixture":true}\n');
    const evaluated = await executeEvaluatorStage(
      {
        agentAttestationPath: agent.attestationPath,
        agentBundlePath: bundlePath,
        agentImageDigest: AGENT_IMAGE,
        requestPath: fixture.requestPath,
        adapterResponsePath: agent.responsePath,
        workspaceDeltaPath: agent.deltaPath,
        workspaceDeltaArtifactRoot: dirname(agent.deltaPath),
        workspace: fixture.workspace,
        preparedEnvironmentPath: fixture.preparedPath,
        authorizationPath: fixture.authorizationPath,
        taskManifestPath: fixture.taskPath,
        evaluatorContractPath: fixture.contractPath,
        evaluatorRoot: fixture.evaluatorRoot,
        evaluatorImageReference: `ghcr.io/decantr-ai/evaluator@${EVALUATOR_MANIFEST}`,
        evaluatorImageDigest: EVALUATOR_IMAGE,
        evaluatorControllerSha256: '3'.repeat(64),
        partition: 'development',
        outputRoot: fixture.evaluatorOutput,
        agentExitedBeforeMount: true,
        execution: localExecution('evaluator'),
        startedAt: '2026-07-24T18:00:00.000Z',
        finishedAt: '2026-07-24T18:01:00.000Z',
        protocolMaximumUsd: 4160,
        developmentTaskCount: 1,
      },
      { provenanceVerifier: fixtureProvenanceVerifier },
    );
    assert.equal(evaluated.runCore.status, 'completed');
    assert.equal(evaluated.runCore.execution.productionEligible, false);
    assert.equal(evaluated.attestation.productionEligible, false);
    assert.equal(evaluated.attestation.isolation.agentExitedBeforeMount, true);
    assert.equal(evaluated.attestation.reconstruction.workspaceDeltaSha256, agent.delta.deltaSha256);
    assert.equal(evaluated.runCore.evaluatorResultSha256 !== null, true);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('evaluator stage rejects provider credentials before opening sealed inputs', async () => {
  await assert.rejects(
    executeEvaluatorStage({
      environment: { OPENAI_API_KEY: 'forbidden' },
      agentExitedBeforeMount: true,
    }),
    /provider credentials are forbidden/u,
  );
});

test('split input manifests keep evaluator material out of the agent artifact', async () => {
  const fixture = await createFixture();
  try {
    const agentRoot = join(fixture.root, 'split-agent-input');
    const evaluatorRoot = join(fixture.root, 'split-evaluator-input');
    await Promise.all([
      mkdir(agentRoot, { recursive: true }),
      mkdir(evaluatorRoot, { recursive: true }),
    ]);
    const request = JSON.parse(await readFile(fixture.requestPath, 'utf8'));
    request.workspace = '/work';
    const controllerRoot = resolve(
      dirname(fileURLToPath(import.meta.url)),
      '..',
      '..',
      '..',
    );
    const [agentController, evaluatorController] = await Promise.all([
      calculateStageControllerClosure('agent', { root: controllerRoot }),
      calculateStageControllerClosure('evaluator', { root: controllerRoot }),
    ]);
    request.bindings.agentControllerSha256 =
      agentController.controllerSha256;
    await Promise.all([
      writeCanonicalFile(join(agentRoot, 'request.json'), request),
      cp(fixture.authorizationPath, join(agentRoot, 'authorization.json')),
      cp(fixture.preparedPath, join(agentRoot, 'prepared-environment.json')),
      cp(fixture.workspace, join(agentRoot, 'workspace'), {
        recursive: true,
        verbatimSymlinks: true,
      }),
      cp(fixture.preparedPath, join(evaluatorRoot, 'prepared-environment.json')),
      cp(
        fixture.authorizationPath,
        join(evaluatorRoot, 'authorization.json'),
      ),
      cp(fixture.taskPath, join(evaluatorRoot, 'task.json')),
      cp(fixture.contractPath, join(evaluatorRoot, 'contract.json')),
      cp(fixture.workspace, join(evaluatorRoot, 'workspace'), {
        recursive: true,
        verbatimSymlinks: true,
      }),
      cp(fixture.evaluatorRoot, join(evaluatorRoot, 'evaluator'), {
        recursive: true,
        verbatimSymlinks: true,
      }),
    ]);
    const built = await buildSplitInputManifests({
      agentInputRoot: agentRoot,
      evaluatorInputRoot: evaluatorRoot,
      runId: 'run-fixture',
      taskId: 'task-fixture',
      partition: 'development',
      sourceCommit: 'a'.repeat(40),
      agentImageReference: `ghcr.io/decantr-ai/agent@${AGENT_MANIFEST}`,
      agentImageDigest: AGENT_IMAGE,
      evaluatorImageReference: `ghcr.io/decantr-ai/evaluator@${EVALUATOR_MANIFEST}`,
      evaluatorImageDigest: EVALUATOR_IMAGE,
      evaluatorControllerSha256: evaluatorController.controllerSha256,
    });
    assert.equal(built.agentManifest.pairSha256, built.evaluatorManifest.pairSha256);
    assert.deepEqual(
      (await readdir(agentRoot)).sort(),
      [
        'authorization.json',
        'manifest.json',
        'prepared-environment.json',
        'request.json',
        'workspace',
      ],
    );
    await Promise.all([
      verifySplitAgentInput({
        inputRoot: agentRoot,
        sourceCommit: 'a'.repeat(40),
      }),
      verifySplitEvaluatorInput({
        inputRoot: evaluatorRoot,
        sourceCommit: 'a'.repeat(40),
      }),
    ]);
    await writeFile(join(agentRoot, 'hidden-evaluator.json'), '{}\n');
    await assert.rejects(
      verifySplitAgentInput({
        inputRoot: agentRoot,
        sourceCommit: 'a'.repeat(40),
      }),
      /unexpected top-level material/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('split-input producer binds a frozen run into disjoint validated roots', async () => {
  const fixture = await createFixture();
  try {
    const outputRoot = join(fixture.root, 'produced-split-input');
    const produced = await prepareSplitRunInput({
      planPath: fixture.planPath,
      runId: 'run-fixture',
      taskManifestPath: fixture.taskPath,
      workspace: fixture.workspace,
      preparedEnvironmentPath: fixture.preparedPath,
      evaluatorContractPath: fixture.contractPath,
      evaluatorRoot: fixture.evaluatorRoot,
      candidateManifestPath: fixture.candidateManifestPath,
      runtimeMatrixPath: fixture.runtimeMatrixPath,
      authorizationPath: fixture.authorizationPath,
      modelsPath: fixture.modelsPath,
      protocolPath: fixture.protocolPath,
      sourceCommit: 'a'.repeat(40),
      outputRoot,
    });
    assert.equal(produced.runId, 'run-fixture');
    assert.equal(produced.paid, false);
    assert.equal(
      produced.authorizationSha256,
      sha256(await readFile(fixture.authorizationPath)),
    );
    assert.deepEqual(
      (await readdir(produced.agentInputRoot)).sort(),
      [
        'authorization.json',
        'manifest.json',
        'prepared-environment.json',
        'request.json',
        'workspace',
      ],
    );
    assert.deepEqual(
      (await readdir(produced.evaluatorInputRoot)).sort(),
      [
        'authorization.json',
        'contract.json',
        'evaluator',
        'manifest.json',
        'prepared-environment.json',
        'task.json',
        'workspace',
      ],
    );
    const [agent, evaluator] = await Promise.all([
      verifySplitAgentInput({
        inputRoot: produced.agentInputRoot,
        sourceCommit: 'a'.repeat(40),
      }),
      verifySplitEvaluatorInput({
        inputRoot: produced.evaluatorInputRoot,
        sourceCommit: 'a'.repeat(40),
      }),
    ]);
    assert.equal(agent.manifest.pairSha256, produced.pairSha256);
    assert.equal(
      evaluator.manifest.pairSha256,
      produced.pairSha256,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), 'decantr-evaluator-stage-'));
  const workspace = join(root, 'workspace');
  const evaluatorRoot = join(root, 'sealed-evaluator');
  const agentOutput = join(root, 'agent-output');
  const evaluatorOutput = join(root, 'evaluator-output');
  await mkdir(join(workspace, 'node_modules', 'fixture'), { recursive: true });
  await mkdir(evaluatorRoot, { recursive: true });
  await Promise.all([
    writeFile(join(workspace, 'result.txt'), 'correct\n'),
    writeFile(join(workspace, 'package.json'), '{"name":"fixture","private":true}\n'),
    writeFile(join(workspace, 'package-lock.json'), '{"lockfileVersion":3}\n'),
    writeFile(join(workspace, '.gitignore'), 'node_modules/\n'),
    writeFile(join(workspace, 'node_modules', 'fixture', 'index.js'), 'fixture\n'),
  ]);
  git(workspace, ['init', '-q']);
  git(workspace, ['add', '.']);
  git(workspace, [
    '-c',
    'user.name=Split Stage Fixture',
    '-c',
    'user.email=split@example.test',
    'commit',
    '-qm',
    'base',
  ]);
  const base = {
    commit: git(workspace, ['rev-parse', 'HEAD']),
    tree: git(workspace, ['rev-parse', 'HEAD^{tree}']),
  };
  const runtimeMatrix = makeFixtureLockedRuntimeMatrix({
    sourceCommit: 'a'.repeat(40),
    profile: {
      id: 'node-22.19.0-npm-11.4.2',
      os: 'linux',
      arch: 'x64',
      nodeVersion: '22.19.0',
      bunVersion: null,
      packageManager: { name: 'npm', version: '11.4.2' },
    },
    benchmarkImageDigest: EVALUATOR_IMAGE,
    benchmarkImageManifestDigest: EVALUATOR_MANIFEST,
    agentImageDigest: AGENT_IMAGE,
    agentImageManifestDigest: AGENT_MANIFEST,
  });
  const runtimeMatrixPath = join(root, 'runtime-matrix.json');
  await writeCanonicalFile(runtimeMatrixPath, runtimeMatrix);
  const runtimeMatrixBytes = await readFile(runtimeMatrixPath);
  const evaluatorSource = [
    "import { readFileSync } from 'node:fs';",
    "const passed = readFileSync(process.argv[2], 'utf8').trim() === 'correct';",
    'console.log(JSON.stringify({passed,metrics:{governanceViolations:0}}));',
  ].join('\n');
  const evaluatorSourcePath = join(evaluatorRoot, 'check.mjs');
  await writeFile(evaluatorSourcePath, evaluatorSource);
  const sourceMetadata = await lstat(evaluatorSourcePath);
  const sourceClosure = [
    {
      path: 'check.mjs',
      kind: 'file',
      sha256: sha256(evaluatorSource),
      bytes: Buffer.byteLength(evaluatorSource),
      mode: sourceMetadata.mode & 0o777,
    },
  ];
  const contract = {
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
  const contractPath = join(root, 'contract.json');
  await writeCanonicalFile(contractPath, contract);
  const informationEntitlement = {
    policy: 'Preserve the existing result and validate it.',
    taskInput: {
      target: { selector: 'file:result.txt' },
      policyCard: {
        statements: [
          {
            id: 'repository-authority',
            text: 'Preserve repository-owned conventions.',
            sources: ['base-checkout'],
          },
        ],
      },
    },
  };
  const task = {
    schemaVersion: 'decantr-benchmark-task.v2',
    taskId: 'task-fixture',
    partition: 'development',
    kind: 'repository',
    repositoryId: 'fixture-repository',
    framework: 'react',
    projectPath: '.',
    corpusProjectPath: '.',
    corpusCommit: base.commit,
    candidateSha256: '4'.repeat(64),
    base,
    prompt: 'Keep the existing fixture behavior correct without unrelated changes.',
    informationEntitlement,
    informationEntitlementSha256: sha256Canonical(informationEntitlement),
    armInputs: {
      control: {
        context: 'Use the repository policy card.',
        entitlementSha256: sha256Canonical(informationEntitlement),
      },
      treatment: {
        context: 'Use the Decantr task context.',
        entitlementSha256: sha256Canonical(informationEntitlement),
      },
    },
    scope: { allowedPaths: ['result.txt'], forbiddenPaths: [] },
    environment: {
      specSha256: '5'.repeat(64),
      substanceSha256: '6'.repeat(64),
      runtimeProfileId: 'node-22.19.0-npm-11.4.2',
      runtimeMatrixFileSha256: sha256(runtimeMatrixBytes),
      runtimeMatrixSha256: runtimeMatrix.matrixSha256,
      benchmarkImageDigest: EVALUATOR_IMAGE,
    },
    evaluator: {
      contractId: contract.contractId,
      contractSha256: sha256(await readFile(contractPath)),
      specSha256: '9'.repeat(64),
      oracleSourceSha256: contract.oracle.sourceSha256,
      qualificationControllerSha256: 'a'.repeat(64),
      qualificationReceiptFileSha256: 'b'.repeat(64),
      qualificationReceiptSha256: 'c'.repeat(64),
      qualificationExecutionAttestationFileSha256: 'd'.repeat(64),
      qualificationExecutionAttestationSha256: 'e'.repeat(64),
      qualificationExecutionControllerSha256: 'f'.repeat(64),
      qualificationEvaluatorSourceClosureSha256: sha256Canonical(sourceClosure),
      qualificationInputRequestFileSha256: '1'.repeat(64),
      qualificationInputRequestSha256: '2'.repeat(64),
      qualificationInputManifestFileSha256: '3'.repeat(64),
      qualificationInputManifestSha256: '4'.repeat(64),
      qualificationRunnerRepositoryCommit: '5'.repeat(40),
      qualificationProvenanceBundleFileSha256: '6'.repeat(64),
      qualificationProvenanceVerificationSha256: '7'.repeat(64),
    },
    limits: {
      timeoutMs: 30_000,
      maxRequests: 4,
      maxInputTokens: 10_000,
      maxOutputTokens: 2_000,
    },
  };
  const taskPath = join(root, 'task.json');
  await writeCanonicalFile(taskPath, task);
  const taskBytes = await readFile(taskPath);
  const candidateRoot = join(root, 'candidate');
  const candidateTarballRoot = join(candidateRoot, 'tarballs');
  await mkdir(candidateTarballRoot, { recursive: true });
  const candidateTarballPath = join(
    candidateTarballRoot,
    'decantr-cli-fixture.tgz',
  );
  await writeFile(candidateTarballPath, 'candidate fixture\n');
  const candidateManifestPath = join(
    candidateRoot,
    'candidate.json',
  );
  await writeCanonicalFile(candidateManifestPath, {
    schemaVersion: 'decantr-benchmark-candidate.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    version: '3.10.0-fixture',
    builtAt: '2026-07-24T17:00:00.000Z',
    source: {
      repository: 'https://github.com/decantr-ai/decantr',
      commit: 'a'.repeat(40),
      tree: 'b'.repeat(40),
      clean: true,
      dirtyStatusSha256: sha256(''),
      trackedDiffSha256: sha256(''),
    },
    tarballs: [
      {
        package: '@decantr/cli',
        path: 'tarballs/decantr-cli-fixture.tgz',
        sha256: sha256(await readFile(candidateTarballPath)),
      },
    ],
  });
  const candidate = await assertCandidateManifest(
    JSON.parse(await readFile(candidateManifestPath, 'utf8')),
    candidateManifestPath,
  );
  const modelsPath = fileURLToPath(
    new URL('../models.json', import.meta.url),
  );
  const protocolPath = fileURLToPath(
    new URL('../protocol.json', import.meta.url),
  );
  const [modelsBytes, protocolBytes] = await Promise.all([
    readFile(modelsPath),
    readFile(protocolPath),
  ]);
  const model = JSON.parse(modelsBytes).models.find(
    (item) => item.id === 'openai-gpt-5.6-sol',
  );
  const plan = {
    schemaVersion: 'decantr-benchmark-run-plan.v2',
    program: 'decantr-3.10-ui-change-control-proof',
    seed: 'fixture-seed-0000000001',
    bindings: {
      corpus: fixtureFileBinding('corpus.json', Buffer.from('{}')),
      developmentTasks: [
        fixtureFileBinding('task.json', taskBytes),
      ],
      models: fixtureFileBinding('models.json', modelsBytes),
      protocol: fixtureFileBinding('protocol.json', protocolBytes),
      qualificationTaskIndex: fixtureFileBinding(
        'qualification-index.json',
        Buffer.from('{}'),
      ),
      runtimeMatrix: fixtureFileBinding(
        'runtime-matrix.json',
        runtimeMatrixBytes,
      ),
    },
    design: {
      tasks: 1,
      models: 1,
      arms: 1,
      repetitions: 1,
      totalRuns: 1,
    },
    tasks: [plannedTaskBinding(task, sha256(taskBytes))],
    runs: [
      {
        runId: 'run-fixture',
        ordinal: 1,
        block: 1,
        taskId: task.taskId,
        partition: task.partition,
        repositoryId: task.repositoryId,
        framework: task.framework,
        modelId: model.id,
        provider: model.provider,
        requestedModel: model.requestedModel,
        arm: 'control',
        repetition: 1,
        taskManifestSha256: sha256(taskBytes),
      },
    ],
  };
  plan.planSha256 = calculateRunPlanDigest(plan);
  const planPath = join(root, 'run-plan.json');
  await writeCanonicalFile(planPath, plan);
  const prepared = await createPreparedEnvironment(workspace, task);
  const preparedPath = join(root, 'prepared.json');
  await writeCanonicalFile(preparedPath, prepared);
  const preparedBytes = await readFile(preparedPath);
  const authorizationPath = join(root, 'authorization.json');
  const authorization = await buildRunAuthorization({
    outputPath: authorizationPath,
    paid: false,
    runId: 'run-fixture',
    partition: 'development',
    modelId: model.id,
    runPlanSha256: plan.planSha256,
    candidateManifestSha256: candidate.manifestSha256,
    candidateTarballSetSha256: candidate.tarballSetSha256,
    maxRunCostUsd: model.maxRunCostUsd,
    protocolMaximumUsd: 4160,
    developmentTaskCount: 1,
  });
  const delivery = {
    schemaVersion: 'decantr-benchmark-arm-delivery.v1',
    arm: 'control',
    sharedTaskInputSha256: sha256Canonical(informationEntitlement.taskInput),
    sharedTaskInput: informationEntitlement.taskInput,
    instructions: ['Inspect repository authority directly from the shared task facts.'],
    productContext: null,
  };
  const request = {
    schemaVersion: 'decantr-benchmark-adapter-request.v1',
    runId: 'run-fixture',
    taskId: task.taskId,
    modelId: model.id,
    provider: model.provider,
    requestedModel: model.requestedModel,
    reasoningEffort: model.reasoningEffort,
    maxRunCostUsd: model.maxRunCostUsd,
    arm: 'control',
    repetition: 1,
    prompt: task.prompt,
    context: canonicalJson(delivery),
    informationEntitlement,
    workspace,
    projectPath: '.',
    scope: task.scope,
    limits: task.limits,
    isolation: {
      home: '/home/benchmark-empty',
      personalSkills: false,
      personalMcp: false,
      hostConfiguration: false,
      network: 'none',
    },
    bindings: {
      authorizationSha256: authorization.sha256,
      planSha256: plan.planSha256,
      taskManifestSha256: sha256(taskBytes),
      candidateManifestSha256: candidate.manifestSha256,
      candidateTarballSetSha256: candidate.tarballSetSha256,
      runtimeMatrixSha256: task.environment.runtimeMatrixSha256,
      preparedEnvironmentAttestationSha256: sha256(preparedBytes),
      environmentSha256: prepared.environmentSha256,
      environmentSpecSha256: task.environment.specSha256,
      environmentSubstanceSha256: task.environment.substanceSha256,
      agentControllerSha256: 'b'.repeat(64),
      agentImageDigest: AGENT_IMAGE,
      informationEntitlementSha256: task.informationEntitlementSha256,
      deliverySha256: sha256Canonical(delivery),
      baseCommit: base.commit,
      baseTree: base.tree,
    },
  };
  const requestPath = join(root, 'request.json');
  await writeCanonicalFile(requestPath, request);
  return {
    root,
    workspace,
    evaluatorRoot,
    agentOutput,
    evaluatorOutput,
    contractPath,
    taskPath,
    preparedPath,
    authorizationPath,
    candidateManifestPath,
    modelsPath,
    planPath,
    protocolPath,
    requestPath,
    runtimeMatrixPath,
  };
}

function fixtureFileBinding(logicalName, bytes) {
  return {
    logicalName,
    sha256: sha256(bytes),
    bytes: bytes.byteLength,
  };
}

function plannedTaskBinding(task, manifestSha256) {
  return {
    taskId: task.taskId,
    partition: task.partition,
    kind: task.kind,
    repositoryId: task.repositoryId,
    framework: task.framework,
    projectPath: task.projectPath,
    corpusProjectPath: task.corpusProjectPath,
    corpusCommit: task.corpusCommit,
    base: structuredClone(task.base),
    manifestSha256,
    candidateSha256: task.candidateSha256,
    evaluatorContractSha256: task.evaluator.contractSha256,
    evaluatorSpecSha256: task.evaluator.specSha256,
    oracleSourceSha256: task.evaluator.oracleSourceSha256,
    qualificationControllerSha256:
      task.evaluator.qualificationControllerSha256,
    qualificationReceiptFileSha256:
      task.evaluator.qualificationReceiptFileSha256,
    qualificationReceiptSha256:
      task.evaluator.qualificationReceiptSha256,
    qualificationExecutionAttestationFileSha256:
      task.evaluator.qualificationExecutionAttestationFileSha256,
    qualificationExecutionAttestationSha256:
      task.evaluator.qualificationExecutionAttestationSha256,
    qualificationExecutionControllerSha256:
      task.evaluator.qualificationExecutionControllerSha256,
    qualificationEvaluatorSourceClosureSha256:
      task.evaluator.qualificationEvaluatorSourceClosureSha256,
    qualificationInputRequestFileSha256:
      task.evaluator.qualificationInputRequestFileSha256,
    qualificationInputRequestSha256:
      task.evaluator.qualificationInputRequestSha256,
    qualificationInputManifestFileSha256:
      task.evaluator.qualificationInputManifestFileSha256,
    qualificationInputManifestSha256:
      task.evaluator.qualificationInputManifestSha256,
    qualificationRunnerRepositoryCommit:
      task.evaluator.qualificationRunnerRepositoryCommit,
    qualificationProvenanceBundleFileSha256:
      task.evaluator.qualificationProvenanceBundleFileSha256,
    qualificationProvenanceVerificationSha256:
      task.evaluator.qualificationProvenanceVerificationSha256,
    informationEntitlementSha256:
      task.informationEntitlementSha256,
    environmentSpecSha256: task.environment.specSha256,
    environmentSubstanceSha256:
      task.environment.substanceSha256,
    runtimeProfileId: task.environment.runtimeProfileId,
    runtimeMatrixFileSha256:
      task.environment.runtimeMatrixFileSha256,
    runtimeMatrixSha256: task.environment.runtimeMatrixSha256,
    benchmarkImageDigest:
      task.environment.benchmarkImageDigest,
    sourceRef: 'task.json',
  };
}

async function createPreparedEnvironment(workspace, task) {
  const dependencyRoots = await discoverDependencyRoots(workspace);
  const dependencyTree = await hashDependencyRoots(workspace, dependencyRoots);
  const attestation = {
    schemaVersion: 'decantr-benchmark-prepared-environment.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    taskId: task.taskId,
    environmentSpecSha256: task.environment.specSha256,
    environmentSubstanceSha256: task.environment.substanceSha256,
    runtimeMatrixSha256: task.environment.runtimeMatrixSha256,
    runtimeProfileId: task.environment.runtimeProfileId,
    benchmarkImageDigest: task.environment.benchmarkImageDigest,
    base: structuredClone(task.base),
    revisionRole: 'base',
    revision: structuredClone(task.base),
    candidateSha256: null,
    lockfiles: [
      {
        path: 'package-lock.json',
        sha256: sha256(await readFile(join(workspace, 'package-lock.json'))),
      },
    ],
    steps: [
      {
        id: 'install',
        network: 'none',
        commandSha256: '1'.repeat(64),
        exitCode: 0,
        durationMs: 1,
        stdoutSha256: '2'.repeat(64),
        stderrSha256: '3'.repeat(64),
      },
    ],
    dependencyRoots,
    dependencyTreeSha256: dependencyTree.sha256,
    dependencyEntryCount: dependencyTree.entryCount,
    trackedClean: true,
    preparedAt: '2026-07-24T17:00:00.000Z',
    environmentSha256: null,
    attestationSha256: null,
  };
  attestation.environmentSha256 = calculatePreparedEnvironmentIdentity(attestation);
  attestation.attestationSha256 = calculatePreparedAttestationDigest(attestation);
  return attestation;
}

async function fixtureProvenanceVerifier(input) {
  const [subject, bundle] = await Promise.all([
    readFile(input.subjectPath),
    readFile(input.bundlePath),
  ]);
  const policy = stageProvenancePolicy(input.partition, input.sourceDigest);
  const verification = {
    schemaVersion: SIGSTORE_KEYLESS_SCHEMA_VERSION,
    provider: SIGSTORE_KEYLESS_PROVIDER,
    verified: true,
    subject: { bytes: subject.byteLength, sha256: sha256(subject) },
    bundle: { bytes: bundle.byteLength, sha256: sha256(bundle) },
    policy: {
      certificateIdentity:
        `https://github.com/${policy.repository}/.github/workflows/` +
        `${policy.workflowFile}@${policy.sourceRef}`,
      certificateOidcIssuer: SIGSTORE_OIDC_ISSUER,
      repository: policy.repository,
      workflowFile: policy.workflowFile,
      sourceDigest: policy.sourceDigest,
      sourceRef: policy.sourceRef,
      eventName: policy.eventName,
      transparencyLogRequired: true,
      certificateTransparencyRequired: true,
      githubHostedRunnerRequired: true,
    },
  };
  verification.verificationSha256 = sha256Canonical(verification);
  return verification;
}

function localExecution(job) {
  return {
    repository: 'decantr-ai/decantr',
    workflowFile: 'benchmark-3-10-split-run.yml',
    sourceDigest: 'a'.repeat(40),
    sourceRef: 'refs/heads/main',
    eventName: 'workflow_dispatch',
    runId: 'local',
    runAttempt: '1',
    job,
    runnerEnvironment: 'local-test',
    runnerOs: 'Darwin',
    runnerArch: 'ARM64',
  };
}

function git(cwd, args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}
