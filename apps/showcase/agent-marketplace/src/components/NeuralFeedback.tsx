import { css } from '@decantr/css';

interface NeuralFeedbackProps {
  confidence: number;
  tokensPerSec: number;
  stage: string;
  label: string;
}

export function NeuralFeedback({ confidence, tokensPerSec, stage, label }: NeuralFeedbackProps) {
  const intensity = Math.min(confidence / 100, 1);
  const glowSize = 8 + intensity * 16;

  return (
    <div className={css('_flex _col _aic _gap4') + ' d-surface carbon-glass neon-entrance'} style={{ padding: 'var(--d-gap-6)' }}>
      <span className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </span>

      {/* Pulse core */}
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 'var(--d-radius-full)',
          background: `radial-gradient(circle, rgba(0,212,255,${0.15 + intensity * 0.2}) 0%, transparent 70%)`,
          boxShadow: `0 0 ${glowSize}px var(--d-accent-glow), 0 0 ${glowSize * 2}px var(--d-accent-glow)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'neon-pulse 2s ease-in-out infinite',
        }}
      >
        {/* Intensity ring */}
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="35" fill="none" stroke="var(--d-border)" strokeWidth="3" />
          <circle
            cx="40" cy="40" r="35" fill="none"
            stroke="var(--d-accent)"
            strokeWidth="3"
            strokeDasharray={`${220 * intensity} ${220 * (1 - intensity)}`}
            strokeDashoffset="-55"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px var(--d-accent-glow))` }}
          />
          <text x="40" y="44" textAnchor="middle" fill="var(--d-accent)" fontFamily="var(--d-font-mono)" fontSize="18" fontWeight="600">
            {Math.round(confidence)}%
          </text>
        </svg>
      </div>

      {/* Metrics row */}
      <div className={css('_flex _gap6 _jcc')}>
        <div className={css('_flex _col _aic _gap1')}>
          <span className="mono-data" style={{ fontSize: '1.125rem', fontWeight: 600 }}>{tokensPerSec}</span>
          <span className="mono-data" style={{ fontSize: '0.625rem', color: 'var(--d-text-muted)', textTransform: 'uppercase' }}>tok/s</span>
        </div>
        <div style={{ width: 1, background: 'var(--d-border)' }} />
        <div className={css('_flex _col _aic _gap1')}>
          <span className="d-annotation" data-status="info">{stage}</span>
          <span className="mono-data" style={{ fontSize: '0.625rem', color: 'var(--d-text-muted)', textTransform: 'uppercase' }}>stage</span>
        </div>
      </div>
    </div>
  );
}
