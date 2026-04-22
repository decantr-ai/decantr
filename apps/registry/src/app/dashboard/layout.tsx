import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { CommandPalette } from '@/components/command-palette';
import { WorkspaceStateProvider } from '@/components/workspace-state-provider';
import { getWorkspaceState, toClientWorkspaceState } from '@/lib/workspace-state';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const workspace = await getWorkspaceState();

  if (!workspace) {
    redirect('/login');
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
