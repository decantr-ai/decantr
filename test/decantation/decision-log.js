/**
 * Decision Log — Captures every branch point in the decantation pipeline.
 *
 * Decision types:
 *   automated    — Engine resolved it deterministically
 *   llm-required — No algorithm exists; LLM must handle
 *   ambiguous    — Low confidence; could go either way
 *   fallback     — Algorithm failed; used a default
 */

export class DecisionLog {
  constructor() {
    /** @type {Array<Decision>} */
    this.decisions = [];
  }

  /**
   * Record a decision.
   * @param {{ stage: string, step: string, type: 'automated'|'llm-required'|'ambiguous'|'fallback', detail: Object }} decision
   */
  record(decision) {
    this.decisions.push({
      ...decision,
      timestamp: Date.now(),
    });
  }

  /** Get all decisions for a stage */
  forStage(stage) {
    return this.decisions.filter(d => d.stage === stage);
  }

  /** Get all decisions of a type */
  ofType(type) {
    return this.decisions.filter(d => d.type === type);
  }

  /** Count decisions by type */
  typeCounts() {
    const counts = { automated: 0, 'llm-required': 0, ambiguous: 0, fallback: 0 };
    for (const d of this.decisions) {
      counts[d.type] = (counts[d.type] || 0) + 1;
    }
    return counts;
  }

  /** Automation ratio: automated / total */
  automationRatio() {
    if (this.decisions.length === 0) return 0;
    return this.ofType('automated').length / this.decisions.length;
  }

  /** Get LLM intervention points */
  llmInterventionPoints() {
    return this.ofType('llm-required').map(d => ({
      stage: d.stage,
      step: d.step,
      reason: d.detail?.reason,
    }));
  }

  /** Export as plain object */
  toJSON() {
    return {
      total: this.decisions.length,
      typeCounts: this.typeCounts(),
      automationRatio: Math.round(this.automationRatio() * 100) / 100,
      decisions: this.decisions,
    };
  }

  /** Clear all decisions */
  clear() {
    this.decisions = [];
  }
}
