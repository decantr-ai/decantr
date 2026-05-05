import { NavLink } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { characters } from '@/data/mock';

export function CharactersPage() {
  const [filter, setFilter] = useState('all');
  const allTags = ['all', ...new Set(characters.flatMap(c => c.tags))];
  const filtered = filter === 'all' ? characters : characters.filter(c => c.tags.includes(filter));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Characters</h1>
        <button className="d-interactive" data-variant="primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
          <Plus size={14} /> New Character
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
        {allTags.map(t => (
          <button
            key={t}
            className="d-interactive"
            data-variant={filter === t ? undefined : 'ghost'}
            onClick={() => setFilter(t)}
            style={{ padding: '4px 10px', fontSize: '0.75rem', textTransform: 'capitalize', border: filter === t ? '1px solid var(--d-primary)' : undefined, background: filter === t ? 'color-mix(in srgb, var(--d-primary) 12%, transparent)' : undefined }}
          >{t}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--d-gap-4)' }}>
        {filtered.map(c => (
          <NavLink key={c.id} to={`/characters/${c.id}`} className="d-surface" data-interactive style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--d-radius)', flexShrink: 0,
                background: 'color-mix(in srgb, var(--d-primary) 15%, var(--d-surface-raised))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.85rem', color: 'var(--d-primary)',
                fontFamily: "'JetBrains Mono', monospace",
              }}>{c.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>{c.name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</p>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
                  <span>{c.appearances} scenes</span>
                  <span style={{ color: c.consistency >= 90 ? 'var(--d-success)' : 'var(--d-warning)' }}>{c.consistency}% consistency</span>
                </div>
              </div>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
