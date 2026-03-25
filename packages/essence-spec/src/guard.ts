import type { EssenceFile, StructurePage } from './types.js';
import { isSimple, isSectioned } from './types.js';

export interface GuardViolation {
  rule: 'style' | 'structure' | 'layout' | 'recipe' | 'density';
  severity: 'error' | 'warning';
  message: string;
}

export interface GuardContext {
  pageId?: string;
  style?: string;
  recipe?: string;
  layout?: string[];
  density_gap?: string;
}

export function evaluateGuard(essence: EssenceFile, context: GuardContext): GuardViolation[] {
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

  return violations;
}

function getAllPages(essence: EssenceFile): StructurePage[] {
  if (isSimple(essence)) return essence.structure;
  if (isSectioned(essence)) return essence.sections.flatMap(s => s.structure);
  return [];
}
