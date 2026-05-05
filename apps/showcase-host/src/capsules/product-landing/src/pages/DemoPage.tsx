import { css } from '@decantr/css';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Play, Monitor, Smartphone, Tablet,
  Palette, Code2, Layers, Zap, Sparkles, Eye,
} from 'lucide-react';
import { useState } from 'react';

const DEMO_FEATURES = [
  { icon: Palette, title: 'Design Intelligence', desc: 'AI-powered design system that adapts to your brand identity and generates consistent tokens automatically.', color: '#FE4474' },
  { icon: Code2, title: 'Code Generation', desc: 'Production-ready components generated from your design spec with full type safety and accessibility.', color: '#0AF3EB' },
  { icon: Layers, title: 'Component Library', desc: 'Pre-built composable patterns that snap together. Every component respects your design tokens.', color: '#FDA303' },
  { icon: Zap, title: 'Instant Preview', desc: 'See changes in real-time as you modify your design spec. Hot reload across all breakpoints.', color: '#00E0AB' },
  { icon: Eye, title: 'Visual Regression', desc: 'Automated visual testing catches unintended changes before they reach production.', color: '#FC8D0D' },
  { icon: Sparkles, title: 'AI Suggestions', desc: 'Smart recommendations for layout improvements, accessibility fixes, and performance optimizations.', color: '#6500C6' },
];

export function DemoPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const viewIcons = [
    { id: 'desktop' as const, icon: Monitor, label: 'Desktop' },
    { id: 'tablet' as const, icon: Tablet, label: 'Tablet' },
    { id: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
  ];

  return (
    <div>
      {/* ── Demo Hero ── */}
      <section
        className="d-section lum-orbs"
        style={{
          padding: '8rem 2rem 5rem',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
        }}
        role="banner"
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 50% 30%, color-mix(in srgb, var(--d-accent) 10%, transparent) 0%, transparent 50%)`,
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
          <div
            className="d-annotation"
            style={{
              display: 'inline-flex',
              marginBottom: '1.5rem',
              background: 'color-mix(in srgb, var(--d-primary) 12%, transparent)',
              color: 'var(--d-primary)',
              border: '1px solid color-mix(in srgb, var(--d-primary) 30%, transparent)',
              padding: '0.25rem 0.75rem',
              fontSize: '0.8125rem',
            }}
          >
            <Play size={12} /> Interactive Demo
          </div>

          <h1
            className={css('_fontbold')}
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
            }}
          >
            See Lumi in Action
          </h1>

          <p
            className={css('_textlg')}
            style={{
              color: 'var(--d-text-muted)',
              lineHeight: 1.7,
              maxWidth: 560,
              margin: '0 auto 2rem',
            }}
          >
            Explore how design intelligence transforms your workflow from concept
            to production-ready application.
          </p>

          {/* Viewport switcher */}
          <div className={css('_flex _aic _jcc _gap1')} style={{ marginBottom: '2rem' }}>
            {viewIcons.map(v => (
              <button
                key={v.id}
                className="d-interactive"
                data-variant={activeView === v.id ? 'primary' : 'ghost'}
                onClick={() => setActiveView(v.id)}
                style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                aria-label={v.label}
              >
                <v.icon size={16} /> {v.label}
              </button>
            ))}
          </div>

          {/* Demo viewport */}
          <div
            className="lum-glass"
            style={{
              maxWidth: activeView === 'mobile' ? 375 : activeView === 'tablet' ? 768 : '100%',
              margin: '0 auto',
              borderRadius: 'var(--d-radius-xl)',
              overflow: 'hidden',
              transition: 'max-width 400ms ease',
            }}
          >
            {/* Browser chrome */}
            <div
              className={css('_flex _aic _gap3')}
              style={{
                padding: '0.75rem 1rem',
                background: 'var(--d-surface-raised)',
                borderBottom: '1px solid var(--d-border)',
              }}
            >
              <div className={css('_flex _gap2')}>
                {['#EF4444', '#F59E0B', '#22C55E'].map(c => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
                ))}
              </div>
              <div
                style={{
                  flex: 1,
                  height: 28,
                  background: 'var(--d-surface)',
                  borderRadius: 'var(--d-radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 0.75rem',
                  fontSize: '0.75rem',
                  color: 'var(--d-text-muted)',
                }}
              >
                app.lumi.dev
              </div>
            </div>

            {/* Simulated app */}
            <div
              style={{
                background: 'var(--d-bg)',
                padding: '1.5rem',
                minHeight: 320,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div className={css('_flex _jcsb _aic')}>
                <div style={{ height: 16, width: 80, background: 'var(--d-surface-raised)', borderRadius: 4 }} />
                <div className={css('_flex _gap2')}>
                  <div style={{ height: 28, width: 60, background: 'var(--d-surface)', borderRadius: 'var(--d-radius-sm)' }} />
                  <div style={{ height: 28, width: 60, background: 'var(--d-primary)', borderRadius: 'var(--d-radius-sm)', opacity: 0.8 }} />
                </div>
              </div>
              <div style={{ height: 1, background: 'var(--d-border)' }} />
              <div className={css('_grid _gap3')} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {[
                  { bg: 'var(--d-primary)', opacity: 0.15 },
                  { bg: 'var(--d-accent)', opacity: 0.15 },
                  { bg: 'var(--d-secondary, #0AF3EB)', opacity: 0.15 },
                ].map((card, i) => (
                  <div
                    key={i}
                    style={{
                      background: `color-mix(in srgb, ${card.bg} ${card.opacity * 100}%, transparent)`,
                      borderRadius: 'var(--d-radius)',
                      padding: '1rem',
                      border: `1px solid color-mix(in srgb, ${card.bg} 20%, transparent)`,
                    }}
                  >
                    <div style={{ height: 8, width: '50%', background: card.bg, borderRadius: 4, opacity: 0.6, marginBottom: 8 }} />
                    <div style={{ height: 6, width: '80%', background: 'var(--d-border)', borderRadius: 3, marginBottom: 4 }} />
                    <div style={{ height: 6, width: '60%', background: 'var(--d-border)', borderRadius: 3 }} />
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, background: 'var(--d-surface)', borderRadius: 'var(--d-radius)', minHeight: 100, border: '1px solid var(--d-border)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Demo Features ── */}
      <section
        className="d-section"
        style={{ padding: 'var(--d-section-py) 1.5rem' }}
        role="region"
        aria-label="Demo features"
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="d-label" style={{ textAlign: 'center', color: 'var(--d-accent)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>FEATURES</p>
          <h2 className={css('_fontsemi _textc')} style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
            Powered by Design Intelligence
          </h2>
          <p className={css('_textsm _textc')} style={{ color: 'var(--d-text-muted)', maxWidth: 500, margin: '0 auto 3rem' }}>
            Every tool you need to go from idea to production in record time.
          </p>

          <div className={css('_grid _gap6')} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {DEMO_FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="lum-card-outlined"
                style={{
                  '--card-color': f.color,
                  padding: 'var(--d-surface-p)',
                  transition: 'transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
                } as React.CSSProperties}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '0.5rem',
                    background: `color-mix(in srgb, ${f.color} 12%, transparent)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className={css('_fontsemi')} style={{ marginBottom: '0.5rem' }}>{f.title}</h3>
                <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className={css('_flex _jcc')} style={{ marginTop: '3rem' }}>
            <button
              className="d-interactive lum-btn-glow"
              data-variant="primary"
              onClick={() => navigate('/')}
              style={{
                fontSize: '1rem',
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, var(--d-primary), color-mix(in srgb, var(--d-primary) 80%, var(--d-accent)))',
                border: 'none',
              }}
            >
              Get Started Free <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
