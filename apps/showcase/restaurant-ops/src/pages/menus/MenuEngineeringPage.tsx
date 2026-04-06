import { css } from '@decantr/css';
import { menuItems, formatCurrency, profitMargin } from '../../data/mock';

type Quadrant = 'Star' | 'Puzzle' | 'Plow Horse' | 'Dog';

function classify(item: typeof menuItems[0]): Quadrant {
  const margin = profitMargin(item.price, item.cost);
  const highPop = item.popularity >= 75;
  const highMargin = margin >= 70;
  if (highPop && highMargin) return 'Star';
  if (!highPop && highMargin) return 'Puzzle';
  if (highPop && !highMargin) return 'Plow Horse';
  return 'Dog';
}

const quadrantColors: Record<Quadrant, string> = {
  'Star': 'var(--d-success)',
  'Puzzle': 'var(--d-info)',
  'Plow Horse': 'var(--d-warning)',
  'Dog': 'var(--d-error)',
};

export function MenuEngineeringPage() {
  const classified = menuItems.map(i => ({ ...i, quadrant: classify(i) }));
  const quadrants: Quadrant[] = ['Star', 'Puzzle', 'Plow Horse', 'Dog'];

  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div>
        <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Menu Engineering</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Profitability vs. popularity matrix</p>
      </div>

      {/* Scatter plot visualization */}
      <div className="bistro-warm-card" style={{ cursor: 'default', padding: '1.25rem' }}>
        <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.75rem' }}>
          <span className="bistro-handwritten" style={{ fontSize: '1rem' }}>Item Matrix</span>
          <div className={css('_flex _aic _gap3')}>
            {quadrants.map(q => (
              <div key={q} className={css('_flex _aic _gap1')}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: quadrantColors[q] }} />
                <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{q}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', width: '100%', height: 280, background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius)', border: '1px solid var(--d-border)' }}>
          {/* Axis labels */}
          <span style={{ position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)', fontSize: '0.625rem', color: 'var(--d-text-muted)' }}>Popularity &rarr;</span>
          <span style={{ position: 'absolute', top: '50%', left: -20, transform: 'rotate(-90deg) translateX(-50%)', fontSize: '0.625rem', color: 'var(--d-text-muted)', transformOrigin: 'center' }}>Margin &rarr;</span>
          {/* Quadrant lines */}
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--d-border)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--d-border)' }} />
          {/* Items */}
          {classified.map(item => {
            const x = (item.popularity / 100) * 90 + 5;
            const margin = profitMargin(item.price, item.cost);
            const y = 95 - (margin / 100) * 90;
            return (
              <div key={item.id} title={`${item.name} — ${item.quadrant}\nMargin: ${margin}%, Pop: ${item.popularity}`}
                style={{
                  position: 'absolute',
                  left: `${x}%`, top: `${y}%`,
                  width: 10, height: 10,
                  borderRadius: '50%',
                  background: quadrantColors[item.quadrant],
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  transition: 'transform 150ms ease',
                  boxShadow: `0 0 0 2px var(--d-surface)`,
                }} />
            );
          })}
        </div>
      </div>

      {/* Item grid table */}
      <table className="d-data">
        <thead>
          <tr>
            <th className="d-data-header">Item</th>
            <th className="d-data-header">Price</th>
            <th className="d-data-header">Cost</th>
            <th className="d-data-header">Margin</th>
            <th className="d-data-header">Popularity</th>
            <th className="d-data-header">Quadrant</th>
          </tr>
        </thead>
        <tbody>
          {classified.sort((a, b) => profitMargin(b.price, b.cost) - profitMargin(a.price, a.cost)).map(item => (
            <tr key={item.id} className="d-data-row">
              <td className="d-data-cell" style={{ fontWeight: 500 }}>{item.name}</td>
              <td className="d-data-cell">{formatCurrency(item.price)}</td>
              <td className="d-data-cell">{formatCurrency(item.cost)}</td>
              <td className="d-data-cell">
                <span style={{ color: profitMargin(item.price, item.cost) > 70 ? 'var(--d-success)' : 'var(--d-text-muted)' }}>
                  {profitMargin(item.price, item.cost)}%
                </span>
              </td>
              <td className="d-data-cell">
                <div className={css('_flex _aic _gap2')}>
                  <div className="depletion-bar" style={{ width: 60 }}>
                    <div className="depletion-bar-fill" style={{ width: `${item.popularity}%`, background: 'var(--d-primary)' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem' }}>{item.popularity}</span>
                </div>
              </td>
              <td className="d-data-cell">
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: quadrantColors[item.quadrant] }}>{item.quadrant}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
