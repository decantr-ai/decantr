# Mutation Pack

**Objective:** Execute the modify workflow against the compiled app contract.
**Target:** react-vite (react)
**Scope:** pages=home, recipe-detail, feed, chat, generate, cookbooks, cookbook-detail, create, edit, me, my-recipes, public-profile, login | patterns=hero, card-grid, testimonials, cta-section, detail-header, recipefork-fork-provenance, recipefork-chef-ingredients-display, recipefork-chef-instructions-display, recipefork-presentation-display, recipefork-cooking-tips-display, comment-thread, filter-bar, recipefork-activity-feed, chat-thread, chat-input, content-uploader, recipefork-recipe-mode-switch, recipefork-recipe-metadata-form, recipefork-cookbook-assignment, recipefork-simple-recipe-editor, recipefork-chef-ingredients-editor, recipefork-chef-instruction-editor, recipefork-presentation-editor, recipefork-cooking-tips-editor, recipefork-recipe-story-editor, creator-profile, account-settings, stats-overview, auth-form

## Mutation Contract
- Operation: modify
- Shell: recipefork-top-nav
- Theme: recipefork (light)
- Routing: history → BrowserRouter from react-router-dom; regular URLs (e.g. /login). Works on Vite dev, Vercel, Netlify, Cloudflare Pages.
- Features: marketing, seo, sharing, comments, reactions, forking, chef-mode, presentation, cooking-tips, lineage, branch-analytics, social, activity-feed, follows, engagement-ranking, lineage-cues, chat-history, image-upload, auth, generation-history, collections, visibility, recipe-saving, simple-mode, drafts, hydrated-editing, structured-ingredients, hierarchical-instructions, mode-conversion, rich-story, autosave, cookbook-assignment, profile-editing, public-profiles, oauth, supabase-auth, supabase-storage, supabase-realtime, public-browse, gated-actions

## Route Topology
- / -> recipefork-landing/home @ recipefork-top-nav [hero, card-grid, testimonials, cta-section]
- /recipe/:id -> recipefork-recipe-detail/recipe-detail @ recipefork-top-nav [hero, detail-header, recipefork-fork-provenance, recipefork-chef-ingredients-display, recipefork-chef-instructions-display, recipefork-presentation-display, recipefork-cooking-tips-display, comment-thread]
- /feed -> recipefork-social/feed @ recipefork-top-nav [filter-bar, card-grid, recipefork-activity-feed]
- /chat -> recipefork-ai-kitchen/chat @ recipefork-top-nav [chat-thread, chat-input]
- /generate -> recipefork-ai-kitchen/generate @ recipefork-top-nav [content-uploader, detail-header]
- /cookbooks -> recipefork-cookbooks/cookbooks @ recipefork-top-nav [card-grid, cta-section]
- /cookbooks/:id -> recipefork-cookbooks/cookbook-detail @ recipefork-top-nav [hero, card-grid]
- /recipe/new -> recipefork-recipe-authoring/create @ recipefork-top-nav [recipefork-recipe-mode-switch, recipefork-recipe-metadata-form, recipefork-cookbook-assignment, recipefork-simple-recipe-editor, recipefork-chef-ingredients-editor, recipefork-chef-instruction-editor, recipefork-presentation-editor, recipefork-cooking-tips-editor, recipefork-recipe-story-editor]
- /recipe/edit/:id -> recipefork-recipe-authoring/edit @ recipefork-top-nav [detail-header, recipefork-recipe-metadata-form, recipefork-cookbook-assignment, recipefork-simple-recipe-editor, recipefork-chef-ingredients-editor, recipefork-chef-instruction-editor, recipefork-presentation-editor, recipefork-cooking-tips-editor, recipefork-recipe-story-editor]
- /profile -> recipefork-profile/me @ recipefork-top-nav [creator-profile, account-settings, stats-overview, card-grid]
- /recipes -> recipefork-profile/my-recipes @ recipefork-top-nav [stats-overview, filter-bar, card-grid]
- /profile/:id -> recipefork-profile/public-profile @ recipefork-top-nav [creator-profile, stats-overview, card-grid, recipefork-activity-feed]
- /auth -> recipefork-auth/login @ recipefork-top-nav [auth-form]

## Workflow
- Read the page pack for the route you are modifying first.
- Stop and update the essence before changing route, shell, or pattern contracts.
- Validate and check drift after code changes complete.

## Required Setup
- Treat the compiled topology as the source of truth until the essence changes.
- Refresh Decantr context after structural mutations so downstream tasks read current packs.

## Allowed Vocabulary
- modify
- recipefork-top-nav
- recipefork
- light
- marketing
- seo
- sharing
- comments
- reactions
- forking
- chef-mode
- presentation
- cooking-tips
- lineage
- branch-analytics
- social
- activity-feed
- follows
- engagement-ranking
- lineage-cues
- chat-history
- image-upload
- auth
- generation-history
- collections
- visibility
- recipe-saving
- simple-mode
- drafts
- hydrated-editing
- structured-ingredients
- hierarchical-instructions
- mode-conversion
- rich-story
- autosave
- cookbook-assignment
- profile-editing
- public-profiles
- oauth
- supabase-auth
- supabase-storage
- supabase-realtime
- public-browse
- gated-actions
- hero
- card-grid
- testimonials
- cta-section
- detail-header
- recipefork-fork-provenance
- recipefork-chef-ingredients-display
- recipefork-chef-instructions-display
- recipefork-presentation-display
- recipefork-cooking-tips-display
- comment-thread
- filter-bar
- recipefork-activity-feed
- chat-thread
- chat-input
- content-uploader
- recipefork-recipe-mode-switch
- recipefork-recipe-metadata-form
- recipefork-cookbook-assignment
- recipefork-simple-recipe-editor
- recipefork-chef-ingredients-editor
- recipefork-chef-instruction-editor
- recipefork-presentation-editor
- recipefork-cooking-tips-editor
- recipefork-recipe-story-editor
- creator-profile
- account-settings
- stats-overview
- auth-form

## Success Checks
- Modified routes remain coherent with the compiled topology unless the essence changes first. [error]
- Theme, shell, and page identity stay aligned with the current contract during edits. [error]
- Route-local edits should start from the compiled page pack rather than improvised structure. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
