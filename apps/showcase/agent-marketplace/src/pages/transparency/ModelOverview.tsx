import { css } from '@decantr/css';
import { Cpu, Clock, Zap, BarChart3 } from 'lucide-react';
import { StatsOverview } from '../../components/StatsOverview';
import { NeuralFeedbackLoop } from '../../components/NeuralFeedbackLoop';

const STATS = [
  { label: 'Total Inferences', value: 284600, format: (v: number) => (v / 1000).toFixed(1) + 'k', trend: 12.4, icon: <Zap size={16} style={{ color: 'var(--d-accent)' }} /> },
  { label: 'Avg Latency', value: 142, format: (v: number) => v + 'ms', trend: -3.2, icon: <Clock size={16} style={{ color: 'var(--d-warning)' }} /> },
  { label: 'Active Models', value: 7, trend: 2, icon: <Cpu size={16} style={{ color: 'var(--d-primary)' }} /> },
  { label: 'Accuracy Score', value: 96, format: (v: number) => v + '%', trend: 0.8, icon: <BarChart3 size={16} style={{ color: 'var(--d-success)' }} /> },
];

export function ModelOverview() {
  return (
    <div className={css('_flex _col _gap6')}>
      <div>
        <h1 className={css('_fontsemi _textxl')} style={{ marginBottom: '0.25rem' }}>Model Overview</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>AI model observability and performance metrics</p>
      </div>

      {/* Stats overview */}
      <div>
        <span className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem', display: 'block' }}>
          Key Performance Indicators
        </span>
        <StatsOverview stats={STATS} />
      </div>

      {/* Neural Feedback Summary */}
      <div>
        <span className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem', display: 'block' }}>
          Feedback Summary
        </span>
        <div className={css('_grid _gap6')} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="d-surface carbon-card" style={{ display: 'flex', justifyContent: 'center' }}>
            <NeuralFeedbackLoop label="Confidence" value={94} trend={2.3} status="active" />
          </div>
          <div className="d-surface carbon-card" style={{ display: 'flex', justifyContent: 'center' }}>
            <NeuralFeedbackLoop label="Throughput" value={780} maxValue={1000} unit="/s" trend={5.1} status="processing" />
          </div>
          <div className="d-surface carbon-card" style={{ display: 'flex', justifyContent: 'center' }}>
            <NeuralFeedbackLoop label="Error Rate" value={3} maxValue={100} unit="%" trend={-0.5} status="idle" />
          </div>
        </div>
      </div>

      {/* Model table */}
      <div>
        <span className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem', display: 'block' }}>
          Deployed Models
        </span>
        <div className="d-surface carbon-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="d-data">
            <thead>
              <tr>
                <th className="d-data-header">Model</th>
                <th className="d-data-header">Provider</th>
                <th className="d-data-header">Requests (24h)</th>
                <th className="d-data-header">Avg Latency</th>
                <th className="d-data-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { model: 'gpt-4o', provider: 'OpenAI', requests: '45.2k', latency: '120ms', status: 'active' },
                { model: 'claude-3-opus', provider: 'Anthropic', requests: '28.1k', latency: '340ms', status: 'active' },
                { model: 'claude-3-sonnet', provider: 'Anthropic', requests: '12.8k', latency: '180ms', status: 'active' },
                { model: 'mistral-large', provider: 'Mistral', requests: '8.4k', latency: '95ms', status: 'active' },
                { model: 'gpt-4o-mini', provider: 'OpenAI', requests: '67.3k', latency: '45ms', status: 'active' },
                { model: 'llama-3-70b', provider: 'Meta', requests: '3.1k', latency: '210ms', status: 'idle' },
                { model: 'gemini-pro', provider: 'Google', requests: '0', latency: '--', status: 'error' },
              ].map(row => (
                <tr key={row.model} className="d-data-row">
                  <td className="d-data-cell"><span className="mono-data">{row.model}</span></td>
                  <td className="d-data-cell" style={{ color: 'var(--d-text-muted)' }}>{row.provider}</td>
                  <td className="d-data-cell"><span className="mono-data">{row.requests}</span></td>
                  <td className="d-data-cell"><span className="mono-data">{row.latency}</span></td>
                  <td className="d-data-cell">
                    <span className="d-annotation" data-status={row.status === 'active' ? 'success' : row.status === 'error' ? 'error' : 'warning'}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: row.status === 'active' ? 'var(--d-success)' : row.status === 'error' ? 'var(--d-error)' : 'var(--d-text-muted)' }} />
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
