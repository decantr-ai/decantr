import { SettingsLayout, workspaceNav } from '../components/SettingsLayout';
import { CreditCard, Download } from 'lucide-react';

export function SettingsBillingPage() {
  return (
    <SettingsLayout title="Workspace settings" subtitle="Manage your team's shared space." nav={workspaceNav}>
      <section className="paper-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.25rem' }}>Current plan</h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>Team</span>
              <span className="chip chip-primary">Active</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginTop: '0.375rem' }}>6 members · $72/month</p>
          </div>
          <button className="d-interactive" style={{ padding: '0.4375rem 0.75rem', fontSize: '0.8125rem' }}>Change plan</button>
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', paddingTop: '1rem', borderTop: '1px solid var(--d-border)' }}>
          Next invoice: <strong style={{ color: 'var(--d-text)' }}>April 15, 2026</strong>
        </div>
      </section>

      <section className="paper-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.75rem' }}>Payment method</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CreditCard size={18} style={{ color: 'var(--d-text-muted)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Visa ending in 4242</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Expires 12/27</div>
          </div>
          <button className="d-interactive" style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}>Update</button>
        </div>
      </section>

      <section className="paper-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.75rem' }}>Invoices</h2>
        <div>
          {[
            { date: 'Mar 15, 2026', amount: '$72.00', status: 'Paid' },
            { date: 'Feb 15, 2026', amount: '$72.00', status: 'Paid' },
            { date: 'Jan 15, 2026', amount: '$60.00', status: 'Paid' },
          ].map((inv, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.625rem 0', borderTop: i === 0 ? 'none' : '1px solid var(--d-border)' }}>
              <span style={{ flex: 1, fontSize: '0.8125rem' }}>{inv.date}</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{inv.amount}</span>
              <span className="chip">{inv.status}</span>
              <button style={{ background: 'transparent', border: 'none', padding: '0.25rem', cursor: 'pointer', color: 'var(--d-text-muted)' }} aria-label="Download">
                <Download size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </SettingsLayout>
  );
}
