interface TimelineEntry {
  date: string;
  title: string;
  description: string;
}

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <div style={{ position: 'relative', paddingLeft: '2rem' }}>
      {/* Vertical line */}
      <div style={{
        position: 'absolute',
        left: 6,
        top: 8,
        bottom: 8,
        width: 2,
        background: 'var(--d-border)',
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {entries.map((entry, i) => (
          <div key={i} style={{ position: 'relative' }}>
            {/* Dot */}
            <div style={{
              position: 'absolute',
              left: '-2rem',
              top: 6,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: i === 0 ? 'var(--d-primary)' : 'var(--d-border)',
              border: '2px solid var(--d-bg)',
              transform: 'translateX(1px)',
            }} />
            <div className="d-label" style={{ marginBottom: '0.25rem', color: 'var(--d-accent)' }}>
              {entry.date}
            </div>
            <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
              {entry.title}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
              {entry.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
