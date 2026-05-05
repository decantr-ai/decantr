import { css } from '@decantr/css';

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className={css('_flex _aic _gap3')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      {steps.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'idle';
        return (
          <div key={label} className={css('_flex _aic _gap2')} style={{ flex: 1 }}>
            <span className="step-dot" data-state={state === 'idle' ? undefined : state}>
              {state === 'done' ? '✓' : i + 1}
            </span>
            <span className={css('_textsm _fontmedium')}
              style={{ color: state === 'active' ? 'var(--d-text)' : 'var(--d-text-muted)', fontWeight: state === 'active' ? 700 : 500 }}>
              {label}
            </span>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < current ? 'var(--d-secondary)' : 'var(--d-border)', borderRadius: 1, marginLeft: '0.5rem' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
