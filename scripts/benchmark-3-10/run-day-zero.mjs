#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import {
  benchmarkDir,
  checkoutDirectory,
  manifestDigests,
  readJson,
  repoRoot,
  sha256,
} from './lib.mjs';

const options = {
  corpusPath: resolve(benchmarkDir, 'corpus.json'),
  modelsPath: resolve(benchmarkDir, 'models.json'),
  protocolPath: resolve(benchmarkDir, 'protocol.json'),
  corpusRoot: '/tmp/decantr-3-10-corpus-20260722',
  cliPath: resolve(repoRoot, 'packages/cli/dist/bin.js'),
  outputPath: '/tmp/decantr-3-10-candidate-day-zero.json',
  rawDirectory: '/tmp/decantr-3-10-day-zero-raw',
};
const protectedBaselinePath = resolve(
  repoRoot,
  'docs/benchmarks/2026-07-22-decantr-3-9-4-day-zero.json',
);

for (let index = 0; index < process.argv.slice(2).length; index += 1) {
  const args = process.argv.slice(2);
  const argument = args[index];
  if (argument === '--') continue;
  if (argument === '--corpus') options.corpusPath = resolve(args[++index]);
  else if (argument === '--corpus-root') options.corpusRoot = resolve(args[++index]);
  else if (argument === '--cli') options.cliPath = resolve(args[++index]);
  else if (argument === '--out') options.outputPath = resolve(args[++index]);
  else if (argument === '--raw-dir') options.rawDirectory = resolve(args[++index]);
  else throw new Error(`Unknown option: ${argument}`);
}

if (!existsSync(options.cliPath)) throw new Error(`CLI entrypoint does not exist: ${options.cliPath}`);
if (resolve(options.outputPath) === protectedBaselinePath) {
  throw new Error('the frozen Decantr 3.9.4 Day-0 baseline cannot be overwritten by a candidate run');
}
mkdirSync(options.rawDirectory, { recursive: true });

const corpus = readJson(options.corpusPath);
const cliVersionRun = run(process.execPath, [options.cliPath, '--version'], repoRoot, 10_000);
if (cliVersionRun.status !== 0) throw new Error(`Unable to read CLI version: ${cliVersionRun.stderr}`);

const results = [];
for (const repository of corpus.repositories) {
  const checkout = join(options.corpusRoot, checkoutDirectory(repository.repo));
  const project = repository.projectPath === '.' ? checkout : join(checkout, repository.projectPath);
  const rawPath = join(options.rawDirectory, `${repository.id}.scan.json`);
  const stderrPath = join(options.rawDirectory, `${repository.id}.scan.stderr.txt`);
  const head = run('git', ['-C', checkout, 'rev-parse', 'HEAD'], repoRoot, 10_000);
  const tree = run('git', ['-C', checkout, 'rev-parse', 'HEAD^{tree}'], repoRoot, 10_000);
  const worktree = run('git', ['-C', checkout, 'status', '--porcelain=v1'], repoRoot, 10_000);
  const commitVerified = head.status === 0 && head.stdout.trim() === repository.commit;
  const worktreeClean = worktree.status === 0 && worktree.stdout.trim() === '';

  if (!existsSync(checkout) || !existsSync(project)) {
    results.push({
      id: repository.id,
      partition: repository.partition,
      expectedFramework: repository.framework,
      projectPath: repository.projectPath,
      commitVerified,
      tree: tree.status === 0 ? tree.stdout.trim() : null,
      worktreeClean,
      status: 'harness_failure',
      error: !existsSync(checkout) ? 'checkout missing' : 'projectPath missing',
    });
    continue;
  }

  const scanArgs = [options.cliPath, 'scan', '--json'];
  if (repository.projectPath !== '.') scanArgs.push('--project', repository.projectPath);
  const scan = run(process.execPath, scanArgs, checkout, 60_000);
  writeFileSync(rawPath, scan.stdout, 'utf8');
  writeFileSync(stderrPath, scan.stderr, 'utf8');
  const parsed = parseJson(scan.stdout);
  const authorityFiles = parsed?.routes?.authorityFiles ?? parsed?.discovery?.routeAuthorityFiles ?? [];
  const contamination = authorityFiles.filter(isExcludedAuthorityPath);
  const uiSurfaces = parsed?.discovery?.uiSurfaces ?? null;

  results.push({
    id: repository.id,
    partition: repository.partition,
    expectedFramework: repository.framework,
    projectPath: repository.projectPath,
    commitVerified,
    tree: tree.status === 0 ? tree.stdout.trim() : null,
    worktreeClean,
    status: scan.status === 0 && parsed ? 'completed' : 'scan_failure',
    exitCode: scan.status,
    durationMs: scan.durationMs,
    rawOutputSha256: sha256(scan.stdout),
    rawStderrSha256: sha256(scan.stderr),
    rawOutputFile: basename(rawPath),
    schemaVersion: parsed?.schemaVersion ?? null,
    applicability: parsed?.applicability?.status ?? null,
    confidence: {
      level: parsed?.confidence?.level ?? null,
      score: parsed?.confidence?.score ?? null,
    },
    project: {
      framework: parsed?.project?.framework ?? null,
      packageName: parsed?.project?.packageName ?? null,
      reportedProjectPath: parsed?.project?.projectPath ?? null,
      workspaceScope: parsed?.project?.workspaceScope ?? null,
    },
    routes: {
      strategy: parsed?.routes?.strategy ?? null,
      count: parsed?.routes?.count ?? 0,
      routeSignalCount: parsed?.routes?.routeSignalCount ?? parsed?.discovery?.routeSignalCount ?? 0,
      taskableRouteCount: parsed?.routes?.taskableRouteCount ?? parsed?.discovery?.taskableRouteCount ?? 0,
      authority: parsed?.routes?.authority ?? parsed?.discovery?.routeAuthority ?? null,
      completeness: parsed?.routes?.completeness ?? parsed?.discovery?.routeCompleteness ?? null,
      authorityFiles,
      excludedAuthorityFiles: contamination,
    },
    components: {
      count: parsed?.components?.componentCount ?? 0,
      confidence: parsed?.components?.confidence ?? parsed?.discovery?.componentConfidence ?? null,
    },
    styling: {
      approach: parsed?.styling?.approach ?? null,
      confidence: parsed?.styling?.confidence ?? null,
      evidence: parsed?.styling?.evidence ?? [],
      limitations: parsed?.styling?.limitations ?? [],
    },
    uiAuthority: uiSurfaces
      ? {
          status: uiSurfaces.status ?? null,
          primaryMode: uiSurfaces.primaryMode ?? null,
          counts: uiSurfaces.counts ?? null,
          axes: Object.fromEntries(
            Object.entries(uiSurfaces.axes ?? {}).map(([name, axis]) => [
              name,
              axis?.status ?? null,
            ]),
          ),
          reasons: uiSurfaces.reasons ?? [],
        }
      : null,
    limitations: parsed?.discovery?.limitations ?? [],
    error:
      scan.status === 0 && parsed
        ? null
        : parsed?.error?.message ||
          scan.stderr.trim() ||
          `scan exited ${scan.status ?? 'without a status'}`,
  });
}

const report = {
  schemaVersion: 'decantr-day-zero-report.v1',
  generatedAt: new Date().toISOString(),
    baseline: {
    cliVersion: cliVersionRun.stdout.trim(),
      repositoryCommit: run('git', ['rev-parse', 'HEAD'], repoRoot, 10_000).stdout.trim(),
      cliSha256: sha256(readFileSync(options.cliPath)),
      runnerSha256: sha256(readFileSync(new URL(import.meta.url))),
      nodeVersion: process.version,
      platform: `${process.platform}-${process.arch}`,
    note: 'Unreleased 3.10 source candidate diagnostic. The package version remains 3.9.4; this report is not release or model-value evidence.',
  },
  manifests: manifestDigests(options),
  corpusRoot: options.corpusRoot,
  rawDirectory: options.rawDirectory,
  summary: summarize(results),
  results,
};

writeFileSync(options.outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ outputPath: options.outputPath, ...report.summary }, null, 2));

function run(command, args, cwd, timeout) {
  const startedAt = Date.now();
  const result = spawnSync(command, args, {
    cwd,
    timeout,
    encoding: 'utf8',
    shell: false,
    maxBuffer: 32 * 1024 * 1024,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? String(result.error?.message ?? ''),
    durationMs: Date.now() - startedAt,
  };
}

function parseJson(stdout) {
  try {
    return JSON.parse(stdout);
  } catch {
    const start = stdout.indexOf('{');
    const end = stdout.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(stdout.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function isExcludedAuthorityPath(path) {
  return /(^|\/)(?:\.storybook|__tests__|cypress|demos?|docs?|e2e|examples?|fixtures?|mocks?|playgrounds?|playwright|samples?|specs?|stories|storybook|support|tests?|coverage|dist|build|\.next|\.nuxt|generated|__generated__)(?:\/|$)|\.(?:cy|e2e|fixture|gen|generated|mock|test|spec|stories?)\.[^.]+$/iu.test(
    path,
  );
}

function summarize(items) {
  const completed = items.filter((item) => item.status === 'completed');
  return {
    repositories: items.length,
    completed: completed.length,
    dirtyCheckouts: items.filter((item) => item.worktreeClean === false).map((item) => item.id),
    commitMismatches: items.filter((item) => item.commitVerified === false).map((item) => item.id),
    harnessFailures: items.filter((item) => item.status === 'harness_failure').map((item) => item.id),
    scanFailures: items.filter((item) => item.status === 'scan_failure').map((item) => item.id),
    unsupported: completed.filter((item) => item.applicability === 'not_applicable').map((item) => item.id),
    unresolvedAuthority: completed
      .filter((item) => !['proven'].includes(item.routes.authority))
      .map((item) => item.id),
    partialOrUnknownCompleteness: completed
      .filter((item) => !['complete'].includes(item.routes.completeness))
      .map((item) => item.id),
    authorityContamination: completed
      .filter((item) => item.routes.excludedAuthorityFiles.length > 0)
      .map((item) => ({ id: item.id, files: item.routes.excludedAuthorityFiles })),
    highConfidenceWithoutTaskableRoute: completed
      .filter((item) => item.confidence.level === 'high' && item.routes.taskableRouteCount === 0)
      .map((item) => item.id),
    uiReadiness: {
      ready: completed.filter((item) => item.uiAuthority?.status === 'ready').map((item) => item.id),
      limited: completed
        .filter((item) => item.uiAuthority?.status === 'limited')
        .map((item) => item.id),
      blocked: completed
        .filter((item) => item.uiAuthority?.status === 'blocked')
        .map((item) => item.id),
      unsupported: completed
        .filter((item) => item.uiAuthority?.status === 'unsupported')
        .map((item) => item.id),
      unavailable: completed.filter((item) => !item.uiAuthority).map((item) => item.id),
    },
  };
}
