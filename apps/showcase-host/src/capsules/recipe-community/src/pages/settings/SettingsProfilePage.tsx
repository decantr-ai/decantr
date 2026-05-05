import { css } from '@decantr/css';
import { creators } from '../../data/mock';

export function SettingsProfilePage() {
  const me = creators[0];
  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header>
        <h1 className="serif-display" style={{ fontSize: '1.5rem' }}>Profile</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>How cooks see you on Gather.</p>
      </header>
      <div className="feature-tile">
        <div className={css('_flex _aic _gap4')} style={{ marginBottom: '1.25rem' }}>
          <img src={me.avatar} alt="" style={{ width: 64, height: 64, borderRadius: '50%' }} />
          <button className="d-interactive">Change photo</button>
        </div>
        <div className={css('_flex _col _gap3')}>
          <Field label="Name" defaultValue={me.name} />
          <Field label="Handle" defaultValue={me.handle} />
          <Field label="Bio" defaultValue={me.bio} as="textarea" />
          <Field label="Email" defaultValue="sage@gather.cooking" type="email" />
          <button className="d-interactive" data-variant="primary" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, defaultValue, type = 'text', as }: { label: string; defaultValue?: string; type?: string; as?: 'textarea' }) {
  return (
    <label className={css('_flex _col _gap1')}>
      <span className={css('_textsm _fontmedium')}>{label}</span>
      {as === 'textarea'
        ? <textarea className="d-control" defaultValue={defaultValue} rows={3} />
        : <input className="d-control" defaultValue={defaultValue} type={type} />}
    </label>
  );
}
