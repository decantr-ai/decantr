# Review Pack

**Objective:** Review generated output against the compiled Decantr contract.
**Target:** react-vite (react)
**Scope:** pages=home, recipe-detail, feed, chat, generate, cookbooks, cookbook-detail, create, edit, me, my-recipes, public-profile, login | patterns=hero, card-grid, testimonials, cta-section, detail-header, recipefork-fork-provenance, recipefork-chef-ingredients-display, recipefork-chef-instructions-display, recipefork-presentation-display, recipefork-cooking-tips-display, comment-thread, filter-bar, recipefork-activity-feed, chat-thread, chat-input, content-uploader, recipefork-recipe-mode-switch, recipefork-recipe-metadata-form, recipefork-cookbook-assignment, recipefork-simple-recipe-editor, recipefork-chef-ingredients-editor, recipefork-chef-instruction-editor, recipefork-presentation-editor, recipefork-cooking-tips-editor, recipefork-recipe-story-editor, creator-profile, account-settings, stats-overview, auth-form

## Review Contract
- Review Type: app
- Shell: recipefork-top-nav
- Theme: recipefork (light)
- Routing: history
- Features: marketing, seo, sharing, comments, reactions, forking, chef-mode, presentation, cooking-tips, lineage, branch-analytics, social, activity-feed, follows, engagement-ranking, lineage-cues, chat-history, image-upload, auth, generation-history, collections, visibility, recipe-saving, simple-mode, drafts, hydrated-editing, structured-ingredients, hierarchical-instructions, mode-conversion, rich-story, autosave, cookbook-assignment, profile-editing, public-profiles, oauth, supabase-auth, supabase-storage, supabase-realtime, public-browse, gated-actions

## Review Topology
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

## Focus Areas
- route-topology
- theme-consistency
- treatment-usage
- accessibility
- responsive-design

## Review Workflow
- Read the scaffold pack and page packs before evaluating generated code.
- Compare findings against the compiled route, shell, and theme contract first.
- Escalate contract drift into essence updates when the requested output intentionally changes topology or theme identity.

## Required Setup
- Read the compiled scaffold and route packs before reviewing code.
- Use concrete evidence from the workspace instead of purely stylistic intuition.

## Allowed Vocabulary
- app
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
- route-topology
- theme-consistency
- treatment-usage
- accessibility
- responsive-design

## Success Checks
- Review findings should use the compiled route, shell, and theme contract as the baseline. [error]
- Each critique finding should cite concrete evidence from the generated workspace. [error]
- Suggested fixes should point back to code changes or essence updates when contract drift exists. [warn]

## Anti-Patterns
- Avoid inline style literals as the primary styling path.: Move visual styling into tokens.css and treatments.css instead of component-local style objects.
- Avoid hardcoded color literals.: Use CSS variables and theme decorators instead of hex, rgb, or hsl values.
- Avoid utility-framework leakage as the primary design language.: Prefer compiled Decantr treatments and contract vocabulary over ad hoc utility class stacks.

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
