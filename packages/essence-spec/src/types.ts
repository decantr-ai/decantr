/**
 * Essence v2 schema types — normalized terminology.
 *
 * Terminology mapping (wine → normalized):
 *   terroir → archetype, vintage → theme, tannins → features,
 *   carafe → shell, cork → guard, blend → layout, clarity → density,
 *   vessel → platform, decantation process → essence pipeline
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
  style: ThemeStyle | string;
  mode: ThemeMode;
  recipe: string;
  shape?: ThemeShape;
}

// --- Platform ---

export type PlatformType = 'spa' | 'ssr' | 'static';
export type RoutingStrategy = 'hash' | 'history';

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

// --- Guard ---

export type GuardMode = 'creative' | 'guided' | 'strict';

export interface Guard {
  enforce_style?: boolean;
  enforce_recipe?: boolean;
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

// --- Essence (simple) ---

export interface Essence {
  $schema?: string;
  version: string;
  archetype: string;
  theme: Theme;
  character: string[];
  platform: Platform;
  structure: StructurePage[];
  features: string[];
  density: Density;
  guard: Guard;
  target: GeneratorTarget;
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
  character: string[];
  sections: EssenceSection[];
  shared_features?: string[];
  density: Density;
  guard: Guard;
  target: GeneratorTarget;
  _impression?: Impression;
}

export type EssenceFile = Essence | SectionedEssence;

export function isSectioned(essence: EssenceFile): essence is SectionedEssence {
  return 'sections' in essence && Array.isArray((essence as SectionedEssence).sections);
}

export function isSimple(essence: EssenceFile): essence is Essence {
  return 'archetype' in essence && !('sections' in essence);
}
