#!/usr/bin/env node
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { checkoutDirectory } from '../lib.mjs';
import {
  prettyCanonicalJson,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from '../runner/canonical.mjs';
import { assertEvaluatorContract } from '../runner/contracts.mjs';
import {
  assertFixedCommand,
  isForbiddenDecantrOracleToken,
  isForbiddenEvaluatorEnvironmentKey,
  resolveContained,
  runFixed,
  sanitizedEnvironment,
} from '../runner/process.mjs';

const directory = dirname(fileURLToPath(import.meta.url));
const benchmarkRoot = resolve(directory, '..');
const repositoryRoot = resolve(benchmarkRoot, '..', '..');
const PROGRAM = 'decantr-3.10-ui-change-control-proof';
const TASK_ID = /^[a-z0-9][a-z0-9._-]{2,95}$/u;
const GIT_SHA = /^[a-f0-9]{40}$/u;
const SHA256 = /^[a-f0-9]{64}$/u;
const OPAQUE_ID = /^q-[a-f0-9-]{36}$/u;
const ALLOWED_PLACEHOLDERS = new Set([
  'WORKSPACE',
  'PROJECT_PATH',
  'EVALUATOR_ROOT',
  'EVALUATOR_RUNTIME',
  'HOME',
]);
const NETWORK_EXECUTABLES = new Set([
  'anthropic',
  'claude',
  'codex',
  'curl',
  'ftp',
  'gh',
  'nc',
  'netcat',
  'scp',
  'sftp',
  'ssh',
  'telnet',
  'wget',
  'openai',
]);
const FORBIDDEN_SOURCE_MODULES = new Set([
  'axios',
  'dgram',
  'dns',
  'got',
  'http2',
  'https',
  'node-fetch',
  'tls',
  'undici',
]);
const PROVIDER_MODULES = new Set([
  '@anthropic-ai/sdk',
  '@aws-sdk/client-bedrock-runtime',
  '@aws-sdk/client-sagemaker-runtime',
  '@azure-rest/ai-inference',
  '@azure/openai',
  '@google/generative-ai',
  '@google/genai',
  '@google-cloud/vertexai',
  '@huggingface/inference',
  '@langchain/anthropic',
  '@langchain/openai',
  '@mistralai/mistralai',
  'ai',
  'cohere-ai',
  'groq-sdk',
  'mistralai',
  'ollama',
  'openai',
  'replicate',
  'together-ai',
]);
const PROVIDER_MODULE_PREFIXES = [
  '@ai-sdk/',
  '@anthropic-ai/',
];
const PROVIDER_ENDPOINT =
  /\b(?:api\.anthropic\.com|api\.cerebras\.ai|api\.cohere\.ai|api\.deepseek\.com|api\.fireworks\.ai|api\.groq\.com|api\.mistral\.ai|api\.openai\.com|api\.perplexity\.ai|api\.replicate\.com|api\.together\.xyz|api\.x\.ai|api-inference\.huggingface\.co|aiplatform\.googleapis\.com|bedrock-runtime(?:-fips)?\.[a-z0-9-]+\.amazonaws\.com|generativelanguage\.googleapis\.com|openrouter\.ai\/api|[a-z0-9-]+\.openai\.azure\.com)\b/iu;
const REGEX_PREFIX_KEYWORDS = new Set([
  'await',
  'case',
  'delete',
  'do',
  'else',
  'in',
  'instanceof',
  'of',
  'return',
  'throw',
  'typeof',
  'void',
  'yield',
]);
const REGEX_PREFIX_PUNCTUATORS = new Set([
  '(',
  '{',
  '[',
  ',',
  ':',
  ';',
  '=',
  '!',
  '?',
  '~',
  '+',
  '-',
  '*',
  '%',
  '&',
  '|',
  '^',
  '<',
  '>',
]);
const OFFLINE_ENVIRONMENT = Object.freeze({
  BUN_TELEMETRY_DISABLE: '1',
  GIT_LFS_SKIP_SMUDGE: '1',
  GIT_TERMINAL_PROMPT: '0',
  NPM_CONFIG_AUDIT: 'false',
  NPM_CONFIG_FUND: 'false',
  NPM_CONFIG_OFFLINE: 'true',
  PNPM_CONFIG_OFFLINE: 'true',
  YARN_ENABLE_NETWORK: '0',
  YARN_ENABLE_TELEMETRY: '0',
});

class UsageError extends Error {}

export async function qualifyEvaluators(inputOptions) {
  const options = normalizeOptions(inputOptions);
  const schemaPaths = {
    authoring: join(benchmarkRoot, 'schemas', 'evaluator-authoring-spec.schema.json'),
    contract: join(benchmarkRoot, 'schemas', 'evaluator-contract.schema.json'),
  };
  const [candidateFile, corpusFile, authoringSchemaFile, contractSchemaFile] = await Promise.all([
    readJson(options.candidatesPath, 'candidate set'),
    readJson(options.corpusPath, 'corpus'),
    readJson(schemaPaths.authoring, 'evaluator authoring schema'),
    readJson(schemaPaths.contract, 'evaluator contract schema'),
  ]);
  const schemas = {
    'evaluator-authoring-spec.schema.json': authoringSchemaFile.value,
    'evaluator-contract.schema.json': contractSchemaFile.value,
  };
  const candidates = assertCandidateSet(candidateFile.value, options.partition);
  const corpusById = assertCorpus(corpusFile.value);
  const publicIndexFile =
    options.partition === 'qualification'
      ? await readJson(options.publicCandidateIndexPath, 'public qualification candidate index')
      : null;
  const publicCandidates = publicIndexFile
    ? assertPublicCandidateIndex(publicIndexFile.value, candidates)
    : null;
  const authored = await loadAuthoredEvaluators({
    candidates,
    evaluatorRoot: options.evaluatorRoot,
    schema: authoringSchemaFile.value,
    schemas,
  });

  for (const item of authored) {
    assertCandidateCorpusBinding(item.candidate, corpusById);
    if (publicCandidates) {
      const expectedDigest = publicCandidates.get(item.candidate.opaqueId);
      if (expectedDigest !== item.candidateSha256) {
        throw new Error(`${item.label}: private candidate bytes differ from the public opaque binding`);
      }
    }
    syntaxCheckSource(item, options);
  }

  await mkdir(options.worktreeRoot, { recursive: true, mode: 0o700 });
  const sessionRoot = await mkdtemp(join(options.worktreeRoot, `evaluator-${options.partition}-`));
  const results = [];
  try {
    for (let index = 0; index < authored.length; index += 1) {
      const item = authored[index];
      try {
        results.push(await qualifyOne(item, corpusById, sessionRoot, index, options));
      } catch (error) {
        throw taskError(item, error);
      }
    }
  } finally {
    await rm(sessionRoot, { recursive: true, force: true });
  }

  const schemaSha256 = sha256Canonical({
    evaluatorAuthoringSpec: sha256(authoringSchemaFile.bytes),
    evaluatorContract: sha256(contractSchemaFile.bytes),
  });
  const attestation =
    options.partition === 'development'
      ? buildDevelopmentAttestation({
          candidateSetSha256: sha256(candidateFile.bytes),
          corpusSha256: sha256(corpusFile.bytes),
          schemaSha256,
          results,
        })
      : buildQualificationAttestation({
          candidateIndexSha256: sha256(publicIndexFile.bytes),
          candidateSetSha256: sha256(candidateFile.bytes),
          corpusSha256: sha256(corpusFile.bytes),
          schemaSha256,
          results,
        });

  if (options.partition === 'qualification') assertOpaqueAttestation(attestation, authored);
  if (options.outputPath) await writeCanonicalFile(options.outputPath, attestation);
  return attestation;
}

export async function loadAuthoredEvaluators(options) {
  const specRoot = join(options.evaluatorRoot, 'specs');
  const sourceRoot = join(options.evaluatorRoot, 'sources');
  const [specEntries, sourceEntries] = await Promise.all([
    readdir(specRoot, { withFileTypes: true }),
    readdir(sourceRoot, { withFileTypes: true }),
  ]);
  const specIds = collectAuthoredIds(specEntries, '.json', 'spec');
  const sourceIds = collectAuthoredIds(sourceEntries, '.mjs', 'source');
  assertSameIds(specIds, sourceIds, 'evaluator specs and sources');

  const candidateById = new Map(options.candidates.map((candidate) => [candidate.taskId, candidate]));
  assertSameIds(new Set(candidateById.keys()), specIds, 'candidate records and authored evaluators');
  const output = [];
  for (const taskId of [...specIds].sort()) {
    const candidate = candidateById.get(taskId);
    const label = candidate.partition === 'qualification' ? candidate.opaqueId : candidate.taskId;
    const specPath = resolveContained(specRoot, `${taskId}.json`, `${label}: evaluator spec`);
    const specFile = await readJson(specPath, `${label}: evaluator spec`);
    validateSchema(specFile.value, options.schema, options.schemas, '$');
    const expectedSourcePath = `sources/${taskId}.mjs`;
    if (specFile.value.taskId !== taskId || specFile.value.taskId !== candidate.taskId) {
      throw new Error(`${label}: evaluator spec has the wrong task binding`);
    }
    if (specFile.value.oracle.sourcePath !== expectedSourcePath) {
      throw new Error(`${label}: oracle sourcePath must be ${expectedSourcePath}`);
    }
    const sourcePath = resolveContained(
      options.evaluatorRoot,
      expectedSourcePath,
      `${label}: evaluator source`,
    );
    const sourceBytes = await readFile(sourcePath);
    const source = sourceBytes.toString('utf8');
    assertOracleSource(label, source);
    const sourceSha256 = sha256(sourceBytes);
    const { contract, requiredOracleIds } = assertAuthoringSemantics(
      specFile.value,
      candidate,
      sourceSha256,
      label,
    );
    output.push({
      candidate,
      candidateSha256: sha256Canonical(candidate),
      label,
      requiredOracleIds,
      contract,
      sourcePath,
      sourceSha256,
      spec: specFile.value,
      specPath,
      specSha256: sha256(specFile.bytes),
    });
  }
  return output;
}

export function assertAuthoringSemantics(spec, candidate, sourceSha256, label) {
  const contract = assertEvaluatorContract(
    {
      schemaVersion: 'decantr-benchmark-evaluator-contract.v2',
      contractId: spec.contractId,
      taskId: spec.taskId,
      oracle: {
        candidateIndependent: spec.oracle.candidateIndependent,
        decantrOutputAllowed: spec.oracle.decantrOutputAllowed,
        sourceSha256,
      },
      commands: spec.commands,
    },
    { taskId: candidate.taskId, evaluator: { contractId: spec.contractId } },
  );
  const commandIds = new Set();
  for (const command of contract.commands) {
    if (commandIds.has(command.id)) throw new Error(`${label}: duplicate evaluator command ${command.id}`);
    commandIds.add(command.id);
    assertFixedCommand(command.executable, command.args);
    if (
      command.runtime === 'controller' &&
      !['node', 'node.exe'].includes(basename(command.executable).toLowerCase())
    ) {
      throw new Error(`${label}: controller command ${command.id} must declare the Node executable`);
    }
    assertOfflineCommand(command, label);
    for (const token of [command.executable, ...command.args, command.cwd]) {
      assertKnownPlaceholders(token, `${label}: command ${command.id}`);
      if (isForbiddenDecantrOracleToken(token)) {
        throw new Error(`${label}: product output cannot be an evaluator input`);
      }
    }
    for (const [key, value] of Object.entries(command.environment ?? {})) {
      assertKnownPlaceholders(value, `${label}: command ${command.id} environment ${key}`);
      if (isForbiddenEvaluatorEnvironmentKey(key)) {
        throw new Error(`${label}: evaluator environment contains forbidden key ${key}`);
      }
    }
  }

  const oracleToken = `\${EVALUATOR_ROOT}/${spec.oracle.sourcePath}`;
  const requiredOracleIds = new Set(
    contract.commands
      .filter(
        (command) =>
          command.kind === 'functional' &&
          command.runtime === 'controller' &&
          command.required === true &&
          command.resultFormat === 'json-stdout' &&
          ['node', 'node.exe'].includes(basename(command.executable).toLowerCase()) &&
          command.args.includes(oracleToken),
      )
      .map((command) => command.id),
  );
  if (requiredOracleIds.size === 0) {
    throw new Error(`${label}: a required JSON functional command must execute ${oracleToken}`);
  }
  if (
    !contract.commands.some(
      (command) => command.kind === 'build' && command.runtime === 'task' && command.required,
    )
  ) {
    throw new Error(`${label}: at least one host build command must be required`);
  }
  return { contract, requiredOracleIds };
}

function syntaxCheckSource(item, options) {
  const result = runFixed(process.execPath, ['--check', item.sourcePath], {
    cwd: options.evaluatorRoot,
    env: commandEnvironment(join(options.worktreeRoot, '.syntax-home')),
    timeoutMs: 30_000,
  });
  if (result.exitCode !== 0) {
    throw new Error(`${item.label}: evaluator source failed node --check: ${compactError(result)}`);
  }
}

async function qualifyOne(item, corpusById, sessionRoot, index, options) {
  const corpusEntry = corpusById.get(item.candidate.repository.id);
  const checkout = join(options.corpusRoot, checkoutDirectory(corpusEntry.repo));
  await assertFrozenCheckout(checkout, corpusEntry, item.candidate, sessionRoot);
  const base = await executeAtRevision({
    checkout,
    item,
    revision: item.candidate.base,
    revisionName: 'base',
    sessionRoot,
    index,
    options,
  });
  await assertAuthoredFilesStable(item);
  const expected = await executeAtRevision({
    checkout,
    item,
    revision: item.candidate.expected,
    revisionName: 'expected',
    sessionRoot,
    index,
    options,
  });
  await assertAuthoredFilesStable(item);
  assertQualificationPolarity(item, base, expected);
  return { item, base, expected };
}

async function assertAuthoredFilesStable(item) {
  const [specBytes, sourceBytes] = await Promise.all([readFile(item.specPath), readFile(item.sourcePath)]);
  if (sha256(specBytes) !== item.specSha256 || sha256(sourceBytes) !== item.sourceSha256) {
    throw new Error(`${item.label}: evaluator commands modified authored spec or source bytes`);
  }
}

async function assertFrozenCheckout(checkout, corpusEntry, candidate, sessionRoot) {
  const gitEnv = commandEnvironment(join(sessionRoot, '.git-home'));
  const head = git(checkout, ['rev-parse', 'HEAD'], gitEnv, `${candidate.taskId}: corpus HEAD`);
  const tree = git(checkout, ['rev-parse', 'HEAD^{tree}'], gitEnv, `${candidate.taskId}: corpus tree`);
  const origin = git(checkout, ['remote', 'get-url', 'origin'], gitEnv, `${candidate.taskId}: corpus origin`);
  const status = git(
    checkout,
    ['status', '--porcelain=v1', '--untracked-files=no'],
    gitEnv,
    `${candidate.taskId}: corpus status`,
  );
  if (head !== corpusEntry.commit || head !== candidate.repository.corpusPin) {
    throw new Error(`${candidate.taskId}: local corpus checkout is not at the frozen commit`);
  }
  if (candidate.repository.corpusTree && tree !== candidate.repository.corpusTree) {
    throw new Error(`${candidate.taskId}: local corpus checkout has the wrong frozen tree`);
  }
  if (normalizeRepositoryUrl(origin) !== normalizeRepositoryUrl(corpusEntry.repo)) {
    throw new Error(`${candidate.taskId}: local corpus checkout has the wrong origin`);
  }
  if (status !== '') throw new Error(`${candidate.taskId}: local corpus checkout has tracked changes`);
  for (const [name, revision] of [
    ['base', candidate.base],
    ['expected', candidate.expected],
  ]) {
    const commit = git(
      checkout,
      ['rev-parse', `${revision.commit}^{commit}`],
      gitEnv,
      `${candidate.taskId}: ${name} commit`,
    );
    const revisionTree = git(
      checkout,
      ['rev-parse', `${revision.commit}^{tree}`],
      gitEnv,
      `${candidate.taskId}: ${name} tree`,
    );
    if (commit !== revision.commit || revisionTree !== revision.tree) {
      throw new Error(`${candidate.taskId}: frozen ${name} commit/tree binding differs from local git objects`);
    }
  }
}

async function executeAtRevision(context) {
  const workspace = join(
    context.sessionRoot,
    `${String(context.index).padStart(3, '0')}-${context.revisionName}`,
  );
  const home = join(context.sessionRoot, 'homes', `${String(context.index).padStart(3, '0')}-${context.revisionName}`);
  await mkdir(home, { recursive: true, mode: 0o700 });
  const gitEnv = commandEnvironment(join(context.sessionRoot, '.git-home'));
  git(
    context.checkout,
    ['worktree', 'add', '--detach', workspace, context.revision.commit],
    gitEnv,
    `${context.item.label}: create ${context.revisionName} worktree`,
  );
  try {
    const head = git(workspace, ['rev-parse', 'HEAD'], gitEnv, `${context.item.label}: worktree HEAD`);
    const tree = git(workspace, ['rev-parse', 'HEAD^{tree}'], gitEnv, `${context.item.label}: worktree tree`);
    if (head !== context.revision.commit || tree !== context.revision.tree) {
      throw new Error(`${context.item.label}: temporary ${context.revisionName} worktree is not frozen`);
    }
    const commands = [];
    for (const command of context.item.spec.commands) {
      try {
        commands.push(
          executeCommand(command, {
            evaluatorRoot: context.options.evaluatorRoot,
            evaluatorRuntimeRoot: context.options.evaluatorRuntimeRoot,
            evaluatorBrowsersPath: context.options.evaluatorBrowsersPath,
            home,
            projectPath: context.item.candidate.repository.projectPath,
            workspace,
          }),
        );
      } catch {
        commands.push({
          id: command.id,
          kind: command.kind,
          required: command.required,
          status: 'unavailable',
        });
      }
    }
    return {
      commit: context.revision.commit,
      tree: context.revision.tree,
      outcome: commands.every((result) => !result.required || result.status === 'passed')
        ? 'passed'
        : 'failed',
      commands,
    };
  } finally {
    const removal = runFixed('git', ['-C', context.checkout, 'worktree', 'remove', '--force', workspace], {
      env: gitEnv,
      timeoutMs: 120_000,
    });
    if (removal.exitCode !== 0) {
      await rm(workspace, { recursive: true, force: true });
      runFixed('git', ['-C', context.checkout, 'worktree', 'prune'], {
        env: gitEnv,
        timeoutMs: 120_000,
      });
    }
  }
}

function executeCommand(command, options) {
  const declaredExecutable = substitute(command.executable, options);
  const executable = command.runtime === 'controller' ? process.execPath : declaredExecutable;
  const args = command.args.map((argument) => substitute(argument, options));
  const cwd = resolveCommandCwd(command.cwd, options);
  assertFixedCommand(executable, args);
  const explicitEnvironment = Object.fromEntries(
    Object.entries(command.environment ?? {}).map(([key, value]) => [key, substitute(value, options)]),
  );
  if (options.evaluatorRuntimeRoot) {
    explicitEnvironment.PLAYWRIGHT_BROWSERS_PATH =
      options.evaluatorBrowsersPath ?? join(options.evaluatorRuntimeRoot, 'browsers');
  }
  const result = runFixed(executable, args, {
    cwd,
    env: commandEnvironment(options.home, explicitEnvironment),
    timeoutMs: command.timeoutMs,
  });
  let status;
  if (result.errorCode || result.exitCode === null) status = 'unavailable';
  else if (command.resultFormat === 'json-stdout') {
    const parsed = parseEvaluatorJson(result.stdout);
    if (!parsed) status = 'malformed';
    else status = result.exitCode === 0 && parsed.passed ? 'passed' : 'failed';
  } else status = result.exitCode === 0 ? 'passed' : 'failed';
  return {
    id: command.id,
    kind: command.kind,
    required: command.required,
    status,
  };
}

export function assertQualificationPolarity(item, base, expected) {
  const invalidBase = base.commands.filter(
    (command) => command.required && ['malformed', 'unavailable'].includes(command.status),
  );
  if (invalidBase.length > 0) {
    throw new Error(`${item.label}: required base commands were malformed or unavailable`);
  }
  if (base.outcome !== 'failed') {
    throw new Error(`${item.label}: evaluator must fail at the frozen base`);
  }
  const oracleFailed = base.commands.some(
    (command) => item.requiredOracleIds.has(command.id) && command.status === 'failed',
  );
  if (!oracleFailed) {
    throw new Error(`${item.label}: the bound functional oracle must fail at the frozen base`);
  }
  const expectedFailures = expected.commands.filter(
    (command) => command.required && command.status !== 'passed',
  );
  if (expectedFailures.length > 0 || expected.outcome !== 'passed') {
    throw new Error(`${item.label}: every required evaluator command must pass at the expected commit`);
  }
}

function buildDevelopmentAttestation(options) {
  const tasks = options.results
    .map(({ item, base, expected }) => ({
      taskId: item.candidate.taskId,
      candidateSha256: item.candidateSha256,
      evaluatorSpecSha256: item.specSha256,
      oracleSourceSha256: item.sourceSha256,
      qualified: true,
      base,
      expected,
    }))
    .sort((left, right) => left.taskId.localeCompare(right.taskId));
  return {
    schemaVersion: 'decantr-benchmark-development-evaluator-qualification.v1',
    program: PROGRAM,
    partition: 'development',
    confidentiality: 'public development evaluator qualification',
    materializable: false,
    executionAssurance: 'test-only-host',
    candidateSetSha256: options.candidateSetSha256,
    corpusSha256: options.corpusSha256,
    schemaSha256: options.schemaSha256,
    bundleSha256: sha256Canonical(tasks),
    tasks,
  };
}

function buildQualificationAttestation(options) {
  const tasks = options.results
    .map(({ item, base, expected }) => {
      const qualificationSha256 = sha256Canonical({
        candidate: item.candidate,
        evaluatorSpecSha256: item.specSha256,
        oracleSourceSha256: item.sourceSha256,
        base,
        expected,
      });
      return {
        opaqueId: item.candidate.opaqueId,
        candidateSha256: item.candidateSha256,
        evaluatorSpecSha256: item.specSha256,
        oracleSourceSha256: item.sourceSha256,
        qualificationSha256,
        qualified: true,
      };
    })
    .sort((left, right) => left.opaqueId.localeCompare(right.opaqueId));
  return {
    schemaVersion: 'decantr-benchmark-public-evaluator-qualification.v1',
    program: PROGRAM,
    partition: 'qualification',
    confidentiality: 'opaque qualification attestations only',
    materializable: false,
    executionAssurance: 'test-only-host',
    candidateIndexSha256: options.candidateIndexSha256,
    privateCandidateSetSha256: options.candidateSetSha256,
    corpusSha256: options.corpusSha256,
    schemaSha256: options.schemaSha256,
    bundleSha256: sha256Canonical(tasks),
    tasks,
  };
}

function assertOpaqueAttestation(attestation, authored) {
  const allowedTopLevel = [
    'bundleSha256',
    'candidateIndexSha256',
    'confidentiality',
    'corpusSha256',
    'executionAssurance',
    'materializable',
    'partition',
    'privateCandidateSetSha256',
    'program',
    'schemaSha256',
    'schemaVersion',
    'tasks',
  ];
  assertExactKeys(attestation, allowedTopLevel, 'public qualification attestation');
  if (attestation.materializable !== false || attestation.executionAssurance !== 'test-only-host') {
    throw new Error('public qualification attestation must remain a non-materializable host diagnostic');
  }
  for (const task of attestation.tasks) {
    assertExactKeys(
      task,
      [
        'candidateSha256',
        'evaluatorSpecSha256',
        'opaqueId',
        'oracleSourceSha256',
        'qualificationSha256',
        'qualified',
      ],
      `${task.opaqueId}: opaque qualification attestation`,
    );
    if (!OPAQUE_ID.test(task.opaqueId) || task.qualified !== true) {
      throw new Error('public qualification attestation contains an invalid opaque result');
    }
    for (const [key, value] of Object.entries(task)) {
      if (key.endsWith('Sha256') && !SHA256.test(value)) {
        throw new Error(`${task.opaqueId}: ${key} is not a SHA-256 digest`);
      }
    }
  }
  const serialized = JSON.stringify(attestation).toLowerCase();
  for (const { candidate, spec } of authored) {
    const forbidden = [
      candidate.taskId,
      candidate.repository.id,
      candidate.repository.url,
      candidate.repository.framework,
      candidate.repository.projectPath,
      candidate.repository.corpusProjectPath,
      candidate.prompt,
      candidate.base.commit,
      candidate.base.tree,
      candidate.expected.commit,
      candidate.expected.tree,
      spec.contractId,
      spec.oracle.sourcePath,
      ...spec.commands.map((command) => command.id),
    ];
    for (const value of forbidden) {
      if (typeof value === 'string' && value.length >= 8 && serialized.includes(value.toLowerCase())) {
        throw new Error('public qualification attestation exposes sealed task details');
      }
    }
  }
}

export function assertCandidateSet(value, partition) {
  assertObject(value, 'candidate set');
  const expectedVersion =
    partition === 'development'
      ? 'decantr-benchmark-development-task-candidates.v2'
      : 'decantr-benchmark-qualification-task-candidates.v2';
  if (value.schemaVersion !== expectedVersion || value.program !== PROGRAM) {
    throw new Error(`${partition} candidate set has the wrong program or schemaVersion`);
  }
  if (!Array.isArray(value.records) || value.records.length === 0 || value.count !== value.records.length) {
    throw new Error(`${partition} candidate set count is invalid`);
  }
  const taskIds = new Set();
  const opaqueIds = new Set();
  for (const candidate of value.records) {
    assertObject(candidate, `${partition} candidate`);
    if (!TASK_ID.test(candidate.taskId) || candidate.partition !== partition) {
      throw new Error(`${partition} candidate task binding is invalid`);
    }
    if (taskIds.has(candidate.taskId)) throw new Error(`duplicate candidate task: ${candidate.taskId}`);
    taskIds.add(candidate.taskId);
    assertObject(candidate.repository, `${candidate.taskId}: repository`);
    for (const key of ['id', 'url', 'framework', 'projectPath', 'corpusProjectPath', 'corpusPin']) {
      if (typeof candidate.repository[key] !== 'string' || candidate.repository[key].length === 0) {
        throw new Error(`${candidate.taskId}: repository.${key} is invalid`);
      }
    }
    assertRelativeProjectPath(candidate.repository.projectPath, `${candidate.taskId}: projectPath`);
    assertRelativeProjectPath(candidate.repository.corpusProjectPath, `${candidate.taskId}: corpusProjectPath`);
    assertRevision(candidate.base, `${candidate.taskId}: base`);
    assertRevision(candidate.expected, `${candidate.taskId}: expected`);
    if (candidate.base.commit === candidate.expected.commit) {
      throw new Error(`${candidate.taskId}: base and expected commits must differ`);
    }
    if (!GIT_SHA.test(candidate.repository.corpusPin)) {
      throw new Error(`${candidate.taskId}: corpusPin is invalid`);
    }
    if (typeof candidate.prompt !== 'string' || candidate.prompt.trim().length < 20) {
      throw new Error(`${candidate.taskId}: prompt is invalid`);
    }
    if (partition === 'qualification') {
      if (!OPAQUE_ID.test(candidate.opaqueId) || opaqueIds.has(candidate.opaqueId)) {
        throw new Error('qualification candidate opaque binding is invalid or duplicated');
      }
      opaqueIds.add(candidate.opaqueId);
    }
  }
  return [...value.records].sort((left, right) => left.taskId.localeCompare(right.taskId));
}

export function assertCorpus(value) {
  assertObject(value, 'corpus');
  if (value.schemaVersion !== 'decantr-benchmark-corpus.v1' || value.program !== PROGRAM) {
    throw new Error('corpus has the wrong program or schemaVersion');
  }
  if (!Array.isArray(value.repositories) || value.repositories.length === 0) {
    throw new Error('corpus repositories are missing');
  }
  const output = new Map();
  for (const repository of value.repositories) {
    if (!repository || typeof repository.id !== 'string' || typeof repository.repo !== 'string') {
      throw new Error('corpus repository binding is invalid');
    }
    if (output.has(repository.id)) throw new Error(`duplicate corpus repository: ${repository.id}`);
    if (!GIT_SHA.test(repository.commit)) throw new Error(`${repository.id}: corpus commit is invalid`);
    output.set(repository.id, repository);
  }
  return output;
}

function assertPublicCandidateIndex(value, candidates) {
  assertObject(value, 'public qualification candidate index');
  if (
    value.schemaVersion !== 'decantr-benchmark-public-qualification-index.v1' ||
    value.program !== PROGRAM ||
    !Array.isArray(value.tasks) ||
    value.tasks.length !== candidates.length ||
    value.count !== value.tasks.length
  ) {
    throw new Error('public qualification candidate index is invalid or incomplete');
  }
  const output = new Map();
  for (const task of value.tasks) {
    if (!OPAQUE_ID.test(task.opaqueId) || !SHA256.test(task.canonicalSha256) || output.has(task.opaqueId)) {
      throw new Error('public qualification candidate binding is invalid or duplicated');
    }
    output.set(task.opaqueId, task.canonicalSha256);
  }
  if (candidates.some((candidate) => !output.has(candidate.opaqueId))) {
    throw new Error('public qualification candidate index does not cover every private candidate');
  }
  return output;
}

export function assertCandidateCorpusBinding(candidate, corpusById) {
  const corpus = corpusById.get(candidate.repository.id);
  if (!corpus) throw new Error(`${candidate.taskId}: repository is absent from the frozen corpus`);
  if (
    normalizeRepositoryUrl(candidate.repository.url) !== normalizeRepositoryUrl(corpus.repo) ||
    candidate.repository.corpusPin !== corpus.commit ||
    candidate.repository.corpusProjectPath !== corpus.projectPath ||
    candidate.repository.framework !== corpus.framework
  ) {
    throw new Error(`${candidate.taskId}: candidate repository binding differs from the frozen corpus`);
  }
}

function assertOracleSource(label, source) {
  const tokens = tokenizeExecutableJavaScript(source);
  if (usesProductArtifact(tokens)) {
    throw new Error(`${label}: evaluator source names the product under test`);
  }
  if (PROVIDER_ENDPOINT.test(source)) {
    throw new Error(`${label}: evaluator source may not make network or model calls`);
  }
  for (const specifier of collectModuleSpecifiers(tokens)) {
    if (isLocalModuleSpecifier(specifier)) {
      throw new Error(`${label}: evaluator source must be self-contained and cannot import local files`);
    }
    if (isForbiddenSourceModule(specifier) || isProviderModule(specifier)) {
      throw new Error(`${label}: evaluator source may not make network or model calls`);
    }
  }
  if (!source.includes('json-stdout') && !source.includes('JSON.stringify')) {
    throw new Error(`${label}: evaluator source does not appear to emit a JSON result`);
  }
}

function collectModuleSpecifiers(tokens) {
  const specifiers = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.type === 'identifier' && token.value === 'import' && tokens[index - 1]?.value !== '.') {
      const next = tokens[index + 1];
      if (next?.value === '.') continue;
      if (next?.type === 'string') specifiers.push(next.value);
      else if (next?.value === '(' && tokens[index + 2]?.type === 'string') {
        specifiers.push(tokens[index + 2].value);
      } else {
        const specifier = findFromSpecifier(tokens, index + 1);
        if (specifier !== null) specifiers.push(specifier);
      }
      continue;
    }
    if (token.type === 'identifier' && token.value === 'export') {
      const specifier = findFromSpecifier(tokens, index + 1);
      if (specifier !== null) specifiers.push(specifier);
      continue;
    }
    if (
      token.type === 'identifier' &&
      /require$/iu.test(token.value) &&
      tokens[index + 1]?.value === '(' &&
      tokens[index + 2]?.type === 'string'
    ) {
      specifiers.push(tokens[index + 2].value);
      continue;
    }
    if (
      token.type === 'identifier' &&
      token.value === 'process' &&
      tokens[index + 1]?.value === '.' &&
      tokens[index + 2]?.value === 'getBuiltinModule' &&
      tokens[index + 3]?.value === '(' &&
      tokens[index + 4]?.type === 'string'
    ) {
      specifiers.push(tokens[index + 4].value);
    }
  }
  return specifiers;
}

function findFromSpecifier(tokens, start) {
  for (let index = start; index < Math.min(tokens.length, start + 100); index += 1) {
    const token = tokens[index];
    if (token.value === ';') return null;
    if (
      token.type === 'identifier' &&
      token.value === 'from' &&
      tokens[index + 1]?.type === 'string'
    ) {
      return tokens[index + 1].value;
    }
  }
  return null;
}

function usesProductArtifact(tokens) {
  return tokens.some(
    (token) =>
      (token.type === 'identifier' && /^DECANTR_/u.test(token.value)) ||
      (token.type === 'string' &&
        (isForbiddenDecantrOracleToken(token.value) ||
          /^@decantr(?:\/|$)/iu.test(token.value) ||
          /^DECANTR_[A-Z0-9_]*$/u.test(token.value))),
  );
}

function tokenizeExecutableJavaScript(source) {
  const tokens = [];
  scanCode(0, false);
  return tokens;

  function scanCode(start, stopAtTemplateBrace) {
    let index = start;
    let braceDepth = 0;
    while (index < source.length) {
      const character = source[index];
      const next = source[index + 1];
      if (/\s/u.test(character)) {
        index += 1;
      } else if (character === '/' && next === '/') {
        index = skipLineComment(source, index + 2);
      } else if (character === '/' && next === '*') {
        index = skipBlockComment(source, index + 2);
      } else if (character === '\'' || character === '"') {
        const string = readJavaScriptString(source, index, character);
        tokens.push({ type: 'string', value: string.value });
        index = string.next;
      } else if (character === '`') {
        index = scanTemplate(index + 1);
      } else if (character === '/' && canStartRegularExpression(tokens.at(-1))) {
        index = skipRegularExpression(source, index + 1);
        tokens.push({ type: 'expression', value: '<regular-expression>' });
      } else if (/[A-Za-z_$]/u.test(character)) {
        const end = readWhile(source, index + 1, /[A-Za-z0-9_$]/u);
        tokens.push({ type: 'identifier', value: source.slice(index, end) });
        index = end;
      } else if (character === '{') {
        braceDepth += 1;
        tokens.push({ type: 'punctuator', value: character });
        index += 1;
      } else if (character === '}') {
        if (stopAtTemplateBrace && braceDepth === 0) return index + 1;
        braceDepth -= 1;
        tokens.push({ type: 'punctuator', value: character });
        index += 1;
      } else {
        tokens.push({ type: 'punctuator', value: character });
        index += 1;
      }
    }
    return index;
  }

  function scanTemplate(start) {
    const markerIndex = tokens.length;
    tokens.push({ type: 'template', value: '<template>' });
    let index = start;
    let value = '';
    let interpolated = false;
    while (index < source.length) {
      const character = source[index];
      if (character === '`') {
        if (!interpolated) tokens[markerIndex] = { type: 'string', value };
        return index + 1;
      }
      if (character === '\\') {
        const escape = readJavaScriptEscape(source, index + 1);
        value += escape.value;
        index = escape.next;
        continue;
      }
      if (character === '$' && source[index + 1] === '{') {
        interpolated = true;
        index = scanCode(index + 2, true);
        continue;
      }
      value += character;
      index += 1;
    }
    return index;
  }
}

function readJavaScriptString(source, start, quote) {
  let index = start + 1;
  let value = '';
  while (index < source.length) {
    const character = source[index];
    if (character === quote) return { value, next: index + 1 };
    if (character === '\\') {
      const escape = readJavaScriptEscape(source, index + 1);
      value += escape.value;
      index = escape.next;
    } else {
      value += character;
      index += 1;
    }
  }
  return { value, next: index };
}

function readJavaScriptEscape(source, start) {
  const character = source[start];
  const simple = { b: '\b', f: '\f', n: '\n', r: '\r', t: '\t', v: '\v' };
  if (Object.hasOwn(simple, character)) return { value: simple[character], next: start + 1 };
  if (character === '\n') return { value: '', next: start + 1 };
  if (character === '\r') {
    return { value: '', next: source[start + 1] === '\n' ? start + 2 : start + 1 };
  }
  if (character === 'x' && /^[a-f0-9]{2}$/iu.test(source.slice(start + 1, start + 3))) {
    return {
      value: String.fromCodePoint(Number.parseInt(source.slice(start + 1, start + 3), 16)),
      next: start + 3,
    };
  }
  if (character === 'u' && source[start + 1] === '{') {
    const end = source.indexOf('}', start + 2);
    const codePoint = source.slice(start + 2, end);
    if (end >= 0 && /^[a-f0-9]{1,6}$/iu.test(codePoint)) {
      return { value: String.fromCodePoint(Number.parseInt(codePoint, 16)), next: end + 1 };
    }
  }
  if (character === 'u' && /^[a-f0-9]{4}$/iu.test(source.slice(start + 1, start + 5))) {
    return {
      value: String.fromCodePoint(Number.parseInt(source.slice(start + 1, start + 5), 16)),
      next: start + 5,
    };
  }
  return { value: character ?? '', next: start + 1 };
}

function skipLineComment(source, start) {
  const end = source.indexOf('\n', start);
  return end < 0 ? source.length : end + 1;
}

function skipBlockComment(source, start) {
  const end = source.indexOf('*/', start);
  return end < 0 ? source.length : end + 2;
}

function skipRegularExpression(source, start) {
  let index = start;
  let characterClass = false;
  while (index < source.length) {
    const character = source[index];
    if (character === '\\') index += 2;
    else if (character === '[') {
      characterClass = true;
      index += 1;
    } else if (character === ']') {
      characterClass = false;
      index += 1;
    } else if (character === '/' && !characterClass) {
      return readWhile(source, index + 1, /[A-Za-z]/u);
    } else index += 1;
  }
  return index;
}

function canStartRegularExpression(previous) {
  if (!previous || previous.type === 'template') return true;
  if (previous.type === 'identifier') return REGEX_PREFIX_KEYWORDS.has(previous.value);
  return previous.type === 'punctuator' && REGEX_PREFIX_PUNCTUATORS.has(previous.value);
}

function readWhile(source, start, pattern) {
  let index = start;
  while (index < source.length && pattern.test(source[index])) index += 1;
  return index;
}

function isLocalModuleSpecifier(specifier) {
  const normalized = specifier.replaceAll('\\', '/');
  return (
    normalized === '.' ||
    normalized === '..' ||
    normalized.startsWith('./') ||
    normalized.startsWith('../') ||
    normalized.startsWith('/') ||
    normalized.startsWith('file:') ||
    normalized.startsWith('#') ||
    /^[a-z]:\//iu.test(normalized)
  );
}

function isForbiddenSourceModule(specifier) {
  const normalized = specifier.toLowerCase().replace(/^node:/u, '');
  const root = normalized.split('/')[0];
  return FORBIDDEN_SOURCE_MODULES.has(root);
}

function isProviderModule(specifier) {
  const normalized = specifier.toLowerCase();
  return (
    [...PROVIDER_MODULES].some(
      (provider) => normalized === provider || normalized.startsWith(`${provider}/`),
    ) || PROVIDER_MODULE_PREFIXES.some((prefix) => normalized.startsWith(prefix))
  );
}

function assertOfflineCommand(command, label) {
  const executable = basename(command.executable).toLowerCase();
  if (NETWORK_EXECUTABLES.has(executable)) {
    throw new Error(`${label}: network executable is forbidden in evaluator command ${command.id}`);
  }
  for (const token of [command.executable, ...command.args]) {
    if (/https?:\/\//iu.test(token) || /(?:api\.anthropic\.com|api\.openai\.com)/iu.test(token)) {
      throw new Error(`${label}: network target is forbidden in evaluator command ${command.id}`);
    }
  }
}

function assertKnownPlaceholders(value, label) {
  for (const match of value.matchAll(/\$\{([^}]+)\}/gu)) {
    if (!ALLOWED_PLACEHOLDERS.has(match[1])) {
      throw new Error(`${label} uses unknown placeholder \${${match[1]}}`);
    }
  }
}

function commandEnvironment(home, additions = {}) {
  const path = [...new Set([dirname(process.execPath), '/usr/local/bin', '/usr/bin', '/bin'])].join(':');
  return sanitizedEnvironment(home, {
    ...additions,
    ...OFFLINE_ENVIRONMENT,
    PATH: path,
  });
}

function substitute(value, options) {
  const output = value
    .replaceAll('${WORKSPACE}', options.workspace)
    .replaceAll('${PROJECT_PATH}', options.projectPath ?? '.')
    .replaceAll('${EVALUATOR_ROOT}', options.evaluatorRoot)
    .replaceAll('${EVALUATOR_RUNTIME}', options.evaluatorRuntimeRoot ?? '')
    .replaceAll('${HOME}', options.home);
  if (/\$\{[^}]+\}/u.test(output)) throw new Error(`unresolved evaluator command placeholder: ${output}`);
  return output;
}

function resolveCommandCwd(value, options) {
  const substituted = substitute(value, options);
  const cwd = isAbsolute(substituted) ? resolve(substituted) : resolve(options.workspace, substituted);
  if (![options.workspace, options.evaluatorRoot].some((root) => isContained(root, cwd))) {
    throw new Error('evaluator cwd escapes the workspace and evaluator roots');
  }
  return cwd;
}

function parseEvaluatorJson(stdout) {
  try {
    const value = JSON.parse(stdout);
    return value && typeof value === 'object' && !Array.isArray(value) && typeof value.passed === 'boolean'
      ? value
      : null;
  } catch {
    return null;
  }
}

function git(checkout, args, env, label) {
  const result = runFixed('git', ['-c', 'core.hooksPath=/dev/null', '-C', checkout, ...args], {
    env,
    timeoutMs: 120_000,
  });
  if (result.exitCode !== 0) throw new Error(`${label} failed: ${compactError(result)}`);
  return result.stdout.trim();
}

function compactError(result) {
  const detail = result.stderr.trim() || result.errorCode || result.signal || `exit ${result.exitCode}`;
  return detail.replace(/\s+/gu, ' ').slice(0, 500);
}

function collectAuthoredIds(entries, extension, label) {
  const ids = new Set();
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(extension)) continue;
    const id = entry.name.slice(0, -extension.length);
    if (!TASK_ID.test(id) || ids.has(id)) throw new Error(`invalid or duplicate evaluator ${label}: ${entry.name}`);
    ids.add(id);
  }
  return ids;
}

function assertSameIds(left, right, label) {
  const leftOnly = [...left].filter((id) => !right.has(id)).sort();
  const rightOnly = [...right].filter((id) => !left.has(id)).sort();
  if (leftOnly.length > 0 || rightOnly.length > 0) {
    throw new Error(
      `${label} must match exactly (left-only: ${leftOnly.join(', ') || 'none'}; right-only: ${rightOnly.join(', ') || 'none'})`,
    );
  }
}

function normalizeRepositoryUrl(value) {
  return value.trim().replace(/\.git\/?$/iu, '').replace(/\/$/u, '').toLowerCase();
}

function assertRelativeProjectPath(value, label) {
  if (isAbsolute(value)) throw new Error(`${label} must be relative`);
  const normalized = value.replaceAll('\\', '/');
  if (normalized.split('/').includes('..')) throw new Error(`${label} escapes the repository`);
}

function assertRevision(value, label) {
  assertObject(value, label);
  if (!GIT_SHA.test(value.commit) || !GIT_SHA.test(value.tree)) {
    throw new Error(`${label} commit/tree binding is invalid`);
  }
}

function isContained(root, candidate) {
  const relation = relative(resolve(root), resolve(candidate));
  return relation === '' || (!relation.startsWith(`..${sep}`) && relation !== '..' && !isAbsolute(relation));
}

function assertExactKeys(value, expected, label) {
  assertObject(value, label);
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.join('\n') !== wanted.join('\n')) {
    throw new Error(`${label} keys must be exactly ${wanted.join(', ')}`);
  }
}

function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`);
}

function validateSchema(value, schema, schemas, path, rootSchema = schema) {
  if (schema.$ref) {
    const resolved = resolveSchemaReference(schema.$ref, rootSchema, schemas);
    validateSchema(value, resolved.schema, schemas, path, resolved.rootSchema);
    return;
  }
  if (Object.hasOwn(schema, 'const') && !Object.is(value, schema.const)) {
    throw new Error(`${path} must equal the schema constant`);
  }
  if (schema.enum && !schema.enum.some((item) => Object.is(item, value))) {
    throw new Error(`${path} is not an allowed value`);
  }
  if (schema.type && !matchesSchemaType(value, schema.type)) {
    throw new Error(`${path} must have type ${Array.isArray(schema.type) ? schema.type.join(' or ') : schema.type}`);
  }
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      throw new Error(`${path} must contain at least ${schema.minLength} characters`);
    }
    if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) {
      throw new Error(`${path} does not match its schema pattern`);
    }
    if (schema.format === 'date-time' && !Number.isFinite(Date.parse(value))) {
      throw new Error(`${path} must be a date-time`);
    }
  }
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) throw new Error(`${path} is below its minimum`);
    if (schema.maximum !== undefined && value > schema.maximum) throw new Error(`${path} is above its maximum`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      throw new Error(`${path} must contain at least ${schema.minItems} items`);
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      throw new Error(`${path} must contain at most ${schema.maxItems} items`);
    }
    if (schema.items) {
      value.forEach((item, index) => validateSchema(item, schema.items, schemas, `${path}[${index}]`, rootSchema));
    }
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const required of schema.required ?? []) {
      if (!Object.hasOwn(value, required)) throw new Error(`${path}.${required} is required`);
    }
    for (const [key, item] of Object.entries(value)) {
      if (schema.propertyNames) validateSchema(key, schema.propertyNames, schemas, `${path} property name`, rootSchema);
      if (schema.properties?.[key]) {
        validateSchema(item, schema.properties[key], schemas, `${path}.${key}`, rootSchema);
      } else if (schema.additionalProperties === false) {
        throw new Error(`${path}.${key} is not allowed`);
      } else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        validateSchema(item, schema.additionalProperties, schemas, `${path}.${key}`, rootSchema);
      }
    }
  }
}

function resolveSchemaReference(reference, rootSchema, schemas) {
  if (typeof rootSchema.$id !== 'string') {
    throw new Error('JSON schema reference base is missing $id');
  }
  let target;
  try {
    target = new URL(reference, rootSchema.$id);
  } catch {
    throw new Error(`invalid JSON schema reference: ${reference}`);
  }
  let fragment;
  try {
    fragment = decodeURIComponent(target.hash.slice(1));
  } catch {
    throw new Error(`invalid JSON schema reference fragment: ${reference}`);
  }
  target.hash = '';
  const document = [rootSchema, ...new Set(Object.values(schemas ?? {}))].find((candidate) => {
    if (typeof candidate?.$id !== 'string') return false;
    try {
      const identifier = new URL(candidate.$id);
      identifier.hash = '';
      return identifier.href === target.href;
    } catch {
      return false;
    }
  });
  if (!document) throw new Error(`unresolved JSON schema reference: ${reference}`);
  let schema = document;
  if (fragment) {
    if (!fragment.startsWith('/')) throw new Error(`unsupported JSON schema anchor: ${reference}`);
    for (const part of fragment.replace(/^\//u, '').split('/')) {
      const key = part.replaceAll('~1', '/').replaceAll('~0', '~');
      schema = schema?.[key];
    }
  }
  if (schema === undefined) throw new Error(`unresolved JSON schema fragment: ${reference}`);
  return { schema, rootSchema: document };
}

function matchesSchemaType(value, type) {
  const types = Array.isArray(type) ? type : [type];
  return types.some((item) => {
    if (item === 'null') return value === null;
    if (item === 'array') return Array.isArray(value);
    if (item === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
    if (item === 'integer') return Number.isInteger(value);
    return typeof value === item;
  });
}

function taskError(item, error) {
  const wrapped = new Error(`${item.label}: ${error instanceof Error ? error.message : String(error)}`);
  wrapped.publicMessage = `Qualification failed for opaque evaluator ${item.candidate.opaqueId}.`;
  return wrapped;
}

async function readJson(path, label) {
  const bytes = await readFile(path);
  try {
    return { bytes, value: JSON.parse(bytes.toString('utf8')) };
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function normalizeOptions(input) {
  const options = { ...input };
  if (!['development', 'qualification'].includes(options.partition)) {
    throw new UsageError('partition must be development or qualification');
  }
  for (const key of ['candidatesPath', 'evaluatorRoot', 'corpusPath', 'corpusRoot']) {
    if (!options[key]) throw new UsageError(`missing required option: ${key}`);
    options[key] = resolve(options[key]);
  }
  if (options.evaluatorRuntimeRoot) options.evaluatorRuntimeRoot = resolve(options.evaluatorRuntimeRoot);
  if (options.evaluatorBrowsersPath) options.evaluatorBrowsersPath = resolve(options.evaluatorBrowsersPath);
  if (options.partition === 'qualification') {
    if (!options.publicCandidateIndexPath) {
      throw new UsageError('qualification requires publicCandidateIndexPath');
    }
    options.publicCandidateIndexPath = resolve(options.publicCandidateIndexPath);
  }
  options.worktreeRoot = resolve(options.worktreeRoot ?? tmpdir());
  if (options.outputPath) options.outputPath = resolve(options.outputPath);
  return options;
}

export async function runCli(argv, io = defaultIo()) {
  const qualification = argv.some(
    (argument, index) => argument === '--partition' && argv[index + 1] === 'qualification',
  );
  try {
    if (argv.includes('--help') || argv.includes('-h')) {
      io.stdout(usage());
      return 0;
    }
    const options = parseArgs(argv);
    const attestation = await qualifyEvaluators(options);
    const summary = {
      ok: true,
      partition: options.partition,
      tasks: attestation.tasks.length,
      attestationSha256: sha256Canonical(attestation),
      materializable: false,
    };
    if (options.partition === 'development') summary.outputPath = options.outputPath;
    io.stdout(prettyCanonicalJson(summary));
    return 0;
  } catch (error) {
    const message =
      qualification && !(error instanceof UsageError)
        ? error?.publicMessage ?? 'Qualification evaluator inputs are invalid; inspect them only in the private workspace.'
        : error instanceof Error
          ? error.message
          : String(error);
    io.stderr(`${message}\n`);
    return error instanceof UsageError ? 2 : 1;
  }
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith('--')) throw new UsageError(`unexpected positional argument: ${argument}`);
    const key = argument.slice(2);
    const value = argv[++index];
    if (!value || value.startsWith('--')) throw new UsageError(`option --${key} requires a value`);
    if (Object.hasOwn(parsed, key)) throw new UsageError(`option repeated: --${key}`);
    parsed[key] = value;
  }
  const accepted = new Set([
    'candidates',
    'corpus',
    'corpus-root',
    'evaluator-root',
    'evaluator-runtime-root',
    'evaluator-browsers-path',
    'out',
    'partition',
    'public-candidate-index',
    'worktree-root',
  ]);
  for (const key of Object.keys(parsed)) {
    if (!accepted.has(key)) throw new UsageError(`unknown option: --${key}`);
  }
  if (!parsed.partition) throw new UsageError('missing required option: --partition');
  if (!['development', 'qualification'].includes(parsed.partition)) {
    throw new UsageError('--partition must be development or qualification');
  }
  if (!parsed.out) throw new UsageError('missing required option: --out');

  const privateRoot = join(repositoryRoot, '.private', 'benchmark-3-10');
  return {
    partition: parsed.partition,
    candidatesPath: resolve(
      parsed.candidates ??
        (parsed.partition === 'development'
          ? join(benchmarkRoot, 'tasks', 'development-candidates.json')
          : join(privateRoot, 'task-freeze', 'qualification-private.json')),
    ),
    evaluatorRoot: resolve(
      parsed['evaluator-root'] ??
        (parsed.partition === 'development'
          ? join(directory, 'development')
          : join(privateRoot, 'evaluators', 'qualification')),
    ),
    evaluatorRuntimeRoot: resolve(
      parsed['evaluator-runtime-root'] ?? join(benchmarkRoot, 'evaluator-runtime'),
    ),
    evaluatorBrowsersPath: parsed['evaluator-browsers-path']
      ? resolve(parsed['evaluator-browsers-path'])
      : undefined,
    corpusPath: resolve(parsed.corpus ?? join(benchmarkRoot, 'corpus.json')),
    corpusRoot: resolve(parsed['corpus-root'] ?? '/tmp/decantr-3-10-corpus-20260722'),
    publicCandidateIndexPath:
      parsed.partition === 'qualification'
        ? resolve(parsed['public-candidate-index'] ?? join(benchmarkRoot, 'tasks', 'qualification-index.json'))
        : undefined,
    worktreeRoot: resolve(parsed['worktree-root'] ?? tmpdir()),
    outputPath: resolve(parsed.out),
  };
}

function defaultIo() {
  return {
    stdout: (value) => process.stdout.write(value),
    stderr: (value) => process.stderr.write(value),
  };
}

function usage() {
  return `No-provider evaluator qualification

Usage:
  node scripts/benchmark-3-10/evaluators/qualify.mjs \\
    --partition <development|qualification> \\
    --corpus-root <local-frozen-clones> \\
    --out <attestation.json> \\
    [--candidates <candidate-set.json>] \\
    [--evaluator-root <root>] \\
    [--evaluator-runtime-root <browser-runtime>] \\
    [--evaluator-browsers-path <browser-cache>] \\
    [--corpus <corpus.json>] \\
    [--public-candidate-index <opaque-index.json>] \\
    [--worktree-root <temporary-parent>]

This legacy host diagnostic performs no installs or provider/model calls. Its output is
explicitly non-materializable; authoritative qualification runs in a network-none container.
Qualification output and CLI diagnostics are opaque by construction.
`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await runCli(process.argv.slice(2));
}
