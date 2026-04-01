import { h } from '@decantr/ui/runtime';
import { css } from '@decantr/css';
import { navigate } from '@decantr/ui/router';
import { Button, Card, Badge, Input } from '@decantr/ui/components';

// ---------------------------------------------------------------------------
// Section: Hero
// ---------------------------------------------------------------------------
function Hero() {
  const section = h('section', {
    class: css('flex', 'col', 'aic', 'textc', 'py20', 'px6'),
  });

  const heading = h('h1', {
    class: css('text5xl', 'fontextrabold'),
    style: 'letter-spacing:-0.025em; max-width:48rem',
  }, 'The Native UI Framework');
  section.appendChild(heading);

  const sub = h('p', {
    class: css('textlg', 'fgmuted', 'mt4'),
    style: 'max-width:40rem; line-height:1.7',
  }, '107 components. Signal reactivity. Zero dependencies. Custom compiler. 25 chart types. Atomic CSS.');
  section.appendChild(sub);

  // CTA row
  const actions = h('div', {
    class: css('flex', 'aic', 'gap4', 'mt8', 'wrap', 'jcc'),
  });

  const getStarted = Button(
    { variant: 'primary', size: 'lg', onclick: () => navigate('/getting-started') },
    'Get Started'
  );
  actions.appendChild(getStarted);

  const npmBox = h('code', {
    class: css('px6', 'py3', 'rounded', 'textbase', 'selectall', 'pointer'),
    style: 'background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); font-family:ui-monospace,SFMono-Regular,Menlo,monospace; color:rgba(255,255,255,0.8)',
    title: 'Click to copy',
    onclick: () => {
      navigator.clipboard.writeText('npm i @decantr/ui');
    },
  }, 'npm i @decantr/ui');
  actions.appendChild(npmBox);

  section.appendChild(actions);

  return section;
}

// ---------------------------------------------------------------------------
// Section: Feature Grid
// ---------------------------------------------------------------------------
const FEATURES = [
  {
    title: 'Signal Reactivity',
    description: 'Fine-grained updates. No virtual DOM. No diffing overhead.',
    badge: 'Core',
  },
  {
    title: 'Atomic CSS',
    description: 'Zero-runtime. Tree-shaken. Theme-aware design tokens.',
    badge: 'Styles',
  },
  {
    title: 'Custom Compiler',
    description: 'Dead code elimination. Tree shaking. 8 built-in lint rules.',
    badge: 'Build',
  },
  {
    title: '107 Components',
    description: 'From Button to DataTable. Forms, navigation, feedback, charts.',
    badge: 'UI',
  },
  {
    title: '25 Chart Types',
    description: 'SVG, Canvas, WebGPU renderers. Streaming data. Responsive.',
    badge: 'Charts',
  },
  {
    title: 'Design Intelligence',
    description: 'Essence-driven. Guard-validated. Theme-consistent.',
    badge: 'DI',
  },
];

function FeatureGrid() {
  const section = h('section', {
    class: css('px6', 'py16'),
    style: 'max-width:72rem; margin:0 auto; width:100%',
  });

  const heading = h('h2', {
    class: css('text3xl', 'fontbold', 'textc', 'mb10'),
  }, 'Everything you need');
  section.appendChild(heading);

  const grid = h('div', {
    class: css('grid', 'gap6'),
    style: 'grid-template-columns:repeat(auto-fit,minmax(300px,1fr))',
  });

  for (const feat of FEATURES) {
    const card = Card({ hoverable: true, class: css('p0') },
      Card.Body({},
        h('div', { class: css('flex', 'aic', 'gap3', 'mb3') },
          h('span', { class: css('text2xl', 'fontbold') }, feat.title),
          Badge({ variant: 'primary', solid: true }, feat.badge),
        ),
        h('p', {
          class: css('fgmuted', 'textsm'),
          style: 'line-height:1.6',
        }, feat.description),
      ),
    );
    grid.appendChild(card);
  }

  section.appendChild(grid);
  return section;
}

// ---------------------------------------------------------------------------
// Section: Live Demo
// ---------------------------------------------------------------------------
function LiveDemo() {
  const section = h('section', {
    class: css('px6', 'py16'),
    style: 'max-width:72rem; margin:0 auto; width:100%',
  });

  const heading = h('h2', {
    class: css('text3xl', 'fontbold', 'textc', 'mb3'),
  }, 'Live components');
  section.appendChild(heading);

  const sub = h('p', {
    class: css('textc', 'fgmuted', 'mb10'),
  }, 'These are real @decantr/ui components rendered right now. No screenshots.');
  section.appendChild(sub);

  const container = h('div', {
    class: css('rounded', 'p8'),
    style: 'background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08)',
  });

  // Row 1: Button variants
  const row1Label = h('p', {
    class: css('textsm', 'fgmuted', 'mb3', 'fontmedium', 'uppercase'),
    style: 'letter-spacing:0.05em',
  }, 'Buttons');
  container.appendChild(row1Label);

  const btnRow = h('div', { class: css('flex', 'wrap', 'gap3', 'mb8') });
  btnRow.appendChild(Button({ variant: 'primary' }, 'Primary'));
  btnRow.appendChild(Button({ variant: 'secondary' }, 'Secondary'));
  btnRow.appendChild(Button({ variant: 'outline' }, 'Outline'));
  btnRow.appendChild(Button({ variant: 'ghost' }, 'Ghost'));
  btnRow.appendChild(Button({ variant: 'destructive' }, 'Destructive'));
  btnRow.appendChild(Button({ variant: 'success' }, 'Success'));
  container.appendChild(btnRow);

  // Row 2: Card with Badge
  const row2Label = h('p', {
    class: css('textsm', 'fgmuted', 'mb3', 'fontmedium', 'uppercase'),
    style: 'letter-spacing:0.05em',
  }, 'Card + Badge');
  container.appendChild(row2Label);

  const demoCard = Card({ title: 'DataTable', hoverable: true, extra: Badge({ variant: 'success', solid: true }, 'Stable') },
    h('p', { class: css('fgmuted', 'textsm') }, 'Sortable columns, virtual scroll, row selection, pagination, and CSV export — all built in.'),
  );
  const cardWrap = h('div', { class: css('mb8'), style: 'max-width:24rem' });
  cardWrap.appendChild(demoCard);
  container.appendChild(cardWrap);

  // Row 3: Input
  const row3Label = h('p', {
    class: css('textsm', 'fgmuted', 'mb3', 'fontmedium', 'uppercase'),
    style: 'letter-spacing:0.05em',
  }, 'Input');
  container.appendChild(row3Label);

  const inputRow = h('div', { class: css('flex', 'wrap', 'gap4'), style: 'max-width:32rem' });
  inputRow.appendChild(Input({ placeholder: 'Default input', 'aria-label': 'Demo input' }));
  inputRow.appendChild(Input({ placeholder: 'With label', label: 'Email', 'aria-label': 'Email input' }));
  container.appendChild(inputRow);

  section.appendChild(container);
  return section;
}

// ---------------------------------------------------------------------------
// Section: Stats Bar
// ---------------------------------------------------------------------------
function StatsBar() {
  const section = h('section', {
    class: css('flex', 'jcc', 'aic', 'wrap', 'py10', 'px6', 'gap6', 'fgmuted'),
    style: 'font-size:1.05rem; letter-spacing:0.01em',
  });

  const stats = ['107 Components', '25 Charts', '50+ Icons', '8 Themes', '0 Dependencies'];
  stats.forEach((stat, i) => {
    if (i > 0) {
      section.appendChild(h('span', { style: 'opacity:0.3', 'aria-hidden': 'true' }, '\u00B7'));
    }
    section.appendChild(h('span', { class: css('fontmedium') }, stat));
  });

  return section;
}

// ---------------------------------------------------------------------------
// Section: CTA
// ---------------------------------------------------------------------------
function CTASection() {
  const section = h('section', {
    class: css('flex', 'col', 'aic', 'textc', 'py20', 'px6'),
  });

  const heading = h('h2', {
    class: css('text4xl', 'fontbold', 'mb3'),
  }, 'Ready to build?');
  section.appendChild(heading);

  const sub = h('p', {
    class: css('fgmuted', 'textlg', 'mb8'),
  }, 'Start shipping polished interfaces in minutes.');
  section.appendChild(sub);

  const actions = h('div', { class: css('flex', 'gap4', 'wrap', 'jcc') });

  actions.appendChild(
    Button({ variant: 'primary', size: 'lg', onclick: () => navigate('/getting-started') }, 'Get Started')
  );
  actions.appendChild(
    Button({ variant: 'outline', size: 'lg', onclick: () => navigate('/components') }, 'Browse Components')
  );

  section.appendChild(actions);
  return section;
}

// ---------------------------------------------------------------------------
// Page: Home
// ---------------------------------------------------------------------------
export function Home() {
  const page = h('div', { class: css('col') });
  page.appendChild(Hero());
  page.appendChild(FeatureGrid());
  page.appendChild(LiveDemo());
  page.appendChild(StatsBar());
  page.appendChild(CTASection());
  return page;
}
