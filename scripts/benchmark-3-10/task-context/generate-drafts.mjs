#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, realpathSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverProject, resolveUISurfaceTaskContext } from '../../../packages/verifier/dist/index.js';
import { checkoutDirectory } from '../lib.mjs';
import { readJsonFile, sha256Canonical, writeCanonicalFile } from '../runner/canonical.mjs';

const benchmarkRoot = resolve(new URL('..', import.meta.url).pathname);
const repositoryRoot = resolve(benchmarkRoot, '..', '..');
const forbiddenAuthorityPattern =
  '(^|/)(?:__tests__|coverage|dist|build|fixtures?|mocks?|specs?|stories|tests?)(?:/|$)|\\.(?:test|spec|stories?)\\.';

export async function generateTaskDeliveryDrafts(options) {
  const development = await readJsonFile(options.developmentCandidatesPath);
  const qualification = await readJsonFile(options.qualificationCandidatesPath);
  assertCandidatePartitions(development.records, 'development');
  assertCandidatePartitions(qualification.records, 'qualification');
  const records = [...development.records, ...qualification.records];
  const drafts = [];
  for (const record of records) drafts.push(await draftRecord(record, options));
  const developmentDrafts = drafts.filter((draft) => draft.partition === 'development');
  const qualificationDrafts = drafts.filter((draft) => draft.partition === 'qualification');
  await writeCanonicalFile(options.developmentOutputPath, bundle(developmentDrafts, false));
  await writeCanonicalFile(options.qualificationOutputPath, bundle(qualificationDrafts, true));
  return {
    total: drafts.length,
    development: developmentDrafts.length,
    qualification: qualificationDrafts.length,
    unresolved: drafts.filter((draft) => draft.observation.status === 'blocked').map((draft) => draft.taskId),
    fileFallbacks: drafts.filter((draft) => draft.observation.fileFallback).map((draft) => draft.taskId),
    rankOneMismatches: drafts
      .filter((draft) => !draft.observation.rankOneMatchesOracle)
      .map((draft) => draft.taskId),
  };
}

async function draftRecord(record, options) {
  const clone = join(options.corpusRoot, checkoutDirectory(`${record.repository.url}.git`));
  const worktree = mkdtempSync(join(tmpdir(), 'decantr-3-10-task-base-'));
  rmSync(worktree, { recursive: true, force: true });
  git(clone, ['worktree', 'add', '--detach', worktree, record.base.commit]);
  try {
    const { projectRoot, projectPath } = resolveContainedProject(worktree, record);
    const discovery = discoverProject(projectRoot);
    const changedFiles = git(clone, [
      'diff',
      '--name-only',
      '--diff-filter=ACMR',
      record.base.commit,
      record.expected.commit,
      '--',
      projectPath,
    ])
      .split('\n')
      .filter(Boolean)
      .map((file) => stripProjectPrefix(file, projectPath));
    const productionChangedFiles = changedFiles.filter(isProductionTaskFile);
    const existingProductionChangedFiles = productionChangedFiles.filter((file) =>
      existsAtProjectRoot(projectRoot, file),
    );
    const candidates = rankSurfaceCandidates(
      discovery.surfaces.items,
      existingProductionChangedFiles,
      record.prompt,
    );
    const selected = candidates[0] ?? null;
    let selector = selected
      ? semanticSelector(selected)
      : existingProductionChangedFiles[0]
        ? `file:${existingProductionChangedFiles[0]}`
        : 'package:package.json';
    let context = resolveUISurfaceTaskContext(discovery, selector);
    let exactDisambiguation = false;
    if (selected && context.status === 'blocked' && context.candidates.length > 1) {
      selector = selected.id;
      context = resolveUISurfaceTaskContext(discovery, selector);
      exactDisambiguation = true;
    }
    const expectedFiles = selected
      ? selected.files.filter((file) => existingProductionChangedFiles.includes(file))
      : existingProductionChangedFiles;
    const rankOne = context.read.find((target) => target.rank === 1)?.file ?? null;
    return {
      schemaVersion: 'decantr-benchmark-task-delivery-draft.v1',
      taskId: record.taskId,
      ...(record.opaqueId ? { opaqueId: record.opaqueId } : {}),
      partition: record.partition,
      input: {
        target: { selector },
        policyCard: sharedPolicyCard(record),
      },
      oracle: {
        expectedKind: selected?.kind ?? context.surface?.kind ?? 'package',
        acceptedStatuses: selected?.kind === 'route' ? ['ready', 'limited'] : ['limited'],
        rankOneFiles: expectedFiles.length > 0 ? expectedFiles : productionChangedFiles.slice(0, 1),
        forbiddenRankOnePatterns: [forbiddenAuthorityPattern],
        styleAuthority: {
          approach: discovery.styling.approach,
          confidence: discovery.styling.confidence,
          files: discovery.styling.authorityFiles,
        },
      },
      observation: {
        status: context.status,
        surfaceId: context.surface?.id ?? null,
        candidateCount: context.candidates.length,
        rankOneFile: rankOne,
        rankOneMatchesOracle: Boolean(rankOne && expectedFiles.includes(rankOne)),
        readTargetCount: context.read.length,
        fileFallback: !selected,
        exactDisambiguation,
        changedFiles,
        productionChangedFiles,
        existingProductionChangedFiles,
        suggestedCandidates: candidates.slice(0, 5).map((surface) => ({
          id: surface.id,
          kind: surface.kind,
          name: surface.name,
          files: surface.files,
        })),
      },
      review: {
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        notes:
          'Generated from the frozen base and expected change. A reviewer must confirm target neutrality, rank-one source truth, and styling authority.',
      },
    };
  } finally {
    try {
      git(clone, ['worktree', 'remove', '--force', worktree]);
    } finally {
      rmSync(worktree, { recursive: true, force: true });
      git(clone, ['worktree', 'prune']);
    }
  }
}

function assertCandidatePartitions(records, expectedPartition) {
  if (!Array.isArray(records)) {
    throw new TypeError(`${expectedPartition} candidates must contain a records array`);
  }
  for (const record of records) {
    if (record?.partition !== expectedPartition) {
      throw new Error(
        `${expectedPartition} candidate ${record?.taskId ?? '(unknown)'} has partition ${JSON.stringify(record?.partition)}; expected ${JSON.stringify(expectedPartition)}`,
      );
    }
  }
}

function resolveContainedProject(worktree, record) {
  const declaredPath = record.repository.projectPath;
  const label = `${record.taskId}: project path ${JSON.stringify(declaredPath)}`;
  if (typeof declaredPath !== 'string' || declaredPath.length === 0) {
    throw new Error(`${label} must be a non-empty relative path`);
  }
  if (isAbsolute(declaredPath)) throw new Error(`${label} must be relative to the checkout`);

  const worktreeRoot = resolve(worktree);
  const projectRoot = resolve(worktreeRoot, declaredPath);
  if (!isPathContained(worktreeRoot, projectRoot)) {
    throw new Error(`${label} escapes checkout`);
  }
  if (!existsSync(projectRoot)) throw new Error(`${label} does not exist at the base commit`);

  const realWorktreeRoot = realpathSync(worktreeRoot);
  const realProjectRoot = realpathSync(projectRoot);
  if (!isPathContained(realWorktreeRoot, realProjectRoot)) {
    throw new Error(`${label} escapes checkout through a symbolic link`);
  }
  if (!statSync(realProjectRoot).isDirectory()) {
    throw new Error(`${label} is not a directory at the base commit`);
  }

  return {
    projectRoot,
    projectPath: relative(worktreeRoot, projectRoot).split(sep).join('/') || '.',
  };
}

function isPathContained(root, candidate) {
  const relation = relative(root, candidate);
  return (
    relation === '' ||
    (relation !== '..' && !relation.startsWith(`..${sep}`) && !isAbsolute(relation))
  );
}

function bundle(drafts, confidential) {
  const records = drafts.sort((left, right) => left.taskId.localeCompare(right.taskId));
  return {
    schemaVersion: 'decantr-benchmark-task-delivery-draft-bundle.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    confidentiality: confidential
      ? 'PRIVATE: contains sealed qualification target and oracle details.'
      : 'Public development target-oracle drafts; not confirmatory evidence.',
    count: records.length,
    bundleSha256: sha256Canonical(records),
    records,
  };
}

function rankSurfaceCandidates(items, changedFiles, prompt) {
  const promptTerms = terms(prompt);
  return items
    .filter((surface) => surface.files.some((file) => changedFiles.includes(file)))
    .filter((surface) => !['flow', 'runtime-state'].includes(surface.kind))
    .sort((left, right) => scoreSurface(right, promptTerms) - scoreSurface(left, promptTerms) || left.id.localeCompare(right.id));
}

function scoreSurface(surface, promptTerms) {
  const kind = { route: 50, component: 45, overlay: 44, layout: 40, story: 30, package: 10 }[surface.kind] ?? 0;
  const authority = { 'production-proven': 20, 'project-reference': 10, inferred: 0, unresolved: -20 }[
    surface.authority
  ];
  const taskability = { ready: 10, limited: 5, not_applicable: 0, blocked: -20 }[surface.taskability];
  const overlap = terms(surface.name).filter((term) => promptTerms.includes(term)).length * 8;
  return kind + authority + taskability + overlap;
}

function semanticSelector(surface) {
  if (surface.kind === 'route') return surface.name;
  return `${surface.kind}:${surface.name}`;
}

function sharedPolicyCard(record) {
  return {
    statements: [
      {
        id: 'repository-authority',
        text: 'Preserve repository-owned framework, component, styling, and dependency conventions unless the task explicitly changes them.',
        sources: ['base-checkout'],
      },
      {
        id: 'change-scope',
        text: `Keep authored changes within the declared allowlist: ${record.scope.allowedPaths.join(', ')}. Do not edit forbidden paths: ${record.scope.forbiddenPaths.join(', ')}.`,
        sources: ['task.scope'],
      },
      {
        id: 'host-verification',
        text: 'Keep the repository build and task-specific host checks passing under the frozen environment contract.',
        sources: ['candidate.environment'],
      },
    ],
  };
}

function terms(value) {
  return [
    ...new Set(
      value
        .replace(/([a-z0-9])([A-Z])/gu, '$1 $2')
        .toLowerCase()
        .split(/[^a-z0-9]+/u)
        .filter((term) => term.length >= 3),
    ),
  ];
}

function stripProjectPrefix(file, projectPath) {
  if (projectPath === '.') return file;
  const prefix = `${projectPath.replace(/\/$/u, '')}/`;
  return file.startsWith(prefix) ? file.slice(prefix.length) : file;
}

function isProductionTaskFile(file) {
  return (
    !new RegExp(forbiddenAuthorityPattern, 'iu').test(file) &&
    !/(?:^|\/)(?:docs?|examples?|playgrounds?|samples?)(?:\/|$)/iu.test(file) &&
    /\.(?:[cm]?[jt]sx?|astro|vue|svelte|css|less|s[ac]ss|html)$/iu.test(file)
  );
}

function existsAtProjectRoot(projectRoot, file) {
  if (!file) return false;
  const absolute = resolve(projectRoot, file);
  if (!isPathContained(projectRoot, absolute) || !existsSync(absolute)) return false;
  try {
    return isPathContained(realpathSync(projectRoot), realpathSync(absolute));
  } catch {
    return false;
  }
}

function git(directory, args) {
  return execFileSync('git', ['-C', directory, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function parseArgs(argv) {
  const options = {
    corpusRoot: '/tmp/decantr-3-10-corpus-20260722',
    developmentCandidatesPath: join(benchmarkRoot, 'tasks', 'development-candidates.json'),
    qualificationCandidatesPath: join(
      repositoryRoot,
      '.private',
      'benchmark-3-10',
      'task-freeze',
      'qualification-private.json',
    ),
    developmentOutputPath: join(benchmarkRoot, 'tasks', 'development-delivery-drafts.json'),
    qualificationOutputPath: join(
      repositoryRoot,
      '.private',
      'benchmark-3-10',
      'task-context',
      'qualification-delivery-drafts.json',
    ),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--corpus-root') options.corpusRoot = resolve(argv[++index]);
    else if (argument === '--development-candidates') options.developmentCandidatesPath = resolve(argv[++index]);
    else if (argument === '--qualification-candidates') options.qualificationCandidatesPath = resolve(argv[++index]);
    else if (argument === '--development-out') options.developmentOutputPath = resolve(argv[++index]);
    else if (argument === '--qualification-out') options.qualificationOutputPath = resolve(argv[++index]);
    else throw new Error(`Unknown option: ${argument}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await generateTaskDeliveryDrafts(parseArgs(process.argv.slice(2)));
    console.log(JSON.stringify({ ok: true, ...result }, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
