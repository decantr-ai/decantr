import type { EssenceFile } from '@decantr/essence-spec';
import type {
  ApiContentType,
  BlueprintPortfolioMetadata,
  ContentBenchmarkConfidence,
  ContentConfidenceTier,
  ContentGoldenUsage,
  ContentIntelligenceSource,
  ContentType,
  ContentVerificationStatus,
  PublicBlueprintSet,
  PublicContentSource,
  VerificationSeverity,
} from './types.js';

// API client and compatibility response contracts

export interface ContentListResponse<T = Record<string, unknown>> {
  items: T[];
  total: number;
  limit?: number;
  offset?: number;
}

export interface ContentIntelligenceMetadata {
  source: ContentIntelligenceSource;
  verification_status: ContentVerificationStatus;
  last_verified_at?: string | null;
  target_coverage: string[];
  benchmark_confidence: ContentBenchmarkConfidence;
  confidence_tier: ContentConfidenceTier;
  golden_usage: ContentGoldenUsage;
  quality_score: number | null;
  confidence_score: number | null;
  recommended: boolean;
  evidence: string[];
  recommendation_reasons: string[];
  recommendation_blockers: string[];
  benchmark?: {
    classification?: ShowcaseVerificationEntry['classification'];
    target?: string | null;
    drift_signal?: ShowcaseVerificationEntry['drift']['signal'];
    build_passed?: boolean | null;
    smoke_passed?: boolean | null;
  };
}

export interface PublicContentSummary<TType extends string = string> {
  id: string;
  slug: string;
  namespace: string;
  type: TType;
  version?: string;
  name?: string;
  description?: string;
  published_at?: string;
  owner_name?: string | null;
  owner_username?: string | null;
  thumbnail_url?: string | null;
  blueprint_portfolio?: BlueprintPortfolioMetadata | null;
  intelligence?: ContentIntelligenceMetadata | null;
}

export interface PublicContentRecord<
  TData = Record<string, unknown>,
  TType extends string = string,
> {
  id: string;
  slug: string;
  namespace: string;
  type: TType;
  version: string;
  data: TData;
  visibility: 'public' | 'private';
  status: 'pending' | 'approved' | 'rejected' | 'published';
  created_at: string;
  updated_at: string;
  published_at?: string;
  owner_name?: string | null;
  owner_username?: string | null;
  thumbnail_url?: string | null;
  intelligence?: ContentIntelligenceMetadata | null;
}

export interface ContentItem extends PublicContentRecord<Record<string, unknown>> {}

export interface OwnedContentSummary extends PublicContentSummary {
  visibility: 'public' | 'private';
  status: 'pending' | 'approved' | 'rejected' | 'published';
  created_at: string;
  updated_at: string;
}

export interface PublicUserProfile {
  username: string;
  display_name: string | null;
  reputation_score: number;
  tier: 'free' | 'pro' | 'team' | 'enterprise';
  created_at: string;
  content_count: number;
  content_counts: Record<string, number>;
}

export interface PublishPayload {
  type: ApiContentType;
  slug: string;
  namespace: string;
  version: string;
  data: Record<string, unknown>;
  visibility?: 'public' | 'private';
}

export interface PublishResponse {
  id: string;
  slug: string;
  namespace: string;
  type: string;
  status: string;
}

export interface SearchParams {
  q: string;
  type?: string;
  namespace?: string;
  source?: PublicContentSource;
  sort?: string;
  recommended?: boolean;
  intelligenceSource?: ContentIntelligenceSource;
  blueprintSet?: PublicBlueprintSet;
  labs?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchResponse<T = PublicContentSummary> {
  results: T[];
  total: number;
  limit?: number;
  offset?: number;
}

export interface ContentIntelligenceSummaryBucket {
  total_public_items: number;
  with_intelligence: number;
  recommended: number;
  authored: number;
  benchmark: number;
  hybrid: number;
  missing_source: number;
  smoke_green: number;
  build_green: number;
  high_confidence: number;
  verified_confidence: number;
}

export interface ContentIntelligenceSummaryResponse {
  $schema: string;
  generated_at: string;
  namespace: string | null;
  totals: ContentIntelligenceSummaryBucket;
  by_type: Record<ContentType, ContentIntelligenceSummaryBucket>;
}

export interface UserProfile {
  id: string;
  email: string;
  tier: 'free' | 'pro' | 'team' | 'enterprise';
  reputation_score: number;
  trusted: boolean;
}

export interface ShowcaseVerificationEntry {
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
    routeDocumentsHardenedCount: number;
    routeDocumentsCoverageOk: boolean;
    routeDocumentsHardeningOk: boolean;
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

export interface ShowcaseShortlistSummary {
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
  appsWithExternalScriptCrossoriginCount: number;
  appsWithExternalStylesheetIntegrityCount: number;
  appsWithExternalStylesheetCrossoriginCount: number;
  appsWithRouteCoverageCount: number;
  appsWithFullRouteCoverageCount: number;
  averageTotalAssetBytes: number;
  averageJsAssetBytes: number;
  averageCssAssetBytes: number;
  lowerDriftCount: number;
  moderateDriftCount: number;
  elevatedDriftCount: number;
  withPackManifestCount: number;
}

export interface ShowcaseManifestEntry {
  slug: string;
  status: string;
  classification: string;
  origin?: string | null;
  target?: string | null;
  goldenCandidate?: string | boolean;
  notes?: string | null;
  thumbnail?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  } | null;
  url?: string | null;
  verification?: ShowcaseVerificationEntry | null;
}

export interface ShowcaseManifestResponse {
  total: number;
  shortlisted: number;
  apps: ShowcaseManifestEntry[];
}

export interface ShowcaseShortlistResponse {
  generatedAt: string | null;
  summary: ShowcaseShortlistSummary | null;
  apps: ShowcaseManifestEntry[];
}

export interface ShowcaseShortlistReport {
  $schema: string;
  generatedAt: string;
  dryRun: boolean;
  summary: ShowcaseShortlistSummary;
  results: ShowcaseVerificationEntry[];
}

export interface HostedFileCritiqueRequest {
  essence: EssenceFile;
  code: string;
  filePath?: string;
  treatmentsCss?: string;
}

export interface HostedDistSnapshot {
  indexHtml: string;
  assets?: Record<string, string>;
}

export interface HostedSourceSnapshot {
  files: Record<string, string>;
}

export interface HostedProjectAuditRequest {
  essence: EssenceFile;
  dist?: HostedDistSnapshot;
  sources?: HostedSourceSnapshot;
}

export type ExecutionPackType = 'scaffold' | 'section' | 'page' | 'mutation' | 'review';

export interface ExecutionPackTarget {
  platform: 'web';
  framework: string | null;
  runtime: string | null;
  adapter: string;
}

export interface ExecutionPackScope {
  appId: string;
  pageIds: string[];
  patternIds: string[];
}

export interface ExecutionPackExample {
  id: string;
  label: string;
  language: string;
  snippet: string;
}

export interface ExecutionPackAntiPattern {
  id: string;
  summary: string;
  guidance: string;
}

export interface ExecutionPackSuccessCheck {
  id: string;
  label: string;
  severity: 'error' | 'warn' | 'info';
}

export interface ExecutionPackTokenBudget {
  target: number;
  max: number;
  strategy: string[];
}

export interface ExecutionPackBase<TData = Record<string, unknown>> {
  $schema: string;
  packVersion: '1.0.0';
  packType: ExecutionPackType;
  objective: string;
  target: ExecutionPackTarget;
  preset: string | null;
  scope: ExecutionPackScope;
  requiredSetup: string[];
  allowedVocabulary: string[];
  examples: ExecutionPackExample[];
  antiPatterns: ExecutionPackAntiPattern[];
  successChecks: ExecutionPackSuccessCheck[];
  tokenBudget: ExecutionPackTokenBudget;
  data: TData;
  renderedMarkdown: string;
}

export interface PackManifestEntry {
  id: string;
  markdown: string;
  json: string;
}

export interface PackManifestSectionEntry extends PackManifestEntry {
  pageIds: string[];
}

export interface PackManifestPageEntry extends PackManifestEntry {
  sectionId: string | null;
  sectionRole: string | null;
}

export interface PackManifestMutationEntry extends PackManifestEntry {
  mutationType: 'add-page' | 'modify';
}

export interface ExecutionPackManifest {
  $schema: string;
  version: '1.0.0';
  generatedAt: string;
  scaffold: PackManifestEntry | null;
  review: PackManifestEntry | null;
  sections: PackManifestSectionEntry[];
  pages: PackManifestPageEntry[];
  mutations: PackManifestMutationEntry[];
}

export interface ScaffoldExecutionPack
  extends ExecutionPackBase<{
    shell: string;
    theme: {
      id: string;
      mode: string;
      shape: string | null;
    };
    routing: 'hash' | 'history' | 'pathname';
    features: string[];
    routes: Array<{
      pageId: string;
      path: string;
      shell?: string;
      patternIds: string[];
    }>;
  }> {
  packType: 'scaffold';
}

export interface ReviewExecutionPack
  extends ExecutionPackBase<{
    reviewType: 'app';
    shell: string;
    theme: {
      id: string;
      mode: string;
      shape: string | null;
    };
    routing: 'hash' | 'history' | 'pathname';
    features: string[];
    routes: Array<{
      pageId: string;
      path: string;
      shell?: string;
      patternIds: string[];
    }>;
    focusAreas: string[];
    workflow: string[];
  }> {
  packType: 'review';
}

export interface SectionExecutionPack
  extends ExecutionPackBase<{
    sectionId: string;
    role: string;
    shell: string;
    description: string;
    features: string[];
    theme: {
      id: string;
      mode: string;
      shape: string | null;
    };
    routes: Array<{
      pageId: string;
      path: string;
      shell?: string;
      patternIds: string[];
    }>;
  }> {
  packType: 'section';
}

export interface PageExecutionPack
  extends ExecutionPackBase<{
    pageId: string;
    path: string;
    shell: string;
    sectionId: string | null;
    sectionRole: string | null;
    features: string[];
    surface: string;
    theme: {
      id: string;
      mode: string;
      shape: string | null;
    };
    wiringSignals: string[];
    patterns: Array<{
      id: string;
      alias: string;
      preset: string;
      layout: string;
    }>;
  }> {
  packType: 'page';
}

export interface MutationExecutionPack
  extends ExecutionPackBase<{
    mutationType: 'add-page' | 'modify';
    shell: string;
    theme: {
      id: string;
      mode: string;
      shape: string | null;
    };
    routing: 'hash' | 'history' | 'pathname';
    features: string[];
    routes: Array<{
      pageId: string;
      path: string;
      shell?: string;
      patternIds: string[];
    }>;
    workflow: string[];
  }> {
  packType: 'mutation';
}

export interface ExecutionPackBundleResponse {
  $schema: string;
  generatedAt: string;
  sourceEssenceVersion: string;
  manifest: ExecutionPackManifest;
  scaffold: ScaffoldExecutionPack;
  review: ReviewExecutionPack;
  sections: SectionExecutionPack[];
  pages: PageExecutionPack[];
  mutations: MutationExecutionPack[];
}

export interface HostedSelectedExecutionPackRequest {
  essence: EssenceFile;
  pack_type: ExecutionPackType;
  id?: string;
}

export interface SelectedExecutionPackResponse {
  $schema: string;
  generatedAt: string;
  sourceEssenceVersion: string;
  manifest: ExecutionPackManifest;
  selector: {
    packType: ExecutionPackType;
    id: string | null;
  };
  pack:
    | ScaffoldExecutionPack
    | ReviewExecutionPack
    | SectionExecutionPack
    | PageExecutionPack
    | MutationExecutionPack;
}

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

export interface FileCritiqueReport {
  $schema: string;
  file: string;
  overall: number;
  scores: VerificationScore[];
  findings: VerificationFinding[];
  focusAreas: string[];
  reviewPack: ReviewExecutionPack | null;
}

export interface ProjectAuditRuntimeAudit {
  distPresent: boolean;
  indexPresent: boolean;
  checked: boolean;
  passed: boolean | null;
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
  routeDocumentsHardenedCount: number;
  routeDocumentsCoverageOk: boolean;
  routeDocumentsHardeningOk: boolean;
  fullRouteCoverageOk: boolean;
  totalAssetBytes: number;
  jsAssetBytes: number;
  cssAssetBytes: number;
  largestAssetPath: string | null;
  largestAssetBytes: number;
  failures: string[];
}

export interface ProjectAuditSummary {
  errorCount: number;
  warnCount: number;
  infoCount: number;
  essenceVersion: string | null;
  reviewPackPresent: boolean;
  packManifestPresent: boolean;
  runtimeAuditChecked: boolean;
  runtimePassed: boolean | null;
  pageCount: number;
}

export interface ProjectAuditReport {
  $schema: string;
  projectRoot: string;
  valid: boolean;
  essence: EssenceFile | null;
  reviewPack: ReviewExecutionPack | null;
  packManifest: ExecutionPackManifest | null;
  runtimeAudit: ProjectAuditRuntimeAudit;
  findings: VerificationFinding[];
  summary: ProjectAuditSummary;
}
