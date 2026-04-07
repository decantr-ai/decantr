interface ResponsiveBreakpoints {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}

interface Props {
  responsive?: ResponsiveBreakpoints;
}

const BREAKPOINTS = [
  {
    key: 'mobile' as const,
    label: 'Mobile',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    key: 'tablet' as const,
    label: 'Tablet',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    key: 'desktop' as const,
    label: 'Desktop',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
];

export function ResponsiveCard({ responsive }: Props) {
  if (!responsive) return null;

  const hasData = Object.values(responsive).some(Boolean);
  if (!hasData) return null;

  return (
    <div
      className="lum-bento-card flex flex-col gap-3"
      role="region"
      aria-label="Responsive behavior"
    >
      <h3 className="d-label accent-left-border">Responsive</h3>
      <div className="flex flex-col gap-3">
        {BREAKPOINTS.map(({ key, label, icon }) => {
          const text = responsive[key];
          if (!text) return null;
          return (
            <div key={key} className="flex items-start gap-2">
              <span className="text-d-muted shrink-0 mt-0.5">{icon}</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-d-text">{label}</span>
                <span className="text-xs text-d-muted line-clamp-2">{text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
