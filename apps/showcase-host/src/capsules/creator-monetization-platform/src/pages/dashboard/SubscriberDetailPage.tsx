import { useParams, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { subscriberById, activity } from '../../data/mock';

export function SubscriberDetailPage() {
  const { id } = useParams();
  const s = subscriberById(id || '');
  return (
    <div>
      <Link to="/dashboard/subscribers" className={css('_flex _aic _gap2')} style={{ textDecoration: 'none', color: 'var(--d-text-muted)', fontSize: '0.8125rem', marginBottom: '1rem', fontFamily: 'system-ui, sans-serif' }}>
        <ArrowLeft size={14} /> All subscribers
      </Link>
      <PageHeader
        title={s.name}
        subtitle={`@${s.handle} · ${s.tier} since ${new Date(s.since).toLocaleDateString()}`}
        actions={
          <button className="d-interactive studio-glow" data-variant="primary" style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}>
            <MessageCircle size={14} /> Message
          </button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem' }} className="editor-grid">
        <div className={css('_flex _col _gap3')}>
          <div className="studio-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <img src={s.avatar} alt="" width={88} height={88} className="studio-avatar-creator" style={{ margin: '0 auto 0.75rem' }} />
            <div style={{ fontWeight: 600, fontSize: '1rem', fontFamily: 'system-ui, sans-serif' }}>{s.name}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>@{s.handle}</div>
            <div style={{ marginTop: '0.75rem' }}>
              <span className="studio-badge-tier" data-tier={s.tierColor}>{s.tier}</span>
            </div>
          </div>
          <div className="studio-card" style={{ padding: '1.25rem' }}>
            <p className="d-label" style={{ marginBottom: '0.75rem' }}>Stats</p>
            <dl style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.625rem', fontSize: '0.875rem', fontFamily: 'system-ui, sans-serif' }}>
              <dt style={{ color: 'var(--d-text-muted)' }}>Lifetime value</dt><dd style={{ fontWeight: 600 }}>${s.lifetimeValue}</dd>
              <dt style={{ color: 'var(--d-text-muted)' }}>Last active</dt><dd>{s.lastActive}</dd>
              <dt style={{ color: 'var(--d-text-muted)' }}>Messages</dt><dd>3</dd>
            </dl>
          </div>
        </div>

        <div className="studio-card" style={{ padding: '1.5rem' }}>
          <h3 className="serif-display" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Activity</h3>
          <div className={css('_flex _col _gap3')}>
            {activity.map((a) => (
              <div key={a.id} className={css('_flex _aifs _gap3')}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color === 'patron' ? '#F472B6' : a.color === 'super' ? '#C4B5FD' : '#FDBA74', marginTop: 6, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.875rem', fontFamily: 'system-ui, sans-serif' }}>{a.text}</p>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .editor-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
