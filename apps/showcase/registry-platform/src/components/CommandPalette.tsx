import { css } from '@decantr/css';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Layout, BarChart3, Settings } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const QUICK_LINKS = [
  { label: 'Browse', shortcut: 'g+b', path: '/browse', icon: Search },
  { label: 'Dashboard', shortcut: 'g+d', path: '/dashboard', icon: BarChart3 },
  { label: 'Settings', shortcut: 'g+s', path: '/settings', icon: Settings },
] as const;

export function CommandPalette({ onClose }: Props) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '20vh',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="d-surface"
        data-elevation="overlay"
        style={{
          width: '100%',
          maxWidth: 520,
          margin: '0 1rem',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {/* Search input */}
        <div className={css('_flex _aic _gap2')} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--d-border)' }}>
          <Search size={16} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--d-text)',
              fontSize: '0.9375rem',
              width: '100%',
            }}
          />
          <kbd
            style={{
              fontSize: '0.6875rem',
              padding: '0.125rem 0.375rem',
              borderRadius: 'var(--d-radius-sm)',
              background: 'var(--d-surface)',
              border: '1px solid var(--d-border)',
              color: 'var(--d-text-muted)',
              fontFamily: 'var(--d-font-mono, monospace)',
              flexShrink: 0,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Quick links */}
        <div style={{ padding: '0.5rem' }}>
          <div className="d-label" style={{ padding: '0.375rem 0.5rem' }}>Quick links</div>
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={css('_flex _aic _jcsb')}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: 'none',
                  borderRadius: 'var(--d-radius-sm)',
                  background: 'transparent',
                  color: 'var(--d-text)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--d-surface)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <span className={css('_flex _aic _gap2')}>
                  <Icon size={16} style={{ color: 'var(--d-text-muted)' }} />
                  {link.label}
                </span>
                <kbd
                  style={{
                    fontSize: '0.6875rem',
                    padding: '0.125rem 0.375rem',
                    borderRadius: 'var(--d-radius-sm)',
                    background: 'var(--d-surface-raised)',
                    border: '1px solid var(--d-border)',
                    color: 'var(--d-text-muted)',
                    fontFamily: 'var(--d-font-mono, monospace)',
                  }}
                >
                  {link.shortcut}
                </kbd>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
