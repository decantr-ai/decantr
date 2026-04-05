import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Heart, Zap, Check } from 'lucide-react';
import { tiers, creators } from '../data/mock';

export function HomePage() {
  return (
    <div className="entrance-fade" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Hero */}
      <section className="studio-hero-gradient" style={{ padding: '6rem 1.5rem 5rem' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', textAlign: 'center' }}>
          <span className="studio-badge-tier" data-tier="fan" style={{ marginBottom: '1.5rem' }}>
            <Sparkles size={11} /> New — Commission requests
          </span>
          <h1 className="serif-display" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.25rem)', lineHeight: 1.1, marginBottom: '1.25rem', maxWidth: 820, marginInline: 'auto' }}>
            Where creators make a living doing what they love.
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--d-text-muted)', maxWidth: 620, margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Canvas is the warmest place on the internet to run a membership. Keep 92% of what you earn. Build a boutique, not a marketplace.
          </p>
          <div className={css('_flex _aic _jcc _gap3')} style={{ flexWrap: 'wrap' }}>
            <Link to="/register" className="d-interactive studio-glow" data-variant="primary"
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.9375rem', textDecoration: 'none' }}>Start creating free</Link>
            <Link to="/pricing" className="d-interactive" data-variant="ghost"
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.9375rem', textDecoration: 'none' }}>See pricing →</Link>
          </div>

          {/* Creator grid preview */}
          <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {creators.map((c) => (
              <Link key={c.id} to={`/creator/${c.username}`} className="studio-card" style={{ textDecoration: 'none', color: 'inherit', padding: '1.25rem', textAlign: 'left' }}>
                <div className={css('_flex _aic _gap3')} style={{ marginBottom: '0.75rem' }}>
                  <img src={c.avatar} alt={c.name} width={48} height={48} className="studio-avatar-creator" style={{ borderWidth: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{c.category}</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', lineHeight: 1.5 }}>{c.bio.slice(0, 72)}…</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--d-surface)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <h2 className="serif-display" style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '0.5rem' }}>Built for the way creators actually work</h2>
          <p style={{ textAlign: 'center', color: 'var(--d-text-muted)', marginBottom: '3rem' }}>Tools that feel like craft, not admin.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: TrendingUp, title: 'Earnings that feel honest', body: '92% revenue share. Transparent fees. Weekly payouts to your bank or PayPal.' },
              { icon: Heart, title: 'Fans that feel like neighbors', body: 'Tiered memberships, fan messaging, and comment threads that belong to you.' },
              { icon: Zap, title: 'Publishing that feels light', body: 'Drag-and-drop media, drafts, scheduling, and tier-gated posts in one editor.' },
            ].map((f) => (
              <div key={f.title} className="studio-card" style={{ padding: '1.5rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #FED7AA, #FDBA74)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem' }}>
                  <f.icon size={20} style={{ color: '#9A3412' }} />
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.375rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.55 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <h2 className="serif-display" style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '0.5rem' }}>Simple pricing, creator-first.</h2>
          <p style={{ textAlign: 'center', color: 'var(--d-text-muted)', marginBottom: '3rem' }}>Start free. Upgrade when it pays for itself.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', maxWidth: 900, margin: '0 auto' }}>
            {tiers.slice(0, 3).map((t, i) => (
              <div key={t.id} className={i === 1 ? 'studio-card-premium' : 'studio-card'} style={{ padding: i === 1 ? 0 : '1.5rem' }}>
                <div className={i === 1 ? 'inner' : ''} style={i === 1 ? {} : {}}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span className="studio-badge-tier" data-tier={t.color}>{t.name}</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--d-font-mono, system-ui)', marginBottom: '1rem' }}>
                    ${t.price}<span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--d-text-muted)' }}>/mo example</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {t.benefits.slice(0, 3).map((b) => (
                      <li key={b} className={css('_flex _aic _gap2')} style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
                        <Check size={14} style={{ color: 'var(--d-primary)' }} />{b}
                      </li>
                    ))}
                  </ul>
                  <Link to="/pricing" className="d-interactive" data-variant={i === 1 ? 'primary' : 'ghost'}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', textDecoration: 'none', width: '100%', justifyContent: 'center' }}>See full details</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--d-surface)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 className="serif-display" style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '3rem' }}>Creators tell it better</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {[
              { who: 'Maya O.', role: 'Illustrator', quote: '"The warmest platform I\'ve shipped on. My patrons feel like a community, not a funnel."' },
              { who: 'Noah B.', role: 'Composer', quote: '"Moved from another platform. Keep an extra $1,200/mo in revenue share alone."' },
              { who: 'Iris C.', role: 'Essayist', quote: '"Publishing feels like writing a letter. That changed my whole practice."' },
            ].map((t) => (
              <div key={t.who} className="studio-surface" style={{ padding: '1.5rem' }}>
                <p style={{ fontSize: '0.9375rem', fontStyle: 'italic', lineHeight: 1.55, marginBottom: '1rem' }}>{t.quote}</p>
                <div style={{ fontSize: '0.8125rem' }}>
                  <div style={{ fontWeight: 600 }}>{t.who}</div>
                  <div style={{ color: 'var(--d-text-muted)' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 className="serif-display" style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '2rem' }}>Frequently asked</h2>
          <div className={css('_flex _col _gap3')}>
            {[
              { q: 'What do you take?', a: 'We keep 8%. You keep 92% plus Stripe\'s processing fees.' },
              { q: 'Can I import my subscribers?', a: 'Yes — we help you migrate from Patreon, Substack, and Gumroad.' },
              { q: 'When do I get paid?', a: 'Weekly. Monday morning, every week.' },
            ].map((f) => (
              <details key={f.q} className="studio-surface" style={{ padding: '1rem 1.25rem' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem' }}>{f.q}</summary>
                <p style={{ marginTop: '0.5rem', color: 'var(--d-text-muted)', fontSize: '0.875rem', lineHeight: 1.55 }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
