# Section: settings-full

**Role:** auxiliary | **Shell:** chat-portal | **Archetype:** settings-full
**Description:** Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme tokens:** see `src/styles/tokens.css` — use `var(--d-primary)`, `var(--d-bg)`, etc.

## Decorators (carbon recipe)

No decorators defined.

---

**Zone:** App (auxiliary) — chat-portal shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

---

## Personality

professional, minimal, developer-focused, polished

---

## Pages

### profile (/settings/profile)

Layout: settings

#### Pattern: settings



**Components:** 

**Layout slots:**
- `sections`: Settings sections (label, description, input/toggle)

### security (/settings/security)

Layout: security-settings → sessions

#### Pattern: security-settings



**Components:** 

**Layout slots:**
- `sections`: Security sections (password change, MFA toggle, session list)

#### Pattern: sessions



**Components:** 

**Layout slots:**
- `list`: Active sessions list (device, location, last active, revoke button)

### preferences (/settings/preferences)

Layout: settings

#### Pattern: settings



**Components:** 

**Layout slots:**
- `sections`: Settings sections (label, description, input/toggle)

### danger (/settings/account)

Layout: settings

#### Pattern: settings



**Components:** 

**Layout slots:**
- `sections`: Settings sections (label, description, input/toggle)
