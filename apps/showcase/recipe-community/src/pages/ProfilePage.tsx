import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { css } from '@decantr/css';
import { UserPlus, UserCheck, Share2 } from 'lucide-react';
import { getCreator, recipes } from '../data/mock';
import { RecipeCard } from '../components/RecipeCard';

export function ProfilePage() {
  const { id } = useParams();
  const creator = getCreator(id ?? '');
  const [following, setFollowing] = useState(false);
  const theirRecipes = recipes.filter(r => r.authorId === creator.id).length
    ? recipes.filter(r => r.authorId === creator.id)
    : recipes.slice(0, 4);

  return (
    <div className={css('_flex _col _gap6')} style={{ maxWidth: '64rem', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="feature-tile" style={{ padding: '2rem' }}>
        <div className={css('_flex _aic _gap4')} style={{ flexWrap: 'wrap', fontFamily: 'system-ui, sans-serif' }}>
          <img src={creator.avatar} alt="" style={{ width: 96, height: 96, borderRadius: '50%', border: '3px solid var(--d-bg)', boxShadow: 'var(--d-shadow)' }} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 className="serif-display" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{creator.name}</h1>
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '0.5rem' }}>{creator.handle}</p>
            <p style={{ color: 'var(--d-text)', lineHeight: 1.5, marginBottom: '0.75rem' }}>{creator.bio}</p>
            <div className={css('_flex _aic _gap4 _textsm')} style={{ color: 'var(--d-text-muted)' }}>
              <span><strong style={{ color: 'var(--d-text)' }}>{creator.recipesCount}</strong> recipes</span>
              <span><strong style={{ color: 'var(--d-text)' }}>{creator.followers.toLocaleString()}</strong> followers</span>
            </div>
          </div>
          <div className={css('_flex _aic _gap2')}>
            <button onClick={() => setFollowing(!following)}
              className="d-interactive" data-variant={following ? 'ghost' : 'primary'}
              style={{ fontFamily: 'system-ui, sans-serif' }}>
              {following ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
            </button>
            <button className="d-interactive" style={{ padding: '0.5rem' }} aria-label="Share">
              <Share2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Recipes grid */}
      <section>
        <h2 className="serif-display" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recipes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {theirRecipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      </section>
    </div>
  );
}
