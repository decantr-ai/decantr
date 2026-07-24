import { readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { sha256, sha256Canonical } from '../runner/canonical.mjs';
import { runFixed, sanitizedEnvironment } from '../runner/process.mjs';
import {
  SIGSTORE_KEYLESS_PROVIDER,
  SIGSTORE_OIDC_ISSUER,
  verifySigstoreKeylessBlob,
} from '../provenance/sigstore-keyless.mjs';

export const GITHUB_ATTESTATIONS_PROVIDER = 'github-attestations';
export const GITHUB_SLSA_PREDICATE_TYPE = 'https://slsa.dev/provenance/v1';

const EVENT_NAME = 'workflow_dispatch';
const PUBLIC_REPOSITORY = 'decantr-ai/decantr';
const PRIVATE_REPOSITORY = 'decantr-ai/decantr-qualification-private';
const WORKFLOW_FILE = 'benchmark-3-10-evaluator-qualification.yml';
const GIT_COMMIT = /^[a-f0-9]{40}$/u;
const SOURCE_REF = /^refs\/heads\/[A-Za-z0-9._/-]+$/u;

const partitionPolicies = Object.freeze({
  development: Object.freeze({
    provider: GITHUB_ATTESTATIONS_PROVIDER,
    repository: PUBLIC_REPOSITORY,
  }),
  qualification: Object.freeze({
    provider: SIGSTORE_KEYLESS_PROVIDER,
    repository: PRIVATE_REPOSITORY,
  }),
});

export function qualificationProvenancePolicy(partition, input) {
  const base = partitionPolicies[partition];
  if (!base) throw new Error(`unsupported qualification provenance partition: ${partition}`);
  const sourceDigest = requiredString(input?.sourceDigest, 'sourceDigest');
  const sourceRef = requiredString(input?.sourceRef, 'sourceRef');
  if (!GIT_COMMIT.test(sourceDigest) || !SOURCE_REF.test(sourceRef)) {
    throw new Error('qualification provenance source identity is invalid');
  }
  const signerWorkflow =
    `${base.repository}/.github/workflows/${WORKFLOW_FILE}`;
  const sigstore = base.provider === SIGSTORE_KEYLESS_PROVIDER;
  return {
    provider: base.provider,
    repository: base.repository,
    signerWorkflow,
    sourceDigest,
    sourceRef,
    eventName: EVENT_NAME,
    predicateType: sigstore ? null : GITHUB_SLSA_PREDICATE_TYPE,
    certificateIdentity: sigstore
      ? `https://github.com/${signerWorkflow}@${sourceRef}`
      : null,
    certificateOidcIssuer: sigstore ? SIGSTORE_OIDC_ISSUER : null,
    denySelfHostedRunners: true,
  };
}

export async function verifyQualificationProvenance(input) {
  const attestationPath = resolveRequiredPath(input.attestationPath, 'attestationPath');
  const bundlePath = resolveRequiredPath(input.bundlePath, 'bundlePath');
  const policy = qualificationProvenancePolicy(input.partition, {
    sourceDigest: input.sourceDigest,
    sourceRef: input.sourceRef,
  });
  const execute = input.commandRunner ?? defaultCommandRunner;
  let verificationSha256;

  if (policy.provider === GITHUB_ATTESTATIONS_PROVIDER) {
    const result = await execute('gh', [
      'attestation',
      'verify',
      attestationPath,
      '--repo',
      policy.repository,
      '--bundle',
      bundlePath,
      '--signer-workflow',
      policy.signerWorkflow,
      '--source-digest',
      policy.sourceDigest,
      '--source-ref',
      policy.sourceRef,
      '--predicate-type',
      policy.predicateType,
      '--deny-self-hosted-runners',
      '--format',
      'json',
    ]);
    if (result.exitCode !== 0) {
      throw new Error(
        `GitHub qualification provenance verification failed: ${
          (result.stderr || result.stdout).trim()
        }`,
      );
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
        item?.verificationResult?.statement?.predicateType !== policy.predicateType ||
        !Array.isArray(item?.verificationResult?.statement?.subject) ||
        item.verificationResult.statement.subject.length === 0
      ) {
        throw new Error('GitHub qualification provenance verification output is incomplete');
      }
    }
    verificationSha256 = sha256Canonical(verification);
  } else {
    const sigstore = await verifySigstoreKeylessBlob({
      subjectPath: attestationPath,
      bundlePath,
      repository: policy.repository,
      workflowFile: basename(policy.signerWorkflow),
      sourceDigest: policy.sourceDigest,
      sourceRef: policy.sourceRef,
      eventName: policy.eventName,
      cosignPath: resolveRequiredPath(input.cosignPath, 'cosignPath'),
      commandRunner: input.commandRunner,
    });
    if (
      sigstore.provider !== policy.provider ||
      sigstore.policy.repository !== policy.repository ||
      sigstore.policy.certificateIdentity !== policy.certificateIdentity ||
      sigstore.policy.certificateOidcIssuer !== policy.certificateOidcIssuer ||
      sigstore.policy.sourceDigest !== policy.sourceDigest ||
      sigstore.policy.sourceRef !== policy.sourceRef ||
      sigstore.policy.eventName !== policy.eventName ||
      sigstore.policy.githubHostedRunnerRequired !== true
    ) {
      throw new Error('Sigstore qualification provenance verification policy differs');
    }
    verificationSha256 = sigstore.verificationSha256;
  }

  return {
    policy,
    attestationFileSha256: sha256(await readFile(attestationPath)),
    bundleFileSha256: sha256(await readFile(bundlePath)),
    verificationSha256,
  };
}

export function qualificationProvenanceBundleFilename(taskId, provider) {
  if (typeof taskId !== 'string' || taskId.length < 3) throw new Error('taskId is invalid');
  if (provider === GITHUB_ATTESTATIONS_PROVIDER) return `${taskId}.jsonl`;
  if (provider === SIGSTORE_KEYLESS_PROVIDER) return `${taskId}.sigstore.json`;
  throw new Error(`unsupported qualification provenance provider: ${provider}`);
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
