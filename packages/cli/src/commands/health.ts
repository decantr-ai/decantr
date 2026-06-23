import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  anchorFindingsToGraph,
  auditProject,
  buildProjectHealthRepairPlan,
  type ContractAssertion,
  createAuthorityResolution,
  createContractAssertions,
  createEvidenceBundle,
  createEvidenceTier,
  createLoopReadiness,
  deriveVerificationDiagnostic,
  type EvidenceBundle,
  type GraphAnchorSnapshot,
  KNOWN_VERIFICATION_DIAGNOSTICS,
  type PackManifest,
  PROJECT_HEALTH_REPORT_V2_SCHEMA_URL,
  type ProjectHealthFinding,
  type ProjectHealthFindingSource,
  type ProjectHealthReport,
  type ProjectHealthStatus,
  type VerificationFinding,
  type VerificationGraphAnchor,
  type VerificationRepairAction,
  type VerificationSeverity,
} from '@decantr/verifier';
import {
  sendProjectHealthCiFailedTelemetry,
  sendProjectHealthPromptTelemetry,
  sendProjectHealthReportTelemetry,
} from '../telemetry.js';
import { resolveWorkspaceInfo } from '../workspace.js';
import { buildGraphArtifacts } from './graph.js';
import { type CheckIssue, collectCheckIssues } from './heal.js';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const PROJECT_HEALTH_SCHEMA_URL = PROJECT_HEALTH_REPORT_V2_SCHEMA_URL;
const DEFAULT_HEALTH_CI_WORKFLOW_PATH = '.github/workflows/decantr-health.yml';
const DEFAULT_HEALTH_CI_REPORT_PATH = 'decantr-health.md';
const DEFAULT_HEALTH_CI_JSON_PATH = 'decantr-health.json';
const DEFAULT_HEALTH_CI_CLI_VERSION = 'latest';
const __dirname = dirname(fileURLToPath(import.meta.url));
const HEALTH_BROWSER_RUNTIME_DIAGNOSTICS = [
  {
    rule: 'browser-runtime-probes-failed',
    code: 'RUNTIME010',
    repairId: 'repair-browser-runtime-probes',
    family: 'RUNTIME',
  },
  {
    rule: 'browser-axe-violations',
    code: 'A11Y020',
    repairId: 'fix-rendered-accessibility',
    family: 'A11Y',
  },
] as const;

export type HealthOutputFormat = 'text' | 'json' | 'markdown';
export type HealthFailOn = 'error' | 'warn' | 'none';

export interface HealthCommandOptions {
  format?: HealthOutputFormat;
  json?: boolean;
  markdown?: boolean;
  output?: string;
  ci?: boolean;
  failOn?: HealthFailOn;
  promptId?: string;
  evidence?: boolean;
  browser?: boolean;
  requireBrowser?: boolean;
  browserBaseUrl?: string;
  designTokensPath?: string;
  initCi?: HealthCiOptions;
  saveBaseline?: boolean;
  sinceBaseline?: boolean;
  diagnostics?: boolean;
}

export interface HealthCiOptions {
  force?: boolean;
  failOn?: HealthFailOn;
  cliVersion?: string;
  workflowPath?: string;
  reportPath?: string;
  jsonPath?: string;
  projectPath?: string;
  workspace?: boolean;
}

export interface HealthCiWriteResult {
  path: string;
  created: boolean;
  cliPackage: string;
  failOn: HealthFailOn;
  projectPath?: string;
  workspace?: boolean;
}

export interface ProjectHealthReportOptions {
  browser?: boolean;
  requireBrowser?: boolean;
  browserBaseUrl?: string;
  designTokensPath?: string;
}

interface ProjectMetadata {
  workflowMode: string | null;
  adoptionMode: string | null;
  autoBrownfield: boolean;
}

interface ProjectCommandContext {
  projectPath: string | null;
  buildCommand: string;
  compilePacksCommand: string;
  verifyCommand: string;
  ciCommand: string;
  promptCommand(id: string): string;
}

interface BrowserVerificationResult {
  evidence: NonNullable<EvidenceBundle['browser']>;
  findings: ProjectHealthFinding[];
}

type BrowserProbeStatus = 'passed' | 'failed' | 'skipped';

interface BrowserRouteRenderedProbe {
  status: Exclude<BrowserProbeStatus, 'skipped'>;
  readyState: string | null;
  url: string | null;
  title: string | null;
  bodyPresent: boolean;
  appRootPresent: boolean;
  bodyChildCount: number;
  reason?: string;
}

interface BrowserNonblankDomProbe {
  status: Exclude<BrowserProbeStatus, 'skipped'>;
  textLength: number;
  meaningfulElementCount: number;
  mediaElementCount: number;
  controlElementCount: number;
  reason?: string;
}

interface BrowserInteractionStyleProbe {
  status: BrowserProbeStatus;
  checked: number;
  matchedClasses: string[];
  animatedOrTransitioned: number;
  missing: string[];
  reason?: string;
}

interface BrowserConsoleProbe {
  status: Exclude<BrowserProbeStatus, 'skipped'>;
  count: number;
  messages: string[];
}

interface BrowserAccessibilityProbe {
  status: BrowserProbeStatus;
  engine: 'axe-core';
  violations: number;
  incomplete: number;
  messages: string[];
  reason?: string;
}

interface BrowserRuntimeProbeManifest {
  routeRendered: BrowserRouteRenderedProbe;
  nonblankDom: BrowserNonblankDomProbe;
  consoleErrors: BrowserConsoleProbe;
  pageErrors: BrowserConsoleProbe;
  interactionStyles: BrowserInteractionStyleProbe;
  accessibility: BrowserAccessibilityProbe;
}

interface VisualManifestRoute {
  route: string;
  url: string;
  screenshot: string | null;
  screenshotHash: string | null;
  status: 'captured' | 'failed';
  runtime?: BrowserRuntimeProbeManifest;
  error?: string;
}

interface VisualManifest {
  version: 1;
  generatedAt: string;
  localOnly: true;
  baseUrl: string;
  routes: VisualManifestRoute[];
}

interface HealthBaseline {
  version: 1;
  generatedAt: string;
  status: ProjectHealthStatus;
  score: number;
  findings: Array<{
    id: string;
    severity: VerificationSeverity;
    source: ProjectHealthFindingSource;
    message: string;
  }>;
  routes: string[];
  packs: ProjectHealthReport['packs'];
  screenshots: Array<{ path: string; hash: string | null }>;
  changedFilesCommand: string;
}

interface HealthBaselineComparison {
  baselinePath: string;
  savedAt: string | null;
  statusChanged: boolean;
  scoreDelta: number | null;
  addedFindings: string[];
  resolvedFindings: string[];
  changedFiles: string[];
  changedRoutes: string[];
  changedScreenshots: string[];
  contractDrift: string[];
}

interface PlaywrightLike {
  chromium: {
    launch(options: { headless: boolean }): Promise<{
      newPage(): Promise<BrowserPageLike>;
      close(): Promise<unknown>;
    }>;
  };
}

interface BrowserConsoleMessageLike {
  type?(): string;
  text?(): string;
}

interface BrowserPageLike {
  goto(
    url: string,
    options: { waitUntil: 'load' | 'domcontentloaded' | 'networkidle'; timeout: number },
  ): Promise<unknown>;
  screenshot(options: { path: string; fullPage: boolean }): Promise<unknown>;
  evaluate<T, Arg = unknown>(
    pageFunction: ((arg: Arg) => T | Promise<T>) | string,
    arg?: Arg,
  ): Promise<T>;
  addScriptTag?(options: { content?: string; path?: string; url?: string }): Promise<unknown>;
  on?(event: 'console', handler: (message: BrowserConsoleMessageLike) => void): unknown;
  on?(event: 'pageerror', handler: (error: Error) => void): unknown;
  close?(): Promise<unknown>;
}

function readProjectMetadata(projectRoot: string): ProjectMetadata {
  const projectJsonPath = join(projectRoot, '.decantr', 'project.json');
  if (!existsSync(projectJsonPath)) {
    return { workflowMode: null, adoptionMode: null, autoBrownfield: false };
  }

  try {
    const data = JSON.parse(readFileSync(projectJsonPath, 'utf-8')) as {
      initialized?: {
        workflowMode?: unknown;
        adoptionMode?: unknown;
      };
    };
    const workflowMode =
      typeof data.initialized?.workflowMode === 'string' ? data.initialized.workflowMode : null;
    const adoptionMode =
      typeof data.initialized?.adoptionMode === 'string' ? data.initialized.adoptionMode : null;
    return {
      workflowMode,
      adoptionMode,
      autoBrownfield: workflowMode === 'brownfield-attach',
    };
  } catch {
    return { workflowMode: null, adoptionMode: null, autoBrownfield: false };
  }
}

function loadHealthTemplate(name: string): string {
  const fromDist = join(__dirname, '..', 'src', 'templates', name);
  if (existsSync(fromDist)) return readFileSync(fromDist, 'utf-8');
  const fromSrc = join(__dirname, '..', 'templates', name);
  if (existsSync(fromSrc)) return readFileSync(fromSrc, 'utf-8');
  const fromCommandSrc = join(__dirname, '..', '..', 'templates', name);
  if (existsSync(fromCommandSrc)) return readFileSync(fromCommandSrc, 'utf-8');
  throw new Error(`Template not found: ${name}`);
}

function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

function normalizeCliPackageSpecifier(version: string | undefined): string {
  const value = (version || DEFAULT_HEALTH_CI_CLI_VERSION).trim();
  if (!value) return `@decantr/cli@${DEFAULT_HEALTH_CI_CLI_VERSION}`;
  const versionToken = value.startsWith('@decantr/cli@')
    ? value.slice('@decantr/cli@'.length)
    : value;
  if (!/^[A-Za-z0-9._~^*-]+$/.test(versionToken)) {
    throw new Error(
      'Invalid --cli-version value. Use a package version or dist-tag such as latest, 2.0.0, or next.',
    );
  }
  return `@decantr/cli@${versionToken}`;
}

function normalizeHealthFailOn(value: HealthFailOn | undefined): HealthFailOn {
  const failOn = value ?? 'error';
  if (!['error', 'warn', 'none'].includes(failOn)) {
    throw new Error('Invalid --fail-on value. Use error, warn, or none.');
  }
  return failOn;
}

function validateWorkflowPath(value: string): string {
  const normalized = value.trim();
  if (
    !normalized ||
    normalized.startsWith('/') ||
    normalized.startsWith('-') ||
    normalized.includes('..') ||
    normalized.includes('\\') ||
    /\s/.test(normalized)
  ) {
    throw new Error(
      'Invalid --workflow-path value. Use a relative path without spaces or parent-directory segments.',
    );
  }
  return normalized;
}

function validateArtifactPath(value: string, flag: string): string {
  const normalized = value.trim();
  if (
    !normalized ||
    normalized.startsWith('/') ||
    normalized.startsWith('-') ||
    normalized.includes('..') ||
    normalized.includes('\\') ||
    /\s/.test(normalized)
  ) {
    throw new Error(
      `Invalid ${flag} value. Use a relative artifact path without spaces or parent-directory segments.`,
    );
  }
  return normalized;
}

function validateProjectPath(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const raw = value.trim();
  if (!raw || raw === '.') return undefined;
  const normalized = raw.replace(/^\.\/+/, '').replace(/\/+$/, '');
  if (
    !normalized ||
    normalized.startsWith('/') ||
    normalized.startsWith('-') ||
    normalized.includes('..') ||
    normalized.includes('\\') ||
    /\s/.test(normalized) ||
    !/^[A-Za-z0-9._@/-]+$/.test(normalized)
  ) {
    throw new Error(
      'Invalid --project value. Use a relative project path without spaces or parent-directory segments.',
    );
  }

  const segments = normalized.split('/');
  if (segments.some((segment) => !segment || segment === '.' || segment === '..')) {
    throw new Error(
      'Invalid --project value. Use a relative project path without empty or parent-directory segments.',
    );
  }

  return normalized;
}

function prefixArtifactPath(projectPath: string | undefined, artifactPath: string): string {
  return projectPath ? `${projectPath}/${artifactPath}` : artifactPath;
}

export function renderProjectHealthCiWorkflow(options: HealthCiOptions = {}): string {
  const failOn = normalizeHealthFailOn(options.failOn);
  const projectPath = options.workspace ? undefined : validateProjectPath(options.projectPath);
  const reportPath = validateArtifactPath(
    options.reportPath ||
      (options.workspace ? '.decantr/workspace-health.md' : DEFAULT_HEALTH_CI_REPORT_PATH),
    '--report-path',
  );
  const jsonPath = validateArtifactPath(
    options.jsonPath ||
      (options.workspace ? '.decantr/workspace-health.json' : DEFAULT_HEALTH_CI_JSON_PATH),
    '--json-path',
  );
  const template = loadHealthTemplate('decantr-health.workflow.yml.template');
  return renderTemplate(template, {
    CLI_PACKAGE: normalizeCliPackageSpecifier(options.cliVersion),
    FAIL_ON: failOn,
    HEALTH_COMMAND: options.workspace ? 'workspace health' : 'health',
    PROJECT_WORKING_DIRECTORY: projectPath ? `        working-directory: ${projectPath}\n` : '',
    REPORT_PATH: reportPath,
    JSON_PATH: jsonPath,
    REPORT_ARTIFACT_PATH: prefixArtifactPath(projectPath, reportPath),
    JSON_ARTIFACT_PATH: prefixArtifactPath(projectPath, jsonPath),
  });
}

export function writeProjectHealthCiWorkflow(
  projectRoot: string,
  options: HealthCiOptions = {},
): HealthCiWriteResult {
  const workflowRelativePath = validateWorkflowPath(
    options.workflowPath || DEFAULT_HEALTH_CI_WORKFLOW_PATH,
  );
  const workflowPath = join(projectRoot, workflowRelativePath);
  const alreadyExists = existsSync(workflowPath);
  if (alreadyExists && !options.force) {
    throw new Error(
      `${workflowRelativePath} already exists. Re-run with --force to replace it, or use --workflow-path <file>.`,
    );
  }

  mkdirSync(dirname(workflowPath), { recursive: true });
  writeFileSync(workflowPath, renderProjectHealthCiWorkflow(options), 'utf-8');
  const projectPath = options.workspace ? undefined : validateProjectPath(options.projectPath);

  const result: HealthCiWriteResult = {
    path: workflowRelativePath,
    created: !alreadyExists,
    cliPackage: normalizeCliPackageSpecifier(options.cliVersion),
    failOn: normalizeHealthFailOn(options.failOn),
  };
  if (projectPath) result.projectPath = projectPath;
  if (options.workspace) result.workspace = true;
  return result;
}

function collectDeclaredRoutes(essence: unknown): string[] {
  if (!essence || typeof essence !== 'object') return [];
  const record = essence as Record<string, unknown>;
  const blueprint = record.blueprint;
  if (!blueprint || typeof blueprint !== 'object') return [];
  const bp = blueprint as Record<string, unknown>;
  const routes = new Set<string>();

  if (bp.routes && typeof bp.routes === 'object' && !Array.isArray(bp.routes)) {
    for (const route of Object.keys(bp.routes)) {
      routes.add(route);
    }
  }

  const flatPages = Array.isArray(bp.pages) ? bp.pages : [];
  for (const page of flatPages) {
    if (page && typeof page === 'object') {
      const route = (page as Record<string, unknown>).route;
      if (typeof route === 'string') routes.add(route);
    }
  }

  const sections = Array.isArray(bp.sections) ? bp.sections : [];
  for (const section of sections) {
    if (!section || typeof section !== 'object') continue;
    const pages = (section as Record<string, unknown>).pages;
    if (!Array.isArray(pages)) continue;
    for (const page of pages) {
      if (page && typeof page === 'object') {
        const route = (page as Record<string, unknown>).route;
        if (typeof route === 'string') routes.add(route);
      }
    }
  }

  return [...routes].sort();
}

function severityFromCheckIssue(issue: CheckIssue): VerificationSeverity {
  return issue.type === 'error' ? 'error' : 'warn';
}

function sourceFromAuditFinding(finding: VerificationFinding): ProjectHealthFindingSource {
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
    category.includes('behavior') ||
    id.includes('interaction') ||
    id.includes('behavior') ||
    rule.includes('interaction')
  ) {
    return 'interaction';
  }
  if (
    category.includes('style bridge') ||
    id.includes('style-bridge') ||
    rule.includes('style-bridge')
  ) {
    return 'style-bridge';
  }
  return 'audit';
}

function sourceFromCheckIssue(issue: CheckIssue): ProjectHealthFindingSource {
  if (issue.rule.startsWith('brownfield-')) return 'brownfield';
  if (issue.rule.includes('interaction')) return 'interaction';
  return 'check';
}

function normalizeHealthCategory(category: string, source: ProjectHealthFindingSource): string {
  const lower = category.toLowerCase();
  if (
    source === 'pack' ||
    lower.includes('execution pack') ||
    lower.includes('review contract') ||
    lower.includes('context')
  ) {
    return 'Generated Artifact';
  }
  if (source === 'brownfield') return 'Brownfield Contract';
  if (source === 'design-token' || lower.includes('design-token')) return 'Design Token';
  if (source === 'style-bridge' || lower.includes('style bridge')) return 'Style Bridge';
  if (source === 'graph') return 'Typed Contract Graph';
  if (lower.includes('behavior obligation')) return 'Behavior Obligation';
  if (lower.includes('accessibility')) return 'Accessibility';
  if (source === 'runtime') return 'Runtime';
  if (source === 'browser') return 'Visual Evidence';
  if (source === 'interaction') return 'Interaction';
  if (source === 'assertion') return `Contract ${category}`;
  return category;
}

function contractAssertionApplies(
  assertion: ContractAssertion,
  metadata: ProjectMetadata,
): boolean {
  const projectOwnedStyling =
    metadata.adoptionMode === 'contract-only' || metadata.adoptionMode === 'style-bridge';
  if (assertion.rule === 'tokens-file-present' && projectOwnedStyling) {
    return false;
  }
  if (
    projectOwnedStyling &&
    (assertion.rule === 'pack-manifest-present' || assertion.rule === 'review-pack-present')
  ) {
    return false;
  }
  return true;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function hashFile(path: string): string | null {
  if (!existsSync(path)) return null;
  try {
    return createHash('sha256').update(readFileSync(path)).digest('hex');
  } catch {
    return null;
  }
}

function readJsonFile<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function readProjectGraphSnapshot(projectRoot: string): GraphAnchorSnapshot | null {
  return readJsonFile<GraphAnchorSnapshot>(
    join(projectRoot, '.decantr', 'graph', 'graph.snapshot.json'),
  );
}

function anchorProjectHealthFindings(
  projectRoot: string,
  findings: ProjectHealthFinding[],
): ProjectHealthFinding[] {
  return anchorFindingsToGraph(readProjectGraphSnapshot(projectRoot), findings);
}

function inspectProjectHealthGraph(projectRoot: string): ProjectHealthReport['graph'] {
  const graphDir = join(projectRoot, '.decantr', 'graph');
  const snapshotPath = join(graphDir, 'graph.snapshot.json');
  const manifestPath = join(graphDir, 'graph.manifest.json');
  const diffPath = join(graphDir, 'graph.diff.json');
  const capsulePath = join(graphDir, 'contract-capsule.json');
  const projectMetadataPresent = existsSync(join(projectRoot, '.decantr', 'project.json'));
  const graphDirPresent = existsSync(graphDir);
  const snapshot = readProjectGraphSnapshot(projectRoot);
  const capsule = readJsonFile<{
    contract_hash?: string;
    contract_cache_key?: string;
    source_artifact_limit?: number;
    source_artifacts_truncated?: boolean;
    summary?: { source_artifacts?: number };
  }>(capsulePath);

  try {
    const artifacts = buildGraphArtifacts(projectRoot);
    const current = artifacts
      ? artifacts.staleArtifacts.length === 0
      : projectMetadataPresent
        ? false
        : null;
    return {
      present: graphDirPresent,
      ready: current === true && existsSync(snapshotPath) && existsSync(capsulePath),
      current,
      snapshotPresent: existsSync(snapshotPath),
      manifestPresent: existsSync(manifestPath),
      diffPresent: existsSync(diffPath),
      capsulePresent: existsSync(capsulePath),
      snapshotId: snapshot?.id ?? artifacts?.snapshot.id ?? null,
      sourceHash: snapshot?.source_hash ?? artifacts?.snapshot.source_hash ?? null,
      contractHash: capsule?.contract_hash ?? artifacts?.capsule.contract_hash ?? null,
      contractCacheKey:
        capsule?.contract_cache_key ?? artifacts?.capsule.contract_cache_key ?? null,
      sourceArtifactCount:
        snapshot?.nodes.filter((node) => node.type === 'SourceArtifact').length ??
        artifacts?.snapshot.nodes.filter((node) => node.type === 'SourceArtifact').length ??
        capsule?.summary?.source_artifacts ??
        0,
      capsuleSourceArtifactLimit:
        capsule?.source_artifact_limit ?? artifacts?.capsule.source_artifact_limit ?? null,
      capsuleSourceArtifactsTruncated:
        capsule?.source_artifacts_truncated ??
        artifacts?.capsule.source_artifacts_truncated ??
        null,
      staleArtifacts: artifacts
        ? artifacts.staleArtifacts.map((path) => relative(projectRoot, path).replace(/\\/g, '/'))
        : [],
      error: null,
    };
  } catch (error) {
    return {
      present: graphDirPresent,
      ready: false,
      current: graphDirPresent || projectMetadataPresent ? false : null,
      snapshotPresent: existsSync(snapshotPath),
      manifestPresent: existsSync(manifestPath),
      diffPresent: existsSync(diffPath),
      capsulePresent: existsSync(capsulePath),
      snapshotId: snapshot?.id ?? null,
      sourceHash: snapshot?.source_hash ?? null,
      contractHash: capsule?.contract_hash ?? null,
      contractCacheKey: capsule?.contract_cache_key ?? null,
      sourceArtifactCount:
        snapshot?.nodes.filter((node) => node.type === 'SourceArtifact').length ??
        capsule?.summary?.source_artifacts ??
        0,
      capsuleSourceArtifactLimit: capsule?.source_artifact_limit ?? null,
      capsuleSourceArtifactsTruncated: capsule?.source_artifacts_truncated ?? null,
      staleArtifacts: [],
      error: (error as Error).message,
    };
  }
}

function collectGraphArtifactFindings(
  projectRoot: string,
  graph: ProjectHealthReport['graph'],
): ProjectHealthFinding[] {
  const graphDirPresent = existsSync(join(projectRoot, '.decantr', 'graph'));
  const projectMetadataPresent = existsSync(join(projectRoot, '.decantr', 'project.json'));
  if (!graphDirPresent && !projectMetadataPresent) {
    return [];
  }

  if (graph.error) {
    return [
      createHealthFinding({
        source: 'graph',
        category: 'Typed Contract Graph',
        severity: 'warn',
        message: `Typed Contract graph could not be derived: ${graph.error}`,
        evidence: [
          'Graph derivation reads decantr.essence.json, local rules, style bridge, Brownfield analysis, reusable component declarations, visual manifest, and saved evidence bundle artifacts.',
        ],
        target: '.decantr/graph',
        rule: 'typed-graph-current',
        suggestedFix: graph.error.includes('Essence v4')
          ? 'Run `decantr migrate --to v4`, then run `decantr graph`.'
          : 'Repair the Decantr contract, then run `decantr graph`.',
        baseId: 'typed-graph-current',
      }),
    ];
  }

  if (graph.current !== false || graph.staleArtifacts.length === 0) {
    return [];
  }

  return [
    createHealthFinding({
      source: 'graph',
      category: 'Typed Contract Graph',
      severity: 'warn',
      message: 'Typed Contract graph artifacts are missing or stale.',
      evidence: graph.staleArtifacts.slice(0, 8),
      target: '.decantr/graph',
      rule: 'typed-graph-current',
      suggestedFix:
        'Run `decantr graph` to regenerate graph snapshot, history, diff, manifest, and capsule.',
      baseId: 'typed-graph-current',
    }),
  ];
}

function commandsForFinding(source: ProjectHealthFindingSource): string[] {
  switch (source) {
    case 'brownfield':
      return ['decantr analyze', 'decantr init --existing --merge-proposal', 'decantr health'];
    case 'pack':
      return [
        'decantr refresh',
        'decantr registry get-pack review --write-context',
        'decantr health',
      ];
    case 'runtime':
      return ['npm run build', 'decantr health'];
    case 'interaction':
      return ['decantr verify --brownfield --local-patterns', 'decantr verify --evidence'];
    case 'assertion':
      return ['decantr refresh', 'decantr health --evidence'];
    case 'browser':
      return ['decantr health --browser', 'decantr health --evidence'];
    case 'design-token':
      return ['decantr export --to figma-tokens', 'decantr health --evidence'];
    case 'style-bridge':
      return ['decantr codify --style-bridge', 'decantr verify --evidence'];
    case 'graph':
      return ['decantr graph', 'decantr verify --evidence'];
    case 'check':
      return ['decantr check', 'decantr health'];
    default:
      return ['decantr audit', 'decantr health'];
  }
}

type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun' | 'unknown';

function detectPackageManager(root: string): PackageManager {
  const pkg = readJsonFile<{ packageManager?: string }>(join(root, 'package.json'));
  const declared = pkg?.packageManager?.split('@')[0];
  if (declared === 'pnpm' || declared === 'npm' || declared === 'yarn' || declared === 'bun') {
    return declared;
  }
  if (existsSync(join(root, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(root, 'package-lock.json'))) return 'npm';
  if (existsSync(join(root, 'yarn.lock'))) return 'yarn';
  if (existsSync(join(root, 'bun.lock')) || existsSync(join(root, 'bun.lockb'))) return 'bun';
  return 'unknown';
}

function buildCommandForProject(workspaceRoot: string, projectPath: string | null): string {
  const packageManager = detectPackageManager(workspaceRoot);
  if (projectPath) {
    switch (packageManager) {
      case 'pnpm':
        return `pnpm --dir ${projectPath} build`;
      case 'yarn':
        return `yarn --cwd ${projectPath} build`;
      case 'bun':
        return `bun --cwd ${projectPath} run build`;
      case 'npm':
        return `npm --prefix ${projectPath} run build`;
      default:
        return `cd ${projectPath} && npm run build`;
    }
  }

  switch (packageManager) {
    case 'pnpm':
      return 'pnpm build';
    case 'yarn':
      return 'yarn build';
    case 'bun':
      return 'bun run build';
    case 'npm':
      return 'npm run build';
    default:
      return 'npm run build';
  }
}

function commandContextForProject(projectRoot: string): ProjectCommandContext {
  const workspaceInfo = resolveWorkspaceInfo(projectRoot);
  const relativeProjectPath = relative(workspaceInfo.workspaceRoot, projectRoot).replace(
    /\\/g,
    '/',
  );
  const projectPath =
    relativeProjectPath && !relativeProjectPath.startsWith('..') && !isAbsolute(relativeProjectPath)
      ? relativeProjectPath
      : null;
  const projectFlag = projectPath ? ` --project ${projectPath}` : '';
  const essencePath = projectPath ? `${projectPath}/decantr.essence.json` : 'decantr.essence.json';

  return {
    projectPath,
    buildCommand: buildCommandForProject(workspaceInfo.workspaceRoot, projectPath),
    compilePacksCommand: `decantr registry compile-packs ${essencePath} --write-context`,
    verifyCommand: `decantr verify${projectFlag}`,
    ciCommand: `decantr ci${projectFlag} --fail-on error`,
    promptCommand: (id: string) => `decantr health${projectFlag} --prompt ${id}`,
  };
}

function rewriteHealthCommand(command: string, context: ProjectCommandContext): string {
  if (command === 'npm run build') return context.buildCommand;

  let rewritten = command.replace(
    /decantr registry compile-packs decantr\.essence\.json --write-context/g,
    context.compilePacksCommand,
  );

  if (!context.projectPath) return rewritten;

  rewritten = rewritten.replace(
    /^decantr init --existing\b/,
    `decantr init --project ${context.projectPath} --existing`,
  );
  rewritten = rewritten.replace(
    /^decantr analyze\b/,
    `decantr analyze --project ${context.projectPath}`,
  );
  rewritten = rewritten.replace(
    /^decantr check\b/,
    `decantr check --project ${context.projectPath}`,
  );
  rewritten = rewritten.replace(
    /^decantr graph\b/,
    `decantr graph --project ${context.projectPath}`,
  );
  rewritten = rewritten.replace(
    /^decantr verify\b/,
    `decantr verify --project ${context.projectPath}`,
  );
  rewritten = rewritten.replace(/^decantr audit\b/, context.verifyCommand);
  rewritten = rewritten.replace(/^decantr health\b/, context.verifyCommand);

  return rewritten;
}

function rewriteSuggestedFixForProject(
  suggestedFix: string | undefined,
  context: ProjectCommandContext,
): string | undefined {
  if (!suggestedFix) return suggestedFix;
  return suggestedFix.replace(
    /decantr registry compile-packs decantr\.essence\.json --write-context/g,
    context.compilePacksCommand,
  );
}

function commandsForProjectFinding(
  finding: ProjectHealthFinding,
  context: ProjectCommandContext,
): string[] {
  const isPackHydrationFinding =
    finding.source === 'pack' ||
    /pack-manifest|review-pack|compile-packs/i.test(
      `${finding.id} ${finding.rule ?? ''} ${finding.suggestedFix ?? ''}`,
    );

  if (isPackHydrationFinding) {
    return [context.compilePacksCommand, context.verifyCommand];
  }

  return [
    ...new Set(
      finding.remediation.commands.map((command) => rewriteHealthCommand(command, context)),
    ),
  ];
}

function scopeHealthFindingsToProject(
  projectRoot: string,
  findings: ProjectHealthFinding[],
): ProjectHealthFinding[] {
  const context = commandContextForProject(projectRoot);
  return findings.map((finding) => {
    const suggestedFix = rewriteSuggestedFixForProject(finding.suggestedFix, context);
    const commands = commandsForProjectFinding(finding, context);
    return {
      ...finding,
      suggestedFix,
      remediation: {
        summary: suggestedFix || finding.remediation.summary,
        commands,
        prompt: buildRemediationPrompt({
          id: finding.id,
          source: finding.source,
          category: finding.category,
          severity: finding.severity,
          message: finding.message,
          code: finding.code,
          evidence: finding.evidence,
          suggestedFix,
          graph: finding.graph,
          repair: finding.repair,
          commands,
          projectPath: context.projectPath,
        }),
      },
    };
  });
}

function buildRemediationPrompt(input: {
  id: string;
  source: ProjectHealthFindingSource;
  category: string;
  severity: VerificationSeverity;
  message: string;
  code?: string;
  evidence: string[];
  suggestedFix?: string;
  graph?: VerificationGraphAnchor;
  repair?: VerificationRepairAction;
  commands: string[];
  projectPath?: string | null;
}): string {
  const prefix = input.projectPath ? `${input.projectPath}/` : '';
  const readTargets = [
    `${prefix}DECANTR.md`,
    `${prefix}decantr.essence.json`,
    `${prefix}.decantr/context/scaffold-pack.md`,
    `${prefix}.decantr/context/scaffold.md`,
  ];
  return [
    'You are fixing one Decantr Project Health finding in this local workspace.',
    '',
    `Read project-scoped Decantr files if they exist: ${readTargets.map((target) => `\`${target}\``).join(', ')}. For route or page work, read the matching page/section packs before editing.`,
    '',
    `Finding: ${input.id}`,
    `Source: ${input.source}`,
    `Severity: ${input.severity}`,
    `Category: ${input.category}`,
    input.code ? `Code: ${input.code}` : null,
    `Message: ${input.message}`,
    input.graph
      ? `Graph anchor: ${input.graph.node_type} ${input.graph.node_id} (${input.graph.confidence}; snapshot ${input.graph.snapshot_id})`
      : null,
    input.repair ? `Repair: ${input.repair.id}` : null,
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

function createHealthFinding(input: {
  source: ProjectHealthFindingSource;
  category: string;
  severity: VerificationSeverity;
  message: string;
  evidence?: string[];
  target?: string;
  file?: string;
  rule?: string;
  suggestedFix?: string;
  code?: string;
  repair?: VerificationRepairAction;
  baseId?: string;
}): ProjectHealthFinding {
  const idBase = input.baseId || input.rule || `${input.category}-${input.message}`;
  const id = `${input.source}-${slugify(idBase)}`;
  const commands = commandsForFinding(input.source);
  const category = normalizeHealthCategory(input.category, input.source);
  const diagnostic = deriveVerificationDiagnostic({
    id,
    source: input.source,
    category,
    message: input.message,
    rule: input.rule,
    target: input.target,
    file: input.file,
    suggestedFix: input.suggestedFix,
    evidence: input.evidence,
  });
  const code = input.code ?? diagnostic.code;
  const repair = input.repair ?? diagnostic.repair;
  const remediation = {
    summary: input.suggestedFix || `Resolve ${category.toLowerCase()} finding.`,
    commands,
    prompt: buildRemediationPrompt({
      id,
      source: input.source,
      category,
      severity: input.severity,
      message: input.message,
      code,
      evidence: input.evidence ?? [],
      suggestedFix: input.suggestedFix,
      repair,
      commands,
    }),
  };

  return {
    id,
    code,
    source: input.source,
    category,
    severity: input.severity,
    message: input.message,
    evidence: input.evidence ?? [],
    target: input.target,
    file: input.file,
    rule: input.rule,
    suggestedFix: input.suggestedFix,
    repair,
    remediation,
  };
}

function collectContractPackConsistencyFindings(
  projectRoot: string,
  essence: unknown,
  manifest: PackManifest | null,
): ProjectHealthFinding[] {
  if (!essence || typeof essence !== 'object') return [];
  const record = essence as Record<string, unknown>;
  const blueprint = record.blueprint;
  if (!blueprint || typeof blueprint !== 'object') return [];
  const bp = blueprint as Record<string, unknown>;
  const routes =
    bp.routes && typeof bp.routes === 'object' && !Array.isArray(bp.routes)
      ? (bp.routes as Record<string, unknown>)
      : {};
  const routeTargets = new Set(
    Object.values(routes)
      .filter(
        (entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object',
      )
      .map((entry) => `${String(entry.section ?? '')}/${String(entry.page ?? '')}`),
  );
  const pages: Array<{ section: string; page: string; route: string | null }> = [];
  for (const section of Array.isArray(bp.sections) ? bp.sections : []) {
    if (!section || typeof section !== 'object') continue;
    const sectionRecord = section as Record<string, unknown>;
    const sectionId = typeof sectionRecord.id === 'string' ? sectionRecord.id : 'unknown';
    for (const page of Array.isArray(sectionRecord.pages) ? sectionRecord.pages : []) {
      if (!page || typeof page !== 'object') continue;
      const pageRecord = page as Record<string, unknown>;
      const pageId = typeof pageRecord.id === 'string' ? pageRecord.id : 'unknown';
      const route = typeof pageRecord.route === 'string' ? pageRecord.route : null;
      pages.push({ section: sectionId, page: pageId, route });
    }
  }

  const findings: ProjectHealthFinding[] = [];
  const routeLess = pages.filter(
    (page) => !page.route && !routeTargets.has(`${page.section}/${page.page}`),
  );
  if (routeLess.length > 0) {
    findings.push(
      createHealthFinding({
        source: 'assertion',
        category: 'Contract Route Topology',
        severity: 'error',
        message:
          'One or more blueprint pages have no route and cannot be addressed by task-time context.',
        evidence: routeLess
          .slice(0, 8)
          .map(
            (page) => `${page.section}/${page.page} has no page.route or blueprint.routes entry`,
          ),
        rule: 'page-route-required',
        suggestedFix:
          'Add a route for each page or rerun the add-page flow with a route-aware Decantr CLI.',
        baseId: 'page-route-required',
      }),
    );
  }

  const pagePackCount =
    manifest && 'pages' in manifest && Array.isArray(manifest.pages) ? manifest.pages.length : 0;
  if (manifest && pages.length !== pagePackCount) {
    const context = commandContextForProject(projectRoot);
    findings.push(
      createHealthFinding({
        source: 'pack',
        category: 'Generated Artifacts',
        severity: 'warn',
        message: `Compiled page pack count (${pagePackCount}) does not match the contract page count (${pages.length}).`,
        evidence: ['Page packs should be regenerated after adding, removing, or re-routing pages.'],
        rule: 'page-pack-count-mismatch',
        suggestedFix: context.compilePacksCommand,
        baseId: 'page-pack-count-mismatch',
      }),
    );
  }

  return findings;
}

function countFindings(findings: ProjectHealthFinding[]) {
  return {
    errorCount: findings.filter((finding) => finding.severity === 'error').length,
    warnCount: findings.filter((finding) => finding.severity === 'warn').length,
    infoCount: findings.filter((finding) => finding.severity === 'info').length,
  };
}

function statusFromCounts(counts: { errorCount: number; warnCount: number }): ProjectHealthStatus {
  if (counts.errorCount > 0) return 'error';
  if (counts.warnCount > 0) return 'warning';
  return 'healthy';
}

function scoreFromCounts(counts: {
  errorCount: number;
  warnCount: number;
  infoCount: number;
}): number {
  return Math.max(
    0,
    Math.min(100, 100 - counts.errorCount * 15 - counts.warnCount * 5 - counts.infoCount),
  );
}

function routeIssuesFromFindings(findings: ProjectHealthFinding[]): string[] {
  const issues = findings
    .filter(
      (finding) =>
        finding.category.toLowerCase().includes('route') ||
        finding.rule?.toLowerCase().includes('route') ||
        finding.id.toLowerCase().includes('route'),
    )
    .map((finding) => finding.message);
  return [...new Set(issues)];
}

function isDuplicateFinding(existing: Set<string>, finding: ProjectHealthFinding): boolean {
  const key = `${finding.rule ?? finding.id}|${finding.message}`;
  if (existing.has(key)) return true;
  existing.add(key);
  return false;
}

function resolveOptionalPath(projectRoot: string, path: string | undefined): string | undefined {
  if (!path) return undefined;
  return isAbsolute(path) ? path : resolve(projectRoot, path);
}

function hasProjectPlaywright(projectRoot: string): boolean {
  try {
    const requireFromProject = createRequire(join(projectRoot, 'package.json'));
    requireFromProject.resolve('playwright');
    return true;
  } catch {
    try {
      const requireFromProject = createRequire(join(projectRoot, 'package.json'));
      requireFromProject.resolve('@playwright/test');
      return true;
    } catch {
      return false;
    }
  }
}

function loadProjectPlaywright(projectRoot: string): PlaywrightLike | null {
  const requireFromProject = createRequire(join(projectRoot, 'package.json'));
  for (const packageName of ['playwright', '@playwright/test']) {
    try {
      const loaded = requireFromProject(packageName) as Partial<PlaywrightLike>;
      if (loaded.chromium?.launch) return loaded as PlaywrightLike;
    } catch {
      /* try next package */
    }
  }
  return null;
}

const KNOWN_INTERACTION_STYLE_CLASSES = [
  'd-enter-fade',
  'd-enter-slide-up',
  'd-enter-scale',
  'd-stagger-children',
  'd-pulse',
  'd-pulse-ring',
  'd-shimmer',
  'd-float',
  'd-glow-hover',
  'd-lift-hover',
  'd-scale-hover',
  'd-ripple',
];

interface BrowserAxeCore {
  source: string;
}

interface BrowserRuntimeDomSnapshot {
  routeRendered: BrowserRouteRenderedProbe;
  nonblankDom: BrowserNonblankDomProbe;
  interactionStyles: BrowserInteractionStyleProbe;
}

interface BrowserAxeRawViolation {
  id?: string;
  impact?: string;
  help?: string;
  description?: string;
  targets?: string[];
}

interface BrowserAxeRawResult {
  error?: string;
  violations?: BrowserAxeRawViolation[];
  incomplete?: number;
}

function compactBrowserEvidence(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, 240);
}

function browserErrorMessage(error: unknown): string {
  return compactBrowserEvidence(error instanceof Error ? error.message : String(error));
}

function isPathInside(parentPath: string, childPath: string): boolean {
  const parentRealPath = realpathSync(parentPath);
  const childRealPath = realpathSync(childPath);
  const relativePath = relative(parentRealPath, childRealPath);
  return relativePath === '' || (!relativePath.startsWith('..') && !isAbsolute(relativePath));
}

function loadProjectAxeCore(projectRoot: string): BrowserAxeCore | null {
  try {
    const requireFromProject = createRequire(join(projectRoot, 'package.json'));
    const resolved = requireFromProject.resolve('axe-core');
    const workspaceRoot = resolveWorkspaceInfo(projectRoot).workspaceRoot;
    const resolvedInProject = [projectRoot, workspaceRoot].some((root) =>
      isPathInside(root, resolved),
    );
    if (!resolvedInProject) return null;
    const loaded = requireFromProject('axe-core') as { source?: unknown };
    return typeof loaded.source === 'string' && loaded.source.length > 0
      ? { source: loaded.source }
      : null;
  } catch {
    return null;
  }
}

function consoleErrorMessage(message: BrowserConsoleMessageLike): string | null {
  try {
    const type = typeof message.type === 'function' ? message.type() : 'error';
    if (type !== 'error') return null;
    const text = typeof message.text === 'function' ? message.text() : 'Console error';
    return compactBrowserEvidence(text || 'Console error');
  } catch {
    return 'Console error event could not be read.';
  }
}

function consoleProbe(messages: string[]): BrowserConsoleProbe {
  return {
    status: messages.length > 0 ? 'failed' : 'passed',
    count: messages.length,
    messages: messages.slice(0, 5),
  };
}

function fallbackRuntimeDomSnapshot(reason: string): BrowserRuntimeDomSnapshot {
  return {
    routeRendered: {
      status: 'failed',
      readyState: null,
      url: null,
      title: null,
      bodyPresent: false,
      appRootPresent: false,
      bodyChildCount: 0,
      reason,
    },
    nonblankDom: {
      status: 'failed',
      textLength: 0,
      meaningfulElementCount: 0,
      mediaElementCount: 0,
      controlElementCount: 0,
      reason,
    },
    interactionStyles: {
      status: 'skipped',
      checked: 0,
      matchedClasses: [],
      animatedOrTransitioned: 0,
      missing: [],
      reason,
    },
  };
}

async function collectRuntimeDomSnapshot(
  page: BrowserPageLike,
): Promise<BrowserRuntimeDomSnapshot> {
  try {
    return await page.evaluate<BrowserRuntimeDomSnapshot, string[]>((knownInteractionClasses) => {
      const global = globalThis as unknown as {
        document?: Record<string, unknown>;
        location?: { href?: string };
        getComputedStyle?: (element: Record<string, unknown>) => Record<string, unknown>;
      };
      const document = global.document;
      const body = document?.body as Record<string, unknown> | undefined;
      const readyState =
        typeof document?.readyState === 'string' ? (document.readyState as string) : null;
      const title = typeof document?.title === 'string' ? (document.title as string) : null;
      const url = typeof global.location?.href === 'string' ? global.location.href : null;
      const querySelector =
        typeof document?.querySelector === 'function'
          ? (document.querySelector as (selector: string) => unknown)
          : null;
      const querySelectorAll =
        typeof document?.querySelectorAll === 'function'
          ? (document.querySelectorAll as (selector: string) => unknown)
          : null;
      const bodyChildCount =
        typeof body?.childElementCount === 'number' ? (body.childElementCount as number) : 0;
      const appRootPresent = Boolean(
        querySelector?.('[data-decantr-root], #root, #app, main, [role="main"], body > *'),
      );
      const routeRendered =
        Boolean(body) && readyState !== 'loading' && (appRootPresent || bodyChildCount > 0);
      const rawElements = querySelectorAll ? querySelectorAll('body *') : [];
      const elements = Array.from(rawElements as Iterable<Record<string, unknown>>);
      const text = String((body?.innerText ?? body?.textContent ?? '') as string)
        .replace(/\s+/g, ' ')
        .trim();
      const mediaTags = new Set(['IMG', 'SVG', 'CANVAS', 'VIDEO', 'PICTURE']);
      const controlTags = new Set(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'SUMMARY']);
      const elementTag = (element: Record<string, unknown>) =>
        typeof element.tagName === 'string' ? element.tagName.toUpperCase() : '';
      const elementText = (element: Record<string, unknown>) =>
        String((element.textContent ?? '') as string)
          .replace(/\s+/g, ' ')
          .trim();
      const elementAttribute = (element: Record<string, unknown>, name: string) =>
        typeof element.getAttribute === 'function'
          ? String((element.getAttribute as (attr: string) => unknown)(name) ?? '').trim()
          : '';
      const mediaElementCount = elements.filter((element) =>
        mediaTags.has(elementTag(element)),
      ).length;
      const controlElementCount = elements.filter((element) =>
        controlTags.has(elementTag(element)),
      ).length;
      const meaningfulElementCount = elements.filter((element) => {
        const tag = elementTag(element);
        return (
          elementText(element).length > 0 ||
          mediaTags.has(tag) ||
          controlTags.has(tag) ||
          elementAttribute(element, 'aria-label').length > 0 ||
          elementAttribute(element, 'alt').length > 0 ||
          elementAttribute(element, 'title').length > 0
        );
      }).length;
      const nonblank =
        text.length > 0 ||
        meaningfulElementCount > 0 ||
        mediaElementCount > 0 ||
        controlElementCount > 0;

      const durationHasTime = (value: unknown): boolean =>
        String(value ?? '')
          .split(',')
          .some((part) => {
            const trimmed = part.trim();
            if (!trimmed) return false;
            if (trimmed.endsWith('ms')) return Number.parseFloat(trimmed) > 0;
            if (trimmed.endsWith('s')) return Number.parseFloat(trimmed) > 0;
            return Number.parseFloat(trimmed) > 0;
          });
      const classListContains = (element: Record<string, unknown>, className: string): boolean => {
        const classList = element.classList as
          | { contains?: (value: string) => boolean }
          | undefined;
        if (typeof classList?.contains === 'function') return classList.contains(className);
        return String((element.className ?? '') as string)
          .split(/\s+/)
          .includes(className);
      };
      const styleTargets = elements
        .map((element) => ({
          element,
          classes: knownInteractionClasses.filter((className) =>
            classListContains(element, className),
          ),
        }))
        .filter((entry) => entry.classes.length > 0);
      const matchedClasses = [...new Set(styleTargets.flatMap((entry) => entry.classes))].sort();
      const missing = new Set<string>();
      let animatedOrTransitioned = 0;
      for (const entry of styleTargets) {
        const computed =
          typeof global.getComputedStyle === 'function'
            ? global.getComputedStyle(entry.element)
            : {};
        const animationName = String(computed.animationName ?? 'none');
        const transitionProperty = String(computed.transitionProperty ?? 'none');
        const hasAnimation =
          animationName !== 'none' && durationHasTime(computed.animationDuration);
        const hasTransition =
          transitionProperty !== 'none' && durationHasTime(computed.transitionDuration);
        if (hasAnimation || hasTransition) {
          animatedOrTransitioned += 1;
        } else {
          for (const className of entry.classes) missing.add(className);
        }
      }
      const interactionStatus =
        styleTargets.length === 0 ? 'skipped' : missing.size === 0 ? 'passed' : 'failed';

      return {
        routeRendered: {
          status: routeRendered ? 'passed' : 'failed',
          readyState,
          url,
          title,
          bodyPresent: Boolean(body),
          appRootPresent,
          bodyChildCount,
          ...(routeRendered
            ? {}
            : { reason: 'No rendered app root or body content was detected after navigation.' }),
        },
        nonblankDom: {
          status: nonblank ? 'passed' : 'failed',
          textLength: text.length,
          meaningfulElementCount,
          mediaElementCount,
          controlElementCount,
          ...(nonblank
            ? {}
            : {
                reason:
                  'DOM rendered, but no meaningful text, media, controls, or labels were detected.',
              }),
        },
        interactionStyles: {
          status: interactionStatus,
          checked: styleTargets.length,
          matchedClasses,
          animatedOrTransitioned,
          missing: [...missing].slice(0, 8),
          ...(styleTargets.length === 0
            ? { reason: 'No known Decantr interaction classes were present on this route.' }
            : {}),
        },
      };
    }, KNOWN_INTERACTION_STYLE_CLASSES);
  } catch (error) {
    return fallbackRuntimeDomSnapshot(`Runtime DOM probe failed: ${browserErrorMessage(error)}`);
  }
}

function skippedAccessibilityProbe(reason: string): BrowserAccessibilityProbe {
  return {
    status: 'skipped',
    engine: 'axe-core',
    violations: 0,
    incomplete: 0,
    messages: [],
    reason,
  };
}

async function collectAccessibilityProbe(
  page: BrowserPageLike,
  axeCore: BrowserAxeCore | null,
): Promise<BrowserAccessibilityProbe> {
  if (!axeCore) return skippedAccessibilityProbe('axe-core is not installed in this project.');
  if (!page.addScriptTag) {
    return skippedAccessibilityProbe('The local Playwright adapter does not expose addScriptTag.');
  }

  try {
    await page.addScriptTag({ content: axeCore.source });
    const result = await page.evaluate<BrowserAxeRawResult>(() => {
      const global = globalThis as unknown as {
        axe?: {
          run?: (
            document: unknown,
            options?: Record<string, unknown>,
          ) => Promise<{
            violations?: Array<{
              id?: string;
              impact?: string;
              help?: string;
              description?: string;
              nodes?: Array<{ target?: string[] }>;
            }>;
            incomplete?: unknown[];
          }>;
        };
        document?: unknown;
      };
      if (!global.axe?.run) return { error: 'axe-core did not expose window.axe.run.' };
      return global.axe.run(global.document, { resultTypes: ['violations'] }).then((axeResult) => ({
        violations: (axeResult.violations ?? []).map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          help: violation.help,
          description: violation.description,
          targets: (violation.nodes ?? []).flatMap((node) => node.target ?? []).slice(0, 3),
        })),
        incomplete: axeResult.incomplete?.length ?? 0,
      }));
    });

    if (result.error) {
      return {
        status: 'failed',
        engine: 'axe-core',
        violations: 0,
        incomplete: 0,
        messages: [result.error],
        reason: result.error,
      };
    }

    const violations = result.violations ?? [];
    const messages = violations.slice(0, 5).map((violation) => {
      const label = violation.id ?? 'axe-violation';
      const detail = violation.help ?? violation.description ?? 'Accessibility violation';
      const impact = violation.impact ? ` (${violation.impact})` : '';
      const targets =
        violation.targets && violation.targets.length > 0
          ? ` [${violation.targets.join(', ')}]`
          : '';
      return compactBrowserEvidence(`${label}${impact}: ${detail}${targets}`);
    });

    return {
      status: violations.length > 0 ? 'failed' : 'passed',
      engine: 'axe-core',
      violations: violations.length,
      incomplete: result.incomplete ?? 0,
      messages,
    };
  } catch (error) {
    const message = `Axe probe failed: ${browserErrorMessage(error)}`;
    return {
      status: 'failed',
      engine: 'axe-core',
      violations: 0,
      incomplete: 0,
      messages: [message],
      reason: message,
    };
  }
}

function browserRuntimeFailureMessages(
  route: string,
  runtime: BrowserRuntimeProbeManifest,
): string[] {
  const messages: string[] = [];
  if (runtime.routeRendered.status === 'failed') {
    messages.push(
      `${route}: route-rendered probe failed (${runtime.routeRendered.reason ?? 'no rendered app root detected'})`,
    );
  }
  if (runtime.nonblankDom.status === 'failed') {
    messages.push(
      `${route}: nonblank DOM probe failed (${runtime.nonblankDom.reason ?? 'blank DOM detected'})`,
    );
  }
  if (runtime.consoleErrors.count > 0) {
    messages.push(
      `${route}: console errors (${runtime.consoleErrors.count}) ${runtime.consoleErrors.messages.join(' | ')}`,
    );
  }
  if (runtime.pageErrors.count > 0) {
    messages.push(
      `${route}: page errors (${runtime.pageErrors.count}) ${runtime.pageErrors.messages.join(' | ')}`,
    );
  }
  if (runtime.interactionStyles.status === 'failed') {
    messages.push(
      `${route}: interaction style probe found known classes without computed animation/transition (${runtime.interactionStyles.missing.join(', ')})`,
    );
  }
  return messages.map(compactBrowserEvidence);
}

function browserAccessibilityFailureMessages(
  route: string,
  runtime: BrowserRuntimeProbeManifest,
): string[] {
  if (runtime.accessibility.status !== 'failed') return [];
  const detail =
    runtime.accessibility.messages.length > 0
      ? runtime.accessibility.messages.join(' | ')
      : (runtime.accessibility.reason ?? 'axe-core reported accessibility failures');
  return [
    compactBrowserEvidence(
      `${route}: axe-core violations (${runtime.accessibility.violations}) ${detail}`,
    ),
  ];
}

function browserRouteUrl(baseUrl: string, route: string): string {
  return new URL(route || '/', baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString();
}

function browserScreenshotRelativePath(route: string): string {
  const name = slugify(route === '/' ? 'root' : route) || 'root';
  return `.decantr/evidence/screenshots/${name}.png`;
}

async function collectBrowserVerification(
  projectRoot: string,
  options: ProjectHealthReportOptions,
  declaredRoutes: string[],
): Promise<BrowserVerificationResult | null> {
  if (!options.browser) return null;

  if (!hasProjectPlaywright(projectRoot)) {
    const finding = createHealthFinding({
      source: 'browser',
      category: 'Browser Verification',
      severity: options.requireBrowser ? 'error' : 'warn',
      message:
        'Browser verification was requested, but Playwright is not installed in this project.',
      evidence: ['Expected dependency: playwright or @playwright/test'],
      rule: 'browser-playwright-missing',
      suggestedFix:
        'Install Playwright in the project or omit browser/base-url evidence for static-only health checks.',
      baseId: 'playwright-missing',
    });
    return {
      findings: [finding],
      evidence: {
        enabled: true,
        status: 'unavailable',
        baseUrl: options.browserBaseUrl ?? null,
        screenshots: [],
        findings: [finding.message],
      },
    };
  }

  if (!options.browserBaseUrl) {
    const finding = createHealthFinding({
      source: 'browser',
      category: 'Browser Verification',
      severity: options.requireBrowser ? 'error' : 'warn',
      message:
        'Browser verification was requested, but no base URL was provided for rendered route checks.',
      evidence: ['Pass --base-url <url> or set DECANTR_BROWSER_BASE_URL.'],
      rule: 'browser-base-url-missing',
      suggestedFix: 'Start the app and rerun with `decantr health --browser --base-url <url>`.',
      baseId: 'base-url-missing',
    });
    return {
      findings: [finding],
      evidence: {
        enabled: true,
        status: 'unavailable',
        baseUrl: null,
        screenshots: [],
        findings: [finding.message],
      },
    };
  }

  const playwright = loadProjectPlaywright(projectRoot);
  if (!playwright) {
    const finding = createHealthFinding({
      source: 'browser',
      category: 'Browser Verification',
      severity: options.requireBrowser ? 'error' : 'warn',
      message: 'Playwright is installed, but Decantr could not load a Chromium browser adapter.',
      evidence: ['Expected chromium.launch from playwright or @playwright/test.'],
      rule: 'browser-adapter-missing',
      suggestedFix: 'Repair the local Playwright install and rerun `decantr health --browser`.',
      baseId: 'adapter-missing',
    });
    return {
      findings: [finding],
      evidence: {
        enabled: true,
        status: 'unavailable',
        baseUrl: options.browserBaseUrl,
        screenshots: [],
        findings: [finding.message],
      },
    };
  }

  const routes = (declaredRoutes.length > 0 ? declaredRoutes : ['/']).slice(0, 12);
  const screenshots: string[] = [];
  const routeFailures: string[] = [];
  const runtimeFailures: string[] = [];
  const accessibilityFailures: string[] = [];
  const visualRoutes: VisualManifestRoute[] = [];
  const screenshotDir = join(projectRoot, '.decantr', 'evidence', 'screenshots');
  mkdirSync(screenshotDir, { recursive: true });
  const axeCore = loadProjectAxeCore(projectRoot);

  let browser: Awaited<ReturnType<PlaywrightLike['chromium']['launch']>> | null = null;
  try {
    browser = await playwright.chromium.launch({ headless: true });
    for (const route of routes) {
      const url = browserRouteUrl(options.browserBaseUrl, route);
      const relativePath = browserScreenshotRelativePath(route);
      let page: BrowserPageLike | null = null;
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      try {
        page = await browser.newPage();
        page.on?.('console', (message) => {
          const errorMessage = consoleErrorMessage(message);
          if (errorMessage) consoleErrors.push(errorMessage);
        });
        page.on?.('pageerror', (error) => {
          pageErrors.push(browserErrorMessage(error));
        });
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        const domSnapshot = await collectRuntimeDomSnapshot(page);
        const runtime: BrowserRuntimeProbeManifest = {
          ...domSnapshot,
          consoleErrors: consoleProbe(consoleErrors),
          pageErrors: consoleProbe(pageErrors),
          accessibility: await collectAccessibilityProbe(page, axeCore),
        };
        runtimeFailures.push(...browserRuntimeFailureMessages(route, runtime));
        accessibilityFailures.push(...browserAccessibilityFailureMessages(route, runtime));
        const absoluteScreenshotPath = join(projectRoot, relativePath);
        await page.screenshot({ path: absoluteScreenshotPath, fullPage: true });
        screenshots.push(relativePath);
        visualRoutes.push({
          route,
          url,
          screenshot: relativePath,
          screenshotHash: hashFile(absoluteScreenshotPath),
          status: 'captured',
          runtime,
        });
      } catch (error) {
        const message = (error as Error).message;
        routeFailures.push(`${route}: ${message}`);
        visualRoutes.push({
          route,
          url,
          screenshot: null,
          screenshotHash: null,
          status: 'failed',
          error: message,
        });
      } finally {
        try {
          await page?.close?.();
        } catch {
          /* page cleanup is best-effort */
        }
      }
    }
  } catch (error) {
    routeFailures.push((error as Error).message);
  } finally {
    if (browser) await browser.close();
  }

  const visualManifest: VisualManifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    localOnly: true,
    baseUrl: options.browserBaseUrl,
    routes: visualRoutes,
  };
  const visualManifestPath = join(projectRoot, '.decantr', 'evidence', 'visual-manifest.json');
  mkdirSync(dirname(visualManifestPath), { recursive: true });
  writeFileSync(visualManifestPath, JSON.stringify(visualManifest, null, 2) + '\n', 'utf-8');

  const findings: ProjectHealthFinding[] = [];
  if (routeFailures.length > 0) {
    findings.push(
      createHealthFinding({
        source: 'browser',
        category: 'Browser Verification',
        severity: options.requireBrowser ? 'error' : 'warn',
        message: 'Browser verification could not render every declared route.',
        evidence: routeFailures.slice(0, 5),
        rule: 'browser-route-verification-failed',
        suggestedFix:
          'Start the app at the provided base URL, fix route render errors, and rerun `decantr health --browser --evidence`.',
        baseId: 'route-verification-failed',
      }),
    );
  }
  if (runtimeFailures.length > 0) {
    findings.push(
      createHealthFinding({
        source: 'browser',
        category: 'Browser Runtime',
        severity: options.requireBrowser ? 'error' : 'warn',
        message: 'Browser runtime probes failed for one or more rendered routes.',
        evidence: runtimeFailures.slice(0, 5),
        rule: 'browser-runtime-probes-failed',
        suggestedFix:
          'Inspect console/page errors and rendered DOM state, repair the route runtime behavior, and rerun `decantr health --browser --evidence`.',
        code: 'RUNTIME010',
        repair: { id: 'repair-browser-runtime-probes' },
        baseId: 'runtime-probes-failed',
      }),
    );
  }
  if (accessibilityFailures.length > 0) {
    findings.push(
      createHealthFinding({
        source: 'browser',
        category: 'Browser Accessibility',
        severity: options.requireBrowser ? 'error' : 'warn',
        message: 'Axe reported accessibility violations in rendered browser evidence.',
        evidence: accessibilityFailures.slice(0, 5),
        rule: 'browser-axe-violations',
        suggestedFix:
          'Repair the rendered accessibility violations and rerun `decantr health --browser --evidence`.',
        code: 'A11Y020',
        repair: { id: 'fix-rendered-accessibility' },
        baseId: 'axe-violations',
      }),
    );
  }

  if (findings.length > 0) {
    const evidenceFindings = [...routeFailures, ...runtimeFailures, ...accessibilityFailures];
    return {
      findings,
      evidence: {
        enabled: true,
        status: 'failed',
        baseUrl: options.browserBaseUrl,
        screenshots,
        findings: evidenceFindings,
      },
    };
  }

  return {
    findings: [],
    evidence: {
      enabled: true,
      status: 'passed',
      baseUrl: options.browserBaseUrl,
      screenshots,
      findings: [],
    },
  };
}

function flattenDesignTokenKeys(value: unknown, prefix = ''): Set<string> {
  const keys = new Set<string>();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return keys;

  for (const [rawKey, rawValue] of Object.entries(value as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${rawKey}` : rawKey;
    if (
      rawValue &&
      typeof rawValue === 'object' &&
      !Array.isArray(rawValue) &&
      ('$value' in rawValue || 'value' in rawValue)
    ) {
      keys.add(key);
      keys.add(rawKey);
    } else if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
      for (const nested of flattenDesignTokenKeys(rawValue, key)) keys.add(nested);
    }
  }

  return keys;
}

function parseDecantrCssTokenNames(projectRoot: string): string[] {
  const tokensPath = join(projectRoot, 'src', 'styles', 'tokens.css');
  if (!existsSync(tokensPath)) return [];
  const css = readFileSync(tokensPath, 'utf-8');
  const names = new Set<string>();
  for (const match of css.matchAll(/(--d-[\w-]+)\s*:/g)) {
    names.add(match[1]);
  }
  return [...names].sort();
}

export function collectDesignTokenEvidence(
  projectRoot: string,
  designTokensPath: string | undefined,
): EvidenceBundle['designTokens'] | undefined {
  const resolved = resolveOptionalPath(projectRoot, designTokensPath);
  if (!resolved) return undefined;

  const sourceLabel = isAbsolute(designTokensPath ?? '')
    ? '<design-tokens>'
    : (designTokensPath ?? '<design-tokens>');

  if (!existsSync(resolved)) {
    return {
      source: sourceLabel,
      status: 'error',
      compared: 0,
      matched: 0,
      missing: ['design-token-source-missing'],
    };
  }

  const decantrTokens = parseDecantrCssTokenNames(projectRoot);
  const parsed = JSON.parse(readFileSync(resolved, 'utf-8')) as unknown;
  const designKeys = flattenDesignTokenKeys(parsed);
  const missing = decantrTokens.filter((token) => {
    const bare = token.replace(/^--/, '');
    return (
      !designKeys.has(token) && !designKeys.has(bare) && !designKeys.has(bare.replace(/^d-/, ''))
    );
  });

  return {
    source: sourceLabel,
    status: missing.length === 0 ? 'passed' : 'warning',
    compared: decantrTokens.length,
    matched: decantrTokens.length - missing.length,
    missing,
  };
}

function collectDesignTokenFinding(
  projectRoot: string,
  designTokensPath: string | undefined,
): ProjectHealthFinding | null {
  const evidence = collectDesignTokenEvidence(projectRoot, designTokensPath);
  if (!evidence) return null;
  if (evidence.status === 'passed') {
    return createHealthFinding({
      source: 'design-token',
      category: 'Design Tokens',
      severity: 'info',
      message: 'Imported design-token source covers Decantr token names.',
      evidence: [`matched=${evidence.matched}/${evidence.compared}`],
      rule: 'design-token-coverage',
      baseId: 'coverage-passed',
    });
  }

  return createHealthFinding({
    source: 'design-token',
    category: 'Design Tokens',
    severity: evidence.status === 'error' ? 'error' : 'warn',
    message: 'Imported design-token source does not cover all Decantr token names.',
    evidence: [
      `matched=${evidence.matched}/${evidence.compared}`,
      evidence.missing.slice(0, 12).join(', ') || 'No Decantr CSS tokens found.',
    ],
    rule: 'design-token-coverage',
    suggestedFix:
      'Update the Figma/Tokens Studio export or Decantr token mapping so shared UI policy can be verified.',
    baseId: 'coverage-missing',
  });
}

function baselinePath(projectRoot: string): string {
  return join(projectRoot, '.decantr', 'health-baseline.json');
}

function baselineDiffPath(projectRoot: string): string {
  return join(projectRoot, '.decantr', 'health-baseline-diff.json');
}

function screenshotHashes(projectRoot: string): Array<{ path: string; hash: string | null }> {
  const manifest = readJsonFile<VisualManifest>(
    join(projectRoot, '.decantr', 'evidence', 'visual-manifest.json'),
  );
  if (manifest?.routes) {
    return manifest.routes
      .filter((route) => typeof route.screenshot === 'string')
      .map((route) => ({
        path: route.screenshot as string,
        hash: route.screenshotHash ?? hashFile(join(projectRoot, route.screenshot as string)),
      }));
  }
  return [];
}

function changedFilesSinceBaseline(projectRoot: string): string[] {
  const changed = new Set<string>();
  try {
    // Security: fixed git argv, shell disabled, and cwd scoped to the selected project.
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
    // Git may be unavailable or the project may not be a repository.
  }
  return [...changed].sort();
}

function routeImpactsFromChangedFiles(
  report: ProjectHealthReport,
  changedFiles: string[],
): string[] {
  const analysis = readJsonFile<{ routes?: { routes?: Array<{ path?: string; file?: string }> } }>(
    join(report.projectRoot, '.decantr', 'analysis.json'),
  );
  const routeEntries = analysis?.routes?.routes ?? [];
  const impacted = new Set<string>();
  for (const file of changedFiles) {
    for (const route of routeEntries) {
      if (route.file && (file === route.file || file.endsWith(route.file))) {
        if (route.path) impacted.add(route.path);
      }
    }
  }
  return [...impacted].sort();
}

function createHealthBaseline(projectRoot: string, report: ProjectHealthReport): HealthBaseline {
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    status: report.status,
    score: report.score,
    findings: report.findings.map((finding) => ({
      id: finding.id,
      severity: finding.severity,
      source: finding.source,
      message: finding.message,
    })),
    routes: report.routes.declared,
    packs: report.packs,
    screenshots: screenshotHashes(projectRoot),
    changedFilesCommand: 'git diff --name-only + --cached',
  };
}

function saveHealthBaseline(projectRoot: string, report: ProjectHealthReport): string {
  const path = baselinePath(projectRoot);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    JSON.stringify(createHealthBaseline(projectRoot, report), null, 2) + '\n',
    'utf-8',
  );
  return path;
}

function compareHealthBaseline(
  projectRoot: string,
  report: ProjectHealthReport,
): HealthBaselineComparison {
  const path = baselinePath(projectRoot);
  const baseline = readJsonFile<HealthBaseline>(path);
  const currentFindingIds = new Set(report.findings.map((finding) => finding.id));
  const baselineFindingIds = new Set(baseline?.findings.map((finding) => finding.id) ?? []);
  const changedFiles = changedFilesSinceBaseline(projectRoot);
  const currentScreenshots = new Map(
    screenshotHashes(projectRoot).map((entry) => [entry.path, entry.hash]),
  );
  const changedScreenshots =
    baseline?.screenshots
      .filter(
        (entry) =>
          currentScreenshots.has(entry.path) && currentScreenshots.get(entry.path) !== entry.hash,
      )
      .map((entry) => entry.path) ?? [];
  const contractDrift = [
    baseline && baseline.routes.join('\n') !== report.routes.declared.join('\n')
      ? 'Declared route set changed since baseline.'
      : null,
    baseline && baseline.packs.generatedAt !== report.packs.generatedAt
      ? 'Execution-pack generation timestamp changed since baseline.'
      : null,
  ].filter((entry): entry is string => Boolean(entry));

  return {
    baselinePath: path,
    savedAt: baseline?.generatedAt ?? null,
    statusChanged: baseline ? baseline.status !== report.status : false,
    scoreDelta: baseline ? report.score - baseline.score : null,
    addedFindings: [...currentFindingIds].filter((id) => !baselineFindingIds.has(id)).sort(),
    resolvedFindings: [...baselineFindingIds].filter((id) => !currentFindingIds.has(id)).sort(),
    changedFiles,
    changedRoutes: routeImpactsFromChangedFiles(report, changedFiles),
    changedScreenshots,
    contractDrift,
  };
}

function saveHealthBaselineComparison(
  projectRoot: string,
  comparison: HealthBaselineComparison,
): string {
  const path = baselineDiffPath(projectRoot);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(comparison, null, 2) + '\n', 'utf-8');
  return path;
}

function visualBaselineFindings(
  comparison: HealthBaselineComparison | null,
): ProjectHealthFinding[] {
  if (!comparison || comparison.changedScreenshots.length === 0) return [];
  return [
    createHealthFinding({
      source: 'browser',
      category: 'Visual Baseline',
      severity: 'warn',
      message: 'Screenshot hashes changed since the saved Decantr health baseline.',
      evidence: [
        `Baseline: ${comparison.baselinePath}`,
        `Changed screenshots: ${comparison.changedScreenshots.join(', ')}`,
      ],
      target: comparison.changedScreenshots[0],
      rule: 'visual-baseline-screenshot-drift',
      suggestedFix:
        'Review the changed screenshots. If the visual change is intentional, save a new baseline; otherwise repair the UI drift and rerun browser evidence.',
      repair: {
        id: 'review-visual-baseline-drift',
        payload: {
          baseline_path: comparison.baselinePath,
          changed_screenshots: comparison.changedScreenshots,
        },
      },
      baseId: 'visual-baseline-screenshot-drift',
    }),
  ];
}

function withAdditionalHealthFindings(
  projectRoot: string,
  report: ProjectHealthReport,
  additions: ProjectHealthFinding[],
): ProjectHealthReport {
  if (additions.length === 0) return report;
  const seen = new Set(
    report.findings.map((finding) => `${finding.rule ?? finding.id}|${finding.message}`),
  );
  const nextFindings = [
    ...report.findings,
    ...additions
      .filter((finding) => !isDuplicateFinding(seen, finding))
      .map((finding) => ({
        ...finding,
        repairPlan: buildProjectHealthRepairPlan(projectRoot, finding),
      })),
  ];
  const counts = countFindings(nextFindings);
  return {
    ...report,
    status: statusFromCounts(counts),
    score: scoreFromCounts(counts),
    summary: {
      ...report.summary,
      ...counts,
      findingCount: nextFindings.length,
    },
    routes: {
      ...report.routes,
      issues: routeIssuesFromFindings(nextFindings),
    },
    findings: nextFindings,
  };
}

function formatBaselineComparisonText(comparison: HealthBaselineComparison): string {
  const lines = [
    '',
    `${BOLD}Continuity:${RESET}`,
    `  Baseline: ${comparison.savedAt ?? 'missing'} (${comparison.baselinePath})`,
    `  Score delta: ${comparison.scoreDelta == null ? 'n/a' : comparison.scoreDelta >= 0 ? `+${comparison.scoreDelta}` : String(comparison.scoreDelta)}`,
    `  Added findings: ${comparison.addedFindings.length}`,
    `  Resolved findings: ${comparison.resolvedFindings.length}`,
    `  Changed files: ${comparison.changedFiles.length}`,
    `  Route impact: ${comparison.changedRoutes.length > 0 ? comparison.changedRoutes.join(', ') : 'none detected'}`,
    `  Screenshot drift: ${comparison.changedScreenshots.length}`,
    `  Contract drift: ${comparison.contractDrift.length > 0 ? comparison.contractDrift.join(' ') : 'none detected'}`,
  ];
  return `${lines.join('\n')}\n`;
}

async function browserEvidenceFromOptions(
  projectRoot: string,
  options: ProjectHealthReportOptions,
  declaredRoutes: string[],
): Promise<EvidenceBundle['browser'] | undefined> {
  if (!options.browser) return undefined;
  const result = await collectBrowserVerification(projectRoot, options, declaredRoutes);
  return result?.evidence;
}

export async function createProjectHealthReport(
  projectRoot: string = process.cwd(),
  options: ProjectHealthReportOptions = {},
): Promise<ProjectHealthReport> {
  const metadata = readProjectMetadata(projectRoot);
  const audit = await auditProject(projectRoot);
  const findings: ProjectHealthFinding[] = [];
  const seen = new Set<string>();

  for (const finding of audit.findings) {
    const healthFinding = createHealthFinding({
      source: sourceFromAuditFinding(finding),
      category: finding.category,
      severity: finding.severity,
      message: finding.message,
      evidence: finding.evidence,
      target: finding.target,
      file: finding.file,
      rule: finding.rule,
      suggestedFix: finding.suggestedFix,
      code: finding.code,
      repair: finding.repair,
      baseId: finding.id,
    });
    if (!isDuplicateFinding(seen, healthFinding)) findings.push(healthFinding);
  }

  for (const contractAssertion of createContractAssertions(projectRoot, audit)) {
    if (!contractAssertionApplies(contractAssertion, metadata)) continue;
    if (contractAssertion.status !== 'failed') continue;
    const healthFinding = createHealthFinding({
      source: 'assertion',
      category: `Contract ${contractAssertion.category}`,
      severity: contractAssertion.severity,
      message: contractAssertion.message,
      evidence: contractAssertion.evidence,
      target: contractAssertion.target,
      rule: contractAssertion.rule,
      suggestedFix: contractAssertion.suggestedFix,
      baseId: contractAssertion.id,
    });
    if (!isDuplicateFinding(seen, healthFinding)) findings.push(healthFinding);
  }

  const designTokenFinding = collectDesignTokenFinding(projectRoot, options.designTokensPath);
  if (designTokenFinding && !isDuplicateFinding(seen, designTokenFinding)) {
    findings.push(designTokenFinding);
  }

  try {
    const check = collectCheckIssues(projectRoot, { brownfield: metadata.autoBrownfield });
    for (const issue of check.issues) {
      const source = sourceFromCheckIssue(issue);
      const healthFinding = createHealthFinding({
        source,
        category: source === 'brownfield' ? 'Brownfield Drift' : 'Contract Check',
        severity: severityFromCheckIssue(issue),
        message: issue.message,
        evidence: [`Rule: ${issue.rule}`],
        rule: issue.rule,
        suggestedFix: issue.suggestion,
        baseId: issue.rule,
      });
      if (!isDuplicateFinding(seen, healthFinding)) findings.push(healthFinding);
    }
  } catch (e) {
    const healthFinding = createHealthFinding({
      source: 'check',
      category: 'Contract Check',
      severity: 'error',
      message: `Decantr check could not complete: ${(e as Error).message}`,
      evidence: ['The health command could not run the local check pass.'],
      rule: 'check-failed',
      suggestedFix: 'Repair the local Decantr contract and rerun `decantr health`.',
      baseId: 'check-failed',
    });
    if (!isDuplicateFinding(seen, healthFinding)) findings.push(healthFinding);
  }

  if (!audit.valid && findings.every((finding) => finding.severity !== 'error')) {
    findings.push(
      createHealthFinding({
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

  const declaredRoutes = collectDeclaredRoutes(audit.essence);
  const manifest = audit.packManifest;
  for (const consistencyFinding of collectContractPackConsistencyFindings(
    projectRoot,
    audit.essence,
    manifest,
  )) {
    if (!isDuplicateFinding(seen, consistencyFinding)) findings.push(consistencyFinding);
  }
  const graph = inspectProjectHealthGraph(projectRoot);
  for (const graphFinding of collectGraphArtifactFindings(projectRoot, graph)) {
    if (!isDuplicateFinding(seen, graphFinding)) findings.push(graphFinding);
  }
  const browserVerification = await collectBrowserVerification(
    projectRoot,
    options,
    declaredRoutes,
  );
  for (const browserFinding of browserVerification?.findings ?? []) {
    if (!isDuplicateFinding(seen, browserFinding)) findings.push(browserFinding);
  }
  const anchoredFindings = anchorProjectHealthFindings(projectRoot, findings);
  const scopedFindings = scopeHealthFindingsToProject(projectRoot, anchoredFindings);
  const repairPlanFindings = scopedFindings.map((finding) => ({
    ...finding,
    repairPlan: buildProjectHealthRepairPlan(projectRoot, finding),
  }));
  const finalCounts = countFindings(repairPlanFindings);
  const commandContext = commandContextForProject(projectRoot);

  const baseReport = {
    $schema: PROJECT_HEALTH_SCHEMA_URL,
    generatedAt: new Date().toISOString(),
    projectRoot,
    status: statusFromCounts(finalCounts),
    score: scoreFromCounts(finalCounts),
    summary: {
      ...finalCounts,
      findingCount: repairPlanFindings.length,
      workflowMode: metadata.workflowMode,
      adoptionMode: metadata.adoptionMode,
      essenceVersion: audit.summary.essenceVersion,
      pageCount: audit.summary.pageCount,
      runtimeAuditChecked: audit.summary.runtimeAuditChecked,
      runtimePassed: audit.summary.runtimePassed,
      packManifestPresent: audit.summary.packManifestPresent,
      reviewPackPresent: audit.summary.reviewPackPresent,
    },
    routes: {
      declared: declaredRoutes,
      runtimeChecked: audit.runtimeAudit.routeHintsChecked,
      runtimeMatched: audit.runtimeAudit.routeHintsMatched,
      runtimeCoverageOk: audit.summary.runtimeAuditChecked
        ? audit.runtimeAudit.routeHintsCoverageOk
        : null,
      issues: routeIssuesFromFindings(repairPlanFindings),
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
    graph,
    ci: {
      recommendedCommand: commandContext.ciCommand,
      failOn: 'error',
    },
    findings: repairPlanFindings,
  };
  const evidenceTier = createEvidenceTier(baseReport, {
    runtimeProbeCount: browserVerification
      ? Math.max(1, browserVerification.evidence.screenshots.length)
      : undefined,
    visualArtifactCount: browserVerification?.evidence.screenshots.length ?? 0,
  });
  const authority = createAuthorityResolution(baseReport);
  const loop = createLoopReadiness(baseReport, authority, evidenceTier);

  return {
    ...baseReport,
    evidenceTier,
    authority,
    loop,
    findings: repairPlanFindings.map((finding) => {
      const conflict = authority.conflicts.find((entry) => entry.id === finding.id);
      return {
        ...finding,
        evidenceTier,
        authorityLane: conflict?.lane ?? authority.activeLane,
        resolutionActions: conflict?.recommendedActions,
        privacy: {
          sourceIncluded: false as const,
          redacted: true,
          localOnly: true,
        },
        loopVerdict: loop.state,
      };
    }),
  };
}

function colorForStatus(status: ProjectHealthStatus): string {
  if (status === 'healthy') return GREEN;
  if (status === 'warning') return YELLOW;
  return RED;
}

const DNA_RULES = new Set(['style', 'density', 'accessibility', 'theme-mode', 'theme']);
const BLUEPRINT_RULES = new Set([
  'structure',
  'layout',
  'pattern-exists',
  'page-route-required',
  'page-pack-count-mismatch',
]);

function formatHumanFindingLabel(finding: ProjectHealthFinding): string {
  const severity = finding.severity;
  const rule = finding.rule?.toLowerCase() ?? '';
  const category = finding.category.toLowerCase();
  const source = finding.source;

  if (source === 'brownfield' || rule.startsWith('brownfield-')) {
    return 'Brownfield drift';
  }
  if (source === 'style-bridge') {
    return `Style bridge ${severity}`;
  }
  if (source === 'interaction') {
    return `Interaction ${severity}`;
  }
  if (DNA_RULES.has(rule) || category.includes('dna')) {
    return `DNA ${severity}`;
  }
  if (BLUEPRINT_RULES.has(rule) || category.includes('blueprint')) {
    return `Blueprint ${severity === 'error' ? 'error' : 'warning'}`;
  }
  return severity.toUpperCase();
}

export function formatProjectHealthText(report: ProjectHealthReport): string {
  const color = colorForStatus(report.status);
  const commandContext = commandContextForProject(report.projectRoot);
  const lines = [
    `${BOLD}Decantr Project Health${RESET}`,
    '',
    `${color}${report.status.toUpperCase()}${RESET}  score ${report.score}/100`,
    `${DIM}${report.projectRoot}${RESET}`,
    '',
    `${BOLD}Summary:${RESET}`,
    `  Findings: ${report.summary.errorCount} error(s), ${report.summary.warnCount} warn(s), ${report.summary.infoCount} info`,
    `  Essence: ${report.summary.essenceVersion ?? 'missing'} | pages ${report.summary.pageCount}`,
    `  Workflow: ${report.summary.workflowMode ?? 'unknown'} | adoption ${report.summary.adoptionMode ?? 'unknown'}`,
    `  Runtime audit: ${
      report.summary.runtimeAuditChecked
        ? report.summary.runtimePassed
          ? 'passed'
          : 'failed'
        : 'not checked'
    }`,
    `  Packs: manifest ${report.packs.manifestPresent ? 'present' : 'missing'} | review ${
      report.packs.reviewPackPresent ? 'present' : 'missing'
    } | pages ${report.packs.pagePackCount}`,
    `  Graph: ${
      report.graph.current === null ? 'not attached' : report.graph.current ? 'current' : 'stale'
    } | capsule ${report.graph.capsulePresent ? 'present' : 'missing'} | sources ${
      report.graph.sourceArtifactCount
    }`,
    '',
    `${BOLD}Control loop:${RESET}`,
    `  State: ${report.loop.state} | evidence ${report.evidenceTier.confidence.level} (${report.evidenceTier.confidence.score})`,
    `  Authority: ${report.authority.activeLane} — ${report.authority.summary}`,
    `  Next: ${report.loop.nextActions[0] ?? report.loop.verifyCommand}`,
    '',
    `${BOLD}Findings:${RESET}`,
  ];

  if (report.findings.length === 0) {
    lines.push(`  ${GREEN}No findings. Project is healthy.${RESET}`);
  } else {
    for (const finding of report.findings) {
      const findingColor =
        finding.severity === 'error' ? RED : finding.severity === 'warn' ? YELLOW : CYAN;
      lines.push(
        `  ${findingColor}[${formatHumanFindingLabel(finding)}]${RESET} ${finding.id}: ${finding.message}`,
      );
      if (finding.evidence.length > 0) {
        lines.push(`    ${DIM}${finding.evidence[0]}${RESET}`);
      }
      if (finding.code) {
        lines.push(`    ${DIM}Code: ${finding.code}${RESET}`);
      }
      if (finding.graph) {
        lines.push(
          `    ${DIM}Graph: ${finding.graph.node_type} ${finding.graph.node_id} (${finding.graph.confidence})${RESET}`,
        );
      }
      if (finding.repair) {
        lines.push(`    ${DIM}Repair: ${finding.repair.id}${RESET}`);
      }
      if (finding.suggestedFix) {
        lines.push(`    ${DIM}Fix: ${finding.suggestedFix}${RESET}`);
      }
      lines.push(`    ${DIM}Prompt: ${commandContext.promptCommand(finding.id)}${RESET}`);
    }
  }

  lines.push('');
  lines.push(`${BOLD}CI:${RESET} ${report.ci.recommendedCommand}`);
  lines.push(`${BOLD}Loop verify:${RESET} ${report.loop.verifyCommand}`);
  return `${lines.join('\n')}\n`;
}

export function formatProjectHealthMarkdown(report: ProjectHealthReport): string {
  const commandContext = commandContextForProject(report.projectRoot);
  const lines = [
    '# Decantr Project Health',
    '',
    `- Status: **${report.status}**`,
    `- Score: **${report.score}/100**`,
    `- Project: \`${report.projectRoot}\``,
    `- Findings: ${report.summary.errorCount} error(s), ${report.summary.warnCount} warn(s), ${report.summary.infoCount} info`,
    `- Runtime audit: ${
      report.summary.runtimeAuditChecked
        ? report.summary.runtimePassed
          ? 'passed'
          : 'failed'
        : 'not checked'
    }`,
    `- Packs: manifest ${report.packs.manifestPresent ? 'present' : 'missing'}, review ${
      report.packs.reviewPackPresent ? 'present' : 'missing'
    }`,
    `- Graph: ${
      report.graph.current === null ? 'not attached' : report.graph.current ? 'current' : 'stale'
    }, capsule ${report.graph.capsulePresent ? 'present' : 'missing'}, sources ${
      report.graph.sourceArtifactCount
    }`,
    `- Loop: **${report.loop.state}** (${report.loop.status})`,
    `- Evidence tier: **${report.evidenceTier.stage}** / ${report.evidenceTier.confidence.level}`,
    `- Authority: **${report.authority.activeLane}**`,
    '',
    '## Findings',
    '',
  ];

  if (report.findings.length === 0) {
    lines.push('No findings. Project is healthy.');
  } else {
    for (const finding of report.findings) {
      lines.push(`### ${finding.id}`);
      lines.push('');
      lines.push(`- Severity: ${finding.severity}`);
      lines.push(`- Source: ${finding.source}`);
      lines.push(`- Category: ${finding.category}`);
      if (finding.code) lines.push(`- Code: ${finding.code}`);
      lines.push(`- Message: ${finding.message}`);
      if (finding.suggestedFix) lines.push(`- Fix: ${finding.suggestedFix}`);
      if (finding.graph) {
        lines.push(
          `- Graph: \`${finding.graph.node_type} ${finding.graph.node_id}\` (${finding.graph.confidence})`,
        );
      }
      if (finding.repair) lines.push(`- Repair: \`${finding.repair.id}\``);
      if (finding.evidence.length > 0) {
        lines.push('- Evidence:');
        for (const evidence of finding.evidence) lines.push(`  - ${evidence}`);
      }
      lines.push(`- Prompt: \`${commandContext.promptCommand(finding.id)}\``);
      lines.push('');
    }
  }

  lines.push('## CI');
  lines.push('');
  lines.push(`\`${report.ci.recommendedCommand}\``);
  return `${lines.join('\n')}\n`;
}

export function formatProjectHealthJson(report: ProjectHealthReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

function diagnosticCatalogPayload() {
  const diagnosticsByRule = new Map<
    string,
    { rule: string; code: string; repairId: string; family: string }
  >();
  for (const entry of [...KNOWN_VERIFICATION_DIAGNOSTICS, ...HEALTH_BROWSER_RUNTIME_DIAGNOSTICS]) {
    diagnosticsByRule.set(entry.rule, entry);
  }
  return {
    diagnostics: [...diagnosticsByRule.values()]
      .map((entry) => ({
        code: entry.code,
        family: entry.family,
        rule: entry.rule,
        repairId: entry.repairId,
      }))
      .sort((a, b) => a.code.localeCompare(b.code) || a.rule.localeCompare(b.rule)),
  };
}

export function formatDiagnosticCatalogJson(): string {
  return `${JSON.stringify(diagnosticCatalogPayload(), null, 2)}\n`;
}

export function formatDiagnosticCatalogMarkdown(): string {
  const lines = [
    '# Decantr Diagnostic Codes',
    '',
    '| Code | Family | Rule | Repair ID |',
    '| --- | --- | --- | --- |',
    ...diagnosticCatalogPayload().diagnostics.map(
      (entry) =>
        `| \`${entry.code}\` | \`${entry.family}\` | \`${entry.rule}\` | \`${entry.repairId}\` |`,
    ),
    '',
  ];
  return lines.join('\n');
}

export function formatDiagnosticCatalogText(): string {
  return [
    'Decantr Diagnostic Codes',
    ...diagnosticCatalogPayload().diagnostics.map(
      (entry) => `${entry.code.padEnd(12)} ${entry.rule.padEnd(42)} ${entry.repairId}`,
    ),
    '',
  ].join('\n');
}

export async function createProjectEvidenceBundle(
  projectRoot: string,
  report: ProjectHealthReport,
  options: ProjectHealthReportOptions = {},
): Promise<EvidenceBundle> {
  const audit = await auditProject(projectRoot);
  const assertions: ContractAssertion[] = createContractAssertions(projectRoot, audit);
  const visualManifestPath = join(projectRoot, '.decantr', 'evidence', 'visual-manifest.json');
  const browserEvidence = await browserEvidenceFromOptions(
    projectRoot,
    options,
    report.routes.declared,
  );
  return createEvidenceBundle({
    projectRoot,
    report,
    audit,
    assertions,
    workspaceConfigPath: existsSync(join(projectRoot, '.decantr', 'workspace.json'))
      ? join(projectRoot, '.decantr', 'workspace.json')
      : null,
    designTokensPath: resolveOptionalPath(projectRoot, options.designTokensPath) ?? null,
    visualManifestPath: existsSync(visualManifestPath) ? visualManifestPath : null,
    artifacts: [
      {
        id: 'artifact:evidence-bundle',
        kind: 'evidence-bundle',
        path: '.decantr/evidence/evidence-bundle.json',
        hash: null,
        localOnly: true,
        redacted: true,
      },
      ...(existsSync(visualManifestPath)
        ? [
            {
              id: 'artifact:visual-manifest',
              kind: 'visual-manifest',
              path: '.decantr/evidence/visual-manifest.json',
              hash: null,
              localOnly: true,
              redacted: true,
            },
          ]
        : []),
      ...(browserEvidence?.screenshots ?? []).map((screenshot, index) => ({
        id: `artifact:screenshot:${index + 1}`,
        kind: 'screenshot',
        path: screenshot,
        hash: null,
        localOnly: true,
        redacted: false,
      })),
    ],
    browser: browserEvidence,
    designTokens: collectDesignTokenEvidence(projectRoot, options.designTokensPath),
  });
}

function resolveFormat(options: HealthCommandOptions): HealthOutputFormat {
  if (options.json) return 'json';
  if (options.markdown) return 'markdown';
  return options.format ?? 'text';
}

export function shouldFailHealth(report: ProjectHealthReport, failOn: HealthFailOn): boolean {
  if (failOn === 'none') return false;
  if (failOn === 'warn') return report.summary.errorCount > 0 || report.summary.warnCount > 0;
  return report.summary.errorCount > 0;
}

export async function cmdHealth(
  projectRoot: string = process.cwd(),
  options: HealthCommandOptions = {},
): Promise<void> {
  if (options.initCi) {
    try {
      const result = writeProjectHealthCiWorkflow(projectRoot, options.initCi);
      const action = result.created ? 'Created' : 'Updated';
      console.log(`${GREEN}${action} Decantr Project Health workflow:${RESET} ${result.path}`);
      console.log(`${DIM}CLI package: ${result.cliPackage}${RESET}`);
      if (result.projectPath) {
        console.log(`${DIM}Project: ${result.projectPath}${RESET}`);
      }
      if (result.workspace) {
        console.log(`${DIM}Workspace mode enabled.${RESET}`);
      }
      console.log(
        `${DIM}CI gate: decantr ${result.workspace ? 'workspace health' : 'health'} --ci --fail-on ${result.failOn}${RESET}`,
      );
    } catch (e) {
      console.error(`${RED}${(e as Error).message}${RESET}`);
      process.exitCode = 1;
    }
    return;
  }

  if (options.diagnostics) {
    const format = resolveFormat(options);
    const payload =
      format === 'json'
        ? formatDiagnosticCatalogJson()
        : format === 'markdown'
          ? formatDiagnosticCatalogMarkdown()
          : formatDiagnosticCatalogText();
    if (options.output) {
      const outputPath = isAbsolute(options.output)
        ? options.output
        : join(projectRoot, options.output);
      mkdirSync(dirname(outputPath), { recursive: true });
      writeFileSync(outputPath, payload, 'utf-8');
      if (!options.ci) {
        console.log(`${GREEN}Wrote Decantr diagnostic catalog:${RESET} ${options.output}`);
      }
    } else {
      process.stdout.write(payload);
    }
    return;
  }

  const startedAt = Date.now();
  const reportOptions: ProjectHealthReportOptions = {
    browser: options.browser,
    requireBrowser: options.requireBrowser,
    browserBaseUrl: options.browserBaseUrl ?? process.env.DECANTR_BROWSER_BASE_URL,
    designTokensPath: options.designTokensPath,
  };
  let report = await createProjectHealthReport(projectRoot, reportOptions);
  const baselineComparison = options.sinceBaseline
    ? compareHealthBaseline(projectRoot, report)
    : null;
  report = withAdditionalHealthFindings(
    projectRoot,
    report,
    visualBaselineFindings(baselineComparison),
  );
  const baselineComparisonPath = baselineComparison
    ? saveHealthBaselineComparison(projectRoot, baselineComparison)
    : null;

  if (options.promptId) {
    const finding = report.findings.find((entry) => entry.id === options.promptId);
    await sendProjectHealthReportTelemetry({
      ci: options.ci ?? false,
      durationMs: Date.now() - startedAt,
      projectRoot,
      report,
    });
    await sendProjectHealthPromptTelemetry({
      ci: options.ci ?? false,
      finding,
      projectRoot,
      report,
    });
    if (!finding) {
      console.error(`${RED}No health finding found for id: ${options.promptId}${RESET}`);
      process.exitCode = 1;
      return;
    }
    console.log(finding.remediation.prompt);
    return;
  }

  const format = resolveFormat(options);
  const failOn = options.failOn ?? 'error';
  const evidenceBundle = options.evidence
    ? await createProjectEvidenceBundle(projectRoot, report, reportOptions)
    : null;
  const basePayload = options.evidence
    ? `${JSON.stringify(evidenceBundle, null, 2)}\n`
    : format === 'json'
      ? formatProjectHealthJson(report)
      : format === 'markdown'
        ? formatProjectHealthMarkdown(report)
        : formatProjectHealthText(report);
  const payload =
    baselineComparison && !options.evidence && format === 'text'
      ? `${basePayload}${formatBaselineComparisonText(baselineComparison)}`
      : basePayload;

  if (options.output) {
    const outputPath = isAbsolute(options.output)
      ? options.output
      : join(projectRoot, options.output);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, payload, 'utf-8');
    if (!options.ci) {
      console.log(
        `${GREEN}Wrote Decantr ${options.evidence ? 'evidence bundle' : 'health report'}:${RESET} ${options.output}`,
      );
      if (options.browser && evidenceBundle?.browser?.status === 'unavailable') {
        const reason =
          evidenceBundle.browser.findings[0] ??
          'Playwright is not available to Decantr in this project.';
        console.log(`${YELLOW}Browser evidence unavailable:${RESET} ${reason}`);
        console.log(
          `${DIM}Static evidence was still written. Install Playwright or omit --browser/--base-url evidence if screenshots are not needed.${RESET}`,
        );
      }
    }
  } else {
    process.stdout.write(payload);
  }

  await sendProjectHealthReportTelemetry({
    ci: options.ci ?? false,
    durationMs: Date.now() - startedAt,
    failOn,
    format,
    outputWritten: Boolean(options.output),
    projectRoot,
    report,
  });

  if (options.saveBaseline) {
    const path = saveHealthBaseline(projectRoot, report);
    if (!options.ci && !options.output && format !== 'json' && !options.evidence) {
      console.log(`${GREEN}Saved Decantr health baseline:${RESET} ${path}`);
    } else if (!options.ci && options.output) {
      console.log(`${GREEN}Saved Decantr health baseline:${RESET} ${path}`);
    }
  }

  if (baselineComparisonPath && !options.ci && options.output) {
    console.log(
      `${GREEN}Wrote Decantr health baseline comparison:${RESET} ${baselineComparisonPath}`,
    );
  }

  if (options.ci && shouldFailHealth(report, failOn)) {
    if (failOn !== 'none') {
      await sendProjectHealthCiFailedTelemetry({
        ci: true,
        durationMs: Date.now() - startedAt,
        failOn,
        format,
        outputWritten: Boolean(options.output),
        projectRoot,
        report,
      });
    }
    process.exitCode = 1;
  }
}

export function parseHealthArgs(args: string[]): HealthCommandOptions {
  const options: HealthCommandOptions = {};

  if (args[1] === 'init-ci') {
    options.initCi = {};
    for (let index = 2; index < args.length; index += 1) {
      const arg = args[index];
      if (arg === '--force') {
        options.initCi.force = true;
      } else if (arg === '--fail-on' && args[index + 1]) {
        options.initCi.failOn = args[++index] as HealthFailOn;
      } else if (arg.startsWith('--fail-on=')) {
        options.initCi.failOn = arg.split('=')[1] as HealthFailOn;
      } else if ((arg === '--cli-version' || arg === '--cli') && args[index + 1]) {
        options.initCi.cliVersion = args[++index];
      } else if (arg.startsWith('--cli-version=')) {
        options.initCi.cliVersion = arg.split('=')[1];
      } else if (arg.startsWith('--cli=')) {
        options.initCi.cliVersion = arg.split('=')[1];
      } else if (arg === '--workflow-path' && args[index + 1]) {
        options.initCi.workflowPath = args[++index];
      } else if (arg.startsWith('--workflow-path=')) {
        options.initCi.workflowPath = arg.split('=')[1];
      } else if (arg === '--report-path' && args[index + 1]) {
        options.initCi.reportPath = args[++index];
      } else if (arg.startsWith('--report-path=')) {
        options.initCi.reportPath = arg.split('=')[1];
      } else if (arg === '--json-path' && args[index + 1]) {
        options.initCi.jsonPath = args[++index];
      } else if (arg.startsWith('--json-path=')) {
        options.initCi.jsonPath = arg.split('=')[1];
      } else if (arg === '--project' && args[index + 1]) {
        options.initCi.projectPath = args[++index];
      } else if (arg.startsWith('--project=')) {
        options.initCi.projectPath = arg.split('=')[1];
      } else if (arg === '--workspace') {
        options.initCi.workspace = true;
      }
    }

    normalizeHealthFailOn(options.initCi.failOn);
    if (!options.initCi.workspace) validateProjectPath(options.initCi.projectPath);
    return options;
  }

  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--json') {
      options.json = true;
    } else if (arg === '--markdown') {
      options.markdown = true;
    } else if (arg === '--evidence') {
      options.evidence = true;
      options.json = true;
    } else if (arg === '--browser') {
      options.browser = true;
    } else if (arg === '--require-browser') {
      options.browser = true;
      options.requireBrowser = true;
    } else if (arg === '--save-baseline') {
      options.saveBaseline = true;
    } else if (arg === '--since-baseline') {
      options.sinceBaseline = true;
    } else if (arg === '--diagnostics') {
      options.diagnostics = true;
    } else if (arg === '--base-url' && args[index + 1]) {
      options.browserBaseUrl = args[++index];
    } else if (arg.startsWith('--base-url=')) {
      options.browserBaseUrl = arg.split('=')[1];
    } else if (arg === '--design-tokens' && args[index + 1]) {
      options.designTokensPath = args[++index];
    } else if (arg.startsWith('--design-tokens=')) {
      options.designTokensPath = arg.split('=')[1];
    } else if (arg === '--ci') {
      options.ci = true;
    } else if (arg === '--format' && args[index + 1]) {
      options.format = args[++index] as HealthOutputFormat;
    } else if (arg.startsWith('--format=')) {
      options.format = arg.split('=')[1] as HealthOutputFormat;
    } else if (arg === '--output' && args[index + 1]) {
      options.output = args[++index];
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    } else if (arg === '--fail-on' && args[index + 1]) {
      options.failOn = args[++index] as HealthFailOn;
    } else if (arg.startsWith('--fail-on=')) {
      options.failOn = arg.split('=')[1] as HealthFailOn;
    } else if (arg === '--prompt' && args[index + 1]) {
      options.promptId = args[++index];
    } else if (arg.startsWith('--prompt=')) {
      options.promptId = arg.split('=')[1];
    }
  }

  if (options.format && !['text', 'json', 'markdown'].includes(options.format)) {
    throw new Error('Invalid --format value. Use text, json, or markdown.');
  }
  if (options.failOn && !['error', 'warn', 'none'].includes(options.failOn)) {
    throw new Error('Invalid --fail-on value. Use error, warn, or none.');
  }

  return options;
}
