import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { MapPin } from 'lucide-react';

export function NewRequestPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate('/requests');
  }

  return (
    <div className={css('_flex _col _gap6')} style={{ maxWidth: 640 }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>New Service Request</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Report an issue or request a city service</p>
      </div>

      <form onSubmit={handleSubmit} className="gov-form">
        <div className="d-surface gov-card" style={{ padding: '1.5rem' }}>
          <div className={css('_flex _col _gap4')}>
            <div className={css('_flex _col _gap1')}>
              <label htmlFor="title" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                Title <span style={{ color: 'var(--d-error)' }}>*</span>
              </label>
              <input id="title" type="text" className="d-control gov-input" placeholder="Brief description of the issue" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            <div className={css('_flex _col _gap1')}>
              <label htmlFor="category" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                Category <span style={{ color: 'var(--d-error)' }}>*</span>
              </label>
              <select id="category" className="d-control gov-input" value={category} onChange={e => setCategory(e.target.value)} required style={{ appearance: 'none' }}>
                <option value="">Select a category</option>
                <option value="Roads">Roads</option>
                <option value="Lighting">Lighting</option>
                <option value="Parks">Parks</option>
                <option value="Water">Water</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Vandalism">Vandalism</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className={css('_flex _col _gap1')}>
              <label htmlFor="description" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                Description <span style={{ color: 'var(--d-error)' }}>*</span>
              </label>
              <textarea id="description" className="d-control gov-input" placeholder="Provide detailed information about the issue..." rows={4} value={description} onChange={e => setDescription(e.target.value)} required style={{ minHeight: '6rem' }} />
            </div>

            <div className={css('_flex _col _gap1')}>
              <label htmlFor="location" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                Location <span style={{ color: 'var(--d-error)' }}>*</span>
              </label>
              <div className={css('_flex _gap2')}>
                <input id="location" type="text" className="d-control gov-input" placeholder="Address or intersection" value={location} onChange={e => setLocation(e.target.value)} required style={{ flex: 1 }} />
                <button type="button" className="d-interactive" data-variant="ghost" aria-label="Pick location on map" style={{ flexShrink: 0 }}>
                  <MapPin size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Location Picker placeholder */}
        <div className="d-surface gov-card" style={{ padding: 0, overflow: 'hidden', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--d-surface-raised)' }}>
          <div className={css('_flex _col _aic _gap2')} style={{ color: 'var(--d-text-muted)' }}>
            <MapPin size={32} style={{ opacity: 0.5 }} />
            <span style={{ fontSize: '0.875rem' }}>Click to pin location on map</span>
          </div>
        </div>

        <div className={css('_flex _jcfe _gap3')} style={{ marginTop: '1rem' }}>
          <button type="button" className="d-interactive" data-variant="ghost" onClick={() => navigate('/requests')}>
            Cancel
          </button>
          <button type="submit" className="d-interactive" data-variant="primary">
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}
