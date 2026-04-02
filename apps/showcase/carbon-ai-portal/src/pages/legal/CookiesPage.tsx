import { css } from '@decantr/css';
import { TopNavFooterShell } from '@/layouts/TopNavFooterShell';

export function CookiesPage() {
  return (
    <TopNavFooterShell>
      <section className={css('_py16 _px4')}>
        <div className={css('_flex _col _gap8') + ' container-sm'}>
          <div className={css('_flex _col _gap2')}>
            <h1 className={css('_text3xl _fontsemi _fgtext')}>Cookie Policy</h1>
            <p className={css('_textsm _fgmuted')}>Last updated: March 15, 2026</p>
          </div>

          <div className="prose">
            <h2>1. What Are Cookies</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help us provide a better experience by remembering your preferences and understanding how you use our service.
            </p>

            <h2>2. How We Use Cookies</h2>
            <p>We use the following types of cookies:</p>

            <h3>Essential Cookies</h3>
            <p>
              Required for the service to function. These include authentication tokens and session identifiers. You cannot opt out of essential cookies.
            </p>

            <h3>Analytics Cookies</h3>
            <p>
              Help us understand how visitors interact with our service. We use this data to improve performance and user experience. These cookies do not identify you personally.
            </p>

            <h3>Preference Cookies</h3>
            <p>
              Remember your settings and preferences, such as theme choice, language, and notification settings.
            </p>

            <h2>3. Managing Cookies</h2>
            <p>
              You can control cookies through your browser settings. Note that disabling certain cookies may affect the functionality of our service.
            </p>

            <h2>4. Third-Party Cookies</h2>
            <p>
              We use minimal third-party services that may set cookies. These include our analytics provider and payment processor. Each third party has their own cookie policy.
            </p>

            <h2>5. Updates</h2>
            <p>
              We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated revision date.
            </p>

            <h2>6. Contact</h2>
            <p>
              For questions about our cookie practices, contact us at <strong>privacy@carbonai.dev</strong>.
            </p>
          </div>
        </div>
      </section>
    </TopNavFooterShell>
  );
}
