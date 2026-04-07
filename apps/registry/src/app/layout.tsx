import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Decantr Registry',
    template: '%s — Decantr Registry',
  },
  description:
    'Browse patterns, themes, blueprints, and more in the Decantr design intelligence registry.',
  openGraph: {
    title: 'Decantr Registry — Design Intelligence for AI-Generated UI',
    description:
      'Browse patterns, themes, blueprints, and more in the Decantr design intelligence registry.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
