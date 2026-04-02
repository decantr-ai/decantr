import { css } from '@decantr/css';
import { FileText } from 'lucide-react';

const sections = [
  { id: 'collection', title: 'Information We Collect' },
  { id: 'usage', title: 'How We Use Your Information' },
  { id: 'sharing', title: 'Information Sharing' },
  { id: 'security', title: 'Data Security' },
  { id: 'retention', title: 'Data Retention' },
  { id: 'rights', title: 'Your Rights' },
  { id: 'changes', title: 'Changes to This Policy' },
  { id: 'contact', title: 'Contact Us' },
];

export function PrivacyPage() {
  return (
    <div className={css('_px4 _py12')}>
      <div
        className={css('_flex _gap8')}
        style={{ maxWidth: '1000px', margin: '0 auto' }}
      >
        {/* TOC sidebar */}
        <aside
          className={css('_none _lg:flex _col _gap2 _shrink0 _sticky')}
          style={{ width: '220px', top: '80px', alignSelf: 'flex-start' }}
        >
          <span className={css('_textxs _fontsemi _fgmuted _uppercase _mb2')}>
            On this page
          </span>
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={'toc-link'}>
              {s.title}
            </a>
          ))}
        </aside>

        {/* Content */}
        <article className={css('_flex1') + ' legal-content'}>
          <div className={css('_flex _aic _gap3 _mb6')}>
            <FileText size={24} style={{ color: 'var(--d-primary)' }} />
            <h1 className={css('_heading2 _fgtext')}>Privacy Policy</h1>
          </div>
          <p>
            Last updated: March 15, 2026. This Privacy Policy describes how Carbon AI
            (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and shares your personal information
            when you use our services.
          </p>

          <h2 id="collection">Information We Collect</h2>
          <p>We collect information you provide directly, including:</p>
          <ul>
            <li>Account information (name, email address, password)</li>
            <li>Conversation data (messages you send and receive)</li>
            <li>Files you upload for analysis</li>
            <li>Payment information (processed by our payment provider)</li>
            <li>Usage data (features used, session duration, preferences)</li>
          </ul>

          <h2 id="usage">How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related notices</li>
            <li>Send technical notices, updates, and security alerts</li>
            <li>Respond to support requests and inquiries</li>
            <li>Monitor and analyze usage trends to improve user experience</li>
          </ul>
          <p>
            We do not use your conversation data to train our models. Your conversations
            remain private and are only accessible to you and your authorized team members.
          </p>

          <h2 id="sharing">Information Sharing</h2>
          <p>
            We do not sell your personal information. We may share your information only
            in the following circumstances:
          </p>
          <ul>
            <li>With service providers who assist in operating our platform</li>
            <li>When required by law or to respond to legal process</li>
            <li>To protect the rights and safety of our users</li>
            <li>In connection with a merger or acquisition (with notice)</li>
          </ul>

          <h2 id="security">Data Security</h2>
          <p>
            We implement industry-standard security measures including end-to-end encryption,
            regular security audits, and strict access controls. All data is encrypted at rest
            and in transit using AES-256 and TLS 1.3 respectively.
          </p>

          <h2 id="retention">Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. When you delete your
            account, we permanently remove all associated data within 30 days. Backup copies
            are purged within 90 days.
          </p>

          <h2 id="rights">Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data in a portable format</li>
            <li>Object to certain processing of your data</li>
          </ul>

          <h2 id="changes">Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. We will notify you of significant
            changes via email or a prominent notice on our website at least 30 days before
            the changes take effect.
          </p>

          <h2 id="contact">Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at
            privacy@carbonai.dev or write to: Carbon AI, 123 Market Street, Suite 400,
            San Francisco, CA 94105.
          </p>
        </article>
      </div>
    </div>
  );
}
