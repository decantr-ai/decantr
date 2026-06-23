import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export interface RouteInfo {
  path: string;
  file: string;
  hasLayout: boolean;
}

export interface RoutesAnalysis {
  strategy:
    | 'app-router'
    | 'pages-router'
    | 'mixed-next-router'
    | 'react-router'
    | 'angular-router'
    | 'sveltekit-router'
    | 'vue-router'
    | 'nuxt-router'
    | 'none';
  routes: RouteInfo[];
}

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'api', '_app', '_document']);

function shouldSkipDir(name: string): boolean {
  return name.startsWith('_') || name.startsWith('.') || SKIP_DIRS.has(name);
}

/**
 * Convert a filesystem path segment to a route segment.
 * - Route groups like (groupName) are omitted from the path
 * - Dynamic segments like [param] become :param
 */
function segmentToRoute(segment: string): string | null {
  // Route group — omit from path
  if (segment.startsWith('(') && segment.endsWith(')')) {
    return null;
  }
  // Dynamic segment
  if (segment.startsWith('[') && segment.endsWith(']')) {
    const param = segment.slice(1, -1);
    // Catch-all [...param] or optional catch-all [[...param]]
    if (param.startsWith('...')) {
      return `:${param.slice(3)}*`;
    }
    if (param.startsWith('[...') && param.endsWith(']')) {
      return `:${param.slice(4, -1)}*`;
    }
    return `:${param}`;
  }
  return segment;
}

function walkAppDir(dir: string, baseDir: string, segments: string[]): RouteInfo[] {
  const routes: RouteInfo[] = [];

  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return routes;
  }

  const hasPage = entries.some(
    (e) => e === 'page.tsx' || e === 'page.ts' || e === 'page.jsx' || e === 'page.js',
  );
  const hasLayout = entries.some(
    (e) => e === 'layout.tsx' || e === 'layout.ts' || e === 'layout.jsx' || e === 'layout.js',
  );

  if (hasPage) {
    const routePath = '/' + segments.filter((s) => s !== '').join('/');
    const pageFile = entries.find((e) => e.startsWith('page.'))!;
    routes.push({
      path: routePath || '/',
      file: relative(baseDir, join(dir, pageFile)),
      hasLayout,
    });
  }

  for (const entry of entries) {
    if (shouldSkipDir(entry)) continue;
    const fullPath = join(dir, entry);
    try {
      if (!statSync(fullPath).isDirectory()) continue;
    } catch {
      continue;
    }

    const routeSegment = segmentToRoute(entry);
    const nextSegments = routeSegment === null ? [...segments] : [...segments, routeSegment];
    routes.push(...walkAppDir(fullPath, baseDir, nextSegments));
  }

  return routes;
}

function walkPagesDir(
  dir: string,
  baseDir: string,
  segments: string[],
  extensions = new Set(['ts', 'tsx', 'js', 'jsx', 'md', 'mdx']),
): RouteInfo[] {
  const routes: RouteInfo[] = [];

  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return routes;
  }

  for (const entry of entries) {
    if (shouldSkipDir(entry)) continue;
    const fullPath = join(dir, entry);

    try {
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        const routeSegment = segmentToRoute(entry);
        const nextSegments = routeSegment === null ? [...segments] : [...segments, routeSegment];
        routes.push(...walkPagesDir(fullPath, baseDir, nextSegments, extensions));
      } else if (stat.isFile()) {
        // Check page extensions
        const match = entry.match(/^(.+)\.([^.]+)$/);
        if (!match) continue;
        const name = match[1];
        const extension = match[2];
        if (!extensions.has(extension)) continue;
        // Skip _app, _document, _error, api files
        if (name.startsWith('_')) continue;

        const routeSegment = name === 'index' ? '' : (segmentToRoute(name) ?? name);
        const routePath = '/' + [...segments, routeSegment].filter((s) => s !== '').join('/');
        routes.push({
          path: routePath || '/',
          file: relative(baseDir, fullPath),
          hasLayout: false,
        });
      }
    } catch {}
  }

  return routes;
}

function walkSvelteKitRoutes(dir: string, baseDir: string, segments: string[]): RouteInfo[] {
  const routes: RouteInfo[] = [];

  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return routes;
  }

  const pageFile = entries.find((entry) => /^\+page\.(svelte|ts|js)$/.test(entry));
  const hasLayout = entries.some((entry) => /^\+layout\.(svelte|ts|js)$/.test(entry));
  if (pageFile) {
    const routePath = '/' + segments.filter((segment) => segment !== '').join('/');
    routes.push({
      path: routePath || '/',
      file: relative(baseDir, join(dir, pageFile)),
      hasLayout,
    });
  }

  for (const entry of entries) {
    if (shouldSkipDir(entry)) continue;
    const fullPath = join(dir, entry);
    try {
      if (!statSync(fullPath).isDirectory()) continue;
    } catch {
      continue;
    }

    const routeSegment = segmentToRoute(entry);
    const nextSegments = routeSegment === null ? [...segments] : [...segments, routeSegment];
    routes.push(...walkSvelteKitRoutes(fullPath, baseDir, nextSegments));
  }

  return routes;
}

const ROUTER_FILE_EXTENSIONS = new Set(['.tsx', '.ts', '.jsx', '.js']);
const ROUTE_VARIABLE_NAMES =
  '(?:path|pathname|route|currentPath|currentRoute|locationPath|activePath)';
const ROUTE_ASSET_EXTENSION_RE =
  /\.(?:avif|bmp|css|gif|ico|jpeg|jpg|js|json|map|mp4|pdf|png|svg|webp|woff2?)$/i;

function collectRouteCandidateFiles(dir: string, files: string[], depth = 0): void {
  if (depth > 5) return;

  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.startsWith('.') || entry === 'node_modules') continue;
    const fullPath = join(dir, entry);
    try {
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        collectRouteCandidateFiles(fullPath, files, depth + 1);
      } else if (stat.isFile()) {
        const ext = entry.slice(entry.lastIndexOf('.'));
        if (ROUTER_FILE_EXTENSIONS.has(ext)) {
          files.push(fullPath);
        }
      }
    } catch {}
  }
}

function scanReactRouter(projectRoot: string): RouteInfo[] {
  const candidateDirs = [join(projectRoot, 'src'), projectRoot];

  const candidateFiles: string[] = [];
  for (const dir of candidateDirs) {
    if (existsSync(dir)) collectRouteCandidateFiles(dir, candidateFiles);
  }

  const routeMap = new Map<string, RouteInfo>();

  for (const absolutePath of candidateFiles) {
    let content: string;
    try {
      content = readFileSync(absolutePath, 'utf-8');
    } catch {
      continue;
    }

    const isReactRouterFile =
      content.includes('react-router-dom') ||
      content.includes('react-router') ||
      content.includes('<Routes') ||
      content.includes('createBrowserRouter') ||
      content.includes('createHashRouter') ||
      content.includes('RouterProvider') ||
      content.includes('HashRouter') ||
      content.includes('BrowserRouter');

    const relativePath = relative(projectRoot, absolutePath);
    const pathMatches = new Set<string>();

    if (isReactRouterFile) {
      for (const match of content.matchAll(/<Route\b[^>]*\bpath=["'`]([^"'`]+)["'`]/g)) {
        pathMatches.add(match[1]);
      }

      for (const match of content.matchAll(/\bpath\s*:\s*["'`]([^"'`]+)["'`]/g)) {
        pathMatches.add(match[1]);
      }
    }

    for (const route of detectPathnameBranchRoutes(content)) {
      pathMatches.add(route);
    }

    if (!isReactRouterFile && pathMatches.size === 0) continue;

    if (
      pathMatches.size === 0 &&
      (content.includes('<Routes') || content.includes('RouterProvider'))
    ) {
      pathMatches.add('/');
    }

    for (const path of pathMatches) {
      const routePath = normalizeDetectedRouteLiteral(path);
      if (!routePath || routeMap.has(routePath)) continue;
      routeMap.set(routePath, {
        path: routePath,
        file: relativePath,
        hasLayout: false,
      });
    }
  }

  return [...routeMap.values()];
}

function normalizeDetectedRouteLiteral(value: string): string | null {
  const cleaned = value.trim().split(/[?#]/)[0];
  if (!cleaned || cleaned === '/') return '/';
  if (cleaned === '*' || cleaned === '**' || cleaned.startsWith('#')) return null;
  if (!cleaned.startsWith('/') || cleaned.startsWith('//')) return null;
  if (ROUTE_ASSET_EXTENSION_RE.test(cleaned)) return null;
  return cleaned.replace(/\/+$/g, '') || '/';
}

function collectRouteLiterals(pattern: RegExp, content: string, routes: Set<string>): number {
  let count = 0;
  for (const match of content.matchAll(pattern)) {
    const route = normalizeDetectedRouteLiteral(match[1] ?? '');
    if (!route) continue;
    routes.add(route);
    count += 1;
  }
  return count;
}

function detectPathnameBranchRoutes(content: string): string[] {
  const routes = new Set<string>();
  const comparison = new RegExp(
    `\\b${ROUTE_VARIABLE_NAMES}\\b\\s*(?:===|!==|==|!=)\\s*["'\`](\\/[^"'\`]+)["'\`]`,
    'g',
  );
  const reversedComparison = new RegExp(
    `["'\`](\\/[^"'\`]+)["'\`]\\s*(?:===|!==|==|!=)\\s*\\b${ROUTE_VARIABLE_NAMES}\\b`,
    'g',
  );
  const strongMatches =
    collectRouteLiterals(comparison, content, routes) +
    collectRouteLiterals(reversedComparison, content, routes) +
    collectRouteLiterals(/\bcase\s+["'`](\/[^"'`]+)["'`]\s*:/g, content, routes);

  const hasPathnameSignal = /\b(?:window\.|document\.)?location\.pathname\b|\bpathname\b/.test(
    content,
  );
  if (strongMatches > 0 || hasPathnameSignal) {
    collectRouteLiterals(/\b(?:href|to)\s*=\s*["'`](\/[^"'`]+)["'`]/g, content, routes);
  }

  if (
    hasPathnameSignal &&
    (/\?\s*["'`]\/["'`]\s*:/.test(content) ||
      /\|\|\s*["'`]\/["'`]/.test(content) ||
      /\b(?:defaultRoute|defaultPath|fallbackRoute|fallbackPath)\s*[:=]\s*["'`]\/["'`]/.test(
        content,
      ))
  ) {
    routes.add('/');
  }

  return [...routes];
}

function hasReactRouterDependency(projectRoot: string): boolean {
  return hasDependency(projectRoot, ['react-router', 'react-router-dom']);
}

function hasDependency(projectRoot: string, names: string[]): boolean {
  const packageJsonPath = join(projectRoot, 'package.json');
  if (!existsSync(packageJsonPath)) return false;
  try {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    return names.some((name) => Boolean(deps[name]));
  } catch {
    return false;
  }
}

function hasAnyFile(projectRoot: string, relPaths: string[]): boolean {
  return relPaths.some((relPath) => existsSync(join(projectRoot, relPath)));
}

function normalizeRoutePath(path: string): string | null {
  const cleaned = path.trim();
  if (!cleaned || cleaned === '/') return '/';
  if (cleaned === '**' || cleaned.startsWith('#')) return null;
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
}

function scanAngularRouter(projectRoot: string): RouteInfo[] {
  const candidateDirs = [join(projectRoot, 'src', 'app'), join(projectRoot, 'src')];
  const candidateFiles: string[] = [];
  for (const dir of candidateDirs) {
    if (existsSync(dir)) collectRouteCandidateFiles(dir, candidateFiles);
  }

  const routeMap = new Map<string, RouteInfo>();
  for (const absolutePath of candidateFiles) {
    let content: string;
    try {
      content = readFileSync(absolutePath, 'utf-8');
    } catch {
      continue;
    }

    const isRouterFile =
      content.includes('@angular/router') ||
      content.includes('RouterModule.forRoot') ||
      content.includes('provideRouter') ||
      content.includes('Routes =');
    if (!isRouterFile) continue;

    const relativePath = relative(projectRoot, absolutePath);
    for (const match of content.matchAll(/\bpath\s*:\s*["'`]([^"'`]*)["'`]/g)) {
      const routePath = normalizeRoutePath(match[1]);
      if (!routePath || routeMap.has(routePath)) continue;
      routeMap.set(routePath, {
        path: routePath,
        file: relativePath,
        hasLayout: false,
      });
    }
  }

  return [...routeMap.values()];
}

function scanVueRouter(projectRoot: string): RouteInfo[] {
  const candidateDirs = [join(projectRoot, 'src'), projectRoot];
  const candidateFiles: string[] = [];
  for (const dir of candidateDirs) {
    if (existsSync(dir)) collectRouteCandidateFiles(dir, candidateFiles);
  }

  const routeMap = new Map<string, RouteInfo>();
  for (const absolutePath of candidateFiles) {
    let content: string;
    try {
      content = readFileSync(absolutePath, 'utf-8');
    } catch {
      continue;
    }

    const isRouterFile =
      content.includes('vue-router') ||
      content.includes('createRouter') ||
      content.includes('createWebHistory') ||
      content.includes('createWebHashHistory');
    if (!isRouterFile) continue;

    const relativePath = relative(projectRoot, absolutePath);
    for (const match of content.matchAll(/\bpath\s*:\s*["'`]([^"'`]+)["'`]/g)) {
      const routePath = normalizeRoutePath(match[1]);
      if (!routePath || routeMap.has(routePath)) continue;
      routeMap.set(routePath, {
        path: routePath,
        file: relativePath,
        hasLayout: false,
      });
    }
  }

  return [...routeMap.values()];
}

/**
 * Scan for routes in an existing project.
 * Detects Next App/Pages Router, React Router, Angular Router, SvelteKit,
 * Vue Router, and Nuxt file-system route declarations.
 */
export function scanRoutes(projectRoot: string): RoutesAnalysis {
  const hasNext =
    hasDependency(projectRoot, ['next']) ||
    hasAnyFile(projectRoot, ['next.config.js', 'next.config.ts', 'next.config.mjs']);
  const hasSvelteKit =
    hasDependency(projectRoot, ['@sveltejs/kit', 'svelte']) ||
    hasAnyFile(projectRoot, ['svelte.config.js', 'svelte.config.ts']);
  const hasNuxt =
    hasDependency(projectRoot, ['nuxt']) ||
    hasAnyFile(projectRoot, ['nuxt.config.js', 'nuxt.config.ts']);
  const hasAngular =
    hasDependency(projectRoot, ['@angular/core', '@angular/router']) ||
    hasAnyFile(projectRoot, ['angular.json']);
  const hasVue =
    hasDependency(projectRoot, ['vue', 'vue-router']) ||
    hasAnyFile(projectRoot, ['vite.config.js', 'vite.config.ts']);

  const appDirs = [join(projectRoot, 'src', 'app'), join(projectRoot, 'app')];
  const appRoutes = appDirs.flatMap((appDir) =>
    existsSync(appDir) ? walkAppDir(appDir, projectRoot, []) : [],
  );

  const pagesDirs = [join(projectRoot, 'src', 'pages'), join(projectRoot, 'pages')];
  const pagesRoutes = pagesDirs.flatMap((pagesDir) =>
    existsSync(pagesDir) ? walkPagesDir(pagesDir, projectRoot, []) : [],
  );

  if (hasNext) {
    if (appRoutes.length > 0 && pagesRoutes.length > 0) {
      return { strategy: 'mixed-next-router', routes: [...appRoutes, ...pagesRoutes] };
    }
    if (appRoutes.length > 0) return { strategy: 'app-router', routes: appRoutes };
    if (pagesRoutes.length > 0) return { strategy: 'pages-router', routes: pagesRoutes };
  } else if (appRoutes.length > 0) {
    return { strategy: 'app-router', routes: appRoutes };
  }

  if (hasSvelteKit) {
    const svelteRoutesDir = join(projectRoot, 'src', 'routes');
    if (existsSync(svelteRoutesDir)) {
      const routes = walkSvelteKitRoutes(svelteRoutesDir, projectRoot, []);
      if (routes.length > 0) return { strategy: 'sveltekit-router', routes };
    }
  }

  if (hasNuxt) {
    const nuxtPagesDirs = [join(projectRoot, 'pages'), join(projectRoot, 'app', 'pages')];
    const routes = nuxtPagesDirs.flatMap((pagesDir) =>
      existsSync(pagesDir) ? walkPagesDir(pagesDir, projectRoot, [], new Set(['vue'])) : [],
    );
    if (routes.length > 0) return { strategy: 'nuxt-router', routes };
  }

  const reactRouterRoutes = scanReactRouter(projectRoot);

  // React Router apps often keep presentational components under src/pages.
  // When the dependency and explicit <Route>/router declarations are present,
  // prefer those declarations over inferring file-system pages.
  if (reactRouterRoutes.length > 0 && hasReactRouterDependency(projectRoot)) {
    return { strategy: 'react-router', routes: reactRouterRoutes };
  }

  if (hasAngular) {
    const routes = scanAngularRouter(projectRoot);
    if (routes.length > 0) return { strategy: 'angular-router', routes };
  }

  if (hasVue) {
    const routes = scanVueRouter(projectRoot);
    if (routes.length > 0) return { strategy: 'vue-router', routes };
  }

  if (pagesRoutes.length > 0) {
    return { strategy: 'pages-router', routes: pagesRoutes };
  }

  if (reactRouterRoutes.length > 0) {
    return { strategy: 'react-router', routes: reactRouterRoutes };
  }

  return { strategy: 'none', routes: [] };
}
