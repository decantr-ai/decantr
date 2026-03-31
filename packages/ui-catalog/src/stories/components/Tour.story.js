import { Tour } from '@decantr/ui/components';

export default {
  component: (props) => {
    const container = document.createElement('div');
    container.style.padding = '2rem';
    container.style.position = 'relative';
    container.style.minHeight = '200px';

    const step1 = document.createElement('button');
    step1.className = 'd-btn d-btn-primary';
    step1.textContent = 'Step 1 Target';
    step1.id = 'tour-step-1';
    step1.style.marginRight = '1rem';

    const step2 = document.createElement('button');
    step2.className = 'd-btn d-btn-outline';
    step2.textContent = 'Step 2 Target';
    step2.id = 'tour-step-2';
    step2.style.marginRight = '1rem';

    const step3 = document.createElement('div');
    step3.className = 'd-btn d-btn-ghost';
    step3.textContent = 'Step 3 Target';
    step3.id = 'tour-step-3';

    container.appendChild(step1);
    container.appendChild(step2);
    container.appendChild(step3);

    const startBtn = document.createElement('button');
    startBtn.className = 'd-btn d-btn-success';
    startBtn.textContent = 'Start Tour';
    startBtn.style.display = 'block';
    startBtn.style.marginTop = '1.5rem';

    const tour = Tour({
      steps: [
        { target: '#tour-step-1', title: 'Welcome', description: props._step1Desc || 'This is the first step of the tour.', placement: props.placement || 'bottom' },
        { target: '#tour-step-2', title: 'Features', description: props._step2Desc || 'Explore the available features here.', placement: 'bottom' },
        { target: '#tour-step-3', title: 'Finish', description: props._step3Desc || 'You are all set!', placement: 'bottom' },
      ],
      onFinish: () => console.log('Tour finished'),
      onClose: () => console.log('Tour closed'),
    });

    startBtn.addEventListener('click', () => tour.start());
    container.appendChild(startBtn);

    return container;
  },
  title: 'Tour',
  category: 'components/feedback',
  description: 'Step-by-step onboarding guide that highlights elements with a spotlight overlay and popover.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'Top Placement', props: { placement: 'top' } },
    { name: 'Custom Steps', props: { _step1Desc: 'Click here to get started.', _step2Desc: 'Browse your options.', _step3Desc: 'Complete the setup!' } },
  ],
  playground: {
    defaults: { placement: 'bottom', _step1Desc: 'This is the first step of the tour.' },
    controls: [
      { name: 'placement', type: 'select', options: ['top', 'bottom', 'left', 'right'] },
      { name: '_step1Desc', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Tour } from '@decantr/ui/components';

const tour = Tour({
  steps: [
    { target: '#btn-new', title: 'Create', description: 'Click here to create a new item.', placement: 'bottom' },
    { target: '#btn-settings', title: 'Settings', description: 'Configure your preferences.', placement: 'right' },
  ],
  onFinish: () => console.log('Done!'),
});
tour.start();`,
    },
  ],
};
