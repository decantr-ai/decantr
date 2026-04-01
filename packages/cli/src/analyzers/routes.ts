import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export interface RouteInfo {
  path: string;
  file: string;
  hasLayout: boolean;
}

export interface RoutesAnalysis {
  strategy: 'app-router' | 'pages-router' | 'none';
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

  const hasPage = entries.some(e => e === 'page.tsx' || e === 'page.ts' || e === 'page.jsx' || e === 'page.js');
  const hasLayout = entries.some(e => e === 'layout.tsx' || e === 'layout.ts' || e === 'layout.jsx' || e === 'layout.js');

  if (hasPage) {
    const routePath = '/' + segments.filter(s => s !== '').join('/');
    const pageFile = entries.find(e => e.startsWith('page.'))!;
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

function walkPagesDir(dir: string, baseDir: string, segments: string[]): RouteInfo[] {
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
        routes.push(...walkPagesDir(fullPath, baseDir, nextSegments));
      } else if (stat.isFile()) {
        // Check page extensions
        const match = entry.match(/^(.+)\.(tsx?|jsx?|mdx?)$/);
        if (!match) continue;
        const name = match[1];
        // Skip _app, _document, _error, api files
        if (name.startsWith('_')) continue;

        const routeSegment = name === 'index' ? '' : (segmentToRoute(name) ?? name);
        const routePath = '/' + [...segments, routeSegment].filter(s => s !== '').join('/');
        routes.push({
          path: routePath || '/',
          file: relative(baseDir, fullPath),
          hasLayout: false,
        });
      }
    } catch {
      continue;
    }
  }

  return routes;
}

/**
 * Scan for routes in a Next.js project.
 * Detects App Router (app/ or src/app/) and Pages Router (pages/ or src/pages/).
 */
export function scanRoutes(projectRoot: string): RoutesAnalysis {
  // Try App Router first
  const appDirs = [
    join(projectRoot, 'src', 'app'),
    join(projectRoot, 'app'),
  ];

  for (const appDir of appDirs) {
    if (existsSync(appDir)) {
      const routes = walkAppDir(appDir, projectRoot, []);
      if (routes.length > 0) {
        return { strategy: 'app-router', routes };
      }
    }
  }

  // Try Pages Router
  const pagesDirs = [
    join(projectRoot, 'src', 'pages'),
    join(projectRoot, 'pages'),
  ];

  for (const pagesDir of pagesDirs) {
    if (existsSync(pagesDir)) {
      const routes = walkPagesDir(pagesDir, projectRoot, []);
      if (routes.length > 0) {
        return { strategy: 'pages-router', routes };
      }
    }
  }

  return { strategy: 'none', routes: [] };
}
