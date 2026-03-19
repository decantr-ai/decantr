/**
 * Gallery preview section for the homepage — shows 4 showcase cards
 * with a CTA to the full gallery page.
 */
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Card, Badge, Button, icon } from 'decantr/components';

const { section, div, h2, h3, p, span, a } = tags;

const PREVIEWS = [
  {
    title: 'SaaS Dashboard',
    archetype: 'saas-dashboard',
    vintageLabel: 'auradecantism / dark',
    tags: ['KPIs', 'Charts', 'Data Table'],
    live: true,
  },
  {
    title: 'Photography Portfolio',
    archetype: 'portfolio',
    vintageLabel: 'glassmorphism / dark',
    tags: ['Gallery', 'Hero', 'Contact'],
    live: false,
  },
  {
    title: 'E-commerce Store',
    archetype: 'ecommerce',
    vintageLabel: 'clean / light',
    tags: ['Products', 'Cart', 'Checkout'],
    live: false,
  },
  {
    title: 'Developer Blog',
    archetype: 'content-site',
    vintageLabel: 'auradecantism / dark',
    tags: ['Articles', 'Code Blocks', 'Search'],
    live: false,
  },
];

function PreviewCard({ item, delay }) {
  return Card({
    hoverable: true,
    class: `ds-glass ds-animate ds-delay-${delay} ${css('_flex _col _gap3 _p5')}`,
  },
    div({ class: css('_flex _aic _jcsb') },
      h3({ class: css('_heading6 _fgfg') }, item.title),
      item.live
        ? Badge({ variant: 'success' }, 'Live')
        : Badge({ variant: 'default' }, 'Soon'),
    ),
    div({ class: css('_flex _aic _gap2') },
      icon('layers', { size: '12px', class: css('_fgmutedfg') }),
      span({ class: css('_textsm _fgmutedfg') }, item.vintageLabel),
    ),
    div({ class: css('_flex _wrap _gap1') },
      ...item.tags.map(tag =>
        span({ class: css('_textsm _fgmutedfg _bgmuted _px2 _py1 _r1') }, tag)
      ),
    ),
  );
}

export function GalleryPreviewSection() {
  return section({ class: `ds-section ds-reveal ${css('_flex _col _aic')}`, id: 'gallery-preview' },
    div({ class: css('_flex _col _aic _gap12 _relative _z10 _maxw[1100px] _w100') },
      // Header
      div({ class: css('_flex _col _aic _gap4 _tc') },
        span({ class: css('_caption _uppercase _ls[0.1em] _fgprimary _bold') }, 'The Proof'),
        h2({ class: `ds-heading ds-gradient-text ds-animate ${css('_fw[800] _ls[-0.03em] _lh[1.1]')}` },
          'All Built from a Config File',
        ),
        p({ class: `ds-animate ds-delay-1 ${css('_textlg _lhrelaxed _fgmutedfg _maxw[650px]')}` },
          'Each application is generated entirely from a single ',
          span({ class: css('_fgfg _fw[600] _font[var(--d-font-mono)]') }, 'decantr.essence.json'),
          ' file. No hand-rolled layouts. No manual wiring.',
        ),
      ),

      // Cards grid
      div({ class: css('_grid _gcaf240 _gap4 _w100') },
        ...PREVIEWS.map((item, i) => PreviewCard({ item, delay: i + 2 })),
      ),

      // CTA
      div({ class: css('_flex _col _aic _gap4 _mt4') },
        a({ href: '#/gallery', class: css('_nounder') },
          Button({ variant: 'primary', size: 'lg', class: 'ds-glow' }, 'View Full Gallery'),
        ),
      ),
    ),
  );
}
