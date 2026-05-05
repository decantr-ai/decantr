import { Routes, Route } from 'react-router-dom';
import { SidebarAside } from './SidebarAside';
import { AgentsPage } from '@/pages/AgentsPage';
import { AgentDetailPage } from '@/pages/AgentDetailPage';
import { AgentConfigPage } from '@/pages/AgentConfigPage';
import { AgentToolsPage } from '@/pages/AgentToolsPage';
import { AgentTreeAside } from '@/components/AgentTreeAside';

export function SidebarAsideAgentRoutes() {
  return (
    <Routes>
      <Route element={<SidebarAside aside={<AgentTreeAside />} asideTitle="Agents" asideWidth={260} />}>
        <Route path="/" element={<AgentsPage />} />
        <Route path="config" element={<AgentConfigPage />} />
        <Route path="tools" element={<AgentToolsPage />} />
        <Route path=":id" element={<AgentDetailPage />} />
      </Route>
    </Routes>
  );
}
