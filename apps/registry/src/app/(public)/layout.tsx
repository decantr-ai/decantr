import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavHeader } from './nav-header';

const PUBLIC_NAV_LINKS = [
  { href: '/browse', label: 'Browse' },
  { href: '/browse/patterns', label: 'Patterns' },
  { href: '/browse/themes', label: 'Themes' },
  { href: '/browse/blueprints', label: 'Blueprints' },
];

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
    <div className="registry-public-frame">
      <header className="registry-public-header">
        <Link href="/" className="registry-brand-link">
          <svg
            className="registry-brand-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
          <span className="font-semibold text-lg lum-brand">decantr</span>
        </Link>

        <nav className="registry-header-nav" aria-label="Public registry navigation">
          {PUBLIC_NAV_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="registry-header-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="registry-public-header-actions">
          <ThemeToggle compact />
          <NavHeader user={user} />
        </div>
      </header>

      <main className="registry-public-main lum-canvas">{children}</main>

      <footer className="registry-public-footer">
        <div className="registry-public-footer-inner">
          <div className="registry-footer-brand-block">
            <div className="registry-footer-brand">
              <svg
                className="registry-brand-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              <span className="font-semibold lum-brand">decantr</span>
            </div>
            <p className="registry-footer-copy">
              Design Intelligence API for AI-native applications.
            </p>
          </div>

          <div className="registry-footer-nav">
            <div className="registry-footer-group">
              <span className="d-label">Registry</span>
              <Link href="/browse" className="registry-footer-link">
                Browse
              </Link>
              <Link href="/browse/blueprints" className="registry-footer-link">
                Blueprints
              </Link>
              <Link href="/browse/patterns" className="registry-footer-link">
                Patterns
              </Link>
              <Link href="/browse/themes" className="registry-footer-link">
                Themes
              </Link>
            </div>

            <div className="registry-footer-group">
              <span className="d-label">Start Building</span>
              <Link href="/" className="registry-footer-link">
                Home
              </Link>
              <Link
                href="/browse/blueprints?source=official"
                className="registry-footer-link"
              >
                Official blueprints
              </Link>
              <Link href="/browse" className="registry-footer-link">
                All registry content
              </Link>
            </div>

            <div className="registry-footer-group">
              <span className="d-label">Resources</span>
              <a
                href="https://decantr.ai"
                target="_blank"
                rel="noopener"
                className="registry-footer-link"
              >
                Documentation
              </a>
              <a
                href="https://decantr.ai/reference/registry-public-api.html"
                target="_blank"
                rel="noopener"
                className="registry-footer-link"
              >
                API Reference
              </a>
              <a
                href="https://decantr.ai/schemas/"
                target="_blank"
                rel="noopener"
                className="registry-footer-link"
              >
                Schemas
              </a>
            </div>
          </div>
        </div>

        <div className="registry-footer-divider" />
        <p className="registry-footer-copyright">
          &copy; 2026 Decantr. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
