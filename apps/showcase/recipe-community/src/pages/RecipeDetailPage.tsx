import { useParams, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Clock, Users, ChefHat, Heart, Share2, Bookmark, Play, GripVertical } from 'lucide-react';
import { getRecipe, getCreator, comments } from '../data/mock';
import { EmojiReactionBar } from '../components/EmojiReactionBar';

export function RecipeDetailPage() {
  const { id } = useParams();
  const recipe = getRecipe(id ?? '');
  const author = getCreator(recipe.authorId);

  return (
    <div className={css('_flex _col _gap6')} style={{ maxWidth: '64rem', margin: '0 auto', width: '100%' }}>
      {/* Hero */}
      <div style={{ position: 'relative', borderRadius: 'var(--d-radius-xl)', overflow: 'hidden' }}>
        <img src={recipe.image} alt={recipe.title} className="food-photo" style={{ aspectRatio: '16/9', maxHeight: 480 }} />
      </div>

      {/* Header */}
      <div className={css('_flex _col _gap3')}>
        <div className={css('_flex _aic _gap2')} style={{ flexWrap: 'wrap' }}>
          {recipe.tags.map(t => <span key={t} className="tag-chip" data-tone="herb">{t}</span>)}
        </div>
        <h1 className="serif-display" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}>{recipe.title}</h1>
        <p style={{ color: 'var(--d-text-muted)', lineHeight: 1.6, fontSize: '1.0625rem', fontFamily: 'system-ui, sans-serif', maxWidth: '48rem' }}>
          {recipe.description}
        </p>

        <div className={css('_flex _aic _gap4')} style={{ fontFamily: 'system-ui, sans-serif', flexWrap: 'wrap' }}>
          <Link to={`/profile/${author.id}`} className={css('_flex _aic _gap2')}
            style={{ textDecoration: 'none', color: 'inherit' }}>
            <img src={author.avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />
            <div>
              <div className={css('_textsm _fontmedium')}>{author.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{author.handle}</div>
            </div>
          </Link>
          <div style={{ height: 24, width: 1, background: 'var(--d-border)' }} />
          <Meta icon={<Clock size={14} />} label={`${recipe.time} min`} />
          <Meta icon={<Users size={14} />} label={`Serves ${recipe.servings}`} />
          <Meta icon={<ChefHat size={14} />} label={recipe.difficulty} />
        </div>

        <div className={css('_flex _aic _gap2')} style={{ flexWrap: 'wrap' }}>
          <Link to={`/recipes/${recipe.id}/cook`} className="d-interactive" data-variant="primary"
            style={{ textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>
            <Play size={14} /> Start Cook Mode
          </Link>
          <button className="d-interactive" style={{ fontFamily: 'system-ui, sans-serif' }}>
            <Bookmark size={14} /> Save
          </button>
          <button className="d-interactive" style={{ fontFamily: 'system-ui, sans-serif' }}>
            <Share2 size={14} /> Share
          </button>
          <button className="d-interactive" style={{ fontFamily: 'system-ui, sans-serif' }}>
            <Heart size={14} /> {recipe.saves}
          </button>
        </div>
      </div>

      {/* Ingredients + Steps */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '2.5rem', alignItems: 'flex-start' }} className="detail-grid">
        {/* Ingredients */}
        <aside className="feature-tile" style={{ position: 'sticky', top: '1rem' }}>
          <h2 className="serif-display" style={{ fontSize: '1.25rem', marginBottom: '0.875rem' }}>Ingredients</h2>
          <ul className={css('_flex _col _gap2')} style={{ listStyle: 'none', fontFamily: 'system-ui, sans-serif' }}>
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className={css('_flex _aic _gap2')}
                style={{ padding: '0.375rem 0', borderBottom: i < recipe.ingredients.length - 1 ? '1px solid var(--d-border)' : 'none' }}>
                <GripVertical size={14} style={{ color: 'var(--d-text-muted)', opacity: 0.6, cursor: 'grab' }} />
                <input type="checkbox" style={{ accentColor: 'var(--d-primary)' }} />
                <span className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', minWidth: 64 }}>{ing.qty}</span>
                <span className={css('_textsm')}>{ing.name}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Steps */}
        <section className={css('_flex _col _gap4')}>
          <h2 className="serif-display" style={{ fontSize: '1.25rem' }}>Method</h2>
          <ol className={css('_flex _col _gap4')} style={{ listStyle: 'none', padding: 0 }}>
            {recipe.steps.map((s, i) => (
              <li key={i} className="accent-stripe" style={{ paddingLeft: '1rem', fontFamily: 'system-ui, sans-serif' }}>
                <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.5rem' }}>
                  <span className="d-label" style={{ color: 'var(--d-primary)' }}>Step {i + 1}</span>
                  {s.duration && (
                    <span className="tag-chip" style={{ fontSize: '0.6875rem' }}>
                      <Clock size={10} /> {s.duration}m
                    </span>
                  )}
                </div>
                <h3 className="serif-display" style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{s.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Reactions + Comments */}
      <section className={css('_flex _col _gap4')} style={{ marginTop: '1rem' }}>
        <div className={css('_flex _col _gap3')}>
          <h2 className="serif-display" style={{ fontSize: '1.25rem' }}>Reactions</h2>
          <EmojiReactionBar />
        </div>
        <hr className="warm-divider" />
        <div className={css('_flex _col _gap3')}>
          <h2 className="serif-display" style={{ fontSize: '1.25rem' }}>Notes from cooks</h2>
          <ul className={css('_flex _col _gap3')} style={{ listStyle: 'none' }}>
            {comments.map(c => (
              <li key={c.id} className="feature-tile">
                <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.5rem' }}>
                  <img src={c.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                  <span className={css('_textsm _fontmedium')} style={{ fontFamily: 'system-ui, sans-serif' }}>{c.author}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>· {c.createdAt}</span>
                </div>
                <p style={{ color: 'var(--d-text)', lineHeight: 1.5, fontFamily: 'system-ui, sans-serif', fontSize: '0.9375rem' }}>{c.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <style>{`@media (max-width: 767px) { .detail-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function Meta({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className={css('_flex _aic _gap1 _textsm')} style={{ color: 'var(--d-text-muted)' }}>
      {icon} {label}
    </span>
  );
}
