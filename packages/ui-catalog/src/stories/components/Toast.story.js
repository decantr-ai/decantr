import { toast } from '@decantr/ui/components';
import { h } from '@decantr/ui/core';

export default {
  component: (props) => {
    const btn = h('button', {
      class: 'd-btn d-btn-primary',
      onclick: () => toast({ message: props.message || 'Toast message', variant: props.variant, duration: props.duration, position: props.position }),
    }, 'Show Toast');
    return btn;
  },
  title: 'Toast',
  category: 'components/original',
  description: 'Function-based toast notification with variants, auto-dismiss, and position options.',
  variants: [
    { name: 'Info', props: { message: 'This is an info toast', variant: 'info' } },
    { name: 'Success', props: { message: 'Operation completed!', variant: 'success' } },
    { name: 'Warning', props: { message: 'Please review your input', variant: 'warning' } },
    { name: 'Error', props: { message: 'Something went wrong', variant: 'error' } },
    { name: 'Top Left', props: { message: 'Top left toast', position: 'top-left' } },
    { name: 'Bottom Right', props: { message: 'Bottom right toast', position: 'bottom-right' } },
    { name: 'Bottom Left', props: { message: 'Bottom left toast', position: 'bottom-left' } },
    { name: 'Persistent', props: { message: 'I will not auto-dismiss', duration: 0 } },
    { name: 'Quick', props: { message: 'Gone in 1 second', duration: 1000 } },
  ],
  playground: {
    defaults: { message: 'Hello from toast!', variant: 'info', duration: 3000, position: 'top-right' },
    controls: [
      { name: 'message', type: 'text' },
      { name: 'variant', type: 'select', options: ['info', 'success', 'warning', 'error'] },
      { name: 'duration', type: 'number' },
      { name: 'position', type: 'select', options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'] },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { toast } from '@decantr/ui/components';

const { dismiss } = toast({ message: 'File saved!', variant: 'success', duration: 3000 });
// Call dismiss() to close early`,
    },
  ],
};
