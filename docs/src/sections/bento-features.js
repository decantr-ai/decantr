/**
 * Section 4: Bento Features — Asymmetric bento with hero + glass stat cards
 * Pattern: bento-features:asymmetric-glow
 */
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Card, icon } from 'decantr/components';

const { div, section, h2, p, span, pre } = tags;

// Terminal window with macOS chrome and glow
function TerminalPreview() {
  const arrow = '#0AF3EB';
  const success = '#00C388';
  const dim = '#666';

  return div({
    class: css('_r3 _overflow[hidden] _border _bc[rgba(0,255,200,0.15)]'),
    style: 'background: linear-gradient(145deg, #1a1a2e 0%, #0d0d14 100%); box-shadow: 0 0 40px rgba(0,255,200,0.08), inset 0 1px 0 rgba(255,255,255,0.05)'
  },
    // Window chrome
    div({ class: css('_flex _aic _gap2 _px4 _py2 _borderB _bc[rgba(255,255,255,0.05)]') },
      span({ class: css('_w3 _h3 _r[50%] _bg[#ff5f57]') }),
      span({ class: css('_w3 _h3 _r[50%] _bg[#febc2e]') }),
      span({ class: css('_w3 _h3 _r[50%] _bg[#28c840]') }),
      span({ class: css('_ml[auto] _textxs _fgmuted/50 _font[var(--d-font-mono)]') }, 'decantr-mcp')
    ),
    // Terminal content
    pre({ class: css('_p4 _m0 _textxs _lh[2] _font[var(--d-font-mono)] _wspre') },
      span({ style: `color:${dim}` }, '$ '), span({ class: css('_fgfg') }, 'decantr mcp'), '\n',
      span({ style: `color:${arrow}` }, '→'), span({ style: `color:${dim}` }, ' lookup_component '), span({ class: css('_fgfg') }, 'Button'), '\n',
      span({ style: `color:${arrow}` }, '→'), span({ style: `color:${dim}` }, ' get_pattern_code '), span({ class: css('_fgfg') }, 'hero'), '\n',
      span({ style: `color:${arrow}` }, '→'), span({ style: `color:${dim}` }, ' resolve_atoms '), span({ class: css('_fgfg') }, '_flex _gap4'), '\n',
      span({ style: `color:${success}` }, '✓ 16 tools available')
    )
  );
}

// Glass stat card with colored glow border and gradient background
function GlowStatCard({ value, label, sub, color }) {
  // Create a subtle gradient background that hints at the accent color
  const bgGradient = color
    ? `linear-gradient(135deg, ${color}08 0%, transparent 50%), linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)`
    : 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)';

  const glowStyle = color
    ? `background: ${bgGradient}; border-color: ${color}60; box-shadow: 0 0 30px ${color}20, 0 0 60px ${color}10, inset 0 1px 0 rgba(255,255,255,0.08)`
    : `background: ${bgGradient}`;

  return div({
    class: css('_p6 _r3 _flex _col _gap2 _border _h100 _trans[box-shadow_0.3s,border-color_0.3s,transform_0.2s] _h:scale[1.02]'),
    style: glowStyle
  },
    span({
      class: css('_text[3rem] _bold _lh[1]'),
      style: color ? `color:${color}; text-shadow: 0 0 30px ${color}40` : undefined
    }, value),
    span({ class: css('_textbase _fgfg _bold _mt1') }, label),
    span({ class: css('_textsm _fgmuted _lh[1.4]') }, sub)
  );
}

// Secondary stats row with subtle styling
function SecondaryStatsRow({ stats }) {
  return div({
    class: css('_p5 _r3 _flex _aic _jcc _gap10 _h100'),
    style: 'background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%); border: 1px solid rgba(255,255,255,0.06)'
  },
    ...stats.map((s, i) => [
      i > 0 ? span({ class: css('_fgmuted/20 _text[1.5rem]') }, '·') : null,
      div({ class: css('_flex _aic _gap3') },
        span({ class: css('_text[1.75rem] _bold _fgfg') }, s.value),
        span({ class: css('_textsm _fgmuted') }, s.label)
      )
    ]).flat().filter(Boolean)
  );
}

export function BentoFeaturesSection() {
  // Hero stats with glow effect
  const heroStats = [
    { value: '100+', label: 'Components', sub: 'Form, display, layout, overlay, chart', color: '#FE4474' },
    { value: '<13KB', label: 'Brotli Bundle', sub: 'Zero runtime dependencies', color: '#0AF3EB' },
  ];

  // Secondary stats (collapsed row)
  const secondaryStats = [
    { value: '48', label: 'Patterns' },
    { value: '10', label: 'Themes' },
  ];

  const features = [
    { icon: 'zap', title: 'Signal Reactivity', sub: 'No virtual DOM overhead' },
    { icon: 'shield', title: 'Enterprise Ready', sub: 'WCAG AA, route guards' },
    { icon: 'globe', title: 'SSR + Hydration', sub: 'renderToString, streaming' },
  ];

  return section({ class: css('_py24 _px6') },
    div({ class: css('_mw[1100px] _mx[auto] _flex _col _gap6') },
      // Asymmetric bento: hero left (spans 2 rows), stats right
      div({
        class: css('_grid _gap4'),
        style: 'grid-template-columns: 1.1fr 0.9fr; grid-template-rows: 1fr auto'
      },
        // Left: Hero card spanning both rows with gradient background
        div({
          style: 'grid-column: 1; grid-row: 1 / 3; background: linear-gradient(135deg, rgba(254,68,116,0.03) 0%, transparent 40%), linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.75rem; box-shadow: 0 0 60px rgba(254,68,116,0.04)'
        },
          div({ class: css('_flex _col _gap5 _p6 _h100 _jcsb') },
            div({ class: css('_flex _col _gap4') },
              span({ class: css('_fgprimary _textxs _uppercase _tracking[0.1em] _bold') },
                'AI-FIRST ARCHITECTURE'
              ),
              h2({ class: css('_heading2 _fgfg _lh[1.2]') }, 'Registry-Driven Generation'),
              p({ class: css('_fgmuted _lh[1.7]') },
                'Every component, pattern, and archetype lives in a machine-readable registry. AI doesn\'t guess — it looks up exactly what it needs.'
              )
            ),
            TerminalPreview()
          )
        ),
        // Right top: Hero stat cards with glow (row 1)
        div({ style: 'grid-column: 2; grid-row: 1', class: css('_grid _gc2 _gap4') },
          ...heroStats.map(s => GlowStatCard(s))
        ),
        // Right bottom: Secondary stats row (row 2)
        div({ style: 'grid-column: 2; grid-row: 2' },
          SecondaryStatsRow({ stats: secondaryStats })
        )
      ),
      // Bottom features row with icon glow
      div({ class: css('_grid _gc1 _md:gc3 _gap8 _pt8') },
        ...features.map(f =>
          div({ class: css('_flex _aic _gap4') },
            div({
              class: css('_w10 _h10 _r2 _flex _aic _jcc'),
              style: 'background: linear-gradient(135deg, rgba(254,68,116,0.15) 0%, rgba(254,68,116,0.05) 100%); box-shadow: 0 0 20px rgba(254,68,116,0.1)'
            },
              icon(f.icon, { class: css('_fgprimary _w5 _h5') })
            ),
            div({ class: css('_flex _col _gap1') },
              span({ class: css('_textbase _fgfg _bold') }, f.title),
              span({ class: css('_textsm _fgmuted') }, f.sub)
            )
          )
        )
      )
    )
  );
}
