import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { makeFixtureLockedRuntimeMatrix } from '../environments/runtime-matrix.test-helper.mjs';
import { checkoutDirectory } from '../lib.mjs';
import { prettyCanonicalJson, sha256 } from '../runner/canonical.mjs';
import { buildQualificationInput, hydrateQualificationInput } from './qualification-input.mjs';

const TASK_ID = 'fixture-input.snapshot';
const REPOSITORY_URL = 'https://github.com/example/qualification-input.git';
const RUNNER_COMMIT = 'a'.repeat(40);
const PROXY_DIGEST = `sha256:${'b'.repeat(64)}`;

test('qualification input stages content-bound Git snapshots and hydrates exact revisions', async () => {
  const fixture = await createFixture();
  try {
    const built = await buildQualificationInput(fixture.options);
    assert.equal(built.request.taskId, TASK_ID);
    assert.equal(built.manifest.files.some((item) => item.path === 'snapshots/base.pack'), true);
    await hydrateQualificationInput({
      inputRoot: fixture.outputRoot,
      request: 'request.json',
      workspaceRoot: fixture.workspaceRoot,
    });
    for (const role of ['base', 'expected']) {
      const workspace = join(fixture.workspaceRoot, role);
      assert.equal(git(workspace, ['rev-parse', 'HEAD']), fixture[role].commit);
      assert.equal(git(workspace, ['rev-parse', 'HEAD^{tree}']), fixture[role].tree);
      assert.equal(git(workspace, ['status', '--porcelain=v1', '--untracked-files=all']), '');
      assert.equal(
        (await readFile(join(workspace, 'state.txt'), 'utf8')).trim(),
        role === 'base' ? 'base' : 'expected',
      );
    }
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('qualification input hydration rejects a file changed after sealing', async () => {
  const fixture = await createFixture();
  try {
    await buildQualificationInput(fixture.options);
    await writeFile(join(fixture.outputRoot, 'candidate.json'), '{}\n');
    await assert.rejects(
      hydrateQualificationInput({
        inputRoot: fixture.outputRoot,
        request: 'request.json',
        workspaceRoot: fixture.workspaceRoot,
      }),
      /differs from its manifest/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('qualification input hydration rejects unsealed artifact files', async () => {
  const fixture = await createFixture();
  try {
    await buildQualificationInput(fixture.options);
    await writeFile(join(fixture.outputRoot, 'unsealed.txt'), 'not reviewed\n');
    await assert.rejects(
      hydrateQualificationInput({
        inputRoot: fixture.outputRoot,
        request: 'request.json',
        workspaceRoot: fixture.workspaceRoot,
      }),
      /missing or unsealed files/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), 'decantr-qualification-input-'));
  const corpusRoot = join(root, 'corpus');
  const checkout = join(corpusRoot, checkoutDirectory(REPOSITORY_URL));
  const evaluatorRoot = join(root, 'evaluators');
  const environmentRoot = join(root, 'environments');
  const outputRoot = join(root, 'qualification-input');
  const workspaceRoot = join(root, 'qualification-workspaces');
  await Promise.all([
    mkdir(checkout, { recursive: true }),
    mkdir(join(evaluatorRoot, 'specs'), { recursive: true }),
    mkdir(join(evaluatorRoot, 'sources'), { recursive: true }),
    mkdir(join(environmentRoot, 'specs'), { recursive: true }),
  ]);
  await writeFile(join(checkout, 'package.json'), '{"name":"qualification-input-fixture","private":true}\n');
  await writeFile(join(checkout, 'package-lock.json'), '{"lockfileVersion":3}\n');
  await writeFile(join(checkout, 'state.txt'), 'base\n');
  git(checkout, ['init', '--quiet']);
  git(checkout, ['config', 'user.name', 'Qualification Input Fixture']);
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
    prompt: 'Change the frozen state from base to expected while preserving all unrelated files.',
    repository: {
      id: 'qualification-input-fixture',
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
  await writeJson(candidatesPath, {
    schemaVersion: 'decantr-benchmark-development-task-candidates.v2',
    program: 'decantr-3.10-ui-change-control-proof',
    count: 1,
    records: [candidate],
  });
  const corpusPath = join(root, 'corpus.json');
  await writeJson(corpusPath, {
    schemaVersion: 'decantr-benchmark-corpus.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    repositories: [
      {
        id: candidate.repository.id,
        repo: REPOSITORY_URL,
        commit: expected.commit,
        framework: 'react',
        projectPath: '.',
        partition: 'development',
      },
    ],
  });
  const sourcePath = join(evaluatorRoot, 'sources', `${TASK_ID}.mjs`);
  await writeFile(sourcePath, "console.log(JSON.stringify({ passed: true }));\n");
  await writeJson(join(evaluatorRoot, 'specs', `${TASK_ID}.json`), {
    schemaVersion: 'decantr-benchmark-evaluator-authoring-spec.v2',
    taskId: TASK_ID,
    contractId: `${TASK_ID}.v1`,
    review: {
      status: 'approved',
      reviewedBy: 'fixture-reviewer',
      reviewedAt: '2026-07-22T12:00:00Z',
      notes: 'Reviewed independent snapshot input fixture.',
    },
    oracle: {
      candidateIndependent: true,
      decantrOutputAllowed: false,
      sourcePath: `sources/${TASK_ID}.mjs`,
    },
    commands: [
      {
        id: 'functional',
        kind: 'functional',
        runtime: 'controller',
        executable: 'node',
        args: [`\${EVALUATOR_ROOT}/sources/${TASK_ID}.mjs`],
        cwd: '${EVALUATOR_ROOT}',
        timeoutMs: 10_000,
        required: true,
        resultFormat: 'json-stdout',
      },
      {
        id: 'build',
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
    limits: { timeoutMs: 120_000, maxRequests: 1, maxInputTokens: 1, maxOutputTokens: 1 },
  });
  const profile = {
    id: 'node-22.19.0-npm-10.9.3',
    os: 'linux',
    arch: 'x64',
    nodeVersion: '22.19.0',
    bunVersion: null,
    packageManager: { name: 'npm', version: '10.9.3' },
  };
  const runtimeMatrix = makeFixtureLockedRuntimeMatrix({ profile });
  const runtimeMatrixPath = join(root, 'runtime-matrix.json');
  await writeJson(runtimeMatrixPath, runtimeMatrix);
  const packageBytes = await readFile(join(checkout, 'package.json'));
  const lockBytes = await readFile(join(checkout, 'package-lock.json'));
  await writeJson(join(environmentRoot, 'specs', `${TASK_ID}.json`), {
    schemaVersion: 'decantr-benchmark-task-environment.v1',
    taskId: TASK_ID,
    partition: 'development',
    base,
    projectPath: '.',
    profile,
    lockfiles: [{ path: 'package-lock.json', sha256: sha256(lockBytes) }],
    sourceEvidence: [
      {
        kind: 'package-manifest',
        path: 'package.json',
        sha256: sha256(packageBytes),
        statement: 'Fixture package manifest.',
      },
      {
        kind: 'lockfile',
        path: 'package-lock.json',
        sha256: sha256(lockBytes),
        statement: 'Fixture dependency lockfile.',
      },
    ],
    preparation: [
      {
        id: 'verify-runtime',
        executable: 'node',
        args: ['--version'],
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
      reviewedAt: '2026-07-22T12:30:00Z',
      notes: 'Reviewed fixed runtime fixture.',
    },
  });
  return {
    root,
    outputRoot,
    workspaceRoot,
    base,
    expected,
    options: {
      partition: 'development',
      taskId: TASK_ID,
      candidatesPath,
      corpusPath,
      corpusRoot,
      evaluatorRoot,
      environmentRoot,
      runtimeMatrixPath,
      outputRoot,
      proxyImage: { reference: 'docker.io/ubuntu/squid', digest: PROXY_DIGEST },
      runnerCommit: RUNNER_COMMIT,
      controllerCommitVerifier: async () => {},
    },
  };
}

function revision(repository) {
  return {
    commit: git(repository, ['rev-parse', 'HEAD']),
    tree: git(repository, ['rev-parse', 'HEAD^{tree}']),
  };
}

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

async function writeJson(path, value) {
  await writeFile(path, prettyCanonicalJson(value));
}
