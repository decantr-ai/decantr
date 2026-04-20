/**
 * Essence v2 schema types — normalized terminology.
 *
 * Terminology mapping (v1 wine terms → v2 normalized):
 *   terroir → archetype, vintage → theme, tannins → features,
 *   carafe → shell, cork → guard, blend → layout, clarity → density,
 *   vessel → platform, character → personality,
 *   decantation process → essence pipeline
 */

// --- Theme ---

export type ThemeStyle =
  | 'auradecantism'
  | 'clean'
  | 'glassmorphism'
  | 'retro'
  | 'bioluminescent'
  | 'launchpad'
  | 'dopamine'
  | 'editorial'
  | 'liquid-glass'
  | 'prismatic';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ThemeShape = 'sharp' | 'rounded' | 'pill';

export interface Theme {
  id: string;
  mode: ThemeMode;
  shape?: ThemeShape;
}

// --- Platform ---

export type PlatformType = 'spa' | 'ssr' | 'static';
export type RoutingStrategy = 'hash' | 'history' | 'pathname';

export interface Platform {
  type: PlatformType;
  routing: RoutingStrategy;
}

// --- Structure ---

export type ShellType =
  | 'sidebar-main'
  | 'top-nav-main'
  | 'full-bleed'
  | 'dashboard'
  | 'stacked'
  | string;

export type LayoutItem = string | PatternRef | ColumnLayout;

export interface PatternRef {
  pattern: string;
  preset?: string;
  as?: string;
}

export interface ColumnLayout {
  cols: string[];
  at?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  span?: Record<string, number>;
  // AUTO: Multi-breakpoint grid — array of { at, cols } entries for cascading breakpoints
  breakpoints?: { at: string; cols: number }[];
  // AUTO: "container" uses container queries instead of viewport breakpoints
  responsive?: 'viewport' | 'container';
}

export interface StructurePage {
  id: string;
  shell: ShellType;
  layout: LayoutItem[];
  surface?: string;
}

// --- Density ---

export type DensityLevel = 'compact' | 'comfortable' | 'spacious';

export interface Density {
  level: DensityLevel;
  content_gap: string;
}

export interface SpatialTokens {
  '--d-section-py': string;
  '--d-interactive-py': string;
  '--d-interactive-px': string;
  '--d-surface-p': string;
  '--d-data-py': string;
  '--d-control-py': string;
  '--d-content-gap': string;
  '--d-label-mb': string;
  '--d-label-px': string;
  '--d-section-gap': string;
  '--d-annotation-mt': string;
}

export interface SpatialTokenHints {
  section_padding?: string | null;
  density_bias?: number;
  content_gap_shift?: number;
  label_content_gap?: string | null;
}

export interface ShellGuidance {
  section_label_treatment?: string;
  section_density?: DensityLevel;
  [key: string]: string | DensityLevel | undefined;
}

// --- Guard ---

export type GuardMode = 'creative' | 'guided' | 'strict';

export interface Guard {
  enforce_style?: boolean;
  mode: GuardMode;
}

// --- Impression ---

export interface Impression {
  vibe: string[];
  references: string[];
  density_intent: DensityLevel | string;
  layout_intent: ShellType | string;
  novel_elements: string[];
}

// --- Generator Target ---

export type GeneratorTarget = 'decantr' | 'react' | 'vue' | 'svelte' | string;

// --- Accessibility ---

export type WcagLevel = 'none' | 'A' | 'AA' | 'AAA';

export type CvdPreference =
  | 'none'
  | 'auto'
  | 'deuteranopia'
  | 'protanopia'
  | 'tritanopia'
  | 'achromatopsia';

export interface Accessibility {
  wcag_level?: WcagLevel;
  cvd_preference?: CvdPreference;
}

// --- Essence (simple) ---

export interface Essence {
  $schema?: string;
  version: string;
  archetype: string;
  theme: Theme;
  personality: string[];
  platform: Platform;
  structure: StructurePage[];
  features: string[];
  density: Density;
  guard: Guard;
  target: GeneratorTarget;
  accessibility?: Accessibility;
  _impression?: Impression;
}

// --- Essence (sectioned) ---

export interface EssenceSection {
  id: string;
  path: string;
  archetype: string;
  theme: Theme;
  structure: StructurePage[];
  features?: string[];
}

export interface SectionedEssence {
  $schema?: string;
  version: string;
  platform: Platform;
  personality: string[];
  sections: EssenceSection[];
  shared_features?: string[];
  density: Density;
  guard: Guard;
  target: GeneratorTarget;
  accessibility?: Accessibility;
  _impression?: Impression;
}

// --- Essence v3: DNA/Blueprint/Meta split ---

export interface EssenceDNA {
  theme: Theme;
  spacing: {
    base_unit: number;
    scale: string;
    density: DensityLevel;
    content_gap: string;
  };
  typography: {
    scale: string;
    heading_weight: number;
    body_weight: number;
  };
  color: {
    palette: string;
    accent_count: number;
    cvd_preference: CvdPreference | string;
  };
  radius: {
    philosophy: ThemeShape | string;
    base: number;
  };
  elevation: {
    system: string;
    max_levels: number;
  };
  motion: {
    preference: string;
    duration_scale: number;
    reduce_motion: boolean;
    timing?: string;
    durations?: Record<string, string>;
  };
  accessibility: {
    wcag_level: WcagLevel;
    focus_visible: boolean;
    skip_nav: boolean;
  };
  personality: string[];
  constraints?: {
    mode?: string;
    typography?: string;
    borders?: string;
    corners?: string;
    shadows?: string;
    effects?: Record<string, string>;
  };
}

/** Only density and mode may be overridden per-page. DNA axioms like wcag_level and theme.id are never overrideable. */
export interface DNAOverrides {
  density?: DensityLevel;
  mode?: ThemeMode;
}

export interface BlueprintPage {
  id: string;
  route?: string;
  shell_override?: ShellType | null;
  layout: LayoutItem[];
  patterns?: PatternRef[];
  dna_overrides?: DNAOverrides;
  surface?: string;
}

export type ArchetypeRole = 'primary' | 'gateway' | 'public' | 'auxiliary';

export interface EssenceV31Section {
  id: string;
  role: ArchetypeRole;
  shell: ShellType | string;
  features: string[];
  description: string;
  pages: BlueprintPage[];
  dna_overrides?: DNAOverrides;
}

export interface RouteEntry {
  section: string;
  page: string;
}

export interface EssenceBlueprint {
  shell?: ShellType | string;
  sections?: EssenceV31Section[];
  pages?: BlueprintPage[];
  features: string[];
  routes?: Record<string, RouteEntry>;
  icon_style?: string;
  avatar_style?: string;
}

export interface EssenceV3Guard {
  mode: GuardMode;
  dna_enforcement: 'error' | 'warn' | 'off';
  blueprint_enforcement: 'warn' | 'off';
}

export interface EssenceMeta {
  archetype: string;
  target: GeneratorTarget;
  platform: Platform;
  guard: EssenceV3Guard;
  seo?: {
    schema_org?: string[];
    meta_priorities?: string[];
  };
  navigation?: {
    hotkeys?: Array<{ key: string; route?: string; action?: string; label: string }>;
    command_palette?: boolean;
  };
}

export interface EssenceV3 {
  $schema?: string;
  version: '3.0.0' | '3.1.0';
  dna: EssenceDNA;
  blueprint: EssenceBlueprint;
  meta: EssenceMeta;
  _impression?: Impression;
}

// --- Discriminated union ---

export type EssenceFile = Essence | SectionedEssence | EssenceV3;

export function isV3(essence: EssenceFile): essence is EssenceV3 {
  return (essence.version === '3.0.0' || essence.version === '3.1.0') && 'dna' in essence && 'blueprint' in essence;
}

/** Flatten sections into a flat page list (for guards and backward compat). */
export function flattenPages(blueprint: EssenceBlueprint): BlueprintPage[] {
  if (blueprint.sections && blueprint.sections.length > 0) {
    return blueprint.sections.flatMap(s =>
      s.pages.map(p => ({
        ...p,
        shell_override: p.shell_override ?? (s.shell !== blueprint.shell ? (s.shell as ShellType) : undefined),
      }))
    );
  }
  return blueprint.pages ?? [];
}

export function isSectioned(essence: EssenceFile): essence is SectionedEssence {
  if (isV3(essence)) return false;
  return 'sections' in essence && Array.isArray((essence as SectionedEssence).sections);
}

export function isSimple(essence: EssenceFile): essence is Essence {
  if (isV3(essence)) return false;
  return 'archetype' in essence && !('sections' in essence);
}
