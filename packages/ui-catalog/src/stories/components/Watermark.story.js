import { Watermark } from '@decantr/ui/components';

export default {
  component: (props) => {
    const child = document.createElement('div');
    child.style.height = props._height || '200px';
    child.style.padding = '1rem';
    child.textContent = props._childText || 'Content underneath the watermark.';
    return Watermark({
      content: props.content || 'Decantr',
      rotate: props.rotate != null ? props.rotate : -22,
      fontSize: props.fontSize != null ? props.fontSize : 14,
      fontColor: props.fontColor,
      zIndex: props.zIndex != null ? props.zIndex : 9,
    }, child);
  },
  title: 'Watermark',
  category: 'components/feedback',
  description: 'Renders a repeating text or image watermark over content using canvas-generated patterns.',
  variants: [
    { name: 'Default', props: { content: 'Decantr' } },
    { name: 'Multi-line', props: { content: ['Confidential', 'Do Not Share'] } },
    { name: 'Custom Rotation', props: { content: 'Draft', rotate: -45 } },
    { name: 'Large Font', props: { content: 'PREVIEW', fontSize: 24 } },
    { name: 'Custom Color', props: { content: 'Watermark', fontColor: 'rgba(255,0,0,0.08)' } },
  ],
  playground: {
    defaults: { content: 'Decantr', rotate: -22, fontSize: 14, fontColor: 'rgba(0,0,0,0.1)', _height: '200px' },
    controls: [
      { name: 'content', type: 'text' },
      { name: 'rotate', type: 'number' },
      { name: 'fontSize', type: 'number' },
      { name: 'fontColor', type: 'color' },
      { name: '_height', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Watermark } from '@decantr/ui/components';

const content = document.createElement('div');
content.style.height = '300px';
content.textContent = 'Protected content here.';

const el = Watermark({ content: 'Confidential' }, content);
document.body.appendChild(el);`,
    },
    {
      title: 'Multi-line watermark',
      code: `import { Watermark } from '@decantr/ui/components';

const content = document.createElement('div');
content.style.height = '300px';

const el = Watermark({
  content: ['Internal Use Only', 'Company Name'],
  rotate: -30,
  fontSize: 16,
}, content);
document.body.appendChild(el);`,
    },
  ],
};
