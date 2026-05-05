import { css } from '@decantr/css';
import { useEffect, useMemo, useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

export function NeuralFeedbackLoop({
  label,
  value,
  maxValue = 100,
  unit = '%',
  trend,
  status = 'active',
}: {
  label: string;
  value: number;
  maxValue?: number;
  unit?: string;
  trend?: number;
  status?: 'idle' | 'active' | 'processing';
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.max(0, Math.min(100, (value / maxValue) * 100));
  const circumference = useMemo(() => 2 * Math.PI * 70, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setAnimatedValue(percentage), 80);
    return () => window.clearTimeout(timeout);
  }, [percentage]);

  return (
    <div className="feedback-visual" data-status={status} role="status" aria-label={`${label}: ${value}${unit}`}>
      <div className="feedback-visual__ring">
        <svg className="feedback-visual__svg" viewBox="0 0 180 180" aria-hidden="true">
          <circle className="feedback-visual__track" cx="90" cy="90" r="70" />
          <circle
            className="feedback-visual__value"
            cx="90"
            cy="90"
            r="70"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * animatedValue) / 100}
          />
        </svg>
        <div className="feedback-visual__pulse" />
        <div className="feedback-visual__center">
          <strong className="feedback-visual__metric">
            {Math.round((animatedValue * maxValue) / 100)}
            {unit}
          </strong>
          <span className="feedback-visual__label">{label}</span>
        </div>
      </div>

      {typeof trend === 'number' ? (
        <div className="feedback-visual__trend" data-tone={trend >= 0 ? 'up' : 'down'}>
          {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>
            {trend >= 0 ? '+' : ''}
            {trend}%
          </span>
          <span className={css('_textxs _fgmuted')}>
            vs last hour
          </span>
        </div>
      ) : null}
    </div>
  );
}
