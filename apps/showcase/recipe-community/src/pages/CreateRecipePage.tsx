import { useState } from 'react';
import { css } from '@decantr/css';
import { ImagePlus, GripVertical, Plus, X, Save } from 'lucide-react';

export function CreateRecipePage() {
  const [ingredients, setIngredients] = useState([
    { qty: '2 cups', name: 'all-purpose flour' },
    { qty: '1 tsp', name: 'kosher salt' },
    { qty: '', name: '' },
  ]);
  const [steps, setSteps] = useState([
    { title: 'Prep your mise', body: 'Gather everything before you start.' },
    { title: '', body: '' },
  ]);

  const addIng = () => setIngredients([...ingredients, { qty: '', name: '' }]);
  const rmIng = (i: number) => setIngredients(ingredients.filter((_, idx) => idx !== i));
  const addStep = () => setSteps([...steps, { title: '', body: '' }]);
  const rmStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i));

  return (
    <div className={css('_flex _col _gap6')} style={{ maxWidth: '56rem', margin: '0 auto', width: '100%' }}>
      <div className={css('_flex _aic _jcsb')}>
        <div>
          <h1 className="serif-display" style={{ fontSize: '1.75rem' }}>Create a Recipe</h1>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
            Autosaves as you write.
          </p>
        </div>
        <div className={css('_flex _aic _gap2')}>
          <span className="tag-chip" data-tone="herb">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--d-secondary)' }} /> Saved 2s ago
          </span>
          <button className="d-interactive" data-variant="primary" style={{ fontFamily: 'system-ui, sans-serif' }}>
            <Save size={14} /> Publish
          </button>
        </div>
      </div>

      {/* Photo upload */}
      <div className="feature-tile" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          aspectRatio: '16/9', background: 'linear-gradient(135deg, var(--d-surface-raised), #F5E6D0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem',
          cursor: 'pointer', fontFamily: 'system-ui, sans-serif', color: 'var(--d-text-muted)',
        }}>
          <ImagePlus size={32} />
          <span className={css('_textsm')}>Drop a photo or click to upload</span>
          <span style={{ fontSize: '0.75rem' }}>JPG, PNG, WEBP · 16:9 hero photo</span>
        </div>
      </div>

      {/* Basics */}
      <section className={css('_flex _col _gap3')}>
        <h2 className="serif-display" style={{ fontSize: '1.125rem' }}>Basics</h2>
        <label className={css('_flex _col _gap1')} style={{ fontFamily: 'system-ui, sans-serif' }}>
          <span className={css('_textsm _fontmedium')}>Title</span>
          <input className="d-control" placeholder="My grandmother's sourdough" />
        </label>
        <label className={css('_flex _col _gap1')} style={{ fontFamily: 'system-ui, sans-serif' }}>
          <span className={css('_textsm _fontmedium')}>Story</span>
          <textarea className="d-control" rows={3} placeholder="What makes this recipe yours?" />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', fontFamily: 'system-ui, sans-serif' }}>
          <label className={css('_flex _col _gap1')}>
            <span className={css('_textsm _fontmedium')}>Cuisine</span>
            <input className="d-control" placeholder="Italian" />
          </label>
          <label className={css('_flex _col _gap1')}>
            <span className={css('_textsm _fontmedium')}>Course</span>
            <input className="d-control" placeholder="Main" />
          </label>
          <label className={css('_flex _col _gap1')}>
            <span className={css('_textsm _fontmedium')}>Time (min)</span>
            <input className="d-control" placeholder="45" type="number" />
          </label>
          <label className={css('_flex _col _gap1')}>
            <span className={css('_textsm _fontmedium')}>Serves</span>
            <input className="d-control" placeholder="4" type="number" />
          </label>
        </div>
      </section>

      {/* Ingredients */}
      <section className={css('_flex _col _gap3')}>
        <div className={css('_flex _aic _jcsb')}>
          <h2 className="serif-display" style={{ fontSize: '1.125rem' }}>Ingredients</h2>
          <button onClick={addIng} className="d-interactive" data-variant="ghost"
            style={{ padding: '0.25rem 0.625rem', fontSize: '0.8125rem', fontFamily: 'system-ui, sans-serif' }}>
            <Plus size={14} /> Add
          </button>
        </div>
        <ul className={css('_flex _col _gap2')} style={{ listStyle: 'none' }}>
          {ingredients.map((ing, i) => (
            <li key={i} className={css('_flex _aic _gap2')}>
              <GripVertical size={14} style={{ color: 'var(--d-text-muted)', cursor: 'grab', opacity: 0.6 }} />
              <input className="d-control" defaultValue={ing.qty} placeholder="2 cups" style={{ maxWidth: 120 }} />
              <input className="d-control" defaultValue={ing.name} placeholder="ingredient" style={{ flex: 1 }} />
              <button onClick={() => rmIng(i)} className="d-interactive" data-variant="ghost"
                style={{ padding: '0.375rem' }} aria-label="Remove">
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Steps */}
      <section className={css('_flex _col _gap3')}>
        <div className={css('_flex _aic _jcsb')}>
          <h2 className="serif-display" style={{ fontSize: '1.125rem' }}>Steps</h2>
          <button onClick={addStep} className="d-interactive" data-variant="ghost"
            style={{ padding: '0.25rem 0.625rem', fontSize: '0.8125rem', fontFamily: 'system-ui, sans-serif' }}>
            <Plus size={14} /> Add Step
          </button>
        </div>
        <ol className={css('_flex _col _gap3')} style={{ listStyle: 'none' }}>
          {steps.map((s, i) => (
            <li key={i} className="feature-tile">
              <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.5rem' }}>
                <GripVertical size={14} style={{ color: 'var(--d-text-muted)', cursor: 'grab', opacity: 0.6 }} />
                <span className="d-label" style={{ color: 'var(--d-primary)' }}>Step {i + 1}</span>
                <button onClick={() => rmStep(i)} className="d-interactive" data-variant="ghost"
                  style={{ padding: '0.25rem', marginLeft: 'auto' }} aria-label="Remove">
                  <X size={14} />
                </button>
              </div>
              <input className="d-control" defaultValue={s.title} placeholder="Step title"
                style={{ marginBottom: '0.5rem', fontFamily: 'system-ui, sans-serif' }} />
              <textarea className="d-control" defaultValue={s.body} rows={2}
                placeholder="Describe what to do…" style={{ fontFamily: 'system-ui, sans-serif' }} />
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
