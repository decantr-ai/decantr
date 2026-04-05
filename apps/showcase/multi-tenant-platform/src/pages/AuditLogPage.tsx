import { useState } from 'react';
import { Download, Filter } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { auditEvents, type AuditEvent } from '@/data/mock';

const typeFilters: { value: AuditEvent['type'] | 'all'; label: string }[] = [
  { value: 'all', label: 'All events' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'auth', label: 'Auth' },
  { value: 'api', label: 'API' },
  { value: 'billing', label: 'Billing' },
  { value: 'invite', label: 'Invite' },
];

export function AuditLogPage() {
  const [filter, setFilter] = useState<AuditEvent['type'] | 'all'>('all');
  const [query, setQuery] = useState('');

  const filtered = auditEvents.filter(e => {
    if (filter !== 'all' && e.type !== filter) return false;
    if (query && !`${e.actor} ${e.action} ${e.resource}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Audit Log"
        description="Complete history of administrative actions · 90-day retention"
        actions={
          <button className="d-interactive" style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}>
            <Download size={14} /> Export
          </button>
        }
      />

      {/* Filter bar */}
      <div className="d-surface" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Filter size={14} style={{ color: 'var(--d-text-muted)' }} />
        <input
          className="d-control"
          placeholder="Search actor, action, or resource..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ flex: 1, minWidth: 200, fontSize: '0.8rem' }}
        />
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {typeFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="d-interactive"
              data-variant="ghost"
              style={{
                fontSize: '0.7rem', padding: '0.35rem 0.6rem',
                background: filter === f.value ? 'color-mix(in srgb, var(--d-primary) 15%, transparent)' : undefined,
                color: filter === f.value ? 'var(--d-primary)' : undefined,
                border: filter === f.value ? '1px solid var(--d-primary)' : undefined,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trail */}
      <div className="d-surface" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--d-text-muted)', fontSize: '0.85rem' }}>
            No events match your filters.
          </div>
        ) : (
          <div>
            {filtered.map((e, i) => (
              <div
                key={e.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 24px 1fr 140px',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  alignItems: 'center',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--d-border)' : undefined,
                  fontSize: '0.8rem',
                }}
              >
                <span className="mono-data" style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{e.timestamp}</span>
                <span className="lp-event-dot" data-type={e.type} style={{ justifySelf: 'center' }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: 'var(--d-text)' }}>
                    <span style={{ fontWeight: 600 }}>{e.actor}</span>
                    <span style={{ color: 'var(--d-text-muted)' }}> {e.action} </span>
                    <span className="mono-data" style={{ color: 'var(--d-primary)' }}>{e.resource}</span>
                  </div>
                  <div className="mono-data" style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)', marginTop: 2 }}>
                    {e.resourceType} · {e.ip}
                  </div>
                </div>
                <span className="d-annotation" style={{ fontSize: '0.6rem', textTransform: 'capitalize', justifySelf: 'end' }}>
                  {e.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
        <span>Showing {filtered.length} of {auditEvents.length} events</span>
        <span>Retention: 90 days · Storage: 18.4 GB</span>
      </div>
    </div>
  );
}
