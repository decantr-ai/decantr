import type { Vital } from '@/data/mock';
import { Sparkline } from './Sparkline';

interface VitalCardProps {
  vital: Vital;
}

export function VitalCard({ vital }: VitalCardProps) {
  return (
    <div className="hw-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', fontWeight: 500 }}>{vital.name}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginTop: '0.375rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.01em' }}>
              {vital.value}
            </span>
            <span style={{ fontSize: '0.9375rem', color: 'var(--d-text-muted)', fontWeight: 500 }}>{vital.unit}</span>
          </div>
        </div>
        <span
          className="hw-vital-status"
          data-status={vital.status}
          aria-label={`Status: ${vital.statusLabel}`}
        >
          {vital.statusLabel}
        </span>
      </div>
      <Sparkline data={vital.trend} label={vital.name} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
        <span>{vital.lastReading}</span>
        <span>Range: {vital.range}</span>
      </div>
    </div>
  );
}
