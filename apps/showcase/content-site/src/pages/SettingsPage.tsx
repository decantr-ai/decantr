import { css } from '@decantr/css';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { author } from '../data/mock';

export function SettingsPage() {
  const [formData, setFormData] = useState({
    displayName: author.name,
    email: author.email,
    title: author.title,
    location: author.location,
    bio: author.bio.split('.').slice(0, 2).join('.') + '.',
    publicProfile: true,
    emailNotifications: true,
    weeklyDigest: true,
  });

  const update = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="entrance-fade" style={{ maxWidth: '40rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', fontFamily: "'Georgia', serif" }}>Settings</h1>
      <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        Manage your account preferences.
      </p>

      <form
        role="form"
        onSubmit={(e) => { e.preventDefault(); }}
        className={css('_flex _col _gap8')}
      >
        {/* Profile section */}
        <div className="editorial-card" style={{ borderRadius: 'var(--d-radius-lg)' }}>
          <h2 className={css('_fontmedium')} style={{ fontSize: '1rem', marginBottom: '0.25rem', fontFamily: 'system-ui, sans-serif' }}>Profile</h2>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
            Your public author information.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))', gap: '1rem' }}>
            <div className={css('_flex _col _gap2')}>
              <label className={css('_textsm _fontmedium')} htmlFor="s-name" style={{ fontFamily: 'system-ui, sans-serif' }}>Display Name</label>
              <input id="s-name" className="d-control" value={formData.displayName} onChange={(e) => update('displayName', e.target.value)} style={{ fontFamily: 'system-ui, sans-serif' }} />
            </div>
            <div className={css('_flex _col _gap2')}>
              <label className={css('_textsm _fontmedium')} htmlFor="s-email" style={{ fontFamily: 'system-ui, sans-serif' }}>Email</label>
              <input id="s-email" type="email" className="d-control" value={formData.email} onChange={(e) => update('email', e.target.value)} style={{ fontFamily: 'system-ui, sans-serif' }} />
            </div>
            <div className={css('_flex _col _gap2')}>
              <label className={css('_textsm _fontmedium')} htmlFor="s-title" style={{ fontFamily: 'system-ui, sans-serif' }}>Title</label>
              <input id="s-title" className="d-control" value={formData.title} onChange={(e) => update('title', e.target.value)} style={{ fontFamily: 'system-ui, sans-serif' }} />
            </div>
            <div className={css('_flex _col _gap2')}>
              <label className={css('_textsm _fontmedium')} htmlFor="s-location" style={{ fontFamily: 'system-ui, sans-serif' }}>Location</label>
              <input id="s-location" className="d-control" value={formData.location} onChange={(e) => update('location', e.target.value)} style={{ fontFamily: 'system-ui, sans-serif' }} />
            </div>
          </div>
          <div className={css('_flex _col _gap2')} style={{ marginTop: '1rem' }}>
            <label className={css('_textsm _fontmedium')} htmlFor="s-bio" style={{ fontFamily: 'system-ui, sans-serif' }}>Bio</label>
            <textarea
              id="s-bio"
              className="d-control"
              rows={4}
              style={{ minHeight: '6rem', resize: 'vertical', fontFamily: 'system-ui, sans-serif' }}
              value={formData.bio}
              onChange={(e) => update('bio', e.target.value)}
            />
          </div>
        </div>

        {/* Notifications section */}
        <div className="editorial-card" style={{ borderRadius: 'var(--d-radius-lg)' }}>
          <h2 className={css('_fontmedium')} style={{ fontSize: '1rem', marginBottom: '0.25rem', fontFamily: 'system-ui, sans-serif' }}>Notifications</h2>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
            Control what you receive.
          </p>
          <div className={css('_flex _col _gap4')}>
            {[
              { key: 'publicProfile', label: 'Public Profile', desc: 'Allow readers to view your author page' },
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email when someone comments on your articles' },
              { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Get a summary of your article performance every Monday' },
            ].map((toggle) => (
              <div key={toggle.key} className={css('_flex _aic _jcsb')}>
                <div>
                  <p className={css('_textsm _fontmedium')} style={{ fontFamily: 'system-ui, sans-serif' }}>{toggle.label}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>{toggle.desc}</p>
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
                      background: formData[toggle.key as keyof typeof formData] ? '#fff' : 'var(--d-text-muted)',
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
          <button type="submit" className="d-interactive" data-variant="primary" style={{ fontFamily: 'system-ui, sans-serif' }}>
            <Save size={16} />
            Save Changes
          </button>
          <button type="button" className="d-interactive" data-variant="ghost" style={{ fontFamily: 'system-ui, sans-serif' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
