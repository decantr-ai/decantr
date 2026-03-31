# DECANTR.md

This project uses **Decantr** for design intelligence. Read this file before generating any UI code.

---

## What is Decantr?

Decantr is a design intelligence layer that sits between you (the AI code generator) and the code you produce. It provides:

- **Structured schemas** -- The `decantr.essence.json` file is the source of truth for this project's design
- **Two-layer model** -- DNA (immutable axioms) and Blueprint (structural layout)
- **Drift prevention** -- Guard rules that validate your code against the spec
- **Design methodology** -- The 7-stage Design Pipeline

**Decantr does NOT generate code.** You generate the code. Decantr ensures it remains coherent and consistent.

---

## Two-Layer Model

### DNA (Design Axioms)

DNA defines the foundational design rules. **DNA violations are errors** -- they must never happen without updating the essence first.

DNA axioms include:
- Theme (style, mode, recipe, shape)
- Spacing (density, content gap, base unit)
- Typography (scale, weights)
- Color (palette, accent count, CVD preference)
- Radius (philosophy, base value)
- Elevation (system, max levels)
- Motion (preference, duration scale, reduce-motion)
- Accessibility (WCAG level, focus-visible, skip-nav)
- Personality traits

### Blueprint (Structural Layout)

Blueprint defines pages, shells, features, and pattern layouts. **Blueprint deviations are warnings** -- they should be corrected but do not block generation.

Blueprint includes:
- Default shell layout
- Page definitions with layouts
- Feature declarations
- Per-page DNA overrides (only density and mode)

---

## The Design Pipeline

Every design decision follows these seven stages:

| Stage | Name | What Happens |
|-------|------|--------------|
| 1 | **Intent** | User describes what they want to build |
| 2 | **Interpret** | Parse intent into structured form |
| 3 | **Decompose** | Split into theme, structure, features |
| 4 | **Specify** | Write `decantr.essence.json` |
| 5 | **Compose** | Resolve layouts from patterns and recipes |
| 6 | **Generate** | You generate code from the composition |
| 7 | **Guard** | Validate every change against the spec |

The essence file captures stages 1-5. Your code generation is stage 6. The guard rules enforce stage 7.

---

## Guard Rules

The guard system enforces rules at two levels:

### DNA Rules (Errors)

| # | Rule | What It Checks |
|---|------|----------------|
| 1 | **Style** | Code uses theme specified in DNA |
| 2 | **Recipe** | Decorations match DNA recipe |
| 3 | **Density** | Spacing follows DNA density profile |
| 4 | **Accessibility** | Code meets WCAG level from DNA |
| 5 | **Theme-mode** | Theme/mode combination is valid |

### Blueprint Rules (Warnings)

| # | Rule | What It Checks |
|---|------|----------------|
| 6 | **Structure** | Page exists in blueprint pages |
| 7 | **Layout** | Pattern order matches blueprint layout |
| 8 | **Pattern existence** | Patterns exist in the registry |

### Enforcement Tiers

| Tier | When Used | DNA Rules | Blueprint Rules |
|------|-----------|-----------|-----------------|
| **Creative** | New project scaffolding | Off | Off |
| **Guided** | Adding pages or features | Error | Off |
| **Strict** | Modifying existing code | Error | Warn |

This project uses **strict** mode.

### Violation Response Protocol

When a user request would violate guard rules:

```
1. STOP   -- Do not proceed with code that violates DNA rules
2. EXPLAIN -- Tell the user which rule would be violated and why
3. OFFER  -- Suggest using decantr_update_essence to update the spec
4. WAIT   -- Only proceed after the essence is updated
```

**Never make "just this once" exceptions.** If the user insists, update the essence first.

### MCP Tools for Drift Management

- `decantr_check_drift` -- Check if planned changes violate rules
- `decantr_accept_drift` -- Accept a detected drift as intentional (updates the essence)
- `decantr_update_essence` -- Update the essence spec to match desired changes

---

## This Project

**Archetype:** ai-chatbot
**Target:** react
**Theme:** carbon (dark mode)
**Guard Mode:** strict
**Pages:** chat, new, auth-full-login, auth-full-register, auth-full-forgot-password, auth-full-reset-password, auth-full-verify-email, auth-full-mfa-setup, auth-full-mfa-verify, auth-full-phone-verify, settings-full-profile, settings-full-security, settings-full-preferences, settings-full-danger, marketing-saas-home, about-hybrid-about, contact-contact, legal-privacy, legal-terms, legal-cookies

### Essence Overview

```json
{
  "theme": "carbon",
  "mode": "dark",
  "guard": "strict",
  "target": "react"
}
```

### Theme Quick Reference

**Seed Colors:**
- **accent:** `#6B8AAE`
- **primary:** `#7C93B0`
- **secondary:** `#A1A1AA`
- **background:** `#18181B`

**Key Decorators:**
- `carbon-card` — Surface background, subtle border, 8px radius, hover shadow transition.
- `carbon-code` — Monospace font, surface-raised background, subtle 3px left border accent in primary color.
- `carbon-glass` — Subtle surface elevation with 1px border, no blur. Uses surface background.
- `carbon-input` — Soft border with gentle focus ring using primary blue. Border transitions on focus.
- `carbon-canvas` — Background color using theme background token. Clean, minimal foundation.

**To fetch complete theme and recipe specs:**
```bash
npx @decantr/cli get theme carbon
npx @decantr/cli get recipe carbon
```





### Pages

| Page | Shell | Layout |
|------|-------|--------|
| chat | chat-portal | header, messages, input |
| new | chat-portal | empty-thread, input |
| auth-full-login | centered | form |
| auth-full-register | centered | form |
| auth-full-forgot-password | centered | form |
| auth-full-reset-password | centered | form |
| auth-full-verify-email | centered | form |
| auth-full-mfa-setup | centered | form |
| auth-full-mfa-verify | centered | form |
| auth-full-phone-verify | centered | form |
| settings-full-profile | inherit | settings |
| settings-full-security | inherit | security-settings, sessions |
| settings-full-preferences | inherit | settings |
| settings-full-danger | inherit | settings |
| marketing-saas-home | top-nav-footer | hero, features, how-it-works, pricing, testimonials, cta |
| about-hybrid-about | top-nav-footer | hero, story, team, values, cta |
| contact-contact | top-nav-footer | hero, form |
| legal-privacy | top-nav-footer | content |
| legal-terms | top-nav-footer | content |
| legal-cookies | top-nav-footer | content |

### Patterns in Use

- `header`
- `messages`
- `input`
- `empty-thread`
- `form`
- `settings`
- `security-settings`
- `sessions`
- `hero`
- `features`
- `how-it-works`
- `pricing`
- `testimonials`
- `cta`
- `story`
- `team`
- `values`
- `content`

---

## Before Writing Code

**Always check these before generating UI code:**

### Quick Commands

```bash
# Get full theme spec (colors, palette, modes)
npx @decantr/cli get theme carbon

# Get recipe decorators and effects
npx @decantr/cli get recipe carbon

# Get pattern structure and presets
npx @decantr/cli get pattern <pattern-name>

# Search for patterns
npx @decantr/cli search <query>

# Check for drift
npx @decantr/cli check
```

### With MCP Tools (If Available)

> Note: MCP tools require the `@decantr/mcp-server` to be configured. If these tools are not available, use the CLI commands above.

1. `decantr_read_essence` -- Load the current essence
2. `decantr_check_drift` -- Verify your planned changes won't violate rules
3. `decantr_resolve_pattern` -- Get pattern details before implementing
4. `decantr_suggest_patterns` -- Find appropriate patterns for new sections

### Without MCP Tools or CLI

1. Read `decantr.essence.json` in the project root
2. Check `dna.theme` for the active theme and mode
3. Check `blueprint.pages` for the page you're editing
4. Follow the page's `layout[]` for required pattern order
5. Use spacing tokens from `dna.spacing.content_gap`

### Checklist

Before writing any UI code:

- [ ] Is this page in the blueprint pages?
- [ ] Am I using the correct theme (carbon)?
- [ ] Am I following the correct mode (dark)?
- [ ] Does my pattern order match the layout spec?
- [ ] Am I using the correct spacing tokens?
- [ ] Does the code meet WCAG requirements from DNA?

If any answer is "no" -- **STOP and ask the user to update the essence.**

---

## After Writing Code

### Self-Check

After generating code, verify:

1. **Theme consistency** -- All colors, typography, and effects match the DNA theme
2. **Pattern structure** -- Components follow the blueprint layout spec
3. **Spacing consistency** -- Gap values use tokens, not arbitrary pixels
4. **Page declaration** -- The page exists in blueprint pages

### Drift Validation

Run validation to check for violations:

```bash
npx @decantr/cli check
```

Or use the MCP tool:

```
decantr_check_drift(page_id="{{page}}", theme_used="{{theme}}")
```

---

## Pattern Quality Rules

When implementing patterns, follow these rules:

### 1. One Elevation

Each pattern section should have a single visual elevation level. Don't nest cards within cards or create competing visual hierarchies.

### 2. Containment Decision

Decide upfront whether a pattern is:
- **Contained** -- Has visible boundaries (card, panel)
- **Inline** -- Flows with content, no boundaries

Don't mix containment within a pattern.

### 3. Component Consistency

Use the same component variants throughout a pattern. If buttons are `primary` style in one place, they should be `primary` everywhere in that pattern.

---

## CSS Implementation

This project uses **@decantr/css** for layout atoms and the generated CSS files for theme tokens and recipe decorators.

### Setup

```javascript
// 1. Import the atoms runtime
import { css } from '@decantr/css';

// 2. Import generated CSS files (created by decantr init)
import './styles/tokens.css';      // Theme tokens (--d-primary, --d-surface, etc.)
import './styles/decorators.css';  // Recipe decorators (carbon-card, etc.)
```

### HTML Setup

Your `index.html` MUST have theme and mode attributes:

```html
<!DOCTYPE html>
<html lang="en" data-theme="carbon" data-mode="dark">
  <head>
    <meta name="color-scheme" content="dark">
    ...
  </head>
</html>
```

### Using Atoms

The `css()` function processes atom strings and injects CSS at runtime:

```jsx
// Layout atoms
<div className={css('_flex _col _gap4 _p4')}>
  <h1 className={css('_heading1')}>Title</h1>
  <p className={css('_textsm _fgmuted')}>Description</p>
</div>

// Responsive prefixes (mobile-first)
<div className={css('_gc1 _sm:gc2 _lg:gc4')}>
  {/* 1 col -> 2 cols at 640px -> 4 cols at 1024px */}
</div>
```

### Common Atoms

| Category | Atoms | Description |
|----------|-------|-------------|
| Display | `_flex`, `_grid`, `_block`, `_none` | Display types |
| Flexbox | `_col`, `_row`, `_wrap`, `_flex1` | Flex direction/behavior |
| Alignment | `_aic`, `_jcc`, `_jcsb` | Align/justify content |
| Spacing | `_gap{n}`, `_p{n}`, `_m{n}`, `_px{n}` | Gap, padding, margin |
| Sizing | `_wfull`, `_hfull`, `_w{n}`, `_h{n}` | Width, height |
| Typography | `_textsm`, `_textlg`, `_heading1`-`_heading6` | Font sizes |
| Colors | `_bgprimary`, `_bgsurface`, `_fgmuted` | Background, foreground |

### CSS Architecture

The CSS is organized into two parts:

1. **Atoms (@decantr/css)** - Layout utilities injected at runtime into `@layer d.atoms`
2. **Generated CSS files** - Theme tokens and recipe decorators created during scaffold

```
src/styles/
  tokens.css      # :root { --d-primary: #...; --d-surface: #...; }
  decorators.css  # .carbon-card { ... }
```

### Variable Naming Convention

| Prefix | Purpose | Example |
|--------|---------|---------|
| `--d-` | Core Decantr tokens | `--d-primary`, `--d-bg` |
| `--d-gap-{n}` | Spacing tokens | `--d-gap-4`, `--d-gap-8` |
| `--d-radius` | Border radius | `--d-radius`, `--d-radius-lg` |

---

## Spatial Guidelines

### Personality to Density Mapping

| Personality | Suggested Density | Content Gap |
|-------------|-------------------|-------------|
| professional | comfortable | `_gap4` |
| playful | spacious | `_gap6` |
| premium | spacious | `_gap8` |
| minimal | compact | `_gap2` |
| bold | comfortable | `_gap4` |

This project uses: **professional** personality with **comfortable** density.

### Spacing Tokens

Use these tokens instead of arbitrary pixel values:

| Token | Value | Use Case |
|-------|-------|----------|
| `_gap1` | 4px | Tight spacing within components |
| `_gap2` | 8px | Compact layouts |
| `_gap3` | 12px | Default inline spacing |
| `_gap4` | 16px | Comfortable content gap |
| `_gap6` | 24px | Section spacing |
| `_gap8` | 32px | Major section breaks |
| `_gap12` | 48px | Page section spacing |

---

## Shells (Page Layouts)

A shell is the page-level layout container. This project uses **chat-portal** as the default shell.

### Available Shells

| Shell | Description | Use Case |
|-------|-------------|----------|
| `sidebar-main` | Collapsible sidebar + main content | Dashboards, admin panels |
| `top-nav-main` | Horizontal nav + full-width content | Marketing, content sites |
| `centered` | Centered card on background | Auth flows, focused tasks |
| `full-bleed` | No persistent nav, scroll-driven | Landing pages, portfolios |
| `minimal-header` | Slim header + centered content | Checkout, wizards |

### Shell Structure

```
Custom shell layout
```

---

## Essence Schema (v3)

```json
{
  "version": "3.0.0",
  "dna": {
    "theme": { "style": "...", "mode": "dark|light|auto", "recipe": "...", "shape": "..." },
    "spacing": { "density": "compact|comfortable|spacious", "content_gap": "_gap4" },
    "typography": { "scale": "modular", "heading_weight": 600 },
    "accessibility": { "wcag_level": "AA", "focus_visible": true },
    "personality": ["trait1", "trait2"]
  },
  "blueprint": {
    "shell": "shell-id",
    "pages": [
      { "id": "page-id", "layout": ["pattern-1", "pattern-2"] }
    ],
    "features": ["auth", "search"]
  },
  "meta": {
    "archetype": "dashboard",
    "target": "react",
    "guard": { "mode": "guided", "dna_enforcement": "error", "blueprint_enforcement": "off" }
  }
}
```

---

## Updating the Essence

When the user wants to change the design spec:

1. Read the current `decantr.essence.json`
2. Determine if the change affects DNA (axioms) or Blueprint (structure)
3. Make the requested changes
4. Validate with `npx @decantr/cli validate`
5. Write the updated file

Or use the MCP tools:

```
decantr_update_essence(operation="add_page", payload={...})
decantr_accept_drift(violation_id="...", reason="User requested change")
```

---

## Summary

1. **Read the essence** before generating code
2. **DNA violations are errors** -- never proceed without updating the essence
3. **Blueprint deviations are warnings** -- correct them when possible
4. **Use patterns** from the layout spec
5. **Follow the theme** exactly as specified in DNA
6. **Validate after** generating code with `decantr check`

The essence is the source of truth. When in doubt, consult it.

---

*Generated by Decantr CLI v1.0.0*
