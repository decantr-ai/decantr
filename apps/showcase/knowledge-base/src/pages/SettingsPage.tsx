import { css } from '@decantr/css';
import { Save } from 'lucide-react';
import { useState } from 'react';

export function SettingsPage() {
  const [formData, setFormData] = useState({
    displayName: 'Jane Doe',
    email: 'jane@example.com',
    role: 'Editor',
    bio: 'Technical writer and documentation enthusiast.',
    emailNotifications: true,
    weeklyDigest: true,
    publicProfile: false,
  });

  const update = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="entrance-fade" style={{ maxWidth: '40rem' }}>
      <h1 className={css('_fontsemi')} style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Settings</h1>
      <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '2rem' }}>
        Manage your account preferences and notification settings.
      </p>

      <form
        role="form"
        onSubmit={(e) => { e.preventDefault(); }}
        className={css('_flex _col _gap8')}
      >
        {/* Profile */}
        <div className="d-surface paper-card" style={{ borderRadius: 'var(--d-radius-lg)', padding: 'var(--d-surface-p)' }}>
          <h2 className={css('_fontmedium')} style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Profile</h2>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>
            Your account information.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))', gap: '1rem' }}>
            <div className={css('_flex _col _gap2')}>
              <label className={css('_textsm _fontmedium')} htmlFor="s-name">Display Name</label>
              <input id="s-name" className="d-control" value={formData.displayName} onChange={(e) => update('displayName', e.target.value)} />
            </div>
            <div className={css('_flex _col _gap2')}>
              <label className={css('_textsm _fontmedium')} htmlFor="s-email">Email</label>
              <input id="s-email" type="email" className="d-control" value={formData.email} onChange={(e) => update('email', e.target.value)} />
            </div>
            <div className={css('_flex _col _gap2')}>
              <label className={css('_textsm _fontmedium')} htmlFor="s-role">Role</label>
              <input id="s-role" className="d-control" value={formData.role} onChange={(e) => update('role', e.target.value)} />
            </div>
          </div>
          <div className={css('_flex _col _gap2')} style={{ marginTop: '1rem' }}>
            <label className={css('_textsm _fontmedium')} htmlFor="s-bio">Bio</label>
            <textarea
              id="s-bio"
              className="d-control"
              rows={3}
              style={{ minHeight: '6rem', resize: 'vertical' }}
              value={formData.bio}
              onChange={(e) => update('bio', e.target.value)}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="d-surface paper-card" style={{ borderRadius: 'var(--d-radius-lg)', padding: 'var(--d-surface-p)' }}>
          <h2 className={css('_fontmedium')} style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Notifications</h2>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>
            Control how you receive updates.
          </p>
          <div className={css('_flex _col _gap4')}>
            {[
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates about documentation changes' },
              { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Get a summary of changes every week' },
              { key: 'publicProfile', label: 'Public Profile', desc: 'Allow others to see your contributions' },
            ].map((toggle) => (
              <div key={toggle.key} className={css('_flex _aic _jcsb')}>
                <div>
                  <p className={css('_textsm _fontmedium')}>{toggle.label}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{toggle.desc}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData[toggle.key as keyof typeof formData] as boolean}
                  onClick={() => update(toggle.key, !formData[toggle.key as keyof typeof formData])}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 'var(--d-radius-full)',
                    background: formData[toggle.key as keyof typeof formData]
                      ? 'var(--d-primary)'
                      : 'var(--d-surface-raised)',
                    border: '1px solid var(--d-border)',
                    cursor: 'pointer',
                    position: 'relative',
                    flexShrink: 0,
                    transition: 'background 150ms ease',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: formData[toggle.key as keyof typeof formData] ? 22 : 2,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: '#fff',
                      transition: 'left 150ms ease',
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className={css('_flex _gap3')}>
          <button type="submit" className="d-interactive" data-variant="primary">
            <Save size={16} />
            Save Changes
          </button>
          <button type="button" className="d-interactive" data-variant="ghost">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
