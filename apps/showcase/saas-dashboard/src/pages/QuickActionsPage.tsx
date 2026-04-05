import { Link } from 'react-router-dom';
import {
  UserPlus, FolderPlus, Download, CreditCard, Key, Bell, Shield, Settings,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { quickActions } from '@/data/mock';

const iconMap: Record<string, React.ElementType> = {
  'user-plus': UserPlus,
  'folder-plus': FolderPlus,
  download: Download,
  'credit-card': CreditCard,
  key: Key,
  bell: Bell,
  shield: Shield,
  settings: Settings,
};

export function QuickActionsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Quick Actions"
        description="Common tasks across your workspace, one click away."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--d-content-gap)' }}>
        {quickActions.map(action => {
          const Icon = iconMap[action.icon] || Settings;
          return (
            <Link
              key={action.id}
              to={action.route}
              className="sd-card"
              style={{
                padding: 'var(--d-surface-p)',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--d-radius)',
                  background: 'color-mix(in srgb, var(--d-accent) 15%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={18} style={{ color: 'var(--d-accent)' }} />
                </div>
                <ArrowRight size={14} style={{ color: 'var(--d-text-muted)' }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{action.label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', lineHeight: 1.5 }}>
                  {action.description}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
