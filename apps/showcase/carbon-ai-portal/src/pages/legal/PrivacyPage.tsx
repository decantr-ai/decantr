import { css } from '@decantr/css';

export function PrivacyPage() {
  return (
    <section className="section-gap-sm">
      <div className="container container-md">
        <h1 className={css('_heading1 _mb2')}>Privacy Policy</h1>
        <p className={css('_textsm _fgmuted _mb8')}>Last updated: January 1, 2026</p>

        <div className="prose">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly, such as when you create an account, use our services, or contact us. This includes your name, email address, and conversation data.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to protect Carbon AI and our users.
          </p>
          <ul>
            <li>Provide and deliver the services you request</li>
            <li>Send technical notices, updates, and support messages</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Monitor and analyze trends, usage, and activities</li>
          </ul>

          <h2>3. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed to provide you services. You can request deletion of your data at any time through your account settings.
          </p>

          <h2>4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2>5. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data. You may also object to or restrict certain processing of your data. To exercise these rights, please contact us.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@carbonai.dev">privacy@carbonai.dev</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
