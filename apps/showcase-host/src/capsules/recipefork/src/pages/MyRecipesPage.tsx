import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Plus, Edit3, Eye, MoreHorizontal } from 'lucide-react';
import { recipes } from '../data/mock';

export function MyRecipesPage() {
  const mine = recipes.slice(0, 6);
  return (
    <div className={css('_flex _col _gap4')} style={{ maxWidth: '64rem', margin: '0 auto', width: '100%' }}>
      <div className={css('_flex _aic _jcsb')}>
        <div>
          <h1 className="serif-display" style={{ fontSize: '1.75rem' }}>My Recipes</h1>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
            {mine.length} recipes · 2 drafts
          </p>
        </div>
        <Link to="/recipes/create" className="d-interactive" data-variant="primary"
          style={{ textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>
          <Plus size={14} /> New Recipe
        </Link>
      </div>

      <div className="feature-tile" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Recipe</th>
              <th className="d-data-header">Status</th>
              <th className="d-data-header">Saves</th>
              <th className="d-data-header">Rating</th>
              <th className="d-data-header">Updated</th>
              <th className="d-data-header"></th>
            </tr>
          </thead>
          <tbody>
            {mine.map((r, i) => (
              <tr key={r.id} className="d-data-row">
                <td className="d-data-cell">
                  <div className={css('_flex _aic _gap2')}>
                    <img src={r.image} alt="" style={{ width: 40, height: 40, borderRadius: 'var(--d-radius-sm)', objectFit: 'cover' }} />
                    <Link to={`/recipes/${r.id}`} style={{ textDecoration: 'none', color: 'var(--d-text)', fontWeight: 500, fontFamily: 'system-ui, sans-serif' }}>
                      {r.title}
                    </Link>
                  </div>
                </td>
                <td className="d-data-cell">
                  <span className="d-annotation" data-status={i % 5 === 0 ? 'warning' : 'success'}>
                    {i % 5 === 0 ? 'Draft' : 'Published'}
                  </span>
                </td>
                <td className="d-data-cell" style={{ fontFamily: 'system-ui, sans-serif' }}>{r.saves.toLocaleString()}</td>
                <td className="d-data-cell" style={{ fontFamily: 'system-ui, sans-serif' }}>★ {r.rating}</td>
                <td className="d-data-cell" style={{ fontFamily: 'system-ui, sans-serif', color: 'var(--d-text-muted)' }}>{r.publishedAt}</td>
                <td className="d-data-cell">
                  <div className={css('_flex _aic _gap1')}>
                    <Link to={`/recipes/${r.id}`} className="d-interactive" data-variant="ghost"
                      style={{ padding: '0.25rem' }} aria-label="View"><Eye size={14} /></Link>
                    <Link to={`/recipes/create`} className="d-interactive" data-variant="ghost"
                      style={{ padding: '0.25rem' }} aria-label="Edit"><Edit3 size={14} /></Link>
                    <button className="d-interactive" data-variant="ghost"
                      style={{ padding: '0.25rem' }} aria-label="More"><MoreHorizontal size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
