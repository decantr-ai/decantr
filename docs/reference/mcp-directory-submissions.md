# MCP Directory Submission Template

Pre-filled copy for submitting `@decantr/mcp-server` to MCP directories. Paste these blocks verbatim — keeps first-impression consistent across every listing.

---

## Quick facts

- **Name:** Decantr MCP Server
- **npm package:** `@decantr/mcp-server`
- **GitHub repo:** https://github.com/decantr-ai/decantr (monorepo)
- **Package path in repo:** `packages/mcp-server/`
- **Homepage:** https://decantr.ai
- **License:** MIT
- **Transport:** stdio
- **Install command:** `npx -y @decantr/mcp-server`
- **Env vars required:** none
- **Maintainer:** Decantr AI
- **Category:** developer tools / design / code generation

---

## Tagline (one line — 80 chars)

> Design intelligence for AI-generated UI — OpenAPI for the frontend.

Alternative:

> Give Claude, Cursor, and Windsurf a design contract so generated UI stays coherent.

---

## Short description (1–2 sentences — for card/listing views)

> Decantr is the contract layer between product intent and AI-generated UI. It gives coding assistants structured design inputs, registry-backed UI knowledge, and scoped context files so they build coherent product surfaces instead of improvising screen by screen.

---

## Medium description (paragraph — for detail pages)

> Decantr makes AI coding assistants generate better UI. Instead of letting Claude, Cursor, or Windsurf guess at layouts, patterns, and styling, Decantr exposes a design intelligence layer: an Essence spec that captures theme, page structure, components, and guard rules; an open registry of patterns, archetypes, and themes (official + community); and scoped context files the AI reads on demand. The MCP server gives the assistant 15 tools — essence reads, pattern resolution, pack compilation, drift detection, critique, audit — so generated code follows a coherent design system and drift is caught before it ships. Think OpenAPI, but for the frontend.

---

## Long description (~300 words — for deep-dive directories like PulseMCP)

> Decantr is a design intelligence API for AI-generated UI. It doesn't generate code — your AI assistant does. Decantr provides the structured design inputs, registry-backed UI knowledge, and governance layer that keeps AI-generated product surfaces coherent instead of a drift-prone collage of generic screens.
>
> At the core is an Essence spec (`decantr.essence.json`) that captures design intent in two layers: **DNA** — durable visual and system axioms (theme, spacing, motion, accessibility, personality) — and **Blueprint** — product topology (sections, page routes, shells, layouts, features). That split matters because not every change should be treated the same way. A theme swap or accessibility regression is different from adding a new auxiliary section. Decantr enforces governance strictly where it should be strict (DNA, errors by default) and flexibly where it should be flexible (Blueprint, warnings only).
>
> The MCP server exposes Decantr intelligence directly to Claude Desktop, Cursor, Windsurf, VS Code, Zed, and Continue.dev. 15 tools cover essence reads, registry resolution (patterns, archetypes, themes, blueprints, shells), execution-pack compilation, drift checks, file critique, and project audit. All packages are MIT-licensed; the hosted registry at `registry.decantr.ai` is open — the Decantr team publishes under `@official`, and the community can publish their own patterns, archetypes, themes, blueprints, and shells under their own namespaces. Public read access requires no API key.
>
> Typical workflow: a developer runs `decantr new my-app --blueprint=agent-marketplace` to scaffold a project with theme, sections, and context files. Their AI assistant reads `DECANTR.md` (methodology primer), loads section context files on demand as it works, and writes code against the Essence contract. Running `decantr check` catches drift; `decantr refresh` regenerates derived context files after essence edits.

---

## Tags / keywords

```
mcp, mcp-server, model-context-protocol, ai, llm, ai-coding, claude, cursor, windsurf, vs-code, zed, continue-dev, design-system, design-intelligence, ui-generation, drift-detection, frontend, code-generation, developer-tools
```

---

## Screenshots / demo

- Terminal cast (asciinema): _link once recorded_
- README install snippets: https://github.com/decantr-ai/decantr/blob/main/packages/mcp-server/README.md
- Registry portal screenshot: _capture one from https://registry.decantr.ai_

---

## Install snippets (copy verbatim into directory config-examples section)

### Claude Desktop

```json
{
  "mcpServers": {
    "decantr": {
      "command": "npx",
      "args": ["@decantr/mcp-server"]
    }
  }
}
```

### Cursor (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "decantr": {
      "command": "npx",
      "args": ["@decantr/mcp-server"]
    }
  }
}
```

### VS Code (`.vscode/mcp.json`)

```json
{
  "servers": {
    "decantr": {
      "command": "npx",
      "args": ["-y", "@decantr/mcp-server"]
    }
  }
}
```

---

## PR body — official MCP servers list (`modelcontextprotocol/servers`)

Target file: `README.md`, section: **Community Servers** (alphabetically sorted).

PR title: `Add Decantr MCP server`

PR body:

```markdown
This PR adds [Decantr](https://decantr.ai) to the Community Servers list.

### What it does

Decantr is a design intelligence layer for AI-generated UI. It exposes an Essence spec (theme, sections, patterns, guard rules) and a content registry (patterns, archetypes, themes, blueprints, shells) via 15 MCP tools so Claude, Cursor, Windsurf, VS Code, Zed, and Continue.dev can generate coherent UI against a design contract instead of improvising screen by screen.

Key tools: `decantr_create_essence`, `decantr_resolve_pattern`, `decantr_resolve_archetype`, `decantr_suggest_patterns`, `decantr_check_drift`, `decantr_critique`, `decantr_audit_project`, `decantr_get_execution_pack`.

- Package: [`@decantr/mcp-server`](https://www.npmjs.com/package/@decantr/mcp-server)
- Repo: https://github.com/decantr-ai/decantr (monorepo; server at `packages/mcp-server/`)
- Homepage: https://decantr.ai
- License: MIT

Install:

\`\`\`json
{
  "mcpServers": {
    "decantr": {
      "command": "npx",
      "args": ["@decantr/mcp-server"]
    }
  }
}
\`\`\`
```

Line to add to the Community Servers list (alphabetized):

```markdown
- **[Decantr](https://github.com/decantr-ai/decantr/tree/main/packages/mcp-server)** — Design intelligence for AI-generated UI. Exposes an Essence spec and a registry of patterns, archetypes, themes, and blueprints so AI assistants generate coherent UI against a design contract.
```

---

## Submission checklist

Use this when working through the directories:

- [ ] modelcontextprotocol/servers — PR opened
- [ ] modelcontextprotocol/servers — PR merged
- [ ] Smithery — repo claimed, smithery.yaml picked up
- [ ] Smithery — listing live with description
- [ ] Claude Code Plugins Marketplace — packaged as plugin
- [ ] Claude Code Plugins Marketplace — submitted
- [ ] PulseMCP — submission form filed
- [ ] PulseMCP — listing live
- [ ] Glama — submission form filed, uptime check passes
- [ ] MCP.so — submitted
- [ ] mcpservers.org — PR opened
- [ ] Cursor directory — submitted
- [ ] awesome-mcp PRs — opened (2–3 lists)
- [ ] Asciinema demo — recorded and embedded in README
- [ ] `decantr.ai/llms.txt` — deployed
- [ ] GitHub repo topics — set

---

## Tone guide

Keep every submission consistent with the Decantr voice:

- **Direct, not salesy.** "Design intelligence for AI-generated UI" — not "revolutionary AI-powered design automation".
- **Developer-to-developer.** Assume the reader has shipped an AI coding workflow and is tired of generic output.
- **Concrete value prop.** Lead with what problem it solves (drift, inconsistency) — not the underlying architecture.
- **No hype words.** Avoid "seamless", "cutting-edge", "game-changing". Say what it does.
