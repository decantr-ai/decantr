import { css } from '@decantr/css';
import type { LucideIcon } from 'lucide-react';
import { Zap } from 'lucide-react';
import type { ReactNode } from 'react';

export function AuthPanel({
  title,
  description,
  children,
  footer,
  eyebrow = 'Gateway',
  icon: Icon = Zap,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  eyebrow?: string;
  icon?: LucideIcon;
}) {
  return (
    <section className="auth-panel carbon-fade-slide">
      <header className="auth-panel__header">
        <span className="mono-kicker">{eyebrow}</span>
        <div className="auth-panel__brand">
          <span className="auth-panel__brand-mark">
            <Icon size={18} />
          </span>
          <div className={css('_flex _col _gap1')}>
            <strong>AgentOps</strong>
            <span className={css('_textxs _fgmuted')}>
              Decantr showcase runtime
            </span>
          </div>
        </div>
        <div className={css('_flex _col _gap2')}>
          <h1 className="auth-panel__title">{title}</h1>
          <p className="auth-helper">{description}</p>
        </div>
      </header>
      {children}
      {footer ? <footer className="auth-panel__footer">{footer}</footer> : null}
    </section>
  );
}

export function AuthDivider({ label = 'or continue with' }: { label?: string }) {
  return <div className="auth-divider">{label}</div>;
}

export function AuthCodePreview({ value = '6 8 4 1 2 9' }: { value?: string }) {
  return (
    <div className="auth-code-grid" aria-hidden="true">
      {value.split(' ').map((part, index) => (
        <span key={`${part}-${index}`} className="auth-code-slot">
          {part}
        </span>
      ))}
    </div>
  );
}
