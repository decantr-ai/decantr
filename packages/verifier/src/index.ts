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
    inlineEventHandlerCount: number;
    externalScriptsWithoutIntegrityCount: number;
    externalScriptsWithIntegrityMissingCrossoriginCount: number;
    externalStylesheetsWithoutIntegrityCount: number;
    externalStylesheetsWithIntegrityMissingCrossoriginCount: number;
    externalScriptsWithInsecureTransportCount: number;
    externalStylesheetsWithInsecureTransportCount: number;
    externalMediaSourcesWithInsecureTransportCount: number;
    externalBlankLinksWithoutRelCount: number;
    externalIframesWithoutSandboxCount: number;
    externalIframesWithInsecureTransportCount: number;
    jsEvalSignalCount: number;
    jsHtmlInjectionSignalCount: number;
    jsInsecureTransportSignalCount: number;
    jsSecretSignalCount: number;
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
    appsWithoutInsecureRemoteAssetTransportCount: number;
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

function sourceAuditBucketsOverlap(a: SourceAuditBucket, b: SourceAuditBucket): boolean {
  return a.files.some((file) => b.files.includes(file));
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

function isAuditableStyleFile(filePath: string): boolean {
  return /\.css$/i.test(filePath);
}

function collectProjectStyleFiles(projectRoot: string): string[] {
  const candidates = ['src', 'app', 'styles']
    .map((dir) => join(projectRoot, dir))
    .filter((dir) => existsSync(dir));
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
      if (!isAuditableStyleFile(absolutePath)) continue;
      files.add(absolutePath);
    }
  };

  for (const candidate of candidates) {
    walk(candidate);
  }

  return [...files].sort();
}

function countFocusVisibleSignals(code: string): number {
  const patterns = [
    /:focus-visible\b/i,
    /\.focus-visible\b/i,
    /\[data-focus-visible-added\]/i,
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(code) ? 1 : 0), 0);
}

function countReducedMotionSignals(code: string): number {
  const patterns = [
    /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/i,
    /\[data-reduce-motion(?:=[^\]]+)?\]/i,
    /\[data-motion(?:=[^\]]*reduce[^\]]*)\]/i,
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(code) ? 1 : 0), 0);
}

function auditProjectSourceTree(projectRoot: string): SourceAuditSummary {
  const sourceFiles = collectProjectSourceFiles(projectRoot);
  const summary: SourceAuditSummary = {
    filesChecked: sourceFiles.length,
    inlineStyles: createSourceAuditBucket(),
    securityRiskPatterns: createSourceAuditBucket(),
    localhostEndpointSignals: createSourceAuditBucket(),
    placeholderRoutes: createSourceAuditBucket(),
    protectedSurfaceSignals: createSourceAuditBucket(),
    authProtectedRedirectSignals: createSourceAuditBucket(),
    authAnonymousRedirectSignals: createSourceAuditBucket(),
    authOpenRedirectSignals: createSourceAuditBucket(),
    authExternalRedirectSignals: createSourceAuditBucket(),
    authProviderStateSignals: createSourceAuditBucket(),
    authProviderPkceSignals: createSourceAuditBucket(),
    authProviderNonceSignals: createSourceAuditBucket(),
    skipNavSignals: createSourceAuditBucket(),
    skipNavTargetIds: [],
    mainLandmarkSignals: createSourceAuditBucket(),
    mainLandmarkIds: [],
    authEntrySignals: createSourceAuditBucket(),
    signInFlowSignals: createSourceAuditBucket(),
    signUpFlowSignals: createSourceAuditBucket(),
    recoveryFlowSignals: createSourceAuditBucket(),
    authSessionSignals: createSourceAuditBucket(),
    authUnauthenticatedBranchSignals: createSourceAuditBucket(),
    authLoadingSignals: createSourceAuditBucket(),
    authProtectedLoadingRenderSignals: createSourceAuditBucket(),
    authBlankLoadingRenderSignals: createSourceAuditBucket(),
    authAnonymousLoadingRedirectSignals: createSourceAuditBucket(),
    authProtectedUnauthenticatedRenderSignals: createSourceAuditBucket(),
    authErrorSignals: createSourceAuditBucket(),
    authSuccessSignals: createSourceAuditBucket(),
    authCallbackTokenSignals: createSourceAuditBucket(),
    authCallbackExchangeSignals: createSourceAuditBucket(),
    authCallbackExchangeErrorSignals: createSourceAuditBucket(),
    authCallbackErrorSignals: createSourceAuditBucket(),
    authCallbackStateSignals: createSourceAuditBucket(),
    authCallbackStateValidationSignals: createSourceAuditBucket(),
    authCallbackStateStorageSignals: createSourceAuditBucket(),
    authCallbackStateStorageClearSignals: createSourceAuditBucket(),
    authCallbackUrlScrubSignals: createSourceAuditBucket(),
    authStorageWrites: createSourceAuditBucket(),
    authStorageClears: createSourceAuditBucket(),
    authCookieWrites: createSourceAuditBucket(),
    authCookieClears: createSourceAuditBucket(),
    authHeaderWrites: createSourceAuditBucket(),
    authHeaderClears: createSourceAuditBucket(),
    authCacheClients: createSourceAuditBucket(),
    authCacheClears: createSourceAuditBucket(),
    authRefreshSignals: createSourceAuditBucket(),
    authRefreshClears: createSourceAuditBucket(),
    authRealtimeSignals: createSourceAuditBucket(),
    authRealtimeClears: createSourceAuditBucket(),
    authCoordinationSignals: createSourceAuditBucket(),
    authCoordinationClears: createSourceAuditBucket(),
    authGuardSignals: createSourceAuditBucket(),
    authExitSignals: createSourceAuditBucket(),
    authSessionTeardownSignals: createSourceAuditBucket(),
    signInRouteSignals: createSourceAuditBucket(),
    registrationRouteSignals: createSourceAuditBucket(),
    recoveryRouteSignals: createSourceAuditBucket(),
    accessibilityIssues: createSourceAuditBucket(),
    interactionSafetyIssues: createSourceAuditBucket(),
    authInputHintIssues: createSourceAuditBucket(),
  };

  for (const sourceFile of sourceFiles) {
    const relativePath = relative(projectRoot, sourceFile) || sourceFile;
    const code = readFileSync(sourceFile, 'utf-8');
    const signals = analyzeAstSignals(relativePath, code);
    const accessibilityIssueCount = signals.iconOnlyButtonWithoutLabelCount
      + signals.iconOnlyLinkWithoutLabelCount
      + signals.clickableNonSemanticCount
      + signals.unlabeledNavigationLandmarkCount
      + signals.imageWithoutAltCount
      + signals.iframeWithoutTitleCount
      + signals.dialogWithoutLabelCount
      + signals.dialogWithoutModalHintCount
      + signals.tableWithoutHeaderCount
      + signals.tableWithoutCaptionCount
      + signals.formControlWithoutLabelCount;
    const securityRiskPatternCount = signals.dangerousHtmlCount
      + signals.rawHtmlInjectionCount
      + signals.dynamicEvalCount
      + signals.hardcodedSecretSignalCount
      + signals.clientSecretEnvReferenceCount
      + signals.localhostEndpointCount
      + signals.wildcardPostMessageCount
      + signals.windowOpenWithoutNoopenerCount
      + signals.externalIframeWithoutSandboxCount
      + signals.insecureExternalIframeCount
      + signals.insecureFormActionCount
      + signals.insecureAuthFormMethodCount
      + signals.insecureTransportEndpointCount
      + signals.insecureExternalImageCount
      + signals.authCookieMissingHardeningCount
      + signals.authOpenRedirectSignalCount
      + signals.authExternalRedirectSignalCount
      + signals.authProviderStateMissingCount
      + signals.authProviderPkceMissingCount
      + signals.authProviderNonceMissingCount
      + signals.externalBlankLinkWithoutRelCount;
    const authInputHintIssueCount = signals.emailAutocompleteMissingCount
      + signals.passwordAutocompleteMissingCount
      + signals.otpAutocompleteMissingCount
      + signals.authAutocompleteDisabledCount
      + signals.authAutocompleteSemanticMismatchCount
      + signals.authInputTypeMismatchCount;

    recordSourceAudit(summary.inlineStyles, relativePath, signals.inlineStyleAttributeCount);
    recordSourceAudit(summary.securityRiskPatterns, relativePath, securityRiskPatternCount);
    recordSourceAudit(summary.localhostEndpointSignals, relativePath, signals.localhostEndpointCount);
    recordSourceAudit(summary.placeholderRoutes, relativePath, signals.placeholderNavigationTargetCount);
    recordSourceAudit(summary.protectedSurfaceSignals, relativePath, signals.protectedSurfaceSignalCount);
    recordSourceAudit(summary.authProtectedRedirectSignals, relativePath, signals.authProtectedRedirectSignalCount);
    recordSourceAudit(summary.authAnonymousRedirectSignals, relativePath, signals.authAnonymousRedirectSignalCount);
    recordSourceAudit(summary.authOpenRedirectSignals, relativePath, signals.authOpenRedirectSignalCount);
    recordSourceAudit(summary.authExternalRedirectSignals, relativePath, signals.authExternalRedirectSignalCount);
    recordSourceAudit(summary.authProviderStateSignals, relativePath, signals.authProviderStateMissingCount);
    recordSourceAudit(summary.authProviderPkceSignals, relativePath, signals.authProviderPkceMissingCount);
    recordSourceAudit(summary.authProviderNonceSignals, relativePath, signals.authProviderNonceMissingCount);
    recordSourceAudit(summary.skipNavSignals, relativePath, signals.skipNavSignalCount);
    recordSourceAudit(summary.mainLandmarkSignals, relativePath, signals.mainLandmarkCount);
    for (const targetId of signals.skipNavTargetIds) {
      if (!summary.skipNavTargetIds.includes(targetId)) {
        summary.skipNavTargetIds.push(targetId);
      }
    }
    for (const landmarkId of signals.mainLandmarkIds) {
      if (!summary.mainLandmarkIds.includes(landmarkId)) {
        summary.mainLandmarkIds.push(landmarkId);
      }
    }
    recordSourceAudit(summary.authEntrySignals, relativePath, signals.authEntrySignalCount);
    recordSourceAudit(summary.signInFlowSignals, relativePath, countSignInFlowSignals(code, relativePath));
    recordSourceAudit(summary.signUpFlowSignals, relativePath, countSignUpFlowSignals(code, relativePath));
    recordSourceAudit(summary.recoveryFlowSignals, relativePath, countRecoveryFlowSignals(code, relativePath));
    recordSourceAudit(summary.authSessionSignals, relativePath, signals.authSessionSignalCount);
    recordSourceAudit(summary.authUnauthenticatedBranchSignals, relativePath, countAuthUnauthenticatedBranchSignals(code));
    recordSourceAudit(summary.authLoadingSignals, relativePath, signals.authLoadingSignalCount);
    recordSourceAudit(summary.authProtectedLoadingRenderSignals, relativePath, signals.authProtectedLoadingRenderCount);
    recordSourceAudit(summary.authBlankLoadingRenderSignals, relativePath, signals.authBlankLoadingRenderCount);
    recordSourceAudit(summary.authAnonymousLoadingRedirectSignals, relativePath, signals.authAnonymousLoadingRedirectCount);
    recordSourceAudit(summary.authProtectedUnauthenticatedRenderSignals, relativePath, signals.authProtectedUnauthenticatedRenderCount);
    recordSourceAudit(summary.authErrorSignals, relativePath, countAuthErrorSignals(code));
    recordSourceAudit(summary.authSuccessSignals, relativePath, countAuthSuccessSignals(code));
    recordSourceAudit(summary.authCallbackTokenSignals, relativePath, countAuthCallbackTokenSignals(code, relativePath));
    recordSourceAudit(summary.authCallbackExchangeSignals, relativePath, countAuthCallbackExchangeSignals(code));
    recordSourceAudit(summary.authCallbackExchangeErrorSignals, relativePath, countAuthCallbackExchangeErrorSignals(code));
    recordSourceAudit(summary.authCallbackErrorSignals, relativePath, countAuthCallbackErrorSignals(code, relativePath));
    recordSourceAudit(summary.authCallbackStateSignals, relativePath, countAuthCallbackStateSignals(code));
    recordSourceAudit(summary.authCallbackStateValidationSignals, relativePath, countAuthCallbackStateValidationSignals(code));
    recordSourceAudit(summary.authCallbackStateStorageSignals, relativePath, countAuthCallbackStateStorageSignals(code));
    recordSourceAudit(summary.authCallbackStateStorageClearSignals, relativePath, countAuthCallbackStateStorageClearSignals(code));
    recordSourceAudit(summary.authCallbackUrlScrubSignals, relativePath, countAuthCallbackUrlScrubSignals(code));
    recordSourceAudit(summary.authStorageWrites, relativePath, signals.authStorageWriteCount);
    recordSourceAudit(summary.authStorageClears, relativePath, signals.authStorageClearCount);
    recordSourceAudit(summary.authCookieWrites, relativePath, signals.authCookieWriteCount);
    recordSourceAudit(summary.authCookieClears, relativePath, signals.authCookieClearCount);
    recordSourceAudit(summary.authHeaderWrites, relativePath, signals.authHeaderWriteCount);
    recordSourceAudit(summary.authHeaderClears, relativePath, signals.authHeaderClearCount);
    recordSourceAudit(summary.authCacheClients, relativePath, signals.authCacheClientCount);
    recordSourceAudit(summary.authCacheClears, relativePath, signals.authCacheClearCount);
    recordSourceAudit(summary.authRefreshSignals, relativePath, signals.authRefreshSignalCount);
    recordSourceAudit(summary.authRefreshClears, relativePath, signals.authRefreshClearCount);
    recordSourceAudit(summary.authRealtimeSignals, relativePath, countAuthRealtimeSignals(code));
    recordSourceAudit(summary.authRealtimeClears, relativePath, countAuthRealtimeClearSignals(code));
    recordSourceAudit(summary.authCoordinationSignals, relativePath, countAuthCoordinationSignals(code));
    recordSourceAudit(summary.authCoordinationClears, relativePath, countAuthCoordinationClearSignals(code));
    recordSourceAudit(summary.authGuardSignals, relativePath, signals.authGuardSignalCount);
    recordSourceAudit(summary.authExitSignals, relativePath, signals.authExitSignalCount);
    recordSourceAudit(summary.authSessionTeardownSignals, relativePath, signals.authSessionTeardownSignalCount);
    recordSourceAudit(summary.signInRouteSignals, relativePath, countSignInRouteSignals(code));
    recordSourceAudit(summary.registrationRouteSignals, relativePath, countRegistrationRouteSignals(code));
    recordSourceAudit(summary.recoveryRouteSignals, relativePath, countAuthRecoveryRouteSignals(code));
    recordSourceAudit(summary.accessibilityIssues, relativePath, accessibilityIssueCount);
    recordSourceAudit(
      summary.interactionSafetyIssues,
      relativePath,
      signals.buttonInFormWithoutTypeCount
        + signals.authFormWithoutSubmitCount
        + signals.authInputWithoutNameCount,
    );
    recordSourceAudit(summary.authInputHintIssues, relativePath, authInputHintIssueCount);
  }

  return summary;
}

function auditProjectStyleContracts(projectRoot: string): StyleAuditSummary {
  const styleFiles = collectProjectStyleFiles(projectRoot);
  const summary: StyleAuditSummary = {
    filesChecked: styleFiles.length,
    focusVisibleSignals: createSourceAuditBucket(),
    reducedMotionSignals: createSourceAuditBucket(),
  };

  for (const styleFile of styleFiles) {
    const relativePath = relative(projectRoot, styleFile) || styleFile;
    const css = readFileSync(styleFile, 'utf-8');
    recordSourceAudit(summary.focusVisibleSignals, relativePath, countFocusVisibleSignals(css));
    recordSourceAudit(summary.reducedMotionSignals, relativePath, countReducedMotionSignals(css));
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
  localhostEndpointSignals: SourceAuditBucket;
  placeholderRoutes: SourceAuditBucket;
  protectedSurfaceSignals: SourceAuditBucket;
  authProtectedRedirectSignals: SourceAuditBucket;
  authAnonymousRedirectSignals: SourceAuditBucket;
  authOpenRedirectSignals: SourceAuditBucket;
  authExternalRedirectSignals: SourceAuditBucket;
  authProviderStateSignals: SourceAuditBucket;
  authProviderPkceSignals: SourceAuditBucket;
  authProviderNonceSignals: SourceAuditBucket;
  skipNavSignals: SourceAuditBucket;
  skipNavTargetIds: string[];
  mainLandmarkSignals: SourceAuditBucket;
  mainLandmarkIds: string[];
  authEntrySignals: SourceAuditBucket;
  signInFlowSignals: SourceAuditBucket;
  signUpFlowSignals: SourceAuditBucket;
  recoveryFlowSignals: SourceAuditBucket;
  authSessionSignals: SourceAuditBucket;
  authUnauthenticatedBranchSignals: SourceAuditBucket;
  authLoadingSignals: SourceAuditBucket;
  authProtectedLoadingRenderSignals: SourceAuditBucket;
  authBlankLoadingRenderSignals: SourceAuditBucket;
  authAnonymousLoadingRedirectSignals: SourceAuditBucket;
  authProtectedUnauthenticatedRenderSignals: SourceAuditBucket;
  authErrorSignals: SourceAuditBucket;
  authSuccessSignals: SourceAuditBucket;
  authCallbackTokenSignals: SourceAuditBucket;
  authCallbackExchangeSignals: SourceAuditBucket;
  authCallbackExchangeErrorSignals: SourceAuditBucket;
  authCallbackErrorSignals: SourceAuditBucket;
  authCallbackStateSignals: SourceAuditBucket;
  authCallbackStateValidationSignals: SourceAuditBucket;
  authCallbackStateStorageSignals: SourceAuditBucket;
  authCallbackStateStorageClearSignals: SourceAuditBucket;
  authCallbackUrlScrubSignals: SourceAuditBucket;
  authStorageWrites: SourceAuditBucket;
  authStorageClears: SourceAuditBucket;
  authCookieWrites: SourceAuditBucket;
  authCookieClears: SourceAuditBucket;
  authHeaderWrites: SourceAuditBucket;
  authHeaderClears: SourceAuditBucket;
  authCacheClients: SourceAuditBucket;
  authCacheClears: SourceAuditBucket;
  authRefreshSignals: SourceAuditBucket;
  authRefreshClears: SourceAuditBucket;
  authRealtimeSignals: SourceAuditBucket;
  authRealtimeClears: SourceAuditBucket;
  authCoordinationSignals: SourceAuditBucket;
  authCoordinationClears: SourceAuditBucket;
  authGuardSignals: SourceAuditBucket;
  authExitSignals: SourceAuditBucket;
  authSessionTeardownSignals: SourceAuditBucket;
  signInRouteSignals: SourceAuditBucket;
  registrationRouteSignals: SourceAuditBucket;
  recoveryRouteSignals: SourceAuditBucket;
  accessibilityIssues: SourceAuditBucket;
  interactionSafetyIssues: SourceAuditBucket;
  authInputHintIssues: SourceAuditBucket;
}

interface StyleAuditSummary {
  filesChecked: number;
  focusVisibleSignals: SourceAuditBucket;
  reducedMotionSignals: SourceAuditBucket;
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

function isRecoveryLikeRoute(route: string): boolean {
  return /(?:^|\/)(?:forgot-password|reset-password|password-reset|recover|recovery)(?:\/|$)/i.test(route);
}

function isSignInLikeRoute(route: string): boolean {
  return /(?:^|\/)(?:auth|login|log-in|signin|sign-in)(?:\/|$)/i.test(route);
}

function isRegistrationLikeRoute(route: string): boolean {
  return /(?:^|\/)(?:signup|sign-up|register)(?:\/|$)/i.test(route);
}

function isAnonymousEntryLikeRoute(route: string): boolean {
  return route === '/' || /(?:^|\/)(?:auth|login|log-in|signin|sign-in|signup|sign-up|register)(?:\/|$)/i.test(route);
}

function isProtectedLikeRoute(route: string): boolean {
  return /(?:^|\/)(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/|$)/i.test(route);
}

function essenceRequiresFocusVisible(essence: EssenceFile | null): boolean {
  if (!essence || !('dna' in essence)) return false;
  const dna = (essence as { dna?: unknown }).dna;
  if (!dna || typeof dna !== 'object') return false;
  const accessibility = (dna as { accessibility?: unknown }).accessibility;
  if (!accessibility || typeof accessibility !== 'object') return false;
  return (accessibility as { focus_visible?: unknown }).focus_visible === true;
}

function essenceRequiresReducedMotion(essence: EssenceFile | null): boolean {
  if (!essence || !('dna' in essence)) return false;
  const dna = (essence as { dna?: unknown }).dna;
  if (!dna || typeof dna !== 'object') return false;
  const motion = (dna as { motion?: unknown }).motion;
  if (!motion || typeof motion !== 'object') return false;
  return (motion as { reduce_motion?: unknown }).reduce_motion === true;
}

function essenceRequiresSkipNav(essence: EssenceFile | null): boolean {
  if (!essence || !('dna' in essence)) return false;
  const dna = (essence as { dna?: unknown }).dna;
  if (!dna || typeof dna !== 'object') return false;
  const accessibility = (dna as { accessibility?: unknown }).accessibility;
  if (!accessibility || typeof accessibility !== 'object') return false;
  return (accessibility as { skip_nav?: unknown }).skip_nav === true;
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

function extractFailedRouteDocuments(runtimeAudit: RuntimeAudit): string[] {
  return runtimeAudit.failures
    .filter((failure) => failure.startsWith('route-document-failed:'))
    .map((failure) => normalizeRouteHint(failure.slice('route-document-failed:'.length)))
    .filter(Boolean);
}

function extractFailedRouteDocumentHardening(runtimeAudit: RuntimeAudit): string[] {
  return runtimeAudit.failures
    .filter((failure) => failure.startsWith('route-document-hardening-failed:'))
    .map((failure) => normalizeRouteHint(failure.slice('route-document-hardening-failed:'.length)))
    .filter(Boolean);
}

function appendRuntimeAuditFindings(
  findings: VerificationFinding[],
  runtimeAudit: RuntimeAudit,
  projectRoot: string,
  topology?: TopologySummary,
): void {
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

  if (runtimeAudit.inlineEventHandlerCount > 0) {
    findings.push(makeFinding({
      id: 'runtime-inline-event-handlers-present',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'Inline DOM event handler attributes were detected in the built root document.',
      evidence: [indexPath, `Inline event handler attributes: ${runtimeAudit.inlineEventHandlerCount}`],
      suggestedFix: 'Remove inline `onclick`/`onload`-style handlers from built HTML and route behavior through the reviewed application bundle so CSP remains practical.',
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

  if (runtimeAudit.externalScriptsWithIntegrityMissingCrossoriginCount > 0) {
    findings.push(makeFinding({
      id: 'runtime-external-scripts-crossorigin-missing',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'Remote script tags declare Subresource Integrity without a matching `crossorigin` attribute.',
      evidence: [indexPath, `Remote scripts with integrity but missing crossorigin: ${runtimeAudit.externalScriptsWithIntegrityMissingCrossoriginCount}`],
      suggestedFix: 'Add a reviewed `crossorigin` attribute alongside script integrity metadata so SRI works consistently for remote script fetches.',
    }));
  }

  if (runtimeAudit.externalScriptsWithInsecureTransportCount > 0) {
    findings.push(makeFinding({
      id: 'runtime-external-scripts-insecure-transport',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'Remote script tags were detected over plain HTTP.',
      evidence: [indexPath, `Remote scripts over insecure transport: ${runtimeAudit.externalScriptsWithInsecureTransportCount}`],
      suggestedFix: 'Serve remote scripts over HTTPS with integrity/crossorigin metadata, or move them into the trusted build pipeline.',
    }));
  }

  if (runtimeAudit.externalStylesheetsWithoutIntegrityCount > 0) {
    findings.push(makeFinding({
      id: 'runtime-external-stylesheets-without-integrity',
      category: 'Security Hygiene',
      severity: 'info',
      message: 'Remote stylesheet links were detected without Subresource Integrity metadata.',
      evidence: [indexPath, `Remote stylesheets missing integrity: ${runtimeAudit.externalStylesheetsWithoutIntegrityCount}`],
      suggestedFix: 'Pin remote stylesheet links with integrity/crossorigin metadata or serve the stylesheet through the trusted build pipeline.',
    }));
  }

  if (runtimeAudit.externalStylesheetsWithIntegrityMissingCrossoriginCount > 0) {
    findings.push(makeFinding({
      id: 'runtime-external-stylesheets-crossorigin-missing',
      category: 'Security Hygiene',
      severity: 'info',
      message: 'Remote stylesheet links declare Subresource Integrity without a matching `crossorigin` attribute.',
      evidence: [indexPath, `Remote stylesheets with integrity but missing crossorigin: ${runtimeAudit.externalStylesheetsWithIntegrityMissingCrossoriginCount}`],
      suggestedFix: 'Add a reviewed `crossorigin` attribute alongside stylesheet integrity metadata so SRI works consistently for remote stylesheet fetches.',
    }));
  }

  if (runtimeAudit.externalStylesheetsWithInsecureTransportCount > 0) {
    findings.push(makeFinding({
      id: 'runtime-external-stylesheets-insecure-transport',
      category: 'Security Hygiene',
      severity: 'info',
      message: 'Remote stylesheet links were detected over plain HTTP.',
      evidence: [indexPath, `Remote stylesheets over insecure transport: ${runtimeAudit.externalStylesheetsWithInsecureTransportCount}`],
      suggestedFix: 'Serve remote stylesheets over HTTPS with integrity/crossorigin metadata, or move them into the trusted build pipeline.',
    }));
  }

  if (runtimeAudit.externalMediaSourcesWithInsecureTransportCount > 0) {
    findings.push(makeFinding({
      id: 'runtime-external-media-insecure-transport',
      category: 'Security Hygiene',
      severity: 'info',
      message: 'Remote image or media sources were detected over plain HTTP in the built root document.',
      evidence: [indexPath, `Remote media sources over insecure transport: ${runtimeAudit.externalMediaSourcesWithInsecureTransportCount}`],
      suggestedFix: 'Serve remote image and media sources over HTTPS or move them behind a reviewed trusted asset boundary before shipping.',
    }));
  }

  if (runtimeAudit.externalBlankLinksWithoutRelCount > 0) {
    findings.push(makeFinding({
      id: 'runtime-external-links-noopener-missing',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'External links in the built root document open new tabs without `rel=\"noopener noreferrer\"` protections.',
      evidence: [indexPath, `External target=\"_blank\" links missing rel protections: ${runtimeAudit.externalBlankLinksWithoutRelCount}`],
      suggestedFix: 'Add `rel=\"noopener noreferrer\"` to built external links that open a new tab so opener access does not survive into production HTML.',
    }));
  }

  if (runtimeAudit.externalIframesWithoutSandboxCount > 0) {
    findings.push(makeFinding({
      id: 'runtime-external-iframes-sandbox-missing',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'External iframe embeds in the built root document are missing a `sandbox` attribute.',
      evidence: [indexPath, `External iframes without sandbox: ${runtimeAudit.externalIframesWithoutSandboxCount}`],
      suggestedFix: 'Add the narrowest reviewed sandbox policy to external iframes before shipping built HTML.',
    }));
  }

  if (runtimeAudit.externalIframesWithInsecureTransportCount > 0) {
    findings.push(makeFinding({
      id: 'runtime-external-iframes-insecure-transport',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'External iframe embeds in the built root document are loaded over plain HTTP.',
      evidence: [indexPath, `External iframes over insecure transport: ${runtimeAudit.externalIframesWithInsecureTransportCount}`],
      suggestedFix: 'Serve embedded iframes over HTTPS or move the integration behind a reviewed trusted boundary before shipping built HTML.',
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

  if (runtimeAudit.jsInsecureTransportSignalCount > 0) {
    findings.push(makeFinding({
      id: 'runtime-js-insecure-transport-signals',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'Built JavaScript includes insecure transport or localhost-style development endpoint markers.',
      evidence: [distPath, `Insecure or localhost transport signals in built JS: ${runtimeAudit.jsInsecureTransportSignalCount}`],
      suggestedFix: 'Remove plain HTTP, ws://, and localhost-style endpoints from shipped bundles; prefer HTTPS/WSS and reviewed environment-backed URLs or route transport through a trusted server boundary.',
    }));
  }

  if (runtimeAudit.jsSecretSignalCount > 0) {
    findings.push(makeFinding({
      id: 'runtime-js-secret-signals',
      category: 'Security Hygiene',
      severity: 'error',
      message: 'Built JavaScript includes secret-like markers such as service-role keys, live secret keys, or private-key material.',
      evidence: [distPath, `Secret-like signals in built JS: ${runtimeAudit.jsSecretSignalCount}`],
      suggestedFix: 'Remove server-only secrets from client bundles immediately, rotate any exposed credentials, and keep privileged keys behind a trusted server boundary.',
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

  if (runtimeAudit.routeDocumentsChecked > 0 && runtimeAudit.routeDocumentsHardenedCount < Math.min(2, runtimeAudit.routeDocumentsChecked)) {
    findings.push(makeFinding({
      id: 'runtime-route-document-hardening-missing',
      category: 'Document Hardening',
      severity: 'warn',
      message: 'Too few reviewed routes preserved a fully hardened document shell.',
      evidence: [
        `Hardened route documents: ${runtimeAudit.routeDocumentsHardenedCount}/${runtimeAudit.routeDocumentsChecked}`,
        ...extractFailedRouteDocumentHardening(runtimeAudit),
      ],
      suggestedFix: 'Keep title, lang, viewport, and charset metadata intact for every reviewed route document, not just the root entry shell.',
    }));
  } else if (runtimeAudit.routeDocumentsChecked > 0 && runtimeAudit.routeDocumentsHardenedCount < runtimeAudit.routeDocumentsChecked) {
    findings.push(makeFinding({
      id: 'runtime-route-document-hardening-partial',
      category: 'Document Hardening',
      severity: 'info',
      message: 'Some reviewed routes preserved a hardened document shell, but at least one still dropped critical document metadata.',
      evidence: [
        `Hardened route documents: ${runtimeAudit.routeDocumentsHardenedCount}/${runtimeAudit.routeDocumentsChecked}`,
        ...extractFailedRouteDocumentHardening(runtimeAudit),
      ],
      suggestedFix: 'Make sure every reviewed route document keeps title, lang, viewport, and charset metadata intact across route-level rendering.',
    }));
  }

  if (topology?.hasAuthFeature) {
    const failedRouteDocuments = new Set(extractFailedRouteDocuments(runtimeAudit));
    const failedGatewayRoutes = topology.gatewayRoutes.filter((route) => failedRouteDocuments.has(normalizeRouteHint(route)));
    const failedPrimaryRoutes = topology.primaryRoutes.filter((route) => failedRouteDocuments.has(normalizeRouteHint(route)));

    if (failedGatewayRoutes.length > 0) {
      findings.push(makeFinding({
        id: 'runtime-auth-gateway-routes-failed',
        category: 'Runtime Verification',
        severity: 'warn',
        message: 'One or more gateway auth routes did not return a valid root document from the built output.',
        evidence: [
          `Gateway routes: ${topology.gatewayRoutes.join(', ') || 'none'}`,
          `Failed gateway routes: ${failedGatewayRoutes.join(', ')}`,
        ],
        suggestedFix: 'Ensure login, registration, and recovery routes resolve to the same usable root document contract as the rest of the app build.',
      }));
    }

    if (failedPrimaryRoutes.length > 0) {
      findings.push(makeFinding({
        id: 'runtime-auth-primary-routes-failed',
        category: 'Runtime Verification',
        severity: 'warn',
        message: 'One or more primary authenticated routes did not return a valid root document from the built output.',
        evidence: [
          `Primary routes: ${topology.primaryRoutes.join(', ') || 'none'}`,
          `Failed primary routes: ${failedPrimaryRoutes.join(', ')}`,
        ],
        suggestedFix: 'Ensure authenticated app routes like `/dashboard` or `/app` survive the build output and resolve to a valid root document.',
      }));
    }
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
      suggestedFix: 'Remove dangerous HTML writes, client-exposed secret references, localhost/dev endpoints, wildcard postMessage targets, dynamic code execution, and unsafe external link patterns from source before shipping.',
    }));
  }

  if (sourceAudit.localhostEndpointSignals.count > 0) {
    findings.push(makeFinding({
      id: 'source-localhost-endpoints-present',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Source files still reference localhost-style endpoints that will not survive a real production deployment.',
      evidence: buildSourceAuditEvidence(sourceAudit, sourceAudit.localhostEndpointSignals, 'Localhost endpoint signals'),
      suggestedFix: 'Replace localhost, 127.0.0.1, or 0.0.0.0 client endpoints with reviewed environment-backed URLs or route them behind a trusted server boundary before shipping.',
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
  if (
    topology.hasAuthFeature
    && sourceAudit.authStorageWrites.count > 0
    && sourceAudit.authExitSignals.count > 0
    && sourceAudit.authStorageClears.count === 0
  ) {
    findings.push(makeFinding({
      id: 'source-auth-storage-teardown-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Auth exit flows exist, but the source tree does not show client-managed auth storage being cleared during sign-out.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Auth storage write files: ${sourceAudit.authStorageWrites.files.join(', ') || 'none'}`,
        `Auth exit files: ${sourceAudit.authExitSignals.files.join(', ') || 'none'}`,
        'Auth storage clear files: none',
      ],
      suggestedFix: 'If auth data is ever stored in browser storage, remove those auth/session keys during sign-out before returning users to an anonymous route.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAudit.authCookieWrites.count > 0
    && sourceAudit.authExitSignals.count > 0
    && sourceAudit.authCookieClears.count === 0
  ) {
    findings.push(makeFinding({
      id: 'source-auth-cookie-teardown-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Auth exit flows exist, but the source tree does not show client-managed auth cookies being cleared during sign-out.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Auth cookie write files: ${sourceAudit.authCookieWrites.files.join(', ') || 'none'}`,
        `Auth exit files: ${sourceAudit.authExitSignals.files.join(', ') || 'none'}`,
        'Auth cookie clear files: none',
      ],
      suggestedFix: 'If auth cookies are issued from reviewed source surfaces, explicitly expire or delete them during sign-out before returning users to an anonymous route.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAudit.authHeaderWrites.count > 0
    && sourceAudit.authExitSignals.count > 0
    && sourceAudit.authHeaderClears.count === 0
  ) {
    findings.push(makeFinding({
      id: 'source-auth-header-teardown-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Auth exit flows exist, but the source tree does not show client-managed auth headers being cleared during sign-out.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Auth header write files: ${sourceAudit.authHeaderWrites.files.join(', ') || 'none'}`,
        `Auth exit files: ${sourceAudit.authExitSignals.files.join(', ') || 'none'}`,
        'Auth header clear files: none',
      ],
      suggestedFix: 'If reviewed source code constructs auth-like authorization headers, explicitly delete or reset those header values during sign-out before returning users to an anonymous route.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAudit.authCacheClients.count > 0
    && sourceAudit.authExitSignals.count > 0
    && sourceAudit.authCacheClears.count === 0
    && (
      sourceAuditBucketsOverlap(sourceAudit.authCacheClients, sourceAudit.protectedSurfaceSignals)
      || sourceAuditBucketsOverlap(sourceAudit.authCacheClients, sourceAudit.authSessionSignals)
    )
  ) {
    findings.push(makeFinding({
      id: 'source-auth-cache-teardown-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Auth exit flows exist, but the source tree does not show client-side data caches being cleared during sign-out.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Auth cache client files: ${sourceAudit.authCacheClients.files.join(', ') || 'none'}`,
        `Auth exit files: ${sourceAudit.authExitSignals.files.join(', ') || 'none'}`,
        'Auth cache clear files: none',
      ],
      suggestedFix: 'If protected data is cached in query clients or client data stores, clear or reset those caches during sign-out before redirecting users back to an anonymous route.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAudit.authRefreshSignals.count > 0
    && sourceAudit.authExitSignals.count > 0
    && !sourceAuditBucketsOverlap(sourceAudit.authRefreshSignals, sourceAudit.authRefreshClears)
  ) {
    findings.push(makeFinding({
      id: 'source-auth-refresh-teardown-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Auth exit flows exist, but the source tree does not show background auth refresh timers or subscriptions being torn down during sign-out.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Auth refresh files: ${sourceAudit.authRefreshSignals.files.join(', ') || 'none'}`,
        `Auth exit files: ${sourceAudit.authExitSignals.files.join(', ') || 'none'}`,
        `Auth refresh clear files: ${sourceAudit.authRefreshClears.files.join(', ') || 'none'}`,
      ],
      suggestedFix: 'If auth/session refresh runs on timers or subscriptions, clear those intervals, timeouts, or listeners during sign-out before returning users to an anonymous route.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAudit.authRealtimeSignals.count > 0
    && sourceAudit.authExitSignals.count > 0
    && !sourceAuditBucketsOverlap(sourceAudit.authRealtimeSignals, sourceAudit.authRealtimeClears)
    && (
      sourceAuditBucketsOverlap(sourceAudit.authRealtimeSignals, sourceAudit.protectedSurfaceSignals)
      || sourceAuditBucketsOverlap(sourceAudit.authRealtimeSignals, sourceAudit.authSessionSignals)
    )
  ) {
    findings.push(makeFinding({
      id: 'source-auth-realtime-teardown-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Auth exit flows exist, but the source tree does not show realtime channels or sockets being torn down during sign-out.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Auth realtime files: ${sourceAudit.authRealtimeSignals.files.join(', ') || 'none'}`,
        `Auth exit files: ${sourceAudit.authExitSignals.files.join(', ') || 'none'}`,
        `Auth realtime clear files: ${sourceAudit.authRealtimeClears.files.join(', ') || 'none'}`,
      ],
      suggestedFix: 'If protected data arrives over websockets, SSE, or realtime channels, close or unsubscribe those connections during sign-out before returning users to an anonymous route.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAudit.authCoordinationSignals.count > 0
    && sourceAudit.authExitSignals.count > 0
    && !sourceAuditBucketsOverlap(sourceAudit.authCoordinationSignals, sourceAudit.authCoordinationClears)
    && (
      sourceAuditBucketsOverlap(sourceAudit.authCoordinationSignals, sourceAudit.protectedSurfaceSignals)
      || sourceAuditBucketsOverlap(sourceAudit.authCoordinationSignals, sourceAudit.authSessionSignals)
    )
  ) {
    findings.push(makeFinding({
      id: 'source-auth-coordination-teardown-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Auth exit flows exist, but the source tree does not show cross-tab auth coordination channels or storage listeners being torn down during sign-out.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Auth coordination files: ${sourceAudit.authCoordinationSignals.files.join(', ') || 'none'}`,
        `Auth exit files: ${sourceAudit.authExitSignals.files.join(', ') || 'none'}`,
        `Auth coordination clear files: ${sourceAudit.authCoordinationClears.files.join(', ') || 'none'}`,
      ],
      suggestedFix: 'If auth state is coordinated across tabs with BroadcastChannel or storage listeners, close those channels and remove those listeners during sign-out before returning users to an anonymous route.',
    }));
  }

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

  if (
    topology.hasAuthFeature
    && topology.primaryRoutes.length > 0
    && sourceAudit.protectedSurfaceSignals.count > 0
    && sourceAudit.authGuardSignals.count > 0
    && !sourceAuditBucketsOverlap(sourceAudit.protectedSurfaceSignals, sourceAudit.authGuardSignals)
    && !sourceAuditBucketsOverlap(sourceAudit.protectedSurfaceSignals, sourceAudit.authSessionSignals)
  ) {
    findings.push(makeFinding({
      id: 'source-protected-surface-auth-checks-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Files that expose protected app surfaces do not appear to co-locate session checks or guard behavior.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Protected surface files: ${sourceAudit.protectedSurfaceSignals.files.join(', ') || 'none'}`,
        `Auth guard files: ${sourceAudit.authGuardSignals.files.join(', ') || 'none'}`,
        `Auth session files: ${sourceAudit.authSessionSignals.files.join(', ') || 'none'}`,
        `Primary routes: ${topology.primaryRoutes.join(', ') || 'none'}`,
      ],
      suggestedFix: 'Keep protected-route components, layouts, or loaders close to the session check or guard that protects them so authenticated surfaces do not look accidentally public.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAudit.authProtectedRedirectSignals.count > 0
    && sourceAuditBucketsOverlap(sourceAudit.authProtectedRedirectSignals, sourceAudit.authGuardSignals)
    && !sourceAuditBucketsOverlap(sourceAudit.authProtectedRedirectSignals, sourceAudit.authEntrySignals)
  ) {
    findings.push(makeFinding({
      id: 'source-auth-guard-protected-redirect',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Auth guard logic appears to redirect users toward protected destinations instead of anonymous entry routes.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Protected redirect files: ${sourceAudit.authProtectedRedirectSignals.files.join(', ') || 'none'}`,
        `Auth guard files: ${sourceAudit.authGuardSignals.files.join(', ') || 'none'}`,
        `Gateway routes: ${topology.gatewayRoutes.join(', ') || 'none'}`,
      ],
      suggestedFix: 'Send unauthenticated guard redirects to `/`, `/login`, `/register`, or another reviewed gateway route, and keep redirects to protected destinations for post-auth success flows only.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAudit.authSessionSignals.count > 0
    && !sourceAuditBucketsOverlap(sourceAudit.authSessionSignals, sourceAudit.authLoadingSignals)
  ) {
    findings.push(makeFinding({
      id: 'source-auth-loading-signals-missing',
      category: 'Source Audit',
      severity: 'info',
      message: 'Source files reference auth/session state but do not show a clear loading or pending state while session resolution happens.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Auth/session signals: ${sourceAudit.authSessionSignals.count}`,
        `Auth loading signals: ${sourceAudit.authLoadingSignals.count}`,
        `Session files: ${sourceAudit.authSessionSignals.files.join(', ') || 'none'}`,
        `Loading files: ${sourceAudit.authLoadingSignals.files.join(', ') || 'none'}`,
      ],
      suggestedFix: 'When auth or session state resolves asynchronously, render an explicit loading, skeleton, suspense fallback, or pending state before redirecting or rendering protected content.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAuditBucketsOverlap(sourceAudit.authSessionSignals, sourceAudit.protectedSurfaceSignals)
    && sourceAuditBucketsOverlap(sourceAudit.authSessionSignals, sourceAudit.authLoadingSignals)
    && sourceAudit.authProtectedLoadingRenderSignals.count > 0
  ) {
    findings.push(makeFinding({
      id: 'source-auth-loading-protected-render',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Protected source surfaces show a loading branch, but that branch still appears to render a protected destination while session resolution is pending.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Protected session files: ${sourceAudit.authSessionSignals.files.join(', ') || 'none'}`,
        `Loading files: ${sourceAudit.authLoadingSignals.files.join(', ') || 'none'}`,
        `Protected loading render files: ${sourceAudit.authProtectedLoadingRenderSignals.files.join(', ') || 'none'}`,
      ],
      suggestedFix: 'While auth/session state is loading, render a neutral spinner, skeleton, suspense fallback, or guard boundary instead of returning a dashboard/app shell before the session is confirmed.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAudit.authSessionSignals.count > 0
    && sourceAuditBucketsOverlap(sourceAudit.authSessionSignals, sourceAudit.authLoadingSignals)
    && sourceAudit.authBlankLoadingRenderSignals.count > 0
  ) {
    findings.push(makeFinding({
      id: 'source-auth-loading-blank-render',
      category: 'Source Audit',
      severity: 'info',
      message: 'Auth/session loading branches exist, but some of them return nothing instead of an explicit pending boundary.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Session files: ${sourceAudit.authSessionSignals.files.join(', ') || 'none'}`,
        `Loading files: ${sourceAudit.authLoadingSignals.files.join(', ') || 'none'}`,
        `Blank loading files: ${sourceAudit.authBlankLoadingRenderSignals.files.join(', ') || 'none'}`,
      ],
      suggestedFix: 'When auth/session state is loading, render a spinner, skeleton, suspense fallback, or another explicit pending UI instead of returning `null` or an empty fragment.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAudit.authSessionSignals.count > 0
    && sourceAuditBucketsOverlap(sourceAudit.authSessionSignals, sourceAudit.authLoadingSignals)
    && sourceAudit.authAnonymousLoadingRedirectSignals.count > 0
  ) {
    findings.push(makeFinding({
      id: 'source-auth-loading-anonymous-redirect',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Auth/session loading branches redirect users to anonymous routes before session resolution finishes.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Session files: ${sourceAudit.authSessionSignals.files.join(', ') || 'none'}`,
        `Loading files: ${sourceAudit.authLoadingSignals.files.join(', ') || 'none'}`,
        `Anonymous loading redirect files: ${sourceAudit.authAnonymousLoadingRedirectSignals.files.join(', ') || 'none'}`,
      ],
      suggestedFix: 'Do not redirect to `/login`, `/`, or another anonymous route while session state is still loading. Render a pending boundary first, then redirect only after the session resolves as unauthenticated.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAuditBucketsOverlap(sourceAudit.authSessionSignals, sourceAudit.protectedSurfaceSignals)
    && sourceAuditBucketsOverlap(sourceAudit.authSessionSignals, sourceAudit.authUnauthenticatedBranchSignals)
    && sourceAudit.authProtectedUnauthenticatedRenderSignals.count > 0
  ) {
    findings.push(makeFinding({
      id: 'source-auth-session-loss-protected-render',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Protected source surfaces branch on auth loss but still appear to render a protected destination in the unauthenticated branch.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Protected session files: ${sourceAudit.authSessionSignals.files.join(', ') || 'none'}`,
        `Unauthenticated branch files: ${sourceAudit.authUnauthenticatedBranchSignals.files.join(', ') || 'none'}`,
        `Protected unauthenticated render files: ${sourceAudit.authProtectedUnauthenticatedRenderSignals.files.join(', ') || 'none'}`,
      ],
      suggestedFix: 'When a protected surface detects a null or unauthenticated session, redirect to a reviewed anonymous route or render a neutral guard boundary instead of returning a dashboard/app shell.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAuditBucketsOverlap(sourceAudit.authSessionSignals, sourceAudit.protectedSurfaceSignals)
    && !sourceAuditBucketsOverlap(sourceAudit.authSessionSignals, sourceAudit.authUnauthenticatedBranchSignals)
  ) {
    findings.push(makeFinding({
      id: 'source-auth-session-loss-handling-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Protected source surfaces read auth/session state but do not show an explicit unauthenticated branch when session resolution fails or the user signs out.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Protected session files: ${sourceAudit.authSessionSignals.files.join(', ') || 'none'}`,
        `Unauthenticated branch files: ${sourceAudit.authUnauthenticatedBranchSignals.files.join(', ') || 'none'}`,
        `Auth guard files: ${sourceAudit.authGuardSignals.files.join(', ') || 'none'}`,
      ],
      suggestedFix: 'When protected surfaces read session state directly, branch on unauthenticated/null-session cases and redirect to a reviewed anonymous route or return a guard boundary before protected content renders.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAuditBucketsOverlap(sourceAudit.authSessionSignals, sourceAudit.protectedSurfaceSignals)
    && sourceAuditBucketsOverlap(sourceAudit.authSessionSignals, sourceAudit.authUnauthenticatedBranchSignals)
    && !sourceAuditBucketsOverlap(sourceAudit.authSessionSignals, sourceAudit.authAnonymousRedirectSignals)
  ) {
    findings.push(makeFinding({
      id: 'source-auth-session-loss-redirect-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Protected source surfaces branch on auth loss but do not show an obvious redirect back to an anonymous route.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Protected session files: ${sourceAudit.authSessionSignals.files.join(', ') || 'none'}`,
        `Unauthenticated branch files: ${sourceAudit.authUnauthenticatedBranchSignals.files.join(', ') || 'none'}`,
        `Anonymous redirect files: ${sourceAudit.authAnonymousRedirectSignals.files.join(', ') || 'none'}`,
      ],
      suggestedFix: 'When a protected surface detects a null or unauthenticated session, redirect users to `/`, `/login`, `/register`, or another reviewed anonymous route instead of returning `null` or leaving the protected shell blank.',
    }));
  }

  if (
    topology.hasAuthFeature
    && (sourceAudit.authSessionSignals.count > 0 || sourceAudit.authEntrySignals.count > 0)
    && sourceAudit.authErrorSignals.count === 0
  ) {
    findings.push(makeFinding({
      id: 'source-auth-error-signals-missing',
      category: 'Source Audit',
      severity: 'info',
      message: 'Authentication surfaces do not show an obvious error or failure state for rejected sign-in, session refresh, or recovery flows.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Auth/session signals: ${sourceAudit.authSessionSignals.count}`,
        `Auth entry signals: ${sourceAudit.authEntrySignals.count}`,
        'Auth error signals: 0',
        `Session files: ${sourceAudit.authSessionSignals.files.join(', ') || 'none'}`,
        `Entry files: ${sourceAudit.authEntrySignals.files.join(', ') || 'none'}`,
      ],
      suggestedFix: 'Expose a reviewed error state for failed sign-in, session refresh, or recovery paths with inline feedback, alert messaging, or another explicit failure affordance.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAudit.recoveryFlowSignals.count > 0
    && !sourceAuditBucketsOverlap(sourceAudit.recoveryFlowSignals, sourceAudit.authSuccessSignals)
  ) {
    findings.push(makeFinding({
      id: 'source-auth-recovery-success-missing',
      category: 'Source Audit',
      severity: 'info',
      message: 'Recovery flows exist, but the source tree does not show an obvious success or confirmation state after a reset request completes.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Recovery flow signals: ${sourceAudit.recoveryFlowSignals.count}`,
        'Auth success signals: 0',
        `Recovery files: ${sourceAudit.recoveryFlowSignals.files.join(', ') || 'none'}`,
      ],
      suggestedFix: 'After password-reset or recovery submission succeeds, show a reviewed confirmation state such as "check your email", "reset link sent", or another explicit success affordance.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAudit.signUpFlowSignals.count > 0
    && !sourceAuditBucketsOverlap(sourceAudit.signUpFlowSignals, sourceAudit.authProtectedRedirectSignals)
    && !sourceAuditBucketsOverlap(sourceAudit.signUpFlowSignals, sourceAudit.authSuccessSignals)
  ) {
    findings.push(makeFinding({
      id: 'source-auth-registration-success-missing',
      category: 'Source Audit',
      severity: 'info',
      message: 'Registration flows exist, but the source tree does not show either a reviewed post-auth transition or an explicit success/verification state.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Registration flow signals: ${sourceAudit.signUpFlowSignals.count}`,
        `Protected auth redirects: ${sourceAudit.authProtectedRedirectSignals.count}`,
        `Auth success signals: ${sourceAudit.authSuccessSignals.count}`,
        `Registration files: ${sourceAudit.signUpFlowSignals.files.join(', ') || 'none'}`,
      ],
      suggestedFix: 'After registration succeeds, either navigate users into a reviewed protected route like `/dashboard` or show an explicit success state such as "account created" or "check your email" before the next auth step.',
    }));
  }

  if (
    topology.hasAuthFeature
    && (sourceAudit.authCallbackTokenSignals.count > 0 || sourceAudit.authCallbackStateSignals.count > 0)
    && !sourceAuditBucketsOverlap(sourceAudit.authCallbackTokenSignals, sourceAudit.authProtectedRedirectSignals)
    && !sourceAuditBucketsOverlap(sourceAudit.authCallbackTokenSignals, sourceAudit.authSuccessSignals)
    && !sourceAuditBucketsOverlap(sourceAudit.authCallbackStateSignals, sourceAudit.authProtectedRedirectSignals)
    && !sourceAuditBucketsOverlap(sourceAudit.authCallbackStateSignals, sourceAudit.authSuccessSignals)
  ) {
    findings.push(makeFinding({
      id: 'source-auth-callback-success-missing',
      category: 'Source Audit',
      severity: 'info',
      message: 'Auth callback handling exists, but the source tree does not show either a reviewed protected transition or an explicit success state after callback exchange completes.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Auth callback token files: ${sourceAudit.authCallbackTokenSignals.files.join(', ') || 'none'}`,
        `Auth callback state files: ${sourceAudit.authCallbackStateSignals.files.join(', ') || 'none'}`,
        `Protected auth redirects: ${sourceAudit.authProtectedRedirectSignals.count}`,
        `Auth success signals: ${sourceAudit.authSuccessSignals.count}`,
      ],
      suggestedFix: 'After callback validation or code exchange succeeds, either navigate users into a reviewed protected route like `/dashboard` or show an explicit success/verification state before the next auth step.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAudit.authCallbackExchangeSignals.count > 0
    && !sourceAuditBucketsOverlap(sourceAudit.authCallbackExchangeSignals, sourceAudit.authCallbackExchangeErrorSignals)
  ) {
    findings.push(makeFinding({
      id: 'source-auth-callback-exchange-error-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Auth callback exchange logic exists, but the source tree does not show explicit failure handling if the code/session exchange rejects.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Auth callback exchange files: ${sourceAudit.authCallbackExchangeSignals.files.join(', ') || 'none'}`,
        `Callback exchange error-handling files: ${sourceAudit.authCallbackExchangeErrorSignals.files.join(', ') || 'none'}`,
      ],
      suggestedFix: 'Wrap callback code/session exchange in reviewed catch handling or explicit exchange-error state so failed callback completion does not strand users on an indefinite pending path.',
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

  if (
    topology.hasAuthFeature
    && topology.hasAnonymousEntryRoute
    && sourceAudit.authExitSignals.count > 0
    && !sourceAuditBucketsOverlap(sourceAudit.authExitSignals, sourceAudit.authAnonymousRedirectSignals)
  ) {
    findings.push(makeFinding({
      id: 'source-auth-exit-redirect-missing',
      category: 'Source Audit',
      severity: 'info',
      message: 'Authentication exit flows do not show an obvious redirect back to an anonymous entry route.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Auth exit files: ${sourceAudit.authExitSignals.files.join(', ') || 'none'}`,
        `Anonymous redirect files: ${sourceAudit.authAnonymousRedirectSignals.files.join(', ') || 'none'}`,
        `Gateway routes: ${topology.gatewayRoutes.join(', ') || 'none'}`,
      ],
      suggestedFix: 'After sign-out or session exit, redirect users back to `/`, `/login`, `/register`, or another reviewed anonymous entry route so protected shells do not linger after logout.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAudit.authExitSignals.count > 0
    && !sourceAuditBucketsOverlap(sourceAudit.authExitSignals, sourceAudit.authSessionTeardownSignals)
  ) {
    findings.push(makeFinding({
      id: 'source-auth-exit-teardown-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Authentication exit flows exist, but the source tree does not show an obvious session teardown or sign-out boundary.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Auth exit files: ${sourceAudit.authExitSignals.files.join(', ') || 'none'}`,
        `Session teardown files: ${sourceAudit.authSessionTeardownSignals.files.join(', ') || 'none'}`,
      ],
      suggestedFix: 'Before redirecting users out of the protected shell, explicitly sign out or invalidate the reviewed session state instead of relying on navigation alone.',
    }));
  }

  if (sourceAudit.authOpenRedirectSignals.count > 0) {
    findings.push(makeFinding({
      id: 'source-auth-open-redirect-risk',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Source files appear to trust next/returnTo-style redirect parameters during auth or route-transition flows.',
      evidence: buildSourceAuditEvidence(sourceAudit, sourceAudit.authOpenRedirectSignals, 'Auth/query redirect signals'),
      suggestedFix: 'Resolve post-auth or route-transition redirects through a reviewed allowlist of internal routes instead of redirecting directly from raw `next`, `returnTo`, `callbackUrl`, or similar query parameters.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAudit.authExternalRedirectSignals.count > 0
    && (
      sourceAuditBucketsOverlap(sourceAudit.authExternalRedirectSignals, sourceAudit.authEntrySignals)
      || sourceAuditBucketsOverlap(sourceAudit.authExternalRedirectSignals, sourceAudit.signInFlowSignals)
      || sourceAuditBucketsOverlap(sourceAudit.authExternalRedirectSignals, sourceAudit.signUpFlowSignals)
      || sourceAuditBucketsOverlap(sourceAudit.authExternalRedirectSignals, sourceAudit.recoveryFlowSignals)
      || sourceAuditBucketsOverlap(sourceAudit.authExternalRedirectSignals, sourceAudit.authExitSignals)
    )
  ) {
    findings.push(makeFinding({
      id: 'source-auth-external-redirect-risk',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Source files appear to redirect auth-related flows directly to external URLs.',
      evidence: buildSourceAuditEvidence(sourceAudit, sourceAudit.authExternalRedirectSignals, 'Auth external redirects'),
      suggestedFix: 'Keep auth redirects on reviewed internal routes, or route external provider/logout handoffs through explicit reviewed allowlists and provider configuration instead of hardcoding off-site destinations in app code.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAudit.authProviderStateSignals.count > 0
    && (
      sourceAuditBucketsOverlap(sourceAudit.authProviderStateSignals, sourceAudit.authEntrySignals)
      || sourceAuditBucketsOverlap(sourceAudit.authProviderStateSignals, sourceAudit.signInFlowSignals)
      || sourceAuditBucketsOverlap(sourceAudit.authProviderStateSignals, sourceAudit.signUpFlowSignals)
      || sourceAuditBucketsOverlap(sourceAudit.authProviderStateSignals, sourceAudit.recoveryFlowSignals)
      || sourceAuditBucketsOverlap(sourceAudit.authProviderStateSignals, sourceAudit.authExitSignals)
    )
  ) {
    findings.push(makeFinding({
      id: 'source-auth-provider-state-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Source files hardcode provider-style auth authorize URLs without a `state` parameter.',
      evidence: buildSourceAuditEvidence(sourceAudit, sourceAudit.authProviderStateSignals, 'Auth provider URLs missing state'),
      suggestedFix: 'When auth flows hand off to an external provider authorize URL, include a reviewed `state` value and validate it on return instead of hardcoding off-site auth entry without CSRF protection.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAudit.authProviderPkceSignals.count > 0
    && (
      sourceAuditBucketsOverlap(sourceAudit.authProviderPkceSignals, sourceAudit.authEntrySignals)
      || sourceAuditBucketsOverlap(sourceAudit.authProviderPkceSignals, sourceAudit.signInFlowSignals)
      || sourceAuditBucketsOverlap(sourceAudit.authProviderPkceSignals, sourceAudit.signUpFlowSignals)
      || sourceAuditBucketsOverlap(sourceAudit.authProviderPkceSignals, sourceAudit.recoveryFlowSignals)
      || sourceAuditBucketsOverlap(sourceAudit.authProviderPkceSignals, sourceAudit.authExitSignals)
    )
  ) {
    findings.push(makeFinding({
      id: 'source-auth-provider-pkce-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Source files hardcode provider-style OAuth code-flow URLs without a `code_challenge` parameter.',
      evidence: buildSourceAuditEvidence(sourceAudit, sourceAudit.authProviderPkceSignals, 'Auth provider code flows missing PKCE'),
      suggestedFix: 'When auth flows hand off to an external provider authorize URL with `response_type=code`, include a reviewed PKCE `code_challenge` and verifier instead of hardcoding a bare code flow from client code.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAudit.authProviderNonceSignals.count > 0
    && (
      sourceAuditBucketsOverlap(sourceAudit.authProviderNonceSignals, sourceAudit.authEntrySignals)
      || sourceAuditBucketsOverlap(sourceAudit.authProviderNonceSignals, sourceAudit.signInFlowSignals)
      || sourceAuditBucketsOverlap(sourceAudit.authProviderNonceSignals, sourceAudit.signUpFlowSignals)
      || sourceAuditBucketsOverlap(sourceAudit.authProviderNonceSignals, sourceAudit.recoveryFlowSignals)
      || sourceAuditBucketsOverlap(sourceAudit.authProviderNonceSignals, sourceAudit.authExitSignals)
    )
  ) {
    findings.push(makeFinding({
      id: 'source-auth-provider-nonce-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Source files hardcode provider-style OIDC id_token URLs without a `nonce` parameter.',
      evidence: buildSourceAuditEvidence(sourceAudit, sourceAudit.authProviderNonceSignals, 'Auth provider id_token flows missing nonce'),
      suggestedFix: 'When auth flows hand off to an external provider authorize URL that requests `id_token`, include a reviewed `nonce` and validate it on return instead of hardcoding a bare OIDC implicit or hybrid flow from client code.',
    }));
  }

  if (topology.hasAuthFeature && topology.gatewayRoutes.length === 0 && sourceAudit.authEntrySignals.count === 0) {
    findings.push(makeFinding({
      id: 'source-auth-entry-surface-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Authentication is declared, but the source tree does not show any obvious login, registration, or credential-entry surface.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        'Auth entry signals: 0',
        'Gateway routes: none',
        `Primary routes: ${topology.primaryRoutes.join(', ') || 'none'}`,
      ],
      suggestedFix: 'Add an explicit login, registration, recovery, or reviewed SSO entry surface before protected routes become the primary way into the app.',
    }));
  }

  if (topology.hasAuthFeature && topology.gatewayRoutes.length > 0 && sourceAudit.authEntrySignals.count === 0) {
    findings.push(makeFinding({
      id: 'source-auth-entry-signals-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Authentication is declared and gateway routes exist, but the source tree does not show an obvious sign-in, registration, or credential-entry surface.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        'Auth entry signals: 0',
        `Gateway routes: ${topology.gatewayRoutes.join(', ') || 'none'}`,
      ],
      suggestedFix: 'Add a real login, registration, or recovery surface with credential inputs or explicit auth entry actions on the gateway routes.',
    }));
  }

  if (
    topology.hasAuthFeature
    && topology.gatewayRoutes.some(route => isRecoveryLikeRoute(route))
    && sourceAudit.signInFlowSignals.count > 0
    && sourceAudit.recoveryRouteSignals.count === 0
  ) {
    findings.push(makeFinding({
      id: 'source-auth-recovery-route-missing',
      category: 'Source Audit',
      severity: 'info',
      message: 'Sign-in surfaces exist and a recovery route is declared, but the source tree does not show an obvious path into that recovery flow.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Sign-in flow files: ${sourceAudit.signInFlowSignals.files.join(', ') || 'none'}`,
        'Recovery route signals: 0',
        `Gateway routes: ${topology.gatewayRoutes.join(', ') || 'none'}`,
      ],
      suggestedFix: 'Link sign-in users to the declared recovery route, such as `/forgot-password` or `/reset-password`, somewhere in the reviewed auth entry surfaces.',
    }));
  }

  if (
    topology.hasAuthFeature
    && topology.gatewayRoutes.some(route => isRegistrationLikeRoute(route))
    && sourceAudit.signInFlowSignals.count > 0
    && sourceAudit.registrationRouteSignals.count === 0
  ) {
    findings.push(makeFinding({
      id: 'source-auth-registration-route-missing',
      category: 'Source Audit',
      severity: 'info',
      message: 'Sign-in surfaces exist and a registration route is declared, but the source tree does not show an obvious path into that registration flow.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Sign-in flow files: ${sourceAudit.signInFlowSignals.files.join(', ') || 'none'}`,
        'Registration route signals: 0',
        `Gateway routes: ${topology.gatewayRoutes.join(', ') || 'none'}`,
      ],
      suggestedFix: 'Link sign-in users to the declared registration route, such as `/register` or `/sign-up`, somewhere in the reviewed auth entry surfaces.',
    }));
  }

  if (
    topology.hasAuthFeature
    && topology.gatewayRoutes.some(route => isSignInLikeRoute(route))
    && (sourceAudit.signUpFlowSignals.count > 0 || sourceAudit.recoveryFlowSignals.count > 0)
    && sourceAudit.signInRouteSignals.count === 0
  ) {
    findings.push(makeFinding({
      id: 'source-auth-signin-route-missing',
      category: 'Source Audit',
      severity: 'info',
      message: 'Registration or recovery surfaces exist and a sign-in route is declared, but the source tree does not show an obvious path back into sign-in.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Sign-up flow files: ${sourceAudit.signUpFlowSignals.files.join(', ') || 'none'}`,
        `Recovery flow files: ${sourceAudit.recoveryFlowSignals.files.join(', ') || 'none'}`,
        'Sign-in route signals: 0',
        `Gateway routes: ${topology.gatewayRoutes.join(', ') || 'none'}`,
      ],
      suggestedFix: 'Link registration and recovery users back to the declared sign-in route, such as `/login` or `/sign-in`, somewhere in the reviewed gateway surfaces.',
    }));
  }

  if (
    topology.hasAuthFeature
    && topology.primaryRoutes.length > 0
    && (
      sourceAudit.signInFlowSignals.count > 0
      || (
        sourceAudit.authEntrySignals.count > 0
        && sourceAudit.signUpFlowSignals.count === 0
        && sourceAudit.recoveryFlowSignals.count === 0
      )
    )
    && sourceAudit.authProtectedRedirectSignals.count === 0
  ) {
    findings.push(makeFinding({
      id: 'source-auth-success-redirect-missing',
      category: 'Source Audit',
      severity: 'info',
      message: 'Authentication entry surfaces exist, but the source tree does not show an obvious transition into the protected app after success.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Auth entry signals: ${sourceAudit.authEntrySignals.count}`,
        'Protected auth redirects: 0',
        `Primary routes: ${topology.primaryRoutes.join(', ') || 'none'}`,
      ],
      suggestedFix: 'After reviewed sign-in, registration, or recovery success, route users into a primary app surface such as `/dashboard`, `/app`, or another protected destination instead of leaving the post-auth transition implicit.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAudit.authCallbackTokenSignals.count > 0
    && !sourceAuditBucketsOverlap(sourceAudit.authCallbackTokenSignals, sourceAudit.authCallbackErrorSignals)
  ) {
    findings.push(makeFinding({
      id: 'source-auth-callback-error-missing',
      category: 'Source Audit',
      severity: 'info',
      message: 'Auth callback code appears to read provider return data without an obvious failure state for provider-denied or callback error returns.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Callback token signal files: ${sourceAudit.authCallbackTokenSignals.files.join(', ') || 'none'}`,
        `Callback error-handling signal files: ${sourceAudit.authCallbackErrorSignals.files.join(', ') || 'none'}`,
      ],
      suggestedFix: 'When reviewed auth callback routes can receive provider error returns, branch on `error` or related callback params and show a reviewed failure state before or alongside the post-auth redirect handling.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAudit.authCallbackStateSignals.count > 0
    && !sourceAuditBucketsOverlap(sourceAudit.authCallbackStateSignals, sourceAudit.authCallbackStateValidationSignals)
  ) {
    findings.push(makeFinding({
      id: 'source-auth-callback-state-validation-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Auth callback code reads provider `state` on return but does not show an obvious validation step against a reviewed expected value.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Callback state signal files: ${sourceAudit.authCallbackStateSignals.files.join(', ') || 'none'}`,
        `Callback state-validation signal files: ${sourceAudit.authCallbackStateValidationSignals.files.join(', ') || 'none'}`,
      ],
      suggestedFix: 'When reviewed auth callback routes read a returned `state`, compare it against a stored or expected reviewed value before exchanging callback codes or continuing session setup.',
    }));
  }

  if (
    topology.hasAuthFeature
    && sourceAudit.authCallbackStateValidationSignals.count > 0
    && sourceAudit.authCallbackStateStorageSignals.count > 0
    && !sourceAuditBucketsOverlap(sourceAudit.authCallbackStateStorageSignals, sourceAudit.authCallbackStateStorageClearSignals)
  ) {
    findings.push(makeFinding({
      id: 'source-auth-callback-state-teardown-missing',
      category: 'Source Audit',
      severity: 'info',
      message: 'Auth callback code appears to validate stored callback `state` but does not show that the stored state key is cleared afterwards.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Callback state-storage signal files: ${sourceAudit.authCallbackStateStorageSignals.files.join(', ') || 'none'}`,
        `Callback state-clear signal files: ${sourceAudit.authCallbackStateStorageClearSignals.files.join(', ') || 'none'}`,
      ],
      suggestedFix: 'After validating returned callback `state`, remove the reviewed `oauth_state` or CSRF state key from browser storage or cookies so stale callback state does not linger.',
    }));
  }

  if (
    topology.hasAuthFeature
    && topology.gatewayRoutes.some(route => isSignInLikeRoute(route))
    && (
      (
        (sourceAudit.authCallbackTokenSignals.count > 0 || sourceAudit.authCallbackStateSignals.count > 0)
        && sourceAudit.authCallbackErrorSignals.count > 0
        && !sourceAuditBucketsOverlap(sourceAudit.authCallbackErrorSignals, sourceAudit.signInRouteSignals)
      )
      || (
        sourceAudit.authCallbackExchangeSignals.count > 0
        && sourceAudit.authCallbackExchangeErrorSignals.count > 0
        && !sourceAuditBucketsOverlap(sourceAudit.authCallbackExchangeErrorSignals, sourceAudit.signInRouteSignals)
      )
    )
  ) {
    findings.push(makeFinding({
      id: 'source-auth-callback-entry-return-missing',
      category: 'Source Audit',
      severity: 'info',
      message: 'Auth callback failure handling exists, but the source tree does not show an obvious path back to the declared sign-in route.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Callback error-handling signal files: ${sourceAudit.authCallbackErrorSignals.files.join(', ') || 'none'}`,
        `Callback exchange error-handling files: ${sourceAudit.authCallbackExchangeErrorSignals.files.join(', ') || 'none'}`,
        `Sign-in route signal files: ${sourceAudit.signInRouteSignals.files.join(', ') || 'none'}`,
      ],
      suggestedFix: 'When reviewed callback handling or callback session exchange fails, link or redirect users back to the declared sign-in route, such as `/login` or `/sign-in`, instead of leaving the callback failure state isolated.',
    }));
  }

  if (
    topology.hasAuthFeature
    && (sourceAudit.authCallbackTokenSignals.count > 0 || sourceAudit.authCallbackErrorSignals.count > 0)
    && sourceAudit.authCallbackUrlScrubSignals.count === 0
  ) {
    findings.push(makeFinding({
      id: 'source-auth-callback-url-scrub-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Auth callback code appears to read tokens, codes, or provider error params from the URL without scrubbing them back out of browser history.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Callback token signal files: ${sourceAudit.authCallbackTokenSignals.files.join(', ') || 'none'}`,
        `Callback error signal files: ${sourceAudit.authCallbackErrorSignals.files.join(', ') || 'none'}`,
        'Callback URL scrub signals: 0',
      ],
      suggestedFix: 'After consuming auth callback codes, tokens, or provider error params from the URL, replace the callback URL with a clean reviewed route using `history.replaceState`, router replacement, or an explicit internal redirect.',
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

  if (essenceRequiresSkipNav(essence) && sourceAudit.skipNavSignals.count === 0) {
    findings.push(makeFinding({
      id: 'source-skip-nav-signals-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'The essence contract requires skip navigation, but the source tree does not show a skip-link signal.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        'Skip-nav requirement: true',
        'Skip-nav signals: 0',
      ],
      suggestedFix: 'Add a visible-on-focus skip link such as `Skip to content` that targets the main app landmark before shipping the accessible surface.',
    }));
  }

  if (essenceRequiresSkipNav(essence) && sourceAudit.mainLandmarkSignals.count === 0) {
    findings.push(makeFinding({
      id: 'source-main-landmark-signals-missing',
      category: 'Source Audit',
      severity: 'warn',
      message: 'The essence contract requires skip navigation, but the source tree does not show a main landmark for skip-link targeting.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        'Skip-nav requirement: true',
        'Main landmark signals: 0',
      ],
      suggestedFix: 'Add a `<main>` landmark or a container with `role=\"main\"` so skip navigation lands on a clear primary app region.',
    }));
  }

  if (
    essenceRequiresSkipNav(essence)
    && sourceAudit.skipNavTargetIds.length > 0
    && !sourceAudit.skipNavTargetIds.some((targetId) => sourceAudit.mainLandmarkIds.includes(targetId))
  ) {
    findings.push(makeFinding({
      id: 'source-skip-nav-target-mismatch',
      category: 'Source Audit',
      severity: 'warn',
      message: 'Skip-link targets do not line up with any detected main landmark id in the source tree.',
      evidence: [
        `Source files checked: ${sourceAudit.filesChecked}`,
        `Skip-nav targets: ${sourceAudit.skipNavTargetIds.join(', ')}`,
        `Main landmark ids: ${sourceAudit.mainLandmarkIds.join(', ') || 'none'}`,
      ],
      suggestedFix: 'Point skip-link href values at the id of the primary `<main>` landmark, or add a matching id to the existing main region.',
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

function appendStyleContractFindings(
  findings: VerificationFinding[],
  styleAudit: StyleAuditSummary,
  essence: EssenceFile | null,
): void {
  if (essenceRequiresFocusVisible(essence) && styleAudit.focusVisibleSignals.count === 0) {
    findings.push(makeFinding({
      id: 'style-focus-visible-signals-missing',
      category: 'Style Contract',
      severity: 'warn',
      message: 'The essence contract requires visible focus treatment, but the project styles do not show a focus-visible signal.',
      evidence: [
        `Style files checked: ${styleAudit.filesChecked}`,
        'Focus-visible requirement: true',
        'Focus-visible signals: 0',
      ],
      suggestedFix: 'Add a clear `:focus-visible` treatment in the project CSS so keyboard focus remains visible across interactive surfaces.',
    }));
  }

  if (essenceRequiresReducedMotion(essence) && styleAudit.reducedMotionSignals.count === 0) {
    findings.push(makeFinding({
      id: 'style-reduced-motion-signals-missing',
      category: 'Style Contract',
      severity: 'info',
      message: 'The essence contract requires reduced-motion support, but the project styles do not show a reduced-motion signal.',
      evidence: [
        `Style files checked: ${styleAudit.filesChecked}`,
        'Reduced-motion requirement: true',
        'Reduced-motion signals: 0',
      ],
      suggestedFix: 'Add a `prefers-reduced-motion: reduce` style path or an equivalent reviewed reduce-motion contract so motion-heavy surfaces can soften or disable non-essential animation.',
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
      suggestedFix: 'Regenerate context with `decantr refresh`, or hydrate the hosted review contract with `decantr registry get-pack review --write-context`, so critique consumers can anchor findings to the compiled review contract.',
    }));
  }

  const checkedRuntimeAudit = await runRuntimeAudit(projectRoot, essence);
  appendRuntimeAuditFindings(findings, checkedRuntimeAudit, projectRoot, summarizeTopology(essence, reviewPack));
  appendSourceAuditFindings(findings, auditProjectSourceTree(projectRoot), essence, reviewPack);
  appendStyleContractFindings(findings, auditProjectStyleContracts(projectRoot), essence);

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
  hardcodedSecretSignalCount: number;
  clientSecretEnvReferenceCount: number;
  localhostEndpointCount: number;
  wildcardPostMessageCount: number;
  windowOpenWithoutNoopenerCount: number;
  messageListenerWithoutOriginCheckCount: number;
  externalIframeWithoutSandboxCount: number;
  insecureExternalIframeCount: number;
  insecureFormActionCount: number;
  insecureAuthFormMethodCount: number;
  insecureTransportEndpointCount: number;
  iconOnlyButtonWithoutLabelCount: number;
  iconOnlyLinkWithoutLabelCount: number;
  clickableNonSemanticCount: number;
  imageWithoutAltCount: number;
  insecureExternalImageCount: number;
  iframeWithoutTitleCount: number;
  dialogWithoutLabelCount: number;
  dialogWithoutModalHintCount: number;
  tableWithoutHeaderCount: number;
  tableWithoutCaptionCount: number;
  unlabeledNavigationLandmarkCount: number;
  multipleMainLandmarkCount: number;
  externalBlankLinkWithoutRelCount: number;
  formControlWithoutLabelCount: number;
  placeholderNavigationTargetCount: number;
  protectedSurfaceSignalCount: number;
  skipNavSignalCount: number;
  skipNavTargetIds: string[];
  mainLandmarkCount: number;
  mainLandmarkIds: string[];
  emailAutocompleteMissingCount: number;
  passwordAutocompleteMissingCount: number;
  otpAutocompleteMissingCount: number;
  authAutocompleteDisabledCount: number;
  authAutocompleteSemanticMismatchCount: number;
  authInputTypeMismatchCount: number;
  authInputWithoutNameCount: number;
  buttonInFormWithoutTypeCount: number;
  authFormWithoutSubmitCount: number;
  authEntrySignalCount: number;
  authSessionSignalCount: number;
  authLoadingSignalCount: number;
  authProtectedLoadingRenderCount: number;
  authBlankLoadingRenderCount: number;
  authAnonymousLoadingRedirectCount: number;
  authProtectedUnauthenticatedRenderCount: number;
  authProtectedRedirectSignalCount: number;
  authAnonymousRedirectSignalCount: number;
  authOpenRedirectSignalCount: number;
  authExternalRedirectSignalCount: number;
  authProviderStateMissingCount: number;
  authProviderPkceMissingCount: number;
  authProviderNonceMissingCount: number;
  authStorageWriteCount: number;
  authStorageClearCount: number;
  authCookieWriteCount: number;
  authCookieClearCount: number;
  authCookieMissingHardeningCount: number;
  authHeaderWriteCount: number;
  authHeaderClearCount: number;
  authCacheClientCount: number;
  authCacheClearCount: number;
  authRefreshSignalCount: number;
  authRefreshClearCount: number;
  authGuardSignalCount: number;
  authExitSignalCount: number;
  authSessionTeardownSignalCount: number;
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
  if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
    return '';
  }
  if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
    return node.children.map(child => getJsxTextContent(child)).join('');
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

  const hrefValue = getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'href', 'to'));
  if (!hrefValue || !/^(?:https?:)?\/\//i.test(hrefValue)) return false;

  const relValue = getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'rel')) ?? '';
  return !/\bnoopener\b/i.test(relValue) || !/\bnoreferrer\b/i.test(relValue);
}

function isLinkLikeTag(tagName: string | null): boolean {
  return tagName === 'a' || tagName === 'Link' || tagName === 'NavLink';
}

function valueContainsInsecureRemoteAsset(value: string | null): boolean {
  if (!value) return false;
  return value
    .split(',')
    .map((candidate) => candidate.trim().split(/\s+/)[0] ?? '')
    .some((candidate) => /^http:\/\//i.test(candidate));
}

function isInsecureExternalImage(attributes: ts.JsxAttributes): boolean {
  const srcValue = getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'src'));
  const srcSetValue = getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'srcSet', 'srcset'));
  return valueContainsInsecureRemoteAsset(srcValue) || valueContainsInsecureRemoteAsset(srcSetValue);
}

function isInsecureExternalUrl(value: string | null): boolean {
  return /^http:\/\//i.test(value?.trim() ?? '');
}

function isImageLikeTag(tagName: string | null): boolean {
  return tagName === 'img' || tagName === 'Image';
}

function isImageSourceLikeTag(tagName: string | null): boolean {
  return isImageLikeTag(tagName) || tagName === 'source';
}

function isDialogLikeElement(attributes: ts.JsxAttributes, tagName: string | null): boolean {
  if (tagName === 'dialog') return true;
  const roleValue = getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'role'))?.trim().toLowerCase();
  return roleValue === 'dialog' || roleValue === 'alertdialog';
}

function hasDialogLabel(attributes: ts.JsxAttributes): boolean {
  return Boolean(getJsxAttribute(attributes, 'aria-label', 'aria-labelledby', 'title'));
}

function hasDialogModalHint(attributes: ts.JsxAttributes, tagName: string | null): boolean {
  if (tagName === 'dialog' && getJsxAttribute(attributes, 'open')) {
    return true;
  }
  const modalValue = getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'aria-modal'))?.trim().toLowerCase();
  return modalValue === 'true';
}

function isNavigationLandmark(tagName: string | null, attributes: ts.JsxAttributes): boolean {
  if (tagName === 'nav') return true;
  const roleValue = getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'role'))?.trim().toLowerCase();
  return roleValue === 'navigation';
}

function hasNavigationLabel(attributes: ts.JsxAttributes): boolean {
  return Boolean(getJsxAttribute(attributes, 'aria-label', 'aria-labelledby', 'title'));
}

function hasInsecureFormAction(attributes: ts.JsxAttributes): boolean {
  const actionValue = getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'action'));
  const normalized = actionValue?.trim().toLowerCase() ?? '';
  return /^http:\/\//i.test(normalized)
    || /^javascript:/i.test(normalized)
    || /^mailto:/i.test(normalized)
    || /^data:/i.test(normalized);
}

function isAuthLikeInputAttributes(attributes: ts.JsxAttributes): boolean {
  const inputType = getNormalizedInputType(attributes);
  if (inputType === 'email' || inputType === 'password') {
    return true;
  }

  const autocompleteValue = getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'autocomplete', 'autoComplete'))
    ?.trim()
    .toLowerCase();
  return ['email', 'username', 'current-password', 'new-password', 'one-time-code'].includes(autocompleteValue ?? '')
    || isOtpLikeInputAttributes(attributes);
}

function getInputIdentityText(attributes: ts.JsxAttributes): string {
  return [
    getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'name')),
    getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'id')),
    getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'placeholder')),
    getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'aria-label')),
    getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'autocomplete', 'autoComplete')),
  ]
    .filter((value): value is string => Boolean(value))
    .join(' ')
    .toLowerCase();
}

function isOtpLikeInputAttributes(attributes: ts.JsxAttributes): boolean {
  const identityText = getInputIdentityText(attributes);
  if (!identityText) return false;
  return /(?:one[- ]time|otp|verification(?:[-_ ]?code)?|authenticator|2fa|mfa|totp|passcode)/i.test(identityText);
}

function hasOtpAutocompleteIssue(attributes: ts.JsxAttributes): boolean {
  if (!isOtpLikeInputAttributes(attributes)) return false;
  const autocompleteValue = getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'autocomplete', 'autoComplete'))
    ?.trim()
    .toLowerCase();
  return autocompleteValue !== 'one-time-code';
}

function hasAuthInputTypeMismatch(attributes: ts.JsxAttributes): boolean {
  const inputType = getNormalizedInputType(attributes);
  const autocompleteValue = getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'autocomplete', 'autoComplete'))
    ?.trim()
    .toLowerCase();
  const nameValue = getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'name'))
    ?.trim()
    .toLowerCase();

  const looksLikePasswordField = autocompleteValue === 'current-password'
    || autocompleteValue === 'new-password'
    || /password|passcode|pin/.test(nameValue ?? '');
  if (looksLikePasswordField && inputType !== 'password') {
    return true;
  }

  const looksLikeEmailField = autocompleteValue === 'email'
    || /(?:^|[-_])(email|e-mail)(?:$|[-_])/.test(nameValue ?? '');
  if (looksLikeEmailField && inputType !== 'email') {
    return true;
  }

  return false;
}

function hasAuthAutocompleteSemanticMismatch(attributes: ts.JsxAttributes): boolean {
  const inputType = getNormalizedInputType(attributes);
  const autocompleteValue = getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'autocomplete', 'autoComplete'))
    ?.trim()
    .toLowerCase();

  if (!autocompleteValue) return false;

  if (inputType === 'password') {
    return !['current-password', 'new-password'].includes(autocompleteValue);
  }

  if (inputType === 'email') {
    return !['email', 'username'].includes(autocompleteValue);
  }

  return false;
}

function jsxTreeContainsAuthInput(node: ts.Node): boolean {
  let found = false;

  const visit = (current: ts.Node): void => {
    if (found) return;

    if (ts.isJsxSelfClosingElement(current)) {
      const tagName = getJsxTagName(current);
      if (tagName === 'input' && isAuthLikeInputAttributes(current.attributes)) {
        found = true;
      }
      return;
    }

    if (ts.isJsxElement(current)) {
      const tagName = getJsxTagName(current.openingElement);
      if (tagName === 'input' && isAuthLikeInputAttributes(current.openingElement.attributes)) {
        found = true;
        return;
      }
      for (const child of current.children) {
        visit(child);
        if (found) return;
      }
      return;
    }

    if (ts.isJsxFragment(current)) {
      for (const child of current.children) {
        visit(child);
        if (found) return;
      }
      return;
    }

    current.forEachChild(visit);
  };

  visit(node);
  return found;
}

function hasInsecureAuthFormMethod(node: ts.JsxElement): boolean {
  if (!jsxTreeContainsAuthInput(node)) return false;
  const methodValue = getJsxAttributeLiteralValue(getJsxAttribute(node.openingElement.attributes, 'method'));
  if (!methodValue) return true;
  return methodValue.trim().toLowerCase() === 'get';
}

function jsxTreeHasSubmitControl(node: ts.Node): boolean {
  let found = false;

  const visit = (current: ts.Node): void => {
    if (found) return;

    if (ts.isJsxSelfClosingElement(current)) {
      const tagName = getJsxTagName(current);
      if (tagName === 'button') {
        const typeValue = getJsxAttributeLiteralValue(getJsxAttribute(current.attributes, 'type'))?.trim().toLowerCase();
        if (!typeValue || typeValue === 'submit') {
          found = true;
        }
      }
      if (tagName === 'input') {
        const inputType = getNormalizedInputType(current.attributes);
        if (inputType === 'submit') {
          found = true;
        }
      }
      return;
    }

    if (ts.isJsxElement(current)) {
      const tagName = getJsxTagName(current.openingElement);
      if (tagName === 'button') {
        const typeValue = getJsxAttributeLiteralValue(getJsxAttribute(current.openingElement.attributes, 'type'))?.trim().toLowerCase();
        if (!typeValue || typeValue === 'submit') {
          found = true;
          return;
        }
      }
      if (tagName === 'input') {
        const inputType = getNormalizedInputType(current.openingElement.attributes);
        if (inputType === 'submit') {
          found = true;
          return;
        }
      }
      for (const child of current.children) {
        visit(child);
        if (found) return;
      }
      return;
    }

    if (ts.isJsxFragment(current)) {
      for (const child of current.children) {
        visit(child);
        if (found) return;
      }
      return;
    }

    current.forEachChild(visit);
  };

  visit(node);
  return found;
}

function jsxTreeHasTag(node: ts.Node, tagNames: string[]): boolean {
  let found = false;
  const wanted = new Set(tagNames);

  const visit = (current: ts.Node): void => {
    if (found) return;

    if (ts.isJsxSelfClosingElement(current)) {
      const tagName = getJsxTagName(current);
      if (tagName && wanted.has(tagName)) {
        found = true;
      }
      return;
    }

    if (ts.isJsxElement(current)) {
      const tagName = getJsxTagName(current.openingElement);
      if (tagName && wanted.has(tagName)) {
        found = true;
        return;
      }
      for (const child of current.children) {
        visit(child);
        if (found) return;
      }
      return;
    }

    if (ts.isJsxFragment(current)) {
      for (const child of current.children) {
        visit(child);
        if (found) return;
      }
      return;
    }

    current.forEachChild(visit);
  };

  visit(node);
  return found;
}

function hasAuthFormWithoutSubmitControl(node: ts.JsxElement): boolean {
  return jsxTreeContainsAuthInput(node) && !jsxTreeHasSubmitControl(node);
}

function getExpressionLiteralValue(expression: ts.Expression | undefined): string | null {
  if (!expression) return null;
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
    return expression.text;
  }
  if (ts.isParenthesizedExpression(expression)) {
    return getExpressionLiteralValue(expression.expression);
  }
  if (ts.isAsExpression(expression) || ts.isTypeAssertionExpression(expression)) {
    return getExpressionLiteralValue(expression.expression);
  }
  return null;
}

function getObjectLiteralStringPropertyValue(
  expression: ts.Expression | undefined,
  ...propertyNames: string[]
): string | null {
  if (!expression || !ts.isObjectLiteralExpression(expression)) return null;
  for (const property of expression.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const propertyName = ts.isIdentifier(property.name)
      ? property.name.text
      : ts.isStringLiteral(property.name)
        ? property.name.text
        : null;
    if (!propertyName || !propertyNames.includes(propertyName)) continue;
    const value = getExpressionLiteralValue(property.initializer);
    if (value) return value;
  }
  return null;
}

function getObjectLiteralBooleanPropertyValue(
  expression: ts.Expression | undefined,
  ...propertyNames: string[]
): boolean | null {
  if (!expression || !ts.isObjectLiteralExpression(expression)) return null;
  for (const property of expression.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const propertyName = ts.isIdentifier(property.name)
      ? property.name.text
      : ts.isStringLiteral(property.name)
        ? property.name.text
        : null;
    if (!propertyName || !propertyNames.includes(propertyName)) continue;
    if (property.initializer.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (property.initializer.kind === ts.SyntaxKind.FalseKeyword) return false;
  }
  return null;
}

function collectNamedFunctionLikeDeclarations(root: ts.Node): Map<string, ts.FunctionLikeDeclarationBase> {
  const declarations = new Map<string, ts.FunctionLikeDeclarationBase>();

  const visit = (node: ts.Node): void => {
    if (ts.isFunctionDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
      declarations.set(node.name.text, node);
    }

    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      if (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) {
        declarations.set(node.name.text, node.initializer);
      }
    }

    node.forEachChild(visit);
  };

  visit(root);
  return declarations;
}

function resolveFunctionLikeHandler(
  expression: ts.Expression | undefined,
  namedFunctions: Map<string, ts.FunctionLikeDeclarationBase>,
): ts.FunctionLikeDeclarationBase | null {
  if (!expression) return null;
  if (ts.isArrowFunction(expression) || ts.isFunctionExpression(expression)) {
    return expression;
  }
  if (ts.isIdentifier(expression)) {
    return namedFunctions.get(expression.text) ?? null;
  }
  return null;
}

function functionLikeReferencesOrigin(node: ts.FunctionLikeDeclarationBase): boolean {
  let found = false;

  const visit = (current: ts.Node): void => {
    if (found) return;

    if (ts.isPropertyAccessExpression(current) && isPropertyNamed(current.name, 'origin')) {
      found = true;
      return;
    }

    if (ts.isIdentifier(current) && current.text === 'origin') {
      found = true;
      return;
    }

    if (ts.isBindingElement(current)) {
      if (ts.isIdentifier(current.name) && current.name.text === 'origin') {
        found = true;
        return;
      }
      if (current.propertyName && isPropertyNamed(current.propertyName, 'origin')) {
        found = true;
        return;
      }
    }

    current.forEachChild(visit);
  };

  node.forEachChild(visit);
  return found;
}

function isAddEventListenerCall(node: ts.CallExpression): boolean {
  return (ts.isIdentifier(node.expression) && node.expression.text === 'addEventListener')
    || (ts.isPropertyAccessExpression(node.expression) && isPropertyNamed(node.expression.name, 'addEventListener'));
}

function isCookieMutationSetCall(node: ts.CallExpression): boolean {
  if (!ts.isPropertyAccessExpression(node.expression) || !isPropertyNamed(node.expression.name, 'set')) {
    return false;
  }

  return (ts.isIdentifier(node.expression.expression) && ['Cookies', 'cookieStore', 'cookies'].includes(node.expression.expression.text))
    || (ts.isPropertyAccessExpression(node.expression.expression) && isPropertyNamed(node.expression.expression.name, 'cookies', 'cookieStore'));
}

function expressionLooksLikeAuthCookieName(node: ts.Expression | undefined, sourceFile: ts.SourceFile): boolean {
  if (!node) return false;
  if (isAuthStorageKeyLiteral(node)) return true;
  return hasAuthCredentialText(node, sourceFile);
}

function objectLiteralLooksLikeAuthCookieConfig(
  expression: ts.Expression | undefined,
  sourceFile: ts.SourceFile,
): boolean {
  if (!expression || !ts.isObjectLiteralExpression(expression)) return false;
  for (const property of expression.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const propertyName = ts.isIdentifier(property.name)
      ? property.name.text
      : ts.isStringLiteral(property.name)
        ? property.name.text
        : null;
    if (!propertyName || !['name', 'key', 'cookie'].includes(propertyName)) continue;
    return expressionLooksLikeAuthCookieName(property.initializer, sourceFile);
  }
  return false;
}

function hasExplicitAuthCookieHardening(expression: ts.Expression | undefined): boolean {
  if (!expression || !ts.isObjectLiteralExpression(expression)) return false;

  const httpOnly = getObjectLiteralBooleanPropertyValue(expression, 'httpOnly', 'http_only');
  const secure = getObjectLiteralBooleanPropertyValue(expression, 'secure');
  const sameSite = getObjectLiteralStringPropertyValue(expression, 'sameSite', 'same_site');

  return httpOnly === true && secure === true && Boolean(sameSite?.trim());
}

function isSetCookieHeaderName(node: ts.Expression | undefined): boolean {
  const literal = getExpressionLiteralValue(node)?.trim().toLowerCase();
  return literal === 'set-cookie';
}

function cookieHeaderStringLooksAuthLike(value: string): boolean {
  return /\b(?:auth|session|token|jwt|refresh_token|access_token)[^=]*=/i.test(value);
}

function cookieHeaderStringHasHardening(value: string): boolean {
  return /;\s*httponly\b/i.test(value)
    && /;\s*secure\b/i.test(value)
    && /;\s*samesite=/i.test(value);
}

function collectCookieHeaderStrings(expression: ts.Expression | undefined): string[] {
  if (!expression) return [];
  const literal = getExpressionLiteralValue(expression);
  if (literal !== null) return [literal];
  if (ts.isArrayLiteralExpression(expression)) {
    return expression.elements
      .map((element) => ts.isExpression(element) ? getExpressionLiteralValue(element) : null)
      .filter((value): value is string => value !== null);
  }
  return [];
}

function isInsecureTransportUrl(value: string | null): boolean {
  return typeof value === 'string' && /^(?:http|ws):\/\//i.test(value.trim());
}

function isLocationObjectExpression(expression: ts.Expression): boolean {
  return (
    (ts.isIdentifier(expression) && expression.text === 'location')
    || (
      ts.isPropertyAccessExpression(expression)
      && ts.isIdentifier(expression.expression)
      && expression.expression.text === 'window'
      && isPropertyNamed(expression.name, 'location')
    )
  );
}

function isLocationAssignmentTarget(expression: ts.Expression): boolean {
  return (
    isLocationObjectExpression(expression)
    || (
      ts.isPropertyAccessExpression(expression)
      && isLocationObjectExpression(expression.expression)
      && isPropertyNamed(expression.name, 'href')
    )
  );
}

function isFetchLikeCall(node: ts.CallExpression): boolean {
  return (ts.isIdentifier(node.expression) && node.expression.text === 'fetch')
    || (ts.isPropertyAccessExpression(node.expression) && isPropertyNamed(node.expression.name, 'fetch'));
}

function isAxiosLikeCall(node: ts.CallExpression): boolean {
  if (!ts.isPropertyAccessExpression(node.expression)) return false;
  return ts.isIdentifier(node.expression.expression)
    && node.expression.expression.text === 'axios'
    && isPropertyNamed(node.expression.name, 'get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'request');
}

function isAxiosConfigCall(node: ts.CallExpression): boolean {
  return ts.isIdentifier(node.expression) && node.expression.text === 'axios';
}

function isRealtimeTransportConstructor(node: ts.NewExpression): boolean {
  return ts.isIdentifier(node.expression)
    && (node.expression.text === 'WebSocket' || node.expression.text === 'EventSource');
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

function isExternalUrl(value: string | null): boolean {
  return typeof value === 'string' && /^(?:https?:)?\/\//i.test(value.trim());
}

function parseExternalUrl(value: string | null): URL | null {
  if (!isExternalUrl(value)) return null;

  const normalized = value?.trim() ?? '';
  const input = normalized.startsWith('//') ? `https:${normalized}` : normalized;
  try {
    return new URL(input);
  } catch {
    return null;
  }
}

function isProviderAuthorizeUrl(url: URL): boolean {
  const hostAndPath = `${url.hostname}${url.pathname}`.toLowerCase();
  const hasAuthorizeLikePath = /(?:oauth|authorize|openid|sso|login\/oauth)/i.test(hostAndPath);
  const hasProviderQuery = ['client_id', 'redirect_uri', 'response_type', 'scope'].some((param) => url.searchParams.has(param));
  return (hasAuthorizeLikePath && hasProviderQuery)
    || (url.searchParams.has('client_id') && url.searchParams.has('redirect_uri'));
}

function isAuthProviderUrlMissingState(value: string | null): boolean {
  const url = parseExternalUrl(value);
  if (!url || !isProviderAuthorizeUrl(url)) return false;
  return !url.searchParams.has('state');
}

function isAuthProviderCodeFlowMissingPkce(value: string | null): boolean {
  const url = parseExternalUrl(value);
  if (!url || !isProviderAuthorizeUrl(url)) return false;

  const responseType = url.searchParams.get('response_type')?.toLowerCase() ?? '';
  if (!responseType.includes('code')) return false;
  return !url.searchParams.has('code_challenge');
}

function isAuthProviderIdTokenFlowMissingNonce(value: string | null): boolean {
  const url = parseExternalUrl(value);
  if (!url || !isProviderAuthorizeUrl(url)) return false;

  const responseType = url.searchParams.get('response_type')?.toLowerCase() ?? '';
  if (!responseType.includes('id_token')) return false;
  return !url.searchParams.has('nonce');
}

function hasMainLandmarkSignal(attributes: ts.JsxAttributes, tagName: string | null): boolean {
  if (tagName === 'main') return true;

  const roleValue = getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'role'));
  return roleValue?.trim().toLowerCase() === 'main';
}

function getMainLandmarkId(attributes: ts.JsxAttributes, tagName: string | null): string | null {
  if (!hasMainLandmarkSignal(attributes, tagName)) return null;

  const idValue = getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'id'));
  return idValue?.trim() ? idValue.trim() : null;
}

function getSkipNavTargetId(attributes: ts.JsxAttributes, tagName: string | null): string | null {
  if (tagName !== 'a') return null;

  const hrefValue = getJsxAttributeLiteralValue(getJsxAttribute(attributes, 'href', 'to'));
  if (!hrefValue?.startsWith('#')) return null;

  const targetId = hrefValue.slice(1).trim();
  return targetId.length > 0 ? targetId : null;
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

function isAuthorizationHeaderAccess(node: ts.Expression | undefined): boolean {
  if (!node) return false;
  return (
    (ts.isPropertyAccessExpression(node) && isAuthorizationHeaderName(node.name))
    || (ts.isElementAccessExpression(node) && isAuthorizationHeaderName(node.argumentExpression))
  );
}

function isHeaderClearValue(node: ts.Expression | undefined): boolean {
  if (!node) return false;
  const literal = getExpressionLiteralValue(node);
  if (literal !== null) {
    return literal.trim().length === 0;
  }
  return node.kind === ts.SyntaxKind.NullKeyword
    || node.kind === ts.SyntaxKind.UndefinedKeyword
    || (ts.isIdentifier(node) && node.text === 'undefined');
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

function countSkipNavSignals(code: string): number {
  const patterns = [
    /\bskip(?:-| )?nav(?:igation)?\b/i,
    /\bskip to (?:content|main|navigation)\b/i,
    /href\s*=\s*["']#(?:main|content|main-content|app-main)["']/i,
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(code) ? 1 : 0), 0);
}

function countAuthSessionSignals(code: string): number {
  const patterns = [
    /\b(?:useAuth|useSession|getSession|getServerSession|sessionState|authState)\b/,
    /\b(?:supabase\.auth\.getSession|auth\.getSession|session\.(?:user|token|status)|auth\.(?:user|session|status))\b/,
    /\bstatus\s*===?\s*['"`](?:authenticated|unauthenticated|loading)['"`]/,
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(code) ? 1 : 0), 0);
}

function countAuthUnauthenticatedBranchSignals(code: string): number {
  const patterns = [
    /\bif\s*\(\s*!\s*(?:session|user|currentUser|currentSession|authUser)\b/i,
    /\bif\s*\(\s*(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)\s*\)/i,
    /\bstatus\s*===?\s*['"`]unauthenticated['"`]/i,
    /\bstatus\s*!==?\s*['"`]authenticated['"`]/i,
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(code) ? 1 : 0), 0);
}

function countAuthLoadingSignals(code: string): number {
  const patterns = [
    /\b(?:isLoading|loading|isPending|pending|authLoading|sessionLoading)\b/,
    /\bstatus\s*===?\s*['"`]loading['"`]/,
    /\b(?:Suspense|fallback|Skeleton|Spinner)\b/,
    />\s*(?:signing you in|redirecting|authenticating|verifying your session|checking your session|loading your workspace|finishing sign in)(?:[.!…]+)?\s*</i,
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(code) ? 1 : 0), 0);
}

function countAuthProtectedLoadingRenderSignals(code: string): number {
  const patterns = [
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*(?:path|href|to)\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*(?:path|href|to)\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*(?:path|href|to)\s*=\s*{\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*(?:path|href|to)\s*=\s*{\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*(?:path|href|to)\s*=\s*{\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*(?:path|href|to)\s*=\s*{\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*(?:path|href|to)\s*=\s*{\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*(?:path|href|to)\s*=\s*{\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?(?:path|href|to)\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?(?:path|href|to)\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?(?:path|href|to)\s*=\s*{\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`]\s*}[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?(?:path|href|to)\s*=\s*{\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`]\s*}[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*{\s*[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*{\s*[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*{\s*[^}]*\bpathname\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[^}]*}\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*{\s*[^}]*\bpathname\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[^}]*}\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*{\s*[^}]*\bpathname\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[^}]*}\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*{\s*[^}]*\bpathname\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[^}]*}\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*{\s*[^}]*\bpathname\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[^}]*}\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*{\s*[^}]*\bpathname\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[^}]*}\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*{\s*[^}]*\bpathname\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[^}]*}\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*{\s*[^}]*\bpathname\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[^}]*}\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:window\.)?location\.(?:assign|replace)\s*\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:window\.)?location\.(?:assign|replace)\s*\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?(?:window\.)?location\.href\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?(?:window\.)?location\.href\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?<input\b(?=[^>]*\btype\s*=\s*['"`]hidden['"`])(?=[^>]*\b(?:value|defaultValue)\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`])[^>]*>[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?<input\b(?=[^>]*\btype\s*=\s*['"`]hidden['"`])(?=[^>]*\b(?:value|defaultValue)\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`])[^>]*>[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*\bdata-(?:redirect|redirect-to|next|next-path|destination|return|return-to|to|path)\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^>]*>[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*\bdata-(?:redirect|redirect-to|next|next-path|destination|return|return-to|to|path)\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^>]*>[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*=\s*{\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*=\s*{\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*=\s*{\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*=\s*{\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*=\s*{\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*=\s*{\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\b(?:to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\b(?:to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:to|path|href|action|route|pathname)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:to|path|href|action|route|pathname)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:state|options|config)\s*:\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route|pathname)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:state|options|config)\s*:\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route|pathname)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\bpayload\s*:\s*JSON\.stringify\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\bpayload\s*:\s*JSON\.stringify\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\bpayload\s*:\s*(?:new\s+)?URLSearchParams\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\.toString\(\s*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\bpayload\s*:\s*(?:new\s+)?URLSearchParams\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\.toString\(\s*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\bpayload\s*:\s*createSearchParams\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)(?:\.toString\(\s*\))?[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\bpayload\s*:\s*createSearchParams\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)(?:\.toString\(\s*\))?[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:label|title|subtitle|description|value|content|name|email|avatar|src)\s*:\s*[^,\]}]*\b(?:session|user|currentUser|currentSession|authUser|viewer|profile|account|member)\b[^,\]}]*[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:label|title|subtitle|description|value|content|name|email|avatar|src)\s*:\s*[^,\]}]*\b(?:session|user|currentUser|currentSession|authUser|viewer|profile|account|member)\b[^,\]}]*[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:to|path|href|action|route|pathname)\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:to|path|href|action|route|pathname)\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:to|path|href|action|route|pathname)\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:to|path|href|action|route|pathname)\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\bpathname\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\bpathname\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\bpathname\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\bpathname\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\bpathname\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\bpathname\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\bpathname\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\bpathname\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*JSON\.stringify\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*JSON\.stringify\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*(?:new\s+)?URLSearchParams\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\.toString\(\s*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*(?:new\s+)?URLSearchParams\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\.toString\(\s*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*createSearchParams\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)(?:\.toString\(\s*\))?\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*createSearchParams\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)(?:\.toString\(\s*\))?\s*}[^>]*>/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\baction\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\baction\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<(?:Dashboard|Workspace|Admin|Billing|Account|Profile|Protected)(?:Shell|Layout|Panel|Page|View|Route|Gate|Guard|Screen|Portal)\b[^>]*>/g,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<App(?:Shell|Layout|Panel|Page|View|Route|Gate|Guard|Screen|Portal)\b[^>]*>/g,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<(?:Dashboard|Workspace|Admin|Billing|Account|Profile|Protected)(?:Shell|Layout|Panel|Page|View|Route|Gate|Guard|Screen|Portal)\b[^>]*>/g,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<App(?:Shell|Layout|Panel|Page|View|Route|Gate|Guard|Screen|Portal)\b[^>]*>/g,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<(?:Dashboard|Workspace|Admin|Billing|Account|Profile|Protected)[A-Z][A-Za-z0-9]*\b[^>]*>/g,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<App[A-Z][A-Za-z0-9]*\b[^>]*>/g,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<(?:Dashboard|Workspace|Admin|Billing|Account|Profile|Protected)[A-Z][A-Za-z0-9]*\b[^>]*>/g,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<App[A-Z][A-Za-z0-9]*\b[^>]*>/g,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*(?:session|user|currentUser|currentSession|authUser|viewer|profile|account|member)\s*=\s*{[^}]+}[^>]*>/g,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{[^}]*\b(?:session|user|currentUser|currentSession|authUser)\b[^}]*}[^>]*>/g,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*(?:session|user|currentUser|currentSession|authUser|viewer|profile|account|member)\s*=\s*{[^}]+}[^>]*>/g,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*=\s*{[^}]*\b(?:session|user|currentUser|currentSession|authUser)\b[^}]*}[^>]*>/g,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\{[^}]*\b(?:session|user|currentUser|currentSession|authUser)\b[^}]*\}[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/g,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\{[^}]*\b(?:session|user|currentUser|currentSession|authUser)\b[^}]*\}[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/g,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,220}?return\s*<>\s*{[^}]*\b(?:session|user|currentUser|currentSession|authUser)\b[^}]*}\s*<\/>\s*;?/g,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<>\s*{[^}]*\b(?:session|user|currentUser|currentSession|authUser)\b[^}]*}\s*<\/>\s*;?/g,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,220}?return\s*(?:children|props\.children|<>\s*{?\s*(?:children|props\.children)\s*}?\s*<\/>)\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*(?:children|props\.children|<>\s*{?\s*(?:children|props\.children)\s*}?\s*<\/>)\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,220}?return\s*<(?:Outlet|Routes|RouterProvider)\b[^>]*>/g,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*<(?:Outlet|Routes|RouterProvider)\b[^>]*>/g,
  ];

  return patterns.reduce((total, pattern) => total + (code.match(pattern)?.length ?? 0), 0);
}

function countAuthBlankLoadingRenderSignals(code: string): number {
  const patterns = [
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,220}?return\s*(?:null|<>\s*<\/>)\s*;?/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*(?:null|<>\s*<\/>)\s*;?/gi,
  ];

  return patterns.reduce((total, pattern) => total + (code.match(pattern)?.length ?? 0), 0);
}

function countAuthAnonymousLoadingRedirectSignals(code: string): number {
  const patterns = [
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*{[\s\S]{0,260}?\b(?:redirect|navigate|push|replace)\s*\(\s*['"`]\/(?:auth|login|log-?in|sign-?in|sign-?up|register|forgot-password|reset-password)?(?:[/?#][^'"`]*)?['"`]/gi,
    /\bif\s*\(\s*[^)]*(?:status\s*===?\s*['"`]loading['"`]|isLoading|loading|isPending|pending|sessionLoading|authLoading)[^)]*\)\s*return\s*\b(?:redirect|navigate|push|replace)\s*\(\s*['"`]\/(?:auth|login|log-?in|sign-?in|sign-?up|register|forgot-password|reset-password)?(?:[/?#][^'"`]*)?['"`]/gi,
  ];

  return patterns.reduce((total, pattern) => total + (code.match(pattern)?.length ?? 0), 0);
}

function countAuthProtectedUnauthenticatedRenderSignals(code: string): number {
  const patterns = [
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*(?:path|href|to)\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*(?:path|href|to)\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*(?:path|href|to)\s*=\s*{\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*(?:path|href|to)\s*=\s*{\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*(?:path|href|to)\s*=\s*{\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*(?:path|href|to)\s*=\s*{\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*(?:path|href|to)\s*=\s*{\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*(?:path|href|to)\s*=\s*{\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?(?:path|href|to)\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?(?:path|href|to)\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?(?:path|href|to)\s*=\s*{\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`]\s*}[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?(?:path|href|to)\s*=\s*{\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`]\s*}[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*{\s*[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*{\s*[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*{\s*[^}]*\bpathname\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[^}]*}\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*{\s*[^}]*\bpathname\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[^}]*}\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*{\s*[^}]*\bpathname\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[^}]*}\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*{\s*[^}]*\bpathname\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[^}]*}\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*{\s*[^}]*\bpathname\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[^}]*}\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*{\s*[^}]*\bpathname\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[^}]*}\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*{\s*[^}]*\bpathname\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[^}]*}\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*{\s*[^}]*\bpathname\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[^}]*}\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:redirect|navigate|push|replace)\s*\(\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\s*\)[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:window\.)?location\.(?:assign|replace)\s*\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\b(?:window\.)?location\.(?:assign|replace)\s*\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?(?:window\.)?location\.href\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?(?:window\.)?location\.href\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?<input\b(?=[^>]*\btype\s*=\s*['"`]hidden['"`])(?=[^>]*\b(?:value|defaultValue)\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`])[^>]*>[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?<input\b(?=[^>]*\btype\s*=\s*['"`]hidden['"`])(?=[^>]*\b(?:value|defaultValue)\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`])[^>]*>[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*\bdata-(?:redirect|redirect-to|next|next-path|destination|return|return-to|to|path)\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^>]*>[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*\bdata-(?:redirect|redirect-to|next|next-path|destination|return|return-to|to|path)\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^>]*>[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*=\s*{\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*=\s*{\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*=\s*{\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*=\s*{\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*=\s*{\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*=\s*{\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\b(?:to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\b(?:to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:to|path|href|action|route|pathname)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:to|path|href|action|route|pathname)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:state|options|config)\s*:\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route|pathname)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:state|options|config)\s*:\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route|pathname)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\bpayload\s*:\s*JSON\.stringify\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\bpayload\s*:\s*JSON\.stringify\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\bpayload\s*:\s*(?:new\s+)?URLSearchParams\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\.toString\(\s*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\bpayload\s*:\s*(?:new\s+)?URLSearchParams\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\.toString\(\s*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\bpayload\s*:\s*createSearchParams\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)(?:\.toString\(\s*\))?[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\bpayload\s*:\s*createSearchParams\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)(?:\.toString\(\s*\))?[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:to|path|href|action|route|pathname)\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:to|path|href|action|route|pathname)\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:to|path|href|action|route|pathname)\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:to|path|href|action|route|pathname)\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:redirectTo|returnTo|next|nextPath|destination|toPath)\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\bpathname\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\bpathname\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\bpathname\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\bpathname\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\bpathname\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\bpathname\s*:\s*generatePath\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^)]*\)[^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\bpathname\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{{[^}]*\bpathname\s*:\s*createPath\(\s*{[^}]*\bpathname\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)[^}]*}}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*JSON\.stringify\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*JSON\.stringify\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*(?:new\s+)?URLSearchParams\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\.toString\(\s*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*(?:new\s+)?URLSearchParams\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)\.toString\(\s*\)\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*createSearchParams\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)(?:\.toString\(\s*\))?\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*createSearchParams\(\s*{[^}]*\b(?:redirectTo|returnTo|next|nextPath|destination|toPath|to|path|href|action|route)\s*:\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][^}]*}\s*\)(?:\.toString\(\s*\))?\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:label|title|subtitle|description|value|content|name|email|avatar|src)\s*:\s*[^,\]}]*\b(?:session|user|currentUser|currentSession|authUser|viewer|profile|account|member)\b[^,\]}]*[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{\s*\[[\s\S]{0,220}?\b(?:label|title|subtitle|description|value|content|name|email|avatar|src)\s*:\s*[^,\]}]*\b(?:session|user|currentUser|currentSession|authUser|viewer|profile|account|member)\b[^,\]}]*[\s\S]{0,220}?\]\s*}[^>]*>/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\baction\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\baction\s*=\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`][\s\S]{0,220}?<\/[\w.:-]+>\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<(?:Dashboard|Workspace|Admin|Billing|Account|Profile|Protected)(?:Shell|Layout|Panel|Page|View|Route|Gate|Guard|Screen|Portal)\b[^>]*>/g,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<App(?:Shell|Layout|Panel|Page|View|Route|Gate|Guard|Screen|Portal)\b[^>]*>/g,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<(?:Dashboard|Workspace|Admin|Billing|Account|Profile|Protected)(?:Shell|Layout|Panel|Page|View|Route|Gate|Guard|Screen|Portal)\b[^>]*>/g,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<App(?:Shell|Layout|Panel|Page|View|Route|Gate|Guard|Screen|Portal)\b[^>]*>/g,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<(?:Dashboard|Workspace|Admin|Billing|Account|Profile|Protected)[A-Z][A-Za-z0-9]*\b[^>]*>/g,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<App[A-Z][A-Za-z0-9]*\b[^>]*>/g,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<(?:Dashboard|Workspace|Admin|Billing|Account|Profile|Protected)[A-Z][A-Za-z0-9]*\b[^>]*>/g,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<App[A-Z][A-Za-z0-9]*\b[^>]*>/g,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*(?:session|user|currentUser|currentSession|authUser|viewer|profile|account|member)\s*=\s*{[^}]+}[^>]*>/g,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*=\s*{[^}]*\b(?:session|user|currentUser|currentSession|authUser)\b[^}]*}[^>]*>/g,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*(?:session|user|currentUser|currentSession|authUser|viewer|profile|account|member)\s*=\s*{[^}]+}[^>]*>/g,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*=\s*{[^}]*\b(?:session|user|currentUser|currentSession|authUser)\b[^}]*}[^>]*>/g,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,320}?return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\{[^}]*\b(?:session|user|currentUser|currentSession|authUser)\b[^}]*\}[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/g,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<[\w.:-]+[^>]*>[\s\S]{0,220}?\{[^}]*\b(?:session|user|currentUser|currentSession|authUser)\b[^}]*\}[\s\S]{0,220}?<\/[\w.:-]+>\s*;?/g,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,220}?return\s*<>\s*{[^}]*\b(?:session|user|currentUser|currentSession|authUser)\b[^}]*}\s*<\/>\s*;?/g,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<>\s*{[^}]*\b(?:session|user|currentUser|currentSession|authUser)\b[^}]*}\s*<\/>\s*;?/g,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,220}?return\s*(?:children|props\.children|<>\s*{?\s*(?:children|props\.children)\s*}?\s*<\/>)\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*(?:children|props\.children|<>\s*{?\s*(?:children|props\.children)\s*}?\s*<\/>)\s*;?/gi,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*{[\s\S]{0,220}?return\s*<(?:Outlet|Routes|RouterProvider)\b[^>]*>/g,
    /\bif\s*\(\s*(?:!\s*(?:session|user|currentUser|currentSession|authUser)|(?:session|user|currentUser|currentSession|authUser)\s*(?:==|===)\s*(?:null|undefined)|status\s*===?\s*['"`]unauthenticated['"`]|status\s*!==?\s*['"`]authenticated['"`])\s*\)\s*return\s*<(?:Outlet|Routes|RouterProvider)\b[^>]*>/g,
  ];

  return patterns.reduce((total, pattern) => total + (code.match(pattern)?.length ?? 0), 0);
}

function countAuthErrorSignals(code: string): number {
  const patterns = [
    /\bstatus\s*===?\s*['"`]error['"`]/,
    /\b(?:authError|sessionError|loginError|signInError|signUpError|formError|errorMessage|setError)\b/,
    /\bcatch\s*\(/,
    /\b(?:toast|notify|notification|Alert|alert|ErrorBoundary)\b/,
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(code) ? 1 : 0), 0);
}

function countAuthSuccessSignals(code: string): number {
  const patterns = [
    /\bstatus\s*===?\s*['"`]success['"`]/,
    /\b(?:authSuccess|recoverySuccess|resetSuccess|passwordResetSent|resetEmailSent|verificationSent|emailSent|successMessage|setSuccess)\b/i,
    /\b(?:toast|notify|notification)\.success\b/i,
    />\s*(?:check your email|email sent|reset link sent|password reset email sent|verification email sent|password updated|account created)\s*</i,
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(code) ? 1 : 0), 0);
}

function countAuthCallbackTokenSignals(code: string, filePath: string): number {
  const patterns = [
    /\b(?:searchParams|request\.nextUrl\.searchParams|url\.searchParams)\.get\s*\(\s*['"`](?:code|access_token|id_token|refresh_token)['"`]\s*\)/gi,
    /\b(?:router\.query|route\.query|query)\.(?:code|access_token|id_token|refresh_token)\b/gi,
    /\bnew URLSearchParams\s*\(\s*(?:window\.)?location\.hash(?:\.slice\(\s*1\s*\)|\.replace\([^)]*\))?\s*\)/gi,
    /\b(?:window\.)?location\.hash\b/gi,
    /\b(?:exchangeCodeForSession|handleAuthCallback|authCallback|oauthCallback)\b/gi,
  ];

  const count = patterns.reduce((total, pattern) => total + (code.match(pattern)?.length ?? 0), 0);
  return count + (/callback/i.test(filePath) ? 1 : 0);
}

function countAuthCallbackExchangeSignals(code: string): number {
  const patterns = [
    /\b(?:exchangeCodeForSession|exchangeTokenForSession|completeAuthCallback|finalizeAuthCallback|handleAuthCallback)\b/gi,
    /\b(?:auth|supabase\.auth)\.[A-Za-z0-9_]*exchange[A-Za-z0-9_]*\s*\(/gi,
  ];

  return patterns.reduce((total, pattern) => total + (code.match(pattern)?.length ?? 0), 0);
}

function countAuthCallbackExchangeErrorSignals(code: string): number {
  const patterns = [
    /\b(?:exchangeCodeForSession|exchangeTokenForSession|completeAuthCallback|finalizeAuthCallback|handleAuthCallback)\b[\s\S]{0,240}\.catch\s*\(/gi,
    /try\s*{[\s\S]{0,240}\b(?:exchangeCodeForSession|exchangeTokenForSession|completeAuthCallback|finalizeAuthCallback|handleAuthCallback)\b[\s\S]{0,240}catch\s*\(/gi,
    /\b(?:exchangeError|callbackExchangeError|tokenExchangeError|sessionExchangeError)\b/gi,
  ];

  return patterns.reduce((total, pattern) => total + (code.match(pattern)?.length ?? 0), 0);
}

function countAuthCallbackErrorSignals(code: string, filePath: string): number {
  const patterns = [
    /\b(?:searchParams|request\.nextUrl\.searchParams|url\.searchParams)\.get\s*\(\s*['"`](?:error|error_description|error_code|error_uri)['"`]\s*\)/gi,
    /\b(?:router\.query|route\.query|query)\.(?:error|error_description|error_code|error_uri)\b/gi,
    /\b(?:callbackError|oauthError|providerError|authCallbackError)\b/gi,
    /\b(?:toast|notify|notification)\.error\b/gi,
    />\s*(?:authentication failed|sign in failed|login failed|oauth error|provider error|unable to sign you in)\s*</gi,
  ];

  const count = patterns.reduce((total, pattern) => total + (code.match(pattern)?.length ?? 0), 0);
  return count + (/callback/i.test(filePath) && /\b(?:error|failed|failure)\b/i.test(code) ? 1 : 0);
}

function countAuthCallbackStateSignals(code: string): number {
  const patterns = [
    /\b(?:searchParams|request\.nextUrl\.searchParams|url\.searchParams)\.get\s*\(\s*['"`]state['"`]\s*\)/gi,
    /\b(?:router\.query|route\.query|query)\.state\b/gi,
    /\bnew URLSearchParams\s*\(\s*(?:window\.)?location\.hash(?:\.slice\(\s*1\s*\)|\.replace\([^)]*\))?\s*\)\.get\s*\(\s*['"`]state['"`]\s*\)/gi,
  ];

  return patterns.reduce((total, pattern) => total + (code.match(pattern)?.length ?? 0), 0);
}

function countAuthCallbackStateValidationSignals(code: string): number {
  let count = 0;

  if (/\b(?:validateState|verifyState|assertState|compareState|checkState)\s*\(/i.test(code)) {
    count += 1;
  }

  if (
    /\b(?:sessionStorage|localStorage)\.getItem\s*\(\s*['"`][^'"`]*(?:state|csrf)[^'"`]*['"`]\s*\)/i.test(code)
    && /(?:state|providerState|callbackState|returnedState|expectedState|storedState|sessionState|oauthState|csrfState)\s*(?:===|==|!==|!=)/i.test(code)
  ) {
    count += 1;
  }

  if (
    /\b(?:cookies?|cookieStore)\.(?:get|getAll)\s*\(\s*['"`][^'"`]*(?:state|csrf)[^'"`]*['"`]\s*\)/i.test(code)
    && /(?:state|providerState|callbackState|returnedState|expectedState|storedState|sessionState|oauthState|csrfState)\s*(?:===|==|!==|!=)/i.test(code)
  ) {
    count += 1;
  }

  if (
    /\b(?:state|providerState|callbackState|returnedState)\b\s*(?:===|==|!==|!=)\s*\b(?:expectedState|storedState|sessionState|oauthState|csrfState)\b/i.test(code)
    || /\b(?:expectedState|storedState|sessionState|oauthState|csrfState)\b\s*(?:===|==|!==|!=)\s*\b(?:state|providerState|callbackState|returnedState)\b/i.test(code)
  ) {
    count += 1;
  }

  return count;
}

function countAuthCallbackStateStorageSignals(code: string): number {
  const patterns = [
    /\b(?:sessionStorage|localStorage)\.getItem\s*\(\s*['"`][^'"`]*(?:state|csrf)[^'"`]*['"`]\s*\)/gi,
    /\b(?:cookies?|cookieStore)\.(?:get|getAll)\s*\(\s*['"`][^'"`]*(?:state|csrf)[^'"`]*['"`]\s*\)/gi,
  ];

  return patterns.reduce((total, pattern) => total + (code.match(pattern)?.length ?? 0), 0);
}

function countAuthCallbackStateStorageClearSignals(code: string): number {
  const patterns = [
    /\b(?:sessionStorage|localStorage)\.removeItem\s*\(\s*['"`][^'"`]*(?:state|csrf)[^'"`]*['"`]\s*\)/gi,
    /\b(?:deleteCookie|clearCookie|removeCookie)\s*\(\s*['"`][^'"`]*(?:state|csrf)[^'"`]*['"`]\s*\)/gi,
    /\b(?:cookies?|cookieStore)\.(?:delete|remove)\s*\(\s*['"`][^'"`]*(?:state|csrf)[^'"`]*['"`]\s*\)/gi,
    /\bdocument\.cookie\s*=\s*[^;\n]*(?:state|csrf)[^;\n]*(?:expires\s*=\s*Thu,\s*01 Jan 1970|max-age\s*=\s*0)/gi,
  ];

  return patterns.reduce((total, pattern) => total + (code.match(pattern)?.length ?? 0), 0);
}

function countAuthCallbackUrlScrubSignals(code: string): number {
  const patterns = [
    /\bhistory\.replaceState\s*\(/gi,
    /\brouter\.replace\s*\(/gi,
    /\bwindow\.history\.replaceState\s*\(/gi,
    /\b(?:redirect|navigate|push|replace)\s*\(\s*['"`]\/(?!\/)[^'"`]*['"`]/gi,
    /\bwindow\.location\.replace\s*\(\s*['"`]\/(?!\/)[^'"`]*['"`]/gi,
    /\b(?:window\.)?location\.hash\s*=\s*['"`]\s*['"`]/gi,
  ];

  return patterns.reduce((total, pattern) => total + (code.match(pattern)?.length ?? 0), 0);
}

function countAuthExitSignals(code: string): number {
  const patterns = [
    /\b(?:log\s*out|logout|sign\s*out|signout|sign-out)\b/i,
    /\b(?:supabase\.auth\.signOut|auth\.signOut|session\.signOut)\s*\(/,
    /\/(?:logout|signout|sign-out)\b/i,
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(code) ? 1 : 0), 0);
}

function countAuthSessionTeardownSignals(code: string): number {
  const patterns = [
    /\b(?:supabase\.auth\.signOut|auth\.signOut|session\.signOut)\s*\(/,
    /\b(?:clearSession|resetSession|destroySession|invalidateSession|revokeSession|endSession|terminateSession|removeSession)\s*\(/,
    /\b(?:deleteCookie|clearCookie|removeCookie)\s*\(\s*['"`]?(?:auth|session|token|accessToken|refreshToken|user)[^'"`)]*['"`]?\s*\)/i,
    /\b(?:cookies?|cookieStore)\.(?:delete|remove)\s*\(\s*['"`]?(?:auth|session|token|accessToken|refreshToken|user)[^'"`)]*['"`]?\s*\)/i,
    /\b(?:localStorage|sessionStorage)\.removeItem\s*\(\s*['"`]?(?:auth|session|token|accessToken|refreshToken|user)[^'"`)]*['"`]?\s*\)/i,
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(code) ? 1 : 0), 0);
}

function countAuthStorageClearSignals(code: string): number {
  const patterns = [
    /\b(?:localStorage|sessionStorage)\.removeItem\s*\(\s*['"`]?(?:auth|session|token|accessToken|refreshToken|user)[^'"`)]*['"`]?\s*\)/i,
    /\b(?:localStorage|sessionStorage)\.clear\s*\(/,
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(code) ? 1 : 0), 0);
}

function countAuthCookieClearSignals(code: string): number {
  const patterns = [
    /\b(?:deleteCookie|clearCookie|removeCookie)\s*\(\s*['"`]?(?:auth|session|token|accessToken|refreshToken|user)[^'"`)]*['"`]?\s*\)/i,
    /\b(?:cookies?|cookieStore)\.(?:delete|remove)\s*\(\s*['"`]?(?:auth|session|token|accessToken|refreshToken|user)[^'"`)]*['"`]?\s*\)/i,
    /\bdocument\.cookie\s*=\s*[^;\n]*(?:auth|session|token|accessToken|refreshToken|user)[^;\n]*(?:expires\s*=\s*Thu,\s*01 Jan 1970|max-age\s*=\s*0)/i,
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(code) ? 1 : 0), 0);
}

function countAuthCacheClientSignals(code: string): number {
  const patterns = [
    /from\s+['"`](?:@tanstack\/react-query|react-query)['"`]/gi,
    /\b(?:useQueryClient|queryClient|QueryClient)\b/g,
    /from\s+['"`]@apollo\/client['"`]/gi,
    /\b(?:useApolloClient|apolloClient|ApolloClient|InMemoryCache)\b/g,
    /from\s+['"`](?:urql|@urql\/core)['"`]/gi,
    /\b(?:urqlClient|cacheExchange)\b/g,
    /from\s+['"`]swr['"`]/gi,
    /\buseSWRConfig\b/g,
    /\bapi\.util\.resetApiState\b/g,
  ];

  return patterns.reduce((count, pattern) => count + (code.match(pattern)?.length ?? 0), 0);
}

function countAuthCacheClearSignals(code: string): number {
  const patterns = [
    /\b(?:queryClient|useQueryClient\s*\(\s*\))\.(?:clear|removeQueries|resetQueries|invalidateQueries|cancelQueries)\s*\(/gi,
    /\b(?:apolloClient|client)\.(?:resetStore|clearStore|stop)\s*\(/gi,
    /\b(?:cache|apolloClient\.cache)\.(?:evict|gc|modify)\s*\(/gi,
    /\b(?:mutate|useSWRConfig\s*\(\s*\)\.mutate)\s*\([^,\n]+,\s*(?:undefined|null|false)\b/gi,
    /\b(?:dispatch|store\.dispatch)\s*\(\s*api\.util\.resetApiState\s*\(\s*\)\s*\)/gi,
  ];

  return patterns.reduce((count, pattern) => count + (code.match(pattern)?.length ?? 0), 0);
}

function countAuthRefreshSignals(code: string): number {
  let count = 0;

  if (
    /\b(?:setInterval|setTimeout)\s*\(/i.test(code)
    && /\b(?:refreshSession|refreshToken|renewSession|getSession|startAutoRefresh)\b/i.test(code)
  ) {
    count += 1;
  }

  if (/\b(?:supabase\.auth|auth)\.onAuthStateChange\s*\(/i.test(code)) {
    count += 1;
  }

  if (/\bstartAutoRefresh\s*\(/i.test(code)) {
    count += 1;
  }

  return count;
}

function countAuthRefreshClearSignals(code: string): number {
  const patterns = [
    /\bclearInterval\s*\(/gi,
    /\bclearTimeout\s*\(/gi,
    /\b(?:subscription|authSubscription|authListener)\.unsubscribe\s*\(/gi,
    /\bstopAutoRefresh\s*\(/gi,
  ];

  return patterns.reduce((count, pattern) => count + (code.match(pattern)?.length ?? 0), 0);
}

function countAuthRealtimeSignals(code: string): number {
  const patterns = [
    /\bnew\s+WebSocket\s*\(/gi,
    /\bnew\s+EventSource\s*\(/gi,
    /\bsupabase\.channel\s*\(/gi,
    /\bpusher\.subscribe\s*\(/gi,
    /\becho\.(?:private|channel|join)\s*\(/gi,
  ];

  return patterns.reduce((count, pattern) => count + (code.match(pattern)?.length ?? 0), 0);
}

function countAuthRealtimeClearSignals(code: string): number {
  const patterns = [
    /\b(?:socket|ws|channel|subscription|realtime|eventSource)\.(?:close|disconnect|unsubscribe|remove|stop)\s*\(/gi,
    /\bsupabase\.removeChannel\s*\(/gi,
    /\bpusher\.unsubscribe\s*\(/gi,
    /\becho\.(?:leave|leaveChannel|disconnect)\s*\(/gi,
  ];

  return patterns.reduce((count, pattern) => count + (code.match(pattern)?.length ?? 0), 0);
}

function countAuthCoordinationSignals(code: string): number {
  const patterns = [
    /\bnew\s+BroadcastChannel\s*\(/gi,
    /\b(?:window\.)?addEventListener\s*\(\s*['"`]storage['"`]/gi,
    /\b(?:window\.)?onstorage\s*=/gi,
  ];

  return patterns.reduce((count, pattern) => count + (code.match(pattern)?.length ?? 0), 0);
}

function countAuthCoordinationClearSignals(code: string): number {
  const patterns = [
    /\b(?:auth|session|sync|broadcast)[A-Za-z0-9_$]*\.close\s*\(/gi,
    /\b(?:window\.)?removeEventListener\s*\(\s*['"`]storage['"`]/gi,
    /\b(?:window\.)?onstorage\s*=\s*null\b/gi,
  ];

  return patterns.reduce((count, pattern) => count + (code.match(pattern)?.length ?? 0), 0);
}

function countAuthEntrySignals(code: string): number {
  const patterns = [
    /\b(?:signIn|signin|logIn|login|register|signUp|signup|createAccount|forgotPassword|resetPassword)\s*\(/i,
    />\s*(?:sign in|log in|register|sign up|create account|forgot password|reset password)\s*</i,
    /\b(?:type|autoComplete|autocomplete)\s*=\s*["'{](?:email|username|current-password|new-password|password)/i,
    /<form\b/i,
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(code) ? 1 : 0), 0);
}

function countSignInFlowSignals(code: string, filePath: string): number {
  const patterns = [
    /\b(?:signIn|signin|logIn|login)\s*\(/i,
    />\s*(?:sign in|log in)\s*</i,
    /\bcurrent-password\b/i,
    /(?:^|\/)(?:login|log-?in|sign-?in)(?:\/|\.|$)/i,
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(code) || pattern.test(filePath) ? 1 : 0), 0);
}

function countRecoveryFlowSignals(code: string, filePath: string): number {
  const patterns = [
    /\b(?:forgotPassword|resetPassword|sendPasswordReset|requestPasswordReset|recoverAccount|recoverPassword)\s*\(/i,
    />\s*(?:forgot password|reset password|recover account)\s*</i,
    /\bnew-password\b/i,
    /(?:^|\/)(?:forgot-password|reset-password|password-reset|recover|recovery)(?:\/|\.|$)/i,
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(code) || pattern.test(filePath) ? 1 : 0), 0);
}

function countSignUpFlowSignals(code: string, filePath: string): number {
  const patterns = [
    /\b(?:signUp|signup|register|createAccount)\s*\(/i,
    />\s*(?:sign up|register|create account)\s*</i,
    /(?:^|\/)(?:signup|sign-up|register)(?:\/|\.|$)/i,
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(code) || pattern.test(filePath) ? 1 : 0), 0);
}

function countProtectedSurfaceSignals(code: string): number {
  const patterns = [
    /['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`]/i,
    /\b(?:href|to|route|path)\s*[:=]\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`]/i,
    /\b(?:navigate|redirect|push|replace)\s*\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`]/i,
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(code) ? 1 : 0), 0);
}

function countAuthProtectedRedirectSignals(code: string): number {
  const patterns = [
    /\b(?:redirect|navigate|push|replace)\s*\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`]/i,
    /\bNextResponse\.redirect\s*\(\s*['"`]\/(?:app|dashboard|workspace|settings|billing|account|profile|admin)(?:\/[^'"`]*)?['"`]/i,
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(code) ? 1 : 0), 0);
}

function countAuthAnonymousRedirectSignals(code: string): number {
  const patterns = [
    /\b(?:redirect|navigate|push|replace)\s*\(\s*['"`]\/(?:auth|login|log-?in|sign-?in|sign-?up|register|forgot-password|reset-password)?(?:[/?#][^'"`]*)?['"`]/i,
    /\bNextResponse\.redirect\s*\(\s*['"`]\/(?:auth|login|log-?in|sign-?in|sign-?up|register|forgot-password|reset-password)?(?:[/?#][^'"`]*)?['"`]/i,
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(code) ? 1 : 0), 0);
}

function countAuthOpenRedirectSignals(code: string): number {
  const patterns = [
    /\b(?:redirect|navigate|push|replace)\s*\(\s*[^)]*\b(?:searchParams|request\.nextUrl\.searchParams|url\.searchParams)\.get\s*\(\s*['"`](?:next|redirect(?:To)?|returnTo|callbackUrl|continue|from)['"`]\s*\)[^)]*\)/gi,
    /\b(?:redirect|navigate|push|replace)\s*\(\s*[^)]*\b(?:router\.query|route\.query|query)\.(?:next|redirect(?:To)?|returnTo|callbackUrl|continue|from)\b[^)]*\)/gi,
    /\bwindow\.location(?:\.href)?\s*=\s*[^;\n]*\b(?:searchParams|request\.nextUrl\.searchParams|url\.searchParams)\.get\s*\(\s*['"`](?:next|redirect(?:To)?|returnTo|callbackUrl|continue|from)['"`]\s*\)/gi,
  ];

  return patterns.reduce((count, pattern) => count + (code.match(pattern)?.length ?? 0), 0);
}

function expressionContainsOpenRedirectSource(
  expression: ts.Expression | undefined,
  sourceFile: ts.SourceFile,
): boolean {
  if (!expression) return false;
  return /\b(?:searchParams|request\.nextUrl\.searchParams|url\.searchParams)\.get\s*\(\s*['"`](?:next|redirect(?:To)?|returnTo|callbackUrl|continue|from)['"`]\s*\)|\b(?:router\.query|route\.query|query)\.(?:next|redirect(?:To)?|returnTo|callbackUrl|continue|from)\b/i
    .test(expression.getText(sourceFile));
}

function isRouteTransitionCall(node: ts.CallExpression): boolean {
  return (ts.isIdentifier(node.expression) && ['redirect', 'navigate'].includes(node.expression.text))
    || (ts.isPropertyAccessExpression(node.expression) && isPropertyNamed(node.expression.name, 'push', 'replace', 'redirect', 'navigate'));
}

function countAuthRecoveryRouteSignals(code: string): number {
  const patterns = [
    /\b(?:href|to|route|path)\s*[:=]\s*['"`]\/(?:forgot-password|reset-password|password-reset|recover)(?:[/?#][^'"`]*)?['"`]/gi,
    /\b(?:redirect|navigate|push|replace)\s*\(\s*['"`]\/(?:forgot-password|reset-password|password-reset|recover)(?:[/?#][^'"`]*)?['"`]/gi,
    /\bwindow\.location(?:\.href)?\s*=\s*['"`]\/(?:forgot-password|reset-password|password-reset|recover)(?:[/?#][^'"`]*)?['"`]/gi,
    />\s*(?:forgot password|reset password|recover account)\s*</gi,
  ];

  return patterns.reduce((count, pattern) => count + (code.match(pattern)?.length ?? 0), 0);
}

function countRegistrationRouteSignals(code: string): number {
  const patterns = [
    /\b(?:href|to|route|path)\s*[:=]\s*['"`]\/(?:signup|sign-up|register)(?:[/?#][^'"`]*)?['"`]/gi,
    /\b(?:redirect|navigate|push|replace)\s*\(\s*['"`]\/(?:signup|sign-up|register)(?:[/?#][^'"`]*)?['"`]/gi,
    /\bwindow\.location(?:\.href)?\s*=\s*['"`]\/(?:signup|sign-up|register)(?:[/?#][^'"`]*)?['"`]/gi,
    />\s*(?:sign up|register|create account)\s*</gi,
  ];

  return patterns.reduce((count, pattern) => count + (code.match(pattern)?.length ?? 0), 0);
}

function countAnonymousEntryRouteSignals(code: string): number {
  const patterns = [
    /\b(?:href|to|route|path)\s*[:=]\s*['"`]\/(?:auth|login|log-?in|sign-?in|sign-?up|register)?(?:[/?#][^'"`]*)?['"`]/gi,
    /\b(?:redirect|navigate|push|replace)\s*\(\s*['"`]\/(?:auth|login|log-?in|sign-?in|sign-?up|register)?(?:[/?#][^'"`]*)?['"`]/gi,
    /\bwindow\.location(?:\.href)?\s*=\s*['"`]\/(?:auth|login|log-?in|sign-?in|sign-?up|register)?(?:[/?#][^'"`]*)?['"`]/gi,
    />\s*(?:back to sign in|back to login|return to sign in|return to login|sign in|log in)\s*</gi,
  ];

  return patterns.reduce((count, pattern) => count + (code.match(pattern)?.length ?? 0), 0);
}

function countSignInRouteSignals(code: string): number {
  const patterns = [
    /\b(?:href|to|route|path)\s*[:=]\s*['"`]\/(?:auth|login|log-?in|sign-?in)(?:[/?#][^'"`]*)?['"`]/gi,
    /\b(?:redirect|navigate|push|replace)\s*\(\s*['"`]\/(?:auth|login|log-?in|sign-?in)(?:[/?#][^'"`]*)?['"`]/gi,
    /\bwindow\.location(?:\.href)?\s*=\s*['"`]\/(?:auth|login|log-?in|sign-?in)(?:[/?#][^'"`]*)?['"`]/gi,
    />\s*(?:back to sign in|back to login|return to sign in|return to login|sign in|log in)\s*</gi,
  ];

  return patterns.reduce((count, pattern) => count + (code.match(pattern)?.length ?? 0), 0);
}

function countHardcodedSecretSignals(code: string): number {
  const patterns = [
    /\bsk_live_[0-9A-Za-z]+\b/g,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
  ];

  return patterns.reduce((count, pattern) => count + (code.match(pattern)?.length ?? 0), 0);
}

function countClientSecretEnvReferenceSignals(code: string): number {
  const patterns = [
    /\bimport\.meta\.env\.[A-Z0-9_]*(?:SERVICE_ROLE|SECRET|PRIVATE_KEY)[A-Z0-9_]*\b/g,
    /\bprocess\.env\.NEXT_PUBLIC_[A-Z0-9_]*(?:SERVICE_ROLE|SECRET|PRIVATE_KEY)[A-Z0-9_]*\b/g,
  ];
  const useClientCount = /^\s*['"]use client['"]/m.test(code)
    ? (code.match(/\bprocess\.env\.[A-Z0-9_]*(?:SERVICE_ROLE|SECRET|PRIVATE_KEY)[A-Z0-9_]*\b/g)?.length ?? 0)
    : 0;

  return patterns.reduce((count, pattern) => count + (code.match(pattern)?.length ?? 0), 0) + useClientCount;
}

function countLocalhostEndpointSignals(code: string): number {
  return code.match(/\b(?:(?:https?|wss?):\/\/)?(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?::\d+)?(?:\/[^\s'"`]*)?/gi)?.length ?? 0;
}

function countWildcardPostMessageSignals(code: string): number {
  return code.match(/\bpostMessage\s*\([^)]*,\s*['"`]\*['"`]/g)?.length ?? 0;
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
    hardcodedSecretSignalCount: countHardcodedSecretSignals(code),
    clientSecretEnvReferenceCount: countClientSecretEnvReferenceSignals(code),
    localhostEndpointCount: countLocalhostEndpointSignals(code),
    wildcardPostMessageCount: countWildcardPostMessageSignals(code),
    windowOpenWithoutNoopenerCount: 0,
    messageListenerWithoutOriginCheckCount: 0,
    externalIframeWithoutSandboxCount: 0,
    insecureExternalIframeCount: 0,
    insecureFormActionCount: 0,
    insecureAuthFormMethodCount: 0,
    insecureTransportEndpointCount: 0,
    iconOnlyButtonWithoutLabelCount: 0,
    iconOnlyLinkWithoutLabelCount: 0,
    clickableNonSemanticCount: 0,
    imageWithoutAltCount: 0,
    insecureExternalImageCount: 0,
    iframeWithoutTitleCount: 0,
    dialogWithoutLabelCount: 0,
    dialogWithoutModalHintCount: 0,
    tableWithoutHeaderCount: 0,
    tableWithoutCaptionCount: 0,
    unlabeledNavigationLandmarkCount: 0,
    multipleMainLandmarkCount: 0,
    externalBlankLinkWithoutRelCount: 0,
    formControlWithoutLabelCount: 0,
    placeholderNavigationTargetCount: 0,
    protectedSurfaceSignalCount: countProtectedSurfaceSignals(code),
    skipNavSignalCount: countSkipNavSignals(code),
    skipNavTargetIds: [],
    mainLandmarkCount: 0,
    mainLandmarkIds: [],
    emailAutocompleteMissingCount: 0,
    passwordAutocompleteMissingCount: 0,
    otpAutocompleteMissingCount: 0,
    authAutocompleteDisabledCount: 0,
    authAutocompleteSemanticMismatchCount: 0,
    authInputTypeMismatchCount: 0,
    authInputWithoutNameCount: 0,
    buttonInFormWithoutTypeCount: 0,
    authFormWithoutSubmitCount: 0,
    authEntrySignalCount: countAuthEntrySignals(code),
    authSessionSignalCount: countAuthSessionSignals(code),
    authLoadingSignalCount: countAuthLoadingSignals(code),
    authProtectedLoadingRenderCount: countAuthProtectedLoadingRenderSignals(code),
    authBlankLoadingRenderCount: countAuthBlankLoadingRenderSignals(code),
    authAnonymousLoadingRedirectCount: countAuthAnonymousLoadingRedirectSignals(code),
    authProtectedUnauthenticatedRenderCount: countAuthProtectedUnauthenticatedRenderSignals(code),
    authProtectedRedirectSignalCount: countAuthProtectedRedirectSignals(code),
    authAnonymousRedirectSignalCount: countAuthAnonymousRedirectSignals(code),
    authOpenRedirectSignalCount: countAuthOpenRedirectSignals(code),
    authExternalRedirectSignalCount: 0,
    authProviderStateMissingCount: 0,
    authProviderPkceMissingCount: 0,
    authProviderNonceMissingCount: 0,
    authStorageWriteCount: 0,
    authStorageClearCount: countAuthStorageClearSignals(code),
    authCookieWriteCount: 0,
    authCookieClearCount: countAuthCookieClearSignals(code),
    authCookieMissingHardeningCount: 0,
    authHeaderWriteCount: 0,
    authHeaderClearCount: 0,
    authCacheClientCount: countAuthCacheClientSignals(code),
    authCacheClearCount: countAuthCacheClearSignals(code),
    authRefreshSignalCount: countAuthRefreshSignals(code),
    authRefreshClearCount: countAuthRefreshClearSignals(code),
    authGuardSignalCount: countAuthGuardSignals(code),
    authExitSignalCount: countAuthExitSignals(code),
    authSessionTeardownSignalCount: countAuthSessionTeardownSignals(code),
  };
  const namedFunctionDeclarations = collectNamedFunctionLikeDeclarations(sourceFile);
  const labelForIds = collectLabelForIds(sourceFile);
  let navigationLandmarkCount = 0;
  let unlabeledNavigationLandmarkCount = 0;

  const walk = (node: ts.Node) => {
    if (ts.isJsxAttribute(node)) {
      if (isPropertyNamed(node.name, 'style') && node.initializer) {
        signals.inlineStyleAttributeCount += 1;
      }
      if (isPropertyNamed(node.name, 'dangerouslySetInnerHTML')) {
        signals.dangerousHtmlCount += 1;
      }
      if (
        isPropertyNamed(node.name, 'href', 'to')
        && node.initializer
        && ts.isJsxExpression(node.initializer)
        && expressionContainsOpenRedirectSource(node.initializer.expression, sourceFile)
      ) {
        signals.authOpenRedirectSignalCount += 1;
      }

      if (
        isPropertyNamed(node.name, 'href', 'to')
        && isAuthProviderUrlMissingState(getJsxAttributeLiteralValue(node))
      ) {
        signals.authProviderStateMissingCount += 1;
      }

      if (
        isPropertyNamed(node.name, 'href', 'to')
        && isAuthProviderCodeFlowMissingPkce(getJsxAttributeLiteralValue(node))
      ) {
        signals.authProviderPkceMissingCount += 1;
      }

      if (
        isPropertyNamed(node.name, 'href', 'to')
        && isAuthProviderIdTokenFlowMissingNonce(getJsxAttributeLiteralValue(node))
      ) {
        signals.authProviderNonceMissingCount += 1;
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
      && isLocationAssignmentTarget(node.left)
      && isInsecureTransportUrl(getExpressionLiteralValue(node.right))
    ) {
      signals.insecureTransportEndpointCount += 1;
    }

    if (
      ts.isBinaryExpression(node)
      && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
      && isLocationAssignmentTarget(node.left)
      && isExternalUrl(getExpressionLiteralValue(node.right))
    ) {
      signals.authExternalRedirectSignalCount += 1;
      if (isAuthProviderUrlMissingState(getExpressionLiteralValue(node.right))) {
        signals.authProviderStateMissingCount += 1;
      }
      if (isAuthProviderCodeFlowMissingPkce(getExpressionLiteralValue(node.right))) {
        signals.authProviderPkceMissingCount += 1;
      }
      if (isAuthProviderIdTokenFlowMissingNonce(getExpressionLiteralValue(node.right))) {
        signals.authProviderNonceMissingCount += 1;
      }
    }

    if (
      ts.isBinaryExpression(node)
      && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
      && isLocationAssignmentTarget(node.left)
      && expressionContainsOpenRedirectSource(node.right, sourceFile)
    ) {
      signals.authOpenRedirectSignalCount += 1;
    }

    if (
      ts.isBinaryExpression(node)
      && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
      && ts.isPropertyAccessExpression(node.left)
      && isPropertyNamed(node.left.name, 'onmessage')
    ) {
      const handler = resolveFunctionLikeHandler(node.right, namedFunctionDeclarations);
      if (handler && !functionLikeReferencesOrigin(handler)) {
        signals.messageListenerWithoutOriginCheckCount += 1;
      }
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
      ts.isBinaryExpression(node)
      && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
      && isAuthorizationHeaderAccess(node.left)
    ) {
      if (isHeaderClearValue(node.right)) {
        signals.authHeaderClearCount += 1;
      } else {
        signals.authHeaderWriteCount += 1;
      }
    }

    if (
      ts.isPropertyAssignment(node)
      && isAuthorizationHeaderName(node.name)
    ) {
      if (isHeaderClearValue(node.initializer)) {
        signals.authHeaderClearCount += 1;
      } else {
        signals.authHeaderWriteCount += 1;
      }
    }

    if (
      ts.isDeleteExpression(node)
      && isAuthorizationHeaderAccess(node.expression)
    ) {
      signals.authHeaderClearCount += 1;
    }

    if (ts.isCallExpression(node)) {
      const firstArgumentLiteral = getExpressionLiteralValue(node.arguments[0]);
      const secondArgumentLiteral = getExpressionLiteralValue(node.arguments[1]);
      if (ts.isIdentifier(node.expression) && node.expression.text === 'eval') {
        signals.dynamicEvalCount += 1;
      }

      if (
        (
          (ts.isIdentifier(node.expression) && ['setTimeout', 'setInterval'].includes(node.expression.text))
          || (
            ts.isPropertyAccessExpression(node.expression)
            && ts.isIdentifier(node.expression.expression)
            && node.expression.expression.text === 'window'
            && isPropertyNamed(node.expression.name, 'setTimeout', 'setInterval')
          )
        )
        && typeof firstArgumentLiteral === 'string'
      ) {
        signals.dynamicEvalCount += 1;
      }

      if (
        (isFetchLikeCall(node) || isAxiosLikeCall(node))
        && isInsecureTransportUrl(firstArgumentLiteral)
      ) {
        signals.insecureTransportEndpointCount += 1;
      }

      if (isRouteTransitionCall(node) && expressionContainsOpenRedirectSource(node.arguments[0], sourceFile)) {
        signals.authOpenRedirectSignalCount += 1;
      }

      if (isRouteTransitionCall(node) && isExternalUrl(firstArgumentLiteral)) {
        signals.authExternalRedirectSignalCount += 1;
        if (isAuthProviderUrlMissingState(firstArgumentLiteral)) {
          signals.authProviderStateMissingCount += 1;
        }
        if (isAuthProviderCodeFlowMissingPkce(firstArgumentLiteral)) {
          signals.authProviderPkceMissingCount += 1;
        }
        if (isAuthProviderIdTokenFlowMissingNonce(firstArgumentLiteral)) {
          signals.authProviderNonceMissingCount += 1;
        }
      }

      if (
        isAxiosConfigCall(node)
        && isInsecureTransportUrl(getObjectLiteralStringPropertyValue(node.arguments[0], 'url', 'baseURL', 'baseUrl'))
      ) {
        signals.insecureTransportEndpointCount += 1;
      }

      if (
        ts.isPropertyAccessExpression(node.expression)
        && isLocationObjectExpression(node.expression.expression)
        && isPropertyNamed(node.expression.name, 'assign', 'replace')
        && isInsecureTransportUrl(firstArgumentLiteral)
      ) {
        signals.insecureTransportEndpointCount += 1;
      }

      if (
        ts.isPropertyAccessExpression(node.expression)
        && isLocationObjectExpression(node.expression.expression)
        && isPropertyNamed(node.expression.name, 'assign', 'replace')
        && isExternalUrl(firstArgumentLiteral)
      ) {
        signals.authExternalRedirectSignalCount += 1;
        if (isAuthProviderUrlMissingState(firstArgumentLiteral)) {
          signals.authProviderStateMissingCount += 1;
        }
        if (isAuthProviderCodeFlowMissingPkce(firstArgumentLiteral)) {
          signals.authProviderPkceMissingCount += 1;
        }
        if (isAuthProviderIdTokenFlowMissingNonce(firstArgumentLiteral)) {
          signals.authProviderNonceMissingCount += 1;
        }
      }

      if (
        ts.isPropertyAccessExpression(node.expression)
        && isPropertyNamed(node.expression.name, 'postMessage')
        && secondArgumentLiteral === '*'
      ) {
        signals.wildcardPostMessageCount += 1;
      }

      if (isAddEventListenerCall(node) && firstArgumentLiteral === 'message') {
        const handler = resolveFunctionLikeHandler(node.arguments[1], namedFunctionDeclarations);
        if (handler && !functionLikeReferencesOrigin(handler)) {
          signals.messageListenerWithoutOriginCheckCount += 1;
        }
      }

      if (
        ts.isPropertyAccessExpression(node.expression)
        && isPropertyNamed(node.expression.name, 'setHeader', 'append', 'set')
        && isSetCookieHeaderName(node.arguments[0])
      ) {
        const cookieStrings = collectCookieHeaderStrings(node.arguments[1]);
        const authCookieStrings = cookieStrings.filter(cookieHeaderStringLooksAuthLike);
        if (authCookieStrings.length > 0) {
          signals.authCookieWriteCount += authCookieStrings.length;
          signals.authCookieMissingHardeningCount += authCookieStrings.filter(value => !cookieHeaderStringHasHardening(value)).length;
        } else {
          const cookieHeaderSource = node.arguments[1]?.getText(sourceFile) ?? '';
          if (cookieHeaderStringLooksAuthLike(cookieHeaderSource)) {
            signals.authCookieWriteCount += 1;
            if (!cookieHeaderStringHasHardening(cookieHeaderSource)) {
              signals.authCookieMissingHardeningCount += 1;
            }
          }
        }
      }

      if (
        (
          (ts.isIdentifier(node.expression) && node.expression.text === 'open')
          || (
            ts.isPropertyAccessExpression(node.expression)
            && ts.isIdentifier(node.expression.expression)
            && node.expression.expression.text === 'window'
            && isPropertyNamed(node.expression.name, 'open')
          )
        )
        && secondArgumentLiteral === '_blank'
      ) {
        const featureLiteral = getExpressionLiteralValue(node.arguments[2])?.toLowerCase() ?? '';
        if (!featureLiteral.includes('noopener') || !featureLiteral.includes('noreferrer')) {
          signals.windowOpenWithoutNoopenerCount += 1;
        }
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
          isCookieMutationSetCall(node)
        ) {
          const firstArgument = node.arguments[0];
          const isObjectConfigCall = ts.isObjectLiteralExpression(firstArgument);
          const isAuthCookieWrite = isObjectConfigCall
            ? objectLiteralLooksLikeAuthCookieConfig(firstArgument, sourceFile)
            : expressionLooksLikeAuthCookieName(firstArgument, sourceFile);
          if (isAuthCookieWrite) {
            signals.authCookieWriteCount += 1;
            const hardeningSource = isObjectConfigCall ? firstArgument : node.arguments[2];
            if (!hasExplicitAuthCookieHardening(hardeningSource)) {
              signals.authCookieMissingHardeningCount += 1;
            }
          }
        }
        if (
          isPropertyNamed(node.expression.name, 'delete')
          && node.arguments.length > 0
          && isAuthorizationHeaderName(node.arguments[0])
        ) {
          signals.authHeaderClearCount += 1;
        }
        if (
          (isPropertyNamed(node.expression.name, 'set') || isPropertyNamed(node.expression.name, 'append'))
          && node.arguments.length > 0
          && isAuthorizationHeaderName(node.arguments[0])
        ) {
          if (isHeaderClearValue(node.arguments[1])) {
            signals.authHeaderClearCount += 1;
          } else {
            signals.authHeaderWriteCount += 1;
          }
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
      && isRealtimeTransportConstructor(node)
      && isInsecureTransportUrl(getExpressionLiteralValue(node.arguments?.[0]))
    ) {
      signals.insecureTransportEndpointCount += 1;
    }

    if (
      ts.isNewExpression(node)
      && ts.isIdentifier(node.expression)
      && node.expression.text === 'Function'
    ) {
      signals.dynamicEvalCount += 1;
    }

    if (
      ts.isNewExpression(node)
      && ts.isIdentifier(node.expression)
      && ['WebSocket', 'EventSource'].includes(node.expression.text)
      && isInsecureTransportUrl(getExpressionLiteralValue(node.arguments?.[0]))
    ) {
      signals.insecureTransportEndpointCount += 1;
    }

    if (ts.isJsxSelfClosingElement(node)) {
      const tagName = getJsxTagName(node);
      if (hasMainLandmarkSignal(node.attributes, tagName)) {
        signals.mainLandmarkCount += 1;
      }
      if (isNavigationLandmark(tagName, node.attributes)) {
        navigationLandmarkCount += 1;
        if (!hasNavigationLabel(node.attributes)) {
          unlabeledNavigationLandmarkCount += 1;
        }
      }
      const mainLandmarkId = getMainLandmarkId(node.attributes, tagName);
      if (mainLandmarkId && !signals.mainLandmarkIds.includes(mainLandmarkId)) {
        signals.mainLandmarkIds.push(mainLandmarkId);
      }
      const skipNavTargetId = getSkipNavTargetId(node.attributes, tagName);
      if (skipNavTargetId && !signals.skipNavTargetIds.includes(skipNavTargetId)) {
        signals.skipNavTargetIds.push(skipNavTargetId);
      }
      if (tagName === 'button' && hasAncestorJsxTag(node, 'form') && !getJsxAttribute(node.attributes, 'type')) {
        signals.buttonInFormWithoutTypeCount += 1;
      }
      if (tagName === 'button' && !hasAccessibleLabel(node.attributes, '')) {
        signals.iconOnlyButtonWithoutLabelCount += 1;
      }
      if (isLinkLikeTag(tagName) && !hasAccessibleLabel(node.attributes, '')) {
        signals.iconOnlyLinkWithoutLabelCount += 1;
      }
      if (isImageLikeTag(tagName) && !getJsxAttribute(node.attributes, 'alt')) {
        signals.imageWithoutAltCount += 1;
      }
      if (isImageSourceLikeTag(tagName) && isInsecureExternalImage(node.attributes)) {
        signals.insecureExternalImageCount += 1;
      }
      if (tagName === 'iframe' && !getJsxAttribute(node.attributes, 'title')) {
        signals.iframeWithoutTitleCount += 1;
      }
      if (isDialogLikeElement(node.attributes, tagName) && !hasDialogLabel(node.attributes)) {
        signals.dialogWithoutLabelCount += 1;
      }
      if (isDialogLikeElement(node.attributes, tagName) && !hasDialogModalHint(node.attributes, tagName)) {
        signals.dialogWithoutModalHintCount += 1;
      }
      if (
        tagName === 'iframe'
        && isExternalUrl(getJsxAttributeLiteralValue(getJsxAttribute(node.attributes, 'src')))
        && !getJsxAttribute(node.attributes, 'sandbox')
      ) {
        signals.externalIframeWithoutSandboxCount += 1;
      }
      if (
        tagName === 'iframe'
        && isInsecureExternalUrl(getJsxAttributeLiteralValue(getJsxAttribute(node.attributes, 'src')))
      ) {
        signals.insecureExternalIframeCount += 1;
      }
      if (tagName === 'form' && hasInsecureFormAction(node.attributes)) {
        signals.insecureFormActionCount += 1;
      }
      if (
        isNonSemanticInteractiveTag(tagName)
        && getJsxAttribute(node.attributes, 'onClick')
        && !getJsxAttribute(node.attributes, 'role')
        && !getJsxAttribute(node.attributes, 'tabIndex')
      ) {
        signals.clickableNonSemanticCount += 1;
      }
      if (isLinkLikeTag(tagName) && isExternalLinkTargetBlankWithoutRel(node.attributes)) {
        signals.externalBlankLinkWithoutRelCount += 1;
      }
      if (hasPlaceholderNavigationTarget(node.attributes)) {
        signals.placeholderNavigationTargetCount += 1;
      }
      if (tagName === 'input') {
        const inputType = getNormalizedInputType(node.attributes);
        const autocompleteValue = getJsxAttributeLiteralValue(getJsxAttribute(node.attributes, 'autocomplete', 'autoComplete'))
          ?.trim()
          .toLowerCase();
        const hasAutocomplete = Boolean(autocompleteValue);
        if (inputType === 'email' && !hasAutocomplete) {
          signals.emailAutocompleteMissingCount += 1;
        }
        if (inputType === 'password' && !hasAutocomplete) {
          signals.passwordAutocompleteMissingCount += 1;
        }
        if (hasOtpAutocompleteIssue(node.attributes)) {
          signals.otpAutocompleteMissingCount += 1;
        }
        if ((inputType === 'email' || inputType === 'password') && autocompleteValue === 'off') {
          signals.authAutocompleteDisabledCount += 1;
        }
        if (hasAuthAutocompleteSemanticMismatch(node.attributes)) {
          signals.authAutocompleteSemanticMismatchCount += 1;
        }
        if (hasAuthInputTypeMismatch(node.attributes)) {
          signals.authInputTypeMismatchCount += 1;
        }
        if (hasAncestorJsxTag(node, 'form') && isAuthLikeInputAttributes(node.attributes) && !getJsxAttribute(node.attributes, 'name')) {
          signals.authInputWithoutNameCount += 1;
        }
      }
      if (!hasFormControlLabel(node, tagName, node.attributes, labelForIds, '')) {
        signals.formControlWithoutLabelCount += 1;
      }
    }

    if (ts.isJsxElement(node)) {
      const tagName = getJsxTagName(node.openingElement);
      const textContent = getJsxTextContent(node).replace(/\s+/g, ' ').trim();

      if (hasMainLandmarkSignal(node.openingElement.attributes, tagName)) {
        signals.mainLandmarkCount += 1;
      }
      if (isNavigationLandmark(tagName, node.openingElement.attributes)) {
        navigationLandmarkCount += 1;
        if (!hasNavigationLabel(node.openingElement.attributes)) {
          unlabeledNavigationLandmarkCount += 1;
        }
      }
      const mainLandmarkId = getMainLandmarkId(node.openingElement.attributes, tagName);
      if (mainLandmarkId && !signals.mainLandmarkIds.includes(mainLandmarkId)) {
        signals.mainLandmarkIds.push(mainLandmarkId);
      }
      const skipNavTargetId = getSkipNavTargetId(node.openingElement.attributes, tagName);
      if (skipNavTargetId && !signals.skipNavTargetIds.includes(skipNavTargetId)) {
        signals.skipNavTargetIds.push(skipNavTargetId);
      }
      if (tagName === 'button' && hasAncestorJsxTag(node, 'form') && !getJsxAttribute(node.openingElement.attributes, 'type')) {
        signals.buttonInFormWithoutTypeCount += 1;
      }
      if (tagName === 'button' && !hasAccessibleLabel(node.openingElement.attributes, textContent)) {
        signals.iconOnlyButtonWithoutLabelCount += 1;
      }
      if (isLinkLikeTag(tagName) && !hasAccessibleLabel(node.openingElement.attributes, textContent)) {
        signals.iconOnlyLinkWithoutLabelCount += 1;
      }
      if (isImageLikeTag(tagName) && !getJsxAttribute(node.openingElement.attributes, 'alt')) {
        signals.imageWithoutAltCount += 1;
      }
      if (isImageSourceLikeTag(tagName) && isInsecureExternalImage(node.openingElement.attributes)) {
        signals.insecureExternalImageCount += 1;
      }
      if (tagName === 'iframe' && !getJsxAttribute(node.openingElement.attributes, 'title')) {
        signals.iframeWithoutTitleCount += 1;
      }
      if (isDialogLikeElement(node.openingElement.attributes, tagName) && !hasDialogLabel(node.openingElement.attributes)) {
        signals.dialogWithoutLabelCount += 1;
      }
      if (isDialogLikeElement(node.openingElement.attributes, tagName) && !hasDialogModalHint(node.openingElement.attributes, tagName)) {
        signals.dialogWithoutModalHintCount += 1;
      }
      if (
        tagName === 'iframe'
        && isExternalUrl(getJsxAttributeLiteralValue(getJsxAttribute(node.openingElement.attributes, 'src')))
        && !getJsxAttribute(node.openingElement.attributes, 'sandbox')
      ) {
        signals.externalIframeWithoutSandboxCount += 1;
      }
      if (
        tagName === 'iframe'
        && isInsecureExternalUrl(getJsxAttributeLiteralValue(getJsxAttribute(node.openingElement.attributes, 'src')))
      ) {
        signals.insecureExternalIframeCount += 1;
      }
      if (tagName === 'form' && hasInsecureFormAction(node.openingElement.attributes)) {
        signals.insecureFormActionCount += 1;
      }
      if (tagName === 'form' && hasInsecureAuthFormMethod(node)) {
        signals.insecureAuthFormMethodCount += 1;
      }
      if (tagName === 'form' && hasAuthFormWithoutSubmitControl(node)) {
        signals.authFormWithoutSubmitCount += 1;
      }
      if (tagName === 'table' && !jsxTreeHasTag(node, ['th'])) {
        signals.tableWithoutHeaderCount += 1;
      }
      if (tagName === 'table' && !jsxTreeHasTag(node, ['caption'])) {
        signals.tableWithoutCaptionCount += 1;
      }

      if (
        isNonSemanticInteractiveTag(tagName)
        && getJsxAttribute(node.openingElement.attributes, 'onClick')
        && !getJsxAttribute(node.openingElement.attributes, 'role')
        && !getJsxAttribute(node.openingElement.attributes, 'tabIndex')
      ) {
        signals.clickableNonSemanticCount += 1;
      }
      if (isLinkLikeTag(tagName) && isExternalLinkTargetBlankWithoutRel(node.openingElement.attributes)) {
        signals.externalBlankLinkWithoutRelCount += 1;
      }
      if (hasPlaceholderNavigationTarget(node.openingElement.attributes)) {
        signals.placeholderNavigationTargetCount += 1;
      }
      if (tagName === 'input') {
        const inputType = getNormalizedInputType(node.openingElement.attributes);
        const autocompleteValue = getJsxAttributeLiteralValue(getJsxAttribute(node.openingElement.attributes, 'autocomplete', 'autoComplete'))
          ?.trim()
          .toLowerCase();
        const hasAutocomplete = Boolean(autocompleteValue);
        if (inputType === 'email' && !hasAutocomplete) {
          signals.emailAutocompleteMissingCount += 1;
        }
        if (inputType === 'password' && !hasAutocomplete) {
          signals.passwordAutocompleteMissingCount += 1;
        }
        if (hasOtpAutocompleteIssue(node.openingElement.attributes)) {
          signals.otpAutocompleteMissingCount += 1;
        }
        if ((inputType === 'email' || inputType === 'password') && autocompleteValue === 'off') {
          signals.authAutocompleteDisabledCount += 1;
        }
        if (hasAuthAutocompleteSemanticMismatch(node.openingElement.attributes)) {
          signals.authAutocompleteSemanticMismatchCount += 1;
        }
        if (hasAuthInputTypeMismatch(node.openingElement.attributes)) {
          signals.authInputTypeMismatchCount += 1;
        }
        if (
          hasAncestorJsxTag(node, 'form')
          && isAuthLikeInputAttributes(node.openingElement.attributes)
          && !getJsxAttribute(node.openingElement.attributes, 'name')
        ) {
          signals.authInputWithoutNameCount += 1;
        }
      }
      if (!hasFormControlLabel(node, tagName, node.openingElement.attributes, labelForIds, textContent)) {
        signals.formControlWithoutLabelCount += 1;
      }
    }

    ts.forEachChild(node, walk);
  };

  walk(sourceFile);
  signals.unlabeledNavigationLandmarkCount = navigationLandmarkCount > 1 ? unlabeledNavigationLandmarkCount : 0;
  signals.multipleMainLandmarkCount = Math.max(0, signals.mainLandmarkCount - 1);
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
  const iconLinkIssues = astSignals.iconOnlyLinkWithoutLabelCount;
  const clickableNonSemanticIssues = astSignals.clickableNonSemanticCount;
  const unlabeledNavigationLandmarkIssues = astSignals.unlabeledNavigationLandmarkCount;
  const multipleMainLandmarkIssues = astSignals.multipleMainLandmarkCount;
  const imageAltIssues = astSignals.imageWithoutAltCount;
  const iframeTitleIssues = astSignals.iframeWithoutTitleCount;
  const dialogLabelIssues = astSignals.dialogWithoutLabelCount;
  const dialogModalHintIssues = astSignals.dialogWithoutModalHintCount;
  const tableHeaderIssues = astSignals.tableWithoutHeaderCount;
  const tableCaptionIssues = astSignals.tableWithoutCaptionCount;
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
        - (iconLinkIssues > 0 ? 1 : 0)
        - (clickableNonSemanticIssues > 0 ? 1 : 0)
        - (unlabeledNavigationLandmarkIssues > 0 ? 1 : 0)
        - (multipleMainLandmarkIssues > 0 ? 1 : 0)
        - (imageAltIssues > 0 ? 1 : 0)
        - (iframeTitleIssues > 0 ? 1 : 0)
        - (dialogLabelIssues > 0 ? 1 : 0)
        - (dialogModalHintIssues > 0 ? 1 : 0)
        - (tableHeaderIssues > 0 ? 1 : 0)
        - (tableCaptionIssues > 0 ? 1 : 0)
        - (formControlLabelIssues > 0 ? 1 : 0),
      ),
    ),
    details: `ARIA: ${hasAria ? 'yes' : 'no'}, Focus: ${hasFocus ? 'yes' : 'no'}, Keyboard: ${hasKeyboard ? 'yes' : 'no'}, unlabeled icon buttons: ${iconButtonIssues}, unlabeled icon links: ${iconLinkIssues}, clickable non-semantic elements: ${clickableNonSemanticIssues}, unlabeled navigation landmarks: ${unlabeledNavigationLandmarkIssues}, extra main landmarks: ${multipleMainLandmarkIssues}, images without alt: ${imageAltIssues}, iframes without title: ${iframeTitleIssues}, dialogs without label: ${dialogLabelIssues}, dialogs without modal hint: ${dialogModalHintIssues}, tables without headers: ${tableHeaderIssues}, tables without caption: ${tableCaptionIssues}, form controls without labels: ${formControlLabelIssues}`,
    suggestions: [
      ...(!hasAria ? ['Add ARIA roles or labels to interactive regions.'] : []),
      ...(!hasFocus ? ['Add visible focus styling for keyboard navigation.'] : []),
      ...(!hasKeyboard ? ['Add keyboard handling where interactive behavior depends on pointer events.'] : []),
      ...(iconButtonIssues > 0 ? ['Add accessible labels to icon-only buttons via visible text or aria-label.'] : []),
      ...(iconLinkIssues > 0 ? ['Add accessible labels to icon-only links via visible text or aria-label.'] : []),
      ...(clickableNonSemanticIssues > 0 ? ['Use semantic interactive elements or add role/tabIndex and keyboard handling to clickable non-semantic containers.'] : []),
      ...(unlabeledNavigationLandmarkIssues > 0 ? ['Give multiple navigation landmarks distinct labels so assistive technologies can differentiate primary, sidebar, and utility nav regions.'] : []),
      ...(multipleMainLandmarkIssues > 0 ? ['Keep only one primary main landmark per rendered page or shell surface.'] : []),
      ...(imageAltIssues > 0 ? ['Add alt text to meaningful images and use alt="" only for decorative ones.'] : []),
      ...(iframeTitleIssues > 0 ? ['Add descriptive title attributes to embedded iframes so assistive technologies can identify their purpose.'] : []),
      ...(dialogLabelIssues > 0 ? ['Give dialogs an explicit accessible name via aria-label, aria-labelledby, or title.'] : []),
      ...(dialogModalHintIssues > 0 ? ['Expose modal intent on dialog surfaces with aria-modal="true" or a native open dialog contract.'] : []),
      ...(tableHeaderIssues > 0 ? ['Give tables explicit header cells so assistive technologies can map data cells to column or row labels.'] : []),
      ...(tableCaptionIssues > 0 ? ['Add a caption or equivalent programmatic summary so the table purpose is clear before users navigate its cells.'] : []),
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
    if (iconLinkIssues > 0) {
      findings.push(makeFinding({
        id: 'accessibility-icon-link-label-missing',
        category: 'Accessibility',
        severity: resolveSeverityFromChecks(reviewPack, 'warn', ['review-contract-baseline']),
        message: 'Icon-only link elements were detected without an accessible label.',
        evidence: [filePath, `Unlabeled icon links: ${iconLinkIssues}`],
        file: filePath,
        suggestedFix: 'Add visible text or an aria-label/aria-labelledby attribute to icon-only links.',
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
    if (unlabeledNavigationLandmarkIssues > 0) {
      findings.push(makeFinding({
        id: 'accessibility-navigation-landmark-label-missing',
        category: 'Accessibility',
        severity: resolveSeverityFromChecks(reviewPack, 'warn', ['review-contract-baseline']),
        message: 'Multiple navigation landmarks were detected without distinct accessible labels.',
        evidence: [filePath, `Unlabeled navigation landmarks: ${unlabeledNavigationLandmarkIssues}`],
        file: filePath,
        suggestedFix: 'Label multiple nav regions with aria-label or aria-labelledby so assistive technologies can distinguish primary, sidebar, and utility navigation.',
      }));
    }
    if (multipleMainLandmarkIssues > 0) {
      findings.push(makeFinding({
        id: 'accessibility-multiple-main-landmarks',
        category: 'Accessibility',
        severity: resolveSeverityFromChecks(reviewPack, 'warn', ['review-contract-baseline']),
        message: 'Multiple main landmarks were detected in the reviewed file.',
        evidence: [filePath, `Extra main landmarks beyond the first: ${multipleMainLandmarkIssues}`],
        file: filePath,
        suggestedFix: 'Render one primary `<main>` landmark per page or shell surface and move secondary regions into section/article/div containers instead.',
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
    if (iframeTitleIssues > 0) {
      findings.push(makeFinding({
        id: 'accessibility-iframe-title-missing',
        category: 'Accessibility',
        severity: resolveSeverityFromChecks(reviewPack, 'warn', ['review-contract-baseline']),
        message: 'Iframe elements were detected without a descriptive `title` attribute.',
        evidence: [filePath, `Iframes without title: ${iframeTitleIssues}`],
        file: filePath,
        suggestedFix: 'Add a concise title attribute to each iframe so assistive technologies can describe the embedded surface.',
      }));
    }
    if (dialogLabelIssues > 0) {
      findings.push(makeFinding({
        id: 'accessibility-dialog-label-missing',
        category: 'Accessibility',
        severity: resolveSeverityFromChecks(reviewPack, 'warn', ['review-contract-baseline']),
        message: 'Dialog surfaces were detected without an explicit accessible name.',
        evidence: [filePath, `Dialogs without aria-label/aria-labelledby/title: ${dialogLabelIssues}`],
        file: filePath,
        suggestedFix: 'Name dialogs with aria-label, aria-labelledby, or title so assistive technologies can announce the dialog context.',
      }));
    }
    if (dialogModalHintIssues > 0) {
      findings.push(makeFinding({
        id: 'accessibility-dialog-modal-hint-missing',
        category: 'Accessibility',
        severity: resolveSeverityFromChecks(reviewPack, 'info', ['review-remediation', 'review-contract-baseline']),
        message: 'Dialog surfaces were detected without an explicit modal hint.',
        evidence: [filePath, `Dialogs without aria-modal/open signal: ${dialogModalHintIssues}`],
        file: filePath,
        suggestedFix: 'Expose modal intent with aria-modal="true" for custom dialogs, or rely on a reviewed native dialog/open contract.',
      }));
    }
    if (tableHeaderIssues > 0) {
      findings.push(makeFinding({
        id: 'accessibility-table-headers-missing',
        category: 'Accessibility',
        severity: resolveSeverityFromChecks(reviewPack, 'warn', ['review-contract-baseline']),
        message: 'Table markup was detected without header cells.',
        evidence: [filePath, `Tables without <th> headers: ${tableHeaderIssues}`],
        file: filePath,
        suggestedFix: 'Add <th> cells with appropriate scope or otherwise expose explicit table headers so assistive technologies can map the data grid correctly.',
      }));
    }
    if (tableCaptionIssues > 0) {
      findings.push(makeFinding({
        id: 'accessibility-table-caption-missing',
        category: 'Accessibility',
        severity: resolveSeverityFromChecks(reviewPack, 'info', ['review-remediation', 'review-contract-baseline']),
        message: 'Table markup was detected without a caption or programmatic summary.',
        evidence: [filePath, `Tables without caption: ${tableCaptionIssues}`],
        file: filePath,
        suggestedFix: 'Add a <caption> or equivalent summary so users understand the table purpose before navigating its cells.',
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
  const authFormWithoutSubmitCount = astSignals.authFormWithoutSubmitCount;
  const authInputWithoutNameCount = astSignals.authInputWithoutNameCount;
  const authProtectedRedirectSignalCount = astSignals.authProtectedRedirectSignalCount;
  const authAnonymousRedirectSignalCount = astSignals.authAnonymousRedirectSignalCount;
  const authExitSignalCount = astSignals.authExitSignalCount;
  const authSessionTeardownSignalCount = astSignals.authSessionTeardownSignalCount;
  const authStorageWriteCount = astSignals.authStorageWriteCount;
  const authStorageClearCount = astSignals.authStorageClearCount;
  const authCookieWriteCount = astSignals.authCookieWriteCount;
  const authCookieClearCount = astSignals.authCookieClearCount;
  const authHeaderWriteCount = astSignals.authHeaderWriteCount;
  const authHeaderClearCount = astSignals.authHeaderClearCount;
  const authCacheClientCount = astSignals.authCacheClientCount;
  const authCacheClearCount = astSignals.authCacheClearCount;
  const authRefreshSignalCount = astSignals.authRefreshSignalCount;
  const authRefreshClearCount = astSignals.authRefreshClearCount;
  const authRealtimeSignalCount = countAuthRealtimeSignals(code);
  const authRealtimeClearCount = countAuthRealtimeClearSignals(code);
  const authCoordinationSignalCount = countAuthCoordinationSignals(code);
  const authCoordinationClearCount = countAuthCoordinationClearSignals(code);
  const authErrorSignalCount = countAuthErrorSignals(code);
  const authSuccessSignalCount = countAuthSuccessSignals(code);
  const authCallbackTokenSignalCount = countAuthCallbackTokenSignals(code, filePath);
  const authCallbackExchangeSignalCount = countAuthCallbackExchangeSignals(code);
  const authCallbackExchangeErrorSignalCount = countAuthCallbackExchangeErrorSignals(code);
  const authCallbackErrorSignalCount = countAuthCallbackErrorSignals(code, filePath);
  const authCallbackStateSignalCount = countAuthCallbackStateSignals(code);
  const authCallbackStateValidationSignalCount = countAuthCallbackStateValidationSignals(code);
  const authCallbackStateStorageSignalCount = countAuthCallbackStateStorageSignals(code);
  const authCallbackStateStorageClearSignalCount = countAuthCallbackStateStorageClearSignals(code);
  const authUnauthenticatedBranchSignalCount = countAuthUnauthenticatedBranchSignals(code);
  const hasAuthCallbackErrorGap = authCallbackTokenSignalCount > 0 && authCallbackErrorSignalCount === 0;
  scores.push({
    category: 'Motion & Interaction',
    focusArea: 'motion-interaction',
    score: Math.max(1, Math.min(5, (hasTransition ? 3 : 1) + (hasHover ? 2 : 0) - (buttonInFormWithoutTypeCount > 0 ? 1 : 0) - (authFormWithoutSubmitCount > 0 ? 1 : 0) - (authInputWithoutNameCount > 0 ? 1 : 0) - (authExitSignalCount > 0 && authSessionTeardownSignalCount === 0 ? 1 : 0))),
    details: `Transitions: ${hasTransition ? 'yes' : 'no'}, Hover states: ${hasHover ? 'yes' : 'no'}, form buttons missing type: ${buttonInFormWithoutTypeCount}, auth forms without submit control: ${authFormWithoutSubmitCount}, auth inputs without name: ${authInputWithoutNameCount}, auth redirects to protected routes: ${authProtectedRedirectSignalCount}, auth exits without anonymous redirect: ${authExitSignalCount > 0 && authAnonymousRedirectSignalCount === 0 ? 1 : 0}, auth exits without teardown: ${authExitSignalCount > 0 && authSessionTeardownSignalCount === 0 ? 1 : 0}`,
    suggestions: [
      ...(!hasTransition ? ['Add transitions for interactive state changes where appropriate.'] : []),
      ...(buttonInFormWithoutTypeCount > 0 ? ['Add explicit button types inside forms so non-submit actions do not accidentally submit.'] : []),
      ...(authFormWithoutSubmitCount > 0 ? ['Auth-like forms should expose a clear submit control so users can actually complete the credential flow.'] : []),
      ...(authInputWithoutNameCount > 0 ? ['Give auth-related form inputs stable `name` attributes so browser form posts and FormData submissions include the credential values.'] : []),
      ...(authProtectedRedirectSignalCount > 0 ? ['Keep unauthenticated guard redirects pointed at anonymous entry routes, not protected destinations like `/dashboard` or `/app`.'] : []),
      ...(authExitSignalCount > 0 && authAnonymousRedirectSignalCount === 0 ? ['After sign-out, return users to an anonymous entry route instead of leaving the protected shell in place.'] : []),
      ...(authExitSignalCount > 0 && authSessionTeardownSignalCount === 0 ? ['Do not treat redirect-only logout as a complete sign-out. Explicitly invalidate the reviewed session before returning users to an anonymous route.'] : []),
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

  if (authFormWithoutSubmitCount > 0) {
    findings.push(makeFinding({
      id: 'interaction-auth-submit-missing',
      category: 'Interaction Safety',
      severity: 'warn',
      message: 'Auth-like forms were detected without any submit control.',
      evidence: [filePath, `Auth forms without submit control: ${authFormWithoutSubmitCount}`],
      file: filePath,
      suggestedFix: 'Add an explicit submit button or submit input so users can complete the sign-in, registration, or recovery flow.',
    }));
  }

  if (authInputWithoutNameCount > 0) {
    findings.push(makeFinding({
      id: 'interaction-auth-input-name-missing',
      category: 'Interaction Safety',
      severity: 'warn',
      message: 'Auth-like form inputs were detected without a `name` attribute.',
      evidence: [filePath, `Auth inputs without name: ${authInputWithoutNameCount}`],
      file: filePath,
      suggestedFix: 'Add stable name attributes such as `email`, `username`, or `password` so browser form submission and FormData handling include the credential values.',
    }));
  }

  if (
    authProtectedRedirectSignalCount > 0
    && (astSignals.authGuardSignalCount > 0 || astSignals.authSessionSignalCount > 0)
    && astSignals.authEntrySignalCount === 0
  ) {
    findings.push(makeFinding({
      id: 'route-auth-guard-protected-redirect',
      category: 'Route Topology',
      severity: 'warn',
      message: 'Auth/session logic in the reviewed file redirects toward protected destinations instead of anonymous entry routes.',
      evidence: [filePath, `Protected auth redirects: ${authProtectedRedirectSignalCount}`],
      file: filePath,
      suggestedFix: 'Redirect unauthenticated flows to `/`, `/login`, `/register`, or another gateway route, and reserve redirects to `/dashboard` or `/app` for reviewed post-auth success flows.',
    }));
  }

  if (
    authExitSignalCount > 0
    && (astSignals.authSessionSignalCount > 0 || astSignals.authGuardSignalCount > 0)
    && authAnonymousRedirectSignalCount === 0
  ) {
    findings.push(makeFinding({
      id: 'route-auth-exit-redirect-missing',
      category: 'Route Topology',
      severity: 'info',
      message: 'Auth/session exit logic does not show an obvious redirect back to an anonymous entry route.',
      evidence: [filePath, `Auth exit signals: ${authExitSignalCount}`, `Anonymous auth redirects: ${authAnonymousRedirectSignalCount}`],
      file: filePath,
      suggestedFix: 'After logout or session exit, navigate users to `/`, `/login`, `/register`, or another reviewed anonymous entry route so protected shells do not linger after sign-out.',
    }));
  }

  if (
    authExitSignalCount > 0
    && (astSignals.authSessionSignalCount > 0 || astSignals.authGuardSignalCount > 0)
    && authSessionTeardownSignalCount === 0
  ) {
    findings.push(makeFinding({
      id: 'state-auth-exit-teardown-missing',
      category: 'State Handling',
      severity: 'warn',
      message: 'Auth/session exit logic redirects users away but does not show an obvious session teardown or sign-out boundary.',
      evidence: [filePath, `Auth exit signals: ${authExitSignalCount}`, `Session teardown signals: ${authSessionTeardownSignalCount}`],
      file: filePath,
      suggestedFix: 'Before redirecting users to `/login` or another anonymous route, explicitly sign out or invalidate the reviewed session state.',
    }));
  }

  if (
    authExitSignalCount > 0
    && authStorageWriteCount > 0
    && authStorageClearCount === 0
  ) {
    findings.push(makeFinding({
      id: 'state-auth-storage-teardown-missing',
      category: 'State Handling',
      severity: 'warn',
      message: 'The reviewed auth exit flow writes auth data into browser storage but does not show that storage being cleared during sign-out.',
      evidence: [filePath, `Auth storage writes: ${authStorageWriteCount}`, `Auth storage clears: ${authStorageClearCount}`],
      file: filePath,
      suggestedFix: 'If this flow stores auth/session data in browser storage, remove those auth keys during sign-out before redirecting users back to an anonymous route.',
    }));
  }

  if (
    authExitSignalCount > 0
    && authCookieWriteCount > 0
    && authCookieClearCount === 0
  ) {
    findings.push(makeFinding({
      id: 'state-auth-cookie-teardown-missing',
      category: 'State Handling',
      severity: 'warn',
      message: 'The reviewed auth exit flow issues auth-like cookies but does not show them being cleared during sign-out.',
      evidence: [filePath, `Auth cookie writes: ${authCookieWriteCount}`, `Auth cookie clears: ${authCookieClearCount}`],
      file: filePath,
      suggestedFix: 'If this flow issues auth cookies from reviewed source code, explicitly expire or delete those cookies during sign-out before redirecting users back to an anonymous route.',
    }));
  }

  if (
    authExitSignalCount > 0
    && authHeaderWriteCount > 0
    && authHeaderClearCount === 0
  ) {
    findings.push(makeFinding({
      id: 'state-auth-header-teardown-missing',
      category: 'State Handling',
      severity: 'warn',
      message: 'The reviewed auth exit flow constructs auth-like headers but does not show them being cleared during sign-out.',
      evidence: [filePath, `Auth header writes: ${authHeaderWriteCount}`, `Auth header clears: ${authHeaderClearCount}`],
      file: filePath,
      suggestedFix: 'If this flow constructs auth/session headers in reviewed source code, explicitly delete or reset those header values during sign-out before redirecting users back to an anonymous route.',
    }));
  }

  if (
    authExitSignalCount > 0
    && authCacheClientCount > 0
    && authCacheClearCount === 0
    && (astSignals.protectedSurfaceSignalCount > 0 || astSignals.authSessionSignalCount > 0)
  ) {
    findings.push(makeFinding({
      id: 'state-auth-cache-teardown-missing',
      category: 'State Handling',
      severity: 'warn',
      message: 'The reviewed auth exit flow uses client-side data caches but does not show them being cleared during sign-out.',
      evidence: [filePath, `Auth cache clients: ${authCacheClientCount}`, `Auth cache clears: ${authCacheClearCount}`],
      file: filePath,
      suggestedFix: 'If protected data is cached in query clients or client data stores, clear or reset those caches during sign-out before redirecting users back to an anonymous route.',
    }));
  }

  if (
    authExitSignalCount > 0
    && authRefreshSignalCount > 0
    && authRefreshClearCount === 0
  ) {
    findings.push(makeFinding({
      id: 'state-auth-refresh-teardown-missing',
      category: 'State Handling',
      severity: 'warn',
      message: 'The reviewed auth exit flow starts background auth refresh work but does not show it being torn down during sign-out.',
      evidence: [filePath, `Auth refresh signals: ${authRefreshSignalCount}`, `Auth refresh clears: ${authRefreshClearCount}`],
      file: filePath,
      suggestedFix: 'If auth/session refresh runs on timers or subscriptions, clear those intervals, timeouts, or listeners during sign-out before redirecting users back to an anonymous route.',
    }));
  }

  if (
    authExitSignalCount > 0
    && authRealtimeSignalCount > 0
    && authRealtimeClearCount === 0
    && (astSignals.protectedSurfaceSignalCount > 0 || astSignals.authSessionSignalCount > 0)
  ) {
    findings.push(makeFinding({
      id: 'state-auth-realtime-teardown-missing',
      category: 'State Handling',
      severity: 'warn',
      message: 'The reviewed auth exit flow starts realtime channels or sockets but does not show them being torn down during sign-out.',
      evidence: [filePath, `Auth realtime signals: ${authRealtimeSignalCount}`, `Auth realtime clears: ${authRealtimeClearCount}`],
      file: filePath,
      suggestedFix: 'If protected data arrives over websockets, SSE, or realtime channels, close or unsubscribe those connections during sign-out before redirecting users back to an anonymous route.',
    }));
  }

  if (
    authExitSignalCount > 0
    && authCoordinationSignalCount > 0
    && authCoordinationClearCount === 0
    && (astSignals.protectedSurfaceSignalCount > 0 || astSignals.authSessionSignalCount > 0)
  ) {
    findings.push(makeFinding({
      id: 'state-auth-coordination-teardown-missing',
      category: 'State Handling',
      severity: 'warn',
      message: 'The reviewed auth exit flow coordinates auth state across tabs but does not show those channels or listeners being torn down during sign-out.',
      evidence: [filePath, `Auth coordination signals: ${authCoordinationSignalCount}`, `Auth coordination clears: ${authCoordinationClearCount}`],
      file: filePath,
      suggestedFix: 'If auth state is coordinated across tabs with BroadcastChannel or storage listeners, close those channels and remove those listeners during sign-out before redirecting users back to an anonymous route.',
    }));
  }

  const hasProtectedRouteInReview = reviewPack?.data.routes.some(route => isProtectedLikeRoute(route.path)) ?? false;
  const hasRecoveryRouteInReview = reviewPack?.data.routes.some(route => isRecoveryLikeRoute(route.path)) ?? false;
  const hasSignInRouteInReview = reviewPack?.data.routes.some(route => isSignInLikeRoute(route.path)) ?? false;
  const hasRegistrationRouteInReview = reviewPack?.data.routes.some(route => isRegistrationLikeRoute(route.path)) ?? false;
  const hasAnonymousEntryRouteInReview = reviewPack?.data.routes.some(route => isAnonymousEntryLikeRoute(route.path)) ?? false;
  const signInFlowSignals = countSignInFlowSignals(code, filePath);
  const recoveryFlowSignals = countRecoveryFlowSignals(code, filePath);
  const signUpFlowSignals = countSignUpFlowSignals(code, filePath);
  const requiresProtectedSuccessTransition = signInFlowSignals > 0
    || (astSignals.authEntrySignalCount > 0 && signUpFlowSignals === 0 && recoveryFlowSignals === 0);
  const authRecoveryRouteSignalCount = countAuthRecoveryRouteSignals(code);
  const registrationRouteSignalCount = countRegistrationRouteSignals(code);
  const anonymousEntryRouteSignalCount = countAnonymousEntryRouteSignals(code);
  const signInRouteSignalCount = countSignInRouteSignals(code);
  if (
    requiresProtectedSuccessTransition
    && hasProtectedRouteInReview
    && authProtectedRedirectSignalCount === 0
  ) {
    findings.push(makeFinding({
      id: 'route-auth-success-redirect-missing',
      category: 'Route Topology',
      severity: 'info',
      message: 'The reviewed auth entry flow does not show an obvious transition into the protected application surface.',
      evidence: [
        filePath,
        `Auth entry signals: ${astSignals.authEntrySignalCount}`,
        `Protected auth redirects: ${authProtectedRedirectSignalCount}`,
      ],
      file: filePath,
      suggestedFix: 'After reviewed sign-in, registration, or recovery success, navigate users to a protected route like `/dashboard`, `/app`, or another primary destination declared in the compiled route contract.',
    }));
  }

  if (
    signInFlowSignals > 0
    && hasRecoveryRouteInReview
    && authRecoveryRouteSignalCount === 0
  ) {
    findings.push(makeFinding({
      id: 'route-auth-recovery-link-missing',
      category: 'Route Topology',
      severity: 'info',
      message: 'The reviewed sign-in flow does not show an obvious path into the declared account-recovery route.',
      evidence: [
        filePath,
        `Sign-in flow signals: ${signInFlowSignals}`,
        `Reviewed recovery routes: ${reviewPack?.data.routes.filter(route => isRecoveryLikeRoute(route.path)).map(route => route.path).join(', ') || 'none'}`,
        `Recovery route signals: ${authRecoveryRouteSignalCount}`,
      ],
      file: filePath,
      suggestedFix: 'Link sign-in users to the reviewed recovery route, such as `/forgot-password` or `/reset-password`, whenever the compiled route contract declares one.',
    }));
  }

  if (
    signInFlowSignals > 0
    && hasRegistrationRouteInReview
    && registrationRouteSignalCount === 0
  ) {
    findings.push(makeFinding({
      id: 'route-auth-registration-link-missing',
      category: 'Route Topology',
      severity: 'info',
      message: 'The reviewed sign-in flow does not show an obvious path into the declared registration route.',
      evidence: [
        filePath,
        `Sign-in flow signals: ${signInFlowSignals}`,
        `Reviewed registration routes: ${reviewPack?.data.routes.filter(route => isRegistrationLikeRoute(route.path)).map(route => route.path).join(', ') || 'none'}`,
        `Registration route signals: ${registrationRouteSignalCount}`,
      ],
      file: filePath,
      suggestedFix: 'Link sign-in users to the reviewed registration route, such as `/register` or `/sign-up`, whenever the compiled route contract declares one.',
    }));
  }

  if (
    recoveryFlowSignals > 0
    && hasAnonymousEntryRouteInReview
    && anonymousEntryRouteSignalCount === 0
  ) {
    findings.push(makeFinding({
      id: 'route-auth-entry-return-missing',
      category: 'Route Topology',
      severity: 'info',
      message: 'The reviewed recovery flow does not show an obvious path back into the declared anonymous entry route.',
      evidence: [
        filePath,
        `Recovery flow signals: ${recoveryFlowSignals}`,
        `Reviewed anonymous entry routes: ${reviewPack?.data.routes.filter(route => isAnonymousEntryLikeRoute(route.path)).map(route => route.path).join(', ') || 'none'}`,
        `Anonymous entry route signals: ${anonymousEntryRouteSignalCount}`,
      ],
      file: filePath,
      suggestedFix: 'Link recovery users back to a reviewed anonymous entry route, such as `/login`, `/register`, or `/`, whenever the compiled route contract declares one.',
    }));
  }

  if (
    signUpFlowSignals > 0
    && hasSignInRouteInReview
    && signInRouteSignalCount === 0
  ) {
    findings.push(makeFinding({
      id: 'route-auth-signin-link-missing',
      category: 'Route Topology',
      severity: 'info',
      message: 'The reviewed registration flow does not show an obvious path back into the declared sign-in route.',
      evidence: [
        filePath,
        `Registration flow signals: ${signUpFlowSignals}`,
        `Reviewed sign-in routes: ${reviewPack?.data.routes.filter(route => isSignInLikeRoute(route.path)).map(route => route.path).join(', ') || 'none'}`,
        `Sign-in route signals: ${signInRouteSignalCount}`,
      ],
      file: filePath,
      suggestedFix: 'Link registration users back to the reviewed sign-in route, such as `/login` or `/sign-in`, whenever the compiled route contract declares one.',
    }));
  }

  if (
    (
      (
        (authCallbackTokenSignalCount > 0 || authCallbackStateSignalCount > 0)
        && authCallbackErrorSignalCount > 0
      )
      || (
        authCallbackExchangeSignalCount > 0
        && authCallbackExchangeErrorSignalCount > 0
      )
    )
    && hasSignInRouteInReview
    && signInRouteSignalCount === 0
  ) {
    findings.push(makeFinding({
      id: 'route-auth-callback-entry-return-missing',
      category: 'Route Topology',
      severity: 'info',
      message: 'The reviewed auth callback failure path does not show an obvious route back to the declared sign-in surface.',
      evidence: [
        filePath,
        `Auth callback token reads: ${authCallbackTokenSignalCount}`,
        `Auth callback error signals: ${authCallbackErrorSignalCount}`,
        `Auth callback exchange signals: ${authCallbackExchangeSignalCount}`,
        `Auth callback exchange error signals: ${authCallbackExchangeErrorSignalCount}`,
        `Reviewed sign-in routes: ${reviewPack?.data.routes.filter(route => isSignInLikeRoute(route.path)).map(route => route.path).join(', ') || 'none'}`,
        `Sign-in route signals: ${signInRouteSignalCount}`,
      ],
      file: filePath,
      suggestedFix: 'When callback handling or callback session exchange fails, link or redirect users back to a reviewed sign-in route such as `/login` or `/sign-in` instead of leaving users on an isolated callback failure state.',
    }));
  }

  if (
    astSignals.authSessionSignalCount > 0
    && astSignals.authLoadingSignalCount === 0
  ) {
    findings.push(makeFinding({
      id: 'state-auth-loading-missing',
      category: 'State Handling',
      severity: 'info',
      message: 'The reviewed auth/session flow does not show an obvious loading or pending state while session resolution happens.',
      evidence: [
        filePath,
        `Auth/session signals: ${astSignals.authSessionSignalCount}`,
        `Auth loading signals: ${astSignals.authLoadingSignalCount}`,
      ],
      file: filePath,
      suggestedFix: 'Render an explicit loading, pending, skeleton, or suspense fallback while auth or session state resolves so protected content does not flash or race.',
    }));
  }

  if (
    astSignals.protectedSurfaceSignalCount > 0
    && astSignals.authSessionSignalCount > 0
    && astSignals.authLoadingSignalCount > 0
    && astSignals.authProtectedLoadingRenderCount > 0
  ) {
    findings.push(makeFinding({
      id: 'state-auth-loading-protected-render',
      category: 'State Handling',
      severity: 'warn',
      message: 'The reviewed protected surface shows a loading branch, but that branch still appears to render a protected destination while session state is unresolved.',
      evidence: [
        filePath,
        `Protected surface signals: ${astSignals.protectedSurfaceSignalCount}`,
        `Auth/session signals: ${astSignals.authSessionSignalCount}`,
        `Auth loading signals: ${astSignals.authLoadingSignalCount}`,
        `Protected loading renders: ${astSignals.authProtectedLoadingRenderCount}`,
      ],
      file: filePath,
      suggestedFix: 'While auth/session state is loading, render a neutral spinner, skeleton, suspense fallback, or guard boundary instead of returning a dashboard/app shell before the session is confirmed.',
    }));
  }

  if (
    astSignals.authSessionSignalCount > 0
    && astSignals.authLoadingSignalCount > 0
    && astSignals.authBlankLoadingRenderCount > 0
  ) {
    findings.push(makeFinding({
      id: 'state-auth-loading-blank-render',
      category: 'State Handling',
      severity: 'info',
      message: 'The reviewed auth/session loading branch returns nothing instead of an explicit pending boundary.',
      evidence: [
        filePath,
        `Auth/session signals: ${astSignals.authSessionSignalCount}`,
        `Auth loading signals: ${astSignals.authLoadingSignalCount}`,
        `Blank loading renders: ${astSignals.authBlankLoadingRenderCount}`,
      ],
      file: filePath,
      suggestedFix: 'Render a spinner, skeleton, suspense fallback, or another explicit pending UI while auth/session state resolves instead of returning `null` or an empty fragment.',
    }));
  }

  if (
    astSignals.authSessionSignalCount > 0
    && astSignals.authLoadingSignalCount > 0
    && astSignals.authAnonymousLoadingRedirectCount > 0
  ) {
    findings.push(makeFinding({
      id: 'state-auth-loading-anonymous-redirect',
      category: 'State Handling',
      severity: 'warn',
      message: 'The reviewed auth/session loading branch redirects users to an anonymous route before session state is resolved.',
      evidence: [
        filePath,
        `Auth/session signals: ${astSignals.authSessionSignalCount}`,
        `Auth loading signals: ${astSignals.authLoadingSignalCount}`,
        `Anonymous loading redirects: ${astSignals.authAnonymousLoadingRedirectCount}`,
      ],
      file: filePath,
      suggestedFix: 'While auth/session state is still loading, render a pending boundary instead of redirecting to `/login`, `/`, or another anonymous route. Only redirect after the session resolves as unauthenticated.',
    }));
  }

  if (
    astSignals.protectedSurfaceSignalCount > 0
    && astSignals.authSessionSignalCount > 0
    && authUnauthenticatedBranchSignalCount > 0
    && astSignals.authProtectedUnauthenticatedRenderCount > 0
  ) {
    findings.push(makeFinding({
      id: 'state-auth-session-loss-protected-render',
      category: 'State Handling',
      severity: 'warn',
      message: 'The reviewed protected surface branches on auth loss but still appears to render a protected destination in the unauthenticated branch.',
      evidence: [
        filePath,
        `Protected surface signals: ${astSignals.protectedSurfaceSignalCount}`,
        `Auth/session signals: ${astSignals.authSessionSignalCount}`,
        `Unauthenticated branch signals: ${authUnauthenticatedBranchSignalCount}`,
        `Protected unauthenticated renders: ${astSignals.authProtectedUnauthenticatedRenderCount}`,
      ],
      file: filePath,
      suggestedFix: 'When a protected surface detects a null or unauthenticated session, redirect to a reviewed anonymous route or render a neutral guard boundary instead of returning a dashboard/app shell.',
    }));
  }

  if (
    astSignals.protectedSurfaceSignalCount > 0
    && astSignals.authSessionSignalCount > 0
    && authUnauthenticatedBranchSignalCount === 0
  ) {
    findings.push(makeFinding({
      id: 'state-auth-session-loss-handling-missing',
      category: 'State Handling',
      severity: 'warn',
      message: 'The reviewed protected surface reads auth/session state but does not show an explicit unauthenticated branch when session resolution fails or the user signs out.',
      evidence: [
        filePath,
        `Protected surface signals: ${astSignals.protectedSurfaceSignalCount}`,
        `Auth/session signals: ${astSignals.authSessionSignalCount}`,
        `Unauthenticated branch signals: ${authUnauthenticatedBranchSignalCount}`,
        `Auth guard signals: ${astSignals.authGuardSignalCount}`,
      ],
      file: filePath,
      suggestedFix: 'When protected surfaces read session state directly, branch on unauthenticated/null-session cases and redirect to a reviewed anonymous route or return a guard boundary before protected content renders.',
    }));
  }

  if (
    astSignals.protectedSurfaceSignalCount > 0
    && astSignals.authSessionSignalCount > 0
    && authUnauthenticatedBranchSignalCount > 0
    && authAnonymousRedirectSignalCount === 0
  ) {
    findings.push(makeFinding({
      id: 'state-auth-session-loss-redirect-missing',
      category: 'State Handling',
      severity: 'warn',
      message: 'The reviewed protected surface branches on auth loss but does not show an obvious redirect back to an anonymous route.',
      evidence: [
        filePath,
        `Protected surface signals: ${astSignals.protectedSurfaceSignalCount}`,
        `Auth/session signals: ${astSignals.authSessionSignalCount}`,
        `Unauthenticated branch signals: ${authUnauthenticatedBranchSignalCount}`,
        `Anonymous redirect signals: ${authAnonymousRedirectSignalCount}`,
      ],
      file: filePath,
      suggestedFix: 'When a protected surface detects a null or unauthenticated session, redirect users to `/`, `/login`, `/register`, or another reviewed anonymous route instead of returning `null` or leaving the protected shell blank.',
    }));
  }

  if (
    hasAuthCallbackErrorGap
  ) {
    findings.push(makeFinding({
      id: 'state-auth-callback-error-missing',
      category: 'State Handling',
      severity: 'info',
      message: 'The reviewed auth callback flow does not show an obvious failure state for provider-denied or callback error returns.',
      evidence: [
        filePath,
        `Auth callback token reads: ${authCallbackTokenSignalCount}`,
        `Auth callback error signals: ${authCallbackErrorSignalCount}`,
      ],
      file: filePath,
      suggestedFix: 'When callback routes can receive `error`, `error_description`, or related provider-return params, branch on those values and show a reviewed failure state before or alongside success redirects.',
    }));
  }

  if (
    (astSignals.authSessionSignalCount > 0 || astSignals.authEntrySignalCount > 0)
    && authErrorSignalCount === 0
  ) {
    findings.push(makeFinding({
      id: 'state-auth-error-missing',
      category: 'State Handling',
      severity: 'info',
      message: 'The reviewed auth flow does not show an obvious failure state for rejected sign-in, recovery, or session refresh paths.',
      evidence: [
        filePath,
        `Auth/session signals: ${astSignals.authSessionSignalCount}`,
        `Auth entry signals: ${astSignals.authEntrySignalCount}`,
        `Auth error signals: ${authErrorSignalCount}`,
      ],
      file: filePath,
      suggestedFix: 'Expose reviewed error handling with inline feedback, alert messaging, or another explicit failure affordance for sign-in, recovery, or session refresh failures.',
    }));
  }

  if (
    recoveryFlowSignals > 0
    && authSuccessSignalCount === 0
  ) {
    findings.push(makeFinding({
      id: 'state-auth-recovery-success-missing',
      category: 'State Handling',
      severity: 'info',
      message: 'The reviewed recovery flow does not show an obvious success or confirmation state after the reset request completes.',
      evidence: [
        filePath,
        `Recovery flow signals: ${recoveryFlowSignals}`,
        `Auth success signals: ${authSuccessSignalCount}`,
      ],
      file: filePath,
      suggestedFix: 'After recovery or reset submission succeeds, show a reviewed confirmation state such as "check your email", "reset link sent", or another explicit success affordance.',
    }));
  }

  if (
    signUpFlowSignals > 0
    && authProtectedRedirectSignalCount === 0
    && authSuccessSignalCount === 0
  ) {
    findings.push(makeFinding({
      id: 'state-auth-registration-success-missing',
      category: 'State Handling',
      severity: 'info',
      message: 'The reviewed registration flow does not show either a protected post-auth transition or an explicit success/verification state.',
      evidence: [
        filePath,
        `Registration flow signals: ${signUpFlowSignals}`,
        `Protected auth redirects: ${authProtectedRedirectSignalCount}`,
        `Auth success signals: ${authSuccessSignalCount}`,
      ],
      file: filePath,
      suggestedFix: 'After registration succeeds, either navigate users into a reviewed protected route like `/dashboard` or show an explicit success state such as "account created" or "check your email" before the next auth step.',
    }));
  }

  if (
    (authCallbackTokenSignalCount > 0 || authCallbackStateSignalCount > 0)
    && authProtectedRedirectSignalCount === 0
    && authSuccessSignalCount === 0
  ) {
    findings.push(makeFinding({
      id: 'state-auth-callback-success-missing',
      category: 'State Handling',
      severity: 'info',
      message: 'The reviewed auth callback flow does not show either a protected post-auth transition or an explicit success/verification state.',
      evidence: [
        filePath,
        `Auth callback token reads: ${authCallbackTokenSignalCount}`,
        `Auth callback state reads: ${authCallbackStateSignalCount}`,
        `Protected auth redirects: ${authProtectedRedirectSignalCount}`,
        `Auth success signals: ${authSuccessSignalCount}`,
      ],
      file: filePath,
      suggestedFix: 'After callback validation or code exchange succeeds, either navigate users into a reviewed protected route like `/dashboard` or show an explicit success state before the next auth step.',
    }));
  }

  if (
    authCallbackExchangeSignalCount > 0
    && authCallbackExchangeErrorSignalCount === 0
  ) {
    findings.push(makeFinding({
      id: 'state-auth-callback-exchange-error-missing',
      category: 'State Handling',
      severity: 'warn',
      message: 'The reviewed auth callback exchange does not show explicit failure handling if session completion rejects.',
      evidence: [
        filePath,
        `Auth callback exchange signals: ${authCallbackExchangeSignalCount}`,
        `Auth callback exchange error signals: ${authCallbackExchangeErrorSignalCount}`,
      ],
      file: filePath,
      suggestedFix: 'Wrap reviewed callback code/session exchange in catch handling or explicit exchange-error state so failures do not leave users stuck on an indefinite callback surface.',
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
  const externalIframeWithoutSandboxCount = astSignals.externalIframeWithoutSandboxCount;
  const insecureFormActionCount = astSignals.insecureFormActionCount;
  const insecureAuthFormMethodCount = astSignals.insecureAuthFormMethodCount;
  const insecureTransportEndpointCount = astSignals.insecureTransportEndpointCount;
  const insecureExternalImageCount = astSignals.insecureExternalImageCount;
  const externalBlankLinkWithoutRelCount = astSignals.externalBlankLinkWithoutRelCount;
  const authOpenRedirectSignalCount = astSignals.authOpenRedirectSignalCount;
  const authExternalRedirectSignalCount = astSignals.authExternalRedirectSignalCount;
  const authProviderStateMissingCount = astSignals.authProviderStateMissingCount;
  const authProviderPkceMissingCount = astSignals.authProviderPkceMissingCount;
  const authProviderNonceMissingCount = astSignals.authProviderNonceMissingCount;
  const authCallbackUrlScrubSignalCount = countAuthCallbackUrlScrubSignals(code);
  const emailAutocompleteMissingCount = astSignals.emailAutocompleteMissingCount;
  const passwordAutocompleteMissingCount = astSignals.passwordAutocompleteMissingCount;
  const otpAutocompleteMissingCount = astSignals.otpAutocompleteMissingCount;
  const authAutocompleteDisabledCount = astSignals.authAutocompleteDisabledCount;
  const authAutocompleteSemanticMismatchCount = astSignals.authAutocompleteSemanticMismatchCount;
  const authInputTypeMismatchCount = astSignals.authInputTypeMismatchCount;
  const hardcodedSecretSignalCount = astSignals.hardcodedSecretSignalCount;
  const clientSecretEnvReferenceCount = astSignals.clientSecretEnvReferenceCount;
  const localhostEndpointCount = astSignals.localhostEndpointCount;
  const wildcardPostMessageCount = astSignals.wildcardPostMessageCount;
  const windowOpenWithoutNoopenerCount = astSignals.windowOpenWithoutNoopenerCount;
  const messageListenerWithoutOriginCheckCount = astSignals.messageListenerWithoutOriginCheckCount;
  const authCookieMissingHardeningCount = astSignals.authCookieMissingHardeningCount;
  const insecureExternalIframeCount = astSignals.insecureExternalIframeCount;
  const hasDangerousHtml = dangerousHtmlCount > 0;
  const hasRawHtmlInjection = rawHtmlInjectionCount > 0;
  const hasDynamicEval = dynamicEvalCount > 0;
  const hasExternalIframeWithoutSandbox = externalIframeWithoutSandboxCount > 0;
  const hasInsecureFormAction = insecureFormActionCount > 0;
  const hasInsecureAuthFormMethod = insecureAuthFormMethodCount > 0;
  const hasInsecureTransportEndpoint = insecureTransportEndpointCount > 0;
  const hasInsecureExternalImage = insecureExternalImageCount > 0;
  const hasExternalBlankLinkWithoutRel = externalBlankLinkWithoutRelCount > 0;
  const hasAuthOpenRedirectSignals = authOpenRedirectSignalCount > 0;
  const hasAuthExternalRedirectSignals = authExternalRedirectSignalCount > 0;
  const hasAuthProviderStateMissing = authProviderStateMissingCount > 0;
  const hasAuthProviderPkceMissing = authProviderPkceMissingCount > 0;
  const hasAuthProviderNonceMissing = authProviderNonceMissingCount > 0;
  const hasAuthCallbackStateValidationGap = authCallbackStateSignalCount > 0 && authCallbackStateValidationSignalCount === 0;
  const hasAuthCallbackStateTeardownGap = authCallbackStateValidationSignalCount > 0 && authCallbackStateStorageSignalCount > 0 && authCallbackStateStorageClearSignalCount === 0;
  const hasAuthCallbackUrlScrubGap = (authCallbackTokenSignalCount > 0 || authCallbackErrorSignalCount > 0) && authCallbackUrlScrubSignalCount === 0;
  const hasAuthAutocompleteIssues = emailAutocompleteMissingCount > 0
    || passwordAutocompleteMissingCount > 0
    || otpAutocompleteMissingCount > 0
    || authAutocompleteDisabledCount > 0
    || authAutocompleteSemanticMismatchCount > 0
    || authInputTypeMismatchCount > 0;
  const hasHardcodedSecretSignals = hardcodedSecretSignalCount > 0;
  const hasClientSecretEnvReferences = clientSecretEnvReferenceCount > 0;
  const hasLocalhostEndpoints = localhostEndpointCount > 0;
  const hasWildcardPostMessage = wildcardPostMessageCount > 0;
  const hasWindowOpenWithoutNoopener = windowOpenWithoutNoopenerCount > 0;
  const hasMessageListenerWithoutOriginCheck = messageListenerWithoutOriginCheckCount > 0;
  const hasInsecureExternalIframe = insecureExternalIframeCount > 0;
  const hasAuthStorageWrites = authStorageWriteCount > 0;
  const hasAuthStorageClearGap = authExitSignalCount > 0 && authStorageWriteCount > 0 && authStorageClearCount === 0;
  const hasAuthCookieWrites = authCookieWriteCount > 0;
  const hasAuthCookieClearGap = authExitSignalCount > 0 && authCookieWriteCount > 0 && authCookieClearCount === 0;
  const hasAuthCookieMissingHardening = authCookieMissingHardeningCount > 0;
  const hasAuthHeaderWrites = authHeaderWriteCount > 0;
  const hasAuthHeaderClearGap = authExitSignalCount > 0 && authHeaderWriteCount > 0 && authHeaderClearCount === 0;
  const hasAuthCacheClients = authCacheClientCount > 0;
  const hasAuthCacheClearGap = authExitSignalCount > 0 && authCacheClientCount > 0 && authCacheClearCount === 0;
  scores.push({
    category: 'Security Hygiene',
    focusArea: 'security-hygiene',
    score: Math.max(
      1,
      5
      - (hasDangerousHtml ? 2 : 0)
      - (hasRawHtmlInjection ? 2 : 0)
      - (hasDynamicEval ? 2 : 0)
      - (hasExternalIframeWithoutSandbox ? 1 : 0)
      - (hasInsecureFormAction ? 2 : 0)
      - (hasInsecureAuthFormMethod ? 2 : 0)
      - (hasInsecureTransportEndpoint ? 2 : 0)
      - (hasInsecureExternalImage ? 1 : 0)
      - (hasHardcodedSecretSignals ? 3 : 0)
      - (hasClientSecretEnvReferences ? 3 : 0)
      - (hasLocalhostEndpoints ? 2 : 0)
      - (hasWildcardPostMessage ? 2 : 0)
      - (hasMessageListenerWithoutOriginCheck ? 2 : 0)
      - (hasWindowOpenWithoutNoopener ? 1 : 0)
      - (hasInsecureExternalIframe ? 1 : 0)
      - (hasExternalBlankLinkWithoutRel ? 1 : 0)
      - (hasAuthOpenRedirectSignals ? 2 : 0)
      - (hasAuthExternalRedirectSignals ? 2 : 0)
      - (hasAuthProviderStateMissing ? 2 : 0)
      - (hasAuthProviderPkceMissing ? 2 : 0)
      - (hasAuthProviderNonceMissing ? 2 : 0)
      - (hasAuthCallbackStateValidationGap ? 2 : 0)
      - (hasAuthCallbackStateTeardownGap ? 1 : 0)
      - (hasAuthCallbackUrlScrubGap ? 2 : 0)
      - (hasAuthAutocompleteIssues ? 1 : 0)
      - (hasAuthStorageWrites ? 2 : 0)
      - (hasAuthCookieWrites ? 2 : 0)
      - (hasAuthCookieMissingHardening ? 2 : 0)
      - (hasAuthHeaderWrites ? 2 : 0)
      - (hasAuthCacheClearGap ? 1 : 0),
    ),
    details: `dangerouslySetInnerHTML: ${dangerousHtmlCount}, raw HTML injection: ${rawHtmlInjectionCount}, dynamic eval: ${dynamicEvalCount}, hardcoded secret literals: ${hardcodedSecretSignalCount}, client-exposed secret env references: ${clientSecretEnvReferenceCount}, localhost endpoints: ${localhostEndpointCount}, wildcard postMessage calls: ${wildcardPostMessageCount}, message listeners missing origin checks: ${messageListenerWithoutOriginCheckCount}, window.open calls missing noopener/noreferrer: ${windowOpenWithoutNoopenerCount}, external iframes without sandbox: ${externalIframeWithoutSandboxCount}, insecure external iframes: ${insecureExternalIframeCount}, insecure form actions: ${insecureFormActionCount}, auth forms with insecure method: ${insecureAuthFormMethodCount}, insecure transport endpoints: ${insecureTransportEndpointCount}, insecure remote images: ${insecureExternalImageCount}, external _blank links without rel: ${externalBlankLinkWithoutRelCount}, auth/query redirect signals: ${authOpenRedirectSignalCount}, auth external redirects: ${authExternalRedirectSignalCount}, auth provider URLs missing state: ${authProviderStateMissingCount}, auth provider code flows missing PKCE: ${authProviderPkceMissingCount}, auth provider id_token flows missing nonce: ${authProviderNonceMissingCount}, auth callback state reads: ${authCallbackStateSignalCount}, auth callback state validation signals: ${authCallbackStateValidationSignalCount}, auth callback state storage reads: ${authCallbackStateStorageSignalCount}, auth callback state storage clears: ${authCallbackStateStorageClearSignalCount}, auth callback token reads: ${authCallbackTokenSignalCount}, auth callback URL scrub signals: ${authCallbackUrlScrubSignalCount}, email inputs without autocomplete: ${emailAutocompleteMissingCount}, password inputs without autocomplete: ${passwordAutocompleteMissingCount}, OTP inputs without one-time-code autocomplete: ${otpAutocompleteMissingCount}, auth inputs with autocomplete off: ${authAutocompleteDisabledCount}, auth inputs with autocomplete semantic mismatch: ${authAutocompleteSemanticMismatchCount}, auth inputs with semantic type mismatch: ${authInputTypeMismatchCount}, auth storage writes: ${authStorageWriteCount}, auth storage clears: ${authStorageClearCount}, auth cookie writes: ${authCookieWriteCount}, auth cookie clears: ${authCookieClearCount}, auth cookies missing hardening: ${authCookieMissingHardeningCount}, auth header writes: ${authHeaderWriteCount}, auth header clears: ${authHeaderClearCount}, auth cache clients: ${authCacheClientCount}, auth cache clears: ${authCacheClearCount}`,
    suggestions: [
      ...(hasDangerousHtml || hasRawHtmlInjection ? ['Prefer escaped rendering paths and sanitize any unavoidable HTML before rendering it.'] : []),
      ...(hasDynamicEval ? ['Remove eval/new Function usage and replace it with explicit logic or data-driven dispatch.'] : []),
      ...(hasHardcodedSecretSignals ? ['Remove hardcoded secret literals from source immediately and rotate any exposed credentials.'] : []),
      ...(hasClientSecretEnvReferences ? ['Do not reference service-role, secret, or private-key env vars from client-exposed code paths.'] : []),
      ...(hasLocalhostEndpoints ? ['Replace localhost-style client endpoints with reviewed environment-backed URLs or move those calls behind a trusted server boundary before shipping.'] : []),
      ...(hasWildcardPostMessage ? ['Avoid `postMessage(..., "*")`; target a reviewed explicit origin instead of broadcasting to any window origin.'] : []),
      ...(hasMessageListenerWithoutOriginCheck ? ['Validate `event.origin` inside `message` event handlers before trusting or acting on cross-window data.'] : []),
      ...(hasWindowOpenWithoutNoopener ? ['When opening a new tab imperatively, include `noopener,noreferrer` features so the new page cannot retain opener access.'] : []),
      ...(hasExternalIframeWithoutSandbox ? ['Sandbox external iframes unless a reviewed embed contract explicitly requires broader privileges.'] : []),
      ...(hasInsecureExternalIframe ? ['Avoid embedding remote iframes over plain HTTP; use HTTPS or move the integration behind a reviewed trusted boundary.'] : []),
      ...(hasInsecureFormAction ? ['Avoid posting forms to plain HTTP endpoints; use HTTPS or move the action behind a trusted server boundary.'] : []),
      ...(hasInsecureAuthFormMethod ? ['Auth forms should submit with `method=\"post\"` or an explicit server action boundary instead of defaulting to GET semantics.'] : []),
      ...(hasInsecureTransportEndpoint ? ['Avoid plain HTTP or ws:// client endpoints; use HTTPS/WSS transport or route the request behind a trusted server boundary.'] : []),
      ...(hasInsecureExternalImage ? ['Avoid loading remote images over plain HTTP; use HTTPS or move the image behind a reviewed trusted asset boundary.'] : []),
      ...(hasExternalBlankLinkWithoutRel ? ['Add rel="noopener noreferrer" to external links that open in a new tab.'] : []),
      ...(hasAuthOpenRedirectSignals ? ['Resolve auth or route-transition redirects through a reviewed allowlist of internal routes instead of trusting raw `next`, `returnTo`, `callbackUrl`, or similar query params.'] : []),
      ...(hasAuthExternalRedirectSignals ? ['Avoid hard-redirecting auth flows to external URLs from app code. Keep auth redirects on reviewed internal routes, or route external provider/logout handoffs through explicit reviewed allowlists and provider configuration.'] : []),
      ...(hasAuthProviderStateMissing ? ['When auth flows hand off to a provider authorize URL, include a reviewed `state` value and validate it on return instead of hardcoding off-site auth entry without CSRF protection.'] : []),
      ...(hasAuthProviderPkceMissing ? ['When client-managed auth flows hand off to a provider code-flow authorize URL, include a reviewed PKCE `code_challenge` and verifier instead of hardcoding a bare authorization-code redirect from client code.'] : []),
      ...(hasAuthProviderNonceMissing ? ['When auth flows hand off to a provider authorize URL that requests `id_token`, include a reviewed `nonce` and validate it on return instead of hardcoding a bare OIDC implicit or hybrid flow from client code.'] : []),
      ...(hasAuthCallbackStateValidationGap ? ['When callback routes read a returned provider `state`, validate it against a stored or expected reviewed value before exchanging callback codes or continuing auth setup.'] : []),
      ...(hasAuthCallbackStateTeardownGap ? ['After validating callback `state`, clear the reviewed `oauth_state` or CSRF state key from browser storage or cookies so stale callback state does not linger beyond the auth exchange.'] : []),
      ...(hasAuthCallbackUrlScrubGap ? ['After consuming auth callback codes, tokens, or provider error params from the URL, replace the callback URL with a clean reviewed route using `history.replaceState`, router replacement, or an explicit internal redirect.'] : []),
      ...(hasAuthAutocompleteIssues ? ['Add explicit autocomplete hints such as `email`, `username`, `current-password`, `new-password`, or `one-time-code` on auth-related inputs, keep those hints semantically aligned with the field purpose, avoid disabling autocomplete for credential fields, and keep credential field types semantically correct (`email`/`password`).'] : []),
      ...(hasAuthStorageWrites ? ['Avoid persisting auth tokens in browser storage; prefer secure, server-managed session boundaries or hardened cookie-based flows.'] : []),
      ...(hasAuthStorageClearGap ? ['If auth data is stored in browser storage, explicitly remove those auth/session keys during sign-out instead of relying on redirects or generic sign-out helpers alone.'] : []),
      ...(hasAuthCookieWrites ? ['Avoid setting auth cookies from client-side JavaScript; prefer server-issued HttpOnly cookies or other server-managed session boundaries.'] : []),
      ...(hasAuthCookieClearGap ? ['If reviewed source surfaces issue auth cookies, explicitly expire or delete them during sign-out instead of assuming redirects or generic sign-out helpers will clear them.'] : []),
      ...(hasAuthCookieMissingHardening ? ['When issuing auth cookies, set explicit `httpOnly`, `secure`, and `sameSite` options instead of relying on framework defaults or partial options.'] : []),
      ...(hasAuthHeaderWrites ? ['Avoid constructing bearer/session authorization headers in client-rendered code unless the auth model is explicitly reviewed and intended.'] : []),
      ...(hasAuthHeaderClearGap ? ['If reviewed source code constructs auth-like authorization headers, explicitly delete or reset those header values during sign-out instead of assuming redirects or generic sign-out helpers will clear them.'] : []),
      ...(hasAuthCacheClients && hasAuthCacheClearGap ? ['If protected data is cached in query clients or client stores, clear or reset those caches during sign-out so privileged data does not linger after logout.'] : []),
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
      message: 'The reviewed file uses dynamic code execution patterns such as `eval`, `new Function`, or string-based timers.',
      evidence: [filePath, `Occurrences: ${dynamicEvalCount}`],
      file: filePath,
      suggestedFix: 'Replace dynamic code execution with explicit functions, lookup tables, or validated configuration data; avoid passing strings into timers.',
    }));
  }

  if (hasHardcodedSecretSignals) {
    findings.push(makeFinding({
      id: 'security-hardcoded-secret-literal',
      category: 'Security Hygiene',
      severity: 'error',
      message: 'Hardcoded secret-like literals were detected in the reviewed file.',
      evidence: [filePath, `Hardcoded secret-like literals: ${hardcodedSecretSignalCount}`],
      file: filePath,
      suggestedFix: 'Remove hardcoded secrets from source immediately, rotate any exposed credentials, and load sensitive values only through reviewed server-side boundaries.',
    }));
  }

  if (hasClientSecretEnvReferences) {
    findings.push(makeFinding({
      id: 'security-client-secret-env-reference',
      category: 'Security Hygiene',
      severity: 'error',
      message: 'Client-exposed code references env vars that look server-only or secret-bearing.',
      evidence: [filePath, `Client-exposed secret env references: ${clientSecretEnvReferenceCount}`],
      file: filePath,
      suggestedFix: 'Remove secret-bearing env references from client code and move privileged access behind a reviewed server boundary or server-only module.',
    }));
  }

  if (hasLocalhostEndpoints) {
    findings.push(makeFinding({
      id: 'security-localhost-endpoint-present',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'The reviewed file still references localhost-style endpoints.',
      evidence: [filePath, `Localhost endpoint signals: ${localhostEndpointCount}`],
      file: filePath,
      suggestedFix: 'Replace localhost, 127.0.0.1, or 0.0.0.0 endpoints with reviewed environment-backed URLs or move the client call behind a trusted server boundary.',
    }));
  }

  if (hasInsecureExternalImage) {
    findings.push(makeFinding({
      id: 'security-image-transport-insecure',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'The reviewed file loads one or more remote images over plain HTTP.',
      evidence: [filePath, `Insecure remote images: ${insecureExternalImageCount}`],
      file: filePath,
      suggestedFix: 'Serve remote images over HTTPS or move them behind a reviewed trusted asset boundary before shipping.',
    }));
  }

  if (hasWildcardPostMessage) {
    findings.push(makeFinding({
      id: 'security-postmessage-wildcard-origin',
      category: 'Security Hygiene',
      severity: 'error',
      message: 'Cross-window messaging uses `postMessage` with a wildcard target origin.',
      evidence: [filePath, `Wildcard postMessage calls: ${wildcardPostMessageCount}`],
      file: filePath,
      suggestedFix: 'Replace `postMessage(..., "*")` with an explicit reviewed origin so messages only cross the intended trust boundary.',
    }));
  }

  if (hasMessageListenerWithoutOriginCheck) {
    findings.push(makeFinding({
      id: 'security-message-listener-origin-check-missing',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'Cross-window message handlers do not appear to validate `event.origin` before trusting inbound messages.',
      evidence: [filePath, `Message listeners missing origin checks: ${messageListenerWithoutOriginCheckCount}`],
      file: filePath,
      suggestedFix: 'Check `event.origin` against an explicit reviewed allowlist or expected origin before acting on `message` event payloads.',
    }));
  }

  if (hasWindowOpenWithoutNoopener) {
    findings.push(makeFinding({
      id: 'security-window-open-noopener-missing',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'Imperative `window.open` usage targets a new tab without `noopener,noreferrer` protections.',
      evidence: [filePath, `window.open calls missing noopener/noreferrer: ${windowOpenWithoutNoopenerCount}`],
      file: filePath,
      suggestedFix: 'Use `window.open(url, "_blank", "noopener,noreferrer")` or equivalent reviewed features so the opened page cannot retain opener access.',
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

  if (hasExternalIframeWithoutSandbox) {
    findings.push(makeFinding({
      id: 'security-iframe-sandbox-missing',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'External iframe embeds were detected without a `sandbox` attribute.',
      evidence: [filePath, `External iframes without sandbox: ${externalIframeWithoutSandboxCount}`],
      file: filePath,
      suggestedFix: 'Add the narrowest practical sandbox policy to external iframes, and only loosen capabilities when the embed contract explicitly requires it.',
    }));
  }

  if (hasInsecureExternalIframe) {
    findings.push(makeFinding({
      id: 'security-iframe-transport-insecure',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'The reviewed file embeds one or more remote iframes over plain HTTP.',
      evidence: [filePath, `Insecure external iframes: ${insecureExternalIframeCount}`],
      file: filePath,
      suggestedFix: 'Serve embedded iframes over HTTPS or move the integration behind a reviewed trusted boundary before shipping.',
    }));
  }

  if (hasInsecureFormAction) {
    findings.push(makeFinding({
      id: 'security-form-action-insecure',
      category: 'Security Hygiene',
      severity: 'error',
      message: 'Forms were detected using insecure or unsafe action targets.',
      evidence: [filePath, `Forms with insecure or unsafe action target: ${insecureFormActionCount}`],
      file: filePath,
      suggestedFix: 'Use HTTPS form endpoints or route submissions through a trusted server action/API boundary; do not use javascript:, mailto:, data:, or plain HTTP form actions for production flows.',
    }));
  }

  if (hasInsecureAuthFormMethod) {
    findings.push(makeFinding({
      id: 'security-auth-form-method-insecure',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'Auth-like forms were detected without an explicit POST-style submission method.',
      evidence: [filePath, `Auth forms with insecure method: ${insecureAuthFormMethodCount}`],
      file: filePath,
      suggestedFix: 'Add `method=\"post\"` or move the submission behind an explicit server action boundary so credential flows do not default to GET semantics.',
    }));
  }

  if (hasInsecureTransportEndpoint) {
    findings.push(makeFinding({
      id: 'security-transport-endpoint-insecure',
      category: 'Security Hygiene',
      severity: 'error',
      message: 'Client code was detected calling or navigating to plain HTTP or insecure websocket endpoints.',
      evidence: [filePath, `Insecure transport endpoints: ${insecureTransportEndpointCount}`],
      file: filePath,
      suggestedFix: 'Use HTTPS/WSS endpoints and reviewed secure redirects, or move the transport boundary behind a trusted server action or API layer.',
    }));
  }

  if (hasAuthOpenRedirectSignals) {
    findings.push(makeFinding({
      id: 'security-auth-open-redirect-risk',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'Redirect logic appears to trust next/returnTo-style query parameters without an obvious reviewed allowlist.',
      evidence: [filePath, `Auth/query redirect signals: ${authOpenRedirectSignalCount}`],
      file: filePath,
      suggestedFix: 'Resolve post-auth and route-transition redirects through a reviewed internal allowlist instead of redirecting directly from raw `next`, `returnTo`, `callbackUrl`, or similar query parameters.',
    }));
  }

  if (
    hasAuthExternalRedirectSignals
    && (signInFlowSignals > 0 || signUpFlowSignals > 0 || recoveryFlowSignals > 0 || authExitSignalCount > 0)
  ) {
    findings.push(makeFinding({
      id: 'security-auth-external-redirect-risk',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'The reviewed auth flow redirects users directly to an external URL.',
      evidence: [filePath, `Auth external redirects: ${authExternalRedirectSignalCount}`],
      file: filePath,
      suggestedFix: 'Keep auth redirects on reviewed internal routes, or route external provider/logout handoffs through explicit reviewed allowlists and provider configuration instead of hardcoding off-site destinations in app code.',
    }));
  }

  if (
    hasAuthProviderStateMissing
    && (signInFlowSignals > 0 || signUpFlowSignals > 0 || recoveryFlowSignals > 0 || authExitSignalCount > 0)
  ) {
    findings.push(makeFinding({
      id: 'security-auth-provider-state-missing',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'The reviewed auth flow hardcodes a provider-style authorize URL without a `state` parameter.',
      evidence: [filePath, `Auth provider URLs missing state: ${authProviderStateMissingCount}`],
      file: filePath,
      suggestedFix: 'Add a reviewed `state` value to external provider authorize URLs and validate it on return instead of hardcoding off-site auth entry without CSRF protection.',
    }));
  }

  if (
    hasAuthProviderPkceMissing
    && (signInFlowSignals > 0 || signUpFlowSignals > 0 || recoveryFlowSignals > 0 || authExitSignalCount > 0)
  ) {
    findings.push(makeFinding({
      id: 'security-auth-provider-pkce-missing',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'The reviewed auth flow hardcodes a provider-style OAuth code-flow URL without a `code_challenge`.',
      evidence: [filePath, `Auth provider code flows missing PKCE: ${authProviderPkceMissingCount}`],
      file: filePath,
      suggestedFix: 'Add a reviewed PKCE `code_challenge` and verifier to external provider code flows instead of hardcoding a bare authorization-code redirect from client code.',
    }));
  }

  if (
    hasAuthProviderNonceMissing
    && (signInFlowSignals > 0 || signUpFlowSignals > 0 || recoveryFlowSignals > 0 || authExitSignalCount > 0)
  ) {
    findings.push(makeFinding({
      id: 'security-auth-provider-nonce-missing',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'The reviewed auth flow hardcodes a provider-style OIDC id_token URL without a `nonce` parameter.',
      evidence: [filePath, `Auth provider id_token flows missing nonce: ${authProviderNonceMissingCount}`],
      file: filePath,
      suggestedFix: 'Add a reviewed `nonce` value to external provider authorize URLs that request `id_token`, and validate it on return instead of hardcoding a bare OIDC implicit or hybrid flow from client code.',
    }));
  }

  if (hasAuthCallbackStateValidationGap) {
    findings.push(makeFinding({
      id: 'security-auth-callback-state-validation-missing',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'The reviewed auth callback flow reads a returned provider `state` value but does not show an obvious validation step against a reviewed expected value.',
      evidence: [
        filePath,
        `Auth callback state reads: ${authCallbackStateSignalCount}`,
        `Auth callback state validation signals: ${authCallbackStateValidationSignalCount}`,
      ],
      file: filePath,
      suggestedFix: 'When callback routes read `state`, compare it against a stored or expected reviewed value before exchanging callback codes or continuing auth/session setup.',
    }));
  }

  if (hasAuthCallbackStateTeardownGap) {
    findings.push(makeFinding({
      id: 'security-auth-callback-state-teardown-missing',
      category: 'Security Hygiene',
      severity: 'info',
      message: 'The reviewed auth callback flow validates stored callback `state` but does not show that the stored state key is cleared afterwards.',
      evidence: [
        filePath,
        `Auth callback state storage reads: ${authCallbackStateStorageSignalCount}`,
        `Auth callback state storage clears: ${authCallbackStateStorageClearSignalCount}`,
      ],
      file: filePath,
      suggestedFix: 'After validating callback `state`, remove the reviewed `oauth_state` or CSRF state key from browser storage or cookies so stale callback state does not linger.',
    }));
  }

  if (hasAuthCallbackUrlScrubGap) {
    findings.push(makeFinding({
      id: 'security-auth-callback-url-scrub-missing',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'The reviewed auth callback flow appears to read codes, tokens, or provider error params from the URL without scrubbing them back out of browser history.',
      evidence: [
        filePath,
        `Auth callback token reads: ${authCallbackTokenSignalCount}`,
        `Auth callback error signals: ${authCallbackErrorSignalCount}`,
        `Auth callback URL scrub signals: ${authCallbackUrlScrubSignalCount}`,
      ],
      file: filePath,
      suggestedFix: 'After consuming callback codes, tokens, or provider error params from the URL, replace the callback URL with a clean reviewed route using `history.replaceState`, router replacement, or an explicit internal redirect.',
    }));
  }

  if (hasAuthAutocompleteIssues) {
    findings.push(makeFinding({
      id: 'security-auth-autocomplete-missing',
      category: 'Security Hygiene',
      severity: 'info',
      message: 'Auth-related inputs were detected with missing or incorrect `autocomplete` hints.',
      evidence: [
        filePath,
        `Email inputs without autocomplete: ${emailAutocompleteMissingCount}`,
        `Password inputs without autocomplete: ${passwordAutocompleteMissingCount}`,
        `OTP inputs without one-time-code autocomplete: ${otpAutocompleteMissingCount}`,
        `Auth inputs with autocomplete off: ${authAutocompleteDisabledCount}`,
        `Auth inputs with autocomplete semantic mismatch: ${authAutocompleteSemanticMismatchCount}`,
        `Auth inputs with semantic type mismatch: ${authInputTypeMismatchCount}`,
      ],
      file: filePath,
      suggestedFix: 'Add `autocomplete=\"email\"` or `autocomplete=\"username\"` to identity fields, `autocomplete=\"current-password\"` or `autocomplete=\"new-password\"` to password fields, `autocomplete=\"one-time-code\"` to OTP and verification-code inputs, keep those autocomplete values aligned with the field purpose, do not disable autocomplete on credential inputs, and keep credential field types semantically correct.',
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

  if (hasAuthCookieMissingHardening) {
    findings.push(makeFinding({
      id: 'security-auth-cookie-hardening-missing',
      category: 'Security Hygiene',
      severity: 'warn',
      message: 'Auth cookies are being issued without explicit `httpOnly`, `secure`, and `sameSite` hardening.',
      evidence: [filePath, `Auth cookies missing hardening: ${authCookieMissingHardeningCount}`],
      file: filePath,
      suggestedFix: 'Set auth cookies with explicit `httpOnly: true`, `secure: true`, and a reviewed `sameSite` value so session boundaries do not rely on ambient defaults.',
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
