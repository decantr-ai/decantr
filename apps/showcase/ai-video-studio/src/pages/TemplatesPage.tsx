import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { templates } from '@/data/mock';

export function TemplatesPage() {
  const [category, setCategory] = useState('all');
  const categories = ['all', ...new Set(templates.map(t => t.category))];
  const filtered = category === 'all' ? templates : templates.filter(t => t.category === category);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <NavLink to="/projects" className="d-interactive" data-variant="ghost" style={{ padding: '4px', border: 'none' }}><ArrowLeft size={16} /></NavLink>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Templates</h1>
      </div>
      <p style={{ color: 'var(--d-text-muted)', fontSize: '0.85rem' }}>Start your next production from a curated blueprint.</p>

      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {categories.map(c => (
          <button
            key={c}
            className="d-interactive"
            data-variant={category === c ? undefined : 'ghost'}
            onClick={() => setCategory(c)}
            style={{ padding: '4px 10px', fontSize: '0.75rem', textTransform: 'capitalize', border: category === c ? '1px solid var(--d-primary)' : undefined, background: category === c ? 'color-mix(in srgb, var(--d-primary) 12%, transparent)' : undefined }}
          >{c}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--d-gap-4)' }}>
        {filtered.map(t => (
          <div key={t.id} className="d-surface" data-interactive style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}>
            <div className="cinema-frame" data-ratio="16:9" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', borderRadius: 0, borderBottom: '1px solid var(--d-border)' }}>
              {t.thumbnail}
            </div>
            <div style={{ padding: 'var(--d-surface-p)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>{t.description}</p>
              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
                <span className="d-annotation">{t.category}</span>
                <span>{t.scenes} scenes</span>
                <span className="cinema-timecode" style={{ padding: '0.1rem 0.35rem' }}>{t.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
