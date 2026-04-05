import { Link } from 'react-router-dom';
import { Clock, Users, Heart } from 'lucide-react';
import type { Recipe } from '../data/mock';

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link to={`/recipes/${recipe.id}`} className="recipe-card food-photo-overlay" style={{ textDecoration: 'none', color: 'inherit', display: 'block', position: 'relative' }}>
      <img src={recipe.image} alt={recipe.title} className="food-photo" loading="lazy" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1rem', zIndex: 1 }}>
        <h3 className="serif-display" style={{ color: '#fff', fontSize: '1.125rem', textShadow: '0 1px 4px rgba(0,0,0,0.4)', marginBottom: '0.375rem' }}>
          {recipe.title}
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#fff', opacity: 0.9, fontFamily: 'system-ui, sans-serif' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {recipe.time}m</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Users size={12} /> {recipe.servings}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Heart size={12} /> {recipe.saves}</span>
        </div>
      </div>
    </Link>
  );
}
