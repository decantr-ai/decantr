import { css } from '@decantr/css';

type RingStatus = 'active' | 'idle' | 'error' | 'warning';

const STATUS_MAP: Record<RingStatus, { ringClass: string; label: string }> = {
  active:  { ringClass: 'neon-ring neon-ring-active',                   label: 'Active' },
  idle:    { ringClass: 'neon-ring neon-ring-info',                     label: 'Idle' },
  error:   { ringClass: 'neon-ring neon-ring-error neon-ring-active',   label: 'Error' },
  warning: { ringClass: 'neon-ring neon-ring-warning',                  label: 'Warning' },
};

interface StatusRingProps {
  status: RingStatus;
  size?: number;
  children?: React.ReactNode;
}

export function StatusRing({ status, size = 40, children }: StatusRingProps) {
  const { ringClass, label } = STATUS_MAP[status];
  return (
    <div
      className={css('_flex _aic _jcc') + ' ' + ringClass}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
      }}
      role="status"
      aria-label={label}
    >
      {children}
    </div>
  );
}
