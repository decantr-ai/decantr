import { FormEvent, useState } from 'react';
import { css } from '@decantr/css';
import { Paperclip, Mail } from 'lucide-react';

export function ContactPage() {
  const [sent, setSent] = useState(false);
  function onSubmit(e: FormEvent) { e.preventDefault(); setSent(true); }

  return (
    <div className="entrance-fade" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <section className="studio-hero-gradient" style={{ padding: '4rem 1.5rem 3rem' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <Mail size={32} style={{ color: 'var(--d-primary)', margin: '0 auto 1rem' }} />
          <h1 className="serif-display" style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Get in touch</h1>
          <p style={{ color: 'var(--d-text-muted)' }}>We read everything. Usually reply within a day.</p>
        </div>
      </section>

      <section style={{ padding: '2.5rem 1.5rem 5rem' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          {sent ? (
            <div className="studio-surface" style={{ padding: '2rem', textAlign: 'center' }}>
              <h2 className="serif-display" style={{ fontSize: '1.375rem', marginBottom: '0.5rem' }}>Message sent</h2>
              <p style={{ color: 'var(--d-text-muted)', fontSize: '0.9375rem' }}>We'll be in touch soon. Thanks for reaching out.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="studio-surface" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label className={css('_flex _col _gap1')}>
                <span className={css('_textsm _fontmedium')}>Your name</span>
                <input className="studio-input" type="text" required />
              </label>
              <label className={css('_flex _col _gap1')}>
                <span className={css('_textsm _fontmedium')}>Email</span>
                <input className="studio-input" type="email" required />
              </label>
              <label className={css('_flex _col _gap1')}>
                <span className={css('_textsm _fontmedium')}>Topic</span>
                <select className="studio-input" required defaultValue="">
                  <option value="" disabled>Choose one</option>
                  <option>Sales</option>
                  <option>Support</option>
                  <option>Press</option>
                </select>
              </label>
              <label className={css('_flex _col _gap1')}>
                <span className={css('_textsm _fontmedium')}>Message</span>
                <textarea className="studio-input" rows={5} required />
              </label>
              <label className={css('_flex _aic _gap2') + ' d-interactive'} data-variant="ghost"
                style={{ cursor: 'pointer', fontSize: '0.8125rem', padding: '0.5rem 0.75rem', width: 'fit-content', border: '1px dashed var(--d-border)' }}>
                <Paperclip size={14} /> Attach file (optional)
                <input type="file" style={{ display: 'none' }} />
              </label>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: -9999 }} />
              <button type="submit" className="d-interactive studio-glow" data-variant="primary"
                style={{ justifyContent: 'center', padding: '0.625rem 1rem' }}>Send message</button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
