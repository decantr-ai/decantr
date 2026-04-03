import { css } from '@decantr/css';
import { useEffect, useRef, useState } from 'react';
import { Package, Download, Users, Palette, Activity, Star, CreditCard, HardDrive, Mail } from 'lucide-react';
import type { KPIStat } from '@/data/mock';
import { formatNumber } from '@/data/mock';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  Package, Download, Users, Palette, Activity, Star, CreditCard, HardDrive, Mail,
};

interface Props {
  stats?: KPIStat[];
  kpis?: KPIStat[];
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

export function KPIGrid({ stats, kpis }: Props) {
  const items = stats ?? kpis ?? [];
  return (
    <>
      <div className="kpi-grid">
        {items.map((stat) => {
          const Icon = ICON_MAP[stat.icon] || Package;
          const positive = stat.trend >= 0;
          return (
            <div key={stat.label} className="d-surface">
              <div className={css('_flex _aic _gap3')}>
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
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '0.125rem' }}>
                    {stat.label}
                  </div>
                  <div className={css('_flex _aic _gap2')}>
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

      <style>{`
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        @media (min-width: 1024px) {
          .kpi-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
    </>
  );
}
