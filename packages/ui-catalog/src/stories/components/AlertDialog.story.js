import { AlertDialog } from '@decantr/ui/components';
import { createSignal } from '@decantr/ui/state';

export default {
  component: (props) => {
    const [visible, setVisible] = createSignal(true);
    return AlertDialog({
      title: props.title || 'Are you sure?',
      description: props.description || 'This action cannot be undone.',
      visible,
      confirmText: props.confirmText || 'Confirm',
      cancelText: props.cancelText || 'Cancel',
      variant: props.variant || 'destructive',
      onConfirm: () => setVisible(false),
      onCancel: () => setVisible(false),
      class: props.class,
    });
  },
  title: 'AlertDialog',
  category: 'components/feedback',
  description: 'Confirmation dialog that requires explicit user action. Uses native <dialog> with focus trap.',
  variants: [
    { name: 'Default', props: { title: 'Are you sure?', description: 'This action cannot be undone.' } },
    { name: 'Destructive', props: { title: 'Delete Item', description: 'This will permanently delete the item.', variant: 'destructive' } },
    { name: 'Primary', props: { title: 'Confirm Purchase', description: 'You will be charged $49.99.', variant: 'primary', confirmText: 'Purchase' } },
    { name: 'Custom Text', props: { title: 'Discard changes?', description: 'Your unsaved changes will be lost.', confirmText: 'Discard', cancelText: 'Keep editing' } },
    { name: 'No Description', props: { title: 'Are you sure you want to proceed?' } },
  ],
  playground: {
    defaults: { title: 'Confirm Action', description: 'This action cannot be undone.', variant: 'destructive', confirmText: 'Confirm', cancelText: 'Cancel' },
    controls: [
      { name: 'title', type: 'text' },
      { name: 'description', type: 'text' },
      { name: 'variant', type: 'select', options: ['destructive', 'primary', 'success', 'warning'] },
      { name: 'confirmText', type: 'text' },
      { name: 'cancelText', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { AlertDialog } from '@decantr/ui/components';
import { createSignal } from '@decantr/ui/state';

const [visible, setVisible] = createSignal(false);
const dialog = AlertDialog({
  title: 'Delete Item',
  description: 'This will permanently delete the item.',
  visible,
  variant: 'destructive',
  onConfirm: () => { console.log('confirmed'); setVisible(false); },
  onCancel: () => setVisible(false),
});
document.body.appendChild(dialog);
setVisible(true);`,
    },
  ],
};
