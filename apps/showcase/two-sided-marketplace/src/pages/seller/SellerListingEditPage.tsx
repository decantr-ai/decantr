import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getListing } from '@/data/mock';

export function SellerListingEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const listing = id ? getListing(id) : undefined;
  if (!listing) {
    return (
      <div style={{ padding: '2rem' }}>
        <Link to="/seller/listings" className="nm-button-primary">Back to listings</Link>
      </div>
    );
  }
  return (
    <div style={{ maxWidth: 820 }}>
      <Link to="/seller/listings" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8rem', border: 'none', padding: '0.375rem 0', marginBottom: '0.75rem' }}>
        <ArrowLeft size={14} /> Back to listings
      </Link>
      <header style={{ marginBottom: '1.5rem' }}>
        <div className="d-label" style={{ marginBottom: '0.5rem' }}>Edit listing</div>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 600 }}>{listing.title}</h1>
      </header>

      <form onSubmit={e => { e.preventDefault(); navigate('/seller/listings'); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Section title="Basics">
          <Field label="Title"><input className="nm-input" defaultValue={listing.title} /></Field>
          <Field label="Location"><input className="nm-input" defaultValue={listing.location} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Category">
              <select className="nm-input" defaultValue={listing.category}>
                <option value="cabins">Cabins</option>
                <option value="lofts">Lofts</option>
                <option value="beach">Beach</option>
                <option value="studios">Studios</option>
                <option value="unique">Unique</option>
              </select>
            </Field>
            <Field label="Price / night">
              <input className="nm-input" type="number" defaultValue={listing.price} />
            </Field>
          </div>
        </Section>

        <Section title="Description">
          <Field label="About the space">
            <textarea className="nm-input" defaultValue={listing.description} rows={5} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
          </Field>
        </Section>

        <Section title="Photos">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.625rem' }}>
            {listing.images.map((img, i) => (
              <div key={i} style={{ aspectRatio: '4/3', borderRadius: 'var(--d-radius)', overflow: 'hidden', background: 'var(--d-surface-raised)' }}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
            <button type="button" className="d-interactive" style={{ aspectRatio: '4/3', borderStyle: 'dashed', fontSize: '0.8rem' }}>
              + Add photo
            </button>
          </div>
        </Section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <Link to="/seller/listings" className="d-interactive" data-variant="ghost">Cancel</Link>
          <button type="submit" className="nm-button-primary">Save changes</button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="nm-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--d-border)' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{title}</h2>
      </div>
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--d-text-muted)' }}>{label}</span>
      {children}
    </label>
  );
}
