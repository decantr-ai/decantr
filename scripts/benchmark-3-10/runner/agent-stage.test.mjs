import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import {
  calculatePreparedAttestationDigest,
  calculatePreparedEnvironmentIdentity,
  discoverDependencyRoots,
  hashDependencyRoots,
} from '../environments/prepared-environment.mjs';
import { prettyCanonicalJson, sha256, sha256Canonical, writeCanonicalFile } from './canonical.mjs';
import { assertSanitizedAgentRequest, executeAgentStage } from './agent-stage.mjs';

const benchmarkRoot = dirname(new URL('../model-proxy/fake-adapter.mjs', import.meta.url).pathname);
const fakeAdapter = join(benchmarkRoot, 'fake-adapter.mjs');

test('agent stage executes a no-cost adapter and emits a non-production signed-subject candidate', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-agent-stage-'));
  try {
    const workspace = join(root, 'workspace');
    await createRepository(workspace);
    const preparedPath = join(root, 'prepared.json');
    const prepared = await createPreparedEnvironment(workspace);
    await writeCanonicalFile(preparedPath, prepared);
    const preparedBytes = await readFile(preparedPath);
    const requestPath = join(root, 'request.json');
    const request = adapterRequest(workspace, prepared, sha256(preparedBytes));
    await writeCanonicalFile(requestPath, request);
    const result = await executeAgentStage(
      {
        requestPath,
        workspace,
        preparedEnvironmentPath: preparedPath,
        outputRoot: join(root, 'output'),
        adapterCommand: process.execPath,
        adapterArgs: [fakeAdapter],
        agentImageReference:
          `ghcr.io/decantr-ai/decantr-benchmark-3-10-agent:fixture@sha256:${'2'.repeat(64)}`,
        agentImageDigest: `sha256:${'2'.repeat(64)}`,
        partition: 'development',
        paid: false,
        execution: localExecution('agent'),
        createdAt: '2026-07-24T18:00:00.000Z',
      },
    );
    assert.equal(result.attestation.status, 'completed');
    assert.equal(result.attestation.productionEligible, false);
    assert.equal(result.attestation.output.providerReceiptFile, null);
    assert.equal(result.attestation.isolation.providerCredentialPresent, false);
    assert.equal(result.delta.changedPaths.length, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('sanitized agent request rejects hidden-stage fields and a different image', () => {
  const request = adapterRequest('/work', {
    environmentSha256: 'a'.repeat(64),
    environmentSpecSha256: 'b'.repeat(64),
    environmentSubstanceSha256: 'c'.repeat(64),
    runtimeMatrixSha256: 'd'.repeat(64),
    base: { commit: 'e'.repeat(40), tree: 'f'.repeat(40) },
  }, '1'.repeat(64));
  assert.throws(
    () =>
      assertSanitizedAgentRequest(
        { ...request, evaluatorContract: 'forbidden' },
        { workspace: '/work', agentImageDigest: `sha256:${'2'.repeat(64)}` },
      ),
    /fields are invalid|forbidden material/u,
  );
  assert.throws(
    () =>
      assertSanitizedAgentRequest(request, {
        workspace: '/work',
        agentImageDigest: `sha256:${'3'.repeat(64)}`,
      }),
    /agent image differs/u,
  );
});

async function createRepository(root) {
  await mkdir(join(root, 'node_modules', 'fixture'), { recursive: true });
  await Promise.all([
    writeFile(join(root, 'package.json'), '{"name":"fixture","private":true}\n'),
    writeFile(join(root, 'package-lock.json'), '{"lockfileVersion":3}\n'),
    writeFile(join(root, '.gitignore'), 'node_modules/\n'),
    writeFile(join(root, 'node_modules', 'fixture', 'package.json'), '{"name":"fixture"}\n'),
  ]);
  git(root, ['init', '-q']);
  git(root, ['add', '.']);
  git(root, [
    '-c',
    'user.name=Agent Fixture',
    '-c',
    'user.email=agent@example.test',
    'commit',
    '-qm',
    'base',
  ]);
}

async function createPreparedEnvironment(workspace) {
  const dependencyRoots = await discoverDependencyRoots(workspace);
  const dependencyTree = await hashDependencyRoots(workspace, dependencyRoots);
  const base = {
    commit: git(workspace, ['rev-parse', 'HEAD']),
    tree: git(workspace, ['rev-parse', 'HEAD^{tree}']),
  };
  const attestation = {
    schemaVersion: 'decantr-benchmark-prepared-environment.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    taskId: 'task-fixture',
    environmentSpecSha256: 'b'.repeat(64),
    environmentSubstanceSha256: 'c'.repeat(64),
    runtimeMatrixSha256: 'd'.repeat(64),
    runtimeProfileId: 'node-22.19.0-pnpm-10.33.0',
    benchmarkImageDigest: `sha256:${'1'.repeat(64)}`,
    base,
    revisionRole: 'base',
    revision: structuredClone(base),
    candidateSha256: null,
    lockfiles: [
      { path: 'package-lock.json', sha256: sha256(await readFile(join(workspace, 'package-lock.json'))) },
    ],
    steps: [
      {
        id: 'install',
        network: 'none',
        commandSha256: '2'.repeat(64),
        exitCode: 0,
        durationMs: 1,
        stdoutSha256: '3'.repeat(64),
        stderrSha256: '4'.repeat(64),
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

function adapterRequest(workspace, prepared, preparedFileSha256) {
  return {
    schemaVersion: 'decantr-benchmark-adapter-request.v1',
    runId: 'run-fixture',
    taskId: 'task-fixture',
    modelId: 'openai-gpt-5.6-sol',
    provider: 'openai',
    requestedModel: 'gpt-5.6-sol',
    reasoningEffort: 'high',
    maxRunCostUsd: 10,
    arm: 'control',
    repetition: 1,
    prompt: 'Implement the fixture.',
    context: '{"arm":"control"}',
    informationEntitlement: { taskInput: { target: { selector: 'file:package.json' } } },
    workspace,
    projectPath: '.',
    scope: { allowedPaths: ['package.json'], forbiddenPaths: [] },
    limits: {
      timeoutMs: 30_000,
      maxRequests: 4,
      maxInputTokens: 10_000,
      maxOutputTokens: 2_000,
    },
    isolation: {
      home: '/home/benchmark-empty',
      personalSkills: false,
      personalMcp: false,
      hostConfiguration: false,
      network: 'none',
    },
    bindings: {
      authorizationSha256: 'a'.repeat(64),
      planSha256: '5'.repeat(64),
      taskManifestSha256: '6'.repeat(64),
      candidateManifestSha256: '0'.repeat(64),
      candidateTarballSetSha256: '7'.repeat(64),
      runtimeMatrixSha256: prepared.runtimeMatrixSha256,
      preparedEnvironmentAttestationSha256: preparedFileSha256,
      environmentSha256: prepared.environmentSha256,
      environmentSpecSha256: prepared.environmentSpecSha256,
      environmentSubstanceSha256: prepared.environmentSubstanceSha256,
      agentControllerSha256: '8'.repeat(64),
      agentImageDigest: `sha256:${'2'.repeat(64)}`,
      informationEntitlementSha256: sha256Canonical({
        taskInput: { target: { selector: 'file:package.json' } },
      }),
      deliverySha256: '9'.repeat(64),
      baseCommit: prepared.base.commit,
      baseTree: prepared.base.tree,
    },
  };
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
