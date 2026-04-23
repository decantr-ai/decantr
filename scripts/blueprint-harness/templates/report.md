# Blueprint Harness Report — `{{BLUEPRINT}}`

**Date:** {{DATE}}
**Workspace:** `{{WORKSPACE}}`
**Essence version:** `{{ESSENCE_VERSION}}` · **Packs:** {{PACK_COUNT}} · **Sections:** {{SECTION_COUNT}} · **Routes:** {{ROUTE_COUNT}}

**Personality:**
> {{PERSONALITY}}

**Scaffold state:**
- Sections: {{SECTIONS}}
- Routes: {{ROUTES}}
- Source files created: {{SRC_FILES}} ({{SRC_LINES}} lines)
- Inline styles (auto-counted): **{{INLINE_STYLES}}**

---

## Mobile smoke

Shots directory: `{{MOBILE_SHOTS_DIR}}`

| Route | Viewport | Ok | File |
|---|---|:-:|---|
{{MOBILE_TABLE}}

---

## Cold-subagent report (verbatim)

{{SUBAGENT_REPORT}}

---

## Operator synthesis

_(This section is for the harness operator to fill in after reviewing the subagent report + mobile shots. Typical subsections:)_

- **Executive verdict** — desktop quality %, mobile quality %, would-ship verdict
- **Cross-check against systemic patterns** (from the agent-marketplace baseline):
  1. Prose ≫ CSS (decorator hover/focus missing?)
  2. Boilerplate-heavy context (page-pack token efficiency?)
  3. Generator bugs (broken atom strings, empty table columns?)
  4. Silent defaults (HashRouter? OAuth icons? command palette?)
  5. Responsive partial (top-nav-footer drawer? swarm pattern reflow?)
- **New patterns** — anything NOT covered by the above
- **Gap classification** — route each finding to: content / cli / package / template / registry-ux
- **P0 / P1 / P2 action plan** — prioritized fix table
- **Comparison row** for the tracking table
