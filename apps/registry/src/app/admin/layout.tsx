import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';
import { ThemeToggle } from '@/components/theme-toggle';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin',
};

function ShieldIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

const navItems = [
  { href: '/dashboard', icon: 'arrow-left', label: 'Back to Dashboard' },
  { href: '/admin/moderation', icon: 'shield', label: 'Moderation' },
] as const;

function NavIcon({ name }: { name: string }) {
  switch (name) {
    case 'arrow-left':
      return <ArrowLeftIcon />;
    case 'shield':
      return <ShieldIcon />;
    default:
      return null;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email ?? '')) {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-dvh">
      {/* Sidebar */}
      <aside
        className="flex flex-col w-60 border-r border-d-border shrink-0"
        style={{ background: 'var(--d-surface)' }}
      >
        {/* Brand */}
        <div className="flex items-center h-[52px] px-4 border-b border-d-border">
          <span className="text-sm font-semibold text-d-text tracking-wide">
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="d-interactive flex items-center gap-2.5 rounded-md text-sm"
              data-variant="ghost"
              style={{ padding: '0.375rem 0.75rem' }}
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto border-t border-d-border p-2">
          <div className="px-3 py-1.5 text-xs text-d-muted truncate">
            {user.email}
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-[52px] px-6 border-b border-d-border shrink-0">
          <nav className="flex items-center gap-1.5 text-sm text-d-muted">
            <a href="/admin/moderation" className="hover:text-d-text transition-colors">
              Admin
            </a>
          </nav>
          <ThemeToggle compact />
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
