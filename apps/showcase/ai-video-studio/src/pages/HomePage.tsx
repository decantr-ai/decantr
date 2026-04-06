import { NavLink } from 'react-router-dom';
import { Clapperboard, Sparkles, Film, Users, Zap, Layers, Wand2, Check, X, ArrowRight, Star } from 'lucide-react';
import { useState } from 'react';
import { pricingPlans } from '@/data/mock';

function HeroSection() {
  return (
    <section className="d-section" style={{ position: 'relative', textAlign: 'center', overflow: 'hidden', padding: '6rem 1.5rem 5rem' }}>
      <div className="hero-glow" style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
        <div className="d-annotation" data-status="info" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
          <Sparkles size={12} /> Now with Sora v2 support
        </div>
        <h1 className="cinema-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', marginBottom: '1.25rem' }}>
          Direct AI Video<br />Like a Filmmaker
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--d-text-muted)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 2rem' }}>
          Professional video production powered by generative AI. Storyboard scenes, maintain character consistency, and render cinematic footage — all from a single studio.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <NavLink to="/register" className="d-interactive cinema-amber-glow" data-variant="primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
            Start Directing <ArrowRight size={16} />
          </NavLink>
          <NavLink to="/login" className="d-interactive" data-variant="ghost" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
            Sign In
          </NavLink>
        </div>
      </div>
      {/* Ambient timeline preview */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '3rem auto 0' }}>
        <div className="cinema-frame" data-ratio="16:9" style={{ background: '#0A0A0A', border: '1px solid var(--d-border)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1rem' }}>
          <div className="cinema-letterbox" style={{ position: 'absolute', inset: 0 }} />
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', position: 'relative', zIndex: 3 }}>
            <span className="cinema-timecode">00:01:24:18</span>
            <div style={{ flex: 1, height: 4, background: 'var(--d-border)', borderRadius: 2, position: 'relative' }}>
              <div style={{ width: '45%', height: '100%', background: 'var(--d-primary)', borderRadius: 2 }} />
            </div>
            <span className="cinema-timecode">02:34:00:00</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: Film, title: 'Scene Storyboard', description: 'Visual timeline with drag-and-drop scene arrangement, keyframe editing, and multi-track composition.' },
    { icon: Users, title: 'Character Consistency', description: 'AI-powered identity tracking ensures characters maintain appearance across every scene.' },
    { icon: Wand2, title: 'Prompt Director', description: 'Version-controlled prompts with A/B testing, live playground, and inline storyboard preview.' },
    { icon: Zap, title: 'Render Pipeline', description: 'GPU-accelerated rendering with live progress, queue management, and automatic retries.' },
    { icon: Layers, title: 'Multi-Track Timeline', description: 'Professional NLE-style timeline with video, audio, and effects tracks for complex compositions.' },
    { icon: Clapperboard, title: 'Template Library', description: 'Start from curated blueprints — product demos, cinematic shorts, social ads, and more.' },
  ];

  return (
    <section id="features" className="d-section" style={{ background: 'var(--d-surface)', padding: 'var(--d-section-py) 1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="d-label" style={{ textAlign: 'center', color: 'var(--d-primary)', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>CAPABILITIES</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Everything you need to direct AI video</h2>
          <p style={{ color: 'var(--d-text-muted)', maxWidth: 500, margin: '0 auto' }}>From storyboarding to final render, a complete production pipeline.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--d-gap-6)' }}>
          {features.map(f => (
            <div key={f.title} className="d-surface" style={{ padding: 'var(--d-surface-p)', transition: 'transform 200ms ease, border-color 200ms ease', cursor: 'default' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--d-primary-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--d-border)'; }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 'var(--d-radius)', background: 'color-mix(in srgb, var(--d-primary) 10%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <f.icon size={22} style={{ color: 'var(--d-primary)' }} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  const steps = [
    { num: '01', title: 'Compose', description: 'Write scene prompts, define characters, set the visual tone.' },
    { num: '02', title: 'Direct', description: 'Arrange scenes on the timeline, adjust keyframes and transitions.' },
    { num: '03', title: 'Render', description: 'Queue GPU-accelerated generation with real-time progress tracking.' },
    { num: '04', title: 'Export', description: 'Download in 4K, 1080p, or vertical formats ready for distribution.' },
  ];

  return (
    <section id="workflow" className="d-section" style={{ padding: 'var(--d-section-py) 1.5rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="d-label" style={{ textAlign: 'center', color: 'var(--d-primary)', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>From prompt to premiere</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--d-gap-6)' }}>
          {steps.map(s => (
            <div key={s.num} style={{ textAlign: 'center' }}>
              <div className="cinema-slate" style={{ marginBottom: '1rem', display: 'inline-flex' }}>SCN {s.num}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{s.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="d-section" style={{ background: 'var(--d-surface)', padding: 'var(--d-section-py) 1.5rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="d-label" style={{ textAlign: 'center', color: 'var(--d-primary)', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>PRICING</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Choose your production tier</h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'var(--d-bg)', padding: '0.25rem', borderRadius: 'var(--d-radius-full)', border: '1px solid var(--d-border)' }}>
            <button
              onClick={() => setAnnual(false)}
              style={{ padding: '0.35rem 1rem', borderRadius: 'var(--d-radius-full)', fontSize: '0.8rem', border: 'none', cursor: 'pointer', background: !annual ? 'var(--d-primary)' : 'transparent', color: !annual ? '#0a0a0a' : 'var(--d-text-muted)', fontWeight: 500, transition: 'all 200ms ease' }}
            >Monthly</button>
            <button
              onClick={() => setAnnual(true)}
              style={{ padding: '0.35rem 1rem', borderRadius: 'var(--d-radius-full)', fontSize: '0.8rem', border: 'none', cursor: 'pointer', background: annual ? 'var(--d-primary)' : 'transparent', color: annual ? '#0a0a0a' : 'var(--d-text-muted)', fontWeight: 500, transition: 'all 200ms ease', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              Annual
              <span className="d-annotation" data-status="success" style={{ fontSize: '0.65rem' }}>Save 20%</span>
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--d-gap-6)', alignItems: 'start' }}>
          {pricingPlans.map(plan => (
            <div
              key={plan.id}
              className="d-surface"
              style={{
                padding: '1.75rem',
                borderColor: plan.recommended ? 'var(--d-primary)' : undefined,
                borderTopWidth: plan.recommended ? 3 : undefined,
                transform: plan.recommended ? 'scale(1.02)' : undefined,
                position: 'relative',
              }}
            >
              {plan.recommended && (
                <span className="d-annotation" data-status="info" style={{ position: 'absolute', top: '-0.6rem', right: '1rem', fontSize: '0.65rem' }}>Popular</span>
              )}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{plan.name}</h3>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '2.25rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                  ${annual ? plan.annualPrice : plan.monthlyPrice}
                </span>
                <span style={{ color: 'var(--d-text-muted)', fontSize: '0.85rem' }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {plan.features.map(f => (
                  <li key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: f.included ? 'var(--d-text)' : 'var(--d-text-muted)' }}>
                    {f.included ? <Check size={14} style={{ color: 'var(--d-success)' }} /> : <X size={14} style={{ opacity: 0.4 }} />}
                    {f.label}
                  </li>
                ))}
              </ul>
              <NavLink
                to="/register"
                className="d-interactive"
                data-variant={plan.recommended ? 'primary' : 'ghost'}
                style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}
              >
                Start directing
              </NavLink>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  const testimonials = [
    { name: 'Sarah Kim', role: 'Creative Director, Lumina', quote: 'Replaced our entire post-production pipeline. Character consistency alone saves us 20 hours per project.' },
    { name: 'Marcus Webb', role: 'Founder, StoryForge', quote: 'The timeline interface feels like Final Cut Pro but for AI. Our team was productive on day one.' },
    { name: 'Priya Sharma', role: 'Head of Content, Beacon', quote: 'Render queue and live logs give us the visibility we need for production-grade workflows.' },
  ];

  return (
    <section className="d-section" style={{ padding: 'var(--d-section-py) 1.5rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="d-label" style={{ textAlign: 'center', color: 'var(--d-primary)', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>SOCIAL PROOF</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Trusted by creative teams</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--d-gap-6)' }}>
          {testimonials.map(t => (
            <div key={t.name} className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--d-primary)" style={{ color: 'var(--d-primary)' }} />)}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', lineHeight: 1.6, marginBottom: '1rem', fontStyle: 'italic' }}>"{t.quote}"</p>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="d-section" style={{ padding: 'var(--d-section-py) 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, var(--d-bg) 0%, color-mix(in srgb, var(--d-primary) 6%, var(--d-bg)) 50%, var(--d-bg) 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
        <h2 className="cinema-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Ready to Direct?</h2>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
          Start creating cinematic AI video today. No credit card required for the free tier.
        </p>
        <NavLink to="/register" className="d-interactive cinema-amber-glow" data-variant="primary" style={{ padding: '0.7rem 2rem', fontSize: '1rem' }}>
          Start Directing <ArrowRight size={18} />
        </NavLink>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <WorkflowSection />
      <PricingSection />
      <SocialProofSection />
      <FinalCta />
    </>
  );
}
