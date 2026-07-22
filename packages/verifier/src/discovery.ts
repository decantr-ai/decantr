import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import * as ts from 'typescript';
import {
  type AngularApplicationDiscovery,
  type AngularProjectContext,
  type AngularRouteAuthority,
  type AngularRouteCompleteness,
  discoverAngularApplication,
  discoverAngularProjectContext,
} from './angular-discovery.js';
import { assessFrameworkRouteAuthority } from './framework-adapters/index.js';
import { isProductionAuthorityPath } from './source/scope.js';
import {
  buildUISurfaceDiscovery,
  type UIReadinessAxes,
  type UIReadinessStatus,
  type UISurfaceDiscovery,
} from './ui-surfaces.js';

export type DiscoveryConfidenceLevel = 'high' | 'medium' | 'low';
export type DiscoveryPackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun' | 'unknown';
export type DiscoveryFramework =
  | 'angular'
  | 'astro'
  | 'html'
  | 'nextjs'
  | 'nuxt'
  | 'react'
  | 'solid'
  | 'svelte'
  | 'vue'
  | 'unknown';
export type DiscoveryPrimaryLanguage =
  | 'go'
  | 'html'
  | 'javascript'
  | 'python'
  | 'rust'
  | 'typescript'
  | 'unknown';
export type DiscoveryRouteStrategy =
  | 'angular-router'
  | 'app-router'
  | 'mixed-next-router'
  | 'none'
  | 'nuxt-router'
  | 'pages-router'
  | 'react-router-file-router'
  | 'react-router'
  | 'solidstart-router'
  | 'source-declared'
  | 'static-html'
  | 'sveltekit-router'
  | 'vue-router';
export type DiscoveryRouteSignalKind =
  | 'angular-router'
  | 'file-route'
  | 'html-route'
  | 'pathname-branch'
  | 'react-router'
  | 'source-declared'
  | 'tanstack-router'
  | 'vue-router';

export interface DiscoverySourceLocation {
  file: string;
  line?: number;
}

export interface DiscoveryRouteSignal {
  path: string;
  file: string;
  kind: DiscoveryRouteSignalKind;
  confidence: DiscoveryConfidenceLevel;
  taskable: boolean;
  evidence: string;
  declarationFile?: string;
}

export interface DiscoveryRoute {
  path: string;
  file: string;
  hasLayout: boolean;
  confidence: DiscoveryConfidenceLevel;
  source: DiscoveryRouteSignalKind;
}

export interface DiscoveryComponent {
  name: string;
  file: string;
  kind:
    | 'angular-component'
    | 'exported'
    | 'default-export'
    | 'wrapper'
    | 'pascal-file'
    | 'route-local';
  confidence: DiscoveryConfidenceLevel;
}

export interface DiscoveryProjectIdentity {
  framework: DiscoveryFramework;
  frameworkVersion: string | null;
  packageManager: DiscoveryPackageManager;
  primaryLanguage: DiscoveryPrimaryLanguage;
  hasTypeScript: boolean;
  hasTailwind: boolean;
  hasDecantr: boolean;
  packageName: string | null;
  packageJsonPresent: boolean;
  packageJsonValid: boolean;
  dependencies: Record<string, string>;
  evidence: string[];
}

export interface DiscoveryWorkspaceScope {
  workspaceRoot: string;
  appRoot: string;
  projectPath: string;
  scope: 'single-app' | 'workspace-app';
}

export interface DiscoveryRoutes {
  strategy: DiscoveryRouteStrategy;
  routeSignals: DiscoveryRouteSignal[];
  taskableRoutes: DiscoveryRoute[];
  routeSignalCount: number;
  taskableRouteCount: number;
  confidence: DiscoveryConfidenceLevel;
  authority: AngularRouteAuthority;
  completeness: AngularRouteCompleteness;
  authorityFiles: string[];
  excludedSourceCount: number;
  evidence: string[];
  limitations: string[];
}

export interface DiscoveryComponents {
  pageCount: number;
  componentCount: number;
  directories: string[];
  items: DiscoveryComponent[];
  confidence: DiscoveryConfidenceLevel;
  evidence: string[];
  limitations: string[];
}

export interface DiscoveryStyling {
  approach: string;
  configFile: string | null;
  authorityFiles: string[];
  cssVariableCount: number;
  colorTokenCount: number;
  darkMode: boolean;
  themeSignals: string[];
  confidence: DiscoveryConfidenceLevel;
  evidence: string[];
  limitations: string[];
}

export interface ProjectDiscovery {
  schemaVersion: 'discovery.v1';
  generatedAt: string;
  workspace: DiscoveryWorkspaceScope;
  project: DiscoveryProjectIdentity;
  routes: DiscoveryRoutes;
  components: DiscoveryComponents;
  styling: DiscoveryStyling;
  surfaces: UISurfaceDiscovery;
  assistant: {
    ruleFiles: string[];
  };
  confidence: {
    level: DiscoveryConfidenceLevel;
    score: number;
    reasons: string[];
  };
  limitations: string[];
}

export interface DiscoveryReadiness {
  status: UIReadinessStatus;
  axes: UIReadinessAxes;
  routeScopedContext: 'ready' | 'not_proven';
  adoptionBaseline: 'ready' | 'not_proven';
  reasons: string[];
}

interface PackageJson {
  name?: string;
  private?: boolean;
  homepage?: string;
  packageManager?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  workspaces?: string[] | { packages?: string[] };
}

const SOURCE_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.vue',
  '.svelte',
  '.astro',
]);
const STYLE_EXTENSIONS = new Set(['.css', '.scss', '.sass', '.less']);
const PAGE_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.vue',
  '.svelte',
  '.astro',
  '.html',
]);
const UI_SURFACE_EXTENSIONS = new Set([
  ...SOURCE_EXTENSIONS,
  ...STYLE_EXTENSIONS,
  '.html',
  '.json',
  '.jsonc',
  '.md',
  '.mdx',
  '.yaml',
  '.yml',
]);
const MAX_FILE_READ_BYTES = 512 * 1024;
const MAX_WALK_FILES = 8000;
const MAX_REPORT_ROUTES = 1000;
const MAX_COMPONENT_ITEMS = 1000;
const ROUTE_ASSET_EXTENSION_RE =
  /\.(?:avif|bmp|css|gif|ico|jpeg|jpg|js|json|map|mp4|pdf|png|svg|webp|woff2?)$/i;
const ROUTE_VARIABLE_NAMES =
  '(?:path|pathname|route|currentPath|currentRoute|locationPath|activePath)';
const JSX_ROUTE_PATH_RE =
  /<(?:Route|[A-Z][\w.]*Route)\b[^>]*\bpath\s*=\s*(?:"([^"]+)"|'([^']+)'|{\s*"([^"]+)"\s*}|{\s*'([^']+)'\s*}|{\s*`([^`]+)`\s*})/g;
const OBJECT_ROUTE_PATH_RE = /\bpath\s*:\s*(?:"([^"]+)"|'([^']+)'|`([^`]+)`)/g;
const TANSTACK_FILE_ROUTE_RE =
  /\bcreate(?:Lazy)?FileRoute\s*\(\s*(?:"([^"]+)"|'([^']+)'|`([^`]+)`)/g;
const STATIC_HTML_ENTRY_FILES = ['index.html', 'src/index.html', 'public/index.html'];
const STATIC_HTML_ROUTE_DIRS: string[] = [];
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

const EXCLUDED_SOURCE_FILE_RE =
  /(?:^|\/)(?:\.storybook|__tests__|cypress|demos?|docs?|e2e|examples?|mocks?|fixtures?|generated|__generated__|playgrounds?|playwright|samples?|specs?|stories|storybook|support|tests?)(?:\/|$)|(?:\.test|\.spec|\.vitest|\.e2e|\.cy|\.stories|\.story|\.figma|\.mock|\.fixture|\.gen|\.generated|\.d)\.[cm]?[tj]sx?$/i;

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

function readPackageJson(dir: string): {
  value: PackageJson | null;
  present: boolean;
  valid: boolean;
} {
  const path = join(dir, 'package.json');
  if (!existsSync(path)) return { value: null, present: false, valid: false };
  const content = readTextFile(path);
  if (!content) return { value: null, present: true, valid: false };
  try {
    const parsed = JSON.parse(content) as unknown;
    return {
      value: isRecord(parsed) ? (parsed as PackageJson) : null,
      present: true,
      valid: isRecord(parsed),
    };
  } catch {
    return { value: null, present: true, valid: false };
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
  return Boolean(readPackageJson(dir).value?.workspaces);
}

function findWorkspaceRoot(startDir: string): string {
  const appRoot = resolve(startDir);
  let current = resolve(startDir);
  while (true) {
    if (hasWorkspaceMarker(current)) return current;
    const appPath = relative(current, appRoot).replace(/\\/g, '/');
    const packageJson = readPackageJson(current).value;
    if (
      appPath.startsWith('apps/') &&
      packageJson &&
      (packageJson.private === true || existsSync(join(current, '.git')))
    ) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) return resolve(startDir);
    current = parent;
  }
}

function packageManagerFromName(value?: string): DiscoveryPackageManager {
  const name = value?.split('@')[0];
  if (name === 'npm' || name === 'pnpm' || name === 'yarn' || name === 'bun') return name;
  return 'unknown';
}

function detectPackageManager(appRoot: string, workspaceRoot: string): DiscoveryPackageManager {
  let current = resolve(appRoot);
  const stop = resolve(workspaceRoot);
  while (true) {
    const declared = packageManagerFromName(readPackageJson(current).value?.packageManager);
    if (declared !== 'unknown') return declared;
    if (existsSync(join(current, 'pnpm-lock.yaml'))) return 'pnpm';
    if (existsSync(join(current, 'yarn.lock'))) return 'yarn';
    if (existsSync(join(current, 'bun.lockb')) || existsSync(join(current, 'bun.lock')))
      return 'bun';
    if (existsSync(join(current, 'package-lock.json'))) return 'npm';
    const parent = dirname(current);
    if (parent === current || current === stop) return 'unknown';
    current = parent;
  }
}

function hasAnyFile(projectRoot: string, paths: string[]): boolean {
  return paths.some((path) => existsSync(join(projectRoot, path)));
}

function hasStaticHtmlSurface(projectRoot: string): boolean {
  if (hasAnyFile(projectRoot, STATIC_HTML_ENTRY_FILES)) return true;
  return STATIC_HTML_ROUTE_DIRS.some((dir) => existsSync(join(projectRoot, dir, 'index.html')));
}

function detectTailwindAuthority(
  projectRoot: string,
  cssFiles?: string[],
): {
  found: boolean;
  evidence: string[];
  files: string[];
} {
  const configFiles = [
    'tailwind.config.js',
    'tailwind.config.ts',
    'tailwind.config.mjs',
    'tailwind.config.cjs',
    'postcss.config.js',
    'postcss.config.cjs',
    'postcss.config.mjs',
    '.postcssrc',
    '.postcssrc.json',
    '.postcssrc.js',
    '.postcssrc.cjs',
  ];
  const evidence: string[] = [];
  const files = new Set<string>();
  for (const file of configFiles) {
    const path = join(projectRoot, file);
    if (!existsSync(path)) continue;
    const content = readTextFile(path, 128 * 1024) ?? '';
    if (
      file.startsWith('tailwind.config') ||
      /(?:@tailwindcss\/postcss|tailwindcss)/u.test(content)
    ) {
      evidence.push(`Tailwind configured in ${file}`);
      files.add(file);
    }
  }
  for (const file of cssFiles ?? walkFiles(projectRoot, { extensions: STYLE_EXTENSIONS })) {
    const content = readTextFile(join(projectRoot, file), 256 * 1024) ?? '';
    if (
      /(?:^|[\r\n])\s*@(?:tailwind|theme)\b|@import\s+["']tailwindcss["']|(?:^|[\r\n])\s*@plugin\s+["']tailwindcss/mu.test(
        content,
      )
    ) {
      evidence.push(`Tailwind directive found in ${file}`);
      files.add(file);
    }
  }
  return {
    found: evidence.length > 0,
    evidence: [...new Set(evidence)].sort(),
    files: [...files].sort(),
  };
}

function shouldSkipDir(name: string): boolean {
  return SKIP_DIRS.has(name) || (name.startsWith('.') && name !== '.github');
}

function walkFiles(
  projectRoot: string,
  options: { extensions?: Set<string>; includeHidden?: boolean } = {},
): string[] {
  const files: string[] = [];
  function walk(dir: string): void {
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
      let stat: ReturnType<typeof statSync>;
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
      if (!options.extensions || options.extensions.has(ext)) files.push(rel);
    }
  }
  walk(projectRoot);
  return files;
}

function dependencyVersion(dependencies: Record<string, string>, names: string[]): string | null {
  for (const name of names) {
    const version = dependencies[name];
    if (version) return version.replace(/^[~^]/, '');
  }
  return null;
}

function detectPrimaryLanguage(
  projectRoot: string,
  packageJsonPresent: boolean,
): DiscoveryPrimaryLanguage {
  const sourceFiles = walkFiles(projectRoot, { extensions: SOURCE_EXTENSIONS });
  if (
    hasAnyFile(projectRoot, ['tsconfig.json']) ||
    sourceFiles.some((file) => /\.(tsx|ts)$/.test(file))
  ) {
    return 'typescript';
  }
  if (sourceFiles.some((file) => /\.(jsx|js|mjs|cjs)$/.test(file))) return 'javascript';
  if (packageJsonPresent) return hasStaticHtmlSurface(projectRoot) ? 'html' : 'javascript';
  if (hasAnyFile(projectRoot, ['pyproject.toml', 'requirements.txt', 'setup.py', 'Pipfile']))
    return 'python';
  if (hasAnyFile(projectRoot, ['go.mod'])) return 'go';
  if (hasAnyFile(projectRoot, ['Cargo.toml'])) return 'rust';
  if (hasStaticHtmlSurface(projectRoot)) return 'html';
  return 'unknown';
}

function detectProjectIdentity(
  projectRoot: string,
  workspaceRoot: string,
  angularProject: AngularProjectContext,
): DiscoveryProjectIdentity {
  const packageRead = readPackageJson(projectRoot);
  const pkg = packageRead.value;
  const dependencies = { ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}) };
  const evidence: string[] = [];
  let framework: DiscoveryFramework = 'unknown';
  let frameworkVersion: string | null = null;

  if (
    hasAnyFile(projectRoot, ['next.config.js', 'next.config.ts', 'next.config.mjs']) ||
    dependencies.next
  ) {
    framework = 'nextjs';
    frameworkVersion = dependencyVersion(dependencies, ['next']);
    evidence.push('Next.js config or dependency');
  } else if (hasAnyFile(projectRoot, ['nuxt.config.js', 'nuxt.config.ts']) || dependencies.nuxt) {
    framework = 'nuxt';
    frameworkVersion = dependencyVersion(dependencies, ['nuxt']);
    evidence.push('Nuxt config or dependency');
  } else if (
    hasAnyFile(projectRoot, ['astro.config.mjs', 'astro.config.ts']) ||
    dependencies.astro
  ) {
    framework = 'astro';
    frameworkVersion = dependencyVersion(dependencies, ['astro']);
    evidence.push('Astro config or dependency');
  } else if (
    hasAnyFile(projectRoot, ['svelte.config.js', 'svelte.config.ts']) ||
    dependencies.svelte ||
    dependencies['@sveltejs/kit']
  ) {
    framework = 'svelte';
    frameworkVersion = dependencyVersion(dependencies, ['svelte', '@sveltejs/kit']);
    evidence.push('Svelte/SvelteKit config or dependency');
  } else if (
    angularProject.matched ||
    hasAnyFile(projectRoot, ['angular.json', 'project.json']) ||
    dependencies['@angular/core']
  ) {
    framework = 'angular';
    frameworkVersion = dependencyVersion(dependencies, ['@angular/core']);
    evidence.push('Angular config or dependency');
    evidence.push(...angularProject.evidence);
  } else if (dependencies['solid-js']) {
    framework = 'solid';
    frameworkVersion = dependencyVersion(dependencies, ['solid-js']);
    evidence.push('Solid dependency');
  } else if (dependencies.vue) {
    framework = 'vue';
    frameworkVersion = dependencyVersion(dependencies, ['vue']);
    evidence.push('Vue dependency');
  } else if (
    dependencies.react ||
    dependencies['react-dom'] ||
    hasAnyFile(projectRoot, ['vite.config.ts', 'vite.config.js'])
  ) {
    framework = dependencies.react || dependencies['react-dom'] ? 'react' : 'unknown';
    frameworkVersion = dependencyVersion(dependencies, ['react', 'react-dom']);
    if (framework === 'react') evidence.push('React dependency');
  }

  if (framework === 'unknown' && hasStaticHtmlSurface(projectRoot)) {
    framework = 'html';
    evidence.push('static HTML entrypoint');
  }

  const cssFiles = walkFiles(projectRoot, { extensions: STYLE_EXTENSIONS });
  const tailwind = detectTailwindAuthority(projectRoot, cssFiles);
  const hasTailwind = tailwind.found;
  evidence.push(...tailwind.evidence);
  if (dependencies.tailwindcss && !hasTailwind) {
    evidence.push(
      'Tailwind dependency is installed but no selected-app configuration or CSS directive proves style authority',
    );
  }

  return {
    framework,
    frameworkVersion,
    packageManager: detectPackageManager(projectRoot, workspaceRoot),
    primaryLanguage: detectPrimaryLanguage(projectRoot, packageRead.present),
    hasTypeScript:
      hasAnyFile(projectRoot, ['tsconfig.json']) ||
      walkFiles(projectRoot, { extensions: SOURCE_EXTENSIONS }).some((file) =>
        /\.(tsx|ts)$/.test(file),
      ),
    hasTailwind,
    hasDecantr:
      existsSync(join(projectRoot, 'decantr.essence.json')) ||
      existsSync(join(projectRoot, '.decantr')) ||
      Boolean(dependencies['@decantr/cli'] || dependencies['@decantr/css']),
    packageName: typeof pkg?.name === 'string' ? pkg.name : null,
    packageJsonPresent: packageRead.present,
    packageJsonValid: packageRead.valid,
    dependencies,
    evidence,
  };
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

function normalizeRouteLiteral(value: string): string[] {
  const withoutHash = value.trim().split('#')[0];
  const cleaned =
    withoutHash.includes('?') && !withoutHash.endsWith(')?')
      ? withoutHash.split('?')[0]
      : withoutHash;
  if (!cleaned || cleaned === '/') return ['/'];
  if (cleaned === '*' || cleaned === '**' || cleaned.startsWith('#')) return [];
  if (cleaned === '/*' || cleaned === '/**') return [];
  if (ROUTE_ASSET_EXTENSION_RE.test(cleaned)) return [];
  const optionalGroup = cleaned.match(/^\/\(([^()]+)\)\?$/);
  if (optionalGroup) {
    return [
      '/',
      ...optionalGroup[1]
        .split('|')
        .map((segment) => segment.trim())
        .filter(Boolean)
        .map((segment) => `/${segment}`),
    ];
  }
  const withoutTrailingWildcard =
    cleaned.endsWith('*') && !cleaned.endsWith('/*') && !/:\w+\*$/.test(cleaned)
      ? cleaned.slice(0, -1)
      : cleaned;
  const normalized = withoutTrailingWildcard.replace(/\/+$/g, '') || '/';
  if (normalized === '/*' || normalized === '/**') return [];
  return [normalized.startsWith('/') ? normalized : `/${normalized}`];
}

function addRouteSignal(
  signals: DiscoveryRouteSignal[],
  input: Omit<DiscoveryRouteSignal, 'path'> & { path: string | null | undefined },
): void {
  if (input.path === null || input.path === undefined) return;
  for (const path of normalizeRouteLiteral(input.path)) {
    signals.push({ ...input, path });
  }
}

function fileRouteFromPath(file: string, baseDir: string): string {
  let withoutExt = file.slice(0, -extname(file).length);
  if (withoutExt.endsWith('/index')) withoutExt = withoutExt.slice(0, -'/index'.length);
  withoutExt = withoutExt.replace(/\/(?:page|\+page)$/u, '');
  withoutExt = withoutExt.replace(
    new RegExp(`^${baseDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
    '',
  );
  const parts = withoutExt
    .split('/')
    .filter(Boolean)
    .map((part) => segmentToRoute(part))
    .filter(Boolean);
  return `/${parts.join('/')}` || '/';
}

function scanFileRoutes(
  projectRoot: string,
  baseDir: string,
  extensions = PAGE_EXTENSIONS,
  routeFileNames?: Set<string>,
): DiscoveryRouteSignal[] {
  const fullBase = join(projectRoot, baseDir);
  if (!existsSync(fullBase)) return [];
  return walkFiles(fullBase, { extensions }).flatMap((file) => {
    const baseName = file.split('/').pop() ?? file;
    const routeFileName = baseName.slice(0, -extname(baseName).length);
    if (routeFileNames && !routeFileNames.has(routeFileName)) return [];
    if (routeFileName.startsWith('_')) return [];
    const rel = relative(projectRoot, join(fullBase, file)).replace(/\\/g, '/');
    if (EXCLUDED_SOURCE_FILE_RE.test(rel)) return [];
    return [
      {
        path: fileRouteFromPath(rel, baseDir),
        file: rel,
        declarationFile: rel,
        kind: 'file-route' as const,
        confidence: 'high' as const,
        taskable: true,
        evidence: `file route ${rel}`,
      },
    ];
  });
}

function reactRouterFileRouteFromPath(file: string, baseDir: string): string {
  let withoutExt = file.slice(0, -extname(file).length);
  withoutExt = withoutExt.replace(
    new RegExp(`^${baseDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?`),
    '',
  );
  const escapedDot = '__DECANTR_LITERAL_DOT__';
  const parts = withoutExt
    .replace(/\[\.\]/gu, escapedDot)
    .split('/')
    .filter(Boolean)
    .flatMap((part) => part.split('.'))
    .map((part) => part.replaceAll(escapedDot, '.'))
    .filter((part) => part !== 'index' && !part.startsWith('_'))
    .map((part) => {
      if (part === '$') return ':splat*';
      if (part.startsWith('$')) return `:${part.slice(1)}`;
      return part.endsWith('_') ? part.slice(0, -1) : part;
    });
  return `/${parts.join('/')}` || '/';
}

function scanReactRouterFileRoutes(projectRoot: string): DiscoveryRouteSignal[] {
  const configFile = 'app/routes.ts';
  const config = readTextFile(join(projectRoot, configFile), 256 * 1024) ?? '';
  if (
    !config ||
    !/(?:autoRoutes|flatRoutes)\s*\(/u.test(config) ||
    !existsSync(join(projectRoot, 'app', 'routes'))
  ) {
    return [];
  }
  return walkFiles(join(projectRoot, 'app', 'routes'), {
    extensions: new Set(['.tsx', '.ts', '.jsx', '.js']),
  }).flatMap((file) => {
    const rel = `app/routes/${file}`;
    if (
      EXCLUDED_SOURCE_FILE_RE.test(rel) ||
      /(?:^|\/)__|\.(?:client|server|spec|test)\.[cm]?[jt]sx?$/iu.test(rel)
    ) {
      return [];
    }
    const content = readTextFile(join(projectRoot, rel), 256 * 1024) ?? '';
    const taskable =
      /\bexport\s+default\b/u.test(content) ||
      /\bexport\s+(?:const|function|class)\s+(?:Component|HydrateFallback)\b/u.test(content);
    return [
      {
        path: reactRouterFileRouteFromPath(rel, 'app/routes'),
        file: rel,
        declarationFile: configFile,
        kind: 'react-router' as const,
        confidence: 'high' as const,
        taskable,
        evidence: taskable
          ? 'React Router auto-routes UI module'
          : 'React Router auto-routes resource module',
      },
    ];
  });
}

function scanSolidStartFileRoutes(projectRoot: string): DiscoveryRouteSignal[] {
  if (!existsSync(join(projectRoot, 'src', 'routes'))) return [];
  return walkFiles(join(projectRoot, 'src', 'routes'), {
    extensions: new Set(['.tsx', '.ts', '.jsx', '.js']),
  }).flatMap((file) => {
    const rel = `src/routes/${file}`;
    if (
      EXCLUDED_SOURCE_FILE_RE.test(rel) ||
      /\.(?:data|server|spec|test)\.[cm]?[jt]sx?$/iu.test(rel)
    ) {
      return [];
    }
    const content = readTextFile(join(projectRoot, rel), 256 * 1024) ?? '';
    if (!/\bexport\s+default\b/u.test(content)) return [];
    return [
      {
        path: fileRouteFromPath(rel, 'src/routes'),
        file: rel,
        declarationFile: rel,
        kind: 'file-route' as const,
        confidence: 'high' as const,
        taskable: true,
        evidence: 'SolidStart file-route UI module',
      },
    ];
  });
}

function collectRouteLiterals(
  pattern: RegExp,
  content: string,
  file: string,
  signals: DiscoveryRouteSignal[],
  kind: DiscoveryRouteSignalKind,
  taskable = true,
): void {
  for (const match of content.matchAll(pattern)) {
    const value = match.slice(1).find((item): item is string => typeof item === 'string');
    addRouteSignal(signals, {
      path: value,
      file,
      declarationFile: file,
      kind,
      confidence: kind === 'pathname-branch' ? 'medium' : 'high',
      taskable,
      evidence: `${kind} route literal`,
    });
  }
}

function collectPathnameBranchRoutes(
  content: string,
  file: string,
  signals: DiscoveryRouteSignal[],
): void {
  const beforeCount = signals.length;
  collectRouteLiterals(
    new RegExp(
      `\\b${ROUTE_VARIABLE_NAMES}\\b\\s*(?:===|!==|==|!=)\\s*["'\`](\\/[^"'\`]+)["'\`]`,
      'g',
    ),
    content,
    file,
    signals,
    'pathname-branch',
  );
  collectRouteLiterals(
    new RegExp(
      `["'\`](\\/[^"'\`]+)["'\`]\\s*(?:===|!==|==|!=)\\s*\\b${ROUTE_VARIABLE_NAMES}\\b`,
      'g',
    ),
    content,
    file,
    signals,
    'pathname-branch',
  );
  collectRouteLiterals(
    /\bcase\s+["'`](\/[^"'`]+)["'`]\s*:/g,
    content,
    file,
    signals,
    'pathname-branch',
  );
  const hasPathnameSignal = /\b(?:window\.|document\.)?location\.pathname\b|\bpathname\b/.test(
    content,
  );
  if (signals.length > beforeCount || hasPathnameSignal) {
    collectRouteLiterals(
      new RegExp(
        `\\b(?:const|let|var)?\\s*${ROUTE_VARIABLE_NAMES}\\b\\s*=\\s*[^;\\n]{0,160}["'\`](\\/[^"'\`]*)["'\`]`,
        'g',
      ),
      content,
      file,
      signals,
      'pathname-branch',
    );
    collectRouteLiterals(
      /\b(?:href|to)\s*=\s*(?:"([^"]+)"|'([^']+)'|{\s*"([^"]+)"\s*}|{\s*'([^']+)'\s*}|{\s*`([^`]+)`\s*})/g,
      content,
      file,
      signals,
      'pathname-branch',
    );
  }
}

function unwrapExpression(expression: ts.Expression): ts.Expression {
  let current = expression;
  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isNonNullExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function propertyNameText(name: ts.PropertyName | undefined): string | null {
  if (!name) return null;
  if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name)) return name.text;
  if (ts.isStringLiteralLike(name) || ts.isNumericLiteral(name)) return name.text;
  return null;
}

function expressionPath(expression: ts.Expression): string | null {
  const current = unwrapExpression(expression);
  if (ts.isIdentifier(current)) return current.text;
  if (ts.isPropertyAccessExpression(current)) {
    const parent = expressionPath(current.expression);
    return parent ? `${parent}.${current.name.text}` : null;
  }
  if (ts.isElementAccessExpression(current) && current.argumentExpression) {
    const parent = expressionPath(current.expression);
    const key = unwrapExpression(current.argumentExpression);
    if (parent && (ts.isStringLiteralLike(key) || ts.isNumericLiteral(key))) {
      return `${parent}.${key.text}`;
    }
  }
  return null;
}

function collectStaticRouteValues(sourceFiles: ts.SourceFile[]): Map<string, string> {
  const values = new Map<string, string>();

  function collect(prefix: string, expression: ts.Expression): void {
    const current = unwrapExpression(expression);
    if (ts.isStringLiteralLike(current)) {
      values.set(prefix, current.text);
      return;
    }
    if (!ts.isObjectLiteralExpression(current)) return;
    for (const property of current.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const key = propertyNameText(property.name);
      if (key) collect(`${prefix}.${key}`, property.initializer);
    }
  }

  for (const sourceFile of sourceFiles) {
    sourceFile.forEachChild((node) => {
      if (!ts.isVariableStatement(node)) return;
      for (const declaration of node.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
        collect(declaration.name.text, declaration.initializer);
      }
    });
  }
  return values;
}

function resolveStaticRouteValue(
  expression: ts.Expression,
  values: Map<string, string>,
): string | undefined {
  const current = unwrapExpression(expression);
  if (ts.isStringLiteralLike(current)) return current.text;
  const path = expressionPath(current);
  return path ? values.get(path) : undefined;
}

function joinNestedRoute(parentPath: string | null, routePath: string): string {
  if (routePath.startsWith('/')) return routePath;
  if (!routePath) return parentPath || '/';
  const parent = parentPath && parentPath !== '/' ? parentPath.replace(/\/$/, '') : '';
  return `${parent}/${routePath}`;
}

function resolveLocalImportFile(
  projectRoot: string,
  sourceFile: string,
  importPath: string,
): string | null {
  const base = importPath.startsWith('.')
    ? resolve(dirname(join(projectRoot, sourceFile)), importPath)
    : importPath.startsWith('#/') || importPath.startsWith('@/')
      ? resolve(projectRoot, 'src', importPath.slice(2))
      : null;
  if (!base) return null;
  const candidates = [
    base,
    ...['.tsx', '.ts', '.jsx', '.js', '.mjs', '.cjs', '.vue', '.svelte', '.astro'].map(
      (extension) => `${base}${extension}`,
    ),
    ...['.tsx', '.ts', '.jsx', '.js', '.vue', '.svelte', '.astro'].map((extension) =>
      join(base, `index${extension}`),
    ),
  ];
  const match = candidates.find((candidate) => {
    try {
      return statSync(candidate).isFile();
    } catch {
      return false;
    }
  });
  return match ? relative(projectRoot, match).replace(/\\/g, '/') : null;
}

function dynamicImportFile(projectRoot: string, sourceFile: string, node: ts.Node): string | null {
  let importPath: string | null = null;
  const visit = (current: ts.Node): void => {
    if (importPath) return;
    if (
      ts.isCallExpression(current) &&
      current.expression.kind === ts.SyntaxKind.ImportKeyword &&
      current.arguments.length > 0
    ) {
      const argument = unwrapExpression(current.arguments[0] as ts.Expression);
      if (ts.isStringLiteralLike(argument)) importPath = argument.text;
      return;
    }
    ts.forEachChild(current, visit);
  };
  visit(node);
  return importPath ? resolveLocalImportFile(projectRoot, sourceFile, importPath) : null;
}

function routeImplementationFile(
  projectRoot: string,
  sourceFile: string,
  routeObject: ts.ObjectLiteralExpression,
): string {
  for (const property of routeObject.properties) {
    if (ts.isPropertyAssignment(property) && propertyNameText(property.name) === 'children')
      continue;
    const resolved = dynamicImportFile(projectRoot, sourceFile, property);
    if (resolved) return resolved;
  }
  return sourceFile;
}

function collectReactRouterObjectRoutes(
  projectRoot: string,
  file: string,
  sourceFile: ts.SourceFile,
  values: Map<string, string>,
): DiscoveryRouteSignal[] {
  const signals: DiscoveryRouteSignal[] = [];
  const arrays = new Map<string, ts.ArrayLiteralExpression>();

  sourceFile.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const declaration of node.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
      const initializer = unwrapExpression(declaration.initializer);
      if (ts.isArrayLiteralExpression(initializer)) arrays.set(declaration.name.text, initializer);
    }
  });

  const resolveArray = (
    expression: ts.Expression | undefined,
  ): ts.ArrayLiteralExpression | null => {
    if (!expression) return null;
    const current = unwrapExpression(expression);
    if (ts.isArrayLiteralExpression(current)) return current;
    return ts.isIdentifier(current) ? arrays.get(current.text) || null : null;
  };

  const parseArray = (array: ts.ArrayLiteralExpression, parentPath: string | null): void => {
    for (const element of array.elements) {
      const current = unwrapExpression(element as ts.Expression);
      if (!ts.isObjectLiteralExpression(current)) continue;
      let routePath: string | undefined;
      let indexRoute = false;
      let children: ts.ArrayLiteralExpression | null = null;
      for (const property of current.properties) {
        if (!ts.isPropertyAssignment(property)) continue;
        const key = propertyNameText(property.name);
        if (key === 'path') routePath = resolveStaticRouteValue(property.initializer, values);
        if (key === 'index') indexRoute = property.initializer.kind === ts.SyntaxKind.TrueKeyword;
        if (key === 'children') children = resolveArray(property.initializer);
      }
      const fullPath =
        routePath !== undefined
          ? joinNestedRoute(parentPath, routePath)
          : indexRoute && parentPath
            ? parentPath
            : null;
      if (fullPath) {
        addRouteSignal(signals, {
          path: fullPath,
          file: routeImplementationFile(projectRoot, file, current),
          declarationFile: file,
          kind: 'react-router',
          confidence: 'high',
          taskable: true,
          evidence:
            indexRoute || routePath === ''
              ? 'React Router index declaration'
              : 'React Router object declaration',
        });
      }
      if (children) parseArray(children, fullPath || parentPath);
    }
  };

  const routerFactories = new Set([
    'createBrowserRouter',
    'createHashRouter',
    'createMemoryRouter',
    'useRoutes',
  ]);
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const expression = unwrapExpression(node.expression);
      const factory = ts.isIdentifier(expression) ? expression.text : null;
      if (factory && routerFactories.has(factory)) {
        const routes = resolveArray(node.arguments[0]);
        if (routes) parseArray(routes, null);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return signals;
}

function collectImportedComponentFiles(
  projectRoot: string,
  file: string,
  sourceFile: ts.SourceFile,
): Map<string, string> {
  const importedComponents = new Map<string, string>();
  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteralLike(statement.moduleSpecifier)) {
      const resolved = resolveLocalImportFile(projectRoot, file, statement.moduleSpecifier.text);
      if (!resolved || !statement.importClause) continue;
      if (statement.importClause.name) {
        importedComponents.set(statement.importClause.name.text, resolved);
      }
      const bindings = statement.importClause.namedBindings;
      if (bindings && ts.isNamedImports(bindings)) {
        for (const element of bindings.elements) {
          importedComponents.set(element.name.text, resolved);
        }
      }
    }
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
      const imported = dynamicImportFile(projectRoot, file, declaration.initializer);
      if (imported) importedComponents.set(declaration.name.text, imported);
    }
  }
  return importedComponents;
}

function collectVueComponentRegistry(
  projectRoot: string,
  parsedFiles: Array<{ file: string; sourceFile: ts.SourceFile }>,
): Map<string, string> {
  const registry = new Map<string, string>();
  for (const { file, sourceFile } of parsedFiles) {
    if (!isProductionAuthorityPath(file)) continue;
    const importedComponents = collectImportedComponentFiles(projectRoot, file, sourceFile);
    for (const statement of sourceFile.statements) {
      if (!ts.isVariableStatement(statement)) continue;
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
        const registryName = declaration.name.text;
        if (registryName !== 'views' && registryName !== 'layouts') continue;
        const initializer = unwrapExpression(declaration.initializer);
        if (!ts.isObjectLiteralExpression(initializer)) continue;
        for (const property of initializer.properties) {
          if (!ts.isPropertyAssignment(property)) continue;
          const key = propertyNameText(property.name);
          if (!key) continue;
          const value = unwrapExpression(property.initializer);
          const resolved =
            (ts.isIdentifier(value) ? importedComponents.get(value.text) : null) ??
            dynamicImportFile(projectRoot, file, property.initializer);
          if (!resolved) continue;
          registry.set(`${registryName}.${key}`, resolved);
          registry.set(`${registryName.slice(0, -1)}.${key}`, resolved);
        }
      }
    }
  }
  return registry;
}

function resolveVueRegistryComponent(value: string, registry: Map<string, string>): string | null {
  const references = value
    .split('$')
    .map((reference) => reference.trim())
    .filter(Boolean);
  for (const reference of [...references].reverse()) {
    const resolved = registry.get(reference);
    if (resolved) return resolved;
  }
  return null;
}

function collectVueRouterObjectRoutes(
  projectRoot: string,
  file: string,
  sourceFile: ts.SourceFile,
  values: Map<string, string>,
  componentRegistry: Map<string, string>,
): DiscoveryRouteSignal[] {
  const signals: DiscoveryRouteSignal[] = [];
  const arrays = new Map<string, ts.ArrayLiteralExpression>();
  const importedComponents = collectImportedComponentFiles(projectRoot, file, sourceFile);
  const parsedArrays = new Set<ts.ArrayLiteralExpression>();

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
      const initializer = unwrapExpression(declaration.initializer);
      if (ts.isArrayLiteralExpression(initializer)) arrays.set(declaration.name.text, initializer);
    }
  }

  const resolveArray = (
    expression: ts.Expression | undefined,
  ): ts.ArrayLiteralExpression | null => {
    if (!expression) return null;
    const current = unwrapExpression(expression);
    if (ts.isArrayLiteralExpression(current)) return current;
    return ts.isIdentifier(current) ? arrays.get(current.text) || null : null;
  };

  const componentFile = (routeObject: ts.ObjectLiteralExpression): string | null => {
    for (const property of routeObject.properties) {
      if (!ts.isPropertyAssignment(property) || propertyNameText(property.name) !== 'component') {
        continue;
      }
      const component = unwrapExpression(property.initializer);
      if (ts.isIdentifier(component)) return importedComponents.get(component.text) ?? null;
      if (ts.isStringLiteralLike(component)) {
        return resolveVueRegistryComponent(component.text, componentRegistry);
      }
      const dynamicFile = routeImplementationFile(projectRoot, file, routeObject);
      if (dynamicFile !== file) return dynamicFile;
      if (ts.isObjectLiteralExpression(component) || ts.isArrowFunction(component)) return file;
    }
    return null;
  };

  const parseArray = (array: ts.ArrayLiteralExpression, parentPath: string | null): void => {
    if (parsedArrays.has(array)) return;
    parsedArrays.add(array);
    for (const element of array.elements) {
      const current = unwrapExpression(element as ts.Expression);
      if (!ts.isObjectLiteralExpression(current)) continue;
      let routePath: string | undefined;
      let children: ts.ArrayLiteralExpression | null = null;
      for (const property of current.properties) {
        if (!ts.isPropertyAssignment(property)) continue;
        const key = propertyNameText(property.name);
        if (key === 'path') routePath = resolveStaticRouteValue(property.initializer, values);
        if (key === 'children') children = resolveArray(property.initializer);
      }
      const fullPath = routePath !== undefined ? joinNestedRoute(parentPath, routePath) : null;
      const implementation = componentFile(current);
      if (fullPath) {
        addRouteSignal(signals, {
          path: fullPath,
          file: implementation ?? file,
          declarationFile: file,
          kind: 'vue-router',
          confidence: implementation ? 'high' : 'medium',
          taskable: Boolean(implementation),
          evidence: implementation
            ? 'Vue Router object declaration with resolved component source'
            : 'Vue Router object declaration without a resolved component source',
        });
      }
      if (children) parseArray(children, fullPath || parentPath);
    }
  };

  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      if (node.expression.text === 'createRouter') {
        const options = node.arguments[0] ? unwrapExpression(node.arguments[0]) : null;
        if (options && ts.isObjectLiteralExpression(options)) {
          const routesProperty = options.properties.find(
            (property): property is ts.PropertyAssignment =>
              ts.isPropertyAssignment(property) && propertyNameText(property.name) === 'routes',
          );
          const routes = resolveArray(routesProperty?.initializer);
          if (routes) parseArray(routes, null);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  for (const array of arrays.values()) {
    const containsRouteObject = array.elements.some((element) => {
      const current = unwrapExpression(element as ts.Expression);
      return (
        ts.isObjectLiteralExpression(current) &&
        current.properties.some(
          (property) =>
            ts.isPropertyAssignment(property) && propertyNameText(property.name) === 'path',
        )
      );
    });
    if (containsRouteObject) parseArray(array, null);
  }
  return signals;
}

function detectSourceRouteSignals(
  projectRoot: string,
  identity: DiscoveryProjectIdentity,
): DiscoveryRouteSignal[] {
  const formalSignals: DiscoveryRouteSignal[] = [];
  const fallbackSignals: DiscoveryRouteSignal[] = [];
  const files = walkFiles(projectRoot, { extensions: SOURCE_EXTENSIONS });
  const parsedFiles = files.map((file) => {
    const content = readTextFile(join(projectRoot, file)) || '';
    return {
      content,
      file,
      sourceFile: ts.createSourceFile(
        file,
        content,
        ts.ScriptTarget.Latest,
        true,
        file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      ),
    };
  });
  const staticValues = collectStaticRouteValues(parsedFiles.map(({ sourceFile }) => sourceFile));
  const vueComponentRegistry =
    identity.framework === 'vue'
      ? collectVueComponentRegistry(projectRoot, parsedFiles)
      : new Map<string, string>();
  const hasTanstack = Boolean(
    identity.dependencies['@tanstack/react-router'] ||
      identity.dependencies['@tanstack/router-core'],
  );

  for (const { content, file, sourceFile } of parsedFiles) {
    if (!content) continue;
    if (EXCLUDED_SOURCE_FILE_RE.test(file) || !isProductionAuthorityPath(file)) continue;
    const isGeneratedFile = /(?:^|\/)[^/]*\.gen\.[cm]?[tj]sx?$/i.test(file);
    const isTanstackFile =
      content.includes('@tanstack/react-router') ||
      content.includes('createFileRoute') ||
      content.includes('createLazyFileRoute') ||
      content.includes('createRoute') ||
      (hasTanstack &&
        (/\brouteTree\b/.test(content) || /routeTree\.gen\.[cm]?[tj]sx?$/.test(file)));
    const isReactRouterFile =
      content.includes('react-router-dom') ||
      /from\s*["']react-router["']|require\(\s*["']react-router["']\s*\)/.test(content) ||
      content.includes('<Routes') ||
      content.includes('createBrowserRouter') ||
      content.includes('createHashRouter') ||
      content.includes('RouterProvider') ||
      content.includes('HashRouter') ||
      content.includes('BrowserRouter');
    const isVueRouterFile =
      content.includes('vue-router') ||
      content.includes('createRouter') ||
      content.includes('createWebHistory') ||
      content.includes('createWebHashHistory');
    const isVueRouteModule =
      identity.framework === 'vue' &&
      /(?:^|\/)(?:router|routes)(?:\/|$)/u.test(file) &&
      /\bpath\s*:/u.test(content);

    if (isTanstackFile && !isGeneratedFile) {
      collectRouteLiterals(TANSTACK_FILE_ROUTE_RE, content, file, formalSignals, 'tanstack-router');
      if (/\bcreateRoute\s*\(/.test(content)) {
        collectRouteLiterals(OBJECT_ROUTE_PATH_RE, content, file, formalSignals, 'tanstack-router');
      }
      if (/\bcreateRootRoute(?:WithContext)?\s*\(/.test(content)) {
        addRouteSignal(formalSignals, {
          path: '/',
          file,
          kind: 'tanstack-router',
          confidence: 'high',
          taskable: true,
          evidence: 'TanStack root route',
        });
      }
    }

    if (isReactRouterFile) {
      const objectRoutes = collectReactRouterObjectRoutes(
        projectRoot,
        file,
        sourceFile,
        staticValues,
      );
      formalSignals.push(...objectRoutes);
      collectRouteLiterals(JSX_ROUTE_PATH_RE, content, file, formalSignals, 'react-router');
      if (objectRoutes.length === 0) {
        collectRouteLiterals(
          OBJECT_ROUTE_PATH_RE,
          content,
          file,
          formalSignals,
          'react-router',
          false,
        );
      }
    }

    if (isVueRouterFile || isVueRouteModule) {
      const objectRoutes = collectVueRouterObjectRoutes(
        projectRoot,
        file,
        sourceFile,
        staticValues,
        vueComponentRegistry,
      );
      formalSignals.push(...objectRoutes);
      if (objectRoutes.length === 0) {
        collectRouteLiterals(
          OBJECT_ROUTE_PATH_RE,
          content,
          file,
          formalSignals,
          'vue-router',
          false,
        );
      }
    }

    collectPathnameBranchRoutes(content, file, fallbackSignals);

    const hasRouteSpecSignal =
      content.includes('@wasp.sh/spec') ||
      /\b(?:const|export\s+const)\s+\w*Spec\b/.test(content) ||
      /\bapp\s*\(\s*\{[\s\S]*\bspec\s*:/.test(content);
    if (hasRouteSpecSignal) {
      collectRouteLiterals(
        /\broute\s*\(\s*["'`][^"'`]*["'`]\s*,\s*["'`](\/[^"'`]*)["'`]\s*,\s*page\s*\(/g,
        content,
        file,
        formalSignals,
        'source-declared',
        false,
      );
    }
  }

  return formalSignals.length > 0 ? formalSignals : fallbackSignals;
}

function htmlRouteFromFile(file: string): string {
  let withoutExt = file.slice(0, -extname(file).length).replace(/\\/g, '/');
  if (withoutExt.endsWith('/index')) withoutExt = withoutExt.slice(0, -'/index'.length);
  if (
    withoutExt === 'index' ||
    withoutExt === 'docs' ||
    withoutExt === 'src' ||
    withoutExt === 'public' ||
    withoutExt === 'dist'
  ) {
    return '/';
  }
  return `/${withoutExt.split('/').filter(Boolean).join('/')}` || '/';
}

function scanStaticHtmlRouteSignals(projectRoot: string): DiscoveryRouteSignal[] {
  const signals: DiscoveryRouteSignal[] = [];
  for (const file of STATIC_HTML_ENTRY_FILES) {
    if (!existsSync(join(projectRoot, file))) continue;
    signals.push({
      path: '/',
      file,
      declarationFile: file,
      kind: 'html-route',
      confidence: 'high',
      taskable: true,
      evidence: 'static HTML entrypoint',
    });
    break;
  }
  for (const dir of STATIC_HTML_ROUTE_DIRS) {
    const fullDir = join(projectRoot, dir);
    if (!existsSync(fullDir)) continue;
    for (const file of walkFiles(fullDir, { extensions: new Set(['.html', '.htm']) })) {
      const rel = relative(projectRoot, join(fullDir, file)).replace(/\\/g, '/');
      signals.push({
        path: htmlRouteFromFile(rel),
        file: rel,
        kind: 'html-route',
        confidence: 'medium',
        taskable: true,
        evidence: 'nested static HTML route',
      });
    }
  }
  return signals;
}

function routeSignalRank(signal: DiscoveryRouteSignal): number {
  return (
    (signal.confidence === 'high' ? 20 : signal.confidence === 'medium' ? 10 : 0) +
    (signal.kind === 'pathname-branch' ? 0 : 20) +
    (signal.evidence.includes('index declaration') ? 5 : 0) -
    (signal.evidence === 'TanStack root route' ? 5 : 0)
  );
}

function discoverRoutes(
  projectRoot: string,
  identity: DiscoveryProjectIdentity,
  angularDiscovery: AngularApplicationDiscovery | null,
): DiscoveryRoutes {
  const fileRouteSignals: DiscoveryRouteSignal[] = [];
  const nextAppSignals = ['src/app', 'app'].flatMap((dir) =>
    scanFileRoutes(projectRoot, dir, PAGE_EXTENSIONS, new Set(['page'])),
  );
  const pagesSignals = ['src/pages', 'pages'].flatMap((dir) => scanFileRoutes(projectRoot, dir));
  if (identity.framework === 'nextjs') {
    fileRouteSignals.push(...nextAppSignals, ...pagesSignals);
  } else if (identity.framework === 'svelte') {
    fileRouteSignals.push(
      ...scanFileRoutes(
        projectRoot,
        'src/routes',
        new Set(['.svelte', '.ts', '.js']),
        new Set(['+page']),
      ),
    );
  } else if (identity.framework === 'nuxt') {
    fileRouteSignals.push(...scanFileRoutes(projectRoot, 'pages', new Set(['.vue'])));
    fileRouteSignals.push(...scanFileRoutes(projectRoot, 'app/pages', new Set(['.vue'])));
  } else if (identity.framework !== 'react') {
    fileRouteSignals.push(...pagesSignals);
  }

  const reactRouterFileSignals =
    identity.framework === 'react' ? scanReactRouterFileRoutes(projectRoot) : [];
  const solidStartSignals =
    identity.framework === 'solid' && identity.dependencies['@solidjs/start']
      ? scanSolidStartFileRoutes(projectRoot)
      : [];

  const sourceSignals =
    identity.framework === 'angular' ? [] : detectSourceRouteSignals(projectRoot, identity);
  const angularSignals: DiscoveryRouteSignal[] =
    angularDiscovery?.routes.signals.map((signal) => ({
      ...signal,
      declarationFile: signal.file,
      kind: 'angular-router' as const,
    })) ?? [];
  const htmlSignals = scanStaticHtmlRouteSignals(projectRoot);

  let selectedSignals: DiscoveryRouteSignal[] = [];
  let strategy: DiscoveryRouteStrategy = 'none';
  if (identity.framework === 'nextjs' && nextAppSignals.length > 0 && pagesSignals.length > 0) {
    selectedSignals = [...nextAppSignals, ...pagesSignals];
    strategy = 'mixed-next-router';
  } else if (identity.framework === 'nextjs' && nextAppSignals.length > 0) {
    selectedSignals = nextAppSignals;
    strategy = 'app-router';
  } else if (identity.framework === 'nextjs' && pagesSignals.length > 0) {
    selectedSignals = pagesSignals;
    strategy = 'pages-router';
  } else if (identity.framework === 'angular') {
    selectedSignals = angularSignals;
    strategy = 'angular-router';
  } else if (identity.framework === 'svelte' && fileRouteSignals.length > 0) {
    selectedSignals = fileRouteSignals;
    strategy = 'sveltekit-router';
  } else if (identity.framework === 'nuxt' && fileRouteSignals.length > 0) {
    selectedSignals = fileRouteSignals;
    strategy = 'nuxt-router';
  } else if (reactRouterFileSignals.length > 0) {
    selectedSignals = reactRouterFileSignals;
    strategy = 'react-router-file-router';
  } else if (solidStartSignals.length > 0) {
    selectedSignals = solidStartSignals;
    strategy = 'solidstart-router';
  } else if (sourceSignals.some((signal) => signal.kind === 'tanstack-router')) {
    selectedSignals = sourceSignals;
    strategy = 'source-declared';
  } else if (sourceSignals.length > 0) {
    selectedSignals = sourceSignals;
    strategy = identity.framework === 'vue' ? 'vue-router' : 'react-router';
  } else if (pagesSignals.length > 0) {
    selectedSignals = pagesSignals;
    strategy = 'pages-router';
  } else if (htmlSignals.length > 0) {
    selectedSignals = htmlSignals;
    strategy = 'static-html';
  }

  const taskable = new Map<string, DiscoveryRoute>();
  for (const signal of selectedSignals) {
    if (!signal.taskable) continue;
    const existing = taskable.get(signal.path);
    const signalRank = routeSignalRank(signal);
    const existingSignal = existing
      ? selectedSignals.find(
          (candidate) => candidate.path === existing.path && candidate.file === existing.file,
        )
      : null;
    const existingRank = existingSignal ? routeSignalRank(existingSignal) : -1;
    if (existing && signalRank <= existingRank) continue;
    taskable.set(signal.path, {
      path: signal.path,
      file: signal.file,
      hasLayout: false,
      confidence: signal.confidence,
      source: signal.kind,
    });
  }
  const routeSignals = selectedSignals.slice(0, MAX_REPORT_ROUTES);
  const taskableRoutes = [...taskable.values()];
  const fallbackOnly =
    selectedSignals.length > 0 &&
    selectedSignals.every((signal) => signal.kind === 'pathname-branch');
  const authorityAssessment = assessFrameworkRouteAuthority({
    projectRoot,
    framework: identity.framework,
    strategy,
    dependencies: identity.dependencies,
    signals: selectedSignals,
    angular: angularDiscovery?.routes ?? null,
  });
  const authority: AngularRouteAuthority = authorityAssessment.authority;
  const completeness: AngularRouteCompleteness = authorityAssessment.completeness;
  const confidence: DiscoveryConfidenceLevel =
    taskableRoutes.length === 0 || authority !== 'proven'
      ? 'low'
      : completeness === 'partial' || fallbackOnly
        ? 'medium'
        : 'high';
  const authorityFiles = authorityAssessment.authorityFiles.slice(0, 24);
  const evidence = authorityAssessment.evidence;
  return {
    strategy,
    routeSignals,
    taskableRoutes,
    routeSignalCount: selectedSignals.length,
    taskableRouteCount: taskableRoutes.length,
    confidence,
    authority,
    completeness,
    authorityFiles,
    excludedSourceCount: angularDiscovery?.routes.excludedSourceCount ?? 0,
    evidence,
    limitations: [
      ...(angularDiscovery?.routes.limitations ?? []),
      ...authorityAssessment.limitations,
      ...(taskableRoutes.length === 0
        ? ['No taskable route declarations were discovered from static source evidence.']
        : []),
      ...(fallbackOnly
        ? [
            'Routes were inferred from pathname/navigation branches because no formal route declaration was found.',
          ]
        : []),
      ...(selectedSignals.length > taskableRoutes.length
        ? ['Some duplicate or non-taskable route signals were collapsed before task context.']
        : []),
      ...(routeSignals.length < selectedSignals.length
        ? [
            `Route signal output was bounded to ${MAX_REPORT_ROUTES} entries; ${selectedSignals.length - routeSignals.length} additional authoritative signal(s) were omitted from the report.`,
          ]
        : []),
    ],
  };
}

function discoverComponents(
  projectRoot: string,
  routes: DiscoveryRoutes,
  identity: DiscoveryProjectIdentity,
  angularDiscovery: AngularApplicationDiscovery | null,
): DiscoveryComponents {
  const sourceFiles = walkFiles(projectRoot, { extensions: SOURCE_EXTENSIONS });
  const items = new Map<string, DiscoveryComponent>();
  const evidence: string[] = [...(angularDiscovery?.components.evidence ?? [])];
  for (const component of angularDiscovery?.components.items ?? []) {
    items.set(`${component.file}:${component.name}`, {
      ...component,
      kind: 'angular-component',
    });
  }
  for (const file of sourceFiles) {
    if (!/\.(tsx|jsx|vue|svelte)$/.test(file) && !/\.(ts|js)$/.test(file)) continue;
    if (EXCLUDED_SOURCE_FILE_RE.test(file) || !isProductionAuthorityPath(file)) continue;
    const content = readTextFile(join(projectRoot, file), 256 * 1024) ?? '';
    if (identity.framework === 'angular' && /@Component\s*\(/u.test(content)) continue;
    if (!/[<][A-Za-z][^>]*>/.test(content) && !/\.(vue|svelte)$/.test(file)) continue;
    const base = file.split('/').pop() ?? file;
    const nameFromFile = base.slice(0, -extname(base).length);
    const names = new Set<string>();
    const isRouteLocal = routes.taskableRoutes.some((route) => route.file === file);
    for (const match of content.matchAll(/\bexport\s+function\s+([A-Z][A-Za-z0-9_]*)\b/g))
      names.add(match[1] ?? '');
    for (const match of content.matchAll(
      /\bexport\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)?\b/g,
    ))
      names.add(match[1] || nameFromFile);
    for (const match of content.matchAll(
      /\bexport\s+const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*(?:memo|forwardRef|\()/g,
    ))
      names.add(match[1] ?? '');
    for (const name of discoverNamedScriptComponentExports(file, content, isRouteLocal)) {
      names.add(name);
    }
    if (isRouteLocal) {
      for (const match of content.matchAll(/\bfunction\s+([A-Z][A-Za-z0-9_]*)\b/g))
        names.add(match[1] ?? '');
      for (const match of content.matchAll(
        /\bconst\s+([A-Z][A-Za-z0-9_]*)\s*=\s*(?:memo|forwardRef|\()/g,
      ))
        names.add(match[1] ?? '');
    }
    if (/^[A-Z][A-Za-z0-9_-]*$/.test(nameFromFile) && /\.(tsx|jsx|vue|svelte)$/.test(file))
      names.add(nameFromFile);
    for (const name of [...names].filter(Boolean)) {
      const key = `${file}:${name}`;
      const kind: DiscoveryComponent['kind'] =
        /export\s+default\s+function/.test(content) && name === nameFromFile
          ? 'default-export'
          : /\b(?:memo|forwardRef)\b/.test(content)
            ? 'wrapper'
            : isRouteLocal &&
                !new RegExp(`\\bexport\\s+(?:default\\s+)?(?:function|const)\\s+${name}\\b`).test(
                  content,
                )
              ? 'route-local'
              : /^[A-Z]/.test(nameFromFile) && name === nameFromFile
                ? 'pascal-file'
                : 'exported';
      items.set(key, {
        name,
        file,
        kind,
        confidence: kind === 'pascal-file' ? 'medium' : 'high',
      });
    }
  }
  const allComponents = [...items.values()];
  const components = allComponents.slice(0, MAX_COMPONENT_ITEMS);
  const directories = [
    ...new Set(
      components
        .map((component) => component.file.split('/').slice(0, -1).join('/'))
        .filter(Boolean),
    ),
  ].slice(0, 24);
  if (directories.some((dir) => !/^src\/(?:components|ui)\b/.test(dir))) {
    evidence.push('feature-folder and route-local components were included');
  }
  if (components.some((component) => component.kind === 'wrapper')) {
    evidence.push('memo/forwardRef wrappers were included');
  }
  const confidence: DiscoveryConfidenceLevel =
    components.length >= 5 && evidence.length > 0
      ? 'high'
      : components.length > 0
        ? 'medium'
        : 'low';
  return {
    pageCount: routes.taskableRouteCount,
    componentCount: components.length,
    directories,
    items: components,
    confidence,
    evidence,
    limitations:
      confidence === 'low'
        ? [
            ...(angularDiscovery?.components.limitations ?? []),
            'Component inventory is partial because only weak static component signals were found.',
          ]
        : [
            ...(angularDiscovery?.components.limitations ?? []),
            'Component inventory is static and advisory, not proof that every reusable component was found.',
            ...(allComponents.length > components.length
              ? [
                  `Component inventory was bounded to ${MAX_COMPONENT_ITEMS} entries; ${allComponents.length - components.length} additional candidate(s) were omitted.`,
                ]
              : []),
          ],
  };
}

function discoverNamedScriptComponentExports(
  file: string,
  content: string,
  includeRouteLocal: boolean,
): string[] {
  if (!/\.[cm]?[jt]sx?$/u.test(file)) return [];
  const scriptKind = /\.tsx$/u.test(file)
    ? ts.ScriptKind.TSX
    : /\.jsx$/u.test(file)
      ? ts.ScriptKind.JSX
      : /\.[cm]?ts$/u.test(file)
        ? ts.ScriptKind.TS
        : ts.ScriptKind.JS;
  const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, scriptKind);
  const declarations = new Set<string>();
  const directlyExported = new Set<string>();
  const namedExports = new Map<string, Set<string>>();

  const rememberDeclaration = (name: string | undefined, exported: boolean): void => {
    if (!name || !/^[A-Z][A-Za-z0-9_]*$/u.test(name)) return;
    declarations.add(name);
    if (exported) directlyExported.add(name);
  };

  for (const statement of source.statements) {
    if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
      rememberDeclaration(statement.name?.text, hasExportModifier(statement));
      continue;
    }
    if (ts.isVariableStatement(statement)) {
      const exported = hasExportModifier(statement);
      for (const declaration of statement.declarationList.declarations) {
        if (
          !ts.isIdentifier(declaration.name) ||
          !isLikelyScriptComponentInitializer(declaration.initializer)
        ) {
          continue;
        }
        rememberDeclaration(declaration.name.text, exported);
      }
      continue;
    }
    if (
      ts.isExportDeclaration(statement) &&
      !statement.moduleSpecifier &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause)
    ) {
      for (const element of statement.exportClause.elements) {
        const local = element.propertyName?.text ?? element.name.text;
        const exported = element.name.text;
        if (!/^[A-Z][A-Za-z0-9_]*$/u.test(exported)) continue;
        const aliases = namedExports.get(local) ?? new Set<string>();
        aliases.add(exported);
        namedExports.set(local, aliases);
      }
      continue;
    }
    if (ts.isExportAssignment(statement) && ts.isIdentifier(statement.expression)) {
      directlyExported.add(statement.expression.text);
    }
  }

  const names = new Set<string>();
  for (const local of declarations) {
    if (!includeRouteLocal && !directlyExported.has(local) && !namedExports.has(local)) continue;
    names.add(local);
    for (const alias of namedExports.get(local) ?? []) names.add(alias);
  }
  return [...names];
}

function hasExportModifier(node: ts.Node): boolean {
  return Boolean(
    ts.canHaveModifiers(node) &&
      ts
        .getModifiers(node)
        ?.some(
          (modifier) =>
            modifier.kind === ts.SyntaxKind.ExportKeyword ||
            modifier.kind === ts.SyntaxKind.DefaultKeyword,
        ),
  );
}

function isLikelyScriptComponentInitializer(initializer: ts.Expression | undefined): boolean {
  if (!initializer) return false;
  const value = unwrapExpression(initializer);
  if (
    ts.isArrowFunction(value) ||
    ts.isFunctionExpression(value) ||
    ts.isTaggedTemplateExpression(value)
  ) {
    return true;
  }
  if (!ts.isCallExpression(value)) return false;
  const callee = value.expression.getText();
  return /(?:^|\.)(?:forwardRef|memo|styled|defineComponent)$/u.test(callee);
}

function extractCssEvidence(content: string): {
  variables: number;
  colors: number;
  dark: boolean;
  themeSignals: string[];
} {
  const variableMatches = [...content.matchAll(/--[\w-]+\s*:/g)];
  const colorMatches = [...content.matchAll(/#[0-9a-fA-F]{3,8}\b|rgb[a]?\(|hsl[a]?\(/g)];
  const themeSignals = new Set<string>();
  if (/\bdark\b|color-scheme:\s*dark|\[data-theme=['"]dark['"]|\.dark\b/.test(content))
    themeSignals.add('dark mode');
  if (/@theme\b/.test(content)) themeSignals.add('tailwind v4 @theme');
  if (/\[data-theme=|data-theme|theme-\w+/.test(content)) themeSignals.add('theme selector');
  if (/prefers-color-scheme/.test(content)) themeSignals.add('system color preference');
  return {
    variables: variableMatches.length,
    colors: colorMatches.length,
    dark: themeSignals.has('dark mode') || themeSignals.has('system color preference'),
    themeSignals: [...themeSignals],
  };
}

function discoverStyling(
  projectRoot: string,
  identity: DiscoveryProjectIdentity,
  angularProject: AngularProjectContext,
): DiscoveryStyling {
  const cssFiles = walkFiles(projectRoot, { extensions: STYLE_EXTENSIONS });
  const themeSignals = new Set<string>();
  const evidence: string[] = [];
  const limitations: string[] = [...angularProject.limitations];
  let cssVariableCount = 0;
  let colorTokenCount = 0;
  let darkMode = false;
  let configFile: string | null = null;
  let approach = 'unknown';
  const authorityFiles = new Set<string>();
  const tailwindConfig = [
    'tailwind.config.js',
    'tailwind.config.ts',
    'tailwind.config.mjs',
    'tailwind.config.cjs',
  ].find((file) => existsSync(join(projectRoot, file)));
  const unoConfig = ['uno.config.ts', 'uno.config.js', 'uno.config.mjs', 'uno.config.cjs'].find(
    (file) => existsSync(join(projectRoot, file)),
  );
  const tailwind = detectTailwindAuthority(projectRoot, cssFiles);
  for (const file of tailwind.files) authorityFiles.add(file);
  const hasPrimeNg = Boolean(
    identity.dependencies.primeng || identity.dependencies['@primeuix/themes'],
  );
  const hasPrimeVue = Boolean(
    identity.dependencies.primevue ||
      identity.dependencies['@primevue/themes'] ||
      (identity.framework === 'vue' && identity.dependencies.primeflex),
  );
  const hasNebular = Boolean(
    identity.dependencies['@nebular/theme'] || identity.dependencies['@nebular/auth'],
  );
  const hasAntDesignVue = Boolean(identity.dependencies['ant-design-vue']);
  const hasNaiveUi = Boolean(identity.dependencies['naive-ui']);
  const hasUnoCss = Boolean(identity.dependencies.unocss);
  const hasScss =
    angularProject.styleEntries.some((file) => /\.s[ac]ss$/iu.test(file)) ||
    cssFiles.some((file) => /\.s[ac]ss$/iu.test(file));
  const configuredStyleSet = new Set(angularProject.styleFiles);
  const orderedCssFiles = [
    ...angularProject.styleFiles,
    ...cssFiles.filter((file) => !configuredStyleSet.has(file)),
  ];
  const productionSourceFiles = walkFiles(projectRoot, { extensions: SOURCE_EXTENSIONS }).filter(
    isProductionAuthorityPath,
  );
  const sourceImportEvidence = (pattern: RegExp): { file: string; content: string } | null => {
    for (const file of productionSourceFiles.slice(0, 1000)) {
      const content = readTextFile(join(projectRoot, file), 256 * 1024) ?? '';
      pattern.lastIndex = 0;
      if (pattern.test(content)) return { file, content };
    }
    return null;
  };
  const productionStyleImport = (() => {
    const styleImportRe = /(?:from\s+|import\s*)["']([^"']+\.(?:css|s[ac]ss|less))["']/gu;
    for (const file of productionSourceFiles.slice(0, 1000)) {
      const content = readTextFile(join(projectRoot, file), 256 * 1024) ?? '';
      for (const match of content.matchAll(styleImportRe)) {
        const styleFile = resolveLocalImportFile(projectRoot, file, match[1]);
        if (styleFile && isProductionAuthorityPath(styleFile)) {
          return { sourceFile: file, styleFile };
        }
      }
    }
    return null;
  })();

  for (const file of orderedCssFiles.slice(0, 200)) {
    const content = readTextFile(join(projectRoot, file), 256 * 1024);
    if (!content) continue;
    const evidence = extractCssEvidence(content);
    cssVariableCount += evidence.variables;
    colorTokenCount += evidence.colors;
    darkMode ||= evidence.dark;
    for (const signal of evidence.themeSignals) themeSignals.add(signal);
  }

  if (angularProject.styleEntries.length > 0) {
    evidence.push(
      `Angular build target declares ${angularProject.styleEntries.length} global style entr${angularProject.styleEntries.length === 1 ? 'y' : 'ies'}`,
    );
    themeSignals.add('Angular global styles');
    for (const file of angularProject.styleFiles) authorityFiles.add(file);
    for (const file of angularProject.configurationFiles) authorityFiles.add(file);
  }
  if (hasPrimeNg) {
    evidence.push('PrimeNG dependency is present in the selected app');
    themeSignals.add('PrimeNG');
    const angularSources = walkFiles(projectRoot, { extensions: new Set(['.ts']) });
    if (
      angularSources.some((file) =>
        /\bprovidePrimeNG\s*\(|\bPrimeNGConfig\b/u.test(
          readTextFile(join(projectRoot, file), 256 * 1024) ?? '',
        ),
      )
    ) {
      evidence.push('PrimeNG runtime theme configuration found in production source');
      themeSignals.add('PrimeNG theme provider');
    }
  }
  const primeVueRuntime = hasPrimeVue
    ? sourceImportEvidence(
        /(?:from\s+|import\s*)["'](?:primevue|@primevue\/themes)(?:\/[^"']*)?["']/u,
      )
    : null;
  if (hasPrimeVue) {
    evidence.push('PrimeVue dependency is present in the selected app');
    if (primeVueRuntime) {
      evidence.push(`PrimeVue runtime configuration found in ${primeVueRuntime.file}`);
      themeSignals.add('PrimeVue runtime theme');
      authorityFiles.add(primeVueRuntime.file);
    }
  }
  if (hasNebular) {
    evidence.push('Nebular dependency is present in the selected app');
    themeSignals.add('Nebular');
  }
  const antDesignRuntime = hasAntDesignVue
    ? sourceImportEvidence(
        /(?:from\s+|import\s*)["'](?:ant-design-vue|@vben\/styles)(?:\/[^"']*)?["']/u,
      )
    : null;
  if (hasAntDesignVue) {
    evidence.push('Ant Design Vue dependency is present in the selected app');
    if (antDesignRuntime) {
      evidence.push(
        `Ant Design Vue or workspace style runtime import found in ${antDesignRuntime.file}`,
      );
      themeSignals.add('Ant Design Vue runtime theme');
      authorityFiles.add(antDesignRuntime.file);
    }
  }
  const naiveUiRuntime = hasNaiveUi
    ? sourceImportEvidence(/import\s*\{[^}]*\bNConfigProvider\b[^}]*\}\s*from\s*["']naive-ui["']/u)
    : null;
  if (hasNaiveUi) {
    evidence.push('Naive UI dependency is present in the selected app');
    if (naiveUiRuntime) {
      evidence.push(`Naive UI theme provider found in ${naiveUiRuntime.file}`);
      themeSignals.add('Naive UI runtime theme');
      authorityFiles.add(naiveUiRuntime.file);
    }
  }
  const unoRuntime = hasUnoCss
    ? sourceImportEvidence(/(?:from\s+|import\s*)["'](?:uno\.css|virtual:uno(?:\.css)?)["']/u)
    : null;
  if (hasUnoCss) {
    evidence.push('UnoCSS dependency is present in the selected app');
    if (unoConfig) {
      evidence.push(`UnoCSS configuration found in ${unoConfig}`);
      authorityFiles.add(unoConfig);
    }
    if (unoRuntime) {
      evidence.push(`UnoCSS runtime stylesheet import found in ${unoRuntime.file}`);
      themeSignals.add('UnoCSS runtime stylesheet');
      authorityFiles.add(unoRuntime.file);
    }
  }
  if (productionStyleImport) {
    evidence.push(
      `Production source ${productionStyleImport.sourceFile} imports ${productionStyleImport.styleFile}`,
    );
    themeSignals.add('production stylesheet import');
    authorityFiles.add(productionStyleImport.sourceFile);
    authorityFiles.add(productionStyleImport.styleFile);
  }
  evidence.push(...tailwind.evidence);
  if (identity.dependencies.tailwindcss && !tailwind.found) {
    limitations.push(
      'Tailwind is installed but no selected-app config, PostCSS plugin, or CSS directive proves it is active style authority.',
    );
  }

  if (identity.framework === 'angular' && hasPrimeNg) {
    approach = tailwind.found
      ? hasScss
        ? 'primeng-tailwind-scss'
        : 'primeng-tailwind'
      : hasScss
        ? 'primeng-scss'
        : 'primeng';
    configFile = angularProject.configurationFiles[0] ?? 'package.json';
  } else if (identity.framework === 'vue' && hasNaiveUi && naiveUiRuntime) {
    approach =
      hasUnoCss && (unoConfig || unoRuntime)
        ? hasScss
          ? 'naive-ui-unocss-scss'
          : 'naive-ui-unocss'
        : hasScss
          ? 'naive-ui-scss'
          : 'naive-ui';
    configFile = unoConfig ?? naiveUiRuntime.file;
  } else if (identity.framework === 'vue' && hasPrimeVue) {
    approach = tailwind.found
      ? hasScss
        ? 'primevue-tailwind-scss'
        : 'primevue-tailwind'
      : hasScss
        ? 'primevue-scss'
        : 'primevue';
    configFile = primeVueRuntime?.file ?? 'package.json';
  } else if (identity.framework === 'vue' && hasAntDesignVue && antDesignRuntime) {
    approach = identity.dependencies['@vben/styles']
      ? 'ant-design-vue-workspace-styles'
      : 'ant-design-vue';
    configFile = antDesignRuntime.file;
  } else if (identity.framework === 'angular' && hasNebular) {
    approach = tailwind.found
      ? hasScss
        ? 'nebular-tailwind-scss'
        : 'nebular-tailwind'
      : hasScss
        ? 'nebular-scss'
        : 'nebular';
    configFile = angularProject.configurationFiles[0] ?? 'package.json';
  } else if (hasUnoCss && (unoConfig || unoRuntime)) {
    approach = hasScss ? 'unocss-scss' : 'unocss';
    configFile = unoConfig ?? unoRuntime?.file ?? null;
  } else if (tailwindConfig || tailwind.found || themeSignals.has('tailwind v4 @theme')) {
    approach = 'tailwind';
    configFile =
      tailwindConfig ?? (themeSignals.has('tailwind v4 @theme') ? 'css @theme' : 'package.json');
  } else if (identity.dependencies['@decantr/css']) {
    approach = 'decantr-css';
    configFile = 'package.json';
  } else if (identity.dependencies.bootstrap) {
    approach = 'bootstrap';
    configFile = 'package.json';
  } else if (identity.dependencies['@mui/material']) {
    approach = 'mui';
    configFile = 'package.json';
  } else if (identity.dependencies['@chakra-ui/react']) {
    approach = 'chakra';
    configFile = 'package.json';
  } else if (cssFiles.some((file) => file.endsWith('.module.css'))) {
    approach = 'css-modules';
  } else if (hasScss) {
    approach = 'scss';
    configFile = angularProject.configurationFiles[0] ?? null;
  } else if (cssFiles.length > 0) {
    approach = 'css';
  }

  if (!configFile && productionStyleImport && ['css', 'css-modules', 'scss'].includes(approach)) {
    configFile = productionStyleImport.styleFile;
  }
  if (
    configFile &&
    existsSync(join(projectRoot, configFile)) &&
    (configFile !== 'package.json' || authorityFiles.size === 0)
  ) {
    authorityFiles.add(configFile);
  }

  const confidence: DiscoveryConfidenceLevel =
    approach === 'unknown'
      ? 'low'
      : angularProject.styleEntries.length > 0 || tailwind.found || themeSignals.size > 0
        ? 'high'
        : 'medium';
  return {
    approach,
    configFile,
    authorityFiles: [...authorityFiles]
      .filter((file) => existsSync(join(projectRoot, file)) && isProductionAuthorityPath(file))
      .sort()
      .slice(0, 16),
    cssVariableCount,
    colorTokenCount,
    darkMode,
    themeSignals: [...themeSignals],
    confidence,
    evidence: [...new Set(evidence)].sort(),
    limitations: [...new Set(limitations)].sort(),
  };
}

function findAssistantRules(appRoot: string, workspaceRoot: string): string[] {
  const rules: string[] = [];
  let current = resolve(appRoot);
  const stop = resolve(workspaceRoot);
  while (true) {
    for (const file of RULE_FILES) {
      const absolute = join(current, file);
      if (!existsSync(absolute)) continue;
      const discovered = relative(appRoot, absolute).replace(/\\/g, '/');
      if (!rules.includes(discovered)) rules.push(discovered);
    }
    if (current === stop) break;
    const parent = dirname(current);
    if (parent === current || !current.startsWith(`${stop}/`)) break;
    current = parent;
  }
  return rules;
}

function calculateConfidence(input: {
  project: DiscoveryProjectIdentity;
  routes: DiscoveryRoutes;
  components: DiscoveryComponents;
  styling: DiscoveryStyling;
  readiness: UIReadinessStatus;
}): ProjectDiscovery['confidence'] {
  let score = 20;
  const reasons: string[] = [];
  if (input.project.packageJsonPresent && input.project.packageJsonValid) {
    score += 15;
    reasons.push('package.json was readable');
  }
  if (input.project.framework !== 'unknown') {
    score += 25;
    reasons.push(`${input.project.framework} framework signal found`);
  }
  if (input.project.primaryLanguage === 'typescript') {
    score += 10;
    reasons.push('TypeScript source evidence found');
  }
  if (input.routes.taskableRouteCount > 0) {
    score += input.routes.confidence === 'high' ? 20 : 10;
    reasons.push(
      `${input.routes.taskableRouteCount} taskable route(s) found with ${input.routes.confidence} confidence, ${input.routes.authority} authority, and ${input.routes.completeness} completeness`,
    );
  }
  if (input.components.componentCount > 1) {
    score += 10;
    reasons.push(`${input.components.componentCount} component candidate(s) found`);
  }
  if (input.styling.approach !== 'unknown') {
    score += input.styling.confidence === 'high' ? 10 : 5;
    reasons.push(
      `${input.styling.approach} styling signal found with ${input.styling.confidence} confidence`,
    );
  }
  const confidenceCap =
    input.readiness === 'unsupported'
      ? 35
      : input.readiness === 'blocked'
        ? 44
        : input.readiness === 'limited'
          ? 74
          : 98;
  const clamped = Math.max(5, Math.min(confidenceCap, score));
  return {
    level: clamped >= 75 ? 'high' : clamped >= 45 ? 'medium' : 'low',
    score: clamped,
    reasons: reasons.length > 0 ? reasons : ['Only weak project signals were found.'],
  };
}

export function discoverProject(projectRoot: string): ProjectDiscovery {
  const appRoot = resolve(projectRoot);
  const workspaceRoot = findWorkspaceRoot(appRoot);
  const projectPath = relative(workspaceRoot, appRoot).replace(/\\/g, '/') || '.';
  const angularProject = discoverAngularProjectContext(appRoot, workspaceRoot);
  const project = detectProjectIdentity(appRoot, workspaceRoot, angularProject);
  const angularDiscovery =
    project.framework === 'angular'
      ? discoverAngularApplication(appRoot, workspaceRoot, angularProject)
      : null;
  const routes = discoverRoutes(appRoot, project, angularDiscovery);
  const components = discoverComponents(appRoot, routes, project, angularDiscovery);
  const styling = discoverStyling(appRoot, project, angularProject);
  const surfaces = buildUISurfaceDiscovery({
    projectRoot: appRoot,
    files: walkFiles(appRoot, { extensions: UI_SURFACE_EXTENSIONS }),
    project,
    routes,
    components,
    styling,
  });
  const assistant = { ruleFiles: findAssistantRules(appRoot, workspaceRoot) };
  const confidence = calculateConfidence({
    project,
    routes,
    components,
    styling,
    readiness: surfaces.status,
  });
  const limitations = [
    ...new Set([...routes.limitations, ...components.limitations, ...styling.limitations]),
  ];
  return {
    schemaVersion: 'discovery.v1',
    generatedAt: new Date().toISOString(),
    workspace: {
      workspaceRoot,
      appRoot,
      projectPath,
      scope: projectPath === '.' ? 'single-app' : 'workspace-app',
    },
    project,
    routes,
    components,
    styling,
    surfaces,
    assistant,
    confidence,
    limitations,
  };
}

export function evaluateDiscoveryReadiness(discovery: ProjectDiscovery): DiscoveryReadiness {
  const reasons: string[] = [];
  if (discovery.routes.taskableRouteCount === 0) {
    reasons.push('No taskable production route is proven.');
  }
  if (discovery.routes.authority !== 'proven') {
    reasons.push(`Route authority is ${discovery.routes.authority}, not proven.`);
  }
  if (discovery.routes.completeness !== 'complete') {
    reasons.push(
      `Route extraction completeness is ${discovery.routes.completeness}, not complete.`,
    );
  }
  const routeScopedContext =
    discovery.routes.taskableRouteCount > 0 &&
    discovery.routes.authority === 'proven' &&
    discovery.routes.completeness === 'complete'
      ? 'ready'
      : 'not_proven';
  const adoptionBaseline =
    routeScopedContext === 'ready' && discovery.routes.completeness === 'complete'
      ? 'ready'
      : 'not_proven';
  return {
    status: discovery.surfaces.status,
    axes: discovery.surfaces.axes,
    routeScopedContext,
    adoptionBaseline,
    reasons:
      reasons.length > 0
        ? reasons
        : ['Production route authority and complete static extraction are proven.'],
  };
}

export const discoveryInternalsForTest = {
  detectTailwindAuthority,
  findWorkspaceRoot,
  normalizeRouteLiteral,
};
