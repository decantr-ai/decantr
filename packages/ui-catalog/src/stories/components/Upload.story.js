import { Upload } from '@decantr/ui/components';

export default {
  component: (props) => Upload(props),
  title: 'Upload',
  category: 'components/form',
  description: 'File upload with button trigger or drag-and-drop zone, file list, and size/count constraints.',
  variants: [
    { name: 'Default (Button)', props: {} },
    { name: 'Multiple', props: { multiple: true } },
    { name: 'Drag and Drop', props: { drag: true } },
    { name: 'Accept Images', props: { accept: 'image/*' } },
    { name: 'Max 3 Files', props: { multiple: true, maxCount: 3 } },
    { name: 'Disabled', props: { disabled: true } },
  ],
  playground: {
    defaults: {},
    controls: [
      { name: 'multiple', type: 'boolean' },
      { name: 'drag', type: 'boolean' },
      { name: 'accept', type: 'text' },
      { name: 'maxCount', type: 'number' },
      { name: 'disabled', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic button upload',
      code: `import { Upload } from '@decantr/ui/components';

const upload = Upload({
  multiple: true,
  onchange: (files) => console.log(files)
});
document.body.appendChild(upload);`,
    },
    {
      title: 'Drag and drop zone',
      code: `import { Upload } from '@decantr/ui/components';

const upload = Upload({
  drag: true,
  accept: 'image/*',
  maxSize: 5 * 1024 * 1024
});`,
    },
  ],
};
