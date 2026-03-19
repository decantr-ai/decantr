/**
 * Ecosystem Grid — Community registry showcase
 * Displays community contributions with attribution and download stats
 */
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Card, Badge, Avatar, Chip, Button, icon } from 'decantr/components';

const { div, h3, h4, span, a } = tags;

const TYPE_COLORS = {
  style: 'primary',
  pattern: 'secondary',
  archetype: 'success',
  recipe: 'warning',
};

function EcosystemCard({ item }) {
  return Card({ hoverable: true, class: css('d-glass') },
    Card.Body({ class: css('_flex _col _gap3') },
      // Header: type + downloads
      div({ class: css('_flex _jcsb _aic') },
        Chip({ size: 'sm', variant: TYPE_COLORS[item.type] || 'outline' }, item.type),
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
  return div({ class: css('_flex _col _gap8 _py8') },
    // Header
    div({ class: css('_flex _col _gap4 _tc _aic') },
      h3({ class: css('_heading4 _fgfg') }, 'Community Registry'),
      span({ class: css('_fgmuted') },
        `${stats.totalItems} contributions from ${stats.contributors} developers`
      ),
      div({ class: css('_flex _gap3') },
        Button({ variant: 'primary' }, icon('search'), 'Browse Registry'),
        Button({ variant: 'outline' }, icon('plus'), 'Publish Your Own')
      )
    ),

    // Grid
    div({ class: css('_grid _gc1 _md:gc2 _lg:gc3 _gap6') },
      ...items.map(item => EcosystemCard({ item }))
    ),

    // Footer CTA
    div({ class: css('_tc _pt4') },
      span({ class: css('_fgmuted _textsm') },
        'Styles, patterns, archetypes, and recipes — all installable via '
      ),
      span({ class: css('_fgprimary _textsm _mono') }, 'npx decantr registry add')
    )
  );
}
