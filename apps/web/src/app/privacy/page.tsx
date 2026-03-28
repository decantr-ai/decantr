import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Decantr',
  description: 'Decantr Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-16 px-6" style={{ background: 'var(--bg)' }}>
      <article className="max-w-3xl mx-auto">
        <h1
          className="text-4xl font-bold mb-2"
          style={{ color: 'var(--fg)' }}
        >
          Privacy Policy
        </h1>
        <p className="mb-12 text-sm" style={{ color: 'var(--fg-dim)' }}>
          Effective date: March 28, 2026
        </p>

        <div className="space-y-10 text-base leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--fg)' }}>
              1. Information We Collect
            </h2>
            <p className="mb-3">We collect the following types of information:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong style={{ color: 'var(--fg)' }}>Account information</strong> &mdash; Email
                address, name, and profile details provided during registration or through OAuth
                providers (GitHub, Google).
              </li>
              <li>
                <strong style={{ color: 'var(--fg)' }}>Content you publish</strong> &mdash; Patterns,
                themes, recipes, and other design content you submit to the Decantr registry.
              </li>
              <li>
                <strong style={{ color: 'var(--fg)' }}>Usage data</strong> &mdash; Information about
                how you interact with the Service, including API requests, pages visited, features
                used, and timestamps.
              </li>
              <li>
                <strong style={{ color: 'var(--fg)' }}>Billing information</strong> &mdash; Payment
                details are collected and processed by Stripe. Decantr does not store your full
                credit card number.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--fg)' }}>
              2. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To create and manage your account</li>
              <li>To provide, maintain, and improve the Service</li>
              <li>To process subscriptions and billing through Stripe</li>
              <li>To communicate with you about your account, updates, or support requests</li>
              <li>To enforce our Terms of Service and moderate content</li>
              <li>To analyze usage trends and improve the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--fg)' }}>
              3. Third-Party Services
            </h2>
            <p className="mb-3">
              We use the following third-party services to operate the platform:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong style={{ color: 'var(--fg)' }}>Supabase</strong> &mdash; Authentication and
                database. Your account data and content metadata are stored in Supabase-managed
                infrastructure.
              </li>
              <li>
                <strong style={{ color: 'var(--fg)' }}>Stripe</strong> &mdash; Payment processing.
                Stripe handles all billing data under its own{' '}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--secondary)' }}
                  className="hover:underline"
                >
                  privacy policy
                </a>.
              </li>
              <li>
                <strong style={{ color: 'var(--fg)' }}>Vercel</strong> &mdash; Web application
                hosting and edge delivery.
              </li>
              <li>
                <strong style={{ color: 'var(--fg)' }}>Fly.io</strong> &mdash; API server hosting.
              </li>
            </ul>
            <p className="mt-3">
              Each third-party service operates under its own privacy policy. We encourage you to
              review their policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--fg)' }}>
              4. Cookies
            </h2>
            <p>
              Decantr uses cookies solely for session management. Supabase authentication cookies
              are set to maintain your logged-in session. We do not use advertising or third-party
              tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--fg)' }}>
              5. Data Retention
            </h2>
            <p>
              We retain your account data and published content for as long as your account is
              active. If you delete your account, we will remove your personal information within
              30 days. Aggregated, anonymized usage data may be retained indefinitely for analytics
              purposes. Content published to the public registry may persist in cached or
              distributed systems after deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--fg)' }}>
              6. Your Rights
            </h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong style={{ color: 'var(--fg)' }}>Access</strong> &mdash; Request a copy of the
                personal data we hold about you.
              </li>
              <li>
                <strong style={{ color: 'var(--fg)' }}>Delete</strong> &mdash; Request deletion of
                your account and associated personal data.
              </li>
              <li>
                <strong style={{ color: 'var(--fg)' }}>Export</strong> &mdash; Request an export of
                your data in a portable format.
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at the address below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--fg)' }}>
              7. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. When we make material changes,
              we will update the effective date at the top of this page and notify you through the
              Service or via email where appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--fg)' }}>
              8. Contact
            </h2>
            <p>
              For privacy-related inquiries, contact us at{' '}
              <a
                href="mailto:privacy@decantr.ai"
                style={{ color: 'var(--secondary)' }}
                className="hover:underline"
              >
                privacy@decantr.ai
              </a>.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
