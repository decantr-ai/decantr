import { Link } from 'react-router-dom';
import { Sparkles, KanbanSquare, Brain, Users, ArrowRight, Check } from 'lucide-react';

export function HomePage() {
  return (
    <>
      {/* Hero */}
      <section style={{ padding: '6rem 2rem 4rem', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <div className="crm-ai-badge" style={{ marginBottom: '1.5rem' }}>
          <Sparkles size={10} /> AI-Native Sales Intelligence
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1.25rem' }}>
          The CRM that <span className="crm-gradient-text">feels alive</span>
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--d-text-muted)', maxWidth: 640, margin: '0 auto 2rem', lineHeight: 1.5 }}>
          AI enrichment at every touch. Pipeline as the center of gravity. Meeting recaps that write themselves.
          Relationship graphs that reveal hidden paths. This is sales, redesigned.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="crm-button-accent" style={{ padding: '0.75rem 1.5rem' }}>
            Start free trial <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="d-interactive" style={{ padding: '0.75rem 1.5rem' }}>
            Sign in
          </Link>
        </div>

        {/* Hero visual */}
        <div className="glass-panel glass-fade-up" style={{ marginTop: '3rem', padding: '1.5rem', textAlign: 'left' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Pipeline', value: '$1.24M', hue: 'var(--d-accent)' },
              { label: 'Open Deals', value: '38', hue: 'var(--d-primary)' },
              { label: 'Win Rate', value: '34%', hue: 'var(--d-success)' },
              { label: 'AI Enrichments', value: '1,284', hue: 'var(--d-secondary)' },
            ].map(k => (
              <div key={k.label} style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 'var(--d-radius)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div className="d-label" style={{ fontSize: '0.65rem', borderLeft: `2px solid ${k.hue}`, paddingLeft: '0.5rem' }}>{k.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--d-font-mono)', marginTop: '0.375rem' }}>{k.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '4rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.75rem' }}>Built for the AI-first era</h2>
          <p style={{ color: 'var(--d-text-muted)', maxWidth: 560, margin: '0 auto' }}>Every field enriched. Every interaction logged. Every insight surfaced.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {[
            { icon: KanbanSquare, title: 'Draggable pipeline', desc: 'Value-weighted Kanban with AI insights on every card.' },
            { icon: Brain, title: 'AI enrichment', desc: 'Company size, tech stack, intent signals — auto-populated.' },
            { icon: Sparkles, title: 'Meeting AI', desc: 'Transcripts, recaps, action items generated automatically.' },
            { icon: Users, title: 'Relationship graph', desc: 'See hidden paths through your network visually.' },
          ].map(f => (
            <div key={f.title} className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--d-radius-sm)',
                background: 'linear-gradient(135deg, var(--d-accent), var(--d-primary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                marginBottom: '0.75rem',
              }}>
                <f.icon size={18} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.375rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--d-text-muted)', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" style={{ padding: '4rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 600 }}>Loved by modern sales teams</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {[
            { quote: 'Lumen replaced 3 tools. Our AEs spend time selling, not typing.', name: 'Jordan Park', title: 'VP Eng, Northwind' },
            { quote: 'The meeting recaps are scary good. 20 hours back every week.', name: 'Priya Nair', title: 'Head of Ops, Meridian' },
            { quote: 'Pipeline board is the dashboard I open every morning.', name: 'Elena Voss', title: 'Director, Brightline' },
          ].map(t => (
            <div key={t.name} className="glass-card" style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div className="crm-avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
                  {t.name.split(' ').map(s => s[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>{t.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '4rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 600 }}>Simple pricing</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {[
            { name: 'Starter', price: '$29', per: 'per user / mo', features: ['Up to 5 users', 'Core pipeline', 'Basic AI enrichment', 'Email & calendar'] },
            { name: 'Growth', price: '$59', per: 'per user / mo', features: ['Unlimited users', 'Advanced pipeline', 'Full AI suite', 'Meeting recaps', 'Relationship graph'], highlighted: true },
            { name: 'Enterprise', price: 'Custom', per: 'talk to sales', features: ['SSO & SAML', 'Audit logs', 'FedRAMP', 'Dedicated CSM', 'Custom integrations'] },
          ].map(p => (
            <div key={p.name} className="glass-card" style={{
              padding: '1.5rem',
              borderColor: p.highlighted ? 'rgba(167, 139, 250, 0.4)' : undefined,
              boxShadow: p.highlighted ? '0 0 0 1px rgba(167, 139, 250, 0.3), 0 8px 32px rgba(167, 139, 250, 0.15)' : undefined,
            }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{p.name}</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--d-font-mono)', marginBottom: '0.125rem' }}>{p.price}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginBottom: '1.25rem' }}>{p.per}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {p.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem' }}>
                    <Check size={14} style={{ color: 'var(--d-accent)', flexShrink: 0 }} /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={p.highlighted ? 'crm-button-accent' : 'd-interactive'}
                style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '4rem 2rem 6rem', maxWidth: 900, margin: '0 auto' }}>
        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>Ready to make your CRM feel alive?</h2>
          <p style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>14-day free trial. No credit card required.</p>
          <Link to="/register" className="crm-button-accent" style={{ padding: '0.75rem 1.75rem' }}>
            Start free trial <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
