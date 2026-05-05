import { css } from '@decantr/css';
import { Send, MapPin, Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import { bio } from '../data/mock';

export function ContactPage() {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="entrance-fade" style={{ maxWidth: '64rem', margin: '0 auto' }}>
      <section className="d-section">
        <h1
          className="d-gradient-text"
          style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 600, marginBottom: '0.75rem' }}
        >
          Get in Touch
        </h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '1.0625rem', marginBottom: '3rem', maxWidth: '36rem' }}>
          Have a project in mind? I'd love to hear about it. Drop me a message and I'll get back to you within 24 hours.
        </p>

        <div
          className={css('_flex _gap12')}
          style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}
        >
          {/* Contact form */}
          <div style={{ flex: 2, minWidth: '320px' }}>
            {submitted ? (
              <div
                className="d-surface d-glass"
                style={{ textAlign: 'center', padding: '3rem', borderRadius: 'var(--d-radius-lg)' }}
              >
                <div className="d-icon-glow" style={{ width: 56, height: 56, margin: '0 auto 1.5rem', borderRadius: '50%' }}>
                  <Send size={24} style={{ color: 'var(--d-text)' }} />
                </div>
                <h2 className={css('_fontsemi _textlg')} style={{ marginBottom: '0.5rem' }}>Message Sent</h2>
                <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
                  Thanks for reaching out. I'll be in touch soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
                <div className={css('_flex _col _gap2')}>
                  <label className={css('_textsm _fontmedium')} htmlFor="contact-name">Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    className="d-control"
                    placeholder="Your name"
                    value={formState.name}
                    onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                    required
                  />
                </div>
                <div className={css('_flex _col _gap2')}>
                  <label className={css('_textsm _fontmedium')} htmlFor="contact-email">Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    className="d-control"
                    placeholder="you@example.com"
                    value={formState.email}
                    onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                    required
                  />
                </div>
                <div className={css('_flex _col _gap2')}>
                  <label className={css('_textsm _fontmedium')} htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    className="d-control"
                    placeholder="Tell me about your project..."
                    rows={6}
                    style={{ minHeight: '6rem', resize: 'vertical' }}
                    value={formState.message}
                    onChange={(e) => setFormState((s) => ({ ...s, message: e.target.value }))}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="d-interactive"
                  data-variant="primary"
                  style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem', fontSize: '1rem', borderRadius: 'var(--d-radius-lg)' }}
                >
                  <Send size={16} />
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact info sidebar */}
          <div style={{ flex: 1, minWidth: '220px' }}>
            <div className={css('_flex _col _gap6')}>
              <div className={css('_flex _aic _gap3')}>
                <div className="d-icon-glow" style={{ flexShrink: 0 }}>
                  <Mail size={18} style={{ color: 'var(--d-text)' }} />
                </div>
                <div>
                  <p className={css('_textsm _fontmedium')}>Email</p>
                  <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{bio.email}</p>
                </div>
              </div>
              <div className={css('_flex _aic _gap3')}>
                <div className="d-icon-glow" style={{ flexShrink: 0 }}>
                  <MapPin size={18} style={{ color: 'var(--d-text)' }} />
                </div>
                <div>
                  <p className={css('_textsm _fontmedium')}>Location</p>
                  <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{bio.location}</p>
                </div>
              </div>
              <div className={css('_flex _aic _gap3')}>
                <div className="d-icon-glow" style={{ flexShrink: 0 }}>
                  <Phone size={18} style={{ color: 'var(--d-text)' }} />
                </div>
                <div>
                  <p className={css('_textsm _fontmedium')}>Availability</p>
                  <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Open to freelance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
