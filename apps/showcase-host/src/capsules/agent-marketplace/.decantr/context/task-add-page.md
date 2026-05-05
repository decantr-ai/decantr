# Task Context: Adding Pages

**Enforcement Tier: Guided**

## Primary Compiled Contract

- Start with `.decantr/context/mutation-add-page-pack.md` for the add-page workflow contract.
- Use `.decantr/context/scaffold-pack.md` for the current route, shell, and theme contract.
- Use `.decantr/context/pack-manifest.json` to choose the target section before you add a route.
- After updating the essence, run `npx @decantr/cli refresh` so the new section/page packs exist before code generation.

## Current Scaffold Contract

- Target: `react-vite` (react)
- Shell: `sidebar-main`
- Theme: `carbon-neon` (dark)
- Existing routes: 13

## Existing Routes

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

## Required Workflow

1. Add the new page to the essence before generating any code.
2. Keep the new page inside a declared section and shell contract.
3. Refresh derived files so Decantr recompiles the section and page packs.
4. Read the relevant section pack and the new page pack before implementation.

## Guided Checks

- [error] Theme identity remains `carbon-neon` until the essence changes.
- [error] The new page exists in the essence before code generation begins.
- [error] New layouts only use registry-backed patterns.
- [warn] New routes should fit the current shell and section topology instead of creating off-contract filler pages.

---

*Task context generated from Decantr execution packs*