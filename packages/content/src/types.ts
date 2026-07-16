// Canonical content-domain contracts live in @decantr/content. Compatibility
// packages may re-export these types, but this module must not depend on them.

export const CONTENT_TYPES = ['pattern', 'theme', 'blueprint', 'archetype', 'shell'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const OFFICIAL_CONTENT_NAMESPACE = '@official';

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

export const BLUEPRINT_PORTFOLIO_VISIBILITIES = ['featured', 'public', 'labs', 'hidden'] as const;
export type BlueprintPortfolioVisibility = (typeof BLUEPRINT_PORTFOLIO_VISIBILITIES)[number];

export const BLUEPRINT_PORTFOLIO_MATURITIES = [
  'certified-flagship',
  'supported-contract',
  'experimental',
  'fold-candidate',
  'legacy-hidden',
] as const;
export type BlueprintPortfolioMaturity = (typeof BLUEPRINT_PORTFOLIO_MATURITIES)[number];

export const BLUEPRINT_ARTIFACT_STATUSES = ['none', 'planned', 'candidate', 'certified'] as const;
export type BlueprintArtifactStatus = (typeof BLUEPRINT_ARTIFACT_STATUSES)[number];

export const PUBLIC_BLUEPRINT_SETS = ['all', 'featured', 'certified', 'labs'] as const;
export type PublicBlueprintSet = (typeof PUBLIC_BLUEPRINT_SETS)[number];

export const PUBLIC_CONTENT_SOURCES = ['official', 'community', 'organization'] as const;
export type PublicContentSource = (typeof PUBLIC_CONTENT_SOURCES)[number];

export const CONTENT_INTELLIGENCE_SOURCES = ['authored', 'benchmark', 'hybrid'] as const;
export type ContentIntelligenceSource = (typeof CONTENT_INTELLIGENCE_SOURCES)[number];

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

export type JsonObject = Record<string, unknown>;

export function isContentType(value: unknown): value is ContentType {
  return typeof value === 'string' && CONTENT_TYPES.includes(value as ContentType);
}

export function isApiContentType(value: unknown): value is ApiContentType {
  return typeof value === 'string' && API_CONTENT_TYPES.includes(value as ApiContentType);
}

export function isBlueprintPortfolioVisibility(
  value: unknown,
): value is BlueprintPortfolioVisibility {
  return (
    typeof value === 'string' &&
    BLUEPRINT_PORTFOLIO_VISIBILITIES.includes(value as BlueprintPortfolioVisibility)
  );
}

export function isBlueprintPortfolioMaturity(value: unknown): value is BlueprintPortfolioMaturity {
  return (
    typeof value === 'string' &&
    BLUEPRINT_PORTFOLIO_MATURITIES.includes(value as BlueprintPortfolioMaturity)
  );
}

export function isBlueprintArtifactStatus(value: unknown): value is BlueprintArtifactStatus {
  return (
    typeof value === 'string' &&
    BLUEPRINT_ARTIFACT_STATUSES.includes(value as BlueprintArtifactStatus)
  );
}

export function isPublicBlueprintSet(value: unknown): value is PublicBlueprintSet {
  return typeof value === 'string' && PUBLIC_BLUEPRINT_SETS.includes(value as PublicBlueprintSet);
}

export function isPublicContentSource(value: unknown): value is PublicContentSource {
  return typeof value === 'string' && PUBLIC_CONTENT_SOURCES.includes(value as PublicContentSource);
}

export function isContentIntelligenceSource(value: unknown): value is ContentIntelligenceSource {
  return (
    typeof value === 'string' &&
    CONTENT_INTELLIGENCE_SOURCES.includes(value as ContentIntelligenceSource)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Pattern

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
  interactions?: string[];
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

// Archetype

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

// Theme

export type CvdMode = 'deuteranopia' | 'protanopia' | 'tritanopia' | 'achromatopsia';

export interface ThemeTokens {
  base?: Record<string, string>;
  cvd?: Partial<Record<CvdMode, Record<string, string>>>;
}

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
  decorators?: Record<string, string>;
  treatments?: Record<string, Record<string, string>>;
  spatial?: ThemeSpatial;
  shell?: ThemeShell;
  effects?: ThemeEffects;
  motion?: {
    preference?: string;
    reduce_motion?: boolean;
    entrance?: string;
    timing?: string;
    durations?: Record<string, string>;
  };
  typography?: { scale?: string; heading_weight?: number; body_weight?: number; mono?: string };
  radius?: { philosophy?: string; base?: number };
  compositions?: Record<string, { shell: string; description: string; effects?: string[] }>;
  pattern_preferences?: {
    prefer: string[];
    avoid: string[];
    default_presets?: Record<string, string>;
  };
  decorator_definitions?: Record<
    string,
    {
      description: string;
      intent: string;
      suggested_properties?: Record<string, string>;
      pairs_with?: string[];
      usage?: string[];
    }
  >;
}

// Blueprint

export type ComposeEntry = string | { archetype: string; prefix: string; role?: ArchetypeRole };

export interface BlueprintPortfolioArtifact {
  status: BlueprintArtifactStatus;
  showcase?: string;
  notes?: string;
}

export interface BlueprintPortfolioMetadata {
  visibility: BlueprintPortfolioVisibility;
  maturity: BlueprintPortfolioMaturity;
  rationale: string;
  recommended_alternative?: string;
  artifact: BlueprintPortfolioArtifact;
}

export function getBlueprintPortfolioMetadata(value: unknown): BlueprintPortfolioMetadata | null {
  const candidate =
    isRecord(value) && isRecord(value.blueprint_portfolio) ? value.blueprint_portfolio : value;
  if (!isRecord(candidate) || !isRecord(candidate.artifact)) {
    return null;
  }

  if (
    !isBlueprintPortfolioVisibility(candidate.visibility) ||
    !isBlueprintPortfolioMaturity(candidate.maturity) ||
    typeof candidate.rationale !== 'string' ||
    !isBlueprintArtifactStatus(candidate.artifact.status)
  ) {
    return null;
  }

  return {
    visibility: candidate.visibility,
    maturity: candidate.maturity,
    rationale: candidate.rationale,
    recommended_alternative:
      typeof candidate.recommended_alternative === 'string'
        ? candidate.recommended_alternative
        : undefined,
    artifact: {
      status: candidate.artifact.status,
      showcase:
        typeof candidate.artifact.showcase === 'string' ? candidate.artifact.showcase : undefined,
      notes: typeof candidate.artifact.notes === 'string' ? candidate.artifact.notes : undefined,
    },
  };
}

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
  blueprint_portfolio?: BlueprintPortfolioMetadata;
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

// Shell and resolver data map

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

export interface ContentTypeMap {
  pattern: Pattern;
  theme: Theme;
  blueprint: Blueprint;
  archetype: Archetype;
  shell: Shell;
}

export type ContentData = ContentTypeMap[ContentType];

export interface ResolvedContent<T> {
  item: T;
  source: 'local' | 'core';
  path: string;
}

export interface ResolverOptions {
  contentRoot: string;
  overridePaths?: string[];
}

export interface ContentResolver {
  resolve<T extends ContentType>(
    type: T,
    id: string,
  ): Promise<ResolvedContent<ContentTypeMap[T]> | null>;
}

// Content Health

export type VerificationSeverity = 'error' | 'warn' | 'info';
export type ContentHealthStatus = 'healthy' | 'warning' | 'error';
export type ContentHealthFindingSource =
  | 'schema'
  | 'reference'
  | 'quality'
  | 'coverage'
  | 'content';

export interface ContentHealthRemediation {
  summary: string;
  prompt: string;
  commands: string[];
}

export interface ContentHealthFinding {
  id: string;
  source: ContentHealthFindingSource;
  category: string;
  severity: VerificationSeverity;
  message: string;
  evidence: string[];
  file?: string;
  type?: ContentType;
  itemId?: string;
  rule?: string;
  suggestedFix?: string;
  remediation: ContentHealthRemediation;
}

export interface ContentHealthTypeSummary {
  type: ContentType;
  directory: ApiContentType;
  itemCount: number;
  validCount: number;
  errorCount: number;
  warnCount: number;
  infoCount: number;
  ignoredCount: number;
}

export interface ContentHealthReferenceSummary {
  checked: number;
  missing: number;
  missingByType: Record<ContentType, number>;
}

export interface ContentHealthQualitySummary {
  patternVisualBriefCoverage: number;
  patternInteractionCoverage: number;
  themeDecoratorCoverage: number;
  blueprintPersonalityCoverage: number;
  blueprintVoiceCoverage: number;
  archetypePageBriefCoverage: number;
}

export interface ContentHealthReport {
  $schema: string;
  generatedAt: string;
  contentRoot: string;
  status: ContentHealthStatus;
  score: number;
  summary: {
    itemCount: number;
    validCount: number;
    errorCount: number;
    warnCount: number;
    infoCount: number;
    findingCount: number;
    ignoredCount: number;
    contentDirectoryCount: number;
  };
  content: ContentHealthTypeSummary[];
  references: ContentHealthReferenceSummary;
  quality: ContentHealthQualitySummary;
  ci: {
    recommendedCommand: string;
    failOn: 'error' | 'warn' | 'none';
  };
  findings: ContentHealthFinding[];
}
