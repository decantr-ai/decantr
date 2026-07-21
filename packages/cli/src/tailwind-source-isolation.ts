import { createHash } from 'node:crypto';
import { type Dirent, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

export const TAILWIND_SOURCE_ISOLATION_KIND = 'tailwind-v4-source-isolation' as const;

const START = '/* decantr:tailwind-source-isolation:start */';
const END = '/* decantr:tailwind-source-isolation:end */';
const MAX_STYLESHEET_BYTES = 1024 * 1024;
const MAX_VISITED_ENTRIES = 20_000;
const SKIPPED_DIRECTORIES = new Set([
  '.angular',
  '.decantr',
  '.git',
  '.next',
  '.nuxt',
  '.output',
  '.svelte-kit',
  '.turbo',
  '.vercel',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
]);
const GOVERNANCE_SOURCE_PATHS = [
  '.decantr',
  'DECANTR.md',
  'decantr.essence.json',
  '.cursor/rules/decantr.mdc',
  '.claude/rules/decantr.md',
] as const;
const TAILWIND_IMPORT =
  /^[\t ]*@import[\t ]+(?:url\([\t ]*)?["']tailwindcss(?:\/[^"']*)?["'][^;\r\n]*;[\t ]*$/gmu;

export interface TailwindSourceIsolationMutation {
  kind: typeof TAILWIND_SOURCE_ISOLATION_KIND;
  path: string;
  beforeHash: string;
  afterHash: string;
  excludedPaths: string[];
}

export interface TailwindSourceIsolationResult {
  detected: boolean;
  entryFiles: string[];
  mutations: TailwindSourceIsolationMutation[];
  limitations: string[];
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

function sha256(content: string): string {
  return `sha256:${createHash('sha256').update(content, 'utf8').digest('hex')}`;
}

function readJson(path: string): Record<string, unknown> | null {
  try {
    const value = JSON.parse(readFileSync(path, 'utf8')) as unknown;
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function declaredMajor(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const normalized = value.replace(/^workspace:/u, '').trim();
  const match = normalized.match(/(?:^|[^0-9])(\d+)(?:\.|(?:[^0-9]|$))/u);
  return match ? Number.parseInt(match[1], 10) : null;
}

function packageRoots(projectRoot: string, workspaceRoot: string): string[] {
  const roots: string[] = [];
  let current = resolve(projectRoot);
  const stop = resolve(workspaceRoot);
  while (true) {
    roots.push(current);
    if (current === stop || dirname(current) === current) break;
    current = dirname(current);
  }
  if (!roots.includes(stop)) roots.push(stop);
  return roots;
}

function tailwindV4Declared(projectRoot: string, workspaceRoot: string): boolean {
  for (const root of packageRoots(projectRoot, workspaceRoot)) {
    const manifest = readJson(join(root, 'package.json'));
    if (!manifest) continue;
    const dependencyMaps = ['dependencies', 'devDependencies', 'peerDependencies']
      .map((key) => manifest[key])
      .filter(
        (value): value is Record<string, unknown> =>
          Boolean(value) && typeof value === 'object' && !Array.isArray(value),
      );
    for (const dependencies of dependencyMaps) {
      for (const name of ['tailwindcss', '@tailwindcss/vite', '@tailwindcss/postcss']) {
        const version = dependencies[name];
        const major = declaredMajor(version);
        if (major !== null && major >= 4) return true;
        if (name === '@tailwindcss/vite' && typeof version === 'string' && version === 'latest') {
          return true;
        }
      }
    }
  }
  return false;
}

function installedTailwindV4(projectRoot: string, workspaceRoot: string): boolean {
  for (const root of packageRoots(projectRoot, workspaceRoot)) {
    const manifest = readJson(join(root, 'node_modules', 'tailwindcss', 'package.json'));
    const major = declaredMajor(manifest?.version);
    if (major !== null && major >= 4) return true;
  }
  return false;
}

function findTailwindEntryStylesheets(projectRoot: string): {
  paths: string[];
  limitations: string[];
} {
  const paths: string[] = [];
  const limitations: string[] = [];
  let visited = 0;

  const visit = (directory: string): void => {
    if (visited >= MAX_VISITED_ENTRIES) return;
    let entries: Dirent[];
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch {
      limitations.push(`Could not inspect Tailwind source isolation directory ${directory}.`);
      return;
    }
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      if (visited >= MAX_VISITED_ENTRIES) break;
      visited += 1;
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRECTORIES.has(entry.name)) visit(join(directory, entry.name));
        continue;
      }
      if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.css')) continue;
      const path = join(directory, entry.name);
      try {
        if (statSync(path).size > MAX_STYLESHEET_BYTES) continue;
        const content = readFileSync(path, 'utf8');
        TAILWIND_IMPORT.lastIndex = 0;
        if (TAILWIND_IMPORT.test(content)) paths.push(path);
      } catch {
        limitations.push(`Could not inspect Tailwind entry stylesheet ${path}.`);
      }
    }
  };

  visit(projectRoot);
  if (visited >= MAX_VISITED_ENTRIES) {
    limitations.push(
      `Tailwind source isolation stopped after ${MAX_VISITED_ENTRIES} filesystem entries.`,
    );
  }
  return { paths: paths.sort(), limitations };
}

function sourcePath(stylesheetPath: string, projectRoot: string, target: string): string {
  const path = normalizePath(relative(dirname(stylesheetPath), join(projectRoot, target)));
  return path.startsWith('./') || path.startsWith('../') ? path : `./${path}`;
}

function isolationBlock(
  stylesheetPath: string,
  projectRoot: string,
): { content: string; excludedPaths: string[] } {
  const excludedPaths = GOVERNANCE_SOURCE_PATHS.map((target) =>
    sourcePath(stylesheetPath, projectRoot, target),
  );
  return {
    excludedPaths,
    content: [
      START,
      ...excludedPaths.map((path) => `@source not ${JSON.stringify(path)};`),
      END,
    ].join('\n'),
  };
}

function upsertIsolationBlock(
  content: string,
  block: string,
): { content: string; limitation: string | null } {
  const start = content.indexOf(START);
  const end = content.indexOf(END, Math.max(0, start + START.length));
  if (start >= 0 || end >= 0) {
    if (start < 0 || end < start) {
      return {
        content,
        limitation: 'Tailwind source isolation markers are incomplete; no stylesheet was changed.',
      };
    }
    const next = `${content.slice(0, start)}${block}${content.slice(end + END.length)}`;
    return { content: next, limitation: null };
  }

  TAILWIND_IMPORT.lastIndex = 0;
  let insertion = -1;
  while (true) {
    const match = TAILWIND_IMPORT.exec(content);
    if (!match) break;
    insertion = match.index + match[0].length;
  }
  if (insertion < 0) {
    return {
      content,
      limitation: 'Tailwind v4 was detected, but no supported Tailwind CSS import was found.',
    };
  }
  const prefix = content.slice(0, insertion);
  const suffix = content.slice(insertion);
  return {
    content: `${prefix}\n\n${block}${suffix.startsWith('\n') ? '' : '\n'}${suffix}`,
    limitation: null,
  };
}

/**
 * Prevents Tailwind v4's plain-text scanner from treating generated governance
 * prose and contract JSON as application utility-class sources.
 */
export function applyTailwindSourceIsolation(
  projectRoot: string,
  workspaceRoot: string = projectRoot,
): TailwindSourceIsolationResult {
  const stylesheetScan = findTailwindEntryStylesheets(projectRoot);
  if (stylesheetScan.paths.length === 0) {
    return {
      detected: false,
      entryFiles: [],
      mutations: [],
      limitations: stylesheetScan.limitations,
    };
  }
  if (
    !tailwindV4Declared(projectRoot, workspaceRoot) &&
    !installedTailwindV4(projectRoot, workspaceRoot)
  ) {
    return {
      detected: false,
      entryFiles: stylesheetScan.paths.map((path) => normalizePath(relative(projectRoot, path))),
      mutations: [],
      limitations: [
        ...stylesheetScan.limitations,
        'A Tailwind CSS import was found, but Tailwind v4 could not be proven from package metadata.',
      ],
    };
  }

  const mutations: TailwindSourceIsolationMutation[] = [];
  const limitations = [...stylesheetScan.limitations];
  for (const stylesheetPath of stylesheetScan.paths) {
    const before = readFileSync(stylesheetPath, 'utf8');
    const block = isolationBlock(stylesheetPath, projectRoot);
    const updated = upsertIsolationBlock(before, block.content);
    if (updated.limitation) {
      limitations.push(
        `${normalizePath(relative(projectRoot, stylesheetPath))}: ${updated.limitation}`,
      );
      continue;
    }
    if (updated.content === before) continue;
    writeFileSync(stylesheetPath, updated.content, 'utf8');
    mutations.push({
      kind: TAILWIND_SOURCE_ISOLATION_KIND,
      path: normalizePath(relative(projectRoot, stylesheetPath)),
      beforeHash: sha256(before),
      afterHash: sha256(updated.content),
      excludedPaths: block.excludedPaths,
    });
  }

  return {
    detected: true,
    entryFiles: stylesheetScan.paths.map((path) => normalizePath(relative(projectRoot, path))),
    mutations,
    limitations,
  };
}
