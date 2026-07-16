# Section: custom

**Role:** primary | **Shell:** observed-existing-shell | **Archetype:** custom
**Description:** custom primary section

## Quick Start

**Shell:** observed-existing-shell shell
**Pages:** 1 (observed-app)
**Density:** comfortable

## Theme Reference

**Theme:** existing (auto) · **Density:** comfortable

Theme intent and density constraints live in `DECANTR.md` (project root). Translate them through the project-owned styling system unless a DNA override above changes density.

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn


Usage: implement this section through the app's existing styling authority (design-system components, Tailwind/Sass/theme tokens, CVA variants, or accepted local rules). Do not add `@decantr/css`, `css(...)`, `d-*` treatments, or Decantr token CSS unless adoption mode changes.

---

**Zone:** App (primary) — observed-existing-shell shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Visual Direction

**Personality:** observed brownfield product

## Pages

### observed-app (/)

Layout: existing-surface
