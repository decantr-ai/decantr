import { isAbsolute, relative, resolve, sep } from 'node:path';
import { canonicalJson, sha256Canonical } from './canonical.mjs';
import { runFixed } from './process.mjs';

const MAX_CONTEXT_BYTES = 256 * 1024;

export function buildControlDelivery(task) {
  const sharedTaskInput = structuredClone(task.informationEntitlement.taskInput);
  const document = {
    schemaVersion: 'decantr-benchmark-arm-delivery.v1',
    arm: 'control',
    sharedTaskInputSha256: sha256Canonical(sharedTaskInput),
    sharedTaskInput,
    instructions: [
      'Use the shared target and policy card as the change contract.',
      'Inspect the repository directly to find implementation, styling, and verification authority.',
      'Do not invoke or rely on Decantr or Decantr-generated artifacts.',
    ],
    productContext: null,
  };
  return { document, context: canonicalJson(document) };
}

export function buildTreatmentDelivery(options) {
  const { task, candidate, candidateRuntimeRoot, workspace, environment } = options;
  if (!candidate.contextProvider || !candidate.runtime || !candidateRuntimeRoot) {
    throw new Error('treatment arm requires a verified candidate context-provider runtime');
  }
  const selector = task.informationEntitlement.taskInput.target.selector;
  const before = gitStatus(workspace, environment);
  if (before !== '') throw new Error('workspace must be clean before treatment context generation');
  const invocation = runFixed(
    process.execPath,
    [
      candidate.runtime.entrypoint,
      'task',
      selector,
      task.prompt,
      '--project',
      task.projectPath,
      '--json',
    ],
    {
      cwd: workspace,
      env: environment,
      timeoutMs: Math.min(task.limits.timeoutMs, 300_000),
      maxBuffer: MAX_CONTEXT_BYTES,
    },
  );
  if (invocation.exitCode !== 0) {
    throw new Error(
      `candidate task-context command failed (${invocation.exitCode ?? invocation.signal ?? 'unknown'}): ${invocation.stderr.slice(0, 500)}`,
    );
  }
  if (Buffer.byteLength(invocation.stdout, 'utf8') > MAX_CONTEXT_BYTES) {
    throw new Error('candidate task context exceeds the 256 KiB delivery limit');
  }
  let productContext;
  try {
    productContext = JSON.parse(invocation.stdout);
  } catch {
    throw new Error('candidate task-context command did not emit one JSON document');
  }
  assertTaskContext(productContext, {
    schemaVersion: candidate.contextProvider.outputSchemaVersion,
    selector,
    workspace,
  });
  const after = gitStatus(workspace, environment);
  if (after !== before) {
    throw new Error('candidate task-context command modified the benchmark workspace');
  }
  const sharedTaskInput = structuredClone(task.informationEntitlement.taskInput);
  const document = {
    schemaVersion: 'decantr-benchmark-arm-delivery.v1',
    arm: 'treatment',
    sharedTaskInputSha256: sha256Canonical(sharedTaskInput),
    sharedTaskInput,
    instructions: [
      'Use the shared target and policy card as the change contract.',
      'Use the candidate-generated task context to prioritize reads and preserve stated authority boundaries.',
      'Inspect repository source when runtime evidence conflicts with or exceeds the bounded context.',
    ],
    productContext,
  };
  return {
    document,
    context: canonicalJson(document),
    generation: {
      durationMs: invocation.durationMs,
      runtimeTreeSha256: candidate.runtime.runtimeTreeSha256,
      stderr: invocation.stderr.slice(0, 1000),
    },
  };
}

export function assertTaskContext(context, expected) {
  if (!context || typeof context !== 'object' || Array.isArray(context)) {
    throw new Error('candidate task context is not an object');
  }
  if (context.schemaVersion !== expected.schemaVersion || context.target !== expected.selector) {
    throw new Error('candidate task context schema or target differs from the shared task input');
  }
  if (!['ready', 'limited'].includes(context.status)) {
    throw new Error(`candidate task context is not taskable: ${String(context.status)}`);
  }
  if (!Array.isArray(context.read) || !Array.isArray(context.readTargets) || context.read.length === 0) {
    throw new Error('candidate task context has no bounded read targets');
  }
  if (context.read.length !== context.readTargets.length || context.read.length > 40) {
    throw new Error('candidate task context read-target set is inconsistent or unbounded');
  }
  const seen = new Set();
  let previousRank = 0;
  for (let index = 0; index < context.readTargets.length; index += 1) {
    const target = context.readTargets[index];
    if (
      !target ||
      typeof target.file !== 'string' ||
      target.file !== context.read[index] ||
      !Number.isInteger(target.rank) ||
      target.rank < 1 ||
      target.rank > 4 ||
      target.rank < previousRank ||
      seen.has(target.file)
    ) {
      throw new Error('candidate task context read targets are malformed');
    }
    previousRank = target.rank;
    seen.add(target.file);
    assertWorkspaceRelativePath(expected.workspace, target.file);
  }
  if (!context.authority || typeof context.authority !== 'object' || !Array.isArray(context.authority.reasons)) {
    throw new Error('candidate task context authority boundary is missing');
  }
  if (typeof context.verifyCommand !== 'string' || context.verifyCommand.trim() === '') {
    throw new Error('candidate task context verify command is missing');
  }
  return context;
}

function assertWorkspaceRelativePath(workspace, path) {
  if (isAbsolute(path) || path.includes('\\')) throw new Error(`task context path is not portable: ${path}`);
  const absolute = resolve(workspace, path);
  const relation = relative(resolve(workspace), absolute);
  if (relation === '..' || relation.startsWith(`..${sep}`) || isAbsolute(relation)) {
    throw new Error(`task context path escapes the workspace: ${path}`);
  }
}

function gitStatus(workspace, environment) {
  const result = runFixed('git', ['status', '--porcelain=v1', '--untracked-files=all'], {
    cwd: workspace,
    env: environment,
    timeoutMs: 30_000,
  });
  if (result.exitCode !== 0) throw new Error(`unable to inspect treatment workspace: ${result.stderr.slice(0, 500)}`);
  return result.stdout.trim();
}
