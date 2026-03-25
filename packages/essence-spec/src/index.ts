export type {
  Essence,
  SectionedEssence,
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
} from './types.js';

export { isSectioned, isSimple } from './types.js';

export { validateEssence } from './validate.js';
export type { ValidationResult } from './validate.js';

export { computeDensity } from './density.js';

export { evaluateGuard } from './guard.js';
export type { GuardViolation, GuardContext } from './guard.js';

export { normalizeEssence } from './normalize.js';
