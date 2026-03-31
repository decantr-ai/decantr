import { Link } from 'react-router-dom';
import { TopNavFooterShell } from '../shells/top-nav-footer';
import { features, pricingTiers } from '../mock-data';

const featureIcons: Record<string, string> = {
  brain: '\u{1F9E0}',
  chart: '\u{1F4CA}',
  plug: '\u{1F50C}',
};

export function LandingPage() {
  return (
    <TopNavFooterShell>
      {/* Hero */}
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '5rem 2rem',
          textAlign: 'center' as const,
        }}
      >
        <h1
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: 'var(--d-text)',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
          }}
        >
          AI-Powered Developer Assistant
        </h1>
        <p
          style={{
            fontSize: 18,
            color: 'var(--d-text-muted)',
            maxWidth: 600,
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}
        >
          Ship faster with an AI that understands your entire codebase. Context-aware
          answers, real-time analytics, and seamless integrations.
        </p>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
          }}
        >
          <Link
            to="/chat"
            style={{
              padding: '0.75rem 2rem',
              fontSize: 15,
              fontWeight: 600,
              color: '#18181B',
              background: 'var(--d-primary)',
              borderRadius: 'var(--d-radius)',
              border: 'none',
            }}
          >
            Get Started Free
          </Link>
          <Link
            to="/about"
            style={{
              padding: '0.75rem 2rem',
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--d-text)',
              background: 'transparent',
              borderRadius: 'var(--d-radius)',
              border: '1px solid var(--d-border)',
            }}
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '4rem 2rem',
        }}
      >
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--d-text)',
            textAlign: 'center' as const,
            marginBottom: '0.75rem',
          }}
        >
          Built for Developer Teams
        </h2>
        <p
          style={{
            fontSize: 16,
            color: 'var(--d-text-muted)',
            textAlign: 'center' as const,
            marginBottom: '3rem',
          }}
        >
          Everything you need to supercharge your development workflow.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
          }}
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              style={{
                background: 'var(--d-surface)',
                border: '1px solid var(--d-border)',
                borderRadius: 'var(--d-radius)',
                padding: '2rem',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--d-radius)',
                  background: 'var(--d-surface-raised)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  marginBottom: '1rem',
                }}
              >
                {featureIcons[feature.icon] || '\u2728'}
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--d-text)',
                  marginBottom: '0.5rem',
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--d-text-muted)',
                  lineHeight: 1.6,
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '4rem 2rem',
        }}
      >
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--d-text)',
            textAlign: 'center' as const,
            marginBottom: '3rem',
          }}
        >
          How It Works
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
          }}
        >
          {[
            {
              step: '1',
              title: 'Connect Your Repo',
              desc: 'Link your GitHub, GitLab, or Bitbucket repository in one click.',
            },
            {
              step: '2',
              title: 'Ask Anything',
              desc: 'Query your codebase in natural language. Get context-aware answers instantly.',
            },
            {
              step: '3',
              title: 'Ship Faster',
              desc: 'Resolve issues quicker, onboard teammates faster, and keep everyone aligned.',
            },
          ].map((item) => (
            <div key={item.step} style={{ textAlign: 'center' as const }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--d-radius-full)',
                  background: 'var(--d-primary)',
                  color: '#18181B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  fontWeight: 700,
                  margin: '0 auto 1rem',
                }}
              >
                {item.step}
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--d-text)',
                  marginBottom: '0.5rem',
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--d-text-muted)',
                  lineHeight: 1.6,
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '4rem 2rem',
        }}
      >
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--d-text)',
            textAlign: 'center' as const,
            marginBottom: '0.75rem',
          }}
        >
          Simple, Transparent Pricing
        </h2>
        <p
          style={{
            fontSize: 16,
            color: 'var(--d-text-muted)',
            textAlign: 'center' as const,
            marginBottom: '3rem',
          }}
        >
          Start free. Scale as you grow.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
          }}
        >
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              style={{
                background: 'var(--d-surface)',
                border: tier.highlighted
                  ? '2px solid var(--d-primary)'
                  : '1px solid var(--d-border)',
                borderRadius: 'var(--d-radius-lg)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {tier.highlighted && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--d-primary)',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    marginBottom: '0.5rem',
                  }}
                >
                  Most Popular
                </span>
              )}
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: 'var(--d-text)',
                  marginBottom: '0.25rem',
                }}
              >
                {tier.name}
              </h3>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: 'var(--d-text)',
                  marginBottom: '0.5rem',
                }}
              >
                {tier.price}
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--d-text-muted)',
                  marginBottom: '1.5rem',
                  lineHeight: 1.5,
                }}
              >
                {tier.description}
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 2rem',
                  flex: 1,
                }}
              >
                {tier.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      fontSize: 13,
                      color: 'var(--d-text-muted)',
                      padding: '0.375rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span style={{ color: 'var(--d-success)', fontSize: 14 }}>
                      &#10003;
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '0.625rem 0',
                  fontSize: 14,
                  fontWeight: 600,
                  border: tier.highlighted
                    ? 'none'
                    : '1px solid var(--d-border)',
                  borderRadius: 'var(--d-radius)',
                  background: tier.highlighted
                    ? 'var(--d-primary)'
                    : 'transparent',
                  color: tier.highlighted ? '#18181B' : 'var(--d-text)',
                  cursor: 'pointer',
                }}
              >
                {tier.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '5rem 2rem',
          textAlign: 'center' as const,
        }}
      >
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--d-text)',
            marginBottom: '1rem',
          }}
        >
          Ready to build faster?
        </h2>
        <p
          style={{
            fontSize: 16,
            color: 'var(--d-text-muted)',
            marginBottom: '2rem',
          }}
        >
          Join thousands of developers shipping with confidence.
        </p>
        <Link
          to="/chat"
          style={{
            display: 'inline-block',
            padding: '0.75rem 2.5rem',
            fontSize: 15,
            fontWeight: 600,
            color: '#18181B',
            background: 'var(--d-primary)',
            borderRadius: 'var(--d-radius)',
          }}
        >
          Get Started Free
        </Link>
      </section>
    </TopNavFooterShell>
  );
}
