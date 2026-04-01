import { css } from '@decantr/css';

export function CookiesPage() {
  return (
    <section className={css('_py16 _px6')} style={{ background: 'var(--d-bg)' }}>
      <article className={css('_flex _col _gap8')} style={{ maxWidth: 720, margin: '0 auto' }}>
        <div>
          <h1 className={css('_heading1 _fgtext')} style={{ marginBottom: 'var(--d-gap-3)' }}>Cookie Policy</h1>
          <p className={css('_textsm _fgmuted')}>Last updated: March 15, 2026</p>
        </div>

        <section className={css('_flex _col _gap3')}>
          <h2 className={css('_heading3 _fgtext')}>What Are Cookies</h2>
          <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.8 }}>
            Cookies are small text files stored on your device when you visit a website. They help us
            provide essential functionality, remember your preferences, and understand how you use our service.
          </p>
        </section>

        <section className={css('_flex _col _gap3')}>
          <h2 className={css('_heading3 _fgtext')}>Essential Cookies</h2>
          <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.8 }}>
            These cookies are necessary for the platform to function. They handle authentication sessions,
            security tokens, and basic preferences like language. You cannot disable these cookies.
          </p>
          <div className={css('_p4 _rounded') + ' carbon-code'} style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
            session_id &mdash; Authentication session (expires on logout)<br />
            csrf_token &mdash; Security token (per session)<br />
            locale &mdash; Language preference (1 year)
          </div>
        </section>

        <section className={css('_flex _col _gap3')}>
          <h2 className={css('_heading3 _fgtext')}>Analytics Cookies</h2>
          <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.8 }}>
            We use privacy-focused analytics (no third-party trackers) to understand usage patterns and
            improve our product. These cookies are anonymized and do not track individual users across websites.
          </p>
        </section>

        <section className={css('_flex _col _gap3')}>
          <h2 className={css('_heading3 _fgtext')}>Managing Cookies</h2>
          <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.8 }}>
            You can control cookies through your browser settings. Note that disabling essential cookies
            may prevent you from using parts of our service. For more details, visit your browser&apos;s help documentation.
          </p>
        </section>
      </article>
    </section>
  );
}
