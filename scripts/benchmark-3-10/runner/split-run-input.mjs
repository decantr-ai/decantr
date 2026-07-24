#!/usr/bin/env node
import { lstat, readFile, readdir, realpath } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  assertPreparedEnvironment,
  verifyLockfiles,
  verifyPreparedDependencyTree,
} from '../environments/prepared-environment.mjs';
import { assertTaskManifest } from './contracts.mjs';
import {
  canonicalJson,
  prettyCanonicalJson,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from './canonical.mjs';
import { assertSanitizedAgentRequest } from './agent-stage.mjs';
import { calculateSealedDirectoryClosure } from './evaluator-stage.mjs';
import { runFixed, sanitizedEnvironment } from './process.mjs';
import {
  assertRunAuthorization,
  verifyRunAuthorization,
} from './run-authorization.mjs';
import { calculateStageControllerClosure } from './stage-controller.mjs';

export const AGENT_INPUT_SCHEMA_VERSION =
  'decantr-benchmark-split-agent-input.v1';
export const EVALUATOR_INPUT_SCHEMA_VERSION =
  'decantr-benchmark-split-evaluator-input.v1';

const SHA256 = /^[a-f0-9]{64}$/u;
const GIT_SHA = /^[a-f0-9]{40}$/u;
const IMAGE_DIGEST = /^sha256:[a-f0-9]{64}$/u;
const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
);

export async function buildSplitInputManifests(options) {
  const agentRoot = resolve(options.agentInputRoot);
  const evaluatorRoot = resolve(options.evaluatorInputRoot);
  const [
    requestBytes,
    agentAuthorizationBytes,
    evaluatorAuthorizationBytes,
    agentPreparedBytes,
    evaluatorPreparedBytes,
    taskBytes,
    contractBytes,
  ] = await Promise.all([
    readFile(join(agentRoot, 'request.json')),
    readFile(join(agentRoot, 'authorization.json')),
    readFile(join(evaluatorRoot, 'authorization.json')),
    readFile(join(agentRoot, 'prepared-environment.json')),
    readFile(join(evaluatorRoot, 'prepared-environment.json')),
    readFile(join(evaluatorRoot, 'task.json')),
    readFile(join(evaluatorRoot, 'contract.json')),
  ]);
  if (!agentPreparedBytes.equals(evaluatorPreparedBytes)) {
    throw new Error('agent and evaluator inputs use different prepared-environment bytes');
  }
  if (!agentAuthorizationBytes.equals(evaluatorAuthorizationBytes)) {
    throw new Error('agent and evaluator inputs use different authorization bytes');
  }
  const request = assertSanitizedAgentRequest(JSON.parse(requestBytes), {
    agentImageDigest: options.agentImageDigest,
  });
  const task = assertTaskManifest(JSON.parse(taskBytes), options.partition);
  const authorization = assertRunAuthorization(
    JSON.parse(agentAuthorizationBytes),
  );
  const prepared = assertPreparedEnvironment(JSON.parse(agentPreparedBytes), {
    task,
  });
  const [agentController, evaluatorController] = await Promise.all([
    calculateStageControllerClosure('agent', {
      root: options.repositoryRoot ?? repositoryRoot,
    }),
    calculateStageControllerClosure('evaluator', {
      root: options.repositoryRoot ?? repositoryRoot,
    }),
  ]);
  if (
    request.runId !== options.runId ||
    request.taskId !== task.taskId ||
    task.taskId !== options.taskId ||
    request.bindings.taskManifestSha256 !== sha256(taskBytes) ||
    request.bindings.authorizationSha256 !==
      sha256(agentAuthorizationBytes) ||
    authorization.runId !== request.runId ||
    authorization.partition !== task.partition ||
    authorization.modelId !== request.modelId ||
    authorization.paid !==
      (request.isolation.network === 'audited-model-proxy-only') ||
    request.bindings.preparedEnvironmentAttestationSha256 !==
      sha256(agentPreparedBytes) ||
    request.bindings.agentImageDigest !== options.agentImageDigest ||
    request.bindings.agentControllerSha256 !==
      agentController.controllerSha256 ||
    prepared.benchmarkImageDigest !== options.evaluatorImageDigest ||
    options.evaluatorControllerSha256 !==
      evaluatorController.controllerSha256 ||
    sha256(contractBytes) !== task.evaluator.contractSha256
  ) {
    throw new Error('split input source files do not form one bound run');
  }
  const pair = {
    runId: options.runId,
    taskId: task.taskId,
    partition: task.partition,
    sourceCommit: options.sourceCommit,
    baseCommit: task.base.commit,
    baseTree: task.base.tree,
    taskManifestSha256: sha256(taskBytes),
    authorizationFileSha256: sha256(agentAuthorizationBytes),
    requestFileSha256: sha256(requestBytes),
    preparedEnvironmentFileSha256: sha256(agentPreparedBytes),
    agentImageDigest: options.agentImageDigest,
    benchmarkImageDigest: options.evaluatorImageDigest,
  };
  const pairSha256 = calculateSplitPairDigest(pair);
  const agentManifest = {
    schemaVersion: AGENT_INPUT_SCHEMA_VERSION,
    pair,
    pairSha256,
    authorization: bytesBinding(
      'authorization.json',
      agentAuthorizationBytes,
    ),
    request: bytesBinding('request.json', requestBytes),
    preparedEnvironment: bytesBinding(
      'prepared-environment.json',
      agentPreparedBytes,
    ),
    agentImage: {
      reference: options.agentImageReference,
      digest: options.agentImageDigest,
    },
    manifestSha256: null,
  };
  agentManifest.manifestSha256 =
    calculateSplitInputManifestDigest(agentManifest);
  const evaluatorManifest = {
    schemaVersion: EVALUATOR_INPUT_SCHEMA_VERSION,
    pair: structuredClone(pair),
    pairSha256,
    authorization: bytesBinding(
      'authorization.json',
      evaluatorAuthorizationBytes,
    ),
    task: bytesBinding('task.json', taskBytes),
    preparedEnvironment: bytesBinding(
      'prepared-environment.json',
      evaluatorPreparedBytes,
    ),
    contract: bytesBinding('contract.json', contractBytes),
    agentImageDigest: options.agentImageDigest,
    evaluatorImage: {
      reference: options.evaluatorImageReference,
      digest: options.evaluatorImageDigest,
    },
    evaluatorControllerSha256: options.evaluatorControllerSha256,
    manifestSha256: null,
  };
  evaluatorManifest.manifestSha256 =
    calculateSplitInputManifestDigest(evaluatorManifest);
  await Promise.all([
    writeCanonicalFile(join(agentRoot, 'manifest.json'), agentManifest),
    writeCanonicalFile(join(evaluatorRoot, 'manifest.json'), evaluatorManifest),
  ]);
  await Promise.all([
    verifySplitAgentInput({
      inputRoot: agentRoot,
      sourceCommit: options.sourceCommit,
    }),
    verifySplitEvaluatorInput({
      inputRoot: evaluatorRoot,
      sourceCommit: options.sourceCommit,
    }),
  ]);
  return { agentManifest, evaluatorManifest };
}

export async function verifySplitAgentInput(options) {
  const inputRoot = await realpath(resolve(options.inputRoot));
  const manifest = await readCanonicalManifest(
    join(inputRoot, 'manifest.json'),
    AGENT_INPUT_SCHEMA_VERSION,
  );
  assertAgentManifest(manifest);
  await assertTopLevel(
    inputRoot,
    await splitInputTopLevel(
      manifest.authorization,
      inputRoot,
      [
        'manifest.json',
        'authorization.json',
        'prepared-environment.json',
        'request.json',
        'workspace',
      ],
    ),
  );
  assertSourceCommit(manifest.pair.sourceCommit, options.sourceCommit);
  const requestPath = boundPath(
    inputRoot,
    manifest.request,
    'request.json',
  );
  const preparedPath = boundPath(
    inputRoot,
    manifest.preparedEnvironment,
    'prepared-environment.json',
  );
  const authorizationPath = boundPath(
    inputRoot,
    manifest.authorization,
    'authorization.json',
  );
  const [requestBytes, preparedBytes, authorizationBytes] = await Promise.all([
    readBoundFile(requestPath, manifest.request),
    readBoundFile(preparedPath, manifest.preparedEnvironment),
    readBoundFile(authorizationPath, manifest.authorization),
  ]);
  const request = assertSanitizedAgentRequest(JSON.parse(requestBytes), {
    agentImageDigest: manifest.agentImage.digest,
  });
  const prepared = assertPreparedEnvironment(JSON.parse(preparedBytes));
  const authorization = await verifyAuthorizationForRequest({
    authorizationPath,
    authorizationBytes,
    request,
    manifest,
    now: options.now,
  });
  if (
    request.workspace !== '/work' ||
    request.runId !== manifest.pair.runId ||
    request.taskId !== manifest.pair.taskId ||
    request.bindings.taskManifestSha256 !==
      manifest.pair.taskManifestSha256 ||
    sha256(authorizationBytes) !==
      manifest.pair.authorizationFileSha256 ||
    request.bindings.authorizationSha256 !==
      manifest.pair.authorizationFileSha256 ||
    sha256(requestBytes) !== manifest.pair.requestFileSha256 ||
    sha256(preparedBytes) !==
      manifest.pair.preparedEnvironmentFileSha256 ||
    request.bindings.preparedEnvironmentAttestationSha256 !==
      manifest.pair.preparedEnvironmentFileSha256 ||
    request.bindings.agentImageDigest !== manifest.pair.agentImageDigest ||
    prepared.benchmarkImageDigest !== manifest.pair.benchmarkImageDigest ||
    request.bindings.baseCommit !== manifest.pair.baseCommit ||
    request.bindings.baseTree !== manifest.pair.baseTree ||
    prepared.base.commit !== manifest.pair.baseCommit ||
    prepared.base.tree !== manifest.pair.baseTree
  ) {
    throw new Error('split agent input files differ from their pair binding');
  }
  const workspace = join(inputRoot, 'workspace');
  await verifyPreparedWorkspace(workspace, prepared);
  await assertWorkspaceContainsOnlyBaseAndDependencies(workspace, prepared);
  return {
    manifest,
    request,
    prepared,
    authorization: authorization.authorization,
    workspace,
  };
}

export async function verifySplitEvaluatorInput(options) {
  const inputRoot = await realpath(resolve(options.inputRoot));
  const manifest = await readCanonicalManifest(
    join(inputRoot, 'manifest.json'),
    EVALUATOR_INPUT_SCHEMA_VERSION,
  );
  assertEvaluatorManifest(manifest);
  await assertTopLevel(
    inputRoot,
    await splitInputTopLevel(
      manifest.authorization,
      inputRoot,
      [
        'contract.json',
        'evaluator',
        'manifest.json',
        'authorization.json',
        'prepared-environment.json',
        'task.json',
        'workspace',
      ],
    ),
  );
  assertSourceCommit(manifest.pair.sourceCommit, options.sourceCommit);
  const taskPath = boundPath(inputRoot, manifest.task, 'task.json');
  const preparedPath = boundPath(
    inputRoot,
    manifest.preparedEnvironment,
    'prepared-environment.json',
  );
  const contractPath = boundPath(
    inputRoot,
    manifest.contract,
    'contract.json',
  );
  const authorizationPath = boundPath(
    inputRoot,
    manifest.authorization,
    'authorization.json',
  );
  const [taskBytes, preparedBytes, contractBytes, authorizationBytes] =
    await Promise.all([
      readBoundFile(taskPath, manifest.task),
      readBoundFile(preparedPath, manifest.preparedEnvironment),
      readBoundFile(contractPath, manifest.contract),
      readBoundFile(authorizationPath, manifest.authorization),
    ]);
  const task = assertTaskManifest(
    JSON.parse(taskBytes),
    manifest.pair.partition,
  );
  const prepared = assertPreparedEnvironment(JSON.parse(preparedBytes), {
    task,
  });
  const rawAuthorization = assertRunAuthorization(
    JSON.parse(authorizationBytes),
  );
  const authorization = await verifyRunAuthorization({
    authorizationPath,
    expectedSha256: manifest.pair.authorizationFileSha256,
    expected: {
      runId: rawAuthorization.runId,
      partition: rawAuthorization.partition,
      modelId: rawAuthorization.modelId,
      runPlanSha256: rawAuthorization.runPlanSha256,
      candidateManifestSha256:
        rawAuthorization.candidateManifestSha256,
      candidateTarballSetSha256:
        rawAuthorization.candidateTarballSetSha256,
      maxRunCostUsd:
        rawAuthorization.paid
          ? rawAuthorization.reservedRunCostUsd
          : 1,
      protocolMaximumUsd:
        rawAuthorization.protocolMaximumUsd,
      developmentTaskCount:
        rawAuthorization.developmentTaskCount,
    },
    paid: rawAuthorization.paid,
    now: options.now,
  });
  const sourceClosure = await calculateSealedDirectoryClosure(
    join(inputRoot, 'evaluator'),
  );
  if (
    task.taskId !== manifest.pair.taskId ||
    authorization.authorization.runId !== manifest.pair.runId ||
    authorization.authorization.partition !== task.partition ||
    sha256(authorizationBytes) !==
      manifest.pair.authorizationFileSha256 ||
    sha256(taskBytes) !== manifest.pair.taskManifestSha256 ||
    sha256(preparedBytes) !==
      manifest.pair.preparedEnvironmentFileSha256 ||
    sha256(contractBytes) !== task.evaluator.contractSha256 ||
    sourceClosure.closureSha256 !==
      task.evaluator.qualificationEvaluatorSourceClosureSha256 ||
    !sourceClosure.entries.some(
      (entry) => entry.sha256 === task.evaluator.oracleSourceSha256,
    ) ||
    manifest.evaluatorImage.digest !== manifest.pair.benchmarkImageDigest ||
    manifest.agentImageDigest !== manifest.pair.agentImageDigest ||
    task.base.commit !== manifest.pair.baseCommit ||
    task.base.tree !== manifest.pair.baseTree
  ) {
    throw new Error('split evaluator input files differ from their pair binding');
  }
  const workspace = join(inputRoot, 'workspace');
  await verifyPreparedWorkspace(workspace, prepared);
  await assertWorkspaceContainsOnlyBaseAndDependencies(workspace, prepared);
  return {
    manifest,
    task,
    prepared,
    workspace,
    taskPath,
    preparedPath,
    contractPath,
    evaluatorRoot: join(inputRoot, 'evaluator'),
    authorizationPath,
    authorization: authorization.authorization,
  };
}

export function calculateSplitPairDigest(pair) {
  assertPair(pair);
  return sha256Canonical(pair);
}

export function calculateSplitInputManifestDigest(manifest) {
  const { manifestSha256: _manifestSha256, ...body } = manifest;
  return sha256Canonical(body);
}

function assertAgentManifest(manifest) {
  assertExactKeys(
    manifest,
    [
      'agentImage',
      'authorization',
      'manifestSha256',
      'pair',
      'pairSha256',
      'preparedEnvironment',
      'request',
      'schemaVersion',
    ],
    'split agent manifest',
  );
  assertManifestIdentity(manifest, AGENT_INPUT_SCHEMA_VERSION);
  assertImage(manifest.agentImage, 'split agent image');
  assertFileBinding(
    manifest.authorization,
    'split agent authorization',
  );
  assertFileBinding(manifest.request, 'split agent request');
  assertFileBinding(
    manifest.preparedEnvironment,
    'split prepared environment',
  );
  if (manifest.agentImage.digest !== manifest.pair.agentImageDigest) {
    throw new Error('split agent image differs from the pair binding');
  }
}

function assertEvaluatorManifest(manifest) {
  assertExactKeys(
    manifest,
    [
      'agentImageDigest',
      'authorization',
      'contract',
      'evaluatorControllerSha256',
      'evaluatorImage',
      'manifestSha256',
      'pair',
      'pairSha256',
      'preparedEnvironment',
      'schemaVersion',
      'task',
    ],
    'split evaluator manifest',
  );
  assertManifestIdentity(manifest, EVALUATOR_INPUT_SCHEMA_VERSION);
  assertImage(manifest.evaluatorImage, 'split evaluator image');
  assertFileBinding(
    manifest.authorization,
    'split evaluator authorization',
  );
  assertFileBinding(manifest.task, 'split evaluator task');
  assertFileBinding(
    manifest.preparedEnvironment,
    'split evaluator prepared environment',
  );
  assertFileBinding(manifest.contract, 'split evaluator contract');
  if (
    !IMAGE_DIGEST.test(manifest.agentImageDigest ?? '') ||
    !SHA256.test(manifest.evaluatorControllerSha256 ?? '') ||
    manifest.agentImageDigest !== manifest.pair.agentImageDigest ||
    manifest.evaluatorImage.digest !== manifest.pair.benchmarkImageDigest
  ) {
    throw new Error('split evaluator image or controller binding is invalid');
  }
}

function assertManifestIdentity(manifest, schemaVersion) {
  assertPair(manifest.pair);
  if (
    manifest.schemaVersion !== schemaVersion ||
    manifest.pairSha256 !== calculateSplitPairDigest(manifest.pair) ||
    manifest.manifestSha256 !== calculateSplitInputManifestDigest(manifest)
  ) {
    throw new Error('split input manifest identity or self digest is invalid');
  }
}

function assertPair(pair) {
  assertExactKeys(
    pair,
    [
      'agentImageDigest',
      'authorizationFileSha256',
      'baseCommit',
      'baseTree',
      'benchmarkImageDigest',
      'partition',
      'preparedEnvironmentFileSha256',
      'requestFileSha256',
      'runId',
      'sourceCommit',
      'taskId',
      'taskManifestSha256',
    ],
    'split input pair',
  );
  if (
    typeof pair.runId !== 'string' ||
    pair.runId === '' ||
    typeof pair.taskId !== 'string' ||
    pair.taskId === '' ||
    !['development', 'qualification'].includes(pair.partition) ||
    !GIT_SHA.test(pair.sourceCommit ?? '') ||
    !GIT_SHA.test(pair.baseCommit ?? '') ||
    !GIT_SHA.test(pair.baseTree ?? '') ||
    !IMAGE_DIGEST.test(pair.agentImageDigest ?? '') ||
    !IMAGE_DIGEST.test(pair.benchmarkImageDigest ?? '') ||
    !SHA256.test(pair.authorizationFileSha256 ?? '') ||
    !SHA256.test(pair.requestFileSha256 ?? '') ||
    !SHA256.test(pair.preparedEnvironmentFileSha256 ?? '') ||
    !SHA256.test(pair.taskManifestSha256 ?? '')
  ) {
    throw new Error('split input pair binding is invalid');
  }
}

async function verifyAuthorizationForRequest(input) {
  const raw = assertRunAuthorization(JSON.parse(input.authorizationBytes));
  if (
    raw.runId !== input.request.runId ||
    raw.partition !== input.manifest.pair.partition ||
    raw.modelId !== input.request.modelId
  ) {
    throw new Error(
      'split authorization differs from the adapter request',
    );
  }
  return verifyRunAuthorization({
    authorizationPath: input.authorizationPath,
    expectedSha256: input.request.bindings.authorizationSha256,
    expected: {
      runId: input.request.runId,
      partition: input.manifest.pair.partition,
      modelId: input.request.modelId,
      runPlanSha256: input.request.bindings.planSha256,
      candidateManifestSha256:
        input.request.bindings.candidateManifestSha256,
      candidateTarballSetSha256:
        input.request.bindings.candidateTarballSetSha256,
      maxRunCostUsd: input.request.maxRunCostUsd,
      protocolMaximumUsd: raw.protocolMaximumUsd,
      developmentTaskCount: raw.developmentTaskCount,
    },
    paid: raw.paid,
    now: input.now,
  });
}

async function splitInputTopLevel(
  authorizationBinding,
  inputRoot,
  base,
) {
  const path = boundPath(
    inputRoot,
    authorizationBinding,
    'authorization.json',
  );
  const bytes = await readBoundFile(path, authorizationBinding);
  const authorization = assertRunAuthorization(JSON.parse(bytes));
  const companions = [];
  if (authorization.budgetApproval) {
    companions.push(authorization.budgetApproval.path);
  }
  if (authorization.powerPilot) {
    companions.push(authorization.powerPilot.path);
  }
  return [...base, ...companions];
}

async function verifyPreparedWorkspace(workspace, prepared) {
  const environment = sanitizedEnvironment(join(workspace, '.split-input-home'));
  const status = git(
    workspace,
    ['status', '--porcelain=v1', '--untracked-files=all'],
    environment,
  ).stdout;
  const commit = git(workspace, ['rev-parse', 'HEAD'], environment).stdout.trim();
  const tree = git(
    workspace,
    ['rev-parse', 'HEAD^{tree}'],
    environment,
  ).stdout.trim();
  if (
    status !== '' ||
    commit !== prepared.base.commit ||
    tree !== prepared.base.tree
  ) {
    throw new Error('split input workspace is not the clean prepared base');
  }
  verifyLockfiles(workspace, prepared.lockfiles);
  await verifyPreparedDependencyTree(workspace, prepared);
}

async function assertWorkspaceContainsOnlyBaseAndDependencies(
  workspace,
  prepared,
) {
  const root = await realpath(workspace);
  const tracked = new Set(
    git(
      root,
      ['ls-files', '-z', '--cached'],
      sanitizedEnvironment(join(root, '.split-input-home')),
    ).stdout
      .split('\0')
      .filter(Boolean),
  );
  const dependencyRoots = prepared.dependencyRoots.map((path) =>
    path.replaceAll('\\', '/').replace(/\/+$/u, ''),
  );
  const unexpected = [];
  await walkWorkspace(root, root, async (path, metadata) => {
    const logical = relative(root, path).replaceAll('\\', '/');
    if (
      logical === '.git' ||
      logical.startsWith('.git/') ||
      logical === '.split-input-home' ||
      logical.startsWith('.split-input-home/')
    ) {
      return 'skip';
    }
    if (metadata.isDirectory()) return undefined;
    if (
      tracked.has(logical) ||
      dependencyRoots.some(
        (dependencyRoot) =>
          logical === dependencyRoot ||
          logical.startsWith(`${dependencyRoot}/`),
      )
    ) {
      return undefined;
    }
    unexpected.push(logical);
    return undefined;
  });
  if (unexpected.length > 0) {
    throw new Error(
      `agent workspace contains material outside the Git base and dependency roots: ${unexpected
        .slice(0, 10)
        .join(', ')}`,
    );
  }
}

async function walkWorkspace(root, directory, visit) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    const metadata = await lstat(path);
    const action = await visit(path, metadata);
    if (action === 'skip') continue;
    if (metadata.isDirectory() && !metadata.isSymbolicLink()) {
      await walkWorkspace(root, path, visit);
    }
  }
}

async function assertTopLevel(root, expected) {
  const actual = (await readdir(root)).sort();
  if (canonicalJson(actual) !== canonicalJson([...expected].sort())) {
    throw new Error('split input artifact contains unexpected top-level material');
  }
}

async function readCanonicalManifest(path, schemaVersion) {
  const bytes = await readFile(path);
  const manifest = JSON.parse(bytes);
  if (
    manifest.schemaVersion !== schemaVersion ||
    !bytes.equals(Buffer.from(prettyCanonicalJson(manifest), 'utf8'))
  ) {
    throw new Error('split input manifest is not canonical or uses the wrong schema');
  }
  return manifest;
}

function boundPath(root, binding, expected) {
  if (binding.path !== expected) {
    throw new Error(`split input file must be named ${expected}`);
  }
  const path = resolve(root, binding.path);
  if (relative(root, path).startsWith('..') || isAbsolute(relative(root, path))) {
    throw new Error('split input file escapes its artifact root');
  }
  return path;
}

async function readBoundFile(path, binding) {
  const metadata = await lstat(path);
  if (!metadata.isFile() || metadata.isSymbolicLink()) {
    throw new Error(`split input binding is not a regular file: ${basename(path)}`);
  }
  const bytes = await readFile(path);
  if (sha256(bytes) !== binding.sha256 || bytes.byteLength !== binding.bytes) {
    throw new Error(`split input file binding mismatch: ${basename(path)}`);
  }
  return bytes;
}

function assertFileBinding(binding, label) {
  assertExactKeys(binding, ['bytes', 'path', 'sha256'], label);
  if (
    typeof binding.path !== 'string' ||
    binding.path === '' ||
    !SHA256.test(binding.sha256 ?? '') ||
    !Number.isInteger(binding.bytes) ||
    binding.bytes < 1
  ) {
    throw new Error(`${label} binding is invalid`);
  }
}

function bytesBinding(path, bytes) {
  return { path, sha256: sha256(bytes), bytes: bytes.byteLength };
}

function assertImage(image, label) {
  assertExactKeys(image, ['digest', 'reference'], label);
  const immutableDigest =
    typeof image.reference === 'string'
      ? image.reference.match(/@(?<digest>sha256:[a-f0-9]{64})$/u)?.groups
          ?.digest
      : null;
  if (
    typeof image.reference !== 'string' ||
    image.reference === '' ||
    !IMAGE_DIGEST.test(image.digest ?? '') ||
    !IMAGE_DIGEST.test(immutableDigest ?? '')
  ) {
    throw new Error(
      `${label} must bind an immutable manifest reference and Docker config digest`,
    );
  }
}

function assertSourceCommit(actual, expected) {
  if (expected && actual !== expected) {
    throw new Error('split input was prepared from a different controller commit');
  }
}

function git(workspace, args, environment) {
  const result = runFixed('git', ['-C', workspace, ...args], {
    cwd: workspace,
    env: environment,
    timeoutMs: 60_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.exitCode !== 0) {
    throw new Error(`git ${args[0]} failed: ${result.stderr.slice(0, 500)}`);
  }
  return result;
}

function assertExactKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (canonicalJson(actual) !== canonicalJson(expected)) {
    throw new Error(`${label} fields are invalid`);
  }
}

function parseArgs(argv) {
  const options = {};
  let mode = null;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--mode') mode = argv[++index];
    else if (argument === '--input-root') options.inputRoot = resolve(argv[++index]);
    else if (argument === '--source-commit') options.sourceCommit = argv[++index];
    else if (argument === '--agent-input-root') {
      options.agentInputRoot = resolve(argv[++index]);
    } else if (argument === '--evaluator-input-root') {
      options.evaluatorInputRoot = resolve(argv[++index]);
    } else if (argument === '--run-id') options.runId = argv[++index];
    else if (argument === '--task-id') options.taskId = argv[++index];
    else if (argument === '--partition') options.partition = argv[++index];
    else if (argument === '--agent-image-reference') {
      options.agentImageReference = argv[++index];
    } else if (argument === '--agent-image-digest') {
      options.agentImageDigest = argv[++index];
    } else if (argument === '--evaluator-image-reference') {
      options.evaluatorImageReference = argv[++index];
    } else if (argument === '--evaluator-image-digest') {
      options.evaluatorImageDigest = argv[++index];
    } else if (argument === '--evaluator-controller-sha256') {
      options.evaluatorControllerSha256 = argv[++index];
    } else {
      throw new Error(`unknown option: ${argument}`);
    }
  }
  if (!['agent', 'build', 'evaluator'].includes(mode)) {
    throw new Error('--mode must be agent, build, or evaluator');
  }
  if (mode === 'build') {
    for (const key of [
      'agentInputRoot',
      'evaluatorInputRoot',
      'runId',
      'taskId',
      'partition',
      'sourceCommit',
      'agentImageReference',
      'agentImageDigest',
      'evaluatorImageReference',
      'evaluatorImageDigest',
      'evaluatorControllerSha256',
    ]) {
      if (!options[key]) throw new Error(`build option ${key} is required`);
    }
  } else if (!options.inputRoot) {
    throw new Error('--input-root is required');
  }
  return { mode, options };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const parsed = parseArgs(process.argv.slice(2));
    const result =
      parsed.mode === 'agent'
        ? await verifySplitAgentInput(parsed.options)
        : parsed.mode === 'evaluator'
          ? await verifySplitEvaluatorInput(parsed.options)
          : await buildSplitInputManifests(parsed.options);
    process.stdout.write(
      prettyCanonicalJson({
        ok: true,
        mode: parsed.mode,
        runId:
          result.manifest?.pair.runId ??
          result.agentManifest?.pair.runId,
        pairSha256:
          result.manifest?.pairSha256 ??
          result.agentManifest?.pairSha256,
        workspace: result.workspace,
      }),
    );
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
