import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { icon } from 'decantr/components';
import { Chart, Sparkline } from 'decantr/chart';

const { section, div, h2, h3, p, span, blockquote } = tags;

// ── Metric comparison data ──

const bundleData = [
  { framework: 'Angular', kb: 143 },
  { framework: 'React', kb: 44 },
  { framework: 'Vue', kb: 33 },
  { framework: 'Svelte', kb: 18 },
  { framework: 'Decantr', kb: 0 },
];

const tokenData = [
  { task: 'Button', other: 48, decantr: 12 },
  { task: 'Form', other: 180, decantr: 35 },
  { task: 'Dashboard', other: 520, decantr: 95 },
  { task: 'Full App', other: 1400, decantr: 280 },
];

// Scaffold velocity — time collapse to working app (normalized)
const scaffoldTrend = [2, 8, 22, 45, 72, 88, 95, 98, 100];

function MetricRow({ stat, statColor, label, description, visual, reverse, delay }) {
  const textSide = div({ class: css('_flex _col _gap4 _jcc'), style: 'flex:1;min-width:280px' },
    span({ class: 'ds-stat', style: `color:${statColor || 'var(--d-accent)'}` }, stat),
    h3({ class: css('_textxl _fwheading'), style: 'color:var(--d-fg)' }, label),
    p({ class: css('_textbase _lhrelaxed'), style: 'color:var(--d-muted-fg)' }, description),
  );

  const chartSide = div({ class: css('_flex _aic _jcc'), style: 'flex:1;min-width:280px' }, visual);

  const divider = div({ style: 'width:1px;background:linear-gradient(to bottom,transparent,rgba(255,255,255,0.1),transparent);align-self:stretch;margin:0 0.5rem;flex-shrink:0' });

  return div({ class: `ds-glass ds-animate ds-delay-${delay} ${css('_flex _row _wrap _gap6 _p8 _aic')}`, style: 'width:100%' },
    ...(reverse ? [chartSide, divider, textSide] : [textSide, divider, chartSide]),
  );
}

function PillarCard({ iconName, title, description, delay }) {
  return div({ class: `ds-glass ds-animate ds-delay-${delay} ${css('_flex _col _gap4 _p8')}` },
    div({ style: 'color:var(--d-accent);background:rgba(10,243,235,0.1);padding:0.75rem;border-radius:var(--d-radius-lg);display:inline-flex;align-self:flex-start' },
      icon(iconName, { size: '28px' }),
    ),
    h3({ class: css('_textxl _fwheading'), style: 'color:var(--d-fg)' }, title),
    p({ class: css('_textbase _lhrelaxed'), style: 'color:var(--d-muted-fg)' }, description),
  );
}

export function PhilosophySection() {
  return section({ class: `ds-section ds-reveal ${css('_flex _col _aic')}` },
    // Decorative orbs
    div({ class: 'ds-orb', style: 'width:500px;height:500px;background:rgba(10,243,235,0.06);top:20%;right:-15%' }),
    div({ class: 'ds-orb', style: 'width:400px;height:400px;background:rgba(101,0,198,0.08);bottom:10%;left:-10%' }),

    div({ class: css('_flex _col _aic _gap12 _relative _z10'), style: 'max-width:1100px;width:100%' },
      // Header
      div({ class: css('_flex _col _aic _gap4 _tc') },
        h2({ class: 'ds-gradient-text ds-animate', style: 'font-size:clamp(2rem,5vw,3.5rem);font-weight:800;letter-spacing:-0.03em;line-height:1.1' },
          'The Decantr Way',
        ),
        p({ class: `ds-animate ds-delay-1 ${css('_textlg _lhrelaxed')}`, style: 'color:var(--d-muted-fg);max-width:650px' },
          'Designed for AI. Built for developers. Engineered for ',
          span({ style: 'color:var(--d-fg);font-weight:600' }, 'world domination.'),
        ),
      ),

      // ── Metric rows (alternating layout) ──

      // Row 1: Text left, Chart right
      MetricRow({
        stat: '0 KB',
        statColor: 'var(--d-success)',
        label: 'Dependency Overhead',
        description: 'Other frameworks ship their runtime before you write a line of code. Decantr ships nothing you didn\'t ask for — zero runtime tax, zero dependency weight.',
        delay: 2,
        reverse: false,
        visual: Chart({
          type: 'bar',
          data: bundleData,
          x: 'framework',
          y: 'kb',
          height: '180px',
          grid: false,
          legend: false,
          tooltip: true,
          animate: true,
          labels: true,
          yFormat: v => `${v}KB`,
          'aria-label': 'Framework bundle size comparison',
        }),
      }),

      // Row 2: Chart left, Text right (reversed)
      MetricRow({
        stat: '~80%',
        statColor: 'var(--d-accent)',
        label: 'Fewer Tokens',
        description: 'AI agents write decantr code with dramatically fewer tokens than any other framework. Proxy tags, atomic CSS, and machine-readable registries mean your AI bills just got a lot smaller.',
        delay: 3,
        reverse: true,
        visual: Chart({
          type: 'bar',
          data: tokenData,
          x: 'task',
          y: ['other', 'decantr'],
          height: '180px',
          grid: false,
          legend: true,
          tooltip: true,
          animate: true,
          'aria-label': 'Token usage comparison for equivalent UI code',
        }),
      }),

      // Row 3: Text left, Chart right
      MetricRow({
        stat: '10x',
        statColor: 'var(--d-tertiary)',
        label: 'Faster to Production',
        description: 'From init to deployed app in minutes, not hours. No config files to write, no plugins to install, no build steps to debug. Tell an AI what you want and it builds it — immediately.',
        delay: 4,
        reverse: false,
        visual: div({ class: css('_flex _col _gap4'), style: 'width:100%' },
          div({ class: css('_flex _row _aic _gap3') },
            span({ class: css('_textsm _fwtitle'), style: 'color:var(--d-muted-fg);min-width:90px' }, 'Completion'),
            Sparkline({
              data: scaffoldTrend,
              variant: 'area',
              height: '40px',
              width: '100%',
              'aria-label': 'Scaffold velocity — rapid time to production',
            }),
          ),
          div({ class: css('_flex _row _aic _gap3') },
            span({ class: css('_textsm _fwtitle'), style: 'color:var(--d-muted-fg);min-width:90px' }, 'Complexity'),
            Sparkline({
              data: [100, 95, 88, 72, 45, 22, 8, 2, 0],
              variant: 'line',
              height: '40px',
              width: '100%',
              'aria-label': 'Complexity reduction over scaffolding',
            }),
          ),
          div({ class: css('_flex _row _aic _gap3') },
            span({ class: css('_textsm _fwtitle'), style: 'color:var(--d-muted-fg);min-width:90px' }, 'Config Files'),
            Sparkline({
              data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
              variant: 'bar',
              height: '40px',
              width: '100%',
              'aria-label': 'Zero config files needed',
            }),
          ),
        ),
      }),

      // ── Three pillars ──
      div({ class: css('_grid _gcaf300 _gap6'), style: 'width:100%' },
        PillarCard({
          iconName: 'cpu',
          title: 'AI-First Architecture',
          description: 'Every API is optimized for token efficiency. Proxy-based tag functions eliminate string tag names. A machine-readable registry lets AI agents generate correct code without parsing source files. Decantr doesn\'t just support AI — it speaks AI natively.',
          delay: 5,
        }),
        PillarCard({
          iconName: 'shield',
          title: 'Zero Dependencies',
          description: 'No node_modules bloat. No supply chain vulnerabilities. No version conflicts at 3am. Every line of code is ours — audited, tested, and owned. When your framework has zero dependencies, your attack surface is zero.',
          delay: 6,
        }),
        PillarCard({
          iconName: 'layers',
          title: 'Systems Thinking',
          description: '10 seed colors derive 170+ tokens. One style definition drives every component across every mode. Change a personality trait and the entire universe transforms — radius, shadows, motion, spacing, gradients. This is design at scale.',
          delay: 7,
        }),
      ),

      // Manifesto quote
      div({ class: `ds-glass-strong ds-animate ds-delay-8 ${css('_flex _col _aic _tc _p10 _gap6')}`, style: 'width:100%' },
        div({ style: 'width:60px;height:2px;background:var(--d-gradient-brand);border-radius:var(--d-radius-full)' }),
        blockquote({ style: 'font-size:clamp(1.25rem,3vw,1.75rem);font-weight:600;line-height:1.4;color:var(--d-fg);max-width:800px;font-style:italic' },
          '"The future of web development is AI-generated, human-curated, and zero-compromise. We didn\'t build another framework. We built the last one you\'ll ever need."',
        ),
        div({ style: 'width:60px;height:2px;background:var(--d-gradient-brand);border-radius:var(--d-radius-full)' }),
      ),

      // Coming soon teaser
      div({ class: `ds-animate ds-delay-9 ${css('_flex _col _aic _tc _gap3')}` },
        p({ class: css('_textlg'), style: 'color:var(--d-muted-fg)' }, 'Something massive is coming.'),
        p({ class: 'ds-gradient-text', style: 'font-size:clamp(1.5rem,4vw,2.5rem);font-weight:800;letter-spacing:-0.02em' },
          'Stay tuned.',
        ),
      ),
    ),
  );
}
