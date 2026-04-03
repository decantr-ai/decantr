import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { Search, ArrowRight } from 'lucide-react';

const ROUTES = [
  { path: '/agents', label: 'Agent Overview', section: 'Agents' },
  { path: '/marketplace', label: 'Agent Marketplace', section: 'Agents' },
  { path: '/agents/config', label: 'Agent Configuration', section: 'Agents' },
  { path: '/transparency', label: 'Model Overview', section: 'Transparency' },
  { path: '/transparency/inference', label: 'Inference Log', section: 'Transparency' },
  { path: '/transparency/confidence', label: 'Confidence Explorer', section: 'Transparency' },
  { path: '/', label: 'Home', section: 'Marketing' },
  { path: '/login', label: 'Sign In', section: 'Auth' },
  { path: '/register', label: 'Register', section: 'Auth' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const filtered = ROUTES.filter(
    r => r.label.toLowerCase().includes(query.toLowerCase()) ||
         r.section.toLowerCase().includes(query.toLowerCase())
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setSelected(0);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape' && open) {
        close();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(s => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(s => Math.max(s - 1, 0));
    } else if (e.key === 'Enter' && filtered[selected]) {
      navigate(filtered[selected].path);
      close();
    }
  };

  if (!open) return null;

  return (
    <div className="command-palette-overlay" onClick={close}>
      <div
        className={css('_flex _col _gap0') + ' d-surface carbon-glass command-palette'}
        onClick={e => e.stopPropagation()}
      >
        <div className={css('_flex _aic _gap2 _px3 _py2')} style={{ borderBottom: '1px solid var(--d-border)' }}>
          <Search size={16} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            className={css('_flex1 _bordernone')}
            style={{ background: 'transparent', outline: 'none', color: 'var(--d-text)', fontSize: '0.875rem' }}
          />
          <kbd className={css('_textsm') + ' mono-data'} style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem' }}>ESC</kbd>
        </div>
        <div className={css('_flex _col _p1')} style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {filtered.map((route, i) => (
            <div
              key={route.path}
              className={'command-palette-item'}
              data-selected={i === selected ? '' : undefined}
              onClick={() => { navigate(route.path); close(); }}
            >
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{route.section}</span>
              <ArrowRight size={12} style={{ color: 'var(--d-text-muted)' }} />
              <span className={css('_textsm')}>{route.label}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className={css('_p3 _textc _textsm')} style={{ color: 'var(--d-text-muted)' }}>
              No results found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
