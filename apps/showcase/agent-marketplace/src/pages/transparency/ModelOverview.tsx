import { css } from '@decantr/css';
import { StatsOverview, type StatItem } from '@/components/StatsOverview';
import { NeuralFeedbackRow, type FeedbackMetric } from '@/components/NeuralFeedbackLoop';

const mockStats: StatItem[] = [
  { label: 'Model Accuracy', value: '94.2%', trend: { direction: 'up', percent: '+1.3%' } },
  { label: 'Total Inferences', value: '1.24M', trend: { direction: 'up', percent: '+12.4%' } },
  { label: 'Avg Latency', value: '142ms', trend: { direction: 'down', percent: '-8.1%' } },
  { label: 'Error Rate', value: '0.3%', trend: { direction: 'down', percent: '-0.1%' } },
];

const mockMetrics: FeedbackMetric[] = [
  { label: 'Confidence', value: 94, max: 100, unit: '%', trend: 'up' },
  { label: 'Token Rate', value: 2847, max: 5000, unit: '/min', trend: 'stable' },
  { label: 'GPU Utilization', value: 67, max: 100, unit: '%', trend: 'up' },
];

export function ModelOverview() {
  return (
    <div className={css('_flex _col _gap6')} style={{ padding: '1.5rem' }}>
      {/* Stats section */}
      <section className="d-section" data-density="compact">
        <div
          className="d-label"
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}
        >
          MODEL KPIs
        </div>
        <StatsOverview stats={mockStats} />
      </section>

      {/* Neural Feedback section */}
      <section className="d-section" data-density="compact">
        <div
          className="d-label"
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}
        >
          PROCESSING STATE
        </div>
        <div className="d-surface carbon-card" style={{ padding: '1rem' }}>
          <NeuralFeedbackRow metrics={mockMetrics} />
        </div>
      </section>
    </div>
  );
}
