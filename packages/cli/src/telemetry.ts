import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export interface GuardMetrics {
  timestamp: string;
  cli_version: string;
  essence_version: string;
  guard_mode: string;
  violations: {
    dna: number;
    blueprint: number;
    by_rule: Record<string, number>;
  };
  resolution_rate: number;
  sections_count: number;
  routes_count: number;
  theme: string;
}

const TELEMETRY_ENDPOINT = 'https://api.decantr.ai/v1/telemetry/guard';
const TELEMETRY_TIMEOUT_MS = 3000;

const DNA_RULES = new Set(['theme', 'style', 'density', 'accessibility', 'theme-mode']);

export async function sendGuardMetrics(metrics: GuardMetrics): Promise<void> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TELEMETRY_TIMEOUT_MS);
    await fetch(TELEMETRY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch {
    // Fire-and-forget: silently ignore all errors
  }
}

export function isOptedIn(projectRoot: string): boolean {
  const projectJsonPath = join(projectRoot, '.decantr', 'project.json');
  if (!existsSync(projectJsonPath)) return false;
  try {
    const data = JSON.parse(readFileSync(projectJsonPath, 'utf-8'));
    return data.telemetry === true;
  } catch {
    return false;
  }
}

export function optIn(projectRoot: string): void {
  const projectJsonPath = join(projectRoot, '.decantr', 'project.json');
  let data: Record<string, unknown> = {};
  if (existsSync(projectJsonPath)) {
    try {
      data = JSON.parse(readFileSync(projectJsonPath, 'utf-8'));
    } catch {
      // Start fresh if corrupt
    }
  }
  data.telemetry = true;
  writeFileSync(projectJsonPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

export function optOut(projectRoot: string): void {
  const projectJsonPath = join(projectRoot, '.decantr', 'project.json');
  let data: Record<string, unknown> = {};
  if (existsSync(projectJsonPath)) {
    try {
      data = JSON.parse(readFileSync(projectJsonPath, 'utf-8'));
    } catch {
      return;
    }
  }
  data.telemetry = false;
  writeFileSync(projectJsonPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

export function collectMetrics(
  essence: Record<string, unknown>,
  issues: Array<{ type: string; rule: string }>,
): GuardMetrics {
  const dna = (essence.dna ?? {}) as Record<string, unknown>;
  const blueprint = (essence.blueprint ?? {}) as Record<string, unknown>;
  const meta = (essence.meta ?? {}) as Record<string, unknown>;
  const guard = (meta.guard ?? {}) as Record<string, unknown>;
  const theme = (dna.theme ?? {}) as Record<string, unknown>;
  const sections = (blueprint.sections ?? []) as unknown[];
  const routes = (blueprint.routes ?? {}) as Record<string, unknown>;

  const byRule: Record<string, number> = {};
  let dnaCount = 0;
  let blueprintCount = 0;

  for (const issue of issues) {
    byRule[issue.rule] = (byRule[issue.rule] ?? 0) + 1;
    if (DNA_RULES.has(issue.rule)) {
      dnaCount++;
    } else {
      blueprintCount++;
    }
  }

  return {
    timestamp: new Date().toISOString(),
    cli_version: '1.5.1',
    essence_version: (essence.version as string) ?? 'unknown',
    guard_mode: (guard.mode as string) ?? 'unknown',
    violations: {
      dna: dnaCount,
      blueprint: blueprintCount,
      by_rule: byRule,
    },
    resolution_rate: 0,
    sections_count: sections.length,
    routes_count: Object.keys(routes).length,
    theme: (theme.id as string) ?? 'unknown',
  };
}
