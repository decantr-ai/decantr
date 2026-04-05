import { useParams, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Users, FileText, ExternalLink, Check } from 'lucide-react';
import { TierBadge } from '../../components/TierBadge';
import { creatorByUsername, posts } from '../../data/mock';

export function CreatorProfilePage() {
  const { username } = useParams();
  const creator = creatorByUsername(username || '');
  const creatorPosts = posts.filter((p) => p.creatorId === creator.id);

  return (
    <div>
      {/* Cover */}
      <div style={{ height: 240, backgroundImage: `url(${creator.cover})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 'var(--d-radius-lg)', position: 'relative', marginBottom: 56 }}>
        <img src={creator.avatar} alt={creator.name} width={112} height={112} className="studio-avatar-creator"
          style={{ position: 'absolute', bottom: -56, left: 32, borderWidth: 4 }} />
      </div>

      {/* Identity */}
      <div className={css('_flex _aifs _jcsb _gap4')} style={{ marginBottom: '2rem', flexWrap: 'wrap', paddingLeft: 32 }}>
        <div>
          <h1 className="serif-display" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{creator.name}</h1>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem', fontFamily: 'system-ui, sans-serif', marginBottom: '0.5rem' }}>@{creator.username} · {creator.category}</p>
          <p style={{ maxWidth: 560, fontSize: '0.9375rem', lineHeight: 1.55, fontFamily: 'system-ui, sans-serif' }}>{creator.bio}</p>
          <div className={css('_flex _aic _gap4')} style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
            <span className={css('_flex _aic _gap1')}><Users size={14} /> {creator.subscribers.toLocaleString()} subscribers</span>
            <span className={css('_flex _aic _gap1')}><FileText size={14} /> {creator.posts} posts</span>
            {creator.links.map((l) => (
              <a key={l.label} href={l.url} className={css('_flex _aic _gap1')} style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>
                <ExternalLink size={12} /> {l.label}
              </a>
            ))}
          </div>
        </div>
        <Link to="/checkout" className="d-interactive studio-glow" data-variant="primary"
          style={{ textDecoration: 'none', fontSize: '0.875rem', padding: '0.625rem 1.25rem' }}>Subscribe to {creator.name.split(' ')[0]}</Link>
      </div>

      {/* Tiers */}
      <h2 className="serif-display" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Support tiers</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {creator.tiers.filter((t) => t.price > 0).map((t, i) => (
          <div key={t.id} className={i === 1 ? 'studio-card-premium' : 'studio-card'} style={{ padding: i === 1 ? 0 : 0 }}>
            <div className={i === 1 ? 'inner' : ''} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span className="studio-badge-tier" data-tier={t.color}>{t.name}</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                ${t.price}<span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--d-text-muted)' }}>/mo</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginBottom: '1rem', fontFamily: 'system-ui, sans-serif', lineHeight: 1.5 }}>{t.description}</p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1rem' }}>
                {t.benefits.slice(0, 4).map((b) => (
                  <li key={b} className={css('_flex _aic _gap2')} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
                    <Check size={12} style={{ color: 'var(--d-primary)', flexShrink: 0 }} />{b}
                  </li>
                ))}
              </ul>
              <Link to="/checkout" className="d-interactive" data-variant={i === 1 ? 'primary' : 'ghost'}
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem', padding: '0.5rem 1rem', textDecoration: 'none' }}>Join at ${t.price}/mo</Link>
            </div>
          </div>
        ))}
      </div>

      {/* Posts */}
      <h2 className="serif-display" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Recent work</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {creatorPosts.map((p) => (
          <Link key={p.id} to={`/creator/${creator.username}/post/${p.id}`}
            className="studio-card"
            style={{ textDecoration: 'none', color: 'inherit', overflow: 'hidden', padding: 0, position: 'relative' }}>
            <div style={{ height: 140, backgroundImage: `url(${p.cover})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
              {p.tier !== 'free' && (
                <div className="studio-gate-blur" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TierBadge tier={p.tier} />
                </div>
              )}
            </div>
            <div style={{ padding: '0.875rem 1rem 1rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'system-ui, sans-serif', marginBottom: '0.25rem', lineHeight: 1.35 }}>{p.title}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>{p.publishedAt} · {p.likes} likes</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
