import type {
  IRPageNode, IRPatternNode, IRGridNode, IRWiring,
  IRCardWrapping, IRPatternMeta, IRVisualEffect, IRNode,
} from './types.js';
import type { StructurePage, LayoutItem, PatternRef, ColumnLayout } from '@decantr/essence-spec';
import type { Pattern, Recipe, ResolvedPreset } from '@decantr/registry';

export interface ResolvedPatternEntry {
  pattern: Pattern;
  preset: ResolvedPreset;
}

function isPatternRef(item: LayoutItem): item is PatternRef {
  return typeof item === 'object' && 'pattern' in item;
}

function isColumnLayout(item: LayoutItem): item is ColumnLayout {
  return typeof item === 'object' && 'cols' in item;
}

function pascalCase(str: string): string {
  return str.split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

function getPatternAlias(item: LayoutItem): string {
  if (typeof item === 'string') return item;
  if (isPatternRef(item)) return item.as || item.pattern;
  return '';
}

function getPatternId(item: LayoutItem): string {
  if (typeof item === 'string') return item;
  if (isPatternRef(item)) return item.pattern;
  return '';
}

function shouldWrapInCard(
  pattern: Pattern,
  preset: ResolvedPreset,
  recipe: Recipe | null,
): boolean {
  // Hero/row/stack layouts are standalone
  const layout = preset.layout.layout;
  if (layout === 'hero' || layout === 'row') return false;

  // Pattern explicitly opts out
  if (pattern.contained === false) return false;

  // Recipe says no cards
  const cardWrapping = recipe?.spatial_hints?.card_wrapping;
  if (cardWrapping === 'none') return false;

  // Minimal: only wrap if pattern has presets (complex pattern)
  if (cardWrapping === 'minimal') {
    return Object.keys(pattern.presets).length > 0;
  }

  // Default: wrap
  return true;
}

function buildCardWrapping(
  pattern: Pattern,
  recipe: Recipe | null,
): IRCardWrapping {
  const mode = recipe?.spatial_hints?.card_wrapping || 'always';
  const overrides = recipe?.pattern_overrides?.[pattern.id];
  return {
    mode: mode as IRCardWrapping['mode'],
    headerLabel: pattern.name,
    background: overrides?.background?.join(' '),
  };
}

function buildPatternNode(
  patternId: string,
  alias: string,
  resolved: ResolvedPatternEntry | undefined,
  wiring: IRWiring | null,
  recipe: Recipe | null,
  density: { gap: string },
): IRPatternNode {
  const pattern = resolved?.pattern;
  const preset = resolved?.preset;

  const layout = preset?.layout.layout || 'column';
  const isStandalone = layout === 'hero' || layout === 'row';
  const contained = pattern && preset ? shouldWrapInCard(pattern, preset, recipe) : false;
  const components = pattern?.components || [];

  const patternMeta: IRPatternMeta = {
    patternId,
    preset: preset?.preset || 'default',
    alias,
    layout,
    contained,
    standalone: isStandalone,
    code: preset?.code ? { imports: preset.code.imports, example: preset.code.example } : null,
    components,
  };

  const card = contained && !isStandalone && pattern
    ? buildCardWrapping(pattern, recipe)
    : null;

  const wireProps = wiring?.props[alias] || wiring?.props[patternId] || null;

  return {
    type: 'pattern',
    id: alias,
    children: [],
    pattern: patternMeta,
    card,
    visualEffects: null,
    wireProps,
    spatial: { gap: density.gap },
  };
}

/** Build IR tree for a single page from its resolved structure + patterns */
export function buildPageIR(
  page: StructurePage,
  resolvedPatterns: Map<string, ResolvedPatternEntry>,
  wiring: IRWiring | null,
  recipe: Recipe | null,
  density: { gap: string },
): IRPageNode {
  const children: IRNode[] = [];

  for (const item of page.layout) {
    if (typeof item === 'string') {
      // Simple string → full-width pattern
      const resolved = resolvedPatterns.get(item);
      children.push(buildPatternNode(item, item, resolved, wiring, recipe, density));
    } else if (isPatternRef(item)) {
      // PatternRef → pattern with optional preset/alias
      const alias = item.as || item.pattern;
      const resolved = resolvedPatterns.get(alias) || resolvedPatterns.get(item.pattern);
      children.push(buildPatternNode(item.pattern, alias, resolved, wiring, recipe, density));
    } else if (isColumnLayout(item)) {
      // ColumnLayout → grid with pattern children
      const cols = item.cols;
      const breakpoint = item.at || null;
      const spans = item.span || null;

      // Normalize spans: fill in missing columns with weight 1
      let normalizedSpans: Record<string, number> | null = null;
      if (spans) {
        normalizedSpans = {};
        for (const col of cols) {
          normalizedSpans[col] = spans[col] || 1;
        }
      }

      const gridChildren: IRNode[] = [];
      for (const col of cols) {
        const resolved = resolvedPatterns.get(col);
        gridChildren.push(buildPatternNode(col, col, resolved, wiring, recipe, density));
      }

      const totalCols = normalizedSpans
        ? Object.values(normalizedSpans).reduce((a, b) => a + b, 0)
        : cols.length;

      // AUTO: Pass through multi-breakpoint and container query config from ColumnLayout
      const breakpoints = item.breakpoints?.map(bp => ({ at: bp.at, cols: bp.cols })) || null;
      const responsive = item.responsive || null;

      const gridNode: IRGridNode = {
        type: 'grid',
        id: `grid-${cols.join('-')}`,
        children: gridChildren,
        cols: totalCols,
        spans: normalizedSpans,
        breakpoint,
        breakpoints,
        responsive,
        spatial: { gap: density.gap },
      };
      children.push(gridNode);
    }
  }

  const surface = page.surface || `_flex _col _gap${density.gap} _p4 _overflow[auto] _flex1`;

  return {
    type: 'page',
    id: page.id,
    children,
    pageId: page.id,
    surface,
    wiring,
  };
}
