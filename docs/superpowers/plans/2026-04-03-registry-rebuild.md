# Registry App Rebuild — Fresh Decantr Scaffold + Functionality Port

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild apps/registry with a fresh Decantr registry-platform scaffold (luminarum dual-mode theme), then port back all real functionality (Supabase auth, API calls, server actions, billing) from the backup.

**Architecture:** Clear the UI, keep the Next.js infrastructure (package.json, config, lib/, proxy.ts, auth routes), lay Decantr context files on top, have the AI rebuild every page from context files, then wire real data.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Supabase Auth/SSR, TypeScript

---

## Task 1: Prepare — Clear UI, Keep Infrastructure

**Preserve from apps/registry:**
- `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`
- `src/lib/` (api.ts, admin.ts, showcase.ts, supabase/)
- `src/proxy.ts` (middleware)
- `src/app/auth/` (callback/route.ts, signout/route.ts)
- `src/app/dashboard/api-keys/actions.ts`
- `src/app/dashboard/settings/actions.ts`
- `src/app/dashboard/team/actions.ts`
- `src/app/dashboard/billing/actions.ts`
- `src/app/admin/moderation/actions.ts`
- `.env.local` (Supabase keys — do NOT delete)
- `.vercel/` (project config)

**Delete:** All page.tsx, layout.tsx, loading.tsx, error.tsx, not-found.tsx, globals.css, components/

- [ ] Clear the UI files while preserving infrastructure
- [ ] Verify the preserved files are intact

## Task 2: Scaffold Decantr Context

- [ ] Run `decantr init --blueprint=registry-platform --yes` in apps/registry
- [ ] This generates: decantr.essence.json, DECANTR.md, .decantr/context/, src/styles/tokens.css, src/styles/treatments.css, src/styles/global.css
- [ ] Verify context files have: shell implementation specs, Quick Start, spacing guide, decorator tables, Visual Direction, voice & copy, development mode

## Task 3: Merge CSS — Decantr tokens + Tailwind v4

The Decantr scaffold generates CSS files but the app uses Tailwind v4. We need both:

- [ ] Create `src/app/globals.css` that imports Tailwind AND Decantr tokens:
```css
@import "tailwindcss";
@import "../../src/styles/tokens.css";
@import "../../src/styles/treatments.css";
@import "../../src/styles/global.css";
```
Or flatten: take the Decantr CSS variables and put them directly in globals.css after the Tailwind import. The Decantr treatments (d-interactive, d-surface, etc.) work alongside Tailwind — no conflict.

## Task 4: Build Root Layout + Shells

Port from backup: root layout structure (html, body, metadata) but restyle with luminarum theme.

- [ ] `src/app/layout.tsx` — Root layout: import Supabase user (from backup), render top-nav shell with theme toggle, children, footer. Use luminarum tokens. Support light/dark mode via class on html.
- [ ] `src/app/dashboard/layout.tsx` — Dashboard layout: auth gate (from backup), sidebar-main shell per Decantr spec.
- [ ] `src/app/admin/layout.tsx` — Admin layout: admin gate (from backup), sidebar-main shell.

## Task 5: Build Public Pages (registry-browser section)

- [ ] `src/app/page.tsx` — Homepage: search-filter-bar + content-card-grid + kpi-grid. Port real API calls from backup's page.tsx.
- [ ] `src/app/browse/page.tsx` + `src/app/browse/[type]/page.tsx` — Browse with type filtering. Port search/filter logic from backup.
- [ ] `src/app/[type]/[namespace]/[slug]/page.tsx` — Content detail. Port from backup with new visual treatment.
- [ ] `src/app/profile/[username]/page.tsx` — Public profile. Port from backup.
- [ ] `src/app/login/page.tsx` — Login. Port Supabase auth from backup, restyle with centered shell.
- [ ] `src/app/privacy/page.tsx` + `src/app/terms/page.tsx` — Legal pages from backup.

## Task 6: Build Dashboard Pages (user-dashboard section)

- [ ] `src/app/dashboard/page.tsx` — Overview with KPIs. Port API calls.
- [ ] `src/app/dashboard/content/page.tsx` — My content. Port API calls.
- [ ] `src/app/dashboard/content/new/page.tsx` — Create content. Port form + actions.
- [ ] `src/app/dashboard/api-keys/page.tsx` — API keys. Port actions.ts.
- [ ] `src/app/dashboard/settings/page.tsx` — Settings. Port actions.ts.
- [ ] `src/app/dashboard/billing/page.tsx` — Billing. Port Stripe integration + actions.ts.
- [ ] `src/app/dashboard/team/page.tsx` — Team. Port actions.ts.

## Task 7: Build Admin Pages

- [ ] `src/app/admin/page.tsx` — Admin home (redirect to moderation).
- [ ] `src/app/admin/moderation/page.tsx` — Moderation queue. Port actions.ts.

## Task 8: Build Shared Components

UI primitives and domain components rebuilt from Decantr context:
- [ ] `src/components/ui/` — Button, Card, Badge, Input using Decantr treatments
- [ ] `src/components/nav.tsx` — Top nav with theme toggle
- [ ] `src/components/footer.tsx` — Footer
- [ ] `src/components/registry/` — ContentCard, ContentGrid, SearchFilterBar, Pagination, JsonViewer, NamespaceBadge
- [ ] `src/components/dashboard/` — ApiKeyList, TeamMemberList, forms

## Task 9: Verify

- [ ] `pnpm dev` — app starts without errors
- [ ] All routes work (public, auth, dashboard, admin)
- [ ] Theme toggle works (light/dark)
- [ ] Real data loads from API/Supabase
- [ ] Auth flow works (login → dashboard → logout)
