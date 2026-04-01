import { Paragraph } from '@decantr/ui/components';

export default {
  component: (props) => Paragraph(props, props._content || 'This is a paragraph of text with relaxed line-height for comfortable reading.'),
  title: 'Paragraph',
  category: 'components/general',
  description: 'Block-level text element with relaxed line-height and semantic type variants.',
  variants: [
    { name: 'Default', props: { _content: 'This is a default paragraph with relaxed line-height for comfortable reading across longer blocks of text.' } },
    { name: 'Secondary', props: { type: 'secondary', _content: 'This secondary paragraph is used for supplementary information.' } },
    { name: 'Success', props: { type: 'success', _content: 'Operation completed successfully. All changes have been saved.' } },
    { name: 'Warning', props: { type: 'warning', _content: 'Warning: this action cannot be undone. Please review before continuing.' } },
    { name: 'Danger', props: { type: 'danger', _content: 'Error: something went wrong. Please try again later.' } },
    { name: 'Strong', props: { strong: true, _content: 'This bold paragraph emphasizes important information.' } },
    { name: 'Italic', props: { italic: true, _content: 'This italic paragraph conveys a different tone or emphasis.' } },
  ],
  playground: {
    defaults: { _content: 'A sample paragraph for the playground.' },
    controls: [
      { name: 'type', type: 'select', options: ['default', 'secondary', 'success', 'warning', 'danger'] },
      { name: 'strong', type: 'boolean' },
      { name: 'italic', type: 'boolean' },
      { name: '_content', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic paragraph',
      code: `import { Paragraph } from '@decantr/ui/components';

const p = Paragraph({}, 'Welcome to the application. Get started by exploring the components.');
document.body.appendChild(p);`,
    },
    {
      title: 'Warning paragraph',
      code: `import { Paragraph } from '@decantr/ui/components';

const p = Paragraph({ type: 'warning', strong: true }, 'This action is irreversible.');
document.body.appendChild(p);`,
    },
  ],
};
