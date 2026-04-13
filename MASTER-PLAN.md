# MASTER PLAN — Decantr

> Superseded on 2026-04-08 by `docs/programs/2026-04-08-decantr-vnext-master-program.md`.
>
> This file is retained as historical context. The active strategic planning source of truth for the reset branch is the vNext master program and its companion audits/specs.

**MASTER PLAN MODE ACTIVE — Current Phase: 0 (Validation & Foundation)**

---

## 1. Core Vision (Locked)

Decantr is **OpenAPI for AI-generated UI**. It is a design intelligence layer that sits between AI code generators (Claude, Cursor, v0, Bolt, Copilot) and the code they produce. Decantr does not generate code. It provides the structured methodology, validated schemas, reusable design building blocks, and drift-prevention rules that make AI-generated code coherent, consistent, and production-quality.

The user's AI generates the code. Decantr provides the intelligence.

**Exact words from the founder:**
> "The diamond is the Decantation Process + Registry + Essence + Cork. The runtime is the setting. Sell the diamond."
> "Think OpenAPI for AI-generated UI."
> "We don't care what you build with. We care what you build."

**Revenue model:** Freemium SaaS. Open-source the spec and local tools. Monetize hosted intelligence, private registries, and enterprise governance.

**What Decantr is NOT:**
- Not a UI framework
- Not a code generator
- Not a React/Vue/Svelte library
- Not competing with v0/Bolt/Lovable on code generation speed

---

## 2. Phase 0: Validation & Foundation

### 2.1 Terminology Normalization

**Problem:** The current codebase uses wine-making metaphors (Essence, Vintage, Vignette, Cork, Tannins, Blend, Carafe, Clarity, etc.) that create a readability barrier for developer adoption. The metaphors need to be normalized to plain, intuitive language while preserving the brand identity where it adds value.

**Proposal — Keep vs Normalize:**

| Current (Wine) | Proposed | Rationale |
|----------------|----------|-----------|
| **Essence** | **Essence** (keep) | Core brand term. "Essence file" is intuitive. Like "OpenAPI spec." |
| **Essence Pipeline** | **Design Pipeline** | "Essence Pipeline" is redundant. "Design Pipeline" is self-explanatory. |
| **POUR** | **Intent** | User expresses what they want. "Intent" is universal. |
| **TASTE** | **Interpret** | System interprets intent into structured form. |
| **SETTLE** | **Decompose** | Break intent into layers (theme, structure, features). |
| **CLARIFY** | **Specify** | Write the machine-readable spec (essence.json). |
| **DECANT** | **Compose** | Resolve page layouts from patterns + recipes. |
| **SERVE** | **Generate** | Produce code from the composition. (Done by user's AI, not us.) |
| **AGE** | **Guard** | Validate every change against the spec. Prevent drift. |
| **Vintage** | **Theme** | Style + mode + shape. "Theme" is universal. |
| **Vignette** | **Blueprint** | A composed app template. "Blueprint" is intuitive. |
| **Archetype** | **Archetype** (keep) | Already clear. "Dashboard archetype" works. |
| **Pattern** | **Pattern** (keep) | Already clear. Industry-standard term. |
| **Recipe** | **Recipe** (keep) | Already clear. "Visual recipe" works. |
| **Carafe** | **Shell** | App shell layout. "Shell" is the standard term. |
| **Blend** | **Layout** | Page composition. "Layout" is universal. |
| **Character** | **Personality** | Brand traits. "Personality" is more intuitive. |
| **Clarity** | **Density** | Spatial density. Already aliased in the schema. |
| **Tannins** | **Features** | Functional systems (auth, search, payments). |
| **Cork** | **Guard** | Drift prevention rules. "Guard" is self-explanatory. |
| **Vessel** | **Platform** | SPA/MPA, routing mode. Already aliased in schema. |
| **Plumbing** | **Wiring** | Cross-pattern state sharing. Already used in code. |
| **Decantation Process** | **Design Pipeline** | The methodology name. |

**Terms that survive as brand language (marketing only, not in code/schema):**
- "Decantation" — used in marketing copy, blog posts, brand story
- "Essence" — kept in code and schema (it's the product name for the spec)

**Status:** APPROVED (2026-03-26). Founder confirmed: Essence stays, Blueprint for Vignette, Personality for Character. Styles renamed to Themes and kept in registry.

**Inputs:** Current schema field names, codebase grep of all wine terms
**Outputs:** Approved terminology mapping table
**Acceptance criteria:** Founder approves each row. No ambiguous terms remain.
**Dependencies:** None — this is the first decision.
**Risks:** Renaming breaks existing tests and schema. Mitigated by clean slate approach (nuking non-diamond code).
**Time estimate:** 1 hour to finalize mapping, 2-4 hours to rename across diamond packages.

---

### 2.2 Codebase Audit & Cleanup (Clean Slate)

**Problem:** The monorepo contains packages that don't serve the Design Intelligence API vision. These need to be removed completely — no versioning, no deprecation, just deleted.

**What gets NUKED:**

| Package/Directory | Reason |
|-------------------|--------|
| `packages/generator-react/` | Code generation is not the product. Reference implementation at best. |
| `packages/generator-decantr/` | Framework-specific. External runtime. |
| `packages/cli/` | Lower priority than MCP. Duplicates core functionality. Rebuild later if needed. |
| `apps/registry-server/` | Backend infrastructure premature for MVP. Content served statically. |
| `examples/` | Generated from nuked generators. |
| `tools/` | Auto-task runner tied to old workflow. |
| `logs/` | Runtime artifacts. |
| `content/styles/` | Style metadata only useful with framework runtime. Not part of core intelligence. |
| `VISION.md` | Outdated. Replaced by this master plan. |
| `CLAUDE.md` | Outdated. Will be rewritten for new scope. |
| `docs/` | Contains old honest assessment. Will be replaced. |

**What gets KEPT (diamond):**

| Package/Directory | Purpose |
|-------------------|---------|
| `packages/essence-spec/` | Schema, validator, guard rules, TypeScript types |
| `packages/registry/` | Content resolver, wiring rules, pattern preset resolution |
| `packages/generator-core/` | IR pipeline (Essence → framework-agnostic intermediate representation) |
| `packages/mcp-server/` | MCP tools exposing design intelligence to AI assistants |
| `content/core/` | Core content: shells (carafes.json), hero pattern, default recipe |
| `content/patterns/` | 9 community patterns with presets, blend specs, component lists |
| `content/archetypes/` | 19 app archetypes with page maps, suggested themes |
| `content/vignettes/` | 10 archetype compositions (blueprints) |
| `content/recipes/` | Recipe directory (currently empty, core recipe in content/core/) |

**Inputs:** Current monorepo state, audit results
**Outputs:** Clean monorepo with only diamond packages + content
**Acceptance criteria:**
- `pnpm install && pnpm build && pnpm test` passes with only diamond packages
- No references to removed packages remain in kept code
- Git history preserved (delete files, don't rewrite history)
**Dependencies:** 2.1 (terminology decision — affects what we rename during cleanup)
**Responsible:** Founder + Claude
**Time estimate:** 4-6 hours (delete packages, update workspace config, fix imports, update tests)
**Risks:**
- Diamond packages may import from nuked packages (generator-core imports generator types). Probability: HIGH. Impact: MEDIUM. Mitigation: Audit imports before deleting. Remove plugin-specific types from generator-core.
- Tests in diamond packages may reference nuked packages. Probability: HIGH. Impact: LOW. Mitigation: Remove those tests.

---

### 2.3 Market Reality Check

**Problem:** Before building, validate that the positioning is real and not just internally compelling.

**Research tasks (1-2 hours each):**

#### 2.3.1 Competitive landscape audit
- [ ] Search for existing "OpenAPI for UI" or "UI schema" standards
- [ ] Check if v0/Bolt/Lovable have any design spec format
- [ ] Check if Figma/Framer have machine-readable design intent formats
- [ ] Check MCP server ecosystem — what design tools already have MCP servers?
- [ ] Document findings in `docs/research/competitive-landscape.md`

**Inputs:** Web search, MCP server directories, competitor docs
**Outputs:** Competitive landscape document with positioning gaps identified
**Acceptance criteria:** At least 5 competitors/adjacent tools analyzed. Clear "Decantr is different because ___" statement.
**Time estimate:** 3-4 hours
**Risks:** Discover that someone already built this. Probability: LOW (no one has). Impact: HIGH. Mitigation: Pivot to differentiation, not abandonment.

#### 2.3.2 User persona validation
- [ ] Define 3 concrete user personas with specific pain points
- [ ] For each persona: what they use today, what's broken, how Decantr helps
- [ ] Document in `docs/research/user-personas.md`

**Inputs:** Founder's domain knowledge, developer community observation
**Outputs:** 3 validated personas with jobs-to-be-done
**Acceptance criteria:** Each persona has a concrete "day in the life" scenario showing where Decantr fits.
**Time estimate:** 2 hours
**Risks:** Personas are too abstract. Mitigation: Ground each in a real person the founder knows or a real forum post/tweet.

#### 2.3.3 Pricing validation
- [ ] Research comparable developer tool pricing (Vercel, Supabase, PlanetScale, Linear)
- [ ] Map pricing to value delivered at each tier
- [ ] Document in `docs/research/pricing-model.md`

**Inputs:** Competitor pricing pages, developer willingness-to-pay data
**Outputs:** Validated pricing tiers with justification
**Acceptance criteria:** Each tier has a "willingness to pay" justification and a comparable market reference.
**Time estimate:** 2 hours

---

### 2.4 Define the Product Surface Area

**Problem:** "Design Intelligence API" is a positioning statement, not a product spec. Need to define exactly what the product does, endpoint by endpoint, tool by tool.

#### 2.4.1 MCP Server — Tool Inventory (the core product)

The MCP server is the primary distribution channel. AI assistants call these tools during code generation. This is how developers experience Decantr without installing anything (their AI assistant has it).

**Current tools (from audit):**
1. `decantr_read_essence` — Read the current essence.json
2. `decantr_validate` — Validate essence against schema + guard rules
3. `decantr_search_registry` — Search patterns/archetypes/recipes
4. `decantr_resolve_pattern` — Get pattern details (blend, presets, code examples)
5. `decantr_resolve_archetype` — Get archetype details (pages, features, suggested theme)

**Proposed additional tools:**
6. `decantr_create_essence` — Given a natural language description, return a valid Essence spec (the AI does this using our schema + examples as context — WE don't call an LLM, the user's AI does)
7. `decantr_resolve_recipe` — Get recipe decoration rules (background effects, nav styles, spatial hints)
8. `decantr_resolve_blueprint` — Get blueprint (vignette) composition with all resolved archetypes
9. `decantr_check_drift` — Given an essence + code snippet, check for guard violations
10. `decantr_suggest_patterns` — Given a page description, suggest appropriate patterns from registry

**Status:** PENDING SPEC REVIEW

**Inputs:** Current MCP server code, tool audit, user workflow analysis
**Outputs:** Final tool inventory with exact input/output schemas for each tool
**Acceptance criteria:** Every tool has: name, description, input JSON schema, output JSON schema, example input/output, error cases
**Dependencies:** 2.1 (terminology — tool names use normalized terms)
**Time estimate:** 4-6 hours to spec all tools
**Risks:** Over-scoping tools. Mitigation: Ship tools 1-5 first (they already work), add 6-10 incrementally.

#### 2.4.2 Essence Spec v3 — Schema Redesign

The current Essence v2 schema uses wine terminology in field names. With the terminology normalization (2.1), the schema needs a clean v3 version.

**Scope:**
- [ ] Rename all wine-term fields to normalized terms
- [ ] Review and simplify schema structure
- [ ] Ensure backward compatibility is NOT required (clean slate)
- [ ] Add JSON Schema `$id` and proper `$schema` references
- [ ] Write human-readable documentation for every field
- [ ] Publish schema at a stable URL (e.g., `https://decantr.ai/schemas/essence.v3.json`)

**Inputs:** Current essence.v2.json schema, terminology mapping from 2.1
**Outputs:** essence.v3.json with full documentation
**Acceptance criteria:**
- Every field has a `description` in the JSON Schema
- No wine metaphor field names remain (except "essence" itself)
- Schema validates all existing content (archetypes, patterns, etc.)
- At least 3 example essence files demonstrating different app types
**Dependencies:** 2.1 (terminology mapping approved)
**Time estimate:** 6-8 hours
**Risks:** Schema changes break content JSON files. Mitigation: Update content files as part of this step.

#### 2.4.3 Content Audit & Normalization

All 51 content JSON files need field names normalized to match v3 schema.

**Inputs:** Approved terminology mapping, essence.v3.json schema
**Outputs:** All content files updated with normalized field names
**Acceptance criteria:** Every content file passes v3 schema validation
**Dependencies:** 2.4.2 (v3 schema)
**Time estimate:** 3-4 hours (mostly automated find-and-replace + manual review)

---

## 3. Phase 1: Business Model & Monetization Blueprint

### 3.1 Revenue Architecture

**Tiered model:**

| Tier | What User Gets | Price | How It Works |
|------|---------------|-------|--------------|
| **Free (Open Source)** | Essence spec, local MCP server, community registry (read-only), CLI validation, guard rules | $0 | npm packages, runs locally |
| **Pro** | Hosted MCP server (zero-config for AI assistants), full registry API access, usage analytics, priority content updates | $29/mo | API key, hosted on our infra |
| **Team** | Private registry (team patterns behind auth), guard dashboard (drift detection UI), CI/CD GitHub Action, team analytics | $99/mo/seat | SaaS dashboard + API |
| **Enterprise** | SSO/RBAC, audit trail, custom guard rules, on-prem registry, SLA, dedicated support | Custom | Sales-led |

### 3.2 Unit Economics (to be validated)

**Assumptions:**
- Pro tier: $29/mo × target 100 users in 6 months = $2,900 MRR
- Team tier: $99/mo × target 10 teams (avg 5 seats) in 6 months = $4,950 MRR
- Total 6-month target: ~$8K MRR

**Cost structure (Phase 1):**
- Fly.io hosting (registry API): ~$5-10/mo (scale to zero)
- Domain (decantr.ai): already owned
- npm publishing: free
- GitHub: free (public repos)
- Stripe: 2.9% + $0.30 per transaction
- Claude API for development: existing subscription

**Break-even:** ~3-5 Pro subscribers cover infrastructure costs

### 3.3 Monetization Implementation Steps

- [ ] **3.3.1** Set up Stripe account with product/price objects for each tier
- [ ] **3.3.2** Design API key system (generation, validation, rate limiting)
- [ ] **3.3.3** Implement usage metering (MCP tool calls, registry queries)
- [ ] **3.3.4** Build billing webhook handler (Stripe → API key provisioning)

**Dependencies:** Phase 2 (technical architecture) informs implementation
**Time estimate:** 2-3 days
**Risks:** Premature optimization. Mitigation: Start with manual API key provisioning, automate later.

---

## 4. Phase 2: Technical Architecture & Stack Decision

### 4.1 Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│ decantr.ai (Landing + Docs)                          │
│ Static site — Astro or Next.js on Vercel             │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ api.decantr.ai (Registry + Guard + Intelligence API) │
│ Hono on Fly.io — scale to zero                      │
│                                                      │
│ GET  /v1/patterns                                    │
│ GET  /v1/archetypes                                  │
│ GET  /v1/recipes                                     │
│ GET  /v1/blueprints                                  │
│ GET  /v1/shells                                      │
│ POST /v1/validate (essence → guard violations)       │
│ POST /v1/drift    (essence + code → drift report)    │
│ GET  /v1/schema   (serve essence.v3.json)            │
│                                                      │
│ Auth: API key in header (free tier = no key needed   │
│ for public content, rate limited)                    │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ @decantr/mcp-server (npm package)                    │
│ Runs locally in user's Claude/Cursor/Windsurf        │
│                                                      │
│ Free tier: resolves from bundled content              │
│ Pro tier: resolves from api.decantr.ai with API key  │
│           (more patterns, fresher content, analytics) │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ @decantr/essence-spec (npm package)                  │
│ Pure schema + validator + guard rules                │
│ Zero dependencies. Works anywhere.                   │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ Content (JSON files in git repo)                     │
│ Patterns, archetypes, recipes, blueprints, shells    │
│ Served via API, bundled in MCP server                │
│ Community contributes via PRs                        │
└──────────────────────────────────────────────────────┘
```

### 4.2 Stack Decisions

| Component | Choice | Why |
|-----------|--------|-----|
| API server | Hono on Fly.io | Already have Fly.io account. Hono is fast, TypeScript, scale-to-zero capable. Already built (registry-server was Hono). |
| Database | SQLite via Turso (or local file) | Zero cost at low scale. Turso free tier = 8GB. No managed DB bill. |
| Auth | API key + Stripe customer ID | Simple. No OAuth complexity needed for v1. |
| Static site | Astro on Vercel/Cloudflare | Free hosting. Astro = fast, content-focused. |
| npm packages | pnpm workspace → npm publish | Already configured. |
| Content storage | Git repo (JSON files) | Free. PRs for community contributions. API serves from git-synced DB. |
| MCP server | stdio (local) or SSE (hosted) | stdio for free tier (local). SSE for pro tier (hosted). |
| Payments | Stripe | Industry standard. Good free tier. |
| CI/CD | GitHub Actions | Already configured. |

### 4.3 Monorepo Structure (Post-Cleanup)

```
decantr-monorepo/
├── packages/
│   ├── essence-spec/      # Schema, validator, guard rules, types
│   ├── registry/           # Content resolver, wiring rules
│   ├── core/               # IR pipeline (essence → framework-agnostic structure)
│   └── mcp-server/         # MCP tools for AI assistants
├── content/
│   ├── core/               # Shells, default pattern, default recipe
│   ├── patterns/           # 9 community patterns
│   ├── archetypes/         # 19 app archetypes
│   ├── blueprints/         # 10 archetype compositions (renamed from vignettes)
│   ├── themes/             # 10 design aesthetics (renamed from styles)
│   └── recipes/            # Visual recipes
├── apps/
│   ├── api/                # Hono API server (new, rebuilt)
│   └── web/                # Landing page + docs (new)
├── MASTER-PLAN.md          # This document
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

**Note:** `packages/generator-core` renamed to `packages/core` — it's no longer just a "generator" core, it's THE core.

---

## 5. Phase 3: MVP Scope & Granular Build Roadmap

### MVP Definition

**The MVP is:** A published MCP server that makes Claude/Cursor generate better UI code by providing design intelligence (patterns, archetypes, guard rules) during generation.

**The MVP is NOT:** A hosted API, a dashboard, a billing system, or a community platform. Those come after the MCP server proves value.

### Week 1: Clean Slate & Foundation

#### Day 1-2: Nuke & Restructure

**Step 3.1.1: Delete non-diamond packages**
- Inputs: Current monorepo
- Actions:
  - `rm -rf packages/generator-react packages/generator-decantr packages/cli apps/ examples/ tools/ logs/ docs/`
  - Rename `content/styles/` → `content/themes/` (kept as design aesthetic metadata in registry)
  - Remove `VISION.md`, `CLAUDE.md` (will be rewritten)
- Outputs: Monorepo with only essence-spec, registry, generator-core, mcp-server, content/
- Acceptance criteria: `ls packages/` shows exactly 4 directories
- Time: 30 minutes
- Risks: None (git history preserves everything)

**Step 3.1.2: Rename generator-core → core**
- Inputs: packages/generator-core/
- Actions:
  - Rename directory
  - Update package.json `name` field to `@decantr/core`
  - Update all internal imports across other packages
  - Update pnpm-workspace.yaml
  - Update tsconfig references
- Outputs: `packages/core/` with all references updated
- Acceptance criteria: `pnpm build` succeeds
- Time: 1-2 hours
- Dependencies: 3.1.1
- Risks: Missed import references. Mitigation: `grep -r "generator-core" packages/`

**Step 3.1.3: Remove generator plugin system from core**
- Inputs: packages/core/src/
- Actions:
  - Remove `GeneratorPlugin` type and plugin-related exports
  - Remove `emit()` from pipeline (the pipeline produces IR only, no code)
  - Keep `runPipeline()` but change return type to just `IRAppNode` (no `GeneratedFile[]`)
  - Remove framework-specific types (GeneratedFile, etc.)
  - Update tests to assert IR output, not generated files
- Outputs: Core package that takes Essence → returns IR. No code generation.
- Acceptance criteria: `pnpm test` passes. No references to plugins, emit, or GeneratedFile remain.
- Time: 3-4 hours
- Dependencies: 3.1.2
- Risks: Removing too much. Mitigation: Check what MCP server imports from core before deleting.

**Step 3.1.4: Rename content/vignettes → content/blueprints**
- Inputs: Approved terminology mapping from Phase 0
- Actions:
  - Rename directory
  - Update any references in registry package
  - Update any references in content files
- Outputs: content/blueprints/ with all references updated
- Acceptance criteria: Registry resolver finds blueprints correctly
- Time: 30 minutes
- Dependencies: 2.1 (terminology approved)

**Step 3.1.5: Verify clean build**
- Inputs: Restructured monorepo
- Actions:
  - `pnpm install`
  - `pnpm build`
  - `pnpm test`
  - Fix any remaining broken imports/tests
- Outputs: Green build with only diamond packages
- Acceptance criteria: All tests pass. `pnpm build` produces no errors.
- Time: 1-2 hours
- Dependencies: 3.1.1 through 3.1.4

#### Day 2-3: Terminology Normalization in Code

**Step 3.1.6: Apply terminology normalization to essence-spec**
- Inputs: Approved terminology mapping, packages/essence-spec/
- Actions:
  - Rename schema fields (vintage → theme, etc.) — many already normalized
  - Update JSON Schema (essence.v3.json)
  - Update TypeScript types
  - Update validator
  - Update guard rules
  - Update all tests
- Outputs: essence-spec using normalized terminology throughout
- Acceptance criteria: Schema validates. All tests pass. No wine terms in field names.
- Time: 4-6 hours
- Dependencies: 2.1 (terminology approved), 3.1.5 (clean build)

**Step 3.1.7: Apply terminology normalization to registry**
- Inputs: Approved terminology mapping, packages/registry/
- Actions:
  - Rename types (Vignette → Blueprint, Carafe → Shell, etc.)
  - Update resolver functions
  - Update content loading paths
  - Update tests
- Outputs: Registry using normalized terminology
- Acceptance criteria: All tests pass. Registry resolves all content correctly.
- Time: 2-3 hours
- Dependencies: 3.1.6

**Step 3.1.8: Apply terminology normalization to content files**
- Inputs: Approved terminology mapping, content/
- Actions:
  - Update field names in all 51 JSON files
  - Rename directories as needed
  - Validate all content against updated schema
- Outputs: All content files using normalized terminology
- Acceptance criteria: Every content file passes v3 schema validation
- Time: 2-3 hours
- Dependencies: 3.1.6, 3.1.7

**Step 3.1.9: Apply terminology normalization to core**
- Inputs: Approved terminology mapping, packages/core/
- Actions:
  - Rename IR types
  - Update pipeline functions
  - Update tests
- Outputs: Core package using normalized terminology
- Acceptance criteria: All tests pass. IR output uses normalized terms.
- Time: 2-3 hours
- Dependencies: 3.1.6, 3.1.7

**Step 3.1.10: Apply terminology normalization to mcp-server**
- Inputs: Approved terminology mapping, packages/mcp-server/
- Actions:
  - Rename tool names (e.g., `decantr_resolve_pattern` stays, but parameter names normalize)
  - Update tool descriptions
  - Update input/output schemas
  - Update tests
- Outputs: MCP server tools using normalized terminology
- Acceptance criteria: All tests pass. MCP tools return normalized field names.
- Time: 1-2 hours
- Dependencies: 3.1.6, 3.1.7, 3.1.9

### Week 2: MCP Server Enhancement

#### Day 4-5: New MCP Tools

**Step 3.2.1: Implement `decantr_resolve_recipe` tool**
- Inputs: Registry package's recipe resolution
- Actions:
  - Add new tool to MCP server
  - Input schema: `{ recipe: string }`
  - Output: Full recipe JSON (decoration rules, spatial hints, pattern preferences)
  - Add tests
- Outputs: Working tool with tests
- Acceptance criteria: Tool returns complete recipe data. Test covers happy path + not-found case.
- Time: 2-3 hours
- Dependencies: 3.1.10

**Step 3.2.2: Implement `decantr_resolve_blueprint` tool**
- Inputs: Registry package's blueprint (vignette) resolution
- Actions:
  - Add new tool to MCP server
  - Input schema: `{ blueprint: string }`
  - Output: Full blueprint with resolved archetypes, page maps, suggested theme
  - Add tests
- Outputs: Working tool with tests
- Acceptance criteria: Tool returns fully resolved blueprint. Test covers all 10 blueprints.
- Time: 2-3 hours
- Dependencies: 3.1.10

**Step 3.2.3: Implement `decantr_suggest_patterns` tool**
- Inputs: Pattern content files, registry search capability
- Actions:
  - Add new tool to MCP server
  - Input schema: `{ description: string, page_type?: string }`
  - Output: Ranked list of matching patterns with relevance reasoning
  - Matching logic: keyword match against pattern descriptions, component lists, tags
  - Add tests
- Outputs: Working tool with tests
- Acceptance criteria: Given "dashboard with metrics," returns kpi-grid, chart-grid, data-table. Test covers 3+ scenarios.
- Time: 3-4 hours
- Dependencies: 3.1.10

**Step 3.2.4: Implement `decantr_check_drift` tool**
- Inputs: Guard rules from essence-spec
- Actions:
  - Add new tool to MCP server
  - Input schema: `{ essence: object, context: { page_id: string, components_used: string[], style_used: string } }`
  - Output: List of guard violations with severity and fix suggestions
  - Uses existing `evaluateGuard()` from essence-spec
  - Add tests
- Outputs: Working tool with tests
- Acceptance criteria: Detects style mismatch, missing page, recipe violation. Test covers all 5 guard rules.
- Time: 3-4 hours
- Dependencies: 3.1.10

**Step 3.2.5: Implement `decantr_create_essence` tool**
- Inputs: Schema, archetypes, blueprints
- Actions:
  - Add new tool to MCP server
  - Input schema: `{ description: string, target?: string }`
  - Output: A valid essence.json skeleton based on the closest matching archetype/blueprint
  - Logic: Match description keywords → archetype → resolve blueprint → fill in essence template
  - This does NOT call an LLM — it returns a structured template that the user's AI can refine
  - Add tests
- Outputs: Working tool with tests
- Acceptance criteria: Given "SaaS dashboard with analytics," returns a valid essence.json using saas-dashboard archetype. Test covers 5+ descriptions.
- Time: 4-6 hours
- Dependencies: 3.2.2

#### Day 6: MCP Server Documentation & Testing

**Step 3.2.6: Write MCP server README**
- Inputs: All tool specs
- Actions:
  - Document every tool with input/output examples
  - Add Claude Desktop configuration JSON
  - Add Cursor configuration
  - Add VS Code MCP extension configuration
  - Include quickstart guide
- Outputs: README.md in packages/mcp-server/
- Acceptance criteria: A developer can copy-paste the config and have Decantr working in Claude within 2 minutes.
- Time: 2-3 hours
- Dependencies: 3.2.1 through 3.2.5

**Step 3.2.7: End-to-end MCP server testing**
- Inputs: MCP server with all tools
- Actions:
  - Test every tool manually in Claude Desktop
  - Test with a real prompt: "Build me a SaaS dashboard"
  - Verify Claude uses Decantr tools during generation
  - Document any issues
- Outputs: Test report with screenshots
- Acceptance criteria: Claude successfully calls Decantr tools and produces better code because of it.
- Time: 3-4 hours
- Dependencies: 3.2.6

### Week 3: npm Publishing & Landing Page

#### Day 7-8: Publish to npm

**Step 3.3.1: Prepare packages for npm publishing**
- Inputs: Clean, tested packages
- Actions:
  - Add `publishConfig` to each package.json
  - Set version to `1.0.0-beta.1` (first real release)
  - Add LICENSE (MIT) to each package
  - Add `files` field to each package.json (only publish dist/ + schema/)
  - Verify `pnpm build` produces correct dist/ output
  - Add `bin` field to mcp-server (for `npx @decantr/mcp-server`)
- Outputs: Publishable packages
- Acceptance criteria: `npm pack --dry-run` shows correct files for each package. No dev files, no tests, no source maps in published package.
- Time: 2-3 hours
- Dependencies: Week 2 complete

**Step 3.3.2: Set up npm publishing workflow**
- Inputs: GitHub Actions
- Actions:
  - Create `.github/workflows/publish.yml`
  - Trigger: push git tag `v*`
  - Steps: install → build → test → publish all packages
  - Requires: NPM_TOKEN secret in GitHub
- Outputs: Working CI/CD publish pipeline
- Acceptance criteria: Pushing `v1.0.0-beta.1` tag publishes all packages to npm.
- Time: 1-2 hours
- Dependencies: 3.3.1

**Step 3.3.3: Publish beta to npm**
- Inputs: Tagged release
- Actions:
  - `git tag v1.0.0-beta.1`
  - `git push --tags`
  - Verify packages appear on npmjs.com
  - Test: `npx @decantr/mcp-server` works from a clean machine
- Outputs: Published packages on npm
- Acceptance criteria: `npm info @decantr/essence-spec` returns package info. `npx @decantr/mcp-server` starts without errors.
- Time: 1 hour
- Dependencies: 3.3.2

#### Day 9-10: Landing Page

**Step 3.3.4: Build landing page at decantr.ai**
- Inputs: Product positioning, MCP server docs
- Actions:
  - Static site (Astro or plain HTML)
  - Sections: Hero, What is Decantr, How it works, MCP Setup, Schema docs, GitHub link
  - Deploy to Vercel or Cloudflare Pages (free)
  - No pricing page yet (all free in beta)
- Outputs: Live landing page
- Acceptance criteria: Page loads, explains what Decantr is, has MCP setup instructions, links to GitHub and npm.
- Time: 4-6 hours
- Dependencies: 3.3.3 (need npm links)

**Step 3.3.5: Write CLAUDE.md for monorepo**
- Inputs: New product scope, terminology
- Actions:
  - Rewrite CLAUDE.md to reflect Design Intelligence API scope
  - Remove all framework-specific content
  - Add normalized terminology table
  - Add package overview
  - Add development commands
- Outputs: Updated CLAUDE.md
- Acceptance criteria: A fresh Claude session reading CLAUDE.md understands the product correctly.
- Time: 1-2 hours

**Step 3.3.6: Write root README.md**
- Inputs: Product positioning
- Actions:
  - Rewrite README.md for the monorepo
  - Focus on: what Decantr is, how to use the MCP server, link to schema docs
  - No framework-specific content
- Outputs: Updated README.md
- Acceptance criteria: A developer reading the README understands what Decantr does within 30 seconds.
- Time: 1-2 hours

### Week 4: API Server & Registry

#### Day 11-13: Build API Server

**Step 3.4.1: Create apps/api/ with Hono**
- Inputs: Content files, registry package
- Actions:
  - New Hono server in apps/api/
  - Endpoints:
    - `GET /v1/patterns` — list all patterns
    - `GET /v1/patterns/:id` — get pattern by ID
    - `GET /v1/archetypes` — list all archetypes
    - `GET /v1/archetypes/:id` — get archetype by ID
    - `GET /v1/blueprints` — list all blueprints
    - `GET /v1/blueprints/:id` — get blueprint by ID
    - `GET /v1/recipes` — list all recipes
    - `GET /v1/recipes/:id` — get recipe by ID
    - `GET /v1/shells` — list all shell layouts
    - `GET /v1/schema` — serve essence.v3.json
    - `POST /v1/validate` — validate essence against schema + guard rules
    - `GET /health` — health check
  - Content loaded from bundled JSON files (no database needed for v1)
  - Add rate limiting (100 req/min for unauthenticated, unlimited for API key)
  - Add CORS headers
  - Add tests for all endpoints
- Outputs: Working API server with all endpoints
- Acceptance criteria: All endpoints return correct data. Tests pass. Rate limiting works.
- Time: 6-8 hours
- Dependencies: Week 1-2 complete (content normalized)
- Risks: Over-engineering the API. Mitigation: No database. Serve JSON files directly. Add DB later if needed.

**Step 3.4.2: Deploy API to Fly.io**
- Inputs: apps/api/ server
- Actions:
  - Create Dockerfile
  - Create fly.toml for `decantr-registry` app (reuse existing Fly.io app)
  - Deploy to https://decantr-registry.fly.dev (reactivate when ready)
  - Verify all endpoints work in production
  - Add deployment GitHub Action
- Outputs: Live API at api.decantr.ai (or decantr-registry.fly.dev initially)
- Acceptance criteria: `curl https://decantr-registry.fly.dev/v1/patterns` returns pattern list.
- Time: 2-3 hours
- Dependencies: 3.4.1

#### Day 14: Connect MCP Server to API

**Step 3.4.3: Add API mode to MCP server**
- Inputs: Live API, MCP server
- Actions:
  - Add optional `DECANTR_API_KEY` environment variable
  - When set: MCP server resolves content from api.decantr.ai instead of bundled files
  - When not set: uses bundled content (free tier behavior)
  - Add tests for API mode
- Outputs: MCP server with dual-mode (local/hosted) content resolution
- Acceptance criteria: With API key, MCP tools return data from API. Without, returns bundled data. Tests cover both modes.
- Time: 3-4 hours
- Dependencies: 3.4.2

---

## 6. Phase 4: Go-to-Market & Customer Acquisition

### 6.0 The Who — User Segments (Deconstructed)

Decantr serves three distinct user segments. Each has different pain points, entry points, willingness to pay, and workflows. The product must serve all three, but they adopt in sequence: Segment A first, B second, C third.

---

#### Segment A: New Project Scaffolders

**Who they are:**
- Solo developers, indie hackers, freelancers, agency devs
- Building new apps from scratch using AI (Claude, Cursor, v0, Bolt)
- Typically building: SaaS dashboards, e-commerce sites, portfolios, internal tools
- Technical enough to use a CLI or configure an MCP server
- Budget-conscious (free tier or $29/mo max)

**Their day today (without Decantr):**
1. Open Claude/Cursor
2. Prompt: "Build me a SaaS dashboard with user management, analytics, and settings"
3. AI generates a React app — it compiles, but:
   - Layout is inconsistent across pages (some pages have sidebars, some don't)
   - Spacing is random (gap-2 here, gap-8 there, no system)
   - Component choices are inconsistent (some pages use cards, some use divs)
   - No design language — every page looks like a different app
4. They iterate: "Fix the sidebar," "Make the analytics page match the dashboard"
5. Each iteration drifts further — the AI doesn't remember what it decided before
6. After 10 prompts, the app looks like it was built by 10 different people

**Their day with Decantr:**
1. Open Claude/Cursor (Decantr MCP server installed)
2. Prompt: "Build me a SaaS dashboard with user management, analytics, and settings"
3. Claude calls `decantr_create_essence` → gets a structured spec for a SaaS dashboard
4. Claude calls `decantr_resolve_archetype("saas-dashboard")` → gets page maps, pattern recommendations
5. Claude calls `decantr_resolve_pattern("kpi-grid")`, `decantr_resolve_pattern("data-table")` → gets component specs, layout rules
6. Claude generates the app using Decantr's patterns and spatial rules
7. Result: consistent layout, coherent design language, proper spacing, matching components across all pages
8. On iteration: Claude calls `decantr_check_drift` → catches when new code violates the established design
9. After 10 prompts, the app still looks like one person built it

**How they discover Decantr:**
- MCP server directories (Anthropic, Cursor marketplaces)
- "Best MCP servers for web dev" blog posts and YouTube videos
- Twitter/X threads showing before/after comparisons
- Hacker News "Show HN" post
- Word of mouth in AI coding communities (Discord, Reddit)

**How they adopt:**
1. See a demo or before/after comparison
2. Add MCP server config (30 seconds — copy-paste JSON into Claude/Cursor settings)
3. Try it on their next project
4. If it works → keep using (free tier)
5. If they want more patterns/archetypes → Pro tier ($29/mo)

**What makes them pay (free → Pro):**
- More patterns (free tier bundles core set, Pro gets full registry)
- More archetypes (free has 5, Pro has 19+)
- Theme support (Pro tier includes aesthetic guidance)
- Usage analytics (see what patterns they use most)
- Priority content updates (new patterns ship to Pro first)

**Entry point:** MCP server (zero friction — just add config)
**Conversion lever:** Content breadth (more patterns = more value)
**Retention lever:** Guard rules (once they have an Essence file, switching cost is high)

---

#### Segment B: Existing Project Retrofitters

**Who they are:**
- Developers with existing React/Vue/Svelte/Next.js projects (months or years old)
- Using AI to add features, refactor, or maintain their apps
- Suffering from "AI drift" — each AI-generated feature looks different from the last
- May or may not have a design system
- Typically: startup engineers, small team leads, senior devs responsible for UI consistency
- Willing to pay $29-99/mo if it solves the drift problem

**Their day today (without Decantr):**
1. Have an existing app (e.g., a Next.js SaaS product with 20+ pages)
2. Ask Claude to "add a billing page"
3. Claude generates a billing page that:
   - Uses different spacing than the rest of the app
   - Uses a different card style than existing pages
   - Doesn't match the existing sidebar navigation pattern
   - Introduces new components that conflict with their design system
4. They spend 2-3 hours manually fixing the generated page to match their app
5. Repeat for every new feature

**Their day with Decantr:**
1. Write an `essence.json` that describes their EXISTING app (or let Claude do it via `decantr_create_essence`)
2. The Essence captures: theme, shell layout, page structure, density, personality traits
3. When they ask Claude to "add a billing page":
   - Claude reads the Essence first (`decantr_read_essence`)
   - Claude gets the appropriate pattern (`decantr_resolve_pattern("form-sections")`)
   - Claude checks the app's shell layout → matches sidebar-main
   - Claude generates code that matches the existing app's design language
4. Before committing, Claude runs `decantr_check_drift` → catches violations
5. New features look like they belong in the existing app

**How they discover Decantr:**
- Blog post: "Stop fixing AI-generated code. Start guarding it."
- Dev.to / Medium technical walkthrough: "How I added design governance to my AI workflow"
- Conference talks: "The drift problem in AI-generated code"
- GitHub README showcasing guard rule violations (visual examples)
- Referrals from Segment A users who grew into multi-page apps

**How they adopt:**
1. Read about the drift problem (recognition: "that's exactly my problem")
2. Install MCP server
3. Create an `essence.json` for their existing project (Claude helps via `decantr_create_essence`)
4. Try generating a new feature with Decantr active
5. See that the generated code actually matches their existing app
6. Commit to using Decantr for all future AI-assisted development

**What makes them pay (free → Pro → Team):**
- **Pro:** Full pattern registry, theme support, guard validation API
- **Team:** Private patterns (encode their company's design system as Decantr patterns), CI/CD integration (GitHub Action that validates PRs against Essence), drift reports for the whole team

**Entry point:** Blog post / conference talk about the drift problem
**Conversion lever:** Guard rules (this is the killer feature for existing projects)
**Retention lever:** Essence file becomes the source of truth for their design — deep lock-in

---

#### Segment C: Enterprise & Platform Teams

**Who they are:**
- Engineering managers, platform team leads, design system owners
- Companies with 10-100+ developers using AI coding assistants
- Have existing design systems (often in Figma + Storybook)
- Need governance: "How do we make sure AI doesn't violate our design system?"
- Budget: $5K-50K/year (enterprise software pricing)
- Decision-making: requires demo, POC, security review, procurement

**Their problem today:**
1. Adopted AI coding assistants company-wide (Claude, Copilot, Cursor)
2. Developer productivity went up 2-3x
3. But design consistency went down:
   - AI generates code that violates the company design system
   - Different devs get different AI outputs for the same patterns
   - No way to enforce design rules in AI-assisted workflows
   - Design review bottleneck increased (designers reviewing more AI-generated PRs)
4. They tried:
   - Adding design system docs to AI context → helps but doesn't enforce
   - Custom Cursor rules files → brittle, per-developer, no enforcement
   - Manual PR review → doesn't scale, subjective
5. They need: automated, enforceable design governance for AI-generated code

**Their day with Decantr:**
1. **Private registry:** Company's design system encoded as Decantr patterns
   - "Our Button" → Decantr pattern with exact props, variants, spacing rules
   - "Our Dashboard Layout" → archetype with page map and guard rules
   - "Our Brand Theme" → recipe with colors, spacing, effects
2. **MCP server (enterprise):** Every developer's Claude/Cursor uses the company MCP server
   - Resolves patterns from private registry (not public)
   - Guard rules enforce the company design system
   - Drift reports show violations before code is committed
3. **CI/CD integration:** GitHub Action runs `npx @decantr/cli validate` on every PR
   - Checks generated code against the Essence spec
   - Blocks PRs that violate guard rules
   - Generates drift reports for design team review
4. **Dashboard:** Design system owners see:
   - Which patterns are used most
   - Which guard rules are violated most
   - Which developers generate the most drift
   - Content usage analytics across teams

**How they discover Decantr:**
- CTO/VP Eng sees a developer on their team using Decantr (bottom-up adoption from Segment A/B)
- Conference talk: "Design Governance for AI-Generated Code at Scale"
- Whitepaper: "The $X cost of AI design drift in enterprise applications"
- Direct outreach to companies known to use AI coding assistants heavily
- Partnership with Anthropic/Cursor (Decantr as recommended MCP server for enterprise)

**How they adopt:**
1. Individual developer starts using free Decantr MCP server (Segment A/B)
2. Team lead notices improved consistency → investigates Decantr
3. Team signs up for Team tier → creates private registry with company patterns
4. Platform team evaluates for company-wide deployment
5. Enterprise contract: SSO, RBAC, audit trail, on-prem option, SLA

**What makes them pay (Team → Enterprise):**
- **Team ($99/seat/mo):** Private registry, CI/CD GitHub Action, team analytics, guard dashboard
- **Enterprise (custom):** SSO/SAML, RBAC (who can publish patterns), audit trail (compliance), on-prem registry option, custom guard rules, dedicated support, SLA

**Entry point:** Bottom-up adoption from individual developers
**Conversion lever:** Private registry (encode company design system)
**Retention lever:** CI/CD integration (Decantr becomes part of the build pipeline — very high switching cost)

---

### 6.1 The What — Product Surface Area by Segment

| Capability | Segment A (Scaffolders) | Segment B (Retrofitters) | Segment C (Enterprise) |
|------------|------------------------|-------------------------|----------------------|
| MCP server (local) | Core product | Core product | Core product |
| Essence spec + validator | Yes (bundled) | Yes (creates for existing project) | Yes (company-wide standard) |
| Public pattern registry | Yes (bundled + API) | Yes | Base layer |
| Guard rules | Helpful | **Killer feature** | **Killer feature** |
| `decantr_create_essence` | Primary workflow | Used once to bootstrap | Template for teams |
| `decantr_check_drift` | Nice to have | **Primary workflow** | CI/CD automated |
| Private registry | No | No | **Core value prop** |
| CI/CD GitHub Action | No | Maybe | **Core value prop** |
| Dashboard / analytics | No | No | Yes |
| SSO / RBAC | No | No | Yes |
| API key | Optional (Pro) | Yes (Pro) | Yes (Enterprise) |

### 6.2 The Where — Distribution Channels

| Channel | Target Segment | Action | Priority | Cost |
|---------|---------------|--------|----------|------|
| **MCP server directories** | A | Submit to Anthropic, Cursor, Windsurf MCP directories | P0 (Week 5) | Free |
| **npm registry** | A, B | Publish @decantr/* packages | P0 (Week 3) | Free |
| **Hacker News** | A, B | "Show HN: OpenAPI for AI-generated UI" | P0 (Week 5) | Free |
| **Twitter/X** | A, B | Before/after thread + demo video | P0 (Week 5) | Free |
| **Reddit** | A | r/webdev, r/reactjs, r/programming, r/cursor | P0 (Week 5) | Free |
| **Dev.to / Medium** | B | "How to stop AI design drift in your existing project" | P1 (Week 6) | Free |
| **YouTube** | A, B | 5-min demo video: "Make Claude generate better UI" | P1 (Week 6) | Free |
| **GitHub README** | A, B | Excellent README with visual examples | P0 (Week 3) | Free |
| **Conference talks** | B, C | "Design Governance for AI-Generated Code" | P2 (Month 3+) | Travel cost |
| **Anthropic partnership** | A, B, C | Reach out to MCP team for featured placement | P1 (Week 6) | Free |
| **Direct outreach** | C | Email/LinkedIn to VP Eng at companies using AI tools | P2 (Month 3+) | Free |
| **Whitepaper** | C | "The Cost of AI Design Drift in Enterprise" | P2 (Month 4+) | Free |

### 6.3 The Why — Pain Point → Solution Mapping

| Pain Point | Who Feels It | How Decantr Solves It | Proof Point |
|------------|-------------|----------------------|-------------|
| "AI-generated pages don't match each other" | A, B | Patterns enforce consistent component composition | Before/after screenshots |
| "Every iteration makes my app look worse" | A, B | Guard rules prevent drift from established design | Drift report showing violations caught |
| "AI doesn't know my design system" | B, C | Essence spec encodes design intent; MCP server provides context | AI reads Essence before generating |
| "We can't scale AI-assisted development without governance" | C | Private registry + CI/CD + dashboard | Demo of PR blocked by guard violation |
| "I spend more time fixing AI code than writing it" | A, B | Patterns + spatial rules = less manual fixing | Time comparison: with vs without |
| "Every developer's AI generates differently" | C | Shared Essence + registry = consistent output across team | Side-by-side: two devs, same prompt, consistent output |

### 6.4 The How — Launch Playbook (Week 5-8)

#### Week 5: Soft Launch

**Step 4.1.1: Write launch blog post**
- Title: "Stop generating UI slop. Start generating with intent."
- Structure:
  - The problem (with screenshots of bad AI-generated UI)
  - What Decantr is (30-second explanation)
  - How it works (MCP server → AI calls Decantr during generation)
  - Before/after comparison (same prompt, with and without Decantr)
  - How to install (copy-paste MCP config)
  - Link to GitHub and npm
- Inputs: Working MCP server, demo recordings
- Outputs: Published blog post
- Acceptance criteria: Non-technical reader understands the problem. Technical reader can install in 2 minutes.
- Time: 4-6 hours

**Step 4.1.2: Create demo video (2-3 minutes)**
- Script:
  - 0:00-0:30 — "Watch me build a dashboard with Claude. No Decantr." [show messy output]
  - 0:30-0:45 — "Now I add one config file." [show MCP server setup]
  - 0:45-2:00 — "Same prompt. Watch what happens." [show clean, consistent output]
  - 2:00-2:30 — "Now I add a feature. Decantr catches drift." [show guard violation]
  - 2:30-3:00 — "Get it at decantr.ai. Free." [CTA]
- Inputs: Working MCP server, screen recording tool
- Outputs: Edited video, uploaded to YouTube + Twitter
- Acceptance criteria: Viewer says "I want that" within 30 seconds.
- Time: 4-6 hours

**Step 4.1.3: Submit to MCP directories**
- Anthropic MCP server directory (if application process exists)
- Cursor marketplace / docs
- awesome-mcp-servers GitHub repo (PR)
- mcp.so directory
- Inputs: Published npm package, README with config examples
- Outputs: Listed in at least 2 directories
- Acceptance criteria: Package is discoverable by searching "UI" or "design" in MCP directories.
- Time: 2-3 hours

#### Week 6: Community Push

**Step 4.2.1: Hacker News launch**
- Post: "Show HN: Decantr — OpenAPI for AI-generated UI"
- Body: 3-paragraph explanation + link to blog post + link to GitHub
- Timing: Tuesday or Wednesday, 9-10am ET
- Inputs: Blog post, demo video, live product
- Outputs: HN post
- Acceptance criteria: If it hits front page = success. If not = still valuable signal.
- Time: 1 hour (post) + 4 hours (responding to comments)

**Step 4.2.2: Reddit posts**
- r/webdev: "I built a design intelligence layer for AI-generated UI"
- r/reactjs: "How to make Claude/Cursor generate consistent React code"
- r/programming: "OpenAPI for UI — a structured spec for AI-generated interfaces"
- r/ChatGPTCoding or r/ClaudeAI: "MCP server that makes Claude generate better code"
- Inputs: Blog post, demo video
- Outputs: 4 Reddit posts
- Time: 2 hours

**Step 4.2.3: Twitter/X thread**
- 8-10 tweet thread with before/after screenshots
- Pin tweet: "AI code generators are racing to generate faster. None of them are thinking about what happens after. We built the design intelligence layer that fixes that."
- Inputs: Screenshots, demo GIF
- Outputs: Thread posted
- Time: 2 hours

**Step 4.2.4: Dev.to technical article (Segment B focus)**
- Title: "How to add design governance to your existing AI-assisted React project"
- Content: Step-by-step guide for Segment B workflow
  - Install MCP server
  - Create essence.json for existing project
  - Show guard rules catching drift
  - Show before/after of adding a new feature
- Inputs: Working MCP server, test project
- Outputs: Published article
- Time: 4-6 hours

#### Week 7-8: Iterate & Measure

**Step 4.3.1: Set up analytics**
- npm download counts (weekly check)
- GitHub stars + issues (daily)
- API request metrics (Fly.io dashboard)
- Landing page analytics (Vercel)
- Inputs: Published packages, live API, landing page
- Outputs: Metrics dashboard (can be a simple spreadsheet)
- Time: 1-2 hours

**Step 4.3.2: Gather feedback**
- Add feedback form/link to MCP server README
- Monitor GitHub issues
- Respond to every comment on HN/Reddit/Twitter
- DM 5-10 people who engaged with launch posts → ask for 15-min feedback call
- Inputs: Launch posts, GitHub issues
- Outputs: Feedback log with patterns identified
- Time: Ongoing (1 hour/day)

**Step 4.3.3: Iterate on MCP tools based on feedback**
- What tools do people actually use?
- What tools are missing?
- What's confusing about the Essence spec?
- Inputs: Feedback log, usage analytics
- Outputs: Prioritized backlog for MCP server improvements
- Time: Ongoing

### 6.5 Metrics to Track

| Metric | Tool | Month 1 Target | Month 3 Target | Month 6 Target |
|--------|------|-----------------|-----------------|-----------------|
| npm downloads (mcp-server) | npmjs.com | 500 | 2,000 | 10,000 |
| GitHub stars | github.com | 100 | 500 | 2,000 |
| Active MCP installations | API key registrations | 50 | 200 | 1,000 |
| API requests/week | Fly.io metrics | 1,000 | 5,000 | 25,000 |
| Landing page visitors/mo | Vercel analytics | 2,000 | 8,000 | 30,000 |
| Pro subscribers | Stripe | 0 | 20 | 100 |
| Team accounts | Stripe | 0 | 2 | 10 |
| MRR | Stripe | $0 | $780 | $3,890 |

### 6.6 Conversion Funnel

```
Discover (MCP directory, HN, Twitter, Reddit, blog)
    ↓ "Looks interesting"
Install MCP server (30 seconds — copy-paste config)
    ↓ "It works"
Use on first project (Segment A) or existing project (Segment B)
    ↓ "This is better than without it"
Create essence.json (design intent locked in)
    ↓ "I depend on this now"
Hit free tier limit (need more patterns/archetypes)
    ↓ "Worth $29/mo"
Pro subscription
    ↓ "My team needs this"
Team subscription ($99/seat/mo)
    ↓ "Our company needs this"
Enterprise contract
```

**Key insight:** The essence.json file is the lock-in mechanism. Once a project has an Essence file, switching away means losing the design governance. This is similar to how package.json locks you into npm — it's the project's DNA.

---

## 7. Phase 5: Operations, Legal, Finance

### 7.1 Legal

- [ ] **7.1.1** Add MIT LICENSE to repo
- [ ] **7.1.2** Add CONTRIBUTING.md (for community pattern contributions)
- [ ] **7.1.3** Terms of Service for API (standard API ToS template)
- [ ] **7.1.4** Privacy Policy (minimal — we store API keys and usage counts, nothing else)

### 7.2 Finance

- [ ] **7.2.1** Set up Stripe account
- [ ] **7.2.2** Create products: Pro ($29/mo), Team ($99/mo/seat)
- [ ] **7.2.3** Build simple API key provisioning (Stripe webhook → generate key → email to user)
- [ ] **7.2.4** Add API key validation to API server

---

## 8. Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| No one uses the MCP server | MEDIUM | HIGH | Validate with 5 developers before launch. Iterate on tool design based on feedback. |
| AI assistants don't call MCP tools reliably | LOW | HIGH | Test with Claude, Cursor, Windsurf. File bugs. MCP is Anthropic's own standard. |
| Someone else builds "OpenAPI for UI" | LOW | MEDIUM | First-mover advantage. Content ecosystem is the moat. |
| Content registry doesn't grow | MEDIUM | HIGH | Seed with high-quality patterns. Make contributing dead simple (PR a JSON file). |
| Terminology normalization breaks things | HIGH | LOW | Clean slate approach — nuke and rebuild. |
| Solo founder burnout | HIGH | HIGH | Ship MVP in 4 weeks. Validate before over-investing. Get paying users before building Team/Enterprise tiers. |
| Fly.io costs scale unexpectedly | LOW | LOW | Scale-to-zero config. Monitor billing. Switch to Cloudflare Workers if needed. |

---

## 9. Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-26 | Decantr is a Design Intelligence API, not a code generator | Founder + Claude agreed: "sell the diamond, not the setting" |
| 2026-03-26 | Remove all generator packages (React, Decantr) | Generators are the setting. They chase framework versions. |
| 2026-03-26 | Remove CLI package | MCP server is the primary distribution channel for AI-first workflows |
| 2026-03-26 | Remove registry-server (apps/) | Premature backend. Content served as static JSON initially. |
| 2026-03-26 | Normalize wine terminology to plain language | Readability tax for developer adoption. Keep "Essence" as brand term. |
| 2026-03-26 | Clean slate — no versioning, no deprecation | No users on current packages. No backward compatibility needed. |
| 2026-03-26 | MCP server is the MVP, not the API | Distribution channel first. API second. |
| 2026-03-26 | Framework (decantr-framework) is completely separate | Different product. Different repo. Different timeline. |
| 2026-03-26 | "Essence" stays as brand term | Founder approved. Intuitive, distinctive, not confusing. |
| 2026-03-26 | "Blueprint" replaces "Vignette" | Founder approved. Self-explanatory for app compositions. |
| 2026-03-26 | Styles renamed to Themes, kept in registry | Founder approved. Design aesthetic metadata is core intelligence. |
| 2026-03-26 | generator-react nuked completely (no archive) | Founder decision. Clean slate. Not even a reference implementation. |
| 2026-03-26 | No LLM API costs for Decantr | User's AI (Claude/Cursor) does the thinking. Decantr provides schema + content + rules. Zero LLM cost for us. |

---

## 10. Open Clarifications

All previous clarifications resolved (2026-03-26). No open questions.

---

**Next actionable step(s):**
1. Execute Step 3.1.1 — nuke non-diamond packages (clean slate)
2. Execute Step 3.1.2 — rename generator-core → core
3. Execute Step 3.1.3 — remove generator plugin system from core

**Clarification needed? NO**

**Vision reconciliation status: GREEN** — Every decision in this plan traces directly to "OpenAPI for AI-generated UI" and "sell the diamond, not the setting." The three user segments (Scaffolders, Retrofitters, Enterprise) all converge on the same product: Essence spec + MCP server + Registry + Guard rules.
