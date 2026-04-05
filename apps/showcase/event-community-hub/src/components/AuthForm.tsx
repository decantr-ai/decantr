import { FormEvent, ReactNode } from 'react';
import { css } from '@decantr/css';

type Field = { label: string; type: string; name: string; placeholder?: string; autoComplete?: string };

export function AuthForm({ title, subtitle, fields, cta, footer, onSubmit }: {
  title: string; subtitle?: string; fields: Field[]; cta: string;
  footer?: ReactNode; onSubmit: (e: FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className={css('_flex _col _gap4')}>
      <div className={css('_flex _col _gap1')}>
        <h1 className="display-heading" style={{ fontSize: '1.5rem' }}>{title}</h1>
        {subtitle && (
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>{subtitle}</p>
        )}
      </div>
      <div className={css('_flex _col _gap3')}>
        {fields.map((f) => (
          <label key={f.name} className={css('_flex _col _gap1')} style={{ fontFamily: 'system-ui, sans-serif' }}>
            <span className={css('_textsm _fontmedium')}>{f.label}</span>
            <input className="d-control" type={f.type} name={f.name}
              placeholder={f.placeholder} autoComplete={f.autoComplete} />
          </label>
        ))}
      </div>
      <button type="submit" className="d-interactive cta-glossy"
        style={{ justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        {cta}
      </button>
      {footer}
    </form>
  );
}
