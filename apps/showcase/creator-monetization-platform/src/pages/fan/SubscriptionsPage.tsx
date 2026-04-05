import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { fan, creators, tiers } from '../../data/mock';

export function SubscriptionsPage() {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="serif-display" style={{ fontSize: '1.875rem' }}>Subscriptions</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.9375rem', fontFamily: 'system-ui, sans-serif' }}>Manage your support.</p>
      </div>

      <div className={css('_flex _col _gap3')}>
        {fan.subscriptions.map((s) => {
          const c = creators.find((x) => x.id === s.creatorId);
          const t = tiers.find((x) => x.id === s.tierId);
          if (!c || !t) return null;
          return (
            <div key={s.creatorId} className="studio-card" style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '1rem', alignItems: 'center' }}>
              <img src={c.avatar} alt="" width={56} height={56} className="studio-avatar-creator" style={{ borderWidth: 2 }} />
              <div>
                <Link to={`/creator/${c.username}`} style={{ fontWeight: 600, fontSize: '0.9375rem', fontFamily: 'system-ui, sans-serif', textDecoration: 'none', color: 'var(--d-text)' }}>{c.name}</Link>
                <div className={css('_flex _aic _gap2')} style={{ marginTop: '0.25rem' }}>
                  <span className="studio-badge-tier" data-tier={t.color}>{t.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>Next bill ${t.price} · {new Date(s.nextBilling).toLocaleDateString()}</span>
                </div>
              </div>
              <div className={css('_flex _gap2')}>
                <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}>Change tier</button>
                <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem', color: 'var(--d-text-muted)' }}>Cancel</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
