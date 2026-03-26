---
type: enrich
name: tailwind-spatial-audit
---

You are running in fully autonomous mode on the Decantr monorepo at /Users/davidaimi/projects/decantr-new.
Do NOT use EnterPlanMode or AskUserQuestion tools. Do NOT add Co-Authored-By lines to commits.
Make reasonable decisions and document them in code comments prefixed with // AUTO:

## Monorepo Structure
- packages/essence-spec/ — Essence v2 types, validator, density, guard
- packages/registry/ — Content resolver, pattern presets, wiring rules
- packages/generator-core/ — IR types, tree builder, resolution, pipeline
- packages/generator-decantr/ — Decantr-native code emitter
- packages/generator-react/ — React + Tailwind + shadcn/ui emitter
- packages/cli/ — CLI commands (validate, generate, init, registry)
- packages/mcp-server/ — MCP server for AI tools
- content/ — Registry content (patterns/, archetypes/, recipes/, core/)
- examples/ — Example essence files

## Workflow
1. Read relevant source files to understand current state
2. Implement the task
3. Write or update tests
4. Run tests: cd /Users/davidaimi/projects/decantr-new && pnpm test
5. Fix any failures
6. Commit with descriptive message

## Task: Audit and Complete ATOM_TO_TAILWIND Mapping

Audit the Decantr-to-Tailwind atom mapping in the React generator and ensure complete coverage.

### Step 1: Read current state

Read `packages/generator-react/src/tailwind.ts` thoroughly. Document every atom currently mapped and identify gaps.

### Step 2: Ensure complete coverage for all categories

The ATOM_TO_TAILWIND map (or equivalent function) must handle these atom categories:

#### Layout
- `_flex` → `flex`
- `_grid` → `grid`
- `_row` → `flex-row`
- `_col` → `flex-col`
- `_wrap` → `flex-wrap`
- `_nowrap` → `flex-nowrap`
- `_inline` → `inline`
- `_block` → `block`
- `_hidden` → `hidden`
- `_relative` → `relative`
- `_absolute` → `absolute`
- `_fixed` → `fixed`
- `_sticky` → `sticky`
- `_inset0` → `inset-0`

#### Flex alignment
- `_items[center]` → `items-center`, `_items[start]` → `items-start`, `_items[end]` → `items-end`, `_items[stretch]` → `items-stretch`, `_items[baseline]` → `items-baseline`
- `_justify[center]` → `justify-center`, `_justify[between]` → `justify-between`, `_justify[start]` → `justify-start`, `_justify[end]` → `justify-end`, `_justify[around]` → `justify-around`, `_justify[evenly]` → `justify-evenly`
- `_self[center]` → `self-center`, `_self[start]` → `self-start`, `_self[end]` → `self-end`, `_self[stretch]` → `self-stretch`
- `_flex1` → `flex-1`, `_flexnone` → `flex-none`, `_flexauto` → `flex-auto`

#### Grid columns
- `_gc1` through `_gc12` → `grid-cols-1` through `grid-cols-12`
- `_span1` through `_span12` → `col-span-1` through `col-span-12`
- `_gr1` through `_gr6` → `grid-rows-1` through `grid-rows-6`
- `_rspan1` through `_rspan6` → `row-span-1` through `row-span-6`

#### Spacing (gap, padding, margin)
- `_gap1` through `_gap12` → `gap-1` through `gap-12` (also `_gap0` → `gap-0`)
- `_gapx1` through `_gapx12` → `gap-x-1` through `gap-x-12`
- `_gapy1` through `_gapy12` → `gap-y-1` through `gap-y-12`
- `_p0` through `_p12` → `p-0` through `p-12`
- `_px0` through `_px12` → `px-0` through `px-12`
- `_py0` through `_py12` → `py-0` through `py-12`
- `_pt0` through `_pt12` → `pt-0` through `pt-12` (same for pb, pl, pr)
- `_m0` through `_m12` → `m-0` through `m-12`
- `_mx0` through `_mx12` → `mx-0` through `mx-12` (same for my, mt, mb, ml, mr)
- `_mxauto` → `mx-auto`

#### Sizing
- `_w[100%]` → `w-full`, `_w[auto]` → `w-auto`, `_w[50%]` → `w-1/2`
- `_h[100%]` → `h-full`, `_h[auto]` → `h-auto`, `_h[100vh]` → `h-screen`
- `_minH[0]` → `min-h-0`, `_minH[100vh]` → `min-h-screen`
- `_maxW[sm]` through `_maxW[7xl]` → `max-w-sm` through `max-w-7xl`

#### Typography
- `_text[center]` → `text-center`, `_text[left]` → `text-left`, `_text[right]` → `text-right`
- `_text[xs]` through `_text[9xl]` → `text-xs` through `text-9xl`
- `_font[bold]` → `font-bold`, `_font[semibold]` → `font-semibold`, `_font[medium]` → `font-medium`, `_font[normal]` → `font-normal`, `_font[light]` → `font-light`
- `_leading[tight]` → `leading-tight`, `_leading[normal]` → `leading-normal`, `_leading[relaxed]` → `leading-relaxed`
- `_tracking[tight]` → `tracking-tight`, `_tracking[wide]` → `tracking-wide`
- `_truncate` → `truncate`
- `_uppercase` → `uppercase`, `_lowercase` → `lowercase`, `_capitalize` → `capitalize`

#### Colors (semantic Decantr → Tailwind)
- `_fgprimary` → `text-primary`
- `_fgsecondary` → `text-secondary`
- `_fgmuted` → `text-muted-foreground`
- `_fgaccent` → `text-accent-foreground`
- `_fgdestructive` → `text-destructive`
- `_bgprimary` → `bg-primary`
- `_bgsecondary` → `bg-secondary`
- `_bgmuted` → `bg-muted`
- `_bgaccent` → `bg-accent`
- `_bgcard` → `bg-card`
- `_bgbackground` → `bg-background`
- `_bcborder` → `border-border`
- `_bcprimary` → `border-primary`
- Opacity modifiers: `_bgprimary/50` → `bg-primary/50`

#### Borders
- `_border` → `border`
- `_bbsolid` → `border-b`
- `_btsolid` → `border-t`
- `_rounded` → `rounded-md` (default)
- `_rounded[sm]` → `rounded-sm`, `_rounded[lg]` → `rounded-lg`, `_rounded[full]` → `rounded-full`, `_rounded[none]` → `rounded-none`

#### Effects
- `_shadow` → `shadow`, `_shadow[sm]` → `shadow-sm`, `_shadow[lg]` → `shadow-lg`, `_shadow[none]` → `shadow-none`
- `_overflow[auto]` → `overflow-auto`, `_overflow[hidden]` → `overflow-hidden`, `_overflow[scroll]` → `overflow-scroll`
- `_opacity[50]` → `opacity-50` (and other values)

#### Responsive prefixes
- `_sm:` → `sm:`, `_md:` → `md:`, `_lg:` → `lg:`, `_xl:` → `xl:`, `_2xl:` → `2xl:`
- These should work as prefixes on any atom: `_lg:gc2` → `lg:grid-cols-2`

#### Arbitrary values
- `_bg[#hex]` → `bg-[#hex]`
- `_w[calc(...)]` → `w-[calc(...)]`
- `_p[clamp(...)]` → `p-[clamp(...)]`
- `_trans[color_0.15s_ease]` → `transition-[color_0.15s_ease]` (or appropriate Tailwind transition)

### Step 3: Implement as map or function

If it's a static map, add all entries. If it's a function with pattern matching, ensure the patterns cover all cases above. Consider a hybrid: static map for known atoms + regex patterns for arbitrary values and responsive prefixes.

### Step 4: Write comprehensive tests

Create tests organized by category:
- Layout atoms test
- Flex alignment test
- Grid columns test (gc1-gc12, span1-span12)
- Spacing test (all gap, padding, margin values)
- Typography test
- Color test (semantic + opacity modifiers)
- Border test
- Effect test
- Responsive prefix test
- Arbitrary value test

Each test should verify the exact Tailwind output for a given Decantr atom input.

### Acceptance Criteria
- [ ] All atom categories covered in ATOM_TO_TAILWIND
- [ ] Gap values 0-12 all mapped
- [ ] Padding values 0-12 (p, px, py, pt, pb, pl, pr) all mapped
- [ ] Margin values 0-12 all mapped
- [ ] Grid columns 1-12 + spans mapped
- [ ] Semantic colors mapped to Tailwind CSS variable colors
- [ ] Opacity modifiers work (_bgprimary/50)
- [ ] Responsive prefixes work (_lg:gc2 → lg:grid-cols-2)
- [ ] Arbitrary values pass through correctly
- [ ] Tests for every category
- [ ] All existing tests still pass
