import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ThemeLabProvider } from '@/components/theme-lab-provider';
import { ThemeLabTrigger } from '@/components/theme-lab-trigger';
import { ThemeLabDrawer } from '@/components/theme-lab-drawer';
import { ThemeLabBanner } from '@/components/theme-lab-banner';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavHeader } from './nav-header';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // not authenticated
  }

  return (
    <ThemeLabProvider>
      <div className="flex flex-col" style={{ minHeight: '100vh' }}>
        {/* Header */}
        <header
          className="flex items-center justify-between shrink-0"
          style={{
            height: 52,
            padding: '0 1.5rem',
            borderBottom: '1px solid var(--d-border)',
            background: 'var(--d-bg)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Link href="/" className="flex items-center gap-2" style={{ textDecoration: 'none', color: 'var(--d-text)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--d-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <span className="font-semibold text-lg lum-brand">decantr</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeLabTrigger />
            <ThemeToggle />
            <NavHeader user={user} />
          </div>
        </header>

        {/* Body */}
        <main style={{ flex: 1 }}>
          {children}
        </main>

        {/* Footer */}
        <footer
          style={{
            borderTop: '1px solid var(--d-border)',
            padding: '2rem 1.5rem',
            marginTop: 'auto',
          }}
        >
          <div className="flex justify-between flex-wrap gap-8" style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--d-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
                <span className="font-semibold lum-brand">decantr</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--d-text-muted)', maxWidth: 280 }}>
                Design Intelligence API for AI-native applications.
              </p>
            </div>
            <div className="flex gap-12 flex-wrap">
              <div className="flex flex-col gap-2">
                <span className="d-label">Registry</span>
                <Link href="/browse" className="text-sm" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Browse</Link>
                <Link href="/browse/patterns" className="text-sm" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Patterns</Link>
                <Link href="/browse/themes" className="text-sm" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Themes</Link>
              </div>
              <div className="flex flex-col gap-2">
                <span className="d-label">Resources</span>
                <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>Documentation</span>
                <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>API Reference</span>
                <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>Changelog</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="d-label">Company</span>
                <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>About</span>
                <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>Blog</span>
                <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>Careers</span>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--d-border)', margin: '1.5rem 0' }} />
          <p className="text-sm text-center" style={{ color: 'var(--d-text-muted)' }}>
            &copy; 2026 Decantr. All rights reserved.
          </p>
        </footer>
      </div>

      <ThemeLabDrawer />
      <ThemeLabBanner />
    </ThemeLabProvider>
  );
}
