import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const features = [
  {
    title: 'Structured Design Schema',
    description:
      'Like OpenAPI but for UI. Define your design system, layout patterns, and visual themes in a single machine-readable spec.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
      </svg>
    ),
    color: 'var(--secondary)',
  },
  {
    title: 'AI-Native Design Intelligence',
    description:
      'Feed your Essence spec to Claude, Cursor, or Copilot via the MCP server. They generate consistent, on-brand UI every time.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
    color: 'var(--accent)',
  },
  {
    title: 'Guard Against Drift',
    description:
      'Built-in guard rules validate every code change against your spec. Prevent style drift, layout violations, and accessibility regressions.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    color: 'var(--success)',
  },
  {
    title: 'Pattern Registry',
    description:
      'Browse curated patterns, themes, and shells. Compose them into full application blueprints with a single command.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
      </svg>
    ),
    color: 'var(--warning)',
  },
];

const steps = [
  {
    step: '01',
    title: 'Define',
    description: 'Describe your app. Decantr creates a structured Essence spec capturing your theme, layout, patterns, and guard rules.',
    color: 'var(--secondary)',
  },
  {
    step: '02',
    title: 'Compose',
    description: 'The design pipeline resolves patterns, themes, and shells into a full composition. Your AI assistant reads it via MCP.',
    color: 'var(--accent)',
  },
  {
    step: '03',
    title: 'Generate & Guard',
    description: 'Your AI generates consistent, production-quality code. Guard rules validate every change against the spec. No drift.',
    color: 'var(--success)',
  },
];

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For individual developers and experimentation.',
    features: [
      'All open-source packages',
      'Public registry access',
      'Community patterns & themes',
      'CLI + MCP server',
      'Up to 3 projects',
    ],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For professional developers shipping real products.',
    features: [
      'Everything in Free',
      'Unlimited projects',
      'Private registry namespaces',
      'Priority content updates',
      'Advanced guard analytics',
      'Email support',
    ],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Team',
    price: '$99',
    period: '/month',
    description: 'For teams that need shared design intelligence.',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Shared Essence specs',
      'Team pattern library',
      'SSO + role management',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background orbs */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 700,
            height: 700,
            background: 'radial-gradient(circle, rgba(254,68,116,0.18), transparent 65%)',
            top: '-15%',
            left: '-15%',
            filter: 'blur(100px)',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 550,
            height: 550,
            background: 'radial-gradient(circle, rgba(10,243,235,0.14), transparent 65%)',
            bottom: '-10%',
            right: '-10%',
            filter: 'blur(100px)',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 450,
            height: 450,
            background: 'radial-gradient(circle, rgba(253,163,3,0.10), transparent 65%)',
            top: '20%',
            right: '20%',
            filter: 'blur(100px)',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-20 md:py-32 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[var(--radius-pill)] text-sm mb-8"
            style={{ background: 'var(--bg-elevated)', color: 'var(--secondary)', border: '1px solid var(--border)' }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--secondary)' }} />
            Now in public beta
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6" style={{ color: 'var(--fg)' }}>
            OpenAPI for{' '}
            <span style={{ color: 'var(--secondary)' }}>AI-generated UI</span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--fg-muted)' }}>
            A structured schema and design intelligence layer that makes AI coding assistants generate better, more consistent web applications. We don&apos;t care what you build with. We care what you build.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link href="/registry">
              <Button variant="secondary" size="lg">Browse Registry</Button>
            </Link>
          </div>

          {/* MCP config preview */}
          <div className="mt-10 md:mt-16 max-w-xl mx-auto text-left">
            <div
              className="rounded-[var(--radius-md)] overflow-hidden border"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            >
              <div className="px-4 py-2 text-xs flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)', color: 'var(--fg-dim)' }}>
                <span className="w-3 h-3 rounded-full" style={{ background: '#D80F4A' }} />
                <span className="w-3 h-3 rounded-full" style={{ background: '#FDA303' }} />
                <span className="w-3 h-3 rounded-full" style={{ background: '#00E0AB' }} />
                <span className="ml-2">mcp.json</span>
              </div>
              <pre className="p-4 text-sm overflow-x-auto" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
                <code>{`{
  "mcpServers": {
    "decantr": {
      "command": "npx",
      "args": ["-y", "@decantr/mcp-server"]
    }
  }
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center justify-center max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <div className="w-2 h-2 rounded-full mx-5" style={{ background: 'var(--secondary)' }} />
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      {/* Features */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--fg)' }}>
            Design intelligence, not code generation
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: 'var(--fg-muted)' }}>
            Decantr tells your AI assistant <em>how</em> to build — the structure, the patterns, the constraints — so the output is consistent every single time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="p-8 hover:border-[var(--border-hover)] transition-colors">
              <div className="mb-4" style={{ color: feature.color }}>{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--fg)' }}>{feature.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center justify-center max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <div className="w-2 h-2 rounded-full mx-5" style={{ background: 'var(--accent)' }} />
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      {/* How It Works */}
      <section className="py-16 md:py-24 max-w-5xl mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--fg)' }}>
            How it works
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: 'var(--fg-muted)' }}>
            Three steps from intent to guarded, production-quality UI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.step} className="text-center">
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold mb-6"
                style={{ background: `color-mix(in srgb, ${step.color} 15%, transparent)`, color: step.color }}
              >
                {step.step}
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--fg)' }}>{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>{step.description}</p>
            </div>
          ))}
        </div>

        {/* Connecting arrows for md+ */}
        <div className="hidden md:flex items-center justify-center gap-4 mt-12">
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, var(--secondary))` }} />
          <svg className="w-4 h-4" style={{ color: 'var(--secondary)' }} fill="currentColor" viewBox="0 0 24 24"><path d="M5 12h14m-4-4 4 4-4 4" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right, var(--secondary), var(--accent))` }} />
          <svg className="w-4 h-4" style={{ color: 'var(--accent)' }} fill="currentColor" viewBox="0 0 24 24"><path d="M5 12h14m-4-4 4 4-4 4" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right, var(--accent), var(--success))` }} />
          <svg className="w-4 h-4" style={{ color: 'var(--success)' }} fill="currentColor" viewBox="0 0 24 24"><path d="M5 12h14m-4-4 4 4-4 4" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right, var(--success), transparent)` }} />
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center justify-center max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <div className="w-2 h-2 rounded-full mx-5" style={{ background: 'var(--warning)' }} />
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      {/* Pricing */}
      <section id="pricing" className="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--fg)' }}>
            Simple, transparent pricing
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: 'var(--fg-muted)' }}>
            Start free. Upgrade when you need private namespaces, team features, or priority support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`p-8 flex flex-col ${tier.highlight ? 'ring-2' : ''}`}
              style={tier.highlight ? { borderColor: 'var(--primary)', boxShadow: '0 0 40px rgba(101,0,198,0.15)' } : undefined}
            >
              {tier.highlight && (
                <div
                  className="text-xs font-semibold px-3 py-1 rounded-[var(--radius-pill)] self-start mb-4"
                  style={{ background: 'var(--primary)', color: 'white' }}
                >
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--fg)' }}>{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold" style={{ color: 'var(--fg)' }}>{tier.price}</span>
                <span className="text-sm" style={{ color: 'var(--fg-dim)' }}>{tier.period}</span>
              </div>
              <p className="text-sm mb-6" style={{ color: 'var(--fg-muted)' }}>{tier.description}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm" style={{ color: 'var(--fg-muted)' }}>
                    <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--success)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/login">
                <Button variant={tier.highlight ? 'primary' : 'secondary'} className="w-full">
                  {tier.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center justify-center max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <div className="w-2 h-2 rounded-full mx-5" style={{ background: 'var(--success)' }} />
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      {/* Setup / MCP Config */}
      <section className="py-16 md:py-24 max-w-3xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--fg)' }}>
            Set up in 30 seconds
          </h2>
          <p style={{ color: 'var(--fg-muted)' }}>
            Install the CLI, initialize your project, and connect the MCP server to your AI assistant.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { label: '1. Install the CLI', code: 'npm install -g decantr' },
            { label: '2. Initialize your project', code: 'decantr init' },
            { label: '3. Add MCP server to your assistant', code: `// Add to your mcp.json or claude_desktop_config.json
{
  "mcpServers": {
    "decantr": {
      "command": "npx",
      "args": ["-y", "@decantr/mcp-server"]
    }
  }
}` },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--fg-dim)' }}>{item.label}</p>
              <div
                className="rounded-[var(--radius-md)] border p-4 overflow-x-auto"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', fontFamily: 'var(--font-mono)' }}
              >
                <pre className="text-sm" style={{ color: 'var(--secondary)' }}>
                  <code>{item.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(101,0,198,0.12) 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{ color: 'var(--fg)' }}>
            Ready to make your AI build better?
          </h2>
          <p className="text-lg mb-10" style={{ color: 'var(--fg-muted)' }}>
            Join the beta. Define your design system once, and let your AI assistant generate consistent UI every time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <a href="https://github.com/decantr/decantr-monorepo">
              <Button variant="ghost" size="lg">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                Star on GitHub
              </Button>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
