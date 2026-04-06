import { css } from '@decantr/css';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, GripVertical } from 'lucide-react';
import { menus, menuItems, formatCurrency, profitMargin } from '../../data/mock';

export function MenuDetailPage() {
  const { id } = useParams();
  const menu = menus.find(m => m.id === id) ?? menus[0];
  const categories = [...new Set(menuItems.map(i => i.category))];

  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className={css('_flex _aic _gap3')}>
        <Link to="/menus" className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem', textDecoration: 'none' }}>
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>{menu.name}</h1>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{menu.description}</p>
        </div>
        <span className="d-annotation" data-status={menu.active ? 'success' : 'warning'} style={{ marginLeft: 'auto' }}>
          {menu.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Menu editor by category */}
      {categories.map(cat => {
        const items = menuItems.filter(i => i.category === cat);
        return (
          <div key={cat}>
            <span className="d-label" style={{ marginBottom: '0.5rem', display: 'block', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>{cat}</span>
            <div className={css('_flex _col _gap2')}>
              {items.map(item => (
                <div key={item.id} className="bistro-warm-card" style={{ cursor: 'grab', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <GripVertical size={14} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={css('_flex _aic _jcsb')}>
                      <span className={css('_fontmedium')} style={{ fontSize: '0.875rem' }}>{item.name}</span>
                      <span className={css('_fontmedium')} style={{ fontSize: '0.875rem' }}>{formatCurrency(item.price)}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginTop: '0.125rem' }}>{item.description}</p>
                    <div className={css('_flex _aic _gap3')} style={{ marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>Cost: {formatCurrency(item.cost)}</span>
                      <span style={{ fontSize: '0.6875rem', color: profitMargin(item.price, item.cost) > 70 ? 'var(--d-success)' : 'var(--d-text-muted)' }}>
                        Margin: {profitMargin(item.price, item.cost)}%
                      </span>
                      <span className="d-annotation" data-status={item.active ? 'success' : 'warning'} style={{ fontSize: '0.5625rem' }}>
                        {item.active ? 'Active' : 'Off'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
