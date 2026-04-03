import { useState, useEffect } from 'react';
import type { Agent, TimelineEvent, AgentStatus, EventType } from '../data/types';

const STATUSES: AgentStatus[] = ['active', 'idle', 'error', 'processing'];
const EVENT_TYPES: EventType[] = ['action', 'decision', 'error', 'tool_call', 'reasoning', 'warning'];

const SUMMARIES: Record<EventType, string[]> = {
  action: [
    'Dispatched sub-task to downstream agent',
    'Initiated data pipeline refresh',
    'Forwarded query to classifier',
    'Triggered batch processing job',
  ],
  decision: [
    'Selected few-shot strategy over zero-shot',
    'Routed to fallback model due to latency',
    'Chose retrieval-augmented approach',
    'Prioritized high-confidence path',
  ],
  error: [
    'Timeout after 30s on upstream API',
    'Rate limit exceeded on model endpoint',
    'Connection refused by data source',
    'Schema validation failed on response',
  ],
  tool_call: [
    'Called search_documents(query="agent metrics")',
    'Executed sql_query(table="inference_logs")',
    'Invoked embeddings_api(model="ada-002")',
    'Ran classify_intent(text="deploy agent")',
  ],
  reasoning: [
    'Evaluated 3 candidate responses, selected highest confidence',
    'Determined intent: deployment request with high certainty',
    'Analyzed token budget: sufficient for extended reasoning',
    'Compared latency vs accuracy trade-off, chose accuracy',
  ],
  warning: [
    'Token budget at 85% capacity',
    'Response latency exceeding P95 threshold',
    'Memory utilization approaching limit',
    'Connection pool nearing saturation',
  ],
};

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let eventCounter = 1000;

export function useAgentSimulation(
  initialAgents: Agent[],
  initialEvents: TimelineEvent[]
) {
  const [agents, setAgents] = useState(initialAgents);
  const [events, setEvents] = useState(initialEvents);

  useEffect(() => {
    const interval = setInterval(() => {
      // Toggle 1-2 agent statuses
      setAgents(prev => {
        const next = [...prev];
        const count = Math.random() > 0.5 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const idx = Math.floor(Math.random() * next.length);
          const agent = { ...next[idx] };
          agent.status = randomItem(STATUSES);
          // Update metrics slightly
          agent.metrics = {
            ...agent.metrics,
            requests: agent.metrics.requests + Math.floor(Math.random() * 50),
            latency: Math.max(10, agent.metrics.latency + (Math.random() - 0.5) * 20),
            tokens: agent.metrics.tokens + Math.floor(Math.random() * 500),
          };
          next[idx] = agent;
        }
        return next;
      });

      // Add 1 new event
      setEvents(prev => {
        const type = randomItem(EVENT_TYPES);
        const agentId = randomItem(initialAgents).id;
        const newEvent: TimelineEvent = {
          id: `evt-sim-${eventCounter++}`,
          agentId,
          type,
          summary: randomItem(SUMMARIES[type]),
          detail: `Automated simulation event for agent ${agentId}. This event was generated to demonstrate real-time timeline updates.`,
          timestamp: Date.now(),
          duration: type === 'tool_call' ? Math.floor(Math.random() * 3000) + 100 : undefined,
        };
        return [newEvent, ...prev].slice(0, 100); // Keep last 100
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [initialAgents]);

  return { agents, events };
}
