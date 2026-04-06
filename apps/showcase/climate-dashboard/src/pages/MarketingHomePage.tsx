import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Leaf, BarChart3, Globe, Target, ShoppingCart, FileText, ArrowRight, Quote } from 'lucide-react';
import { marketingFeatures, testimonials } from '@/data/mock';

const featureIcons = [BarChart3, BarChart3, Globe, Target, ShoppingCart, FileText];

export function MarketingHomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="d-section earth-hero" style={{ padding: '5rem 1.5rem', textAlign: 'center', background: 'linear-gradient(180deg, var(--d-bg) 0%, var(--d-surface) 100%)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="entrance-fade" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--d-primary)', borderRadius: 'var(--d-radius-lg)' }}>
              <Leaf size={28} color="#fff" />
            </div>
          </div>
          <h1 className="entrance-fade" style={{ fontSize: '2.75rem', fontWeight: 700, lineHeight: 1.15, marginBottom: '1rem', color: 'var(--d-text)' }}>
            Carbon Accounting for a<br />Net-Zero Future
          </h1>
          <p className="entrance-fade" style={{ fontSize: '1.125rem', color: 'var(--d-text-muted)', marginBottom: '2rem', maxWidth: 560, margin: '0 auto 2rem' }}>
            Track emissions across Scope 1, 2, and 3. Map your supply chain. Offset with confidence. Report with compliance. All in one grounded platform.
          </p>
          <div className={css('_flex _aic _jcc _gap3') + ' entrance-fade'}>
            <Link to="/register" className="d-interactive" data-variant="primary" style={{ padding: '0.625rem 1.5rem', fontSize: '1rem', textDecoration: 'none' }}>
              Start Free Trial
              <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="d-interactive" style={{ padding: '0.625rem 1.5rem', fontSize: '1rem', textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="d-section earth-section" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', display: 'inline-block', marginBottom: '0.75rem' }}>Features</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Everything You Need for Climate Intelligence</h2>
          </div>
          <div className={css('_grid _gc1 sm:_gc2 lg:_gc3 _gap6')}>
            {marketingFeatures.map((f, i) => {
              const Icon = featureIcons[i];
              return (
                <div key={i} className="d-surface earth-card" style={{ animationDelay: `${i * 80}ms` }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--d-radius)', background: 'color-mix(in srgb, var(--d-primary) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                    <Icon size={20} style={{ color: 'var(--d-primary)' }} />
                  </div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.375rem' }}>{f.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="d-section" style={{ padding: '4rem 1.5rem', background: 'var(--d-surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', display: 'inline-block', marginBottom: '0.75rem' }}>Testimonials</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Trusted by Sustainability Leaders</h2>
          </div>
          <div className={css('_grid _gc1 sm:_gc3 _gap6')}>
            {testimonials.map((t, i) => (
              <div key={i} className="d-surface earth-card" style={{ animationDelay: `${i * 100}ms` }}>
                <Quote size={20} style={{ color: 'var(--d-accent)', marginBottom: '0.75rem' }} />
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.65, marginBottom: '1rem', fontStyle: 'italic', color: 'var(--d-text)' }}>
                  "{t.quote}"
                </p>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="d-section" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>Ready to Measure What Matters?</h2>
          <p style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>
            Join hundreds of organizations tracking their path to net zero with ClimateDash.
          </p>
          <Link to="/register" className="d-interactive" data-variant="primary" style={{ padding: '0.625rem 2rem', fontSize: '1rem', textDecoration: 'none' }}>
            Get Started Free
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
