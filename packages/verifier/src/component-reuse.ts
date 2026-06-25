import { readFileSync } from 'node:fs';
import { basename, extname, relative } from 'node:path';
import * as ts from 'typescript';

export const COMPONENT_REUSE_RULE_ID = 'component-reuse-primitive-reimplemented';
export const RAW_CONTROL_REUSE_RULE_ID = 'component-reuse-raw-control';

const PRIMITIVE_COMPONENT_NAMES = new Set([
  'Accordion',
  'Alert',
  'Avatar',
  'Badge',
  'Breadcrumb',
  'Button',
  'Calendar',
  'Card',
  'Chart',
  'Checkbox',
  'Combobox',
  'Command',
  'DataTable',
  'DatePicker',
  'Dialog',
  'Drawer',
  'DropdownMenu',
  'EmptyState',
  'ErrorState',
  'Field',
  'Footer',
  'Form',
  'Header',
  'Heading',
  'Icon',
  'Input',
  'Kpi',
  'Label',
  'Link',
  'Metric',
  'Modal',
  'Nav',
  'Popover',
  'Radio',
  'Search',
  'Select',
  'Sheet',
  'Sidebar',
  'Skeleton',
  'Spinner',
  'Switch',
  'Table',
  'Tabs',
  'Textarea',
  'Toast',
  'Toggle',
  'Tooltip',
]);

const RAW_CONTROL_COMPONENT_BY_ELEMENT = {
  button: 'Button',
  dialog: 'Dialog',
  input: 'Input',
  select: 'Select',
  table: 'Table',
  textarea: 'Textarea',
} as const;

type RawControlElement = keyof typeof RAW_CONTROL_COMPONENT_BY_ELEMENT;

const NON_GENERIC_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
]);

export interface CodeComponentDeclaration {
  id: string;
  name: string;
  file: string;
  line: number;
  exported: boolean;
  reusable: boolean;
  kind: 'function' | 'variable' | 'class';
}

export interface ComponentReuseFinding {
  id: string;
  name: string;
  file: string;
  line: number;
  canonicalFile: string;
  canonicalLine: number;
  evidence: string[];
}

export interface RawControlReuseFinding {
  id: string;
  element: RawControlElement;
  component: string;
  file: string;
  line: number;
  canonicalFile: string;
  canonicalLine: number;
  containingComponent?: string;
  evidence: string[];
}

export interface CodeImportReference {
  file: string;
  source: string;
  line: number;
  defaultImport?: string;
  namespaceImport?: string;
  imported: string[];
  localNames: string[];
}

export interface ComponentReuseAudit {
  filesChecked: number;
  declarations: CodeComponentDeclaration[];
  imports: CodeImportReference[];
  reusableComponentCount: number;
  localRedeclarationCount: number;
  rawControlCount: number;
  findings: ComponentReuseFinding[];
  rawControlFindings: RawControlReuseFinding[];
}

interface ParsedComponentFile {
  file: string;
  imports: Set<string>;
  importReferences: CodeImportReference[];
  declarations: CodeComponentDeclaration[];
  rawControls: Array<{
    element: RawControlElement;
    component: string;
    file: string;
    line: number;
    containingComponent?: string;
  }>;
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

function isPrimitiveComponentName(name: string): boolean {
  return PRIMITIVE_COMPONENT_NAMES.has(name);
}

function isComponentName(name: string): boolean {
  return /^[A-Z][A-Za-z0-9]*$/.test(name);
}

function hasExportModifier(node: ts.Node): boolean {
  return Boolean(
    ts.canHaveModifiers(node) &&
      ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword),
  );
}

function containsJsx(node: ts.Node): boolean {
  let found = false;
  const visit = (child: ts.Node): void => {
    if (found) return;
    if (
      ts.isJsxElement(child) ||
      ts.isJsxSelfClosingElement(child) ||
      ts.isJsxFragment(child) ||
      ts.isJsxOpeningElement(child)
    ) {
      found = true;
      return;
    }
    ts.forEachChild(child, visit);
  };
  ts.forEachChild(node, visit);
  return found;
}

function classExtendsReactComponent(node: ts.ClassDeclaration): boolean {
  return (
    node.heritageClauses?.some((clause) =>
      clause.types.some((type) => {
        const text = type.expression.getText();
        return /(?:^|\.)(?:Component|PureComponent)$/.test(text);
      }),
    ) ?? false
  );
}

function lineForNode(sourceFile: ts.SourceFile, node: ts.Node): number {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

function jsxIdentifierName(name: ts.JsxTagNameExpression): string | null {
  return ts.isIdentifier(name) ? name.text : null;
}

function jsxAttributeStringValue(
  node: ts.JsxOpeningLikeElement,
  attributeName: string,
): string | null {
  for (const property of node.attributes.properties) {
    if (
      !ts.isJsxAttribute(property) ||
      !ts.isIdentifier(property.name) ||
      property.name.text !== attributeName
    ) {
      continue;
    }
    if (!property.initializer) return '';
    if (ts.isStringLiteral(property.initializer)) return property.initializer.text;
  }
  return null;
}

function isSpecializedInput(node: ts.JsxOpeningLikeElement): boolean {
  const tagName = jsxIdentifierName(node.tagName);
  if (tagName !== 'input') return false;
  const type = jsxAttributeStringValue(node, 'type')?.toLowerCase();
  if (type && NON_GENERIC_INPUT_TYPES.has(type)) return true;
  return node.attributes.properties.some(
    (property) =>
      ts.isJsxSpreadAttribute(property) &&
      /\bgetInputProps\s*\(/.test(property.expression.getText()),
  );
}

function isReusableComponentPath(file: string, name: string): boolean {
  const normalized = normalizePath(file);
  const extension = extname(normalized);
  const base = basename(normalized, extension).toLowerCase();
  const componentName = name.toLowerCase();
  return (
    /(?:^|\/)(?:components|ui|shared|primitives|design-system|common)(?:\/|$)/i.test(normalized) ||
    (base === componentName &&
      !/(?:^|\/)(?:app|pages|routes)(?:\/|$)/i.test(normalized) &&
      !/(?:^|\/)(?:page|layout|route|loading|error|not-found)\.[cm]?[jt]sx?$/i.test(normalized))
  );
}

function collectImports(
  sourceFile: ts.SourceFile,
  file: string,
): {
  names: Set<string>;
  references: CodeImportReference[];
} {
  const imports = new Set<string>();
  const references: CodeImportReference[] = [];
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const clause = statement.importClause;
    const moduleSpecifier = statement.moduleSpecifier;
    if (!ts.isStringLiteral(moduleSpecifier)) continue;
    const defaultImport = clause?.name?.text;
    const imported: string[] = [];
    const localNames: string[] = [];
    let namespaceImport: string | undefined;

    if (!clause) continue;
    if (clause.name) {
      imports.add(clause.name.text);
      localNames.push(clause.name.text);
    }
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const element of clause.namedBindings.elements) {
        imports.add(element.name.text);
        localNames.push(element.name.text);
        imported.push((element.propertyName ?? element.name).text);
      }
    } else if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
      namespaceImport = clause.namedBindings.name.text;
      imports.add(namespaceImport);
      localNames.push(namespaceImport);
    }
    references.push({
      file,
      source: moduleSpecifier.text,
      line: lineForNode(sourceFile, statement),
      ...(defaultImport ? { defaultImport } : {}),
      ...(namespaceImport ? { namespaceImport } : {}),
      imported,
      localNames,
    });
  }
  return { names: imports, references };
}

function collectDeclarations(sourceFile: ts.SourceFile, file: string): CodeComponentDeclaration[] {
  const declarations: CodeComponentDeclaration[] = [];
  const addDeclaration = (
    node: ts.Node,
    name: string,
    exported: boolean,
    kind: CodeComponentDeclaration['kind'],
  ) => {
    if (!isComponentName(name) || !containsJsx(node)) return;
    declarations.push({
      id: `cmp:${file}:${name}`,
      name,
      file,
      line: lineForNode(sourceFile, node),
      exported,
      reusable: exported && isReusableComponentPath(file, name),
      kind,
    });
  };

  const visit = (node: ts.Node): void => {
    if (ts.isFunctionDeclaration(node) && node.name) {
      addDeclaration(node, node.name.text, hasExportModifier(node), 'function');
    } else if (ts.isClassDeclaration(node) && node.name && classExtendsReactComponent(node)) {
      addDeclaration(node, node.name.text, hasExportModifier(node), 'class');
    } else if (ts.isVariableStatement(node)) {
      const exported = hasExportModifier(node);
      for (const declaration of node.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
        addDeclaration(declaration, declaration.name.text, exported, 'variable');
      }
    }
    ts.forEachChild(node, visit);
  };

  ts.forEachChild(sourceFile, visit);
  return declarations;
}

function componentDeclarationName(node: ts.Node): string | null {
  if (ts.isFunctionDeclaration(node) && node.name && isComponentName(node.name.text)) {
    return containsJsx(node) ? node.name.text : null;
  }
  if (
    ts.isClassDeclaration(node) &&
    node.name &&
    isComponentName(node.name.text) &&
    classExtendsReactComponent(node)
  ) {
    return node.name.text;
  }
  if (
    ts.isVariableDeclaration(node) &&
    ts.isIdentifier(node.name) &&
    isComponentName(node.name.text)
  ) {
    return node.initializer && containsJsx(node) ? node.name.text : null;
  }
  return null;
}

function collectRawControls(
  sourceFile: ts.SourceFile,
  file: string,
): ParsedComponentFile['rawControls'] {
  const rawControls: ParsedComponentFile['rawControls'] = [];

  const visit = (node: ts.Node, containingComponent?: string): void => {
    const nextComponent = componentDeclarationName(node) ?? containingComponent;
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tagName = jsxIdentifierName(node.tagName);
      const component =
        tagName && Object.hasOwn(RAW_CONTROL_COMPONENT_BY_ELEMENT, tagName)
          ? RAW_CONTROL_COMPONENT_BY_ELEMENT[tagName as RawControlElement]
          : null;
      if (component && !isSpecializedInput(node)) {
        rawControls.push({
          element: tagName as RawControlElement,
          component,
          file,
          line: lineForNode(sourceFile, node),
          ...(nextComponent ? { containingComponent: nextComponent } : {}),
        });
      }
    }
    ts.forEachChild(node, (child) => visit(child, nextComponent));
  };

  ts.forEachChild(sourceFile, (node) => visit(node));
  return rawControls;
}

function parseComponentFile(projectRoot: string, absolutePath: string): ParsedComponentFile | null {
  const file = normalizePath(relative(projectRoot, absolutePath) || absolutePath);
  if (isNonProductionComponentAuditFile(file)) {
    return null;
  }
  let code = '';
  try {
    code = readFileSync(absolutePath, 'utf-8');
  } catch {
    return null;
  }
  const sourceFile = ts.createSourceFile(
    file,
    code,
    ts.ScriptTarget.Latest,
    true,
    /\.[cm]?[jt]sx$/i.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const imports = collectImports(sourceFile, file);
  return {
    file,
    imports: imports.names,
    importReferences: imports.references,
    declarations: collectDeclarations(sourceFile, file),
    rawControls: collectRawControls(sourceFile, file),
  };
}

function canonicalSort(a: CodeComponentDeclaration, b: CodeComponentDeclaration): number {
  return a.file.localeCompare(b.file) || a.line - b.line || a.name.localeCompare(b.name);
}

function isNonProductionComponentAuditFile(file: string): boolean {
  const normalized = normalizePath(file);
  return (
    /(?:^|\/)(?:__tests__|__mocks__|tests?|specs?|fixtures?|mocks?|stories?)(?:\/|$)/i.test(
      normalized,
    ) || /\.(?:test|spec|stories|story|fixture|mock)\.[cm]?[jt]sx?$/i.test(normalized)
  );
}

export function auditComponentReuse(
  projectRoot: string,
  sourceFiles: string[],
): ComponentReuseAudit {
  const parsedFiles = sourceFiles
    .map((file) => parseComponentFile(projectRoot, file))
    .filter((file): file is ParsedComponentFile => Boolean(file));
  const declarations = parsedFiles.flatMap((file) => file.declarations);
  const reusableByName = new Map<string, CodeComponentDeclaration[]>();

  for (const declaration of declarations) {
    if (!declaration.reusable || !isPrimitiveComponentName(declaration.name)) continue;
    const existing = reusableByName.get(declaration.name) ?? [];
    existing.push(declaration);
    reusableByName.set(declaration.name, existing.sort(canonicalSort));
  }

  const findings: ComponentReuseFinding[] = [];
  const rawControlFindings: RawControlReuseFinding[] = [];
  for (const parsedFile of parsedFiles) {
    for (const declaration of parsedFile.declarations) {
      if (!isPrimitiveComponentName(declaration.name) || declaration.reusable) continue;
      if (parsedFile.imports.has(declaration.name)) continue;
      const canonical = reusableByName
        .get(declaration.name)
        ?.filter((entry) => entry.file !== declaration.file)
        .sort(canonicalSort)[0];
      if (!canonical) continue;
      findings.push({
        id: `${COMPONENT_REUSE_RULE_ID}:${declaration.file}:${declaration.name}`,
        name: declaration.name,
        file: declaration.file,
        line: declaration.line,
        canonicalFile: canonical.file,
        canonicalLine: canonical.line,
        evidence: [
          `${declaration.file}:${declaration.line} declares local ${declaration.name}`,
          `${canonical.file}:${canonical.line} already exports reusable ${canonical.name}`,
        ],
      });
    }

    const seenRawControls = new Set<string>();
    for (const rawControl of parsedFile.rawControls) {
      if (parsedFile.imports.has(rawControl.component)) continue;
      if (rawControl.containingComponent === rawControl.component) continue;
      const canonical = reusableByName
        .get(rawControl.component)
        ?.filter((entry) => entry.file !== rawControl.file)
        .sort(canonicalSort)[0];
      if (!canonical) continue;

      const key = `${rawControl.file}:${rawControl.component}`;
      if (seenRawControls.has(key)) continue;
      seenRawControls.add(key);
      rawControlFindings.push({
        id: `${RAW_CONTROL_REUSE_RULE_ID}:${rawControl.file}:${rawControl.element}`,
        element: rawControl.element,
        component: rawControl.component,
        file: rawControl.file,
        line: rawControl.line,
        canonicalFile: canonical.file,
        canonicalLine: canonical.line,
        ...(rawControl.containingComponent
          ? { containingComponent: rawControl.containingComponent }
          : {}),
        evidence: [
          `${rawControl.file}:${rawControl.line} renders raw <${rawControl.element}>`,
          `${canonical.file}:${canonical.line} already exports reusable ${canonical.name}`,
        ],
      });
    }
  }

  return {
    filesChecked: parsedFiles.length,
    declarations,
    imports: parsedFiles.flatMap((file) => file.importReferences),
    reusableComponentCount: [...reusableByName.values()].reduce(
      (count, entries) => count + entries.length,
      0,
    ),
    localRedeclarationCount: findings.length,
    rawControlCount: rawControlFindings.length,
    findings,
    rawControlFindings,
  };
}
