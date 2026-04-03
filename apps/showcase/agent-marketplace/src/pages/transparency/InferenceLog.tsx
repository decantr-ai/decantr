import { css } from '@decantr/css';
import { AgentTimeline } from '../../components/patterns/AgentTimeline';
import { useAgentSimulation } from '../../hooks/useAgentSimulation';
import { initialAgents } from '../../data/agents';
import { initialEvents } from '../../data/events';

export function InferenceLog() {
  const { events } = useAgentSimulation(initialAgents, initialEvents);

  return (
    <div className={css('_flex _col _gap6')}>
      <section className="d-section" data-density="compact">
        <div
          className="d-label"
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}
        >
          INFERENCE TRACE
        </div>
        <AgentTimeline events={events} />
      </section>
    </div>
  );
}
