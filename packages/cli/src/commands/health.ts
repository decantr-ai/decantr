import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  auditProject,
  type ContractAssertion,
  createContractAssertions,
  createEvidenceBundle,
  type EvidenceBundle,
  type ProjectHealthFinding,
  type ProjectHealthFindingSource,
  type ProjectHealthReport,
  type ProjectHealthStatus,
  type VerificationFinding,
  type VerificationSeverity,
} from '@decantr/verifier';
import {
  sendProjectHealthCiFailedTelemetry,
  sendProjectHealthPromptTelemetry,
  sendProjectHealthReportTelemetry,
} from '../telemetry.js';
import { resolveWorkspaceInfo } from '../workspace.js';
import { type CheckIssue, collectCheckIssues } from './heal.js';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const PROJECT_HEALTH_SCHEMA_URL = 'https://decantr.ai/schemas/project-health-report.v1.json';
const DEFAULT_HEALTH_CI_WORKFLOW_PATH = '.github/workflows/decantr-health.yml';
const DEFAULT_HEALTH_CI_REPORT_PATH = 'decantr-health.md';
const DEFAULT_HEALTH_CI_JSON_PATH = 'decantr-health.json';
const DEFAULT_HEALTH_CI_CLI_VERSION = 'latest';
const __dirname = dirname(fileURLToPath(import.meta.url));

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
  compilePacksCommand: string;
  verifyCommand: string;
  ciCommand: string;
}

interface BrowserVerificationResult {
  evidence: NonNullable<EvidenceBundle['browser']>;
  finding: ProjectHealthFinding | null;
}

interface VisualManifestRoute {
  route: string;
  url: string;
  screenshot: string | null;
  screenshotHash: string | null;
  status: 'captured' | 'failed';
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
      newPage(): Promise<{
        goto(
          url: string,
          options: { waitUntil: 'load' | 'domcontentloaded' | 'networkidle'; timeout: number },
        ): Promise<unknown>;
        screenshot(options: { path: string; fullPage: boolean }): Promise<unknown>;
      }>;
      close(): Promise<unknown>;
    }>;
  };
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
    id.includes('interaction') ||
    rule.includes('interaction')
  ) {
    return 'interaction';
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
  if (assertion.rule === 'tokens-file-present' && metadata.adoptionMode === 'contract-only') {
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
      return ['decantr check --strict', 'decantr health'];
    case 'assertion':
      return ['decantr refresh', 'decantr health --evidence'];
    case 'browser':
      return ['decantr health --browser', 'decantr health --evidence'];
    case 'design-token':
      return ['decantr export --to figma-tokens', 'decantr health --evidence'];
    case 'check':
      return ['decantr check', 'decantr health'];
    default:
      return ['decantr audit', 'decantr health'];
  }
}

function commandContextForProject(projectRoot: string): ProjectCommandContext {
  const workspaceInfo = resolveWorkspaceInfo(projectRoot);
  const relativeProjectPath = relative(workspaceInfo.workspaceRoot, projectRoot).replace(/\\/g, '/');
  const projectPath =
    relativeProjectPath && !relativeProjectPath.startsWith('..') && !isAbsolute(relativeProjectPath)
      ? relativeProjectPath
      : null;
  const projectFlag = projectPath ? ` --project ${projectPath}` : '';
  const essencePath = projectPath ? `${projectPath}/decantr.essence.json` : 'decantr.essence.json';

  return {
    projectPath,
    compilePacksCommand: `decantr registry compile-packs ${essencePath} --write-context`,
    verifyCommand: `decantr verify${projectFlag}`,
    ciCommand: `decantr ci${projectFlag} --fail-on error`,
  };
}

function rewriteHealthCommand(command: string, context: ProjectCommandContext): string {
  let rewritten = command.replace(
    /decantr registry compile-packs decantr\.essence\.json --write-context/g,
    context.compilePacksCommand,
  );

  if (!context.projectPath) return rewritten;

  rewritten = rewritten.replace(
    /^decantr init --existing\b/,
    `decantr init --project ${context.projectPath} --existing`,
  );
  rewritten = rewritten.replace(/^decantr analyze\b/, `decantr analyze --project ${context.projectPath}`);
  rewritten = rewritten.replace(/^decantr check\b/, `decantr check --project ${context.projectPath}`);
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
          evidence: finding.evidence,
          suggestedFix,
          commands,
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
  baseId?: string;
}): ProjectHealthFinding {
  const idBase = input.baseId || input.rule || `${input.category}-${input.message}`;
  const id = `${input.source}-${slugify(idBase)}`;
  const commands = commandsForFinding(input.source);
  const category = normalizeHealthCategory(input.category, input.source);
  const remediation = {
    summary: input.suggestedFix || `Resolve ${category.toLowerCase()} finding.`,
    commands,
    prompt: buildRemediationPrompt({
      id,
      source: input.source,
      category,
      severity: input.severity,
      message: input.message,
      evidence: input.evidence ?? [],
      suggestedFix: input.suggestedFix,
      commands,
    }),
  };

  return {
    id,
    source: input.source,
    category,
    severity: input.severity,
    message: input.message,
    evidence: input.evidence ?? [],
    target: input.target,
    file: input.file,
    rule: input.rule,
    suggestedFix: input.suggestedFix,
    remediation,
  };
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
        'Install Playwright in the project or rerun without `--browser` for static-only evidence.',
      baseId: 'playwright-missing',
    });
    return {
      finding,
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
      finding,
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
      finding,
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
  const browserFindings: string[] = [];
  const visualRoutes: VisualManifestRoute[] = [];
  const screenshotDir = join(projectRoot, '.decantr', 'evidence', 'screenshots');
  mkdirSync(screenshotDir, { recursive: true });

  let browser: Awaited<ReturnType<PlaywrightLike['chromium']['launch']>> | null = null;
  try {
    browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage();
    for (const route of routes) {
      const url = browserRouteUrl(options.browserBaseUrl, route);
      const relativePath = browserScreenshotRelativePath(route);
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        const absoluteScreenshotPath = join(projectRoot, relativePath);
        await page.screenshot({ path: absoluteScreenshotPath, fullPage: true });
        screenshots.push(relativePath);
        visualRoutes.push({
          route,
          url,
          screenshot: relativePath,
          screenshotHash: hashFile(absoluteScreenshotPath),
          status: 'captured',
        });
      } catch (error) {
        const message = (error as Error).message;
        browserFindings.push(`${route}: ${message}`);
        visualRoutes.push({
          route,
          url,
          screenshot: null,
          screenshotHash: null,
          status: 'failed',
          error: message,
        });
      }
    }
  } catch (error) {
    browserFindings.push((error as Error).message);
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

  if (browserFindings.length > 0) {
    const finding = createHealthFinding({
      source: 'browser',
      category: 'Browser Verification',
      severity: options.requireBrowser ? 'error' : 'warn',
      message: 'Browser verification could not render every declared route.',
      evidence: browserFindings.slice(0, 5),
      rule: 'browser-route-verification-failed',
      suggestedFix:
        'Start the app at the provided base URL, fix route render errors, and rerun `decantr health --browser --evidence`.',
      baseId: 'route-verification-failed',
    });
    return {
      finding,
      evidence: {
        enabled: true,
        status: 'failed',
        baseUrl: options.browserBaseUrl,
        screenshots,
        findings: browserFindings,
      },
    };
  }

  return {
    finding: null,
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
  const browserVerification = await collectBrowserVerification(
    projectRoot,
    options,
    declaredRoutes,
  );
  if (browserVerification?.finding && !isDuplicateFinding(seen, browserVerification.finding)) {
    findings.push(browserVerification.finding);
  }
  const scopedFindings = scopeHealthFindingsToProject(projectRoot, findings);
  const finalCounts = countFindings(scopedFindings);
  const commandContext = commandContextForProject(projectRoot);

  return {
    $schema: PROJECT_HEALTH_SCHEMA_URL,
    generatedAt: new Date().toISOString(),
    projectRoot,
    status: statusFromCounts(finalCounts),
    score: scoreFromCounts(finalCounts),
    summary: {
      ...finalCounts,
      findingCount: findings.length,
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
      issues: routeIssuesFromFindings(scopedFindings),
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
      recommendedCommand: commandContext.ciCommand,
      failOn: 'error',
    },
    findings: scopedFindings,
  };
}

function colorForStatus(status: ProjectHealthStatus): string {
  if (status === 'healthy') return GREEN;
  if (status === 'warning') return YELLOW;
  return RED;
}

export function formatProjectHealthText(report: ProjectHealthReport): string {
  const color = colorForStatus(report.status);
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
        `  ${findingColor}[${finding.severity.toUpperCase()}]${RESET} ${finding.id}: ${finding.message}`,
      );
      if (finding.evidence.length > 0) {
        lines.push(`    ${DIM}${finding.evidence[0]}${RESET}`);
      }
      if (finding.suggestedFix) {
        lines.push(`    ${DIM}Fix: ${finding.suggestedFix}${RESET}`);
      }
      lines.push(`    ${DIM}Prompt: decantr health --prompt ${finding.id}${RESET}`);
    }
  }

  lines.push('');
  lines.push(`${BOLD}CI:${RESET} ${report.ci.recommendedCommand}`);
  return `${lines.join('\n')}\n`;
}

export function formatProjectHealthMarkdown(report: ProjectHealthReport): string {
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
      lines.push(`- Message: ${finding.message}`);
      if (finding.suggestedFix) lines.push(`- Fix: ${finding.suggestedFix}`);
      if (finding.evidence.length > 0) {
        lines.push('- Evidence:');
        for (const evidence of finding.evidence) lines.push(`  - ${evidence}`);
      }
      lines.push(`- Prompt: \`decantr health --prompt ${finding.id}\``);
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

export async function createProjectEvidenceBundle(
  projectRoot: string,
  report: ProjectHealthReport,
  options: ProjectHealthReportOptions = {},
): Promise<EvidenceBundle> {
  const audit = await auditProject(projectRoot);
  const assertions: ContractAssertion[] = createContractAssertions(projectRoot, audit);
  return createEvidenceBundle({
    projectRoot,
    report,
    audit,
    assertions,
    workspaceConfigPath: existsSync(join(projectRoot, '.decantr', 'workspace.json'))
      ? join(projectRoot, '.decantr', 'workspace.json')
      : null,
    designTokensPath: resolveOptionalPath(projectRoot, options.designTokensPath) ?? null,
    browser: await browserEvidenceFromOptions(projectRoot, options, report.routes.declared),
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

  const startedAt = Date.now();
  const reportOptions: ProjectHealthReportOptions = {
    browser: options.browser,
    requireBrowser: options.requireBrowser,
    browserBaseUrl: options.browserBaseUrl ?? process.env.DECANTR_BROWSER_BASE_URL,
    designTokensPath: options.designTokensPath,
  };
  const report = await createProjectHealthReport(projectRoot, reportOptions);
  const baselineComparison = options.sinceBaseline
    ? compareHealthBaseline(projectRoot, report)
    : null;
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
  const basePayload = options.evidence
    ? `${JSON.stringify(await createProjectEvidenceBundle(projectRoot, report, reportOptions), null, 2)}\n`
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
