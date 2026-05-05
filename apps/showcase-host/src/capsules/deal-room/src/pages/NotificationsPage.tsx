import { Bell, FileText, MessageCircle, Briefcase, Users } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { notifications } from '@/data/mock';

const typeIcons: Record<string, typeof Bell> = {
  document: FileText, qa: MessageCircle, deal: Briefcase, investor: Users,
};

export function NotificationsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader title="Notifications" description="Stay informed about deal room activity." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {notifications.map(n => {
          const Icon = typeIcons[n.type] || Bell;
          return (
            <div
              key={n.id}
              className="dr-card"
              style={{
                padding: '1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                opacity: n.read ? 0.7 : 1,
                borderLeft: n.read ? undefined : '3px solid var(--d-primary)',
              }}
            >
              <Icon size={18} style={{ color: 'var(--d-primary)', marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: n.read ? 400 : 600 }}>{n.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginTop: 2 }}>{n.description}</div>
              </div>
              <span className="mono-data" style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)', flexShrink: 0 }}>{n.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
