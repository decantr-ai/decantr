import { Resizable } from '@decantr/ui/components';

function makePanel(label, bg) {
  const el = document.createElement('div');
  el.textContent = label;
  el.style.padding = '16px';
  el.style.background = bg || 'var(--d-clr-surface-2, #e5e7eb)';
  el.style.height = '100%';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  return el;
}

function renderResizable(props) {
  const el = Resizable(props, makePanel('Panel A'), makePanel('Panel B', 'var(--d-clr-surface-3, #d1d5db)'));
  el.style.height = '200px';
  el.style.border = '1px solid var(--d-clr-border, #ccc)';
  return el;
}

export default {
  component: renderResizable,
  title: 'Resizable',
  category: 'components/layout',
  description: 'Split pane layout with a draggable handle for resizing. Supports horizontal/vertical orientation, min/max constraints, and keyboard navigation.',
  variants: [
    { name: 'Horizontal', props: { direction: 'horizontal', defaultSize: 50 } },
    { name: 'Vertical', props: { direction: 'vertical', defaultSize: 50 } },
    { name: '30/70 Split', props: { defaultSize: 30 } },
    { name: '70/30 Split', props: { defaultSize: 70 } },
    { name: 'Constrained (20-80)', props: { defaultSize: 50, minSize: 20, maxSize: 80 } },
    { name: 'Tight Constraint', props: { defaultSize: 50, minSize: 40, maxSize: 60 } },
  ],
  playground: {
    defaults: { direction: 'horizontal', defaultSize: 50, minSize: 10, maxSize: 90 },
    controls: [
      { name: 'direction', type: 'select', options: ['horizontal', 'vertical'] },
      { name: 'defaultSize', type: 'number' },
      { name: 'minSize', type: 'number' },
      { name: 'maxSize', type: 'number' },
    ],
  },
  usage: [
    {
      title: 'Basic split pane',
      code: `import { Resizable } from '@decantr/ui/components';

const left = document.createElement('div');
left.textContent = 'Sidebar';
const right = document.createElement('div');
right.textContent = 'Content';

const split = Resizable({ defaultSize: 30 }, left, right);
document.body.appendChild(split);`,
    },
    {
      title: 'Vertical split with callback',
      code: `import { Resizable } from '@decantr/ui/components';

const top = document.createElement('div');
top.textContent = 'Editor';
const bottom = document.createElement('div');
bottom.textContent = 'Terminal';

const split = Resizable({
  direction: 'vertical',
  defaultSize: 60,
  onResize: (pct) => console.log('Size:', pct)
}, top, bottom);`,
    },
  ],
};
