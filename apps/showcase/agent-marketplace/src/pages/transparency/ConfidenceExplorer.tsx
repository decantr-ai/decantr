import { css } from '@decantr/css';
import { Target, TrendingUp, BarChart3, Activity, Info } from 'lucide-react';

/* ── Intent Radar (SVG polar visualization) ── */
function IntentRadar() {
  const intents = [
    { label: 'Classification', confidence: 0.92, angle: 0 },
    { label: 'Summarization', confidence: 0.78, angle: 60 },
    { label: 'Translation', confidence: 0.65, angle: 120 },
    { label: 'Code Gen', confidence: 0.88, angle: 180 },
    { label: 'Analysis', confidence: 0.71, angle: 240 },
    { label: 'Extraction', confidence: 0.83, angle: 300 },
  ];

  const cx = 150;
  const cy = 150;
  const maxR = 120;

  const points = intents.map(intent => {
    const rad = (intent.angle - 90) * (Math.PI / 180);
    const r = maxR * intent.confidence;
    return {
      ...intent,
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
      labelX: cx + (maxR + 20) * Math.cos(rad),
      labelY: cy + (maxR + 20) * Math.sin(rad),
    };
  });

  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className={css('_flex _col _gap4')}>
      <h3
        className="d-label"
        style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}
      >
        Confidence Distribution
      </h3>
      <div className={css('_flex _jcc _p4')}>
        <svg width="300" height="300" viewBox="0 0 300 300">
          {/* Grid circles */}
          {[0.25, 0.5, 0.75, 1].map(scale => (
            <circle
              key={scale}
              cx={cx} cy={cy} r={maxR * scale}
              fill="none"
              stroke="var(--d-border)"
              strokeWidth="1"
              strokeDasharray={scale < 1 ? '4 4' : undefined}
              opacity={0.5}
            />
          ))}

          {/* Axis lines */}
          {intents.map(intent => {
            const rad = (intent.angle - 90) * (Math.PI / 180);
            return (
              <line
                key={intent.label}
                x1={cx} y1={cy}
                x2={cx + maxR * Math.cos(rad)}
                y2={cy + maxR * Math.sin(rad)}
                stroke="var(--d-border)"
                strokeWidth="1"
                opacity={0.3}
              />
            );
          })}

          {/* Confidence polygon */}
          <polygon
            points={polygonPoints}
            fill="rgba(0, 212, 255, 0.15)"
            stroke="var(--d-accent)"
            strokeWidth="2"
            style={{ filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.3))' }}
          />

          {/* Data points */}
          {points.map(p => (
            <g key={p.label}>
              <circle
                cx={p.x} cy={p.y} r="5"
                fill="var(--d-accent)"
                style={{ filter: 'drop-shadow(0 0 4px rgba(0, 212, 255, 0.5))' }}
              />
              <text
                x={p.labelX}
                y={p.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--d-text-muted)"
                fontSize="10"
                fontFamily="var(--d-font-mono)"
              >
                {p.label}
              </text>
            </g>
          ))}

          {/* Center label */}
          <text
            x={cx} y={cy}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--d-text)"
            fontSize="12"
            fontFamily="var(--d-font-mono)"
            fontWeight="600"
          >
            INTENT
          </text>
        </svg>
      </div>

      {/* Confidence legend */}
      <div className={css('_grid _gc2 _lg:gc3 _gap2')}>
        {intents.map(intent => (
          <div key={intent.label} className={css('_flex _aic _gap2 _textxs') + ' mono-data'}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: intent.confidence > 0.8 ? 'var(--d-success)' : intent.confidence > 0.6 ? 'var(--d-warning)' : 'var(--d-error)',
              }}
            />
            <span style={{ color: 'var(--d-text-muted)' }}>{intent.label}</span>
            <span className={css('_fontsemi')} style={{ marginLeft: 'auto' }}>
              {Math.round(intent.confidence * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Stats Detail ── */
interface DetailStat {
  label: string;
  value: string;
  breakdown: Array<{ label: string; value: number; color: string }>;
}

const detailStats: DetailStat[] = [
  {
    label: 'Model Accuracy by Task',
    value: '89.4%',
    breakdown: [
      { label: 'Classification', value: 94, color: 'var(--d-success)' },
      { label: 'Summarization', value: 87, color: 'var(--d-accent)' },
      { label: 'Translation', value: 82, color: 'var(--d-warning)' },
      { label: 'Code Generation', value: 91, color: 'var(--d-info)' },
    ],
  },
  {
    label: 'Latency Distribution',
    value: '142ms avg',
    breakdown: [
      { label: 'P50', value: 85, color: 'var(--d-success)' },
      { label: 'P90', value: 62, color: 'var(--d-accent)' },
      { label: 'P95', value: 45, color: 'var(--d-warning)' },
      { label: 'P99', value: 28, color: 'var(--d-error)' },
    ],
  },
];

function StatsDetail() {
  return (
    <div className={css('_flex _col _gap4')}>
      <h3
        className="d-label"
        style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}
      >
        Metric Breakdown
      </h3>
      <div className={css('_flex _col _gap4')}>
        {detailStats.map(stat => (
          <div key={stat.label} className={css('_flex _col _gap3 _p4') + ' d-surface carbon-glass'}>
            <div className={css('_flex _aic _jcsb')}>
              <span className={css('_textsm _fontmedium') + ' mono-data'}>{stat.label}</span>
              <span className={css('_textsm _fontsemi') + ' mono-data neon-text-glow'}>{stat.value}</span>
            </div>
            <div className={css('_flex _col _gap2')}>
              {stat.breakdown.map(item => (
                <div key={item.label} className={css('_flex _col _gap1')}>
                  <div className={css('_flex _jcsb _textxs') + ' mono-data'}>
                    <span style={{ color: 'var(--d-text-muted)' }}>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div style={{ height: '4px', borderRadius: '2px', background: 'var(--d-surface-raised)' }}>
                    <div
                      style={{
                        width: `${item.value}%`,
                        height: '100%',
                        borderRadius: '2px',
                        background: item.color,
                        boxShadow: `0 0 6px ${item.color}`,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConfidenceExplorer() {
  return (
    <div className={css('_flex _col _gap6')}>
      <section className="d-section" data-density="compact">
        <IntentRadar />
      </section>

      <section className="d-section" data-density="compact">
        <StatsDetail />
      </section>
    </div>
  );
}
