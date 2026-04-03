import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar, type NavItem } from '@/components/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', icon: 'home', label: 'Overview' },
  { href: '/dashboard/content', icon: 'package', label: 'Content' },
  { href: '/dashboard/api-keys', icon: 'key', label: 'API Keys' },
  { href: '/dashboard/settings', icon: 'settings', label: 'Settings' },
  { href: '/dashboard/billing', icon: 'credit-card', label: 'Billing' },
  { href: '/dashboard/team', icon: 'users', label: 'Team' },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const email = user.email ?? '';
  const displayName =
    (user.user_metadata?.display_name as string | undefined) ?? null;

  return (
    <div className="flex h-dvh">
      <Sidebar
        user={{ email, displayName }}
        items={NAV_ITEMS}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header bar (52px) */}
        <header className="flex items-center justify-between h-[52px] border-b border-d-border px-6 shrink-0">
          <nav className="text-sm text-d-muted" aria-label="Breadcrumb">
            <span className="text-d-text font-medium">Dashboard</span>
          </nav>
          <ThemeToggle compact />
        </header>

        {/* Main content — sole scroll container */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
