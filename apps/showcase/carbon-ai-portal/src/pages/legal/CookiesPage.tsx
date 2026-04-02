import { css } from '@decantr/css';

export function CookiesPage() {
  return (
    <section className="section-gap-sm">
      <div className="container container-md">
        <h1 className={css('_heading1 _mb2')}>Cookie Policy</h1>
        <p className={css('_textsm _fgmuted _mb8')}>Last updated: January 1, 2026</p>

        <div className="prose">
          <h2>1. What Are Cookies</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They help us provide you with a better experience by remembering your preferences and understanding how you use our service.
          </p>

          <h2>2. How We Use Cookies</h2>
          <p>We use the following types of cookies:</p>
          <ul>
            <li><strong>Essential cookies:</strong> Required for the service to function properly (authentication, security)</li>
            <li><strong>Preference cookies:</strong> Remember your settings and preferences (theme, language)</li>
            <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with our service</li>
          </ul>

          <h2>3. Third-Party Cookies</h2>
          <p>
            We may use third-party services that set their own cookies. We do not control these cookies and recommend reviewing the privacy policies of those third parties.
          </p>

          <h2>4. Managing Cookies</h2>
          <p>
            Most web browsers allow you to control cookies through their settings. You can choose to block or delete cookies, but this may affect your experience with our service.
          </p>

          <h2>5. Changes to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            If you have questions about our use of cookies, please contact us at <a href="mailto:privacy@carbonai.dev">privacy@carbonai.dev</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
