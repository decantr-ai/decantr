import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Decantr Registry',
  description: 'Design Intelligence Registry — browse patterns, themes, blueprints, shells, and archetypes for AI-native applications.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
