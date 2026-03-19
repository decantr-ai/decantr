/**
 * Showcase Page — tabbed view of Apps, Components, and Themes
 */
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { createSignal, createEffect } from 'decantr/state';
import { Card, Badge, Button, Tabs, icon } from 'decantr/components';
import { SiteShell } from '../layouts/site-shell.js';
import { showcaseManifest } from '../data/showcases.js';
import { AnatomyViewer } from '../sections/anatomy-viewer.js';
import { EcosystemGrid } from '../sections/ecosystem-grid.js';
import { featuredPatterns } from '../data/patterns-data.js';
import { ecosystemItems, ecosystemStats } from '../data/ecosystem-data.js';

const { div, h1, h2, h3, p, span, section, a, img } = tags;
const SHOWCASES = showcaseManifest.showcases;

// ─── Apps Tab ─────────────────────────────────────────────────────
function AppsTab() {
  const liveApps = SHOWCASES.filter(s => s.status === 'live');

  return div({ class: css('_grid _gc1 _md:gc2 _gap6 _py8') },
    ...liveApps.map(item =>
      Card({ hoverable: true, class: css('d-glass _flex _col _gap0 _overflow[hidden]') },
        a({ href: `/showcase/${item.id}/`, target: '_blank', rel: 'noopener', class: css('_block _overflow[hidden] _bgmuted') },
          img({ src: `/showcase/${item.id}/thumbnail.svg`, alt: item.title, loading: 'lazy',
                class: css('_wfull _h[200px] _object[cover] _trans[transform_0.3s_ease] _h:scale[1.03]') })
        ),
        div({ class: css('_flex _col _gap4 _p6 _flex1') },
          div({ class: css('_flex _aic _jcsb') },
            Badge({ variant: 'success' }, 'LIVE'),
            div({ class: css('_flex _gap2') },
              Badge({ variant: 'outline' }, item.style),
              Badge({ variant: 'outline' }, item.mode)
            )
          ),
          h3({ class: css('_heading5 _fgfg') }, item.title),
          p({ class: css('_textsm _fgmuted _lh[1.6]') }, item.description),
          div({ class: css('_flex _wrap _gap2') },
            ...item.tags.map(t => span({ class: css('_textxs _fgmuted _bgmuted/50 _px2 _py1 _r1') }, t))
          ),
          div({ class: css('_flex _aic _jcsb _mt[auto] _pt4 _borderT _bcborder') },
            span({ class: css('_textsm _fgmuted') }, `Archetype: ${item.archetype}`),
            a({ href: `/showcase/${item.id}/`, target: '_blank', rel: 'noopener', class: css('_nounder') },
              Button({ variant: 'primary', size: 'sm' }, 'View Live', icon('external-link'))
            )
          )
        )
      )
    )
  );
}

// ─── Components Tab ───────────────────────────────────────────────
function ComponentsTab() {
  const categories = [
    { name: 'Form', items: ['Button', 'Input', 'Select', 'Checkbox', 'Toggle', 'Slider'] },
    { name: 'Display', items: ['Card', 'Badge', 'Avatar', 'Chip', 'Statistic'] },
    { name: 'Layout', items: ['Shell', 'Tabs', 'Accordion', 'Modal', 'Drawer'] },
    { name: 'Feedback', items: ['Alert', 'Toast', 'Progress', 'Skeleton'] },
  ];

  return div({ class: css('_flex _col _gap8 _py8') },
    p({ class: css('_fgmuted _tc') }, '100+ production-ready components. Explore the full catalog in the Explorer.'),
    div({ class: css('_grid _gc1 _md:gc2 _gap6') },
      ...categories.map(cat =>
        Card({ class: css('d-glass') },
          Card.Header({}, h3({ class: css('_heading5') }, cat.name)),
          Card.Body({},
            div({ class: css('_flex _wrap _gap2') },
              ...cat.items.map(c => Badge({ variant: 'outline' }, c))
            )
          )
        )
      )
    ),
    div({ class: css('_tc') },
      a({ href: '#/explorer', class: css('_nounder') },
        Button({ variant: 'outline' }, 'Open Component Explorer', icon('arrow-right'))
      )
    )
  );
}

// ─── Themes Tab ───────────────────────────────────────────────────
function ThemesTab() {
  const themes = [
    { name: 'Auradecantism', desc: 'Default dark theme with aurora gradients and glass effects', type: 'core' },
    { name: 'Clean', desc: 'Minimal light theme with sharp edges and solid colors', type: 'addon' },
    { name: 'Glassmorphism', desc: 'Frosted glass aesthetic with blur and transparency', type: 'addon' },
    { name: 'Retro', desc: 'Synthwave-inspired with neon accents', type: 'community' },
    { name: 'Bioluminescent', desc: 'Deep sea glow with organic gradients', type: 'community' },
    { name: 'Launchpad', desc: 'Startup-focused with vibrant CTAs', type: 'community' },
  ];

  return div({ class: css('_grid _gc1 _md:gc2 _lg:gc3 _gap6 _py8') },
    ...themes.map(t =>
      Card({ class: css('d-glass') },
        Card.Body({ class: css('_flex _col _gap3') },
          div({ class: css('_flex _aic _jcsb') },
            h3({ class: css('_heading5 _fgfg') }, t.name),
            Badge({ variant: t.type === 'core' ? 'primary' : t.type === 'addon' ? 'secondary' : 'outline' },
              t.type === 'core' ? 'Core' : t.type === 'addon' ? 'Add-on' : 'Community'
            )
          ),
          p({ class: css('_textsm _fgmuted') }, t.desc)
        )
      )
    )
  );
}

// ─── Patterns Tab ────────────────────────────────────────────────
function PatternsTab() {
  const [activePattern, setActivePattern] = createSignal(featuredPatterns[0]);

  // Container for anatomy viewer - will be reactively updated
  const anatomyContainer = div({ class: css('_mt4') });

  // Render anatomy viewer when pattern changes
  createEffect(() => {
    const pattern = activePattern();
    anatomyContainer.innerHTML = '';
    anatomyContainer.appendChild(AnatomyViewer({ pattern }));
  });

  return div({ class: css('_flex _col _gap6 _py8') },
    // Pattern selector
    div({ class: css('_flex _wrap _gap2 _jcc') },
      ...featuredPatterns.map(p => {
        const btn = Button({
          variant: 'outline',
          size: 'sm',
          onclick: () => setActivePattern(p),
        }, p.name);

        createEffect(() => {
          const isActive = activePattern().id === p.id;
          btn.classList.toggle(css('_bgprimary/20 _bcprimary'), isActive);
        });

        return btn;
      })
    ),
    // Anatomy viewer - reactive container
    anatomyContainer
  );
}

// ─── Ecosystem Tab ───────────────────────────────────────────────
function EcosystemTab() {
  return EcosystemGrid({ items: ecosystemItems, stats: ecosystemStats });
}

// ─── Page Composition ─────────────────────────────────────────────
export function ShowcasePage() {
  return SiteShell(
    section({ class: css('_flex _col _gap8 _py12 _px6 _mw[1100px] _mx[auto]') },
      // Header
      div({ class: css('_tc _flex _col _gap4 _aic') },
        h1({ class: css('d-heading-hero') }, 'See What Decantr Builds'),
        p({ class: css('_textlg _fgmuted _mw[600px]') },
          'Production apps, 100+ components, and curated themes — all generated from essence files.'
        )
      ),
      // Tabs
      Tabs({
        tabs: [
          { id: 'apps', label: 'Apps', content: () => AppsTab() },
          { id: 'patterns', label: 'Patterns', content: () => PatternsTab() },
          { id: 'components', label: 'Components', content: () => ComponentsTab() },
          { id: 'themes', label: 'Themes', content: () => ThemesTab() },
          { id: 'ecosystem', label: 'Ecosystem', content: () => EcosystemTab() },
        ],
        active: 'apps',
        class: css('_jcc'),
      })
    )
  );
}
