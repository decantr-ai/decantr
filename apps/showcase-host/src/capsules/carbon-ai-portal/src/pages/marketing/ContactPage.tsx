import { useState } from 'react';
import { Mail, MessageSquare, Check } from 'lucide-react';

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const errs: Record<string, string> = {};
    if (!form.get('name')) errs.name = 'Please enter your name.';
    const email = form.get('email') as string;
    if (!email) errs.email = 'Please enter your email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'That does not look like a valid email.';
    if (!form.get('message')) errs.message = 'Please include a message.';
    setErrors(errs);
    if (Object.keys(errs).length === 0) setSubmitted(true);
  };

  return (
    <>
      <section style={{ padding: '5rem 1.5rem 3rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p className="d-label" style={{ marginBottom: '0.75rem' }}>Contact</p>
          <h1 style={{ fontSize: 'clamp(1.875rem, 4vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
            Let's talk.
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
            Questions, feedback, or just want to say hi? We read everything.
          </p>
        </div>
      </section>

      <section style={{ padding: '0 1.5rem 5rem' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            <div className="carbon-card" style={{ padding: '1rem 1.125rem', background: 'var(--d-surface)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Mail size={16} style={{ color: 'var(--d-accent)' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>General</div>
                <div className="mono-data" style={{ fontSize: '0.8125rem' }}>hello@carbonlabs.ai</div>
              </div>
            </div>
            <div className="carbon-card" style={{ padding: '1rem 1.125rem', background: 'var(--d-surface)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MessageSquare size={16} style={{ color: 'var(--d-accent)' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Support</div>
                <div className="mono-data" style={{ fontSize: '0.8125rem' }}>support@carbonlabs.ai</div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="carbon-card"
            style={{ padding: '1.5rem', background: 'var(--d-surface)', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
          >
            {submitted ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem 1rem', gap: '0.75rem' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'color-mix(in srgb, var(--d-success) 18%, transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={20} style={{ color: 'var(--d-success)' }} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Thanks for reaching out.</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
                  We will get back to you within one business day.
                </p>
              </div>
            ) : (
              <>
                <FormField id="name" label="Name" error={errors.name} />
                <FormField id="email" label="Email" type="email" error={errors.email} />
                <FormField id="company" label="Company" optional />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label htmlFor="message" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="carbon-input"
                    style={{ fontSize: '0.875rem', resize: 'vertical', minHeight: 100, fontFamily: 'inherit' }}
                    aria-invalid={errors.message ? 'true' : undefined}
                  />
                  {errors.message && <span style={{ fontSize: '0.75rem', color: 'var(--d-error)' }}>{errors.message}</span>}
                </div>
                {/* Honeypot spam protection */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px' }} />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="d-interactive" data-variant="primary" style={{ fontSize: '0.875rem' }}>
                    Send message
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </section>
    </>
  );
}

function FormField({
  id,
  label,
  type = 'text',
  error,
  optional,
}: {
  id: string;
  label: string;
  type?: string;
  error?: string;
  optional?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <label htmlFor={id} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
        {label}
        {optional && <span style={{ color: 'var(--d-text-muted)', fontWeight: 400, marginLeft: 4 }}>(optional)</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        className="carbon-input"
        style={{ fontSize: '0.875rem' }}
        aria-invalid={error ? 'true' : undefined}
      />
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--d-error)' }}>{error}</span>}
    </div>
  );
}
