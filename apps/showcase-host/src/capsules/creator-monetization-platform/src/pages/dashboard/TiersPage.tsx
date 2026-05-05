import { css } from '@decantr/css';
import { Plus, GripVertical, Edit3, Check } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { tiers } from '../../data/mock';

export function TiersPage() {
  return (
    <div>
      <PageHeader
        title="Membership tiers"
        subtitle="Organize your benefits and pricing."
        actions={
          <button className="d-interactive studio-glow" data-variant="primary" style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}>
            <Plus size={14} /> New tier
          </button>
        }
      />

      <div className={css('_flex _col _gap3')}>
        {tiers.map((t) => (
          <div key={t.id} className={t.color === 'patron' ? 'studio-card-premium' : 'studio-card'} style={{ padding: t.color === 'patron' ? 0 : 0 }}>
            <div className={t.color === 'patron' ? 'inner' : ''} style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '1rem', alignItems: 'start' }}>
              <button className="d-interactive" data-variant="ghost"
                style={{ padding: '0.375rem', border: 'none', cursor: 'grab', color: 'var(--d-text-muted)' }} aria-label="Reorder">
                <GripVertical size={16} />
              </button>
              <div>
                <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.5rem' }}>
                  <span className="studio-badge-tier" data-tier={t.color}>{t.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
                    {t.subscribers.toLocaleString()} subscribers · ${(t.price * t.subscribers).toLocaleString()}/mo
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif', marginBottom: '0.75rem', lineHeight: 1.5 }}>{t.description}</p>
                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.375rem' }}>
                  {t.benefits.map((b) => (
                    <li key={b} className={css('_flex _aic _gap2')} style={{ fontSize: '0.8125rem', fontFamily: 'system-ui, sans-serif' }}>
                      <Check size={12} style={{ color: 'var(--d-primary)' }} />{b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={css('_flex _col _aife _gap2')}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>${t.price}</div>
                <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}>
                  <Edit3 size={12} /> Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
