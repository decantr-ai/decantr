import { LegalProse } from '@/components/LegalProse';

export function PrivacyPage() {
  return (
    <LegalProse
      title="Privacy Policy"
      lastUpdated="April 1, 2026"
      sections={[
        { id: 'overview', title: 'Overview', body: ['Cornerstone Properties ("we") provides property management software. This policy explains what data we collect, how we use it, and your rights.', 'We designed this platform with property owners and residents in mind. Their trust is our business model.'] },
        { id: 'data', title: 'Data we collect', body: ['We collect account information (name, email, phone), property and unit records, tenant and lease data, maintenance tickets, payment records, and usage analytics.', 'Payment card data is handled by our PCI-compliant processor. We never store full card numbers.'] },
        { id: 'use', title: 'How we use data', body: ['We use your data to operate the service, process rent payments, send maintenance notifications, produce owner statements, and improve the product.', 'We do not sell personal data. Ever.'] },
        { id: 'sharing', title: 'Sharing', body: ['We share data only with service providers strictly necessary for the product (payment processing, email delivery, cloud hosting) and when legally required.'] },
        { id: 'security', title: 'Security', body: ['All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We run SOC 2 Type II audits annually.'] },
        { id: 'rights', title: 'Your rights', body: ['You may access, correct, export, or delete your data at any time. Contact privacy@cornerstone-properties.com for requests.'] },
        { id: 'contact', title: 'Contact', body: ['Questions? Email privacy@cornerstone-properties.com or write to Cornerstone Properties, 412 SW Morrison St, Portland OR 97204.'] },
      ]}
    />
  );
}
