import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export interface ComponentsAnalysis {
  pageCount: number;
  componentCount: number;
  directories: string[];
}

const PAGE_EXTENSIONS = new Set(['.tsx', '.ts', '.jsx', '.js']);
const ROOT_COMPONENT_CANDIDATES = [
  'src/App.tsx',
  'src/App.ts',
  'src/App.jsx',
  'src/App.js',
  'App.tsx',
  'App.ts',
  'App.jsx',
  'App.js',
];

function countFilesRecursive(dir: string, extensions: Set<string>): number {
  let count = 0;

  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return 0;
  }

  for (const entry of entries) {
    if (entry.startsWith('.') || entry === 'node_modules') continue;
    const fullPath = join(dir, entry);

    try {
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        count += countFilesRecursive(fullPath, extensions);
      } else if (stat.isFile()) {
        const ext = entry.slice(entry.lastIndexOf('.'));
        if (extensions.has(ext)) {
          count++;
        }
      }
    } catch {}
  }

  return count;
}

function countPageFiles(dir: string): number {
  let count = 0;

  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return 0;
  }

  for (const entry of entries) {
    if (entry.startsWith('.') || entry === 'node_modules') continue;
    const fullPath = join(dir, entry);

    try {
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        count += countPageFiles(fullPath);
      } else if (stat.isFile()) {
        // Count page.tsx/page.ts/page.jsx/page.js files (App Router)
        // or any .tsx/.jsx file in pages dir (Pages Router)
        if (entry.startsWith('page.') && PAGE_EXTENSIONS.has(entry.slice(entry.lastIndexOf('.')))) {
          count++;
        }
      }
    } catch {}
  }

  return count;
}

/**
 * Scan for page and component counts.
 */
export function scanComponents(projectRoot: string): ComponentsAnalysis {
  let pageCount = 0;
  const componentDirs: string[] = [];

  // Count pages from app directories
  const appDirs = [join(projectRoot, 'src', 'app'), join(projectRoot, 'app')];
  for (const dir of appDirs) {
    if (existsSync(dir)) {
      pageCount += countPageFiles(dir);
    }
  }

  // Count pages from pages directories (Pages Router)
  const pagesDirs = [join(projectRoot, 'src', 'pages'), join(projectRoot, 'pages')];
  for (const dir of pagesDirs) {
    if (existsSync(dir)) {
      pageCount += countFilesRecursive(dir, PAGE_EXTENSIONS);
    }
  }

  // Count components from components directories
  let componentCount = 0;
  const componentPaths = [
    join(projectRoot, 'src', 'components'),
    join(projectRoot, 'components'),
    join(projectRoot, 'src', 'ui'),
    join(projectRoot, 'ui'),
  ];

  for (const dir of componentPaths) {
    if (existsSync(dir)) {
      const count = countFilesRecursive(dir, PAGE_EXTENSIONS);
      if (count > 0) {
        componentCount += count;
        // Store relative path
        const rel = dir.startsWith(projectRoot) ? dir.slice(projectRoot.length + 1) : dir;
        componentDirs.push(rel);
      }
    }
  }

  const hasRootAppComponent = ROOT_COMPONENT_CANDIDATES.some((relativePath) =>
    existsSync(join(projectRoot, relativePath)),
  );

  if (pageCount === 0 && hasRootAppComponent) {
    pageCount = 1;
  }

  if (componentCount === 0 && hasRootAppComponent) {
    componentCount = 1;
    if (!componentDirs.includes('src')) {
      componentDirs.push('src');
    }
  }

  return {
    pageCount,
    componentCount,
    directories: componentDirs,
  };
}
