import { Pagination } from '@decantr/ui/components';

export default {
  component: (props) => Pagination(props),
  title: 'Pagination',
  category: 'components/original',
  description: 'Page navigation with numbered buttons, previous/next controls, and ellipsis collapsing.',
  variants: [
    { name: 'Default', props: { total: 100, current: 1 } },
    { name: 'Middle Page', props: { total: 100, current: 5 } },
    { name: 'Last Page', props: { total: 100, current: 10 } },
    { name: 'Few Pages', props: { total: 30, current: 2 } },
    { name: 'Many Pages', props: { total: 500, current: 25 } },
    { name: 'Custom Per Page', props: { total: 200, perPage: 20, current: 3 } },
    { name: 'Size SM', props: { total: 100, current: 1, size: 'sm' } },
    { name: 'Size LG', props: { total: 100, current: 1, size: 'lg' } },
    { name: 'More Siblings', props: { total: 200, current: 10, siblings: 2 } },
  ],
  playground: {
    defaults: { total: 100, current: 1, perPage: 10 },
    controls: [
      { name: 'total', type: 'number' },
      { name: 'current', type: 'number' },
      { name: 'perPage', type: 'number' },
      { name: 'siblings', type: 'number' },
      { name: 'size', type: 'select', options: ['default', 'sm', 'lg'] },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Pagination } from '@decantr/ui/components';

const pager = Pagination({
  total: 100,
  perPage: 10,
  current: 1,
  onchange: (page) => console.log('page:', page),
});
document.body.appendChild(pager);`,
    },
  ],
};
