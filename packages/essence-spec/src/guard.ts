import type {
  DensityLevel,
  EssenceFile,
  EssenceV3,
  EssenceV3Guard,
  LayoutItem,
  StructurePage,
} from './types.js';
import { flattenPages, isSectioned, isSimple, isV3 } from './types.js';

export interface AutoFix {
  type: 'add_page' | 'update_layout' | 'update_blueprint';
  patch: Record<string, unknown>;
}

export interface GuardViolation {
  rule:
    | 'theme'
    | 'structure'
    | 'layout'
    | 'density'
    | 'theme-mode'
    | 'pattern-exists'
    | 'accessibility'
    /**
     * v2.1 C5. Experiential interactions guard rule. Fires when patterns
     * declare `interactions: [...]` but the source tree is missing the
     * canonical implementations. Severity controlled by
     * `meta.guard.interactions_enforcement` (defaults: creative=off,
     * guided=warn, strict=error).
     */
    | 'interactions';
  severity: 'error' | 'warning';
  message: string;
  suggestion?: string;
  layer?: 'dna' | 'blueprint';
  autoFixable?: boolean;
  autoFix?: AutoFix;
}

export interface GuardContext {
  pageId?: string;
  theme?: string;
  /** @deprecated Use `theme` instead. */
  style?: string;
  layout?: string[];
  density_gap?: string;
  themeRegistry?: Map<string, { modes: string[] }>;
  patternRegistry?: Map<string, unknown>;
  a11y_issues?: string[];
  /**
   * v2.1 C5. Pre-computed list of declared interactions whose canonical
   * implementations are missing from the source tree. Produced by
   * `verifyInteractionsInSource` from @decantr/verifier; passed in here
   * so the guard rule can emit violations without owning the source-scan
   * logic. Mirrors the existing `a11y_issues` pattern.
   *
   * Each entry is a short descriptor like
   * `status-pulse (suggestion: Apply 'd-pulse' to the indicator)`.
   */
  interaction_issues?: string[];
}

/**
 * Check if the theme supports the specified mode.
 */
function checkThemeModeCompatibility(
  essence: EssenceFile,
  context: GuardContext,
): GuardViolation | null {
  if (!context.themeRegistry) return null;

  let themeId: string | null;
  let mode: string | null;
  if (isV3(essence)) {
    themeId = essence.dna.theme?.id ?? null;
    mode = essence.dna.theme?.mode ?? null;
  } else {
    themeId = isSimple(essence) ? essence.theme?.id : null;
    mode = isSimple(essence) ? essence.theme?.mode : null;
  }

  if (!themeId || !mode) return null;

  const theme = context.themeRegistry.get(themeId);
  if (!theme) {
    // Theme not found - separate validation
    return null;
  }

  if (!theme.modes.includes(mode) && mode !== 'auto') {
    const supportedModes = theme.modes.join(', ');
    const suggestion =
      theme.modes.length > 0
        ? `Use mode: "${theme.modes[0]}" instead, or choose a theme that supports ${mode} mode.`
        : undefined;

    return {
      rule: 'theme-mode',
      severity: 'error',
      message: `Theme "${themeId}" does not support "${mode}" mode. Supported modes: ${supportedModes}.`,
      suggestion,
      ...(isV3(essence) ? { layer: 'dna' as const, autoFixable: false } : {}),
    };
  }

  return null;
}

/**
 * Collect all pattern IDs from a layout item, recursively handling nested structures.
 * Handles cols entries that are either string ids OR PatternRef objects
 * (the schema permits mixing). Without the object branch, PatternRef cols
 * silently dropped from the registry-existence check, masking missing
 * patterns.
 */
function collectPatternIds(item: LayoutItem, ids: Set<string>): void {
  if (typeof item === 'string') {
    ids.add(item);
    return;
  }
  if (typeof item === 'object' && item !== null) {
    if ('pattern' in item && typeof item.pattern === 'string') {
      ids.add(item.pattern);
    }
    if ('cols' in item && Array.isArray(item.cols)) {
      for (const col of item.cols) {
        if (typeof col === 'string') {
          ids.add(col);
        } else if (
          col &&
          typeof col === 'object' &&
          'pattern' in col &&
          typeof (col as { pattern: unknown }).pattern === 'string'
        ) {
          ids.add((col as { pattern: string }).pattern);
        }
      }
    }
  }
}

/**
 * Find similar pattern IDs in the registry for suggestion.
 */
function findSimilarPatterns(target: string, registry: Map<string, unknown>): string[] {
  const similar: string[] = [];
  const targetLower = target.toLowerCase();

  for (const id of registry.keys()) {
    const idLower = id.toLowerCase();
    // Simple similarity: contains target or target contains id
    if (idLower.includes(targetLower) || targetLower.includes(idLower)) {
      similar.push(id);
    }
  }

  return similar.slice(0, 3); // Top 3 suggestions
}

/**
 * Check if all referenced patterns exist in the registry.
 */
function checkPatternExistence(essence: EssenceFile, context: GuardContext): GuardViolation[] {
  if (!context.patternRegistry) return [];

  const violations: GuardViolation[] = [];
  const referencedPatterns = new Set<string>();

  // Collect all pattern references from structure
  const pages = getAllPages(essence);
  for (const page of pages) {
    for (const item of page.layout || []) {
      collectPatternIds(item, referencedPatterns);
    }
  }

  // Check each pattern exists
  for (const patternId of referencedPatterns) {
    if (!context.patternRegistry.has(patternId)) {
      // Find similar patterns for suggestion
      const similar = findSimilarPatterns(patternId, context.patternRegistry);
      const suggestion =
        similar.length > 0
          ? `Similar patterns: ${similar.join(', ')}`
          : `Run "decantr search ${patternId}" to find alternatives.`;

      violations.push({
        rule: 'pattern-exists',
        severity: isV3(essence) ? 'warning' : 'error',
        message: `Pattern "${patternId}" is referenced but does not exist in the registry.`,
        suggestion,
        ...(isV3(essence) ? { layer: 'blueprint' as const, autoFixable: false } : {}),
      });
    }
  }

  return violations;
}

/**
 * Check accessibility compliance based on declared WCAG level.
 */
function checkAccessibility(essence: EssenceFile, context: GuardContext): GuardViolation | null {
  const accessibility = isV3(essence)
    ? essence.dna.accessibility
    : 'accessibility' in essence
      ? essence.accessibility
      : undefined;

  if (!accessibility?.wcag_level || accessibility.wcag_level === 'none') {
    return null;
  }

  if (context.a11y_issues && context.a11y_issues.length > 0) {
    const issueList = context.a11y_issues.slice(0, 3).join(', ');
    const moreCount =
      context.a11y_issues.length > 3 ? ` (+${context.a11y_issues.length - 3} more)` : '';

    return {
      rule: 'accessibility',
      severity: 'error',
      message: `WCAG ${accessibility.wcag_level} compliance required. Issues found: ${issueList}${moreCount}`,
      suggestion:
        'Fix accessibility issues before proceeding. Run an accessibility audit for details.',
      ...(isV3(essence) ? { layer: 'dna' as const, autoFixable: false } : {}),
    };
  }

  return null;
}

/**
 * v2.1 C5. Experiential interactions guard rule (8th rule). Patterns
 * declare runtime interactions in pattern.v2.json (e.g., status-pulse,
 * drag-nodes, hover-tooltip). When the source tree doesn't implement
 * those interactions, this rule emits a violation. Source scanning
 * happens in @decantr/verifier; pre-computed results land here as
 * `context.interaction_issues`.
 *
 * Severity is governed by `meta.guard.interactions_enforcement`:
 *   - 'error'  → emits as error (build fails)
 *   - 'warn'   → emits as warning (build passes, surfaces in CLI)
 *   - 'off'    → suppresses entirely
 *
 * Defaults when the field is omitted, derived from guard.mode:
 *   - creative → 'off'
 *   - guided   → 'warn'
 *   - strict   → 'error'
 */
function checkInteractions(essence: EssenceFile, context: GuardContext): GuardViolation | null {
  if (!context.interaction_issues || context.interaction_issues.length === 0) {
    return null;
  }

  const guard = isV3(essence) ? essence.meta.guard : null;
  if (!guard) return null; // v2 essences don't carry the field — skip silently.

  // Resolve enforcement: explicit field wins, otherwise mode-derived default.
  let enforcement: 'error' | 'warn' | 'off';
  if (guard.interactions_enforcement) {
    enforcement = guard.interactions_enforcement;
  } else if (guard.mode === 'strict') {
    enforcement = 'error';
  } else if (guard.mode === 'guided') {
    enforcement = 'warn';
  } else {
    enforcement = 'off';
  }

  if (enforcement === 'off') return null;

  const issueList = context.interaction_issues.slice(0, 3).join('; ');
  const moreCount =
    context.interaction_issues.length > 3
      ? ` (+${context.interaction_issues.length - 3} more)`
      : '';

  return {
    rule: 'interactions',
    severity: enforcement === 'error' ? 'error' : 'warning',
    message: `Declared pattern interactions are not implemented in source: ${issueList}${moreCount}`,
    suggestion:
      'See "Interaction Requirements" in DECANTR.md for canonical implementations. Each declared interaction maps to a treatment class or handler pattern.',
    layer: 'blueprint' as const,
    autoFixable: false,
  };
}

export function evaluateGuard(essence: EssenceFile, context: GuardContext = {}): GuardViolation[] {
  const guard = isV3(essence) ? essence.meta.guard : essence.guard;

  if (guard.mode === 'creative') {
    return [];
  }

  const violations: GuardViolation[] = [];
  const isStrict = guard.mode === 'strict';

  // Rule 1: Theme guard
  const requestedTheme = context.theme ?? context.style;
  if (requestedTheme) {
    let essenceThemeId: string | null;
    if (isV3(essence)) {
      essenceThemeId = essence.dna.theme.id;
    } else {
      essenceThemeId = isSimple(essence) ? essence.theme.id : null;
    }
    const enforceStyle = isV3(essence)
      ? true
      : (guard as import('./types.js').Guard).enforce_style !== false;
    if (essenceThemeId && requestedTheme !== essenceThemeId && enforceStyle) {
      violations.push({
        rule: 'theme',
        severity: 'error',
        message: `Theme "${requestedTheme}" does not match essence theme "${essenceThemeId}". Change the essence theme first.`,
        ...(isV3(essence) ? { layer: 'dna' as const, autoFixable: false } : {}),
      });
    }
  }

  // Rule 2: Structure guard (enforced in both guided and strict)
  if (context.pageId) {
    const pages = getAllPages(essence);
    const pageExists = pages.some((p) => p.id === context.pageId);
    if (!pageExists) {
      violations.push({
        rule: 'structure',
        severity: isV3(essence) ? 'warning' : 'error',
        message: `Page "${context.pageId}" does not exist in essence structure. Add it to the essence first.`,
        ...(isV3(essence)
          ? {
              layer: 'blueprint' as const,
              autoFixable: true,
              autoFix: { type: 'add_page' as const, patch: { id: context.pageId } },
            }
          : {}),
      });
    }
  }

  // Rule 3: Layout guard (strict only)
  if (isStrict && context.pageId && context.layout) {
    const pages = getAllPages(essence);
    const page = pages.find((p) => p.id === context.pageId);
    if (page) {
      const essenceLayout = page.layout.map((item) =>
        typeof item === 'string' ? item : 'pattern' in item ? item.pattern : 'cols',
      );
      const proposedLayout = context.layout;
      const matches =
        essenceLayout.length === proposedLayout.length &&
        essenceLayout.every((item, i) => item === proposedLayout[i]);
      if (!matches) {
        violations.push({
          rule: 'layout',
          severity: isV3(essence) ? 'warning' : 'error',
          message: `Layout for page "${context.pageId}" deviates from essence. Expected: [${essenceLayout.join(', ')}].`,
          ...(isV3(essence)
            ? {
                layer: 'blueprint' as const,
                autoFixable: true,
                autoFix: {
                  type: 'update_layout' as const,
                  patch: { page: context.pageId, layout: context.layout },
                },
              }
            : {}),
        });
      }
    }
  }

  // Rule 4: Density guard (strict only)
  if (isStrict && context.density_gap) {
    let expectedGap: string;
    if (isV3(essence)) {
      // Check per-page dna_overrides for density if a pageId is provided
      const overriddenDensity = getPageDensityOverride(essence, context.pageId);
      expectedGap = overriddenDensity ?? essence.dna.spacing.content_gap;
    } else {
      expectedGap = essence.density.content_gap;
    }
    if (context.density_gap !== expectedGap) {
      violations.push({
        rule: 'density',
        severity: 'warning',
        message: `Content gap "${context.density_gap}" does not match essence density "${expectedGap}".`,
        ...(isV3(essence) ? { layer: 'dna' as const, autoFixable: false } : {}),
      });
    }
  }

  // Rule 6: Theme/mode compatibility (always checked when registry available)
  const themeModeViolation = checkThemeModeCompatibility(essence, context);
  if (themeModeViolation) {
    violations.push(themeModeViolation);
  }

  // Rule 7: Pattern existence (always checked when registry available)
  const patternViolations = checkPatternExistence(essence, context);
  violations.push(...patternViolations);

  // Rule 8: Accessibility (when wcag_level is set, guided and strict modes)
  const accessibilityViolation = checkAccessibility(essence, context);
  if (accessibilityViolation) {
    violations.push(accessibilityViolation);
  }

  // Rule 9: Experiential interactions (v2.1 C5). Only fires when caller
  // pre-computed `interaction_issues` from the source-tree scan; severity
  // governed by `meta.guard.interactions_enforcement` with mode-derived
  // defaults. See checkInteractions for the full resolution table.
  const interactionsViolation = checkInteractions(essence, context);
  if (interactionsViolation) {
    violations.push(interactionsViolation);
  }

  // Apply v3 enforcement level filtering
  if (isV3(essence)) {
    const v3Guard = guard as EssenceV3Guard;

    // DNA enforcement
    if (v3Guard.dna_enforcement === 'off') {
      // Remove all DNA-layer violations
      return violations.filter((v) => v.layer !== 'dna');
    }
    if (v3Guard.dna_enforcement === 'warn') {
      // Downgrade DNA-layer violations to warning severity
      for (const v of violations) {
        if (v.layer === 'dna') {
          v.severity = 'warning';
        }
      }
    }

    // Blueprint enforcement
    if (v3Guard.blueprint_enforcement === 'off') {
      // Remove all blueprint-layer violations
      return violations.filter((v) => v.layer !== 'blueprint');
    }
  }

  return violations;
}

function getAllPages(essence: EssenceFile): StructurePage[] {
  if (isV3(essence)) {
    // Map v3 BlueprintPages to StructurePage shape for guard evaluation
    const pages = flattenPages(essence.blueprint);
    return pages.map((page) => ({
      id: page.id,
      shell: page.shell_override ?? essence.blueprint.shell ?? '',
      layout: page.layout,
      ...(page.surface ? { surface: page.surface } : {}),
    }));
  }
  if (isSimple(essence)) return essence.structure;
  if (isSectioned(essence)) return essence.sections.flatMap((s) => s.structure);
  throw new Error('Unknown EssenceFile type');
}

/** Get per-page density override from v3 blueprint, if set. */
function getPageDensityOverride(essence: EssenceV3, pageId?: string): string | undefined {
  if (!pageId) return undefined;
  const pages = flattenPages(essence.blueprint);
  const page = pages.find((p) => p.id === pageId);
  if (!page?.dna_overrides?.density) return undefined;
  // Map density level to a content_gap value
  const densityGapMap: Record<DensityLevel, string> = {
    compact: '2',
    comfortable: '4',
    spacious: '6',
  };
  return densityGapMap[page.dna_overrides.density] ?? undefined;
}
