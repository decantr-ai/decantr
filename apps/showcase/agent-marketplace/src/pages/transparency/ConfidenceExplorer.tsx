import { css } from '@decantr/css';
import { Target, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';

/* ── Intent radar (SVG polar visualization) ── */
const INTENTS = [
  { label: 'Code Gen', confidence: 0.94, angle: 0 },
  { label: 'Data ETL', confidence: 0.87, angle: 51 },
  { label: 'Search', confidence: 0.73, angle: 103 },
  { label: 'Security', confidence: 0.68, angle: 154 },
  { label: 'Deploy', confidence: 0.45, angle: 206 },
  { label: 'Test', confidence: 0.91, angle: 257 },
  { label: 'Monitor', confidence: 0.82, angle: 309 },
];

function IntentRadar() {
  const cx = 150, cy = 150, maxR = 120;
  const points = INTENTS.map((intent) => {
    const rad = (intent.angle - 90) * (Math.PI / 180);
    const r = maxR * intent.confidence;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad), ...intent };
  });

  const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ') + ' Z';

  return (
    <div className="d-surface carbon-glass neon-entrance" style={{ padding: 'var(--d-gap-4)' }}>
      <h3 className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--d-gap-3)' }}>
        Confidence Distribution
      </h3>
      <svg viewBox="0 0 300 300" style={{ width: '100%', maxWidth: 300, margin: '0 auto', display: 'block' }}>
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map((level) => (
          <circle key={level} cx={cx} cy={cy} r={maxR * level} fill="none" stroke="var(--d-border)" strokeWidth="0.5" opacity="0.4" />
        ))}

        {/* Sweep line */}
        <line x1={cx} y1={cy} x2={cx} y2={cy - maxR} stroke="var(--d-accent)" strokeWidth="1" opacity="0.3">
          <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`} dur="8s" repeatCount="indefinite" />
        </line>

        {/* Axis lines */}
        {INTENTS.map((intent) => {
          const rad = (intent.angle - 90) * (Math.PI / 180);
          return (
            <line
              key={intent.label}
              x1={cx} y1={cy}
              x2={cx + maxR * Math.cos(rad)}
              y2={cy + maxR * Math.sin(rad)}
              stroke="var(--d-border)"
              strokeWidth="0.5"
              opacity="0.3"
            />
          );
        })}

        {/* Confidence polygon */}
        <path d={pathD} fill="rgba(0, 212, 255, 0.1)" stroke="var(--d-accent)" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 4px var(--d-accent-glow))' }} />

        {/* Data points */}
        {points.map((p) => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} r="4" fill="var(--d-accent)" style={{ filter: 'drop-shadow(0 0 4px var(--d-accent-glow))' }} />
            <text
              x={cx + (maxR + 16) * Math.cos((p.angle - 90) * Math.PI / 180)}
              y={cy + (maxR + 16) * Math.sin((p.angle - 90) * Math.PI / 180)}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--d-text-muted)"
              fontFamily="var(--d-font-mono)"
              fontSize="8"
            >
              {p.label}
            </text>
          </g>
        ))}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="3" fill="var(--d-accent)" opacity="0.6" />
      </svg>
    </div>
  );
}

/* ── Metric breakdown (stats-detail) ── */
interface MetricRow {
  category: string;
  confidence: number;
  samples: string;
  trend: 'up' | 'down' | 'flat';
  delta: string;
}

const METRICS: MetricRow[] = [
  { category: 'Code Generation', confidence: 94.2, samples: '482k', trend: 'up', delta: '+2.1%' },
  { category: 'Data Extraction', confidence: 87.6, samples: '367k', trend: 'up', delta: '+1.4%' },
  { category: 'Test Generation', confidence: 91.0, samples: '241k', trend: 'up', delta: '+3.8%' },
  { category: 'Monitoring', confidence: 82.3, samples: '189k', trend: 'flat', delta: '+0.2%' },
  { category: 'Search & Retrieval', confidence: 73.1, samples: '134k', trend: 'down', delta: '-1.7%' },
  { category: 'Security Scanning', confidence: 68.4, samples: '98k', trend: 'down', delta: '-3.2%' },
  { category: 'Deployment', confidence: 45.2, samples: '67k', trend: 'down', delta: '-8.1%' },
];

function trendIcon(trend: 'up' | 'down' | 'flat') {
  if (trend === 'up') return <TrendingUp size={12} style={{ color: 'var(--d-success)' }} />;
  if (trend === 'down') return <TrendingDown size={12} style={{ color: 'var(--d-error)' }} />;
  return <Minus size={12} style={{ color: 'var(--d-text-muted)' }} />;
}

function MetricBreakdown() {
  return (
    <div className="d-surface carbon-glass neon-entrance" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: 'var(--d-gap-4) var(--d-gap-4) 0' }}>
        <h3 className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Metric Breakdown
        </h3>
      </div>
      <table className="d-data">
        <thead>
          <tr>
            <th className="d-data-header">Category</th>
            <th className="d-data-header">Confidence</th>
            <th className="d-data-header">Samples</th>
            <th className="d-data-header">Trend</th>
          </tr>
        </thead>
        <tbody>
          {METRICS.map((m) => (
            <tr key={m.category} className="d-data-row">
              <td className="d-data-cell" style={{ fontWeight: 500 }}>{m.category}</td>
              <td className="d-data-cell">
                <div className={css('_flex _aic _gap2')}>
                  <div style={{ width: 80, height: 4, background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius-full)', overflow: 'hidden' }}>
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
              <td className="d-data-cell mono-data">{m.samples}</td>
              <td className="d-data-cell">
                <div className={css('_flex _aic _gap1')}>
                  {trendIcon(m.trend)}
                  <span className="mono-data" style={{
                    fontSize: '0.75rem',
                    color: m.trend === 'up' ? 'var(--d-success)' : m.trend === 'down' ? 'var(--d-error)' : 'var(--d-text-muted)',
                  }}>
                    {m.delta}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Page ── */
export function ConfidenceExplorer() {
  return (
    <>
      <PageHeader
        title="Confidence Explorer"
        subtitle="Inspect confidence distributions across inference categories"
        actions={
          <button className="d-interactive neon-glow-hover" data-variant="ghost" style={{ border: '1px solid transparent' }}>
            <Target size={14} /> Recalibrate
          </button>
        }
      />

      {/* Overall confidence stat */}
      <div className={css('_flex _gap4 _wrap')} style={{ marginBottom: 'var(--d-gap-6)' }}>
        {[
          { label: 'Avg Confidence', value: '77.4%', icon: BarChart3 },
          { label: 'Categories', value: '7', icon: Target },
          { label: 'Total Samples', value: '1.58M', icon: TrendingUp },
        ].map((stat) => (
          <div key={stat.label} className={css('_flex _aic _gap3') + ' d-surface carbon-glass neon-entrance'} style={{ flex: 1, minWidth: 180 }}>
            <stat.icon size={16} style={{ color: 'var(--d-accent)' }} />
            <div>
              <div className="mono-data" style={{ fontSize: '1.125rem', fontWeight: 600 }}>{stat.value}</div>
              <div className="mono-data" style={{ fontSize: '0.625rem', color: 'var(--d-text-muted)', textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: radar + breakdown */}
      <div className={css('_flex _gap6 _wrap')} style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <IntentRadar />
        </div>
        <div style={{ flex: 2, minWidth: 400 }}>
          <MetricBreakdown />
        </div>
      </div>
    </>
  );
}
