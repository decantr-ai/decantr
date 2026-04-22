# Task Context: Modifying Code

**Enforcement Tier: Strict**

## Primary Compiled Contract

- Start with `.decantr/context/mutation-modify-pack.md` for the strict modification workflow contract.
- Start with `decantr_get_page_context` or the matching `.decantr/context/page-*-pack.md` file for the route you are editing.
- Use `decantr_get_section_context` when you need the richer section contract behind that route.
- If a change would alter route identity, shell identity, theme identity, or pattern contract, update the essence first and then refresh the packs.

## Current Route Topology

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

### Page Packs

- 13 compiled references available. Use `.decantr/context/pack-manifest.json` to resolve the exact files for this scope.

## Strict Workflow

1. Identify the target page and read its compiled page pack first.
2. Compare the planned edit against the compiled route, shell, and pattern contract.
3. If the edit changes that contract, stop and update the essence before writing code.
4. Run `npx @decantr/cli validate` and `npx @decantr/cli check` after the modification.

## Strict Checks

- [error] Routes and page IDs match the compiled topology.
- [error] The declared shell contract is preserved unless the task explicitly mutates it.
- [warn] Theme identity and mode remain consistent across scaffolded routes.
- [error] The page you modify must already exist in the compiled topology.
- [error] Pattern order and shell usage should stay aligned with the page pack unless the essence changes first.
- [warn] Use section context only as supporting detail; the page pack is the primary contract for route-local work.

---

*Task context generated from Decantr execution packs*