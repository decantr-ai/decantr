import { useParams, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Stepper } from '../components/Stepper';
import { getRecipe } from '../data/mock';

export function CookingPage() {
  const { id } = useParams();
  const recipe = getRecipe(id ?? '');
  return (
    <div className={css('_flex _col _gap6')} style={{ width: '100%' }}>
      <header className={css('_flex _col _gap1')} style={{ textAlign: 'center' }}>
        <span className="d-label">Now cooking</span>
        <h1 className="serif-display" style={{ fontSize: '1.875rem' }}>{recipe.title}</h1>
        <Link to={`/recipes/${recipe.id}`} className={css('_textsm')}
          style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>
          View full recipe
        </Link>
      </header>
      <Stepper steps={recipe.steps} />
    </div>
  );
}
