#!/usr/bin/env node
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkoutDirectory } from '../lib.mjs';
import { prettyCanonicalJson } from '../runner/canonical.mjs';
import { runFixed, sanitizedEnvironment } from '../runner/process.mjs';
import { assertCandidateSet } from './qualify.mjs';
import { buildQualificationInput } from './qualification-input.mjs';

const directory = dirname(fileURLToPath(import.meta.url));
const benchmarkRoot = resolve(directory, '..');
const repositoryRoot = resolve(benchmarkRoot, '..', '..');
const privateRoot = join(repositoryRoot, '.private', 'benchmark-3-10');
const imageDigestPattern = /^sha256:[a-f0-9]{64}$/u;

export async function preparePrivateQualificationInput(input) {
  const options = normalizeOptions(input);
  const candidates = assertCandidateSet(
    JSON.parse(await readFile(options.candidatesPath)),
    'qualification',
  );
  const candidate = candidates.find((item) => item.taskId === options.taskId);
  if (!candidate || candidate.partition !== 'qualification') {
    throw new Error('requested sealed qualification task is absent');
  }

  const checkout = join(options.corpusRoot, checkoutDirectory(candidate.repository.url));
  await mkdir(checkout, { recursive: true, mode: 0o700 });
  const environment = sanitizedEnvironment(join(options.corpusRoot, '.git-home'));
  git(checkout, ['init', '--quiet'], environment);
  git(checkout, ['remote', 'add', 'origin', candidate.repository.url], environment);
  for (const commit of new Set([
    candidate.base.commit,
    candidate.expected.commit,
    candidate.repository.corpusPin,
  ])) {
    git(checkout, ['fetch', '--no-tags', '--depth=1', 'origin', commit], environment, 600_000);
  }
  for (const revision of [candidate.base, candidate.expected]) {
    if (
      gitOutput(checkout, ['rev-parse', `${revision.commit}^{commit}`], environment) !==
        revision.commit ||
      gitOutput(checkout, ['rev-parse', `${revision.commit}^{tree}`], environment) !== revision.tree
    ) {
      throw new Error('frozen qualification revision differs after acquisition');
    }
  }
  git(checkout, ['checkout', '--quiet', '--detach', candidate.repository.corpusPin], environment);
  if (gitOutput(checkout, ['status', '--porcelain=v1', '--untracked-files=all'], environment) !== '') {
    throw new Error('acquired qualification checkout is dirty');
  }

  return buildQualificationInput({
    partition: 'qualification',
    taskId: candidate.taskId,
    candidatesPath: options.candidatesPath,
    corpusPath: options.corpusPath,
    corpusRoot: options.corpusRoot,
    evaluatorRoot: options.evaluatorRoot,
    environmentRoot: options.environmentRoot,
    runtimeMatrixPath: options.runtimeMatrixPath,
    outputRoot: options.outputRoot,
    proxyImage: options.proxyImage,
  });
}

function normalizeOptions(input) {
  const options = {
    ...input,
    candidatesPath: resolve(
      input.candidatesPath ??
        join(privateRoot, 'task-freeze', 'qualification-private.json'),
    ),
    corpusPath: resolve(input.corpusPath ?? join(benchmarkRoot, 'corpus.json')),
    corpusRoot: resolve(input.corpusRoot),
    evaluatorRoot: resolve(
      input.evaluatorRoot ?? join(privateRoot, 'evaluators', 'qualification'),
    ),
    environmentRoot: resolve(
      input.environmentRoot ?? join(privateRoot, 'environments', 'qualification'),
    ),
    runtimeMatrixPath: resolve(
      input.runtimeMatrixPath ??
        join(benchmarkRoot, 'environments', 'runtime-matrix.locked.json'),
    ),
    outputRoot: resolve(input.outputRoot),
  };
  if (typeof options.taskId !== 'string' || options.taskId.length < 3) {
    throw new Error('taskId is required');
  }
  if (
    options.proxyImage?.reference !== 'docker.io/ubuntu/squid' ||
    !imageDigestPattern.test(options.proxyImage?.digest ?? '')
  ) {
    throw new Error('the reviewed dependency proxy reference and exact digest are required');
  }
  return options;
}

function git(cwd, args, environment, timeoutMs = 120_000) {
  const result = runFixed('git', ['-C', cwd, ...args], {
    cwd,
    env: environment,
    timeoutMs,
  });
  if (result.exitCode !== 0) {
    throw new Error(`git ${args[0]} failed while acquiring sealed qualification input`);
  }
}

function gitOutput(cwd, args, environment) {
  const result = runFixed('git', ['-C', cwd, ...args], {
    cwd,
    env: environment,
    timeoutMs: 120_000,
  });
  if (result.exitCode !== 0) {
    throw new Error(`git ${args[0]} failed while verifying sealed qualification input`);
  }
  return result.stdout.trim();
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--task-id') options.taskId = argv[++index];
    else if (argument === '--candidates') options.candidatesPath = argv[++index];
    else if (argument === '--corpus') options.corpusPath = argv[++index];
    else if (argument === '--corpus-root') options.corpusRoot = argv[++index];
    else if (argument === '--evaluator-root') options.evaluatorRoot = argv[++index];
    else if (argument === '--environment-root') options.environmentRoot = argv[++index];
    else if (argument === '--runtime-matrix') options.runtimeMatrixPath = argv[++index];
    else if (argument === '--output-root') options.outputRoot = argv[++index];
    else if (argument === '--proxy-image-digest') {
      options.proxyImage = { reference: 'docker.io/ubuntu/squid', digest: argv[++index] };
    } else {
      throw new Error(`unknown option: ${argument}`);
    }
  }
  for (const key of ['taskId', 'corpusRoot', 'outputRoot', 'proxyImage']) {
    if (!options[key]) {
      throw new Error(
        `--${key.replace(/[A-Z]/gu, (value) => `-${value.toLowerCase()}`)} is required`,
      );
    }
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await preparePrivateQualificationInput(parseArgs(process.argv.slice(2)));
    process.stdout.write(
      `${prettyCanonicalJson({ ok: true, taskId: result.request.taskId })}`,
    );
  } catch {
    process.stderr.write(
      'private qualification input production failed; inspect the private workflow logs\n',
    );
    process.exitCode = 1;
  }
}
