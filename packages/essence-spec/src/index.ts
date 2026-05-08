export { computeDensity, computeSpatialTokens } from './density.js';
export type { AutoFix, GuardContext, GuardViolation } from './guard.js';
export { evaluateGuard } from './guard.js';
export { migrateToV4 } from './migrate.js';
export { normalizeEssence } from './normalize.js';
export type {
  Accessibility,
  ArchetypeRole,
  BlueprintPage,
  ColumnLayout,
  CvdPreference,
  Density,
  DensityLevel,
  DNAOverrides,
  Essence,
  EssenceBlueprint,
  EssenceDNA,
  EssenceFile,
  EssenceMeta,
  EssenceSection,
  EssenceV4,
  EssenceV4Guard,
  GeneratorTarget,
  Guard,
  GuardMode,
  Impression,
  LayoutItem,
  LegacyEssenceFile,
  LegacyEssenceV3,
  PatternRef,
  Platform,
  PlatformType,
  RouteEntry,
  RoutingStrategy,
  SectionedEssence,
  ShellGuidance,
  ShellType,
  SpatialTokenHints,
  SpatialTokens,
  StructurePage,
  Theme,
  ThemeMode,
  ThemeShape,
  ThemeStyle,
  WcagLevel,
} from './types.js';
export {
  flattenPages,
  getColumnAlias,
  getColumnId,
  getColumnPreset,
  isLegacyV3,
  isSectioned,
  isSimple,
  isV4,
} from './types.js';
export type { ValidationResult } from './validate.js';
export { validateEssence, validateLegacyEssenceForMigration } from './validate.js';
