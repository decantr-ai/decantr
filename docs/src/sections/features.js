import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { icon, Chip, Card } from 'decantr/components';

const { section, div, h2, h3, p, span, code } = tags;

function FeatureCard({ iconName, badge, title, description, highlights, delay }) {
  return Card({ bordered: false, class: `ds-glass ds-animate ds-delay-${delay} ${css('_flex _col _gap4 _p8')}` },
    div({ class: css('_flex _row _aic _gap3') },
      div({ class: `ds-accent-bg ${css('_fgaccent _iflex _p[0.75rem] _r[var(--d-radius-lg)]')}` },
        icon(iconName, { size: '24px' }),
      ),
      Chip({ label: badge, variant: 'outline', size: 'sm' }),
    ),
    h3({ class: css('_textxl _fwheading _fgfg') }, title),
    p({ class: css('_textbase _lhrelaxed _fgmutedfg') }, description),
    // Highlight pills
    div({ class: css('_flex _row _wrap _gap2') },
      ...highlights.map(h =>
        Chip({ label: h, variant: 'outline', size: 'xs', class: 'ds-accent-pill' })
      ),
    ),
  );
}

export function FeaturesSection() {
  return section({ class: `ds-section ds-reveal ${css('_flex _col _aic')}` },
    // Decorative orb
    div({ class: `ds-orb ds-orb-pink-06 ${css('_w[500px] _h[500px] _bottom[10%] _left[-15%]')}` }),

    div({ class: css('_flex _col _aic _gap12 _relative _z10 _maxw[1100px] _w100') },
      // Header
      div({ class: css('_flex _col _aic _gap4 _tc') },
        h2({ class: `ds-heading ds-gradient-text ds-animate ${css('_fw[800] _ls[-0.03em] _lh[1.1]')}` },
          'Built Different',
        ),
        p({ class: `ds-animate ds-delay-1 ${css('_textlg _lhrelaxed _fgmutedfg _maxw[650px]')}` },
          'Every piece of decantr was designed from scratch. No borrowed ideas. No inherited baggage. Just ',
          span({ class: css('_fgfg _fw[600]') }, 'solutions that didn\'t exist before.'),
        ),
      ),

      // Feature grid — 2×2
      div({ class: css('_grid _gcaf320 _gap6 _w100') },
        FeatureCard({
          iconName: 'pie-chart',
          badge: 'Visualization',
          title: '25 Chart Types. One API.',
          description: 'From sparklines to Sankey diagrams. SVG, Canvas, and WebGPU renderers. Every chart is responsive, animated, and theme-aware out of the box. Your dashboards just got dangerous.',
          highlights: ['SVG', 'Canvas', 'WebGPU', 'Animated', 'Theme-Aware'],
          delay: 2,
        }),
        FeatureCard({
          iconName: 'star',
          badge: 'Iconography',
          title: '150+ Icons. Zero Weight.',
          description: 'Stroke-based SVG icons rendered inline. No icon fonts. No sprite sheets. No external requests. Tree-shaken automatically — you only ship what you use. Every icon respects your theme colors.',
          highlights: ['Stroke SVGs', 'Tree-Shaken', 'Theme Colors', 'Inline'],
          delay: 3,
        }),
        FeatureCard({
          iconName: 'zap',
          badge: 'Styling',
          title: '1000+ Atoms. Runtime Generated.',
          description: 'Underscore-prefixed atomic utilities that never collide with anything. No config files. No PostCSS plugins. No purge step. They exist when you need them and vanish when you don\'t.',
          highlights: ['Zero Config', 'No Conflicts', 'On-Demand', 'Composable'],
          delay: 4,
        }),
        FeatureCard({
          iconName: 'cpu',
          badge: 'Design System',
          title: '10 Seeds. 170+ Tokens.',
          description: 'Define 10 colors and a personality. The derivation engine algorithmically expands them into 170+ design tokens — surfaces, elevations, gradients, focus rings, chart palettes. WCAG AA contrast guaranteed. Mathematically.',
          highlights: ['Algorithmic', 'WCAG AA', 'Auto-Derived', 'Multi-Mode'],
          delay: 5,
        }),
      ),

      // Enterprise callout
      div({ class: `ds-glass-strong ds-animate ds-delay-6 ${css('_flex _col _aic _tc _gap4 _p8 _w100')}` },
        div({ class: css('_flex _row _gap4 _aic') },
          icon('shield', { size: '24px', class: css('_fg[var(--d-success)]') }),
          h3({ class: css('_textlg _fwheading _fgfg') }, 'Enterprise-Grade. Day One.'),
        ),
        p({ class: css('_textbase _lhrelaxed _fgmutedfg _maxw[700px]') },
          'Form validation. Data tables with virtual scroll. Route guards. Error boundaries. Suspense. Context injection. TypeScript declarations. ',
          span({ class: css('_fgfg _fw[600]') }, 'Everything you need to ship production apps, without reaching for a single third-party package.'),
        ),
      ),
    ),
  );
}
