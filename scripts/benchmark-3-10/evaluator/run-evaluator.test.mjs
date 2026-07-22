import assert from 'node:assert/strict';
import { chmod, mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { prettyCanonicalJson, sha256 } from '../runner/canonical.mjs';
import { executeEvaluator } from './run-evaluator.mjs';

test('candidate-independent evaluator emits normalized metrics without retaining command output', async () => {
  const root = await mkdtemp(join(tmpdir(), 'evaluator-test-'));
  try {
    const workspace = join(root, 'workspace');
    const evaluatorRoot = join(root, 'hidden-evaluator');
    const home = join(root, 'empty-home');
    await mkdir(workspace);
    await mkdir(evaluatorRoot);
    await writeFile(join(workspace, 'result.txt'), 'correct\n');
    const evaluatorScript = join(evaluatorRoot, 'check.mjs');
    const script = [
      "import { readFileSync } from 'node:fs';",
      "const passed = readFileSync(process.argv[2], 'utf8').trim() === 'correct';",
      "console.log(JSON.stringify({ passed, metrics: { governanceViolations: 0, accessibilityViolations: 0, visualScore: 92 } }));",
    ].join('\n');
    await writeFile(evaluatorScript, script);
    const contract = makeContract({
      executable: process.execPath,
      args: ['${EVALUATOR_ROOT}/check.mjs', '${WORKSPACE}/result.txt'],
      sourceSha256: sha256(script),
    });
    const contractPath = join(root, 'contract.json');
    await writeFile(contractPath, prettyCanonicalJson(contract));
    const contractSha256 = sha256(await import('node:fs').then(({ readFileSync }) => readFileSync(contractPath)));
    const result = await executeEvaluator({
      contractPath,
      expectedContractSha256: contractSha256,
      workspace,
      evaluatorRoot,
      home,
      projectPath: '.',
      runId: 'run-fixture',
      taskId: 'task-fixture',
      contractId: 'contract-fixture',
    });
    assert.equal(result.status, 'passed');
    assert.equal(result.metrics.functionalSuccess, true);
    assert.equal(result.metrics.buildPassed, true);
    assert.equal(result.metrics.visualScore, 92);
    assert.equal('stdout' in result.commands[0], false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('evaluator rejects Decantr output as an oracle', async () => {
  const root = await mkdtemp(join(tmpdir(), 'evaluator-test-'));
  try {
    const workspace = join(root, 'workspace');
    const evaluatorRoot = join(root, 'evaluator');
    await mkdir(workspace);
    await mkdir(evaluatorRoot);
    const contract = makeContract({
      executable: 'decantr',
      args: ['verify'],
      sourceSha256: sha256('fixture'),
    });
    const contractPath = join(root, 'contract.json');
    await writeFile(contractPath, prettyCanonicalJson(contract));
    const result = await executeEvaluator({
      contractPath,
      workspace,
      evaluatorRoot,
      home: join(root, 'home'),
      runId: 'run-fixture',
      taskId: 'task-fixture',
      contractId: 'contract-fixture',
    });
    assert.equal(result.status, 'evaluator_failure');
    assert.equal(result.commands[0].status, 'unavailable');
    assert.match(result.failures[0], /Decantr output cannot be used/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('evaluator binds the shared browser runtime and browser cache without host environment leakage', async () => {
  const root = await mkdtemp(join(tmpdir(), 'evaluator-runtime-test-'));
  try {
    const workspace = join(root, 'workspace');
    const evaluatorRoot = join(root, 'evaluator');
    const evaluatorRuntimeRoot = join(root, 'runtime');
    const evaluatorBrowsersPath = join(root, 'browsers');
    await mkdir(workspace);
    await mkdir(evaluatorRoot);
    await mkdir(evaluatorRuntimeRoot);
    await mkdir(evaluatorBrowsersPath);
    const script = [
      "const runtime = process.argv[2];",
      'const passed = runtime.endsWith(`/runtime`) && process.env.PLAYWRIGHT_BROWSERS_PATH?.endsWith(`/browsers`);',
      'console.log(JSON.stringify({passed,metrics:{accessibilityViolations:0}}));',
    ].join('\n');
    await writeFile(join(evaluatorRoot, 'check.mjs'), script);
    const contract = makeContract({
      executable: process.execPath,
      args: ['${EVALUATOR_ROOT}/check.mjs', '${EVALUATOR_RUNTIME}'],
      sourceSha256: sha256(script),
    });
    const contractPath = join(root, 'contract.json');
    await writeFile(contractPath, prettyCanonicalJson(contract));
    const result = await executeEvaluator({
      contractPath,
      workspace,
      evaluatorRoot,
      evaluatorRuntimeRoot,
      evaluatorBrowsersPath,
      home: join(root, 'home'),
      runId: 'run-fixture',
      taskId: 'task-fixture',
      contractId: 'contract-fixture',
    });
    assert.equal(result.status, 'passed');

    const unavailable = await executeEvaluator({
      contractPath,
      workspace,
      evaluatorRoot,
      home: join(root, 'missing-runtime-home'),
      runId: 'run-fixture-missing',
      taskId: 'task-fixture',
      contractId: 'contract-fixture',
    });
    assert.equal(unavailable.status, 'evaluator_failure');
    assert.match(unavailable.failures[0], /requires a bound evaluator runtime root/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('controller commands use controller Node while task commands resolve through the task PATH', async () => {
  const root = await mkdtemp(join(tmpdir(), 'evaluator-runtime-owner-test-'));
  try {
    const workspace = join(root, 'workspace');
    const evaluatorRoot = join(root, 'evaluator');
    const taskBin = join(root, 'task-bin');
    await Promise.all([mkdir(workspace), mkdir(evaluatorRoot), mkdir(taskBin)]);
    const oracle = "console.log(JSON.stringify({ passed: true }));\n";
    await writeFile(join(evaluatorRoot, 'check.mjs'), oracle);
    await writeFile(join(taskBin, 'node'), '#!/bin/sh\nexit 97\n');
    await writeFile(join(taskBin, 'fixture-build'), '#!/bin/sh\nexit 0\n');
    await Promise.all([chmod(join(taskBin, 'node'), 0o755), chmod(join(taskBin, 'fixture-build'), 0o755)]);
    const contract = makeContract({
      executable: 'node',
      args: ['${EVALUATOR_ROOT}/check.mjs'],
      sourceSha256: sha256(oracle),
      extraCommands: [
        {
          id: 'host-build',
          kind: 'build',
          runtime: 'task',
          executable: 'fixture-build',
          args: [],
          cwd: '${WORKSPACE}',
          timeoutMs: 10_000,
          required: true,
          resultFormat: 'exit-code',
        },
      ],
    });
    const contractPath = join(root, 'contract.json');
    await writeFile(contractPath, prettyCanonicalJson(contract));

    const result = await executeEvaluator({
      contractPath,
      workspace,
      evaluatorRoot,
      home: join(root, 'home'),
      taskPath: `${taskBin}:${process.env.PATH}`,
      runId: 'run-fixture',
      taskId: 'task-fixture',
      contractId: 'contract-fixture',
    });

    assert.equal(result.status, 'passed');
    assert.deepEqual(
      result.commands.map(({ id, status }) => ({ id, status })),
      [
        { id: 'functional-check', status: 'passed' },
        { id: 'host-build', status: 'passed' },
      ],
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('evaluator rejects process-execution environment overrides', async () => {
  const root = await mkdtemp(join(tmpdir(), 'evaluator-env-override-test-'));
  try {
    const workspace = join(root, 'workspace');
    const evaluatorRoot = join(root, 'evaluator');
    await Promise.all([mkdir(workspace), mkdir(evaluatorRoot)]);
    const oracle = "console.log(JSON.stringify({ passed: true }));\n";
    await writeFile(join(evaluatorRoot, 'check.mjs'), oracle);
    const contract = makeContract({
      executable: 'node',
      args: ['${EVALUATOR_ROOT}/check.mjs'],
      sourceSha256: sha256(oracle),
    });
    contract.commands[0].environment = { NODE_OPTIONS: '--require=/tmp/unbound.cjs' };
    const contractPath = join(root, 'contract.json');
    await writeFile(contractPath, prettyCanonicalJson(contract));
    const result = await executeEvaluator({
      contractPath,
      workspace,
      evaluatorRoot,
      home: join(root, 'home'),
      runId: 'run-env-override',
      taskId: 'task-fixture',
      contractId: 'contract-fixture',
    });
    assert.equal(result.status, 'evaluator_failure');
    assert.match(result.failures[0], /cannot override process execution: NODE_OPTIONS/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('evaluator detects oracle source mutation during command execution', async () => {
  const root = await mkdtemp(join(tmpdir(), 'evaluator-source-mutation-test-'));
  try {
    const workspace = join(root, 'workspace');
    const evaluatorRoot = join(root, 'evaluator');
    await Promise.all([mkdir(workspace), mkdir(evaluatorRoot)]);
    const oracle = [
      "import { writeFileSync } from 'node:fs';",
      "writeFileSync(new URL(import.meta.url), 'changed\\n');",
      "console.log(JSON.stringify({ passed: true }));",
      '',
    ].join('\n');
    await writeFile(join(evaluatorRoot, 'check.mjs'), oracle);
    const contract = makeContract({
      executable: 'node',
      args: ['${EVALUATOR_ROOT}/check.mjs'],
      sourceSha256: sha256(oracle),
    });
    const contractPath = join(root, 'contract.json');
    await writeFile(contractPath, prettyCanonicalJson(contract));
    await assert.rejects(
      executeEvaluator({
        contractPath,
        workspace,
        evaluatorRoot,
        home: join(root, 'home'),
        runId: 'run-source-mutation',
        taskId: 'task-fixture',
        contractId: 'contract-fixture',
      }),
      /oracle source changed/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

function makeContract({ executable, args, sourceSha256, extraCommands = [] }) {
  return {
    schemaVersion: 'decantr-benchmark-evaluator-contract.v2',
    contractId: 'contract-fixture',
    taskId: 'task-fixture',
    oracle: { candidateIndependent: true, decantrOutputAllowed: false, sourceSha256 },
    commands: [
      {
        id: 'functional-check',
        kind: 'functional',
        runtime: 'controller',
        executable,
        args,
        cwd: '${WORKSPACE}',
        timeoutMs: 10_000,
        required: true,
        resultFormat: 'json-stdout',
      },
      ...extraCommands,
    ],
  };
}
