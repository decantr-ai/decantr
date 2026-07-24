import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  GITHUB_ATTESTATIONS_PROVIDER,
  GITHUB_SLSA_PREDICATE_TYPE,
  qualificationProvenanceBundleFilename,
  qualificationProvenancePolicy,
  verifyQualificationProvenance,
} from './qualification-provenance.mjs';
import { SIGSTORE_KEYLESS_PROVIDER } from '../provenance/sigstore-keyless.mjs';

const SOURCE_DIGEST = 'a'.repeat(40);
const SOURCE_REF = 'refs/heads/main';

test('binds public and sealed evaluator qualification to distinct provenance policies', () => {
  const development = qualificationProvenancePolicy('development', {
    sourceDigest: SOURCE_DIGEST,
    sourceRef: SOURCE_REF,
  });
  const qualification = qualificationProvenancePolicy('qualification', {
    sourceDigest: SOURCE_DIGEST,
    sourceRef: SOURCE_REF,
  });

  assert.equal(development.provider, GITHUB_ATTESTATIONS_PROVIDER);
  assert.equal(development.repository, 'decantr-ai/decantr');
  assert.equal(development.predicateType, GITHUB_SLSA_PREDICATE_TYPE);
  assert.equal(development.certificateIdentity, null);
  assert.equal(qualification.provider, SIGSTORE_KEYLESS_PROVIDER);
  assert.equal(qualification.repository, 'decantr-ai/decantr-qualification-private');
  assert.equal(qualification.predicateType, null);
  assert.equal(
    qualification.certificateIdentity,
    'https://github.com/decantr-ai/decantr-qualification-private/.github/workflows/benchmark-3-10-evaluator-qualification.yml@refs/heads/main',
  );
  assert.equal(
    qualificationProvenanceBundleFilename('fixture.task', development.provider),
    'fixture.task.jsonl',
  );
  assert.equal(
    qualificationProvenanceBundleFilename('fixture.task', qualification.provider),
    'fixture.task.sigstore.json',
  );
});

test('verifies private qualification provenance as an exact Sigstore blob signature', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-qualification-provenance-'));
  const attestationPath = join(root, 'execution-attestation.json');
  const bundlePath = join(root, 'execution-attestation.provenance.sigstore.json');
  await writeFile(attestationPath, '{"attestation":true}\n');
  await writeFile(bundlePath, '{"mediaType":"application/vnd.dev.sigstore.bundle.v0.3+json"}\n');
  const calls = [];
  try {
    const verification = await verifyQualificationProvenance({
      partition: 'qualification',
      attestationPath,
      bundlePath,
      sourceDigest: SOURCE_DIGEST,
      sourceRef: SOURCE_REF,
      cosignPath: '/opt/cosign',
      commandRunner: async (command, args) => {
        calls.push({ command, args });
        return { exitCode: 0, stdout: 'Verified OK', stderr: '' };
      },
    });

    assert.equal(verification.policy.provider, SIGSTORE_KEYLESS_PROVIDER);
    assert.equal(verification.policy.predicateType, null);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].command, '/opt/cosign');
    assert.ok(calls[0].args.includes('--certificate-github-workflow-sha'));
    assert.ok(calls[0].args.includes(SOURCE_DIGEST));
    assert.ok(calls[0].args.every((argument) => !String(argument).includes('slsa.dev')));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
