// --- Pattern ---
export interface PatternLayoutSpec {
  layout: string;
  atoms: string;
  slots?: Record<string, string>;
}

export interface PatternCodeSpec {
  imports?: string;
  example?: string;
}

export interface PatternPreset {
  description: string;
  components?: string[];
  layout: PatternLayoutSpec;
  code?: PatternCodeSpec;
}

export interface PatternIO {
  produces?: string[];
  consumes?: string[];
  actions?: string[];
}

export interface Pattern {
  id: string;
  version: string;
  name: string;
  description: string;
  tags: string[];
  components: string[];
  default_preset: string;
  presets: Record<string, PatternPreset>;
  contained?: boolean;
  io?: PatternIO;
  code?: PatternCodeSpec;
  default_layout?: PatternLayoutSpec;
  visual_brief?: string;
  composition?: Record<string, string>;
  motion?: {
    micro?: Record<string, string>;
    transitions?: Record<string, string>;
    ambient?: Record<string, string>;
  };
  responsive?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  accessibility?: {
    role?: string;
    'aria-label'?: string;
    keyboard?: string[];
    announcements?: string[];
    focus_management?: string;
  };
  layout_hints?: Record<string, string>;
  category?: string;
}

// --- Archetype ---
export type ArchetypeRole = 'primary' | 'gateway' | 'public' | 'auxiliary';

export interface PatternReferenceObject {
  pattern: string;
  preset?: string;
  as?: string;
}

export type PatternReference = string | PatternReferenceObject;

export interface LayoutGroup {
  cols: PatternReference[];
  at?: string;
  span?: Record<string, number>;
}

export type LayoutItem = PatternReference | LayoutGroup;

export interface ContentDependencies {
  [kind: string]: Record<string, string>;
}

export interface ArchetypePage {
  id: string;
  default_layout: LayoutItem[];
  shell: string;
  description?: string;
  patterns?: PatternReference[];
}

export interface SeoHints {
  schema_org?: string[];
  meta_priorities?: string[];
}

export interface ArchetypeSuggestedTheme {
  ids?: string[];
  modes?: string[];
  shapes?: string[];
}

export interface ArchetypeHeroCustomization {
  style?: string;
  elements?: string[];
  background?: string;
  [key: string]: unknown;
}

export interface Archetype {
  $schema?: string;
  id: string;
  version: string;
  decantr_compat?: string;
  name: string;
  description: string;
  tags: string[];
  role: ArchetypeRole;
  pages: ArchetypePage[];
  features: string[];
  dependencies?: ContentDependencies;
  seo_hints?: SeoHints;
  classification?: {
    triggers: { primary: string[]; secondary: string[]; negative: string[] };
    implies: string[];
    weight: number;
    tier: string;
  };
  page_briefs?: Record<string, string>;
  suggested_theme?: ArchetypeSuggestedTheme;
  shells?: Record<string, string>;
  personality?: string[];
  hero_customization?: ArchetypeHeroCustomization;
}

// --- Theme substructures (absorbed from former Recipe type) ---
export interface ThemeSpatial {
  density_bias: number;
  content_gap_shift: number;
  section_padding: string;
  card_wrapping: 'always' | 'minimal' | 'none';
  surface_override: string | null;
}

export interface ThemeEffects {
  enabled: boolean;
  intensity: 'subtle' | 'moderate' | 'bold';
  type_mapping: Record<string, string[]>;
  component_fallback: Record<string, string>;
  intensity_values?: Record<string, Record<string, string>>;
}

export interface ThemeShell {
  preferred: string[];
  nav_style: string;
  root?: string;
  nav?: string;
  header?: string;
  dimensions?: { navWidth?: string; headerHeight?: string };
}

// --- Blueprint ---
export type ComposeEntry = string | { archetype: string; prefix: string; role?: ArchetypeRole };

export interface BlueprintRoute {
  shell?: string;
  archetype?: string;
  page?: string;
}

export interface BlueprintNavigationHotkey {
  key: string;
  route?: string;
  label?: string;
}

export interface BlueprintNavigation {
  command_palette?: boolean;
  hotkeys?: BlueprintNavigationHotkey[];
}

export interface BlueprintOverrides {
  features_add?: string[];
  features_remove?: string[];
  pages_remove?: string[];
  pages?: Record<string, Record<string, unknown>>;
}

export interface Blueprint {
  $schema?: string;
  id: string;
  version?: string;
  decantr_compat?: string;
  name: string;
  description?: string;
  tags?: string[];
  archetype?: string;
  compose?: ComposeEntry[];
  theme: { id: string; mode?: string; shape?: string };
  personality?: string | string[];
  features?: string[];
  routes?: Record<string, BlueprintRoute>;
  overrides?: BlueprintOverrides;
  seo_hints?: SeoHints;
  navigation?: BlueprintNavigation;
  dependencies?: ContentDependencies;
  suggested_themes?: string[];
  design_constraints?: Record<string, unknown>;
  voice?: {
    tone?: string;
    cta_verbs?: string[];
    avoid?: string[];
    empty_states?: string;
    errors?: string;
    loading?: string;
    metrics_format?: string;
  };
  responsive_strategy?: {
    breakpoints?: string[];
    navigation?: Record<string, string>;
    data_display?: Record<string, string>;
  };
}

// --- Shell ---
export interface Shell {
  id: string;
  name: string;
  description?: string;
  root?: string;
  nav?: string;
  header?: string;
  nav_style?: string;
  dimensions?: {
    navWidth?: string;
    headerHeight?: string;
  };
  internal_layout?: Record<string, unknown>;
  layout?: string;
  atoms?: string;
  config?: Record<string, unknown>;
  guidance?: Record<string, string>;
  code?: { imports?: string; example?: string };
}

// --- Content Resolution ---
export const CONTENT_TYPES = [
  'pattern',
  'theme',
  'blueprint',
  'archetype',
  'shell',
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export const API_CONTENT_TYPES = [
  'patterns',
  'themes',
  'blueprints',
  'archetypes',
  'shells',
] as const;

export type ApiContentType = (typeof API_CONTENT_TYPES)[number];

export const CONTENT_TYPE_TO_API_CONTENT_TYPE: Record<ContentType, ApiContentType> = {
  pattern: 'patterns',
  theme: 'themes',
  blueprint: 'blueprints',
  archetype: 'archetypes',
  shell: 'shells',
};

export const API_CONTENT_TYPE_TO_CONTENT_TYPE: Record<ApiContentType, ContentType> = {
  patterns: 'pattern',
  themes: 'theme',
  blueprints: 'blueprint',
  archetypes: 'archetype',
  shells: 'shell',
};

export function isContentType(value: string): value is ContentType {
  return CONTENT_TYPES.includes(value as ContentType);
}

export function isApiContentType(value: string): value is ApiContentType {
  return API_CONTENT_TYPES.includes(value as ApiContentType);
}

export interface ResolvedContent<T> {
  item: T;
  source: 'local' | 'core';
  path: string;
}

// --- Theme ---

export type CvdMode = 'deuteranopia' | 'protanopia' | 'tritanopia' | 'achromatopsia';

export interface ThemeTokens {
  base?: Record<string, string>;
  cvd?: Partial<Record<CvdMode, Record<string, string>>>;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  personality?: string;
  seed?: Record<string, string>;
  palette?: Record<string, Record<string, string>>;
  modes?: string[];
  shapes?: string[];
  cvd_support?: CvdMode[];
  tokens?: ThemeTokens;
  decantr_compat?: string;
  source?: string;
  // Absorbed from former Recipe type
  decorators?: Record<string, string>;
  treatments?: Record<string, Record<string, string>>;
  spatial?: ThemeSpatial;
  shell?: ThemeShell;
  effects?: ThemeEffects;
  motion?: { preference?: string; reduce_motion?: boolean; entrance?: string; timing?: string; durations?: Record<string, string> };
  typography?: { scale?: string; heading_weight?: number; body_weight?: number; mono?: string };
  radius?: { philosophy?: string; base?: number };
  compositions?: Record<string, { shell: string; description: string; effects?: string[] }>;
  pattern_preferences?: { prefer: string[]; avoid: string[]; default_presets?: Record<string, string> };
  decorator_definitions?: Record<string, {
    description: string;
    intent: string;
    suggested_properties?: Record<string, string>;
    pairs_with?: string[];
    usage?: string[];
  }>;
}

// --- API Client Types ---

export interface ContentListResponse<T = Record<string, unknown>> {
  items: T[];
  total: number;
  limit?: number;
  offset?: number;
}

export type ContentVerificationStatus =
  | 'unknown'
  | 'pending'
  | 'build-green'
  | 'build-red'
  | 'smoke-green'
  | 'smoke-red';

export type ContentBenchmarkConfidence = 'none' | 'low' | 'medium' | 'high';
export type ContentConfidenceTier = 'low' | 'medium' | 'high' | 'verified';

export type ContentGoldenUsage = 'none' | 'showcase' | 'shortlisted';

export const CONTENT_INTELLIGENCE_SOURCES = [
  'authored',
  'benchmark',
  'hybrid',
] as const;

export type ContentIntelligenceSource = 'authored' | 'benchmark' | 'hybrid';

export function isContentIntelligenceSource(value: string): value is ContentIntelligenceSource {
  return CONTENT_INTELLIGENCE_SOURCES.includes(value as ContentIntelligenceSource);
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
  benchmark?: {
    classification?: ShowcaseVerificationEntry['classification'];
    target?: string | null;
    drift_signal?: ShowcaseVerificationEntry['drift']['signal'];
    build_passed?: boolean | null;
    smoke_passed?: boolean | null;
  };
}

export interface PublicContentSummary {
  id: string;
  slug: string;
  namespace: string;
  type: string;
  version?: string;
  name?: string;
  description?: string;
  published_at?: string;
  owner_name?: string | null;
  owner_username?: string | null;
  intelligence?: ContentIntelligenceMetadata | null;
}

export interface PublicContentRecord<TData = Record<string, unknown>> {
  id: string;
  slug: string;
  namespace: string;
  type: string;
  version: string;
  data: TData;
  visibility: 'public' | 'private';
  status: 'pending' | 'approved' | 'rejected' | 'published';
  created_at: string;
  updated_at: string;
  published_at?: string;
  owner_name?: string | null;
  owner_username?: string | null;
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
  sort?: string;
  recommended?: boolean;
  intelligenceSource?: ContentIntelligenceSource;
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  results: PublicContentSummary[];
  total: number;
  limit?: number;
  offset?: number;
}

export interface RegistryIntelligenceSummaryBucket {
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

export interface RegistryIntelligenceSummaryResponse {
  $schema: string;
  generated_at: string;
  namespace: string | null;
  totals: RegistryIntelligenceSummaryBucket;
  by_type: Record<ContentType, RegistryIntelligenceSummaryBucket>;
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
    assetCount: number;
    assetsPassed: number;
    routeHintsChecked: string[];
    routeHintsMatched: number;
    routeDocumentsChecked: number;
    routeDocumentsPassed: number;
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
  appsWithRouteCoverageCount: number;
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

export interface ScaffoldExecutionPack extends ExecutionPackBase<{
  shell: string;
  theme: {
    id: string;
    mode: string;
    shape: string | null;
  };
  routing: 'hash' | 'history';
  features: string[];
  routes: Array<{
    pageId: string;
    path: string;
    patternIds: string[];
  }>;
}> {
  packType: 'scaffold';
}

export interface ReviewExecutionPack extends ExecutionPackBase<{
  reviewType: 'app';
  shell: string;
  theme: {
    id: string;
    mode: string;
    shape: string | null;
  };
  routing: 'hash' | 'history';
  features: string[];
  routes: Array<{
    pageId: string;
    path: string;
    patternIds: string[];
  }>;
  focusAreas: string[];
  workflow: string[];
}> {
  packType: 'review';
}

export interface SectionExecutionPack extends ExecutionPackBase<{
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
    patternIds: string[];
  }>;
}> {
  packType: 'section';
}

export interface PageExecutionPack extends ExecutionPackBase<{
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

export interface MutationExecutionPack extends ExecutionPackBase<{
  mutationType: 'add-page' | 'modify';
  shell: string;
  theme: {
    id: string;
    mode: string;
    shape: string | null;
  };
  routing: 'hash' | 'history';
  features: string[];
  routes: Array<{
    pageId: string;
    path: string;
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
