import { Statistic } from '@decantr/ui/components';

export default {
  component: (props) => Statistic(props),
  title: 'Statistic',
  category: 'components/data-display',
  description: 'Display a numeric value with label, prefix/suffix, trend indicator, and optional count-up animation.',
  variants: [
    { name: 'Default', props: { label: 'Active Users', value: 1128 } },
    { name: 'With Precision', props: { label: 'Revenue', value: 9823.45, precision: 2, prefix: '$' } },
    { name: 'With Suffix', props: { label: 'Growth', value: 93, suffix: '%' } },
    { name: 'Trend Up', props: { label: 'Sales', value: 12450, trend: 'up', trendValue: '12%' } },
    { name: 'Trend Down', props: { label: 'Churn', value: 3.2, precision: 1, trend: 'down', trendValue: '0.5%', suffix: '%' } },
    { name: 'No Group Separator', props: { label: 'ID', value: 1000234, groupSeparator: false } },
    { name: 'Animated', props: { label: 'Total', value: 5000, animate: true } },
    { name: 'Animated Custom Duration', props: { label: 'Score', value: 98.7, precision: 1, animate: 2000 } },
  ],
  playground: {
    defaults: { label: 'Active Users', value: 1128 },
    controls: [
      { name: 'label', type: 'text' },
      { name: 'value', type: 'number' },
      { name: 'precision', type: 'number' },
      { name: 'prefix', type: 'text' },
      { name: 'suffix', type: 'text' },
      { name: 'trend', type: 'select', options: ['up', 'down'] },
      { name: 'trendValue', type: 'text' },
      { name: 'groupSeparator', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic statistic',
      code: `import { Statistic } from '@decantr/ui/components';

const stat = Statistic({ label: 'Users', value: 1128 });
document.body.appendChild(stat);`,
    },
    {
      title: 'With trend',
      code: `import { Statistic } from '@decantr/ui/components';

const stat = Statistic({
  label: 'Revenue',
  value: 50200,
  prefix: '$',
  trend: 'up',
  trendValue: '12%',
});`,
    },
    {
      title: 'Countdown timer',
      code: `import { Statistic } from '@decantr/ui/components';

const countdown = Statistic.Countdown({
  label: 'Time Left',
  target: Date.now() + 60 * 60 * 1000,
  onFinish: () => console.log('Done!'),
});`,
    },
  ],
};
