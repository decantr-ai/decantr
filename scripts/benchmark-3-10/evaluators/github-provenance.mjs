import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { sha256, sha256Canonical } from '../runner/canonical.mjs';
import { runFixed, sanitizedEnvironment } from '../runner/process.mjs';

export const QUALIFICATION_REPOSITORY = 'decantr-ai/decantr';
export const QUALIFICATION_SIGNER_WORKFLOW =
  'decantr-ai/decantr/.github/workflows/benchmark-3-10-evaluator-qualification.yml';
export const QUALIFICATION_PREDICATE_TYPE = 'https://slsa.dev/provenance/v1';

export async function verifyQualificationProvenance(input) {
  const attestationPath = resolveRequiredPath(input.attestationPath, 'attestationPath');
  const bundlePath = resolveRequiredPath(input.bundlePath, 'bundlePath');
  const repository = input.repository ?? QUALIFICATION_REPOSITORY;
  const signerWorkflow = input.signerWorkflow ?? QUALIFICATION_SIGNER_WORKFLOW;
  const sourceDigest = requiredString(input.sourceDigest, 'sourceDigest');
  const sourceRef = requiredString(input.sourceRef, 'sourceRef');
  const predicateType = input.predicateType ?? QUALIFICATION_PREDICATE_TYPE;
  const execute = input.commandRunner ?? defaultCommandRunner;
  const result = await execute('gh', [
    'attestation',
    'verify',
    attestationPath,
    '--repo',
    repository,
    '--bundle',
    bundlePath,
    '--signer-workflow',
    signerWorkflow,
    '--source-digest',
    sourceDigest,
    '--source-ref',
    sourceRef,
    '--predicate-type',
    predicateType,
    '--deny-self-hosted-runners',
    '--format',
    'json',
  ]);
  if (result.exitCode !== 0) {
    throw new Error(`GitHub qualification provenance verification failed: ${(result.stderr || result.stdout).trim()}`);
  }
  let verification;
  try {
    verification = JSON.parse(result.stdout);
  } catch {
    throw new Error('GitHub qualification provenance verification did not return JSON');
  }
  if (!Array.isArray(verification) || verification.length === 0) {
    throw new Error('GitHub qualification provenance verification returned no verified attestations');
  }
  for (const item of verification) {
    if (
      !item?.attestation ||
      item?.verificationResult?.statement?.predicateType !== predicateType ||
      !Array.isArray(item?.verificationResult?.statement?.subject) ||
      item.verificationResult.statement.subject.length === 0
    ) {
      throw new Error('GitHub qualification provenance verification output is incomplete');
    }
  }
  return {
    policy: {
      repository,
      signerWorkflow,
      sourceDigest,
      sourceRef,
      predicateType,
      denySelfHostedRunners: true,
    },
    attestationFileSha256: sha256(await readFile(attestationPath)),
    bundleFileSha256: sha256(await readFile(bundlePath)),
    verificationSha256: sha256Canonical(verification),
  };
}

function defaultCommandRunner(command, args) {
  return runFixed(command, args, {
    env: sanitizedEnvironment(resolve(process.cwd(), '.benchmark-provenance-home')),
    timeoutMs: 120_000,
    maxBuffer: 64 * 1024 * 1024,
  });
}

function resolveRequiredPath(value, label) {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${label} is required`);
  return resolve(value);
}

function requiredString(value, label) {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${label} is required`);
  return value;
}
