#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  prettyCanonicalJson,
  sha256,
  writeCanonicalFile,
  writeContentAddressed,
} from './canonical.mjs';
import {
  createRunRecordV3,
  assertRunCore,
} from './run-record.mjs';
import {
  assertAgentStageAttestation,
  assertEvaluatorStageAttestation,
  assertStageProvenanceVerification,
  stageProvenancePolicy,
  verifyStageProvenance,
} from './stage-provenance.mjs';

export async function finalizeSplitRun(options, dependencies = {}) {
  const root = resolve(options.outputRoot);
  const [agentBytes, agentBundleBytes, evaluatorBytes, evaluatorBundleBytes, runCoreBytes] =
    await Promise.all([
      readFile(resolve(options.agentAttestationPath)),
      readFile(resolve(options.agentBundlePath)),
      readFile(resolve(options.evaluatorAttestationPath)),
      readFile(resolve(options.evaluatorBundlePath)),
      readFile(resolve(options.runCorePath)),
    ]);
  const agent = assertAgentStageAttestation(JSON.parse(agentBytes));
  const evaluator = assertEvaluatorStageAttestation(JSON.parse(evaluatorBytes));
  const runCore = assertRunCore(JSON.parse(runCoreBytes));
  assertStageChain(agent, evaluator, runCore, {
    agentBytes,
    agentBundleBytes,
    runCoreBytes,
  });

  const verifier = dependencies.provenanceVerifier ?? verifyStageProvenance;
  const agentVerification = await verifyAndAssert(verifier, {
    subjectPath: resolve(options.agentAttestationPath),
    bundlePath: resolve(options.agentBundlePath),
    partition: agent.partition,
    repository: agent.execution.repository,
    sourceDigest: agent.execution.sourceDigest,
    cosignPath: options.cosignPath,
  });
  const evaluatorVerification = await verifyAndAssert(verifier, {
    subjectPath: resolve(options.evaluatorAttestationPath),
    bundlePath: resolve(options.evaluatorBundlePath),
    partition: evaluator.partition,
    repository: evaluator.execution.repository,
    sourceDigest: evaluator.execution.sourceDigest,
    cosignPath: options.cosignPath,
  });
  const expectedAgentVerificationBytes = Buffer.from(
    prettyCanonicalJson(agentVerification),
    'utf8',
  );
  if (
    evaluator.agentStage.verificationFile.sha256 !==
      sha256(expectedAgentVerificationBytes) ||
    evaluator.agentStage.verificationFile.bytes !==
      expectedAgentVerificationBytes.byteLength ||
    evaluator.agentStage.verificationSha256 !==
      agentVerification.verificationSha256
  ) {
    throw new Error('evaluator stage retained a different agent provenance verification');
  }

  const retained = {
    agent: await retainStage(root, agent.runId, 'agent', {
      attestationBytes: agentBytes,
      bundleBytes: agentBundleBytes,
      verification: agentVerification,
    }),
    evaluator: await retainStage(root, agent.runId, 'evaluator', {
      attestationBytes: evaluatorBytes,
      bundleBytes: evaluatorBundleBytes,
      verification: evaluatorVerification,
    }),
  };
  const record = createRunRecordV3(runCore, {
    agentStage: {
      attestationFile: retained.agent.attestationFile,
      attestationSha256: agent.attestationSha256,
      bundleFile: retained.agent.bundleFile,
      verificationFile: retained.agent.verificationFile,
      verificationSha256: agentVerification.verificationSha256,
    },
    evaluatorStage: {
      attestationFile: retained.evaluator.attestationFile,
      attestationSha256: evaluator.attestationSha256,
      bundleFile: retained.evaluator.bundleFile,
      verificationFile: retained.evaluator.verificationFile,
      verificationSha256: evaluatorVerification.verificationSha256,
    },
  });
  const artifact = await writeContentAddressed(root, 'run-records', record);
  await writeCanonicalFile(join(root, 'run-index', `${record.runId}.json`), {
    schemaVersion: 'decantr-benchmark-run-index-entry.v1',
    runId: record.runId,
    recordSha256: artifact.digest,
  });
  return {
    record,
    recordPath: artifact.path,
    recordSha256: artifact.digest,
  };
}

async function verifyAndAssert(verifier, input) {
  const verification = await verifier(input);
  return assertStageProvenanceVerification(
    verification,
    stageProvenancePolicy(
      input.partition,
      input.sourceDigest,
      input.repository,
    ),
  );
}

function assertStageChain(agent, evaluator, runCore, bytes) {
  if (
    agent.runId !== evaluator.runId ||
    agent.runId !== runCore.runId ||
    agent.taskId !== evaluator.taskId ||
    agent.taskId !== runCore.taskId ||
    agent.partition !== evaluator.partition ||
    agent.partition !== runCore.partition ||
    agent.arm !== evaluator.arm ||
    agent.arm !== runCore.arm ||
    agent.repetition !== evaluator.repetition ||
    agent.repetition !== runCore.repetition
  ) {
    throw new Error('agent, evaluator, and run-core identities differ');
  }
  if (
    agent.productionEligible !== true ||
    evaluator.productionEligible !== true ||
    runCore.execution.productionEligible !== true
  ) {
    throw new Error('only production-eligible split-stage evidence can be finalized');
  }
  if (
    evaluator.agentStage.attestationFile.sha256 !== sha256(bytes.agentBytes) ||
    evaluator.agentStage.attestationFile.bytes !== bytes.agentBytes.byteLength ||
    evaluator.agentStage.bundleFile.sha256 !== sha256(bytes.agentBundleBytes) ||
    evaluator.agentStage.bundleFile.bytes !== bytes.agentBundleBytes.byteLength ||
    evaluator.output.runCoreFile.sha256 !== sha256(bytes.runCoreBytes) ||
    evaluator.output.runCoreFile.bytes !== bytes.runCoreBytes.byteLength
  ) {
    throw new Error('evaluator stage is bound to different agent or run-core bytes');
  }
  if (
    runCore.bindings.agentControllerSha256 !== agent.controllerSha256 ||
    runCore.bindings.agentImageDigest !== agent.image.digest ||
    runCore.bindings.authorizationSha256 !==
      agent.bindings.authorizationSha256 ||
    runCore.bindings.evaluatorControllerSha256 !== evaluator.controllerSha256 ||
    runCore.bindings.benchmarkImageDigest !== evaluator.image.digest ||
    runCore.bindings.runPlanSha256 !== agent.bindings.runPlanSha256 ||
    runCore.bindings.taskManifestSha256 !== agent.bindings.taskManifestSha256 ||
    runCore.bindings.candidateManifestSha256 !==
      agent.bindings.candidateManifestSha256 ||
    runCore.bindings.candidateTarballSetSha256 !==
      agent.bindings.candidateTarballSetSha256 ||
    runCore.bindings.deliverySha256 !== agent.bindings.deliverySha256 ||
    runCore.bindings.environmentSha256 !== agent.bindings.environmentSha256 ||
    runCore.bindings.preparedEnvironmentAttestationSha256 !==
      agent.bindings.preparedEnvironmentAttestationSha256 ||
    runCore.workspace.baseCommit !== evaluator.reconstruction.baseCommit ||
    runCore.workspace.baseTree !== evaluator.reconstruction.baseTree
  ) {
    throw new Error('run core differs from the signed stage binding chain');
  }
  if (
    agent.execution.repository !== evaluator.execution.repository ||
    agent.execution.sourceDigest !== evaluator.execution.sourceDigest ||
    agent.execution.runId !== evaluator.execution.runId ||
    agent.execution.runAttempt !== evaluator.execution.runAttempt ||
    agent.execution.runnerEnvironment !== 'github-hosted' ||
    evaluator.execution.runnerEnvironment !== 'github-hosted'
  ) {
    throw new Error('split stages did not run in the same GitHub-hosted workflow execution');
  }
}

async function retainStage(root, runId, stage, input) {
  const stageRoot = join(root, 'stage-provenance', runId, stage);
  const attestationPath = join(stageRoot, 'attestation.json');
  const bundlePath = join(stageRoot, 'sigstore-bundle.json');
  const verificationPath = join(stageRoot, 'verification.json');
  await retainBytes(attestationPath, input.attestationBytes);
  await retainBytes(bundlePath, input.bundleBytes);
  await writeCanonicalFile(verificationPath, input.verification);
  const verificationBytes = await readFile(verificationPath);
  return {
    attestationFile: relativeFileBinding(root, attestationPath, input.attestationBytes),
    bundleFile: relativeFileBinding(root, bundlePath, input.bundleBytes),
    verificationFile: relativeFileBinding(root, verificationPath, verificationBytes),
  };
}

async function retainBytes(path, bytes) {
  await mkdir(dirname(path), { recursive: true });
  try {
    await writeFile(path, bytes, { mode: 0o600, flag: 'wx' });
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error;
    const existing = await readFile(path);
    if (!existing.equals(bytes)) {
      throw new Error(`retained provenance path already contains different bytes: ${path}`);
    }
  }
}

function relativeFileBinding(root, path, bytes) {
  return {
    path: relative(root, path).replaceAll('\\', '/'),
    sha256: sha256(bytes),
    bytes: bytes.byteLength,
  };
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--agent-attestation') options.agentAttestationPath = resolve(argv[++index]);
    else if (argument === '--agent-bundle') options.agentBundlePath = resolve(argv[++index]);
    else if (argument === '--evaluator-attestation') {
      options.evaluatorAttestationPath = resolve(argv[++index]);
    } else if (argument === '--evaluator-bundle') {
      options.evaluatorBundlePath = resolve(argv[++index]);
    } else if (argument === '--run-core') options.runCorePath = resolve(argv[++index]);
    else if (argument === '--cosign') options.cosignPath = resolve(argv[++index]);
    else if (argument === '--output-root') options.outputRoot = resolve(argv[++index]);
    else throw new Error(`unknown option: ${argument}`);
  }
  for (const key of [
    'agentAttestationPath',
    'agentBundlePath',
    'evaluatorAttestationPath',
    'evaluatorBundlePath',
    'runCorePath',
    'cosignPath',
    'outputRoot',
  ]) {
    if (!options[key]) throw new Error(`missing required option: ${key}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await finalizeSplitRun(parseArgs(process.argv.slice(2)));
    process.stdout.write(
      prettyCanonicalJson({
        ok: true,
        runId: result.record.runId,
        recordSha256: result.recordSha256,
        recordPath: result.recordPath,
      }),
    );
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
