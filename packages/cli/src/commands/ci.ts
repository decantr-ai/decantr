import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { buildChangedFileGraphImpact, type GraphSnapshot } from '@decantr/core';
import type {
  AuthorityResolution,
  DecantrCiProjectReportV3,
  DecantrCiWorkspaceReportV3,
  EvidenceTier,
  GovernanceComparisonScopeV1,
  GovernanceCurrentStateV1,
  GovernanceDebtBaselineV1,
  GovernanceFindingLocationV1,
  GovernanceFindingOccurrenceInputV1,
  GovernanceGitChangeBaseV1,
  LoopReadiness,
  ProjectHealthFinding,
  ProjectHealthReport,
  VerificationGraphAnchor,
} from '@decantr/verifier';
import {
  canonicalJsonStringify,
  createDecantrCiProjectReportV3,
  createDecantrCiWorkspaceReportV3,
  createGovernanceDeltaV1,
  createProjectAdoptionTruthV1,
  createStableProjectIdentityV1,
  DECANTR_CI_REPORT_V2_SCHEMA_URL,
  discoverProject,
  evaluateDiscoveryReadiness,
  fingerprintFindingOccurrenceV1,
  GOVERNANCE_FINDING_FINGERPRINT_VERSION,
} from '@decantr/verifier';
import { validateLocalLaw } from '../local-law.js';
import { createStyleBridgeTaskSummary } from '../style-bridge.js';
import { resolveWorkspaceInfo } from '../workspace.js';
import {
  createProjectHealthReport,
  evaluateHealthBaselineGate,
  formatProjectHealthMarkdown,
  formatProjectHealthText,
  type HealthBaselineGate,
  type HealthFailOn,
  shouldFailHealth,
  shouldFailHealthBaselineGate,
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
type CiReportVersion = 'v2' | 'v3';

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
  reportVersion?: CiReportVersion;
}

interface LocalLawCiSummary {
  checked: boolean;
  patternsPresent: boolean;
  rulesPresent: boolean;
  warnings: string[];
  findings: Array<{
    ruleId: string;
    severity: 'info' | 'warn' | 'error';
    file: string;
    line: number;
    column: number;
    message: string;
    suggestedFix: string;
  }>;
  errorCount: number;
  warnCount: number;
}

interface StyleBridgeCiSummary {
  checked: boolean;
  present: boolean;
  status: string | null;
  mappingCount: number;
  stylingApproach: string | null;
  themeModes: string[];
  warnings: string[];
}

interface ProjectCiReport {
  $schema: string;
  generatedAt: string;
  mode: 'project';
  projectPath: string | null;
  failOn: HealthFailOn;
  status: ProjectHealthReport['status'];
  loop: LoopReadiness;
  authority: AuthorityResolution;
  evidenceTier: EvidenceTier;
  health: ProjectHealthReport;
  baselineGate: HealthBaselineGate;
  localLaw: LocalLawCiSummary;
  styleBridge: StyleBridgeCiSummary;
}

interface WorkspaceCiReport {
  $schema: string;
  generatedAt: string;
  mode: 'workspace';
  failOn: HealthFailOn;
  status: 'healthy' | 'warning' | 'error';
  loop: WorkspaceHealthReport['loop'];
  workspace: WorkspaceHealthReport;
}

const CI_SCHEMA = DECANTR_CI_REPORT_V2_SCHEMA_URL;

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

function parseReportVersion(value: string | undefined): CiReportVersion {
  if (value === 'v2' || value === 'v3') return value;
  throw new Error('Invalid --report-version value. Use v2 or v3.');
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
    else if (arg === '--report-version') options.reportVersion = parseReportVersion(args[++index]);
    else if (arg.startsWith('--report-version='))
      options.reportVersion = parseReportVersion(arg.split('=')[1]);
    else if (arg === '--force') options.force = true;
  }
  return options;
}

function parseProvider(value: string): CiProvider {
  if (value === 'github' || value === 'generic') return value;
  throw new Error('Invalid --provider value. Use github or generic.');
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
      return hasWorkspaceMarker(root) ? 'pnpm add -D -w @decantr/cli' : 'pnpm add -D @decantr/cli';
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
    warnings: validation.warnings,
    findings: validation.findings.map((finding) => ({
      ruleId: finding.ruleId,
      severity: finding.severity,
      file: finding.file,
      line: finding.line,
      column: finding.column,
      message: finding.message,
      suggestedFix: finding.suggestedFix,
    })),
    errorCount: validation.findings.filter((finding) => finding.severity === 'error').length,
    warnCount:
      validation.findings.filter((finding) => finding.severity === 'warn').length +
      validation.warnings.length,
  };
}

function summarizeStyleBridge(projectRoot: string): StyleBridgeCiSummary {
  const summary = createStyleBridgeTaskSummary(projectRoot);
  const warnings: string[] = [];
  if (summary.path && summary.mappingCount === 0) {
    warnings.push('.decantr/style-bridge.json has no mappings.');
  }
  return {
    checked: Boolean(summary.path),
    present: Boolean(summary.path),
    status: summary.status,
    mappingCount: summary.mappingCount,
    stylingApproach: summary.stylingApproach,
    themeModes: summary.themeModes,
    warnings,
  };
}

function localLawFails(summary: LocalLawCiSummary, failOn: HealthFailOn): boolean {
  if (failOn === 'none' || !summary.checked) return false;
  if (summary.errorCount > 0) return true;
  return failOn === 'warn' && summary.warnCount > 0;
}

function styleBridgeFails(summary: StyleBridgeCiSummary, failOn: HealthFailOn): boolean {
  if (failOn === 'none' || !summary.checked) return false;
  return failOn === 'warn' && summary.warnings.length > 0;
}

function projectCiStatus(
  health: ProjectHealthReport,
  baselineGate: HealthBaselineGate,
  localLaw: LocalLawCiSummary,
  styleBridge: StyleBridgeCiSummary,
): ProjectCiReport['status'] {
  const gateHasErrors = baselineGate.newFindings.some((finding) => finding.severity === 'error');
  const gateHasWarnings = baselineGate.newFindings.some((finding) => finding.severity === 'warn');
  if (gateHasErrors || localLaw.errorCount > 0) return 'error';
  if (
    gateHasWarnings ||
    baselineGate.inheritedFindingIds.length > 0 ||
    localLaw.warnCount > 0 ||
    styleBridge.warnings.length > 0
  ) {
    return 'warning';
  }
  return 'healthy';
}

function formatBaselineGateText(gate: HealthBaselineGate): string {
  if (!gate.applied) return '';
  return [
    '',
    `${BOLD}Brownfield baseline gate:${RESET}`,
    `  Baseline: ${gate.savedAt ?? 'unknown'}`,
    `  Inherited debt: ${gate.inheritedFindingIds.length} finding(s)`,
    `  New findings: ${gate.newFindings.length}`,
    '  Exit status is based on new findings; inherited debt remains visible above.',
    '',
  ].join('\n');
}

function formatLocalLawText(summary: LocalLawCiSummary, health: ProjectHealthReport): string {
  const lines = ['', `${BOLD}Project-owned local law:${RESET}`];
  if (!summary.checked) {
    const isBrownfield = health.summary.workflowMode === 'brownfield-attach';
    lines.push(
      isBrownfield
        ? '  Not accepted yet. Run `decantr codify --from-audit`, review, then `decantr codify --accept --confirm-reviewed`.'
        : '  Not active for this project.',
    );
    return `${lines.join('\n')}\n`;
  }

  lines.push(
    `  Patterns: ${summary.patternsPresent ? 'present' : 'missing'} | Rules: ${summary.rulesPresent ? 'present' : 'missing'}`,
  );
  lines.push(
    summary.rulesPresent
      ? "  Enforcement: Decantr scans accepted .decantr/rules.json; this command's --fail-on setting controls whether findings block."
      : '  Enforcement: advisory only until .decantr/rules.json is accepted.',
  );
  lines.push(`  Findings: ${summary.errorCount} error(s), ${summary.warnCount} warning(s)`);
  for (const warning of summary.warnings.slice(0, 5)) {
    lines.push(`  ${DIM}[WARN] ${warning}${RESET}`);
  }
  for (const finding of summary.findings.slice(0, 8)) {
    const label =
      finding.severity === 'error'
        ? 'Local law error'
        : finding.severity === 'warn'
          ? 'Local law warning'
          : 'Local law info';
    lines.push(
      `  [${label}] ${finding.ruleId} ${finding.file}:${finding.line}:${finding.column} ${finding.message}`,
    );
    lines.push(`    ${DIM}${finding.suggestedFix}${RESET}`);
  }
  if (summary.findings.length > 8) {
    lines.push(`  ${DIM}...${summary.findings.length - 8} more local-law finding(s)${RESET}`);
  }
  return `${lines.join('\n')}\n`;
}

function formatStyleBridgeText(summary: StyleBridgeCiSummary): string {
  const lines = ['', `${BOLD}Project-owned style bridge:${RESET}`];
  if (!summary.checked) {
    lines.push('  Not active for this project.');
    return `${lines.join('\n')}\n`;
  }
  lines.push(
    `  Present: ${summary.present ? 'yes' : 'no'} | Mappings: ${summary.mappingCount} | Styling: ${summary.stylingApproach ?? 'unknown'}`,
  );
  lines.push(
    '  Enforcement: advisory style-intent mapping; pair with accepted local rules, lint, tests, or visual regression when it should block.',
  );
  if (summary.themeModes.length > 0) {
    lines.push(`  Theme modes: ${summary.themeModes.join(', ')}`);
  }
  for (const warning of summary.warnings.slice(0, 5)) {
    lines.push(`  ${DIM}[WARN] ${warning}${RESET}`);
  }
  return `${lines.join('\n')}\n`;
}

function formatLocalLawMarkdown(summary: LocalLawCiSummary, health: ProjectHealthReport): string {
  const lines = ['## Project-Owned Local Law', ''];
  if (!summary.checked) {
    if (health.summary.workflowMode !== 'brownfield-attach') {
      lines.push('Local law is not active for this project.');
      return lines.join('\n');
    }
    lines.push(
      'Local law has not been accepted yet. Run `decantr codify --from-audit`, review the proposal, then run `decantr codify --accept --confirm-reviewed`.',
    );
    return lines.join('\n');
  }
  lines.push(
    `Patterns: **${summary.patternsPresent ? 'present' : 'missing'}** · Rules: **${summary.rulesPresent ? 'present' : 'missing'}**`,
  );
  lines.push(
    summary.rulesPresent
      ? 'Enforcement: Decantr scans accepted `.decantr/rules.json`; CI blocking depends on `--fail-on`.'
      : 'Enforcement: advisory only until `.decantr/rules.json` is accepted.',
  );
  lines.push('');
  lines.push(`Findings: **${summary.errorCount} error(s), ${summary.warnCount} warning(s)**`);
  if (summary.warnings.length > 0) {
    lines.push('');
    for (const warning of summary.warnings.slice(0, 5)) {
      lines.push(`- Warning: ${warning}`);
    }
  }
  if (summary.findings.length > 0) {
    lines.push('');
    for (const finding of summary.findings.slice(0, 12)) {
      lines.push(
        `- \`${finding.severity}\` \`${finding.ruleId}\` at \`${finding.file}:${finding.line}:${finding.column}\`: ${finding.message}`,
      );
    }
  }
  return lines.join('\n');
}

function formatStyleBridgeMarkdown(summary: StyleBridgeCiSummary): string {
  const lines = ['## Project-Owned Style Bridge', ''];
  if (!summary.checked) {
    lines.push('Style bridge is not active for this project.');
    return lines.join('\n');
  }
  lines.push(
    `Present: **${summary.present ? 'yes' : 'no'}** · Mappings: **${summary.mappingCount}** · Styling: **${summary.stylingApproach ?? 'unknown'}**`,
  );
  lines.push('');
  lines.push(
    'Enforcement: advisory style-intent mapping; pair with accepted local rules, lint, tests, or visual regression when it should block.',
  );
  if (summary.themeModes.length > 0) {
    lines.push('', `Theme modes: ${summary.themeModes.map((mode) => `\`${mode}\``).join(', ')}`);
  }
  if (summary.warnings.length > 0) {
    lines.push('');
    for (const warning of summary.warnings.slice(0, 5)) {
      lines.push(`- Warning: ${warning}`);
    }
  }
  return lines.join('\n');
}

function formatProjectCiMarkdown(report: ProjectCiReport): string {
  const lines = [
    '# Decantr CI',
    '',
    `- Mode: **project**`,
    `- Project: \`${report.projectPath ?? '.'}\``,
    `- Status: **${report.status}**`,
    `- Fail on: \`${report.failOn}\``,
    `- Loop: **${report.loop.state}**`,
    `- Evidence tier: **${report.evidenceTier.stage}** / ${report.evidenceTier.confidence.level}`,
    `- Authority: **${report.authority.activeLane}**`,
    `- Brownfield baseline: **${report.baselineGate.applied ? `${report.baselineGate.inheritedFindingIds.length} inherited / ${report.baselineGate.newFindings.length} new` : 'not applied'}**`,
    `- Local law: ${
      report.localLaw.checked
        ? `${report.localLaw.errorCount} error(s), ${report.localLaw.warnCount} warning(s)`
        : 'not accepted yet'
    }`,
    `- Style bridge: ${
      report.styleBridge.checked ? `${report.styleBridge.mappingCount} mapping(s)` : 'not active'
    }`,
    '',
    formatProjectHealthMarkdown(report.health),
    ...(report.baselineGate.applied
      ? [
          '',
          '## Brownfield Baseline Gate',
          '',
          `Inherited findings remain visible but do not determine the CI exit status: **${report.baselineGate.inheritedFindingIds.length}**.`,
          `Findings introduced after the saved baseline: **${report.baselineGate.newFindings.length}**.`,
        ]
      : []),
    '',
    formatLocalLawMarkdown(report.localLaw, report.health),
    '',
    formatStyleBridgeMarkdown(report.styleBridge),
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
    `- Loop: **${report.loop.state}**`,
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
  reportVersion?: CiReportVersion;
}): string {
  const project = input.projectPath ? ` --project ${input.projectPath}` : '';
  const workspace = input.workspace ? ' --workspace' : '';
  if (input.reportVersion === 'v3') {
    return `#!/usr/bin/env bash
set -euo pipefail

# Install dependencies with your repository's authoritative package manager first.
${input.command} ci${project}${workspace} --report-version v3 --fail-on ${input.failOn} --json --output .decantr/ci/decantr-ci.json --markdown-output .decantr/ci/decantr-ci.md
`;
  }
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
  reportVersion?: CiReportVersion;
}): string {
  const slug = projectSlug(input.projectPath);
  const jsonPath = input.workspace ? '.decantr/ci/workspace.json' : `.decantr/ci/${slug}.json`;
  const markdownPath = input.workspace ? '.decantr/ci/workspace.md' : `.decantr/ci/${slug}.md`;
  const project = input.projectPath ? ` --project ${input.projectPath}` : '';
  const workspace = input.workspace ? ' --workspace' : '';

  if (input.reportVersion === 'v3') {
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
        with:
          fetch-depth: 0

      - name: Resolve Decantr change base
        id: decantr-base
        shell: bash
        env:
          PR_BASE_SHA: \${{ github.event.pull_request.base.sha }}
          PUSH_BASE_SHA: \${{ github.event.before }}
          DEFAULT_BRANCH: \${{ github.event.repository.default_branch }}
        run: |
          base_ref="\${PR_BASE_SHA:-\${PUSH_BASE_SHA:-}}"
          if [[ -z "$base_ref" || "$base_ref" =~ ^0+$ ]]; then
            base_ref="origin/\${DEFAULT_BRANCH:-main}"
          fi
          echo "ref=$base_ref" >> "$GITHUB_OUTPUT"

      - uses: actions/setup-node@v6
        with:
          node-version: '22'

      - name: Install dependencies
        shell: bash
        run: |
          ${installCommand(input.packageManager).replace(/\n/g, '\n          ')}

      - name: Run Decantr CI
        shell: bash
        run: ${input.command} ci${project}${workspace} --since "\${{ steps.decantr-base.outputs.ref }}" --report-version v3 --fail-on ${input.failOn} --json --output ${jsonPath} --markdown-output ${markdownPath}

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
  if (options.project && !existsSync(workspaceInfo.appRoot)) {
    throw new Error(`Project path does not exist: ${options.project}`);
  }
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
        reportVersion: options.reportVersion,
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
      reportVersion: options.reportVersion,
    }),
  );
  console.log(`${GREEN}Created Decantr CI workflow:${RESET} ${path}`);
  console.log(
    `${DIM}Command: ${command} ci${projectPath ? ` --project ${projectPath}` : ''}${options.workspace ? ' --workspace' : ''}${options.reportVersion === 'v3' ? ' --report-version v3' : ''} --fail-on ${failOn}${RESET}`,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function sha256(value: string | Buffer): string {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function hashCanonicalJson(value: unknown): string {
  return sha256(canonicalJsonStringify(value));
}

function hashFile(path: string): string | null {
  if (!existsSync(path)) return null;
  try {
    return sha256(readFileSync(path));
  } catch {
    return null;
  }
}

function normalizeProjectFile(
  projectRoot: string,
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const normalized = (isAbsolute(value) ? relative(projectRoot, value) : value)
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');
  if (!normalized || normalized === '..' || normalized.startsWith('../')) return null;
  return normalized;
}

function parseFindingLocation(value: unknown): GovernanceFindingLocationV1 | null {
  if (!isRecord(value) || !Number.isInteger(value.line) || Number(value.line) < 1) return null;
  for (const key of ['column', 'endLine', 'endColumn'] as const) {
    const coordinate = value[key];
    if (coordinate !== undefined && (!Number.isInteger(coordinate) || Number(coordinate) < 1)) {
      return null;
    }
  }
  return {
    line: Number(value.line),
    ...(value.column === undefined ? {} : { column: Number(value.column) }),
    ...(value.endLine === undefined ? {} : { endLine: Number(value.endLine) }),
    ...(value.endColumn === undefined ? {} : { endColumn: Number(value.endColumn) }),
  };
}

function governanceAuthorityLane(
  value: string | undefined,
): GovernanceFindingOccurrenceInputV1['authorityLane'] {
  if (
    value === 'production-source' ||
    value === 'local-law' ||
    value === 'style-bridge' ||
    value === 'essence-contract'
  ) {
    return value;
  }
  return value === 'registry-guidance' || value === 'official-guidance'
    ? 'official-guidance'
    : 'unknown';
}

function findingRepairTarget(finding: ProjectHealthFinding): string | null {
  const actionTarget = finding.repairPlan?.actions.find(
    (action) => typeof action.target === 'string' && action.target.length > 0,
  )?.target;
  if (actionTarget) return actionTarget;
  for (const key of ['target', 'file', 'path']) {
    const value = finding.repair?.payload?.[key];
    if (typeof value === 'string' && value) return value;
  }
  return finding.file ?? null;
}

function healthFindingOccurrence(
  projectRoot: string,
  finding: ProjectHealthFinding,
): GovernanceFindingOccurrenceInputV1 {
  const record = finding as ProjectHealthFinding & { location?: unknown; route?: unknown };
  const location = parseFindingLocation(record.location);
  const file = normalizeProjectFile(projectRoot, finding.file);
  const route =
    typeof record.route === 'string'
      ? record.route
      : typeof finding.graph?.route === 'string'
        ? finding.graph.route
        : null;
  return {
    code: finding.code?.trim() || finding.id,
    ruleId: finding.rule ?? '',
    source: finding.source,
    category: finding.category,
    severity: finding.severity,
    message: finding.message,
    authorityLane: governanceAuthorityLane(finding.authorityLane),
    graphAnchor: finding.graph ?? null,
    repairId: finding.repair?.id ?? null,
    repairTarget: normalizeProjectFile(projectRoot, findingRepairTarget(finding)),
    annotation: {
      path: file,
      startLine: location?.line ?? null,
      startColumn: location?.column ?? null,
      endLine: location?.endLine ?? null,
      endColumn: location?.endColumn ?? null,
    },
    file,
    route,
    target: finding.target ?? null,
    location,
  };
}

function nullableString(
  record: Record<string, unknown>,
  key: string,
): { valid: boolean; value: string | null } {
  if (!(key in record)) return { valid: false, value: null };
  const value = record[key];
  return value === null || typeof value === 'string'
    ? { valid: true, value }
    : { valid: false, value: null };
}

function baselineFindingOccurrence(
  projectRoot: string,
  value: unknown,
  index: number,
  limitations: string[],
): { occurrence: GovernanceFindingOccurrenceInputV1; complete: boolean } | null {
  if (!isRecord(value)) {
    limitations.push(`Baseline v2 finding ${index} is not an object.`);
    return null;
  }
  const code = typeof value.code === 'string' && value.code.trim() ? value.code : null;
  const source = typeof value.source === 'string' && value.source.trim() ? value.source : null;
  const category =
    typeof value.category === 'string' && value.category.trim() ? value.category : null;
  const message = typeof value.message === 'string' && value.message.trim() ? value.message : null;
  const severity =
    value.severity === 'error' || value.severity === 'warn' || value.severity === 'info'
      ? value.severity
      : null;
  const rule = nullableString(value, 'rule');
  const file = nullableString(value, 'file');
  const route = nullableString(value, 'route');
  const target = nullableString(value, 'target');
  const repairTarget = nullableString(value, 'repairTarget');
  const locationValid = value.location === null || isRecord(value.location);
  const location = value.location === null ? null : parseFindingLocation(value.location);
  if (
    !code ||
    !source ||
    !category ||
    !message ||
    !severity ||
    !rule.valid ||
    !file.valid ||
    !route.valid ||
    !target.valid ||
    !repairTarget.valid ||
    !locationValid ||
    (value.location !== null && !location)
  ) {
    limitations.push(`Baseline v2 finding ${index} has incomplete occurrence evidence.`);
    return null;
  }
  const normalizedFile = normalizeProjectFile(projectRoot, file.value);
  const annotationValue = value.annotation;
  const annotationPath = isRecord(annotationValue)
    ? nullableString(annotationValue, 'path')
    : { valid: false, value: null };
  const coordinates = isRecord(annotationValue)
    ? (['startLine', 'startColumn', 'endLine', 'endColumn'] as const).map(
        (key) => annotationValue[key],
      )
    : [];
  const annotationComplete =
    annotationPath.valid &&
    coordinates.length === 4 &&
    coordinates.every((coordinate) => coordinate === null || Number.isInteger(coordinate));
  const repair =
    isRecord(value.repair) && typeof value.repair.id === 'string' ? value.repair : null;
  const occurrence: GovernanceFindingOccurrenceInputV1 = {
    code,
    ruleId: rule.value ?? '',
    source,
    category,
    severity,
    message,
    authorityLane: governanceAuthorityLane(
      typeof value.authorityLane === 'string' ? value.authorityLane : undefined,
    ),
    graphAnchor: isRecord(value.graph) ? (value.graph as unknown as VerificationGraphAnchor) : null,
    repairId: repair?.id ?? null,
    repairTarget: normalizeProjectFile(projectRoot, repairTarget.value),
    annotation: annotationComplete
      ? {
          path: normalizeProjectFile(projectRoot, annotationPath.value),
          startLine: coordinates[0] as number | null,
          startColumn: coordinates[1] as number | null,
          endLine: coordinates[2] as number | null,
          endColumn: coordinates[3] as number | null,
        }
      : {
          path: normalizedFile,
          startLine: location?.line ?? null,
          startColumn: location?.column ?? null,
          endLine: location?.endLine ?? null,
          endColumn: location?.endColumn ?? null,
        },
    file: normalizedFile,
    route: route.value,
    target: target.value,
    location,
  };
  let complete = annotationComplete;
  const fingerprint = fingerprintFindingOccurrenceV1(occurrence);
  if (value.fingerprint !== fingerprint) {
    limitations.push(`Baseline v2 finding ${index} fingerprint is missing or inconsistent.`);
    complete = false;
  }
  if (value.fingerprintVersion !== GOVERNANCE_FINDING_FINGERPRINT_VERSION) {
    limitations.push(`Baseline v2 finding ${index} uses an unsupported fingerprint version.`);
    complete = false;
  }
  return { occurrence, complete };
}

function missingGovernanceBaseline(limitation: string): GovernanceDebtBaselineV1 {
  return {
    identity: null,
    hash: null,
    projectIdentity: null,
    capturedAt: null,
    completeness: 'incomplete',
    freshness: 'unknown',
    compatibility: 'unknown',
    findings: [],
    limitations: [limitation],
  };
}

function readGovernanceBaseline(
  projectRoot: string,
  projectIdentity: string,
): GovernanceDebtBaselineV1 {
  const path = join(projectRoot, '.decantr', 'health-baseline.json');
  if (!existsSync(path)) return missingGovernanceBaseline('Health baseline v2 is missing.');

  let raw: string;
  try {
    raw = readFileSync(path, 'utf-8');
  } catch {
    return missingGovernanceBaseline('Health baseline v2 could not be read.');
  }
  const digest = sha256(raw);
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return {
      ...missingGovernanceBaseline('Health baseline v2 is not valid JSON.'),
      identity: `health-baseline:v2:${digest.slice('sha256:'.length)}`,
      hash: digest,
      compatibility: 'incompatible',
    };
  }
  if (isRecord(value) && (value.version === undefined || value.version === 1)) {
    return {
      ...missingGovernanceBaseline(
        'Legacy health baseline v1 is recognized for 3.8 compatibility but lacks project identity and occurrence evidence required for governance-delta proof. Save a new v2 baseline.',
      ),
      identity: `health-baseline:v1:${digest.slice('sha256:'.length)}`,
      hash: digest,
      capturedAt: typeof value.generatedAt === 'string' ? value.generatedAt : null,
      compatibility: 'unknown',
    };
  }
  if (!isRecord(value) || value.version !== 2) {
    return {
      ...missingGovernanceBaseline(
        isRecord(value)
          ? `Unsupported health baseline version: ${String(value.version)}.`
          : 'Health baseline v2 is not an object.',
      ),
      identity: `health-baseline:v2:${digest.slice('sha256:'.length)}`,
      hash: digest,
      compatibility: 'incompatible',
    };
  }

  const limitations: string[] = [];
  const declaredIdentity = value.projectIdentity;
  const baselineProjectIdentity =
    typeof declaredIdentity === 'string' && declaredIdentity ? declaredIdentity : null;
  const compatibility = baselineProjectIdentity === projectIdentity ? 'compatible' : 'incompatible';
  if (compatibility === 'incompatible') {
    limitations.push(
      baselineProjectIdentity
        ? 'Health baseline v2 belongs to a different project identity.'
        : 'Health baseline v2 project identity is missing.',
    );
  }
  let complete =
    typeof value.generatedAt === 'string' &&
    (value.status === 'healthy' || value.status === 'warning' || value.status === 'error') &&
    typeof value.score === 'number' &&
    Array.isArray(value.routes) &&
    value.routes.every((route) => typeof route === 'string') &&
    isRecord(value.packs) &&
    Array.isArray(value.screenshots) &&
    typeof value.changedFilesCommand === 'string' &&
    Array.isArray(value.findings);
  if (!complete)
    limitations.push('Health baseline v2 is missing required private baseline fields.');
  const findings = (Array.isArray(value.findings) ? value.findings : [])
    .map((finding, index) => {
      const parsed = baselineFindingOccurrence(projectRoot, finding, index, limitations);
      if (!parsed?.complete) complete = false;
      return parsed?.occurrence ?? null;
    })
    .filter((finding): finding is GovernanceFindingOccurrenceInputV1 => Boolean(finding));

  return {
    identity: `health-baseline:v2:${digest.slice('sha256:'.length)}`,
    hash: digest,
    projectIdentity: baselineProjectIdentity,
    capturedAt: typeof value.generatedAt === 'string' ? value.generatedAt : null,
    completeness: complete && compatibility === 'compatible' ? 'complete' : 'incomplete',
    freshness: complete && compatibility === 'compatible' ? 'fresh' : 'stale',
    compatibility,
    findings,
    limitations: [...new Set(limitations)].sort(),
  };
}

function gitOutput(root: string, args: string[]): string {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function outputPaths(output: string): string[] {
  return output
    .split(/\r?\n/)
    .map((path) => path.trim().replace(/\\/g, '/').replace(/^\.\//, ''))
    .filter(Boolean);
}

function projectScopedPaths(paths: string[], selectedAppRoot: string): string[] {
  const prefix = selectedAppRoot === '.' ? '' : `${selectedAppRoot.replace(/\/$/, '')}/`;
  return [...new Set(paths)]
    .filter((path) => !prefix || path.startsWith(prefix))
    .map((path) => (prefix ? path.slice(prefix.length) : path))
    .filter(Boolean)
    .sort();
}

interface GitScopeEvidence {
  comparisonScope: GovernanceComparisonScopeV1;
  identity: string | null;
  hash: string | null;
  baseRef: string | null;
  headRef: string | null;
  mergeBase: string | null;
  completeness: 'complete' | 'incomplete';
  changedFiles: string[];
  limitations: string[];
}

function collectGitScope(
  workspaceRoot: string,
  selectedAppRoot: string,
  since: string | undefined,
): GitScopeEvidence {
  try {
    const head = gitOutput(workspaceRoot, ['rev-parse', '--verify', 'HEAD^{commit}']);
    if (since) {
      const base = gitOutput(workspaceRoot, ['rev-parse', '--verify', `${since}^{commit}`]);
      const mergeBase = gitOutput(workspaceRoot, ['merge-base', base, head]);
      const changedFiles = projectScopedPaths(
        outputPaths(gitOutput(workspaceRoot, ['diff', '--name-only', mergeBase, head, '--'])),
        selectedAppRoot,
      );
      const identity = `${mergeBase}..${head}`;
      return {
        comparisonScope: { kind: 'commit_range', identity },
        identity: `git:commit-range:${identity}`,
        hash: hashCanonicalJson({ base, changedFiles, head, mergeBase }),
        baseRef: since,
        headRef: 'HEAD',
        mergeBase,
        completeness: 'complete',
        changedFiles,
        limitations: [],
      };
    }

    const tracked = outputPaths(gitOutput(workspaceRoot, ['diff', '--name-only', 'HEAD', '--']));
    const untracked = outputPaths(
      gitOutput(workspaceRoot, ['ls-files', '--others', '--exclude-standard']),
    );
    const changedFiles = projectScopedPaths([...tracked, ...untracked], selectedAppRoot);
    const fileStates = changedFiles.map((path) => ({
      path,
      hash: hashFile(join(workspaceRoot, selectedAppRoot === '.' ? path : selectedAppRoot, path)),
    }));
    const identity = `working-tree:${head}`;
    return {
      comparisonScope: { kind: 'working_tree', identity },
      identity: `git:${identity}`,
      hash: hashCanonicalJson({ changedFiles: fileStates, head }),
      baseRef: 'HEAD',
      headRef: 'WORKTREE',
      mergeBase: head,
      completeness: 'complete',
      changedFiles,
      limitations: [],
    };
  } catch (error) {
    const detail = (error as Error).message.split(/\r?\n/)[0] || 'unknown Git error';
    return {
      comparisonScope: { kind: since ? 'commit_range' : 'unknown', identity: null },
      identity: null,
      hash: null,
      baseRef: since ?? null,
      headRef: 'HEAD',
      mergeBase: null,
      completeness: 'incomplete',
      changedFiles: [],
      limitations: [`Git change base could not be resolved: ${detail}`],
    };
  }
}

function readGraphSnapshot(projectRoot: string): GraphSnapshot | null {
  try {
    const value = JSON.parse(
      readFileSync(join(projectRoot, '.decantr', 'graph', 'graph.snapshot.json'), 'utf-8'),
    ) as GraphSnapshot;
    return Array.isArray(value.nodes) && Array.isArray(value.edges) ? value : null;
  } catch {
    return null;
  }
}

function changedRoutePaths(projectRoot: string, changedFiles: string[]): string[] {
  if (changedFiles.length === 0) return [];
  const changed = new Set(changedFiles.map((path) => path.replace(/\\/g, '/')));
  try {
    const truth = createProjectAdoptionTruthV1(projectRoot);
    const routeFact = truth.facts.find((fact) => fact.id === 'project.routes');
    return (
      routeFact?.observation.provenance
        .filter((entry) => entry.kind === 'source' && entry.path)
        .filter((entry) => {
          const path = normalizeProjectFile(projectRoot, entry.path);
          return Boolean(
            path && [...changed].some((file) => path === file || path.endsWith(`/${file}`)),
          );
        })
        .map((entry) => entry.detail.match(/Taskable (\S+) route/)?.[1] ?? '')
        .filter(Boolean)
        .sort() ?? []
    );
  } catch {
    return [];
  }
}

function createGitChangeBase(
  projectRoot: string,
  git: GitScopeEvidence,
): GovernanceGitChangeBaseV1 {
  const graph = readGraphSnapshot(projectRoot);
  let unresolvedFiles = [...git.changedFiles];
  let impactedNodeIds: string[] = [];
  try {
    const impact = buildChangedFileGraphImpact(graph, git.changedFiles, { limit: 500 });
    unresolvedFiles = impact.unresolvedFiles;
    impactedNodeIds = [...new Set(impact.context?.nodes.map((node) => node.id) ?? [])].sort();
  } catch {
    // Malformed graph evidence leaves every changed file unresolved.
  }
  return {
    identity: git.identity,
    hash: git.hash,
    baseRef: git.baseRef,
    headRef: git.headRef,
    mergeBase: git.mergeBase,
    completeness:
      git.completeness === 'complete' && unresolvedFiles.length === 0 ? 'complete' : 'incomplete',
    changedFiles: git.changedFiles,
    changedRoutes: changedRoutePaths(projectRoot, git.changedFiles),
    impactedNodeIds,
    unresolvedFiles,
    limitations: [
      ...git.limitations,
      ...(unresolvedFiles.length > 0
        ? ['Some Git-changed files are not represented by the current typed graph.']
        : []),
    ],
  };
}

function artifactIdentity(
  path: string,
  identity: string,
): { identity: string | null; hash: string | null } {
  const hash = hashFile(path);
  return { identity: hash ? identity : null, hash };
}

function createCurrentGovernanceState(
  projectRoot: string,
  projectIdentity: string,
  health: ProjectHealthReport,
): GovernanceCurrentStateV1 {
  const { generatedAt: _generatedAt, ...semanticHealth } = health;
  const healthHash = hashCanonicalJson(semanticHealth);
  const graphComplete = Boolean(
    health.graph.ready && health.graph.snapshotId && health.graph.sourceHash,
  );
  const graphFreshness =
    health.graph.current === true ? 'fresh' : health.graph.current === false ? 'stale' : 'unknown';
  return {
    health: { identity: `project-health:v2:${projectIdentity}`, hash: healthHash },
    graph: {
      identity: health.graph.snapshotId,
      sourceHash: health.graph.sourceHash,
      completeness: graphComplete ? 'complete' : 'incomplete',
      freshness: graphFreshness,
      limitations: graphComplete ? [] : ['Current typed graph evidence is missing or incomplete.'],
    },
    evidence: {
      identity: `project-health-evidence:v2:${projectIdentity}`,
      hash: healthHash,
      completeness: 'complete',
      freshness: 'fresh',
      limitations: [],
    },
    contract: artifactIdentity(
      join(projectRoot, 'decantr.essence.json'),
      `essence:v4:${projectIdentity}`,
    ),
    content: artifactIdentity(
      join(projectRoot, '.decantr', 'context', 'pack-manifest.json'),
      `pack-manifest:v1:${projectIdentity}`,
    ),
    source: {
      identity: health.graph.sourceHash ? `project-source:v1:${projectIdentity}` : null,
      hash: health.graph.sourceHash,
    },
  };
}

async function createProjectCiReportV3(
  workspaceRoot: string,
  projectRoot: string,
  projectPath: string | null,
  options: CiOptions,
): Promise<DecantrCiProjectReportV3> {
  const generatedAt = new Date().toISOString();
  const failOn = options.failOn ?? 'error';
  const health = await createProjectHealthReport(projectRoot);
  const baselineGate = evaluateHealthBaselineGate(projectRoot, health);
  const localLaw = summarizeLocalLaw(projectRoot);
  const styleBridge = summarizeStyleBridge(projectRoot);
  const adoptionTruth = createProjectAdoptionTruthV1(projectRoot, { generatedAt });
  const discovery = discoverProject(projectRoot);
  const discoveryReadiness = evaluateDiscoveryReadiness(discovery);
  const projectIdentity = createStableProjectIdentityV1(projectRoot);
  const selectedAppRoot = adoptionTruth.project.selectedAppRoot;
  const git = collectGitScope(workspaceRoot, selectedAppRoot, options.since);
  const current = createCurrentGovernanceState(projectRoot, projectIdentity, health);
  const enforceDiscoveryProof = discoveryReadiness.adoptionBaseline !== 'ready';
  if (enforceDiscoveryProof) {
    current.graph.completeness = 'incomplete';
    current.graph.limitations = [
      ...new Set([
        ...current.graph.limitations,
        ...discoveryReadiness.reasons.map((reason) => `Discovery sufficiency: ${reason}`),
      ]),
    ];
  }
  const governanceDelta = createGovernanceDeltaV1({
    generatedAt,
    project: {
      identity: projectIdentity,
      workspaceRoot: adoptionTruth.project.workspaceRoot,
      selectedAppRoot,
    },
    comparisonScope: git.comparisonScope,
    changeBase: createGitChangeBase(projectRoot, git),
    debtBaseline: readGovernanceBaseline(projectRoot, projectIdentity),
    current,
    currentFindings: health.findings.map((finding) =>
      healthFindingOccurrence(projectRoot, finding),
    ),
    failOn,
    limitations: enforceDiscoveryProof
      ? discoveryReadiness.reasons.map((reason) => `Discovery sufficiency: ${reason}`)
      : [],
    nextAction:
      'Review new and unclassified findings, restore complete proof evidence, then rerun Decantr CI v3.',
  });

  return createDecantrCiProjectReportV3({
    generatedAt,
    projectPath,
    failOn,
    status: projectCiStatus(health, baselineGate, localLaw, styleBridge),
    loop: health.loop,
    authority: health.authority,
    evidenceTier: health.evidenceTier,
    health,
    baselineGate,
    localLaw,
    styleBridge,
    adoptionTruth,
    governanceDelta,
  });
}

function governanceGateFails(report: DecantrCiProjectReportV3, failOn: HealthFailOn): boolean {
  return failOn !== 'none' && report.governanceDelta.gate.result !== 'pass';
}

function formatProjectCiV3Markdown(report: DecantrCiProjectReportV3): string {
  const health = report.health as ProjectHealthReport;
  const v2Evidence = formatProjectCiMarkdown({ ...report, health });
  return `${v2Evidence.trimEnd()}\n\n## Governance Delta\n\n- Result: **${report.governanceDelta.gate.result}**\n- New: **${report.governanceDelta.summary.newCount}**\n- Inherited: **${report.governanceDelta.summary.inheritedCount}**\n- Unclassified: **${report.governanceDelta.summary.unclassifiedCount}**\n`;
}

function formatWorkspaceCiV3Markdown(report: DecantrCiWorkspaceReportV3): string {
  const v2Evidence = formatWorkspaceCiMarkdown(report);
  return `${v2Evidence.trimEnd()}\n\n## Aggregate Governance Gate\n\n- Result: **${report.gate.result}**\n- Passing: **${report.gate.passingProjectCount}**\n- Failing: **${report.gate.failingProjectCount}**\n- Not proven: **${report.gate.notProvenProjectCount}**\n`;
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
    loop: workspace.loop,
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

async function runWorkspaceCiV3(root: string, options: CiOptions): Promise<number> {
  const failOn = options.failOn ?? 'error';
  const workspace = await createWorkspaceHealthReport(root, {
    ci: true,
    failOn,
    changedOnly: options.changed,
    since: options.since,
  });
  const selected = [...workspace.projects].sort((left, right) =>
    left.path.localeCompare(right.path),
  );
  const projects = await Promise.all(
    selected.map(async (project) => {
      if (project.status === 'failed') {
        throw new Error(
          `Decantr CI v3 could not create project proof for ${project.path}: ${project.error ?? 'health failed'}`,
        );
      }
      const projectRoot = project.path === '.' ? resolve(root) : resolve(root, project.path);
      return createProjectCiReportV3(resolve(root), projectRoot, project.path, options);
    }),
  );
  const report = createDecantrCiWorkspaceReportV3({
    generatedAt: new Date().toISOString(),
    failOn,
    status: workspaceStatus(workspace),
    loop: workspace.loop,
    workspace,
    projects,
  });
  const json = `${JSON.stringify(report, null, 2)}\n`;
  const markdown = formatWorkspaceCiV3Markdown(report);

  if (options.output) writeOutput(root, options.output, json);
  if (options.markdownOutput) writeOutput(root, options.markdownOutput, markdown);

  if (!options.output && !options.markdownOutput) {
    if (options.json) process.stdout.write(json);
    else if (options.markdown) process.stdout.write(markdown);
    else {
      process.stdout.write(formatWorkspaceHealthText(workspace));
      process.stdout.write(
        `Governance aggregate: ${report.gate.result} (${report.gate.passingProjectCount} pass, ${report.gate.failingProjectCount} fail, ${report.gate.notProvenProjectCount} not proven)\n`,
      );
    }
  }

  const governanceFails = failOn !== 'none' && report.gate.result !== 'pass';
  return shouldFailWorkspaceHealth(workspace, failOn) || governanceFails ? 1 : 0;
}

async function runProjectCi(root: string, options: CiOptions): Promise<number> {
  const workspaceInfo = resolveWorkspaceInfo(root, options.project);
  if (options.project && !existsSync(workspaceInfo.appRoot)) {
    console.error(`${RED}Project path does not exist: ${options.project}${RESET}`);
    return 1;
  }
  if (workspaceInfo.requiresProjectSelection) {
    const candidate = workspaceInfo.appCandidates[0] ?? 'apps/web';
    console.error(`${RED}Decantr CI needs an app path in this monorepo.${RESET}`);
    console.error(`${DIM}Run: decantr ci --project ${candidate}${RESET}`);
    return 1;
  }

  const failOn = options.failOn ?? 'error';
  const health = await createProjectHealthReport(workspaceInfo.appRoot);
  const baselineGate = evaluateHealthBaselineGate(workspaceInfo.appRoot, health);
  const localLaw = summarizeLocalLaw(workspaceInfo.appRoot);
  const styleBridge = summarizeStyleBridge(workspaceInfo.appRoot);
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
    status: projectCiStatus(health, baselineGate, localLaw, styleBridge),
    loop: health.loop,
    authority: health.authority,
    evidenceTier: health.evidenceTier,
    health,
    baselineGate,
    localLaw,
    styleBridge,
  };
  const json = `${JSON.stringify(report, null, 2)}\n`;
  const markdown = formatProjectCiMarkdown(report);

  if (options.output) writeOutput(root, options.output, json);
  if (options.markdownOutput) writeOutput(root, options.markdownOutput, markdown);

  if (!options.output && !options.markdownOutput) {
    if (options.json) process.stdout.write(json);
    else if (options.markdown) process.stdout.write(markdown);
    else
      process.stdout.write(
        `${formatProjectHealthText(health)}${formatBaselineGateText(baselineGate)}${formatLocalLawText(localLaw, health)}${formatStyleBridgeText(styleBridge)}`,
      );
  }

  const healthFails = baselineGate.applied
    ? shouldFailHealthBaselineGate(baselineGate, failOn)
    : shouldFailHealth(health, failOn);
  return healthFails || localLawFails(localLaw, failOn) || styleBridgeFails(styleBridge, failOn)
    ? 1
    : 0;
}

async function runProjectCiV3(root: string, options: CiOptions): Promise<number> {
  const workspaceInfo = resolveWorkspaceInfo(root, options.project);
  if (options.project && !existsSync(workspaceInfo.appRoot)) {
    console.error(`${RED}Project path does not exist: ${options.project}${RESET}`);
    return 1;
  }
  if (workspaceInfo.requiresProjectSelection) {
    const candidate = workspaceInfo.appCandidates[0] ?? 'apps/web';
    console.error(`${RED}Decantr CI needs an app path in this monorepo.${RESET}`);
    console.error(`${DIM}Run: decantr ci --project ${candidate}${RESET}`);
    return 1;
  }

  const projectPath =
    workspaceInfo.appRoot === workspaceInfo.workspaceRoot
      ? null
      : relative(workspaceInfo.workspaceRoot, workspaceInfo.appRoot).replace(/\\/g, '/');
  const report = await createProjectCiReportV3(
    workspaceInfo.workspaceRoot,
    workspaceInfo.appRoot,
    projectPath,
    options,
  );
  const health = report.health as ProjectHealthReport;
  const json = `${JSON.stringify(report, null, 2)}\n`;
  const markdown = formatProjectCiV3Markdown(report);

  if (options.output) writeOutput(root, options.output, json);
  if (options.markdownOutput) writeOutput(root, options.markdownOutput, markdown);

  if (!options.output && !options.markdownOutput) {
    if (options.json) process.stdout.write(json);
    else if (options.markdown) process.stdout.write(markdown);
    else {
      process.stdout.write(
        `${formatProjectHealthText(health)}${formatBaselineGateText(report.baselineGate)}${formatLocalLawText(report.localLaw, health)}${formatStyleBridgeText(report.styleBridge)}`,
      );
      process.stdout.write(
        `Governance delta: ${report.governanceDelta.gate.result} (${report.governanceDelta.summary.newCount} new, ${report.governanceDelta.summary.inheritedCount} inherited, ${report.governanceDelta.summary.unclassifiedCount} unclassified)\n`,
      );
    }
  }

  const healthFails = report.baselineGate.applied
    ? shouldFailHealthBaselineGate(report.baselineGate, report.failOn)
    : shouldFailHealth(health, report.failOn);
  return healthFails ||
    localLawFails(report.localLaw, report.failOn) ||
    styleBridgeFails(report.styleBridge, report.failOn) ||
    governanceGateFails(report, report.failOn)
    ? 1
    : 0;
}

export function cmdCiHelp(): void {
  console.log(`
${BOLD}decantr ci${RESET} — Non-mutating Decantr gate for CI and required validation scripts

${BOLD}Usage:${RESET}
  decantr ci [--project <path>] [--report-version v2|v3] [--fail-on error|warn|none] [--json] [--output <file>]
  decantr ci --workspace [--changed --since origin/main] [--report-version v2|v3]
  decantr ci init [--project <path>] [--workspace] [--provider github|generic] [--report-version v2|v3] [--force]

${BOLD}Examples:${RESET}
  decantr ci --project apps/web
  decantr ci --workspace --changed --since origin/main
  decantr ci --project apps/web --since origin/main --report-version v3 --json
  decantr ci --project apps/web --json --output .decantr/ci/apps-web.json --markdown-output .decantr/ci/apps-web.md
  decantr ci init --project apps/web
  decantr ci init --provider generic --project apps/web
`);
}

export async function cmdCi(args: string[] = ['ci'], root: string = process.cwd()): Promise<void> {
  try {
    const options = parseCiArgs(args);
    if (options.init) {
      writeCiInit(root, options);
      return;
    }
    const v3 = options.reportVersion === 'v3';
    const exitCode = options.workspace
      ? v3
        ? await runWorkspaceCiV3(root, options)
        : await runWorkspaceCi(root, options)
      : v3
        ? await runProjectCiV3(root, options)
        : await runProjectCi(root, options);
    if (exitCode !== 0) process.exitCode = exitCode;
  } catch (error) {
    console.error(`${RED}${(error as Error).message}${RESET}`);
    process.exitCode = 1;
  }
}
