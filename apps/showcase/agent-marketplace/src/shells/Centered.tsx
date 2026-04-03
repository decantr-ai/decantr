import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Bot } from 'lucide-react';

export function CenteredShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={css('_flex _aic _jcc')}
      style={{
        minHeight: 'calc(100vh - 48px)',
        background: 'var(--d-bg)',
        padding: '1.5rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        {/* Brand */}
        <div className={css('_flex _aic _jcc _gap2')} style={{ marginBottom: '2rem' }}>
          <Link
            to="/"
            className={css('_flex _aic _gap2')}
            style={{ textDecoration: 'none', color: 'var(--d-text)' }}
          >
            <Bot size={24} style={{ color: 'var(--d-accent)' }} />
            <span style={{ fontSize: 18, fontWeight: 600 }}>AgentOps</span>
          </Link>
        </div>

        {/* Card */}
        <div
          className="d-surface carbon-card"
          style={{
            padding: 'var(--d-surface-p)',
            borderRadius: 'var(--d-radius-lg)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
