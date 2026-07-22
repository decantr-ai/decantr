#!/usr/bin/env node
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  prettyCanonicalJson,
  readJsonFile,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from '../runner/canonical.mjs';
import {
  assertRunPlan,
  assertTaskManifest,
  expectedReviewSeed,
} from '../runner/contracts.mjs';
import { resolveContained } from '../runner/process.mjs';

export async function prepareReviewKit(options) {
  if (typeof options.seed !== 'string' || options.seed.length < 16) {
    throw new Error('review randomization requires an explicit seed of at least 16 characters');
  }
  if (!Array.isArray(options.reviewers) || options.reviewers.length !== 2 || new Set(options.reviewers).size !== 2) {
    throw new Error('exactly two distinct blinded reviewer identifiers are required');
  }
  const plan = assertRunPlan(await readJsonFile(options.planPath));
  if (options.seed !== expectedReviewSeed(plan.seed)) {
    throw new Error('review seed does not match the deterministic derivative of the committed plan seed');
  }
  const qualificationRuns = plan.runs.filter((run) => run.partition === 'qualification');
  const records = await loadRunRecords(options.recordRoot, qualificationRuns);
  const recordSetSha256 = sha256Canonical(
    [...records.values()]
      .map((item) => ({ runId: item.record.runId, recordSha256: item.sha256 }))
      .sort((left, right) => left.runId.localeCompare(right.runId)),
  );
  const blindedRoot = join(options.outputRoot, 'blinded');
  const privateRoot = join(options.outputRoot, 'private');
  await mkdir(join(blindedRoot, 'artifacts'), { recursive: true });
  await mkdir(privateRoot, { recursive: true });

  const groups = groupQualificationRuns(qualificationRuns);
  const privateAssignments = [];
  const blindedAssignments = [];
  const preferenceUnitIds = new Set();
  for (const group of groups) {
    const taskBinding = plan.tasks.find((task) => task.taskId === group.taskId);
    const taskPath = resolveContained(
      options.qualificationTaskRoot,
      taskBinding.sourceRef,
      `${group.taskId}: qualification task`,
    );
    const taskBytes = await readFile(taskPath);
    if (sha256(taskBytes) !== taskBinding.manifestSha256) {
      throw new Error(`${group.taskId}: qualification task bytes do not match the sealed run plan`);
    }
    const task = assertTaskManifest(JSON.parse(taskBytes), 'qualification');
    const ordered = deterministicLabels(group.runs, `${options.seed}:${group.key}`);
    const assignmentId = `assignment-${sha256(`${options.seed}:${group.key}`).slice(0, 20)}`;
    const preferenceUnitId = calculatePreferenceUnitId(options.seed, group.taskId, group.modelId);
    preferenceUnitIds.add(preferenceUnitId);
    const privateCandidates = [];
    const publicCandidates = [];
    for (let index = 0; index < ordered.length; index += 1) {
      const label = index === 0 ? 'A' : 'B';
      const run = ordered[index];
      const recordEntry = records.get(run.runId);
      const artifactId = `artifact-${sha256(`${assignmentId}:${label}`).slice(0, 20)}`;
      const artifact = await buildBlindedArtifact({
        artifactId,
        task,
        record: recordEntry.record,
        recordRoot: options.recordRoot,
        externalArtifactRoot: options.externalArtifactRoot,
        outputDirectory: join(blindedRoot, 'artifacts'),
        redactions: [
          run.runId,
          run.modelId,
          run.requestedModel,
          recordEntry.record.model.returnedModel,
          recordEntry.record.model.provider,
        ].filter(Boolean),
      });
      const artifactPath = join(blindedRoot, 'artifacts', `${artifactId}.json`);
      await writeCanonicalFile(artifactPath, artifact);
      assertBlindedBytes(await readFile(artifactPath, 'utf8'), {
        forbidden: [run.runId, run.modelId, run.requestedModel, 'Decantr'],
      });
      privateCandidates.push({
        label,
        artifactId,
        runId: run.runId,
        arm: run.arm,
        modelId: run.modelId,
        repetition: run.repetition,
        recordSha256: recordEntry.sha256,
      });
      publicCandidates.push({ label, artifactId, path: `artifacts/${artifactId}.json` });
    }
    privateAssignments.push({
      assignmentId,
      preferenceUnitId,
      taskId: group.taskId,
      framework: group.framework,
      candidates: privateCandidates,
    });
    blindedAssignments.push({
      assignmentId,
      task: {
        prompt: redactText(task.prompt, ['Decantr']),
        scope: {
          allowedPaths: task.scope.allowedPaths.filter((path) => !isIdentifyingPath(path)),
          forbiddenPaths: task.scope.forbiddenPaths.filter((path) => !isIdentifyingPath(path)),
        },
      },
      candidates: publicCandidates,
    });
  }

  const assignments = {
    schemaVersion: 'decantr-benchmark-review-assignments.v1',
    seed: options.seed,
    runPlanSha256: plan.planSha256,
    recordSetSha256,
    assignments: privateAssignments,
  };
  const assignmentsPath = join(privateRoot, 'assignments.json');
  await writeCanonicalFile(assignmentsPath, assignments);
  const assignmentsSha256 = sha256(await readFile(assignmentsPath));
  const blindedManifest = {
    schemaVersion: 'ui-change-review-kit.v1',
    blinded: true,
    assignmentsSha256,
    assignments: blindedAssignments,
  };
  const blindedManifestPath = join(blindedRoot, 'manifest.json');
  await writeCanonicalFile(blindedManifestPath, blindedManifest);
  assertBlindedBytes(await readFile(blindedManifestPath, 'utf8'), { forbidden: ['Decantr'] });
  const workbook = {
    schemaVersion: 'ui-change-review-workbook.v1',
    blinded: true,
    assignmentsSha256,
    reviewers: options.reviewers,
    reviews: [],
    adjudications: [],
  };
  const workbookPath = join(blindedRoot, 'review-workbook.template.json');
  await writeCanonicalFile(workbookPath, workbook);
  assertBlindedBytes(await readFile(workbookPath, 'utf8'), { forbidden: ['Decantr'] });
  return {
    assignmentsPath,
    assignmentsSha256,
    blindedRoot,
    assignmentCount: privateAssignments.length,
    preferenceUnitCount: preferenceUnitIds.size,
    recordSetSha256,
  };
}

async function buildBlindedArtifact(options) {
  const changePath = join(
    options.recordRoot,
    'workspace-changes',
    'sha256',
    `${options.record.workspace.diffSha256}.json`,
  );
  let change = null;
  try {
    const bytes = await readFile(changePath);
    if (sha256(bytes) !== options.record.workspace.diffSha256) {
      throw new Error(`${options.record.runId}: workspace-change content-address digest mismatch`);
    }
    change = JSON.parse(bytes);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  const screenshots = options.externalArtifactRoot
    ? await copySanitizedPngs(
        join(options.externalArtifactRoot, options.record.runId),
        join(options.outputDirectory, `${options.artifactId}.evidence`),
      )
    : [];
  return {
    schemaVersion: 'ui-change-review-artifact.v1',
    artifactId: options.artifactId,
    candidateAvailable: options.record.status === 'completed' && change !== null,
    change: change
      ? {
          diff: redactText(stripIdentifyingDiff(change.diff ?? ''), options.redactions),
          changedPaths: (change.changedPaths ?? []).filter((path) => !isIdentifyingPath(path)),
        }
      : { diff: '', changedPaths: [] },
    screenshots,
  };
}

function stripIdentifyingDiff(diff) {
  const sections = diff.split(/(?=^diff --git )/gmu);
  return sections.filter((section) => !isIdentifyingDiffSection(section)).join('');
}

function isIdentifyingDiffSection(section) {
  const header = section.split('\n', 1)[0] ?? '';
  return isIdentifyingPath(header);
}

function isIdentifyingPath(value) {
  return (
    /(^|[ /])\.decantr(?:[/ ]|$)/iu.test(value) ||
    /DECANTR\.md/iu.test(value) ||
    /decantr\.essence\.json/iu.test(value) ||
    /decantr\.mdc/iu.test(value)
  );
}

function redactText(value, redactions) {
  let output = value.replace(/decantr/giu, '[PRODUCT]');
  for (const redaction of redactions) {
    if (!redaction) continue;
    output = output.split(redaction).join('[REDACTED]');
  }
  return output;
}

async function copySanitizedPngs(source, destination) {
  let entries;
  try {
    entries = await readdir(source, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
  const pngs = entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.png'));
  if (pngs.length === 0) return [];
  await mkdir(destination, { recursive: true });
  const output = [];
  for (let index = 0; index < pngs.length; index += 1) {
    const bytes = await readFile(join(source, pngs[index].name));
    const sanitized = stripPngMetadata(bytes);
    const name = `evidence-${String(index + 1).padStart(3, '0')}.png`;
    await writeFile(join(destination, name), sanitized, { mode: 0o600 });
    output.push({ path: `${basename(destination)}/${name}`, sha256: sha256(sanitized) });
  }
  return output;
}

export function stripPngMetadata(bytes) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (bytes.length < 8 || !bytes.subarray(0, 8).equals(signature)) throw new Error('review evidence is not a valid PNG');
  const retained = [signature];
  const allowed = new Set(['IHDR', 'PLTE', 'IDAT', 'IEND', 'tRNS', 'gAMA', 'cHRM', 'sRGB', 'pHYs']);
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const end = offset + 12 + length;
    if (end > bytes.length) throw new Error('PNG chunk length is invalid');
    const type = bytes.subarray(offset + 4, offset + 8).toString('ascii');
    if (allowed.has(type)) retained.push(bytes.subarray(offset, end));
    offset = end;
    if (type === 'IEND') break;
  }
  return Buffer.concat(retained);
}

async function loadRunRecords(recordRoot, expectedRuns) {
  const output = new Map();
  for (const run of expectedRuns) {
    const indexPath = join(recordRoot, 'run-index', `${run.runId}.json`);
    let index;
    try {
      index = await readJsonFile(indexPath);
    } catch (error) {
      throw new Error(`${run.runId}: run record index is missing (${error.message})`);
    }
    const recordPath = join(recordRoot, 'run-records', 'sha256', `${index.recordSha256}.json`);
    const bytes = await readFile(recordPath);
    if (sha256(bytes) !== index.recordSha256) {
      throw new Error(`${run.runId}: content-addressed run record digest mismatch`);
    }
    const record = JSON.parse(bytes);
    if (record.runId !== run.runId) throw new Error(`${run.runId}: run record identity mismatch`);
    output.set(run.runId, { record, sha256: index.recordSha256 });
  }
  return output;
}

function groupQualificationRuns(runs) {
  const groups = new Map();
  for (const run of runs) {
    const key = `${run.taskId}:${run.modelId}:${run.repetition}`;
    const group = groups.get(key) ?? {
      key,
      taskId: run.taskId,
      framework: run.framework,
      modelId: run.modelId,
      repetition: run.repetition,
      runs: [],
    };
    group.runs.push(run);
    groups.set(key, group);
  }
  for (const group of groups.values()) {
    if (group.runs.length !== 2 || new Set(group.runs.map((run) => run.arm)).size !== 2) {
      throw new Error(`${group.key}: review assignment requires exactly one control and one treatment run`);
    }
  }
  return [...groups.values()].sort((left, right) => left.key.localeCompare(right.key));
}

function calculatePreferenceUnitId(seed, taskId, modelId) {
  return `preference-unit-${sha256Canonical({ seed, taskId, modelId }).slice(0, 20)}`;
}

function deterministicLabels(runs, seed) {
  return [...runs].sort((left, right) =>
    sha256(`${seed}:${left.runId}`).localeCompare(sha256(`${seed}:${right.runId}`)),
  );
}

function assertBlindedBytes(value, options) {
  for (const token of options.forbidden) {
    if (token && value.toLowerCase().includes(token.toLowerCase())) {
      throw new Error(`blinded artifact still contains identifying token: ${token}`);
    }
  }
  if (/"(?:arm|modelId|provider|requestedModel|returnedModel|runId)"\s*:/u.test(value)) {
    throw new Error('blinded artifact contains an identifying metadata field');
  }
}

function parseArgs(argv) {
  const options = { reviewers: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--plan') options.planPath = resolve(argv[++index]);
    else if (argument === '--record-root') options.recordRoot = resolve(argv[++index]);
    else if (argument === '--qualification-task-root') options.qualificationTaskRoot = resolve(argv[++index]);
    else if (argument === '--external-artifact-root') options.externalArtifactRoot = resolve(argv[++index]);
    else if (argument === '--out') options.outputRoot = resolve(argv[++index]);
    else if (argument === '--seed') options.seed = argv[++index];
    else if (argument === '--reviewer') options.reviewers.push(argv[++index]);
    else throw new Error(`Unknown option: ${argument}`);
  }
  for (const name of ['planPath', 'recordRoot', 'qualificationTaskRoot', 'outputRoot', 'seed']) {
    if (!options[name]) throw new Error(`Missing required option: ${name}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await prepareReviewKit(parseArgs(process.argv.slice(2)));
    console.log(prettyCanonicalJson({ ok: true, ...result }).trim());
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
