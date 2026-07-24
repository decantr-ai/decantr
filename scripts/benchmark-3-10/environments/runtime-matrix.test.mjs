import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { prettyCanonicalJson, sha256, sha256Canonical, writeCanonicalFile } from '../runner/canonical.mjs';
import { generateRuntimeMatrix } from './generate-runtime-matrix.mjs';
import { repositoryDigestForReference } from './build-runtime-profiles.mjs';
import { lockRuntimeMatrix } from './lock-runtime-matrix.mjs';
import { assertRuntimeMatrix, calculateRuntimeMatrixDigest } from './runtime-matrix.mjs';
import { makeFixtureRuntimeSourceClosure } from './runtime-matrix.test-helper.mjs';
import {
  CONTROLLER_CLAUDE_CODE_VERSION,
  CONTROLLER_CODEX_VERSION,
  CONTROLLER_IMAGE_REFERENCE,
  RUNTIME_BUILD_SUBJECT_SCHEMA_VERSION,
  RUNTIME_PREDICATE_TYPE,
  RUNTIME_REPOSITORY,
  RUNTIME_SIGNER_WORKFLOW,
  RUNTIME_SOURCE_REF,
  calculateRuntimeAttestationDigest,
  calculateRuntimeBuildSubjectDigest,
  calculateRuntimeSourceClosure,
  finalizeRuntimeProfileAttestation,
  runtimeArtifactNames,
  runtimeAttestationFileBinding,
  runtimeBaseImageReference,
  runtimeBenchmarkImageReference,
} from './runtime-profile-attestation.mjs';
import { listRuntimeProfiles } from './list-runtime-profiles.mjs';

const environmentRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(environmentRoot, '..', '..', '..');

test('runtime profile workflow uses only commit-pinned actions on a fixed GitHub-hosted image', async () => {
  const workflow = await readFile(
    join(repositoryRoot, '.github', 'workflows', 'benchmark-3-10-runtime-profiles.yml'),
    'utf8',
  );
  const actionReferences = [...workflow.matchAll(/uses:\s+[^@\s]+@([^\s]+)/gu)].map((match) => match[1]);
  assert.equal(actionReferences.length, 6);
  assert.equal(actionReferences.every((reference) => /^[a-f0-9]{40}$/u.test(reference)), true);
  assert.equal((workflow.match(/runs-on: ubuntu-24\.04/gu) ?? []).length, 2);
  assert.equal(workflow.includes('runs-on: self-hosted'), false);
  assert.equal(workflow.includes('id-token: write'), true);
  assert.equal(workflow.includes('packages: write'), true);
  assert.equal(workflow.includes('docker login ghcr.io'), true);
  assert.equal(workflow.includes('docker logout ghcr.io'), true);
  assert.equal(workflow.includes('actions/attest-build-provenance@'), true);
  assert.equal(workflow.includes('test "$RUNNER_ENVIRONMENT" = "github-hosted"'), true);
});

test('runtime base images follow the distributions published for each runtime generation', () => {
  assert.equal(
    runtimeBaseImageReference({ nodeVersion: '10.15.1', bunVersion: null }),
    'node:10.15.1-stretch-slim',
  );
  assert.equal(
    runtimeBaseImageReference({ nodeVersion: '12.22.12', bunVersion: null }),
    'node:12.22.12-buster-slim',
  );
  assert.equal(
    runtimeBaseImageReference({ nodeVersion: '16.20.2', bunVersion: null }),
    'node:16.20.2-buster-slim',
  );
  assert.equal(
    runtimeBaseImageReference({ nodeVersion: '18.20.8', bunVersion: null }),
    'node:18.20.8-bookworm-slim',
  );
  assert.equal(
    runtimeBaseImageReference({ nodeVersion: null, bunVersion: '1.3.10' }),
    'oven/bun:1.3.10-debian',
  );
  assert.throws(() => runtimeBaseImageReference({ nodeVersion: null, bunVersion: null }));
});

test('runtime Docker context excludes local private material and nested dependencies', async () => {
  const dockerignore = await readFile(join(repositoryRoot, '.dockerignore'), 'utf8');
  const patterns = new Set(
    dockerignore
      .split(/\r?\n/gu)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#')),
  );
  assert.equal(patterns.has('.private/'), true);
  assert.equal(patterns.has('**/node_modules/'), true);
});

test('runtime probes mount the empty home for the non-root benchmark identity', async () => {
  const builder = await readFile(
    join(environmentRoot, 'build-runtime-profiles.mjs'),
    'utf8',
  );
  const securityGuide = await readFile(
    join(repositoryRoot, 'scripts', 'benchmark-3-10', 'container', 'SECURITY.md'),
    'utf8',
  );
  const homeMount =
    '/home/benchmark-empty:rw,noexec,nosuid,nodev,size=128m,mode=0700,uid=10001,gid=10001';
  assert.equal(builder.includes(homeMount), true);
  assert.equal((securityGuide.match(new RegExp(homeMount, 'gu')) ?? []).length, 2);
});

test('runtime publication selects the exact GHCR repository manifest digest', () => {
  const expected = `sha256:${'1'.repeat(64)}`;
  assert.equal(
    repositoryDigestForReference(
      [
        `ghcr.io/decantr-ai/unrelated@sha256:${'2'.repeat(64)}`,
        `ghcr.io/decantr-ai/decantr-benchmark-3-10@${expected}`,
      ],
      'ghcr.io/decantr-ai/decantr-benchmark-3-10:profile',
    ),
    expected,
  );
  assert.throws(
    () =>
      repositoryDigestForReference(
        [`ghcr.io/decantr-ai/unrelated@sha256:${'2'.repeat(64)}`],
        'ghcr.io/decantr-ai/decantr-benchmark-3-10:profile',
      ),
    /exact repository manifest digest is unavailable/u,
  );
});

test('runtime matrix deduplicates profiles without exposing sealed task identities', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-runtime-matrix-'));
  try {
    const fixture = await createDraftMatrixFixture(root, { approved: 20 });
    assert.equal(fixture.result.profiles, 2);
    assert.equal(fixture.result.approved, 20);
    assert.equal(fixture.result.blockers.unapprovedTaskSpecs, 20);
    const matrix = assertRuntimeMatrix(JSON.parse(await readFile(fixture.matrixPath, 'utf8')));
    assert.equal(matrix.taskCounts.total, 40);
    assert.equal(matrix.profiles.reduce((sum, profile) => sum + profile.taskCount, 0), 40);
    assert.equal(
      matrix.profiles.every((profile) =>
        profile.benchmarkImage.reference.startsWith(
          'ghcr.io/decantr-ai/decantr-benchmark-3-10:',
        )),
      true,
    );
    const serialized = JSON.stringify(matrix);
    assert.equal(serialized.includes('qualification-task-'), false);
    const profiles = await listRuntimeProfiles({ matrixPath: fixture.matrixPath });
    assert.deepEqual(profiles, [...profiles].sort());
    assert.equal(profiles.length, 2);
    await assert.rejects(
      listRuntimeProfiles({ matrixPath: fixture.matrixPath, profile: 'missing-profile' }),
      /absent from the matrix/u,
    );
    assert.throws(
      () => assertRuntimeMatrix({ ...matrix, matrixSha256: '0'.repeat(64) }),
      /self-binding is invalid/u,
    );
    const wrongHost = structuredClone(matrix);
    wrongHost.profiles[0].os = 'darwin';
    wrongHost.matrixSha256 = calculateRuntimeMatrixDigest(wrongHost);
    assert.throws(() => assertRuntimeMatrix(wrongHost), /profile is invalid/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('runtime source closure binds every committed build-context and controller file', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-runtime-source-'));
  try {
    await Promise.all([
      mkdir(join(root, '.github', 'workflows'), { recursive: true }),
      mkdir(join(root, 'scripts', 'benchmark-3-10', 'container'), { recursive: true }),
      mkdir(join(root, 'scripts', 'benchmark-3-10', 'environments'), { recursive: true }),
    ]);
    await Promise.all([
      writeFile(join(root, '.dockerignore'), 'node_modules/\n'),
      writeFile(
        join(root, '.github', 'workflows', 'benchmark-3-10-runtime-profiles.yml'),
        'name: fixture\n',
      ),
      writeFile(join(root, 'scripts', 'benchmark-3-10', 'container', 'Dockerfile'), 'FROM scratch\n'),
      writeFile(
        join(root, 'scripts', 'benchmark-3-10', 'environments', 'build-runtime-profiles.mjs'),
        'export const fixture = true;\n',
      ),
    ]);
    git(root, ['init', '-q']);
    git(root, ['add', '.']);
    git(root, [
      '-c',
      'user.name=Runtime Fixture',
      '-c',
      'user.email=runtime@example.test',
      'commit',
      '-qm',
      'fixture',
    ]);
    const sourceCommit = git(root, ['rev-parse', 'HEAD']);
    const closure = await calculateRuntimeSourceClosure({ repositoryRoot: root, sourceCommit });
    assert.equal(closure.repositoryCommit, sourceCommit);
    assert.equal(closure.buildContext.fileCount, 3);
    assert.equal(closure.controller.fileCount, 4);
    assert.notEqual(closure.buildContext.filesSha256, closure.controller.filesSha256);

    const injected = join(root, 'scripts', 'benchmark-3-10', 'injected.mjs');
    await writeFile(injected, 'export const injected = true;\n');
    await assert.rejects(
      calculateRuntimeSourceClosure({ repositoryRoot: root, sourceCommit }),
      /changed, missing, ignored, or untracked files/u,
    );
    await rm(injected);
    await writeFile(join(root, 'scripts', 'benchmark-3-10', 'container', 'Dockerfile'), 'FROM busybox\n');
    await assert.rejects(
      calculateRuntimeSourceClosure({ repositoryRoot: root, sourceCommit }),
      /differs from the committed controller/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('runtime matrix lock reverifies retained GitHub OIDC provenance and rejects local claims', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-runtime-lock-'));
  try {
    const fixture = await createDraftMatrixFixture(root, { approved: 40 });
    const draft = JSON.parse(await readFile(fixture.matrixPath, 'utf8'));
    const outputPath = join(root, 'matrix.locked.json');
    const attestationRoot = join(root, 'attestations');
    await mkdir(attestationRoot);
    const source = makeFixtureRuntimeSourceClosure();
    const provenanceCalls = [];
    const commandRunner = makeProvenanceCommandRunner(provenanceCalls);
    const expectedAttestations = new Map();
    for (const [index, profile] of draft.profiles.entries()) {
      const subject = makeRuntimeBuildSubject(profile, draft, source, index);
      const names = runtimeArtifactNames(profile.id);
      await writeCanonicalFile(join(attestationRoot, names.subject), subject);
      await writeFile(join(attestationRoot, names.bundle), `{"bundle":"${profile.id}"}\n`);
      await finalizeRuntimeProfileAttestation({
        artifactRoot: attestationRoot,
        profileId: profile.id,
        commandRunner,
      });
      const attestation = JSON.parse(
        await readFile(join(attestationRoot, names.attestation), 'utf8'),
      );
      expectedAttestations.set(profile.id, attestation);
    }

    const firstProfile = draft.profiles[0];
    const firstNames = runtimeArtifactNames(firstProfile.id);
    const firstAttestationPath = join(attestationRoot, firstNames.attestation);
    const canonicalFirst = await readFile(firstAttestationPath);
    await writeFile(firstAttestationPath, Buffer.concat([canonicalFirst, Buffer.from('\n')]));
    await assert.rejects(
      lockRuntimeMatrix(lockOptions(fixture.matrixPath, attestationRoot, outputPath, source, commandRunner)),
      /attestation file is not canonical/u,
    );
    await writeFile(firstAttestationPath, canonicalFirst);

    const selfHosted = JSON.parse(canonicalFirst.toString('utf8'));
    selfHosted.subject.execution.runnerEnvironment = 'self-hosted';
    selfHosted.subject.subjectSha256 = calculateRuntimeBuildSubjectDigest(selfHosted.subject);
    selfHosted.attestationSha256 = calculateRuntimeAttestationDigest(selfHosted);
    await writeCanonicalFile(firstAttestationPath, selfHosted);
    await assert.rejects(
      lockRuntimeMatrix(lockOptions(fixture.matrixPath, attestationRoot, outputPath, source, commandRunner)),
      /GitHub-hosted execution identity/u,
    );
    await writeFile(firstAttestationPath, canonicalFirst);

    const bundlePath = join(attestationRoot, firstNames.bundle);
    const canonicalBundle = await readFile(bundlePath);
    await writeFile(bundlePath, Buffer.concat([canonicalBundle, Buffer.from('tampered')]));
    await assert.rejects(
      lockRuntimeMatrix(lockOptions(fixture.matrixPath, attestationRoot, outputPath, source, commandRunner)),
      /provenance bundle file binding is invalid/u,
    );
    await writeFile(bundlePath, canonicalBundle);

    const failedRunner = async () => ({ exitCode: 1, stdout: '', stderr: 'untrusted bundle' });
    await assert.rejects(
      lockRuntimeMatrix(lockOptions(fixture.matrixPath, attestationRoot, outputPath, source, failedRunner)),
      /GitHub runtime provenance verification failed/u,
    );

    const wrongSource = structuredClone(source);
    wrongSource.buildContext.filesSha256 = 'b'.repeat(64);
    wrongSource.sourceClosureSha256 = sha256Canonical(
      Object.fromEntries(Object.entries(wrongSource).filter(([key]) => key !== 'sourceClosureSha256')),
    );
    await assert.rejects(
      lockRuntimeMatrix(lockOptions(fixture.matrixPath, attestationRoot, outputPath, wrongSource, commandRunner)),
      /exact local reviewed source closure/u,
    );

    const lockedAt = '2026-07-22T14:00:00.000Z';
    await lockRuntimeMatrix({
      ...lockOptions(fixture.matrixPath, attestationRoot, outputPath, source, commandRunner),
      lockedAt,
    });
    const locked = assertRuntimeMatrix(JSON.parse(await readFile(outputPath, 'utf8')), { requireLocked: true });
    assert.equal(locked.frozenAt, lockedAt);
    assert.equal(locked.provenance.draftMatrix.sha256, draft.matrixSha256);
    assert.deepEqual(locked.provenance.source, source);
    assert.equal(locked.provenance.executionPolicy.denySelfHostedRunners, true);
    for (const profile of locked.profiles) {
      const expected = expectedAttestations.get(profile.id);
      assert.deepEqual(profile.verification.attestation, expected);
      assert.deepEqual(profile.verification.attestationFile, runtimeAttestationFileBinding(expected));
      assert.equal(profile.benchmarkImage.digest, expected.subject.benchmarkImage.digest);
    }
    assert.equal(provenanceCalls.length >= draft.profiles.length * 2, true);
    for (const call of provenanceCalls) {
      assert.equal(call.command, 'gh');
      assert.equal(call.args.includes('--deny-self-hosted-runners'), true);
      assert.equal(call.args.includes('--signer-digest'), true);
      assert.equal(call.args.includes('--source-digest'), true);
      assert.equal(call.args.includes(RUNTIME_SIGNER_WORKFLOW), true);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

async function createDraftMatrixFixture(root, options) {
  const developmentRoot = join(root, 'development');
  const qualificationRoot = join(root, 'qualification');
  const matrixPath = join(root, 'matrix.draft.json');
  const protocolPath = join(root, 'protocol.json');
  await mkdir(join(developmentRoot, 'specs'), { recursive: true });
  await mkdir(join(qualificationRoot, 'specs'), { recursive: true });
  await writeCanonicalFile(protocolPath, {
    schemaVersion: 'decantr-benchmark-protocol.v1',
    frozenAt: '2026-07-22T12:00:00.000Z',
  });
  for (let index = 0; index < 40; index += 1) {
    const partition = index < 24 ? 'development' : 'qualification';
    const taskId = `${partition}-task-${String(index + 1).padStart(2, '0')}`;
    const rootPath = partition === 'development' ? developmentRoot : qualificationRoot;
    await writeCanonicalFile(
      join(rootPath, 'specs', `${taskId}.json`),
      environmentSpec(taskId, partition, index % 2 === 0, index < options.approved),
    );
  }
  const result = await generateRuntimeMatrix({
    protocolPath,
    developmentRoot,
    qualificationRoot,
    outputPath: matrixPath,
  });
  return { matrixPath, result };
}

function environmentSpec(taskId, partition, alternate, approved) {
  const profile = alternate
    ? {
        id: 'node-22.19.0-pnpm-10.33.0',
        os: 'linux',
        arch: 'x64',
        nodeVersion: '22.19.0',
        bunVersion: null,
        packageManager: { name: 'pnpm', version: '10.33.0' },
      }
    : {
        id: 'node-20.11.1-npm-10.2.4',
        os: 'linux',
        arch: 'x64',
        nodeVersion: '20.11.1',
        bunVersion: null,
        packageManager: { name: 'npm', version: '10.2.4' },
      };
  return {
    schemaVersion: 'decantr-benchmark-task-environment.v1',
    taskId,
    partition,
    base: { commit: '1'.repeat(40), tree: '2'.repeat(40) },
    projectPath: '.',
    profile,
    lockfiles: [{ path: 'package-lock.json', sha256: '3'.repeat(64) }],
    sourceEvidence: [
      { kind: 'package-manifest', path: 'package.json', sha256: '4'.repeat(64), statement: 'Fixture package manifest evidence.' },
      { kind: 'lockfile', path: 'package-lock.json', sha256: '3'.repeat(64), statement: 'Fixture lockfile evidence.' },
    ],
    preparation: [{
      id: 'install-dependencies',
      executable: profile.packageManager.name,
      args: profile.packageManager.name === 'npm' ? ['ci'] : ['install', '--frozen-lockfile'],
      cwd: '.',
      timeoutMs: 10_000,
      network: 'dependency-registry',
      required: true,
    }],
    cleanAfterPreparation: true,
    review: approved
      ? {
          status: 'approved',
          reviewedBy: 'fixture-runtime-reviewer',
          reviewedAt: '2026-07-22T13:00:00.000Z',
          notes: 'Independently reviewed fixture runtime and preparation commands.',
        }
      : {
          status: 'draft',
          reviewedBy: null,
          reviewedAt: null,
          notes: 'Independent runtime and preparation review remains required.',
        },
  };
}

function makeRuntimeBuildSubject(profile, draft, source, index) {
  const runtimeKind = profile.nodeVersion === null ? 'bun' : 'node';
  const subject = {
    schemaVersion: RUNTIME_BUILD_SUBJECT_SCHEMA_VERSION,
    profileId: profile.id,
    profileSha256: profile.profileSha256,
    matrix: {
      draftSha256: draft.matrixSha256,
      sourceSpecSetSha256: draft.sourceSpecSetSha256,
    },
    baseImage: { reference: profile.baseImage.reference, digest: `sha256:${String(5 + index).repeat(64)}` },
    benchmarkImage: {
      reference: runtimeBenchmarkImageReference(
        profile.id,
        `sha256:${String(3 + index).repeat(64)}`,
      ),
      digest: `sha256:${String(7 + index).repeat(64)}`,
    },
    runtimeKind,
    runtimeVersion: profile.nodeVersion ?? profile.bunVersion,
    packageManagerName: profile.packageManager.name,
    packageManagerVersion: profile.packageManager.version,
    controller: {
      image: { reference: CONTROLLER_IMAGE_REFERENCE, digest: `sha256:${'4'.repeat(64)}` },
      nodeVersion: 'v22.17.0',
      codexVersion: CONTROLLER_CODEX_VERSION,
      claudeCodeVersion: CONTROLLER_CLAUDE_CODE_VERSION,
    },
    browserSmokePassed: true,
    verifiedAt: '2026-07-22T13:00:00.000Z',
    host: { os: 'linux', arch: 'x64' },
    source,
    execution: {
      repository: RUNTIME_REPOSITORY,
      workflow: RUNTIME_SIGNER_WORKFLOW,
      workflowRef: `${RUNTIME_SIGNER_WORKFLOW}@${RUNTIME_SOURCE_REF}`,
      workflowSha: source.repositoryCommit,
      sourceCommit: source.repositoryCommit,
      sourceRef: RUNTIME_SOURCE_REF,
      runId: String(10_000 + index),
      runAttempt: '1',
      job: 'probe',
      eventName: 'workflow_dispatch',
      runnerEnvironment: 'github-hosted',
      runnerOs: 'Linux',
      runnerArch: 'X64',
      runnerImage: 'ubuntu24',
      runnerImageVersion: '20260720.1',
    },
  };
  subject.subjectSha256 = calculateRuntimeBuildSubjectDigest(subject);
  return subject;
}

function makeProvenanceCommandRunner(calls) {
  return async (command, args) => {
    calls.push({ command, args: [...args] });
    const subjectPath = args[2];
    const subjectBytes = await readFile(subjectPath);
    const subject = JSON.parse(subjectBytes.toString('utf8'));
    return {
      exitCode: 0,
      stderr: '',
      stdout: JSON.stringify([
        {
          attestation: { fixture: true },
          verificationResult: {
            statement: {
              predicateType: RUNTIME_PREDICATE_TYPE,
              subject: [
                {
                  name: runtimeArtifactNames(subject.profileId).subject,
                  digest: { sha256: sha256(subjectBytes) },
                },
              ],
            },
          },
        },
      ]),
    };
  };
}

function lockOptions(matrixPath, attestationRoot, outputPath, source, commandRunner) {
  return {
    matrixPath,
    attestationRoot,
    outputPath,
    lockedAt: '2026-07-22T14:00:00.000Z',
    sourceClosureProvider: async () => structuredClone(source),
    provenanceCommandRunner: commandRunner,
  };
}

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}
