import { Phone, Mail, Calendar, StickyNote, Handshake, Sparkles } from 'lucide-react';
import type { ActivityEvent } from '@/data/mock';

const iconMap = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: StickyNote,
  deal: Handshake,
  ai: Sparkles,
};

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {events.map(e => {
        const Icon = iconMap[e.type];
        const isAi = e.type === 'ai';
        return (
          <div key={e.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{
              width: 28, height: 28, flexShrink: 0,
              borderRadius: 'var(--d-radius-full)',
              background: isAi
                ? 'linear-gradient(135deg, var(--d-accent), var(--d-primary))'
                : 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isAi ? '#fff' : 'var(--d-text-muted)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <Icon size={13} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 500 }}>{e.title}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', flexShrink: 0 }}>{e.time}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginTop: '0.125rem' }}>{e.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
