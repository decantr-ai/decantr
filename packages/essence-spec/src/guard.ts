import type { EssenceFile, StructurePage, LayoutItem } from './types.js';
import { isSimple, isSectioned } from './types.js';

export interface GuardViolation {
  rule: 'style' | 'structure' | 'layout' | 'recipe' | 'density' | 'theme-mode' | 'pattern-exists';
  severity: 'error' | 'warning';
  message: string;
  suggestion?: string;
}

export interface GuardContext {
  pageId?: string;
  style?: string;
  recipe?: string;
  layout?: string[];
  density_gap?: string;
  themeRegistry?: Map<string, { modes: string[] }>;
  patternRegistry?: Map<string, unknown>;
}

/**
 * Check if the theme supports the specified mode.
 */
function checkThemeModeCompatibility(
  essence: EssenceFile,
  context: GuardContext
): GuardViolation | null {
  if (!context.themeRegistry) return null;

  const themeId = isSimple(essence) ? essence.theme?.style : null;
  const mode = isSimple(essence) ? essence.theme?.mode : null;

  if (!themeId || !mode) return null;

  const theme = context.themeRegistry.get(themeId);
  if (!theme) {
    // Theme not found - separate validation
    return null;
  }

  if (!theme.modes.includes(mode) && mode !== 'auto') {
    const supportedModes = theme.modes.join(', ');
    const suggestion = theme.modes.length > 0
      ? `Use mode: "${theme.modes[0]}" instead, or choose a theme that supports ${mode} mode.`
      : undefined;

    return {
      rule: 'theme-mode',
      severity: 'error',
      message: `Theme "${themeId}" does not support "${mode}" mode. Supported modes: ${supportedModes}.`,
      suggestion,
    };
  }

  return null;
}

/**
 * Collect all pattern IDs from a layout item, recursively handling nested structures.
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
        // cols contains strings (pattern IDs)
        if (typeof col === 'string') {
          ids.add(col);
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
function checkPatternExistence(
  essence: EssenceFile,
  context: GuardContext
): GuardViolation[] {
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
      const suggestion = similar.length > 0
        ? `Similar patterns: ${similar.join(', ')}`
        : `Run "decantr search ${patternId}" to find alternatives.`;

      violations.push({
        rule: 'pattern-exists',
        severity: 'error',
        message: `Pattern "${patternId}" is referenced but does not exist in the registry.`,
        suggestion,
      });
    }
  }

  return violations;
}

export function evaluateGuard(essence: EssenceFile, context: GuardContext = {}): GuardViolation[] {
  const guard = essence.guard;

  if (guard.mode === 'creative') {
    return [];
  }

  const violations: GuardViolation[] = [];
  const isStrict = guard.mode === 'strict';

  // Rule 1: Style guard
  if (context.style) {
    const essenceStyle = isSimple(essence) ? essence.theme.style : null;
    if (essenceStyle && context.style !== essenceStyle && guard.enforce_style !== false) {
      violations.push({
        rule: 'style',
        severity: 'error',
        message: `Style "${context.style}" does not match essence theme "${essenceStyle}". Change the essence theme first.`,
      });
    }
  }

  // Rule 2: Structure guard (enforced in both guided and strict)
  if (context.pageId) {
    const pages = getAllPages(essence);
    const pageExists = pages.some(p => p.id === context.pageId);
    if (!pageExists) {
      violations.push({
        rule: 'structure',
        severity: 'error',
        message: `Page "${context.pageId}" does not exist in essence structure. Add it to the essence first.`,
      });
    }
  }

  // Rule 3: Layout guard (strict only)
  if (isStrict && context.pageId && context.layout) {
    const pages = getAllPages(essence);
    const page = pages.find(p => p.id === context.pageId);
    if (page) {
      const essenceLayout = page.layout.map(item =>
        typeof item === 'string' ? item : 'pattern' in item ? item.pattern : 'cols'
      );
      const proposedLayout = context.layout;
      const matches = essenceLayout.length === proposedLayout.length &&
        essenceLayout.every((item, i) => item === proposedLayout[i]);
      if (!matches) {
        violations.push({
          rule: 'layout',
          severity: 'error',
          message: `Layout for page "${context.pageId}" deviates from essence. Expected: [${essenceLayout.join(', ')}].`,
        });
      }
    }
  }

  // Rule 4: Recipe guard
  if (context.recipe && guard.enforce_recipe !== false) {
    const essenceRecipe = isSimple(essence) ? essence.theme.recipe : null;
    if (essenceRecipe && context.recipe !== essenceRecipe) {
      violations.push({
        rule: 'recipe',
        severity: 'error',
        message: `Recipe "${context.recipe}" does not match essence recipe "${essenceRecipe}".`,
      });
    }
  }

  // Rule 5: Density guard (strict only)
  if (isStrict && context.density_gap) {
    if (context.density_gap !== essence.density.content_gap) {
      violations.push({
        rule: 'density',
        severity: 'warning',
        message: `Content gap "${context.density_gap}" does not match essence density "${essence.density.content_gap}".`,
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

  return violations;
}

function getAllPages(essence: EssenceFile): StructurePage[] {
  if (isSimple(essence)) return essence.structure;
  if (isSectioned(essence)) return essence.sections.flatMap(s => s.structure);
  return [];
}
