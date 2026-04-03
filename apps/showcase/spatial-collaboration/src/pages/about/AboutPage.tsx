import { css } from '@decantr/css';
import { useNavigate } from 'react-router-dom';
import { Layers, Users, Maximize, Wind, ArrowRight, Shield } from 'lucide-react';
import { TEAM_MEMBERS, VALUES } from '../../data/mock';

const VALUE_ICONS: Record<string, React.ElementType> = {
  Layers, Users, Maximize, Wind,
};

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div data-theme="carbon">
      {/* Hero */}
      <section
        className="d-section"
        style={{
          padding: '6rem 1.5rem 4rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: `radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--d-accent) 8%, transparent) 0%, transparent 60%), radial-gradient(ellipse at 60% 40%, color-mix(in srgb, var(--d-primary) 6%, transparent) 0%, transparent 50%)`,
        }}
        role="banner"
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 600, height: 400, borderRadius: '50%',
            background: 'color-mix(in srgb, var(--d-accent) 8%, transparent)',
            filter: 'blur(120px)', pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
          <h1
            className={css('_fontbold')}
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: '1.5rem',
            }}
          >
            Spatial thinking for{' '}
            <span style={{ color: 'var(--d-accent)' }}>collaborative teams</span>
          </h1>
          <p
            className={css('_textlg')}
            style={{
              color: 'var(--d-text-muted)',
              lineHeight: 1.7,
              maxWidth: 600,
              margin: '0 auto 2rem',
            }}
          >
            We believe the best ideas emerge when teams can think spatially together.
            SpatialOps reimagines collaboration as a shared canvas with depth, presence, and flow.
          </p>
          <div className={css('_flex _aic _jcc _gap3 _wrap')}>
            <button
              className="d-interactive"
              data-variant="primary"
              onClick={() => navigate('/register')}
              style={{ fontSize: '0.9375rem', padding: '0.625rem 1.5rem' }}
            >
              Create Your Space <ArrowRight size={16} />
            </button>
            <button
              className="d-interactive"
              data-variant="ghost"
              onClick={() => navigate('/login')}
              style={{ fontSize: '0.9375rem', padding: '0.625rem 1.5rem' }}
            >
              Log In
            </button>
          </div>
        </div>
      </section>

      {/* Story */}
      <section
        className="d-section"
        style={{ padding: 'var(--d-section-py) 1.5rem' }}
        role="region"
        aria-label="Our story"
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p className="d-label" style={{ textAlign: 'center', color: 'var(--d-accent)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>OUR STORY</p>
          <h2 className={css('_fontsemi _textc')} style={{ fontSize: '2rem', marginBottom: '2rem' }}>
            Built from frustration with flat tools
          </h2>
          <div className={css('_flex _col _gap4')}>
            <p className={css('_textlg')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.8 }}>
              We started SpatialOps because we were tired of flattening our thinking into linear documents and rigid grid layouts.
              Ideas have depth. Relationships between concepts are spatial. Yet every collaboration tool forces us into 2D.
            </p>
            <p className={css('_textlg')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.8 }}>
              Our team comes from spatial computing, game engines, and distributed systems. We combined those disciplines
              to build a workspace where information lives at different depths, where you can feel your collaborators' presence,
              and where the canvas itself becomes the primary interface.
            </p>
            <p className={css('_textlg')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.8 }}>
              Today, product teams, design studios, and engineering organizations use SpatialOps to plan, design,
              and build together in ways that flat tools simply cannot support.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section
        className="d-section"
        style={{
          padding: 'var(--d-section-py) 1.5rem',
          background: 'var(--d-surface)',
        }}
        role="region"
        aria-label="Team"
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="d-label" style={{ textAlign: 'center', color: 'var(--d-accent)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>THE TEAM</p>
          <h2 className={css('_fontsemi _textc')} style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
            People building the spatial future
          </h2>
          <p className={css('_textsm _textc')} style={{ color: 'var(--d-text-muted)', maxWidth: 500, margin: '0 auto 3rem' }}>
            A cross-disciplinary team from spatial computing, distributed systems, and design.
          </p>

          <div className={css('_grid _gap6')} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {TEAM_MEMBERS.map((member, i) => (
              <div
                key={member.name}
                className="carbon-card"
                style={{ padding: 'var(--d-surface-p)' }}
              >
                <div className={css('_flex _aic _gap3')} style={{ marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'var(--d-surface-raised)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 600, fontSize: '0.875rem', color: 'var(--d-accent)',
                      outline: '2px solid var(--d-primary)', outlineOffset: 2,
                    }}
                  >
                    {member.initials}
                  </div>
                  <div>
                    <p className={css('_fontsemi')}>{member.name}</p>
                    <p className={css('_textxs')} style={{ color: 'var(--d-accent)' }}>{member.role}</p>
                  </div>
                </div>
                <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section
        className="d-section"
        style={{ padding: 'var(--d-section-py) 1.5rem' }}
        role="region"
        aria-label="Values"
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p className="d-label" style={{ textAlign: 'center', color: 'var(--d-accent)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>OUR VALUES</p>
          <h2 className={css('_fontsemi _textc')} style={{ fontSize: '2rem', marginBottom: '3rem' }}>
            Principles that guide every pixel
          </h2>

          <div className={css('_grid _gap6')} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {VALUES.map(value => {
              const Icon = VALUE_ICONS[value.icon] || Layers;
              return (
                <div key={value.title} className={css('_flex _col _gap3')} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', margin: '0 auto',
                    background: 'color-mix(in srgb, var(--d-accent) 10%, transparent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={24} style={{ color: 'var(--d-accent)' }} />
                  </div>
                  <h3 className={css('_fontsemi')}>{value.title}</h3>
                  <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="d-section"
        style={{
          padding: 'var(--d-section-py) 1.5rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--d-primary) 8%, var(--d-bg)), color-mix(in srgb, var(--d-accent) 5%, var(--d-bg)))',
          position: 'relative',
          overflow: 'hidden',
        }}
        role="complementary"
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 500, height: 300, borderRadius: '50%',
            background: 'color-mix(in srgb, var(--d-accent) 8%, transparent)',
            filter: 'blur(140px)', opacity: 0.4, pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          <h2 className={css('_fontsemi')} style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
            Ready to think spatially?
          </h2>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Join teams who have discovered that spatial collaboration unlocks ideas flat tools cannot reach.
          </p>
          <div className={css('_flex _aic _jcc _gap3 _wrap')}>
            <button
              className="d-interactive"
              data-variant="primary"
              onClick={() => navigate('/register')}
              style={{ fontSize: '1.0625rem', padding: '0.75rem 2rem' }}
            >
              Create Your Space <ArrowRight size={16} />
            </button>
            <button
              className="d-interactive"
              data-variant="ghost"
              onClick={() => navigate('/login')}
              style={{ fontSize: '1.0625rem', padding: '0.75rem 2rem' }}
            >
              Log In
            </button>
          </div>
          <div className={css('_flex _aic _jcc _gap6 _wrap')} style={{ marginTop: '2rem' }}>
            {['Free for small teams', 'Real-time collaboration', 'No credit card required'].map(label => (
              <span key={label} className={css('_flex _aic _gap1 _textxs')} style={{ color: 'var(--d-text-muted)' }}>
                <Shield size={12} style={{ color: 'var(--d-accent)', flexShrink: 0 }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
