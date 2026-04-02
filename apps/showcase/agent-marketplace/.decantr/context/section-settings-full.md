# Section: settings-full

**Role:** auxiliary | **Shell:** chat-portal | **Archetype:** settings-full
**Description:** Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
**Shell structure:** AI chatbot layout with collapsible conversation sidebar and anchored input. Used by ai-chatbot archetype for chat-first applications.
**Regions:** header, nav, body

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme tokens:** see `src/styles/tokens.css` — use `var(--d-primary)`, `var(--d-bg)`, etc.

**Decorators:** `carbon-card`, `carbon-code`, `carbon-glass`, `carbon-input`, `carbon-canvas`, `carbon-divider`, `carbon-skeleton`, `carbon-bubble-ai`, `carbon-fade-slide`, `carbon-bubble-user` (see `src/styles/decorators.css`)
Usage: `className={css('_flex _col') + ' carbon-card'}` — atoms via css(), decorators as plain class strings.

---

**Zone:** App (auxiliary) — chat-portal shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

---

**Personality:** See scaffold.md for personality and visual direction.

## Pattern Reference

### settings



**Components:** Card, Toggle, Input, Button

**Layout slots:**
- `sections`: Settings sections (label, description, input/toggle)

### security-settings



**Components:** Card, Toggle, Input, Button

**Layout slots:**
- `sections`: Security sections (password change, MFA toggle, session list)

### sessions



**Components:** 

**Layout slots:**
- `list`: Active sessions list (device, location, last active, revoke button)

---

## Pages

### profile (/settings/profile)

Layout: settings

### security (/settings/security)

Layout: security-settings → sessions

### preferences (/settings/preferences)

Layout: settings

### danger (/settings/account)

Layout: settings
