import { Accordion } from '@decantr/ui/components';

const sampleItems = [
  { id: 'a1', title: 'What is Decantr?', content: 'Decantr is a Design Intelligence API for AI coding assistants.' },
  { id: 'a2', title: 'How does it work?', content: 'It provides a structured schema that AI uses to generate consistent UIs.' },
  { id: 'a3', title: 'Is it free?', content: 'Decantr offers both free and premium tiers.' },
];

export default {
  component: (props) => Accordion(props),
  title: 'Accordion',
  category: 'components/original',
  description: 'Collapsible content sections with animated open/close and keyboard navigation.',
  variants: [
    { name: 'Default', props: { items: sampleItems } },
    { name: 'Default Open', props: { items: sampleItems, defaultOpen: ['a1'] } },
    { name: 'Multiple Open', props: { items: sampleItems, multiple: true, defaultOpen: ['a1', 'a2'] } },
    { name: 'Non-Collapsible', props: { items: sampleItems, collapsible: false, defaultOpen: ['a1'] } },
    {
      name: 'With Disabled Item',
      props: {
        items: [
          { id: 'd1', title: 'Enabled Item', content: 'This item can be toggled.' },
          { id: 'd2', title: 'Disabled Item', content: 'This item cannot be toggled.', disabled: true },
          { id: 'd3', title: 'Another Enabled', content: 'This one works too.' },
        ],
      },
    },
    { name: 'Group Disabled', props: { items: sampleItems, disabled: true } },
  ],
  playground: {
    defaults: { items: sampleItems },
    controls: [
      { name: 'multiple', type: 'boolean' },
      { name: 'collapsible', type: 'boolean' },
      { name: 'disabled', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Accordion } from '@decantr/ui/components';

const accordion = Accordion({
  items: [
    { id: 'faq1', title: 'Question 1', content: 'Answer 1' },
    { id: 'faq2', title: 'Question 2', content: 'Answer 2' },
  ],
  defaultOpen: ['faq1'],
  onValueChange: (openIds) => console.log('open:', openIds),
});
document.body.appendChild(accordion);`,
    },
  ],
};
