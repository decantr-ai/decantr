'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

interface KPIItem {
  label: string;
  value: number;
  trend?: number;
  icon?: ReactNode;
}

interface KPIGridProps {
  items: KPIItem[];
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (n >= 1_000) {
    return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return n.toLocaleString();
}

function AnimatedValue({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 500;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <>{formatNumber(display)}</>;
}

export function KPIGrid({ items }: KPIGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [liveTick, setLiveTick] = useState(0);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 },
    );
    observer.observe(grid);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLiveTick((tick) => tick + 1);
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      ref={gridRef}
      className={`registry-kpi-grid d-stagger-children ${revealed ? 'd-enter-fade' : ''}`}
      data-live-tick={liveTick}
      aria-live="polite"
    >
      {items.map((item, index) => {
        const trend = item.trend;
        const positive = trend !== undefined && trend >= 0;

        return (
          <div
            key={item.label}
            className="d-surface registry-kpi-card d-lift-hover"
            data-tooltip={`${item.label}: ${formatNumber(item.value)}`}
            style={{ '--d-stagger-index': index } as CSSProperties}
          >
            <div className="registry-kpi-content">
              {item.icon ? <div className="registry-kpi-icon">{item.icon}</div> : null}
              <div className="registry-kpi-meta">
                <div className="registry-kpi-label">{item.label}</div>
                <div className="registry-kpi-value-row">
                  <span className="registry-kpi-value">
                    <AnimatedValue value={item.value} />
                  </span>
                  {trend !== undefined && trend !== 0 ? (
                    <span
                      className="d-annotation"
                      data-status={positive ? 'success' : 'error'}
                    >
                      {positive ? '+' : ''}
                      {trend}%
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
