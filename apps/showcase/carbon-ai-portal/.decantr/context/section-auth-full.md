# Section: auth-full

**Role:** gateway | **Shell:** centered | **Archetype:** auth-full
**Description:** Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
**Shell structure:** Centered card on a background. Used for auth flows (login, register, forgot password) across all archetypes.
**Regions:** body

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme tokens:** see `src/styles/tokens.css` — use `var(--d-primary)`, `var(--d-bg)`, etc.

**Decorators:** `carbon-card`, `carbon-code`, `carbon-glass`, `carbon-input`, `carbon-canvas`, `carbon-divider`, `carbon-skeleton`, `carbon-bubble-ai`, `carbon-fade-slide`, `carbon-bubble-user` (see `src/styles/decorators.css`)
Usage: `className={css('_flex _col') + ' carbon-card'}` — atoms via css(), decorators as plain class strings.

---

**Zone:** Gateway (gateway) — centered shell
Auth success → enters App zone. Sign out returns here.
For full app topology, see `.decantr/context/scaffold.md`

## Features

auth, mfa, oauth, email-verification, password-reset

---

**Personality:** Production-ready AI chatbot with refined glassmorphic depth.... (full details in scaffold.md)

## Pages

### login (/login)

Layout: form

#### Pattern: form



**Components:** Input, Textarea, Button, Label

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button

### register (/register)

Layout: form

#### Pattern: form



**Components:** Input, Textarea, Button, Label

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button

### forgot-password (/forgot-password)

Layout: form

#### Pattern: form



**Components:** Input, Textarea, Button, Label

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button

### reset-password (/reset-password)

Layout: form

#### Pattern: form



**Components:** Input, Textarea, Button, Label

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button

### verify-email (/verify-email)

Layout: form

#### Pattern: form



**Components:** Input, Textarea, Button, Label

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button

### mfa-setup (/mfa-setup)

Layout: form

#### Pattern: form



**Components:** Input, Textarea, Button, Label

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button

### mfa-verify (/mfa-verify)

Layout: form

#### Pattern: form



**Components:** Input, Textarea, Button, Label

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button

### phone-verify (/phone-verify)

Layout: form

#### Pattern: form



**Components:** Input, Textarea, Button, Label

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button
