#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertTaskEnvironmentSpec } from './contracts.mjs';
import {
  readJsonFile,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from '../runner/canonical.mjs';
import { calculateRuntimeMatrixDigest } from './runtime-matrix.mjs';
import {
  runtimeBaseImageReference,
  runtimeBenchmarkImageReference,
} from './runtime-profile-attestation.mjs';

const benchmarkRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(benchmarkRoot, '..', '..');

export async function generateRuntimeMatrix(options) {
  const protocol = await readJsonFile(options.protocolPath);
  const development = await readPartition(options.developmentRoot, 'development', 24);
  const qualification = await readPartition(options.qualificationRoot, 'qualification', 16);
  const all = [...development, ...qualification];
  const profileGroups = new Map();
  for (const item of all) {
    const canonicalProfile = sha256Canonical(item.spec.profile);
    const existing = profileGroups.get(item.spec.profile.id);
    if (existing && existing.profileSha256 !== canonicalProfile) {
      throw new Error(`${item.spec.profile.id}: profile ID maps to different runtime definitions`);
    }
    const group = existing ?? {
      profile: structuredClone(item.spec.profile),
      profileSha256: canonicalProfile,
      taskCount: 0,
    };
    group.taskCount += 1;
    profileGroups.set(item.spec.profile.id, group);
  }
  const profiles = [...profileGroups.values()]
    .map((group) => ({
      ...group.profile,
      taskCount: group.taskCount,
      profileSha256: group.profileSha256,
      baseImage: {
        reference: runtimeBaseImageReference(group.profile),
        digest: null,
      },
      benchmarkImage: {
        reference: runtimeBenchmarkImageReference(group.profile.id),
        digest: null,
      },
      verification: null,
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const approved = all.filter((item) => item.spec.review.status === 'approved').length;
  const sourceBindings = all
    .map((item) => ({ partition: item.spec.partition, taskId: item.spec.taskId, sha256: item.sha256 }))
    .sort((left, right) => left.taskId.localeCompare(right.taskId));
  const matrix = {
    schemaVersion: 'decantr-benchmark-runtime-matrix.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    frozenAt: protocol.frozenAt,
    status: 'draft',
    paidExecutionAuthorized: false,
    sourceSpecSetSha256: sha256Canonical(sourceBindings),
    taskCounts: { development: 24, qualification: 16, total: 40, approved },
    profiles,
    blockers: {
      unapprovedTaskSpecs: 40 - approved,
      unbuiltProfiles: profiles.length,
      unverifiedProfiles: profiles.length,
    },
  };
  matrix.matrixSha256 = calculateRuntimeMatrixDigest(matrix);
  await writeCanonicalFile(options.outputPath, matrix);
  return {
    profiles: profiles.length,
    approved,
    blockers: matrix.blockers,
    matrixSha256: matrix.matrixSha256,
  };
}

async function readPartition(root, partition, expectedCount) {
  const directory = join(root, 'specs');
  const files = (await readdir(directory)).filter((file) => file.endsWith('.json')).sort();
  if (files.length !== expectedCount) {
    throw new Error(`${partition}: expected ${expectedCount} environment specs, found ${files.length}`);
  }
  const output = [];
  const seen = new Set();
  for (const file of files) {
    const path = join(directory, file);
    const bytes = await readFile(path);
    const spec = assertTaskEnvironmentSpec(JSON.parse(bytes));
    if (spec.partition !== partition || seen.has(spec.taskId)) {
      throw new Error(`${partition}: duplicate or misplaced environment spec`);
    }
    seen.add(spec.taskId);
    output.push({ spec, sha256: sha256(bytes) });
  }
  return output;
}

function parseArgs(argv) {
  const options = {
    protocolPath: join(benchmarkRoot, 'protocol.json'),
    developmentRoot: join(benchmarkRoot, 'environments', 'development'),
    qualificationRoot: join(repositoryRoot, '.private', 'benchmark-3-10', 'environments', 'qualification'),
    outputPath: join(benchmarkRoot, 'environments', 'runtime-matrix.draft.json'),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--protocol') options.protocolPath = resolve(argv[++index]);
    else if (argument === '--development-root') options.developmentRoot = resolve(argv[++index]);
    else if (argument === '--qualification-root') options.qualificationRoot = resolve(argv[++index]);
    else if (argument === '--out') options.outputPath = resolve(argv[++index]);
    else throw new Error(`Unknown option: ${argument}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await generateRuntimeMatrix(parseArgs(process.argv.slice(2)));
    console.log(JSON.stringify({ ok: true, ...result }, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
