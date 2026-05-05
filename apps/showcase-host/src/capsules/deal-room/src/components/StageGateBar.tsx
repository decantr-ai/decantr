import { Check, Circle } from 'lucide-react';
import type { StageGate } from '@/data/mock';

export function StageGateBar({ gates }: { gates: StageGate[] }) {
  return (
    <div className="dr-stage-gate" style={{ flexWrap: 'wrap', gap: '0.25rem' }}>
      {gates.map((gate, i) => (
        <div key={gate.id} style={{ display: 'flex', alignItems: 'center' }}>
          <div className="dr-stage-gate-step" data-status={gate.status}>
            {gate.status === 'complete' ? (
              <Check size={12} />
            ) : (
              <Circle size={12} fill={gate.status === 'active' ? 'currentColor' : 'none'} />
            )}
            <span>{gate.name}</span>
            <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>
              {gate.approvals}/{gate.required}
            </span>
          </div>
          {i < gates.length - 1 && (
            <div
              className="dr-stage-gate-connector"
              data-complete={gate.status === 'complete' ? 'true' : undefined}
            />
          )}
        </div>
      ))}
    </div>
  );
}
