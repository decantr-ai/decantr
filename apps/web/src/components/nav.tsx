import Link from 'next/link';
import { Button } from './ui/button';

const ADMIN_EMAILS = ['davidaimi@gmail.com'];

function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export function Nav({ user }: { user?: { email: string } | null }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[var(--fg)]">
          Decantr
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/registry" className="text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors text-sm">
            Registry
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors text-sm">
                Dashboard
              </Link>
              {isAdmin(user.email) && (
                <Link href="/admin" className="text-[var(--primary-light)] hover:text-[var(--primary)] transition-colors text-sm font-medium">
                  Admin
                </Link>
              )}
              <span className="text-[var(--fg-dim)] text-sm">{user.email}</span>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/login">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
