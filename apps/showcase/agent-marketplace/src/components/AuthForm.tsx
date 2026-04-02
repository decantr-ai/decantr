import { css } from '@decantr/css';
import { Link } from 'react-router-dom';

interface AuthFormProps {
  title: string;
  description: string;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    placeholder: string;
  }>;
  submitLabel: string;
  footerLink?: { text: string; label: string; to: string };
  secondaryLink?: { label: string; to: string };
}

/**
 * Shared auth form for the centered shell.
 * Max-width 28rem, uses d-control for inputs, d-interactive for buttons.
 */
export function AuthForm({
  title,
  description,
  fields,
  submitLabel,
  footerLink,
  secondaryLink,
}: AuthFormProps) {
  return (
    <div className={css('_w100 _flex _col _gap5 _p6') + ' d-surface carbon-card'}>
      <div className={css('_flex _col _gap1 _textc')}>
        <h1 className={css('_textxl _fontsemi')}>{title}</h1>
        <p className={css('_textsm _fgmuted')}>{description}</p>
      </div>

      <form
        className={css('_flex _col _gap4')}
        onSubmit={(e) => e.preventDefault()}
      >
        {fields.map((field) => (
          <div key={field.name} className={css('_flex _col _gap1')}>
            <label className={css('_textsm _fontsemi')} htmlFor={field.name}>
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              className="d-control carbon-input"
              autoComplete={field.type === 'password' ? 'current-password' : field.type === 'email' ? 'email' : undefined}
            />
          </div>
        ))}

        <button
          type="submit"
          className={css('_w100 _jcc') + ' d-interactive neon-glow-hover'}
          data-variant="primary"
        >
          {submitLabel}
        </button>
      </form>

      {(footerLink || secondaryLink) && (
        <div className={css('_flex _col _aic _gap2')}>
          {secondaryLink && (
            <Link to={secondaryLink.to} className={css('_textsm _fgaccent')}>
              {secondaryLink.label}
            </Link>
          )}
          {footerLink && (
            <p className={css('_textsm _fgmuted')}>
              {footerLink.text}{' '}
              <Link to={footerLink.to} className={css('_fgaccent')}>
                {footerLink.label}
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
