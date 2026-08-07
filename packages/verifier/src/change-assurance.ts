import { realpathSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import {
  auditComponentReuse,
  COMPONENT_REUSE_RULE_ID,
  RAW_CONTROL_REUSE_RULE_ID,
} from './component-reuse.js';
import type { VerificationRepairAction } from './diagnostics.js';
import { discoverProject, findWorkspacePackageRoots, type ProjectDiscovery } from './discovery.js';
import type {
  GovernanceComparisonScopeV1,
  GovernanceFindingOccurrenceInputV1,
  GovernanceGitChangeBaseV1,
} from './governance-delta.js';
import { createSourceInventory, normalizeSourcePath } from './source/inventory.js';
import {
  classifyProjectSourceScope,
  isProductionAuthorityPath,
  type ProjectSourceScope,
} from './source/scope.js';
import {
  auditStyleBridgeDrift,
  STYLE_BRIDGE_ARBITRARY_VALUE_RULE_ID,
} from './style-bridge-drift.js';
import type { UIReadinessAxes, UISurfaceItem } from './ui-surfaces.js';

export const CHANGE_ASSURANCE_V1_SCHEMA_URL =
  'https://decantr.ai/schemas/change-assurance-report.v1.json';

export type ChangeAssuranceStatus = 'pass' | 'attention' | 'not_proven';
export type ChangeAssuranceSelectionStrategy = 'explicit' | 'current-directory' | 'changed-files';

export interface ChangeAssuranceSelection {
  strategy: ChangeAssuranceSelectionStrategy;
  evidence: string[];
}

export interface ChangeAssuranceFinding {
  occurrence: GovernanceFindingOccurrenceInputV1;
  evidence: string[];
  suggestedFix: string;
  repair: VerificationRepairAction | null;
}

export interface ChangedUISurfaceResolution {
  changedFiles: string[];
  productionFiles: string[];
  ignoredFiles: Array<{ file: string; scope: ProjectSourceScope }>;
  uiFiles: string[];
  unresolvedFiles: string[];
  impactedSurfaces: UISurfaceItem[];
  routeAuthorityFanOut: boolean;
  stylingAuthorityFanOut: boolean;
}

export interface ChangeAssuranceReportV1 {
  $schema: typeof CHANGE_ASSURANCE_V1_SCHEMA_URL;
  version: '1.0.0';
  generatedAt: string;
  status: ChangeAssuranceStatus;
  project: {
    projectRoot: string;
    workspaceRoot: string;
    selectedAppRoot: string;
    framework: ProjectDiscovery['project']['framework'];
    selection: ChangeAssuranceSelection;
  };
  comparisonScope: GovernanceComparisonScopeV1;
  changeBase: GovernanceGitChangeBaseV1;
  authority: {
    readiness: ProjectDiscovery['surfaces']['status'];
    axes: UIReadinessAxes;
    routeAuthority: ProjectDiscovery['routes']['authority'];
    routeCompleteness: ProjectDiscovery['routes']['completeness'];
    confidence: ProjectDiscovery['confidence'];
  };
  surfaces: ChangedUISurfaceResolution;
  findings: ChangeAssuranceFinding[];
  limitations: string[];
  summary: {
    changedFileCount: number;
    productionFileCount: number;
    ignoredFileCount: number;
    uiFileCount: number;
    unresolvedFileCount: number;
    impactedSurfaceCount: number;
    totalFindingCount: number;
    shownFindingCount: number;
    truncatedFindingCount: number;
  };
}

export interface VerifyUIChangesInput {
  projectRoot: string;
  comparisonScope: GovernanceComparisonScopeV1;
  changeBase: GovernanceGitChangeBaseV1;
  selection?: ChangeAssuranceSelection;
  maxFindings?: number;
  generatedAt?: string;
}

const DIRECT_UI_EXTENSION_RE = /\.(?:astro|css|html|jsx|less|sass|scss|svelte|tsx|vue)$/iu;
const SCRIPT_UI_FILE_RE =
  /(?:^|\/)(?:app|components?|layouts?|pages?|routes?|screens?|ui|views?)\/|(?:\.component|\.page|\.route|\.routes)\.[cm]?[jt]s$/iu;
const ROUTE_TOPOLOGY_FILE_RE =
  /(?:^|\/)(?:app[.-]?routes?|routes?|router|routing)(?:\.[^/]+)?\.[cm]?[jt]sx?$/iu;

function normalizedChangedFiles(files: string[]): string[] {
  return [...new Set(files.map((file) => normalizeSourcePath(file).replace(/^\.\//u, '')))]
    .filter((file) => file.length > 0 && file !== '.')
    .sort();
}

function isChanged(changedFiles: Set<string>, file: string): boolean {
  return changedFiles.has(normalizeSourcePath(file).replace(/^\.\//u, ''));
}

function packageName(specifier: string): string | null {
  if (specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('#')) {
    return null;
  }
  const segments = specifier.split('/').filter(Boolean);
  if (segments.length === 0) return null;
  if (specifier.startsWith('@')) {
    return segments.length >= 2 ? `${segments[0]}/${segments[1]}` : null;
  }
  return segments[0] ?? null;
}

interface ComponentAuditScope {
  auditRoot: string;
  sourceFiles: string[];
  changedFiles: Set<string>;
  selectedAppPrefix: string;
}

function resolveComponentAuditScope(
  projectRoot: string,
  discovery: ProjectDiscovery,
  sourceFiles: string[],
  changedFiles: Set<string>,
): ComponentAuditScope {
  const workspaceRoot = realpathSync(resolve(discovery.workspace.workspaceRoot));
  if (workspaceRoot === projectRoot) {
    return { auditRoot: projectRoot, sourceFiles, changedFiles, selectedAppPrefix: '' };
  }

  const appAudit = auditComponentReuse(projectRoot, sourceFiles);
  const referencedPackageNames = new Set([
    ...Object.keys(discovery.project.dependencies),
    ...appAudit.imports
      .map((reference) => packageName(reference.source))
      .filter((name): name is string => Boolean(name)),
  ]);
  const workspacePackages = findWorkspacePackageRoots(workspaceRoot);
  const authorityRoots = [...referencedPackageNames]
    .map((name) => workspacePackages.get(name))
    .filter((root): root is string => Boolean(root))
    .filter((root) => root !== workspaceRoot && root !== projectRoot)
    .sort();

  if (authorityRoots.length === 0) {
    return { auditRoot: projectRoot, sourceFiles, changedFiles, selectedAppPrefix: '' };
  }

  const authorityInventory = createSourceInventory(workspaceRoot, {
    roots: authorityRoots,
    maxFiles: 5000,
  });
  const selectedAppPrefix = normalizeSourcePath(relative(workspaceRoot, projectRoot));
  const workspaceChangedFiles = new Set(
    [...changedFiles].map((file) => normalizeSourcePath(`${selectedAppPrefix}/${file}`)),
  );

  return {
    auditRoot: workspaceRoot,
    sourceFiles: [
      ...new Set([...sourceFiles, ...authorityInventory.files.map((file) => file.absolutePath)]),
    ],
    changedFiles: workspaceChangedFiles,
    selectedAppPrefix,
  };
}

function componentDisplayPath(file: string, selectedAppPrefix: string): string {
  const normalized = normalizeSourcePath(file).replace(/^\.\//u, '');
  if (!selectedAppPrefix) return normalized;
  const prefix = `${selectedAppPrefix}/`;
  return normalized.startsWith(prefix) ? normalized.slice(prefix.length) : normalized;
}

function isLikelyUIFile(file: string, knownFiles: Set<string>): boolean {
  return knownFiles.has(file) || DIRECT_UI_EXTENSION_RE.test(file) || SCRIPT_UI_FILE_RE.test(file);
}

function dedupeSurfaces(surfaces: UISurfaceItem[]): UISurfaceItem[] {
  return [...new Map(surfaces.map((surface) => [surface.id, surface])).values()].sort(
    (left, right) => left.id.localeCompare(right.id),
  );
}

export function resolveChangedUISurfaces(
  discovery: ProjectDiscovery,
  changedFilesInput: string[],
): ChangedUISurfaceResolution {
  const changedFiles = normalizedChangedFiles(changedFilesInput);
  const productionFiles = changedFiles.filter(isProductionAuthorityPath);
  const ignoredFiles = changedFiles
    .filter((file) => !isProductionAuthorityPath(file))
    .map((file) => ({ file, scope: classifyProjectSourceScope(file) }));
  const routeAuthorityFiles = new Set(discovery.routes.authorityFiles.map(normalizeSourcePath));
  const stylingAuthorityFiles = new Set(discovery.styling.authorityFiles.map(normalizeSourcePath));
  const directlyMappedFiles = new Set(
    discovery.surfaces.items.flatMap((surface) => surface.files.map(normalizeSourcePath)),
  );
  const knownUIFiles = new Set([
    ...directlyMappedFiles,
    ...routeAuthorityFiles,
    ...stylingAuthorityFiles,
    ...discovery.components.items.map((component) => normalizeSourcePath(component.file)),
  ]);
  const uiFiles = productionFiles.filter((file) => isLikelyUIFile(file, knownUIFiles));
  const unresolvedFiles = uiFiles.filter((file) => !knownUIFiles.has(file));
  const routeAuthorityFanOut = uiFiles.some(
    (file) => routeAuthorityFiles.has(file) && ROUTE_TOPOLOGY_FILE_RE.test(file),
  );
  const stylingAuthorityFanOut = uiFiles.some((file) => stylingAuthorityFiles.has(file));
  const directlyImpacted = discovery.surfaces.items.filter((surface) =>
    surface.files.some((file) => uiFiles.includes(normalizeSourcePath(file))),
  );
  const fanOut =
    routeAuthorityFanOut || stylingAuthorityFanOut
      ? discovery.surfaces.items.filter(
          (surface) =>
            surface.scope === 'production' ||
            surface.scope === 'package' ||
            surface.scope === 'runtime',
        )
      : [];

  return {
    changedFiles,
    productionFiles,
    ignoredFiles,
    uiFiles,
    unresolvedFiles,
    impactedSurfaces: dedupeSurfaces([...directlyImpacted, ...fanOut]).slice(0, 100),
    routeAuthorityFanOut,
    stylingAuthorityFanOut,
  };
}

function occurrence(input: {
  code: string;
  ruleId: string;
  category: string;
  severity: 'error' | 'warn' | 'info';
  message: string;
  authorityLane: GovernanceFindingOccurrenceInputV1['authorityLane'];
  file: string;
  line: number;
  target?: string | null;
  repair?: VerificationRepairAction | null;
  repairTarget?: string | null;
}): GovernanceFindingOccurrenceInputV1 {
  return {
    code: input.code,
    ruleId: input.ruleId,
    source: 'change-assurance',
    category: input.category,
    severity: input.severity,
    message: input.message,
    authorityLane: input.authorityLane,
    graphAnchor: null,
    repairId: input.repair?.id ?? null,
    repairTarget: input.repairTarget ?? input.file,
    annotation: {
      path: input.file,
      startLine: input.line,
      startColumn: null,
      endLine: input.line,
      endColumn: null,
    },
    file: input.file,
    route: null,
    target: input.target ?? null,
    location: { line: input.line },
  };
}

function componentFindings(scope: ComponentAuditScope): ChangeAssuranceFinding[] {
  const audit = auditComponentReuse(scope.auditRoot, scope.sourceFiles);
  const findings: ChangeAssuranceFinding[] = [];
  for (const finding of audit.findings) {
    if (!isChanged(scope.changedFiles, finding.file)) continue;
    const file = componentDisplayPath(finding.file, scope.selectedAppPrefix);
    const canonicalFile = componentDisplayPath(finding.canonicalFile, scope.selectedAppPrefix);
    const repair: VerificationRepairAction = {
      id: 'import-existing-component',
      payload: {
        component: finding.name,
        file,
        canonical_file: canonicalFile,
      },
    };
    findings.push({
      occurrence: occurrence({
        code: 'COMP001',
        ruleId: COMPONENT_REUSE_RULE_ID,
        category: 'Component Reuse',
        severity: 'warn',
        message: `${finding.name} is reimplemented locally even though the project already exports it from ${canonicalFile}.`,
        authorityLane: 'production-source',
        file,
        line: finding.line,
        target: finding.name,
        repair,
        repairTarget: canonicalFile,
      }),
      evidence: [
        `${file}:${finding.line} declares local ${finding.name}`,
        `${canonicalFile}:${finding.canonicalLine} already exports reusable ${finding.name}`,
      ],
      suggestedFix: `Import ${finding.name} from ${canonicalFile} instead of redefining it in ${file}.`,
      repair,
    });
  }
  for (const finding of audit.rawControlFindings) {
    if (!isChanged(scope.changedFiles, finding.file)) continue;
    const file = componentDisplayPath(finding.file, scope.selectedAppPrefix);
    const canonicalFile = componentDisplayPath(finding.canonicalFile, scope.selectedAppPrefix);
    const repair: VerificationRepairAction = {
      id: 'replace-raw-control-with-local-component',
      payload: {
        component: finding.component,
        element: finding.element,
        file,
        canonical_file: canonicalFile,
      },
    };
    findings.push({
      occurrence: occurrence({
        code: 'COMP010',
        ruleId: RAW_CONTROL_REUSE_RULE_ID,
        category: 'Component Reuse',
        severity: 'warn',
        message: `${file} renders raw <${finding.element}> even though ${canonicalFile} is the project-owned ${finding.component}.`,
        authorityLane: 'production-source',
        file,
        line: finding.line,
        target: finding.component,
        repair,
        repairTarget: canonicalFile,
      }),
      evidence: [
        `${file}:${finding.line} renders raw <${finding.element}>`,
        `${canonicalFile}:${finding.canonicalLine} already exports reusable ${finding.component}`,
      ],
      suggestedFix: `Use ${finding.component} from ${canonicalFile} instead of raw <${finding.element}> in ${file}.`,
      repair,
    });
  }
  return findings;
}

function styleFindings(
  projectRoot: string,
  sourceFiles: string[],
  changedFiles: Set<string>,
): ChangeAssuranceFinding[] {
  const audit = auditStyleBridgeDrift(projectRoot, sourceFiles);
  return audit.findings
    .filter((finding) => isChanged(changedFiles, finding.file))
    .map((finding) => {
      const repair: VerificationRepairAction = {
        id: 'replace-arbitrary-style-with-bridge-token',
        payload: {
          file: finding.file,
          line: finding.line,
          value: finding.value,
          source: finding.source,
          property: finding.property,
          bridge_mappings: finding.bridgeMappingIds,
          bridge_confidence: finding.bridgeConfidence,
          bridge_sources: finding.bridgeSources,
          token_hints: finding.tokenHints,
          class_hints: finding.classHints,
        },
      };
      return {
        occurrence: occurrence({
          code: 'TOKEN010',
          ruleId: STYLE_BRIDGE_ARBITRARY_VALUE_RULE_ID,
          category: 'Style Bridge',
          severity: 'warn',
          message: `${finding.file} introduces ${finding.value} outside the accepted project style authority.`,
          authorityLane: 'style-bridge',
          file: finding.file,
          line: finding.line,
          target: finding.value,
          repair,
        }),
        evidence: finding.evidence,
        suggestedFix:
          'Use an accepted project token or class from .decantr/style-bridge.json, or explicitly update the bridge if the new value is approved authority.',
        repair,
      };
    });
}

function authorityFindings(
  discovery: ProjectDiscovery,
  surfaces: ChangedUISurfaceResolution,
): ChangeAssuranceFinding[] {
  const findings: ChangeAssuranceFinding[] = surfaces.unresolvedFiles.map((file) => ({
    occurrence: occurrence({
      code: 'AUTH001',
      ruleId: 'changed-ui-surface-unresolved',
      category: 'UI Authority',
      severity: 'warn',
      message: `${file} looks like production UI source but is not represented by the discovered UI surface map.`,
      authorityLane: 'production-source',
      file,
      line: 1,
    }),
    evidence: [
      `${file} is production-scoped UI source.`,
      'No route, layout, component, styling-authority, or other taskable surface references this file.',
    ],
    suggestedFix:
      'Confirm the selected app and framework adapter. Do not treat this change as route-scoped until Decantr can resolve the file to a production UI surface.',
    repair: null,
  }));

  if (
    surfaces.routeAuthorityFanOut &&
    (discovery.routes.authority !== 'proven' || discovery.routes.completeness !== 'complete')
  ) {
    const normalizedAuthorityFiles = new Set(
      discovery.routes.authorityFiles.map(normalizeSourcePath),
    );
    const file = surfaces.uiFiles.find((entry) => normalizedAuthorityFiles.has(entry));
    if (file) {
      findings.push({
        occurrence: occurrence({
          code: 'AUTH010',
          ruleId: 'route-authority-not-proven',
          category: 'UI Authority',
          severity: 'warn',
          message: `${file} changes routing authority, but route extraction is ${discovery.routes.authority}/${discovery.routes.completeness}.`,
          authorityLane: 'production-source',
          file,
          line: 1,
        }),
        evidence: [
          `Route authority: ${discovery.routes.authority}`,
          `Route completeness: ${discovery.routes.completeness}`,
          ...discovery.routes.limitations.slice(0, 3),
        ],
        suggestedFix:
          'Treat the route impact as not proven. Select the correct app or improve the framework route adapter before using route-scoped context as a gate.',
        repair: null,
      });
    }
  }
  return findings;
}

function findingSort(left: ChangeAssuranceFinding, right: ChangeAssuranceFinding): number {
  const severity = { error: 0, warn: 1, info: 2 } as const;
  return (
    severity[left.occurrence.severity] - severity[right.occurrence.severity] ||
    left.occurrence.code.localeCompare(right.occurrence.code) ||
    (left.occurrence.file ?? '').localeCompare(right.occurrence.file ?? '') ||
    (left.occurrence.location?.line ?? 0) - (right.occurrence.location?.line ?? 0)
  );
}

export function verifyUIChanges(input: VerifyUIChangesInput): ChangeAssuranceReportV1 {
  const projectRoot = realpathSync(resolve(input.projectRoot));
  const discovery = discoverProject(projectRoot);
  const surfaces = resolveChangedUISurfaces(discovery, input.changeBase.changedFiles);
  const inventory = createSourceInventory(projectRoot);
  const sourceFiles = inventory.files.map((file) => file.absolutePath);
  const changedFiles = new Set(surfaces.uiFiles);
  const componentAuditScope = resolveComponentAuditScope(
    projectRoot,
    discovery,
    sourceFiles,
    changedFiles,
  );
  const allFindings = [
    ...authorityFindings(discovery, surfaces),
    ...componentFindings(componentAuditScope),
    ...styleFindings(projectRoot, sourceFiles, changedFiles),
  ].sort(findingSort);
  const maxFindings = Math.max(1, Math.min(input.maxFindings ?? 3, 20));
  const findings = allFindings.slice(0, maxFindings);
  const limitations = [...new Set(input.changeBase.limitations)];
  if (surfaces.uiFiles.length > 0) {
    limitations.push(
      'This static diff pass did not execute project tests, browser interactions, visual comparisons, or accessibility tooling.',
    );
  }
  if (
    surfaces.uiFiles.length > 0 &&
    discovery.project.framework !== 'react' &&
    discovery.project.framework !== 'nextjs'
  ) {
    limitations.push(
      `Primitive-reuse findings do not yet have ${discovery.project.framework} template parity; authority and surface scoping still apply.`,
    );
  }
  if (surfaces.ignoredFiles.length > 0) {
    limitations.push(
      `${surfaces.ignoredFiles.length} non-production changed file(s) were excluded from UI authority.`,
    );
  }
  const authorityNotProven = allFindings.some((finding) =>
    finding.occurrence.code.startsWith('AUTH'),
  );
  const status: ChangeAssuranceStatus =
    input.changeBase.completeness === 'incomplete' || authorityNotProven
      ? 'not_proven'
      : allFindings.length > 0
        ? 'attention'
        : 'pass';

  return {
    $schema: CHANGE_ASSURANCE_V1_SCHEMA_URL,
    version: '1.0.0',
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    status,
    project: {
      projectRoot,
      workspaceRoot: discovery.workspace.workspaceRoot,
      selectedAppRoot: discovery.workspace.projectPath,
      framework: discovery.project.framework,
      selection: input.selection ?? {
        strategy: 'current-directory',
        evidence: ['The current working directory was used as the selected app.'],
      },
    },
    comparisonScope: input.comparisonScope,
    changeBase: {
      ...input.changeBase,
      changedFiles: surfaces.changedFiles,
    },
    authority: {
      readiness: discovery.surfaces.status,
      axes: discovery.surfaces.axes,
      routeAuthority: discovery.routes.authority,
      routeCompleteness: discovery.routes.completeness,
      confidence: discovery.confidence,
    },
    surfaces,
    findings,
    limitations,
    summary: {
      changedFileCount: surfaces.changedFiles.length,
      productionFileCount: surfaces.productionFiles.length,
      ignoredFileCount: surfaces.ignoredFiles.length,
      uiFileCount: surfaces.uiFiles.length,
      unresolvedFileCount: surfaces.unresolvedFiles.length,
      impactedSurfaceCount: surfaces.impactedSurfaces.length,
      totalFindingCount: allFindings.length,
      shownFindingCount: findings.length,
      truncatedFindingCount: Math.max(0, allFindings.length - findings.length),
    },
  };
}
