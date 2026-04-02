import { css } from '@decantr/css';
import {
  Brain, Cpu, Zap, Clock, TrendingUp, TrendingDown,
  Activity,
} from 'lucide-react';

const models = [
  { name: 'sentinel-v3.2', type: 'Monitor', status: 'active' as const, confidence: 0.97, throughput: 340, latency: '89ms', tokens24h: '2.4M', cost24h: '$12.80' },
  { name: 'parser-v2.8', type: 'ETL', status: 'active' as const, confidence: 0.91, throughput: 890, latency: '124ms', tokens24h: '8.1M', cost24h: '$43.20' },
  { name: 'curator-v4.1', type: 'Classifier', status: 'degraded' as const, confidence: 0.83, throughput: 203, latency: '347ms', tokens24h: '1.8M', cost24h: '$9.60' },
  { name: 'router-v1.0', type: 'Orchestrator', status: 'active' as const, confidence: 0.95, throughput: 512, latency: '45ms', tokens24h: '5.2M', cost24h: '$27.80' },
  { name: 'analyst-v2.1', type: 'Inference', status: 'offline' as const, confidence: 0, throughput: 0, latency: '—', tokens24h: '0', cost24h: '$0.00' },
];

const kpis = [
  { label: 'Avg Confidence', value: '91.4%', change: '+2.1%', trend: 'up' as const, icon: Brain },
  { label: 'Total Throughput', value: '1,945', change: '+340', trend: 'up' as const, icon: Zap },
  { label: 'Avg Latency', value: '151ms', change: '-12ms', trend: 'up' as const, icon: Clock },
  { label: 'Active Models', value: '4/5', change: '-1', trend: 'down' as const, icon: Cpu },
];

function ConfidenceBar({ value }: { value: number }) {
  const color = value > 0.9 ? 'var(--d-success)' : value > 0.8 ? 'var(--d-warning)' : value > 0 ? 'var(--d-error)' : 'var(--d-border)';
  return (
    <div className={css('_flex _aic _gap2')}>
      <div className="progress-bar" style={{ width: 60 }}>
        <div className="progress-fill" style={{ width: `${value * 100}%`, background: color }} />
      </div>
      <span className={'font-mono ' + css('_textxs')} style={{ color }}>
        {value > 0 ? `${(value * 100).toFixed(0)}%` : '—'}
      </span>
    </div>
  );
}

export function ModelOverview() {
  return (
    <div className={css('_flex _col _gap6') + ' fade-in'}>
      {/* Header */}
      <div>
        <h1 className={'font-mono ' + css('_text2xl _fontbold')}>Model Transparency</h1>
        <p className={'font-mono ' + css('_textsm _fgmuted _mt1')}>
          Observability across all deployed models
        </p>
      </div>

      {/* KPI cards */}
      <div className={css('_grid _gc2 _lg:gc4 _gap4')}>
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className={css('_flex _col _gap2 _p4') + ' carbon-card'}>
              <div className={css('_flex _aic _jcsb')}>
                <Icon size={16} style={{ color: 'var(--d-text-muted)' }} />
                <span className={css('_flex _aic _gap1 _textxs') + ' font-mono'} style={{ color: k.trend === 'up' ? 'var(--d-success)' : 'var(--d-error)' }}>
                  {k.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {k.change}
                </span>
              </div>
              <span className="metric-value">{k.value}</span>
              <span className={'font-mono ' + css('_textxs _fgmuted _uppercase')}>{k.label}</span>
            </div>
          );
        })}
      </div>

      {/* Model table */}
      <div className={css('_flex _col _gap3')}>
        <h2 className={'font-mono ' + css('_textsm _fontbold _uppercase')}>Deployed Models</h2>
        <div className={css('_overauto') + ' carbon-card'} style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Model</th>
                <th>Type</th>
                <th>Confidence</th>
                <th>Throughput</th>
                <th>Latency</th>
                <th>Tokens (24h)</th>
                <th>Cost (24h)</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.name}>
                  <td>
                    <span className={
                      'status-ring ' +
                      (m.status === 'active' ? 'status-online pulse' :
                       m.status === 'degraded' ? 'status-warning pulse' : 'status-offline')
                    } />
                  </td>
                  <td><span className="font-mono">{m.name}</span></td>
                  <td><span className="badge badge-muted">{m.type}</span></td>
                  <td><ConfidenceBar value={m.confidence} /></td>
                  <td><span className="font-mono">{m.throughput > 0 ? `${m.throughput}/s` : '—'}</span></td>
                  <td><span className="font-mono">{m.latency}</span></td>
                  <td><span className="font-mono">{m.tokens24h}</span></td>
                  <td><span className="font-mono">{m.cost24h}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feedback summary visualization */}
      <div className={css('_flex _col _gap3')}>
        <h2 className={'font-mono ' + css('_textsm _fontbold _uppercase')}>Neural Feedback Summary</h2>
        <div className={css('_grid _gc1 _lg:gc3 _gap4')}>
          {models.filter(m => m.status !== 'offline').map((m) => (
            <div key={m.name} className={css('_flex _col _aic _gap3 _p5') + ' carbon-card'}>
              {/* Pulse ring visualization */}
              <div className={css('_rel')} style={{ width: 100, height: 100 }}>
                <svg width={100} height={100} className="confidence-ring" style={{ position: 'absolute', inset: 0 }}>
                  <circle cx={50} cy={50} r={42} fill="none" stroke="var(--d-border)" strokeWidth={3} opacity={0.3} />
                  <circle
                    cx={50} cy={50} r={42} fill="none"
                    stroke={m.confidence > 0.9 ? 'var(--d-success)' : m.confidence > 0.8 ? 'var(--d-warning)' : 'var(--d-error)'}
                    strokeWidth={3}
                    strokeDasharray={264} strokeDashoffset={264 - m.confidence * 264}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 4px ${m.confidence > 0.9 ? 'var(--d-success)' : m.confidence > 0.8 ? 'var(--d-warning)' : 'var(--d-error)'})` }}
                  />
                </svg>
                <div className={css('_abs _flex _col _aic _jcc')} style={{ inset: 0 }}>
                  <Activity size={16} style={{ color: 'var(--d-primary)' }} className="pulse" />
                </div>
              </div>
              <span className={'font-mono ' + css('_textsm _fontsemi')}>{m.name}</span>
              <div className={css('_flex _gap4')}>
                <div className={css('_flex _col _aic')}>
                  <span className={'metric-value ' + css('_textlg')} style={{ color: m.confidence > 0.9 ? 'var(--d-success)' : 'var(--d-warning)' }}>
                    {(m.confidence * 100).toFixed(0)}%
                  </span>
                  <span className={'font-mono ' + css('_textxs _fgmuted')}>confidence</span>
                </div>
                <div className={css('_flex _col _aic')}>
                  <span className={'metric-value ' + css('_textlg')}>{m.throughput}</span>
                  <span className={'font-mono ' + css('_textxs _fgmuted')}>req/s</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
