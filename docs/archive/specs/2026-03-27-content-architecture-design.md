# Decantr Content Architecture Design

**Date:** 2026-03-27
**Status:** Approved
**Author:**  David Aimi

---

## Overview

This document defines the architecture for Decantr's content system: where content is authored, how it's distributed, and how users consume it.

### Problem Statement

The current architecture has content (`patterns/`, `themes/`, `recipes/`, etc.) living in the monorepo's `content/` folder with an unclear distinction between `core/` and top-level content. This creates confusion about:
- Where the source of truth lives (monorepo vs registry)
- What gets bundled with the CLI vs fetched from API
- How community content fits in

### Decision

**Registry-First Architecture:** The registry API is the source of truth. Content is authored in a dedicated repo and synced to the registry. The CLI fetches from the registry, with a bare minimum bundled for offline use.

---

## Repository Structure

### Repositories

| Repository | URL | Purpose |
|------------|-----|---------|
| decantr-monorepo | `github.com/decantr-ai/decantr` | CLI, packages, MCP server (code only) |
| decantr-content | `github.com/decantr-ai/decantr-content` | Official content (patterns, themes, etc.) |
| decantr-registry-portal | `github.com/decantr-ai/decantr-registry-portal` | Showcase UI for browsing content |

### Monorepo Changes

**Delete:** `content/` folder entirely (including `content/core/`)

**Add:** Bare minimum bundled content in CLI package:

```
packages/cli/src/bundled/
├── blueprints/
│   └── default.json           # Generic starter blueprint
├── themes/
│   └── default.json           # Neutral theme (light/dark)
├── patterns/
│   ├── hero.json
│   ├── nav-header.json
│   ├── content-section.json
│   ├── footer.json
│   └── form-basic.json        # ~5 essential patterns
└── shells/
    └── default.json           # Simple top-nav + main layout
```

### Content Repo Structure

```
decantr-content/
├── official/
│   ├── patterns/
│   │   ├── hero.json
│   │   ├── chat-header.json
│   │   ├── chat-thread.json
│   │   ├── chat-input.json
│   │   ├── kpi-grid.json
│   │   └── ...
│   ├── recipes/
│   │   ├── carbon.json
│   │   ├── glassmorphism.json
│   │   └── ...
│   ├── themes/
│   │   ├── carbon.json
│   │   ├── luminarum.json
│   │   └── ...
│   ├── blueprints/
│   │   ├── carbon-ai-portal.json
│   │   ├── saas-dashboard.json
│   │   └── ...
│   ├── archetypes/
│   │   ├── ai-chatbot.json
│   │   ├── saas-dashboard.json
│   │   └── ...
│   └── shells/
│       └── shells.json        # All shell definitions
├── scripts/
│   ├── validate.js            # Schema validation
│   └── publish-to-registry.js # Sync to registry API
├── .github/
│   └── workflows/
│       └── publish.yml        # CI/CD pipeline
└── README.md
```

---

## Content Model

### Content Types

| Type | Description | Example |
|------|-------------|---------|
| `patterns` | UI section components | hero, chat-thread, kpi-grid |
| `recipes` | Visual decoration rules | carbon, glassmorphism |
| `themes` | Color palettes and modes | carbon, luminarum |
| `blueprints` | Complete app compositions | carbon-ai-portal |
| `archetypes` | App-level templates | ai-chatbot, saas-dashboard |
| `shells` | Page layout containers | sidebar-main, chat-portal |

### Namespace Structure

```
Official (Decantr-authored):
  patterns/hero
  themes/carbon
  blueprints/carbon-ai-portal

Community (future):
  @peterkokis/patterns/kpi-grid
  @acme-corp/themes/enterprise-blue
  @jane/blueprints/portfolio-minimal
```

### Content Schema

```json
{
  "id": "hero",
  "namespace": null,
  "type": "pattern",
  "version": "1.2.0",
  "name": "Hero",
  "description": "Landing page hero section",
  "decantr_compat": ">=1.0.0",
  "presets": { },
  "components": [ ],
  "code": { }
}
```

- `namespace`: `null` for official, `"@username"` for community
- `decantr_compat`: Semver range for CLI compatibility

---

## Registry API

### Base URL

```
https://decantr-registry.fly.dev/v1
```

### Public Endpoints (existing)

```
GET  /v1/patterns                         # List all patterns
GET  /v1/patterns/hero                    # Get official pattern
GET  /v1/patterns/@peterkokis/kpi-grid    # Get community pattern (future)
GET  /v1/search?q=dashboard&type=blueprints
```

### Admin Endpoints (new)

```
POST /v1/admin/patterns/hero
Authorization: Bearer <REGISTRY_API_KEY>
Body: { ...pattern JSON... }
Response: 200 OK | 409 Conflict (version exists)

POST /v1/admin/sync
Authorization: Bearer <REGISTRY_API_KEY>
Body: { type: "patterns", items: [...] }
Response: 200 OK with sync report
```

---

## CLI Changes

### Package

Use `@decantr/cli` exclusively. Ignore legacy `decantr@0.9.x` package.

### Simplified Init Flow

```
$ npx @decantr/cli init

? What blueprint would you like to scaffold?
  > Decantr default (recommended)
    Search registry...

# If "Search registry" selected:
? Search: carbon
  > carbon-ai-portal - AI chatbot with auth, settings, marketing
    carbon-dashboard - Minimal dashboard
    @jane/carbon-lite - Community: lightweight variant

# After scaffold:
✓ Project scaffolded!

  Files created:
    decantr.essence.json    Design specification
    DECANTR.md              LLM instructions
    .decantr/               Project state & cache

  Next steps:
    1. Review DECANTR.md for methodology
    2. Explore more at decantr.ai/registry

  Commands:
    decantr status     Project health
    decantr search     Search registry
    decantr get        Fetch content details
    decantr validate   Check essence file
    decantr upgrade    Update to latest patterns
    decantr heal       Fix drift issues
```

### Fallback Chain

```
MCP → API → Cache → Bundled default
```

If offline on first run:
```
⚠ You're offline. Scaffolding Decantr default.
  Run `decantr upgrade` when online, or visit decantr.ai/registry
```

### Command Reference

| Command | Description | Status |
|---------|-------------|--------|
| `init` | Scaffold project (simplified two-choice flow) | Modify |
| `status` | Project health check | Exists |
| `search <query>` | Search registry | Exists |
| `suggest <query>` | Get pattern suggestions | Exists |
| `get <type> <id>` | Fetch content details | Exists |
| `list <type>` | List available content | Exists |
| `validate` | Validate essence file | Exists |
| `sync` | Sync registry to local cache | Exists |
| `audit` | Check project for issues | Exists |
| `theme create/list/delete/import` | Manage custom themes | Exists |
| `upgrade` | Update patterns/theme to latest | New |
| `heal` | Detect and fix drift | New |
| `login` | Authenticate for publishing | Future |
| `publish` | Publish community content | Future |

**Status key:**
- **Exists**: Already implemented, may need minor updates
- **Modify**: Exists but needs significant changes
- **New**: Must be implemented as part of this work
- **Future**: Out of scope, documented for later

### DECANTR.md Template Update

Change all references from `npx decantr` to `npx @decantr/cli`:

```diff
- npx decantr get theme carbon
+ npx @decantr/cli get theme carbon

- npx decantr validate
+ npx @decantr/cli validate
```

---

## Sync Pipeline

### Flow

```
decantr-content repo
        │
        │  git push / PR merge to main
        ▼
┌─────────────────────────────────────┐
│  GitHub Actions                     │
│  .github/workflows/publish.yml      │
│                                     │
│  1. Validate JSON schemas           │
│  2. Check decantr_compat            │
│  3. POST to registry admin API      │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  Registry API                       │
│  decantr-registry.fly.dev           │
└─────────────────────────────────────┘
```

### GitHub Actions Workflow

```yaml
name: Publish to Registry
on:
  push:
    branches: [main]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Validate schemas
        run: node scripts/validate.js

      - name: Publish to registry
        env:
          REGISTRY_API_KEY: ${{ secrets.REGISTRY_API_KEY }}
        run: node scripts/publish-to-registry.js
```

### Publish Script Logic

```javascript
// scripts/publish-to-registry.js
const CONTENT_TYPES = ['patterns', 'recipes', 'themes', 'blueprints', 'archetypes', 'shells'];

for (const type of CONTENT_TYPES) {
  const files = glob(`official/${type}/*.json`);
  for (const file of files) {
    const content = JSON.parse(readFileSync(file));
    const response = await fetch(`${REGISTRY_URL}/admin/${type}/${content.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(content)
    });
    // Log result, skip if 409 (version exists)
  }
}
```

### Local Development

```bash
cd decantr-content
npm run validate         # Check all JSON schemas
npm run publish:dry-run  # Preview what would be published
npm run publish          # Push to registry (requires REGISTRY_API_KEY)
```

---

## Showcase Portal

### URL

`decantr.ai/registry`

### Repository

`github.com/decantr-ai/decantr-registry-portal`

### Current Scope (Stub)

Minimal placeholder page:

```
┌─────────────────────────────────────────────────┐
│  Decantr Registry                               │
│                                                 │
│  Coming soon.                                   │
│                                                 │
│  For now, use the CLI:                          │
│    npx @decantr/cli search <query>              │
│    npx @decantr/cli list blueprints             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Future Features (out of scope)

- Visual browse of patterns/themes/blueprints
- Live preview cards
- Copy scaffold commands
- Filter by tags, sort by popularity
- Community content with @username namespaces

---

## Migration Checklist

### Monorepo (decantr-monorepo)

- [ ] Delete `content/` folder
- [ ] Create `packages/cli/src/bundled/` with bare minimum content
- [ ] Update CLI init flow (two choices: default or search)
- [ ] Update fallback chain to use bundled content
- [ ] Update DECANTR.md template (npx @decantr/cli)
- [ ] Remove recipes from syncRegistry types (registry is source now)
- [ ] Implement `upgrade` command
- [ ] Implement `heal` command
- [ ] Add e2e test suite for all commands
- [ ] Update `get` command to support shells

### Content Repo (decantr-content)

- [ ] Copy content from monorepo to `official/`
- [ ] Flatten `core/` into appropriate directories
- [ ] Add shells as first-class content type
- [ ] Create validation script
- [ ] Create publish script
- [ ] Set up GitHub Actions workflow
- [ ] Add REGISTRY_API_KEY secret

### Registry API (decantr-registry.fly.dev)

- [ ] Add POST /v1/admin/{type}/{id} endpoint
- [ ] Add API key authentication for admin endpoints
- [ ] Ensure all content types are supported (including shells)

### Portal (decantr-registry-portal)

- [ ] Create stub page at decantr.ai/registry

---

## Validation & Testing

### End-to-End Test Scenarios

Each scenario should be run in a fresh temp directory.

#### Scenario 1: Offline Init (Bundled Default)

```bash
# Simulate offline
export DECANTR_OFFLINE=true

# Init with default
npx @decantr/cli init --yes

# Verify files created
test -f decantr.essence.json    # Should exist
test -f DECANTR.md              # Should exist
test -d .decantr                # Should exist

# Verify essence references bundled default
grep '"style": "default"' decantr.essence.json

# Verify DECANTR.md uses correct CLI
grep 'npx @decantr/cli' DECANTR.md
! grep 'npx decantr ' DECANTR.md  # Should NOT have old package name
```

#### Scenario 2: Online Init with Search

```bash
# Init and search for carbon
npx @decantr/cli init
# Select "Search registry..."
# Type "carbon"
# Select "carbon-ai-portal"

# Verify essence references carbon
grep '"style": "carbon"' decantr.essence.json
grep '"recipe": "carbon"' decantr.essence.json

# Verify cache populated
test -f .decantr/cache/blueprints/carbon-ai-portal.json
test -f .decantr/cache/themes/carbon.json
```

#### Scenario 3: Registry Commands

```bash
# After init, test registry commands

# Search
npx @decantr/cli search dashboard
# Should return results including saas-dashboard, financial-dashboard, etc.

# Get specific item
npx @decantr/cli get theme carbon
# Should return full JSON with seed colors, palette, modes

npx @decantr/cli get recipe carbon
# Should return decorators, animations, compositions

npx @decantr/cli get pattern chat-header
# Should return presets, components, code examples

npx @decantr/cli get shell chat-portal
# Should return grid config, regions, code example

# List
npx @decantr/cli list blueprints
# Should include carbon-ai-portal, saas-dashboard, etc.

npx @decantr/cli list themes
# Should include carbon, luminarum, etc.
```

#### Scenario 4: Validate Command

```bash
# After init
npx @decantr/cli validate

# Should output: "Essence is valid." or list violations

# Intentionally break essence
echo '{"invalid": true}' > decantr.essence.json
npx @decantr/cli validate
# Should fail with schema errors
```

#### Scenario 5: Status Command

```bash
# After init
npx @decantr/cli status

# Should show:
# - Project health
# - Theme in use
# - Guard mode
# - Sync status (API reachable or not)
```

#### Scenario 6: Fallback Chain Verification

```bash
# Test each level of fallback

# 1. MCP available (if configured)
# 2. API available
npx @decantr/cli get theme carbon  # Should fetch from API

# 3. API down, cache exists
# (simulate by blocking API)
npx @decantr/cli get theme carbon  # Should use cache

# 4. API down, no cache, bundled exists
rm -rf .decantr/cache
npx @decantr/cli init --yes  # Should use bundled default
```

#### Scenario 7: Upgrade Command (New)

```bash
# After init with an older blueprint version
npx @decantr/cli init --blueprint=carbon-ai-portal

# Simulate newer version available in registry
# (update content repo, publish)

# Run upgrade
npx @decantr/cli upgrade

# Should:
# - Check registry for newer versions of patterns/theme/recipe
# - Show diff of what would change
# - Prompt for confirmation
# - Update essence file with new versions
# - Update cache

# Verify
npx @decantr/cli status
# Should show "Up to date" or list available upgrades
```

#### Scenario 8: Heal Command (New)

```bash
# After init, intentionally create drift
npx @decantr/cli init --blueprint=carbon-ai-portal

# Manually edit essence to introduce issues
# (wrong theme, missing pattern, etc.)

# Run heal
npx @decantr/cli heal

# Should:
# - Detect drift from original blueprint
# - Show what's wrong
# - Offer to fix (restore to blueprint spec)
# - Or suggest updating essence if intentional

# Run audit to verify
npx @decantr/cli audit
# Should pass after heal
```

#### Scenario 9: Content Sync Pipeline

```bash
# In decantr-content repo
cd decantr-content

# Validate all content
npm run validate
# Should pass with no errors

# Dry run publish
npm run publish:dry-run
# Should list all items that would be published

# Actual publish (requires API key)
REGISTRY_API_KEY=xxx npm run publish
# Should succeed, log each item published

# Verify in registry
curl https://decantr-registry.fly.dev/v1/patterns/hero
# Should return the published content
```

### Automated Test Suite

Add to `packages/cli/test/`:

```typescript
// e2e/init.test.ts
describe('init command', () => {
  it('scaffolds with bundled default when offline', async () => {
    // ...
  });

  it('scaffolds from registry search', async () => {
    // ...
  });

  it('creates valid essence file', async () => {
    // ...
  });

  it('generates DECANTR.md with correct CLI references', async () => {
    // ...
  });
});

// e2e/registry-commands.test.ts
describe('registry commands', () => {
  it('search returns results from API', async () => {
    // ...
  });

  it('get theme returns full theme JSON', async () => {
    // ...
  });

  it('get pattern returns presets and code', async () => {
    // ...
  });

  it('list blueprints returns all available', async () => {
    // ...
  });

  it('falls back to cache when API unavailable', async () => {
    // ...
  });

  it('falls back to bundled when cache empty', async () => {
    // ...
  });
});

// e2e/validate.test.ts
describe('validate command', () => {
  it('passes for valid essence', async () => {
    // ...
  });

  it('fails with clear errors for invalid essence', async () => {
    // ...
  });
});

// e2e/upgrade.test.ts
describe('upgrade command', () => {
  it('detects when newer versions available', async () => {
    // ...
  });

  it('shows no upgrades when up to date', async () => {
    // ...
  });

  it('updates essence with new versions', async () => {
    // ...
  });

  it('updates cache after upgrade', async () => {
    // ...
  });
});

// e2e/heal.test.ts
describe('heal command', () => {
  it('detects drift from blueprint', async () => {
    // ...
  });

  it('offers to fix detected issues', async () => {
    // ...
  });

  it('restores essence to valid state', async () => {
    // ...
  });

  it('passes audit after healing', async () => {
    // ...
  });
});
```

### Manual Smoke Test Checklist

Run before each release:

**Init & Scaffold:**
- [ ] Fresh `npx @decantr/cli init` works (no prior install)
- [ ] Init with search finds carbon-ai-portal
- [ ] Scaffolded project has correct files
- [ ] DECANTR.md contains no `npx decantr ` (old package)
- [ ] Offline init falls back to bundled default

**Registry Commands:**
- [ ] `decantr search dashboard` returns results
- [ ] `decantr get theme carbon` returns full JSON
- [ ] `decantr get recipe carbon` returns decorators
- [ ] `decantr get pattern chat-header` returns presets
- [ ] `decantr get shell chat-portal` returns layout config
- [ ] `decantr list blueprints` shows all available
- [ ] `decantr list themes` shows all available
- [ ] Cache is populated after online operations

**Project Commands:**
- [ ] `decantr validate` works on scaffolded project
- [ ] `decantr status` shows project health
- [ ] `decantr audit` detects issues
- [ ] `decantr sync` refreshes cache from registry

**New Commands:**
- [ ] `decantr upgrade` detects available updates
- [ ] `decantr upgrade` updates essence when confirmed
- [ ] `decantr heal` detects drift
- [ ] `decantr heal` fixes drift when confirmed

**Fallback Chain:**
- [ ] Works when API available
- [ ] Falls back to cache when API down
- [ ] Falls back to bundled when cache empty

---

## Success Criteria

1. `npx @decantr/cli init` works offline with bundled default
2. `npx @decantr/cli init` + search fetches from registry
3. Content changes in decantr-content auto-publish to registry
4. No content remains in decantr-monorepo (except bundled minimum)
5. DECANTR.md references correct CLI package name
6. All registry commands work (`search`, `get`, `list`, `validate`, `status`)
7. Fallback chain works: MCP → API → Cache → Bundled
8. Automated e2e tests pass
9. Manual smoke test checklist passes

---

## Open Questions (Resolved)

| Question | Decision |
|----------|----------|
| Where is content authored? | Separate decantr-content repo |
| What's bundled in CLI? | Bare minimum (1 blueprint, 1 theme, ~5 patterns, 1 shell) |
| Which CLI package? | @decantr/cli (ignore decantr@0.9.x) |
| Community namespacing? | @username/type/id format |
| Init flow? | Two choices: Decantr default or search registry |
