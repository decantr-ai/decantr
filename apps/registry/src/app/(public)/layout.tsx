import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavHeader } from './nav-header';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: { id: string; email?: string } | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Auth unavailable — render as logged-out
  }

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh' }}>
      {/* Header — 52px, sticky */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between shrink-0"
        style={{
          height: 52,
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'var(--d-bg)',
        }}
      >
        {/* Left: Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 no-underline"
          style={{ color: 'var(--d-text)' }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--d-accent)' }}
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
          <span className="font-semibold text-lg lum-brand">decantr</span>
        </Link>

        {/* Right: Theme toggle + auth */}
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <NavHeader user={user} />
        </div>
      </header>

      {/* Body — pages own their spacing */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
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
        <div
          className="flex justify-between flex-wrap gap-8"
          style={{ maxWidth: 1200, margin: '0 auto' }}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'var(--d-accent)' }}
              >
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
              <Link href="/browse" className="text-sm no-underline" style={{ color: 'var(--d-text-muted)' }}>Browse</Link>
              <Link href="/browse?type=patterns" className="text-sm no-underline" style={{ color: 'var(--d-text-muted)' }}>Patterns</Link>
              <Link href="/browse?type=themes" className="text-sm no-underline" style={{ color: 'var(--d-text-muted)' }}>Themes</Link>
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
  );
}
