import { css } from '@decantr/css';

export function TermsPage() {
  return (
    <section className={css('_py16 _px6')} style={{ background: 'var(--d-bg)' }}>
      <article className={css('_flex _col _gap8')} style={{ maxWidth: 720, margin: '0 auto' }}>
        <div>
          <h1 className={css('_heading1 _fgtext')} style={{ marginBottom: 'var(--d-gap-3)' }}>Terms of Service</h1>
          <p className={css('_textsm _fgmuted')}>Last updated: March 15, 2026</p>
        </div>

        <section className={css('_flex _col _gap3')}>
          <h2 className={css('_heading3 _fgtext')}>1. Acceptance of Terms</h2>
          <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.8 }}>
            By accessing or using Carbon AI, you agree to be bound by these Terms of Service. If you do not agree
            to these terms, do not use our services. We may update these terms from time to time, and continued
            use constitutes acceptance.
          </p>
        </section>

        <section className={css('_flex _col _gap3')}>
          <h2 className={css('_heading3 _fgtext')}>2. Account Registration</h2>
          <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.8 }}>
            You must provide accurate information when creating an account. You are responsible for maintaining
            the security of your account credentials. Notify us immediately of any unauthorized access.
          </p>
        </section>

        <section className={css('_flex _col _gap3')}>
          <h2 className={css('_heading3 _fgtext')}>3. Acceptable Use</h2>
          <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.8 }}>
            You agree not to use Carbon AI to generate malicious code, circumvent security measures,
            or violate any applicable laws. We reserve the right to suspend accounts that violate
            these guidelines.
          </p>
        </section>

        <section className={css('_flex _col _gap3')}>
          <h2 className={css('_heading3 _fgtext')}>4. Intellectual Property</h2>
          <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.8 }}>
            You retain all rights to the code and content you create using Carbon AI. We claim no ownership
            over your input or the generated output. Our platform, branding, and documentation remain
            our intellectual property.
          </p>
        </section>

        <section className={css('_flex _col _gap3')}>
          <h2 className={css('_heading3 _fgtext')}>5. Limitation of Liability</h2>
          <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.8 }}>
            Carbon AI is provided &ldquo;as is&rdquo; without warranty of any kind. We are not liable for
            any damages arising from the use of AI-generated code in production environments. Always review
            generated code before deployment.
          </p>
        </section>

        <section className={css('_flex _col _gap3')}>
          <h2 className={css('_heading3 _fgtext')}>6. Contact</h2>
          <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.8 }}>
            Questions about these terms? Contact us at legal@carbonai.dev.
          </p>
        </section>
      </article>
    </section>
  );
}
