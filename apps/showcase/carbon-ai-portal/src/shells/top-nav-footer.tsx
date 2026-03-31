import React from 'react';
import { Link } from 'react-router-dom';
import { topNavItems } from '../mock-data';

interface TopNavFooterShellProps {
  children: React.ReactNode;
}

export function TopNavFooterShell({ children }: TopNavFooterShellProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 48px)',
        background: 'var(--d-bg)',
      }}
    >
      {/* Top navigation bar */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          height: 64,
          borderBottom: '1px solid var(--d-border)',
          background: 'var(--d-surface)',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--d-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--d-radius-sm)',
              background: 'var(--d-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              color: '#18181B',
            }}
          >
            C
          </span>
          Carbon AI
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {topNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                fontSize: 14,
                color: 'var(--d-text-muted)',
                fontWeight: 500,
              }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/login"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#18181B',
              background: 'var(--d-primary)',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--d-radius)',
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--d-border)',
          background: 'var(--d-surface)',
          padding: '3rem 2rem 2rem',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2rem',
          }}
        >
          {/* Column 1: Brand */}
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--d-text)',
                marginBottom: '1rem',
              }}
            >
              Carbon AI
            </div>
            <p
              style={{
                fontSize: 13,
                color: 'var(--d-text-muted)',
                lineHeight: 1.6,
              }}
            >
              AI-powered developer assistant that understands your codebase.
            </p>
          </div>

          {/* Column 2: Product */}
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--d-text)',
                marginBottom: '0.75rem',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
              }}
            >
              Product
            </div>
            {['Features', 'Pricing', 'Docs', 'Changelog'].map((label) => (
              <div key={label} style={{ marginBottom: '0.5rem' }}>
                <span
                  style={{
                    fontSize: 13,
                    color: 'var(--d-text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Column 3: Company */}
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--d-text)',
                marginBottom: '0.75rem',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
              }}
            >
              Company
            </div>
            {[
              { label: 'About', path: '/about' },
              { label: 'Contact', path: '/contact' },
              { label: 'Careers', path: '#' },
            ].map((item) => (
              <div key={item.label} style={{ marginBottom: '0.5rem' }}>
                <Link
                  to={item.path}
                  style={{ fontSize: 13, color: 'var(--d-text-muted)' }}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Column 4: Legal */}
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--d-text)',
                marginBottom: '0.75rem',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
              }}
            >
              Legal
            </div>
            {[
              { label: 'Privacy Policy', path: '/privacy' },
              { label: 'Terms of Service', path: '/terms' },
              { label: 'Cookie Policy', path: '/cookies' },
            ].map((item) => (
              <div key={item.label} style={{ marginBottom: '0.5rem' }}>
                <Link
                  to={item.path}
                  style={{ fontSize: 13, color: 'var(--d-text-muted)' }}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--d-border)',
            textAlign: 'center' as const,
            fontSize: 12,
            color: 'var(--d-text-muted)',
          }}
        >
          &copy; 2026 Carbon AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
