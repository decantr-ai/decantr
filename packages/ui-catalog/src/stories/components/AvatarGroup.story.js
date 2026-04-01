import { AvatarGroup, Avatar } from '@decantr/ui/components';

function makeAvatars(count) {
  const names = ['AJ', 'BS', 'CW', 'DB', 'ED', 'FG', 'HI', 'JK'];
  return names.slice(0, count).map(initials => Avatar({ fallback: initials }));
}

export default {
  component: (props) => AvatarGroup(props, ...makeAvatars(props._count || 6)),
  title: 'AvatarGroup',
  category: 'components/data-display',
  description: 'Stacked avatar display with overflow count. Shows up to max avatars with a +N overflow indicator.',
  variants: [
    { name: 'Default', props: { _count: 6 } },
    { name: 'Max 3', props: { max: 3, _count: 6 } },
    { name: 'Max 5 (default)', props: { max: 5, _count: 8 } },
    { name: 'No Overflow', props: { max: 5, _count: 3 } },
    { name: 'Size SM', props: { size: 'sm', _count: 5 } },
    { name: 'Size LG', props: { size: 'lg', _count: 5 } },
    { name: 'Size XL', props: { size: 'xl', _count: 4 } },
  ],
  playground: {
    defaults: { _count: 6, max: 5 },
    controls: [
      { name: 'max', type: 'number' },
      { name: 'size', type: 'select', options: ['sm', 'lg', 'xl'] },
      { name: '_count', type: 'number' },
    ],
  },
  usage: [
    {
      title: 'Basic avatar group',
      code: `import { AvatarGroup, Avatar } from '@decantr/ui/components';

const group = AvatarGroup({ max: 3 },
  Avatar({ fallback: 'AJ' }),
  Avatar({ fallback: 'BS' }),
  Avatar({ fallback: 'CW' }),
  Avatar({ fallback: 'DB' }),
);
document.body.appendChild(group);`,
    },
  ],
};
