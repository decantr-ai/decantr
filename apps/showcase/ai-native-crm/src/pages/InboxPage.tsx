import { useState } from 'react';
import { Sparkles, Mail, Reply } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { emails } from '@/data/mock';

const categoryColors: Record<string, string> = {
  prospecting: 'var(--d-primary)',
  negotiation: 'var(--d-warning)',
  support: 'var(--d-secondary)',
  internal: 'var(--d-text-muted)',
};

export function InboxPage() {
  const [selectedId, setSelectedId] = useState(emails[0].id);
  const selected = emails.find(e => e.id === selectedId) ?? emails[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 136px)' }}>
      <PageHeader
        title="Inbox"
        description={`${emails.filter(e => !e.read).length} unread · AI categorization active`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1rem', flex: 1, minHeight: 0 }}>
        {/* List */}
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <SectionLabel>Messages</SectionLabel>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {emails.map(e => (
              <button
                key={e.id}
                onClick={() => setSelectedId(e.id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '0.875rem 1rem',
                  background: selectedId === e.id ? 'rgba(167, 139, 250, 0.08)' : 'transparent',
                  borderLeft: selectedId === e.id ? '2px solid var(--d-accent)' : '2px solid transparent',
                  borderTop: 'none', borderRight: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer', color: 'var(--d-text)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    {!e.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--d-accent)', flexShrink: 0 }} />}
                    <span style={{ fontSize: '0.825rem', fontWeight: e.read ? 400 : 600 }}>{e.from}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{e.time}</span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: e.read ? 400 : 500, marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.subject}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.375rem' }}>{e.preview}</div>
                <span style={{
                  fontSize: '0.65rem', padding: '0.1rem 0.5rem',
                  background: `color-mix(in srgb, ${categoryColors[e.category]} 15%, transparent)`,
                  color: categoryColors[e.category],
                  borderRadius: 'var(--d-radius-full)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em',
                }}>{e.category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="crm-avatar" style={{ width: 36, height: 36, fontSize: '0.75rem' }}>
              {selected.from.split(' ').map(s => s[0]).join('')}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{selected.from}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>{selected.fromEmail} → {selected.to}</div>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>{selected.time}</span>
          </div>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem' }}>{selected.subject}</h2>

          {selected.aiSummary && (
            <div style={{
              padding: '0.75rem 1rem', marginBottom: '1.25rem',
              background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.08), rgba(96, 165, 250, 0.04))',
              border: '1px solid rgba(167, 139, 250, 0.2)',
              borderRadius: 'var(--d-radius-sm)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                <Sparkles size={12} style={{ color: 'var(--d-accent)' }} />
                <span style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--d-accent)' }}>AI Summary</span>
              </div>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>{selected.aiSummary}</p>
            </div>
          )}

          <div style={{ fontSize: '0.875rem', lineHeight: 1.65, whiteSpace: 'pre-wrap', color: 'var(--d-text)' }}>
            {selected.body || <span style={{ color: 'var(--d-text-muted)' }}>No message body.</span>}
          </div>

          {selected.aiSuggestedReply && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                <Sparkles size={12} style={{ color: 'var(--d-accent)' }} />
                <span className="d-label" style={{ fontSize: '0.65rem' }}>AI Suggested Reply</span>
              </div>
              <div style={{
                padding: '0.875rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px dashed rgba(167, 139, 250, 0.3)',
                borderRadius: 'var(--d-radius-sm)',
                fontSize: '0.825rem', lineHeight: 1.5, fontStyle: 'italic',
                color: 'var(--d-text-muted)',
              }}>
                {selected.aiSuggestedReply}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button className="crm-button-accent" style={{ fontSize: '0.78rem', padding: '0.4rem 0.875rem' }}>
                  <Reply size={13} /> Use reply
                </button>
                <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.78rem', padding: '0.4rem 0.875rem' }}>
                  <Sparkles size={13} /> Regenerate
                </button>
                <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.78rem', padding: '0.4rem 0.875rem' }}>
                  <Mail size={13} /> Write manually
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
