import { css } from '@decantr/css';
import { BookOpen, Layers, Feather, Rss, ArrowRight } from 'lucide-react';
import { testimonials, author } from '../data/mock';

const features = [
  { icon: Feather, title: 'Long-Form Essays', description: 'Carefully researched writing on design, engineering, and the craft of building for the web.' },
  { icon: Layers, title: 'Design Systems', description: 'Practical guides on tokens, components, and the architecture of visual consistency at scale.' },
  { icon: BookOpen, title: 'Typography', description: 'Deep explorations of type on screen — measure, hierarchy, and the art of making text readable.' },
  { icon: Rss, title: 'Weekly Newsletter', description: 'Curated links, behind-the-scenes notes, and short reflections delivered every Friday morning.' },
];

export function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="d-section" style={{ textAlign: 'center', maxWidth: '48rem', margin: '0 auto', padding: 'var(--d-section-py) 1.5rem' }}>
        <p className="editorial-caption" style={{ marginBottom: '1rem', color: 'var(--d-accent)' }}>
          Independent writing on design & engineering
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 600, lineHeight: 1.1, marginBottom: '1.5rem' }}>
          Ideas worth reading slowly
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--d-text-muted)', lineHeight: 1.7, maxWidth: '36rem', margin: '0 auto 2rem' }}>
          The Paragraph is a publication by {author.name} exploring design systems, web typography, and the quiet craft of building thoughtful interfaces.
        </p>
        <div className={css('_flex _center _gap3')} style={{ fontFamily: 'system-ui, sans-serif' }}>
          <a href="#/subscribe" className="d-interactive" data-variant="primary" style={{ textDecoration: 'none' }}>
            Subscribe
            <ArrowRight size={16} />
          </a>
          <a href="#/articles" className="d-interactive" style={{ textDecoration: 'none' }}>
            Browse Articles
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="d-section" style={{ padding: 'var(--d-section-py) 1.5rem' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
          <p className="editorial-caption" style={{ textAlign: 'center', marginBottom: '0.75rem', color: 'var(--d-accent)' }}>
            What we cover
          </p>
          <h2 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 600, marginBottom: '3rem' }}>
            Writing for builders
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {features.map((f) => (
              <div key={f.title} className="editorial-card" style={{ borderRadius: 'var(--d-radius)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--d-radius-sm)', background: 'var(--d-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <f.icon size={20} style={{ color: 'var(--d-accent)' }} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'system-ui, sans-serif' }}>{f.title}</h3>
                <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6, fontFamily: 'system-ui, sans-serif' }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="d-section" style={{ padding: 'var(--d-section-py) 1.5rem', background: 'var(--d-surface-raised)' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
          <p className="editorial-caption" style={{ textAlign: 'center', marginBottom: '0.75rem', color: 'var(--d-accent)' }}>
            Readers
          </p>
          <h2 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 600, marginBottom: '3rem' }}>
            What subscribers say
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {testimonials.map((t) => (
              <div key={t.name} className="editorial-card" style={{ borderRadius: 'var(--d-radius)', background: 'var(--d-surface)' }}>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '1.25rem', fontStyle: 'italic' }}>
                  "{t.quote}"
                </p>
                <div className={css('_flex _aic _gap3')}>
                  <img
                    src={t.avatar}
                    alt={t.name}
                    style={{ width: 40, height: 40, borderRadius: 'var(--d-radius-full)', objectFit: 'cover' }}
                  />
                  <div>
                    <p className={css('_textsm _fontsemi')} style={{ fontFamily: 'system-ui, sans-serif' }}>{t.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="d-section" style={{ padding: 'var(--d-section-py) 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '32rem', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Read something worth your time
          </h2>
          <p style={{ color: 'var(--d-text-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
            Join {author.subscribers.toLocaleString()} readers who get a curated essay in their inbox every Friday. No spam, no fluff.
          </p>
          <div className={css('_flex _center _gap3')} style={{ fontFamily: 'system-ui, sans-serif' }}>
            <a href="#/register" className="d-interactive" data-variant="primary" style={{ textDecoration: 'none' }}>
              Subscribe Free
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
