import { createHash } from 'node:crypto';
import {
  closeSync,
  constants,
  type Dirent,
  fstatSync,
  lstatSync,
  openSync,
  readdirSync,
  readSync,
  realpathSync,
  type Stats,
} from 'node:fs';
import { extname, isAbsolute, relative, resolve } from 'node:path';

export const ADOPTION_RECEIPT_VERSION = 1 as const;
export const ADOPTION_RECEIPT_HASH_ALGORITHM = 'sha256' as const;

export type AdoptionPathOwnership = 'allowed-generated' | 'host-source' | 'host-other';
export type AdoptionIntegrityStatus = 'verified-untouched' | 'source-changed' | 'incomplete';
export type AdoptionCaptureLimitationCode =
  | 'byte-limit'
  | 'capture-mismatch'
  | 'changed-during-capture'
  | 'depth-limit'
  | 'entry-limit'
  | 'file-limit'
  | 'file-size-limit'
  | 'limitation-list-truncated'
  | 'read-error'
  | 'symlink'
  | 'unsupported-entry';

export interface AdoptionCaptureBounds {
  maxDepth: number;
  maxEntries: number;
  maxFiles: number;
  maxFileSizeBytes: number;
  maxTotalBytes: number;
}

export interface AdoptionSnapshotOptions extends Partial<AdoptionCaptureBounds> {
  /** Selected app scope, absolute or relative to workspaceRoot. Capture remains workspace-wide. */
  projectRoot?: string;
}

export interface AdoptionCaptureLimitation {
  code: AdoptionCaptureLimitationCode;
  path: string | null;
  message: string;
}

export interface AdoptionSnapshotFile {
  path: string;
  ownership: AdoptionPathOwnership;
  sizeBytes: number;
  hash: string;
}

export interface AdoptionSnapshot {
  version: typeof ADOPTION_RECEIPT_VERSION;
  workspaceRoot: string;
  scopeRoot: string;
  capturedRoots: string[];
  hashAlgorithm: typeof ADOPTION_RECEIPT_HASH_ALGORITHM;
  symlinkPolicy: 'not-followed';
  excludedDirectories: string[];
  excludedPaths: string[];
  bounds: AdoptionCaptureBounds;
  files: AdoptionSnapshotFile[];
  complete: boolean;
  limitations: AdoptionCaptureLimitation[];
}

export interface AdoptionPathChanges {
  created: string[];
  updated: string[];
  deleted: string[];
}

export interface AdoptionReceiptLimitation extends AdoptionCaptureLimitation {
  phase: 'before' | 'after' | 'comparison';
}

export interface AdoptionReceipt {
  version: typeof ADOPTION_RECEIPT_VERSION;
  scope: {
    root: string;
    capturedRoots: string[];
    hashAlgorithm: typeof ADOPTION_RECEIPT_HASH_ALGORITHM;
    symlinkPolicy: 'not-followed';
    excludedDirectories: string[];
    excludedPaths: string[];
    bounds: AdoptionCaptureBounds;
  };
  integrity: {
    status: AdoptionIntegrityStatus;
    complete: boolean;
    hostSourceBeforeHash: string;
    hostSourceAfterHash: string;
  };
  changes: AdoptionPathChanges & {
    allowedGenerated: AdoptionPathChanges;
    /** Compatibility alias for version 1 receipt readers. */
    decantrManaged: AdoptionPathChanges;
    hostSource: AdoptionPathChanges;
    hostOther: AdoptionPathChanges;
  };
  limitations: AdoptionReceiptLimitation[];
}

export const DEFAULT_ADOPTION_CAPTURE_BOUNDS: Readonly<AdoptionCaptureBounds> = Object.freeze({
  maxDepth: 64,
  maxEntries: 20_000,
  maxFiles: 10_000,
  maxFileSizeBytes: 8 * 1024 * 1024,
  maxTotalBytes: 128 * 1024 * 1024,
});

const MAX_RECORDED_LIMITATIONS = 100;
const READ_BUFFER_BYTES = 64 * 1024;

const EXCLUDED_DIRECTORY_NAMES = Object.freeze(
  [
    '.angular',
    '.cache',
    '.git',
    '.next',
    '.nuxt',
    '.output',
    '.parcel-cache',
    '.pnpm-store',
    '.svelte-kit',
    '.turbo',
    '.vercel',
    '.vite',
    'build',
    'coverage',
    'dist',
    'node_modules',
    'out',
    'playwright-report',
    'target',
    'vendor',
  ].sort(compareText),
);

const EXCLUDED_RELATIVE_DIRECTORIES = Object.freeze(['.decantr/cache', '.yarn/cache']);

const HOST_SOURCE_DIRECTORIES = new Set([
  'app',
  'assets',
  'client',
  'components',
  'frontend',
  'lib',
  'pages',
  'public',
  'routes',
  'server',
  'src',
  'static',
  'styles',
  'ui',
  'views',
]);

const HOST_SOURCE_EXTENSIONS = new Set([
  '.astro',
  '.cjs',
  '.cs',
  '.css',
  '.cts',
  '.ejs',
  '.erb',
  '.gql',
  '.go',
  '.graphql',
  '.hbs',
  '.handlebars',
  '.htm',
  '.html',
  '.java',
  '.js',
  '.jsx',
  '.kt',
  '.less',
  '.liquid',
  '.mdx',
  '.mjs',
  '.mts',
  '.njk',
  '.php',
  '.py',
  '.rb',
  '.rs',
  '.sass',
  '.scss',
  '.styl',
  '.svelte',
  '.ts',
  '.tsx',
  '.twig',
  '.vue',
]);

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

function workspaceRelativePath(workspaceRoot: string, absolutePath: string): string {
  return normalizePath(relative(workspaceRoot, absolutePath)) || '.';
}

function isInsideRoot(root: string, candidate: string): boolean {
  const candidateRelative = normalizePath(relative(root, candidate));
  return (
    candidateRelative === '' ||
    (!isAbsolute(candidateRelative) &&
      candidateRelative !== '..' &&
      !candidateRelative.startsWith('../'))
  );
}

function resolveDirectory(path: string, label: string): string {
  const absolutePath = resolve(path);
  let stats: Stats;
  try {
    stats = lstatSync(absolutePath);
  } catch {
    throw new Error(`${label} does not exist or cannot be read: ${absolutePath}`);
  }
  if (stats.isSymbolicLink()) {
    throw new Error(`${label} must not be a symbolic link: ${absolutePath}`);
  }
  if (!stats.isDirectory()) {
    throw new Error(`${label} must be a directory: ${absolutePath}`);
  }
  return realpathSync(absolutePath);
}

function resolveBounds(options: AdoptionSnapshotOptions): AdoptionCaptureBounds {
  const integerBound = (
    name: keyof AdoptionCaptureBounds,
    fallback: number,
    minimum: number,
  ): number => {
    const value = options[name] ?? fallback;
    if (!Number.isSafeInteger(value) || value < minimum) {
      throw new RangeError(`${name} must be a safe integer greater than or equal to ${minimum}.`);
    }
    return value;
  };

  return {
    maxDepth: integerBound('maxDepth', DEFAULT_ADOPTION_CAPTURE_BOUNDS.maxDepth, 0),
    maxEntries: integerBound('maxEntries', DEFAULT_ADOPTION_CAPTURE_BOUNDS.maxEntries, 1),
    maxFiles: integerBound('maxFiles', DEFAULT_ADOPTION_CAPTURE_BOUNDS.maxFiles, 1),
    maxFileSizeBytes: integerBound(
      'maxFileSizeBytes',
      DEFAULT_ADOPTION_CAPTURE_BOUNDS.maxFileSizeBytes,
      1,
    ),
    maxTotalBytes: integerBound('maxTotalBytes', DEFAULT_ADOPTION_CAPTURE_BOUNDS.maxTotalBytes, 1),
  };
}

function isExcludedDirectory(
  name: string,
  workspaceRelativePath: string,
  scopeRelativePath: string,
): boolean {
  if (EXCLUDED_DIRECTORY_NAMES.includes(name)) return true;
  return EXCLUDED_RELATIVE_DIRECTORIES.some((excluded) =>
    [workspaceRelativePath, scopeRelativePath].some(
      (candidate) => candidate === excluded || candidate.startsWith(`${excluded}/`),
    ),
  );
}

function isAllowedGeneratedPath(path: string): boolean {
  const segments = path.split('/');
  const filename = segments.at(-1) ?? path;
  if (segments.includes('.decantr')) return true;
  if (filename === 'DECANTR.md' || filename === 'decantr.essence.json') return true;
  if (
    segments.length >= 3 &&
    segments.at(-3) === '.github' &&
    segments.at(-2) === 'workflows' &&
    /^decantr-.+\.ya?ml$/i.test(filename)
  ) {
    return true;
  }
  if (segments.at(-3) === '.claude' && segments.at(-2) === 'rules' && filename === 'decantr.md') {
    return true;
  }
  return segments.at(-3) === '.cursor' && segments.at(-2) === 'rules' && filename === 'decantr.mdc';
}

export function classifyAdoptionPath(path: string): AdoptionPathOwnership {
  const normalized = normalizePath(path).replace(/^\.\//, '');
  if (isAllowedGeneratedPath(normalized)) return 'allowed-generated';

  const segments = normalized.split('/');
  if (segments.some((segment) => HOST_SOURCE_DIRECTORIES.has(segment.toLowerCase()))) {
    return 'host-source';
  }
  return HOST_SOURCE_EXTENSIONS.has(extname(normalized).toLowerCase())
    ? 'host-source'
    : 'host-other';
}

function compareSnapshotFiles(left: AdoptionSnapshotFile, right: AdoptionSnapshotFile): number {
  return compareText(left.path, right.path);
}

function compareCaptureLimitations(
  left: AdoptionCaptureLimitation,
  right: AdoptionCaptureLimitation,
): number {
  return (
    compareText(left.path ?? '', right.path ?? '') ||
    compareText(left.code, right.code) ||
    compareText(left.message, right.message)
  );
}

/**
 * Captures a bounded, read-only filesystem snapshot. Callers own all writes between
 * this pre-adoption capture and the corresponding post-adoption capture.
 */
export function captureAdoptionSnapshot(
  workspaceRoot: string,
  options: AdoptionSnapshotOptions = {},
): AdoptionSnapshot {
  const canonicalWorkspaceRoot = resolveDirectory(workspaceRoot, 'workspaceRoot');
  const requestedProjectRoot = options.projectRoot
    ? isAbsolute(options.projectRoot)
      ? options.projectRoot
      : resolve(canonicalWorkspaceRoot, options.projectRoot)
    : canonicalWorkspaceRoot;
  const canonicalProjectRoot = resolveDirectory(requestedProjectRoot, 'projectRoot');
  if (!isInsideRoot(canonicalWorkspaceRoot, canonicalProjectRoot)) {
    throw new Error('projectRoot must be contained by workspaceRoot.');
  }

  const bounds = resolveBounds(options);
  const files: AdoptionSnapshotFile[] = [];
  const limitations: AdoptionCaptureLimitation[] = [];
  let omittedLimitations = 0;
  let entriesVisited = 0;
  let totalBytes = 0;
  let stopped = false;

  const addLimitation = (
    code: AdoptionCaptureLimitationCode,
    path: string | null,
    message: string,
  ): void => {
    if (limitations.length < MAX_RECORDED_LIMITATIONS) {
      limitations.push({ code, path, message });
    } else {
      omittedLimitations += 1;
    }
  };

  const hashFile = (
    absolutePath: string,
    relativePath: string,
  ): { hash: string; sizeBytes: number } | null => {
    let descriptor: number | null = null;
    try {
      const noFollow = typeof constants.O_NOFOLLOW === 'number' ? constants.O_NOFOLLOW : 0;
      descriptor = openSync(absolutePath, constants.O_RDONLY | noFollow);
      const beforeStats = fstatSync(descriptor);
      if (!beforeStats.isFile()) {
        addLimitation(
          'unsupported-entry',
          relativePath,
          'The path was not a regular file when opened and was not captured.',
        );
        return null;
      }
      if (beforeStats.size > bounds.maxFileSizeBytes) {
        addLimitation(
          'file-size-limit',
          relativePath,
          `The file exceeds the ${bounds.maxFileSizeBytes}-byte per-file capture limit.`,
        );
        return null;
      }
      if (totalBytes + beforeStats.size > bounds.maxTotalBytes) {
        addLimitation(
          'byte-limit',
          relativePath,
          `Traversal stopped at the ${bounds.maxTotalBytes}-byte total capture limit.`,
        );
        stopped = true;
        return null;
      }

      const hash = createHash(ADOPTION_RECEIPT_HASH_ALGORITHM);
      const buffer = Buffer.allocUnsafe(READ_BUFFER_BYTES);
      let bytesReadTotal = 0;
      while (bytesReadTotal < beforeStats.size) {
        const requestedBytes = Math.min(buffer.length, beforeStats.size - bytesReadTotal);
        const bytesRead = readSync(descriptor, buffer, 0, requestedBytes, null);
        if (bytesRead === 0) break;
        hash.update(buffer.subarray(0, bytesRead));
        bytesReadTotal += bytesRead;
      }

      const afterStats = fstatSync(descriptor);
      if (
        bytesReadTotal !== beforeStats.size ||
        afterStats.size !== beforeStats.size ||
        afterStats.mtimeMs !== beforeStats.mtimeMs ||
        afterStats.ctimeMs !== beforeStats.ctimeMs ||
        afterStats.dev !== beforeStats.dev ||
        afterStats.ino !== beforeStats.ino
      ) {
        addLimitation(
          'changed-during-capture',
          relativePath,
          'The file changed while it was being captured and no stable hash was recorded.',
        );
        return null;
      }

      totalBytes += bytesReadTotal;
      return {
        hash: `${ADOPTION_RECEIPT_HASH_ALGORITHM}:${hash.digest('hex')}`,
        sizeBytes: bytesReadTotal,
      };
    } catch {
      addLimitation('read-error', relativePath, 'The file could not be read during capture.');
      return null;
    } finally {
      if (descriptor !== null) {
        try {
          closeSync(descriptor);
        } catch {
          // The captured content remains usable; closing does not change the evidence.
        }
      }
    }
  };

  const walk = (directory: string, depth: number): void => {
    if (stopped) return;

    let entries: Dirent[];
    try {
      entries = readdirSync(directory, { withFileTypes: true }).sort((left, right) =>
        compareText(left.name, right.name),
      );
    } catch {
      addLimitation(
        'read-error',
        workspaceRelativePath(canonicalWorkspaceRoot, directory),
        'The directory could not be read during capture.',
      );
      return;
    }

    for (const entry of entries) {
      if (stopped) break;
      const absolutePath = resolve(directory, entry.name);
      const relativePath = workspaceRelativePath(canonicalWorkspaceRoot, absolutePath);
      const scopeRelativePath = normalizePath(relative(canonicalProjectRoot, absolutePath));

      if (entriesVisited >= bounds.maxEntries) {
        addLimitation(
          'entry-limit',
          relativePath,
          `Traversal stopped at the ${bounds.maxEntries}-entry capture limit.`,
        );
        stopped = true;
        break;
      }
      entriesVisited += 1;

      if (isExcludedDirectory(entry.name, relativePath, scopeRelativePath)) continue;

      let stats: Stats;
      try {
        stats = lstatSync(absolutePath);
      } catch {
        addLimitation(
          'read-error',
          relativePath,
          'The path could not be inspected during capture.',
        );
        continue;
      }

      if (stats.isSymbolicLink()) {
        addLimitation(
          'symlink',
          relativePath,
          'The symbolic link was not followed, so capture coverage is incomplete.',
        );
        continue;
      }

      if (stats.isDirectory()) {
        if (depth >= bounds.maxDepth) {
          addLimitation(
            'depth-limit',
            relativePath,
            `The directory was not traversed beyond the configured depth of ${bounds.maxDepth}.`,
          );
          continue;
        }
        walk(absolutePath, depth + 1);
        continue;
      }

      if (!stats.isFile()) {
        addLimitation(
          'unsupported-entry',
          relativePath,
          'The path is not a regular file or directory and was not captured.',
        );
        continue;
      }

      if (files.length >= bounds.maxFiles) {
        addLimitation(
          'file-limit',
          relativePath,
          `Traversal stopped at the ${bounds.maxFiles}-file capture limit.`,
        );
        stopped = true;
        break;
      }

      const fileEvidence = hashFile(absolutePath, relativePath);
      if (!fileEvidence) continue;
      files.push({
        path: relativePath,
        ownership: classifyAdoptionPath(relativePath),
        sizeBytes: fileEvidence.sizeBytes,
        hash: fileEvidence.hash,
      });
    }
  };

  walk(canonicalWorkspaceRoot, 0);

  if (omittedLimitations > 0) {
    limitations.push({
      code: 'limitation-list-truncated',
      path: null,
      message: `${omittedLimitations} additional capture limitations were omitted.`,
    });
  }

  const sortedLimitations = limitations.sort(compareCaptureLimitations);
  return {
    version: ADOPTION_RECEIPT_VERSION,
    workspaceRoot: canonicalWorkspaceRoot,
    scopeRoot: workspaceRelativePath(canonicalWorkspaceRoot, canonicalProjectRoot),
    capturedRoots: ['.'],
    hashAlgorithm: ADOPTION_RECEIPT_HASH_ALGORITHM,
    symlinkPolicy: 'not-followed',
    excludedDirectories: [...EXCLUDED_DIRECTORY_NAMES],
    excludedPaths: [...EXCLUDED_RELATIVE_DIRECTORIES],
    bounds,
    files: files.sort(compareSnapshotFiles),
    complete: sortedLimitations.length === 0,
    limitations: sortedLimitations,
  };
}

function emptyPathChanges(): AdoptionPathChanges {
  return { created: [], updated: [], deleted: [] };
}

function sameBounds(left: AdoptionCaptureBounds, right: AdoptionCaptureBounds): boolean {
  return (
    left.maxDepth === right.maxDepth &&
    left.maxEntries === right.maxEntries &&
    left.maxFiles === right.maxFiles &&
    left.maxFileSizeBytes === right.maxFileSizeBytes &&
    left.maxTotalBytes === right.maxTotalBytes
  );
}

function hashHostSource(files: AdoptionSnapshotFile[]): string {
  const hash = createHash(ADOPTION_RECEIPT_HASH_ALGORITHM);
  hash.update('decantr-adoption-host-source-v1\0');
  for (const file of files
    .filter((entry) => entry.ownership === 'host-source')
    .sort(compareSnapshotFiles)) {
    hash.update(String(Buffer.byteLength(file.path, 'utf-8')));
    hash.update(':');
    hash.update(file.path, 'utf-8');
    hash.update('\0');
    hash.update(file.hash);
    hash.update('\n');
  }
  return `${ADOPTION_RECEIPT_HASH_ALGORITHM}:${hash.digest('hex')}`;
}

function compareReceiptLimitations(
  left: AdoptionReceiptLimitation,
  right: AdoptionReceiptLimitation,
): number {
  const phaseOrder = { before: 0, after: 1, comparison: 2 } as const;
  return phaseOrder[left.phase] - phaseOrder[right.phase] || compareCaptureLimitations(left, right);
}

/** Builds a deterministic receipt value and never writes it to the workspace. */
export function createAdoptionReceipt(
  before: AdoptionSnapshot,
  after: AdoptionSnapshot,
): AdoptionReceipt {
  if (before.version !== ADOPTION_RECEIPT_VERSION || after.version !== ADOPTION_RECEIPT_VERSION) {
    throw new Error(`Adoption snapshots must use version ${ADOPTION_RECEIPT_VERSION}.`);
  }
  if (before.workspaceRoot !== after.workspaceRoot) {
    throw new Error('Adoption snapshots must refer to the same workspaceRoot.');
  }
  if (before.scopeRoot !== after.scopeRoot) {
    throw new Error('Adoption snapshots must refer to the same scopeRoot.');
  }

  const limitations: AdoptionReceiptLimitation[] = [
    ...before.limitations.map((limitation) => ({ ...limitation, phase: 'before' as const })),
    ...after.limitations.map((limitation) => ({ ...limitation, phase: 'after' as const })),
  ];
  if (!sameBounds(before.bounds, after.bounds)) {
    limitations.push({
      phase: 'comparison',
      code: 'capture-mismatch',
      path: null,
      message: 'Before and after captures used different traversal bounds.',
    });
  }
  if (
    before.capturedRoots.length !== after.capturedRoots.length ||
    before.capturedRoots.some((root, index) => root !== after.capturedRoots[index])
  ) {
    limitations.push({
      phase: 'comparison',
      code: 'capture-mismatch',
      path: null,
      message: 'Before and after captures used different workspace roots.',
    });
  }

  const beforeByPath = new Map(before.files.map((file) => [file.path, file]));
  const afterByPath = new Map(after.files.map((file) => [file.path, file]));
  const allPaths = [...new Set([...beforeByPath.keys(), ...afterByPath.keys()])].sort(compareText);
  const changes = emptyPathChanges();
  const allowedGenerated = emptyPathChanges();
  const hostSource = emptyPathChanges();
  const hostOther = emptyPathChanges();
  const changesByOwnership: Record<AdoptionPathOwnership, AdoptionPathChanges> = {
    'allowed-generated': allowedGenerated,
    'host-source': hostSource,
    'host-other': hostOther,
  };

  for (const path of allPaths) {
    const beforeFile = beforeByPath.get(path);
    const afterFile = afterByPath.get(path);
    let change: keyof AdoptionPathChanges | null = null;
    let ownership: AdoptionPathOwnership | null = null;

    if (!beforeFile && afterFile) {
      change = 'created';
      ownership = afterFile.ownership;
    } else if (beforeFile && !afterFile) {
      change = 'deleted';
      ownership = beforeFile.ownership;
    } else if (beforeFile && afterFile && beforeFile.hash !== afterFile.hash) {
      change = 'updated';
      ownership = afterFile.ownership;
    }

    if (change && ownership) {
      changes[change].push(path);
      changesByOwnership[ownership][change].push(path);
    }
  }

  const hostSourceChanged =
    hostSource.created.length > 0 || hostSource.updated.length > 0 || hostSource.deleted.length > 0;
  const sortedLimitations = limitations.sort(compareReceiptLimitations);
  const complete = before.complete && after.complete && sortedLimitations.length === 0;
  const status: AdoptionIntegrityStatus = hostSourceChanged
    ? 'source-changed'
    : complete
      ? 'verified-untouched'
      : 'incomplete';

  return {
    version: ADOPTION_RECEIPT_VERSION,
    scope: {
      root: before.scopeRoot,
      capturedRoots: [...before.capturedRoots],
      hashAlgorithm: ADOPTION_RECEIPT_HASH_ALGORITHM,
      symlinkPolicy: 'not-followed',
      excludedDirectories: [...before.excludedDirectories],
      excludedPaths: [...before.excludedPaths],
      bounds: { ...before.bounds },
    },
    integrity: {
      status,
      complete,
      hostSourceBeforeHash: hashHostSource(before.files),
      hostSourceAfterHash: hashHostSource(after.files),
    },
    changes: {
      ...changes,
      allowedGenerated,
      decantrManaged: allowedGenerated,
      hostSource,
      hostOther,
    },
    limitations: sortedLimitations,
  };
}
