#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  prettyCanonicalJson,
  sha256Canonical,
} from './canonical.mjs';

const SCHEMA_VERSION =
  'decantr-benchmark-prepared-workspace-source-index.v1';
const PROGRAM = 'decantr-3.10-ui-change-control-proof';
const SHA256 = /^[a-f0-9]{64}$/u;
const GIT_SHA = /^[a-f0-9]{40}$/u;
const TASK_ID = /^[a-z0-9][a-z0-9._-]{2,95}$/u;
const SOURCE_REF = 'refs/heads/main';
const WORKFLOW = 'benchmark-3-10-evaluator-qualification.yml';

export function calculatePreparedWorkspaceSourceIndexDigest(index) {
  const copy = structuredClone(index);
  delete copy.indexSha256;
  return sha256Canonical(copy);
}

export function assertPreparedWorkspaceSourceIndex(index, options = {}) {
  assertExactKeys(
    index,
    [
      'schemaVersion',
      'program',
      'generatedAt',
      'tasks',
      'indexSha256',
    ],
    'prepared workspace source index',
  );
  if (
    index.schemaVersion !== SCHEMA_VERSION ||
    index.program !== PROGRAM ||
    !Number.isFinite(Date.parse(index.generatedAt ?? '')) ||
    !Array.isArray(index.tasks) ||
    index.tasks.length !== 40 ||
    index.indexSha256 !==
      calculatePreparedWorkspaceSourceIndexDigest(index)
  ) {
    throw new Error('prepared workspace source index is invalid');
  }

  const seen = new Set();
  let previous = '';
  for (const task of index.tasks) {
    assertPreparedWorkspaceSource(task);
    if (seen.has(task.taskId) || task.taskId.localeCompare(previous) < 0) {
      throw new Error(
        'prepared workspace sources must be unique and sorted by task ID',
      );
    }
    seen.add(task.taskId);
    previous = task.taskId;
  }

  if (options.expectedTasks) {
    const expected = [...options.expectedTasks]
      .map((task) =>
        typeof task === 'string' ? task : task.taskId,
      )
      .sort();
    const actual = index.tasks.map((task) => task.taskId);
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(
        'prepared workspace source index differs from the frozen task set',
      );
    }
  }
  return index;
}

export function assertPreparedWorkspaceSource(task) {
  assertExactKeys(
    task,
    [
      'artifact',
      'executionAttestationFileSha256',
      'partition',
      'preparedEnvironmentFileSha256',
      'repository',
      'runAttempt',
      'runId',
      'runnerRepositoryCommit',
      'sourceRef',
      'taskId',
      'verificationSha256',
      'workflow',
      'workspacePreparedSha256',
    ],
    'prepared workspace source',
  );
  const expectedRepository =
    task.partition === 'development'
      ? 'decantr-ai/decantr'
      : 'decantr-ai/decantr-qualification-private';
  if (
    !TASK_ID.test(task.taskId ?? '') ||
    !['development', 'qualification'].includes(task.partition) ||
    task.repository !== expectedRepository ||
    task.workflow !== WORKFLOW ||
    task.sourceRef !== SOURCE_REF ||
    !Number.isSafeInteger(task.runId) ||
    task.runId <= 0 ||
    !Number.isSafeInteger(task.runAttempt) ||
    task.runAttempt !== 1 ||
    task.artifact !==
      `benchmark-3-10-prepared-workspace-${task.runId}-${task.runAttempt}` ||
    !GIT_SHA.test(task.runnerRepositoryCommit ?? '') ||
    ![
      'executionAttestationFileSha256',
      'preparedEnvironmentFileSha256',
      'verificationSha256',
      'workspacePreparedSha256',
    ].every((key) => SHA256.test(task[key] ?? ''))
  ) {
    throw new Error(
      `${task.taskId ?? 'unknown'}: prepared workspace source is invalid`,
    );
  }
  return task;
}

export async function readPreparedWorkspaceSourceIndex(path, options) {
  const bytes = await readFile(path);
  const value = JSON.parse(bytes);
  if (!bytes.equals(Buffer.from(prettyCanonicalJson(value)))) {
    throw new Error('prepared workspace source index is not canonical');
  }
  return assertPreparedWorkspaceSourceIndex(value, options);
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

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--index') {
      options.indexPath = resolve(argv[++index]);
    } else if (argument === '--task-id') {
      options.taskId = argv[++index];
    } else {
      throw new Error(`Unknown option: ${argument}`);
    }
  }
  if (!options.indexPath || !options.taskId) {
    throw new Error('--index and --task-id are required');
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const index = await readPreparedWorkspaceSourceIndex(
      options.indexPath,
    );
    const task = index.tasks.find(
      (item) => item.taskId === options.taskId,
    );
    if (!task) {
      throw new Error(
        `${options.taskId}: prepared workspace source is absent`,
      );
    }
    process.stdout.write(prettyCanonicalJson(task));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
