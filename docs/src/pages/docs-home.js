import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { link } from 'decantr/router';
import { icon } from 'decantr/components';
import { DocsShell } from '../layouts/docs-shell.js';

const { div, h1, h2, p, span, section } = tags;

// ── Styles ──────────────────────────────────────────────────────────
const styles = {
  container: css('_flex _col _gap8 _p6 _lg:p8'),

  // Hero strip
  hero: css('_flex _col _aic _gap3 _py8 _tc _relative'),
  heroOrb: css('_absolute _top[-40px] _w[200px] _h[200px] _r[50%] _bg[radial-gradient(circle,var(--c-primary)/20_0%,transparent_70%)] _blur[40px] _pointer[none]'),
  heroTitle: css('_heading1 _bg[linear-gradient(135deg,var(--c-fg)_0%,var(--c-primary)_100%)] _bgclip[text] _fg[transparent]'),
  heroSubtitle: css('_textlg _fgmutedfg _maxw[500px]'),

  // Quick start cards
  quickStartGrid: css('_grid _gc3 _gap4 _md:gc1'),
  quickCard: css('_flex _col _gap3 _p5 _r2 _bgmuted/30 _border _bcborder/50 _trans[all_0.2s] _h:bcprimary/50 _h:shadow[0_0_20px_var(--c-primary)/15] _cursor[pointer]'),
  quickCardIcon: css('_w[40px] _h[40px] _r1 _bgprimary/15 _fgprimary _flex _aic _jcc'),
  quickCardTitle: css('_label _bold _fgfg'),
  quickCardDesc: css('_textsm _fgmutedfg'),

  // Pathway section
  pathwaySection: css('_flex _col _gap4'),
  pathwayGrid: css('_grid _gc4 _gap4 _lg:gc2 _sm:gc1'),
  pathwayCard: css('_flex _col _gap2 _p4 _r2 _bgmuted/20 _border _bcborder/30 _trans[all_0.2s] _h:bgmuted/40 _cursor[pointer]'),
  pathwayIcon: css('_fgmutedfg _mb1'),
  pathwayTitle: css('_textsm _bold _fgfg'),
  pathwayDesc: css('_caption _fgmutedfg'),
};

// ── Quick Start Card ────────────────────────────────────────────────
function QuickStartCard({ title, desc, path, iconName }) {
  return link({ href: path, class: css('_nounder _fgfg') },
    div({ class: styles.quickCard },
      div({ class: styles.quickCardIcon },
        icon(iconName, { size: '20px' }),
      ),
      div({ class: css('_flex _col _gap1') },
        span({ class: styles.quickCardTitle }, title),
        p({ class: styles.quickCardDesc }, desc),
      ),
    ),
  );
}

// ── Pathway Card ────────────────────────────────────────────────────
function PathwayCard({ title, desc, path, iconName }) {
  return link({ href: path, class: css('_nounder _fgfg') },
    div({ class: styles.pathwayCard },
      icon(iconName, { size: '20px', class: styles.pathwayIcon }),
      span({ class: styles.pathwayTitle }, title),
      p({ class: styles.pathwayDesc }, desc),
    ),
  );
}

// ── Main Page ───────────────────────────────────────────────────────
export function DocsHomePage() {
  return DocsShell(
    div({ class: styles.container },
      // Hero strip (compact)
      section({ class: styles.hero },
        div({ class: styles.heroOrb }),
        h1({ class: styles.heroTitle }, 'Learn to Build with AI'),
        p({ class: styles.heroSubtitle },
          'The prompt-first guide to Decantr. Master the process of working with AI to build beautiful, functional applications.'
        ),
      ),

      // Quick Start cards (Start Here section)
      section({ class: css('_flex _col _gap4') },
        h2({ class: css('_heading4 _fgmutedfg') }, 'Start Here'),
        div({ class: styles.quickStartGrid },
          QuickStartCard({
            title: 'Quick Setup',
            desc: 'Get Decantr installed and create your first project in under 2 minutes.',
            path: '/docs/quick-setup',
            iconName: 'zap',
          }),
          QuickStartCard({
            title: 'Your First Prompt',
            desc: 'Learn how to communicate with AI to build your first feature.',
            path: '/docs/first-prompt',
            iconName: 'message-square',
          }),
          QuickStartCard({
            title: 'The Decantation Process',
            desc: 'Understand the 5-stage workflow that powers AI-native development.',
            path: '/docs/decantation',
            iconName: 'wine',
          }),
        ),
      ),

      // Pathway cards (section navigation)
      section({ class: styles.pathwaySection },
        h2({ class: css('_heading4 _fgmutedfg') }, 'Explore'),
        div({ class: styles.pathwayGrid },
          PathwayCard({
            title: 'Building',
            desc: 'Add pages, features, and work with prompts',
            path: '/docs/building/pages',
            iconName: 'hammer',
          }),
          PathwayCard({
            title: 'Styling',
            desc: 'Themes, colors, and visual effects',
            path: '/docs/styling/themes',
            iconName: 'palette',
          }),
          PathwayCard({
            title: 'Customizing',
            desc: 'Create patterns, themes, and publish',
            path: '/docs/customizing/patterns',
            iconName: 'puzzle',
          }),
          PathwayCard({
            title: 'Reference',
            desc: 'Components, patterns, atoms, and API',
            path: '/explorer/components',
            iconName: 'book-open',
          }),
        ),
      ),
    ),
  );
}
