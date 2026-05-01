import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

export type ProjectScope = 'single-app' | 'workspace-app';

export interface WorkspaceInfo {
  cwd: string;
  workspaceRoot: string;
  appRoot: string;
  projectScope: ProjectScope;
  appCandidates: string[];
  requiresProjectSelection: boolean;
}

interface PackageJson {
  workspaces?: string[] | { packages?: string[] };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

function readPackageJson(dir: string): PackageJson | null {
  const path = join(dir, 'package.json');
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as PackageJson;
  } catch {
    return null;
  }
}

function hasWorkspaceMarker(dir: string): boolean {
  if (
    existsSync(join(dir, 'pnpm-workspace.yaml')) ||
    existsSync(join(dir, 'turbo.json')) ||
    existsSync(join(dir, 'nx.json'))
  ) {
    return true;
  }
  const pkg = readPackageJson(dir);
  return Boolean(pkg?.workspaces);
}

function findWorkspaceRoot(startDir: string): string | null {
  let current = resolve(startDir);
  while (true) {
    if (hasWorkspaceMarker(current)) return current;
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function looksLikeApp(dir: string): boolean {
  if (
    existsSync(join(dir, 'next.config.js')) ||
    existsSync(join(dir, 'next.config.ts')) ||
    existsSync(join(dir, 'next.config.mjs')) ||
    existsSync(join(dir, 'vite.config.ts')) ||
    existsSync(join(dir, 'vite.config.js')) ||
    existsSync(join(dir, 'angular.json')) ||
    existsSync(join(dir, 'svelte.config.js')) ||
    existsSync(join(dir, 'svelte.config.ts')) ||
    existsSync(join(dir, 'astro.config.mjs')) ||
    existsSync(join(dir, 'src')) ||
    existsSync(join(dir, 'app')) ||
    existsSync(join(dir, 'pages'))
  ) {
    return true;
  }

  const pkg = readPackageJson(dir);
  const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };
  return Boolean(
    deps.react ||
      deps.next ||
      deps.vue ||
      deps.svelte ||
      deps['@angular/core'] ||
      deps.astro ||
      deps.nuxt,
  );
}

function listWorkspaceApps(workspaceRoot: string): string[] {
  const candidates: string[] = [];
  for (const base of ['apps', 'packages']) {
    const baseDir = join(workspaceRoot, base);
    if (!existsSync(baseDir)) continue;
    for (const entry of readdirSync(baseDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      const candidate = join(baseDir, entry.name);
      if (looksLikeApp(candidate)) {
        candidates.push(`${base}/${entry.name}`);
      }
    }
  }
  return candidates.sort();
}

export function resolveWorkspaceInfo(cwd: string, projectArg?: string): WorkspaceInfo {
  const absoluteCwd = resolve(cwd);
  const workspaceRoot = findWorkspaceRoot(absoluteCwd) ?? absoluteCwd;
  const appRoot = projectArg ? resolve(absoluteCwd, projectArg) : absoluteCwd;
  const appCandidates = listWorkspaceApps(workspaceRoot);
  const projectScope: ProjectScope =
    workspaceRoot !== appRoot || appCandidates.length > 0 ? 'workspace-app' : 'single-app';
  const requiresProjectSelection =
    !projectArg && workspaceRoot === absoluteCwd && appCandidates.length > 1;

  return {
    cwd: absoluteCwd,
    workspaceRoot,
    appRoot,
    projectScope,
    appCandidates,
    requiresProjectSelection,
  };
}
