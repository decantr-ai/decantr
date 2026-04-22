import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import type { AppCommand } from '../data/mock';
import { useNavigate } from 'react-router-dom';

export function CommandPalette({
  commands,
  onClose,
}: {
  commands: AppCommand[];
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () => commands.filter((command) => {
      const haystack = `${command.label} ${command.description}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    }),
    [commands, query],
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelected((current) => Math.min(current + 1, Math.max(filtered.length - 1, 0)));
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelected((current) => Math.max(current - 1, 0));
      }
      if (event.key === 'Enter' && filtered[selected]) {
        navigate(filtered[selected].route);
        onClose();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [filtered, navigate, onClose, selected]);

  return (
    <div className="command-palette" onClick={onClose}>
      <section
        className="d-surface carbon-glass command-palette__panel"
        onClick={(event) => event.stopPropagation()}
        aria-label="Command palette"
      >
        <div className="command-palette__search">
          <Search size={16} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search routes, actions, or sections"
            className="d-control command-palette__input"
            aria-label="Search commands"
          />
        </div>

        <div className="command-palette__list">
          {filtered.length === 0 ? (
            <p className="command-palette__empty">No matching commands yet.</p>
          ) : filtered.map((command, index) => {
            const Icon = command.icon;
            return (
              <button
                key={command.route}
                type="button"
                className="command-palette__item"
                data-selected={index === selected}
                aria-label={`${command.label}. ${command.description}`}
                onClick={() => {
                  navigate(command.route);
                  onClose();
                }}
                onMouseEnter={() => setSelected(index)}
              >
                <Icon size={16} />
                <span className="command-palette__item-copy">
                  <strong>{command.label}</strong>
                  <span className="command-palette__item-description">{command.description}</span>
                </span>
                <span className="command-palette__item-meta">
                  {command.shortcut ? <kbd>{command.shortcut}</kbd> : null}
                  <ArrowRight size={14} />
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
