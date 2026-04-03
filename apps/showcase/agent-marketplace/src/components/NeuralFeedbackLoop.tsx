import { css } from '@decantr/css';
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  label: string;
  value: number;
  maxValue?: number;
  unit?: string;
  trend?: number;
  status?: 'idle' | 'active' | 'processing';
}

export function NeuralFeedbackLoop({ label, value, maxValue = 100, unit = '%', trend, status = 'active' }: Props) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = (value / maxValue) * 100;
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (circumference * animatedValue) / 100;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const pulseSpeed = status === 'processing' ? '1.5s' : status === 'active' ? '3s' : '6s';

  return (
    <div className={css('_flex _col _aic _gap4')} role="status" aria-label={`${label}: ${value}${unit}`}>
      {/* SVG ring visualization */}
      <div style={{ position: 'relative', width: 180, height: 180 }}>
        <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background ring */}
          <circle
            cx="90" cy="90" r="70"
            fill="none"
            stroke="var(--d-border)"
            strokeWidth="6"
            opacity="0.3"
          />
          {/* Value ring */}
          <circle
            cx="90" cy="90" r="70"
            fill="none"
            stroke="var(--d-accent)"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1)',
              filter: 'drop-shadow(0 0 6px var(--d-accent-glow))',
            }}
          />
        </svg>

        {/* Pulse core overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 30,
            borderRadius: '50%',
            background: `radial-gradient(circle, color-mix(in srgb, var(--d-accent) 10%, transparent), transparent)`,
            animation: `decantr-pulse ${pulseSpeed} ease-in-out infinite`,
          }}
        />

        {/* Center metric */}
        <div
          className={css('_abs _flex _col _aic _jcc')}
          style={{ inset: 0 }}
        >
          <span className={css('_text2xl _fontbold') + ' mono-data neon-text-glow'}>
            {Math.round(animatedValue * maxValue / 100)}{unit}
          </span>
          <span className={css('_textxs')} style={{ color: 'var(--d-text-muted)' }}>{label}</span>
        </div>
      </div>

      {/* Trend indicator */}
      {trend !== undefined && (
        <div className={css('_flex _aic _gap2')}>
          {trend >= 0 ? (
            <TrendingUp size={14} style={{ color: 'var(--d-success)' }} />
          ) : (
            <TrendingDown size={14} style={{ color: 'var(--d-error)' }} />
          )}
          <span
            className={css('_textsm') + ' mono-data'}
            style={{ color: trend >= 0 ? 'var(--d-success)' : 'var(--d-error)' }}
          >
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
          <span className={css('_textxs')} style={{ color: 'var(--d-text-muted)' }}>vs last hour</span>
        </div>
      )}
    </div>
  );
}
