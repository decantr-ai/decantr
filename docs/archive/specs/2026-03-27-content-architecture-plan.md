# Content Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement registry-first content architecture with simplified CLI init, bundled offline defaults, and content migration to dedicated repo.

**Architecture:** Registry API is source of truth. CLI fetches from registry with fallback chain (MCP → API → Cache → Bundled). Official content authored in decantr-content repo, synced to registry via CI/CD.

**Tech Stack:** TypeScript, Node.js, Vitest, GitHub Actions

**Spec:** `docs/specs/2026-03-27-content-architecture-design.md`

---

## File Structure

### Monorepo (decantr-monorepo)

**Create:**
```
packages/cli/src/bundled/
├── blueprints/default.json
├── themes/default.json
├── patterns/
│   ├── hero.json
│   ├── nav-header.json
│   ├── content-section.json
│   ├── footer.json
│   └── form-basic.json
└── shells/default.json

packages/cli/src/commands/
├── upgrade.ts
└── heal.ts

packages/cli/test/e2e/
├── init.test.ts
├── registry-commands.test.ts
├── upgrade.test.ts
└── heal.test.ts
```

**Modify:**
```
packages/cli/src/templates/DECANTR.md.template  — Fix CLI references
packages/cli/src/index.ts                       — Simplified init, new commands
packages/cli/src/registry.ts                    — Bundled fallback, shells support
packages/cli/package.json                       — Add bundled to files array
```

**Delete:**
```
content/                                        — Entire folder (after migration)
```

### Content Repo (decantr-content)

**Create:**
```
official/
├── patterns/*.json
├── recipes/*.json
├── themes/*.json
├── blueprints/*.json
├── archetypes/*.json
└── shells/shells.json

scripts/
├── validate.js
└── publish-to-registry.js

.github/workflows/publish.yml
package.json
README.md
```

---

## Phase 1: CLI Template & Bundled Content

### Task 1: Fix DECANTR.md Template

**Files:**
- Modify: `packages/cli/src/templates/DECANTR.md.template`

- [ ] **Step 1: Read current template**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
grep -n "npx decantr" packages/cli/src/templates/DECANTR.md.template
```

- [ ] **Step 2: Replace all `npx decantr` with `npx @decantr/cli`**

Find and replace all occurrences:
- `npx decantr get theme` → `npx @decantr/cli get theme`
- `npx decantr get recipe` → `npx @decantr/cli get recipe`
- `npx decantr get pattern` → `npx @decantr/cli get pattern`
- `npx decantr search` → `npx @decantr/cli search`
- `npx decantr validate` → `npx @decantr/cli validate`

- [ ] **Step 3: Verify no old references remain**

```bash
grep "npx decantr " packages/cli/src/templates/DECANTR.md.template
# Expected: No output (no matches)

grep "npx @decantr/cli" packages/cli/src/templates/DECANTR.md.template
# Expected: Multiple matches
```

- [ ] **Step 4: Commit**

```bash
git add packages/cli/src/templates/DECANTR.md.template
git commit -m "fix: update DECANTR.md template to use @decantr/cli"
```

---

### Task 2: Create Bundled Default Blueprint

**Files:**
- Create: `packages/cli/src/bundled/blueprints/default.json`

- [ ] **Step 1: Create bundled directory structure**

```bash
mkdir -p packages/cli/src/bundled/blueprints
mkdir -p packages/cli/src/bundled/themes
mkdir -p packages/cli/src/bundled/patterns
mkdir -p packages/cli/src/bundled/shells
```

- [ ] **Step 2: Create default blueprint**

Create `packages/cli/src/bundled/blueprints/default.json`:

```json
{
  "id": "default",
  "$schema": "https://decantr.ai/schemas/blueprint.v1.json",
  "version": "1.0.0",
  "decantr_compat": ">=1.0.0",
  "name": "Decantr Default",
  "description": "Minimal starter blueprint for offline scaffolding. Visit decantr.ai/registry for more options.",
  "tags": ["starter", "minimal", "offline"],
  "compose": ["starter"],
  "theme": {
    "style": "default",
    "mode": "system",
    "recipe": null,
    "shape": "rounded"
  },
  "personality": ["clean", "minimal"],
  "features": [],
  "routes": {
    "/": {
      "shell": "default",
      "page": "home"
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/cli/src/bundled/blueprints/default.json
git commit -m "feat(cli): add bundled default blueprint for offline init"
```

---

### Task 3: Create Bundled Default Theme

**Files:**
- Create: `packages/cli/src/bundled/themes/default.json`

- [ ] **Step 1: Create default theme**

Create `packages/cli/src/bundled/themes/default.json`:

```json
{
  "id": "default",
  "$schema": "https://decantr.ai/schemas/theme.v1.json",
  "version": "1.0.0",
  "decantr_compat": ">=1.0.0",
  "name": "Decantr Default",
  "description": "Neutral theme that works in light and dark modes. Clean and professional.",
  "tags": ["neutral", "light", "dark", "minimal"],
  "personality": "clean + minimal + professional",
  "seed": {
    "primary": "#3B82F6",
    "secondary": "#6B7280",
    "accent": "#8B5CF6",
    "background": "#FFFFFF"
  },
  "palette": {
    "background": {
      "light": "#FFFFFF",
      "dark": "#18181B"
    },
    "surface": {
      "light": "#F9FAFB",
      "dark": "#27272A"
    },
    "surface-raised": {
      "light": "#F3F4F6",
      "dark": "#3F3F46"
    },
    "border": {
      "light": "#E5E7EB",
      "dark": "#52525B"
    },
    "text": {
      "light": "#111827",
      "dark": "#FAFAFA"
    },
    "text-muted": {
      "light": "#6B7280",
      "dark": "#A1A1AA"
    },
    "primary": {
      "light": "#3B82F6",
      "dark": "#60A5FA"
    }
  },
  "modes": ["light", "dark", "system"],
  "shapes": ["rounded", "sharp", "pill"]
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/cli/src/bundled/themes/default.json
git commit -m "feat(cli): add bundled default theme for offline init"
```

---

### Task 4: Create Bundled Core Patterns

**Files:**
- Create: `packages/cli/src/bundled/patterns/hero.json`
- Create: `packages/cli/src/bundled/patterns/nav-header.json`
- Create: `packages/cli/src/bundled/patterns/content-section.json`
- Create: `packages/cli/src/bundled/patterns/footer.json`
- Create: `packages/cli/src/bundled/patterns/form-basic.json`

- [ ] **Step 1: Create hero pattern**

Create `packages/cli/src/bundled/patterns/hero.json`:

```json
{
  "id": "hero",
  "$schema": "https://decantr.ai/schemas/pattern.v2.json",
  "version": "1.0.0",
  "decantr_compat": ">=1.0.0",
  "name": "Hero",
  "description": "Landing page hero section with headline, subheadline, and CTA.",
  "components": ["Button"],
  "default_preset": "standard",
  "presets": {
    "standard": {
      "description": "Centered hero with headline and CTA",
      "layout": {
        "layout": "stack",
        "atoms": "_flex _col _aic _tc _py12 _gap6"
      }
    }
  },
  "default_layout": {
    "layout": "stack",
    "atoms": "_flex _col _aic _tc _py12 _gap6",
    "slots": {
      "headline": "Main headline text",
      "subheadline": "Supporting description",
      "cta": "Call-to-action button(s)"
    }
  }
}
```

- [ ] **Step 2: Create nav-header pattern**

Create `packages/cli/src/bundled/patterns/nav-header.json`:

```json
{
  "id": "nav-header",
  "$schema": "https://decantr.ai/schemas/pattern.v2.json",
  "version": "1.0.0",
  "decantr_compat": ">=1.0.0",
  "name": "Navigation Header",
  "description": "Top navigation bar with logo, links, and actions.",
  "components": ["Button", "Link"],
  "default_preset": "standard",
  "presets": {
    "standard": {
      "description": "Horizontal nav with logo left, links center, actions right",
      "layout": {
        "layout": "row",
        "atoms": "_flex _aic _jcsb _px6 _py3 _borderB"
      }
    }
  },
  "default_layout": {
    "layout": "row",
    "atoms": "_flex _aic _jcsb _px6 _py3 _borderB",
    "slots": {
      "logo": "Brand logo or name",
      "links": "Navigation links",
      "actions": "Action buttons (login, signup)"
    }
  }
}
```

- [ ] **Step 3: Create content-section pattern**

Create `packages/cli/src/bundled/patterns/content-section.json`:

```json
{
  "id": "content-section",
  "$schema": "https://decantr.ai/schemas/pattern.v2.json",
  "version": "1.0.0",
  "decantr_compat": ">=1.0.0",
  "name": "Content Section",
  "description": "Generic content section with heading and body.",
  "components": [],
  "default_preset": "standard",
  "presets": {
    "standard": {
      "description": "Centered content with max-width",
      "layout": {
        "layout": "stack",
        "atoms": "_flex _col _gap4 _py8 _px6 _mxauto _maxw[800px]"
      }
    }
  },
  "default_layout": {
    "layout": "stack",
    "atoms": "_flex _col _gap4 _py8 _px6 _mxauto _maxw[800px]",
    "slots": {
      "heading": "Section heading",
      "body": "Section content"
    }
  }
}
```

- [ ] **Step 4: Create footer pattern**

Create `packages/cli/src/bundled/patterns/footer.json`:

```json
{
  "id": "footer",
  "$schema": "https://decantr.ai/schemas/pattern.v2.json",
  "version": "1.0.0",
  "decantr_compat": ">=1.0.0",
  "name": "Footer",
  "description": "Page footer with links and copyright.",
  "components": ["Link"],
  "default_preset": "standard",
  "presets": {
    "standard": {
      "description": "Simple footer with links and copyright",
      "layout": {
        "layout": "row",
        "atoms": "_flex _aic _jcsb _px6 _py4 _borderT _fgmuted"
      }
    }
  },
  "default_layout": {
    "layout": "row",
    "atoms": "_flex _aic _jcsb _px6 _py4 _borderT _fgmuted",
    "slots": {
      "links": "Footer links",
      "copyright": "Copyright notice"
    }
  }
}
```

- [ ] **Step 5: Create form-basic pattern**

Create `packages/cli/src/bundled/patterns/form-basic.json`:

```json
{
  "id": "form-basic",
  "$schema": "https://decantr.ai/schemas/pattern.v2.json",
  "version": "1.0.0",
  "decantr_compat": ">=1.0.0",
  "name": "Basic Form",
  "description": "Simple form with inputs and submit button.",
  "components": ["Input", "Button", "Label"],
  "default_preset": "standard",
  "presets": {
    "standard": {
      "description": "Vertical form with stacked fields",
      "layout": {
        "layout": "stack",
        "atoms": "_flex _col _gap4"
      }
    }
  },
  "default_layout": {
    "layout": "stack",
    "atoms": "_flex _col _gap4",
    "slots": {
      "fields": "Form input fields",
      "actions": "Submit/cancel buttons"
    }
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/bundled/patterns/
git commit -m "feat(cli): add bundled core patterns for offline init"
```

---

### Task 5: Create Bundled Default Shell

**Files:**
- Create: `packages/cli/src/bundled/shells/default.json`

- [ ] **Step 1: Create default shell**

Create `packages/cli/src/bundled/shells/default.json`:

```json
{
  "id": "default",
  "$schema": "https://decantr.ai/schemas/shell.v1.json",
  "version": "1.0.0",
  "name": "Default Shell",
  "description": "Simple top-nav + main content layout.",
  "layout": "stack",
  "atoms": "_flex _col _minh[100vh]",
  "config": {
    "regions": ["header", "body"],
    "header": {
      "height": "auto",
      "sticky": true
    },
    "body": {
      "scroll": true,
      "flex": 1
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/cli/src/bundled/shells/default.json
git commit -m "feat(cli): add bundled default shell for offline init"
```

---

### Task 6: Update CLI Package.json for Bundled Files

**Files:**
- Modify: `packages/cli/package.json`

- [ ] **Step 1: Add bundled to files array**

In `packages/cli/package.json`, update the `files` array:

```json
{
  "files": [
    "dist",
    "src/templates",
    "src/bundled"
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/cli/package.json
git commit -m "chore(cli): include bundled content in package distribution"
```

---

### Task 7: Update Registry Client for Bundled Fallback

**Files:**
- Modify: `packages/cli/src/registry.ts`

- [ ] **Step 1: Add bundled content loader**

Add function to load from bundled content at the top of the file after imports:

```typescript
function getBundledContentRoot(): string {
  return join(import.meta.dirname, 'bundled');
}

function loadFromBundledLocal<T>(
  contentType: string,
  id?: string
): FetchResult<T> | null {
  const bundledRoot = getBundledContentRoot();

  if (id) {
    const filePath = join(bundledRoot, contentType, `${id}.json`);
    if (existsSync(filePath)) {
      try {
        const data = JSON.parse(readFileSync(filePath, 'utf-8')) as T;
        return { data, source: { type: 'bundled' } };
      } catch { return null; }
    }
    return null;
  }

  // Load all items from bundled directory
  const dir = join(bundledRoot, contentType);
  if (!existsSync(dir)) return null;

  try {
    const files = readdirSync(dir).filter(f => f.endsWith('.json'));
    const items = files.map(f => {
      const content = JSON.parse(readFileSync(join(dir, f), 'utf-8'));
      return { id: content.id || f.replace('.json', ''), ...content };
    });
    return {
      data: { items, total: items.length } as unknown as T,
      source: { type: 'bundled' }
    };
  } catch { return null; }
}
```

- [ ] **Step 2: Update fallback chain to use local bundled**

In each fetch method, add bundled fallback after cache. Example for `fetchTheme`:

```typescript
async fetchTheme(id: string): Promise<FetchResult<RegistryItem> | null> {
  // Check for custom: prefix
  if (id.startsWith('custom:')) {
    return this.loadCustomContent<RegistryItem>('themes', id.slice(7));
  }

  // Try API
  if (!this.offline) {
    const apiResult = await tryApi<RegistryItem>(`themes/${id}`, this.apiUrl);
    if (apiResult) {
      saveToCache(this.cacheDir, 'themes', id, apiResult.data);
      return apiResult;
    }
  }

  // Try cache
  const cacheResult = loadFromCache<RegistryItem>(this.cacheDir, 'themes', id);
  if (cacheResult) return cacheResult;

  // Try monorepo bundled (existing)
  const bundledResult = loadFromBundled<RegistryItem>('themes', id);
  if (bundledResult) return bundledResult;

  // Try local bundled (new - for CLI distribution)
  return loadFromBundledLocal<RegistryItem>('themes', id);
}
```

- [ ] **Step 3: Add shells support**

Add `fetchShell` and `fetchShells` methods:

```typescript
async fetchShells(): Promise<FetchResult<{ items: RegistryItem[]; total: number }>> {
  if (!this.offline) {
    const apiResult = await tryApi<{ items: RegistryItem[]; total: number }>('shells', this.apiUrl);
    if (apiResult) {
      saveToCache(this.cacheDir, 'shells', null, apiResult.data);
      return apiResult;
    }
  }

  const cacheResult = loadFromCache<{ items: RegistryItem[]; total: number }>(this.cacheDir, 'shells');
  if (cacheResult) return cacheResult;

  const bundledResult = loadFromBundled<{ items: RegistryItem[]; total: number }>('shells');
  if (bundledResult) return bundledResult;

  const localBundled = loadFromBundledLocal<{ items: RegistryItem[]; total: number }>('shells');
  if (localBundled) return localBundled;

  return { data: { items: [], total: 0 }, source: { type: 'bundled' } };
}

async fetchShell(id: string): Promise<FetchResult<RegistryItem> | null> {
  if (!this.offline) {
    const apiResult = await tryApi<RegistryItem>(`shells/${id}`, this.apiUrl);
    if (apiResult) {
      saveToCache(this.cacheDir, 'shells', id, apiResult.data);
      return apiResult;
    }
  }

  const cacheResult = loadFromCache<RegistryItem>(this.cacheDir, 'shells', id);
  if (cacheResult) return cacheResult;

  const bundledResult = loadFromBundled<RegistryItem>('shells', id);
  if (bundledResult) return bundledResult;

  return loadFromBundledLocal<RegistryItem>('shells', id);
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/cli/src/registry.ts
git commit -m "feat(cli): add bundled content fallback and shells support"
```

---

## Phase 2: CLI Init Refactor

### Task 8: Simplify Init Flow

**Files:**
- Modify: `packages/cli/src/index.ts`
- Modify: `packages/cli/src/prompts.ts`

- [ ] **Step 1: Add simplified init prompt**

Create new prompt function in `packages/cli/src/prompts.ts`:

```typescript
export async function runSimplifiedInit(
  blueprints: Array<{ id: string; name?: string; description?: string }>
): Promise<{ choice: 'default' | 'search'; searchQuery?: string; selectedBlueprint?: string }> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const question = (q: string): Promise<string> =>
    new Promise(resolve => rl.question(q, resolve));

  console.log('\n? What blueprint would you like to scaffold?\n');
  console.log('  1. Decantr default (recommended)');
  console.log('  2. Search registry...\n');

  const choice = await question('Enter choice (1 or 2): ');

  if (choice === '1' || choice === '') {
    rl.close();
    return { choice: 'default' };
  }

  // Search flow
  const searchQuery = await question('Search: ');

  // Filter blueprints by query
  const matches = blueprints.filter(b =>
    b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10);

  if (matches.length === 0) {
    console.log('\nNo matches found. Using Decantr default.');
    rl.close();
    return { choice: 'default' };
  }

  console.log('\nResults:');
  matches.forEach((b, i) => {
    console.log(`  ${i + 1}. ${b.id} — ${b.description || b.name || ''}`);
  });

  const selection = await question('\nSelect (number): ');
  const idx = parseInt(selection, 10) - 1;

  rl.close();

  if (idx >= 0 && idx < matches.length) {
    return { choice: 'search', selectedBlueprint: matches[idx].id };
  }

  return { choice: 'default' };
}
```

- [ ] **Step 2: Update cmdInit to use simplified flow**

In `packages/cli/src/index.ts`, modify `cmdInit`:

```typescript
async function cmdInit(args: InitArgs) {
  const projectRoot = process.cwd();
  console.log(heading('Decantr Project Setup'));

  // Check for existing essence
  const detected = detectProject(projectRoot);
  if (detected.existingEssence && !args.existing) {
    console.log(`${YELLOW}Warning: decantr.essence.json already exists.${RESET}`);
    const overwrite = await confirm('Overwrite existing configuration?', false);
    if (!overwrite) {
      console.log(dim('Cancelled.'));
      return;
    }
  }

  // Create registry client
  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
    apiUrl: args.registry,
    offline: args.offline,
  });

  // Check connectivity
  const apiAvailable = await registryClient.checkApiAvailability();

  let selectedBlueprint = 'default';
  let registrySource: 'api' | 'bundled' = 'bundled';

  if (args.yes) {
    // Non-interactive: use --blueprint flag or default
    selectedBlueprint = args.blueprint || 'default';
  } else if (!apiAvailable) {
    // Offline mode
    console.log(`\n${YELLOW}⚠ You're offline. Scaffolding Decantr default.${RESET}`);
    console.log(dim('Run `decantr upgrade` when online, or visit decantr.ai/registry\n'));
    selectedBlueprint = 'default';
  } else {
    // Online: fetch blueprints and show simplified prompt
    console.log(dim('Fetching registry content...'));
    const blueprintsResult = await registryClient.fetchBlueprints();
    registrySource = blueprintsResult.source.type === 'api' ? 'api' : 'bundled';

    const { choice, selectedBlueprint: selected } = await runSimplifiedInit(
      blueprintsResult.data.items
    );

    selectedBlueprint = selected || 'default';
  }

  // Continue with scaffold using selectedBlueprint...
  // (rest of existing init logic, but use selectedBlueprint)
}
```

- [ ] **Step 3: Add post-scaffold messaging**

After successful scaffold, show commands:

```typescript
// After scaffold success
console.log(success('\n✓ Project scaffolded!\n'));
console.log('  Files created:');
console.log(`    ${cyan('decantr.essence.json')}    Design specification`);
console.log(`    ${cyan('DECANTR.md')}              LLM instructions`);
console.log(`    ${cyan('.decantr/')}               Project state & cache`);
console.log('');
console.log('  Next steps:');
console.log('    1. Review DECANTR.md for methodology');
console.log('    2. Explore more at decantr.ai/registry');
console.log('');
console.log('  Commands:');
console.log(`    ${cyan('decantr status')}     Project health`);
console.log(`    ${cyan('decantr search')}     Search registry`);
console.log(`    ${cyan('decantr get')}        Fetch content details`);
console.log(`    ${cyan('decantr validate')}   Check essence file`);
console.log(`    ${cyan('decantr upgrade')}    Update to latest patterns`);
console.log(`    ${cyan('decantr heal')}       Fix drift issues`);
```

- [ ] **Step 4: Commit**

```bash
git add packages/cli/src/index.ts packages/cli/src/prompts.ts
git commit -m "feat(cli): simplify init flow to two choices (default or search)"
```

---

## Phase 3: Content Repo Setup

### Task 9: Initialize decantr-content Repository

**Repo:** `github.com/decantr-ai/decantr-content`

- [ ] **Step 1: Clone and create structure**

```bash
cd /Users/davidaimi/projects
git clone https://github.com/decantr-ai/decantr-content.git
cd decantr-content

mkdir -p official/patterns
mkdir -p official/recipes
mkdir -p official/themes
mkdir -p official/blueprints
mkdir -p official/archetypes
mkdir -p official/shells
mkdir -p scripts
mkdir -p .github/workflows
```

- [ ] **Step 2: Create package.json**

Create `package.json`:

```json
{
  "name": "decantr-content",
  "version": "1.0.0",
  "private": true,
  "description": "Official Decantr content registry",
  "type": "module",
  "scripts": {
    "validate": "node scripts/validate.js",
    "publish:dry-run": "DRYRUN=true node scripts/publish-to-registry.js",
    "publish": "node scripts/publish-to-registry.js"
  }
}
```

- [ ] **Step 3: Create README.md**

Create `README.md`:

```markdown
# Decantr Content

Official content for the Decantr registry.

## Structure

```
official/
├── patterns/      # UI section components
├── recipes/       # Visual decoration rules
├── themes/        # Color palettes and modes
├── blueprints/    # Complete app compositions
├── archetypes/    # App-level templates
└── shells/        # Page layout containers
```

## Commands

```bash
npm run validate        # Validate all JSON schemas
npm run publish:dry-run # Preview what would be published
npm run publish         # Publish to registry (requires REGISTRY_API_KEY)
```

## Publishing

Content is automatically published to the registry when merged to `main` via GitHub Actions.
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: initialize content repository structure"
```

---

### Task 10: Copy Content from Monorepo

**Files:**
- Copy all JSON files from `decantr-monorepo/content/` to `decantr-content/official/`

- [ ] **Step 1: Copy patterns**

```bash
cp /Users/davidaimi/projects/decantr-monorepo/content/patterns/*.json official/patterns/
cp /Users/davidaimi/projects/decantr-monorepo/content/core/patterns/*.json official/patterns/
```

- [ ] **Step 2: Copy recipes**

```bash
cp /Users/davidaimi/projects/decantr-monorepo/content/recipes/*.json official/recipes/
```

- [ ] **Step 3: Copy themes**

```bash
cp /Users/davidaimi/projects/decantr-monorepo/content/themes/*.json official/themes/
```

- [ ] **Step 4: Copy blueprints**

```bash
cp /Users/davidaimi/projects/decantr-monorepo/content/blueprints/*.json official/blueprints/
```

- [ ] **Step 5: Copy archetypes**

```bash
cp /Users/davidaimi/projects/decantr-monorepo/content/archetypes/*.json official/archetypes/
```

- [ ] **Step 6: Copy shells**

```bash
cp /Users/davidaimi/projects/decantr-monorepo/content/core/shells.json official/shells/
```

- [ ] **Step 7: Commit**

```bash
git add official/
git commit -m "feat: migrate content from monorepo"
```

---

### Task 11: Create Validation Script

**Files:**
- Create: `decantr-content/scripts/validate.js`

- [ ] **Step 1: Create validation script**

Create `scripts/validate.js`:

```javascript
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const CONTENT_TYPES = ['patterns', 'recipes', 'themes', 'blueprints', 'archetypes', 'shells'];
const REQUIRED_FIELDS = {
  patterns: ['id', 'name', 'description'],
  recipes: ['id', 'name'],
  themes: ['id', 'name', 'seed'],
  blueprints: ['id', 'name', 'compose'],
  archetypes: ['id', 'name', 'pages'],
  shells: ['id', 'name']
};

let errors = 0;
let validated = 0;

for (const type of CONTENT_TYPES) {
  const dir = join('official', type);
  if (!existsSync(dir)) continue;

  const files = readdirSync(dir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const path = join(dir, file);
    try {
      const content = JSON.parse(readFileSync(path, 'utf-8'));

      // Check required fields
      const required = REQUIRED_FIELDS[type] || ['id'];
      for (const field of required) {
        if (!content[field]) {
          console.error(`❌ ${path}: missing required field "${field}"`);
          errors++;
        }
      }

      // Check id matches filename
      const expectedId = file.replace('.json', '');
      if (content.id && content.id !== expectedId && type !== 'shells') {
        console.warn(`⚠ ${path}: id "${content.id}" doesn't match filename "${expectedId}"`);
      }

      validated++;
    } catch (e) {
      console.error(`❌ ${path}: invalid JSON - ${e.message}`);
      errors++;
    }
  }
}

console.log(`\nValidated ${validated} files, ${errors} errors`);
process.exit(errors > 0 ? 1 : 0);
```

- [ ] **Step 2: Test validation**

```bash
npm run validate
# Expected: Validated N files, 0 errors
```

- [ ] **Step 3: Commit**

```bash
git add scripts/validate.js
git commit -m "feat: add content validation script"
```

---

### Task 12: Create Publish Script

**Files:**
- Create: `decantr-content/scripts/publish-to-registry.js`

- [ ] **Step 1: Create publish script**

Create `scripts/publish-to-registry.js`:

```javascript
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const REGISTRY_URL = process.env.REGISTRY_URL || 'https://decantr-registry.fly.dev/v1';
const API_KEY = process.env.REGISTRY_API_KEY;
const DRY_RUN = process.env.DRYRUN === 'true';

const CONTENT_TYPES = ['patterns', 'recipes', 'themes', 'blueprints', 'archetypes', 'shells'];

if (!API_KEY && !DRY_RUN) {
  console.error('REGISTRY_API_KEY is required');
  process.exit(1);
}

let published = 0;
let skipped = 0;
let failed = 0;

async function publishItem(type, content) {
  const endpoint = `${REGISTRY_URL}/admin/${type}/${content.id}`;

  if (DRY_RUN) {
    console.log(`[dry-run] Would publish ${type}/${content.id}`);
    return true;
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(content)
    });

    if (res.ok) {
      console.log(`✓ Published ${type}/${content.id}`);
      return true;
    } else if (res.status === 409) {
      console.log(`⊘ Skipped ${type}/${content.id} (version exists)`);
      return 'skip';
    } else {
      console.error(`✗ Failed ${type}/${content.id}: ${res.status}`);
      return false;
    }
  } catch (e) {
    console.error(`✗ Failed ${type}/${content.id}: ${e.message}`);
    return false;
  }
}

for (const type of CONTENT_TYPES) {
  const dir = join('official', type);
  if (!existsSync(dir)) continue;

  const files = readdirSync(dir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const content = JSON.parse(readFileSync(join(dir, file), 'utf-8'));
    const result = await publishItem(type, content);

    if (result === true) published++;
    else if (result === 'skip') skipped++;
    else failed++;
  }
}

console.log(`\nPublished: ${published}, Skipped: ${skipped}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
```

- [ ] **Step 2: Test dry run**

```bash
npm run publish:dry-run
# Expected: Lists all items that would be published
```

- [ ] **Step 3: Commit**

```bash
git add scripts/publish-to-registry.js
git commit -m "feat: add registry publish script"
```

---

### Task 13: Create GitHub Actions Workflow

**Files:**
- Create: `decantr-content/.github/workflows/publish.yml`

- [ ] **Step 1: Create workflow**

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to Registry

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Validate content
        run: node scripts/validate.js

  publish:
    needs: validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Publish to registry
        env:
          REGISTRY_API_KEY: ${{ secrets.REGISTRY_API_KEY }}
        run: node scripts/publish-to-registry.js
```

- [ ] **Step 2: Commit and push**

```bash
git add .github/workflows/publish.yml
git commit -m "ci: add GitHub Actions workflow for registry publishing"
git push origin main
```

- [ ] **Step 3: Add REGISTRY_API_KEY secret to GitHub repo**

Go to `github.com/decantr-ai/decantr-content/settings/secrets/actions` and add `REGISTRY_API_KEY`.

---

## Phase 4: New CLI Commands

### Task 14: Implement Upgrade Command

**Files:**
- Create: `packages/cli/src/commands/upgrade.ts`
- Modify: `packages/cli/src/index.ts`

- [ ] **Step 1: Create upgrade command**

Create `packages/cli/src/commands/upgrade.ts`:

```typescript
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { RegistryClient } from '../registry.js';

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

interface Upgrade {
  type: string;
  id: string;
  currentVersion: string;
  latestVersion: string;
}

export async function cmdUpgrade(projectRoot: string = process.cwd()): Promise<void> {
  const essencePath = join(projectRoot, 'decantr.essence.json');

  if (!existsSync(essencePath)) {
    console.error('No decantr.essence.json found. Run `decantr init` first.');
    process.exitCode = 1;
    return;
  }

  const essence = JSON.parse(readFileSync(essencePath, 'utf-8'));
  const client = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache')
  });

  console.log('Checking for updates...\n');

  const upgrades: Upgrade[] = [];

  // Check theme
  if (essence.theme?.style) {
    const theme = await client.fetchTheme(essence.theme.style);
    if (theme && theme.data.version) {
      // Compare versions (simplified)
      const current = essence.theme.version || '0.0.0';
      if (theme.data.version !== current) {
        upgrades.push({
          type: 'theme',
          id: essence.theme.style,
          currentVersion: current,
          latestVersion: theme.data.version
        });
      }
    }
  }

  // Check blueprint
  if (essence.blueprint) {
    const blueprint = await client.fetchBlueprint(essence.blueprint);
    if (blueprint && blueprint.data.version) {
      const current = essence.blueprintVersion || '0.0.0';
      if (blueprint.data.version !== current) {
        upgrades.push({
          type: 'blueprint',
          id: essence.blueprint,
          currentVersion: current,
          latestVersion: blueprint.data.version
        });
      }
    }
  }

  if (upgrades.length === 0) {
    console.log(`${GREEN}✓ Everything is up to date.${RESET}`);
    return;
  }

  console.log('Available upgrades:\n');
  for (const u of upgrades) {
    console.log(`  ${u.type}/${u.id}: ${DIM}${u.currentVersion}${RESET} → ${GREEN}${u.latestVersion}${RESET}`);
  }

  console.log(`\n${YELLOW}Run with --apply to apply upgrades.${RESET}`);
}
```

- [ ] **Step 2: Add upgrade to main CLI**

In `packages/cli/src/index.ts`, add case for upgrade:

```typescript
case 'upgrade': {
  const { cmdUpgrade } = await import('./commands/upgrade.js');
  await cmdUpgrade(process.cwd());
  break;
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/cli/src/commands/upgrade.ts packages/cli/src/index.ts
git commit -m "feat(cli): add upgrade command to check for content updates"
```

---

### Task 15: Implement Heal Command

**Files:**
- Create: `packages/cli/src/commands/heal.ts`
- Modify: `packages/cli/src/index.ts`

- [ ] **Step 1: Create heal command**

Create `packages/cli/src/commands/heal.ts`:

```typescript
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { validateEssence, evaluateGuard } from '@decantr/essence-spec';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

interface Issue {
  type: 'error' | 'warning';
  rule: string;
  message: string;
  suggestion?: string;
}

export async function cmdHeal(projectRoot: string = process.cwd()): Promise<void> {
  const essencePath = join(projectRoot, 'decantr.essence.json');

  if (!existsSync(essencePath)) {
    console.error('No decantr.essence.json found. Run `decantr init` first.');
    process.exitCode = 1;
    return;
  }

  const essence = JSON.parse(readFileSync(essencePath, 'utf-8'));

  console.log('Scanning for issues...\n');

  const issues: Issue[] = [];

  // Validate schema
  const validation = validateEssence(essence);
  if (!validation.valid) {
    for (const err of validation.errors) {
      issues.push({
        type: 'error',
        rule: 'schema',
        message: err
      });
    }
  }

  // Run guard rules
  try {
    const violations = evaluateGuard(essence, { themeRegistry: new Map(), patternRegistry: new Map() });
    for (const v of violations) {
      issues.push({
        type: v.severity === 'error' ? 'error' : 'warning',
        rule: v.rule,
        message: v.message,
        suggestion: v.suggestion
      });
    }
  } catch { /* guard evaluation optional */ }

  if (issues.length === 0) {
    console.log(`${GREEN}✓ No issues found. Project is healthy.${RESET}`);
    return;
  }

  console.log(`Found ${issues.length} issue(s):\n`);

  for (const issue of issues) {
    const icon = issue.type === 'error' ? `${RED}✗${RESET}` : `${YELLOW}⚠${RESET}`;
    console.log(`${icon} [${issue.rule}] ${issue.message}`);
    if (issue.suggestion) {
      console.log(`  ${DIM}Suggestion: ${issue.suggestion}${RESET}`);
    }
  }

  console.log(`\n${YELLOW}Manual fixes required. Review the issues above.${RESET}`);
}
```

- [ ] **Step 2: Add heal to main CLI**

In `packages/cli/src/index.ts`, add case for heal:

```typescript
case 'heal': {
  const { cmdHeal } = await import('./commands/heal.js');
  await cmdHeal(process.cwd());
  break;
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/cli/src/commands/heal.ts packages/cli/src/index.ts
git commit -m "feat(cli): add heal command to detect and report drift issues"
```

---

### Task 16: Add Shells to Get Command

**Files:**
- Modify: `packages/cli/src/index.ts`

- [ ] **Step 1: Update cmdGet to support shells**

In the `cmdGet` function, add 'shell' to valid types:

```typescript
async function cmdGet(type: string, id: string) {
  const validTypes = ['pattern', 'archetype', 'recipe', 'theme', 'blueprint', 'shell'] as const;
  if (!validTypes.includes(type as any)) {
    console.error(error(`Invalid type "${type}". Must be one of: ${validTypes.join(', ')}`));
    process.exitCode = 1;
    return;
  }

  const resolver = getResolver();
  let result = await resolver.resolve(type as any, id);

  // For shells, also check the client
  if (!result && type === 'shell') {
    const client = new RegistryClient({
      cacheDir: join(process.cwd(), '.decantr', 'cache')
    });
    const shellResult = await client.fetchShell(id);
    if (shellResult) {
      console.log(JSON.stringify(shellResult.data, null, 2));
      return;
    }
  }

  // ... rest of existing logic
}
```

- [ ] **Step 2: Update cmdList to support shells**

In the `cmdList` function, add 'shells' to valid types:

```typescript
async function cmdList(type: string) {
  const validTypes = ['patterns', 'archetypes', 'recipes', 'themes', 'blueprints', 'shells'] as const;
  // ... rest of function
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/cli/src/index.ts
git commit -m "feat(cli): add shells support to get and list commands"
```

---

## Phase 5: Testing

### Task 17: Create E2E Tests for Init

**Files:**
- Create: `packages/cli/test/e2e/init.test.ts`

- [ ] **Step 1: Create init test file**

Create `packages/cli/test/e2e/init.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';

describe('init command', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-test-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('creates essence file with default blueprint', () => {
    execSync('npx tsx ../src/index.ts init --yes', {
      cwd: testDir,
      env: { ...process.env, DECANTR_OFFLINE: 'true' }
    });

    expect(existsSync(join(testDir, 'decantr.essence.json'))).toBe(true);
  });

  it('creates DECANTR.md file', () => {
    execSync('npx tsx ../src/index.ts init --yes', {
      cwd: testDir,
      env: { ...process.env, DECANTR_OFFLINE: 'true' }
    });

    expect(existsSync(join(testDir, 'DECANTR.md'))).toBe(true);
  });

  it('DECANTR.md uses @decantr/cli not decantr', () => {
    execSync('npx tsx ../src/index.ts init --yes', {
      cwd: testDir,
      env: { ...process.env, DECANTR_OFFLINE: 'true' }
    });

    const content = readFileSync(join(testDir, 'DECANTR.md'), 'utf-8');
    expect(content).toContain('npx @decantr/cli');
    expect(content).not.toMatch(/npx decantr /);
  });

  it('creates .decantr directory', () => {
    execSync('npx tsx ../src/index.ts init --yes', {
      cwd: testDir,
      env: { ...process.env, DECANTR_OFFLINE: 'true' }
    });

    expect(existsSync(join(testDir, '.decantr'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
cd packages/cli
pnpm test test/e2e/init.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add packages/cli/test/e2e/init.test.ts
git commit -m "test(cli): add e2e tests for init command"
```

---

### Task 18: Create E2E Tests for Registry Commands

**Files:**
- Create: `packages/cli/test/e2e/registry-commands.test.ts`

- [ ] **Step 1: Create registry commands test file**

Create `packages/cli/test/e2e/registry-commands.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';

describe('registry commands', () => {
  it('search returns results', () => {
    const output = execSync('npx tsx src/index.ts search dashboard', {
      cwd: process.cwd(),
      encoding: 'utf-8'
    });

    expect(output).toContain('result');
  });

  it('list blueprints returns items', () => {
    const output = execSync('npx tsx src/index.ts list blueprints', {
      cwd: process.cwd(),
      encoding: 'utf-8'
    });

    expect(output).toContain('blueprint');
  });

  it('get theme returns JSON', () => {
    const output = execSync('npx tsx src/index.ts get theme carbon', {
      cwd: process.cwd(),
      encoding: 'utf-8'
    });

    const json = JSON.parse(output);
    expect(json.id).toBe('carbon');
    expect(json.seed).toBeDefined();
  });

  it('get pattern returns presets', () => {
    const output = execSync('npx tsx src/index.ts get pattern hero', {
      cwd: process.cwd(),
      encoding: 'utf-8'
    });

    const json = JSON.parse(output);
    expect(json.id).toBe('hero');
    expect(json.presets).toBeDefined();
  });
});
```

- [ ] **Step 2: Run tests**

```bash
cd packages/cli
pnpm test test/e2e/registry-commands.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add packages/cli/test/e2e/registry-commands.test.ts
git commit -m "test(cli): add e2e tests for registry commands"
```

---

## Phase 6: Cleanup

### Task 19: Delete Content Folder from Monorepo

**Files:**
- Delete: `content/` (entire folder)

- [ ] **Step 1: Verify content is migrated**

```bash
# In decantr-content repo
ls -la official/patterns/ | wc -l
# Should match or exceed monorepo content count

ls -la official/themes/ | wc -l
ls -la official/recipes/ | wc -l
ls -la official/blueprints/ | wc -l
ls -la official/archetypes/ | wc -l
```

- [ ] **Step 2: Delete content folder**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
rm -rf content/
```

- [ ] **Step 3: Update any references to content/**

Search for remaining references:

```bash
grep -r "content/" packages/ --include="*.ts" --include="*.js"
```

Update `packages/cli/src/registry.ts` to remove references to monorepo content folder (the `getBundledContentRoot` function that points to `../../../content`).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove content/ folder (migrated to decantr-content repo)"
```

---

### Task 20: Create Portal Stub

**Repo:** `github.com/decantr-ai/decantr-registry-portal`

- [ ] **Step 1: Clone and create stub**

```bash
cd /Users/davidaimi/projects
git clone https://github.com/decantr-ai/decantr-registry-portal.git
cd decantr-registry-portal
```

- [ ] **Step 2: Create index.html**

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Decantr Registry</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #18181B;
      color: #FAFAFA;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 500px;
    }
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    p { color: #A1A1AA; margin-bottom: 2rem; }
    code {
      display: block;
      background: #27272A;
      padding: 1rem;
      border-radius: 8px;
      font-family: monospace;
      color: #60A5FA;
      margin: 0.5rem 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Decantr Registry</h1>
    <p>Coming soon.</p>
    <p>For now, use the CLI:</p>
    <code>npx @decantr/cli search &lt;query&gt;</code>
    <code>npx @decantr/cli list blueprints</code>
  </div>
</body>
</html>
```

- [ ] **Step 3: Commit and push**

```bash
git add index.html
git commit -m "feat: add registry portal stub page"
git push origin main
```

---

## Final Checklist

- [ ] DECANTR.md template uses `@decantr/cli`
- [ ] Bundled content exists in `packages/cli/src/bundled/`
- [ ] Init flow simplified to two choices
- [ ] Offline fallback works with bundled default
- [ ] Content migrated to decantr-content repo
- [ ] Validation and publish scripts work
- [ ] GitHub Actions publishes to registry
- [ ] `upgrade` command implemented
- [ ] `heal` command implemented
- [ ] Shells supported in `get` and `list`
- [ ] E2E tests pass
- [ ] `content/` folder deleted from monorepo
- [ ] Portal stub deployed

---

## Execution Order

1. **Task 1-7**: CLI template and bundled content (can test immediately)
2. **Task 8**: Init refactor (test with existing registry)
3. **Task 9-13**: Content repo setup (parallel with Task 8)
4. **Task 14-16**: New CLI commands
5. **Task 17-18**: E2E tests
6. **Task 19-20**: Cleanup and portal
