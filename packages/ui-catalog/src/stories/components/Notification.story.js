import { notification } from '@decantr/ui/components';

export default {
  component: (props) => {
    const container = document.createElement('div');
    const btn = document.createElement('button');
    btn.className = 'd-btn d-btn-primary';
    btn.textContent = props._buttonText || 'Show Notification';
    btn.addEventListener('click', () => {
      notification({
        title: props.title || 'Notification',
        description: props.description || 'This is a notification message.',
        type: props.type || 'info',
        duration: props.duration != null ? props.duration : 4500,
        placement: props.placement || 'top-right',
      });
    });
    container.appendChild(btn);
    // Auto-trigger for variant preview
    setTimeout(() => {
      notification({
        title: props.title || 'Notification',
        description: props.description || 'This is a notification message.',
        type: props.type || 'info',
        duration: props.duration != null ? props.duration : 4500,
        placement: props.placement || 'top-right',
      });
    }, 100);
    return container;
  },
  title: 'Notification',
  category: 'components/feedback',
  description: 'Stacked notification system with title, description, icon, and configurable placement.',
  variants: [
    { name: 'Info', props: { title: 'Info', description: 'This is an informational notification.', type: 'info' } },
    { name: 'Success', props: { title: 'Success', description: 'Operation completed successfully.', type: 'success' } },
    { name: 'Warning', props: { title: 'Warning', description: 'Please review your input.', type: 'warning' } },
    { name: 'Error', props: { title: 'Error', description: 'Something went wrong.', type: 'error' } },
    { name: 'Top Left', props: { title: 'Top Left', description: 'Notification in top-left corner.', placement: 'top-left' } },
    { name: 'Bottom Right', props: { title: 'Bottom Right', description: 'Notification in bottom-right corner.', placement: 'bottom-right' } },
    { name: 'No Auto Close', props: { title: 'Persistent', description: 'This notification stays until manually closed.', duration: 0 } },
  ],
  playground: {
    defaults: { title: 'Notification Title', description: 'This is the notification description.', type: 'info', placement: 'top-right', duration: 4500 },
    controls: [
      { name: 'title', type: 'text' },
      { name: 'description', type: 'text' },
      { name: 'type', type: 'select', options: ['info', 'success', 'warning', 'error'] },
      { name: 'placement', type: 'select', options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'] },
      { name: 'duration', type: 'number' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { notification } from '@decantr/ui/components';

notification({
  title: 'File uploaded',
  description: 'Your file has been uploaded successfully.',
  type: 'success',
});`,
    },
    {
      title: 'Persistent notification',
      code: `import { notification } from '@decantr/ui/components';

const n = notification({
  title: 'Processing',
  description: 'Please wait while we process your request.',
  type: 'info',
  duration: 0,
});
// Later: n.close();`,
    },
  ],
};
