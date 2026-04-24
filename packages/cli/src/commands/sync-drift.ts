import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';

interface DriftEntry {
  id: string;
  timestamp: string;
  rule: string;
  severity: 'error' | 'warning';
  message: string;
  suggestion?: string;
  page?: string;
  resolved?: boolean;
}

/**
 * CLI handler for `decantr sync-drift`.
 * Reads .decantr/drift-log.json and displays unresolved entries.
 * Allows marking entries as resolved.
 */
export async function cmdSyncDrift(projectRoot: string = process.cwd()): Promise<void> {
  const driftLogPath = join(projectRoot, '.decantr', 'drift-log.json');

  if (!existsSync(driftLogPath)) {
    console.log(`${GREEN}No drift log found — no drift recorded.${RESET}`);
    console.log(
      `${DIM}Drift is logged when guard violations are detected during development.${RESET}`,
    );
    return;
  }

  let entries: DriftEntry[];
  try {
    entries = JSON.parse(readFileSync(driftLogPath, 'utf-8'));
  } catch {
    console.error(`${RED}Could not parse drift-log.json${RESET}`);
    process.exitCode = 1;
    return;
  }

  if (!Array.isArray(entries)) {
    console.error(`${RED}drift-log.json is not an array${RESET}`);
    process.exitCode = 1;
    return;
  }

  const unresolved = entries.filter((e) => !e.resolved);
  const resolved = entries.filter((e) => e.resolved);

  if (unresolved.length === 0) {
    console.log(`${GREEN}No unresolved drift entries.${RESET}`);
    if (resolved.length > 0) {
      console.log(`${DIM}${resolved.length} previously resolved entries in the log.${RESET}`);
    }
    return;
  }

  console.log(`\n${BOLD}Unresolved Drift Entries (${unresolved.length})${RESET}\n`);

  for (let i = 0; i < unresolved.length; i++) {
    const entry = unresolved[i];
    const severityColor = entry.severity === 'error' ? RED : YELLOW;
    const icon = entry.severity === 'error' ? 'x' : '!';

    console.log(
      `  ${severityColor}${icon}${RESET} ${BOLD}#${i + 1}${RESET} [${entry.rule}] ${entry.message}`,
    );
    if (entry.page) {
      console.log(`    ${DIM}Page: ${entry.page}${RESET}`);
    }
    if (entry.suggestion) {
      console.log(`    ${CYAN}Suggestion: ${entry.suggestion}${RESET}`);
    }
    console.log(`    ${DIM}${entry.timestamp}${RESET}`);
    console.log('');
  }

  console.log(`${BOLD}Actions:${RESET}`);
  console.log(`  ${CYAN}decantr sync-drift --resolve-all${RESET}   Mark all entries as resolved`);
  console.log(`  ${CYAN}decantr sync-drift --resolve <n>${RESET}   Mark entry #n as resolved`);
  console.log(`  ${CYAN}decantr sync-drift --clear${RESET}         Clear the entire drift log`);
  console.log('');
}

/**
 * Resolve specific drift entries or all entries.
 */
export function resolveDriftEntries(
  projectRoot: string,
  options: { resolveAll?: boolean; resolveIndex?: number; clear?: boolean },
): { success: boolean; error?: string } {
  const driftLogPath = join(projectRoot, '.decantr', 'drift-log.json');

  if (!existsSync(driftLogPath)) {
    return { success: true }; // Nothing to resolve
  }

  if (options.clear) {
    try {
      writeFileSync(driftLogPath, '[]');
      return { success: true };
    } catch (e) {
      return { success: false, error: `Could not clear drift log: ${(e as Error).message}` };
    }
  }

  let entries: DriftEntry[];
  try {
    entries = JSON.parse(readFileSync(driftLogPath, 'utf-8'));
  } catch {
    return { success: false, error: 'Could not parse drift-log.json' };
  }

  if (options.resolveAll) {
    entries = entries.map((e) => ({ ...e, resolved: true }));
  } else if (options.resolveIndex !== undefined) {
    const unresolved = entries.filter((e) => !e.resolved);
    const idx = options.resolveIndex - 1; // 1-indexed from CLI
    if (idx < 0 || idx >= unresolved.length) {
      return { success: false, error: `Invalid entry number: ${options.resolveIndex}` };
    }
    // Find this entry in the original array and mark resolved
    const target = unresolved[idx];
    const originalIdx = entries.indexOf(target);
    if (originalIdx !== -1) {
      entries[originalIdx] = { ...entries[originalIdx], resolved: true };
    }
  }

  try {
    writeFileSync(driftLogPath, JSON.stringify(entries, null, 2));
    return { success: true };
  } catch (e) {
    return { success: false, error: `Could not write drift log: ${(e as Error).message}` };
  }
}
