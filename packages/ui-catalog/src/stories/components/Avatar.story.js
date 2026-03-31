import { Avatar } from '@decantr/ui/components';

export default {
  component: (props) => Avatar(props),
  title: 'Avatar',
  category: 'components/original',
  description: 'User avatar with image, initials fallback, and icon placeholder.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'With Image', props: { src: 'https://i.pravatar.cc/150?u=decantr', alt: 'John Doe' } },
    { name: 'Initials Fallback', props: { alt: 'John Doe' } },
    { name: 'Custom Fallback', props: { fallback: 'JD' } },
    { name: 'Size SM', props: { size: 'sm', alt: 'Small User' } },
    { name: 'Size LG', props: { size: 'lg', alt: 'Large User' } },
    { name: 'Size XL', props: { size: 'xl', alt: 'Extra Large User' } },
    { name: 'Broken Image', props: { src: 'https://broken-url.invalid/avatar.png', alt: 'Jane Smith' } },
  ],
  playground: {
    defaults: { alt: 'John Doe' },
    controls: [
      { name: 'src', type: 'text' },
      { name: 'alt', type: 'text' },
      { name: 'fallback', type: 'text' },
      { name: 'size', type: 'select', options: ['default', 'sm', 'lg', 'xl'] },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Avatar } from '@decantr/ui/components';

const avatar = Avatar({ src: 'https://i.pravatar.cc/150', alt: 'John Doe', size: 'lg' });
document.body.appendChild(avatar);`,
    },
  ],
};
