import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Download, Search } from 'lucide-react';
import { TierBadge } from '../../components/TierBadge';
import { posts, creators } from '../../data/mock';

export function LibraryPage() {
  return (
    <div>
      <div className={css('_flex _aifs _jcsb _gap3')} style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <h1 className="serif-display" style={{ fontSize: '1.875rem' }}>Your Library</h1>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.9375rem', fontFamily: 'system-ui, sans-serif' }}>Everything you've unlocked across your subscriptions.</p>
        </div>
        <div className={css('_flex _aic _gap2')} style={{ padding: '0 0.75rem', border: '1px solid var(--d-border)', borderRadius: 999, background: 'var(--d-surface)' }}>
          <Search size={14} style={{ color: 'var(--d-text-muted)' }} />
          <input type="search" placeholder="Search library…" style={{ border: 'none', background: 'transparent', padding: '0.5rem 0', width: 200, fontSize: '0.875rem', fontFamily: 'system-ui, sans-serif', outline: 'none' }} />
        </div>
      </div>

      <div className={css('_flex _gap2')} style={{ marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['All', 'Articles', 'Videos', 'Audio', 'Downloads'].map((f, i) => (
          <button key={f} className="d-interactive" data-variant={i === 0 ? 'primary' : 'ghost'}
            style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>{f}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {posts.map((p) => {
          const creator = creators.find((c) => c.id === p.creatorId) ?? creators[0];
          return (
            <Link key={p.id} to={`/creator/${creator.username}/post/${p.id}`}
              className="studio-card studio-fade-up"
              style={{ textDecoration: 'none', color: 'inherit', overflow: 'hidden', padding: 0 }}>
              <div style={{ height: 140, backgroundImage: `url(${p.cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div style={{ padding: '0.875rem 1rem 1rem' }}>
                <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.5rem' }}>
                  <TierBadge tier={p.tier} />
                  <button className="d-interactive" data-variant="ghost" style={{ border: 'none', padding: '0.25rem' }} aria-label="Download">
                    <Download size={13} />
                  </button>
                </div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'system-ui, sans-serif', marginBottom: '0.25rem', lineHeight: 1.35 }}>{p.title}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>{creator.name} · {p.publishedAt}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
