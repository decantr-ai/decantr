import { existsSync, lstatSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import type { ProjectDiscovery } from './discovery.js';
import { classifyProjectSourceScope } from './source/scope.js';
import type { UIEvidenceAdapter } from './ui-evidence-adapters.js';
import type {
  UIReadinessStatus,
  UISurfaceAuthority,
  UISurfaceItem,
  UISurfaceKind,
} from './ui-surfaces.js';

export type UISurfaceTaskTargetKind = UISurfaceKind;

export interface UISurfaceTaskReadTarget {
  rank: number;
  file: string;
  role: 'implementation' | 'authority' | 'style' | 'evidence';
  authority: UISurfaceAuthority | 'project-style';
  reason: string;
}

export interface UISurfaceTaskContextV1 {
  schemaVersion: 'ui-surface-task-context.v1';
  target: string;
  status: UIReadinessStatus;
  surface: UISurfaceItem | null;
  candidates: UISurfaceItem[];
  read: UISurfaceTaskReadTarget[];
  axes: ProjectDiscovery['surfaces']['axes'];
  reasons: string[];
}

export function resolveUISurfaceTaskContext(
  discovery: ProjectDiscovery,
  targetInput: string,
): UISurfaceTaskContextV1 {
  const target = targetInput.trim();
  const candidates = findCandidates(discovery, target);
  if (candidates.length === 0) {
    return {
      schemaVersion: 'ui-surface-task-context.v1',
      target,
      status: discovery.surfaces.status === 'unsupported' ? 'unsupported' : 'blocked',
      surface: null,
      candidates: [],
      read: [],
      axes: discovery.surfaces.axes,
      reasons: [
        `No UI surface matches ${target || '(empty target)'}.`,
        'Use a route path, surface id, component name, kind:name selector, or file:path selector from scan output.',
      ],
    };
  }
  if (candidates.length > 1) {
    return {
      schemaVersion: 'ui-surface-task-context.v1',
      target,
      status: 'blocked',
      surface: null,
      candidates,
      read: [],
      axes: discovery.surfaces.axes,
      reasons: [
        `${target} matches ${candidates.length} UI surfaces. Use the exact surface id or file:path selector.`,
      ],
    };
  }

  const surface = candidates[0];
  const status = taskStatus(discovery, surface);
  const read = ['blocked', 'unsupported'].includes(status)
    ? []
    : buildReadTargets(discovery, surface);
  return {
    schemaVersion: 'ui-surface-task-context.v1',
    target,
    status,
    surface,
    candidates: [surface],
    read,
    axes: discovery.surfaces.axes,
    reasons: taskReasons(discovery, surface, status),
  };
}

function findCandidates(discovery: ProjectDiscovery, target: string): UISurfaceItem[] {
  if (!target) return [];
  const items = discovery.surfaces.items;
  const exactId = items.filter((item) => item.id === target);
  if (exactId.length > 0) return exactId;

  if (target.startsWith('file:')) {
    const file = target.slice('file:'.length).replace(/^\.\//u, '');
    const absolute = resolve(discovery.workspace.appRoot, file);
    const relation = relative(discovery.workspace.appRoot, absolute);
    if (!file || !isContainedRegularFile(discovery.workspace.appRoot, absolute, relation)) {
      return [];
    }
    const scope = classifyProjectSourceScope(file);
    const matching = items.filter((item) => item.files.includes(file));
    const confidence = matching.some((item) => item.confidence === 'high')
      ? 'high'
      : matching.some((item) => item.confidence === 'medium')
        ? 'medium'
        : 'high';
    return [
      {
        id: `file:${file}`,
        kind: 'file',
        name: file,
        files: [file],
        scope,
        authority: ['generated', 'build-output'].includes(scope)
          ? 'unresolved'
          : 'project-reference',
        taskability: ['generated', 'build-output'].includes(scope) ? 'blocked' : 'limited',
        confidence,
        evidence: [
          matching.length > 0
            ? `Exact project file contains ${matching.length} discovered UI surface(s).`
            : 'Exact project file exists; runtime reachability is not inferred.',
        ],
      },
    ];
  }

  if (target.startsWith('/')) {
    const routes = items.filter((item) => item.kind === 'route' && item.name === target);
    const taskable = routes.filter((item) => item.taskability === 'ready');
    const candidates = taskable.length > 0 ? taskable : routes;
    const concrete = candidates.filter(
      (item) =>
        !item.evidence.some((entry) => /\broot route\b/iu.test(entry)) &&
        !item.files.some((file) => /(?:^|\/)(?:__root|root)\.[^/]+$/iu.test(file)),
    );
    return uniqueSurfaces(concrete.length > 0 ? concrete : candidates);
  }

  const kindSelector = /^([a-z-]+):(.*)$/u.exec(target);
  if (kindSelector) {
    const [, kind, name] = kindSelector;
    return items.filter(
      (item) =>
        item.kind === kind &&
        (item.name.toLowerCase() === name.toLowerCase() || item.id === target),
    );
  }

  return items.filter(
    (item) =>
      ['component', 'overlay', 'story', 'layout', 'package'].includes(item.kind) &&
      item.name.toLowerCase() === target.toLowerCase(),
  );
}

function isContainedRegularFile(
  projectRoot: string,
  absolute: string,
  lexicalRelation: string,
): boolean {
  if (
    lexicalRelation === '..' ||
    lexicalRelation.startsWith('../') ||
    isAbsolute(lexicalRelation)
  ) {
    return false;
  }
  try {
    if (!lstatSync(absolute).isFile()) return false;
    const root = realpathSync(projectRoot);
    const file = realpathSync(absolute);
    const relation = relative(root, file);
    return relation !== '..' && !relation.startsWith('../') && !isAbsolute(relation);
  } catch {
    return false;
  }
}

function uniqueSurfaces(items: UISurfaceItem[]): UISurfaceItem[] {
  const byImplementation = new Map<string, UISurfaceItem>();
  for (const item of items) {
    const key = `${item.kind}:${item.files.join('|')}:${item.name}`;
    if (!byImplementation.has(key)) byImplementation.set(key, item);
  }
  return [...byImplementation.values()];
}

function taskStatus(discovery: ProjectDiscovery, surface: UISurfaceItem): UIReadinessStatus {
  if (discovery.surfaces.status === 'unsupported') return 'unsupported';
  if (surface.authority === 'unresolved' || surface.taskability === 'blocked') return 'blocked';
  if (surface.kind === 'route') {
    if (discovery.routes.authority !== 'proven' || surface.taskability !== 'ready') {
      return 'blocked';
    }
    if (discovery.project.framework === 'angular' && discovery.routes.completeness !== 'complete') {
      return 'blocked';
    }
    if (discovery.routes.completeness !== 'complete') return 'limited';
    return discovery.surfaces.axes.stylingAuthority.status === 'proven' ? 'ready' : 'limited';
  }
  if (surface.kind === 'runtime-state') return 'limited';
  return 'limited';
}

function buildReadTargets(
  discovery: ProjectDiscovery,
  surface: UISurfaceItem,
): UISurfaceTaskReadTarget[] {
  const targets: UISurfaceTaskReadTarget[] = surface.files.map((file) => ({
    rank: 1,
    file,
    role: 'implementation',
    authority: surface.authority,
    reason: `Selected ${surface.kind} implementation`,
  }));
  if (surface.kind === 'route') {
    const matchingSignals = discovery.routes.routeSignals.filter(
      (signal) => signal.path === surface.name && surface.files.includes(signal.file),
    );
    const declarationFiles = matchingSignals
      .map((signal) => signal.declarationFile)
      .filter((file): file is string => Boolean(file));
    const authorityFiles =
      declarationFiles.length > 0
        ? declarationFiles
        : discovery.routes.authorityFiles.filter(
            (file) =>
              surface.files.includes(file) ||
              /(?:^|\/)(?:app-?routes?|routes?|router|routing|app\.config|main)\.[^/]+$/iu.test(
                file,
              ),
          );
    for (const file of [...new Set(authorityFiles)].slice(0, 8)) {
      if (surface.files.includes(file)) continue;
      targets.push({
        rank: 2,
        file,
        role: 'authority',
        authority: 'production-proven',
        reason: 'Production route declaration authority for the selected route',
      });
    }
    if (discovery.project.framework === 'svelte') {
      const implementationDirs = new Set(surface.files.map((file) => dirname(file)));
      const pageDataFiles = discovery.routes.routeSignals
        .filter(
          (signal) =>
            signal.path === surface.name &&
            !signal.taskable &&
            implementationDirs.has(dirname(signal.file)) &&
            /(?:^|\/)\+page(?:\.server)?\.[jt]s$/u.test(signal.file),
        )
        .map((signal) => signal.file);
      for (const file of [...new Set(pageDataFiles)].slice(0, 4)) {
        targets.push({
          rank: 2,
          file,
          role: 'authority',
          authority: 'production-proven',
          reason: 'SvelteKit page data authority for the selected route',
        });
      }
    }
    const corroborationFiles = matchingSignals
      .map((signal) => signal.corroborationFile)
      .filter((file): file is string => Boolean(file));
    for (const file of [...new Set(corroborationFiles)].slice(0, 2)) {
      if (surface.files.includes(file)) continue;
      targets.push({
        rank: 4,
        file,
        role: 'evidence',
        authority: 'project-reference',
        reason: 'Generated framework metadata corroborating the authored public route path',
      });
    }
  }
  const styleFiles = [
    ...discovery.styling.authorityFiles,
    ...(discovery.styling.authorityFiles.length === 0 && discovery.styling.configFile
      ? [discovery.styling.configFile]
      : []),
  ];
  for (const styleFile of [...new Set(styleFiles)].slice(0, 12)) {
    if (
      targets.some((target) => target.file === styleFile) ||
      !existsSync(join(discovery.workspace.appRoot, styleFile))
    ) {
      continue;
    }
    targets.push({
      rank: 3,
      file: styleFile,
      role: 'style',
      authority: 'project-style',
      reason: 'Project styling authority',
    });
  }
  targets.push(...buildEvidenceReadTargets(discovery, surface));
  const byFile = new Map<string, UISurfaceTaskReadTarget>();
  for (const target of targets) {
    const existing = byFile.get(target.file);
    if (!existing || target.rank < existing.rank) byFile.set(target.file, target);
  }
  return [...byFile.values()].sort((left, right) => left.rank - right.rank);
}

function buildEvidenceReadTargets(
  discovery: ProjectDiscovery,
  surface: UISurfaceItem,
): UISurfaceTaskReadTarget[] {
  const identityTerms = surfaceIdentityTerms(surface);
  const evidenceAdapters: UIEvidenceAdapter[] = [
    discovery.surfaces.evidenceAdapters.storybook,
    discovery.surfaces.evidenceAdapters.figmaCodeConnect,
    discovery.surfaces.evidenceAdapters.designTokens,
    discovery.surfaces.evidenceAdapters.projectTests,
    discovery.surfaces.evidenceAdapters.runtime,
    discovery.surfaces.evidenceAdapters.visual,
    discovery.surfaces.evidenceAdapters.accessibility,
  ];
  const candidates = evidenceAdapters.flatMap((adapter) =>
    adapter.files
      .filter((entry) => entry.role !== 'configuration')
      .filter(
        (entry) =>
          adapter.kind === 'design-tokens' ||
          identityTerms.some((term) => entry.file.toLowerCase().includes(term)),
      )
      .map((entry) => ({
        rank: 4,
        file: entry.file,
        role: 'evidence' as const,
        authority: 'project-reference' as const,
        reason: `Advisory ${adapter.kind} evidence for the selected UI surface`,
      }))
      .slice(0, adapter.kind === 'design-tokens' ? 2 : 1),
  );
  const byFile = new Map<string, UISurfaceTaskReadTarget>();
  for (const candidate of candidates) {
    if (!byFile.has(candidate.file)) byFile.set(candidate.file, candidate);
    if (byFile.size >= 8) break;
  }
  return [...byFile.values()];
}

function surfaceIdentityTerms(surface: UISurfaceItem): string[] {
  const ignored = new Set([
    'app',
    'component',
    'components',
    'index',
    'layout',
    'page',
    'route',
    'src',
    'test',
    'spec',
    'tsx',
    'jsx',
    'vue',
    'svelte',
  ]);
  const terms = [surface.name, ...surface.files]
    .flatMap((value) =>
      value
        .replace(/([a-z0-9])([A-Z])/gu, '$1 $2')
        .toLowerCase()
        .split(/[^a-z0-9]+/u),
    )
    .filter((value) => value.length >= 3 && !ignored.has(value));
  return [...new Set(terms)];
}

function taskReasons(
  discovery: ProjectDiscovery,
  surface: UISurfaceItem,
  status: UIReadinessStatus,
): string[] {
  if (status === 'ready') return [`${surface.id} resolves to proven production authority.`];
  const reasons = [`${surface.id} task preparation is ${status}.`, ...discovery.surfaces.reasons];
  if (surface.kind !== 'route') {
    reasons.push(
      `${surface.kind} source is project evidence, but static discovery does not prove runtime reachability.`,
    );
  }
  return [...new Set(reasons)];
}
