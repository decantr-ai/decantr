import * as ts from 'typescript';
import { normalizeSourcePath } from './inventory.js';

export type SourceStringLiteralContext =
  | 'import-specifier'
  | 'export-specifier'
  | 'require-specifier'
  | 'dynamic-import-specifier'
  | 'jsx-attribute'
  | 'property-name'
  | 'string-literal'
  | 'template-literal';

export interface SourceLocation {
  file: string;
  line: number;
  column: number;
}

export interface SourceStringLiteral {
  value: string;
  rawText: string;
  context: SourceStringLiteralContext;
  location: SourceLocation;
  attributeName?: string;
}

export interface ExtractSourceStringLiteralOptions {
  includeImportSpecifiers?: boolean;
  includeObjectPropertyNames?: boolean;
}

export function sourceLocationForNode(sourceFile: ts.SourceFile, node: ts.Node): SourceLocation {
  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return {
    file: normalizeSourcePath(sourceFile.fileName),
    line: position.line + 1,
    column: position.character + 1,
  };
}

function literalRawText(node: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral): string {
  return node.getText();
}

function isStringLiteralLike(
  node: ts.Node,
): node is ts.StringLiteral | ts.NoSubstitutionTemplateLiteral {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node);
}

function isImportSpecifierLiteral(node: ts.Node): boolean {
  const parent = node.parent;
  return (
    (ts.isImportDeclaration(parent) && parent.moduleSpecifier === node) ||
    (ts.isExternalModuleReference(parent) && parent.expression === node)
  );
}

function isExportSpecifierLiteral(node: ts.Node): boolean {
  const parent = node.parent;
  return ts.isExportDeclaration(parent) && parent.moduleSpecifier === node;
}

function requireOrDynamicImportContext(node: ts.Node): SourceStringLiteralContext | null {
  const parent = node.parent;
  if (!ts.isCallExpression(parent) || parent.arguments[0] !== node) return null;
  if (parent.expression.kind === ts.SyntaxKind.ImportKeyword) return 'dynamic-import-specifier';
  if (ts.isIdentifier(parent.expression) && parent.expression.text === 'require') {
    return 'require-specifier';
  }
  return null;
}

function propertyNameContext(node: ts.Node): SourceStringLiteralContext | null {
  const parent = node.parent;
  if (
    (ts.isPropertyAssignment(parent) ||
      ts.isPropertyDeclaration(parent) ||
      ts.isMethodDeclaration(parent) ||
      ts.isGetAccessorDeclaration(parent) ||
      ts.isSetAccessorDeclaration(parent)) &&
    parent.name === node
  ) {
    return 'property-name';
  }
  return null;
}

function jsxAttributeContext(
  node: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral,
): { context: SourceStringLiteralContext; attributeName?: string } | null {
  const parent = node.parent;
  if (!ts.isJsxAttribute(parent) || parent.initializer !== node) return null;
  return {
    context: 'jsx-attribute',
    attributeName: parent.name.getText(),
  };
}

function literalContext(node: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral): {
  context: SourceStringLiteralContext;
  attributeName?: string;
} {
  const jsxContext = jsxAttributeContext(node);
  if (jsxContext) return jsxContext;

  const importLikeContext = requireOrDynamicImportContext(node);
  if (importLikeContext) return { context: importLikeContext };

  if (isImportSpecifierLiteral(node)) return { context: 'import-specifier' };
  if (isExportSpecifierLiteral(node)) return { context: 'export-specifier' };

  const propertyContext = propertyNameContext(node);
  if (propertyContext) return { context: propertyContext };

  return {
    context: ts.isNoSubstitutionTemplateLiteral(node) ? 'template-literal' : 'string-literal',
  };
}

export function extractSourceStringLiterals(
  sourceFile: ts.SourceFile,
  options: ExtractSourceStringLiteralOptions = {},
): SourceStringLiteral[] {
  const includeImportSpecifiers = options.includeImportSpecifiers ?? true;
  const includeObjectPropertyNames = options.includeObjectPropertyNames ?? true;
  const literals: SourceStringLiteral[] = [];

  const visit = (node: ts.Node): void => {
    if (isStringLiteralLike(node)) {
      const context = literalContext(node);
      const isImportLike =
        context.context === 'import-specifier' ||
        context.context === 'export-specifier' ||
        context.context === 'require-specifier' ||
        context.context === 'dynamic-import-specifier';
      if (
        (includeImportSpecifiers || !isImportLike) &&
        (includeObjectPropertyNames || context.context !== 'property-name')
      ) {
        literals.push({
          value: node.text,
          rawText: literalRawText(node),
          context: context.context,
          location: sourceLocationForNode(sourceFile, node),
          ...(context.attributeName ? { attributeName: context.attributeName } : {}),
        });
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return literals;
}
