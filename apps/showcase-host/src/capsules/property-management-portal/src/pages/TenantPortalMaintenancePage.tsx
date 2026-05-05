import { useState } from 'react';
import { Plus, Paperclip } from 'lucide-react';
import { SectionLabel } from '@/components/SectionLabel';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { currentTenant, maintenanceTickets } from '@/data/mock';

export function TenantPortalMaintenancePage() {
  const [showForm, setShowForm] = useState(false);
  const myTickets = maintenanceTickets.filter(t => t.tenantName === currentTenant.name);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--d-primary)' }}>Maintenance Requests</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
            We respond within 2 hours on weekdays · urgent issues same-day
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="pm-button-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <Plus size={14} /> New request
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); setShowForm(false); }}
          className="pm-card"
          style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <SectionLabel>Submit Request</SectionLabel>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Issue summary</label>
            <input className="d-control" placeholder="e.g., Kitchen faucet leaking" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Category</label>
              <select className="d-control" defaultValue="Plumbing">
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>HVAC</option>
                <option>Appliance</option>
                <option>Structural</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Priority</label>
              <select className="d-control" defaultValue="medium">
                <option value="low">Low — when convenient</option>
                <option value="medium">Medium — within the week</option>
                <option value="high">High — within 48 hours</option>
                <option value="urgent">Urgent — same day</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Description</label>
            <textarea className="d-control" rows={4} placeholder="Tell us what's happening..." style={{ resize: 'vertical' }} />
          </div>
          <div>
            <button type="button" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
              <Paperclip size={14} /> Attach photo
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" onClick={() => setShowForm(false)} className="d-interactive" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>Cancel</button>
            <button type="submit" className="pm-button-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>Submit request</button>
          </div>
        </form>
      )}

      <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
        <SectionLabel style={{ marginBottom: '0.875rem' }}>My Requests ({myTickets.length})</SectionLabel>
        {myTickets.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {myTickets.map(t => (
              <div key={t.id} style={{ padding: '0.875rem', background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.375rem' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)', marginTop: '0.125rem' }}>{t.number} · Submitted {t.submitted}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                  </div>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', lineHeight: 1.55 }}>{t.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', textAlign: 'center', padding: '2rem 0' }}>
            No requests yet. Need something fixed? Click "New request" above.
          </p>
        )}
      </div>
    </div>
  );
}
