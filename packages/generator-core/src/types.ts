// ─── IR Node Types ───────────────────────────────────────────

export type IRNodeType =
  | 'app'       // Root application node
  | 'shell'     // App shell (sidebar-main, top-nav-main, etc.)
  | 'page'      // A route page
  | 'pattern'   // A resolved pattern instance
  | 'grid'      // Grid layout wrapper (equal or weighted columns)
  | 'slot'      // Named content slot within a pattern
  | 'nav'       // Navigation item list
  | 'store';    // Global state signals

export interface IRSpatial {
  gap: string;            // e.g. "4" (framework maps to _gap4 or gap-4)
  padding?: string;       // e.g. "4" or "6"
  responsive?: {
    breakpoint: string;   // "sm" | "md" | "lg" | "xl"
    cols: number;         // Number of columns at/above breakpoint
  };
}

// AUTO: Hook types for custom hook generation in wired pages
export type IRHookType = 'search' | 'filter' | 'selection' | 'sort';

export interface IRWiringSignal {
  name: string;           // e.g. "pageSearch"
  setter: string;         // e.g. "setPageSearch"
  init: string;           // e.g. "''" or "'all'"
  hookType: IRHookType;   // e.g. "search" or "filter"
}

export interface IRWiring {
  signals: IRWiringSignal[];
  props: Record<string, Record<string, string>>;
  // key = pattern alias, value = { propName: signalOrSetter }
  // AUTO: hook-based wiring for rich custom hook generation
  hooks: IRHookType[];
  hookProps: Record<string, Record<string, string>>;
}

export interface IRPatternMeta {
  patternId: string;      // Base pattern ID (e.g. "filter-bar")
  preset: string;         // Resolved preset name (e.g. "default")
  alias: string;          // Local alias (e.g. "activity-filter")
  layout: string;         // "row" | "column" | "grid" | "hero" | "stack"
  contained: boolean;     // Whether to wrap in Card
  standalone: boolean;    // Hero/row patterns skip card wrapping
  code: {                 // Raw pattern code from registry (Decantr-native)
    imports: string;
    example: string;
  } | null;
  components: string[];   // Components used by this pattern
}

export interface IRVisualEffect {
  decorators: string[];   // e.g. ["d-glass", "d-gradient-hint-primary"]
  intensity: Record<string, string>; // CSS custom property overrides
}

export interface IRCardWrapping {
  mode: 'always' | 'minimal' | 'none';
  headerLabel: string;    // Display name for Card.Header
  background?: string;    // Recipe pattern_overrides background atoms
}

export interface IRNavItem {
  href: string;
  icon: string;
  label: string;
}

export interface IRShellConfig {
  type: string;           // "sidebar-main" | "top-nav-main" | "full-bleed" | etc.
  brand: string;          // Brand label (from archetype/terroir)
  nav: IRNavItem[];
  inset: boolean;
  recipe: IRRecipeDecoration | null;
}

export interface IRRecipeDecoration {
  root: string;           // CSS class for Shell root (e.g. "d-mesh")
  nav: string;            // CSS class for Shell.Nav (e.g. "d-glass")
  header: string;         // CSS class for Shell.Header
  brand: string;          // CSS class for brand label (e.g. "d-gradient-text")
  navLabel: string;       // CSS class for nav labels
  navStyle: string;       // Nav style variant (e.g. "filled")
  defaultNavState: string; // "expanded" | "rail"
  dimensions: { navWidth?: string; headerHeight?: string } | null;
}

export interface IRTheme {
  style: string;          // e.g. "auradecantism"
  mode: string;           // "light" | "dark" | "auto"
  shape: string | null;   // "sharp" | "rounded" | "pill"
  recipe: string;         // Recipe ID
  isAddon: boolean;       // Needs explicit style registration
}

export interface IRRoute {
  path: string;
  pageId: string;
}

// ─── IR Nodes ────────────────────────────────────────────────

export interface IRNode {
  type: IRNodeType;
  id: string;
  children: IRNode[];
  spatial?: IRSpatial;
  meta?: Record<string, unknown>;
}

export interface IRAppNode extends IRNode {
  type: 'app';
  theme: IRTheme;
  routes: IRRoute[];
  routing: 'hash' | 'history';
  shell: IRShellNode;
  store: IRStoreNode;
  features: string[];
}

export interface IRShellNode extends IRNode {
  type: 'shell';
  config: IRShellConfig;
}

export interface IRPageNode extends IRNode {
  type: 'page';
  pageId: string;
  surface: string;        // Surface atom string (or raw spatial intent)
  wiring: IRWiring | null;
}

export interface IRPatternNode extends IRNode {
  type: 'pattern';
  pattern: IRPatternMeta;
  card: IRCardWrapping | null;
  visualEffects: IRVisualEffect | null;
  wireProps: Record<string, string> | null;
}

export interface IRGridNode extends IRNode {
  type: 'grid';
  cols: number;
  spans: Record<string, number> | null; // null = equal width
  breakpoint: string | null;            // responsive collapse point
}

export interface IRNavNode extends IRNode {
  type: 'nav';
  items: IRNavItem[];
}

export interface IRStoreNode extends IRNode {
  type: 'store';
  pageSignals: { name: string; pascalName: string }[];
}

// ─── Generator Plugin Contract ───────────────────────────────

export interface GeneratedFile {
  path: string;           // Relative path (e.g. "src/pages/overview.tsx")
  content: string;
}

export interface GeneratorPlugin {
  /** Plugin name, used for logging and selection */
  name: string;

  /** Target identifier (e.g. "decantr", "react") */
  target: string;

  /** Transform the full IR app tree into output files */
  emit(app: IRAppNode): GeneratedFile[];
}

// ─── Pipeline Options ────────────────────────────────────────

export interface PipelineOptions {
  /** Absolute path to project root (for local pattern resolution) */
  projectRoot: string;

  /** Path to content directory (patterns, archetypes, recipes) */
  contentRoot: string;

  /** Override paths for local content resolution */
  overridePaths?: string[];

  /** Target plugin to use for code emission */
  plugin: GeneratorPlugin;

  /** Only generate specific page(s) */
  pageFilter?: string;

  /** Don't write files, just return them */
  dryRun?: boolean;

  /** Overwrite existing files */
  force?: boolean;
}

export interface PipelineResult {
  files: GeneratedFile[];
  ir: IRAppNode;
  written?: number;
  skipped?: number;
  dryRun: boolean;
}
