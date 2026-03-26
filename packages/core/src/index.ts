export type {
  IRNodeType,
  IRSpatial,
  IRHookType,
  IRWiringSignal,
  IRWiring,
  IRPatternMeta,
  IRVisualEffect,
  IRCardWrapping,
  IRNavItem,
  IRShellConfig,
  IRRecipeDecoration,
  IRTheme,
  IRRoute,
  IRNode,
  IRAppNode,
  IRShellNode,
  IRPageNode,
  IRPatternNode,
  IRBreakpointEntry,
  IRGridNode,
  IRNavNode,
  IRStoreNode,
} from './types.js';

export type { PipelineOptions, PipelineResult } from './pipeline.js';
export { runPipeline } from './pipeline.js';
export { buildPageIR } from './ir.js';
export { resolveEssence, resolveVisualEffects } from './resolve.js';
export type { ResolvedPage, ResolvedEssence } from './resolve.js';
export { walkIR, findNodes, countPatterns, validateIR } from './ir-helpers.js';
