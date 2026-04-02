import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

export function Register() {
  return (
    <div className={css('_flex _col _gap5 _wfull') + ' carbon-card ' + css('_p6') + ' fade-in'}>
      <div className={css('_flex _col _gap1 _textc')}>
        <h1 className={'font-mono ' + css('_textxl _fontbold')}>Create account</h1>
        <p className={'font-mono ' + css('_textsm _fgmuted')}>
          Deploy your first agent swarm in minutes
        </p>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <div className={css('_flex _col _gap1')}>
          <label className={'font-mono ' + css('_textsm _fgmuted')}>Full name</label>
          <div className={css('_rel')}>
            <User size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--d-text-muted)' }} />
            <input type="text" className="carbon-input font-mono" placeholder="Operator name" style={{ paddingLeft: 36 }} autoComplete="name" />
          </div>
        </div>

        <div className={css('_flex _col _gap1')}>
          <label className={'font-mono ' + css('_textsm _fgmuted')}>Email</label>
          <div className={css('_rel')}>
            <Mail size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--d-text-muted)' }} />
            <input type="email" className="carbon-input font-mono" placeholder="operator@agentctrl.io" style={{ paddingLeft: 36 }} autoComplete="email" />
          </div>
        </div>

        <div className={css('_flex _col _gap1')}>
          <label className={'font-mono ' + css('_textsm _fgmuted')}>Password</label>
          <div className={css('_rel')}>
            <Lock size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--d-text-muted)' }} />
            <input type="password" className="carbon-input font-mono" placeholder="Min 12 characters" style={{ paddingLeft: 36 }} autoComplete="new-password" />
          </div>
          <div className={css('_flex _gap2 _mt1')}>
            {['length', 'uppercase', 'number', 'special'].map((rule) => (
              <span key={rule} className={'font-mono ' + css('_textxs _fgmuted _flex _aic _gap1')}>
                <span className="status-ring status-offline" style={{ width: 6, height: 6 }} />
                {rule}
              </span>
            ))}
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
          Create Account <ArrowRight size={16} />
        </button>
      </form>

      <p className={'font-mono ' + css('_textxs _fgmuted _textc')}>
        By creating an account, you agree to our{' '}
        <a href="#" className={css('_fgprimary')}>Terms</a>{' '}
        and <a href="#" className={css('_fgprimary')}>Privacy Policy</a>.
      </p>

      <div className="separator" />

      <p className={'font-mono ' + css('_textxs _fgmuted _textc')}>
        Already have an account?{' '}
        <Link to="/login" className={css('_fgprimary')}>Sign in</Link>
      </p>
    </div>
  );
}
