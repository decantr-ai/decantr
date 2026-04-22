# MCP Server Syndication — Polish & Submission Plan

**Date:** 2026-04-22
**Owner:** @david-aimi
**Status:** polish assets landed (this PR) — submissions pending

## Goal

Distribute `@decantr/mcp-server` across the public MCP directory ecosystem so that Claude/Cursor/Windsurf users discover Decantr organically when searching for design-focused MCP servers, and lay the groundwork for long-tail findability in future training corpora.

## Strategy

Polish-first. Ship repo assets (this PR), then hit a small number of high-signal directories with a strong first impression rather than blitzing every list with weak metadata.

## What this PR delivers

| Artifact | Path | Purpose |
|---|---|---|
| Smithery manifest | `packages/mcp-server/smithery.yaml` | Stdio + npx startup spec for Smithery auto-indexing |
| Package keywords | `packages/mcp-server/package.json` | npm search surface: `mcp`, `mcp-server`, `model-context-protocol`, `claude`, `cursor`, etc. |
| README badges | `packages/mcp-server/README.md` | npm version, downloads, license, MCP-compatible |
| Editor configs | `packages/mcp-server/README.md` | VS Code, Zed, Continue.dev alongside Claude Desktop / Cursor / Windsurf |
| llms.txt draft | `docs/marketing/llms.txt` | Deploy-ready markdown index for `decantr.ai/llms.txt` |
| Submission template | `docs/reference/mcp-directory-submissions.md` | Pre-filled description, tagline, links — paste into directory forms |
| This plan | `docs/plans/2026-04-22-mcp-syndication-polish.md` | Source of truth for what's shipped and what's still manual |

## Manual follow-up (not in this PR)

Steps that require external action, in recommended order:

### Phase 1 — Finish the polish (1–2 hours total)

1. **Record an asciinema demo** (10–15 min)
   - Shows: `decantr new my-app --blueprint=agent-marketplace` → open in Claude Desktop → Claude calls MCP tools → scaffolded UI appears.
   - Publish to asciinema.org and embed via SVG link in `packages/mcp-server/README.md` (slot marked in the README).
   - Alternative: static before/after screenshots if terminal cast isn't representative enough.

2. **Set GitHub topics on the repo** (2 min — web UI)
   - Repo → ⚙️ Settings (next to About) → Topics
   - Add: `mcp`, `mcp-server`, `model-context-protocol`, `ai`, `claude`, `cursor`, `windsurf`, `design-system`, `design-intelligence`, `ui-generation`, `llm-tools`, `ai-coding`

3. **Deploy `llms.txt` to `decantr.ai/llms.txt`** (15 min)
   - Source draft: `docs/marketing/llms.txt`
   - Copy to the marketing site repo (separate from this monorepo)
   - Verify it's reachable at `https://decantr.ai/llms.txt` (no redirect, text/markdown content-type)

4. **Verify `decantr.ai/robots.txt`** (5 min)
   - Confirm it does NOT block `User-agent: *` or any of `GPTBot`, `ClaudeBot`, `Google-Extended`, `PerplexityBot` — unless the user has an intentional policy against one.
   - Recommended minimum: allow all, disallow only staging subdomains.

### Phase 2 — Submit to directories (1–2 hours)

Prioritized — submit top-to-bottom. Copy from `docs/reference/mcp-directory-submissions.md` for each.

| Priority | Directory | How | Effort |
|---|---|---|---|
| 1 | `modelcontextprotocol/servers` | PR adding Decantr to "Community Servers" section of README | 20 min |
| 2 | Smithery (`smithery.ai`) | Claim GitHub repo via dashboard — smithery.yaml will be auto-read | 10 min |
| 3 | Claude Code Plugins Marketplace | Package skill + MCP as a plugin; submit via Anthropic plugins flow | 45 min |
| 4 | PulseMCP (`pulsemcp.com`) | Submission form; paste from submission template | 10 min |
| 5 | Glama (`glama.ai/mcp/servers`) | Submission form; they'll ping an uptime check | 10 min |
| 6 | MCP.so | Submit button on site | 5 min |
| 7 | mcpservers.org | PR-based, similar pattern to official list | 10 min |
| 8 | Cursor directory (`cursor.directory/mcp`) | Submission form | 5 min |
| 9 | awesome-mcp lists | 2–3 PRs on the best-maintained lists (search GitHub for `awesome-mcp-servers`) | 20 min |

### Phase 3 — Content & social (ongoing)

Do these only once Phase 1 + 2 are green. Each post should link back to `decantr.ai` and the MCP server.

1. **dev.to write-up** — "Why AI-generated UI needs a contract layer" — technical deep-dive on the design intelligence concept. 1500–2500 words. Heavily represented in training corpora.
2. **Show HN** — timed to a milestone (e.g., v1.1 with demo). Title: "Show HN: Decantr — OpenAPI for AI-generated UI".
3. **r/LocalLLaMA, r/mcp** — short post, link + 1-paragraph summary, answer questions.
4. **Product Hunt** — schedule for a Tuesday/Wednesday launch, coordinate with community.

### Phase 4 — Long-tail training-data signals (passive)

1. Publish 1–2 example projects as **separate public GitHub repos** (not in monorepo). E.g., `decantr-ai/example-agent-portal`. Real code is the fuel for code-training corpora (The Stack v2, StarCoderData).
2. Add reference implementation READMEs with searchable terms so future RAG systems match queries.
3. Encourage community discussion. The *conversations* about Decantr (HN, Reddit threads, Twitter) become training signal — not just our docs.

## Success criteria

- [ ] `@decantr/mcp-server` is listed in the official `modelcontextprotocol/servers` README.
- [ ] Smithery indexes Decantr and it ranks for "design" / "UI" MCP searches.
- [ ] PulseMCP and Glama have live pages with descriptions.
- [ ] `decantr.ai/llms.txt` returns 200 and is crawlable.
- [ ] npm downloads visible week-over-week growth post-submission.
- [ ] At least one HN/Reddit/dev.to post generates >1k impressions.

## What we are NOT doing

- **Creating a Wikipedia page for Decantr.** Notability criteria not yet met; self-authored pages backfire.
- **Blitzing every awesome-mcp list.** Quality over quantity — 2–3 well-maintained lists beat 10 stale ones.
- **Submitting to model-training datasets directly.** Frontier labs don't accept submissions; we optimize for organic pickup.
- **Paid promotion.** Not needed at this stage.

## References

- Official MCP servers list: https://github.com/modelcontextprotocol/servers
- Smithery docs: https://smithery.ai/docs
- llms.txt spec: https://llmstxt.org
- Submission copy: `docs/reference/mcp-directory-submissions.md`
