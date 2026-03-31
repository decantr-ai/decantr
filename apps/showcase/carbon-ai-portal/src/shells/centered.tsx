import React from 'react';

interface CenteredShellProps {
  children: React.ReactNode;
}

export function CenteredShell({ children }: CenteredShellProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 48px)',
        background: 'var(--d-bg)',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--d-surface)',
          border: '1px solid var(--d-border)',
          borderRadius: 'var(--d-radius-lg)',
          padding: '2rem',
          boxShadow: 'var(--d-shadow-lg)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
