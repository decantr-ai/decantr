import { Toggle } from '@decantr/ui/components';

export default {
  component: (props) => Toggle(props, props._content || 'Toggle'),
  title: 'Toggle',
  category: 'components/general',
  description: 'Pressable button with on/off state using aria-pressed for accessibility.',
  variants: [
    { name: 'Default', props: { _content: 'Toggle' } },
    { name: 'Pressed', props: { pressed: true, _content: 'Pressed' } },
    { name: 'Outline', props: { variant: 'outline', _content: 'Outline' } },
    { name: 'Outline Pressed', props: { variant: 'outline', pressed: true, _content: 'Outline On' } },
    { name: 'Size XS', props: { size: 'xs', _content: 'XS' } },
    { name: 'Size SM', props: { size: 'sm', _content: 'SM' } },
    { name: 'Size LG', props: { size: 'lg', _content: 'LG' } },
    { name: 'Disabled', props: { disabled: true, _content: 'Disabled' } },
  ],
  playground: {
    defaults: { _content: 'Toggle' },
    controls: [
      { name: 'variant', type: 'select', options: ['default', 'outline'] },
      { name: 'size', type: 'select', options: ['default', 'xs', 'sm', 'lg'] },
      { name: 'pressed', type: 'boolean' },
      { name: 'disabled', type: 'boolean' },
      { name: '_content', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic toggle',
      code: `import { Toggle } from '@decantr/ui/components';

const toggle = Toggle({ onchange: (pressed) => console.log(pressed) }, 'Bold');
document.body.appendChild(toggle);`,
    },
    {
      title: 'Pre-pressed toggle',
      code: `import { Toggle } from '@decantr/ui/components';

const toggle = Toggle({ pressed: true, variant: 'outline' }, 'Active');
document.body.appendChild(toggle);`,
    },
  ],
};
