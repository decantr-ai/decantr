import { Link } from 'react-router-dom';
import { css } from '@decantr/css';

interface AuthField {
  id: string;
  label: string;
  type: string;
  placeholder: string;
}

interface AuthFormProps {
  title: string;
  description: string;
  fields: AuthField[];
  submitLabel: string;
  footerText?: string;
  footerLink?: { to: string; label: string };
  secondaryLink?: { to: string; label: string };
}

export function AuthForm({
  title,
  description,
  fields,
  submitLabel,
  footerText,
  footerLink,
  secondaryLink,
}: AuthFormProps) {
  return (
    <div className={css('_wfull')}>
      <form
        className={css('_flex _col _gap6 _p8') + ' carbon-card carbon-fade-slide'}
        onSubmit={(e) => e.preventDefault()}
      >
        <div className={css('_flex _col _gap2 _textc')}>
          <h1 className={css('_heading3 _fgtext')}>{title}</h1>
          <p className={css('_textsm _fgmuted')}>{description}</p>
        </div>

        {fields.map((f) => (
          <div key={f.id} className={css('_flex _col _gap2')}>
            <label className={css('_textsm _fontmedium _fgtext')} htmlFor={f.id}>
              {f.label}
            </label>
            <input
              id={f.id}
              type={f.type}
              placeholder={f.placeholder}
              className={css('_px4 _py3 _rounded _textsm _fgtext') + ' carbon-input'}
              style={{ background: 'var(--d-bg)', outline: 'none' }}
            />
          </div>
        ))}

        <button
          type="submit"
          className={css('_bgprimary _fgtext _fontsemi _py3 _rounded _textbase _pointer')}
          style={{ border: 'none' }}
        >
          {submitLabel}
        </button>

        {secondaryLink && (
          <Link
            to={secondaryLink.to}
            className={css('_textsm _fgmuted _textc')}
            style={{ textDecoration: 'none' }}
          >
            {secondaryLink.label}
          </Link>
        )}
      </form>

      {footerText && footerLink && (
        <p className={css('_textsm _fgmuted _textc _pt4')}>
          {footerText}{' '}
          <Link to={footerLink.to} className={css('_fgprimary')} style={{ textDecoration: 'none' }}>
            {footerLink.label}
          </Link>
        </p>
      )}
    </div>
  );
}
