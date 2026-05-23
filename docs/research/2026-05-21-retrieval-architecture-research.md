# Retrieval Architecture Research For Decantr 3.0

Date: 2026-05-21
Status: Research input for Decantr 3.0 planning
Related program: `docs/programs/2026-05-21-ai-frontend-governance-reset-plan.md`
Companion research: `docs/research/2026-05-21-graph-ai-governance-competitive-research.md`

## Research Goal

This research task evaluates whether Decantr 3.0 should be shaped like RAG, GraphRAG, CAG, agentic retrieval, or verification-augmented generation.

The answer is not one pattern. Decantr should use different context patterns for different product surfaces:

```text
Contract: cache-augmented.
Context: graph-ranked and agentic.
Evidence: retrieval-backed and provenance-heavy.
Verification: generation-checking, not answer-generation.
```

## Executive Read

Decantr should not describe itself as a RAG product.

The better technical frame is:

```text
Decantr is a verification-augmented generation system for frontend codebases. It uses cached contracts, graph-ranked task context, and retrieval-backed evidence to keep AI edits inside project standards.
```

This matters because the retrieval field has split:

- Naive vector RAG is legacy.
- Modular and self-reflective RAG are mature production patterns.
- Agentic RAG is becoming the enterprise control-plane pattern.
- Structured/Graph RAG is becoming the 2027 retrieval substrate.
- Cache-Augmented Generation is the right fit for small, stable knowledge.
- Verification-augmented generation is Decantr's natural category.

## Decantr Architecture Impact

### 1. Contract Should Be CAG-Shaped

Cache-Augmented Generation fits Decantr's Contract layer better than RAG.

The Contract is:

- project-specific
- relatively small
- stable across many agent calls
- high authority
- repeatedly reused during a coding session

Decantr should produce a contract capsule that can be loaded at session start and reused with a stable cache key.

Important caveat:

- Decantr should not depend on any one model provider's prompt-cache implementation.
- The product shape should be cache-friendly even when the active agent or provider does not expose persistent cache controls.

Recommended artifact:

```text
.decantr/graph/contract-capsule.json
```

Potential contents:

- graph snapshot ID
- contract node summary
- route topology
- component vocabulary
- token vocabulary
- local rules
- style bridge
- open blocking findings
- cache key/source hash

### 2. Evidence Should Stay RAG/Graph-Shaped

Evidence is different from Contract.

Evidence is:

- changing
- cumulative
- tied to files, screenshots, tests, commits, and agent runs
- attribution-critical
- potentially much larger than the contract

Evidence should be queried, filtered, and traversed. It should not be blindly preloaded into every task.

### 3. MCP Should Be Agentic-RAG-Shaped

Decantr MCP should avoid one giant context dump.

Better pattern:

- one session-level contract capsule
- many narrow graph/evidence/query tools
- route/task-scoped follow-up queries
- explicit verification and repair tools

This aligns with A-RAG and agentic RAG research: expose hierarchical retrieval interfaces and let stronger agents decide when to ask for more.

### 4. Route Context Should Be Graph-Ranked

HippoRAG validates Personalized PageRank over knowledge graphs as a relevance mechanism.

For Decantr, the route context answer should not be "every connected node." It should be:

```text
the top-N contract, code, evidence, and rule nodes ranked by graph relevance to this route and task
```

Phase 1 can return deterministic traversals. Phase 2 should add graph relevance scoring.

### 5. Findings Should Borrow Self-RAG's Reflection Shape

Self-RAG and CRAG show a useful control pattern:

- retrieve
- judge support/quality
- decide whether to retry, refine, or answer

Decantr's analogous loop is:

- agent edits
- Decantr verifies
- Decantr emits typed finding
- agent repairs
- Decantr verifies again

Typed findings and repairs are Decantr's version of reflection tokens: machine-readable control signals that determine the next action.

### 6. RAG-Verus Is The Closest Academic Peer

RAG-Verus applies retrieval to repository-level program verification.

The direct Decantr translation:

```text
RAG-Verus: retrieve repository context to synthesize and verify proofs.
Decantr: retrieve contract/code/evidence context to verify AI-edited UI.
```

This is a strong citation for Decantr's category.

## Retrieval Pattern Generations

| Generation | Pattern | Decantr Read |
| --- | --- | --- |
| 1 | Naive RAG | Avoid as primary architecture. Useful only as fallback. |
| 2 | Modular RAG | Production baseline. Borrow reranking/decomposition patterns where needed. |
| 3 | Self-Reflective RAG | Borrow typed critique/repair loop concepts. |
| 4 | Agentic RAG | Shape MCP as composable tools, not monolithic dumps. |
| 5 | Structured / Graph RAG | Align with typed graph and UI ontology. |
| 6 | Cache-Augmented Generation | Adopt for stable Contract capsule. |
| 7 | Verification-Augmented Generation | Adopt as Decantr's natural technical category. |

## Priority Reading And Plan Decisions

### RAG-Verus

Source: [RAG-Verus arXiv 2502.05344](https://arxiv.org/abs/2502.05344)

What it says:

- Repository-level verification needs cross-module context.
- Retrieval-augmented prompting improves proof synthesis in multi-module repositories.
- The paper reports a 27% relative improvement on RepoVBench.

Decantr decision:

- Use "verification-augmented generation" as the technical research category.
- Keep evidence/finding schemas strong enough to support program-verification style provenance.
- Add RAG-Verus to future pitch and technical writing citations.

### Cache-Augmented Generation

Source: [Don't Do RAG: When Cache-Augmented Generation is All You Need for Knowledge Tasks](https://arxiv.org/abs/2412.15605)

What it says:

- For constrained and manageable knowledge bases, preloading resources into long context and using cached runtime parameters can reduce retrieval latency and retrieval errors.
- CAG complements RAG rather than killing it.

Decantr decision:

- Add contract capsule as a Phase 1 or Phase 2 artifact.
- Treat Contract as cache-friendly stable context.
- Keep Evidence as retrieval/graph query.
- Do not depend on provider-specific prompt caching.

### HippoRAG

Source: [HippoRAG NeurIPS 2024](https://papers.nips.cc/paper_files/paper/2024/hash/6ddc001d07ca4f319af96a3024f6dbd1-Abstract-Conference.html)

What it says:

- Combines LLMs, knowledge graphs, and Personalized PageRank for memory/retrieval.

Decantr decision:

- Add graph relevance scoring to the Phase 2 context-selection backlog.
- Initial candidate: personalized PageRank seeded by route, task keywords, open findings, and changed files.
- Use scoring to return top-N relevant nodes, not raw full neighborhoods.

### Agentic RAG And A-RAG

Sources:

- [Agentic RAG Survey arXiv 2501.09136](https://arxiv.org/abs/2501.09136)
- [A-RAG arXiv 2602.03442](https://arxiv.org/abs/2602.03442)

What they say:

- Retrieval should be exposed as an iterative, agent-controlled process.
- A-RAG specifically argues for hierarchical retrieval interfaces that the model can choose among.

Decantr decision:

- Keep MCP tools narrow and composable.
- Add hierarchical graph/context tools:
  - project state
  - route capsule
  - graph query
  - graph traverse
  - evidence query
  - finding query
  - repair plan
- Do not make one monolithic `get_everything_context` tool the default.

### Self-RAG, CRAG, And Chain-of-Verification

Sources:

- [Self-RAG arXiv 2310.11511](https://arxiv.org/abs/2310.11511)
- [Corrective RAG arXiv 2401.15884](https://arxiv.org/abs/2401.15884)
- [Chain-of-Verification arXiv 2309.11495](https://arxiv.org/abs/2309.11495)

What they say:

- Retrieval quality should be evaluated.
- The model can critique support and decide whether more evidence is needed.
- Verification questions can reduce hallucination.

Decantr decision:

- Treat findings as control signals.
- Add repair states that mirror the loop:
  - unsupported
  - needs evidence
  - violates contract
  - repair available
  - repair applied
  - verified
- Use typed diagnostics instead of prose critique whenever possible.

### DSPy

Source: [DSPy documentation](https://github.com/stanfordnlp/dspy/blob/main/docs/docs/index.md)

What it says:

- LLM programs should be declarative, modular, typed, and optimizable against metrics.

Decantr decision:

- Do not add DSPy as a dependency to Decantr 3.0.
- Borrow its philosophy for any future LLM-internal Decantr module:
  - typed signature
  - schema validation
  - measurable quality metric
  - optimizer only after stable task/eval exists

### RAPTOR

Source: [RAPTOR arXiv 2401.18059](https://arxiv.org/abs/2401.18059)

What it says:

- Recursive summaries over a tree can help retrieve information at multiple abstraction levels.

Decantr decision:

- Lower priority because Essence already has a natural hierarchy.
- Potential future use for large evidence archives or long agent-run transcripts.

## Proposed Context Architecture

### Layer 1: Contract Capsule

Pattern: CAG-shaped.

Load once per session where the agent supports it. Otherwise read as a stable compact artifact.

Artifact:

```text
.decantr/graph/contract-capsule.json
```

Primary consumer:

- MCP project/session initialization.

### Layer 2: Route Task Context

Pattern: graph-ranked, agentic.

Uses route, task text, changed files, open findings, and local law as ranking seeds.

Artifact:

```text
decantr_prepare_task_context(...)
```

Primary consumer:

- agent before edit.

### Layer 3: Evidence Query

Pattern: retrieval-backed, provenance-heavy.

Queries screenshots, AST snippets, tests, CI reports, verifier findings, and agent-run transcripts.

Artifact:

```text
decantr_get_evidence_bundle(...)
decantr_get_findings(...)
```

Primary consumer:

- agent during repair and audit.

### Layer 4: Verification Loop

Pattern: verification-augmented generation.

The agent edits first, then Decantr retrieves/checks evidence against contract, emits typed findings, and provides repair plans.

Artifact:

```text
decantr_run_verify(...)
decantr_get_repair_plan(...)
```

Primary consumer:

- CI, MCP, and CLI.

## Required Plan Changes

1. Add retrieval architecture research as a formal research input.
2. Add contract capsule to typed graph Phase 1/2 planning.
3. Add graph relevance ranking to Phase 2 context selection.
4. Add explicit CAG/RAG split:
   - CAG for Contract
   - graph/agentic retrieval for Context
   - retrieval/provenance for Evidence
5. Reframe technical category as verification-augmented generation, while keeping public category AI Frontend Governance.
6. Update MCP plan to include session-level contract capsule and narrow follow-up tools.

## Open Questions

1. Should `contract-capsule.json` be generated in Phase 1 or Phase 2?
2. Should the contract capsule be a graph summary, a compact subgraph, or both?
3. Should ranking be implemented by personalized PageRank, simple weighted traversal, or both?
4. How should MCP expose cache keys without becoming model-provider-specific?
5. Which finding states should become public schema contract?

## Bottom Line

This research strengthens the current Decantr 3 direction but changes the context architecture.

Decantr should not retrieve the Contract every time. It should cache the Contract. It should retrieve Evidence. It should graph-rank Context. It should verify generated code against all three.

That is a stronger architecture than "RAG for UI docs," and it puts Decantr closer to the emerging verification-augmented generation category.
