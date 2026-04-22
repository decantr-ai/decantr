# Blueprint Content Contract Checklist

Date: 2026-04-22
Status: Active

## Purpose

This checklist exists to answer one question before we blame the Decantr compiler, prompt surface, or verifier:

> Does the blueprint content chain itself give the scaffold enough information to succeed?

The audit order should be:

1. Validate `decantr-content`.
2. Audit the blueprint chain.
3. Review the compiled scaffold/section/page packs.
4. Only then attribute remaining gaps to CLI/compiler/prompt/verifier behavior.

This prevents us from calling a content-quality failure a compiler failure, and prevents us from patching the wrong layer.

## Audit Scope

For a given blueprint, inspect:

- the blueprint
- every composed archetype
- every route target
- every referenced shell
- every route-driving pattern
- the selected theme

## Checklist

### 1. Blueprint Contract

- Theme exists and is appropriate for the blueprint personality.
- Voice exists and is specific enough to shape UI tone, CTA language, empty states, and loading states.
- Navigation intent is concrete:
  - command palette declared or intentionally omitted
  - hotkeys declared with explicit bindings and route/action targets
- Route map is complete and every route points to a real archetype page.
- Suggested themes are present when the blueprint can legitimately support multiple visual treatments.

### 2. Archetype Contract

- Every route-serving page has a page brief.
- Archetype page shells align with blueprint route shell assignments.
- Every page has real default layout/pattern references.
- Feature scopes are present and believable for the archetype.
- Suggested theme data exists where the archetype depends on a strong visual mode.

### 3. Pattern Contract

For every pattern used directly by the archetype pages:

- `visual_brief` exists
- `responsive` guidance exists
- `accessibility` guidance exists or the omission is explicitly acceptable
- `motion` guidance exists when the pattern meaningfully depends on animation
- `layout_hints` exists when the pattern is easy to mis-implement spatially

Scaffold-critical patterns should not rely on a one-line description alone.

### 4. Shell Contract

- `internal_layout` exists and clearly defines scroll ownership, spacing, and primary regions.
- Shell guidance includes enough rhythm detail that pages do not need to invent their own padding or centering rules.
- Shell examples do not mislead the target framework.
- If one shell spans multiple roles or archetypes, confirm that it is intentionally broad rather than semantically overloaded.

### 5. Theme Contract

- Decorator surface exists and is non-trivial.
- Theme motion guidance exists when the personality depends on animation.
- If decorators are only described semantically, note that the compiler/runtime must provide canonical implementations.

### 6. Pack Delivery Review

- Scaffold pack exposes the route map, shell names, theme, and features clearly.
- Section/page packs preserve the local pattern contract without ambiguity.
- Navigation details are surfaced strongly enough to implement, not merely acknowledge.
- Generated docs do not create contradictions between shell-owned rhythm and page-owned wrappers.

### 7. Attribution Decision

Only after the above review should we classify the failure:

- `content debt`
- `compiler / pack generation debt`
- `prompt / instruction debt`
- `verifier / enforcement debt`
- `builder non-compliance`

Many failures are mixed; the point of the checklist is to identify the dominant source of truth that needs repair first.
