import { css } from '@decantr/css';
import { TopNavFooterShell } from '@/layouts/TopNavFooterShell';

export function PrivacyPage() {
  return (
    <TopNavFooterShell>
      <section className={css('_py16 _px4')}>
        <div className={css('_flex _col _gap8') + ' container-sm'}>
          <div className={css('_flex _col _gap2')}>
            <h1 className={css('_text3xl _fontsemi _fgtext')}>Privacy Policy</h1>
            <p className={css('_textsm _fgmuted')}>Last updated: March 15, 2026</p>
          </div>

          <div className="prose">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly, including your name, email address, and account credentials when you create an account. We also collect conversation data when you use our AI chat service.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze trends, usage, and activities</li>
            </ul>

            <h2>3. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide you services. You can request deletion of your data at any time through your account settings.
            </p>

            <h2>4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage. All data is encrypted in transit and at rest.
            </p>

            <h2>5. Third-Party Services</h2>
            <p>
              We may share information with third-party service providers that perform services on our behalf, such as payment processing, data analysis, email delivery, hosting, and customer service. These providers are contractually obligated to protect your information.
            </p>

            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>

            <h2>7. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at <strong>privacy@carbonai.dev</strong>.
            </p>
          </div>
        </div>
      </section>
    </TopNavFooterShell>
  );
}
