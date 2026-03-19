# Pattern Quality Standards

Production-ready patterns must meet these standards. Every scaffold should pass visual inspection on first generation.

## Universal Rules

1. **One Elevation Rule**: Each element gets exactly ONE depth treatment (shadow OR glass OR glow, never combinations)
2. **No Cardception**: Never wrap a self-contained pattern (kanban, inbox, timeline, kpi-grid) in a Card. Patterns with `contained: false` are standalone.
3. **Badge over DIV**: Use Badge for status indicators, not hand-rolled colored dots/spans
4. **Chip over Badge**: Use Chip for interactive labels/filters/categories, Badge for static status/counts
5. **Subtle by Default**: Badge uses subtle tokens. Use `solid` only when saturated color is intentionally needed (e.g., critical alerts)
6. **Icon Existence**: Every `icon('...')` call must reference a registered icon in `src/icons/essential.js`
7. **Atom Validity**: Every `_atom` must resolve via `resolveAtomDecl()` — no invented atom names

## Containment Decision Tree

```
Is it a toolbar/filter row?         → No card. (layout: "row")
Is it a self-contained widget?      → No card. (kanban, inbox, timeline)
Does the component already have     → No card. (kpi-grid = grid of Statistic cards)
  a visual frame?
Is it raw data needing a header     → Card. (data-table, activity-feed)
  + visual boundary?
```

## Per-Pattern Standards

### KPI Grid
- Each Statistic in its own Card — the grid itself is NOT in a card
- No `d-glass aura-glow` stacking on Statistics
- Trend indicators use Statistic's built-in `trend` prop, not custom Badge/Chip

### Data Table
- Always wrapped in Card with Card.Header for title
- Filter bar above the table is NOT in its own card
- Column render functions must return DOM nodes or strings, never raw objects

### Kanban Board
- Standalone layout (contained: false)
- Each column has a header with title + count Badge
- Cards within columns use Card component with hover effect

### Inbox
- Split-pane layout (contained: false)
- Message list has clear read/unread visual distinction
- Preview panel has action buttons (reply, archive, trash)

### Filter Bar
- Horizontal row layout (contained: false, layout: "row")
- Never wrapped in a Card
- Active filters shown as removable Chips

### Changelog
- Timeline layout (contained: false)
- Version entries use Badge for version number
- Change types use Chip with semantic variants (success=added, info=fixed, warning=changed, error=removed)

### Status Board
- Grid of status cards (contained: false)
- Status dots use semantic colors, not custom hex values
- Overall health summary in a Badge

## Anti-Patterns

| Anti-Pattern | Correct Approach |
|-------------|-----------------|
| `Card(Card(...))` | Remove inner Card OR outer Card |
| `d-glass aura-glow` on same element | Use one: glass OR glow |
| `div({ style: 'background: green' })` for status | `Badge({ variant: 'success' })` |
| `icon('refresh-cw')` (nonexistent) | Check icon registry first |
| `_bgborder` (invalid atom) | `_bcborder` (border-color) |
| 7+ Cards on a single page | Review pattern containment |
