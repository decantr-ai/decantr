'use client';

import { useEffect, useRef, useState } from 'react';

export interface KPIStat {
  label: string;
  value: number;
  trend: number;
  icon: string;
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return n.toString();
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

function KPIIcon({ name }: { name: string }) {
  const props = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'Package': return <svg {...props}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
    case 'Download': return <svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
    case 'Users': return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'Palette': return <svg {...props}><circle cx="13.5" cy="6.5" r="2.5" /><circle cx="6.5" cy="13.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /><path d="M3 3h18v18H3z" /></svg>;
    case 'Activity': return <svg {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
    case 'Star': return <svg {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
    case 'CreditCard': return <svg {...props}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>;
    case 'HardDrive': return <svg {...props}><line x1="22" y1="12" x2="2" y2="12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /><line x1="6" y1="16" x2="6.01" y2="16" /><line x1="10" y1="16" x2="10.01" y2="16" /></svg>;
    case 'Mail': return <svg {...props}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;
    default: return <svg {...props}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>;
  }
}

interface Props {
  stats: KPIStat[];
}

export function KPIGrid({ stats }: Props) {
  return (
    <div className="kpi-grid">
      {stats.map((stat) => {
        const positive = stat.trend >= 0;
        return (
          <div key={stat.label} className="d-surface">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--d-radius)',
                  background: 'color-mix(in srgb, var(--d-accent) 12%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <KPIIcon name={stat.icon} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="text-sm" style={{ color: 'var(--d-text-muted)', marginBottom: '0.125rem' }}>
                  {stat.label}
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2 }}>
                    <AnimatedValue value={stat.value} />
                  </span>
                  {stat.trend !== 0 && (
                    <span
                      className="d-annotation"
                      data-status={positive ? 'success' : 'error'}
                    >
                      {positive ? '+' : ''}{stat.trend}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
