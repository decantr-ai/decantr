import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Heart, Lightbulb, Lock, Users, ArrowRight } from 'lucide-react';

const team = [
  { name: 'Alex Mercer', role: 'CEO & Co-Founder', initials: 'AM' },
  { name: 'Priya Patel', role: 'CTO & Co-Founder', initials: 'PP' },
  { name: 'Jordan Kim', role: 'Head of Engineering', initials: 'JK' },
  { name: 'Maria Santos', role: 'Head of Design', initials: 'MS' },
  { name: 'David Liu', role: 'Lead ML Engineer', initials: 'DL' },
  { name: 'Rachel Moore', role: 'Head of Product', initials: 'RM' },
];

const values = [
  {
    icon: <Heart size={22} />,
    title: 'User-First Design',
    desc: 'Every decision starts with the question: does this make the user more productive?',
  },
  {
    icon: <Lock size={22} />,
    title: 'Privacy by Default',
    desc: 'Your data is yours. We encrypt everything and never train on customer conversations.',
  },
  {
    icon: <Lightbulb size={22} />,
    title: 'Relentless Craft',
    desc: 'We obsess over details. From response latency to typography, quality is non-negotiable.',
  },
  {
    icon: <Users size={22} />,
    title: 'Open Collaboration',
    desc: 'We build in public, share our roadmap, and listen to feedback from the community.',
  },
];

export function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className={css('_flex _col _aic _textc _px4 _py20')} style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div className={css('_flex _col _aic _gap4')} style={{ maxWidth: '640px' }}>
          <h1 className={css('_heading1 _fgtext')} style={{ fontSize: '2.75rem', lineHeight: 1.15 }}>
            Built by engineers,<br />for engineers
          </h1>
          <p className={css('_textlg _fgmuted')} style={{ lineHeight: 1.7 }}>
            We started Carbon AI because we wanted an AI assistant that felt like a thoughtful colleague, not a toy demo.
          </p>
        </div>
      </section>

      {/* Story */}
      <section
        className={css('_px4 _py20')}
        style={{ background: 'var(--d-surface)', paddingTop: '5rem', paddingBottom: '5rem' }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 className={css('_heading2 _fgtext _mb6')}>Our story</h2>
          <div className={css('_flex _col _gap4 _fgmuted')} style={{ lineHeight: 1.8 }}>
            <p>
              Carbon AI began in late 2024 when a small team of engineers grew frustrated with
              the gap between AI demos and production-ready tools. Existing chatbots were either
              impressive but unreliable, or reliable but limited.
            </p>
            <p>
              We set out to build something different: an AI assistant with the depth of a large
              language model, the reliability of enterprise software, and the polish of the best
              developer tools. No gimmicks, no emoji-laden interfaces -- just clean, fast,
              trustworthy AI.
            </p>
            <p>
              Today, Carbon AI serves thousands of engineering teams worldwide. We are profitable,
              fully independent, and obsessively focused on building the best AI work tool on the planet.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className={css('_px4 _py20')} style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className={css('_textc _mb12')}>
            <h2 className={css('_heading2 _fgtext _mb3')}>The team</h2>
            <p className={css('_textlg _fgmuted')}>
              A small, focused team with deep experience in ML, systems, and design.
            </p>
          </div>
          <div className={css('_grid _gc2 _md:gc3 _gap6')}>
            {team.map((m) => (
              <div
                key={m.name}
                className={css('_flex _col _aic _gap3 _p6 _rounded _textc') + ' carbon-card hover-lift'}
              >
                <div
                  className={css('_flex _aic _jcc _roundedfull _fontsemi _fgprimary')}
                  style={{
                    width: '64px',
                    height: '64px',
                    background: 'rgba(124,147,176,0.12)',
                    fontSize: '1.25rem',
                  }}
                >
                  {m.initials}
                </div>
                <div className={css('_flex _col _gap0')}>
                  <span className={css('_fontsemi _fgtext')}>{m.name}</span>
                  <span className={css('_textsm _fgmuted')}>{m.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section
        className={css('_px4 _py20')}
        style={{ background: 'var(--d-surface)', paddingTop: '5rem', paddingBottom: '5rem' }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className={css('_textc _mb12')}>
            <h2 className={css('_heading2 _fgtext _mb3')}>What we believe</h2>
          </div>
          <div className={css('_grid _gc1 _md:gc2 _gap6')}>
            {values.map((v) => (
              <div
                key={v.title}
                className={css('_flex _gap4 _p6 _rounded') + ' carbon-card hover-lift'}
              >
                <div
                  className={css('_flex _aic _jcc _shrink0 _rounded')}
                  style={{
                    width: '44px',
                    height: '44px',
                    background: 'rgba(124,147,176,0.12)',
                    color: 'var(--d-primary)',
                  }}
                >
                  {v.icon}
                </div>
                <div className={css('_flex _col _gap1')}>
                  <h3 className={css('_fontsemi _fgtext')}>{v.title}</h3>
                  <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.7 }}>
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={css('_px4 _py20 _textc')} style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div className={css('_flex _col _aic _gap6')} style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 className={css('_heading2 _fgtext')}>Join us on this journey</h2>
          <p className={css('_textlg _fgmuted')} style={{ lineHeight: 1.7 }}>
            We are always looking for talented people who care about craft.
          </p>
          <Link to="/contact">
            <Button variant="primary" size="lg" icon={<ArrowRight size={18} />}>
              Get in touch
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
