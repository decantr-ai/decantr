export { computeDensity, computeSpatialTokens } from './density.js';
export type { AutoFix, GuardContext, GuardViolation } from './guard.js';
export { evaluateGuard } from './guard.js';
export { migrateV2ToV3, migrateV30ToV31 } from './migrate.js';
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
  EssenceV3,
  EssenceV3Guard,
  EssenceV31Section,
  GeneratorTarget,
  Guard,
  GuardMode,
  Impression,
  LayoutItem,
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
  isSectioned,
  isSimple,
  isV3,
} from './types.js';
export type { ValidationResult } from './validate.js';
export { validateEssence } from './validate.js';
