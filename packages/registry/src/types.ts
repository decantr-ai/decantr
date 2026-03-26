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

export interface Archetype {
  id: string;
  version: string;
  name: string;
  description: string;
  tags: string[];
  pages: ArchetypePage[];
  features: string[];
  dependencies: { patterns: Record<string, string>; recipes: Record<string, string> };
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

// --- Content Resolution ---
export type ContentType = 'pattern' | 'archetype' | 'recipe' | 'theme' | 'blueprint';

export interface ResolvedContent<T> {
  item: T;
  source: 'local' | 'installed' | 'core';
  path: string;
}
