# Section Pack

**Objective:** Implement the recipefork-recipe-authoring section using the compiled recipefork-top-nav shell contract.
**Target:** react-vite (react)
**Scope:** pages=create, edit | patterns=recipefork-recipe-mode-switch, recipefork-recipe-metadata-form, recipefork-cookbook-assignment, recipefork-simple-recipe-editor, recipefork-chef-ingredients-editor, recipefork-chef-instruction-editor, recipefork-presentation-editor, recipefork-cooking-tips-editor, recipefork-recipe-story-editor, detail-header

## Section Contract
- Section: recipefork-recipe-authoring
- Role: auxiliary
- Shell: recipefork-top-nav
- Theme: recipefork (light)
- Features: simple-mode, chef-mode, drafts, image-upload, hydrated-editing, structured-ingredients, hierarchical-instructions, presentation, cooking-tips, mode-conversion, rich-story, autosave, cookbook-assignment
- Description: Dual-mode recipe authoring workspace for Recipefork with Simple Mode and Chef Mode editing, drafts, hydrated editing, a shared structured ingredient editor, safe simple-to-chef conversion, hierarchical instruction groups, optional plating presentation, inline cookbook assignment, cooking tips, and rich recipe stories.

## Section Routes
- /recipe/new -> recipefork-recipe-authoring/create @ recipefork-top-nav [recipefork-recipe-mode-switch, recipefork-recipe-metadata-form, recipefork-cookbook-assignment, recipefork-simple-recipe-editor, recipefork-chef-ingredients-editor, recipefork-chef-instruction-editor, recipefork-presentation-editor, recipefork-cooking-tips-editor, recipefork-recipe-story-editor]
- /recipe/edit/:id -> recipefork-recipe-authoring/edit @ recipefork-top-nav [detail-header, recipefork-recipe-metadata-form, recipefork-cookbook-assignment, recipefork-simple-recipe-editor, recipefork-chef-ingredients-editor, recipefork-chef-instruction-editor, recipefork-presentation-editor, recipefork-cooking-tips-editor, recipefork-recipe-story-editor]

## Theme Decorators

Theme `recipefork` decorators are documented ONCE in `scaffold-pack.md` under "Required Theme Decorators". Apply them across this section's pages — the contract is the same project-wide. See also DECANTR.md "Decorator Quick Reference" for the same table.

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- recipefork-recipe-authoring
- auxiliary
- recipefork-top-nav
- recipefork
- light
- simple-mode
- chef-mode
- drafts
- image-upload
- hydrated-editing
- structured-ingredients
- hierarchical-instructions
- presentation
- cooking-tips
- mode-conversion
- rich-story
- autosave
- cookbook-assignment
- recipefork-recipe-mode-switch
- recipefork-recipe-metadata-form
- recipefork-cookbook-assignment
- recipefork-simple-recipe-editor
- recipefork-chef-ingredients-editor
- recipefork-chef-instruction-editor
- recipefork-presentation-editor
- recipefork-cooking-tips-editor
- recipefork-recipe-story-editor
- detail-header

## Success Checks
- Section pages and routes remain coherent with the compiled topology. [error]
- The section shell contract stays consistent across its routes. [error]
- Primary section patterns are represented without adding off-contract filler sections. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
