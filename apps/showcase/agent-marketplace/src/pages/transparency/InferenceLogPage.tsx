import { css } from '@decantr/css';
import { timelineEvents } from '../../data';
import { AgentTimeline } from '../../components/AgentTimeline';

/**
 * Inference log — agent-timeline as inference-trace.
 * Reuses the shared timeline component.
 */
export function InferenceLogPage() {
  // Enrich events with inference context
  const inferenceEvents = timelineEvents.map((e) => ({
    ...e,
    title: `[Inference] ${e.title}`,
  }));

  return (
    <div className={css('_flex _col _gap6')}>
      <AgentTimeline events={inferenceEvents} label="Inference Trace" />
    </div>
  );
}
