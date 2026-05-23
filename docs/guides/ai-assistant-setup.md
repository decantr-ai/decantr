# Decantr With AI Coding Assistants

Decantr gives AI coding assistants a contract, scoped context, optional certified vocabulary, and verification commands. The assistant still writes the code; Decantr gives it better inputs and a way to check drift.

## MCP Server

Use the MCP server when your editor or agent supports MCP tools:

```bash
npx @decantr/mcp-server
```

The MCP server exposes Decantr tools for essence reads, vocabulary search, pattern resolution, execution-pack access, critique, project audit, and Brownfield/Hybrid task-time context. It works with MCP-compatible assistants such as Claude Desktop, Cursor, Windsurf, VS Code agent mode, Zed, and Continue.dev.

For an existing app, ask the assistant to call `decantr_prepare_task_context` before editing a route. Provide the route and the task, for example `{ "route": "/feed", "task": "improve the recipe feed loading and card layout" }`. The tool returns the route, section, page pack excerpt, directives, patterns, shared components, visual target, theme inventory, health continuity evidence, local screenshot references, accepted local law, accepted style bridge mappings, and an authority block when available. The authority block tells the assistant whether the route is Brownfield contract-only, Hybrid local law, style bridge, Decantr CSS, Hybrid composition, or Greenfield, plus warnings for cross-runtime or Decantr CSS requests.

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
- `.decantr/local-patterns.json`: optional project-owned Brownfield/Hybrid UI standards after `decantr codify --accept`.
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

That output points to `.decantr/brownfield-intelligence.json`, `.decantr/theme-inventory.json`, `.decantr/enrichment-backlog.md`, matching page/section packs, local screenshots, accepted local patterns, accepted local rules, changed files, impacted routes, and active authority when present. After the assistant edits code, run:

```bash
npx @decantr/cli verify --brownfield --local-patterns
pnpm exec decantr verify --brownfield --local-patterns --project apps/web
```

For discovery prompts such as "standardize all buttons/cards on this page", ask the assistant to run `decantr suggest "button card" --from-code --file src/App.tsx` from the app root, or add `--project apps/web` from a monorepo root. Accepted local patterns are shown before registry patterns so the assistant starts from project-owned law. If a hosted registry pattern is useful vocabulary, map it first with `decantr codify --map-pattern <slug>`; that creates an advisory local-law proposal and does not change source.

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

When Hybrid local law is active, `decantr ci` prints `.decantr/rules.json` findings with file and line evidence. When a style bridge is active, the same report includes bridge status, mapping count, styling approach, and theme modes so assistants can see the project-owned styling lane in automation output. The output distinguishes enforceable accepted local rules from advisory style-bridge or hosted-pattern mappings. Keep `--fail-on error` while the team is still tuning warnings; switch to `--fail-on warn` when those warnings should block pull requests.

See also: [MCP package](https://www.npmjs.com/package/@decantr/mcp-server), [Workflow Model](../reference/workflow-model.md), [Monorepos](monorepos.md), [Project Health CI](project-health-ci.md).
