import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';

export function ResetPassword() {
  return (
    <div className={css('_flex _col _gap5 _wfull') + ' carbon-card ' + css('_p6') + ' fade-in'}>
      <div className={css('_flex _col _gap1 _textc')}>
        <h1 className={'font-mono ' + css('_textxl _fontbold')}>Set new password</h1>
        <p className={'font-mono ' + css('_textsm _fgmuted')}>
          Choose a strong password for your account
        </p>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <div className={css('_flex _col _gap1')}>
          <label className={'font-mono ' + css('_textsm _fgmuted')}>New password</label>
          <div className={css('_rel')}>
            <Lock size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--d-text-muted)' }} />
            <input type="password" className="carbon-input font-mono" placeholder="Min 12 characters" style={{ paddingLeft: 36 }} autoComplete="new-password" />
          </div>
        </div>

        <div className={css('_flex _col _gap1')}>
          <label className={'font-mono ' + css('_textsm _fgmuted')}>Confirm password</label>
          <div className={css('_rel')}>
            <Lock size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--d-text-muted)' }} />
            <input type="password" className="carbon-input font-mono" placeholder="Confirm password" style={{ paddingLeft: 36 }} autoComplete="new-password" />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
          Update Password <ArrowRight size={16} />
        </button>
      </form>

      <Link to="/login" className={'font-mono ' + css('_textxs _fgmuted _textc')}>
        Back to sign in
      </Link>
    </div>
  );
}
