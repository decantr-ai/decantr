import type {
  IRPageNode, IRPatternNode, IRGridNode, IRWiring,
  IRCardWrapping, IRPatternMeta, IRVisualEffect, IRNode, IRLayer,
} from './types.js';
import type { StructurePage, LayoutItem, PatternRef, ColumnLayout } from '@decantr/essence-spec';
import type { Pattern, Theme as RegistryTheme, ResolvedPreset } from '@decantr/registry';
import { resolveVisualEffects } from './resolve.js';

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
  theme: RegistryTheme | null,
): boolean {
  // Hero/row/stack layouts are standalone
  const layout = preset.layout.layout;
  if (layout === 'hero' || layout === 'row') return false;

  // Pattern explicitly opts out
  if (pattern.contained === false) return false;

  // Theme spatial says no cards
  const cardWrapping = theme?.spatial?.card_wrapping;
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
  theme: RegistryTheme | null,
): IRCardWrapping {
  const mode = theme?.spatial?.card_wrapping || 'always';
  return {
    mode: mode as IRCardWrapping['mode'],
    headerLabel: pattern.name,
  };
}

function buildPatternNode(
  patternId: string,
  alias: string,
  resolved: ResolvedPatternEntry | undefined,
  wiring: IRWiring | null,
  theme: RegistryTheme | null,
  density: { gap: string },
  layer?: IRLayer,
): IRPatternNode {
  const pattern = resolved?.pattern;
  const preset = resolved?.preset;

  const layout = preset?.layout.layout || 'column';
  const isStandalone = layout === 'hero' || layout === 'row';
  const contained = pattern && preset ? shouldWrapInCard(pattern, preset, theme) : false;
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
    ? buildCardWrapping(pattern, theme)
    : null;

  const wireProps = wiring?.props[alias] || wiring?.props[patternId] || null;

  // Resolve visual effects from theme + pattern when available
  const visualEffects = theme && pattern
    ? resolveVisualEffects(theme, pattern)
    : null;

  return {
    type: 'pattern',
    id: alias,
    children: [],
    pattern: patternMeta,
    card,
    visualEffects,
    wireProps,
    spatial: { gap: density.gap },
    ...(layer ? { layer } : {}),
  };
}

/** Build IR tree for a single page from its resolved structure + patterns */
export function buildPageIR(
  page: StructurePage,
  resolvedPatterns: Map<string, ResolvedPatternEntry>,
  wiring: IRWiring | null,
  theme: RegistryTheme | null,
  density: { gap: string },
  layer?: IRLayer,
): IRPageNode {
  const children: IRNode[] = [];

  for (const item of page.layout) {
    if (typeof item === 'string') {
      // Simple string → full-width pattern
      const resolved = resolvedPatterns.get(item);
      children.push(buildPatternNode(item, item, resolved, wiring, theme, density, layer));
    } else if (isPatternRef(item)) {
      // PatternRef → pattern with optional preset/alias
      const alias = item.as || item.pattern;
      const resolved = resolvedPatterns.get(alias) || resolvedPatterns.get(item.pattern);
      children.push(buildPatternNode(item.pattern, alias, resolved, wiring, theme, density, layer));
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
        gridChildren.push(buildPatternNode(col, col, resolved, wiring, theme, density, layer));
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
        ...(layer ? { layer } : {}),
      };
      children.push(gridNode);
    }
  }

  const gapAtom = density.gap.startsWith('_')
    ? density.gap
    : density.gap.startsWith('gap')
      ? `_${density.gap}`
      : `_gap${density.gap}`;
  // Page surface declares layout direction + content gap ONLY. Padding, scroll
  // containment, and flex-grow belong to the shell per the "Layout Rules"
  // directive in DECANTR.md ("One scroll container per region", "Let shells
  // own spacing, centering, and scroll containers", "Pages should not
  // duplicate shell responsibilities"). Previous default (`_p4 _overauto
  // _flex1`) contradicted that directive and the v3 harness flagged it as
  // the single most expensive contract-ambiguity friction point. Pages that
  // genuinely need to claim scroll/padding can still declare it explicitly
  // via `page.surface` — the fallback just stops prescribing it.
  const surface = page.surface || `_flex _col ${gapAtom}`;

  return {
    type: 'page',
    id: page.id,
    children,
    pageId: page.id,
    surface,
    wiring,
    ...(layer ? { layer } : {}),
  };
}
