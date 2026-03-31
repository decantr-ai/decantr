# Accessibility & SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add accessibility (WCAG) and SEO context to Decantr's essence schema, theme structure, guard system, and DECANTR.md generation.

**Architecture:** Schema-first approach. Add types to essence-spec, extend theme/archetype types in registry, add guard rule for accessibility, update CLI scaffold to generate accessibility/SEO sections in DECANTR.md. All changes are additive and optional for backward compatibility.

**Tech Stack:** TypeScript, JSON Schema, Vitest for testing

---

## File Structure

### essence-spec package
- `packages/essence-spec/src/types.ts` — Add `Accessibility`, `WcagLevel`, `CvdPreference` types; extend `Essence` and `SectionedEssence`
- `packages/essence-spec/schema/essence.v2.json` — Add accessibility schema definitions
- `packages/essence-spec/src/guard.ts` — Add accessibility guard rule
- `packages/essence-spec/test/guard.test.ts` — Tests for accessibility guard

### registry package
- `packages/registry/src/types.ts` — Add `cvd_support`, `tokens` to theme; add `seo_hints` to archetype

### cli package
- `packages/cli/src/scaffold.ts` — Update `EssenceFile` interface, `generateDecantrMd()`, `buildEssence()`
- `packages/cli/src/templates/DECANTR.md.template` — Add accessibility and SEO sections

### content
- `content/themes/luminarum.json` — Add CVD support as reference implementation
- `content/archetypes/saas-dashboard.json` — Add SEO hints as reference implementation

---

## Task 1: Add Accessibility Types to essence-spec

**Files:**
- Modify: `packages/essence-spec/src/types.ts`

- [ ] **Step 1: Add WcagLevel and CvdPreference types**

Open `packages/essence-spec/src/types.ts` and add after the `GeneratorTarget` type (around line 111):

```typescript
// --- Accessibility ---

export type WcagLevel = 'none' | 'A' | 'AA' | 'AAA';

export type CvdPreference =
  | 'none'
  | 'auto'
  | 'deuteranopia'
  | 'protanopia'
  | 'tritanopia'
  | 'achromatopsia';

export interface Accessibility {
  wcag_level?: WcagLevel;
  cvd_preference?: CvdPreference;
}
```

- [ ] **Step 2: Add accessibility field to Essence interface**

In the same file, add `accessibility?: Accessibility;` to the `Essence` interface after `target`:

```typescript
export interface Essence {
  $schema?: string;
  version: string;
  archetype: string;
  theme: Theme;
  personality: string[];
  platform: Platform;
  structure: StructurePage[];
  features: string[];
  density: Density;
  guard: Guard;
  target: GeneratorTarget;
  accessibility?: Accessibility;
  _impression?: Impression;
}
```

- [ ] **Step 3: Add accessibility field to SectionedEssence interface**

Add the same field to `SectionedEssence`:

```typescript
export interface SectionedEssence {
  $schema?: string;
  version: string;
  platform: Platform;
  personality: string[];
  sections: EssenceSection[];
  shared_features?: string[];
  density: Density;
  guard: Guard;
  target: GeneratorTarget;
  accessibility?: Accessibility;
  _impression?: Impression;
}
```

- [ ] **Step 4: Export new types in index.ts**

Open `packages/essence-spec/src/index.ts` and ensure the new types are exported. Add to the export list:

```typescript
export type {
  // ... existing exports ...
  Accessibility,
  WcagLevel,
  CvdPreference,
} from './types.js';
```

- [ ] **Step 5: Run type check**

Run: `cd packages/essence-spec && pnpm lint`

Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add packages/essence-spec/src/types.ts packages/essence-spec/src/index.ts
git commit -m "feat(essence-spec): add Accessibility type with wcag_level and cvd_preference"
```

---

## Task 2: Update JSON Schema

**Files:**
- Modify: `packages/essence-spec/schema/essence.v2.json`

- [ ] **Step 1: Add Accessibility definition to $defs**

Open `packages/essence-spec/schema/essence.v2.json` and add the Accessibility definition after the `Impression` definition (around line 134):

```json
"Accessibility": {
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "wcag_level": {
      "type": "string",
      "enum": ["none", "A", "AA", "AAA"],
      "description": "WCAG compliance level requirement"
    },
    "cvd_preference": {
      "type": "string",
      "enum": ["none", "auto", "deuteranopia", "protanopia", "tritanopia", "achromatopsia"],
      "description": "Color vision deficiency accommodation preference"
    }
  }
},
```

- [ ] **Step 2: Add accessibility to SimpleEssence properties**

In the `SimpleEssence` definition, add `accessibility` to properties (after `target`):

```json
"accessibility": { "$ref": "#/$defs/Accessibility" }
```

- [ ] **Step 3: Add accessibility to SectionedEssence properties**

In the `SectionedEssence` definition, add the same property (after `target`):

```json
"accessibility": { "$ref": "#/$defs/Accessibility" }
```

- [ ] **Step 4: Validate schema syntax**

Run: `cd packages/essence-spec && node -e "JSON.parse(require('fs').readFileSync('schema/essence.v2.json'))"`

Expected: No output (valid JSON)

- [ ] **Step 5: Commit**

```bash
git add packages/essence-spec/schema/essence.v2.json
git commit -m "feat(essence-spec): add accessibility to JSON schema"
```

---

## Task 3: Add Theme CVD Support Types to Registry

**Files:**
- Modify: `packages/registry/src/types.ts`

- [ ] **Step 1: Add Theme interface**

Open `packages/registry/src/types.ts` and add after the `ResolvedContent` interface (at end of file):

```typescript
// --- Theme ---

export type CvdMode = 'deuteranopia' | 'protanopia' | 'tritanopia' | 'achromatopsia';

export interface ThemeTokens {
  base?: Record<string, string>;
  cvd?: Partial<Record<CvdMode, Record<string, string>>>;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  personality?: string;
  seed?: Record<string, string>;
  modes?: string[];
  shapes?: string[];
  cvd_support?: CvdMode[];
  tokens?: ThemeTokens;
  decantr_compat?: string;
  source?: string;
}
```

- [ ] **Step 2: Add SEO hints to Archetype interface**

In the same file, update the `Archetype` interface to include `seo_hints`:

```typescript
export interface SeoHints {
  schema_org?: string[];
  meta_priorities?: string[];
}

export interface Archetype {
  id: string;
  version: string;
  name: string;
  description: string;
  tags: string[];
  pages: ArchetypePage[];
  features: string[];
  dependencies: { patterns: Record<string, string>; recipes: Record<string, string> };
  seo_hints?: SeoHints;
}
```

- [ ] **Step 3: Run type check**

Run: `cd packages/registry && pnpm lint`

Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add packages/registry/src/types.ts
git commit -m "feat(registry): add Theme CVD support and Archetype SEO hints types"
```

---

## Task 4: Add Accessibility Guard Rule

**Files:**
- Modify: `packages/essence-spec/src/guard.ts`
- Test: `packages/essence-spec/test/guard.test.ts`

- [ ] **Step 1: Write failing test for accessibility guard**

Open `packages/essence-spec/test/guard.test.ts` and add a new describe block:

```typescript
describe('accessibility guard', () => {
  it('should return no violations when wcag_level is none', () => {
    const essence: Essence = {
      ...baseEssence,
      accessibility: { wcag_level: 'none' },
    };
    const violations = evaluateGuard(essence, {});
    const a11yViolations = violations.filter(v => v.rule === 'accessibility');
    expect(a11yViolations).toHaveLength(0);
  });

  it('should return no violations when accessibility is not set', () => {
    const essence: Essence = { ...baseEssence };
    const violations = evaluateGuard(essence, {});
    const a11yViolations = violations.filter(v => v.rule === 'accessibility');
    expect(a11yViolations).toHaveLength(0);
  });

  it('should return violation when wcag_level is set and context has a11y_issues', () => {
    const essence: Essence = {
      ...baseEssence,
      accessibility: { wcag_level: 'AA' },
    };
    const violations = evaluateGuard(essence, {
      a11y_issues: ['missing-alt-text', 'skipped-heading-level'],
    });
    const a11yViolations = violations.filter(v => v.rule === 'accessibility');
    expect(a11yViolations).toHaveLength(1);
    expect(a11yViolations[0].message).toContain('WCAG AA');
  });
});
```

You'll need to add `accessibility` to the `baseEssence` fixture if it doesn't exist, or create a minimal one for these tests.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/essence-spec && pnpm test -- --run guard.test.ts`

Expected: FAIL — `a11y_issues` not handled yet

- [ ] **Step 3: Update GuardViolation rule type**

Open `packages/essence-spec/src/guard.ts` and update the `GuardViolation` interface:

```typescript
export interface GuardViolation {
  rule: 'style' | 'structure' | 'layout' | 'recipe' | 'density' | 'theme-mode' | 'pattern-exists' | 'accessibility';
  severity: 'error' | 'warning';
  message: string;
  suggestion?: string;
}
```

- [ ] **Step 4: Update GuardContext interface**

Add `a11y_issues` to the context:

```typescript
export interface GuardContext {
  pageId?: string;
  style?: string;
  recipe?: string;
  layout?: string[];
  density_gap?: string;
  themeRegistry?: Map<string, { modes: string[] }>;
  patternRegistry?: Map<string, unknown>;
  a11y_issues?: string[];
}
```

- [ ] **Step 5: Add checkAccessibility function**

Add after the `checkPatternExistence` function:

```typescript
/**
 * Check accessibility compliance based on declared WCAG level.
 */
function checkAccessibility(
  essence: EssenceFile,
  context: GuardContext
): GuardViolation | null {
  // Get accessibility settings
  const accessibility = 'accessibility' in essence ? essence.accessibility : undefined;

  if (!accessibility?.wcag_level || accessibility.wcag_level === 'none') {
    return null;
  }

  // If context reports a11y issues, report violation
  if (context.a11y_issues && context.a11y_issues.length > 0) {
    const issueList = context.a11y_issues.slice(0, 3).join(', ');
    const moreCount = context.a11y_issues.length > 3 ? ` (+${context.a11y_issues.length - 3} more)` : '';

    return {
      rule: 'accessibility',
      severity: 'error',
      message: `WCAG ${accessibility.wcag_level} compliance required. Issues found: ${issueList}${moreCount}`,
      suggestion: 'Fix accessibility issues before proceeding. Run an accessibility audit for details.',
    };
  }

  return null;
}
```

- [ ] **Step 6: Call checkAccessibility in evaluateGuard**

In the `evaluateGuard` function, add after the pattern existence check:

```typescript
// Rule 8: Accessibility (when wcag_level is set, guided and strict modes)
const accessibilityViolation = checkAccessibility(essence, context);
if (accessibilityViolation) {
  violations.push(accessibilityViolation);
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `cd packages/essence-spec && pnpm test -- --run guard.test.ts`

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add packages/essence-spec/src/guard.ts packages/essence-spec/test/guard.test.ts
git commit -m "feat(essence-spec): add accessibility guard rule"
```

---

## Task 5: Update CLI EssenceFile Interface

**Files:**
- Modify: `packages/cli/src/scaffold.ts`

- [ ] **Step 1: Add accessibility to EssenceFile interface**

Open `packages/cli/src/scaffold.ts` and update the `EssenceFile` interface (around line 17):

```typescript
export interface EssenceFile {
  version: string;
  archetype: string;
  blueprint?: string;
  theme: {
    style: string;
    mode: string;
    recipe: string;
    shape: string;
  };
  personality: string[];
  platform: {
    type: string;
    routing: string;
  };
  structure: Array<{
    id: string;
    shell: string;
    layout: LayoutItem[];
  }>;
  features: string[];
  guard: {
    enforce_style: boolean;
    enforce_recipe: boolean;
    mode: string;
  };
  density: {
    level: string;
    content_gap: string;
  };
  target: string;
  accessibility?: {
    wcag_level?: string;
    cvd_preference?: string;
  };
}
```

- [ ] **Step 2: Add ThemeData CVD fields**

Update the `ThemeData` interface:

```typescript
export interface ThemeData {
  seed?: Record<string, string>;
  palette?: Record<string, string>;
  cvd_support?: string[];
  tokens?: {
    base?: Record<string, string>;
    cvd?: Record<string, Record<string, string>>;
  };
}
```

- [ ] **Step 3: Add ArchetypeData SEO hints**

Update the `ArchetypeData` interface:

```typescript
export interface ArchetypeData {
  id: string;
  name?: string;
  pages?: Array<{
    id: string;
    shell: string;
    default_layout: LayoutItem[];
  }>;
  features?: string[];
  seo_hints?: {
    schema_org?: string[];
    meta_priorities?: string[];
  };
}
```

- [ ] **Step 4: Run type check**

Run: `cd packages/cli && pnpm lint`

Expected: No type errors

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/scaffold.ts
git commit -m "feat(cli): add accessibility and SEO types to scaffold interfaces"
```

---

## Task 6: Update buildEssence to Include Accessibility

**Files:**
- Modify: `packages/cli/src/scaffold.ts`

- [ ] **Step 1: Update InitOptions type import or add accessibility**

If `InitOptions` is defined in `prompts.ts`, you may need to update it there. For now, assume we pass accessibility through options. Update `buildEssence` to accept and include accessibility:

Find the `buildEssence` function and update the return object (around line 199-226):

```typescript
export function buildEssence(options: InitOptions, archetypeData?: ArchetypeData): EssenceFile {
  // ... existing code ...

  const essence: EssenceFile = {
    version: '2.0.0',
    archetype,
    theme: {
      style: options.theme,
      mode: options.mode,
      recipe: options.theme,
      shape: options.shape,
    },
    personality: options.personality,
    platform: {
      type: 'spa',
      routing: 'hash',
    },
    structure,
    features,
    guard: {
      enforce_style: true,
      enforce_recipe: true,
      mode: options.guard,
    },
    density: {
      level: options.density,
      content_gap: contentGapMap[options.density] || '_gap4',
    },
    target: options.target,
  };

  // Add accessibility if specified in options
  if (options.accessibility) {
    essence.accessibility = options.accessibility;
  }

  return essence;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/cli/src/scaffold.ts
git commit -m "feat(cli): include accessibility in buildEssence output"
```

---

## Task 7: Update DECANTR.md Template with Accessibility Section

**Files:**
- Modify: `packages/cli/src/templates/DECANTR.md.template`

- [ ] **Step 1: Add accessibility section placeholder**

Open `packages/cli/src/templates/DECANTR.md.template` and add after the "This Project" section (after the Essence Overview, around line 103):

```markdown
{{ACCESSIBILITY_SECTION}}
```

- [ ] **Step 2: Add SEO section placeholder**

Add after the accessibility placeholder:

```markdown
{{SEO_SECTION}}
```

- [ ] **Step 3: Commit**

```bash
git add packages/cli/src/templates/DECANTR.md.template
git commit -m "feat(cli): add accessibility and SEO placeholders to DECANTR.md template"
```

---

## Task 8: Generate Accessibility Section in scaffold.ts

**Files:**
- Modify: `packages/cli/src/scaffold.ts`

- [ ] **Step 1: Add generateAccessibilitySection function**

Add this function before `generateDecantrMd`:

```typescript
/**
 * Generate the accessibility section for DECANTR.md.
 */
function generateAccessibilitySection(
  essence: EssenceFile,
  themeData?: ThemeData
): string {
  const accessibility = essence.accessibility;

  // If no accessibility or wcag_level is 'none', return empty
  if (!accessibility?.wcag_level || accessibility.wcag_level === 'none') {
    return '';
  }

  const wcagLevel = accessibility.wcag_level;
  const cvdPreference = accessibility.cvd_preference || 'none';
  const cvdSupport = themeData?.cvd_support || [];

  let section = `---

## Accessibility

**WCAG Level:** ${wcagLevel}
`;

  if (cvdSupport.length > 0) {
    section += `**CVD Support:** Theme supports ${cvdSupport.join(', ')}
**CVD Preference:** ${cvdPreference}
`;
  }

  section += `
### What This Means

This project requires WCAG 2.1 Level ${wcagLevel} compliance. You already know these rules — apply them:

- Semantic HTML structure
- Sufficient color contrast (4.5:1 for normal text, 3:1 for large text)
- Keyboard navigability for all interactive elements
- Visible focus indicators
- Meaningful alt text for images
- Proper heading hierarchy
`;

  if (cvdSupport.length > 0) {
    section += `
### CVD Implementation

The theme provides these data attributes:

\`\`\`html
<html data-theme="${essence.theme.style}" data-mode="${essence.theme.mode}" data-cvd="none">
\`\`\`

Valid \`data-cvd\` values for this theme: \`none\`, ${cvdSupport.map(m => `\`${m}\``).join(', ')}
`;

    if (cvdPreference === 'auto') {
      section += `
Detect user preference via \`prefers-contrast\` or user settings and apply accordingly.
`;
    }
  }

  section += `
---
`;

  return section;
}
```

- [ ] **Step 2: Add generateSeoSection function**

Add after the accessibility function:

```typescript
/**
 * Generate the SEO guidance section for DECANTR.md.
 */
function generateSeoSection(
  essence: EssenceFile,
  archetypeData?: ArchetypeData
): string {
  const seoHints = archetypeData?.seo_hints;

  if (!seoHints) {
    return '';
  }

  const schemaOrg = seoHints.schema_org || [];
  const metaPriorities = seoHints.meta_priorities || [];

  if (schemaOrg.length === 0 && metaPriorities.length === 0) {
    return '';
  }

  let section = `---

## SEO Guidance

This archetype (\`${essence.archetype}\`) typically benefits from:

`;

  if (schemaOrg.length > 0) {
    section += `- **Schema.org:** ${schemaOrg.join(', ')}
`;
  }

  if (metaPriorities.length > 0) {
    section += `- **Meta priorities:** ${metaPriorities.join(', ')}
`;
  }

  section += `
These are suggestions, not requirements. Apply where appropriate for the page content.

---
`;

  return section;
}
```

- [ ] **Step 3: Update generateDecantrMd to use new functions**

Update the `generateDecantrMd` function signature and add the new sections:

```typescript
function generateDecantrMd(
  essence: EssenceFile,
  detected: DetectedProject,
  themeData?: ThemeData,
  recipeData?: RecipeData,
  archetypeData?: ArchetypeData
): string {
  const template = loadTemplate('DECANTR.md.template');

  // ... existing code for pagesTable, patternsList, etc. ...

  // Generate accessibility and SEO sections
  const accessibilitySection = generateAccessibilitySection(essence, themeData);
  const seoSection = generateSeoSection(essence, archetypeData);

  const vars: Record<string, string> = {
    // ... existing vars ...
    ACCESSIBILITY_SECTION: accessibilitySection,
    SEO_SECTION: seoSection,
  };

  return renderTemplate(template, vars);
}
```

- [ ] **Step 4: Update scaffoldProject to pass archetypeData to generateDecantrMd**

In the `scaffoldProject` function, update the call to `generateDecantrMd`:

```typescript
writeFileSync(decantrMdPath, generateDecantrMd(essence, detected, themeData, recipeData, archetypeData));
```

- [ ] **Step 5: Run CLI build**

Run: `cd packages/cli && pnpm build`

Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/scaffold.ts
git commit -m "feat(cli): generate accessibility and SEO sections in DECANTR.md"
```

---

## Task 9: Add CVD Support to Luminarum Theme

**Files:**
- Modify: `content/themes/luminarum.json`

- [ ] **Step 1: Read current luminarum theme**

First check if luminarum.json exists:

```bash
cat content/themes/luminarum.json
```

- [ ] **Step 2: Add CVD support fields**

Update the theme file to include CVD support:

```json
{
  "$schema": "https://decantr.ai/schemas/style-metadata.v1.json",
  "id": "luminarum",
  "name": "Luminarum",
  "description": "Ethereal glow with neon accents...",
  "tags": ["dark", "neon", "ethereal"],
  "personality": "...",
  "seed": {
    "primary": "#FE4474",
    "secondary": "#0AF3EB",
    "accent": "#FDA303",
    "background": "#0D0D1A"
  },
  "modes": ["dark"],
  "shapes": ["sharp", "rounded", "pill"],
  "cvd_support": ["deuteranopia", "protanopia"],
  "tokens": {
    "base": {
      "danger": "#EF4444",
      "success": "#22C55E",
      "warning": "#F59E0B"
    },
    "cvd": {
      "deuteranopia": {
        "danger": "#FF8F00",
        "success": "#2196F3"
      },
      "protanopia": {
        "danger": "#FFC107",
        "success": "#03A9F4"
      }
    }
  },
  "decantr_compat": ">=0.9.0",
  "source": "community"
}
```

- [ ] **Step 3: Commit**

```bash
git add content/themes/luminarum.json
git commit -m "feat(content): add CVD support to luminarum theme"
```

---

## Task 10: Add SEO Hints to SaaS Dashboard Archetype

**Files:**
- Modify: `content/archetypes/saas-dashboard.json`

- [ ] **Step 1: Read current archetype**

```bash
cat content/archetypes/saas-dashboard.json
```

- [ ] **Step 2: Add seo_hints field**

Add the `seo_hints` field to the archetype:

```json
{
  "id": "saas-dashboard",
  "version": "1.0.0",
  "name": "SaaS Dashboard",
  "description": "...",
  "tags": ["..."],
  "pages": [...],
  "features": [...],
  "dependencies": {...},
  "seo_hints": {
    "schema_org": ["Organization", "WebApplication"],
    "meta_priorities": ["description", "og:image", "twitter:card"]
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add content/archetypes/saas-dashboard.json
git commit -m "feat(content): add SEO hints to saas-dashboard archetype"
```

---

## Task 11: Build and Test All Packages

**Files:**
- All packages

- [ ] **Step 1: Build all packages**

Run: `pnpm build`

Expected: All packages build successfully

- [ ] **Step 2: Run all tests**

Run: `pnpm test`

Expected: All tests pass

- [ ] **Step 3: Test CLI init with accessibility**

Run: `cd /tmp && mkdir test-a11y && cd test-a11y && npm init -y && npx decantr init`

Expected: CLI runs without errors. Check generated `DECANTR.md` for structure.

- [ ] **Step 4: Commit any fixes**

If any issues are found, fix and commit.

---

## Task 12: Update CLAUDE.md Guard Rules Section

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update guard rules table**

Open `CLAUDE.md` and update the Guard Rules section to include Rule 6:

```markdown
## Guard Rules

The guard system (`packages/essence-spec/src/guard.ts`) enforces six rules:

1. **Style guard** -- Code must use the theme specified in the Essence.
2. **Structure guard** -- Pages referenced in code must exist in the Essence structure.
3. **Layout guard** -- Pattern order in a page must match the Essence layout spec (strict mode only).
4. **Recipe guard** -- Visual recipe used in code must match the Essence recipe.
5. **Density guard** -- Content gap values must match the Essence density setting (strict mode only).
6. **Accessibility guard** -- Code must meet the WCAG level specified in the Essence (guided and strict modes).

Guard modes: `creative` (no enforcement), `guided` (rules 1, 2, 4, 6), `strict` (all rules).
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with accessibility guard rule"
```

---

## Task 13: Final Integration Test

- [ ] **Step 1: Create a test essence with accessibility**

Create a test file `/tmp/test-essence.json`:

```json
{
  "version": "2.0.0",
  "archetype": "saas-dashboard",
  "theme": { "style": "luminarum", "mode": "dark", "recipe": "luminarum", "shape": "rounded" },
  "personality": ["professional"],
  "platform": { "type": "spa", "routing": "hash" },
  "structure": [{ "id": "home", "shell": "sidebar-main", "layout": ["hero"] }],
  "features": [],
  "density": { "level": "comfortable", "content_gap": "_gap4" },
  "guard": { "enforce_style": true, "enforce_recipe": true, "mode": "strict" },
  "target": "react",
  "accessibility": { "wcag_level": "AA", "cvd_preference": "auto" }
}
```

- [ ] **Step 2: Validate the essence**

Run: `cd packages/essence-spec && pnpm test -- --run validate.test.ts`

Expected: Tests pass (schema accepts accessibility field)

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete accessibility and SEO implementation"
```

---

## Summary

| Task | Package | Description |
|------|---------|-------------|
| 1 | essence-spec | Add Accessibility types |
| 2 | essence-spec | Update JSON schema |
| 3 | registry | Add Theme CVD and Archetype SEO types |
| 4 | essence-spec | Add accessibility guard rule |
| 5-6 | cli | Update scaffold interfaces and buildEssence |
| 7-8 | cli | Add DECANTR.md accessibility/SEO sections |
| 9 | content | Add CVD support to luminarum theme |
| 10 | content | Add SEO hints to saas-dashboard archetype |
| 11 | all | Build and test |
| 12 | root | Update CLAUDE.md |
| 13 | all | Final integration test |

Total estimated time: 45-60 minutes for implementation
