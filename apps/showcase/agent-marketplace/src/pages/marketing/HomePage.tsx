import { useState } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import {
  Shield,
  Zap,
  Globe,
  Eye,
  BarChart3,
  Settings,
  Check,
  X,
  Quote,
  ArrowRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const FEATURES = [
  {
    icon: Shield,
    title: 'Zero-Trust Orchestration',
    description:
      'Every agent action passes through cryptographic attestation. No implicit trust, no silent escalations.',
  },
  {
    icon: Zap,
    title: 'Sub-50ms Dispatch',
    description:
      'Edge-native scheduler routes tasks to the nearest agent cluster. Latency measured in microseconds, not seconds.',
  },
  {
    icon: Globe,
    title: 'Multi-Region Swarms',
    description:
      'Deploy agent fleets across 24 regions with automatic failover. One config, global coverage.',
  },
  {
    icon: Eye,
    title: 'Full Inference Transparency',
    description:
      'Inspect every decision, confidence score, and reasoning chain. No black boxes in your pipeline.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Telemetry',
    description:
      'Stream agent metrics, cost signals, and throughput data to your observability stack via OpenTelemetry.',
  },
  {
    icon: Settings,
    title: 'Declarative Configuration',
    description:
      'Define agent behavior in versioned YAML. GitOps-native, diff-friendly, reviewable by humans and machines.',
  },
];

const STEPS = [
  {
    number: 1,
    title: 'Browse the Registry',
    description:
      'Search verified agents by capability, latency profile, or compliance certification. Filter by trust tier.',
  },
  {
    number: 2,
    title: 'Configure the Swarm',
    description:
      'Define orchestration rules, resource limits, and escalation policies in a single declarative manifest.',
  },
  {
    number: 3,
    title: 'Deploy to Edge',
    description:
      'Push your swarm config and watch agents spin up across regions in under 30 seconds. Zero downtime.',
  },
  {
    number: 4,
    title: 'Monitor and Iterate',
    description:
      'Observe agent performance in real time. Adjust routing weights, swap models, and roll back instantly.',
  },
];

interface PricingTier {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  popular: boolean;
  features: { label: string; included: boolean }[];
  cta: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Starter',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'For individual operators exploring agent orchestration.',
    popular: false,
    features: [
      { label: '3 active agents', included: true },
      { label: 'Single region deployment', included: true },
      { label: 'Community support', included: true },
      { label: '1,000 inferences / day', included: true },
      { label: 'Basic telemetry', included: true },
      { label: 'Multi-region swarms', included: false },
      { label: 'Custom trust policies', included: false },
      { label: 'SSO / SAML', included: false },
    ],
    cta: 'Activate Free',
  },
  {
    name: 'Pro',
    monthlyPrice: 49,
    annualPrice: 39,
    description: 'For teams running production agent workloads.',
    popular: true,
    features: [
      { label: '50 active agents', included: true },
      { label: 'Multi-region deployment', included: true },
      { label: 'Priority support', included: true },
      { label: '100,000 inferences / day', included: true },
      { label: 'Full telemetry + export', included: true },
      { label: 'Multi-region swarms', included: true },
      { label: 'Custom trust policies', included: true },
      { label: 'SSO / SAML', included: false },
    ],
    cta: 'Deploy Pro',
  },
  {
    name: 'Enterprise',
    monthlyPrice: 199,
    annualPrice: 159,
    description: 'For organizations with compliance and scale requirements.',
    popular: false,
    features: [
      { label: 'Unlimited agents', included: true },
      { label: 'Dedicated clusters', included: true },
      { label: '24/7 dedicated support', included: true },
      { label: 'Unlimited inferences', included: true },
      { label: 'Full telemetry + audit log', included: true },
      { label: 'Multi-region swarms', included: true },
      { label: 'Custom trust policies', included: true },
      { label: 'SSO / SAML', included: true },
    ],
    cta: 'Configure Enterprise',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'We migrated 200 agents from three different orchestration platforms to AgentOps in a single afternoon. The declarative config model made it trivial.',
    name: 'Kira Vasquez',
    role: 'Platform Lead, Nexon AI',
    initials: 'KV',
  },
  {
    quote:
      'Inference transparency changed how we debug production issues. We can trace any agent decision back to the exact confidence threshold that triggered it.',
    name: 'Marcus Chen',
    role: 'SRE Manager, Lattice Systems',
    initials: 'MC',
  },
  {
    quote:
      'Sub-50ms dispatch is not marketing copy. We measured it. Our multi-region swarm handles 40k tasks per second with p99 under 48ms.',
    name: 'Amara Okonkwo',
    role: 'CTO, Meridian Robotics',
    initials: 'AO',
  },
];

/* ------------------------------------------------------------------ */
/*  Section Label                                                      */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="d-label"
      style={{
        textAlign: 'center',
        color: 'var(--d-accent)',
        fontSize: 11,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '0.75rem',
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section Heading                                                    */
/* ------------------------------------------------------------------ */

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
      <h2
        style={{
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          fontWeight: 700,
          color: 'var(--d-text)',
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: 15,
            color: 'var(--d-text-muted)',
            marginTop: '0.75rem',
            maxWidth: 560,
            marginInline: 'auto',
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

function HeroSection() {
  return (
    <section
      className="d-section"
      style={{
        textAlign: 'center',
        padding: 'var(--d-section-py) 1.5rem',
        maxWidth: 800,
        marginInline: 'auto',
      }}
    >
      <div
        className="d-annotation"
        data-status="info"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: '1.5rem',
          fontSize: 12,
          fontFamily: 'var(--d-font-mono)',
        }}
      >
        <span
          className="status-ring"
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--d-success)',
            display: 'inline-block',
          }}
        />
        v3.2 — Now with multi-model routing
      </div>

      <h1
        style={{
          fontSize: 'clamp(2rem, 5vw, 3.25rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          color: 'var(--d-text)',
          margin: '0 0 1.25rem',
          letterSpacing: '-0.02em',
        }}
      >
        Deploy Autonomous Agent{' '}
        <span className="neon-text-glow" style={{ color: 'var(--d-accent)' }}>
          Swarms
        </span>
      </h1>

      <p
        style={{
          fontSize: 'clamp(1rem, 2vw, 1.125rem)',
          color: 'var(--d-text-muted)',
          lineHeight: 1.7,
          maxWidth: 600,
          marginInline: 'auto',
          marginBottom: '2.5rem',
        }}
      >
        Orchestrate, monitor, and scale AI agent fleets across global
        infrastructure. Zero-trust security. Full inference transparency.
        Sub-50ms dispatch.
      </p>

      <div
        className={css('_flex _aic _gap3')}
        style={{ justifyContent: 'center', flexWrap: 'wrap' }}
      >
        <Link
          to="/register"
          className="d-interactive neon-glow"
          data-variant="primary"
          style={{
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
            padding: '10px 24px',
          }}
        >
          Deploy Now
          <ArrowRight size={14} style={{ marginLeft: 6 }} />
        </Link>
        <a
          href="#features"
          className="d-interactive"
          data-variant="ghost"
          style={{
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
            padding: '10px 24px',
          }}
        >
          Inspect Capabilities
        </a>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Features                                                           */
/* ------------------------------------------------------------------ */

function FeaturesSection() {
  return (
    <section
      id="features"
      className="d-section"
      style={{ padding: 'var(--d-section-py) 1.5rem' }}
    >
      <div style={{ maxWidth: 1024, marginInline: 'auto' }}>
        <SectionLabel>Capabilities</SectionLabel>
        <SectionHeading
          title="Engineered for Production Agent Workloads"
          subtitle="Every feature exists because an operator needed it in production. No toy demos, no proof-of-concepts."
        />

        <div
          className={css('_grid _gap4')}
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          }}
        >
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className={'d-surface carbon-card'}
              style={{ padding: '1.5rem' }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--d-radius)',
                  background: 'rgba(0, 212, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <feature.icon
                  size={22}
                  style={{ color: 'var(--d-accent)' }}
                />
              </div>
              <h4
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--d-text)',
                  margin: '0 0 0.5rem',
                }}
              >
                {feature.title}
              </h4>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--d-text-muted)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  How It Works                                                       */
/* ------------------------------------------------------------------ */

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="d-section"
      style={{ padding: 'var(--d-section-py) 1.5rem' }}
    >
      <div style={{ maxWidth: 1024, marginInline: 'auto' }}>
        <SectionLabel>How It Works</SectionLabel>
        <SectionHeading
          title="From Registry to Production in Four Steps"
          subtitle="No boilerplate. No infrastructure guessing. Define what you need, deploy where you need it."
        />

        <div
          className={css('_flex _aic')}
          style={{
            gap: 0,
            overflowX: 'auto',
            paddingBottom: '0.5rem',
          }}
        >
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className={css('_flex _aic')}
              style={{ flex: '1 0 0', minWidth: 180 }}
            >
              <div
                className={css('_flex _col _aic')}
                style={{ textAlign: 'center', flex: 1, padding: '0 0.75rem' }}
              >
                <div
                  className="mono-data"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'var(--d-primary)',
                    color: 'var(--d-text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 700,
                    marginBottom: '1rem',
                    flexShrink: 0,
                  }}
                >
                  {step.number}
                </div>
                <h4
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'var(--d-text)',
                    margin: '0 0 0.5rem',
                  }}
                >
                  {step.title}
                </h4>
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--d-text-muted)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {step.description}
                </p>
              </div>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    width: 32,
                    height: 1,
                    background: 'var(--d-border)',
                    flexShrink: 0,
                    alignSelf: 'flex-start',
                    marginTop: 24,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Pricing                                                            */
/* ------------------------------------------------------------------ */

function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section
      id="pricing"
      className="d-section"
      style={{ padding: 'var(--d-section-py) 1.5rem' }}
    >
      <div style={{ maxWidth: 1024, marginInline: 'auto' }}>
        <SectionLabel>Pricing</SectionLabel>
        <SectionHeading
          title="Transparent, Operator-Grade Pricing"
          subtitle="No hidden fees. No per-seat traps. Scale your swarm, not your invoice."
        />

        {/* Toggle */}
        <div
          className={css('_flex _aic _gap3')}
          style={{ justifyContent: 'center', marginBottom: '2.5rem' }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: annual ? 400 : 600,
              color: annual ? 'var(--d-text-muted)' : 'var(--d-text)',
            }}
          >
            Monthly
          </span>
          <button
            onClick={() => setAnnual((v) => !v)}
            role="switch"
            aria-checked={annual}
            aria-label="Toggle annual billing"
            style={{
              position: 'relative',
              width: 44,
              height: 24,
              borderRadius: 12,
              border: '1px solid var(--d-border)',
              background: annual ? 'var(--d-accent)' : 'var(--d-surface)',
              cursor: 'pointer',
              padding: 0,
              transition: 'background 200ms ease',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 3,
                left: annual ? 22 : 3,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: annual ? 'var(--d-bg)' : 'var(--d-text-muted)',
                transition: 'left 200ms ease',
              }}
            />
          </button>
          <span
            style={{
              fontSize: 13,
              fontWeight: annual ? 600 : 400,
              color: annual ? 'var(--d-text)' : 'var(--d-text-muted)',
            }}
          >
            Annual
          </span>
          {annual && (
            <span
              className="d-annotation"
              data-status="success"
              style={{ fontSize: 11, fontFamily: 'var(--d-font-mono)' }}
            >
              Save 20%
            </span>
          )}
        </div>

        {/* Tier cards */}
        <div
          className={css('_grid _gap4')}
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            alignItems: 'start',
          }}
        >
          {PRICING_TIERS.map((tier) => {
            const price = annual ? tier.annualPrice : tier.monthlyPrice;
            return (
              <div
                key={tier.name}
                className={'d-surface carbon-card'}
                style={{
                  padding: '1.75rem',
                  borderColor: tier.popular
                    ? 'var(--d-accent)'
                    : undefined,
                  borderWidth: tier.popular ? 1 : undefined,
                  borderStyle: tier.popular ? 'solid' : undefined,
                  position: 'relative',
                }}
              >
                {tier.popular && (
                  <div
                    className="neon-glow"
                    style={{
                      position: 'absolute',
                      top: -10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'var(--d-accent)',
                      color: 'var(--d-bg)',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      padding: '3px 12px',
                      borderRadius: 10,
                      fontFamily: 'var(--d-font-mono)',
                    }}
                  >
                    Popular
                  </div>
                )}

                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: 'var(--d-text)',
                    margin: '0 0 0.25rem',
                  }}
                >
                  {tier.name}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--d-text-muted)',
                    margin: '0 0 1.25rem',
                    lineHeight: 1.5,
                  }}
                >
                  {tier.description}
                </p>

                <div
                  className={css('_flex _aic')}
                  style={{ gap: 4, marginBottom: '1.5rem' }}
                >
                  <span
                    className="mono-data"
                    style={{
                      fontSize: '2rem',
                      fontWeight: 800,
                      color: 'var(--d-text)',
                      lineHeight: 1,
                    }}
                  >
                    ${price}
                  </span>
                  {price > 0 && (
                    <span
                      style={{
                        fontSize: 13,
                        color: 'var(--d-text-muted)',
                        alignSelf: 'flex-end',
                        paddingBottom: 2,
                      }}
                    >
                      /mo
                    </span>
                  )}
                </div>

                <Link
                  to="/register"
                  className="d-interactive"
                  data-variant={tier.popular ? 'primary' : 'ghost'}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'center',
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                    padding: '10px 0',
                    marginBottom: '1.5rem',
                  }}
                >
                  {tier.cta}
                </Link>

                <div className={css('_flex _col _gap2')}>
                  {tier.features.map((feat) => (
                    <div
                      key={feat.label}
                      className={css('_flex _aic _gap2')}
                      style={{ fontSize: 13 }}
                    >
                      {feat.included ? (
                        <Check
                          size={14}
                          style={{
                            color: 'var(--d-success)',
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <X
                          size={14}
                          style={{
                            color: 'var(--d-text-muted)',
                            opacity: 0.4,
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <span
                        style={{
                          color: feat.included
                            ? 'var(--d-text)'
                            : 'var(--d-text-muted)',
                          opacity: feat.included ? 1 : 0.5,
                        }}
                      >
                        {feat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Testimonials                                                       */
/* ------------------------------------------------------------------ */

function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="d-section"
      style={{ padding: 'var(--d-section-py) 1.5rem' }}
    >
      <div style={{ maxWidth: 1024, marginInline: 'auto' }}>
        <SectionLabel>Operators</SectionLabel>
        <SectionHeading
          title="Trusted by Production Teams"
          subtitle="Teams running real agent workloads at scale. Not demos, not experiments."
        />

        <div
          className={css('_grid _gap4')}
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          }}
        >
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className={'d-surface carbon-card'}
              style={{ padding: '1.5rem' }}
            >
              <Quote
                size={20}
                style={{
                  color: 'var(--d-accent)',
                  opacity: 0.4,
                  marginBottom: '0.75rem',
                }}
              />
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--d-text)',
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                  margin: '0 0 1.25rem',
                }}
              >
                {t.quote}
              </p>
              <div className={css('_flex _aic _gap3')}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'var(--d-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--d-text)',
                    fontFamily: 'var(--d-font-mono)',
                    flexShrink: 0,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--d-text)',
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--d-text-muted)',
                    }}
                  >
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA                                                                */
/* ------------------------------------------------------------------ */

function CtaSection() {
  return (
    <section
      className="d-section carbon-glass"
      style={{
        padding: 'var(--d-section-py) 1.5rem',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 640, marginInline: 'auto' }}>
        <h2
          style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 700,
            color: 'var(--d-text)',
            margin: '0 0 1rem',
            lineHeight: 1.3,
          }}
        >
          Ready to Deploy Your First Swarm?
        </h2>
        <p
          style={{
            fontSize: 15,
            color: 'var(--d-text-muted)',
            lineHeight: 1.7,
            marginBottom: '2rem',
          }}
        >
          Activate a free account in under 60 seconds. No credit card required.
          Full access to the agent registry, telemetry dashboard, and
          orchestration engine.
        </p>

        <div
          className={css('_flex _aic _gap3')}
          style={{ justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link
            to="/register"
            className="d-interactive neon-glow"
            data-variant="primary"
            style={{
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600,
              padding: '10px 24px',
            }}
          >
            Activate Free Account
            <ArrowRight size={14} style={{ marginLeft: 6 }} />
          </Link>
          <Link
            to="/marketplace"
            className="d-interactive"
            data-variant="ghost"
            style={{
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              padding: '10px 24px',
            }}
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
