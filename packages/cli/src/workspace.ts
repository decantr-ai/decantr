import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';

export type ProjectScope = 'single-app' | 'workspace-app';
export type WorkspaceAppCandidateCategory = 'product-ui' | 'supporting-ui' | 'low-confidence-ui';
type WorkspaceAppCandidateSource = 'apps' | 'packages' | 'conventional';

export interface WorkspaceAppCandidateRank {
  path: string;
  score: number;
  category: WorkspaceAppCandidateCategory;
  reason: string;
}

export interface WorkspaceInfo {
  cwd: string;
  workspaceRoot: string;
  appRoot: string;
  projectScope: ProjectScope;
  appCandidates: string[];
  appCandidateDetails: WorkspaceAppCandidateRank[];
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

function looksLikeApp(
  dir: string,
  options: { allowSourceDirs?: boolean; allowPackageDeps?: boolean } = {},
): boolean {
  const allowSourceDirs = options.allowSourceDirs ?? true;
  const allowPackageDeps = options.allowPackageDeps ?? true;
  const pkg = readPackageJson(dir);
  const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };
  const hasFrontendDependency = Boolean(
    deps.react ||
      deps['react-dom'] ||
      deps.next ||
      deps['@remix-run/react'] ||
      deps['@remix-run/dev'] ||
      deps.vue ||
      deps.svelte ||
      deps['@angular/core'] ||
      deps.astro ||
      deps.nuxt ||
      deps['solid-js'],
  );
  const hasServerOnlyDependency = Boolean(
    deps.hono || deps.express || deps.fastify || deps.koa || deps['@hapi/hapi'],
  );
  if (
    existsSync(join(dir, 'next.config.js')) ||
    existsSync(join(dir, 'next.config.ts')) ||
    existsSync(join(dir, 'next.config.mjs')) ||
    existsSync(join(dir, 'vite.config.ts')) ||
    existsSync(join(dir, 'vite.config.js')) ||
    existsSync(join(dir, 'angular.json')) ||
    existsSync(join(dir, 'svelte.config.js')) ||
    existsSync(join(dir, 'svelte.config.ts')) ||
    existsSync(join(dir, 'astro.config.mjs'))
  ) {
    return true;
  }

  if (
    allowSourceDirs &&
    (existsSync(join(dir, 'src')) || existsSync(join(dir, 'app')) || existsSync(join(dir, 'pages')))
  ) {
    if (hasFrontendDependency) return true;
    if (hasServerOnlyDependency) return false;
    return true;
  }

  if (!allowPackageDeps) return false;

  return hasFrontendDependency;
}

function hasConfig(dir: string): boolean {
  return (
    existsSync(join(dir, 'next.config.js')) ||
    existsSync(join(dir, 'next.config.ts')) ||
    existsSync(join(dir, 'next.config.mjs')) ||
    existsSync(join(dir, 'vite.config.ts')) ||
    existsSync(join(dir, 'vite.config.js')) ||
    existsSync(join(dir, 'angular.json')) ||
    existsSync(join(dir, 'svelte.config.js')) ||
    existsSync(join(dir, 'svelte.config.ts')) ||
    existsSync(join(dir, 'astro.config.mjs')) ||
    existsSync(join(dir, 'remix.config.js')) ||
    existsSync(join(dir, 'remix.config.mjs')) ||
    existsSync(join(dir, 'remix.config.ts'))
  );
}

function hasUiSource(dir: string): boolean {
  return (
    existsSync(join(dir, 'src')) || existsSync(join(dir, 'app')) || existsSync(join(dir, 'pages'))
  );
}

function rankWorkspaceAppCandidate(
  workspaceRoot: string,
  path: string,
  source: WorkspaceAppCandidateSource,
): WorkspaceAppCandidateRank {
  const dir = join(workspaceRoot, path);
  const pkg = readPackageJson(dir);
  const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };
  const lowerPath = path.toLowerCase();
  const reasons: string[] = [];
  let score = source === 'apps' ? 25 : source === 'packages' ? -20 : 10;
  if (source === 'apps') reasons.push('under apps/');
  if (source === 'packages') reasons.push('under packages/');
  if (source === 'conventional') reasons.push('conventional frontend path');

  const frontendDeps = [
    'react',
    'react-dom',
    'next',
    '@remix-run/react',
    '@remix-run/dev',
    'vue',
    'svelte',
    '@angular/core',
    'astro',
    'nuxt',
    'solid-js',
  ].filter((dep) => deps[dep]);
  if (frontendDeps.length > 0) {
    score += 30;
    reasons.push(`frontend deps: ${frontendDeps.slice(0, 3).join(', ')}`);
  }

  if (hasConfig(dir)) {
    score += 20;
    reasons.push('frontend config');
  }
  if (hasUiSource(dir)) {
    score += 10;
    reasons.push('UI source tree');
  }

  if (/\b(web|app|dashboard|remix|client|frontend|site|portal)\b/u.test(lowerPath)) {
    score += 25;
    reasons.push('product-app name');
  }
  if (/\b(marketing|admin|console)\b/u.test(lowerPath)) {
    score += 10;
    reasons.push('taskable app surface');
  }

  const negativeSignals: Array<[RegExp, number, string]> = [
    [/\b(docs?|documentation)\b/u, 40, 'docs surface'],
    [/\bstorybook\b/u, 45, 'Storybook surface'],
    [/\b(api|server|backend|worker|queue)\b/u, 35, 'server/API surface'],
    [/\bmcp\b/u, 40, 'MCP/helper surface'],
    [/\b(workbench|playground|sandbox|example|demo)\b/u, 30, 'workbench/demo surface'],
    [
      /\b(design-system|components?|ui|tokens?|theme|config|eslint|tsconfig)\b/u,
      30,
      'library/config surface',
    ],
  ];
  for (const [pattern, penalty, reason] of negativeSignals) {
    if (!pattern.test(lowerPath)) continue;
    score -= penalty;
    reasons.push(reason);
  }

  const serverDeps = ['hono', 'express', 'fastify', 'koa', '@hapi/hapi'].filter((dep) => deps[dep]);
  if (serverDeps.length > 0 && frontendDeps.length === 0) {
    score -= 35;
    reasons.push(`server-only deps: ${serverDeps.slice(0, 2).join(', ')}`);
  }

  const category: WorkspaceAppCandidateCategory =
    score >= 65 ? 'product-ui' : score >= 30 ? 'supporting-ui' : 'low-confidence-ui';

  return {
    path,
    score,
    category,
    reason: reasons.join('; ') || 'filesystem candidate',
  };
}

function listWorkspaceAppDetails(workspaceRoot: string): WorkspaceAppCandidateRank[] {
  const candidates: WorkspaceAppCandidateRank[] = [];
  for (const base of ['apps', 'packages']) {
    const baseDir = join(workspaceRoot, base);
    if (!existsSync(baseDir)) continue;
    for (const entry of readdirSync(baseDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      const candidate = join(baseDir, entry.name);
      if (
        looksLikeApp(candidate, {
          allowSourceDirs: base === 'apps',
          allowPackageDeps: base === 'apps',
        })
      ) {
        const ranked = rankWorkspaceAppCandidate(
          workspaceRoot,
          `${base}/${entry.name}`,
          base as 'apps' | 'packages',
        );
        if (ranked.score <= 0) continue;
        if (base === 'packages' && ranked.category !== 'product-ui') continue;
        candidates.push(ranked);
      }
    }
  }
  for (const path of ['frontend', 'web', 'client', 'src/frontend', 'src/web', 'src/client']) {
    const candidate = join(workspaceRoot, path);
    if (
      candidates.some((item) => item.path === path) ||
      !existsSync(candidate) ||
      !looksLikeApp(candidate)
    ) {
      continue;
    }
    const ranked = rankWorkspaceAppCandidate(workspaceRoot, path, 'conventional');
    if (ranked.score > 0) candidates.push(ranked);
  }
  return candidates.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));
}

function listWorkspaceApps(workspaceRoot: string): string[] {
  return listWorkspaceAppDetails(workspaceRoot).map((candidate) => candidate.path);
}

export function listWorkspaceAppCandidates(workspaceRoot: string): string[] {
  return listWorkspaceApps(resolve(workspaceRoot));
}

export function listWorkspaceAppCandidateDetails(
  workspaceRoot: string,
): WorkspaceAppCandidateRank[] {
  return listWorkspaceAppDetails(resolve(workspaceRoot));
}

export function resolveWorkspaceInfo(cwd: string, projectArg?: string): WorkspaceInfo {
  const absoluteCwd = resolve(cwd);
  const appRoot = projectArg
    ? resolve(
        isAbsolute(projectArg)
          ? projectArg
          : join(findWorkspaceRoot(absoluteCwd) ?? absoluteCwd, projectArg),
      )
    : absoluteCwd;
  const workspaceRoot =
    projectArg && isAbsolute(projectArg)
      ? (findWorkspaceRoot(appRoot) ?? appRoot)
      : (findWorkspaceRoot(absoluteCwd) ?? absoluteCwd);
  const appCandidateDetails = listWorkspaceAppDetails(workspaceRoot);
  const appCandidates = appCandidateDetails.map((candidate) => candidate.path);
  const projectScope: ProjectScope =
    workspaceRoot !== appRoot || appCandidates.length > 0 ? 'workspace-app' : 'single-app';
  const requiresProjectSelection =
    !projectArg && workspaceRoot === absoluteCwd && appCandidates.length > 0;

  return {
    cwd: absoluteCwd,
    workspaceRoot,
    appRoot,
    projectScope,
    appCandidates,
    appCandidateDetails,
    requiresProjectSelection,
  };
}
