import { AspectRatio } from '@decantr/ui/components';

function renderAspectRatio(props) {
  const { _label, ...rest } = props;
  const inner = document.createElement('div');
  inner.style.width = '100%';
  inner.style.height = '100%';
  inner.style.background = 'var(--d-clr-surface-2, #e5e7eb)';
  inner.style.display = 'flex';
  inner.style.alignItems = 'center';
  inner.style.justifyContent = 'center';
  inner.style.borderRadius = '4px';
  inner.textContent = _label || `${rest.ratio || '16/9'}`;
  const wrapper = AspectRatio(rest, inner);
  wrapper.style.maxWidth = '320px';
  return wrapper;
}

export default {
  component: renderAspectRatio,
  title: 'AspectRatio',
  category: 'components/layout',
  description: 'Constrains child content to a fixed aspect ratio using the CSS aspect-ratio property.',
  variants: [
    { name: '16:9', props: { ratio: 16 / 9, _label: '16:9' } },
    { name: '4:3', props: { ratio: 4 / 3, _label: '4:3' } },
    { name: '1:1 (Square)', props: { ratio: 1, _label: '1:1' } },
    { name: '21:9 (Ultra-wide)', props: { ratio: 21 / 9, _label: '21:9' } },
    { name: '3:2', props: { ratio: 3 / 2, _label: '3:2' } },
    { name: '9:16 (Portrait)', props: { ratio: 9 / 16, _label: '9:16' } },
  ],
  playground: {
    defaults: { ratio: 16 / 9 },
    controls: [
      { name: 'ratio', type: 'number' },
    ],
  },
  usage: [
    {
      title: 'Video embed container',
      code: `import { AspectRatio } from '@decantr/ui/components';

const container = AspectRatio({ ratio: 16 / 9 },
  document.createElement('iframe')
);
document.body.appendChild(container);`,
    },
    {
      title: 'Square avatar',
      code: `import { AspectRatio } from '@decantr/ui/components';

const img = document.createElement('img');
img.src = '/avatar.png';
img.style.objectFit = 'cover';
img.style.width = '100%';
img.style.height = '100%';
const avatar = AspectRatio({ ratio: 1 }, img);`,
    },
  ],
};
