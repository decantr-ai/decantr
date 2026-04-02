import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Shield, Smartphone, ArrowRight } from 'lucide-react';

export function MfaSetup() {
  return (
    <div className={css('_flex _col _gap5 _wfull') + ' carbon-card ' + css('_p6') + ' fade-in'}>
      <div className={css('_flex _col _aic _gap3 _textc')}>
        <div
          className={css('_flex _aic _jcc _roundedfull') + ' neon-glow'}
          style={{ width: 64, height: 64, background: 'color-mix(in srgb, var(--d-primary) 15%, transparent)' }}
        >
          <Shield size={28} style={{ color: 'var(--d-primary)' }} />
        </div>
        <h1 className={'font-mono ' + css('_textxl _fontbold')}>Enable 2FA</h1>
        <p className={'font-mono ' + css('_textsm _fgmuted')}>
          Secure your mission control with two-factor authentication
        </p>
      </div>

      {/* QR Code placeholder */}
      <div className={css('_flex _aic _jcc _p6')}>
        <div
          className={css('_flex _aic _jcc _rounded')}
          style={{ width: 180, height: 180, background: '#fff', padding: 8 }}
        >
          <div style={{ width: '100%', height: '100%', background: `repeating-conic-gradient(var(--d-bg) 0% 25%, #fff 0% 50%) 50%/16px 16px`, borderRadius: 4 }} />
        </div>
      </div>

      <div className={css('_flex _col _gap2 _p4 _rounded')} style={{ background: 'var(--d-surface-raised)' }}>
        <span className={'font-mono ' + css('_textxs _fgmuted _uppercase')}>Manual entry key</span>
        <code className={'font-mono ' + css('_textsm') + ' carbon-code'}>
          JBSW Y3DP EHPK 3PXP
        </code>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <div className={css('_flex _col _gap1')}>
          <label className={'font-mono ' + css('_textsm _fgmuted')}>
            <Smartphone size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Verification code
          </label>
          <input
            type="text"
            className="carbon-input font-mono"
            placeholder="000 000"
            maxLength={7}
            inputMode="numeric"
            style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.25rem' }}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
          Verify & Enable <ArrowRight size={16} />
        </button>
      </form>

      <Link to="/login" className={'font-mono ' + css('_textxs _fgmuted _textc')}>
        Skip for now
      </Link>
    </div>
  );
}
