import { tags } from 'decantr/tags';
import { css } from 'decantr/css';
import { onDestroy } from 'decantr/core';
import { icon } from 'decantr/components';
import { Vocabulary } from '../sections/vocabulary.js';
import { SiteFooter } from '../sections/footer.js';

const { div, section, h1, h2, p, span, ul, li, pre } = tags;

// ── Stage data ──

const stages = [
  {
    name: 'POUR', title: 'Express Your Intent', iconName: 'droplet',
    bullets: [
      'Describe what you want in natural language \u2014 one sentence is enough',
      'No forms, wizards, or configuration files',
      'Your prompt is the only input the pipeline needs',
    ],
    ai: { label: 'Intent Parsing', desc: 'The LLM classifies your prompt into a domain archetype, extracts feature requirements, and identifies implied constraints like auth, real-time data, or responsive layout.' },
  },
  {
    name: 'SETTLE', title: 'Five Layers Emerge', iconName: 'layers',
    bullets: [
      'Your intent decomposes into five structured layers automatically',
      'Terroir, Vintage, Character, Structure, Tannins \u2014 each with a precise role',
      'Layers are structured data, not free-form interpretation',
    ],
    ai: { label: 'Structured Decomposition', desc: 'The LLM maps your requirements to the five-layer schema \u2014 selecting a domain archetype, matching a visual recipe, inferring personality traits, and planning page structure and system integrations.' },
  },
  {
    name: 'CLARIFY', title: 'Your Project\u2019s DNA', iconName: 'diamond',
    bullets: [
      'Layers crystallize into decantr.essence.json \u2014 persistent project identity',
      'Every future session reads it before writing a single line of code',
      'Drift ends here \u2014 written once, referenced forever',
    ],
    ai: { label: 'Schema Validation', desc: 'The LLM serializes the five layers into a validated JSON file against the Essence schema. This becomes the single source of truth \u2014 loaded into context before any future generation.' },
  },
  {
    name: 'DECANT', title: 'Spatial Resolution', iconName: 'filter',
    bullets: [
      'Each page resolves to a Blend \u2014 a row-based layout tree',
      'Components, columns, and spacing are specified, not guessed',
      'Every pixel has a spec, every spec has a reason',
    ],
    ai: { label: 'Layout Planning', desc: 'For each page in the Structure, the LLM resolves a Blend spec \u2014 choosing components from the registry, arranging them in rows and columns, and assigning responsive breakpoints.' },
  },
  {
    name: 'SERVE', title: 'Deterministic Generation', iconName: 'code',
    bullets: [
      'Blend specs are consumed and code is generated \u2014 not improvised',
      'Same spec produces identical output across any LLM',
      'Zero-dependency native JS/CSS/HTML \u2014 no framework lock-in',
    ],
    ai: { label: 'Code Emission', desc: 'The LLM reads each Blend spec and emits framework calls \u2014 tags, css atoms, component props, router config, state signals \u2014 deterministically from the spec, not from creative interpretation.' },
  },
  {
    name: 'AGE', title: 'Identity Deepens', iconName: 'shield',
    bullets: [
      'Cork Rules validate every change against the Essence \u2014 no drift',
      'Tasting Notes log every decision as an append-only changelog',
      'Context accumulates across sessions, never lost',
    ],
    ai: { label: 'Drift Prevention', desc: 'On every subsequent prompt, the LLM re-reads the Essence and Cork Rules before generating. Changes are validated against the project\u2019s identity. Decisions are appended to Tasting Notes for full traceability.' },
  },
];

// ── Tech callout builders (one per stage) ──

function techPour() {
  return div({ class: `ds-glass-subtle ${css('_p4')}` },
    div({ class: css('_flex _row _aic _gap2 _mb2 _fgaccent') },
      icon('message-square', { size: '14px' }),
      span({ class: css('_caption _fwheading') }, 'Your prompt'),
    ),
    p({ class: css('_fgfg _t[0.85rem] _lh[1.5] _m0') + ' ds-code' },
      '\u201CBuild me a SaaS dashboard with real-time analytics, user management, and dark mode.\u201D',
    ),
  );
}

function techSettle() {
  const layers = [
    { n: 'Terroir', d: 'domain archetype' },
    { n: 'Vintage', d: 'visual identity' },
    { n: 'Character', d: 'brand personality' },
    { n: 'Structure', d: 'page/view map' },
    { n: 'Tannins', d: 'functional systems' },
  ];
  return div({ class: css('_flex _row _wrap _gap2') },
    ...layers.map(l =>
      span({ class: `ds-glass-subtle ${css('_caption _px3 _py1')}` },
        span({ class: css('_fwheading _fgaccent') }, l.n),
        span({ class: css('_fgmutedfg') }, ` \u2014 ${l.d}`),
      )
    ),
  );
}

function techClarify() {
  return div({ class: `ds-glass-strong ${css('_p4')}` },
    div({ class: css('_flex _row _aic _gap2'), class: css('_fgaccent _mb3') },
      icon('file-text', { size: '14px' }),
      span({ class: css('_fontmono _t[0.8rem]') }, 'decantr.essence.json'),
    ),
    pre({ class: 'ds-code', class: css('_m0 _lh[1.7] _t[0.8rem] _wspre _overflow[auto]') },
      span({ class: 'ds-code-brace' }, '{'), '\n',
      '  ', span({ class: 'ds-code-key' }, '"terroir"'), ': ', span({ class: 'ds-code-str' }, '"saas-dashboard"'), ',\n',
      '  ', span({ class: 'ds-code-key' }, '"vintage"'), ': ', span({ class: 'ds-code-brace' }, '{'), '\n',
      '    ', span({ class: 'ds-code-key' }, '"style"'), ': ', span({ class: 'ds-code-str' }, '"command-center"'), ',\n',
      '    ', span({ class: 'ds-code-key' }, '"mode"'), ': ', span({ class: 'ds-code-str' }, '"dark"'), '\n',
      '  ', span({ class: 'ds-code-brace' }, '}'), ',\n',
      '  ', span({ class: 'ds-code-key' }, '"character"'), ': [', span({ class: 'ds-code-str' }, '"tactical"'), ', ', span({ class: 'ds-code-str' }, '"data-dense"'), ']\n',
      span({ class: 'ds-code-brace' }, '}'),
    ),
  );
}

function techDecant() {
  return div({ class: `ds-glass-strong ${css('_p4')}` },
    div({ class: css('_flex _row _aic _gap2'), class: css('_fgaccent _mb3') },
      icon('layout', { size: '14px' }),
      span({ class: css('_fontmono _t[0.8rem]') }, 'blend.json'),
    ),
    pre({ class: 'ds-code', class: css('_m0 _lh[1.7] _t[0.8rem] _wspre _overflow[auto]') },
      span({ class: 'ds-code-brace' }, '['), '\n',
      '  ', span({ class: 'ds-code-str' }, '"kpi-grid"'), ',\n',
      '  ', span({ class: 'ds-code-str' }, '"data-table"'), ',\n',
      '  ', span({ class: 'ds-code-brace' }, '{'), '\n',
      '    ', span({ class: 'ds-code-key' }, '"cols"'), ': [', span({ class: 'ds-code-str' }, '"activity-feed"'), ', ', span({ class: 'ds-code-str' }, '"chart-grid"'), '],\n',
      '    ', span({ class: 'ds-code-key' }, '"at"'), ': ', span({ class: 'ds-code-str' }, '"lg"'), '\n',
      '  ', span({ class: 'ds-code-brace' }, '}'), '\n',
      span({ class: 'ds-code-brace' }, ']'),
    ),
  );
}

function techServe() {
  return div({ class: `ds-glass-strong ${css('_p4')}` },
    div({ class: css('_flex _row _aic _gap2'), class: css('_fgaccent _mb3') },
      icon('terminal', { size: '14px' }),
      span({ class: css('_fontmono _t[0.8rem]') }, 'Terminal'),
    ),
    pre({ class: 'ds-code', class: css('_m0 _lh[1.7] _t[0.8rem] _wspre _overflow[auto]') },
      span({ class: css('_fgmuted') }, '$ '), span({ class: css('_fgaccent') }, 'decantr build'), '\n',
      '\n',
      span({ class: css('_fg[var(--d-success)]') }, '\u2713'), ' index.html  ', span({ class: 'ds-code-num' }, '2.1kb'), '\n',
      span({ class: css('_fg[var(--d-success)]') }, '\u2713'), ' app.js      ', span({ class: 'ds-code-num' }, '14.3kb'), '\n',
      span({ class: css('_fg[var(--d-success)]') }, '\u2713'), ' style.css   ', span({ class: 'ds-code-num' }, '3.8kb'),
    ),
  );
}

function techAge() {
  return div({ class: css('_flex _row _wrap _gap2') },
    div({ class: `ds-glass-subtle ${css('_flex _row _aic _gap2 _px3 _py2 _fgaccent')}` },
      icon('shield', { size: '14px' }),
      span({ class: css('_fontmono _t[0.8rem] _fgfg') }, 'cork.rules.json'),
    ),
    div({ class: `ds-glass-subtle ${css('_flex _row _aic _gap2 _px3 _py2 _fgaccent')}` },
      icon('file-text', { size: '14px' }),
      span({ class: css('_fontmono _t[0.8rem] _fgfg') }, 'tasting-notes.md'),
    ),
  );
}

const techBuilders = [techPour, techSettle, techClarify, techDecant, techServe, techAge];

// ── Build a content panel for a stage ──

function buildPanel(stage, idx) {
  return div({ class: css('_flex _col _gap5') },
    // Stage header
    div({ class: css('_flex _row _aic _gap3') },
      span({ class: `ds-stage-num ${css('_flex _aic _jcc')}` }, String(idx + 1)),
      h2({ class: `ds-heading-sm ds-gradient-text ${css('_fw[800] _ls[-0.03em] _lh[1.15] _m0')}` },
        `${stage.name} \u2014 ${stage.title}`,
      ),
    ),
    // Two-column: copy left, visual right
    div({ class: css('_flex _row _wrap _gap6 _aisstart') },
      // Left: bullets
      ul({ class: `ds-no-bullets ${css('_flex _col _gap2 _flex1 _minw[240px] _m0 _pl4')}` },
        ...stage.bullets.map(b =>
          li({ class: css('_flex _row _gap2 _fgmutedfg') },
            span({ class: css('_fgaccent _shrink0 _mt[0.4em] _t[0.45rem]') }, '\u25CF'),
            span({ class: css('_body _lhrelaxed') }, b),
          )
        ),
      ),
      // Right: tech callout
      div({ class: css('_flex1 _minw[240px]') },
        techBuilders[idx](),
      ),
    ),
    // AI process widget
    div({ class: css('_flex _col _gap0') },
      // Gradient divider
      div({ class: `ds-gradient-divider ${css('_h[1px] _mb4')}` }),
      div({ class: css('_flex _row _gap3 _aisstart _pl4') },
        // Icon accent
        div({ class: `ds-ai-icon-bg ${css('_shrink0 _mt[2px] _w[20px] _h[20px] _radius _flex _aic _jcc')}` },
          icon('cpu', { size: '12px', class: css('_fgaccent') }),
        ),
        div({ class: css('_flex _col _gap1') },
          span({ class: css('_caption _fwheading _fgaccent _uppercase _ls[0.06em]') },
            stage.ai.label,
          ),
          p({ class: css('_caption _lhrelaxed _fgmutedfg _m0') },
            stage.ai.desc,
          ),
        ),
      ),
    ),
  );
}

// ── Page ──

export function HowItWorksPage() {
  let activeIdx = 0;
  let autoTimer = null;
  let fadeTimeout = null;

  // Pre-build all panels
  const panels = stages.map((s, i) => buildPanel(s, i));

  // Pipeline elements
  const dots = [];
  const labels = [];
  const lines = [];

  // Content area — starts with first panel visible
  const contentArea = div({ class: 'ds-phase-content', style: 'opacity:1' });
  contentArea.appendChild(panels[0]);

  // ── Phase switching ──

  function setPhase(idx) {
    if (idx === activeIdx && dots[activeIdx]?.classList.contains('ds-dot-current')) return;
    activeIdx = idx;

    // Update pipeline dots
    dots.forEach((d, i) => {
      d.classList.remove('ds-dot-past', 'ds-dot-current');
      if (i < idx) d.classList.add('ds-dot-past');
      else if (i === idx) d.classList.add('ds-dot-current');
      d.tabIndex = i === idx ? 0 : -1;
      d.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });

    // Update labels
    labels.forEach((l, i) => {
      l.classList.toggle('ds-label-current', i === idx);
    });

    // Update lines — lines before active are filled, at/after are dimmed
    lines.forEach((l, i) => {
      l.classList.toggle('ds-line-future', i >= idx);
    });

    // Fade content
    if (fadeTimeout) clearTimeout(fadeTimeout);
    contentArea.style.opacity = '0';
    fadeTimeout = setTimeout(() => {
      contentArea.replaceChildren(panels[idx]);
      contentArea.style.opacity = '1';
      fadeTimeout = null;
    }, 400);
  }

  function stopTimer() {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  function startTimer() {
    autoTimer = setInterval(() => {
      setPhase((activeIdx + 1) % stages.length);
    }, 6000);
  }

  // ── Build pipeline ──

  const pipelineNodes = stages.flatMap((s, i) => {
    const dot = div({
      class: `ds-pipeline-dot ${css('_flex _aic _jcc')}`,
      role: 'tab',
      tabindex: i === 0 ? '0' : '-1',
      'aria-selected': i === 0 ? 'true' : 'false',
      'aria-label': `Stage ${i + 1}: ${s.name} \u2014 ${s.title}`,
      onclick: () => { stopTimer(); setPhase(i); },
      onkeydown: (e) => {
        if (e.key === 'ArrowRight' && i < stages.length - 1) { e.preventDefault(); stopTimer(); setPhase(i + 1); dots[i + 1].focus(); }
        if (e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); stopTimer(); setPhase(i - 1); dots[i - 1].focus(); }
      },
    }, icon(s.iconName, { size: '20px' }));
    dots.push(dot);

    const label = span({ class: `ds-pipeline-label ${css('_textsm _fwheading')}` }, s.name);
    labels.push(label);

    const node = div({ class: `ds-pipeline-node ${css('_flex _col _aic _gap2')}` }, dot, label);

    if (i < stages.length - 1) {
      const line = div({ class: 'ds-pipeline-line' });
      lines.push(line);
      return [node, line];
    }
    return [node];
  });

  // Set initial state (no transition)
  dots[0].classList.add('ds-dot-current');
  labels[0].classList.add('ds-label-current');
  lines.forEach(l => l.classList.add('ds-line-future'));

  // Start auto-advance
  startTimer();
  onDestroy(() => { stopTimer(); if (fadeTimeout) clearTimeout(fadeTimeout); });

  return div(
    // ── Compact Hero ──
    section({ class: `ds-mesh ${css('_flex _col _aic _relative _ohidden _p[calc(var(--d-sp-16)+60px)_var(--d-sp-8)_var(--d-sp-8)]')}` },
      div({ class: `ds-orb ds-pulse ds-orb-purple-10 ${css('_w[400px] _h[400px] _top[-15%] _left[-10%]')}` }),
      div({ class: `ds-orb ds-pulse ds-orb-cyan-06 ds-delay-1500 ${css('_w[300px] _h[300px] _bottom[-10%] _right[-5%]')}` }),

      div({ class: css('_flex _col _aic _gap4 _relative _z10 _tc _maxw[700px]') },
        h1({ class: `ds-heading ds-gradient-text ds-animate ${css('_fw[900] _ls[-0.04em] _lh[1.1]')}` },
          'The Decantation Process',
        ),
        p({ class: `ds-animate ds-delay-1 ${css('_textlg _lhrelaxed _fgmutedfg')}` },
          'From raw intent to production code \u2014 six stages, zero ambiguity.',
        ),
      ),
    ),

    // ── Phase Viewer ──
    section({ class: `ds-mesh ds-section ${css('_flex _col _aic _relative _ohidden')}` },
      div({ class: `ds-orb ds-orb-purple-06 ${css('_w[500px] _h[500px] _top[10%] _right[-15%]')}` }),
      div({ class: `ds-orb ds-orb-cyan-04 ${css('_w[350px] _h[350px] _bottom[20%] _left[-10%]')}` }),

      div({ class: css('_flex _col _gap12 _relative _z10 _maxw[1100px] _w100') },
        // Pipeline bar
        div({
          class: `ds-pipeline ds-pipeline-phase ${css('_flex _aic _jcc _wrap')}`,
          role: 'tablist',
          'aria-label': 'Decantation process stages',
        }, ...pipelineNodes),

        // Content area
        div({ class: css('_maxw[900px] _w100 _mx[auto]') },
          contentArea,
        ),
      ),
    ),

    // ── Vocabulary + Footer ──
    Vocabulary(),
    SiteFooter(),
  );
}
