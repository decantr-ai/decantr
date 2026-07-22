import { runFixed, sanitizedEnvironment } from '../runner/process.mjs';

export const LOCKED_TASK_PATH =
  '/opt/task-package-manager/node_modules/.bin:/opt/task-runtime/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin';

export function createVerifiedTaskEnvironment(options) {
  const { profile, source, home, workspace } = options;
  const runtimeKind = profile.nodeVersion ? 'node' : 'bun';
  const expected = {
    DECANTR_TASK_RUNTIME_KIND: runtimeKind,
    DECANTR_TASK_RUNTIME_VERSION: profile.nodeVersion ?? profile.bunVersion,
    DECANTR_TASK_PACKAGE_MANAGER: profile.packageManager.name,
    DECANTR_TASK_PACKAGE_MANAGER_VERSION: profile.packageManager.version,
  };
  for (const [name, value] of Object.entries(expected)) {
    if (source[name] !== value) throw new Error(`task runtime marker mismatch for ${name}`);
  }
  if (typeof source.PATH !== 'string' || source.PATH.length === 0) {
    throw new Error('task runtime PATH is missing');
  }
  if (!options.allowHostRuntime) {
    if (process.platform !== 'linux' || process.arch !== 'x64') {
      throw new Error('benchmark execution must run in the locked Linux x64 image');
    }
    if (source.PATH !== LOCKED_TASK_PATH) {
      throw new Error('task runtime PATH differs from the locked benchmark image');
    }
    if (source.DECANTR_BENCHMARK_IMAGE_DIGEST !== options.benchmarkImageDigest) {
      throw new Error('benchmark image digest marker differs from the locked runtime matrix');
    }
    if (
      options.networkMode !== undefined &&
      source.DECANTR_BENCHMARK_NETWORK_MODE !== options.networkMode
    ) {
      throw new Error(`benchmark network marker must be ${options.networkMode}`);
    }
  }
  const environment = sanitizedEnvironment(home, { PATH: source.PATH });
  assertCommandVersion(
    runtimeKind,
    expected.DECANTR_TASK_RUNTIME_VERSION,
    workspace,
    environment,
    'task runtime',
  );
  assertCommandVersion(
    profile.packageManager.name,
    profile.packageManager.version,
    workspace,
    environment,
    'task package manager',
  );
  return environment;
}

function assertCommandVersion(command, expected, workspace, environment, label) {
  const result = runFixed(command, ['--version'], {
    cwd: workspace,
    timeoutMs: 10_000,
    env: environment,
  });
  const actual = (result.stdout || result.stderr).trim().replace(/^v/u, '');
  if (result.exitCode !== 0 || actual !== expected.replace(/^v/u, '')) {
    throw new Error(`${label} version mismatch: expected ${expected}, received ${actual || 'unavailable'}`);
  }
}
