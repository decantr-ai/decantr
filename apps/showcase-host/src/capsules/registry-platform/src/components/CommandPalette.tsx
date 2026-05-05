import { useState, useEffect, useCallback, useRef } from 'react';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onThemeToggle: () => void;
}

interface CommandItem {
  label: string;
  shortcut: string;
  action: () => void;
}

export default function CommandPalette({ open, onClose, onNavigate, onThemeToggle }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    { label: 'Browse Registry', shortcut: 'g b', action: () => onNavigate('/browse') },
    { label: 'Dashboard', shortcut: 'g d', action: () => onNavigate('/dashboard') },
    { label: 'Settings', shortcut: 'g s', action: () => onNavigate('/dashboard/settings') },
    { label: 'Toggle Theme', shortcut: 't t', action: onThemeToggle },
  ];

  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      // Small delay so the element is rendered before focusing
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Global keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) {
          onClose();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const executeItem = useCallback(
    (item: CommandItem) => {
      item.action();
      onClose();
    },
    [onClose],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter' && filtered.length > 0) {
        e.preventDefault();
        const selected = filtered[selectedIndex];
        if (selected) executeItem(selected);
      }
    },
    [filtered, selectedIndex, onClose, executeItem],
  );

  if (!open) return null;

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
      }}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        role="presentation"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Card */}
      <div
        className="d-surface"
        data-elevation="overlay"
        role="dialog"
        aria-label="Command palette"
        onKeyDown={handleKeyDown}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '480px',
          padding: 0,
          overflow: 'hidden',
          animation: 'lum-fade-up-in 0.15s ease-out forwards',
        }}
      >
        {/* Search input */}
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--d-border)' }}>
          <input
            ref={inputRef}
            type="text"
            className="d-control"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              border: 'none',
              background: 'transparent',
              padding: '0.375rem 0',
              fontSize: '0.9375rem',
              width: '100%',
              boxShadow: 'none',
            }}
          />
        </div>

        {/* Results */}
        <ul
          role="listbox"
          style={{
            listStyle: 'none',
            margin: 0,
            padding: '0.375rem',
            maxHeight: '280px',
            overflowY: 'auto',
          }}
        >
          {filtered.length === 0 && (
            <li
              style={{
                padding: '1.5rem 0.75rem',
                textAlign: 'center',
                fontSize: '0.8125rem',
                color: 'var(--d-text-muted)',
              }}
            >
              No results found
            </li>
          )}
          {filtered.map((item, i) => {
            const isSelected = i === selectedIndex;
            return (
              <li
                key={item.label}
                role="option"
                aria-selected={isSelected}
                onClick={() => executeItem(item)}
                onMouseEnter={() => setSelectedIndex(i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--d-radius-sm)',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--d-surface)' : 'transparent',
                  transition: 'background 0.1s ease',
                }}
              >
                <span style={{ fontSize: '0.875rem', fontWeight: 450, color: 'var(--d-text)' }}>{item.label}</span>
                <kbd
                  style={{
                    fontFamily: 'var(--d-font-mono, ui-monospace, monospace)',
                    fontSize: '0.6875rem',
                    color: 'var(--d-text-muted)',
                    background: 'var(--d-bg)',
                    border: '1px solid var(--d-border)',
                    borderRadius: 'var(--d-radius-sm)',
                    padding: '0.125rem 0.375rem',
                    letterSpacing: '0.04em',
                  }}
                >
                  {item.shortcut}
                </kbd>
              </li>
            );
          })}
        </ul>

        {/* Footer hint */}
        <div
          style={{
            borderTop: '1px solid var(--d-border)',
            padding: '0.5rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.6875rem',
            color: 'var(--d-text-muted)',
          }}
        >
          <span>
            <kbd style={{ fontFamily: 'inherit', fontWeight: 500 }}>{'\u2191\u2193'}</kbd> navigate
          </span>
          <span>
            <kbd style={{ fontFamily: 'inherit', fontWeight: 500 }}>{'\u21B5'}</kbd> select
          </span>
          <span>
            <kbd style={{ fontFamily: 'inherit', fontWeight: 500 }}>esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
