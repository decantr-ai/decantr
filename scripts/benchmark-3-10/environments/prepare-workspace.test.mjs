import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { prettyCanonicalJson, sha256, sha256Canonical } from '../runner/canonical.mjs';
import { taskEnvironmentSubstanceSha256 } from './contracts.mjs';
import { prepareWorkspace } from './prepare-workspace.mjs';
import {
  assertPreparedEnvironment,
  discoverDependencyRoots,
  hashDependencyRoots,
  verifyPreparedDependencyTree,
} from './prepared-environment.mjs';
import { makeFixtureLockedRuntimeMatrix } from './runtime-matrix.test-helper.mjs';

test('workspace preparation binds the reviewed spec, runtime image, lockfile, and dependency tree', async () => {
  const fixture = await createFixture();
  try {
    const attestation = await prepareWorkspace(fixture.options);
    assertPreparedEnvironment(attestation, {
      task: fixture.task,
      runtimeMatrix: fixture.runtimeMatrix,
      environmentSpec: fixture.spec,
    });
    assert.equal(attestation.environmentSubstanceSha256, taskEnvironmentSubstanceSha256(fixture.spec));
    assert.equal(attestation.revisionRole, 'base');
    assert.deepEqual(attestation.revision, fixture.spec.base);
    await verifyPreparedDependencyTree(fixture.workspace, attestation);

    await writeFile(join(fixture.workspace, 'node_modules', 'fixture-package', 'index.js'), 'drifted\n');
    await assert.rejects(
      verifyPreparedDependencyTree(fixture.workspace, attestation),
      /prepared dependency tree drifted/u,
    );

    await writeFile(join(fixture.workspace, 'node_modules', 'fixture-package', 'index.js'), 'fixture\n');
    await mkdir(join(fixture.workspace, 'nested', 'node_modules', 'unexpected'), { recursive: true });
    await writeFile(join(fixture.workspace, 'nested', 'node_modules', 'unexpected', 'index.js'), 'unexpected\n');
    await assert.rejects(
      verifyPreparedDependencyTree(fixture.workspace, attestation),
      /prepared dependency root set drifted/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('workspace preparation refuses a dependency command without the registry-only preparation policy', async () => {
  const fixture = await createFixture();
  try {
    await assert.rejects(
      prepareWorkspace({ ...fixture.options, networkPolicy: 'none' }),
      /requires a registry-only preparation network/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('workspace preparation rejects source evidence whose reviewed digest differs from frozen workspace bytes', async () => {
  const fixture = await createFixture();
  try {
    fixture.spec.sourceEvidence[0].sha256 = '0'.repeat(64);
    await writeFile(fixture.options.environmentSpecPath, prettyCanonicalJson(fixture.spec));
    await assert.rejects(
      prepareWorkspace(fixture.options),
      /source evidence digest drift: package\.json/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('dependency discovery and hashing include a top-level symlinked node_modules root', async () => {
  const fixture = await createDependencyFixture();
  try {
    await mkdir(join(fixture.workspace, 'dependency-store', 'fixture-package'), { recursive: true });
    await writeFile(join(fixture.workspace, 'dependency-store', 'fixture-package', 'index.js'), 'fixture\n');
    await symlink('dependency-store', join(fixture.workspace, 'node_modules'), 'dir');

    const roots = await discoverDependencyRoots(fixture.workspace);
    assert.deepEqual(roots, ['node_modules']);
    const digest = await hashDependencyRoots(fixture.workspace, roots);
    assert.ok(digest.entryCount > 0);
    assert.match(digest.sha256, /^[a-f0-9]{64}$/u);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('dependency hashing rejects a nested symlink whose target escapes the workspace', async () => {
  const fixture = await createDependencyFixture();
  try {
    const externalStore = join(fixture.root, 'external-store');
    await mkdir(join(fixture.workspace, 'node_modules'), { recursive: true });
    await mkdir(externalStore);
    await writeFile(join(externalStore, 'index.js'), 'external\n');
    await symlink(externalStore, join(fixture.workspace, 'node_modules', 'external-package'), 'dir');

    await assert.rejects(
      hashDependencyRoots(fixture.workspace, ['node_modules']),
      /dependency symlink escapes workspace: node_modules\/external-package/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('dependency hashing binds content reached through an internal symlink', async () => {
  const fixture = await createDependencyFixture();
  try {
    const linkedPackage = join(fixture.workspace, 'packages', 'linked-package');
    await mkdir(join(fixture.workspace, 'node_modules'), { recursive: true });
    await mkdir(linkedPackage, { recursive: true });
    await writeFile(join(linkedPackage, 'index.js'), 'original\n');
    await symlink('../packages/linked-package', join(fixture.workspace, 'node_modules', 'linked-package'), 'dir');
    const dependencyRoots = ['node_modules'];
    const original = await hashDependencyRoots(fixture.workspace, dependencyRoots);
    const attestation = {
      taskId: 'internal-symlink-fixture',
      dependencyRoots,
      dependencyTreeSha256: original.sha256,
      dependencyEntryCount: original.entryCount,
    };

    await writeFile(join(linkedPackage, 'index.js'), 'drifted\n');
    await assert.rejects(
      verifyPreparedDependencyTree(fixture.workspace, attestation),
      /prepared dependency tree drifted/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('workspace preparation binds an expected revision without changing the reviewed base contract', async () => {
  const fixture = await createFixture();
  try {
    await writeFile(join(fixture.workspace, 'expected.txt'), 'expected candidate revision\n');
    git(fixture.workspace, ['add', 'expected.txt']);
    git(fixture.workspace, ['commit', '--quiet', '-m', 'expected']);
    const revision = {
      commit: git(fixture.workspace, ['rev-parse', 'HEAD']).trim(),
      tree: git(fixture.workspace, ['rev-parse', 'HEAD^{tree}']).trim(),
    };

    const attestation = await prepareWorkspace({
      ...fixture.options,
      outputPath: join(fixture.root, 'prepared-expected.json'),
      revisionRole: 'expected',
      revision,
      candidateSha256: '9'.repeat(64),
    });

    assert.deepEqual(attestation.base, fixture.spec.base);
    assert.equal(attestation.revisionRole, 'expected');
    assert.deepEqual(attestation.revision, revision);
    assertPreparedEnvironment(attestation, {
      task: fixture.task,
      revisionRole: 'expected',
      revision,
      candidateSha256: '9'.repeat(64),
      runtimeMatrix: fixture.runtimeMatrix,
      environmentSpec: fixture.spec,
    });
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), 'decantr-prepare-workspace-'));
  const workspace = join(root, 'workspace');
  await mkdir(workspace);
  await writeFile(join(workspace, '.gitignore'), 'node_modules/\n');
  await writeFile(join(workspace, 'package.json'), '{"name":"prepared-fixture","private":true}\n');
  await writeFile(join(workspace, 'package-lock.json'), '{"lockfileVersion":3}\n');
  await writeFile(
    join(workspace, 'prepare.mjs'),
    [
      "import { mkdir, writeFile } from 'node:fs/promises';",
      "await mkdir('node_modules/fixture-package', { recursive: true });",
      "await writeFile('node_modules/fixture-package/index.js', 'fixture\\n');",
    ].join('\n'),
  );
  git(workspace, ['init', '--quiet']);
  git(workspace, ['config', 'user.email', 'benchmark@example.invalid']);
  git(workspace, ['config', 'user.name', 'Benchmark Fixture']);
  git(workspace, ['add', '.']);
  git(workspace, ['commit', '--quiet', '-m', 'fixture']);
  const commit = git(workspace, ['rev-parse', 'HEAD']).trim();
  const tree = git(workspace, ['rev-parse', 'HEAD^{tree}']).trim();
  const nodeVersion = normalizeVersion(execFileSync('node', ['--version'], { encoding: 'utf8' }));
  const npmVersion = normalizeVersion(execFileSync('npm', ['--version'], { encoding: 'utf8' }));
  const profile = {
    id: `node-${nodeVersion}-npm-${npmVersion}`,
    os: 'linux',
    arch: 'x64',
    nodeVersion,
    bunVersion: null,
    packageManager: { name: 'npm', version: npmVersion },
  };
  const spec = {
    schemaVersion: 'decantr-benchmark-task-environment.v1',
    taskId: 'prepared-fixture',
    partition: 'development',
    base: { commit, tree },
    projectPath: '.',
    profile,
    lockfiles: [{ path: 'package-lock.json', sha256: sha256(await readFile(join(workspace, 'package-lock.json'))) }],
    sourceEvidence: [
      {
        kind: 'package-manifest',
        path: 'package.json',
        sha256: sha256(await readFile(join(workspace, 'package.json'))),
        statement: 'Fixture package manifest pins the preparation workspace.',
      },
      {
        kind: 'lockfile',
        path: 'package-lock.json',
        sha256: sha256(await readFile(join(workspace, 'package-lock.json'))),
        statement: 'Fixture lockfile is immutable across preparation.',
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
      reviewedBy: 'fixture-independent-reviewer',
      reviewedAt: '2026-07-22T18:00:00.000Z',
      notes: 'The exact fixture runtime and fixed preparation command were independently reviewed.',
    },
  };
  const environmentSpecPath = join(root, 'environment.json');
  await writeFile(environmentSpecPath, prettyCanonicalJson(spec));
  const runtimeMatrix = makeRuntimeMatrix(profile);
  const runtimeMatrixPath = join(root, 'runtime-matrix.json');
  await writeFile(runtimeMatrixPath, prettyCanonicalJson(runtimeMatrix));
  const task = {
    taskId: spec.taskId,
    base: spec.base,
    environment: {
      specSha256: sha256(await readFile(environmentSpecPath)),
      substanceSha256: taskEnvironmentSubstanceSha256(spec),
      runtimeProfileId: profile.id,
    },
  };
  return {
    root,
    workspace,
    spec,
    task,
    runtimeMatrix,
    options: {
      environmentSpecPath,
      runtimeMatrixPath,
      workspace,
      outputPath: join(root, 'prepared.json'),
      networkPolicy: 'dependency-registry',
      preparedAt: '2026-07-22T18:30:00.000Z',
      environment: process.env,
      allowHostRuntime: true,
    },
  };
}

async function createDependencyFixture() {
  const root = await mkdtemp(join(tmpdir(), 'decantr-prepared-dependencies-'));
  const workspace = join(root, 'workspace');
  await mkdir(workspace);
  return { root, workspace };
}

function makeRuntimeMatrix(sourceProfile) {
  return makeFixtureLockedRuntimeMatrix({
    profile: sourceProfile,
    draftFrozenAt: '2026-07-22T17:00:00.000Z',
    verifiedAt: '2026-07-22T17:30:00.000Z',
    lockedAt: '2026-07-22T18:00:00.000Z',
  });
}

function normalizeVersion(value) {
  return String(value).trim().replace(/^v/u, '');
}

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' });
}
