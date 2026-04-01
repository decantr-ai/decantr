import { h } from '@decantr/ui/runtime';
import { css } from '@decantr/css';

export default {
  component: (props) => {
    const metrics = props.metrics || [
      { label: 'Users', value: '12,847', change: '+14%', trend: 'up' },
      { label: 'Revenue', value: '$48.2k', change: '+8%', trend: 'up' },
      { label: 'Latency', value: '120ms', change: '-23%', trend: 'down' },
      { label: 'Uptime', value: '99.9%', change: '0%', trend: 'flat' },
    ];
    return h('div', { class: css('_grid _gap4'), style: 'grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))' },
      ...metrics.map(m =>
        h('div', { class: css('_p4 _bgsurface _rounded _border') },
          h('div', { class: css('_texsm _fgmuted') }, m.label),
          h('div', { class: css('_heading3') }, m.value),
          h('div', { class: css(m.trend === 'up' ? '_fgsuccess' : m.trend === 'down' ? '_fgerror' : '_fgmuted'), style: 'font-size: 0.875rem' }, m.change),
        ),
      ),
    );
  },
  title: 'KPI Grid',
  category: 'components/data-display',
  description: 'Metric cards grid showing key performance indicators with trend indicators. Maps to the Decantr kpi-grid pattern.',
  variants: [
    { name: '4 Metrics', props: {} },
    { name: '2 Metrics', props: { metrics: [{ label: 'Active Users', value: '3,421', change: '+8%', trend: 'up' }, { label: 'Response Time', value: '1.2s', change: '-15%', trend: 'down' }] } },
  ],
  usage: [
    { title: 'Dashboard KPIs', code: `h(KpiGrid, { metrics: [...] })` },
  ],
};
