import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { buildControlDelivery, buildTreatmentDelivery } from './arm-delivery.mjs';
import { sanitizedEnvironment } from './process.mjs';

test('control delivery contains only the shared task facts', () => {
  const result = buildControlDelivery(fixtureTask());
  assert.equal(result.document.arm, 'control');
  assert.equal(result.document.sharedTaskInput.target.selector, 'component:Input');
  assert.equal(result.document.productContext, null);
  assert.doesNotMatch(result.context, /ui-surface-task-context/u);
});

test('treatment delivery executes the bound context provider without changing the workspace', async () => {
  const fixture = await createFixture('ready');
  try {
    const result = buildTreatmentDelivery(fixture.options);
    assert.equal(result.document.arm, 'treatment');
    assert.equal(result.document.productContext.target, 'component:Input');
    assert.deepEqual(result.document.productContext.read, ['src/Input.tsx', 'src/styles.css']);
    assert.equal(result.generation.runtimeTreeSha256, 'a'.repeat(64));
    assert.equal(git(fixture.workspace, ['status', '--porcelain=v1', '--untracked-files=all']).trim(), '');
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('treatment delivery fails closed on blocked context and workspace writes', async (context) => {
  await context.test('blocked context', async () => {
    const fixture = await createFixture('blocked');
    try {
      assert.throws(() => buildTreatmentDelivery(fixture.options), /not taskable/u);
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  });
  await context.test('context provider writes', async () => {
    const fixture = await createFixture('ready', true);
    try {
      assert.throws(() => buildTreatmentDelivery(fixture.options), /modified the benchmark workspace/u);
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  });
});

async function createFixture(status, writes = false) {
  const root = await mkdtemp(join(tmpdir(), 'decantr-arm-delivery-'));
  const workspace = join(root, 'workspace');
  const runtime = join(root, 'runtime');
  const home = join(root, 'home');
  await mkdir(join(workspace, 'src'), { recursive: true });
  await mkdir(runtime, { recursive: true });
  await mkdir(home, { recursive: true });
  await writeFile(join(workspace, 'src', 'Input.tsx'), 'export const Input = () => null;\n');
  await writeFile(join(workspace, 'src', 'styles.css'), '.input {}\n');
  git(workspace, ['init', '--quiet']);
  git(workspace, ['config', 'user.email', 'benchmark@example.invalid']);
  git(workspace, ['config', 'user.name', 'Benchmark Fixture']);
  git(workspace, ['add', '.']);
  git(workspace, ['commit', '--quiet', '-m', 'fixture']);
  const entrypoint = join(runtime, 'cli.mjs');
  await writeFile(
    entrypoint,
    [
      "import { writeFileSync } from 'node:fs';",
      "import { join } from 'node:path';",
      "const taskIndex = process.argv.indexOf('task');",
      'const target = process.argv[taskIndex + 1];',
      writes ? "writeFileSync(join(process.cwd(), 'context-write.txt'), 'forbidden');" : '',
      `console.log(JSON.stringify({schemaVersion:'ui-surface-task-context.v1',mode:'discovery',target,status:'${status}',surface:{id:'component:src/Input.tsx:Input',kind:'component',name:'Input',files:['src/Input.tsx']},candidates:[],read:['src/Input.tsx','src/styles.css'],readTargets:[{rank:1,file:'src/Input.tsx',role:'implementation',reason:'selected source'},{rank:3,file:'src/styles.css',role:'style',reason:'style authority'}],authority:{axes:{},reasons:[]},stopConditions:[],verifyCommand:'npm test'}));`,
    ].join('\n'),
  );
  const task = fixtureTask();
  return {
    root,
    workspace,
    options: {
      task,
      candidate: {
        contextProvider: {
          outputSchemaVersion: 'ui-surface-task-context.v1',
        },
        runtime: { entrypoint, runtimeTreeSha256: 'a'.repeat(64) },
      },
      candidateRuntimeRoot: runtime,
      workspace,
      environment: sanitizedEnvironment(home),
    },
  };
}

function fixtureTask() {
  return {
    prompt: 'Make the shared input component preserve repository conventions.',
    projectPath: '.',
    limits: { timeoutMs: 30_000 },
    informationEntitlement: {
      taskInput: {
        target: { selector: 'component:Input' },
        policyCard: {
          statements: [
            {
              id: 'repository-authority',
              text: 'Preserve repository-owned implementation and styling conventions.',
              sources: ['base-checkout'],
            },
          ],
        },
      },
    },
  };
}

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' });
}
