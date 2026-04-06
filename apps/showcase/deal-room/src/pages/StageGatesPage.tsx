import { Check, Circle, Clock } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { stageGates } from '@/data/mock';

export function StageGatesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Stage Gates"
        description="Track approval milestones across the deal lifecycle."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {stageGates.map((gate, i) => (
          <div key={gate.id} style={{ display: 'flex', gap: '1rem' }}>
            {/* Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: gate.status === 'complete' ? 'var(--d-success)' : gate.status === 'active' ? 'var(--d-primary)' : 'var(--d-surface-raised)',
                color: gate.status === 'pending' ? 'var(--d-text-muted)' : '#0A0E1A',
                flexShrink: 0,
              }}>
                {gate.status === 'complete' ? <Check size={14} /> : gate.status === 'active' ? <Circle size={14} fill="currentColor" /> : <Clock size={14} />}
              </div>
              {i < stageGates.length - 1 && (
                <div style={{
                  width: 2,
                  flex: 1,
                  background: gate.status === 'complete' ? 'var(--d-success)' : 'var(--d-border)',
                  minHeight: 20,
                }} />
              )}
            </div>

            {/* Card */}
            <div className="dr-card" style={{ padding: '1.25rem', flex: 1, opacity: gate.status === 'pending' ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 className="serif-display" style={{ fontSize: '1rem', fontWeight: 600 }}>{gate.name}</h3>
                <span className="d-annotation" data-status={gate.status === 'complete' ? 'success' : gate.status === 'active' ? 'warning' : undefined}>
                  {gate.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
                  {gate.approvals} of {gate.required} approvals
                </span>
                <span className="mono-data" style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>
                  Due: {gate.deadline}
                </span>
              </div>
              <div className="dr-gauge-track">
                <div className="dr-gauge-fill" style={{
                  width: `${(gate.approvals / gate.required) * 100}%`,
                  background: gate.status === 'complete' ? 'var(--d-success)' : undefined,
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
