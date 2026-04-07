import { BentoCard } from './bento-card';

interface ResponsiveInfo {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}

interface ResponsiveCardProps {
  responsive?: ResponsiveInfo;
}

function DeviceIcon({ device }: { device: 'mobile' | 'tablet' | 'desktop' }) {
  if (device === 'mobile') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--d-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    );
  }
  if (device === 'tablet') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--d-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--d-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

export function ResponsiveCard({ responsive }: ResponsiveCardProps) {
  if (!responsive) return null;

  const breakpoints = [
    { key: 'mobile' as const, label: 'Mobile', text: responsive.mobile },
    { key: 'tablet' as const, label: 'Tablet', text: responsive.tablet },
    { key: 'desktop' as const, label: 'Desktop', text: responsive.desktop },
  ].filter((bp) => bp.text);

  if (breakpoints.length === 0) return null;

  return (
    <BentoCard span={1} label="Responsive">
      <p className="d-label mb-3">Responsive</p>
      <div className="flex flex-col gap-3">
        {breakpoints.map((bp) => (
          <div key={bp.key} className="flex items-start gap-2">
            <DeviceIcon device={bp.key} />
            <div className="min-w-0">
              <p className="text-xs font-medium text-d-text">{bp.label}</p>
              <p className="text-xs text-d-muted line-clamp-2">{bp.text}</p>
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
