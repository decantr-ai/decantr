import { InputGroup, CompactGroup, Input, Button, Select } from '@decantr/ui/components';

export default {
  component: (props) => {
    if (props._type === 'compact') {
      return CompactGroup(props, Input({ placeholder: 'Search' }), Button({ variant: 'primary' }, 'Go'));
    }
    const addon = props._addon || '$';
    const children = [
      InputGroup.Addon(addon),
      Input({ placeholder: props._placeholder || 'Amount' }),
    ];
    if (props._suffix) children.push(InputGroup.Addon(props._suffix));
    return InputGroup(props, ...children);
  },
  title: 'InputGroup',
  category: 'components/form',
  description: 'Compose inputs with addons (text, icons, buttons). Includes CompactGroup for border-merged controls.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'Prefix $', props: { _addon: '$' } },
    { name: 'Suffix .00', props: { _addon: '$', _suffix: '.00' } },
    { name: 'Vertical', props: { vertical: true } },
    { name: 'Size XS', props: { size: 'xs' } },
    { name: 'Size SM', props: { size: 'sm' } },
    { name: 'Size LG', props: { size: 'lg' } },
    { name: 'Error', props: { error: true } },
    { name: 'Disabled', props: { disabled: true } },
    { name: 'CompactGroup', props: { _type: 'compact' } },
  ],
  playground: {
    defaults: { _addon: '$', _placeholder: 'Amount' },
    controls: [
      { name: 'size', type: 'select', options: ['default', 'xs', 'sm', 'lg'] },
      { name: 'vertical', type: 'boolean' },
      { name: 'error', type: 'boolean' },
      { name: 'disabled', type: 'boolean' },
      { name: '_addon', type: 'text' },
      { name: '_suffix', type: 'text' },
      { name: '_placeholder', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic with prefix addon',
      code: `import { InputGroup, Input } from '@decantr/ui/components';

const group = InputGroup({},
  InputGroup.Addon('$'),
  Input({ placeholder: 'Amount' })
);
document.body.appendChild(group);`,
    },
    {
      title: 'CompactGroup',
      code: `import { CompactGroup, Input, Button } from '@decantr/ui/components';

const group = CompactGroup({},
  Input({ placeholder: 'Search' }),
  Button({ variant: 'primary' }, 'Go')
);`,
    },
  ],
};
