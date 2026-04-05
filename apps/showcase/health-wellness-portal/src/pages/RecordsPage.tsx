import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Upload, FileText, Beaker, Image as ImageIcon, Clipboard, FileHeart } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { healthRecords } from '@/data/mock';

const typeIcons: Record<string, React.ElementType> = {
  lab: Beaker,
  imaging: ImageIcon,
  note: FileText,
  form: Clipboard,
  prescription: FileHeart,
};

export function RecordsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');

  const categories = ['All', 'Lab Results', 'Imaging', 'Visit Notes', 'Forms', 'Prescriptions'];

  const filtered = healthRecords.filter(r => {
    if (category !== 'All' && r.category !== category) return false;
    if (query && !r.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1400 }}>
      <PageHeader
        title="Health Records"
        description="Your lab results, imaging, visit notes, and forms — all in one secure place."
        actions={
          <>
            <Link to="/intake" className="d-interactive" style={{ padding: '0.625rem 1rem', fontSize: '0.9375rem', textDecoration: 'none' }}>
              <Clipboard size={16} /> Intake Forms
            </Link>
            <button className="hw-button-primary" style={{ padding: '0.625rem 1.125rem', fontSize: '0.9375rem' }}>
              <Upload size={18} /> Upload Document
            </button>
          </>
        }
      />

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 400 }}>
          <Search size={18} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--d-text-muted)', pointerEvents: 'none',
          }} aria-hidden />
          <input
            type="search"
            className="d-control"
            placeholder="Search records…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: 40 }}
            aria-label="Search records"
          />
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="d-interactive"
              style={{
                padding: '0.5rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600,
                background: category === c ? 'var(--d-primary)' : 'var(--d-surface)',
                color: category === c ? '#fff' : 'var(--d-text)',
                borderColor: category === c ? 'var(--d-primary)' : 'var(--d-border)',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* File browser */}
      <div className="hw-card" style={{ padding: '0.5rem' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--d-text-muted)' }}>
            <FileText size={32} style={{ margin: '0 auto 1rem', opacity: 0.4 }} aria-hidden />
            <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--d-text)' }}>
              No records match that search
            </div>
            <div style={{ fontSize: '0.875rem' }}>Try a different term or category.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map(r => {
              const Icon = typeIcons[r.type] || FileText;
              return (
                <Link key={r.id} to={`/records/${r.id}`} className="hw-file-row">
                  <div className="hw-file-icon" aria-hidden>
                    <Icon size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.125rem' }}>{r.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
                      {r.category} · {r.provider} · {r.summary}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{r.date}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                      {r.sizeKb < 1024 ? `${r.sizeKb} KB` : `${(r.sizeKb / 1024).toFixed(1)} MB`}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <SectionLabel>Showing {filtered.length} of {healthRecords.length} records</SectionLabel>
    </div>
  );
}
