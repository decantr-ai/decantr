import { ReactNode } from 'react';
import { css } from '@decantr/css';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className={css('_flex _aifs _jcsb _gap4')} style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
      <div className={css('_flex _col _gap1')}>
        <h1 className="serif-display" style={{ fontSize: '1.75rem' }}>{title}</h1>
        {subtitle && <p style={{ color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif', fontSize: '0.9375rem' }}>{subtitle}</p>}
      </div>
      {actions && <div className={css('_flex _aic _gap2')}>{actions}</div>}
    </div>
  );
}
