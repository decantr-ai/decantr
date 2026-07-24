#!/usr/bin/env node
import { mkdir, readFile } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertAdapterRequest,
  assertAdapterResponse,
  assertProxyReceipt,
} from '../model-proxy/contracts.mjs';
import {
  assertPreparedEnvironment,
  verifyPreparedDependencyTree,
} from '../environments/prepared-environment.mjs';
import {
  prettyCanonicalJson,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from './canonical.mjs';
import { runFixed, sanitizedEnvironment } from './process.mjs';
import { captureWorkspaceDelta } from './workspace-delta.mjs';
import { calculateStageControllerClosure } from './stage-controller.mjs';
import {
  createAgentStageAttestation,
  fileBinding,
  writeStageAttestation,
} from './stage-provenance.mjs';

const SHA256 = /^[a-f0-9]{64}$/u;
const GIT_SHA = /^[a-f0-9]{40}$/u;
const IMAGE_DIGEST = /^sha256:[a-f0-9]{64}$/u;
const REQUEST_KEYS = [
  'arm',
  'bindings',
  'context',
  'informationEntitlement',
  'isolation',
  'limits',
  'maxRunCostUsd',
  'modelId',
  'projectPath',
  'prompt',
  'provider',
  'reasoningEffort',
  'repetition',
  'requestedModel',
  'runId',
  'schemaVersion',
  'scope',
  'taskId',
  'workspace',
];
const BINDING_KEYS = [
  'agentControllerSha256',
  'agentImageDigest',
  'authorizationSha256',
  'baseCommit',
  'baseTree',
  'candidateManifestSha256',
  'candidateTarballSetSha256',
  'deliverySha256',
  'environmentSha256',
  'environmentSpecSha256',
  'environmentSubstanceSha256',
  'informationEntitlementSha256',
  'planSha256',
  'preparedEnvironmentAttestationSha256',
  'runtimeMatrixSha256',
  'taskManifestSha256',
];

export async function executeAgentStage(options, dependencies = {}) {
  const requestBytes = await readFile(resolve(options.requestPath));
  const request = assertSanitizedAgentRequest(JSON.parse(requestBytes), {
    workspace: options.workspace,
    agentImageDigest: options.agentImageDigest,
  });
  if (options.controllerRoot) {
    const controller = await calculateStageControllerClosure('agent', {
      root: options.controllerRoot,
      layout: 'agent-image',
    });
    if (controller.controllerSha256 !== request.bindings.agentControllerSha256) {
      throw new Error('agent controller closure differs from the sanitized request');
    }
  } else if (options.paid === true) {
    throw new Error('paid agent stage requires a calculated controller closure');
  }
  if (!requestBytes.equals(Buffer.from(prettyCanonicalJson(request), 'utf8'))) {
    throw new Error('adapter request file is not canonical');
  }
  const preparedBytes = await readFile(resolve(options.preparedEnvironmentPath));
  const prepared = assertPreparedEnvironment(JSON.parse(preparedBytes));
  assertPreparedBinding(prepared, request, preparedBytes);
  const verifyDependencies =
    dependencies.verifyPreparedDependencyTree ?? verifyPreparedDependencyTree;
  await verifyDependencies(options.workspace, prepared);
  assertCleanBase(options.workspace, request);

  const outputRoot = resolve(options.outputRoot);
  const scratch = join(outputRoot, 'scratch');
  const home = join(scratch, 'home');
  await mkdir(home, { recursive: true, mode: 0o700 });
  const responsePath = join(outputRoot, 'adapter-response.json');
  const additions = explicitAdapterEnvironment(options.adapterEnvironment ?? process.env);
  if (options.taskPath) additions.PATH = options.taskPath;
  const adapterRun = runFixed(
    options.adapterCommand,
    [...(options.adapterArgs ?? []), '--request', resolve(options.requestPath), '--response', responsePath],
    {
      cwd: options.workspace,
      env: sanitizedEnvironment(home, additions),
      timeoutMs: request.limits.timeoutMs,
      maxBuffer: 64 * 1024 * 1024,
    },
  );
  let response;
  try {
    response = assertAdapterResponse(JSON.parse(await readFile(responsePath, 'utf8')));
  } catch (error) {
    response = failedAdapterResponse(request, adapterRun, error);
    await writeCanonicalFile(responsePath, response);
  }
  if (response.provider !== request.provider || response.requestedModel !== request.requestedModel) {
    throw new Error('adapter response provider or requested model mismatch');
  }
  let providerReceiptFile = null;
  if (options.providerReceiptPath) {
    const receiptPath = resolve(options.providerReceiptPath);
    const receiptBytes = await readFile(receiptPath);
    const receipt = assertProxyReceipt(JSON.parse(receiptBytes), request);
    if (response.providerReceiptSha256 !== receipt.receiptSha256) {
      throw new Error('adapter response is bound to a different provider receipt');
    }
    providerReceiptFile = fileBinding(receiptPath, receiptBytes);
  } else if (options.paid) {
    throw new Error('paid agent stage requires an audited provider receipt');
  }
  await verifyDependencies(options.workspace, prepared);
  const delta = await captureWorkspaceDelta({
    workspace: options.workspace,
    outputRoot: join(outputRoot, 'workspace-delta'),
    expectedBaseCommit: request.bindings.baseCommit,
    expectedBaseTree: request.bindings.baseTree,
  });
  const responseBytes = await readFile(responsePath);
  const deltaBytes = await readFile(delta.manifestPath);
  const status =
    adapterRun.exitCode === 0 && response.status === 'completed'
      ? 'completed'
      : response.status === 'unsupported'
        ? 'unsupported'
        : 'failed';
  const execution = options.execution ?? executionIdentityFromEnvironment(
    request.partition ?? options.partition,
    process.env,
  );
  const productionEligible =
    options.paid === true &&
    execution.runnerEnvironment === 'github-hosted' &&
    providerReceiptFile !== null;
  const attestation = createAgentStageAttestation({
    runId: request.runId,
    taskId: request.taskId,
    partition: options.partition,
    arm: request.arm,
    repetition: request.repetition,
    model: {
      modelId: request.modelId,
      provider: request.provider,
      requestedModel: request.requestedModel,
    },
    status,
    productionEligible,
    createdAt: options.createdAt ?? new Date().toISOString(),
    execution,
    image: {
      reference: options.agentImageReference,
      digest: options.agentImageDigest,
      runtimeProfileId: prepared.runtimeProfileId,
    },
    controllerSha256: request.bindings.agentControllerSha256,
    bindings: {
      requestFileSha256: sha256(requestBytes),
      requestSha256: sha256Canonical(request),
      runPlanSha256: request.bindings.planSha256,
      taskManifestSha256: request.bindings.taskManifestSha256,
      candidateManifestSha256: request.bindings.candidateManifestSha256,
      candidateTarballSetSha256: request.bindings.candidateTarballSetSha256,
      runtimeMatrixSha256: request.bindings.runtimeMatrixSha256,
      preparedEnvironmentAttestationSha256: sha256(preparedBytes),
      environmentSha256: request.bindings.environmentSha256,
      environmentSpecSha256: request.bindings.environmentSpecSha256,
      environmentSubstanceSha256: request.bindings.environmentSubstanceSha256,
      informationEntitlementSha256: request.bindings.informationEntitlementSha256,
      deliverySha256: request.bindings.deliverySha256,
      baseCommit: request.bindings.baseCommit,
      baseTree: request.bindings.baseTree,
      agentImageDigest: request.bindings.agentImageDigest,
      authorizationSha256:
        request.bindings.authorizationSha256,
    },
    isolation: {
      inputMaterial: ['adapter-request', 'prepared-workspace'],
      excludedMaterial: [
        'evaluator-contract',
        'evaluator-source',
        'expected-patch',
        'hidden-review',
        'private-oracle',
        'qualification-controller',
      ],
      providerCredentialPresent: false,
      personalSkills: false,
      personalMcp: false,
      hostConfiguration: false,
      modelNetwork: options.paid ? 'audited-run-local-proxy-only' : 'none',
    },
    output: {
      adapterResponseFile: fileBinding(responsePath, responseBytes),
      providerReceiptFile,
      workspaceDeltaFile: fileBinding(delta.manifestPath, deltaBytes),
      workspaceDeltaSha256: delta.manifest.deltaSha256,
    },
  });
  const attestationPath = join(outputRoot, 'agent-stage-attestation.json');
  await writeStageAttestation(attestationPath, attestation);
  return {
    attestation,
    attestationPath,
    response,
    responsePath,
    delta: delta.manifest,
    deltaPath: delta.manifestPath,
  };
}

export function assertSanitizedAgentRequest(request, expected = {}) {
  assertAdapterRequest(request);
  assertExactKeys(request, REQUEST_KEYS, 'sanitized adapter request');
  assertExactKeys(request.bindings, BINDING_KEYS, 'sanitized adapter request bindings');
  assertExactKeys(
    request.isolation,
    ['home', 'hostConfiguration', 'network', 'personalMcp', 'personalSkills'],
    'sanitized adapter request isolation',
  );
  if (
    request.isolation.personalSkills !== false ||
    request.isolation.personalMcp !== false ||
    request.isolation.hostConfiguration !== false ||
    !['none', 'audited-model-proxy-only'].includes(request.isolation.network)
  ) {
    throw new Error('sanitized adapter request isolation is invalid');
  }
  for (const [key, value] of Object.entries(request.bindings)) {
    if (key === 'baseCommit' || key === 'baseTree') {
      if (!GIT_SHA.test(value ?? '')) throw new Error(`adapter request ${key} is invalid`);
    } else if (key === 'agentImageDigest') {
      if (!IMAGE_DIGEST.test(value ?? '')) throw new Error('adapter request agent image digest is invalid');
    } else if (!SHA256.test(value ?? '')) {
      throw new Error(`adapter request ${key} is invalid`);
    }
  }
  if (!Number.isFinite(request.maxRunCostUsd) || request.maxRunCostUsd <= 0) {
    throw new Error('adapter request maxRunCostUsd is invalid');
  }
  if (expected.workspace && resolve(request.workspace) !== resolve(expected.workspace)) {
    throw new Error('adapter request workspace differs from the mounted workspace');
  }
  if (
    expected.agentImageDigest &&
    request.bindings.agentImageDigest !== expected.agentImageDigest
  ) {
    throw new Error('adapter request agent image differs from the executing image');
  }
  const forbiddenTopLevel = Object.keys(request).filter((key) =>
    /(?:evaluator|expectedPatch|hiddenReview|oracle|qualificationReceipt)/iu.test(key),
  );
  if (forbiddenTopLevel.length > 0) {
    throw new Error(`adapter request contains forbidden material: ${forbiddenTopLevel.join(', ')}`);
  }
  return request;
}

function assertPreparedBinding(prepared, request, bytes) {
  if (
    sha256(bytes) !== request.bindings.preparedEnvironmentAttestationSha256 ||
    prepared.environmentSha256 !== request.bindings.environmentSha256 ||
    prepared.environmentSpecSha256 !== request.bindings.environmentSpecSha256 ||
    prepared.environmentSubstanceSha256 !== request.bindings.environmentSubstanceSha256 ||
    prepared.runtimeMatrixSha256 !== request.bindings.runtimeMatrixSha256 ||
    prepared.base.commit !== request.bindings.baseCommit ||
    prepared.base.tree !== request.bindings.baseTree ||
    prepared.benchmarkImageDigest === request.bindings.agentImageDigest
  ) {
    throw new Error('prepared environment differs from the sanitized agent request');
  }
}

function assertCleanBase(workspace, request) {
  const status = git(workspace, ['status', '--porcelain=v1', '--untracked-files=all']).stdout;
  const commit = git(workspace, ['rev-parse', 'HEAD']).stdout.trim();
  const tree = git(workspace, ['rev-parse', 'HEAD^{tree}']).stdout.trim();
  if (
    status !== '' ||
    commit !== request.bindings.baseCommit ||
    tree !== request.bindings.baseTree
  ) {
    throw new Error('agent workspace is not the clean bound base');
  }
}

function failedAdapterResponse(request, adapterRun, error) {
  return assertAdapterResponse({
    schemaVersion: 'decantr-benchmark-adapter-response.v1',
    provider: request.provider,
    requestedModel: request.requestedModel,
    returnedModel: request.requestedModel,
    status: 'failed',
    usage: {
      inputTokens: 0,
      outputTokens: 0,
      cachedInputTokens: 0,
      requests: 0,
      costUsd: 0,
    },
    finalMessage: '',
    trajectory: [
      {
        type: 'agent.process.failed',
        payload: {
          exitCode: adapterRun.exitCode,
          signal: adapterRun.signal,
          error: error instanceof Error ? error.message : String(error),
        },
      },
    ],
  });
}

function explicitAdapterEnvironment(environment) {
  const output = {};
  for (const key of [
    'DECANTR_CLAUDE_BIN',
    'DECANTR_CODEX_BIN',
    'DECANTR_MODEL_PROXY_RECEIPT',
    'DECANTR_MODEL_PROXY_URL',
  ]) {
    if (typeof environment[key] === 'string') output[key] = environment[key];
  }
  if (environment.ANTHROPIC_API_KEY || environment.OPENAI_API_KEY) {
    throw new Error('provider credentials must not enter the agent stage');
  }
  return output;
}

function executionIdentityFromEnvironment(partition, environment) {
  const repository =
    partition === 'qualification'
      ? 'decantr-ai/decantr-qualification-private'
      : 'decantr-ai/decantr';
  return {
    repository,
    workflowFile: 'benchmark-3-10-split-run.yml',
    sourceDigest: requiredEnvironment(environment, 'GITHUB_SHA'),
    sourceRef: requiredEnvironment(environment, 'GITHUB_REF'),
    eventName: requiredEnvironment(environment, 'GITHUB_EVENT_NAME'),
    runId: requiredEnvironment(environment, 'GITHUB_RUN_ID'),
    runAttempt: requiredEnvironment(environment, 'GITHUB_RUN_ATTEMPT'),
    job: 'agent',
    runnerEnvironment: requiredEnvironment(environment, 'RUNNER_ENVIRONMENT'),
    runnerOs: requiredEnvironment(environment, 'RUNNER_OS'),
    runnerArch: requiredEnvironment(environment, 'RUNNER_ARCH'),
  };
}

function requiredEnvironment(environment, key) {
  const value = environment[key];
  if (typeof value !== 'string' || value === '') throw new Error(`${key} is required`);
  return value;
}

function git(workspace, args) {
  const result = runFixed('git', ['-C', workspace, ...args], {
    cwd: workspace,
    timeoutMs: 60_000,
    env: process.env,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.exitCode !== 0) throw new Error(`git ${args[0]} failed: ${result.stderr.slice(0, 500)}`);
  return result;
}

function assertExactKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  const wanted = [...keys].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    throw new Error(`${label} fields are invalid`);
  }
}

function parseArgs(argv) {
  const options = { adapterArgs: [], paid: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--request') options.requestPath = resolve(argv[++index]);
    else if (argument === '--workspace') options.workspace = resolve(argv[++index]);
    else if (argument === '--prepared-environment') {
      options.preparedEnvironmentPath = resolve(argv[++index]);
    } else if (argument === '--output-root') options.outputRoot = resolve(argv[++index]);
    else if (argument === '--adapter-command') options.adapterCommand = argv[++index];
    else if (argument === '--adapter-arg') options.adapterArgs.push(argv[++index]);
    else if (argument === '--provider-receipt') options.providerReceiptPath = resolve(argv[++index]);
    else if (argument === '--agent-image-reference') options.agentImageReference = argv[++index];
    else if (argument === '--agent-image-digest') options.agentImageDigest = argv[++index];
    else if (argument === '--task-path') options.taskPath = argv[++index];
    else if (argument === '--controller-root') options.controllerRoot = resolve(argv[++index]);
    else if (argument === '--partition') options.partition = argv[++index];
    else if (argument === '--paid') options.paid = true;
    else throw new Error(`unknown option: ${argument}`);
  }
  for (const key of [
    'requestPath',
    'workspace',
    'preparedEnvironmentPath',
    'outputRoot',
    'adapterCommand',
    'agentImageReference',
    'agentImageDigest',
    'partition',
  ]) {
    if (!options[key]) throw new Error(`missing required option: ${key}`);
  }
  if (!isAbsolute(options.adapterCommand)) {
    throw new Error('--adapter-command must be an absolute executable path');
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await executeAgentStage(parseArgs(process.argv.slice(2)));
    process.stdout.write(
      prettyCanonicalJson({
        ok: result.attestation.status === 'completed',
        runId: result.attestation.runId,
        status: result.attestation.status,
        attestationSha256: result.attestation.attestationSha256,
        attestationPath: result.attestationPath,
      }),
    );
    if (result.attestation.status !== 'completed') process.exitCode = 1;
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
