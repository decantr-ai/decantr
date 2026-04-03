import { useParams, Link, Navigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { ArrowLeft, Calendar, User, Building2 } from 'lucide-react';
import { projects } from '../data/mock';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div>
      {/* Project hero — full-bleed */}
      <section
        style={{
          position: 'relative',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
        }}
      >
        <img
          src={project.gallery[0]}
          alt={project.title}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, var(--d-bg) 0%, rgba(24,24,27,0.6) 50%, rgba(24,24,27,0.3) 100%)',
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            padding: '3rem 2rem',
            maxWidth: '64rem',
            margin: '0 auto',
          }}
        >
          <Link
            to="/projects"
            className={css('_flex _aic _gap2 _textsm')}
            style={{ color: 'var(--d-text-muted)', textDecoration: 'none', marginBottom: '2rem', display: 'inline-flex' }}
          >
            <ArrowLeft size={16} />
            Back to Projects
          </Link>
          <span className="d-annotation" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
            {project.category}
          </span>
          <h1
            className="d-gradient-text"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 600, lineHeight: 1.1, marginTop: '0.75rem' }}
          >
            {project.title}
          </h1>
        </div>
      </section>

      {/* Project content */}
      <section className="d-section" style={{ padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
          {/* Meta bar */}
          <div
            className={css('_flex _gap8')}
            style={{ marginBottom: '3rem', flexWrap: 'wrap' }}
          >
            <div className={css('_flex _aic _gap2')}>
              <Calendar size={16} style={{ color: 'var(--d-text-muted)' }} />
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{project.year}</span>
            </div>
            <div className={css('_flex _aic _gap2')}>
              <User size={16} style={{ color: 'var(--d-text-muted)' }} />
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{project.role}</span>
            </div>
            <div className={css('_flex _aic _gap2')}>
              <Building2 size={16} style={{ color: 'var(--d-text-muted)' }} />
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{project.client}</span>
            </div>
          </div>

          {/* Long description */}
          <div style={{ maxWidth: '48rem' }}>
            {project.longDescription.split('\n\n').map((paragraph, i) => (
              <p
                key={i}
                style={{
                  fontSize: '1.125rem',
                  lineHeight: 1.8,
                  color: 'var(--d-text-muted)',
                  marginBottom: '1.5rem',
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          <div className={css('_flex _gap2')} style={{ marginTop: '2rem', marginBottom: '4rem', flexWrap: 'wrap' }}>
            {project.tags.map((tag) => (
              <span key={tag} className="d-annotation">{tag}</span>
            ))}
          </div>

          {/* Gallery */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 500px), 1fr))',
              gap: '1.5rem',
            }}
          >
            {project.gallery.map((img, i) => (
              <div
                key={i}
                className="d-glass"
                style={{ borderRadius: 'var(--d-radius-lg)', overflow: 'hidden' }}
              >
                <img
                  src={img}
                  alt={`${project.title} screenshot ${i + 1}`}
                  loading="lazy"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
