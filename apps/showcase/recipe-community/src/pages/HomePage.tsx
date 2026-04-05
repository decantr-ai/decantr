import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { ArrowRight, Sparkles, Users, BookOpen } from 'lucide-react';
import { recipes, creators } from '../data/mock';
import { RecipeCard } from '../components/RecipeCard';

const quotes = [
  { body: 'Gather turned my Sunday cooking into a ritual I actually share.', author: 'Nora H.', role: 'Home cook · Osaka' },
  { body: 'I saved 80 recipes in my first week. The photography alone is worth joining.', author: 'Marco D.', role: 'Pasta enthusiast' },
  { body: 'Finally a recipe app that feels like browsing a gorgeous cookbook.', author: 'Inés V.', role: 'Market cook · Barcelona' },
];

export function HomePage() {
  const featured = recipes.slice(0, 6);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Hero */}
      <section className="d-section" style={{ maxWidth: '72rem', margin: '0 auto', padding: '4rem 1.5rem 3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '3rem', alignItems: 'center' }} className="hero-grid">
          <div className={css('_flex _col _gap4')}>
            <span className="tag-chip" data-tone="accent" style={{ alignSelf: 'flex-start' }}>
              <Sparkles size={12} /> New · Weekly picks
            </span>
            <h1 className="serif-display" style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)', letterSpacing: '-0.02em' }}>
              Cook more of what you <span className="gradient-warm">already love</span>.
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--d-text-muted)', lineHeight: 1.6, maxWidth: 520 }}>
              Gather is a recipe community built around beautiful photography, real kitchens, and the cooks
              who share generously. Save recipes, build collections, follow creators, and cook hands-free.
            </p>
            <div className={css('_flex _aic _gap3')}>
              <Link to="/register" className="d-interactive" data-variant="primary"
                style={{ textDecoration: 'none', padding: '0.625rem 1.25rem' }}>
                Join Free <ArrowRight size={16} />
              </Link>
              <Link to="/recipes" className="d-interactive" data-variant="ghost"
                style={{ textDecoration: 'none', padding: '0.625rem 1.25rem' }}>
                Browse Recipes
              </Link>
            </div>
            <div className={css('_flex _aic _gap6')} style={{ marginTop: '1rem' }}>
              <div>
                <div className="serif-display" style={{ fontSize: '1.5rem' }}>12k+</div>
                <div className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Home cooks</div>
              </div>
              <div>
                <div className="serif-display" style={{ fontSize: '1.5rem' }}>3,400</div>
                <div className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Recipes</div>
              </div>
              <div>
                <div className="serif-display" style={{ fontSize: '1.5rem' }}>180+</div>
                <div className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Collections</div>
              </div>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <img src={recipes[3].image} alt="Focaccia" className="food-photo" style={{ borderRadius: 'var(--d-radius-xl)', aspectRatio: '4/5', boxShadow: 'var(--d-shadow-lg)' }} />
            <div className="d-surface" style={{ position: 'absolute', bottom: '-1rem', left: '-1rem', padding: '0.875rem 1rem', maxWidth: 220, borderRadius: 'var(--d-radius-lg)' }}>
              <div className={css('_flex _aic _gap2')}>
                <img src={creators[2].avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                <div>
                  <div className={css('_textsm _fontmedium')}>{creators[2].name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>just published</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured recipes */}
      <section className="d-section" style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '1.5rem' }}>
          <div>
            <span className="d-label">This Week</span>
            <h2 className="serif-display" style={{ fontSize: '2rem', marginTop: '0.25rem' }}>Recipes worth saving</h2>
          </div>
          <Link to="/recipes" className={css('_textsm _fontmedium')}
            style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>
            All recipes →
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {featured.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      </section>

      {/* Community quotes */}
      <section className="d-section" style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="d-label">Community</span>
          <h2 className="serif-display" style={{ fontSize: '2rem', marginTop: '0.25rem' }}>From kitchens like yours</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {quotes.map((q) => (
            <div key={q.author} className="feature-tile">
              <p className="serif-display" style={{ fontSize: '1.0625rem', lineHeight: 1.5, marginBottom: '1rem', fontStyle: 'italic' }}>
                "{q.body}"
              </p>
              <div className={css('_flex _aic _gap2')}>
                <div>
                  <div className={css('_textsm _fontmedium')}>{q.author}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{q.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Join CTA */}
      <section className="d-section" style={{ padding: '4rem 1.5rem' }}>
        <div className="d-surface" style={{ maxWidth: '56rem', margin: '0 auto', padding: '3rem 2rem', textAlign: 'center',
          borderRadius: 'var(--d-radius-xl)', background: 'linear-gradient(135deg, var(--d-surface-raised), var(--d-surface))',
          border: '1px solid var(--d-border)' }}>
          <BookOpen size={28} style={{ color: 'var(--d-primary)', margin: '0 auto 0.75rem' }} />
          <h2 className="serif-display" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
            Start your recipe collection
          </h2>
          <p style={{ color: 'var(--d-text-muted)', maxWidth: 520, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Free forever. Save unlimited recipes, follow cooks you admire, and cook with the stove-safe Cook Mode.
          </p>
          <div className={css('_flex _aic _gap3')} style={{ justifyContent: 'center' }}>
            <Link to="/register" className="d-interactive" data-variant="primary"
              style={{ padding: '0.625rem 1.5rem', textDecoration: 'none' }}>
              <Users size={16} /> Join Gather
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 767px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
