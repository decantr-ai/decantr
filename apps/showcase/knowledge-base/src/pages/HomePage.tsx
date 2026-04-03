import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Zap, Globe, Code, Sparkles } from 'lucide-react';

const features = [
  { icon: Search, title: 'AI-Powered Search', description: 'Semantic search understands natural language queries and surfaces the most relevant results with highlighted excerpts.' },
  { icon: BookOpen, title: 'Three-Column Browser', description: 'Navigate complex documentation with a folder tree, article list, and content preview -- all visible at once.' },
  { icon: Zap, title: 'Instant Loading', description: 'Static generation and smart caching deliver sub-100ms page loads for every article in your knowledge base.' },
  { icon: Code, title: 'Interactive API Docs', description: 'Try-it-out console for API endpoints with multi-language code snippets and live response previews.' },
  { icon: Globe, title: 'Internationalization', description: 'Serve documentation in multiple languages with automatic locale detection and RTL layout support.' },
  { icon: Sparkles, title: 'Paper Theme', description: 'Warm, reading-optimized typography with a 65-75 character measure. Feels like a well-designed textbook.' },
];

export function HomePage() {
  return (
    <div className="paper-fade">
      {/* Hero */}
      <section
        className="d-section"
        style={{
          textAlign: 'center',
          padding: '5rem 1.5rem',
          background: 'radial-gradient(ellipse at top center, color-mix(in srgb, var(--d-primary) 6%, transparent) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, color-mix(in srgb, var(--d-accent) 4%, transparent) 0%, transparent 50%)',
        }}
      >
        <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
          <div className="d-annotation" data-status="info" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
            <Sparkles size={12} />
            Version 3.0 is here
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 600, lineHeight: 1.15, marginBottom: '1.25rem', color: 'var(--d-text)' }}>
            Documentation that your readers will <span style={{ color: 'var(--d-primary)' }}>love</span>
          </h1>
          <p style={{ fontSize: '1.125rem', lineHeight: 1.7, color: 'var(--d-text-muted)', maxWidth: '36rem', margin: '0 auto 2rem' }}>
            A warm, reading-optimized knowledge base platform with AI-powered search, interactive API docs, and a three-column browser that makes navigation effortless.
          </p>
          <div className={css('_flex _center _gap3')} style={{ flexWrap: 'wrap' }}>
            <Link
              to="/login"
              className="d-interactive"
              data-variant="primary"
              style={{ padding: '0.625rem 1.5rem', textDecoration: 'none' }}
            >
              Explore the Docs
            </Link>
            <Link
              to="/changelog"
              className="d-interactive"
              data-variant="ghost"
              style={{ padding: '0.625rem 1.5rem', textDecoration: 'none' }}
            >
              Read the Changelog
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        className="d-section"
        role="region"
        aria-label="Features"
        style={{ padding: 'var(--d-section-py) 1.5rem', background: 'var(--d-surface)' }}
      >
        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="d-label" style={{ textAlign: 'center', letterSpacing: '0.1em', color: 'var(--d-accent)', marginBottom: '0.75rem' }}>CAPABILITIES</p>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Everything you need to build world-class docs
            </h2>
            <p style={{ color: 'var(--d-text-muted)', maxWidth: '32rem', margin: '0 auto' }}>
              Powerful features that work together to create a seamless documentation experience.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
            {features.map((f) => (
              <div
                key={f.title}
                className="paper-card"
                style={{
                  padding: 'var(--d-surface-p)',
                  transition: 'transform 200ms ease, border-color 200ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--d-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--d-border)'; }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--d-radius-lg)',
                    background: 'color-mix(in srgb, var(--d-accent) 10%, transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <f.icon size={22} style={{ color: 'var(--d-accent)' }} />
                </div>
                <h3 style={{ fontWeight: 500, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="d-section"
        style={{
          padding: 'var(--d-section-py) 1.5rem',
          textAlign: 'center',
          background: 'linear-gradient(180deg, var(--d-bg), color-mix(in srgb, var(--d-primary) 4%, var(--d-bg)))',
        }}
      >
        <div style={{ maxWidth: '40rem', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Ready to explore?
          </h2>
          <p style={{ color: 'var(--d-text-muted)', marginBottom: '2rem', maxWidth: '32rem', margin: '0 auto 2rem' }}>
            Dive into the documentation, try the interactive API reference, or browse the changelog to see what is new.
          </p>
          <div className={css('_flex _center _gap3')} style={{ flexWrap: 'wrap' }}>
            <Link
              to="/login"
              className="d-interactive"
              data-variant="primary"
              style={{ padding: '0.625rem 1.5rem', textDecoration: 'none' }}
            >
              Learn More
            </Link>
            <a
              href="#"
              className="d-interactive"
              data-variant="ghost"
              style={{ padding: '0.625rem 1.5rem', textDecoration: 'none' }}
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
