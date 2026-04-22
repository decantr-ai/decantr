import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin';
import { Sidebar } from '@/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { CommandPalette } from '@/components/command-palette';
import type { Metadata } from 'next';
import { WorkspaceStateProvider } from '@/components/workspace-state-provider';
import { getWorkspaceState, toClientWorkspaceState } from '@/lib/workspace-state';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const workspace = await getWorkspaceState();

  if (!workspace) {
    redirect('/login');
  }
  if (!isAdmin(workspace.authUser.email ?? '')) {
    redirect('/dashboard');
  }
  const workspaceSnapshot = toClientWorkspaceState(workspace);

  return (
    <WorkspaceStateProvider value={workspaceSnapshot}>
      <div className="registry-shell-root">
        <Sidebar workspace={workspaceSnapshot} />

        <div className="registry-shell-main">
          <DashboardHeader />
          <CommandPalette workspace={workspaceSnapshot} />
          <main className="registry-shell-body entrance-fade">
            {children}
          </main>
        </div>
      </div>
    </WorkspaceStateProvider>
  );
}
