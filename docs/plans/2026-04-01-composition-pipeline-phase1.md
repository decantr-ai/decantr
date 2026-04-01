# Composition Pipeline Phase 1+2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat-page composition pipeline with a section-based model that produces self-contained section context files with inlined pattern specs, tokens, decorators, guard rules, and topology — so an LLM reads ONE file per task scope.

**Architecture:** The essence gains `blueprint.sections[]` (grouped by archetype) and `blueprint.routes`. The CLI composes sections instead of flat pages, reads full blueprint data (routes, personality, overrides, constraints), and generates per-section context files with everything inlined. DECANTR.md shrinks to a ~200-line methodology primer.

**Tech Stack:** TypeScript, Vitest, decantr-content (JSON)

**Spec:** `docs/specs/2026-04-01-composition-pipeline-v2-design.md`

---

## File Map

### @decantr/essence-spec

| File | Change | Responsibility |
|------|--------|---------------|
| `packages/essence-spec/src/types.ts` | Modify | Add V3.1 types: EssenceV31Section, RouteEntry, update EssenceBlueprint, EssenceDNA, EssenceMeta, EssenceV3 |
| `packages/essence-spec/src/index.ts` | Modify | Re-export new types |
| `packages/essence-spec/src/migrate.ts` | Modify | Add migrateV30ToV31 |
| `packages/essence-spec/src/guard.ts` | Modify | Update page iteration to use flattenPages |
| `packages/essence-spec/test/validate-v3.test.ts` | Modify | Update for V3.1 structure |

### @decantr/registry

| File | Change | Responsibility |
|------|--------|---------------|
| `packages/registry/src/types.ts` | Modify | Already has ArchetypeRole + ComposeEntry — no further changes |

### CLI

| File | Change | Responsibility |
|------|--------|---------------|
| `packages/cli/src/scaffold.ts` | Modify | composeSections(), buildEssenceV31(), generateSectionContext(), generateScaffoldContext(), simplified generateDecantrMd() |
| `packages/cli/src/index.ts` | Modify | Read full blueprint data, fetch patterns for inlining, wire through |
| `packages/cli/src/templates/DECANTR.md.template` | Rewrite | ~200-line methodology primer |
| `packages/cli/test/compose.test.ts` | Modify | Update for composeSections |
| `packages/cli/test/topology.test.ts` | Modify | Update for section-based topology |
| `packages/cli/test/context-gen.test.ts` | Create | Tests for section context generation |
| `packages/cli/test/scaffold-v3.test.ts` | Modify | Update for V3.1 output |

### decantr-content

| File | Change | Responsibility |
|------|--------|---------------|
| `archetypes/*.json` (52 files) | Already done | role field already present |
| `blueprints/*.json` (17 files) | Modify | Feature audit + correction |
| `validate.js` | Modify | Add feature/route validation |

---

## Task 1: Essence V3.1 Types

Add the new section-based types to essence-spec. This is the foundation everything else builds on.

**Files:**
- Modify: `packages/essence-spec/src/types.ts`
- Modify: `packages/essence-spec/src/index.ts`

- [ ] **Step 1: Add V3.1 section type**

In `packages/essence-spec/src/types.ts`, add after the existing `BlueprintPage` interface (line 226):

```ts
export type ArchetypeRole = 'primary' | 'gateway' | 'public' | 'auxiliary';

export interface EssenceV31Section {
  id: string;
  role: ArchetypeRole;
  shell: ShellType | string;
  features: string[];
  description: string;
  pages: BlueprintPage[];
}

export interface RouteEntry {
  section: string;
  page: string;
}
```

- [ ] **Step 2: Update BlueprintPage to support route and pattern refs**

Modify the existing `BlueprintPage` interface (line 220):

```ts
export interface BlueprintPage {
  id: string;
  route?: string;
  shell_override?: ShellType | null;
  layout: LayoutItem[];
  patterns?: PatternRef[];
  dna_overrides?: DNAOverrides;
  surface?: string;
}
```

- [ ] **Step 3: Update EssenceBlueprint to support sections**

Replace the existing `EssenceBlueprint` interface (line 228):

```ts
export interface EssenceBlueprint {
  shell?: ShellType | string;
  sections?: EssenceV31Section[];
  pages?: BlueprintPage[];            // V3.0 compat — absent in V3.1
  features: string[];
  routes?: Record<string, RouteEntry>;
  icon_style?: string;
  avatar_style?: string;
}
```

Both `sections` and `pages` are optional — V3.0 uses `pages`, V3.1 uses `sections`.

- [ ] **Step 4: Update EssenceDNA with constraints and enriched motion**

Add to the existing `EssenceDNA` interface (after `personality` on line 211):

```ts
  constraints?: {
    mode?: string;
    typography?: string;
    borders?: string;
    corners?: string;
    shadows?: string;
    effects?: Record<string, string>;
  };
```

Update the `motion` field to include optional timing/durations:

```ts
  motion: {
    preference: string;
    duration_scale: number;
    reduce_motion: boolean;
    timing?: string;
    durations?: Record<string, string>;
  };
```

- [ ] **Step 5: Update EssenceMeta with seo and navigation**

Add to the existing `EssenceMeta` interface (after `guard` on line 246):

```ts
  seo?: {
    schema_org?: string[];
    meta_priorities?: string[];
  };
  navigation?: {
    hotkeys?: Array<{ key: string; route?: string; action?: string; label: string }>;
    command_palette?: boolean;
  };
```

- [ ] **Step 6: Update EssenceV3 version type and isV3 check**

Update the `EssenceV3` interface version field (line 251):

```ts
  version: '3.0.0' | '3.1.0';
```

Update `isV3` function (line 262):

```ts
export function isV3(essence: EssenceFile): essence is EssenceV3 {
  return (essence.version === '3.0.0' || essence.version === '3.1.0') && 'dna' in essence && 'blueprint' in essence;
}
```

- [ ] **Step 7: Add flattenPages helper**

Add after `isV3`:

```ts
/** Flatten sections into a flat page list (for guards that iterate all pages). */
export function flattenPages(blueprint: EssenceBlueprint): BlueprintPage[] {
  if (blueprint.sections) {
    return blueprint.sections.flatMap(s =>
      s.pages.map(p => ({
        ...p,
        id: p.id,
        shell_override: p.shell_override ?? (s.shell !== blueprint.shell ? s.shell : undefined) as ShellType | null | undefined,
      }))
    );
  }
  return blueprint.pages ?? [];
}
```

- [ ] **Step 8: Re-export new types from index.ts**

Add to `packages/essence-spec/src/index.ts` exports: `EssenceV31Section`, `RouteEntry`, `ArchetypeRole` (if not already re-exported), `flattenPages`.

- [ ] **Step 9: Build and verify**

```bash
pnpm --filter @decantr/essence-spec run build
```

Expected: Clean build.

- [ ] **Step 10: Commit**

```bash
git add packages/essence-spec/src/types.ts packages/essence-spec/src/index.ts
git commit -m "feat(essence-spec): add V3.1 section types, routes, constraints, flattenPages"
```

---

## Task 2: V3.0 → V3.1 Migration

**Files:**
- Modify: `packages/essence-spec/src/migrate.ts`
- Create or modify: `packages/essence-spec/test/migrate.test.ts`

- [ ] **Step 1: Write migration test**

Add a test to the existing migrate test file:

```ts
describe('migrateV30ToV31', () => {
  it('wraps flat pages into a single section', () => {
    const v30: EssenceV3 = {
      version: '3.0.0',
      dna: { /* minimal valid DNA */ },
      blueprint: {
        shell: 'sidebar-main',
        pages: [
          { id: 'home', layout: ['hero'] },
          { id: 'about', layout: ['content'] },
        ],
        features: ['auth', 'chat'],
      },
      meta: {
        archetype: 'dashboard',
        target: 'react',
        platform: { type: 'spa', routing: 'hash' },
        guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
      },
    };

    const result = migrateV30ToV31(v30);

    expect(result.version).toBe('3.1.0');
    expect(result.blueprint.sections).toHaveLength(1);
    expect(result.blueprint.sections![0].id).toBe('dashboard');
    expect(result.blueprint.sections![0].role).toBe('primary');
    expect(result.blueprint.sections![0].pages).toHaveLength(2);
    expect(result.blueprint.sections![0].features).toEqual(['auth', 'chat']);
    expect(result.blueprint.pages).toBeUndefined();
    expect(result.blueprint.features).toEqual(['auth', 'chat']);
  });

  it('preserves existing V3.1 essence unchanged', () => {
    const v31 = {
      version: '3.1.0' as const,
      dna: { /* ... */ },
      blueprint: {
        sections: [{ id: 'test', role: 'primary', shell: 'sidebar-main', features: [], description: '', pages: [] }],
        features: [],
      },
      meta: { /* ... */ },
    };

    const result = migrateV30ToV31(v31 as any);
    expect(result.version).toBe('3.1.0');
    expect(result.blueprint.sections).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @decantr/essence-spec vitest run test/migrate.test.ts
```

Expected: FAIL — `migrateV30ToV31` not defined.

- [ ] **Step 3: Implement migration function**

In `packages/essence-spec/src/migrate.ts`, add:

```ts
export function migrateV30ToV31(essence: EssenceV3): EssenceV3 {
  if (essence.version === '3.1.0' || essence.blueprint.sections) {
    return essence;
  }
  const section: EssenceV31Section = {
    id: essence.meta.archetype,
    role: 'primary' as ArchetypeRole,
    shell: essence.blueprint.shell || 'sidebar-main',
    features: [...essence.blueprint.features],
    description: '',
    pages: essence.blueprint.pages || [],
  };
  return {
    ...essence,
    version: '3.1.0',
    blueprint: {
      ...essence.blueprint,
      sections: [section],
      pages: undefined,
      routes: {},
    },
  } as EssenceV3;
}
```

Add the needed imports at the top of migrate.ts.

- [ ] **Step 4: Export from index.ts**

Add `migrateV30ToV31` to the exports in `packages/essence-spec/src/index.ts`.

- [ ] **Step 5: Run tests**

```bash
pnpm --filter @decantr/essence-spec vitest run
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/essence-spec/
git commit -m "feat(essence-spec): add V3.0 to V3.1 migration"
```

---

## Task 3: Update Guard Rules for Sections

**Files:**
- Modify: `packages/essence-spec/src/guard.ts`
- Modify: `packages/essence-spec/test/guard-v3.test.ts`

- [ ] **Step 1: Find all places guards iterate pages**

```bash
grep -n "blueprint.pages\|\.pages\b" packages/essence-spec/src/guard.ts
```

- [ ] **Step 2: Replace direct page iteration with flattenPages**

In `guard.ts`, import `flattenPages` and replace all `essence.blueprint.pages` or `blueprint.pages` references with `flattenPages(essence.blueprint)`. This ensures guards work with both V3.0 (flat pages) and V3.1 (sections).

- [ ] **Step 3: Run guard tests**

```bash
pnpm --filter @decantr/essence-spec vitest run test/guard-v3.test.ts
```

Expected: All existing tests pass (flattenPages produces the same flat list from V3.0 essences).

- [ ] **Step 4: Add a guard test with V3.1 sectioned essence**

Add a test that creates a V3.1 essence with sections and verifies the guard evaluates correctly.

- [ ] **Step 5: Commit**

```bash
git add packages/essence-spec/src/guard.ts packages/essence-spec/test/guard-v3.test.ts
git commit -m "feat(essence-spec): update guard rules to support V3.1 sections via flattenPages"
```

---

## Task 4: composeSections in CLI

Replace `composeArchetypes` with `composeSections` that returns `EssenceV31Section[]`.

**Files:**
- Modify: `packages/cli/src/scaffold.ts`
- Modify: `packages/cli/test/compose.test.ts`

- [ ] **Step 1: Write failing test for composeSections**

In `packages/cli/test/compose.test.ts`, add:

```ts
import type { EssenceV31Section } from '@decantr/essence-spec';

describe('composeSections', () => {
  it('groups archetypes into sections with role, shell, features, description', () => {
    const chatbot = makeArchetype({
      id: 'ai-chatbot',
      role: 'primary',
      description: 'AI chatbot interface.',
      pages: [
        { id: 'chat', shell: 'chat-portal', default_layout: ['messages', 'input'] },
      ],
      features: ['chat', 'markdown'],
    });

    const auth = makeArchetype({
      id: 'auth-full',
      role: 'gateway',
      description: 'Authentication flow.',
      pages: [
        { id: 'login', shell: 'centered', default_layout: ['form'] },
      ],
      features: ['auth', 'mfa'],
    });

    const result = composeSections(
      ['ai-chatbot', { archetype: 'auth-full', prefix: 'auth-full' }],
      new Map([['ai-chatbot', chatbot], ['auth-full', auth]]),
    );

    expect(result.sections).toHaveLength(2);
    expect(result.sections[0].id).toBe('ai-chatbot');
    expect(result.sections[0].role).toBe('primary');
    expect(result.sections[0].shell).toBe('chat-portal');
    expect(result.sections[0].features).toEqual(['chat', 'markdown']);
    expect(result.sections[0].description).toBe('AI chatbot interface.');
    expect(result.sections[0].pages).toHaveLength(1);
    expect(result.sections[0].pages[0].id).toBe('chat');

    expect(result.sections[1].id).toBe('auth-full');
    expect(result.sections[1].role).toBe('gateway');
    expect(result.sections[1].features).toEqual(['auth', 'mfa']);

    expect(result.features).toEqual(['chat', 'markdown', 'auth', 'mfa']);
    expect(result.defaultShell).toBe('chat-portal');
  });

  it('applies features_add and features_remove', () => {
    const chatbot = makeArchetype({
      id: 'ai-chatbot',
      role: 'primary',
      pages: [{ id: 'chat', shell: 'chat-portal', default_layout: ['messages'] }],
      features: ['chat', 'markdown', 'reactions'],
    });

    const overrides = {
      features_add: ['analytics', 'webhooks'],
      features_remove: ['reactions'],
    };

    const result = composeSections(
      ['ai-chatbot'],
      new Map([['ai-chatbot', chatbot]]),
      overrides,
    );

    expect(result.features).toContain('chat');
    expect(result.features).toContain('analytics');
    expect(result.features).toContain('webhooks');
    expect(result.features).not.toContain('reactions');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter decantr vitest run test/compose.test.ts
```

Expected: FAIL — `composeSections` not found.

- [ ] **Step 3: Implement composeSections**

In `packages/cli/src/scaffold.ts`, add `composeSections` alongside the existing `composeArchetypes` (keep the old function for backward compat temporarily):

```ts
export interface ComposeSectionsResult {
  sections: EssenceV31Section[];
  features: string[];
  defaultShell: string;
}

export interface BlueprintOverrides {
  features_add?: string[];
  features_remove?: string[];
  pages_remove?: string[];
  pages?: Record<string, Partial<BlueprintPage>>;
}

export function composeSections(
  composeEntries: ComposeEntry[],
  archetypeResults: Map<string, ArchetypeData | null>,
  overrides?: BlueprintOverrides,
): ComposeSectionsResult {
  if (composeEntries.length === 0) {
    return {
      sections: [{
        id: 'default',
        role: 'primary' as ArchetypeRole,
        shell: 'sidebar-main',
        features: [],
        description: '',
        pages: [{ id: 'home', layout: ['hero'] }],
      }],
      features: [],
      defaultShell: 'sidebar-main',
    };
  }

  const sections: EssenceV31Section[] = [];
  let defaultShell = 'sidebar-main';
  const allFeatures: string[] = [];
  const pagesRemove = new Set(overrides?.pages_remove ?? []);

  for (let i = 0; i < composeEntries.length; i++) {
    const entry = composeEntries[i];
    const archetypeId = typeof entry === 'string' ? entry : entry.archetype;
    const explicitRole = typeof entry === 'object' && 'role' in entry ? (entry as any).role : undefined;
    const data = archetypeResults.get(archetypeId);
    if (!data?.pages) continue;

    const isPrimary = i === 0;

    if (isPrimary) {
      defaultShell = data.pages[0]?.shell || defaultShell;
    }

    const sectionPages: BlueprintPage[] = [];
    for (const page of data.pages) {
      const pageId = page.id;
      if (pagesRemove.has(pageId) || pagesRemove.has(`${archetypeId}-${pageId}`)) continue;

      const pageOverride = overrides?.pages?.[pageId] || overrides?.pages?.[`${archetypeId}-${pageId}`];

      sectionPages.push({
        id: pageId,
        layout: pageOverride?.layout || (page.default_layout?.length ? page.default_layout : ['hero']) as LayoutItem[],
        patterns: page.patterns,
        ...(page.shell !== defaultShell ? { shell_override: page.shell } : {}),
        ...(pageOverride?.shell_override ? { shell_override: pageOverride.shell_override } : {}),
      });
    }

    const sectionFeatures = data.features ? [...data.features] : [];
    allFeatures.push(...sectionFeatures);

    sections.push({
      id: archetypeId,
      role: (explicitRole || data.role || (isPrimary ? 'primary' : 'auxiliary')) as ArchetypeRole,
      shell: data.pages[0]?.shell || defaultShell,
      features: sectionFeatures,
      description: data.description || '',
      pages: sectionPages,
    });
  }

  // Apply feature overrides
  let resolvedFeatures = [...new Set(allFeatures)];
  if (overrides?.features_add) {
    resolvedFeatures.push(...overrides.features_add);
    resolvedFeatures = [...new Set(resolvedFeatures)];
  }
  if (overrides?.features_remove) {
    const removeSet = new Set(overrides.features_remove);
    resolvedFeatures = resolvedFeatures.filter(f => !removeSet.has(f));
  }

  if (sections.length === 0) {
    sections.push({
      id: 'default',
      role: 'primary' as ArchetypeRole,
      shell: defaultShell,
      features: [],
      description: '',
      pages: [{ id: 'home', layout: ['hero'] }],
    });
  }

  return {
    sections,
    features: resolvedFeatures,
    defaultShell,
  };
}
```

Add the needed imports: `EssenceV31Section`, `ArchetypeRole`, `BlueprintPage` from `@decantr/essence-spec`.

- [ ] **Step 4: Run tests**

```bash
pnpm --filter @decantr/essence-spec run build && pnpm --filter decantr vitest run test/compose.test.ts
```

Expected: All tests pass (both new composeSections tests and existing composeArchetypes tests).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/scaffold.ts packages/cli/test/compose.test.ts
git commit -m "feat(cli): add composeSections with feature overrides and section grouping"
```

---

## Task 5: Section Context Generation

The key new capability: generate self-contained context files per section with EVERYTHING inlined.

**Files:**
- Modify: `packages/cli/src/scaffold.ts`
- Create: `packages/cli/test/context-gen.test.ts`

- [ ] **Step 1: Write test for generateSectionContext**

Create `packages/cli/test/context-gen.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { generateSectionContext } from '../src/scaffold.js';
import type { EssenceV31Section } from '@decantr/essence-spec';

describe('generateSectionContext', () => {
  const section: EssenceV31Section = {
    id: 'ai-chatbot',
    role: 'primary',
    shell: 'chat-portal',
    features: ['chat', 'markdown', 'code-highlight'],
    description: 'AI chatbot interface with conversation sidebar.',
    pages: [
      { id: 'chat', route: '/chat', layout: ['header', 'messages', 'input'] },
      { id: 'new', route: '/chat/new', layout: ['empty-thread', 'input'] },
    ],
  };

  const themeTokens = '--d-primary: #7C93B0;\n--d-bg: #18181B;';
  const decorators = [
    { name: 'carbon-bubble-ai', description: 'Left-aligned AI response bubble' },
    { name: 'carbon-code', description: 'Monospace code block' },
  ];
  const guardConfig = { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' };
  const personality = ['professional'];
  const themeName = 'carbon';
  const recipeName = 'carbon';
  const zoneContext = 'App zone. Login success arrives here at /chat. Sign out → /login (Gateway zone).';

  it('produces markdown with section header', () => {
    const result = generateSectionContext({
      section, themeTokens, decorators, guardConfig,
      personality, themeName, recipeName, zoneContext,
      patternSpecs: {},
    });

    expect(result).toContain('# Section: ai-chatbot');
    expect(result).toContain('**Role:** primary');
    expect(result).toContain('**Shell:** chat-portal');
  });

  it('inlines guard rules', () => {
    const result = generateSectionContext({
      section, themeTokens, decorators, guardConfig,
      personality, themeName, recipeName, zoneContext,
      patternSpecs: {},
    });

    expect(result).toContain('## Guard Rules');
    expect(result).toContain('strict');
    expect(result).toContain('Style');
    expect(result).toContain('Recipe');
  });

  it('inlines theme tokens', () => {
    const result = generateSectionContext({
      section, themeTokens, decorators, guardConfig,
      personality, themeName, recipeName, zoneContext,
      patternSpecs: {},
    });

    expect(result).toContain('## Theme: carbon');
    expect(result).toContain('--d-primary: #7C93B0');
  });

  it('inlines decorators', () => {
    const result = generateSectionContext({
      section, themeTokens, decorators, guardConfig,
      personality, themeName, recipeName, zoneContext,
      patternSpecs: {},
    });

    expect(result).toContain('## Decorators');
    expect(result).toContain('carbon-bubble-ai');
    expect(result).toContain('Left-aligned AI response bubble');
  });

  it('inlines zone context', () => {
    const result = generateSectionContext({
      section, themeTokens, decorators, guardConfig,
      personality, themeName, recipeName, zoneContext,
      patternSpecs: {},
    });

    expect(result).toContain('## Zone Context');
    expect(result).toContain('App zone');
    expect(result).toContain('/login');
  });

  it('lists pages with routes and layouts', () => {
    const result = generateSectionContext({
      section, themeTokens, decorators, guardConfig,
      personality, themeName, recipeName, zoneContext,
      patternSpecs: {},
    });

    expect(result).toContain('### chat (/chat)');
    expect(result).toContain('### new (/chat/new)');
    expect(result).toContain('header → messages → input');
  });

  it('inlines pattern specs when provided', () => {
    const result = generateSectionContext({
      section, themeTokens, decorators, guardConfig,
      personality, themeName, recipeName, zoneContext,
      patternSpecs: {
        'chat-header': {
          description: 'Header with model selector',
          components: ['Button', 'Select'],
          slots: { title: 'Conversation title', model: 'Model selector' },
          code: 'function ChatHeader() { /* ... */ }',
        },
      },
    });

    expect(result).toContain('#### Pattern: chat-header');
    expect(result).toContain('Header with model selector');
    expect(result).toContain('Button');
    expect(result).toContain('function ChatHeader');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter decantr vitest run test/context-gen.test.ts
```

Expected: FAIL — `generateSectionContext` not found.

- [ ] **Step 3: Implement generateSectionContext**

In `packages/cli/src/scaffold.ts`, add:

```ts
export interface SectionContextInput {
  section: EssenceV31Section;
  themeTokens: string;
  decorators: Array<{ name: string; description: string }>;
  guardConfig: { mode: string; dna_enforcement: string; blueprint_enforcement: string };
  personality: string[];
  themeName: string;
  recipeName: string;
  zoneContext: string;
  patternSpecs: Record<string, {
    description: string;
    components: string[];
    slots: Record<string, string>;
    code: string;
  }>;
  recipeHints?: {
    preferred?: string[];
    compositions?: string;
    spatialHints?: string;
  };
  constraints?: Record<string, string>;
}

export function generateSectionContext(input: SectionContextInput): string {
  const { section, themeTokens, decorators, guardConfig, personality, themeName, recipeName, zoneContext, patternSpecs, recipeHints, constraints } = input;
  const lines: string[] = [];

  // Header
  lines.push(`# Section: ${section.id}`);
  lines.push('');
  lines.push(`**Role:** ${section.role} | **Shell:** ${section.shell} | **Archetype:** ${section.id}`);
  lines.push(`**Description:** ${section.description}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Guard rules (inlined)
  lines.push('## Guard Rules');
  lines.push('');
  lines.push(`Mode: ${guardConfig.mode} | DNA: ${guardConfig.dna_enforcement} | Blueprint: ${guardConfig.blueprint_enforcement}`);
  lines.push('');
  lines.push('| # | Rule | Severity | What It Checks |');
  lines.push('|---|------|----------|----------------|');
  lines.push(`| 1 | Style | ${guardConfig.dna_enforcement} | Code uses ${themeName} theme |`);
  lines.push(`| 2 | Recipe | ${guardConfig.dna_enforcement} | Decorations use ${recipeName} recipe |`);
  lines.push(`| 3 | Density | ${guardConfig.dna_enforcement} | Spacing follows density profile |`);
  lines.push(`| 4 | Accessibility | ${guardConfig.dna_enforcement} | Code meets WCAG level |`);
  lines.push(`| 5 | Theme-mode | ${guardConfig.dna_enforcement} | Theme/mode combination valid |`);
  lines.push(`| 6 | Structure | ${guardConfig.blueprint_enforcement} | Pages exist in this section |`);
  lines.push(`| 7 | Layout | ${guardConfig.blueprint_enforcement} | Pattern order matches layout |`);
  lines.push(`| 8 | Pattern existence | ${guardConfig.blueprint_enforcement} | Patterns exist in registry |`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Theme tokens (inlined)
  lines.push(`## Theme: ${themeName}`);
  lines.push('');
  lines.push('```css');
  lines.push(themeTokens);
  lines.push('```');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Decorators (inlined)
  lines.push(`## Decorators (${recipeName} recipe)`);
  lines.push('');
  lines.push('| Class | Description |');
  lines.push('|-------|-------------|');
  for (const d of decorators) {
    lines.push(`| \`${d.name}\` | ${d.description} |`);
  }
  lines.push('');
  if (recipeHints) {
    if (recipeHints.preferred?.length) {
      lines.push(`**Preferred patterns:** ${recipeHints.preferred.join(', ')}`);
    }
    if (recipeHints.compositions) {
      lines.push(`**Compositions:** ${recipeHints.compositions}`);
    }
    if (recipeHints.spatialHints) {
      lines.push(`**Spatial hints:** ${recipeHints.spatialHints}`);
    }
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Zone context (inlined)
  lines.push('## Zone Context');
  lines.push('');
  lines.push(zoneContext);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Features
  lines.push('## Features');
  lines.push('');
  lines.push(section.features.join(', '));
  lines.push('');

  // Constraints
  if (constraints && Object.keys(constraints).length > 0) {
    lines.push('---');
    lines.push('');
    lines.push('## Design Constraints');
    lines.push('');
    for (const [key, value] of Object.entries(constraints)) {
      lines.push(`- **${key}:** ${value}`);
    }
    lines.push('');
  }

  // Personality
  if (personality.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push('## Personality');
    lines.push('');
    lines.push(personality.join(', '));
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  // Pages with inlined pattern specs
  lines.push('## Pages');
  lines.push('');
  for (const page of section.pages) {
    const route = page.route || `/${page.id}`;
    lines.push(`### ${page.id} (${route})`);
    lines.push('');
    lines.push(`Layout: ${page.layout.map(l => typeof l === 'string' ? l : JSON.stringify(l)).join(' → ')}`);
    if (page.shell_override) {
      lines.push(`Shell: ${page.shell_override}`);
    }
    lines.push('');

    // Inline pattern specs for patterns used on this page
    for (const layoutItem of page.layout) {
      const patternName = typeof layoutItem === 'string' ? layoutItem : (layoutItem as any).pattern || '';
      const spec = patternSpecs[patternName];
      if (spec) {
        lines.push(`#### Pattern: ${patternName}`);
        lines.push('');
        lines.push(spec.description);
        lines.push('');
        if (spec.components.length > 0) {
          lines.push(`**Components:** ${spec.components.join(', ')}`);
          lines.push('');
        }
        if (Object.keys(spec.slots).length > 0) {
          lines.push('**Layout slots:**');
          for (const [slot, desc] of Object.entries(spec.slots)) {
            lines.push(`- \`${slot}\`: ${desc}`);
          }
          lines.push('');
        }
        if (spec.code) {
          lines.push('**Code example:**');
          lines.push('```');
          lines.push(spec.code);
          lines.push('```');
          lines.push('');
        }
      }
    }
  }

  return lines.join('\n');
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm --filter @decantr/essence-spec run build && pnpm --filter decantr vitest run test/context-gen.test.ts
```

Expected: All 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/scaffold.ts packages/cli/test/context-gen.test.ts
git commit -m "feat(cli): add generateSectionContext with inlined patterns, tokens, guard rules"
```

---

## Task 6: Simplified DECANTR.md Template

Rewrite the template to be a ~200-line methodology primer with no project-specific data.

**Files:**
- Rewrite: `packages/cli/src/templates/DECANTR.md.template`

- [ ] **Step 1: Replace the template**

Replace the entire content of `packages/cli/src/templates/DECANTR.md.template` with:

```
# DECANTR.md

This project uses **Decantr** for design intelligence. Read this file before generating any UI code.

---

## What is Decantr?

Decantr is a design intelligence layer that sits between you (the AI code generator) and the code you produce. It provides structured schemas, guard rules, and a two-layer model (DNA + Blueprint) that ensures consistent, production-quality output.

**Decantr does NOT generate code.** You generate the code. Decantr ensures it remains coherent and consistent.

---

## Two-Layer Model

### DNA (Design Axioms)

DNA defines the foundational design rules. **DNA violations are errors** -- they must never happen without updating the essence first.

DNA axioms include: Theme (style, mode, recipe, shape), Spacing (density, content gap), Typography (scale, weights), Color (palette, accent count), Radius (philosophy, base), Elevation (system, levels), Motion (preference, reduce-motion), Accessibility (WCAG level, focus-visible), and Personality traits.

### Blueprint (Structural Layout)

Blueprint defines sections, pages, routes, features, and pattern layouts. **Blueprint deviations are warnings** -- they should be corrected but do not block generation.

Blueprint includes: Sections (grouped by archetype with role, shell, and scoped features), Page definitions with layouts and pattern references, Routes (URL mapping), and Features (resolved from archetype union + blueprint overrides).

---

## Guard Rules

| # | Rule | Layer | What It Checks |
|---|------|-------|----------------|
| 1 | Style | DNA (error) | Code uses the theme specified in DNA |
| 2 | Recipe | DNA (error) | Decorations match the DNA recipe |
| 3 | Density | DNA (error) | Spacing follows the density profile |
| 4 | Accessibility | DNA (error) | Code meets the WCAG level |
| 5 | Theme-mode | DNA (error) | Theme/mode combination is valid |
| 6 | Structure | Blueprint (warn) | Pages exist in the blueprint sections |
| 7 | Layout | Blueprint (warn) | Pattern order matches the layout spec |
| 8 | Pattern existence | Blueprint (warn) | Patterns referenced exist in the registry |

### Enforcement Tiers

| Tier | When Used | DNA Rules | Blueprint Rules |
|------|-----------|-----------|-----------------|
| **Creative** | New project scaffolding | Off | Off |
| **Guided** | Adding pages or features | Error | Off |
| **Strict** | Modifying existing code | Error | Warn |

This project uses **{{GUARD_MODE}}** mode.

### Violation Response Protocol

```
1. STOP   -- Do not proceed with code that violates DNA rules
2. EXPLAIN -- Tell the user which rule would be violated and why
3. OFFER  -- Suggest using decantr_update_essence to update the spec
4. WAIT   -- Only proceed after the essence is updated
```

**Never make "just this once" exceptions.** If the user insists, update the essence first.

---

## How To Use This Project

### Source of truth

`decantr.essence.json` is the structural spec. Tools and guards read this. You read section context files instead -- they are richer and scoped to your current task.

### Initial scaffolding

Read `.decantr/context/scaffold.md` for the full app overview, topology, and route map.

### Working on a section

Read `.decantr/context/section-{name}.md` for that section's complete context. Each section file contains: guard rules, theme tokens, decorator classes, pattern specs with code examples, zone context, and routes. **Everything you need is in that one file.**

### Validation

Run `decantr check` to validate code against the spec.

### Quick Commands

```bash
decantr status          # Project health
decantr check           # Detect drift violations
decantr get pattern X   # Fetch a pattern spec from registry
decantr get recipe X    # Fetch recipe decorators and effects
decantr search <query>  # Search the registry
decantr refresh         # Regenerate all context files
```

---

## CSS Approach

{{CSS_APPROACH}}
```

Note: `{{GUARD_MODE}}` and `{{CSS_APPROACH}}` are the only template variables. The CSS approach section is retained from the current template (it's methodology, not project data). All other variables are removed.

- [ ] **Step 2: Update generateDecantrMd to use simplified vars**

In `scaffold.ts`, update `generateDecantrMd` to only pass `GUARD_MODE` and `CSS_APPROACH` to the template renderer. Remove all other variable interpolations (PAGES_TABLE, PATTERNS_LIST, THEME_QUICK_REFERENCE, PROJECT_SUMMARY, etc.).

The function signature stays the same for now but most parameters become unused. The function body simplifies to:

```ts
function generateDecantrMd(
  guardMode: string,
  cssApproach: string,
): string {
  const template = loadTemplate('DECANTR.md.template');
  return renderTemplate(template, {
    GUARD_MODE: guardMode,
    CSS_APPROACH: cssApproach,
  });
}
```

Note: The existing `generateDecantrMd` has a complex signature. Keep the old signature temporarily and ignore the extra parameters — or refactor the callers. The key change is the template itself.

- [ ] **Step 3: Commit**

```bash
git add packages/cli/src/templates/DECANTR.md.template packages/cli/src/scaffold.ts
git commit -m "feat(cli): simplify DECANTR.md to ~200-line methodology primer"
```

---

## Task 7: Wire Full Blueprint Data Through cmdInit

The integration task: read full blueprint data, compose sections, generate section context files.

**Files:**
- Modify: `packages/cli/src/index.ts`
- Modify: `packages/cli/src/scaffold.ts` (scaffoldProject function)

- [ ] **Step 1: Update blueprint type cast in cmdInit**

In `packages/cli/src/index.ts`, find the blueprint type cast (around line 538) and expand it to read ALL fields:

```ts
const blueprint = (rawBlueprint.data ?? rawBlueprint) as {
  id: string;
  compose?: ComposeEntry[];
  features?: string[];
  theme?: { style?: string; mode?: string; recipe?: string; shape?: string };
  personality?: string[];
  routes?: Record<string, { shell?: string; archetype?: string; page?: string }>;
  overrides?: {
    features_add?: string[];
    features_remove?: string[];
    pages_remove?: string[];
    pages?: Record<string, any>;
  };
  seo_hints?: { schema_org?: string[]; meta_priorities?: string[] };
  navigation?: { hotkeys?: any[]; command_palette?: boolean };
  design_constraints?: Record<string, string>;
  description?: string;
};
```

- [ ] **Step 2: Read personality from blueprint**

After the theme application block, add:

```ts
if (blueprint.personality?.length) {
  options.personality = blueprint.personality;
}
```

- [ ] **Step 3: Call composeSections instead of composeArchetypes**

Replace the `composeArchetypes` call with `composeSections`, passing overrides:

```ts
const composed = composeSections(entries, archetypeMap, blueprint.overrides);
```

Build `archetypeData` from `composed.sections[0]` (primary section) for backward compat.

- [ ] **Step 4: Build route map from blueprint routes**

After composition, if `blueprint.routes` exists, map them to section/page pairs:

```ts
const routeMap: Record<string, { section: string; page: string }> = {};
if (blueprint.routes) {
  for (const [path, routeEntry] of Object.entries(blueprint.routes)) {
    const section = composed.sections.find(s =>
      s.id === routeEntry.archetype || s.pages.some(p => p.id === routeEntry.page)
    );
    if (section) {
      routeMap[path] = { section: section.id, page: routeEntry.page || '' };
      // Also set page.route
      const page = section.pages.find(p => p.id === routeEntry.page);
      if (page) page.route = path;
    }
  }
}
```

- [ ] **Step 5: Pass everything to scaffoldProject**

Update the `scaffoldProject` call to include: sections, routes, blueprint personality, constraints, seo_hints, navigation, overrides, and the data needed for section context generation (theme tokens, decorators, pattern specs).

The `scaffoldProject` function signature needs updating to accept a `CompositionData` object:

```ts
interface CompositionData {
  sections: EssenceV31Section[];
  features: string[];
  routes: Record<string, RouteEntry>;
  personality: string[];
  constraints?: Record<string, string>;
  seo?: { schema_org?: string[]; meta_priorities?: string[] };
  navigation?: { hotkeys?: any[]; command_palette?: boolean };
  topologyMarkdown: string;
  // For section context generation:
  themeTokensCss: string;
  decorators: Array<{ name: string; description: string }>;
  patternSpecs: Record<string, Record<string, any>>;
  recipeHints?: any;
}
```

- [ ] **Step 6: Update scaffoldProject to generate section context files**

In `scaffoldProject`, after writing the essence and DECANTR.md, generate section context files:

```ts
// Generate section context files
const contextDir = join(projectRoot, '.decantr', 'context');
mkdirSync(contextDir, { recursive: true });

for (const section of compositionData.sections) {
  const zoneContext = generateZoneContextForSection(section, compositionData.sections, compositionData.topologyMarkdown);
  const sectionPatterns = collectPatternsForSection(section, compositionData.patternSpecs);

  const contextContent = generateSectionContext({
    section,
    themeTokens: compositionData.themeTokensCss,
    decorators: compositionData.decorators,
    guardConfig: { mode: options.guard, dna_enforcement: 'error', blueprint_enforcement: 'warn' },
    personality: compositionData.personality,
    themeName: options.theme,
    recipeName: options.recipe || options.theme,
    zoneContext,
    patternSpecs: sectionPatterns,
    recipeHints: compositionData.recipeHints,
    constraints: compositionData.constraints,
  });

  writeFileSync(join(contextDir, `section-${section.id}.md`), contextContent);
}
```

- [ ] **Step 7: Fetch patterns for inlining**

In `cmdInit` (index.ts), after composing sections, fetch pattern specs for each section's pages:

```ts
// Fetch pattern specs for section context inlining
const patternSpecs: Record<string, Record<string, any>> = {};
const allPatternIds = new Set<string>();
for (const section of composed.sections) {
  for (const page of section.pages) {
    if (page.patterns) {
      for (const ref of page.patterns) {
        allPatternIds.add(ref.pattern);
      }
    }
    // Also check layout items for pattern names
    for (const item of page.layout) {
      if (typeof item === 'string') allPatternIds.add(item);
    }
  }
}

const patternFetches = [...allPatternIds].map(async (id) => {
  const result = await registryClient.fetchPattern(id);
  if (result) {
    const raw = result.data as Record<string, unknown>;
    const inner = (raw.data ?? raw) as Record<string, any>;
    patternSpecs[id] = {
      description: inner.description || '',
      components: inner.components || [],
      slots: inner.presets?.[inner.default_preset]?.layout?.slots || {},
      code: inner.presets?.[inner.default_preset]?.code?.example || '',
    };
  }
});
await Promise.all(patternFetches);
```

- [ ] **Step 8: Build and test**

```bash
pnpm build
pnpm test
```

Expected: All tests pass.

- [ ] **Step 9: Test with carbon-ai-portal**

```bash
cd /tmp && rm -rf pipeline-test && mkdir pipeline-test && cd pipeline-test
node /path/to/packages/cli/dist/bin.js sync
node /path/to/packages/cli/dist/bin.js init --blueprint=carbon-ai-portal --existing --yes
ls .decantr/context/section-*.md
cat .decantr/context/section-ai-chatbot.md | head -50
```

Expected: Section context files exist for each composed archetype. Each contains inlined guard rules, theme tokens, decorators, and pattern specs.

- [ ] **Step 10: Commit**

```bash
git add packages/cli/src/index.ts packages/cli/src/scaffold.ts
git commit -m "feat(cli): wire full blueprint data + section context generation through init pipeline"
```

---

## Task 8: Blueprint Feature Audit (decantr-content)

Audit all 17 blueprints' feature lists against their composed archetype features.

**Files:**
- Modify: `decantr-content/blueprints/*.json` (17 files)
- Modify: `decantr-content/validate.js`

- [ ] **Step 1: Write an audit script**

Create a temporary script that loads each blueprint, resolves its archetypes, computes the expected feature union, and compares to the declared features:

```bash
cd /Users/davidaimi/projects/decantr-content
node -e "
const fs = require('fs');
const blueprints = fs.readdirSync('blueprints').filter(f => f.endsWith('.json'));
for (const file of blueprints) {
  const bp = JSON.parse(fs.readFileSync('blueprints/' + file));
  const compose = bp.compose || [];
  const archFeatures = new Set();
  for (const entry of compose) {
    const id = typeof entry === 'string' ? entry : entry.archetype || entry;
    try {
      const arch = JSON.parse(fs.readFileSync('archetypes/' + id + '.json'));
      (arch.features || []).forEach(f => archFeatures.add(f));
    } catch {}
  }
  const bpFeatures = new Set(bp.features || []);
  const missing = [...archFeatures].filter(f => !bpFeatures.has(f));
  const extra = [...bpFeatures].filter(f => !archFeatures.has(f));
  if (missing.length || extra.length) {
    console.log(file + ':');
    if (missing.length) console.log('  MISSING from archetype union:', missing.join(', '));
    if (extra.length) console.log('  EXTRA (blueprint-only):', extra.join(', '));
  }
}
"
```

- [ ] **Step 2: Fix each blueprint's features**

For each blueprint that has missing features: either add them to the `features` array OR add them to `overrides.features_add`. For extra features (blueprint-only additions like `theme-toggle`), ensure they're in `overrides.features_add` rather than the base `features` list.

The recommended approach: set the blueprint's `features` to match the archetype union exactly, and use `overrides.features_add` for any extras, `overrides.features_remove` for any exclusions.

- [ ] **Step 3: Update validate.js**

Add feature validation for blueprints:

```js
if (type === 'blueprints' && content.compose && Array.isArray(content.compose)) {
  // Validate routes reference valid archetypes
  if (content.routes) {
    for (const [path, route] of Object.entries(content.routes)) {
      if (route.archetype) {
        const archId = route.archetype;
        const composeIds = content.compose.map(e => typeof e === 'string' ? e : e.archetype);
        if (!composeIds.includes(archId)) {
          console.error(`  FAIL ${type}/${file}: route "${path}" references archetype "${archId}" not in compose`);
          errors++;
        }
      }
    }
  }
}
```

- [ ] **Step 4: Run validation**

```bash
node validate.js
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add blueprints/ validate.js
git commit -m "feat: audit and fix blueprint feature lists, add route validation"
```

- [ ] **Step 6: Push**

```bash
git push origin main
```

Triggers GitHub Action to sync updated blueprints to registry.

---

## Task 9: End-to-End Validation

**Files:** No new files — validation only.

- [ ] **Step 1: Build all packages**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
pnpm build
```

- [ ] **Step 2: Run all tests**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 3: Re-init showcase with new pipeline**

```bash
cd apps/showcase/carbon-ai-portal
rm -f decantr.essence.json DECANTR.md
rm -rf .decantr/context .decantr/project.json
node ../../../packages/cli/dist/bin.js sync
node ../../../packages/cli/dist/bin.js init --blueprint=carbon-ai-portal --existing --yes
```

- [ ] **Step 4: Verify DECANTR.md is ~200 lines**

```bash
wc -l DECANTR.md
```

Expected: ~150-200 lines (methodology only, no pages table or pattern lists).

- [ ] **Step 5: Verify section context files exist**

```bash
ls -la .decantr/context/section-*.md
```

Expected: 7 files (one per composed archetype: ai-chatbot, auth-full, settings-full, marketing-saas, about-hybrid, contact, legal).

- [ ] **Step 6: Verify section context is self-contained**

```bash
cat .decantr/context/section-ai-chatbot.md
```

Verify it contains:
- Guard rules (inlined, not "see DECANTR.md")
- Theme tokens (inlined, not "see tokens.css")
- Decorator classes (inlined, not "see decorators.css")
- Zone context (topology, scoped to this section)
- Pages with routes
- Pattern specs with code examples (inlined, not "fetch from registry")

- [ ] **Step 7: Verify essence has sections and routes**

```bash
python3 -c "
import json
e = json.load(open('decantr.essence.json'))
print('Version:', e['version'])
print('Sections:', len(e['blueprint'].get('sections', [])))
for s in e['blueprint'].get('sections', []):
    print(f'  {s[\"id\"]}: role={s[\"role\"]}, pages={len(s[\"pages\"])}, features={len(s[\"features\"])}')
routes = e['blueprint'].get('routes', {})
print(f'Routes: {len(routes)}')
print('Personality:', e['dna'].get('personality', []))
"
```

Expected: 7 sections with roles, routes populated, personality from blueprint.

- [ ] **Step 8: Commit updated showcase**

```bash
git add decantr.essence.json DECANTR.md .decantr/ src/styles/
git commit -m "feat(showcase): re-init with section-based composition pipeline"
```
