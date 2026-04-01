import { Link } from 'react-router-dom';
import { css } from '@decantr/css';

/* ---------- Hero ---------- */
function Hero() {
  return (
    <section
      className={css('_flex _col _aic _textc _py24 _px6') + ' carbon-fade-slide'}
      style={{ background: 'var(--d-bg)' }}
    >
      <div style={{ maxWidth: 640 }}>
        <h1 className={css('_heading1 _fgtext')} style={{ marginBottom: 'var(--d-gap-4)' }}>
          About Carbon AI
        </h1>
        <p className={css('_textlg _fgmuted')} style={{ lineHeight: 1.7 }}>
          We are building the future of developer tools -- one intelligent conversation at a time.
        </p>
      </div>
    </section>
  );
}

/* ---------- Story ---------- */
function Story() {
  return (
    <section className={css('_py24 _px6')} style={{ background: 'var(--d-surface)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 className={css('_heading2 _fgtext')} style={{ marginBottom: 'var(--d-gap-6)' }}>Our Story</h2>
        <div className={css('_flex _col _gap4')}>
          <p className={css('_textbase _fgmuted')} style={{ lineHeight: 1.8 }}>
            Carbon AI started in 2024 when a small team of engineers grew frustrated with
            AI tools that generated plausible-looking but fundamentally broken code. We believed
            developers deserved an assistant that truly understood software architecture.
          </p>
          <p className={css('_textbase _fgmuted')} style={{ lineHeight: 1.8 }}>
            Today, Carbon AI serves over 50,000 developers worldwide. Our models are fine-tuned
            on production codebases, not just documentation, so they understand not just syntax
            but the intent behind your code.
          </p>
          <p className={css('_textbase _fgmuted')} style={{ lineHeight: 1.8 }}>
            We are fully bootstrapped, profitable, and committed to building tools that respect
            your privacy and your time.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Team ---------- */
const team = [
  { name: 'Alex Rivera', role: 'CEO & Co-founder', initials: 'AR' },
  { name: 'Jordan Kim', role: 'CTO & Co-founder', initials: 'JK' },
  { name: 'Sam Okoye', role: 'Head of AI Research', initials: 'SO' },
  { name: 'Maya Singh', role: 'Head of Product', initials: 'MS' },
  { name: 'Leo Zhang', role: 'Lead Engineer', initials: 'LZ' },
  { name: 'Fatima Al-Rashid', role: 'Design Lead', initials: 'FA' },
];

function Team() {
  return (
    <section className={css('_py24 _px6')} style={{ background: 'var(--d-bg)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h2 className={css('_heading2 _fgtext _textc')} style={{ marginBottom: 'var(--d-gap-12)' }}>
          Our Team
        </h2>
        <div className={css('_grid _gc2 _lg:gc3 _gap6')}>
          {team.map((m) => (
            <div key={m.name} className={css('_flex _col _aic _p6 _gap3') + ' carbon-card'}>
              <div
                className={css('_flex _aic _jcc _fontsemi _fgprimary _textlg')}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 'var(--d-radius-full)',
                  background: 'var(--d-surface-raised)',
                  border: '1px solid var(--d-border)',
                }}
              >
                {m.initials}
              </div>
              <h3 className={css('_textsm _fontsemi _fgtext')}>{m.name}</h3>
              <p className={css('_textxs _fgmuted')}>{m.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Values ---------- */
const values = [
  { title: 'Correctness First', desc: 'We would rather give no answer than a wrong one. Every response is validated.' },
  { title: 'Developer Privacy', desc: 'Your code is yours. We never train on your data or share it with third parties.' },
  { title: 'Radical Simplicity', desc: 'No bloated UIs. Every feature earns its place by saving you real time.' },
  { title: 'Open Collaboration', desc: 'We contribute to open source and build in the open whenever possible.' },
];

function Values() {
  return (
    <section className={css('_py24 _px6')} style={{ background: 'var(--d-surface)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2 className={css('_heading2 _fgtext _textc')} style={{ marginBottom: 'var(--d-gap-12)' }}>
          Our Values
        </h2>
        <div className={css('_grid _gc1 _sm:gc2 _gap6')}>
          {values.map((v) => (
            <div key={v.title} className={css('_p6 _flex _col _gap3') + ' carbon-glass'}>
              <h3 className={css('_textlg _fontsemi _fgtext')}>{v.title}</h3>
              <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.6 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA ---------- */
function Cta() {
  return (
    <section className={css('_py24 _px6 _textc')} style={{ background: 'var(--d-bg)' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 className={css('_heading2 _fgtext')} style={{ marginBottom: 'var(--d-gap-4)' }}>
          Join the Team
        </h2>
        <p className={css('_textbase _fgmuted')} style={{ marginBottom: 'var(--d-gap-8)' }}>
          We are always looking for talented engineers and designers who care about developer experience.
        </p>
        <Link
          to="/contact"
          className={css('_bgprimary _fgtext _fontsemi _px8 _py3 _rounded _textbase')}
          style={{ textDecoration: 'none' }}
        >
          Get in Touch
        </Link>
      </div>
    </section>
  );
}

/* ---------- Page ---------- */
export function AboutPage() {
  return (
    <>
      <Hero />
      <Story />
      <Team />
      <Values />
      <Cta />
    </>
  );
}
