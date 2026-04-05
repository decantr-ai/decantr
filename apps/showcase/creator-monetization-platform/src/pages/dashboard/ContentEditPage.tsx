import { useParams, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { TierBadge } from '../../components/TierBadge';
import { postById, tiers } from '../../data/mock';
import { useState } from 'react';

export function ContentEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = postById(id || '');
  const [tier, setTier] = useState(post.tier);

  return (
    <div>
      <PageHeader
        title="Edit post"
        subtitle={post.title}
        actions={
          <>
            <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8125rem', color: 'var(--d-error)' }}>
              <Trash2 size={14} /> Delete
            </button>
            <button onClick={() => navigate('/dashboard/content')} className="d-interactive studio-glow" data-variant="primary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}>Save changes</button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem' }} className="editor-grid">
        <div className="studio-card" style={{ padding: '1.25rem' }}>
          <input type="text" defaultValue={post.title} className="studio-input" style={{ width: '100%', fontSize: '1.25rem', fontWeight: 600, border: 'none', background: 'transparent', padding: '0.5rem 0' }} />
          <hr className="studio-divider" style={{ margin: '0.5rem 0 1rem' }} />
          <textarea defaultValue={post.excerpt + '\n\n' + post.body || 'Full post body goes here…'} className="studio-input" rows={14}
            style={{ width: '100%', border: 'none', background: 'transparent', padding: '0.5rem 0', resize: 'vertical', fontSize: '0.9375rem', lineHeight: 1.6 }} />
        </div>
        <aside className={css('_flex _col _gap3')}>
          <div className="studio-card" style={{ padding: '1.25rem' }}>
            <p className="d-label" style={{ marginBottom: '0.625rem' }}>Cover</p>
            <img src={post.cover} alt="" style={{ width: '100%', borderRadius: 8 }} />
          </div>
          <div className="studio-card" style={{ padding: '1.25rem' }}>
            <p className="d-label" style={{ marginBottom: '0.625rem' }}>Currently</p>
            <TierBadge tier={tier} />
            <p className="d-label" style={{ marginTop: '1rem', marginBottom: '0.625rem' }}>Change tier</p>
            <div className={css('_flex _col _gap2')}>
              {tiers.map((t) => (
                <label key={t.id} className={css('_flex _aic _gap2')}
                  style={{ padding: '0.5rem 0.625rem', borderRadius: 8, border: `1px solid ${tier === t.color ? 'var(--d-primary)' : 'var(--d-border)'}`, cursor: 'pointer', fontSize: '0.8125rem' }}>
                  <input type="radio" name="tier" checked={tier === t.color} onChange={() => setTier(t.color)} style={{ accentColor: 'var(--d-primary)' }} />
                  <span className="studio-badge-tier" data-tier={t.color}>{t.name}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>
      </div>
      <style>{`@media (max-width: 900px) { .editor-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
