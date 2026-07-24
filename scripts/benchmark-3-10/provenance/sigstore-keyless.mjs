#!/usr/bin/env node
import { mkdtempSync, rmSync } from 'node:fs';
import { lstat, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from '../runner/canonical.mjs';
import { runFixed, sanitizedEnvironment } from '../runner/process.mjs';

export const SIGSTORE_KEYLESS_PROVIDER = 'sigstore-keyless';
export const SIGSTORE_KEYLESS_SCHEMA_VERSION =
  'decantr-benchmark-sigstore-keyless-verification.v1';
export const SIGSTORE_OIDC_ISSUER = 'https://token.actions.githubusercontent.com';

const repositoryPattern = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u;
const workflowPattern = /^[A-Za-z0-9_.-]+\.ya?ml$/u;
const gitCommitPattern = /^[a-f0-9]{40}$/u;
const sourceRefPattern = /^refs\/heads\/[A-Za-z0-9._/-]+$/u;
const eventPattern = /^[a-z][a-z0-9_]*$/u;

export async function verifySigstoreKeylessBlob(input) {
  const options = normalizeOptions(input);
  const [subjectBytes, bundleBytes] = await Promise.all([
    readRegularFile(options.subjectPath, 'Sigstore subject'),
    readRegularFile(options.bundlePath, 'Sigstore bundle'),
  ]);
  assertJsonObject(bundleBytes, 'Sigstore bundle');

  const certificateIdentity =
    `https://github.com/${options.repository}/.github/workflows/` +
    `${options.workflowFile}@${options.sourceRef}`;
  const args = [
    'verify-blob',
    '--bundle',
    options.bundlePath,
    '--certificate-identity',
    certificateIdentity,
    '--certificate-oidc-issuer',
    SIGSTORE_OIDC_ISSUER,
    '--certificate-github-workflow-repository',
    options.repository,
    '--certificate-github-workflow-ref',
    options.sourceRef,
    '--certificate-github-workflow-sha',
    options.sourceDigest,
    '--certificate-github-workflow-trigger',
    options.eventName,
    '--new-bundle-format=true',
    '--offline',
    '--max-workers',
    '1',
    options.subjectPath,
  ];
  const result = options.commandRunner
    ? await options.commandRunner(options.cosignPath, args)
    : runCosign(options.cosignPath, args);
  if (result?.exitCode !== 0) {
    const detail = String(result?.stderr || result?.stdout || 'unknown verification failure').trim();
    throw new Error(`Sigstore keyless provenance verification failed: ${detail}`);
  }

  const verification = {
    schemaVersion: SIGSTORE_KEYLESS_SCHEMA_VERSION,
    provider: SIGSTORE_KEYLESS_PROVIDER,
    verified: true,
    subject: {
      bytes: subjectBytes.byteLength,
      sha256: sha256(subjectBytes),
    },
    bundle: {
      bytes: bundleBytes.byteLength,
      sha256: sha256(bundleBytes),
    },
    policy: {
      certificateIdentity,
      certificateOidcIssuer: SIGSTORE_OIDC_ISSUER,
      repository: options.repository,
      workflowFile: options.workflowFile,
      sourceDigest: options.sourceDigest,
      sourceRef: options.sourceRef,
      eventName: options.eventName,
      transparencyLogRequired: true,
      certificateTransparencyRequired: true,
      githubHostedRunnerRequired: true,
    },
  };
  verification.verificationSha256 = sha256Canonical(verification);
  return assertSigstoreKeylessVerification(verification);
}

export function assertSigstoreKeylessVerification(value) {
  if (
    value?.schemaVersion !== SIGSTORE_KEYLESS_SCHEMA_VERSION ||
    value.provider !== SIGSTORE_KEYLESS_PROVIDER ||
    value.verified !== true ||
    !Number.isInteger(value.subject?.bytes) ||
    value.subject.bytes < 1 ||
    !/^[a-f0-9]{64}$/u.test(value.subject?.sha256 ?? '') ||
    !Number.isInteger(value.bundle?.bytes) ||
    value.bundle.bytes < 1 ||
    !/^[a-f0-9]{64}$/u.test(value.bundle?.sha256 ?? '') ||
    value.policy?.certificateOidcIssuer !== SIGSTORE_OIDC_ISSUER ||
    value.policy?.transparencyLogRequired !== true ||
    value.policy?.certificateTransparencyRequired !== true ||
    value.policy?.githubHostedRunnerRequired !== true ||
    value.verificationSha256 !==
      sha256Canonical(withoutKey(value, 'verificationSha256'))
  ) {
    throw new Error('Sigstore keyless verification record is invalid');
  }
  return value;
}

function normalizeOptions(input) {
  const options = {
    subjectPath: resolveRequiredPath(input.subjectPath, 'subjectPath'),
    bundlePath: resolveRequiredPath(input.bundlePath, 'bundlePath'),
    repository: input.repository,
    workflowFile: input.workflowFile,
    sourceDigest: input.sourceDigest,
    sourceRef: input.sourceRef,
    eventName: input.eventName ?? 'workflow_dispatch',
    cosignPath: resolveRequiredPath(input.cosignPath, 'cosignPath'),
    commandRunner: input.commandRunner,
  };
  if (
    !repositoryPattern.test(options.repository ?? '') ||
    !workflowPattern.test(options.workflowFile ?? '') ||
    !gitCommitPattern.test(options.sourceDigest ?? '') ||
    !sourceRefPattern.test(options.sourceRef ?? '') ||
    !eventPattern.test(options.eventName ?? '')
  ) {
    throw new Error(
      'repository, workflowFile, sourceDigest, sourceRef, and eventName must be exact',
    );
  }
  return options;
}

function runCosign(command, args) {
  const home = mkdtempSync(resolve(tmpdir(), 'decantr-sigstore-'));
  try {
    return runFixed(command, args, {
      env: sanitizedEnvironment(home),
      timeoutMs: 120_000,
      maxBuffer: 16 * 1024 * 1024,
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
}

async function readRegularFile(path, label) {
  const metadata = await lstat(path);
  if (metadata.isSymbolicLink() || !metadata.isFile()) {
    throw new Error(`${label} must be a regular file`);
  }
  return readFile(path);
}

function assertJsonObject(bytes, label) {
  let value;
  try {
    value = JSON.parse(bytes.toString('utf8'));
  } catch {
    throw new Error(`${label} is not valid JSON`);
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must contain a JSON object`);
  }
}

function resolveRequiredPath(value, label) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${label} is required`);
  }
  return resolve(value);
}

function withoutKey(value, key) {
  const output = structuredClone(value);
  delete output[key];
  return output;
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--subject') options.subjectPath = argv[++index];
    else if (argument === '--bundle') options.bundlePath = argv[++index];
    else if (argument === '--repository') options.repository = argv[++index];
    else if (argument === '--workflow') options.workflowFile = argv[++index];
    else if (argument === '--source-digest') options.sourceDigest = argv[++index];
    else if (argument === '--source-ref') options.sourceRef = argv[++index];
    else if (argument === '--event') options.eventName = argv[++index];
    else if (argument === '--cosign') options.cosignPath = argv[++index];
    else if (argument === '--out') options.outputPath = argv[++index];
    else throw new Error(`unknown option: ${argument}`);
  }
  return options;
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFile) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const verification = await verifySigstoreKeylessBlob(options);
    if (typeof options.outputPath === 'string' && options.outputPath.length > 0) {
      await writeCanonicalFile(resolve(options.outputPath), verification);
    }
    process.stdout.write(`${JSON.stringify({ ok: true, ...verification }, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
