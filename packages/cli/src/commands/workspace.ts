import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { createProjectHealthReport, type HealthFailOn } from './health.js';
import type { ProjectHealthStatus } from '@decantr/verifier';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

const WORKSPACE_HEALTH_SCHEMA_URL = 'https://decantr.ai/schemas/workspace-health-report.v1.json';
const DEFAULT_IGNORES = new Set([
  '.git',
  '.next',
  '.turbo',
  '.vercel',
  'coverage',
  'dist',
  'node_modules',
  'playwright-report',
]);

export interface DecantrWorkspaceProjectConfig {
  id?: string;
  path: string;
  owner?: string;
  tags?: string[];
  criticality?: 'low' | 'normal' | 'high';
  browser?: boolean;
}

export interface DecantrWorkspaceConfig {
  projects?: DecantrWorkspaceProjectConfig[];
  ignore?: string[];
  concurrency?: number;
  timeoutMs?: number;
  browser?: boolean;
}

export interface WorkspaceProject {
  id: string;
  path: string;
  absolutePath: string;
  owner: string | null;
  tags: string[];
  criticality: 'low' | 'normal' | 'high';
  browser: boolean;
  source: 'manifest' | 'auto';
}

export interface WorkspaceHealthProject {
  id: string;
  path: string;
  status: ProjectHealthStatus | 'failed';
  score: number;
  errorCount: number;
  warnCount: number;
  infoCount: number;
  findingCount: number;
  durationMs: number;
  changed: boolean;
  source: 'manifest' | 'auto';
  error: string | null;
}

export interface WorkspaceHealthReport {
  $schema: string;
  generatedAt: string;
  workspaceRoot: string;
  changedOnly: boolean;
  since: string | null;
  summary: {
    projectCount: number;
    checkedCount: number;
    healthyCount: number;
    warningCount: number;
    errorCount: number;
    failedCount: number;
  };
  projects: WorkspaceHealthProject[];
}

export interface WorkspaceHealthOptions {
  json?: boolean;
  markdown?: boolean;
  output?: string;
  ci?: boolean;
  failOn?: HealthFailOn;
  changedOnly?: boolean;
  since?: string;
  concurrency?: number;
  timeoutMs?: number;
  browser?: boolean;
}

export interface WorkspaceCommandOptions extends WorkspaceHealthOptions {
  subcommand: 'list' | 'health';
}

function workspaceConfigPath(root: string): string {
  return join(root, '.decantr', 'workspace.json');
}

function readWorkspaceConfig(root: string): DecantrWorkspaceConfig | null {
  const path = workspaceConfigPath(root);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8')) as DecantrWorkspaceConfig;
}

function normalizeProjectPath(raw: string): string {
  const normalized = raw.replace(/^\.\/+/, '').replace(/\/+$/, '');
  if (
    !normalized ||
    normalized.startsWith('/') ||
    normalized.includes('..') ||
    normalized.includes('\\') ||
    /\s/.test(normalized)
  ) {
    throw new Error(`Invalid workspace project path: ${raw}`);
  }
  return normalized;
}

function projectIdFromPath(path: string): string {
  return path.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'project';
}

function discoverProjectPaths(root: string, config: DecantrWorkspaceConfig | null): string[] {
  const ignored = new Set([...(config?.ignore ?? []), ...DEFAULT_IGNORES]);
  const results = new Set<string>();

  function walk(dir: string, depth: number): void {
    if (depth > 6) return;
    const rel = relative(root, dir).replace(/\\/g, '/');
    if (rel && [...ignored].some((entry) => rel === entry || rel.startsWith(`${entry}/`))) return;

    if (existsSync(join(dir, 'decantr.essence.json'))) {
      results.add(rel || '.');
      return;
    }

    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      if (ignored.has(entry.name)) continue;
      walk(join(dir, entry.name), depth + 1);
    }
  }

  walk(root, 0);
  return [...results].sort();
}

export function listWorkspaceProjects(root: string = process.cwd()): WorkspaceProject[] {
  const workspaceRoot = resolve(root);
  const config = readWorkspaceConfig(workspaceRoot);
  const byPath = new Map<string, WorkspaceProject>();

  for (const project of config?.projects ?? []) {
    const path = normalizeProjectPath(project.path);
    byPath.set(path, {
      id: project.id ?? projectIdFromPath(path),
      path,
      absolutePath: resolve(workspaceRoot, path),
      owner: project.owner ?? null,
      tags: project.tags ?? [],
      criticality: project.criticality ?? 'normal',
      browser: project.browser ?? config?.browser ?? false,
      source: 'manifest',
    });
  }

  for (const path of discoverProjectPaths(workspaceRoot, config)) {
    if (byPath.has(path)) continue;
    byPath.set(path, {
      id: projectIdFromPath(path),
      path,
      absolutePath: resolve(workspaceRoot, path),
      owner: null,
      tags: [],
      criticality: 'normal',
      browser: config?.browser ?? false,
      source: 'auto',
    });
  }

  return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
}

function changedPaths(root: string, since: string): Set<string> {
  try {
    const output = execFileSync('git', ['diff', '--name-only', since, '--'], {
      cwd: root,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return new Set(output.split('\n').map((line) => line.trim()).filter(Boolean));
  } catch {
    return new Set();
  }
}

function projectChanged(project: WorkspaceProject, changed: Set<string>): boolean {
  if (changed.size === 0) return false;
  const prefix = project.path === '.' ? '' : `${project.path}/`;
  for (const path of changed) {
    if (project.path === '.' || path === project.path || path.startsWith(prefix)) return true;
  }
  return false;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timeout: NodeJS.Timeout | undefined;
  const timer = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timer]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function mapLimited<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, () => worker()));
  return results;
}

export async function createWorkspaceHealthReport(
  root: string = process.cwd(),
  options: WorkspaceHealthOptions = {},
): Promise<WorkspaceHealthReport> {
  const workspaceRoot = resolve(root);
  const config = readWorkspaceConfig(workspaceRoot);
  const since = options.since ?? 'origin/main';
  const changed = options.changedOnly ? changedPaths(workspaceRoot, since) : new Set<string>();
  const allProjects = listWorkspaceProjects(workspaceRoot);
  const projects = options.changedOnly
    ? allProjects.filter((project) => projectChanged(project, changed))
    : allProjects;
  const concurrency = options.concurrency ?? config?.concurrency ?? 4;
  const timeoutMs = options.timeoutMs ?? config?.timeoutMs ?? 120000;

  const checked = await mapLimited(projects, concurrency, async (project) => {
    const startedAt = Date.now();
    try {
      const report = await withTimeout(
        createProjectHealthReport(project.absolutePath, {
          browser: options.browser ?? project.browser,
        }),
        timeoutMs,
        project.path,
      );
      return {
        id: project.id,
        path: project.path,
        status: report.status,
        score: report.score,
        errorCount: report.summary.errorCount,
        warnCount: report.summary.warnCount,
        infoCount: report.summary.infoCount,
        findingCount: report.summary.findingCount,
        durationMs: Date.now() - startedAt,
        changed: options.changedOnly ? projectChanged(project, changed) : false,
        source: project.source,
        error: null,
      } satisfies WorkspaceHealthProject;
    } catch (error) {
      return {
        id: project.id,
        path: project.path,
        status: 'failed',
        score: 0,
        errorCount: 1,
        warnCount: 0,
        infoCount: 0,
        findingCount: 1,
        durationMs: Date.now() - startedAt,
        changed: options.changedOnly ? projectChanged(project, changed) : false,
        source: project.source,
        error: (error as Error).message,
      } satisfies WorkspaceHealthProject;
    }
  });

  return {
    $schema: WORKSPACE_HEALTH_SCHEMA_URL,
    generatedAt: new Date().toISOString(),
    workspaceRoot,
    changedOnly: options.changedOnly ?? false,
    since: options.changedOnly ? since : null,
    summary: {
      projectCount: allProjects.length,
      checkedCount: checked.length,
      healthyCount: checked.filter((project) => project.status === 'healthy').length,
      warningCount: checked.filter((project) => project.status === 'warning').length,
      errorCount: checked.filter((project) => project.status === 'error').length,
      failedCount: checked.filter((project) => project.status === 'failed').length,
    },
    projects: checked,
  };
}

export function formatWorkspaceHealthText(report: WorkspaceHealthReport): string {
  const lines = [
    `${BOLD}Decantr Workspace Health${RESET}`,
    '',
    `Projects: ${report.summary.checkedCount}/${report.summary.projectCount}`,
    `Healthy: ${report.summary.healthyCount} | Warnings: ${report.summary.warningCount} | Errors: ${report.summary.errorCount} | Failed: ${report.summary.failedCount}`,
    '',
  ];
  for (const project of report.projects) {
    const color =
      project.status === 'healthy' ? GREEN : project.status === 'warning' ? YELLOW : RED;
    lines.push(
      `${color}${String(project.status).toUpperCase()}${RESET} ${project.path} score ${project.score}/100 findings ${project.findingCount}`,
    );
    if (project.error) lines.push(`  ${DIM}${project.error}${RESET}`);
  }
  return `${lines.join('\n')}\n`;
}

export function formatWorkspaceHealthMarkdown(report: WorkspaceHealthReport): string {
  const lines = [
    '# Decantr Workspace Health',
    '',
    `- Projects checked: **${report.summary.checkedCount}/${report.summary.projectCount}**`,
    `- Healthy: ${report.summary.healthyCount}`,
    `- Warnings: ${report.summary.warningCount}`,
    `- Errors: ${report.summary.errorCount}`,
    `- Failed: ${report.summary.failedCount}`,
    '',
    '| Project | Status | Score | Findings | Source |',
    '| --- | --- | ---: | ---: | --- |',
  ];
  for (const project of report.projects) {
    lines.push(
      `| \`${project.path}\` | ${project.status} | ${project.score} | ${project.findingCount} | ${project.source} |`,
    );
  }
  return `${lines.join('\n')}\n`;
}

export function shouldFailWorkspaceHealth(
  report: WorkspaceHealthReport,
  failOn: HealthFailOn = 'error',
): boolean {
  if (failOn === 'none') return false;
  if (report.summary.failedCount > 0 || report.summary.errorCount > 0) return true;
  return failOn === 'warn' && report.summary.warningCount > 0;
}

function parseHealthFailOn(value: string | undefined): HealthFailOn {
  if (value === 'warn' || value === 'none') return value;
  return 'error';
}

export function parseWorkspaceArgs(args: string[]): WorkspaceCommandOptions {
  const subcommand = args[1] === 'health' ? 'health' : 'list';
  const options: WorkspaceCommandOptions = { subcommand };

  for (let index = 2; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--json') options.json = true;
    else if (arg === '--markdown') options.markdown = true;
    else if (arg === '--ci') options.ci = true;
    else if (arg === '--browser') options.browser = true;
    else if (arg === '--changed') options.changedOnly = true;
    else if (arg === '--since' && args[index + 1]) options.since = args[++index];
    else if (arg.startsWith('--since=')) options.since = arg.split('=')[1];
    else if (arg === '--output' && args[index + 1]) options.output = args[++index];
    else if (arg.startsWith('--output=')) options.output = arg.split('=')[1];
    else if (arg === '--fail-on' && args[index + 1]) options.failOn = parseHealthFailOn(args[++index]);
    else if (arg.startsWith('--fail-on=')) options.failOn = parseHealthFailOn(arg.split('=')[1]);
    else if (arg === '--concurrency' && args[index + 1]) options.concurrency = Number(args[++index]);
    else if (arg.startsWith('--concurrency=')) options.concurrency = Number(arg.split('=')[1]);
    else if (arg === '--timeout-ms' && args[index + 1]) options.timeoutMs = Number(args[++index]);
    else if (arg.startsWith('--timeout-ms=')) options.timeoutMs = Number(arg.split('=')[1]);
  }

  return options;
}

export async function cmdWorkspace(
  workspaceRoot: string = process.cwd(),
  args: string[] = ['workspace'],
): Promise<void> {
  const options = parseWorkspaceArgs(args);

  if (options.subcommand === 'list') {
    const projects = listWorkspaceProjects(workspaceRoot);
    const payload = `${JSON.stringify({ projects }, null, 2)}\n`;
    if (options.json) {
      process.stdout.write(payload);
      return;
    }
    console.log(`${BOLD}Decantr workspace projects${RESET}`);
    for (const project of projects) {
      console.log(`${project.path} ${DIM}${project.source}${RESET}`);
    }
    return;
  }

  const report = await createWorkspaceHealthReport(workspaceRoot, options);
  const payload = options.json
    ? `${JSON.stringify(report, null, 2)}\n`
    : options.markdown
      ? formatWorkspaceHealthMarkdown(report)
      : formatWorkspaceHealthText(report);

  if (options.output) {
    mkdirSync(dirname(resolve(workspaceRoot, options.output)), { recursive: true });
    writeFileSync(resolve(workspaceRoot, options.output), payload, 'utf-8');
    if (!options.ci) console.log(`${GREEN}Wrote Decantr workspace health:${RESET} ${options.output}`);
  } else {
    process.stdout.write(payload);
  }

  if (options.ci && shouldFailWorkspaceHealth(report, options.failOn ?? 'error')) {
    process.exitCode = 1;
  }
}
