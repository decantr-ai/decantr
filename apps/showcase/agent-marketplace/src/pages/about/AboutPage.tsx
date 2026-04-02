import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Target, Eye, Users, Zap, ArrowRight } from 'lucide-react';
import { Button, Card, Avatar } from '@/components';

/* ---------- hero ---------- */
function Hero() {
  return (
    <section className={css('_flex _col _aic _textc _py20 _px4') + ' carbon-fade-slide'}>
      <h1 className={css('_heading1')} style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', lineHeight: 1.15, maxWidth: 720 }}>
        Building the future of{' '}
        <span style={{ color: 'var(--d-primary)' }}>autonomous work</span>
      </h1>
      <p className={css('_textlg _fgmuted _mt4')} style={{ maxWidth: 560 }}>
        AgentHub is where the world's best AI agents find their next deployment.
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
        <div className={css('_flex _col _gap4')}>
          <p className={css('_textbase _fgmuted')} style={{ lineHeight: 1.8 }}>
            AgentHub started as an internal tool. We were building autonomous agents for our own workflows and realized the hardest part wasn't building agents -- it was deploying, monitoring, and trusting them in production. Every team we talked to had the same problem: brilliant agents sitting in notebooks, never making it to real workloads.
          </p>
          <p className={css('_textbase _fgmuted')} style={{ lineHeight: 1.8 }}>
            So we opened AgentHub to the public. Our mission is to make production-grade AI agents accessible to every engineering team. We believe the best agents will come from the community, and we're building the infrastructure to help them ship. Today, thousands of teams rely on AgentHub to deploy, monitor, and scale their agent fleets.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- team ---------- */
const team = [
  { name: 'Alex Kim', role: 'CEO & Co-founder' },
  { name: 'Jordan Park', role: 'CTO & Co-founder' },
  { name: 'Sam Torres', role: 'Head of Engineering' },
  { name: 'Maya Lin', role: 'Head of Design' },
];

function Team() {
  return (
    <section className="section-gap">
      <div className="container">
        <div className={css('_textc _mb12')}>
          <h2 className={css('_heading2')}>Meet the team</h2>
          <p className={css('_textlg _fgmuted _mt2')}>The people behind AgentHub.</p>
        </div>
        <div className={css('_grid _gc1 _sm:gc2 _lg:gc4 _gap6')} style={{ maxWidth: 900, marginInline: 'auto' }}>
          {team.map((m) => (
            <Card key={m.name} hover>
              <div className={css('_flex _col _aic _gap3 _textc')}>
                <Avatar name={m.name} size="lg" />
                <div>
                  <div className={css('_fontsemi _textbase')}>{m.name}</div>
                  <div className={css('_textsm _fgmuted _mt1')}>{m.role}</div>
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
  { icon: Target, title: 'Mission-driven', desc: 'Every decision starts with: does this make agents more reliable?' },
  { icon: Eye, title: 'Transparency', desc: 'Open monitoring, open pricing, open roadmap. No black boxes.' },
  { icon: Users, title: 'Community-first', desc: 'The best agents come from the community. We build tools, not walls.' },
  { icon: Zap, title: 'Speed', desc: 'Deploy in seconds, not days. Fast feedback loops make better agents.' },
];

function Values() {
  return (
    <section className="section-gap" style={{ background: 'var(--d-surface)' }}>
      <div className="container">
        <div className={css('_textc _mb12')}>
          <h2 className={css('_heading2')}>What we believe</h2>
          <p className={css('_textlg _fgmuted _mt2')}>The principles that guide everything we build.</p>
        </div>
        <div className={css('_grid _gc1 _sm:gc2 _lg:gc4 _gap6')} style={{ maxWidth: 1000, marginInline: 'auto' }}>
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <Card key={v.title} hover>
                <div className={css('_flex _col _gap3')}>
                  <div
                    className={css('_flex _aic _jcc _rounded')}
                    style={{
                      width: 40,
                      height: 40,
                      background: 'color-mix(in srgb, var(--d-primary) 15%, var(--d-surface))',
                    }}
                  >
                    <Icon size={20} style={{ color: 'var(--d-primary)' }} />
                  </div>
                  <h3 className={css('_fontsemi _textbase')}>{v.title}</h3>
                  <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.6 }}>{v.desc}</p>
                </div>
              </Card>
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
        <h2 className={css('_heading2')}>Join us on the mission</h2>
        <p className={css('_textlg _fgmuted _mt2')} style={{ maxWidth: 480 }}>
          We're building the infrastructure for the next generation of autonomous software. Come build with us.
        </p>
        <div className={css('_flex _aic _gap3 _mt8')}>
          <Link to="/register">
            <Button variant="primary" size="lg">
              Get started free
              <ArrowRight size={18} />
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="secondary" size="lg">Talk to sales</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- page ---------- */
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
