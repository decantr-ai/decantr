# Task Context: Scaffolding

**Enforcement Tier: Creative** — Guard rules are advisory during initial scaffolding.

## Primary Compiled Contract

- Start with `.decantr/context/scaffold-pack.md` for the compact route, shell, and theme contract.
- Use `.decantr/context/scaffold.md` only as secondary detail when the compiled pack is not enough.
- Read the route-local page packs before building each page so layout and wiring stay aligned with the compiled plan.

## Generate This Application

- Target: `react-vite` (react)
- Shell: `sidebar-main`
- Theme: `carbon-neon` (dark, rounded)
- Routing: `hash`
- Features: agents, monitoring, orchestration, real-time, websockets, auth, mfa, oauth, email-verification, password-reset, pricing-toggle, testimonials, feature-grid, analytics, observability, theme-toggle, command-palette

## Route Plan

- `/agents` -> `agent-overview` [agent-swarm-canvas, agent-timeline]
- `/agents/:id` -> `agent-detail` [agent-timeline, neural-feedback-loop]
- `/agents/config` -> `agent-config` [nav-header, form-sections]
- `/marketplace` -> `agent-marketplace` [hero, generative-card-grid]
- `/login` -> `login` [form]
- `/register` -> `register` [form]
- `/forgot-password` -> `forgot-password` [form]
- `/reset-password` -> `reset-password` [form]
- `/verify-email` -> `verify-email` [form]
- `/` -> `home` [hero, features, how-it-works, pricing, testimonials, cta]
- `/transparency` -> `model-overview` [stats-overview, neural-feedback-loop]
- `/transparency/inference` -> `inference-log` [agent-timeline]
- `/transparency/confidence` -> `confidence-explorer` [intent-radar, stats-overview]

### Section Packs

- Section `agent-orchestrator` -> `.decantr/context/section-agent-orchestrator-pack.md`
- Section `auth-full` -> `.decantr/context/section-auth-full-pack.md`
- Section `marketing-saas` -> `.decantr/context/section-marketing-saas-pack.md`
- Section `ai-transparency` -> `.decantr/context/section-ai-transparency-pack.md`

### Page Packs

- 13 compiled references available. Use `.decantr/context/pack-manifest.json` to resolve the exact files for this scope.

## Success Checks

- [error] Routes and page IDs match the compiled topology.
- [error] The declared shell contract is preserved unless the task explicitly mutates it.
- [warn] Theme identity and mode remain consistent across scaffolded routes.

## Token Budget

- Target: 1400 tokens
- Max: 2200 tokens
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.

Post-scaffold enforcement mode: **STRICT**.

---

*Task context generated from Decantr execution packs*