#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256, sha256Canonical, writeCanonicalFile } from '../runner/canonical.mjs';
import { runFixed, sanitizedEnvironment } from '../runner/process.mjs';

const directory = dirname(fileURLToPath(import.meta.url));
const benchmarkRoot = resolve(directory, '..');
const repositoryRoot = resolve(benchmarkRoot, '..', '..');

export async function listProbeTasks(specRoot, requestedTaskId) {
  const files = (await readdir(specRoot)).filter((file) => file.endsWith('.json')).sort();
  const tasks = [];
  for (const file of files) {
    const spec = JSON.parse(await readFile(join(specRoot, file), 'utf8'));
    if (requestedTaskId && spec.taskId !== requestedTaskId) continue;
    if (!requestedTaskId && spec.review?.status !== 'draft') continue;
    tasks.push(spec.taskId);
  }
  if (requestedTaskId && tasks.length !== 1) {
    throw new Error(`requested task environment spec is absent: ${requestedTaskId}`);
  }
  return tasks;
}

export async function runHostedProbe(input) {
  const options = normalizeHostOptions(input);
  const [specBytes, candidateBundle, matrix] = await Promise.all([
    readFile(options.specPath),
    readJson(options.candidatesPath),
    readJson(options.matrixPath),
  ]);
  const spec = JSON.parse(specBytes);
  const candidate = candidateBundle.records?.find((item) => item.taskId === spec.taskId);
  if (!candidate) throw new Error(`${spec.taskId}: frozen candidate is absent`);
  if (candidate.partition !== spec.partition) throw new Error(`${spec.taskId}: candidate partition differs`);
  if (
    candidate.base?.commit !== spec.base?.commit ||
    candidate.base?.tree !== spec.base?.tree ||
    candidate.repository?.projectPath !== spec.projectPath
  ) {
    throw new Error(`${spec.taskId}: environment spec differs from the frozen candidate`);
  }
  if (spec.review?.status !== 'draft' && !options.allowApproved) {
    throw new Error(`${spec.taskId}: hosted bootstrap probes are for draft specs`);
  }
  const profile = matrix.profiles?.find((item) => item.id === spec.profile?.id);
  if (!profile) throw new Error(`${spec.taskId}: runtime profile is absent from the draft matrix`);

  await prepareEmptyDirectory(options.outputRoot);
  const workspace = join(options.outputRoot, 'workspace');
  const evidenceRoot = join(options.outputRoot, 'evidence');
  await mkdir(workspace, { recursive: true, mode: 0o700 });
  await mkdir(evidenceRoot, { recursive: true, mode: 0o700 });
  const gitEnvironment = sanitizedEnvironment(join(options.outputRoot, 'git-home'));
  acquireCandidate(workspace, candidate, gitEnvironment);
  await verifyBoundFiles(workspace, spec);

  const cleanBefore = gitOutput(workspace, ['status', '--porcelain=v1', '--untracked-files=all'], gitEnvironment) === '';
  if (!cleanBefore) throw new Error(`${spec.taskId}: acquired base workspace is dirty`);

  runRequired('docker', ['pull', profile.benchmarkImage.reference], repositoryRoot, 1_800_000);
  const resolvedImage = resolveImageReference(profile.benchmarkImage.reference);
  const containerResultPath = join(evidenceRoot, `${safeName(spec.taskId)}.container-result.json`);
  chownForContainer(workspace, evidenceRoot);
  let dockerResult;
  try {
    dockerResult = runFixed(
      'docker',
      [
        'run',
        '--rm',
        '--network',
        'bridge',
        '--read-only',
        '--tmpfs',
        '/tmp:rw,uid=10001,gid=10001,mode=1777',
        '--tmpfs',
        '/home/benchmark-empty:rw,uid=10001,gid=10001,mode=0700',
        '--mount',
        `type=bind,src=${workspace},dst=/work/task,rw`,
        '--mount',
        `type=bind,src=${options.specPath},dst=/input/spec.json,readonly`,
        '--mount',
        `type=bind,src=${fileURLToPath(import.meta.url)},dst=/input/hosted-task-environment-probe.mjs,readonly`,
        '--mount',
        `type=bind,src=${evidenceRoot},dst=/evidence,rw`,
        '--env',
        `DECANTR_BENCHMARK_IMAGE_DIGEST=${resolvedImage}`,
        resolvedImage,
        '/usr/local/bin/node',
        '/input/hosted-task-environment-probe.mjs',
        '--mode',
        'container',
        '--spec',
        '/input/spec.json',
        '--workspace',
        '/work/task',
        '--out',
        `/evidence/${basename(containerResultPath)}`,
      ],
      {
        cwd: repositoryRoot,
        env: process.env,
        timeoutMs: maxPreparationTimeout(spec) + 300_000,
        maxBuffer: 8 * 1024 * 1024,
      },
    );
  } finally {
    chownBack(workspace, evidenceRoot);
  }

  const containerResult = await readJson(containerResultPath);
  const cleanAfter =
    gitOutput(workspace, ['status', '--porcelain=v1', '--untracked-files=all'], gitEnvironment) === '';
  const success =
    dockerResult.exitCode === 0 &&
    containerResult.ok === true &&
    cleanAfter === spec.cleanAfterPreparation;
  const subject = {
    schemaVersion: 'decantr-benchmark-task-environment-probe-subject.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    taskId: spec.taskId,
    partition: spec.partition,
    source: {
      repository: candidate.repository.url,
      commit: candidate.base.commit,
      tree: candidate.base.tree,
      projectPath: candidate.repository.projectPath,
    },
    spec: {
      path: relative(repositoryRoot, options.specPath).replaceAll('\\', '/'),
      sha256: sha256(specBytes),
      reviewStatusAtProbe: spec.review.status,
    },
    profile: spec.profile,
    benchmarkImage: {
      requested: profile.benchmarkImage.reference,
      resolved: resolvedImage,
      imageId: dockerImageId(resolvedImage),
    },
    execution: githubExecution(),
    preparation: containerResult,
    cleanWorktree: {
      before: cleanBefore,
      after: cleanAfter,
      requiredAfter: spec.cleanAfterPreparation,
    },
    success,
  };
  subject.subjectSha256 = sha256Canonical(subject);
  const subjectPath = join(evidenceRoot, `${safeName(spec.taskId)}.subject.json`);
  await writeCanonicalFile(subjectPath, subject);
  if (!success) {
    throw new Error(
      `${spec.taskId}: hosted preparation probe failed (${dockerResult.exitCode ?? dockerResult.signal ?? 'unknown'})`,
    );
  }
  return { subjectPath, subject };
}

export async function runContainerProbe(input) {
  const options = {
    specPath: resolve(input.specPath),
    workspace: resolve(input.workspace),
    outputPath: resolve(input.outputPath),
  };
  const spec = await readJson(options.specPath);
  const versions = {
    runtime: commandVersion(spec.profile.bunVersion ? 'bun' : 'node'),
    packageManager: commandVersion(spec.profile.packageManager.name),
  };
  const expectedRuntime = spec.profile.bunVersion ?? spec.profile.nodeVersion;
  if (normalizeVersion(versions.runtime) !== normalizeVersion(expectedRuntime)) {
    throw new Error(
      `${spec.taskId}: runtime mismatch, expected ${expectedRuntime}, received ${versions.runtime}`,
    );
  }
  if (
    normalizeVersion(versions.packageManager) !==
    normalizeVersion(spec.profile.packageManager.version)
  ) {
    throw new Error(
      `${spec.taskId}: package manager mismatch, expected ${spec.profile.packageManager.version}, received ${versions.packageManager}`,
    );
  }
  await verifyBoundFiles(options.workspace, spec);
  const commands = [];
  let ok = true;
  for (const command of spec.preparation) {
    const startedAt = Date.now();
    const result = runFixed(command.executable, command.args, {
      cwd: containedPath(options.workspace, command.cwd),
      env: {
        ...process.env,
        ...(command.environment ?? {}),
      },
      timeoutMs: command.timeoutMs,
      maxBuffer: 8 * 1024 * 1024,
    });
    const record = {
      id: command.id,
      executable: command.executable,
      args: command.args,
      cwd: command.cwd,
      network: command.network,
      required: command.required,
      exitCode: result.exitCode,
      signal: result.signal,
      durationMs: Date.now() - startedAt,
      stdoutSha256: sha256(result.stdout),
      stderrSha256: sha256(result.stderr),
    };
    commands.push(record);
    if (command.required && result.exitCode !== 0) {
      ok = false;
      break;
    }
  }
  const result = {
    schemaVersion: 'decantr-benchmark-task-environment-container-probe.v1',
    taskId: spec.taskId,
    ok,
    versions,
    benchmarkImage: process.env.DECANTR_BENCHMARK_IMAGE_DIGEST ?? null,
    commands,
  };
  await writeCanonicalFile(options.outputPath, result);
  if (!ok) throw new Error(`${spec.taskId}: required preparation command failed`);
  return result;
}

function acquireCandidate(workspace, candidate, environment) {
  runGit(workspace, ['init', '--quiet'], environment);
  runGit(workspace, ['remote', 'add', 'origin', candidate.repository.url], environment);
  runGit(
    workspace,
    ['fetch', '--no-tags', '--depth=1', 'origin', candidate.base.commit],
    environment,
    600_000,
  );
  runGit(workspace, ['checkout', '--quiet', '--detach', candidate.base.commit], environment);
  if (
    gitOutput(workspace, ['rev-parse', 'HEAD'], environment) !== candidate.base.commit ||
    gitOutput(workspace, ['rev-parse', 'HEAD^{tree}'], environment) !== candidate.base.tree
  ) {
    throw new Error(`${candidate.taskId}: acquired Git identity differs`);
  }
}

async function verifyBoundFiles(workspace, spec) {
  const bindings = [...spec.lockfiles, ...spec.sourceEvidence];
  for (const binding of bindings) {
    const path = containedPath(workspace, binding.path);
    const bytes = await readFile(path);
    if (sha256(bytes) !== binding.sha256) {
      throw new Error(`${spec.taskId}: bound file differs: ${binding.path}`);
    }
  }
}

function normalizeHostOptions(input) {
  const options = {
    specPath: resolve(input.specPath),
    candidatesPath: resolve(input.candidatesPath),
    matrixPath: resolve(input.matrixPath),
    outputRoot: resolve(input.outputRoot),
    allowApproved: input.allowApproved === true,
  };
  for (const [key, value] of Object.entries(options)) {
    if (key !== 'allowApproved' && typeof value !== 'string') throw new Error(`${key} is required`);
  }
  return options;
}

function containedPath(root, path) {
  const target = resolve(root, path);
  const relation = relative(root, target);
  if (relation === '..' || relation.startsWith('../') || isAbsolute(relation)) {
    throw new Error(`path escapes workspace: ${path}`);
  }
  return target;
}

function maxPreparationTimeout(spec) {
  return spec.preparation.reduce((sum, command) => sum + command.timeoutMs, 0);
}

function commandVersion(command) {
  const result = runFixed(command, ['--version'], {
    cwd: '/',
    env: process.env,
    timeoutMs: 30_000,
  });
  if (result.exitCode !== 0) throw new Error(`${command} --version failed`);
  return (result.stdout || result.stderr).trim();
}

function normalizeVersion(value) {
  return String(value).trim().replace(/^v/u, '');
}

function resolveImageReference(reference) {
  const output = execFileSync(
    'docker',
    ['image', 'inspect', '--format', '{{join .RepoDigests "\\n"}}', reference],
    { encoding: 'utf8' },
  )
    .trim()
    .split('\n')
    .find((item) => item.startsWith(`${reference.split(':')[0]}@sha256:`));
  if (!output) throw new Error(`pulled image has no immutable repository digest: ${reference}`);
  return output;
}

function dockerImageId(reference) {
  return execFileSync('docker', ['image', 'inspect', '--format', '{{.Id}}', reference], {
    encoding: 'utf8',
  }).trim();
}

function githubExecution() {
  return {
    repository: process.env.GITHUB_REPOSITORY ?? null,
    workflow: process.env.GITHUB_WORKFLOW_REF ?? null,
    sourceCommit: process.env.GITHUB_SHA ?? null,
    sourceRef: process.env.GITHUB_REF ?? null,
    runId: process.env.GITHUB_RUN_ID ?? null,
    runAttempt: process.env.GITHUB_RUN_ATTEMPT ?? null,
    eventName: process.env.GITHUB_EVENT_NAME ?? null,
    runnerEnvironment: process.env.RUNNER_ENVIRONMENT ?? null,
    runnerOs: process.env.RUNNER_OS ?? null,
    runnerArch: process.env.RUNNER_ARCH ?? null,
  };
}

function chownForContainer(...paths) {
  if (process.platform !== 'linux' || typeof process.getuid !== 'function') return;
  runRequired('sudo', ['chown', '-R', '10001:10001', ...paths], repositoryRoot, 300_000);
}

function chownBack(...paths) {
  if (process.platform !== 'linux' || typeof process.getuid !== 'function') return;
  runRequired(
    'sudo',
    ['chown', '-R', `${process.getuid()}:${process.getgid()}`, ...paths],
    repositoryRoot,
    300_000,
  );
}

function runGit(cwd, args, environment, timeoutMs = 120_000) {
  const result = runFixed('git', ['-C', cwd, ...args], {
    cwd,
    env: environment,
    timeoutMs,
  });
  if (result.exitCode !== 0) throw new Error(`git ${args[0]} failed`);
}

function gitOutput(cwd, args, environment) {
  const result = runFixed('git', ['-C', cwd, ...args], {
    cwd,
    env: environment,
    timeoutMs: 120_000,
  });
  if (result.exitCode !== 0) throw new Error(`git ${args[0]} failed`);
  return result.stdout.trim();
}

function runRequired(command, args, cwd, timeoutMs) {
  const result = runFixed(command, args, {
    cwd,
    env: process.env,
    timeoutMs,
    maxBuffer: 8 * 1024 * 1024,
  });
  if (result.exitCode !== 0) {
    throw new Error(`${command} ${args[0] ?? ''} failed: ${result.stderr.slice(-2000)}`);
  }
}

async function prepareEmptyDirectory(path) {
  await rm(path, { recursive: true, force: true });
  await mkdir(path, { recursive: true, mode: 0o700 });
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function safeName(value) {
  return value.replace(/[^a-z0-9.-]+/giu, '-');
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--mode') options.mode = argv[++index];
    else if (argument === '--spec-root') options.specRoot = resolve(argv[++index]);
    else if (argument === '--task-id') options.taskId = argv[++index];
    else if (argument === '--spec') options.specPath = resolve(argv[++index]);
    else if (argument === '--candidates') options.candidatesPath = resolve(argv[++index]);
    else if (argument === '--matrix') options.matrixPath = resolve(argv[++index]);
    else if (argument === '--workspace') options.workspace = resolve(argv[++index]);
    else if (argument === '--out') options.outputPath = resolve(argv[++index]);
    else if (argument === '--output-root') options.outputRoot = resolve(argv[++index]);
    else if (argument === '--allow-approved') options.allowApproved = true;
    else throw new Error(`unknown option: ${argument}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.mode === 'list') {
      process.stdout.write(`${JSON.stringify(await listProbeTasks(options.specRoot, options.taskId))}\n`);
    } else if (options.mode === 'host') {
      const result = await runHostedProbe(options);
      process.stdout.write(
        `${JSON.stringify({ ok: true, subjectPath: result.subjectPath, taskId: result.subject.taskId })}\n`,
      );
    } else if (options.mode === 'container') {
      await runContainerProbe({
        specPath: options.specPath,
        workspace: options.workspace,
        outputPath: options.outputPath,
      });
    } else {
      throw new Error('--mode must be list, host, or container');
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
