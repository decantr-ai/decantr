import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Heart, Globe, Lightbulb, Users, ArrowRight } from 'lucide-react';
import { Button, Card, Avatar } from '@/components';

/* ---------- hero ---------- */
function Hero() {
  return (
    <section className={css('_flex _col _aic _textc _py20 _px4') + ' carbon-fade-slide'}>
      <h1 className={css('_heading1')} style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
        About Carbon AI
      </h1>
      <p className={css('_textlg _fgmuted _mt4')} style={{ maxWidth: 560 }}>
        We believe AI should amplify human thinking, not replace it. Carbon AI is built by a team obsessed with developer experience.
      </p>
    </section>
  );
}

/* ---------- story ---------- */
function Story() {
  return (
    <section className="section-gap" style={{ background: 'var(--d-surface)' }}>
      <div className="container container-md">
        <h2 className={css('_heading2 _mb6')}>Our story</h2>
        <div className={css('_flex _col _gap4 _fgmuted _textbase')} style={{ lineHeight: 1.8 }}>
          <p>
            Carbon AI started in 2024 as an internal tool at a developer tools company. We were frustrated with existing AI assistants that felt like toys -- great for demos, terrible for real work.
          </p>
          <p>
            We wanted something that understood code deeply, maintained context across long conversations, and respected our privacy. When we couldn't find it, we built it.
          </p>
          <p>
            Today, Carbon AI serves thousands of developers and engineering teams who demand more from their AI tools. We remain a small, focused team committed to building the most thoughtful AI assistant in the industry.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- team ---------- */
const team = [
  { name: 'Elena Vasquez', role: 'CEO & Co-founder' },
  { name: 'James Park', role: 'CTO & Co-founder' },
  { name: 'Aisha Patel', role: 'Head of AI Research' },
  { name: 'Tom Lindgren', role: 'Head of Engineering' },
  { name: 'Maya Johnson', role: 'Head of Design' },
  { name: 'Luca Rossi', role: 'Head of Security' },
];

function Team() {
  return (
    <section className="section-gap">
      <div className="container">
        <div className={css('_textc _mb12')}>
          <h2 className={css('_heading2')}>Our team</h2>
          <p className={css('_textlg _fgmuted _mt2')}>A small team building big things.</p>
        </div>
        <div className={css('_grid _gc2 _lg:gc3 _gap6')} style={{ maxWidth: 800, marginInline: 'auto' }}>
          {team.map((m) => (
            <Card key={m.name} hover className={css('_textc')}>
              <div className={css('_flex _col _aic _gap3')}>
                <Avatar name={m.name} size="lg" />
                <div>
                  <div className={css('_fontsemi _textsm')}>{m.name}</div>
                  <div className={css('_textxs _fgmuted')}>{m.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- values ---------- */
const values = [
  { icon: Heart, title: 'Craft', desc: 'Every detail matters. We sweat the small stuff so our users don\'t have to.' },
  { icon: Globe, title: 'Openness', desc: 'Transparent pricing, open roadmap, and honest communication with our community.' },
  { icon: Lightbulb, title: 'Innovation', desc: 'We push boundaries on what AI assistants can do, guided by real user needs.' },
  { icon: Users, title: 'Trust', desc: 'Privacy by design. Your conversations are yours. Period.' },
];

function Values() {
  return (
    <section className="section-gap" style={{ background: 'var(--d-surface)' }}>
      <div className="container">
        <div className={css('_textc _mb12')}>
          <h2 className={css('_heading2')}>Our values</h2>
        </div>
        <div className={css('_grid _gc1 _sm:gc2 _gap6')} style={{ maxWidth: 800, marginInline: 'auto' }}>
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className={css('_flex _gap4')}>
                <div
                  className={css('_flex _aic _jcc _rounded _shrink0')}
                  style={{
                    width: 40,
                    height: 40,
                    background: 'color-mix(in srgb, var(--d-primary) 15%, var(--d-surface))',
                  }}
                >
                  <Icon size={20} style={{ color: 'var(--d-primary)' }} />
                </div>
                <div>
                  <h3 className={css('_fontsemi _textbase')}>{v.title}</h3>
                  <p className={css('_textsm _fgmuted _mt1')} style={{ lineHeight: 1.6 }}>{v.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA ---------- */
function CTA() {
  return (
    <section className="section-gap">
      <div className={css('_textc _flex _col _aic') + ' container'}>
        <h2 className={css('_heading2')}>Join us on this journey</h2>
        <p className={css('_textlg _fgmuted _mt2')} style={{ maxWidth: 480 }}>
          We're hiring. If you care about building tools that respect developers, we'd love to hear from you.
        </p>
        <div className={css('_flex _aic _gap3 _mt8')}>
          <Link to="/contact">
            <Button variant="primary" size="lg">
              Get in touch
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function AboutPage() {
  return (
    <>
      <Hero />
      <Story />
      <Team />
      <Values />
      <CTA />
    </>
  );
}
