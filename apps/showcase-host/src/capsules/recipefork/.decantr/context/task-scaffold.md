# Task Context: Scaffolding

**Enforcement Tier: Creative** — Guard rules are advisory during initial scaffolding.

## Primary Compiled Contract

- Start with `.decantr/context/scaffold-pack.md` for the compact route, shell, and theme contract.
- Use `.decantr/context/scaffold.md` only as secondary detail when the compiled pack is not enough.
- Read the route-local page packs before building each page so layout and wiring stay aligned with the compiled plan.

## Generate This Application

- Target: `react-vite` (react)
- Shell: `recipefork-top-nav`
- Theme: `recipefork` (light, rounded)
- Routing: `history`
- Features: marketing, seo, sharing, comments, reactions, forking, chef-mode, presentation, cooking-tips, lineage, branch-analytics, social, activity-feed, follows, engagement-ranking, lineage-cues, chat-history, image-upload, auth, generation-history, collections, visibility, recipe-saving, simple-mode, drafts, hydrated-editing, structured-ingredients, hierarchical-instructions, mode-conversion, rich-story, autosave, cookbook-assignment, profile-editing, public-profiles, oauth, supabase-auth, supabase-storage, supabase-realtime, public-browse, gated-actions

## Route Plan

- `/` -> `recipefork-landing/home` [hero, card-grid, testimonials, cta-section]
- `/recipe/:id` -> `recipefork-recipe-detail/recipe-detail` [hero, detail-header, recipefork-fork-provenance, recipefork-chef-ingredients-display, recipefork-chef-instructions-display, recipefork-presentation-display, recipefork-cooking-tips-display, comment-thread]
- `/feed` -> `recipefork-social/feed` [filter-bar, card-grid, recipefork-activity-feed]
- `/chat` -> `recipefork-ai-kitchen/chat` [chat-thread, chat-input]
- `/generate` -> `recipefork-ai-kitchen/generate` [content-uploader, detail-header]
- `/cookbooks` -> `recipefork-cookbooks/cookbooks` [card-grid, cta-section]
- `/cookbooks/:id` -> `recipefork-cookbooks/cookbook-detail` [hero, card-grid]
- `/recipe/new` -> `recipefork-recipe-authoring/create` [recipefork-recipe-mode-switch, recipefork-recipe-metadata-form, recipefork-cookbook-assignment, recipefork-simple-recipe-editor, recipefork-chef-ingredients-editor, recipefork-chef-instruction-editor, recipefork-presentation-editor, recipefork-cooking-tips-editor, recipefork-recipe-story-editor]
- `/recipe/edit/:id` -> `recipefork-recipe-authoring/edit` [detail-header, recipefork-recipe-metadata-form, recipefork-cookbook-assignment, recipefork-simple-recipe-editor, recipefork-chef-ingredients-editor, recipefork-chef-instruction-editor, recipefork-presentation-editor, recipefork-cooking-tips-editor, recipefork-recipe-story-editor]
- `/profile` -> `recipefork-profile/me` [creator-profile, account-settings, stats-overview, card-grid]
- `/recipes` -> `recipefork-profile/my-recipes` [stats-overview, filter-bar, card-grid]
- `/profile/:id` -> `recipefork-profile/public-profile` [creator-profile, stats-overview, card-grid, recipefork-activity-feed]
- `/auth` -> `recipefork-auth/login` [auth-form]

### Section Packs

- 8 compiled references available. Use `.decantr/context/pack-manifest.json` to resolve the exact files for this scope.

### Page Packs

- 13 compiled references available. Use `.decantr/context/pack-manifest.json` to resolve the exact files for this scope.

## Success Checks

- [error] Routes and page IDs match the compiled topology.
- [error] The declared shell contract is preserved unless the task explicitly mutates it.
- [warn] Theme identity and mode remain consistent across scaffolded routes.

## Token Budget

- Target: 1400 tokens
- Max: 2200 tokens
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.

Post-scaffold enforcement mode: **STRICT**.

---

*Task context generated from Decantr execution packs*