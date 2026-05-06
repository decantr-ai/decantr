# Scaffold: recipefork-landing

**Blueprint:** recipefork
**Theme:** recipefork
**Personality:** Recipefork is a neutral, production-grade recipe product that lets food photography and authoring depth carry the experience. Public browsing feels clean and modern; Chef Mode is the critical differentiator, with structured ingredients, nested instruction groups, optional plating presentation, dynamic cooking tips, explicit recipe visibility controls, draft workflows, and no-loss hydrated editing.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Encouraging, practical, and food-aware without becoming gimmicky.
**CTA verbs:** Create, Save, Cook, Follow, Generate, Edit
**Avoid:** Execute, Deploy, Submit, Synergize
**Empty states:** Calm and motivating. Empty cookbook and empty recipe states should encourage creation rather than feel like errors.
**Errors:** Plainspoken and actionable. Tell the user what failed and how to recover.
**Loading states:** Product-style skeletons and calm motion rather than decorative animation.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** recipefork-landing + recipefork-recipe-detail + recipefork-social + recipefork-ai-kitchen + recipefork-cookbooks + recipefork-recipe-authoring + recipefork-profile + recipefork-auth

### Zones

**Public** — recipefork-top-nav shell
  Archetypes: recipefork-landing
  Purpose: Recipefork's public landing page under the shared product nav, combining hero marketing, featured recipes, community proof, and conversion calls without switching to a separate shell.
  Features: marketing, seo

**Gateway** — recipefork-top-nav shell
  Archetypes: recipefork-auth
  Purpose: Recipefork's shared-shell authentication entry surface. The auth card lives inside the product navbar shell rather than switching to a detached centered-only auth layout.
  Features: auth, oauth

**App** — recipefork-top-nav shell
  Archetypes: recipefork-recipe-detail
  Purpose: Recipefork's recipe detail surface with hero imagery, summary/actions, Chef Mode ingredient and instruction displays, optional plating presentation, dynamic cooking tips, public provenance attribution, owner-only branch analytics, and comments, all under the shared Recipefork top-nav shell.
  Features: sharing, comments, reactions, forking, chef-mode, presentation, cooking-tips, lineage, branch-analytics

**App (auxiliary)** — recipefork-top-nav shell
  Archetypes: recipefork-social, recipefork-ai-kitchen, recipefork-cookbooks, recipefork-recipe-authoring, recipefork-profile
  Purpose: Recipefork's public discovery feed with engagement-aware recipe ranking, event filters, followed-creator cues, fork-depth/root lineage badges on cards, and a preview-card community activity rail. Authenticated AI kitchen workspace for Recipefork with chat history and photo-to-recipe generation flows. Cookbook management and cookbook detail views for Recipefork, including creation, visibility state, owner-only editing, public cookbook viewing, and recipe collection browsing. Dual-mode recipe authoring workspace for Recipefork with Simple Mode and Chef Mode editing, drafts, hydrated editing, a shared structured ingredient editor, safe simple-to-chef conversion, hierarchical instruction groups, optional plating presentation, inline cookbook assignment, cooking tips, and rich recipe stories. Current-user and public profile surfaces for Recipefork with editable identity, a dedicated owner recipe workspace, public recipe/cookbook grids, follower stats, owner-only branch analytics, recent activity, and social navigation back into recipes and cookbooks.
  Features: social, activity-feed, comments, reactions, follows, forking, engagement-ranking, lineage-cues, chat-history, image-upload, auth, generation-history, collections, visibility, recipe-saving, simple-mode, chef-mode, drafts, hydrated-editing, structured-ingredients, hierarchical-instructions, presentation, cooking-tips, mode-conversion, rich-story, autosave, cookbook-assignment, profile-editing, public-profiles, branch-analytics

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
| recipefork-landing | public | recipefork-top-nav | home | marketing, seo |
| recipefork-recipe-detail | primary | recipefork-top-nav | recipe-detail | sharing, comments, reactions, forking, chef-mode, presentation, cooking-tips, lineage, branch-analytics |
| recipefork-social | auxiliary | recipefork-top-nav | feed | social, activity-feed, comments, reactions, follows, forking, engagement-ranking, lineage-cues |
| recipefork-ai-kitchen | auxiliary | recipefork-top-nav | chat, generate | chat-history, image-upload, auth, generation-history |
| recipefork-cookbooks | auxiliary | recipefork-top-nav | cookbooks, cookbook-detail | collections, visibility, recipe-saving |
| recipefork-recipe-authoring | auxiliary | recipefork-top-nav | create, edit | simple-mode, chef-mode, drafts, image-upload, hydrated-editing, structured-ingredients, hierarchical-instructions, presentation, cooking-tips, mode-conversion, rich-story, autosave, cookbook-assignment |
| recipefork-profile | auxiliary | recipefork-top-nav | me, my-recipes, public-profile | profile-editing, follows, collections, activity-feed, public-profiles, branch-analytics |
| recipefork-auth | gateway | recipefork-top-nav | login | auth, oauth |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | recipefork-landing | home |
| /feed | recipefork-social | feed |
| /profile | recipefork-profile | me |
| /recipes | recipefork-profile | my-recipes |
| /profile/:id | recipefork-profile | public-profile |
| /recipe/:id | recipefork-recipe-detail | recipe-detail |
| /chat | recipefork-ai-kitchen | chat |
| /generate | recipefork-ai-kitchen | generate |
| /cookbooks | recipefork-cookbooks | cookbooks |
| /cookbooks/:id | recipefork-cookbooks | cookbook-detail |
| /recipe/new | recipefork-recipe-authoring | create |
| /recipe/edit/:id | recipefork-recipe-authoring | edit |
| /auth | recipefork-auth | login |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-recipefork-landing.md
- .decantr/context/section-recipefork-recipe-detail.md
- .decantr/context/section-recipefork-social.md
- .decantr/context/section-recipefork-ai-kitchen.md
- .decantr/context/section-recipefork-cookbooks.md
- .decantr/context/section-recipefork-recipe-authoring.md
- .decantr/context/section-recipefork-profile.md
- .decantr/context/section-recipefork-auth.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| hero | recipefork-landing/home, recipefork-recipe-detail/recipe-detail, recipefork-cookbooks/cookbook-detail |
| card-grid | recipefork-landing/home, recipefork-social/feed, recipefork-cookbooks/cookbooks, recipefork-cookbooks/cookbook-detail, recipefork-profile/me, recipefork-profile/me, recipefork-profile/my-recipes, recipefork-profile/public-profile, recipefork-profile/public-profile |
| cta-section | recipefork-landing/home, recipefork-cookbooks/cookbooks |
| detail-header | recipefork-recipe-detail/recipe-detail, recipefork-ai-kitchen/generate, recipefork-recipe-authoring/edit |
| filter-bar | recipefork-social/feed, recipefork-profile/my-recipes |
| recipefork-activity-feed | recipefork-social/feed, recipefork-profile/public-profile |
| recipefork-recipe-metadata-form | recipefork-recipe-authoring/create, recipefork-recipe-authoring/edit |
| recipefork-cookbook-assignment | recipefork-recipe-authoring/create, recipefork-recipe-authoring/edit |
| recipefork-simple-recipe-editor | recipefork-recipe-authoring/create, recipefork-recipe-authoring/edit |
| recipefork-chef-ingredients-editor | recipefork-recipe-authoring/create, recipefork-recipe-authoring/edit |
| recipefork-chef-instruction-editor | recipefork-recipe-authoring/create, recipefork-recipe-authoring/edit |
| recipefork-presentation-editor | recipefork-recipe-authoring/create, recipefork-recipe-authoring/edit |
| recipefork-cooking-tips-editor | recipefork-recipe-authoring/create, recipefork-recipe-authoring/edit |
| recipefork-recipe-story-editor | recipefork-recipe-authoring/create, recipefork-recipe-authoring/edit |
| creator-profile | recipefork-profile/me, recipefork-profile/public-profile |
| stats-overview | recipefork-profile/me, recipefork-profile/my-recipes, recipefork-profile/public-profile |

## SEO Hints

**Schema.org types:** WebApplication, Recipe, CollectionPage, ProfilePage
**Meta priorities:** description, og:title, og:image
