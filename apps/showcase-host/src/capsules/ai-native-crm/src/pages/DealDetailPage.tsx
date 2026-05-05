import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, Calendar, User } from 'lucide-react';
import { SectionLabel } from '@/components/SectionLabel';
import { StatusBadge } from '@/components/StatusBadge';
import { ActivityFeed } from '@/components/ActivityFeed';
import { deals, contacts, activityEvents } from '@/data/mock';

export function DealDetailPage() {
  const { id } = useParams();
  const deal = deals.find(d => d.id === id) ?? deals[0];
  const contact = contacts.find(c => c.id === deal.contactId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Link to="/deals" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
        <ArrowLeft size={14} /> Back to deals
      </Link>

      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <StatusBadge status={deal.stage} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '0.5rem' }}>{deal.name}</h1>
            <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>{deal.company}</div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.875rem', fontSize: '0.78rem', color: 'var(--d-text-muted)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><User size={12} /> {deal.owner}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Calendar size={12} /> Close {deal.closeDate}</span>
              <span>Created {deal.created}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--d-text-muted)' }}>Deal Value</div>
            <div className="crm-gradient-text" style={{ fontSize: '2.25rem', fontWeight: 700, fontFamily: 'var(--d-font-mono)' }}>
              ${(deal.value / 1000).toFixed(0)}k
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)' }}>{deal.probability}% probability</div>
          </div>
        </div>

        {/* Probability bar */}
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--d-text-muted)', marginBottom: '0.375rem' }}>
            <span>Probability</span>
            <span style={{ fontFamily: 'var(--d-font-mono)' }}>{deal.probability}%</span>
          </div>
          <div className="crm-prob-track" style={{ height: 6 }}>
            <div className="crm-prob-fill" style={{ width: `${deal.probability}%` }} />
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="glass-panel" style={{
        padding: '1.25rem',
        background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.06), rgba(96, 165, 250, 0.04))',
        border: '1px solid rgba(167, 139, 250, 0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Sparkles size={14} style={{ color: 'var(--d-accent)' }} />
          <SectionLabel>AI Deal Insight</SectionLabel>
        </div>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{deal.aiInsight}</p>
        <div style={{ marginTop: '0.875rem', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--d-radius-sm)', fontSize: '0.8rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--d-accent)' }}>Next step:</span> {deal.nextStep}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--d-content-gap)' }}>
        {/* Timeline */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <SectionLabel style={{ marginBottom: '0.875rem' }}>Timeline</SectionLabel>
          <ActivityFeed events={activityEvents.slice(0, 6)} />
        </div>

        {/* Contact & details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {contact && (
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <SectionLabel style={{ marginBottom: '0.875rem' }}>Primary Contact</SectionLabel>
              <Link to={`/contacts/${contact.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'var(--d-text)' }}>
                <div className="crm-avatar" style={{ width: 36, height: 36, fontSize: '0.75rem' }}>{contact.avatar}</div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{contact.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>{contact.title}</div>
                </div>
              </Link>
            </div>
          )}

          {/* Deal fields */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <SectionLabel style={{ marginBottom: '0.875rem' }}>Details</SectionLabel>
            <dl style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.825rem' }}>
              {[
                ['Stage', deal.stage],
                ['Owner', deal.owner],
                ['Value', `$${deal.value.toLocaleString()}`],
                ['Probability', `${deal.probability}%`],
                ['Close Date', deal.closeDate],
                ['Created', deal.created],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <dt style={{ color: 'var(--d-text-muted)' }}>{k}</dt>
                  <dd style={{ textAlign: 'right', fontFamily: k === 'Value' || k === 'Probability' ? 'var(--d-font-mono)' : undefined, textTransform: k === 'Stage' ? 'capitalize' : undefined }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
