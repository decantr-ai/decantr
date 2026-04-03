import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutPanelLeft, Grid3x3, ScanSearch, Eye, Settings, LogIn } from 'lucide-react';

interface CommandPaletteProps {
  onClose: () => void;
}

const commands = [
  { icon: LayoutPanelLeft, label: 'Go to Workspace', shortcut: 'g w', route: '/workspace' },
  { icon: Grid3x3, label: 'Go to Catalog', shortcut: 'g c', route: '/catalog' },
  { icon: ScanSearch, label: 'Go to Inspector', shortcut: 'g i', route: '/inspector' },
  { icon: Eye, label: 'Go to Preview', shortcut: 'g p', route: '/preview' },
  { icon: Settings, label: 'Go to Settings', shortcut: 'g s', route: '/settings' },
  { icon: LogIn, label: 'Go to Login', shortcut: '', route: '/login' },
];

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        run(filtered[selectedIndex].route);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

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
          backdropFilter: 'blur(4px)',
          zIndex: 100,
        }}
      />
      {/* Dialog */}
      <div
        className="d-surface d-glass-strong entrance-fade"
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
                    background: i === selectedIndex ? 'var(--d-surface)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--d-text)',
                    fontSize: '0.875rem',
                    textAlign: 'left',
                    transition: 'background 100ms ease',
                  }}
                  onMouseEnter={() => setSelectedIndex(i)}
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
