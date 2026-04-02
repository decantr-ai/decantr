import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Shield,
  Zap,
  Code2,
  MessageSquare,
  Lock,
  ArrowRight,
  Check,
  Star,
  ChevronRight,
} from 'lucide-react';
import { Button, Card, Avatar, Badge } from '@/components';

/* ---------- hero ---------- */
function Hero() {
  return (
    <section className={css('_flex _col _aic _textc _py20 _px4') + ' carbon-fade-slide'}>
      <Badge>Now in public beta</Badge>
      <h1 className={css('_heading1 _mt4')} style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', lineHeight: 1.15, maxWidth: 720 }}>
        AI-powered conversations,{' '}
        <span style={{ color: 'var(--d-primary)' }}>refined</span>
      </h1>
      <p className={css('_textlg _fgmuted _mt4')} style={{ maxWidth: 560 }}>
        Carbon AI is a production-grade conversational assistant built for developers and teams who demand clarity, speed, and depth.
      </p>
      <div className={css('_flex _aic _gap3 _mt8')}>
        <Link to="/register">
          <Button variant="primary" size="lg">
            Get started free
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
  { icon: MessageSquare, title: 'Conversational AI', desc: 'Natural multi-turn dialogue with context retention across sessions.' },
  { icon: Code2, title: 'Code Intelligence', desc: 'Syntax-aware responses with inline code highlighting and execution.' },
  { icon: Shield, title: 'Enterprise Security', desc: 'SOC 2 compliant with end-to-end encryption and SSO support.' },
  { icon: Zap, title: 'Real-time Streaming', desc: 'Token-by-token streaming for instant, responsive interactions.' },
  { icon: Lock, title: 'Privacy First', desc: 'Your data stays yours. No training on conversations, full data controls.' },
  { icon: Sparkles, title: 'Custom Models', desc: 'Bring your own models or fine-tune on your domain-specific data.' },
];

function Features() {
  return (
    <section className="section-gap" style={{ background: 'var(--d-surface)' }}>
      <div className="container">
        <div className={css('_textc _mb12')}>
          <h2 className={css('_heading2')}>Built for serious work</h2>
          <p className={css('_textlg _fgmuted _mt2')}>Everything you need to integrate AI into your workflow.</p>
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
  { num: '01', title: 'Create an account', desc: 'Sign up in seconds with email or SSO. No credit card required.' },
  { num: '02', title: 'Start a conversation', desc: 'Ask anything -- code, analysis, writing. Carbon understands context.' },
  { num: '03', title: 'Iterate and refine', desc: 'Multi-turn dialogue with memory. Build on previous responses.' },
  { num: '04', title: 'Export and integrate', desc: 'Share conversations, export to Markdown, or integrate via API.' },
];

function HowItWorks() {
  return (
    <section className="section-gap">
      <div className="container">
        <div className={css('_textc _mb12')}>
          <h2 className={css('_heading2')}>How it works</h2>
          <p className={css('_textlg _fgmuted _mt2')}>Four steps to more productive AI conversations.</p>
        </div>
        <div className={css('_grid _gc1 _sm:gc2 _lg:gc4 _gap6')}>
          {steps.map((s) => (
            <div key={s.num} className={css('_flex _col _gap3')}>
              <span className={css('_fontsemi _fgprimary')} style={{ fontSize: '2rem', fontVariantNumeric: 'tabular-nums' }}>
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
    desc: 'For personal projects and exploration.',
    features: ['50 messages / day', 'Basic models', 'Markdown export', 'Community support'],
    cta: 'Get started',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$20',
    period: '/month',
    desc: 'For developers who need more power.',
    features: ['Unlimited messages', 'Advanced models', 'Code execution', 'API access', 'Priority support'],
    cta: 'Start free trial',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For teams with compliance needs.',
    features: ['Everything in Pro', 'SSO / SAML', 'Custom models', 'SLA guarantee', 'Dedicated support', 'On-premise option'],
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
          <p className={css('_textlg _fgmuted _mt2')}>Start free. Upgrade when you need to.</p>
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
                <Link to="/register">
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
    quote: 'Carbon AI replaced three different tools in our workflow. The code intelligence alone is worth the subscription.',
    name: 'Sarah Chen',
    role: 'Staff Engineer, Vercel',
  },
  {
    quote: 'Finally an AI chat that understands context. I can pick up conversations from weeks ago and it just works.',
    name: 'Marcus Rivera',
    role: 'CTO, Acme Corp',
  },
  {
    quote: 'The enterprise security features gave our compliance team confidence. Deployment was seamless.',
    name: 'Priya Sharma',
    role: 'VP Engineering, DataFlow',
  },
];

function Testimonials() {
  return (
    <section className="section-gap">
      <div className="container">
        <div className={css('_textc _mb12')}>
          <h2 className={css('_heading2')}>Trusted by developers</h2>
          <p className={css('_textlg _fgmuted _mt2')}>See what teams are saying about Carbon AI.</p>
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
        <h2 className={css('_heading2')}>Ready to get started?</h2>
        <p className={css('_textlg _fgmuted _mt2')} style={{ maxWidth: 480 }}>
          Join thousands of developers using Carbon AI to work smarter, not harder.
        </p>
        <div className={css('_flex _aic _gap3 _mt8')}>
          <Link to="/register">
            <Button variant="primary" size="lg">
              Create free account
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
