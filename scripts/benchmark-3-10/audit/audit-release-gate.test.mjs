import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  canonicalJson,
  prettyCanonicalJson,
  readJsonFile,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
  writeContentAddressed,
} from '../runner/canonical.mjs';
import { RUN_CORE_SCHEMA_VERSION } from '../runner/run-record.mjs';
import {
  createAgentStageAttestation,
  createEvaluatorStageAttestation,
  fileBinding as stageFileBinding,
  stageProvenancePolicy,
  writeStageAttestation,
} from '../runner/stage-provenance.mjs';
import { calculateStageControllerClosure } from '../runner/stage-controller.mjs';
import {
  SIGSTORE_KEYLESS_PROVIDER,
  SIGSTORE_KEYLESS_SCHEMA_VERSION,
  SIGSTORE_OIDC_ISSUER,
} from '../provenance/sigstore-keyless.mjs';
import {
  assertCandidateManifest,
  AUTHORIZATION_STATEMENT,
  calculateRunPlanDigest,
  expectedAnalysisSeed,
  expectedReviewSeed,
} from '../runner/contracts.mjs';
import { buildRunAuthorization } from '../runner/run-authorization.mjs';
import { buildRunPlan } from '../runner/make-run-plan.mjs';
import { taskEnvironmentSubstanceSha256 } from '../environments/contracts.mjs';
import { makeFixtureLockedRuntimeMatrix } from '../environments/runtime-matrix.test-helper.mjs';
import {
  calculatePreparedAttestationDigest,
  calculatePreparedEnvironmentIdentity,
} from '../environments/prepared-environment.mjs';
import {
  calculatePrequalificationBundleDigest,
  calculateQualificationControllerDigest,
  calculateQualificationReceiptDigest,
} from '../evaluators/qualification-task.mjs';
import {
  qualificationProvenanceBundleFilename,
  qualificationProvenancePolicy,
} from '../evaluators/qualification-provenance.mjs';
import {
  FIXTURE_PROVENANCE_VERIFICATION_SHA256,
  FIXTURE_RUNNER_COMMIT,
  FIXTURE_SOURCE_REF,
  fixtureProvenanceVerifier,
  makeFixtureExecutionAttestation,
  makeFixtureQualificationInput,
} from '../test-helpers/qualification-execution.mjs';
import { auditReleaseGate } from './audit-release-gate.mjs';

const benchmarkDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const corpusPath = join(benchmarkDirectory, 'corpus.json');
const modelsPath = join(benchmarkDirectory, 'models.json');
const protocolPath = join(benchmarkDirectory, 'protocol.json');
const QUALIFICATION_EXECUTION_FIELDS = [
  'qualificationExecutionAttestationFileSha256',
  'qualificationExecutionAttestationSha256',
  'qualificationExecutionControllerSha256',
  'qualificationEvaluatorSourceClosureSha256',
  'qualificationInputRequestFileSha256',
  'qualificationInputRequestSha256',
  'qualificationInputManifestFileSha256',
  'qualificationInputManifestSha256',
  'qualificationRunnerRepositoryCommit',
  'qualificationProvenanceBundleFileSha256',
  'qualificationProvenanceVerificationSha256',
];

test('release gate accepts one fully bound 320-run packet and rejects a missing run', async () => {
  const fixture = await createReleaseFixture();
  try {
    const passing = await auditReleaseGate(fixture.options);
    assert.equal(passing.ok, true, passing.errors.join('\n'));
    assert.equal(passing.bindings.expectedRuns, 320);
    assert.equal(passing.bindings.observedRuns, 320);
    assert.equal(passing.humanReviewWaiverAllowed, false);

    const receiptTask = fixture.plan.tasks.find((task) => task.partition === 'development');
    const retainedResultPath = join(
      fixture.options.developmentReceiptRoot,
      'results',
      `${receiptTask.taskId}.expected.json`,
    );
    const retainedResultBytes = await readFile(retainedResultPath);
    const retainedResult = JSON.parse(retainedResultBytes);
    retainedResult.metrics.functionalSuccess = false;
    await writeFile(retainedResultPath, prettyCanonicalJson(retainedResult));
    const tamperedReceiptResult = await auditReleaseGate(fixture.options);
    assert.equal(tamperedReceiptResult.ok, false);
    assert.equal(
      tamperedReceiptResult.errors.some((error) =>
        error.includes(`${receiptTask.taskId}: qualification receipt chain is invalid`),
      ),
      true,
    );
    await writeFile(retainedResultPath, retainedResultBytes);

    const retainedAttestationPath = join(
      fixture.options.developmentReceiptRoot,
      'attestations',
      `${receiptTask.taskId}.json`,
    );
    const retainedAttestationBytes = await readFile(retainedAttestationPath);
    const retainedAttestation = JSON.parse(retainedAttestationBytes);
    retainedAttestation.executionIdentity.actor = 'tampered-fixture-reviewer';
    await writeFile(retainedAttestationPath, prettyCanonicalJson(retainedAttestation));
    const tamperedAttestation = await auditReleaseGate(fixture.options);
    assert.equal(tamperedAttestation.ok, false);
    assert.equal(
      tamperedAttestation.errors.some((error) =>
        error.includes(`${receiptTask.taskId}: qualification receipt chain is invalid`),
      ),
      true,
    );
    await writeFile(retainedAttestationPath, retainedAttestationBytes);

    const retainedProvenancePath = join(
      fixture.options.developmentReceiptRoot,
      'provenance',
      `${receiptTask.taskId}.jsonl`,
    );
    const retainedProvenanceBytes = await readFile(retainedProvenancePath);
    await writeFile(
      retainedProvenancePath,
      Buffer.concat([retainedProvenanceBytes, Buffer.from('tampered provenance\n')]),
    );
    const tamperedProvenance = await auditReleaseGate(fixture.options);
    assert.equal(tamperedProvenance.ok, false);
    assert.equal(
      tamperedProvenance.errors.some((error) =>
        error.includes(`${receiptTask.taskId}: qualification receipt chain is invalid`),
      ),
      true,
    );
    await writeFile(retainedProvenancePath, retainedProvenanceBytes);

    const sealedTask = fixture.plan.tasks.find((task) => task.partition === 'qualification');
    const sealedTaskPath = join(fixture.options.qualificationTaskRoot, sealedTask.sourceRef);
    const sealedManifest = await readJsonFile(sealedTaskPath);
    sealedManifest.armInputs.treatment.context = 'Use the Decantr task context with an extra hidden fact.';
    await writeFile(sealedTaskPath, prettyCanonicalJson(sealedManifest));
    const parityLeak = await auditReleaseGate(fixture.options);
    assert.equal(parityLeak.ok, false);
    assert.equal(
      parityLeak.errors.some((error) => error.includes('treatment delivery context mismatch')),
      true,
    );
    sealedManifest.armInputs.treatment.context = 'Use the Decantr task context.';
    await writeFile(sealedTaskPath, prettyCanonicalJson(sealedManifest));

    const powerPilot = await readJsonFile(fixture.options.powerPilotPath);
    powerPilot.estimatedPower = 0.79;
    await writeFile(fixture.options.powerPilotPath, prettyCanonicalJson(powerPilot));
    const underpowered = await auditReleaseGate(fixture.options);
    assert.equal(underpowered.ok, false);
    assert.equal(
      underpowered.errors.some((error) => error.includes('must demonstrate at least 80% power')),
      true,
    );
    powerPilot.estimatedPower = 0.85;
    await writeFile(fixture.options.powerPilotPath, prettyCanonicalJson(powerPilot));

    const incompleteCoveragePlan = structuredClone(fixture.plan);
    const repositoryTasks = incompleteCoveragePlan.tasks.filter((task) => task.kind === 'repository');
    const source = repositoryTasks[0];
    const duplicate = repositoryTasks.find(
      (task) => task.taskId !== source.taskId && task.partition === source.partition,
    );
    source.repositoryId = duplicate.repositoryId;
    source.framework = duplicate.framework;
    source.projectPath = duplicate.projectPath;
    source.base = structuredClone(duplicate.base);
    for (const run of incompleteCoveragePlan.runs.filter((item) => item.taskId === source.taskId)) {
      run.repositoryId = source.repositoryId;
      run.framework = source.framework;
    }
    incompleteCoveragePlan.planSha256 = calculateRunPlanDigest(incompleteCoveragePlan);
    await writeFile(fixture.options.planPath, prettyCanonicalJson(incompleteCoveragePlan));
    const incompleteCoverage = await auditReleaseGate(fixture.options);
    assert.equal(incompleteCoverage.ok, false);
    assert.equal(
      incompleteCoverage.errors.some((error) =>
        error.includes(`repository task coverage must be exactly one for ${fixture.plan.tasks.find((task) => task.taskId === source.taskId).repositoryId}`),
      ),
      true,
    );
    await writeFile(fixture.options.planPath, prettyCanonicalJson(fixture.plan));

    const statistics = await readJsonFile(fixture.options.statisticsPath);
    const singleton = statistics.functionalNonInferiority.exploratoryByFramework.find(
      (item) => item.n === 1,
    );
    assert.ok(singleton, 'fixture must exercise a one-task exploratory framework stratum');
    singleton.powered = true;
    await writeFile(fixture.options.statisticsPath, prettyCanonicalJson(statistics));
    const overstatedFrameworkEvidence = await auditReleaseGate(fixture.options);
    assert.equal(overstatedFrameworkEvidence.ok, false);
    assert.equal(
      overstatedFrameworkEvidence.errors.some((error) =>
        error.includes('framework result is not visibly marked exploratory and unpowered'),
      ),
      true,
    );
    singleton.powered = false;
    await writeFile(fixture.options.statisticsPath, prettyCanonicalJson(statistics));

    const assignments = await readJsonFile(fixture.options.assignmentsPath);
    const originalModelId = assignments.assignments[0].candidates[0].modelId;
    assignments.assignments[0].candidates[0].modelId = 'forged-model-mapping';
    await writeFile(fixture.options.assignmentsPath, prettyCanonicalJson(assignments));
    const forgedMapping = await auditReleaseGate(fixture.options);
    assert.equal(forgedMapping.ok, false);
    assert.equal(
      forgedMapping.errors.some((error) =>
        error.includes('private candidate mapping differs from the frozen run plan'),
      ),
      true,
    );
    assignments.assignments[0].candidates[0].modelId = originalModelId;
    await writeFile(fixture.options.assignmentsPath, prettyCanonicalJson(assignments));

    const missingRun = fixture.plan.runs[0].runId;
    await unlink(join(fixture.recordRoot, 'run-index', `${missingRun}.json`));
    const failing = await auditReleaseGate(fixture.options);
    assert.equal(failing.ok, false);
    assert.equal(failing.errors.some((error) => error.includes(`${missingRun}: expected run record is missing`)), true);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

async function createReleaseFixture() {
  const root = await mkdtemp(join(tmpdir(), 'release-gate-test-'));
  const developmentTaskRoot = join(root, 'development-tasks');
  const developmentEvaluatorRoot = join(root, 'development-evaluators');
  const hiddenRoot = join(root, 'hidden');
  const hiddenTasks = join(hiddenRoot, 'tasks');
  const hiddenContracts = join(hiddenRoot, 'contracts');
  const hiddenOracles = join(hiddenRoot, 'oracles');
  const developmentContracts = join(developmentEvaluatorRoot, 'contracts');
  const developmentOracles = join(developmentEvaluatorRoot, 'oracles');
  const developmentSpecs = join(developmentEvaluatorRoot, 'specs');
  const hiddenSpecs = join(hiddenRoot, 'specs');
  const developmentReceiptRoot = join(developmentEvaluatorRoot, 'qualification-receipts');
  const qualificationReceiptRoot = join(hiddenRoot, 'qualification-receipts');
  const recordRoot = join(root, 'records');
  const developmentEnvironmentRoot = join(root, 'environments', 'development');
  const qualificationEnvironmentRoot = join(root, 'environments', 'qualification');
  const preparedEnvironmentRoot = join(root, 'environments', 'prepared');
  const runtimeMatrixPath = join(root, 'environments', 'runtime-matrix.json');
  await Promise.all([
    mkdir(developmentTaskRoot, { recursive: true }),
    mkdir(developmentContracts, { recursive: true }),
    mkdir(developmentOracles, { recursive: true }),
    mkdir(developmentSpecs, { recursive: true }),
    mkdir(join(developmentReceiptRoot, 'results'), { recursive: true }),
    mkdir(join(developmentReceiptRoot, 'attestations'), { recursive: true }),
    mkdir(join(developmentReceiptRoot, 'provenance'), { recursive: true }),
    mkdir(join(developmentReceiptRoot, 'prequalification'), { recursive: true }),
    mkdir(join(developmentReceiptRoot, 'qualification-input'), { recursive: true }),
    mkdir(hiddenContracts, { recursive: true }),
    mkdir(hiddenOracles, { recursive: true }),
    mkdir(hiddenSpecs, { recursive: true }),
    mkdir(join(qualificationReceiptRoot, 'results'), { recursive: true }),
    mkdir(join(qualificationReceiptRoot, 'attestations'), { recursive: true }),
    mkdir(join(qualificationReceiptRoot, 'provenance'), { recursive: true }),
    mkdir(join(qualificationReceiptRoot, 'prequalification'), { recursive: true }),
    mkdir(join(qualificationReceiptRoot, 'qualification-input'), { recursive: true }),
    mkdir(hiddenTasks, { recursive: true }),
    mkdir(join(developmentEnvironmentRoot, 'specs'), { recursive: true }),
    mkdir(join(qualificationEnvironmentRoot, 'specs'), { recursive: true }),
    mkdir(preparedEnvironmentRoot, { recursive: true }),
  ]);
  const corpus = await readJsonFile(corpusPath);
  const models = await readJsonFile(modelsPath);
  const protocol = await readJsonFile(protocolPath);
  const runtimeMatrix = makeRuntimeMatrix();
  await writeFile(runtimeMatrixPath, prettyCanonicalJson(runtimeMatrix));
  const runtimeMatrixFileSha256 = sha256(await readFile(runtimeMatrixPath));
  const qualificationControllerSha256 = await calculateQualificationControllerDigest();
  const corpusSha256 = sha256(await readFile(corpusPath));
  const developmentRepositories = corpus.repositories.filter((item) => item.partition === 'development');
  const qualificationRepositories = corpus.repositories.filter((item) => item.partition === 'qualification');
  const promotedRepository = developmentRepositories[0];
  const publicRepositoryTasks = developmentRepositories.filter(
    (repository) => repository.id !== promotedRepository.id,
  );
  const sealedRepositoryTasks = [...qualificationRepositories, promotedRepository];
  const qualificationTasks = [];
  const developmentEvaluators = [];
  const hiddenEvaluators = [];
  const preparedByTask = new Map();
  const addTask = async (repository, taskId, kind, partition) => {
    const contractRoot = partition === 'development' ? developmentContracts : hiddenContracts;
    const oracleRoot = partition === 'development' ? developmentOracles : hiddenOracles;
    const specRoot = partition === 'development' ? developmentSpecs : hiddenSpecs;
    const receiptRoot = partition === 'development' ? developmentReceiptRoot : qualificationReceiptRoot;
    const environmentRoot = partition === 'development'
      ? developmentEnvironmentRoot
      : qualificationEnvironmentRoot;
    const environmentSpec = makeEnvironmentSpec(repository, taskId, partition);
    await writeEnvironmentSpec(environmentRoot, environmentSpec);
    const environmentPath = join(environmentRoot, 'specs', `${taskId}.json`);
    const environmentBytes = await readFile(environmentPath);
    const environmentSpecSha256 = sha256(environmentBytes);
    const environmentSubstanceSha256 = taskEnvironmentSubstanceSha256(environmentSpec);
    const oracleSource = `export const taskId = ${JSON.stringify(taskId)};\n`;
    const oracleSourcePath = join(oracleRoot, `${taskId}.mjs`);
    await writeFile(oracleSourcePath, oracleSource);
    const oracleSourceSha256 = sha256(await readFile(oracleSourcePath));
    const oracleSourceRef = `oracles/${taskId}.mjs`;
    const commands = [
      {
        id: 'behavior',
        kind: 'functional',
        runtime: 'controller',
        executable: 'node',
        args: [`${'${EVALUATOR_ROOT}'}/${oracleSourceRef}`],
        cwd: '${WORKSPACE}',
        timeoutMs: 1000,
        required: true,
        resultFormat: 'json-stdout',
      },
      {
        id: 'build-check',
        kind: 'build',
        runtime: 'task',
        executable: 'pnpm',
        args: ['--version'],
        cwd: '${WORKSPACE}',
        timeoutMs: 1000,
        required: true,
        resultFormat: 'exit-code',
      },
    ];
    const spec = {
      schemaVersion: 'decantr-benchmark-evaluator-authoring-spec.v2',
      taskId,
      contractId: `evaluator-${taskId}`,
      oracle: {
        sourcePath: oracleSourceRef,
        candidateIndependent: true,
        decantrOutputAllowed: false,
      },
      commands,
      limits: { timeoutMs: 1000, maxRequests: 2, maxInputTokens: 1000, maxOutputTokens: 1000 },
      review: {
        status: 'approved',
        reviewedBy: 'fixture-evaluator-reviewer',
        reviewedAt: '2026-07-22T08:00:00.000Z',
        notes: 'Independently reviewed evaluator fixture.',
      },
    };
    const specPath = join(specRoot, `${taskId}.json`);
    await writeFile(specPath, prettyCanonicalJson(spec));
    const evaluatorSpecSha256 = sha256(await readFile(specPath));
    const contract = {
      schemaVersion: 'decantr-benchmark-evaluator-contract.v2',
      contractId: `evaluator-${taskId}`,
      taskId,
      oracle: {
        candidateIndependent: true,
        decantrOutputAllowed: false,
        sourceSha256: oracleSourceSha256,
      },
      commands,
    };
    const contractPath = join(contractRoot, `${taskId}.json`);
    await writeFile(contractPath, prettyCanonicalJson(contract));
    const contractSha256 = sha256(await readFile(contractPath));
    const expectedRevision = {
      commit: sha256(`${taskId}:expected-commit`).slice(0, 40),
      tree: sha256(`${taskId}:expected-tree`).slice(0, 40),
    };
    const candidateSha256 = sha256Canonical({
      taskId,
      partition,
      repositoryId: repository.id,
      base: repository.commit,
      expected: expectedRevision,
    });
    const taskBinding = {
      taskId,
      base: { commit: repository.commit, tree: repository.commit },
      candidateSha256,
      environmentSpecSha256,
      environmentSubstanceSha256,
      runtimeProfileId: environmentSpec.profile.id,
    };
    const prepared = makePreparedEnvironment(taskBinding, environmentSpec, runtimeMatrix);
    const preparedPath = join(preparedEnvironmentRoot, `${taskId}.json`);
    await writeFile(preparedPath, prettyCanonicalJson(prepared));
    const preparedFileSha256 = sha256(await readFile(preparedPath));
    preparedByTask.set(taskId, { attestation: prepared, fileSha256: preparedFileSha256 });
    const results = {
      base: makeQualificationResult(taskId, contractSha256, false),
      expected: makeQualificationResult(taskId, contractSha256, true),
    };
    const resultBindings = {};
    for (const role of ['base', 'expected']) {
      const resultPath = join(receiptRoot, 'results', `${taskId}.${role}.json`);
      await writeFile(resultPath, prettyCanonicalJson(results[role]));
      resultBindings[role] = {
        canonicalSha256: sha256Canonical(results[role]),
        fileSha256: sha256(await readFile(resultPath)),
      };
    }
    const prequalificationBundle = {
      schemaVersion: 'decantr-benchmark-prequalification-task.v2',
      program: 'decantr-3.10-ui-change-control-proof',
      taskId,
      partition,
      candidateSetSha256: sha256Canonical({ partition, candidateSet: 'fixture' }),
      candidateSha256,
      corpusSha256,
      evaluatorSpecSha256,
      oracleSourceSha256,
      evaluatorContractSha256: contractSha256,
      qualificationControllerSha256,
      environmentSpecSha256,
      environmentSubstanceSha256,
      runtimeMatrixFileSha256,
      runtimeMatrixSha256: runtimeMatrix.matrixSha256,
      runtimeProfileId: environmentSpec.profile.id,
      benchmarkImageDigest: runtimeMatrix.profiles[0].benchmarkImage.digest,
      revisions: {
        base: { commit: repository.commit, tree: repository.commit },
        expected: expectedRevision,
      },
      sealedAt: '2026-07-22T08:30:00.000Z',
    };
    prequalificationBundle.bundleSha256 = calculatePrequalificationBundleDigest(
      prequalificationBundle,
    );
    const prequalificationBundlePath = join(
      receiptRoot,
      'prequalification',
      `${taskId}.json`,
    );
    await writeFile(prequalificationBundlePath, prettyCanonicalJson(prequalificationBundle));
    const prequalificationBundleFileSha256 = sha256(await readFile(prequalificationBundlePath));
    const prequalificationBundleSha256 = prequalificationBundle.bundleSha256;
    const qualificationCandidate = {
      taskId,
      partition,
      base: { commit: repository.commit, tree: repository.commit },
      expected: expectedRevision,
    };
    const qualificationInput = makeFixtureQualificationInput(qualificationCandidate);
    await Promise.all([
      writeFile(
        join(receiptRoot, 'qualification-input', `${taskId}.request.json`),
        qualificationInput.requestBytes,
      ),
      writeFile(
        join(receiptRoot, 'qualification-input', `${taskId}.manifest.json`),
        qualificationInput.manifestBytes,
      ),
    ]);
    const executionAttestation = await makeFixtureExecutionAttestation({
      candidate: qualificationCandidate,
      candidateSha256,
      prequalificationBundleFileSha256,
      prequalificationBundleSha256,
      contractSha256,
      sourcePath: oracleSourceRef,
      sourceSha256: oracleSourceSha256,
      sourceBytes: Buffer.byteLength(oracleSource),
      environmentSpecSha256,
      environmentSubstanceSha256,
      runtimeMatrixFileSha256,
      runtimeMatrixSha256: runtimeMatrix.matrixSha256,
      profile: runtimeMatrix.profiles[0],
      resultBindings,
      results,
      executionId: taskId,
      startedAt: '2026-07-22T09:00:00.000Z',
      preparedAt: '2026-07-22T09:30:00.000Z',
      qualifiedAt: '2026-07-22T10:00:00.000Z',
      qualificationInput,
    });
    const executionAttestationPath = join(receiptRoot, 'attestations', `${taskId}.json`);
    await writeFile(executionAttestationPath, prettyCanonicalJson(executionAttestation));
    const executionAttestationFileSha256 = sha256(await readFile(executionAttestationPath));
    const provenancePolicy = qualificationProvenancePolicy(partition, {
      sourceDigest: FIXTURE_RUNNER_COMMIT,
      sourceRef: FIXTURE_SOURCE_REF,
    });
    const provenancePath = join(
      receiptRoot,
      'provenance',
      qualificationProvenanceBundleFilename(taskId, provenancePolicy.provider),
    );
    await writeFile(
      provenancePath,
      `${canonicalJson({ taskId, attestation: executionAttestation.attestationSha256 })}\n`,
    );
    const provenanceBundleFileSha256 = sha256(await readFile(provenancePath));
    const receipt = {
      schemaVersion: 'decantr-benchmark-evaluator-qualification-task-receipt.v3',
      program: 'decantr-3.10-ui-change-control-proof',
      taskId,
      partition,
      qualified: true,
      qualifiedAt: '2026-07-22T10:00:00.000Z',
      executionAssurance: 'github-host-container-attested',
      candidateSetSha256: sha256Canonical({ partition, candidateSet: 'fixture' }),
      candidateSha256,
      corpusSha256,
      prequalificationBundleFileSha256,
      prequalificationBundleSha256,
      evaluatorSpecSha256,
      oracleSourceSha256,
      evaluatorContractSha256: contractSha256,
      qualificationControllerSha256,
      environmentSpecSha256,
      environmentSubstanceSha256,
      runtimeMatrixFileSha256,
      runtimeMatrixSha256: runtimeMatrix.matrixSha256,
      runtimeProfileId: environmentSpec.profile.id,
      benchmarkImageDigest: runtimeMatrix.profiles[0].benchmarkImage.digest,
      networkMode: 'none',
      execution: {
        attestationFileSha256: executionAttestationFileSha256,
        attestationSha256: executionAttestation.attestationSha256,
        controllerSha256: executionAttestation.bindings.controller.closureSha256,
        evaluatorSourceClosureSha256:
          executionAttestation.bindings.evaluator.sourceClosureSha256,
        inputRequestFileSha256: qualificationInput.binding.requestFileSha256,
        inputRequestSha256: qualificationInput.binding.requestSha256,
        inputManifestFileSha256: qualificationInput.binding.manifestFileSha256,
        inputManifestSha256: qualificationInput.binding.manifestSha256,
        runnerRepositoryCommit: FIXTURE_RUNNER_COMMIT,
        provenanceBundleFileSha256,
        provenanceVerificationSha256: FIXTURE_PROVENANCE_VERIFICATION_SHA256,
        provenanceProvider: provenancePolicy.provider,
        repository: provenancePolicy.repository,
        signerWorkflow: provenancePolicy.signerWorkflow,
        sourceRef: provenancePolicy.sourceRef,
        eventName: provenancePolicy.eventName,
        predicateType: provenancePolicy.predicateType,
        certificateIdentity: provenancePolicy.certificateIdentity,
        certificateOidcIssuer: provenancePolicy.certificateOidcIssuer,
        denySelfHostedRunners: provenancePolicy.denySelfHostedRunners,
      },
      baseResultSha256: resultBindings.base.canonicalSha256,
      baseResultFileSha256: resultBindings.base.fileSha256,
      expectedResultSha256: resultBindings.expected.canonicalSha256,
      expectedResultFileSha256: resultBindings.expected.fileSha256,
    };
    receipt.receiptSha256 = calculateQualificationReceiptDigest(receipt);
    const receiptPath = join(receiptRoot, `${taskId}.json`);
    await writeFile(receiptPath, prettyCanonicalJson(receipt));
    const receiptFileSha256 = sha256(await readFile(receiptPath));
    const qualificationExecutionBindings = selectQualificationExecutionBindings(receipt.execution);
    const taskManifest = makeTask(repository, taskId, kind, partition, {
      candidateSha256,
      evaluatorSpecSha256,
      oracleSourceSha256,
      contractSha256,
      qualificationControllerSha256,
      qualificationReceiptFileSha256: receiptFileSha256,
      qualificationReceiptSha256: receipt.receiptSha256,
      ...qualificationExecutionBindings,
      environmentSpec,
      environmentSpecSha256,
      environmentSubstanceSha256,
      runtimeMatrixFileSha256,
      runtimeMatrixSha256: runtimeMatrix.matrixSha256,
      benchmarkImageDigest: runtimeMatrix.profiles[0].benchmarkImage.digest,
    });
    const taskManifestPath = partition === 'development'
      ? join(developmentTaskRoot, `${taskId}.json`)
      : join(hiddenTasks, `${taskId}.json`);
    await writeFile(taskManifestPath, prettyCanonicalJson(taskManifest));
    const manifestSha256 = sha256(await readFile(taskManifestPath));
    const evaluatorEntry = {
      taskId,
      contractPath: `contracts/${taskId}.json`,
      contractSha256,
      oracleSourcePath: oracleSourceRef,
      oracleSourceSha256,
      qualificationReceiptPath: `qualification-receipts/${taskId}.json`,
      qualificationControllerSha256,
      qualificationReceiptFileSha256: receiptFileSha256,
      qualificationReceiptSha256: receipt.receiptSha256,
      ...qualificationExecutionBindings,
    };
    if (partition === 'development') {
      developmentEvaluators.push({
        ...evaluatorEntry,
        manifestSha256,
        deliverySpecSha256: sha256Canonical({ taskId, delivery: true }),
        environmentSpecSha256,
      });
      return;
    }
    qualificationTasks.push({
      taskId,
      kind,
      repositoryId: repository.id,
      framework: repository.framework,
      projectPath: repository.projectPath,
      corpusProjectPath: repository.projectPath,
      corpusCommit: repository.commit,
      base: { commit: repository.commit, tree: repository.commit },
      candidateSha256,
      manifestSha256,
      evaluatorContractSha256: contractSha256,
      evaluatorSpecSha256,
      oracleSourceSha256,
      qualificationControllerSha256,
      qualificationReceiptFileSha256: receiptFileSha256,
      qualificationReceiptSha256: receipt.receiptSha256,
      ...qualificationExecutionBindings,
      informationEntitlementSha256: taskManifest.informationEntitlementSha256,
      environmentSpecSha256: taskManifest.environment.specSha256,
      environmentSubstanceSha256: taskManifest.environment.substanceSha256,
      runtimeProfileId: taskManifest.environment.runtimeProfileId,
      runtimeMatrixFileSha256,
      runtimeMatrixSha256: runtimeMatrix.matrixSha256,
      benchmarkImageDigest: runtimeMatrix.profiles[0].benchmarkImage.digest,
      hiddenRef: `${taskId}.json`,
    });
    hiddenEvaluators.push(evaluatorEntry);
  };
  for (const repository of publicRepositoryTasks) {
    await addTask(repository, `repository-${repository.id}`, 'repository', 'development');
  }
  for (let index = 0; index < 7; index += 1) {
    const repository = developmentRepositories[index % developmentRepositories.length];
    await addTask(
      repository,
      `adversarial-${String(index + 1).padStart(2, '0')}`,
      'adversarial',
      'development',
    );
  }
  for (const repository of sealedRepositoryTasks) {
    await addTask(repository, `repository-${repository.id}`, 'repository', 'qualification');
  }
  for (let index = 0; index < 5; index += 1) {
    await addTask(
      developmentRepositories[index],
      `qualification-adversarial-${String(index + 1).padStart(2, '0')}`,
      'adversarial',
      'qualification',
    );
  }
  await writeFile(
    join(developmentEvaluatorRoot, 'manifest.json'),
    prettyCanonicalJson({
      schemaVersion: 'decantr-benchmark-development-evaluator-manifest.v2',
      program: 'decantr-3.10-ui-change-control-proof',
      sealedAt: '2026-07-22T12:00:00.000Z',
      bundleSha256: sha256Canonical(developmentEvaluators),
      evaluators: developmentEvaluators,
    }),
  );
  const qualificationIndex = {
    schemaVersion: 'decantr-benchmark-qualification-task-index.v2',
    program: 'decantr-3.10-ui-change-control-proof',
    sealedAt: '2026-07-22T12:00:00.000Z',
    bundleSha256: sha256Canonical(qualificationTasks),
    tasks: qualificationTasks,
  };
  const qualificationIndexPath = join(root, 'qualification-index.json');
  await writeFile(qualificationIndexPath, prettyCanonicalJson(qualificationIndex));
  const plan = await buildRunPlan({
    seed: protocol.design.randomizationSeed,
    corpusPath,
    modelsPath,
    protocolPath,
    tasksDirectory: developmentTaskRoot,
    qualificationIndexPath,
    runtimeMatrixPath,
  });
  const planPath = join(root, 'run-plan.json');
  await writeFile(planPath, prettyCanonicalJson(plan));

  const tarballPath = join(root, 'candidate.tgz');
  await writeFile(tarballPath, 'frozen candidate tarball bytes');
  const candidateManifestPath = join(root, 'candidate.json');
  await writeFile(
    candidateManifestPath,
    prettyCanonicalJson({
      schemaVersion: 'decantr-benchmark-candidate.v1',
      version: '3.10.0',
      source: {
        repository: 'https://github.com/decantr-ai/decantr',
        commit: 'a'.repeat(40),
        tree: 'b'.repeat(40),
        clean: true,
        dirtyStatusSha256: sha256(''),
        trackedDiffSha256: sha256(''),
      },
      tarballs: [{ package: '@decantr/cli', path: 'candidate.tgz', sha256: sha256(await readFile(tarballPath)) }],
      contextProvider: {
        type: 'decantr-cli-task-v1',
        package: '@decantr/cli',
        entrypoint: 'node_modules/@decantr/cli/dist/bin.js',
        outputSchemaVersion: 'ui-surface-task-context.v1',
        runtimeLock: { path: 'package-lock.json', sha256: sha256Canonical({ lock: 'fixture' }) },
        runtimeFiles: ['package-lock.json', 'node_modules/@decantr'],
        runtimeTreeSha256: sha256Canonical({ runtime: 'fixture' }),
      },
    }),
  );
  const candidate = await assertCandidateManifest(await readJsonFile(candidateManifestPath), candidateManifestPath);
  const [agentController, evaluatorController] = await Promise.all([
    calculateStageControllerClosure('agent', {
      root: resolve(benchmarkDirectory, '..', '..'),
    }),
    calculateStageControllerClosure('evaluator', {
      root: resolve(benchmarkDirectory, '..', '..'),
    }),
  ]);
  const controllerSha256 = agentController.controllerSha256;
  const developmentTaskCount = plan.tasks.filter(
    (task) => task.partition === 'development',
  ).length;
  const preliminaryBudgetApprovalPath = join(
    root,
    'preliminary-budget-approval.json',
  );
  const preliminaryBudgetApproval = {
    schemaVersion: 'decantr-benchmark-budget-approval.v1',
    approvalId: 'approval-fixture',
    program: 'decantr-3.10-ui-change-control-proof',
    approvedBy: 'Fixture Maintainer',
    approvedAt: '2026-07-22T09:00:00.000Z',
    expiresAt: '2099-07-22T10:00:00.000Z',
    maximumSpendUsd: 4160,
    runPlanSha256: plan.planSha256,
    candidateTarballSetSha256: candidate.tarballSetSha256,
    modelIds: models.models.map((model) => model.id),
    authorizationStatement: AUTHORIZATION_STATEMENT,
  };
  await writeCanonicalFile(
    preliminaryBudgetApprovalPath,
    preliminaryBudgetApproval,
  );
  const preliminaryBudgetApprovalRetained =
    await retainExactContentAddressed(
      recordRoot,
      'budget-approvals',
      preliminaryBudgetApprovalPath,
    );
  let powerPilotPath;
  let powerPilotRetained;
  let budgetApprovalPath;
  let budgetApprovalRetained;
  const recordBindings = [];
  const qualificationRecordBindings = [];
  const developmentRecordBindings = [];
  const recordByRun = new Map();
  for (const partition of ['development', 'qualification']) {
    if (partition === 'qualification') {
      const frozenDevelopmentRecordSetSha256 = sha256Canonical(
        [...developmentRecordBindings].sort((left, right) =>
          left.runId.localeCompare(right.runId),
        ),
      );
      powerPilotPath = join(root, 'power-pilot.json');
      const powerPilot = {
        schemaVersion: 'decantr-benchmark-power-pilot.v1',
        program: 'decantr-3.10-ui-change-control-proof',
        frozenAt: '2026-07-22T11:00:00.000Z',
        qualificationExecutionOpenedAt: '2026-07-22T11:30:00.000Z',
        runPlanSha256: plan.planSha256,
        candidateTarballSetSha256: candidate.tarballSetSha256,
        developmentRunRecordSetSha256:
          frozenDevelopmentRecordSetSha256,
        analysisCodeSha256: sha256Canonical({
          powerAnalysis: 'fixture',
        }),
        analysisSeed: 'power-analysis-seed-0001',
        developmentTaskCount,
        targetEffectPoints: 5,
        alpha: 0.05,
        estimatedPower: 0.85,
        method:
          'Deterministic paired bootstrap simulation over the frozen development pilot.',
      };
      await writeCanonicalFile(powerPilotPath, powerPilot);
      powerPilotRetained = await retainExactContentAddressed(
        recordRoot,
        'power-pilots',
        powerPilotPath,
      );
      budgetApprovalPath = join(root, 'budget-approval.json');
      const budgetApproval = {
        schemaVersion: 'decantr-benchmark-budget-approval.v1',
        approvalId: 'approval-fixture',
        program: 'decantr-3.10-ui-change-control-proof',
        approvedBy: 'Fixture Maintainer',
        approvedAt: '2026-07-22T11:15:00.000Z',
        expiresAt: '2099-07-22T10:00:00.000Z',
        maximumSpendUsd: 4160,
        runPlanSha256: plan.planSha256,
        candidateTarballSetSha256: candidate.tarballSetSha256,
        modelIds: models.models.map((model) => model.id),
        powerPilotSha256: powerPilotRetained.digest,
        authorizationStatement: AUTHORIZATION_STATEMENT,
      };
      await writeCanonicalFile(budgetApprovalPath, budgetApproval);
      budgetApprovalRetained = await retainExactContentAddressed(
        recordRoot,
        'budget-approvals',
        budgetApprovalPath,
      );
    }
    for (const run of plan.runs.filter(
      (item) => item.partition === partition,
    )) {
    const task = plan.tasks.find((item) => item.taskId === run.taskId);
    const prepared = preparedByTask.get(run.taskId);
    const model = models.models.find((item) => item.id === run.modelId);
    const authorizationSourcePath = join(
      root,
      'run-authorizations',
      `${run.runId}.json`,
    );
    const authorization = await buildRunAuthorization({
      outputPath: authorizationSourcePath,
      paid: true,
      runId: run.runId,
      partition: run.partition,
      modelId: run.modelId,
      runPlanSha256: plan.planSha256,
      candidateManifestSha256: candidate.manifestSha256,
      candidateTarballSetSha256: candidate.tarballSetSha256,
      maxRunCostUsd: model.maxRunCostUsd,
      protocolMaximumUsd: protocol.budget.maximumModelSpendUsd,
      developmentTaskCount,
      budgetApprovalPath:
        partition === 'development'
          ? preliminaryBudgetApprovalPath
          : budgetApprovalPath,
      powerPilotPath:
        partition === 'qualification' ? powerPilotPath : undefined,
      now:
        partition === 'development'
          ? '2026-07-22T10:00:00.000Z'
          : '2026-07-22T12:00:00.000Z',
    });
    const authorizationRetained = await retainExactContentAddressed(
      recordRoot,
      'run-authorizations',
      authorizationSourcePath,
    );
    const runBudgetApprovalRetained =
      partition === 'development'
        ? preliminaryBudgetApprovalRetained
        : budgetApprovalRetained;
    const runPowerPilotRetained =
      partition === 'qualification' ? powerPilotRetained : null;
    const outputTokens = run.arm === 'treatment' ? 10 : 20;
    const sharedTaskInput = fixtureTaskInput();
    const armDeliveryDocument = {
      schemaVersion: 'decantr-benchmark-arm-delivery.v1',
      arm: run.arm,
      sharedTaskInputSha256: sha256Canonical(sharedTaskInput),
      sharedTaskInput,
      instructions: [
        run.arm === 'treatment'
          ? 'Use the candidate-generated bounded task context.'
          : 'Inspect repository authority directly from the shared task facts.',
      ],
      productContext:
        run.arm === 'treatment'
          ? {
              schemaVersion: 'ui-surface-task-context.v1',
              target: sharedTaskInput.target.selector,
              status: 'ready',
              read: ['src/view.tsx'],
            }
          : null,
    };
    const armDelivery = await writeContentAddressed(recordRoot, 'arm-deliveries', armDeliveryDocument);
    const evaluator = await writeContentAddressed(recordRoot, 'evaluator-results', {
      schemaVersion: 'decantr-benchmark-evaluator-result.v1',
      runId: run.runId,
      taskId: run.taskId,
      contractSha256: task.evaluatorContractSha256,
      status: 'passed',
      metrics: { functionalSuccess: true, buildPassed: true, governanceViolations: run.arm === 'treatment' ? 1 : 2 },
    });
    const adapterRequest = await writeContentAddressed(recordRoot, 'adapter-requests', {
      schemaVersion: 'decantr-benchmark-adapter-request.v1',
      runId: run.runId,
      taskId: run.taskId,
      modelId: run.modelId,
      provider: run.provider,
      requestedModel: run.requestedModel,
      arm: run.arm,
      repetition: run.repetition,
      context: canonicalJson(armDeliveryDocument),
      informationEntitlement: { policy: run.taskId, taskInput: sharedTaskInput },
      bindings: {
        authorizationSha256: authorizationRetained.digest,
        planSha256: plan.planSha256,
        candidateManifestSha256: candidate.manifestSha256,
        candidateTarballSetSha256: candidate.tarballSetSha256,
        taskManifestSha256: run.taskManifestSha256,
        informationEntitlementSha256: task.informationEntitlementSha256,
        environmentSpecSha256: task.environmentSpecSha256,
        environmentSubstanceSha256: task.environmentSubstanceSha256,
        runtimeMatrixSha256: runtimeMatrix.matrixSha256,
        preparedEnvironmentAttestationSha256: prepared.fileSha256,
        deliverySha256: armDelivery.digest,
        environmentSha256: prepared.attestation.environmentSha256,
        agentControllerSha256: controllerSha256,
        agentImageDigest: runtimeMatrix.profiles.find(
          (profile) => profile.id === task.runtimeProfileId,
        ).agentImage.digest,
        baseCommit: task.base.commit,
        baseTree: task.base.tree,
      },
    });
    const adapterResponse = await writeContentAddressed(recordRoot, 'adapter-responses', {
      schemaVersion: 'decantr-benchmark-adapter-response.v1',
      provider: run.provider,
      requestedModel: run.requestedModel,
      returnedModel: run.requestedModel,
      status: 'completed',
      usage: { inputTokens: 100, outputTokens, cachedInputTokens: 0, requests: 1, costUsd: 0.5 },
    });
    const trajectoryEvent = await writeContentAddressed(recordRoot, 'trajectory-events', {
      schemaVersion: 'decantr-benchmark-trajectory-event.v1',
      runId: run.runId,
      sequence: 0,
      source: 'runner',
      type: 'fixture.completed',
      recordedAt:
        run.partition === 'development'
          ? '2026-07-22T10:00:00.000Z'
          : '2026-07-22T12:00:00.000Z',
      payload: {},
    });
    const trajectory = await writeContentAddressed(recordRoot, 'trajectory-manifests', {
      schemaVersion: 'decantr-benchmark-trajectory-manifest.v1',
      runId: run.runId,
      complete: true,
      armDeliverySha256: armDelivery.digest,
      adapterRequestSha256: adapterRequest.digest,
      adapterResponseSha256: adapterResponse.digest,
      events: [{ sequence: 0, sha256: trajectoryEvent.digest }],
    });
    const workspaceChange = await writeContentAddressed(recordRoot, 'workspace-changes', {
      schemaVersion: 'decantr-benchmark-workspace-change.v1',
      diff: `fixture diff for ${run.runId}`,
      changedPaths: ['src/fixture.ts'],
      untracked: [],
    });
    const record = {
      schemaVersion: 'decantr-benchmark-run-record.v3',
      runId: run.runId,
      taskId: run.taskId,
      partition: run.partition,
      repositoryId: run.repositoryId,
      framework: run.framework,
      arm: run.arm,
      repetition: run.repetition,
      status: 'completed',
      execution: {
        assurance: 'github-host-split-stage-attested',
        productionEligible: true,
        agentEvaluatorStageSeparation: true,
        privateOracleAbsentDuringAgentStage: true,
        signedExternalProvenance: true,
      },
      bindings: {
        authorizationSha256: authorizationRetained.digest,
        runPlanSha256: plan.planSha256,
        candidateManifestSha256: candidate.manifestSha256,
        candidateTarballSetSha256: candidate.tarballSetSha256,
        taskManifestSha256: run.taskManifestSha256,
        evaluatorContractSha256: task.evaluatorContractSha256,
        informationEntitlementSha256: task.informationEntitlementSha256,
        environmentSpecSha256: task.environmentSpecSha256,
        environmentSubstanceSha256: task.environmentSubstanceSha256,
        qualificationControllerSha256: task.qualificationControllerSha256,
        qualificationReceiptFileSha256: task.qualificationReceiptFileSha256,
        qualificationReceiptSha256: task.qualificationReceiptSha256,
        ...selectQualificationExecutionBindings(task),
        runtimeMatrixFileSha256: task.runtimeMatrixFileSha256,
        runtimeMatrixSha256: runtimeMatrix.matrixSha256,
        benchmarkImageDigest: task.benchmarkImageDigest,
        agentImageDigest: runtimeMatrix.profiles.find(
          (profile) => profile.id === task.runtimeProfileId,
        ).agentImage.digest,
        preparedEnvironmentAttestationSha256: prepared.fileSha256,
        deliverySha256: armDelivery.digest,
        environmentSha256: prepared.attestation.environmentSha256,
        agentControllerSha256: controllerSha256,
        evaluatorControllerSha256: evaluatorController.controllerSha256,
      },
      model: {
        modelId: run.modelId,
        provider: run.provider,
        requestedModel: run.requestedModel,
        returnedModel: run.requestedModel,
        identityMatched: true,
      },
      workspace: {
        baseCommit: task.base.commit,
        baseTree: task.base.tree,
        beforeClean: true,
        dependencyTreeBeforeVerified: true,
        dependencyTreeAfterVerified: true,
        afterTree: task.base.tree,
        diffSha256: workspaceChange.digest,
      },
      budget: {
        paid: true,
        reservedUsd: model.maxRunCostUsd,
        actualUsd: 0.5,
        approvalId: 'approval-fixture',
      },
      usage: { inputTokens: 100, outputTokens, cachedInputTokens: 0, requests: 1, durationMs: 1 },
      trajectoryManifestSha256: trajectory.digest,
      evaluatorResultSha256: evaluator.digest,
      failure: null,
    };
    record.provenance = await writeFixtureStageChain({
      recordRoot,
      record,
      run,
      task,
      runtimeMatrix,
      adapterRequest,
      evaluator,
      trajectory,
      workspaceChange,
      authorizationRetained,
      budgetApprovalRetained: runBudgetApprovalRetained,
      powerPilotRetained: runPowerPilotRetained,
    });
    const artifact = await writeContentAddressed(recordRoot, 'run-records', record);
    await writeCanonicalFile(join(recordRoot, 'run-index', `${run.runId}.json`), {
      runId: run.runId,
      recordSha256: artifact.digest,
    });
    const binding = { runId: run.runId, recordSha256: artifact.digest };
    recordBindings.push(binding);
    if (run.partition === 'qualification') qualificationRecordBindings.push(binding);
    else developmentRecordBindings.push(binding);
    recordByRun.set(run.runId, artifact.digest);
    }
  }
  const qualificationRecordSetSha256 = sha256Canonical(
    qualificationRecordBindings.sort((left, right) => left.runId.localeCompare(right.runId)),
  );
  const developmentRecordSetSha256 = sha256Canonical(
    developmentRecordBindings.sort((left, right) => left.runId.localeCompare(right.runId)),
  );

  const assignments = {
    schemaVersion: 'decantr-benchmark-review-assignments.v1',
    seed: expectedReviewSeed(plan.seed),
    runPlanSha256: plan.planSha256,
    recordSetSha256: qualificationRecordSetSha256,
    assignments: [],
  };
  const groups = new Map();
  for (const run of plan.runs.filter((item) => item.partition === 'qualification')) {
    const key = `${run.taskId}:${run.modelId}:${run.repetition}`;
    const items = groups.get(key) ?? [];
    items.push(run);
    groups.set(key, items);
  }
  for (const [key, runs] of groups) {
    const control = runs.find((run) => run.arm === 'control');
    const treatment = runs.find((run) => run.arm === 'treatment');
    assignments.assignments.push({
      assignmentId: `assignment-${sha256(key).slice(0, 20)}`,
      taskId: control.taskId,
      framework: control.framework,
      candidates: [
        { label: 'A', artifactId: 'a', runId: control.runId, arm: 'control', modelId: control.modelId, repetition: control.repetition, recordSha256: recordByRun.get(control.runId) },
        { label: 'B', artifactId: 'b', runId: treatment.runId, arm: 'treatment', modelId: treatment.modelId, repetition: treatment.repetition, recordSha256: recordByRun.get(treatment.runId) },
      ],
    });
  }
  const assignmentsPath = join(root, 'assignments.json');
  await writeFile(assignmentsPath, prettyCanonicalJson(assignments));
  const assignmentsSha256 = sha256(await readFile(assignmentsPath));
  const reviews = {
    schemaVersion: 'decantr-benchmark-review-workbook.v1',
    blinded: true,
    assignmentsSha256,
    reviewers: ['reviewer-one', 'reviewer-two'],
    reviews: assignments.assignments.flatMap((assignment) => [
      { assignmentId: assignment.assignmentId, reviewerId: 'reviewer-one', scores: { A: 70, B: 80 }, preference: 'B', completedAt: '2026-07-22T12:00:00.000Z' },
      { assignmentId: assignment.assignmentId, reviewerId: 'reviewer-two', scores: { A: 70, B: 80 }, preference: 'B', completedAt: '2026-07-22T12:01:00.000Z' },
    ]),
    adjudications: [],
  };
  const reviewWorkbookPath = join(root, 'reviews.json');
  await writeFile(reviewWorkbookPath, prettyCanonicalJson(reviews));
  const reviewWorkbookSha256 = sha256(await readFile(reviewWorkbookPath));
  const qualificationIndexSha256 = sha256(await readFile(qualificationIndexPath));
  const gates = {
    evidenceComplete: true,
    modelLift: true,
    governanceReduction: true,
    governanceCi: true,
    functionalNonInferiority: true,
    blindPreference: true,
    medianOverhead: true,
    tailOverhead: true,
    failureVisibility: true,
  };
  const statistics = {
    schemaVersion: 'decantr-benchmark-statistics.v1',
    analysisSeed: expectedAnalysisSeed(plan.seed),
    confidenceLevel: 0.95,
    bindings: {
      analysisCodeSha256: sha256(
        await readFile(join(benchmarkDirectory, 'statistics', 'analyze.mjs')),
      ),
      runPlanSha256: plan.planSha256,
      protocolSha256: sha256(await readFile(protocolPath)),
      qualificationTaskIndexSha256: qualificationIndexSha256,
      runRecordSetSha256: qualificationRecordSetSha256,
      assignmentsSha256,
      reviewWorkbookSha256,
    },
    denominators: {
      sealedQualificationTasks: qualificationTasks.length,
      expectedRuns: qualificationRecordBindings.length,
      observedRuns: qualificationRecordBindings.length,
      failedRuns: 0,
      reviewAssignments: assignments.assignments.length,
      excludedReviewAssignments: 0,
      plannedPreferenceUnits: 32,
      minimumDecisivePreferences: 26,
      decisivePreferences: 32,
      ties: 0,
    },
    modelLift: models.models.map((model) => ({
      modelId: model.id,
      estimate: 10,
      confidenceInterval: { lower: 8, upper: 12 },
      n: qualificationTasks.length,
    })),
    governanceReduction: models.models.map((model) => ({
      modelId: model.id,
      estimate: 50,
      confidenceInterval: { lower: 25, upper: 75 },
      n: qualificationTasks.length,
    })),
    functionalNonInferiority: {
      margin: -0.05,
      confirmatoryScope: 'overall-within-model',
      overallByModel: models.models.map((model) => ({
        modelId: model.id,
        estimate: 0,
        confidenceInterval: { lower: 0, upper: 0 },
        n: qualificationTasks.length,
      })),
      exploratoryByFramework: models.models.flatMap((model) =>
        [...new Set(qualificationTasks.map((task) => task.framework))].sort().map((framework) => ({
          modelId: model.id,
          framework,
          estimate: 0,
          confidenceInterval: { lower: 0, upper: 0 },
          n: qualificationTasks.filter((task) => task.framework === framework).length,
          powered: false,
          gateEligible: false,
          interpretation: 'exploratory-unpowered',
        })),
      ),
    },
    blindPreference: {
      analysisUnit: 'qualification-task-model',
      population: 'sealed-qualification-only',
      repetitionAggregation: 'strict-majority-of-planned-repetitions',
      tiePolicy: 'non-majority-task-model-units-are-ties-excluded-from-binomial-denominator',
      plannedUnits: 32,
      minimumDecisiveUnits: 26,
      pointEstimateMinimum: 0.6,
      confidenceMethod: 'two-sided-wilson-score',
      wilsonLowerBoundMustExceed: 0.5,
      treatmentPreferred: 32,
      controlPreferred: 0,
      estimate: 1,
      confidenceInterval: { lower: 0.9, upper: 1 },
      n: 32,
      ties: 0,
    },
    overhead: {
      tokens: { medianPercent: 0, p95Percent: 0, undefinedPairs: 0 },
      cost: { medianPercent: 0, p95Percent: 0, undefinedPairs: 0 },
    },
    failures: [],
    gates,
    allGatesPassed: true,
    claimAuthorization: {
      outcome: 'pass',
      valueClaim: 'release-audit-required',
      mixedValueClaim: 'no-value-claim',
      scopedHypothesesPredeclaredAndPowered: false,
    },
  };
  const statisticsPath = join(root, 'statistics.json');
  await writeFile(statisticsPath, prettyCanonicalJson(statistics));
  const statisticsSha256 = sha256(await readFile(statisticsPath));
  const hiddenEvaluatorManifestPath = join(hiddenRoot, 'manifest.json');
  await writeFile(
    hiddenEvaluatorManifestPath,
    prettyCanonicalJson({
      schemaVersion: 'decantr-benchmark-hidden-evaluator-manifest.v2',
      qualificationTaskIndexSha256: qualificationIndexSha256,
      evaluators: hiddenEvaluators,
    }),
  );
  const claimsPath = join(root, 'claims.json');
  await writeFile(
    claimsPath,
    prettyCanonicalJson({
      schemaVersion: 'decantr-benchmark-claims.v1',
      statisticsSha256,
      candidateTarballSetSha256: candidate.tarballSetSha256,
      claims: [
        {
          id: 'primary-measured-claim',
          claimType: 'measured-improvement',
          statement: protocol.productClaim,
          taskPopulation: 'sealed-qualification-2026-07-22',
          models: models.models.map((model) => model.id),
          frameworks: [...new Set(qualificationTasks.map((task) => task.framework))],
          limitations: ['Repository identities were observed during Day-0; task oracles remained sealed.'],
          gateIds: Object.keys(gates),
        },
      ],
    }),
  );
  return {
    root,
    plan,
    recordRoot,
    options: {
      corpusPath,
      modelsPath,
      protocolPath,
      runtimeMatrixPath,
      developmentTaskRoot,
      qualificationTaskRoot: hiddenTasks,
      developmentReceiptRoot,
      qualificationReceiptRoot,
      developmentEnvironmentRoot,
      qualificationEnvironmentRoot,
      preparedEnvironmentRoot,
      qualificationIndexPath,
      planPath,
      candidateManifestPath,
      recordRoot,
      hiddenEvaluatorManifestPath,
      assignmentsPath,
      reviewWorkbookPath,
      statisticsPath,
      powerPilotPath,
      budgetApprovalPath,
      claimsPath,
      outputPath: join(root, 'audit.json'),
      provenanceVerifier: fixtureProvenanceVerifier,
      stageProvenanceVerifier: fixtureStageProvenanceVerifier,
    },
  };
}

async function retainExactContentAddressed(root, category, sourcePath) {
  const bytes = await readFile(sourcePath);
  const digest = sha256(bytes);
  const path = join(root, category, 'sha256', `${digest}.json`);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, bytes);
  return { bytes, digest, path };
}

async function writeFixtureStageChain(input) {
  const profile = input.runtimeMatrix.profiles.find(
    (item) => item.id === input.task.runtimeProfileId,
  );
  const stageRoot = join(
    input.recordRoot,
    'stage-provenance',
    input.run.runId,
  );
  const agentPath = join(stageRoot, 'agent', 'attestation.json');
  const agentBundlePath = join(stageRoot, 'agent', 'sigstore-bundle.json');
  const agentVerificationPath = join(stageRoot, 'agent', 'verification.json');
  await mkdir(dirname(agentBundlePath), { recursive: true });
  await writeFile(agentBundlePath, '{"fixture":"agent"}\n');
  const requestBytes = await readFile(input.adapterRequest.path);
  const agent = createAgentStageAttestation({
    runId: input.run.runId,
    taskId: input.run.taskId,
    partition: input.run.partition,
    arm: input.run.arm,
    repetition: input.run.repetition,
    model: {
      modelId: input.run.modelId,
      provider: input.run.provider,
      requestedModel: input.run.requestedModel,
    },
    status: 'completed',
    productionEligible: true,
    createdAt:
      input.run.partition === 'development'
        ? '2026-07-22T10:00:00.000Z'
        : '2026-07-22T12:00:00.000Z',
    execution: fixtureStageExecution(input.run, 'agent'),
    image: {
      reference: profile.agentImage.reference,
      digest: profile.agentImage.digest,
      runtimeProfileId: profile.id,
    },
    controllerSha256: input.record.bindings.agentControllerSha256,
    bindings: {
      authorizationSha256:
        input.record.bindings.authorizationSha256,
      requestFileSha256: sha256(requestBytes),
      requestSha256: input.adapterRequest.digest,
      runPlanSha256: input.record.bindings.runPlanSha256,
      taskManifestSha256: input.record.bindings.taskManifestSha256,
      candidateManifestSha256:
        input.record.bindings.candidateManifestSha256,
      candidateTarballSetSha256:
        input.record.bindings.candidateTarballSetSha256,
      runtimeMatrixSha256: input.record.bindings.runtimeMatrixSha256,
      preparedEnvironmentAttestationSha256:
        input.record.bindings.preparedEnvironmentAttestationSha256,
      environmentSha256: input.record.bindings.environmentSha256,
      environmentSpecSha256: input.record.bindings.environmentSpecSha256,
      environmentSubstanceSha256:
        input.record.bindings.environmentSubstanceSha256,
      informationEntitlementSha256:
        input.record.bindings.informationEntitlementSha256,
      deliverySha256: input.record.bindings.deliverySha256,
      baseCommit: input.record.workspace.baseCommit,
      baseTree: input.record.workspace.baseTree,
      agentImageDigest: input.record.bindings.agentImageDigest,
    },
    isolation: {
      inputMaterial: ['adapter-request', 'prepared-workspace'],
      excludedMaterial: [
        'evaluator-contract',
        'evaluator-source',
        'expected-patch',
        'hidden-review',
        'private-oracle',
        'qualification-controller',
      ],
      providerCredentialPresent: false,
      personalSkills: false,
      personalMcp: false,
      hostConfiguration: false,
      modelNetwork: 'audited-run-local-proxy-only',
    },
    output: {
      adapterResponseFile: {
        path: 'adapter-response.json',
        sha256: '1'.repeat(64),
        bytes: 1,
      },
      providerReceiptFile: {
        path: 'provider-receipt.json',
        sha256: '2'.repeat(64),
        bytes: 1,
      },
      workspaceDeltaFile: {
        path: 'workspace-delta.json',
        sha256: '3'.repeat(64),
        bytes: 1,
      },
      workspaceDeltaSha256: '4'.repeat(64),
    },
  });
  await writeStageAttestation(agentPath, agent);
  const agentVerification = await fixtureStageProvenanceVerifier({
    subjectPath: agentPath,
    bundlePath: agentBundlePath,
    partition: input.run.partition,
    sourceDigest: agent.execution.sourceDigest,
  });
  await writeCanonicalFile(agentVerificationPath, agentVerification);
  const [agentBytes, agentBundleBytes, agentVerificationBytes] =
    await Promise.all([
      readFile(agentPath),
      readFile(agentBundlePath),
      readFile(agentVerificationPath),
    ]);

  const runCore = structuredClone(input.record);
  delete runCore.provenance;
  runCore.schemaVersion = RUN_CORE_SCHEMA_VERSION;
  const runCoreBytes = Buffer.from(prettyCanonicalJson(runCore), 'utf8');
  const evaluatorPath = join(stageRoot, 'evaluator', 'attestation.json');
  const evaluatorBundlePath = join(
    stageRoot,
    'evaluator',
    'sigstore-bundle.json',
  );
  const evaluatorVerificationPath = join(
    stageRoot,
    'evaluator',
    'verification.json',
  );
  await mkdir(dirname(evaluatorBundlePath), { recursive: true });
  await writeFile(evaluatorBundlePath, '{"fixture":"evaluator"}\n');
  const evaluatorResultBytes = await readFile(input.evaluator.path);
  const trajectoryBytes = await readFile(input.trajectory.path);
  const workspaceChangeBytes = await readFile(input.workspaceChange.path);
  const evaluator = createEvaluatorStageAttestation({
    runId: input.run.runId,
    taskId: input.run.taskId,
    partition: input.run.partition,
    arm: input.run.arm,
    repetition: input.run.repetition,
    status: 'completed',
    productionEligible: true,
    createdAt:
      input.run.partition === 'development'
        ? '2026-07-22T10:01:00.000Z'
        : '2026-07-22T12:01:00.000Z',
    execution: fixtureStageExecution(input.run, 'evaluator'),
    image: {
      reference: profile.benchmarkImage.reference,
      digest: profile.benchmarkImage.digest,
      runtimeProfileId: profile.id,
    },
    controllerSha256: input.record.bindings.evaluatorControllerSha256,
    agentStage: {
      attestationFile: stageFileBinding(agentPath, agentBytes),
      bundleFile: stageFileBinding(agentBundlePath, agentBundleBytes),
      verificationFile: stageFileBinding(
        agentVerificationPath,
        agentVerificationBytes,
      ),
      verificationSha256: agentVerification.verificationSha256,
    },
    sealedInput: {
      taskManifestSha256: input.record.bindings.taskManifestSha256,
      evaluatorContractSha256:
        input.record.bindings.evaluatorContractSha256,
      evaluatorSourceClosureSha256:
        input.record.bindings.qualificationEvaluatorSourceClosureSha256,
      oracleSourceSha256: input.task.oracleSourceSha256,
    },
    isolation: {
      agentExitedBeforeMount: true,
      network: 'none',
      providerCredentialsAbsent: true,
    },
    reconstruction: {
      baseCommit: input.record.workspace.baseCommit,
      baseTree: input.record.workspace.baseTree,
      workspaceDeltaSha256: agent.output.workspaceDeltaSha256,
      dependencyTreeBeforeVerified: true,
      dependencyTreeAfterVerified: true,
    },
    output: {
      authorizationFile: stageFileBinding(
        input.authorizationRetained.path,
        input.authorizationRetained.bytes,
      ),
      budgetApprovalFile: stageFileBinding(
        input.budgetApprovalRetained.path,
        input.budgetApprovalRetained.bytes,
      ),
      evaluatorResultFile: stageFileBinding(
        input.evaluator.path,
        evaluatorResultBytes,
      ),
      powerPilotFile: input.powerPilotRetained
        ? stageFileBinding(
            input.powerPilotRetained.path,
            input.powerPilotRetained.bytes,
          )
        : null,
      runCoreFile: {
        path: 'run-core.json',
        sha256: sha256(runCoreBytes),
        bytes: runCoreBytes.byteLength,
      },
      trajectoryManifestFile: stageFileBinding(
        input.trajectory.path,
        trajectoryBytes,
      ),
      workspaceChangeFile: stageFileBinding(
        input.workspaceChange.path,
        workspaceChangeBytes,
      ),
    },
  });
  await writeStageAttestation(evaluatorPath, evaluator);
  const evaluatorVerification = await fixtureStageProvenanceVerifier({
    subjectPath: evaluatorPath,
    bundlePath: evaluatorBundlePath,
    partition: input.run.partition,
    sourceDigest: evaluator.execution.sourceDigest,
  });
  await writeCanonicalFile(evaluatorVerificationPath, evaluatorVerification);
  const [evaluatorBytes, evaluatorBundleBytes, evaluatorVerificationBytes] =
    await Promise.all([
      readFile(evaluatorPath),
      readFile(evaluatorBundlePath),
      readFile(evaluatorVerificationPath),
    ]);
  return {
    agentStage: {
      attestationFile: relativeStageFile(
        input.recordRoot,
        agentPath,
        agentBytes,
      ),
      attestationSha256: agent.attestationSha256,
      bundleFile: relativeStageFile(
        input.recordRoot,
        agentBundlePath,
        agentBundleBytes,
      ),
      verificationFile: relativeStageFile(
        input.recordRoot,
        agentVerificationPath,
        agentVerificationBytes,
      ),
      verificationSha256: agentVerification.verificationSha256,
    },
    evaluatorStage: {
      attestationFile: relativeStageFile(
        input.recordRoot,
        evaluatorPath,
        evaluatorBytes,
      ),
      attestationSha256: evaluator.attestationSha256,
      bundleFile: relativeStageFile(
        input.recordRoot,
        evaluatorBundlePath,
        evaluatorBundleBytes,
      ),
      verificationFile: relativeStageFile(
        input.recordRoot,
        evaluatorVerificationPath,
        evaluatorVerificationBytes,
      ),
      verificationSha256: evaluatorVerification.verificationSha256,
    },
  };
}

async function fixtureStageProvenanceVerifier(input) {
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

function fixtureStageExecution(run, job) {
  return {
    repository:
      run.partition === 'qualification'
        ? 'decantr-ai/decantr-qualification-private'
        : 'decantr-ai/decantr',
    workflowFile: 'benchmark-3-10-split-run.yml',
    sourceDigest: FIXTURE_RUNNER_COMMIT,
    sourceRef: 'refs/heads/main',
    eventName: 'workflow_dispatch',
    runId: 'fixture-split-run',
    runAttempt: '1',
    job,
    runnerEnvironment: 'github-hosted',
    runnerOs: 'Linux',
    runnerArch: 'X64',
  };
}

function relativeStageFile(root, path, bytes) {
  return {
    path: relative(root, path).replaceAll('\\', '/'),
    sha256: sha256(bytes),
    bytes: bytes.byteLength,
  };
}

function makeRuntimeMatrix() {
  return makeFixtureLockedRuntimeMatrix({
    draftFrozenAt: '2026-07-22T08:00:00.000Z',
    verifiedAt: '2026-07-22T08:15:00.000Z',
    lockedAt: '2026-07-22T08:30:00.000Z',
  });
}

function makePreparedEnvironment(task, spec, matrix) {
  const attestation = {
    schemaVersion: 'decantr-benchmark-prepared-environment.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    taskId: task.taskId,
    environmentSpecSha256: task.environmentSpecSha256,
    environmentSubstanceSha256: task.environmentSubstanceSha256,
    runtimeMatrixSha256: matrix.matrixSha256,
    runtimeProfileId: task.runtimeProfileId,
    benchmarkImageDigest: matrix.profiles[0].benchmarkImage.digest,
    base: structuredClone(task.base),
    revisionRole: 'base',
    revision: structuredClone(task.base),
    candidateSha256: null,
    lockfiles: structuredClone(spec.lockfiles),
    steps: spec.preparation.map((command) => ({
      id: command.id,
      network: command.network,
      commandSha256: sha256Canonical(command),
      exitCode: 0,
      durationMs: 1,
      stdoutSha256: sha256(''),
      stderrSha256: sha256(''),
    })),
    dependencyRoots: ['node_modules'],
    dependencyTreeSha256: '5'.repeat(64),
    dependencyEntryCount: 1,
    trackedClean: true,
    preparedAt: '2026-07-22T09:00:00.000Z',
  };
  attestation.environmentSha256 = calculatePreparedEnvironmentIdentity(attestation);
  attestation.attestationSha256 = calculatePreparedAttestationDigest(attestation);
  return attestation;
}

function selectQualificationExecutionBindings(source) {
  const values = {
    qualificationExecutionAttestationFileSha256:
      source.qualificationExecutionAttestationFileSha256 ?? source.attestationFileSha256,
    qualificationExecutionAttestationSha256:
      source.qualificationExecutionAttestationSha256 ?? source.attestationSha256,
    qualificationExecutionControllerSha256:
      source.qualificationExecutionControllerSha256 ?? source.controllerSha256,
    qualificationEvaluatorSourceClosureSha256:
      source.qualificationEvaluatorSourceClosureSha256 ?? source.evaluatorSourceClosureSha256,
    qualificationInputRequestFileSha256:
      source.qualificationInputRequestFileSha256 ?? source.inputRequestFileSha256,
    qualificationInputRequestSha256:
      source.qualificationInputRequestSha256 ?? source.inputRequestSha256,
    qualificationInputManifestFileSha256:
      source.qualificationInputManifestFileSha256 ?? source.inputManifestFileSha256,
    qualificationInputManifestSha256:
      source.qualificationInputManifestSha256 ?? source.inputManifestSha256,
    qualificationRunnerRepositoryCommit:
      source.qualificationRunnerRepositoryCommit ?? source.runnerRepositoryCommit,
    qualificationProvenanceBundleFileSha256:
      source.qualificationProvenanceBundleFileSha256 ?? source.provenanceBundleFileSha256,
    qualificationProvenanceVerificationSha256:
      source.qualificationProvenanceVerificationSha256 ?? source.provenanceVerificationSha256,
  };
  assert.deepEqual(Object.keys(values), QUALIFICATION_EXECUTION_FIELDS);
  return values;
}

function makeTask(repository, taskId, kind, partition, bindings) {
  const entitlement = {
    policy: taskId,
    taskInput: fixtureTaskInput(),
  };
  const entitlementSha256 = sha256Canonical(entitlement);
  return {
    schemaVersion: 'decantr-benchmark-task.v2',
    taskId,
    partition,
    kind,
    repositoryId: repository.id,
    framework: repository.framework,
    projectPath: repository.projectPath,
    corpusProjectPath: repository.projectPath,
    corpusCommit: repository.commit,
    base: { commit: repository.commit, tree: repository.commit },
    candidateSha256: bindings.candidateSha256,
    prompt: `Implement the frozen user-interface benchmark behavior for ${taskId}.`,
    informationEntitlement: entitlement,
    informationEntitlementSha256: entitlementSha256,
    armInputs: {
      control: { context: 'Use the repository policy card.', entitlementSha256 },
      treatment: { context: 'Use the Decantr task context.', entitlementSha256 },
    },
    scope: { allowedPaths: ['src/**'], forbiddenPaths: ['package.json'] },
    environment: {
      specSha256: bindings.environmentSpecSha256,
      substanceSha256: bindings.environmentSubstanceSha256,
      runtimeProfileId: bindings.environmentSpec.profile.id,
      runtimeMatrixFileSha256: bindings.runtimeMatrixFileSha256,
      runtimeMatrixSha256: bindings.runtimeMatrixSha256,
      benchmarkImageDigest: bindings.benchmarkImageDigest,
    },
    evaluator: {
      contractId: `evaluator-${taskId}`,
      contractSha256: bindings.contractSha256,
      specSha256: bindings.evaluatorSpecSha256,
      oracleSourceSha256: bindings.oracleSourceSha256,
      qualificationControllerSha256: bindings.qualificationControllerSha256,
      qualificationReceiptFileSha256: bindings.qualificationReceiptFileSha256,
      qualificationReceiptSha256: bindings.qualificationReceiptSha256,
      ...selectQualificationExecutionBindings(bindings),
    },
    limits: { timeoutMs: 1000, maxRequests: 2, maxInputTokens: 1000, maxOutputTokens: 1000 },
  };
}

function makeQualificationResult(taskId, contractSha256, passed) {
  return {
    schemaVersion: 'decantr-benchmark-evaluator-result.v1',
    runId: `qualification-${taskId}-${passed ? 'expected' : 'base'}`,
    taskId,
    contractSha256,
    status: passed ? 'passed' : 'failed',
    metrics: {
      functionalSuccess: passed,
      buildPassed: true,
      governanceViolations: 0,
      accessibilityViolations: 0,
      visualScore: null,
    },
    commands: [
      {
        id: 'behavior',
        kind: 'functional',
        status: passed ? 'passed' : 'failed',
        exitCode: passed ? 0 : 1,
        durationMs: 1,
        stdoutSha256: sha256(''),
        stderrSha256: sha256(''),
      },
      {
        id: 'build-check',
        kind: 'build',
        status: 'passed',
        exitCode: 0,
        durationMs: 1,
        stdoutSha256: sha256(''),
        stderrSha256: sha256(''),
      },
    ],
    failures: passed ? [] : ['behavior:failed'],
  };
}

function makeEnvironmentSpec(repository, taskId, partition) {
  return {
    schemaVersion: 'decantr-benchmark-task-environment.v1',
    taskId,
    partition,
    base: { commit: repository.commit, tree: repository.commit },
    projectPath: repository.projectPath,
    profile: {
      id: 'node-22.19.0-pnpm-10.33.0',
      os: 'linux',
      arch: 'x64',
      nodeVersion: '22.19.0',
      bunVersion: null,
      packageManager: { name: 'pnpm', version: '10.33.0' },
    },
    lockfiles: [{ path: 'pnpm-lock.yaml', sha256: '3'.repeat(64) }],
    sourceEvidence: [
      { kind: 'package-manifest', path: 'package.json', sha256: '4'.repeat(64), statement: 'Fixture package manifest evidence.' },
      { kind: 'lockfile', path: 'pnpm-lock.yaml', sha256: '3'.repeat(64), statement: 'Fixture lockfile evidence.' },
    ],
    preparation: [{
      id: 'install-dependencies',
      executable: 'pnpm',
      args: ['install', '--frozen-lockfile'],
      cwd: '.',
      timeoutMs: 10_000,
      network: 'dependency-registry',
      required: true,
    }],
    cleanAfterPreparation: true,
    review: {
      status: 'approved',
      reviewedBy: 'fixture-runtime-reviewer',
      reviewedAt: '2026-07-22T08:00:00.000Z',
      notes: 'Independently reviewed fixture runtime and preparation commands.',
    },
  };
}

function fixtureTaskInput() {
  return {
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
  };
}

async function writeEnvironmentSpec(root, spec) {
  await writeFile(join(root, 'specs', `${spec.taskId}.json`), prettyCanonicalJson(spec));
}
