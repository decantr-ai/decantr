import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Decantr — Design Intelligence for AI-Generated UI',
  description: 'OpenAPI for AI-generated UI. A structured schema and design intelligence layer that makes AI coding assistants generate better, more consistent web applications.',
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
