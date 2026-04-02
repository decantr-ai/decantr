# Decantr v2 Architecture Spec: Design Intelligence Overhaul

**Date:** 2026-04-02
**Status:** Draft
**Scope:** All packages, all content, all documentation, all skills

---

## Executive Summary

Full-system audit revealed that Decantr generates structurally correct scaffolds but systematically loses visual quality signals at every pipeline layer. This spec addresses 5 critical bugs, 15 data-flow gaps, content quality deficits affecting ~70% of registry items, and introduces new architectural capabilities (composition algebra, motion language, responsive strategy, voice intelligence, visual briefs, design critique loop) that transform Decantr from a template scaffolder into a true design intelligence layer optimized for LLM consumption.

---

## Table of Contents

1. [Phase 0: Critical Bug Fixes](#phase-0-critical-bug-fixes)
2. [Phase 1: Wire Existing Data — Context Enrichment](#phase-1-wire-existing-data)
3. [Phase 2: Content Schema Evolution](#phase-2-content-schema-evolution)
4. [Phase 3: Content Quality Gates](#phase-3-content-quality-gates)
5. [Phase 4: MCP & API Data Integrity](#phase-4-mcp--api-data-integrity)
6. [Phase 5: Nuclear Layer — New Capabilities](#phase-5-nuclear-layer)
7. [Phase 5.5: `decantr magic` Overhaul](#phase-55-decantr-magic-overhaul)
8. [Phase 6: Content Enrichment Campaign](#phase-6-content-enrichment-campaign)
9. [Phase 7: Documentation & Skills Update](#phase-7-documentation--skills-update)
10. [Package Impact Matrix](#package-impact-matrix)
11. [Implementation Checklist](#implementation-checklist)

---

## Phase 0: Critical Bug Fixes

### 0.1 V3.1 Validation Detection

**Package:** `@decantr/essence-spec`
**File:** `packages/essence-spec/src/validate.ts:35`
**Bug:** `detectVersion()` only checks `version === '3.0.0'`. V3.1 essences are misdetected as v2 and fail validation.

**Fix:**
```typescript
function detectVersion(data: unknown): 'v2' | 'v3' {
  if (typeof data === 'object' && data !== null && 'version' in data) {
    const v = (data as Record<string, unknown>).version;
    if (v === '3.0.0' || v === '3.1.0') return 'v3';
  }
  return 'v2';
}
```

**Tests:** Add test case validating a v3.1.0 essence file.

### 0.2 Density Reads Wrong Object

**Package:** `decantr` (CLI)
**File:** `packages/cli/src/scaffold.ts:2380`
**Bug:** `refreshDerivedFiles` takes `options?: { isInitialScaffold?: boolean }` but line 2380 reads `options.density` — always `undefined`, defaulting to `comfortable`.

**Fix:** Read density from the essence file:
```typescript
const essenceData = JSON.parse(await fs.readFile(essencePath, 'utf-8'));
const densityLevel = essenceData.dna?.spacing?.density
  || essenceData.density?.level
  || 'comfortable';
```

### 0.3 `decoratorsPath` Undefined

**Package:** `decantr` (CLI)
**File:** `packages/cli/src/scaffold.ts:2555, 2740`
**Bug:** `decoratorsPath` referenced but never declared. Fallback CSS-parsing path for decorators is dead code.

**Fix:** Remove the dead-code fallback branches entirely. The `themeData?.decorators` path is the intended source. If `themeData.decorators` is empty, section contexts should explicitly state "No theme decorators defined" rather than silently outputting nothing.

### 0.4 `suggest_patterns` MCP Tool Accesses Undefined Fields

**Package:** `@decantr/mcp-server`
**File:** `packages/mcp-server/src/tools.ts:547-612`
**Bug:** Calls `listContent<Pattern>('patterns')` — list endpoint returns abbreviated items without `components`, `tags`, or `presets`. Scoring code accesses all three as `undefined`.

**Fix:** Fetch full pattern data for matching. Two options:
- **Option A (preferred):** Fetch individual patterns for the top N name/description matches only (avoids fetching all 107).
- **Option B:** Use the API search endpoint instead of list endpoint, which returns richer results.

Additionally fix the `id` issue — list items return Supabase UUID as `id`, not the pattern slug. Use `item.slug` for identification.

### 0.5 `global.css` Hardcodes Dark Mode

**Package:** `decantr` (CLI)
**File:** `packages/cli/src/scaffold.ts:704`
**Bug:** `html { color-scheme: dark; }` emitted regardless of mode setting.

**Fix:** Read mode from essence:
```typescript
const mode = essence.dna?.theme?.mode || 'dark';
const colorScheme = mode === 'auto' ? 'light dark' : mode;
```

---

## Phase 1: Wire Existing Data

Theme data is fetched from the registry but never surfaced in context files. These are small code changes with high impact.

### 1.1 Wire `themeHints` Into Section Contexts

**Package:** `decantr` (CLI)
**File:** `packages/cli/src/scaffold.ts` — calls to `generateSectionContext()` at lines ~2623 and ~2772

**Current:** `themeHints` field is omitted from every call.
**Fix:** Map `themeData` fields to the `themeHints` parameter:

```typescript
generateSectionContext({
  // ...existing fields...
  themeHints: {
    preferred: themeData?.pattern_preferences?.prefer,
    compositions: themeData?.compositions
      ? Object.entries(themeData.compositions)
          .map(([k, v]) => `**${k}:** ${v.description}`)
          .join('\n')
      : undefined,
    spatialHints: themeData?.spatial
      ? `Density bias: ${themeData.spatial.density_bias || 'none'}. Section padding: ${themeData.spatial.section_padding || 'default'}. Card wrapping: ${themeData.spatial.card_wrapping || 'default'}.`
      : undefined,
  },
});
```

### 1.2 Include Decorator Descriptions in Section Contexts

**Package:** `decantr` (CLI)
**File:** `packages/cli/src/scaffold.ts` — `generateSectionContext()` around line 2998

**Current:** `decorators.map(d => d.name).join(', ')`
**Fix:** Render as a table:

```typescript
if (decorators.length > 0) {
  lines.push('**Theme decorators:**');
  lines.push('| Class | Usage |');
  lines.push('|-------|-------|');
  for (const d of decorators) {
    lines.push(`| \`.${d.name}\` | ${d.description} |`);
  }
}
```

### 1.3 Materialize Personality Into Visual Direction Section

**Package:** `decantr` (CLI)
**File:** `packages/cli/src/scaffold.ts` — `generateSectionContext()` around line 3038

**Current:** `**Personality:** See scaffold.md for personality and visual direction.`
**Fix:** Inline the personality with actionable context:

```typescript
if (personality.length > 0) {
  const personalityText = personality.join('. ');
  lines.push('## Visual Direction');
  lines.push('');
  lines.push(`**Personality:** ${personalityText}`);
  lines.push('');
  // Reference personality CSS utilities if they exist
  const personalityLower = personalityText.toLowerCase();
  const availableUtilities: string[] = [];
  if (personalityLower.includes('neon') || personalityLower.includes('glow'))
    availableUtilities.push('`neon-glow`, `neon-glow-hover`, `neon-text-glow`, `neon-border-glow`');
  if (personalityLower.includes('mono') || personalityLower.includes('monospace'))
    availableUtilities.push('`mono-data` (tabular-nums, monospace)');
  if (personalityLower.includes('pulse') || personalityLower.includes('ring') || personalityLower.includes('status'))
    availableUtilities.push('`status-ring` with `data-status="active|idle|error|processing"`');
  if (availableUtilities.length > 0) {
    lines.push('**Personality utilities available in treatments.css:**');
    for (const u of availableUtilities) lines.push(`- ${u}`);
  }
}
```

### 1.4 Inline Key Token Values in Section Contexts

**Package:** `decantr` (CLI)
**File:** `packages/cli/src/scaffold.ts` — `generateSectionContext()` around line 2992

**Current:** `**Theme tokens:** see src/styles/tokens.css — use var(--d-primary), var(--d-bg), etc.`
**Fix:** Parse and inline the palette:

```typescript
lines.push('**Key palette tokens:**');
lines.push('| Token | Value | Role |');
lines.push('|-------|-------|------|');
// Extract from themeTokens CSS string or from themeData.palette
if (themeData?.palette) {
  const semanticRoles: Record<string, string> = {
    background: 'Page canvas',
    surface: 'Cards, panels',
    'surface-raised': 'Elevated containers, modals',
    border: 'Dividers, card borders',
    text: 'Body text, headings',
    'text-muted': 'Secondary text, placeholders',
    primary: 'Brand color, key interactive elements',
    'primary-hover': 'Hover state for primary elements',
  };
  const mode = themeMode || 'dark';
  for (const [name, values] of Object.entries(themeData.palette)) {
    const value = values[mode] || values.dark || values.light || Object.values(values)[0];
    const role = semanticRoles[name] || '';
    lines.push(`| \`--d-${name}\` | \`${value}\` | ${role} |`);
  }
}
if (themeData?.seed) {
  lines.push(`| \`--d-accent\` | \`${themeData.seed.accent}\` | CTAs, links, glow effects |`);
}
```

### 1.5 Surface Theme Effects Data

**Package:** `decantr` (CLI)
**File:** `packages/cli/src/scaffold.ts` — `generateSectionContext()`

**Current:** `themeData.effects` is fetched but never written to any output.
**Fix:** Add effects guidance when present:

```typescript
if (themeData?.effects?.enabled) {
  lines.push(`**Effects:** intensity ${themeData.effects.intensity || 'medium'}`);
  if (themeData.effects.type_mapping) {
    for (const [component, effects] of Object.entries(themeData.effects.type_mapping)) {
      lines.push(`- ${component}: ${(effects as string[]).join(', ')}`);
    }
  }
}
```

### 1.6 Enrich DECANTR.md With Project-Specific Content

**Package:** `decantr` (CLI)
**File:** `packages/cli/src/scaffold.ts` — `generateDecantrMdV31()` around line 1717

**Current:** Only two variables: `GUARD_MODE` and `CSS_APPROACH`.
**Fix:** Add a project brief section at the top of DECANTR.md (before the generic methodology):

```markdown
## Project Brief

- **Blueprint:** {{BLUEPRINT_ID}}
- **Theme:** {{THEME_NAME}} ({{THEME_MODE}} mode, {{THEME_SHAPE}} shape)
- **Personality:** {{PERSONALITY}}
- **Sections:** {{SECTION_COUNT}} ({{SECTION_LIST}})
- **Features:** {{FEATURE_LIST}}
- **Guard mode:** {{GUARD_MODE}}

### Decorator Quick Reference

{{DECORATOR_TABLE}}
```

This adds ~20 lines of project-specific content to the file the AI reads first.

### 1.7 Fix Blueprint Theme Override Ambiguity

**Package:** `decantr` (CLI)
**File:** `packages/cli/src/index.ts:572-579`

**Current:** Checks `options.theme === 'luminarum'` to decide if blueprint theme should override.
**Fix:** Track whether the user explicitly set the flag:

```typescript
// In parseFlags or InitArgs
const userExplicitTheme = args.theme !== undefined;
const userExplicitMode = args.mode !== undefined;
// Then in override logic:
if (!userExplicitTheme && blueprintData?.theme?.id) {
  options.theme = blueprintData.theme.id;
}
```

### 1.8 Eliminate Double Pattern Fetch

**Package:** `decantr` (CLI)
**File:** `packages/cli/src/index.ts:642-674` and `packages/cli/src/scaffold.ts:2460-2500`

**Current:** Patterns fetched in `cmdInit`, then re-fetched in `refreshDerivedFiles`.
**Fix:** Pass the already-fetched `patternSpecs` into `scaffoldProject` → `refreshDerivedFiles`. Add `patternSpecs?: Record<string, PatternSpecSummary>` to the options parameter.

---

## Phase 2: Content Schema Evolution

New fields added to content types in `decantr-content`. All new fields are optional for backward compatibility. Quality gates (Phase 3) will enforce them over time.

### 2.1 Pattern Schema Additions

Add to pattern JSON schema:

```typescript
interface PatternV3 extends Pattern {
  // NEW: Natural language visual brief (2-5 sentences)
  visual_brief?: string;

  // EXISTING but formalized: layout rendering guidance
  layout_hints?: Record<string, string>;

  // NEW: Component composition expression
  composition?: Record<string, string>;

  // NEW: Motion/interaction specifications
  motion?: {
    micro?: Record<string, string>;      // e.g., "button-press": "scale(0.97) 100ms ease-out"
    transitions?: Record<string, string>; // e.g., "page-enter": "fade-up 300ms ease-out"
    ambient?: Record<string, string>;     // e.g., "status-pulse": "glow oscillate 3s infinite"
  };

  // NEW: Responsive behavior per breakpoint
  responsive?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };

  // NEW: Accessibility patterns (prose, not just WCAG level)
  accessibility?: {
    role?: string;
    'aria-label'?: string;
    keyboard?: string[];
    announcements?: string[];
    focus_management?: string;
  };
}
```

**Backward compatibility:** All new fields are optional. Existing patterns continue to validate. Quality gates will progressively require `visual_brief` and `responsive`.

### 2.2 Blueprint Schema Additions

Add to blueprint JSON schema:

```typescript
interface BlueprintV2 extends Blueprint {
  // EXISTING: now with minimum quality requirement
  personality: string; // REQUIRED, minimum 100 chars

  // NEW: Copy/tone intelligence
  voice?: {
    tone?: string;
    cta_verbs?: string[];
    avoid?: string[];
    empty_states?: string;
    errors?: string;
    loading?: string;
    metrics_format?: string;
  };

  // NEW: Global responsive strategy (overrides pattern defaults)
  responsive_strategy?: {
    breakpoints?: string[];
    navigation?: { desktop?: string; tablet?: string; mobile?: string };
    data_display?: { desktop?: string; tablet?: string; mobile?: string };
  };
}
```

### 2.3 Theme Schema Additions

The theme schema is already rich. Formalize these existing-but-undocumented fields:

```typescript
interface ThemeV2 extends Theme {
  // EXISTING: now REQUIRED with minimum quality
  decorators: Record<string, string>; // Each description ≥20 chars

  // NEW: Structured decorator definitions (richer than description strings)
  decorator_definitions?: Record<string, {
    description: string;
    intent: string;                        // When/why to use this decorator
    suggested_properties?: Record<string, string>; // CSS property hints
    pairs_with?: string[];                 // Decorators that complement this one
    usage?: string[];                      // Component types this applies to
  }>;
}
```

**Migration:** Themes with simple `decorators: Record<string, string>` continue to work. `decorator_definitions` is an optional enrichment that provides structured data alongside the description string.

### 2.4 Archetype Schema Addition

```typescript
interface ArchetypeV2 extends Archetype {
  // EXISTING in content but not in TypeScript type
  role: ArchetypeRole; // 'primary' | 'gateway' | 'public' | 'auxiliary'

  // EXISTING in some archetypes
  classification?: {
    triggers: { primary: string[]; secondary: string[]; negative: string[] };
    implies: string[];
    weight: number;
    tier: string;
  };

  // NEW: Visual character per page
  page_briefs?: Record<string, string>; // pageId → visual description
}
```

### 2.5 Registry TypeScript Types Update

**Package:** `@decantr/registry`
**File:** `packages/registry/src/types.ts`

Update all interfaces to match the new schema fields. Key changes:
- Add `role: ArchetypeRole` to `Archetype` interface
- Add `visual_brief`, `composition`, `motion`, `responsive`, `accessibility` to `Pattern`
- Add `voice`, `responsive_strategy` to `Blueprint`
- Add `decorator_definitions` to `Theme`
- Add `shell` to `ContentType` union: `'pattern' | 'archetype' | 'theme' | 'blueprint' | 'shell'`

---

## Phase 3: Content Quality Gates

### 3.1 Enhanced validate.js

**Repo:** `decantr-content`
**File:** `validate.js`

Add quality gates (warnings first, errors after Phase 6 enrichment):

```javascript
// Pattern quality gates
if (type === 'patterns') {
  if (!content.visual_brief && !content.layout_hints) {
    warn(`${type}/${file}: missing visual_brief and layout_hints (quality gate)`);
  }
  if (!content.components || content.components.length === 0) {
    error(`${type}/${file}: missing components array`);
  }
  if (content.default_layout?.slots) {
    for (const [slot, desc] of Object.entries(content.default_layout.slots)) {
      if (typeof desc === 'string' && desc.length < 30) {
        warn(`${type}/${file}: slot "${slot}" description too short (${desc.length} chars, min 30)`);
      }
    }
  }
}

// Blueprint quality gates
if (type === 'blueprints') {
  if (!content.personality || content.personality.length === 0) {
    error(`${type}/${file}: missing personality`);
  }
  if (typeof content.personality === 'string' && content.personality.length < 100) {
    warn(`${type}/${file}: personality too short (${content.personality.length} chars, min 100)`);
  }
  if (Array.isArray(content.personality) && content.personality.length === 0) {
    error(`${type}/${file}: personality is empty array`);
  }
}

// Theme quality gates
if (type === 'themes') {
  if (!content.palette || Object.keys(content.palette).length < 5) {
    warn(`${type}/${file}: palette has fewer than 5 semantic colors`);
  }
  if (!content.decorators || Object.keys(content.decorators).length === 0) {
    warn(`${type}/${file}: no decorators defined`);
  }
  if (content.decorators) {
    for (const [name, desc] of Object.entries(content.decorators)) {
      if (typeof desc === 'string' && desc.length < 20) {
        warn(`${type}/${file}: decorator "${name}" description too short`);
      }
    }
  }
}
```

### 3.2 CLI `decantr check` Quality Audit

**Package:** `decantr` (CLI)

Add a `--quality` flag to `decantr check` that evaluates content quality of the local essence and referenced content. Reports:
- Missing visual briefs in referenced patterns
- Short slot descriptions
- Empty personality
- Theme decorator coverage
- Treatment usage completeness

---

## Phase 4: MCP & API Data Integrity

### 4.1 Unwrap `.data` Envelope in MCP Tools

**Package:** `@decantr/mcp-server`
**File:** `packages/mcp-server/src/tools.ts`

Fix every tool that returns raw API responses:

**`resolve_pattern` (line 460):**
```typescript
const raw = await apiClient.getPattern(namespace, args.id as string);
const pattern = (raw as any).data ?? raw;
const result = { found: true, ...pattern };
```

**`resolve_archetype` (line 477):**
```typescript
const raw = await apiClient.getArchetype(namespace, args.id as string);
const archetype = (raw as any).data ?? raw;
const result = { found: true, ...archetype };
```

**`resolve_blueprint` (line 489):**
```typescript
const raw = await apiClient.getBlueprint(namespace, args.id as string);
const blueprint = (raw as any).data ?? raw;
// Continue with unwrapped blueprint...
```

### 4.2 Fix `suggest_patterns` Data Access

**Package:** `@decantr/mcp-server`
**File:** `packages/mcp-server/src/tools.ts:547-612`

Replace list-endpoint approach with individual fetches for top matches:

```typescript
// Step 1: Get list for name/description matching
const list = await apiClient.listContent('patterns', namespace);
// Step 2: Score by name/description only (fields that ARE present)
const scored = list.items.map(p => ({
  slug: p.slug,
  name: (p as any).name || p.slug,
  description: (p as any).description || '',
  score: computeNameDescScore(query, p),
})).sort((a, b) => b.score - a.score).slice(0, 10);
// Step 3: Fetch full data for top 10 only
const enriched = await Promise.all(scored.map(async s => {
  const raw = await apiClient.getPattern(namespace, s.slug);
  const full = (raw as any).data ?? raw;
  return { ...s, components: full.components, tags: full.tags };
}));
// Step 4: Re-score with full data
```

### 4.3 Fix RegistryAPIClient Type Safety

**Package:** `@decantr/registry`
**File:** `packages/registry/src/api-client.ts`

The typed methods (`getPattern`, `getTheme`, etc.) return `Promise<Pattern>` but actually return `ContentItem`. Fix:

```typescript
interface ContentItemWrapper<T> {
  id: string;
  type: string;
  slug: string;
  namespace: string;
  data: T;
}

async getPattern(namespace: string, slug: string): Promise<ContentItemWrapper<Pattern>> {
  return this.getContent<ContentItemWrapper<Pattern>>('patterns', namespace, slug);
}
```

Or alternatively, unwrap inside the client:
```typescript
async getPattern(namespace: string, slug: string): Promise<Pattern> {
  const raw = await this.getContent<any>('patterns', namespace, slug);
  return raw.data ?? raw;
}
```

**Preferred:** Unwrap inside the client so all consumers get clean data. This eliminates the `raw.data ?? raw` pattern from every caller.

### 4.4 Fix `syncRegistry` Cache Quality

**Package:** `decantr` (CLI)
**File:** `packages/cli/src/registry.ts:336-344`

**Current:** Caches abbreviated list items as individual item cache entries.
**Fix:** After caching the list index, fetch full data for each item:

```typescript
// After caching the index, fetch individual items for full cache
for (const item of items) {
  try {
    const fullItem = await this.apiClient.getContent(type, namespace, item.slug);
    await fs.writeFile(
      path.join(typeDir, `${item.slug}.json`),
      JSON.stringify(fullItem, null, 2)
    );
  } catch { /* individual fetch failure is non-critical */ }
}
```

Note: This makes sync slower but produces complete offline cache. Consider a `--full` flag or making this the default for `decantr sync`.

### 4.5 Add CORS Headers to API Responses

**Package:** `decantr-api`
**File:** `apps/api/src/app.ts`

Add `Access-Control-Allow-Origin` to all responses (not just OPTIONS preflight):

```typescript
app.use('*', async (c, next) => {
  await next();
  c.header('Access-Control-Allow-Origin', '*');
});
```

Note: Only needed if browser clients (decantr-web) call the API directly. If all traffic is server-to-server (CLI, MCP), CORS is not required.

### 4.6 Fix `create_essence` Stale Archetype List

**Package:** `@decantr/mcp-server`
**File:** `packages/mcp-server/src/tools.ts:764-786`

Replace hardcoded 9-archetype list with dynamic fetch:

```typescript
const archetypeList = await apiClient.listContent('archetypes', '@official');
const archetypeIds = archetypeList.items.map(a => (a as any).slug || (a as any).id);
```

---

## Phase 5: Nuclear Layer

### 5.1 Composition Algebra

**Content format** — Add `composition` field to patterns:

```json
{
  "composition": {
    "PricingSection": "Grid(3, responsive: stack) > PricingTier[]",
    "PricingTier": "Card(carbon-card, elevated?: carbon-glass + neon-border-glow) > [PlanHeader, Price(mono-data), FeatureList > CheckItem[], CTAButton(d-interactive, variant: tier.recommended ? primary : ghost, full-width)]",
    "PlanHeader": "Text(heading3) + Badge?(d-annotation, status: info, show: tier.recommended)"
  }
}
```

**Grammar:**
- `>` = contains
- `[]` = repeats/list
- `?` = conditional
- `()` = props/decorators
- `+` = adjacent sibling
- `condition ? a : b` = ternary

**CLI consumption:** `generateSectionContext` renders composition expressions in a code block within the pattern spec section. The AI reads this as a structural recipe.

**No parser needed in the CLI.** The composition expression is passed as a string to the context file. The AI parses it natively (LLMs excel at reading simple grammars).

### 5.2 Motion Language

**Content format** — Add `motion` field to patterns:

```json
{
  "motion": {
    "micro": {
      "button-press": "scale(0.97) 100ms ease-out",
      "card-hover": "translateY(-2px) + shadow-md 200ms ease-out",
      "toggle-switch": "translateX(100%) 150ms spring(1, 80, 10)"
    },
    "transitions": {
      "page-enter": "fade-up 300ms ease-out, stagger-children 50ms",
      "modal-enter": "scale(0.95 to 1) + fade 200ms ease-out",
      "tab-switch": "cross-fade 200ms ease-in-out"
    },
    "ambient": {
      "neon-pulse": "glow-intensity oscillate 3s ease-in-out infinite",
      "status-active": "border-color pulse 2s linear infinite"
    }
  }
}
```

**CLI consumption:** Rendered as a table in section context:

```markdown
**Motion specs:**
| Interaction | Animation |
|-------------|-----------|
| button-press | scale(0.97) 100ms ease-out |
| card-hover | translateY(-2px) + shadow-md 200ms ease-out |
| page-enter | fade-up 300ms ease-out, stagger-children 50ms |
```

### 5.3 Responsive Strategy

**Content format** — Add `responsive` field to patterns (some already have this):

```json
{
  "responsive": {
    "mobile": "Stack vertically. Pricing tiers become swipeable horizontal carousel with popular tier first. Full-width CTAs.",
    "tablet": "2-column grid. Popular tier spans full width on top row. Smaller text scale.",
    "desktop": "3-column grid. Center tier elevated with glassmorphic effect."
  }
}
```

**Blueprint-level override** — `responsive_strategy` on blueprints:

```json
{
  "responsive_strategy": {
    "breakpoints": ["mobile: <640px", "tablet: 640-1024px", "desktop: >1024px"],
    "navigation": {
      "desktop": "Persistent left sidebar, 260px",
      "tablet": "Collapsible sidebar, overlay on toggle",
      "mobile": "Bottom sheet with hamburger trigger"
    }
  }
}
```

### 5.4 Voice/Copy Intelligence

**Content format** — `voice` field on blueprints:

```json
{
  "voice": {
    "tone": "Technical but approachable. Like a senior engineer explaining to a competent colleague.",
    "cta_verbs": ["Deploy", "Launch", "Configure", "Activate", "Connect"],
    "avoid": ["Submit", "Click here", "Click to", "Enter your", "Please"],
    "empty_states": "Encouraging + actionable: 'No agents deployed yet. Deploy your first agent to see it here.'",
    "errors": "Direct + helpful: 'Connection failed. Check your API key in Settings > Integrations.'",
    "loading": "Context-aware: 'Warming up agent...' not 'Loading...'",
    "metrics_format": "Abbreviated with units: '2.4k requests', '99.7% uptime', '$0.003/call'"
  }
}
```

**CLI consumption:** Rendered in scaffold.md and referenced in section contexts:

```markdown
## Voice & Copy

**Tone:** Technical but approachable.
**CTA verbs:** Deploy, Launch, Configure, Activate, Connect
**Avoid:** Submit, Click here, Enter your, Please
**Empty states:** Encouraging + actionable
**Errors:** Direct + helpful
**Loading states:** Context-aware (e.g., "Warming up agent..." not "Loading...")
```

### 5.5 Visual Briefs (Exemplars)

**Content format** — `visual_brief` field on patterns:

```json
{
  "visual_brief": "Three pricing tier cards in a responsive row. The recommended tier is visually elevated — larger, highlighted border, prominent badge. Each card shows: plan name (heading), price with period (mono-data), feature checklist with checkmark icons, and a full-width CTA button. The recommended tier CTA is primary variant; others are ghost. Annual/monthly toggle centered above cards with pill-style active state."
}
```

**CLI consumption:** Rendered prominently in section context, directly above the components list:

```markdown
### pricing
**Visual brief:** Three pricing tier cards in a responsive row...

**Components:** Card, Button, Badge, Toggle
```

### 5.6 Accessibility Patterns

**Content format** — `accessibility` field on patterns:

```json
{
  "accessibility": {
    "role": "region",
    "aria-label": "Pricing plans",
    "keyboard": [
      "Tab navigates between tier cards",
      "Enter/Space activates CTA button",
      "Arrow keys switch annual/monthly toggle"
    ],
    "announcements": [
      "Price change announced on toggle switch",
      "Selected plan confirmed on CTA click"
    ],
    "focus_management": "Focus moves to first tier card on section entry"
  }
}
```

### 5.7 Design Critique MCP Tool

**Package:** `@decantr/mcp-server`

Add new tool `decantr_critique`:

```typescript
{
  name: 'decantr_critique',
  title: 'Design Critique',
  description: 'Evaluate generated code against the essence spec for visual quality. Checks decorator usage, motion implementation, personality alignment, responsive coverage, and accessibility.',
  inputSchema: {
    type: 'object',
    properties: {
      file_path: { type: 'string', description: 'Path to the generated component file' },
      page_id: { type: 'string', description: 'The page this component belongs to' },
    },
    required: ['file_path'],
  },
}
```

**Implementation:** Heuristic-based scoring:
1. Parse the component file for class names
2. Check which decorator classes from the section context are used vs. missing
3. Check if personality utilities (neon-glow, mono-data, etc.) are present
4. Check for motion patterns (transitions, animations, keyframes)
5. Check for responsive breakpoints
6. Check for aria attributes and keyboard handlers
7. Return a structured scorecard with specific improvement suggestions

### 5.8 `@layer` Cascade in Generated CSS

**Package:** `decantr` (CLI)

**tokens.css:** Add `@layer tokens { ... }` wrapper
**treatments.css:** Add `@layer treatments { ... }` wrapper for base treatments, `@layer decorators { ... }` for theme decorators, `@layer utilities { ... }` for personality utilities
**global.css:** Add `@layer reset { ... }` wrapper and `@layer` order declaration:

```css
@layer reset, tokens, treatments, decorators, utilities, app;
```

### 5.9 Kill Dual Essence Build

**Package:** `decantr` (CLI)
**File:** `packages/cli/src/scaffold.ts` — `scaffoldProject()`

Remove the V2 essence construction path (`buildEssence()`) and the V2 template rendering. Build V3.1 directly. The V2 path should only exist in the `decantr migrate` command for upgrading old projects.

### 5.10 Remove Decorator CSS Heuristic (Conditional)

**Depends on:** Phase 5.5 (visual briefs) and Phase 2.3 (structured decorator definitions) being proven in production.

**Package:** `decantr` (CLI)
**File:** `packages/cli/src/scaffold.ts:750-905`

**Current:** `generateDecoratorRule()` converts natural language to CSS via keyword matching.
**Phase A:** Keep the heuristic but also pass the structured decorator definitions (description + intent + suggested_properties) into the section context. The AI can use EITHER the generated CSS OR the structured definitions.
**Phase B (later):** Once structured definitions are proven superior, remove `generateDecoratorRule()` entirely. The treatments.css would only contain base treatments + personality utilities. Decorator CSS becomes the AI's responsibility, guided by structured definitions.

---

## Phase 5.5: `decantr magic` Overhaul

The `decantr magic` command is the highest-leverage entry point — a single natural language prompt produces a full scaffold. Currently it works (NLP parse → blueprint match → compose → scaffold) but doesn't benefit from the v2 architecture. This phase upgrades magic to be the showcase of everything Decantr does.

### Current State (magic.ts, 589 lines)

1. `parseMagicPrompt` — keyword-based NLP: extracts theme hints, archetype, personality adjectives, constraints
2. `resolveTheme` — maps theme hints to known theme IDs (hardcoded 8-entry map)
3. Blueprint scoring — fetches all blueprints, scores by token overlap (archetype +3, description +2, theme +1), uses best match if score ≥ 4
4. Full composition pipeline — identical to `cmdInit` (archetype fetch → compose sections → topology → pattern specs → theme → scaffold)
5. Summary output — lists created files, prints next steps

### 5.5.1 Improve Blueprint Matching

**Current:** Keyword token overlap scoring with fixed weights. Misses semantic relationships.
**Fix:** Use the new content fields for better matching:

```typescript
// Score archetype classification triggers (from archetype content)
for (const arch of archetypeList) {
  if (arch.classification?.triggers?.primary) {
    for (const trigger of arch.classification.triggers.primary) {
      if (promptLower.includes(trigger)) archetypeScore += 5;
    }
  }
  if (arch.classification?.triggers?.secondary) {
    for (const trigger of arch.classification.triggers.secondary) {
      if (promptLower.includes(trigger)) archetypeScore += 2;
    }
  }
  // Negative triggers reduce score
  if (arch.classification?.triggers?.negative) {
    for (const trigger of arch.classification.triggers.negative) {
      if (promptLower.includes(trigger)) archetypeScore -= 3;
    }
  }
}
```

Also use archetype `classification.implies` to chain related archetypes (e.g., "agent" implies "ai-chatbot" patterns).

### 5.5.2 Theme Resolution Using Registry Data

**Current:** Hardcoded 8-entry map (`neon → obsidianite`, `warm → aurealis`, etc.).
**Fix:** Fetch theme list from registry and score against theme `personality` strings and `tags`:

```typescript
const themes = await registryClient.fetchThemes();
const themeScores = themes.map(t => {
  let score = 0;
  const meta = (t as any).data ?? t;
  // Match against theme personality
  if (meta.personality) {
    for (const hint of intent.themeHints) {
      if (meta.personality.toLowerCase().includes(hint)) score += 3;
    }
  }
  // Match against theme tags
  if (meta.tags) {
    for (const hint of intent.themeHints) {
      if (meta.tags.some(tag => tag.includes(hint))) score += 2;
    }
  }
  // Match mode explicitly
  if (intent.themeHints.includes('dark') && meta.modes?.includes('dark')) score += 1;
  if (intent.themeHints.includes('light') && meta.modes?.includes('light')) score += 1;
  return { id: meta.id, score };
}).sort((a, b) => b.score - a.score);
```

Keep the hardcoded map as offline fallback only.

### 5.5.3 Personality Synthesis From Prompt

**Current:** Returns personality hints directly from prompt parse, or synthesizes generic defaults.
**Fix:** Build a rich personality string by combining:
1. User's explicit adjectives from the prompt
2. Blueprint personality (if matched)
3. Theme personality (from the resolved theme)
4. Archetype description

```typescript
function buildRichPersonality(intent: MagicIntent, blueprint?: any, theme?: any, archetype?: any): string {
  const parts: string[] = [];

  // Start with blueprint personality if available (it's the richest source)
  if (blueprint?.personality && typeof blueprint.personality === 'string') {
    parts.push(blueprint.personality);
  }

  // Layer in user's explicit adjectives
  if (intent.personalityHints.length > 0) {
    parts.push(`Visual character: ${intent.personalityHints.join(', ')}.`);
  }

  // Add theme personality for flavor
  if (theme?.personality && !parts.some(p => p.includes(theme.personality))) {
    parts.push(`Theme influence: ${theme.personality}.`);
  }

  // Fallback: synthesize from description
  if (parts.length === 0) {
    parts.push(`Modern, production-ready ${intent.description}. Clean typography, intentional spacing, polished interactions.`);
  }

  return parts.join(' ');
}
```

### 5.5.4 Voice Synthesis

**New:** Generate a default `voice` block when no blueprint provides one:

```typescript
function synthesizeVoice(intent: MagicIntent): BlueprintVoice {
  const tone = intent.personalityHints.includes('playful')
    ? 'Casual and encouraging.'
    : intent.personalityHints.includes('corporate') || intent.personalityHints.includes('enterprise')
    ? 'Professional and precise.'
    : 'Technical but approachable.';

  return {
    tone,
    cta_verbs: ['Get Started', 'Continue', 'Configure', 'Explore'],
    avoid: ['Submit', 'Click here', 'Please enter'],
    empty_states: 'Encouraging with clear next action.',
    errors: 'Direct with recovery guidance.',
    loading: 'Context-aware (describe what is loading).',
  };
}
```

### 5.5.5 Constraint-Aware Scaffolding

**Current:** Constraints are parsed (`mobile-first`, `accessible`, `real-time`) but have no effect on output.
**Fix:** Map constraints to essence fields:

```typescript
if (intent.constraints.includes('accessible')) {
  options.wcag = 'AA';
  options.accessibility = { focus_visible: true, skip_nav: true };
}
if (intent.constraints.includes('mobile-first')) {
  options.density = 'comfortable'; // Not compact — touch targets need space
  // Add responsive_strategy to blueprint data
  blueprintData.responsive_strategy = {
    breakpoints: ['mobile: <640px', 'tablet: 640-1024px', 'desktop: >1024px'],
    navigation: { mobile: 'Bottom sheet with hamburger', tablet: 'Collapsible sidebar', desktop: 'Persistent sidebar' },
  };
}
if (intent.constraints.includes('real-time')) {
  options.features = [...(options.features || []), 'websockets', 'live-updates'];
}
```

### 5.5.6 Dry Run Enhancement

**Current:** Prints resolved config as a flat key-value list.
**Fix:** Print a rich preview showing what the scaffold WILL produce:

```
╭─────────────────────────────────────────────────────────────────╮
│ decantr magic preview                                           │
├─────────────────────────────────────────────────────────────────┤
│ Blueprint: agent-marketplace (score: 12/15)                    │
│ Theme:     carbon-neon (dark, rounded)                         │
│ Archetype: agent-orchestrator + auth-full + marketing-saas     │
│                                                                 │
│ Personality:                                                    │
│   Confident cyber-minimal agent marketplace. Neon accent glows  │
│   on dark void backgrounds. Monospace data typography.          │
│                                                                 │
│ Voice: Technical but approachable                               │
│ WCAG: AA | Density: comfortable | Guard: strict                │
│                                                                 │
│ Sections (4):                                                   │
│   agent-orchestrator  PRIMARY    sidebar-main   8 pages        │
│   auth-full           GATEWAY    centered        8 pages        │
│   marketing-saas      PUBLIC     top-nav-footer  6 pages        │
│   ai-transparency     AUXILIARY  sidebar-main    3 pages        │
│                                                                 │
│ Routes: 25 total                                                │
│ Features: auth, mfa, oauth, dark-mode, command-palette, ...    │
│                                                                 │
│ Decorators (10): carbon-card, carbon-glass, carbon-code, ...   │
│ Personality CSS: neon-glow, mono-data, status-ring             │
╰─────────────────────────────────────────────────────────────────╯

Run without --dry-run to scaffold.
```

### 5.5.7 Post-Scaffold Quality Summary

**New:** After scaffolding, run a quick quality check and report:

```
✓ Scaffolded in 3.2s

Quality summary:
  Context files:  25 generated (4 sections + scaffold + DECANTR.md)
  CSS:            tokens.css (45 vars) + treatments.css (345 lines, 10 decorators, 4 personality utilities)
  Visual briefs:  18/22 patterns have visual briefs (82%)
  Motion specs:   8/22 patterns have motion specs (36%)
  Responsive:     14/22 patterns have responsive strategies (64%)
  @layer cascade: ✓ All CSS files use @layer declarations

Next steps:
  1. Review .decantr/context/scaffold.md for the full app overview
  2. Start building: each section context in .decantr/context/section-*.md has everything your AI needs
  3. Run decantr check --quality to audit visual completeness
```

### 5.5.8 Magic Command Checklist

- [ ] 5.5.1 Replace hardcoded archetype keyword map with classification trigger scoring
- [ ] 5.5.2 Replace hardcoded theme map with registry-based theme scoring
- [ ] 5.5.3 Build rich personality strings by combining prompt + blueprint + theme
- [ ] 5.5.4 Synthesize default voice block when blueprint doesn't provide one
- [ ] 5.5.5 Map constraints to essence fields (accessible → WCAG AA, mobile-first → responsive strategy)
- [ ] 5.5.6 Rich dry-run preview with composition summary
- [ ] 5.5.7 Post-scaffold quality summary with coverage percentages
- [ ] Update magic.test.ts with new test cases

---

## Phase 6: Content Enrichment Campaign

### 6.1 Pattern Enrichment (decantr-content)

**Priority 1 — Top 30 most-used patterns:**
Add `visual_brief` (required), `motion` (where applicable), `responsive`, enriched `accessibility`.

Target patterns (by usage frequency across archetypes):
`hero`, `nav-header`, `footer`, `data-table`, `card-grid`, `form`, `stats-overview`, `activity-feed`, `chart-grid`, `kpi-grid`, `pricing`, `pricing-usage`, `testimonials`, `features`, `how-it-works`, `cta`, `chat-thread`, `chat-input`, `settings-nav`, `settings-form`, `content-section`, `faq`, `user-profile`, `team-members`, `billing-overview`, `notification-center`, `search-results`, `file-manager`, `kanban-board`, `calendar-view`

**Priority 2 — Remaining patterns:**
Add `visual_brief` at minimum. Enrich slot descriptions to ≥30 chars.

### 6.2 Blueprint Enrichment (decantr-content)

**All 10 Gen-1 blueprints need personality strings:**
`saas-dashboard`, `ecommerce`, `portfolio`, `financial-dashboard`, `recipe-community`, `ecommerce-admin`, `content-site`, `workbench`, `gaming-platform`, `cloud-platform`

Each needs:
- `personality` string ≥100 chars with visual direction
- `voice` block with tone and copy guidance
- `routes` mapping (where missing)
- `navigation` block (where appropriate)

### 6.3 Theme Enrichment (decantr-content)

**10 seed-stub themes need enrichment:**
`retro`, `dopamine`, `editorial`, `prismatic`, `bioluminescent`, `liquid-glass`, `neon-dark`, `launchpad`, `gaming-guild`, `clean`

Each needs:
- Full `palette` with light/dark values for: background, surface, surface-raised, border, text, text-muted, primary, primary-hover
- `decorators` with ≥3 entries, each description ≥20 chars
- `spatial` configuration
- `motion` preferences
- `effects` type mapping

### 6.4 Archetype Page Briefs (decantr-content)

Add `page_briefs` to all 55 archetypes. Each page gets a 1-2 sentence visual description:

```json
{
  "page_briefs": {
    "overview": "Dense monitoring dashboard with live agent topology, KPI cards at top, activity feed in sidebar",
    "agent-detail": "Deep-dive view with tabbed interface — metrics, logs, config. Header shows agent status with neon ring indicator."
  }
}
```

---

## Phase 7: Documentation & Skills Update

### 7.1 CLAUDE.md Updates

**File:** `/Users/davidaimi/projects/decantr-monorepo/CLAUDE.md`

Update:
- Package versions (all bumped per Phase matrix)
- Content type counts (107 patterns, 55 archetypes, 19 blueprints, 20 themes, 13 shells)
- Remove recipe references
- Add new MCP tool (`decantr_critique`)
- Add new content fields (visual_brief, composition, motion, responsive, voice, accessibility)
- Update Design Pipeline description to reference visual briefs
- Add section on `@layer` cascade

### 7.2 CSS Scaffolding Guide Update

**File:** `/Users/davidaimi/projects/decantr-monorepo/docs/css-scaffolding-guide.md`

Update:
- Add `@layer` declarations as mandatory (not just recommended)
- Document the layer order: `reset → tokens → treatments → decorators → utilities → app`
- Document personality utility generation
- Document decorator CSS generation (or its replacement with structured definitions)
- Add semantic token table format documentation

### 7.3 Decantr Engineering Skill Update

**File:** `/Users/davidaimi/.claude/skills/decantr-engineering/SKILL.md`

Full rewrite to reflect:
- Updated package versions
- Updated content counts
- New content fields (visual_brief, composition, motion, responsive, voice, accessibility)
- New MCP tool (decantr_critique)
- Corrected Three-Tier Context Model description (personality materialized, decorator descriptions included, semantic token table, theme hints wired)
- Updated anti-pattern red flags
- Removed recipe references entirely (recipes no longer exist)
- Updated Guard Rules section
- Updated API infrastructure notes
- Added content quality requirements
- Added composition algebra grammar reference
- Added motion language reference
- Added `@layer` cascade as mandatory

### 7.4 Harness Skill Update

**Files:**
- `/Users/davidaimi/.claude/skills/decantr-engineering/harness.md`
- `/Users/davidaimi/projects/decantr-monorepo/.claude/skills/harness.md`

Rewrite both to reflect:
- Updated file expectations (no decorators.md, treatments.css with `@layer`)
- Updated context file structure (personality materialized in sections, decorator table with descriptions, semantic token table, theme hints present)
- Visual brief presence checking
- Composition algebra validation
- Motion spec coverage checking
- Responsive strategy coverage checking
- Voice/copy tone validation
- Design critique scorecard integration
- `@layer` cascade validation in CSS files
- Updated treatment coverage scorecard (add personality utilities category)

### 7.5 Existing Spec/Plan Cleanup

Review and archive superseded docs:
- `docs/specs/2026-04-02-recipe-theme-merge-design.md` — recipes fully merged, this is historical
- `docs/specs/2026-04-02-visual-treatment-system-design.md` — superseded by this spec
- `docs/plans/2026-04-02-recipe-theme-merge.md` — completed
- `docs/plans/2026-04-02-polish-patterns-treatments.md` — superseded by this spec's Phase 6

---

## Package Impact Matrix

| Package | Current Version | New Version | Changes |
|---------|----------------|-------------|---------|
| `@decantr/essence-spec` | 1.0.0-beta.10 | 1.0.0-beta.11 | Fix v3.1 validation detection; add v3.1 test case |
| `@decantr/registry` | 1.0.0-beta.10 | 1.0.0-beta.11 | Update type interfaces (Pattern, Theme, Blueprint, Archetype, Shell, ContentType); fix RegistryAPIClient unwrapping |
| `@decantr/core` | 1.0.0-beta.9 | 1.0.0-beta.9 | No changes (descoped) |
| `@decantr/mcp-server` | 1.0.0-beta.11 | 1.0.0-beta.12 | Fix resolve_pattern/archetype/blueprint unwrapping; fix suggest_patterns; add decantr_critique tool; fix create_essence stale list |
| `decantr` (CLI) | 1.5.6 | 1.6.0 | Phase 0 bugs + Phase 1 context enrichment + Phase 5 nuclear features + @layer CSS + kill dual essence build |
| `@decantr/css` | 1.0.2 | 1.0.2 | No changes |
| `@decantr/vite-plugin` | 0.1.0 | 0.1.0 | No changes |
| `@decantr/ui` | — | — | Descoped |
| `@decantr/ui-catalog` | — | — | Descoped |
| `@decantr/ui-chart` | — | — | Descoped |
| `decantr-api` | — | — | CORS fix if browser clients need it; subscription no-op bug fix |
| `decantr-content` | 1.0.0 | 1.1.0 | Enhanced validate.js; enriched patterns/blueprints/themes/archetypes |

---

## Implementation Checklist

### Phase 0: Critical Bugs
- [ ] 0.1 Fix `detectVersion` in essence-spec validate.ts to handle v3.1.0
- [ ] 0.2 Fix density reading in CLI scaffold.ts refreshDerivedFiles
- [ ] 0.3 Remove dead `decoratorsPath` fallback branches in CLI scaffold.ts
- [ ] 0.4 Fix `suggest_patterns` MCP tool data access
- [ ] 0.5 Fix `global.css` color-scheme to respect mode setting
- [ ] Run tests: `pnpm test` across all affected packages
- [ ] Bump `@decantr/essence-spec` to 1.0.0-beta.11

### Phase 1: Wire Existing Data
- [ ] 1.1 Wire `themeHints` into `generateSectionContext` calls
- [ ] 1.2 Change decorator rendering from name-list to description table
- [ ] 1.3 Materialize personality into Visual Direction section with utility references
- [ ] 1.4 Inline key palette token values with semantic roles
- [ ] 1.5 Surface theme effects data in section contexts
- [ ] 1.6 Add project brief section to DECANTR.md template
- [ ] 1.7 Fix blueprint theme override to track explicit user flags
- [ ] 1.8 Pass patternSpecs through to refreshDerivedFiles, eliminate double fetch
- [ ] Run tests + verify with showcase refresh
- [ ] Bump `decantr` CLI to 1.6.0-beta.1

### Phase 2: Content Schema Evolution
- [ ] 2.1 Add `visual_brief`, `composition`, `motion`, `responsive`, `accessibility` to Pattern type
- [ ] 2.2 Add `voice`, `responsive_strategy` to Blueprint type
- [ ] 2.3 Add `decorator_definitions` to Theme type
- [ ] 2.4 Add `role`, `page_briefs` to Archetype type
- [ ] 2.5 Update all types in `@decantr/registry` types.ts
- [ ] Bump `@decantr/registry` to 1.0.0-beta.11

### Phase 3: Content Quality Gates
- [ ] 3.1 Enhance validate.js with quality gate checks
- [ ] 3.2 Add `--quality` flag to CLI `decantr check`
- [ ] Run validate.js against current content — document all warnings
- [ ] Commit validate.js to decantr-content, push to main

### Phase 4: MCP & API Data Integrity
- [ ] 4.1 Fix `.data` unwrapping in resolve_pattern, resolve_archetype, resolve_blueprint
- [ ] 4.2 Fix suggest_patterns to fetch full data for top matches
- [ ] 4.3 Fix RegistryAPIClient typed methods to unwrap inside client
- [ ] 4.4 Fix syncRegistry to cache full items (not abbreviated)
- [ ] 4.5 Add CORS headers to API responses (if needed)
- [ ] 4.6 Replace hardcoded archetype list in create_essence with dynamic fetch
- [ ] Run MCP server tests
- [ ] Bump `@decantr/mcp-server` to 1.0.0-beta.12

### Phase 5: Nuclear Layer
- [ ] 5.1 Add composition algebra rendering to section context generator
- [ ] 5.2 Add motion language rendering to section context generator
- [ ] 5.3 Add responsive strategy rendering to section context and scaffold.md
- [ ] 5.4 Add voice/copy intelligence rendering to scaffold.md
- [ ] 5.5 Add visual brief rendering (prominent position) to section context
- [ ] 5.6 Add accessibility patterns rendering to section context
- [ ] 5.7 Implement `decantr_critique` MCP tool
- [ ] 5.8 Add `@layer` cascade to all generated CSS files
- [ ] 5.9 Remove V2 essence build path from scaffoldProject
- [ ] 5.10 Phase A: Pass structured decorator definitions alongside heuristic CSS
- [ ] Run full test suite
- [ ] Bump `decantr` CLI to 1.6.0

### Phase 5.5: Magic Command Overhaul
- [ ] 5.5.1 Replace hardcoded archetype keyword map with classification trigger scoring
- [ ] 5.5.2 Replace hardcoded theme map with registry-based theme scoring
- [ ] 5.5.3 Build rich personality strings combining prompt + blueprint + theme
- [ ] 5.5.4 Synthesize default voice block
- [ ] 5.5.5 Map constraints to essence fields (accessible, mobile-first, real-time)
- [ ] 5.5.6 Rich dry-run preview with composition summary
- [ ] 5.5.7 Post-scaffold quality summary with coverage percentages
- [ ] Update magic.test.ts with new test cases

### Phase 6: Content Enrichment
- [ ] 6.1a Add `visual_brief` to top 30 patterns
- [ ] 6.1b Add `motion` specs to applicable patterns (interactive: pricing, data-table, chat, modals)
- [ ] 6.1c Add `responsive` strategies to all layout-heavy patterns
- [ ] 6.1d Add `accessibility` patterns to interactive patterns (forms, modals, tables, navigation)
- [ ] 6.1e Enrich slot descriptions to ≥30 chars for all patterns
- [ ] 6.1f Add `composition` expressions to top 15 patterns
- [ ] 6.2 Add personality strings to 10 Gen-1 blueprints
- [ ] 6.2b Add `voice` blocks to all 19 blueprints
- [ ] 6.3 Enrich 10 seed-stub themes (palette, decorators, spatial, motion, effects)
- [ ] 6.4 Add `page_briefs` to all 55 archetypes
- [ ] Run validate.js — all quality gates pass
- [ ] Push enriched content to decantr-content main
- [ ] Sync enriched content to registry API

### Phase 7: Documentation & Skills
- [ ] 7.1 Update CLAUDE.md (versions, counts, fields, tools, layer cascade)
- [ ] 7.2 Update css-scaffolding-guide.md (@layer mandatory, personality utilities, semantic tokens)
- [ ] 7.3 Rewrite decantr-engineering SKILL.md
- [ ] 7.4 Rewrite harness.md (both copies)
- [ ] 7.5 Archive superseded specs/plans
- [ ] 7.6 Update docs/architecture/ if relevant diagrams exist

### Final Validation
- [ ] `pnpm build` passes in decantr-monorepo
- [ ] `pnpm test` passes in decantr-monorepo
- [ ] `node validate.js` passes in decantr-content
- [ ] Fresh `decantr init --blueprint=agent-marketplace --yes` produces enriched context files
- [ ] Harness skill produces accurate audit of scaffolded output
- [ ] Push decantr-monorepo to origin main
- [ ] Push decantr-content to origin main
