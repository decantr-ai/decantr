import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { createClient } from '@/lib/supabase/server';
import './globals.css';

export const metadata: Metadata = {
  title: 'Decantr — Design Intelligence for AI-Generated UI',
  description: 'OpenAPI for AI-generated UI. A structured schema and design intelligence layer that makes AI coding assistants generate better, more consistent web applications.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    // Auth check failed, continue without user
  }

  return (
    <html lang="en" className="dark">
      <body>
        <Nav user={user ? { email: user.email ?? '' } : null} />
        <div className="pt-16">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
