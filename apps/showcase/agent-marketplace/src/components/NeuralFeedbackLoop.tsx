import { css } from '@decantr/css';

export interface FeedbackMetric {
  label: string;
  value: number;
  max: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
}

export function NeuralFeedbackLoop({
  metric,
  size = 200,
  pulseSpeed = 'normal',
}: {
  metric: FeedbackMetric;
  size?: number;
  pulseSpeed?: 'slow' | 'normal' | 'fast';
}) {
  const pct = Math.min(100, (metric.value / metric.max) * 100);
  const circumference = 2 * Math.PI * 80;
  const dashOffset = circumference - (pct / 100) * circumference;

  const pulseMs = pulseSpeed === 'fast' ? 1000 : pulseSpeed === 'slow' ? 4000 : 2500;

  const ringColor =
    pct > 80 ? 'var(--d-success)' : pct > 50 ? 'var(--d-accent)' : pct > 25 ? 'var(--d-warning)' : 'var(--d-error)';

  const trendArrow = metric.trend === 'up' ? '\u2191' : metric.trend === 'down' ? '\u2193' : '\u2192';

  return (
    <div
      className={css('_flex _col _aic _jcc')}
      style={{ width: size, height: size, position: 'relative' }}
      role="status"
      aria-label={`${metric.label}: ${metric.value}${metric.unit}`}
    >
      {/* SVG ring */}
      <svg
        viewBox="0 0 200 200"
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      >
        {/* Background ring */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="var(--d-border)"
          strokeWidth="4"
          opacity="0.3"
        />
        {/* Value ring */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke={ringColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 100 100)"
          style={{
            transition: 'stroke-dashoffset 500ms ease-out, stroke 300ms ease',
            filter: `drop-shadow(0 0 6px ${ringColor})`,
          }}
        />
        {/* Glow ring */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke={ringColor}
          strokeWidth="1"
          opacity="0.3"
          style={{
            animation: `neural-pulse ${pulseMs}ms ease-in-out infinite`,
          }}
        />
      </svg>

      {/* Center content */}
      <div className={css('_flex _col _aic')} style={{ zIndex: 1 }}>
        <span
          className="mono-data"
          style={{
            fontSize: size > 160 ? 28 : 20,
            fontWeight: 600,
            color: 'var(--d-text)',
          }}
        >
          {metric.value}
          <span style={{ fontSize: '0.5em', color: 'var(--d-text-muted)' }}>{metric.unit}</span>
        </span>
        <span
          style={{
            fontSize: 11,
            color: 'var(--d-text-muted)',
            marginTop: 2,
          }}
        >
          {metric.label}
        </span>
        {metric.trend && (
          <span
            className="d-annotation"
            data-status={metric.trend === 'up' ? 'success' : metric.trend === 'down' ? 'error' : 'info'}
            style={{ marginTop: 4, fontSize: 10 }}
          >
            {trendArrow} {metric.trend}
          </span>
        )}
      </div>

      <style>{`
        @keyframes neural-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

export function NeuralFeedbackRow({ metrics }: { metrics: FeedbackMetric[] }) {
  return (
    <div
      className={css('_flex _wrap _jcsa _gap6')}
      style={{ padding: '2rem 0' }}
    >
      {metrics.map(m => (
        <NeuralFeedbackLoop key={m.label} metric={m} size={180} />
      ))}
    </div>
  );
}
