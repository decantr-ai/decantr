import { css } from '@decantr/css';
import { Check, Building2 } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';

const history = [
  { date: 'Mar 31, 2026', amount: 7440, status: 'Paid' },
  { date: 'Feb 28, 2026', amount: 6982, status: 'Paid' },
  { date: 'Jan 31, 2026', amount: 6420, status: 'Paid' },
  { date: 'Dec 31, 2025', amount: 6168, status: 'Paid' },
];

export function PayoutsPage() {
  return (
    <div>
      <PageHeader title="Payouts" subtitle="Where your money lands, and when." />

      <div className="studio-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 className="serif-display" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Payout method</h3>
        <div className={css('_flex _aic _gap3 _p4')} style={{ border: '1px solid var(--d-border)', borderRadius: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--d-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9375rem', fontFamily: 'system-ui, sans-serif' }}>Chase Bank · ••4521</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>USD · Next payout Monday, Apr 7</div>
          </div>
          <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8125rem' }}>Change</button>
        </div>
        <div className={css('_flex _aic _gap2')} style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
          <Check size={14} style={{ color: 'var(--d-success)' }} />Weekly schedule · Mondays
        </div>
      </div>

      <div className="studio-card" style={{ padding: '1.5rem' }}>
        <h3 className="serif-display" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Payout history</h3>
        <div className="d-data">
          <div className="d-data-header d-data-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '0.75rem 0' }}>
            <div className="d-data-cell">Date</div>
            <div className="d-data-cell">Amount</div>
            <div className="d-data-cell">Status</div>
          </div>
          {history.map((h) => (
            <div key={h.date} className="d-data-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '0.875rem 0', borderTop: '1px solid var(--d-border)', fontFamily: 'system-ui, sans-serif', fontSize: '0.875rem' }}>
              <div>{h.date}</div>
              <div style={{ fontWeight: 600 }}>${h.amount.toLocaleString()}</div>
              <div><span className="d-annotation" data-status="success">{h.status}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
