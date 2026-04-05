import { useState } from 'react';
import { Paperclip, Send, Check } from 'lucide-react';

export function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="entrance-fade">
      <section style={{ padding: '4rem 1.5rem 2rem', textAlign: 'center', maxWidth: '40rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 600, marginBottom: '1rem', letterSpacing: '-0.02em' }}>Say hello.</h1>
        <p style={{ fontSize: '1.0625rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
          Questions, feedback, partnerships — we read every message.
        </p>
      </section>

      <section style={{ padding: '1rem 1.5rem 5rem', maxWidth: '36rem', margin: '0 auto' }}>
        <form
          className="paper-card"
          style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
        >
          {sent && (
            <div style={{ padding: '0.75rem 1rem', background: 'color-mix(in srgb, var(--d-success) 12%, transparent)', borderRadius: 'var(--d-radius)', fontSize: '0.875rem', color: 'var(--d-success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Check size={15} /> Thanks — we\'ll reply within one business day.
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Your name</label>
            <input className="paper-input" placeholder="Mira Chen" defaultValue="" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Email</label>
            <input className="paper-input" type="email" placeholder="you@team.com" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>What\'s on your mind?</label>
            <textarea className="paper-input" rows={5} placeholder="Tell us what you\'re working on…" required style={{ fontFamily: 'inherit', resize: 'vertical' }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--d-text-muted)', cursor: 'pointer' }}>
            <Paperclip size={14} />
            <span>Attach a file (optional)</span>
            <input type="file" style={{ display: 'none' }} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
            <input type="checkbox" required /> I\'m not a robot
          </label>
          <button type="submit" className="d-interactive" style={{ justifyContent: 'center', padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'var(--d-primary)', color: '#fff', borderColor: 'var(--d-primary)' }}>
            <Send size={14} /> Send message
          </button>
        </form>
      </section>
    </div>
  );
}
