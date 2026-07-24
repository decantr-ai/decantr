#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  prettyCanonicalJson,
  sha256Canonical,
} from './canonical.mjs';

const SCHEMA_VERSION = 'decantr-benchmark-candidate-source.v1';
const PROGRAM = 'decantr-3.10-ui-change-control-proof';
const REPOSITORY = 'decantr-ai/decantr';
const WORKFLOW = 'benchmark-3-10-candidate.yml';
const SOURCE_REF = 'refs/heads/main';
const SHA256 = /^[a-f0-9]{64}$/u;
const GIT_SHA = /^[a-f0-9]{40}$/u;

export function calculateCandidateSourceDigest(value) {
  const copy = structuredClone(value);
  delete copy.sourceSha256;
  return sha256Canonical(copy);
}

export function assertCandidateSource(value) {
  assertExactKeys(
    value,
    [
      'schemaVersion',
      'program',
      'generatedAt',
      'source',
      'sourceSha256',
    ],
    'candidate source',
  );
  assertExactKeys(
    value.source,
    [
      'artifact',
      'candidateArchiveFileSha256',
      'candidateManifestFileSha256',
      'candidateProvenanceBundleFileSha256',
      'candidateProvenanceVerificationFileSha256',
      'candidateRuntimeTreeSha256',
      'candidateTarballSetSha256',
      'repository',
      'runAttempt',
      'runId',
      'runnerRepositoryCommit',
      'sourceRef',
      'workflow',
    ],
    'candidate source binding',
  );
  const source = value.source;
  if (
    value.schemaVersion !== SCHEMA_VERSION ||
    value.program !== PROGRAM ||
    !Number.isFinite(Date.parse(value.generatedAt ?? '')) ||
    source.repository !== REPOSITORY ||
    source.workflow !== WORKFLOW ||
    source.sourceRef !== SOURCE_REF ||
    !Number.isSafeInteger(source.runId) ||
    source.runId <= 0 ||
    source.runAttempt !== 1 ||
    source.artifact !==
      `benchmark-3-10-candidate-${source.runnerRepositoryCommit}-${source.runId}-${source.runAttempt}` ||
    !GIT_SHA.test(source.runnerRepositoryCommit ?? '') ||
    ![
      'candidateManifestFileSha256',
      'candidateArchiveFileSha256',
      'candidateProvenanceBundleFileSha256',
      'candidateProvenanceVerificationFileSha256',
      'candidateRuntimeTreeSha256',
      'candidateTarballSetSha256',
    ].every((key) => SHA256.test(source[key] ?? '')) ||
    value.sourceSha256 !== calculateCandidateSourceDigest(value)
  ) {
    throw new Error('candidate source is invalid');
  }
  return value;
}

export async function readCandidateSource(path) {
  const bytes = await readFile(path);
  const value = JSON.parse(bytes);
  if (!bytes.equals(Buffer.from(prettyCanonicalJson(value)))) {
    throw new Error('candidate source is not canonical');
  }
  return assertCandidateSource(value);
}

function assertExactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (
    actual.length !== wanted.length ||
    actual.some((key, index) => key !== wanted[index])
  ) {
    throw new Error(`${label} fields are invalid`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const path = resolve(process.argv[2] ?? '');
    if (!process.argv[2]) throw new Error('candidate source path is required');
    const value = await readCandidateSource(path);
    process.stdout.write(prettyCanonicalJson(value.source));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
