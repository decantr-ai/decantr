import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { AmbientContextInventory, AmbientContextItem, AmbientContextRole } from './ambient-context.js';

export type DoctrineArea =
  | 'security-data'
  | 'architecture'
  | 'design-system'
  | 'workflow-ci'
  | 'feature-business'
  | 'assistant-specific'
  | 'stale-or-historical'
  | 'unknown';

export interface DoctrineSource {
  path: string;
  type: 'file' | 'directory';
  area: DoctrineArea;
  originalRole: AmbientContextRole;
  precedence: number;
  confidence: number;
  currency: 'current' | 'stale-risk' | 'unsafe-to-cite';
  safeToCite: boolean;
  rationale: string;
}

export interface DoctrineResolution {
  kind: 'conflict' | 'stale-risk';
  issue: string;
  recommendation: string;
  preferredSources: string[];
  confidence: number;
}

export interface DoctrineMap {
  version: 1;
  generatedAt: string;
  precedenceOrder: DoctrineArea[];
  sources: DoctrineSource[];
  summary: Record<DoctrineArea, number>;
  conflicts: string[];
  staleRisks: string[];
  resolutions: DoctrineResolution[];
  guidance: string[];
}

const PRECEDENCE_ORDER: DoctrineArea[] = [
  'security-data',
  'architecture',
  'design-system',
  'workflow-ci',
  'feature-business',
  'assistant-specific',
  'stale-or-historical',
  'unknown',
];

const BASE_PRECEDENCE: Record<DoctrineArea, number> = {
  'security-data': 100,
  architecture: 88,
  'design-system': 82,
  'workflow-ci': 74,
  'feature-business': 66,
  'assistant-specific': 58,
  'stale-or-historical': 24,
  unknown: 12,
};

function normalized(path: string): string {
  return path.toLowerCase();
}

function isStalePath(path: string, staleRisks: string[]): boolean {
  const lower = normalized(path);
  if (/complete|summary|legacy|deprecated/.test(lower)) return true;
  return staleRisks.some((risk) => risk.toLowerCase().startsWith(lower));
}

function inferArea(item: AmbientContextItem): DoctrineArea {
  const lower = normalized(item.path);

  if (
    lower.includes('security') ||
    lower.includes('auth') ||
    lower.includes('rls') ||
    lower.includes('schema') ||
    lower.includes('database') ||
    lower.includes('data-layer') ||
    lower.includes('middleware') ||
    lower.startsWith('supabase/') ||
    lower.startsWith('migrations/') ||
    lower.startsWith('rolemigrations/')
  ) {
    return 'security-data';
  }

  if (
    lower.includes('design-system') ||
    lower.includes('ui-components') ||
    lower.includes('colors') ||
    lower.includes('typography') ||
    lower.includes('spacing') ||
    lower.includes('components.json') ||
    lower.includes('tailwind.config')
  ) {
    return 'design-system';
  }

  if (
    lower.includes('architecture') ||
    lower.includes('state-management') ||
    lower.includes('setup') ||
    lower.includes('readme') ||
    lower.endsWith('config.ts') ||
    lower.endsWith('config.js') ||
    lower.endsWith('config.mjs')
  ) {
    return 'architecture';
  }

  if (
    lower.includes('workflow') ||
    lower.includes('deployment') ||
    lower.includes('quality') ||
    lower.includes('testing') ||
    lower.includes('vitest') ||
    lower.includes('playwright') ||
    lower.startsWith('.github/workflows/')
  ) {
    return 'workflow-ci';
  }

  return item.role;
}

function precedenceFor(item: AmbientContextItem, area: DoctrineArea, staleRisks: string[]): number {
  let score = BASE_PRECEDENCE[area];
  const lower = normalized(item.path);

  if (lower.startsWith('.claude/rules/') || lower.startsWith('.cursor/rules/')) score += 6;
  if (lower === 'claude.md' || lower === 'agents.md' || lower === 'copilot-instructions.md') {
    score += 3;
  }
  if (item.type === 'directory') score -= 8;
  if (isStalePath(item.path, staleRisks)) score -= 35;
  if (!item.safeToCite) score -= 20;

  return Math.max(0, Math.min(100, score));
}

function summarize(sources: DoctrineSource[]): Record<DoctrineArea, number> {
  const summary = Object.fromEntries(PRECEDENCE_ORDER.map((area) => [area, 0])) as Record<
    DoctrineArea,
    number
  >;
  for (const source of sources) summary[source.area] += 1;
  return summary;
}

function topSources(sources: DoctrineSource[], areas: DoctrineArea[], limit = 5): string[] {
  return sources
    .filter((source) => source.currency === 'current' && areas.includes(source.area))
    .slice(0, limit)
    .map((source) => source.path);
}

function buildResolutions(
  conflicts: string[],
  staleRisks: string[],
  sources: DoctrineSource[],
): DoctrineResolution[] {
  const resolutions: DoctrineResolution[] = [];

  for (const conflict of conflicts) {
    const lower = conflict.toLowerCase();
    if (lower.includes('framework')) {
      resolutions.push({
        kind: 'conflict',
        issue: conflict,
        recommendation:
          'Prefer package/config detection and current architecture sources over stale docs or assistant memory when deciding framework/runtime conventions.',
        preferredSources: topSources(sources, ['architecture', 'workflow-ci']),
        confidence: 0.78,
      });
      continue;
    }

    if (lower.includes('tailwind')) {
      resolutions.push({
        kind: 'conflict',
        issue: conflict,
        recommendation:
          'Preserve the existing styling system until the user approves migration; treat current design-system docs and Tailwind/shadcn config as the styling authority.',
        preferredSources: topSources(sources, ['design-system', 'architecture']),
        confidence: 0.82,
      });
      continue;
    }

    if (lower.includes('client') && lower.includes('server')) {
      resolutions.push({
        kind: 'conflict',
        issue: conflict,
        recommendation:
          'Prefer current framework architecture and security/data boundaries; stop and ask for review before moving client/server responsibilities.',
        preferredSources: topSources(sources, ['architecture', 'security-data']),
        confidence: 0.76,
      });
      continue;
    }

    resolutions.push({
      kind: 'conflict',
      issue: conflict,
      recommendation:
        'Use the highest-precedence current sources in the doctrine map and report the conflict before enforcing either side.',
      preferredSources: sources
        .filter((source) => source.currency === 'current')
        .slice(0, 5)
        .map((source) => source.path),
      confidence: 0.62,
    });
  }

  if (staleRisks.length > 0) {
    resolutions.push({
      kind: 'stale-risk',
      issue: `${staleRisks.length} stale or historical source(s) detected.`,
      recommendation:
        'Treat stale-risk sources as historical evidence until confirmed by current security/data, architecture, design-system, workflow, or feature doctrine.',
      preferredSources: sources
        .filter((source) => source.currency === 'current' && source.area !== 'assistant-specific')
        .slice(0, 5)
        .map((source) => source.path),
      confidence: 0.84,
    });
  }

  return resolutions;
}

export function createDoctrineMap(ambient: AmbientContextInventory): DoctrineMap {
  const sources = ambient.items
    .map((item): DoctrineSource => {
      const area = inferArea(item);
      const stale = isStalePath(item.path, ambient.staleRisks);
      return {
        path: item.path,
        type: item.type,
        area: stale ? 'stale-or-historical' : area,
        originalRole: item.role,
        precedence: precedenceFor(item, area, ambient.staleRisks),
        confidence: item.confidence,
        currency: !item.safeToCite ? 'unsafe-to-cite' : stale ? 'stale-risk' : 'current',
        safeToCite: item.safeToCite,
        rationale: item.reason,
      };
    })
    .sort((a, b) => b.precedence - a.precedence || a.path.localeCompare(b.path));

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    precedenceOrder: PRECEDENCE_ORDER,
    sources,
    summary: summarize(sources),
    conflicts: ambient.conflicts,
    staleRisks: ambient.staleRisks,
    resolutions: buildResolutions(ambient.conflicts, ambient.staleRisks, sources),
    guidance: [
      'Treat security/data doctrine as highest precedence for implementation safety.',
      'Treat architecture and design-system sources as product conventions, not Decantr defaults.',
      'Treat workflow/CI sources as validation evidence for commands and release gates.',
      'Treat stale-risk sources as historical evidence until a current source confirms them.',
      'Do not cite unsafe sources directly in assistant context.',
    ],
  };
}

export function doctrineMapPath(projectRoot: string): string {
  return join(projectRoot, '.decantr', 'doctrine-map.json');
}

export function writeDoctrineMap(projectRoot: string, doctrine: DoctrineMap): void {
  writeFileSync(doctrineMapPath(projectRoot), JSON.stringify(doctrine, null, 2) + '\n', 'utf-8');
}

export function readDoctrineMap(projectRoot: string): DoctrineMap | null {
  const path = doctrineMapPath(projectRoot);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf-8')) as DoctrineMap;
    if (parsed.version !== 1 || !Array.isArray(parsed.sources)) return null;
    return parsed;
  } catch {
    return null;
  }
}
