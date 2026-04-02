import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export function ForgotPassword() {
  return (
    <div className={css('_flex _col _gap5 _wfull') + ' carbon-card ' + css('_p6') + ' fade-in'}>
      <div className={css('_flex _col _gap1 _textc')}>
        <h1 className={'font-mono ' + css('_textxl _fontbold')}>Reset password</h1>
        <p className={'font-mono ' + css('_textsm _fgmuted')}>
          Enter your email and we will send a reset link
        </p>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <div className={css('_flex _col _gap1')}>
          <label className={'font-mono ' + css('_textsm _fgmuted')}>Email address</label>
          <div className={css('_rel')}>
            <Mail size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--d-text-muted)' }} />
            <input type="email" className="carbon-input font-mono" placeholder="operator@agentctrl.io" style={{ paddingLeft: 36 }} autoComplete="email" />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
          Send Reset Link <ArrowRight size={16} />
        </button>
      </form>

      <Link to="/login" className={'font-mono ' + css('_flex _aic _jcc _gap2 _textsm _fgmuted')}>
        <ArrowLeft size={14} /> Back to sign in
      </Link>
    </div>
  );
}
