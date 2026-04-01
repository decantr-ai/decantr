/**
 * IR-to-Component Mapper
 *
 * Maps @decantr/core IR nodes to @decantr/ui component calls,
 * producing VNodes via the SSR primitives for static HTML generation.
 */

import type {
  IRNode,
  IRPatternNode,
  IRPageNode,
  IRShellNode,
  IRGridNode,
  IRAppNode,
} from '@decantr/core';
import { ssrH, ssrCss } from '../ssr/index.js';
import type { VNode } from '../ssr/index.js';

/**
 * Map an IR node to a VNode tree using SSR primitives.
 * This produces a server-renderable VNode (not a DOM HTMLElement).
 */
export function mapIRToVNode(node: IRNode): VNode {
  switch (node.type) {
    case 'app':
      return mapAppNode(node as IRAppNode);
    case 'shell':
      return mapShellNode(node as IRShellNode);
    case 'page':
      return mapPageNode(node as IRPageNode);
    case 'pattern':
      return mapPatternNode(node as IRPatternNode);
    case 'grid':
      return mapGridNode(node as IRGridNode);
    default:
      return ssrH('div', { 'data-ir-type': node.type, 'data-ir-id': node.id },
        ...node.children.map(c => mapIRToVNode(c)),
      );
  }
}

function mapAppNode(node: IRAppNode): VNode {
  const shellVNode = mapShellNode(node.shell);
  const pageVNodes = node.children.map(c => mapIRToVNode(c));

  return ssrH('div', {
    'data-decantr-app': 'true',
    'data-theme-style': node.theme.style,
    'data-theme-mode': node.theme.mode,
    class: ssrCss('_flex', '_col', '_min-h-screen'),
  }, shellVNode, ...pageVNodes);
}

function mapShellNode(node: IRShellNode): VNode {
  const shellType = node.config.type;
  const brand = node.config.brand;

  switch (shellType) {
    case 'sidebar-main':
    case 'sidebar-detail':
      return ssrH('div', {
        class: ssrCss('_flex', '_min-h-screen'),
        'data-shell': shellType,
      },
        ssrH('aside', {
          class: ssrCss('_w[240px]', '_shrink0', '_border-r', '_border-subtle', '_p4'),
        },
          brand ? ssrH('div', { class: ssrCss('_font-bold', '_mb4') }, brand) : '',
          ...mapNavItems(node.config.nav),
        ),
        ssrH('main', {
          class: ssrCss('_flex1', '_flex', '_col'),
        }),
      );

    case 'top-nav-main':
      return ssrH('div', {
        class: ssrCss('_flex', '_col', '_min-h-screen'),
        'data-shell': shellType,
      },
        ssrH('header', {
          class: ssrCss('_flex', '_items-center', '_p4', '_border-b', '_border-subtle'),
        },
          brand ? ssrH('div', { class: ssrCss('_font-bold') }, brand) : '',
          ssrH('nav', { class: ssrCss('_flex', '_gap4', '_ml-auto') },
            ...mapNavItems(node.config.nav),
          ),
        ),
      );

    default:
      // marketing / full-bleed / stacked / unknown
      return ssrH('div', {
        class: ssrCss('_flex', '_col', '_w-full', '_min-h-screen'),
        'data-shell': shellType,
      });
  }
}

function mapNavItems(nav: Array<{ href: string; icon: string; label: string }>): VNode[] {
  return nav.map(item =>
    ssrH('a', { href: item.href, class: ssrCss('_flex', '_items-center', '_gap2') },
      item.label,
    ),
  );
}

function mapPageNode(node: IRPageNode): VNode {
  const children = node.children.map(c => mapIRToVNode(c));
  const gapClass = node.spatial?.gap ? `_gap${node.spatial.gap}` : '_gap4';

  return ssrH('div', {
    'data-page': node.pageId,
    class: ssrCss('_flex', '_col', gapClass, '_p4'),
  }, ...children);
}

function mapPatternNode(node: IRPatternNode): VNode {
  const patternId = node.pattern.patternId;
  const alias = node.pattern.alias;

  // Build pattern section with metadata
  const attrs: Record<string, string> = {
    'data-pattern': patternId,
    class: ssrCss('_w-full'),
  };

  if (alias && alias !== patternId) {
    attrs['data-alias'] = alias;
  }

  // Apply visual effects as data attributes for hydration
  if (node.visualEffects) {
    attrs['data-effects'] = node.visualEffects.decorators.join(' ');
  }

  // Card wrapping
  if (node.card && node.card.mode !== 'none') {
    return ssrH('section', attrs,
      ssrH('div', { class: ssrCss('d-card', '_p4') },
        node.card.headerLabel
          ? ssrH('div', { class: ssrCss('_font-semibold', '_mb2') }, node.card.headerLabel)
          : '',
        ssrH('div', { 'data-compose': patternId, 'data-props': JSON.stringify(node.wireProps || {}) }),
      ),
    );
  }

  return ssrH('section', attrs,
    ssrH('div', { 'data-compose': patternId, 'data-props': JSON.stringify(node.wireProps || {}) }),
  );
}

function mapGridNode(node: IRGridNode): VNode {
  const cols = node.cols;
  const children = node.children.map(c => mapIRToVNode(c));

  const gridClass = `_grid _grid-cols-${cols}`;
  const gapClass = node.spatial?.gap ? `_gap${node.spatial.gap}` : '_gap4';

  return ssrH('div', {
    class: ssrCss(gridClass, gapClass),
    'data-grid': String(cols),
  }, ...children);
}
