import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Plus, FileText, Video, Image as ImageIcon, Headphones, Edit3 } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { TierBadge } from '../../components/TierBadge';
import { posts } from '../../data/mock';

const iconFor = (t: string) => t === 'video' ? Video : t === 'image' ? ImageIcon : t === 'audio' ? Headphones : FileText;

export function ContentListPage() {
  return (
    <div>
      <PageHeader
        title="Content"
        subtitle={`${posts.length} posts · 3 drafts`}
        actions={
          <Link to="/dashboard/content/new" className="d-interactive studio-glow" data-variant="primary"
            style={{ textDecoration: 'none', fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}>
            <Plus size={14} /> New post
          </Link>
        }
      />

      <div className={css('_flex _aic _gap2')} style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['All', 'Published', 'Drafts', 'Scheduled'].map((f, i) => (
          <button key={f} className="d-interactive" data-variant={i === 0 ? 'primary' : 'ghost'}
            style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>{f}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {posts.map((p) => {
          const Icon = iconFor(p.mediaType);
          return (
            <div key={p.id} className="studio-card" style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: 80, height: 56, borderRadius: 8, backgroundImage: `url(${p.cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div style={{ minWidth: 0 }}>
                <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.25rem' }}>
                  <Icon size={13} style={{ color: 'var(--d-text-muted)' }} />
                  <TierBadge tier={p.tier} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', fontFamily: 'system-ui, sans-serif', marginBottom: '0.125rem' }}>{p.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
                  {p.publishedAt} · {p.likes} likes · {p.comments} comments
                </div>
              </div>
              <Link to={`/dashboard/content/${p.id}/edit`} className="d-interactive" data-variant="ghost"
                style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem', textDecoration: 'none' }}>
                <Edit3 size={12} /> Edit
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
