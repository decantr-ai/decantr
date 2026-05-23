import type { Metadata } from 'next';
import { JsonLd } from '@/components/json-ld';
import { RegistryWebTelemetryProvider } from '@/components/registry-web-telemetry';
import { buildRegistrySiteJsonLd, REGISTRY_SITE_URL } from '@/lib/seo';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(REGISTRY_SITE_URL),
  title: {
    default: 'Decantr Registry',
    template: '%s — Decantr Registry',
  },
  description:
    'Browse Decantr certified vocabulary for AI Frontend Governance: starter kits, patterns, themes, archetypes, and shells.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Decantr Registry — Certified Vocabulary for AI Frontend Governance',
    description:
      'Browse Decantr certified vocabulary for AI Frontend Governance: starter kits, patterns, themes, archetypes, and shells.',
    url: '/',
    siteName: 'Decantr Registry',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Decantr Registry — Certified Vocabulary for AI Frontend Governance',
    description:
      'Browse Decantr certified vocabulary for AI Frontend Governance: starter kits, patterns, themes, archetypes, and shells.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <JsonLd data={buildRegistrySiteJsonLd()} />
        <RegistryWebTelemetryProvider>{children}</RegistryWebTelemetryProvider>
      </body>
    </html>
  );
}
