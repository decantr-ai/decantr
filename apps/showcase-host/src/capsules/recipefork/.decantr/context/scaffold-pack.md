# Scaffold Pack

**Objective:** Scaffold the recipefork app shell and declared routes.
**Target:** react-vite (react)
**Scope:** pages=home, recipe-detail, feed, chat, generate, cookbooks, cookbook-detail, create, edit, me, my-recipes, public-profile, login | patterns=hero, card-grid, testimonials, cta-section, detail-header, recipefork-fork-provenance, recipefork-chef-ingredients-display, recipefork-chef-instructions-display, recipefork-presentation-display, recipefork-cooking-tips-display, comment-thread, filter-bar, recipefork-activity-feed, chat-thread, chat-input, content-uploader, recipefork-recipe-mode-switch, recipefork-recipe-metadata-form, recipefork-cookbook-assignment, recipefork-simple-recipe-editor, recipefork-chef-ingredients-editor, recipefork-chef-instruction-editor, recipefork-presentation-editor, recipefork-cooking-tips-editor, recipefork-recipe-story-editor, creator-profile, account-settings, stats-overview, auth-form

## Scaffold Contract
- Shell: recipefork-top-nav
- Theme: recipefork (light)
- Routing: history → BrowserRouter from react-router-dom; regular URLs (e.g. /login). Works on Vite dev, Vercel, Netlify, Cloudflare Pages.
- Features: marketing, seo, sharing, comments, reactions, forking, chef-mode, presentation, cooking-tips, lineage, branch-analytics, social, activity-feed, follows, engagement-ranking, lineage-cues, chat-history, image-upload, auth, generation-history, collections, visibility, recipe-saving, simple-mode, drafts, hydrated-editing, structured-ingredients, hierarchical-instructions, mode-conversion, rich-story, autosave, cookbook-assignment, profile-editing, public-profiles, oauth, supabase-auth, supabase-storage, supabase-realtime, public-browse, gated-actions

## Route Plan
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

## Required Theme Decorators (recipefork)

These classes carry the active theme's visual identity. Tokens alone give bones; decorators give personality. Generated source MUST apply these across all sections — without them, every page reads as "themed colors only" with no theme character. Section packs reference this table; the contract is project-wide.

| Class | Intent | Apply to |
|-------|--------|----------|
| `.recipefork-surface` | Use on app roots and wide content surfaces where food photography and forms should carry the visual weight rather than decorative theme effects. | Page roots, Shell body regions |
| `.recipefork-nav` | Use for sticky product nav bars where route links, theme toggle, profile entry, and create actions share a single 64px row. | Top navigation, Sticky headers |
| `.recipefork-card` | Use for cookbook cards, feed cards, stat blocks, and editor sections that should feel product-grade but not ornamental. | Cards, Form sections, Sidebar blocks |
| `.recipefork-input` | Use on all recipe authoring and auth controls to keep the product visually consistent across simple and Chef Mode surfaces. | Inputs, Selects, Textareas |
| `.recipefork-photo` | Use for hero images, cookbook covers, and generated recipe previews where the photo is the visual anchor. | Recipe hero surfaces, Cookbook cover imagery, Photo-to-recipe previews |
| `.recipefork-editor` | Use for optional story editors and long-form recipe notes without overwhelming the surrounding authoring form. | Story editors, Expandable narrative blocks |

## Required Setup
- Treat the declared routes as the topology source of truth.
- Preserve the resolved theme and shell contract unless the task explicitly mutates them.

## Allowed Vocabulary
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
- Routes and page IDs match the compiled topology. [error]
- The declared shell contract is preserved unless the task explicitly mutates it. [error]
- Theme identity and mode remain consistent across scaffolded routes. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
