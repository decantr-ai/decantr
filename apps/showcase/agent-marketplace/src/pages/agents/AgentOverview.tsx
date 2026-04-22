import { useNavigate } from 'react-router-dom';
import { AgentTimeline } from '../../components/AgentTimeline';
import { AgentSwarmCanvas } from '../../components/AgentSwarmCanvas';
import { PageHeader, SectionHeader } from '../../components/PageHeader';
import { StatsOverview } from '../../components/StatsOverview';
import { agentConnections, agentNodes, overviewEvents, overviewStats } from '../../data/mock';

export function AgentOverview() {
  const navigate = useNavigate();

  return (
    <div className="page-stack">
      <PageHeader
        label="Swarm overview"
        title="Live agent workspace"
        description="Monitor topology, scan active status changes, and move directly from the shared swarm canvas into a single agent investigation."
        actions={(
          <>
            <button type="button" className="d-interactive" data-variant="ghost" onClick={() => navigate('/marketplace')}>
              Browse templates
            </button>
            <button type="button" className="d-interactive" data-variant="primary" onClick={() => navigate('/agents/config')}>
              Configure fleet
            </button>
          </>
        )}
      />

      <StatsOverview stats={overviewStats} />

      <div className="page-stack">
        <SectionHeader
          label="Swarm topology"
          title="Operator-first node canvas"
          description="The canvas stays borderless inside the section and gives the status row its own dedicated lane so the operator can scan quickly."
        />
        <AgentSwarmCanvas agents={agentNodes} connections={agentConnections} onSelectAgent={(id) => navigate(`/agents/${id}`)} />
      </div>

      <div className="page-stack">
        <SectionHeader
          label="Activity feed"
          title="Recent swarm actions and decisions"
          description="A dense timeline is more useful than a decorative log. Every event stays type-colored and expandable without breaking the vertical rhythm."
        />
        <AgentTimeline events={overviewEvents} title="Swarm activity" agentName="Primary fleet" modelId="mixed model runtime" />
      </div>
    </div>
  );
}
