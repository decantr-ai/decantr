'use client';

import { createContext, useContext } from 'react';
import type { WorkspaceSnapshot } from '@/lib/workspace-state';

const WorkspaceStateContext = createContext<WorkspaceSnapshot | null>(null);

export function WorkspaceStateProvider({
  value,
  children,
}: {
  value: WorkspaceSnapshot;
  children: React.ReactNode;
}) {
  return (
    <WorkspaceStateContext.Provider value={value}>
      {children}
    </WorkspaceStateContext.Provider>
  );
}

export function useWorkspaceState() {
  const value = useContext(WorkspaceStateContext);
  if (!value) {
    throw new Error('useWorkspaceState must be used inside WorkspaceStateProvider');
  }
  return value;
}
