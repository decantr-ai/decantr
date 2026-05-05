# Scaffold: agent-studio

**Blueprint:** agent-studio
**Theme:** carbon-neon
**Personality:** Precision engineering studio for AI agents. Carbon-dark surfaces with neon cyan highlights on active elements. Monospace typography for all prompts, traces, and model outputs. Split-pane interfaces reminiscent of an IDE — left tree, center editor, right preview. Think VS Code meets Langsmith. Interactions are immediate and keyboard-first. Every surface exists to reduce iteration cycles. Lucide icons. No decoration — every pixel serves the builder.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Technical and precise. Speaks to AI engineers and prompt designers.
**CTA verbs:** Build, Test, Deploy, Trace, Iterate, Compare
**Avoid:** Submit, Click here, Please enter, Easy, Simple
**Empty states:** IDE-style emptiness. An empty workspace should guide the user to create their first agent with a clear setup wizard. Minimal and purposeful.
**Errors:** Diagnostic and developer-friendly. Include error codes, stack context, and suggested fixes. Link to documentation when available.
**Loading states:** Skeleton panes with blinking cursor placeholders in monospace fields. Split panels show loading shimmer. Progress bars for long operations.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** agent-studio + prompt-library + tool-registry + eval-suite + trace-viewer + marketing-ai-studio + auth-full + settings-full

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-ai-studio
  Purpose: Marketing landing page for the AI Agent Studio, showcasing features, workflow demos, pricing tiers, and conversion CTAs.
  Features: marketing, seo

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — sidebar-aside shell
  Archetypes: agent-studio
  Purpose: Core agent building workspace for designing, configuring, and testing AI agents with a three-panel editor, tool management, and live preview.
  Features: agents, tools, prompts, real-time-preview, keyboard-shortcuts

**App (auxiliary)** — sidebar-main shell
  Archetypes: prompt-library, tool-registry, eval-suite, trace-viewer, settings-full
  Purpose: Version-controlled prompt library for authoring, searching, comparing, and testing prompts with full diff history and evaluation results. Centralized registry of agent tools with JSON schema editing, interactive test playground, and usage analytics. Model evaluation test suite for running, reviewing, and comparing evaluation results with per-test breakdowns and regression detection. Agent execution trace viewer for inspecting request waterfalls, step timelines, and replaying agent interactions with full observability. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: versioning, diff, search, tags, tools, schemas, analytics, evaluation, comparison, regression-detection, traces, observability, replay, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| agent-studio | primary | sidebar-aside | agents, agent-detail, agent-config, agent-tools | agents, tools, prompts, real-time-preview, keyboard-shortcuts |
| prompt-library | auxiliary | sidebar-main | prompts, prompt-detail, prompt-compare | versioning, diff, search, tags |
| tool-registry | auxiliary | sidebar-main | tools, tool-detail | tools, schemas, analytics |
| eval-suite | auxiliary | sidebar-main | evals, eval-detail, eval-compare, eval-create | evaluation, comparison, regression-detection |
| trace-viewer | auxiliary | sidebar-main | traces, trace-detail | traces, observability, replay |
| marketing-ai-studio | public | top-nav-footer | home | marketing, seo |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | sidebar-aside | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-ai-studio | home |
| /evals | eval-suite | evals |
| /login | auth-full | login |
| /tools | tool-registry | tools |
| /agents | agent-studio | agents |
| /traces | trace-viewer | traces |
| /prompts | prompt-library | prompts |
| /register | auth-full | register |
| /evals/:id | eval-suite | eval-detail |
| /mfa-setup | auth-full | mfa-setup |
| /tools/:id | tool-registry | tool-detail |
| /agents/:id | agent-studio | agent-detail |
| /mfa-verify | auth-full | mfa-verify |
| /traces/:id | trace-viewer | trace-detail |
| /prompts/:id | prompt-library | prompt-detail |
| /agents/tools | agent-studio | agent-tools |
| /evals/create | eval-suite | eval-create |
| /phone-verify | auth-full | phone-verify |
| /verify-email | auth-full | verify-email |
| /agents/config | agent-studio | agent-config |
| /evals/compare | eval-suite | eval-compare |
| /reset-password | auth-full | reset-password |
| /forgot-password | auth-full | forgot-password |
| /prompts/compare | prompt-library | prompt-compare |
| /settings/danger | settings-full | danger |
| /settings/profile | settings-full | profile |
| /settings/security | settings-full | security |
| /settings/preferences | settings-full | preferences |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-agent-studio.md
- .decantr/context/section-prompt-library.md
- .decantr/context/section-tool-registry.md
- .decantr/context/section-eval-suite.md
- .decantr/context/section-trace-viewer.md
- .decantr/context/section-marketing-ai-studio.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** Organization, WebApplication, SoftwareApplication
**Meta priorities:** description, og:image, twitter:card

## Navigation

- Command palette: enabled
- Hotkeys: 5 configured
