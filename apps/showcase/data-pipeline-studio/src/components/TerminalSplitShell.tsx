import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const HOTKEYS = [
  { key: 'F1', label: 'Pipelines', route: '/pipelines' },
  { key: 'F2', label: 'Sources', route: '/sources' },
  { key: 'F3', label: 'Transforms', route: '/transforms' },
  { key: 'F4', label: 'Jobs', route: '/jobs' },
  { key: 'F5', label: 'Settings', route: '/settings/profile' },
  { key: 'F10', label: 'Logout', action: 'logout' as const },
];

export function TerminalSplitShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      for (const hk of HOTKEYS) {
        if (e.key === hk.key) {
          e.preventDefault();
          if ('action' in hk && hk.action === 'logout') {
            logout();
            navigate('/login');
          } else if ('route' in hk && hk.route) {
            navigate(hk.route);
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, logout]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: '24px 1fr 28px',
        height: 'calc(100vh - 48px)',
        background: '#000',
        color: 'var(--d-text)',
      }}
    >
      <div className="term-status">
        <span>DPS v1.0 — DATA PIPELINE STUDIO {title ? `— ${title}` : ''}</span>
        <span style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/pipelines" style={{ color: 'var(--d-bg)', opacity: location.pathname.startsWith('/pipelines') ? 1 : 0.7 }}>PIPE</Link>
          <Link to="/sources" style={{ color: 'var(--d-bg)', opacity: location.pathname.startsWith('/sources') || location.pathname.startsWith('/connections') ? 1 : 0.7 }}>SRC</Link>
          <Link to="/transforms" style={{ color: 'var(--d-bg)', opacity: location.pathname.startsWith('/transforms') ? 1 : 0.7 }}>XFORM</Link>
          <Link to="/jobs" style={{ color: 'var(--d-bg)', opacity: location.pathname.startsWith('/jobs') ? 1 : 0.7 }}>JOBS</Link>
          <span style={{ color: 'var(--d-bg)' }}>● ONLINE</span>
        </span>
      </div>

      <div style={{ overflow: 'hidden', padding: '0.5rem', display: 'flex', minHeight: 0 }}>
        {children}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--d-surface)',
          borderTop: '1px solid var(--d-border)',
          overflow: 'hidden',
        }}
      >
        {HOTKEYS.map((hk) => (
          <button
            key={hk.key}
            className="term-hotkey"
            onClick={() => {
              if ('action' in hk && hk.action === 'logout') {
                logout();
                navigate('/login');
              } else if ('route' in hk && hk.route) {
                navigate(hk.route);
              }
            }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0 0.5rem',
            }}
            data-active={
              'route' in hk && hk.route && location.pathname.startsWith(hk.route.split('/')[1] ? '/' + hk.route.split('/')[1] : hk.route) ? '' : undefined
            }
          >
            <kbd>{hk.key}</kbd>
            <span>{hk.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
