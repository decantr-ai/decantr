import type { ReactNode } from 'react';

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '1rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
    }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--d-text)', marginBottom: description ? '0.25rem' : 0 }}>
          {title}
        </h1>
        {description && (
          <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>{description}</p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: '0.5rem' }}>{actions}</div>}
    </div>
  );
}
