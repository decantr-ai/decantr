export function PageChrome({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
          background: '#0a0a12',
          borderBottom: '1px solid #332E80',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <a
          href="/registry"
          style={{
            color: '#A5B4FC',
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
            color: '#E0E7FF',
            padding: '6px 12px',
            border: '1px solid #4338CA',
            borderRadius: 6,
          }}
        >
          Producer Studio
        </div>
      </header>
      <div style={{ height: 48, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}
