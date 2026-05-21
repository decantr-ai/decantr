import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, isAbsolute, join, relative } from 'node:path';
import { decodeHTML, decodeHTMLAttribute } from 'entities';

export type ScanInputKind = 'local' | 'github-repo' | 'github-pages';
export type ScanConfidence = 'high' | 'medium' | 'low';
export type ScanApplicabilityStatus = 'strong_fit' | 'partial_fit' | 'not_applicable' | 'unknown';
export type ScanFindingSeverity = 'success' | 'info' | 'warn' | 'error';

export const SCAN_REPORT_SCHEMA_URL = 'https://decantr.ai/schemas/scan-report.v1.json';

export interface ScanInputV1 {
  kind: ScanInputKind;
  value: string;
}

export interface ScanRepositoryV1 {
  owner: string;
  repo: string;
  url: string;
  defaultBranch?: string | null;
}

export interface PublishedSiteProbeV1 {
  url: string;
  finalUrl: string | null;
  checked: boolean;
  reachable: boolean;
  status: number | null;
  title: string | null;
  description: string | null;
  canonicalUrl: string | null;
  assetHints: {
    rootRelative: number;
    relative: number;
    absolute: number;
    samples: string[];
  };
  routingHints: string[];
  error: string | null;
}

export interface ScanRouteV1 {
  path: string;
  file: string;
  hasLayout: boolean;
}

export interface ScanFindingV1 {
  id: string;
  severity: ScanFindingSeverity;
  title: string;
  message: string;
  evidence: string[];
  recommendation?: string;
}

export interface ScanReportV1 {
  $schema: typeof SCAN_REPORT_SCHEMA_URL;
  schemaVersion: 'scan-report.v1';
  generatedAt: string;
  input: ScanInputV1;
  source: {
    repository: ScanRepositoryV1 | null;
    publishedSiteUrl: string | null;
  };
  confidence: {
    level: ScanConfidence;
    score: number;
    reasons: string[];
  };
  applicability: {
    status: ScanApplicabilityStatus;
    label: string;
    reasons: string[];
  };
  project: {
    framework: string;
    frameworkVersion: string | null;
    packageManager: string;
    primaryLanguage: string;
    hasTypeScript: boolean;
    hasTailwind: boolean;
    hasDecantr: boolean;
    packageName: string | null;
  };
  routes: {
    strategy: string;
    count: number;
    items: ScanRouteV1[];
  };
  components: {
    pageCount: number;
    componentCount: number;
    directories: string[];
  };
  styling: {
    approach: string;
    configFile: string | null;
    cssVariableCount: number;
    colorTokenCount: number;
    darkMode: boolean;
    themeSignals: string[];
  };
  staticHosting: {
    githubPagesLikely: boolean;
    evidence: string[];
    homepageUrl: string | null;
    basePath: string | null;
    hashRouting: boolean;
  };
  assistant: {
    ruleFiles: string[];
  };
  pagesProbe: PublishedSiteProbeV1 | null;
  findings: ScanFindingV1[];
  recommendedCommands: string[];
  privacy: {
    sourceUploaded: boolean;
    persistedByDecantr: boolean;
    notes: string[];
  };
}

export interface ScanProjectOptions {
  input?: ScanInputV1;
  repository?: ScanRepositoryV1 | null;
  publishedSiteUrl?: string | null;
  pagesProbe?: PublishedSiteProbeV1 | null;
}

export interface GitHubScanInputResolution {
  inputKind: 'github-repo' | 'github-pages';
  normalizedInput: string;
  repository: ScanRepositoryV1;
  publishedSiteUrl: string | null;
  warnings: string[];
}

interface PackageJson {
  name?: string;
  homepage?: string;
  packageManager?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface ProjectDetection {
  framework: string;
  frameworkVersion: string | null;
  packageManager: string;
  primaryLanguage: string;
  hasTypeScript: boolean;
  hasTailwind: boolean;
  hasDecantr: boolean;
  packageName: string | null;
  packageJsonValid: boolean;
  packageJsonPresent: boolean;
  dependencies: Record<string, string>;
}

interface RouteScan {
  strategy: string;
  routes: ScanRouteV1[];
}

interface StylingScan {
  approach: string;
  configFile: string | null;
  cssVariableCount: number;
  colorTokenCount: number;
  darkMode: boolean;
  themeSignals: string[];
}

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.vue', '.svelte']);
const STYLE_EXTENSIONS = new Set(['.css', '.scss', '.sass', '.less']);
const PAGE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte', '.html']);
const MAX_FILE_READ_BYTES = 512 * 1024;
const MAX_WALK_FILES = 5000;
const MAX_REPORT_ROUTES = 80;

const SKIP_DIRS = new Set([
  '.git',
  '.next',
  '.nuxt',
  '.svelte-kit',
  'coverage',
  'dist',
  'build',
  'node_modules',
  'out',
  'target',
  'vendor',
]);

const RULE_FILES = [
  'CLAUDE.md',
  'AGENTS.md',
  'GEMINI.md',
  '.cursorrules',
  '.cursor/rules',
  '.claude/rules',
  '.github/copilot-instructions.md',
  'copilot-instructions.md',
  '.windsurfrules',
];

const GITHUB_OWNER_RE = /^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/i;
const GITHUB_REPO_RE = /^[a-z0-9._-]{1,100}$/i;

function parseHttpUrl(value: string): URL | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
}

function githubPagesOwnerFromHostname(hostname: string): string | null {
  const [owner, domain, tld, ...extra] = hostname.toLowerCase().split('.');
  if (extra.length > 0 || domain !== 'github' || tld !== 'io' || !owner) return null;
  return GITHUB_OWNER_RE.test(owner) ? owner : null;
}

function normalizeGitHubPathSegment(segment: string | undefined, kind: 'owner' | 'repo'): string | null {
  if (!segment) return null;
  const normalized = kind === 'repo' ? segment.replace(/\.git$/i, '') : segment;
  const pattern = kind === 'owner' ? GITHUB_OWNER_RE : GITHUB_REPO_RE;
  return pattern.test(normalized) ? normalized : null;
}

const WEB_FRAMEWORKS = new Set([
  'angular',
  'astro',
  'html',
  'nextjs',
  'nuxt',
  'react',
  'solid',
  'svelte',
  'vue',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readTextFile(path: string, maxBytes = MAX_FILE_READ_BYTES): string | null {
  try {
    const stat = statSync(path);
    if (!stat.isFile() || stat.size > maxBytes) return null;
    return readFileSync(path, 'utf-8');
  } catch {
    return null;
  }
}

function readPackageJson(projectRoot: string): { value: PackageJson | null; present: boolean; valid: boolean } {
  const path = join(projectRoot, 'package.json');
  if (!existsSync(path)) return { value: null, present: false, valid: false };
  const content = readTextFile(path);
  if (!content) return { value: null, present: true, valid: false };
  try {
    const parsed = JSON.parse(content) as unknown;
    return { value: isRecord(parsed) ? (parsed as PackageJson) : null, present: true, valid: isRecord(parsed) };
  } catch {
    return { value: null, present: true, valid: false };
  }
}

function dependencyVersion(dependencies: Record<string, string>, names: string[]): string | null {
  for (const name of names) {
    const version = dependencies[name];
    if (version) return version.replace(/^[~^]/, '');
  }
  return null;
}

function hasAnyFile(projectRoot: string, paths: string[]): boolean {
  return paths.some((path) => existsSync(join(projectRoot, path)));
}

function detectPackageManager(projectRoot: string, pkg: PackageJson | null): string {
  const declared = pkg?.packageManager?.split('@')[0];
  if (declared === 'npm' || declared === 'pnpm' || declared === 'yarn' || declared === 'bun') {
    return declared;
  }
  if (existsSync(join(projectRoot, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(projectRoot, 'yarn.lock'))) return 'yarn';
  if (existsSync(join(projectRoot, 'bun.lockb'))) return 'bun';
  if (existsSync(join(projectRoot, 'package-lock.json'))) return 'npm';
  return 'unknown';
}

function detectPrimaryLanguage(projectRoot: string, packageJsonPresent: boolean): string {
  if (packageJsonPresent) return 'javascript';
  if (hasAnyFile(projectRoot, ['pyproject.toml', 'requirements.txt', 'setup.py', 'Pipfile'])) return 'python';
  if (hasAnyFile(projectRoot, ['go.mod'])) return 'go';
  if (hasAnyFile(projectRoot, ['Cargo.toml'])) return 'rust';
  if (hasAnyFile(projectRoot, ['index.html', 'docs/index.html'])) return 'html';
  return 'unknown';
}

function detectProject(projectRoot: string): ProjectDetection {
  const packageRead = readPackageJson(projectRoot);
  const pkg = packageRead.value;
  const dependencies = { ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}) };
  let framework = 'unknown';
  let frameworkVersion: string | null = null;

  if (hasAnyFile(projectRoot, ['next.config.js', 'next.config.ts', 'next.config.mjs']) || dependencies.next) {
    framework = 'nextjs';
    frameworkVersion = dependencyVersion(dependencies, ['next']);
  } else if (hasAnyFile(projectRoot, ['nuxt.config.js', 'nuxt.config.ts']) || dependencies.nuxt) {
    framework = 'nuxt';
    frameworkVersion = dependencyVersion(dependencies, ['nuxt']);
  } else if (hasAnyFile(projectRoot, ['astro.config.mjs', 'astro.config.ts']) || dependencies.astro) {
    framework = 'astro';
    frameworkVersion = dependencyVersion(dependencies, ['astro']);
  } else if (hasAnyFile(projectRoot, ['svelte.config.js', 'svelte.config.ts']) || dependencies.svelte || dependencies['@sveltejs/kit']) {
    framework = 'svelte';
    frameworkVersion = dependencyVersion(dependencies, ['svelte', '@sveltejs/kit']);
  } else if (hasAnyFile(projectRoot, ['angular.json']) || dependencies['@angular/core']) {
    framework = 'angular';
    frameworkVersion = dependencyVersion(dependencies, ['@angular/core']);
  } else if (dependencies['solid-js']) {
    framework = 'solid';
    frameworkVersion = dependencyVersion(dependencies, ['solid-js']);
  } else if (dependencies.vue) {
    framework = 'vue';
    frameworkVersion = dependencyVersion(dependencies, ['vue']);
  } else if (dependencies.react) {
    framework = 'react';
    frameworkVersion = dependencyVersion(dependencies, ['react']);
  } else if (hasAnyFile(projectRoot, ['index.html', 'docs/index.html'])) {
    framework = 'html';
  }

  return {
    framework,
    frameworkVersion,
    packageManager: detectPackageManager(projectRoot, pkg),
    primaryLanguage: detectPrimaryLanguage(projectRoot, packageRead.present),
    hasTypeScript: hasAnyFile(projectRoot, ['tsconfig.json']),
    hasTailwind: hasAnyFile(projectRoot, [
      'tailwind.config.js',
      'tailwind.config.ts',
      'tailwind.config.mjs',
      'tailwind.config.cjs',
    ]),
    hasDecantr:
      existsSync(join(projectRoot, 'decantr.essence.json')) ||
      existsSync(join(projectRoot, '.decantr')) ||
      Boolean(dependencies['@decantr/cli'] || dependencies['@decantr/css']),
    packageName: typeof pkg?.name === 'string' ? pkg.name : null,
    packageJsonValid: packageRead.valid,
    packageJsonPresent: packageRead.present,
    dependencies,
  };
}

function shouldSkipDir(name: string): boolean {
  return SKIP_DIRS.has(name) || (name.startsWith('.') && name !== '.github');
}

function walkFiles(projectRoot: string, options: { extensions?: Set<string>; includeHidden?: boolean } = {}): string[] {
  const files: string[] = [];

  function walk(dir: string) {
    if (files.length >= MAX_WALK_FILES) return;
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }

    for (const entry of entries) {
      if (files.length >= MAX_WALK_FILES) return;
      const fullPath = join(dir, entry);
      let stat;
      try {
        stat = statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        if (shouldSkipDir(entry) && !options.includeHidden) continue;
        walk(fullPath);
        continue;
      }

      if (!stat.isFile()) continue;
      const rel = relative(projectRoot, fullPath).replace(/\\/g, '/');
      const ext = extname(entry).toLowerCase();
      if (!options.extensions || options.extensions.has(ext)) {
        files.push(rel);
      }
    }
  }

  walk(projectRoot);
  return files;
}

function segmentToRoute(segment: string): string | null {
  if (segment.startsWith('(') && segment.endsWith(')')) return null;
  if (segment.startsWith('[') && segment.endsWith(']')) {
    const param = segment.slice(1, -1);
    if (param.startsWith('...')) return `:${param.slice(3)}*`;
    if (param.startsWith('[...') && param.endsWith(']')) return `:${param.slice(4, -1)}*`;
    return `:${param}`;
  }
  return segment;
}

function walkNextAppRoutes(dir: string, projectRoot: string, segments: string[]): ScanRouteV1[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  const routes: ScanRouteV1[] = [];
  const pageFile = entries.find((entry) => /^page\.(tsx|ts|jsx|js)$/.test(entry));
  const hasLayout = entries.some((entry) => /^layout\.(tsx|ts|jsx|js)$/.test(entry));
  if (pageFile) {
    routes.push({
      path: `/${segments.filter(Boolean).join('/')}` || '/',
      file: relative(projectRoot, join(dir, pageFile)).replace(/\\/g, '/'),
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
    routes.push(...walkNextAppRoutes(fullPath, projectRoot, routeSegment === null ? segments : [...segments, routeSegment]));
  }
  return routes;
}

function fileRouteFromPath(file: string, baseDir: string): string {
  let withoutExt = file.slice(0, -extname(file).length);
  if (withoutExt.endsWith('/index')) withoutExt = withoutExt.slice(0, -'/index'.length);
  withoutExt = withoutExt.replace(new RegExp(`^${baseDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), '');
  const parts = withoutExt.split('/').filter(Boolean).map((part) => segmentToRoute(part)).filter(Boolean);
  return `/${parts.join('/')}` || '/';
}

function scanFileRoutes(projectRoot: string, baseDir: string, extensions = PAGE_EXTENSIONS): ScanRouteV1[] {
  const fullBase = join(projectRoot, baseDir);
  if (!existsSync(fullBase)) return [];
  return walkFiles(fullBase, { extensions }).map((file) => {
    const rel = relative(projectRoot, join(fullBase, file)).replace(/\\/g, '/');
    return { path: fileRouteFromPath(rel, baseDir), file: rel, hasLayout: false };
  });
}

function scanReactRouter(projectRoot: string): { routes: ScanRouteV1[]; hashRouting: boolean } {
  const files = walkFiles(projectRoot, { extensions: SOURCE_EXTENSIONS });
  const routes = new Map<string, ScanRouteV1>();
  let hashRouting = false;

  for (const file of files) {
    const content = readTextFile(join(projectRoot, file));
    if (!content) continue;
    if (content.includes('HashRouter') || content.includes('createHashRouter')) hashRouting = true;

    const jsxRouteRegex = /<Route\b[^>]*\bpath\s*=\s*["']([^"']+)["']/g;
    let match: RegExpExecArray | null;
    while ((match = jsxRouteRegex.exec(content)) !== null) {
      const route = match[1] || '/';
      routes.set(route, { path: route, file, hasLayout: false });
    }

    const objectRouteRegex = /\bpath\s*:\s*["']([^"']+)["']/g;
    while ((match = objectRouteRegex.exec(content)) !== null) {
      const route = match[1] || '/';
      if (route.startsWith('/')) routes.set(route, { path: route, file, hasLayout: false });
    }
  }

  return { routes: [...routes.values()], hashRouting };
}

function scanRoutes(projectRoot: string, detection: ProjectDetection): RouteScan {
  const appRoutes = ['src/app', 'app'].flatMap((dir) =>
    existsSync(join(projectRoot, dir)) ? walkNextAppRoutes(join(projectRoot, dir), projectRoot, []) : [],
  );
  const pagesRoutes = ['src/pages', 'pages'].flatMap((dir) => scanFileRoutes(projectRoot, dir));

  if (detection.framework === 'nextjs') {
    if (appRoutes.length > 0 && pagesRoutes.length > 0) return { strategy: 'mixed-next-router', routes: [...appRoutes, ...pagesRoutes] };
    if (appRoutes.length > 0) return { strategy: 'app-router', routes: appRoutes };
    if (pagesRoutes.length > 0) return { strategy: 'pages-router', routes: pagesRoutes };
  }

  if (detection.framework === 'svelte') {
    const routes = scanFileRoutes(projectRoot, 'src/routes', new Set(['.svelte', '.ts', '.js']));
    if (routes.length > 0) return { strategy: 'sveltekit-router', routes };
  }

  if (detection.framework === 'nuxt') {
    const routes = ['pages', 'app/pages'].flatMap((dir) => scanFileRoutes(projectRoot, dir, new Set(['.vue'])));
    if (routes.length > 0) return { strategy: 'nuxt-router', routes };
  }

  if (detection.framework === 'vue') {
    const router = scanReactRouter(projectRoot);
    if (router.routes.length > 0) return { strategy: 'vue-router', routes: router.routes };
  }

  const reactRouter = scanReactRouter(projectRoot);
  if (reactRouter.routes.length > 0) return { strategy: 'react-router', routes: reactRouter.routes };
  if (pagesRoutes.length > 0) return { strategy: 'pages-router', routes: pagesRoutes };

  if (existsSync(join(projectRoot, 'index.html'))) {
    return { strategy: 'static-html', routes: [{ path: '/', file: 'index.html', hasLayout: false }] };
  }
  if (existsSync(join(projectRoot, 'docs', 'index.html'))) {
    return { strategy: 'static-html', routes: [{ path: '/', file: 'docs/index.html', hasLayout: false }] };
  }

  return { strategy: 'none', routes: [] };
}

function countComponents(projectRoot: string, routes: RouteScan): ScanReportV1['components'] {
  const sourceFiles = walkFiles(projectRoot, { extensions: SOURCE_EXTENSIONS });
  const componentFiles = sourceFiles.filter((file) => {
    const base = file.split('/').pop() ?? file;
    return /^[A-Z][\w-]*\.(tsx|ts|jsx|js|vue|svelte)$/.test(base);
  });
  const directories = [...new Set(componentFiles.map((file) => file.split('/').slice(0, -1).join('/')).filter(Boolean))].slice(0, 16);
  return {
    pageCount: routes.routes.length,
    componentCount: componentFiles.length,
    directories,
  };
}

function extractCssEvidence(content: string): { variables: number; colors: number; dark: boolean; themeSignals: string[] } {
  const variableMatches = [...content.matchAll(/--[\w-]+\s*:/g)];
  const colorMatches = [...content.matchAll(/#[0-9a-fA-F]{3,8}\b|rgb[a]?\(|hsl[a]?\(/g)];
  const themeSignals = new Set<string>();
  if (/\bdark\b|color-scheme:\s*dark|\[data-theme=['"]dark['"]|\.dark\b/.test(content)) themeSignals.add('dark mode');
  if (/\[data-theme=|data-theme|theme-\w+/.test(content)) themeSignals.add('theme selector');
  if (/prefers-color-scheme/.test(content)) themeSignals.add('system color preference');
  return {
    variables: variableMatches.length,
    colors: colorMatches.length,
    dark: themeSignals.has('dark mode') || themeSignals.has('system color preference'),
    themeSignals: [...themeSignals],
  };
}

function scanStyling(projectRoot: string, detection: ProjectDetection): StylingScan {
  const deps = detection.dependencies;
  const cssFiles = walkFiles(projectRoot, { extensions: STYLE_EXTENSIONS });
  const themeSignals = new Set<string>();
  let cssVariableCount = 0;
  let colorTokenCount = 0;
  let darkMode = false;
  let configFile: string | null = null;
  let approach = 'unknown';

  const tailwindConfig = ['tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.mjs', 'tailwind.config.cjs'].find((file) =>
    existsSync(join(projectRoot, file)),
  );
  if (tailwindConfig || deps.tailwindcss) {
    approach = 'tailwind';
    configFile = tailwindConfig ?? 'package.json';
  } else if (deps['@decantr/css'] || (existsSync(join(projectRoot, 'src/styles/tokens.css')) && existsSync(join(projectRoot, 'src/styles/treatments.css')))) {
    approach = 'decantr-css';
    configFile = deps['@decantr/css'] ? 'package.json' : 'src/styles/tokens.css';
  } else if (deps.bootstrap) {
    approach = 'bootstrap';
    configFile = 'package.json';
  } else if (deps['@mui/material']) {
    approach = 'mui';
    configFile = 'package.json';
  } else if (deps['@chakra-ui/react']) {
    approach = 'chakra';
    configFile = 'package.json';
  } else if (cssFiles.some((file) => file.endsWith('.module.css'))) {
    approach = 'css-modules';
  } else if (cssFiles.length > 0) {
    approach = 'css';
  }

  for (const file of cssFiles.slice(0, 80)) {
    const content = readTextFile(join(projectRoot, file), 256 * 1024);
    if (!content) continue;
    const evidence = extractCssEvidence(content);
    cssVariableCount += evidence.variables;
    colorTokenCount += evidence.colors;
    darkMode ||= evidence.dark;
    for (const signal of evidence.themeSignals) themeSignals.add(signal);
  }

  return {
    approach,
    configFile,
    cssVariableCount,
    colorTokenCount,
    darkMode,
    themeSignals: [...themeSignals],
  };
}

function findAssistantRules(projectRoot: string): string[] {
  return RULE_FILES.filter((file) => existsSync(join(projectRoot, file)));
}

function scanStaticHosting(projectRoot: string, detection: ProjectDetection): ScanReportV1['staticHosting'] {
  const packageRead = readPackageJson(projectRoot);
  const pkg = packageRead.value;
  const evidence: string[] = [];
  const homepageUrl = typeof pkg?.homepage === 'string' ? pkg.homepage : null;
  let basePath: string | null = null;
  let hashRouting = false;

  const homepage = homepageUrl ? parseHttpUrl(homepageUrl) : null;
  if (homepage && githubPagesOwnerFromHostname(homepage.hostname)) {
    evidence.push('package.json homepage points at GitHub Pages');
    basePath = homepage.pathname && homepage.pathname !== '/' ? homepage.pathname : null;
  }

  if (detection.dependencies['gh-pages'] || pkg?.scripts?.deploy?.includes('gh-pages')) {
    evidence.push('package scripts or dependencies reference gh-pages');
  }
  if (existsSync(join(projectRoot, 'docs', 'index.html'))) evidence.push('docs/index.html can serve GitHub Pages');
  if (existsSync(join(projectRoot, '404.html')) || existsSync(join(projectRoot, 'docs', '404.html'))) {
    evidence.push('404.html fallback is present');
  }

  const workflowDir = join(projectRoot, '.github', 'workflows');
  if (existsSync(workflowDir)) {
    for (const file of walkFiles(workflowDir, { extensions: new Set(['.yml', '.yaml']) }).slice(0, 20)) {
      const content = readTextFile(join(workflowDir, file));
      if (content && /pages|gh-pages|upload-pages-artifact|deploy-pages/i.test(content)) {
        evidence.push(`GitHub Pages workflow hint: .github/workflows/${file}`);
        break;
      }
    }
  }

  const sourceFiles = walkFiles(projectRoot, { extensions: SOURCE_EXTENSIONS });
  for (const file of sourceFiles.slice(0, 200)) {
    const content = readTextFile(join(projectRoot, file), 128 * 1024);
    if (!content) continue;
    if (content.includes('HashRouter') || content.includes('createHashRouter')) {
      hashRouting = true;
      evidence.push(`hash routing detected in ${file}`);
      break;
    }
  }

  for (const config of ['vite.config.ts', 'vite.config.js', 'vite.config.mjs']) {
    const content = readTextFile(join(projectRoot, config), 128 * 1024);
    const baseMatch = content?.match(/\bbase\s*:\s*['"]([^'"]+)['"]/);
    if (baseMatch?.[1]) {
      basePath = baseMatch[1];
      evidence.push(`Vite base path configured in ${config}`);
      break;
    }
  }

  return {
    githubPagesLikely: evidence.some((item) => item.toLowerCase().includes('github') || item.toLowerCase().includes('pages')),
    evidence: [...new Set(evidence)].slice(0, 12),
    homepageUrl,
    basePath,
    hashRouting,
  };
}

function buildApplicability(detection: ProjectDetection, routes: RouteScan, components: ScanReportV1['components']): ScanReportV1['applicability'] {
  if (!WEB_FRAMEWORKS.has(detection.framework)) {
    const label =
      detection.primaryLanguage === 'python'
        ? 'Not a Brownfield UI target'
        : 'No web UI target detected';
    return {
      status: 'not_applicable',
      label,
      reasons: [
        detection.primaryLanguage === 'python'
          ? 'This looks like a Python/backend repository rather than a frontend app.'
          : 'Decantr did not find a supported frontend framework or static HTML entrypoint.',
      ],
    };
  }

  if (routes.routes.length > 0 || components.componentCount > 0) {
    return {
      status: 'strong_fit',
      label: 'Good Brownfield scan target',
      reasons: ['A supported web UI framework or static site entrypoint was detected.', 'Routes or UI component files are present.'],
    };
  }

  return {
    status: 'partial_fit',
    label: 'Partial Brownfield signal',
    reasons: ['A web framework was detected, but route/component evidence is thin.'],
  };
}

function buildConfidence(
  applicability: ScanReportV1['applicability'],
  detection: ProjectDetection,
  routes: RouteScan,
  styling: StylingScan,
): ScanReportV1['confidence'] {
  let score = 20;
  const reasons: string[] = [];
  if (detection.packageJsonPresent && detection.packageJsonValid) {
    score += 15;
    reasons.push('package.json was readable');
  }
  if (WEB_FRAMEWORKS.has(detection.framework)) {
    score += 25;
    reasons.push(`${detection.framework} framework signal found`);
  }
  if (routes.routes.length > 0) {
    score += 20;
    reasons.push(`${routes.routes.length} route signal(s) found`);
  }
  if (styling.approach !== 'unknown') {
    score += 10;
    reasons.push(`${styling.approach} styling signal found`);
  }
  if (applicability.status === 'not_applicable') score = Math.min(score, 35);
  const clamped = Math.max(5, Math.min(98, score));
  return {
    score: clamped,
    level: clamped >= 75 ? 'high' : clamped >= 45 ? 'medium' : 'low',
    reasons: reasons.length > 0 ? reasons : ['Only weak project signals were found.'],
  };
}

function buildFindings(input: {
  detection: ProjectDetection;
  routes: RouteScan;
  styling: StylingScan;
  hosting: ScanReportV1['staticHosting'];
  assistantRules: string[];
  applicability: ScanReportV1['applicability'];
  pagesProbe: PublishedSiteProbeV1 | null;
}): ScanFindingV1[] {
  const findings: ScanFindingV1[] = [];
  const { detection, routes, styling, hosting, assistantRules, applicability, pagesProbe } = input;

  if (!detection.packageJsonPresent && detection.primaryLanguage !== 'html') {
    findings.push({
      id: 'package-manifest-missing',
      severity: 'warn',
      title: 'No JavaScript package manifest',
      message: 'Decantr could not find package.json, so framework and dependency confidence is limited.',
      evidence: ['package.json missing'],
    });
  } else if (detection.packageJsonPresent && !detection.packageJsonValid) {
    findings.push({
      id: 'package-manifest-invalid',
      severity: 'warn',
      title: 'package.json could not be parsed',
      message: 'The scan continued with file-system evidence, but dependency confidence is limited.',
      evidence: ['package.json parse failed'],
    });
  }

  if (applicability.status === 'not_applicable') {
    findings.push({
      id: 'not-brownfield-ui-target',
      severity: 'info',
      title: 'Not a Brownfield UI target',
      message: 'This repository does not look like a supported frontend application for Decantr adoption.',
      evidence: [`primary language: ${detection.primaryLanguage}`, `framework: ${detection.framework}`],
      recommendation: 'Use Decantr scan on a frontend app or GitHub Pages site.',
    });
    return findings;
  }

  if (routes.routes.length === 0) {
    findings.push({
      id: 'route-map-thin',
      severity: 'warn',
      title: 'Route map is thin',
      message: 'No route declarations were detected, so a future Decantr contract would need manual route confirmation.',
      evidence: [`route strategy: ${routes.strategy}`],
      recommendation: 'Run `decantr analyze` locally when you are ready for a proposal-backed attach.',
    });
  } else {
    findings.push({
      id: 'route-map-detected',
      severity: 'success',
      title: 'Route map detected',
      message: `Decantr found ${routes.routes.length} route signal(s) that can seed a Brownfield contract.`,
      evidence: routes.routes.slice(0, 5).map((route) => `${route.path} -> ${route.file}`),
    });
  }

  if (styling.approach === 'unknown') {
    findings.push({
      id: 'style-authority-unclear',
      severity: 'warn',
      title: 'Style authority is unclear',
      message: 'The scan did not find Tailwind, Decantr CSS, a common component library, or clear CSS files.',
      evidence: ['styling approach: unknown'],
    });
  } else {
    findings.push({
      id: 'style-authority-detected',
      severity: 'success',
      title: 'Style authority detected',
      message: `The project appears to use ${styling.approach}. Decantr should preserve that authority during Brownfield adoption.`,
      evidence: [styling.configFile ? `${styling.approach}: ${styling.configFile}` : `styling approach: ${styling.approach}`],
    });
  }

  if (hosting.githubPagesLikely) {
    findings.push({
      id: 'github-pages-signal',
      severity: 'info',
      title: 'GitHub Pages signal',
      message: 'The repository has static-hosting evidence. The report separates repo evidence from published-site evidence.',
      evidence: hosting.evidence.slice(0, 5),
    });
  }

  if (hosting.githubPagesLikely && !hosting.hashRouting && detection.framework === 'react') {
    findings.push({
      id: 'github-pages-routing-risk',
      severity: 'warn',
      title: 'Static routing risk',
      message: 'React apps on GitHub Pages usually need hash routing or a 404 fallback for direct routes.',
      evidence: ['HashRouter not detected'],
      recommendation: 'Confirm whether the published site uses hash routing or a Pages 404 fallback.',
    });
  }

  if (assistantRules.length === 0) {
    findings.push({
      id: 'assistant-rules-missing',
      severity: 'info',
      title: 'No assistant rules detected',
      message: 'No common AI-assistant rule file was found. Decantr can add scoped task context after adoption.',
      evidence: ['No CLAUDE.md, AGENTS.md, .cursorrules, or Copilot instructions detected'],
    });
  }

  if (pagesProbe?.checked && !pagesProbe.reachable) {
    findings.push({
      id: 'published-site-unreachable',
      severity: 'warn',
      title: 'Published site was not reachable',
      message: 'Decantr could inspect the repository, but the inferred published site did not return a usable response.',
      evidence: [pagesProbe.error ?? `status: ${pagesProbe.status ?? 'unknown'}`],
    });
  }

  return findings;
}

function buildCommands(applicability: ScanReportV1['applicability']): string[] {
  const commands = ['npx @decantr/cli scan'];
  if (applicability.status === 'strong_fit' || applicability.status === 'partial_fit') {
    commands.push('npx @decantr/cli adopt --yes');
    commands.push('npx @decantr/cli doctor');
  }
  return commands;
}

export async function scanProject(projectRoot: string, options: ScanProjectOptions = {}): Promise<ScanReportV1> {
  const detection = detectProject(projectRoot);
  const routes = scanRoutes(projectRoot, detection);
  routes.routes = routes.routes.slice(0, MAX_REPORT_ROUTES);
  const components = countComponents(projectRoot, routes);
  const styling = scanStyling(projectRoot, detection);
  const assistantRules = findAssistantRules(projectRoot);
  const staticHosting = scanStaticHosting(projectRoot, detection);
  const pagesProbe = options.pagesProbe ?? null;
  const applicability = buildApplicability(detection, routes, components);
  const confidence = buildConfidence(applicability, detection, routes, styling);
  const rawInput = options.input ?? { kind: 'local', value: '.' };
  const input =
    rawInput.kind === 'local' && isAbsolute(rawInput.value)
      ? { ...rawInput, value: '.' }
      : rawInput;

  return {
    $schema: SCAN_REPORT_SCHEMA_URL,
    schemaVersion: 'scan-report.v1',
    generatedAt: new Date().toISOString(),
    input,
    source: {
      repository: options.repository ?? null,
      publishedSiteUrl: options.publishedSiteUrl ?? staticHosting.homepageUrl ?? null,
    },
    confidence,
    applicability,
    project: {
      framework: detection.framework,
      frameworkVersion: detection.frameworkVersion,
      packageManager: detection.packageManager,
      primaryLanguage: detection.primaryLanguage,
      hasTypeScript: detection.hasTypeScript,
      hasTailwind: detection.hasTailwind,
      hasDecantr: detection.hasDecantr,
      packageName: detection.packageName,
    },
    routes: {
      strategy: routes.strategy,
      count: routes.routes.length,
      items: routes.routes,
    },
    components,
    styling,
    staticHosting,
    assistant: {
      ruleFiles: assistantRules,
    },
    pagesProbe,
    findings: buildFindings({ detection, routes, styling, hosting: staticHosting, assistantRules, applicability, pagesProbe }),
    recommendedCommands: buildCommands(applicability),
    privacy: {
      sourceUploaded: input.kind !== 'local',
      persistedByDecantr: false,
      notes: [
        'V1 scans are read-only and do not install dependencies, build projects, execute scripts, or open pull requests.',
        'Hosted scans use temporary public-repo checkouts and return an ephemeral report.',
      ],
    },
  };
}

export function createUnavailableScanReport(input: {
  scanInput: ScanInputV1;
  repository?: ScanRepositoryV1 | null;
  publishedSiteUrl?: string | null;
  pagesProbe?: PublishedSiteProbeV1 | null;
  title: string;
  message: string;
  evidence?: string[];
}): ScanReportV1 {
  return {
    $schema: SCAN_REPORT_SCHEMA_URL,
    schemaVersion: 'scan-report.v1',
    generatedAt: new Date().toISOString(),
    input: input.scanInput,
    source: {
      repository: input.repository ?? null,
      publishedSiteUrl: input.publishedSiteUrl ?? null,
    },
    confidence: {
      level: 'low',
      score: 5,
      reasons: ['Repository source could not be inspected.'],
    },
    applicability: {
      status: 'unknown',
      label: 'Scan unavailable',
      reasons: [input.message],
    },
    project: {
      framework: 'unknown',
      frameworkVersion: null,
      packageManager: 'unknown',
      primaryLanguage: 'unknown',
      hasTypeScript: false,
      hasTailwind: false,
      hasDecantr: false,
      packageName: null,
    },
    routes: { strategy: 'none', count: 0, items: [] },
    components: { pageCount: 0, componentCount: 0, directories: [] },
    styling: {
      approach: 'unknown',
      configFile: null,
      cssVariableCount: 0,
      colorTokenCount: 0,
      darkMode: false,
      themeSignals: [],
    },
    staticHosting: {
      githubPagesLikely: false,
      evidence: [],
      homepageUrl: null,
      basePath: null,
      hashRouting: false,
    },
    assistant: { ruleFiles: [] },
    pagesProbe: input.pagesProbe ?? null,
    findings: [
      {
        id: 'source-unavailable',
        severity: 'error',
        title: input.title,
        message: input.message,
        evidence: input.evidence ?? [],
      },
    ],
    recommendedCommands: ['npx @decantr/cli scan'],
    privacy: {
      sourceUploaded: input.scanInput.kind !== 'local',
      persistedByDecantr: false,
      notes: [
        'Decantr did not persist this report.',
        'No dependencies were installed, no scripts were executed, and no pull requests were opened.',
      ],
    },
  };
}

function decodeHtmlText(value: string): string {
  return decodeHTML(value).replace(/\s+/g, ' ').trim();
}

function decodeHtmlAttributeValue(value: string): string {
  return decodeHTMLAttribute(value).trim();
}

function extractHtmlAttribute(tag: string, attr: string): string | null {
  const match = tag.match(new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, 'i'));
  return match?.[1] ? decodeHtmlAttributeValue(match[1]) : null;
}

export async function probePublishedSite(url: string, options: { timeoutMs?: number; fetchImpl?: typeof fetch } = {}): Promise<PublishedSiteProbeV1> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 6000);
  try {
    const response = await fetchImpl(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'Decantr-Scan/1.0 (+https://decantr.ai/scan)',
      },
    });
    const text = (await response.text()).slice(0, MAX_FILE_READ_BYTES);
    const titleMatch = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const descriptionTag = text.match(/<meta\b[^>]*(?:name|property)=["']description["'][^>]*>/i)?.[0] ?? null;
    const canonicalTag = text.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i)?.[0] ?? null;
    const assetSamples = [...text.matchAll(/\b(?:src|href)=["']([^"']+)["']/gi)]
      .map((match) => match[1])
      .filter((value): value is string => Boolean(value))
      .slice(0, 40);
    const routingHints: string[] = [];
    if (text.includes('/#/') || text.includes('#/')) routingHints.push('hash route URLs present');
    if (text.includes('data-reactroot') || text.includes('id="root"') || text.includes("id='root'")) {
      routingHints.push('client app mount detected');
    }

    return {
      url,
      finalUrl: response.url || url,
      checked: true,
      reachable: response.ok,
      status: response.status,
      title: titleMatch?.[1] ? decodeHtmlText(titleMatch[1]) : null,
      description: descriptionTag ? extractHtmlAttribute(descriptionTag, 'content') : null,
      canonicalUrl: canonicalTag ? extractHtmlAttribute(canonicalTag, 'href') : null,
      assetHints: {
        rootRelative: assetSamples.filter((item) => item.startsWith('/') && !item.startsWith('//')).length,
        relative: assetSamples.filter((item) => !item.startsWith('/') && !/^https?:\/\//.test(item)).length,
        absolute: assetSamples.filter((item) => /^https?:\/\//.test(item) || item.startsWith('//')).length,
        samples: assetSamples.slice(0, 8),
      },
      routingHints,
      error: null,
    };
  } catch (error) {
    return {
      url,
      finalUrl: null,
      checked: true,
      reachable: false,
      status: null,
      title: null,
      description: null,
      canonicalUrl: null,
      assetHints: { rootRelative: 0, relative: 0, absolute: 0, samples: [] },
      routingHints: [],
      error: error instanceof Error ? error.message : 'Published site probe failed.',
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function resolveGitHubScanInput(input: string): GitHubScanInputResolution {
  const url = parseHttpUrl(input);
  if (!url) {
    throw new Error('Enter a valid GitHub repository URL or GitHub Pages URL.');
  }

  const host = url.hostname.toLowerCase();
  if (host === 'github.com' || host === 'www.github.com') {
    const [ownerSegment, repoSegment] = url.pathname.split('/').filter(Boolean);
    const owner = normalizeGitHubPathSegment(ownerSegment, 'owner');
    const repo = normalizeGitHubPathSegment(repoSegment, 'repo');
    if (!owner || !repoSegment) {
      throw new Error('GitHub repository URLs must include owner and repository.');
    }
    if (!repo) {
      throw new Error('GitHub repository URLs must include a valid owner and repository.');
    }
    return {
      inputKind: 'github-repo',
      normalizedInput: `https://github.com/${owner}/${repo}`,
      repository: {
        owner,
        repo,
        url: `https://github.com/${owner}/${repo}`,
      },
      publishedSiteUrl: `https://${owner}.github.io/${repo}/`,
      warnings: url.pathname.split('/').filter(Boolean).length > 2 ? ['Extra GitHub URL path segments were ignored.'] : [],
    };
  }

  const pagesOwner = githubPagesOwnerFromHostname(host);
  if (pagesOwner) {
    const segments = url.pathname.split('/').filter(Boolean);
    const repo = segments[0] ? normalizeGitHubPathSegment(segments[0], 'repo') : `${pagesOwner}.github.io`;
    if (!repo) {
      throw new Error('GitHub Pages URLs must include a valid owner and repository path.');
    }
    const publishedSiteUrl = segments[0] ? `https://${pagesOwner}.github.io/${repo}/` : `https://${pagesOwner}.github.io/`;
    return {
      inputKind: 'github-pages',
      normalizedInput: publishedSiteUrl,
      repository: {
        owner: pagesOwner,
        repo,
        url: `https://github.com/${pagesOwner}/${repo}`,
      },
      publishedSiteUrl,
      warnings: segments.length > 1 ? ['Only the first GitHub Pages path segment was used to infer the repository.'] : [],
    };
  }

  throw new Error('V1 hosted scans support GitHub repositories and GitHub Pages URLs.');
}
