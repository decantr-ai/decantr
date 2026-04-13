# Composition Topology & Intent Propagation Design

**Date:** 2026-03-31
**Status:** Draft
**Author:** David Aimi

---

## Overview

Add a single new primitive — the archetype `role` field — that enables the Decantr system to derive application topology, zone transitions, and behavioral intent automatically. The CLI generates a Composition Topology narrative in DECANTR.md that gives AI code generators the structural and intentional context to wire up flows (auth, navigation, CTAs) without explicit instructions.

### Goals

- AI code generators understand application flow from structure, not verbose wiring instructions
- One new field (`role`) on archetypes; everything else is emergent
- Every package in the ecosystem (content, spec, registry, CLI, MCP) participates cohesively
- Adding a new archetype or blueprint automatically produces correct topology
- The "magic harmony": behavior emerges from composition of simple primitives

### Non-Goals

- Storing topology in the essence.json (topology is always derived, never stored)
- Explicit flow wiring ("on login navigate to /dashboard")
- Changes to DNA, Blueprint, or existing guard rules
- User journey sequencing or analytics funnels

### Design Principles

- **One concept, one home** — role lives on the archetype, nowhere else
- **Emergent behavior** — topology derives from roles + shells, transitions from role pairs + features
- **Scales elegantly** — new archetype = set role, new blueprint = compose, narrative auto-generates
- **Cohesive system** — every package participates

---

## Architecture

### The Archetype `role` Field

A new required field on the archetype schema. Four values:

| Role | Meaning | Zone Behavior | Shell Pattern |
|------|---------|---------------|---------------|
| `primary` | Core experience — why the app exists | Authenticated, persistent nav, the "home" | App-specific (sidebar, chat-portal, etc.) |
| `gateway` | Controls access — a transition point | Isolated from app chrome, completes then redirects | centered, minimal |
| `public` | Anonymous-facing — visible to everyone | No auth required, conversion-oriented | top-nav-footer, full-bleed |
| `auxiliary` | Supporting features within the app | Shares app navigation, secondary to primary | Inherits from primary or its own |

Example on an archetype:
```json
{
  "id": "auth-full",
  "role": "gateway",
  "description": "Complete authentication flow with login, register, ...",
  ...
}
```

Blueprint `compose` entries can override the role in rare cases:
```json
"compose": [
  { "archetype": "auth-full", "role": "primary" }
]
```

Resolution chain: explicit compose override → archetype `role` field → inference from classification (fallback).

### Zone Derivation

The CLI groups composed archetypes by resolved role into zones. No storage — this is computed at `decantr init` time.

```
compose: [ai-chatbot, auth-full, settings-full, marketing-saas, about, contact, legal]

Resolved zones:
  PUBLIC:   [marketing-saas, about-hybrid, contact, legal]   → top-nav-footer
  GATEWAY:  [auth-full]                                       → centered
  APP:      [ai-chatbot (primary), settings-full (auxiliary)] → chat-portal
```

### Transition Derivation

Transitions are derived from role pairs. The semantics are inherent:

| From → To | Transition Type | Meaning |
|-----------|----------------|---------|
| public → gateway | conversion | CTAs lead to auth/signup |
| gateway → app | gate-pass | Successful authentication/payment/onboarding |
| app → gateway | gate-return | Logout, session expiry |
| app → app | navigation | Sidebar, tabs — same zone |
| app → public | external | Footer links, logo |
| public → public | internal | Page links within marketing |

The specific trigger on a gateway transition is refined by the gateway archetype's features:

| Gateway features contain | Trigger refinement |
|-------------------------|-------------------|
| auth, login, mfa | authentication |
| payment, subscription, checkout | payment |
| onboarding, setup-wizard, welcome | onboarding |
| invite, access-code | invitation |

### Intent Propagation

The CLI synthesizes zone purpose from existing archetype data:

| Input | Source | Used For |
|-------|--------|----------|
| Archetype `description` | archetype JSON | Zone purpose text |
| Archetype `role` | archetype JSON | Zone classification |
| Blueprint `personality` | essence.json | Tonal lens across all zones |
| Blueprint `features` | essence.json | Capabilities per zone |
| Shell assignments | composed pages | Zone boundaries |

### Generated Output: Composition Topology Section

The CLI generates a new `## Composition Topology` section in DECANTR.md:

```markdown
## Composition Topology

**Intent:** Professional AI chatbot platform for developer teams.

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-saas, about-hybrid, contact, legal
  Purpose: SaaS marketing landing page with hero, features, pricing,
  testimonials. About page with team and values. Contact form. Legal pages.
  Tone: professional, technically credible.
  Features: pricing-toggle, testimonials, feature-grid, team-grid,
  form-validation, toc-navigation, smooth-scroll

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow — login, register, forgot password,
  MFA setup and verify, email verification.
  Tone: minimal, frictionless — get the user through quickly.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — chat-portal shell
  Archetypes: ai-chatbot (primary), settings-full (auxiliary)
  Purpose: AI chatbot interface with conversation sidebar, message thread,
  and anchored input. Settings for profile, security, preferences.
  Tone: focused, efficient — the conversation is primary.
  Features: chat, markdown, code-highlight, file-upload, mentions,
  reactions, export, profile-edit, session-management, theme-toggle

### Zone Transitions

  Public → Gateway: conversion (sign-up and login CTAs lead to auth)
  Gateway → App: authentication (successful login enters the app)
  App → Gateway: deauthentication (logout returns to login)
  App → Public: navigation (footer links, logo link back to marketing)

### Default Entry Points

  Anonymous users enter: Public zone (/)
  Authenticated users enter: App zone (/chat)
  Auth redirect target: /chat (first primary-archetype route)
```

---

## System Integration

### decantr-content (52 archetypes)

Every archetype in `decantr-content/archetypes/` gets the `role` field. Complete mapping:

**primary** (19 archetypes):
- ai-chatbot, cloud-infrastructure, content-editor, content-site, creator-dashboard, dashboard-core, document-editor, ecommerce, game-catalog, owner-dashboard, portfolio, registry-browser, terminal-home, user-dashboard, workspace-home
- Domain-specific primaries: creator-content, creator-earnings, creator-subscribers, creator-tiers (primary within their blueprint's context)

**gateway** (2 archetypes):
- auth-full, auth-flow

**public** (10 archetypes):
- marketing-saas, marketing-devtool, marketing-landing, marketing-creator, marketing-realestate, marketing-productivity
- about-hybrid, contact, legal
- cloud-marketing

**auxiliary** (21 archetypes):
- settings, settings-full, billing, billing-portal, notifications, team-management, workspace-settings
- admin-moderation, config-editor, log-viewer, metrics-monitor, maintenance-center
- pm-financials, property-manager, tenant-manager, tenant-payments, tenant-portal
- fan-checkout, fan-library, fan-storefront
- gaming-community

Note: Some archetypes like `creator-dashboard` are `primary` in a creator-monetization-platform but could be `auxiliary` in a larger platform. The default role reflects its most common usage. Blueprint compose overrides handle exceptions.

**Validation update:** `validate.js` in decantr-content adds a check: every archetype must have a `role` field with value in `["primary", "gateway", "public", "auxiliary"]`.

**Publishing:** Once merged to main, the existing GitHub Action syncs all archetypes to the registry API (Supabase). No API changes needed — `role` is stored in the archetype's `data` JSON field.

### @decantr/essence-spec

- Add `role` to the archetype schema type definitions
- Add validation: `role` must be one of `primary | gateway | public | auxiliary`
- Add TypeScript type: `type ArchetypeRole = 'primary' | 'gateway' | 'public' | 'auxiliary'`
- No changes to EssenceV3 schema — topology is not stored in the essence

### @decantr/registry

The `composeArchetypes()` function gains zone awareness:

```typescript
interface ComposedZone {
  role: ArchetypeRole;
  archetypes: string[];
  shell: string;
  features: string[];
  descriptions: string[];
}

interface CompositionResult {
  pages: ComposedPage[];
  features: string[];
  defaultShell: string;
  zones: ComposedZone[];          // NEW
  transitions: ZoneTransition[];  // NEW
  entryPoints: {                  // NEW
    anonymous: string;
    authenticated: string;
  };
}
```

Zone derivation logic:
1. Group archetypes by resolved role
2. For each zone, determine shell from majority shell assignment of its pages
3. Collect features from all archetypes in the zone
4. Collect descriptions from all archetypes in the zone
5. Derive transitions from role pairs
6. Refine gateway transition trigger from gateway archetype's features
7. Compute entry points: first public-zone route, first primary-archetype route

### CLI (packages/cli)

**scaffold.ts:**
- After `composeArchetypes()`, access `composed.zones` and `composed.transitions`
- New function `generateTopologySection()`: builds the Composition Topology markdown from zone data + archetype descriptions + personality
- Inject into DECANTR.md template at a new `{{COMPOSITION_TOPOLOGY}}` placeholder

**DECANTR.md.template:**
- New section after "Blueprint" and before "Guard Rules":
```
---

{{COMPOSITION_TOPOLOGY}}

---
```

If no blueprint is selected (default/minimal init), the section is omitted.

### MCP Server (packages/mcp-server)

`decantr_resolve_blueprint` tool response gains a `topology` field:

```json
{
  "blueprint": { "..." },
  "composed": {
    "pages": ["..."],
    "features": ["..."],
    "zones": [
      {
        "role": "public",
        "archetypes": ["marketing-saas", "about-hybrid", "contact", "legal"],
        "shell": "top-nav-footer",
        "features": ["pricing-toggle", "testimonials", "..."],
        "purpose": "SaaS marketing landing page..."
      }
    ],
    "transitions": [
      { "from": "public", "to": "gateway", "type": "conversion", "trigger": "authentication" }
    ],
    "entryPoints": {
      "anonymous": "/",
      "authenticated": "/chat"
    }
  }
}
```

AI assistants using the MCP server (Cursor, Claude, etc.) get topology awareness without needing the CLI.

### Guard System (future scope — not in initial implementation)

Potential advisory rules for later:
- **Topology completeness**: Every zone should be reachable
- **Gateway presence**: If primary-zone archetypes exist, a gateway should too (unless the blueprint is purely public)
- **Entry point validity**: Auth redirect target must be a valid primary-zone route
- **Shell consistency**: Archetypes in the same zone should share a shell

These would be `warn` severity only, not errors.

---

## Rollout Order

The changes must flow in dependency order:

1. **decantr-content**: Add `role` to all 52 archetypes + update validate.js
2. **@decantr/essence-spec**: Add role type and validation
3. **@decantr/registry**: Enhance `composeArchetypes()` with zone derivation
4. **CLI**: Add topology generation to scaffold + DECANTR.md template
5. **MCP Server**: Add topology to blueprint resolution response
6. **Publish**: Merge decantr-content → triggers GitHub Action → syncs to registry

Steps 2-4 are in the monorepo and can be done in a single PR. Step 1 is in decantr-content (separate repo). Step 6 is triggered automatically on merge.

---

## Validation

### How to verify it works

1. Add `role` to all archetypes in decantr-content
2. Build the updated packages
3. Run `decantr init --blueprint=carbon-ai-portal --yes` in a test directory
4. Open the generated DECANTR.md
5. Verify the Composition Topology section shows:
   - Three zones (Public, Gateway, App)
   - Correct archetypes per zone
   - Transitions with correct trigger types
   - Entry points pointing to correct routes
   - Zone purposes derived from archetype descriptions
6. Have an AI assistant read the DECANTR.md and scaffold the project
7. Verify the AI correctly wires: login → /chat, CTAs → /register, logout → /login, sidebar nav = app-zone routes only

### Success criteria

- An AI reading ONLY the generated DECANTR.md (no human hints) correctly wires zone transitions
- Adding a new archetype to a blueprint + re-running init produces an updated topology with no manual work
- The showcase system's carbon-ai-portal login flow works after re-init with the topology-aware CLI

---

## Open Questions

1. **Should the `role` field be required or optional on archetypes?** Recommendation: required, with validation in decantr-content. An archetype without a role cannot participate in topology derivation.

2. **Should `compose` entries support role overrides from day one?** Recommendation: yes — the schema should allow it immediately even if no current blueprint uses it. Future-proofs without cost.

3. **Should the MCP server expose a standalone topology tool, or enrich the existing blueprint tool?** Recommendation: enrich the existing `decantr_resolve_blueprint` response. A standalone tool would be redundant.
