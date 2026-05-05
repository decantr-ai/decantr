import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';

export function PropertyCreatePage() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 820 }}>
      <PageHeader
        title="Add Property"
        description="Create a new property in your portfolio"
      />
      <form
        onSubmit={(e) => { e.preventDefault(); navigate('/properties'); }}
        className="pm-card"
        style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        <div>
          <SectionLabel style={{ marginBottom: '0.875rem' }}>Basic Information</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Property name</label>
              <input className="d-control" placeholder="The Meridian" defaultValue="Sunrise Terrace" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Type</label>
              <select className="d-control" defaultValue="Multifamily">
                <option>Multifamily</option>
                <option>Single Family</option>
                <option>Commercial</option>
                <option>Condo</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <SectionLabel style={{ marginBottom: '0.875rem' }}>Location</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Street address</label>
              <input className="d-control" placeholder="123 Main Street" defaultValue="2200 NE Fremont St" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>City</label>
                <input className="d-control" defaultValue="Portland" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>State</label>
                <input className="d-control" defaultValue="OR" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>ZIP</label>
                <input className="d-control" defaultValue="97212" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <SectionLabel style={{ marginBottom: '0.875rem' }}>Details</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Units</label>
              <input className="d-control" type="number" defaultValue="12" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Year built</label>
              <input className="d-control" type="number" defaultValue="2019" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Square feet</label>
              <input className="d-control" type="number" defaultValue="14000" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--d-border)' }}>
          <button type="button" onClick={() => navigate('/properties')} className="d-interactive" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Cancel</button>
          <button type="submit" className="pm-button-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Add property</button>
        </div>
      </form>
    </div>
  );
}
