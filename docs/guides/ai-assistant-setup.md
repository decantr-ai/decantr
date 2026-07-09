# Decantr With AI Coding Assistants

Decantr gives AI coding assistants a contract, scoped context, optional certified vocabulary, and verification commands. The assistant still writes the code; Decantr gives it better inputs and a way to check drift.

## MCP Server

Use the MCP server when your editor or agent supports MCP tools:

```bash
npx @decantr/mcp-server
```

The MCP server exposes the eight consolidated Decantr tools for essence reads, vocabulary search, pattern resolution, execution-pack access, critique, project audit, v2 evidence bundles, health-loop guidance, and Brownfield/Hybrid task-time context. It works with MCP-compatible assistants such as Claude Desktop, Cursor, Windsurf, VS Code agent mode, Zed, and Continue.dev.

For an existing app, ask the assistant to call `decantr_context` with `{ "action": "task" }` before editing a route. Provide the route and the task, for example `{ "action": "task", "route": "/feed", "task": "improve the recipe feed loading and card layout" }`. The tool returns the route, section, page pack excerpt, directives, patterns, shared components, visual target, theme inventory, health continuity evidence, local screenshot references, accepted local law, accepted `behavior_obligations`, accepted style bridge mappings, an authority block, and a v2 loop block with maker/checker instructions, stop conditions, graph impact, and the verify command. The authority block tells the assistant whether the route is Brownfield contract-only, Hybrid local law, style bridge, Decantr CSS, Hybrid composition, or Greenfield, plus warnings for cross-runtime or Decantr CSS requests.

## Cursor

Cursor is the paved editor path. From the workspace you open in Cursor, run:

```bash
npx @decantr/cli connect cursor
```

From a monorepo root, keep the app explicit:

```bash
pnpm exec decantr connect cursor --project apps/web
```

The command writes `.cursor/mcp.json` and `.cursor/rules/decantr.mdc`, preserving existing MCP servers. Use `--preview` first if you want to inspect the exact files. The generated rule tells Cursor Agent to call `decantr_context` with `{ "action": "task" }` before route edits, use the returned authority and stop conditions, run `decantr verify --brownfield --local-patterns` after edits, and report drift instead of guessing when runtime source and Decantr context disagree.

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
- `.decantr/local-patterns.json`: optional project-owned Brownfield/Hybrid UI standards after `decantr codify --accept`, including app-owned `behavior_obligations` for dialogs, forms, and other interaction contracts when present.
- `.decantr/rules.json`: optional project-owned Brownfield/Hybrid rule checks after `decantr codify --accept`.
- `.decantr/style-bridge.json`: optional Hybrid mapping from Decantr intent to project-owned tokens/classes after `decantr codify --style-bridge` and `decantr codify --accept`.

## Assistant Rule Bridge

For existing rule files, preview before applying:

```bash
npx @decantr/cli init --assistant-bridge=preview
npx @decantr/cli rules preview
npx @decantr/cli rules apply
```

Brownfield init does not mutate rule files unless apply is explicit.

CLI-only assistants should use task activation before editing Brownfield routes:

```bash
npx @decantr/cli task /feed "improve the recipe feed loading and card layout"
npx @decantr/cli task /feed "improve the recipe feed loading and card layout" --project apps/web
```

That output points to `.decantr/brownfield-intelligence.json`, `.decantr/theme-inventory.json`, `.decantr/enrichment-backlog.md`, matching page/section packs, local screenshots, accepted local patterns, behavior obligations, accepted local rules, changed files, impacted routes, and active authority when present. If behavior obligations appear, preserve them before changing dialogs, destructive actions, forms, labels, validation, menus, or other interactive surfaces. After the assistant edits code, run:

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

`doctor` prints the adoption lane and next-step queue. That is the fastest way for an assistant to tell whether it should preserve contract-only source authority, use accepted Hybrid local law, respect a style bridge, or treat Decantr CSS as active.

Use `ci` for the mandatory automation layer. In monorepos, generate the workflow from the repository root and keep the app path explicit:

```bash
pnpm exec decantr ci init --project apps/web
pnpm exec decantr ci --project apps/web
```

The generated GitHub workflow runs the pinned local CLI through the detected package manager, such as `pnpm exec decantr ci --project apps/web`. If Decantr is not pinned in the root manifest, `ci init` prints the exact install command before writing the workflow. For Jenkins, Please, Buildkite, GitLab, Azure DevOps, or internal deployment systems, use `decantr ci init --provider generic --project apps/web` and paste the snippet into the authoritative pipeline.

When Hybrid local law is active, `decantr ci` prints `.decantr/rules.json` findings with file and line evidence, and Project Health carries accepted behavior-obligation findings with stable codes such as `A11Y010`, `A11Y011`, `INT010`, and `COMP020`. When a style bridge is active, the same v2 report includes bridge status, mapping count, styling approach, theme modes, evidence tier, authority resolution, and loop readiness so assistants can see the project-owned styling lane in automation output. The output distinguishes enforceable accepted local rules and statically verifiable behavior obligations from advisory style-bridge or content-pattern mappings. Keep `--fail-on error` while the team is still tuning warnings; switch to `--fail-on warn` when those warnings should block pull requests.

See also: [MCP package](https://www.npmjs.com/package/@decantr/mcp-server), [Workflow Model](../reference/workflow-model.md), [Monorepos](monorepos.md), [Project Health CI](project-health-ci.md).
