import { LegalProse } from '@/components/LegalProse';

export function TermsPage() {
  return (
    <LegalProse
      title="Terms of Service"
      lastUpdated="April 1, 2026"
      sections={[
        { id: 'agreement', title: 'Agreement', body: ['By using Cornerstone, you agree to these terms. If you do not agree, do not use the service.'] },
        { id: 'accounts', title: 'Accounts', body: ['You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of unauthorized access.'] },
        { id: 'acceptable', title: 'Acceptable use', body: ['Do not use the service for unlawful purposes, to harass tenants, or to circumvent fair housing laws.', 'Do not attempt to reverse-engineer, overwhelm, or probe the service.'] },
        { id: 'payments', title: 'Payments', body: ['Subscription fees are billed monthly in advance. Rent collection fees are disclosed at checkout.', 'Refunds are prorated for annual plans terminated within 30 days.'] },
        { id: 'liability', title: 'Liability', body: ['Cornerstone is provided "as is." We are not liable for tenant disputes, vendor quality, or regulatory decisions.'] },
        { id: 'termination', title: 'Termination', body: ['You may cancel at any time. We may terminate accounts that violate these terms with 30 days notice.'] },
        { id: 'governing-law', title: 'Governing law', body: ['These terms are governed by the laws of Oregon, USA. Disputes will be resolved in Multnomah County.'] },
      ]}
    />
  );
}
