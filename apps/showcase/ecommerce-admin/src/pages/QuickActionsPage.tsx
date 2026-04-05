import { Link } from 'react-router-dom';
import {
  PlusSquare, Package, Truck, RefreshCcw, Download, Users, BarChart3, Settings,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { quickActions } from '@/data/mock';

const iconMap: Record<string, typeof PlusSquare> = {
  'plus-square': PlusSquare,
  'package': Package,
  'truck': Truck,
  'refresh-ccw': RefreshCcw,
  'download': Download,
  'users': Users,
  'bar-chart-3': BarChart3,
  'settings': Settings,
};

export function QuickActionsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Quick Actions"
        description="Jump into common store operator tasks."
      />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 'var(--d-content-gap)',
      }}>
        {quickActions.map(a => {
          const Icon = iconMap[a.icon] ?? PlusSquare;
          return (
            <Link
              key={a.id}
              to={a.route}
              className="ea-card"
              style={{
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                textDecoration: 'none',
                color: 'var(--d-text)',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--d-radius-sm)',
                background: 'color-mix(in srgb, var(--d-accent) 15%, var(--d-surface-raised))',
                color: 'var(--d-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} />
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{a.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{a.description}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
