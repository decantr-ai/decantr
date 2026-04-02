import { css } from '@decantr/css';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <label className={css('_inlineflex _aic _gap2 _pointer _selectnone') + (disabled ? ' ' + css('_op50 _notallowed') : '')}>
      <button
        role="switch"
        type="button"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={css('_rel _inlineflex _shrink0 _rounded _trans') + ' toggle-track' + (checked ? ' toggle-active' : '')}
        style={{ width: '36px', height: '20px' }}
      >
        <span
          className={css('_abs _roundedfull _trans')}
          style={{
            width: '16px',
            height: '16px',
            top: '2px',
            left: checked ? '18px' : '2px',
            background: checked ? 'var(--d-text)' : 'var(--d-text-muted)',
            transition: 'left 0.15s ease, background 0.15s ease',
          }}
        />
      </button>
      {label && <span className={css('_textsm _fgtext')}>{label}</span>}
    </label>
  );
}
