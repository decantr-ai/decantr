import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Decantr',
  description: 'Decantr Terms of Service',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-16 px-6" style={{ background: 'var(--bg)' }}>
      <article className="max-w-3xl mx-auto">
        <h1
          className="text-4xl font-bold mb-2"
          style={{ color: 'var(--fg)' }}
        >
          Terms of Service
        </h1>
        <p className="mb-12 text-sm" style={{ color: 'var(--fg-dim)' }}>
          Effective date: March 28, 2026
        </p>

        <div className="space-y-10 text-base leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--fg)' }}>
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the Decantr platform, website, API, or any associated services
              (collectively, the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--fg)' }}>
              2. Description of Service
            </h2>
            <p>
              Decantr is a design intelligence platform that provides a structured schema and
              intelligence layer for AI-generated user interfaces. The Service includes the Decantr
              registry, API, CLI tools, MCP server, and web dashboard. Decantr does not generate
              code directly; it provides specifications, patterns, and design rules that AI coding
              assistants consume to produce consistent, production-quality web applications.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--fg)' }}>
              3. Account Terms
            </h2>
            <p className="mb-3">
              You must create an account to access certain features of the Service. Authentication
              is managed through Supabase and may include email/password or third-party OAuth
              providers (GitHub, Google).
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activity that occurs under your account. You must notify us immediately
              of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--fg)' }}>
              4. Subscription and Billing
            </h2>
            <p className="mb-3">
              Decantr offers the following paid plans:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li><strong style={{ color: 'var(--fg)' }}>Pro</strong> &mdash; $29/month</li>
              <li><strong style={{ color: 'var(--fg)' }}>Team</strong> &mdash; $99/seat/month</li>
            </ul>
            <p className="mb-3">
              Billing is processed through Stripe. By subscribing, you authorize recurring charges
              to your payment method at the applicable rate until you cancel.
            </p>
            <p>
              You may cancel your subscription at any time from the dashboard. Upon cancellation,
              your plan remains active until the end of the current billing period. After
              expiration, any private content associated with your account will be hidden from
              the registry but not deleted. You may reactivate your subscription to restore access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--fg)' }}>
              5. Content and Publishing
            </h2>
            <p className="mb-3">
              The Service allows users to publish design content (patterns, themes, recipes, and
              other registry items) to the Decantr registry. Content submitted by the community
              is published under the <code style={{ color: 'var(--secondary)', fontSize: '0.9em' }}>@community</code> namespace.
              Content curated and maintained by Decantr is published under the <code style={{ color: 'var(--secondary)', fontSize: '0.9em' }}>@official</code> namespace.
            </p>
            <p className="mb-3">
              You retain ownership of content you publish. By publishing content to the registry,
              you grant Decantr a non-exclusive, worldwide license to host, display, distribute,
              and make your content available through the Service and API.
            </p>
            <p>
              Decantr reserves the right to moderate, remove, or restrict any content that violates
              these terms or is otherwise harmful, misleading, or inappropriate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--fg)' }}>
              6. Intellectual Property
            </h2>
            <p>
              The Decantr platform, including its software, documentation, branding, and
              proprietary content (including content in the <code style={{ color: 'var(--secondary)', fontSize: '0.9em' }}>@official</code> namespace),
              is owned by Decantr and protected by applicable intellectual property laws. These
              terms do not grant you any right to use Decantr trademarks, logos, or branding
              without prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--fg)' }}>
              7. Limitation of Liability
            </h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
              warranties of any kind, express or implied. Decantr shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising from your
              use of the Service. In no event shall Decantr&rsquo;s total liability exceed the
              amount you paid for the Service in the twelve months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--fg)' }}>
              8. Termination
            </h2>
            <p>
              Decantr may suspend or terminate your access to the Service at any time for violation
              of these terms or for any reason with reasonable notice. Upon termination, your right
              to use the Service ceases immediately. Provisions that by their nature should survive
              termination (including limitations of liability and intellectual property) will
              continue to apply.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--fg)' }}>
              9. Changes to Terms
            </h2>
            <p>
              We may update these Terms of Service from time to time. When we make material changes,
              we will notify you by updating the effective date at the top of this page and, where
              appropriate, through the Service or via email. Your continued use of the Service after
              changes take effect constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--fg)' }}>
              10. Contact
            </h2>
            <p>
              If you have questions about these terms, contact us at{' '}
              <a
                href="mailto:team@decantr.ai"
                style={{ color: 'var(--secondary)' }}
                className="hover:underline"
              >
                team@decantr.ai
              </a>.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
