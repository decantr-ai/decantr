# The Decantation Process

The Decantation Process is how Decantr transforms natural language descriptions into production applications. It's a structured conversation between you and AI that ensures consistent, high-quality output.

```
POUR → TASTE → SETTLE → CLARIFY → DECANT → SERVE → AGE
```

---

## Stage 1: POUR

**Who:** You
**What:** Express your intent in natural language

This is where you describe what you want to build. Be as specific or general as you like — the AI will ask clarifying questions.

**Example prompts:**

> "Build me a SaaS dashboard with analytics, user management, and settings pages."

> "I need an ecommerce admin panel for managing products, orders, and inventory."

> "Create a portfolio site with a dark, minimal aesthetic."

**Tips:**
- Mention the domain (dashboard, ecommerce, portfolio)
- Include key pages or features you need
- Describe the vibe or aesthetic if you have preferences

---

## Stage 1.5: TASTE

**Who:** AI
**What:** Interpret your intent into a structured Impression

The AI analyzes your description and creates an Impression — a structured interpretation of:

- **Vibe** — Personality traits (professional, playful, minimal)
- **References** — Similar products or aesthetics mentioned
- **Density intent** — How much content per screen (spacious, comfortable, dense)
- **Layout intent** — Primary navigation pattern (sidebar, top-nav, full-bleed)
- **Novel elements** — Unique features that don't fit standard patterns

The AI may ask questions to clarify ambiguous points before proceeding.

---

## Stage 2: SETTLE

**Who:** AI (with your input)
**What:** Decompose into five layers

The AI breaks down the Impression into Decantr's five architectural layers:

### Terroir (Domain Archetype)

What kind of application is this? The archetype provides default patterns and page structures.

Examples: `saas-dashboard`, `ecommerce`, `portfolio`, `documentation`

### Vintage (Visual Identity)

The style, color mode, and recipe that define the look:

```json
{
  "style": "auradecantism",
  "mode": "dark",
  "recipe": "auradecantism",
  "shape": "rounded"
}
```

### Character (Brand Personality)

Traits that influence spacing, animations, and tone:

```json
["professional", "data-rich"]
```

### Structure (Page Map)

The pages/views with their layouts and pattern compositions:

```json
[
  { "id": "overview", "skeleton": "sidebar-main", "blend": ["kpi-grid", "data-table"] },
  { "id": "settings", "skeleton": "sidebar-main", "blend": ["form-sections"] }
]
```

### Tannins (Functional Systems)

Integrated capabilities like auth, search, payments:

```json
["auth", "realtime-data"]
```

---

## Stage 3: CLARIFY

**Who:** AI + You
**What:** Write the Essence file and confirm

The AI writes `decantr.essence.json` based on the SETTLE decomposition. This is a checkpoint — you review and approve before code generation begins.

**What to check:**
- Are all your pages represented?
- Does the vintage match your aesthetic preferences?
- Are the tannins (features) correct?

If something's wrong, now is the time to adjust. Changes are easy at this stage; they require refactoring after code exists.

---

## Stage 4: DECANT

**Who:** AI
**What:** Resolve each page's Blend

For each page in the structure, the AI determines the spatial arrangement of patterns:

### Blend Format

Blends are ordered arrays of rows:

```json
"blend": [
  "kpi-grid",                                    // Full-width pattern
  { "cols": ["chart-a", "chart-b"], "at": "lg" }, // Side-by-side, stacks on mobile
  "data-table"                                   // Full-width pattern
]
```

### Pattern Presets

Patterns can have presets — structural variants:

```json
{ "pattern": "hero", "preset": "image-overlay", "as": "main-hero" }
```

### Clarity Profile

Character traits map to spacing rules. The AI derives appropriate gaps (`_gap4`, `_gap6`, etc.) from the clarity profile.

---

## Stage 5: SERVE

**Who:** AI
**What:** Generate code from Blend specs

The AI generates actual code:

1. Creates page containers with correct layout atoms
2. Resolves patterns to full components
3. Wraps patterns in Cards where appropriate
4. Applies recipe decorations (backgrounds, effects)
5. Wires cross-pattern signals (e.g., filter-bar → data-table)

**Output:** Working JavaScript files in `src/pages/` using Decantr's component library.

---

## Ongoing: AGE

**Who:** AI + You
**What:** Guard against drift

After initial generation, every code change goes through Cork rules:

1. **Style** — Don't switch styles without updating the Essence
2. **Structure** — New pages must be added to the Essence first
3. **Layout** — Follow the page's Blend, don't freestyle
4. **Composition** — Follow the recipe decorations
5. **Spacing** — Use Clarity-derived gaps, not arbitrary spacing

**Cork Modes:**
- **Creative** — Rules are advisory (initial scaffolding)
- **Guided** — Structure enforced, layout flexible
- **Maintenance** — All rules strictly enforced

---

## Quick Reference

| Stage | Actor | Output |
|-------|-------|--------|
| POUR | You | Natural language description |
| TASTE | AI | Structured Impression |
| SETTLE | AI | Five-layer decomposition |
| CLARIFY | AI + You | `decantr.essence.json` |
| DECANT | AI | Resolved Blends |
| SERVE | AI | Generated code |
| AGE | AI + You | Drift-free maintenance |

---

## Example Session

**You:** "Build me a gaming platform dashboard with guild management, leaderboards, and player profiles."

**AI (TASTE):** "I'm seeing a gaming/community vibe — dark mode, probably some accent glows. Should this feel competitive and data-heavy, or more casual and social?"

**You:** "Competitive. Lots of stats and rankings."

**AI (SETTLE):**
- Terroir: `gaming-platform` (if exists) or `saas-dashboard` with gaming character
- Vintage: `auradecantism`, dark, rounded
- Character: `competitive`, `data-rich`, `tactical`
- Structure: overview, guilds, leaderboards, profiles, settings
- Tannins: auth, realtime-data

**AI (CLARIFY):** *presents Essence file for approval*

**You:** "Looks good, let's build it."

**AI (DECANT + SERVE):** *generates code*
