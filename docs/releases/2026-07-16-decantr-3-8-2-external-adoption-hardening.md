# Decantr 3.8.2 External Adoption Hardening

Decantr 3.8.2 hardens the governance loop against three clean external adoption trials: a TanStack Start dashboard, the nested React/Vite app in Bulletproof React, and a new TanStack Start Greenfield host. It does not change Essence V4 or the consolidated eight-tool MCP identity.

## Highlights

- Shared source discovery now resolves formal TanStack, nested React Router, and Vue Router declarations with calibrated confidence, lazy implementation provenance, generated-tree exclusion, and repository-level assistant-rule inheritance.
- Greenfield initialization writes an immediately usable typed graph and keeps contract-only prompts, assistant bridges, authority ordering, verification commands, and styling guidance free of Brownfield or Decantr CSS assumptions.
- `decantr task` requires a current graph, leads with the discovered route implementation, reports changed-route impact, emits structured remediation, and exits nonzero when activation is blocked.
- Brownfield CI records inherited findings but gates only new findings against the saved baseline.
- Codify acceptance requires explicit reviewed confirmation; style-bridge activation requires a second explicit acceptance flag.
- Prettier and Oxfmt ignore boundaries protect host formatting from generated Decantr artifacts.
- MCP task context remains compatible with the existing eight tools and is compact by default, with full detail available explicitly.
- Auth, feature, and production-source detection use stronger semantic evidence to reduce false registry, callback, and logout findings.

## External Evidence

- TanStack Start dashboard: 22 source routes, source-accurate task context, baseline CI, Oxfmt, and production build passed.
- Bulletproof React nested app: 8 routes, inherited root assistant authority, baseline CI, lint, production build, and runtime smoke passed.
- TanStack Start Greenfield host: contract-only initialization, initial graph, route task activation, production build, and runtime smoke passed without adding formatter diagnostics.

The complete fixture commits, commands, blocker disposition, and residual risks are recorded in [`docs/audit/2026-07-10-external-adoption-hardening.md`](../audit/2026-07-10-external-adoption-hardening.md).

## Package Wave

- `@decantr/core@3.8.2`
- `@decantr/verifier@3.8.2`
- `@decantr/mcp-server@3.8.2`
- `@decantr/cli@3.8.2`

`@decantr/content`, `@decantr/essence-spec`, `@decantr/registry`, `@decantr/css`, and `@decantr/telemetry` remain at 3.8.1 because their package code did not change. `@decantr/vite-plugin` remains experimental at 0.1.1.

## Compatibility

The MCP package and directory identities, stdio transport, and eight tool names are unchanged. `@decantr/registry`, `decantr registry ...`, `REGISTRY_URL`, and MCP `decantr_registry` remain 3.x compatibility names. `@decantr/css` remains an explicit legacy adapter rather than a default adoption path.

Task scripts that previously ignored missing or stale graph state should account for the corrected nonzero exit status. Codify scripts must now record reviewed acceptance explicitly before changing project-owned governance state.

## Upgrade

```bash
npm install -D @decantr/cli@3.8.2
npm install @decantr/mcp-server@3.8.2
```

Direct consumers of graph or verification primitives should upgrade `@decantr/core` and `@decantr/verifier` together.
