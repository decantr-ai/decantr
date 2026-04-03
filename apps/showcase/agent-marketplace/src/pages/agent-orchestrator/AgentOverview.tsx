import { useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { AgentSwarmCanvas } from '../../components/patterns/AgentSwarmCanvas';
import { AgentTimeline } from '../../components/patterns/AgentTimeline';
import { useAgentSimulation } from '../../hooks/useAgentSimulation';
import { initialAgents } from '../../data/agents';
import { initialEvents } from '../../data/events';

export function AgentOverview() {
  const { agents, events } = useAgentSimulation(initialAgents, initialEvents);
  const navigate = useNavigate();

  return (
    <div className={css('_flex _col _gap6')}>
      <section>
        <div
          className="d-label"
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}
        >
          SWARM TOPOLOGY
        </div>
        <AgentSwarmCanvas
          agents={agents}
          onSelectAgent={id => navigate(`/agents/${id}`)}
        />
      </section>

      <section className="d-section" data-density="compact">
        <div
          className="d-label"
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}
        >
          ACTIVITY FEED
        </div>
        <AgentTimeline events={events.slice(0, 20)} />
      </section>
    </div>
  );
}
