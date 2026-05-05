import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: description ? '0.25rem' : 0 }}>{title}</h1>
        {description && (
          <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>{description}</p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}
