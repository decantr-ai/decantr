import { css } from '@decantr/css';

/* ---------- Hero ---------- */
function Hero() {
  return (
    <section
      className={css('_flex _col _aic _textc _py24 _px6') + ' carbon-fade-slide'}
      style={{ background: 'var(--d-bg)' }}
    >
      <div style={{ maxWidth: 600 }}>
        <h1 className={css('_heading1 _fgtext')} style={{ marginBottom: 'var(--d-gap-4)' }}>
          Contact Us
        </h1>
        <p className={css('_textlg _fgmuted')} style={{ lineHeight: 1.7 }}>
          Have a question, partnership inquiry, or just want to say hello? We would love to hear from you.
        </p>
      </div>
    </section>
  );
}

/* ---------- Form ---------- */
function ContactForm() {
  return (
    <section className={css('_py24 _px6')} style={{ background: 'var(--d-surface)' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <form
          className={css('_flex _col _gap6') + ' carbon-card'}
          style={{ padding: 'var(--d-gap-8)' }}
          onSubmit={(e) => e.preventDefault()}
        >
          <div className={css('_flex _col _gap2')}>
            <label className={css('_textsm _fontmedium _fgtext')} htmlFor="contact-name">Name</label>
            <input
              id="contact-name"
              type="text"
              placeholder="Your name"
              className={css('_px4 _py3 _rounded _textsm _fgtext') + ' carbon-input'}
              style={{ background: 'var(--d-bg)', outline: 'none' }}
            />
          </div>
          <div className={css('_flex _col _gap2')}>
            <label className={css('_textsm _fontmedium _fgtext')} htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              type="email"
              placeholder="you@company.com"
              className={css('_px4 _py3 _rounded _textsm _fgtext') + ' carbon-input'}
              style={{ background: 'var(--d-bg)', outline: 'none' }}
            />
          </div>
          <div className={css('_flex _col _gap2')}>
            <label className={css('_textsm _fontmedium _fgtext')} htmlFor="contact-subject">Subject</label>
            <input
              id="contact-subject"
              type="text"
              placeholder="What is this about?"
              className={css('_px4 _py3 _rounded _textsm _fgtext') + ' carbon-input'}
              style={{ background: 'var(--d-bg)', outline: 'none' }}
            />
          </div>
          <div className={css('_flex _col _gap2')}>
            <label className={css('_textsm _fontmedium _fgtext')} htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              rows={5}
              placeholder="Tell us more..."
              className={css('_px4 _py3 _rounded _textsm _fgtext') + ' carbon-input'}
              style={{ background: 'var(--d-bg)', outline: 'none', resize: 'vertical' }}
            />
          </div>
          <button
            type="submit"
            className={css('_bgprimary _fgtext _fontsemi _py3 _rounded _textbase _pointer')}
            style={{ border: 'none' }}
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}

/* ---------- Page ---------- */
export function ContactPage() {
  return (
    <>
      <Hero />
      <ContactForm />
    </>
  );
}
