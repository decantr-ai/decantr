import { css } from '@decantr/css';
import { useState, useEffect } from 'react';
import { Target, Cpu, BarChart3, TrendingUp, Clock } from 'lucide-react';
import { StatsOverview } from '../../components/StatsOverview';

/* ── Mock intent radar data ── */
const INTENTS = [
  { label: 'Data Extraction', confidence: 92, category: 'action', angle: 30 },
  { label: 'Summarization', confidence: 87, category: 'action', angle: 75 },
  { label: 'Code Generation', confidence: 78, category: 'tool', angle: 120 },
  { label: 'Classification', confidence: 95, category: 'decision', angle: 165 },
  { label: 'Translation', confidence: 64, category: 'action', angle: 210 },
  { label: 'Reasoning', confidence: 88, category: 'decision', angle: 255 },
  { label: 'Search', confidence: 71, category: 'tool', angle: 300 },
  { label: 'Analysis', confidence: 83, category: 'decision', angle: 345 },
];

const CATEGORY_COLORS: Record<string, string> = {
  action: 'var(--d-accent)',
  tool: 'var(--d-secondary)',
  decision: 'var(--d-success)',
};

const STATS = [
  { label: 'Avg Confidence', value: 82, format: (v: number) => v + '%', trend: 3.1, icon: <Target size={16} style={{ color: 'var(--d-accent)' }} /> },
  { label: 'Intents Detected', value: 8, trend: 0, icon: <Cpu size={16} style={{ color: 'var(--d-primary)' }} /> },
  { label: 'Top Category', value: 95, format: () => 'Classification', icon: <BarChart3 size={16} style={{ color: 'var(--d-success)' }} /> },
  { label: 'Decisions/min', value: 24, trend: 5.2, icon: <Clock size={16} style={{ color: 'var(--d-warning)' }} /> },
];

export function ConfidenceExplorer() {
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [animatedIntents, setAnimatedIntents] = useState<typeof INTENTS>([]);

  useEffect(() => {
    // Animate intents appearing
    const timer = setTimeout(() => setAnimatedIntents(INTENTS), 100);
    return () => clearTimeout(timer);
  }, []);

  const cx = 180;
  const cy = 180;
  const maxRadius = 150;

  return (
    <div className={css('_flex _col _gap6')}>
      <div>
        <h1 className={css('_fontsemi _textxl')} style={{ marginBottom: '0.25rem' }}>Confidence Explorer</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Visualize confidence distributions across intent categories</p>
      </div>

      {/* Intent Radar */}
      <div>
        <span className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem', display: 'block' }}>
          Confidence Distribution
        </span>

        <div className={css('_grid _gap6')} style={{ gridTemplateColumns: 'minmax(300px, 400px) 1fr' }}>
          {/* Radar SVG */}
          <div className="d-surface carbon-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg width="360" height="360" viewBox="0 0 360 360" role="img" aria-label="Intent confidence radar">
              {/* Concentric rings */}
              {[0.25, 0.5, 0.75, 1].map(scale => (
                <circle
                  key={scale}
                  cx={cx} cy={cy}
                  r={maxRadius * scale}
                  fill="none"
                  stroke="var(--d-border)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.3"
                />
              ))}

              {/* Ring labels */}
              {[25, 50, 75, 100].map(pct => (
                <text
                  key={pct}
                  x={cx + 4}
                  y={cy - (maxRadius * pct / 100) + 4}
                  fill="var(--d-text-muted)"
                  fontSize="9"
                  fontFamily="var(--d-font-mono)"
                  opacity="0.5"
                >
                  {pct}%
                </text>
              ))}

              {/* Intent vectors */}
              {animatedIntents.map(intent => {
                const rad = (intent.angle * Math.PI) / 180;
                const r = (intent.confidence / 100) * maxRadius;
                const x = cx + Math.cos(rad) * r;
                const y = cy + Math.sin(rad) * r;
                const isSelected = selectedIntent === intent.label;
                const color = CATEGORY_COLORS[intent.category];

                return (
                  <g key={intent.label} style={{ cursor: 'pointer' }} onClick={() => setSelectedIntent(isSelected ? null : intent.label)}>
                    {/* Vector line */}
                    <line
                      x1={cx} y1={cy} x2={x} y2={y}
                      stroke={color}
                      strokeWidth={isSelected ? 2 : 1}
                      opacity={isSelected ? 1 : 0.6}
                      style={{ transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                    />
                    {/* Endpoint dot */}
                    <circle
                      cx={x} cy={y} r={isSelected ? 6 : 4}
                      fill={color}
                      style={{
                        transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
                        filter: isSelected ? `drop-shadow(0 0 6px ${color})` : undefined,
                      }}
                    />
                    {/* Label */}
                    <text
                      x={cx + Math.cos(rad) * (maxRadius + 16)}
                      y={cy + Math.sin(rad) * (maxRadius + 16)}
                      fill={isSelected ? 'var(--d-text)' : 'var(--d-text-muted)'}
                      fontSize="10"
                      fontFamily="var(--d-font-mono)"
                      textAnchor={intent.angle > 90 && intent.angle < 270 ? 'end' : 'start'}
                      dominantBaseline="middle"
                      style={{ transition: 'fill 200ms ease' }}
                    >
                      {intent.label}
                    </text>
                  </g>
                );
              })}

              {/* Center glow */}
              <circle cx={cx} cy={cy} r="8" fill="var(--d-accent)" opacity="0.8">
                <animate attributeName="r" values="6;10;6" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx={cx} cy={cy} r="3" fill="var(--d-accent)" />
            </svg>
          </div>

          {/* Intent list */}
          <div className={css('_flex _col _gap2')}>
            <div className={css('_flex _aic _gap3')} style={{ marginBottom: '0.5rem' }}>
              {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                <span key={cat} className={css('_flex _aic _gap1 _textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  {cat}
                </span>
              ))}
            </div>

            {INTENTS.sort((a, b) => b.confidence - a.confidence).map(intent => (
              <div
                key={intent.label}
                className="carbon-card"
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  borderLeft: `3px solid ${CATEGORY_COLORS[intent.category]}`,
                  background: selectedIntent === intent.label ? 'var(--d-surface-raised)' : undefined,
                  transition: 'background 150ms ease',
                }}
                onClick={() => setSelectedIntent(selectedIntent === intent.label ? null : intent.label)}
              >
                <div className={css('_flex _aic _jcsb')}>
                  <div className={css('_flex _aic _gap2')}>
                    <span className={css('_textsm _fontmedium')}>{intent.label}</span>
                    <span className="d-annotation" data-status={intent.confidence >= 85 ? 'success' : intent.confidence >= 70 ? 'info' : 'warning'}>
                      {intent.category}
                    </span>
                  </div>
                  <span className={css('_fontsemi') + ' mono-data'} style={{ color: CATEGORY_COLORS[intent.category] }}>
                    {intent.confidence}%
                  </span>
                </div>
                {/* Confidence bar */}
                <div style={{ height: 4, background: 'var(--d-border)', borderRadius: 2, marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${intent.confidence}%`,
                    background: CATEGORY_COLORS[intent.category],
                    borderRadius: 2,
                    transition: 'width 800ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metric breakdown */}
      <div>
        <span className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem', display: 'block' }}>
          Metric Breakdown
        </span>
        <StatsOverview stats={STATS} />
      </div>
    </div>
  );
}
