import { css } from '@decantr/css';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  action?: { label: string; onClick: () => void };
}

/**
 * Empty state per DECANTR.md guidance:
 * Centered 48px muted icon + descriptive message + optional CTA button.
 */
export function EmptyState({ icon: Icon, message, action }: EmptyStateProps) {
  return (
    <div className={css('_flex _col _aic _jcc _gap4 _py12 _textc')}>
      <Icon size={48} style={{ color: 'var(--d-text-muted)', opacity: 0.5 }} />
      <p className={css('_fgmuted _textsm')}>{message}</p>
      {action && (
        <button
          className={css('_textsm') + ' d-interactive neon-glow-hover'}
          data-variant="primary"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
