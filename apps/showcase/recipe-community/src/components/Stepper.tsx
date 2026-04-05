import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Timer } from 'lucide-react';
import { css } from '@decantr/css';

type Step = { title: string; body: string; duration?: number };

export function Stepper({ steps }: { steps: Step[] }) {
  const [active, setActive] = useState(0);
  const [done, setDone] = useState<Set<number>>(new Set());

  const go = (i: number) => setActive(Math.max(0, Math.min(steps.length - 1, i)));
  const markDone = () => {
    setDone(prev => new Set(prev).add(active));
    if (active < steps.length - 1) go(active + 1);
  };

  const step = steps[active];

  return (
    <div className={css('_flex _col _gap6')} style={{ width: '100%' }}>
      {/* Step dots rail */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
        {steps.map((_, i) => {
          const state = done.has(i) ? 'done' : i === active ? 'active' : 'idle';
          return (
            <button key={i} onClick={() => go(i)} className="step-dot" data-state={state}
              aria-label={`Step ${i + 1}`} type="button"
              style={{ cursor: 'pointer', border: 'none' }}>
              {state === 'done' ? <Check size={14} /> : i + 1}
            </button>
          );
        })}
      </div>

      {/* Step card */}
      <div className="cook-stage">
        <p className="d-label" style={{ marginBottom: '0.75rem' }}>Step {active + 1} of {steps.length}</p>
        <h2 className="serif-display" style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>{step.title}</h2>
        <p style={{ fontSize: '1.125rem', lineHeight: 1.6, color: 'var(--d-text)', fontFamily: 'system-ui, sans-serif' }}>
          {step.body}
        </p>
        {step.duration !== undefined && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginTop: '1.25rem',
            padding: '0.375rem 0.75rem', background: 'var(--d-surface-raised)',
            borderRadius: 'var(--d-radius-full)', fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
            <Timer size={14} /> ~{step.duration} min
          </div>
        )}
      </div>

      {/* Nav */}
      <div className={css('_flex _aic _jcsb')}>
        <button className="d-interactive" onClick={() => go(active - 1)} disabled={active === 0}
          style={{ fontFamily: 'system-ui, sans-serif' }}>
          <ChevronLeft size={16} /> Previous
        </button>
        <button className="d-interactive" data-variant="primary" onClick={markDone}
          style={{ fontFamily: 'system-ui, sans-serif' }}>
          {active === steps.length - 1 ? 'Finish' : 'Next Step'} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
