'use client';

import React, { useState, useRef, useEffect } from 'react';
import { showcases, currentShowcase } from './showcase-registry';

export function ShowcaseChrome({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {/* Chrome header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          zIndex: 50,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          background: 'var(--d-bg, #0a0a0a)',
          borderBottom: '1px solid var(--d-border, #333)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Left: back link */}
        <a
          href="/registry"
          style={{
            color: 'var(--d-fg-muted, #999)',
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

        {/* Right: showcase switcher */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              background: 'transparent',
              border: '1px solid var(--d-border, #333)',
              borderRadius: 6,
              color: 'var(--d-fg, #fafafa)',
              fontSize: 13,
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {currentShowcase.name}
            <span style={{ fontSize: 10 }}>{'\u25BE'}</span>
          </button>

          {open && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                minWidth: 220,
                background: 'var(--d-surface, #1a1a1a)',
                border: '1px solid var(--d-border, #333)',
                borderRadius: 8,
                padding: 4,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              {showcases.map((s) => (
                <a
                  key={s.slug}
                  href={`/showcase/${s.slug}/`}
                  style={{
                    display: 'block',
                    padding: '8px 12px',
                    borderRadius: 6,
                    textDecoration: 'none',
                    color:
                      s.slug === currentShowcase.slug
                        ? 'var(--d-primary, #3b82f6)'
                        : 'var(--d-fg, #fafafa)',
                    background:
                      s.slug === currentShowcase.slug
                        ? 'rgba(59,130,246,0.1)'
                        : 'transparent',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--d-fg-muted, #999)',
                      marginTop: 2,
                    }}
                  >
                    {s.theme}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div style={{ height: 48, flexShrink: 0 }} />

      {/* Children fill remaining viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}
