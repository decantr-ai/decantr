import { css } from '@decantr/css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className={css('_flex _jcsb _aic _wrap _gap4')} style={{ marginBottom: 'var(--d-gap-6)' }}>
      <div>
        <h1 className="neon-entrance" style={{ fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && (
          <p className="mono-data" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginTop: 'var(--d-gap-1)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className={css('_flex _aic _gap2')}>{actions}</div>}
    </div>
  );
}
