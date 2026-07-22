import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import * as ts from 'typescript';
import { type SourceLocation, sourceLocationForNode } from './ast.js';
import {
  createSourceInventory,
  isPathInsideProject,
  normalizeSourcePath,
  type ProjectSourceFile,
  type SourceInventory,
  type SourceInventoryOptions,
} from './inventory.js';

export type SourceImportKind =
  | 'static-import'
  | 're-export'
  | 'require'
  | 'dynamic-import'
  | 'import-equals';

export type SourceImportResolutionKind = 'project-local' | 'external' | 'unresolved';

export interface SourceImportResolution {
  source: string;
  importer: string;
  kind: SourceImportResolutionKind;
  resolvedFileName: string | null;
  relativePath: string | null;
  extension: string | null;
  isProjectLocal: boolean;
  isExternal: boolean;
  failed: boolean;
}

export interface SourceImportReference {
  file: string;
  source: string;
  kind: SourceImportKind;
  line: number;
  column: number;
  defaultImport?: string;
  namespaceImport?: string;
  imported: string[];
  localNames: string[];
  typeOnly: boolean;
  resolved: SourceImportResolution;
}

export interface ProjectSourceProgramOptions extends SourceInventoryOptions {
  tsconfigPath?: string | null;
  compilerOptions?: ts.CompilerOptions;
}

export interface ProjectSourceProgram {
  projectRoot: string;
  tsconfigPath: string | null;
  inventory: SourceInventory;
  program: ts.Program;
  compilerOptions: ts.CompilerOptions;
  diagnostics: readonly ts.Diagnostic[];
}

export interface ResolveSourceSymbolOriginOptions {
  position?: number;
  includeExternal?: boolean;
}

export interface SourceSymbolOrigin {
  name: string;
  localName: string;
  file: string;
  absolutePath: string;
  location: SourceLocation;
  declarationKind: string;
  importedFrom?: string;
  importSource?: string;
  isProjectLocal: boolean;
}

interface ParsedCompilerConfig {
  tsconfigPath: string | null;
  compilerOptions: ts.CompilerOptions;
  diagnostics: readonly ts.Diagnostic[];
}

const RESOLUTION_EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs'];

const inventoryPathIndexes = new WeakMap<SourceInventory, Map<string, ProjectSourceFile>>();
const programSourceFileIndexes = new WeakMap<ts.Program, Map<string, ts.SourceFile>>();

const DEFAULT_COMPILER_OPTIONS: ts.CompilerOptions = {
  allowImportingTsExtensions: true,
  allowJs: true,
  allowSyntheticDefaultImports: true,
  checkJs: false,
  esModuleInterop: true,
  jsx: ts.JsxEmit.ReactJSX,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  noEmit: true,
  resolveJsonModule: true,
  skipLibCheck: true,
  target: ts.ScriptTarget.ES2022,
};

function findProjectTsConfig(projectRoot: string, tsconfigPath?: string | null): string | null {
  if (tsconfigPath === null) return null;
  if (tsconfigPath) {
    const absolutePath = isAbsolute(tsconfigPath)
      ? resolve(tsconfigPath)
      : resolve(projectRoot, tsconfigPath);
    return existsSync(absolutePath) ? absolutePath : null;
  }
  const localTsConfig = join(projectRoot, 'tsconfig.json');
  return existsSync(localTsConfig) ? localTsConfig : null;
}

function fallbackCompilerConfig(
  tsconfigPath: string | null,
  options: ProjectSourceProgramOptions,
  diagnostics: readonly ts.Diagnostic[] = [],
): ParsedCompilerConfig {
  return {
    tsconfigPath,
    compilerOptions: {
      ...DEFAULT_COMPILER_OPTIONS,
      ...options.compilerOptions,
      allowJs: true,
      noEmit: true,
      skipLibCheck: true,
    },
    diagnostics,
  };
}

function readCompilerConfig(
  projectRoot: string,
  options: ProjectSourceProgramOptions,
): ParsedCompilerConfig {
  const tsconfigPath = findProjectTsConfig(projectRoot, options.tsconfigPath);
  if (!tsconfigPath) return fallbackCompilerConfig(null, options);

  const parsedJson = ts.parseConfigFileTextToJson(
    tsconfigPath,
    readFileSync(tsconfigPath, 'utf-8'),
  );
  if (parsedJson.error) return fallbackCompilerConfig(tsconfigPath, options, [parsedJson.error]);

  const parsed = ts.parseJsonConfigFileContent(
    parsedJson.config,
    ts.sys,
    dirname(tsconfigPath),
    DEFAULT_COMPILER_OPTIONS,
    tsconfigPath,
  );

  return {
    tsconfigPath,
    compilerOptions: {
      ...DEFAULT_COMPILER_OPTIONS,
      ...parsed.options,
      ...options.compilerOptions,
      allowJs: true,
      noEmit: true,
      skipLibCheck: true,
    },
    diagnostics: parsed.errors,
  };
}

function inventoryFileByAbsolutePath(inventory: SourceInventory): Map<string, ProjectSourceFile> {
  const cached = inventoryPathIndexes.get(inventory);
  if (cached) return cached;

  const index = new Map(
    inventory.files.map((file) => [normalizeSourcePath(resolve(file.absolutePath)), file]),
  );
  inventoryPathIndexes.set(inventory, index);
  return index;
}

function sourceFileByAbsolutePath(program: ts.Program): Map<string, ts.SourceFile> {
  const cached = programSourceFileIndexes.get(program);
  if (cached) return cached;

  const index = new Map(
    program
      .getSourceFiles()
      .map((sourceFile) => [normalizeSourcePath(resolve(sourceFile.fileName)), sourceFile]),
  );
  programSourceFileIndexes.set(program, index);
  return index;
}

export function createProjectSourceProgram(
  projectRoot: string,
  options: ProjectSourceProgramOptions = {},
): ProjectSourceProgram {
  const inventory = createSourceInventory(projectRoot, options);
  const config = readCompilerConfig(inventory.projectRoot, options);
  const host = ts.createCompilerHost(config.compilerOptions, true);
  const program = ts.createProgram({
    rootNames: inventory.files.map((file) => file.absolutePath),
    options: config.compilerOptions,
    host,
  });

  return {
    projectRoot: inventory.projectRoot,
    tsconfigPath: config.tsconfigPath,
    inventory,
    program,
    compilerOptions: config.compilerOptions,
    diagnostics: [...config.diagnostics, ...program.getOptionsDiagnostics()],
  };
}

export function getProjectSourceFile(
  context: ProjectSourceProgram,
  pathOrSourceFile: string | ts.SourceFile,
): ts.SourceFile | undefined {
  if (typeof pathOrSourceFile !== 'string') return pathOrSourceFile;
  const absolutePath = isAbsolute(pathOrSourceFile)
    ? resolve(pathOrSourceFile)
    : resolve(context.projectRoot, pathOrSourceFile);
  return sourceFileByAbsolutePath(context.program).get(normalizeSourcePath(absolutePath));
}

function sourceFileRelativePath(context: ProjectSourceProgram, sourceFile: ts.SourceFile): string {
  return normalizeSourcePath(
    relative(context.projectRoot, sourceFile.fileName) || sourceFile.fileName,
  );
}

function sourceLocationLineAndColumn(
  sourceFile: ts.SourceFile,
  node: ts.Node,
): { line: number; column: number } {
  const location = sourceLocationForNode(sourceFile, node);
  return { line: location.line, column: location.column };
}

function bindingNames(name: ts.BindingName): string[] {
  if (ts.isIdentifier(name)) return [name.text];
  return name.elements.flatMap((element) => {
    if (ts.isOmittedExpression(element)) return [];
    return bindingNames(element.name);
  });
}

function importSourceText(node: ts.Node): string | null {
  if (
    (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
    node.moduleSpecifier &&
    ts.isStringLiteral(node.moduleSpecifier)
  ) {
    return node.moduleSpecifier.text;
  }
  if (
    ts.isImportEqualsDeclaration(node) &&
    ts.isExternalModuleReference(node.moduleReference) &&
    node.moduleReference.expression &&
    ts.isStringLiteral(node.moduleReference.expression)
  ) {
    return node.moduleReference.expression.text;
  }
  if (
    ts.isCallExpression(node) &&
    node.arguments.length > 0 &&
    ts.isStringLiteral(node.arguments[0])
  ) {
    if (node.expression.kind === ts.SyntaxKind.ImportKeyword) return node.arguments[0].text;
    if (ts.isIdentifier(node.expression) && node.expression.text === 'require') {
      return node.arguments[0].text;
    }
  }
  return null;
}

function hasExternalPackageShape(specifier: string): boolean {
  return !specifier.startsWith('.') && !specifier.startsWith('/') && !specifier.startsWith('#');
}

function manualResolutionCandidates(
  context: ProjectSourceProgram,
  importerPath: string,
  specifier: string,
): string[] {
  const candidates: string[] = [];
  const addCandidates = (base: string): void => {
    candidates.push(base);
    if (extname(base)) return;
    for (const extension of RESOLUTION_EXTENSIONS) candidates.push(`${base}${extension}`);
    for (const extension of RESOLUTION_EXTENSIONS) {
      candidates.push(join(base, `index${extension}`));
    }
  };

  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    const base = specifier.startsWith('/')
      ? resolve(context.projectRoot, specifier.slice(1))
      : resolve(dirname(importerPath), specifier);
    addCandidates(base);
  } else if (specifier.startsWith('@/')) {
    addCandidates(resolve(context.projectRoot, specifier.slice(2)));
    addCandidates(resolve(context.projectRoot, 'src', specifier.slice(2)));
  }

  return candidates;
}

function resolveFromInventory(
  context: ProjectSourceProgram,
  source: string,
  importerPath: string,
): SourceImportResolution | null {
  const inventoryByPath = inventoryFileByAbsolutePath(context.inventory);
  for (const candidate of manualResolutionCandidates(context, importerPath, source)) {
    const absolutePath = normalizeSourcePath(resolve(candidate));
    const inventoryFile = inventoryByPath.get(absolutePath);
    if (
      !inventoryFile ||
      !existsSync(inventoryFile.absolutePath) ||
      !statSync(inventoryFile.absolutePath).isFile()
    ) {
      continue;
    }
    return {
      source,
      importer: normalizeSourcePath(relative(context.projectRoot, importerPath) || importerPath),
      kind: 'project-local',
      resolvedFileName: inventoryFile.absolutePath,
      relativePath: inventoryFile.relativePath,
      extension: inventoryFile.extension,
      isProjectLocal: true,
      isExternal: false,
      failed: false,
    };
  }
  return null;
}

export function resolveSourceImport(
  context: ProjectSourceProgram,
  importer: string | ts.SourceFile,
  source: string,
): SourceImportResolution {
  const sourceFile = getProjectSourceFile(context, importer);
  const importerPath = sourceFile
    ? resolve(sourceFile.fileName)
    : isAbsolute(String(importer))
      ? resolve(String(importer))
      : resolve(context.projectRoot, String(importer));
  const importerRelativePath = normalizeSourcePath(
    relative(context.projectRoot, importerPath) || importerPath,
  );
  const inventoryByPath = inventoryFileByAbsolutePath(context.inventory);

  const resolved = ts.resolveModuleName(
    source,
    importerPath,
    context.compilerOptions,
    ts.sys,
  ).resolvedModule;

  if (resolved) {
    const absolutePath = normalizeSourcePath(resolve(resolved.resolvedFileName));
    const inventoryFile = inventoryByPath.get(absolutePath);
    if (inventoryFile && isPathInsideProject(context.projectRoot, absolutePath)) {
      return {
        source,
        importer: importerRelativePath,
        kind: 'project-local',
        resolvedFileName: inventoryFile.absolutePath,
        relativePath: inventoryFile.relativePath,
        extension: inventoryFile.extension,
        isProjectLocal: true,
        isExternal: false,
        failed: false,
      };
    }

    return {
      source,
      importer: importerRelativePath,
      kind: hasExternalPackageShape(source) ? 'external' : 'unresolved',
      resolvedFileName: resolved.resolvedFileName,
      relativePath: null,
      extension: extname(resolved.resolvedFileName).toLowerCase() || null,
      isProjectLocal: false,
      isExternal: hasExternalPackageShape(source),
      failed: !hasExternalPackageShape(source),
    };
  }

  const fallback = resolveFromInventory(context, source, importerPath);
  if (fallback) return fallback;

  return {
    source,
    importer: importerRelativePath,
    kind: hasExternalPackageShape(source) ? 'external' : 'unresolved',
    resolvedFileName: null,
    relativePath: null,
    extension: null,
    isProjectLocal: false,
    isExternal: hasExternalPackageShape(source),
    failed: !hasExternalPackageShape(source),
  };
}

function importReferenceBase(
  context: ProjectSourceProgram,
  sourceFile: ts.SourceFile,
  node: ts.Node,
  source: string,
  kind: SourceImportKind,
  localNames: string[],
  imported: string[] = [],
  extra: Partial<
    Pick<SourceImportReference, 'defaultImport' | 'namespaceImport' | 'typeOnly'>
  > = {},
): SourceImportReference {
  const location = sourceLocationLineAndColumn(sourceFile, node);
  return {
    file: sourceFileRelativePath(context, sourceFile),
    source,
    kind,
    line: location.line,
    column: location.column,
    imported,
    localNames,
    typeOnly: extra.typeOnly ?? false,
    resolved: resolveSourceImport(context, sourceFile, source),
    ...(extra.defaultImport ? { defaultImport: extra.defaultImport } : {}),
    ...(extra.namespaceImport ? { namespaceImport: extra.namespaceImport } : {}),
  };
}

export function collectSourceImports(
  context: ProjectSourceProgram,
  pathOrSourceFile: string | ts.SourceFile,
): SourceImportReference[] {
  const sourceFile = getProjectSourceFile(context, pathOrSourceFile);
  if (!sourceFile) return [];
  const imports: SourceImportReference[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node)) {
      const source = importSourceText(node);
      if (source) {
        const imported: string[] = [];
        const localNames: string[] = [];
        let defaultImport: string | undefined;
        let namespaceImport: string | undefined;
        let typeOnly = node.importClause?.isTypeOnly ?? false;

        if (node.importClause?.name) {
          defaultImport = node.importClause.name.text;
          localNames.push(defaultImport);
        }

        const namedBindings = node.importClause?.namedBindings;
        if (namedBindings && ts.isNamedImports(namedBindings)) {
          for (const element of namedBindings.elements) {
            imported.push((element.propertyName ?? element.name).text);
            localNames.push(element.name.text);
            typeOnly ||= element.isTypeOnly;
          }
        } else if (namedBindings && ts.isNamespaceImport(namedBindings)) {
          namespaceImport = namedBindings.name.text;
          localNames.push(namespaceImport);
        }

        imports.push(
          importReferenceBase(
            context,
            sourceFile,
            node,
            source,
            'static-import',
            localNames,
            imported,
            {
              ...(defaultImport ? { defaultImport } : {}),
              ...(namespaceImport ? { namespaceImport } : {}),
              typeOnly,
            },
          ),
        );
      }
    } else if (ts.isExportDeclaration(node)) {
      const source = importSourceText(node);
      if (source) {
        const exported =
          node.exportClause && ts.isNamedExports(node.exportClause)
            ? node.exportClause.elements.map(
                (element) => (element.propertyName ?? element.name).text,
              )
            : [];
        imports.push(
          importReferenceBase(context, sourceFile, node, source, 're-export', [], exported, {
            typeOnly: node.isTypeOnly,
          }),
        );
      }
    } else if (ts.isImportEqualsDeclaration(node)) {
      const source = importSourceText(node);
      if (source) {
        imports.push(
          importReferenceBase(context, sourceFile, node, source, 'import-equals', [node.name.text]),
        );
      }
    } else if (ts.isCallExpression(node)) {
      const source = importSourceText(node);
      if (source) {
        const kind =
          node.expression.kind === ts.SyntaxKind.ImportKeyword ? 'dynamic-import' : 'require';
        const parent = node.parent;
        const localNames =
          ts.isVariableDeclaration(parent) && parent.initializer === node
            ? bindingNames(parent.name)
            : [];
        imports.push(importReferenceBase(context, sourceFile, node, source, kind, localNames));
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return imports;
}

function findImportedFrom(identifier: ts.Identifier): {
  importedFrom?: string;
  importSource?: string;
} {
  let node: ts.Node | undefined = identifier;
  while (node) {
    if (
      ts.isImportDeclaration(node) ||
      ts.isExportDeclaration(node) ||
      ts.isImportEqualsDeclaration(node)
    ) {
      const source = importSourceText(node);
      return {
        ...(source ? { importSource: source } : {}),
        importedFrom: ts.SyntaxKind[node.kind],
      };
    }
    node = node.parent;
  }
  return {};
}

function preferImportBinding(a: ts.Identifier | null, b: ts.Identifier): ts.Identifier {
  if (!a) return b;
  const aImport = Boolean(findImportedFrom(a).importSource);
  const bImport = Boolean(findImportedFrom(b).importSource);
  if (aImport === bImport) return a;
  return bImport ? b : a;
}

function findIdentifier(
  sourceFile: ts.SourceFile,
  name: string,
  position?: number,
): ts.Identifier | null {
  let matched: ts.Identifier | null = null;

  const visit = (node: ts.Node): void => {
    if (matched && position !== undefined) return;
    if (ts.isIdentifier(node) && node.text === name) {
      if (position === undefined) {
        matched = preferImportBinding(matched, node);
      } else if (node.getStart(sourceFile) <= position && position <= node.getEnd()) {
        matched = node;
        return;
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return matched;
}

function declarationKind(declaration: ts.Declaration): string {
  return ts.SyntaxKind[declaration.kind] ?? 'Declaration';
}

export function resolveSourceSymbolOrigin(
  context: ProjectSourceProgram,
  pathOrSourceFile: string | ts.SourceFile,
  localName: string,
  options: ResolveSourceSymbolOriginOptions = {},
): SourceSymbolOrigin | null {
  const sourceFile = getProjectSourceFile(context, pathOrSourceFile);
  if (!sourceFile) return null;

  const identifier = findIdentifier(sourceFile, localName, options.position);
  if (!identifier) return null;

  const checker = context.program.getTypeChecker();
  const symbol = checker.getSymbolAtLocation(identifier);
  if (!symbol) return null;

  const originSymbol =
    symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  const declarations = originSymbol.declarations ?? symbol.declarations ?? [];
  if (declarations.length === 0) return null;

  const projectFiles = inventoryFileByAbsolutePath(context.inventory);
  const declaration =
    declarations.find((entry) =>
      projectFiles.has(normalizeSourcePath(resolve(entry.getSourceFile().fileName))),
    ) ?? declarations[0];
  const declarationFile = declaration.getSourceFile();
  const declarationPath = normalizeSourcePath(resolve(declarationFile.fileName));
  const projectFile = projectFiles.get(declarationPath);
  const isProjectLocal = Boolean(projectFile);

  if (!isProjectLocal && !options.includeExternal) return null;

  const imported = findImportedFrom(identifier);

  return {
    name: originSymbol.getName(),
    localName,
    file: projectFile?.relativePath ?? normalizeSourcePath(declarationFile.fileName),
    absolutePath: projectFile?.absolutePath ?? declarationPath,
    location: sourceLocationForNode(declarationFile, declaration),
    declarationKind: declarationKind(declaration),
    isProjectLocal,
    ...imported,
  };
}
