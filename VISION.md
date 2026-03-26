# Decantr Vision

**v0/Bolt/Lovable race to generate code faster. Decantr generates code better.**

---

## What Decantr Is

Decantr is a **design intelligence layer** for AI-generated web applications. It provides:

1. **A structured methodology** — the Essence Pipeline (POUR > TASTE > SETTLE > CLARIFY > DECANT > SERVE > AGE) that transforms natural language intent into validated, coherent design specifications
2. **A machine-readable schema** — the Essence file (`decantr.essence.json`) that captures UI architecture intent in a framework-agnostic format, like OpenAPI but for UI
3. **A registry of reusable building blocks** — patterns, archetypes, and recipes that encode proven UI solutions
4. **Pluggable generators** — that output production-quality code for any framework from the same Essence file

## The Diamond

The core intellectual property is the **process**, not the runtime:

- **Essence Spec** — a validated schema for design intent
- **Guard Rules** — drift prevention that keeps generated code coherent as it evolves
- **Cross-Pattern Wiring** — patterns that automatically communicate when composed on the same page
- **Registry** — a content ecosystem where patterns describe intent, and generators resolve to target frameworks
- **Density System** — character traits that compute spatial relationships, so "professional" and "playful" actually look different

These work with **any** output framework. React, Vue, Svelte, or Decantr's own native runtime.

## The Positioning

AI code generation today has a quality problem. Every generation is a dice roll on design coherence. There's no structured way to:

- Capture design intent in a machine-readable format
- Ensure generated code follows a coherent design language
- Reuse proven UI patterns across projects and frameworks
- Prevent drift as the app evolves through iterative AI prompts
- Target different frameworks from the same design specification

Decantr solves all five. It's not another framework trying to replace React — it's the layer that makes AI-generated React (or Vue, or Svelte) actually good.

## Who It's For

**Primary — day one:**
- **Solo devs and indie hackers** who want idea-to-app in 30 minutes with AI, but want the result to actually look and work well
- **Engineering teams** using React/Vue + Tailwind where AI-generated code is inconsistent and needs governance

**Secondary — follows naturally:**
- **AI-first agencies** scaffolding multiple client projects per month who need design consistency
- **Enterprise teams** who need private pattern registries, design governance, and audit trails

## Architecture

```
Layer 1: The Spec (Open Standard)
  Essence schema — framework-agnostic design intent
  JSON Schema — validatable, versionable, machine-readable
  Guard rules — drift prevention
  Registry format — how patterns/archetypes/recipes are described

Layer 2: The Toolchain (Open Source)
  CLI — npx decantr init/generate/validate/registry
  Essence Pipeline — structured intent-to-code methodology
  Generator plugin system — pluggable output targets
  MCP server — embeds Decantr into Claude Code, Cursor, etc.
  Registry client — install/publish community content

Layer 3: Generators (Pluggable Output)
  generator-decantr — native runtime, zero-config, best fidelity
  generator-react — React 19 + Tailwind v4 + shadcn/ui
  generator-vue — (planned)
  generator-svelte — (planned)
```

## Guiding Principles

1. **Process over runtime.** The Essence Pipeline is the product. Generators are distribution channels.

2. **Framework-agnostic by default.** Every schema, every pattern definition, every registry entry must work across all targets. Framework-specific code lives only inside generator plugins.

3. **Quality over speed.** We don't compete on generation speed. We compete on generation quality — coherent design, validated constraints, spatial intelligence, cross-pattern wiring.

4. **Open spec, open toolchain.** The Essence schema and CLI are open source. Monetization comes from the enterprise layer (private registries, team governance, CI/CD integration), not from locking down the core.

5. **Content is king.** The registry of patterns, archetypes, and recipes is the network effect. Make it easy to create, validate, and publish content. The more content, the more value.

6. **Guard everything.** Drift is the enemy of AI-generated code. Guard rules aren't optional — they're what makes Decantr-generated code better than raw AI output on iteration 2, 3, and 10.

7. **Composition over inheritance.** Archetypes compose into vignettes. Patterns compose into pages. Recipes compose with styles. No inheritance chains, no monolithic templates.

## Revenue Path

| Tier | What | Who |
|------|------|-----|
| **Free (Open Source)** | CLI, all generators, community registry, MCP server, guard validation | Everyone |
| **Team** | Private registry, guard dashboard, CI/CD GitHub Action, drift reports | Startups, agencies |
| **Enterprise** | SSO/RBAC, audit trail, custom generators, on-prem registry, SLA | Large orgs |

## The North Star

A developer opens their terminal, runs `npx decantr init`, describes what they want in natural language, and gets a production-quality app that:

- Looks intentionally designed, not like AI slop
- Works with their preferred framework (React, Vue, or native Decantr)
- Stays coherent as they iterate with AI assistance
- Uses proven patterns from a community registry
- Can be governed by their team's design standards

That's the product. Everything else is in service of making that experience real.
