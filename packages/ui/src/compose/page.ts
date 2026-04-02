import { h } from '../runtime/index.js';
import { css } from '../css/index.js';
import { useEssence } from '../essence/hooks.js';
import { compose } from './compose.js';
import type { EssenceBlueprint, BlueprintPage, LayoutItem } from '@decantr/essence-spec';

/**
 * Render a full page from the essence blueprint.
 * Finds the page by ID, resolves each pattern in the layout, and wraps in a shell.
 */
export function composePage(pageId: string): HTMLElement {
  const ctx = useEssence();
  const essence = ctx.essence;

  if (!essence) {
    return h('div', { class: css('_p6 _text-muted') },
      `composePage('${pageId}'): No essence provided. Wrap in EssenceProvider.`,
    );
  }

  const blueprint = essence.blueprint;
  const page = findPage(blueprint, pageId);

  if (!page) {
    return h('div', { class: css('_p6 _text-muted') },
      `composePage('${pageId}'): Page not found in blueprint.`,
    );
  }

  // Resolve shell: page-level override > section-level > blueprint-level > default
  const shellId = resolveShellId(blueprint, page);

  // Render each pattern in the layout
  const sections = page.layout.map((item) => {
    const patternId = resolveLayoutItemId(item);
    const patternProps = resolveLayoutItemProps(item);
    return compose(patternId, { props: patternProps });
  });

  return resolveShell(shellId, sections);
}

/** Find a page by ID across sections and flat pages. */
function findPage(blueprint: EssenceBlueprint, pageId: string): BlueprintPage | undefined {
  // Check flat pages first
  if (blueprint.pages) {
    const found = blueprint.pages.find(p => p.id === pageId);
    if (found) return found;
  }

  // Check sectioned pages (v3.1)
  if (blueprint.sections) {
    for (const section of blueprint.sections) {
      const found = section.pages.find(p => p.id === pageId);
      if (found) return found;
    }
  }

  return undefined;
}

/** Resolve the shell ID for a page. */
function resolveShellId(blueprint: EssenceBlueprint, page: BlueprintPage): string {
  if (page.shell_override) return page.shell_override;

  // Check if page belongs to a section with its own shell
  if (blueprint.sections) {
    for (const section of blueprint.sections) {
      if (section.pages.some(p => p.id === page.id)) {
        return section.shell || blueprint.shell || 'marketing';
      }
    }
  }

  return blueprint.shell || 'marketing';
}

/** Extract pattern ID from a LayoutItem (string, PatternRef, or ColumnLayout). */
function resolveLayoutItemId(item: LayoutItem): string {
  if (typeof item === 'string') return item;
  if ('pattern' in item) return item.pattern;
  // ColumnLayout — render as a combined section
  return 'columns';
}

/** Extract props from a LayoutItem. */
function resolveLayoutItemProps(item: LayoutItem): Record<string, unknown> {
  if (typeof item === 'string') return {};
  // @ts-expect-error -- strict-mode fix (auto)
  if ('pattern' in item) return item.props || {};
  return { columns: item };
}

// ─── Shell Resolution ────────────────────────────────────────

/**
 * Wrap rendered pattern sections in a shell layout.
 */
export function resolveShell(shellId: string, sections: HTMLElement[]): HTMLElement {
  switch (shellId) {
    case 'marketing':
    case 'full-bleed':
    case 'stacked':
      return h('div', {
        class: css('_flex _col _w-full _min-h-screen'),
        'data-shell': shellId,
      }, ...sections);

    case 'sidebar-main':
    case 'sidebar-detail':
      return h('div', {
        class: css('_flex _min-h-screen'),
        'data-shell': shellId,
      },
        h('aside', {
          class: css('_w[240px] _shrink0 _border-r _border-subtle _p4'),
        }, sections[0] || ''),
        h('main', {
          class: css('_flex1 _flex _col'),
        }, ...sections.slice(1)),
      );

    case 'top-nav-main':
      return h('div', {
        class: css('_flex _col _min-h-screen'),
        'data-shell': shellId,
      },
        sections[0] || h('header', {}),
        h('main', {
          class: css('_flex1 _flex _col'),
        }, ...sections.slice(1)),
      );

    case 'centered':
      return h('div', {
        class: css('_flex _col _items-center _min-h-screen'),
        'data-shell': shellId,
      },
        h('div', {
          class: css('_w-full _mw[1200px] _mx-auto _flex _col'),
        }, ...sections),
      );

    default:
      // Unknown shell — fall back to stacked
      return h('div', {
        class: css('_flex _col _w-full _min-h-screen'),
        'data-shell': shellId,
      }, ...sections);
  }
}
