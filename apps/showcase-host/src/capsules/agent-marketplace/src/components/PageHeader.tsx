import { css } from '@decantr/css';
import type { ReactNode } from 'react';

export function PageHeader({
  label,
  title,
  description,
  actions,
}: {
  label?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header carbon-fade-slide">
      {label ? (
        <span className="d-label" data-anchor>
          {label}
        </span>
      ) : null}
      <div className="page-header__row">
        <div className={css('_flex _col _gap2')}>
          <h1 className="page-header__title">{title}</h1>
          {description ? <p className="page-header__description">{description}</p> : null}
        </div>
        {actions ? <div className="page-header__actions">{actions}</div> : null}
      </div>
    </header>
  );
}

export function SectionHeader({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <span className="d-label" data-anchor>
        {label}
      </span>
      <h2 className={css('_fontsemi _textlg')}>{title}</h2>
      {description ? <p className="section-heading__description">{description}</p> : null}
    </div>
  );
}
