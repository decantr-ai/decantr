import { NavLink } from 'react-router-dom';
import { Terminal, Zap, GitBranch, Activity, Wrench, ClipboardCheck, ArrowRight, Check } from 'lucide-react';

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="hero-glow grid-bg" style={{ position: 'relative', padding: '6rem 1.5rem 5rem', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 820, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', fontSize: '0.72rem', fontFamily: 'var(--d-font-mono)', background: 'color-mix(in srgb, var(--d-accent) 12%, transparent)', color: 'var(--d-accent)', borderRadius: 999, border: '1px solid color-mix(in srgb, var(--d-accent) 35%, transparent)', marginBottom: '1.5rem' }}>
            <Terminal size={11} /> v4.2 · traces, evals, diffs
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '1rem' }}>
            Build precision AI agents.<br />
            <span className="neon-accent neon-text-glow">Iterate at terminal speed.</span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--d-text-muted)', maxWidth: 580, margin: '0 auto 2rem', lineHeight: 1.6 }}>
            An IDE for AI agents — version prompts, wire tools, run evals, replay traces.
            Every pixel serves the builder. Keyboard-first.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <NavLink to="/register" className="d-interactive" data-variant="primary" style={{ background: 'var(--d-accent)', borderColor: 'var(--d-accent)', color: '#0a0a0a', fontWeight: 600, padding: '0.625rem 1.25rem' }}>
              Start building <ArrowRight size={14} />
            </NavLink>
            <a href="#workflow" className="d-interactive" data-variant="ghost" style={{ padding: '0.625rem 1.25rem' }}>
              View the workflow
            </a>
          </div>
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.72rem', color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono)' }}>
            <span><kbd className="kbd">⌘</kbd> K for commands</span>
            <span><kbd className="kbd">g</kbd> <kbd className="kbd">a</kbd> to agents</span>
            <span><kbd className="kbd">g</kbd> <kbd className="kbd">r</kbd> to traces</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '4rem 1.5rem', borderTop: '1px solid var(--d-border)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="d-label" style={{ marginBottom: 8 }}>Features</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.01em' }}>A workspace for every iteration</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <FeatureCard icon={Terminal} title="Agent Studio" desc="Three-panel IDE for designing agents — tree, editor, live preview." />
            <FeatureCard icon={GitBranch} title="Versioned Prompts" desc="Full diff history, semantic search, instant rollback across your team." />
            <FeatureCard icon={Wrench} title="Tool Registry" desc="JSON Schema editor, test playground, analytics per call." />
            <FeatureCard icon={ClipboardCheck} title="Eval Suite" desc="Run test suites across models. Detect regressions automatically." />
            <FeatureCard icon={Activity} title="Trace Viewer" desc="Waterfall spans across LLM calls, tools, and retrieval. Replay anything." />
            <FeatureCard icon={Zap} title="Keyboard-first" desc="Command palette, hotkey navigation. Never touch the mouse." />
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" style={{ padding: '4rem 1.5rem', borderTop: '1px solid var(--d-border)', background: '#18181B' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="d-label" style={{ marginBottom: 8 }}>Workflow</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.01em' }}>From prompt to production in four steps</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { n: '01', t: 'Define', d: 'Wire your system prompt, select a model, attach tools.' },
              { n: '02', t: 'Test', d: 'Run in the live-preview pane. Tweak inputs. See token costs instantly.' },
              { n: '03', t: 'Evaluate', d: 'Launch your eval suite. Compare vs baselines. Catch regressions.' },
              { n: '04', t: 'Deploy', d: 'Version, tag, ship. Observability is already wired.' },
            ].map(step => (
              <div key={step.n} className="carbon-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem' }}>
                <div style={{ fontFamily: 'var(--d-font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--d-accent)', opacity: 0.6, width: 48 }}>{step.n}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 2 }}>{step.t}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--d-text-muted)' }}>{step.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '4rem 1.5rem', borderTop: '1px solid var(--d-border)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="d-label" style={{ marginBottom: 8 }}>Pricing</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.01em' }}>Pick a tier. Scale on demand.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <PricingCard name="Hobby" price="$0" features={['3 agents', '1k traces/mo', 'Community support', 'Basic evals']} />
            <PricingCard name="Team" price="$49" featured features={['Unlimited agents', '100k traces/mo', 'Priority support', 'Regression detection', 'SSO']} />
            <PricingCard name="Enterprise" price="Custom" features={['Unlimited everything', 'SLA + dedicated support', 'SOC2, HIPAA', 'Self-hosted option']} />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ padding: '4rem 1.5rem', borderTop: '1px solid var(--d-border)', textAlign: 'center', position: 'relative' }} className="hero-glow">
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 580, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '0.75rem' }}>Stop debugging. Start shipping.</h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>
            Join 3,400 AI engineers building precision agents.
          </p>
          <NavLink to="/register" className="d-interactive" data-variant="primary" style={{ background: 'var(--d-accent)', borderColor: 'var(--d-accent)', color: '#0a0a0a', fontWeight: 600, padding: '0.625rem 1.5rem' }}>
            Build your first agent <ArrowRight size={14} />
          </NavLink>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: typeof Terminal; title: string; desc: string }) {
  return (
    <div className="carbon-card" data-interactive style={{ padding: '1.25rem' }}>
      <div style={{ width: 32, height: 32, borderRadius: 6, background: 'color-mix(in srgb, var(--d-accent) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
        <Icon size={16} className="neon-accent" />
      </div>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 4, fontFamily: 'var(--d-font-mono)' }}>{title}</h3>
      <p style={{ fontSize: '0.82rem', color: 'var(--d-text-muted)', lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}

function PricingCard({ name, price, features, featured }: { name: string; price: string; features: string[]; featured?: boolean }) {
  return (
    <div className="carbon-card" style={{ padding: '1.5rem', borderColor: featured ? 'var(--d-accent)' : undefined, boxShadow: featured ? '0 0 0 1px var(--d-accent), 0 8px 32px color-mix(in srgb, var(--d-accent) 15%, transparent)' : undefined }}>
      {featured && (
        <div style={{ fontSize: '0.65rem', fontFamily: 'var(--d-font-mono)', color: 'var(--d-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Popular</div>
      )}
      <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 4, fontFamily: 'var(--d-font-mono)' }}>{name}</h3>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--d-font-mono)', marginBottom: '1rem' }}>
        {price}<span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--d-text-muted)' }}>{price !== 'Custom' ? '/mo' : ''}</span>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {features.map(f => (
          <li key={f} style={{ fontSize: '0.82rem', color: 'var(--d-text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check size={12} className="neon-accent" /> {f}
          </li>
        ))}
      </ul>
      <NavLink to="/register" className="d-interactive" data-variant={featured ? 'primary' : 'ghost'} style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', ...(featured ? { background: 'var(--d-accent)', borderColor: 'var(--d-accent)', color: '#0a0a0a', fontWeight: 600 } : {}) }}>
        Get started
      </NavLink>
    </div>
  );
}
