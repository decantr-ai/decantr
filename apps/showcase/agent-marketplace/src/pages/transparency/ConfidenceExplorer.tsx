import { css } from '@decantr/css';
import {
  Brain, TrendingUp, TrendingDown, BarChart3,
  Activity, Target,
} from 'lucide-react';

const confidenceData = [
  { range: '95-100%', count: 1247, pct: 42 },
  { range: '90-95%', count: 891, pct: 30 },
  { range: '85-90%', count: 412, pct: 14 },
  { range: '80-85%', count: 203, pct: 7 },
  { range: '75-80%', count: 112, pct: 4 },
  { range: '<75%', count: 89, pct: 3 },
];

const modelMetrics = [
  {
    model: 'sentinel-v3.2', confidence: 0.97, trend: 'up' as const, change: '+1.2%',
    p50: '96.8%', p90: '98.2%', p99: '99.1%',
    topCategories: ['anomaly-detection', 'health-check', 'latency-analysis'],
  },
  {
    model: 'parser-v2.8', confidence: 0.91, trend: 'up' as const, change: '+0.8%',
    p50: '90.4%', p90: '94.1%', p99: '96.7%',
    topCategories: ['schema-inference', 'transformation', 'validation'],
  },
  {
    model: 'curator-v4.1', confidence: 0.83, trend: 'down' as const, change: '-2.4%',
    p50: '82.1%', p90: '87.3%', p99: '91.2%',
    topCategories: ['classification', 'entity-extraction', 'tagging'],
  },
  {
    model: 'router-v1.0', confidence: 0.95, trend: 'up' as const, change: '+0.3%',
    p50: '94.7%', p90: '96.8%', p99: '98.4%',
    topCategories: ['load-balancing', 'capacity-planning', 'routing'],
  },
];

function DistributionBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="progress-bar" style={{ flex: 1, height: 8 }}>
      <div
        className="progress-fill"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function RadarVisualization() {
  // Simplified radar/polar visualization using CSS
  const axes = ['Accuracy', 'Speed', 'Recall', 'Precision', 'F1', 'Throughput'];
  const values = [0.95, 0.88, 0.91, 0.93, 0.92, 0.87];
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 100;

  const points = values.map((v, i) => {
    const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    const r = v * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  const labelPositions = axes.map((_, i) => {
    const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    const r = maxR + 20;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  const polygon = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid circles */}
      {[0.25, 0.5, 0.75, 1].map((s) => (
        <circle key={s} cx={cx} cy={cy} r={maxR * s} fill="none" stroke="var(--d-border)" strokeWidth={1} opacity={0.3} />
      ))}
      {/* Grid lines */}
      {axes.map((_, i) => {
        const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={cx + maxR * Math.cos(angle)}
            y2={cy + maxR * Math.sin(angle)}
            stroke="var(--d-border)" strokeWidth={1} opacity={0.3}
          />
        );
      })}
      {/* Data polygon */}
      <polygon
        points={polygon}
        fill="color-mix(in srgb, var(--d-primary) 20%, transparent)"
        stroke="var(--d-primary)"
        strokeWidth={2}
        style={{ filter: 'drop-shadow(0 0 6px var(--d-primary))' }}
      />
      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="var(--d-primary)" stroke="var(--d-bg)" strokeWidth={2} />
      ))}
      {/* Labels */}
      {labelPositions.map((p, i) => (
        <text
          key={i}
          x={p.x} y={p.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--d-text-muted)"
          fontSize={10}
          fontFamily="ui-monospace, 'Cascadia Code', monospace"
        >
          {axes[i]}
        </text>
      ))}
    </svg>
  );
}

export function ConfidenceExplorer() {
  return (
    <div className={css('_flex _col _gap6') + ' fade-in'}>
      {/* Header */}
      <div>
        <h1 className={'font-mono ' + css('_text2xl _fontbold')}>Confidence Explorer</h1>
        <p className={'font-mono ' + css('_textsm _fgmuted _mt1')}>
          Confidence distribution analysis across all models
        </p>
      </div>

      {/* Radar + distribution side by side */}
      <div className={css('_grid _gc1 _lg:gc2 _gap6')}>
        {/* Intent radar */}
        <div className={css('_flex _col _aic _gap4 _p6') + ' carbon-card neon-glow'}>
          <h3 className={'font-mono ' + css('_textsm _fontbold _uppercase')}>
            <Target size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Performance Radar
          </h3>
          <RadarVisualization />
          <div className={css('_grid _gc3 _gap3 _wfull')}>
            {[
              { label: 'Accuracy', value: '95%', color: 'var(--d-success)' },
              { label: 'F1 Score', value: '92%', color: 'var(--d-primary)' },
              { label: 'Speed', value: '88%', color: 'var(--d-info)' },
            ].map((m) => (
              <div key={m.label} className={css('_flex _col _aic _gap1')}>
                <span className={'metric-value ' + css('_textlg')} style={{ color: m.color }}>{m.value}</span>
                <span className={'font-mono ' + css('_textxs _fgmuted')}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence distribution */}
        <div className={css('_flex _col _gap4 _p6') + ' carbon-card'}>
          <h3 className={'font-mono ' + css('_textsm _fontbold _uppercase')}>
            <BarChart3 size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Confidence Distribution
          </h3>
          <div className={css('_flex _col _gap3')}>
            {confidenceData.map((d) => {
              const color = d.pct > 30 ? 'var(--d-success)' : d.pct > 10 ? 'var(--d-primary)' : d.pct > 5 ? 'var(--d-warning)' : 'var(--d-error)';
              return (
                <div key={d.range} className={css('_flex _aic _gap3')}>
                  <span className={'font-mono ' + css('_textxs _fgmuted _shrink0')} style={{ width: 60 }}>{d.range}</span>
                  <DistributionBar pct={d.pct} color={color} />
                  <span className={'font-mono ' + css('_textxs _shrink0')} style={{ width: 40 }}>{d.count}</span>
                  <span className={'font-mono ' + css('_textxs _fgmuted _shrink0')} style={{ width: 30 }}>{d.pct}%</span>
                </div>
              );
            })}
          </div>
          <div className="separator" />
          <div className={css('_flex _jcsb')}>
            <span className={'font-mono ' + css('_textxs _fgmuted')}>Total inferences: 2,954</span>
            <span className={'font-mono ' + css('_textxs _fgmuted')}>Mean: 91.4%</span>
          </div>
        </div>
      </div>

      {/* Per-model metric breakdown */}
      <div className={css('_flex _col _gap3')}>
        <h2 className={'font-mono ' + css('_textsm _fontbold _uppercase')}>
          <Activity size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Per-Model Metrics
        </h2>
        <div className={css('_grid _gc1 _lg:gc2 _gap4')}>
          {modelMetrics.map((m) => (
            <div key={m.model} className={css('_flex _col _gap3 _p5') + ' carbon-card'}>
              <div className={css('_flex _aic _jcsb')}>
                <div className={css('_flex _aic _gap2')}>
                  <Brain size={16} style={{ color: 'var(--d-primary)' }} />
                  <span className={'font-mono ' + css('_fontsemi')}>{m.model}</span>
                </div>
                <span className={css('_flex _aic _gap1 _textxs') + ' font-mono'} style={{ color: m.trend === 'up' ? 'var(--d-success)' : 'var(--d-error)' }}>
                  {m.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {m.change}
                </span>
              </div>

              <div className={css('_flex _aic _gap2')}>
                <span className={'metric-value ' + css('_text2xl')} style={{ color: m.confidence > 0.9 ? 'var(--d-success)' : m.confidence > 0.8 ? 'var(--d-warning)' : 'var(--d-error)' }}>
                  {(m.confidence * 100).toFixed(1)}%
                </span>
                <span className={'font-mono ' + css('_textxs _fgmuted')}>avg confidence</span>
              </div>

              <div className={css('_grid _gc3 _gap3')}>
                <div className={css('_flex _col _gap1 _p2 _rounded')} style={{ background: 'var(--d-surface-raised)' }}>
                  <span className={'font-mono ' + css('_textxs _fgmuted')}>p50</span>
                  <span className={'font-mono ' + css('_textsm _fontsemi')}>{m.p50}</span>
                </div>
                <div className={css('_flex _col _gap1 _p2 _rounded')} style={{ background: 'var(--d-surface-raised)' }}>
                  <span className={'font-mono ' + css('_textxs _fgmuted')}>p90</span>
                  <span className={'font-mono ' + css('_textsm _fontsemi')}>{m.p90}</span>
                </div>
                <div className={css('_flex _col _gap1 _p2 _rounded')} style={{ background: 'var(--d-surface-raised)' }}>
                  <span className={'font-mono ' + css('_textxs _fgmuted')}>p99</span>
                  <span className={'font-mono ' + css('_textsm _fontsemi')}>{m.p99}</span>
                </div>
              </div>

              <div className={css('_flex _wrap _gap1')}>
                {m.topCategories.map((cat) => (
                  <span key={cat} className="badge badge-muted font-mono">{cat}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
