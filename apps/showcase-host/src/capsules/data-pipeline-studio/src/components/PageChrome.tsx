export function PageChrome({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {/* Showcase chrome header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          background: '#0a0a0a',
          borderBottom: '1px solid #333',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <a
          href="/registry"
          style={{
            color: '#999',
            textDecoration: 'none',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span aria-hidden>&larr;</span>
          <span>decantr.ai</span>
        </a>
        <div
          style={{
            fontSize: 13,
            color: '#fafafa',
            padding: '6px 12px',
            border: '1px solid #333',
            borderRadius: 6,
          }}
        >
          Data Pipeline Studio
        </div>
      </header>

      <div style={{ height: 48, flexShrink: 0 }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}
