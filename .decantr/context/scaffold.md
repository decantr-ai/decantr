# Scaffold: custom

**Blueprint:** custom
**Theme:** existing
**Personality:** observed brownfield product
**Guard mode:** creative (no enforcement during initial scaffolding)

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** custom

### Zones

**App** — observed-existing-shell shell
  Archetypes: custom
  Purpose: custom primary section

### Default Entry Points

  Anonymous users enter: gateway
  Authenticated users enter: primary zone
  Auth redirect target: primary zone


## Sections Overview

| Section | Role | Shell | Pages | Features |
|---------|------|-------|-------|----------|
| custom | primary | observed-existing-shell | observed-app | none |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | custom | observed-app |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-custom.md
