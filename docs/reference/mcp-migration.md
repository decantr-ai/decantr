# Decantr MCP Migration

This guide moves assistant integrations from the older resolver-first Decantr MCP habit into the Decantr 3 Contract / Context / Evidence loop.

## Target Loop

For an existing app, MCP clients should prefer this sequence:

1. `decantr_project` with `{ "action": "state" }`
2. `decantr_context` with `{ "action": "task" }`
3. `decantr_contract` with `{ "action": "capsule" }`
4. `decantr_graph` with `{ "action": "snapshot" }`, `{ "action": "query" }`, or `{ "action": "traverse" }`
5. `decantr_repair` with `{ "action": "findings" }` or `{ "action": "repair_plan" }`
6. `decantr_verify` with `{ "action": "evidence_bundle" }`
7. `decantr_project` with `{ "action": "workspace_health" }` for monorepos

This keeps the assistant grounded in the adopted app contract, route-local context, active authority lane, typed graph anchors, stable diagnostic codes, and repairable evidence before it edits source.

## What Changes From Older Prompts

Older prompts often started with registry or essence generation tools:

- `decantr_create_essence`
- `decantr_resolve_archetype`
- `decantr_resolve_pattern`
- `decantr_check_drift`
- broad `decantr_audit_project` calls without project state

In Decantr 3.4 these direct names are no longer callable. Use the migration table below to route the same behavior through the eight consolidated tools. For existing apps, first discover the project state, then prepare task context for the route and task at hand.

| Older direct tool | 3.4 consolidated call |
| --- | --- |
| `decantr_get_project_state` | `decantr_project` with `{ "action": "state" }` |
| `decantr_workspace_health` | `decantr_project` with `{ "action": "workspace_health" }` |
| `decantr_prepare_task_context` | `decantr_context` with `{ "action": "task" }` |
| `decantr_get_contract_capsule` | `decantr_contract` with `{ "action": "capsule" }` |
| `decantr_get_graph_snapshot` | `decantr_graph` with `{ "action": "snapshot" }` |
| `decantr_query_graph` | `decantr_graph` with `{ "action": "query" }` |
| `decantr_traverse_graph` | `decantr_graph` with `{ "action": "traverse" }` |
| `decantr_get_findings` | `decantr_verify` or `decantr_repair` with `{ "action": "findings" }` |
| `decantr_get_repair_plan` | `decantr_repair` with `{ "action": "repair_plan" }` |
| `decantr_get_repair_prompt` | `decantr_repair` with `{ "action": "repair_prompt" }` |
| `decantr_get_evidence_bundle` | `decantr_verify` with `{ "action": "evidence_bundle" }` |
| `decantr_accept_drift` | `decantr_contract_write` with `{ "action": "accept_drift" }` |
| `decantr_update_essence` | `decantr_contract_write` with `{ "action": "update_essence" }` |

## Brownfield And Hybrid Projects

Use the CLI for adoption and local mutation workflows:

```bash
decantr scan --project apps/web
decantr adopt --project apps/web --yes
decantr codify --from-audit --style-bridge --project apps/web
decantr verify --brownfield --local-patterns --project apps/web
```

Then use MCP for agent-time context:

```json
{
  "action": "task",
  "project_path": "apps/web",
  "route": "/feed",
  "task": "repair the saved recipe action states"
}
```

`decantr_context` with `action: "task"` should return the selected route context, task-ranked graph nodes, accepted local law, behavior obligations, style bridge mappings, changed-file impact when available, and the recommended verification loop.

## Contract Capsule Use

Agents should load `decantr_contract` with `action: "capsule"` once per session when `.decantr/graph/contract-capsule.json` exists. The capsule is cache-friendly and includes bounded SourceArtifact path handles. Follow-up file-impact questions should use those handles with `decantr_graph` actions instead of asking the assistant to reread the whole repo.

## Evidence And Repair

After an edit or failed check:

- use `decantr_repair` with `action: "findings"` to filter by code, severity, source, or category
- use `decantr_repair` with `action: "repair_plan"` for structured repair actions, graph anchors, read targets, preserve/avoid constraints, and rerun commands
- use `decantr_verify` with `action: "evidence_bundle"` for the privacy-redacted artifact that can be saved in CI or used by a dashboard

The v1 Evidence Bundle remains the active emitted payload. The v2 Evidence Bundle and runtime probe schemas are documented in [Report Schemas](report-schemas.md) for the upcoming dashboard/proof-corpus lanes.

## Security Boundary

The MCP server reads Decantr contract, context, graph, and selected project files under the active workspace root. Write tools remain explicit and path-contained. Hosted critique or audit fallbacks must require `allow_hosted_upload: true`; local Project Health, graph context, and Evidence Bundle generation should remain useful without hosted upload.

## Compatibility Policy

Decantr 3.4 intentionally removes the older direct MCP tool names from the advertised and callable surface. The supported 3.4 contract is the eight consolidated tools plus explicit `action` routing. Future Decantr 3 releases may add actions or tools compatibly, but the legacy direct names should be treated as migrated, not hidden compatibility entry points.
