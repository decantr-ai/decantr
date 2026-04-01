import { Result } from '@decantr/ui/components';

export default {
  component: (props) => {
    return Result({
      status: props.status || 'info',
      title: props.title || 'Result Title',
      subTitle: props.subTitle,
    });
  },
  title: 'Result',
  category: 'components/feedback',
  description: 'Full-page result feedback for success, error, info, warning, and HTTP status codes.',
  variants: [
    { name: 'Success', props: { status: 'success', title: 'Successfully Purchased', subTitle: 'Order #2024-1234 has been placed.' } },
    { name: 'Error', props: { status: 'error', title: 'Submission Failed', subTitle: 'Please check your input and try again.' } },
    { name: 'Info', props: { status: 'info', title: 'Information', subTitle: 'Your request has been received.' } },
    { name: 'Warning', props: { status: 'warning', title: 'Warning', subTitle: 'There are issues with your account.' } },
    { name: '403 Forbidden', props: { status: '403', title: 'Access Denied', subTitle: 'You do not have permission to access this page.' } },
    { name: '404 Not Found', props: { status: '404', title: 'Page Not Found', subTitle: 'The page you are looking for does not exist.' } },
    { name: '500 Server Error', props: { status: '500', title: 'Server Error', subTitle: 'Something went wrong on our end.' } },
  ],
  playground: {
    defaults: { status: 'success', title: 'Operation Successful', subTitle: 'Your request has been processed.' },
    controls: [
      { name: 'status', type: 'select', options: ['success', 'error', 'info', 'warning', '403', '404', '500'] },
      { name: 'title', type: 'text' },
      { name: 'subTitle', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Result } from '@decantr/ui/components';

const result = Result({
  status: 'success',
  title: 'Payment Successful',
  subTitle: 'Your order has been confirmed.',
});
document.body.appendChild(result);`,
    },
    {
      title: '404 page',
      code: `import { Result } from '@decantr/ui/components';

const page = Result({
  status: '404',
  title: 'Page Not Found',
  subTitle: 'The page you requested does not exist.',
});
document.body.appendChild(page);`,
    },
  ],
};
