import assert from 'node:assert/strict';
import { test } from 'node:test';

import { sha256, sha256Canonical } from '../runner/canonical.mjs';
import { assertHostedProbeEvidence } from './approve-hosted-probes.mjs';

const spec = {
  schemaVersion: 'decantr-benchmark-task-environment.v1',
  taskId: 'fixture.task',
  partition: 'development',
  base: {
    commit: 'a'.repeat(40),
    tree: 'b'.repeat(40),
  },
  projectPath: '.',
  profile: {
    id: 'node-22.17.0-pnpm-10.13.1',
    os: 'linux',
    arch: 'x64',
    nodeVersion: '22.17.0',
    bunVersion: null,
    packageManager: { name: 'pnpm', version: '10.13.1' },
  },
  lockfiles: [{ path: 'pnpm-lock.yaml', sha256: 'c'.repeat(64) }],
  sourceEvidence: [
    { kind: 'package-manifest', path: 'package.json', sha256: 'd'.repeat(64), statement: 'fixture manifest' },
    { kind: 'lockfile', path: 'pnpm-lock.yaml', sha256: 'c'.repeat(64), statement: 'fixture lockfile' },
  ],
  preparation: [
    {
      id: 'install-dependencies',
      executable: 'pnpm',
      args: ['install', '--frozen-lockfile'],
      cwd: '.',
      timeoutMs: 1000,
      network: 'dependency-registry',
      required: true,
    },
  ],
  cleanAfterPreparation: true,
  review: { status: 'draft', reviewedBy: null, reviewedAt: null, notes: 'Fixture review remains pending.' },
};
const specBytes = Buffer.from(`${JSON.stringify(spec, null, 2)}\n`);
const sourceCommit = 'e'.repeat(40);
const imageDigest = `sha256:${'f'.repeat(64)}`;
const imageReference = 'ghcr.io/decantr-ai/decantr-benchmark-3-10:node-22.17.0-pnpm-10.13.1';
const resolvedImageReference = `ghcr.io/decantr-ai/decantr-benchmark-3-10@${imageDigest}`;
const containerResult = {
  schemaVersion: 'decantr-benchmark-task-environment-container-probe.v1',
  taskId: spec.taskId,
  ok: true,
  versions: { runtime: 'v22.17.0', packageManager: '10.13.1' },
  benchmarkImage: resolvedImageReference,
  commands: [
    {
      ...spec.preparation[0],
      exitCode: 0,
      signal: null,
      durationMs: 50,
      stdoutSha256: '1'.repeat(64),
      stderrSha256: '2'.repeat(64),
    },
  ],
};

function makeSubject() {
  const subject = {
    schemaVersion: 'decantr-benchmark-task-environment-probe-subject.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    taskId: spec.taskId,
    partition: spec.partition,
    source: {
      repository: 'https://github.com/example/project.git',
      commit: spec.base.commit,
      tree: spec.base.tree,
      projectPath: spec.projectPath,
    },
    spec: {
      path: 'specs/fixture.task.json',
      sha256: sha256(specBytes),
      reviewStatusAtProbe: 'draft',
    },
    profile: spec.profile,
    benchmarkImage: {
      requested: imageReference,
      resolved: resolvedImageReference,
      imageId: `sha256:${'3'.repeat(64)}`,
    },
    execution: {
      repository: 'decantr-ai/decantr',
      workflow:
        'decantr-ai/decantr/.github/workflows/benchmark-3-10-environment-probes.yml@refs/heads/main',
      sourceCommit,
      sourceRef: 'refs/heads/main',
      runId: '123',
      runAttempt: '1',
      eventName: 'workflow_dispatch',
      runnerEnvironment: 'github-hosted',
      runnerOs: 'Linux',
      runnerArch: 'X64',
    },
    preparation: containerResult,
    cleanWorktree: { before: true, after: true, requiredAfter: true },
    success: true,
  };
  subject.subjectSha256 = sha256Canonical(subject);
  return subject;
}

const validationInput = {
  subject: makeSubject(),
  containerResult,
  retainedVerification: [{ verificationResult: 'verified' }],
  spec,
  specBytes,
  specPath: '/repo/specs/fixture.task.json',
  candidate: {
    taskId: spec.taskId,
    repository: { url: 'https://github.com/example/project.git' },
  },
  profile: { benchmarkImage: { reference: imageReference } },
  repositoryRoot: '/repo',
  repository: 'decantr-ai/decantr',
  workflowFile: 'benchmark-3-10-environment-probes.yml',
  sourceCommit,
  runId: '123',
};

test('accepts a fully bound successful hosted environment probe', () => {
  assert.equal(assertHostedProbeEvidence(validationInput).taskId, spec.taskId);
});

test('rejects a hosted probe with a substituted command result', () => {
  const tamperedResult = structuredClone(containerResult);
  tamperedResult.commands[0].exitCode = 1;
  const tamperedSubject = makeSubject();
  tamperedSubject.preparation = tamperedResult;
  delete tamperedSubject.subjectSha256;
  tamperedSubject.subjectSha256 = sha256Canonical(tamperedSubject);

  assert.throws(
    () =>
      assertHostedProbeEvidence({
        ...validationInput,
        subject: tamperedSubject,
        containerResult: tamperedResult,
      }),
    /preparation command/u,
  );
});
