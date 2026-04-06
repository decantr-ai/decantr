import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { shareClasses, shareholders } from '@/data/mock';
import { formatMoney } from '@/components/Money';

export function ShareClassDetailPage() {
  const { id } = useParams();
  const sc = shareClasses.find(s => s.id === id) ?? shareClasses[0];
  const holders = shareholders.filter(sh => sh.shareClass === sc.name);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Link to="/cap-table" className="d-interactive" data-variant="ghost" style={{ alignSelf: 'flex-start', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
        <ArrowLeft size={14} /> Back to cap table
      </Link>

      <PageHeader
        title={sc.name}
        description={`${sc.type} shares | ${sc.issued.toLocaleString()} issued of ${sc.authorised.toLocaleString()} authorised`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--d-content-gap)' }}>
        {[
          { label: 'Price/Share', value: `$${sc.pricePerShare.toFixed(3)}` },
          { label: 'Authorised', value: sc.authorised.toLocaleString() },
          { label: 'Issued', value: sc.issued.toLocaleString() },
          { label: 'Available', value: (sc.authorised - sc.issued).toLocaleString() },
          { label: 'Voting Rights', value: sc.votingRights ? 'Yes' : 'No' },
          { label: 'Liq. Preference', value: `${sc.liquidationPref.toFixed(1)}x` },
        ].map(k => (
          <div key={k.label} className="fo-card fo-kpi-accent" style={{ padding: 'var(--d-surface-p)' }}>
            <div className="d-label" style={{ marginBottom: '0.375rem' }}>{k.label}</div>
            <div className="fo-mono" style={{ fontSize: '1.125rem', fontWeight: 700 }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <SectionLabel style={{ marginBottom: '1rem' }}>Holders — {sc.name}</SectionLabel>
        {holders.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>No holders found for this share class.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {holders.map((sh, i) => (
              <div key={sh.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 100px 80px',
                gap: '0.75rem',
                alignItems: 'center',
                padding: '0.625rem 0',
                borderBottom: i < holders.length - 1 ? '1px solid var(--d-border)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="fo-avatar" style={{ width: 24, height: 24, fontSize: '0.55rem' }}>{sh.avatar}</div>
                  <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{sh.name}</span>
                </div>
                <span className="fo-mono" style={{ textAlign: 'right', fontSize: '0.85rem' }}>{sh.shares.toLocaleString()}</span>
                <span className="fo-mono" style={{ textAlign: 'right', fontSize: '0.85rem' }}>{formatMoney(sh.currentValue, true)}</span>
                <span className="fo-mono" style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{sh.ownership.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
