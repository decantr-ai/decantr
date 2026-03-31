import React from 'react';

interface ChatPortalShellProps {
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

export function ChatPortalShell({ sidebar, children }: ChatPortalShellProps) {
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        background: 'var(--d-bg)',
      }}
    >
      {/* Left sidebar */}
      {sidebar && (
        <aside
          style={{
            width: 240,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--d-surface)',
            borderRight: '1px solid var(--d-border)',
            overflow: 'hidden',
          }}
        >
          {sidebar}
        </aside>
      )}

      {/* Main content */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        {children}
      </main>
    </div>
  );
}
