import { css } from '@decantr/css';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface StatItem {
  label: string;
  value: number;
  format?: (v: number) => string;
  trend?: number;
  icon?: React.ReactNode;
}

interface Props {
  stats: StatItem[];
}

function AnimatedCounter({ target, format }: { target: number; format?: (v: number) => string }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const startTime = performance.now();
    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(target * eased);
      setCurrent(start);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [target]);

  const display = format ? format(current) : current.toLocaleString();
  return <span ref={ref}>{display}</span>;
}

export function StatsOverview({ stats }: Props) {
  return (
    <div className={css('_grid _gap4')} style={{ gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))` }}>
      {stats.map((stat, i) => (
        <div
          key={i}
          className="d-surface carbon-card"
          style={{
            animationDelay: `${i * 80}ms`,
          }}
        >
          <div className={css('_flex _col _gap2')}>
            <div className={css('_flex _aic _jcsb')}>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{stat.label}</span>
              {stat.icon}
            </div>
            <span className={css('_text2xl _fontbold') + ' mono-data'}>
              <AnimatedCounter target={stat.value} format={stat.format} />
            </span>
            {stat.trend !== undefined && (
              <div className={css('_flex _aic _gap1')}>
                {stat.trend >= 0 ? (
                  <TrendingUp size={12} style={{ color: 'var(--d-success)' }} />
                ) : (
                  <TrendingDown size={12} style={{ color: 'var(--d-error)' }} />
                )}
                <span
                  className="d-annotation"
                  data-status={stat.trend >= 0 ? 'success' : 'error'}
                >
                  {stat.trend >= 0 ? '+' : ''}{stat.trend}%
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
