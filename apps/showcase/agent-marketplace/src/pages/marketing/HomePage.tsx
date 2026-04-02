import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import {
  Bot,
  Shield,
  Zap,
  GitBranch,
  Workflow,
  BarChart3,
  ArrowRight,
  Check,
  Star,
  ChevronRight,
  Target,
} from 'lucide-react';
import { Button, Card, Avatar, Badge } from '@/components';

/* ---------- hero ---------- */
function Hero() {
  return (
    <section className={css('_flex _col _aic _textc _py20 _px4') + ' carbon-fade-slide'}>
      <Badge>Now in public beta</Badge>
      <h1 className={css('_heading1 _mt4')} style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', lineHeight: 1.15, maxWidth: 720 }}>
        Deploy AI agents that{' '}
        <span style={{ color: 'var(--d-primary)' }}>actually work</span>
      </h1>
      <p className={css('_textlg _fgmuted _mt4')} style={{ maxWidth: 600 }}>
        AgentHub is the marketplace for production-grade AI agents. Browse, deploy, and monitor autonomous agents built by the world's best developers.
      </p>
      <div className={css('_flex _aic _gap3 _mt8')}>
        <Link to="/chat">
          <Button variant="primary" size="lg">
            Browse agents
            <ArrowRight size={18} />
          </Button>
        </Link>
        <Link to="/about">
          <Button variant="secondary" size="lg">Learn more</Button>
        </Link>
      </div>
    </section>
  );
}

/* ---------- features ---------- */
const features = [
  { icon: Bot, title: 'Autonomous Agents', desc: 'Deploy agents that reason, plan, and execute complex multi-step tasks independently.' },
  { icon: Shield, title: 'Enterprise Security', desc: 'SOC 2 compliant with sandboxed execution, audit logs, and granular permissions.' },
  { icon: Zap, title: 'Real-time Monitoring', desc: 'Live dashboards showing agent activity, token usage, and performance metrics.' },
  { icon: GitBranch, title: 'Version Control', desc: 'Every agent version is tracked. Roll back instantly if behavior drifts.' },
  { icon: Workflow, title: 'Workflow Orchestration', desc: 'Chain agents together into pipelines. Output of one feeds into another.' },
  { icon: BarChart3, title: 'Usage Analytics', desc: 'Track cost, latency, and success rates across your entire agent fleet.' },
];

function Features() {
  return (
    <section className="section-gap" style={{ background: 'var(--d-surface)' }}>
      <div className="container">
        <div className={css('_textc _mb12')}>
          <h2 className={css('_heading2')}>Everything you need to run agents at scale</h2>
          <p className={css('_textlg _fgmuted _mt2')}>From deployment to monitoring, AgentHub handles the infrastructure so you can focus on results.</p>
        </div>
        <div className={css('_grid _gc1 _sm:gc2 _lg:gc3 _gap6')}>
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} hover>
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
                  <h3 className={css('_fontsemi _textbase')}>{f.title}</h3>
                  <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- how it works ---------- */
const steps = [
  { num: '01', title: 'Browse the marketplace', desc: 'Discover agents built by verified developers. Filter by capability, language, and use case.' },
  { num: '02', title: 'Deploy in one click', desc: 'Configure environment variables, set rate limits, and deploy to your infrastructure.' },
  { num: '03', title: 'Monitor in real-time', desc: 'Watch your agents work. Stream logs, inspect decisions, and intervene when needed.' },
  { num: '04', title: 'Scale with confidence', desc: 'Auto-scaling, circuit breakers, and fallback chains keep your agents reliable.' },
];

function HowItWorks() {
  return (
    <section className="section-gap">
      <div className="container">
        <div className={css('_textc _mb12')}>
          <h2 className={css('_heading2')}>How it works</h2>
          <p className={css('_textlg _fgmuted _mt2')}>From discovery to production in four steps.</p>
        </div>
        <div className={css('_grid _gc1 _sm:gc2 _lg:gc4 _gap6')}>
          {steps.map((s) => (
            <div key={s.num} className={css('_flex _col _gap3')}>
              <span className={css('_fontsemi _fgprimary')} style={{ fontSize: '2rem', fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums' }}>
                {s.num}
              </span>
              <div className="carbon-divider" />
              <h3 className={css('_fontsemi _textbase')}>{s.title}</h3>
              <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- pricing ---------- */
const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    desc: 'For experimentation and side projects.',
    features: ['3 active agents', '10k tokens/day', 'Community agents only', 'Basic monitoring'],
    cta: 'Get started',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    desc: 'For teams shipping agents to production.',
    features: ['25 active agents', '500k tokens/day', 'Premium agents', 'Real-time monitoring', 'API access', 'Priority support'],
    cta: 'Start free trial',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For organizations with compliance needs.',
    features: ['Unlimited agents', 'Custom token limits', 'Private agent registry', 'SSO / SAML', 'SLA guarantee', 'Dedicated support'],
    cta: 'Contact sales',
    featured: false,
  },
];

function Pricing() {
  return (
    <section className="section-gap" style={{ background: 'var(--d-surface)' }}>
      <div className="container">
        <div className={css('_textc _mb12')}>
          <h2 className={css('_heading2')}>Simple, transparent pricing</h2>
          <p className={css('_textlg _fgmuted _mt2')}>Start free. Scale when you're ready.</p>
        </div>
        <div className={css('_grid _gc1 _lg:gc3 _gap6 _aic')} style={{ maxWidth: 1000, marginInline: 'auto' }}>
          {tiers.map((t) => (
            <Card
              key={t.name}
              hover
              className={t.featured ? css('_rel') : ''}
              style={t.featured ? { border: '1px solid var(--d-primary)', boxShadow: '0 0 30px color-mix(in srgb, var(--d-primary) 15%, transparent)' } : undefined}
            >
              {t.featured && (
                <div className={css('_abs _top0 _right0 _mt3 _mr3')}>
                  <Badge>Popular</Badge>
                </div>
              )}
              <div className={css('_flex _col _gap4')}>
                <div>
                  <h3 className={css('_fontsemi _textlg')}>{t.name}</h3>
                  <p className={css('_textsm _fgmuted _mt1')}>{t.desc}</p>
                </div>
                <div className={css('_flex _aibl _gap1')}>
                  <span className={css('_fontbold')} style={{ fontSize: '2.5rem', lineHeight: 1 }}>{t.price}</span>
                  {t.period && <span className={css('_textsm _fgmuted')}>{t.period}</span>}
                </div>
                <ul className={css('_flex _col _gap2')}>
                  {t.features.map((f) => (
                    <li key={f} className={css('_flex _aic _gap2 _textsm')}>
                      <Check size={16} style={{ color: 'var(--d-success)', flexShrink: 0 }} />
                      <span className={css('_fgmuted')}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to={t.featured ? '/register' : t.name === 'Enterprise' ? '/contact' : '/register'}>
                  <Button variant={t.featured ? 'primary' : 'secondary'} className={css('_wfull')}>
                    {t.cta}
                    <ChevronRight size={16} />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- testimonials ---------- */
const testimonials = [
  {
    quote: 'AgentHub replaced our entire internal tooling team. The code review agent alone saves us 20 hours a week.',
    name: 'Sarah Chen',
    role: 'Staff Engineer, Vercel',
  },
  {
    quote: 'The monitoring dashboard is incredible. We can see exactly what our agents are thinking in real-time.',
    name: 'Marcus Rivera',
    role: 'CTO, Acme Corp',
  },
  {
    quote: 'Finally a marketplace where agents actually work out of the box. Deployment is one click, literally.',
    name: 'Priya Sharma',
    role: 'VP Engineering, DataFlow',
  },
];

function Testimonials() {
  return (
    <section className="section-gap">
      <div className="container">
        <div className={css('_textc _mb12')}>
          <h2 className={css('_heading2')}>Trusted by engineering teams</h2>
          <p className={css('_textlg _fgmuted _mt2')}>See what teams are building with AgentHub.</p>
        </div>
        <div className={css('_grid _gc1 _lg:gc3 _gap6')}>
          {testimonials.map((t) => (
            <Card key={t.name} hover>
              <div className={css('_flex _col _gap4')}>
                <div className={css('_flex _gap1')}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} fill="var(--d-warning)" style={{ color: 'var(--d-warning)' }} />
                  ))}
                </div>
                <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.7 }}>"{t.quote}"</p>
                <div className={css('_flex _aic _gap3')}>
                  <Avatar name={t.name} size="sm" />
                  <div>
                    <div className={css('_textsm _fontsemi')}>{t.name}</div>
                    <div className={css('_textxs _fgmuted')}>{t.role}</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA ---------- */
function CTA() {
  return (
    <section className="section-gap" style={{ background: 'var(--d-surface)' }}>
      <div className={css('_textc _flex _col _aic') + ' container'}>
        <h2 className={css('_heading2')}>Ready to deploy your first agent?</h2>
        <p className={css('_textlg _fgmuted _mt2')} style={{ maxWidth: 520 }}>
          Join thousands of teams using AgentHub to automate their most complex workflows.
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
export function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <CTA />
    </>
  );
}
