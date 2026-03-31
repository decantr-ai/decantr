import { Popconfirm } from '@decantr/ui/components';

export default {
  component: (props) => {
    return Popconfirm({
      title: props.title || 'Are you sure?',
      description: props.description,
      confirmText: props.confirmText || 'Yes',
      cancelText: props.cancelText || 'No',
      position: props.position || 'top',
      trigger: () => {
        const btn = document.createElement('button');
        btn.className = 'd-btn d-btn-outline';
        btn.textContent = props._triggerText || 'Delete';
        return btn;
      },
      onConfirm: () => console.log('confirmed'),
      onCancel: () => console.log('cancelled'),
    });
  },
  title: 'Popconfirm',
  category: 'components/feedback',
  description: 'Confirmation popover attached to a trigger element. Click the trigger to show.',
  variants: [
    { name: 'Default', props: { title: 'Are you sure?', _triggerText: 'Delete' } },
    { name: 'With Description', props: { title: 'Delete this item?', description: 'This action cannot be undone.', _triggerText: 'Delete' } },
    { name: 'Custom Text', props: { title: 'Discard changes?', confirmText: 'Discard', cancelText: 'Keep', _triggerText: 'Cancel' } },
    { name: 'Position Bottom', props: { title: 'Confirm action?', position: 'bottom', _triggerText: 'Click me' } },
    { name: 'Position Left', props: { title: 'Confirm action?', position: 'left', _triggerText: 'Click me' } },
    { name: 'Position Right', props: { title: 'Confirm action?', position: 'right', _triggerText: 'Click me' } },
  ],
  playground: {
    defaults: { title: 'Are you sure?', description: '', confirmText: 'Yes', cancelText: 'No', position: 'top', _triggerText: 'Delete' },
    controls: [
      { name: 'title', type: 'text' },
      { name: 'description', type: 'text' },
      { name: 'confirmText', type: 'text' },
      { name: 'cancelText', type: 'text' },
      { name: 'position', type: 'select', options: ['top', 'bottom', 'left', 'right'] },
      { name: '_triggerText', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Popconfirm } from '@decantr/ui/components';

const el = Popconfirm({
  title: 'Delete this item?',
  description: 'This action cannot be undone.',
  onConfirm: () => console.log('Deleted!'),
  trigger: () => {
    const btn = document.createElement('button');
    btn.textContent = 'Delete';
    return btn;
  },
});
document.body.appendChild(el);`,
    },
  ],
};
