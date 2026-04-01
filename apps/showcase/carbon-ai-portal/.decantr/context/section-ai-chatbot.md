# Section: ai-chatbot

**Role:** primary | **Shell:** chat-portal | **Archetype:** ai-chatbot
**Description:** AI chatbot interface with conversation sidebar, message thread, and anchored input. Core interface for chat-first AI applications.
**Shell structure:** AI chatbot layout with collapsible conversation sidebar and anchored input. Used by ai-chatbot archetype for chat-first applications.
**Regions:** header, nav, body

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme tokens:** see `src/styles/tokens.css` — use `var(--d-primary)`, `var(--d-bg)`, etc.

**Decorators:** see `src/styles/decorators.css` — available classes: carbon-card, carbon-code, carbon-glass, carbon-input, carbon-canvas, carbon-divider, carbon-skeleton, carbon-bubble-ai, carbon-fade-slide, carbon-bubble-user

---

**Zone:** App (primary) — chat-portal shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

chat, markdown, code-highlight, file-upload, mentions, reactions, export

---

## Personality

professional, minimal, developer-focused, polished

---

## Pages

### chat (/chat/:id)

Layout: header → messages → input

#### Pattern: messages



**Components:** 

**Layout slots:**
- `messages`: Message bubbles (user/assistant, content, timestamp)

### new (/chat)

Layout: empty-thread → input

#### Pattern: empty-thread



**Components:** 

**Layout slots:**
- `illustration`: Empty state illustration or icon
- `message`: Welcome/empty state message
- `suggestions`: Suggested actions or prompts
