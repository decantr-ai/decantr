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
    <div className="flex flex-col h-dvh">
      {/* Header — 52px, sticky */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 border-b border-d-border bg-d-bg h-[52px] shrink-0">
        {/* Left: Brand */}
        <Link href="/" className="lum-brand text-lg no-underline text-d-text">
          decantr<span className="punct">.</span>a<span className="punct">i</span>
        </Link>

        {/* Center: Nav links */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href="/browse"
            className="text-sm font-medium text-d-muted no-underline transition-colors hover:text-d-primary"
          >
            Browse
          </Link>
          <Link
            href="https://docs.decantr.ai"
            className="text-sm font-medium text-d-muted no-underline transition-colors hover:text-d-primary"
          >
            Docs
          </Link>
        </nav>

        {/* Right: Theme toggle + auth */}
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <NavHeader user={user} />
        </div>
      </header>

      {/* Body — scrollable content area */}
      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {children}
      </main>
    </div>
  );
}
