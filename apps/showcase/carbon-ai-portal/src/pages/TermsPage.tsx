import { css } from '@decantr/css';
import { Scale } from 'lucide-react';

const sections = [
  { id: 'acceptance', title: 'Acceptance of Terms' },
  { id: 'account', title: 'Account Terms' },
  { id: 'acceptable', title: 'Acceptable Use' },
  { id: 'ip', title: 'Intellectual Property' },
  { id: 'payment', title: 'Payment Terms' },
  { id: 'termination', title: 'Termination' },
  { id: 'liability', title: 'Limitation of Liability' },
  { id: 'governing', title: 'Governing Law' },
];

export function TermsPage() {
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
            <Scale size={24} style={{ color: 'var(--d-primary)' }} />
            <h1 className={css('_heading2 _fgtext')}>Terms of Service</h1>
          </div>
          <p>
            Last updated: March 15, 2026. These Terms of Service (&quot;Terms&quot;) govern your
            access to and use of Carbon AI&apos;s products and services.
          </p>

          <h2 id="acceptance">Acceptance of Terms</h2>
          <p>
            By accessing or using Carbon AI, you agree to be bound by these Terms. If you
            are using the service on behalf of an organization, you represent that you have
            the authority to bind that organization to these Terms.
          </p>

          <h2 id="account">Account Terms</h2>
          <ul>
            <li>You must provide accurate and complete registration information</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You must be at least 18 years old to use the service</li>
            <li>One person or organization per account unless authorized for team use</li>
            <li>You are responsible for all activity that occurs under your account</li>
          </ul>

          <h2 id="acceptable">Acceptable Use</h2>
          <p>You agree not to use Carbon AI to:</p>
          <ul>
            <li>Generate content that is illegal, harmful, or violates third-party rights</li>
            <li>Attempt to reverse-engineer, decompile, or extract model weights</li>
            <li>Circumvent rate limits or access restrictions</li>
            <li>Impersonate another person or entity</li>
            <li>Transmit viruses, malware, or other malicious code</li>
          </ul>

          <h2 id="ip">Intellectual Property</h2>
          <p>
            You retain ownership of content you create using Carbon AI. We claim no
            intellectual property rights over the outputs generated from your inputs.
            The Carbon AI service, including its design, features, and underlying technology,
            remains the property of Carbon AI, Inc.
          </p>

          <h2 id="payment">Payment Terms</h2>
          <p>
            Paid plans are billed in advance on a monthly or annual basis. All fees are
            non-refundable except as required by law. We may change pricing with 30 days
            notice. Downgrades take effect at the end of the current billing period.
          </p>

          <h2 id="termination">Termination</h2>
          <p>
            You may terminate your account at any time from the account settings page.
            We reserve the right to suspend or terminate accounts that violate these Terms.
            Upon termination, your data will be handled according to our Privacy Policy.
          </p>

          <h2 id="liability">Limitation of Liability</h2>
          <p>
            Carbon AI is provided &quot;as is&quot; without warranty of any kind. In no event shall
            Carbon AI, Inc. be liable for any indirect, incidental, special, consequential,
            or punitive damages arising out of or related to your use of the service.
          </p>

          <h2 id="governing">Governing Law</h2>
          <p>
            These Terms shall be governed by the laws of the State of California, United
            States, without regard to its conflict of law provisions. Any disputes arising
            from these Terms shall be resolved in the courts of San Francisco County, California.
          </p>
        </article>
      </div>
    </div>
  );
}
