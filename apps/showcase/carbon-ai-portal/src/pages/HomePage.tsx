import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import {
  Zap,
  Shield,
  Code2,
  MessageSquare,
  Upload,
  Globe,
  ArrowRight,
  Check,
  Star,
  ChevronRight,
} from 'lucide-react';

/* ---------- HERO ---------- */
function Hero() {
  return (
    <section className="section section--hero">
      <div className={'section__inner ' + css('_flex _col _aic _textc')}>
      <div className={css('_flex _col _aic _gap6')} style={{ maxWidth: '720px' }}>
        <span
          className={css('_inlineflex _aic _gap2 _px3 _py1 _textsm _fontsemi _fgprimary _rounded')}
          style={{ background: 'rgba(124,147,176,0.12)', border: '1px solid rgba(124,147,176,0.2)' }}
        >
          <Zap size={14} />
          Now in public beta
        </span>
        <h1 className={css('_heading1 _fgtext')} style={{ fontSize: '3.25rem', lineHeight: 1.1 }}>
          AI conversations that<br />move work forward
        </h1>
        <p className={css('_textlg _fgmuted')} style={{ maxWidth: '560px', lineHeight: 1.7 }}>
          Carbon AI is a production-ready chatbot that understands context, generates code, and
          collaborates with your team. Fast, private, built for professionals.
        </p>
        <div className={css('_flex _aic _gap3 _wrap _jcc')}>
          <Link to="/chat">
            <Button variant="primary" size="lg" icon={<MessageSquare size={18} />}>
              Start a conversation
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="secondary" size="lg" icon={<ArrowRight size={18} />}>
              Learn more
            </Button>
          </Link>
        </div>
      </div>
      </div>
    </section>
  );
}

/* ---------- FEATURES ---------- */
const features = [
  {
    icon: <MessageSquare size={22} />,
    title: 'Natural Conversation',
    desc: 'Multi-turn dialogue that remembers context across sessions. Attach files, mention teammates, and export threads.',
  },
  {
    icon: <Code2 size={22} />,
    title: 'Code Generation',
    desc: 'Syntax-highlighted code blocks with one-click copy. Supports 40+ languages with inline explanations.',
  },
  {
    icon: <Shield size={22} />,
    title: 'Enterprise Security',
    desc: 'End-to-end encryption, MFA, session management, and granular access controls. SOC 2 compliant.',
  },
  {
    icon: <Upload size={22} />,
    title: 'File Understanding',
    desc: 'Upload documents, images, and datasets. Carbon AI extracts meaning and answers questions about your content.',
  },
  {
    icon: <Zap size={22} />,
    title: 'Blazing Performance',
    desc: 'Sub-200ms response times with streaming output. Built on cutting-edge infrastructure for low latency.',
  },
  {
    icon: <Globe size={22} />,
    title: 'Team Collaboration',
    desc: 'Share conversations, assign threads to teammates, and build a shared knowledge base over time.',
  },
];

function Features() {
  return (
    <section className="section section--alt">
      <div className="section__inner">
        <div className={css('_textc _mb12')}>
          <h2 className={css('_heading2 _fgtext _mb3')}>
            Everything you need for AI-powered work
          </h2>
          <p className={css('_textlg _fgmuted')} style={{ maxWidth: '560px', margin: '0 auto' }}>
            A thoughtfully designed platform that puts intelligence at your fingertips without getting in the way.
          </p>
        </div>
        <div className={css('_grid _gc1 _md:gc2 _lg:gc3 _gap6')}>
          {features.map((f) => (
            <div
              key={f.title}
              className={css('_flex _col _gap3 _p6 _rounded') + ' carbon-card hover-lift'}
            >
              <div
                className={css('_flex _aic _jcc _rounded')}
                style={{
                  width: '44px',
                  height: '44px',
                  background: 'rgba(124,147,176,0.12)',
                  color: 'var(--d-primary)',
                }}
              >
                {f.icon}
              </div>
              <h3 className={css('_fontsemi _textlg _fgtext')}>{f.title}</h3>
              <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.7 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- HOW IT WORKS ---------- */
const steps = [
  {
    num: '01',
    title: 'Sign up in seconds',
    desc: 'Create an account with email or SSO. No credit card required for the free tier.',
  },
  {
    num: '02',
    title: 'Start a conversation',
    desc: 'Type a question, paste code, or upload a file. Carbon AI adapts to your intent.',
  },
  {
    num: '03',
    title: 'Iterate and refine',
    desc: 'Follow up naturally. Carbon AI remembers the full context of your conversation.',
  },
  {
    num: '04',
    title: 'Share and collaborate',
    desc: 'Export threads, invite teammates, or integrate with your existing tools via API.',
  },
];

function HowItWorks() {
  return (
    <section className="section">
      <div className="section__inner" style={{ maxWidth: '800px' }}>
        <div className={css('_textc _mb12')}>
          <h2 className={css('_heading2 _fgtext _mb3')}>How it works</h2>
          <p className={css('_textlg _fgmuted')}>
            From sign-up to production in four simple steps.
          </p>
        </div>
        <div className={css('_flex _col _gap8')}>
          {steps.map((s) => (
            <div key={s.num} className={css('_flex _gap6 _aic')}>
              <div
                className={css('_flex _aic _jcc _shrink0 _fontbold _text2xl _fgprimary')}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--d-radius)',
                  background: 'rgba(124,147,176,0.1)',
                  border: '1px solid rgba(124,147,176,0.15)',
                }}
              >
                {s.num}
              </div>
              <div className={css('_flex _col _gap1')}>
                <h3 className={css('_fontsemi _textlg _fgtext')}>{s.title}</h3>
                <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.7 }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- PRICING ---------- */
const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    desc: 'For individuals exploring AI assistance.',
    features: ['50 messages/day', '1 workspace', 'Community support', 'Basic file uploads'],
    cta: 'Get started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$20',
    period: '/month',
    desc: 'For professionals who rely on AI daily.',
    features: [
      'Unlimited messages',
      '5 workspaces',
      'Priority support',
      'Advanced file analysis',
      'API access',
      'Export threads',
    ],
    cta: 'Start free trial',
    popular: true,
  },
  {
    name: 'Team',
    price: '$45',
    period: '/user/month',
    desc: 'For teams building with AI at scale.',
    features: [
      'Everything in Pro',
      'Unlimited workspaces',
      'Admin dashboard',
      'SSO & SAML',
      'Audit logs',
      'SLA guarantee',
    ],
    cta: 'Contact sales',
    popular: false,
  },
];

function Pricing() {
  return (
    <section className="section section--alt">
      <div className="section__inner">
        <div className={css('_textc _mb12')}>
          <h2 className={css('_heading2 _fgtext _mb3')}>Simple, transparent pricing</h2>
          <p className={css('_textlg _fgmuted')}>
            Start free. Scale when you are ready.
          </p>
        </div>
        <div className={css('_grid _gc1 _md:gc3 _gap6 _aic')}>
          {tiers.map((t) => (
            <div
              key={t.name}
              className={css('_flex _col _p6 _rounded _rel') + ' carbon-card hover-lift'}
              style={
                t.popular
                  ? { border: '1px solid var(--d-primary)', boxShadow: '0 0 30px rgba(124,147,176,0.12)' }
                  : undefined
              }
            >
              {t.popular && (
                <span
                  className={css('_abs') + ' badge-popular'}
                  style={{ top: '-10px', right: '16px' }}
                >
                  Most popular
                </span>
              )}
              <h3 className={css('_fontsemi _textlg _fgtext _mb1')}>{t.name}</h3>
              <p className={css('_textsm _fgmuted _mb4')}>{t.desc}</p>
              <div className={css('_flex _aibl _gap1 _mb6')}>
                <span className={css('_fontbold _fgtext')} style={{ fontSize: '2.5rem' }}>
                  {t.price}
                </span>
                <span className={css('_textsm _fgmuted')}>{t.period}</span>
              </div>
              <ul className={css('_flex _col _gap3 _mb6')}>
                {t.features.map((feat) => (
                  <li key={feat} className={css('_flex _aic _gap2 _textsm')}>
                    <Check size={16} style={{ color: 'var(--d-success)', flexShrink: 0 }} />
                    <span className={css('_fgmuted')}>{feat}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" style={{ marginTop: 'auto' }}>
                <Button
                  variant={t.popular ? 'primary' : 'secondary'}
                  className={css('_wfull _jcc')}
                >
                  {t.cta}
                  <ChevronRight size={16} />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- TESTIMONIALS ---------- */
const testimonials = [
  {
    quote:
      'Carbon AI has completely changed how our engineering team approaches problem solving. The context awareness is remarkable.',
    name: 'Sarah Chen',
    role: 'VP Engineering, Acme Corp',
  },
  {
    quote:
      'We replaced three separate tools with Carbon AI. The code generation alone saves each developer 2 hours per day.',
    name: 'Marcus Johnson',
    role: 'CTO, DataFlow Inc',
  },
  {
    quote:
      'The security features give us confidence to use AI in regulated industries. SSO, audit logs, and encryption out of the box.',
    name: 'Elena Rodriguez',
    role: 'CISO, FinSecure',
  },
];

function Testimonials() {
  return (
    <section className="section">
      <div className="section__inner">
        <div className={css('_textc _mb12')}>
          <h2 className={css('_heading2 _fgtext _mb3')}>
            Trusted by engineering teams
          </h2>
        </div>
        <div className={css('_grid _gc1 _md:gc3 _gap6')}>
          {testimonials.map((t) => (
            <div
              key={t.name}
              className={css('_flex _col _gap4 _p6 _rounded') + ' carbon-card hover-lift'}
            >
              <div className={css('_flex _gap1')}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    style={{ color: 'var(--d-warning)', fill: 'var(--d-warning)' }}
                  />
                ))}
              </div>
              <p className={css('_textsm _fgmuted _italic')} style={{ lineHeight: 1.7 }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className={css('_flex _col _gap0')} style={{ marginTop: 'auto' }}>
                <span className={css('_textsm _fontsemi _fgtext')}>{t.name}</span>
                <span className={css('_textxs _fgmuted')}>{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA ---------- */
function CtaSection() {
  return (
    <section className="section section--alt">
      <div className={'section__inner ' + css('_flex _col _aic _gap6 _textc')} style={{ maxWidth: '600px' }}>
        <h2 className={css('_heading2 _fgtext')}>
          Ready to work smarter?
        </h2>
        <p className={css('_textlg _fgmuted')} style={{ lineHeight: 1.7 }}>
          Join thousands of professionals who use Carbon AI to accelerate their work, every day.
        </p>
        <div className={css('_flex _aic _gap3')}>
          <Link to="/register">
            <Button variant="primary" size="lg" icon={<ArrowRight size={18} />}>
              Create free account
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- PAGE ---------- */
export function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <CtaSection />
    </>
  );
}
