import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { ArrowRight } from 'lucide-react';
import { projects } from '../data/mock';

export function ProjectsPage() {
  return (
    <div>
      {/* Hero section */}
      <section
        className="d-section"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          paddingTop: '5rem',
          paddingBottom: '3rem',
          paddingLeft: '2rem',
          paddingRight: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="aura-orb aura-orb--pink" style={{ top: '-10%', right: '10%' }} />
        <div className="aura-orb aura-orb--purple" style={{ bottom: '5%', left: '5%', animationDelay: '-4s' }} />
        <div className="aura-orb aura-orb--cyan" style={{ top: '30%', left: '60%', animationDelay: '-8s' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '48rem' }}>
          <p className={css('_textsm _fontmedium') + ' d-label'} style={{ marginBottom: '1rem', letterSpacing: '0.15em' }}>
            CREATIVE DEVELOPER & DESIGNER
          </p>
          <h1
            className="d-gradient-text"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 600,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
            }}
          >
            Crafting Digital Experiences
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--d-text-muted)', maxWidth: '36rem', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            I build interfaces that feel as good as they look. Explore my work below.
          </p>
          <div className={css('_flex _center _gap4')} style={{ flexWrap: 'wrap' }}>
            <a
              href="#/about"
              className="d-interactive"
              data-variant="primary"
              style={{ padding: '0.75rem 2rem', fontSize: '1rem', borderRadius: 'var(--d-radius-lg)' }}
            >
              Explore My Work
              <ArrowRight size={18} />
            </a>
            <a
              href="#/contact"
              className="d-interactive"
              style={{ padding: '0.75rem 2rem', fontSize: '1rem', borderRadius: 'var(--d-radius-lg)' }}
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* Project grid */}
      <section className="d-section" style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <h2
            className={css('_fontmedium')}
            style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--d-text-muted)', marginBottom: '3rem' }}
          >
            Selected Work
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 400px), 1fr))',
              gap: '2rem',
            }}
          >
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <article
                  className="d-surface d-glass entrance-fade"
                  data-interactive
                  style={{
                    borderRadius: 'var(--d-radius-lg)',
                    overflow: 'hidden',
                    padding: 0,
                  }}
                >
                  <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease',
                      }}
                      onMouseEnter={(e) => { (e.target as HTMLImageElement).style.transform = 'scale(1.05)'; }}
                      onMouseLeave={(e) => { (e.target as HTMLImageElement).style.transform = 'scale(1)'; }}
                    />
                    <span
                      className="d-annotation"
                      style={{ position: 'absolute', top: '1rem', left: '1rem' }}
                    >
                      {project.category}
                    </span>
                  </div>
                  <div style={{ padding: 'var(--d-surface-p)' }}>
                    <h3 className={css('_fontsemi')} style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                      {project.title}
                    </h3>
                    <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
                      {project.description}
                    </p>
                    <div className={css('_flex _gap2')} style={{ marginTop: '1rem', flexWrap: 'wrap' }}>
                      {project.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="d-annotation" style={{ fontSize: '0.7rem' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
