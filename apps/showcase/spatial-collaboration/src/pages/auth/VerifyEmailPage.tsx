import { css } from '@decantr/css';
import { useNavigate } from 'react-router-dom';
import { Layers, Mail } from 'lucide-react';

export function VerifyEmailPage() {
  const navigate = useNavigate();

  return (
    <div className="d-surface carbon-card carbon-fade-slide" style={{ padding: '2rem' }}>
      <div className={css('_flex _col _aic _gap1')} style={{ marginBottom: '1.5rem' }}>
        <Layers size={24} style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }} />
        <h1 className={css('_fontsemi _textxl')}>Verify your email</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>We sent a verification link to your inbox</p>
      </div>

      <div className={css('_flex _col _aic _gap4')} style={{ padding: '1.5rem 0' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'color-mix(in srgb, var(--d-accent) 10%, transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Mail size={28} style={{ color: 'var(--d-accent)' }} />
        </div>
        <p className={css('_textsm _textc')} style={{ color: 'var(--d-text-muted)', maxWidth: 280 }}>
          Check your email and click the verification link to activate your workspace.
        </p>
        <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.875rem' }}>
          Resend verification email
        </button>
      </div>

      <button
        className="d-interactive"
        data-variant="primary"
        onClick={() => navigate('/')}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        Continue to Workspace
      </button>
    </div>
  );
}
