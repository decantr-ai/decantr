import { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { tables } from '../../data/mock';

export function NewReservationPage() {
  const navigate = useNavigate();
  const available = tables.filter(t => t.status === 'available');

  const onSubmit = (e: FormEvent) => { e.preventDefault(); navigate('/floor/reservations'); };

  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 560 }}>
      <div>
        <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>New Reservation</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Book a table or seat a walk-in</p>
      </div>

      <form onSubmit={onSubmit} className={css('_flex _col _gap3')}>
        <label className={css('_flex _col _gap1')}>
          <span className={css('_textsm _fontmedium')}>Guest Name</span>
          <input className="d-control" placeholder="Last name or party name" />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <label className={css('_flex _col _gap1')}>
            <span className={css('_textsm _fontmedium')}>Party Size</span>
            <input className="d-control" type="number" min={1} max={20} defaultValue={2} />
          </label>
          <label className={css('_flex _col _gap1')}>
            <span className={css('_textsm _fontmedium')}>Phone</span>
            <input className="d-control" type="tel" placeholder="555-0000" />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <label className={css('_flex _col _gap1')}>
            <span className={css('_textsm _fontmedium')}>Date</span>
            <input className="d-control" type="date" defaultValue="2026-04-06" />
          </label>
          <label className={css('_flex _col _gap1')}>
            <span className={css('_textsm _fontmedium')}>Time</span>
            <select className="d-control">
              {['5:00 PM','5:30 PM','6:00 PM','6:30 PM','7:00 PM','7:30 PM','8:00 PM','8:30 PM','9:00 PM','9:30 PM'].map(t =>
                <option key={t}>{t}</option>
              )}
            </select>
          </label>
        </div>

        {/* Table picker */}
        <div>
          <span className={css('_textsm _fontmedium')} style={{ marginBottom: '0.5rem', display: 'block' }}>Assign Table (optional)</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: '0.5rem' }}>
            {available.map(t => (
              <label key={t.id} className={css('_flex _col _aic _gap1')}
                style={{ padding: '0.625rem', border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius-sm)', cursor: 'pointer', background: 'var(--d-surface)' }}>
                <input type="radio" name="table" value={t.id} style={{ accentColor: 'var(--d-primary)' }} />
                <span className={css('_textsm _fontmedium')}>T{t.number}</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{t.seats} seats</span>
              </label>
            ))}
          </div>
        </div>

        <label className={css('_flex _col _gap1')}>
          <span className={css('_textsm _fontmedium')}>Notes</span>
          <textarea className="d-control" rows={2} placeholder="Allergies, occasion, preferences..." />
        </label>

        <div className={css('_flex _aic _gap2')}>
          <button type="submit" className="d-interactive" data-variant="primary">Save Reservation</button>
          <Link to="/floor/reservations" className="d-interactive" style={{ textDecoration: 'none' }}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
