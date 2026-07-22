import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  access,
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { checkoutDirectory } from '../lib.mjs';
import { prettyCanonicalJson, sha256Canonical } from '../runner/canonical.mjs';
import {
  assertCandidateSet,
  loadAuthoredEvaluators,
  qualifyEvaluators,
  runCli,
} from './qualify.mjs';

const evaluatorDirectory = dirname(fileURLToPath(import.meta.url));
const benchmarkRoot = resolve(evaluatorDirectory, '..');
const repositoryRoot = resolve(benchmarkRoot, '..', '..');
const schemaRoot = join(benchmarkRoot, 'schemas');
const PROGRAM = 'decantr-3.10-ui-change-control-proof';
const TASK_ID = 'sealed-repository.hidden-change';
const OPAQUE_ID = 'q-12345678-1234-4123-8123-123456789abc';
const REPOSITORY_ID = 'sealed-repository-fixture';
const REPOSITORY_URL = 'https://github.com/private-owner/sealed-repository-fixture';
const PROJECT_PATH = 'apps/private-ui';
const FRAMEWORK = 'sealed-framework-name';
const PROMPT =
  'Change the private fixture state while preserving every other sealed implementation detail.';

test('qualify emits a deterministic public development attestation from frozen worktrees', async () => {
  const fixture = await createFixture('development');
  try {
    const first = await qualifyEvaluators(fixture.options());
    const second = await qualifyEvaluators(fixture.options());
    assert.deepEqual(second, first);
    assert.equal(first.schemaVersion, 'decantr-benchmark-development-evaluator-qualification.v1');
    assert.equal(first.partition, 'development');
    assert.equal(first.materializable, false);
    assert.equal(first.executionAssurance, 'test-only-host');
    assert.equal(first.tasks.length, 1);

    const [task] = first.tasks;
    assert.equal(task.taskId, TASK_ID);
    assert.equal(task.qualified, true);
    assert.deepEqual(
      task.base.commands.map(({ id, status }) => ({ id, status })),
      [
        { id: 'behavior', status: 'failed' },
        { id: 'source-syntax', status: 'passed' },
      ],
    );
    assert.equal(task.base.outcome, 'failed');
    assert.equal(task.base.commit, fixture.base.commit);
    assert.equal(task.base.tree, fixture.base.tree);
    assert.equal(task.expected.outcome, 'passed');
    assert.equal(task.expected.commit, fixture.expected.commit);
    assert.equal(task.expected.tree, fixture.expected.tree);
    assert.ok(task.expected.commands.every((command) => command.status === 'passed'));
    assert.equal(first.bundleSha256, sha256Canonical(first.tasks));

    const written = JSON.parse(await readFile(fixture.outputPath, 'utf8'));
    assert.deepEqual(written, first);
    assert.deepEqual(await readdir(fixture.worktreeRoot), []);
    assert.equal(worktreeCount(fixture.checkout), 1);
  } finally {
    await fixture.cleanup();
  }
});

test('qualification output and successful CLI diagnostics expose only opaque bindings', async () => {
  const fixture = await createFixture('qualification');
  try {
    const attestation = await qualifyEvaluators(fixture.options());
    assert.equal(attestation.schemaVersion, 'decantr-benchmark-public-evaluator-qualification.v1');
    assert.equal(attestation.confidentiality, 'opaque qualification attestations only');
    assert.equal(attestation.materializable, false);
    assert.equal(attestation.executionAssurance, 'test-only-host');
    assert.equal(attestation.tasks.length, 1);
    assert.deepEqual(Object.keys(attestation.tasks[0]).sort(), [
      'candidateSha256',
      'evaluatorSpecSha256',
      'opaqueId',
      'oracleSourceSha256',
      'qualificationSha256',
      'qualified',
    ]);
    assert.equal(attestation.tasks[0].opaqueId, OPAQUE_ID);
    assert.equal(attestation.tasks[0].qualified, true);
    assert.equal(attestation.bundleSha256, sha256Canonical(attestation.tasks));
    assertSealedValuesAbsent(JSON.stringify(attestation));

    const output = [];
    const errors = [];
    const exitCode = await runCli(fixture.cliArgs(), {
      stdout: (value) => output.push(value),
      stderr: (value) => errors.push(value),
    });
    assert.equal(exitCode, 0);
    assert.deepEqual(errors, []);
    const summary = JSON.parse(output.join(''));
    assert.deepEqual(Object.keys(summary).sort(), [
      'attestationSha256',
      'materializable',
      'ok',
      'partition',
      'tasks',
    ]);
    assert.equal(summary.partition, 'qualification');
    assert.equal(summary.materializable, false);
    assert.equal(summary.tasks, 1);
    assertSealedValuesAbsent(output.join(''));
    assert.deepEqual(await readdir(fixture.worktreeRoot), []);
    assert.equal(worktreeCount(fixture.checkout), 1);
  } finally {
    await fixture.cleanup();
  }
});

test('qualify requires the bound oracle to fail at base and all required commands to pass at expected', async (context) => {
  await context.test('base must fail', async () => {
    const fixture = await createFixture('development');
    try {
      await fixture.writeSource('always-pass');
      await assert.rejects(
        qualifyEvaluators(fixture.options()),
        /evaluator must fail at the frozen base/u,
      );
      assert.equal(worktreeCount(fixture.checkout), 1);
    } finally {
      await fixture.cleanup();
    }
  });

  await context.test('expected must pass', async () => {
    const fixture = await createFixture('development');
    try {
      await fixture.writeSource('always-fail');
      await assert.rejects(
        qualifyEvaluators(fixture.options()),
        /every required evaluator command must pass at the expected commit/u,
      );
      assert.equal(worktreeCount(fixture.checkout), 1);
    } finally {
      await fixture.cleanup();
    }
  });
});

test('qualify syntax-checks every authored source before creating worktrees', async () => {
  const fixture = await createFixture('development');
  try {
    await fixture.writeSource('invalid-syntax');
    await assert.rejects(
      qualifyEvaluators(fixture.options()),
      /evaluator source failed node --check/u,
    );
    assert.equal(worktreeCount(fixture.checkout), 1);
    await assert.rejects(readdir(fixture.worktreeRoot), { code: 'ENOENT' });
  } finally {
    await fixture.cleanup();
  }
});

test('structurally loads every development and private qualification evaluator without execution', async (context) => {
  const partitions = [
    {
      partition: 'development',
      expectedCount: 24,
      candidatesPath: join(benchmarkRoot, 'tasks', 'development-candidates.json'),
      evaluatorRoot: join(evaluatorDirectory, 'development'),
    },
    {
      partition: 'qualification',
      expectedCount: 16,
      candidatesPath: join(
        repositoryRoot,
        '.private',
        'benchmark-3-10',
        'task-freeze',
        'qualification-private.json',
      ),
      evaluatorRoot: join(
        repositoryRoot,
        '.private',
        'benchmark-3-10',
        'evaluators',
        'qualification',
      ),
      private: true,
    },
  ];

  for (const entry of partitions) {
    await context.test(`${entry.partition} authored set`, async (subcontext) => {
      if (entry.private) {
        try {
          await access(entry.candidatesPath);
        } catch (error) {
          if (error?.code !== 'ENOENT') throw error;
          subcontext.skip('private qualification inputs are not present in this checkout');
          return;
        }
      }
      const authored = await loadAuthoredSet(entry);
      assert.equal(authored.length, entry.expectedCount);
      assert.equal(new Set(authored.map((item) => item.candidate.taskId)).size, entry.expectedCount);
    });
  }
});

test('structural loading permits isolated browser/runtime primitives without running source', async () => {
  const fixture = await createFixture('development');
  const executionSentinel = join(dirname(fixture.sourcePath), 'loader-executed');
  try {
    await fixture.writeSource('browser-runtime');
    const authored = await loadFixtureAuthored(fixture);
    assert.equal(authored.length, 1);
    await assert.rejects(access(executionSentinel), { code: 'ENOENT' });
    await assert.rejects(readdir(fixture.worktreeRoot), { code: 'ENOENT' });
  } finally {
    await fixture.cleanup();
  }
});

test('structural source policy rejects malicious evaluator capabilities', async (context) => {
  const cases = [
    ['local static import', 'local-import', /cannot import local files/u],
    ['local dynamic import', 'local-dynamic-import', /cannot import local files/u],
    ['model provider SDK', 'provider-sdk', /may not make network or model calls/u],
    ['explicit provider endpoint', 'provider-endpoint', /may not make network or model calls/u],
    ['external network module', 'network-import', /may not make network or model calls/u],
    ['network client package', 'network-client', /may not make network or model calls/u],
    ['product artifact input', 'product-artifact', /names the product under test/u],
  ];
  for (const [name, mode, pattern] of cases) {
    await context.test(name, async () => {
      const fixture = await createFixture('development');
      try {
        await fixture.writeSource(mode);
        await assert.rejects(loadFixtureAuthored(fixture), pattern);
        await assert.rejects(readdir(fixture.worktreeRoot), { code: 'ENOENT' });
      } finally {
        await fixture.cleanup();
      }
    });
  }
});

test('qualify rejects incomplete source/spec sets and non-fixed commands', async (context) => {
  await context.test('source/spec set mismatch', async () => {
    const fixture = await createFixture('development');
    try {
      await unlink(fixture.sourcePath);
      await assert.rejects(
        qualifyEvaluators(fixture.options()),
        /evaluator specs and sources must match exactly/u,
      );
    } finally {
      await fixture.cleanup();
    }
  });

  await context.test('shell command', async () => {
    const fixture = await createFixture('development');
    try {
      const spec = await readJson(fixture.specPath);
      spec.commands[1].executable = 'sh';
      spec.commands[1].args = ['-c', 'true'];
      await writeJson(fixture.specPath, spec);
      await assert.rejects(qualifyEvaluators(fixture.options()), /Shell executable is forbidden/u);
    } finally {
      await fixture.cleanup();
    }
  });

  await context.test('inline Node evaluation', async () => {
    const fixture = await createFixture('development');
    try {
      const spec = await readJson(fixture.specPath);
      spec.commands[1].args = ['--eval', 'process.exit(0)'];
      await writeJson(fixture.specPath, spec);
      await assert.rejects(loadFixtureAuthored(fixture), /Inline Node evaluation is forbidden/u);
    } finally {
      await fixture.cleanup();
    }
  });

  await context.test('network executable', async () => {
    const fixture = await createFixture('development');
    try {
      const spec = await readJson(fixture.specPath);
      spec.commands[1].executable = 'curl';
      await writeJson(fixture.specPath, spec);
      await assert.rejects(loadFixtureAuthored(fixture), /network executable is forbidden/u);
    } finally {
      await fixture.cleanup();
    }
  });

  await context.test('network target', async () => {
    const fixture = await createFixture('development');
    try {
      const spec = await readJson(fixture.specPath);
      spec.commands[1].args.push('https://api.openai.com/v1/responses');
      await writeJson(fixture.specPath, spec);
      await assert.rejects(loadFixtureAuthored(fixture), /network target is forbidden/u);
    } finally {
      await fixture.cleanup();
    }
  });

  await context.test('product artifact argument', async () => {
    const fixture = await createFixture('development');
    try {
      const spec = await readJson(fixture.specPath);
      spec.commands[1].args.push('${WORKSPACE}/.decantr/report.json');
      await writeJson(fixture.specPath, spec);
      await assert.rejects(loadFixtureAuthored(fixture), /product output cannot be an evaluator input/u);
    } finally {
      await fixture.cleanup();
    }
  });
});

test('qualify rejects evaluator-declared network or model access', async () => {
  const fixture = await createFixture('development');
  try {
    await fixture.writeSource('network-import');
    await assert.rejects(
      qualifyEvaluators(fixture.options()),
      /may not make network or model calls/u,
    );
    assert.equal(worktreeCount(fixture.checkout), 1);
  } finally {
    await fixture.cleanup();
  }
});

test('qualification CLI redacts sealed details on a polarity failure', async () => {
  const fixture = await createFixture('qualification');
  try {
    await fixture.writeSource('always-pass');
    const output = [];
    const errors = [];
    const exitCode = await runCli(fixture.cliArgs(), {
      stdout: (value) => output.push(value),
      stderr: (value) => errors.push(value),
    });
    assert.equal(exitCode, 1);
    assert.deepEqual(output, []);
    assert.match(errors.join(''), new RegExp(OPAQUE_ID, 'u'));
    assertSealedValuesAbsent(errors.join(''));
    assert.equal(worktreeCount(fixture.checkout), 1);
  } finally {
    await fixture.cleanup();
  }
});

async function createFixture(partition) {
  const root = await mkdtemp(join(tmpdir(), `qualify-${partition}-`));
  const corpusRoot = join(root, 'corpus');
  const checkout = join(corpusRoot, checkoutDirectory(`${REPOSITORY_URL}.git`));
  const evaluatorRoot = join(root, 'evaluators', partition);
  const specRoot = join(evaluatorRoot, 'specs');
  const sourceRoot = join(evaluatorRoot, 'sources');
  const sourcePath = join(sourceRoot, `${TASK_ID}.mjs`);
  const specPath = join(specRoot, `${TASK_ID}.json`);
  const candidatesPath = join(root, `${partition}-candidates.json`);
  const corpusPath = join(root, 'corpus.json');
  const publicCandidateIndexPath = join(root, 'qualification-index.json');
  const outputPath = join(root, 'attestation.json');
  const worktreeRoot = join(root, 'worktrees');
  await Promise.all([
    mkdir(join(checkout, PROJECT_PATH), { recursive: true }),
    mkdir(specRoot, { recursive: true }),
    mkdir(sourceRoot, { recursive: true }),
  ]);

  git(checkout, ['init']);
  git(checkout, ['config', 'user.name', 'Qualification Fixture']);
  git(checkout, ['config', 'user.email', 'fixture@example.invalid']);
  git(checkout, ['config', 'commit.gpgsign', 'false']);
  git(checkout, ['remote', 'add', 'origin', `${REPOSITORY_URL}.git`]);
  await writeFile(join(checkout, PROJECT_PATH, 'state.txt'), 'base\n');
  git(checkout, ['add', '.']);
  git(checkout, ['commit', '-m', 'base'], commitEnvironment('2026-06-01T00:00:00Z'));
  const base = revision(checkout, 'HEAD');

  await writeFile(join(checkout, PROJECT_PATH, 'state.txt'), 'expected\n');
  git(checkout, ['add', '.']);
  git(checkout, ['commit', '-m', 'expected'], commitEnvironment('2026-06-02T00:00:00Z'));
  const expected = revision(checkout, 'HEAD');
  const candidate = makeCandidate(partition, base, expected);
  const candidates = {
    schemaVersion:
      partition === 'development'
        ? 'decantr-benchmark-development-task-candidates.v2'
        : 'decantr-benchmark-qualification-task-candidates.v2',
    program: PROGRAM,
    count: 1,
    records: [candidate],
  };
  const corpus = {
    schemaVersion: 'decantr-benchmark-corpus.v1',
    program: PROGRAM,
    repositories: [
      {
        id: REPOSITORY_ID,
        repo: `${REPOSITORY_URL}.git`,
        commit: expected.commit,
        framework: FRAMEWORK,
        projectPath: PROJECT_PATH,
        partition,
      },
    ],
  };
  const publicCandidateIndex = {
    schemaVersion: 'decantr-benchmark-public-qualification-index.v1',
    program: PROGRAM,
    count: 1,
    confidentiality: 'opaque qualification bindings only',
    tasks: [{ opaqueId: OPAQUE_ID, canonicalSha256: sha256Canonical(candidate) }],
  };
  await Promise.all([
    writeJson(candidatesPath, candidates),
    writeJson(corpusPath, corpus),
    writeJson(publicCandidateIndexPath, publicCandidateIndex),
    writeJson(specPath, makeSpec()),
    writeFile(sourcePath, sourceFor('revision')),
  ]);

  const fixture = {
    base,
    candidatesPath,
    checkout,
    cleanup: () => rm(root, { recursive: true, force: true }),
    cliArgs: () => [
      '--partition',
      partition,
      '--candidates',
      candidatesPath,
      '--evaluator-root',
      evaluatorRoot,
      '--corpus',
      corpusPath,
      '--corpus-root',
      corpusRoot,
      '--public-candidate-index',
      publicCandidateIndexPath,
      '--worktree-root',
      worktreeRoot,
      '--out',
      outputPath,
    ],
    corpusPath,
    corpusRoot,
    evaluatorRoot,
    expected,
    options: () => ({
      partition,
      candidatesPath,
      evaluatorRoot,
      corpusPath,
      corpusRoot,
      publicCandidateIndexPath,
      worktreeRoot,
      outputPath,
    }),
    outputPath,
    publicCandidateIndexPath,
    sourcePath,
    specPath,
    worktreeRoot,
    writeSource: (mode) => writeFile(sourcePath, sourceFor(mode)),
  };
  return fixture;
}

function makeCandidate(partition, base, expected) {
  return {
    schemaVersion: 'decantr-benchmark-task-candidate.v1',
    taskId: TASK_ID,
    ...(partition === 'qualification' ? { opaqueId: OPAQUE_ID } : {}),
    partition,
    kind: 'repository',
    prompt: PROMPT,
    repository: {
      id: REPOSITORY_ID,
      url: REPOSITORY_URL,
      framework: FRAMEWORK,
      projectPath: PROJECT_PATH,
      corpusProjectPath: PROJECT_PATH,
      corpusPin: expected.commit,
      corpusTree: expected.tree,
    },
    base,
    expected,
  };
}

function makeSpec() {
  const sourceToken = `\${EVALUATOR_ROOT}/sources/${TASK_ID}.mjs`;
  return {
    schemaVersion: 'decantr-benchmark-evaluator-authoring-spec.v2',
    taskId: TASK_ID,
    contractId: `${TASK_ID}.v1`,
    review: {
      status: 'draft',
      reviewedBy: null,
      reviewedAt: null,
      notes: 'Fixture oracle review remains draft until qualification completes successfully.',
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
        executable: process.execPath,
        args: [
          sourceToken,
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
        id: 'source-syntax',
        kind: 'build',
        runtime: 'task',
        executable: process.execPath,
        args: ['--check', sourceToken],
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
  };
}

function sourceFor(mode) {
  if (mode === 'always-pass') return "console.log(JSON.stringify({ passed: true }));\n";
  if (mode === 'always-fail') return "console.log(JSON.stringify({ passed: false }));\n";
  if (mode === 'invalid-syntax') {
    return "console.log(JSON.stringify({ passed: true }));\nif (\n";
  }
  if (mode === 'network-import') {
    return "import 'node:https';\nconsole.log(JSON.stringify({ passed: true }));\n";
  }
  if (mode === 'network-client') {
    return "import client from 'undici';\nconsole.log(JSON.stringify({ passed: Boolean(client) }));\n";
  }
  if (mode === 'local-import') {
    return "import './side-effect.mjs';\nconsole.log(JSON.stringify({ passed: true }));\n";
  }
  if (mode === 'local-dynamic-import') {
    return "await import('../outside.mjs');\nconsole.log(JSON.stringify({ passed: true }));\n";
  }
  if (mode === 'provider-sdk') {
    return "import OpenAI from 'openai';\nconsole.log(JSON.stringify({ passed: Boolean(OpenAI) }));\n";
  }
  if (mode === 'provider-endpoint') {
    return [
      "const response = await fetch('https://api.openai.com/v1/responses');",
      'console.log(JSON.stringify({ passed: response.ok }));',
      '',
    ].join('\n');
  }
  if (mode === 'product-artifact') {
    return [
      "import { readFile } from 'node:fs/promises';",
      "const report = await readFile('.decantr/report.json', 'utf8');",
      'console.log(JSON.stringify({ passed: report.length > 0 }));',
      '',
    ].join('\n');
  }
  if (mode === 'browser-runtime') {
    return [
      "import { spawn } from 'node:child_process';",
      "import { writeFile } from 'node:fs/promises';",
      "import { createServer } from 'node:http';",
      "import { createServer as createNetServer } from 'node:net';",
      '',
      'const generatedHarness = `',
      "import './generated-component.mjs';",
      "export { default } from '../generated-style.mjs';",
      '`;',
      "const probeLoopback = (origin = 'http://127.0.0.1:3000') => fetch(origin);",
      'void spawn;',
      'void createServer;',
      'void createNetServer;',
      'void probeLoopback;',
      "await writeFile(new URL('./loader-executed', import.meta.url), generatedHarness);",
      'console.log(JSON.stringify({ passed: true }));',
      '',
    ].join('\n');
  }
  return [
    "import { readFile } from 'node:fs/promises';",
    "import { resolve } from 'node:path';",
    '',
    "const option = (name) => process.argv[process.argv.indexOf(name) + 1];",
    "const workspace = option('--workspace');",
    "const projectPath = option('--project-path');",
    "const state = await readFile(resolve(workspace, projectPath, 'state.txt'), 'utf8');",
    "console.log(JSON.stringify({ passed: state.trim() === 'expected' }));",
    '',
  ].join('\n');
}

function revision(checkout, reference) {
  return {
    commit: git(checkout, ['rev-parse', `${reference}^{commit}`]),
    tree: git(checkout, ['rev-parse', `${reference}^{tree}`]),
  };
}

function worktreeCount(checkout) {
  return git(checkout, ['worktree', 'list', '--porcelain'])
    .split('\n')
    .filter((line) => line.startsWith('worktree ')).length;
}

function git(checkout, args, environment = {}) {
  const result = spawnSync('git', ['-C', checkout, ...args], {
    encoding: 'utf8',
    env: { ...process.env, ...environment },
    shell: false,
    timeout: 30_000,
  });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed: ${result.stderr || result.error?.message}`);
  }
  return result.stdout.trim();
}

function commitEnvironment(timestamp) {
  return {
    GIT_AUTHOR_DATE: timestamp,
    GIT_COMMITTER_DATE: timestamp,
  };
}

function assertSealedValuesAbsent(serialized) {
  for (const value of [
    TASK_ID,
    REPOSITORY_ID,
    REPOSITORY_URL,
    PROJECT_PATH,
    FRAMEWORK,
    PROMPT,
  ]) {
    assert.equal(serialized.includes(value), false, `sealed output contains ${value}`);
  }
}

async function loadFixtureAuthored(fixture) {
  return loadAuthoredSet({
    partition: 'development',
    candidatesPath: fixture.candidatesPath,
    evaluatorRoot: fixture.evaluatorRoot,
  });
}

async function loadAuthoredSet({ partition, candidatesPath, evaluatorRoot }) {
  const [candidateSet, authoringSchema, contractSchema] = await Promise.all([
    readJson(candidatesPath),
    readJson(join(schemaRoot, 'evaluator-authoring-spec.schema.json')),
    readJson(join(schemaRoot, 'evaluator-contract.schema.json')),
  ]);
  const candidates = assertCandidateSet(candidateSet, partition);
  return loadAuthoredEvaluators({
    candidates,
    evaluatorRoot,
    schema: authoringSchema,
    schemas: {
      'evaluator-authoring-spec.schema.json': authoringSchema,
      'evaluator-contract.schema.json': contractSchema,
    },
  });
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJson(path, value) {
  await writeFile(path, prettyCanonicalJson(value));
}
