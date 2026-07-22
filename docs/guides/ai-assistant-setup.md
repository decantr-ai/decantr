# Decantr With AI Coding Assistants

Decantr is agent-neutral. The coding assistant still reads source, edits files, runs tools, and explains the result. Published 3.9.4 adds route-backed task context and local evidence. The unreleased 3.10 candidate organizes that work as:

**Observe -> Prepare -> Verify -> Report**

**Release status:** 3.9.4 is published stable. 3.10 is an active proof program and is not released or value-proven.

## Minimal CLI Workflow

Attach an existing app once:

```bash
npx @decantr/cli scan
npx @decantr/cli adopt --yes
```

For each UI change:

```bash
npx @decantr/cli task /feed "improve loading and saved-item behavior"
# Let the assistant edit with its normal tools.
npx @decantr/cli verify
```

For a monorepo, keep the selected app explicit in every command:

```bash
pnpm exec decantr task /feed "improve loading and saved-item behavior" --project apps/web
pnpm exec decantr verify --project apps/web
```

The current 3.9.4 task contract is primarily route-backed. Confirm that its first implementation source is the real production target before the assistant edits. If Decantr reports stale, missing, conflicting, or unsupported authority, stop and resolve the evidence rather than asking the model to guess.

## MCP Server

Run the published server with any MCP-compatible client:

```bash
npx @decantr/mcp-server@3.9.4
```

Decantr 3.x preserves exactly eight public tools:

| Tool | Role |
| --- | --- |
| `decantr_project` | Selected project state and adoption evidence |
| `decantr_contract` | Contract reads and task-capsule compatibility actions |
| `decantr_context` | Scoped context, including route-backed task preparation |
| `decantr_graph` | Graph metadata, source, route, history, and impact reads |
| `decantr_registry` | Compatibility content/reference reads backed by `@decantr/content` |
| `decantr_verify` | Local verification and evidence actions |
| `decantr_repair` | Evidence-backed repair prompts |
| `decantr_contract_write` | Explicit, annotated contract writes |

There is no ninth content tool in 3.x. `decantr_registry` is a stable compatibility identity, not a public marketplace.

Before a current route change, call `decantr_context` with a task action:

```json
{
  "action": "task",
  "route": "/feed",
  "task": "improve loading and saved-item behavior",
  "project_path": "apps/web"
}
```

Use the compact response by default. Request expanded graph diagnostics only when the task needs them. The assistant should read the ranked production target, authority, limitations, and stop conditions, then run the returned verification command after editing.

## Keep Agent Instructions Small

Repository-native instructions remain authoritative. Decantr should add one minimal bridge only when the user asks for automatic task activation.

Avoid creating overlapping copies across:

- `AGENTS.md`;
- `CLAUDE.md`;
- Cursor rules;
- editor-specific instruction files;
- generated Decantr guidance;
- personal skills or model memory.

Duplicate rule sets increase token cost and can conflict. A bridge should say when to request Decantr task context, how to respect a blocked result, and which verify command to run. It should not restate the entire project or Decantr manual.

Cursor's existing compatibility helper remains available:

```bash
pnpm exec decantr connect cursor --project apps/web --preview
pnpm exec decantr connect cursor --project apps/web
```

Review the preview. Preserve unrelated MCP servers and project rules.

## Authority Order

The assistant should use this order unless the project deliberately records another decision:

1. Brownfield production source, build configuration, runtime providers, and package exports for the selected target;
2. scoped project-owned supporting evidence such as tests, Storybook, design tokens, and runtime artifacts;
3. reviewed project-local rules or style mappings;
4. an explicitly accepted Essence contract as project law beneath production source;
5. official Decantr content as advisory vocabulary.

An installed package is not authority by itself. A test URL is not a production route. A story can be valid component-state evidence without becoming an application route. In Brownfield, Essence expresses accepted intent but does not override contradictory production behavior silently. When evidence conflicts, report the conflict instead of choosing the most convenient file.

## 3.10 UI-Surface Direction

The active 3.10 program expands the authority model from route-first context to routes, layouts, components, stories, overlays, flows, packages, and runtime states.

Readiness is evaluated independently across selected-app authority, surface authority, topology completeness, taskability, component inventory, styling authority, and runtime evidence. The intended primary states are `ready`, `limited`, `blocked`, and `unsupported`.

This is intended 3.10 behavior. Until a qualified release ships, do not tell an assistant that 3.9.4 can prepare every non-route surface or that an aggregate confidence score proves taskability.

## Verify With The Project's Tools

Decantr verification complements the host stack:

```bash
pnpm exec decantr verify --project apps/web
pnpm test
pnpm build
```

Use local browser evidence when the app is already running:

```bash
pnpm exec decantr verify --project apps/web \
  --base-url http://localhost:3000 \
  --evidence
```

Keep project-owned linting, type checks, tests, Storybook, visual regression, Playwright, axe, and manual accessibility review. Decantr must not claim runtime or visual behavior from a static file alone.

If source and Decantr context disagree, use the advanced resolver rather than allowing the assistant to invent an authority decision:

```bash
pnpm exec decantr resolve --project apps/web
```

## CI Is The Durable Boundary

Local agents can ignore instructions. Make verification a required CI check:

```bash
pnpm exec decantr ci init --project apps/web
```

3.9.4 keeps CI v2 as the default. Explicit CI v3 remains available for existing proof contracts, but missing or incompatible evidence must stay `not_proven` rather than becoming a clean pass.

## Privacy And Network Behavior

- Source scanning and verification are local.
- Hosted source upload is retired.
- Browser evidence stays local unless the user moves it.
- A hosted account is unnecessary.
- The optional content API supplies reference material, not project authority.
- Telemetry has no Decantr-hosted default endpoint.
- MCP write tools remain explicit and workspace-contained.

## Advanced Compatibility Surfaces

Greenfield blueprints, themes, broad content workflows, Studio, showcase, telemetry, registry-named commands, and explicit `@decantr/css` adoption remain callable where shipped. They are not part of the normal assistant loop or active 3.10 investment.

## Proof Status

Decantr has not yet proven that this workflow materially improves frontier-model UI changes. The active [3.10 program](../programs/2026-07-22-decantr-3-10-ui-change-control-proof.md) compares a repository-native control with an information-equivalent Decantr treatment over 320 isolated runs. The [3.9.4 Day-0 baseline](../benchmarks/2026-07-22-decantr-3-9-4-day-zero.md) is diagnostic evidence, not a correctness or value score.

See also: [Existing apps](existing-apps.md), [Workflow model](../reference/workflow-model.md), [Command surface](../reference/command-surface.md), and [Project Health CI](project-health-ci.md).
