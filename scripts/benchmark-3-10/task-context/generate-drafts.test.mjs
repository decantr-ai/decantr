import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  symlink,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { generateTaskDeliveryDrafts } from './generate-drafts.mjs';

const REPOSITORY_URL = 'https://github.com/example/task-context-fixture';
const FIXED_GIT_ENV = {
  ...process.env,
  GIT_AUTHOR_DATE: '2026-01-02T03:04:05Z',
  GIT_AUTHOR_EMAIL: 'fixture@example.test',
  GIT_AUTHOR_NAME: 'Task Context Fixture',
  GIT_COMMITTER_DATE: '2026-01-02T03:04:05Z',
  GIT_COMMITTER_EMAIL: 'fixture@example.test',
  GIT_COMMITTER_NAME: 'Task Context Fixture',
};

test('generates deterministic canonical 24/16 bundles without qualification leakage', async () => {
  const fixture = await createGitFixture({
    baseFiles: {
      'package.json': packageJson(),
      'src/Widget.tsx': 'export function Widget() { return <div>base</div>; }\n',
      'src/theme.css': ':root { --accent: blue; }\n',
    },
    expectedChanges: {
      'src/Widget.tsx': 'export function Widget() { return <div>expected</div>; }\n',
    },
  });
  const developmentRecords = Array.from({ length: 24 }, (_, index) =>
    makeCandidate(fixture, {
      taskId: `development-${String(index + 1).padStart(2, '0')}`,
      partition: 'development',
      prompt: `Update the Widget development behavior ${index + 1}.`,
    }),
  );
  const qualificationRecords = Array.from({ length: 16 }, (_, index) => {
    const sequence = String(index + 1).padStart(2, '0');
    return makeCandidate(fixture, {
      taskId: `SEALED_TASK_${sequence}`,
      opaqueId: `q-opaque-${sequence}`,
      partition: 'qualification',
      prompt: `SEALED_PROMPT_${sequence}`,
      allowedPaths: [`SEALED_PATH_${sequence}/**`],
    });
  });
  const harness = await createHarness(fixture, developmentRecords, qualificationRecords);

  try {
    const firstResult = await generateTaskDeliveryDrafts(harness.options);

    assert.deepEqual(firstResult, {
      total: 40,
      development: 24,
      qualification: 16,
      unresolved: [],
      fileFallbacks: [],
      rankOneMismatches: [],
    });

    const firstDevelopmentBytes = await readFile(harness.options.developmentOutputPath, 'utf8');
    const firstQualificationBytes = await readFile(
      harness.options.qualificationOutputPath,
      'utf8',
    );
    const development = JSON.parse(firstDevelopmentBytes);
    const qualification = JSON.parse(firstQualificationBytes);

    assert.equal(development.count, 24);
    assert.equal(qualification.count, 16);
    assert.match(development.confidentiality, /^Public development/u);
    assert.match(qualification.confidentiality, /^PRIVATE:/u);
    assert.deepEqual(
      development.records.map((record) => record.taskId),
      developmentRecords.map((record) => record.taskId).sort(),
    );
    assert.equal(
      development.records.every(
        (record) => record.partition === 'development' && !('opaqueId' in record),
      ),
      true,
    );
    assert.equal(
      qualification.records.every(
        (record) => record.partition === 'qualification' && record.opaqueId,
      ),
      true,
    );
    for (const record of qualificationRecords) {
      assert.equal(firstDevelopmentBytes.includes(record.taskId), false);
      assert.equal(firstDevelopmentBytes.includes(record.opaqueId), false);
      assert.equal(firstDevelopmentBytes.includes(record.prompt), false);
      assert.equal(firstDevelopmentBytes.includes(record.scope.allowedPaths[0]), false);
      assert.equal(firstQualificationBytes.includes(record.taskId), true);
      assert.equal(firstQualificationBytes.includes(record.opaqueId), true);
    }
    assert.equal((await stat(harness.options.developmentOutputPath)).mode & 0o777, 0o600);
    assert.equal((await stat(harness.options.qualificationOutputPath)).mode & 0o777, 0o600);

    await writeJson(harness.options.developmentCandidatesPath, {
      records: [...developmentRecords].reverse(),
    });
    await writeJson(harness.options.qualificationCandidatesPath, {
      records: [...qualificationRecords].reverse(),
    });
    const secondResult = await generateTaskDeliveryDrafts(harness.options);

    assert.deepEqual(secondResult, firstResult);
    assert.equal(
      await readFile(harness.options.developmentOutputPath, 'utf8'),
      firstDevelopmentBytes,
    );
    assert.equal(
      await readFile(harness.options.qualificationOutputPath, 'utf8'),
      firstQualificationBytes,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('uses the historical task project path instead of later corpus metadata', async () => {
  const fixture = await createGitFixture({
    baseFiles: {
      'package.json': JSON.stringify({ private: true, workspaces: ['examples/*'] }),
      'examples/hackernews/package.json': packageJson('historical-hackernews'),
      'examples/hackernews/src/components/Nav.tsx':
        'export function Nav() { return <nav>base</nav>; }\n',
      'examples/hackernews/src/theme.css': ':root { --accent: blue; }\n',
    },
    expectedChanges: {
      'examples/hackernews/src/components/Nav.tsx':
        'export function Nav() { return <nav>expected</nav>; }\n',
    },
  });
  const record = makeCandidate(fixture, {
    taskId: 'historical-project-path',
    partition: 'development',
    prompt: 'Keep the Nav home link active at the root route.',
    repository: {
      projectPath: 'examples/hackernews',
      corpusProjectPath: 'apps/fixtures/hackernews',
    },
  });
  const harness = await createHarness(fixture, [record], []);

  try {
    const result = await generateTaskDeliveryDrafts(harness.options);
    const draft = (await readJson(harness.options.developmentOutputPath)).records[0];

    assert.deepEqual(result.rankOneMismatches, []);
    assert.equal(draft.input.target.selector, 'component:Nav');
    assert.deepEqual(draft.observation.changedFiles, ['src/components/Nav.tsx']);
    assert.deepEqual(draft.observation.existingProductionChangedFiles, [
      'src/components/Nav.tsx',
    ]);
    assert.equal(draft.observation.rankOneFile, 'src/components/Nav.tsx');
    assert.equal(draft.observation.rankOneMatchesOracle, true);
    assert.deepEqual(draft.oracle.rankOneFiles, ['src/components/Nav.tsx']);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('uses an exact surface id to disambiguate equal semantic component names', async () => {
  const fixture = await createGitFixture({
    baseFiles: {
      'package.json': packageJson(),
      'src/alpha/Button.tsx':
        'export function Button() { return <button>alpha base</button>; }\n',
      'src/beta/Button.tsx':
        'export function Button() { return <button>beta base</button>; }\n',
      'src/theme.css': ':root { --accent: blue; }\n',
    },
    expectedChanges: {
      'src/alpha/Button.tsx':
        'export function Button() { return <button>alpha expected</button>; }\n',
      'src/beta/Button.tsx':
        'export function Button() { return <button>beta expected</button>; }\n',
    },
  });
  const record = makeCandidate(fixture, {
    taskId: 'semantic-disambiguation',
    partition: 'development',
    prompt: 'Update the Button behavior.',
  });
  const harness = await createHarness(fixture, [record], []);

  try {
    const result = await generateTaskDeliveryDrafts(harness.options);
    const draft = (await readJson(harness.options.developmentOutputPath)).records[0];

    assert.equal(draft.observation.exactDisambiguation, true);
    assert.equal(
      draft.input.target.selector,
      'component:src/alpha/Button.tsx:Button',
    );
    assert.equal(draft.observation.surfaceId, draft.input.target.selector);
    assert.equal(draft.observation.candidateCount, 1);
    assert.equal(draft.observation.rankOneFile, 'src/alpha/Button.tsx');
    assert.equal(draft.observation.rankOneMatchesOracle, true);
    assert.deepEqual(draft.oracle.rankOneFiles, ['src/alpha/Button.tsx']);
    assert.deepEqual(result.rankOneMismatches, []);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('falls back to the first existing changed production file and ranks it first', async () => {
  const fixture = await createGitFixture({
    baseFiles: {
      'package.json': packageJson(),
      'src/format.ts': 'const formatter = (value) => String(value);\n',
    },
    expectedChanges: {
      'src/format.ts': 'const formatter = (value) => String(value).trim();\n',
      'src/new-helper.ts': 'export const helper = true;\n',
    },
  });
  const record = makeCandidate(fixture, {
    taskId: 'existing-file-fallback',
    partition: 'development',
    prompt: 'Normalize formatted values.',
  });
  const harness = await createHarness(fixture, [record], []);

  try {
    const result = await generateTaskDeliveryDrafts(harness.options);
    const draft = (await readJson(harness.options.developmentOutputPath)).records[0];

    assert.deepEqual(draft.observation.changedFiles, [
      'src/format.ts',
      'src/new-helper.ts',
    ]);
    assert.deepEqual(draft.observation.productionChangedFiles, [
      'src/format.ts',
      'src/new-helper.ts',
    ]);
    assert.deepEqual(draft.observation.existingProductionChangedFiles, ['src/format.ts']);
    assert.equal(draft.observation.fileFallback, true);
    assert.equal(draft.input.target.selector, 'file:src/format.ts');
    assert.equal(draft.observation.rankOneFile, 'src/format.ts');
    assert.equal(draft.observation.rankOneMatchesOracle, true);
    assert.deepEqual(draft.oracle.rankOneFiles, ['src/format.ts']);
    assert.deepEqual(result.fileFallbacks, [record.taskId]);
    assert.deepEqual(result.rankOneMismatches, []);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('reports a rank-one mismatch when no changed authority file exists at the base', async () => {
  const fixture = await createGitFixture({
    baseFiles: {
      'package.json': packageJson(),
    },
    expectedChanges: {
      'src/NewWidget.tsx': 'export function NewWidget() { return <div>new</div>; }\n',
    },
  });
  const record = makeCandidate(fixture, {
    taskId: 'rank-one-mismatch',
    partition: 'development',
    prompt: 'Add the new Widget interface.',
  });
  const harness = await createHarness(fixture, [record], []);

  try {
    const result = await generateTaskDeliveryDrafts(harness.options);
    const draft = (await readJson(harness.options.developmentOutputPath)).records[0];

    assert.deepEqual(draft.observation.productionChangedFiles, ['src/NewWidget.tsx']);
    assert.deepEqual(draft.observation.existingProductionChangedFiles, []);
    assert.equal(draft.input.target.selector, 'package:package.json');
    assert.equal(draft.observation.rankOneFile, 'package.json');
    assert.equal(draft.observation.rankOneMatchesOracle, false);
    assert.deepEqual(draft.oracle.rankOneFiles, ['src/NewWidget.tsx']);
    assert.deepEqual(result.rankOneMismatches, [record.taskId]);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('rejects partition spoofing before qualification details can reach public output', async () => {
  const fixture = await createGitFixture({
    baseFiles: {
      'package.json': packageJson(),
      'src/Widget.tsx': 'export function Widget() { return <div>base</div>; }\n',
    },
    expectedChanges: {
      'src/Widget.tsx': 'export function Widget() { return <div>expected</div>; }\n',
    },
  });
  const spoofedQualification = makeCandidate(fixture, {
    taskId: 'SEALED_SPOOFED_TASK',
    opaqueId: 'q-spoofed',
    partition: 'development',
    prompt: 'SEALED_SPOOFED_PROMPT',
  });
  const harness = await createHarness(fixture, [], [spoofedQualification]);

  try {
    await assert.rejects(
      generateTaskDeliveryDrafts(harness.options),
      /qualification candidate .* partition .*development/u,
    );
    await assertMissing(harness.options.developmentOutputPath);
    await assertMissing(harness.options.qualificationOutputPath);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('fails closed when a selected project path is missing or escapes the checkout', async (t) => {
  const fixture = await createGitFixture({
    baseFiles: {
      'package.json': packageJson(),
      'README.md': 'base\n',
    },
    expectedChanges: {
      'README.md': 'expected\n',
    },
  });
  const externalRoot = join(fixture.root, 'external-project');
  await mkdir(externalRoot, { recursive: true });
  await writeFile(join(externalRoot, 'package.json'), packageJson('external-project'));
  await writeFile(join(externalRoot, 'External.tsx'), 'export const External = () => <main />;\n');
  await symlink(externalRoot, join(fixture.repositoryPath, 'linked-project'));
  git(fixture.repositoryPath, ['add', 'linked-project']);
  git(fixture.repositoryPath, ['commit', '-m', 'add escaping project symlink']);
  fixture.baseCommit = git(fixture.repositoryPath, ['rev-parse', 'HEAD']);
  await writeFile(join(fixture.repositoryPath, 'README.md'), 'after symlink\n');
  git(fixture.repositoryPath, ['add', 'README.md']);
  git(fixture.repositoryPath, ['commit', '-m', 'advance fixture after symlink']);
  fixture.expectedCommit = git(fixture.repositoryPath, ['rev-parse', 'HEAD']);

  try {
    const cases = [
      { name: 'parent traversal', projectPath: '../external-project', message: /escapes checkout/u },
      { name: 'absolute path', projectPath: externalRoot, message: /must be relative/u },
      { name: 'missing directory', projectPath: 'missing-project', message: /does not exist/u },
      { name: 'escaping symlink', projectPath: 'linked-project', message: /escapes checkout/u },
    ];
    for (const [index, item] of cases.entries()) {
      await t.test(item.name, async () => {
        const record = makeCandidate(fixture, {
          taskId: `invalid-project-path-${index}`,
          partition: 'development',
          repository: { projectPath: item.projectPath },
        });
        const harness = await createHarness(fixture, [record], [], `invalid-${index}`);

        await assert.rejects(generateTaskDeliveryDrafts(harness.options), item.message);
        await assertMissing(harness.options.developmentOutputPath);
        await assertMissing(harness.options.qualificationOutputPath);
      });
    }
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

async function createGitFixture({ baseFiles, baseSymlinks = {}, expectedChanges }) {
  const root = await mkdtemp(join(tmpdir(), 'generate-drafts-test-'));
  const corpusRoot = join(root, 'corpus');
  const repositoryPath = join(corpusRoot, 'example__task-context-fixture');
  await mkdir(repositoryPath, { recursive: true });
  git(repositoryPath, ['init', '--initial-branch=main']);

  await writeTree(repositoryPath, baseFiles);
  for (const [path, target] of Object.entries(baseSymlinks)) {
    await mkdir(dirname(join(repositoryPath, path)), { recursive: true });
    await symlink(target, join(repositoryPath, path));
  }
  git(repositoryPath, ['add', '--all']);
  git(repositoryPath, ['commit', '-m', 'base fixture']);
  const baseCommit = git(repositoryPath, ['rev-parse', 'HEAD']);

  for (const [path, contents] of Object.entries(expectedChanges)) {
    const absolute = join(repositoryPath, path);
    if (contents === null) await unlink(absolute);
    else {
      await mkdir(dirname(absolute), { recursive: true });
      await writeFile(absolute, contents);
    }
  }
  git(repositoryPath, ['add', '--all']);
  git(repositoryPath, ['commit', '-m', 'expected fixture']);
  const expectedCommit = git(repositoryPath, ['rev-parse', 'HEAD']);

  return { root, corpusRoot, repositoryPath, baseCommit, expectedCommit };
}

async function createHarness(
  fixture,
  developmentRecords,
  qualificationRecords,
  name = 'default',
) {
  const harnessRoot = join(fixture.root, 'harness', name);
  const options = {
    corpusRoot: fixture.corpusRoot,
    developmentCandidatesPath: join(harnessRoot, 'inputs', 'development.json'),
    qualificationCandidatesPath: join(harnessRoot, 'private', 'qualification.json'),
    developmentOutputPath: join(harnessRoot, 'public', 'development-drafts.json'),
    qualificationOutputPath: join(harnessRoot, 'private', 'qualification-drafts.json'),
  };
  await Promise.all([
    writeJson(options.developmentCandidatesPath, { records: developmentRecords }),
    writeJson(options.qualificationCandidatesPath, { records: qualificationRecords }),
  ]);
  return { options };
}

function makeCandidate(
  fixture,
  {
    taskId,
    opaqueId,
    partition,
    prompt = 'Update the selected user interface.',
    allowedPaths = ['src/**'],
    forbiddenPaths = ['package-lock.json'],
    repository = {},
  },
) {
  return {
    taskId,
    ...(opaqueId ? { opaqueId } : {}),
    partition,
    repository: {
      url: REPOSITORY_URL,
      projectPath: '.',
      corpusProjectPath: '.',
      ...repository,
    },
    base: { commit: fixture.baseCommit },
    expected: { commit: fixture.expectedCommit },
    prompt,
    scope: { allowedPaths, forbiddenPaths },
  };
}

async function writeTree(root, files) {
  await Promise.all(
    Object.entries(files).map(async ([path, contents]) => {
      const absolute = join(root, path);
      await mkdir(dirname(absolute), { recursive: true });
      await writeFile(absolute, contents);
    }),
  );
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function assertMissing(path) {
  await assert.rejects(access(path), (error) => error?.code === 'ENOENT');
}

function packageJson(name = 'task-context-fixture') {
  return JSON.stringify({ name, dependencies: { react: '^19.0.0' } });
}

function git(directory, args) {
  return execFileSync('git', ['-C', directory, ...args], {
    encoding: 'utf8',
    env: FIXED_GIT_ENV,
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}
