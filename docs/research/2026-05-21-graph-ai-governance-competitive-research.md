# Graph AI Governance Competitive Research

Date: 2026-05-21
Status: Research input for Decantr 3.0 planning
Related program: `docs/programs/2026-05-21-ai-frontend-governance-reset-plan.md`

## Research Goal

This dossier calibrates Decantr 3.0 against adjacent agent-memory, GraphRAG, code-intelligence, and ontology systems before implementation begins.

The goal is not to copy any one project. The goal is to identify the architectural patterns that are converging across the market, decide which ones Decantr should adopt, and avoid adopting fashionable complexity that does not help AI Frontend Governance.

## Executive Read

The market is converging on typed graphs as infrastructure for AI systems, but the dominant products solve different problems:

- Graphiti, Cognee, TrustGraph, Microsoft GraphRAG, VeritasGraph, LightRAG, and LlamaIndex are mostly about memory, retrieval, knowledge extraction, and attribution.
- Aider, RepoMapper, Sourcegraph, TDAD, and CGM are mostly about code context, code graphs, repository-scale impact, and agent accuracy.
- Letta is mostly about agent self-managed memory and persistent state.

Decantr should not become a generic GraphRAG product, memory layer, or code search platform.

The defensible wedge remains:

```text
External typed governance for AI-edited frontends.
```

The best borrowed patterns are:

1. Temporal snapshots and graph diffs from Graphiti/Zep.
2. Poly-store thinking from Cognee, but with storage caution because Kuzu is currently archived.
3. Ontology-grounded retrieval from TrustGraph, specialized as Decantr's UI ontology.
4. Tree-sitter based code graph extraction from Aider and RepoMapper.
5. MCP-native distribution from Graphiti and Sourcegraph.
6. Provenance-first findings from VeritasGraph and GraphRAG systems.
7. Test impact edges from TDAD.
8. Long-term compatibility with graph-aware model/context interfaces suggested by CGM.
9. External governance positioning sharpened against Letta-style self-managed memory.

## Architecture Changes Recommended

### 1. Add A Research Gate Before Implementation

Before Decantr 3.0 graph implementation begins, complete a short research and ADR phase:

- Storage ADR: SQLite node/edge tables vs embedded graph store vs adapter interface.
- Temporal model ADR: snapshot IDs, valid-from/valid-to semantics, graph diff format.
- Provenance schema ADR: source artifact, commit, contract clause, rule, evidence, finding lineage.
- Code graph spike: tree-sitter extraction for React/TypeScript/TSX plus import/reference edges.
- MCP tool matrix: compare Decantr tools to Graphiti and Sourcegraph MCP surfaces.
- Competitor watchlist: Graphiti/Zep, Sourcegraph, Vercel, TrustGraph, Cognee, Aider/RepoMapper.

### 2. Do Not Hard-Require Kuzu

The prior plan said SQLite first. The external feedback suggested replacing SQLite tables with Kuzu.

The updated recommendation is:

- Keep SQLite as the default local working store until an ADR proves otherwise.
- Design a graph storage adapter so a property graph engine can be swapped in later.
- Study Kuzu's property-graph model and query ergonomics, but do not hard-depend on Kuzu for Decantr 3.0 because the Kuzu repository is archived/read-only as of 2025-10-10.
- Avoid Neo4j or server-backed graph stores as the default local developer path.

This is a place for discipline. Decantr's graph scale is small. Queryability matters, but install friction and maintenance risk matter more.

### 3. Move Temporal Earlier

Temporal graph support should not wait until the final architecture phase.

Phase 1 should emit:

- `graph.snapshot.json`
- `graph.manifest.json`
- `graph.diff.json` when a baseline exists
- source hashes
- parent snapshot IDs where available
- provenance links for every derived node and edge

Full temporal analytics across 50 commits can wait. Snapshot identity and diff shape should exist from day one.

### 4. Make Provenance A First-Class Schema, Not Metadata

Every finding should answer:

- Which rule did this violate?
- Which graph node is the anchor?
- Which source artifact created that node?
- Which file, line, screenshot, test, or AST snippet proves the finding?
- Which commit or baseline introduced or resolved it when known?

This turns Decantr from "a verifier that complains" into an evidence system.

### 5. Add Tree-Sitter To The Code Graph Plan

For React/TypeScript/TSX, Decantr should not rely on regex scans or shallow file heuristics.

Phase 2 should use a tree-sitter based code graph for:

- component declarations
- imports and exports
- JSX usage
- symbol references
- route file ownership
- shadcn/local design-system imports
- className and token usage where practical

Ranking context with PageRank or a similar graph-ranking method should be evaluated after extraction is stable.

### 6. Add Test Impact Edges Earlier

TDAD validates the pattern that graph impact analysis can reduce regressions for AI agent changes.

Decantr should add test surfaces as graph nodes sooner:

- route smoke tests
- Playwright specs
- unit tests that cover UI primitives
- Storybook stories when present
- CI checks and evidence bundles

The graph should help answer "what should be verified after this agent edit?"

### 7. Use "UI Ontology" Internally, Not As The Public Category

TrustGraph and OntologyRAG validate ontology-grounded retrieval, but "OntologyRAG" is not the right first-mile market term for Decantr.

Recommended wording:

- Public category: AI Frontend Governance.
- Product nouns: Contract / Context / Evidence.
- Technical substrate: typed UI ontology and code graph.
- Internal architecture: ontology-grounded task context.

## Ten Reference Findings

### 1. Graphiti By Zep

Source: [Graphiti GitHub](https://github.com/getzep/graphiti), [Graphiti MCP server](https://github.com/getzep/graphiti/blob/main/mcp_server/README.md), [Zep paper](https://arxiv.org/abs/2501.13956)

What it is:

- Temporal context graph engine for AI agents.
- Tracks entities, relationships, facts, source episodes, custom types, and time.
- Ships an MCP server for Claude, Cursor, and other MCP clients.

Decantr read:

- Strong validation for temporal graphs and MCP-native distribution.
- Graphiti is agent memory; Decantr is agent governance.
- Borrow temporal snapshots, provenance, and MCP ergonomics.
- Do not borrow broad memory positioning.

Plan impact:

- Move temporal snapshot IDs and diffs into Phase 1.
- Add provenance links for derived graph facts.
- Add Graphiti/Zep to the watchlist.

### 2. Cognee

Source: [Cognee GitHub](https://github.com/topoteretes/cognee), [Cognee architecture blog](https://www.cognee.ai/blog/fundamentals/how-cognee-builds-ai-memory)

What it is:

- Open-source memory control plane for agents.
- Combines graph, vector, and relational storage.
- Current public architecture describes file-based defaults using SQLite, LanceDB, and Kuzu.

Decantr read:

- Poly-store architecture is a useful pattern.
- Decantr does not need Cognee's broad connector and memory scope.
- Graph/vector/relational separation maps well to contract graph, fuzzy discovery, and evidence/provenance.

Plan impact:

- Add storage ADR.
- Keep vector retrieval as fallback, not primary path.
- Do not blindly adopt Kuzu because Kuzu is archived.

### 3. TrustGraph And OntologyRAG

Source: [TrustGraph Ontology RAG guide](https://docs.trustgraph.ai/guides/ontology-rag/), [TrustGraph ontologies and context graphs](https://trustgraph.ai/guides/key-concepts/ontologies-and-context-graphs/)

What it is:

- Ontology-guided knowledge extraction and retrieval.
- Uses ontology/schema definitions to make graph extraction precise.

Decantr read:

- Decantr's essence/contract should be treated as a UI ontology.
- Decantr has a cost advantage because much of its graph input is already structured: essence, local law, registry records, ASTs, tests, screenshots.
- Avoid LLM-heavy extraction unless it is clearly bounded and auditable.

Plan impact:

- Add "typed UI ontology" language to technical docs.
- Keep public framing as AI Frontend Governance.

### 4. Aider Repo Map And Tree-Sitter

Source: [Aider repo map blog](https://aider.chat/2023/10/22/repomap.html), [Aider supported languages](https://aider.chat/docs/languages.html)

What it is:

- Repository map built with tree-sitter.
- Extracts definitions and references so coding agents receive compact code context.

Decantr read:

- This is the right implementation pattern for code graph extraction.
- For v3, Decantr should start with React/TypeScript/TSX, not 130 languages.
- PageRank-style ranking can help decide which code facts enter agent context.

Plan impact:

- Phase 2 code graph uses tree-sitter rather than regex-first heuristics.
- Add context-ranking spike after deterministic extraction.

### 5. Sourcegraph MCP And Code Intelligence

Source: [Sourcegraph MCP](https://sourcegraph.com/mcp), [Sourcegraph pricing](https://sourcegraph.com/pricing)

What it is:

- Enterprise code intelligence platform with MCP, cross-repo search, navigation, history, and semantic context.
- Public pricing is currently enterprise-first.

Decantr read:

- Sourcegraph validates the enterprise buyer language: code intelligence for agents, MCP, security, scale, governance.
- Sourcegraph is broad and cross-repo. Decantr should be narrow and UI-specific.
- Sourcegraph is a serious threat if it adds UI-coherence or design-system governance.

Plan impact:

- Keep Decantr local-first and frontend-specific.
- Add Sourcegraph to the threat watchlist.
- Do not overbuild generic code search.

### 6. Microsoft GraphRAG

Source: [Microsoft GraphRAG GitHub](https://github.com/microsoft/graphrag)

What it is:

- Modular GraphRAG framework that uses knowledge graph memory structures to improve LLM outputs.
- Public docs warn indexing can be expensive and users should start small.

Decantr read:

- Graph query and multi-hop retrieval patterns are relevant.
- LLM-driven document graph extraction is not Decantr's center.
- Decantr should avoid the GraphRAG indexing tax by deriving graph facts deterministically where possible.

Plan impact:

- Keep "graph first, vector second."
- Avoid claiming Decantr is GraphRAG.
- Add bounded LLM extraction only behind explicit evidence and provenance.

### 7. VeritasGraph

Source: [VeritasGraph GitHub](https://github.com/bibinprathap/VeritasGraph)

What it is:

- On-prem GraphRAG system focused on multi-hop reasoning and verifiable attribution.
- Emphasizes source attribution for generated claims.

Decantr read:

- Attribution is not a nice-to-have. It is the enterprise trust story.
- Decantr findings should trace to rule, graph node, source artifact, file/line/screenshot/test, and commit/baseline when known.

Plan impact:

- Promote provenance from edge payload metadata to first-class source/evidence nodes.
- Update finding schema to require lineage fields for production-grade findings.

### 8. TDAD

Source: [TDAD arXiv](https://arxiv.org/abs/2603.17973)

What it is:

- Test-driven agentic development research.
- Builds AST-based code/test dependency maps and uses impact analysis to reduce AI-agent regressions.

Decantr read:

- This validates graph-based verification for AI-induced regressions.
- Decantr should not only catch UI drift after the fact. It should identify what tests/evidence need to run because of a graph change.

Plan impact:

- Add test nodes and `TEST_COVERS_NODE` edges earlier.
- Add "impacted tests/evidence" query to MCP and CI backlog.

### 9. Code Graph Model

Source: [CGM arXiv](https://arxiv.org/abs/2505.16901)

What it is:

- Research integrating repository code graph structure into model attention.
- Demonstrates that code graphs are becoming model-level infrastructure, not only retrieval helpers.

Decantr read:

- Near term: expose graph slices through MCP.
- Longer term: keep graph snapshots and IDs stable enough that future agents/models can attend to them natively.

Plan impact:

- Treat graph schema stability as a product contract.
- Add "native graph context" to future-looking architecture notes, not v3 launch scope.

### 10. Letta

Source: [Letta GitHub](https://github.com/letta-ai/letta), [Letta stateful agents docs](https://docs.letta.com/guides/core-concepts/stateful-agents)

What it is:

- Stateful agent platform with persistent memory and agent-editable memory blocks.
- Lets agents manage context and memory across runs.

Decantr read:

- Useful contrast for positioning.
- Letta is self-managed memory. Decantr should be externally managed governance.
- For audit and compliance, the agent should not be the sole authority over its own constraints.

Plan impact:

- Sharpen public language around "external typed governance."
- Keep agent context read-only by default and make contract changes explicit.

## Peripheral References

### Kuzu

Source: [Kuzu GitHub](https://github.com/kuzudb/kuzu), [Kuzu docs](https://kuzudb.github.io/docs/)

Read:

- Excellent fit conceptually: embedded property graph, Cypher-like query model, vector/full-text features.
- Current blocker: repository is archived/read-only as of 2025-10-10.

Decision:

- Study the model.
- Do not make it a hard dependency for Decantr 3.0.
- Keep storage pluggable.

### LightRAG And NanoGraphRAG

Source: [LightRAG project page](https://lightrag.github.io/)

Read:

- Useful evidence that lighter graph retrieval approaches are emerging to reduce GraphRAG complexity and cost.
- Not directly Decantr's core because Decantr's graph should be deterministic and typed.

Decision:

- Track retrieval ideas.
- Do not build Decantr around generic text extraction.

### LlamaIndex Property Graph Index

Source: [LlamaIndex PropertyGraphIndex docs](https://developers.llamaindex.ai/python/framework/module_guides/indexing/lpg_index_guide/)

Read:

- Useful programmatic model for graph construction and query orchestration.
- More Python/RAG-centered than Decantr's TypeScript package line.

Decision:

- Borrow concepts such as graph stores, extractors, and retrieval abstractions.
- Avoid framework dependency unless a future Python bridge exists.

### BAML

Source: [BAML GitHub](https://github.com/boundaryml/baml)

Read:

- Strong example of treating LLM interactions as typed functions with local files and generated clients.

Decision:

- Useful design analogy for Decantr MCP/finding schemas.
- Decantr should define tool and repair schemas as durable typed contracts.

### Agent-OM

Source: [Agent-OM arXiv](https://arxiv.org/abs/2312.00326)

Read:

- Relevant if Decantr later needs to align UI ontologies across multiple products or teams.

Decision:

- Future enterprise direction only.
- Not needed for v3 launch.

### RepoMapper

Source: [RepoMapper MCP listing](https://copilothub.directory/mcps/pdavis68-repomapper)

Read:

- Confirms Aider-style repo maps are already being repackaged as MCP tools.

Decision:

- Decantr should not build a generic repo map clone.
- Decantr should build a UI-governance code graph and expose it through MCP.

## Watchlist

Track these monthly during the v3 build:

- Vercel: Zero, json-render, v0, deployment-integrated agent surfaces.
- Sourcegraph: MCP/code intelligence, UI coherence, enterprise governance.
- Graphiti/Zep: temporal graph patterns, MCP tools, provenance, database backends.
- Cognee: poly-store agent memory patterns.
- TrustGraph: ontology/context graph framing.
- Aider/RepoMapper: tree-sitter context ranking.
- Letta: agent memory and self-managed context.
- Microsoft GraphRAG/LightRAG: cost and retrieval patterns.

## Bottom Line

The research supports Decantr's typed-graph direction, but changes the implementation order:

- Add competitive research and ADRs before implementation.
- Make temporal snapshots and provenance Phase 1 work.
- Treat storage as an explicit decision, not a hidden assumption.
- Use tree-sitter for code graph extraction.
- Position Decantr against memory and code-search tools as external UI governance.

The category is still open. The risk is not that Decantr is pointed in the wrong direction. The risk is spending the reset on generic graph infrastructure instead of shipping the narrow governance loop: contract, context, evidence, repair.
