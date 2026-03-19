/**
 * Ecosystem Grid — Community registry showcase
 * Displays community contributions with attribution and download stats
 */
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { createSignal, createEffect } from 'decantr/state';
import { Card, Badge, Avatar, Chip, Button, icon } from 'decantr/components';

const { div, h3, h4, span, a } = tags;

const CATEGORIES = ['style', 'pattern', 'archetype', 'recipe'];

const TYPE_COLORS = {
  style: 'info',       // blue
  pattern: 'error',    // coral/pink
  archetype: 'success', // green
  recipe: 'warning',   // yellow/orange
};

function EcosystemCard({ item }) {
  return Card({ hoverable: true, class: css('d-glass') },
    Card.Body({ class: css('_flex _col _gap3') },
      // Header: type + downloads
      div({ class: css('_flex _jcsb _aic') },
        Chip({ size: 'sm', variant: TYPE_COLORS[item.type] || 'outline', label: item.type }),
        div({ class: css('_flex _aic _gap1') },
          icon('download', { size: '0.875rem', class: css('_fgmuted') }),
          span({ class: css('_textsm _fgmuted') }, item.downloads.toLocaleString())
        )
      ),
      // Title + description
      h3({ class: css('_heading5 _fgfg') }, item.name),
      span({ class: css('_textsm _fgmuted _lh[1.5]') }, item.description),
      // Footer: author
      div({ class: css('_flex _aic _gap2 _mt[auto] _pt3 _borderT _bcborder') },
        Avatar({ src: item.author.avatar, size: 'xs' }),
        span({ class: css('_textsm _fgmuted') }, `@${item.author.username}`)
      )
    )
  );
}

export function EcosystemGrid({ items, stats }) {
  const [activeFilter, setActiveFilter] = createSignal(null); // null = all

  // Filter chips with reactive selected state
  function FilterChips() {
    const container = div({ class: css('_flex _gap2 _wrap') });

    function renderChips() {
      const current = activeFilter();
      container.replaceChildren();

      // "All" chip
      container.appendChild(Chip({
        label: 'All',
        size: 'sm',
        variant: current === null ? 'filled' : 'outline',
        onClick: () => setActiveFilter(null)
      }));

      // Category chips - filled when active, outline when not
      for (const cat of CATEGORIES) {
        const isActive = current === cat;
        container.appendChild(Chip({
          label: cat.charAt(0).toUpperCase() + cat.slice(1),
          size: 'sm',
          variant: isActive ? 'filled' : 'outline',
          color: TYPE_COLORS[cat],
          onClick: () => setActiveFilter(isActive ? null : cat)
        }));
      }
    }

    createEffect(renderChips);
    return container;
  }

  // Grid container that updates reactively
  const gridContainer = div({ class: css('_grid _gc1 _md:gc2 _lg:gc3 _gap6') });

  function updateGrid() {
    const filter = activeFilter();
    const filtered = filter ? items.filter(item => item.type === filter) : items;
    gridContainer.replaceChildren(...filtered.map(item => EcosystemCard({ item })));
  }

  createEffect(updateGrid);

  return div({ class: css('_flex _col _gap8 _py8') },
    // Header
    div({ class: css('_flex _col _gap2 _tc _aic') },
      h3({ class: css('_heading4 _fgfg') }, 'Community Registry'),
      span({ class: css('_fgmuted') },
        `${stats.totalItems} contributions from ${stats.contributors} developers`
      )
    ),

    // Filter chips (left) + Buttons (right)
    div({ class: css('_flex _jcsb _aic _gap4 _wrap') },
      FilterChips(),
      div({ class: css('_flex _gap2') },
        Button({ variant: 'outline', size: 'sm' }, icon('search'), 'Browse'),
        Button({ variant: 'outline', size: 'sm' }, icon('plus'), 'Publish')
      )
    ),

    // Grid (reactive)
    gridContainer,

    // Footer CTA
    div({ class: css('_tc _pt4') },
      span({ class: css('_fgmuted _textsm') },
        'Styles, patterns, archetypes, and recipes — all installable via '
      ),
      span({ class: css('_fgprimary _textsm _font[var(--d-font-mono)]') }, 'npx decantr registry add')
    )
  );
}
