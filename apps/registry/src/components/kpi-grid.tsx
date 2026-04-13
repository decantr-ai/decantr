'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

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
  return (
    <>
      <div className="kpi-grid">
        {items.map((item) => {
          const trend = item.trend;
          const positive = trend !== undefined && trend >= 0;
          return (
            <div key={item.label} className="d-surface">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                {item.icon && (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--d-radius)',
                      background:
                        'color-mix(in srgb, var(--d-accent) 12%, transparent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div
                    className="text-sm"
                    style={{
                      color: 'var(--d-text-muted)',
                      marginBottom: '0.125rem',
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        lineHeight: 1.2,
                      }}
                    >
                      <AnimatedValue value={item.value} />
                    </span>
                    {trend !== undefined && trend !== 0 && (
                      <span
                        className="d-annotation"
                        data-status={positive ? 'success' : 'error'}
                      >
                        {positive ? '+' : ''}
                        {trend}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }
      `}</style>
    </>
  );
}
