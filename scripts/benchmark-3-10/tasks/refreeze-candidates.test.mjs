import assert from 'node:assert/strict';
import { access, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { prettyCanonicalJson, sha256Canonical } from '../runner/canonical.mjs';
import { refreezeCandidates } from './refreeze-candidates.mjs';

const FROZEN_AT = '2026-07-22T11:29:02Z';
const EMBARGO = '2026-05-01T23:59:59Z';
const PRE_EMBARGO = '2026-04-30T12:00:00Z';
const POST_EMBARGO = '2026-05-02T00:00:00Z';
const REMOVED_TASK_IDS = [
  'fixture.removed-alpha',
  'fixture.removed-beta',
  'fixture.removed-gamma',
];
const ADDED_TASK_IDS = [
  'fixture.added-alpha',
  'fixture.added-beta',
  'fixture.added-gamma',
];
const PRIVATE_CONFIG_SCHEMA_VERSION =
  'decantr-benchmark-qualification-private-generator-config.v1';

test('refreeze separates public and private records and remains stable on rerun', async () => {
  const fixture = await createFixture();
  try {
    const first = await refreezeCandidates(fixture.options);
    assert.deepEqual(first.validation.counts, {
      total: 40,
      development: 24,
      qualification: 16,
      repository: 28,
      adversarial: 12,
    });
    assert.equal(first.validation.gitChecks.checked, false);

    const catalog = await readJson(first.paths.catalog);
    const development = await readJson(first.paths.development);
    const qualification = await readJson(first.paths.qualification);
    const publicIndex = await readJson(first.paths.publicIndex);
    const opaqueMap = await readJson(first.paths.opaqueMap);
    const attestation = await readJson(first.paths.publicAttestation);

    assert.equal(catalog.count, 40);
    assert.equal(development.count, 24);
    assert.equal(qualification.count, 16);
    assert.equal(publicIndex.count, 16);
    assert.deepEqual(attestation.counts, first.validation.counts);
    assert.equal(development.records.every((record) => !('opaqueId' in record)), true);
    assert.equal(qualification.records.every((record) => record.opaqueId), true);
    assert.equal(
      qualification.records.every(
        (record) =>
          record.provenance.cutoffDisclosure.qualificationEmbargo.relation === 'post-cutoff' &&
          Object.values(record.provenance.cutoffDisclosure.models).every(
            (disclosure) => disclosure.relation === 'post-cutoff',
          ),
      ),
      true,
    );

    const finalTaskIds = new Set(catalog.records.map((record) => record.taskId));
    for (const taskId of REMOVED_TASK_IDS) assert.equal(finalTaskIds.has(taskId), false);
    for (const taskId of ADDED_TASK_IDS) assert.equal(finalTaskIds.has(taskId), true);
    assert.deepEqual(
      first.validation.replacements,
      REMOVED_TASK_IDS.map((removedTaskId, index) => ({
        removedTaskId,
        addedTaskId: ADDED_TASK_IDS[index],
      })),
    );

    const replacement = qualification.records.find(
      (record) => record.taskId === ADDED_TASK_IDS[0],
    );
    assert.equal(replacement.repository.projectPath, 'packages/fixture-widget');
    assert.equal(replacement.repository.corpusProjectPath, 'apps/repo-01');
    assert.equal(replacement.prompt, `SEALED_PROMPT_${ADDED_TASK_IDS[0]}`);
    assert.equal(opaqueMap[replacement.taskId], replacement.opaqueId);

    const onEmbargo = development.records.find(
      (record) => record.taskId === 'fixture.repository-14',
    );
    assert.equal(onEmbargo.provenance.expectedCommitterDate, EMBARGO);
    assert.equal(
      onEmbargo.provenance.cutoffDisclosure.qualificationEmbargo.relation,
      'pre-or-on-cutoff',
    );
    assert.equal(
      Object.values(onEmbargo.provenance.cutoffDisclosure.models).every(
        (disclosure) => disclosure.relation === 'post-cutoff',
      ),
      true,
    );

    const publicIndexText = await readFile(first.paths.publicIndex, 'utf8');
    for (const forbidden of [
      'repositoryId',
      'framework',
      'prompt',
      'taskId',
      'evaluator',
      'github',
      'SEALED_PROMPT',
    ]) {
      assert.equal(publicIndexText.toLowerCase().includes(forbidden.toLowerCase()), false);
    }
    for (const entry of publicIndex.tasks) {
      assert.deepEqual(Object.keys(entry).sort(), ['canonicalSha256', 'opaqueId']);
      const privateRecord = qualification.records.find(
        (record) => record.opaqueId === entry.opaqueId,
      );
      assert.ok(privateRecord);
      assert.equal(entry.canonicalSha256, sha256Canonical(privateRecord));
    }
    assert.equal(publicIndex.bundleSha256, sha256Canonical(publicIndex.tasks));

    const firstBytes = await readAllOutputs(first.paths);
    const second = await refreezeCandidates(fixture.options);
    const secondBytes = await readAllOutputs(second.paths);
    assert.deepEqual(second.validation.bindings, first.validation.bindings);
    assert.deepEqual(second.publicQualificationIndex, first.publicQualificationIndex);
    assert.deepEqual(secondBytes, firstBytes);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('refreeze fails closed when a required replacement is absent', async () => {
  const fixture = await createFixture();
  try {
    fixture.replacements.candidates = fixture.replacements.candidates.filter(
      (candidate) => candidate.taskId !== ADDED_TASK_IDS[2],
    );
    await writeJson(fixture.options.replacementsPath, fixture.replacements);

    await assert.rejects(
      refreezeCandidates(fixture.options),
      /replacement candidate is missing/u,
    );
    await assertNoOutputs(fixture);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('refreeze applies explicit development overrides and binds them in the public attestation', async () => {
  const fixture = await createFixture();
  try {
    const override = structuredClone(
      fixture.sourceCatalog.records.find((record) => record.taskId === 'fixture.repository-14'),
    );
    override.partition = 'development';
    override.prompt = 'Reviewed development prompt with a narrower authentic outcome.';
    const developmentOverridesPath = join(fixture.root, 'inputs', 'development-overrides.json');
    await writeJson(developmentOverridesPath, { records: [override] });
    const result = await refreezeCandidates({
      ...fixture.options,
      developmentOverridesPath,
    });
    const development = await readJson(result.paths.development);
    assert.equal(
      development.records.find((record) => record.taskId === override.taskId).prompt,
      override.prompt,
    );
    const attestation = await readJson(result.paths.publicAttestation);
    assert.equal(attestation.developmentSha256, result.validation.bindings.developmentSha256);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('refreeze fails closed when the embargo-derived partition arithmetic drifts', async () => {
  const fixture = await createFixture();
  try {
    const record = fixture.sourceCatalog.records.find(
      (candidate) => candidate.taskId === 'fixture.repository-14',
    );
    record.provenance.expectedCommitterDate = POST_EMBARGO;
    await writeJson(fixture.options.sourceCatalogPath, fixture.sourceCatalog);

    await assert.rejects(
      refreezeCandidates(fixture.options),
      /task arithmetic drift: .*"development":23,"qualification":17/u,
    );
    await assertNoOutputs(fixture);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('refreeze fails closed when a qualification task predates a model cutoff', async () => {
  const fixture = await createFixture();
  try {
    fixture.models.models[0].knowledgeCutoff = '2026-12-31';
    await writeJson(fixture.options.modelsPath, fixture.models);

    await assert.rejects(
      refreezeCandidates(fixture.options),
      /qualification task predates a model cutoff/u,
    );
    await assertNoOutputs(fixture);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('refreeze fails closed when an opaque identifier leaks a forbidden public token', async () => {
  const fixture = await createFixture();
  try {
    const record = fixture.sourceCatalog.records.find(
      (candidate) => candidate.taskId === 'fixture.repository-01',
    );
    record.opaqueId = 'q-github-private-identity';
    await writeJson(fixture.options.sourceCatalogPath, fixture.sourceCatalog);

    await assert.rejects(
      refreezeCandidates(fixture.options),
      /public qualification index leaks forbidden token: github/u,
    );
    await assertNoOutputs(fixture);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), 'refreeze-candidates-test-'));
  const inputRoot = join(root, 'inputs');
  const publicRoot = join(root, 'public');
  const privateRoot = join(root, 'private');
  await mkdir(inputRoot, { recursive: true });

  const corpus = makeCorpus();
  const models = makeModels();
  const protocol = makeProtocol();
  const sourceCatalog = makeSourceCatalog(corpus);
  const replacements = makeReplacements(corpus);
  const privateConfig = makePrivateConfig();
  const options = {
    corpusPath: join(inputRoot, 'corpus.json'),
    modelsPath: join(inputRoot, 'models.json'),
    protocolPath: join(inputRoot, 'protocol.json'),
    sourceCatalogPath: join(inputRoot, 'source-catalog.json'),
    replacementsPath: join(inputRoot, 'replacements.json'),
    privateConfigPath: join(inputRoot, 'private-generator-config.json'),
    publicRoot,
    privateRoot,
    opaqueMapPath: join(privateRoot, 'opaque-map.json'),
  };
  await Promise.all([
    writeJson(options.corpusPath, corpus),
    writeJson(options.modelsPath, models),
    writeJson(options.protocolPath, protocol),
    writeJson(options.sourceCatalogPath, sourceCatalog),
    writeJson(options.replacementsPath, replacements),
    writeJson(options.privateConfigPath, privateConfig),
  ]);
  return {
    root,
    publicRoot,
    privateRoot,
    corpus,
    models,
    protocol,
    sourceCatalog,
    replacements,
    privateConfig,
    options,
  };
}

function makePrivateConfig() {
  return {
    schemaVersion: PRIVATE_CONFIG_SCHEMA_VERSION,
    refreeze: {
      replacements: REMOVED_TASK_IDS.map((removedTaskId, index) => ({
        removedTaskId,
        addedTaskId: ADDED_TASK_IDS[index],
      })),
      projectPathOverrides: [
        {
          taskId: ADDED_TASK_IDS[0],
          projectPath: 'packages/fixture-widget',
        },
      ],
    },
    environments: { taskOverrides: [] },
    privacyAudit: { sensitiveTokens: [] },
  };
}

function makeCorpus() {
  return {
    schemaVersion: 'decantr-benchmark-corpus.v1',
    frozenAt: FROZEN_AT,
    repositories: Array.from({ length: 28 }, (_, index) => {
      const sequence = String(index + 1).padStart(2, '0');
      return {
        id: `repo-${sequence}`,
        repo: `https://github.com/example/repo-${sequence}.git`,
        framework: `framework-${sequence}`,
        projectPath: `apps/repo-${sequence}`,
        commit: `corpus-pin-${sequence}`,
        tree: `corpus-tree-${sequence}`,
        license: 'MIT',
      };
    }),
  };
}

function makeModels() {
  return {
    schemaVersion: 'decantr-benchmark-models.v1',
    frozenAt: FROZEN_AT,
    models: [
      {
        id: 'sol',
        requestedModel: 'gpt-5.6-sol',
        knowledgeCutoff: '2026-02-16',
      },
      {
        id: 'fable',
        requestedModel: 'claude-fable-5',
        knowledgeCutoff: '2026-01-31',
      },
    ],
  };
}

function makeProtocol() {
  return {
    schemaVersion: 'decantr-benchmark-protocol.v1',
    frozenAt: FROZEN_AT,
    design: {
      qualificationEmbargoCutoff: EMBARGO,
      taskCount: 40,
      minimumQualificationTasks: 16,
      repositoryTaskCount: 28,
      adversarialTaskCount: 12,
    },
  };
}

function makeSourceCatalog(corpus) {
  const repositoryRecords = corpus.repositories.map((repository, index) => {
    const postEmbargo = index < 13;
    const expectedCommitterDate = postEmbargo
      ? POST_EMBARGO
      : index === 13
        ? EMBARGO
        : PRE_EMBARGO;
    return makeRecord({
      taskId: `fixture.repository-${String(index + 1).padStart(2, '0')}`,
      kind: 'repository',
      repository,
      expectedCommitterDate,
      opaqueId: postEmbargo ? `q-source-${String(index + 1).padStart(2, '0')}` : undefined,
    });
  });
  const adversarialTaskIds = [
    ...REMOVED_TASK_IDS,
    ...Array.from({ length: 9 }, (_, index) =>
      `fixture.retained-${String(index + 1).padStart(2, '0')}`,
    ),
  ];
  const adversarialRecords = adversarialTaskIds.map((taskId, index) =>
    makeRecord({
      taskId,
      kind: 'adversarial',
      repository: corpus.repositories[index % corpus.repositories.length],
      expectedCommitterDate: PRE_EMBARGO,
    }),
  );
  return {
    schemaVersion: 'decantr-benchmark-task-catalog.v1',
    frozenAt: '2026-07-21T12:00:00Z',
    records: [...repositoryRecords, ...adversarialRecords],
  };
}

function makeRecord({ taskId, kind, repository, expectedCommitterDate, opaqueId }) {
  const record = {
    schemaVersion: 'decantr-benchmark-task-candidate.v1',
    taskId,
    partition: 'stale-partition',
    kind,
    repository: {
      id: repository.id,
      url: repository.repo.replace(/\.git$/u, ''),
      framework: repository.framework,
      projectPath: `historical/${repository.id}`,
      corpusProjectPath: 'stale/project-path',
      corpusPin: 'stale-corpus-pin',
      corpusTree: repository.tree,
      license: repository.license,
    },
    provenance: {
      type: 'commit',
      expectedCommitterDate,
      expectedSubject: `Expected change for ${taskId}`,
      cutoffDisclosure: { stale: true },
    },
    base: { commit: `base-${taskId}`, tree: `base-tree-${taskId}` },
    expected: { commit: `expected-${taskId}`, tree: `expected-tree-${taskId}` },
    prompt: `SEALED_PROMPT_${taskId}`,
    evaluator: { design: `SEALED_EVALUATOR_${taskId}` },
  };
  if (opaqueId) record.opaqueId = opaqueId;
  return record;
}

function makeReplacements(corpus) {
  return {
    schemaVersion: 'decantr-benchmark-replacement-candidates.v1',
    candidates: ADDED_TASK_IDS.map((taskId, index) => {
      const repository = corpus.repositories[index];
      return {
        taskId,
        kind: 'adversarial',
        repository: {
          id: repository.id,
          url: repository.repo,
          framework: repository.framework,
          projectPath: `historical/${repository.id}`,
          corpusPin: repository.commit,
          corpusTree: repository.tree,
          license: repository.license,
        },
        provenance: {
          expectedCommitUrl: `${repository.repo.replace(/\.git$/u, '')}/commit/expected-${index + 1}`,
          expectedCommitterDate: `2026-06-${String(index + 10).padStart(2, '0')}T12:00:00Z`,
          expectedSubject: `Replacement change ${index + 1}`,
          canonicalPatchSha256: sha256Canonical({ taskId, patch: index + 1 }),
        },
        base: { commit: `replacement-base-${index + 1}`, tree: `replacement-base-tree-${index + 1}` },
        expected: {
          commit: `replacement-expected-${index + 1}`,
          tree: `replacement-expected-tree-${index + 1}`,
        },
        ancestry: { baseIsFirstParent: true, expectedIsAncestorOfCorpusPin: true },
        prompt: `SEALED_PROMPT_${taskId}`,
        scope: { allowedPaths: [`src/replacement-${index + 1}.tsx`], forbiddenPaths: [] },
        environment: { install: 'pnpm install', verify: 'pnpm test' },
        evaluator: {
          visibility: 'sealed',
          design: `SEALED_EVALUATOR_${taskId}`,
          checks: ['functional behavior', 'scope compliance'],
        },
        risks: ['synthetic test fixture'],
      };
    }),
  };
}

async function readAllOutputs(paths) {
  return Object.fromEntries(
    await Promise.all(
      Object.entries(paths).map(async ([name, path]) => [name, await readFile(path, 'utf8')]),
    ),
  );
}

async function assertNoOutputs(fixture) {
  await assert.rejects(access(fixture.publicRoot), { code: 'ENOENT' });
  await assert.rejects(access(fixture.privateRoot), { code: 'ENOENT' });
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJson(path, value) {
  await writeFile(path, prettyCanonicalJson(value));
}
