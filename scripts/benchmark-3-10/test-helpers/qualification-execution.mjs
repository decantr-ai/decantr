import { readFile } from 'node:fs/promises';
import { calculateContainerControllerClosure, calculateExecutionAttestationDigest } from '../evaluators/container-orchestrator.mjs';
import { qualificationProvenancePolicy } from '../evaluators/qualification-provenance.mjs';
import { prettyCanonicalJson, sha256, sha256Canonical } from '../runner/canonical.mjs';

export const FIXTURE_RUNNER_COMMIT = 'd'.repeat(40);
export const FIXTURE_SOURCE_REF = 'refs/heads/fixture';
export const FIXTURE_PROVENANCE_VERIFICATION_SHA256 = 'e'.repeat(64);

export function makeFixtureQualificationInput(candidate) {
  const manifest = {
    schemaVersion: 'decantr-benchmark-qualification-input-manifest.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    taskId: candidate.taskId,
    partition: candidate.partition,
    createdAt: '2026-07-22T13:45:00.000Z',
    environmentSubstanceSha256: '6'.repeat(64),
    files: [{ path: 'candidate.json', sha256: '7'.repeat(64), bytes: 1 }],
  };
  manifest.manifestSha256 = sha256Canonical(manifest);
  const manifestBytes = Buffer.from(prettyCanonicalJson(manifest));
  const request = {
    schemaVersion: 'decantr-benchmark-container-qualification-request.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    taskId: candidate.taskId,
    partition: candidate.partition,
    bindings: {
      inputManifest: {
        path: 'manifest.json',
        fileSha256: sha256(manifestBytes),
        manifestSha256: manifest.manifestSha256,
      },
    },
  };
  request.requestSha256 = sha256Canonical(request);
  const requestBytes = Buffer.from(prettyCanonicalJson(request));
  return {
    request,
    requestBytes,
    manifest,
    manifestBytes,
    binding: {
      requestFileSha256: sha256(requestBytes),
      requestSha256: request.requestSha256,
      manifestFileSha256: sha256(manifestBytes),
      manifestSha256: manifest.manifestSha256,
    },
  };
}

export async function makeFixtureExecutionAttestation(input) {
  const controller = input.controller ?? await calculateContainerControllerClosure();
  const proxyDigest = `sha256:${'f'.repeat(64)}`;
  const sourceClosure = input.sourceClosure ?? [
    {
      path: input.sourcePath,
      kind: 'file',
      sha256: input.sourceSha256,
      bytes: input.sourceBytes,
      mode: 0o644,
    },
  ];
  const preparationRole = (role) => ({
    workspaceBeforeSha256: role === 'base' ? '1'.repeat(64) : '2'.repeat(64),
    workspacePreparedSha256: role === 'base' ? '3'.repeat(64) : '4'.repeat(64),
    networkPolicy: 'isolated-forward-proxy',
    directTaskEgress: false,
    steps: [
      {
        id: 'install-dependencies',
        commandSha256: '5'.repeat(64),
        network: 'isolated-forward-proxy',
        imageDigest: input.profile.benchmarkImage.digest,
        inspectEvidence: jsonEvidence(`${role}.prepare.inspect.json`, '6'),
        logsEvidence: fileEvidence(`${role}.prepare.log.txt`, '7'),
        dependencyRoot: {
          path: 'node_modules',
          kind: 'directory',
          entryCount: 1,
        },
        startedAt: input.startedAt ?? '2026-07-22T14:00:00Z',
        endedAt: input.preparedAt ?? '2026-07-22T14:05:00Z',
        exitCode: 0,
      },
    ],
  });
  const evaluationRole = (role) => {
    const workspaceSha256 = role === 'base' ? '8'.repeat(64) : '9'.repeat(64);
    return {
      imageDigest: input.profile.benchmarkImage.digest,
      networkMode: 'none',
      hostInspectedWhileRunning: true,
      readOnlyRoot: true,
      workspaceReadOnly: true,
      siblingWorkspaceVisible: false,
      networkCanary: 'blocked',
      workspaceBeforeSha256: workspaceSha256,
      workspaceAfterSha256: workspaceSha256,
      inspectEvidence: jsonEvidence(`${role}.evaluate.inspect.json`, 'a'),
      logsEvidence: fileEvidence(`${role}.evaluate.log.txt`, 'b'),
      canaryEvidence: jsonEvidence(`evidence/${role}/output/network-canary.json`, 'c'),
      result: {
        logicalPath: input.resultLogicalPaths?.[role] ?? `evidence/${role}/output/result.json`,
        fileSha256: input.resultBindings[role].fileSha256,
        canonicalSha256: input.resultBindings[role].canonicalSha256,
        status: input.results[role].status,
      },
    };
  };
  const sourceRef = input.sourceRef ?? FIXTURE_SOURCE_REF;
  const runnerCommit = input.runnerCommit ?? FIXTURE_RUNNER_COMMIT;
  const provenancePolicy = qualificationProvenancePolicy(input.candidate.partition, {
    sourceDigest: runnerCommit,
    sourceRef,
  });
  const executionId = input.executionId ?? `fixture-${input.candidate.taskId}`;
  const qualificationInput = input.qualificationInput ?? makeFixtureQualificationInput(input.candidate);
  const attestation = {
    schemaVersion: 'decantr-benchmark-container-execution-attestation.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    executionId,
    taskId: input.candidate.taskId,
    partition: input.candidate.partition,
    status: 'completed',
    executionIdentity: {
      provider: 'github-actions',
      repository: provenancePolicy.repository,
      workflowRef: `${provenancePolicy.signerWorkflow}@${sourceRef}`,
      runId: input.runId ?? '12345',
      runAttempt: '1',
      actor: 'fixture-reviewer',
      ref: sourceRef,
    },
    runnerRepositoryCommit: runnerCommit,
    startedAt: input.startedAt ?? '2026-07-22T14:00:00Z',
    endedAt: input.qualifiedAt ?? '2026-07-22T14:30:00Z',
    bindings: {
      qualificationInput: qualificationInput.binding ?? qualificationInput,
      candidate: {
        canonicalSha256: input.candidateSha256 ?? sha256Canonical(input.candidate),
        fileSha256: input.candidateFileSha256 ?? 'd'.repeat(64),
      },
      prequalificationBundle: {
        bundleSha256: input.prequalificationBundleSha256,
        fileSha256: input.prequalificationBundleFileSha256,
      },
      evaluator: {
        contractFileSha256: input.contractSha256,
        oracleSourceSha256: input.sourceSha256,
        sourceClosureSha256: sha256Canonical(sourceClosure),
        sourceClosure,
      },
      controller,
      sourceSnapshots: {
        base: {
          revision: structuredClone(input.candidate.base),
          packFileSha256: input.snapshotPackFileSha256?.base ?? '4'.repeat(64),
        },
        expected: {
          revision: structuredClone(input.candidate.expected),
          packFileSha256: input.snapshotPackFileSha256?.expected ?? '5'.repeat(64),
        },
      },
      environment: {
        specFileSha256: input.environmentSpecSha256,
        substanceSha256: input.environmentSubstanceSha256,
      },
      runtimeMatrix: {
        fileSha256: input.runtimeMatrixFileSha256,
        matrixSha256: input.runtimeMatrixSha256,
      },
      runtimeProfile: {
        id: input.profile.id,
        profileSha256: input.profile.profileSha256,
      },
      benchmarkImage: {
        reference: input.profile.benchmarkImage.reference,
        digest: input.profile.benchmarkImage.digest,
        inspectEvidence: jsonEvidence('benchmark-image.inspect.json', 'e'),
      },
    },
    preparation: {
      networkPolicy: 'isolated-forward-proxy',
      directTaskEgress: false,
      proxy: {
        image: { reference: 'docker.io/ubuntu/squid', digest: proxyDigest },
        configSha256: 'f'.repeat(64),
        fixedHosts: ['registry.npmjs.org'],
        lockfileHosts: [],
        allowedHosts: ['registry.npmjs.org'],
        lockfiles: [{ path: 'package-lock.json', sha256: '1'.repeat(64) }],
        inspectEvidence: jsonEvidence('proxy.inspect.json', '2'),
        networkInspectEvidence: jsonEvidence('proxy-network.inspect.json', '3'),
        readinessEvidence: jsonEvidence('proxy.readiness.json', '4'),
      },
      roles: {
        base: preparationRole('base'),
        expected: preparationRole('expected'),
      },
    },
    evaluation: {
      networkMode: 'none',
      hostInspected: true,
      roles: {
        base: evaluationRole('base'),
        expected: evaluationRole('expected'),
      },
    },
  };
  attestation.attestationSha256 = calculateExecutionAttestationDigest(attestation);
  return attestation;
}

export async function fixtureProvenanceVerifier(options) {
  const policy = qualificationProvenancePolicy(options.partition, {
    sourceDigest: options.sourceDigest,
    sourceRef: options.sourceRef,
  });
  return {
    policy,
    attestationFileSha256: sha256(await readFile(options.attestationPath)),
    bundleFileSha256: sha256(await readFile(options.bundlePath)),
    verificationSha256: FIXTURE_PROVENANCE_VERIFICATION_SHA256,
  };
}

function jsonEvidence(logicalPath, fill) {
  return {
    logicalPath,
    fileSha256: fill.repeat(64),
    canonicalSha256: fill.repeat(64),
  };
}

function fileEvidence(logicalPath, fill) {
  return { logicalPath, fileSha256: fill.repeat(64) };
}
