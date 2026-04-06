import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { BookOpen, Plus } from 'lucide-react';
import { menus } from '../../data/mock';

export function MenusPage() {
  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className={css('_flex _aic _jcsb')}>
        <div>
          <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Menus</h1>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Manage your restaurant menus and items</p>
        </div>
        <div className={css('_flex _aic _gap2')}>
          <Link to="/menus/engineering" className="d-interactive" style={{ textDecoration: 'none', fontSize: '0.8125rem' }}>
            Engineering
          </Link>
          <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.8125rem' }}>
            <Plus size={14} /> New Menu
          </button>
        </div>
      </div>

      {/* Menu list */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {menus.map(m => (
          <Link key={m.id} to={`/menus/${m.id}`} className="bistro-menu" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.5rem' }}>
              <div className={css('_flex _aic _gap2')}>
                <BookOpen size={18} style={{ color: 'var(--d-primary)' }} />
                <span className="bistro-handwritten" style={{ fontSize: '1.125rem' }}>{m.name}</span>
              </div>
              <span className="d-annotation" data-status={m.active ? 'success' : 'warning'}>
                {m.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '0.5rem' }}>{m.description}</p>
            <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{m.itemCount} items</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
