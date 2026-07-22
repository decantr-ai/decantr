#!/usr/bin/env node
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkoutDirectory } from '../lib.mjs';
import { prettyCanonicalJson } from '../runner/canonical.mjs';
import { runFixed, sanitizedEnvironment } from '../runner/process.mjs';
import { buildQualificationInput } from './qualification-input.mjs';
import { assertCandidateSet } from './qualify.mjs';

const directory = dirname(fileURLToPath(import.meta.url));
const benchmarkRoot = resolve(directory, '..');
const repositoryRoot = resolve(benchmarkRoot, '..', '..');
const IMAGE_DIGEST = /^sha256:[a-f0-9]{64}$/u;

export async function prepareDevelopmentQualificationInput(inputOptions) {
  const options = normalizeOptions(inputOptions);
  const candidates = assertCandidateSet(
    JSON.parse(await readFile(options.candidatesPath)),
    'development',
  );
  const candidate = candidates.find((item) => item.taskId === options.taskId);
  if (!candidate) throw new Error('requested public development task is absent');
  if (candidate.partition !== 'development') {
    throw new Error('public qualification input production is development-only');
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
    git(checkout, ['fetch', '--no-tags', '--depth=1', 'origin', commit], environment, 300_000);
  }
  for (const revision of [candidate.base, candidate.expected]) {
    if (
      gitOutput(checkout, ['rev-parse', `${revision.commit}^{commit}`], environment) !== revision.commit ||
      gitOutput(checkout, ['rev-parse', `${revision.commit}^{tree}`], environment) !== revision.tree
    ) {
      throw new Error('frozen development revision differs after acquisition');
    }
  }
  git(checkout, ['checkout', '--quiet', '--detach', candidate.repository.corpusPin], environment);
  if (gitOutput(checkout, ['status', '--porcelain=v1', '--untracked-files=all'], environment) !== '') {
    throw new Error('acquired development checkout is dirty');
  }

  return buildQualificationInput({
    partition: 'development',
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
    candidatesPath: resolve(input.candidatesPath),
    corpusPath: resolve(input.corpusPath),
    corpusRoot: resolve(input.corpusRoot),
    evaluatorRoot: resolve(input.evaluatorRoot),
    environmentRoot: resolve(input.environmentRoot),
    runtimeMatrixPath: resolve(input.runtimeMatrixPath),
    outputRoot: resolve(input.outputRoot),
  };
  if (typeof options.taskId !== 'string' || options.taskId.length < 3) {
    throw new Error('taskId is required');
  }
  if (
    options.proxyImage?.reference !== 'docker.io/ubuntu/squid' ||
    !IMAGE_DIGEST.test(options.proxyImage?.digest ?? '')
  ) {
    throw new Error('the reviewed dependency proxy reference and exact digest are required');
  }
  return options;
}

function git(cwd, args, environment, timeoutMs = 120_000) {
  const result = runFixed('git', ['-C', cwd, ...args], { cwd, env: environment, timeoutMs });
  if (result.exitCode !== 0) throw new Error(`git ${args[0]} failed while acquiring development input`);
}

function gitOutput(cwd, args, environment) {
  const result = runFixed('git', ['-C', cwd, ...args], { cwd, env: environment, timeoutMs: 120_000 });
  if (result.exitCode !== 0) throw new Error(`git ${args[0]} failed while verifying development input`);
  return result.stdout.trim();
}

function parseArgs(argv) {
  const options = {
    candidatesPath: join(benchmarkRoot, 'tasks', 'development-candidates.json'),
    corpusPath: join(benchmarkRoot, 'corpus.json'),
    evaluatorRoot: join(benchmarkRoot, 'evaluators', 'development'),
    environmentRoot: join(benchmarkRoot, 'environments', 'development'),
    runtimeMatrixPath: join(benchmarkRoot, 'environments', 'runtime-matrix.locked.json'),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--task-id') options.taskId = argv[++index];
    else if (argument === '--candidates') options.candidatesPath = resolve(argv[++index]);
    else if (argument === '--corpus') options.corpusPath = resolve(argv[++index]);
    else if (argument === '--corpus-root') options.corpusRoot = resolve(argv[++index]);
    else if (argument === '--evaluator-root') options.evaluatorRoot = resolve(argv[++index]);
    else if (argument === '--environment-root') options.environmentRoot = resolve(argv[++index]);
    else if (argument === '--runtime-matrix') options.runtimeMatrixPath = resolve(argv[++index]);
    else if (argument === '--output-root') options.outputRoot = resolve(argv[++index]);
    else if (argument === '--proxy-image-digest') {
      options.proxyImage = { reference: 'docker.io/ubuntu/squid', digest: argv[++index] };
    } else throw new Error(`unknown option: ${argument}`);
  }
  for (const key of ['taskId', 'corpusRoot', 'outputRoot', 'proxyImage']) {
    if (!options[key]) throw new Error(`--${key.replace(/[A-Z]/gu, (value) => `-${value.toLowerCase()}`)} is required`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await prepareDevelopmentQualificationInput(parseArgs(process.argv.slice(2)));
    process.stdout.write(`${prettyCanonicalJson({ ok: true, taskId: result.request.taskId })}`);
  } catch {
    console.error('development qualification input production failed; inspect the reviewed workflow logs');
    process.exitCode = 1;
  }
}
