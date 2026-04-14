# Hosted Commercial Model Clarification and Execution Plan

Date: 2026-04-13

## Why This Exists

The original hosted commercial platform plan correctly identified the major remaining work:

- private registries
- org and team governance
- approvals and auditability
- billing and metering

But the current shipped product is no longer an abstract blank slate. The registry app and API already expose:

- a `Free` / `Pro` / `Team` billing surface
- team and organization pages
- org-scoped content routes
- Stripe checkout and webhook handling
- user tiers and org membership tables

That means the next step is not “start Phase 6.” The next step is to clarify what the product actually is, fix the parts that are wired inconsistently, and then build the remaining commercial system on top of a coherent model.

This document resets that workstream around the actual product that exists today.

## Implemented Since Reset

The first implementation waves after this reset have already delivered:

- a shared commercial entitlement model for `Free`, `Pro`, `Team`, and `Enterprise`
- richer `/me` and `/billing/status` hosted contract responses
- Team-backed organizations with seat persistence
- org member listing, invites, role changes, and removals
- org audit log foundations and an initial registry governance UI
- personal vs org package publishing flows in the registry dashboard
- durable API usage metering plus publish/approval usage event tracking

That means the remaining work is no longer “introduce commercial structure.” It is:

- deepen billing and usage fidelity
- deepen governance and approval product surfaces
- decide how much enterprise/private-registry scope should be implemented versus explicitly deferred

---

## Executive Decision

### Pro is not a private registry product

The intended meaning of `Pro` should be:

- a single-user paid plan
- personal private packages/content
- higher API and publishing limits
- better support and operator ergonomics

It should **not** imply:

- team collaboration
- organization governance
- shared org namespaces
- private registries as a standalone product construct

### Team is shared organizational collaboration

The intended meaning of `Team` should be:

- an organization-backed plan
- shared member management
- org-scoped content ownership
- shared private packages for the org
- org-scoped API access
- role-based collaboration

### Private registries should be deferred or repositioned

The current codebase does not implement a distinct “private registry” product model. It implements:

- content-level visibility (`public` / `private`)
- user-owned content
- org-owned content via `org_id`
- org namespaces like `@org:slug`

That is closer to:

- personal private packages
- org-shared private packages

than to a first-class private registry product.

The working recommendation is:

- make `private packages` the near-term commercial truth for `Pro`
- make `shared org packages` the near-term commercial truth for `Team`
- defer “private registries” as either:
  - a future `Enterprise` feature, or
  - a later packaging/permission abstraction once the org/shared-content model is trustworthy

---

## Current Product Audit

### 1. Billing UI is product-shaped but not contract-shaped

Current implementation in the registry app:

- [page.tsx](/Users/davidaimi/projects/decantr-monorepo/apps/registry/src/app/dashboard/billing/page.tsx)
- [actions.ts](/Users/davidaimi/projects/decantr-monorepo/apps/registry/src/app/dashboard/billing/actions.ts)

Observed issues:

- `Free`, `Pro`, and `Team` cards are presented as real commercial plans, but the feature lists are hardcoded marketing strings rather than entitlement-driven facts.
- billing KPIs are partially synthetic:
  - `Storage Used` is hardcoded to `0`
  - `Team Seats` is hardcoded to `5` for Team and `1` otherwise
- there is no returned entitlement object from the API, so the UI infers plan meaning from tier names rather than from a real commercial contract

Implication:

- the customer-facing plan surface is ahead of the actual entitlement model

### 2. Pro currently behaves like “paid user” rather than “personal private packages”

Current backend enforcement:

- [publish.ts](/Users/davidaimi/projects/decantr-monorepo/apps/api/src/routes/publish.ts)

Observed behavior:

- private content is allowed for any non-free user
- the generic publish route gates `visibility = private` only on `tier !== free`
- there is no explicit “personal private package” concept beyond content visibility

Registry UI mismatch:

- [page.tsx](/Users/davidaimi/projects/decantr-monorepo/apps/registry/src/app/dashboard/content/new/page.tsx)
- the publish UI does not expose `visibility`
- it defaults namespace choices to `@official` and `@community`
- `@official` is shown in the UI even though the API rejects publishing there

Implication:

- Pro’s likely core value proposition already exists partially in backend logic
- but the registry UI does not let users express it cleanly

### 3. Team currently means “auto-created org” but the UX is incomplete

Current backend behavior:

- [billing.ts](/Users/davidaimi/projects/decantr-monorepo/apps/api/src/routes/billing.ts)
- [webhooks.ts](/Users/davidaimi/projects/decantr-monorepo/apps/api/src/stripe/webhooks.ts)
- [orgs.ts](/Users/davidaimi/projects/decantr-monorepo/apps/api/src/routes/orgs.ts)

Observed behavior:

- Team checkout exists and accepts a seat quantity
- Team webhook flow upgrades the user tier and auto-creates an organization if needed
- org content is published into `@org:${slug}`
- org membership roles exist (`owner`, `admin`, `member`)

Observed gaps:

- the frontend Team page fetches `GET /orgs/:slug/members`
  - [page.tsx](/Users/davidaimi/projects/decantr-monorepo/apps/registry/src/app/dashboard/team/page.tsx)
  - but the API currently has no matching `GET /orgs/:slug/members` route in [orgs.ts](/Users/davidaimi/projects/decantr-monorepo/apps/api/src/routes/orgs.ts)
- `/me` returns only one `org_slug`
  - [auth.ts](/Users/davidaimi/projects/decantr-monorepo/apps/api/src/routes/auth.ts)
  - so multi-org membership is not productized
- the sidebar always exposes `Billing` and `Team`
  - [sidebar.tsx](/Users/davidaimi/projects/decantr-monorepo/apps/registry/src/components/sidebar.tsx)
  - regardless of tier or org state

Implication:

- the Team plan has a real backend foundation
- but the actual end-user collaboration flow is incomplete and partially broken

### 4. Seat management is implied but not modeled

Current behavior:

- Team checkout accepts `quantity`
- subscription update webhooks read Stripe item quantity
- [webhooks.ts](/Users/davidaimi/projects/decantr-monorepo/apps/api/src/stripe/webhooks.ts)

Observed issue:

- seat quantity is logged but not persisted anywhere durable on the organization model
- the organizations table has:
  - `id`, `name`, `slug`, `owner_id`, `tier`, `stripe_subscription_id`
  - but no seat count, seat cap, or billing metadata
  - [00002_create_organizations.sql](/Users/davidaimi/projects/decantr-monorepo/apps/api/supabase/migrations/00002_create_organizations.sql)

Implication:

- Team seats are a Stripe concept, not yet a product data model

### 5. Billing and metering are not yet a real entitlement system

Current state:

- rate limits exist by tier
  - [rate-limit.ts](/Users/davidaimi/projects/decantr-monorepo/apps/api/src/middleware/rate-limit.ts)
- billing status returns only:
  - `tier`
  - Stripe subscription details
  - [billing.ts](/Users/davidaimi/projects/decantr-monorepo/apps/api/src/routes/billing.ts)

Observed gap:

- no centralized entitlement object
- no durable usage ledger for API calls, private content counts, team seats, or org quota consumption
- no linkage between UI claims and backend-measured billable surfaces

Implication:

- current billing is checkout-grade, not operating-model-grade

### 6. Governance exists in fragments, not as a coherent product

Current pieces:

- community moderation
- org membership roles
- org content ownership
- audit-adjacent Stripe event recording

Missing pieces:

- org policy model
- org approval workflows
- org audit trail for member, content, and entitlement mutations
- explicit provenance/governance views in the registry app

Implication:

- governance exists as raw mechanics, not as a user-facing commercial capability

---

## Commercial Model Reset

## Free

Intent:

- public/community usage
- low-volume API and publishing
- no personal private packages
- no organization collaboration

Should include:

- community publishing with moderation
- low API rate limits
- basic profile, dashboard, API keys

Should not include:

- private packages
- org namespace workflows
- team member management

## Pro

Intent:

- single-user paid plan for production use
- personal private packages
- higher limits and priority support

Should include:

- private visibility for user-owned content
- higher API and publish limits
- stronger API-key usage
- personal namespace clarity

Should not include:

- org creation
- seats
- member invites
- shared org content workflows
- “private registry” positioning

## Team

Intent:

- organization-backed collaboration plan
- shared private packages for a team
- org member management and org-scoped API use

Should include:

- organization creation and membership
- owner/admin/member roles
- org-scoped shared content
- org-scoped private packages
- seat-aware billing
- org API keys and usage reporting

Should not initially imply:

- fully isolated private registry infrastructure
- enterprise policy suite
- self-hosted or dedicated deployment options

## Enterprise

Intent:

- advanced governance and deployment controls

Candidate future features:

- true private registries or registry partitions
- advanced approval policies
- audit/export/reporting controls
- enterprise SSO / SCIM / policy packs

---

## What “Private Packages” Should Mean

This is the key product clarification.

For this phase, “private packages” should mean:

- a content item remains in the Decantr registry data model
- but its visibility is restricted to:
  - the owning user, or
  - the owning organization members

It does **not** require:

- a separate registry deployment
- a separate registry index per customer
- a distinct registry product abstraction in the UI

Near-term implementation:

- `visibility = private`
- `owner_id` for personal private packages
- `org_id` for shared team-private packages

That is sufficient to sell the practical value proposition without overcommitting to “private registries.”

---

## Priority Plan

### Priority 0: Commercial Contract Reset

Goal:

- make the product language match the intended offer before deeper implementation continues

Tasks:

1. Rewrite Pro and Team plan copy across the registry app to reflect:
   - Pro = personal private packages
   - Team = shared org collaboration
2. Remove or defer “private registry” language from customer-facing Pro/Team surfaces.
3. Define a single entitlement contract returned from the API:
   - tier
   - personal private package capability
   - org capability
   - seat capability
   - usage limits

Acceptance criteria:

- a customer can tell what Pro and Team actually buy
- plan cards, billing status, and API semantics all describe the same thing

### Priority 1: Fix Broken Current Wiring

Goal:

- make the currently exposed billing/team product paths actually function

Tasks:

1. Add `GET /orgs/:slug/members` to the API to match the Team page’s expectations.
2. Stop exposing Team UI blindly to every user:
   - gate Team nav on org/tier state
3. Persist seat quantity on organizations.
4. Return real seat and entitlement data from `GET /billing/status`.
5. Fix the content publishing UI:
   - remove `@official` as a publish target
   - add visibility controls
   - add org/shared publishing paths where appropriate

Acceptance criteria:

- Team page loads actual members
- Billing page shows real plan/seat/limit data
- dashboard publish flow can express personal private packages cleanly

### Priority 2: Implement Pro Properly

Goal:

- make Pro valuable and coherent without dragging in org complexity

Tasks:

1. Add explicit personal private-package support in the dashboard publish flow.
2. Add personal content quota enforcement and surfaced usage.
3. Clarify personal namespace behavior:
   - user profile namespace vs community namespace vs private visibility
4. Gate private publishing and related UI/actions off the entitlement contract instead of raw tier-name checks scattered across surfaces.

Acceptance criteria:

- a Pro user can create, manage, and understand personal private packages end to end

### Priority 3: Implement Team Properly

Goal:

- make Team a real shared collaboration product

Tasks:

1. Add org-scoped member listing, invites, removals, and role updates end to end.
2. Add org selection / multi-org awareness in auth and dashboard state.
3. Add org content management UX:
   - list org content
   - publish org content
   - distinguish org-private vs org-public content
4. Add org-scoped API key and usage surfaces.

Acceptance criteria:

- a Team customer can collaborate around shared packages with clear ownership and role boundaries

### Priority 4: Metering and Billing Hardening

Goal:

- make billing and usage governable rather than decorative

Tasks:

1. Define billable surfaces:
   - API calls
   - personal private package counts
   - org private/shared package counts
   - team seats
2. Add durable usage measurement and reporting.
3. Align Stripe checkout quantities, stored seat counts, and UI seat displays.
4. Harden webhook downgrade behavior and entitlement transitions.

Acceptance criteria:

- billing status, quotas, and UI metrics derive from the same measured source

### Priority 5: Governance v1

Goal:

- add the minimum team trust layer after the core collaboration flows are sound

Tasks:

1. Add audit logs for:
   - membership changes
   - role changes
   - billing/seat changes
   - org content publication and visibility changes
2. Add approval hooks for protected org content actions where needed.
3. Add basic provenance views for org-owned content.

Acceptance criteria:

- important org and content actions are attributable and reviewable

### Priority 6: Private Registry / Enterprise Decision

Goal:

- avoid prematurely building a heavier commercial abstraction than the product currently needs

Tasks:

1. Decide whether “private registry” remains:
   - an enterprise feature, or
   - a future abstraction layered on top of org/private-package workflows
2. Do not block Pro/Team execution on this decision unless a hard technical dependency appears.

Acceptance criteria:

- Pro and Team can ship credibly even if full private-registry infrastructure is deferred

---

## Immediate Implementation Sequence

The next implementation wave should proceed in this order:

1. Commercial copy + entitlement contract reset
2. Fix Team page and billing status wiring
3. Fix publish UX for personal private packages
4. Add org content/member flows that the Team plan actually depends on
5. Add seat persistence and usage reporting
6. Add governance/audit foundations
7. Revisit private registries only after the above is stable

---

## Master-Plan Fit

This plan still satisfies the Phase 6 intent from [2026-04-08-vnext-phase-6-hosted-commercial-platform-design.md](/Users/davidaimi/projects/decantr-monorepo/docs/specs/2026-04-08-vnext-phase-6-hosted-commercial-platform-design.md), but it narrows and clarifies it:

- the stable core remains the prerequisite
- org/team governance still matters
- billing/metering still matters
- approvals/audit still matter

What changes is the sequencing and product truth:

- Pro is not treated as a vague paid tier
- Team is not treated as “private registry” shorthand
- private registries are no longer forced into the near-term plan if the real sellable value is personal and org-private packages

---

## Exit Condition For This Clarification Plan

This reset is considered successful when:

- the registry app, API, and docs all agree on what Pro and Team mean
- Pro supports personal private packages cleanly
- Team supports org collaboration cleanly
- billing status, seats, and usage are real rather than inferred
- the private-registry question is either explicitly deferred or clearly scoped to a later enterprise phase
