# Scaffold: patient-dashboard

**Blueprint:** health-wellness-portal
**Theme:** healthcare
**Personality:** Calming, trust-building health portal with emphasis on clarity and accessibility. Soft blues and teals on warm white backgrounds. Large, readable typography — nothing small or dense. Vitals use color-coded status indicators always supplemented with text labels. Appointment booking is straightforward. Telehealth rooms are calm and functional. Document vault feels secure. Every interaction prioritizes patient confidence. Lucide icons. WCAG AAA compliance throughout.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Caring, clear, and professional. Speaks to patients.
**CTA verbs:** Book, View, Download, Upload, Connect, Schedule
**Avoid:** Submit, Click here, Please enter, Buy now, Urgent
**Empty states:** Reassuring and clear. No appointments? Show a friendly prompt to schedule one. No records? Explain the intake process warmly.
**Errors:** Gentle and supportive. Never alarming. Always offer a way to contact support. Never use medical jargon in errors.
**Loading states:** Calm skeleton placeholders with soft rounded shapes. Vitals cards show gentle pulse animations. Progressive content reveal.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** patient-dashboard + appointment-center + telehealth-room + health-records + marketing-health + auth-full + settings-full

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-health
  Purpose: Public marketing landing page for a health and wellness portal. Split hero, feature highlights, patient testimonials, and call-to-action sections.
  Features: marketing, seo

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — sidebar-main shell
  Archetypes: patient-dashboard
  Purpose: Patient overview dashboard with appointments, vitals tracking, and medication management. Central hub for health and wellness portal users.
  Features: vitals, medications, appointments, health-records

**App (auxiliary)** — sidebar-main shell
  Archetypes: appointment-center, telehealth-room, health-records, settings-full
  Purpose: Appointment management hub with list view, booking flow, and appointment details with telehealth join capability. Video consultation room for telehealth appointments with speaker-focused layout, session controls, and provider notes. Health records vault for browsing, viewing, and managing patient documents including lab results, imaging, and intake forms. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: appointments, booking, telehealth, video, notes, records, documents, intake-forms, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

### Zone Transitions

  Public → Gateway: conversion (authentication)
  Gateway → App: gate-pass (authentication)
  App → Gateway: gate-return (authentication)
  App → Public: navigation (external)

### Default Entry Points

  Anonymous users enter: public zone
  Authenticated users enter: primary zone
  Auth redirect target: primary zone


## Sections Overview

| Section | Role | Shell | Pages | Features |
|---------|------|-------|-------|----------|
| patient-dashboard | primary | sidebar-main | overview, vitals, medications | vitals, medications, appointments, health-records |
| appointment-center | auxiliary | sidebar-main | appointments, book, appointment-detail | appointments, booking, telehealth |
| telehealth-room | auxiliary | minimal-header | session | telehealth, video, notes |
| health-records | auxiliary | sidebar-main | records, record-detail, intake | records, documents, intake-forms |
| marketing-health | public | top-nav-footer | home | marketing, seo |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | sidebar-main | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-health | home |
| /login | auth-full | login |
| /intake | health-records | intake |
| /vitals | patient-dashboard | vitals |
| /records | health-records | records |
| /register | auth-full | register |
| /dashboard | patient-dashboard | overview |
| /mfa-setup | auth-full | mfa-setup |
| /mfa-verify | auth-full | mfa-verify |
| /telehealth | telehealth-room | session |
| /medications | patient-dashboard | medications |
| /records/:id | health-records | record-detail |
| /appointments | appointment-center | appointments |
| /phone-verify | auth-full | phone-verify |
| /verify-email | auth-full | verify-email |
| /reset-password | auth-full | reset-password |
| /forgot-password | auth-full | forgot-password |
| /settings/danger | settings-full | danger |
| /appointments/:id | appointment-center | appointment-detail |
| /settings/profile | settings-full | profile |
| /appointments/book | appointment-center | book |
| /settings/security | settings-full | security |
| /settings/preferences | settings-full | preferences |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-patient-dashboard.md
- .decantr/context/section-appointment-center.md
- .decantr/context/section-telehealth-room.md
- .decantr/context/section-health-records.md
- .decantr/context/section-marketing-health.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| calendar-view | patient-dashboard/overview, patient-dashboard/medications |
| data-table | patient-dashboard/vitals, patient-dashboard/medications, appointment-center/appointments |
| detail-header | appointment-center/appointment-detail, health-records/record-detail |
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** Organization, MedicalOrganization, WebApplication
**Meta priorities:** description, og:image, twitter:card

## Navigation

- Command palette: enabled
- Hotkeys: 3 configured
