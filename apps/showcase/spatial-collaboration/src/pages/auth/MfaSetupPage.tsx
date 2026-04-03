import { css } from '@decantr/css';
import { useNavigate } from 'react-router-dom';
import { Layers, Shield, Smartphone } from 'lucide-react';

export function MfaSetupPage() {
  const navigate = useNavigate();

  return (
    <div className="d-surface carbon-card carbon-fade-slide" style={{ padding: '2rem' }}>
      <div className={css('_flex _col _aic _gap1')} style={{ marginBottom: '1.5rem' }}>
        <Layers size={24} style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }} />
        <h1 className={css('_fontsemi _textxl')}>Enable 2FA</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Add an extra layer of security to your workspace</p>
      </div>

      <div className={css('_flex _col _gap3')}>
        <button
          className="d-surface carbon-card"
          style={{
            width: '100%', padding: '1rem', cursor: 'pointer', border: '1px solid var(--d-border)',
            display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left',
            background: 'var(--d-surface)', borderRadius: 'var(--d-radius)',
          }}
          onClick={() => navigate('/mfa-verify')}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--d-radius)',
            background: 'color-mix(in srgb, var(--d-accent) 10%, transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Smartphone size={20} style={{ color: 'var(--d-accent)' }} />
          </div>
          <div>
            <p className={css('_textsm _fontmedium')}>Authenticator App</p>
            <p className={css('_textxs')} style={{ color: 'var(--d-text-muted)' }}>Use an app like Google Authenticator or Authy</p>
          </div>
        </button>

        <button
          className="d-surface carbon-card"
          style={{
            width: '100%', padding: '1rem', cursor: 'pointer', border: '1px solid var(--d-border)',
            display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left',
            background: 'var(--d-surface)', borderRadius: 'var(--d-radius)',
          }}
          onClick={() => navigate('/phone-verify')}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--d-radius)',
            background: 'color-mix(in srgb, var(--d-primary) 10%, transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Shield size={20} style={{ color: 'var(--d-primary)' }} />
          </div>
          <div>
            <p className={css('_textsm _fontmedium')}>SMS Verification</p>
            <p className={css('_textxs')} style={{ color: 'var(--d-text-muted)' }}>Receive codes via text message</p>
          </div>
        </button>
      </div>

      <button
        className="d-interactive"
        data-variant="ghost"
        onClick={() => navigate('/')}
        style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}
      >
        Skip for now
      </button>
    </div>
  );
}
