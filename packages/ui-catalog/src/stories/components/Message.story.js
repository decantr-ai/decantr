import { message } from '@decantr/ui/components';

export default {
  component: (props) => {
    const container = document.createElement('div');
    const btn = document.createElement('button');
    btn.className = 'd-btn d-btn-primary';
    btn.textContent = props._buttonText || 'Show Message';
    btn.addEventListener('click', () => {
      message({
        content: props.content || 'This is a message.',
        type: props.type || 'info',
        duration: props.duration != null ? props.duration : 3000,
      });
    });
    container.appendChild(btn);
    // Auto-trigger for variant preview
    setTimeout(() => {
      message({
        content: props.content || 'This is a message.',
        type: props.type || 'info',
        duration: props.duration != null ? props.duration : 3000,
      });
    }, 100);
    return container;
  },
  title: 'Message',
  category: 'components/feedback',
  description: 'Lightweight global feedback message displayed at top-center with auto-dismiss.',
  variants: [
    { name: 'Info', props: { content: 'This is an informational message.', type: 'info' } },
    { name: 'Success', props: { content: 'Operation completed successfully!', type: 'success' } },
    { name: 'Warning', props: { content: 'Please check your input.', type: 'warning' } },
    { name: 'Error', props: { content: 'Something went wrong.', type: 'error' } },
    { name: 'Loading', props: { content: 'Loading data...', type: 'loading', duration: 0 } },
  ],
  playground: {
    defaults: { content: 'Hello, this is a message!', type: 'info', duration: 3000 },
    controls: [
      { name: 'content', type: 'text' },
      { name: 'type', type: 'select', options: ['info', 'success', 'warning', 'error', 'loading'] },
      { name: 'duration', type: 'number' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { message } from '@decantr/ui/components';

message({ content: 'Saved successfully!', type: 'success' });`,
    },
    {
      title: 'Convenience methods',
      code: `import { message } from '@decantr/ui/components';

message.info('Informational message');
message.success('Operation completed');
message.warning('Check your input');
message.error('Something went wrong');
const m = message.loading('Loading...');
// Later: m.close();`,
    },
  ],
};
