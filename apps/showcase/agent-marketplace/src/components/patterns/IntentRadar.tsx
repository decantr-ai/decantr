import { css } from '@decantr/css';

interface Intent {
  label: string;
  confidence: number;
  category: string;
}

const INTENTS: Intent[] = [
  { label: 'Deploy Agent', confidence: 92, category: 'action' },
  { label: 'Scale Cluster', confidence: 78, category: 'infrastructure' },
  { label: 'View Logs', confidence: 65, category: 'monitoring' },
  { label: 'Update Config', confidence: 58, category: 'config' },
  { label: 'Check Status', confidence: 85, category: 'monitoring' },
  { label: 'Run Diagnostic', confidence: 42, category: 'debug' },
  { label: 'Restart Service', confidence: 35, category: 'action' },
  { label: 'Export Data', confidence: 28, category: 'data' },
];

const CATEGORY_COLORS: Record<string, string> = {
  action: 'var(--d-accent)',
  infrastructure: 'var(--d-primary)',
  monitoring: 'var(--d-success)',
  config: 'var(--d-warning)',
  debug: 'var(--d-secondary)',
  data: 'var(--d-info)',
};

const GRID_RINGS = [40, 80, 120, 160];
const GRID_LABELS = ['25%', '50%', '75%', '100%'];
const CENTER = 200;
const MAX_RADIUS = 160;

export function IntentRadar() {
  const angleStep = (2 * Math.PI) / INTENTS.length;

  return (
    <div
      className={css('_flex _col _aic _jcc') + ' radar-container'}
      style={{ maxWidth: 400, margin: '0 auto' }}
      role="search"
      aria-label="Intent confidence radar"
    >
      <svg viewBox="0 0 400 400" width="100%" height="100%">
        {/* Gridlines */}
        {GRID_RINGS.map((r, i) => (
          <g key={r}>
            <circle
              className="radar-gridline"
              cx={CENTER}
              cy={CENTER}
              r={r}
            />
            <text
              x={CENTER + r + 4}
              y={CENTER - 4}
              style={{
                fill: 'var(--d-text-muted)',
                fontSize: 9,
                opacity: 0.5,
              }}
              className="mono-data"
            >
              {GRID_LABELS[i]}
            </text>
          </g>
        ))}

        {/* Sweep line */}
        <line
          className="radar-sweep"
          x1={CENTER}
          y1={CENTER}
          x2={CENTER}
          y2={CENTER - MAX_RADIUS}
        />

        {/* Vectors + labels */}
        {INTENTS.map((intent, i) => {
          const angle = angleStep * i - Math.PI / 2; // start from top
          const length = (intent.confidence / 100) * MAX_RADIUS;
          const endX = CENTER + Math.cos(angle) * length;
          const endY = CENTER + Math.sin(angle) * length;
          const color = CATEGORY_COLORS[intent.category] || 'var(--d-text-muted)';

          // Label position slightly past the endpoint
          const labelDist = length + 18;
          const labelX = CENTER + Math.cos(angle) * labelDist;
          const labelY = CENTER + Math.sin(angle) * labelDist;

          return (
            <g key={intent.label}>
              {/* Vector line */}
              <line
                className="radar-vector"
                x1={CENTER}
                y1={CENTER}
                x2={endX}
                y2={endY}
                stroke={color}
                opacity={0.7 + (intent.confidence / 100) * 0.3}
              />

              {/* Endpoint dot */}
              <circle
                cx={endX}
                cy={endY}
                r={4}
                fill={color}
                style={{
                  filter: `drop-shadow(0 0 4px ${color})`,
                }}
              />

              {/* Suggestion chip / label */}
              <g transform={`translate(${labelX}, ${labelY})`}>
                <rect
                  x={-40}
                  y={-10}
                  width={80}
                  height={20}
                  rx={10}
                  fill="var(--d-surface)"
                  stroke="var(--d-border)"
                  strokeWidth={0.5}
                  opacity={0.9}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="mono-data"
                  style={{
                    fill: color,
                    fontSize: 8,
                  }}
                >
                  {intent.label}
                </text>
              </g>
            </g>
          );
        })}

        {/* Center dot */}
        <circle
          className="radar-center"
          cx={CENTER}
          cy={CENTER}
          r={6}
        />
      </svg>
    </div>
  );
}
