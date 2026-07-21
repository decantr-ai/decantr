import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import * as ts from 'typescript';
import { isPathInsideProject, normalizeSourcePath } from './source/inventory.js';
import {
  collectSourceImports,
  createProjectSourceProgram,
  getProjectSourceFile,
  type ProjectSourceProgram,
  resolveSourceImport,
} from './source/program.js';

export type AngularRouteAuthority = 'proven' | 'inferred' | 'unresolved';
export type AngularRouteCompleteness = 'complete' | 'partial' | 'unknown';

export interface AngularProjectContext {
  matched: boolean;
  projectName: string | null;
  configurationFiles: string[];
  sourceRoot: string | null;
  mainFiles: string[];
  styleEntries: string[];
  styleFiles: string[];
  tsconfigPath: string | null;
  evidence: string[];
  limitations: string[];
}

export interface AngularRouteSignal {
  path: string;
  file: string;
  confidence: 'high' | 'medium' | 'low';
  taskable: boolean;
  evidence: string;
}

export interface AngularRouteDiscovery {
  signals: AngularRouteSignal[];
  authority: AngularRouteAuthority;
  completeness: AngularRouteCompleteness;
  authorityFiles: string[];
  excludedSourceCount: number;
  evidence: string[];
  limitations: string[];
}

export interface AngularComponentCandidate {
  name: string;
  file: string;
  confidence: 'high';
}

export interface AngularComponentDiscovery {
  items: AngularComponentCandidate[];
  evidence: string[];
  limitations: string[];
}

export interface AngularApplicationDiscovery {
  project: AngularProjectContext;
  routes: AngularRouteDiscovery;
  components: AngularComponentDiscovery;
}

type JsonRecord = Record<string, unknown>;

interface AngularConfigCandidate {
  path: string;
  base: string;
  kind: 'angular.json' | 'project.json';
}

interface AngularProjectSelection {
  name: string | null;
  project: JsonRecord;
  config: AngularConfigCandidate;
}

interface RouteParseState {
  authority: AngularRouteAuthority;
  authorityFiles: Set<string>;
  checker: ts.TypeChecker;
  context: ProjectSourceProgram;
  signals: AngularRouteSignal[];
  unresolved: Set<string>;
  visitedExpressions: Set<string>;
}

const EMPTY_ANGULAR_PROJECT: AngularProjectContext = {
  matched: false,
  projectName: null,
  configurationFiles: [],
  sourceRoot: null,
  mainFiles: [],
  styleEntries: [],
  styleFiles: [],
  tsconfigPath: null,
  evidence: [],
  limitations: [],
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function uniqueSorted(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function readJsonRecord(path: string): JsonRecord | null {
  if (!existsSync(path)) return null;
  try {
    const parsed = ts.parseConfigFileTextToJson(path, readFileSync(path, 'utf8'));
    return !parsed.error && isRecord(parsed.config) ? parsed.config : null;
  } catch {
    return null;
  }
}

function workspaceRelative(workspaceRoot: string, path: string): string {
  return normalizeSourcePath(relative(workspaceRoot, path) || '.');
}

function appRelative(appRoot: string, path: string): string | null {
  if (!isPathInsideProject(appRoot, path)) return null;
  return normalizeSourcePath(relative(appRoot, path) || '.');
}

function angularConfigCandidates(appRoot: string, workspaceRoot: string): AngularConfigCandidate[] {
  const candidates: AngularConfigCandidate[] = [];
  const add = (path: string, kind: AngularConfigCandidate['kind']): void => {
    if (!existsSync(path) || candidates.some((candidate) => candidate.path === path)) return;
    candidates.push({ path, base: dirname(path), kind });
  };
  add(join(appRoot, 'project.json'), 'project.json');
  add(join(appRoot, 'angular.json'), 'angular.json');
  add(join(workspaceRoot, 'angular.json'), 'angular.json');
  return candidates;
}

function projectRootForSelection(config: AngularConfigCandidate, project: JsonRecord): string {
  const configuredRoot = typeof project.root === 'string' ? project.root : '';
  return resolve(config.base, configuredRoot);
}

function chooseAngularProject(
  appRoot: string,
  workspaceRoot: string,
): AngularProjectSelection | null {
  const packageName = readJsonRecord(join(appRoot, 'package.json'))?.name;
  for (const config of angularConfigCandidates(appRoot, workspaceRoot)) {
    const parsed = readJsonRecord(config.path);
    if (!parsed) continue;
    if (config.kind === 'project.json') {
      return {
        name: typeof parsed.name === 'string' ? parsed.name : null,
        project: parsed,
        config,
      };
    }
    if (!isRecord(parsed.projects)) continue;
    const projects = Object.entries(parsed.projects).filter(
      (entry): entry is [string, JsonRecord] => isRecord(entry[1]),
    );
    const exact = projects.find(
      ([, project]) => projectRootForSelection(config, project) === appRoot,
    );
    const sourceOwned = projects.find(([, project]) => {
      if (typeof project.sourceRoot !== 'string') return false;
      return isPathInsideProject(appRoot, resolve(config.base, project.sourceRoot));
    });
    const named =
      typeof packageName === 'string'
        ? projects.find(([name]) => name === packageName || name === packageName.split('/').at(-1))
        : undefined;
    const only = config.base === appRoot && projects.length === 1 ? projects[0] : undefined;
    const selected = exact ?? sourceOwned ?? named ?? only;
    if (selected) return { name: selected[0], project: selected[1], config };
  }
  return null;
}

function buildTarget(project: JsonRecord): JsonRecord | null {
  const targets = isRecord(project.targets)
    ? project.targets
    : isRecord(project.architect)
      ? project.architect
      : null;
  return targets && isRecord(targets.build) ? targets.build : null;
}

function buildOptions(project: JsonRecord): JsonRecord {
  const target = buildTarget(project);
  return target && isRecord(target.options) ? target.options : {};
}

function configuredPathCandidates(
  value: string,
  selection: AngularProjectSelection,
  appRoot: string,
  workspaceRoot: string,
): string[] {
  if (isAbsolute(value)) return [resolve(value)];
  const roots = [selection.config.base, workspaceRoot, appRoot];
  return uniqueSorted(roots.map((root) => resolve(root, value)));
}

function resolveConfiguredPath(
  value: string,
  selection: AngularProjectSelection,
  appRoot: string,
  workspaceRoot: string,
): string | null {
  const candidates = configuredPathCandidates(value, selection, appRoot, workspaceRoot);
  return (
    candidates.find(
      (candidate) => existsSync(candidate) && isPathInsideProject(appRoot, candidate),
    ) ??
    candidates.find((candidate) => isPathInsideProject(appRoot, candidate)) ??
    null
  );
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry === 'string') return [entry];
    if (isRecord(entry) && typeof entry.input === 'string') return [entry.input];
    return [];
  });
}

export function discoverAngularProjectContext(
  appRootInput: string,
  workspaceRootInput: string,
): AngularProjectContext {
  const appRoot = resolve(appRootInput);
  const workspaceRoot = resolve(workspaceRootInput);
  const selection = chooseAngularProject(appRoot, workspaceRoot);
  if (!selection) return { ...EMPTY_ANGULAR_PROJECT };

  const options = buildOptions(selection.project);
  const mainValue =
    typeof options.browser === 'string'
      ? options.browser
      : typeof options.main === 'string'
        ? options.main
        : null;
  const fallbackMain = existsSync(join(appRoot, 'src', 'main.ts')) ? 'src/main.ts' : null;
  const configuredMain = mainValue ?? fallbackMain;
  const mainFiles = configuredMain
    ? configuredPathCandidates(configuredMain, selection, appRoot, workspaceRoot)
        .filter((path) => existsSync(path) && isPathInsideProject(appRoot, path))
        .map((path) => appRelative(appRoot, path))
        .filter((path): path is string => Boolean(path))
    : [];
  const sourceRootValue =
    typeof selection.project.sourceRoot === 'string' ? selection.project.sourceRoot : null;
  const sourceRootPath = sourceRootValue
    ? resolveConfiguredPath(sourceRootValue, selection, appRoot, workspaceRoot)
    : existsSync(join(appRoot, 'src'))
      ? join(appRoot, 'src')
      : null;
  const styleEntries = stringArray(options.styles);
  const styleFiles = styleEntries
    .map((entry) => resolveConfiguredPath(entry, selection, appRoot, workspaceRoot))
    .filter((path): path is string => path !== null && existsSync(path))
    .map((path) => appRelative(appRoot, path))
    .filter((path): path is string => Boolean(path));
  const tsconfigValue = typeof options.tsConfig === 'string' ? options.tsConfig : null;
  const tsconfigPath = tsconfigValue
    ? resolveConfiguredPath(tsconfigValue, selection, appRoot, workspaceRoot)
    : null;
  const configDisplay = workspaceRelative(workspaceRoot, selection.config.path);
  const evidence = [
    `Angular project${selection.name ? ` "${selection.name}"` : ''} selected from ${configDisplay}`,
    ...mainFiles.map((file) => `Angular build entry: ${file}`),
    ...styleEntries.map((file) => `Angular global style entry: ${file}`),
  ];
  const limitations = [
    ...(configuredMain && mainFiles.length === 0
      ? [`Angular build entry could not be resolved inside the selected app: ${configuredMain}`]
      : []),
    ...styleEntries
      .filter((entry) => !styleFiles.some((file) => file === entry || file.endsWith(`/${entry}`)))
      .map(
        (entry) =>
          `Configured Angular style entry is not present inside the selected app: ${entry}`,
      ),
  ];

  return {
    matched: true,
    projectName: selection.name,
    configurationFiles: [appRelative(appRoot, selection.config.path) ?? configDisplay],
    sourceRoot: sourceRootPath ? appRelative(appRoot, sourceRootPath) : null,
    mainFiles: uniqueSorted(mainFiles),
    styleEntries: uniqueSorted(styleEntries),
    styleFiles: uniqueSorted(styleFiles),
    tsconfigPath: tsconfigPath ? appRelative(appRoot, tsconfigPath) : null,
    evidence: uniqueSorted(evidence),
    limitations: uniqueSorted(limitations),
  };
}

function expressionName(expression: ts.Expression): string | null {
  const current = unwrapExpression(expression);
  if (ts.isIdentifier(current)) return current.text;
  if (ts.isPropertyAccessExpression(current)) return current.name.text;
  return null;
}

function unwrapExpression(expression: ts.Expression): ts.Expression {
  let current = expression;
  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isNonNullExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function nodeKey(node: ts.Node): string {
  const file = normalizeSourcePath(node.getSourceFile().fileName);
  return `${file}:${node.pos}:${node.end}`;
}

function sourceRelative(context: ProjectSourceProgram, sourceFile: ts.SourceFile): string {
  return normalizeSourcePath(relative(context.projectRoot, sourceFile.fileName));
}

function propertyNameText(name: ts.PropertyName | undefined): string | null {
  if (!name) return null;
  if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name)) return name.text;
  if (ts.isStringLiteralLike(name) || ts.isNumericLiteral(name)) return name.text;
  return null;
}

function propertyExpression(
  object: ts.ObjectLiteralExpression,
  name: string,
): ts.Expression | null {
  for (const property of object.properties) {
    if (ts.isPropertyAssignment(property) && propertyNameText(property.name) === name) {
      return property.initializer;
    }
    if (ts.isShorthandPropertyAssignment(property) && property.name.text === name) {
      return property.name;
    }
  }
  return null;
}

function declarationInitializer(declaration: ts.Declaration): ts.Expression | null {
  if (
    (ts.isVariableDeclaration(declaration) ||
      ts.isPropertyAssignment(declaration) ||
      ts.isPropertyDeclaration(declaration) ||
      ts.isBindingElement(declaration)) &&
    declaration.initializer
  ) {
    return declaration.initializer;
  }
  if (ts.isExportAssignment(declaration)) return declaration.expression;
  return null;
}

function declarationForExpression(
  state: RouteParseState,
  expression: ts.Expression,
): ts.Declaration | null {
  const current = unwrapExpression(expression);
  const symbolNode = ts.isPropertyAccessExpression(current) ? current.name : current;
  const symbol = state.checker.getSymbolAtLocation(symbolNode);
  if (!symbol) return null;
  const resolved =
    symbol.flags & ts.SymbolFlags.Alias ? state.checker.getAliasedSymbol(symbol) : symbol;
  const declarations = resolved.declarations ?? symbol.declarations ?? [];
  return (
    declarations.find((declaration) =>
      isPathInsideProject(state.context.projectRoot, declaration.getSourceFile().fileName),
    ) ?? null
  );
}

function resolveStaticString(
  state: RouteParseState,
  expression: ts.Expression,
  visited = new Set<string>(),
): string | null {
  const current = unwrapExpression(expression);
  if (ts.isStringLiteralLike(current)) return current.text;
  if (ts.isBinaryExpression(current) && current.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = resolveStaticString(state, current.left, visited);
    const right = resolveStaticString(state, current.right, visited);
    return left !== null && right !== null ? `${left}${right}` : null;
  }
  const declaration = declarationForExpression(state, current);
  if (!declaration) return null;
  const key = nodeKey(declaration);
  if (visited.has(key)) return null;
  visited.add(key);
  const initializer = declarationInitializer(declaration);
  return initializer ? resolveStaticString(state, initializer, visited) : null;
}

function routeTypeSignal(node: ts.Node): boolean {
  if (ts.isVariableDeclaration(node)) {
    const typeText = node.type?.getText(node.getSourceFile()) ?? '';
    const initializerText = node.initializer?.getText(node.getSourceFile()) ?? '';
    return /(?:^|\W)(?:Routes|Route\[\])(?:\W|$)/u.test(`${typeText} ${initializerText}`);
  }
  if (ts.isExportAssignment(node)) {
    return /\bas\s+(?:readonly\s+)?Routes\b|\bsatisfies\s+Routes\b/u.test(
      node.expression.getText(node.getSourceFile()),
    );
  }
  return false;
}

function routeArrayCandidates(sourceFiles: ts.SourceFile[]): ts.Expression[] {
  const candidates: ts.Expression[] = [];
  for (const sourceFile of sourceFiles) {
    const visit = (node: ts.Node): void => {
      if (ts.isVariableDeclaration(node) && node.initializer && routeTypeSignal(node)) {
        candidates.push(node.initializer);
      } else if (ts.isExportAssignment(node) && routeTypeSignal(node)) {
        candidates.push(node.expression);
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }
  return candidates;
}

function reachableSourceFiles(
  context: ProjectSourceProgram,
  project: AngularProjectContext,
  sourceFiles: ts.SourceFile[],
): { roots: ts.SourceFile[]; reachable: Set<string>; configured: boolean } {
  let roots = project.mainFiles
    .map((file) => getProjectSourceFile(context, file))
    .filter((file): file is ts.SourceFile => Boolean(file));
  const configured = roots.length > 0;
  if (roots.length === 0) {
    roots = sourceFiles.filter((sourceFile) =>
      /\bbootstrapApplication\s*\(|\.bootstrapModule\s*\(/u.test(sourceFile.text),
    );
  }
  const reachable = new Set<string>();
  const queue = [...roots];
  while (queue.length > 0) {
    const sourceFile = queue.shift();
    if (!sourceFile) continue;
    const file = sourceRelative(context, sourceFile);
    if (reachable.has(file)) continue;
    reachable.add(file);
    for (const imported of collectSourceImports(context, sourceFile)) {
      if (
        !imported.resolved.relativePath ||
        !['static-import', 're-export', 'require', 'import-equals'].includes(imported.kind)
      ) {
        continue;
      }
      const dependency = getProjectSourceFile(context, imported.resolved.relativePath);
      if (dependency) queue.push(dependency);
    }
  }
  return { roots, reachable, configured };
}

function rootRouteExpressions(sourceFiles: ts.SourceFile[]): ts.Expression[] {
  const roots: ts.Expression[] = [];
  for (const sourceFile of sourceFiles) {
    const visit = (node: ts.Node): void => {
      if (ts.isCallExpression(node) && node.arguments.length > 0) {
        const current = unwrapExpression(node.expression);
        const name = expressionName(current);
        const forRoot =
          ts.isPropertyAccessExpression(current) &&
          current.name.text === 'forRoot' &&
          expressionName(current.expression) === 'RouterModule';
        if (name === 'provideRouter' || forRoot) roots.push(node.arguments[0] as ts.Expression);
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }
  return roots;
}

function joinRoute(parent: string | null, child: string): string {
  if (child.startsWith('/')) return child.replace(/\/+$/u, '') || '/';
  if (!child) return parent || '/';
  const prefix = parent && parent !== '/' ? parent.replace(/\/+$/u, '') : '';
  return `${prefix}/${child}`.replace(/\/{2,}/gu, '/');
}

function sourceLine(node: ts.Node): number {
  return node.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line + 1;
}

function dynamicImportTarget(
  state: RouteParseState,
  expression: ts.Expression,
): { sourceFile: ts.SourceFile; exportName: string | null } | null {
  let importCall: ts.CallExpression | null = null;
  let exportName: string | null = null;
  const callbackParameters = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length > 0
    ) {
      importCall = node;
    }
    if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      for (const parameter of node.parameters) {
        if (ts.isIdentifier(parameter.name)) callbackParameters.add(parameter.name.text);
      }
    }
    if (
      ts.isPropertyAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      callbackParameters.has(node.expression.text)
    ) {
      exportName = node.name.text;
    }
    ts.forEachChild(node, visit);
  };
  visit(expression);
  if (!importCall) return null;
  const argument = (importCall as ts.CallExpression).arguments[0];
  if (!argument || !ts.isStringLiteralLike(unwrapExpression(argument as ts.Expression)))
    return null;
  const specifier = (unwrapExpression(argument as ts.Expression) as ts.StringLiteralLike).text;
  const resolved = resolveSourceImport(state.context, expression.getSourceFile(), specifier);
  const sourceFile = resolved.relativePath
    ? getProjectSourceFile(state.context, resolved.relativePath)
    : undefined;
  return sourceFile ? { sourceFile, exportName } : null;
}

function exportedRouteExpression(
  sourceFile: ts.SourceFile,
  exportName: string | null,
): ts.Expression | null {
  let fallback: ts.Expression | null = null;
  for (const statement of sourceFile.statements) {
    if (ts.isExportAssignment(statement)) {
      if (!exportName || exportName === 'default') return statement.expression;
      fallback ??= statement.expression;
    }
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!declaration.initializer || !ts.isIdentifier(declaration.name)) continue;
      if (declaration.name.text === exportName) return declaration.initializer;
      if (routeTypeSignal(declaration)) fallback ??= declaration.initializer;
    }
  }
  return fallback;
}

function forChildExpression(sourceFile: ts.SourceFile): ts.Expression | null {
  let result: ts.Expression | null = null;
  const visit = (node: ts.Node): void => {
    if (result || !ts.isCallExpression(node) || node.arguments.length === 0) {
      if (!result) ts.forEachChild(node, visit);
      return;
    }
    const current = unwrapExpression(node.expression);
    if (
      ts.isPropertyAccessExpression(current) &&
      current.name.text === 'forChild' &&
      expressionName(current.expression) === 'RouterModule'
    ) {
      result = node.arguments[0] as ts.Expression;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return result;
}

function implementationFileForExpression(
  state: RouteParseState,
  expression: ts.Expression | null,
): string | null {
  if (!expression) return null;
  const lazy = dynamicImportTarget(state, expression);
  if (lazy) return sourceRelative(state.context, lazy.sourceFile);
  const declaration = declarationForExpression(state, expression);
  return declaration ? sourceRelative(state.context, declaration.getSourceFile()) : null;
}

function resolveArrayExpression(
  state: RouteParseState,
  expression: ts.Expression,
): ts.ArrayLiteralExpression | null {
  const current = unwrapExpression(expression);
  if (ts.isArrayLiteralExpression(current)) return current;
  const declaration = declarationForExpression(state, current);
  if (!declaration) return null;
  const initializer = declarationInitializer(declaration);
  return initializer ? resolveArrayExpression(state, initializer) : null;
}

function parseLazyChildren(
  state: RouteParseState,
  expression: ts.Expression,
  parentPath: string | null,
): void {
  const target = dynamicImportTarget(state, expression);
  if (!target) {
    state.unresolved.add(
      `Lazy Angular route source could not be resolved at ${sourceRelative(state.context, expression.getSourceFile())}:${sourceLine(expression)}.`,
    );
    return;
  }
  state.authorityFiles.add(sourceRelative(state.context, target.sourceFile));
  const exported =
    exportedRouteExpression(target.sourceFile, target.exportName) ??
    forChildExpression(target.sourceFile);
  if (!exported) {
    state.unresolved.add(
      `Lazy Angular route array could not be resolved in ${sourceRelative(state.context, target.sourceFile)}.`,
    );
    return;
  }
  parseRouteExpression(state, exported, parentPath);
}

function parseRouteObject(
  state: RouteParseState,
  object: ts.ObjectLiteralExpression,
  parentPath: string | null,
): void {
  const pathExpression = propertyExpression(object, 'path');
  const matcherExpression = propertyExpression(object, 'matcher');
  const path = pathExpression ? resolveStaticString(state, pathExpression) : null;
  if (pathExpression && path === null) {
    state.unresolved.add(
      `Dynamic Angular route path could not be resolved at ${sourceRelative(state.context, object.getSourceFile())}:${sourceLine(object)}.`,
    );
  }
  if (matcherExpression) {
    state.unresolved.add(
      `Custom Angular UrlMatcher requires runtime corroboration at ${sourceRelative(state.context, object.getSourceFile())}:${sourceLine(object)}.`,
    );
  }
  const fullPath = path === null ? parentPath : joinRoute(parentPath, path);
  const component = propertyExpression(object, 'component');
  const loadComponent = propertyExpression(object, 'loadComponent');
  const loadChildren = propertyExpression(object, 'loadChildren');
  const redirect = propertyExpression(object, 'redirectTo');
  const children = propertyExpression(object, 'children');
  const routeFile = sourceRelative(state.context, object.getSourceFile());
  const loadComponentFile = implementationFileForExpression(state, loadComponent);
  const componentFile = implementationFileForExpression(state, component);
  const loadChildrenFile = implementationFileForExpression(state, loadChildren);
  if (loadComponent && !loadComponentFile) {
    state.unresolved.add(
      `Angular lazy component could not be resolved at ${routeFile}:${sourceLine(loadComponent)}.`,
    );
  }
  if (component && !componentFile) {
    state.unresolved.add(
      `Angular route component could not be resolved at ${routeFile}:${sourceLine(component)}.`,
    );
  }
  const implementationFile = loadComponentFile ?? componentFile ?? loadChildrenFile ?? routeFile;
  const pageImplementationResolved = Boolean(
    (loadComponent && loadComponentFile) || (component && componentFile),
  );

  if (path !== null && path !== '**') {
    state.signals.push({
      path: fullPath || '/',
      file: implementationFile,
      confidence: state.authority === 'proven' ? 'high' : 'low',
      taskable: state.authority === 'proven' && !redirect && pageImplementationResolved,
      evidence: `Angular ${state.authority === 'proven' ? 'bootstrap-reachable' : 'unrooted'} route declaration at ${routeFile}:${sourceLine(object)}`,
    });
  }

  if (children) parseRouteExpression(state, children, fullPath);
  if (loadChildren) parseLazyChildren(state, loadChildren, fullPath);
}

function parseRouteArray(
  state: RouteParseState,
  array: ts.ArrayLiteralExpression,
  parentPath: string | null,
): void {
  const key = nodeKey(array);
  if (state.visitedExpressions.has(`${key}:${parentPath ?? ''}`)) return;
  state.visitedExpressions.add(`${key}:${parentPath ?? ''}`);
  state.authorityFiles.add(sourceRelative(state.context, array.getSourceFile()));
  for (const element of array.elements) {
    if (ts.isSpreadElement(element)) {
      parseRouteExpression(state, element.expression, parentPath);
      continue;
    }
    const current = unwrapExpression(element as ts.Expression);
    if (ts.isObjectLiteralExpression(current)) {
      parseRouteObject(state, current, parentPath);
      continue;
    }
    const nested = resolveArrayExpression(state, current);
    if (nested) parseRouteArray(state, nested, parentPath);
    else {
      state.unresolved.add(
        `Angular route-array element could not be resolved at ${sourceRelative(state.context, current.getSourceFile())}:${sourceLine(current)}.`,
      );
    }
  }
}

function parseRouteExpression(
  state: RouteParseState,
  expression: ts.Expression,
  parentPath: string | null,
): void {
  const array = resolveArrayExpression(state, expression);
  if (array) {
    parseRouteArray(state, array, parentPath);
    return;
  }
  state.unresolved.add(
    `Angular route expression could not be resolved at ${sourceRelative(state.context, expression.getSourceFile())}:${sourceLine(expression)}.`,
  );
}

function componentDecorator(node: ts.ClassDeclaration): ts.Decorator | null {
  const decorators = ts.canHaveDecorators(node) ? ts.getDecorators(node) : undefined;
  return (
    decorators?.find((decorator) => {
      const expression = unwrapExpression(decorator.expression);
      return (
        ts.isCallExpression(expression) && expressionName(expression.expression) === 'Component'
      );
    }) ?? null
  );
}

function discoverAngularComponents(
  context: ProjectSourceProgram,
  sourceFiles: ts.SourceFile[],
): AngularComponentDiscovery {
  const items: AngularComponentCandidate[] = [];
  let inlineTemplateCount = 0;
  let externalTemplateCount = 0;
  for (const sourceFile of sourceFiles) {
    const visit = (node: ts.Node): void => {
      if (ts.isClassDeclaration(node) && node.name && componentDecorator(node)) {
        items.push({
          name: node.name.text,
          file: sourceRelative(context, sourceFile),
          confidence: 'high',
        });
        const decorator = componentDecorator(node);
        const call = decorator ? unwrapExpression(decorator.expression) : null;
        const metadata =
          call && ts.isCallExpression(call) && call.arguments.length > 0
            ? unwrapExpression(call.arguments[0] as ts.Expression)
            : null;
        if (metadata && ts.isObjectLiteralExpression(metadata)) {
          if (propertyExpression(metadata, 'templateUrl')) externalTemplateCount += 1;
          if (propertyExpression(metadata, 'template')) inlineTemplateCount += 1;
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }
  const deduped = [
    ...new Map(items.map((item) => [`${item.file}:${item.name}`, item])).values(),
  ].sort(
    (left, right) => left.file.localeCompare(right.file) || left.name.localeCompare(right.name),
  );
  return {
    items: deduped,
    evidence: [
      ...(deduped.length > 0 ? [`${deduped.length} Angular @Component class(es) found`] : []),
      ...(externalTemplateCount > 0
        ? [`${externalTemplateCount} Angular external-template component(s) found`]
        : []),
      ...(inlineTemplateCount > 0
        ? [`${inlineTemplateCount} Angular inline-template component(s) found`]
        : []),
    ],
    limitations:
      deduped.length > 0
        ? [
            'Angular component inventory is static and advisory; runtime-created components are not proven.',
          ]
        : ['No production Angular @Component declarations were found in the selected app source.'],
  };
}

function emptyAngularRouteDiscovery(project: AngularProjectContext): AngularRouteDiscovery {
  return {
    signals: [],
    authority: 'unresolved',
    completeness: 'unknown',
    authorityFiles: project.mainFiles,
    excludedSourceCount: 0,
    evidence: project.evidence,
    limitations: uniqueSorted([
      ...project.limitations,
      'Angular source-program construction failed; route authority is not proven.',
    ]),
  };
}

export function discoverAngularApplication(
  appRootInput: string,
  workspaceRootInput: string,
  project = discoverAngularProjectContext(appRootInput, workspaceRootInput),
): AngularApplicationDiscovery {
  const appRoot = resolve(appRootInput);
  if (!project.matched) {
    return {
      project,
      routes: emptyAngularRouteDiscovery(project),
      components: {
        items: [],
        evidence: [],
        limitations: ['Angular project metadata was not found.'],
      },
    };
  }

  let context: ProjectSourceProgram;
  try {
    context = createProjectSourceProgram(appRoot, {
      includeTests: false,
      includeFixtures: false,
      tsconfigPath: project.tsconfigPath,
    });
  } catch {
    return {
      project,
      routes: emptyAngularRouteDiscovery(project),
      components: { items: [], evidence: [], limitations: ['Angular source inventory failed.'] },
    };
  }
  const inventoryPaths = new Set(context.inventory.files.map((file) => file.relativePath));
  const sourceFiles = context.program
    .getSourceFiles()
    .filter((sourceFile) => inventoryPaths.has(sourceRelative(context, sourceFile)));
  const reachable = reachableSourceFiles(context, project, sourceFiles);
  const reachableFiles = sourceFiles.filter((sourceFile) =>
    reachable.reachable.has(sourceRelative(context, sourceFile)),
  );
  const rootedExpressions = rootRouteExpressions(reachableFiles);
  const inferredRootExpressions =
    rootedExpressions.length === 0 ? rootRouteExpressions(sourceFiles) : [];
  const typedCandidates =
    rootedExpressions.length === 0 && inferredRootExpressions.length === 0
      ? routeArrayCandidates(sourceFiles)
      : [];
  const authority: AngularRouteAuthority =
    rootedExpressions.length > 0 && reachable.roots.length > 0
      ? 'proven'
      : inferredRootExpressions.length > 0 || typedCandidates.length > 0
        ? 'inferred'
        : 'unresolved';
  const roots =
    rootedExpressions.length > 0
      ? rootedExpressions
      : inferredRootExpressions.length > 0
        ? inferredRootExpressions
        : typedCandidates;
  const state: RouteParseState = {
    authority,
    authorityFiles: new Set([
      ...reachable.roots.map((file) => sourceRelative(context, file)),
      ...roots.map((expression) => sourceRelative(context, expression.getSourceFile())),
    ]),
    checker: context.program.getTypeChecker(),
    context,
    signals: [],
    unresolved: new Set(),
    visitedExpressions: new Set(),
  };
  for (const root of roots) parseRouteExpression(state, root, null);
  const completeness: AngularRouteCompleteness =
    authority === 'proven' ? (state.unresolved.size === 0 ? 'complete' : 'partial') : 'unknown';
  const confidence: AngularRouteSignal['confidence'] =
    authority === 'proven' && completeness === 'complete'
      ? 'high'
      : authority === 'proven'
        ? 'medium'
        : 'low';
  const taskable = authority === 'proven';
  const signals = state.signals.map((signal) => ({
    ...signal,
    confidence,
    taskable: taskable && signal.taskable,
  }));
  const excludedSourceCount = context.inventory.skipped.filter(
    (entry) => entry.reason === 'ignored-file' || entry.reason === 'ignored-directory',
  ).length;
  const evidence = uniqueSorted([
    ...project.evidence,
    ...(authority === 'proven'
      ? [
          `Angular router root is reachable from ${reachable.roots.map((file) => sourceRelative(context, file)).join(', ')}`,
        ]
      : []),
    ...(excludedSourceCount > 0
      ? [`${excludedSourceCount} test, mock, fixture, or generated source path(s) excluded`]
      : []),
  ]);
  const limitations = uniqueSorted([
    ...project.limitations,
    ...state.unresolved,
    ...(authority === 'inferred'
      ? [
          'Angular route arrays were found, but no selected-app bootstrap path proved that they are production router authority.',
        ]
      : []),
    ...(authority === 'unresolved'
      ? [
          'No bootstrap-reachable provideRouter or RouterModule.forRoot declaration was resolved; route-scoped governance is not proven.',
        ]
      : []),
    ...(completeness === 'partial'
      ? [
          'Angular route authority is production-reachable, but one or more dynamic route expressions remain unresolved.',
        ]
      : []),
  ]);

  return {
    project,
    routes: {
      signals,
      authority,
      completeness,
      authorityFiles: uniqueSorted(state.authorityFiles),
      excludedSourceCount,
      evidence,
      limitations,
    },
    components: discoverAngularComponents(context, sourceFiles),
  };
}
