# Prompt Templates

These templates help you communicate effectively with AI when building Decantr applications. Copy and adapt them for your projects.

---

## Starting a New Project

Use this when you're starting from scratch.

```
Build me a [type of application] with [key features].

Context:
- [Domain/industry if relevant]
- [Target users]
- [Any specific aesthetic preferences]

Key pages/features:
- [Page 1]: [what it should contain]
- [Page 2]: [what it should contain]
- [Page 3]: [what it should contain]

Technical requirements:
- [Auth needs: none/basic/enterprise]
- [Data: static/realtime]
- [Other integrations]
```

**Example:**

```
Build me a project management dashboard for a remote team.

Context:
- B2B SaaS product
- Target users: project managers and team leads
- Clean, professional aesthetic, not too flashy

Key pages/features:
- Dashboard: project overview cards, team activity feed, upcoming deadlines
- Projects: kanban board with task management
- Team: member list with availability status
- Reports: burndown charts, velocity metrics
- Settings: workspace config, integrations

Technical requirements:
- Enterprise auth with role-based access
- Realtime updates for task changes
- Slack integration for notifications
```

---

## Adding a New Page

Use this when adding to an existing project.

```
Add a [page name] page to the project.

Purpose: [what users will do on this page]

Content:
- [Section/pattern 1]
- [Section/pattern 2]
- [Section/pattern 3]

Layout: [sidebar-main / top-nav-main / full-bleed]

Notes:
- [Any specific requirements]
- [Reference to existing pages if styling should match]
```

**Example:**

```
Add an Analytics page to the project.

Purpose: Let users view performance metrics and trends

Content:
- Filter bar at top for date range and segment selection
- KPI cards row showing key metrics (users, revenue, conversion)
- Two charts side by side: line chart for trends, bar chart for comparison
- Data table below with exportable detailed metrics

Layout: sidebar-main (match existing pages)

Notes:
- Charts should use the same color scheme as the dashboard
- Filter bar should wire to both charts and table
- Include export to CSV button in table header
```

---

## Modifying a Page

Use this when changing existing pages.

```
Modify the [page name] page:

Current state: [brief description of what exists]

Changes needed:
1. [Change 1]
2. [Change 2]
3. [Change 3]

Keep unchanged:
- [Element to preserve]
- [Behavior to preserve]
```

**Example:**

```
Modify the Dashboard page:

Current state: Has KPI grid, activity feed, and quick actions

Changes needed:
1. Add a chart section between KPI grid and activity feed
2. Change activity feed from list to timeline format
3. Add a "Recent Projects" card grid at the bottom

Keep unchanged:
- KPI grid layout and metrics
- Quick actions panel position and styling
```

---

## Changing Styles

Use this for visual changes.

```
Change the visual style:

Current: [current style/mode]
Target: [desired style/mode]

Specific changes:
- [Color/theme change]
- [Shape preference]
- [Density preference]

Preserve:
- [Elements that shouldn't change]
```

**Example:**

```
Change the visual style:

Current: auradecantism dark mode
Target: clean light mode

Specific changes:
- Switch to light background
- Use sharp corners instead of rounded
- Increase spacing (more airy feel)

Preserve:
- Page structure and layout
- Component functionality
- Navigation patterns
```

---

## Debugging Issues

Use this when something isn't working.

```
Debug this issue:

What I expected: [expected behavior]
What happened: [actual behavior]

Steps to reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Relevant files:
- [file1.js]
- [file2.js]

Error messages (if any):
[paste error]
```

**Example:**

```
Debug this issue:

What I expected: Clicking a row in the data table should open a detail modal
What happened: Nothing happens when I click

Steps to reproduce:
1. Go to Users page
2. Click any row in the user table
3. Nothing happens (no modal, no console errors)

Relevant files:
- src/pages/users.js
- src/patterns/user-table.js

Error messages (if any):
None visible in console
```

---

## Adding a Component

Use this when you need a specific component.

```
Add a [component type] to [location]:

Purpose: [what it should do]

Configuration:
- [Prop 1]: [value]
- [Prop 2]: [value]
- [Variant]: [variant name]

Behavior:
- [Interaction 1]
- [Interaction 2]

Position: [where in the layout]
```

**Example:**

```
Add a command palette to the app shell:

Purpose: Quick navigation and actions via keyboard

Configuration:
- Trigger: Cmd+K
- Variant: full (with categories)
- Size: lg

Behavior:
- Typing filters commands and pages
- Enter executes selected command
- Escape closes palette
- Recent items shown by default

Position: Global (available on all pages via Shell.Header)
```

---

## Best Practices

### Be Specific About Context

Instead of: "Make it look better"
Say: "Use more whitespace between sections and add subtle shadows to cards"

### Reference the Essence

Instead of: "Add a page"
Say: "Add a page to the structure — the project uses sidebar-main layout"

### Mention Patterns by Name

Instead of: "Add some stats"
Say: "Add a kpi-grid pattern with 4 metrics"

### Include Constraints

Instead of: "Build a dashboard"
Say: "Build a dashboard that fits the existing auradecantism dark theme and uses the sidebar-main skeleton"

### Ask for Validation

After changes: "Validate the Essence file and check Cork rules"

---

## Quick Commands

These short prompts work well for common tasks:

| Task | Prompt |
|------|--------|
| List available patterns | "What patterns are available for [category]?" |
| Check component props | "Show me the [Component] props and variants" |
| Validate changes | "Validate the Essence file" |
| Check for drift | "Check these changes against Cork rules" |
| See page structure | "Show me the current structure in the Essence" |
| Preview a pattern | "Show me the code for [pattern] with [preset] preset" |
