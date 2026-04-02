import { css } from '@decantr/css';

export function TermsPage() {
  return (
    <section className="section-gap-sm">
      <div className="container container-md">
        <h1 className={css('_heading1 _mb2')}>Terms of Service</h1>
        <p className={css('_textsm _fgmuted _mb8')}>Last updated: January 1, 2026</p>

        <div className="prose">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Carbon AI, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Carbon AI provides an AI-powered conversational assistant platform. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.
          </p>

          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any systems</li>
            <li>Interfere with or disrupt the integrity of the service</li>
            <li>Upload or transmit viruses or malicious code</li>
            <li>Resell or redistribute the service without authorization</li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <p>
            The service and its original content, features, and functionality are owned by Carbon AI and are protected by international copyright, trademark, and other intellectual property laws.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            Carbon AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
          </p>

          <h2>7. Contact</h2>
          <p>
            Questions about the Terms of Service should be sent to <a href="mailto:legal@carbonai.dev">legal@carbonai.dev</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
