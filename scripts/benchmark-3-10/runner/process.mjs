import { spawnSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { basename, dirname, isAbsolute, relative, resolve } from 'node:path';

const SHELL_EXECUTABLES = new Set([
  'bash',
  'cmd',
  'cmd.exe',
  'dash',
  'fish',
  'powershell',
  'powershell.exe',
  'pwsh',
  'sh',
  'zsh',
]);

export function sanitizedEnvironment(home, additions = {}) {
  const environment = {
    HOME: home,
    XDG_CACHE_HOME: resolve(home, '.cache'),
    XDG_CONFIG_HOME: resolve(home, '.config'),
    XDG_DATA_HOME: resolve(home, '.local', 'share'),
    LANG: 'C.UTF-8',
    LC_ALL: 'C.UTF-8',
    PATH: '/usr/local/bin:/usr/bin:/bin',
    TZ: 'UTC',
    CI: '1',
    NO_COLOR: '1',
  };
  for (const [key, value] of Object.entries(additions)) {
    if (!/^[A-Z_][A-Z0-9_]*$/u.test(key) || typeof value !== 'string') {
      throw new Error(`Invalid explicit environment entry: ${key}`);
    }
    if (/(?:AUTH|CREDENTIAL|KEY|PASSWORD|SECRET|TOKEN)/u.test(key)) {
      throw new Error(`Secret-like environment variables are forbidden: ${key}`);
    }
    environment[key] = value;
  }
  return environment;
}

export function runFixed(command, args, options = {}) {
  assertFixedCommand(command, args);
  const startedAt = Date.now();
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    env: options.env,
    encoding: 'utf8',
    timeout: options.timeoutMs,
    maxBuffer: options.maxBuffer ?? 16 * 1024 * 1024,
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return {
    exitCode: Number.isInteger(result.status) ? result.status : null,
    signal: result.signal ?? null,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? (result.error ? String(result.error.message) : ''),
    errorCode: result.error?.code ?? null,
    durationMs: Date.now() - startedAt,
  };
}

export function assertFixedCommand(command, args) {
  if (typeof command !== 'string' || command.trim() === '') throw new Error('command must be a non-empty string');
  if (!Array.isArray(args) || args.some((argument) => typeof argument !== 'string')) {
    throw new Error('command arguments must be a fixed string array');
  }
  const executable = basename(command).toLowerCase();
  if (SHELL_EXECUTABLES.has(executable)) throw new Error(`Shell executable is forbidden: ${executable}`);
  if (['node', 'node.exe'].includes(executable) && args.some((argument) => ['-e', '--eval', '-p', '--print'].includes(argument))) {
    throw new Error('Inline Node evaluation is forbidden');
  }
}

export function resolveContained(root, candidate, label = 'path') {
  const absolute = isAbsolute(candidate) ? resolve(candidate) : resolve(root, candidate);
  const rootReal = realpathSync(root);
  let existingAncestor = absolute;
  while (!existsSync(existingAncestor)) {
    const parent = dirname(existingAncestor);
    if (parent === existingAncestor) throw new Error(`${label} has no existing ancestor`);
    existingAncestor = parent;
  }
  const ancestorReal = realpathSync(existingAncestor);
  const relation = relative(rootReal, ancestorReal);
  if (relation === '..' || relation.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) || isAbsolute(relation)) {
    throw new Error(`${label} escapes its allowed root`);
  }
  return absolute;
}

export function isForbiddenDecantrOracleToken(value) {
  const normalized = value.replaceAll('\\', '/');
  return (
    /(^|\/)\.decantr(?:\/|$)/iu.test(normalized) ||
    /(^|\/)DECANTR\.md$/iu.test(normalized) ||
    /(^|\/)decantr\.essence\.json$/iu.test(normalized) ||
    /(^|\/)decantr(?:\.cmd|\.exe)?$/iu.test(normalized) ||
    /(^|\/)packages\/cli(?:\/|$)/iu.test(normalized)
  );
}

export function isForbiddenEvaluatorEnvironmentKey(key) {
  return (
    /^DECANTR_/u.test(key) ||
    /(?:AUTH|CREDENTIAL|KEY|PASSWORD|SECRET|TOKEN)/u.test(key) ||
    key === 'PATH' ||
    key === 'NODE_OPTIONS' ||
    key === 'NODE_PATH' ||
    key === 'BUN_INSTALL' ||
    key === 'NPM_CONFIG_USERCONFIG' ||
    key === 'npm_config_userconfig' ||
    /^LD_/u.test(key) ||
    /^DYLD_/u.test(key)
  );
}
