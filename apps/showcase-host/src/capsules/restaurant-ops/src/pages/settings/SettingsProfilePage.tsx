import { css } from '@decantr/css';

export function SettingsProfilePage() {
  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header>
        <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Profile</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Your account information.</p>
      </header>
      <div className="bistro-feature-tile">
        <div className={css('_flex _aic _gap4')} style={{ marginBottom: '1.25rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: 'var(--d-surface-raised)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '1.25rem', color: 'var(--d-primary)', border: '2px solid var(--d-border)',
          }}>MS</div>
          <button className="d-interactive">Change photo</button>
        </div>
        <div className={css('_flex _col _gap3')}>
          <Field label="Name" defaultValue="Maria Santos" />
          <Field label="Email" defaultValue="maria@tavola.app" type="email" />
          <Field label="Phone" defaultValue="555-0102" type="tel" />
          <Field label="Role" defaultValue="General Manager" />
          <Field label="Restaurant" defaultValue="Tavola Downtown" />
          <button className="d-interactive" data-variant="primary" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, defaultValue, type = 'text' }: { label: string; defaultValue?: string; type?: string }) {
  return (
    <label className={css('_flex _col _gap1')}>
      <span className={css('_textsm _fontmedium')}>{label}</span>
      <input className="d-control" defaultValue={defaultValue} type={type} />
    </label>
  );
}
