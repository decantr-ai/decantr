import { useParams } from 'react-router-dom';
import { css } from '@decantr/css';
import { AgentTimeline } from '../../components/patterns/AgentTimeline';
import { NeuralFeedbackLoop } from '../../components/patterns/NeuralFeedbackLoop';
import { useAgentSimulation } from '../../hooks/useAgentSimulation';
import { initialAgents } from '../../data/agents';
import { initialEvents } from '../../data/events';

export function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const { agents, events } = useAgentSimulation(initialAgents, initialEvents);

  const agent = agents.find(a => a.id === id) || agents[0];
  const agentEvents = events.filter(e => e.agentId === agent.id);

  const confidenceMetric = {
    label: 'Confidence',
    value: 87 + Math.random() * 10,
    unit: '%',
    trend: 2.4,
    history: Array.from({ length: 12 }, () => 85 + Math.random() * 12),
  };

  return (
    <div className={css('_flex _col _gap6')}>
      <section className="d-section" data-density="compact">
        <div
          className="d-label"
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}
        >
          AGENT HISTORY
        </div>
        <AgentTimeline
          events={agentEvents}
          agentName={agent.name}
          modelId={agent.model}
          status={agent.status}
        />
      </section>

      <section className="d-section" data-density="compact">
        <div
          className="d-label"
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}
        >
          FEEDBACK INSPECTOR
        </div>
        <div className={css('_flex _jcc')}>
          <NeuralFeedbackLoop
            metric={confidenceMetric}
            processingState={agent.status === 'processing' ? 'active' : agent.status === 'active' ? 'idle' : 'complete'}
          />
        </div>
      </section>
    </div>
  );
}
