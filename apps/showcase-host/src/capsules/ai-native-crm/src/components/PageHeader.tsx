import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.2 }}>{title}</h1>
        {description && (
          <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginTop: '0.375rem' }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>{actions}</div>}
    </div>
  );
}
