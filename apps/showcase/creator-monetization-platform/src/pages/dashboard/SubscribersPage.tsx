import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Download, MessageCircle, Search } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { subscribers } from '../../data/mock';

export function SubscribersPage() {
  return (
    <div>
      <PageHeader
        title="Subscribers"
        subtitle={`${subscribers.length.toLocaleString()} active · showing all tiers`}
        actions={
          <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}>
            <Download size={14} /> Export CSV
          </button>
        }
      />

      <div className={css('_flex _aic _gap2')} style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div className={css('_flex _aic _gap2')} style={{ flex: 1, maxWidth: 320, padding: '0 0.75rem', border: '1px solid var(--d-border)', borderRadius: 999, background: 'var(--d-surface)' }}>
          <Search size={14} style={{ color: 'var(--d-text-muted)' }} />
          <input type="search" placeholder="Search subscribers…" style={{ border: 'none', background: 'transparent', padding: '0.5rem 0', width: '100%', fontSize: '0.875rem', fontFamily: 'system-ui, sans-serif', outline: 'none' }} />
        </div>
        {['All', 'Fan', 'Super Fan', 'Patron'].map((f, i) => (
          <button key={f} className="d-interactive" data-variant={i === 0 ? 'primary' : 'ghost'}
            style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>{f}</button>
        ))}
      </div>

      <div className="studio-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', padding: '0.75rem 1rem', background: 'var(--d-surface-raised)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif', fontWeight: 700 }}>
          <div>Subscriber</div><div>Tier</div><div>Since</div><div>LTV</div><div></div>
        </div>
        {subscribers.map((s) => (
          <Link key={s.id} to={`/dashboard/subscribers/${s.id}`}
            style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', padding: '0.875rem 1rem', alignItems: 'center', borderTop: '1px solid var(--d-border)', textDecoration: 'none', color: 'var(--d-text)', fontSize: '0.875rem', fontFamily: 'system-ui, sans-serif' }}>
            <div className={css('_flex _aic _gap3')}>
              <img src={s.avatar} alt="" width={32} height={32} style={{ borderRadius: '50%' }} />
              <div>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>@{s.handle}</div>
              </div>
            </div>
            <div><span className="studio-badge-tier" data-tier={s.tierColor}>{s.tier}</span></div>
            <div style={{ color: 'var(--d-text-muted)' }}>{new Date(s.since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
            <div style={{ fontWeight: 600 }}>${s.lifetimeValue}</div>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.5rem', border: 'none' }} aria-label="Message">
              <MessageCircle size={14} />
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
