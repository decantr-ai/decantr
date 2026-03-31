// --- Pattern ---
export interface PatternPreset {
  description: string;
  layout: { layout: 'row' | 'column' | 'grid' | 'hero'; atoms: string };
  code: { imports: string; example: string };
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
  code?: { imports: string; example: string };
}

// --- Archetype ---
export interface ArchetypePage {
  id: string;
  default_layout: string[];
  shell: string;
}

export interface SeoHints {
  schema_org?: string[];
  meta_priorities?: string[];
}

export interface Archetype {
  id: string;
  version: string;
  name: string;
  description: string;
  tags: string[];
  pages: ArchetypePage[];
  features: string[];
  dependencies: { patterns: Record<string, string>; recipes: Record<string, string> };
  seo_hints?: SeoHints;
}

// --- Recipe ---
export interface RecipeSpatialHints {
  density_bias: number;
  content_gap_shift: number;
  section_padding: string;
  card_wrapping: 'always' | 'minimal' | 'none';
  surface_override: string | null;
}

export interface RecipeVisualEffects {
  enabled: boolean;
  intensity: 'subtle' | 'moderate' | 'bold';
  type_mapping: Record<string, string[]>;
  component_fallback: Record<string, string>;
  intensity_values?: Record<string, Record<string, string>>;
}

export interface RecipeShell {
  preferred: string[];
  nav_style: string;
  root?: string;
  nav?: string;
  header?: string;
  dimensions?: { navWidth?: string; headerHeight?: string };
}

export interface Recipe {
  id: string;
  style: string;
  mode: string;
  schema_version: string;
  spatial_hints: RecipeSpatialHints;
  shell: RecipeShell;
  visual_effects: RecipeVisualEffects;
  pattern_preferences: { prefer: string[]; avoid: string[]; default_presets?: Record<string, string> };
  pattern_overrides?: Record<string, { background?: string[] }>;
  animation?: { entrance?: string; micro?: string };
}

// --- Blueprint ---
export type ComposeEntry = string | { archetype: string; prefix: string };

export interface Blueprint {
  id: string;
  name: string;
  description?: string;
  archetype: string;
  compose?: ComposeEntry[];
  theme: { style: string; recipe?: string; mode?: string; shape?: string };
  personality?: string;
  pages: Array<{
    id: string;
    layout: string[];
    shell?: string;
  }>;
  features?: string[];
  version?: string;
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
}

// --- Content Resolution ---
export type ContentType = 'pattern' | 'archetype' | 'recipe' | 'theme' | 'blueprint';

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
  modes?: string[];
  shapes?: string[];
  cvd_support?: CvdMode[];
  tokens?: ThemeTokens;
  decantr_compat?: string;
  source?: string;
}

// --- API Client Types ---

export type ApiContentType = 'patterns' | 'recipes' | 'themes' | 'blueprints' | 'archetypes' | 'shells';

export interface ContentListResponse<T = Record<string, unknown>> {
  items: T[];
  total: number;
}

export interface ContentItem {
  id: string;
  slug: string;
  namespace: string;
  type: string;
  version: string;
  data: Record<string, unknown>;
  visibility: 'public' | 'private';
  status: 'pending' | 'approved' | 'rejected' | 'published';
  created_at: string;
  updated_at: string;
  published_at?: string;
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
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  results: Array<{
    id: string;
    type: string;
    slug: string;
    namespace: string;
    name: string;
    description: string;
    version: string;
  }>;
  total: number;
}

export interface UserProfile {
  id: string;
  email: string;
  tier: 'free' | 'pro' | 'team' | 'enterprise';
  reputation_score: number;
  trusted: boolean;
}
