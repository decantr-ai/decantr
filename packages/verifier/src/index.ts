import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, isAbsolute, join, relative, resolve } from 'node:path';
import { evaluateGuard, isV3, validateEssence } from '@decantr/essence-spec';
import type { EssenceFile, EssenceV3, GuardViolation } from '@decantr/essence-spec';
import type { ReviewExecutionPack } from '@decantr/core';
import * as ts from 'typescript';
import { auditBuiltDist, emptyRuntimeAudit, type RuntimeAudit } from './runtime.js';

export { auditBuiltDist, emptyRuntimeAudit } from './runtime.js';
export type { BuiltDistAuditOptions, RuntimeAudit } from './runtime.js';

export const VERIFICATION_SCHEMA_URLS = {
  common: 'https://decantr.ai/schemas/verification-report.common.v1.json',
  projectAudit: 'https://decantr.ai/schemas/project-audit-report.v1.json',
  fileCritique: 'https://decantr.ai/schemas/file-critique-report.v1.json',
  showcaseShortlist: 'https://decantr.ai/schemas/showcase-shortlist-report.v1.json',
} as const;

export type VerificationSeverity = 'error' | 'warn' | 'info';

export interface VerificationFinding {
  id: string;
  category: string;
  severity: VerificationSeverity;
  message: string;
  evidence: string[];
  target?: string;
  file?: string;
  rule?: string;
  suggestedFix?: string;
}

export interface VerificationScore {
  category: string;
  focusArea: string;
  score: number;
  details: string;
  suggestions: string[];
}

interface PackManifestEntry {
  id: string;
  markdown: string;
  json: string;
}

export interface PackManifest {
  $schema?: string;
  version: string;
  generatedAt: string;
  scaffold: PackManifestEntry | null;
  review?: PackManifestEntry | null;
  sections: Array<PackManifestEntry & { pageIds: string[] }>;
  pages: Array<PackManifestEntry & { sectionId: string | null; sectionRole: string | null }>;
  mutations?: Array<PackManifestEntry & { mutationType: string }>;
}

export interface ProjectAuditReport {
  $schema: string;
  projectRoot: string;
  valid: boolean;
  essence: EssenceFile | null;
  reviewPack: ReviewExecutionPack | null;
  packManifest: PackManifest | null;
  runtimeAudit: RuntimeAudit;
  findings: VerificationFinding[];
  summary: {
    errorCount: number;
    warnCount: number;
    infoCount: number;
    essenceVersion: string | null;
    reviewPackPresent: boolean;
    packManifestPresent: boolean;
    runtimeAuditChecked: boolean;
    runtimePassed: boolean | null;
    pageCount: number;
  };
}

export interface FileCritiqueReport {
  $schema: string;
  file: string;
  overall: number;
  scores: VerificationScore[];
  findings: VerificationFinding[];
  focusAreas: string[];
  reviewPack: ReviewExecutionPack | null;
}

export interface CritiqueSourceInput {
  filePath: string;
  code: string;
  reviewPack?: ReviewExecutionPack | null;
  packManifest?: PackManifest | null;
  treatmentsCss?: string;
}

export interface ShowcaseShortlistVerificationEntry {
  slug: string;
  target: string | null;
  classification: 'pending' | 'A' | 'B' | 'C' | 'D';
  verificationStatus: 'pending' | 'build-green' | 'build-red' | 'smoke-green' | 'smoke-red';
  build: {
    passed: boolean | null;
    durationMs: number;
  };
  smoke: {
    passed: boolean | null;
    durationMs: number;
    rootDocumentOk: boolean;
    titleOk: boolean;
    langOk: boolean;
    viewportOk: boolean;
    charsetOk: boolean;
    cspSignalOk: boolean;
    inlineScriptCount: number;
    externalScriptsWithoutIntegrityCount: number;
    assetCount: number;
    assetsPassed: number;
    routeHintsChecked: string[];
    routeHintsMatched: number;
    routeHintsCoverageOk: boolean;
    routeDocumentsChecked: number;
    routeDocumentsPassed: number;
    routeDocumentsCoverageOk: boolean;
    fullRouteCoverageOk: boolean;
    totalAssetBytes: number;
    jsAssetBytes: number;
    cssAssetBytes: number;
    largestAssetPath: string | null;
    largestAssetBytes: number;
    failures: string[];
  };
  drift: {
    signal: 'lower' | 'moderate' | 'elevated';
    penalty: number;
    inlineStyleCount: number;
    hardcodedColorCount: number;
    utilityLeakageCount: number;
    decantrTreatmentCount: number;
    hasPackManifest: boolean;
    hasDist: boolean;
  };
}

export interface ShowcaseShortlistVerificationReport {
  $schema: string;
  generatedAt: string;
  dryRun: boolean;
  summary: {
    appCount: number;
    passedBuilds: number;
    failedBuilds: number;
    averageDurationMs: number;
    passedSmokes: number;
    failedSmokes: number;
    averageSmokeDurationMs: number;
    appsWithTitleOkCount: number;
    appsWithLangOkCount: number;
    appsWithViewportOkCount: number;
    appsWithCharsetOkCount: number;
    appsWithoutInlineScriptsCount: number;
    appsWithCspSignalCount: number;
    appsWithExternalScriptIntegrityCount: number;
    appsWithRouteCoverageCount: number;
    appsWithFullRouteCoverageCount: number;
    averageTotalAssetBytes: number;
    averageJsAssetBytes: number;
    averageCssAssetBytes: number;
    lowerDriftCount: number;
    moderateDriftCount: number;
    elevatedDriftCount: number;
    withPackManifestCount: number;
  };
  results: ShowcaseShortlistVerificationEntry[];
}

const DEFAULT_FOCUS_AREAS = [
  'route-topology',
  'theme-consistency',
  'treatment-usage',
  'accessibility',
  'responsive-design',
];

const TREATMENT_CLASSES = ['d-interactive', 'd-surface', 'd-data', 'd-control', 'd-section', 'd-annotation', 'd-label'];
const PERSONALITY_UTILS = ['neon-glow', 'neon-text-glow', 'neon-border-glow', 'mono-data', 'status-ring', 'entrance-fade'];
const PERFORMANCE_BUDGETS = {
  largestJsAssetWarnBytes: 350_000,
  totalJsWarnBytes: 700_000,
  totalCssWarnBytes: 150_000,
  totalAssetsWarnBytes: 1_500_000,
} as const;

function scoreRatio(numerator: number, denominator: number): number {
  if (denominator <= 0) return 3;
  return Math.min(5, Math.max(1, Math.round((numerator / denominator) * 5)));
}

function readJsonIfExists<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function loadReviewPack(projectRoot: string): ReviewExecutionPack | null {
  return readJsonIfExists<ReviewExecutionPack>(join(projectRoot, '.decantr', 'context', 'review-pack.json'));
}

function loadPackManifest(projectRoot: string): PackManifest | null {
  return readJsonIfExists<PackManifest>(join(projectRoot, '.decantr', 'context', 'pack-manifest.json'));
}

function readTextIfExists(path: string): string {
  try {
    return existsSync(path) ? readFileSync(path, 'utf-8') : '';
  } catch {
    return '';
  }
}

function createSourceAuditBucket(): SourceAuditBucket {
  return { count: 0, files: [] };
}

function recordSourceAudit(bucket: SourceAuditBucket, filePath: string, count: number): void {
  if (count <= 0) return;
  bucket.count += count;
  if (!bucket.files.includes(filePath) && bucket.files.length < 4) {
    bucket.files.push(filePath);
  }
}

function isAuditableSourceFile(filePath: string): boolean {
  if (/\.d\.ts$/i.test(filePath)) return false;
  return /\.(?:[cm]?[jt]sx?)$/i.test(filePath);
}

function collectProjectSourceFiles(projectRoot: string): string[] {
  const candidates = ['src', 'app', 'pages', 'components', 'lib', 'utils', 'hooks', 'providers', 'server']
    .map(dir => join(projectRoot, dir))
    .filter(dir => existsSync(dir));
  const rootFileCandidates = [
    'middleware.ts',
    'middleware.tsx',
    'middleware.js',
    'middleware.jsx',
    'middleware.mts',
    'middleware.cts',
    'proxy.ts',
    'proxy.tsx',
    'proxy.js',
    'proxy.jsx',
    'proxy.mts',
    'proxy.cts',
  ]
    .map(file => join(projectRoot, file))
    .filter(file => existsSync(file));
  const files = new Set<string>();
  const ignoredDirNames = new Set(['node_modules', '.git', '.decantr', 'dist', 'build', 'coverage']);

  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (ignoredDirNames.has(entry.name)) continue;
      const absolutePath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(absolutePath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!isAuditableSourceFile(absolutePath)) continue;
      files.add(absolutePath);
    }
  };

  for (const candidate of candidates) {
    walk(candidate);
  }

  for (const file of rootFileCandidates) {
    if (isAuditableSourceFile(file)) {
      files.add(file);
    }
  }

  return [...files].sort();
}

function buildSourceAuditEvidence(summary: SourceAuditSummary, bucket: SourceAuditBucket, label: string): string[] {
  return [
    `Source files checked: ${summary.filesChecked}`,
    `${label}: ${bucket.count}`,
    `Affected files: ${bucket.files.join(', ')}`,
  ];
}

function auditProjectSourceTree(projectRoot: string): SourceAuditSummary {
  const sourceFiles = collectProjectSourceFiles(projectRoot);
  const summary: SourceAuditSummary = {
    filesChecked: sourceFiles.length,
    inlineStyles: createSourceAuditBucket(),
    securityRiskPatterns: createSourceAuditBucket(),
    placeholderRoutes: createSourceAuditBucket(),
    authStorageWrites: createSourceAuditBucket(),
    authCookieWrites: createSourceAuditBucket(),
    authHeaderWrites: createSourceAuditBucket(),
    authGuardSignals: createSourceAuditBucket(),
    authExitSignals: createSourceAuditBucket(),
    accessibilityIssues: createSourceAuditBucket(),
    interactionSafetyIssues: createSourceAuditBucket(),
    authInputHintIssues: createSourceAuditBucket(),
  };

  for (const sourceFile of sourceFiles) {
    const relativePath = relative(projectRoot, sourceFile) || sourceFile;
    const code = readFileSync(sourceFile, 'utf-8');
    const signals = analyzeAstSignals(relativePath, code);
    const accessibilityIssueCount = signals.iconOnlyButtonWithoutLabelCount
      + signals.clickableNonSemanticCount
      + signals.imageWithoutAltCount
      + signals.formControlWithoutLabelCount;
    const securityRiskPatternCount = signals.dangerousHtmlCount
      + signals.rawHtmlInjectionCount
      + signals.dynamicEvalCount
      + signals.externalBlankLinkWithoutRelCount;
    const authInputHintIssueCount = signals.emailAutocompleteMissingCount
      + signals.passwordAutocompleteMissingCount;

    recordSourceAudit(summary.inlineStyles, relativePath, signals.inlineStyleAttributeCount);
    recordSourceAudit(summary.securityRiskPatterns, relativePath, securityRiskPatternCount);
    recordSourceAudit(summary.placeholderRoutes, relativePath, signals.placeholderNavigationTargetCount);
    recordSourceAudit(summary.authStorageWrites, relativePath, signals.authStorageWriteCount);
    recordSourceAudit(summary.authCookieWrites, relativePath, signals.authCookieWriteCount);
    recordSourceAudit(summary.authHeaderWrites, relativePath, signals.authHeaderWriteCount);
    recordSourceAudit(summary.authGuardSignals, relativePath, signals.authGuardSignalCount);
    recordSourceAudit(summary.authExitSignals, relativePath, signals.authExitSignalCount);
    recordSourceAudit(summary.accessibilityIssues, relativePath, accessibilityIssueCount);
    recordSourceAudit(summary.interactionSafetyIssues, relativePath, signals.buttonInFormWithoutTypeCount);
    recordSourceAudit(summary.authInputHintIssues, relativePath, authInputHintIssueCount);
  }

  return summary;
}

function buildRegistryContext(projectRoot: string): {
  themeRegistry: Map<string, { modes: string[] }>;
  patternRegistry: Map<string, unknown>;
} {
  const themeRegistry = new Map<string, { modes: string[] }>();
  const patternRegistry = new Map<string, unknown>();
  const cacheDir = join(projectRoot, '.decantr', 'cache');
  const customDir = join(projectRoot, '.decantr', 'custom');

  const cachedThemesDir = join(cacheDir, '@official', 'themes');
  try {
    if (existsSync(cachedThemesDir)) {
      for (const file of readdirSync(cachedThemesDir).filter(name => name.endsWith('.json') && name !== 'index.json')) {
        const data = JSON.parse(readFileSync(join(cachedThemesDir, file), 'utf-8')) as { id?: string; modes?: string[] };
        if (data.id && !themeRegistry.has(data.id)) {
          themeRegistry.set(data.id, { modes: data.modes || ['light', 'dark'] });
        }
      }
    }
  } catch { /* best effort */ }

  const customThemesDir = join(customDir, 'themes');
  try {
    if (existsSync(customThemesDir)) {
      for (const file of readdirSync(customThemesDir).filter(name => name.endsWith('.json'))) {
        const data = JSON.parse(readFileSync(join(customThemesDir, file), 'utf-8')) as { id?: string; modes?: string[] };
        if (data.id) {
          themeRegistry.set(`custom:${data.id}`, { modes: data.modes || ['light', 'dark'] });
        }
      }
    }
  } catch { /* best effort */ }

  const cachedPatternsDir = join(cacheDir, '@official', 'patterns');
  try {
    if (existsSync(cachedPatternsDir)) {
      for (const file of readdirSync(cachedPatternsDir).filter(name => name.endsWith('.json') && name !== 'index.json')) {
        const data = JSON.parse(readFileSync(join(cachedPatternsDir, file), 'utf-8')) as { id?: string };
        if (data.id && !patternRegistry.has(data.id)) {
          patternRegistry.set(data.id, data);
        }
      }
    }
  } catch { /* best effort */ }

  return { themeRegistry, patternRegistry };
}

function guardViolationToFinding(violation: GuardViolation): VerificationFinding {
  return {
    id: `guard-${violation.rule}`,
    category: violation.layer === 'dna' ? 'DNA Guard' : 'Blueprint Guard',
    severity: violation.severity === 'error' ? 'error' : 'warn',
    message: violation.message,
    evidence: [`Rule: ${violation.rule}`],
    rule: violation.rule,
    suggestedFix: violation.suggestion,
  };
}

function countPages(essence: EssenceFile | null): number {
  if (!essence) return 0;
  if (isV3(essence)) {
    const v3 = essence as EssenceV3;
    if (v3.blueprint.sections?.length) {
      return v3.blueprint.sections.reduce((sum, section) => sum + section.pages.length, 0);
    }
    return v3.blueprint.pages?.length ?? 0;
  }
  if ('structure' in essence && Array.isArray(essence.structure)) {
    return essence.structure.length;
  }
  return 0;
}

interface TopologySummary {
  hasAuthFeature: boolean;
  sectionRoles: string[];
  gatewayRouteCount: number;
  primaryRouteCount: number;
  hasAnonymousEntryRoute: boolean;
  gatewayRoutes: string[];
  primaryRoutes: string[];
}

interface SourceAuditBucket {
  count: number;
  files: string[];
}

interface SourceAuditSummary {
  filesChecked: number;
  inlineStyles: SourceAuditBucket;
  securityRiskPatterns: SourceAuditBucket;
  placeholderRoutes: SourceAuditBucket;
  authStorageWrites: SourceAuditBucket;
  authCookieWrites: SourceAuditBucket;
  authHeaderWrites: SourceAuditBucket;
  authGuardSignals: SourceAuditBucket;
  authExitSignals: SourceAuditBucket;
  accessibilityIssues: SourceAuditBucket;
  interactionSafetyIssues: SourceAuditBucket;
  authInputHintIssues: SourceAuditBucket;
}

function makeFinding(input: VerificationFinding): VerificationFinding {
  return input;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(2)} MB`;
  }
  if (bytes >= 1_000) {
    return `${Math.round(bytes / 1_000)} KB`;
  }
  return `${bytes} B`;
}

function normalizeRouteHint(route: string | null | undefined): string {
  if (!route || route === '/') return '/';
  const dynamicIndex = route.indexOf('/:');
  if (dynamicIndex !== -1) {
    return route.slice(0, dynamicIndex + 1);
  }
  return route;
}

function isAuthLikeRoute(route: string): boolean {
  return /(?:^|\/)(?:auth|login|log-in|signin|sign-in|signup|sign-up|register|forgot-password|reset-password|password-reset)(?:\/|$)/i.test(route);
}

function isProtectedLikeRoute(route: string): boolean {
  return /(?:^|\/)(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/|$)/i.test(route);
}

export function extractRouteHintsFromEssence(essence: EssenceFile | null): string[] {
  if (!essence) {
    return ['/'];
  }

  const routes = new Set<string>(['/']);

  if (isV3(essence)) {
    const v3 = essence as EssenceV3;

    for (const section of v3.blueprint.sections ?? []) {
      for (const page of section.pages ?? []) {
        if (typeof page.route === 'string' && page.route.length > 0) {
          routes.add(normalizeRouteHint(page.route));
        }
      }
    }

    for (const page of v3.blueprint.pages ?? []) {
      if (typeof page.route === 'string' && page.route.length > 0) {
        routes.add(normalizeRouteHint(page.route));
      }
    }

    if (v3.blueprint.routes && typeof v3.blueprint.routes === 'object') {
      for (const route of Object.keys(v3.blueprint.routes)) {
        routes.add(normalizeRouteHint(route));
      }
    }
  } else if ('structure' in essence && Array.isArray(essence.structure)) {
    for (const page of essence.structure) {
      if (page && typeof page === 'object' && 'route' in page && typeof page.route === 'string' && page.route.length > 0) {
        routes.add(normalizeRouteHint(page.route));
      }
    }
  }

  return [...routes].filter(Boolean).slice(0, 8);
}

function summarizeTopology(essence: EssenceFile | null, reviewPack: ReviewExecutionPack | null): TopologySummary {
  const features = new Set<string>(reviewPack?.data.features ?? []);
  const sectionRoles = new Set<string>();
  const gatewayRoutes = new Set<string>();
  const primaryRoutes = new Set<string>();
  let gatewayRouteCount = 0;
  let primaryRouteCount = 0;
  let hasAnonymousEntryRoute = false;

  if (essence && isV3(essence)) {
    const v3 = essence as EssenceV3;
    for (const feature of v3.blueprint.features ?? []) {
      if (typeof feature === 'string' && feature.length > 0) {
        features.add(feature);
      }
    }

    for (const section of v3.blueprint.sections ?? []) {
      const role = typeof section.role === 'string' && section.role.length > 0 ? section.role : 'unknown';
      sectionRoles.add(role);

      for (const page of section.pages ?? []) {
        if (typeof page.route !== 'string' || page.route.length === 0) continue;
        if (page.route === '/' && (role === 'public' || role === 'gateway')) {
          hasAnonymousEntryRoute = true;
        }
        if (role === 'gateway') {
          gatewayRouteCount += 1;
          gatewayRoutes.add(normalizeRouteHint(page.route));
        }
        if (role === 'primary') {
          primaryRouteCount += 1;
          primaryRoutes.add(normalizeRouteHint(page.route));
        }
      }
    }
  }

  return {
    hasAuthFeature: features.has('auth'),
    sectionRoles: [...sectionRoles],
    gatewayRouteCount,
    primaryRouteCount,
    hasAnonymousEntryRoute,
    gatewayRoutes: [...gatewayRoutes],
    primaryRoutes: [...primaryRoutes],
  };
}

function appendTopologyFindings(
  findings: VerificationFinding[],
  essence: EssenceFile | null,
  reviewPack: ReviewExecutionPack | null,
): void {
  const topology = summarizeTopology(essence, reviewPack);
  if (!topology.hasAuthFeature) return;
  const overlappingAuthRoutes = topology.gatewayRoutes.filter(route => topology.primaryRoutes.includes(route));

  if (!topology.sectionRoles.includes('gateway')) {
    findings.push(makeFinding({
      id: 'auth-gateway-section-missing',
      category: 'Route Topology',
      severity: 'warn',
      message: 'Authentication is declared, but the essence topology does not define a gateway section.',
      evidence: [
        'Expected a gateway section for login, registration, or recovery flows.',
        `Observed section roles: ${topology.sectionRoles.join(', ') || 'none'}`,
      ],
      suggestedFix: 'Add a gateway section for authentication flows so anonymous users have a clear entry path before protected routes.',
    }));
  }

  if (!topology.sectionRoles.includes('primary')) {
    findings.push(makeFinding({
      id: 'auth-primary-section-missing',
      category: 'Route Topology',
      severity: 'warn',
      message: 'Authentication is declared, but no primary app section was found in the compiled topology.',
      evidence: [
        `Observed section roles: ${topology.sectionRoles.join(', ') || 'none'}`,
      ],
      suggestedFix: 'Add a primary section so authenticated users have a clear post-auth destination.',
    }));
  }

  if (topology.sectionRoles.includes('gateway') && topology.gatewayRouteCount === 0) {
    findings.push(makeFinding({
      id: 'auth-gateway-routes-missing',
      category: 'Route Topology',
      severity: 'warn',
      message: 'A gateway section exists, but none of its pages declare explicit routes.',
      evidence: [
        'Gateway pages should expose routable login, registration, or recovery paths.',
      ],
      suggestedFix: 'Give gateway pages explicit routes such as `/login`, `/register`, or `/forgot-password`.',
    }));
  }

  if (topology.primaryRouteCount === 0) {
    findings.push(makeFinding({
      id: 'auth-primary-routes-missing',
      category: 'Route Topology',
      severity: 'warn',
      message: 'Authentication is declared, but no primary section pages expose explicit routes.',
      evidence: [
        'Protected app surfaces need explicit routes so post-auth entry points are unambiguous.',
      ],
      suggestedFix: 'Add explicit primary routes such as `/dashboard` or `/app` for the authenticated experience.',
    }));
  }

  if (
    topology.gatewayRoutes.length > 0
    && topology.gatewayRoutes.some(route => route !== '/' && isProtectedLikeRoute(route))
  ) {
    findings.push(makeFinding({
      id: 'auth-gateway-routes-look-protected',
      category: 'Route Topology',
      severity: 'warn',
      message: 'Gateway routes include paths that look like authenticated app destinations.',
      evidence: [
        `Gateway routes: ${topology.gatewayRoutes.join(', ')}`,
      ],
      suggestedFix: 'Keep gateway routes focused on anonymous entry flows such as `/`, `/login`, `/register`, or `/forgot-password`, and move protected destinations into the primary section.',
    }));
  }

  if (
    topology.gatewayRoutes.length > 0
    && topology.gatewayRoutes.every(route => route !== '/' && !isAuthLikeRoute(route))
  ) {
    findings.push(makeFinding({
      id: 'auth-gateway-routes-not-auth-like',
      category: 'Route Topology',
      severity: 'warn',
      message: 'Gateway routes do not appear to expose anonymous entry or authentication-focused destinations.',
      evidence: [
        `Gateway routes: ${topology.gatewayRoutes.join(', ')}`,
      ],
      suggestedFix: 'Use gateway routes like `/`, `/login`, `/register`, or `/forgot-password` so the anonymous/auth entry surface is explicit.',
    }));
  }

  if (
    topology.primaryRoutes.length > 0
    && topology.primaryRoutes.every(route => isAuthLikeRoute(route))
  ) {
    findings.push(makeFinding({
      id: 'auth-primary-routes-look-auth-only',
      category: 'Route Topology',
      severity: 'warn',
      message: 'Primary routes only expose auth-like destinations and do not appear to include a post-auth application surface.',
      evidence: [
        `Primary routes: ${topology.primaryRoutes.join(', ')}`,
      ],
      suggestedFix: 'Keep login and registration routes in the gateway section, and add at least one primary app route such as `/dashboard`, `/workspace`, or `/app`.',
    }));
  }

  if (
    topology.primaryRoutes.length > 0
    && topology.primaryRoutes.every(route => !isProtectedLikeRoute(route))
  ) {
    findings.push(makeFinding({
      id: 'auth-primary-routes-not-app-like',
      category: 'Route Topology',
      severity: 'warn',
      message: 'Primary routes do not appear to include a clear post-auth application destination.',
      evidence: [
        `Primary routes: ${topology.primaryRoutes.join(', ')}`,
      ],
      suggestedFix: 'Use at least one primary route like `/dashboard`, `/workspace`, `/settings`, or `/app` so the authenticated surface is explicit.',
    }));
  }

  if (overlappingAuthRoutes.length > 0) {
    findings.push(makeFinding({
      id: 'auth-gateway-primary-route-overlap',
      category: 'Route Topology',
      severity: 'warn',
      message: 'Gateway and primary sections expose overlapping routes, which blurs the anonymous-to-authenticated boundary.',
      evidence: [
        `Overlapping routes: ${overlappingAuthRoutes.join(', ')}`,
      ],
      suggestedFix: 'Keep gateway routes focused on anonymous entry flows and reserve primary routes for authenticated destinations so the route boundary stays explicit.',
    }));
  }

  if (!topology.hasAnonymousEntryRoute) {
    findings.push(makeFinding({
      id: 'auth-entry-route-missing',
      category: 'Route Topology',
      severity: 'warn',
      message: 'Authentication is declared, but no public or gateway section exposes `/` as an anonymous entry route.',
      evidence: [
        'Anonymous users should have a stable landing or auth entry route before protected navigation begins.',
      ],
      suggestedFix: 'Route `/` to a public landing page or gateway entry so the initial user journey is explicit.',
    }));
  }
}

async function runRuntimeAudit(projectRoot: string, essence: EssenceFile | null): Promise<RuntimeAudit> {
  return auditBuiltDist(projectRoot, {
    routeHints: extractRouteHintsFromEssence(essence),
  });
}

function appendRuntimeAuditFindings(findings: VerificationFinding[], runtimeAudit: RuntimeAudit, projectRoot: string): void {
  const distPath = join(projectRoot, 'dist');
  const indexPath = join(distPath, 'index.html');

  if (!runtimeAudit.distPresent) {
    findings.push(makeFinding({
      id: 'runtime-dist-missing',
      category: 'Runtime Verification',
      severity: 'info',
      message: 'No dist output was found, so runtime smoke verification was skipped.',
      evidence: [distPath],
      suggestedFix: 'Build the project before auditing if you want Decantr to verify root, asset, title, and route behavior.',
    }));
    return;
  }

  if (!runtimeAudit.indexPresent) {
    findings.push(makeFinding({
      id: 'runtime-index-missing',
      category: 'Runtime Verification',
      severity: 'warn',
      message: 'dist exists but index.html is missing, so runtime smoke verification could not run.',
      evidence: [indexPath],
      suggestedFix: 'Ensure the current build emits an index.html entry document.',
    }));
    return;
  }

  if (runtimeAudit.rootDocumentOk === false) {
    findings.push(makeFinding({
      id: 'runtime-root-document-invalid',
      category: 'Runtime Verification',
      severity: 'error',
      message: 'The built root document did not expose the expected application mount point.',
      evidence: [indexPath, 'Expected to find an element with id="root" in the served document.'],
      suggestedFix: 'Restore the framework mount element and confirm the built entry HTML matches the chosen runtime adapter.',
    }));
  }

  if (runtimeAudit.titleOk === false) {
    findings.push(makeFinding({
      id: 'runtime-title-missing',
      category: 'Runtime Verification',
      severity: 'warn',
      message: 'The built root document is missing a non-empty <title>.',
      evidence: [indexPath],
      suggestedFix: 'Emit a meaningful document title from the entry HTML or framework metadata layer.',
    }));
  }

  if (runtimeAudit.langOk === false) {
    findings.push(makeFinding({
      id: 'runtime-lang-missing',
      category: 'Runtime Verification',
      severity: 'warn',
      message: 'The built root document is missing an explicit `lang` attribute on `<html>`.',
      evidence: [indexPath],
      suggestedFix: 'Set `<html lang="en">` or the appropriate locale in the framework document shell so accessibility tooling and crawlers get the right language hint.',
    }));
  }

  if (runtimeAudit.viewportOk === false) {
    findings.push(makeFinding({
      id: 'runtime-viewport-missing',
      category: 'Runtime Verification',
      severity: 'warn',
      message: 'The built root document is missing a viewport meta tag.',
      evidence: [indexPath],
      suggestedFix: 'Emit `<meta name="viewport" content="width=device-width, initial-scale=1">` from the entry document or metadata layer.',
    }));
  }

  if (runtimeAudit.charsetOk === false) {
    findings.push(makeFinding({
      id: 'runtime-charset-missing',
      category: 'Document Hardening',
      severity: 'info',
      message: 'The built root document is missing an explicit charset declaration.',
      evidence: [indexPath],
      suggestedFix: 'Emit `<meta charset="utf-8">` from the entry document so encoding expectations stay explicit across hosts.',
    }));
  }

  if (runtimeAudit.inlineScriptCount > 0) {
    findings.push(makeFinding({
      id: 'runtime-inline-scripts-present',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'Inline `<script>` blocks were detected in the built root document.',
      evidence: [indexPath, `Inline script tags: ${runtimeAudit.inlineScriptCount}`],
      suggestedFix: 'Prefer bundled external assets and avoid inline scripts so CSP headers or nonces remain practical.',
    }));
  }

  if (runtimeAudit.externalScriptsWithoutIntegrityCount > 0) {
    findings.push(makeFinding({
      id: 'runtime-external-scripts-without-integrity',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'Remote script tags were detected without Subresource Integrity metadata.',
      evidence: [indexPath, `Remote scripts missing integrity: ${runtimeAudit.externalScriptsWithoutIntegrityCount}`],
      suggestedFix: 'Pin remote script tags with integrity/crossorigin metadata or serve the dependency through the trusted build pipeline.',
    }));
  }

  if (runtimeAudit.jsEvalSignalCount > 0) {
    findings.push(makeFinding({
      id: 'runtime-js-dynamic-code-signals',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'Built JavaScript includes dynamic code execution markers such as `eval` or `new Function`.',
      evidence: [distPath, `Dynamic code signals in built JS: ${runtimeAudit.jsEvalSignalCount}`],
      suggestedFix: 'Remove runtime code evaluation from shipped bundles and replace it with explicit data transforms or static dispatch logic.',
    }));
  }

  if (runtimeAudit.jsHtmlInjectionSignalCount > 0) {
    findings.push(makeFinding({
      id: 'runtime-js-html-injection-signals',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'Built JavaScript includes HTML-injection markers such as `innerHTML`, `insertAdjacentHTML`, or `document.write`.',
      evidence: [distPath, `HTML injection signals in built JS: ${runtimeAudit.jsHtmlInjectionSignalCount}`],
      suggestedFix: 'Prefer explicit DOM node creation or framework-safe rendering paths instead of writing raw HTML into the document at runtime.',
    }));
  }

  if (runtimeAudit.cspSignalOk === false) {
    findings.push(makeFinding({
      id: 'runtime-csp-signal-missing',
      category: 'Security Hygiene',
      severity: 'info',
      message: 'No document-level Content Security Policy signal was detected in the built root document.',
      evidence: [indexPath],
      suggestedFix: 'Prefer a CSP response header, or emit a CSP meta policy for static hosts that cannot add security headers.',
    }));
  }

  if (runtimeAudit.assetCount === 0) {
    findings.push(makeFinding({
      id: 'runtime-assets-missing',
      category: 'Runtime Verification',
      severity: 'warn',
      message: 'No built /assets references were detected in dist/index.html.',
      evidence: [indexPath],
      suggestedFix: 'Confirm the production build emitted JS/CSS assets and that index.html points at them.',
    }));
  } else if (runtimeAudit.assetsPassed < runtimeAudit.assetCount) {
    findings.push(makeFinding({
      id: 'runtime-assets-fetch-failed',
      category: 'Runtime Verification',
      severity: 'error',
      message: 'One or more built assets could not be fetched from the generated dist output.',
      evidence: [
        `${runtimeAudit.assetsPassed}/${runtimeAudit.assetCount} assets fetched successfully.`,
        ...runtimeAudit.failures.filter(failure => failure.startsWith('asset-fetch-failed:')),
      ],
      suggestedFix: 'Rebuild the project and verify the emitted asset paths and static hosting layout are correct.',
    }));
  }

  if (runtimeAudit.routeHintsChecked.length > 0 && runtimeAudit.routeHintsMatched < Math.min(2, runtimeAudit.routeHintsChecked.length)) {
    findings.push(makeFinding({
      id: 'runtime-route-hints-missing',
      category: 'Runtime Verification',
      severity: 'warn',
      message: 'Built JS did not clearly include the expected route hints from the compiled app contract.',
      evidence: [
        `Checked route hints: ${runtimeAudit.routeHintsChecked.join(', ')}`,
        `Matched ${runtimeAudit.routeHintsMatched}/${runtimeAudit.routeHintsChecked.length} route hints in built JS assets.`,
      ],
      suggestedFix: 'Verify that route generation still covers the pages declared in the essence and compiled packs.',
    }));
  } else if (runtimeAudit.routeHintsChecked.length > 0 && runtimeAudit.routeHintsMatched < runtimeAudit.routeHintsChecked.length) {
    findings.push(makeFinding({
      id: 'runtime-route-hints-partial',
      category: 'Runtime Verification',
      severity: 'info',
      message: 'Built JS only reflected part of the expected route contract from the compiled app context.',
      evidence: [
        `Checked route hints: ${runtimeAudit.routeHintsChecked.join(', ')}`,
        `Matched ${runtimeAudit.routeHintsMatched}/${runtimeAudit.routeHintsChecked.length} route hints in built JS assets.`,
      ],
      suggestedFix: 'Verify route generation for the missing pages and confirm code-split bundles still preserve the expected route contract.',
    }));
  }

  if (runtimeAudit.routeDocumentsChecked > 0 && runtimeAudit.routeDocumentsPassed < Math.min(2, runtimeAudit.routeDocumentsChecked)) {
    findings.push(makeFinding({
      id: 'runtime-route-documents-missing',
      category: 'Runtime Verification',
      severity: 'warn',
      message: 'One or more expected routes did not return a valid root document from the built output.',
      evidence: [
        `Passed ${runtimeAudit.routeDocumentsPassed}/${runtimeAudit.routeDocumentsChecked} route document checks.`,
        ...runtimeAudit.failures.filter(failure => failure.startsWith('route-document-failed:')),
      ],
      suggestedFix: 'Verify route fallbacks and build output so every declared route resolves to a usable root document.',
    }));
  } else if (runtimeAudit.routeDocumentsChecked > 0 && runtimeAudit.routeDocumentsPassed < runtimeAudit.routeDocumentsChecked) {
    findings.push(makeFinding({
      id: 'runtime-route-documents-partial',
      category: 'Runtime Verification',
      severity: 'warn',
      message: 'Some expected routes resolved to a root document, but at least one still failed runtime verification.',
      evidence: [
        `Passed ${runtimeAudit.routeDocumentsPassed}/${runtimeAudit.routeDocumentsChecked} route document checks.`,
        ...runtimeAudit.failures.filter(failure => failure.startsWith('route-document-failed:')),
      ],
      suggestedFix: 'Fix the failing route outputs so every declared destination resolves to the same usable root document contract.',
    }));
  }

  const largestIsJs = typeof runtimeAudit.largestAssetPath === 'string' && runtimeAudit.largestAssetPath.endsWith('.js');
  if (
    (largestIsJs && runtimeAudit.largestAssetBytes > PERFORMANCE_BUDGETS.largestJsAssetWarnBytes)
    || runtimeAudit.jsAssetBytes > PERFORMANCE_BUDGETS.totalJsWarnBytes
  ) {
    findings.push(makeFinding({
      id: 'runtime-js-bundle-large',
      category: 'Performance Budget',
      severity: 'warn',
      message: 'The built JavaScript output is larger than the current Decantr performance budget.',
      evidence: [
        `Total JS: ${formatBytes(runtimeAudit.jsAssetBytes)}`,
        `Largest asset: ${runtimeAudit.largestAssetPath ?? 'n/a'} (${formatBytes(runtimeAudit.largestAssetBytes)})`,
      ],
      suggestedFix: 'Split large route bundles, remove unnecessary client-only code, and prefer lighter patterns or deferred data surfaces.',
    }));
  }

  if (runtimeAudit.cssAssetBytes > PERFORMANCE_BUDGETS.totalCssWarnBytes) {
    findings.push(makeFinding({
      id: 'runtime-css-bundle-large',
      category: 'Performance Budget',
      severity: 'warn',
      message: 'The built CSS output is larger than the current Decantr performance budget.',
      evidence: [
        `Total CSS: ${formatBytes(runtimeAudit.cssAssetBytes)}`,
        `Total assets: ${formatBytes(runtimeAudit.totalAssetBytes)}`,
      ],
      suggestedFix: 'Trim unused treatment layers, reduce generated CSS duplication, and prefer scoped styles over broad utility carryover.',
    }));
  }

  if (runtimeAudit.totalAssetBytes > PERFORMANCE_BUDGETS.totalAssetsWarnBytes) {
    findings.push(makeFinding({
      id: 'runtime-total-assets-large',
      category: 'Performance Budget',
      severity: 'warn',
      message: 'The built asset payload is larger than the current Decantr total asset budget.',
      evidence: [
        `Total assets: ${formatBytes(runtimeAudit.totalAssetBytes)}`,
        `JS: ${formatBytes(runtimeAudit.jsAssetBytes)}`,
        `CSS: ${formatBytes(runtimeAudit.cssAssetBytes)}`,
      ],
      suggestedFix: 'Reduce shipped assets, split infrequently used routes, and keep the showcase/app shell focused on essential interactive surfaces.',
    }));
  }
}

function appendSourceAuditFindings(
  findings: VerificationFinding[],
  sourceAudit: SourceAuditSummary,
  essence: EssenceFile | null,
  reviewPack: ReviewExecutionPack | null,
): void {
  if (sourceAudit.filesChecked === 0) {
    return;
  }

  if (sourceAudit.inlineStyles.count > 0) {
    findings.push(makeFinding({
      id: 'source-inline-styles-present',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Source files still contain inline style attributes, which undermines the compiled treatment contract.',
      evidence: buildSourceAuditEvidence(sourceAudit, sourceAudit.inlineStyles, 'Inline style attributes'),
      suggestedFix: 'Move inline styling into treatments, atoms, or design-token-backed classes so generation stays aligned with the Decantr contract.',
    }));
  }

  if (sourceAudit.securityRiskPatterns.count > 0) {
    findings.push(makeFinding({
      id: 'source-security-risk-patterns-present',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Source files include security-risk rendering or link patterns before the project is even built.',
      evidence: buildSourceAuditEvidence(sourceAudit, sourceAudit.securityRiskPatterns, 'Security-risk source patterns'),
      suggestedFix: 'Remove dangerous HTML writes, dynamic code execution, and unsafe external link patterns from source before shipping.',
    }));
  }

  if (sourceAudit.placeholderRoutes.count > 0) {
    findings.push(makeFinding({
      id: 'source-placeholder-route-targets-present',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Source files still include placeholder navigation targets instead of real app routes.',
      evidence: buildSourceAuditEvidence(sourceAudit, sourceAudit.placeholderRoutes, 'Placeholder route targets'),
      suggestedFix: 'Replace placeholder href/to values with the actual routes declared in the compiled packs and essence.',
    }));
  }

  if (sourceAudit.authStorageWrites.count > 0) {
    findings.push(makeFinding({
      id: 'source-auth-storage-writes-present',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Source files write auth-like credentials into browser storage.',
      evidence: buildSourceAuditEvidence(sourceAudit, sourceAudit.authStorageWrites, 'Auth storage writes'),
      suggestedFix: 'Avoid storing auth tokens in localStorage/sessionStorage and prefer secure server-managed session boundaries.',
    }));
  }

  if (sourceAudit.authCookieWrites.count > 0) {
    findings.push(makeFinding({
      id: 'source-auth-cookie-writes-present',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Source files write auth-like credentials into client-managed cookies.',
      evidence: buildSourceAuditEvidence(sourceAudit, sourceAudit.authCookieWrites, 'Auth cookie writes'),
      suggestedFix: 'Avoid setting auth cookies from client-side JavaScript; prefer secure server-issued HttpOnly session cookies or other server-managed boundaries.',
    }));
  }

  if (sourceAudit.authHeaderWrites.count > 0) {
    findings.push(makeFinding({
      id: 'source-auth-header-writes-present',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Source files construct auth-like authorization headers in client-side code.',
      evidence: buildSourceAuditEvidence(sourceAudit, sourceAudit.authHeaderWrites, 'Auth header writes'),
      suggestedFix: 'Avoid building bearer/session auth headers in client-rendered code; prefer server-managed session boundaries or a deliberate reviewed client-auth strategy.',
    }));
  }

  const topology = summarizeTopology(essence, reviewPack);
  if (topology.hasAuthFeature && sourceAudit.authGuardSignals.count === 0) {
    findings.push(makeFinding({
      id: 'source-auth-guard-signals-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Authentication is declared, but the source tree does not show clear auth-guard or redirect behavior.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        'Auth guard signals: 0',
        `Gateway routes: ${topology.gatewayRoutes.join(', ') || 'none'}`,
        `Primary routes: ${topology.primaryRoutes.join(', ') || 'none'}`,
      ],
      suggestedFix: 'Add explicit protected-route wrappers, middleware, session checks, or redirects to login/register before authenticated surfaces render.',
    }));
  }

  if (topology.hasAuthFeature && sourceAudit.authExitSignals.count === 0) {
    findings.push(makeFinding({
      id: 'source-auth-exit-signals-missing',
      category: 'Source Audit',
      severity: 'info',
      message: 'Authentication is declared, but the source tree does not show an obvious sign-out or session-exit path.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        'Auth exit signals: 0',
        `Gateway routes: ${topology.gatewayRoutes.join(', ') || 'none'}`,
        `Primary routes: ${topology.primaryRoutes.join(', ') || 'none'}`,
      ],
      suggestedFix: 'Expose an explicit sign-out/logout flow so authenticated users can intentionally end their session.',
    }));
  }

  if (sourceAudit.accessibilityIssues.count > 0) {
    findings.push(makeFinding({
      id: 'source-accessibility-issues-present',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Source files contain unlabeled or non-semantic interactive patterns that should be fixed before runtime verification.',
      evidence: buildSourceAuditEvidence(sourceAudit, sourceAudit.accessibilityIssues, 'Accessibility labeling issues'),
      suggestedFix: 'Add explicit labels, semantic interactive elements, and missing alt text so accessibility issues do not accumulate across generated screens.',
    }));
  }

  if (sourceAudit.interactionSafetyIssues.count > 0) {
    findings.push(makeFinding({
      id: 'source-interaction-safety-issues-present',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Source files contain interaction patterns that can trigger accidental submissions or unsafe form behavior.',
      evidence: buildSourceAuditEvidence(sourceAudit, sourceAudit.interactionSafetyIssues, 'Interaction safety issues'),
      suggestedFix: 'Give form buttons explicit types so interactive controls do exactly what the compiled task contract intends.',
    }));
  }

  if (sourceAudit.authInputHintIssues.count > 0) {
    findings.push(makeFinding({
      id: 'source-auth-input-hints-missing',
      category: 'Source Audit',
      severity: 'info',
      message: 'Source auth flows are missing explicit autocomplete hints on credential inputs.',
      evidence: buildSourceAuditEvidence(sourceAudit, sourceAudit.authInputHintIssues, 'Missing auth autocomplete hints'),
      suggestedFix: 'Add explicit autocomplete values such as `email`, `username`, `current-password`, or `new-password` before auth flows ship.',
    }));
  }
}

export async function auditProject(projectRoot: string): Promise<ProjectAuditReport> {
  const essencePath = join(projectRoot, 'decantr.essence.json');
  const findings: VerificationFinding[] = [];
  const reviewPack = loadReviewPack(projectRoot);
  const packManifest = loadPackManifest(projectRoot);
  const runtimeAudit = emptyRuntimeAudit();

  if (!existsSync(essencePath)) {
    findings.push(makeFinding({
      id: 'essence-missing',
      category: 'Project Contract',
      severity: 'error',
      message: 'No decantr.essence.json file was found.',
      evidence: [essencePath],
      suggestedFix: 'Run `decantr init` or scaffold the project again so the essence exists.',
    }));

    return {
      $schema: VERIFICATION_SCHEMA_URLS.projectAudit,
      projectRoot,
      valid: false,
      essence: null,
      reviewPack,
      packManifest,
      runtimeAudit,
      findings,
      summary: {
        errorCount: 1,
        warnCount: 0,
        infoCount: 0,
        essenceVersion: null,
        reviewPackPresent: Boolean(reviewPack),
        packManifestPresent: Boolean(packManifest),
        runtimeAuditChecked: false,
        runtimePassed: null,
        pageCount: 0,
      },
    };
  }

  let essence: EssenceFile | null = null;
  try {
    essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as EssenceFile;
  } catch (error) {
    findings.push(makeFinding({
      id: 'essence-parse-error',
      category: 'Project Contract',
      severity: 'error',
      message: `Failed to parse decantr.essence.json: ${(error as Error).message}`,
      evidence: [essencePath],
      suggestedFix: 'Repair the essence JSON before auditing the project.',
    }));
  }

  if (essence) {
    const validation = validateEssence(essence);
    if (!validation.valid) {
      for (const issue of validation.errors) {
        findings.push(makeFinding({
          id: 'essence-validation',
          category: 'Schema Validation',
          severity: 'error',
          message: issue,
          evidence: [essencePath],
          suggestedFix: 'Resolve the schema violation and rerun `decantr validate`.',
        }));
      }
    }

    const { themeRegistry, patternRegistry } = buildRegistryContext(projectRoot);
    for (const violation of evaluateGuard(essence, { themeRegistry, patternRegistry })) {
      findings.push(guardViolationToFinding(violation));
    }
  }

  appendTopologyFindings(findings, essence, reviewPack);

  if (!packManifest) {
    findings.push(makeFinding({
      id: 'pack-manifest-missing',
      category: 'Execution Packs',
      severity: 'warn',
      message: 'Compiled execution pack manifest is missing.',
      evidence: [join(projectRoot, '.decantr', 'context', 'pack-manifest.json')],
      suggestedFix: 'Run `decantr refresh` to regenerate scaffold, review, mutation, section, and page packs.',
    }));
  } else {
    if (!packManifest.scaffold) {
      findings.push(makeFinding({
        id: 'scaffold-pack-missing',
        category: 'Execution Packs',
        severity: 'warn',
        message: 'Compiled scaffold pack is missing from the manifest.',
        evidence: ['pack-manifest.json'],
        suggestedFix: 'Regenerate the context bundle with `decantr refresh`.',
      }));
    }
    if (!packManifest.review) {
      findings.push(makeFinding({
        id: 'review-pack-missing',
        category: 'Execution Packs',
        severity: 'warn',
        message: 'Compiled review pack is missing from the manifest.',
        evidence: ['pack-manifest.json'],
        suggestedFix: 'Regenerate the context bundle so critique tasks have a compiled review contract.',
      }));
    }
    if ((packManifest.mutations ?? []).length === 0) {
      findings.push(makeFinding({
        id: 'mutation-packs-missing',
        category: 'Execution Packs',
        severity: 'info',
        message: 'No mutation packs were found in the manifest.',
        evidence: ['pack-manifest.json'],
        suggestedFix: 'Run `decantr refresh` to regenerate mutation task packs.',
      }));
    }
  }

  if (!reviewPack) {
    findings.push(makeFinding({
      id: 'review-pack-file-missing',
      category: 'Review Contract',
      severity: 'warn',
      message: 'The compiled review pack file is missing.',
      evidence: [join(projectRoot, '.decantr', 'context', 'review-pack.json')],
      suggestedFix: 'Regenerate context so critique consumers can anchor findings to the compiled review contract.',
    }));
  }

  const checkedRuntimeAudit = await runRuntimeAudit(projectRoot, essence);
  appendRuntimeAuditFindings(findings, checkedRuntimeAudit, projectRoot);
  appendSourceAuditFindings(findings, auditProjectSourceTree(projectRoot), essence, reviewPack);

  const summary = {
    errorCount: findings.filter(finding => finding.severity === 'error').length,
    warnCount: findings.filter(finding => finding.severity === 'warn').length,
    infoCount: findings.filter(finding => finding.severity === 'info').length,
    essenceVersion: essence ? String(essence.version) : null,
    reviewPackPresent: Boolean(reviewPack),
    packManifestPresent: Boolean(packManifest),
    runtimeAuditChecked: checkedRuntimeAudit.checked,
    runtimePassed: checkedRuntimeAudit.passed,
    pageCount: countPages(essence),
  };

  return {
    $schema: VERIFICATION_SCHEMA_URLS.projectAudit,
    projectRoot,
    valid: summary.errorCount === 0,
    essence,
    reviewPack,
    packManifest,
    runtimeAudit: checkedRuntimeAudit,
    findings,
    summary,
  };
}

function buildDecoratorInventory(treatmentsCss: string): string[] {
  const decoratorMatches = treatmentsCss.match(/\.([\w-]+)\s*\{/g) || [];
  return decoratorMatches
    .map(match => match.slice(1).replace(/\s*\{$/, ''))
    .filter(name => !name.startsWith('d-') && !PERSONALITY_UTILS.includes(name));
}

function resolveFocusAreas(reviewPack: ReviewExecutionPack | null): string[] {
  return reviewPack?.data.focusAreas?.length ? reviewPack.data.focusAreas : DEFAULT_FOCUS_AREAS;
}

function resolveSeverityFromChecks(
  reviewPack: ReviewExecutionPack | null,
  fallback: VerificationSeverity,
  checkIds: string[],
): VerificationSeverity {
  const match = reviewPack?.successChecks.find(check => checkIds.includes(check.id));
  return match?.severity ?? fallback;
}

function findHardcodedColors(code: string): string[] {
  const matches = code.match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g) ?? [];
  return [...new Set(matches)];
}

function findUtilityFrameworkSignals(code: string): string[] {
  const matches = code.match(/\b(?:bg|text|border|shadow|rounded|px|py|mx|my|gap|grid-cols|col-span|row-span|sm|md|lg|xl|hover):[-\w/.[\]]+/g) ?? [];
  return [...new Set(matches)];
}

interface AstCritiqueSignals {
  inlineStyleAttributeCount: number;
  dangerousHtmlCount: number;
  rawHtmlInjectionCount: number;
  dynamicEvalCount: number;
  iconOnlyButtonWithoutLabelCount: number;
  clickableNonSemanticCount: number;
  imageWithoutAltCount: number;
  externalBlankLinkWithoutRelCount: number;
  formControlWithoutLabelCount: number;
  placeholderNavigationTargetCount: number;
  emailAutocompleteMissingCount: number;
  passwordAutocompleteMissingCount: number;
  buttonInFormWithoutTypeCount: number;
  authStorageWriteCount: number;
  authCookieWriteCount: number;
  authHeaderWriteCount: number;
  authGuardSignalCount: number;
  authExitSignalCount: number;
}

function getScriptKind(filePath: string): ts.ScriptKind {
  switch (extname(filePath).toLowerCase()) {
    case '.tsx':
      return ts.ScriptKind.TSX;
    case '.jsx':
      return ts.ScriptKind.JSX;
    case '.ts':
      return ts.ScriptKind.TS;
    case '.js':
      return ts.ScriptKind.JS;
    default:
      return ts.ScriptKind.TSX;
  }
}

function isPropertyNamed(node: ts.Node | undefined, ...names: string[]): boolean {
  if (!node) return false;
  if (ts.isIdentifier(node)) {
    return names.includes(node.text);
  }
  if (ts.isPrivateIdentifier(node)) {
    return names.includes(node.text);
  }
  if (ts.isStringLiteral(node)) {
    return names.includes(node.text);
  }
  return false;
}

function getJsxAttribute(
  attributes: ts.JsxAttributes,
  ...names: string[]
): ts.JsxAttribute | undefined {
  return attributes.properties.find((property): property is ts.JsxAttribute =>
    ts.isJsxAttribute(property) && isPropertyNamed(property.name, ...names)
  );
}

function getJsxTagName(node: ts.JsxOpeningLikeElement): string | null {
  if (ts.isIdentifier(node.tagName)) {
    return node.tagName.text;
  }
  if (ts.isPropertyAccessExpression(node.tagName)) {
    return node.tagName.name.text;
  }
  return null;
}

function getJsxAttributeLiteralValue(attribute: ts.JsxAttribute | undefined): string | null {
  if (!attribute?.initializer) return null;
  if (ts.isStringLiteral(attribute.initializer)) {
    return attribute.initializer.text;
  }
  if (ts.isJsxExpression(attribute.initializer)) {
    const expression = attribute.initializer.expression;
    if (!expression) return '';
    if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
      return expression.text;
    }
  }
  return null;
}

function getJsxTextContent(node: ts.Node): string {
  if (ts.isJsxText(node)) {
    return node.getText();
  }
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  if (ts.isJsxExpression(node)) {
    return node.expression ? getJsxTextContent(node.expression) : '';
  }

  let text = '';
  node.forEachChild((child) => {
    text += getJsxTextContent(child);
  });
  return text;
}

function hasAccessibleLabel(attributes: ts.JsxAttributes, textContent: string): boolean {
  return Boolean(
    getJsxAttribute(attributes, 'aria-label', 'aria-labelledby', 'title')
    || textContent.trim().length > 0,
  );
}

function isNonSemanticInteractiveTag(tagName: string | null): boolean {
  return ['div', 'span', 'section', 'article', 'li'].includes(tagName ?? '');
}

function collectLabelForIds(root: ts.Node): Set<string> {
  const ids = new Set<string>();

  const walk = (node: ts.Node) => {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const tagName = getJsxTagName(node);
      if (tagName === 'label') {
        const htmlForValue = getJsxAttributeLiteralValue(getJsxAttribute(node.attributes, 'htmlFor', 'for'));
        if (htmlForValue) {
          ids.add(htmlForValue);
        }
      }
    }

    ts.forEachChild(node, walk);
  };

  walk(root);
  return ids;
}

function isWrappedInJsxLabel(node: ts.Node): boolean {
  let current: ts.Node | undefined = node.parent;
  while (current) {
    if (ts.isJsxElement(current) && getJsxTagName(current.openingElement) === 'label') {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function hasAncestorJsxTag(node: ts.Node, tagName: string): boolean {
  let current: ts.Node | undefined = node.parent;
  while (current) {
    if (ts.isJsxElement(current) && getJsxTagName(current.openingElement) === tagName) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function isLabelableFormControl(tagName: string | null, attributes: ts.JsxAttributes): boolean {
  if (!tagName) return false;
  if (tagName === 'select' || tagName === 'textarea') return true;
  if (tagName !== 'input') return false;

  const inputType = (getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'type')) ?? 'text').toLowerCase();
  return !['hidden', 'submit', 'reset', 'button'].includes(inputType);
}

function getNormalizedInputType(attributes: ts.JsxAttributes): string {
  return (getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'type')) ?? 'text').trim().toLowerCase();
}

function hasFormControlLabel(
  node: ts.Node,
  tagName: string | null,
  attributes: ts.JsxAttributes,
  labelForIds: Set<string>,
  textContent: string,
): boolean {
  if (!isLabelableFormControl(tagName, attributes)) return true;
  if (hasAccessibleLabel(attributes, textContent)) return true;
  if (isWrappedInJsxLabel(node)) return true;

  const idValue = getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'id'));
  return Boolean(idValue && labelForIds.has(idValue));
}

function isExternalLinkTargetBlankWithoutRel(attributes: ts.JsxAttributes): boolean {
  const targetValue = getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'target'));
  if (targetValue !== '_blank') return false;

  const hrefValue = getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'href'));
  if (!hrefValue || !/^(?:https?:)?\/\//i.test(hrefValue)) return false;

  const relValue = getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'rel')) ?? '';
  return !/\bnoopener\b/i.test(relValue) || !/\bnoreferrer\b/i.test(relValue);
}

function hasPlaceholderNavigationTarget(attributes: ts.JsxAttributes): boolean {
  const targetValue = getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'href', 'to'));
  if (!targetValue) return false;

  const normalized = targetValue.trim().toLowerCase();
  return normalized === '#'
    || normalized === '/#'
    || normalized === 'javascript:'
    || normalized === 'javascript:void(0)'
    || normalized === 'javascript:void(0);';
}

function isAuthStorageKeyLiteral(node: ts.Expression | undefined): boolean {
  if (!node) return false;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return /(?:token|auth|jwt|session|access_token|refresh_token)/i.test(node.text);
  }
  return false;
}

function isBrowserStorageObject(node: ts.Expression): boolean {
  return ts.isIdentifier(node) && (node.text === 'localStorage' || node.text === 'sessionStorage');
}

function isDocumentObject(node: ts.Expression): boolean {
  return ts.isIdentifier(node) && node.text === 'document';
}

function isCookiePropertyAccess(node: ts.Expression): boolean {
  return ts.isPropertyAccessExpression(node)
    && isDocumentObject(node.expression)
    && isPropertyNamed(node.name, 'cookie');
}

function hasAuthCredentialText(node: ts.Node, sourceFile: ts.SourceFile): boolean {
  return /(?:token|auth|jwt|session|access_token|refresh_token)/i.test(node.getText(sourceFile));
}

function isAuthorizationHeaderName(node: ts.Node | undefined): boolean {
  if (!node) return false;
  if (ts.isIdentifier(node)) {
    return /^authorization$/i.test(node.text);
  }
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return /^authorization$/i.test(node.text);
  }
  if (ts.isComputedPropertyName(node)) {
    return isAuthorizationHeaderName(node.expression);
  }
  return false;
}

function countAuthGuardSignals(code: string): number {
  const patterns = [
    /\b(?:ProtectedRoute|AuthGuard|RequireAuth|withAuth|requireAuth|ensureAuth|useRequireAuth)\b/,
    /\b(?:useAuth|useSession|getServerSession|authGuard|isAuthenticated|isSignedIn)\b/,
    /\b(?:redirect|navigate|push|replace)\s*\(\s*['"`]\/(?:auth|login|log-?in|sign-?in|sign-?up|register|forgot-password|reset-password)[^'"`]*['"`]/i,
    /\bNextResponse\.redirect\s*\(/,
    /\bbeforeEnter\b/,
    /\bmiddleware\b/,
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(code) ? 1 : 0), 0);
}

function countAuthExitSignals(code: string): number {
  const patterns = [
    /\b(?:logout|logOut|signOut|signout|sign-out)\b/,
    /\b(?:supabase\.auth\.signOut|auth\.signOut|session\.signOut)\s*\(/,
    /\/(?:logout|signout|sign-out)\b/i,
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(code) ? 1 : 0), 0);
}

function analyzeAstSignals(filePath: string, code: string): AstCritiqueSignals {
  const sourceFile = ts.createSourceFile(
    filePath,
    code,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(filePath),
  );
  const signals: AstCritiqueSignals = {
    inlineStyleAttributeCount: 0,
    dangerousHtmlCount: 0,
    rawHtmlInjectionCount: 0,
    dynamicEvalCount: 0,
    iconOnlyButtonWithoutLabelCount: 0,
    clickableNonSemanticCount: 0,
    imageWithoutAltCount: 0,
    externalBlankLinkWithoutRelCount: 0,
    formControlWithoutLabelCount: 0,
    placeholderNavigationTargetCount: 0,
    emailAutocompleteMissingCount: 0,
    passwordAutocompleteMissingCount: 0,
    buttonInFormWithoutTypeCount: 0,
    authStorageWriteCount: 0,
    authCookieWriteCount: 0,
    authHeaderWriteCount: 0,
    authGuardSignalCount: countAuthGuardSignals(code),
    authExitSignalCount: countAuthExitSignals(code),
  };
  const labelForIds = collectLabelForIds(sourceFile);

  const walk = (node: ts.Node) => {
    if (ts.isJsxAttribute(node)) {
      if (isPropertyNamed(node.name, 'style') && node.initializer) {
        signals.inlineStyleAttributeCount += 1;
      }
      if (isPropertyNamed(node.name, 'dangerouslySetInnerHTML')) {
        signals.dangerousHtmlCount += 1;
      }
    }

    if (
      ts.isBinaryExpression(node)
      && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
      && ts.isPropertyAccessExpression(node.left)
      && isPropertyNamed(node.left.name, 'innerHTML', 'outerHTML')
    ) {
      signals.rawHtmlInjectionCount += 1;
    }

    if (
      ts.isBinaryExpression(node)
      && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
      && ts.isPropertyAccessExpression(node.left)
      && isBrowserStorageObject(node.left.expression)
      && /(?:token|auth|jwt|session)/i.test(node.left.name.text)
    ) {
      signals.authStorageWriteCount += 1;
    }

    if (
      ts.isBinaryExpression(node)
      && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
      && ts.isElementAccessExpression(node.left)
      && isBrowserStorageObject(node.left.expression)
      && isAuthStorageKeyLiteral(node.left.argumentExpression)
    ) {
      signals.authStorageWriteCount += 1;
    }

    if (
      ts.isBinaryExpression(node)
      && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
      && isCookiePropertyAccess(node.left)
      && hasAuthCredentialText(node.right, sourceFile)
    ) {
      signals.authCookieWriteCount += 1;
    }

    if (
      ts.isPropertyAssignment(node)
      && isAuthorizationHeaderName(node.name)
    ) {
      signals.authHeaderWriteCount += 1;
    }

    if (ts.isCallExpression(node)) {
      if (ts.isIdentifier(node.expression) && node.expression.text === 'eval') {
        signals.dynamicEvalCount += 1;
      }

      if (ts.isPropertyAccessExpression(node.expression)) {
        if (isPropertyNamed(node.expression.name, 'insertAdjacentHTML')) {
          signals.rawHtmlInjectionCount += 1;
        }
        if (
          isBrowserStorageObject(node.expression.expression)
          && isPropertyNamed(node.expression.name, 'setItem')
          && isAuthStorageKeyLiteral(node.arguments[0])
        ) {
          signals.authStorageWriteCount += 1;
        }
        if (
          isPropertyNamed(node.expression.name, 'set')
          && node.arguments.length > 0
          && hasAuthCredentialText(node.arguments[0], sourceFile)
          && (
            (ts.isIdentifier(node.expression.expression) && ['Cookies', 'cookieStore', 'cookies'].includes(node.expression.expression.text))
            || (ts.isPropertyAccessExpression(node.expression.expression) && isPropertyNamed(node.expression.expression.name, 'cookies', 'cookieStore'))
          )
        ) {
          signals.authCookieWriteCount += 1;
        }
        if (
          (isPropertyNamed(node.expression.name, 'set') || isPropertyNamed(node.expression.name, 'append'))
          && node.arguments.length > 0
          && isAuthorizationHeaderName(node.arguments[0])
        ) {
          signals.authHeaderWriteCount += 1;
        }
        if (
          ts.isIdentifier(node.expression.expression)
          && node.expression.expression.text === 'document'
          && isPropertyNamed(node.expression.name, 'write')
        ) {
          signals.rawHtmlInjectionCount += 1;
        }
        if (isPropertyNamed(node.expression.name, 'eval')) {
          signals.dynamicEvalCount += 1;
        }
      }
    }

    if (
      ts.isNewExpression(node)
      && ts.isIdentifier(node.expression)
      && node.expression.text === 'Function'
    ) {
      signals.dynamicEvalCount += 1;
    }

    if (ts.isJsxSelfClosingElement(node)) {
      const tagName = getJsxTagName(node);
      if (tagName === 'button' && hasAncestorJsxTag(node, 'form') && !getJsxAttribute(node.attributes, 'type')) {
        signals.buttonInFormWithoutTypeCount += 1;
      }
      if (tagName === 'button' && !hasAccessibleLabel(node.attributes, '')) {
        signals.iconOnlyButtonWithoutLabelCount += 1;
      }
      if (tagName === 'img' && !getJsxAttribute(node.attributes, 'alt')) {
        signals.imageWithoutAltCount += 1;
      }
      if (
        isNonSemanticInteractiveTag(tagName)
        && getJsxAttribute(node.attributes, 'onClick')
        && !getJsxAttribute(node.attributes, 'role')
        && !getJsxAttribute(node.attributes, 'tabIndex')
      ) {
        signals.clickableNonSemanticCount += 1;
      }
      if (tagName === 'a' && isExternalLinkTargetBlankWithoutRel(node.attributes)) {
        signals.externalBlankLinkWithoutRelCount += 1;
      }
      if (hasPlaceholderNavigationTarget(node.attributes)) {
        signals.placeholderNavigationTargetCount += 1;
      }
      if (tagName === 'input') {
        const inputType = getNormalizedInputType(node.attributes);
        const hasAutocomplete = Boolean(getJsxAttribute(node.attributes, 'autocomplete', 'autoComplete'));
        if (inputType === 'email' && !hasAutocomplete) {
          signals.emailAutocompleteMissingCount += 1;
        }
        if (inputType === 'password' && !hasAutocomplete) {
          signals.passwordAutocompleteMissingCount += 1;
        }
      }
      if (!hasFormControlLabel(node, tagName, node.attributes, labelForIds, '')) {
        signals.formControlWithoutLabelCount += 1;
      }
    }

    if (ts.isJsxElement(node)) {
      const tagName = getJsxTagName(node.openingElement);
      const textContent = getJsxTextContent(node).replace(/\s+/g, ' ').trim();

      if (tagName === 'button' && hasAncestorJsxTag(node, 'form') && !getJsxAttribute(node.openingElement.attributes, 'type')) {
        signals.buttonInFormWithoutTypeCount += 1;
      }
      if (tagName === 'button' && !hasAccessibleLabel(node.openingElement.attributes, textContent)) {
        signals.iconOnlyButtonWithoutLabelCount += 1;
      }
      if (tagName === 'img' && !getJsxAttribute(node.openingElement.attributes, 'alt')) {
        signals.imageWithoutAltCount += 1;
      }

      if (
        isNonSemanticInteractiveTag(tagName)
        && getJsxAttribute(node.openingElement.attributes, 'onClick')
        && !getJsxAttribute(node.openingElement.attributes, 'role')
        && !getJsxAttribute(node.openingElement.attributes, 'tabIndex')
      ) {
        signals.clickableNonSemanticCount += 1;
      }
      if (tagName === 'a' && isExternalLinkTargetBlankWithoutRel(node.openingElement.attributes)) {
        signals.externalBlankLinkWithoutRelCount += 1;
      }
      if (hasPlaceholderNavigationTarget(node.openingElement.attributes)) {
        signals.placeholderNavigationTargetCount += 1;
      }
      if (tagName === 'input') {
        const inputType = getNormalizedInputType(node.openingElement.attributes);
        const hasAutocomplete = Boolean(getJsxAttribute(node.openingElement.attributes, 'autocomplete', 'autoComplete'));
        if (inputType === 'email' && !hasAutocomplete) {
          signals.emailAutocompleteMissingCount += 1;
        }
        if (inputType === 'password' && !hasAutocomplete) {
          signals.passwordAutocompleteMissingCount += 1;
        }
      }
      if (!hasFormControlLabel(node, tagName, node.openingElement.attributes, labelForIds, textContent)) {
        signals.formControlWithoutLabelCount += 1;
      }
    }

    ts.forEachChild(node, walk);
  };

  walk(sourceFile);
  return signals;
}

export function critiqueSource({
  filePath,
  code,
  reviewPack = null,
  packManifest = null,
  treatmentsCss = '',
}: CritiqueSourceInput): FileCritiqueReport {
  const codeLower = code.toLowerCase();
  const astSignals = analyzeAstSignals(filePath, code);
  const focusAreas = resolveFocusAreas(reviewPack);
  const findings: VerificationFinding[] = [];
  const scores: VerificationScore[] = [];
  const antiPatternIds = new Set(reviewPack?.antiPatterns.map(entry => entry.id) ?? []);

  const usedTreatments = TREATMENT_CLASSES.filter(token => code.includes(token));
  const treatmentSuggestions = TREATMENT_CLASSES.filter(token => !code.includes(token)).map(token => `Consider using \`${token}\` where appropriate.`);
  scores.push({
    category: 'Treatment Usage',
    focusArea: 'treatment-usage',
    score: scoreRatio(usedTreatments.length, TREATMENT_CLASSES.length),
    details: `${usedTreatments.length}/${TREATMENT_CLASSES.length} base treatments used: ${usedTreatments.join(', ') || 'none'}`,
    suggestions: treatmentSuggestions,
  });
  if (focusAreas.includes('treatment-usage') && usedTreatments.length === 0) {
    findings.push(makeFinding({
      id: 'treatment-usage-missing',
      category: 'Treatment Usage',
      severity: resolveSeverityFromChecks(reviewPack, 'warn', ['page-pattern-contract', 'section-pattern-coverage']),
      message: 'No Decantr treatment classes were detected in the reviewed file.',
      evidence: [filePath, 'Expected tokens include d-interactive, d-surface, d-data, d-control, d-section, d-annotation, d-label.'],
      file: filePath,
      suggestedFix: 'Apply the compiled treatment vocabulary instead of hand-rolled utility styling.',
    }));
  }

  const decoratorNames = buildDecoratorInventory(treatmentsCss);
  const usedDecorators = decoratorNames.filter(name => code.includes(name));
  const usesCssVars = code.includes('var(--');
  scores.push({
    category: 'Theme Consistency',
    focusArea: 'theme-consistency',
    score: decoratorNames.length > 0
      ? scoreRatio((usedDecorators.length > 0 ? 1 : 0) + (usesCssVars ? 1 : 0), 2)
      : (usesCssVars ? 4 : 2),
    details: `Decorators used: ${usedDecorators.join(', ') || 'none'}; CSS vars: ${usesCssVars ? 'yes' : 'no'}`,
    suggestions: [
      ...(!usesCssVars ? ['Prefer CSS variable references over hardcoded visual values.'] : []),
      ...((decoratorNames.length > 0 && usedDecorators.length === 0) ? ['Use theme decorators from treatments.css when they fit the component intent.'] : []),
    ],
  });
  if (focusAreas.includes('theme-consistency') && !usesCssVars && usedDecorators.length === 0) {
    findings.push(makeFinding({
      id: 'theme-consistency-weak',
      category: 'Theme Consistency',
      severity: resolveSeverityFromChecks(reviewPack, 'warn', ['theme-consistency', 'mutation-theme-contract']),
      message: 'The file does not appear to use theme decorators or CSS variables from the compiled contract.',
      evidence: [filePath, `Decorators available: ${decoratorNames.slice(0, 5).join(', ') || 'none'}`],
      file: filePath,
      suggestedFix: 'Anchor styling to tokens.css and treatments.css instead of local hardcoded values.',
    }));
  }

  const hasAria = codeLower.includes('aria-') || codeLower.includes('role=');
  const hasFocus = codeLower.includes('focus-visible') || codeLower.includes('focusvisible');
  const hasKeyboard = codeLower.includes('onkeydown') || codeLower.includes('onkeyup');
  const iconButtonIssues = astSignals.iconOnlyButtonWithoutLabelCount;
  const clickableNonSemanticIssues = astSignals.clickableNonSemanticCount;
  const imageAltIssues = astSignals.imageWithoutAltCount;
  const formControlLabelIssues = astSignals.formControlWithoutLabelCount;
  scores.push({
    category: 'Accessibility',
    focusArea: 'accessibility',
    score: Math.max(
      1,
      Math.min(
        5,
        1
        + (hasAria ? 2 : 0)
        + (hasFocus ? 1 : 0)
        + (hasKeyboard ? 1 : 0)
        - (iconButtonIssues > 0 ? 1 : 0)
        - (clickableNonSemanticIssues > 0 ? 1 : 0)
        - (imageAltIssues > 0 ? 1 : 0)
        - (formControlLabelIssues > 0 ? 1 : 0),
      ),
    ),
    details: `ARIA: ${hasAria ? 'yes' : 'no'}, Focus: ${hasFocus ? 'yes' : 'no'}, Keyboard: ${hasKeyboard ? 'yes' : 'no'}, unlabeled icon buttons: ${iconButtonIssues}, clickable non-semantic elements: ${clickableNonSemanticIssues}, images without alt: ${imageAltIssues}, form controls without labels: ${formControlLabelIssues}`,
    suggestions: [
      ...(!hasAria ? ['Add ARIA roles or labels to interactive regions.'] : []),
      ...(!hasFocus ? ['Add visible focus styling for keyboard navigation.'] : []),
      ...(!hasKeyboard ? ['Add keyboard handling where interactive behavior depends on pointer events.'] : []),
      ...(iconButtonIssues > 0 ? ['Add accessible labels to icon-only buttons via visible text or aria-label.'] : []),
      ...(clickableNonSemanticIssues > 0 ? ['Use semantic interactive elements or add role/tabIndex and keyboard handling to clickable non-semantic containers.'] : []),
      ...(imageAltIssues > 0 ? ['Add alt text to meaningful images and use alt="" only for decorative ones.'] : []),
      ...(formControlLabelIssues > 0 ? ['Add programmatic labels to form controls instead of relying on placeholders alone.'] : []),
    ],
  });
  if (focusAreas.includes('accessibility')) {
    if (!hasAria) {
      findings.push(makeFinding({
        id: 'accessibility-aria-missing',
        category: 'Accessibility',
        severity: resolveSeverityFromChecks(reviewPack, 'warn', ['review-contract-baseline']),
        message: 'No ARIA roles or labels were detected in the reviewed file.',
        evidence: [filePath],
        file: filePath,
        suggestedFix: 'Add ARIA metadata to interactive or landmark elements.',
      }));
    }
    if (!hasKeyboard) {
      findings.push(makeFinding({
        id: 'accessibility-keyboard-missing',
        category: 'Accessibility',
        severity: resolveSeverityFromChecks(reviewPack, 'info', ['review-remediation']),
        message: 'No keyboard interaction handlers were detected in the reviewed file.',
        evidence: [filePath],
        file: filePath,
        suggestedFix: 'Verify interactive elements remain usable from the keyboard.',
      }));
    }
    if (iconButtonIssues > 0) {
      findings.push(makeFinding({
        id: 'accessibility-icon-button-label-missing',
        category: 'Accessibility',
        severity: resolveSeverityFromChecks(reviewPack, 'warn', ['review-contract-baseline']),
        message: 'Icon-only button elements were detected without an accessible label.',
        evidence: [filePath, `Unlabeled icon buttons: ${iconButtonIssues}`],
        file: filePath,
        suggestedFix: 'Add visible text or an aria-label/aria-labelledby attribute to icon-only buttons.',
      }));
    }
    if (clickableNonSemanticIssues > 0) {
      findings.push(makeFinding({
        id: 'accessibility-clickable-non-semantic',
        category: 'Accessibility',
        severity: resolveSeverityFromChecks(reviewPack, 'warn', ['review-remediation', 'review-contract-baseline']),
        message: 'Clickable non-semantic elements were detected without the semantic/keyboard affordances accessibility tools expect.',
        evidence: [filePath, `Clickable non-semantic elements without role/tabIndex: ${clickableNonSemanticIssues}`],
        file: filePath,
        suggestedFix: 'Prefer semantic controls like button/link, or add role, tabIndex, and keyboard handlers to non-semantic interactive containers.',
      }));
    }
    if (imageAltIssues > 0) {
      findings.push(makeFinding({
        id: 'accessibility-image-alt-missing',
        category: 'Accessibility',
        severity: resolveSeverityFromChecks(reviewPack, 'warn', ['review-contract-baseline']),
        message: 'Image elements were detected without an `alt` attribute.',
        evidence: [filePath, `Images without alt: ${imageAltIssues}`],
        file: filePath,
        suggestedFix: 'Add meaningful alt text for informative images, or use alt="" when the image is purely decorative.',
      }));
    }
    if (formControlLabelIssues > 0) {
      findings.push(makeFinding({
        id: 'accessibility-form-control-label-missing',
        category: 'Accessibility',
        severity: resolveSeverityFromChecks(reviewPack, 'warn', ['review-contract-baseline', 'review-remediation']),
        message: 'Form controls were detected without an associated accessible label.',
        evidence: [filePath, `Form controls without labels: ${formControlLabelIssues}`],
        file: filePath,
        suggestedFix: 'Associate inputs with visible labels or use aria-label/aria-labelledby when a visible label is not appropriate.',
      }));
    }
  }

  const hasMedia = codeLower.includes('@media') || codeLower.includes('usemediaquery') || codeLower.includes('breakpoint');
  const hasResponsive = codeLower.includes('sm:') || codeLower.includes('md:') || codeLower.includes('lg:') || codeLower.includes('_sm_') || codeLower.includes('_md_');
  scores.push({
    category: 'Responsive Design',
    focusArea: 'responsive-design',
    score: Math.min(5, (hasMedia ? 3 : 1) + (hasResponsive ? 2 : 0)),
    details: `Media queries: ${hasMedia ? 'yes' : 'no'}, Responsive signals: ${hasResponsive ? 'yes' : 'no'}`,
    suggestions: !hasMedia && !hasResponsive ? ['Add responsive breakpoint handling.'] : [],
  });
  if (focusAreas.includes('responsive-design') && !hasMedia && !hasResponsive) {
    findings.push(makeFinding({
      id: 'responsive-signals-missing',
      category: 'Responsive Design',
      severity: resolveSeverityFromChecks(reviewPack, 'warn', ['page-pattern-contract']),
      message: 'No responsive breakpoint handling was detected in the reviewed file.',
      evidence: [filePath],
      file: filePath,
      suggestedFix: 'Add responsive layout behavior that matches the compiled route contract.',
    }));
  }

  const hasTransition = codeLower.includes('transition') || codeLower.includes('animate') || codeLower.includes('keyframe') || codeLower.includes('framer');
  const hasHover = codeLower.includes(':hover') || codeLower.includes('onmouseenter') || codeLower.includes('hover:');
  const buttonInFormWithoutTypeCount = astSignals.buttonInFormWithoutTypeCount;
  scores.push({
    category: 'Motion & Interaction',
    focusArea: 'motion-interaction',
    score: Math.max(1, Math.min(5, (hasTransition ? 3 : 1) + (hasHover ? 2 : 0) - (buttonInFormWithoutTypeCount > 0 ? 1 : 0))),
    details: `Transitions: ${hasTransition ? 'yes' : 'no'}, Hover states: ${hasHover ? 'yes' : 'no'}, form buttons missing type: ${buttonInFormWithoutTypeCount}`,
    suggestions: [
      ...(!hasTransition ? ['Add transitions for interactive state changes where appropriate.'] : []),
      ...(buttonInFormWithoutTypeCount > 0 ? ['Add explicit button types inside forms so non-submit actions do not accidentally submit.'] : []),
    ],
  });
  if (buttonInFormWithoutTypeCount > 0) {
    findings.push(makeFinding({
      id: 'interaction-button-type-missing',
      category: 'Interaction Safety',
      severity: 'warn',
      message: 'Buttons inside forms were detected without an explicit `type` attribute.',
      evidence: [filePath, `Buttons inside forms without type: ${buttonInFormWithoutTypeCount}`],
      file: filePath,
      suggestedFix: 'Set `type=\"button\"` for non-submit actions and `type=\"submit\"` for the intended submit control.',
    }));
  }

  const knownRoutes = reviewPack?.data.routes.length ?? packManifest?.pages.length ?? 0;
  const placeholderNavigationTargets = astSignals.placeholderNavigationTargetCount;
  scores.push({
    category: 'Topology Context',
    focusArea: 'route-topology',
    score: Math.max(1, (reviewPack ? 5 : packManifest ? 4 : 1) - (placeholderNavigationTargets > 0 ? 2 : 0)),
    details: reviewPack
      ? `Compiled review contract covers ${knownRoutes} routes. Placeholder navigation targets: ${placeholderNavigationTargets}.`
      : packManifest
        ? `Pack manifest is available for ${knownRoutes} pages, but the review pack is missing. Placeholder navigation targets: ${placeholderNavigationTargets}.`
        : `No compiled route context was available during critique. Placeholder navigation targets: ${placeholderNavigationTargets}.`,
    suggestions: [
      ...(reviewPack ? [] : ['Run `decantr refresh` so critique starts from a compiled review contract.']),
      ...(placeholderNavigationTargets > 0 ? ['Replace placeholder href/to targets with real route destinations from the compiled contract.'] : []),
    ],
  });
  if (focusAreas.includes('route-topology') && !reviewPack) {
    findings.push(makeFinding({
      id: 'review-pack-missing-for-critique',
      category: 'Route Topology',
      severity: resolveSeverityFromChecks(reviewPack, 'warn', ['review-contract-baseline', 'route-topology', 'page-route-contract']),
      message: 'Critique ran without a compiled review pack.',
      evidence: ['review-pack unavailable'],
      file: filePath,
      suggestedFix: 'Regenerate execution packs so critique findings can anchor to the compiled route contract.',
    }));
  }
  if (focusAreas.includes('route-topology') && placeholderNavigationTargets > 0) {
    findings.push(makeFinding({
      id: 'route-placeholder-navigation-target',
      category: 'Route Topology',
      severity: resolveSeverityFromChecks(reviewPack, 'warn', ['route-topology', 'page-route-contract', 'review-remediation']),
      message: 'Placeholder navigation targets were detected in the reviewed file.',
      evidence: [filePath, `Placeholder href/to targets: ${placeholderNavigationTargets}`],
      file: filePath,
      suggestedFix: 'Replace placeholder route targets like `#` or `javascript:void(0)` with the actual page paths from the compiled review contract.',
    }));
  }

  const hasInlineStyleLiterals = astSignals.inlineStyleAttributeCount > 0 || /style\s*=\s*(?:\{\{|["'])/.test(code);
  if (antiPatternIds.has('inline-styles') && hasInlineStyleLiterals) {
    findings.push(makeFinding({
      id: 'anti-pattern-inline-styles',
      category: 'Anti-Patterns',
      severity: resolveSeverityFromChecks(reviewPack, 'warn', ['review-contract-baseline', 'theme-consistency']),
      message: 'Inline style literals were detected in the reviewed file.',
      evidence: [filePath, `Inline style attributes: ${astSignals.inlineStyleAttributeCount}`],
      file: filePath,
      suggestedFix: 'Replace inline visual values with treatments, decorators, and CSS variables from the compiled contract.',
    }));
  }

  const hardcodedColors = antiPatternIds.has('hardcoded-colors') ? findHardcodedColors(code) : [];
  if (hardcodedColors.length > 0) {
    findings.push(makeFinding({
      id: 'anti-pattern-hardcoded-colors',
      category: 'Anti-Patterns',
      severity: resolveSeverityFromChecks(reviewPack, 'warn', ['theme-consistency', 'mutation-theme-contract']),
      message: 'Hardcoded color literals were detected in the reviewed file.',
      evidence: [filePath, `Color literals: ${hardcodedColors.slice(0, 5).join(', ')}`],
      file: filePath,
      suggestedFix: 'Replace hardcoded colors with CSS variables or theme decorators from Decantr.',
    }));
  }

  const utilitySignals = antiPatternIds.has('utility-framework-leakage') ? findUtilityFrameworkSignals(code) : [];
  if (utilitySignals.length > 0 && usedTreatments.length === 0) {
    findings.push(makeFinding({
      id: 'anti-pattern-utility-framework-leakage',
      category: 'Anti-Patterns',
      severity: 'info',
      message: 'Utility-framework class patterns appear to be carrying the primary visual system for this file.',
      evidence: [filePath, `Utility signals: ${utilitySignals.slice(0, 6).join(', ')}`],
      file: filePath,
      suggestedFix: 'Use Decantr treatments and decorators as the primary styling contract, with utilities only as supporting glue when necessary.',
    }));
  }

  const dangerousHtmlCount = Math.max(astSignals.dangerousHtmlCount, /dangerouslySetInnerHTML\s*=/.test(code) ? 1 : 0);
  const rawHtmlInjectionCount = Math.max(astSignals.rawHtmlInjectionCount, /\binnerHTML\s*=|\binsertAdjacentHTML\s*\(|\bdocument\.write\s*\(/.test(code) ? 1 : 0);
  const dynamicEvalCount = Math.max(astSignals.dynamicEvalCount, /\beval\s*\(|new\s+Function\s*\(/.test(code) ? 1 : 0);
  const externalBlankLinkWithoutRelCount = astSignals.externalBlankLinkWithoutRelCount;
  const emailAutocompleteMissingCount = astSignals.emailAutocompleteMissingCount;
  const passwordAutocompleteMissingCount = astSignals.passwordAutocompleteMissingCount;
  const authStorageWriteCount = astSignals.authStorageWriteCount;
  const authCookieWriteCount = astSignals.authCookieWriteCount;
  const authHeaderWriteCount = astSignals.authHeaderWriteCount;
  const hasDangerousHtml = dangerousHtmlCount > 0;
  const hasRawHtmlInjection = rawHtmlInjectionCount > 0;
  const hasDynamicEval = dynamicEvalCount > 0;
  const hasExternalBlankLinkWithoutRel = externalBlankLinkWithoutRelCount > 0;
  const hasAuthAutocompleteIssues = emailAutocompleteMissingCount > 0 || passwordAutocompleteMissingCount > 0;
  const hasAuthStorageWrites = authStorageWriteCount > 0;
  const hasAuthCookieWrites = authCookieWriteCount > 0;
  const hasAuthHeaderWrites = authHeaderWriteCount > 0;
  scores.push({
    category: 'Security Hygiene',
    focusArea: 'security-hygiene',
    score: Math.max(
      1,
      5
      - (hasDangerousHtml ? 2 : 0)
      - (hasRawHtmlInjection ? 2 : 0)
      - (hasDynamicEval ? 2 : 0)
      - (hasExternalBlankLinkWithoutRel ? 1 : 0)
      - (hasAuthAutocompleteIssues ? 1 : 0)
      - (hasAuthStorageWrites ? 2 : 0)
      - (hasAuthCookieWrites ? 2 : 0)
      - (hasAuthHeaderWrites ? 2 : 0),
    ),
    details: `dangerouslySetInnerHTML: ${dangerousHtmlCount}, raw HTML injection: ${rawHtmlInjectionCount}, dynamic eval: ${dynamicEvalCount}, external _blank links without rel: ${externalBlankLinkWithoutRelCount}, email inputs without autocomplete: ${emailAutocompleteMissingCount}, password inputs without autocomplete: ${passwordAutocompleteMissingCount}, auth storage writes: ${authStorageWriteCount}, auth cookie writes: ${authCookieWriteCount}, auth header writes: ${authHeaderWriteCount}`,
    suggestions: [
      ...(hasDangerousHtml || hasRawHtmlInjection ? ['Prefer escaped rendering paths and sanitize any unavoidable HTML before rendering it.'] : []),
      ...(hasDynamicEval ? ['Remove eval/new Function usage and replace it with explicit logic or data-driven dispatch.'] : []),
      ...(hasExternalBlankLinkWithoutRel ? ['Add rel="noopener noreferrer" to external links that open in a new tab.'] : []),
      ...(hasAuthAutocompleteIssues ? ['Add explicit autocomplete hints such as `email`, `username`, `current-password`, or `new-password` on auth-related inputs.'] : []),
      ...(hasAuthStorageWrites ? ['Avoid persisting auth tokens in browser storage; prefer secure, server-managed session boundaries or hardened cookie-based flows.'] : []),
      ...(hasAuthCookieWrites ? ['Avoid setting auth cookies from client-side JavaScript; prefer server-issued HttpOnly cookies or other server-managed session boundaries.'] : []),
      ...(hasAuthHeaderWrites ? ['Avoid constructing bearer/session authorization headers in client-rendered code unless the auth model is explicitly reviewed and intended.'] : []),
    ],
  });

  if (hasDangerousHtml) {
    findings.push(makeFinding({
      id: 'security-dangerously-set-html',
      category: 'Security Hygiene',
      severity: 'error',
      message: 'The reviewed file uses `dangerouslySetInnerHTML`.',
      evidence: [filePath, `Occurrences: ${dangerousHtmlCount}`],
      file: filePath,
      suggestedFix: 'Render structured data through components instead of injecting raw HTML, or sanitize the content before it reaches the view layer.',
    }));
  }

  if (hasRawHtmlInjection) {
    findings.push(makeFinding({
      id: 'security-raw-html-injection',
      category: 'Security Hygiene',
      severity: 'error',
      message: 'The reviewed file writes raw HTML into the DOM.',
      evidence: [filePath, `Occurrences: ${rawHtmlInjectionCount}`],
      file: filePath,
      suggestedFix: 'Avoid `innerHTML` and `insertAdjacentHTML`; render trusted structured nodes instead.',
    }));
  }

  if (hasDynamicEval) {
    findings.push(makeFinding({
      id: 'security-dynamic-code-eval',
      category: 'Security Hygiene',
      severity: 'error',
      message: 'The reviewed file uses `eval` or `new Function`, which weakens runtime trust boundaries.',
      evidence: [filePath, `Occurrences: ${dynamicEvalCount}`],
      file: filePath,
      suggestedFix: 'Replace dynamic code evaluation with explicit functions, lookup tables, or validated configuration data.',
    }));
  }

  if (hasExternalBlankLinkWithoutRel) {
    findings.push(makeFinding({
      id: 'security-target-blank-rel-missing',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'External links open in a new tab without `rel=\"noopener noreferrer\"`.',
      evidence: [filePath, `Occurrences: ${externalBlankLinkWithoutRelCount}`],
      file: filePath,
      suggestedFix: 'Add rel="noopener noreferrer" to external target="_blank" links to prevent tab-nabbing and preserve opener isolation.',
    }));
  }

  if (hasAuthAutocompleteIssues) {
    findings.push(makeFinding({
      id: 'security-auth-autocomplete-missing',
      category: 'Security Hygiene',
      severity: 'info',
      message: 'Auth-related inputs were detected without explicit `autocomplete` hints.',
      evidence: [
        filePath,
        `Email inputs without autocomplete: ${emailAutocompleteMissingCount}`,
        `Password inputs without autocomplete: ${passwordAutocompleteMissingCount}`,
      ],
      file: filePath,
      suggestedFix: 'Add `autocomplete=\"email\"` or `autocomplete=\"username\"` to identity fields and `autocomplete=\"current-password\"` or `autocomplete=\"new-password\"` to password fields.',
    }));
  }

  if (hasAuthStorageWrites) {
    findings.push(makeFinding({
      id: 'security-auth-storage-write',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'Potential auth credentials were written into browser storage.',
      evidence: [filePath, `Auth-like local/session storage writes: ${authStorageWriteCount}`],
      file: filePath,
      suggestedFix: 'Avoid writing tokens or sessions to localStorage/sessionStorage; prefer secure server-managed sessions or hardened cookie flows.',
    }));
  }

  if (hasAuthCookieWrites) {
    findings.push(makeFinding({
      id: 'security-auth-cookie-write',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'Potential auth credentials were written into client-managed cookies.',
      evidence: [filePath, `Auth-like cookie writes: ${authCookieWriteCount}`],
      file: filePath,
      suggestedFix: 'Avoid setting auth cookies from client-side code; prefer server-issued HttpOnly cookies or other server-managed session mechanisms.',
    }));
  }

  if (hasAuthHeaderWrites) {
    findings.push(makeFinding({
      id: 'security-auth-header-write',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'Auth-like authorization headers were constructed in client-side code.',
      evidence: [filePath, `Auth-like header writes: ${authHeaderWriteCount}`],
      file: filePath,
      suggestedFix: 'Prefer server-managed sessions or a deliberately reviewed client-auth strategy instead of assembling bearer/session headers ad hoc in client-rendered code.',
    }));
  }

  const overall = Math.round((scores.reduce((sum, score) => sum + score.score, 0) / scores.length) * 10) / 10;
  return {
    $schema: VERIFICATION_SCHEMA_URLS.fileCritique,
    file: filePath,
    overall,
    scores,
    findings,
    focusAreas,
    reviewPack,
  };
}

export async function critiqueFile(filePath: string, projectRoot: string): Promise<FileCritiqueReport> {
  const resolvedPath = isAbsolute(filePath) ? filePath : resolve(projectRoot, filePath);
  const code = await readFile(resolvedPath, 'utf-8');
  const treatmentsCss = readTextIfExists(join(projectRoot, 'src', 'styles', 'treatments.css'));
  const reviewPack = loadReviewPack(projectRoot);
  const packManifest = loadPackManifest(projectRoot);

  return critiqueSource({
    filePath: resolvedPath,
    code,
    reviewPack,
    packManifest,
    treatmentsCss,
  });
}
