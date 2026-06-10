import { existsSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { extname, isAbsolute, join, relative, resolve } from 'node:path';
import * as ts from 'typescript';

export type ProjectSourceLanguage = 'typescript' | 'javascript';

export type ProjectSourceKind = 'ts' | 'tsx' | 'mts' | 'cts' | 'js' | 'jsx' | 'mjs' | 'cjs';

export type SourceInventorySkipReason =
  | 'ignored-directory'
  | 'ignored-file'
  | 'oversized'
  | 'symlink'
  | 'walk-limit';

export interface SourceInventorySkippedPath {
  path: string;
  reason: SourceInventorySkipReason;
}

export interface ProjectSourceFile {
  absolutePath: string;
  relativePath: string;
  extension: string;
  kind: ProjectSourceKind;
  language: ProjectSourceLanguage;
  scriptKind: ts.ScriptKind;
  jsx: boolean;
  sizeBytes: number;
}

export interface SourceInventoryOptions {
  roots?: readonly string[];
  extensions?: readonly string[];
  includeTests?: boolean;
  includeFixtures?: boolean;
  maxFiles?: number;
  maxFileSizeBytes?: number;
}

export interface SourceInventory {
  projectRoot: string;
  files: ProjectSourceFile[];
  skipped: SourceInventorySkippedPath[];
  hasTypeScript: boolean;
  hasJavaScript: boolean;
  primaryLanguage: ProjectSourceLanguage | 'mixed' | 'unknown';
}

const DEFAULT_MAX_FILES = 5000;
const DEFAULT_MAX_FILE_SIZE_BYTES = 512 * 1024;

const DEFAULT_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs']);

const GENERATED_AND_DEPENDENCY_DIRS = new Set([
  '.cache',
  '.git',
  '.next',
  '.nuxt',
  '.svelte-kit',
  '.turbo',
  '.vite',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
  'target',
  'vendor',
]);

const TEST_OR_MOCK_DIR_RE = /(?:^|\/)(?:__mocks__|__tests__|mocks?|specs?|tests?)(?:\/|$)/i;
const FIXTURE_DIR_RE = /(?:^|\/)fixtures?(?:\/|$)/i;
const DECLARATION_FILE_RE = /\.d\.[cm]?ts$/i;
const TEST_OR_MOCK_FILE_RE = /\.(?:mock|spec|test)\.[cm]?[jt]sx?$/i;
const STORY_FILE_RE = /\.(?:stories|story)\.[cm]?[jt]sx?$/i;
const FIXTURE_FILE_RE = /\.fixture\.[cm]?[jt]sx?$/i;

export function normalizeSourcePath(path: string): string {
  return path.replace(/\\/g, '/');
}

export function isPathInsideProject(projectRoot: string, absolutePath: string): boolean {
  const normalizedRelative = normalizeSourcePath(relative(projectRoot, absolutePath));
  return (
    normalizedRelative === '' ||
    (!normalizedRelative.startsWith('../') && normalizedRelative !== '..')
  );
}

export function isSupportedSourceExtension(
  extension: string,
  extensions?: readonly string[],
): boolean {
  const normalized = extension.toLowerCase();
  return extensions
    ? extensions.map((entry) => entry.toLowerCase()).includes(normalized)
    : DEFAULT_EXTENSIONS.has(normalized);
}

export function sourceKindFromPath(path: string): ProjectSourceKind | null {
  const extension = extname(path).toLowerCase();
  switch (extension) {
    case '.ts':
      return 'ts';
    case '.tsx':
      return 'tsx';
    case '.mts':
      return 'mts';
    case '.cts':
      return 'cts';
    case '.js':
      return 'js';
    case '.jsx':
      return 'jsx';
    case '.mjs':
      return 'mjs';
    case '.cjs':
      return 'cjs';
    default:
      return null;
  }
}

export function sourceScriptKindFromPath(path: string): ts.ScriptKind {
  const kind = sourceKindFromPath(path);
  switch (kind) {
    case 'ts':
    case 'mts':
    case 'cts':
      return ts.ScriptKind.TS;
    case 'tsx':
      return ts.ScriptKind.TSX;
    case 'jsx':
      return ts.ScriptKind.JSX;
    case 'js':
    case 'mjs':
    case 'cjs':
      return ts.ScriptKind.JS;
    default:
      return ts.ScriptKind.Unknown;
  }
}

export function sourceLanguageFromPath(path: string): ProjectSourceLanguage | null {
  const kind = sourceKindFromPath(path);
  if (!kind) return null;
  return kind === 'ts' || kind === 'tsx' || kind === 'mts' || kind === 'cts'
    ? 'typescript'
    : 'javascript';
}

function shouldSkipDirectory(relativePath: string, options: SourceInventoryOptions): boolean {
  const normalized = normalizeSourcePath(relativePath);
  const basename = normalized.split('/').at(-1) ?? normalized;
  if (GENERATED_AND_DEPENDENCY_DIRS.has(basename)) return true;
  if (!options.includeTests && TEST_OR_MOCK_DIR_RE.test(normalized)) return true;
  if (!options.includeFixtures && FIXTURE_DIR_RE.test(normalized)) return true;
  return false;
}

function shouldSkipFile(relativePath: string, options: SourceInventoryOptions): boolean {
  const normalized = normalizeSourcePath(relativePath);
  if (DECLARATION_FILE_RE.test(normalized)) return true;
  if (
    !options.includeTests &&
    (TEST_OR_MOCK_FILE_RE.test(normalized) || STORY_FILE_RE.test(normalized))
  ) {
    return true;
  }
  if (!options.includeFixtures && FIXTURE_FILE_RE.test(normalized)) return true;
  return false;
}

function inventoryFile(projectRoot: string, absolutePath: string): ProjectSourceFile | null {
  const extension = extname(absolutePath).toLowerCase();
  const kind = sourceKindFromPath(absolutePath);
  const language = sourceLanguageFromPath(absolutePath);
  if (!kind || !language) return null;
  const relativePath = normalizeSourcePath(relative(projectRoot, absolutePath) || absolutePath);
  const sizeBytes = statSync(absolutePath).size;
  return {
    absolutePath,
    relativePath,
    extension,
    kind,
    language,
    scriptKind: sourceScriptKindFromPath(absolutePath),
    jsx: kind === 'tsx' || kind === 'jsx',
    sizeBytes,
  };
}

function compareSourceFiles(a: ProjectSourceFile, b: ProjectSourceFile): number {
  return a.relativePath.localeCompare(b.relativePath);
}

function compareSkipped(a: SourceInventorySkippedPath, b: SourceInventorySkippedPath): number {
  return a.path.localeCompare(b.path) || a.reason.localeCompare(b.reason);
}

export function createSourceInventory(
  projectRoot: string,
  options: SourceInventoryOptions = {},
): SourceInventory {
  const root = realpathSync(resolve(projectRoot));
  const files: ProjectSourceFile[] = [];
  const seenFiles = new Set<string>();
  const skipped: SourceInventorySkippedPath[] = [];
  const maxFiles = options.maxFiles ?? DEFAULT_MAX_FILES;
  const maxFileSizeBytes = options.maxFileSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES;
  const requestedRoots = options.roots?.length ? [...options.roots] : ['.'];
  const roots = requestedRoots
    .map((entry) => (isAbsolute(entry) ? resolve(entry) : resolve(root, entry)))
    .filter((entry) => existsSync(entry) && isPathInsideProject(root, entry));

  const addSkipped = (path: string, reason: SourceInventorySkipReason): void => {
    skipped.push({ path: normalizeSourcePath(relative(root, path) || path), reason });
  };

  const addFile = (absolutePath: string): void => {
    const normalized = normalizeSourcePath(resolve(absolutePath));
    if (seenFiles.has(normalized)) return;
    const sourceFile = inventoryFile(root, absolutePath);
    if (!sourceFile) return;
    seenFiles.add(normalized);
    files.push(sourceFile);
  };

  const walk = (directory: string): void => {
    if (files.length >= maxFiles) {
      addSkipped(directory, 'walk-limit');
      return;
    }

    const entries = readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    for (const entry of entries) {
      if (files.length >= maxFiles) {
        addSkipped(join(directory, entry.name), 'walk-limit');
        continue;
      }

      const absolutePath = join(directory, entry.name);
      const relativePath = normalizeSourcePath(relative(root, absolutePath) || absolutePath);

      if (entry.isSymbolicLink()) {
        addSkipped(absolutePath, 'symlink');
        continue;
      }

      if (entry.isDirectory()) {
        if (shouldSkipDirectory(relativePath, options)) {
          addSkipped(absolutePath, 'ignored-directory');
          continue;
        }
        walk(absolutePath);
        continue;
      }

      if (!entry.isFile()) continue;
      const extension = extname(entry.name).toLowerCase();
      if (!isSupportedSourceExtension(extension, options.extensions)) continue;
      if (shouldSkipFile(relativePath, options)) {
        addSkipped(absolutePath, 'ignored-file');
        continue;
      }

      const stat = statSync(absolutePath);
      if (stat.size > maxFileSizeBytes) {
        addSkipped(absolutePath, 'oversized');
        continue;
      }

      addFile(absolutePath);
    }
  };

  for (const rootPath of roots) {
    if (files.length >= maxFiles) {
      addSkipped(rootPath, 'walk-limit');
      continue;
    }

    const stat = statSync(rootPath);
    if (stat.isDirectory()) {
      const relativeRoot = normalizeSourcePath(relative(root, rootPath));
      if (relativeRoot && shouldSkipDirectory(relativeRoot, options)) {
        addSkipped(rootPath, 'ignored-directory');
        continue;
      }
      walk(rootPath);
    } else if (stat.isFile()) {
      const extension = extname(rootPath).toLowerCase();
      if (!isSupportedSourceExtension(extension, options.extensions)) continue;
      const relativeFile = normalizeSourcePath(relative(root, rootPath));
      if (shouldSkipFile(relativeFile, options)) {
        addSkipped(rootPath, 'ignored-file');
        continue;
      }
      addFile(rootPath);
    }
  }

  const sortedFiles = files.sort(compareSourceFiles);
  const hasTypeScript = sortedFiles.some((file) => file.language === 'typescript');
  const hasJavaScript = sortedFiles.some((file) => file.language === 'javascript');

  return {
    projectRoot: root,
    files: sortedFiles,
    skipped: skipped.sort(compareSkipped),
    hasTypeScript,
    hasJavaScript,
    primaryLanguage:
      hasTypeScript && hasJavaScript
        ? 'mixed'
        : hasTypeScript
          ? 'typescript'
          : hasJavaScript
            ? 'javascript'
            : 'unknown',
  };
}
