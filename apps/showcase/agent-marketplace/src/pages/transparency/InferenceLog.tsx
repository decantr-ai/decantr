import { AgentTimeline } from '../../components/AgentTimeline';
import { PageHeader } from '../../components/PageHeader';
import { inferenceEvents } from '../../data/mock';

export function InferenceLog() {
  return (
    <div className="page-stack">
      <PageHeader
        label="Inference log"
        title="Live inference trace"
        description="Tool calls, reasoning, decisions, and generated outputs stay in one dense chronological view so the operator can reconstruct what happened without losing context."
      />
      <AgentTimeline
        events={inferenceEvents}
        title="Inference trace"
        agentName="Multi-model pipeline"
        modelId="gpt-4o / claude-3-sonnet"
      />
    </div>
  );
}
