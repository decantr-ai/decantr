import { useState } from 'react';
import { Mail, Phone, MapPin, Paperclip } from 'lucide-react';

export function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div>
      <section className="pm-hero-bg" style={{ padding: '4rem 1.5rem 3rem' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div className="d-label" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>Contact</div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--d-primary)', marginBottom: '0.75rem' }}>
            Tell us about your portfolio
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--d-text-muted)' }}>
            We respond within one business day. Usually much faster.
          </p>
        </div>
      </section>

      <section style={{ padding: '3rem 1.5rem 5rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--d-primary)', marginBottom: '0.5rem' }}>Get in touch</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
                Whether you're managing 10 units or 1,000, we'll walk you through a setup tailored to your workflow.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                <Mail size={16} style={{ color: 'var(--d-accent)' }} />
                hello@cornerstone-properties.com
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                <Phone size={16} style={{ color: 'var(--d-accent)' }} />
                +1 (503) 555-0100
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                <MapPin size={16} style={{ color: 'var(--d-accent)' }} />
                Portland, OR · Remote-first
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="pm-card"
            style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {sent ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--d-success)', marginBottom: '0.5rem' }}>Message sent</div>
                <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Thanks — we'll be in touch within 1 business day.</p>
              </div>
            ) : (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Name</label>
                  <input className="d-control" type="text" placeholder="Your name" defaultValue="Elena Whitfield" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Email</label>
                  <input className="d-control" type="email" placeholder="you@company.com" defaultValue="elena@cornerstone-properties.com" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Portfolio size</label>
                  <select className="d-control" defaultValue="50-200">
                    <option>1-10 units</option>
                    <option>10-50 units</option>
                    <option>50-200 units</option>
                    <option>200+ units</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Message</label>
                  <textarea className="d-control" rows={4} placeholder="What are you looking for?" defaultValue="Looking to move 40 units from spreadsheets to a proper platform." required style={{ resize: 'vertical' }} />
                </div>
                <div>
                  <button type="button" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
                    <Paperclip size={14} /> Attach file
                  </button>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                  Protected by hCaptcha. Read our <a href="#/privacy" style={{ color: 'var(--d-accent)' }}>privacy policy</a>.
                </div>
                <button type="submit" className="pm-button-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}>
                  Send message
                </button>
              </>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
