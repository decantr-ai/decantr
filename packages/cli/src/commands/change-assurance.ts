import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import {
  type ChangeAssuranceFinding,
  type ChangeAssuranceReportV1,
  type ChangeAssuranceSelection,
  verifyUIChanges,
} from '@decantr/verifier';
import type { GitChangeScopeEvidence } from '../git-change-scope.js';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

export type ChangeAssuranceFailOn = 'error' | 'warn' | 'info' | 'none';

export interface ChangeAssuranceCommandOptions {
  json?: boolean;
  markdown?: boolean;
  output?: string;
  ci?: boolean;
  failOn?: ChangeAssuranceFailOn;
  maxFindings?: number;
}

function statusLabel(status: ChangeAssuranceReportV1['status']): string {
  if (status === 'pass') return `${GREEN}PASS${RESET}`;
  if (status === 'attention') return `${YELLOW}ATTENTION${RESET}`;
  return `${RED}NOT PROVEN${RESET}`;
}

function findingLocation(finding: ChangeAssuranceFinding): string {
  const file = finding.occurrence.file ?? 'project';
  const line = finding.occurrence.location?.line;
  return line ? `${file}:${line}` : file;
}

export function formatChangeAssuranceText(report: ChangeAssuranceReportV1): string {
  const lines = [
    `${BOLD}Decantr Change Assurance${RESET}`,
    '',
    `  ${statusLabel(report.status)}  ${report.project.selectedAppRoot}`,
    `  Scope: ${report.comparisonScope.kind.replace('_', ' ')}`,
    `  Change: ${report.summary.changedFileCount} file(s), ${report.summary.uiFileCount} production UI file(s), ${report.summary.ignoredFileCount} non-production file(s) ignored`,
    `  Authority: routes ${report.authority.routeAuthority}/${report.authority.routeCompleteness}; UI readiness ${report.authority.readiness}`,
  ];
  if (report.findings.length > 0) {
    lines.push('', `${BOLD}Consequential findings${RESET}`);
    for (const [index, finding] of report.findings.entries()) {
      lines.push(
        `  ${index + 1}. ${finding.occurrence.code}  ${findingLocation(finding)}`,
        `     ${finding.occurrence.message}`,
        `     Fix: ${finding.suggestedFix}`,
      );
    }
    if (report.summary.truncatedFindingCount > 0) {
      lines.push(
        `  ${DIM}${report.summary.truncatedFindingCount} lower-ranked finding(s) omitted; use --max-findings to inspect more.${RESET}`,
      );
    }
  } else if (report.summary.uiFileCount === 0) {
    lines.push('', `  ${DIM}No production UI changes were detected in this scope.${RESET}`);
  } else {
    lines.push('', `  ${GREEN}No changed-file UI authority violations found.${RESET}`);
  }
  if (report.surfaces.ignoredFiles.length > 0) {
    lines.push(
      '',
      `${BOLD}Excluded from authority${RESET}`,
      ...report.surfaces.ignoredFiles
        .slice(0, 5)
        .map((entry) => `  ${entry.file} (${entry.scope})`),
    );
  }
  if (report.limitations.length > 0) {
    lines.push(
      '',
      `${BOLD}Evidence limits${RESET}`,
      ...report.limitations.slice(0, 5).map((limitation) => `  ${limitation}`),
    );
  }
  lines.push('', `${DIM}Read-only analysis: no application source files were changed.${RESET}`, '');
  return lines.join('\n');
}

export function formatChangeAssuranceMarkdown(report: ChangeAssuranceReportV1): string {
  const lines = [
    '# Decantr Change Assurance',
    '',
    `- Status: **${report.status}**`,
    `- Selected app: \`${report.project.selectedAppRoot}\``,
    `- Scope: \`${report.comparisonScope.kind}\``,
    `- Changed files: **${report.summary.changedFileCount}**`,
    `- Production UI files: **${report.summary.uiFileCount}**`,
    `- Excluded non-production files: **${report.summary.ignoredFileCount}**`,
    `- Route authority: \`${report.authority.routeAuthority}/${report.authority.routeCompleteness}\``,
    '',
  ];
  if (report.findings.length > 0) {
    lines.push('## Consequential Findings', '');
    for (const finding of report.findings) {
      lines.push(
        `### ${finding.occurrence.code}: ${findingLocation(finding)}`,
        '',
        finding.occurrence.message,
        '',
        `**Fix:** ${finding.suggestedFix}`,
        '',
      );
    }
  } else {
    lines.push(
      report.summary.uiFileCount === 0
        ? 'No production UI changes were detected in this scope.'
        : 'No changed-file UI authority violations were found.',
      '',
    );
  }
  if (report.limitations.length > 0) {
    lines.push('## Evidence Limits', '', ...report.limitations.map((item) => `- ${item}`), '');
  }
  lines.push('_Read-only analysis: no application source files were changed._', '');
  return lines.join('\n');
}

function annotationEscape(value: string): string {
  return value.replace(/%/gu, '%25').replace(/\r/gu, '%0D').replace(/\n/gu, '%0A');
}

function githubAnnotation(finding: ChangeAssuranceFinding): string {
  const level = finding.occurrence.severity === 'error' ? 'error' : 'warning';
  const file = finding.occurrence.annotation.path;
  const line = finding.occurrence.annotation.startLine;
  const properties = [
    file ? `file=${annotationEscape(file)}` : null,
    line ? `line=${line}` : null,
    `title=${annotationEscape(`Decantr ${finding.occurrence.code}`)}`,
  ]
    .filter(Boolean)
    .join(',');
  return `::${level} ${properties}::${annotationEscape(finding.occurrence.message)}`;
}

export function formatChangeAssuranceGithubAnnotations(report: ChangeAssuranceReportV1): string[] {
  return report.findings.map(githubAnnotation);
}

function shouldFail(report: ChangeAssuranceReportV1, failOn: ChangeAssuranceFailOn): boolean {
  if (failOn === 'none') return false;
  if (report.status === 'not_proven') return true;
  const rank = { error: 3, warn: 2, info: 1 } as const;
  const threshold = rank[failOn];
  return report.findings.some((finding) => rank[finding.occurrence.severity] >= threshold);
}

export function runChangeAssurance(input: {
  projectRoot: string;
  git: GitChangeScopeEvidence;
  selection: ChangeAssuranceSelection;
  options: ChangeAssuranceCommandOptions;
}): { report: ChangeAssuranceReportV1; exitCode: number } {
  const report = verifyUIChanges({
    projectRoot: input.projectRoot,
    comparisonScope: input.git.comparisonScope,
    changeBase: input.git.changeBase,
    selection: input.selection,
    maxFindings: input.options.maxFindings,
  });
  const json = `${JSON.stringify(report, null, 2)}\n`;
  const markdown = formatChangeAssuranceMarkdown(report);
  const text = formatChangeAssuranceText(report);
  const rendered = input.options.markdown ? markdown : input.options.json ? json : text;

  if (input.options.output) {
    const outputPath = isAbsolute(input.options.output)
      ? input.options.output
      : resolve(input.projectRoot, input.options.output);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, rendered, 'utf-8');
  } else {
    process.stdout.write(rendered);
  }
  if (input.options.ci) {
    for (const annotation of formatChangeAssuranceGithubAnnotations(report)) {
      process.stderr.write(`${annotation}\n`);
    }
  }
  return {
    report,
    exitCode: shouldFail(report, input.options.failOn ?? 'warn') ? 1 : 0,
  };
}
