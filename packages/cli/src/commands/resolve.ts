import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import type { AuthorityConflict, AuthorityResolutionAction } from '@decantr/verifier';
import { createProjectHealthReport } from './health.js';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

interface ResolveOptions {
  json?: boolean;
  defer?: string;
  markAdvisory?: string;
}

interface DriftLogEntry {
  id: string;
  findingId: string;
  action: 'defer_to_drift_log' | 'mark_advisory';
  status: 'deferred' | 'advisory';
  message: string;
  source: string;
  severity: string;
  recordedAt: string;
}

interface DriftLog {
  version: 1;
  entries: DriftLogEntry[];
}

function driftLogPath(projectRoot: string): string {
  return join(projectRoot, '.decantr', 'drift-log.json');
}

function readDriftLog(projectRoot: string): DriftLog {
  const path = driftLogPath(projectRoot);
  if (!existsSync(path)) return { version: 1, entries: [] };
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf-8')) as Partial<DriftLog>;
    return {
      version: 1,
      entries: Array.isArray(parsed.entries) ? (parsed.entries as DriftLogEntry[]) : [],
    };
  } catch {
    return { version: 1, entries: [] };
  }
}

function writeDriftLog(projectRoot: string, log: DriftLog): void {
  const path = driftLogPath(projectRoot);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(log, null, 2)}\n`, 'utf-8');
}

function actionLabel(action: AuthorityResolutionAction): string {
  return `${action.kind}${action.command ? ` -> ${action.command}` : ''}`;
}

function appendDriftAction(
  projectRoot: string,
  conflict: AuthorityConflict,
  action: DriftLogEntry['action'],
): string {
  const log = readDriftLog(projectRoot);
  const status = action === 'mark_advisory' ? 'advisory' : 'deferred';
  const entry: DriftLogEntry = {
    id: `${action}:${conflict.id}:${Date.now()}`,
    findingId: conflict.id,
    action,
    status,
    message: conflict.message,
    source: conflict.source,
    severity: conflict.severity,
    recordedAt: new Date().toISOString(),
  };
  log.entries = log.entries.filter(
    (candidate) => !(candidate.findingId === conflict.id && candidate.action === action),
  );
  log.entries.push(entry);
  writeDriftLog(projectRoot, log);
  return driftLogPath(projectRoot);
}

export function parseResolveArgs(args: string[]): ResolveOptions {
  const options: ResolveOptions = {};
  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--json') options.json = true;
    else if (arg === '--defer' && args[index + 1]) options.defer = args[++index];
    else if (arg.startsWith('--defer=')) options.defer = arg.split('=')[1];
    else if (arg === '--mark-advisory' && args[index + 1]) options.markAdvisory = args[++index];
    else if (arg.startsWith('--mark-advisory=')) options.markAdvisory = arg.split('=')[1];
  }
  return options;
}

function groupConflicts(conflicts: AuthorityConflict[]): Map<string, AuthorityConflict[]> {
  const grouped = new Map<string, AuthorityConflict[]>();
  for (const conflict of conflicts) {
    const key = conflict.lane;
    grouped.set(key, [...(grouped.get(key) ?? []), conflict]);
  }
  return grouped;
}

export function formatAuthorityResolutionText(
  projectRoot: string,
  conflicts: AuthorityConflict[],
  summary: string,
  stopRule: string,
): string {
  const lines = [
    `${BOLD}Decantr Authority Resolver${RESET}`,
    '',
    `${DIM}${resolve(projectRoot)}${RESET}`,
    `Authority: ${summary}`,
    `Stop rule: ${stopRule}`,
    '',
  ];

  if (conflicts.length === 0) {
    lines.push(`${GREEN}No authority conflicts found.${RESET}`);
    lines.push('');
    lines.push(`Next: ${DIM}Run decantr task <target> "<intent>" before editing.${RESET}`);
    return `${lines.join('\n')}\n`;
  }

  for (const [lane, laneConflicts] of groupConflicts(conflicts)) {
    lines.push(`${BOLD}${lane}:${RESET}`);
    for (const conflict of laneConflicts) {
      const color =
        conflict.status === 'blocking' ? RED : conflict.status === 'repairable' ? YELLOW : DIM;
      lines.push(`  ${color}[${conflict.status}]${RESET} ${conflict.id}: ${conflict.message}`);
      lines.push(
        `    ${DIM}${conflict.source} / ${conflict.category} / ${conflict.severity}${RESET}`,
      );
      for (const action of conflict.recommendedActions.slice(0, 4)) {
        lines.push(`    - ${actionLabel(action)}`);
      }
    }
    lines.push('');
  }

  lines.push(`${BOLD}Read-only by default:${RESET}`);
  lines.push(
    '  Use --defer <finding-id> or --mark-advisory <finding-id> to write only .decantr/drift-log.json.',
  );
  return `${lines.join('\n')}\n`;
}

export async function cmdResolve(
  projectRoot: string = process.cwd(),
  args: string[] = ['resolve'],
): Promise<void> {
  const options = parseResolveArgs(args);
  const report = await createProjectHealthReport(projectRoot);
  const resolution = report.authority;

  if (options.defer || options.markAdvisory) {
    const findingId = options.defer ?? options.markAdvisory;
    const conflict = resolution.conflicts.find((entry) => entry.id === findingId);
    if (!conflict) {
      console.error(`${RED}No authority conflict found for finding: ${findingId}${RESET}`);
      process.exitCode = 1;
      return;
    }
    const path = appendDriftAction(
      projectRoot,
      conflict,
      options.defer ? 'defer_to_drift_log' : 'mark_advisory',
    );
    console.log(`${GREEN}Updated drift log:${RESET} ${path}`);
    return;
  }

  if (options.json) {
    process.stdout.write(`${JSON.stringify(resolution, null, 2)}\n`);
    return;
  }

  process.stdout.write(
    formatAuthorityResolutionText(
      projectRoot,
      resolution.conflicts,
      resolution.summary,
      resolution.stopRule,
    ),
  );
}
