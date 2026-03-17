/**
 * Showcase Gallery — displays pre-built applications generated from essence files.
 * Each showcase proves the Decantation Process works end-to-end.
 */
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Card, Badge, Button, icon } from 'decantr/components';
import { SiteShell } from '../layouts/site-shell.js';

const { div, h1, h2, h3, p, span, section, a } = tags;

const SHOWCASES = [
  {
    id: 'saas-dashboard',
    title: 'SaaS Dashboard',
    description: 'Analytics dashboard with KPI cards, data tables, charts, and real-time data. Built from the saas-dashboard archetype.',
    archetype: 'saas-dashboard',
    vintageStyle: 'command-center',
    vintageMode: 'dark',
    tags: ['KPIs', 'Charts', 'Data Table', 'Sidebar'],
    status: 'live',
  },
  {
    id: 'photography-portfolio',
    title: 'Photography Portfolio',
    description: 'Visual-first portfolio with hero gallery, project showcases, and contact form. Built from the portfolio archetype.',
    archetype: 'portfolio',
    vintageStyle: 'glassmorphism',
    vintageMode: 'dark',
    tags: ['Gallery', 'Hero', 'Contact', 'Full-Bleed'],
    status: 'coming-soon',
  },
  {
    id: 'ecommerce-store',
    title: 'E-commerce Store',
    description: 'Product catalog with filtering, cart, checkout flow, and account management. Built from the ecommerce archetype.',
    archetype: 'ecommerce',
    vintageStyle: 'clean',
    vintageMode: 'light',
    tags: ['Products', 'Cart', 'Checkout', 'Filters'],
    status: 'coming-soon',
  },
  {
    id: 'developer-blog',
    title: 'Developer Blog',
    description: 'Content-focused blog with syntax highlighting, table of contents, and reading progress. Built from the content-site archetype.',
    archetype: 'content-site',
    vintageStyle: 'auradecantism',
    vintageMode: 'dark',
    tags: ['Articles', 'Code Blocks', 'TOC', 'Search'],
    status: 'coming-soon',
  },
  {
    id: 'financial-dashboard',
    title: 'Financial Dashboard',
    description: 'Performance tracking with scorecards, pipeline visualization, and compliance reporting. Built from the financial-dashboard archetype.',
    archetype: 'financial-dashboard',
    vintageStyle: 'command-center',
    vintageMode: 'dark',
    tags: ['Scorecard', 'Pipeline', 'KPIs', 'Export'],
    status: 'coming-soon',
  },
];

function ShowcaseCard({ showcase }) {
  const isLive = showcase.status === 'live';

  return Card({
    hoverable: true,
    class: `ds-glass ${css('_flex _col _gap4 _p6 _ohidden')}`,
  },
    div({ class: css('_flex _aic _jcsb') },
      Badge({
        variant: isLive ? 'success' : 'default',
      }, isLive ? 'Live' : 'Coming Soon'),
      div({ class: css('_flex _gap2') },
        Badge({ variant: 'outline' }, showcase.vintageStyle),
        Badge({ variant: 'outline' }, showcase.vintageMode),
      ),
    ),
    h3({ class: css('_heading5 _fgfg') }, showcase.title),
    p({ class: css('_body _fgmutedfg _lhrelaxed') }, showcase.description),
    div({ class: css('_flex _wrap _gap2') },
      ...showcase.tags.map(tag =>
        span({ class: css('_textsm _fgmutedfg _bgmuted _px2 _py1 _r1') }, tag)
      ),
    ),
    div({ class: css('_flex _aic _gap2 _mt2 _pt3 _borderT _bcborder') },
      icon('layers', { size: '14px', class: css('_fgmutedfg') }),
      span({ class: css('_textsm _fgmutedfg') }, `Archetype: ${showcase.archetype}`),
    ),
  );
}

export function GalleryPage() {
  return SiteShell(
    section({ class: `ds-section ${css('_flex _col _aic _gap12')}` },
      div({ class: css('_flex _col _aic _gap4 _tc _maxw[700px]') },
        span({ class: css('_caption _uppercase _ls[0.1em] _fgprimary _bold') }, 'Showcase Gallery'),
        h1({ class: `ds-heading ds-gradient-text ${css('_fw[800] _ls[-0.03em] _lh[1.1]')}` },
          'Built with Decantr',
        ),
        p({ class: css('_textlg _lhrelaxed _fgmutedfg') },
          'Real applications generated from essence files using the Decantation Process. Each showcase proves the system works end-to-end.',
        ),
      ),
      div({ class: css('_grid _gcaf320 _gap6 _w100 _maxw[1100px]') },
        ...SHOWCASES.map(s => ShowcaseCard({ showcase: s })),
      ),
      div({ class: `ds-glass-strong ${css('_flex _col _aic _tc _gap4 _p8 _w100 _maxw[700px]')}` },
        h2({ class: css('_heading5 _fgfg') }, 'Want to see your app here?'),
        p({ class: css('_body _fgmutedfg') },
          'Every showcase starts with a single essence.json file. Describe your domain, pick a style, and let the Decantation Process do the rest.',
        ),
        div({ class: css('_flex _gap4') },
          a({ href: '#/docs', class: css('_nounder') },
            Button({ variant: 'primary' }, 'Read the Docs'),
          ),
          a({ href: '#/explorer', class: css('_nounder') },
            Button({ variant: 'outline' }, 'Explore Components'),
          ),
        ),
      ),
    ),
  );
}
