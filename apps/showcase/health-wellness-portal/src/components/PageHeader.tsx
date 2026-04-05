import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: description ? '0.375rem' : 0, letterSpacing: '-0.01em' }}>
          {title}
        </h1>
        {description && (
          <p style={{ fontSize: '1rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{description}</p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: '0.625rem', flexShrink: 0, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}
