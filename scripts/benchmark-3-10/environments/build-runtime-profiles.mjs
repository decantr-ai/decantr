#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJsonFile, writeCanonicalFile } from '../runner/canonical.mjs';
import { assertRuntimeMatrix } from './runtime-matrix.mjs';
import {
  CONTROLLER_CLAUDE_CODE_VERSION,
  CONTROLLER_CODEX_VERSION,
  CONTROLLER_IMAGE_REFERENCE,
  RUNTIME_BUILD_SUBJECT_SCHEMA_VERSION,
  RUNTIME_SIGNER_WORKFLOW,
  assertRuntimeBuildSubject,
  calculateRuntimeBuildSubjectDigest,
  calculateRuntimeSourceClosure,
  runtimeBenchmarkImageReference,
  runtimeArtifactNames,
} from './runtime-profile-attestation.mjs';

const environmentRoot = dirname(fileURLToPath(import.meta.url));
const benchmarkRoot = resolve(environmentRoot, '..');
const repositoryRoot = resolve(benchmarkRoot, '..', '..');
const matrixPath = join(environmentRoot, 'runtime-matrix.draft.json');
const dockerfilePath = join(benchmarkRoot, 'container', 'Dockerfile');

export async function buildRuntimeProfiles(options) {
  assertTrustedOutputRoot(options.outputRoot);
  if (resolve(options.matrixPath) !== matrixPath) {
    throw new Error('runtime profile builds require the reviewed in-repository draft matrix');
  }
  if (options.engine !== 'docker') throw new Error('trusted runtime profile builds require Docker');
  const matrix = assertRuntimeMatrix(await readJsonFile(options.matrixPath));
  if (matrix.status !== 'draft') throw new Error('runtime profiles can only be built from a draft matrix');
  if (Date.parse(options.verifiedAt) < Date.parse(matrix.frozenAt)) {
    throw new Error('runtime profile verification cannot predate the draft matrix');
  }
  const selected = options.profileIds.length === 0
    ? matrix.profiles
    : matrix.profiles.filter((profile) => options.profileIds.includes(profile.id));
  if (selected.length !== (options.profileIds.length || matrix.profiles.length)) {
    throw new Error('one or more requested runtime profile IDs are absent from the matrix');
  }

  const source = await calculateRuntimeSourceClosure({
    repositoryRoot,
    sourceCommit: options.execution.sourceCommit,
  });
  await mkdir(options.outputRoot, { recursive: true });
  const controllerImage = pullAndInspect(options.engine, CONTROLLER_IMAGE_REFERENCE);
  const outputs = [];
  for (const profile of selected) {
    const taskBase = pullAndInspect(options.engine, profile.baseImage.reference);
    const taskImage = `${profile.baseImage.reference}@${taskBase.digest}`;
    run(options.engine, [
      'build',
      '--platform',
      'linux/amd64',
      '--file',
      dockerfilePath,
      '--tag',
      profile.benchmarkImage.reference,
      '--build-arg',
      `TASK_RUNTIME_IMAGE=${taskImage}`,
      '--build-arg',
      `CONTROLLER_IMAGE=${CONTROLLER_IMAGE_REFERENCE}@${controllerImage.digest}`,
      '--build-arg',
      `TASK_RUNTIME_KIND=${profile.nodeVersion ? 'node' : 'bun'}`,
      '--build-arg',
      `TASK_RUNTIME_VERSION=${profile.nodeVersion ?? profile.bunVersion}`,
      '--build-arg',
      `PACKAGE_MANAGER_NAME=${profile.packageManager.name}`,
      '--build-arg',
      `PACKAGE_MANAGER_VERSION=${profile.packageManager.version}`,
      repositoryRoot,
    ], { maxBuffer: 32 * 1024 * 1024 });
    const built = inspectLocalImage(options.engine, profile.benchmarkImage.reference);
    const selfCheck = JSON.parse(
      run(options.engine, [
        'run',
        '--rm',
        '--platform',
        'linux/amd64',
        '--cap-drop=ALL',
        '--security-opt=no-new-privileges:true',
        '--read-only',
        '--tmpfs',
        '/tmp:rw,noexec,nosuid,nodev,size=2g',
        '--tmpfs',
        '/home/benchmark-empty:rw,noexec,nosuid,nodev,size=128m,mode=0700,uid=10001,gid=10001',
        '--network=none',
        profile.benchmarkImage.reference,
        '--self-check',
      ]).trim(),
    );
    const published = pushAndVerifyPublishedImage(
      options.engine,
      profile.benchmarkImage.reference,
      built.configDigest,
      profile.id,
    );
    const subject = {
      schemaVersion: RUNTIME_BUILD_SUBJECT_SCHEMA_VERSION,
      profileId: profile.id,
      profileSha256: profile.profileSha256,
      matrix: {
        draftSha256: matrix.matrixSha256,
        sourceSpecSetSha256: matrix.sourceSpecSetSha256,
      },
      baseImage: { reference: profile.baseImage.reference, digest: taskBase.digest },
      benchmarkImage: {
        reference: published.reference,
        digest: built.configDigest,
      },
      runtimeKind: selfCheck.taskRuntime?.kind,
      runtimeVersion: normalizeVersion(selfCheck.taskRuntime?.version),
      packageManagerName: selfCheck.taskPackageManager?.name,
      packageManagerVersion: normalizeVersion(selfCheck.taskPackageManager?.version),
      controller: {
        image: { reference: CONTROLLER_IMAGE_REFERENCE, digest: controllerImage.digest },
        nodeVersion: selfCheck.controllerNode,
        codexVersion: extractVersion(selfCheck.codex, CONTROLLER_CODEX_VERSION),
        claudeCodeVersion: extractVersion(selfCheck.claude, CONTROLLER_CLAUDE_CODE_VERSION),
      },
      browserSmokePassed: selfCheck.evaluatorRuntime?.ok === true,
      verifiedAt: options.verifiedAt,
      host: { os: 'linux', arch: 'x64' },
      source,
      execution: structuredClone(options.execution),
    };
    subject.subjectSha256 = calculateRuntimeBuildSubjectDigest(subject);
    assertRuntimeBuildSubject(subject);
    const path = join(options.outputRoot, runtimeArtifactNames(profile.id).subject);
    await writeCanonicalFile(path, subject);
    outputs.push({
      profileId: profile.id,
      subjectPath: path,
      imageReference: published.reference,
      imageDigest: built.configDigest,
    });
  }
  return outputs;
}

function pullAndInspect(engine, reference) {
  run(engine, ['pull', '--platform', 'linux/amd64', reference], { maxBuffer: 32 * 1024 * 1024 });
  const image = inspectDockerImage(engine, reference);
  return { digest: findRepositoryDigest(image, reference) };
}

function inspectLocalImage(engine, reference) {
  const image = inspectDockerImage(engine, reference);
  if (!/^sha256:[a-f0-9]{64}$/u.test(image.Id ?? '')) {
    throw new Error(`${reference}: immutable image config digest is unavailable`);
  }
  return { configDigest: image.Id };
}

function pushAndVerifyPublishedImage(engine, tagReference, configDigest, profileId) {
  if (tagReference !== runtimeBenchmarkImageReference(profileId)) {
    throw new Error(`${profileId}: benchmark image tag differs from the reviewed GHCR repository`);
  }
  run(engine, ['push', tagReference], { maxBuffer: 64 * 1024 * 1024 });
  const pushed = inspectDockerImage(engine, tagReference);
  const manifestDigest = findRepositoryDigest(pushed, tagReference);
  const immutableReference = runtimeBenchmarkImageReference(profileId, manifestDigest);
  run(engine, ['pull', '--platform', 'linux/amd64', immutableReference], {
    maxBuffer: 32 * 1024 * 1024,
  });
  const pulled = inspectDockerImage(engine, immutableReference);
  if (
    pulled.Id !== configDigest ||
    findRepositoryDigest(pulled, tagReference) !== manifestDigest
  ) {
    throw new Error(`${profileId}: published benchmark image differs from the verified local build`);
  }
  return { reference: immutableReference, manifestDigest };
}

function inspectDockerImage(engine, reference) {
  const values = JSON.parse(run(engine, ['image', 'inspect', reference]));
  const image = values?.[0];
  if (!image || image.Architecture !== 'amd64' || image.Os !== 'linux') {
    throw new Error(`${reference}: image is not Linux amd64`);
  }
  return image;
}

function findRepositoryDigest(image, reference) {
  return repositoryDigestForReference(image.RepoDigests ?? [], reference);
}

export function repositoryDigestForReference(repoDigests, reference) {
  const repository = repositoryFromReference(reference);
  const matches = repoDigests
    .map((value) => {
      const separator = value.lastIndexOf('@');
      return separator === -1
        ? null
        : { repository: value.slice(0, separator), digest: value.slice(separator + 1) };
    })
    .filter(
      (value) =>
        value &&
        repositoryMatches(value.repository, repository) &&
        /^sha256:[a-f0-9]{64}$/u.test(value.digest),
    );
  if (matches.length !== 1) {
    throw new Error(`${reference}: exact repository manifest digest is unavailable`);
  }
  return matches[0].digest;
}

function repositoryFromReference(reference) {
  const withoutDigest = reference.split('@')[0];
  const slash = withoutDigest.lastIndexOf('/');
  const colon = withoutDigest.lastIndexOf(':');
  return colon > slash ? withoutDigest.slice(0, colon) : withoutDigest;
}

function repositoryMatches(actual, expected) {
  return actual === expected || actual.endsWith(`/${expected}`);
}

function extractVersion(value, expected) {
  if (!String(value).includes(expected)) throw new Error(`controller self-check omitted ${expected}`);
  return expected;
}

function normalizeVersion(value) {
  return String(value ?? '').trim().replace(/^v/u, '');
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    maxBuffer: options.maxBuffer ?? 8 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function assertTrustedOutputRoot(outputRoot) {
  if (typeof outputRoot !== 'string' || outputRoot.length === 0) throw new Error('--out is required');
  const absolute = resolve(outputRoot);
  const relation = relative(repositoryRoot, absolute);
  if (relation === '' || (relation !== '..' && !relation.startsWith(`..${sep}`))) {
    throw new Error('runtime profile evidence must be written outside the Docker build context');
  }
}

function executionIdentityFromEnvironment(environment) {
  return {
    repository: requiredEnvironment(environment, 'GITHUB_REPOSITORY'),
    workflow: RUNTIME_SIGNER_WORKFLOW,
    workflowRef: requiredEnvironment(environment, 'GITHUB_WORKFLOW_REF'),
    workflowSha: requiredEnvironment(environment, 'GITHUB_WORKFLOW_SHA'),
    sourceCommit: requiredEnvironment(environment, 'GITHUB_SHA'),
    sourceRef: requiredEnvironment(environment, 'GITHUB_REF'),
    runId: requiredEnvironment(environment, 'GITHUB_RUN_ID'),
    runAttempt: requiredEnvironment(environment, 'GITHUB_RUN_ATTEMPT'),
    job: requiredEnvironment(environment, 'GITHUB_JOB'),
    eventName: requiredEnvironment(environment, 'GITHUB_EVENT_NAME'),
    runnerEnvironment: requiredEnvironment(environment, 'RUNNER_ENVIRONMENT'),
    runnerOs: requiredEnvironment(environment, 'RUNNER_OS'),
    runnerArch: requiredEnvironment(environment, 'RUNNER_ARCH'),
    runnerImage: requiredEnvironment(environment, 'ImageOS'),
    runnerImageVersion: requiredEnvironment(environment, 'ImageVersion'),
  };
}

function requiredEnvironment(environment, key) {
  const value = environment[key];
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${key} is required`);
  return value;
}

function parseArgs(argv, environment = process.env) {
  const options = {
    engine: 'docker',
    matrixPath,
    outputRoot: null,
    profileIds: [],
    verifiedAt: new Date().toISOString(),
    execution: executionIdentityFromEnvironment(environment),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--out') options.outputRoot = resolve(argv[++index]);
    else if (argument === '--profile') options.profileIds.push(argv[++index]);
    else if (argument === '--verified-at') options.verifiedAt = argv[++index];
    else throw new Error(`Unknown option: ${argument}`);
  }
  if (!options.outputRoot) throw new Error('--out is required');
  if (!Number.isFinite(Date.parse(options.verifiedAt))) throw new Error('--verified-at must be a timestamp');
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const outputs = await buildRuntimeProfiles(parseArgs(process.argv.slice(2)));
    console.log(JSON.stringify({ ok: true, count: outputs.length, outputs }, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
