import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import * as ts from 'typescript';

export const STYLE_BRIDGE_ARBITRARY_VALUE_RULE_ID = 'style-bridge-arbitrary-value';

export interface StyleBridgeDriftFinding {
  id: string;
  file: string;
  line: number;
  className: string;
  value: string;
  source: 'className' | 'inline-style' | 'stylesheet';
  property?: string;
  bridgeMappingIds: string[];
  tokenHints: string[];
  classHints: string[];
  evidence: string[];
}

export interface StyleBridgeDriftAudit {
  filesChecked: number;
  bridgeMappingCount: number;
  arbitraryValueCount: number;
  findings: StyleBridgeDriftFinding[];
}

interface StyleBridgeMapping {
  id?: unknown;
  label?: unknown;
  tokenHints?: unknown;
  classHints?: unknown;
}

interface StyleBridgeManifest {
  status?: unknown;
  mappings?: unknown;
}

interface AcceptedStyleBridge {
  mappingIds: string[];
  tokenHints: string[];
  classHints: string[];
}

const CLASS_HELPER_NAMES = new Set(['cn', 'clsx', 'classnames', 'cva', 'tv']);
const INLINE_STYLE_PROPERTIES = new Set([
  'accentColor',
  'background',
  'backgroundColor',
  'border',
  'borderColor',
  'boxShadow',
  'caretColor',
  'color',
  'fill',
  'outline',
  'outlineColor',
  'stroke',
  'textDecorationColor',
]);
const STYLESHEET_EXTENSIONS = /\.(?:css|scss|sass|less)$/i;
const SCRIPT_EXTENSIONS = /\.[cm]?[jt]sx?$/i;
const STYLESHEET_VISUAL_PROPERTIES = new Set([
  'accent-color',
  'background',
  'background-color',
  'border',
  'border-color',
  'box-shadow',
  'caret-color',
  'color',
  'fill',
  'outline',
  'outline-color',
  'stroke',
  'text-decoration-color',
]);

function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
    : [];
}

function isNonProductionStyleBridgeDriftFile(file: string): boolean {
  const normalized = normalizePath(file);
  return (
    /(?:^|\/)(?:__tests__|__mocks__|tests?|specs?|fixtures?|mocks?|stories?)(?:\/|$)/i.test(
      normalized,
    ) ||
    /\.(?:test|spec|stories|story|fixture|mock)\.(?:[cm]?[jt]sx?|css|scss|sass|less)$/i.test(
      normalized,
    )
  );
}

function collectProjectStyleFiles(projectRoot: string): string[] {
  const candidates = ['src', 'app', 'pages', 'components', 'styles']
    .map((dir) => join(projectRoot, dir))
    .filter((dir) => existsSync(dir));
  const ignoredDirNames = new Set([
    'node_modules',
    '.git',
    '.decantr',
    'dist',
    'build',
    'coverage',
  ]);
  const files = new Set<string>();

  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (ignoredDirNames.has(entry.name)) continue;
      const absolutePath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(absolutePath);
        continue;
      }
      if (!entry.isFile() || !STYLESHEET_EXTENSIONS.test(absolutePath)) continue;
      files.add(absolutePath);
    }
  };

  for (const candidate of candidates) {
    walk(candidate);
  }

  return [...files].sort();
}

function readAcceptedStyleBridge(projectRoot: string): AcceptedStyleBridge | null {
  const path = join(projectRoot, '.decantr', 'style-bridge.json');
  if (!existsSync(path)) return null;

  let bridge: StyleBridgeManifest;
  try {
    bridge = JSON.parse(readFileSync(path, 'utf-8')) as StyleBridgeManifest;
  } catch {
    return null;
  }
  if (bridge.status !== 'accepted' || !Array.isArray(bridge.mappings)) return null;

  const mappings = bridge.mappings.filter(
    (mapping): mapping is StyleBridgeMapping =>
      Boolean(mapping) && typeof mapping === 'object',
  );
  if (mappings.length === 0) return null;

  const mappingIds = mappings
    .map((mapping, index) =>
      typeof mapping.id === 'string' && mapping.id.length > 0
        ? mapping.id
        : typeof mapping.label === 'string' && mapping.label.length > 0
          ? mapping.label
          : `mapping-${index + 1}`,
    )
    .slice(0, 12);
  const tokenHints = [
    ...new Set(mappings.flatMap((mapping) => stringArray(mapping.tokenHints))),
  ].slice(0, 16);
  const classHints = [
    ...new Set(mappings.flatMap((mapping) => stringArray(mapping.classHints))),
  ].slice(0, 16);

  return { mappingIds, tokenHints, classHints };
}

function lineForNode(sourceFile: ts.SourceFile, node: ts.Node): number {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

function jsxAttributeName(name: ts.JsxAttributeName): string | null {
  if (ts.isIdentifier(name)) return name.text;
  if (ts.isJsxNamespacedName(name)) return `${name.namespace.text}:${name.name.text}`;
  return null;
}

function jsxAttributeText(attribute: ts.JsxAttribute): string | null {
  const initializer = attribute.initializer;
  if (!initializer) return '';
  if (ts.isStringLiteral(initializer)) return initializer.text;
  if (!ts.isJsxExpression(initializer) || !initializer.expression) return null;
  const expression = initializer.expression;
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
    return expression.text;
  }
  if (ts.isTemplateExpression(expression)) {
    return [
      expression.head.text,
      ...expression.templateSpans.map((span) => span.literal.text),
    ].join(' ');
  }
  return null;
}

function classHelperName(expression: ts.Expression): string | null {
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression)) return expression.name.text;
  return null;
}

function isClassHelperCall(node: ts.CallExpression): boolean {
  const helperName = classHelperName(node.expression);
  return Boolean(helperName && CLASS_HELPER_NAMES.has(helperName));
}

function templateExpressionText(expression: ts.TemplateExpression): string {
  return [
    expression.head.text,
    ...expression.templateSpans.map((span) => span.literal.text),
  ].join(' ');
}

function collectClassTextsFromNode(node: ts.Node): Array<{ className: string; node: ts.Node }> {
  const entries: Array<{ className: string; node: ts.Node }> = [];
  const visit = (child: ts.Node): void => {
    if (ts.isStringLiteral(child) || ts.isNoSubstitutionTemplateLiteral(child)) {
      entries.push({ className: child.text, node: child });
      return;
    }
    if (ts.isTemplateExpression(child)) {
      entries.push({ className: templateExpressionText(child), node: child });
      return;
    }
    ts.forEachChild(child, visit);
  };
  ts.forEachChild(node, visit);
  return entries;
}

function stripTailwindVariants(className: string): string {
  let bracketDepth = 0;
  let segmentStart = 0;
  for (let index = 0; index < className.length; index += 1) {
    const char = className[index];
    if (char === '[') bracketDepth += 1;
    if (char === ']') bracketDepth = Math.max(0, bracketDepth - 1);
    if (char === ':' && bracketDepth === 0) segmentStart = index + 1;
  }
  return className.slice(segmentStart);
}

function arbitraryStyleClasses(className: string): string[] {
  const classes = className.split(/\s+/).map((entry) => entry.trim()).filter(Boolean);
  return classes.filter((entry) => {
    const classWithoutVariant = stripTailwindVariants(entry);
    return (
      /^(?:-)?(?:bg|text|border|ring|shadow|from|via|to|fill|stroke|outline|decoration|accent|caret|placeholder|divide)-\[[^\]]+\]$/i.test(
        classWithoutVariant,
      ) ||
      /^\[(?:color|background|background-color|border|border-color|box-shadow|outline|fill|stroke|--[A-Za-z0-9_-]+):[^\]]+\]$/i.test(
        classWithoutVariant,
      )
    );
  });
}

function propertyName(name: ts.PropertyName): string | null {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  return null;
}

function styleLiteralValue(expression: ts.Expression): string | null {
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
    return expression.text;
  }
  if (ts.isTemplateExpression(expression)) {
    return expression.templateSpans.length === 0 ? expression.head.text : null;
  }
  return null;
}

function isAcceptedTokenValue(value: string, tokenHints: string[]): boolean {
  return tokenHints.some((hint) => {
    const normalizedHint = hint.trim();
    if (!normalizedHint) return false;
    return value.includes(normalizedHint) || value.includes(`var(${normalizedHint})`);
  });
}

function arbitraryInlineStyleValue(
  property: string,
  value: string,
  tokenHints: string[],
): string | null {
  const normalizedProperty = property.trim();
  const normalizedValue = value.trim();
  if (!normalizedProperty || !normalizedValue) return null;
  const isVisualProperty =
    INLINE_STYLE_PROPERTIES.has(normalizedProperty) ||
    STYLESHEET_VISUAL_PROPERTIES.has(normalizedProperty) ||
    normalizedProperty.startsWith('--');
  if (!isVisualProperty) return null;
  if (isAcceptedTokenValue(normalizedValue, tokenHints)) return null;
  if (
    /(?:^|[\s,(])#[0-9a-f]{3,8}\b|(?:rgba?|hsla?|oklch|oklab|lch|lab|color-mix)\(/i.test(
      normalizedValue,
    ) ||
    /var\(--[A-Za-z0-9_-]+\)/i.test(normalizedValue)
  ) {
    return `${normalizedProperty}: ${normalizedValue}`;
  }
  return null;
}

function styleBridgeEvidenceText(
  file: string,
  line: number,
  source: StyleBridgeDriftFinding['source'],
  value: string,
): string {
  if (source === 'inline-style') {
    return `${file}:${line} uses inline style value "${value}"`;
  }
  if (source === 'stylesheet') {
    return `${file}:${line} uses stylesheet value "${value}"`;
  }
  return `${file}:${line} uses arbitrary Tailwind value "${value}"`;
}

function collectStyleBridgeDriftFindings(input: {
  projectRoot: string;
  absolutePath: string;
  bridge: AcceptedStyleBridge;
}): StyleBridgeDriftFinding[] {
  const file = normalizePath(relative(input.projectRoot, input.absolutePath) || input.absolutePath);
  if (isNonProductionStyleBridgeDriftFile(file)) return [];
  if (!SCRIPT_EXTENSIONS.test(file)) return [];

  let code = '';
  try {
    code = readFileSync(input.absolutePath, 'utf-8');
  } catch {
    return [];
  }

  const sourceFile = ts.createSourceFile(
    file,
    code,
    ts.ScriptTarget.Latest,
    true,
    /\.[cm]?[jt]sx$/i.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const findings: StyleBridgeDriftFinding[] = [];
  const seen = new Set<string>();

  const addFinding = (
    node: ts.Node,
    className: string,
    value: string,
    source: StyleBridgeDriftFinding['source'],
    property?: string,
  ): void => {
    const line = lineForNode(sourceFile, node);
    const key = `${file}:${line}:${value}`;
    if (seen.has(key)) return;
    seen.add(key);
    findings.push({
      id: `${STYLE_BRIDGE_ARBITRARY_VALUE_RULE_ID}:${file}:${line}:${value}`,
      file,
      line,
      className,
      value,
      source,
      ...(property ? { property } : {}),
      bridgeMappingIds: input.bridge.mappingIds,
      tokenHints: input.bridge.tokenHints,
      classHints: input.bridge.classHints,
      evidence: [
        styleBridgeEvidenceText(file, line, source, value),
        `.decantr/style-bridge.json is accepted with mappings: ${input.bridge.mappingIds.join(', ')}`,
        input.bridge.tokenHints.length > 0
          ? `Accepted token hints: ${input.bridge.tokenHints.join(', ')}`
          : 'Accepted style bridge has no token hints for this mapping set',
        input.bridge.classHints.length > 0
          ? `Accepted class hints: ${input.bridge.classHints.join(', ')}`
          : 'Accepted style bridge has no class hints for this mapping set',
      ],
    });
  };

  const visit = (node: ts.Node): void => {
    if (ts.isJsxAttribute(node) && jsxAttributeName(node.name) === 'className') {
      const className = jsxAttributeText(node);
      if (className) {
        for (const value of arbitraryStyleClasses(className)) {
          addFinding(node, className, value, 'className');
        }
      }
    }
    if (ts.isJsxAttribute(node) && jsxAttributeName(node.name) === 'style') {
      const initializer = node.initializer;
      const expression =
        initializer && ts.isJsxExpression(initializer) ? initializer.expression : undefined;
      if (expression && ts.isObjectLiteralExpression(expression)) {
        for (const property of expression.properties) {
          if (!ts.isPropertyAssignment(property)) continue;
          const name = propertyName(property.name);
          const literal = styleLiteralValue(property.initializer);
          if (!name || literal === null) continue;
          const value = arbitraryInlineStyleValue(name, literal, input.bridge.tokenHints);
          if (value) {
            addFinding(property, `style.${name}`, value, 'inline-style', name);
          }
        }
      }
    }
    if (ts.isCallExpression(node) && isClassHelperCall(node)) {
      for (const entry of collectClassTextsFromNode(node)) {
        for (const value of arbitraryStyleClasses(entry.className)) {
          addFinding(entry.node, entry.className, value, 'className');
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  ts.forEachChild(sourceFile, visit);
  return findings;
}

function collectStylesheetBridgeDriftFindings(input: {
  projectRoot: string;
  absolutePath: string;
  bridge: AcceptedStyleBridge;
}): StyleBridgeDriftFinding[] {
  const file = normalizePath(relative(input.projectRoot, input.absolutePath) || input.absolutePath);
  if (isNonProductionStyleBridgeDriftFile(file) || !STYLESHEET_EXTENSIONS.test(file)) return [];

  let code = '';
  try {
    code = readFileSync(input.absolutePath, 'utf-8');
  } catch {
    return [];
  }

  const findings: StyleBridgeDriftFinding[] = [];
  const seen = new Set<string>();
  const lines = code.split(/\r?\n/);
  const declarationPattern =
    /(^|[;{\s])(?<property>accent-color|background|background-color|border|border-color|box-shadow|caret-color|color|fill|outline|outline-color|stroke|text-decoration-color)\s*:\s*(?<value>[^;{}]+)\s*;?/gi;

  for (const [lineIndex, line] of lines.entries()) {
    if (/^\s*(?:\/\*|\*|\/\/)/.test(line)) continue;
    for (const match of line.matchAll(declarationPattern)) {
      const property = match.groups?.property;
      const rawValue = match.groups?.value;
      if (!property || !rawValue) continue;
      const value = arbitraryInlineStyleValue(property, rawValue, input.bridge.tokenHints);
      if (!value) continue;
      const lineNumber = lineIndex + 1;
      const key = `${file}:${lineNumber}:${value}`;
      if (seen.has(key)) continue;
      seen.add(key);
      findings.push({
        id: `${STYLE_BRIDGE_ARBITRARY_VALUE_RULE_ID}:${file}:${lineNumber}:${value}`,
        file,
        line: lineNumber,
        className: property,
        value,
        source: 'stylesheet',
        property,
        bridgeMappingIds: input.bridge.mappingIds,
        tokenHints: input.bridge.tokenHints,
        classHints: input.bridge.classHints,
        evidence: [
          `${file}:${lineNumber} uses stylesheet value "${value}"`,
          `.decantr/style-bridge.json is accepted with mappings: ${input.bridge.mappingIds.join(', ')}`,
          input.bridge.tokenHints.length > 0
            ? `Accepted token hints: ${input.bridge.tokenHints.join(', ')}`
            : 'Accepted style bridge has no token hints for this mapping set',
          input.bridge.classHints.length > 0
            ? `Accepted class hints: ${input.bridge.classHints.join(', ')}`
            : 'Accepted style bridge has no class hints for this mapping set',
        ],
      });
    }
  }

  return findings;
}

export function auditStyleBridgeDrift(
  projectRoot: string,
  sourceFiles: string[],
): StyleBridgeDriftAudit {
  const bridge = readAcceptedStyleBridge(projectRoot);
  if (!bridge) {
    return {
      filesChecked: 0,
      bridgeMappingCount: 0,
      arbitraryValueCount: 0,
      findings: [],
    };
  }

  const filesToCheck = [
    ...new Set([...sourceFiles, ...collectProjectStyleFiles(projectRoot)]),
  ].sort();
  const findings = filesToCheck.flatMap((absolutePath) =>
    SCRIPT_EXTENSIONS.test(absolutePath)
      ? collectStyleBridgeDriftFindings({ projectRoot, absolutePath, bridge })
      : collectStylesheetBridgeDriftFindings({ projectRoot, absolutePath, bridge }),
  );

  return {
    filesChecked: filesToCheck.filter(
      (file) =>
        !isNonProductionStyleBridgeDriftFile(
          normalizePath(relative(projectRoot, file) || file),
        ),
    ).length,
    bridgeMappingCount: bridge.mappingIds.length,
    arbitraryValueCount: findings.length,
    findings,
  };
}
