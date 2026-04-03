import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { Search, Bot, Store, Settings, Eye, Activity, BarChart3, ArrowRight } from 'lucide-react';

const COMMANDS = [
  { icon: Bot, label: 'Agent Overview', path: '/agents', group: 'Navigation' },
  { icon: Store, label: 'Marketplace', path: '/marketplace', group: 'Navigation' },
  { icon: Settings, label: 'Configuration', path: '/agents/config', group: 'Navigation' },
  { icon: Eye, label: 'Model Overview', path: '/transparency', group: 'Navigation' },
  { icon: Activity, label: 'Inference Log', path: '/transparency/inference', group: 'Navigation' },
  { icon: BarChart3, label: 'Confidence Explorer', path: '/transparency/confidence', group: 'Navigation' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    function handleCustom() { setOpen(true); }
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('open-command-palette', handleCustom);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('open-command-palette', handleCustom);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  const filtered = COMMANDS.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  function go(path: string) {
    setOpen(false);
    navigate(path);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-label="Command palette"
        className="carbon-glass carbon-fade-slide"
        style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(480px, 90vw)',
          zIndex: 101,
          overflow: 'hidden',
          borderRadius: 'var(--d-radius-lg)',
        }}
      >
        {/* Search input */}
        <div
          className={css('_flex _aic _gap3')}
          style={{ padding: '12px 16px', borderBottom: '1px solid var(--d-border)' }}
        >
          <Search size={16} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search commands..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--d-text)',
              fontSize: 14,
              fontFamily: 'var(--d-font-mono)',
            }}
          />
          <kbd
            style={{
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid var(--d-border)',
              color: 'var(--d-text-muted)',
              fontFamily: 'var(--d-font-mono)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 300, overflowY: 'auto', padding: 4 }}>
          {filtered.length === 0 ? (
            <div
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                color: 'var(--d-text-muted)',
                fontSize: 13,
              }}
            >
              No results found
            </div>
          ) : (
            filtered.map(cmd => (
              <button
                key={cmd.path}
                onClick={() => go(cmd.path)}
                className={css('_flex _aic _jcsb _wfull')}
                style={{
                  padding: '10px 12px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--d-radius-sm)',
                  color: 'var(--d-text)',
                  cursor: 'pointer',
                  fontSize: 13,
                  transition: 'background 100ms ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--d-surface-raised)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span className={css('_flex _aic _gap3')}>
                  <cmd.icon size={15} style={{ color: 'var(--d-text-muted)' }} />
                  <span>{cmd.label}</span>
                </span>
                <ArrowRight size={12} style={{ color: 'var(--d-text-muted)' }} />
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
