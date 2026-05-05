import { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { StatItem } from '../data/mock';

function AnimatedCounter({
  target,
  valueText,
  format,
}: {
  target: number;
  valueText?: string;
  format?: (value: number) => string;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let frame = 0;
    const startTime = performance.now();
    const duration = 700;

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCurrent(Math.round(target * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  if (valueText) return <span>{valueText}</span>;
  if (format) return <span>{format(current)}</span>;
  return <span>{current.toLocaleString()}</span>;
}

export function StatsOverview({ stats }: { stats: StatItem[] }) {
  return (
    <div className="stats-grid carbon-fade-slide">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <article key={stat.label} className="d-surface carbon-card stats-card" data-tone={stat.tone ?? 'accent'}>
            <div className="stats-card__top">
              <span className="stats-card__label">{stat.label}</span>
              {Icon ? <Icon size={16} className="stats-card__icon" /> : null}
            </div>
            <div className="stats-card__value">
              <AnimatedCounter target={stat.value} valueText={stat.valueText} format={stat.format} />
            </div>
            {typeof stat.trend === 'number' ? (
              <div className="stats-card__trend">
                {stat.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span className="d-annotation" data-status={stat.trend >= 0 ? 'success' : 'error'}>
                  {stat.trend >= 0 ? '+' : ''}
                  {stat.trend}%
                </span>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
