import { useState } from 'react';
import { css } from '@decantr/css';
import { StatsOverview, type StatItem } from '@/components/StatsOverview';

interface IntentVector {
  label: string;
  confidence: number;
}

const mockIntents: IntentVector[] = [
  { label: 'Deploy Agent', confidence: 92 },
  { label: 'Configure Model', confidence: 78 },
  { label: 'View Logs', confidence: 65 },
  { label: 'Scale Fleet', confidence: 54 },
  { label: 'Run Diagnostic', confidence: 41 },
  { label: 'Export Data', confidence: 28 },
];

const breakdownStats: StatItem[] = [
  { label: 'High Confidence (>80%)', value: '847', trend: { direction: 'up', percent: '+5.2%' } },
  { label: 'Medium Confidence (50-80%)', value: '312', trend: { direction: 'down', percent: '-2.1%' } },
  { label: 'Low Confidence (<50%)', value: '41', trend: { direction: 'down', percent: '-15.3%' } },
  { label: 'Avg Confidence', value: '87.4%', trend: { direction: 'up', percent: '+1.8%' } },
];

const RADAR_SIZE = 400;
const CENTER = RADAR_SIZE / 2;
const MAX_RADIUS = 160;

function confidenceColor(pct: number): string {
  if (pct > 80) return 'var(--d-success)';
  if (pct > 50) return 'var(--d-accent)';
  return 'var(--d-warning)';
}

export function ConfidenceExplorer() {
  const [activeIntent, setActiveIntent] = useState<string | null>(null);

  const gridRadii = [0.25, 0.5, 0.75, 1.0];
  const angleStep = (2 * Math.PI) / mockIntents.length;
  const startAngle = -Math.PI / 2;

  return (
    <div className={css('_flex _col _gap6')} style={{ padding: '1.5rem' }}>
      {/* Intent Radar section */}
      <section className="d-section" data-density="compact">
        <div
          className="d-label"
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}
        >
          CONFIDENCE DISTRIBUTION
        </div>
        <div className="d-surface carbon-card" style={{ padding: '1.5rem' }}>
          <div className={css('_flex _jcc')}>
            <svg
              viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
              style={{ width: '100%', maxWidth: RADAR_SIZE, aspectRatio: '1 / 1' }}
              role="img"
              aria-label="Confidence distribution radar showing intent vectors with confidence scores"
            >
              {/* Concentric gridlines */}
              {gridRadii.map((pct) => (
                <circle
                  key={pct}
                  cx={CENTER}
                  cy={CENTER}
                  r={MAX_RADIUS * pct}
                  fill="none"
                  stroke="var(--d-border)"
                  strokeWidth="1"
                  opacity="0.3"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Grid labels */}
              {gridRadii.map((pct) => (
                <text
                  key={`lbl-${pct}`}
                  x={CENTER + 4}
                  y={CENTER - MAX_RADIUS * pct + 12}
                  fill="var(--d-text-muted)"
                  fontSize="9"
                  fontFamily="monospace"
                  opacity="0.5"
                >
                  {Math.round(pct * 100)}%
                </text>
              ))}

              {/* Sweep animation overlay */}
              <defs>
                <linearGradient id="sweep-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--d-accent)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="var(--d-accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line
                x1={CENTER}
                y1={CENTER}
                x2={CENTER + MAX_RADIUS}
                y2={CENTER}
                stroke="var(--d-accent)"
                strokeWidth="1"
                opacity="0.4"
                style={{
                  transformOrigin: `${CENTER}px ${CENTER}px`,
                  animation: 'radar-sweep 6s linear infinite',
                }}
              />
              <path
                d={`M ${CENTER} ${CENTER} L ${CENTER + MAX_RADIUS} ${CENTER} A ${MAX_RADIUS} ${MAX_RADIUS} 0 0 0 ${CENTER + MAX_RADIUS * Math.cos(-Math.PI / 6)} ${CENTER + MAX_RADIUS * Math.sin(-Math.PI / 6)} Z`}
                fill="url(#sweep-grad)"
                style={{
                  transformOrigin: `${CENTER}px ${CENTER}px`,
                  animation: 'radar-sweep 6s linear infinite',
                }}
              />

              {/* Confidence polygon fill */}
              <polygon
                points={mockIntents.map((intent, i) => {
                  const angle = startAngle + i * angleStep;
                  const r = (intent.confidence / 100) * MAX_RADIUS;
                  return `${CENTER + r * Math.cos(angle)},${CENTER + r * Math.sin(angle)}`;
                }).join(' ')}
                fill="var(--d-accent)"
                fillOpacity="0.08"
                stroke="var(--d-accent)"
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />

              {/* Intent vectors */}
              {mockIntents.map((intent, i) => {
                const angle = startAngle + i * angleStep;
                const r = (intent.confidence / 100) * MAX_RADIUS;
                const endX = CENTER + r * Math.cos(angle);
                const endY = CENTER + r * Math.sin(angle);
                const labelR = MAX_RADIUS + 24;
                const labelX = CENTER + labelR * Math.cos(angle);
                const labelY = CENTER + labelR * Math.sin(angle);
                const color = confidenceColor(intent.confidence);
                const isActive = activeIntent === intent.label;

                return (
                  <g key={intent.label}>
                    {/* Vector line */}
                    <line
                      x1={CENTER}
                      y1={CENTER}
                      x2={endX}
                      y2={endY}
                      stroke={color}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      opacity={isActive ? 1 : 0.7}
                      style={{ transition: 'stroke-width 150ms ease, opacity 150ms ease' }}
                    />

                    {/* Endpoint dot */}
                    <circle
                      cx={endX}
                      cy={endY}
                      r={isActive ? 5 : 4}
                      fill={color}
                      style={{
                        filter: `drop-shadow(0 0 4px ${color})`,
                        transition: 'r 150ms ease',
                      }}
                    />

                    {/* Clickable chip label */}
                    <g
                      style={{ cursor: 'pointer' }}
                      onClick={() => setActiveIntent(isActive ? null : intent.label)}
                    >
                      <rect
                        x={labelX - 46}
                        y={labelY - 10}
                        width={92}
                        height={20}
                        rx={10}
                        fill={isActive ? `color-mix(in srgb, ${color} 25%, transparent)` : 'var(--d-surface)'}
                        stroke={color}
                        strokeWidth={isActive ? 1.5 : 0.75}
                        strokeOpacity={isActive ? 1 : 0.5}
                        style={{ transition: 'fill 150ms ease, stroke-width 150ms ease' }}
                      />
                      <text
                        x={labelX}
                        y={labelY + 3.5}
                        textAnchor="middle"
                        fill={isActive ? color : 'var(--d-text-muted)'}
                        fontSize="9"
                        fontWeight={isActive ? 600 : 400}
                        fontFamily="monospace"
                        style={{ transition: 'fill 150ms ease' }}
                      >
                        {intent.label} {intent.confidence}%
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Center glow circle */}
              <circle
                cx={CENTER}
                cy={CENTER}
                r={20}
                fill="var(--d-accent)"
                fillOpacity="0.15"
                stroke="var(--d-accent)"
                strokeWidth="1.5"
                style={{
                  filter: 'drop-shadow(0 0 8px var(--d-accent))',
                  animation: 'center-pulse 3s ease-in-out infinite',
                }}
              />
              <text
                x={CENTER}
                y={CENTER + 3}
                textAnchor="middle"
                fill="var(--d-accent)"
                fontSize="8"
                fontWeight="600"
                fontFamily="monospace"
              >
                QUERY
              </text>
            </svg>
          </div>

          {/* Active intent detail */}
          {activeIntent && (
            <div
              className="d-annotation carbon-code"
              style={{ marginTop: '1rem', textAlign: 'center', fontSize: 12 }}
            >
              <span className="mono-data" style={{ color: 'var(--d-text)' }}>
                {activeIntent}
              </span>
              {' '}
              <span className="mono-data" style={{ color: 'var(--d-text-muted)' }}>
                {mockIntents.find((i) => i.label === activeIntent)?.confidence}% confidence
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Stats section */}
      <section className="d-section" data-density="compact">
        <div
          className="d-label"
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}
        >
          METRIC BREAKDOWN
        </div>
        <StatsOverview stats={breakdownStats} />
      </section>

      <style>{`
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes center-pulse {
          0%, 100% { filter: drop-shadow(0 0 8px var(--d-accent)); opacity: 1; }
          50% { filter: drop-shadow(0 0 16px var(--d-accent)); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
