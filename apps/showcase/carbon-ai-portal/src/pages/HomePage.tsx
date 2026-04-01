import { Link } from 'react-router-dom';
import { css } from '@decantr/css';

/* ---------- Hero ---------- */
function Hero() {
  return (
    <section
      className={css('_flex _col _aic _textc _py24 _px6') + ' carbon-fade-slide'}
      style={{ background: 'var(--d-bg)' }}
    >
      <div style={{ maxWidth: 720 }}>
        <h1 className={css('_heading1 _fgtext')} style={{ marginBottom: 'var(--d-gap-4)' }}>
          AI-Powered Developer Assistant
        </h1>
        <p className={css('_textlg _fgmuted')} style={{ marginBottom: 'var(--d-gap-8)', lineHeight: 1.7 }}>
          Ship faster with an intelligent coding companion that understands your codebase,
          writes clean code, and helps you debug in real time.
        </p>
        <div className={css('_flex _aic _jcc _gap3 _wrap')}>
          <Link
            to="/chat"
            className={css('_bgprimary _fgtext _fontsemi _px6 _py3 _rounded _textbase')}
            style={{ textDecoration: 'none', transition: 'background 0.15s ease' }}
          >
            Start Chatting
          </Link>
          <Link
            to="/about"
            className={css('_fgmuted _fontsemi _px6 _py3 _rounded _textbase')}
            style={{ textDecoration: 'none', border: '1px solid var(--d-border)' }}
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- Features ---------- */
const features = [
  {
    icon: '\u26A1',
    title: 'Lightning Fast',
    desc: 'Sub-second responses powered by optimized inference. No waiting around for answers.',
  },
  {
    icon: '\uD83D\uDD12',
    title: 'Secure by Default',
    desc: 'End-to-end encryption for every conversation. Your code never leaves your control.',
  },
  {
    icon: '\uD83E\uDDE0',
    title: 'Context Aware',
    desc: 'Understands your entire codebase structure, dependencies, and coding patterns.',
  },
  {
    icon: '\uD83D\uDCBB',
    title: 'Code Generation',
    desc: 'Generate production-ready code with proper error handling and type safety built in.',
  },
  {
    icon: '\uD83D\uDD0D',
    title: 'Smart Debugging',
    desc: 'Trace bugs across your stack. Get root-cause analysis, not just stack traces.',
  },
  {
    icon: '\uD83D\uDCCA',
    title: 'Usage Analytics',
    desc: 'Track productivity gains with built-in analytics and exportable reports.',
  },
];

function Features() {
  return (
    <section className={css('_py24 _px6')} style={{ background: 'var(--d-surface)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 className={css('_heading2 _fgtext _textc')} style={{ marginBottom: 'var(--d-gap-3)' }}>
          Built for Developers
        </h2>
        <p className={css('_textbase _fgmuted _textc')} style={{ marginBottom: 'var(--d-gap-12)', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
          Every feature designed to accelerate your development workflow.
        </p>
        <div className={css('_grid _gc1 _sm:gc2 _lg:gc3 _gap6')}>
          {features.map((f) => (
            <div key={f.title} className={css('_p6 _flex _col _gap3') + ' carbon-card'}>
              <span className={css('_text2xl')}>{f.icon}</span>
              <h3 className={css('_textlg _fontsemi _fgtext')}>{f.title}</h3>
              <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- How It Works ---------- */
const steps = [
  { num: '01', title: 'Connect your repo', desc: 'Link your GitHub, GitLab, or Bitbucket repository in one click.' },
  { num: '02', title: 'Ask a question', desc: 'Describe what you need in natural language. Code, debug, or explore.' },
  { num: '03', title: 'Get results', desc: 'Receive contextual answers with working code you can apply directly.' },
];

function HowItWorks() {
  return (
    <section className={css('_py24 _px6')} style={{ background: 'var(--d-bg)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h2 className={css('_heading2 _fgtext _textc')} style={{ marginBottom: 'var(--d-gap-12)' }}>
          How It Works
        </h2>
        <div className={css('_flex _col _gap8')}>
          {steps.map((s) => (
            <div key={s.num} className={css('_flex _gap6 _aic') + ' carbon-fade-slide'}>
              <div
                className={css('_flex _aic _jcc _shrink0 _fontsemi _fgprimary _text2xl')}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--d-radius-lg)',
                  border: '1px solid var(--d-border)',
                  background: 'var(--d-surface)',
                }}
              >
                {s.num}
              </div>
              <div>
                <h3 className={css('_textlg _fontsemi _fgtext')} style={{ marginBottom: 'var(--d-gap-1)' }}>
                  {s.title}
                </h3>
                <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Pricing ---------- */
const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    features: ['50 messages/day', 'Basic code generation', 'Community support', 'Single repository'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    features: ['Unlimited messages', 'Advanced code generation', 'Priority support', 'Unlimited repositories', 'Custom integrations'],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Everything in Pro', 'SSO & SAML', 'Dedicated instance', 'SLA guarantee', 'On-premise option'],
    cta: 'Contact Sales',
    highlight: false,
  },
];

function Pricing() {
  return (
    <section className={css('_py24 _px6')} style={{ background: 'var(--d-surface)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 className={css('_heading2 _fgtext _textc')} style={{ marginBottom: 'var(--d-gap-3)' }}>
          Simple Pricing
        </h2>
        <p className={css('_textbase _fgmuted _textc')} style={{ marginBottom: 'var(--d-gap-12)' }}>
          Start free. Scale when you need to.
        </p>
        <div className={css('_grid _gc1 _lg:gc3 _gap6')}>
          {tiers.map((t) => (
            <div
              key={t.name}
              className={css('_p6 _flex _col _gap6') + ' carbon-card'}
              style={t.highlight ? { border: '1px solid var(--d-primary)' } : undefined}
            >
              <div>
                <h3 className={css('_textlg _fontsemi _fgtext')} style={{ marginBottom: 'var(--d-gap-2)' }}>
                  {t.name}
                </h3>
                <div className={css('_flex _aife _gap1')}>
                  <span className={css('_text3xl _fontbold _fgtext')}>{t.price}</span>
                  {t.period && <span className={css('_textsm _fgmuted')}>{t.period}</span>}
                </div>
              </div>
              <ul className={css('_flex _col _gap3 _flex1')} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {t.features.map((f) => (
                  <li key={f} className={css('_textsm _fgmuted _flex _gap2 _aic')}>
                    <span className={css('_fgprimary')}>&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={css(
                  '_textc _fontsemi _px4 _py3 _rounded _textsm _block',
                  t.highlight ? '_bgprimary _fgtext' : '_fgtext',
                )}
                style={{
                  textDecoration: 'none',
                  border: t.highlight ? 'none' : '1px solid var(--d-border)',
                  display: 'block',
                }}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */
const testimonials = [
  {
    quote: 'Carbon AI cut our debugging time in half. The context awareness is unlike anything else on the market.',
    author: 'Sarah Chen',
    role: 'Staff Engineer, Vercel',
  },
  {
    quote: 'Finally an AI tool that actually understands TypeScript generics. Our team adopted it within a week.',
    author: 'Marcus Johnson',
    role: 'CTO, Streamline',
  },
  {
    quote: 'The code generation quality is remarkable. It handles edge cases that I would have missed.',
    author: 'Priya Patel',
    role: 'Senior Dev, Stripe',
  },
];

function Testimonials() {
  return (
    <section className={css('_py24 _px6')} style={{ background: 'var(--d-bg)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 className={css('_heading2 _fgtext _textc')} style={{ marginBottom: 'var(--d-gap-12)' }}>
          Loved by Developers
        </h2>
        <div className={css('_grid _gc1 _lg:gc3 _gap6')}>
          {testimonials.map((t) => (
            <div key={t.author} className={css('_p6 _flex _col _gap4') + ' carbon-glass'}>
              <p className={css('_textsm _fgtext _italic _flex1')} style={{ lineHeight: 1.7 }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className={css('_textsm _fontsemi _fgtext')}>{t.author}</p>
                <p className={css('_textxs _fgmuted')}>{t.role}</p>
              </div>
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
    <section className={css('_py24 _px6 _textc')} style={{ background: 'var(--d-surface)' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 className={css('_heading2 _fgtext')} style={{ marginBottom: 'var(--d-gap-4)' }}>
          Ready to Code Smarter?
        </h2>
        <p className={css('_textbase _fgmuted')} style={{ marginBottom: 'var(--d-gap-8)' }}>
          Join thousands of developers shipping better code faster with Carbon AI.
        </p>
        <Link
          to="/register"
          className={css('_bgprimary _fgtext _fontsemi _px8 _py3 _rounded _textbase')}
          style={{ textDecoration: 'none' }}
        >
          Get Started Free
        </Link>
      </div>
    </section>
  );
}

/* ---------- Page ---------- */
export function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <Cta />
    </>
  );
}
