import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { basename, dirname, join, relative } from 'node:path';
import type { BlueprintPage, EssenceFile, EssenceV4, GuardViolation } from '@decantr/essence-spec';
import { evaluateGuard, isV4, validateEssence } from '@decantr/essence-spec';
import type {
  ArchetypeRole,
  ComposeEntry,
  ContentIntelligenceSource,
  Pattern,
} from '@decantr/registry';
import {
  isContentIntelligenceSource,
  patternToDiscoveryCandidate,
  rankPatternCandidates,
  resolvePatternPreset,
} from '@decantr/registry';
import type {
  ContractAssertion,
  EvidenceBundle,
  ProjectAuditReport,
  ProjectHealthFinding,
  ProjectHealthFindingSource,
  ProjectHealthReport,
  ProjectHealthStatus,
  VerificationFinding,
  VerificationSeverity,
} from '@decantr/verifier';
import type { DriftLogEntry } from './helpers.js';
import {
  fuzzyScore,
  getAPIClient,
  getPublicAPIClient,
  mutateEssenceFile,
  readDriftLog,
  readEssenceFile,
  resolveWorkspacePath,
  validateStringArg,
  writeDriftLog,
} from './helpers.js';

// ── Inline topology derivation (lightweight version of cli/scaffold.ts) ──

interface ZoneInput {
  archetypeId: string;
  role: ArchetypeRole;
  shell: string;
  features: string[];
  description: string;
}

interface ComposedZone {
  role: ArchetypeRole;
  archetypes: string[];
  shell: string;
  features: string[];
  descriptions: string[];
}

interface ZoneTransition {
  from: string;
  to: string;
  type: string;
  trigger: string;
}

interface RegistryPatternListItem {
  slug?: string;
  name?: string;
  description?: string;
}

interface PackManifestEntry {
  id: string;
  markdown: string;
  json: string;
}

interface PackManifest {
  $schema?: string;
  version: string;
  generatedAt: string;
  scaffold: PackManifestEntry | null;
  review?: PackManifestEntry | null;
  sections: Array<PackManifestEntry & { pageIds: string[] }>;
  pages: Array<PackManifestEntry & { sectionId: string | null; sectionRole: string | null }>;
  mutations?: Array<PackManifestEntry & { mutationType: string }>;
}

function readJsonIfExists<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function changedFilesForTask(projectRoot: string): string[] {
  const changed = new Set<string>();
  try {
    // Security: fixed argv, shell disabled, and cwd is the already-resolved project root.
    for (const args of [
      ['diff', '--name-only'],
      ['diff', '--name-only', '--cached'],
    ]) {
      const output = execFileSync('git', args, {
        cwd: projectRoot,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      for (const entry of output.split(/\r?\n/)) {
        const file = entry.trim();
        if (file) changed.add(file);
      }
    }
  } catch {
    // MCP may run outside a git repository.
  }
  return [...changed].sort();
}

function impactedRoutesForFiles(projectRoot: string, files: string[]): string[] {
  const analysis = readJsonIfExists<{
    routes?: { routes?: Array<{ path?: string; file?: string }> };
  }>(join(projectRoot, '.decantr', 'analysis.json'));
  const routeEntries = analysis?.routes?.routes ?? [];
  const impacted = new Set<string>();
  for (const file of files) {
    for (const route of routeEntries) {
      if (route.file && (file === route.file || file.endsWith(route.file))) {
        if (route.path) impacted.add(route.path);
      }
    }
  }
  return [...impacted].sort();
}

function localLawSummary(projectRoot: string) {
  const patterns = readJsonIfExists<{
    patterns?: Array<{ id?: string; role?: string; componentPaths?: string[] }>;
  }>(join(projectRoot, '.decantr', 'local-patterns.json'));
  const rules = readJsonIfExists<{
    rules?: Array<{ id?: string; enabled?: boolean; severity?: string; description?: string }>;
  }>(join(projectRoot, '.decantr', 'rules.json'));

  return {
    patterns_path: patterns ? '.decantr/local-patterns.json' : null,
    rules_path: rules ? '.decantr/rules.json' : null,
    patterns:
      patterns?.patterns?.map((pattern) => ({
        id: pattern.id ?? 'unknown',
        role: pattern.role ?? null,
        component_paths: pattern.componentPaths ?? [],
      })) ?? [],
    rules:
      rules?.rules?.map((rule) => ({
        id: rule.id ?? 'unknown',
        enabled: rule.enabled ?? false,
        severity: rule.severity ?? 'warn',
        description: rule.description ?? null,
      })) ?? [],
  };
}

function mentionsWord(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
}

function taskAuthoritySummary(input: {
  workflowMode: string | null;
  adoptionMode: string | null;
  localLaw: ReturnType<typeof localLawSummary>;
  hasPackManifest: boolean;
  task: string;
}) {
  const hasLocalLaw = input.localLaw.patterns.length > 0 || input.localLaw.rules.length > 0;
  let lane = 'Brownfield contract-only';
  let sourceAuthority = 'Existing app is authoritative; Decantr supplies contract context.';
  let styleAuthority = 'Use the existing styling system.';
  const activeAuthorities = ['existing source', 'Essence V4 contract'];

  if (input.workflowMode === 'hybrid-compose') {
    lane = 'Hybrid composition';
    sourceAuthority = 'Existing app plus selected Decantr/local law are authoritative.';
  } else if (input.workflowMode === 'brownfield-attach' && input.adoptionMode === 'decantr-css') {
    lane = 'Hybrid with Decantr CSS';
    sourceAuthority =
      'Existing app remains authoritative except where Decantr CSS is explicitly adopted.';
    styleAuthority = 'Decantr CSS runtime is active where adopted.';
    activeAuthorities.push('Decantr CSS runtime');
  } else if (input.workflowMode === 'brownfield-attach' && input.adoptionMode === 'style-bridge') {
    lane = 'Hybrid style bridge';
    sourceAuthority =
      'Existing app remains authoritative; Decantr intent maps through the style bridge.';
    styleAuthority = 'Use bridge tokens/classes as a mapping layer onto the app styling system.';
    activeAuthorities.push('style bridge');
  } else if (input.workflowMode === 'brownfield-attach' && hasLocalLaw) {
    lane = 'Hybrid local law';
    sourceAuthority = 'Existing app plus accepted project-owned UI law are authoritative.';
    styleAuthority = 'Use project-owned components, tokens, classes, and accepted local rules.';
  } else if (input.workflowMode?.startsWith('greenfield')) {
    lane =
      input.workflowMode === 'greenfield-contract-only'
        ? 'Greenfield contract-only'
        : 'Greenfield scaffold';
    sourceAuthority = 'Essence V4 and generated context are authoritative.';
    styleAuthority =
      input.adoptionMode === 'contract-only'
        ? 'Use the project-chosen styling system.'
        : 'Use Decantr CSS where generated by the adapter.';
  }

  if (hasLocalLaw) activeAuthorities.push('accepted local patterns/rules');
  if (input.hasPackManifest) activeAuthorities.push('hosted execution packs as guidance');

  const warnings: string[] = [];
  const task = input.task;
  for (const term of ['angular', 'vue', 'svelte', 'solid', 'bootstrap', 'shadcn']) {
    if (mentionsWord(task, term)) {
      warnings.push(
        `Task mentions ${term}; treat it as optional Hybrid guidance unless this workspace already owns that runtime/library or the user explicitly asks for a reviewed adoption plan.`,
      );
    }
  }
  if (
    input.adoptionMode !== 'decantr-css' &&
    (/@decantr\/css/i.test(task) || /\bdecantr css\b/i.test(task) || /\bd-[a-z0-9-]+/i.test(task))
  ) {
    warnings.push(
      'This project is not in decantr-css adoption mode. Do not add @decantr/css or d-* classes unless the user explicitly changes adoption mode.',
    );
  }

  return {
    lane,
    source_authority: sourceAuthority,
    style_authority: styleAuthority,
    active_authorities: activeAuthorities,
    runtime_boundary:
      'Preserve the current workspace runtime unless the task is explicitly a reviewed migration or isolated integration plan.',
    warnings,
  };
}

function extractPatternIdsFromLayoutItem(item: unknown, ids: Set<string>): void {
  if (typeof item === 'string') {
    ids.add(item);
    return;
  }
  if (!item || typeof item !== 'object') return;
  const record = item as Record<string, unknown>;
  if (typeof record.pattern === 'string') ids.add(record.pattern);
  if (Array.isArray(record.cols)) {
    for (const col of record.cols) extractPatternIdsFromLayoutItem(col, ids);
  }
}

function extractPagePatternIds(page: BlueprintPage | null): string[] {
  if (!page) return [];
  const ids = new Set<string>();
  for (const item of page.layout ?? []) extractPatternIdsFromLayoutItem(item, ids);
  return [...ids].sort();
}

function summarizePackJson(pack: unknown): {
  directives: unknown[];
  patterns: unknown[];
  visualTarget: string | null;
  sharedComponents: unknown[];
} {
  if (!pack || typeof pack !== 'object') {
    return { directives: [], patterns: [], visualTarget: null, sharedComponents: [] };
  }
  const record = pack as Record<string, unknown>;
  const data =
    record.data && typeof record.data === 'object'
      ? (record.data as Record<string, unknown>)
      : record;
  const patterns = Array.isArray(data.patterns) ? data.patterns : [];
  const directives = Array.isArray(data.directives) ? data.directives : [];
  const sharedComponents = Array.isArray(data.sharedComponents)
    ? data.sharedComponents
    : Array.isArray(data.shared_components)
      ? data.shared_components
      : [];
  const visualTarget =
    typeof data.visualTarget === 'string'
      ? data.visualTarget
      : typeof data.visual_target === 'string'
        ? data.visual_target
        : null;
  return { directives, patterns, visualTarget, sharedComponents };
}

function routeSlug(route: string): string {
  return (
    route
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'root'
  );
}

async function getShowcaseBenchmarkPayload(view: string) {
  const client = getPublicAPIClient();

  if (view === 'manifest') {
    return client.getShowcaseManifest();
  }

  if (view === 'verification') {
    return client.getShowcaseShortlistVerification();
  }

  return client.getShowcaseShortlist();
}

async function getRegistryIntelligenceSummaryPayload(namespace?: string) {
  const client = getPublicAPIClient();
  return client.getRegistryIntelligenceSummary(namespace ? { namespace } : undefined);
}

async function getHostedExecutionPackBundlePayload(args: Record<string, unknown>) {
  const client = getPublicAPIClient();
  const essence = (() => {
    if (typeof args.essence === 'object' && args.essence !== null && !Array.isArray(args.essence)) {
      return args.essence as EssenceFile;
    }
    return readEssenceFile(args.path as string | undefined);
  })();

  return client.compileExecutionPacks(
    essence,
    typeof args.namespace === 'string' ? { namespace: args.namespace } : undefined,
  );
}

async function getHostedSelectedExecutionPackPayload(args: Record<string, unknown>) {
  const client = getPublicAPIClient();
  const essence = (() => {
    if (typeof args.essence === 'object' && args.essence !== null && !Array.isArray(args.essence)) {
      return args.essence as EssenceFile;
    }
    return readEssenceFile(args.path as string | undefined);
  })();

  return client.selectExecutionPack(
    {
      essence,
      pack_type: args.pack_type as 'scaffold' | 'review' | 'section' | 'page' | 'mutation',
      ...(typeof args.id === 'string' ? { id: args.id } : {}),
    },
    typeof args.namespace === 'string' ? { namespace: args.namespace } : undefined,
  );
}

async function getHostedExecutionPackManifestPayload(args: Record<string, unknown>) {
  const client = getPublicAPIClient();
  const essence = (() => {
    if (typeof args.essence === 'object' && args.essence !== null && !Array.isArray(args.essence)) {
      return args.essence as EssenceFile;
    }
    return readEssenceFile(args.path as string | undefined);
  })();

  return client.getExecutionPackManifest(
    essence,
    typeof args.namespace === 'string' ? { namespace: args.namespace } : undefined,
  );
}

async function getHostedFileCritiquePayload(args: Record<string, unknown>) {
  const client = getAPIClient();
  const filePath = args.file_path as string;
  const resolvedFilePath = resolveWorkspacePath(filePath);
  const snapshotFilePath =
    relative(process.cwd(), resolvedFilePath).replace(/\\/g, '/') || basename(resolvedFilePath);
  const code = await readFile(resolvedFilePath, 'utf-8');
  const { essence } = await readEssenceFile(args.path as string | undefined);
  const treatmentsPath =
    typeof args.treatments_path === 'string'
      ? resolveWorkspacePath(args.treatments_path)
      : join(process.cwd(), 'src', 'styles', 'treatments.css');
  const treatmentsCss = existsSync(treatmentsPath)
    ? readFileSync(treatmentsPath, 'utf-8')
    : undefined;

  return client.critiqueFile(
    {
      essence,
      filePath: snapshotFilePath,
      code,
      treatmentsCss,
    },
    typeof args.namespace === 'string' ? { namespace: args.namespace } : undefined,
  );
}

function extractHostedAssetPaths(indexHtml: string): string[] {
  const assetPaths = new Set<string>();

  for (const match of indexHtml.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"]+)"/g)) {
    const assetPath = match[1];
    const assetsIndex = assetPath.indexOf('/assets/');
    if (assetsIndex === -1) continue;
    assetPaths.add(assetPath.slice(assetsIndex));
  }

  return [...assetPaths];
}

async function captureHostedDistSnapshot(projectRoot: string, distPathArg?: string) {
  const distRoot = distPathArg
    ? resolveWorkspacePath(distPathArg, projectRoot)
    : join(projectRoot, 'dist');
  const indexPath = join(distRoot, 'index.html');

  if (!existsSync(indexPath)) {
    return undefined;
  }

  const indexHtml = readFileSync(indexPath, 'utf-8');
  const assets: Record<string, string> = {};

  for (const assetPath of extractHostedAssetPaths(indexHtml)) {
    const snapshotAssetPath = assetPath.replace(/^[/\\]+/, '');
    const assetFilePath = resolveWorkspacePath(snapshotAssetPath, distRoot);
    if (existsSync(assetFilePath)) {
      assets[snapshotAssetPath] = readFileSync(assetFilePath, 'utf-8');
    }
  }

  return {
    indexHtml,
    assets,
  };
}

function isHostedSourceSnapshotFile(path: string): boolean {
  if (/\.d\.ts$/i.test(path)) return false;
  return /\.(?:[cm]?[jt]sx?)$/i.test(path);
}

async function captureHostedSourceSnapshot(projectRoot: string, sourcesPathArg?: string) {
  if (!sourcesPathArg) {
    return undefined;
  }

  const sourcesRoot = resolveWorkspacePath(sourcesPathArg, projectRoot);
  if (!existsSync(sourcesRoot)) {
    return undefined;
  }

  const files: Record<string, string> = {};
  const ignoredDirNames = new Set([
    'node_modules',
    '.git',
    '.decantr',
    'dist',
    'build',
    'coverage',
  ]);
  const rootPrefix = basename(sourcesRoot);

  const walk = (absoluteDir: string, relativeDir: string) => {
    for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
      if (ignoredDirNames.has(entry.name)) continue;
      const absolutePath = join(absoluteDir, entry.name);
      const relativePath = join(relativeDir, entry.name).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        walk(absolutePath, relativePath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!isHostedSourceSnapshotFile(relativePath)) continue;
      files[relativePath] = readFileSync(absolutePath, 'utf-8');
    }
  };

  walk(sourcesRoot, rootPrefix);
  return Object.keys(files).length > 0 ? { files } : undefined;
}

async function getHostedProjectAuditPayload(args: Record<string, unknown>) {
  const client = getAPIClient();
  const { essence } = await readEssenceFile(args.path as string | undefined);
  const dist = await captureHostedDistSnapshot(process.cwd(), args.dist_path as string | undefined);
  const sources = await captureHostedSourceSnapshot(
    process.cwd(),
    args.sources_path as string | undefined,
  );

  return client.auditProject(
    {
      essence,
      dist,
      sources,
    },
    typeof args.namespace === 'string' ? { namespace: args.namespace } : undefined,
  );
}

type HostedExecutionPackBundle = Awaited<ReturnType<typeof getHostedExecutionPackBundlePayload>>;
type HostedSelectedExecutionPack = Awaited<
  ReturnType<typeof getHostedSelectedExecutionPackPayload>
>;
type HostedExecutionPackManifest = Awaited<
  ReturnType<typeof getHostedExecutionPackManifestPayload>
>;
type PackSource = 'local' | 'hosted_fallback';

async function loadHostedExecutionPackBundleFallback(args: Record<string, unknown>): Promise<{
  bundle: HostedExecutionPackBundle | null;
  error: string | null;
}> {
  try {
    return {
      bundle: await getHostedExecutionPackBundlePayload(args),
      error: null,
    };
  } catch (error) {
    return {
      bundle: null,
      error: (error as Error).message,
    };
  }
}

async function loadHostedExecutionPackManifestFallback(args: Record<string, unknown>): Promise<{
  manifest: HostedExecutionPackManifest | null;
  error: string | null;
}> {
  try {
    return {
      manifest: await getHostedExecutionPackManifestPayload(args),
      error: null,
    };
  } catch (error) {
    return {
      manifest: null,
      error: (error as Error).message,
    };
  }
}

async function loadHostedSelectedExecutionPackFallback(args: Record<string, unknown>): Promise<{
  selected: HostedSelectedExecutionPack | null;
  error: string | null;
}> {
  try {
    return {
      selected: await getHostedSelectedExecutionPackPayload(args),
      error: null,
    };
  } catch (error) {
    return {
      selected: null,
      error: (error as Error).message,
    };
  }
}

async function loadHostedSelectedExecutionPackByType(
  args: Record<string, unknown>,
  packType: 'scaffold' | 'review' | 'section' | 'page' | 'mutation',
  id?: string,
): Promise<{
  selected: HostedSelectedExecutionPack | null;
  error: string | null;
}> {
  const selectedArgs: Record<string, unknown> = {
    ...args,
    pack_type: packType,
  };

  delete selectedArgs.id;
  if (typeof id === 'string') {
    selectedArgs.id = id;
  }

  return loadHostedSelectedExecutionPackFallback(selectedArgs);
}

async function loadHostedFileCritiqueFallback(args: Record<string, unknown>): Promise<{
  report: Awaited<ReturnType<typeof getHostedFileCritiquePayload>> | null;
  error: string | null;
}> {
  try {
    return {
      report: await getHostedFileCritiquePayload(args),
      error: null,
    };
  } catch (error) {
    return {
      report: null,
      error: (error as Error).message,
    };
  }
}

async function loadHostedProjectAuditFallback(args: Record<string, unknown>): Promise<{
  report: Awaited<ReturnType<typeof getHostedProjectAuditPayload>> | null;
  error: string | null;
}> {
  try {
    return {
      report: await getHostedProjectAuditPayload(args),
      error: null,
    };
  } catch (error) {
    return {
      report: null,
      error: (error as Error).message,
    };
  }
}

function hasExecutionPackPayload(payload: {
  markdown: string | null;
  json: unknown | null;
}): boolean {
  return payload.markdown !== null || payload.json !== null;
}

function allowsHostedUpload(args: Record<string, unknown>): boolean {
  // Hosted critique/audit upload is explicit opt-in; local MCP critique stays local by default.
  return args.allow_hosted_upload === true;
}

function toHostedExecutionPackPayload(pack: { renderedMarkdown?: string } | null | undefined) {
  return {
    markdown: pack && typeof pack.renderedMarkdown === 'string' ? pack.renderedMarkdown : null,
    json: pack ?? null,
  };
}

function findHostedSectionPack(bundle: HostedExecutionPackBundle, sectionId: string) {
  return bundle.sections.find((section) => section.data.sectionId === sectionId) ?? null;
}

function findHostedPagePack(bundle: HostedExecutionPackBundle, pageId: string) {
  return bundle.pages.find((page) => page.data.pageId === pageId) ?? null;
}

function findHostedMutationPack(bundle: HostedExecutionPackBundle, mutationId: string) {
  return bundle.mutations.find((mutation) => mutation.data.mutationType === mutationId) ?? null;
}

function findManifestEntryForPack(
  manifest: PackManifest,
  packType: 'scaffold' | 'review' | 'section' | 'page' | 'mutation',
  id?: string,
): PackManifestEntry | null {
  switch (packType) {
    case 'scaffold':
      return manifest.scaffold;
    case 'review':
      return manifest.review ?? null;
    case 'section':
      return id ? (manifest.sections.find((section) => section.id === id) ?? null) : null;
    case 'page':
      return id ? (manifest.pages.find((page) => page.id === id) ?? null) : null;
    case 'mutation':
      return id
        ? ((manifest.mutations ?? []).find((mutation) => mutation.id === id) ?? null)
        : null;
    default:
      return null;
  }
}

const ZONE_ORDER: ArchetypeRole[] = ['public', 'gateway', 'primary', 'auxiliary'];

function deriveZones(inputs: ZoneInput[]): ComposedZone[] {
  const zoneMap = new Map<ArchetypeRole, ComposedZone>();

  for (const input of inputs) {
    const existing = zoneMap.get(input.role);
    if (existing) {
      existing.archetypes.push(input.archetypeId);
      existing.features.push(...input.features);
      existing.descriptions.push(input.description);
    } else {
      zoneMap.set(input.role, {
        role: input.role,
        archetypes: [input.archetypeId],
        shell: input.shell,
        features: [...input.features],
        descriptions: [input.description],
      });
    }
  }

  for (const zone of zoneMap.values()) {
    zone.features = [...new Set(zone.features)];
  }

  return ZONE_ORDER.filter((role) => zoneMap.has(role)).map((role) => zoneMap.get(role)!);
}

const GATEWAY_TRIGGER_MAP: Record<string, string> = {
  auth: 'authentication',
  login: 'authentication',
  mfa: 'authentication',
  payment: 'payment',
  subscription: 'payment',
  checkout: 'payment',
  onboarding: 'onboarding',
  'setup-wizard': 'onboarding',
  welcome: 'onboarding',
  invite: 'invitation',
  'access-code': 'invitation',
};

function resolveGatewayTrigger(features: string[]): string {
  for (const feature of features) {
    const trigger = GATEWAY_TRIGGER_MAP[feature];
    if (trigger) return trigger;
  }
  return 'authentication';
}

function deriveTransitions(zones: ComposedZone[]): ZoneTransition[] {
  const transitions: ZoneTransition[] = [];
  const roles = new Set(zones.map((z) => z.role));
  const gateway = zones.find((z) => z.role === 'gateway');
  const gatewayTrigger = gateway ? resolveGatewayTrigger(gateway.features) : 'authentication';

  const hasApp = roles.has('primary') || roles.has('auxiliary');
  const hasGateway = roles.has('gateway');
  const hasPublic = roles.has('public');

  if (hasPublic && hasGateway) {
    transitions.push({
      from: 'public',
      to: 'gateway',
      type: 'conversion',
      trigger: gatewayTrigger,
    });
  }
  if (hasPublic && hasApp && !hasGateway) {
    transitions.push({ from: 'public', to: 'app', type: 'conversion', trigger: 'navigation' });
  }
  if (hasGateway && hasApp) {
    transitions.push({ from: 'gateway', to: 'app', type: 'gate-pass', trigger: gatewayTrigger });
    transitions.push({ from: 'app', to: 'gateway', type: 'gate-return', trigger: gatewayTrigger });
  }
  if (hasApp && hasPublic) {
    transitions.push({ from: 'app', to: 'public', type: 'navigation', trigger: 'external' });
  }

  return transitions;
}

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

/** Read-only but makes network calls */
const READ_ONLY_NETWORK = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};

/** Write tool annotations */
const WRITE_TOOL = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
};

const MCP_PROJECT_HEALTH_SCHEMA_URL = 'https://decantr.ai/schemas/project-health-report.v1.json';
const MCP_WORKSPACE_HEALTH_SCHEMA_URL =
  'https://decantr.ai/schemas/workspace-health-report.v1.json';
const MCP_WORKSPACE_IGNORES = new Set([
  '.git',
  '.next',
  '.turbo',
  '.vercel',
  'coverage',
  'dist',
  'node_modules',
  'playwright-report',
]);

function mcpSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function mcpStatusFromCounts(counts: {
  errorCount: number;
  warnCount: number;
}): ProjectHealthStatus {
  if (counts.errorCount > 0) return 'error';
  if (counts.warnCount > 0) return 'warning';
  return 'healthy';
}

function mcpScoreFromCounts(counts: {
  errorCount: number;
  warnCount: number;
  infoCount: number;
}): number {
  return Math.max(
    0,
    Math.min(100, 100 - counts.errorCount * 15 - counts.warnCount * 5 - counts.infoCount),
  );
}

function mcpCommandsForFinding(source: ProjectHealthFindingSource): string[] {
  switch (source) {
    case 'assertion':
      return ['decantr refresh', 'decantr health --evidence'];
    case 'brownfield':
      return ['decantr analyze', 'decantr init --existing --merge-proposal', 'decantr health'];
    case 'browser':
      return ['decantr health --browser', 'decantr health --evidence'];
    case 'check':
      return ['decantr check', 'decantr health'];
    case 'design-token':
      return ['decantr export --to figma-tokens', 'decantr health --evidence'];
    case 'interaction':
      return ['decantr check --strict', 'decantr health'];
    case 'pack':
      return [
        'decantr refresh',
        'decantr registry get-pack review --write-context',
        'decantr health',
      ];
    case 'runtime':
      return ['npm run build', 'decantr health'];
    default:
      return ['decantr audit', 'decantr health'];
  }
}

function mcpSourceFromFinding(finding: VerificationFinding): ProjectHealthFindingSource {
  const category = finding.category.toLowerCase();
  const id = finding.id.toLowerCase();
  const rule = finding.rule?.toLowerCase() ?? '';
  if (
    category.includes('runtime') ||
    category.includes('document') ||
    category.includes('performance')
  ) {
    return 'runtime';
  }
  if (category.includes('pack') || category.includes('review contract')) {
    return 'pack';
  }
  if (
    category.includes('interaction') ||
    id.includes('interaction') ||
    rule.includes('interaction')
  ) {
    return 'interaction';
  }
  return 'audit';
}

function mcpBuildRepairPrompt(input: {
  id: string;
  source: ProjectHealthFindingSource;
  category: string;
  severity: VerificationSeverity;
  message: string;
  evidence: string[];
  suggestedFix?: string;
  commands: string[];
}): string {
  return [
    'You are fixing one Decantr Project Health finding in this local workspace.',
    '',
    'Read `DECANTR.md`, `decantr.essence.json`, and `.decantr/context/scaffold-pack.md` if they exist. For route or page work, read the matching page/section packs before editing.',
    '',
    `Finding: ${input.id}`,
    `Source: ${input.source}`,
    `Severity: ${input.severity}`,
    `Category: ${input.category}`,
    `Message: ${input.message}`,
    input.evidence.length > 0
      ? `Evidence:\n${input.evidence.map((entry) => `- ${entry}`).join('\n')}`
      : null,
    input.suggestedFix ? `Suggested fix: ${input.suggestedFix}` : null,
    '',
    'Make the smallest coherent code or contract change that resolves this finding. Preserve the existing framework, routing, styling system, and Decantr workflow mode unless the finding explicitly requires a contract update.',
    'Do not rewrite unrelated routes, replace the styling system, remove existing product behavior, or regenerate Decantr artifacts unless the finding is about stale or missing generated context.',
    '',
    `After the fix, run:\n${input.commands.map((command) => `- ${command}`).join('\n')}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n');
}

function mcpHealthFinding(input: {
  source: ProjectHealthFindingSource;
  category: string;
  severity: VerificationSeverity;
  message: string;
  evidence?: string[];
  target?: string;
  file?: string;
  rule?: string;
  suggestedFix?: string;
  baseId?: string;
}): ProjectHealthFinding {
  const id = `${input.source}-${mcpSlug(input.baseId || input.rule || `${input.category}-${input.message}`)}`;
  const commands = mcpCommandsForFinding(input.source);
  return {
    id,
    source: input.source,
    category: input.category,
    severity: input.severity,
    message: input.message,
    evidence: input.evidence ?? [],
    target: input.target,
    file: input.file,
    rule: input.rule,
    suggestedFix: input.suggestedFix,
    remediation: {
      summary: input.suggestedFix || `Resolve ${input.category.toLowerCase()} finding.`,
      commands,
      prompt: mcpBuildRepairPrompt({
        id,
        source: input.source,
        category: input.category,
        severity: input.severity,
        message: input.message,
        evidence: input.evidence ?? [],
        suggestedFix: input.suggestedFix,
        commands,
      }),
    },
  };
}

function mcpCollectDeclaredRoutes(essence: EssenceFile | null): string[] {
  if (!essence || !isV4(essence)) return [];
  return Object.keys(essence.blueprint.routes ?? {}).sort();
}

function mcpReportFromAudit(
  projectRoot: string,
  audit: ProjectAuditReport,
  assertions: ContractAssertion[],
): ProjectHealthReport {
  const findings: ProjectHealthFinding[] = [];
  const seen = new Set<string>();
  const pushUnique = (finding: ProjectHealthFinding) => {
    const key = `${finding.rule ?? finding.id}|${finding.message}`;
    if (seen.has(key)) return;
    seen.add(key);
    findings.push(finding);
  };

  for (const finding of audit.findings) {
    pushUnique(
      mcpHealthFinding({
        source: mcpSourceFromFinding(finding),
        category: finding.category,
        severity: finding.severity,
        message: finding.message,
        evidence: finding.evidence,
        target: finding.target,
        file: finding.file,
        rule: finding.rule,
        suggestedFix: finding.suggestedFix,
        baseId: finding.id,
      }),
    );
  }

  for (const assertion of assertions) {
    if (assertion.status !== 'failed') continue;
    pushUnique(
      mcpHealthFinding({
        source: 'assertion',
        category: `Contract ${assertion.category}`,
        severity: assertion.severity,
        message: assertion.message,
        evidence: assertion.evidence,
        target: assertion.target,
        rule: assertion.rule,
        suggestedFix: assertion.suggestedFix,
        baseId: assertion.id,
      }),
    );
  }

  if (!audit.valid && findings.every((finding) => finding.severity !== 'error')) {
    pushUnique(
      mcpHealthFinding({
        source: 'audit',
        category: 'Project Contract',
        severity: 'error',
        message: 'Project audit is not valid.',
        evidence: ['The verifier returned valid=false.'],
        rule: 'project-audit-invalid',
        suggestedFix: 'Resolve blocking audit findings and rerun `decantr health`.',
      }),
    );
  }

  const counts = {
    errorCount: findings.filter((finding) => finding.severity === 'error').length,
    warnCount: findings.filter((finding) => finding.severity === 'warn').length,
    infoCount: findings.filter((finding) => finding.severity === 'info').length,
  };
  const manifest = audit.packManifest;

  return {
    $schema: MCP_PROJECT_HEALTH_SCHEMA_URL,
    generatedAt: new Date().toISOString(),
    projectRoot,
    status: mcpStatusFromCounts(counts),
    score: mcpScoreFromCounts(counts),
    summary: {
      ...counts,
      findingCount: findings.length,
      workflowMode: null,
      adoptionMode: null,
      essenceVersion: audit.summary.essenceVersion,
      pageCount: audit.summary.pageCount,
      runtimeAuditChecked: audit.summary.runtimeAuditChecked,
      runtimePassed: audit.summary.runtimePassed,
      packManifestPresent: audit.summary.packManifestPresent,
      reviewPackPresent: audit.summary.reviewPackPresent,
    },
    routes: {
      declared: mcpCollectDeclaredRoutes(audit.essence),
      runtimeChecked: audit.runtimeAudit.routeHintsChecked,
      runtimeMatched: audit.runtimeAudit.routeHintsMatched,
      runtimeCoverageOk: audit.summary.runtimeAuditChecked
        ? audit.runtimeAudit.routeHintsCoverageOk
        : null,
      issues: findings
        .filter(
          (finding) =>
            finding.category.toLowerCase().includes('route') ||
            finding.rule?.toLowerCase().includes('route') ||
            finding.id.toLowerCase().includes('route'),
        )
        .map((finding) => finding.message),
    },
    packs: {
      manifestPresent: Boolean(manifest),
      reviewPackPresent: Boolean(manifest?.review ?? audit.reviewPack),
      scaffoldPackPresent: Boolean(manifest?.scaffold),
      sectionPackCount: manifest?.sections.length ?? 0,
      pagePackCount: manifest?.pages.length ?? 0,
      mutationPackCount: manifest?.mutations?.length ?? 0,
      generatedAt: typeof manifest?.generatedAt === 'string' ? manifest.generatedAt : null,
    },
    ci: {
      recommendedCommand: 'decantr health --ci --fail-on error',
      failOn: 'error',
    },
    findings,
  };
}

function resolveMcpProjectRoot(value: unknown): string {
  if (value == null) return process.cwd();
  if (typeof value !== 'string') {
    throw new Error('project_path must be a string when provided.');
  }
  return resolveWorkspacePath(value);
}

async function getMcpHealthState(projectRoot: string): Promise<{
  audit: ProjectAuditReport;
  assertions: ContractAssertion[];
  report: ProjectHealthReport;
  evidence: EvidenceBundle;
}> {
  const { auditProject, createContractAssertions, createEvidenceBundle } = await import(
    '@decantr/verifier'
  );
  const audit = await auditProject(projectRoot);
  const assertions = createContractAssertions(projectRoot, audit);
  const report = mcpReportFromAudit(projectRoot, audit, assertions);
  const evidence = createEvidenceBundle({
    projectRoot,
    audit,
    assertions,
    report,
    workspaceConfigPath: existsSync(join(projectRoot, '.decantr', 'workspace.json'))
      ? join(projectRoot, '.decantr', 'workspace.json')
      : null,
  });
  return { audit, assertions, report, evidence };
}

function discoverMcpWorkspaceProjects(
  root: string,
  maxProjects = 500,
): Array<{
  id: string;
  path: string;
  absolutePath: string;
}> {
  const projects: Array<{ id: string; path: string; absolutePath: string }> = [];

  function walk(dir: string, depth: number): void {
    if (projects.length >= maxProjects || depth > 6) return;
    if (existsSync(join(dir, 'decantr.essence.json'))) {
      const path = relative(root, dir).replace(/\\/g, '/') || '.';
      projects.push({
        id: path.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'project',
        path,
        absolutePath: dir,
      });
      return;
    }

    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      if (MCP_WORKSPACE_IGNORES.has(entry.name)) continue;
      walk(join(dir, entry.name), depth + 1);
      if (projects.length >= maxProjects) return;
    }
  }

  walk(root, 0);
  return projects.sort((a, b) => a.path.localeCompare(b.path));
}

async function getMcpWorkspaceHealth(args: Record<string, unknown>) {
  const root =
    args.workspace_root == null ? process.cwd() : resolveMcpProjectRoot(args.workspace_root);
  const maxProjects =
    typeof args.max_projects === 'number' && Number.isFinite(args.max_projects)
      ? Math.max(1, Math.floor(args.max_projects))
      : 500;
  const discovered = discoverMcpWorkspaceProjects(root, maxProjects);
  const projects = [];

  for (const project of discovered) {
    const startedAt = Date.now();
    try {
      const state = await getMcpHealthState(project.absolutePath);
      projects.push({
        id: project.id,
        path: project.path,
        status: state.report.status,
        score: state.report.score,
        errorCount: state.report.summary.errorCount,
        warnCount: state.report.summary.warnCount,
        infoCount: state.report.summary.infoCount,
        findingCount: state.report.summary.findingCount,
        durationMs: Date.now() - startedAt,
        changed: false,
        source: 'auto',
        error: null,
      });
    } catch (error) {
      projects.push({
        id: project.id,
        path: project.path,
        status: 'failed',
        score: 0,
        errorCount: 1,
        warnCount: 0,
        infoCount: 0,
        findingCount: 1,
        durationMs: Date.now() - startedAt,
        changed: false,
        source: 'auto',
        error: (error as Error).message,
      });
    }
  }

  return {
    $schema: MCP_WORKSPACE_HEALTH_SCHEMA_URL,
    generatedAt: new Date().toISOString(),
    workspaceRoot: '<workspace>',
    changedOnly: false,
    since: null,
    summary: {
      projectCount: discovered.length,
      checkedCount: projects.length,
      healthyCount: projects.filter((project) => project.status === 'healthy').length,
      warningCount: projects.filter((project) => project.status === 'warning').length,
      errorCount: projects.filter((project) => project.status === 'error').length,
      failedCount: projects.filter((project) => project.status === 'failed').length,
    },
    projects,
  };
}

export const TOOLS = [
  // 1. decantr_read_essence — local read
  {
    name: 'decantr_read_essence',
    title: 'Read Essence',
    description:
      'Read and return the current Essence v4 decantr.essence.json file from the working directory. Optionally filter by layer (dna, blueprint, or full).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: 'Optional path to essence file. Defaults to ./decantr.essence.json.',
        },
        layer: {
          type: 'string',
          enum: ['dna', 'blueprint', 'full'],
          description: 'For Essence v4 files: return only the specified layer. Defaults to full.',
        },
      },
    },
    annotations: READ_ONLY,
  },
  // 2. decantr_validate — local read
  {
    name: 'decantr_validate',
    title: 'Validate Essence',
    description:
      'Validate an Essence v4 decantr.essence.json file against the schema and guard rules, reporting DNA vs Blueprint violations separately.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: 'Path to essence file. Defaults to ./decantr.essence.json.',
        },
      },
    },
    annotations: READ_ONLY,
  },
  // 3. decantr_search_registry — network
  {
    name: 'decantr_search_registry',
    title: 'Search Registry',
    description:
      'Search the Decantr community content registry for patterns, archetypes, themes, and shells.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search query (e.g. "kanban", "neon", "dashboard")' },
        type: { type: 'string', description: 'Filter by type: pattern, archetype, theme, shell' },
        sort: { type: 'string', description: 'Optional sort: recommended, recent, or name.' },
        recommended: { type: 'boolean', description: 'When true, only return recommended items.' },
        source: {
          type: 'string',
          description: 'Optional intelligence source filter: authored, benchmark, or hybrid.',
        },
      },
      required: ['query'],
    },
    annotations: READ_ONLY_NETWORK,
  },
  // 4. decantr_resolve_pattern — network
  {
    name: 'decantr_resolve_pattern',
    title: 'Resolve Pattern',
    description:
      'Get full pattern details including layout spec, components, presets, and code examples.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Pattern ID (e.g. "hero", "data-table", "kpi-grid")' },
        preset: { type: 'string', description: 'Optional preset name (e.g. "product", "content")' },
        namespace: { type: 'string', description: 'Namespace (default: "@official")' },
      },
      required: ['id'],
    },
    annotations: READ_ONLY_NETWORK,
  },
  // 5. decantr_resolve_archetype — network
  {
    name: 'decantr_resolve_archetype',
    title: 'Resolve Archetype',
    description:
      'Get archetype details including default pages, layouts, features, and suggested theme.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Archetype ID (e.g. "saas-dashboard", "ecommerce")' },
        namespace: { type: 'string', description: 'Namespace (default: "@official")' },
      },
      required: ['id'],
    },
    annotations: READ_ONLY_NETWORK,
  },
  // 6. decantr_resolve_blueprint — network
  {
    name: 'decantr_resolve_blueprint',
    title: 'Resolve Blueprint',
    description:
      'Get a blueprint (app composition) with its archetype list, suggested theme, personality traits, and full page structure.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'Blueprint ID (e.g. "saas-dashboard", "ecommerce", "portfolio")',
        },
        namespace: { type: 'string', description: 'Namespace (default: "@official")' },
      },
      required: ['id'],
    },
    annotations: READ_ONLY_NETWORK,
  },
  // 8. decantr_suggest_patterns — network
  {
    name: 'decantr_suggest_patterns',
    title: 'Suggest Patterns',
    description:
      'Given a page description, suggest appropriate patterns from the registry. Returns ranked pattern matches with layout specs and component lists.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        description: {
          type: 'string',
          description:
            'Description of the page or section (e.g. "dashboard with metrics and charts", "settings form with toggles")',
        },
        route: {
          type: 'string',
          description: 'Optional route context, for example "/feed" or "/settings".',
        },
        source_code: {
          type: 'string',
          description: 'Optional local source excerpt to rank against actual code evidence.',
        },
      },
      required: ['description'],
    },
    annotations: READ_ONLY_NETWORK,
  },
  // 9. decantr_check_drift — local read
  {
    name: 'decantr_check_drift',
    title: 'Check Drift',
    description:
      'Check if code changes violate the design intent captured in the Essence v4 spec. Returns separate dna_violations and blueprint_drift with autoFixable flags.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: 'Path to essence file. Defaults to ./decantr.essence.json.',
        },
        page_id: {
          type: 'string',
          description: 'Page ID being modified (e.g. "overview", "settings")',
        },
        components_used: {
          type: 'array' as const,
          items: { type: 'string' },
          description:
            'List of component names used in the generated code. Checked against page layout patterns.',
        },
        theme_used: { type: 'string', description: 'Theme id used in the generated code' },
      },
    },
    annotations: READ_ONLY,
  },
  // 10. decantr_create_essence — network (fetches archetype)
  {
    name: 'decantr_create_essence',
    title: 'Create Essence',
    description:
      'Generate a valid Essence v4 skeleton from a project description. Returns a sectioned decantr.essence.json template based on the closest matching archetype and blueprint.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        description: {
          type: 'string',
          description:
            'Natural language project description (e.g. "SaaS dashboard with analytics, user management, and billing")',
        },
        framework: {
          type: 'string',
          description: 'Target framework (e.g. "react", "vue", "svelte"). Defaults to "react".',
        },
      },
      required: ['description'],
    },
    annotations: READ_ONLY_NETWORK,
  },
  // 11. decantr_accept_drift — WRITE tool (NEW)
  {
    name: 'decantr_accept_drift',
    title: 'Accept Drift',
    description:
      'Resolve guard violations by accepting, scoping, rejecting, or deferring drift. For DNA violations, requires explicit confirmation. Updates the essence file or drift log.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        violations: {
          type: 'array' as const,
          items: {
            type: 'object' as const,
            properties: {
              rule: { type: 'string' },
              page_id: { type: 'string' },
              details: { type: 'string' },
            },
            required: ['rule'],
          },
          description: 'The violations to resolve.',
        },
        resolution: {
          type: 'string',
          enum: ['accept', 'accept_scoped', 'reject', 'defer'],
          description:
            'How to resolve: accept updates the essence, accept_scoped limits to a page, reject is a no-op, defer logs for later.',
        },
        scope: { type: 'string', description: 'For accept_scoped: the page or section scope.' },
        path: {
          type: 'string',
          description: 'Path to essence file. Defaults to ./decantr.essence.json.',
        },
        confirm_dna: {
          type: 'boolean',
          description: 'Required to be true when accepting DNA-layer violations.',
        },
      },
      required: ['violations', 'resolution'],
    },
    annotations: WRITE_TOOL,
  },
  // 12. decantr_update_essence — WRITE tool (NEW)
  {
    name: 'decantr_update_essence',
    title: 'Update Essence',
    description:
      'Mutate an Essence v4 file: add/remove/update pages, update DNA or blueprint fields, add/remove features. Older projects must run `decantr migrate --to v4` first.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        operation: {
          type: 'string',
          enum: [
            'add_page',
            'remove_page',
            'update_page_layout',
            'update_dna',
            'update_blueprint',
            'add_feature',
            'remove_feature',
          ],
          description: 'The mutation operation to perform.',
        },
        payload: {
          type: 'object' as const,
          description: 'Operation-specific payload. See tool docs for each operation.',
        },
        path: {
          type: 'string',
          description: 'Path to essence file. Defaults to ./decantr.essence.json.',
        },
      },
      required: ['operation', 'payload'],
    },
    annotations: WRITE_TOOL,
  },
  // 13. decantr_get_scaffold_context — local read
  {
    name: 'decantr_get_scaffold_context',
    title: 'Get Scaffold Context',
    description:
      'Get the top-level scaffold context for the current project. Returns the scaffold task brief, scaffold overview, compiled scaffold execution pack, compiled review pack, and pack manifest when available. Falls back to hosted execution-pack compilation when local context artifacts are missing.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description:
            'Optional path to an essence file when using hosted fallback compilation. Defaults to ./decantr.essence.json.',
        },
        namespace: {
          type: 'string',
          description:
            'Optional preferred public namespace for hosted fallback compilation. Defaults to "@official".',
        },
      },
    },
    annotations: READ_ONLY,
  },
  // 14. decantr_get_section_context — local read
  {
    name: 'decantr_get_section_context',
    title: 'Get Section Context',
    description:
      'Get the self-contained context for a specific section of the project. Returns the richer section context file and, when available, the compiled section execution pack for a more compact contract-first view. Falls back to hosted execution-pack compilation when local pack artifacts are missing.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        section_id: {
          type: 'string',
          description:
            'Section ID (archetype ID, e.g., "ai-chatbot", "auth-full", "settings-full")',
        },
        path: {
          type: 'string',
          description:
            'Optional path to an essence file when using hosted fallback compilation. Defaults to ./decantr.essence.json.',
        },
        namespace: {
          type: 'string',
          description:
            'Optional preferred public namespace for hosted fallback compilation. Defaults to "@official".',
        },
      },
      required: ['section_id'],
    },
    annotations: READ_ONLY,
  },
  // 15. decantr_get_page_context — local read
  {
    name: 'decantr_get_page_context',
    title: 'Get Page Context',
    description:
      'Get the route-local context for a specific page. Returns the compiled page execution pack plus its parent section pack and section context when available. Falls back to hosted execution-pack compilation when local pack artifacts are missing.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        page_id: {
          type: 'string',
          description: 'Page ID (for example "overview", "settings", or "home").',
        },
        path: {
          type: 'string',
          description:
            'Optional path to an essence file when using hosted fallback compilation. Defaults to ./decantr.essence.json.',
        },
        namespace: {
          type: 'string',
          description:
            'Optional preferred public namespace for hosted fallback compilation. Defaults to "@official".',
        },
      },
      required: ['page_id'],
    },
    annotations: READ_ONLY,
  },
  // 16. decantr_prepare_task_context — local read
  {
    name: 'decantr_prepare_task_context',
    title: 'Prepare Task Context',
    description:
      'Resolve compact Brownfield/Essence task-time context for a route or page before editing. Returns route, section, page pack, directives, patterns, shared components, visual target, health evidence, and local screenshot references when available.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        route: {
          type: 'string',
          description: 'Route being edited, for example "/feed". Preferred when known.',
        },
        page_id: {
          type: 'string',
          description: 'Page ID when route is unknown.',
        },
        task: {
          type: 'string',
          description: 'Short task description used to rank relevant patterns and context.',
        },
      },
    },
    annotations: READ_ONLY,
  },
  // 17. decantr_get_execution_pack — local read
  {
    name: 'decantr_get_execution_pack',
    title: 'Get Execution Pack',
    description:
      'Read compiled execution packs from .decantr/context. Returns the pack manifest by default, or a specific scaffold, review, mutation, section, or page pack in markdown, JSON, or both. Falls back to the hosted selected-pack surface for targeted reads when local pack artifacts are missing.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pack_type: {
          type: 'string',
          enum: ['manifest', 'scaffold', 'review', 'mutation', 'section', 'page'],
          description: 'Pack type to fetch. Defaults to manifest.',
        },
        id: {
          type: 'string',
          description:
            'Required for section/page/mutation packs (for example "dashboard", "overview", or "modify").',
        },
        format: {
          type: 'string',
          enum: ['json', 'markdown', 'both'],
          description: 'Return format for a specific pack. Defaults to both.',
        },
        path: {
          type: 'string',
          description:
            'Optional path to an essence file when using hosted fallback compilation. Defaults to ./decantr.essence.json.',
        },
        namespace: {
          type: 'string',
          description:
            'Optional preferred public namespace for hosted fallback compilation. Defaults to "@official".',
        },
      },
    },
    annotations: READ_ONLY,
  },
  // 17. decantr_get_showcase_benchmarks — network read
  {
    name: 'decantr_get_showcase_benchmarks',
    title: 'Get Showcase Benchmarks',
    description:
      'Read the audited Decantr showcase corpus metadata. Returns the active manifest, shortlisted benchmark set, or the schema-backed shortlist verification report.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        view: {
          type: 'string',
          enum: ['manifest', 'shortlist', 'verification'],
          description: 'Which showcase benchmark view to return. Defaults to shortlist.',
        },
      },
    },
    annotations: READ_ONLY_NETWORK,
  },
  // 18. decantr_get_registry_intelligence_summary — network read
  {
    name: 'decantr_get_registry_intelligence_summary',
    title: 'Get Registry Intelligence Summary',
    description:
      'Read the hosted schema-backed registry intelligence summary. Useful for checking overall intelligence/recommendation coverage without crawling every item.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        namespace: {
          type: 'string',
          description: 'Optional namespace to scope the summary to, for example "@official".',
        },
      },
    },
    annotations: READ_ONLY_NETWORK,
  },
  // 19. decantr_compile_execution_packs — network read
  {
    name: 'decantr_compile_execution_packs',
    title: 'Compile Execution Packs',
    description:
      'Compile a hosted execution-pack bundle from an essence document using the public Decantr API. Reads the local essence file by default, or accepts an inline essence object.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description:
            'Optional path to an essence file. Defaults to ./decantr.essence.json when essence is not provided.',
        },
        essence: {
          type: 'object' as const,
          description: 'Optional inline essence document to compile instead of reading from disk.',
        },
        namespace: {
          type: 'string',
          description:
            'Optional preferred public namespace for content resolution. Defaults to "@official".',
        },
      },
    },
    annotations: READ_ONLY_NETWORK,
  },
  // 20. decantr_audit_project — local read with hosted fallback
  {
    name: 'decantr_audit_project',
    title: 'Audit Project',
    description:
      'Audit the current project against the essence contract, guard rules, and compiled execution packs. Can fall back to the hosted verifier when local compiled pack artifacts are missing only when allow_hosted_upload is true. Returns a schema-backed project audit report.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string' as const,
          description:
            'Optional path to the essence file for hosted fallback. Defaults to ./decantr.essence.json.',
        },
        namespace: {
          type: 'string' as const,
          description:
            'Optional preferred public namespace for hosted fallback. Defaults to "@official".',
        },
        dist_path: {
          type: 'string' as const,
          description:
            'Optional path to a local dist directory to snapshot for hosted runtime verification. Defaults to ./dist.',
        },
        sources_path: {
          type: 'string' as const,
          description:
            'Optional path to a local source directory to snapshot for hosted source-level verification. For example `src` or `app`.',
        },
        allow_hosted_upload: {
          type: 'boolean' as const,
          description:
            'Explicitly opt in to uploading local dist/source snapshots to the hosted verifier when local packs are missing. Defaults to false.',
        },
      },
    },
    annotations: READ_ONLY_NETWORK,
  },
  // 21. decantr_critique — local read with hosted fallback
  {
    name: 'decantr_critique',
    title: 'Design Critique',
    description:
      'Critique a file against the compiled review contract and Decantr verification heuristics. Can fall back to the hosted verifier when local review packs are missing only when allow_hosted_upload is true. Returns a schema-backed file critique report with scores, findings, and focus areas.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file_path: {
          type: 'string' as const,
          description: 'Path to the component file to critique',
        },
        path: {
          type: 'string' as const,
          description:
            'Optional path to the essence file when using hosted fallback. Defaults to ./decantr.essence.json.',
        },
        namespace: {
          type: 'string' as const,
          description:
            'Optional preferred public namespace for hosted fallback. Defaults to "@official".',
        },
        treatments_path: {
          type: 'string' as const,
          description:
            'Optional path to treatments.css when using hosted fallback. Defaults to ./src/styles/treatments.css.',
        },
        allow_hosted_upload: {
          type: 'boolean' as const,
          description:
            'Explicitly opt in to uploading the target source file to the hosted verifier when local review packs are missing. Defaults to false.',
        },
      },
      required: ['file_path'],
    },
    annotations: READ_ONLY_NETWORK,
  },
  // 22. decantr_get_evidence_bundle — local reliability artifact
  {
    name: 'decantr_get_evidence_bundle',
    title: 'Get Evidence Bundle',
    description:
      'Generate a local Evidence Bundle for the current Decantr project. The bundle redacts source, prompts, secrets, absolute paths, repo names, and screenshots by default.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        project_path: {
          type: 'string' as const,
          description:
            'Optional relative project path inside the active workspace. Defaults to the current working directory.',
        },
      },
    },
    annotations: READ_ONLY,
  },
  // 23. decantr_workspace_health — local workspace reliability scan
  {
    name: 'decantr_workspace_health',
    title: 'Workspace Health',
    description:
      'Discover Decantr projects in the active workspace and return deterministic aggregate health for monorepos with many Decantr apps.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace_root: {
          type: 'string' as const,
          description:
            'Optional relative workspace root inside the active workspace. Defaults to the current working directory.',
        },
        max_projects: {
          type: 'number' as const,
          description: 'Optional cap on discovered projects. Defaults to 500.',
        },
      },
    },
    annotations: READ_ONLY,
  },
  // 24. decantr_get_repair_prompt — local AI repair loop
  {
    name: 'decantr_get_repair_prompt',
    title: 'Get Repair Prompt',
    description:
      'Return an AI-ready repair prompt for a Project Health finding, including exact finding evidence, preserved constraints, do-not-change guidance, and rerun commands.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        project_path: {
          type: 'string' as const,
          description:
            'Optional relative project path inside the active workspace. Defaults to the current working directory.',
        },
        finding_id: {
          type: 'string' as const,
          description:
            'Optional finding id. Defaults to the first error or warning, then the first finding.',
        },
      },
    },
    annotations: READ_ONLY,
  },
  // 25. decantr_run_health_loop — local evidence + repair loop
  {
    name: 'decantr_run_health_loop',
    title: 'Run Health Loop',
    description:
      'Run Project Health, produce evidence, and return the next repair prompt for AI agents without uploading project source.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        project_path: {
          type: 'string' as const,
          description:
            'Optional relative project path inside the active workspace. Defaults to the current working directory.',
        },
        finding_id: {
          type: 'string' as const,
          description:
            'Optional finding id to target. Defaults to the first error or warning, then the first finding.',
        },
      },
    },
    annotations: READ_ONLY,
  },
];

export async function handleTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiClient = getAPIClient();

  switch (name) {
    case 'decantr_read_essence': {
      const essencePath = (args.path as string) || join(process.cwd(), 'decantr.essence.json');
      try {
        const raw = await readFile(essencePath, 'utf-8');
        const essence = JSON.parse(raw) as EssenceFile;
        const layer = args.layer as string | undefined;
        if (!isV4(essence)) {
          return {
            error:
              'Active Decantr V2 workflows require Essence v4.0.0. Run `decantr migrate --to v4` for older essence files.',
          };
        }
        if (layer) {
          if (layer === 'dna') return essence.dna;
          if (layer === 'blueprint') return essence.blueprint;
        }
        return essence;
      } catch (e) {
        return { error: `Could not read essence file: ${(e as Error).message}` };
      }
    }

    case 'decantr_validate': {
      const essencePath = (args.path as string) || join(process.cwd(), 'decantr.essence.json');
      let essence: unknown;
      try {
        essence = JSON.parse(await readFile(essencePath, 'utf-8'));
      } catch (e) {
        return {
          valid: false,
          errors: [`Could not read: ${(e as Error).message}`],
          guardViolations: [],
        };
      }
      const result = validateEssence(essence);

      let guardViolations: GuardViolation[] = [];
      if (result.valid && typeof essence === 'object' && essence !== null) {
        try {
          guardViolations = evaluateGuard(essence as EssenceFile, {});
        } catch {
          /* guard evaluation is optional */
        }
      }

      // For Essence v4 files, separate violations by layer
      if (
        result.valid &&
        typeof essence === 'object' &&
        essence !== null &&
        isV4(essence as EssenceFile)
      ) {
        const dnaViolations = guardViolations.filter((v) => v.layer === 'dna');
        const blueprintViolations = guardViolations.filter((v) => v.layer === 'blueprint');
        const otherViolations = guardViolations.filter((v) => !v.layer);
        return {
          ...result,
          format: 'v4',
          dna_violations: dnaViolations,
          blueprint_violations: blueprintViolations,
          guardViolations: otherViolations,
        };
      }

      return { ...result, guardViolations };
    }

    case 'decantr_search_registry': {
      const err = validateStringArg(args, 'query');
      if (err) return { error: err };
      if (
        args.source &&
        (typeof args.source !== 'string' || !isContentIntelligenceSource(args.source))
      ) {
        return { error: 'Invalid source. Must be one of: authored, benchmark, hybrid.' };
      }
      try {
        const response = await apiClient.search({
          q: args.query as string,
          type: args.type as string | undefined,
          sort: args.sort as string | undefined,
          recommended: args.recommended === true,
          intelligenceSource: args.source as ContentIntelligenceSource | undefined,
        });
        return {
          total: response.total,
          results: response.results.map((r) => ({
            type: r.type,
            id: r.slug,
            namespace: r.namespace,
            name: r.name,
            description: r.description,
            install: `decantr get ${r.type} ${r.slug}`,
            intelligence: r.intelligence ?? null,
          })),
        };
      } catch (e) {
        return { error: `Search failed: ${(e as Error).message}` };
      }
    }

    case 'decantr_resolve_pattern': {
      const err = validateStringArg(args, 'id');
      if (err) return { error: err };
      const namespace = (args.namespace as string) || '@official';
      try {
        const pattern = await apiClient.getPattern(namespace, args.id as string);
        const result: Record<string, unknown> = { found: true, ...pattern };
        if (args.preset && typeof args.preset === 'string') {
          const preset = resolvePatternPreset(pattern as Pattern, args.preset);
          if (preset) result.resolvedPreset = preset;
        }
        return result;
      } catch {
        return { found: false, message: `Pattern "${args.id}" not found in ${namespace}.` };
      }
    }

    case 'decantr_resolve_archetype': {
      const err = validateStringArg(args, 'id');
      if (err) return { error: err };
      const namespace = (args.namespace as string) || '@official';
      try {
        const archetype = await apiClient.getArchetype(namespace, args.id as string);
        return { found: true, ...archetype };
      } catch {
        return { found: false, message: `Archetype "${args.id}" not found in ${namespace}.` };
      }
    }

    case 'decantr_resolve_blueprint': {
      const err = validateStringArg(args, 'id');
      if (err) return { error: err };
      const namespace = (args.namespace as string) || '@official';
      try {
        const blueprint = await apiClient.getBlueprint(namespace, args.id as string);

        // Derive topology from composed archetypes
        let topology = null;
        const composeEntries = blueprint.compose;
        if (composeEntries && Array.isArray(composeEntries) && composeEntries.length > 0) {
          const zoneInputs: ZoneInput[] = [];
          const archetypePromises = composeEntries.map(async (entry: ComposeEntry) => {
            const arcId = typeof entry === 'string' ? entry : entry.archetype;
            try {
              const archData = await apiClient.getArchetype(namespace, arcId);
              const explicitRole = typeof entry === 'string' ? undefined : entry.role;
              zoneInputs.push({
                archetypeId: arcId,
                role: explicitRole || archData.role || 'auxiliary',
                shell: archData.pages?.[0]?.shell || 'sidebar-main',
                features: archData.features || [],
                description: archData.description || '',
              });
            } catch {
              // Archetype not found — skip
            }
          });
          await Promise.all(archetypePromises);

          if (zoneInputs.length > 0) {
            const zones = deriveZones(zoneInputs);
            const transitions = deriveTransitions(zones);
            const primaryArchetype = zoneInputs.find((z) => z.role === 'primary');
            topology = {
              zones: zones.map((z) => ({
                role: z.role,
                archetypes: z.archetypes,
                shell: z.shell,
                features: z.features,
                purpose: z.descriptions.join(' '),
              })),
              transitions,
              entryPoints: {
                anonymous: '/',
                authenticated: primaryArchetype ? `/${primaryArchetype.archetypeId}` : '/home',
              },
            };
          }
        }

        return { found: true, ...blueprint, ...(topology ? { topology } : {}) };
      } catch {
        return { found: false, message: `Blueprint "${args.id}" not found in ${namespace}.` };
      }
    }

    case 'decantr_suggest_patterns': {
      const err = validateStringArg(args, 'description');
      if (err) return { error: err };
      const desc = args.description as string;
      const route = typeof args.route === 'string' ? args.route : undefined;
      const sourceCode = typeof args.source_code === 'string' ? args.source_code : undefined;

      try {
        const patternsResponse = await apiClient.listContent<RegistryPatternListItem>('patterns', {
          namespace: '@official',
          limit: 250,
        });

        const preliminary = rankPatternCandidates(
          { query: desc, route, code: sourceCode, limit: 12 },
          patternsResponse.items.map((item) =>
            patternToDiscoveryCandidate({
              id: item.slug || item.name || 'pattern',
              slug: item.slug,
              name: item.name,
              description: item.description,
            }),
          ),
        );

        const fullCandidates = await Promise.all(
          preliminary.map(async (match) => {
            const slug = match.candidate.slug || match.candidate.id;
            try {
              const fetched = await apiClient.getPattern('@official', slug);
              return patternToDiscoveryCandidate(fetched as Pattern, { slug, source: 'hosted' });
            } catch {
              return match.candidate;
            }
          }),
        );

        const suggestions = rankPatternCandidates(
          { query: desc, route, code: sourceCode, limit: 5 },
          fullCandidates,
        ).map((match) => {
          const pattern = match.candidate.pattern as Pattern | undefined;
          const preset = pattern?.presets ? Object.values(pattern.presets)[0] : null;
          return {
            id: match.candidate.slug || match.candidate.id,
            score: match.score,
            name: match.candidate.name || match.candidate.slug || match.candidate.id,
            description: match.candidate.description || '',
            components: match.candidate.components || [],
            interactions: match.candidate.interactions || [],
            layout: preset?.layout ? preset.layout.layout : 'unknown',
            reasons: match.reasons,
            matched_terms: match.matchedTerms,
          };
        });

        return {
          query: args.description,
          route,
          suggestions,
          total: preliminary.length,
        };
      } catch (e) {
        return { error: `Could not fetch patterns: ${(e as Error).message}` };
      }
    }

    case 'decantr_check_drift': {
      const essencePath = (args.path as string) || join(process.cwd(), 'decantr.essence.json');
      let essence: EssenceFile;
      try {
        essence = JSON.parse(await readFile(essencePath, 'utf-8'));
      } catch (e) {
        return { error: `Could not read essence: ${(e as Error).message}` };
      }

      const validation = validateEssence(essence);
      if (!validation.valid) {
        return { drifted: true, reason: 'invalid_essence', errors: validation.errors };
      }
      if (!isV4(essence)) {
        return {
          drifted: true,
          reason: 'legacy_essence',
          errors: [
            'Active Decantr V2 workflows require Essence v4.0.0. Run `decantr migrate --to v4` for older essence files.',
          ],
        };
      }

      const violations: {
        rule: string;
        severity: string;
        message: string;
        layer?: string;
        autoFixable?: boolean;
        autoFix?: unknown;
      }[] = [];

      if (args.theme_used && typeof args.theme_used === 'string') {
        const expectedThemeId = essence.dna.theme.id;
        if (expectedThemeId && args.theme_used !== expectedThemeId) {
          violations.push({
            rule: 'theme-match',
            severity: 'critical',
            message: `Theme drift: code uses "${args.theme_used}" but Essence specifies "${expectedThemeId}". Do not switch themes.`,
            layer: 'dna',
            autoFixable: false,
          });
        }
      }

      if (args.page_id && typeof args.page_id === 'string') {
        const pages = listEssencePages(essence);
        if (!pages.find((p) => p.id === args.page_id)) {
          violations.push({
            rule: 'page-exists',
            severity: 'critical',
            message: `Page "${args.page_id}" not found in Essence structure. Add it to the Essence before generating code for it.`,
            layer: 'blueprint',
            autoFixable: true,
            autoFix: { type: 'add_page', patch: { id: args.page_id } },
          });
        }
      }

      // Implement components_used checking
      if (
        args.components_used &&
        Array.isArray(args.components_used) &&
        args.page_id &&
        typeof args.page_id === 'string'
      ) {
        const pages = listEssencePages(essence);
        const page = pages.find((p) => p.id === args.page_id);
        if (page && page.layout) {
          // Extract expected patterns from layout
          const expectedPatterns = new Set<string>();
          for (const item of page.layout) {
            if (typeof item === 'string') {
              expectedPatterns.add(item);
            } else if (typeof item === 'object' && item !== null && 'pattern' in item) {
              expectedPatterns.add((item as { pattern: string }).pattern);
            }
          }

          // Check if any components_used don't have a matching pattern in the layout
          const componentsUsed = args.components_used as string[];
          const unmatchedComponents: string[] = [];
          for (const comp of componentsUsed) {
            // Check if the component fuzzy-matches any expected pattern
            const compLower = comp.toLowerCase().replace(/[_\s]/g, '-');
            let matched = false;
            for (const pattern of expectedPatterns) {
              const patternLower = pattern.toLowerCase();
              if (
                compLower.includes(patternLower) ||
                patternLower.includes(compLower) ||
                fuzzyScore(compLower, patternLower) >= 60
              ) {
                matched = true;
                break;
              }
            }
            if (!matched) {
              unmatchedComponents.push(comp);
            }
          }

          if (unmatchedComponents.length > 0) {
            violations.push({
              rule: 'component-pattern-match',
              severity: 'warning',
              message: `Components [${unmatchedComponents.join(', ')}] do not match any pattern in page "${args.page_id}" layout. Expected patterns: [${[...expectedPatterns].join(', ')}].`,
              layer: 'blueprint',
              autoFixable: false,
            });
          }
        }
      }

      try {
        const guardViolations = evaluateGuard(essence, {
          pageId: args.page_id as string | undefined,
        });
        for (const gv of guardViolations) {
          violations.push({
            rule: gv.rule || 'guard',
            severity: gv.severity || 'warning',
            message: gv.message || 'Guard violation',
            ...(gv.layer ? { layer: gv.layer } : {}),
            ...(gv.autoFixable !== undefined ? { autoFixable: gv.autoFixable } : {}),
            ...(gv.autoFix ? { autoFix: gv.autoFix } : {}),
          });
        }
      } catch {
        /* guard is optional */
      }

      return {
        drifted: violations.length > 0,
        dna_violations: violations.filter((v) => v.layer === 'dna'),
        blueprint_drift: violations.filter((v) => v.layer === 'blueprint'),
        other_violations: violations.filter((v) => !v.layer),
        checkedAgainst: essencePath,
      };
    }

    case 'decantr_create_essence': {
      const err = validateStringArg(args, 'description');
      if (err) return { error: err };
      const desc = (args.description as string).toLowerCase();
      const framework = (args.framework as string) || 'react';

      const archetypeScores: { id: string; score: number }[] = [];
      const archetypeIds = [
        'saas-dashboard',
        'ecommerce',
        'portfolio',
        'content-site',
        'financial-dashboard',
        'cloud-platform',
        'gaming-platform',
        'ecommerce-admin',
      ];

      for (const id of archetypeIds) {
        let score = 0;
        if (desc.includes('dashboard') && id.includes('dashboard')) score += 20;
        if (desc.includes('saas') && id.includes('saas')) score += 20;
        if (desc.includes('ecommerce') && id.includes('ecommerce')) score += 20;
        if (desc.includes('shop') && id.includes('ecommerce')) score += 15;
        if (desc.includes('portfolio') && id.includes('portfolio')) score += 20;
        if (desc.includes('blog') && id.includes('content')) score += 15;
        if (desc.includes('content') && id.includes('content')) score += 15;
        if (desc.includes('finance') && id.includes('financial')) score += 20;
        if (desc.includes('cloud') && id.includes('cloud')) score += 15;
        if (desc.includes('game') && id.includes('gaming')) score += 15;
        if (desc.includes('admin') && id.includes('admin')) score += 15;
        if (desc.includes('analytics') && id.includes('dashboard')) score += 10;
        if (score > 0) archetypeScores.push({ id, score });
      }

      archetypeScores.sort((a, b) => b.score - a.score);
      const bestMatch = archetypeScores[0]?.id || 'saas-dashboard';

      // Try to fetch archetype from API for richer skeleton
      let pages: Array<{ id: string; shell: string; default_layout: string[] }> | undefined;
      let features: string[] = [];

      try {
        const archetype = await apiClient.getArchetype('@official', bestMatch);
        pages = archetype.pages as Array<{ id: string; shell: string; default_layout: string[] }>;
        features = archetype.features || [];
      } catch {
        // API unavailable, use minimal defaults
      }

      const rawPages = pages || [{ id: 'home', shell: 'full-bleed', default_layout: ['hero'] }];
      const defaultShell = rawPages[0]?.shell || 'sidebar-main';

      const sectionPages = rawPages.map((p, index) => ({
        id: p.id,
        route: p.id === 'home' || index === 0 ? '/' : `/${p.id}`,
        ...(p.shell !== defaultShell ? { shell_override: p.shell } : {}),
        layout: p.default_layout || [],
      }));
      const routes = Object.fromEntries(
        sectionPages.map((page) => [page.route, { section: bestMatch, page: page.id }]),
      );

      // Generate Essence v4 skeleton
      const essence: EssenceV4 = {
        version: '4.0.0',
        dna: {
          theme: {
            id: 'auradecantism',
            mode: 'dark',
            shape: 'rounded',
          },
          spacing: {
            base_unit: 4,
            scale: 'linear',
            density: 'comfortable',
            content_gap: '4',
          },
          typography: {
            scale: 'modular',
            heading_weight: 600,
            body_weight: 400,
          },
          color: {
            palette: 'semantic',
            accent_count: 1,
            cvd_preference: 'auto',
          },
          radius: {
            philosophy: 'rounded',
            base: 8,
          },
          elevation: {
            system: 'layered',
            max_levels: 3,
          },
          motion: {
            preference: 'subtle',
            duration_scale: 1.0,
            reduce_motion: true,
          },
          accessibility: {
            wcag_level: 'AA',
            focus_visible: true,
            skip_nav: true,
          },
          personality: ['professional'],
        },
        blueprint: {
          shell: defaultShell,
          sections: [
            {
              id: bestMatch,
              role: 'primary',
              shell: defaultShell,
              features,
              description: `${bestMatch} primary section`,
              pages: sectionPages,
            },
          ],
          features,
          routes,
        },
        meta: {
          archetype: bestMatch,
          target: framework,
          platform: { type: 'spa', routing: 'history' },
          guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
        },
      };

      return {
        essence,
        archetype: bestMatch,
        format: 'v4',
        instructions: `Save this as decantr.essence.json in your project root. Review the dna (design tokens), blueprint (pages/features), and meta (project config) sections and adjust to match your needs. The guard rules will validate your code against this spec.`,
        _generated: {
          matched_archetype: bestMatch,
          confidence: archetypeScores[0]?.score || 0,
          alternatives: archetypeScores.slice(1, 4).map((a) => a.id),
          description: args.description,
        },
      };
    }

    case 'decantr_accept_drift': {
      const violations = args.violations as
        | Array<{ rule: string; page_id?: string; details?: string }>
        | undefined;
      const resolution = args.resolution as string;

      if (!violations || !Array.isArray(violations) || violations.length === 0) {
        return { error: 'Required parameter "violations" must be a non-empty array.' };
      }
      if (!resolution || !['accept', 'accept_scoped', 'reject', 'defer'].includes(resolution)) {
        return {
          error:
            'Required parameter "resolution" must be one of: accept, accept_scoped, reject, defer.',
        };
      }

      // Check if any violations are DNA-layer; if so, require confirm_dna
      const hasDnaViolation = violations.some((v) => {
        const rule = v.rule;
        // DNA-layer rules: theme, density, theme-mode, accessibility
        return ['theme', 'style', 'density', 'theme-mode', 'accessibility', 'theme-match'].includes(
          rule,
        );
      });

      if (
        hasDnaViolation &&
        resolution !== 'reject' &&
        resolution !== 'defer' &&
        !args.confirm_dna
      ) {
        return {
          error:
            'DNA-layer violations detected. Set confirm_dna: true to accept changes to design axioms (theme, density, accessibility, etc.).',
          requires_confirmation: true,
          dna_rules_affected: violations
            .filter((v) =>
              ['theme', 'style', 'density', 'theme-mode', 'accessibility', 'theme-match'].includes(
                v.rule,
              ),
            )
            .map((v) => v.rule),
        };
      }

      if (resolution === 'reject') {
        return {
          status: 'rejected',
          message:
            'Violations rejected. No changes made. Revert the code to match the essence spec.',
          violations_count: violations.length,
        };
      }

      if (resolution === 'defer') {
        const projectRoot = args.path ? dirname(args.path as string) : undefined;
        const existingLog = await readDriftLog(projectRoot);
        const newEntries: DriftLogEntry[] = violations.map((v) => ({
          rule: v.rule,
          page_id: v.page_id,
          details: v.details,
          resolution: 'deferred',
          scope: (args.scope as string) || undefined,
          timestamp: new Date().toISOString(),
        }));
        const updatedLog = [...existingLog, ...newEntries];
        const logPath = await writeDriftLog(updatedLog, projectRoot);
        return {
          status: 'deferred',
          message: `${violations.length} violation(s) deferred to drift log.`,
          log_path: logPath,
          total_deferred: updatedLog.length,
        };
      }

      // resolution === 'accept' or 'accept_scoped'
      try {
        const { essence, path } = await mutateEssenceFile(args.path as string | undefined, (v4) => {
          for (const v of violations) {
            applyDriftAcceptance(v4, v, resolution, args.scope as string | undefined);
          }
          return v4;
        });

        return {
          status: resolution === 'accept_scoped' ? 'accepted_scoped' : 'accepted',
          message: `${violations.length} violation(s) resolved. Essence updated.`,
          path,
          scope: resolution === 'accept_scoped' ? args.scope || 'unscoped' : undefined,
        };
      } catch (e) {
        return { error: `Failed to update essence: ${(e as Error).message}` };
      }
    }

    case 'decantr_update_essence': {
      const operation = args.operation as string;
      const payload = args.payload as Record<string, unknown>;

      if (!operation) {
        return { error: 'Required parameter "operation" is missing.' };
      }
      if (!payload || typeof payload !== 'object') {
        return { error: 'Required parameter "payload" must be an object.' };
      }

      const validOps = [
        'add_page',
        'remove_page',
        'update_page_layout',
        'update_dna',
        'update_blueprint',
        'add_feature',
        'remove_feature',
      ];
      if (!validOps.includes(operation)) {
        return {
          error: `Invalid operation "${operation}". Must be one of: ${validOps.join(', ')}`,
        };
      }

      try {
        const { essence, path } = await mutateEssenceFile(args.path as string | undefined, (v4) => {
          return applyEssenceUpdate(v4, operation, payload);
        });

        return {
          status: 'updated',
          operation,
          path,
          summary: describeUpdate(operation, payload),
        };
      } catch (e) {
        return { error: `Failed to update essence: ${(e as Error).message}` };
      }
    }

    case 'decantr_get_scaffold_context': {
      const contextDir = join(process.cwd(), '.decantr', 'context');
      const manifestPath = join(contextDir, 'pack-manifest.json');
      const scaffoldContextPath = join(contextDir, 'scaffold.md');
      const taskContextPath = join(contextDir, 'task-scaffold.md');
      const packMarkdownPath = join(contextDir, 'scaffold-pack.md');
      const packJsonPath = join(contextDir, 'scaffold-pack.json');

      const hasAnyContext =
        existsSync(scaffoldContextPath) ||
        existsSync(taskContextPath) ||
        existsSync(packMarkdownPath) ||
        existsSync(packJsonPath) ||
        existsSync(manifestPath);

      if (!hasAnyContext) {
        const [hostedScaffold, hostedReview] = await Promise.all([
          loadHostedSelectedExecutionPackFallback({
            ...args,
            pack_type: 'scaffold',
          }),
          loadHostedSelectedExecutionPackFallback({
            ...args,
            pack_type: 'review',
          }),
        ]);

        const scaffoldSelected = hostedScaffold.selected;
        const reviewSelected = hostedReview.selected;
        if (scaffoldSelected && reviewSelected) {
          const scaffoldPayload = toHostedExecutionPackPayload(scaffoldSelected.pack);
          const reviewPayload = toHostedExecutionPackPayload(reviewSelected.pack);
          return {
            source: 'hosted_fallback' as PackSource,
            task_context: null,
            scaffold_context: scaffoldPayload.markdown,
            execution_pack: scaffoldPayload,
            review_pack: reviewPayload,
            pack_manifest: scaffoldSelected.manifest,
            available_sections: scaffoldSelected.manifest.sections.map((section) => ({
              id: section.id,
              page_ids: section.pageIds,
            })),
            available_pages: scaffoldSelected.manifest.pages.map((page) => ({
              id: page.id,
              section_id: page.sectionId,
            })),
            available_mutations: (scaffoldSelected.manifest.mutations ?? []).map((mutation) => ({
              id: mutation.id,
              mutation_type: mutation.mutationType,
            })),
            note: 'Using hosted selected execution packs because local scaffold context artifacts were not found; scaffold pack markdown is being reused as readable scaffold context.',
          };
        }

        const hosted = await loadHostedExecutionPackBundleFallback(args);
        if (!hosted.bundle) {
          return {
            error:
              'Scaffold context not found. Run `decantr refresh` or `decantr registry compile-packs --write-context` to materialize scaffold context and execution packs.',
            hosted_fallback_error: hosted.error ?? hostedScaffold.error ?? hostedReview.error,
          };
        }

        const scaffoldPayload = toHostedExecutionPackPayload(hosted.bundle.scaffold);
        const reviewPayload = toHostedExecutionPackPayload(hosted.bundle.review);
        return {
          source: 'hosted_fallback' as PackSource,
          task_context: null,
          scaffold_context: scaffoldPayload.markdown,
          execution_pack: scaffoldPayload,
          review_pack: reviewPayload,
          pack_manifest: hosted.bundle.manifest,
          available_sections: hosted.bundle.manifest.sections.map((section) => ({
            id: section.id,
            page_ids: section.pageIds,
          })),
          available_pages: hosted.bundle.manifest.pages.map((page) => ({
            id: page.id,
            section_id: page.sectionId,
          })),
          available_mutations: (hosted.bundle.manifest.mutations ?? []).map((mutation) => ({
            id: mutation.id,
            mutation_type: mutation.mutationType,
          })),
          note: 'Using hosted compiled execution packs because local scaffold context artifacts were not found; scaffold pack markdown is being reused as readable scaffold context.',
        };
      }

      let manifest: PackManifest | null = null;
      if (existsSync(manifestPath)) {
        try {
          manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as PackManifest;
        } catch (e) {
          return { error: `Failed to read pack manifest: ${(e as Error).message}` };
        }
      }

      return {
        source: 'local' as PackSource,
        task_context: existsSync(taskContextPath) ? readFileSync(taskContextPath, 'utf-8') : null,
        scaffold_context: existsSync(scaffoldContextPath)
          ? readFileSync(scaffoldContextPath, 'utf-8')
          : existsSync(packMarkdownPath)
            ? readFileSync(packMarkdownPath, 'utf-8')
            : null,
        execution_pack: {
          markdown: existsSync(packMarkdownPath) ? readFileSync(packMarkdownPath, 'utf-8') : null,
          json: existsSync(packJsonPath) ? JSON.parse(readFileSync(packJsonPath, 'utf-8')) : null,
        },
        review_pack: {
          markdown: existsSync(join(contextDir, 'review-pack.md'))
            ? readFileSync(join(contextDir, 'review-pack.md'), 'utf-8')
            : null,
          json: existsSync(join(contextDir, 'review-pack.json'))
            ? JSON.parse(readFileSync(join(contextDir, 'review-pack.json'), 'utf-8'))
            : null,
        },
        pack_manifest: manifest,
        available_sections:
          manifest?.sections.map((section) => ({ id: section.id, page_ids: section.pageIds })) ??
          [],
        available_pages:
          manifest?.pages.map((page) => ({ id: page.id, section_id: page.sectionId })) ?? [],
        available_mutations:
          manifest?.mutations?.map((mutation) => ({
            id: mutation.id,
            mutation_type: mutation.mutationType,
          })) ?? [],
      };
    }

    case 'decantr_get_section_context': {
      const err = validateStringArg(args, 'section_id');
      if (err) return { error: err };
      const sectionId = args.section_id as string;

      // Read the essence
      let essence: EssenceFile;
      try {
        const result = await readEssenceFile();
        essence = result.essence;
      } catch {
        return { error: 'No valid essence file found. Run decantr init first.' };
      }

      if (!isV4(essence)) {
        return {
          error: 'Section context requires Essence v4.0.0. Run `decantr migrate --to v4` first.',
        };
      }

      // Find the section
      const sections = essence.blueprint.sections || [];
      const section = sections.find((s) => s.id === sectionId);
      if (!section) {
        return {
          error: `Section "${sectionId}" not found.`,
          available_sections: sections.map((s) => ({
            id: s.id,
            role: s.role,
            pages: s.pages.length,
          })),
        };
      }

      const packBasePath = join(process.cwd(), '.decantr', 'context', `section-${sectionId}-pack`);
      const packMarkdownPath = `${packBasePath}.md`;
      const packJsonPath = `${packBasePath}.json`;
      const localExecutionPack = {
        markdown: existsSync(packMarkdownPath) ? readFileSync(packMarkdownPath, 'utf-8') : null,
        json: existsSync(packJsonPath) ? JSON.parse(readFileSync(packJsonPath, 'utf-8')) : null,
      };
      let executionPack = localExecutionPack;
      let executionPackSource: PackSource | null = hasExecutionPackPayload(localExecutionPack)
        ? 'local'
        : null;
      let hostedFallbackError: string | null = null;

      if (!executionPackSource) {
        const hosted = await loadHostedSelectedExecutionPackFallback({
          ...args,
          pack_type: 'section',
          id: sectionId,
        });
        hostedFallbackError = hosted.error;
        if (hosted.selected) {
          executionPack = toHostedExecutionPackPayload(hosted.selected.pack);
          executionPackSource = 'hosted_fallback';
        }
      }

      // Read the section context file if it exists
      const contextPath = join(process.cwd(), '.decantr', 'context', `section-${sectionId}.md`);
      if (existsSync(contextPath)) {
        return {
          section_id: sectionId,
          role: section.role,
          shell: section.shell,
          features: section.features,
          pages: section.pages.map((p) => ({ id: p.id, route: p.route, layout: p.layout })),
          context: readFileSync(contextPath, 'utf-8'),
          execution_pack_source: executionPackSource,
          execution_pack: executionPack,
        };
      }

      // Fallback: return structured section data
      const derivedContext = executionPack.markdown;
      return {
        section_id: sectionId,
        role: section.role,
        shell: section.shell,
        features: section.features,
        description: section.description,
        pages: section.pages.map((p) => ({ id: p.id, route: p.route, layout: p.layout })),
        context: derivedContext,
        execution_pack_source: executionPackSource,
        execution_pack: executionPack,
        note:
          executionPackSource === 'hosted_fallback'
            ? 'Section context file not found. Using hosted compiled execution pack fallback as the readable section context.'
            : `Section context file not found. Run \`decantr refresh\` or \`decantr registry get-pack section ${sectionId} --write-context\` to generate it.`,
        hosted_fallback_error: executionPackSource ? undefined : hostedFallbackError,
      };
    }

    case 'decantr_get_page_context': {
      const err = validateStringArg(args, 'page_id');
      if (err) return { error: err };
      const pageId = args.page_id as string;
      const contextDir = join(process.cwd(), '.decantr', 'context');
      const manifestPath = join(contextDir, 'pack-manifest.json');
      let manifest: PackManifest | null = null;
      let manifestSource: PackSource | null = null;
      let hostedPageSelection: HostedSelectedExecutionPack | null = null;
      let hostedSectionSelection: HostedSelectedExecutionPack | null = null;
      let hostedFallbackError: string | null = null;

      const loadHostedPageSelection = async () => {
        if (hostedPageSelection) {
          return hostedPageSelection;
        }
        const hosted = await loadHostedSelectedExecutionPackFallback({
          ...args,
          pack_type: 'page',
          id: pageId,
        });
        hostedFallbackError = hosted.error;
        hostedPageSelection = hosted.selected;
        return hostedPageSelection;
      };

      const loadHostedSectionSelection = async (sectionId: string) => {
        if (hostedSectionSelection && hostedSectionSelection.selector.id === sectionId) {
          return hostedSectionSelection;
        }
        const hosted = await loadHostedSelectedExecutionPackFallback({
          ...args,
          pack_type: 'section',
          id: sectionId,
        });
        hostedFallbackError = hosted.error;
        hostedSectionSelection = hosted.selected;
        return hostedSectionSelection;
      };

      if (existsSync(manifestPath)) {
        try {
          manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as PackManifest;
          manifestSource = 'local';
        } catch (e) {
          return { error: `Failed to read pack manifest: ${(e as Error).message}` };
        }
      }

      if (!manifest) {
        const hosted = await loadHostedPageSelection();
        if (!hosted) {
          return {
            error:
              'Execution pack manifest not found. Run `decantr refresh` or `decantr registry get-pack manifest --write-context` to generate compiled packs.',
            hosted_fallback_error: hostedFallbackError,
          };
        }
        manifest = hosted.manifest as PackManifest;
        manifestSource = 'hosted_fallback';
      }

      let pageEntry = manifest.pages.find((page) => page.id === pageId) ?? null;
      if (!pageEntry) {
        if (manifestSource === 'local') {
          const hosted = await loadHostedPageSelection();
          if (hosted) {
            manifest = hosted.manifest as PackManifest;
            manifestSource = 'hosted_fallback';
            pageEntry = manifest.pages.find((page) => page.id === pageId) ?? null;
          }
        }

        if (!pageEntry) {
          return {
            error: `Page "${pageId}" not found in execution pack manifest.`,
            available_pages: manifest.pages.map((page) => ({
              id: page.id,
              section_id: page.sectionId,
            })),
            hosted_fallback_error:
              manifestSource === 'hosted_fallback' ? undefined : hostedFallbackError,
          };
        }
      }

      let resolvedPageEntry = pageEntry;
      let sectionEntry = resolvedPageEntry.sectionId
        ? (manifest.sections.find((section) => section.id === resolvedPageEntry.sectionId) ?? null)
        : null;
      const pageMarkdownPath = join(contextDir, resolvedPageEntry.markdown);
      const pageJsonPath = join(contextDir, resolvedPageEntry.json);
      const sectionMarkdownPath = sectionEntry ? join(contextDir, sectionEntry.markdown) : null;
      const sectionJsonPath = sectionEntry ? join(contextDir, sectionEntry.json) : null;
      const sectionContextPath = resolvedPageEntry.sectionId
        ? join(contextDir, `section-${resolvedPageEntry.sectionId}.md`)
        : null;

      const localPagePack = {
        markdown: existsSync(pageMarkdownPath) ? readFileSync(pageMarkdownPath, 'utf-8') : null,
        json: existsSync(pageJsonPath) ? JSON.parse(readFileSync(pageJsonPath, 'utf-8')) : null,
      };
      let executionPack = localPagePack;
      let executionPackSource: PackSource | null = hasExecutionPackPayload(localPagePack)
        ? 'local'
        : null;

      if (!executionPackSource) {
        const hosted = await loadHostedPageSelection();
        if (hosted) {
          manifest = hosted.manifest as PackManifest;
          manifestSource = 'hosted_fallback';
          resolvedPageEntry =
            manifest.pages.find((page) => page.id === pageId) ?? resolvedPageEntry;
          sectionEntry = resolvedPageEntry.sectionId
            ? (manifest.sections.find((section) => section.id === resolvedPageEntry.sectionId) ??
              sectionEntry)
            : null;
          executionPack = toHostedExecutionPackPayload(hosted.pack);
          executionPackSource = 'hosted_fallback';
        }
      }

      const localSectionPack = sectionEntry
        ? {
            markdown:
              sectionMarkdownPath && existsSync(sectionMarkdownPath)
                ? readFileSync(sectionMarkdownPath, 'utf-8')
                : null,
            json:
              sectionJsonPath && existsSync(sectionJsonPath)
                ? JSON.parse(readFileSync(sectionJsonPath, 'utf-8'))
                : null,
          }
        : null;
      let sectionExecutionPack = localSectionPack;
      let sectionExecutionPackSource: PackSource | null =
        localSectionPack && hasExecutionPackPayload(localSectionPack) ? 'local' : null;

      if (sectionEntry && !sectionExecutionPackSource) {
        const hosted = await loadHostedSectionSelection(sectionEntry.id);
        if (hosted) {
          sectionExecutionPack = toHostedExecutionPackPayload(hosted.pack);
          sectionExecutionPackSource = 'hosted_fallback';
        }
      }

      return {
        page_id: pageId,
        page_context: executionPack.markdown,
        section_id: resolvedPageEntry.sectionId,
        section_role: resolvedPageEntry.sectionRole,
        manifest_source: manifestSource,
        execution_pack_source: executionPackSource,
        section_execution_pack_source: sectionExecutionPackSource,
        execution_pack: executionPack,
        section_execution_pack: sectionExecutionPack,
        section_context:
          sectionContextPath && existsSync(sectionContextPath)
            ? readFileSync(sectionContextPath, 'utf-8')
            : (sectionExecutionPack?.markdown ?? null),
        manifest: {
          page: resolvedPageEntry,
          section: sectionEntry,
        },
        note:
          manifestSource === 'hosted_fallback'
            ? 'Using hosted compiled execution-pack data because local page pack artifacts were missing or incomplete.'
            : undefined,
        hosted_fallback_error: hostedFallbackError ?? undefined,
      };
    }

    case 'decantr_prepare_task_context': {
      const routeArg = typeof args.route === 'string' ? args.route : undefined;
      const pageArg = typeof args.page_id === 'string' ? args.page_id : undefined;
      const task = typeof args.task === 'string' ? args.task : '';
      if (!routeArg && !pageArg) {
        return { error: 'Provide route or page_id.' };
      }

      let essence: EssenceFile;
      try {
        const result = await readEssenceFile();
        essence = result.essence;
      } catch {
        return { error: 'No valid essence file found. Run decantr init first.' };
      }
      if (!isV4(essence)) {
        return {
          error: 'Task context requires Essence v4.0.0. Run `decantr migrate --to v4` first.',
        };
      }

      const routeEntry = routeArg ? essence.blueprint.routes?.[routeArg] : null;
      const sectionId = routeEntry?.section;
      const pageId = pageArg || routeEntry?.page;
      const section = sectionId
        ? essence.blueprint.sections.find((entry) => entry.id === sectionId)
        : essence.blueprint.sections.find((entry) =>
            entry.pages.some((page) => page.id === pageId),
          );
      const page = section?.pages.find((entry) => entry.id === pageId) ?? null;
      if (!section || !page || !pageId) {
        return {
          error: 'Could not resolve route/page to an Essence section page.',
          available_routes: Object.keys(essence.blueprint.routes ?? {}).sort(),
          available_pages: essence.blueprint.sections.flatMap((entry) =>
            entry.pages.map((pageEntry) => ({ section_id: entry.id, page_id: pageEntry.id })),
          ),
        };
      }

      const contextDir = join(process.cwd(), '.decantr', 'context');
      const manifest = readJsonIfExists<PackManifest>(join(contextDir, 'pack-manifest.json'));
      const pageManifest = manifest?.pages.find((entry) => entry.id === pageId) ?? null;
      const sectionManifest = manifest?.sections.find((entry) => entry.id === section.id) ?? null;
      const pagePackJson = pageManifest
        ? readJsonIfExists<unknown>(join(contextDir, pageManifest.json))
        : null;
      const sectionPackJson = sectionManifest
        ? readJsonIfExists<unknown>(join(contextDir, sectionManifest.json))
        : null;
      const pagePackMarkdown =
        pageManifest && existsSync(join(contextDir, pageManifest.markdown))
          ? readFileSync(join(contextDir, pageManifest.markdown), 'utf-8')
          : null;
      const sectionContextPath = join(contextDir, `section-${section.id}.md`);
      const sectionContext = existsSync(sectionContextPath)
        ? readFileSync(sectionContextPath, 'utf-8')
        : null;
      const pagePackSummary = summarizePackJson(pagePackJson);
      const sectionPackSummary = summarizePackJson(sectionPackJson);
      const visualManifest = readJsonIfExists<{
        routes?: Array<{
          route?: string;
          screenshot?: string | null;
          screenshotHash?: string | null;
          status?: string;
          error?: string;
        }>;
      }>(join(process.cwd(), '.decantr', 'evidence', 'visual-manifest.json'));
      const visualRoute =
        visualManifest?.routes?.find((entry) => entry.route === routeArg) ??
        visualManifest?.routes?.find((entry) =>
          entry.screenshot?.includes(routeSlug(routeArg ?? pageId)),
        ) ??
        null;
      const health = readJsonIfExists<{
        baselinePath?: string;
        savedAt?: string | null;
        statusChanged?: boolean;
        scoreDelta?: number | null;
        addedFindings?: string[];
        resolvedFindings?: string[];
        changedRoutes?: string[];
        changedScreenshots?: string[];
        contractDrift?: string[];
      }>(join(process.cwd(), '.decantr', 'health-baseline-diff.json'));
      const themeInventory = readJsonIfExists<Record<string, unknown>>(
        join(process.cwd(), '.decantr', 'theme-inventory.json'),
      );
      const localLaw = localLawSummary(process.cwd());
      const projectJson = readJsonIfExists<{
        initialized?: { workflowMode?: string; adoptionMode?: string };
      }>(join(process.cwd(), '.decantr', 'project.json'));
      const changedFiles = changedFilesForTask(process.cwd());
      const changedRoutes = impactedRoutesForFiles(process.cwd(), changedFiles);
      const patternIds = extractPagePatternIds(page);
      const ranked = rankPatternCandidates(
        {
          query: [task, routeArg, (page as { description?: string }).description, ...patternIds]
            .filter(Boolean)
            .join(' '),
          limit: 5,
        },
        patternIds.map((id) => patternToDiscoveryCandidate({ id, name: id, description: id })),
      );

      return {
        route: routeArg ?? null,
        page_id: pageId,
        section_id: section.id,
        section_role: section.role,
        shell: section.shell,
        task,
        visual_target:
          pagePackSummary.visualTarget ??
          sectionPackSummary.visualTarget ??
          essence.dna.personality?.join('. ') ??
          null,
        directives: pagePackSummary.directives,
        patterns: pagePackSummary.patterns.length > 0 ? pagePackSummary.patterns : patternIds,
        ranked_patterns: ranked.map((match) => ({
          id: match.candidate.slug || match.candidate.id,
          score: match.score,
          reasons: match.reasons,
        })),
        shared_components: pagePackSummary.sharedComponents,
        section_context: sectionContext,
        page_pack_excerpt: pagePackMarkdown ? pagePackMarkdown.slice(0, 12000) : null,
        health_evidence: health
          ? {
              baseline_path: health.baselinePath,
              saved_at: health.savedAt,
              status_changed: health.statusChanged,
              score_delta: health.scoreDelta,
              added_findings: health.addedFindings?.slice(0, 8) ?? [],
              resolved_findings: health.resolvedFindings?.slice(0, 8) ?? [],
              changed_routes: health.changedRoutes ?? [],
              changed_screenshots: health.changedScreenshots ?? [],
              contract_drift: health.contractDrift ?? [],
            }
          : null,
        visual_evidence: visualRoute
          ? {
              screenshot: visualRoute.screenshot ?? null,
              screenshot_hash: visualRoute.screenshotHash ?? null,
              status: visualRoute.status ?? null,
              error: visualRoute.error ?? null,
            }
          : null,
        theme_inventory: themeInventory
          ? {
              modes: themeInventory.modes,
              variants: themeInventory.variants,
              path: '.decantr/theme-inventory.json',
            }
          : null,
        local_law: localLaw,
        authority: taskAuthoritySummary({
          workflowMode: projectJson?.initialized?.workflowMode ?? null,
          adoptionMode: projectJson?.initialized?.adoptionMode ?? null,
          localLaw,
          hasPackManifest: Boolean(manifest),
          task,
        }),
        change_impact: {
          changed_files: changedFiles.slice(0, 40),
          changed_file_count: changedFiles.length,
          impacted_routes: changedRoutes,
        },
        verify_command: 'decantr verify --brownfield --local-patterns',
        local_files: {
          page_pack: pageManifest?.markdown ?? null,
          section_pack: sectionManifest?.markdown ?? null,
          section_context: existsSync(sectionContextPath)
            ? `.decantr/context/section-${section.id}.md`
            : null,
          local_patterns: localLaw.patterns_path,
          local_rules: localLaw.rules_path,
          visual_manifest: existsSync(
            join(process.cwd(), '.decantr', 'evidence', 'visual-manifest.json'),
          )
            ? '.decantr/evidence/visual-manifest.json'
            : null,
        },
      };
    }

    case 'decantr_get_execution_pack': {
      const contextDir = join(process.cwd(), '.decantr', 'context');
      const manifestPath = join(contextDir, 'pack-manifest.json');
      let manifest: PackManifest | null = null;
      let manifestSource: PackSource | null = null;
      let hostedBundle: HostedExecutionPackBundle | null = null;
      let hostedSelectedPack: HostedSelectedExecutionPack | null = null;
      let hostedFallbackError: string | null = null;
      const packType = (args.pack_type as string | undefined) ?? 'manifest';

      if (existsSync(manifestPath)) {
        try {
          manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as PackManifest;
          manifestSource = 'local';
        } catch (e) {
          return { error: `Failed to read pack manifest: ${(e as Error).message}` };
        }
      }

      if (!manifest && packType === 'manifest') {
        const hostedManifest = await loadHostedExecutionPackManifestFallback(args);
        hostedFallbackError = hostedManifest.error;

        if (hostedManifest.manifest) {
          manifest = hostedManifest.manifest as PackManifest;
          manifestSource = 'hosted_fallback';
        } else {
          const hosted = await loadHostedExecutionPackBundleFallback(args);
          hostedBundle = hosted.bundle;
          hostedFallbackError = hosted.error;
          if (!hosted.bundle) {
            return {
              error:
                'Execution pack manifest not found. Run `decantr refresh` or `decantr registry get-pack manifest --write-context` to generate compiled packs.',
              hosted_fallback_error: hosted.error,
            };
          }
          manifest = hosted.bundle.manifest as PackManifest;
          manifestSource = 'hosted_fallback';
        }
      }

      if (packType === 'manifest') {
        return {
          ...manifest,
          source: manifestSource,
        };
      }

      if (!manifest) {
        const hosted = await loadHostedSelectedExecutionPackFallback(args);
        hostedSelectedPack = hosted.selected;
        hostedFallbackError = hosted.error;
        if (!hosted.selected) {
          return {
            error:
              'Execution pack manifest not found. Run `decantr refresh` or `decantr registry get-pack manifest --write-context` to generate compiled packs.',
            hosted_fallback_error: hosted.error,
          };
        }
        manifest = hosted.selected.manifest as PackManifest;
        manifestSource = 'hosted_fallback';
      }

      const format = (args.format as string | undefined) ?? 'both';
      let entry: PackManifestEntry | null = null;
      let availableIds: string[] = [];

      if (packType === 'scaffold') {
        entry = manifest.scaffold;
      } else if (packType === 'review') {
        entry = manifest.review ?? null;
      } else if (packType === 'mutation') {
        availableIds = (manifest.mutations ?? []).map((mutation) => mutation.id);
        const idErr = validateStringArg(args, 'id');
        if (idErr) return { error: idErr, available_ids: availableIds };
        entry = (manifest.mutations ?? []).find((mutation) => mutation.id === args.id) ?? null;
      } else if (packType === 'section') {
        availableIds = manifest.sections.map((section) => section.id);
        const idErr = validateStringArg(args, 'id');
        if (idErr) return { error: idErr, available_ids: availableIds };
        entry = manifest.sections.find((section) => section.id === args.id) ?? null;
      } else if (packType === 'page') {
        availableIds = manifest.pages.map((page) => page.id);
        const idErr = validateStringArg(args, 'id');
        if (idErr) return { error: idErr, available_ids: availableIds };
        entry = manifest.pages.find((page) => page.id === args.id) ?? null;
      } else {
        return { error: `Unsupported pack type: ${packType}` };
      }

      if (!entry) {
        if (manifestSource === 'local') {
          const hosted = await loadHostedSelectedExecutionPackFallback(args);
          hostedSelectedPack = hosted.selected;
          hostedFallbackError = hosted.error;
          if (hosted.selected) {
            manifest = hosted.selected.manifest as PackManifest;
            manifestSource = 'hosted_fallback';
            entry = findManifestEntryForPack(
              manifest,
              packType as 'scaffold' | 'review' | 'section' | 'page' | 'mutation',
              args.id as string | undefined,
            );
          }
        }

        if (!entry) {
          return {
            error: `Execution pack not found for type "${packType}"${args.id ? ` and id "${args.id as string}"` : ''}.`,
            available_ids: availableIds,
            hosted_fallback_error: hostedFallbackError ?? undefined,
          };
        }
      }

      const result: Record<string, unknown> = {
        pack_type: packType,
        id: entry.id,
        manifest: entry,
        source: manifestSource,
      };

      const localPayload = {
        markdown: null as string | null,
        json: null as unknown,
      };

      if (manifestSource === 'local') {
        if (format === 'markdown' || format === 'both') {
          const markdownPath = join(contextDir, entry.markdown);
          if (existsSync(markdownPath)) {
            localPayload.markdown = readFileSync(markdownPath, 'utf-8');
          }
        }

        if (format === 'json' || format === 'both') {
          const jsonPath = join(contextDir, entry.json);
          if (existsSync(jsonPath)) {
            localPayload.json = JSON.parse(readFileSync(jsonPath, 'utf-8'));
          }
        }
      }

      if (hasExecutionPackPayload(localPayload)) {
        if (format === 'markdown' || format === 'both') {
          result.markdown = localPayload.markdown;
        }
        if (format === 'json' || format === 'both') {
          result.json = localPayload.json;
        }
        return result;
      }

      if (!hostedSelectedPack) {
        const hosted = await loadHostedSelectedExecutionPackFallback(args);
        hostedSelectedPack = hosted.selected;
        hostedFallbackError = hosted.error;
      }

      if (!hostedSelectedPack) {
        return {
          ...result,
          hosted_fallback_error: hostedFallbackError ?? undefined,
        };
      }

      manifest = hostedSelectedPack.manifest as PackManifest;
      manifestSource = 'hosted_fallback';
      const hostedPayload = toHostedExecutionPackPayload(hostedSelectedPack.pack);

      if (format === 'markdown' || format === 'both') {
        result.markdown = hostedPayload.markdown;
      }
      if (format === 'json' || format === 'both') {
        result.json = hostedPayload.json;
      }

      return result;
    }

    case 'decantr_get_showcase_benchmarks': {
      const view = (args.view as string | undefined) ?? 'shortlist';
      if (!['manifest', 'shortlist', 'verification'].includes(view)) {
        return { error: `Unsupported showcase benchmark view: ${view}` };
      }

      return getShowcaseBenchmarkPayload(view);
    }

    case 'decantr_get_registry_intelligence_summary': {
      if (args.namespace != null && typeof args.namespace !== 'string') {
        return { error: 'Invalid namespace. Must be a string when provided.' };
      }

      return getRegistryIntelligenceSummaryPayload(args.namespace as string | undefined);
    }

    case 'decantr_compile_execution_packs': {
      if (args.path != null && typeof args.path !== 'string') {
        return { error: 'Invalid path. Must be a string when provided.' };
      }
      if (args.namespace != null && typeof args.namespace !== 'string') {
        return { error: 'Invalid namespace. Must be a string when provided.' };
      }
      if (
        args.essence != null &&
        (typeof args.essence !== 'object' || Array.isArray(args.essence))
      ) {
        return { error: 'Invalid essence. Must be an object when provided.' };
      }

      return getHostedExecutionPackBundlePayload(args);
    }

    case 'decantr_critique': {
      const err = validateStringArg(args, 'file_path');
      if (err) return { error: err };
      if (args.path != null && typeof args.path !== 'string') {
        return { error: 'Invalid path. Must be a string when provided.' };
      }
      if (args.namespace != null && typeof args.namespace !== 'string') {
        return { error: 'Invalid namespace. Must be a string when provided.' };
      }
      if (args.treatments_path != null && typeof args.treatments_path !== 'string') {
        return { error: 'Invalid treatments_path. Must be a string when provided.' };
      }
      if (args.allow_hosted_upload != null && typeof args.allow_hosted_upload !== 'boolean') {
        return { error: 'Invalid allow_hosted_upload. Must be a boolean when provided.' };
      }
      const { critiqueFile } = await import('./critique.js');
      const localReviewPackPath = join(process.cwd(), '.decantr', 'context', 'review-pack.json');
      if (existsSync(localReviewPackPath)) {
        return critiqueFile(args.file_path as string, process.cwd());
      }

      if (allowsHostedUpload(args)) {
        const hosted = await loadHostedFileCritiqueFallback(args);
        if (hosted.report) {
          return hosted.report;
        }
      }

      return critiqueFile(args.file_path as string, process.cwd());
    }

    case 'decantr_audit_project': {
      if (args.path != null && typeof args.path !== 'string') {
        return { error: 'Invalid path. Must be a string when provided.' };
      }
      if (args.namespace != null && typeof args.namespace !== 'string') {
        return { error: 'Invalid namespace. Must be a string when provided.' };
      }
      if (args.dist_path != null && typeof args.dist_path !== 'string') {
        return { error: 'Invalid dist_path. Must be a string when provided.' };
      }
      if (args.sources_path != null && typeof args.sources_path !== 'string') {
        return { error: 'Invalid sources_path. Must be a string when provided.' };
      }
      if (args.allow_hosted_upload != null && typeof args.allow_hosted_upload !== 'boolean') {
        return { error: 'Invalid allow_hosted_upload. Must be a boolean when provided.' };
      }
      const { auditProject } = await import('@decantr/verifier');
      const projectRoot = process.cwd();
      const hasReviewPack = existsSync(
        join(projectRoot, '.decantr', 'context', 'review-pack.json'),
      );
      const hasPackManifest = existsSync(
        join(projectRoot, '.decantr', 'context', 'pack-manifest.json'),
      );

      if (hasReviewPack && hasPackManifest) {
        return auditProject(projectRoot);
      }

      if (allowsHostedUpload(args)) {
        const hosted = await loadHostedProjectAuditFallback(args);
        if (hosted.report) {
          return hosted.report;
        }
      }

      return auditProject(projectRoot);
    }

    case 'decantr_get_evidence_bundle': {
      try {
        const projectRoot = resolveMcpProjectRoot(args.project_path);
        const state = await getMcpHealthState(projectRoot);
        return state.evidence;
      } catch (error) {
        return { error: (error as Error).message };
      }
    }

    case 'decantr_workspace_health': {
      if (args.workspace_root != null && typeof args.workspace_root !== 'string') {
        return { error: 'Invalid workspace_root. Must be a string when provided.' };
      }
      if (
        args.max_projects != null &&
        (typeof args.max_projects !== 'number' || !Number.isFinite(args.max_projects))
      ) {
        return { error: 'Invalid max_projects. Must be a finite number when provided.' };
      }
      try {
        return await getMcpWorkspaceHealth(args);
      } catch (error) {
        return { error: (error as Error).message };
      }
    }

    case 'decantr_get_repair_prompt': {
      if (args.finding_id != null && typeof args.finding_id !== 'string') {
        return { error: 'Invalid finding_id. Must be a string when provided.' };
      }
      try {
        const projectRoot = resolveMcpProjectRoot(args.project_path);
        const state = await getMcpHealthState(projectRoot);
        const finding =
          (typeof args.finding_id === 'string'
            ? state.report.findings.find((entry) => entry.id === args.finding_id)
            : undefined) ??
          state.report.findings.find((entry) => entry.severity === 'error') ??
          state.report.findings.find((entry) => entry.severity === 'warn') ??
          state.report.findings[0] ??
          null;
        if (!finding) {
          return {
            project: state.evidence.project,
            health: state.evidence.health,
            prompt: null,
            message: 'No Project Health findings require repair.',
            commands: ['decantr health --evidence'],
          };
        }
        return {
          project: state.evidence.project,
          health: state.evidence.health,
          finding: {
            id: finding.id,
            source: finding.source,
            severity: finding.severity,
            category: finding.category,
            message: finding.message,
          },
          prompt: finding.remediation.prompt,
          commands: finding.remediation.commands,
        };
      } catch (error) {
        return { error: (error as Error).message };
      }
    }

    case 'decantr_run_health_loop': {
      if (args.finding_id != null && typeof args.finding_id !== 'string') {
        return { error: 'Invalid finding_id. Must be a string when provided.' };
      }
      try {
        const projectRoot = resolveMcpProjectRoot(args.project_path);
        const state = await getMcpHealthState(projectRoot);
        const finding =
          (typeof args.finding_id === 'string'
            ? state.report.findings.find((entry) => entry.id === args.finding_id)
            : undefined) ??
          state.report.findings.find((entry) => entry.severity === 'error') ??
          state.report.findings.find((entry) => entry.severity === 'warn') ??
          state.report.findings[0] ??
          null;
        return {
          project: state.evidence.project,
          health: state.evidence.health,
          report: state.report,
          evidence: state.evidence,
          repair:
            finding === null
              ? {
                  finding: null,
                  prompt: null,
                  commands: ['decantr health --evidence'],
                  message: 'No Project Health findings require repair.',
                }
              : {
                  finding: {
                    id: finding.id,
                    source: finding.source,
                    severity: finding.severity,
                    category: finding.category,
                    message: finding.message,
                  },
                  prompt: finding.remediation.prompt,
                  commands: finding.remediation.commands,
                },
        };
      } catch (error) {
        return { error: (error as Error).message };
      }
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// --- Internal helpers for accept_drift ---

function listEssencePages(essence: EssenceV4): Array<BlueprintPage & { sectionId: string }> {
  return essence.blueprint.sections.flatMap((section) =>
    section.pages.map((page) => ({ ...page, sectionId: section.id })),
  );
}

function getMutablePage(
  essence: EssenceV4,
  id: string,
  sectionId?: string,
): {
  page: BlueprintPage;
  section: EssenceV4['blueprint']['sections'][number];
  index: number;
} | null {
  for (const section of essence.blueprint.sections) {
    if (sectionId && section.id !== sectionId) continue;
    const index = section.pages.findIndex((page) => page.id === id);
    if (index !== -1) {
      return { page: section.pages[index], section, index };
    }
  }
  return null;
}

function getDefaultSection(essence: EssenceV4): EssenceV4['blueprint']['sections'][number] {
  const section =
    essence.blueprint.sections.find((s) => s.role === 'primary') ?? essence.blueprint.sections[0];
  if (!section) {
    throw new Error('Essence v4 requires at least one blueprint section.');
  }
  return section;
}

function applyDriftAcceptance(
  essence: EssenceV4,
  violation: { rule: string; page_id?: string; details?: string },
  resolution: string,
  scope?: string,
): void {
  switch (violation.rule) {
    case 'theme-match':
    case 'theme':
    case 'style': {
      // Accept a theme change: update the DNA theme id
      if (violation.details) {
        essence.dna.theme.id = violation.details;
      }
      break;
    }
    case 'page-exists':
    case 'structure': {
      // Accept a missing page: add it to the blueprint
      if (violation.page_id) {
        const section = getDefaultSection(essence);
        const existing = getMutablePage(essence, violation.page_id);
        if (!existing) {
          section.pages.push({
            id: violation.page_id,
            layout: [],
          });
        }
      }
      break;
    }
    case 'layout': {
      // Layout drift: this is typically accept_scoped to a page
      // No automatic patch for layout acceptance — it's acknowledged
      break;
    }
    case 'density': {
      // density drift: acknowledged
      break;
    }
    default:
      break;
  }
}

// --- Internal helpers for update_essence ---

function applyEssenceUpdate(
  essence: EssenceV4,
  operation: string,
  payload: Record<string, unknown>,
): EssenceV4 {
  switch (operation) {
    case 'add_page': {
      const id = payload.id as string;
      if (!id) throw new Error('Payload must include "id" for add_page.');
      const sectionId = payload.section_id as string | undefined;
      const section = sectionId
        ? essence.blueprint.sections.find((candidate) => candidate.id === sectionId)
        : getDefaultSection(essence);
      if (!section) throw new Error(`Section "${sectionId}" not found.`);
      const existing = getMutablePage(essence, id, section.id);
      if (existing) throw new Error(`Page "${id}" already exists.`);
      section.pages.push({
        id,
        layout: (payload.layout as string[]) || [],
        ...(payload.route ? { route: payload.route as string } : {}),
        ...(payload.shell_override ? { shell_override: payload.shell_override as string } : {}),
        ...(payload.surface ? { surface: payload.surface as string } : {}),
      });
      break;
    }
    case 'remove_page': {
      const id = payload.id as string;
      if (!id) throw new Error('Payload must include "id" for remove_page.');
      const match = getMutablePage(essence, id, payload.section_id as string | undefined);
      if (!match) throw new Error(`Page "${id}" not found.`);
      match.section.pages.splice(match.index, 1);
      break;
    }
    case 'update_page_layout': {
      const id = payload.id as string;
      const layout = payload.layout as unknown[];
      if (!id) throw new Error('Payload must include "id" for update_page_layout.');
      if (!layout || !Array.isArray(layout))
        throw new Error('Payload must include "layout" array for update_page_layout.');
      const match = getMutablePage(essence, id, payload.section_id as string | undefined);
      if (!match) throw new Error(`Page "${id}" not found.`);
      match.page.layout = layout as BlueprintPage['layout'];
      break;
    }
    case 'update_dna': {
      // Shallow merge payload into dna
      for (const [key, value] of Object.entries(payload)) {
        if (
          key in essence.dna &&
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          // Deep merge one level for sub-objects like theme, spacing, etc.
          (essence.dna as Record<string, unknown>)[key] = {
            ...(essence.dna as Record<string, Record<string, unknown>>)[key],
            ...(value as Record<string, unknown>),
          };
        } else {
          (essence.dna as Record<string, unknown>)[key] = value;
        }
      }
      break;
    }
    case 'update_blueprint': {
      // Shallow merge payload into blueprint (except sections, managed via page/section operations)
      for (const [key, value] of Object.entries(payload)) {
        if (key === 'pages' || key === 'sections') continue;
        (essence.blueprint as Record<string, unknown>)[key] = value;
      }
      break;
    }
    case 'add_feature': {
      const feature = payload.feature as string;
      if (!feature) throw new Error('Payload must include "feature" for add_feature.');
      if (!essence.blueprint.features.includes(feature)) {
        essence.blueprint.features.push(feature);
      }
      break;
    }
    case 'remove_feature': {
      const feature = payload.feature as string;
      if (!feature) throw new Error('Payload must include "feature" for remove_feature.');
      const idx = essence.blueprint.features.indexOf(feature);
      if (idx === -1) throw new Error(`Feature "${feature}" not found.`);
      essence.blueprint.features.splice(idx, 1);
      break;
    }
  }
  return essence;
}

function describeUpdate(operation: string, payload: Record<string, unknown>): string {
  switch (operation) {
    case 'add_page':
      return `Added page "${payload.id}".`;
    case 'remove_page':
      return `Removed page "${payload.id}".`;
    case 'update_page_layout':
      return `Updated layout for page "${payload.id}".`;
    case 'update_dna':
      return `Updated DNA: ${Object.keys(payload).join(', ')}.`;
    case 'update_blueprint':
      return `Updated blueprint: ${Object.keys(payload).join(', ')}.`;
    case 'add_feature':
      return `Added feature "${payload.feature}".`;
    case 'remove_feature':
      return `Removed feature "${payload.feature}".`;
    default:
      return `Performed ${operation}.`;
  }
}
