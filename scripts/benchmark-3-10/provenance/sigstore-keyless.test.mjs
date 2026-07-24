import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  SIGSTORE_KEYLESS_PROVIDER,
  SIGSTORE_OIDC_ISSUER,
  verifySigstoreKeylessBlob,
} from './sigstore-keyless.mjs';

test('verifies a blob against an exact GitHub Actions keyless identity', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-sigstore-test-'));
  context.after(async () => {
    const { rm } = await import('node:fs/promises');
    await rm(root, { recursive: true, force: true });
  });
  const subjectPath = join(root, 'subject.json');
  const bundlePath = join(root, 'bundle.sigstore.json');
  const cosignPath = join(root, 'cosign');
  await Promise.all([
    writeFile(subjectPath, '{"subject":true}\n'),
    writeFile(bundlePath, '{"mediaType":"application/vnd.dev.sigstore.bundle.v0.3+json"}\n'),
    writeFile(cosignPath, ''),
  ]);
  const calls = [];
  const verification = await verifySigstoreKeylessBlob({
    subjectPath,
    bundlePath,
    repository: 'decantr-ai/decantr-qualification-private',
    workflowFile: 'benchmark-3-10-private-environment-probes.yml',
    sourceDigest: 'a'.repeat(40),
    sourceRef: 'refs/heads/main',
    eventName: 'workflow_dispatch',
    cosignPath,
    commandRunner: async (command, args) => {
      calls.push({ command, args });
      return { exitCode: 0, stdout: 'Verified OK', stderr: '' };
    },
  });

  assert.equal(verification.provider, SIGSTORE_KEYLESS_PROVIDER);
  assert.equal(
    verification.policy.certificateIdentity,
    'https://github.com/decantr-ai/decantr-qualification-private/.github/workflows/benchmark-3-10-private-environment-probes.yml@refs/heads/main',
  );
  assert.equal(verification.policy.certificateOidcIssuer, SIGSTORE_OIDC_ISSUER);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].args, [
    'verify-blob',
    '--bundle',
    bundlePath,
    '--certificate-identity',
    verification.policy.certificateIdentity,
    '--certificate-oidc-issuer',
    SIGSTORE_OIDC_ISSUER,
    '--certificate-github-workflow-repository',
    'decantr-ai/decantr-qualification-private',
    '--certificate-github-workflow-ref',
    'refs/heads/main',
    '--certificate-github-workflow-sha',
    'a'.repeat(40),
    '--certificate-github-workflow-trigger',
    'workflow_dispatch',
    '--new-bundle-format=true',
    '--offline',
    '--max-workers',
    '1',
    subjectPath,
  ]);
});

test('fails closed when keyless verification fails', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-sigstore-failure-'));
  context.after(async () => {
    const { rm } = await import('node:fs/promises');
    await rm(root, { recursive: true, force: true });
  });
  const subjectPath = join(root, 'subject.json');
  const bundlePath = join(root, 'bundle.sigstore.json');
  const cosignPath = join(root, 'cosign');
  await Promise.all([
    writeFile(subjectPath, '{}\n'),
    writeFile(bundlePath, '{}\n'),
    writeFile(cosignPath, ''),
  ]);

  await assert.rejects(
    verifySigstoreKeylessBlob({
      subjectPath,
      bundlePath,
      repository: 'decantr-ai/decantr-qualification-private',
      workflowFile: 'benchmark-3-10-private-environment-probes.yml',
      sourceDigest: 'b'.repeat(40),
      sourceRef: 'refs/heads/main',
      cosignPath,
      commandRunner: async () => ({
        exitCode: 1,
        stdout: '',
        stderr: 'certificate identity mismatch',
      }),
    }),
    /certificate identity mismatch/u,
  );
});
