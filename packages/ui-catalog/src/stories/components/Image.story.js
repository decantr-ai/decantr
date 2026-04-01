import { Image } from '@decantr/ui/components';

const SAMPLE_SRC = 'https://picsum.photos/seed/decantr/400/300';

export default {
  component: (props) => Image({ src: SAMPLE_SRC, alt: 'Sample image', ...props }),
  title: 'Image',
  category: 'components/data-display',
  description: 'Enhanced image component with loading state, error fallback, and click-to-zoom lightbox preview.',
  variants: [
    { name: 'Default', props: { width: '300px', height: '200px' } },
    { name: 'Fit Cover', props: { fit: 'cover', width: '300px', height: '200px' } },
    { name: 'Fit Contain', props: { fit: 'contain', width: '300px', height: '200px' } },
    { name: 'Fit Fill', props: { fit: 'fill', width: '300px', height: '200px' } },
    { name: 'Preview', props: { preview: true, width: '300px', height: '200px' } },
    { name: 'Fallback (Broken URL)', props: { src: 'https://broken.invalid/img.jpg', width: '300px', height: '200px' } },
    { name: 'Custom Fallback', props: { src: 'https://broken.invalid/img.jpg', fallback: 'Image failed to load', width: '300px', height: '200px' } },
  ],
  playground: {
    defaults: { width: '300px', height: '200px' },
    controls: [
      { name: 'src', type: 'text' },
      { name: 'alt', type: 'text' },
      { name: 'width', type: 'text' },
      { name: 'height', type: 'text' },
      { name: 'fit', type: 'select', options: ['cover', 'contain', 'fill', 'none'] },
      { name: 'preview', type: 'boolean' },
      { name: 'fallback', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic image',
      code: `import { Image } from '@decantr/ui/components';

const img = Image({
  src: '/photo.jpg',
  alt: 'A photo',
  width: '400px',
  height: '300px',
});
document.body.appendChild(img);`,
    },
    {
      title: 'With preview lightbox',
      code: `import { Image } from '@decantr/ui/components';

const img = Image({
  src: '/photo.jpg',
  alt: 'Click to preview',
  preview: true,
  width: '200px',
  height: '200px',
});`,
    },
  ],
};
