import { existsSync } from 'node:fs';
import { join } from 'node:path';
import * as ts from 'typescript';
import {
  collectSourceImports,
  createProjectSourceProgram,
  getProjectSourceFile,
} from '../source/program.js';
import { isProductionAuthorityPath } from '../source/scope.js';

interface NextRouteSignal {
  path: string;
  taskable: boolean;
  evidence: string;
}

interface DeploymentPattern {
  kind: 'exact' | 'prefix';
  path: string;
  file: string;
}

export interface NextRoutePolicyResult<TSignal extends NextRouteSignal> {
  signals: TSignal[];
  authorityFiles: string[];
  evidence: string[];
  limitations: string[];
  unresolved: boolean;
  conditionedRouteCount: number;
}

const NEXT_POLICY_FILES = [
  'middleware.ts',
  'middleware.tsx',
  'middleware.js',
  'middleware.jsx',
  'middleware.mjs',
  'middleware.cjs',
  'src/middleware.ts',
  'src/middleware.tsx',
  'src/middleware.js',
  'src/middleware.jsx',
  'proxy.ts',
  'proxy.tsx',
  'proxy.js',
  'proxy.jsx',
  'src/proxy.ts',
  'src/proxy.tsx',
  'src/proxy.js',
  'src/proxy.jsx',
];

const PATH_NAME_RE = /^(?:current)?(?:path|pathname|route|url)$/iu;

export function applyNextRoutePolicy<TSignal extends NextRouteSignal>(
  projectRoot: string,
  inputSignals: TSignal[],
): NextRoutePolicyResult<TSignal> {
  const middlewareFiles = NEXT_POLICY_FILES.filter((file) => existsSync(join(projectRoot, file)));
  if (middlewareFiles.length === 0) return emptyResult(inputSignals);

  const context = createProjectSourceProgram(projectRoot, {
    includeTests: false,
    includeFixtures: false,
    maxFiles: 8000,
  });
  const reachable = collectReachablePolicyFiles(context, middlewareFiles);
  const denyFiles = reachable.filter((file) => {
    const sourceFile = getProjectSourceFile(context, file);
    return sourceFile ? containsNonSuccessResponse(sourceFile) : false;
  });
  if (denyFiles.length === 0) return emptyResult(inputSignals);

  const patterns = dedupePatterns(
    reachable.flatMap((file) => {
      const sourceFile = getProjectSourceFile(context, file);
      return sourceFile ? collectDeploymentPatterns(sourceFile, file) : [];
    }),
  );
  const hasPathPolicy = reachable.some((file) => {
    const sourceFile = getProjectSourceFile(context, file);
    return sourceFile ? containsPathReference(sourceFile) : false;
  });
  const authorityFiles = [
    ...new Set([...middlewareFiles, ...denyFiles, ...patterns.map((pattern) => pattern.file)]),
  ];

  if (hasPathPolicy && patterns.length === 0) {
    return {
      signals: inputSignals,
      authorityFiles,
      evidence: [
        `${middlewareFiles.join(', ')} can return a non-success response based on request-path policy.`,
      ],
      limitations: [
        'Next deployment middleware controls route reachability, but the affected route set could not be resolved statically.',
      ],
      unresolved: true,
      conditionedRouteCount: 0,
    };
  }

  const conditioned = new Set<string>();
  const signals = inputSignals.map((signal) => {
    const matches = patterns.filter((pattern) => routeMatchesPattern(signal.path, pattern));
    if (matches.length === 0) return signal;
    conditioned.add(`${signal.path}:${signal.evidence}`);
    const policyFiles = [...new Set(matches.map((pattern) => pattern.file))];
    return {
      ...signal,
      taskable: false,
      evidence: `${signal.evidence}; deployment-conditioned by ${policyFiles.join(', ')}`,
    };
  });

  const conditionedRouteCount = conditioned.size;
  return {
    signals,
    authorityFiles,
    evidence: [
      `${middlewareFiles.join(', ')} was evaluated as Next deployment reachability authority.`,
      ...(conditionedRouteCount > 0
        ? [
            `${conditionedRouteCount} declared UI route(s) are deployment-conditioned by a non-success response policy.`,
          ]
        : []),
    ],
    limitations:
      conditionedRouteCount > 0
        ? [
            `${conditionedRouteCount} deployment-conditioned route signal(s) remain discoverable but are blocked for task context.`,
          ]
        : [],
    unresolved: false,
    conditionedRouteCount,
  };
}

function emptyResult<TSignal extends NextRouteSignal>(
  signals: TSignal[],
): NextRoutePolicyResult<TSignal> {
  return {
    signals,
    authorityFiles: [],
    evidence: [],
    limitations: [],
    unresolved: false,
    conditionedRouteCount: 0,
  };
}

function collectReachablePolicyFiles(
  context: ReturnType<typeof createProjectSourceProgram>,
  entryFiles: string[],
): string[] {
  const reachable = new Set(entryFiles);
  const queue = [...entryFiles];
  while (queue.length > 0) {
    const file = queue.shift();
    if (!file) continue;
    for (const reference of collectSourceImports(context, file)) {
      const imported = reference.resolved.relativePath;
      if (!imported || reachable.has(imported) || !isProductionAuthorityPath(imported)) continue;
      reachable.add(imported);
      queue.push(imported);
    }
  }
  return [...reachable];
}

function containsNonSuccessResponse(sourceFile: ts.SourceFile): boolean {
  let found = false;
  const visit = (node: ts.Node): void => {
    if (found) return;
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      ['notFound', 'unauthorized', 'forbidden'].includes(node.expression.text)
    ) {
      found = true;
      return;
    }
    if (
      ts.isPropertyAssignment(node) &&
      propertyName(node.name) === 'status' &&
      ts.isNumericLiteral(node.initializer)
    ) {
      const status = Number(node.initializer.text);
      if (status >= 400 && status < 500) {
        found = true;
        return;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

function containsPathReference(sourceFile: ts.SourceFile): boolean {
  let found = false;
  const visit = (node: ts.Node): void => {
    if (found) return;
    if (
      (ts.isIdentifier(node) && PATH_NAME_RE.test(node.text)) ||
      (ts.isPropertyAccessExpression(node) && ['pathname', 'url'].includes(node.name.text))
    ) {
      found = true;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

function collectDeploymentPatterns(sourceFile: ts.SourceFile, file: string): DeploymentPattern[] {
  const arrays = collectPathArrays(sourceFile);
  const pathNames = collectPathNames(sourceFile);
  const patterns: DeploymentPattern[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isBinaryExpression(node) && isEqualityOperator(node.operatorToken.kind)) {
      const left = routeString(node.left);
      const right = routeString(node.right);
      if (left && isPathExpression(node.right, pathNames)) {
        patterns.push({ kind: 'exact', path: normalizePolicyPath(left), file });
      }
      if (right && isPathExpression(node.left, pathNames)) {
        patterns.push({ kind: 'exact', path: normalizePolicyPath(right), file });
      }
    }

    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'startsWith' &&
      isPathExpression(node.expression.expression, pathNames)
    ) {
      const value = node.arguments[0] ? routeString(node.arguments[0]) : null;
      if (value) patterns.push({ kind: 'prefix', path: normalizePolicyPath(value), file });
    }

    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'some' &&
      ts.isIdentifier(node.expression.expression)
    ) {
      const values = arrays.get(node.expression.expression.text);
      const callback = node.arguments[0];
      if (
        values &&
        callback &&
        (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))
      ) {
        const parameter = callback.parameters[0]?.name;
        if (parameter && ts.isIdentifier(parameter)) {
          const callbackText = callback.body.getText(sourceFile);
          const usesPath = [...pathNames].some((name) =>
            new RegExp(`\\b${escapeRegExp(name)}\\b`, 'u').test(callbackText),
          );
          const usesParameter = new RegExp(`\\b${escapeRegExp(parameter.text)}\\b`, 'u').test(
            callbackText,
          );
          if (usesPath && usesParameter) {
            const kind = callbackText.includes('startsWith') ? 'prefix' : 'exact';
            for (const value of values) {
              patterns.push({ kind, path: normalizePolicyPath(value), file });
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return patterns.filter((pattern) => pattern.path.startsWith('/'));
}

function collectPathArrays(sourceFile: ts.SourceFile): Map<string, string[]> {
  const arrays = new Map<string, string[]>();
  const visit = (node: ts.Node): void => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      const values = node.initializer.elements
        .map((element) => routeString(element))
        .filter((value): value is string => Boolean(value?.startsWith('/')));
      if (values.length > 0) arrays.set(node.name.text, values);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return arrays;
}

function collectPathNames(sourceFile: ts.SourceFile): Set<string> {
  const names = new Set<string>(['path', 'pathname', 'route', 'url']);
  const visit = (node: ts.Node): void => {
    if (ts.isParameter(node) && ts.isIdentifier(node.name) && PATH_NAME_RE.test(node.name.text)) {
      names.add(node.name.text);
    }
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      (PATH_NAME_RE.test(node.name.text) ||
        node.initializer.getText(sourceFile).includes('.pathname'))
    ) {
      names.add(node.name.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return names;
}

function isPathExpression(node: ts.Node, pathNames: Set<string>): boolean {
  if (ts.isIdentifier(node)) return pathNames.has(node.text) || PATH_NAME_RE.test(node.text);
  if (ts.isPropertyAccessExpression(node)) {
    return (
      ['pathname', 'url'].includes(node.name.text) || isPathExpression(node.expression, pathNames)
    );
  }
  return false;
}

function routeString(node: ts.Node): string | null {
  if (ts.isStringLiteralLike(node)) return node.text.startsWith('/') ? node.text : null;
  if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text.startsWith('/') ? node.text : null;
  return null;
}

function propertyName(node: ts.PropertyName): string | null {
  if (ts.isIdentifier(node) || ts.isStringLiteralLike(node) || ts.isNumericLiteral(node)) {
    return node.text;
  }
  return null;
}

function isEqualityOperator(kind: ts.SyntaxKind): boolean {
  return [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken].includes(kind);
}

function normalizePolicyPath(path: string): string {
  if (path === '/') return path;
  return path.replace(/\/+$/u, '') || '/';
}

function routeMatchesPattern(route: string, pattern: DeploymentPattern): boolean {
  if (pattern.kind === 'exact') return route === pattern.path;
  return route === pattern.path || route.startsWith(`${pattern.path}/`);
}

function dedupePatterns(patterns: DeploymentPattern[]): DeploymentPattern[] {
  const byKey = new Map<string, DeploymentPattern>();
  for (const pattern of patterns) byKey.set(`${pattern.kind}:${pattern.path}`, pattern);
  return [...byKey.values()];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}
