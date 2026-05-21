import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { EssenceV4 } from '@decantr/essence-spec';
import { scanAmbientContext } from './ambient-context.js';
import { scanRoutes } from './analyzers/routes.js';
import { scanStyling } from './analyzers/styling.js';
import { createDoctrineMap, readDoctrineMap } from './doctrine-map.js';

export interface BrownfieldIssue {
  type: 'error' | 'warning';
  rule: string;
  message: string;
  suggestion?: string;
}

function readProjectJson(projectRoot: string): {
  initialized?: { workflowMode?: string; adoptionMode?: string };
} {
  const path = join(projectRoot, '.decantr', 'project.json');
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as {
      initialized?: { workflowMode?: string; adoptionMode?: string };
    };
  } catch {
    return {};
  }
}

function essenceRoutes(essence: EssenceV4): Set<string> {
  const fromRouteMap = Object.keys(essence.blueprint.routes ?? {});
  const fromPages =
    essence.blueprint.sections?.flatMap((section) =>
      section.pages.map((page) => page.route).filter((route): route is string => Boolean(route)),
    ) ??
    essence.blueprint.pages
      ?.map((page) => page.route)
      .filter((route): route is string => Boolean(route)) ??
    [];
  return new Set([...fromRouteMap, ...fromPages]);
}

function routeLabel(routes: string[]): string {
  if (routes.length <= 6) return routes.join(', ');
  return `${routes.slice(0, 6).join(', ')} (+${routes.length - 6} more)`;
}

function routePathname(route: string): string {
  const queryIndex = route.indexOf('?');
  if (queryIndex === -1) return route;
  return route.slice(0, queryIndex) || '/';
}

function declaredRouteObserved(route: string, observedRoutes: Set<string>): boolean {
  return observedRoutes.has(route) || (route.includes('?') && observedRoutes.has(routePathname(route)));
}

function hasDoctrineEffect(essence: EssenceV4, key: string): boolean {
  const effects = essence.dna.constraints?.effects;
  return Boolean(effects && effects[key]);
}

function hasActionableDoctrineSource(
  doctrine: ReturnType<typeof createDoctrineMap>,
  area: 'security-data' | 'design-system',
): boolean {
  return doctrine.sources.some(
    (source) =>
      source.area === area &&
      source.currency === 'current' &&
      source.safeToCite &&
      source.confidence >= 0.72 &&
      source.precedence >= 75,
  );
}

function hasAssistantBridge(projectRoot: string): boolean {
  const previewPath = join(projectRoot, '.decantr', 'context', 'assistant-bridge.md');
  if (existsSync(previewPath)) return true;

  const candidateFiles = [
    'CLAUDE.md',
    'AGENTS.md',
    'GEMINI.md',
    'copilot-instructions.md',
    '.github/copilot-instructions.md',
    '.cursorrules',
    '.windsurfrules',
    '.claude/rules/decantr.md',
    '.cursor/rules/decantr.mdc',
  ];

  return candidateFiles.some((rel) => {
    const path = join(projectRoot, rel);
    if (!existsSync(path)) return false;
    try {
      return readFileSync(path, 'utf-8').includes('decantr:assistant-bridge:start');
    } catch {
      return false;
    }
  });
}

export function scanBrownfieldIssues(projectRoot: string, essence: EssenceV4): BrownfieldIssue[] {
  const projectJson = readProjectJson(projectRoot);
  const routes = scanRoutes(projectRoot);
  const styling = scanStyling(projectRoot);
  const ambient = scanAmbientContext(projectRoot);
  const doctrine = readDoctrineMap(projectRoot) ?? createDoctrineMap(ambient);
  const issues: BrownfieldIssue[] = [];

  const declaredRoutes = essenceRoutes(essence);
  const observedRoutes = new Set(routes.routes.map((route) => route.path));
  const missingFromEssence = [...observedRoutes].filter((route) => !declaredRoutes.has(route));
  const missingFromSource = [...declaredRoutes].filter(
    (route) => !declaredRouteObserved(route, observedRoutes),
  );

  if (routes.routes.length > 0 && declaredRoutes.size === 0) {
    issues.push({
      type: 'error',
      rule: 'brownfield-route-coverage',
      message: `The app has ${routes.routes.length} observed route(s), but the Decantr essence declares no routes.`,
      suggestion:
        'Run `decantr analyze`, review the proposal, then `decantr init --existing --accept-proposal` or `--merge-proposal`.',
    });
  } else if (missingFromEssence.length > 0) {
    issues.push({
      type: 'error',
      rule: 'brownfield-route-drift',
      message: `Observed routes are missing from the Decantr contract: ${routeLabel(missingFromEssence)}.`,
      suggestion: 'Regenerate a brownfield proposal and merge the missing routes into the essence.',
    });
  }

  if (
    routes.routes.length > 0 &&
    declaredRoutes.size === 1 &&
    declaredRoutes.has('/') &&
    routes.routes.length > 1
  ) {
    issues.push({
      type: 'error',
      rule: 'brownfield-generic-contract',
      message: 'The essence only declares `/` while the app has multiple observed routes.',
      suggestion:
        'Accept or merge an observed brownfield proposal instead of using a generic scaffold contract.',
    });
  }

  if (missingFromSource.length > 0 && routes.routes.length > 0) {
    issues.push({
      type: 'warning',
      rule: 'brownfield-stale-route',
      message: `Essence routes were not observed in source: ${routeLabel(missingFromSource)}.`,
      suggestion: 'Confirm whether these are generated/dynamic routes or stale contract entries.',
    });
  }

  const adoptionMode = projectJson.initialized?.adoptionMode;
  const themeId = essence.dna.theme.id;
  if (
    adoptionMode === 'contract-only' &&
    themeId === 'luminarum' &&
    (styling.approach !== 'unknown' || styling.cssVariables.length > 0)
  ) {
    issues.push({
      type: 'warning',
      rule: 'brownfield-theme-default',
      message:
        'Contract-only brownfield essence still uses Decantr theme `luminarum` while the app has an existing styling system.',
      suggestion:
        'Use an observed proposal with `theme.id = "existing"` unless the user explicitly opts into a Decantr theme.',
    });
  }

  for (const conflict of ambient.conflicts) {
    issues.push({
      type: 'warning',
      rule: 'brownfield-doctrine-conflict',
      message: conflict,
      suggestion:
        'Resolve or document precedence before treating these rules as enforceable contract.',
    });
  }

  if (ambient.items.length === 0) {
    issues.push({
      type: 'warning',
      rule: 'brownfield-context-missing',
      message: 'No ambient project context was detected for this brownfield check.',
      suggestion:
        'Run `decantr analyze` to create `.decantr/ambient-context.json` and a proposal-backed report.',
    });
  }

  const hasBrownfieldArtifacts = Boolean(
    projectJson.initialized?.workflowMode === 'brownfield-attach',
  );
  if (hasBrownfieldArtifacts && !existsSync(join(projectRoot, '.decantr', 'doctrine-map.json'))) {
    issues.push({
      type: 'warning',
      rule: 'brownfield-doctrine-map-missing',
      message: 'Brownfield attach metadata exists, but `.decantr/doctrine-map.json` is missing.',
      suggestion: 'Run `decantr analyze` to regenerate ranked doctrine evidence.',
    });
  }

  if (
    hasActionableDoctrineSource(doctrine, 'security-data') &&
    !hasDoctrineEffect(essence, 'doctrine-security-data')
  ) {
    issues.push({
      type: 'warning',
      rule: 'brownfield-doctrine-coverage',
      message:
        'Security/data doctrine was detected, but the essence does not record a security/data preservation constraint.',
      suggestion:
        'Regenerate and merge a brownfield proposal so security/data doctrine is represented in `dna.constraints.effects`.',
    });
  }

  if (
    hasActionableDoctrineSource(doctrine, 'design-system') &&
    !hasDoctrineEffect(essence, 'doctrine-design-system')
  ) {
    issues.push({
      type: 'warning',
      rule: 'brownfield-doctrine-coverage',
      message:
        'Design-system doctrine was detected, but the essence does not record a design-system preservation constraint.',
      suggestion:
        'Regenerate and merge a brownfield proposal so design-system doctrine is represented in `dna.constraints.effects`.',
    });
  }

  if (styling.approach !== 'unknown') {
    const palette = String(essence.dna.color.palette ?? '');
    const observedPalette = palette === 'observed' || palette === styling.approach;
    if (themeId === 'existing' && !observedPalette) {
      issues.push({
        type: 'warning',
        rule: 'brownfield-style-drift',
        message: `Observed styling approach is ${styling.approach}, but the essence color palette is ${palette || 'unset'}.`,
        suggestion:
          'Regenerate and merge a brownfield proposal so the contract reflects the existing styling system.',
      });
    }
  }

  if (
    ambient.items.some((item) => item.role === 'assistant-specific') &&
    hasBrownfieldArtifacts &&
    !hasAssistantBridge(projectRoot)
  ) {
    issues.push({
      type: 'warning',
      rule: 'brownfield-assistant-bridge-missing',
      message:
        'Assistant-specific rule files were detected, but no Decantr assistant bridge preview or applied bridge block was found.',
      suggestion:
        'Run `decantr rules preview` first, then `decantr rules apply` if the user explicitly approves rule-file mutation.',
    });
  }

  const unsafeSources = doctrine.sources.filter((source) => !source.safeToCite);
  if (unsafeSources.length > 0) {
    issues.push({
      type: 'warning',
      rule: 'brownfield-unsafe-context',
      message: `Some ambient context should not be cited directly: ${unsafeSources
        .slice(0, 4)
        .map((source) => source.path)
        .join(', ')}${unsafeSources.length > 4 ? ` (+${unsafeSources.length - 4} more)` : ''}.`,
      suggestion:
        'Keep unsafe source paths in the inventory, but do not paste their contents into assistant context.',
    });
  }

  return issues;
}
