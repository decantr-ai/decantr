#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  readJsonFile,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from '../runner/canonical.mjs';
import { assertTaskEnvironmentSpec } from './contracts.mjs';

const directory = dirname(fileURLToPath(import.meta.url));
const benchmarkRoot = resolve(directory, '..');
const repositoryRoot = resolve(benchmarkRoot, '..', '..');
const sha256Pattern = /^[a-f0-9]{64}$/u;
const imageDigestPattern = /^sha256:[a-f0-9]{64}$/u;

export async function approveHostedProbes(input) {
  const options = normalizeOptions(input);
  const sourceCommit =
    options.sourceCommit ??
    gitText(options.repositoryRoot, ['rev-parse', '--verify', 'HEAD^{commit}']);
  if (!/^[a-f0-9]{40}$/u.test(sourceCommit)) {
    throw new Error('hosted probe approval requires an exact Git commit');
  }
  if (
    options.requireClean &&
    gitText(options.repositoryRoot, ['status', '--porcelain=v1', '--untracked-files=all']) !== ''
  ) {
    throw new Error('hosted probe approval requires a clean controller checkout');
  }

  const [candidates, matrix, evidenceFiles] = await Promise.all([
    readJsonFile(options.candidatesPath),
    readJsonFile(options.matrixPath),
    listRegularFiles(options.evidenceRoot),
  ]);
  const candidateByTask = new Map(
    (candidates.records ?? []).map((candidate) => [candidate.taskId, candidate]),
  );
  const profileById = new Map((matrix.profiles ?? []).map((profile) => [profile.id, profile]));
  const evidenceByName = indexUniqueBasenames(evidenceFiles);
  const specFiles = (await readdir(options.specRoot))
    .filter((file) => file.endsWith('.json'))
    .sort();
  const selected = [];

  for (const file of specFiles) {
    const specPath = join(options.specRoot, file);
    const specBytes = await readFile(specPath);
    const spec = assertTaskEnvironmentSpec(JSON.parse(specBytes));
    if (spec.review.status !== 'draft') continue;
    if (options.taskIds.size > 0 && !options.taskIds.has(spec.taskId)) continue;
    selected.push({ spec, specBytes, specPath });
  }
  if (options.taskIds.size > 0 && selected.length !== options.taskIds.size) {
    throw new Error('one or more requested draft environment specs are absent');
  }
  if (selected.length === 0) throw new Error('no draft environment specs were selected');

  const selectedTaskIds = new Set(selected.map(({ spec }) => spec.taskId));
  const suppliedSubjects = evidenceFiles
    .filter((path) => path.endsWith('.subject.json'))
    .map((path) => basename(path, '.subject.json'));
  const unexpectedSubjects = suppliedSubjects.filter((taskId) => !selectedTaskIds.has(taskId));
  if (unexpectedSubjects.length > 0) {
    throw new Error(`unexpected hosted probe subjects: ${unexpectedSubjects.join(', ')}`);
  }

  const approvals = [];
  for (const item of selected) {
    const { spec, specBytes, specPath } = item;
    const candidate = candidateByTask.get(spec.taskId);
    const profile = profileById.get(spec.profile.id);
    if (!candidate || !profile) {
      throw new Error(`${spec.taskId}: frozen candidate or runtime profile is absent`);
    }
    const subjectPath = requireEvidencePath(evidenceByName, `${spec.taskId}.subject.json`);
    const containerResultPath = requireEvidencePath(
      evidenceByName,
      `${spec.taskId}.container-result.json`,
    );
    const provenancePath = requireEvidencePath(
      evidenceByName,
      `${spec.taskId}.provenance.jsonl`,
    );
    const retainedVerificationPath = requireEvidencePath(
      evidenceByName,
      `${spec.taskId}.provenance-verification.json`,
    );
    const [subject, containerResult, retainedVerification] = await Promise.all([
      readJsonFile(subjectPath),
      readJsonFile(containerResultPath),
      readJsonFile(retainedVerificationPath),
    ]);
    assertHostedProbeEvidence({
      subject,
      containerResult,
      retainedVerification,
      spec,
      specBytes,
      specPath,
      candidate,
      profile,
      repositoryRoot: options.repositoryRoot,
      repository: options.repository,
      workflowFile: options.workflowFile,
      sourceCommit,
      runId: options.runId,
    });
    await options.provenanceVerifier({
      subjectPath,
      provenancePath,
      repository: options.repository,
      workflowFile: options.workflowFile,
      sourceCommit,
    });

    const approved = structuredClone(spec);
    approved.review = {
      status: 'approved',
      reviewedBy: options.reviewedBy,
      reviewedAt: options.reviewedAt,
      notes: approvalNotes(spec.review.notes, subject),
    };
    assertTaskEnvironmentSpec(approved, candidate, { reviewStatus: 'approved' });
    approvals.push({
      taskId: spec.taskId,
      specPath,
      approved,
      subjectSha256: subject.subjectSha256,
      runId: subject.execution.runId,
      image: subject.benchmarkImage.resolved,
    });
  }

  if (options.apply) {
    for (const approval of approvals) {
      await writeCanonicalFile(approval.specPath, approval.approved);
    }
  }
  return {
    applied: options.apply,
    approved: approvals.length,
    sourceCommit,
    tasks: approvals.map(({ specPath: _ignored, approved: _approved, ...summary }) => summary),
  };
}

export function assertHostedProbeEvidence(input) {
  const {
    subject,
    containerResult,
    retainedVerification,
    spec,
    specBytes,
    specPath,
    candidate,
    profile,
    repositoryRoot: root,
    repository,
    workflowFile,
    sourceCommit,
    runId,
  } = input;
  const expectedWorkflow = `${repository}/.github/workflows/${workflowFile}@refs/heads/main`;
  const expectedSpecPath = relative(root, specPath).replaceAll('\\', '/');
  const expectedRuntime = spec.profile.nodeVersion ?? spec.profile.bunVersion;
  const expectedResolvedPrefix = `${untaggedImageReference(profile.benchmarkImage.reference)}@sha256:`;

  if (
    subject?.schemaVersion !== 'decantr-benchmark-task-environment-probe-subject.v1' ||
    subject.program !== 'decantr-3.10-ui-change-control-proof' ||
    subject.taskId !== spec.taskId ||
    subject.partition !== spec.partition ||
    subject.success !== true ||
    subject.subjectSha256 !==
      sha256Canonical(withoutKey(subject, 'subjectSha256'))
  ) {
    throw new Error(`${spec.taskId}: hosted probe subject is invalid`);
  }
  if (
    subject.source?.repository !== candidate.repository.url ||
    subject.source?.commit !== spec.base.commit ||
    subject.source?.tree !== spec.base.tree ||
    subject.source?.projectPath !== spec.projectPath
  ) {
    throw new Error(`${spec.taskId}: hosted probe source binding differs`);
  }
  if (
    subject.spec?.path !== expectedSpecPath ||
    subject.spec?.sha256 !== sha256(specBytes) ||
    subject.spec?.reviewStatusAtProbe !== 'draft'
  ) {
    throw new Error(`${spec.taskId}: hosted probe spec binding differs`);
  }
  if (sha256Canonical(subject.profile) !== sha256Canonical(spec.profile)) {
    throw new Error(`${spec.taskId}: hosted probe profile differs`);
  }
  if (
    subject.benchmarkImage?.requested !== profile.benchmarkImage.reference ||
    typeof subject.benchmarkImage?.resolved !== 'string' ||
    !subject.benchmarkImage.resolved.startsWith(expectedResolvedPrefix) ||
    !imageDigestPattern.test(subject.benchmarkImage.resolved.split('@').at(-1) ?? '') ||
    !imageDigestPattern.test(subject.benchmarkImage.imageId ?? '')
  ) {
    throw new Error(`${spec.taskId}: hosted probe image binding differs`);
  }
  if (
    subject.execution?.repository !== repository ||
    subject.execution?.workflow !== expectedWorkflow ||
    subject.execution?.sourceCommit !== sourceCommit ||
    subject.execution?.sourceRef !== 'refs/heads/main' ||
    subject.execution?.eventName !== 'workflow_dispatch' ||
    subject.execution?.runnerEnvironment !== 'github-hosted' ||
    subject.execution?.runnerOs !== 'Linux' ||
    subject.execution?.runnerArch !== 'X64' ||
    typeof subject.execution?.runAttempt !== 'string' ||
    !/^[1-9][0-9]*$/u.test(subject.execution.runAttempt) ||
    typeof subject.execution?.runId !== 'string' ||
    !/^[1-9][0-9]*$/u.test(subject.execution.runId) ||
    (runId !== null && subject.execution.runId !== runId)
  ) {
    throw new Error(`${spec.taskId}: hosted probe execution identity differs`);
  }
  if (
    subject.cleanWorktree?.before !== true ||
    subject.cleanWorktree?.after !== true ||
    subject.cleanWorktree?.requiredAfter !== true
  ) {
    throw new Error(`${spec.taskId}: hosted probe did not preserve a clean worktree`);
  }
  if (
    sha256Canonical(subject.preparation) !== sha256Canonical(containerResult) ||
    containerResult?.schemaVersion !==
      'decantr-benchmark-task-environment-container-probe.v1' ||
    containerResult.taskId !== spec.taskId ||
    containerResult.ok !== true ||
    normalizeVersion(containerResult.versions?.runtime) !== normalizeVersion(expectedRuntime) ||
    normalizeVersion(containerResult.versions?.packageManager) !==
      normalizeVersion(spec.profile.packageManager.version) ||
    containerResult.benchmarkImage !== subject.benchmarkImage.resolved ||
    !Array.isArray(containerResult.commands) ||
    containerResult.commands.length !== spec.preparation.length
  ) {
    throw new Error(`${spec.taskId}: hosted preparation result differs`);
  }
  for (let index = 0; index < spec.preparation.length; index += 1) {
    const expected = spec.preparation[index];
    const actual = containerResult.commands[index];
    if (
      actual?.id !== expected.id ||
      actual.executable !== expected.executable ||
      sha256Canonical(actual.args) !== sha256Canonical(expected.args) ||
      actual.cwd !== expected.cwd ||
      actual.network !== expected.network ||
      actual.required !== true ||
      actual.exitCode !== 0 ||
      actual.signal !== null ||
      !Number.isInteger(actual.durationMs) ||
      actual.durationMs < 0 ||
      !sha256Pattern.test(actual.stdoutSha256 ?? '') ||
      !sha256Pattern.test(actual.stderrSha256 ?? '')
    ) {
      throw new Error(`${spec.taskId}: hosted preparation command ${expected.id} differs`);
    }
  }
  if (
    retainedVerification === null ||
    typeof retainedVerification !== 'object' ||
    (Array.isArray(retainedVerification) && retainedVerification.length === 0)
  ) {
    throw new Error(`${spec.taskId}: retained provenance verification is empty`);
  }
  return subject;
}

async function verifyProvenance(input) {
  execFileSync(
    'gh',
    [
      'attestation',
      'verify',
      input.subjectPath,
      '--repo',
      input.repository,
      '--bundle',
      input.provenancePath,
      '--signer-workflow',
      `${input.repository}/.github/workflows/${input.workflowFile}`,
      '--source-digest',
      input.sourceCommit,
      '--source-ref',
      'refs/heads/main',
      '--predicate-type',
      'https://slsa.dev/provenance/v1',
      '--deny-self-hosted-runners',
      '--format',
      'json',
    ],
    { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 },
  );
}

function approvalNotes(existing, subject) {
  return `${existing.trim()} Approved by the sole maintainer after independent review of the frozen source, lockfile, runtime, and preparation contract and successful exact GitHub-hosted Linux x64 probe run ${subject.execution.runId}, attempt ${subject.execution.runAttempt}. Offline OIDC provenance re-verification bound source commit ${subject.execution.sourceCommit}, subject ${subject.subjectSha256}, immutable image ${subject.benchmarkImage.resolved}, zero failed required commands, and a clean worktree before and after preparation.`;
}

async function listRegularFiles(root) {
  const output = [];
  async function visit(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`evidence path must not be a symlink: ${path}`);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) {
        if (!(await lstat(path)).isFile()) throw new Error(`evidence path must be a regular file: ${path}`);
        output.push(path);
      }
    }
  }
  await visit(root);
  return output.sort();
}

function indexUniqueBasenames(paths) {
  const output = new Map();
  for (const path of paths) {
    const name = basename(path);
    if (output.has(name)) throw new Error(`duplicate evidence filename: ${name}`);
    output.set(name, path);
  }
  return output;
}

function requireEvidencePath(index, name) {
  const path = index.get(name);
  if (!path) throw new Error(`missing hosted probe evidence: ${name}`);
  return path;
}

function normalizeOptions(input) {
  const options = {
    repositoryRoot: resolve(input.repositoryRoot ?? repositoryRoot),
    specRoot: resolve(input.specRoot),
    candidatesPath: resolve(input.candidatesPath),
    matrixPath: resolve(input.matrixPath),
    evidenceRoot: resolve(input.evidenceRoot),
    repository: input.repository,
    workflowFile: input.workflowFile,
    runId: input.runId === undefined || input.runId === null ? null : String(input.runId),
    reviewedBy: input.reviewedBy,
    reviewedAt: input.reviewedAt,
    taskIds: new Set(input.taskIds ?? []),
    apply: input.apply === true,
    requireClean: input.requireClean !== false,
    sourceCommit: input.sourceCommit ?? null,
    provenanceVerifier: input.provenanceVerifier ?? verifyProvenance,
  };
  for (const key of ['specRoot', 'candidatesPath', 'matrixPath', 'evidenceRoot']) {
    if (typeof input[key] !== 'string' || input[key].length === 0) {
      throw new Error(`${key} is required`);
    }
  }
  if (
    !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(options.repository ?? '') ||
    !/^benchmark-3-10-[a-z0-9-]+\.yml$/u.test(options.workflowFile ?? '') ||
    typeof options.reviewedBy !== 'string' ||
    options.reviewedBy.trim() === '' ||
    !Number.isFinite(Date.parse(options.reviewedAt))
  ) {
    throw new Error('repository, workflowFile, reviewedBy, and reviewedAt are required');
  }
  if (options.runId !== null && !/^[1-9][0-9]*$/u.test(options.runId)) {
    throw new Error('runId must be a GitHub Actions run ID');
  }
  return options;
}

function normalizeVersion(value) {
  return String(value ?? '').trim().replace(/^v/u, '');
}

function untaggedImageReference(reference) {
  const separator = reference.lastIndexOf(':');
  const slash = reference.lastIndexOf('/');
  return separator > slash ? reference.slice(0, separator) : reference;
}

function withoutKey(value, key) {
  const output = structuredClone(value);
  delete output[key];
  return output;
}

function gitText(root, args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim();
}

function parseArgs(argv) {
  const options = { taskIds: [], apply: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--spec-root') options.specRoot = argv[++index];
    else if (argument === '--candidates') options.candidatesPath = argv[++index];
    else if (argument === '--matrix') options.matrixPath = argv[++index];
    else if (argument === '--evidence-root') options.evidenceRoot = argv[++index];
    else if (argument === '--repository') options.repository = argv[++index];
    else if (argument === '--workflow') options.workflowFile = argv[++index];
    else if (argument === '--run-id') options.runId = argv[++index];
    else if (argument === '--reviewed-by') options.reviewedBy = argv[++index];
    else if (argument === '--reviewed-at') options.reviewedAt = argv[++index];
    else if (argument === '--repository-root') options.repositoryRoot = argv[++index];
    else if (argument === '--source-commit') options.sourceCommit = argv[++index];
    else if (argument === '--task-id') options.taskIds.push(argv[++index]);
    else if (argument === '--apply') options.apply = true;
    else throw new Error(`unknown option: ${argument}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await approveHostedProbes(parseArgs(process.argv.slice(2)));
    process.stdout.write(`${JSON.stringify({ ok: true, ...result }, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
