import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  cp,
  copyFile,
  mkdtemp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { checkoutDirectory } from '../lib.mjs';
import { prettyCanonicalJson, sha256, sha256Canonical, writeCanonicalFile } from '../runner/canonical.mjs';
import { makeFixtureLockedRuntimeMatrix } from '../environments/runtime-matrix.test-helper.mjs';
import {
  assertQualificationReceipt,
  finalizeContainerQualificationTask,
  prepareEvaluatorQualificationTask,
  probePreparedEvaluatorTask,
} from './qualification-task.mjs';
import {
  FIXTURE_RUNNER_COMMIT,
  fixtureProvenanceVerifier,
  makeFixtureExecutionAttestation,
  makeFixtureQualificationInput,
} from '../test-helpers/qualification-execution.mjs';
import { hashQualificationWorkspace } from './container-orchestrator.mjs';
import { verifyPreparedWorkspaceArtifact } from '../runner/prepared-workspace-artifact.mjs';

const TASK_ID = 'fixture-ui.change-state';
const REPOSITORY_ID = 'fixture-ui';
const REPOSITORY_URL = 'https://github.com/example/fixture-ui.git';
const PREPARED_AT = '2026-07-22T18:30:00.000Z';
const QUALIFIED_AT = '2026-07-22T19:00:00.000Z';

test('host probe checks strict polarity but cannot produce materializable qualification evidence', async () => {
  const fixture = await createFixture();
  try {
    const prepared = await prepareEvaluatorQualificationTask(fixture.prepareOptions);
    assert.equal(prepared.bundle.taskId, TASK_ID);
    assert.equal(prepared.bundle.revisions.base.commit, fixture.base.commit);
    assert.equal(prepared.bundle.revisions.expected.commit, fixture.expected.commit);

    const probed = await probePreparedEvaluatorTask(fixture.executeOptions);
    assert.equal(probed.probe.materializable, false);
    assert.equal(probed.probe.executionAssurance, 'test-only-host');
    assert.equal(probed.probe.networkMode, 'none');
    assert.equal(probed.probe.candidateSha256, sha256Canonical(fixture.candidate));
    assert.match(probed.probe.probeSha256, /^[a-f0-9]{64}$/u);
    assert.throws(() => assertQualificationReceipt(probed.probe), /qualification receipt keys/u);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('container attestation plus offline GitHub provenance finalizes a materializable receipt', async () => {
  const fixture = await createFixture();
  try {
    const prepared = await prepareEvaluatorQualificationTask(fixture.prepareOptions);
    await probePreparedEvaluatorTask(fixture.executeOptions);
    const executionId = 'fixture-external-qualification';
    const artifactRoot = join(fixture.root, 'external-execution');
    const resultBindings = {};
    const results = {};
    for (const role of ['base', 'expected']) {
      const result = JSON.parse(
        await readFile(join(fixture.receiptRoot, 'results', `${TASK_ID}.${role}.json`), 'utf8'),
      );
      result.runId = `qualification-${executionId}-${role}`;
      const path = join(artifactRoot, 'evidence', role, 'output', 'result.json');
      await mkdir(join(artifactRoot, 'evidence', role, 'output'), { recursive: true });
      await writeCanonicalFile(path, result);
      results[role] = result;
      resultBindings[role] = {
        fileSha256: sha256(await readFile(path)),
        canonicalSha256: sha256Canonical(result),
      };
    }
    const contractBytes = await readFile(prepared.contractPath);
    const environmentPath = join(fixture.executeOptions.environmentRoot, 'specs', `${TASK_ID}.json`);
    const environmentBytes = await readFile(environmentPath);
    const environmentSpec = JSON.parse(environmentBytes);
    const runtimeMatrixBytes = await readFile(fixture.executeOptions.runtimeMatrixPath);
    const runtimeMatrix = JSON.parse(runtimeMatrixBytes);
    const sourceBytes = await readFile(fixture.sourcePath);
    const bundleBytes = await readFile(prepared.bundlePath);
    const preparedEnvironment = JSON.parse(
      await readFile(
        join(fixture.executeOptions.preparedRoot, TASK_ID, 'base.json'),
        'utf8',
      ),
    );
    const probedBaseWorkspace = join(
      fixture.executeOptions.workspaceRoot,
      TASK_ID,
      'base',
    );
    const baseWorkspace = join(fixture.root, 'portable-prepared-base');
    await mkdir(baseWorkspace, { recursive: true });
    git(baseWorkspace, ['init', '--quiet']);
    git(baseWorkspace, [
      'fetch',
      '--quiet',
      '--no-tags',
      probedBaseWorkspace,
      fixture.base.commit,
    ]);
    git(baseWorkspace, [
      'checkout',
      '--quiet',
      '--detach',
      fixture.base.commit,
    ]);
    await cp(
      join(probedBaseWorkspace, 'node_modules'),
      join(baseWorkspace, 'node_modules'),
      { recursive: true, preserveTimestamps: true },
    );
    const baseWorkspaceSha256 =
      await hashQualificationWorkspace(baseWorkspace);
    const qualificationInput = makeFixtureQualificationInput(fixture.candidate);
    const attestation = await makeFixtureExecutionAttestation({
      candidate: fixture.candidate,
      contractSha256: sha256(contractBytes),
      sourcePath: `sources/${TASK_ID}.mjs`,
      sourceSha256: sha256(sourceBytes),
      sourceBytes: sourceBytes.byteLength,
      environmentSpecSha256: sha256(environmentBytes),
      environmentSubstanceSha256: prepared.bundle.environmentSubstanceSha256,
      runtimeMatrixFileSha256: sha256(runtimeMatrixBytes),
      runtimeMatrixSha256: runtimeMatrix.matrixSha256,
      profile: runtimeMatrix.profiles[0],
      executionId,
      prequalificationBundleFileSha256: sha256(bundleBytes),
      prequalificationBundleSha256: prepared.bundle.bundleSha256,
      resultBindings,
      results,
      qualificationInput,
      startedAt: '2026-07-22T18:45:00.000Z',
      preparedAt: '2026-07-22T18:50:00.000Z',
      qualifiedAt: QUALIFIED_AT,
      preparedEnvironment,
      workspacePreparedSha256: { base: baseWorkspaceSha256 },
    });
    const attestationPath = join(artifactRoot, 'execution-attestation.json');
    const provenancePath = join(artifactRoot, 'execution-attestation.provenance.jsonl');
    await Promise.all([
      writeCanonicalFile(attestationPath, attestation),
      writeCanonicalFile(join(artifactRoot, 'prepared-environment.json'), preparedEnvironment),
      writeFile(provenancePath, '{"fixture":"verified"}\n'),
      mkdir(join(artifactRoot, 'qualification-input'), { recursive: true }),
    ]);
    await Promise.all([
      writeFile(join(artifactRoot, 'qualification-input', 'request.json'), qualificationInput.requestBytes),
      writeFile(join(artifactRoot, 'qualification-input', 'manifest.json'), qualificationInput.manifestBytes),
    ]);
    const finalized = await finalizeContainerQualificationTask({
      ...fixture.prepareOptions,
      receiptRoot: fixture.receiptRoot,
      executionArtifactRoot: artifactRoot,
      executionAttestationPath: attestationPath,
      provenanceBundlePath: provenancePath,
      expectedRunnerCommit: FIXTURE_RUNNER_COMMIT,
      provenanceVerifier: fixtureProvenanceVerifier,
    });
    assert.equal(finalized.receipt.executionAssurance, 'github-host-container-attested');
    assert.equal(finalized.receipt.execution.attestationSha256, attestation.attestationSha256);
    assert.equal(assertQualificationReceipt(finalized.receipt), finalized.receipt);
    assert.equal(environmentSpec.taskId, TASK_ID);

    const preparedArtifactRoot = join(
      fixture.root,
      'prepared-workspace-artifact',
    );
    const workspaceTarPath = join(preparedArtifactRoot, 'workspace.tar');
    await mkdir(preparedArtifactRoot, { recursive: true });
    await Promise.all([
      copyFile(
        attestationPath,
        join(preparedArtifactRoot, 'execution-attestation.json'),
      ),
      copyFile(
        join(artifactRoot, 'prepared-environment.json'),
        join(preparedArtifactRoot, 'prepared-environment.json'),
      ),
      copyFile(
        provenancePath,
        join(
          preparedArtifactRoot,
          'execution-attestation.provenance.jsonl',
        ),
      ),
      writeCanonicalFile(
        join(
          preparedArtifactRoot,
          'execution-attestation.provenance-verification.json',
        ),
        { fixture: 'verified' },
      ),
    ]);
    execFileSync(
      'tar',
      [
        '--create',
        '--file',
        workspaceTarPath,
        '--directory',
        baseWorkspace,
        '.',
      ],
      {
        env: { ...process.env, COPYFILE_DISABLE: '1' },
        stdio: 'ignore',
      },
    );
    const workspaceTarBytes = await readFile(workspaceTarPath);
    await writeCanonicalFile(join(preparedArtifactRoot, 'manifest.json'), {
      schemaVersion: 'decantr-benchmark-prepared-workspace-artifact.v1',
      executionAttestationFileSha256: sha256(
        await readFile(attestationPath),
      ),
      preparedEnvironmentFileSha256: sha256(
        await readFile(join(artifactRoot, 'prepared-environment.json')),
      ),
      workspaceTarFileSha256: sha256(workspaceTarBytes),
      workspacePreparedSha256: baseWorkspaceSha256,
      environmentSha256: preparedEnvironment.environmentSha256,
      provenanceFile: 'execution-attestation.provenance.jsonl',
    });

    const workspaceOutput = join(fixture.root, 'verified-workspace');
    const verification = await verifyPreparedWorkspaceArtifact({
      artifactRoot: preparedArtifactRoot,
      workspaceOutput,
      verificationOutput: join(fixture.root, 'workspace-verification.json'),
      provenanceVerifier: fixtureProvenanceVerifier,
    });
    assert.equal(verification.taskId, TASK_ID);
    assert.equal(
      verification.workspacePreparedSha256,
      baseWorkspaceSha256,
    );
    assert.equal(
      git(workspaceOutput, ['rev-parse', 'HEAD']),
      fixture.base.commit,
    );

    await writeFile(
      workspaceTarPath,
      Buffer.concat([workspaceTarBytes, Buffer.from('tampered')]),
    );
    await assert.rejects(
      verifyPreparedWorkspaceArtifact({
        artifactRoot: preparedArtifactRoot,
        workspaceOutput: join(fixture.root, 'tampered-workspace'),
        provenanceVerifier: fixtureProvenanceVerifier,
      }),
      /prepared workspace artifact differs from the signed execution/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('task qualification rejects evaluator bytes changed after preparation', async () => {
  const fixture = await createFixture();
  try {
    await prepareEvaluatorQualificationTask(fixture.prepareOptions);
    await writeFile(fixture.sourcePath, "console.log(JSON.stringify({ passed: true }));\n");
    await assert.rejects(
      probePreparedEvaluatorTask(fixture.executeOptions),
      /prequalification bundle is invalid or stale|prepared contract/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), 'decantr-qualification-task-'));
  const corpusRoot = join(root, 'corpus');
  const checkout = join(corpusRoot, checkoutDirectory(REPOSITORY_URL));
  const evaluatorRoot = join(root, 'evaluators', 'development');
  const environmentRoot = join(root, 'environments', 'development');
  const workspaceRoot = join(root, 'qualification-workspaces');
  const preparedRoot = join(root, 'prepared');
  const contractRoot = join(root, 'contracts');
  const bundleRoot = join(root, 'bundles');
  const receiptRoot = join(root, 'receipts');
  await Promise.all([
    mkdir(checkout, { recursive: true }),
    mkdir(join(evaluatorRoot, 'specs'), { recursive: true }),
    mkdir(join(evaluatorRoot, 'sources'), { recursive: true }),
    mkdir(join(environmentRoot, 'specs'), { recursive: true }),
  ]);
  await writeFile(join(checkout, '.gitignore'), 'node_modules/\n');
  await writeFile(join(checkout, 'package.json'), '{"name":"qualification-fixture","private":true}\n');
  await writeFile(join(checkout, 'package-lock.json'), '{"lockfileVersion":3}\n');
  await writeFile(
    join(checkout, 'prepare.mjs'),
    [
      "import { mkdir, writeFile } from 'node:fs/promises';",
      "await mkdir('node_modules/fixture', { recursive: true });",
      "await writeFile('node_modules/fixture/index.js', 'prepared\\n');",
    ].join('\n'),
  );
  await writeFile(join(checkout, 'state.txt'), 'base\n');
  git(checkout, ['init', '--quiet']);
  git(checkout, ['config', 'user.name', 'Qualification Fixture']);
  git(checkout, ['config', 'user.email', 'fixture@example.invalid']);
  git(checkout, ['add', '.']);
  git(checkout, ['commit', '--quiet', '-m', 'base']);
  const base = revision(checkout);
  await writeFile(join(checkout, 'state.txt'), 'expected\n');
  git(checkout, ['add', 'state.txt']);
  git(checkout, ['commit', '--quiet', '-m', 'expected']);
  const expected = revision(checkout);
  git(checkout, ['remote', 'add', 'origin', REPOSITORY_URL]);

  const candidate = {
    schemaVersion: 'decantr-benchmark-task-candidate.v1',
    taskId: TASK_ID,
    partition: 'development',
    kind: 'repository',
    prompt: 'Change the frozen fixture state from base to the expected value without unrelated edits.',
    repository: {
      id: REPOSITORY_ID,
      url: REPOSITORY_URL,
      framework: 'react',
      projectPath: '.',
      corpusProjectPath: '.',
      corpusPin: expected.commit,
      corpusTree: expected.tree,
    },
    base,
    expected,
  };
  const candidatesPath = join(root, 'candidates.json');
  await writeFile(
    candidatesPath,
    prettyCanonicalJson({
      schemaVersion: 'decantr-benchmark-development-task-candidates.v2',
      program: 'decantr-3.10-ui-change-control-proof',
      count: 1,
      records: [candidate],
    }),
  );
  const corpusPath = join(root, 'corpus.json');
  await writeFile(
    corpusPath,
    prettyCanonicalJson({
      schemaVersion: 'decantr-benchmark-corpus.v1',
      program: 'decantr-3.10-ui-change-control-proof',
      repositories: [
        {
          id: REPOSITORY_ID,
          repo: REPOSITORY_URL,
          commit: expected.commit,
          framework: 'react',
          projectPath: '.',
          partition: 'development',
        },
      ],
    }),
  );
  const sourcePath = join(evaluatorRoot, 'sources', `${TASK_ID}.mjs`);
  await writeFile(
    sourcePath,
    [
      "import { readFile } from 'node:fs/promises';",
      "import { resolve } from 'node:path';",
      "const value = await readFile(resolve(process.argv[process.argv.indexOf('--workspace') + 1], 'state.txt'), 'utf8');",
      "console.log(JSON.stringify({ passed: value.trim() === 'expected' }));",
    ].join('\n'),
  );
  await writeFile(
    join(evaluatorRoot, 'specs', `${TASK_ID}.json`),
    prettyCanonicalJson({
      schemaVersion: 'decantr-benchmark-evaluator-authoring-spec.v2',
      taskId: TASK_ID,
      contractId: `${TASK_ID}.v1`,
      review: {
        status: 'approved',
        reviewedBy: 'fixture-independent-reviewer',
        reviewedAt: '2026-07-22T17:00:00.000Z',
        notes: 'The fixture oracle and host command were independently reviewed before preparation.',
      },
      oracle: {
        candidateIndependent: true,
        decantrOutputAllowed: false,
        sourcePath: `sources/${TASK_ID}.mjs`,
      },
      commands: [
        {
          id: 'behavior',
          kind: 'functional',
          runtime: 'controller',
          executable: 'node',
          args: [
            `\${EVALUATOR_ROOT}/sources/${TASK_ID}.mjs`,
            '--workspace',
            '${WORKSPACE}',
            '--project-path',
            '${PROJECT_PATH}',
          ],
          cwd: '${EVALUATOR_ROOT}',
          timeoutMs: 10_000,
          required: true,
          resultFormat: 'json-stdout',
        },
        {
          id: 'host-build',
          kind: 'build',
          runtime: 'task',
          executable: 'node',
          args: ['--check', `\${EVALUATOR_ROOT}/sources/${TASK_ID}.mjs`],
          cwd: '${EVALUATOR_ROOT}',
          timeoutMs: 10_000,
          required: true,
          resultFormat: 'exit-code',
        },
      ],
      limits: {
        timeoutMs: 120_000,
        maxRequests: 1,
        maxInputTokens: 1,
        maxOutputTokens: 1,
      },
    }),
  );
  const nodeVersion = version('node');
  const npmVersion = version('npm');
  const profile = {
    id: `node-${nodeVersion}-npm-${npmVersion}`,
    os: 'linux',
    arch: 'x64',
    nodeVersion,
    bunVersion: null,
    packageManager: { name: 'npm', version: npmVersion },
  };
  const environmentSpec = {
    schemaVersion: 'decantr-benchmark-task-environment.v1',
    taskId: TASK_ID,
    partition: 'development',
    base,
    projectPath: '.',
    profile,
    lockfiles: [
      {
        path: 'package-lock.json',
        sha256: sha256(await readFile(join(checkout, 'package-lock.json'))),
      },
    ],
    sourceEvidence: [
      {
        kind: 'package-manifest',
        path: 'package.json',
        sha256: sha256(await readFile(join(checkout, 'package.json'))),
        statement: 'Fixture package manifest binds the runtime preparation.',
      },
      {
        kind: 'lockfile',
        path: 'package-lock.json',
        sha256: sha256(await readFile(join(checkout, 'package-lock.json'))),
        statement: 'Fixture lockfile is unchanged across both revisions.',
      },
    ],
    preparation: [
      {
        id: 'install-dependencies',
        executable: 'node',
        args: ['prepare.mjs'],
        cwd: '.',
        timeoutMs: 10_000,
        network: 'dependency-registry',
        required: true,
      },
    ],
    cleanAfterPreparation: true,
    review: {
      status: 'approved',
      reviewedBy: 'fixture-runtime-reviewer',
      reviewedAt: '2026-07-22T17:30:00.000Z',
      notes: 'The exact fixture runtime and fixed preparation command were independently reviewed.',
    },
  };
  await writeFile(
    join(environmentRoot, 'specs', `${TASK_ID}.json`),
    prettyCanonicalJson(environmentSpec),
  );
  const runtimeMatrix = makeRuntimeMatrix(profile);
  const runtimeMatrixPath = join(root, 'runtime-matrix.json');
  await writeFile(runtimeMatrixPath, prettyCanonicalJson(runtimeMatrix));
  const executionEnvironment = {
    ...process.env,
    DECANTR_TASK_RUNTIME_KIND: 'node',
    DECANTR_TASK_RUNTIME_VERSION: nodeVersion,
    DECANTR_TASK_PACKAGE_MANAGER: 'npm',
    DECANTR_TASK_PACKAGE_MANAGER_VERSION: npmVersion,
  };
  const commonOptions = {
    partition: 'development',
    taskId: TASK_ID,
    candidatesPath,
    corpusPath,
    corpusRoot,
    evaluatorRoot,
    environmentRoot,
    runtimeMatrixPath,
    workspaceRoot,
    preparedRoot,
    contractRoot,
    bundleRoot,
    executionEnvironment,
    allowHostRuntime: true,
  };
  return {
    root,
    base,
    expected,
    candidate,
    sourcePath,
    receiptRoot,
    prepareOptions: { ...commonOptions, sealedAt: PREPARED_AT },
    executeOptions: {
      ...commonOptions,
      receiptRoot,
      probedPreparationAt: PREPARED_AT,
      qualifiedAt: QUALIFIED_AT,
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

function revision(repository) {
  return {
    commit: git(repository, ['rev-parse', 'HEAD']),
    tree: git(repository, ['rev-parse', 'HEAD^{tree}']),
  };
}

function version(command) {
  return execFileSync(command, ['--version'], { encoding: 'utf8' }).trim().replace(/^v/u, '');
}

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}
