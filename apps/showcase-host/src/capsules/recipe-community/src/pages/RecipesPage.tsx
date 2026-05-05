import { useState, useMemo } from 'react';
import { css } from '@decantr/css';
import { Search, Filter } from 'lucide-react';
import { recipes, cuisines, courses, difficulties } from '../data/mock';
import { RecipeCard } from '../components/RecipeCard';

export function RecipesPage() {
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [course, setCourse] = useState('All');
  const [diff, setDiff] = useState<typeof difficulties[number]>('All');

  const filtered = useMemo(() => {
    return recipes.filter(r => {
      if (query && !r.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (cuisine !== 'All' && r.cuisine !== cuisine) return false;
      if (course !== 'All' && r.course !== course) return false;
      if (diff !== 'All' && r.difficulty !== diff) return false;
      return true;
    });
  }, [query, cuisine, course, diff]);

  return (
    <div className={css('_flex _col _gap6')}>
      {/* Search + Filters */}
      <div className={css('_flex _col _gap3')}>
        <div>
          <h1 className="serif-display" style={{ fontSize: '1.875rem', marginBottom: '0.375rem' }}>Browse Recipes</h1>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
            {filtered.length} {filtered.length === 1 ? 'recipe' : 'recipes'} to cook through
          </p>
        </div>
        <div style={{ position: 'relative', maxWidth: 480 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
          <input className="d-control" placeholder="Search recipes, ingredients, cuisines…"
            value={query} onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '2.25rem' }} />
        </div>
        <div className={css('_flex _aic _gap2')} style={{ flexWrap: 'wrap' }}>
          <Filter size={14} style={{ color: 'var(--d-text-muted)' }} />
          <FilterGroup label="Cuisine" options={cuisines} value={cuisine} onChange={setCuisine} />
          <FilterGroup label="Course" options={courses} value={course} onChange={setCourse} />
          <FilterGroup label="Difficulty" options={[...difficulties]} value={diff} onChange={(v) => setDiff(v as typeof difficulties[number])} />
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {filtered.map(r => <RecipeCard key={r.id} recipe={r} />)}
      </div>
      {filtered.length === 0 && (
        <div className="feature-tile" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ fontFamily: 'system-ui, sans-serif', color: 'var(--d-text-muted)' }}>
            No recipes match — try loosening a filter and come back hungry.
          </p>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <label className={css('_flex _aic _gap1')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{label}:</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '0.25rem 0.5rem', border: '1px solid var(--d-border)',
          background: 'var(--d-surface)', borderRadius: 'var(--d-radius-sm)',
          fontSize: '0.8125rem', color: 'var(--d-text)',
        }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
