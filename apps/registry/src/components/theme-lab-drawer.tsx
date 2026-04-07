'use client';

import { useEffect, useState, useRef } from 'react';
import { useThemeLab } from './theme-lab-provider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.decantr.ai/v1';

interface ThemeData {
  slug: string;
  namespace: string;
  name: string;
  description: string;
  seed: Record<string, string>;  // primary, accent, secondary, background
  colors: Record<string, string>; // full palette flattened to dark mode values
}

export function ThemeLabDrawer() {
  const { drawerOpen, closeDrawer, activeTheme, setActiveTheme } = useThemeLab();
  const [themes, setThemes] = useState<ThemeData[]>([]);
  const [loading, setLoading] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (drawerOpen && themes.length === 0) {
      setLoading(true);
      fetch(`${API_URL}/themes/lab`)
        .then((res) => res.json())
        .then((data) => {
          setThemes(data.items || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [drawerOpen, themes.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && drawerOpen) closeDrawer();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen, closeDrawer]);

  // Focus trap
  useEffect(() => {
    if (drawerOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [drawerOpen]);

  const palette = (theme: ThemeData) => {
    // Show seed colors first (primary, accent, secondary, background), then top palette colors
    const seedColors = Object.values(theme.seed);
    const paletteColors = Object.values(theme.colors).filter(c => !seedColors.includes(c));
    return [...seedColors, ...paletteColors].slice(0, 6);
  };

  return (
    <>
      <div
        className="lum-drawer-scrim"
        data-open={drawerOpen ? 'true' : 'false'}
        onClick={closeDrawer}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        className="lum-drawer"
        data-open={drawerOpen ? 'true' : 'false'}
        role="dialog"
        aria-label="Theme Lab"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #2E2E2E' }}>
          <span className="font-semibold text-sm" style={{ color: '#FAFAFA' }}>Theme Lab</span>
          <button
            onClick={closeDrawer}
            style={{ background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer', padding: '0.25rem' }}
            aria-label="Close drawer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ padding: '1rem 1.25rem' }} className="flex flex-col gap-3">
          {loading && <p className="text-sm" style={{ color: '#A1A1AA' }}>Loading themes...</p>}
          {!loading && themes.length === 0 && (
            <p className="text-sm" style={{ color: '#A1A1AA' }}>No themes available.</p>
          )}
          {themes.map((theme) => (
            <div
              key={theme.slug}
              className="lum-theme-card"
              data-active={activeTheme?.name === theme.name ? 'true' : 'false'}
              onClick={() => {
                // Map palette colors to CSS token variables
                const tokens: Record<string, string> = {};
                if (theme.seed.primary) tokens['--d-primary'] = theme.seed.primary;
                if (theme.seed.accent) tokens['--d-accent'] = theme.seed.accent;
                if (theme.seed.secondary) tokens['--d-secondary'] = theme.seed.secondary;
                if (theme.seed.background) tokens['--d-bg'] = theme.seed.background;
                if (theme.colors.surface) tokens['--d-surface'] = theme.colors.surface;
                if (theme.colors['surface-raised']) tokens['--d-surface-raised'] = theme.colors['surface-raised'];
                if (theme.colors.border) tokens['--d-border'] = theme.colors.border;
                if (theme.colors.text) tokens['--d-text'] = theme.colors.text;
                if (theme.colors['text-muted']) tokens['--d-text-muted'] = theme.colors['text-muted'];
                if (theme.colors.primary) tokens['--d-primary'] = theme.colors.primary;
                // Also map named colors
                if (theme.seed.primary) tokens['--d-primary-hover'] = theme.seed.primary;

                setActiveTheme({ name: theme.name, tokens });
              }}
            >
              <div className="font-medium text-sm" style={{ color: '#FAFAFA', marginBottom: '0.25rem' }}>
                {theme.name}
              </div>
              {theme.description && (
                <p className="text-xs" style={{ color: '#A1A1AA', marginBottom: '0.5rem' }}>
                  {theme.description}
                </p>
              )}
              <div className="lum-swatch-strip">
                {palette(theme).map((color, i) => (
                  <div key={i} className="lum-swatch" style={{ background: color }} />
                ))}
              </div>
            </div>
          ))}

          {activeTheme && (
            <button
              className="d-interactive"
              data-variant="ghost"
              onClick={() => setActiveTheme(null)}
              style={{ width: '100%', fontSize: '0.8125rem', color: '#A1A1AA' }}
            >
              Reset to default (Luminarum)
            </button>
          )}
        </div>
      </div>
    </>
  );
}
