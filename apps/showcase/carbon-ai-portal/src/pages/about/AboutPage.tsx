import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Lightbulb, Shield, Users, Zap } from 'lucide-react';
import { TopNavFooterShell } from '@/layouts/TopNavFooterShell';
import { Button, Card, Avatar } from '@/components';

/* -- Hero --------------------------------------------------------- */
function HeroSection() {
  return (
    <section className={css('_flex _col _aic _textc _py20 _px4')}>
      <div className={css('_flex _col _aic _gap6')} style={{ maxWidth: '720px' }}>
        <h1 className={css('_text3xl _fontsemi _fgtext')} style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.15 }}>
          Making AI work for developers
        </h1>
        <p className={css('_textlg _fgmuted')} style={{ maxWidth: '560px' }}>
          We are building the next generation of developer tools -- AI that truly understands code, context, and craft.
        </p>
      </div>
    </section>
  );
}

/* -- Story -------------------------------------------------------- */
function StorySection() {
  return (
    <section className={css('_px4') + ' section-padding'} style={{ background: 'var(--d-surface)' }}>
      <div className={css('_flex _col _gap8') + ' container-sm'}>
        <h2 className={css('_text2xl _fontsemi _fgtext _textc')} style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
          Our story
        </h2>
        <div className={css('_flex _col _gap4')}>
          <p className={css('_textbase _fgmuted')} style={{ lineHeight: 1.8 }}>
            Carbon AI started with a simple observation: AI coding tools were impressive at generating code, but terrible at understanding it. They could write a function, but couldn't tell you why your architecture was heading in the wrong direction.
          </p>
          <p className={css('_textbase _fgmuted')} style={{ lineHeight: 1.8 }}>
            We set out to build something different. An AI assistant that doesn't just autocomplete -- it comprehends. One that understands your project structure, your coding patterns, your team's conventions. One that can have a real conversation about your code, not just pattern-match against a training set.
          </p>
          <p className={css('_textbase _fgmuted')} style={{ lineHeight: 1.8 }}>
            Today, Carbon AI is used by thousands of developers and engineering teams worldwide. From solo hackers to Fortune 500 engineering orgs, our AI helps ship better code, faster.
          </p>
        </div>
      </div>
    </section>
  );
}

/* -- Team --------------------------------------------------------- */
const team = [
  { name: 'Alex Chen', role: 'CEO & Co-founder', initials: 'AC' },
  { name: 'Sarah Kim', role: 'CTO & Co-founder', initials: 'SK' },
  { name: 'Marcus Rivera', role: 'VP Engineering', initials: 'MR' },
  { name: 'Emily Zhao', role: 'Head of AI', initials: 'EZ' },
  { name: 'David Park', role: 'Head of Design', initials: 'DP' },
  { name: 'Lisa Wang', role: 'Head of Product', initials: 'LW' },
];

function TeamSection() {
  return (
    <section className={css('_px4') + ' section-padding'}>
      <div className={css('_flex _col _gap12') + ' container'}>
        <div className={css('_flex _col _aic _gap3 _textc')}>
          <h2 className={css('_text2xl _fontsemi _fgtext')} style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
            The team
          </h2>
          <p className={css('_textlg _fgmuted')} style={{ maxWidth: '480px' }}>
            Engineers, researchers, and designers united by a passion for developer experience.
          </p>
        </div>
        <div className={css('_grid _gap6')} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {team.map((member) => (
            <div key={member.name} className={css('_flex _col _aic _gap3 _p4 _textc')}>
              <Avatar size="lg" fallback={member.initials} />
              <div className={css('_flex _col _gap1')}>
                <span className={css('_fontmedium _fgtext')}>{member.name}</span>
                <span className={css('_textsm _fgmuted')}>{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -- Values ------------------------------------------------------- */
const values = [
  { icon: Zap, title: 'Ship with urgency', description: 'We bias toward action. Perfect is the enemy of shipped.' },
  { icon: Heart, title: 'Developer empathy', description: 'We build tools we want to use. Every feature starts with a real pain point.' },
  { icon: Shield, title: 'Trust through transparency', description: 'Open pricing, honest communication, and clear privacy policies.' },
  { icon: Lightbulb, title: 'Think from first principles', description: 'We question assumptions and rebuild from the ground up when needed.' },
  { icon: Users, title: 'Team over individual', description: 'Great products are built by great teams. We lift each other up.' },
];

function ValuesSection() {
  return (
    <section className={css('_px4') + ' section-padding'} style={{ background: 'var(--d-surface)' }}>
      <div className={css('_flex _col _gap12') + ' container'}>
        <div className={css('_flex _col _aic _gap3 _textc')}>
          <h2 className={css('_text2xl _fontsemi _fgtext')} style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
            Our values
          </h2>
        </div>
        <div className={css('_grid _gap6')} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {values.map((value) => (
            <Card key={value.title}>
              <div className={css('_flex _gap4')}>
                <div
                  className={css('_flex _aic _jcc _rounded _shrink0')}
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'color-mix(in srgb, var(--d-primary) 15%, transparent)',
                  }}
                >
                  <value.icon size={20} className={css('_fgprimary')} />
                </div>
                <div className={css('_flex _col _gap1')}>
                  <h3 className={css('_fontmedium _fgtext')}>{value.title}</h3>
                  <p className={css('_textsm _fgmuted')}>{value.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -- CTA ---------------------------------------------------------- */
function CtaSection() {
  return (
    <section className={css('_px4') + ' section-padding'}>
      <div className={css('_flex _col _aic _gap6 _textc') + ' container'}>
        <h2 className={css('_text2xl _fontsemi _fgtext')} style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
          Join us in building the future
        </h2>
        <p className={css('_textlg _fgmuted')} style={{ maxWidth: '480px' }}>
          We are hiring across engineering, design, and research. Come build something great.
        </p>
        <Link to="/contact">
          <Button variant="primary" size="lg">
            Get in touch
            <ArrowRight size={18} />
          </Button>
        </Link>
      </div>
    </section>
  );
}

/* -- Page --------------------------------------------------------- */
export function AboutPage() {
  return (
    <TopNavFooterShell>
      <HeroSection />
      <StorySection />
      <TeamSection />
      <ValuesSection />
      <CtaSection />
    </TopNavFooterShell>
  );
}
