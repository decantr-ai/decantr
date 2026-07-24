import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  realpathSync,
  writeFileSync,
} from 'node:fs';
import { isAbsolute, join, relative, resolve } from 'node:path';

import { runFixed, sanitizedEnvironment } from '../runner/process.mjs';

const gitCommitPattern = /^[a-f0-9]{40}$/u;
const safePathPattern = /^[A-Za-z0-9._/-]+$/u;
const safeNamePattern = /^[A-Za-z0-9._/-]+$/u;

export function materializeReviewedSubmoduleClosure(repository, revision = 'HEAD', options = {}) {
  const root = realpathSync(resolve(repository));
  const environment =
    options.environment ??
    submoduleEnvironment(root);
  const rootCommit = gitOutput(root, ['rev-parse', `${revision}^{commit}`], environment);
  if (
    !gitCommitPattern.test(rootCommit) ||
    gitOutput(root, ['rev-parse', 'HEAD'], environment) !== rootCommit
  ) {
    throw new Error('reviewed submodules require the exact revision checked out');
  }
  const closure = [];
  materializeRepository(root, rootCommit, '', closure, environment);
  return closure.sort((left, right) => left.path.localeCompare(right.path));
}

export function reviewedSubmoduleBindings(closure) {
  return closure.map(({ repository: _repository, ...binding }) => structuredClone(binding));
}

export function hydratePackedSubmodules(repository, revision = 'HEAD', options = {}) {
  const root = realpathSync(resolve(repository));
  const environment =
    options.environment ??
    submoduleEnvironment(root);
  const rootCommit = gitOutput(root, ['rev-parse', `${revision}^{commit}`], environment);
  const objectDirectory = absoluteGitPath(root, 'objects', environment);
  const closure = [];
  hydrateRepository(root, rootCommit, '', root, objectDirectory, closure, environment);
  const status = gitOutput(root, ['submodule', 'status', '--recursive'], environment, {
    allowEmpty: true,
    trim: false,
  });
  for (const line of status.split('\n').filter(Boolean)) {
    if (!line.startsWith(' ')) {
      throw new Error(`hydrated submodule is not pinned and clean: ${line}`);
    }
  }
  return closure.sort((left, right) => left.path.localeCompare(right.path));
}

export function listReviewedGitlinks(repository, revision = 'HEAD', environment = null) {
  const root = realpathSync(resolve(repository));
  const gitEnvironment =
    environment ??
    submoduleEnvironment(root);
  const commit = gitOutput(root, ['rev-parse', `${revision}^{commit}`], gitEnvironment);
  const links = listGitlinks(root, commit, gitEnvironment);
  const modules = readGitmodules(root, commit, gitEnvironment);
  if (links.length === 0) {
    if (modules.length > 0) {
      throw new Error('reviewed .gitmodules entries do not bind Git tree gitlinks');
    }
    return [];
  }
  if (modules.length !== links.length) {
    throw new Error('reviewed Git tree and .gitmodules entry counts differ');
  }
  const moduleByPath = new Map(modules.map((item) => [item.path, item]));
  return links.map((link) => {
    const module = moduleByPath.get(link.path);
    if (!module) {
      throw new Error(`Git tree gitlink has no reviewed .gitmodules entry: ${link.path}`);
    }
    return { ...link, name: module.name, url: module.url };
  });
}

function materializeRepository(repository, commit, prefix, closure, environment) {
  const links = listReviewedGitlinks(repository, commit, environment);
  for (const link of links) {
    const target = containedPath(repository, link.path, 'submodule path');
    gitRun(
      repository,
      [
        '-c',
        'protocol.allow=never',
        '-c',
        'protocol.https.allow=always',
        '-c',
        'submodule.fetchJobs=1',
        'submodule',
        'update',
        '--init',
        '--depth=1',
        '--',
        link.path,
      ],
      environment,
      600_000,
    );
    const materializedCommit = gitOutput(target, ['rev-parse', 'HEAD'], environment);
    const tree = gitOutput(target, ['rev-parse', 'HEAD^{tree}'], environment);
    const origin = gitOutput(target, ['remote', 'get-url', 'origin'], environment);
    const status = gitOutput(
      target,
      ['status', '--porcelain=v1', '--untracked-files=all'],
      environment,
      { allowEmpty: true },
    );
    if (
      materializedCommit !== link.commit ||
      origin !== link.url ||
      status !== ''
    ) {
      throw new Error(`materialized submodule differs from its reviewed gitlink: ${link.path}`);
    }
    const path = prefixedPath(prefix, link.path);
    closure.push({
      path,
      url: link.url,
      commit: materializedCommit,
      tree,
      repository: target,
    });
    materializeRepository(target, materializedCommit, path, closure, environment);
  }
}

function hydrateRepository(
  repository,
  commit,
  prefix,
  root,
  objectDirectory,
  closure,
  environment,
) {
  const links = listReviewedGitlinks(repository, commit, environment);
  for (const link of links) {
    const target = containedPath(repository, link.path, 'submodule path');
    if (existsSync(target)) {
      const metadata = lstatSync(target);
      if (!metadata.isDirectory() || readdirSync(target).length !== 0) {
        throw new Error(`packed submodule target is not an empty directory: ${link.path}`);
      }
    } else {
      mkdirSync(target, { recursive: true, mode: 0o700 });
    }
    gitRun(target, ['init', '--quiet'], environment);
    gitRun(target, ['config', 'core.hooksPath', '/dev/null'], environment);
    gitRun(target, ['remote', 'add', 'origin', link.url], environment);
    const gitDirectory = absoluteGitPath(target, '', environment);
    const targetObjectDirectory = join(gitDirectory, 'objects');
    const infoDirectory = join(targetObjectDirectory, 'info');
    const alternateObjectDirectory = relative(targetObjectDirectory, objectDirectory)
      .replaceAll('\\', '/');
    if (alternateObjectDirectory === '' || isAbsolute(alternateObjectDirectory)) {
      throw new Error('packed submodule object alternate is not relocatable');
    }
    mkdirSync(infoDirectory, { recursive: true, mode: 0o700 });
    writeFileSync(join(infoDirectory, 'alternates'), `${alternateObjectDirectory}\n`, {
      encoding: 'utf8',
      mode: 0o600,
    });
    gitRun(target, ['cat-file', '-e', `${link.commit}^{commit}`], environment);
    gitRun(target, ['update-ref', 'refs/heads/snapshot', link.commit], environment);
    gitRun(target, ['checkout', '--quiet', '--detach', link.commit], environment);
    gitRun(repository, ['config', `submodule.${link.name}.url`, link.url], environment);
    const tree = gitOutput(target, ['rev-parse', 'HEAD^{tree}'], environment);
    const status = gitOutput(
      target,
      ['status', '--porcelain=v1', '--untracked-files=all'],
      environment,
      { allowEmpty: true },
    );
    if (gitOutput(target, ['rev-parse', 'HEAD'], environment) !== link.commit || status !== '') {
      throw new Error(`hydrated packed submodule differs from its gitlink: ${link.path}`);
    }
    const path = prefixedPath(prefix, link.path);
    closure.push({
      path,
      url: link.url,
      commit: link.commit,
      tree,
      repository: target,
    });
    hydrateRepository(
      target,
      link.commit,
      path,
      root,
      objectDirectory,
      closure,
      environment,
    );
  }
  if (repository === root) {
    const status = gitOutput(
      repository,
      ['status', '--porcelain=v1', '--untracked-files=all'],
      environment,
      { allowEmpty: true },
    );
    if (status !== '') throw new Error('hydrated packed source with submodules is dirty');
  }
}

function listGitlinks(repository, commit, environment) {
  const output = gitOutput(
    repository,
    ['ls-tree', '-rz', '--full-tree', commit],
    environment,
    { trim: false },
  );
  const links = [];
  for (const entry of output.split('\0').filter(Boolean)) {
    const separator = entry.indexOf('\t');
    const metadata = entry.slice(0, separator);
    const path = entry.slice(separator + 1);
    const match = metadata.match(/^160000 commit ([a-f0-9]{40})$/u);
    if (!match) continue;
    assertSafeRelativePath(path, 'gitlink path');
    links.push({ path, commit: match[1] });
  }
  return links.sort((left, right) => left.path.localeCompare(right.path));
}

function readGitmodules(repository, commit, environment) {
  const exists = gitResult(
    repository,
    ['cat-file', '-e', `${commit}:.gitmodules`],
    environment,
  );
  if (exists.exitCode !== 0) return [];
  const paths = gitOutput(
    repository,
    [
      'config',
      '--blob',
      `${commit}:.gitmodules`,
      '--get-regexp',
      '^submodule\\..*\\.path$',
    ],
    environment,
    { allowExitCodeOne: true, allowEmpty: true },
  );
  if (paths === '') return [];
  const modules = [];
  for (const line of paths.split('\n')) {
    const separator = line.indexOf(' ');
    if (separator < 1) throw new Error('unable to parse reviewed .gitmodules path entry');
    const key = line.slice(0, separator);
    const path = line.slice(separator + 1);
    const match = key.match(/^submodule\.(.+)\.path$/u);
    if (!match || !safeNamePattern.test(match[1])) {
      throw new Error('reviewed submodule name is invalid');
    }
    assertSafeRelativePath(path, 'reviewed submodule path');
    const url = gitOutput(
      repository,
      [
        'config',
        '--blob',
        `${commit}:.gitmodules`,
        '--get',
        `submodule.${match[1]}.url`,
      ],
      environment,
    );
    assertReviewedUrl(url);
    modules.push({ name: match[1], path, url });
  }
  const pathsSeen = new Set(modules.map((item) => item.path));
  if (pathsSeen.size !== modules.length) {
    throw new Error('reviewed .gitmodules paths must be unique');
  }
  return modules.sort((left, right) => left.path.localeCompare(right.path));
}

function assertReviewedUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('reviewed submodule URL is invalid');
  }
  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'github.com' ||
    url.port !== '' ||
    url.username !== '' ||
    url.password !== '' ||
    url.search !== '' ||
    url.hash !== '' ||
    !/^\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/u.test(url.pathname) ||
    url.href !== value
  ) {
    throw new Error(`submodule URL is outside the reviewed GitHub HTTPS policy: ${value}`);
  }
}

function assertSafeRelativePath(value, label) {
  if (
    !safePathPattern.test(value) ||
    value.startsWith('/') ||
    value.split('/').some((segment) => segment === '' || segment === '.' || segment === '..') ||
    value.split('/').includes('.git')
  ) {
    throw new Error(`${label} is unsafe: ${value}`);
  }
}

function containedPath(root, path, label) {
  assertSafeRelativePath(path, label);
  const target = resolve(root, path);
  const relation = relative(root, target);
  if (relation === '..' || relation.startsWith('../') || isAbsolute(relation)) {
    throw new Error(`${label} escapes its repository`);
  }
  return target;
}

function prefixedPath(prefix, path) {
  return prefix ? `${prefix}/${path}` : path;
}

function submoduleEnvironment(repository) {
  const result = runFixed('git', ['-C', repository, 'rev-parse', '--git-dir'], {
    cwd: repository,
    env: process.env,
    timeoutMs: 30_000,
  });
  if (result.exitCode !== 0 || result.stdout.trim() === '') {
    throw new Error('unable to resolve the repository Git directory');
  }
  const rawGitDirectory = result.stdout.trim();
  const gitDirectory = isAbsolute(rawGitDirectory)
    ? resolve(rawGitDirectory)
    : resolve(repository, rawGitDirectory);
  const home = join(gitDirectory, 'decantr-submodule-home');
  mkdirSync(home, { recursive: true, mode: 0o700 });
  return sanitizedEnvironment(home, {
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_TERMINAL_PROMPT: '0',
  });
}

function absoluteGitPath(repository, suffix, environment) {
  const raw = gitOutput(
    repository,
    ['rev-parse', '--git-path', suffix || '.'],
    environment,
  );
  return isAbsolute(raw) ? resolve(raw) : resolve(repository, raw);
}

function gitRun(repository, args, environment, timeoutMs = 120_000) {
  const result = gitResult(repository, args, environment, timeoutMs);
  if (result.exitCode !== 0) {
    throw new Error(
      `git ${args.find((argument) => !argument.startsWith('-')) ?? 'command'} failed: ${
        result.stderr || result.stdout
      }`,
    );
  }
}

function gitOutput(repository, args, environment, options = {}) {
  const result = gitResult(repository, args, environment, options.timeoutMs);
  if (result.exitCode !== 0 && !(options.allowExitCodeOne && result.exitCode === 1)) {
    throw new Error(`git ${args[0]} failed: ${result.stderr || result.stdout}`);
  }
  const output = result.stdout;
  if (!options.allowEmpty && result.exitCode === 0 && output.length === 0) {
    throw new Error(`git ${args[0]} returned no output`);
  }
  return options.trim === false ? output : output.trim();
}

function gitResult(repository, args, environment, timeoutMs = 120_000) {
  return runFixed('git', ['-C', repository, ...args], {
    cwd: repository,
    env: environment,
    timeoutMs,
    maxBuffer: 16 * 1024 * 1024,
  });
}
