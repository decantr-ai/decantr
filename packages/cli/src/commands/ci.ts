import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import type { ProjectHealthReport } from '@decantr/verifier';
import { validateLocalLaw } from '../local-law.js';
import { resolveWorkspaceInfo } from '../workspace.js';
import {
  createProjectHealthReport,
  formatProjectHealthMarkdown,
  formatProjectHealthText,
  type HealthFailOn,
  shouldFailHealth,
} from './health.js';
import {
  createWorkspaceHealthReport,
  formatWorkspaceHealthMarkdown,
  formatWorkspaceHealthText,
  shouldFailWorkspaceHealth,
  type WorkspaceHealthReport,
} from './workspace.js';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

type CiProvider = 'github' | 'generic';
type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun' | 'unknown';

interface CiOptions {
  init?: boolean;
  project?: string;
  workspace?: boolean;
  changed?: boolean;
  since?: string;
  json?: boolean;
  markdown?: boolean;
  output?: string;
  markdownOutput?: string;
  failOn?: HealthFailOn;
  provider?: CiProvider;
  force?: boolean;
}

interface LocalLawCiSummary {
  checked: boolean;
  patternsPresent: boolean;
  rulesPresent: boolean;
  errorCount: number;
  warnCount: number;
}

interface ProjectCiReport {
  $schema: string;
  generatedAt: string;
  mode: 'project';
  projectPath: string | null;
  failOn: HealthFailOn;
  status: ProjectHealthReport['status'];
  health: ProjectHealthReport;
  localLaw: LocalLawCiSummary;
}

interface WorkspaceCiReport {
  $schema: string;
  generatedAt: string;
  mode: 'workspace';
  failOn: HealthFailOn;
  status: 'healthy' | 'warning' | 'error';
  workspace: WorkspaceHealthReport;
}

const CI_SCHEMA = 'https://decantr.ai/schemas/decantr-ci-report.v1.json';

function readJson(path: string): {
  packageManager?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
} | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

function parseHealthFailOn(value: string | undefined): HealthFailOn {
  if (value === 'warn' || value === 'none') return value;
  return 'error';
}

function parseCiArgs(args: string[]): CiOptions {
  const options: CiOptions = {
    init: args[1] === 'init',
    failOn: 'error',
  };
  const start = options.init ? 2 : 1;
  for (let index = start; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--project' && args[index + 1]) options.project = args[++index];
    else if (arg.startsWith('--project=')) options.project = arg.split('=')[1];
    else if (arg === '--workspace') options.workspace = true;
    else if (arg === '--changed') options.changed = true;
    else if (arg === '--since' && args[index + 1]) options.since = args[++index];
    else if (arg.startsWith('--since=')) options.since = arg.split('=')[1];
    else if (arg === '--json') options.json = true;
    else if (arg === '--markdown') options.markdown = true;
    else if (arg === '--output' && args[index + 1]) options.output = args[++index];
    else if (arg.startsWith('--output=')) options.output = arg.split('=')[1];
    else if (arg === '--markdown-output' && args[index + 1]) options.markdownOutput = args[++index];
    else if (arg.startsWith('--markdown-output=')) options.markdownOutput = arg.split('=')[1];
    else if (arg === '--fail-on' && args[index + 1])
      options.failOn = parseHealthFailOn(args[++index]);
    else if (arg.startsWith('--fail-on=')) options.failOn = parseHealthFailOn(arg.split('=')[1]);
    else if (arg === '--provider' && args[index + 1])
      options.provider = parseProvider(args[++index]);
    else if (arg.startsWith('--provider=')) options.provider = parseProvider(arg.split('=')[1]);
    else if (arg === '--force') options.force = true;
  }
  return options;
}

function parseProvider(value: string): CiProvider {
  return value === 'generic' ? 'generic' : 'github';
}

function detectPackageManager(root: string): PackageManager {
  const pkg = readJson(join(root, 'package.json'));
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

function hasWorkspaceMarker(root: string): boolean {
  const pkg = readJson(join(root, 'package.json'));
  return Boolean(
    existsSync(join(root, 'pnpm-workspace.yaml')) ||
      existsSync(join(root, 'turbo.json')) ||
      existsSync(join(root, 'nx.json')) ||
      pkg?.workspaces,
  );
}

function installCommand(packageManager: PackageManager): string {
  switch (packageManager) {
    case 'pnpm':
      return 'corepack enable\npnpm install --frozen-lockfile';
    case 'yarn':
      return 'corepack enable\nyarn install --frozen-lockfile';
    case 'bun':
      return 'bun install --frozen-lockfile';
    case 'npm':
      return 'npm ci';
    default:
      return 'npm install';
  }
}

function pinCliCommand(packageManager: PackageManager, root: string): string {
  switch (packageManager) {
    case 'pnpm':
      return hasWorkspaceMarker(root)
        ? 'pnpm add -D -w @decantr/cli'
        : 'pnpm add -D @decantr/cli';
    case 'yarn':
      return 'yarn add -D @decantr/cli';
    case 'bun':
      return 'bun add -d @decantr/cli';
    case 'npm':
      return 'npm install -D @decantr/cli';
    default:
      return 'npm install -D @decantr/cli';
  }
}

function decantrCommand(packageManager: PackageManager): string {
  switch (packageManager) {
    case 'pnpm':
      return 'pnpm exec decantr';
    case 'yarn':
      return 'yarn decantr';
    case 'bun':
      return 'bunx decantr';
    case 'npm':
      return 'npm exec -- decantr';
    default:
      return 'npx --no-install decantr';
  }
}

function localCliPinned(root: string): boolean {
  const pkg = readJson(join(root, 'package.json'));
  return Boolean(pkg?.devDependencies?.['@decantr/cli'] || pkg?.dependencies?.['@decantr/cli']);
}

function projectSlug(projectPath: string | undefined): string {
  return (projectPath || 'project').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
}

function writeOutput(root: string, path: string, content: string): void {
  const absolute = resolve(root, path);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, content, 'utf-8');
}

function summarizeLocalLaw(projectRoot: string): LocalLawCiSummary {
  const validation = validateLocalLaw(projectRoot);
  return {
    checked: validation.patternPackPresent || validation.ruleManifestPresent,
    patternsPresent: validation.patternPackPresent,
    rulesPresent: validation.ruleManifestPresent,
    errorCount: validation.findings.filter((finding) => finding.severity === 'error').length,
    warnCount:
      validation.findings.filter((finding) => finding.severity === 'warn').length +
      validation.warnings.length,
  };
}

function localLawFails(summary: LocalLawCiSummary, failOn: HealthFailOn): boolean {
  if (failOn === 'none' || !summary.checked) return false;
  if (summary.errorCount > 0) return true;
  return failOn === 'warn' && summary.warnCount > 0;
}

function formatProjectCiMarkdown(report: ProjectCiReport): string {
  const lines = [
    '# Decantr CI',
    '',
    `- Mode: **project**`,
    `- Project: \`${report.projectPath ?? '.'}\``,
    `- Status: **${report.status}**`,
    `- Fail on: \`${report.failOn}\``,
    `- Local law: ${
      report.localLaw.checked
        ? `${report.localLaw.errorCount} error(s), ${report.localLaw.warnCount} warning(s)`
        : 'not accepted yet'
    }`,
    '',
    formatProjectHealthMarkdown(report.health),
  ];
  return `${lines.join('\n')}\n`;
}

function formatWorkspaceCiMarkdown(report: WorkspaceCiReport): string {
  const lines = [
    '# Decantr CI',
    '',
    '- Mode: **workspace**',
    `- Status: **${report.status}**`,
    `- Fail on: \`${report.failOn}\``,
    '',
    formatWorkspaceHealthMarkdown(report.workspace),
  ];
  return `${lines.join('\n')}\n`;
}

function workspaceStatus(report: WorkspaceHealthReport): WorkspaceCiReport['status'] {
  if (report.summary.failedCount > 0 || report.summary.errorCount > 0) return 'error';
  if (report.summary.warningCount > 0) return 'warning';
  return 'healthy';
}

function renderGenericSnippet(input: {
  command: string;
  projectPath?: string;
  workspace?: boolean;
  failOn: HealthFailOn;
}): string {
  const project = input.projectPath ? ` --project ${input.projectPath}` : '';
  const workspace = input.workspace ? ' --workspace' : '';
  return `#!/usr/bin/env bash
set -euo pipefail

# Install dependencies with your repository's authoritative package manager first.
${input.command} ci${project}${workspace} --fail-on ${input.failOn} --json --output .decantr/ci/decantr-ci.json --markdown-output .decantr/ci/decantr-ci.md
`;
}

function renderGithubWorkflow(input: {
  packageManager: PackageManager;
  command: string;
  projectPath?: string;
  workspace?: boolean;
  failOn: HealthFailOn;
}): string {
  const slug = projectSlug(input.projectPath);
  const jsonPath = input.workspace ? '.decantr/ci/workspace.json' : `.decantr/ci/${slug}.json`;
  const markdownPath = input.workspace ? '.decantr/ci/workspace.md' : `.decantr/ci/${slug}.md`;
  const project = input.projectPath ? ` --project ${input.projectPath}` : '';
  const workspace = input.workspace ? ' --workspace' : '';

  return `name: Decantr CI

on:
  pull_request:
  workflow_dispatch:
  push:
    branches:
      - main

permissions:
  contents: read

jobs:
  decantr:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - uses: actions/setup-node@v6
        with:
          node-version: '22'

      - name: Install dependencies
        shell: bash
        run: |
          ${installCommand(input.packageManager).replace(/\n/g, '\n          ')}

      - name: Run Decantr CI
        shell: bash
        run: ${input.command} ci${project}${workspace} --fail-on ${input.failOn} --json --output ${jsonPath} --markdown-output ${markdownPath}

      - name: Publish Decantr summary
        if: always()
        shell: bash
        run: |
          if [ -f ${markdownPath} ]; then
            cat ${markdownPath} >> "$GITHUB_STEP_SUMMARY"
          fi

      - name: Upload Decantr artifacts
        if: always()
        uses: actions/upload-artifact@v6
        with:
          name: decantr-ci
          path: |
            ${jsonPath}
            ${markdownPath}
          if-no-files-found: ignore
`;
}

function writeCiInit(root: string, options: CiOptions): void {
  const workspaceInfo = resolveWorkspaceInfo(root, options.project);
  if (workspaceInfo.requiresProjectSelection && !options.workspace) {
    const candidate = workspaceInfo.appCandidates[0] ?? 'apps/web';
    throw new Error(
      `Decantr CI init needs an app path in this monorepo. Re-run with --project ${candidate} or --workspace.`,
    );
  }

  const outputRoot = workspaceInfo.workspaceRoot;
  const projectPath =
    options.project ??
    (options.workspace || workspaceInfo.appRoot === workspaceInfo.workspaceRoot
      ? undefined
      : relative(workspaceInfo.workspaceRoot, workspaceInfo.appRoot).replace(/\\/g, '/'));
  const packageManager = detectPackageManager(outputRoot);
  const command = decantrCommand(packageManager);
  const failOn = options.failOn ?? 'error';
  const provider = options.provider ?? 'github';

  if (!localCliPinned(outputRoot)) {
    console.log(
      `${DIM}No @decantr/cli dependency was found in the workspace root package.json. Before relying on CI, pin it with: ${pinCliCommand(packageManager, outputRoot)}${RESET}`,
    );
  }

  if (provider === 'generic') {
    const path = '.decantr/ci/decantr-ci.sh';
    const absolute = resolve(outputRoot, path);
    if (existsSync(absolute) && !options.force) {
      throw new Error(`${path} already exists. Re-run with --force to replace it.`);
    }
    writeOutput(
      outputRoot,
      path,
      renderGenericSnippet({
        command,
        projectPath,
        workspace: options.workspace,
        failOn,
      }),
    );
    console.log(`${GREEN}Created Decantr generic CI snippet:${RESET} ${path}`);
    console.log(
      `${DIM}${command} ci${projectPath ? ` --project ${projectPath}` : ''}${options.workspace ? ' --workspace' : ''}${RESET}`,
    );
    return;
  }

  const path = '.github/workflows/decantr-ci.yml';
  const absolute = resolve(outputRoot, path);
  if (existsSync(absolute) && !options.force) {
    throw new Error(`${path} already exists. Re-run with --force to replace it.`);
  }
  writeOutput(
    outputRoot,
    path,
    renderGithubWorkflow({
      packageManager,
      command,
      projectPath,
      workspace: options.workspace,
      failOn,
    }),
  );
  console.log(`${GREEN}Created Decantr CI workflow:${RESET} ${path}`);
  console.log(
    `${DIM}Command: ${command} ci${projectPath ? ` --project ${projectPath}` : ''}${options.workspace ? ' --workspace' : ''} --fail-on ${failOn}${RESET}`,
  );
}

async function runWorkspaceCi(root: string, options: CiOptions): Promise<number> {
  const failOn = options.failOn ?? 'error';
  const workspace = await createWorkspaceHealthReport(root, {
    ci: true,
    failOn,
    changedOnly: options.changed,
    since: options.since,
  });
  const report: WorkspaceCiReport = {
    $schema: CI_SCHEMA,
    generatedAt: new Date().toISOString(),
    mode: 'workspace',
    failOn,
    status: workspaceStatus(workspace),
    workspace,
  };
  const json = `${JSON.stringify(report, null, 2)}\n`;
  const markdown = formatWorkspaceCiMarkdown(report);

  if (options.output) writeOutput(root, options.output, json);
  if (options.markdownOutput) writeOutput(root, options.markdownOutput, markdown);

  if (!options.output && !options.markdownOutput) {
    if (options.json) process.stdout.write(json);
    else if (options.markdown) process.stdout.write(markdown);
    else process.stdout.write(formatWorkspaceHealthText(workspace));
  }

  return shouldFailWorkspaceHealth(workspace, failOn) ? 1 : 0;
}

async function runProjectCi(root: string, options: CiOptions): Promise<number> {
  const workspaceInfo = resolveWorkspaceInfo(root, options.project);
  if (workspaceInfo.requiresProjectSelection) {
    const candidate = workspaceInfo.appCandidates[0] ?? 'apps/web';
    console.error(`${RED}Decantr CI needs an app path in this monorepo.${RESET}`);
    console.error(`${DIM}Run: decantr ci --project ${candidate}${RESET}`);
    return 1;
  }

  const failOn = options.failOn ?? 'error';
  const health = await createProjectHealthReport(workspaceInfo.appRoot);
  const localLaw = summarizeLocalLaw(workspaceInfo.appRoot);
  const projectPath =
    workspaceInfo.appRoot === workspaceInfo.workspaceRoot
      ? null
      : workspaceInfo.appRoot.replace(`${workspaceInfo.workspaceRoot}/`, '');
  const report: ProjectCiReport = {
    $schema: CI_SCHEMA,
    generatedAt: new Date().toISOString(),
    mode: 'project',
    projectPath,
    failOn,
    status: health.status,
    health,
    localLaw,
  };
  const json = `${JSON.stringify(report, null, 2)}\n`;
  const markdown = formatProjectCiMarkdown(report);

  if (options.output) writeOutput(root, options.output, json);
  if (options.markdownOutput) writeOutput(root, options.markdownOutput, markdown);

  if (!options.output && !options.markdownOutput) {
    if (options.json) process.stdout.write(json);
    else if (options.markdown) process.stdout.write(markdown);
    else process.stdout.write(formatProjectHealthText(health));
  }

  return shouldFailHealth(health, failOn) || localLawFails(localLaw, failOn) ? 1 : 0;
}

export function cmdCiHelp(): void {
  console.log(`
${BOLD}decantr ci${RESET} — Non-mutating Decantr gate for CI and required validation scripts

${BOLD}Usage:${RESET}
  decantr ci [--project <path>] [--fail-on error|warn|none] [--json] [--output <file>]
  decantr ci --workspace [--changed --since origin/main]
  decantr ci init [--project <path>] [--workspace] [--provider github|generic] [--force]

${BOLD}Examples:${RESET}
  decantr ci --project apps/web
  decantr ci --workspace --changed --since origin/main
  decantr ci --project apps/web --json --output .decantr/ci/apps-web.json --markdown-output .decantr/ci/apps-web.md
  decantr ci init --project apps/web
  decantr ci init --provider generic --project apps/web
`);
}

export async function cmdCi(args: string[] = ['ci'], root: string = process.cwd()): Promise<void> {
  const options = parseCiArgs(args);
  try {
    if (options.init) {
      writeCiInit(root, options);
      return;
    }
    const exitCode = options.workspace
      ? await runWorkspaceCi(root, options)
      : await runProjectCi(root, options);
    if (exitCode !== 0) process.exitCode = exitCode;
  } catch (error) {
    console.error(`${RED}${(error as Error).message}${RESET}`);
    process.exitCode = 1;
  }
}
