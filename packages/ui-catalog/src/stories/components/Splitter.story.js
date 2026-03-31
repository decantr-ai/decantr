import { Splitter } from '@decantr/ui/components';

function makeContent(label, bg) {
  const el = document.createElement('div');
  el.textContent = label;
  el.style.padding = '16px';
  el.style.height = '100%';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  if (bg) el.style.background = bg;
  return el;
}

function renderSplitter(props) {
  const { _panelCount = 2, ...rest } = props;
  const colors = ['var(--d-clr-surface-2, #e5e7eb)', 'var(--d-clr-surface-3, #d1d5db)', 'var(--d-clr-surface-2, #e5e7eb)'];
  const panels = [];
  for (let i = 0; i < _panelCount; i++) {
    panels.push({
      content: makeContent(`Panel ${i + 1}`, colors[i % colors.length]),
      ...(rest._panelSize ? { size: rest._panelSize } : {}),
      ...(rest._minSize ? { min: rest._minSize } : {}),
      ...(rest._maxSize ? { max: rest._maxSize } : {}),
    });
  }
  const el = Splitter({ direction: rest.direction, panels, class: rest.class });
  el.style.height = '240px';
  el.style.border = '1px solid var(--d-clr-border, #ccc)';
  return el;
}

export default {
  component: renderSplitter,
  title: 'Splitter',
  category: 'components/layout',
  description: 'Multi-panel resizable layout with draggable handles between panels. Supports horizontal/vertical orientation, min/max constraints, and keyboard resizing.',
  variants: [
    { name: 'Two Panels', props: { direction: 'horizontal', _panelCount: 2 } },
    { name: 'Three Panels', props: { direction: 'horizontal', _panelCount: 3 } },
    { name: 'Vertical', props: { direction: 'vertical', _panelCount: 2 } },
    { name: 'Vertical 3-Panel', props: { direction: 'vertical', _panelCount: 3 } },
    { name: 'With Min (100px)', props: { direction: 'horizontal', _panelCount: 2, _minSize: '100' } },
    { name: 'With Max (400px)', props: { direction: 'horizontal', _panelCount: 2, _maxSize: '400' } },
  ],
  playground: {
    defaults: { direction: 'horizontal', _panelCount: 2 },
    controls: [
      { name: 'direction', type: 'select', options: ['horizontal', 'vertical'] },
      { name: '_panelCount', type: 'number' },
      { name: '_minSize', type: 'text' },
      { name: '_maxSize', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Two-panel split',
      code: `import { Splitter } from '@decantr/ui/components';

const left = document.createElement('div');
left.textContent = 'Sidebar';
const right = document.createElement('div');
right.textContent = 'Main';

const el = Splitter({
  direction: 'horizontal',
  panels: [
    { content: left, size: '250px', min: '100' },
    { content: right }
  ]
});
document.body.appendChild(el);`,
    },
    {
      title: 'Three-panel vertical',
      code: `import { Splitter } from '@decantr/ui/components';

const el = Splitter({
  direction: 'vertical',
  panels: [
    { content: document.createTextNode('Top'), size: '33%' },
    { content: document.createTextNode('Middle'), size: '33%' },
    { content: document.createTextNode('Bottom') }
  ]
});`,
    },
  ],
};
