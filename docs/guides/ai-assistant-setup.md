# Decantr With AI Coding Assistants

Decantr gives AI coding assistants a contract, scoped context, optional certified vocabulary, and verification commands. The assistant still writes the code; Decantr gives it better inputs and a way to check drift.

## MCP Server

Use the MCP server when your editor or agent supports MCP tools:

```bash
npx @decantr/mcp-server
```

The MCP server exposes exactly eight consolidated tools: `decantr_project`, `decantr_contract`, `decantr_context`, `decantr_graph`, `decantr_registry`, `decantr_verify`, `decantr_repair`, and `decantr_contract_write`. `decantr_registry` is a compatibility name backed by `@decantr/content`; Decantr 3.x does not add a ninth content tool. The server works with MCP-compatible assistants such as Claude Desktop, Cursor, Windsurf, VS Code agent mode, Zed, and Continue.dev.

For an existing app, ask the assistant to call `decantr_context` with `{ "action": "task" }` before editing a route. Provide the route and task, for example `{ "action": "task", "route": "/feed", "task": "improve the recipe feed loading and card layout" }`. Task activation requires a current typed graph and adapts one verifier-built `TaskCapsuleV1` into the existing response fields. The discovered implementation file is the required rank-one read target; project identity, graph freshness, authority, changed-file impact, stable findings, content identity/digest provenance, stop conditions, and one verify command stay explicit. The default canonical capsule is bounded to 12,000 UTF-8 bytes and 4,000 deterministic estimated tokens. Pass `"detail": "full"` only when the client needs expanded diagnostic graph/context payloads outside that default capsule budget.

`decantr_project` with `{ "action": "state" }` also exposes `adoption_truth`. It uses the same `AdoptionTruthV1` builder as CLI, CI v3, and Studio, so agents can inspect selected-app provenance and limitations without inventing editor-specific discovery rules.

## Cursor

Cursor is the paved editor path. From the workspace you open in Cursor, run:

```bash
npx @decantr/cli connect cursor
```

From a monorepo root, keep the app explicit:

```bash
pnpm exec decantr connect cursor --project apps/web
```

The command writes `.cursor/mcp.json` and `.cursor/rules/decantr.mdc`, preserving existing MCP servers. Use `--preview` first if you want to inspect the exact files. The generated rule tells Cursor Agent to call `decantr_context` with `{ "action": "task" }` before route edits, use the returned authority and stop conditions, run the verify command returned by task context, and report drift instead of guessing when runtime source and Decantr context disagree.

## CLI Context

Use the CLI when you want files in the project that any assistant can read:

```bash
npx @decantr/cli new my-app --blueprint=agent-marketplace
# or, for an existing app
npx @decantr/cli adopt --yes
# from a monorepo root
pnpm exec decantr adopt --project apps/web --yes
pnpm exec decantr doctor --project apps/web
```

The important files are:

- `DECANTR.md`: project method, guard rules, CSS approach, and workflow.
- `decantr.essence.json`: the durable product and design contract.
- `.decantr/context/scaffold.md`: app topology, route map, voice, and shared components.
- `.decantr/context/section-*.md`: focused section/page implementation contracts.
- `.decantr/local-patterns.json`: optional project-owned Brownfield/Hybrid UI standards after `decantr codify --accept --confirm-reviewed`, including app-owned `behavior_obligations` when present.
- `.decantr/rules.json`: optional project-owned Brownfield/Hybrid rule checks after the same reviewed acceptance command.
- `.decantr/style-bridge.json`: optional Hybrid mapping activated only with `decantr codify --accept --confirm-reviewed --accept-style-bridge`.

## Assistant Rule Bridge

For existing rule files, preview before applying:

```bash
npx @decantr/cli init --assistant-bridge=preview
npx @decantr/cli rules preview
npx @decantr/cli rules apply
```

Rule mutation is always explicit. Preview/apply content follows `.decantr/project.json`: contract-only Greenfield bridges cite Essence, narrative context, and the Contract capsule; corpus-backed Greenfield/Hybrid bridges cite execution packs; Brownfield bridges cite observed analysis/doctrine artifacts and available narrative context. Existing marked blocks are upgraded in place.

CLI-only assistants should use task activation before editing Brownfield routes:

```bash
npx @decantr/cli task /feed "improve the recipe feed loading and card layout"
npx @decantr/cli task /feed "improve the recipe feed loading and card layout" --project apps/web
```

That output starts with the discovered route implementation source and points to matching packs, local screenshots, accepted local patterns, behavior obligations, changed files, impacted routes, active authority, and official-content provenance. JSON preserves its compatibility fields and adds `taskCapsuleVersion: "task-capsule.v1"`; MCP adds `task_capsule_version: "task-capsule.v1"`. It blocks when the typed graph is missing or stale. If behavior obligations appear, preserve them before changing interactive surfaces. After the assistant edits code, run the verify command printed by task context; for a Brownfield app with accepted local law that is typically:

```bash
npx @decantr/cli verify --brownfield --local-patterns
pnpm exec decantr verify --brownfield --local-patterns --project apps/web
```

If `verify` reports `human_resolution_required`, stop the coding loop and run:

```bash
pnpm exec decantr resolve --project apps/web
```

Do not guess whether source or Decantr context wins. The resolver prints the explicit next commands for repairing source, accepting observed source into the contract, codifying local law, updating the style bridge, regenerating graph/context, or deferring a finding to the drift log.

For discovery prompts such as "standardize all buttons/cards on this page", ask the assistant to run `decantr suggest "button card" --from-code --file src/App.tsx` from the app root, or add `--project apps/web` from a monorepo root. Accepted local patterns are shown before official corpus patterns so the assistant starts from project-owned law. If an official corpus pattern is useful vocabulary, map it first with `decantr codify --map-pattern <slug>`; that creates an advisory local-law proposal and does not change source.

When an assistant asks for a Project Health repair prompt from a monorepo root, keep the app path on the prompt command: `decantr health --project apps/web --prompt <finding-id>`.

Use `doctor` when an assistant or teammate is unsure what state the app is in:

```bash
npx @decantr/cli doctor
pnpm exec decantr doctor --project apps/web
```

`doctor` prints adoption truth, the adoption lane, limitations, and the next-step queue. That is the fastest way for an assistant to tell whether it should preserve contract-only source authority, use accepted Hybrid local law, respect a style bridge, or treat explicitly adopted legacy Decantr CSS as active.

Use `ci` for the mandatory automation layer. In monorepos, generate the workflow from the repository root and keep the app path explicit:

```bash
pnpm exec decantr ci init --project apps/web
pnpm exec decantr ci --project apps/web
```

Those commands remain on the v2 CI schema. For Decantr 3.9 governed-change proof, opt in explicitly:

```bash
pnpm exec decantr ci init --project apps/web --report-version v3
pnpm exec decantr ci --project apps/web --since origin/main --report-version v3 --json
```

The generated GitHub v3 workflow runs the pinned local CLI, fetches full Git history, resolves a comparison base, and passes it with `--since`. It embeds `AdoptionTruthV1` and `GovernanceDeltaV1` alongside existing v2 health evidence. Missing or incompatible proof is `not_proven`; package upgrade alone never switches v2 consumers to v3. For Jenkins, Please, Buildkite, GitLab, Azure DevOps, or internal deployment systems, use `decantr ci init --provider generic --project apps/web --report-version v3` and ensure the authoritative pipeline provides the intended Git history/change scope.

When Hybrid local law is active, `decantr ci` prints `.decantr/rules.json` findings with file and line evidence, and Project Health carries accepted behavior-obligation findings with stable codes such as `A11Y010`, `A11Y011`, `INT010`, and `COMP020`. When a style bridge is active, the same v2 report includes bridge status, mapping count, styling approach, theme modes, evidence tier, authority resolution, and loop readiness so assistants can see the project-owned styling lane in automation output. The output distinguishes enforceable accepted local rules and statically verifiable behavior obligations from advisory style-bridge or content-pattern mappings. Keep `--fail-on error` while the team is still tuning warnings; switch to `--fail-on warn` when those warnings should block pull requests.

See also: [MCP package](https://www.npmjs.com/package/@decantr/mcp-server), [Workflow Model](../reference/workflow-model.md), [Monorepos](monorepos.md), [Project Health CI](project-health-ci.md).
