# Section Pack

**Objective:** Implement the recipefork-ai-kitchen section using the compiled recipefork-top-nav shell contract.
**Target:** react-vite (react)
**Scope:** pages=chat, generate | patterns=chat-thread, chat-input, content-uploader, detail-header

## Section Contract
- Section: recipefork-ai-kitchen
- Role: auxiliary
- Shell: recipefork-top-nav
- Theme: recipefork (light)
- Features: chat-history, image-upload, auth, generation-history
- Description: Authenticated AI kitchen workspace for Recipefork with chat history and photo-to-recipe generation flows.

## Section Routes
- /chat -> recipefork-ai-kitchen/chat @ recipefork-top-nav [chat-thread, chat-input]
- /generate -> recipefork-ai-kitchen/generate @ recipefork-top-nav [content-uploader, detail-header]

## Theme Decorators

Theme `recipefork` decorators are documented ONCE in `scaffold-pack.md` under "Required Theme Decorators". Apply them across this section's pages — the contract is the same project-wide. See also DECANTR.md "Decorator Quick Reference" for the same table.

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- recipefork-ai-kitchen
- auxiliary
- recipefork-top-nav
- recipefork
- light
- chat-history
- image-upload
- auth
- generation-history
- chat-thread
- chat-input
- content-uploader
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
