import { css } from '@decantr/css';

interface SectionLabelProps {
  children: React.ReactNode;
  centered?: boolean;
}

/**
 * Section label per DECANTR.md:
 * d-label class + left accent border for dashboard,
 * or center-aligned for marketing sections.
 */
export function SectionLabel({ children, centered }: SectionLabelProps) {
  if (centered) {
    return (
      <div
        className={css('_textc _mb4') + ' d-label'}
        style={{ letterSpacing: '0.1em', color: 'var(--d-accent)' }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={css('_mb3') + ' d-label'}
      style={{
        borderLeft: '2px solid var(--d-accent)',
        paddingLeft: '0.5rem',
      }}
    >
      {children}
    </div>
  );
}
