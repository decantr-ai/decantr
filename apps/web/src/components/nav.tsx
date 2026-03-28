import Link from 'next/link';
import { Button } from './ui/button';
import { UserDropdown } from './user-dropdown';
import { MobileMenu } from './mobile-menu';

interface NavUser {
  email: string;
  display_name?: string | null;
  username?: string | null;
  tier?: string | null;
}

export function Nav({ user }: { user?: NavUser | null }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-[var(--fg)]">
            Decantr
          </Link>
          <Link
            href="/registry"
            className="hidden md:inline text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors text-sm"
          >
            Registry
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden md:block">
                <UserDropdown
                  email={user.email}
                  displayName={user.display_name ?? null}
                  username={user.username ?? null}
                  tier={user.tier ?? null}
                />
              </div>
              <MobileMenu
                user={{
                  email: user.email,
                  displayName: user.display_name ?? null,
                  username: user.username ?? null,
                  tier: user.tier ?? null,
                }}
              />
            </>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/login">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
              <MobileMenu user={null} />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
