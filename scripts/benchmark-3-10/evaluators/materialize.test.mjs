import assert from 'node:assert/strict';
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  prettyCanonicalJson,
  sha256,
  sha256Canonical,
} from '../runner/canonical.mjs';
import { makeFixtureLockedRuntimeMatrix } from '../environments/runtime-matrix.test-helper.mjs';
import { taskEnvironmentSubstanceSha256 } from '../environments/contracts.mjs';
import {
  calculateQualificationControllerDigest,
  calculateQualificationReceiptDigest,
  calculatePrequalificationBundleDigest,
} from './qualification-task.mjs';
import {
  FIXTURE_PROVENANCE_VERIFICATION_SHA256,
  FIXTURE_RUNNER_COMMIT,
  FIXTURE_SOURCE_REF,
  fixtureProvenanceVerifier as sharedFixtureProvenanceVerifier,
  makeFixtureExecutionAttestation,
  makeFixtureQualificationInput,
} from '../test-helpers/qualification-execution.mjs';
import {
  QUALIFICATION_PREDICATE_TYPE,
  QUALIFICATION_REPOSITORY,
  QUALIFICATION_SIGNER_WORKFLOW,
} from './github-provenance.mjs';
import { materializeBenchmarkTasks } from './materialize.mjs';

const SEALED_AT = '2026-07-22T15:00:00Z';
const REVIEWED_AT = '2026-07-22T13:30:00Z';
const QUALIFIED_AT = '2026-07-22T14:30:00Z';
const PROGRAM = 'decantr-3.10-ui-change-control-proof';

test('materialize creates a bound 24/16 task set without exposing qualification details', async () => {
  const fixture = await createFixture();
  try {
    const result = await materializeBenchmarkTasks(fixture.options);
    assert.deepEqual(result.counts, { development: 24, qualification: 16, total: 40 });
    assert.match(result.qualificationIndexSha256, /^[a-f0-9]{64}$/u);
    assert.match(result.publicBindingSha256, /^[a-f0-9]{64}$/u);

    const developmentFiles = (await readdir(fixture.developmentTaskOutputRoot)).sort();
    const qualificationFiles = (await readdir(fixture.qualificationTaskOutputRoot)).sort();
    assert.equal(developmentFiles.length, 24);
    assert.equal(qualificationFiles.length, 16);
    assert.deepEqual(
      qualificationFiles,
      fixture.qualificationCandidates.records.map((candidate) => `${candidate.opaqueId}.json`).sort(),
    );

    for (const candidate of fixture.allCandidates) {
      const taskPath =
        candidate.partition === 'development'
          ? join(fixture.developmentTaskOutputRoot, `${candidate.taskId}.json`)
          : join(fixture.qualificationTaskOutputRoot, `${candidate.opaqueId}.json`);
      const task = await readJson(taskPath);
      assert.equal(task.partition, candidate.partition);
      assert.equal(task.projectPath, candidate.repository.projectPath);
      assert.equal(task.corpusProjectPath, candidate.repository.corpusProjectPath);
      assert.equal(task.corpusCommit, candidate.repository.corpusPin);
      assert.equal(/decantr/iu.test(task.prompt), false);
      assert.equal(/decantr/iu.test(JSON.stringify(task.informationEntitlement)), false);
      assert.equal(
        task.informationEntitlement.taskInput.target.selector,
        `file:src/tasks/${candidate.taskId}.tsx`,
      );
      assert.equal(task.informationEntitlement.taskInput.policyCard.statements.length, 1);
      assert.equal(
        task.informationEntitlementSha256,
        sha256Canonical(task.informationEntitlement),
      );
      assert.equal(
        task.armInputs.control.entitlementSha256,
        task.informationEntitlementSha256,
      );
      assert.equal(
        task.armInputs.treatment.entitlementSha256,
        task.informationEntitlementSha256,
      );
    }

    const historical = await readJson(
      join(fixture.developmentTaskOutputRoot, 'repository.repo-01.json'),
    );
    assert.equal(historical.projectPath, 'legacy/apps/repo-01');
    assert.equal(historical.corpusProjectPath, 'apps/repo-01');

    const qualificationIndex = await readJson(fixture.qualificationIndexPath);
    const publicBinding = await readJson(fixture.publicBindingPath);
    const publicCandidateIndex = await readJson(fixture.publicCandidateIndexPath);
    assert.equal(qualificationIndex.tasks.length, 16);
    assert.equal(publicBinding.tasks.length, 16);
    assert.equal(
      qualificationIndex.bundleSha256,
      sha256Canonical(qualificationIndex.tasks),
    );
    assert.equal(
      publicBinding.candidateIndexSha256,
      sha256(await readFile(fixture.publicCandidateIndexPath)),
    );
    assert.equal(
      publicBinding.qualificationTaskIndexSha256,
      sha256(await readFile(fixture.qualificationIndexPath)),
    );
    assert.equal(publicBinding.bundleSha256, sha256Canonical(publicBinding.tasks));

    const candidateHashByOpaqueId = new Map(
      publicCandidateIndex.tasks.map((entry) => [entry.opaqueId, entry.canonicalSha256]),
    );
    for (const binding of publicBinding.tasks) {
      assert.deepEqual(Object.keys(binding).sort(), [
        'candidateSha256',
        'deliverySpecSha256',
        'environmentSpecSha256',
        'evaluatorContractSha256',
        'evaluatorSpecSha256',
        'manifestSha256',
        'opaqueId',
        'oracleSourceSha256',
        'qualificationControllerSha256',
        'qualificationEvaluatorSourceClosureSha256',
        'qualificationExecutionAttestationFileSha256',
        'qualificationExecutionAttestationSha256',
        'qualificationExecutionControllerSha256',
        'qualificationInputManifestFileSha256',
        'qualificationInputManifestSha256',
        'qualificationInputRequestFileSha256',
        'qualificationInputRequestSha256',
        'qualificationProvenanceBundleFileSha256',
        'qualificationProvenanceVerificationSha256',
        'qualificationReceiptFileSha256',
        'qualificationReceiptSha256',
        'qualificationRunnerCommit',
      ]);
      assert.equal(binding.candidateSha256, candidateHashByOpaqueId.get(binding.opaqueId));
      for (const [key, value] of Object.entries(binding)) {
        if (key === 'qualificationRunnerCommit') assert.match(value, /^[a-f0-9]{40}$/u);
        else if (key !== 'opaqueId') assert.match(value, /^[a-f0-9]{64}$/u);
      }
    }

    const publicBindingText = await readFile(fixture.publicBindingPath, 'utf8');
    for (const candidate of fixture.qualificationCandidates.records) {
      assert.equal(publicBindingText.includes(candidate.taskId), false);
      assert.equal(publicBindingText.includes(candidate.repository.id), false);
      assert.equal(publicBindingText.includes(candidate.repository.url), false);
      assert.equal(publicBindingText.includes(candidate.prompt), false);
    }

    const developmentEvaluatorManifest = await readJson(
      join(fixture.developmentEvaluatorRoot, 'manifest.json'),
    );
    const qualificationEvaluatorManifest = await readJson(
      join(fixture.qualificationEvaluatorRoot, 'manifest.json'),
    );
    assert.equal(developmentEvaluatorManifest.evaluators.length, 24);
    assert.equal(qualificationEvaluatorManifest.evaluators.length, 16);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('materialize rejects missing and unapproved evaluator specs', async (context) => {
  await context.test('missing evaluator spec', async () => {
    const fixture = await createFixture();
    try {
      const candidate = fixture.developmentCandidates.records[0];
      const specPath = evaluatorSpecPath(fixture, candidate);
      await unlink(specPath);

      await assert.rejects(materializeBenchmarkTasks(fixture.options), (error) => {
        assert.equal(error.code, 'ENOENT');
        assert.match(error.message, new RegExp(`${escapeRegExp(candidate.taskId)}\\.json`, 'u'));
        return true;
      });
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  });

  await context.test('unapproved evaluator spec', async () => {
    const fixture = await createFixture();
    try {
      const candidate = fixture.developmentCandidates.records[0];
      const specPath = evaluatorSpecPath(fixture, candidate);
      const spec = await readJson(specPath);
      spec.review.status = 'pending';
      await writeJson(specPath, spec);

      await assert.rejects(
        materializeBenchmarkTasks(fixture.options),
        new RegExp(
          `${escapeRegExp(candidate.taskId)}: evaluator spec requires a substantive .+ approval`,
          'u',
        ),
      );
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  });
});

test('materialize rejects an unapproved shared task delivery spec', async () => {
  const fixture = await createFixture();
  try {
    const candidate = fixture.developmentCandidates.records[0];
    const specPath = deliverySpecPath(fixture, candidate);
    const spec = await readJson(specPath);
    spec.review.status = 'pending';
    spec.review.reviewedBy = null;
    spec.review.reviewedAt = null;
    await writeJson(specPath, spec);

    await assert.rejects(
      materializeBenchmarkTasks(fixture.options),
      new RegExp(
        `${escapeRegExp(candidate.taskId)}: task delivery spec requires a substantive .+ approval`,
        'u',
      ),
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('materialize requires a current image-qualified evaluator receipt', async (context) => {
  await context.test('missing receipt', async () => {
    const fixture = await createFixture();
    try {
      const candidate = fixture.developmentCandidates.records[0];
      await unlink(qualificationReceiptPath(fixture, candidate));
      await assert.rejects(materializeBenchmarkTasks(fixture.options), (error) => {
        assert.equal(error.code, 'ENOENT');
        assert.match(error.message, new RegExp(`${escapeRegExp(candidate.taskId)}\\.json`, 'u'));
        return true;
      });
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  });

  await context.test('stale evaluator binding', async () => {
    const fixture = await createFixture();
    try {
      const candidate = fixture.developmentCandidates.records[0];
      const path = qualificationReceiptPath(fixture, candidate);
      const receipt = await readJson(path);
      receipt.evaluatorSpecSha256 = '0'.repeat(64);
      receipt.receiptSha256 = calculateQualificationReceiptDigest(receipt);
      await writeJson(path, receipt);
      await assert.rejects(
        materializeBenchmarkTasks(fixture.options),
        /qualification receipt evaluatorSpecSha256 differs from the materialization input/u,
      );
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  });
});

test('materialize rejects an evaluator source that names the product under test', async () => {
  const fixture = await createFixture();
  try {
    const candidate = fixture.developmentCandidates.records[0];
    await writeFile(
      evaluatorSourcePath(fixture, candidate),
      "// Decantr-specific oracle\nconsole.log(JSON.stringify({ passed: true }));\n",
    );

    await assert.rejects(
      materializeBenchmarkTasks(fixture.options),
      new RegExp(`${escapeRegExp(candidate.taskId)}: evaluator source names the product under test`, 'u'),
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('materialize rejects a qualification candidate whose public hash differs', async () => {
  const fixture = await createFixture();
  try {
    const candidate = fixture.qualificationCandidates.records[0];
    const publicIndex = await readJson(fixture.publicCandidateIndexPath);
    publicIndex.tasks.find((entry) => entry.opaqueId === candidate.opaqueId).canonicalSha256 =
      '0'.repeat(64);
    await writeJson(fixture.publicCandidateIndexPath, publicIndex);

    await assert.rejects(
      materializeBenchmarkTasks(fixture.options),
      new RegExp(`${escapeRegExp(candidate.opaqueId)}: public candidate binding differs from private record`, 'u'),
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('materialize rejects token limits above the locked per-model price ceiling', async () => {
  const fixture = await createFixture();
  try {
    const candidate = fixture.developmentCandidates.records[0];
    const specPath = evaluatorSpecPath(fixture, candidate);
    const spec = await readJson(specPath);
    spec.limits.maxInputTokens = 1_000_000;
    spec.limits.maxOutputTokens = 1_000_000;
    await writeJson(specPath, spec);

    await assert.rejects(
      materializeBenchmarkTasks(fixture.options),
      new RegExp(
        `${escapeRegExp(candidate.taskId)}: token limits can cost \\$35\\.00 for model-a, above \\$10`,
        'u',
      ),
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), 'materialize-test-'));
  const inputRoot = join(root, 'inputs');
  const developmentEvaluatorRoot = join(root, 'evaluators', 'development');
  const qualificationEvaluatorRoot = join(root, 'evaluators', 'qualification');
  const developmentDeliveryRoot = join(root, 'delivery', 'development');
  const qualificationDeliveryRoot = join(root, 'delivery', 'qualification');
  const developmentEnvironmentRoot = join(root, 'environments', 'development');
  const qualificationEnvironmentRoot = join(root, 'environments', 'qualification');
  const developmentReceiptRoot = join(developmentEvaluatorRoot, 'qualification-receipts');
  const qualificationReceiptRoot = join(qualificationEvaluatorRoot, 'qualification-receipts');
  const developmentTaskOutputRoot = join(root, 'tasks', 'development');
  const qualificationTaskOutputRoot = join(root, 'tasks', 'qualification');
  const qualificationIndexPath = join(root, 'private', 'qualification-index.json');
  const publicBindingPath = join(root, 'public', 'qualification-runnable-index.json');
  await Promise.all([
    mkdir(inputRoot, { recursive: true }),
    mkdir(join(developmentEvaluatorRoot, 'specs'), { recursive: true }),
    mkdir(join(developmentEvaluatorRoot, 'sources'), { recursive: true }),
    mkdir(join(qualificationEvaluatorRoot, 'specs'), { recursive: true }),
    mkdir(join(qualificationEvaluatorRoot, 'sources'), { recursive: true }),
    mkdir(join(developmentDeliveryRoot, 'specs'), { recursive: true }),
    mkdir(join(qualificationDeliveryRoot, 'specs'), { recursive: true }),
    mkdir(join(developmentEnvironmentRoot, 'specs'), { recursive: true }),
    mkdir(join(qualificationEnvironmentRoot, 'specs'), { recursive: true }),
    mkdir(developmentReceiptRoot, { recursive: true }),
    mkdir(qualificationReceiptRoot, { recursive: true }),
  ]);

  const corpus = makeCorpus();
  const protocol = makeProtocol();
  const pricing = makePricing();
  const { developmentCandidates, qualificationCandidates } = makeCandidates(corpus);
  const allCandidates = [
    ...developmentCandidates.records,
    ...qualificationCandidates.records,
  ];
  const publicCandidateIndex = {
    schemaVersion: 'decantr-benchmark-public-qualification-index.v1',
    frozenAt: SEALED_AT,
    program: PROGRAM,
    count: qualificationCandidates.records.length,
    bundleSha256: sha256Canonical(
      qualificationCandidates.records.map((candidate) => ({
        opaqueId: candidate.opaqueId,
        canonicalSha256: sha256Canonical(candidate),
      })),
    ),
    tasks: qualificationCandidates.records.map((candidate) => ({
      opaqueId: candidate.opaqueId,
      canonicalSha256: sha256Canonical(candidate),
    })),
  };

  const corpusPath = join(inputRoot, 'corpus.json');
  const protocolPath = join(inputRoot, 'protocol.json');
  const pricingPath = join(inputRoot, 'pricing.json');
  const developmentCandidatesPath = join(inputRoot, 'development-candidates.json');
  const qualificationCandidatesPath = join(inputRoot, 'qualification-candidates.json');
  const publicCandidateIndexPath = join(inputRoot, 'qualification-index.json');
  const runtimeMatrixPath = join(inputRoot, 'runtime-matrix.json');
  const runtimeMatrix = makeFixtureLockedRuntimeMatrix({
    draftFrozenAt: '2026-07-22T12:00:00Z',
    verifiedAt: '2026-07-22T12:30:00Z',
    lockedAt: '2026-07-22T13:00:00Z',
  });
  await Promise.all([
    writeJson(corpusPath, corpus),
    writeJson(protocolPath, protocol),
    writeJson(pricingPath, pricing),
    writeJson(developmentCandidatesPath, developmentCandidates),
    writeJson(qualificationCandidatesPath, qualificationCandidates),
    writeJson(publicCandidateIndexPath, publicCandidateIndex),
    writeJson(runtimeMatrixPath, runtimeMatrix),
  ]);
  await Promise.all(
    allCandidates.flatMap((candidate) => {
      const evaluatorRoot =
        candidate.partition === 'development'
          ? developmentEvaluatorRoot
          : qualificationEvaluatorRoot;
      return [
        writeJson(
          join(evaluatorRoot, 'specs', `${candidate.taskId}.json`),
          makeEvaluatorSpec(candidate),
        ),
        writeFile(
          join(evaluatorRoot, 'sources', `${candidate.taskId}.mjs`),
          makeOracleSource(),
        ),
        writeJson(
          join(
            candidate.partition === 'development'
              ? developmentDeliveryRoot
              : qualificationDeliveryRoot,
            'specs',
            `${candidate.taskId}.json`,
          ),
          makeDeliverySpec(candidate),
        ),
        writeJson(
          join(
            candidate.partition === 'development'
              ? developmentEnvironmentRoot
              : qualificationEnvironmentRoot,
            'specs',
            `${candidate.taskId}.json`,
          ),
          makeEnvironmentSpec(candidate),
        ),
      ];
    }),
  );
  await writeQualificationReceipts({
    allCandidates,
    corpusPath,
    developmentCandidatesPath,
    qualificationCandidatesPath,
    runtimeMatrix,
    runtimeMatrixPath,
    developmentEvaluatorRoot,
    qualificationEvaluatorRoot,
    developmentEnvironmentRoot,
    qualificationEnvironmentRoot,
    developmentReceiptRoot,
    qualificationReceiptRoot,
  });

  return {
    root,
    corpus,
    protocol,
    pricing,
    developmentCandidates,
    qualificationCandidates,
    publicCandidateIndex,
    allCandidates,
    developmentEvaluatorRoot,
    qualificationEvaluatorRoot,
    developmentDeliveryRoot,
    qualificationDeliveryRoot,
    developmentEnvironmentRoot,
    qualificationEnvironmentRoot,
    developmentReceiptRoot,
    qualificationReceiptRoot,
    developmentTaskOutputRoot,
    qualificationTaskOutputRoot,
    qualificationIndexPath,
    publicBindingPath,
    publicCandidateIndexPath,
    options: {
      sealedAt: SEALED_AT,
      corpusPath,
      protocolPath,
      pricingPath,
      developmentCandidatesPath,
      qualificationCandidatesPath,
      publicCandidateIndexPath,
      runtimeMatrixPath,
      developmentEvaluatorRoot,
      qualificationEvaluatorRoot,
      developmentDeliveryRoot,
      qualificationDeliveryRoot,
      developmentEnvironmentRoot,
      qualificationEnvironmentRoot,
      developmentReceiptRoot,
      qualificationReceiptRoot,
      developmentTaskOutputRoot,
      qualificationTaskOutputRoot,
      qualificationIndexPath,
      publicBindingPath,
      provenanceVerifier: sharedFixtureProvenanceVerifier,
    },
  };
}

async function writeQualificationReceipts(options) {
  const corpusSha256 = sha256(await readFile(options.corpusPath));
  const runtimeMatrixFileSha256 = sha256(await readFile(options.runtimeMatrixPath));
  const qualificationControllerSha256 = await calculateQualificationControllerDigest();
  const profile = options.runtimeMatrix.profiles[0];
  for (const candidate of options.allCandidates) {
    const evaluatorRoot = candidate.partition === 'development'
      ? options.developmentEvaluatorRoot
      : options.qualificationEvaluatorRoot;
    const environmentRoot = candidate.partition === 'development'
      ? options.developmentEnvironmentRoot
      : options.qualificationEnvironmentRoot;
    const receiptRoot = candidate.partition === 'development'
      ? options.developmentReceiptRoot
      : options.qualificationReceiptRoot;
    const candidateSetPath = candidate.partition === 'development'
      ? options.developmentCandidatesPath
      : options.qualificationCandidatesPath;
    const specBytes = await readFile(join(evaluatorRoot, 'specs', `${candidate.taskId}.json`));
    const spec = JSON.parse(specBytes);
    const sourceBytes = await readFile(join(evaluatorRoot, 'sources', `${candidate.taskId}.mjs`));
    const sourceSha256 = sha256(sourceBytes);
    const environmentBytes = await readFile(join(environmentRoot, 'specs', `${candidate.taskId}.json`));
    const environmentSpec = JSON.parse(environmentBytes);
    const contract = {
      schemaVersion: 'decantr-benchmark-evaluator-contract.v2',
      contractId: spec.contractId,
      taskId: candidate.taskId,
      oracle: {
        candidateIndependent: true,
        decantrOutputAllowed: false,
        sourceSha256,
      },
      commands: spec.commands,
    };
    const contractSha256 = sha256(Buffer.from(prettyCanonicalJson(contract)));
    const executionId = `fixture-${candidate.taskId}`;
    const results = {
      base: makeEvaluatorResult(candidate.taskId, contractSha256, false, executionId),
      expected: makeEvaluatorResult(candidate.taskId, contractSha256, true, executionId),
    };
    const resultBindings = {};
    await mkdir(join(receiptRoot, 'results'), { recursive: true });
    for (const role of ['base', 'expected']) {
      const resultPath = join(receiptRoot, 'results', `${candidate.taskId}.${role}.json`);
      await writeJson(resultPath, results[role]);
      resultBindings[role] = {
        canonicalSha256: sha256Canonical(results[role]),
        fileSha256: sha256(await readFile(resultPath)),
      };
    }
    const prequalification = {
      schemaVersion: 'decantr-benchmark-prequalification-task.v2',
      program: PROGRAM,
      taskId: candidate.taskId,
      partition: candidate.partition,
      candidateSetSha256: sha256(await readFile(candidateSetPath)),
      candidateSha256: sha256Canonical(candidate),
      corpusSha256,
      evaluatorSpecSha256: sha256(specBytes),
      oracleSourceSha256: sourceSha256,
      evaluatorContractSha256: contractSha256,
      qualificationControllerSha256,
      environmentSpecSha256: sha256(environmentBytes),
      environmentSubstanceSha256: taskEnvironmentSubstanceSha256(environmentSpec),
      runtimeMatrixFileSha256,
      runtimeMatrixSha256: options.runtimeMatrix.matrixSha256,
      runtimeProfileId: profile.id,
      benchmarkImageDigest: profile.benchmarkImage.digest,
      revisions: {
        base: structuredClone(candidate.base),
        expected: structuredClone(candidate.expected),
      },
      sealedAt: '2026-07-22T13:45:00Z',
    };
    prequalification.bundleSha256 = calculatePrequalificationBundleDigest(prequalification);
    const prequalificationRoot = join(receiptRoot, 'prequalification');
    await mkdir(prequalificationRoot, { recursive: true });
    const prequalificationPath = join(prequalificationRoot, `${candidate.taskId}.json`);
    await writeJson(prequalificationPath, prequalification);
    const prequalificationBundleFileSha256 = sha256(await readFile(prequalificationPath));
    const prequalificationBundleSha256 = prequalification.bundleSha256;
    const qualificationInput = makeFixtureQualificationInput(candidate);
    const attestation = await makeFixtureExecutionAttestation({
      candidate,
      candidateSha256: sha256Canonical(candidate),
      contractSha256,
      sourceSha256,
      sourcePath: spec.oracle.sourcePath,
      sourceBytes: sourceBytes.byteLength,
      environmentSpecSha256: sha256(environmentBytes),
      environmentSubstanceSha256: taskEnvironmentSubstanceSha256(environmentSpec),
      runtimeMatrixFileSha256,
      runtimeMatrixSha256: options.runtimeMatrix.matrixSha256,
      profile,
      executionId,
      prequalificationBundleFileSha256,
      prequalificationBundleSha256,
      resultBindings,
      results,
      qualifiedAt: QUALIFIED_AT,
      qualificationInput,
    });
    const attestationRoot = join(receiptRoot, 'attestations');
    const provenanceRoot = join(receiptRoot, 'provenance');
    const qualificationInputRoot = join(receiptRoot, 'qualification-input');
    await Promise.all([
      mkdir(attestationRoot, { recursive: true }),
      mkdir(provenanceRoot, { recursive: true }),
      mkdir(qualificationInputRoot, { recursive: true }),
    ]);
    const attestationPath = join(attestationRoot, `${candidate.taskId}.json`);
    const provenancePath = join(provenanceRoot, `${candidate.taskId}.jsonl`);
    await writeJson(attestationPath, attestation);
    await writeFile(provenancePath, `${JSON.stringify({ fixture: candidate.taskId })}\n`);
    await Promise.all([
      writeFile(
        join(qualificationInputRoot, `${candidate.taskId}.request.json`),
        qualificationInput.requestBytes,
      ),
      writeFile(
        join(qualificationInputRoot, `${candidate.taskId}.manifest.json`),
        qualificationInput.manifestBytes,
      ),
    ]);
    const attestationFileSha256 = sha256(await readFile(attestationPath));
    const provenanceBundleFileSha256 = sha256(await readFile(provenancePath));
    const receipt = {
      schemaVersion: 'decantr-benchmark-evaluator-qualification-task-receipt.v2',
      program: PROGRAM,
      taskId: candidate.taskId,
      partition: candidate.partition,
      qualified: true,
      qualifiedAt: QUALIFIED_AT,
      executionAssurance: 'github-host-container-attested',
      candidateSetSha256: sha256(await readFile(candidateSetPath)),
      candidateSha256: sha256Canonical(candidate),
      corpusSha256,
      prequalificationBundleFileSha256,
      prequalificationBundleSha256,
      evaluatorSpecSha256: sha256(specBytes),
      oracleSourceSha256: sourceSha256,
      evaluatorContractSha256: contractSha256,
      qualificationControllerSha256,
      environmentSpecSha256: sha256(environmentBytes),
      environmentSubstanceSha256: taskEnvironmentSubstanceSha256(environmentSpec),
      runtimeMatrixFileSha256,
      runtimeMatrixSha256: options.runtimeMatrix.matrixSha256,
      runtimeProfileId: profile.id,
      benchmarkImageDigest: profile.benchmarkImage.digest,
      networkMode: 'none',
      execution: {
        attestationFileSha256,
        attestationSha256: attestation.attestationSha256,
        controllerSha256: attestation.bindings.controller.closureSha256,
        evaluatorSourceClosureSha256: attestation.bindings.evaluator.sourceClosureSha256,
        inputRequestFileSha256: qualificationInput.binding.requestFileSha256,
        inputRequestSha256: qualificationInput.binding.requestSha256,
        inputManifestFileSha256: qualificationInput.binding.manifestFileSha256,
        inputManifestSha256: qualificationInput.binding.manifestSha256,
        runnerRepositoryCommit: FIXTURE_RUNNER_COMMIT,
        provenanceBundleFileSha256,
        provenanceVerificationSha256: FIXTURE_PROVENANCE_VERIFICATION_SHA256,
        repository: QUALIFICATION_REPOSITORY,
        signerWorkflow: QUALIFICATION_SIGNER_WORKFLOW,
        sourceRef: FIXTURE_SOURCE_REF,
        predicateType: QUALIFICATION_PREDICATE_TYPE,
        denySelfHostedRunners: true,
      },
      baseResultSha256: resultBindings.base.canonicalSha256,
      baseResultFileSha256: resultBindings.base.fileSha256,
      expectedResultSha256: resultBindings.expected.canonicalSha256,
      expectedResultFileSha256: resultBindings.expected.fileSha256,
    };
    receipt.receiptSha256 = calculateQualificationReceiptDigest(receipt);
    await writeJson(join(receiptRoot, `${candidate.taskId}.json`), receipt);
  }
}

function makeExecutionAttestation(input) {
  const proxyDigest = `sha256:${'f'.repeat(64)}`;
  const preparationRole = (role) => ({
    workspaceBeforeSha256: role === 'base' ? '1'.repeat(64) : '2'.repeat(64),
    workspacePreparedSha256: role === 'base' ? '3'.repeat(64) : '4'.repeat(64),
    networkPolicy: 'isolated-forward-proxy',
    directTaskEgress: false,
    steps: [
      {
        id: 'install-dependencies',
        commandSha256: '5'.repeat(64),
        network: 'isolated-forward-proxy',
        imageDigest: input.profile.benchmarkImage.digest,
        inspectEvidence: jsonEvidence(`${role}.prepare.inspect.json`, '6'),
        logsEvidence: fileEvidence(`${role}.prepare.log.txt`, '7'),
        startedAt: '2026-07-22T14:00:00Z',
        endedAt: '2026-07-22T14:05:00Z',
        exitCode: 0,
      },
    ],
  });
  const evaluationRole = (role) => {
    const workspaceSha256 = role === 'base' ? '8'.repeat(64) : '9'.repeat(64);
    return {
      imageDigest: input.profile.benchmarkImage.digest,
      networkMode: 'none',
      hostInspectedWhileRunning: true,
      readOnlyRoot: true,
      workspaceReadOnly: true,
      siblingWorkspaceVisible: false,
      networkCanary: 'blocked',
      workspaceBeforeSha256: workspaceSha256,
      workspaceAfterSha256: workspaceSha256,
      inspectEvidence: jsonEvidence(`${role}.evaluate.inspect.json`, 'a'),
      logsEvidence: fileEvidence(`${role}.evaluate.log.txt`, 'b'),
      canaryEvidence: jsonEvidence(`evidence/${role}/output/network-canary.json`, 'c'),
      result: {
        logicalPath: `evidence/${role}/output/result.json`,
        fileSha256: input.resultBindings[role].fileSha256,
        canonicalSha256: input.resultBindings[role].canonicalSha256,
        status: input.results[role].status,
      },
    };
  };
  return {
    schemaVersion: 'decantr-benchmark-container-execution-attestation.v1',
    program: PROGRAM,
    executionId: input.executionId,
    taskId: input.candidate.taskId,
    partition: input.candidate.partition,
    status: 'completed',
    executionIdentity: {
      provider: 'github-actions',
      repository: QUALIFICATION_REPOSITORY,
      workflowRef: `${QUALIFICATION_SIGNER_WORKFLOW}@${FIXTURE_SOURCE_REF}`,
      runId: '12345',
      runAttempt: '1',
      actor: 'fixture-reviewer',
      ref: FIXTURE_SOURCE_REF,
    },
    runnerRepositoryCommit: FIXTURE_RUNNER_COMMIT,
    startedAt: '2026-07-22T14:00:00Z',
    endedAt: QUALIFIED_AT,
    bindings: {
      candidate: {
        canonicalSha256: input.candidateSha256,
        fileSha256: 'd'.repeat(64),
      },
      prequalificationBundle: {
        bundleSha256: input.prequalificationBundleSha256,
        fileSha256: input.prequalificationBundleFileSha256,
      },
      evaluator: {
        contractFileSha256: input.contractSha256,
        oracleSourceSha256: input.sourceSha256,
        sourceClosureSha256: sha256Canonical(input.sourceClosure),
        sourceClosure: input.sourceClosure,
      },
      controller: input.containerController,
      environment: {
        specFileSha256: input.environmentSpecSha256,
        substanceSha256: input.environmentSubstanceSha256,
      },
      runtimeMatrix: {
        fileSha256: input.runtimeMatrixFileSha256,
        matrixSha256: input.runtimeMatrixSha256,
      },
      runtimeProfile: {
        id: input.profile.id,
        profileSha256: input.profile.profileSha256,
      },
      benchmarkImage: {
        reference: input.profile.benchmarkImage.reference,
        digest: input.profile.benchmarkImage.digest,
        inspectEvidence: jsonEvidence('benchmark-image.inspect.json', 'e'),
      },
    },
    preparation: {
      networkPolicy: 'isolated-forward-proxy',
      directTaskEgress: false,
      proxy: {
        image: { reference: 'docker.io/ubuntu/squid', digest: proxyDigest },
        configSha256: 'f'.repeat(64),
        fixedHosts: ['registry.npmjs.org'],
        lockfileHosts: [],
        allowedHosts: ['registry.npmjs.org'],
        lockfiles: [{ path: 'package-lock.json', sha256: '1'.repeat(64) }],
        inspectEvidence: jsonEvidence('proxy.inspect.json', '2'),
        networkInspectEvidence: jsonEvidence('proxy-network.inspect.json', '3'),
      },
      roles: {
        base: preparationRole('base'),
        expected: preparationRole('expected'),
      },
    },
    evaluation: {
      networkMode: 'none',
      hostInspected: true,
      roles: {
        base: evaluationRole('base'),
        expected: evaluationRole('expected'),
      },
    },
  };
}

function jsonEvidence(logicalPath, fill) {
  return {
    logicalPath,
    fileSha256: fill.repeat(64),
    canonicalSha256: fill.repeat(64),
  };
}

function fileEvidence(logicalPath, fill) {
  return { logicalPath, fileSha256: fill.repeat(64) };
}

async function fixtureProvenanceVerifier(options) {
  return {
    policy: {
      repository: options.repository,
      signerWorkflow: options.signerWorkflow,
      sourceDigest: options.sourceDigest,
      sourceRef: options.sourceRef,
      predicateType: options.predicateType,
      denySelfHostedRunners: true,
    },
    attestationFileSha256: sha256(await readFile(options.attestationPath)),
    bundleFileSha256: sha256(await readFile(options.bundlePath)),
    verificationSha256: FIXTURE_PROVENANCE_VERIFICATION_SHA256,
  };
}

function makeEvaluatorResult(taskId, contractSha256, passed, executionId) {
  const commands = [
    {
      id: 'functional-check',
      kind: 'functional',
      status: passed ? 'passed' : 'failed',
      exitCode: 0,
      durationMs: 1,
      stdoutSha256: '1'.repeat(64),
      stderrSha256: '2'.repeat(64),
    },
    {
      id: 'build-check',
      kind: 'build',
      status: 'passed',
      exitCode: 0,
      durationMs: 1,
      stdoutSha256: '3'.repeat(64),
      stderrSha256: '4'.repeat(64),
    },
  ];
  return {
    schemaVersion: 'decantr-benchmark-evaluator-result.v1',
    runId: `qualification-${executionId}-${passed ? 'expected' : 'base'}`,
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
    commands,
    failures: passed ? [] : ['functional-check:failed'],
  };
}

function makeCorpus() {
  return {
    schemaVersion: 'decantr-benchmark-corpus.v1',
    frozenAt: SEALED_AT,
    repositories: Array.from({ length: 28 }, (_, index) => {
      const sequence = String(index + 1).padStart(2, '0');
      return {
        id: `repo-${sequence}`,
        repo: `https://github.com/example/ui-repo-${sequence}`,
        framework: ['react', 'angular', 'vue', 'svelte'][index % 4],
        projectPath: `apps/repo-${sequence}`,
        commit: gitSha(1000 + index),
        tree: gitSha(2000 + index),
        license: 'MIT',
      };
    }),
  };
}

function makeProtocol() {
  return {
    schemaVersion: 'decantr-benchmark-protocol.v1',
    frozenAt: SEALED_AT,
    design: {
      taskCount: 40,
      minimumQualificationTasks: 16,
      repositoryTaskCount: 28,
      adversarialTaskCount: 12,
    },
  };
}

function makePricing() {
  return {
    schemaVersion: 'decantr-benchmark-pricing-lock.v1',
    paidPricingLocked: true,
    models: [
      {
        modelId: 'model-a',
        maximumRunCostUsd: 10,
        inputPerMillionTokensUsd: 5,
        outputPerMillionTokensUsd: 30,
      },
      {
        modelId: 'model-b',
        maximumRunCostUsd: 16,
        inputPerMillionTokensUsd: 10,
        outputPerMillionTokensUsd: 50,
      },
    ],
  };
}

function makeCandidates(corpus) {
  const repositoryCandidates = corpus.repositories.map((repository, index) =>
    makeCandidate({
      taskId: `repository.${repository.id}`,
      kind: 'repository',
      partition: index < 16 ? 'development' : 'qualification',
      repository,
      sequence: index + 1,
      historicalProjectPath: index === 0 ? 'legacy/apps/repo-01' : repository.projectPath,
    }),
  );
  const adversarialCandidates = Array.from({ length: 12 }, (_, index) => {
    const repository = corpus.repositories[index];
    return makeCandidate({
      taskId: `adversarial.case-${String(index + 1).padStart(2, '0')}`,
      kind: 'adversarial',
      partition: index < 8 ? 'development' : 'qualification',
      repository,
      sequence: 100 + index,
      historicalProjectPath: repository.projectPath,
    });
  });
  const all = [...repositoryCandidates, ...adversarialCandidates];
  const developmentRecords = all.filter((candidate) => candidate.partition === 'development');
  const qualificationRecords = all.filter((candidate) => candidate.partition === 'qualification');
  for (const [index, candidate] of qualificationRecords.entries()) {
    candidate.opaqueId = opaqueId(index + 1);
  }
  return {
    developmentCandidates: {
      schemaVersion: 'decantr-benchmark-development-task-candidates.v2',
      frozenAt: SEALED_AT,
      program: PROGRAM,
      count: developmentRecords.length,
      records: developmentRecords,
    },
    qualificationCandidates: {
      schemaVersion: 'decantr-benchmark-qualification-task-candidates.v2',
      frozenAt: SEALED_AT,
      program: PROGRAM,
      count: qualificationRecords.length,
      records: qualificationRecords,
    },
  };
}

function makeCandidate({
  taskId,
  kind,
  partition,
  repository,
  sequence,
  historicalProjectPath,
}) {
  return {
    schemaVersion: 'decantr-benchmark-task-candidate.v1',
    taskId,
    partition,
    kind,
    repository: {
      id: repository.id,
      url: repository.repo,
      framework: repository.framework,
      projectPath: historicalProjectPath,
      corpusProjectPath: repository.projectPath,
      corpusPin: repository.commit,
    },
    base: {
      commit: gitSha(10_000 + sequence),
      tree: gitSha(20_000 + sequence),
    },
    expected: {
      commit: repository.commit,
      tree: repository.tree,
    },
    prompt: `Update the primary interface behavior for neutral fixture task ${taskId}.`,
    scope: {
      allowedPaths: [`src/tasks/${taskId}.tsx`],
      forbiddenPaths: ['package-lock.json'],
    },
    environment: {
      runtime: 'node',
      packageManager: 'pnpm',
    },
  };
}

function makeEvaluatorSpec(candidate) {
  return {
    schemaVersion: 'decantr-benchmark-evaluator-authoring-spec.v2',
    taskId: candidate.taskId,
    contractId: `contract.${candidate.taskId}`,
    review: {
      status: 'approved',
      reviewedBy: 'fixture-reviewer',
      reviewedAt: REVIEWED_AT,
      notes: 'Reviewed as a candidate-independent synthetic evaluator fixture.',
    },
    oracle: {
      candidateIndependent: true,
      decantrOutputAllowed: false,
      sourcePath: `sources/${candidate.taskId}.mjs`,
    },
    commands: [
      {
        id: 'functional-check',
        kind: 'functional',
        runtime: 'controller',
        executable: 'node',
        args: [`\${EVALUATOR_ROOT}/sources/${candidate.taskId}.mjs`],
        cwd: '${WORKSPACE}',
        timeoutMs: 10_000,
        required: true,
        resultFormat: 'json-stdout',
      },
      {
        id: 'build-check',
        kind: 'build',
        runtime: 'task',
        executable: 'node',
        args: ['--version'],
        cwd: '${WORKSPACE}',
        timeoutMs: 10_000,
        required: true,
        resultFormat: 'exit-code',
      },
    ],
    limits: {
      timeoutMs: 120_000,
      maxRequests: 4,
      maxInputTokens: 10_000,
      maxOutputTokens: 2_000,
    },
  };
}

function makeDeliverySpec(candidate) {
  return {
    schemaVersion: 'decantr-benchmark-task-delivery-spec.v1',
    taskId: candidate.taskId,
    input: {
      target: { selector: `file:src/tasks/${candidate.taskId}.tsx` },
      policyCard: {
        statements: [
          {
            id: 'repository-authority',
            text: 'Preserve the repository-owned implementation and styling conventions.',
            sources: ['base-checkout'],
          },
        ],
      },
    },
    oracle: {
      expectedKind: 'file',
      acceptedStatuses: ['limited'],
      rankOneFiles: [`src/tasks/${candidate.taskId}.tsx`],
      forbiddenRankOnePatterns: ['(?:^|/)(?:tests?|fixtures?)(?:/|$)'],
      styleAuthority: { approach: 'css', confidence: 'high', files: ['src/theme.css'] },
    },
    review: {
      status: 'approved',
      reviewedBy: 'fixture-delivery-reviewer',
      reviewedAt: REVIEWED_AT,
      notes: 'Reviewed as a product-neutral shared target and policy-card fixture.',
    },
  };
}

function makeEnvironmentSpec(candidate) {
  return {
    schemaVersion: 'decantr-benchmark-task-environment.v1',
    taskId: candidate.taskId,
    partition: candidate.partition,
    base: candidate.base,
    projectPath: candidate.repository.projectPath,
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
      {
        kind: 'package-manifest',
        path: 'package.json',
        sha256: '4'.repeat(64),
        statement: 'Pinned package manifest evidence.',
      },
      {
        kind: 'lockfile',
        path: 'pnpm-lock.yaml',
        sha256: '3'.repeat(64),
        statement: 'Pinned dependency lockfile evidence.',
      },
    ],
    preparation: [{
      id: 'install-dependencies',
      executable: 'pnpm',
      args: ['install', '--frozen-lockfile'],
      cwd: '.',
      timeoutMs: 7_200_000,
      network: 'dependency-registry',
      required: true,
    }],
    cleanAfterPreparation: true,
    review: {
      status: 'approved',
      reviewedBy: 'fixture-runtime-reviewer',
      reviewedAt: REVIEWED_AT,
      notes: 'Independently reviewed exact runtime and fixed preparation commands.',
    },
  };
}

function makeOracleSource() {
  return [
    "const result = { passed: true, metrics: { functionalSuccess: true } };",
    'console.log(JSON.stringify(result));',
    '',
  ].join('\n');
}

function evaluatorSpecPath(fixture, candidate) {
  const root =
    candidate.partition === 'development'
      ? fixture.developmentEvaluatorRoot
      : fixture.qualificationEvaluatorRoot;
  return join(root, 'specs', `${candidate.taskId}.json`);
}

function evaluatorSourcePath(fixture, candidate) {
  const root =
    candidate.partition === 'development'
      ? fixture.developmentEvaluatorRoot
      : fixture.qualificationEvaluatorRoot;
  return join(root, 'sources', `${candidate.taskId}.mjs`);
}

function deliverySpecPath(fixture, candidate) {
  const root =
    candidate.partition === 'development'
      ? fixture.developmentDeliveryRoot
      : fixture.qualificationDeliveryRoot;
  return join(root, 'specs', `${candidate.taskId}.json`);
}

function qualificationReceiptPath(fixture, candidate) {
  const root = candidate.partition === 'development'
    ? fixture.developmentReceiptRoot
    : fixture.qualificationReceiptRoot;
  return join(root, `${candidate.taskId}.json`);
}

function gitSha(value) {
  return BigInt(value).toString(16).padStart(40, '0');
}

function opaqueId(value) {
  const suffix = value.toString(16).padStart(12, '0');
  return `q-00000000-0000-4000-8000-${suffix}`;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJson(path, value) {
  await writeFile(path, prettyCanonicalJson(value));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}
