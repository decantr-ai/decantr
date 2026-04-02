import { AgentTimeline, generateTimelineEvents } from '../../components/AgentTimeline';

const events = generateTimelineEvents(20);

export function InferenceLog() {
  return (
    <div>
      <AgentTimeline events={events} title="Inference Trace" />
    </div>
  );
}
