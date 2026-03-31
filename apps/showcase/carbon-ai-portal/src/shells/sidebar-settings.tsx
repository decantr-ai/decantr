import React from 'react';
import { Link } from 'react-router-dom';
import { settingsSections } from '../mock-data';

interface SidebarSettingsShellProps {
  children: React.ReactNode;
  activeSection?: string;
}

export function SidebarSettingsShell({
  children,
  activeSection,
}: SidebarSettingsShellProps) {
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        background: 'var(--d-bg)',
      }}
    >
      {/* Settings sidebar */}
      <aside
        style={{
          width: 240,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--d-surface)',
          borderRight: '1px solid var(--d-border)',
          padding: '1.5rem 0',
        }}
      >
        <div
          style={{
            padding: '0 1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <h2
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--d-text)',
              marginBottom: '0.25rem',
            }}
          >
            Settings
          </h2>
          <p style={{ fontSize: 12, color: 'var(--d-text-muted)' }}>
            Manage your account
          </p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          {settingsSections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <Link
                key={section.id}
                to={`/settings/${section.id}`}
                style={{
                  display: 'block',
                  padding: '0.5rem 1.25rem',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--d-text)' : 'var(--d-text-muted)',
                  background: isActive
                    ? 'var(--d-surface-raised)'
                    : 'transparent',
                  borderLeft: isActive
                    ? '2px solid var(--d-primary)'
                    : '2px solid transparent',
                }}
              >
                {section.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main settings content */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          overflow: 'auto',
          padding: '2rem',
        }}
      >
        {children}
      </main>
    </div>
  );
}
