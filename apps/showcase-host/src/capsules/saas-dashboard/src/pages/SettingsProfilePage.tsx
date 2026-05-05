import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { SettingsNav } from '@/components/SettingsNav';

export function SettingsProfilePage() {
  const [name, setName] = useState('Sarah Chen');
  const [email, setEmail] = useState('sarah@northwind.io');
  const [title, setTitle] = useState('Head of Product');
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [bio, setBio] = useState('Shipping Northwind since the beginning. Previously at Luna Labs.');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '42rem' }}>
      <PageHeader title="Settings" description="Manage your profile, security, and workspace." />
      <SettingsNav />

      <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Profile</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>This is how others on your team see you.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--d-border)' }}>
            <div className="sd-avatar" style={{ width: 56, height: 56, fontSize: '1rem' }}>SC</div>
            <div>
              <button type="button" className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>Change photo</button>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginTop: '0.375rem' }}>JPG, PNG or GIF. Max 2MB.</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Full name</label>
              <input className="d-control" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Email</label>
              <input className="d-control" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Job title</label>
              <input className="d-control" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Timezone</label>
              <select className="d-control" value={timezone} onChange={e => setTimezone(e.target.value)}>
                <option value="America/Los_Angeles">Pacific (PT)</option>
                <option value="America/Denver">Mountain (MT)</option>
                <option value="America/Chicago">Central (CT)</option>
                <option value="America/New_York">Eastern (ET)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Berlin">Berlin (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Bio</label>
            <textarea className="d-control" value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="sd-button-accent" type="submit" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Save changes</button>
          <button className="d-interactive" data-variant="ghost" type="button" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
