import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  auditProject,
  type ProjectHealthFinding,
  type ProjectHealthFindingSource,
  type ProjectHealthReport,
  type ProjectHealthStatus,
  type VerificationFinding,
  type VerificationSeverity,
} from '@decantr/verifier';
import { collectCheckIssues, type CheckIssue } from './heal.js';
import {
  sendProjectHealthCiFailedTelemetry,
  sendProjectHealthPromptTelemetry,
  sendProjectHealthReportTelemetry,
} from '../telemetry.js';

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
  initCi?: HealthCiOptions;
}

export interface HealthCiOptions {
  force?: boolean;
  failOn?: HealthFailOn;
  cliVersion?: string;
  workflowPath?: string;
  reportPath?: string;
  jsonPath?: string;
  projectPath?: string;
}

export interface HealthCiWriteResult {
  path: string;
  created: boolean;
  cliPackage: string;
  failOn: HealthFailOn;
  projectPath?: string;
}

interface ProjectMetadata {
  workflowMode: string | null;
  adoptionMode: string | null;
  autoBrownfield: boolean;
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
  const versionToken = value.startsWith('@decantr/cli@') ? value.slice('@decantr/cli@'.length) : value;
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
  const projectPath = validateProjectPath(options.projectPath);
  const reportPath = validateArtifactPath(
    options.reportPath || DEFAULT_HEALTH_CI_REPORT_PATH,
    '--report-path',
  );
  const jsonPath = validateArtifactPath(options.jsonPath || DEFAULT_HEALTH_CI_JSON_PATH, '--json-path');
  const template = loadHealthTemplate('decantr-health.workflow.yml.template');
  return renderTemplate(template, {
    CLI_PACKAGE: normalizeCliPackageSpecifier(options.cliVersion),
    FAIL_ON: failOn,
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
  const projectPath = validateProjectPath(options.projectPath);

  const result: HealthCiWriteResult = {
    path: workflowRelativePath,
    created: !alreadyExists,
    cliPackage: normalizeCliPackageSpecifier(options.cliVersion),
    failOn: normalizeHealthFailOn(options.failOn),
  };
  if (projectPath) result.projectPath = projectPath;
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
  if (category.includes('runtime') || category.includes('document') || category.includes('performance')) {
    return 'runtime';
  }
  if (category.includes('pack') || category.includes('review contract')) {
    return 'pack';
  }
  if (category.includes('interaction') || id.includes('interaction') || rule.includes('interaction')) {
    return 'interaction';
  }
  return 'audit';
}

function sourceFromCheckIssue(issue: CheckIssue): ProjectHealthFindingSource {
  if (issue.rule.startsWith('brownfield-')) return 'brownfield';
  if (issue.rule.includes('interaction')) return 'interaction';
  return 'check';
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function commandsForFinding(source: ProjectHealthFindingSource): string[] {
  switch (source) {
    case 'brownfield':
      return ['decantr analyze', 'decantr init --existing --merge-proposal', 'decantr health'];
    case 'pack':
      return ['decantr refresh', 'decantr registry get-pack review --write-context', 'decantr health'];
    case 'runtime':
      return ['npm run build', 'decantr health'];
    case 'interaction':
      return ['decantr check --strict', 'decantr health'];
    case 'check':
      return ['decantr check', 'decantr health'];
    default:
      return ['decantr audit', 'decantr health'];
  }
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
    input.evidence.length > 0 ? `Evidence:\n${input.evidence.map((entry) => `- ${entry}`).join('\n')}` : null,
    input.suggestedFix ? `Suggested fix: ${input.suggestedFix}` : null,
    '',
    'Make the smallest coherent code or contract change that resolves this finding. Preserve the existing framework, routing, styling system, and Decantr workflow mode unless the finding explicitly requires a contract update.',
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
  const remediation = {
    summary: input.suggestedFix || `Resolve ${input.category.toLowerCase()} finding.`,
    commands,
    prompt: buildRemediationPrompt({
      id,
      source: input.source,
      category: input.category,
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
    category: input.category,
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

function scoreFromCounts(counts: { errorCount: number; warnCount: number; infoCount: number }): number {
  return Math.max(0, Math.min(100, 100 - counts.errorCount * 15 - counts.warnCount * 5 - counts.infoCount));
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

export async function createProjectHealthReport(projectRoot: string = process.cwd()): Promise<ProjectHealthReport> {
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

  const counts = countFindings(findings);
  const declaredRoutes = collectDeclaredRoutes(audit.essence);
  const manifest = audit.packManifest;

  return {
    $schema: PROJECT_HEALTH_SCHEMA_URL,
    generatedAt: new Date().toISOString(),
    projectRoot,
    status: statusFromCounts(counts),
    score: scoreFromCounts(counts),
    summary: {
      ...counts,
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
      runtimeCoverageOk: audit.summary.runtimeAuditChecked ? audit.runtimeAudit.routeHintsCoverageOk : null,
      issues: routeIssuesFromFindings(findings),
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
      console.log(`${DIM}CI gate: decantr health --ci --fail-on ${result.failOn}${RESET}`);
    } catch (e) {
      console.error(`${RED}${(e as Error).message}${RESET}`);
      process.exitCode = 1;
    }
    return;
  }

  const startedAt = Date.now();
  const report = await createProjectHealthReport(projectRoot);

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
  const payload =
    format === 'json'
      ? formatProjectHealthJson(report)
      : format === 'markdown'
        ? formatProjectHealthMarkdown(report)
        : formatProjectHealthText(report);

  if (options.output) {
    writeFileSync(options.output, payload, 'utf-8');
    if (!options.ci) {
      console.log(`${GREEN}Wrote Decantr health report:${RESET} ${options.output}`);
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
      }
    }

    normalizeHealthFailOn(options.initCi.failOn);
    validateProjectPath(options.initCi.projectPath);
    return options;
  }

  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--json') {
      options.json = true;
    } else if (arg === '--markdown') {
      options.markdown = true;
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
