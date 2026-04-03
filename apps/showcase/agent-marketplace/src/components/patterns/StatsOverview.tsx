import { useEffect, useRef, useState } from 'react';
import { css } from '@decantr/css';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { MetricSnapshot } from '../../data/types';

interface StatsOverviewProps {
  metrics: MetricSnapshot[];
}

function AnimatedValue({ target, unit }: { target: number; unit: string }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const from = 0;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOut: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (target - from) * eased;

      // Use integer display for large numbers, 1 decimal for small
      setDisplay(target >= 10 ? Math.round(current) : Math.round(current * 10) / 10);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target]);

  // Format display value
  const formatted =
    target >= 1000
      ? `${(display / 1000).toFixed(1)}k`
      : target >= 10
        ? String(display)
        : display.toFixed(1);

  return (
    <span>
      {formatted}
      {unit && <span style={{ fontSize: '0.6em', marginLeft: '0.15em' }}>{unit}</span>}
    </span>
  );
}

export function StatsOverview({ metrics }: StatsOverviewProps) {
  return (
    <div
      className={css('_grid _gc2 _md:gc3 _lg:gc5 _gap4')}
      role="region"
      aria-label="Key statistics"
    >
      {metrics.map((metric, i) => {
        const trendPositive = metric.trend >= 0;

        return (
          <div
            key={metric.label}
            className={css('_flex _col _gap2 _p4') + ' d-surface carbon-card'}
            tabIndex={0}
            aria-label={`${metric.label}: ${metric.value}${metric.unit}, ${trendPositive ? 'up' : 'down'} ${Math.abs(metric.trend)}%`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Label */}
            <span className={css('_textsm') + ' d-label'}>
              {metric.label}
            </span>

            {/* Value with counter animation */}
            <span
              className={css('_heading3 _fontbold') + ' mono-data'}
              style={{ color: 'var(--d-text)' }}
            >
              <AnimatedValue target={metric.value} unit={metric.unit} />
            </span>

            {/* Trend badge */}
            <span
              className="d-annotation"
              data-status={trendPositive ? 'success' : 'error'}
            >
              {trendPositive ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              {trendPositive ? '+' : ''}
              {metric.trend}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
