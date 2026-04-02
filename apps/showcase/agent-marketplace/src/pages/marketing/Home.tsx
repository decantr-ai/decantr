import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  Bot, Brain, Shield, Zap, Activity, BarChart3,
  Workflow, Eye, Database, ArrowRight, Check, Star,
} from 'lucide-react';

const features = [
  { icon: Bot, title: 'Agent Swarm Management', description: 'Deploy, monitor, and orchestrate hundreds of autonomous agents from a single mission control interface.' },
  { icon: Brain, title: 'Neural Feedback Loops', description: 'Real-time confidence visualization with bio-mimetic pulse animations that make invisible AI processes tangible.' },
  { icon: Shield, title: 'Security First', description: 'Prompt injection detection, data exfiltration monitoring, and MFA-protected configuration changes.' },
  { icon: Zap, title: 'Sub-Second Alerting', description: 'Anomaly detection with p99 latency tracking. Know about issues before your users do.' },
  { icon: Workflow, title: 'Intelligent Routing', description: 'Reinforcement learning-powered task distribution across heterogeneous agent clusters.' },
  { icon: Eye, title: 'Full Transparency', description: 'Inference logs, confidence distributions, and decision traceability for every agent action.' },
];

const steps = [
  { step: 1, title: 'Deploy Agents', description: 'Choose from the marketplace or bring your own. One-click deployment to your infrastructure.' },
  { step: 2, title: 'Configure Swarm', description: 'Set resource limits, routing rules, and monitoring thresholds. Auto-scaling handles the rest.' },
  { step: 3, title: 'Monitor & Optimize', description: 'Real-time dashboards, inference logs, and confidence metrics keep your swarm running at peak.' },
];

const tiers = [
  {
    name: 'Starter', monthlyPrice: 0, yearlyPrice: 0, description: 'For individual operators',
    features: ['Up to 5 agents', '10k tasks/month', 'Basic monitoring', 'Community support', 'Public marketplace access'],
    cta: 'Get Started', highlighted: false,
  },
  {
    name: 'Pro', monthlyPrice: 79, yearlyPrice: 790, description: 'For growing teams',
    features: ['Up to 50 agents', '500k tasks/month', 'Advanced monitoring', 'Priority support', 'Full marketplace access', 'Custom agent deployment', 'Team collaboration'],
    cta: 'Start Free Trial', highlighted: true,
  },
  {
    name: 'Enterprise', monthlyPrice: -1, yearlyPrice: -1, description: 'For mission-critical operations',
    features: ['Unlimited agents', 'Unlimited tasks', 'Enterprise monitoring', 'Dedicated support', 'Private marketplace', 'On-premise deployment', 'SSO & SCIM', 'SLA guarantee'],
    cta: 'Contact Sales', highlighted: false,
  },
];

const testimonials = [
  { quote: 'Agent::Ctrl reduced our incident response time from hours to seconds. The swarm topology view is a game-changer for our ops team.', author: 'Sarah Chen', role: 'VP Engineering, DataFlow', avatar: 'SC' },
  { quote: 'The marketplace lets us assemble custom agent pipelines in minutes instead of months. Our data processing throughput increased 12x.', author: 'Marcus Rivera', role: 'CTO, NeuralOps', avatar: 'MR' },
  { quote: 'Finally, an AI operations platform that treats transparency as a first-class feature. The inference logs are indispensable for our compliance team.', author: 'Dr. Anika Patel', role: 'Head of AI Ethics, TrustLab', avatar: 'AP' },
];

export function Home() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className={css('_flex _col')}>
      {/* Hero */}
      <section className={css('_flex _col _aic _textc _py20 _px6 _gap6')}>
        <div className={css('_flex _aic _gap2')}>
          <span className={'status-ring status-online pulse'} />
          <span className={'font-mono ' + css('_textxs _fgsuccess _uppercase')}>All Systems Operational</span>
        </div>
        <h1 className={'font-mono neon-text-glow ' + css('_fontbold')} style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1.1, maxWidth: 800 }}>
          Mission control for autonomous agent swarms
        </h1>
        <p className={'font-mono ' + css('_textlg _fgmuted')} style={{ maxWidth: 560 }}>
          Deploy, monitor, and orchestrate AI agents at scale. Real-time transparency for every decision, every action, every millisecond.
        </p>
        <div className={css('_flex _gap3 _mt2')}>
          <Link to="/register" className="btn btn-primary btn-lg">
            <Bot size={18} /> Start Building <ArrowRight size={16} />
          </Link>
          <Link to="/agents" className="btn btn-secondary btn-lg font-mono">
            Live Demo
          </Link>
        </div>
        <p className={'font-mono ' + css('_textxs _fgmuted _mt2')}>
          No credit card required. Free tier includes 5 agents.
        </p>
      </section>

      {/* Features */}
      <section id="features" className={css('_py16 _px6')}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className={css('_textc _mb12')}>
            <span className={'font-mono badge badge-info ' + css('_mb3')}>CAPABILITIES</span>
            <h2 className={'font-mono ' + css('_text3xl _fontbold _mt3')}>Everything you need to operate at scale</h2>
            <p className={'font-mono ' + css('_textlg _fgmuted _mt3')} style={{ maxWidth: 480, margin: '0.75rem auto 0' }}>
              Built for operators who demand full visibility and control.
            </p>
          </div>
          <div className={css('_grid _gc1 _sm:gc2 _lg:gc3 _gap6')}>
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className={css('_flex _col _gap3 _p5') + ' carbon-card hover-lift'}>
                  <div
                    className={css('_flex _aic _jcc _rounded')}
                    style={{ width: 40, height: 40, background: 'color-mix(in srgb, var(--d-primary) 15%, transparent)' }}
                  >
                    <Icon size={20} style={{ color: 'var(--d-primary)' }} />
                  </div>
                  <h3 className={'font-mono ' + css('_fontsemi')}>{f.title}</h3>
                  <p className={'font-mono ' + css('_textsm _fgmuted')} style={{ lineHeight: 1.6 }}>{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={css('_py16 _px6')} style={{ background: 'var(--d-surface)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className={css('_textc _mb12')}>
            <span className={'font-mono badge badge-info ' + css('_mb3')}>HOW IT WORKS</span>
            <h2 className={'font-mono ' + css('_text3xl _fontbold _mt3')}>Three steps to operational</h2>
          </div>
          <div className={css('_flex _col _gap6')}>
            {steps.map((s) => (
              <div key={s.step} className={css('_flex _gap4 _aic') + ' carbon-card ' + css('_p5')}>
                <div
                  className={'font-mono neon-glow ' + css('_flex _aic _jcc _roundedfull _shrink0 _fontbold')}
                  style={{ width: 48, height: 48, background: 'color-mix(in srgb, var(--d-primary) 20%, var(--d-bg))', color: 'var(--d-primary)' }}
                >
                  {s.step}
                </div>
                <div>
                  <h3 className={'font-mono ' + css('_fontsemi')}>{s.title}</h3>
                  <p className={'font-mono ' + css('_textsm _fgmuted _mt1')} style={{ lineHeight: 1.6 }}>{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={css('_py16 _px6')}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className={css('_textc _mb8')}>
            <span className={'font-mono badge badge-info ' + css('_mb3')}>PRICING</span>
            <h2 className={'font-mono ' + css('_text3xl _fontbold _mt3')}>Transparent pricing, no surprises</h2>
            <div className={css('_flex _aic _jcc _gap3 _mt4')}>
              <span className={'font-mono ' + css('_textsm') + (annual ? ' ' + css('_fgmuted') : '')}>Monthly</span>
              <button
                type="button"
                className={'toggle-track' + (annual ? ' active' : '')}
                onClick={() => setAnnual(!annual)}
                role="switch"
                aria-checked={annual}
              >
                <span className="toggle-thumb" />
              </button>
              <span className={'font-mono ' + css('_textsm') + (!annual ? ' ' + css('_fgmuted') : '')}>
                Annual <span className="badge badge-success">Save 17%</span>
              </span>
            </div>
          </div>
          <div className={css('_grid _gc1 _lg:gc3 _gap6')}>
            {tiers.map((t) => (
              <div
                key={t.name}
                className={css('_flex _col _gap4 _p6') + ' carbon-card' + (t.highlighted ? ' neon-glow' : '')}
                style={t.highlighted ? { borderColor: 'var(--d-primary)' } : undefined}
              >
                {t.highlighted && (
                  <span className={'font-mono badge badge-info ' + css('_mb1')}>MOST POPULAR</span>
                )}
                <div>
                  <h3 className={'font-mono ' + css('_textlg _fontsemi')}>{t.name}</h3>
                  <p className={'font-mono ' + css('_textxs _fgmuted _mt1')}>{t.description}</p>
                </div>
                <div className={css('_flex _aibl _gap1')}>
                  {t.monthlyPrice === -1 ? (
                    <span className={'metric-value ' + css('_text2xl')}>Custom</span>
                  ) : (
                    <>
                      <span className="metric-value">${annual ? t.yearlyPrice : t.monthlyPrice}</span>
                      <span className={'font-mono ' + css('_textsm _fgmuted')}>/{annual ? 'year' : 'mo'}</span>
                    </>
                  )}
                </div>
                <div className="separator" />
                <ul className={css('_flex _col _gap2')}>
                  {t.features.map((feat) => (
                    <li key={feat} className={css('_flex _aic _gap2')}>
                      <Check size={14} style={{ color: 'var(--d-success)', flexShrink: 0 }} />
                      <span className={'font-mono ' + css('_textsm _fgmuted')}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={t.monthlyPrice === -1 ? '#' : '/register'}
                  className={'btn ' + (t.highlighted ? 'btn-primary' : 'btn-secondary') + ' btn-lg font-mono'}
                  style={{ width: '100%', marginTop: 'auto' }}
                >
                  {t.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={css('_py16 _px6')} style={{ background: 'var(--d-surface)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className={css('_textc _mb12')}>
            <span className={'font-mono badge badge-info ' + css('_mb3')}>TESTIMONIALS</span>
            <h2 className={'font-mono ' + css('_text3xl _fontbold _mt3')}>Trusted by operators worldwide</h2>
          </div>
          <div className={css('_grid _gc1 _lg:gc3 _gap6')}>
            {testimonials.map((t) => (
              <div key={t.author} className={css('_flex _col _gap4 _p5') + ' carbon-card'}>
                <div className={css('_flex _gap1')}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="var(--d-warning)" stroke="var(--d-warning)" />
                  ))}
                </div>
                <p className={'font-mono ' + css('_textsm _fgmuted')} style={{ lineHeight: 1.7 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className={css('_flex _aic _gap3 _mt1')}>
                  <div
                    className={'font-mono ' + css('_flex _aic _jcc _roundedfull _fontbold _textsm')}
                    style={{ width: 36, height: 36, background: 'color-mix(in srgb, var(--d-primary) 20%, var(--d-bg))', color: 'var(--d-primary)' }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <span className={'font-mono ' + css('_textsm _fontsemi')}>{t.author}</span>
                    <p className={'font-mono ' + css('_textxs _fgmuted')}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={css('_py20 _px6 _textc')}>
        <div style={{ maxWidth: 600, margin: '0 auto' }} className={css('_flex _col _aic _gap4')}>
          <h2 className={'font-mono neon-text-glow ' + css('_text3xl _fontbold')}>
            Ready to take control?
          </h2>
          <p className={'font-mono ' + css('_textlg _fgmuted')}>
            Deploy your first agent swarm in under five minutes. No infrastructure to manage.
          </p>
          <div className={css('_flex _gap3 _mt2')}>
            <Link to="/register" className="btn btn-primary btn-lg">
              <Bot size={18} /> Get Started Free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
