import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertRunMaterializationPacketManifest,
  calculateRunMaterializationPacketDigest,
} from './run-materialization-packet.mjs';

test('run materialization manifest binds the complete packet identity', () => {
  const manifest = fixtureManifest();
  assert.equal(
    assertRunMaterializationPacketManifest(manifest).runId,
    'run-fixture',
  );
});

test('run materialization manifest rejects binding substitution', () => {
  const manifest = fixtureManifest();
  manifest.bindings.taskManifestFileSha256 = 'f'.repeat(64);
  assert.throws(
    () => assertRunMaterializationPacketManifest(manifest),
    /manifest is invalid/u,
  );
});

function fixtureManifest() {
  const bindingKeys = [
    'authorizationFileSha256',
    'candidateManifestFileSha256',
    'candidateProvenanceBundleFileSha256',
    'candidateRuntimeTreeSha256',
    'candidateSourceSha256',
    'candidateTarballSetSha256',
    'contractFileSha256',
    'evaluatorClosureSha256',
    'preparedEnvironmentFileSha256',
    'preparedSourceIndexSha256',
    'preparedSourceFileSha256',
    'preparedVerificationFileSha256',
    'preparedVerificationSha256',
    'runPlanFileSha256',
    'runPlanSha256',
    'runtimeMatrixFileSha256',
    'runtimeMatrixSha256',
    'splitPairSha256',
    'taskManifestFileSha256',
    'workspacePreparedSha256',
  ];
  const manifest = {
    schemaVersion:
      'decantr-benchmark-run-materialization-packet.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    runId: 'run-fixture',
    taskId: 'fixture.task',
    partition: 'development',
    materializedAt: '2026-07-24T00:00:00.000Z',
    sourceCommit: 'a'.repeat(40),
    bindings: Object.fromEntries(
      bindingKeys.map((key, index) => [
        key,
        (index % 10).toString().repeat(64),
      ]),
    ),
  };
  manifest.packetSha256 =
    calculateRunMaterializationPacketDigest(manifest);
  return manifest;
}
