import { css } from '@decantr/css';
import { PageHeader } from '../../components/PageHeader';
import { currentCreator } from '../../data/mock';

export function SettingsProfilePage() {
  return (
    <div>
      <PageHeader title="Profile" subtitle="How fans see you across Canvas." />
      <div className="studio-card" style={{ padding: '1.5rem', maxWidth: 640 }}>
        <div className={css('_flex _aic _gap4')} style={{ marginBottom: '1.5rem' }}>
          <img src={currentCreator.avatar} alt="" width={72} height={72} className="studio-avatar-creator" />
          <div>
            <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8125rem' }}>Change photo</button>
            <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif', marginTop: '0.25rem' }}>JPG or PNG · up to 2MB</p>
          </div>
        </div>
        <div className={css('_flex _col _gap3')}>
          {[
            { label: 'Name', value: currentCreator.name },
            { label: 'Username', value: currentCreator.username },
            { label: 'Category', value: currentCreator.category },
          ].map((f) => (
            <label key={f.label} className={css('_flex _col _gap1')} style={{ fontFamily: 'system-ui, sans-serif' }}>
              <span className={css('_textsm _fontmedium')}>{f.label}</span>
              <input className="studio-input" type="text" defaultValue={f.value} />
            </label>
          ))}
          <label className={css('_flex _col _gap1')} style={{ fontFamily: 'system-ui, sans-serif' }}>
            <span className={css('_textsm _fontmedium')}>Bio</span>
            <textarea className="studio-input" rows={3} defaultValue={currentCreator.bio} />
          </label>
        </div>
        <div className={css('_flex _gap2')} style={{ marginTop: '1.5rem' }}>
          <button className="d-interactive studio-glow" data-variant="primary" style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}>Save changes</button>
        </div>
      </div>
    </div>
  );
}
