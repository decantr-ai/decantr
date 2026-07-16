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
7. `decantr_repair` with `{ "action": "health_loop" }`
8. `decantr_project` with `{ "action": "workspace_health" }` for monorepos

This keeps the assistant grounded in the adopted app contract, route-local context, active authority lane, typed graph anchors, stable diagnostic codes, and repairable evidence before it edits source.

## What Changes From Older Prompts

Older prompts often started with registry or essence generation tools:

- `decantr_create_essence`
- `decantr_resolve_archetype`
- `decantr_resolve_pattern`
- `decantr_check_drift`
- broad `decantr_audit_project` calls without project state

In Decantr 3.4 and later these direct names are no longer callable. Use the migration table below to route the same behavior through the eight consolidated tools. For existing apps, first discover the project state, then prepare task context for the route and task at hand.

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

`decantr_context` with `action: "task"` requires current graph artifacts and leads its read targets with the discovered route implementation source. The default `detail: "compact"` response preserves authority, ranking summaries, local law, impact, stop conditions, and verify command while omitting full node/edge arrays and bounding large context lists. Use `detail: "full"` only for diagnostic clients that need the expanded payload. Both modes return `response_detail`.

## Contract Capsule Use

Agents should load `decantr_contract` with `action: "capsule"` once per session when `.decantr/graph/contract-capsule.json` exists. The capsule is cache-friendly and includes bounded SourceArtifact path handles. Follow-up file-impact questions should use those handles with `decantr_graph` actions instead of asking the assistant to reread the whole repo.

## Evidence And Repair

After an edit or failed check:

- use `decantr_repair` with `action: "findings"` to filter by code, severity, source, or category
- use `decantr_repair` with `action: "repair_plan"` for structured repair actions, graph anchors, read targets, preserve/avoid constraints, and rerun commands
- use `decantr_repair` with `action: "health_loop"` for the shared v2 loop verdict, authority resolution, and evidence tier
- use `decantr_verify` with `action: "evidence_bundle"` for the privacy-redacted v2 artifact that can be saved in CI or used by a dashboard

The v2 Project Health, Evidence Bundle, runtime probe, authority resolution, and loop-readiness schemas are the active 3.5 payloads for MCP loop integrations. See [Report Schemas](report-schemas.md).

## Security Boundary

The MCP server reads Decantr contract, context, graph, and selected project files under the active workspace root. Write tools remain explicit and path-contained. Hosted critique and audit upload fallbacks are retired in Decantr 3.8; `allow_hosted_upload` remains a compatibility option but does not activate removed API routes. Local Project Health, graph context, and Evidence Bundle generation remain useful without hosted upload.

## Compatibility Policy

Decantr 3.4 intentionally removed the older direct MCP tool names from the advertised and callable surface. The supported 3.5 contract remains the eight consolidated tools plus explicit `action` routing, with v2 loop/evidence payloads on task, evidence, workspace health, and health-loop actions. Future Decantr 3 releases may add actions compatibly, but the legacy direct names should be treated as migrated, not hidden compatibility entry points.
