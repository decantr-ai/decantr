import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TerminalSplitShell } from '@/components/TerminalSplitShell';
import { SettingsNav } from './ProfilePage';
import { useAuth } from '@/hooks/useAuth';

export function DangerPage() {
  const [confirm, setConfirm] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <TerminalSplitShell title="SETTINGS // danger zone">
      <div style={{ flex: 1, display: 'flex', gap: '0.5rem', overflow: 'auto' }}>
        <SettingsNav />
        <div style={{ flex: 1, maxWidth: 680 }}>
          <h1 className="term-glow" style={{ fontSize: '1rem', color: 'var(--d-error)', margin: '0 0 1rem' }}>
            $ danger_zone --force
          </h1>

          <section className="term-panel" style={{ padding: '0.875rem 1rem', marginBottom: '0.75rem', borderColor: 'var(--d-warning)' }}>
            <div className="d-label" style={{ color: 'var(--d-warning)', marginBottom: '0.5rem' }}>// EXPORT DATA</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', margin: '0 0 0.625rem', lineHeight: 1.6 }}>
              Download all pipelines, transforms, and run history as a tar.gz archive.
            </p>
            <button className="d-interactive" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem', borderRadius: 0 }}>
              Export Archive
            </button>
          </section>

          <section className="term-panel" style={{ padding: '0.875rem 1rem', borderColor: 'var(--d-error)' }}>
            <div className="d-label" style={{ color: 'var(--d-error)', marginBottom: '0.5rem' }}>// DELETE ACCOUNT</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', margin: '0 0 0.625rem', lineHeight: 1.6 }}>
              Permanently delete your account and all pipelines, transforms, sources, and run history.
              <br />
              <span style={{ color: 'var(--d-error)' }}>This action cannot be undone.</span>
            </p>
            <label className="d-label" style={{ display: 'block', marginBottom: '0.25rem' }}>TYPE "DELETE" TO CONFIRM</label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="DELETE"
              style={{
                width: '100%', padding: '0.4rem 0.625rem', background: 'var(--d-bg)',
                border: '1px solid var(--d-error)', color: 'var(--d-text)',
                fontFamily: 'inherit', fontSize: '0.8125rem', outline: 'none', borderRadius: 0,
              }}
            />
            <button
              disabled={confirm !== 'DELETE'}
              onClick={() => { logout(); navigate('/'); }}
              className="d-interactive"
              data-variant="danger"
              style={{ marginTop: '0.625rem', padding: '0.25rem 0.625rem', fontSize: '0.75rem', borderRadius: 0 }}
            >
              &gt; rm -rf account
            </button>
          </section>
        </div>
      </div>
    </TerminalSplitShell>
  );
}
