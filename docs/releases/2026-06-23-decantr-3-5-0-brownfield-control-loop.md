# Decantr 3.5.0 Brownfield Control Loop

Decantr 3.5.0 turns the Contract / Context / Evidence foundation into a local Brownfield control loop: inspect, prepare task context, edit with authority visible, verify, resolve drift, repair, and repeat.

## What Shipped

- v2 Project Health, CI, Workspace Health, Evidence Bundle, runtime probe, authority resolution, loop readiness, and proof-field report contracts.
- `decantr task` now emits a v2 loop block with maker/checker instructions, authority summary, graph impact, stop conditions, and the verify command.
- `decantr resolve` gives a read-only authority resolver for source-vs-contract conflicts, with explicit drift-log actions and no hidden source mutation path.
- Studio is now a local Control Room with loop state, authority, graph impact, evidence, repairs, route task previews, and proof report summaries.
- Typed graph ranking now blends weighted traversal with deterministic local personalized PageRank and task boosts.
- MCP keeps the eight consolidated tools while task, evidence, workspace health, and health-loop actions return v2 loop/evidence structures.
- The proof harness now emits v2 proof-field reports and supports marker-based mutations plus committed proof-corpus fixtures.

## Package Wave

This release bumps and publishes:

- `@decantr/core@3.5.0`
- `@decantr/verifier@3.5.0`
- `@decantr/mcp-server@3.5.0`
- `@decantr/cli@3.5.0`

Essence V4 is unchanged. No hosted upload expansion, telemetry expansion, automatic Studio launch, generic hidden mutation path, or autonomous agent runner was added.

## Migration Notes

Consumers should branch on `$schema` and update Project Health, CI, Workspace Health, and Evidence Bundle integrations to the v2 report URLs. Stored v1 health/evidence artifacts remain valid historical references, but 3.5 default commands emit v2.

MCP integrations should continue using the eight consolidated tools and prefer:

- `decantr_context` with `{ "action": "task" }`
- `decantr_verify` with `{ "action": "evidence_bundle" }`
- `decantr_repair` with `{ "action": "health_loop" }`

`decantr_contract_write` remains the explicit MCP write surface.
