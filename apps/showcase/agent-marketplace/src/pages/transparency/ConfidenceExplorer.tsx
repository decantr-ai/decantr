import { css } from '@decantr/css';
import { IntentRadar } from '../../components/patterns/IntentRadar';
import { StatsOverview } from '../../components/patterns/StatsOverview';
import { useMetricSimulation } from '../../hooks/useMetricSimulation';
import { modelMetrics } from '../../data/metrics';

export function ConfidenceExplorer() {
  const { metrics } = useMetricSimulation(modelMetrics);

  return (
    <div className={css('_flex _col _gap6')}>
      <section className="d-section" data-density="compact">
        <div
          className="d-label"
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}
        >
          CONFIDENCE DISTRIBUTION
        </div>
        <div className={css('_flex _jcc')}>
          <div style={{ maxWidth: '400px', width: '100%' }}>
            <IntentRadar />
          </div>
        </div>
      </section>

      <section className="d-section" data-density="compact">
        <div
          className="d-label"
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}
        >
          METRIC BREAKDOWN
        </div>
        <StatsOverview metrics={metrics} />
      </section>
    </div>
  );
}
