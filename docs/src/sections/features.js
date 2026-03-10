import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { icon, Chip } from 'decantr/components';

const { section, div, h2, h3, p, span, code } = tags;

function FeatureCard({ iconName, badge, title, description, highlights, delay }) {
  return div({ class: `ds-glass ds-animate ds-delay-${delay} ${css('_flex _col _gap4 _p8')}` },
    div({ class: css('_flex _row _aic _gap3') },
      div({ style: 'color:var(--d-accent);background:rgba(10,243,235,0.1);padding:0.75rem;border-radius:var(--d-radius-lg);display:inline-flex' },
        icon(iconName, { size: '24px' }),
      ),
      Chip({ label: badge, variant: 'outline', size: 'sm' }),
    ),
    h3({ class: css('_textxl _fwheading'), style: 'color:var(--d-fg)' }, title),
    p({ class: css('_textbase _lhrelaxed'), style: 'color:var(--d-muted-fg)' }, description),
    // Highlight pills
    div({ class: css('_flex _row _wrap _gap2') },
      ...highlights.map(h =>
        span({ class: css('_textsm'), style: 'color:var(--d-accent);background:rgba(10,243,235,0.08);padding:0.25rem 0.75rem;border-radius:var(--d-radius-full);border:1px solid rgba(10,243,235,0.15)' }, h)
      ),
    ),
  );
}

export function FeaturesSection() {
  return section({ class: `ds-section ds-reveal ${css('_flex _col _aic')}` },
    // Decorative orb
    div({ class: 'ds-orb', style: 'width:500px;height:500px;background:rgba(254,68,116,0.06);bottom:10%;left:-15%' }),

    div({ class: css('_flex _col _aic _gap12 _relative _z10'), style: 'max-width:1100px;width:100%' },
      // Header
      div({ class: css('_flex _col _aic _gap4 _tc') },
        h2({ class: 'ds-gradient-text ds-animate', style: 'font-size:clamp(2rem,5vw,3.5rem);font-weight:800;letter-spacing:-0.03em;line-height:1.1' },
          'Built Different',
        ),
        p({ class: `ds-animate ds-delay-1 ${css('_textlg _lhrelaxed')}`, style: 'color:var(--d-muted-fg);max-width:650px' },
          'Every piece of decantr was designed from scratch. No borrowed ideas. No inherited baggage. Just ',
          span({ style: 'color:var(--d-fg);font-weight:600' }, 'solutions that didn\'t exist before.'),
        ),
      ),

      // Feature grid — 2×2
      div({ class: css('_grid _gcaf320 _gap6'), style: 'width:100%' },
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
      div({ class: `ds-glass-strong ds-animate ds-delay-6 ${css('_flex _col _aic _tc _gap4 _p8')}`, style: 'width:100%' },
        div({ class: css('_flex _row _gap4 _aic') },
          icon('shield', { size: '24px', style: 'color:var(--d-success)' }),
          h3({ class: css('_textlg _fwheading'), style: 'color:var(--d-fg)' }, 'Enterprise-Grade. Day One.'),
        ),
        p({ class: css('_textbase _lhrelaxed'), style: 'color:var(--d-muted-fg);max-width:700px' },
          'Form validation. Data tables with virtual scroll. Route guards. Error boundaries. Suspense. Context injection. TypeScript declarations. ',
          span({ style: 'color:var(--d-fg);font-weight:600' }, 'Everything you need to ship production apps, without reaching for a single third-party package.'),
        ),
      ),
    ),
  );
}
