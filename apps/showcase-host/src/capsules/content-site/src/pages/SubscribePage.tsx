import { css } from '@decantr/css';
import { Mail, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { author } from '../data/mock';

export function SubscribePage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ width: 56, height: 56, borderRadius: 'var(--d-radius-full)', background: 'var(--d-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <Mail size={24} style={{ color: 'var(--d-accent)' }} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Subscribe to The Paragraph
        </h1>
        <p style={{ color: 'var(--d-text-muted)', lineHeight: 1.7, fontSize: '1.0625rem' }}>
          A weekly essay on design, engineering, and typography. Delivered every Friday morning to {author.subscribers.toLocaleString()} readers.
        </p>
      </div>

      <hr className="editorial-divider" />

      {/* Form */}
      {!submitted ? (
        <div className="editorial-card" style={{ borderRadius: 'var(--d-radius)' }}>
          <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
            <div className={css('_flex _col _gap2')}>
              <label className={css('_textsm _fontmedium')} htmlFor="sub-name" style={{ fontFamily: 'system-ui, sans-serif' }}>Name</label>
              <input
                id="sub-name"
                type="text"
                className="d-control"
                placeholder="Your name"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              />
            </div>
            <div className={css('_flex _col _gap2')}>
              <label className={css('_textsm _fontmedium')} htmlFor="sub-email" style={{ fontFamily: 'system-ui, sans-serif' }}>Email</label>
              <input
                id="sub-email"
                type="email"
                className="d-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ fontFamily: 'system-ui, sans-serif' }}
                required
              />
            </div>
            <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
              Subscribe
              <ArrowRight size={16} />
            </button>
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
              No spam. Unsubscribe anytime.
            </p>
          </form>
        </div>
      ) : (
        <div className="editorial-card" style={{ borderRadius: 'var(--d-radius)', textAlign: 'center', padding: '2.5rem var(--d-surface-p)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--d-radius-full)', background: 'color-mix(in srgb, var(--d-success) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Mail size={20} style={{ color: 'var(--d-success)' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>You're subscribed</h2>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
            Check your inbox for a confirmation email. Welcome to The Paragraph.
          </p>
        </div>
      )}
    </>
  );
}
