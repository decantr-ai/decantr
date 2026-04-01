import { BackTop } from '@decantr/ui/components';

export default {
  component: (props) => BackTop({
    visibilityHeight: props.visibilityHeight ?? 400,
    class: props.class,
  }),
  title: 'BackTop',
  category: 'components/navigation',
  description: 'Floating scroll-to-top button that appears after scrolling past a configurable threshold.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'Low Threshold', props: { visibilityHeight: 100 } },
    { name: 'High Threshold', props: { visibilityHeight: 800 } },
  ],
  playground: {
    defaults: { visibilityHeight: 400 },
    controls: [
      { name: 'visibilityHeight', type: 'number' },
    ],
  },
  usage: [
    {
      title: 'Basic back-to-top button',
      code: `import { BackTop } from '@decantr/ui/components';

const btn = BackTop({ visibilityHeight: 300 });
document.body.appendChild(btn);`,
    },
    {
      title: 'With custom scroll target',
      code: `import { BackTop } from '@decantr/ui/components';

const scrollContainer = document.getElementById('scroll-area');
const btn = BackTop({
  visibilityHeight: 200,
  target: scrollContainer,
});
scrollContainer.appendChild(btn);`,
    },
  ],
};
