import { css } from '@decantr/css';
import { MapPin, Mail, Github, Twitter, Linkedin, Dribbble } from 'lucide-react';
import { bio } from '../data/mock';

const socialIcons: Record<string, typeof Github> = { github: Github, twitter: Twitter, linkedin: Linkedin, dribbble: Dribbble };

export function AboutPage() {
  return (
    <div className="entrance-fade" style={{ maxWidth: '64rem', margin: '0 auto' }}>
      {/* About hero */}
      <section className="d-section" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="aura-orb aura-orb--pink" style={{ top: '-20%', right: '-10%', width: 300, height: 300 }} />

        <div
          className={css('_flex _gap12')}
          style={{ flexWrap: 'wrap', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}
        >
          {/* Photo */}
          <div
            className="d-glass aura-glow"
            style={{
              width: 280,
              height: 280,
              borderRadius: 'var(--d-radius-lg)',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <img
              src={bio.avatar}
              alt={bio.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Bio */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            <h1
              className="d-gradient-text"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, lineHeight: 1.1, marginBottom: '0.75rem' }}
            >
              {bio.name}
            </h1>
            <p className={css('_textlg')} style={{ color: 'var(--d-accent)', marginBottom: '1rem', fontWeight: 500 }}>
              {bio.title}
            </p>
            <p style={{ fontSize: '1.125rem', color: 'var(--d-text-muted)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              {bio.tagline}
            </p>

            <div className={css('_flex _aic _gap4')} style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <span className={css('_flex _aic _gap2 _textsm')} style={{ color: 'var(--d-text-muted)' }}>
                <MapPin size={14} /> {bio.location}
              </span>
              <span className={css('_flex _aic _gap2 _textsm')} style={{ color: 'var(--d-text-muted)' }}>
                <Mail size={14} /> {bio.email}
              </span>
            </div>

            {/* Social links */}
            <div className={css('_flex _gap3')}>
              {Object.entries(bio.social).map(([platform, url]) => {
                const Icon = socialIcons[platform];
                return Icon ? (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="d-interactive"
                    data-variant="ghost"
                    style={{ padding: '0.5rem', borderRadius: 'var(--d-radius)' }}
                    aria-label={platform}
                  >
                    <Icon size={18} />
                  </a>
                ) : null;
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Extended bio */}
      <section className="d-section">
        <div style={{ maxWidth: '48rem' }}>
          {bio.about.split('\n\n').map((paragraph, i) => (
            <p
              key={i}
              style={{
                fontSize: '1.0625rem',
                lineHeight: 1.8,
                color: 'var(--d-text-muted)',
                marginBottom: '1.5rem',
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
