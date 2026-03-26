export type {
  PatternPreset,
  PatternIO,
  Pattern,
  ArchetypePage,
  Archetype,
  RecipeSpatialHints,
  RecipeVisualEffects,
  RecipeShell,
  Recipe,
  ContentType,
  ResolvedContent,
} from './types.js';

export { createResolver } from './resolver.js';
export type { ResolverOptions, ContentResolver } from './resolver.js';

export { resolvePatternPreset } from './pattern.js';
export type { ResolvedPreset } from './pattern.js';

export { detectWirings, WIRING_RULES } from './wiring.js';
export type { HookType, WiringSignal, WiringRule, WiringResult } from './wiring.js';

export { createRegistryClient } from './client.js';
export type { RegistryClientOptions, SearchResult, RegistryClient } from './client.js';
