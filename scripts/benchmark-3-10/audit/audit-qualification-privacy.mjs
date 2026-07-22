#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { lstat, readFile, readdir, readlink } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256 } from '../runner/canonical.mjs';

const benchmarkRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultRepositoryRoot = resolve(benchmarkRoot, '..', '..');

export async function auditQualificationPrivacy(options) {
  const privateInputPaths = normalizePrivateInputPaths(options);
  const sensitive = await collectSensitiveValues(privateInputPaths);
  if (sensitive.size === 0) {
    throw new Error('private qualification inputs contain no auditable sensitive values');
  }

  const repositoryRoot = gitRepositoryRoot(options.repositoryRoot ?? defaultRepositoryRoot);
  const trackableFiles = listGitTrackableFiles(repositoryRoot);
  const tokens = makeTokenReferences(sensitive);
  const findings = [];
  for (const path of trackableFiles) {
    scanValue(Buffer.from(path), path, 'path', tokens, findings);
    const bytes = await readTrackableFile(join(repositoryRoot, path));
    if (bytes) scanValue(bytes, path, 'content', tokens, findings);
  }
  findings.sort(compareFindings);

  return {
    ok: findings.length === 0,
    scannedFiles: trackableFiles.length,
    sensitiveValueCount: tokens.length,
    findings,
  };
}

function normalizePrivateInputPaths(options) {
  const values = options.privateInputPaths ??
    (options.privateInputPath ? [options.privateInputPath] : []);
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('at least one private qualification input is required');
  }
  return [...new Set(values.map((path) => resolve(path)))].sort();
}

async function collectSensitiveValues(inputPaths) {
  const files = [];
  for (const path of inputPaths) files.push(...(await collectPrivateJsonFiles(path, true)));
  const sensitive = new Map();
  for (let index = 0; index < files.length; index += 1) {
    let value;
    try {
      value = JSON.parse(await readFile(files[index], 'utf8'));
    } catch {
      throw new Error(`private qualification input ${index + 1} is not valid JSON`);
    }
    collectFromJson(value, sensitive);
  }
  return sensitive;
}

async function collectPrivateJsonFiles(path, directInput = false) {
  let metadata;
  try {
    metadata = await lstat(path);
  } catch {
    throw new Error('a private qualification input is missing or unreadable');
  }
  if (metadata.isSymbolicLink()) {
    throw new Error('private qualification inputs may not be symbolic links');
  }
  if (metadata.isFile()) return directInput || extname(path) === '.json' ? [path] : [];
  if (!metadata.isDirectory()) return [];

  const files = [];
  const entries = await readdir(path, { withFileTypes: true });
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) files.push(...(await collectPrivateJsonFiles(child)));
    else if (entry.isFile() && extname(entry.name) === '.json') files.push(child);
  }
  return files;
}

function collectFromJson(value, sensitive) {
  if (Array.isArray(value)) {
    for (const item of value) collectFromJson(item, sensitive);
    return;
  }
  if (!isObject(value)) return;

  if (value.partition === 'qualification' && isSensitiveString(value.taskId)) {
    addSensitiveValue(sensitive, value.taskId, 'qualification-task-id');
  }
  for (const key of ['removedTaskId', 'addedTaskId']) {
    if (isSensitiveString(value[key])) addSensitiveValue(sensitive, value[key], 'replacement-task-id');
  }
  if (isObject(value.privacyAudit) && Array.isArray(value.privacyAudit.sensitiveTokens)) {
    for (const token of value.privacyAudit.sensitiveTokens) {
      if (!isSensitiveString(token)) {
        throw new Error('private privacy-audit token must be a string of at least four characters');
      }
      addSensitiveValue(sensitive, token, 'caller-supplied-token');
    }
  }
  for (const item of Object.values(value)) collectFromJson(item, sensitive);
}

function addSensitiveValue(sensitive, value, kind) {
  const kinds = sensitive.get(value) ?? new Set();
  kinds.add(kind);
  sensitive.set(value, kinds);
}

function isSensitiveString(value) {
  return typeof value === 'string' && value.length >= 4;
}

function gitRepositoryRoot(path) {
  try {
    return execFileSync('git', ['-C', resolve(path), 'rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    throw new Error('public privacy audit requires a Git repository');
  }
}

function listGitTrackableFiles(repositoryRoot) {
  let output;
  try {
    output = execFileSync(
      'git',
      ['-C', repositoryRoot, 'ls-files', '--cached', '--others', '--exclude-standard', '-z'],
      { encoding: 'buffer', maxBuffer: 128 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] },
    );
  } catch {
    throw new Error('Git-trackable public files could not be enumerated');
  }
  return [...new Set(output.toString('utf8').split('\0').filter(Boolean))].sort((left, right) =>
    left.localeCompare(right),
  );
}

function makeTokenReferences(sensitive) {
  return [...sensitive.entries()]
    .map(([value, kinds]) => ({
      value,
      bytes: Buffer.from(value),
      kinds: [...kinds].sort(),
      digest: sha256(value),
    }))
    .sort((left, right) => left.digest.localeCompare(right.digest))
    .map((token, index) => ({ ...token, ref: `sensitive-${String(index + 1).padStart(3, '0')}` }));
}

async function readTrackableFile(path) {
  try {
    const metadata = await lstat(path);
    if (metadata.isFile()) return await readFile(path);
    if (metadata.isSymbolicLink()) return Buffer.from(await readlink(path));
    return null;
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw new Error('a Git-trackable public file could not be read');
  }
}

function scanValue(bytes, path, location, tokens, findings) {
  for (const token of tokens) {
    let occurrences = 0;
    let offset = bytes.indexOf(token.bytes);
    while (offset !== -1) {
      occurrences += 1;
      offset = bytes.indexOf(token.bytes, offset + token.bytes.length);
    }
    if (occurrences > 0) {
      findings.push({
        file: redactSensitiveValues(path, tokens),
        location,
        sensitiveRef: token.ref,
        kinds: token.kinds,
        occurrences,
      });
    }
  }
}

function redactSensitiveValues(value, tokens) {
  return [...tokens]
    .sort((left, right) => right.value.length - left.value.length)
    .reduce((output, token) => output.split(token.value).join('<redacted>'), value);
}

function compareFindings(left, right) {
  return (
    left.file.localeCompare(right.file) ||
    left.location.localeCompare(right.location) ||
    left.sensitiveRef.localeCompare(right.sensitiveRef)
  );
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseArgs(argv) {
  const options = { repositoryRoot: defaultRepositoryRoot, privateInputPaths: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--private-input') options.privateInputPaths.push(resolve(argv[++index]));
    else if (argument === '--repository-root') options.repositoryRoot = resolve(argv[++index]);
    else throw new Error('unknown privacy-audit option');
  }
  if (options.privateInputPaths.length === 0) {
    throw new Error('--private-input is required');
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await auditQualificationPrivacy(parseArgs(process.argv.slice(2)));
    if (!result.ok) {
      const files = new Set(result.findings.map((finding) => finding.file));
      console.error(
        `Qualification privacy audit failed: ${result.findings.length} exact match group(s) in ${files.size} public file(s).`,
      );
      for (const finding of result.findings) {
        console.error(
          `${finding.file}: ${finding.location}, ${finding.sensitiveRef}, ${finding.occurrences} occurrence(s)`,
        );
      }
      process.exitCode = 1;
    } else {
      console.log(
        JSON.stringify(
          {
            ok: true,
            scannedFiles: result.scannedFiles,
            sensitiveValueCount: result.sensitiveValueCount,
          },
          null,
          2,
        ),
      );
    }
  } catch {
    console.error('Qualification privacy audit could not complete; inspect private inputs locally.');
    process.exitCode = 1;
  }
}
