import { Collapsible } from '@decantr/ui/components';

function makeTrigger(label) {
  return () => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label || 'Toggle';
    btn.style.padding = '8px 16px';
    btn.style.cursor = 'pointer';
    btn.style.border = '1px solid var(--d-clr-border, #ccc)';
    btn.style.borderRadius = '4px';
    btn.style.background = 'var(--d-clr-surface, #fff)';
    return btn;
  };
}

function renderCollapsible(props) {
  const { _triggerLabel = 'Toggle', _content = 'Collapsible content goes here. This section can be expanded and collapsed.', ...rest } = props;
  const content = document.createElement('div');
  content.textContent = _content;
  content.style.padding = '12px';
  content.style.background = 'var(--d-clr-surface-2, #f3f4f6)';
  content.style.borderRadius = '4px';
  content.style.marginTop = '4px';
  return Collapsible({ trigger: makeTrigger(_triggerLabel), ...rest }, content);
}

export default {
  component: renderCollapsible,
  title: 'Collapsible',
  category: 'components/layout',
  description: 'Simple expand/collapse container with animated disclosure. Supports controlled and uncontrolled open state with a customizable trigger element.',
  variants: [
    { name: 'Default (Closed)', props: {} },
    { name: 'Initially Open', props: { open: true } },
    { name: 'Custom Trigger', props: { _triggerLabel: 'Show Details' } },
    { name: 'Long Content', props: { _triggerLabel: 'Read More', _content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' } },
  ],
  playground: {
    defaults: { open: false, _triggerLabel: 'Toggle' },
    controls: [
      { name: 'open', type: 'boolean' },
      { name: '_triggerLabel', type: 'text' },
      { name: '_content', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic collapsible',
      code: `import { Collapsible } from '@decantr/ui/components';

const trigger = () => {
  const btn = document.createElement('button');
  btn.textContent = 'Toggle';
  return btn;
};
const content = document.createElement('div');
content.textContent = 'Hidden content';

const el = Collapsible({ trigger }, content);
document.body.appendChild(el);`,
    },
    {
      title: 'Controlled state',
      code: `import { Collapsible } from '@decantr/ui/components';
import { createSignal } from '@decantr/ui/state';

const [open, setOpen] = createSignal(false);
const trigger = () => {
  const btn = document.createElement('button');
  btn.textContent = 'Details';
  return btn;
};
const el = Collapsible({
  open,
  trigger,
  onToggle: (isOpen) => setOpen(isOpen)
}, document.createTextNode('Details here'));`,
    },
  ],
};
