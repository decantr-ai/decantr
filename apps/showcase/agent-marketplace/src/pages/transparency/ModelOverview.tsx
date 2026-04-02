import { css } from '@decantr/css';
import { Eye, Cpu, Zap, BarChart3, Clock, TrendingUp } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { NeuralFeedback } from '../../components/NeuralFeedback';

const KPI_DATA = [
  { label: 'Models Active', value: '4', icon: Cpu, trend: '2 this week', trendUp: true },
  { label: 'Avg Confidence', value: '91.2%', icon: BarChart3, trend: '+3.4%', trendUp: true },
  { label: 'Total Inferences', value: '1.24M', icon: Zap, trend: '+18%', trendUp: true },
  { label: 'Avg Latency', value: '142ms', icon: Clock, trend: '-12ms', trendUp: true },
];

const MODELS = [
  { name: 'gpt-4o', confidence: 94, tokPerSec: 847, stage: 'serving', requests: '482k' },
  { name: 'claude-3.5', confidence: 91, tokPerSec: 623, stage: 'serving', requests: '367k' },
  { name: 'gpt-4o-mini', confidence: 62, tokPerSec: 310, stage: 'degraded', requests: '241k' },
  { name: 'mistral-large', confidence: 0, tokPerSec: 0, stage: 'idle', requests: '148k' },
];

export function ModelOverview() {
  return (
    <>
      <PageHeader
        title="Model Overview"
        subtitle="AI model observability and transparency"
        actions={
          <button className="d-interactive neon-glow-hover" data-variant="ghost" style={{ border: '1px solid transparent' }}>
            <Eye size={14} /> Live Mode
          </button>
        }
      />

      {/* KPI cards — stats-overview */}
      <section className="d-section" style={{ paddingTop: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--d-gap-4)' }}>
          {KPI_DATA.map((kpi) => (
            <StatCard key={kpi.label} {...kpi} />
          ))}
        </div>
      </section>

      {/* Model table */}
      <section className="d-section">
        <h2 className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--d-gap-4)' }}>
          Model Status
        </h2>
        <div className="d-surface carbon-glass" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="d-data">
            <thead>
              <tr>
                <th className="d-data-header">Model</th>
                <th className="d-data-header">Confidence</th>
                <th className="d-data-header">Throughput</th>
                <th className="d-data-header">Requests</th>
                <th className="d-data-header">Stage</th>
              </tr>
            </thead>
            <tbody>
              {MODELS.map((m) => (
                <tr key={m.name} className="d-data-row">
                  <td className="d-data-cell mono-data" style={{ fontWeight: 500 }}>{m.name}</td>
                  <td className="d-data-cell">
                    <div className={css('_flex _aic _gap2')}>
                      <div style={{ width: 60, height: 4, background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius-full)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${m.confidence}%`,
                          height: '100%',
                          background: m.confidence > 80 ? 'var(--d-accent)' : m.confidence > 50 ? 'var(--d-warning)' : 'var(--d-error)',
                          borderRadius: 'var(--d-radius-full)',
                          boxShadow: m.confidence > 80 ? '0 0 6px var(--d-accent-glow)' : 'none',
                        }} />
                      </div>
                      <span className="mono-data" style={{ fontSize: '0.75rem' }}>{m.confidence}%</span>
                    </div>
                  </td>
                  <td className="d-data-cell mono-data">{m.tokPerSec} tok/s</td>
                  <td className="d-data-cell mono-data">{m.requests}</td>
                  <td className="d-data-cell">
                    <span
                      className="d-annotation"
                      data-status={m.stage === 'serving' ? 'success' : m.stage === 'degraded' ? 'warning' : 'info'}
                    >
                      {m.stage}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Neural feedback summary */}
      <section className="d-section">
        <h2 className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--d-gap-4)' }}>
          Feedback Summary
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--d-gap-4)' }}>
          <NeuralFeedback confidence={94} tokensPerSec={847} stage="serving" label="gpt-4o" />
          <NeuralFeedback confidence={91} tokensPerSec={623} stage="serving" label="claude-3.5" />
          <NeuralFeedback confidence={62} tokensPerSec={310} stage="degraded" label="gpt-4o-mini" />
        </div>
      </section>
    </>
  );
}
