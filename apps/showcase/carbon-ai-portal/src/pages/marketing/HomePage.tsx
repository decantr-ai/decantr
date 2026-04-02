import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import {
  Zap, Brain, Shield, Code, MessageSquare, Lock,
  ArrowRight, Check, Star, ChevronRight,
} from 'lucide-react';
import { TopNavFooterShell } from '@/layouts/TopNavFooterShell';
import { Button, Card, Avatar, Badge } from '@/components';

/* -- Hero --------------------------------------------------------- */
function HeroSection() {
  return (
    <section className={css('_flex _col _aic _textc _py20 _px4')}>
      <div className={css('_flex _col _aic _gap6')} style={{ maxWidth: '720px' }}>
        <Badge variant="primary">Now in public beta</Badge>
        <h1 className={css('_text3xl _fontsemi _fgtext')} style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.15 }}>
          AI that understands your code, not just your questions
        </h1>
        <p className={css('_textlg _fgmuted')} style={{ maxWidth: '560px' }}>
          Carbon AI is a developer-first assistant that pairs deep code understanding with natural conversation. Ship faster with an AI that thinks like your best engineer.
        </p>
        <div className={css('_flex _aic _gap3 _wrap _jcc')}>
          <Link to="/chat">
            <Button variant="primary" size="lg">
              Start for free
              <ArrowRight size={18} />
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="outline" size="lg">
              Learn more
            </Button>
          </Link>
        </div>
        <p className={css('_textsm _fgmuted')}>No credit card required</p>
      </div>
    </section>
  );
}

/* -- Features ----------------------------------------------------- */
const features = [
  { icon: Brain, title: 'Context-aware', description: 'Understands your codebase structure, patterns, and conventions across the entire project.' },
  { icon: Code, title: 'Code generation', description: 'Generate production-ready code with proper types, error handling, and test coverage.' },
  { icon: MessageSquare, title: 'Natural conversation', description: 'Chat naturally about your code. Ask follow-ups, request changes, iterate on solutions.' },
  { icon: Shield, title: 'Secure by default', description: 'Your code never leaves your environment. End-to-end encryption for all conversations.' },
  { icon: Zap, title: 'Fast responses', description: 'Sub-second response times powered by optimized inference. No waiting around.' },
  { icon: Lock, title: 'Enterprise ready', description: 'SOC 2 compliant, SSO support, team management, and audit logs built in.' },
];

function FeaturesSection() {
  return (
    <section className={css('_px4') + ' section-padding'} style={{ background: 'var(--d-surface)' }}>
      <div className={css('_flex _col _gap12') + ' container'}>
        <div className={css('_flex _col _aic _gap3 _textc')}>
          <h2 className={css('_text2xl _fontsemi _fgtext')} style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
            Built for developers who ship
          </h2>
          <p className={css('_textlg _fgmuted')} style={{ maxWidth: '560px' }}>
            Every feature designed to keep you in flow state.
          </p>
        </div>
        <div className={css('_grid _gap6')} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {features.map((feature) => (
            <Card key={feature.title} hover>
              <div className={css('_flex _col _gap3')}>
                <div
                  className={css('_flex _aic _jcc _rounded')}
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'color-mix(in srgb, var(--d-primary) 15%, transparent)',
                  }}
                >
                  <feature.icon size={20} className={css('_fgprimary')} />
                </div>
                <h3 className={css('_textlg _fontsemi _fgtext')}>{feature.title}</h3>
                <p className={css('_textsm _fgmuted')}>{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -- How it works -------------------------------------------------- */
const steps = [
  { number: '01', title: 'Connect your project', description: 'Point Carbon AI at your repository. It indexes your codebase in seconds.' },
  { number: '02', title: 'Ask anything', description: 'Ask questions about your code, request changes, or start a conversation about architecture.' },
  { number: '03', title: 'Iterate and ship', description: 'Review generated code, request adjustments, and commit directly from the chat interface.' },
];

function HowItWorksSection() {
  return (
    <section className={css('_px4') + ' section-padding'}>
      <div className={css('_flex _col _gap12') + ' container'}>
        <div className={css('_flex _col _aic _gap3 _textc')}>
          <h2 className={css('_text2xl _fontsemi _fgtext')} style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
            Up and running in minutes
          </h2>
          <p className={css('_textlg _fgmuted')} style={{ maxWidth: '560px' }}>
            Three steps from zero to shipping with AI assistance.
          </p>
        </div>
        <div className={css('_grid _gap8')} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {steps.map((step) => (
            <div key={step.number} className={css('_flex _col _gap3')}>
              <span className={css('_text3xl _fontbold _fgprimary')} style={{ fontFamily: 'ui-monospace, monospace' }}>
                {step.number}
              </span>
              <h3 className={css('_textlg _fontsemi _fgtext')}>{step.title}</h3>
              <p className={css('_textsm _fgmuted')}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -- Pricing ------------------------------------------------------ */
const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For side projects and exploration.',
    features: ['50 messages per day', '1 project', 'Basic code generation', 'Community support'],
    cta: 'Get started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$20',
    period: '/month',
    description: 'For professional developers.',
    features: ['Unlimited messages', 'Unlimited projects', 'Advanced code generation', 'Priority support', 'Custom instructions', 'API access'],
    cta: 'Start free trial',
    popular: true,
  },
  {
    name: 'Team',
    price: '$15',
    period: '/user/month',
    description: 'For engineering teams.',
    features: ['Everything in Pro', 'Team workspaces', 'SSO & SAML', 'Admin dashboard', 'Audit logs', 'Dedicated support'],
    cta: 'Contact sales',
    popular: false,
  },
];

function PricingSection() {
  return (
    <section className={css('_px4') + ' section-padding'} style={{ background: 'var(--d-surface)' }}>
      <div className={css('_flex _col _gap12') + ' container'}>
        <div className={css('_flex _col _aic _gap3 _textc')}>
          <h2 className={css('_text2xl _fontsemi _fgtext')} style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
            Simple, transparent pricing
          </h2>
          <p className={css('_textlg _fgmuted')}>Start free, scale as you grow.</p>
        </div>
        <div className={css('_grid _gap6 _aic')} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {tiers.map((tier) => (
            <Card key={tier.name} className={tier.popular ? css('_rel') : undefined} style={tier.popular ? { border: '2px solid var(--d-primary)' } : undefined}>
              <div className={css('_flex _col _gap4')}>
                {tier.popular && (
                  <Badge variant="primary">Most popular</Badge>
                )}
                <div className={css('_flex _col _gap1')}>
                  <h3 className={css('_textlg _fontsemi _fgtext')}>{tier.name}</h3>
                  <p className={css('_textsm _fgmuted')}>{tier.description}</p>
                </div>
                <div className={css('_flex _aic _aibl _gap1')}>
                  <span className={css('_text3xl _fontbold _fgtext')}>{tier.price}</span>
                  <span className={css('_textsm _fgmuted')}>{tier.period}</span>
                </div>
                <ul className={css('_flex _col _gap2')}>
                  {tier.features.map((feature) => (
                    <li key={feature} className={css('_flex _aic _gap2 _textsm _fgmuted')}>
                      <Check size={14} className={css('_fgprimary _shrink0')} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to={tier.name === 'Team' ? '/contact' : '/register'}>
                  <Button variant={tier.popular ? 'primary' : 'outline'} className={css('_wfull')}>
                    {tier.cta}
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

/* -- Testimonials -------------------------------------------------- */
const testimonials = [
  { quote: 'Carbon AI cut our sprint velocity in half. It understands our codebase better than some of our engineers.', author: 'Sarah Chen', role: 'VP Engineering, Stripe', rating: 5 },
  { quote: 'The context awareness is unreal. It remembers my conventions and applies them consistently across the entire project.', author: 'Marcus Rivera', role: 'Senior Engineer, Vercel', rating: 5 },
  { quote: 'We replaced three internal tools with Carbon AI. Code review, generation, and documentation -- all in one place.', author: 'Emily Park', role: 'CTO, Linear', rating: 5 },
];

function TestimonialsSection() {
  return (
    <section className={css('_px4') + ' section-padding'}>
      <div className={css('_flex _col _gap12') + ' container'}>
        <div className={css('_flex _col _aic _gap3 _textc')}>
          <h2 className={css('_text2xl _fontsemi _fgtext')} style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
            Loved by developers
          </h2>
        </div>
        <div className={css('_grid _gap6')} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {testimonials.map((t) => (
            <Card key={t.author}>
              <div className={css('_flex _col _gap4')}>
                <div className={css('_flex _gap1')}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="var(--d-warning)" className={css('_fgwarning')} />
                  ))}
                </div>
                <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.7 }}>
                  "{t.quote}"
                </p>
                <div className={css('_flex _aic _gap3')}>
                  <Avatar size="sm" fallback={t.author[0]} />
                  <div className={css('_flex _col')}>
                    <span className={css('_textsm _fontmedium _fgtext')}>{t.author}</span>
                    <span className={css('_textxs _fgmuted')}>{t.role}</span>
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

/* -- CTA ---------------------------------------------------------- */
function CtaSection() {
  return (
    <section className={css('_px4') + ' section-padding'} style={{ background: 'var(--d-surface)' }}>
      <div className={css('_flex _col _aic _gap6 _textc') + ' container'}>
        <h2 className={css('_text2xl _fontsemi _fgtext')} style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
          Ready to ship faster?
        </h2>
        <p className={css('_textlg _fgmuted')} style={{ maxWidth: '480px' }}>
          Join thousands of developers already building with Carbon AI. Free to start, no credit card required.
        </p>
        <div className={css('_flex _aic _gap3')}>
          <Link to="/chat">
            <Button variant="primary" size="lg">
              Start for free
              <ArrowRight size={18} />
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" size="lg">Contact sales</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* -- Page --------------------------------------------------------- */
export function HomePage() {
  return (
    <TopNavFooterShell>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <CtaSection />
    </TopNavFooterShell>
  );
}
