import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';
import { evaluateGuard, isV3, validateEssence } from '@decantr/essence-spec';
import type { EssenceFile, EssenceV3, GuardViolation } from '@decantr/essence-spec';
import type { ReviewExecutionPack } from '@decantr/core';

export type VerificationSeverity = 'error' | 'warn' | 'info';

export interface VerificationFinding {
  id: string;
  category: string;
  severity: VerificationSeverity;
  message: string;
  evidence: string[];
  target?: string;
  file?: string;
  rule?: string;
  suggestedFix?: string;
}

export interface VerificationScore {
  category: string;
  focusArea: string;
  score: number;
  details: string;
  suggestions: string[];
}

interface PackManifestEntry {
  id: string;
  markdown: string;
  json: string;
}

export interface PackManifest {
  $schema?: string;
  version: string;
  generatedAt: string;
  scaffold: PackManifestEntry | null;
  review?: PackManifestEntry | null;
  sections: Array<PackManifestEntry & { pageIds: string[] }>;
  pages: Array<PackManifestEntry & { sectionId: string | null; sectionRole: string | null }>;
  mutations?: Array<PackManifestEntry & { mutationType: string }>;
}

export interface ProjectAuditReport {
  projectRoot: string;
  valid: boolean;
  essence: EssenceFile | null;
  reviewPack: ReviewExecutionPack | null;
  packManifest: PackManifest | null;
  findings: VerificationFinding[];
  summary: {
    errorCount: number;
    warnCount: number;
    infoCount: number;
    essenceVersion: string | null;
    reviewPackPresent: boolean;
    packManifestPresent: boolean;
    pageCount: number;
  };
}

export interface FileCritiqueReport {
  file: string;
  overall: number;
  scores: VerificationScore[];
  findings: VerificationFinding[];
  focusAreas: string[];
  reviewPack: ReviewExecutionPack | null;
}

const DEFAULT_FOCUS_AREAS = [
  'route-topology',
  'theme-consistency',
  'treatment-usage',
  'accessibility',
  'responsive-design',
];

const TREATMENT_CLASSES = ['d-interactive', 'd-surface', 'd-data', 'd-control', 'd-section', 'd-annotation', 'd-label'];
const PERSONALITY_UTILS = ['neon-glow', 'neon-text-glow', 'neon-border-glow', 'mono-data', 'status-ring', 'entrance-fade'];

function scoreRatio(numerator: number, denominator: number): number {
  if (denominator <= 0) return 3;
  return Math.min(5, Math.max(1, Math.round((numerator / denominator) * 5)));
}

function readJsonIfExists<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function loadReviewPack(projectRoot: string): ReviewExecutionPack | null {
  return readJsonIfExists<ReviewExecutionPack>(join(projectRoot, '.decantr', 'context', 'review-pack.json'));
}

function loadPackManifest(projectRoot: string): PackManifest | null {
  return readJsonIfExists<PackManifest>(join(projectRoot, '.decantr', 'context', 'pack-manifest.json'));
}

function readTextIfExists(path: string): string {
  try {
    return existsSync(path) ? readFileSync(path, 'utf-8') : '';
  } catch {
    return '';
  }
}

function buildRegistryContext(projectRoot: string): {
  themeRegistry: Map<string, { modes: string[] }>;
  patternRegistry: Map<string, unknown>;
} {
  const themeRegistry = new Map<string, { modes: string[] }>();
  const patternRegistry = new Map<string, unknown>();
  const cacheDir = join(projectRoot, '.decantr', 'cache');
  const customDir = join(projectRoot, '.decantr', 'custom');

  const cachedThemesDir = join(cacheDir, '@official', 'themes');
  try {
    if (existsSync(cachedThemesDir)) {
      for (const file of readdirSync(cachedThemesDir).filter(name => name.endsWith('.json') && name !== 'index.json')) {
        const data = JSON.parse(readFileSync(join(cachedThemesDir, file), 'utf-8')) as { id?: string; modes?: string[] };
        if (data.id && !themeRegistry.has(data.id)) {
          themeRegistry.set(data.id, { modes: data.modes || ['light', 'dark'] });
        }
      }
    }
  } catch { /* best effort */ }

  const customThemesDir = join(customDir, 'themes');
  try {
    if (existsSync(customThemesDir)) {
      for (const file of readdirSync(customThemesDir).filter(name => name.endsWith('.json'))) {
        const data = JSON.parse(readFileSync(join(customThemesDir, file), 'utf-8')) as { id?: string; modes?: string[] };
        if (data.id) {
          themeRegistry.set(`custom:${data.id}`, { modes: data.modes || ['light', 'dark'] });
        }
      }
    }
  } catch { /* best effort */ }

  const cachedPatternsDir = join(cacheDir, '@official', 'patterns');
  try {
    if (existsSync(cachedPatternsDir)) {
      for (const file of readdirSync(cachedPatternsDir).filter(name => name.endsWith('.json') && name !== 'index.json')) {
        const data = JSON.parse(readFileSync(join(cachedPatternsDir, file), 'utf-8')) as { id?: string };
        if (data.id && !patternRegistry.has(data.id)) {
          patternRegistry.set(data.id, data);
        }
      }
    }
  } catch { /* best effort */ }

  return { themeRegistry, patternRegistry };
}

function guardViolationToFinding(violation: GuardViolation): VerificationFinding {
  return {
    id: `guard-${violation.rule}`,
    category: violation.layer === 'dna' ? 'DNA Guard' : 'Blueprint Guard',
    severity: violation.severity === 'error' ? 'error' : 'warn',
    message: violation.message,
    evidence: [`Rule: ${violation.rule}`],
    rule: violation.rule,
    suggestedFix: violation.suggestion,
  };
}

function countPages(essence: EssenceFile | null): number {
  if (!essence) return 0;
  if (isV3(essence)) {
    const v3 = essence as EssenceV3;
    if (v3.blueprint.sections?.length) {
      return v3.blueprint.sections.reduce((sum, section) => sum + section.pages.length, 0);
    }
    return v3.blueprint.pages?.length ?? 0;
  }
  if ('structure' in essence && Array.isArray(essence.structure)) {
    return essence.structure.length;
  }
  return 0;
}

function makeFinding(input: VerificationFinding): VerificationFinding {
  return input;
}

export async function auditProject(projectRoot: string): Promise<ProjectAuditReport> {
  const essencePath = join(projectRoot, 'decantr.essence.json');
  const findings: VerificationFinding[] = [];
  const reviewPack = loadReviewPack(projectRoot);
  const packManifest = loadPackManifest(projectRoot);

  if (!existsSync(essencePath)) {
    findings.push(makeFinding({
      id: 'essence-missing',
      category: 'Project Contract',
      severity: 'error',
      message: 'No decantr.essence.json file was found.',
      evidence: [essencePath],
      suggestedFix: 'Run `decantr init` or scaffold the project again so the essence exists.',
    }));

    return {
      projectRoot,
      valid: false,
      essence: null,
      reviewPack,
      packManifest,
      findings,
      summary: {
        errorCount: 1,
        warnCount: 0,
        infoCount: 0,
        essenceVersion: null,
        reviewPackPresent: Boolean(reviewPack),
        packManifestPresent: Boolean(packManifest),
        pageCount: 0,
      },
    };
  }

  let essence: EssenceFile | null = null;
  try {
    essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as EssenceFile;
  } catch (error) {
    findings.push(makeFinding({
      id: 'essence-parse-error',
      category: 'Project Contract',
      severity: 'error',
      message: `Failed to parse decantr.essence.json: ${(error as Error).message}`,
      evidence: [essencePath],
      suggestedFix: 'Repair the essence JSON before auditing the project.',
    }));
  }

  if (essence) {
    const validation = validateEssence(essence);
    if (!validation.valid) {
      for (const issue of validation.errors) {
        findings.push(makeFinding({
          id: 'essence-validation',
          category: 'Schema Validation',
          severity: 'error',
          message: issue,
          evidence: [essencePath],
          suggestedFix: 'Resolve the schema violation and rerun `decantr validate`.',
        }));
      }
    }

    const { themeRegistry, patternRegistry } = buildRegistryContext(projectRoot);
    for (const violation of evaluateGuard(essence, { themeRegistry, patternRegistry })) {
      findings.push(guardViolationToFinding(violation));
    }
  }

  if (!packManifest) {
    findings.push(makeFinding({
      id: 'pack-manifest-missing',
      category: 'Execution Packs',
      severity: 'warn',
      message: 'Compiled execution pack manifest is missing.',
      evidence: [join(projectRoot, '.decantr', 'context', 'pack-manifest.json')],
      suggestedFix: 'Run `decantr refresh` to regenerate scaffold, review, mutation, section, and page packs.',
    }));
  } else {
    if (!packManifest.scaffold) {
      findings.push(makeFinding({
        id: 'scaffold-pack-missing',
        category: 'Execution Packs',
        severity: 'warn',
        message: 'Compiled scaffold pack is missing from the manifest.',
        evidence: ['pack-manifest.json'],
        suggestedFix: 'Regenerate the context bundle with `decantr refresh`.',
      }));
    }
    if (!packManifest.review) {
      findings.push(makeFinding({
        id: 'review-pack-missing',
        category: 'Execution Packs',
        severity: 'warn',
        message: 'Compiled review pack is missing from the manifest.',
        evidence: ['pack-manifest.json'],
        suggestedFix: 'Regenerate the context bundle so critique tasks have a compiled review contract.',
      }));
    }
    if ((packManifest.mutations ?? []).length === 0) {
      findings.push(makeFinding({
        id: 'mutation-packs-missing',
        category: 'Execution Packs',
        severity: 'info',
        message: 'No mutation packs were found in the manifest.',
        evidence: ['pack-manifest.json'],
        suggestedFix: 'Run `decantr refresh` to regenerate mutation task packs.',
      }));
    }
  }

  if (!reviewPack) {
    findings.push(makeFinding({
      id: 'review-pack-file-missing',
      category: 'Review Contract',
      severity: 'warn',
      message: 'The compiled review pack file is missing.',
      evidence: [join(projectRoot, '.decantr', 'context', 'review-pack.json')],
      suggestedFix: 'Regenerate context so critique consumers can anchor findings to the compiled review contract.',
    }));
  }

  const summary = {
    errorCount: findings.filter(finding => finding.severity === 'error').length,
    warnCount: findings.filter(finding => finding.severity === 'warn').length,
    infoCount: findings.filter(finding => finding.severity === 'info').length,
    essenceVersion: essence ? String(essence.version) : null,
    reviewPackPresent: Boolean(reviewPack),
    packManifestPresent: Boolean(packManifest),
    pageCount: countPages(essence),
  };

  return {
    projectRoot,
    valid: summary.errorCount === 0,
    essence,
    reviewPack,
    packManifest,
    findings,
    summary,
  };
}

function buildDecoratorInventory(treatmentsCss: string): string[] {
  const decoratorMatches = treatmentsCss.match(/\.([\w-]+)\s*\{/g) || [];
  return decoratorMatches
    .map(match => match.slice(1).replace(/\s*\{$/, ''))
    .filter(name => !name.startsWith('d-') && !PERSONALITY_UTILS.includes(name));
}

function resolveFocusAreas(reviewPack: ReviewExecutionPack | null): string[] {
  return reviewPack?.data.focusAreas?.length ? reviewPack.data.focusAreas : DEFAULT_FOCUS_AREAS;
}

export async function critiqueFile(filePath: string, projectRoot: string): Promise<FileCritiqueReport> {
  const resolvedPath = isAbsolute(filePath) ? filePath : resolve(projectRoot, filePath);
  const code = await readFile(resolvedPath, 'utf-8');
  const codeLower = code.toLowerCase();
  const treatmentsCss = readTextIfExists(join(projectRoot, 'src', 'styles', 'treatments.css'));
  const reviewPack = loadReviewPack(projectRoot);
  const focusAreas = resolveFocusAreas(reviewPack);
  const findings: VerificationFinding[] = [];
  const scores: VerificationScore[] = [];

  const usedTreatments = TREATMENT_CLASSES.filter(token => code.includes(token));
  const treatmentSuggestions = TREATMENT_CLASSES.filter(token => !code.includes(token)).map(token => `Consider using \`${token}\` where appropriate.`);
  scores.push({
    category: 'Treatment Usage',
    focusArea: 'treatment-usage',
    score: scoreRatio(usedTreatments.length, TREATMENT_CLASSES.length),
    details: `${usedTreatments.length}/${TREATMENT_CLASSES.length} base treatments used: ${usedTreatments.join(', ') || 'none'}`,
    suggestions: treatmentSuggestions,
  });
  if (focusAreas.includes('treatment-usage') && usedTreatments.length === 0) {
    findings.push(makeFinding({
      id: 'treatment-usage-missing',
      category: 'Treatment Usage',
      severity: 'warn',
      message: 'No Decantr treatment classes were detected in the reviewed file.',
      evidence: [resolvedPath, 'Expected tokens include d-interactive, d-surface, d-data, d-control, d-section, d-annotation, d-label.'],
      file: resolvedPath,
      suggestedFix: 'Apply the compiled treatment vocabulary instead of hand-rolled utility styling.',
    }));
  }

  const decoratorNames = buildDecoratorInventory(treatmentsCss);
  const usedDecorators = decoratorNames.filter(name => code.includes(name));
  const usesCssVars = code.includes('var(--');
  scores.push({
    category: 'Theme Consistency',
    focusArea: 'theme-consistency',
    score: decoratorNames.length > 0
      ? scoreRatio((usedDecorators.length > 0 ? 1 : 0) + (usesCssVars ? 1 : 0), 2)
      : (usesCssVars ? 4 : 2),
    details: `Decorators used: ${usedDecorators.join(', ') || 'none'}; CSS vars: ${usesCssVars ? 'yes' : 'no'}`,
    suggestions: [
      ...(!usesCssVars ? ['Prefer CSS variable references over hardcoded visual values.'] : []),
      ...((decoratorNames.length > 0 && usedDecorators.length === 0) ? ['Use theme decorators from treatments.css when they fit the component intent.'] : []),
    ],
  });
  if (focusAreas.includes('theme-consistency') && !usesCssVars && usedDecorators.length === 0) {
    findings.push(makeFinding({
      id: 'theme-consistency-weak',
      category: 'Theme Consistency',
      severity: 'warn',
      message: 'The file does not appear to use theme decorators or CSS variables from the compiled contract.',
      evidence: [resolvedPath, `Decorators available: ${decoratorNames.slice(0, 5).join(', ') || 'none'}`],
      file: resolvedPath,
      suggestedFix: 'Anchor styling to tokens.css and treatments.css instead of local hardcoded values.',
    }));
  }

  const hasAria = codeLower.includes('aria-') || codeLower.includes('role=');
  const hasFocus = codeLower.includes('focus-visible') || codeLower.includes('focusvisible');
  const hasKeyboard = codeLower.includes('onkeydown') || codeLower.includes('onkeyup');
  scores.push({
    category: 'Accessibility',
    focusArea: 'accessibility',
    score: Math.min(5, 1 + (hasAria ? 2 : 0) + (hasFocus ? 1 : 0) + (hasKeyboard ? 1 : 0)),
    details: `ARIA: ${hasAria ? 'yes' : 'no'}, Focus: ${hasFocus ? 'yes' : 'no'}, Keyboard: ${hasKeyboard ? 'yes' : 'no'}`,
    suggestions: [
      ...(!hasAria ? ['Add ARIA roles or labels to interactive regions.'] : []),
      ...(!hasFocus ? ['Add visible focus styling for keyboard navigation.'] : []),
      ...(!hasKeyboard ? ['Add keyboard handling where interactive behavior depends on pointer events.'] : []),
    ],
  });
  if (focusAreas.includes('accessibility')) {
    if (!hasAria) {
      findings.push(makeFinding({
        id: 'accessibility-aria-missing',
        category: 'Accessibility',
        severity: 'warn',
        message: 'No ARIA roles or labels were detected in the reviewed file.',
        evidence: [resolvedPath],
        file: resolvedPath,
        suggestedFix: 'Add ARIA metadata to interactive or landmark elements.',
      }));
    }
    if (!hasKeyboard) {
      findings.push(makeFinding({
        id: 'accessibility-keyboard-missing',
        category: 'Accessibility',
        severity: 'info',
        message: 'No keyboard interaction handlers were detected in the reviewed file.',
        evidence: [resolvedPath],
        file: resolvedPath,
        suggestedFix: 'Verify interactive elements remain usable from the keyboard.',
      }));
    }
  }

  const hasMedia = codeLower.includes('@media') || codeLower.includes('usemediaquery') || codeLower.includes('breakpoint');
  const hasResponsive = codeLower.includes('sm:') || codeLower.includes('md:') || codeLower.includes('lg:') || codeLower.includes('_sm_') || codeLower.includes('_md_');
  scores.push({
    category: 'Responsive Design',
    focusArea: 'responsive-design',
    score: Math.min(5, (hasMedia ? 3 : 1) + (hasResponsive ? 2 : 0)),
    details: `Media queries: ${hasMedia ? 'yes' : 'no'}, Responsive signals: ${hasResponsive ? 'yes' : 'no'}`,
    suggestions: !hasMedia && !hasResponsive ? ['Add responsive breakpoint handling.'] : [],
  });
  if (focusAreas.includes('responsive-design') && !hasMedia && !hasResponsive) {
    findings.push(makeFinding({
      id: 'responsive-signals-missing',
      category: 'Responsive Design',
      severity: 'warn',
      message: 'No responsive breakpoint handling was detected in the reviewed file.',
      evidence: [resolvedPath],
      file: resolvedPath,
      suggestedFix: 'Add responsive layout behavior that matches the compiled route contract.',
    }));
  }

  const hasTransition = codeLower.includes('transition') || codeLower.includes('animate') || codeLower.includes('keyframe') || codeLower.includes('framer');
  const hasHover = codeLower.includes(':hover') || codeLower.includes('onmouseenter') || codeLower.includes('hover:');
  scores.push({
    category: 'Motion & Interaction',
    focusArea: 'motion-interaction',
    score: Math.min(5, (hasTransition ? 3 : 1) + (hasHover ? 2 : 0)),
    details: `Transitions: ${hasTransition ? 'yes' : 'no'}, Hover states: ${hasHover ? 'yes' : 'no'}`,
    suggestions: !hasTransition ? ['Add transitions for interactive state changes where appropriate.'] : [],
  });

  const packManifest = loadPackManifest(projectRoot);
  const knownRoutes = reviewPack?.data.routes.length ?? packManifest?.pages.length ?? 0;
  scores.push({
    category: 'Topology Context',
    focusArea: 'route-topology',
    score: reviewPack ? 5 : packManifest ? 4 : 1,
    details: reviewPack
      ? `Compiled review contract covers ${knownRoutes} routes.`
      : packManifest
        ? `Pack manifest is available for ${knownRoutes} pages, but the review pack is missing.`
        : 'No compiled route context was available during critique.',
    suggestions: reviewPack ? [] : ['Run `decantr refresh` so critique starts from a compiled review contract.'],
  });
  if (focusAreas.includes('route-topology') && !reviewPack) {
    findings.push(makeFinding({
      id: 'review-pack-missing-for-critique',
      category: 'Route Topology',
      severity: 'warn',
      message: 'Critique ran without a compiled review pack.',
      evidence: [join(projectRoot, '.decantr', 'context', 'review-pack.json')],
      file: resolvedPath,
      suggestedFix: 'Regenerate execution packs so critique findings can anchor to the compiled route contract.',
    }));
  }

  const overall = Math.round((scores.reduce((sum, score) => sum + score.score, 0) / scores.length) * 10) / 10;
  return {
    file: resolvedPath,
    overall,
    scores,
    findings,
    focusAreas,
    reviewPack,
  };
}
