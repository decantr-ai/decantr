import { css } from '@decantr/css';
import { StatsOverview } from '../../components/patterns/StatsOverview';
import { NeuralFeedbackLoop } from '../../components/patterns/NeuralFeedbackLoop';
import { useMetricSimulation } from '../../hooks/useMetricSimulation';
import { modelMetrics } from '../../data/metrics';

export function ModelOverview() {
  const { metrics } = useMetricSimulation(modelMetrics);

  const confidenceMetric = metrics.find(m => m.label === 'Avg Confidence') || metrics[0];

  return (
    <div className={css('_flex _col _gap6')}>
      <section className="d-section" data-density="compact">
        <div
          className="d-label"
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}
        >
          MODEL KPIs
        </div>
        <StatsOverview metrics={metrics} />
      </section>

      <section className="d-section" data-density="compact">
        <div
          className="d-label"
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}
        >
          FEEDBACK SUMMARY
        </div>
        <div className={css('_flex _jcc')}>
          <NeuralFeedbackLoop
            metric={confidenceMetric}
            processingState="active"
            size={280}
          />
        </div>
      </section>
    </div>
  );
}
