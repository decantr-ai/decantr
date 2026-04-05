import { useParams } from 'react-router-dom';
import { css } from '@decantr/css';
import { events } from '../../data/mock';

export function OrgEventEditPage() {
  const { id } = useParams();
  const event = events.find((e) => e.id === id) || events[0];

  return (
    <div className={css('_flex _col _gap4')} style={{ maxWidth: '56rem', fontFamily: 'system-ui, sans-serif' }}>
      <header>
        <span className="display-label">Editing</span>
        <h1 className="display-heading" style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>{event.title}</h1>
      </header>

      <div className="feature-tile">
        <h2 className="display-heading section-title" style={{ fontSize: '1.0625rem', marginBottom: '1rem' }}>Event details</h2>
        <div className={css('_flex _col _gap3')}>
          <Field label="Title" value={event.title} />
          <Field label="Description" value={event.description} as="textarea" />
          <div className={css('_flex _gap3')}>
            <Field label="Venue" value={event.venue} flex />
            <Field label="City" value={event.city} flex />
          </div>
          <div className={css('_flex _gap3')}>
            <Field label="Date" type="datetime-local" value="2026-05-23T18:00" flex />
            <Field label="Category" value={event.category} flex />
          </div>
        </div>
      </div>

      <div className="feature-tile">
        <h2 className="display-heading section-title" style={{ fontSize: '1.0625rem', marginBottom: '1rem' }}>Ticket tiers</h2>
        <div className={css('_flex _col _gap3')}>
          {event.tiers.map((t) => (
            <div key={t.id} className={css('_flex _aic _gap3')} style={{ padding: '0.875rem', background: 'var(--d-bg)', borderRadius: 'var(--d-radius)', border: '1px solid var(--d-border)' }}>
              <div style={{ flex: 1 }}>
                <div className={css('_fontmedium')}>{t.name}</div>
                <div className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{t.remaining} remaining</div>
              </div>
              <div className="display-heading gradient-pink-violet" style={{ fontSize: '1.125rem' }}>
                ${t.price.toFixed(0)}
              </div>
              <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>Edit</button>
            </div>
          ))}
        </div>
      </div>

      <div className={css('_flex _gap2 _jcend')}>
        <button className="d-interactive" data-variant="ghost">Cancel</button>
        <button className="d-interactive cta-glossy">Save Changes</button>
      </div>
    </div>
  );
}

function Field({ label, value, type = 'text', as, flex }: { label: string; value: string; type?: string; as?: 'textarea'; flex?: boolean }) {
  return (
    <label className={css('_flex _col _gap1')} style={{ flex: flex ? 1 : undefined }}>
      <span className={css('_textsm _fontmedium')}>{label}</span>
      {as === 'textarea'
        ? <textarea className="d-control" defaultValue={value} rows={3} />
        : <input className="d-control" defaultValue={value} type={type} />}
    </label>
  );
}
