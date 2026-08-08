import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { basename, dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import * as ts from 'typescript';
import type {
  DiscoveryComponents,
  DiscoveryConfidenceLevel,
  DiscoveryProjectIdentity,
  DiscoveryRoutes,
  DiscoveryStyling,
} from './discovery.js';
import { classifyProjectSourceScope, type ProjectSourceScope } from './source/scope.js';
import { discoverUIEvidenceAdapters, type UIEvidenceAdapters } from './ui-evidence-adapters.js';

export type UISurfaceKind =
  | 'file'
  | 'route'
  | 'layout'
  | 'component'
  | 'story'
  | 'overlay'
  | 'flow'
  | 'package'
  | 'runtime-state';

export type UISurfaceAuthority =
  | 'production-proven'
  | 'project-reference'
  | 'inferred'
  | 'unresolved';

export type UISurfaceTaskability = 'ready' | 'limited' | 'blocked' | 'not_applicable';
export type UIReadinessStatus = 'ready' | 'limited' | 'blocked' | 'unsupported';
export type UIAuthorityAxisStatus =
  | 'proven'
  | 'partial'
  | 'unresolved'
  | 'not_applicable'
  | 'unsupported';

export interface UISurfaceItem {
  id: string;
  kind: UISurfaceKind;
  name: string;
  files: string[];
  scope: ProjectSourceScope | 'runtime';
  authority: UISurfaceAuthority;
  taskability: UISurfaceTaskability;
  confidence: DiscoveryConfidenceLevel;
  evidence: string[];
}

export interface UIAuthorityAxis {
  status: UIAuthorityAxisStatus;
  confidence: DiscoveryConfidenceLevel;
  evidence: string[];
  limitations: string[];
  blocksReady: boolean;
}

export interface UIReadinessAxes {
  selectedApp: UIAuthorityAxis;
  surfaceAuthority: UIAuthorityAxis;
  topologyCompleteness: UIAuthorityAxis;
  taskability: UIAuthorityAxis;
  componentInventory: UIAuthorityAxis;
  stylingAuthority: UIAuthorityAxis;
  runtimeEvidence: UIAuthorityAxis;
}

export interface UISurfaceDiscovery {
  schemaVersion: 'ui-surfaces.v1';
  status: UIReadinessStatus;
  primaryMode: 'application' | 'design-system' | 'component-library' | 'unknown';
  items: UISurfaceItem[];
  counts: Record<UISurfaceKind, number>;
  axes: UIReadinessAxes;
  evidenceAdapters: UIEvidenceAdapters;
  reasons: string[];
}

export interface BuildUISurfaceDiscoveryInput {
  projectRoot: string;
  files: string[];
  project: DiscoveryProjectIdentity;
  routes: DiscoveryRoutes;
  components: DiscoveryComponents;
  styling: DiscoveryStyling;
}

const STORY_FILE_RE = /(?:^|\/)\.?(?:stories|storybook)(?:\/|$)|\.stories?\.[^/]+$/iu;
const FLOW_FILE_RE =
  /(?:^|\/)(?:e2e|tests?|specs?)(?:\/|$)|\.(?:e2e|cy|spec|test)\.[cm]?[jt]sx?$/iu;
const LAYOUT_FILE_RE =
  /(?:^|\/)(?:layouts?\/[^/]+|(?:root-?)?layout|app-shell|shell|frame)\.(?:[cm]?[jt]sx?|vue|svelte)$/iu;
const OVERLAY_NAME_RE =
  /(?:Dialog|Modal|Drawer|Sheet|Popover|Tooltip|Overlay|Menu|Toast|CommandPalette)$/u;

function propertyNameText(name: ts.PropertyName | undefined): string | null {
  if (!name) return null;
  return ts.isIdentifier(name) || ts.isStringLiteralLike(name) ? name.text : null;
}

function staticResourceValues(expression: ts.Expression): string[] {
  if (ts.isStringLiteralLike(expression)) return [expression.text];
  if (ts.isArrayLiteralExpression(expression)) {
    return expression.elements.flatMap((element) =>
      ts.isExpression(element) ? staticResourceValues(element) : [],
    );
  }
  return [];
}

function isContainedRegularFile(projectRoot: string, absolute: string): boolean {
  const lexicalRelation = relative(projectRoot, absolute);
  if (
    lexicalRelation === '..' ||
    lexicalRelation.startsWith('../') ||
    isAbsolute(lexicalRelation)
  ) {
    return false;
  }
  try {
    const stat = lstatSync(absolute);
    if (stat.isSymbolicLink() || !stat.isFile()) return false;
    const realRelation = relative(realpathSync(projectRoot), realpathSync(absolute));
    return realRelation !== '..' && !realRelation.startsWith('../') && !isAbsolute(realRelation);
  } catch {
    return false;
  }
}

function angularComponentResourceFiles(projectRoot: string, componentFile: string): string[] {
  if (!/\.[cm]?[jt]s$/iu.test(componentFile)) return [componentFile];
  const absoluteComponent = join(projectRoot, componentFile);
  let content = '';
  try {
    content = readFileSync(absoluteComponent, 'utf8');
  } catch {
    return [componentFile];
  }
  if (!content.includes('@Component')) return [componentFile];

  const source = ts.createSourceFile(
    componentFile,
    content,
    ts.ScriptTarget.Latest,
    true,
    componentFile.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const resources = new Set<string>([componentFile]);
  const addResource = (value: string): void => {
    const absolute = resolve(dirname(absoluteComponent), value);
    const relation = relative(projectRoot, absolute).replace(/\\/gu, '/');
    if (!relation || !isContainedRegularFile(projectRoot, absolute)) return;
    resources.add(relation);
    if (extname(absolute).toLowerCase() === '.html') {
      const authoredView = absolute.slice(0, -extname(absolute).length) + '.pug';
      if (isContainedRegularFile(projectRoot, authoredView)) {
        resources.add(relative(projectRoot, authoredView).replace(/\\/gu, '/'));
      }
    }
  };

  const visit = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'Component' &&
      node.arguments[0] &&
      ts.isObjectLiteralExpression(node.arguments[0])
    ) {
      for (const property of node.arguments[0].properties) {
        if (!ts.isPropertyAssignment(property)) continue;
        const name = propertyNameText(property.name);
        if (!name || !['templateUrl', 'styleUrl', 'styleUrls'].includes(name)) continue;
        for (const value of staticResourceValues(property.initializer)) addResource(value);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return [...resources];
}

function surfaceImplementationFiles(
  input: BuildUISurfaceDiscoveryInput,
  file: string,
  cache: Map<string, string[]>,
): string[] {
  if (input.project.framework !== 'angular') return [file];
  const cached = cache.get(file);
  if (cached) return cached;
  const files = angularComponentResourceFiles(input.projectRoot, file);
  cache.set(file, files);
  return files;
}

export function buildUISurfaceDiscovery(input: BuildUISurfaceDiscoveryInput): UISurfaceDiscovery {
  const items = new Map<string, UISurfaceItem>();
  const implementationFileCache = new Map<string, string[]>();
  const evidenceAdapters = discoverUIEvidenceAdapters({
    projectRoot: input.projectRoot,
    files: input.files,
    dependencies: input.project.dependencies,
  });

  for (const signal of input.routes.routeSignals) {
    const id = `route:${signal.path}:${signal.file}`;
    const files = surfaceImplementationFiles(input, signal.file, implementationFileCache);
    items.set(id, {
      id,
      kind: 'route',
      name: signal.path,
      files,
      scope: classifyProjectSourceScope(signal.file),
      authority: !signal.taskable
        ? 'project-reference'
        : input.routes.authority === 'proven'
          ? 'production-proven'
          : input.routes.authority === 'inferred'
            ? 'inferred'
            : 'unresolved',
      taskability: signal.taskable
        ? input.routes.authority === 'proven'
          ? 'ready'
          : 'limited'
        : 'blocked',
      confidence: signal.confidence,
      evidence: [
        signal.evidence,
        ...(files.length > 1
          ? [`${files.length - 1} external Angular component resource(s) resolved`]
          : []),
      ],
    });
  }

  for (const component of input.components.items) {
    const id = `component:${component.file}:${component.name}`;
    const files = surfaceImplementationFiles(input, component.file, implementationFileCache);
    items.set(id, {
      id,
      kind: 'component',
      name: component.name,
      files,
      scope: classifyProjectSourceScope(component.file),
      authority: 'project-reference',
      taskability: 'limited',
      confidence: component.confidence,
      evidence: [
        `Static component declaration in ${component.file}`,
        ...(files.length > 1
          ? [`${files.length - 1} external Angular component resource(s) resolved`]
          : []),
      ],
    });
    if (OVERLAY_NAME_RE.test(component.name)) {
      const overlayId = `overlay:${component.file}:${component.name}`;
      items.set(overlayId, {
        id: overlayId,
        kind: 'overlay',
        name: component.name,
        files,
        scope: classifyProjectSourceScope(component.file),
        authority: 'project-reference',
        taskability: 'limited',
        confidence: component.confidence,
        evidence: [
          'Component name indicates an overlay surface; runtime reachability is not proven.',
        ],
      });
    }
  }

  for (const file of input.files) {
    if (STORY_FILE_RE.test(file)) {
      addFileSurface(items, 'story', file, 'project-reference', 'limited', 'medium');
    }
    if (FLOW_FILE_RE.test(file)) {
      addFileSurface(items, 'flow', file, 'project-reference', 'not_applicable', 'medium');
    }
    if (LAYOUT_FILE_RE.test(file)) {
      const routeOwned = input.routes.authorityFiles.includes(file);
      addFileSurface(
        items,
        'layout',
        file,
        routeOwned ? 'production-proven' : 'inferred',
        routeOwned ? 'ready' : 'limited',
        routeOwned ? 'high' : 'medium',
      );
    }
  }

  for (const artifact of evidenceAdapters.runtime.files.filter(
    (entry) => entry.role === 'artifact',
  )) {
    addFileSurface(items, 'runtime-state', artifact.file, 'project-reference', 'limited', 'medium');
  }

  if (input.project.packageJsonPresent) {
    const packageName = input.project.packageName ?? 'selected package';
    items.set('package:package.json', {
      id: 'package:package.json',
      kind: 'package',
      name: packageName,
      files: ['package.json'],
      scope: 'package',
      authority: input.project.packageJsonValid ? 'project-reference' : 'unresolved',
      taskability: input.project.packageJsonValid ? 'limited' : 'blocked',
      confidence: input.project.packageJsonValid ? 'high' : 'low',
      evidence: [
        input.project.packageJsonValid
          ? 'Selected package manifest is readable.'
          : 'Selected package manifest is invalid.',
      ],
    });
  }

  const values = [...items.values()];
  const storyCount = countKind(values, 'story');
  const packageCount = countKind(values, 'package');
  const runtimeCount = countKind(values, 'runtime-state');
  const primaryMode = detectPrimaryMode(input, storyCount, evidenceAdapters);
  const axes = buildAxes(input, primaryMode, storyCount, packageCount, runtimeCount);
  const status = deriveReadinessStatus(axes);

  return {
    schemaVersion: 'ui-surfaces.v1',
    status,
    primaryMode,
    items: values,
    counts: {
      file: 0,
      route: countKind(values, 'route'),
      layout: countKind(values, 'layout'),
      component: countKind(values, 'component'),
      story: storyCount,
      overlay: countKind(values, 'overlay'),
      flow: countKind(values, 'flow'),
      package: packageCount,
      'runtime-state': runtimeCount,
    },
    axes,
    evidenceAdapters,
    reasons: readinessReasons(axes),
  };
}

function addFileSurface(
  items: Map<string, UISurfaceItem>,
  kind: UISurfaceKind,
  file: string,
  authority: UISurfaceAuthority,
  taskability: UISurfaceTaskability,
  confidence: DiscoveryConfidenceLevel,
): void {
  const id = `${kind}:${file}`;
  items.set(id, {
    id,
    kind,
    name: basename(file),
    files: [file],
    scope: kind === 'runtime-state' ? 'runtime' : classifyProjectSourceScope(file),
    authority,
    taskability,
    confidence,
    evidence: [`${kind} evidence found at ${file}`],
  });
}

function countKind(items: UISurfaceItem[], kind: UISurfaceKind): number {
  return items.filter((item) => item.kind === kind).length;
}

function detectPrimaryMode(
  input: BuildUISurfaceDiscoveryInput,
  storyCount: number,
  evidenceAdapters: UIEvidenceAdapters,
): UISurfaceDiscovery['primaryMode'] {
  if (
    evidenceAdapters.figmaCodeConnect.status !== 'absent' &&
    input.components.componentCount >= 20 &&
    storyCount > 0
  ) {
    return 'design-system';
  }
  if (input.routes.taskableRouteCount > 0) return 'application';
  if (input.components.componentCount >= 20 && storyCount > 0) return 'design-system';
  if (input.components.componentCount > 0) return 'component-library';
  return 'unknown';
}

function buildAxes(
  input: BuildUISurfaceDiscoveryInput,
  primaryMode: UISurfaceDiscovery['primaryMode'],
  storyCount: number,
  packageCount: number,
  runtimeCount: number,
): UIReadinessAxes {
  const selectedApp: UIAuthorityAxis =
    input.project.framework !== 'unknown' &&
    (input.project.packageJsonValid || input.project.framework === 'html')
      ? axis('proven', 'high', input.project.evidence, [], true)
      : input.project.packageJsonValid && primaryMode !== 'unknown'
        ? axis(
            'partial',
            'medium',
            ['A selected UI package is present, but its framework role is not proven.'],
            ['Framework detection did not establish an application runtime.'],
            true,
          )
        : axis(
            packageCount > 0 ? 'partial' : 'unsupported',
            packageCount > 0 ? 'low' : 'low',
            [],
            ['The selected path is not proven to be a UI application or component package.'],
            true,
          );

  const surfaceAuthority: UIAuthorityAxis =
    input.routes.authority === 'proven' && input.routes.taskableRouteCount > 0
      ? axis(
          'proven',
          input.routes.confidence,
          input.routes.evidence,
          input.routes.limitations,
          true,
        )
      : input.components.componentCount > 0
        ? axis(
            'partial',
            input.components.confidence,
            input.components.evidence,
            ['Component evidence identifies UI surfaces but does not prove runtime reachability.'],
            true,
          )
        : axis('unresolved', 'low', [], ['No authoritative UI surface was discovered.'], true);

  const topologyCompleteness: UIAuthorityAxis =
    primaryMode === 'application'
      ? input.routes.completeness === 'complete'
        ? axis(
            'proven',
            input.routes.confidence,
            input.routes.evidence,
            input.routes.limitations,
            true,
          )
        : axis(
            input.routes.completeness === 'partial' ? 'partial' : 'unresolved',
            input.routes.confidence,
            input.routes.evidence,
            input.routes.limitations,
            true,
          )
      : axis(
          'partial',
          input.components.confidence,
          input.components.evidence,
          ['Static component discovery cannot prove a complete package surface.'],
          false,
        );

  const taskability: UIAuthorityAxis =
    input.routes.authority === 'proven' &&
    input.routes.completeness === 'complete' &&
    input.routes.taskableRouteCount > 0
      ? axis(
          'proven',
          input.routes.confidence,
          [
            `${input.routes.taskableRouteCount} source-backed route target(s) pass known deployment-policy exclusions.`,
          ],
          input.routes.limitations,
          true,
        )
      : input.routes.taskableRouteCount > 0
        ? axis(
            'partial',
            input.routes.confidence,
            [
              `${input.routes.taskableRouteCount} route target(s) resolve to source files with ${input.routes.authority} topology authority.`,
            ],
            [
              input.routes.authority === 'proven'
                ? 'Exact route targets are usable, but the complete route topology is not proven.'
                : 'Route targets remain advisory until production topology authority is proven.',
            ],
            true,
          )
        : input.components.componentCount > 0
          ? axis(
              'partial',
              input.components.confidence,
              [
                `${input.components.componentCount} component candidate(s) resolve to source files.`,
              ],
              [
                'A concrete component or story target must be selected before task context is ready.',
              ],
              true,
            )
          : axis('unresolved', 'low', [], ['No implementation target resolves to source.'], true);

  const componentInventory: UIAuthorityAxis =
    input.components.componentCount > 0
      ? axis(
          'partial',
          input.components.confidence,
          input.components.evidence,
          input.components.limitations,
          false,
        )
      : axis('unresolved', 'low', [], ['No reusable component candidates were discovered.'], false);

  const stylingAuthority: UIAuthorityAxis =
    input.styling.approach !== 'unknown' && input.styling.confidence === 'high'
      ? axis('proven', 'high', input.styling.evidence, input.styling.limitations, true)
      : input.styling.approach !== 'unknown'
        ? axis(
            'partial',
            input.styling.confidence,
            input.styling.evidence,
            input.styling.limitations,
            true,
          )
        : axis(
            'unresolved',
            'low',
            input.styling.evidence,
            [...input.styling.limitations, 'No project-owned styling authority was proven.'],
            true,
          );

  const runtimeEvidence: UIAuthorityAxis =
    runtimeCount > 0
      ? axis(
          'partial',
          'medium',
          [`${runtimeCount} project-owned runtime evidence artifact(s) found.`],
          ['Runtime evidence freshness and target coverage require verification.'],
          false,
        )
      : axis(
          'not_applicable',
          'low',
          [],
          ['Runtime evidence was not collected during the read-only static scan.'],
          false,
        );

  return {
    selectedApp,
    surfaceAuthority,
    topologyCompleteness,
    taskability,
    componentInventory,
    stylingAuthority,
    runtimeEvidence,
  };
}

function axis(
  status: UIAuthorityAxisStatus,
  confidence: DiscoveryConfidenceLevel,
  evidence: string[],
  limitations: string[],
  blocksReady: boolean,
): UIAuthorityAxis {
  return {
    status,
    confidence,
    evidence: [...new Set(evidence)],
    limitations: [...new Set(limitations)],
    blocksReady,
  };
}

function deriveReadinessStatus(axes: UIReadinessAxes): UIReadinessStatus {
  const blocking = Object.values(axes).filter((axis) => axis.blocksReady);
  if (
    axes.selectedApp.status === 'unsupported' ||
    (axes.selectedApp.status === 'partial' &&
      axes.surfaceAuthority.status === 'unresolved' &&
      axes.taskability.status === 'unresolved')
  ) {
    return 'unsupported';
  }
  if (blocking.some((axis) => ['unresolved', 'unsupported'].includes(axis.status))) {
    return 'blocked';
  }
  if (blocking.some((axis) => axis.status !== 'proven')) return 'limited';
  return 'ready';
}

function readinessReasons(axes: UIReadinessAxes): string[] {
  const reasons: string[] = [];
  for (const [name, value] of Object.entries(axes) as [string, UIAuthorityAxis][]) {
    if (value.status === 'proven' || value.status === 'not_applicable') continue;
    reasons.push(`${name}: ${value.status}`);
    reasons.push(...value.limitations.slice(0, 2).map((limitation) => `${name}: ${limitation}`));
  }
  return reasons.length > 0 ? reasons : ['All blocking static authority axes are proven.'];
}
