#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  readJsonFile,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from '../runner/canonical.mjs';

const benchmarkRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(benchmarkRoot, '..', '..');
const program = 'decantr-3.10-ui-change-control-proof';
const privateConfigSchemaVersion =
  'decantr-benchmark-qualification-private-generator-config.v1';

export async function refreezeCandidates(options) {
  const { replacementMap, projectPathOverrides } = await readRefreezeConfig(
    options.privateConfigPath,
  );
  const corpus = await readJsonFile(options.corpusPath);
  const models = await readJsonFile(options.modelsPath);
  const protocol = await readJsonFile(options.protocolPath);
  const sourceCatalog = await readJsonFile(options.sourceCatalogPath);
  const replacements = await readJsonFile(options.replacementsPath);
  const developmentOverrides = options.developmentOverridesPath
    ? await readJsonFile(options.developmentOverridesPath)
    : null;
  const embargo = protocol.design?.qualificationEmbargoCutoff;
  if (!Number.isFinite(Date.parse(embargo))) {
    throw new Error('protocol.design.qualificationEmbargoCutoff must be a valid timestamp');
  }
  const modelCutoffs = new Map(
    models.models.map((model) => {
      const cutoff = `${model.knowledgeCutoff}T23:59:59Z`;
      if (!Number.isFinite(Date.parse(cutoff))) {
        throw new Error(`${model.id}: knowledgeCutoff must be a full YYYY-MM-DD date`);
      }
      return [model.requestedModel, cutoff];
    }),
  );
  const replacementById = new Map(replacements.candidates.map((candidate) => [candidate.taskId, candidate]));
  const removed = new Set(replacementMap.keys());
  let records = sourceCatalog.records
    .filter((record) => !removed.has(record.taskId))
    .map((record) => structuredClone(record));
  for (const replacementId of replacementMap.values()) {
    const candidate = replacementById.get(replacementId);
    if (!candidate) throw new Error('replacement candidate is missing for private config mapping');
    records.push(candidateToRecord(candidate));
  }
  if (developmentOverrides) {
    if (!Array.isArray(developmentOverrides.records)) {
      throw new Error('development override candidate records are missing');
    }
    const byTaskId = new Map(records.map((record) => [record.taskId, record]));
    const overrideByTaskId = new Map();
    for (const override of developmentOverrides.records) {
      if (
        override?.partition !== 'development' ||
        typeof override.taskId !== 'string' ||
        !byTaskId.has(override.taskId) ||
        overrideByTaskId.has(override.taskId)
      ) {
        throw new Error('development override contains an invalid, duplicate, or unknown task');
      }
      overrideByTaskId.set(override.taskId, structuredClone(override));
    }
    records = records.map((record) => overrideByTaskId.get(record.taskId) ?? record);
  }

  const corpusById = new Map(corpus.repositories.map((repository) => [repository.id, repository]));
  const existingOpaqueIds = new Map(
    sourceCatalog.records
      .filter((record) => record.opaqueId)
      .map((record) => [record.taskId, record.opaqueId]),
  );
  const opaqueMap = await readOpaqueMap(options.opaqueMapPath);
  const seenTaskIds = new Set();
  const appliedProjectPathOverrides = new Set();
  for (const record of records) {
    if (seenTaskIds.has(record.taskId)) throw new Error(`duplicate taskId: ${record.taskId}`);
    seenTaskIds.add(record.taskId);
    const repository = corpusById.get(record.repository.id);
    if (!repository) throw new Error(`${record.taskId}: unknown corpus repository`);
    normalizeRepository(record, repository);
    if (projectPathOverrides.has(record.taskId)) {
      record.repository.projectPath = projectPathOverrides.get(record.taskId);
      appliedProjectPathOverrides.add(record.taskId);
    }
    normalizeCutoffDisclosure(record, embargo, modelCutoffs);
    const postEmbargo = Date.parse(record.provenance.expectedCommitterDate) > Date.parse(embargo);
    record.partition = postEmbargo ? 'qualification' : 'development';
    delete record.opaqueId;
    if (record.partition === 'qualification') {
      const opaqueId = existingOpaqueIds.get(record.taskId) ?? opaqueMap[record.taskId] ?? `q-${randomUUID()}`;
      opaqueMap[record.taskId] = opaqueId;
      record.opaqueId = opaqueId;
    }
  }
  if (appliedProjectPathOverrides.size !== projectPathOverrides.size) {
    throw new Error('private refreeze config contains an unknown project path override');
  }
  records.sort((left, right) => left.taskId.localeCompare(right.taskId));
  validateArithmetic(records, corpus, protocol);
  const gitChecks = options.corpusRoot
    ? verifyGitLineage(records, options.corpusRoot)
    : { checked: false, count: 0 };

  const frozenAt = protocol.frozenAt;
  const sourceCorpus = sourceBinding(corpus);
  const sourceProtocol = sourceBinding(protocol);
  const developmentRecords = records.filter((record) => record.partition === 'development');
  const qualificationRecords = records.filter((record) => record.partition === 'qualification');
  const catalog = {
    schemaVersion: 'decantr-benchmark-task-catalog.v2',
    frozenAt,
    program,
    sourceCorpus,
    sourceProtocol,
    confidentiality: 'PRIVATE: contains plaintext sealed qualification records.',
    count: records.length,
    records,
  };
  const development = {
    schemaVersion: 'decantr-benchmark-development-task-candidates.v2',
    frozenAt,
    program,
    sourceCorpus,
    sourceProtocol,
    confidentiality: 'public development records; not confirmatory holdout evidence',
    count: developmentRecords.length,
    records: developmentRecords.map(withoutOpaqueId),
  };
  const qualification = {
    schemaVersion: 'decantr-benchmark-qualification-task-candidates.v2',
    frozenAt,
    program,
    sourceCorpus,
    sourceProtocol,
    confidentiality: 'PRIVATE: plaintext qualification prompts, provenance, and evaluator designs.',
    qualificationEmbargoCutoff: embargo,
    count: qualificationRecords.length,
    records: qualificationRecords,
  };
  const publicTasks = qualificationRecords
    .map((record) => ({
      opaqueId: record.opaqueId,
      canonicalSha256: sha256Canonical(record),
    }))
    .sort((left, right) => left.opaqueId.localeCompare(right.opaqueId));
  const publicQualificationIndex = {
    schemaVersion: 'decantr-benchmark-public-qualification-index.v1',
    frozenAt,
    program,
    confidentiality: 'opaque qualification bindings only',
    qualificationEmbargoCutoff: embargo,
    count: publicTasks.length,
    bundleSha256: sha256Canonical(publicTasks),
    tasks: publicTasks,
  };
  assertOpaqueIndex(publicQualificationIndex);

  await mkdir(options.publicRoot, { recursive: true });
  await mkdir(options.privateRoot, { recursive: true });
  const paths = {
    catalog: join(options.privateRoot, 'catalog.json'),
    development: join(options.publicRoot, 'development-candidates.json'),
    qualification: join(options.privateRoot, 'qualification-private.json'),
    publicIndex: join(options.publicRoot, 'qualification-index.json'),
    opaqueMap: options.opaqueMapPath,
    privateValidation: join(options.privateRoot, 'validation-report.json'),
    publicAttestation: join(options.publicRoot, 'freeze-attestation.json'),
  };
  await writeCanonicalFile(paths.catalog, catalog);
  await writeCanonicalFile(paths.development, development);
  await writeCanonicalFile(paths.qualification, qualification);
  await writeCanonicalFile(paths.publicIndex, publicQualificationIndex);
  await writeCanonicalFile(paths.opaqueMap, opaqueMap);

  const bindings = {
    catalogSha256: sha256(await readFile(paths.catalog)),
    developmentSha256: sha256(await readFile(paths.development)),
    qualificationPrivateSha256: sha256(await readFile(paths.qualification)),
    publicQualificationIndexSha256: sha256(await readFile(paths.publicIndex)),
  };
  const validation = {
    schemaVersion: 'decantr-benchmark-task-freeze-validation.v2',
    frozenAt,
    program,
    passed: true,
    counts: {
      total: records.length,
      development: developmentRecords.length,
      qualification: qualificationRecords.length,
      repository: records.filter((record) => record.kind === 'repository').length,
      adversarial: records.filter((record) => record.kind === 'adversarial').length,
    },
    qualificationEmbargoCutoff: embargo,
    modelKnowledgeCutoffs: Object.fromEntries(modelCutoffs),
    replacements: [...replacementMap].map(([removedTaskId, addedTaskId]) => ({
      removedTaskId,
      addedTaskId,
    })),
    gitChecks,
    bindings,
    limitations: [
      'Repository identities were observed during development; this is task-sealed, not repository-blind.',
      'Evaluator implementations and expected patches remain required before runnable manifests can be frozen.',
    ],
  };
  const publicAttestation = {
    schemaVersion: 'decantr-benchmark-public-task-freeze-attestation.v1',
    frozenAt,
    program,
    passed: true,
    counts: validation.counts,
    qualificationEmbargoCutoff: embargo,
    modelKnowledgeCutoffs: validation.modelKnowledgeCutoffs,
    gitLineagesVerified: gitChecks.checked ? gitChecks.count : 0,
    developmentSha256: bindings.developmentSha256,
    publicQualificationIndexSha256: bindings.publicQualificationIndexSha256,
    qualificationBundleSha256: publicQualificationIndex.bundleSha256,
    limitations: validation.limitations,
  };
  await writeCanonicalFile(paths.privateValidation, validation);
  await writeCanonicalFile(paths.publicAttestation, publicAttestation);
  return { paths, validation, publicQualificationIndex };
}

function candidateToRecord(candidate) {
  return {
    schemaVersion: 'decantr-benchmark-task-candidate.v1',
    taskId: candidate.taskId,
    partition: 'qualification',
    kind: candidate.kind,
    repository: {
      id: candidate.repository.id,
      url: candidate.repository.url,
      framework: candidate.repository.framework,
      projectPath: candidate.repository.projectPath,
      corpusProjectPath: candidate.repository.projectPath,
      corpusPin: candidate.repository.corpusPin,
      corpusTree: candidate.repository.corpusTree,
      license: candidate.repository.license,
    },
    provenance: {
      type: 'commit',
      url: candidate.provenance.expectedCommitUrl,
      sourceReportDisclosure: 'Post-embargo local Git curation.',
      expectedCommitUrl: candidate.provenance.expectedCommitUrl,
      expectedCommitterDate: candidate.provenance.expectedCommitterDate,
      expectedSubject: candidate.provenance.expectedSubject,
      canonicalPatchSha256: candidate.provenance.canonicalPatchSha256,
      cutoffDisclosure: {},
    },
    base: candidate.base,
    expected: candidate.expected,
    ancestry: candidate.ancestry,
    prompt: candidate.prompt,
    scope: candidate.scope,
    environment: candidate.environment,
    evaluator: {
      visibility: candidate.evaluator.visibility,
      implementationLocation: 'external benchmark harness, mounted only after the agent run',
      design: candidate.evaluator.design,
      checks: candidate.evaluator.checks,
      commonFailures: [
        'edit outside allowed paths',
        'dependency or lockfile change unless explicitly allowed',
        'build failure',
        'console error',
        'accessibility regression',
      ],
    },
    informationEntitlement: standardEntitlement(candidate),
    limitations: candidate.risks,
  };
}

function standardEntitlement(candidate) {
  const entitlement = {
    parityRule: 'Both arms receive the same human-authored facts and repository access.',
    sourceList: [
      {
        id: 'base-checkout',
        type: 'repository-tree',
        reference: `${candidate.repository.url}@${candidate.base.commit}`,
        paths: ['**/*'],
        access: 'All tracked files at the base commit are readable by both arms.',
      },
      {
        id: 'task-prompt',
        type: 'benchmark-input',
        reference: 'record.prompt',
        access: 'Identical plaintext prompt for both arms.',
      },
      {
        id: 'scope-policy',
        type: 'benchmark-input',
        reference: 'record.scope',
        access: 'Identical allowed and forbidden path policy for both arms.',
      },
      {
        id: 'execution-contract',
        type: 'benchmark-input',
        reference: 'record.environment',
        access: 'Identical environment and command contract for both arms.',
      },
    ],
    excludedFromAgent: [
      'expected commit, expected tree, and expected diff',
      'provenance implementation discussion',
      'hidden evaluator implementation and checks',
      'personal skills, tools, memory, and host configuration',
    ],
  };
  entitlement.canonicalSha256 = sha256Canonical(entitlement);
  return entitlement;
}

function normalizeRepository(record, repository) {
  record.repository.corpusProjectPath = repository.projectPath;
  record.repository.corpusPin = repository.commit;
  if (record.repository.framework !== repository.framework) {
    throw new Error(`${record.taskId}: framework differs from corpus`);
  }
  if (record.repository.url.replace(/\.git$/u, '') !== repository.repo.replace(/\.git$/u, '')) {
    throw new Error(`${record.taskId}: repository URL differs from corpus`);
  }
}

function normalizeCutoffDisclosure(record, embargo, modelCutoffs) {
  const expectedAt = Date.parse(record.provenance.expectedCommitterDate);
  if (!Number.isFinite(expectedAt)) throw new Error(`${record.taskId}: invalid expected commit date`);
  record.provenance.cutoffDisclosure = {
    qualificationEmbargo: {
      cutoff: embargo,
      relation: expectedAt > Date.parse(embargo) ? 'post-cutoff' : 'pre-or-on-cutoff',
    },
    models: Object.fromEntries(
      [...modelCutoffs].map(([model, cutoff]) => [
        model,
        { cutoff, relation: expectedAt > Date.parse(cutoff) ? 'post-cutoff' : 'pre-or-on-cutoff' },
      ]),
    ),
  };
}

function validateArithmetic(records, corpus, protocol) {
  const expected = protocol.design;
  const counts = {
    total: records.length,
    development: records.filter((record) => record.partition === 'development').length,
    qualification: records.filter((record) => record.partition === 'qualification').length,
    repository: records.filter((record) => record.kind === 'repository').length,
    adversarial: records.filter((record) => record.kind === 'adversarial').length,
  };
  const requiredDevelopment = expected.taskCount - expected.minimumQualificationTasks;
  if (
    counts.total !== expected.taskCount ||
    counts.development !== requiredDevelopment ||
    counts.qualification !== expected.minimumQualificationTasks ||
    counts.repository !== expected.repositoryTaskCount ||
    counts.adversarial !== expected.adversarialTaskCount
  ) {
    throw new Error(`task arithmetic drift: ${JSON.stringify(counts)}`);
  }
  const repositoryCoverage = new Map();
  for (const record of records.filter((record) => record.kind === 'repository')) {
    repositoryCoverage.set(
      record.repository.id,
      (repositoryCoverage.get(record.repository.id) ?? 0) + 1,
    );
  }
  for (const repository of corpus.repositories) {
    if (repositoryCoverage.get(repository.id) !== 1) {
      throw new Error(`repository task coverage must be exactly one for ${repository.id}`);
    }
  }
  for (const record of records.filter((record) => record.partition === 'qualification')) {
    if (record.provenance.cutoffDisclosure.qualificationEmbargo.relation !== 'post-cutoff') {
      throw new Error(`${record.taskId}: qualification task predates the embargo`);
    }
    if (
      Object.values(record.provenance.cutoffDisclosure.models).some(
        (disclosure) => disclosure.relation !== 'post-cutoff',
      )
    ) {
      throw new Error(`${record.taskId}: qualification task predates a model cutoff`);
    }
  }
}

function verifyGitLineage(records, corpusRoot) {
  for (const record of records) {
    const directory = join(corpusRoot, githubSlug(record.repository.url));
    const firstParent = git(directory, ['rev-parse', `${record.expected.commit}^1`]);
    const baseTree = git(directory, ['rev-parse', `${record.base.commit}^{tree}`]);
    const expectedTree = git(directory, ['rev-parse', `${record.expected.commit}^{tree}`]);
    const corpusTree = git(directory, ['rev-parse', `${record.repository.corpusPin}^{tree}`]);
    if (firstParent !== record.base.commit) throw new Error(`${record.taskId}: base is not expected^1`);
    if (baseTree !== record.base.tree) throw new Error(`${record.taskId}: base tree mismatch`);
    if (expectedTree !== record.expected.tree) throw new Error(`${record.taskId}: expected tree mismatch`);
    if (corpusTree !== record.repository.corpusTree) {
      throw new Error(`${record.taskId}: corpus tree mismatch`);
    }
    git(directory, [
      'merge-base',
      '--is-ancestor',
      record.expected.commit,
      record.repository.corpusPin,
    ]);
  }
  return { checked: true, count: records.length, requirement: 'base=expected^1 and expected<=pin' };
}

function githubSlug(url) {
  return url.replace(/^https:\/\/github\.com\//u, '').replace(/\.git$/u, '').replace('/', '__');
}

function git(directory, args) {
  return execFileSync('git', ['-C', directory, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function sourceBinding(value) {
  return {
    schemaVersion: value.schemaVersion,
    frozenAt: value.frozenAt,
    canonicalSha256: sha256Canonical(value),
  };
}

function withoutOpaqueId(record) {
  const copy = structuredClone(record);
  delete copy.opaqueId;
  return copy;
}

function assertOpaqueIndex(index) {
  const serialized = JSON.stringify(index).toLowerCase();
  for (const forbidden of ['repositoryid', 'framework', 'prompt', 'taskid', 'evaluator', 'github']) {
    if (serialized.includes(forbidden)) {
      throw new Error(`public qualification index leaks forbidden token: ${forbidden}`);
    }
  }
  for (const task of index.tasks) {
    if (Object.keys(task).sort().join(',') !== 'canonicalSha256,opaqueId') {
      throw new Error(`public qualification entry ${task.opaqueId} contains extra fields`);
    }
  }
}

async function readOpaqueMap(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return {};
    throw error;
  }
}

async function readRefreezeConfig(path) {
  if (!path) throw new Error('private generator config is required');
  const config = await readJsonFile(path);
  if (
    !isObject(config) ||
    config.schemaVersion !== privateConfigSchemaVersion ||
    !isObject(config.refreeze) ||
    !hasExactKeys(config.refreeze, ['projectPathOverrides', 'replacements']) ||
    !Array.isArray(config.refreeze.replacements) ||
    !Array.isArray(config.refreeze.projectPathOverrides)
  ) {
    throw new Error('private generator config has an invalid refreeze section');
  }

  const replacementMap = new Map();
  const addedTaskIds = new Set();
  for (const replacement of config.refreeze.replacements) {
    if (
      !isObject(replacement) ||
      !hasExactKeys(replacement, ['addedTaskId', 'removedTaskId']) ||
      !isTaskId(replacement.removedTaskId) ||
      !isTaskId(replacement.addedTaskId) ||
      replacementMap.has(replacement.removedTaskId) ||
      addedTaskIds.has(replacement.addedTaskId)
    ) {
      throw new Error('private generator config contains an invalid replacement mapping');
    }
    replacementMap.set(replacement.removedTaskId, replacement.addedTaskId);
    addedTaskIds.add(replacement.addedTaskId);
  }

  const projectPathOverrides = new Map();
  for (const override of config.refreeze.projectPathOverrides) {
    if (
      !isObject(override) ||
      !hasExactKeys(override, ['projectPath', 'taskId']) ||
      !isTaskId(override.taskId) ||
      !isRelativeProjectPath(override.projectPath) ||
      projectPathOverrides.has(override.taskId)
    ) {
      throw new Error('private generator config contains an invalid project path override');
    }
    projectPathOverrides.set(override.taskId, override.projectPath);
  }
  return { replacementMap, projectPathOverrides };
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasExactKeys(value, expected) {
  return Object.keys(value).sort().join('\0') === [...expected].sort().join('\0');
}

function isTaskId(value) {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9._-]{2,95}$/u.test(value);
}

function isRelativeProjectPath(value) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !value.startsWith('/') &&
    !value.includes('\\') &&
    !value.split('/').includes('..')
  );
}

function parseArgs(argv) {
  const options = {
    corpusPath: join(benchmarkRoot, 'corpus.json'),
    modelsPath: join(benchmarkRoot, 'models.json'),
    protocolPath: join(benchmarkRoot, 'protocol.json'),
    publicRoot: join(benchmarkRoot, 'tasks'),
    privateRoot: resolve('.private/benchmark-3-10/task-freeze'),
    privateConfigPath: join(
      repositoryRoot,
      '.private',
      'benchmark-3-10',
      'qualification-generator-config.json',
    ),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--source-catalog') options.sourceCatalogPath = resolve(argv[++index]);
    else if (argument === '--replacements') options.replacementsPath = resolve(argv[++index]);
    else if (argument === '--private-config') options.privateConfigPath = resolve(argv[++index]);
    else if (argument === '--development-overrides') options.developmentOverridesPath = resolve(argv[++index]);
    else if (argument === '--corpus-root') options.corpusRoot = resolve(argv[++index]);
    else if (argument === '--public-root') options.publicRoot = resolve(argv[++index]);
    else if (argument === '--private-root') options.privateRoot = resolve(argv[++index]);
    else if (argument === '--corpus') options.corpusPath = resolve(argv[++index]);
    else if (argument === '--models') options.modelsPath = resolve(argv[++index]);
    else if (argument === '--protocol') options.protocolPath = resolve(argv[++index]);
    else throw new Error(`Unknown option: ${argument}`);
  }
  for (const name of ['sourceCatalogPath', 'replacementsPath', 'privateConfigPath']) {
    if (!options[name]) throw new Error(`Missing required option: ${name}`);
  }
  options.opaqueMapPath = join(options.privateRoot, 'opaque-map.json');
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await refreezeCandidates(parseArgs(process.argv.slice(2)));
    console.log(
      JSON.stringify(
        {
          ok: true,
          counts: result.validation.counts,
          gitChecks: result.validation.gitChecks,
        },
        null,
        2,
      ),
    );
  } catch {
    console.error('Candidate refreeze failed; inspect the private inputs locally.');
    process.exitCode = 1;
  }
}
