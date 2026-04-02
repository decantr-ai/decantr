import { css } from '@decantr/css';
import {
  Activity,
  Gauge,
  Clock,
  AlertTriangle,
  Cpu,
  Layers,
} from 'lucide-react';
import { modelMetrics } from '../../data';
import { NeuralFeedback } from '../../components/NeuralFeedback';
import { SectionLabel } from '../../components/SectionLabel';

/**
 * Model overview — stats-overview as model-kpis + neural-feedback-loop as feedback-summary.
 */
export function ModelOverviewPage() {
  return (
    <div className={css('_flex _col _gap6')}>
      {/* Model KPIs */}
      <div className="d-section" data-density="compact">
        <SectionLabel>Model KPIs</SectionLabel>
        <div className={css('_grid _gc2 _md:gc3 _gap3')}>
          <KpiCard
            icon={Activity}
            label="Total Inferences"
            value={modelMetrics.totalInferences.toLocaleString()}
            color="var(--d-accent)"
          />
          <KpiCard
            icon={Gauge}
            label="Avg Confidence"
            value={`${Math.round(modelMetrics.avgConfidence * 100)}%`}
            color="var(--d-success)"
          />
          <KpiCard
            icon={Clock}
            label="Avg Latency"
            value={`${modelMetrics.avgLatency}ms`}
            color="var(--d-info)"
          />
          <KpiCard
            icon={AlertTriangle}
            label="Error Rate"
            value={`${(modelMetrics.errorRate * 100).toFixed(1)}%`}
            color="var(--d-error)"
          />
          <KpiCard
            icon={Cpu}
            label="Tokens Processed"
            value={`${(modelMetrics.tokensProcessed / 1_000_000).toFixed(1)}M`}
            color="var(--d-warning)"
          />
          <KpiCard
            icon={Layers}
            label="Active Models"
            value={String(modelMetrics.activeModels)}
            color="var(--d-accent)"
          />
        </div>
      </div>

      {/* Neural feedback summary */}
      <NeuralFeedback
        confidence={modelMetrics.avgConfidence}
        tokenRate={856}
        stage="Inference Active"
        label="Feedback Summary"
      />
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className={css('_flex _col _gap2 _p4') + ' d-surface carbon-card'}>
      <div className={css('_flex _aic _gap2')}>
        <Icon size={14} style={{ color }} />
        <span className={css('_textxs') + ' d-label'}>{label}</span>
      </div>
      <span className={css('_text2xl _fontsemi') + ' mono-data neon-text-glow'}>{value}</span>
    </div>
  );
}
