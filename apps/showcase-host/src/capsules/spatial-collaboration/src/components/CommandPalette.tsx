import { css } from '@decantr/css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Search, Layers, Settings, Users, Info, LogIn, UserPlus, ArrowRight } from 'lucide-react';

const COMMANDS = [
  { label: 'Go to Workspace', route: '/', icon: Layers, shortcut: 'G W' },
  { label: 'Go to Settings', route: '/settings', icon: Settings, shortcut: 'G S' },
  { label: 'About', route: '/about', icon: Info },
  { label: 'Log In', route: '/login', icon: LogIn },
  { label: 'Register', route: '/register', icon: UserPlus },
];

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState(0);

  const filtered = COMMANDS.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === 'Enter' && filtered[selected]) {
        navigate(filtered[selected].route);
        onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [filtered, selected, navigate, onClose]);

  return (
    <div
      className={css('_fixed _inset0 _flex _aic _jcc')}
      style={{ zIndex: 100, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="d-surface carbon-glass"
        style={{ width: '100%', maxWidth: 480, padding: 0, overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        <div className={css('_flex _aic _gap3')} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--d-border)' }}>
          <Search size={16} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Type a command..."
            className="d-control"
            style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: 0 }}
          />
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto', padding: '0.25rem' }}>
          {filtered.map((cmd, i) => (
            <button
              key={cmd.route}
              className={css('_flex _aic _jcsb _wfull')}
              style={{
                padding: '0.5rem 0.75rem',
                background: i === selected ? 'var(--d-surface-raised)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--d-radius-sm)',
                color: 'var(--d-text)',
                cursor: 'pointer',
                transition: 'background 100ms',
                fontSize: '0.875rem',
              }}
              onClick={() => { navigate(cmd.route); onClose(); }}
              onMouseEnter={() => setSelected(i)}
            >
              <span className={css('_flex _aic _gap3')}>
                <cmd.icon size={16} style={{ color: 'var(--d-text-muted)' }} />
                <span>{cmd.label}</span>
              </span>
              <span className={css('_flex _aic _gap2')}>
                {cmd.shortcut && (
                  <kbd className={css('_textxs')} style={{ color: 'var(--d-text-muted)', opacity: 0.6, fontFamily: 'ui-monospace, monospace' }}>{cmd.shortcut}</kbd>
                )}
                <ArrowRight size={12} style={{ color: 'var(--d-text-muted)', opacity: 0.4 }} />
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className={css('_textsm _textc')} style={{ color: 'var(--d-text-muted)', padding: '1.5rem' }}>
              No commands found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
