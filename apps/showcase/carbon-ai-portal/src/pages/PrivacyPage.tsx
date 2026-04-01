import { css } from '@decantr/css';

export function PrivacyPage() {
  return (
    <section className={css('_py16 _px6')} style={{ background: 'var(--d-bg)' }}>
      <div className={css('_flex _gap12')} style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* TOC sidebar */}
        <nav
          className={css('_none _lg:flex _col _gap2 _shrink0 _sticky')}
          style={{ top: 100, width: 200, alignSelf: 'flex-start', display: undefined }}
        >
          <span className={css('_textxs _fgmuted _fontmedium _uppercase')} style={{ marginBottom: 'var(--d-gap-2)' }}>
            On this page
          </span>
          {['Overview', 'Data Collection', 'Data Use', 'Data Sharing', 'Security', 'Your Rights', 'Contact'].map((s) => (
            <a
              key={s}
              href={`#${s.toLowerCase().replace(/\s+/g, '-')}`}
              className={css('_textsm _fgmuted')}
              style={{ textDecoration: 'none' }}
            >
              {s}
            </a>
          ))}
        </nav>

        {/* Content */}
        <article className={css('_flex _col _gap8 _flex1')}>
          <div>
            <h1 className={css('_heading1 _fgtext')} style={{ marginBottom: 'var(--d-gap-3)' }}>Privacy Policy</h1>
            <p className={css('_textsm _fgmuted')}>Last updated: March 15, 2026</p>
          </div>

          <section id="overview" className={css('_flex _col _gap3')}>
            <h2 className={css('_heading3 _fgtext')}>Overview</h2>
            <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.8 }}>
              Carbon AI, Inc. (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting your privacy.
              This policy describes how we collect, use, and share information when you use our services.
            </p>
          </section>

          <section id="data-collection" className={css('_flex _col _gap3')}>
            <h2 className={css('_heading3 _fgtext')}>Data Collection</h2>
            <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.8 }}>
              We collect information you provide directly: account details (name, email), conversation content,
              and usage data. We also collect technical data such as IP address, browser type, and device information
              through standard web technologies.
            </p>
          </section>

          <section id="data-use" className={css('_flex _col _gap3')}>
            <h2 className={css('_heading3 _fgtext')}>Data Use</h2>
            <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.8 }}>
              We use your data to provide and improve our services, communicate with you about your account,
              and ensure the security of our platform. We do not use your conversation content to train our AI models.
            </p>
          </section>

          <section id="data-sharing" className={css('_flex _col _gap3')}>
            <h2 className={css('_heading3 _fgtext')}>Data Sharing</h2>
            <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.8 }}>
              We do not sell your personal data. We share data only with service providers who help us operate
              our platform, and only when required by law. All third-party providers are bound by data processing agreements.
            </p>
          </section>

          <section id="security" className={css('_flex _col _gap3')}>
            <h2 className={css('_heading3 _fgtext')}>Security</h2>
            <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.8 }}>
              We employ industry-standard security measures including encryption at rest and in transit,
              regular security audits, and access controls. All conversations are encrypted end-to-end.
            </p>
          </section>

          <section id="your-rights" className={css('_flex _col _gap3')}>
            <h2 className={css('_heading3 _fgtext')}>Your Rights</h2>
            <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.8 }}>
              You have the right to access, correct, or delete your personal data at any time through your account
              settings. You may also request a full data export or account deletion by contacting our support team.
            </p>
          </section>

          <section id="contact" className={css('_flex _col _gap3')}>
            <h2 className={css('_heading3 _fgtext')}>Contact</h2>
            <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.8 }}>
              For privacy-related inquiries, contact us at privacy@carbonai.dev or write to Carbon AI, Inc.,
              548 Market St, Suite 36000, San Francisco, CA 94104.
            </p>
          </section>
        </article>
      </div>
    </section>
  );
}
