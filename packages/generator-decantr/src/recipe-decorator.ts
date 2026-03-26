// AUTO: Recipe visual decoration resolver — maps recipe visual_effects and
// pattern_overrides into concrete CSS classes for Card and pattern wrappers.
// This is a build-time resolver; emitted code also gets a getRecipeDecoration()
// runtime helper for data-driven decoration without hardcoding per recipe.

import type { IRVisualEffect } from '@decantr/generator-core';

/** Subset of recipe visual_effects used for decoration resolution */
export interface VisualEffectsConfig {
  enabled: boolean;
  intensity: string;
  type_mapping: Record<string, string[]>;
  component_fallback: Record<string, string>;
  intensity_values?: Record<string, Record<string, string>>;
}

/** Subset of recipe carafe used for shell-level decorations */
export interface CarafeConfig {
  root?: string;
  nav?: string;
  header?: string;
  brand?: string;
}

/** Full decoration result for a single pattern */
export interface PatternDecorations {
  /** Classes to apply on the Card wrapper (from component_fallback → type_mapping) */
  cardClasses: string[];
  /** Classes from pattern_overrides background */
  backgroundClasses: string[];
  /** CSS custom property overrides from intensity_values */
  intensityVars: Record<string, string>;
}

/**
 * Resolve decoration classes for a pattern based on recipe visual_effects
 * and pattern_overrides. Returns empty arrays when effects are disabled or
 * the recipe is missing.
 */
export function resolvePatternDecorations(
  patternId: string,
  components: string[],
  visualEffects: VisualEffectsConfig | null | undefined,
  patternOverrides: Record<string, { background?: string[] }> | null | undefined,
): PatternDecorations {
  const result: PatternDecorations = {
    cardClasses: [],
    backgroundClasses: [],
    intensityVars: {},
  };

  if (!visualEffects?.enabled) return result;

  // AUTO: Resolve component_fallback → type_mapping chain.
  // Each component in the pattern gets mapped to a type key via component_fallback,
  // then the type key resolves to decorator classes via type_mapping.
  const seenTypes = new Set<string>();
  for (const comp of components) {
    const typeKey = visualEffects.component_fallback[comp];
    if (typeKey && !seenTypes.has(typeKey)) {
      seenTypes.add(typeKey);
      const decorators = visualEffects.type_mapping[typeKey];
      if (decorators) {
        result.cardClasses.push(...decorators);
      }
    }
  }

  // AUTO: Apply pattern_overrides background classes for this specific pattern
  const overrides = patternOverrides?.[patternId];
  if (overrides?.background) {
    result.backgroundClasses.push(...overrides.background);
  }

  // AUTO: Resolve intensity CSS variables from the recipe's active intensity level
  const level = visualEffects.intensity;
  const vars = visualEffects.intensity_values?.[level];
  if (vars) {
    Object.assign(result.intensityVars, vars);
  }

  return result;
}

/**
 * Resolve shell-level decoration classes from recipe carafe.
 * Returns empty strings when carafe is missing.
 */
export function resolveShellDecorations(carafe: CarafeConfig | null | undefined): {
  root: string;
  nav: string;
  header: string;
  brand: string;
} {
  return {
    root: carafe?.root || '',
    nav: carafe?.nav || '',
    header: carafe?.header || '',
    brand: carafe?.brand || '',
  };
}

/**
 * Convert PatternDecorations into an IRVisualEffect, merging card and
 * background classes into the decorators array.
 */
export function toIRVisualEffect(decorations: PatternDecorations): IRVisualEffect | null {
  const decorators = [...decorations.cardClasses, ...decorations.backgroundClasses];
  if (decorators.length === 0 && Object.keys(decorations.intensityVars).length === 0) {
    return null;
  }
  return {
    decorators,
    intensity: decorations.intensityVars,
  };
}

/**
 * Emit a runtime getRecipeDecoration() helper function for the generated page.
 * This allows decoration to remain data-driven: the recipe JSON drives the
 * classes rather than hardcoding per recipe at build time.
 */
export function emitRecipeDecorationHelper(
  visualEffects: VisualEffectsConfig | null | undefined,
  patternOverrides: Record<string, { background?: string[] }> | null | undefined,
): string {
  if (!visualEffects?.enabled) return '';

  // AUTO: Emit a self-contained helper that pattern code can call at runtime
  // to get decoration classes for a given component or pattern.
  const typeMapping = JSON.stringify(visualEffects.type_mapping);
  const fallback = JSON.stringify(visualEffects.component_fallback);
  const overrides = JSON.stringify(patternOverrides || {});
  const intensityLevel = visualEffects.intensity;
  const intensityVars = JSON.stringify(visualEffects.intensity_values?.[intensityLevel] || {});

  return `// AUTO: Runtime recipe decoration resolver
function getRecipeDecoration(patternId, components) {
  const typeMapping = ${typeMapping};
  const fallback = ${fallback};
  const overrides = ${overrides};
  const intensityVars = ${intensityVars};

  const classes = [];
  const seen = new Set();
  for (const comp of (components || [])) {
    const typeKey = fallback[comp];
    if (typeKey && !seen.has(typeKey)) {
      seen.add(typeKey);
      const decs = typeMapping[typeKey];
      if (decs) classes.push(...decs);
    }
  }
  const bg = overrides[patternId]?.background;
  if (bg) classes.push(...bg);
  return { classes: classes.join(' '), style: intensityVars };
}`;
}
