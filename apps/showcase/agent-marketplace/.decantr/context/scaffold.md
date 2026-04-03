# Scaffold: agent-orchestrator

**Blueprint:** agent-marketplace
**Theme:** carbon-neon
**Personality:** Confident cyber-minimal agent marketplace. Neon accent glows on dark void backgrounds. Monospace data typography. Agent status shown through color-coded rings and pulse animations. Think Linear meets a mission control center. Lucide icons. No decorative elements — every pixel serves the operator.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Operational and precise. Speaks to agent operators and platform engineers. Data-first, minimal prose.
**CTA verbs:** Deploy, Monitor, Configure, Browse, Inspect, Activate
**Avoid:** Submit, Click here, Please enter, Buy now, Exciting
**Empty states:** Mission-control style. An empty agent fleet should prompt deployment of the first agent with a clear setup flow. No whimsy.
**Errors:** Diagnostic and actionable. Include agent IDs, error codes, and timestamps. Suggest remediation steps or link to runbooks.
**Loading states:** Status ring skeletons with pulse animation. Agent cards show placeholder rings while data streams in. Monospace data fields use blinking cursor placeholders.

## App Topology

## Composition Topology

**Intent:** agent-orchestrator + auth-full + marketing-saas + ai-transparency

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-saas
  Purpose: SaaS marketing landing page with hero, features, how-it-works timeline, pricing, testimonials, and CTA sections.
  Features: pricing-toggle, testimonials, feature-grid

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — sidebar-main shell
  Archetypes: agent-orchestrator
  Purpose: Multi-agent management dashboard for monitoring, configuring, and orchestrating autonomous agent swarms with real-time status and marketplace discovery.
  Features: agents, monitoring, orchestration, real-time, websockets

**App (auxiliary)** — sidebar-main shell
  Archetypes: ai-transparency
  Purpose: AI model observability and transparency dashboard for inspecting inference logs, confidence distributions, and neural feedback cycles across deployed models.
  Features: monitoring, analytics, observability

### Zone Transitions

  Public → Gateway: conversion (authentication)
  Gateway → App: gate-pass (authentication)
  App → Gateway: gate-return (authentication)
  App → Public: navigation (external)

### Default Entry Points

  Anonymous users enter: public zone
  Authenticated users enter: primary zone
  Auth redirect target: primary zone


## Sections Overview

| Section | Role | Shell | Pages | Features |
|---------|------|-------|-------|----------|
| agent-orchestrator | primary | sidebar-main | agent-overview, agent-detail, agent-config, agent-marketplace | agents, monitoring, orchestration, real-time, websockets |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| marketing-saas | public | top-nav-footer | home | pricing-toggle, testimonials, feature-grid |
| ai-transparency | auxiliary | sidebar-main | model-overview, inference-log, confidence-explorer | monitoring, analytics, observability |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-saas | home |
| /login | auth-full | login |
| /agents | agent-orchestrator | agent-overview |
| /register | auth-full | register |
| /agents/:id | agent-orchestrator | agent-detail |
| /marketplace | agent-orchestrator | agent-marketplace |
| /transparency | ai-transparency | model-overview |
| /verify-email | auth-full | verify-email |
| /agents/config | agent-orchestrator | agent-config |
| /reset-password | auth-full | reset-password |
| /forgot-password | auth-full | forgot-password |
| /transparency/inference | ai-transparency | inference-log |
| /transparency/confidence | ai-transparency | confidence-explorer |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-agent-orchestrator.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-marketing-saas.md
- .decantr/context/section-ai-transparency.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| agent-timeline | agent-orchestrator/agent-overview, agent-orchestrator/agent-detail, ai-transparency/inference-log |
| neural-feedback-loop | agent-orchestrator/agent-detail, ai-transparency/model-overview |
| hero | agent-orchestrator/agent-marketplace, marketing-saas/home |
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| stats-overview | ai-transparency/model-overview, ai-transparency/confidence-explorer |

## SEO Hints

**Schema.org types:** Organization, WebApplication, SoftwareApplication
**Meta priorities:** description, og:image, twitter:card

## Navigation

- Command palette: enabled
- Hotkeys: 3 configured
