# Section: auth-full

**Role:** gateway | **Shell:** centered | **Archetype:** auth-full
**Description:** Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
**Shell structure:** Centered card on a background. Used for auth flows (login, register, forgot password) across all archetypes.
**Regions:** body

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme tokens:** see `src/styles/tokens.css` — use `var(--d-primary)`, `var(--d-bg)`, etc.

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:** carbon-card, carbon-code, carbon-glass, carbon-input, carbon-canvas, carbon-divider, carbon-skeleton, carbon-bubble-ai, carbon-fade-slide, carbon-bubble-user

---

**Zone:** Gateway (gateway) — centered shell
Auth success → enters App zone. Sign out returns here.
For full app topology, see `.decantr/context/scaffold.md`

## Features

auth, mfa, oauth, email-verification, password-reset

---

**Personality:** See scaffold.md for personality and visual direction.

## Pattern Reference

### form



**Components:** Input, Textarea, Button, Label

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button

---

## Pages

### login (/login)

Layout: form

### register (/register)

Layout: form

### forgot-password (/forgot-password)

Layout: form

### reset-password (/reset-password)

Layout: form

### verify-email (/verify-email)

Layout: form

### mfa-setup (/auth-full/mfa-setup)

Layout: form

### mfa-verify (/auth-full/mfa-verify)

Layout: form

### phone-verify (/auth-full/phone-verify)

Layout: form
