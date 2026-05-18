import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join, relative, sep } from 'node:path';
import type { EssenceFile } from '@decantr/essence-spec';
import { isV4 } from '@decantr/essence-spec';
import type { DetectedProject } from './detect.js';

const SOURCE_EXTENSIONS = new Set([
  '.astro',
  '.html',
  '.js',
  '.jsx',
  '.svelte',
  '.ts',
  '.tsx',
  '.vue',
]);

const UI_TEMPLATE_EXTENSIONS = new Set(['.astro', '.html', '.jsx', '.svelte', '.tsx', '.vue']);

const IGNORED_DIRS = new Set([
  '.decantr',
  '.git',
  '.next',
  '.nuxt',
  '.svelte-kit',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
]);

const DEFAULT_RULE_EXTENSIONS = ['.astro', '.html', '.jsx', '.svelte', '.tsx', '.vue'];

export interface LocalPatternPack {
  version?: number;
  status?: string;
  generatedAt?: string;
  acceptedAt?: string;
  source?: string;
  purpose?: string;
  patterns?: LocalPattern[];
  starterRules?: string[];
  nextSteps?: string[];
  [key: string]: unknown;
}

export interface LocalPattern {
  id?: string;
  label?: string;
  role?: string;
  decide?: string;
  appliesTo?: string[];
  componentPaths?: string[];
  tokenHints?: string[];
  classHints?: string[];
  forbiddenAlternatives?: string[];
  evidence?: string[];
  evidenceToCollect?: string[];
  [key: string]: unknown;
}

export interface LocalRuleManifest {
  version: number;
  status: 'proposal' | 'accepted';
  generatedAt: string;
  acceptedAt?: string;
  source: string;
  purpose: string;
  enforcement: {
    defaultSeverity: LocalRuleSeverity;
    mode: 'warn' | 'strict';
    notes: string[];
  };
  rules: LocalRule[];
}

export type LocalRuleSeverity = 'info' | 'warn' | 'error';
export type LocalRuleType = 'forbid-regex';

export interface LocalRule {
  id: string;
  type: LocalRuleType;
  enabled: boolean;
  severity: LocalRuleSeverity;
  description: string;
  includeExtensions: string[];
  pattern: string;
  message: string;
  suggestedFix: string;
  allowedPaths?: string[];
  maxFindings?: number;
}

export interface LocalLawFinding {
  ruleId: string;
  severity: LocalRuleSeverity;
  file: string;
  line: number;
  column: number;
  excerpt: string;
  message: string;
  suggestedFix: string;
}

export interface LocalLawValidation {
  patternsPath: string;
  rulesPath: string;
  patternPackPresent: boolean;
  ruleManifestPresent: boolean;
  warnings: string[];
  findings: LocalLawFinding[];
}

export interface LocalLawTaskSummary {
  patternsPath: string | null;
  rulesPath: string | null;
  patternCount: number;
  ruleCount: number;
  patterns: Array<{ id: string; role: string | null; componentPaths: string[] }>;
  rules: Array<{ id: string; severity: LocalRuleSeverity; enabled: boolean; description: string }>;
}

export interface BrownfieldCodifyInput {
  projectRoot: string;
  detected: DetectedProject;
  essence: EssenceFile | null;
  fromAudit: boolean;
}

export interface BrownfieldCodifyProposal {
  patternPack: LocalPatternPack;
  ruleManifest: LocalRuleManifest;
}

export function localPatternsProposalPath(projectRoot: string): string {
  return join(projectRoot, '.decantr', 'local-patterns.proposal.json');
}

export function localPatternsPath(projectRoot: string): string {
  return join(projectRoot, '.decantr', 'local-patterns.json');
}

export function localRulesProposalPath(projectRoot: string): string {
  return join(projectRoot, '.decantr', 'rules.proposal.json');
}

export function localRulesPath(projectRoot: string): string {
  return join(projectRoot, '.decantr', 'rules.json');
}

export function readLocalPatternPack(projectRoot: string): LocalPatternPack | null {
  return readJsonFile<LocalPatternPack>(localPatternsPath(projectRoot));
}

export function readLocalRuleManifest(projectRoot: string): LocalRuleManifest | null {
  return readJsonFile<LocalRuleManifest>(localRulesPath(projectRoot));
}

export function createBrownfieldCodifyProposal(
  input: BrownfieldCodifyInput,
): BrownfieldCodifyProposal {
  const sourceFiles = input.fromAudit ? listSourceFiles(input.projectRoot, 800) : [];
  const evidence = summarizeSourceEvidence(input.projectRoot, sourceFiles);
  const routes =
    input.essence && isV4(input.essence)
      ? Object.keys(input.essence.blueprint.routes ?? {}).sort()
      : [];
  const generatedAt = new Date().toISOString();

  const patternPack: LocalPatternPack = {
    version: 2,
    generatedAt,
    status: 'proposal',
    source: input.fromAudit ? 'decantr codify --from-audit' : 'decantr codify',
    project: {
      framework: input.detected.framework,
      packageManager: input.detected.packageManager,
      hasTailwind: input.detected.hasTailwind,
      ruleFiles: input.detected.existingRuleFiles,
      routeCount: routes.length,
    },
    purpose:
      'Project-owned Brownfield/Hybrid UI law. Review and edit before accepting; Decantr treats this as authoritative only after it is copied to .decantr/local-patterns.json.',
    hybrid: {
      intent:
        'This local pattern pack is the first Hybrid authority layer: it maps Decantr concepts onto project-owned components, tokens, classes, and rules without replacing the app runtime.',
      authorityPrecedence: [
        'existing production source',
        'accepted local patterns and rules',
        'Decantr Essence V4 contract',
        'hosted registry patterns and execution packs as optional guidance',
      ],
      hostedPatternMapping:
        'Use hosted patterns as vocabulary and review guidance. Before enforcing one, map it to a project-owned component path, class recipe, token recipe, or explicit exception here.',
    },
    patterns: [
      {
        id: 'button',
        label: 'Button primitives',
        role: 'Actions and command triggers',
        appliesTo: [
          'primary action',
          'secondary action',
          'tertiary action',
          'destructive action',
          'icon action',
        ],
        componentPaths: evidence.buttonComponents,
        decide:
          'Define primary, secondary, tertiary, destructive, icon-only, disabled, and loading button variants from this app.',
        evidence: evidence.buttonComponents.length
          ? evidence.buttonComponents
          : [
              'No obvious Button wrapper found yet. Add the project-owned wrapper path before strict enforcement.',
            ],
        forbiddenAlternatives: ['New one-off button variants without updating this manifest.'],
      },
      {
        id: 'surface-card',
        label: 'Cards and surfaces',
        role: 'Cards, panels, and reusable content surfaces',
        appliesTo: ['cards', 'panels', 'modals', 'list items', 'dashboard tiles'],
        componentPaths: evidence.cardComponents,
        decide:
          'Define the canonical card background, border, radius, shadow, padding, density, and hover treatment.',
        classHints: evidence.cardClassHints,
        evidence: evidence.cardComponents.length
          ? evidence.cardComponents
          : [
              'No obvious Card wrapper found yet. Add the project-owned wrapper path or class recipe.',
            ],
        forbiddenAlternatives: ['Flat ad hoc cards with unique color/radius/shadow recipes.'],
      },
      {
        id: 'page-shell',
        label: 'Page shell and spacing',
        role: 'Route shell, navigation, gutters, max-width, and scroll ownership',
        appliesTo: ['routes', 'layouts', 'navigation shells', 'scroll containers'],
        componentPaths: evidence.shellComponents,
        decide:
          'Define which layout owns max width, gutters, sticky chrome, responsive breakpoints, and scroll containers.',
        evidence: evidence.shellComponents.length
          ? evidence.shellComponents
          : ['Add root layout, shell, or app frame files that establish route chrome and spacing.'],
        forbiddenAlternatives: [
          'Each page inventing independent max-width, padding, or sticky nav rules.',
        ],
      },
      {
        id: 'form-control',
        label: 'Form controls',
        role: 'Inputs, labels, validation, and form actions',
        appliesTo: ['inputs', 'selects', 'textareas', 'validation messages', 'form actions'],
        componentPaths: evidence.formComponents,
        decide:
          'Define input height, label placement, error copy, disabled state, required state, and focus treatment.',
        evidence: evidence.formComponents.length
          ? evidence.formComponents
          : ['Add form field wrapper paths and validation examples.'],
        forbiddenAlternatives: [
          'Unlabeled one-off inputs or validation states that do not match the app standard.',
        ],
      },
      {
        id: 'theme-variant',
        label: 'Theme variants',
        role: 'Light, dark, brand, density, and tenant/theme variants observed in the app',
        appliesTo: ['theme toggles', 'mode-specific classes', 'brand variants', 'tenant variants'],
        componentPaths: evidence.themeComponents,
        decide:
          'Document which theme variants exist, where they are toggled, and which tokens/classes are legal per variant.',
        evidence: evidence.themeComponents.length
          ? evidence.themeComponents
          : ['If the app has dark/light or brand variants, add the toggles/providers here.'],
        forbiddenAlternatives: [
          'Component-local theme forks that bypass shared theme providers or tokens.',
        ],
      },
    ],
    starterRules: [
      'Prefer project-owned wrappers for repeated primitives once they exist.',
      'Avoid raw hex/rgb values in component templates unless documented as dynamic data.',
      'Avoid static inline styles for reusable visual treatment.',
      'When adding a new route, map it to an existing local pattern before inventing a new visual variant.',
      'When adding a theme variant, update .decantr/theme-inventory.json and this local pattern pack.',
      'Map hosted Decantr patterns into project-owned local law before making them enforceable.',
    ],
    nextSteps: [
      'Edit this proposal with real component paths and token/class recipes.',
      'Run decantr codify --accept after review.',
      'Use decantr task <route> before LLM edits so local law appears in task context.',
      'Run decantr verify --brownfield --local-patterns after edits.',
      'For Hybrid adoption, start with warn-level local rules and raise severities only after the team agrees the law is stable.',
      'Wire deterministic project rules into ESLint, Biome, Storybook, visual tests, or CI where Decantr should not guess.',
    ],
  };

  const ruleManifest: LocalRuleManifest = {
    version: 1,
    status: 'proposal',
    generatedAt,
    source: input.fromAudit ? 'decantr codify --from-audit' : 'decantr codify',
    purpose:
      'Mechanical Brownfield/Hybrid checks owned by this project. These rules are intentionally local and stack-agnostic; edit before accepting.',
    enforcement: {
      defaultSeverity: 'warn',
      mode: 'warn',
      notes: [
        'Decantr local rules are a guardrail, not a replacement for ESLint, Biome, type checks, tests, or visual regression.',
        'Keep rules narrow enough that an LLM can fix findings without rewriting the app.',
        'Use error severity only after the team agrees the rule is stable.',
      ],
    },
    rules: [
      {
        id: 'no-inline-style',
        type: 'forbid-regex',
        enabled: true,
        severity: 'warn',
        description: 'Reusable UI should not add static inline style attributes.',
        includeExtensions: DEFAULT_RULE_EXTENSIONS,
        pattern: '\\bstyle\\s*=',
        message: 'Inline style found in UI template.',
        suggestedFix:
          'Move reusable visual treatment into the project style system, component wrapper, token, or documented local pattern.',
        maxFindings: 25,
      },
      {
        id: 'no-raw-color-literals',
        type: 'forbid-regex',
        enabled: true,
        severity: 'warn',
        description: 'Component templates should not introduce raw hex/rgb color literals.',
        includeExtensions: DEFAULT_RULE_EXTENSIONS,
        pattern: '#(?:[0-9a-fA-F]{3,8})\\b|rgba?\\s*\\(',
        message: 'Raw color literal found in UI template.',
        suggestedFix:
          'Use an existing project token/class, or document the exception in .decantr/local-patterns.json if the value is data-driven.',
        maxFindings: 25,
      },
      {
        id: 'prefer-button-wrapper',
        type: 'forbid-regex',
        enabled: evidence.buttonComponents.length > 0,
        severity: 'info',
        description: 'Prefer the project-owned button primitive instead of new raw button markup.',
        includeExtensions: DEFAULT_RULE_EXTENSIONS,
        pattern: '<button[\\s>]',
        message: 'Raw <button> usage found outside the detected button wrapper.',
        suggestedFix:
          'Use the project-owned Button primitive, or add this file to allowedPaths if it is the primitive implementation.',
        allowedPaths: evidence.buttonComponents,
        maxFindings: 50,
      },
    ],
  };

  return { patternPack, ruleManifest };
}

export function writeBrownfieldCodifyProposal(
  projectRoot: string,
  proposal: BrownfieldCodifyProposal,
): { patternPath: string; rulesPath: string } {
  const decantrDir = join(projectRoot, '.decantr');
  mkdirSync(decantrDir, { recursive: true });
  const patternPath = localPatternsProposalPath(projectRoot);
  const rulesPath = localRulesProposalPath(projectRoot);
  writeFileSync(patternPath, `${JSON.stringify(proposal.patternPack, null, 2)}\n`, 'utf-8');
  writeFileSync(rulesPath, `${JSON.stringify(proposal.ruleManifest, null, 2)}\n`, 'utf-8');
  return { patternPath, rulesPath };
}

export function acceptBrownfieldLocalLaw(projectRoot: string): {
  patternAcceptedPath: string | null;
  rulesAcceptedPath: string | null;
} {
  const patternProposal = readJsonFile<LocalPatternPack>(localPatternsProposalPath(projectRoot));
  const ruleProposal = readJsonFile<LocalRuleManifest>(localRulesProposalPath(projectRoot));
  const acceptedAt = new Date().toISOString();
  let patternAcceptedPath: string | null = null;
  let rulesAcceptedPath: string | null = null;

  if (patternProposal) {
    patternProposal.status = 'accepted';
    patternProposal.acceptedAt = acceptedAt;
    patternAcceptedPath = localPatternsPath(projectRoot);
    writeFileSync(patternAcceptedPath, `${JSON.stringify(patternProposal, null, 2)}\n`, 'utf-8');
  }

  if (ruleProposal) {
    ruleProposal.status = 'accepted';
    ruleProposal.acceptedAt = acceptedAt;
    rulesAcceptedPath = localRulesPath(projectRoot);
    writeFileSync(rulesAcceptedPath, `${JSON.stringify(ruleProposal, null, 2)}\n`, 'utf-8');
  }

  return { patternAcceptedPath, rulesAcceptedPath };
}

export function validateLocalLaw(projectRoot: string): LocalLawValidation {
  const patternsPath = localPatternsPath(projectRoot);
  const rulesPath = localRulesPath(projectRoot);
  const patternPack = readJsonFile<LocalPatternPack>(patternsPath);
  const ruleManifest = readJsonFile<LocalRuleManifest>(rulesPath);
  const warnings: string[] = [];

  if (patternPack) {
    const patternIds = new Set<string>();
    const patterns = Array.isArray(patternPack.patterns) ? patternPack.patterns : [];
    if (patterns.length === 0) {
      warnings.push('.decantr/local-patterns.json has no patterns.');
    }
    for (const pattern of patterns) {
      const id = typeof pattern.id === 'string' ? pattern.id.trim() : '';
      if (!id) warnings.push('A local pattern is missing an id.');
      if (id && patternIds.has(id)) warnings.push(`Duplicate local pattern id: ${id}`);
      if (id) patternIds.add(id);
      const paths = Array.isArray(pattern.componentPaths) ? pattern.componentPaths : [];
      const evidence = Array.isArray(pattern.evidence) ? pattern.evidence : [];
      const todoEvidence = Array.isArray(pattern.evidenceToCollect)
        ? pattern.evidenceToCollect
        : [];
      if (id && paths.length === 0 && evidence.length === 0 && todoEvidence.length > 0) {
        warnings.push(
          `Local pattern ${id} still reads like a TODO; add concrete component paths or evidence.`,
        );
      }
    }
  }

  if (ruleManifest && !Array.isArray(ruleManifest.rules)) {
    warnings.push('.decantr/rules.json has no rules array.');
  }

  const findings = ruleManifest ? scanLocalRules(projectRoot, ruleManifest) : [];
  return {
    patternsPath,
    rulesPath,
    patternPackPresent: Boolean(patternPack),
    ruleManifestPresent: Boolean(ruleManifest),
    warnings,
    findings,
  };
}

export function createLocalLawTaskSummary(projectRoot: string): LocalLawTaskSummary {
  const patternPack = readLocalPatternPack(projectRoot);
  const ruleManifest = readLocalRuleManifest(projectRoot);
  const patterns = (patternPack?.patterns ?? []).map((pattern) => ({
    id: typeof pattern.id === 'string' ? pattern.id : 'unknown',
    role: typeof pattern.role === 'string' ? pattern.role : null,
    componentPaths: Array.isArray(pattern.componentPaths)
      ? pattern.componentPaths.filter((entry): entry is string => typeof entry === 'string')
      : [],
  }));
  const rules = (ruleManifest?.rules ?? []).map((rule) => ({
    id: rule.id,
    severity: rule.severity,
    enabled: rule.enabled,
    description: rule.description,
  }));

  return {
    patternsPath: patternPack ? '.decantr/local-patterns.json' : null,
    rulesPath: ruleManifest ? '.decantr/rules.json' : null,
    patternCount: patterns.length,
    ruleCount: rules.length,
    patterns,
    rules,
  };
}

export function changedFiles(projectRoot: string, since?: string): string[] {
  const changed = new Set<string>();
  try {
    // Security: fixed git argv, shell disabled, and cwd scoped to the selected project.
    const commands = since
      ? [
          ['diff', '--name-only', since, '--'],
          ['diff', '--name-only', '--cached'],
        ]
      : [
          ['diff', '--name-only'],
          ['diff', '--name-only', '--cached'],
        ];
    for (const args of commands) {
      const output = execFileSync('git', args, {
        cwd: projectRoot,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      for (const line of output.split(/\r?\n/)) {
        const file = line.trim();
        if (file) changed.add(normalizePath(file));
      }
    }
  } catch {
    // Not every attached app is a git repository.
  }
  return [...changed].sort();
}

export function routeImpacts(projectRoot: string, files: string[]): string[] {
  const analysis = readJsonFile<{ routes?: { routes?: Array<{ path?: string; file?: string }> } }>(
    join(projectRoot, '.decantr', 'analysis.json'),
  );
  const routeEntries = analysis?.routes?.routes ?? [];
  const impacted = new Set<string>();
  for (const file of files) {
    for (const route of routeEntries) {
      if (route.file && pathMatches(file, route.file)) {
        if (route.path) impacted.add(route.path);
      }
    }
  }
  return [...impacted].sort();
}

function scanLocalRules(projectRoot: string, manifest: LocalRuleManifest): LocalLawFinding[] {
  const findings: LocalLawFinding[] = [];
  const files = listSourceFiles(projectRoot, 1200);
  for (const rule of manifest.rules ?? []) {
    if (!rule.enabled || rule.type !== 'forbid-regex') continue;
    const extensions = new Set(
      rule.includeExtensions?.length ? rule.includeExtensions : DEFAULT_RULE_EXTENSIONS,
    );
    let regex: RegExp;
    try {
      regex = new RegExp(rule.pattern, 'g');
    } catch {
      findings.push({
        ruleId: rule.id,
        severity: 'error',
        file: '.decantr/rules.json',
        line: 1,
        column: 1,
        excerpt: rule.pattern,
        message: `Invalid regex for local rule ${rule.id}.`,
        suggestedFix:
          'Edit .decantr/rules.json so the pattern is a valid JavaScript regular expression.',
      });
      continue;
    }

    let ruleFindingCount = 0;
    for (const file of files) {
      if (!extensions.has(extname(file.absolute))) continue;
      if (pathAllowed(file.relative, rule.allowedPaths ?? [])) continue;
      const contents = readFileSync(file.absolute, 'utf-8');
      for (const match of contents.matchAll(regex)) {
        const index = match.index ?? 0;
        const position = lineColumnAt(contents, index);
        findings.push({
          ruleId: rule.id,
          severity: rule.severity,
          file: file.relative,
          line: position.line,
          column: position.column,
          excerpt: lineAt(contents, position.line).trim().slice(0, 180),
          message: rule.message,
          suggestedFix: rule.suggestedFix,
        });
        ruleFindingCount += 1;
        if (rule.maxFindings && ruleFindingCount >= rule.maxFindings) break;
      }
      if (rule.maxFindings && ruleFindingCount >= rule.maxFindings) break;
    }
  }
  return findings;
}

function summarizeSourceEvidence(
  projectRoot: string,
  files: Array<{ absolute: string; relative: string }>,
) {
  const componentPaths = files
    .filter((file) => /(^|[/\\])components?([/\\]|$)|(^|[/\\])ui([/\\]|$)/i.test(file.relative))
    .map((file) => file.relative);
  const byName = (terms: string[]) =>
    componentPaths
      .filter((file) => terms.some((term) => basename(file).toLowerCase().includes(term)))
      .slice(0, 12);
  const themeComponents = componentPaths
    .filter((file) => /theme|provider|mode|appearance|tenant|brand/i.test(file))
    .slice(0, 12);
  const shellComponents = files
    .filter((file) => /layout|shell|frame|app|root|nav|sidebar/i.test(basename(file.relative)))
    .map((file) => file.relative)
    .slice(0, 12);

  return {
    buttonComponents: byName(['button', 'action']),
    cardComponents: byName(['card', 'panel', 'surface', 'tile']),
    formComponents: byName(['input', 'field', 'form', 'select', 'textarea']),
    shellComponents,
    themeComponents,
    cardClassHints: collectClassHints(projectRoot, files, ['card', 'panel', 'surface', 'tile']),
  };
}

function collectClassHints(
  projectRoot: string,
  files: Array<{ absolute: string; relative: string }>,
  terms: string[],
): string[] {
  const hints = new Map<string, number>();
  for (const file of files) {
    if (!UI_TEMPLATE_EXTENSIONS.has(extname(file.absolute))) continue;
    const content = readFileSync(join(projectRoot, file.relative), 'utf-8');
    if (!terms.some((term) => content.toLowerCase().includes(term))) continue;
    const matches = content.matchAll(/\bclass(?:Name)?\s*=\s*["'`]([^"'`]+)["'`]/g);
    for (const match of matches) {
      const value = match[1].trim();
      if (!/(card|panel|surface|rounded|shadow|border|bg-|p-\d|px-|py-)/i.test(value)) continue;
      hints.set(value, (hints.get(value) ?? 0) + 1);
    }
  }
  return [...hints.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([hint]) => hint);
}

function listSourceFiles(
  projectRoot: string,
  maxFiles: number,
): Array<{ absolute: string; relative: string }> {
  const files: Array<{ absolute: string; relative: string }> = [];
  const visit = (dir: string) => {
    if (files.length >= maxFiles) return;
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (files.length >= maxFiles) return;
      if (IGNORED_DIRS.has(entry)) continue;
      const absolute = join(dir, entry);
      let stat: ReturnType<typeof statSync>;
      try {
        stat = statSync(absolute);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        visit(absolute);
      } else if (stat.isFile() && SOURCE_EXTENSIONS.has(extname(entry))) {
        files.push({ absolute, relative: normalizePath(relative(projectRoot, absolute)) });
      }
    }
  };
  visit(projectRoot);
  return files.sort((a, b) => a.relative.localeCompare(b.relative));
}

function readJsonFile<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function pathAllowed(file: string, allowedPaths: string[]): boolean {
  return allowedPaths.some((allowedPath) => pathMatches(file, allowedPath));
}

function pathMatches(file: string, pattern: string): boolean {
  const normalizedFile = normalizePath(file);
  const normalizedPattern = normalizePath(pattern);
  return normalizedFile === normalizedPattern || normalizedFile.endsWith(`/${normalizedPattern}`);
}

function normalizePath(path: string): string {
  return path.split(sep).join('/').replace(/\\/g, '/');
}

function lineColumnAt(contents: string, index: number): { line: number; column: number } {
  const before = contents.slice(0, index);
  const lines = before.split(/\r?\n/);
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

function lineAt(contents: string, line: number): string {
  return contents.split(/\r?\n/)[line - 1] ?? '';
}
