import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { feedEvents, getRecipe } from '../data/mock';
import { EmojiReactionBar } from '../components/EmojiReactionBar';

const verb: Record<string, string> = {
  cooked: 'just cooked',
  saved: 'saved',
  published: 'published',
  reacted: 'reacted to',
};

export function FeedPage() {
  return (
    <div className={css('_flex _col _gap6')} style={{ maxWidth: '56rem', margin: '0 auto', width: '100%' }}>
      <header>
        <h1 className="serif-display" style={{ fontSize: '1.875rem' }}>Community Feed</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
          What the cooks you follow are making this week
        </p>
      </header>
      <ul className={css('_flex _col _gap4')} style={{ listStyle: 'none' }}>
        {feedEvents.map((ev) => {
          const r = getRecipe(ev.recipeId);
          return (
            <li key={ev.id} className="recipe-card" style={{ padding: 0, cursor: 'default' }}>
              <div className={css('_flex _aic _gap2')} style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--d-border)', fontFamily: 'system-ui, sans-serif' }}>
                <img src={ev.user.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <div className={css('_textsm')}>
                    <Link to={`/profile/${ev.user.id}`} style={{ textDecoration: 'none', color: 'var(--d-text)', fontWeight: 600 }}>{ev.user.name}</Link>
                    <span style={{ color: 'var(--d-text-muted)' }}> {verb[ev.type]} </span>
                    <Link to={`/recipes/${r.id}`} style={{ textDecoration: 'none', color: 'var(--d-primary)', fontWeight: 500 }}>{r.title}</Link>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{ev.time}</div>
                </div>
              </div>
              <Link to={`/recipes/${r.id}`} style={{ display: 'block' }}>
                <img src={r.image} alt={r.title} className="food-photo" style={{ aspectRatio: '16/9' }} />
              </Link>
              <div style={{ padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
                <p style={{ color: 'var(--d-text-muted)', fontSize: '0.9375rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                  {r.description}
                </p>
                <EmojiReactionBar />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
