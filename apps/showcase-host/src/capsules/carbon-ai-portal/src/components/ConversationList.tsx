import { useLocation, Link } from 'react-router-dom';
import { MessageSquare, Pin } from 'lucide-react';
import { conversations } from '@/data/mock';

export function ConversationList() {
  const pinned = conversations.filter((c) => c.pinned);
  const recent = conversations.filter((c) => !c.pinned);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
      {pinned.length > 0 && (
        <Section label="Pinned" icon={<Pin size={11} />}>
          {pinned.map((c) => (
            <ConversationItem key={c.id} id={c.id} title={c.title} timestamp={c.timestamp} />
          ))}
        </Section>
      )}
      <Section label="Recent">
        {recent.map((c) => (
          <ConversationItem key={c.id} id={c.id} title={c.title} timestamp={c.timestamp} />
        ))}
      </Section>
    </div>
  );
}

function Section({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--d-text-muted)',
          padding: '0.375rem 0.625rem 0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
        }}
      >
        {icon}
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>{children}</div>
    </div>
  );
}

function ConversationItem({ id, title, timestamp }: { id: string; title: string; timestamp: string }) {
  const location = useLocation();
  const isActive = location.pathname === `/chat/${id}`;
  return (
    <Link
      to={`/chat/${id}`}
      className="carbon-conv-item"
      data-active={isActive ? 'true' : 'false'}
    >
      <MessageSquare size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
      <span
        style={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </span>
      <span
        className="mono-data"
        style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', flexShrink: 0 }}
      >
        {timestamp}
      </span>
    </Link>
  );
}
