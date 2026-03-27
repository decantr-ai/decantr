# Accessibility & SEO in Essence: Design Spec

**Date:** 2026-03-26
**Status:** Draft
**Scope:** Add accessibility and SEO context to Decantr's essence schema, theme structure, and DECANTR.md generation

---

## Problem Statement

The current Decantr process has no explicit handling of:
- Accessibility (WCAG) requirements
- Color vision deficiency (CVD) accommodations
- SEO metadata guidance

These concerns are important for production-quality web applications but are currently left entirely to LLM discretion with no project-level context or reminders.

---

## Design Principles

1. **LLM already knows the rules** — We don't enumerate WCAG criteria or SEO best practices. We declare intent; the LLM applies its knowledge.

2. **Graceful and optional** — All new fields are optional. Projects that don't specify accessibility requirements work exactly as before.

3. **Theme owns CVD capability** — Color vision deficiency support is a theme-level concern. The essence declares preference; the theme declares what it can deliver.

4. **Guard enforces WCAG only** — Only WCAG level is guard-enforced. CVD and SEO are hints/preferences.

5. **DECANTR.md is the delivery mechanism** — The essence declares intent, but the LLM reads DECANTR.md. That's where the context must appear.

---

## Schema Changes

### 1. Essence Schema Addition

Add optional `accessibility` object to both `SimpleEssence` and `SectionedEssence`:

```json
{
  "accessibility": {
    "wcag_level": "AA",
    "cvd_preference": "auto"
  }
}
```

| Field | Type | Values | Required | Default |
|-------|------|--------|----------|---------|
| `wcag_level` | string | `"none"`, `"A"`, `"AA"`, `"AAA"` | No | `"none"` |
| `cvd_preference` | string | `"none"`, `"auto"`, `"deuteranopia"`, `"protanopia"`, `"tritanopia"`, `"achromatopsia"` | No | `"none"` |

**Behavior:**
- `wcag_level: "AA"` — Guard will validate heading hierarchy, alt text presence, focus styles, contrast ratios
- `cvd_preference: "auto"` — Scaffold includes CVD detection/toggle if theme supports it
- `cvd_preference: "none"` — No CVD handling scaffolded

### 2. Theme Schema Addition

Add optional CVD support fields to theme metadata:

```json
{
  "id": "luminarum",
  "name": "Luminarum",
  "cvd_support": ["deuteranopia", "protanopia"],
  "tokens": {
    "base": {
      "primary": "#7c3aed",
      "danger": "#ef4444",
      "success": "#22c55e"
    },
    "cvd": {
      "deuteranopia": {
        "danger": "#ff8f00",
        "success": "#2196f3"
      },
      "protanopia": {
        "danger": "#ffc107",
        "success": "#03a9f4"
      }
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `cvd_support` | string[] | List of CVD modes this theme provides variants for |
| `tokens.base` | object | Default color tokens |
| `tokens.cvd.<mode>` | object | Sparse override tokens for each CVD mode |

**Behavior:**
- If `cvd_support` is absent or empty, theme has no CVD variants
- `tokens.cvd.<mode>` only includes colors that differ from base — engine merges them
- Engine validates: if essence requests CVD but theme doesn't support it, emit warning

### 3. Archetype Schema Addition

Add optional SEO hints to archetype metadata:

```json
{
  "id": "saas-landing",
  "seo_hints": {
    "schema_org": ["Organization", "WebPage", "SoftwareApplication"],
    "meta_priorities": ["description", "og:image", "twitter:card"]
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `seo_hints.schema_org` | string[] | Suggested Schema.org types for this archetype |
| `seo_hints.meta_priorities` | string[] | Important meta tags for this archetype |

**Behavior:**
- These are soft hints only — no guard enforcement
- Rendered in DECANTR.md for LLM context
- LLM applies its knowledge of how to implement these suggestions

---

## Guard Changes

### New Guard Rule: Accessibility

Add Rule 6 to the guard system:

| # | Rule | What It Checks | Severity | Modes |
|---|------|----------------|----------|-------|
| 6 | **Accessibility** | WCAG compliance matches declared level | Error | guided, strict |

**What the guard checks (when `wcag_level` is set):**

- Heading hierarchy (h1 → h2 → h3, no skipped levels)
- Images have alt attributes
- Interactive elements are keyboard accessible (button/a tags, not div onClick)
- Form inputs have labels
- Focus indicators are present in CSS
- Color contrast ratios meet level requirements (via static analysis of theme tokens)

**What the guard does NOT check:**

- Actual content quality (alt text meaning, label clarity)
- Runtime behavior (focus management, screen reader announcements)
- CVD compliance (this is theme capability, not code validation)

---

## DECANTR.md Generation

### Accessibility Section

When `essence.accessibility` is present and `wcag_level !== "none"`, add section after "This Project":

```markdown
---

## Accessibility

**WCAG Level:** {wcag_level}
{if theme.cvd_support}**CVD Support:** Theme supports {cvd_support.join(", ")}
**CVD Preference:** {cvd_preference}{/if}

### What This Means

This project requires WCAG 2.1 Level {wcag_level} compliance. You already know these rules — apply them:

- Semantic HTML structure
- Sufficient color contrast (4.5:1 for normal text, 3:1 for large text)
- Keyboard navigability for all interactive elements
- Visible focus indicators
- Meaningful alt text for images
- Proper heading hierarchy

{if cvd_support}
### CVD Implementation

The theme provides these data attributes:

```html
<html data-theme="{theme.style}" data-mode="{theme.mode}" data-cvd="none">
```

Valid `data-cvd` values for this theme: `none`, {cvd_support.join(", ")}

{if cvd_preference === "auto"}Detect user preference via `prefers-contrast` or user settings and apply accordingly.{/if}
{/if}

---
```

### SEO Section

When archetype has `seo_hints`, add section:

```markdown
---

## SEO Guidance

This archetype (`{archetype}`) typically benefits from:

{if seo_hints.schema_org}- **Schema.org:** {schema_org.join(", ")}{/if}
{if seo_hints.meta_priorities}- **Meta priorities:** {meta_priorities.join(", ")}{/if}

These are suggestions, not requirements. Apply where appropriate for the page content.

---
```

---

## HTML Output

When scaffolding HTML, include CVD data attribute:

```html
<html data-theme="luminarum" data-mode="dark" data-cvd="none">
```

### CSS Structure for CVD

```css
:root {
  --color-danger: var(--danger-base);
  --color-success: var(--success-base);
}

[data-cvd="deuteranopia"] {
  --color-danger: var(--danger-deuteranopia, var(--danger-base));
  --color-success: var(--success-deuteranopia, var(--success-base));
}

[data-cvd="protanopia"] {
  --color-danger: var(--danger-protanopia, var(--danger-base));
  --color-success: var(--success-protanopia, var(--success-base));
}
```

Graceful fallback: if theme doesn't provide a CVD variant token, it falls back to base.

---

## Implementation Scope

### In Scope

1. **essence-spec package**
   - Add `Accessibility` type definition
   - Add `accessibility` field to SimpleEssence and SectionedEssence
   - Update JSON schema (essence.v2.json or new v3)
   - Add validation for accessibility fields

2. **registry package**
   - Add `cvd_support` and `tokens.cvd` to theme type
   - Add `seo_hints` to archetype type
   - Update theme resolver to handle CVD token merging

3. **core package**
   - Update IR types to include accessibility context
   - Pass accessibility info through pipeline for DECANTR.md generation

4. **cli package**
   - Update DECANTR.md generation to include Accessibility and SEO sections
   - Update HTML scaffolding to include `data-cvd` attribute

5. **Guard system**
   - Add accessibility guard rule (Rule 6)
   - Implement checks for heading hierarchy, alt text, focus styles, keyboard accessibility

6. **Content updates**
   - Update at least one theme (luminarum or auradecantism) with CVD variants as reference implementation
   - Update at least one archetype with SEO hints as reference

### Out of Scope

- Automatic CVD token generation (themes must provide their own variants)
- Runtime CVD detection patterns (this is user code, not Decantr's job)
- SEO validation or enforcement
- Screen reader testing integration
- WCAG AAA automated checking (too complex for static analysis)

---

## Migration

### Backward Compatibility

All changes are additive and optional:
- Existing essence files work unchanged
- Existing themes work unchanged (no CVD support = no CVD features)
- Existing archetypes work unchanged (no SEO hints = no SEO section in DECANTR.md)

### Schema Version

This can be added to v2 schema as optional fields without requiring v3. However, if other breaking changes are planned (terminology normalization), bundle with v3.

---

## Testing

### Unit Tests

- Accessibility field validation (valid/invalid values)
- CVD token merging (base + override = correct output)
- DECANTR.md generation with/without accessibility section
- Guard rule 6 detection of violations

### Integration Tests

- Full pipeline: essence with accessibility → resolved IR → generated DECANTR.md
- Theme with CVD support → correct CSS output with fallbacks

### Manual Testing

- Scaffold a project with `wcag_level: "AA"` and verify LLM generates accessible code
- Scaffold with CVD-supporting theme and verify toggle works

---

## Design Decisions

1. **Guard strictness for accessibility** — Accessibility guard runs in both guided and strict modes (same as style/structure guards).

2. **Default wcag_level** — Defaults to `"none"` (opt-in). Projects that don't specify accessibility requirements work unchanged.

3. **CVD pattern** — Out of scope for v1. Decantr documents the `data-cvd` attribute pattern; users implement their own toggle UI.

---

## Summary

| Layer | What It Does |
|-------|--------------|
| **Essence** | Declares accessibility intent (`wcag_level`, `cvd_preference`) |
| **Theme** | Declares CVD capability (`cvd_support`, `tokens.cvd.*`) |
| **Archetype** | Suggests SEO hints (`seo_hints`) |
| **Guard** | Enforces WCAG level (Rule 6) |
| **DECANTR.md** | Renders combined context for LLM |
| **HTML/CSS** | Implements `data-cvd` attribute with fallback tokens |

The LLM already knows WCAG rules and SEO best practices. We're just giving it project-level context so it applies that knowledge consistently.
