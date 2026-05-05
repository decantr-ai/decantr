import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const HOTKEYS = [
  { key: 'F1', label: 'Home', route: '/app' },
  { key: 'F2', label: 'Config', route: '/app/config' },
  { key: 'F3', label: 'Logs', route: '/app/logs' },
  { key: 'F4', label: 'Metrics', route: '/app/metrics' },
  { key: 'F10', label: 'Quit', action: 'logout' as const },
];

export function TerminalShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      for (const hk of HOTKEYS) {
        if (e.key === hk.key) {
          e.preventDefault();
          if ('action' in hk && hk.action === 'logout') {
            localStorage.removeItem('decantr_authenticated');
            navigate('/login');
          } else if ('route' in hk && hk.route) {
            navigate(hk.route);
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const currentLabel = HOTKEYS.find(
    (h) => 'route' in h && h.route === location.pathname,
  )?.label;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: '24px 1fr 28px',
        height: 'calc(100vh - 48px)',
        fontFamily: 'inherit',
        background: '#000',
        color: 'var(--d-text)',
      }}
    >
      {/* Status Bar */}
      <div className="term-status">
        <span>TERMINAL DASHBOARD v1.0 {title ? `— ${title}` : ''}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {currentLabel && (
            <span style={{ opacity: 0.7 }}>[{currentLabel}]</span>
          )}
          <span style={{ color: 'var(--d-bg)' }}>● CONNECTED</span>
        </span>
      </div>

      {/* Body */}
      <div
        style={{
          overflow: 'hidden',
          padding: '0.5rem',
          display: 'flex',
          minHeight: 0,
        }}
      >
        {children}
      </div>

      {/* Hotkey Bar */}
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
                localStorage.removeItem('decantr_authenticated');
                navigate('/login');
              } else if ('route' in hk && hk.route) {
                navigate(hk.route);
              }
            }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0 0.25rem',
            }}
            data-active={
              'route' in hk && hk.route === location.pathname ? '' : undefined
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
