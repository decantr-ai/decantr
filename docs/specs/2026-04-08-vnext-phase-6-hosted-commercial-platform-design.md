# Decantr vNext Phase 6 — Hosted Commercial Platform and Governance

**Date:** 2026-04-08
**Status:** Draft
**Author:** Codex
**Depends on:**
- `docs/programs/2026-04-08-decantr-vnext-master-program.md`
- `docs/specs/2026-04-08-vnext-phase-2-contract-compiler-design.md`
- `docs/specs/2026-04-08-vnext-phase-3-verification-and-golden-corpus-design.md`
- `docs/specs/2026-04-08-vnext-phase-4-registry-intelligence-and-content-ops-design.md`
**Companion audits:**
- `docs/audit/2026-04-08-system-baseline.md`
- `docs/audit/2026-04-08-package-release-surface-audit.md`

---

## Overview

Phase 6 turns Decantr from a strong technical system into a hosted product that teams can buy and trust.

By this point, Decantr should already have:

- focused product boundaries
- a normalized content platform
- a compiler
- a verification layer
- content intelligence and operational rigor

This phase adds the commercial and governance layer on top of that stable core.

## Goals

- Deliver hosted team-ready registry and API capabilities.
- Add organization, private content, and policy controls.
- Support hosted MCP/API access patterns that fit real team workflows.
- Establish auditability, approvals, and governance foundations.
- Build operational reliability required for a sellable platform.

## Non-Goals

- Supporting every enterprise integration on day one.
- Building self-hosted parity before the hosted product is proven.
- Expanding into non-UI domains during this phase.

---

## Core Problem Statement

Decantr can become technically impressive without becoming commercially usable.

A sellable product requires more than great compiler and verification internals. Teams also need:

- tenancy and org boundaries
- private registries
- user and role controls
- approval and audit history
- reliable hosted access
- billing and metering
- operational supportability

Phase 6 exists to make Decantr a legitimate commercial platform instead of only a powerful internal system.

---

## Design Principles

### 1. Governance Must Follow a Stable Core

Hosted controls should be built on top of a trustworthy compiler, verification, and content model, not used to compensate for platform instability.

### 2. Hosted First

The initial commercial product should optimize for hosted simplicity and operational clarity.

### 3. Auditability Is a Feature

Changes to content, policies, approvals, and important contract surfaces should be reviewable.

### 4. Policy Should Be Explicit

Teams should be able to define what Decantr is allowed to do or recommend within their org context.

### 5. Reliability Matters

Availability, release discipline, observability, and rollback paths are part of the product, not just infrastructure chores.

---

## Hosted Platform Scope

### Team and Org Foundations

Expected capabilities:

- organizations
- projects or workspaces
- org membership
- role-based access
- private registry namespaces

### Governance Foundations

Expected capabilities:

- audit logs
- approval workflows
- policy packs
- protected content and rules
- provenance visibility

### Commercial Foundations

Expected capabilities:

- hosted MCP endpoint
- hosted API access
- billing and metering
- plan and entitlement management

### Operational Foundations

Expected capabilities:

- release discipline
- structured logging and tracing
- uptime and error monitoring
- incident response readiness
- rollback strategy

---

## Initial Implementation Plan

### Workstream A: Tenant and Private Registry Model

Tasks:

1. Define org, workspace, and namespace boundaries.
2. Support private and shared registry content.
3. Clarify official, community, private-org provenance interactions.

Acceptance criteria:

- teams can maintain private content with clear ownership boundaries

### Workstream B: Governance and Policy

Tasks:

1. Add audit trail for important mutations and approvals.
2. Define policy pack model for content, verification, and generation controls.
3. Add approval workflow foundations for protected actions.

Acceptance criteria:

- important actions are attributable and reviewable
- org rules can constrain behavior in explicit ways

### Workstream C: Hosted Delivery Surfaces

Tasks:

1. Productize hosted MCP access.
2. Harden API contracts for team consumption.
3. Define stable onboarding flows for hosted usage.

Acceptance criteria:

- teams can use the hosted product without bespoke setup

### Workstream D: Billing and Metering

Tasks:

1. Define billable surfaces and entitlements.
2. Add usage reporting and plan gates.
3. Integrate billing cleanly with org controls.

Acceptance criteria:

- usage and access can be measured and governed

### Workstream E: Reliability and Operations

Tasks:

1. Define SLOs and operational signals.
2. Add structured logs, monitoring, and tracing.
3. Define release, rollback, and incident-handling practices.

Acceptance criteria:

- hosted Decantr is operable as a service, not just deployable as code

---

## Package and Repo Impact

Primary repos:
- `decantr-monorepo`
- `decantr-content` for private/official content interaction rules where relevant

Primary apps and packages:
- `apps/api`
- `apps/registry`
- `packages/mcp-server`
- `packages/registry`
- billing, org, and policy-related app surfaces

---

## Acceptance Criteria

Phase 6 is complete when:

- Decantr supports hosted org and private registry workflows
- policy and approval foundations exist
- auditability is built into important content and governance actions
- hosted API and MCP access are productized for team use
- the service has defined reliability and release practices

---

## Risks and Open Decisions

### 1. Commercializing Too Early

If the core compiler and verification layers are not trustworthy yet, hosted governance work will sit on unstable foundations.

### 2. Governance Overreach

The first governance slice should solve clear team problems, not attempt to replicate every enterprise platform immediately.

### 3. Operational Debt

Hosted product work without observability and release discipline will create support pain quickly.

---

## Exit Criteria

This phase is considered resolved when Decantr can credibly operate as a hosted team product with private content, governance controls, and reliable service foundations on top of the stable vNext core.
