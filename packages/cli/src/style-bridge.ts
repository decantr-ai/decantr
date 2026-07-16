import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { EssenceFile } from '@decantr/essence-spec';
import type { StylingAnalysis } from './analyzers/styling.js';
import type { DetectedProject } from './detect.js';
import { readLocalPatternPack } from './local-law.js';

type StyleBridgeStatus = 'proposal' | 'accepted';
type StyleBridgeSource = 'declared' | 'inferred';

export interface StyleBridgeNativeRef {
  kind:
    | 'tailwind-class'
    | 'css-var'
    | 'sass-var'
    | 'styled-component'
    | 'vanilla-extract-token'
    | 'component'
    | 'class';
  ref: string;
}

export interface StyleBridgeEssenceRef {
  kind: 'token' | 'treatment' | 'decorator' | 'behavior' | 'layout';
  ref: string;
}

export interface StyleBridgeMapping {
  id: string;
  label: string;
  decantrIntent: string;
  projectAuthority: string;
  native?: StyleBridgeNativeRef;
  essence?: StyleBridgeEssenceRef;
  confidence?: number;
  source?: StyleBridgeSource;
  property?: string;
  tokenHints: string[];
  classHints: string[];
  sourceEvidence: string[];
  guardrails: string[];
}

export interface StyleBridgeManifest {
  version: 1 | 2;
  status: StyleBridgeStatus;
  generatedAt: string;
  acceptedAt?: string;
  source: string;
  purpose: string;
  adoption: {
    mode: 'style-bridge';
    workflowMode: 'brownfield-attach';
    sourceAuthority: string;
    styleAuthority: string;
    notRuntimeTakeover: true;
    authorityPrecedence: string[];
  };
  project: {
    framework: string;
    packageManager: string;
    target: string | null;
    routeCount: number;
  };
  styling: {
    approach: StylingAnalysis['approach'];
    configFile: string | null;
    darkModeDetected: boolean;
    cssVariables: string[];
    colorTokenNames: string[];
    themeModes: string[];
    themeVariantIds: string[];
  };
  mappings: StyleBridgeMapping[];
  rules: string[];
  nextSteps: string[];
}

export interface StyleBridgeTaskSummary {
  path: string | null;
  status: StyleBridgeStatus | null;
  mappingCount: number;
  stylingApproach: string | null;
  themeModes: string[];
  mappings: Array<{
    id: string;
    label: string;
    tokenHints: string[];
    classHints: string[];
    guardrails: string[];
  }>;
}

export function styleBridgeProposalPath(projectRoot: string): string {
  return join(projectRoot, '.decantr', 'style-bridge.proposal.json');
}

export function styleBridgePath(projectRoot: string): string {
  return join(projectRoot, '.decantr', 'style-bridge.json');
}

function readJsonFile<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStyleBridgeManifest(
  value: unknown,
  status: StyleBridgeStatus,
): value is StyleBridgeManifest {
  return (
    isRecord(value) &&
    (value.version === 1 || value.version === 2) &&
    value.status === status &&
    Array.isArray(value.mappings) &&
    value.mappings.every((mapping) => isRecord(mapping) && typeof mapping.id === 'string')
  );
}

function writeJsonFile(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

export function readStyleBridge(projectRoot: string): StyleBridgeManifest | null {
  const bridge = readJsonFile<unknown>(styleBridgePath(projectRoot));
  return isStyleBridgeManifest(bridge, 'accepted') ? bridge : null;
}

export function readStyleBridgeProposal(projectRoot: string): StyleBridgeManifest | null {
  const proposal = readJsonFile<unknown>(styleBridgeProposalPath(projectRoot));
  return isStyleBridgeManifest(proposal, 'proposal') ? proposal : null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : [];
}

function readThemeInventory(projectRoot: string): {
  modes: string[];
  variantIds: string[];
  darkModeDetected: boolean | null;
} {
  const inventory = readJsonFile<{
    modes?: unknown;
    variants?: Array<{ id?: unknown }>;
    darkModeDetected?: unknown;
  }>(join(projectRoot, '.decantr', 'theme-inventory.json'));
  return {
    modes: stringArray(inventory?.modes),
    variantIds: Array.isArray(inventory?.variants)
      ? inventory.variants
          .map((variant) => variant.id)
          .filter((id): id is string => typeof id === 'string')
      : [],
    darkModeDetected:
      typeof inventory?.darkModeDetected === 'boolean' ? inventory.darkModeDetected : null,
  };
}

function tokenHints(styling: StylingAnalysis, terms: RegExp): string[] {
  return styling.cssVariables.filter((name) => terms.test(name)).slice(0, 12);
}

function readProjectPatternPack(projectRoot: string) {
  return (
    readLocalPatternPack(projectRoot) ??
    readJsonFile<{
      patterns?: Array<{
        id?: string;
        classHints?: string[];
        componentPaths?: string[];
        evidence?: string[];
      }>;
    }>(join(projectRoot, '.decantr', 'local-patterns.proposal.json'))
  );
}

function classHintsForPattern(projectRoot: string, ids: string[]): string[] {
  const pack = readProjectPatternPack(projectRoot);
  const classes = new Set<string>();
  for (const pattern of pack?.patterns ?? []) {
    if (!ids.includes(String(pattern.id))) continue;
    for (const hint of pattern.classHints ?? []) classes.add(hint);
  }
  return [...classes].slice(0, 12);
}

function sourceEvidence(projectRoot: string, ids: string[]): string[] {
  const pack = readProjectPatternPack(projectRoot);
  const evidence = new Set<string>();
  for (const pattern of pack?.patterns ?? []) {
    if (!ids.includes(String(pattern.id))) continue;
    for (const path of pattern.componentPaths ?? []) evidence.add(path);
    for (const item of pattern.evidence ?? []) evidence.add(item);
  }
  return [...evidence].slice(0, 12);
}

function colorTokenNames(styling: StylingAnalysis): string[] {
  const names = new Set<string>(Object.keys(styling.colors ?? {}));
  for (const variable of styling.cssVariables) {
    if (
      /color|bg|background|surface|text|foreground|border|primary|secondary|accent|muted/i.test(
        variable,
      )
    ) {
      names.add(variable);
    }
  }
  return [...names].slice(0, 40);
}

function firstCssVariable(styling: StylingAnalysis, terms: RegExp): string | null {
  return styling.cssVariables.find((name) => terms.test(name)) ?? null;
}

function firstClassHint(projectRoot: string, ids: string[]): string | null {
  return classHintsForPattern(projectRoot, ids)[0] ?? null;
}

function nativeRefForMapping(input: {
  projectRoot: string;
  styling: StylingAnalysis;
  patternIds: string[];
  tokenTerms: RegExp;
  fallbackClass: string;
}): StyleBridgeNativeRef {
  const cssVariable = firstCssVariable(input.styling, input.tokenTerms);
  if (cssVariable) return { kind: 'css-var', ref: cssVariable };
  const classHint = firstClassHint(input.projectRoot, input.patternIds);
  if (classHint) return { kind: 'class', ref: classHint };
  return { kind: 'class', ref: input.fallbackClass };
}

export function createStyleBridgeProposal(input: {
  projectRoot: string;
  detected: DetectedProject;
  essence: EssenceFile | null;
  styling: StylingAnalysis;
}): StyleBridgeManifest {
  const generatedAt = new Date().toISOString();
  const theme = readThemeInventory(input.projectRoot);
  const routeCount =
    input.essence && typeof input.essence === 'object' && 'blueprint' in input.essence
      ? Object.keys(
          (input.essence as { blueprint?: { routes?: Record<string, unknown> } }).blueprint
            ?.routes ?? {},
        ).length
      : 0;
  const target =
    input.essence && typeof input.essence === 'object' && 'meta' in input.essence
      ? String((input.essence as { meta?: { target?: unknown } }).meta?.target ?? '') || null
      : null;
  const darkModeDetected = theme.darkModeDetected ?? input.styling.darkMode;
  const themeModes =
    theme.modes.length > 0 ? theme.modes : darkModeDetected ? ['base', 'dark'] : ['base'];
  const themeVariantIds =
    theme.variantIds.length > 0 ? theme.variantIds : themeModes.filter((mode) => mode !== 'base');

  return {
    version: 2,
    status: 'proposal',
    generatedAt,
    source: 'decantr codify --style-bridge',
    purpose:
      'Project-owned Hybrid style bridge. It maps Decantr design intent to the existing app styling system without generating runtime CSS, installing Decantr CSS, or taking over source.',
    adoption: {
      mode: 'style-bridge',
      workflowMode: 'brownfield-attach',
      sourceAuthority: 'Existing production source stays authoritative.',
      styleAuthority:
        'Use these mappings to translate Decantr concepts into project-owned tokens, classes, and components.',
      notRuntimeTakeover: true,
      authorityPrecedence: [
        'existing production source',
        'accepted style bridge',
        'accepted local patterns and rules',
        'Essence V4 contract',
        'official corpus patterns and execution packs as optional guidance',
      ],
    },
    project: {
      framework: input.detected.framework,
      packageManager: input.detected.packageManager,
      target,
      routeCount,
    },
    styling: {
      approach: input.styling.approach,
      configFile: input.styling.configFile ?? null,
      darkModeDetected,
      cssVariables: input.styling.cssVariables.slice(0, 80),
      colorTokenNames: colorTokenNames(input.styling),
      themeModes,
      themeVariantIds,
    },
    mappings: [
      {
        id: 'surface',
        label: 'Surfaces and cards',
        decantrIntent: 'surface background, card treatment, border, radius, depth, and hover state',
        projectAuthority: 'Use the app card/surface primitives, tokens, and accepted local law.',
        native: nativeRefForMapping({
          projectRoot: input.projectRoot,
          styling: input.styling,
          patternIds: ['surface-card'],
          tokenTerms: /surface|card|panel|bg|background|border|shadow|radius/i,
          fallbackClass: 'surface-card',
        }),
        essence: { kind: 'treatment', ref: 'surface' },
        confidence: 0.7,
        source: 'inferred',
        property: 'surface',
        tokenHints: tokenHints(
          input.styling,
          /surface|card|panel|bg|background|border|shadow|radius/i,
        ),
        classHints: classHintsForPattern(input.projectRoot, ['surface-card']),
        sourceEvidence: sourceEvidence(input.projectRoot, ['surface-card']),
        guardrails: [
          'Do not invent a new card color/radius/shadow recipe without updating local law.',
          'Do not add Decantr CSS d-* classes unless adoption mode changes to decantr-css.',
        ],
      },
      {
        id: 'action',
        label: 'Actions and buttons',
        decantrIntent:
          'primary, secondary, tertiary, destructive, icon-only, loading, and disabled action states',
        projectAuthority: 'Use the app button/action primitives and local variant names.',
        native: nativeRefForMapping({
          projectRoot: input.projectRoot,
          styling: input.styling,
          patternIds: ['button'],
          tokenTerms: /primary|secondary|accent|danger|error|destructive|focus/i,
          fallbackClass: 'button',
        }),
        essence: { kind: 'treatment', ref: 'action' },
        confidence: 0.72,
        source: 'inferred',
        property: 'color',
        tokenHints: tokenHints(
          input.styling,
          /primary|secondary|accent|danger|error|destructive|focus/i,
        ),
        classHints: classHintsForPattern(input.projectRoot, ['button']),
        sourceEvidence: sourceEvidence(input.projectRoot, ['button']),
        guardrails: [
          'Map any new action style to primary/secondary/tertiary/destructive/icon before coding.',
          'Avoid raw button markup when a project-owned primitive exists.',
        ],
      },
      {
        id: 'focus-accessibility',
        label: 'Focus and accessibility',
        decantrIntent: 'visible focus, keyboard clarity, contrast, and reduced-motion safety',
        projectAuthority:
          'Use the app accessibility classes, focus tokens, and framework conventions.',
        native: nativeRefForMapping({
          projectRoot: input.projectRoot,
          styling: input.styling,
          patternIds: [],
          tokenTerms: /focus|ring|outline|contrast|motion|duration/i,
          fallbackClass: 'focus-visible',
        }),
        essence: { kind: 'behavior', ref: 'focus-accessibility' },
        confidence: 0.66,
        source: 'inferred',
        property: 'focus',
        tokenHints: tokenHints(input.styling, /focus|ring|outline|contrast|motion|duration/i),
        classHints: [],
        sourceEvidence: [],
        guardrails: [
          'Every new interactive control needs visible focus evidence.',
          'Motion should honor prefers-reduced-motion or an existing app motion helper.',
        ],
      },
      {
        id: 'layout-density',
        label: 'Layout density and spacing',
        decantrIntent:
          'route gutters, section gaps, component padding, density, and responsive rhythm',
        projectAuthority:
          'Use existing layout wrappers, shell primitives, and spacing tokens/classes.',
        native: nativeRefForMapping({
          projectRoot: input.projectRoot,
          styling: input.styling,
          patternIds: ['page-shell'],
          tokenTerms: /space|spacing|gap|gutter|container|radius/i,
          fallbackClass: 'page-shell',
        }),
        essence: { kind: 'layout', ref: 'density-spacing' },
        confidence: 0.68,
        source: 'inferred',
        property: 'spacing',
        tokenHints: tokenHints(input.styling, /space|spacing|gap|gutter|container|radius/i),
        classHints: classHintsForPattern(input.projectRoot, ['page-shell']),
        sourceEvidence: sourceEvidence(input.projectRoot, ['page-shell']),
        guardrails: [
          'Do not let each page invent independent max-width, gutters, or scroll ownership.',
          'Use the detected shell/layout authority before adding a new wrapper.',
        ],
      },
      {
        id: 'theme-variant',
        label: 'Theme variants',
        decantrIntent: 'light, dark, brand, tenant, seasonal, and density variants',
        projectAuthority:
          'Use the app theme provider, data attributes, CSS variables, or Tailwind mode strategy.',
        native: nativeRefForMapping({
          projectRoot: input.projectRoot,
          styling: input.styling,
          patternIds: ['theme-variant'],
          tokenTerms: /theme|dark|light|brand|tenant|mode|color/i,
          fallbackClass: 'theme-variant',
        }),
        essence: { kind: 'token', ref: 'theme-variant' },
        confidence: 0.64,
        source: 'inferred',
        property: 'theme',
        tokenHints: tokenHints(input.styling, /theme|dark|light|brand|tenant|mode|color/i),
        classHints: classHintsForPattern(input.projectRoot, ['theme-variant']),
        sourceEvidence: sourceEvidence(input.projectRoot, ['theme-variant']),
        guardrails: [
          'Keep theme modes documented in .decantr/theme-inventory.json and this bridge.',
          'Do not treat theme switcher container classes as standalone theme variants.',
        ],
      },
    ],
    rules: [
      'The bridge is advisory until accepted; after acceptance, task/doctor/CI should surface it as Hybrid authority.',
      'The host project owns runtime CSS, tokens, and global styles. Decantr must not generate or overwrite them in style-bridge mode.',
      'The bridge does not make official corpus patterns enforceable. Map corpus concepts into local law first.',
      'Keep deterministic blocking checks in .decantr/rules.json, ESLint, Biome, tests, or visual regression.',
    ],
    nextSteps: [
      'Review token and class hints. Replace generic hints with the exact project tokens/classes the team owns.',
      'Run decantr codify --accept --confirm-reviewed --accept-style-bridge to promote the proposal and explicitly activate style-bridge adoption.',
      'Use decantr task <route> before LLM edits so the style bridge appears in task context.',
      'Run decantr ci or decantr verify after edits to keep local law and Project Health visible.',
    ],
  };
}

export function writeStyleBridgeProposal(
  projectRoot: string,
  proposal: StyleBridgeManifest,
): string {
  const decantrDir = join(projectRoot, '.decantr');
  mkdirSync(decantrDir, { recursive: true });
  const path = styleBridgeProposalPath(projectRoot);
  writeJsonFile(path, proposal);
  return path;
}

export function acceptStyleBridge(projectRoot: string): string | null {
  const proposal = readStyleBridgeProposal(projectRoot);
  if (!proposal) return null;
  const accepted: StyleBridgeManifest = {
    ...proposal,
    status: 'accepted',
    acceptedAt: new Date().toISOString(),
  };
  const path = styleBridgePath(projectRoot);
  writeJsonFile(path, accepted);

  const projectJsonPath = join(projectRoot, '.decantr', 'project.json');
  const projectJson = readJsonFile<Record<string, unknown>>(projectJsonPath) ?? {};
  const initialized =
    typeof projectJson.initialized === 'object' && projectJson.initialized !== null
      ? (projectJson.initialized as Record<string, unknown>)
      : {};
  writeJsonFile(projectJsonPath, {
    ...projectJson,
    initialized: {
      ...initialized,
      workflowMode: initialized.workflowMode ?? 'brownfield-attach',
      adoptionMode: 'style-bridge',
    },
  });

  return path;
}

export function createStyleBridgeTaskSummary(projectRoot: string): StyleBridgeTaskSummary {
  const bridge = readStyleBridge(projectRoot);
  return {
    path: bridge ? '.decantr/style-bridge.json' : null,
    status: bridge?.status ?? null,
    mappingCount: bridge?.mappings?.length ?? 0,
    stylingApproach: bridge?.styling?.approach ?? null,
    themeModes: bridge?.styling?.themeModes ?? [],
    mappings:
      bridge?.mappings?.map((mapping) => ({
        id: mapping.id,
        label: mapping.label,
        tokenHints: mapping.tokenHints.slice(0, 6),
        classHints: mapping.classHints.slice(0, 4),
        guardrails: mapping.guardrails.slice(0, 3),
      })) ?? [],
  };
}

export function styleBridgeMatches(
  projectRoot: string | undefined,
  query: string,
): Array<{ id: string; label: string; score: number; tokenHints: string[]; classHints: string[] }> {
  if (!projectRoot) return [];
  const bridge = readStyleBridge(projectRoot);
  if (!bridge) return [];
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 1)
    .flatMap((term) =>
      term.endsWith('s') && term.length > 3 ? [term, term.slice(0, -1)] : [term],
    );
  if (terms.length === 0) return [];
  return bridge.mappings
    .map((mapping) => {
      const haystack = [
        mapping.id,
        mapping.label,
        mapping.decantrIntent,
        mapping.projectAuthority,
        mapping.native?.ref,
        mapping.native?.kind,
        mapping.essence?.ref,
        mapping.essence?.kind,
        mapping.property,
        ...mapping.tokenHints,
        ...mapping.classHints,
        ...mapping.guardrails,
      ]
        .join(' ')
        .toLowerCase();
      const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
      return {
        id: mapping.id,
        label: mapping.label,
        score,
        tokenHints: mapping.tokenHints.slice(0, 4),
        classHints: mapping.classHints.slice(0, 3),
      };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 5);
}
