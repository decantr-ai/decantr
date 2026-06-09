export type {
  ExtractSourceStringLiteralOptions,
  SourceLocation,
  SourceStringLiteral,
  SourceStringLiteralContext,
} from './ast.js';
export { extractSourceStringLiterals, sourceLocationForNode } from './ast.js';

export type {
  ProjectSourceFile,
  ProjectSourceKind,
  ProjectSourceLanguage,
  SourceInventory,
  SourceInventoryOptions,
  SourceInventorySkippedPath,
  SourceInventorySkipReason,
} from './inventory.js';
export {
  createSourceInventory,
  isPathInsideProject,
  isSupportedSourceExtension,
  normalizeSourcePath,
  sourceKindFromPath,
  sourceLanguageFromPath,
  sourceScriptKindFromPath,
} from './inventory.js';

export type {
  ProjectSourceProgram,
  ProjectSourceProgramOptions,
  ResolveSourceSymbolOriginOptions,
  SourceImportKind,
  SourceImportReference,
  SourceImportResolution,
  SourceImportResolutionKind,
  SourceSymbolOrigin,
} from './program.js';
export {
  collectSourceImports,
  createProjectSourceProgram,
  getProjectSourceFile,
  resolveSourceImport,
  resolveSourceSymbolOrigin,
} from './program.js';
