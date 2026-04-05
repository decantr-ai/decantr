import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Paperclip, MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { maintenanceTickets } from '@/data/mock';

const comments = [
  { id: 'c1', author: 'Jamie Thornton', avatar: 'JT', body: 'The drip started yesterday evening. Placed a bowl underneath for now.', time: '12m ago' },
  { id: 'c2', author: 'David Park', avatar: 'DP', body: 'Thanks for reporting. Sending a plumber today between 10am-1pm.', time: '8m ago' },
];

export function MaintenanceTicketPage() {
  const { id } = useParams();
  const ticket = maintenanceTickets.find(t => t.id === id) ?? maintenanceTickets[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
        <Link to="/maintenance" style={{ color: 'var(--d-accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <ArrowLeft size={13} /> Back to board
        </Link>
      </div>

      <PageHeader
        title={ticket.title}
        description={`${ticket.number} · ${ticket.propertyName} · Unit ${ticket.unitNumber}`}
        actions={
          <>
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
            <SectionLabel style={{ marginBottom: '0.75rem' }}>Description</SectionLabel>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.65 }}>{ticket.description}</p>
            <div style={{ marginTop: '1rem', padding: '0.875rem', background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius-sm)', display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.825rem', color: 'var(--d-text-muted)' }}>
              <Paperclip size={14} />
              kitchen-sink-leak.jpg · 218 KB
            </div>
          </div>

          <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
            <SectionLabel style={{ marginBottom: '0.875rem' }}>Activity</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: '0.625rem' }}>
                  <div className="pm-avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>{c.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.author}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{c.time}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{c.body}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pm-divider" />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input className="d-control" placeholder="Add a comment..." style={{ fontSize: '0.85rem' }} />
              <button className="pm-button-primary" style={{ padding: '0.5rem 0.875rem', fontSize: '0.825rem' }}>
                <MessageSquare size={13} /> Send
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
            <SectionLabel style={{ marginBottom: '0.875rem' }}>Details</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.825rem' }}>
              <div>
                <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</div>
                <div style={{ marginTop: '0.25rem' }}>{ticket.category}</div>
              </div>
              <div>
                <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resident</div>
                <div style={{ marginTop: '0.25rem' }}>{ticket.tenantName}</div>
              </div>
              <div>
                <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assignee</div>
                <div style={{ marginTop: '0.25rem' }}>{ticket.assignee ?? <span style={{ color: 'var(--d-text-muted)' }}>Unassigned</span>}</div>
              </div>
              <div>
                <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submitted</div>
                <div style={{ marginTop: '0.25rem' }}>{ticket.submitted}</div>
              </div>
              <div>
                <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last updated</div>
                <div style={{ marginTop: '0.25rem' }}>{ticket.updated}</div>
              </div>
            </div>
          </div>

          <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
            <SectionLabel style={{ marginBottom: '0.875rem' }}>Actions</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="pm-button-primary" style={{ justifyContent: 'center', fontSize: '0.825rem' }}>Mark in progress</button>
              <button className="d-interactive" style={{ justifyContent: 'center', fontSize: '0.825rem' }}>Reassign</button>
              <button className="d-interactive" style={{ justifyContent: 'center', fontSize: '0.825rem' }}>Mark resolved</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
