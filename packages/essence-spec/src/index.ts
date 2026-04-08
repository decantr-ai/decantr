export type {
  Essence,
  SectionedEssence,
  EssenceV3,
  EssenceDNA,
  EssenceBlueprint,
  EssenceMeta,
  EssenceV3Guard,
  BlueprintPage,
  DNAOverrides,
  EssenceFile,
  EssenceSection,
  Theme,
  ThemeStyle,
  ThemeMode,
  ThemeShape,
  Platform,
  PlatformType,
  RoutingStrategy,
  StructurePage,
  ShellType,
  LayoutItem,
  PatternRef,
  ColumnLayout,
  Density,
  DensityLevel,
  Guard,
  GuardMode,
  Impression,
  GeneratorTarget,
  Accessibility,
  WcagLevel,
  CvdPreference,
  ArchetypeRole,
  EssenceV31Section,
  RouteEntry,
} from './types.js';

export { isSectioned, isSimple, isV3, flattenPages } from './types.js';

export { validateEssence } from './validate.js';
export type { ValidationResult } from './validate.js';

export { computeDensity, computeSpatialTokens } from './density.js';
export type { SpatialTokens, SpatialTokenHints, ShellGuidance } from './types.js';

export { evaluateGuard } from './guard.js';
export type { GuardViolation, GuardContext, AutoFix } from './guard.js';

export { normalizeEssence } from './normalize.js';

export { migrateV2ToV3, migrateV30ToV31 } from './migrate.js';
