import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { Upload, Save, Calendar } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { tiers } from '../../data/mock';

export function ContentNewPage() {
  const navigate = useNavigate();
  const [tier, setTier] = useState('t-fan');
  return (
    <div>
      <PageHeader
        title="New post"
        subtitle="Publish to your community."
        actions={
          <>
            <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}>
              <Save size={14} /> Save draft
            </button>
            <button onClick={() => navigate('/dashboard/content')} className="d-interactive studio-glow" data-variant="primary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}>Publish</button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem' }} className="editor-grid">
        <div className={css('_flex _col _gap3')}>
          <div className="studio-card" style={{ padding: '1.25rem' }}>
            <input type="text" placeholder="Give your post a title…" className="studio-input" style={{ width: '100%', fontSize: '1.25rem', fontWeight: 600, border: 'none', background: 'transparent', padding: '0.5rem 0' }} />
            <hr className="studio-divider" style={{ margin: '0.5rem 0 1rem' }} />
            <textarea placeholder="Start writing…" className="studio-input" rows={14} style={{ width: '100%', border: 'none', background: 'transparent', padding: '0.5rem 0', resize: 'vertical', fontSize: '0.9375rem', lineHeight: 1.6 }} />
          </div>
          <div className="studio-card" style={{ padding: '1.25rem', textAlign: 'center', border: '2px dashed var(--d-border)', background: 'var(--d-surface-raised)' }}>
            <Upload size={20} style={{ color: 'var(--d-text-muted)', margin: '0 auto 0.5rem' }} />
            <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>Drop media here · images, video, audio</p>
          </div>
        </div>

        <aside className={css('_flex _col _gap3')}>
          <div className="studio-card" style={{ padding: '1.25rem' }}>
            <p className="d-label" style={{ marginBottom: '0.625rem' }}>Access tier</p>
            <div className={css('_flex _col _gap2')}>
              {tiers.map((t) => (
                <label key={t.id} className={css('_flex _aic _gap2')}
                  style={{ padding: '0.5rem 0.625rem', borderRadius: 8, border: `1px solid ${tier === t.id ? 'var(--d-primary)' : 'var(--d-border)'}`, cursor: 'pointer', fontSize: '0.8125rem', fontFamily: 'system-ui, sans-serif' }}>
                  <input type="radio" name="tier" checked={tier === t.id} onChange={() => setTier(t.id)} style={{ accentColor: 'var(--d-primary)' }} />
                  <span className="studio-badge-tier" data-tier={t.color}>{t.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="studio-card" style={{ padding: '1.25rem' }}>
            <p className="d-label" style={{ marginBottom: '0.625rem' }}>Schedule</p>
            <button className="d-interactive" data-variant="ghost" style={{ width: '100%', fontSize: '0.8125rem', justifyContent: 'flex-start' }}>
              <Calendar size={14} /> Publish now
            </button>
          </div>
        </aside>
      </div>
      <style>{`@media (max-width: 900px) { .editor-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
