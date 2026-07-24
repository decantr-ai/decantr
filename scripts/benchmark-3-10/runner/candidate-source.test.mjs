import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertCandidateSource,
  calculateCandidateSourceDigest,
} from './candidate-source.mjs';

test('candidate source binds one public attested build', () => {
  assert.equal(
    assertCandidateSource(fixture()).source.repository,
    'decantr-ai/decantr',
  );
});

test('candidate source rejects a substituted artifact', () => {
  const value = fixture();
  value.source.artifact = 'benchmark-3-10-candidate-other';
  value.sourceSha256 = calculateCandidateSourceDigest(value);
  assert.throws(() => assertCandidateSource(value), /source is invalid/u);
});

function fixture() {
  const commit = 'a'.repeat(40);
  const runId = 30_000_000_000;
  const value = {
    schemaVersion: 'decantr-benchmark-candidate-source.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    generatedAt: '2026-07-24T00:00:00.000Z',
    source: {
      artifact: `benchmark-3-10-candidate-${commit}-${runId}-1`,
      candidateArchiveFileSha256: '1'.repeat(64),
      candidateManifestFileSha256: 'b'.repeat(64),
      candidateProvenanceBundleFileSha256: 'c'.repeat(64),
      candidateProvenanceVerificationFileSha256: 'd'.repeat(64),
      candidateRuntimeTreeSha256: 'e'.repeat(64),
      candidateTarballSetSha256: 'f'.repeat(64),
      repository: 'decantr-ai/decantr',
      runAttempt: 1,
      runId,
      runnerRepositoryCommit: commit,
      sourceRef: 'refs/heads/main',
      workflow: 'benchmark-3-10-candidate.yml',
    },
  };
  value.sourceSha256 = calculateCandidateSourceDigest(value);
  return value;
}
