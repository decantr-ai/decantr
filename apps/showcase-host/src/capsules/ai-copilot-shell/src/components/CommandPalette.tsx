import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Bot, Settings, Home, LogIn, Sparkles } from 'lucide-react';

interface CommandPaletteProps {
  onClose: () => void;
}

const commands = [
  { icon: LayoutDashboard, label: 'Go to Workspace', shortcut: 'g w', route: '/workspace' },
  { icon: Bot, label: 'Go to Copilot Config', shortcut: 'g c', route: '/copilot/config' },
  { icon: Settings, label: 'Go to Settings', shortcut: '', route: '/settings' },
  { icon: Home, label: 'Go to Home', shortcut: '', route: '/' },
  { icon: LogIn, label: 'Go to Login', shortcut: '', route: '/login' },
];

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const run = (route: string) => {
    navigate(route);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 100,
        }}
      />
      {/* Dialog */}
      <div
        className="d-surface carbon-glass carbon-fade-slide"
        data-elevation="overlay"
        style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 480,
          borderRadius: 'var(--d-radius-lg)',
          zIndex: 101,
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '1px solid var(--d-border)' }}>
          <Search size={18} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '0.9375rem',
              color: 'var(--d-text)',
            }}
          />
          <kbd style={{
            fontSize: '0.625rem',
            padding: '0.125rem 0.375rem',
            borderRadius: 'var(--d-radius-sm)',
            background: 'var(--d-surface)',
            color: 'var(--d-text-muted)',
            border: '1px solid var(--d-border)',
          }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 320, overflowY: 'auto', padding: '0.5rem' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>
              No commands found
            </div>
          ) : (
            filtered.map((cmd, i) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={i}
                  onClick={() => run(cmd.route)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--d-radius-sm)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--d-text)',
                    fontSize: '0.875rem',
                    textAlign: 'left',
                    transition: 'background 100ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--d-surface)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon size={16} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{cmd.label}</span>
                  {cmd.shortcut && (
                    <kbd style={{
                      fontSize: '0.625rem',
                      padding: '0.0625rem 0.3125rem',
                      borderRadius: 'var(--d-radius-sm)',
                      background: 'var(--d-surface-raised)',
                      color: 'var(--d-text-muted)',
                    }}>
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
