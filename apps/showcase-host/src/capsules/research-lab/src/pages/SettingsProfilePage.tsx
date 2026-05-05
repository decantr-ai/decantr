import { css } from '@decantr/css';
import { useState } from 'react';
import { SettingsLayout } from '../components/SettingsLayout';

export function SettingsProfilePage() {
  const [name, setName] = useState('Dr. Sarah Chen');
  const [email] = useState('sarah.chen@lab.edu');
  const [role] = useState('Principal Investigator');
  const [department, setDepartment] = useState('Molecular Biology');

  return (
    <SettingsLayout>
      <h1 style={{ fontWeight: 500, fontSize: '1.25rem', marginBottom: '1.25rem' }}>Profile</h1>

      <div className="lab-panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        <div className={css('_flex _aic _gap4')} style={{ marginBottom: '1.25rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 2, background: 'color-mix(in srgb, var(--d-primary) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: '1.25rem', color: 'var(--d-primary)' }}>
            SC
          </div>
          <div>
            <p style={{ fontWeight: 500, fontSize: '1rem' }}>{name}</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{role}</p>
          </div>
        </div>

        <div className={css('_flex _col _gap4')}>
          <div className={css('_flex _col _gap2')}>
            <label className={css('_textsm _fontmedium')} htmlFor="prof-name">Full Name</label>
            <input id="prof-name" type="text" className="d-control" value={name} onChange={(e) => setName(e.target.value)} style={{ borderRadius: 2 }} />
          </div>
          <div className={css('_flex _col _gap2')}>
            <label className={css('_textsm _fontmedium')} htmlFor="prof-email">Email</label>
            <input id="prof-email" type="email" className="d-control" value={email} disabled style={{ borderRadius: 2 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Contact your administrator to change your email.</span>
          </div>
          <div className={css('_flex _col _gap2')}>
            <label className={css('_textsm _fontmedium')} htmlFor="prof-dept">Department</label>
            <input id="prof-dept" type="text" className="d-control" value={department} onChange={(e) => setDepartment(e.target.value)} style={{ borderRadius: 2 }} />
          </div>
          <div>
            <button className="d-interactive" data-variant="primary" style={{ borderRadius: 2 }}>Save Changes</button>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
