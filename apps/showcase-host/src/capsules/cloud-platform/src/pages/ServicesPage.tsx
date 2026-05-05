import { Server, Database, HardDrive, Globe, Wifi, Shield, Layers, Cpu } from 'lucide-react';
import { cloudServices } from '@/data/mock';

const typeIcons: Record<string, React.ElementType> = {
  compute: Cpu, database: Database, storage: HardDrive, cdn: Globe,
  dns: Wifi, auth: Shield, queue: Layers, cache: Server,
};

export function ServicesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Services</h1>

      {/* Service Catalog Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--d-content-gap)' }}>
        {cloudServices.map(svc => {
          const Icon = typeIcons[svc.type] || Server;
          return (
            <div key={svc.id} className="lp-card-elevated" style={{ padding: 'var(--d-surface-p)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--d-radius)', background: 'var(--d-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} style={{ color: 'var(--d-primary)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{svc.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', textTransform: 'uppercase' }}>{svc.type}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="lp-status-dot" data-status={svc.status} />
                <span style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}>{svc.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                <span className="mono-data">{svc.uptime}% uptime</span>
                <span className="mono-data">{svc.latency}ms</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Service Topology Map */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
          Service Dependency Map
        </div>
        <div style={{ position: 'relative', minHeight: 360, padding: '1rem' }}>
          {/* SVG connections */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {cloudServices.filter(s => s.dependsOn.length > 0).map(svc => {
              const svcIdx = cloudServices.findIndex(s => s.id === svc.id);
              return svc.dependsOn.map(depId => {
                const depIdx = cloudServices.findIndex(s => s.id === depId);
                if (depIdx === -1) return null;
                // Simple grid layout: 4 columns
                const cols = 4;
                const cellW = 220;
                const cellH = 80;
                const x1 = (svcIdx % cols) * cellW + cellW / 2;
                const y1 = Math.floor(svcIdx / cols) * cellH + cellH / 2;
                const x2 = (depIdx % cols) * cellW + cellW / 2;
                const y2 = Math.floor(depIdx / cols) * cellH + cellH / 2;
                return (
                  <line
                    key={`${svc.id}-${depId}`}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="var(--d-border)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    opacity={0.6}
                  />
                );
              });
            })}
          </svg>
          {/* Nodes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', position: 'relative', zIndex: 1 }}>
            {cloudServices.map(svc => {
              const Icon = typeIcons[svc.type] || Server;
              return (
                <div key={svc.id} className="lp-topo-node" data-status={svc.status}>
                  <Icon size={14} style={{ color: 'var(--d-primary)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.75rem' }}>{svc.name}</div>
                    <div className="mono-data" style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>{svc.latency}ms</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
