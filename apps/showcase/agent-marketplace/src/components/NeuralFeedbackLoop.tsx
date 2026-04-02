import { css } from '@decantr/css';
import { Activity, Cpu, Zap, TrendingUp } from 'lucide-react';

interface Metric {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'stable';
  icon: typeof Activity;
}

interface Props {
  title?: string;
  metrics?: Metric[];
  confidence?: number;
  processingStage?: string;
}

const defaultMetrics: Metric[] = [
  { label: 'Confidence', value: '94.2%', trend: 'up', icon: TrendingUp },
  { label: 'Token Rate', value: '1.2k/s', trend: 'stable', icon: Zap },
  { label: 'Latency', value: '120ms', trend: 'down', icon: Activity },
  { label: 'Active Loops', value: '3', trend: 'stable', icon: Cpu },
];

function PulseCore({ confidence = 0.94 }: { confidence?: number }) {
  const intensity = Math.min(confidence, 1);
  const size = 120;

  return (
    <div className={css('_flex _aic _jcc _rel')} style={{ width: size, height: size }}>
      {/* Outer pulse ring */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '2px solid var(--d-accent)',
          opacity: 0.3,
          animation: 'pulse-ring 2s ease-out infinite',
        }}
      />
      {/* Middle ring */}
      <div
        style={{
          position: 'absolute',
          inset: '12px',
          borderRadius: '50%',
          border: `2px solid var(--d-accent)`,
          opacity: 0.5,
          animation: 'pulse-ring 2s ease-out infinite 0.3s',
        }}
      />
      {/* Core */}
      <div
        className="neon-glow"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          borderRadius: '50%',
          background: `radial-gradient(circle, var(--d-accent) 0%, transparent 70%)`,
          opacity: 0.4 + intensity * 0.6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span className={css('_fontsemi _textsm') + ' mono-data'} style={{ color: 'var(--d-text)' }}>
          {Math.round(intensity * 100)}%
        </span>
      </div>
    </div>
  );
}

function IntensityRing({ value = 0.75, label = 'Throughput' }: { value?: number; label?: string }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value);

  return (
    <div className={css('_flex _col _aic _gap2')}>
      <svg width={100} height={100} viewBox="0 0 100 100">
        {/* Background ring */}
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="var(--d-border)"
          strokeWidth="4"
        />
        {/* Value ring */}
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="var(--d-accent)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{
            filter: 'drop-shadow(0 0 4px var(--d-accent-glow))',
            transition: 'stroke-dashoffset 0.5s ease',
          }}
        />
        <text
          x="50" y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--d-text)"
          fontSize="14"
          fontFamily="var(--d-font-mono)"
          fontWeight="600"
        >
          {Math.round(value * 100)}%
        </text>
      </svg>
      <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
        {label}
      </span>
    </div>
  );
}

export function NeuralFeedbackLoop({
  title = 'Neural Feedback',
  metrics = defaultMetrics,
  confidence = 0.94,
  processingStage = 'inference',
}: Props) {
  return (
    <div className={css('_flex _col _gap4')}>
      <div className={css('_flex _aic _jcsb')}>
        <h3
          className="d-label"
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}
        >
          {title}
        </h3>
        <span className="d-annotation" data-status="success">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--d-success)', display: 'inline-block' }} />
          {processingStage}
        </span>
      </div>

      {/* Visualization area */}
      <div className={css('_flex _aic _jcsa _py4 _wrap _gap4') + ' d-section'} data-density="compact">
        <PulseCore confidence={confidence} />
        <IntensityRing value={0.78} label="Throughput" />
        <IntensityRing value={confidence} label="Confidence" />
        <IntensityRing value={0.62} label="Efficiency" />
      </div>

      {/* Metric cards */}
      <div className={css('_grid _gc2 _lg:gc4 _gap3')}>
        {metrics.map(metric => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className={css('_flex _col _gap1 _p3') + ' d-surface carbon-glass'}>
              <div className={css('_flex _aic _gap2')}>
                <Icon size={14} style={{ color: 'var(--d-accent)' }} />
                <span className={css('_textxs') + ' mono-data d-label'}>{metric.label}</span>
              </div>
              <span className={css('_textxl _fontsemi') + ' mono-data neon-text-glow'}>
                {metric.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
