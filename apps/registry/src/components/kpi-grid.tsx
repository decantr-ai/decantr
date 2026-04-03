'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface KPIItem {
  label: string;
  value: string | number;
  trend?: { value: number; positive: boolean };
  icon?: ReactNode;
}

function AnimatedValue({ value }: { value: string | number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const numeric = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numeric)) {
      el.textContent = String(value);
      return;
    }

    const duration = 500;
    const start = performance.now();
    const isInt = Number.isInteger(numeric);

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numeric * eased;

      if (el) {
        el.textContent = isInt
          ? Math.round(current).toLocaleString()
          : current.toFixed(1);
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [value]);

  return <span ref={ref}>{typeof value === 'number' ? '0' : value}</span>;
}

export function KPIGrid({ items }: { items: KPIItem[] }) {
  return (
    <div className="lum-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="d-surface p-4 sm:p-4 rounded-lg">
          <div className="flex items-start justify-between mb-3">
            {item.icon && (
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-d-surface-raised text-d-muted">
                {item.icon}
              </div>
            )}
            {item.trend && (
              <span
                className="d-annotation text-xs"
                data-status={item.trend.positive ? 'success' : 'error'}
              >
                {item.trend.positive ? '+' : ''}
                {item.trend.value}%
              </span>
            )}
          </div>
          <p className="text-sm text-d-muted mb-1">{item.label}</p>
          <p className="text-2xl font-bold font-mono text-d-text">
            <AnimatedValue value={item.value} />
          </p>
        </div>
      ))}
    </div>
  );
}
